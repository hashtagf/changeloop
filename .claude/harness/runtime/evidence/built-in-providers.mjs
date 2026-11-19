// Harness-owned command providers that stand in when the project wired none:
// the npm lockfile consistency check, the static accessibility read, and the
// running-app check (browser) for a web project that has Chrome.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { accessibilityProviderConfig } from "./accessibility-check.mjs";
import { APP_SMOKE_BUILT_IN, chromePath, serveMethod } from "./app-smoke-check.mjs";

// `script(name)` resolves a harness evidence script; `writableRepositories()`
// lists the change's write repositories and may throw before they exist.
export function builtInCommandProvider(provider, script, writableRepositories) {
  if (provider === "accessibility") return accessibilityProviderConfig(script("accessibility-check.mjs"));
  if (provider === "browser") return appSmokeProvider(script, writableRepositories);
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

// The running-app check, when the change's one writable repository serves a
// web app (a dev/start/serve/preview script or an index.html) and Chrome is
// installed. Otherwise there is no built-in browser check, and a change that
// owes one keeps it as an advisory instead of a check that cannot run.
export function appSmokeProvider(script, writableRepositories, { chrome = chromePath() } = {}) {
  let repositories;
  try { repositories = writableRepositories(); }
  catch { return null; }
  const path = repositories[0]?.workspacePath || repositories[0]?.path;
  if (repositories.length !== 1 || !chrome || !path || !serveMethod(path)) return null;
  const repository = repositories[0];
  return {
    adapter: "command",
    capability: "browser",
    version: "1",
    command: ["node", script("app-smoke-check.mjs")],
    inputMode: "browser-automation",
    repository: repository.id === "root" ? undefined : repository.id,
    builtIn: APP_SMOKE_BUILT_IN
  };
}
