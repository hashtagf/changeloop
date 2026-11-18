#!/usr/bin/env node
// First: installs the mutation observer behind the Git read memo before any
// other module can capture an unobserved fs or child_process function.
import "./runtime/core/git-read-memo.mjs";
import { assertSpecApproval } from "./runtime/core/user-decisions.mjs";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createExecRuntime } from "./runtime/observability/exec-runtime.mjs";
import { routeForState } from "./runtime/workflow/change/approval-package.mjs";
import { createCommandPhaseRecorder } from "./runtime/observability/command-telemetry.mjs";
import { createJsonlReader } from "./runtime/observability/telemetry.mjs";
import { createFlagParser } from "./runtime/core/cli-flags.mjs";
import {
  phaseForCommand, telemetryPhaseForCommand
} from "./runtime/core/lifecycle-phase.mjs";
import { createProcessRuntime, serviceWorkspace } from "./runtime/core/process-runtime.mjs";
import { advanceFailureAction } from "./runtime/workflow/advance/advance-envelope.mjs";

import { createPacketRuntime } from "./runtime/workflow/packet/packet-runtime.mjs";
import { taskBlocks, taskMetadata } from "./runtime/contracts/change-artifacts.mjs";
import { createChangeLifecycle } from "./runtime/workflow/change/change-lifecycle.mjs";
import { amendTaskVerifyOperation } from "./runtime/workflow/draft/amendment-verify.mjs";
import { createInvestigationRuntime } from "./runtime/workflow/investigation/investigation-runtime.mjs";

import { authorityPreflightValue } from "./runtime/core/authority-policy.mjs";
import { compileExecutionContractValue } from "./runtime/core/execution-contract.mjs";
import { createChangeValidationRuntime } from "./runtime/workflow/change/change-validation.mjs";
import { routeRuntimeCommand } from "./runtime/core/cli-router.mjs";
import { impliedChangeValues } from "./runtime/core/implied-change.mjs";
import { createReceiptRuntime } from "./runtime/evidence/receipt-runtime.mjs";
import { createReceiptValidity } from "./runtime/evidence/receipt-validity.mjs";
import { reviewRulesHash } from "./runtime/evidence/configured-reviewer.mjs";
import { changeWorkTypes } from "./runtime/workflow/change/task-change.mjs";
import { createConfiguredReviewerRuntime } from "./runtime/evidence/configured-reviewer.mjs";
import { createOperationState } from "./runtime/composition/operation-state.mjs";
import { createBlockedDecision, createDetachedBlockScope } from "./runtime/core/blocked-decision.mjs";
import { prependFoundationToolPath } from "./runtime/core/tool-preparation.mjs";
import { RUNTIME_MODULE_API } from "./runtime/version.mjs";
import { createBootstrap } from "./runtime/composition/bootstrap.mjs";
import { INPUT_MODES, PROVIDERS, providerCapability } from "./runtime/evidence/provider-catalog.mjs";
import { SECURITY_TERMS } from "./runtime/workflow/authority/security-policy.mjs";

import { composeBuildRuntimes } from "./runtime/composition/build-wiring.mjs";
import { composeEvidenceExecution } from "./runtime/composition/evidence-execution-wiring.mjs";
import { composeStateRuntimes } from "./runtime/composition/state-wiring.mjs";
import { composeEnvironment } from "./runtime/composition/environment-wiring.mjs";
import { composeLifecycleRuntimes } from "./runtime/composition/lifecycle-wiring.mjs";
import { composeEvidenceState } from "./runtime/composition/evidence-state-wiring.mjs";

const VERSION = "3.7.5";
const RUNTIME_API_VERSION = "42";
// Checked here, at load, rather than only inside `doctor`: a torn install —
// this file from one revision, runtime/** from another — otherwise passed
// every command up to `archive` and then threw partway through Land.
if (RUNTIME_MODULE_API !== RUNTIME_API_VERSION) {
  console.error(
    `BLOCKED: harness entrypoint API ${RUNTIME_API_VERSION} does not match ` +
    `runtime modules API ${RUNTIME_MODULE_API}; the installed .claude/harness ` +
    "is a mixture of two revisions. Reinstall it with 'cloop init <project>'.");
  process.exit(1);
}
const PROVIDER_PROTOCOL_VERSION = "13";
const ADAPTER_PROTOCOL_VERSION = "7";
const PROOF_PROTOCOL_VERSION = "7";
const PACKET_SCHEMA_VERSION = "12";
const AGENT_PLAN_SCHEMA_VERSION = "6";
const CONTEXT_EVENT_SCHEMA_VERSION = "2";
const METRICS_SCHEMA_VERSION = "10";
const COMMAND_TELEMETRY_SCHEMA_VERSION = "5";
const REVIEW_PROTOCOL_VERSION = "4";
const ACCEPTANCE_PROTOCOL_VERSION = "2";
const SEMANTIC_ACCEPTANCE_PROTOCOL_VERSION = "1";
const REVIEW_PACKET_SCHEMA_VERSION = "7";
const ATTESTATION_PROTOCOL_VERSION = "1";
const AUTHORITY_PROTOCOL_VERSION = "2";
const CI_EVIDENCE_PROTOCOL_VERSION = "1";
const QUALITY_CAPABILITIES_PROTOCOL_VERSION = "1";
const CRAP_PROTOCOL_VERSION = "1";
const AUTOMATED_MUTATION_PROTOCOL_VERSION = "1";
// Work that runs beside an operation (the concurrent review in `advance`)
// records its own refusal in this scope instead of blocking the whole process.
const detachedBlockScope = createDetachedBlockScope();
const operation = createOperationState({ detachedBlockScope });
const { markBlocked, die, trapFailures, trapFailuresAsync } = operation;
const { parseFlags, parseStrictCommandFlags } = createFlagParser({ fail: die });
const { blockWithDecision } = createBlockedDecision({ fail: die });

const {
  root: ROOT,
  paths: {
    runtime: RUNTIME, receipts: RECEIPTS, logs: LOGS, evidenceVault: EVIDENCE_VAULT,
    snapshots: SNAPSHOTS, transactions: TRANSACTIONS, plans: PLANS, leases: LEASES,
    prototypes: PROTOTYPES, packages: PACKAGES, previews: PREVIEWS,
    attestations: ATTESTATIONS, authority: AUTHORITY,
    handoffs: HANDOFFS, instructionManifests: INSTRUCTION_MANIFESTS,
    recovery: RECOVERY, deliveries: DELIVERIES, changes: CHANGES, reviews: REVIEWS
  },
  readJson, readJsonOrNull, writeJson, canonicalPath, pathInside, now
} = createBootstrap({
  start: process.cwd(),
  pinned: process.env.CLAUDE_FOUNDATION_PROJECT,
  harness: dirname(fileURLToPath(import.meta.url)),
  fail: die,
  // Root discovery runs before operation telemetry exists, so `die` cannot.
  failRoot: (message) => { console.error(`BLOCKED: ${message}`); process.exit(1); },
  warn: console.error
});

// Project-local tools are machine-owned and survive between lifecycle
// invocations. Put them on PATH before any validation or Land check probes a
// binary; the user's global environment is never modified.
prependFoundationToolPath(ROOT);

const { readJsonLines, readJsonLinesTolerant } = createJsonlReader({
  root: ROOT,
  fail: die
});

// Commands that only read. They are observed in inspections.jsonl so the
// benchmark can measure agent probing, but never enter operations.jsonl:
// `showMetrics` treats that ledger as work the change performed for rework and
// phase accounting. Archived evidence remains immutable and records neither.
// Lifecycle commands stay: metrics derives rework and typed-stop signals from
// their rows, so proof-* and land-* are measurements, not inspections.
const READ_ONLY_OPERATIONS = new Set([
  "metrics", "feedback", "outcomes", "lessons", "features", "hash", "changes", "current", "providers", "repos", "models", "describe",
  "package", "budget-checkpoint",
  "packet", "agent-task", "audit-change", "authority-status",
  "handoff-list", "handoff-status", "handoff-packet", "evidence-detect", "evidence-doctor",
  "doctor", "quality-discover", "quality-doctor", "quality-report", "quality-readiness",
  "api-version", "version"
]);
const commandPhaseRecorder = createCommandPhaseRecorder(() => ({
    telemetryDisabled: process.env.FOUNDATION_TELEMETRY === "0",
    telemetryDebug: process.env.FOUNDATION_TELEMETRY_DEBUG === "1",
    changeId: operation.state.changeId,
    operationName: operation.state.name,
    operationPhase: operation.state.phase,
    operationStatusAtStart: operation.state.statusAtStart,
    operationInputFingerprint: operation.state.fingerprint,
    publicOperation: process.env.FOUNDATION_PUBLIC_OPERATION,
    blocked: operation.state.blocked,
    blocker: operation.state.blocker,
    operationStartedAt: operation.state.startedAt,
    readOnlyOperations: READ_ONLY_OPERATIONS,
    logs: LOGS,
    mkdir: mkdirSync,
    append: appendFileSync,
    now,
    timestamp: Date.now,
    warn: console.error
}));
const {
  assertRegisteredRuntimeCommand, commandExists, describeCommand, foundationPolicy,
  maxParallelProviders, playwrightAvailability, protocolDescriptor, recordInstructionManifest,
  reviewAssurancePosture, sourceCohort
} = composeEnvironment({
  ACCEPTANCE_PROTOCOL_VERSION, ADAPTER_PROTOCOL_VERSION, AGENT_PLAN_SCHEMA_VERSION,
  ATTESTATION_PROTOCOL_VERSION, AUTHORITY_PROTOCOL_VERSION,
  AUTOMATED_MUTATION_PROTOCOL_VERSION, CI_EVIDENCE_PROTOCOL_VERSION,
  COMMAND_TELEMETRY_SCHEMA_VERSION, CONTEXT_EVENT_SCHEMA_VERSION, CRAP_PROTOCOL_VERSION,
  INSTRUCTION_MANIFESTS, METRICS_SCHEMA_VERSION, PACKET_SCHEMA_VERSION, PROOF_PROTOCOL_VERSION,
  PROVIDER_PROTOCOL_VERSION, QUALITY_CAPABILITIES_PROTOCOL_VERSION,
  REVIEW_PACKET_SCHEMA_VERSION, REVIEW_PROTOCOL_VERSION, ROOT, RUNTIME_API_VERSION,
  SEMANTIC_ACCEPTANCE_PROTOCOL_VERSION, VERSION, commandPhaseRecorder, die, readJson,
  writeJson
});
const {
  reviewerConfig,
  reviewerStatus,
  reviewerInstalled,
  runReview: runConfiguredReview,
  runReviewAsync: runConfiguredReviewAsync
} = createConfiguredReviewerRuntime({
  root: ROOT,
  foundationPolicy,
  commandExists,
  now,
  recordUsage: (id, rows) => appendTelemetryRows(id, rows, "configured-reviewer", {
    operationId: "prove"
  }),
  fail: die
});
const {
  acknowledgeBaseMoveAttempts, acknowledgeInfrastructureAttempts, activeChangePath,
  activeChanges, applyBudgetDecision, archivedChangeRelativePath, assertReviewDispatchAllowed,
  authorityStore, autoReleaseReviewBudget, budgetDecision, budgetWindow, changePath,
  clearSnapshotCache, compactList, compactStrings, completeReviewAttempt,
  currentChangeRelativePath, declaredSurfaceMatcher, deliveredAiAttempts, directoryHash,
  dispatchReviewAttempt, ensureBudgetState, eventUsage, expandList, fileDigest,
  filesystemEntryIdentity, flagValues, git, gitBuffer, gitHead, grantExtraAiWave,
  hostAttestation, initialBudget, inspectSnapshots, isCurrentChangePath, listCount,
  loadRuntime, metricsValue, orphanRuntimeChanges, porcelainStatusRecords, preexistingDirty,
  proofPath, proofRunRoot, receiptPath, recordRepairClosureAttempt, registerPolicyCacheClearer,
  reportBudget, reviewAttemptByDigest, reviewAttemptIsValid, reviewAttempts,
  reviewHistoryState, reviewProvenanceResult, runtimePath, saveRuntime, serializedJson,
  showMetrics, singleRelevantSnapshot, slugify, snapshotPath, stableHash, subjectProvenance,
  synchronizeBudgetUsage, walk, workspaceManifest, writeSnapshot
} = composeStateRuntimes({
  ATTESTATIONS, ATTESTATION_PROTOCOL_VERSION, AUTHORITY, AUTHORITY_PROTOCOL_VERSION, CHANGES,
  EVIDENCE_VAULT, INSTRUCTION_MANIFESTS, LOGS, METRICS_SCHEMA_VERSION, RECEIPTS, ROOT, RUNTIME,
  SNAPSHOTS, canonicalPath, die, foundationPolicy, now, readJson, readJsonLines,
  readJsonLinesTolerant, sourceCohort, writeJson
});
const { execObserved } = createExecRuntime({
  assertApproval: (id, state) => assertSpecApproval(ROOT, id, state),
  root: ROOT,
  // Task repositories decide which sandbox an exec child starts in.
  changeTasks: (id, state) => {
    const path = join(activeChangePath(id, state), "tasks.md");
    return existsSync(path)
      ? taskBlocks(readFileSync(path, "utf8")).filter((task) => task.id).map(taskMetadata)
      : [];
  },
  logs: LOGS,
  loadRuntime,
  now,
  prepareWorkspace: (id) => projectRootRepositories(id),
  fail: die
});
const {
  adapterFingerprint, appendTelemetryRows, bindClaudeSession, canonicalChangedSurface,
  changedSurfaceResolvable, claimsForProvider, contractFingerprint, declaredRepositoryPaths,
  durableArtifact, environmentDescriptor, evidence, executionFingerprint, forecastCapabilities,
  handoffContract, handoffReadiness, importHostExecution, importTelemetry, initializeQuality,
  modelUsageRecorded, policyCapabilities, policyCapabilityTrigger, policyProviderSetupActions,
  policyRolloutCapabilities, prepareClaudeTelemetry, providerClaims, providerConfig,
  providerInputIdentity, providerRepositories, providerRepository, providerWorkspace,
  providerWorkspaceHash, qualityDoctor, qualityLaneStates, qualityReadiness, rawExecution,
  receiptPrototypeEvidence, recordContextMetric, recordEvent, recordHandoff,
  recordPhaseContext, rejectPrototypeEvidenceInputs, relevantHash, relevantSnapshot,
  repositoryById, repositoryCatalog, repositorySelectionIdsAt, resolvedAcceptance,
  reviewPolicy, runQuality, scopedReviewClaims, selectedRepositories, showHandoffPacket,
  showHandoffStatus, showQualityDebt, showQualityDiscovery, showQualityReport,
  showRepositories, syncClaudeTelemetry, telemetryReadiness, updateQualityBaseline,
  validateArtifact
} = composeEvidenceState({
  ADAPTER_PROTOCOL_VERSION, CONTEXT_EVENT_SCHEMA_VERSION, EVIDENCE_VAULT, HANDOFFS, LOGS,
  PROTOTYPES, PROVIDER_PROTOCOL_VERSION, ROOT, activeChangePath, canonicalPath,
  declaredSurfaceMatcher, die, fileDigest, filesystemEntryIdentity, foundationPolicy, git,
  gitHead, isCurrentChangePath, loadRuntime, now, parseFlags, pathInside,
  porcelainStatusRecords, proofRunRoot, readJson, readJsonLines, readJsonLinesTolerant,
  registerPolicyCacheClearer, reportBudget, runtimePath, saveRuntime, singleRelevantSnapshot,
  slugify, snapshotPath, stableHash, synchronizeBudgetUsage, trapFailures, workspaceManifest,
  writeJson, writeSnapshot
});
const { receiptValidity } = createReceiptValidity({
  evidenceVault: EVIDENCE_VAULT,
  providerProtocolVersion: PROVIDER_PROTOCOL_VERSION,
  adapterProtocolVersion: ADAPTER_PROTOCOL_VERSION,
  reviewProtocolVersion: REVIEW_PROTOCOL_VERSION,
  acceptanceProtocolVersion: ACCEPTANCE_PROTOCOL_VERSION,
  receiptPath,
  readJson,
  receiptPrototypeEvidence,
  contractFingerprint,
  providerConfig,
  providerCapability,
  reviewProvenanceResult,
  reviewPolicy,
  reviewAttemptByDigest,
  reviewAttemptIsValid,
  resolvedAcceptance,
  claimsForProvider,
  stableHash,
  adapterFingerprint,
  providerWorkspaceHash,
  providerInputIdentity,
  validateArtifact,
  relevantHash,
  relevantSnapshot,
  // Late-bound: the sandbox runtime is composed after evidence, and receipt
  // validity only consults diff identity at command time, long after both.
  changeDiffIdentity: (id, state) => sandboxRuntime.changeDiffIdentity(id, state),
  // The sync's record of its own clean diff rewrites (landed replay, carried
  // target edit, moved base): a review verdict rebinds across them.
  identityBridges: (id) => loadRuntime(id)?.workspace?.identityBridges || [],
  // The control project's advisory REVIEW.md, bound by every review verdict.
  currentReviewRulesHash: () => reviewRulesHash(ROOT)
});
const changeValidationRuntime = createChangeValidationRuntime({
  policyProviderSetupActions,
  relevantHash,
  markBlocked,
  root: ROOT,
  activeChangePath,
  changePath,
  walk,
  loadRuntime,
  saveRuntime,
  evidence,
  selectedRepositories,
  providerCapability,
  providerConfig,
  resolvedAcceptance,
  reviewPolicy,
  reviewAssurancePosture,
  policyCapabilities,
  policyCapabilityTrigger,
  changedSurfaceResolvable,
  forecastCapabilities,
  rawExecution,
  handoffContract,
  contractFingerprint,
  commandExists,
  stableHash,
  fileDigest,
  pathInside,
  knownProviders: PROVIDERS,
  writeJson,
  now,
  foundationPolicy,
  authorityPreflight,
  executionContract,
  fail: die
});
const {
  advisoryCapabilities,
  assertNoDroppedScenarios,
  changeArtifactGaps,
  groundingValue,
  evidenceDetectionValue,
  initializeEvidence,
  pendingTasks,
  requiredProviders,
  showEvidenceDetection,
  showEvidenceDoctor,
  showTraceabilityAudit,
  validate,
  waiveGate
} = changeValidationRuntime;

function authorityPreflight(id) {
  const state = loadRuntime(id);
  const contract = evidence(id, activeChangePath(id, state));
  return authorityPreflightValue({
    changeId: id,
    state,
    reviewRisk: changedSurfaceResolvable(id, state)
      ? reviewPolicy(id, state, contract)
      : null,
    providers: Object.keys(contract.providers || {}),
    providerConfig: (provider) => providerConfig(id, provider),
    providerCapability,
    acceptance: resolvedAcceptance(id, state, contract),
    grounding: {
      required: state.groundingRequired === true,
      locked: Boolean(state.groundingDigest),
      reopenPending: Boolean(state.groundingReopenPending)
    },
    handoffs: handoffReadiness(id, { state })
  });
}

function executionContract(id) {
  const state = loadRuntime(id);
  const contract = evidence(id, activeChangePath(id, state));
  const resolvable = changedSurfaceResolvable(id, state);
  const review = resolvable ? reviewPolicy(id, state, contract) : null;
  const configured = Object.keys(contract.providers || {});
  const providerNames = resolvable ? requiredProviders(id) : configured;
  let repositories = [];
  try { repositories = selectedRepositories(id, state); } catch { repositories = []; }
  const handoffs = handoffReadiness(id, { state });
  return compileExecutionContractValue({
    changeId: id,
    state,
    review,
    providers: providerNames,
    providerCapabilities: Object.fromEntries(providerNames.map((provider) => [
      provider, providerCapability(provider, providerConfig(id, provider))
    ])),
    authority: authorityPreflight(id),
    repositories,
    handoffs
  });
}
const { runCommand, startServiceSession } = createProcessRuntime({
  root: ROOT,
  logs: LOGS,
  now,
  resolveServiceCwd: serviceWorkspace.bind(null, {
    root: ROOT, loadRuntime, repositoryById
  })
});
const receiptRuntime = createReceiptRuntime({
  ROOT,
  LOGS,
  PROVIDERS,
  INPUT_MODES,
  providerWorkspace,
  ADAPTER_PROTOCOL_VERSION,
  PROVIDER_PROTOCOL_VERSION,
  REVIEW_PROTOCOL_VERSION,
  ACCEPTANCE_PROTOCOL_VERSION,
  validate,
  relevantHash,
  requiredProviders,
  advisoryCapabilities,
  receiptValidity,
  now,
  writeJson,
  receiptPath,
  providerConfig,
  providerCapability,
  loadRuntime,
  resolvedAcceptance,
  evidence,
  claimsForProvider,
  providerWorkspaceHash,
  providerRepository,
  providerRepositories,
  rejectPrototypeEvidenceInputs,
  durableArtifact,
  providerInputIdentity,
  contractFingerprint,
  executionFingerprint,
  stableHash,
  relevantSnapshot,
  // Late-bound for the same composition-order reason as receipt validity.
  changeDiffIdentity: (id, state) => sandboxRuntime.changeDiffIdentity(id, state),
  adapterFingerprint,
  environmentDescriptor,
  reviewPolicy,
  subjectProvenance,
  reviewProvenanceResult,
  readJson,
  flagValues,
  reviewHistoryState,
  reviewAttemptByDigest,
  reviewAttemptIsValid,
  recordRepairClosureAttempt,
  deliveredAiAttempts,
  groundingForReview: (id) => {
    const state = loadRuntime(id);
    return groundingValue(id, state, activeChangePath(id, state))?.value || null;
  },
  die
});
const {
  adapterResources, adapterRuntime, collectableExecutionNodes, decisionGateNotice,
  executionNodes, modelForTask, proofPlan, rebindDiffBoundReceipt, rebindReusableReceipt,
  recordDeterministicReviewClosure, recordReceipt, runExecutionDag, runProvider,
  startRequiredServices
} = composeEvidenceExecution({
  LOGS, ROOT, clearSnapshotCache, commandExists, commandPhaseRecorder, die, evidence,
  fileDigest, foundationPolicy, loadRuntime, maxParallelProviders, now, parseFlags, pathInside,
  playwrightAvailability, providerClaims, providerConfig, providerRepositories,
  providerRepository, providerWorkspace, providerWorkspaceHash, receiptRuntime,
  receiptValidity, repositoryById, requiredProviders, runCommand, stableHash,
  startServiceSession
});
const packetRuntime = createPacketRuntime({
  inspectSnapshots,
  ROOT,
  PACKET_SCHEMA_VERSION,
  REVIEW_PACKET_SCHEMA_VERSION,
  foundationVersion: VERSION,
  installedCliVersion: process.env.FOUNDATION_INSTALLED_CLI_VERSION || VERSION,
  leasesRoot: LEASES,
  resumeAction: (id) => advanceValue(id, { inspect: true }),
  activeLeases: (id) => activeChangeLeases(id),
  loadRuntime,
  readJson,
  activeChangePath,
  canonicalChangedSurface,
  evidence,
  taskBlocks,
  taskMetadata,
  repositoryById,
  claimsForProvider,
  relevantSnapshot,
  singleRelevantSnapshot,
  requiredProviders,
  receiptValidity,
  providerConfig,
  providerRepositories,
  adapterResources,
  stableHash,
  compactStrings,
  modelForTask,
  compactList,
  fileDigest,
  directoryHash,
  ensureBudgetState,
  budgetDecision,
  scopedReviewClaims,
  relevantHash,
  providerCapability,
  receiptPath,
  contractFingerprint,
  reviewPolicy,
  resolvedAcceptance,
  handoffReadiness,
  deliveredAiAttempts,
  authorityPreflight,
  executionContract,
  serializedJson,
  foundationPolicy,
  recordContextMetric,
  recordInstructionManifest,
  fail: die
});
const {
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
} = composeBuildRuntimes({
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
});
const {
  createChange,
  rapidStartTemplate,
  amendmentTemplate,
  inspectDraft,
  inspectAmendment,
  startAtomic,
  inspectRevision,
  reviseChange,
  amendChange,
  resolveChange,
  openQuestionsDecision
} = createChangeLifecycle({
  root: ROOT,
  policy: foundationPolicy,
  approvalPackageLink,
  recordPrototypeSync,
  approvalLanes: (id, state) => {
    const configured = foundationPolicy().approval?.roles || [];
    if (!configured.length) return { configured, required: [] };
    const routed = routeForState(state, changeWorkTypes(activeChangePath(id, state))).roles;
    return { configured, required: configured.filter((role) => routed.includes(role)) };
  },
  securityTerms: SECURITY_TERMS,
  fail: die,
  pathInside,
  readJson,
  writeJson,
  slugify,
  changePath,
  activeChangePath,
  loadRuntime,
  saveRuntime,
  setOperationChangeId: operation.setChangeId,
  initialBudget,
  git,
  gitHead,
  preexistingDirty,
  now,
  bindClaudeSession,
  validate,
  measureStage: commandPhaseRecorder.measure,
  receiptPath,
  receiptValidity,
  contractFingerprint,
  requiredProviders,
  providerConfig,
  claimsForProvider,
  providerWorkspaceHash,
  providerInputIdentity,
  relevantHash,
  stableHash,
  trapFailures,
  rollbackStart: rollbackAtomicStart,
  repositoryCatalog,
  decisionGateNotice
});
const amendTaskVerify = amendTaskVerifyOperation.bind(null, { root: ROOT, amendChange });
const { inspectInvestigation, investigationRecordTemplate } = createInvestigationRuntime({
  root: ROOT,
  readJson,
  writeJson,
  now,
  git,
  setOperationChangeId: operation.setChangeId,
  fail: die
});
const {
  abandonChange, advanceLand, advanceValue, applySandbox, archive, command, doctor,
  guardedAbortAuthority, guardedDispatchAuthority, guardedExtendReviewAuthority,
  guardedRecordAuthority, guardedRecordReceipt, guardedRecordVerifiedCi,
  guardedRequestAuthority, guardedResetBaseMoveAuthority, guardedResetInfrastructureAuthority,
  guardedRunAuthorityReviewer, guardedRunProvider, landCheck, landGrantRuntime, proofAdvance,
  proofAudit, proofCollect, proofExecute, proofFinalize, proofRun, prove,
  pyramidReadinessCommand, recordTargetRestore, recoverLand, resumeLand, sessionLeases,
  showAdvance, showChanges, showCurrent, showDeliveryAdvance, showFeatures, showFeedback,
  showLandPlan, showLessons, showOutcomes, showProviders, undoLand, usage, values
} = composeLifecycleRuntimes({
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
});
// Help is answered before anything else. It must never be parsed as a change
// id, and it must never depend on the command's arguments being valid.
if (command === "--help" || command === "-h" || command === "help") {
  describeCommand(values.find((value) => !value.startsWith("-")) || null,
    { json: values.includes("--json") });
  process.exit(0);
}
assertRegisteredRuntimeCommand(command, values);
if (values.includes("--help") || values.includes("-h")) {
  describeCommand(command, { json: values.includes("--json") });
  process.exit(0);
}
// An omitted `<change>` resolves to the one active change before telemetry and
// the operation ledger read the id.
values.splice(0, values.length, ...impliedChangeValues(command, values, activeChanges, die));
const unattendedMentioned = command === "sandbox" &&
  ["create", "inspect"].includes(values[0]) &&
  values.slice(1).some((value) =>
    value === "--unattended" || value.startsWith("--unattended="));
const telemetrySuppressed = command === "sandbox" && (
  values[0] === "inspect" ||
  (values[0] === "create" && unattendedMentioned)
);
if (telemetrySuppressed) process.env.FOUNDATION_TELEMETRY = "0";
operation.begin({ command, values, root: ROOT, readJson, runtimePath, activeChangePath, directoryHash, fileDigest });
const operationChangeId = operation.state.changeId;

// One table, in `runtime/core/lifecycle-phase.mjs`, shared with the operations
// row written on exit. The phase is derived here rather than read only from
// FOUNDATION_PUBLIC_OPERATION so a direct runtime invocation buckets the same
// way a `cli.sh` one does.
operation.state.phase = phaseForCommand(command);
const telemetryPhase = telemetryPhaseForCommand(command);
// An archived change is finished evidence. Reading it back — `metrics` on a
// landed run, say — must never append this session's telemetry to its log.
const telemetryWritable = (id) => Boolean(id) && existsSync(runtimePath(id)) &&
  readJson(runtimePath(id), {}).status !== "archived";
if (!telemetrySuppressed && telemetryPhase && telemetryWritable(operationChangeId))
  prepareClaudeTelemetry(operationChangeId, telemetryPhase);
if (command === "metrics" && telemetryWritable(operationChangeId))
  syncClaudeTelemetry(operationChangeId, { quiet: true });
if (command === "budget-checkpoint" && telemetryWritable(operationChangeId))
  syncClaudeTelemetry(operationChangeId, { quiet: true });
if (command === "budget-continue" && telemetryWritable(operationChangeId))
  syncClaudeTelemetry(operationChangeId, { quiet: true });

await routeRuntimeCommand(command, values, {
  parseFlags, parseStrictCommandFlags, createChange, inspectInvestigation,
  investigationRecordTemplate, rapidStartTemplate, amendmentTemplate, inspectDraft,
  inspectAmendment, startAtomic, inspectRevision, reviseChange, amendChange, amendTaskVerify,
  resolveChange, abandonChange, waiveGate, showChanges, showCurrent, showProviders,
  showRepositories, foundationPolicy, showAgentPlan, showAgentDispatch, showAgentTask,
  releaseAgentLease, prepareClaudeTelemetry, recordPhaseContext, showPacket, showMetrics,
  showAdvance, recordTargetRestore, undoLand, showFeedback, showOutcomes, showLessons,
  showFeatures, execObserved, checkpointBudget, continueBudget, doctor, validate,
  showTraceabilityAudit, relevantHash, providerWorkspaceHash, proofPlan, proofReadiness,
  proofAdvance, proofRun, proofCollect, proofPreflight, proofExecute, proofAudit, proofFinalize,
  showEvidenceDetection, initializeEvidence, showEvidenceDoctor, showAuthorityStatus, prove,
  landCheck, advanceLand, recoverLand, showLandPlan, resumeLand, showDeliveryAdvance,
  showHandoffStatus, showHandoffPacket, recordHandoff, createAttestationChallenge,
  showSandboxInspection, createSandbox, syncSandbox, applySandbox, archive, recordEvent,
  syncClaudeTelemetry, importTelemetry, importHostExecution, usage, describeCommand,
  showQualityDiscovery, initializeQuality, qualityDoctor, showQualityReport, updateQualityBaseline,
  showQualityDebt,
  fail: die,
  approvalQuestionAction: (id, through = null) => {
    const decision = openQuestionsDecision(id);
    return decision ? advanceFailureAction(id, decision, { stage: "build", through }) : null;
  },
  acquireAgentLease: (id, taskId, flags) => {
    sessionLeases.yieldTo(id);
    return acquireAgentLease(id, taskId, flags);
  },
  showPackage: approvalPackage.showPackage,
  showPreview: preview.showPreview,
  recordVerifiedCi: guardedRecordVerifiedCi,
  requestAuthority: guardedRequestAuthority,
  dispatchAuthority: guardedDispatchAuthority,
  runAuthorityReviewer: guardedRunAuthorityReviewer,
  abortAuthority: guardedAbortAuthority,
  resetInfrastructureAuthority: guardedResetInfrastructureAuthority,
  extendReviewAuthority: guardedExtendReviewAuthority,
  resetBaseMoveAuthority: guardedResetBaseMoveAuthority,
  recordAuthority: guardedRecordAuthority,
  recordReceipt: guardedRecordReceipt,
  runProvider: guardedRunProvider,
  grantLand: landGrantRuntime.issue,
  runtimeApiVersion: RUNTIME_API_VERSION,
  version: VERSION,
  runQuality: (options) => trapFailures(() => runQuality(options)),
  showQualityReadiness: pyramidReadinessCommand.showReadiness
});
