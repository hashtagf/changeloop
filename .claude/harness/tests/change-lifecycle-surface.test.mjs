// Characterization: change-lifecycle's public surface (module exports and the
// factory's command set) stays identical while its internals are split into
// focused modules. A deliberate surface change updates these lists.
import assert from "node:assert/strict";
import test from "node:test";
import * as lifecycle from "../runtime/workflow/change/change-lifecycle.mjs";

const MODULE_EXPORTS = [
  "apiContractErrorIssues", "approvalPackageLine", "atomicStartPreflight",
  "createChangeLifecycle", "documentSectionInvalidation", "draftBullets",
  "draftChangeId", "draftDomainRows", "draftNeedsDesign",
  "draftRequirementFingerprints", "formatApprovalDelta",
  "formatInvalidatedWaivers", "groupDraftSpecs", "initialChangeState",
  "invalidatedWaivers", "materializeChangeTemplates", "materializeDraftSpecs",
  "mergeApprovalDelta", "pathRiskNoteLine", "priorChangeResidue",
  "proposalOpenQuestions", "proposedDecision", "renderDecisionOption",
  "renderDraftDecisions", "renderDraftDesign", "renderDraftProposal",
  "renderDraftSpecDocument", "renderDraftTask", "renderDraftTasks",
  "renderProposedDecisions", "renderRapidDecisions", "repositoryDraftGuidance",
  "requirementDelta", "requirementFingerprints", "retiredDraftIssue",
  "reviewRouteLabel", "riskSignalValues", "scratchNoteLine",
  "sectionsOnlyAmendment", "semanticDraftKeepsDesign",
  "settleAbandonedReviewResidue", "synchronizeProposalClassification",
  "v5QualityGrounding"
];

const FACTORY_COMMANDS = [
  "amendChange", "amendmentTemplate", "createChange", "inspectAmendment",
  "inspectDraft", "inspectRevision", "instantiate", "loadDraft",
  "materializeDraft", "openQuestionsDecision", "rapidStartTemplate",
  "resolveChange", "reviseChange", "startAtomic", "templateDir"
];

const DEPENDENCIES = [
  "root", "policy", "approvalPackageLink", "recordPrototypeSync", "approvalLanes", "securityTerms",
  "fail", "pathInside", "readJson", "writeJson", "slugify", "changePath", "activeChangePath",
  "loadRuntime", "saveRuntime", "setOperationChangeId", "initialBudget", "git", "gitHead",
  "preexistingDirty", "now", "bindClaudeSession", "validate", "measureStage", "receiptPath",
  "receiptValidity", "contractFingerprint", "requiredProviders", "providerConfig",
  "claimsForProvider", "providerWorkspaceHash", "providerInputIdentity", "relevantHash",
  "stableHash", "trapFailures", "rollbackStart", "repositoryCatalog", "decisionGateNotice"
];

test("change-lifecycle module exports are unchanged", () => {
  assert.deepEqual(Object.keys(lifecycle).sort(), MODULE_EXPORTS);
});

test("createChangeLifecycle returns the same command set", () => {
  const deps = Object.fromEntries(DEPENDENCIES.map((name) =>
    [name, name === "root" ? "/nonexistent" : name === "policy" ? {} : () => {}]));
  const commands = lifecycle.createChangeLifecycle(deps);
  assert.deepEqual(Object.keys(commands).sort(), FACTORY_COMMANDS);
  for (const name of FACTORY_COMMANDS) assert.equal(typeof commands[name], "function", name);
});
