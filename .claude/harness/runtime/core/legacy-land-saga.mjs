// Change Loop 3.7.0 and earlier could leave a multi-repository change inside
// the retired commit-based Land saga (`land record` / `land pointers`): child
// commits bound in runtime state and submodule pointers staged in the control
// repository. 3.8 removed that saga; Land delivers uncommitted workspaces only.
// Carrying such a change forward would replay already-landed child commits as
// uncommitted diffs, so every route refuses it with the exact recovery instead.

export const LEGACY_LAND_SAGA_RELEASE = "3.7.0";

const LEGACY_REPOSITORY_LAND_STATUSES = new Set([
  "child-landed", "awaiting-explicit-commit", "awaiting-explicit-branch-land",
  "awaiting-root-pointer"
]);

// The runtime-state fields only the retired saga wrote. Archived and
// abandoned changes are finished and are never reported.
export function legacyLandSagaMarkers(state) {
  if (!state || typeof state !== "object" ||
      ["archived", "abandoned"].includes(state.status)) return [];
  const markers = [];
  for (const [repositoryId, runtime] of Object.entries(state.repositories || {})) {
    if (repositoryId === "root" || !runtime || typeof runtime !== "object") continue;
    if (runtime.land?.commit)
      markers.push({ field: `repositories.${repositoryId}.land.commit`, value: runtime.land.commit });
    if (LEGACY_REPOSITORY_LAND_STATUSES.has(runtime.land?.status))
      markers.push({ field: `repositories.${repositoryId}.land.status`, value: runtime.land.status });
  }
  if (state.land?.strategy === "ordered-resumable-saga")
    markers.push({ field: "land.strategy", value: state.land.strategy });
  return markers;
}

export function legacyLandSagaRecovery(id) {
  const runtimeFile = `.foundation/runtime/${id}.json`;
  const abandon = `claude-foundation change abandon ${id} --reason <reason> --decision-ref <ref>`;
  return {
    runtimeFile,
    abandonCommand: abandon,
    finish: `Reinstall Change Loop ${LEGACY_LAND_SAGA_RELEASE} into this project ` +
      `(bash install.sh <project> --source <changeloop-${LEGACY_LAND_SAGA_RELEASE} checkout> --yes), ` +
      `finish the change there with 'claude-foundation advance ${id} --through archived', ` +
      "then upgrade again.",
    summary: `Change '${id}' is mid-way through the commit-based multi-repository Land saga ` +
      `that Change Loop ${LEGACY_LAND_SAGA_RELEASE} and earlier used (land record / land pointers). ` +
      `This release no longer runs that saga, so it will not build, prove, or land this change; ` +
      `its state in ${runtimeFile} is kept unchanged.`
  };
}

// The user decision every route returns for such a change. Nothing is
// recorded: each option names its own route, and an unresolved change is
// asked again the same way.
export function legacyLandSagaDecision(id, markers) {
  const recovery = legacyLandSagaRecovery(id);
  return {
    kind: "legacy-land-saga",
    summary: recovery.summary,
    files: [recovery.runtimeFile],
    markers,
    options: [
      { id: "finish-with-previous-release", outcome: recovery.finish },
      { id: "abandon", outcome: "Retire the change; abandon keeps its sandboxes' unlanded " +
          "commits and bytes as backups and never touches Git.", command: recovery.abandonCommand },
      { id: "pause", outcome: `Leave the change and ${recovery.runtimeFile} unchanged.` }
    ],
    recommended: "finish-with-previous-release"
  };
}

export function legacyLandSagaLine(id, markers) {
  const recovery = legacyLandSagaRecovery(id);
  return `${recovery.summary} Markers: ${markers.map((row) => `${row.field}=${row.value}`).join(", ")}. ` +
    `Recovery: ${recovery.finish} Or retire it with '${recovery.abandonCommand}'.`;
}
