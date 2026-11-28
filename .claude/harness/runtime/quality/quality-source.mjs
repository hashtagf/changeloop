// Where a quality run reads its configuration and baselines. A change in
// Build or Prove is measured against the quality files of its own sandbox, so
// a change that adds a lane or moves a baseline is proven with it; otherwise
// (no change, an applied workspace, or a sandbox without the configuration)
// the project root, as before. Lane results and history stay at the root.
import { existsSync } from "node:fs";
import { join } from "node:path";

export const QUALITY_CONFIG_FILE = "quality/foundation-quality.json";

/**
 * @param {{ root: string, change?: string | null, loadRuntime: (id: string) => any }} options
 * @returns {string} the directory holding quality/foundation-quality.json and quality/baselines
 */
export function qualitySourceRoot({ root, change = null, loadRuntime }) {
  if (!change) return root;
  let workspace = null;
  try { workspace = loadRuntime(change)?.workspace || null; } catch { workspace = null; }
  if (!workspace?.path || workspace.applied) return root;
  return existsSync(join(workspace.path, QUALITY_CONFIG_FILE)) ? workspace.path : root;
}
