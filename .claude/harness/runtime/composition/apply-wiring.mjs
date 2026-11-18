// Composition: Apply and archive, wired to Land's journal, recovery, and the
// repository delivery saga. Wiring only.
import { assertLandedProjection } from "../workflow/land/land-verification.mjs";
import { assertOpenSpecCli } from "../workflow/land/land-runtime.mjs";
import { createApplyRuntime } from "../workflow/land/apply-runtime.mjs";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function composeApplyRuntime({
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
}) {
  // Cross-change rollups read the store directly and never write it: the
  // attempt reader below bypasses reviewHistoryState, which may migrate state.
  const reviewAttemptRecords = (id) => {
    const dir = join(EVIDENCE_VAULT, id, "review-attempts");
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
      .map((name) => readJsonOrNull(join(dir, name)))
      .filter((value) => value && typeof value === "object");
  };
  const applyRuntime = createApplyRuntime({
    // Archive appendices: review rounds and post-release rollout gates.
    reviewAttemptRecords: (id) => reviewAttemptRecords(id),
    rolloutGates: changeRolloutGates,
    root: ROOT,
    transactions: TRANSACTIONS,
    loadRuntime,
    saveRuntime,
    selectedRepositories,
    mergeTaskProgress,
    workspaceManifest,
    declaredSurfaceMatcher,
    currentChangeRelativePath,
    changePath,
    safeRootPath,
    pathIdentity,
    pathMode,
    directoryHash,
    fileDigest,
    pathInside,
    applyTransactionRoot,
    copyPath,
    proofPath,
    readJson,
    writeJson,
    stableHash,
    syncClaudeTelemetry,
    modelUsageRecorded,
    telemetryReadiness,
    foundationPolicy,
    saveApplyJournal,
    transactionJournalPath,
    verifyAppliedProjection,
    rollbackApplyTransaction,
    applyTransactionEntry,
    cleanupApplyTransaction,
    git,
    gitBuffer,
    gitHead,
    cleanupAppliedSandbox,
    cleanupRepositorySandboxes,
    recoverPendingApply,
    landCheck,
    // Records say what Land applied; the target says what landed. Both must agree.
    assertMultiRepositoryArchiveReady: (id, state) => {
      assertMultiRepositoryArchiveReady(id, state);
      assertLandedProjection({ root: ROOT, id, state, fail: die });
    },
    archivedChangeRelativePath,
    assertOpenSpecCli,
    cleanupChangeLeases,
    now,
    measure: commandPhaseRecorder.measure,
    assertLandGrant: landGrantRuntime.assert,
    consumeLandGrant: landGrantRuntime.consume,
    blockWithDecision,
    fail: die,
    declaredRepositoryPaths
  });
  const {
    recordTargetRestore,
    applySandbox,
    archive
  } = applyRuntime;
  return {
    applyRuntime, applySandbox, archive, recordTargetRestore, reviewAttemptRecords
  };
}
