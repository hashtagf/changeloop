import { join } from "node:path";
import { copyBaselineState, targetOverwrites } from "../delivery/repository-delivery-saga.mjs";
import {
  captureCopyBase, copyBaseBytes, copyBaseExecutable, fileSource
} from "../transaction/copy-base.mjs";
import {
  landedChangeSyncStop, landedConflictStop, pendingLandedConflict, replayLandedEdit,
  restorableTargetPaths, targetConflictStop, targetEditCarried, targetEditSyncStop
} from "../transaction/target-edits.mjs";

// A recorded `--restore-target` returns those target files to the sandbox
// base inside Land, only while each still holds the exact bytes the
// restore was recorded against; a later edit is a new question. `inspect`
// (the read-only Land preflight) names the paths Land would restore and
// writes nothing.
export function restoreAuthorizedTargetPaths(context, state, names, { inspect = false } = {}) {
  const restore = state.targetRestore;
  if (!restore?.identities) return [];
  const restored = [];
  for (const path of names) {
    if (!Object.hasOwn(restore.identities, path)) continue;
    const target = join(context.root, path);
    if (context.pathIdentity(target) !== restore.identities[path]) continue;
    if (inspect) {
      restored.push(path);
      continue;
    }
    if (restoreTargetBase(context, state, path)) restored.push(path);
  }
  return restored;
}

// Writes the base of `path` back into the target: its base bytes, or no file
// when the base has none. A base that cannot be proven is never guessed.
function restoreTargetBase(context, state, path) {
  const bytes = targetBaseBytes(context, state, path);
  if (bytes === undefined) return false;
  if (bytes === null) context.removePath(join(context.root, path));
  else context.writeFile(join(context.root, path), bytes);
  return true;
}

function targetSnapshot(state) {
  return state.workspace?.targetDirty || state.workspace?.preexisting || {};
}

// A conflict made only of regenerable artifacts that were clean at isolation
// is a test run in the main checkout, not user work. Land returns them to the
// sandbox base itself, once, instead of handing a restore command back.
export function restoreRegenerableConflicts(context, state, paths, { inspect = false } = {}) {
  if (!paths.length || !context.writeFile || !context.removePath ||
      restorableTargetPaths(paths, targetSnapshot(state)).length !== paths.length ||
      Object.keys(context.landedBy?.(state.id, paths) || {}).length) return false;
  if (paths.some((path) => targetBaseBytes(context, state, path) === undefined)) return false;
  if (inspect) return true;
  for (const path of paths) restoreTargetBase(context, state, path);
  return true;
}

export function baseBlob(context, state, path) {
  const shown = context.gitBuffer(["show", `${context.sandboxBase(state)}:${path}`], context.root);
  return shown.status === 0 ? shown.stdout : null;
}

// The sandbox base bytes of `path`: a worktree's base commit blob, or an
// isolated copy's captured base (undefined when it cannot be proven).
export function targetBaseBytes(context, state, path) {
  return state.workspace?.mode === "copy"
    ? copyReapplyBase(context, state).bytes(path) : baseBlob(context, state, path);
}

// Whether the sandbox replay already wrote the current sandbox bytes for every
// landed path and Land still finds them not carried: another automatic sync
// would change nothing, so the agent reconciles instead of the harness looping.
function landedReplayExhausted(context, state, landedPaths) {
  const replayed = state.workspace?.landedReplay || {};
  return landedPaths.every((path) => Object.hasOwn(replayed, path) &&
    replayed[path] === context.pathIdentity(join(state.workspace.path, path)));
}

// The user's uncommitted target edits that touch other lines than the change
// (a clean 3-way merge into the sandbox copy) are carried by the harness: the
// paths and the exact target bytes are recorded here, the automatic sandbox
// sync merges them into the sandbox copies, and Prove runs again before Land
// applies. The target is never written here. A path whose recorded merge Land
// still does not find carried, or whose edit rewrote the same lines, falls
// through to the target-edit conflict decision.
// `inspect` reports the same stop without recording the carry; Land itself
// records it when it reaches the same point.
function carryTargetEdits(context, id, state, paths, landedBy, { inspect = false } = {}) {
  if (!["worktree", "copy"].includes(state.workspace?.mode) || !context.blockWithDecision ||
      !context.saveRuntime) return;
  const sandboxPath = state.workspace.path;
  const replay = context.replayTargetEdit || replayLandedEdit;
  const previous = state.workspace.targetCarried || {};
  const carry = {};
  const conflicts = [];
  for (const path of paths.filter((candidate) => !Object.hasOwn(landedBy, candidate))) {
    const target = context.pathIdentity(join(context.root, path));
    const sandbox = context.pathIdentity(join(sandboxPath, path));
    const exhausted = previous[path]?.target === target && previous[path]?.sandbox === sandbox;
    const result = exhausted ? { status: "conflict" } : replay({
      root: context.root, sandboxPath, path, baseBytes: targetBaseBytes(context, state, path) });
    if (result.status === "merged") carry[path] = target;
    else conflicts.push(path);
  }
  const carried = Object.keys(carry);
  if (!carried.length) return;
  if (!inspect) {
    state.workspace.targetCarry = carry;
    context.saveRuntime(state);
  }
  const stop = targetEditSyncStop({ changeId: id, paths: carried, conflicts });
  context.blockWithDecision(id, stop.code, stop.decision);
}

export function stopForTargetConflict(context, id, state, paths, cause, options = {}) {
  const snapshot = targetSnapshot(state);
  // Bytes an earlier change landed are part of the target: the harness first
  // replays the sandbox onto them through its own sync, then proves again.
  // That replay never runs over an applied projection, so there the agent
  // carries the landed bytes instead (target-edit-conflict, landed work kept).
  const landedBy = context.landedBy?.(id, paths) || {};
  const landed = Object.keys(landedBy);
  if (landed.length && context.blockWithDecision && state.workspace?.mode === "worktree" &&
      !state.workspace.applied && !landedReplayExhausted(context, state, landed)) {
    const stop = landedChangeSyncStop({ changeId: id, landedBy });
    return context.blockWithDecision(id, stop.code, stop.decision);
  }
  // The replay already ran and left conflicts on these exact bytes: another
  // sync would report them again, so the agent gets the resolve route.
  const pending = landed.filter((path) => pendingLandedConflict({
    record: state.workspace, path,
    targetIdentity: context.pathIdentity(join(context.root, path)),
    sandboxIdentity: context.pathIdentity(join(state.workspace.path, path))
  }));
  if (pending.length && context.blockWithDecision) {
    const stop = landedConflictStop({ changeId: id, paths: pending, landedBy });
    return context.blockWithDecision(id, stop.code, stop.decision);
  }
  carryTargetEdits(context, id, state, paths, landedBy, options);
  const stop = targetConflictStop({ changeId: id, paths, snapshot, cause, landedBy });
  if (stop.decision && context.blockWithDecision)
    return context.blockWithDecision(id, stop.code, stop.decision);
  if (stop.decision) return context.fail(stop.decision.summary);
  return context.fail(stop.message, 1, stop.details);
}

// A target mode is carried when the sandbox already has it or the target
// still has the base's executable bit (`baseExecutable`, null when unknown);
// a user `chmod` is not.
function targetModeCarried(context, sandboxPath, path, baseExecutable) {
  const target = context.pathMode(join(context.root, path));
  if (target === context.pathMode(join(sandboxPath, path))) return true;
  if (baseExecutable === null || target === null) return false;
  return Boolean(target & 0o111) === baseExecutable;
}

function gitBaseExecutable(context, state, path) {
  const listed = context.gitBuffer(["ls-tree", context.sandboxBase(state), "--", path],
    context.root);
  const base = listed.status === 0 ? String(listed.stdout).split(" ")[0] : "";
  return ["100644", "100755"].includes(base) ? base === "100755" : null;
}

// The base an isolated copy re-applies against is its baseline manifest. Its
// bytes come from the copy base store, captured now from any source that still
// hashes to the baseline row (target, sandbox copy, or the base commit when the
// copy carried Git). Without them no edit counts as carried (fail closed).
function copyReapplyBase(context, state) {
  const workspace = state.workspace;
  const baseline = workspace.baseline || {};
  return {
    baseState: copyBaselineState(context, baseline),
    executable: (path) => copyBaseExecutable(baseline, path),
    bytes: (path) => {
      captureCopyBase({ root: context.root, baseline, path, sources: [
        fileSource(join(context.root, path)), fileSource(join(workspace.path, path)),
        ...(workspace.baseHead && context.gitBuffer ? [() => baseBlob(context, state, path)] : [])
      ] });
      return copyBaseBytes({ root: context.root, baseline: workspace.baseline, path });
    }
  };
}

// The recorded base of the re-apply guard: a worktree's base commit, or an
// isolated copy's baseline. Null when the sandbox has neither.
function reapplyBase(context, state) {
  const workspace = state.workspace;
  if (workspace?.mode === "copy") return copyReapplyBase(context, state);
  if (workspace?.mode !== "worktree" || !workspace.baseHead || !context.git) return null;
  return {
    baseState: null,
    executable: (path) => gitBaseExecutable(context, state, path),
    bytes: (path) => baseBlob(context, state, path)
  };
}

// Re-apply after an earlier apply: a code path that apply never wrote must
// still be at the sandbox base or already hold the sandbox bytes, the same
// rule as root re-delivery of a composite change. A target edit the sandbox
// copy already carries is not overwritten work; any other edit takes the
// target-edit route (merged into the sandbox, or a decision), never the apply.
export function guardReapplyTargetEdits(context, id, state, entries, priorJournal) {
  const workspace = state.workspace;
  const base = reapplyBase(context, state);
  if (!base) return;
  const prior = new Map((priorJournal?.entries || []).map((entry) => [entry.path, entry]));
  const targetEdits = () => targetOverwrites({ git: context.git, files: context,
    baseState: base.baseState }, context.root, workspace.baseHead,
  entries.filter((entry) => entry.role === "code"), prior)
    .map(({ path }) => path)
    .filter((path) => !(targetModeCarried(context, workspace.path, path, base.executable(path)) &&
      targetEditCarried({ root: context.root, sandboxPath: workspace.path,
        path, baseBytes: base.bytes(path) })));
  let edits = targetEdits();
  // The same restores Land performs before a first apply: a recorded
  // `--restore-target`, or regenerable artifacts clean at isolation. True
  // tells the caller the target moved, so its entries' `before` is stale.
  const restored = Boolean(edits.length && context.writeFile && context.removePath &&
      (restoreAuthorizedTargetPaths(context, state, edits).length ||
        restoreRegenerableConflicts(context, state, edits)));
  if (restored) edits = targetEdits();
  if (!edits.length) return restored;
  stopForTargetConflict(context, id, state, edits,
    "re-apply would overwrite uncommitted target edits");
  context.fail(`re-apply would overwrite uncommitted target edits at: ${edits.join(", ")}`);
}
