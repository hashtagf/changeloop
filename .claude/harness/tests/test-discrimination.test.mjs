import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  behaviorChangingWork, createTestDiscriminationRuntime, scopedTestCommand, segmentTestCommand
} from "../runtime/evidence/test-discrimination.mjs";
import { verifyChain } from "../runtime/workflow/draft/semantic-draft-tasks.mjs";

// The base-source run reruns only the task verify that names a changed test.
test("discrimination runs segments through the last one that names a changed test", () => {
  const segments = ["node --test test/a.test.mjs", "node --test test/b.test.mjs", "bash scripts/lint.sh"];
  // Task 2's test changed: tasks 1 and 2 run, the trailing lint does not.
  assert.deepEqual(segmentTestCommand({ segments }, ["test/b.test.mjs"]), { command: "sh",
    args: ["-c", "(node --test test/a.test.mjs) && (node --test test/b.test.mjs)"] });
  // Only the first segment: narrowed to its own file.
  assert.deepEqual(segmentTestCommand({ segments }, ["test/a.test.mjs"]),
    { command: "node", args: ["--test", "test/a.test.mjs"] });
  // A setup segment before the test is kept, so the base build still runs.
  assert.deepEqual(segmentTestCommand({ segments: ["npm run build", "node --test test/b.test.mjs"] },
    ["test/b.test.mjs"]), { command: "sh", args: ["-c", "(npm run build) && (node --test test/b.test.mjs)"] });
  // No segment names the changed test, or no segments at all: the whole
  // provider command runs as before.
  assert.equal(segmentTestCommand({ segments }, ["test/c.test.mjs"]), null);
  assert.equal(segmentTestCommand({}, ["test/a.test.mjs"]), null);
  assert.equal(segmentTestCommand({ segments }, []), null);
  // One changed test no segment names: matching is unclear, so the whole
  // provider runs rather than leaving that test unchecked on base.
  assert.equal(segmentTestCommand({ segments }, ["test/b.test.mjs", "tests/unit/c.test.ts"]), null);
  // A narrowed segment receives only the files it names itself.
  const mixed = ["node --test test/a.test.mjs", "npx vitest run web/b.test.ts"];
  assert.deepEqual(segmentTestCommand({ segments: mixed }, ["test/a.test.mjs"]),
    { command: "node", args: ["--test", "test/a.test.mjs"] });
  assert.deepEqual(segmentTestCommand({ segments: mixed }, ["test/a.test.mjs", "web/b.test.ts"]),
    { command: "sh", args: ["-c", "(node --test test/a.test.mjs) && (npx vitest run web/b.test.ts)"] });
});

test("a compiled chain of several verifies records them as segments", () => {
  assert.deepEqual(verifyChain(["npm test"]), { command: ["sh", "-c", "npm test"] });
  assert.deepEqual(verifyChain(["node --test a.mjs", "node --test b.mjs"]), {
    command: ["sh", "-c", "(node --test a.mjs) && (node --test b.mjs)"],
    segments: ["node --test a.mjs", "node --test b.mjs"]
  });
});
import { configuredCommand } from "../runtime/evidence/evidence-results.mjs";
import { lightKind, packetWorkTypes } from "../runtime/workflow/validation/dev-document.mjs";
import { BEHAVIOR_NEUTRAL_WORK } from "../runtime/contracts/work-types.mjs";
import { coverageNotes } from "../runtime/workflow/validation/packet-overview.mjs";
import { taskChangeIssue } from "../runtime/workflow/change/task-change.mjs";

const stableHash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const fileDigest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function write(root, files) {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
}

// A committed base with one passing test; the change is left uncommitted in
// the same checkout, the way a sandbox holds it.
function repository(root, name, base, change) {
  const path = join(root, name);
  mkdirSync(path, { recursive: true });
  git(path, "init", "-q");
  git(path, "config", "user.email", "fixture@example.invalid");
  git(path, "config", "user.name", "fixture");
  write(path, base);
  git(path, "add", "-A");
  git(path, "commit", "-qm", "base");
  const baseHead = git(path, "rev-parse", "HEAD");
  write(path, change);
  return { id: name, mode: "write", workspacePath: path, baseHead };
}

const GREET_BASE = {
  "package.json": "{\"type\":\"module\"}\n",
  "src/greet.js": "export function greet(name) { return `Hello ${name}`; }\n",
  "test/greet.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
    "import { greet } from '../src/greet.js';\n" +
    "test('greets', () => assert.match(greet('Ada'), /Ada/));\n"
};
const GREET_CHANGE = {
  "src/greet.js": "export function greet(name) { return `Hello, ${name}!`; }\n"
};

function harness({ repositories, workTypes = ["feature"], spawns = [], logs,
  command = ["node", "--test"], environment = null, binding = null, providers = null,
  timeoutMs = undefined }) {
  const byId = new Map(repositories.map((row) => [row.id, row]));
  const state = { repositories: Object.fromEntries(repositories.map((row) =>
    [row.id, { baseHead: row.baseHead }])),
    ...(binding ? { scenarioTestBinding: { version: 1, rows: binding } } : {}) };
  const surface = () => repositories.flatMap((row) => {
    const tracked = git(row.workspacePath, "diff", "--name-only", row.baseHead);
    const untracked = git(row.workspacePath, "ls-files", "--others", "--exclude-standard");
    return [...tracked.split("\n"), ...untracked.split("\n")].filter(Boolean)
      .map((path) => ({ repositoryId: row.id, path }));
  });
  return createTestDiscriminationRuntime({
    LOGS: logs,
    requiredProviders: () => providers || repositories.map((row) => `test-${row.id}`),
    providerConfig: () => ({ adapter: "command", command, ...(timeoutMs ? { timeoutMs } : {}) }),
    providerCapability: () => "test",
    providerRepository: (_id, provider) => byId.get(provider.slice(5)),
    selectedRepositories: () => repositories,
    repositoryBaseHead: (repository) => repository.baseHead,
    changedSurface: surface,
    pathKind: lightKind,
    changeWorkTypes: () => workTypes,
    receiptValidity: () => ({ validity: "valid" }),
    configuredCommand, fileDigest, stableHash,
    loadRuntime: () => state,
    // A nested `node --test` under this runner would report to it instead of
    // exiting with its own status.
    environment: environment || Object.fromEntries(Object.entries(process.env)
      .filter(([name]) => name !== "NODE_TEST_CONTEXT")),
    spawnCommandSync: (command, args, options) => {
      spawns.push({ command, args, cwd: options.cwd });
      return spawnSync(command, args, options);
    }
  });
}

function fixtureRoot(t) {
  const root = mkdtempSync(join(tmpdir(), "discrimination-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test("a new test that also passes on the base source is a repair naming the file", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, {
    ...GREET_CHANGE,
    "test/greet-more.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('mentions the name', () => assert.match(greet('Lin'), /Lin/));\n"
  });
  const before = git(repo.workspacePath, "status", "--porcelain");
  const spawns = [];
  const result = harness({ repositories: [repo], spawns, logs: join(root, "logs") })
    .evaluate("change-a", "hash-a");
  assert.equal(result.status, "fail");
  assert.equal(result.repositories[0].outcome, "passes-on-base");
  assert.deepEqual(result.findings[0].paths, ["test/greet-more.test.js"]);
  assert.match(result.findings[0].message,
    /test\/greet-more\.test\.js .*pass on the original code.*do not verify the change/);
  // Only the change's test file runs, in a scratch copy outside the sandbox.
  assert.deepEqual(spawns[0].args, ["--test", "--test-force-exit", "test/greet-more.test.js"]);
  assert.ok(!spawns[0].cwd.startsWith(repo.workspacePath));
  assert.equal(git(repo.workspacePath, "status", "--porcelain"), before);
  assert.equal(git(repo.workspacePath, "worktree", "list").split("\n").length, 1);
});

test("a new test that fails on base and passes on the change satisfies the rule, once", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, {
    ...GREET_CHANGE,
    "test/greet-format.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('formats', () => assert.equal(greet('Ada'), 'Hello, Ada!'));\n"
  });
  assert.equal(spawnSync("node", ["--test", "test/greet-format.test.js"],
    { cwd: repo.workspacePath }).status, 0, "the new test passes on the change");
  const spawns = [];
  const runtime = harness({ repositories: [repo], spawns, logs: join(root, "logs") });
  const first = runtime.evaluate("change-a", "hash-a");
  assert.equal(first.status, "pass");
  assert.equal(first.repositories[0].outcome, "fails-on-base");
  assert.deepEqual(first.findings, []);
  // Content-digest cache: an unchanged rerun repeats no command.
  const second = runtime.evaluate("change-a", "hash-a");
  assert.equal(second.status, "pass");
  assert.equal(second.repositories[0].cached, true);
  assert.equal(spawns.length, 1);
  // Changing the test file is new input and runs again.
  write(repo.workspacePath, { "test/greet-format.test.js": readFileSync(
    join(repo.workspacePath, "test/greet-format.test.js"), "utf8") + "// edited\n" });
  runtime.evaluate("change-a", "hash-b");
  assert.equal(spawns.length, 2);
});

test("refactor, docs, chore, and config work skip the rule without running anything", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, GREET_CHANGE);
  for (const workTypes of [["refactor"], ["docs"], ["chore", "config"], []]) {
    const spawns = [];
    const result = harness({ repositories: [repo], spawns, workTypes, logs: join(root, "logs") })
      .evaluate("change-a", "hash-a");
    assert.equal(result.status, "not-applicable", workTypes.join(","));
    assert.equal(spawns.length, 0);
  }
  assert.equal(behaviorChangingWork(["refactor", "bugfix"]), true);
  assert.equal(behaviorChangingWork(["code"]), true);
});

test("async base-source checks yield, clean scratch trees, and reuse the same verdict", async (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, {
    ...GREET_CHANGE,
    "test/greet-format.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('formats', () => assert.equal(greet('Ada'), 'Hello, Ada!'));\n"
  });
  const runtime = harness({ repositories: [repo], logs: join(root, "logs") });
  let yielded = false;
  setImmediate(() => { yielded = true; });
  const result = await runtime.evaluateAsync("change-a", "hash-a");
  assert.equal(yielded, true, "the child check does not block the event loop");
  assert.equal(result.status, "pass");
  assert.equal(result.repositories[0].outcome, "fails-on-base");
  assert.equal(runtime.evaluate("change-a", "hash-a").repositories[0].cached, true,
    "sync and async routes share content-bound evidence without another run");
  assert.equal(git(repo.workspacePath, "worktree", "list").split("\n").length, 1);
});

test("compiled plain shell providers run only changed tests and keep environment-bound reuse", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, {
    ...GREET_CHANGE,
    "test/greet-format.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('formats', () => assert.equal(greet('Ada'), 'Hello, Ada!'));\n"
  });
  const environment = Object.fromEntries(Object.entries(process.env)
    .filter(([name]) => name !== "NODE_TEST_CONTEXT"));
  environment.DISCRIMINATION_MODE = "first";
  const spawns = [];
  const logs = join(root, "logs");
  const runtime = harness({ repositories: [repo], spawns, logs, environment,
    command: ["sh", "-c", "node --test"] });
  assert.equal(runtime.evaluate("change-a", "hash-a").status, "pass");
  assert.deepEqual(spawns[0].args, ["--test", "--test-force-exit", "test/greet-format.test.js"]);
  assert.equal(spawns[0].command, "node");
  assert.equal(runtime.evaluate("change-a", "hash-a").repositories[0].cached, true);
  assert.equal(spawns.length, 1);
  environment.DISCRIMINATION_MODE = "second";
  assert.notEqual(runtime.evaluate("change-a", "hash-a").repositories[0].cached, true,
    "changed execution environment invalidates a base-run verdict");
  assert.equal(spawns.length, 2);
  const cache = readdirSync(join(logs, "change-a", "test-discrimination"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => readFileSync(join(logs, "change-a", "test-discrimination", name), "utf8"));
  assert.ok(cache.every((text) => !text.includes("DISCRIMINATION_MODE")),
    "cache records retain the environment digest, never its values");
});

test("a test importing a module the change adds counts as failing on base", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, {
    "src/farewell.js": "export function farewell(name) { return `Bye ${name}`; }\n",
    "test/farewell.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { farewell } from '../src/farewell.js';\ntest('says bye', () => assert.match(farewell('Ada'), /Ada/));\n"
  });
  const result = harness({ repositories: [repo], logs: join(root, "logs") })
    .evaluate("change-a", "hash-a");
  assert.equal(result.status, "pass");
  assert.equal(result.repositories[0].outcome, "fails-on-base");
});

test("multi-repository changes are evaluated per repository", (t) => {
  const root = fixtureRoot(t);
  const api = repository(root, "api", GREET_BASE, {
    ...GREET_CHANGE,
    "test/greet-format.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('formats', () => assert.equal(greet('Ada'), 'Hello, Ada!'));\n"
  });
  const web = repository(root, "web", GREET_BASE, {
    ...GREET_CHANGE,
    "test/greet-again.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('still greets', () => assert.match(greet('Ada'), /Ada/));\n"
  });
  const docs = repository(root, "docs", { "README.md": "# Docs\n" }, { "README.md": "# Docs v2\n" });
  const result = harness({ repositories: [api, web, docs], logs: join(root, "logs") })
    .evaluate("change-a", "hash-a");
  assert.equal(result.status, "fail");
  assert.deepEqual(result.repositories.map((row) => [row.repositoryId, row.outcome]), [
    ["api", "fails-on-base"], ["web", "passes-on-base"], ["docs", "no-product-change"]
  ]);
  assert.deepEqual(result.findings.map((row) => row.id), ["test-discrimination:web"]);
  assert.match(result.findings[0].message, /repository 'web'/);
});

test("a behavior change with no changed test runs the suite once on base", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, GREET_CHANGE);
  const spawns = [];
  const result = harness({ repositories: [repo], spawns, logs: join(root, "logs") })
    .evaluate("change-a", "hash-a");
  assert.equal(result.status, "fail");
  assert.deepEqual(spawns[0].args, ["--test", "--test-force-exit"]);
  assert.match(result.findings[0].message, /no test in repository 'root' fails on the original code/);
  assert.deepEqual(readdirSync(join(root, "logs", "change-a", "test-discrimination"))
    .filter((name) => name.endsWith(".json")).length, 1);
});

test("test runners that take files are narrowed to the change's test files", () => {
  const files = ["tests/test_api.py"];
  assert.deepEqual(scopedTestCommand({ command: "node",
    args: ["--test", "--test-reporter", "tap", "test/"] }, ["test/a.test.js"]),
  { command: "node", args: ["--test", "--test-reporter", "tap", "test/a.test.js"] });
  assert.deepEqual(scopedTestCommand({ command: "pytest", args: ["-q", "tests"] }, files),
    { command: "pytest", args: ["-q", ...files] });
  assert.deepEqual(scopedTestCommand({ command: "python3", args: ["-m", "pytest", "-k", "api"] }, files),
    { command: "python3", args: ["-m", "pytest", "-k", "api", ...files] });
  assert.deepEqual(scopedTestCommand({ command: "go", args: ["test", "-count=1", "./..."] },
    ["pkg/store/store_test.go", "main_test.go"]),
  { command: "go", args: ["test", "-count=1", ".", "./pkg/store"] });
  assert.equal(scopedTestCommand({ command: "npm", args: ["test"] }, ["test/a.test.js"]), null);
  assert.deepEqual(scopedTestCommand({ command: "sh", args: ["-c", "node --test test/"] },
    ["test/a.test.js"]), { command: "node", args: ["--test", "test/a.test.js"] });
  for (const line of ["node --test | tail -5", "MODE=x node --test", "node --test $TEST_FILES",
    "node --test > results.txt", "node --test && echo done", "sh -c node --test"]) {
    assert.equal(scopedTestCommand({ command: "sh", args: ["-c", line] }, ["test/a.test.js"]), null,
      `shell semantics are preserved: ${line}`);
  }
  assert.equal(lightKind("pkg/store/store_test.go"), "test");
  assert.equal(lightKind("tests/test_api.py"), "test");
});

test("the compiled packet states the work type the rule reads", () => {
  assert.deepEqual(packetWorkTypes({ design: "# D\n\n## Work type\n\nfeature, api\n" }),
    ["feature", "api"]);
  assert.deepEqual(packetWorkTypes({
    proposal: "## Work type\n\ncode (inferred from paths; declare workType to override)\n"
  }), ["code"]);
  assert.deepEqual(packetWorkTypes({ proposal: "## Refactor invariants\n\n- same output\n" }),
    ["refactor"]);
  assert.deepEqual(packetWorkTypes({
    tasks: "- [ ] **T001** Update docs [paths:README.md] — verify: `true`\n"
  }), ["docs"]);
});

test("verify-only completion of a behavior task with no diff in its paths is refused", () => {
  const task = { id: "T001", kind: "implementation", paths: ["src/**"] };
  assert.match(taskChangeIssue({ workTypes: ["feature"], task, changedPaths: ["README.md"] }),
    /task T001 completed with no change.*src\/\*\*/);
  assert.equal(taskChangeIssue({ workTypes: ["feature"], task, changedPaths: ["src/a.js"] }), null);
  assert.equal(taskChangeIssue({ workTypes: ["refactor"], task, changedPaths: [] }), null);
  assert.equal(taskChangeIssue({ workTypes: ["feature"], task: { ...task, paths: [] },
    changedPaths: [] }), null);
  assert.equal(taskChangeIssue({ workTypes: ["feature"],
    task: { ...task, paths: ["docs/guide.md"] }, changedPaths: [] }), null);
});

test("test discrimination, coverage notes, and dev documents read the one shared work sets", () => {
  for (const path of ["../runtime/evidence/test-discrimination.mjs",
    "../runtime/workflow/validation/packet-overview.mjs",
    "../runtime/workflow/validation/dev-document.mjs"]) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    // The sets live in contracts/work-types.mjs (evidence may not import
    // workflow); design-blueprints.mjs re-exports them for workflow modules.
    assert.match(source,
      /import \{[^}]*BEHAVIOR_NEUTRAL_WORK[^}]*\} from "[^"]*(?:design-blueprints|contracts\/work-types)\.mjs"/, path);
    assert.doesNotMatch(source, /new Set\(\[\s*"(?:refactor|docs|chore|config|test)"/, path);
  }
  for (const type of BEHAVIOR_NEUTRAL_WORK) assert.equal(behaviorChangingWork([type]), false, type);
  for (const type of ["infra", "ml", "observability"])
    assert.equal(behaviorChangingWork([type]), true, type);
  const draft = (workType) => ({ version: 4, workType, requirements: [{ key: "r",
    scenarios: [{ key: "s", given: "g", when: "w", then: "t" }] }] });
  assert.deepEqual(coverageNotes(draft(["test"])), coverageNotes(draft(["refactor"])));
  assert.equal(lightKind("package.json"), "dependency");
  assert.equal(taskChangeIssue({ workTypes: ["feature"], task: { id: "T1", paths: ["package.json"] },
    changedPaths: [] }), null);
});

// ---- Per-file judgment with a scenario binding ------------------------------
const PASSES_ON_BASE = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
  "import { greet } from '../src/greet.js';\ntest('mentions the name', () => assert.match(greet('Lin'), /Lin/));\n";
const FAILS_ON_BASE = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
  "import { greet } from '../src/greet.js';\ntest('formats', () => assert.equal(greet('Ada'), 'Hello, Ada!'));\n";
const bound = (scenario, files, regression = false) =>
  ({ claimId: scenario, requirementKey: "greet", scenario, regression, files });

test("per-file-discrimination-hidden: a passing bound test cannot hide behind a file failing on base", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, { ...GREET_CHANGE,
    "test/a.test.mjs": FAILS_ON_BASE, "test/b.test.mjs": PASSES_ON_BASE });
  const binding = [bound("formats", ["test/a.test.mjs"]), bound("mentions name", ["test/b.test.mjs"])];
  const spawns = [];
  const result = harness({ repositories: [repo], spawns, binding, logs: join(root, "logs") })
    .evaluate("change-a", "hash-a");
  assert.equal(result.status, "fail");
  assert.equal(result.findings.length, 1);
  assert.deepEqual(result.findings[0].paths, ["test/b.test.mjs"]);
  assert.match(result.findings[0].message, /test\/b\.test\.mjs \(scenario: mentions name\)/);
  assert.doesNotMatch(result.findings[0].message, /a\.test\.mjs/);
  // Each file ran alone on base.
  assert.deepEqual(spawns.map((row) => row.args), [["--test", "--test-force-exit", "test/a.test.mjs"], ["--test", "--test-force-exit", "test/b.test.mjs"]]);
  // Without a binding the same change keeps the per-repository judgment.
  assert.equal(harness({ repositories: [repo], logs: join(root, "logs-legacy") })
    .evaluate("change-a", "hash-a").status, "pass");
});

test("per-file-discrimination-all-fail: every file failing on base has no finding", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, { ...GREET_CHANGE,
    "test/a.test.mjs": FAILS_ON_BASE, "test/c.test.mjs": FAILS_ON_BASE.replace("'formats'", "'formats again'") });
  const result = harness({ repositories: [repo], logs: join(root, "logs"),
    binding: [bound("formats", ["test/a.test.mjs", "test/c.test.mjs"])] }).evaluate("change-a", "hash-a");
  assert.equal(result.status, "pass");
  assert.deepEqual(result.findings, []);
  assert.equal(result.repositories[0].outcome, "fails-on-base");
});

test("per-file-discrimination-regression: a file bound only to regression scenarios may pass on base", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, { ...GREET_CHANGE,
    "test/a.test.mjs": FAILS_ON_BASE, "test/b.test.mjs": PASSES_ON_BASE });
  const result = harness({ repositories: [repo], logs: join(root, "logs"), binding: [
    bound("formats", ["test/a.test.mjs"]), bound("keeps the name", ["test/b.test.mjs"], true)] })
    .evaluate("change-a", "hash-a");
  assert.equal(result.status, "pass");
  assert.deepEqual(result.findings, []);
  // Only regression files changed: guarded, not a failure.
  const only = repository(root, "only", GREET_BASE, { ...GREET_CHANGE, "test/b.test.mjs": PASSES_ON_BASE });
  const guard = harness({ repositories: [only], logs: join(root, "logs-only"),
    binding: [bound("keeps the name", ["test/b.test.mjs"], true)] }).evaluate("change-a", "hash-a");
  assert.equal(guard.repositories[0].outcome, "regression-guard");
  assert.equal(guard.status, "pass");
});

test("per-file-discrimination-missing-file: a bound test file that does not exist is a repair", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, { ...GREET_CHANGE, "test/a.test.mjs": FAILS_ON_BASE });
  const result = harness({ repositories: [repo], logs: join(root, "logs"), binding: [
    bound("formats", ["test/a.test.mjs"]), bound("reads config", ["tests/config.test.mjs"]),
    bound("glob bound", ["test/**"])] }).evaluate("change-a", "hash-a");
  assert.equal(result.status, "fail");
  const finding = result.findings.find((row) => row.rootCause === "bound-test-missing");
  assert.deepEqual(finding.paths, ["tests/config.test.mjs"]);
  assert.match(finding.message, /tests\/config\.test\.mjs \(scenario: reads config\)/);
});

test("per-file-discrimination-unscoped: a runner that takes no files runs once, unscoped", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, { ...GREET_CHANGE,
    "test/a.test.mjs": FAILS_ON_BASE, "test/b.test.mjs": PASSES_ON_BASE });
  const spawns = [];
  const result = harness({ repositories: [repo], spawns, logs: join(root, "logs"),
    command: ["npm", "test"],
    binding: [bound("formats", ["test/a.test.mjs"]), bound("mentions name", ["test/b.test.mjs"])] })
    .evaluate("change-a", "hash-a");
  assert.equal(spawns.length, 1);
  assert.deepEqual(spawns[0].args, ["test"]);
  assert.equal(result.repositories[0].scoped, false);
  assert.equal(result.repositories[0].perFile, false);
});

test("per-file-discrimination-cached: an unchanged rerun reuses every per-file verdict", (t) => {
  const root = fixtureRoot(t);
  const repo = repository(root, "root", GREET_BASE, { ...GREET_CHANGE,
    "test/a.test.mjs": FAILS_ON_BASE, "test/b.test.mjs": FAILS_ON_BASE.replace("'formats'", "'formats b'") });
  const spawns = [];
  const runtime = harness({ repositories: [repo], spawns, logs: join(root, "logs"),
    binding: [bound("formats", ["test/a.test.mjs", "test/b.test.mjs"])] });
  assert.equal(runtime.evaluate("change-a", "hash-a").status, "pass");
  assert.equal(spawns.length, 2);
  const again = runtime.evaluate("change-a", "hash-a");
  assert.equal(again.status, "pass");
  assert.equal(again.repositories[0].cached, true);
  assert.equal(spawns.length, 2, "no base run repeats");
});

// A project without Git: the sandbox is a copy, and the baseline manifest of
// the project (`file:regular:<sha256>` rows) plus its unchanged files are the base.
function copyProject(root, base, change) {
  const project = join(root, "project");
  const sandbox = join(project, ".foundation", "sandboxes", "c");
  write(project, base);
  write(sandbox, base);
  write(sandbox, change);
  const row = (path) => `file:regular:${createHash("sha256").update(readFileSync(join(project, path))).digest("hex")}`;
  const baseline = Object.fromEntries(Object.keys(base).map((path) => [path, row(path)]));
  return { project, sandbox, baseline };
}

function copyHarness({ project, sandbox, baseline }, logs, spawns = []) {
  const repository = { id: "root", mode: "write", workspacePath: sandbox };
  const state = { workspace: { mode: "copy", path: sandbox, baseHead: null, baseline, sandboxBaseline: baseline } };
  const surface = () => ["src/greet.js", ...Object.keys(GREET_CHANGE), "test/greet-format.test.js", "test/greet-more.test.js"]
    .filter((path, index, all) => all.indexOf(path) === index && existsSync(join(sandbox, path)))
    .map((path) => ({ repositoryId: "root", path }));
  return createTestDiscriminationRuntime({
    root: project, LOGS: logs,
    requiredProviders: () => ["test-root"],
    providerConfig: () => ({ adapter: "command", command: ["node", "--test"] }),
    providerCapability: () => "test",
    providerRepository: () => repository,
    selectedRepositories: () => [repository],
    repositoryBaseHead: () => null,
    changedSurface: surface,
    pathKind: lightKind,
    changeWorkTypes: () => ["feature"],
    receiptValidity: () => ({ validity: "valid" }),
    configuredCommand, fileDigest, stableHash,
    loadRuntime: () => state,
    environment: Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== "NODE_TEST_CONTEXT")),
    spawnCommandSync: (command, args, options) => { spawns.push({ command, args, cwd: options.cwd }); return spawnSync(command, args, options); }
  });
}

test("copy-workspace-discrimination: a project without Git gets a verdict from its baseline", (t) => {
  const root = fixtureRoot(t);
  const discriminating = copyProject(join(root, "a"), GREET_BASE, { ...GREET_CHANGE,
    "test/greet-format.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('formats', () => assert.equal(greet('Ada'), 'Hello, Ada!'));\n" });
  const spawns = [];
  const pass = copyHarness(discriminating, join(root, "logs-a"), spawns).evaluate("c", "h");
  assert.equal(pass.repositories[0].outcome, "fails-on-base", JSON.stringify(pass));
  assert.equal(pass.status, "pass");
  assert.ok(!spawns[0].cwd.startsWith(discriminating.sandbox), "the base runs in a scratch copy");
  assert.equal(readFileSync(join(discriminating.sandbox, "src/greet.js"), "utf8"), GREET_CHANGE["src/greet.js"],
    "the sandbox keeps the change");

  const hollow = copyProject(join(root, "b"), GREET_BASE, { ...GREET_CHANGE,
    "test/greet-more.test.js": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\ntest('mentions the name', () => assert.match(greet('Lin'), /Lin/));\n" });
  const fail = copyHarness(hollow, join(root, "logs-b")).evaluate("c", "h");
  assert.equal(fail.repositories[0].outcome, "passes-on-base");
  assert.equal(fail.status, "fail");

  // The project file changed since the copy and no base bytes were captured:
  // the base cannot be proven, so there is no verdict rather than a guess.
  write(hollow.project, { "src/greet.js": "export const greet = () => 'edited';\n" });
  const unknown = copyHarness(hollow, join(root, "logs-c")).evaluate("c", "h2");
  assert.equal(unknown.repositories[0].outcome, "unavailable");
});
