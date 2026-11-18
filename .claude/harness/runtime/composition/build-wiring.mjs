// Composition: Build-phase runtimes — sandboxes, leases, the agent planner
// and dispatcher, authority, approval packages, previews, budgets, and proof
// readiness. Wiring only.
import { EXCLUDED_WORKSPACE_DIRS, SANDBOX_COPY_EXCLUDED_DIRS } from "../core/workspace-policy.mjs";
import { changeWorkTypes } from "../workflow/change/task-change.mjs";
import { copySandboxEntries, sandboxCopyPlan } from "../workflow/sandbox/sandbox-copy.mjs";
import { createAgentDispatchRuntime } from "../workflow/authority/agent-dispatch.mjs";
import { createAgentPlanner } from "../workflow/authority/agent-planning.mjs";
import { createApprovalPackageRuntime } from "../workflow/change/approval-package.mjs";
import { createAuthorityRuntime } from "../workflow/authority/authority-runtime.mjs";
import { createBudgetContinuation } from "../workflow/authority/budget-commands.mjs";
import { createLeaseRuntime } from "../workflow/authority/lease-runtime.mjs";
import { createPreviewRuntime } from "../workflow/prototype/preview-runtime.mjs";
import { createProofReadinessRuntime } from "../evidence/proof-readiness.mjs";
import { createSandboxCleanup } from "../workflow/sandbox/sandbox-cleanup.mjs";
import { createSandboxRuntime } from "../workflow/sandbox/sandbox-runtime.mjs";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { isSessionOwner } from "../workflow/authority/session-lease.mjs";
import { join } from "node:path";
import { providerCapability } from "../evidence/provider-catalog.mjs";
import { rollbackAtomicStart as rollbackAtomicStartOperation } from "../workflow/change/atomic-start-rollback.mjs";
import { targetEditsForState } from "../workflow/transaction/target-edits.mjs";
import { taskBlocks, taskMetadata } from "../contracts/change-artifacts.mjs";
import { taskPacketWasPrecompletedOperation } from "../evidence/proof-runtime.mjs";
import { transactionJournals as readTransactionJournals } from "../workflow/transaction/land-journal.mjs";
import { validateSignedCiEnvelope } from "../evidence/signed-ci.mjs";

export function composeBuildRuntimes({
  AGENT_PLAN_SCHEMA_VERSION, AUTHORITY_PROTOCOL_VERSION, CI_EVIDENCE_PROTOCOL_VERSION,
  EVIDENCE_VAULT, HANDOFFS, LEASES, LOGS, PLANS, PREVIEWS, RECEIPTS, ROOT, RUNTIME,
  TRANSACTIONS, acknowledgeBaseMoveAttempts, acknowledgeInfrastructureAttempts,
  activeChangePath, advisoryCapabilities, applyBudgetDecision, assertReviewDispatchAllowed,
  authorityPreflight, authorityStore, autoReleaseReviewBudget, blockWithDecision, budgetWindow,
  canonicalChangedSurface, canonicalPath, changeArtifactGaps, changePath, claimsForProvider,
  clearSnapshotCache, commandPhaseRecorder, compactStrings, completeReviewAttempt,
  contractFingerprint, declaredSurfaceMatcher, deliveredAiAttempts, die, directoryHash,
  dispatchReviewAttempt, ensureBudgetState, eventUsage, evidence, evidenceDetectionValue,
  executionContract, executionFingerprint, executionNodes, expandList, fileDigest,
  filesystemEntryIdentity, foundationPolicy, git, gitBuffer, gitHead, grantExtraAiWave,
  handoffReadiness, hostAttestation, listCount, loadRuntime, markBlocked, modelForTask, now,
  packetRuntime, pendingTasks, porcelainStatusRecords, preexistingDirty, proofPath,
  providerClaims, providerConfig, providerRepositories, providerRepository, providerWorkspace,
  providerWorkspaceHash, readJson, readJsonLines, receiptPath, receiptValidity,
  recordContextMetric, recordInstructionManifest, recordReceipt, relevantHash, repositoryById,
  repositoryCatalog, repositorySelectionIdsAt, requiredProviders, resolvedAcceptance,
  reviewAttemptByDigest, reviewAttempts, reviewHistoryState, reviewPolicy, reviewerConfig,
  reviewerInstalled, reviewerStatus, runConfiguredReview, runConfiguredReviewAsync,
  runtimePath, saveRuntime, selectedRepositories, serializedJson, snapshotPath, stableHash,
  trapFailures, validate, workspaceManifest, writeJson
}) {
  const {
    reviewPacketValue,
    showPacket
  } = packetRuntime;
  const {
    requestAuthority,
    dispatchAuthority,
    runAuthorityReviewer,
    runAuthorityReviewerAsync,
    abortAuthority,
    resetInfrastructureAuthority,
    extendReviewAuthority,
    recoverReviewBindings,
    resetBaseMoveAuthority,
    authorityStatusValue,
    showAuthorityStatus,
    recordAuthority,
    recordVerifiedCi
  } = createAuthorityRuntime({
    root: ROOT,
    protocolVersion: AUTHORITY_PROTOCOL_VERSION,
    ciEvidenceProtocolVersion: CI_EVIDENCE_PROTOCOL_VERSION,
    authorityStore,
    requiredProviders,
    providerCapability,
    providerConfig,
    reviewPacketValue,
    loadRuntime,
    evidence,
    resolvedAcceptance,
    relevantHash,
    validate,
    pendingTasks,
    claimsForProvider,
    stableHash,
    now,
    reviewPolicy,
    readJson,
    expandList,
    listCount,
    dispatchReviewAttempt,
    completeReviewAttempt,
    reviewHistoryState,
    reviewAttempts,
    deliveredAiAttempts,
    reviewAttemptByDigest,
    assertReviewDispatchAllowed,
    foundationPolicy,
    reviewerConfig,
    reviewerStatus,
    reviewerInstalled,
    runConfiguredReview,
    runConfiguredReviewAsync,
    acknowledgeInfrastructureAttempts,
    grantExtraAiWave,
    acknowledgeBaseMoveAttempts,
    autoReleaseReviewBudget,
    clearSnapshotCache,
    writeJson,
    receiptPath,
    recordReceipt,
    receiptValidity,
    fileDigest,
    providerWorkspaceHash,
    providerRepository,
    providerWorkspace,
    gitHead,
    validateSignedCiEnvelope,
    providerClaims,
    fail: die,
    reviewDiffContext: {
      git,
      pathExists: existsSync,
      readFile: readFileSync,
      readDirectory: readdirSync,
      isDirectory: (path) => lstatSync(path).isDirectory()
    }
  });
  const {
    planValue: agentPlanValue,
    showPlan: showAgentPlan,
    showTask: showAgentTask,
    activeRepositoryConflicts
  } = createAgentPlanner({
    root: ROOT,
    plans: PLANS,
    runtime: RUNTIME,
    schemaVersion: AGENT_PLAN_SCHEMA_VERSION,
    validate,
    loadRuntime,
    policy: foundationPolicy,
    selectedRepositories,
    // Reading *another* change's topology must not end this process when that
    // change's selection is stale — see activeRepositoryConflicts.
    safeSelectedRepositories: (id, state) => {
      try {
        return selectedRepositories(id, state, (message) => { throw new Error(message); });
      } catch { return null; }
    },
    taskBlocks,
    taskMetadata,
    activeChangePath,
    evidence,
    providerCapability,
    claimsForProvider,
    requiredProviders,
    providerConfig,
    providerRepositories,
    authorityPreflight,
    executionContract,
    taskResult: (id, taskId) => {
      const path = join(LEASES, "results", id, `${taskId}.json`);
      return existsSync(path) ? { path, value: readJson(path, null) } : null;
    },
    taskLease: (id, taskId) => {
      const path = join(LEASES, "tasks", id, `${taskId}.json`);
      return existsSync(path) ? readJson(path, null) : null;
    },
    taskPacketWasPrecompleted: (id) => taskPacketWasPrecompletedOperation({
      loadRuntime, activeChangePath, exists: existsSync, fileDigest
    }, id),
    relevantHash,
    contractFingerprint,
    stableHash,
    now,
    readJson,
    writeJson,
    compactStrings,
    serializedJson,
    recordContextMetric,
    recordInstructionManifest,
    modelForTask,
    showPacket,
    recordScheduler: commandPhaseRecorder.scheduler,
    fail: die
  });
  const {
    acquire: acquireAgentLease,
    release: releaseAgentLease,
    discard: discardAgentLease,
    park: parkAgentLease,
    active: activeChangeLeases,
    cleanup: cleanupChangeLeases
  } = createLeaseRuntime({
    leases: LEASES,
    stableHash,
    agentPlanValue,
    policy: foundationPolicy,
    readJson,
    writeJson,
    now,
    observedTaskSurface: (id, task) => {
      const state = loadRuntime(id);
      const repository = repositoryById(id, task.repository || "root", state);
      return canonicalChangedSurface(id, state)
        .filter((row) => row.repositoryId === repository.id)
        .map((row) => {
          const path = join(repository.workspacePath, row.path);
          return {
            path: row.path,
            identity: lstatSync(path, { throwIfNoEntry: false })
              ? filesystemEntryIdentity(path) : "deleted"
          };
        });
    },
    fail: die
  });
  const {
    dispatchValue: agentDispatchValue,
    showDispatch: showAgentDispatch
  } = createAgentDispatchRuntime({
    agentPlanValue,
    // A lease `advance` holds for its session task is not a live worker: the
    // same task is still the frontier and dispatch returns it again.
    activeChangeLeases: (id) => activeChangeLeases(id)
      .filter((lease) => !isSessionOwner(lease.owner)),
    stableHash,
    policy: foundationPolicy,
    serializedJson,
    fail: die
  });

  const targetEditsFor = targetEditsForState.bind(null, {
    root: ROOT, transactions: TRANSACTIONS, readJson,
    transactionJournals: (id) => readTransactionJournals(TRANSACTIONS, id, readJson),
    preexistingDirty, trapFailures,
    canonicalChangedSurface
  });

  const {
    changedSurfaceIssues,
    externalEvidenceRecovery,
    proofPreflight,
    proofReadiness,
    proofReadinessValue,
    readinessBudgetPolicy,
    topologyIssues,
    workspaceIsolationIssues
  } = createProofReadinessRuntime({
    root: ROOT,
    targetEditIssues: (state) => targetEditsFor(state).issues,
    markBlocked,
    evidence,
    loadRuntime,
    taskBlocks,
    activeChangePath,
    taskMetadata,
    canonicalChangedSurface,
    selectedRepositories,
    providerCapability,
    providerConfig,
    providerRepositories,
    requiredProviders,
    git,
    gitHead,
    advisoryCapabilities,
    evidenceDetectionValue,
    validate,
    relevantHash,
    executionNodes,
    pendingTasks,
    handoffReadiness,
    activeChangeLeases,
    activeRepositoryConflicts,
    agentPlanValue,
    saveRuntime,
    authorityPreflight,
    executionContract,
    clearSnapshotCache,
    fail: die
  });
  const { continueBudget, checkpointBudget } = createBudgetContinuation({
    logs: LOGS,
    loadRuntime,
    saveRuntime,
    ensureBudgetState,
    applyBudgetDecision,
    changeArtifactGaps,
    activeChangePath,
    pendingTasks,
    readinessBudgetPolicy,
    proofReadinessValue,
    eventUsage,
    budgetWindow,
    readJsonLines,
    now,
    blockWithDecision,
    fail: die
  });
  const {
    cleanupAppliedSandbox,
    cleanupRepositorySandboxes
  } = createSandboxCleanup({ root: ROOT, canonicalPath, git, now });
  const sandboxRuntime = createSandboxRuntime({
    markBlocked,
    recordScheduler: commandPhaseRecorder.scheduler,
    declaredSurfaceMatcher,
    root: ROOT,
    policy: foundationPolicy,
    excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS,
    sandboxCopyExcludedDirs: SANDBOX_COPY_EXCLUDED_DIRS,
    hostAttestation,
    loadRuntime,
    saveRuntime,
    canonicalPath,
    workspaceManifest,
    directoryHash,
    fileDigest,
    changePath,
    gitHead,
    git,
    gitBuffer,
    porcelainStatusRecords,
    selectedRepositories,
    repositoryCatalog,
    cleanupRepositorySandboxes,
    cleanupAppliedSandbox,
    clearSnapshotCache,
    validate,
    repositorySelectionIdsAt,
    contractFingerprint,
    executionFingerprint,
    taskBlocks,
    proofPath,
    proofAdvancePath: (id) => join(EVIDENCE_VAULT, id, "proof-advance.json"),
    relevantHash,
    now,
    fail: die
  });
  const {
    createChallenge: createAttestationChallenge,
    inspect: isolationInspection,
    showInspection: showSandboxInspection,
    create: createSandbox,
    prepareBuild: prepareBuildSandbox,
    mergeTaskProgress,
    sync: syncSandbox
  } = sandboxRuntime;
  // Root checks consume declared nested repositories through their root path.
  // Every exec, task check, and proof run first brings those paths current, and
  // reinstalls Build dependencies whose manifest or lockfile changed since setup.
  function projectRootRepositories(id) {
    const projected = sandboxRuntime.projectRepositories(id);
    sandboxRuntime.refreshChangedDependencies(id);
    return projected;
  }
  const rollbackAtomicStart = rollbackAtomicStartOperation.bind(null, {
    root: ROOT, readJson, runtimePath, changePath, snapshotPath, trapFailures,
    selectedRepositories, cleanupRepositorySandboxes, cleanupAppliedSandbox,
    ownedPaths: (id) => [join(RECEIPTS, id), join(EVIDENCE_VAULT, id), join(HANDOFFS, id)]
  });
  const approvalPackage = createApprovalPackageRuntime({
    root: ROOT,
    runtimeDir: RUNTIME,
    previewsDir: PREVIEWS,
    receiptsDir: RECEIPTS,
    loadRuntime,
    saveRuntime,
    activeChangePath,
    changeWorkTypes,
    evidence,
    providerCapability,
    receiptValidity,
    fail: die,
    trap: trapFailures
  });
  // The approval page is a file the prototype skill writes; the harness only
  // reads it (and records its digest), so the link never writes anything.
  const approvalPackageLink = (id) => trapFailures(() => approvalPackage.approvalPageLink(id));
  const recordPrototypeSync = (id) => trapFailures(() => approvalPackage.recordPrototypeSync(id));
  const preview = createPreviewRuntime({
    root: ROOT,
    runtimeDir: RUNTIME,
    previewsDir: PREVIEWS,
    loadRuntime,
    evidence,
    providerCapability,
    // A preview copy never carries Git or harness state: it is a scratch tree.
    copyWorkspace: (source, destination) => copySandboxEntries({
      root: source, requestedPath: destination, fail: die,
      plan: sandboxCopyPlan({
        root: source, carriesGit: false, git,
        sandboxCopyExcludedDirs: SANDBOX_COPY_EXCLUDED_DIRS,
        excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS
      })
    }),
    now,
    fail: die
  });
  return {
    abortAuthority, acquireAgentLease, activeChangeLeases, agentDispatchValue, agentPlanValue,
    approvalPackage, approvalPackageLink, authorityStatusValue, changedSurfaceIssues,
    checkpointBudget, cleanupAppliedSandbox, cleanupChangeLeases, cleanupRepositorySandboxes,
    continueBudget, createAttestationChallenge, createSandbox, discardAgentLease,
    dispatchAuthority, extendReviewAuthority, externalEvidenceRecovery, isolationInspection,
    mergeTaskProgress, parkAgentLease, prepareBuildSandbox, preview, projectRootRepositories,
    proofPreflight, proofReadiness, proofReadinessValue, recordAuthority, recordPrototypeSync,
    recordVerifiedCi, recoverReviewBindings, releaseAgentLease, requestAuthority,
    resetBaseMoveAuthority, resetInfrastructureAuthority, rollbackAtomicStart,
    runAuthorityReviewer, runAuthorityReviewerAsync, sandboxRuntime, showAgentDispatch,
    showAgentPlan, showAgentTask, showAuthorityStatus, showPacket, showSandboxInspection,
    syncSandbox, targetEditsFor, topologyIssues, workspaceIsolationIssues
  };
}
