import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";

// Repository selection describes the agreement. Runtime records bind that
// agreement to concrete workspaces and immutable base revisions.
export function isolatedRepositoryState(state) {
  return ["worktree", "copy"].includes(state?.workspace?.mode);
}

export function compositeRepositorySelection(repositories = []) {
  return repositories.some((repository) => repository.id !== "root");
}

// Root-relative paths of every non-root repository the topology declares
// inside the control root (submodules and nested Git repositories). Their
// location in the root workspace is that repository's own pointer, never root
// task content. A missing catalog contributes nothing.
export function nestedRepositoryRelativePaths(catalogValue) {
  return [...new Set((catalogValue?.repositories || [])
    .filter((repository) => repository?.id !== "root")
    .map((repository) => String(repository?.relativePath || "")
      .replaceAll("\\", "/").replace(/\/+$/, ""))
    .filter((path) => path && path !== "." && path !== ".." && !path.startsWith("../")))];
}

export function repositoryBaseHead(repository, state) {
  const recorded = state.repositories?.[repository.id]?.baseHead ||
    (repository.id === "root" ? state.workspace?.baseHead : null);
  if (recorded) return recorded;
  if (repository.id === "root") return null;
  // Before isolation, selection may bind to the live source head. Once the
  // control workspace is isolated, that fallback would escape the sandbox.
  return !isolatedRepositoryState(state) ? repository.baseHead || null : null;
}

export function repositoryGitDirectory(repositoryPath) {
  const marker = resolve(repositoryPath, ".git");
  if (!existsSync(marker)) return null;
  try {
    if (statSync(marker).isDirectory()) return realpathSync.native(marker);
    const pointer = readFileSync(marker, "utf8").match(/^gitdir:\s*(.+?)\s*$/m)?.[1];
    return pointer ? realpathSync.native(resolve(repositoryPath, pointer)) : null;
  } catch {
    return null;
  }
}

export function repositoryCommonGitDirectory(repositoryPath) {
  const gitDirectory = repositoryGitDirectory(repositoryPath);
  if (!gitDirectory) return null;
  const commonPointer = resolve(gitDirectory, "commondir");
  try {
    return existsSync(commonPointer)
      ? realpathSync.native(resolve(gitDirectory,
        readFileSync(commonPointer, "utf8").trim()))
      : realpathSync.native(gitDirectory);
  } catch {
    return null;
  }
}

// A valid Git worktree is not sufficient: it must be registered by the
// repository selected in the agreement. Comparing common Git directories
// works for ordinary repositories, submodules, and linked worktrees without
// executing a program resolved through PATH.
// A lifecycle command re-checks every selected repository's binding many times
// (each provider read selects the repositories again); with ten repositories
// that was most of a Build `advance`. An ownership once confirmed is kept for
// the process while the worktree's `.git` pointer is unchanged; a missing or
// rewritten pointer, or a negative answer, is always checked again.
const confirmedOwnership = new Map();

function gitPointer(worktreePath) {
  try { return readFileSync(resolve(worktreePath, ".git"), "utf8"); } catch { return null; }
}

export function worktreeOwnedByTarget(worktreePath, targetPath) {
  const key = `${resolve(worktreePath)}\0${resolve(targetPath)}`;
  const pointer = gitPointer(worktreePath);
  if (pointer !== null && confirmedOwnership.get(key) === pointer) return true;
  const worktreeOwner = repositoryCommonGitDirectory(worktreePath);
  const targetOwner = repositoryCommonGitDirectory(targetPath);
  const owned = Boolean(worktreeOwner && targetOwner && worktreeOwner === targetOwner);
  if (owned && pointer !== null) confirmedOwnership.set(key, pointer);
  else confirmedOwnership.delete(key);
  return owned;
}
