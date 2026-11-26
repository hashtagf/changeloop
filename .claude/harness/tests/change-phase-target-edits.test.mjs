import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { installConsumer } from "./fixtures/installed-consumer.mjs";
import {
  CHANGE_PHASE_EDITS_SIGNAL, changePhaseEditPaths
} from "../runtime/workflow/sandbox/change-phase-edits.mjs";
import { startManifest } from "../runtime/core/start-manifest.mjs";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
// Each fixture is its own project; a pin to the calling project (set when a
// task verify runs from a host session) would refuse the fixture install.
delete process.env.CLAUDE_FOUNDATION_PROJECT;

// An installed consumer with one calc module, a started rapid change, and the
// CLI. `beforeStart` runs before change start; the caller edits after it.
function consumer(t, { git, beforeStart = () => {} }) {
  const temp = mkdtempSync(join(tmpdir(), "foundation-change-phase-edits-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const project = join(temp, "consumer");
  mkdirSync(project, { recursive: true });
  installConsumer(project, { sourceRoot, git });
  const write = (path, text) => {
    mkdirSync(dirname(join(project, path)), { recursive: true });
    writeFileSync(join(project, path), text);
  };
  write("package.json", '{"name":"calc","version":"1.0.0","type":"module","scripts":{"test":"node --test"}}\n');
  write("src/calc.js", "export function add(a, b) { return a + b; }\n");
  write("test/calc.test.js", 'import test from "node:test";\nimport assert from "node:assert/strict";\n' +
    'import { add } from "../src/calc.js";\ntest("add", () => assert.equal(add(1, 2), 3));\n');
  const policyPath = join(project, "foundation.json");
  const policy = JSON.parse(readFileSync(policyPath, "utf8"));
  policy.workflow.grounding = "optional";
  writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  if (git) {
    const run = (...args) => execFileSync("git", args, { cwd: project, stdio: "ignore" });
    run("config", "user.email", "fixture@example.test");
    run("config", "user.name", "Fixture");
    run("add", "-A");
    run("commit", "-qm", "seed");
  }
  beforeStart(write);
  write(".foundation/drafts/subtract.json", JSON.stringify({
    intent: "Calc exports subtract that returns a minus b",
    requirements: [{ description: "The calc module SHALL export subtract(a, b) returning a minus b",
      scenarios: [{ when: "subtract(5, 3) is called", then: "it returns 2" }] }],
    tasks: [{ outcome: "Add subtract with a test", verify: "node --test", paths: ["src/**", "test/**"] }]
  }));
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const cli = (...args) => spawnSync("node", [".claude/harness/foundation.mjs", ...args],
    { cwd: project, encoding: "utf8", env });
  const started = cli("start", ".foundation/drafts/subtract.json",
    "--approve-spec", "--decision-ref", "fixture://user/spec");
  assert.equal(started.status, 0, started.stderr || started.stdout);
  const id = started.stdout.match(/CREATED (\S+)/)?.[1];
  const build = () => {
    const result = cli("advance", id, "--through", "build");
    const envelope = JSON.parse(result.stdout.slice(result.stdout.indexOf("{")));
    assert.equal(envelope.action, "EDIT", result.stderr || result.stdout);
    return envelope;
  };
  const signal = (envelope) => (envelope.signals || [])
    .find((row) => row.code === CHANGE_PHASE_EDITS_SIGNAL) || null;
  return { project, id, cli, write, build, signal };
}

test("a target without Git: product files written during Change are named at Build", (t) => {
  const value = consumer(t, { git: false });
  value.write("src/coupons.js", "export const coupon = 1;\n");
  value.write("src/calc.js", "export function add(a, b) { return a + b + 0; }\n");
  const found = value.signal(value.build());
  assert.ok(found, "the first Build action carries the signal");
  assert.match(found.message, /src\/calc\.js, src\/coupons\.js/);
  assert.match(found.message, /edit them only inside the sandbox/);
  assert.match(found.message, /Do not delete, revert, or edit them in the target/);
});

test("a Git target: a product file written after change start is named", (t) => {
  const value = consumer(t, { git: true });
  const state = JSON.parse(readFileSync(join(value.project, ".foundation/runtime", `${value.id}.json`), "utf8"));
  assert.equal(state.workspace.startManifest, undefined, "a Git target records no file manifest");
  value.write("src/extra.js", "export const extra = 1;\n");
  assert.match(value.signal(value.build())?.message || "", /src\/extra\.js/);
});

test("no product write before Build means no signal", (t) => {
  for (const git of [false, true]) {
    const value = consumer(t, { git });
    assert.equal(value.signal(value.build()), null, `git: ${git}`);
  }
});

test("a file already dirty before change start and unchanged since is not named", (t) => {
  const value = consumer(t, { git: true,
    beforeStart: (write) => write("src/calc.js", "export function add(a, b) { return b + a; }\n") });
  assert.equal(value.signal(value.build()), null);
});

test("harness state and change packets alone raise no signal", (t) => {
  const value = consumer(t, { git: false });
  value.write(".foundation/notes.txt", "x\n");
  value.write("openspec/changes/scratch/notes.md", "x\n");
  assert.equal(value.signal(value.build()), null);
  assert.deepEqual(changePhaseEditPaths({}, { ".foundation/a": "1", "openspec/investigations/x.json": "2" }), []);
});

test("an agent that follows the signal lands the change-phase file from the sandbox", (t) => {
  const value = consumer(t, { git: false });
  value.write("src/calc.js", "export function add(a, b) { return a + b; }\nexport function subtract() {}\n");
  const envelope = value.build();
  assert.ok(value.signal(envelope));
  // The agent leaves the target alone and finishes the work in the sandbox.
  const workspace = envelope.workspace;
  writeFileSync(join(workspace, "src/calc.js"), "export function add(a, b) { return a + b; }\n" +
    "export function subtract(a, b) { return a - b; }\n");
  writeFileSync(join(workspace, "test/calc.test.js"), 'import test from "node:test";\n' +
    'import assert from "node:assert/strict";\nimport { add, subtract } from "../src/calc.js";\n' +
    'test("add", () => assert.equal(add(1, 2), 3));\ntest("subtract", () => assert.equal(subtract(5, 3), 2));\n');
  const landed = value.cli("advance", value.id, "--through", "archived");
  assert.equal(landed.status, 0, landed.stderr || landed.stdout);
  assert.match(landed.stdout, /"reached":"archived"/);
  assert.doesNotMatch(`${landed.stdout}${landed.stderr}`, /isolated-copy conflict/);
  assert.match(readFileSync(join(value.project, "src/calc.js"), "utf8"), /return a - b/);
});

test("the change-start manifest skips harness state and is recorded only without Git", (t) => {
  const root = mkdtempSync(join(tmpdir(), "foundation-start-manifest-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "src"));
  mkdirSync(join(root, ".foundation"));
  writeFileSync(join(root, "src/a.js"), "a\n");
  writeFileSync(join(root, ".foundation/state.json"), "{}\n");
  assert.deepEqual(Object.keys(startManifest(root)), ["src/a.js"]);
});
