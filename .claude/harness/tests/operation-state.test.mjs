// The process-wide operation record: which change a command acts on, how a
// refusal is recorded, and how trapped failures throw instead of exiting.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createOperationState, operationChangeIdFor } from "../runtime/composition/operation-state.mjs";

const scope = (captured = false) => ({ capture: () => captured });

test("the change a command acts on comes from its own argument position", () => {
  assert.equal(operationChangeIdFor("advance", ["demo", "--through", "proven"]), "demo");
  assert.equal(operationChangeIdFor("sandbox", ["create", "demo"]), "demo");
  assert.equal(operationChangeIdFor("sandbox", ["create", "--all", "demo"]), null, "a flag is never a change");
  assert.equal(operationChangeIdFor("quality-run", ["--change", "demo"]), "demo");
  assert.equal(operationChangeIdFor("quality-run", [], { FOUNDATION_CHANGE_ID: "env" }), "env");
  assert.equal(operationChangeIdFor("doctor", ["demo"]), null);
});

test("a refusal is recorded, exits outside a trap, and throws inside one", () => {
  const exits = [];
  const errors = [];
  const operation = createOperationState({ detachedBlockScope: scope(), env: {},
    error: (line) => errors.push(line), exit: (code) => { exits.push(code); } });
  operation.setChangeId("demo");
  operation.die("not ready", 3);
  assert.deepEqual(exits, [3]);
  assert.deepEqual(errors, ["BLOCKED: not ready"]);
  assert.equal(operation.state.blocked, true);
  assert.equal(operation.state.blocker.reason, "not ready");
  assert.match(operation.state.blocker.recovery, /demo/, "the blocker names the change being run");
  assert.throws(() => operation.trapFailures(() => operation.die("inner", 2, { code: "X", ignored: "y" })),
    (error) => error.exitCode === 2 && error.foundationBlocked && error.code === "X" && !("ignored" in error));
  assert.deepEqual(exits, [3], "a trapped failure never exits");
  const detached = createOperationState({ detachedBlockScope: scope(true), env: {}, error() {}, exit() {} });
  detached.markBlocked("beside");
  assert.equal(detached.state.blocked, false, "a detached refusal stays in its scope");
});

test("begin records the change status and an input fingerprint, and tolerates a damaged change", (t) => {
  const root = mkdtempSync(join(tmpdir(), "operation-state-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "change"));
  writeFileSync(join(root, "foundation.json"), "{}");
  const operation = createOperationState({ detachedBlockScope: scope(), env: {}, error() {}, exit() {} });
  const io = { root, readJson: () => ({ status: "build" }), runtimePath: (id) => id,
    activeChangePath: () => join(root, "change"), directoryHash: () => "d", fileDigest: () => "f" };
  operation.begin({ command: "advance", values: ["demo"], ...io });
  assert.equal(operation.state.name, "advance");
  assert.equal(operation.state.changeId, "demo");
  assert.equal(operation.state.statusAtStart, "build");
  assert.ok(operation.state.fingerprint);
  operation.begin({ command: "advance", values: ["demo"], ...io, activeChangePath: () => { throw new Error("damaged"); } });
  assert.equal(operation.state.fingerprint, null);
  operation.begin({ command: "doctor", values: [], ...io });
  assert.equal(operation.state.changeId, null);
});
