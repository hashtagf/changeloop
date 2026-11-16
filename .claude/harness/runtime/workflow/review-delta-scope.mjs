// Pure shaping for a delta AI review: which changed-surface rows the second
// round reviews, the findings it must close, and the packet sections it keeps.
// dispatchAuthorityUnlocked in authority-runtime.mjs owns store, lock and fail.
import { blockingReviewFindings } from "../evidence/review-attempt-store.mjs";
import { deltaReviewInspection } from "./packet-runtime.mjs";

const rowKey = (row) => `${row.repositoryId}/${row.path}`;

// Rows changed since the base dispatch, plus base rows now gone (reverted).
// A retry already carries a projected delta: its missing base rows are
// unchanged files, not a revert, so its manifest is kept as it is.
export function deltaScopeRows(baseManifest, currentManifest, projected) {
  let scopeRows = currentManifest;
  if (!projected) {
    const baseRows = new Map(baseManifest.map((row) => [rowKey(row), row]));
    const currentRows = new Map(currentManifest.map((row) => [rowKey(row), row]));
    scopeRows = currentManifest.filter((row) =>
      baseRows.get(rowKey(row))?.identity !== row.identity);
    for (const [key, row] of baseRows)
      if (!currentRows.has(key)) scopeRows.push({ ...row, identity: "reverted-to-base" });
  }
  scopeRows.sort((left, right) => rowKey(left).localeCompare(rowKey(right)));
  return scopeRows;
}

export function closureFindingsValue(source) {
  const closureFindings = blockingReviewFindings(source);
  return {
    baseAttemptDigest: source.digest,
    ids: closureFindings.map((finding) => finding.id).sort(),
    findings: closureFindings
  };
}

// Narrows a delta packet to the correction scope: its changed surface, the
// base round's findings to close, and only the contract artifacts it changed.
export function applyDeltaPacket(packet, {
  request, scopeRows, scopePaths, baseAttempt, baseAttemptDigest, baseWorkspaceHash, stableHash
}) {
  const inspection = deltaReviewInspection(scopeRows, request.packet?.changedSurface?.inspection);
  packet.changedSurface = {
    paths: scopePaths,
    digest: stableHash(scopePaths),
    inspection,
    rows: scopeRows,
    manifest: scopeRows,
    deltaFrom: {
      attemptDigest: baseAttemptDigest,
      workspaceHash: baseWorkspaceHash
    }
  };
  packet.closureFindings = closureFindingsValue(baseAttempt);
  const changedContractNames = new Set(scopeRows
    .filter((row) => row.kind === "contract-artifact")
    .map((row) => row.relativePath));
  const artifactName = (name) => name;
  const artifactRelativePath = (_name, artifact) => artifact?.relativePath || null;
  const selectedDeltaArtifacts = (artifacts, pathFor) =>
    Object.fromEntries(Object.entries(artifacts).filter(([name, artifact]) =>
      [...changedContractNames].some((path) => path === pathFor(name, artifact) ||
        path.startsWith(`${pathFor(name, artifact)}/`))));
  const artifactCollection = (value) => value && typeof value === "object" ? value : {};
  packet.contractArtifacts = selectedDeltaArtifacts(
    artifactCollection(request.packet?.contractArtifacts), artifactName);
  packet.decisions = selectedDeltaArtifacts(
    artifactCollection(request.packet?.decisions), artifactRelativePath);
  packet.references = selectedDeltaArtifacts(
    artifactCollection(request.packet?.references), artifactRelativePath);
  packet.grounding = changedContractNames.has("grounding.yaml")
    ? request.packet.grounding : null;
  if (!changedContractNames.has("evidence.yaml")) packet.claims = {
    reuseFromAttempt: baseAttemptDigest,
    digest: stableHash(request.packet?.claims || [])
  };
  return packet;
}
