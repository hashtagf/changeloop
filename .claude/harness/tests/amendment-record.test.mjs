import assert from "node:assert/strict";
import test from "node:test";
import {
  amendedReport, amendmentCoverageChanges, amendmentHistoryRow
} from "../runtime/workflow/change/amendment-record.mjs";
import * as lifecycle from "../runtime/workflow/change/change-lifecycle.mjs";

const compiled = {
  claims: [{ id: "c1", requirementKey: "r1" }, { id: "c2", requirementKey: "r2" }],
  discovery: { coverage: [{ dimension: "happy-path", covers: ["r2"] }] },
  taskContractChanges: [{ id: "T002", reopened: true }],
  taskContractClaimIds: ["c1"],
  removedTasks: [{ id: "T003", key: "task-3" }],
  removedTaskClaimIds: ["c2"],
  addedTaskClaimIds: [],
  addedRequirementKeys: ["r2"], revisedRequirementKeys: [], removedRequirementKeys: [],
  removedClaimIds: ["c9"], invalidatedClaims: ["c2"],
  invalidation: { proofRecovery: null }
};

test("coverage changes name invalidated claims per dimension", () => {
  assert.deepEqual(amendmentCoverageChanges(compiled), [
    { dimension: "happy-path", claimIds: ["c2"] },
    { dimension: "task-verify", claimIds: ["c1"] },
    { dimension: "task-removal", claimIds: ["c2"] }
  ]);
});

test("the history row keeps field order and optional fields", () => {
  const row = amendmentHistoryRow({
    revision: 2, amendedPacket: { identity: "pkt" }, amendment: {}, compiled,
    invalidation: { affectedTasks: [], affectedProviders: [], preservedProviders: [],
      approval: "carried", proof: {} },
    proofRecovery: null, rebindAudits: [], intakeEffectiveness: null, appliedAt: "t"
  });
  assert.deepEqual(Object.keys(row), ["version", "revision", "identity", "reason", "requirementKeys",
    "revisedRequirementKeys", "removedRequirementKeys", "removedClaims", "invalidatedClaims",
    "taskContractChanges", "removedTasks", "invalidation", "appliedAt"]);
  assert.equal(row.reason, "Agreement expanded during Build");
});

test("the AMENDED report reads as before", () => {
  assert.equal(amendedReport("demo", { contractRevision: 2, waivers: [] }, compiled, null), [
    "AMENDED demo", "  revision: 2", "  invalidated claims: c2, c9 (removed)",
    "  removed tasks: T003 (task-3)",
    "  reopened tasks: T002 (verified again before they count as done)",
    "  proof: re-enter Prove so receipt bindings are recomputed",
    "  requirement delta (covered by the current approval):",
    "  added: r2", "  revised: none", "  removed: none",
    "  proof command: cloop advance demo --through proven",
    "  next: cloop advance demo"
  ].join("\n"));
});

test("moved formatters stay importable from change-lifecycle", () => {
  for (const name of ["formatApprovalDelta", "formatInvalidatedWaivers", "invalidatedWaivers"])
    assert.equal(typeof lifecycle[name], "function", name);
});
