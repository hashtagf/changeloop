// Composition: proof execution through Land and delivery — diagnostics,
// proof and Land runtimes, Apply, the advance coordinator, and pull-request
// delivery. Wiring only; each part is composed in its own module.
import { PROVIDER_CONTRACTS, providerCapability } from "../evidence/provider-catalog.mjs";
import { REVIEW_FORCING_CAPABILITIES, REVIEW_DIVERSITY_CAPABILITIES } from "../evidence/review-policy.mjs";
import { assertLandedProjection } from "../workflow/land/land-verification.mjs";
import { assertSpecApproval } from "../core/user-decisions.mjs";
import { automaticReviewRun, currentDeliveryProof } from "../workflow/advance/advance-recovery.mjs";
import { composeApplyRuntime } from "./apply-wiring.mjs";
import { composeDeliveryRuntimes } from "./delivery-wiring.mjs";
import { composeProofRuntimes } from "./proof-wiring.mjs";
import { createDiagnosticsRuntime } from "../core/diagnostics-runtime.mjs";
import { createLandGrantRuntime } from "../core/land-grant.mjs";
import { createLandRuntime, openSpecCliStatus, recordedDeliveryReferences, targetProjectionObservationValue } from "../workflow/land/land-runtime.mjs";
import { createModelDriftInspector } from "../observability/host-execution-contract.mjs";
import { createProofExecutionRuntime } from "../evidence/proof-execution-runtime.mjs";
import { createPullRequestRuntime } from "../workflow/delivery/pull-request-runtime.mjs";
import { join } from "node:path";
import { lessonsReadiness } from "../observability/lessons-runtime.mjs";
import { projectSetupReadiness } from "../workflow/validation/project-feature-map.mjs";
import { receiptRegressionFinding } from "../evidence/benchmark-runtime.mjs";
import { taskBlocks, taskMetadata } from "../contracts/change-artifacts.mjs";
import { transactionJournals as readTransactionJournals } from "../workflow/transaction/land-journal.mjs";

export function composeLifecycleRuntimes({
  ACCEPTANCE_PROTOCOL_VERSION, ADAPTER_PROTOCOL_VERSION, AGENT_PLAN_SCHEMA_VERSION,
  ATTESTATIONS, ATTESTATION_PROTOCOL_VERSION, AUTHORITY, AUTHORITY_PROTOCOL_VERSION, CHANGES,
  CI_EVIDENCE_PROTOCOL_VERSION, COMMAND_TELEMETRY_SCHEMA_VERSION, CONTEXT_EVENT_SCHEMA_VERSION,
  DELIVERIES, EVIDENCE_VAULT, HANDOFFS, INSTRUCTION_MANIFESTS, LEASES, LOGS,
  METRICS_SCHEMA_VERSION, PACKAGES, PACKET_SCHEMA_VERSION, PLANS, PREVIEWS,
  PROOF_PROTOCOL_VERSION, PROVIDER_PROTOCOL_VERSION, RECEIPTS, RECOVERY, REVIEWS,
  REVIEW_PACKET_SCHEMA_VERSION, REVIEW_PROTOCOL_VERSION, ROOT, RUNTIME, RUNTIME_API_VERSION,
  SEMANTIC_ACCEPTANCE_PROTOCOL_VERSION, SNAPSHOTS, TRANSACTIONS, VERSION, abortAuthority,
  acquireAgentLease, activeChangeLeases, activeChangePath, activeChanges, adapterRuntime,
  advisoryCapabilities, agentDispatchValue, agentPlanValue, approvalPackageLink,
  archivedChangeRelativePath, assertNoDroppedScenarios, authorityPreflight,
  authorityStatusValue, blockWithDecision, canonicalChangedSurface, changePath,
  changedSurfaceIssues, changedSurfaceResolvable, cleanupAppliedSandbox, cleanupChangeLeases,
  cleanupRepositorySandboxes, clearSnapshotCache, collectableExecutionNodes, commandExists,
  commandPhaseRecorder, contractFingerprint, currentChangeRelativePath,
  declaredRepositoryPaths, declaredSurfaceMatcher, deliveredAiAttempts, detachedBlockScope,
  die, directoryHash, discardAgentLease, dispatchAuthority, durableArtifact, evidence,
  evidenceDetectionValue, executionContract, executionFingerprint, executionNodes,
  extendReviewAuthority, externalEvidenceRecovery, fileDigest, forecastCapabilities,
  foundationPolicy, git, gitBuffer, gitHead, handoffReadiness, initializeEvidence,
  inspectSnapshots, isolationInspection, loadRuntime, markBlocked, mergeTaskProgress,
  metricsValue, modelUsageRecorded, now, orphanRuntimeChanges, packetRuntime, parkAgentLease,
  pathInside, pendingTasks, playwrightAvailability, policyCapabilities,
  policyCapabilityTrigger, policyRolloutCapabilities, prepareBuildSandbox,
  projectRootRepositories, proofPath, proofPreflight, proofReadinessValue, proofRunRoot,
  protocolDescriptor, providerConfig, providerRepository, providerWorkspace,
  providerWorkspaceHash, qualityLaneStates, qualityReadiness, readJson, readJsonLines,
  readJsonOrNull, rebindDiffBoundReceipt, rebindReusableReceipt, receiptPath, receiptValidity,
  recordAuthority, recordDeterministicReviewClosure, recordInstructionManifest,
  recordPhaseContext, recordReceipt, recordVerifiedCi, recoverReviewBindings,
  releaseAgentLease, relevantHash, relevantSnapshot, repositoryById, repositoryCatalog,
  requestAuthority, requiredProviders, resetBaseMoveAuthority, resetInfrastructureAuthority,
  reviewAssurancePosture, reviewPolicy, reviewerStatus, runAuthorityReviewer,
  runAuthorityReviewerAsync, runExecutionDag, runProvider, runtimePath, sandboxRuntime,
  saveRuntime, selectedRepositories, stableHash, startRequiredServices, syncClaudeTelemetry,
  syncSandbox, targetEditsFor, telemetryReadiness, topologyIssues, trapFailures,
  trapFailuresAsync, validate, validateArtifact, workspaceIsolationIssues, workspaceManifest,
  writeJson
}) {
  function unresolvedApplyTransactions(id) {
    return readTransactionJournals(TRANSACTIONS, id, readJson).filter((journal) =>
      ["prepared", "applying", "rolling-back", "manual-recovery", "recovering-backup",
        "settling-current"]
        .includes(journal.status));
  }
  const modelDriftInspector = createModelDriftInspector({
    logs: LOGS,
    instructionManifests: INSTRUCTION_MANIFESTS,
    activeChangePath,
    policy: foundationPolicy,
    taskBlocks,
    taskMetadata
  });
  const {
    doctor,
    showChanges,
    showCurrent,
    showProviders,
    usage
  } = createDiagnosticsRuntime({
    root: ROOT,
    unresolvedApplyTransactions,
    deliveryObservation: (_id, state) => ({
      ...targetProjectionObservationValue({ root: ROOT, state, git, fileDigest }),
      references: recordedDeliveryReferences(state)
    }),
    authorityPreflight,
    executionContract,
    version: VERSION,
    runtimeApiVersion: RUNTIME_API_VERSION,
    providerProtocolVersion: PROVIDER_PROTOCOL_VERSION,
    adapterProtocolVersion: ADAPTER_PROTOCOL_VERSION,
    proofProtocolVersion: PROOF_PROTOCOL_VERSION,
    packetSchemaVersion: PACKET_SCHEMA_VERSION,
    agentPlanSchemaVersion: AGENT_PLAN_SCHEMA_VERSION,
    contextEventSchemaVersion: CONTEXT_EVENT_SCHEMA_VERSION,
    metricsSchemaVersion: METRICS_SCHEMA_VERSION,
    commandTelemetrySchemaVersion: COMMAND_TELEMETRY_SCHEMA_VERSION,
    reviewProtocolVersion: REVIEW_PROTOCOL_VERSION,
    acceptanceProtocolVersion: ACCEPTANCE_PROTOCOL_VERSION,
    semanticAcceptanceProtocolVersion: SEMANTIC_ACCEPTANCE_PROTOCOL_VERSION,
    reviewPacketSchemaVersion: REVIEW_PACKET_SCHEMA_VERSION,
    attestationProtocolVersion: ATTESTATION_PROTOCOL_VERSION,
    authorityProtocolVersion: AUTHORITY_PROTOCOL_VERSION,
    ciEvidenceProtocolVersion: CI_EVIDENCE_PROTOCOL_VERSION,
    providerContracts: PROVIDER_CONTRACTS,
    activeChanges,
    orphanRuntimeChanges,
    runtimePath,
    proofPath,
    readJson,
    readJsonOrNull,
    relevantHash,
    protocolDescriptor,
    repositoryCatalog,
    foundationPolicy,
    reviewAssurancePosture,
    isolationInspection,
    openSpecCliStatus,
    loadRuntime,
    evidence,
    selectedRepositories,
    gitHead,
    playwrightAvailability,
    requiredProviders,
    providerConfig,
    receiptValidity,
    providerWorkspace,
    commandExists,
    topologyIssues,
    policyCapabilities,
    policyCapabilityTrigger,
    forecastCapabilities,
    reviewForcingCapabilities: REVIEW_FORCING_CAPABILITIES,
    reviewDiversityCapabilities: REVIEW_DIVERSITY_CAPABILITIES,
    providerCapability,
    reviewerStatus,
    unverifiedDrift: (id) => modelDriftInspector.changeDrift(id).unverified,
    evidenceDetection: evidenceDetectionValue,
    setupReadiness: () => [...qualityReadiness(), ...projectSetupReadiness(ROOT), lessonsReadiness(lessonsValue()),
      pyramidReadinessCommand.readinessRow()],
    fail: die
  });
  const {
    applyTransactionEntry, applyTransactionRoot, changeRolloutGates, cleanupApplyTransaction,
    copyPath, pathIdentity, pathMode, pendingApplyTransactions, proofAudit, prove,
    recoverPendingApply, rollbackApplyTransaction, safeRootPath, saveApplyJournal,
    testDiscrimination, transactionJournalPath, verifyAppliedProjection
  } = composeProofRuntimes({
    LEASES, LOGS, PLANS, PROOF_PROTOCOL_VERSION, ROOT, TRANSACTIONS, activeChangeLeases,
    activeChangePath, advisoryCapabilities, agentPlanValue, blockWithDecision,
    canonicalChangedSurface, changedSurfaceIssues, clearSnapshotCache, contractFingerprint, die,
    directoryHash, evidence, executionFingerprint, fileDigest, git, loadRuntime, now, pathInside,
    pendingTasks, policyRolloutCapabilities, proofPath, proofRunRoot, protocolDescriptor,
    providerConfig, providerRepository, readJson, receiptPath, receiptValidity,
    recordInstructionManifest, relevantHash, relevantSnapshot, requiredProviders, saveRuntime,
    selectedRepositories, stableHash, validate, validateArtifact, writeJson
  });
  const {
    authorityNext,
    guardProofMutation,
    proofAdvance,
    proofCollect,
    proofExecute,
    proofFinalize,
    proofRun
  } = createProofExecutionRuntime({
    markBlocked,
    deliveryProofCurrent: (id) => currentDeliveryProof({
      proofAudit, relevantHash, requiredProviders, receiptValidity, receiptPath, fileDigest
    }, id),
    proofReadinessValue,
    relevantSnapshot,
    loadRuntime,
    saveRuntime,
    now,
    requiredProviders,
    receiptValidity,
    rebindReusableReceipt,
    rebindDiffBoundReceipt,
    executionNodes,
    collectableExecutionNodes,
    startRequiredServices,
    runExecutionDag,
    durableArtifact,
    pendingTasks,
    proofPreflight,
    prove,
    proofAudit,
    readJson,
    writeJson,
    proofPath,
    proofAdvancePath: (id) => join(EVIDENCE_VAULT, id, "proof-advance.json"),
    proofAdvanceLockPath: (id) => join(ROOT, ".foundation", "locks", `proof-${id}.lock`),
    providerCapability,
    providerConfig,
    providerWorkspaceHash,
    reviewPolicy,
    deliveredAiAttempts,
    recordDeterministicReviewClosure,
    authorityStatusValue,
    requestAuthority,
    // Only the exact placeholder-free `authority run` route `advance` would run
    // inline qualifies; it runs under the proof lock the caller already holds.
    startConcurrentReview: (id, _request, command, proofRun = null) => {
      const flags = automaticReviewRun(id, command);
      return flags ? detachedBlockScope.run(() => trapFailuresAsync(() =>
        runAuthorityReviewerAsync(id, { ...flags, ...(proofRun ? { proofRun } : {}) })))
        : null;
    },
    stableHash,
    prepareWorkspace: projectRootRepositories,
    // An unresolvable surface or repository is no verdict: it never blocks.
    testDiscrimination: async (id, workspaceHash) => {
      try {
        if (!changedSurfaceResolvable(id)) return null;
        return await trapFailuresAsync(() => testDiscrimination.evaluateAsync(id, workspaceHash));
      } catch { return null; }
    },
    performanceRegression: (id, provider) =>
      receiptRegressionFinding(provider, readJsonOrNull(receiptPath(id, provider))),
    die
  });
  const guardPublicProofMutation = (command, operation) =>
    (id, ...args) => guardProofMutation(id, command, () => operation(id, ...args));
  const guardedRecordVerifiedCi = guardPublicProofMutation(
    "evidence verify-ci", recordVerifiedCi);
  const guardedRequestAuthority = guardPublicProofMutation(
    "authority request", requestAuthority);
  const guardedDispatchAuthority = guardPublicProofMutation(
    "authority dispatch", dispatchAuthority);
  const guardedRunAuthorityReviewer = guardPublicProofMutation(
    "authority run", runAuthorityReviewer);
  const guardedAbortAuthority = guardPublicProofMutation(
    "authority abort", abortAuthority);
  const guardedResetInfrastructureAuthority = guardPublicProofMutation(
    "authority reset-infra", resetInfrastructureAuthority);
  const guardedExtendReviewAuthority = guardPublicProofMutation(
    "authority extend-review", extendReviewAuthority);
  const guardedResetBaseMoveAuthority = guardPublicProofMutation(
    "authority reset-base-move", resetBaseMoveAuthority);
  const guardedRecordAuthority = guardPublicProofMutation(
    "authority record", recordAuthority);
  const guardedRecordReceipt = guardPublicProofMutation(
    "evidence receipt", recordReceipt);
  const guardedRunProvider = guardPublicProofMutation(
    "evidence run-provider", runProvider);
  const {
    landCheck,
    recoverLand,
    landPlanValue,
    showLandPlan,
    resumeLand,
    assertMultiRepositoryArchiveReady
  } = createLandRuntime({
    root: ROOT,
    transactions: TRANSACTIONS,
    loadRuntime,
    pendingApplyTransactions,
    recoverPendingApply,
    assertNoDroppedScenarios,
    blockingDrift: (...args) => modelDriftInspector.blockingDrift(...args),
    proofAudit,
    proofPath,
    readJson,
    writeJson,
    clearSnapshotCache,
    relevantHash,
    workspaceIsolationIssues,
    targetEditNotices: (state) => targetEditsFor(state).notices,
    reviewPolicy,
    requiredProviders,
    receiptValidity,
    fileDigest,
    receiptPath,
    handoffReadiness,
    telemetryReadiness,
    verifyAppliedProjection,
    selectedRepositories,
    git,
    gitHead,
    stableHash,
    agentPlanValue,
    executionContract,
    now,
    blockWithDecision,
    deliveryObservation: (_id, state) =>
      targetProjectionObservationValue({ root: ROOT, state, git, fileDigest }),
    // One preflight for `land check` and Land: the landed-projection binding
    // first (an uninitialized submodule answers Git for its superproject), then
    // every Apply, repository-delivery, and spec-sync refusal.
    landPreflight: (id, state, options) => {
      assertLandedProjection({ root: ROOT, id, state, fail: die, preflight: true });
      applyRuntime.landPreflight(id, state, options);
    },
    assertApproval: (id, state, options) => assertSpecApproval(ROOT, id, state, options),
    fail: die
  });
  const landGrantRuntime = createLandGrantRuntime({
    transactions: TRANSACTIONS,
    loadRuntime,
    selectedRepositories,
    proofPath,
    readJson,
    writeJson,
    stableHash,
    now,
    landCheck,
    workspaceHash: (id) => relevantHash(id, null, true),
    archiveRecoveryReady: (id) => applyRuntime.archiveRecoveryReady(id)
  });
  const {
    applyRuntime, applySandbox, archive, recordTargetRestore, reviewAttemptRecords
  } = composeApplyRuntime({
    EVIDENCE_VAULT, ROOT, TRANSACTIONS, applyTransactionEntry, applyTransactionRoot,
    archivedChangeRelativePath, assertMultiRepositoryArchiveReady, blockWithDecision, changePath,
    changeRolloutGates, cleanupAppliedSandbox, cleanupApplyTransaction, cleanupChangeLeases,
    cleanupRepositorySandboxes, commandPhaseRecorder, copyPath, currentChangeRelativePath,
    declaredRepositoryPaths, declaredSurfaceMatcher, die, directoryHash, fileDigest,
    foundationPolicy, git, gitBuffer, gitHead, landCheck, landGrantRuntime, loadRuntime,
    mergeTaskProgress, modelUsageRecorded, now, pathIdentity, pathInside, pathMode, proofPath,
    readJson, readJsonOrNull, recoverPendingApply, rollbackApplyTransaction, safeRootPath,
    saveApplyJournal, saveRuntime, selectedRepositories, stableHash, syncClaudeTelemetry,
    telemetryReadiness, transactionJournalPath, verifyAppliedProjection, workspaceManifest,
    writeJson
  });
  const pullRequestRuntime = createPullRequestRuntime({
    root: ROOT,
    deliveriesRoot: DELIVERIES,
    loadRuntime,
    activeChangePath,
    proofPath,
    transactionJournalPath,
    pathIdentity,
    readJson,
    writeJson,
    stableHash,
    git,
    transactions: TRANSACTIONS,
    selectedRepositories,
    foundationPolicy,
    // `/deliver` on a proven change is Land authority: the normal Land route.
    landChange: (id) => advanceThrough(id, "archived"),
    now,
    fail: die
  });
  const {
    abandonChange, advanceLand, advanceThrough, advanceValue, command, lessonsValue,
    pyramidReadinessCommand, sessionLeases, showAdvance, showDeliveryAdvance, showFeatures, showProductProgress,
    showFeedback, showLessons, showOutcomes, undoLand, values
  } = composeDeliveryRuntimes({
    ATTESTATIONS, AUTHORITY, CHANGES, DELIVERIES, EVIDENCE_VAULT, HANDOFFS,
    INSTRUCTION_MANIFESTS, LOGS, PACKAGES, PLANS, PREVIEWS, RECEIPTS, RECOVERY, REVIEWS, ROOT,
    RUNTIME, SNAPSHOTS, TRANSACTIONS, acquireAgentLease, activeChangeLeases, activeChangePath,
    adapterRuntime, agentDispatchValue, agentPlanValue, applyRuntime, applyTransactionRoot,
    approvalPackageLink, archive, authorityNext, authorityPreflight, authorityStatusValue,
    blockWithDecision, canonicalChangedSurface, changePath, changedSurfaceResolvable,
    cleanupAppliedSandbox, cleanupChangeLeases, cleanupRepositorySandboxes, commandPhaseRecorder,
    copyPath, deliveredAiAttempts, die, discardAgentLease, externalEvidenceRecovery, fileDigest,
    git, gitBuffer, gitHead, guardedRunAuthorityReviewer, initializeEvidence, inspectSnapshots,
    landCheck, landGrantRuntime, landPlanValue, loadRuntime, markBlocked, metricsValue, now,
    packetRuntime, parkAgentLease, pathIdentity, pathMode, prepareBuildSandbox,
    projectRootRepositories, proofAdvance, proofAudit, proofReadinessValue, providerConfig,
    pullRequestRuntime, qualityLaneStates, readJson, readJsonLines, readJsonOrNull, receiptPath,
    receiptValidity, recordPhaseContext, recoverLand, recoverReviewBindings, releaseAgentLease,
    relevantHash, repositoryById, requiredProviders, reviewAttemptRecords,
    rollbackApplyTransaction, safeRootPath, sandboxRuntime, saveRuntime, selectedRepositories,
    stableHash, syncSandbox, transactionJournalPath, trapFailures, trapFailuresAsync, writeJson
  });
  return {
    abandonChange, advanceLand, advanceValue, applySandbox, archive, command, doctor,
    guardedAbortAuthority, guardedDispatchAuthority, guardedExtendReviewAuthority,
    guardedRecordAuthority, guardedRecordReceipt, guardedRecordVerifiedCi,
    guardedRequestAuthority, guardedResetBaseMoveAuthority,
    guardedResetInfrastructureAuthority, guardedRunAuthorityReviewer, guardedRunProvider,
    landCheck, landGrantRuntime, proofAdvance, proofAudit, proofCollect, proofExecute,
    proofFinalize, proofRun, prove, pyramidReadinessCommand, recordTargetRestore, recoverLand,
    resumeLand, sessionLeases, showAdvance, showChanges, showCurrent, showDeliveryAdvance,
    showFeatures, showFeedback, showLandPlan, showLessons, showOutcomes, showProductProgress, showProviders,
    undoLand, usage, values
  };
}
