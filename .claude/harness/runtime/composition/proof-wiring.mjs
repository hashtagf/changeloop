// Composition: proof execution, test discrimination, the Land journal, and
// apply recovery. Wiring only.
import { copyBaseBytes } from "../workflow/transaction/copy-base.mjs";
import { changeWorkTypes } from "../workflow/change/task-change.mjs";
import { configuredCommand } from "../evidence/evidence-results.mjs";
import { createApplyRecovery } from "../workflow/transaction/apply-recovery.mjs";
import { createLandJournal } from "../workflow/transaction/land-journal.mjs";
import { createProofRuntime, taskPacketWasPrecompletedOperation } from "../evidence/proof-runtime.mjs";
import { createTestDiscriminationRuntime } from "../evidence/test-discrimination.mjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { lightKind } from "../workflow/validation/dev-document.mjs";
import { postReleaseRolloutGates } from "../workflow/change/required-providers.mjs";
import { providerCapability } from "../evidence/provider-catalog.mjs";
import { repositoryBaseHead } from "../core/repository-binding.mjs";

export function composeProofRuntimes({
  LEASES, LOGS, PLANS, PROOF_PROTOCOL_VERSION, ROOT, TRANSACTIONS, activeChangeLeases,
  activeChangePath, advisoryCapabilities, agentPlanValue, blockWithDecision,
  canonicalChangedSurface, changedSurfaceIssues, clearSnapshotCache, contractFingerprint, die,
  directoryHash, evidence, executionFingerprint, fileDigest, git, loadRuntime, now, pathInside,
  pendingTasks, policyRolloutCapabilities, proofPath, proofRunRoot, protocolDescriptor,
  providerConfig, providerRepository, readJson, receiptPath, receiptValidity,
  recordInstructionManifest, relevantHash, relevantSnapshot, requiredProviders, saveRuntime,
  selectedRepositories, stableHash, validate, validateArtifact, writeJson
}) {
  const {
    pathIdentity,
    pathMode,
    safeRootPath,
    copyPath,
    transactionRoot: applyTransactionRoot,
    journalPath: transactionJournalPath,
    save: saveApplyJournal,
    applyEntry: applyTransactionEntry,
    rollback: rollbackApplyTransaction,
    settle: settleApplyTransaction,
    verify: verifyAppliedProjection,
    cleanup: cleanupApplyTransaction
  } = createLandJournal({
    root: ROOT,
    transactions: TRANSACTIONS,
    fileDigest,
    directoryHash,
    pathInside,
    readJson,
    writeJson,
    now
  });
  const { recoverPendingApply, pendingApplyTransactions } = createApplyRecovery({
    transactions: TRANSACTIONS,
    transactionJournalPath,
    readJson,
    verifyAppliedProjection,
    saveApplyJournal,
    rollbackApplyTransaction,
    settleApplyTransaction,
    saveRuntime,
    clearSnapshotCache,
    now,
    blockWithDecision,
    fail: die
  });
  const taskPacketWasPrecompleted = taskPacketWasPrecompletedOperation.bind(null, {
    loadRuntime, activeChangePath, exists: existsSync, fileDigest
  });
  // One set of deferred post-release gates for Prove and the archive appendix.
  function changeRolloutGates(id) {
    return postReleaseRolloutGates(
      { evidence, providerCapability, policyRolloutCapabilities, loadRuntime, relevantHash }, id);
  }
  const { finalize: prove, audit: proofAudit } = createProofRuntime({
    rolloutGates: changeRolloutGates,
    root: ROOT,
    protocolVersion: PROOF_PROTOCOL_VERSION,
    loadRuntime,
    saveRuntime,
    validate,
    changedSurfaceIssues,
    activeChangeLeases,
    pendingTasks,
    clearSnapshotCache,
    relevantSnapshot,
    requiredProviders,
    advisoryCapabilities,
    receiptValidity,
    proofRunRoot,
    receiptPath,
    fileDigest,
    protocolDescriptor,
    contractFingerprint,
    executionFingerprint,
    proofPath,
    writeJson,
    readJson,
    pathInside,
    validateArtifact,
    instructionProvenance: (id) => {
      const manifest = recordInstructionManifest(id, "prove", { scope: "proof" });
      return manifest ? {
        schemaVersion: manifest.schemaVersion,
        manifestDigest: manifest.manifestDigest
      } : null;
    },
    agentPlanValue,
    savedAgentPlan: (id) => readJson(join(PLANS, `${id}.json`), {}),
    taskResult: (id, taskId) => {
      const path = join(LEASES, "results", id, `${taskId}.json`);
      return existsSync(path) ? { path, value: readJson(path, null) } : null;
    },
    taskLease: (id, taskId) => {
      const path = join(LEASES, "tasks", id, `${taskId}.json`);
      return existsSync(path) ? readJson(path, null) : null;
    },
    taskPacketWasPrecompleted,
    selectedRepositories,
    git,
    now,
    fail: die
  });
  const testDiscrimination = createTestDiscriminationRuntime({
    root: ROOT, copyBaseBytes, LOGS, requiredProviders, providerConfig, providerCapability, providerRepository,
    selectedRepositories, repositoryBaseHead,
    changedSurface: (id, state) => canonicalChangedSurface(id, state),
    pathKind: lightKind,
    changeWorkTypes: (id) => changeWorkTypes(activeChangePath(id)),
    receiptValidity, configuredCommand, fileDigest, stableHash, loadRuntime
  });
  return {
    applyTransactionEntry, applyTransactionRoot, changeRolloutGates, cleanupApplyTransaction,
    copyPath, pathIdentity, pathMode, pendingApplyTransactions, proofAudit, prove,
    recoverPendingApply, rollbackApplyTransaction, safeRootPath, saveApplyJournal,
    testDiscrimination, transactionJournalPath, verifyAppliedProjection
  };
}
