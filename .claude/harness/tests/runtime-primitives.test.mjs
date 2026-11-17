// The named timer and ignore-on-failure primitives that lint routes every
// other module through (core/timing.mjs, core/best-effort.mjs).
import assert from "node:assert/strict";
import test from "node:test";

import { bestEffort, bestEffortAsync } from "../runtime/core/best-effort.mjs";
import { deadline, delay, retrySync, terminateWithGrace } from "../runtime/core/timing.mjs";

test("deadline fires once after its delay and never after cancel", async () => {
  let fired = 0;
  deadline(5, () => { fired += 1; });
  const cancel = deadline(5, () => { fired += 100; });
  cancel();
  await delay(30);
  assert.equal(fired, 1);
});

test("an unref'd delay still resolves while the process is alive", async () => {
  const started = Date.now();
  await delay(10, { unref: true });
  assert.ok(Date.now() - started >= 9);
});

test("retrySync returns the first acquired attempt", () => {
  let calls = 0;
  const result = retrySync(() => ({ acquired: ++calls === 3, calls }), { deadlineMs: 1000, intervalMs: 1 });
  assert.equal(result.acquired, true);
  assert.equal(calls, 3);
});

test("retrySync stops at its deadline and returns the last attempt", () => {
  let calls = 0;
  const started = Date.now();
  const result = retrySync(() => ({ acquired: false, calls: ++calls }), { deadlineMs: 30, intervalMs: 5 });
  assert.equal(result.acquired, false);
  assert.equal(result.calls, calls);
  assert.ok(calls >= 2);
  assert.ok(Date.now() - started < 1000);
});

test("terminateWithGrace sends SIGTERM now and SIGKILL after the grace period", async () => {
  const signals = [];
  terminateWithGrace({ kill: (signal) => signals.push(signal) }, 10);
  assert.deepEqual(signals, ["SIGTERM"]);
  await delay(30);
  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
});

test("bestEffort returns the result, or the fallback when the action throws", () => {
  assert.equal(bestEffort(() => 7, 0), 7);
  assert.equal(bestEffort(() => { throw new Error("boom"); }, 0), 0);
  assert.equal(bestEffort(() => { throw new Error("boom"); }), undefined);
});

test("bestEffortAsync awaits the action and falls back on rejection", async () => {
  assert.equal(await bestEffortAsync(async () => 7, 0), 7);
  assert.equal(await bestEffortAsync(async () => { throw new Error("boom"); }, 0), 0);
});
