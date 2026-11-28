import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import {
  createQualityPreflight, findingsCapabilities, preflightFailures, preflightRepairMessage
} from "../runtime/quality/quality-preflight.mjs";
import { createQualityRuntime } from "../runtime/quality/quality-runtime.mjs";

delete process.env.FOUNDATION_CHANGE_ID;
const POLICY = JSON.parse(readFileSync(new URL("../../../quality/foundation-quality.json", import.meta.url), "utf8")).policy;
const config = (providers) => ({ version: 1, policy: POLICY, exceptions: [],
  repositories: [{ id: "root", profiles: ["application-js-ts"], include: ["**/*"], exclude: [], providers }] });
const enforcing = (providers) => ({ ...config(providers), policy: { ...POLICY, mode: "enforce" } });
const write = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
};

function preflightWorld(t, providers) {
  const root = mkdtempSync(join(tmpdir(), "quality-preflight-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  if (providers) write(join(root, "quality/foundation-quality.json"), config(providers));
  const runs = [];
  const state = { hash: "content-1", lanes: { "file-size": "pass", lint: "pass" } };
  const preflight = createQualityPreflight({
    root, loadRuntime: () => ({ workspace: null }), contentHash: () => state.hash,
    markerPath: (id) => join(root, ".foundation/logs", id, "quality-preflight.json"),
    run: ({ capability }) => {
      runs.push(capability);
      const status = state.lanes[capability] || "pass";
      return { lanes: [{ repository: "root", capability, status,
        ...(status === "fail" ? { reason: "findings ratchet failed",
          evaluation: { regressions: [{ path: "src/big.mjs", rule: "file-size", value: 749 }] } } : {}) }] };
    }
  });
  return { root, runs, state, preflight };
}

const FINDINGS = { "file-size": { kind: "builtin", adapter: "file-size", isolation: "read-only" },
  lint: { kind: "builtin", adapter: "generic-findings-json", isolation: "read-only", command: ["true"], inputs: { report: "-" } },
  test: { kind: "command", command: ["npm", "test"] } };

test("a file grown past its ratchet is a repair before Prove starts", (t) => {
  const world = preflightWorld(t, FINDINGS);
  world.state.lanes["file-size"] = "fail";
  const result = world.preflight("a");
  assert.equal(result.status, "fail");
  assert.deepEqual(world.runs, ["file-size", "lint"], "only findings lanes run, never the test lane");
  assert.match(result.failures[0], /root\/file-size: findings ratchet failed — src\/big\.mjs file-size \(749\)/);
  assert.match(preflightRepairMessage(result.failures), /^quality preflight failed before Prove: .*resume advance --through proven$/);
});

test("passing lanes are remembered for the content and not run again", (t) => {
  const world = preflightWorld(t, FINDINGS);
  assert.equal(world.preflight("a").status, "pass");
  assert.equal(world.preflight("a").status, "reused");
  assert.equal(world.runs.length, 2, "the second call ran nothing");
  world.state.hash = "content-2";
  assert.equal(world.preflight("a").status, "pass", "new content is checked again");
  assert.equal(world.runs.length, 4);
});

test("a failed preflight is checked again on the next resume", (t) => {
  const world = preflightWorld(t, FINDINGS);
  world.state.lanes.lint = "fail";
  assert.equal(world.preflight("a").status, "fail");
  world.state.lanes.lint = "pass";
  assert.equal(world.preflight("a").status, "pass");
});

test("no quality configuration, or no findings lane, skips the preflight", (t) => {
  assert.equal(preflightWorld(t, null).preflight("a").status, "skipped");
  const onlyTests = preflightWorld(t, { test: { kind: "command", command: ["npm", "test"] } });
  assert.equal(onlyTests.preflight("a").status, "skipped");
  assert.deepEqual(onlyTests.runs, []);
  assert.deepEqual(findingsCapabilities(config(FINDINGS)), ["file-size", "lint"]);
  assert.deepEqual(preflightFailures([{ lanes: [{ status: "pass" }] }, null]), []);
});

test("every lane sees the paths the change touched, and none without a change", (t) => {
  const root = mkdtempSync(join(tmpdir(), "quality-changed-files-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(join(root, "openspec/config.yaml"), "schema: spec-driven\n");
  const seen = join(root, "seen.txt");
  write(join(root, "quality/foundation-quality.json"), config({ test: { kind: "command",
    command: ["node", "-e", `require("fs").writeFileSync(${JSON.stringify(seen)}, process.env.FOUNDATION_QUALITY_CHANGED_FILES ?? "unset")`] } }));
  const repository = { id: "root", path: root, relativePath: "." };
  const runtime = createQualityRuntime({
    root, repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [{ ...repository, workspacePath: root }],
    canonicalChangedSurface: () => [{ repositoryId: "root", path: "test/a.test.js" }, { repositoryId: "root", path: "src/a.js" }],
    declaredSurfaceMatcher: () => () => true,
    loadRuntime: () => ({ id: "a", impact: "low", workspace: null }),
    git: (args, cwd = root) => spawnSync("git", args, { cwd, encoding: "utf8" }), gitHead: () => "abc",
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")), writeJson: write,
    pathInside: (parent, candidate) => !relative(resolve(parent), resolve(candidate)).startsWith(".."),
    fail: (message) => { throw new Error(message); }, log: () => {}
  });
  runtime.run({ change: "a", capability: "test", full: true });
  assert.equal(readFileSync(seen, "utf8"), "src/a.js\ntest/a.test.js");
  runtime.run({ capability: "test" });
  assert.equal(readFileSync(seen, "utf8"), "");
});

// The wiring: in an installed consumer, a findings regression stops advance
// with a repair before Prove runs any provider.
test("advance returns the preflight repair before Prove in an installed consumer", async (t) => {
  const { installConsumer } = await import("./fixtures/installed-consumer.mjs");
  const temp = mkdtempSync(join(tmpdir(), "quality-preflight-consumer-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const project = join(temp, "consumer");
  mkdirSync(project);
  installConsumer(project, { sourceRoot: resolve(dirname(new URL(import.meta.url).pathname), "../../..") });
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const sh = (command, args, cwd = project) => spawnSync(command, args, { cwd, encoding: "utf8", env });
  const cli = (...args) => sh("node", [".claude/harness/foundation.mjs", ...args]);
  sh("git", ["config", "user.email", "f@example.test"]);
  sh("git", ["config", "user.name", "F"]);
  const policy = JSON.parse(readFileSync(join(project, "foundation.json"), "utf8"));
  policy.workflow.grounding = "optional";
  write(join(project, "foundation.json"), policy);
  write(join(project, "package.json"), { name: "calc", type: "module", scripts: { test: "node --test" } });
  write(join(project, "src/calc.js"), "export const add = (a, b) => a + b;\n");
  write(join(project, "test/calc.test.js"), 'import test from "node:test";\nimport assert from "node:assert/strict";\n' +
    'import { add } from "../src/calc.js";\ntest("add", () => assert.equal(add(1, 2), 3));\n');
  // A lint lane that reports every BAD marker in src/. Seeded in report mode,
  // then enforced: the preflight must still name the finding, not a bare gate stop.
  const lanes = { lint: { kind: "builtin", adapter: "generic-findings-json",
    isolation: "read-only", inputs: { report: "-" }, command: ["node", "-e",
      "const s=require('fs').readFileSync('src/calc.js','utf8');console.log(JSON.stringify({findings:s.includes('BAD')?" +
      "[{path:'src/calc.js',rule:'no-bad',message:'BAD marker'}]:[]}))"] } };
  write(join(project, "quality/foundation-quality.json"), config(lanes));
  assert.equal(cli("quality-run").status, 0);
  assert.equal(cli("quality-baseline", "--write", "--decision-ref", "fixture", "--reason", "start").status, 0);
  write(join(project, "quality/foundation-quality.json"), enforcing(lanes));
  sh("git", ["add", "-A"]);
  sh("git", ["commit", "-qm", "seed"]);
  write(join(project, ".foundation/drafts/subtract.json"), {
    intent: "Calc exports subtract that returns a minus b",
    requirements: [{ description: "The calc module SHALL export subtract(a, b) returning a minus b",
      scenarios: [{ when: "subtract(5, 3) is called", then: "it returns 2" }] }],
    tasks: [{ outcome: "Add subtract with a test", verify: "node --test", paths: ["src/**", "test/**"] }] });
  const started = cli("start", ".foundation/drafts/subtract.json", "--approve-spec", "--decision-ref", "fixture://spec");
  const id = started.stdout.match(/CREATED (\S+)/)?.[1];
  assert.ok(id, started.stderr || started.stdout);
  assert.match(cli("advance", id, "--through", "build").stdout, /"action":"EDIT"/);
  const workspace = JSON.parse(readFileSync(join(project, ".foundation/runtime", `${id}.json`), "utf8")).workspace.path;
  write(join(workspace, "src/calc.js"), "export const add = (a, b) => a + b;\n// BAD\nexport const subtract = (a, b) => a - b;\n");
  write(join(workspace, "test/calc.test.js"), 'import test from "node:test";\nimport assert from "node:assert/strict";\n' +
    'import { add, subtract } from "../src/calc.js";\ntest("add", () => assert.equal(add(1, 2), 3));\n' +
    'test("subtract", () => assert.equal(subtract(5, 3), 2));\n');
  const proving = cli("advance", id, "--through", "proven");
  // stdout is the advance envelope alone: the preflight's quality runs print nothing.
  const envelope = JSON.parse(proving.stdout);
  assert.match(JSON.stringify(envelope), /quality preflight failed before Prove: root\/lint: .*src\/calc\.js no-bad/,
    proving.stderr || proving.stdout);
  assert.notEqual(envelope.reached, "proven");
  const receipts = join(project, ".foundation/receipts", id);
  assert.equal(spawnSync("test", ["-e", join(receipts, "static-analysis.json")]).status, 1, "no provider ran");
});
