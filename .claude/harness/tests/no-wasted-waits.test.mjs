// No wait spent for nothing. A pi-btw Build lost 4m24s to an exec whose test
// file kept a handle open after every test had passed, and advance ran a 40s
// verify check twice on the same tree. These cover the fixes:
// - exec stops a test run that reported its results and kept running;
// - an exec the host stopped is recorded the next time, not lost;
// - a task-scoped pass (exec or advance) is reused on the same workspace;
// - a slow check names its avoidable cause;
// - inside a change, quality run does not rerun the project's tests.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { summaryVerdict, watchedExec } from "../runtime/observability/watched-exec.mjs";
import { createExecRuntime } from "../runtime/observability/exec-runtime.mjs";
import { commandOfArgv, createCheckReuse, slowCheckMessage } from "../runtime/core/check-reuse.mjs";

function dir(t) {
  const root = mkdtempSync(join(tmpdir(), "no-wasted-waits-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

const sink = () => { const rows = []; return { rows, write: (chunk) => rows.push(String(chunk)) }; };
// A runner that prints its final summary and then stays alive on an open handle.
const LINGERING = "console.log('✔ passes (1ms)\\nℹ tests 1\\nℹ pass 1\\nℹ fail 0\\nℹ duration_ms 3');\n" +
  "setInterval(() => {}, 1000);\n";

test("a test run that reported its results and kept running is stopped with its verdict", async (t) => {
  const root = dir(t);
  writeFileSync(join(root, "runner.mjs"), LINGERING);
  const notices = [];
  const started = Date.now();
  const result = await watchedExec(process.execPath, ["runner.mjs"], {
    cwd: root, lingerMs: 500, quietMs: 60000, stdout: sink(), stderr: sink(),
    notice: (code, message) => notices.push({ code, message })
  });
  assert.equal(result.status, 0, "every test passed, so the verdict is a pass");
  // A timer may fire a millisecond or two early against Date.now on CI.
  assert.ok(result.lingeredMs !== null && result.lingeredMs >= 450, `lingeredMs ${result.lingeredMs}`);
  assert.ok(Date.now() - started < 15000, "not left to run until a host timeout");
  assert.deepEqual(notices.map((row) => row.code), ["exec-lingering"]);
  assert.match(notices[0].message, /server, timer, or connection.*--test-force-exit/);
  assert.equal(summaryVerdict("ℹ fail 2\nℹ duration_ms 5\n"), 1);
  assert.equal(summaryVerdict("Tests:       1 failed, 3 passed, 4 total\nRan all test suites.\n"), 1);
  assert.equal(summaryVerdict("Tests:       4 passed, 4 total\nRan all test suites.\n"), 0);
  assert.equal(summaryVerdict("✔ a (1ms)\n"), null, "no final summary is no verdict");
});

test("a command without a test summary runs to its own exit; a silence raises one notice", async (t) => {
  const notices = [];
  const result = await watchedExec(process.execPath, ["-e", "setTimeout(() => process.exit(3), 400)"], {
    cwd: dir(t), lingerMs: 100, quietMs: 200, stdout: sink(), stderr: sink(),
    notice: (code) => notices.push(code)
  });
  assert.equal(result.status, 3);
  assert.equal(result.lingeredMs, null);
  assert.ok(notices.includes("exec-quiet"));
});

function execRuntime(t, { status = "building", hash = "tree-a" } = {}) {
  const root = dir(t);
  const workspace = join(root, "sandbox");
  mkdirSync(workspace, { recursive: true });
  const logs = join(root, "logs");
  let current = hash;
  const runtime = createExecRuntime({
    logs, now: () => new Date().toISOString(), fail: (message) => { throw new Error(message); },
    loadRuntime: () => ({ status, workspace: { path: workspace }, repositories: {} }),
    root, callerCwd: () => workspace, workspaceHash: () => current,
    changeTasks: () => [{ id: "T001", repository: "root" }]
  });
  return { runtime, logs, workspace, setHash: (value) => { current = value; } };
}

const operations = (logs) => readFileSync(join(logs, "change", "operations.jsonl"), "utf8")
  .split("\n").filter(Boolean).map((line) => JSON.parse(line));

test("a task-scoped exec pass is reused by advance on the same tree, and only there", async (t) => {
  const { runtime, logs, setHash } = execRuntime(t);
  const command = "node -e 0";
  assert.equal(await runtime.execObserved("change", ["sh", "-c", command], { task: "T001" }), 0);
  const reuse = createCheckReuse({ logs, workspaceHash: () => "tree-a" });
  assert.equal(reuse.reusable("change", "root", command).source, "exec");
  assert.equal(createCheckReuse({ logs, workspaceHash: () => "tree-b" }).reusable("change", "root", command), null,
    "any edit runs the check again");
  setHash("tree-a");
  assert.equal(await runtime.execObserved("change", ["sh", "-c", "exit 1"], { task: "T001" }), 1);
  assert.equal(reuse.reusable("change", "root", "exit 1"), null, "a failure is never reused");
  assert.equal(commandOfArgv(["sh", "-c", "a && b"]), "a && b");
  assert.equal(operations(logs).at(-1).status, "failed");
});

test("an exec that never recorded its end is recorded as interrupted on the next exec", async (t) => {
  const { runtime, logs } = execRuntime(t);
  mkdirSync(join(logs, "change"), { recursive: true });
  writeFileSync(join(logs, "change", "exec-running.json"), JSON.stringify({
    pid: 2 ** 22 + 12345, command: "node --test hangs.test.mjs", phase: "build",
    startedAt: "2026-11-25T05:01:51.000Z", startedAtMs: 1000, lastOutputAt: 1900 }));
  await runtime.execObserved("change", [process.execPath, "-e", ""]);
  const rows = operations(logs);
  assert.equal(rows[0].status, "interrupted");
  assert.equal(rows[0].durationMs, 900, "the wait until its last output is visible");
  assert.equal(rows[1].status, "completed");
});

test("a slow check names why waiting on it is avoidable", () => {
  const message = slowCheckMessage("cd pi-extensions && npm test", 40000);
  assert.match(message, /took 40s/);
  assert.match(message, /only the tests for its own paths; the whole suite runs once in Prove/);
  assert.match(message, /independent ready tasks can proceed in parallel/);
});
