// Composition: what records evidence and project state — repository topology
// and snapshots, the evidence contract, change policy, artifacts, handoffs,
// host execution, telemetry, and consumer quality. Wiring only.
import { ADAPTERS, INPUT_MODES, PROVIDERS, providerCapability } from "../evidence/provider-catalog.mjs";
import { EXCLUDED_WORKSPACE_DIRS } from "../core/workspace-policy.mjs";
import { createArtifactStore } from "../evidence/artifact-store.mjs";
import { createChangePolicy } from "../workflow/change/change-policy.mjs";
import { createEvidenceContract } from "../evidence/evidence-contract.mjs";
import { createHandoffRuntime } from "../workflow/authority/handoff-runtime.mjs";
import { createHostExecutionImporter, createHostExecutionStore, resolveHostExecutionSource } from "../observability/host-execution-contract.mjs";
import { createQualityRuntime } from "../quality/quality-runtime.mjs";
import { discoverRepositoryQuality } from "../quality/quality-discovery.mjs";
import { createRepositorySnapshot } from "../workflow/repository/repository-snapshot.mjs";
import { createRepositoryTopology } from "../workflow/repository/repository-topology.mjs";
import { createTelemetryRuntime } from "../observability/telemetry-runtime.mjs";
import { existsSync } from "node:fs";
import { nestedRepositoryRelativePaths } from "../core/repository-binding.mjs";
import { taskBlocks } from "../contracts/change-artifacts.mjs";

export function composeEvidenceState({
  ADAPTER_PROTOCOL_VERSION, CONTEXT_EVENT_SCHEMA_VERSION, EVIDENCE_VAULT, HANDOFFS, LOGS,
  PROTOTYPES, PROVIDER_PROTOCOL_VERSION, ROOT, activeChangePath, canonicalPath,
  declaredSurfaceMatcher, die, fileDigest, filesystemEntryIdentity, foundationPolicy, git,
  gitHead, isCurrentChangePath, loadRuntime, now, parseFlags, pathInside,
  porcelainStatusRecords, proofRunRoot, readJson, readJsonLines, readJsonLinesTolerant,
  registerPolicyCacheClearer, reportBudget, runtimePath, saveRuntime, singleRelevantSnapshot,
  slugify, snapshotPath, stableHash, synchronizeBudgetUsage, trapFailures, workspaceManifest,
  writeJson, writeSnapshot
}) {
  const repositoryTopology = createRepositoryTopology({
    root: ROOT,
    slugify,
    readJson,
    canonicalPath,
    pathInside,
    activeChangePath,
    loadRuntime,
    git,
    gitHead,
    fail: die
  });
  const {
    catalog: repositoryCatalog,
    selectionIdsAt: repositorySelectionIdsAt,
    selected: selectedRepositories,
    byId: repositoryById,
    show: showRepositories
  } = repositoryTopology;
  // Every declared nested repository's root-relative path; its gitlink in the
  // root workspace is that repository's pointer, never root task content.
  const declaredRepositoryPaths = () => nestedRepositoryRelativePaths(repositoryCatalog());
  const { relevantSnapshot, relevantHash } = createRepositorySnapshot({
    root: ROOT,
    runtimePath,
    snapshotPath,
    readJson,
    writeJson: writeSnapshot,
    singleRelevantSnapshot,
    selectedRepositories,
    gitHead,
    stableHash,
    now
  });
  const {
    canonicalChangedSurface,
    changedSurfaceResolvable,
    policyCapabilities,
    policyRolloutCapabilities,
    policyCapabilityTrigger,
    forecastCapabilities,
    policyProviderSetupActions,
    clearPolicyCache
  } = createChangePolicy({
    root: ROOT,
    excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS,
    providers: PROVIDERS,
    gitHead,
    git,
    porcelainStatusRecords,
    workspaceManifest,
    loadRuntime,
    selectedRepositories,
    isCurrentChangePath,
    readJson,
    fileDigest,
    fail: die,
    declaredRepositoryPaths
  });
  // clearSnapshotCache is what every surface mutation already calls; the policy
  // cache invalidates with it or not at all.
  registerPolicyCacheClearer(clearPolicyCache);
  const {
    showDiscovery: showQualityDiscovery, initialize: initializeQuality, doctor: qualityDoctor, run: runQuality,
    report: showQualityReport, baseline: updateQualityBaseline, debt: showQualityDebt, readiness: qualityReadiness,
    laneStates: qualityLaneStates
  } = createQualityRuntime({
    root: ROOT,
    repositoryCatalog,
    selectedRepositories,
    canonicalChangedSurface,
    declaredSurfaceMatcher,
    loadRuntime,
    git,
    gitHead,
    readJson,
    writeJson,
    pathInside,
    workspaceManifest,
    fail: die
  });
  const {
    appendTelemetryRows,
    bindClaudeSession,
    importTelemetry,
    modelUsageRecorded,
    telemetryReadiness,
    prepareClaudeTelemetry,
    recordContextMetric,
    recordEvent,
    recordPhaseContext,
    syncClaudeTelemetry
  } = createTelemetryRuntime({
    root: ROOT,
    logs: LOGS,
    contextEventSchemaVersion: CONTEXT_EVENT_SCHEMA_VERSION,
    stableHash,
    now,
    readJson,
    writeJson,
    readJsonLines,
    readJsonLinesTolerant,
    loadRuntime,
    saveRuntime,
    synchronizeBudgetUsage,
    reportBudget,
    snapshotPath,
    parseFlags,
    activeChangePath,
    repositoryById,
    taskBlocks,
    fail: die
  });
  const hostExecutionStore = createHostExecutionStore({ root: ROOT, now });
  const importHostExecution = createHostExecutionImporter({
    loadRuntime,
    resolveSource: resolveHostExecutionSource.bind(null, process.cwd()),
    exists: existsSync,
    store: hostExecutionStore,
    readJson,
    appendTelemetryRows,
    snapshotPath,
    fail: die,
    log: console.log
  });
  const handoffRuntime = createHandoffRuntime({
    root: ROOT,
    handoffsRoot: HANDOFFS,
    activeChangePath,
    loadRuntime,
    readJson,
    writeJson,
    stableHash,
    defaultOwner: () => foundationPolicy().workflow.handoffDefaultOwner,
    now,
    fail: die,
    capture: trapFailures
  });
  const {
    handoffContract,
    handoffReadiness,
    showHandoffPacket,
    showHandoffStatus,
    recordHandoff
  } = handoffRuntime;
  const evidenceContract = createEvidenceContract({
    ROOT,
    PROVIDERS,
    ADAPTERS,
    INPUT_MODES,
    EXCLUDED_WORKSPACE_DIRS,
    ADAPTER_PROTOCOL_VERSION,
    PROVIDER_PROTOCOL_VERSION,
    activeChangePath,
    readJson,
    repositoryById,
    selectedRepositories,
    providerCapability,
    canonicalPath,
    loadRuntime,
    relevantHash,
    relevantSnapshot,
    singleRelevantSnapshot,
    fileDigest,
    filesystemEntryIdentity,
    stableHash,
    policyCapabilities,
    policyCapabilityTrigger,
    foundationPolicy,
    handoffContract,
    git,
    declaredSurfaceMatcher,
    die
  });
  const {
    rawExecution,
    scopedReviewClaims,
    evidence,
    claimsForProvider,
    providerConfig,
    providerClaims,
    providerRepository,
    providerRepositories,
    providerWorkspace,
    providerWorkspaceHash,
    providerInputIdentity,
    environmentDescriptor,
    adapterFingerprint,
    contractFingerprint,
    resolvedAcceptance,
    reviewPolicy,
    executionFingerprint
  } = evidenceContract;
  const {
    rejectPrototypeEvidenceInputs,
    receiptPrototypeEvidence,
    durableArtifact,
    validateArtifact
  } = createArtifactStore({
    root: ROOT,
    prototypesRoot: PROTOTYPES,
    evidenceVault: EVIDENCE_VAULT,
    canonicalPath,
    providerWorkspace,
    proofRunRoot,
    pathInside,
    fileDigest,
    fail: die
  });
  return {
    adapterFingerprint, appendTelemetryRows, bindClaudeSession, canonicalChangedSurface,
    changedSurfaceResolvable, claimsForProvider, contractFingerprint, declaredRepositoryPaths,
    durableArtifact, environmentDescriptor, evidence, executionFingerprint,
    forecastCapabilities, handoffContract, handoffReadiness, importHostExecution,
    importTelemetry, initializeQuality, modelUsageRecorded, policyCapabilities,
    policyCapabilityTrigger, policyProviderSetupActions, policyRolloutCapabilities,
    prepareClaudeTelemetry, providerClaims, providerConfig, providerInputIdentity,
    providerRepositories, providerRepository, providerWorkspace, providerWorkspaceHash,
    qualityDoctor, qualityLaneStates, qualityReadiness, rawExecution, receiptPrototypeEvidence,
    recordContextMetric, recordEvent, recordHandoff, recordPhaseContext,
    rejectPrototypeEvidenceInputs, relevantHash, relevantSnapshot, repositoryById,
    repositoryCatalog, repositorySelectionIdsAt, resolvedAcceptance, reviewPolicy, runQuality,
    scopedReviewClaims, selectedRepositories, showHandoffPacket, showHandoffStatus,
    showQualityDebt, showQualityDiscovery, showQualityReport, showRepositories,
    syncClaudeTelemetry, telemetryReadiness, updateQualityBaseline, validateArtifact
  };
}

// Prove's test provider for a repository without package.json (evidence-bootstrap).
export const discoverTestCommand = (repository) => discoverRepositoryQuality(repository);
