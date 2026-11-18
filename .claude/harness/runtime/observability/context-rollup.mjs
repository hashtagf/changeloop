// The context-event rollup: per-change totals that pending context events
// fold into, the lock that serializes a drain, and the normalization that
// treats a re-read rollup as external input.
import { existsSync, openSync, rmSync, statSync } from "node:fs";
import { measuredNumber } from "../core/measured-number.mjs";

export function normalizedContextRollup(id, loaded) {
  const rollup = {
    version: 1,
    changeId: id,
    count: measuredNumber(loaded.count) ?? 0,
    totalBytes: measuredNumber(loaded.totalBytes) ?? 0,
    byKind: {}
  };
  const archivedKinds = loaded.byKind && typeof loaded.byKind === "object"
    ? Object.entries(loaded.byKind) : [];
  for (const [kind, archived] of archivedKinds) {
    const count = measuredNumber(archived?.count);
    const totalBytes = measuredNumber(archived?.totalBytes);
    const maxBytes = measuredNumber(archived?.maxBytes);
    if (count === null || totalBytes === null || maxBytes === null) continue;
    rollup.byKind[kind] = { count, totalBytes, maxBytes };
  }
  return rollup;
}

// One pending context event folded into the rollup; a row without a kind
// or a measured byte count is dropped rather than counted as zero.
export function foldContextEvent(rollup, row) {
  const bytes = measuredNumber(row.bytes);
  if (!row.kind || bytes === null) return;
  rollup.count += 1;
  rollup.totalBytes += bytes;
  const summary = rollup.byKind[row.kind] ||= { count: 0, totalBytes: 0, maxBytes: 0 };
  summary.count += 1;
  summary.totalBytes += bytes;
  summary.maxBytes = Math.max(summary.maxBytes, bytes);
}

// The rollup drain's exclusive lock, reclaiming one a crashed drain left
// more than five minutes ago; null when another drain holds it.
export function acquireRollupLock(lockPath) {
  try { return openSync(lockPath, "wx"); } catch {
    if (!existsSync(lockPath) || Date.now() - statSync(lockPath).mtimeMs <= 300000) return null;
    rmSync(lockPath, { force: true });
    return openSync(lockPath, "wx");
  }
}
