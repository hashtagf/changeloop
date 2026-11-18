// Finishing an archive that stopped part-way: completing the spec sync,
// resuming the archived change, and recovering an interrupted archive from its
// journal.
import { transitionLifecycleState } from "../../core/lifecycle-reducer.mjs";
import { emitSignal } from "../../core/signals.mjs";

export function createArchiveResume({
  appendArchiveAppendix,
  archivedChangeRelativePath,
  assertRecoveredArchiveReady,
  assertRetainedArchiveIntegrity,
  cleanupAppliedSandbox,
  cleanupApplyTransaction,
  cleanupChangeLeases,
  cleanupRepositorySandboxes,
  consumeLandGrant,
  failSpecSync,
  now,
  outstandingSpecSync,
  pathIdentity,
  recordDeliveryIntegrity,
  saveRuntime,
  settleArchivedSpecEndings,
  stripArchiveAppendix
}) {
  // The change becomes `archived` only here, once the merged specs verify;
  // cleanup then resumes exactly as for any archived change.
  function completeSpecSync(id, state) {
    const outstanding = outstandingSpecSync(state);
    if (outstanding.length) {
      state.specSyncViolations = outstanding;
      saveRuntime(state);
      failSpecSync(outstanding);
    }
    transitionLifecycleState(state, "archived", "openspec-archive-complete");
    state.archivedAt ||= now();
    state.archivedChangePath ||= archivedChangeRelativePath(id);
    saveRuntime(state);
    resumeArchivedChange(id, state);
  }

  function resumeArchivedChange(id, state) {
    // A Land interrupted after the archive command settles the merged specs
    // here; once delivery integrity is recorded the specs are never rewritten.
    if (!state.deliveryIntegrity && Array.isArray(state.specSyncInputs))
      settleArchivedSpecEndings(state.specSyncInputs);
    const outstanding = outstandingSpecSync(state);
    if (outstanding.length) {
      state.specSyncViolations = outstanding;
      saveRuntime(state);
      failSpecSync(outstanding);
    }
    const integrityPending = !state.deliveryIntegrity && Array.isArray(state.specSyncInputs) &&
      typeof pathIdentity === "function";
    const archivedPath = integrityPending ? state.archivedChangePath || archivedChangeRelativePath(id) : null;
    if (archivedPath) {
      stripArchiveAppendix(state, archivedPath);
      assertRetainedArchiveIntegrity(id, state, archivedPath);
      appendArchiveAppendix(state, archivedPath);
      recordDeliveryIntegrity(state, archivedPath, state.specSyncInputs,
        Array.isArray(state.land?.archivePacketEntries));
      saveRuntime(state);
    }
    if (state.specSyncViolations || Array.isArray(state.specSyncInputs)) {
      delete state.specSyncViolations;
      delete state.specSyncInputs;
      saveRuntime(state);
    }
    let resumed = false;
    if (state.workspace &&
        !["removed", "not-needed"].includes(state.workspace.cleanup?.status)) {
      state.workspace.cleanup = cleanupAppliedSandbox(id, state);
      state.land = {
        ...(state.land || {}),
        status: state.workspace.cleanup.status === "removed"
          ? "sandbox-cleaned" : "archive-audited",
        resumedAt: now()
      };
      resumed = true;
    }
    if (state.workspace?.apply &&
        state.workspace.apply.cleanup?.status !== "committed") {
      state.workspace.apply.cleanup = cleanupApplyTransaction(state);
      resumed = true;
    }
    if (state.repositories && !state.repositoryCleanup) {
      state.repositoryCleanup = cleanupRepositorySandboxes(id, state);
      resumed = true;
    }
    if (resumed) saveRuntime(state);
    cleanupChangeLeases(id);
    consumeLandGrant(id);
    // Quiet under `advance`, so the envelope carries it as a signal too.
    emitSignal("already-archived", `ALREADY ARCHIVED ${id}\n  archived: ${state.archivedAt || "unknown"}`,
      (line) => console.log(line));
  }

  function recoverInterruptedArchive(id, state, archivedPath) {
    // Recovery cannot tell "succeeded then crashed" from "moved then failed",
    // so it is not an exemption from the Land guards. Everything still
    // checkable once the change directory has moved is checked here, before
    // any state is written: a refusal has to leave the change recoverable.
    stripArchiveAppendix(state, archivedPath);
    assertRecoveredArchiveReady(id, state, archivedPath);
    assertRetainedArchiveIntegrity(id, state, archivedPath);
    // The move may have finished before the specs were settled; settle them
    // before verification and the integrity record, as an uninterrupted Land does.
    if (!state.deliveryIntegrity && Array.isArray(state.specSyncInputs))
      settleArchivedSpecEndings(state.specSyncInputs);
    const outstanding = outstandingSpecSync(state);
    if (outstanding.length) {
      state.specSyncViolations = outstanding;
      saveRuntime(state);
      failSpecSync(outstanding);
    }
    transitionLifecycleState(state, "archived", "interrupted-archive-recovered");
    state.archivedAt ||= now();
    state.archivedChangePath = archivedPath;
    state.land = {
      ...(state.land || {}),
      status: "archive-audited",
      recoveredAt: now()
    };
    appendArchiveAppendix(state, archivedPath);
    recordDeliveryIntegrity(state, archivedPath,
      Array.isArray(state.specSyncInputs) ? state.specSyncInputs : [],
      Array.isArray(state.land.archivePacketEntries));
    state.workspace.cleanup = cleanupAppliedSandbox(id, state);
    if (state.repositories)
      state.repositoryCleanup = cleanupRepositorySandboxes(id, state);
    if (state.workspace.apply)
      state.workspace.apply.cleanup = cleanupApplyTransaction(state);
    cleanupChangeLeases(id);
    delete state.workspace.baseline;
    delete state.specSyncInputs;
    delete state.specSyncViolations;
    saveRuntime(state);
    consumeLandGrant(id);
    console.log(`ARCHIVED ${id}\n  recovered: interrupted archive transaction`);
  }

  return { completeSpecSync, resumeArchivedChange, recoverInterruptedArchive };
}
