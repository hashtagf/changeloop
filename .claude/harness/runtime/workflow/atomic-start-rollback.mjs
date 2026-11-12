import { existsSync, lstatSync, rmSync } from "node:fs";
import { join } from "node:path";

// Undoes a failed atomic `change start`: removes the sandboxes it created
// (recorded or not) and the change's packet, runtime, receipts, evidence,
// handoffs, and snapshot. Returns the cleanup issues; never throws for one.
export function rollbackAtomicStart({
  root, readJson, runtimePath, changePath, snapshotPath, trapFailures, selectedRepositories,
  cleanupRepositorySandboxes, cleanupAppliedSandbox, ownedPaths
}, id) {
  const issues = [];
  const state = readJson(runtimePath(id), {
    id,
    workspace: { mode: "current", path: root }
  });
  const repositories = cleanupRepositorySandboxes(id, state);
  for (const [repositoryId, result] of Object.entries(repositories))
    if (["failed", "refused"].includes(result.status))
      issues.push(`repository sandbox '${repositoryId}': ${result.reason || result.status}`);
  // Multi-repository setup can fail after worktrees were created but before
  // their in-memory records were saved. Re-resolve the already-validated
  // selection and clean only its fixed Foundation-owned paths.
  let selected = [];
  const repositorySandboxRoot = join(
    root, ".foundation", "repository-sandboxes", id);
  if (existsSync(repositorySandboxRoot)) {
    try {
      trapFailures(() => { selected = selectedRepositories(id, state); });
    } catch (error) {
      issues.push(`repository sandbox discovery: ${error.message || error}`);
    }
  }
  const unrecordedRepositories = {};
  for (const repository of selected) {
    if (repository.id === "root") continue;
    const path = join(root, ".foundation", "repository-sandboxes", id, repository.id);
    if (!existsSync(path)) continue;
    unrecordedRepositories[repository.id] = {
      mode: "worktree", path, targetPath: repository.path
    };
  }
  const unrecorded = cleanupRepositorySandboxes(id, {
    repositories: unrecordedRepositories
  });
  for (const [repositoryId, result] of Object.entries(unrecorded))
    if (["failed", "refused"].includes(result.status))
      issues.push(`unrecorded repository sandbox '${repositoryId}': ${
        result.reason || result.status}`);
  const applied = cleanupAppliedSandbox(id, state);
  if (["failed", "refused"].includes(applied.status))
    issues.push(`sandbox: ${applied.reason || applied.status}`);

  // A worktree/copy can exist before createSingle persists it in runtime state
  // (for example when copying the packet into a new worktree fails). Clean the
  // one fixed Foundation-owned path as a fallback; never infer a broad target.
  const expectedSandbox = join(root, ".foundation", "sandboxes", id);
  if (existsSync(expectedSandbox) && state.workspace?.path !== expectedSandbox) {
    const metadata = join(expectedSandbox, ".git");
    let mode = "copy";
    try {
      if (existsSync(metadata) && lstatSync(metadata).isFile()) mode = "worktree";
    } catch { /* cleanup as a bounded copy when metadata disappeared */ }
    const fallback = cleanupAppliedSandbox(id, {
      workspace: { mode, path: expectedSandbox }
    });
    if (["failed", "refused"].includes(fallback.status))
      issues.push(`unrecorded sandbox: ${fallback.reason || fallback.status}`);
  }

  for (const path of [
    changePath(id), runtimePath(id), ...ownedPaths(id), snapshotPath(id)
  ]) {
    try { rmSync(path, { recursive: true, force: true }); }
    catch (error) { issues.push(`${path}: ${error.message}`); }
  }
  return issues;
}
