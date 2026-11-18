// Harness-owned command providers that stand in when the project wired none:
// the npm lockfile consistency check and the static accessibility read.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { accessibilityProviderConfig } from "./accessibility-check.mjs";

// `script(name)` resolves a harness evidence script; `writableRepositories()`
// lists the change's write repositories and may throw before they exist.
export function builtInCommandProvider(provider, script, writableRepositories) {
  if (provider === "accessibility") return accessibilityProviderConfig(script("accessibility-check.mjs"));
  if (provider !== "dependency-supply-chain") return null;
  let repositories;
  try { repositories = writableRepositories(); }
  catch { return null; }
  const candidates = repositories.filter((repository) =>
    existsSync(join(repository.workspacePath, "package.json")) &&
    existsSync(join(repository.workspacePath, "package-lock.json")));
  if (candidates.length !== 1) return null;
  const repository = candidates[0];
  return {
    adapter: "command",
    capability: "dependency-supply-chain",
    version: "2",
    command: ["node", script("npm-lockfile-check.mjs")],
    repository: repository.id === "root" ? undefined : repository.id,
    // Workspace/local manifests and npm configuration affect the install
    // plan too. Whole-workspace binding avoids reusing incomplete evidence.
    builtIn: "npm-lockfile-consistency-v2"
  };
}
