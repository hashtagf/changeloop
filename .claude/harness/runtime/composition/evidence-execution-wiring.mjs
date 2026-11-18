// Composition: provider execution — adapters, the provider scheduler,
// benchmarks, and the model router. Wiring only.
import { PROVIDERS, providerCapability } from "../evidence/provider-catalog.mjs";
import { adapterResources as resultAdapterResources, configuredCommand, mutationProtocolResult, numericReportValue, parseNodeTestSpecOutput, parseJsonOutput, parseTapOutput, playwrightReportSummary, resourcesConflict } from "../evidence/evidence-results.mjs";
import { createAdapterRuntime } from "../evidence/adapter-runtime.mjs";
import { createBenchmarkRuntime } from "../evidence/benchmark-runtime.mjs";
import { createModelRouter } from "../workflow/authority/agent-planning.mjs";
import { createProviderScheduler } from "../evidence/provider-scheduler.mjs";
import { lightKind } from "../workflow/validation/dev-document.mjs";
import { prepareBaseTree } from "../evidence/test-discrimination.mjs";
import { rmSync } from "node:fs";

export function composeEvidenceExecution({
  LOGS, ROOT, clearSnapshotCache, commandExists, commandPhaseRecorder, die, evidence,
  fileDigest, foundationPolicy, loadRuntime, maxParallelProviders, now, parseFlags, pathInside,
  playwrightAvailability, providerClaims, providerConfig, providerRepositories,
  providerRepository, providerWorkspace, providerWorkspaceHash, receiptRuntime,
  receiptValidity, repositoryById, requiredProviders, runCommand, stableHash,
  startServiceSession
}) {
  const {
    proofPlan,
    rebindReusableReceipt,
    rebindDiffBoundReceipt,
    recordReceipt,
    recordDeterministicReviewClosure,
    decisionGateNotice
  } = receiptRuntime;
  const { measure: measureBenchmark } = createBenchmarkRuntime({
    prepareBaseTree,
    isProductPath: (path) => !lightKind(path),
    fileDigest,
    runCommand,
    removeTree: (path) => rmSync(path, { recursive: true, force: true }),
    stableHash
  });
  const adapterRuntime = createAdapterRuntime({
    ROOT,
    LOGS,
    PROVIDERS,
    providerCapability,
    providerConfig,
    parseFlags,
    providerWorkspace,
    recordReceipt,
    startServiceSession,
    evidence,
    resultAdapterResources,
    loadRuntime,
    providerRepository,
    providerRepositories,
    repositoryById,
    fileDigest,
    pathInside,
    configuredCommand,
    stableHash,
    runCommand,
    providerWorkspaceHash,
    providerClaims,
    parseJsonOutput,
    parseTapOutput,
    parseNodeTestSpecOutput,
    numericReportValue,
    playwrightReportSummary,
    requiredProviders,
    mutationProtocolResult,
    now,
    serviceResourcesConflict: resourcesConflict,
    maxParallelServices: maxParallelProviders,
    recordScheduler: commandPhaseRecorder.scheduler,
    timestamp: Date.now,
    measureBenchmark,
    die,
    clearSnapshotCache
  });
  const {
    runProvider,
    startRequiredServices,
    adapterResources,
    executeAdapter
  } = adapterRuntime;
  const {
    executionNodes,
    runExecutionDag,
    collectableExecutionNodes
  } = createProviderScheduler({
    requiredProviders,
    receiptValidity,
    providerConfig,
    commandExists,
    providerWorkspace,
    playwrightAvailability,
    evidence,
    providerCapability,
    adapterResources,
    resourcesConflict,
    executeAdapter,
    maxParallelProviders,
    recordScheduler: commandPhaseRecorder.scheduler,
    timestamp: Date.now,
  });
  const { modelForTask } = createModelRouter({
    loadRuntime,
    policy: foundationPolicy,
    fail: die
  });
  return {
    adapterResources, adapterRuntime, collectableExecutionNodes, decisionGateNotice,
    executionNodes, modelForTask, proofPlan, rebindDiffBoundReceipt, rebindReusableReceipt,
    recordDeterministicReviewClosure, recordReceipt, runExecutionDag, runProvider,
    startRequiredServices
  };
}
