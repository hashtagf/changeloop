import assert from "node:assert/strict";
import test from "node:test";

import { legacyLandSagaMarkers } from "../runtime/core/legacy-land-saga.mjs";
import { changeListingRow } from "../runtime/core/diagnostics-runtime.mjs";
import { upgradeCompatibilityDiagnostics } from "../runtime/core/update-advisory.mjs";
import { createAdvanceRuntime } from "../runtime/workflow/advance-runtime.mjs";
import { advanceRuntimeDeps } from "./fixtures/runtime-deps.mjs";

// Hand-built runtime state in the shape Change Loop 3.7.0 and earlier wrote
// for a multi-repository change mid-way through the commit-based Land saga:
// `land record` bound a child commit, `land resume` marked the saga, and
// `land pointers` staged the submodule pointer.
const legacyState = () => ({
  id: "split-api", status: "building", schema: "foundation-standard",
  workspace: { mode: "worktree", path: "/sandbox", baseHead: "control-base" },
  repositories: {
    root: { mode: "worktree", path: "/sandbox" },
    api: {
      mode: "worktree", path: "/sandbox-api", baseHead: "api-base",
      land: {
        commit: "a1b2c3", ci: "pass", status: "child-landed",
        authority: { kind: "host-user-decision", reference: "user:land-api" },
        binding: "root-gitlink"
      }
    }
  },
  land: {
    strategy: "ordered-resumable-saga", status: "root-pointers-staged",
    pointers: { api: "a1b2c3" }, pointersStagedAt: "2026-11-01T00:00:00.000Z"
  }
});

test("only the retired saga's runtime fields mark a change", () => {
  assert.deepEqual(legacyLandSagaMarkers(legacyState()).map((row) => row.field), [
    "repositories.api.land.commit", "repositories.api.land.status", "land.strategy"
  ]);
  // Current Land writes only an uncommitted-delivery status.
  assert.deepEqual(legacyLandSagaMarkers({
    status: "proven", repositories: { root: {}, api: { delivery: { status: "applied" } } },
    land: { status: "code-applied" }
  }), []);
  assert.deepEqual(legacyLandSagaMarkers({ ...legacyState(), status: "archived" }), [],
    "a finished change is never reported");
  assert.deepEqual(legacyLandSagaMarkers(null), []);
});

function advanceFixture(state) {
  const calls = [];
  const fail = (name) => () => { calls.push(name); throw new Error(`${name} must not run`); };
  let stored = structuredClone(state);
  return {
    calls,
    stored: () => stored,
    runtime: createAdvanceRuntime(advanceRuntimeDeps({
      loadRuntime: () => structuredClone(stored),
      saveRuntime: (value) => { calls.push("saveRuntime"); stored = structuredClone(value); },
      agentDispatchValue: fail("agentDispatchValue"),
      relevantHash: fail("relevantHash"),
      stableHash: (value) => JSON.stringify(value),
      deliveredAiAttempts: () => [], authorityStatusValue: fail("authorityStatusValue"),
      readJson: () => ({}), proofAdvancePath: () => "unused",
      prepareBuild: fail("prepareBuild"), runProof: fail("runProof"),
      recoverArchive: fail("recoverArchive"),
      output: () => {}
    }))
  };
}

test("advance refuses a change stuck in the retired saga with the recovery decision", async () => {
  for (const through of ["build", "proven", "archived"]) {
    const f = advanceFixture(legacyState());
    const value = await f.runtime.advanceThrough("split-api", through);
    assert.equal(value.action, "ASK_USER");
    assert.equal(value.owner, "user");
    assert.equal(value.legacyAction, "LEGACY_LAND_SAGA");
    assert.equal(value.decision.kind, "legacy-land-saga");
    assert.deepEqual(value.files, [".foundation/runtime/split-api.json"]);
    assert.match(value.decision.summary, /commit-based multi-repository Land saga/);
    assert.match(value.decision.summary, /3\.7\.0/);
    assert.deepEqual(value.decision.options.map((row) => row.id),
      ["finish-with-previous-release", "abandon", "pause"]);
    assert.equal(value.decision.recommended, "finish-with-previous-release");
    assert.match(value.decision.options[0].outcome,
      /Reinstall Change Loop 3\.7\.0.*advance split-api --through archived/);
    assert.equal(value.decision.options[1].command,
      "claude-foundation change abandon split-api --reason <reason> --decision-ref <ref>");
    assert.deepEqual(f.calls, [], "nothing builds, proves, lands, or rewrites state");
    assert.deepEqual(f.stored(), legacyState(), "the legacy state is kept unchanged");
  }
  const inspected = advanceFixture(legacyState()).runtime.advanceValue("split-api", { inspect: true });
  assert.equal(inspected.decision.kind, "legacy-land-saga", "inspect returns the same decision");
});

test("changes and the upgrade report name the stuck change and its recovery", () => {
  const row = changeListingRow("split-api", {
    runtimePath: () => "runtime.json", proofPath: () => "proof.json",
    readJson: () => ({}), readJsonOrNull: () => legacyState(),
    relevantHash: () => { throw new Error("must not hash a legacy saga workspace"); },
    pathExists: (path) => path === "runtime.json"
  });
  assert.equal(row,
    "split-api\tlegacy-land-saga\tfoundation-standard\tclaude-foundation advance split-api --inspect");

  const report = upgradeCompatibilityDiagnostics({
    activeChanges: [legacyState(), { id: "current", status: "building" }]
  });
  const [legacy, current] = report.activeChangeEffects;
  assert.deepEqual(legacy.effects, ["state-preserved", "retired-commit-based-land-saga-refused"]);
  assert.match(legacy.recovery, /\.foundation\/runtime\/split-api\.json/);
  assert.match(legacy.recovery, /repositories\.api\.land\.commit=a1b2c3/);
  assert.match(legacy.recovery, /change abandon split-api/);
  assert.deepEqual(current.effects,
    ["state-and-agreement-preserved", "receipts-revalidated-against-current-protocols"]);
});
