// Snapshot digests: the per-entry digest fold a repository snapshot is built
// from.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isChangePacketPath } from "./workspace-surface.mjs";

export function createSnapshotDigests({
  currentChangeRelativePath
}) {
  function snapshotDigests() {
    return {
      hash: createHash("sha256"),
      codeHash: createHash("sha256"),
      reviewHash: createHash("sha256"),
      packetReviewHash: createHash("sha256")
    };
  }

  function foldSnapshotEntry(digests, id, workspace, rel, contentIdentity) {
    const reviewVolatile = new Set(["execution.yaml", "handoffs.yaml"]);
    for (const [name, digest] of Object.entries(digests)) {
      if (name === "codeHash" && isChangePacketPath(rel, id)) continue;
      if (name === "packetReviewHash" && !isChangePacketPath(rel, id)) continue;
      if (["reviewHash", "packetReviewHash"].includes(name) &&
          isChangePacketPath(rel, id) &&
          reviewVolatile.has(rel.slice(currentChangeRelativePath(id).length + 1)))
        continue;
      let identity = contentIdentity;
      if (["reviewHash", "packetReviewHash"].includes(name) &&
          rel === `${currentChangeRelativePath(id)}/tasks.md`) {
        const path = join(workspace, rel);
        if (existsSync(path)) {
          const normalized = readFileSync(path, "utf8")
            .replace(/^(\s*-\s*)\[[ xX]\]/gm, "$1[ ]");
          identity = createHash("sha256").update(normalized).digest("hex");
        }
      }
      digest.update(rel);
      digest.update("\0");
      digest.update(identity);
      digest.update("\0");
    }
  }

  return { snapshotDigests, foldSnapshotEntry };
}
