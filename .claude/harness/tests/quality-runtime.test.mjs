import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { createQualityRuntime, runQualityProvider } from "../runtime/quality/quality-runtime.mjs";
import { configDigest } from "../runtime/quality/quality-protocol.mjs";
import { fileURLToPath } from "node:url";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "foundation-quality-runtime-"));
  mkdirSync(join(root, "openspec"), { recursive: true });
  mkdirSync(join(root, ".claude", "harness"), { recursive: true });
  writeFileSync(join(root, "openspec", "config.yaml"), "schema: spec-driven\n");
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { test: "node --test" } }));
  writeFileSync(join(root, "src.js"), "export function value() { return 1; }\n");
  const writes = [];
  const writeJson = (path, value) => {
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
    writes.push(path);
  };
  const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
  const repository = { id: "root", path: root, relativePath: "." };
  const git = (args, cwd = root) => spawnSync("git", args, { cwd, encoding: "utf8" });
  const logs = [];
  const fail = (message) => { throw new Error(message); };
  const runtime = createQualityRuntime({
    root,
    repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [{ ...repository, workspacePath: root }],
    canonicalChangedSurface: () => [{ repositoryId: "root", path: "src.js" }],
    declaredSurfaceMatcher: () => (path) => path === "src.js",
    loadRuntime: () => ({ id: "change" }),
    git,
    gitHead: () => "abc123",
    readJson,
    writeJson,
    pathInside: (parent, candidate) => {
      const value = relative(resolve(parent), resolve(candidate));
      return value === "" || (!value.startsWith("..") && !value.startsWith("/"));
    },
    fail,
    log: (value) => logs.push(value)
  });
  return { root, runtime, repository, git, writeJson, logs, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test("quality CLI preserves a large structured failure report through piped stdout", () => {
  const value = fixture();
  try {
    writeFileSync(join(value.root, ".claude", "harness", "foundation.mjs"), "// project marker\n");
    const report = {
      protocol: "foundation-crap-v1", repository: "root", repositoryCommit: null,
      language: "javascript",
      tool: { name: "fixture", version: "1", adapterVersion: "1", configDigest: configDigest({}) },
      functions: Array.from({ length: 1200 }, (_, index) => ({
        id: `function-${index}`, path: "src.js", line: index + 1, endLine: index + 1,
        complexity: 50, coverageKind: "branch", coveragePercent: 0, crap: 0, mapping: "exact"
      }))
    };
    const script = join(value.root, "provider.mjs");
    writeFileSync(script, `process.stdout.write(${JSON.stringify(JSON.stringify(report))});\n`);
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = {
      crap: { kind: "command", command: [process.execPath, script],
        protocol: "foundation-crap-v1", isolation: "read-only" }
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const child = spawnSync(process.execPath, [
      fileURLToPath(new URL("../foundation.mjs", import.meta.url)), "quality-run", "--enforce", "--full"
    ], { cwd: value.root, encoding: "utf8", timeout: 30000, maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, CLAUDE_FOUNDATION_PROJECT: value.root, FOUNDATION_TELEMETRY: "0",
        FOUNDATION_CHANGE_ID: "" } });
    assert.equal(child.status, 1, child.stderr);
    assert.match(child.stderr, /consumer quality gate fail/);
    assert.ok(Buffer.byteLength(child.stdout) > 65536);
    const summary = JSON.parse(child.stdout);
    assert.equal(summary.status, "fail");
    assert.equal(summary.lanes[0].result.functions.length, 1200);
  } finally { value.cleanup(); }
});

test("quality init previews before explicitly writing configuration", () => {
  const value = fixture();
  try {
    value.runtime.initialize();
    assert.throws(() => readFileSync(join(value.root, "quality", "foundation-quality.json")), /ENOENT/);
    value.runtime.initialize({ write: true });
    const config = JSON.parse(readFileSync(join(value.root, "quality", "foundation-quality.json"), "utf8"));
    assert.equal(config.policy.mode, "report");
    assert.deepEqual(config.repositories.map((row) => row.id), ["root"]);
  } finally { value.cleanup(); }
});

test("quality discovery prefers the active sandbox recorded in runtime state", () => {
  const value = fixture();
  const sandbox = mkdtempSync(join(tmpdir(), "foundation-quality-sandbox-"));
  try {
    writeFileSync(join(sandbox, "package.json"), JSON.stringify({
      scripts: { test: "node --test", typecheck: "tsc --noEmit" }
    }));
    writeFileSync(join(sandbox, "app.ts"), "export const value: number = 1;\n");
    const runtime = createQualityRuntime({
      root: value.root,
      repositoryCatalog: () => ({ repositories: [value.repository] }),
      // Simulate an accidentally stale selector result. Runtime state must win.
      selectedRepositories: () => [{ ...value.repository, workspacePath: value.root }],
      canonicalChangedSurface: () => [], declaredSurfaceMatcher: () => () => true,
      loadRuntime: () => ({
        id: "change", workspace: { mode: "worktree", path: sandbox },
        repositories: { root: { path: sandbox, targetPath: value.root } }
      }),
      git: value.git, gitHead: () => "abc123",
      readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
      writeJson: value.writeJson, pathInside: () => true,
      fail: (message) => { throw new Error(message); }, log: () => {}
    });
    const report = runtime.discovery({ change: "change" });
    assert.deepEqual(report.repositories[0].languages, ["javascript", "typescript"]);
    assert.equal(report.repositories[0].inventory.files, 2);
    assert.equal(report.repositories[0].capabilities["static-analysis"].status, "available");
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
    value.cleanup();
  }
});

test("discovered CRAP script survives init and produces a measured change lane", () => {
  const value = fixture();
  try {
    const report = {
      protocol: "foundation-crap-v1", repository: "root", repositoryCommit: null,
      workspaceDigest: `sha256:${"b".repeat(64)}`, language: "javascript",
      tool: { name: "consumer-fixture", version: "1", adapterVersion: "1",
        configDigest: configDigest({ fixture: true }) },
      functions: [{ id: "value", path: "src.js", line: 1, endLine: 1,
        complexity: 2, coverageKind: "branch", coveragePercent: 100,
        crap: 999, mapping: "exact" }]
    };
    writeFileSync(join(value.root, "provider.mjs"),
      `import { mkdirSync, writeFileSync } from "node:fs";\n` +
      `mkdirSync(".foundation/quality", { recursive: true });\n` +
      `writeFileSync(".foundation/quality/crap.json", ${JSON.stringify(JSON.stringify(report))});\n`);
    writeFileSync(join(value.root, "package.json"), JSON.stringify({ scripts: {
      test: "node --test", "quality:crap": "node provider.mjs"
    } }));
    value.runtime.initialize({ write: true });
    const config = JSON.parse(readFileSync(join(value.root, "quality", "foundation-quality.json"), "utf8"));
    assert.deepEqual(config.repositories[0].providers.crap.command,
      ["npm", "run", "quality:crap"]);
    const summary = value.runtime.run({ change: "change" });
    const crap = summary.lanes.find((lane) => lane.capability === "crap");
    assert.equal(crap.status, "pass");
    assert.equal(crap.result.functions[0].crap, 2);
    assert.equal(crap.evaluation.summary.pass, 1);
  } finally { value.cleanup(); }
});

test("quality init installs PR, nightly, and release CI templates without overwriting", () => {
  const value = fixture();
  try {
    value.runtime.initialize({ write: true, ci: "github" });
    for (const name of ["foundation-quality.yml", "foundation-quality-nightly.yml",
      "foundation-quality-release.yml"]) {
      const workflow = readFileSync(join(value.root, ".github", "workflows", name), "utf8");
      assert.match(workflow, /foundation-consumer-quality/);
    }
    assert.throws(() => value.runtime.initialize({ write: true, ci: "github", force: false }),
      /already exists/);
  } finally { value.cleanup(); }
});

test("quality doctor checks commands used to generate built-in adapter inputs", () => {
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = {
      crap: { kind: "builtin", adapter: "canonical-functions",
        command: ["definitely-missing-quality-tool"],
        inputs: { complexity: "complexity.json", coverage: "coverage.json" } }
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const report = value.runtime.doctor();
    assert.equal(report.status, "fail");
    assert.ok(report.issues.some((issue) => issue.code === "tool-unavailable"));
  } finally { value.cleanup(); }
});

test("custom CRAP provider is normalized and evaluated only on changed paths", () => {
  const value = fixture();
  try {
    const script = join(value.root, "provider.mjs");
    const report = {
      protocol: "foundation-crap-v1", repository: "root", repositoryCommit: "abc123",
      language: "javascript",
      tool: { name: "fixture", version: "1", adapterVersion: "1", configDigest: configDigest({}) },
      functions: [{ id: "value", path: "src.js", line: 1, endLine: 1,
        complexity: 2, coverageKind: "branch", coveragePercent: 100, crap: 999, mapping: "exact" }]
    };
    writeFileSync(script, `process.stdout.write(${JSON.stringify(JSON.stringify(report))});\n`);
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = {
      crap: { kind: "command", command: [process.execPath, script], protocol: "foundation-crap-v1", isolation: "read-only" }
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const summary = value.runtime.run({ change: "change" });
    assert.equal(summary.status, "pass");
    assert.deepEqual(summary.shard, { index: 0, count: 1 });
    assert.match(summary.lanes[0].result.workspaceDigest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(summary.lanes[0].result.functions[0].crap, 2);
    assert.equal(summary.lanes[0].evaluation.summary.pass, 1);
    assert.equal(value.runtime.baseline().length, 1);
    assert.throws(() => value.runtime.baseline({ write: true }), /requires --decision-ref and --reason/);
    value.runtime.baseline({ write: true, "decision-ref": "DEC-1", reason: "establish pilot baseline" });
    const manifest = JSON.parse(readFileSync(join(value.root, "quality", "baselines", "manifest.json"), "utf8"));
    assert.equal(manifest.entries[0].decisionRef, "DEC-1");
    assert.throws(() => value.runtime.run({ change: "change", "shard-index": "2",
      "shard-count": "2" }), /shard-index/);
  } finally { value.cleanup(); }
});

test("provider state restoration is enforced", () => {
  const value = fixture();
  try {
    const script = join(value.root, "noop.mjs");
    writeFileSync(script, "process.exit(0);\n");
    let calls = 0;
    const result = runQualityProvider({
      repository: value.repository,
      capability: "automated-mutation",
      provider: { kind: "command", command: [process.execPath, script], isolation: "tool" },
      git: () => ({ status: 0, stdout: calls++ ? " M src.js\0" : "" }),
      pathInside: () => true
    });
    assert.equal(result.status, "fail");
    assert.match(result.reason, /did not restore/);
  } finally { value.cleanup(); }
});

test("changed paths outside the declared surface fail the quality lane", () => {
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].providers = {};
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const outsideRuntime = createQualityRuntime({
      root: value.root,
      repositoryCatalog: () => ({ repositories: [value.repository] }),
      selectedRepositories: () => [{ ...value.repository, workspacePath: value.root }],
      canonicalChangedSurface: () => [{ repositoryId: "root", path: "outside.js" }],
      declaredSurfaceMatcher: () => () => false,
      loadRuntime: () => ({ id: "change" }), git: value.git, gitHead: () => "abc123",
      readJson: (path) => JSON.parse(readFileSync(path, "utf8")), writeJson: value.writeJson,
      pathInside: () => true, fail: (message) => { throw new Error(message); }, log: () => {}
    });
    const summary = outsideRuntime.run({ change: "change" });
    assert.equal(summary.status, "fail");
    assert.ok(summary.lanes.some((lane) => lane.capability === "scope" && lane.status === "fail"));
  } finally { value.cleanup(); }
});

test("multi-repository lanes keep identities and failures separate", () => {
  const value = fixture();
  const api = join(value.root, "api");
  mkdirSync(api, { recursive: true });
  writeFileSync(join(api, "go.mod"), "module example/api\n");
  try {
    const tool = { name: "fixture", version: "1", adapterVersion: "1", configDigest: configDigest({ multi: true }) };
    const provider = (repository, path, complexity) => {
      const script = join(repository, "provider.mjs");
      const report = { protocol: "foundation-crap-v1", repository: repository === api ? "api" : "root",
        repositoryCommit: "abc", language: repository === api ? "go" : "javascript", tool,
        functions: [{ id: "changed", path, line: 1, endLine: 2, complexity,
          coverageKind: "branch", coveragePercent: 100, crap: 0, mapping: "exact" }] };
      writeFileSync(script, `process.stdout.write(${JSON.stringify(JSON.stringify(report))});\n`);
      return { kind: "command", command: [process.execPath, script], protocol: "foundation-crap-v1",
        isolation: "read-only" };
    };
    const repositories = [value.repository, { id: "api", path: api, relativePath: "api" }];
    const config = {
      version: 1,
      policy: { ...structuredClone((value.runtime.draft()).policy), mode: "report" },
      repositories: [
        { id: "root", profiles: [], include: ["**/*"], exclude: [], providers: {
          crap: provider(value.root, "src.js", 2) } },
        { id: "api", profiles: [], include: ["**/*"], exclude: [], providers: {
          crap: provider(api, "internal/api.go", 31) } }
      ], exceptions: []
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const runtime = createQualityRuntime({
      root: value.root,
      repositoryCatalog: () => ({ repositories }),
      selectedRepositories: () => repositories.map((repository) => ({ ...repository, workspacePath: repository.path })),
      canonicalChangedSurface: () => [
        { repositoryId: "root", path: "src.js" },
        { repositoryId: "api", path: "internal/api.go" }
      ],
      declaredSurfaceMatcher: () => () => true,
      loadRuntime: () => ({ id: "change", impact: "medium" }), git: value.git,
      gitHead: () => "abc", readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
      writeJson: value.writeJson, pathInside: (parent, candidate) => {
        const path = relative(resolve(parent), resolve(candidate));
        return path === "" || (!path.startsWith("..") && !path.startsWith("/"));
      }, fail: (message) => { throw new Error(message); }, log: () => {}
    });
    const summary = runtime.run({ change: "change" });
    assert.equal(summary.status, "fail");
    assert.deepEqual(summary.lanes.map((lane) => lane.repository), ["root", "api"]);
    assert.equal(summary.lanes[0].status, "pass");
    assert.equal(summary.lanes[1].status, "fail");
    const debt = runtime.debt();
    assert.ok(debt.findings.some((finding) => finding.repository === "api" &&
      finding.capability === "crap"));
    assert.match(readFileSync(join(value.root, ".foundation", "quality", "results", "debt.md"), "utf8"),
      /internal\/api\.go/);
  } finally { value.cleanup(); }
});

test("a selected repository missing from quality config fails closed", () => {
  const value = fixture();
  const child = join(value.root, "child");
  mkdirSync(child, { recursive: true });
  try {
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = {};
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const repositories = [value.repository, { id: "child", path: child, relativePath: "child" }];
    const runtime = createQualityRuntime({
      root: value.root, repositoryCatalog: () => ({ repositories }),
      selectedRepositories: () => repositories.map((repository) => ({
        ...repository, workspacePath: repository.path
      })), canonicalChangedSurface: () => [], declaredSurfaceMatcher: () => () => true,
      loadRuntime: () => ({ id: "change", impact: "medium" }), git: value.git,
      gitHead: () => "abc", readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
      writeJson: value.writeJson, pathInside: () => true,
      fail: (message) => { throw new Error(message); }, log: () => {}
    });
    const summary = runtime.run({ change: "change" });
    assert.equal(summary.status, "fail");
    assert.ok(summary.lanes.some((lane) => lane.repository === "child" &&
      lane.capability === "configuration"));
    assert.ok(runtime.doctor({ change: "change" }).issues.some((issue) =>
      issue.code === "repository-unconfigured"));
  } finally { value.cleanup(); }
});

// spiffmeter: a backend mutation lane ran 4.5 minutes on every frontend-only Prove.
test("a lane with declared paths runs only when the change touches them, or without a change, or with --full", () => {
  const value = fixture();
  const saved = process.env.FOUNDATION_CHANGE_ID;
  delete process.env.FOUNDATION_CHANGE_ID;
  try {
    const failing = join(value.root, "fail.mjs");
    writeFileSync(failing, "process.exit(1);\n");
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = {
      test: { kind: "command", command: [process.execPath, failing], isolation: "read-only", paths: ["backend/**"] },
      integration: { kind: "command", command: [process.execPath, failing], isolation: "read-only", paths: ["*.js"] }
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const lane = (summary, capability) => summary.lanes.find((row) => row.capability === capability);
    const scoped = value.runtime.run({ change: "change" });
    assert.equal(lane(scoped, "test").assurance, "not-affected", "src.js is outside backend/**, so the failing command never ran");
    assert.equal(lane(scoped, "test").status, "pass");
    assert.equal(lane(scoped, "test").required, false);
    assert.match(lane(scoped, "test").reason, /touches none of this lane's paths \(backend\/\*\*\)/);
    assert.equal(lane(scoped, "integration").status, "fail", "src.js matches *.js, so the lane ran");
    assert.equal(lane(value.runtime.run({ change: "change", full: true }), "test").status, "fail");
    assert.equal(lane(value.runtime.run({}), "test").status, "fail", "without a change every lane runs");
  } finally {
    if (saved !== undefined) process.env.FOUNDATION_CHANGE_ID = saved;
    value.cleanup();
  }
});

test("a not-affected test lane compensates only when its latest recorded run passed", () => {
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].providers = {
      test: { kind: "command", command: [process.execPath, "-e", "0"], isolation: "read-only", paths: ["backend/**"] }
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const status = join(value.root, ".foundation", "quality", "results", "root", "test.status.json");
    const missing = (summary) => summary.lanes.filter((row) => /compensating evidence is missing/.test(row.reason || ""));
    value.writeJson(status, { status: "fail", history: [] });
    const failed = value.runtime.run({ change: "change" });
    assert.ok(missing(failed).length > 0, "a skipped lane whose last run failed is no evidence");
    value.writeJson(status, { status: "pass", history: [] });
    assert.equal(missing(value.runtime.run({ change: "change" })).length, 0);
  } finally { value.cleanup(); }
});

test("a provider's paths must be a non-empty list of globs", () => {
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].providers = { test: { kind: "command", command: ["npm", "test"], paths: "backend/**" } };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    assert.throws(() => value.runtime.run({ change: "change" }), /providers\.test\.paths must be a non-empty array/);
  } finally { value.cleanup(); }
});

test("quality doctor warns on an exit-code lane that swallows failure and suggests paths for a one-directory lane", () => {
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = {
      test: { kind: "command", command: ["sh", "-c", "go test ./... || true"], isolation: "read-only" },
      lint: { kind: "builtin", adapter: "eslint-json", command: ["sh", "-c", "cd frontend && { pnpm exec eslint . -f json || true; }"] },
      integration: { kind: "command", command: ["sh", "-c", "cd backend && go test ./..."], isolation: "read-only" },
      "static-analysis": { kind: "command", command: ["sh", "-c", "cd backend && go vet ./..."], paths: ["backend/**"] }
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const report = value.runtime.doctor();
    const issues = (code) => report.issues.filter((issue) => issue.code === code);
    assert.deepEqual(issues("provider-swallows-failure").map((issue) => issue.capability), ["test"],
      "a builtin lane parses its output, so its || true is not a hidden failure");
    assert.equal(issues("provider-swallows-failure")[0].level, "warning");
    assert.deepEqual(issues("provider-paths-suggested").map((issue) => [issue.capability, issue.paths]).sort(),
      [["integration", ["backend/**"]], ["lint", ["frontend/**"]]], "a lane that already declares paths gets no hint");
    assert.notEqual(report.status, "fail", "hints never fail the doctor");
  } finally { value.cleanup(); }
});

test("quality doctor suggests paths from the directory a command names", async () => {
  const { commandDirectory } = await import("../runtime/quality/quality-doctor-hints.mjs");
  assert.equal(commandDirectory(["go", "test", "./services/wallet/..."]), "services/wallet");
  assert.equal(commandDirectory(["go", "test", "-race", "./svc/..."]), "svc");
  assert.equal(commandDirectory(["sh", "-c", "make -C backend test"]), "backend");
  assert.equal(commandDirectory(["npm", "--prefix", "web", "test"]), "web");
  assert.equal(commandDirectory(["pnpm", "--dir", "apps/web", "test"]), "apps/web");
  assert.equal(commandDirectory(["./gradlew", "-p", "app", "test"]), "app");
  assert.equal(commandDirectory(["cargo", "test", "--manifest-path", "tools/x/Cargo.toml"]), "tools/x");
  assert.equal(commandDirectory(["go", "test", "./..."]), null, "the whole repository");
  assert.equal(commandDirectory(["sh", "-c", "cd .. && make"]), null);
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = { test: { kind: "command", command: ["go", "test", "./services/wallet/..."] } };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const hint = value.runtime.doctor().issues.find((issue) => issue.code === "provider-paths-suggested");
    assert.deepEqual(hint.paths, ["services/wallet/**"]);
  } finally { value.cleanup(); }
});

test("quality doctor suggests every directory a command names, and none for a whole-repository run", async () => {
  const { commandDirectories } = await import("../runtime/quality/quality-doctor-hints.mjs");
  assert.deepEqual(commandDirectories(["go", "test", "./a/...", "./b/..."]), ["a", "b"]);
  assert.deepEqual(commandDirectories(["sh", "-c", "make -C a test && make -C b test"]), ["a", "b"]);
  assert.deepEqual(commandDirectories(["go", "test", "./a/...", "./..."]), []);
  assert.deepEqual(commandDirectories(["sh", "-c", "cd backend && go test ./..."]), ["backend"]);
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = { test: { kind: "command", command: ["go", "test", "./a/...", "./b/..."] },
      "test:c": { kind: "command", command: ["go", "test", "./c/..."], cwd: "c" } };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const hints = value.runtime.doctor().issues.filter((issue) => issue.code === "provider-paths-suggested");
    assert.deepEqual(hints.map((hint) => hint.paths), [["a/**", "b/**"]], "a lane with cwd is a module lane already");
  } finally { value.cleanup(); }
});

test("quality doctor names a lane whose latest run was slow, pointing at the fast-checks guide", () => {
  const value = fixture();
  try {
    const config = value.runtime.draft();
    config.repositories[0].profiles = [];
    config.repositories[0].providers = {
      test: { kind: "command", command: [process.execPath, "-e", "0"] },
      lint: { kind: "command", command: [process.execPath, "-e", "0"] },
      "static-analysis": { kind: "command", command: [process.execPath, "-e", "0"] }
    };
    value.writeJson(join(value.root, "quality", "foundation-quality.json"), config);
    const results = join(value.root, ".foundation", "quality", "results", "root");
    const run = (durationMs) => ({ status: "pass", durationMs, history: [{ status: "pass", durationMs: 1 }, { status: "pass", durationMs }] });
    value.writeJson(join(results, "test.status.json"), run(300000));
    value.writeJson(join(results, "lint.status.json"), run(30000));
    const slow = value.runtime.doctor().issues.filter((issue) => issue.code === "provider-slow");
    assert.deepEqual(slow.map((issue) => [issue.lane, issue.durationMs]), [["test", 300000]],
      "a fast lane and a lane that never ran get no hint");
    assert.equal(slow[0].level, "info");
    assert.match(slow[0].message, /took 300s on its latest run \(limit 120s\).*references\/fast-checks\.md/);
    value.writeJson(join(results, "test.status.json"), run(90000));
    assert.equal(value.runtime.doctor().issues.some((issue) => issue.code === "provider-slow"), false,
      "90s is within the test lane's limit");
    value.writeJson(join(results, "lint.status.json"), run(90000));
    assert.deepEqual(value.runtime.doctor().issues.filter((issue) => issue.code === "provider-slow")
      .map((issue) => issue.lane), ["lint"], "another lane's limit is 60s");
  } finally { value.cleanup(); }
});
