import assert from "node:assert/strict";
import test from "node:test";

import { createProviderScheduler } from "../runtime/evidence/provider-scheduler.mjs";
import { RERUN_TIMED_OUT_ENV, timedOutRerunSkip } from "../runtime/evidence/provider-timeout-rerun.mjs";
import { timedOutMark } from "../runtime/evidence/receipt-validity.mjs";

// A consumer's test provider, with Playwright inside, hit its limit at about
// 140s; waiting that limit again on unchanged content can only repeat it.
const TIMED_OUT = { validity: "error", timedOut: true, observed: "timeout after 140021ms; critical cases not declared" };

function scheduler(validity, executed) {
  return createProviderScheduler({
    requiredProviders: () => ["test"], receiptValidity: () => validity, providerConfig: () => ({}),
    commandExists: () => true, providerWorkspace: () => "/", playwrightAvailability: () => ({}),
    evidence: () => ({}), providerCapability: (provider) => provider, adapterResources: () => [],
    resourcesConflict: () => false,
    executeAdapter: async (id, provider) => { executed.push(provider); return { status: "pass" }; },
    log: () => {}, logError: () => {}, maxParallelProviders: () => 2, recordScheduler: () => {}, timestamp: Date.now
  });
}

const node = { provider: "test", config: { timeoutMs: 140000 }, dependsOn: [], covers: [], advisory: false };

test("a provider that timed out on this same content and configuration is not run again", async () => {
  const executed = [];
  const [outcome] = await scheduler(TIMED_OUT, executed).runExecutionDag("demo", [node], "run-1");
  assert.deepEqual(executed, [], "the limit is not waited out a second time");
  assert.equal(outcome.status, "error");
  assert.match(outcome.detail, /not run again: .*'timeout after 140021ms; critical cases not declared'/);
  assert.match(outcome.detail, /timed out after 140000ms; raise providers\.test\.timeoutMs/);
  assert.match(outcome.detail, new RegExp(`${RERUN_TIMED_OUT_ENV}=1`));
});

test("changed content or configuration, another failure, or an explicit retry runs the provider", async () => {
  // A moved workspace or a raised timeoutMs makes the receipt stale, not an error.
  for (const validity of [{ validity: "stale" }, { validity: "provider-fingerprint-stale" },
    { validity: "error" }, { validity: "fail" }, { validity: "missing" }]) {
    const executed = [];
    await scheduler(validity, executed).runExecutionDag("demo", [node], "run-1");
    assert.deepEqual(executed, ["test"], JSON.stringify(validity));
  }
  assert.equal(timedOutRerunSkip({ receiptValidity: () => TIMED_OUT, env: { [RERUN_TIMED_OUT_ENV]: "1" } },
    "demo", "test", {}), null);
  assert.equal(timedOutRerunSkip({ receiptValidity: () => { throw new Error("unreadable"); }, env: {} },
    "demo", "test", {}), null, "an unreadable receipt never blocks a run");
});

test("only an error receipt whose run hit its limit is marked as timed out", () => {
  assert.deepEqual(timedOutMark({ status: "error", observed: "timeout after 120026ms; critical cases not declared" }),
    { timedOut: true, observed: "timeout after 120026ms; critical cases not declared" });
  assert.deepEqual(timedOutMark({ status: "error", observed: "spawn npm ENOENT" }), {});
  assert.deepEqual(timedOutMark({ status: "fail", observed: "timeout after 5ms" }), {});
  assert.deepEqual(timedOutMark(null), {});
});
