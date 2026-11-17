import { projectionCounts } from "../transaction/apply-recovery.mjs";
import { transitionLifecycleState } from "../../core/lifecycle-reducer.mjs";
import { guardReapplyTargetEdits } from "./target-restore.mjs";

// Whether an empty root diff is an acceptable apply outcome rather than an
// error: true when the change selected any non-root repository, because the
// child apply path is then the delivery vehicle and the root may legitimately
// carry nothing — including when exactly one child repository holds the entire
// diff. Requiring a second repository here forced a manual apply for
// single-child changes.
export function emptyRootDiffPermitted(state) {
  return Object.keys(state?.repositories || {})
    .some((repositoryId) => repositoryId !== "root");
}

export function telemetryUsageSatisfied(telemetry) {
  return Boolean(telemetry && (
    ["measured", "no-usage"].includes(telemetry.classification) ||
    Object.values(telemetry.measuredDimensions || {}).some(Boolean)
  ));
}

export function assertLocalApply(initialState, options, fail) {
  if (emptyRootDiffPermitted(initialState) && !options.controlPlane)
    fail("multi-repository sandboxes do not apply as one local transaction; use land plan/record/resume");
}

export function projectionHash(stableHash, entries) {
  return stableHash(entries.map(({ path, after, afterMode }) =>
    ({ path, after, afterMode })));
}

export function reapplyProjection(context) {
  const { id, state, verifyAppliedProjection, buildReapplyEntries, stableHash, fail } = context;
  if (!state.workspace?.applied) return { prepared: null, resumed: false };
  const verification = verifyAppliedProjection(state);
  if (!verification.valid) fail(`applied projection is invalid: ${verification.reason}`);
  const prepared = buildReapplyEntries(id, state, verification.journal);
  const desired = projectionHash(stableHash, prepared);
  if (desired !== state.workspace.apply.projectionHash) {
    if (guardReapplyTargetEdits(context, id, state, prepared, verification.journal))
      return { prepared: buildReapplyEntries(id, state, verification.journal), resumed: false };
    return { prepared, resumed: false };
  }
  console.log(`APPLIED ${id}\n  resumed: ${state.workspace.apply.transactionId}`);
  return { prepared, resumed: true };
}

export function projectionMismatch(entries, {
  safeRootPath,
  pathIdentity,
  pathMode
}, phase) {
  const identityField = phase === "before" ? "before" : "after";
  const modeField = phase === "before" ? "beforeMode" : "afterMode";
  return entries.find((entry) =>
    pathIdentity(safeRootPath(entry.path)) !== entry[identityField] ||
    pathMode(safeRootPath(entry.path)) !== entry[modeField]);
}

export function beginApplyJournal({
  id,
  journal,
  safeRootPath,
  pathIdentity,
  pathMode,
  saveApplyJournal,
  now,
  fail
}) {
  const changed = projectionMismatch(journal.entries, {
    safeRootPath, pathIdentity, pathMode
  }, "before");
  if (changed) {
    journal.status = "aborted";
    journal.failure = `target changed before apply at '${changed.path}'`;
    journal.abortedAt = now();
    saveApplyJournal(journal);
    fail(journal.failure);
  }
  journal.status = "applying";
  saveApplyJournal(journal);
  const counts = projectionCounts(journal.entries);
  console.log(`PROJECTION ${id}\n  update: ${counts.update}; create: ${
    counts.create}; delete: ${counts.delete}`);
}

export function appliedRuntimeState(state, root, journal) {
  state.workspace = {
    ...state.workspace,
    applied: true,
    sandboxPath: state.workspace.path,
    targetPath: root,
    apply: {
      transactionId: journal.transactionId,
      status: "verified",
      projectionHash: journal.projectionHash,
      touchedPaths: journal.entries.map((entry) => entry.path)
    }
  };
  transitionLifecycleState(state, "applied", "projection-verified");
  return state;
}

export function executeApplyJournal({
  id,
  journal,
  root,
  loadRuntime,
  saveRuntime,
  safeRootPath,
  pathIdentity,
  pathMode,
  applyTransactionEntry,
  rollbackApplyTransaction,
  saveApplyJournal,
  now,
  fail
}) {
  const priorTransactionMarker = process.env.FOUNDATION_LAND_TRANSACTION;
  process.env.FOUNDATION_LAND_TRANSACTION = "1";
  try {
    journal.entries.forEach((entry, index) =>
      applyTransactionEntry(journal, entry, index));
    const mismatch = projectionMismatch(journal.entries, {
      safeRootPath, pathIdentity, pathMode
    }, "after");
    if (mismatch) throw new Error(`post-apply projection mismatch at '${mismatch.path}'`);
    const state = appliedRuntimeState(loadRuntime(id), root, journal);
    saveRuntime(state);
    journal.status = "verified";
    journal.verifiedAt = now();
    saveApplyJournal(journal);
    console.log(`APPLIED ${id}\n  mode: ${state.workspace.mode}\n  projection: ${journal.projectionHash}`);
  } catch (error) {
    try {
      rollbackApplyTransaction(journal, error);
    } catch (rollbackError) {
      fail(`${error.message}; ${rollbackError.message}`);
    }
    fail(`${error.message}; transaction rolled back`);
  } finally {
    if (priorTransactionMarker === undefined) delete process.env.FOUNDATION_LAND_TRANSACTION;
    else process.env.FOUNDATION_LAND_TRANSACTION = priorTransactionMarker;
  }
}
