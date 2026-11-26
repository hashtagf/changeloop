import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { EXCLUDED_WORKSPACE_DIRS } from "./workspace-policy.mjs";
import { bestEffort } from "./best-effort.mjs";

// Paths the harness itself writes; never product work.
export const HARNESS_PATH_PREFIXES = Object.freeze([".foundation/", "openspec/changes/", "openspec/investigations/"]);
export const harnessOwnedPath = (path) => HARNESS_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

const MAX_FILES = 5_000;

// A digest of every project file at change start, for a target without Git
// (a Git target records its dirty files instead). Null when the tree is too
// large to read once or unreadable, so nothing is guessed from it later.
export function startManifest(root) {
  const manifest = {};
  let count = 0;
  const walk = (directory, prefix) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (count > MAX_FILES) return;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (EXCLUDED_WORKSPACE_DIRS.has(entry.name) || harnessOwnedPath(`${rel}/`)) continue;
        walk(join(directory, entry.name), rel);
      } else if (entry.isFile()) {
        count += 1;
        manifest[rel] = createHash("sha256").update(readFileSync(join(directory, entry.name))).digest("hex");
      }
    }
  };
  if (bestEffort(() => { walk(root, ""); return false; }, true)) return null;
  return count > MAX_FILES ? null : manifest;
}
