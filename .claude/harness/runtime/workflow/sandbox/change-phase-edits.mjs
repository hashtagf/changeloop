import { recordSignal } from "../../core/signals.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import { harnessOwnedPath, startManifest } from "../../core/start-manifest.mjs";

// Product files an agent wrote into the target during Change, before the
// sandbox existed, are carried into the sandbox when it is created. If the
// agent then deletes or reverts them in the target, Land finds the target
// differs from the sandbox's base and stops. Build's first action names them.

export const CHANGE_PHASE_EDITS_SIGNAL = "change-phase-target-edits";

// Product paths that differ between the change-start record and now.
export function changePhaseEditPaths(before = {}, now = {}) {
  return [...new Set([...Object.keys(before), ...Object.keys(now)])]
    .filter((path) => !harnessOwnedPath(path) && before[path] !== now[path]).sort();
}

export function changePhaseEditsMessage(paths) {
  const listed = paths.slice(0, 10).join(", ") + (paths.length > 10 ? `, and ${paths.length - 10} more` : "");
  return `Product files changed in the target during Change, before the sandbox existed: ${listed}. ` +
    "The sandbox now holds them; edit them only inside the sandbox. Do not delete, revert, or edit " +
    "them in the target: Land writes the sandbox's version over them, and a target that changes again " +
    "stops Land.";
}

// Compares the workspace recorded at change start with the target now and
// records the signal. `start` is the change-start workspace record: a Git
// target compares its dirty files, a target without Git its file manifest.
export function reportChangePhaseEdits(root, start, { dirtyNow = null, manifest = startManifest } = {}) {
  if (!start || start.mode !== "current") return [];
  const paths = start.startManifest
    ? changePhaseEditPaths(start.startManifest, manifest(root) || start.startManifest)
    : changePhaseEditPaths(start.preexisting || {}, dirtyNow ? dirtyNow() : {});
  if (paths.length) recordSignal(CHANGE_PHASE_EDITS_SIGNAL, changePhaseEditsMessage(paths));
  return paths;
}

// The sandbox creation Build runs, reporting change-phase edits once the
// sandbox exists. A failed comparison never fails the creation.
export function withChangePhaseEdits(createSingle, { root, loadRuntime, dirtyNow }) {
  return (id) => {
    const start = loadRuntime(id).workspace;
    createSingle(id);
    bestEffort(() => reportChangePhaseEdits(root, start, { dirtyNow }));
  };
}
