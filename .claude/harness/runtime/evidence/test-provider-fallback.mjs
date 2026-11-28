// A test provider for a repository without package.json: the project's own
// quality test lane when quality/foundation-quality.json declares one, else
// the test command quality discovery detects for the repository's language.
// One lane in a single-repository project is wired automatically (high);
// several lanes or repositories are proposed for review, never guessed.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const quote = (value) => /^[\w@%+=:,./-]+$/.test(value) ? value : `'${String(value).replace(/'/g, "'\\''")}'`;
const shell = (command) => command.map(quote).join(" ");

function qualityTestLanes(root, repositoryId) {
  const path = join(root, "quality", "foundation-quality.json");
  if (!existsSync(path)) return [];
  let config;
  try { config = JSON.parse(readFileSync(path, "utf8")); } catch { return []; }
  const entry = (config?.repositories || []).find((row) => row?.id === repositoryId);
  return Object.entries(entry?.providers || {})
    .filter(([key, provider]) => (key === "test" || key.startsWith("test:") || provider?.capability === "test") &&
      Array.isArray(provider?.command) && provider.command.length)
    .map(([key, provider]) => ({ key, command: provider.command.map(String), cwd: provider.cwd || null }));
}

function laneCommand(lanes) {
  if (lanes.length === 1 && !lanes[0].cwd) return lanes[0].command;
  return ["sh", "-c", lanes.map((lane) =>
    lane.cwd ? `(cd ${quote(lane.cwd)} && ${shell(lane.command)})` : `(${shell(lane.command)})`).join(" && ")];
}

/**
 * @param {{ id: string, workspacePath: string, relativePath?: string }} repository
 * @param {number} repositoryCount
 * @param {{ root: string, discover?: ((repository: any) => any) | null }} options
 *   `discover` is quality discovery, injected by the composition root.
 */
export function fallbackTestCandidates(repository, repositoryCount, { root, discover = null }) {
  const lanes = qualityTestLanes(root, repository.id);
  let command = null;
  let source = null;
  let detail = null;
  if (lanes.length) {
    command = laneCommand(lanes);
    source = `quality/foundation-quality.json#${lanes.map((lane) => lane.key).join(",")}`;
    detail = lanes.length > 1 ? `${lanes.length} test lanes run in order; review the chain` : "the project's quality test lane";
  } else {
    let found = null;
    try {
      found = discover && discover({ id: repository.id, path: repository.workspacePath,
        relativePath: repository.relativePath || "." });
    } catch { found = null; }
    const test = found?.providers?.test;
    if (Array.isArray(test?.command) && test.command.length) {
      command = test.command.map(String);
      source = `quality discovery (${(found.profiles || []).join(", ") || "no profile"})`;
      detail = "the test command quality discovery detected for this repository";
    }
  }
  if (!command) return [];
  const single = repositoryCount === 1 && repository.id === "root";
  const confidence = single && lanes.length <= 1 ? "high" : "review";
  const config = { adapter: "test-discovery", command, minimum: 1, reportFormat: "auto" };
  return [{
    provider: single ? "test" : `test-${repository.id}`,
    capability: "test", repository: repository.id, confidence, recommended: confidence === "high",
    source, detail,
    config: single ? config : { ...config, capability: "test", repository: repository.id }
  }];
}
