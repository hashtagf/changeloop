// Composition: the change state store and the records it keeps beside each
// change — review attempts and protocol, the authority store, host
// attestation, metrics, and budgets. Wiring only.
import { EXCLUDED_WORKSPACE_DIRS } from "../core/workspace-policy.mjs";
import { createAuthorityStore } from "../workflow/authority/authority.mjs";
import { createBudgetReporter } from "../workflow/authority/budget-commands.mjs";
import { createBudgetRuntime } from "../workflow/authority/budget.mjs";
import { createHostAttestationRuntime } from "../evidence/attestation.mjs";
import { createMetricsRuntime } from "../observability/metrics-runtime.mjs";
import { createReviewAttemptStore } from "../evidence/review-attempt-store.mjs";
import { createReviewProtocol } from "../evidence/review-protocol.mjs";
import { createStateRuntime } from "../core/state-runtime.mjs";
import { taskBlocks, taskMetadata } from "../contracts/change-artifacts.mjs";

export function composeStateRuntimes({
  ATTESTATIONS, ATTESTATION_PROTOCOL_VERSION, AUTHORITY, AUTHORITY_PROTOCOL_VERSION, CHANGES,
  EVIDENCE_VAULT, INSTRUCTION_MANIFESTS, LOGS, METRICS_SCHEMA_VERSION, RECEIPTS, ROOT, RUNTIME,
  SNAPSHOTS, canonicalPath, die, foundationPolicy, now, readJson, readJsonLines,
  readJsonLinesTolerant, sourceCohort, writeJson
}) {
  const stateRuntime = createStateRuntime({
    root: ROOT,
    runtime: RUNTIME,
    changes: CHANGES,
    receipts: RECEIPTS,
    evidenceVault: EVIDENCE_VAULT,
    snapshots: SNAPSHOTS,
    excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS,
    readJson,
    writeJson,
    canonicalPath,
    now,
    fail: die
  });
  const {
    runtimePath,
    changePath,
    receiptPath,
    proofPath,
    proofRunRoot,
    snapshotPath,
    currentChangeRelativePath,
    isCurrentChangePath,
    activeChangePath,
    archivedChangeRelativePath,
    slugify,
    loadRuntime,
    saveRuntime,
    activeChanges,
    orphanRuntimeChanges,
    walk,
    filesystemEntryIdentity,
    directoryHash,
    stableHash,
    serializedJson,
    compactList,
    compactStrings,
    expandList,
    listCount,
    fileDigest,
    singleRelevantSnapshot,
    inspectSnapshots,
    writeSnapshot,
    clearSnapshotCache,
    registerPolicyCacheClearer,
    workspaceManifest,
    declaredSurfaceMatcher,
    preexistingDirty,
    porcelainStatusRecords,
    git,
    gitBuffer,
    gitHead
  } = stateRuntime;
  const {
    flagValues,
    provenanceResult: reviewProvenanceResult,
    receiptBinding: reviewReceiptBinding,
    subjectProvenance,
    attemptIsValid: reviewAttemptIsValid
  } = createReviewProtocol({ stableHash, fail: die });
  const {
    reviewHistoryState,
    reviewAttemptByDigest,
    assertReviewDispatchAllowed,
    dispatchReviewAttempt,
    completeReviewAttempt,
    recordRepairClosureAttempt,
    reviewAttempts,
    deliveredAiAttempts,
    acknowledgeInfrastructureAttempts,
    grantExtraAiWave,
    acknowledgeBaseMoveAttempts,
    autoReleaseReviewBudget
  } = createReviewAttemptStore({
    receiptsRoot: RECEIPTS,
    evidenceVault: EVIDENCE_VAULT,
    readJson,
    writeJson,
    loadRuntime,
    saveRuntime,
    stableHash,
    reviewReceiptBinding,
    now,
    fail: die
  });
  const hostAttestation = createHostAttestationRuntime({
    root: ROOT,
    attestations: ATTESTATIONS,
    protocolVersion: ATTESTATION_PROTOCOL_VERSION,
    loadRuntime,
    changePath,
    directoryHash,
    stableHash,
    readJson,
    writeJson,
    now
  });
  const authorityStore = createAuthorityStore({
    root: AUTHORITY,
    protocolVersion: AUTHORITY_PROTOCOL_VERSION,
    readJson,
    writeJson,
    now
  });
  const {
    budgetWindow,
    initialBudget,
    ensureBudgetState,
    calibrationForState,
    budgetDecision,
    applyBudgetDecision,
    eventUsage,
    synchronizeBudgetUsage
  } = createBudgetRuntime({ policy: foundationPolicy, now });
  const { reportBudget } = createBudgetReporter({
    applyBudgetDecision,
    watchdogEnabled: () => foundationPolicy().execution.budgetWatchdog === true
  });
  const { metricsValue, showMetrics } = createMetricsRuntime({
    logs: LOGS,
    receipts: RECEIPTS,
    readJson,
    readJsonLines,
    readJsonLinesTolerant,
    loadRuntime,
    ensureBudgetState,
    budgetDecision,
    calibrationForState,
    instructionManifests: INSTRUCTION_MANIFESTS,
    activeChangePath,
    policy: foundationPolicy,
    taskBlocks,
    taskMetadata,
    metricsSchemaVersion: Number(METRICS_SCHEMA_VERSION),
    sourceCohort
  });
  return {
    acknowledgeBaseMoveAttempts, acknowledgeInfrastructureAttempts, activeChangePath,
    activeChanges, applyBudgetDecision, archivedChangeRelativePath,
    assertReviewDispatchAllowed, authorityStore, autoReleaseReviewBudget, budgetDecision,
    budgetWindow, changePath, clearSnapshotCache, compactList, compactStrings,
    completeReviewAttempt, currentChangeRelativePath, declaredSurfaceMatcher,
    deliveredAiAttempts, directoryHash, dispatchReviewAttempt, ensureBudgetState, eventUsage,
    expandList, fileDigest, filesystemEntryIdentity, flagValues, git, gitBuffer, gitHead,
    grantExtraAiWave, hostAttestation, initialBudget, inspectSnapshots, isCurrentChangePath,
    listCount, loadRuntime, metricsValue, orphanRuntimeChanges, porcelainStatusRecords,
    preexistingDirty, proofPath, proofRunRoot, receiptPath, recordRepairClosureAttempt,
    registerPolicyCacheClearer, reportBudget, reviewAttemptByDigest, reviewAttemptIsValid,
    reviewAttempts, reviewHistoryState, reviewProvenanceResult, runtimePath, saveRuntime,
    serializedJson, showMetrics, singleRelevantSnapshot, slugify, snapshotPath, stableHash,
    subjectProvenance, synchronizeBudgetUsage, walk, workspaceManifest, writeSnapshot
  };
}
