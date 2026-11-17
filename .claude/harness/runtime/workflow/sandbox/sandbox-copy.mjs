import {
  cpSync, existsSync, lstatSync, mkdirSync, readlinkSync, readdirSync, realpathSync,
  rmSync, statSync
} from "node:fs";
import { constants as fsConstants } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import {
  ROOT_ONLY_EXCLUDED_DIRS, isExcludedPath, trackedPathSet
} from "../../core/workspace-surface.mjs";
import { pathInside } from "../../core/paths.mjs";
import { bestEffort } from "../../core/best-effort.mjs";

// `cpSync` resolves symlinks by default: a relative link is rewritten as an
// absolute path into the *source* tree. In a sandbox that is not a cosmetic
// difference — anything following the link writes into the real project while
// believing it is isolated, and git inside the copy reports the rewritten link
// as a modification the change never made. `land-journal.mjs` already carries
// these two options for the same reason on the way back out.
export const VERBATIM_COPY = { dereference: false, verbatimSymlinks: true };

export function carryableGitMetadata(root) {
  const gitPath = join(root, ".git");
  if (!existsSync(gitPath)) return false;
  try { return statSync(gitPath).isDirectory(); }
  catch { return false; }
}

// Asked of the target even when the copy cannot carry its `.git` (a linked
// worktree or a submodule checkout has a `.git` file): that target is still a
// repository whose ignore rules decide what is no change's content. Without a
// repository the listing fails and nothing is treated as ignored.
export function ignoredSandboxPaths(root, git) {
  const listed = git(
    ["ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--directory"],
    root);
  if (listed.status !== 0) return new Set();
  return new Set(listed.stdout.split("\0").filter(Boolean)
    .map((path) => path.endsWith("/") ? path.slice(0, -1) : path));
}

// A root that is no Git repository but gathers repositories (a folder of
// checkouts). Its nested repositories are no part of the root's work: a
// declared one has its own sandbox and an undeclared one cannot Land.
export function gatheringRoot(root) {
  return !existsSync(join(root, ".git"));
}

// A directory below `root` that is itself a Git checkout (`.git` directory or
// file). Only consulted for a gathering root.
function nestedRepositoryDirectory(root, rel) {
  return Boolean(rel) && existsSync(join(root, rel, ".git"));
}

// The nearest directory above `rel` (inside `root`) that is a Git checkout,
// or null.
export function nestedRepositoryAncestor(root, rel) {
  const parts = String(rel || "").split("/").filter(Boolean);
  for (let index = 1; index < parts.length; index += 1) {
    const prefix = parts.slice(0, index).join("/");
    if (nestedRepositoryDirectory(root, prefix)) return prefix;
  }
  return null;
}

// A copy that carries Git leaves each declared nested repository directory
// empty, as a worktree does: the root sandbox projects it afterwards. A
// gathering root (no Git at all) copies none of its nested repositories:
// copying them made a 17 GB sandbox of a folder whose change touched one.
export function sandboxCopyPlan({
  root, carriesGit, git, sandboxCopyExcludedDirs, excludedWorkspaceDirs, nestedPaths = []
}) {
  const copyExcluded = carriesGit ? sandboxCopyExcludedDirs : excludedWorkspaceDirs;
  const listed = carriesGit ? git(["ls-files", "-z"], root) : { status: 1, stdout: "" };
  const listedPaths = listed.status === 0 ? listed.stdout.split("\0").filter(Boolean) : [];
  const tracked = trackedPathSet(listedPaths);
  const ignored = ignoredSandboxPaths(root, git);
  const gathering = !carriesGit && gatheringRoot(root);
  const nested = carriesGit || gathering ? nestedPaths : [];
  const excludes = (rel) => ignored.has(rel) ||
    nested.some((path) => rel.startsWith(`${path}/`) || (gathering && rel === path)) ||
    (gathering && nestedRepositoryDirectory(root, rel)) ||
    isExcludedPath(rel, { excluded: copyExcluded, tracked: tracked.has(rel) });
  const filter = (source) =>
    !excludes(relative(root, source).replaceAll("\\", "/"));
  return { listed, listedPaths, excludes, filter };
}

// A live checkout can lose a path mid-copy (git's background auto-gc prunes
// loose object directories), so a vanished source restarts the copy.
const SANDBOX_COPY_ATTEMPTS = 3;

export function copySandboxEntries({ root, requestedPath, plan, fail }) {
  for (let attempt = 1; ; attempt++) {
    try {
      for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (plan.excludes(entry.name)) continue;
        cpSync(join(root, entry.name), join(requestedPath, entry.name), {
          recursive: true,
          mode: fsConstants.COPYFILE_FICLONE,
          ...VERBATIM_COPY,
          filter: plan.filter
        });
      }
      return;
    } catch (error) {
      rmSync(requestedPath, { recursive: true, force: true });
      if (error?.code === "ENOENT" && attempt < SANDBOX_COPY_ATTEMPTS) continue;
      fail(`cannot create sandbox copy: ${error.message}; partial copy removed`);
    }
  }
}

export function copyTrackedRootMetadata(root, requestedPath, listedPaths) {
  for (const rel of listedPaths) {
    if (!ROOT_ONLY_EXCLUDED_DIRS.has(rel.split("/")[0])) continue;
    const source = join(root, rel);
    if (!existsSync(source)) continue;
    const destination = join(requestedPath, rel);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(source, destination, VERBATIM_COPY);
  }
}

export function copiedPreexistingDigests(path, preexisting, fileDigest) {
  const carried = {};
  for (const rel of Object.keys(preexisting || {})) {
    const copied = join(path, rel);
    bestEffort(() => {
      if (existsSync(copied)) carried[rel] = fileDigest(copied);
    });
  }
  return carried;
}

export function sandboxCopyWorkspace({
  id, root, path, reason, carriesGit, preexisting, gitHead, workspaceManifest,
  fileDigest, directoryHash, changePath, packetManifest
}) {
  return {
    preexisting,
    mode: "copy", path, applied: false, reason,
    baseHead: carriesGit ? gitHead(root) : null,
    git: carriesGit ? "carried" : "absent",
    baseline: workspaceManifest(root, id, true),
    sandboxBaseline: workspaceManifest(path, id, true),
    sandboxPreexisting: copiedPreexistingDigests(path, preexisting, fileDigest),
    changeSourceHash: directoryHash(changePath(id)),
    packetSnapshot: packetManifest(join(path, "openspec", "changes", id))
  };
}

export function gitBaseCheckoutPaths(repository, path) {
  const paths = [path];
  let current = resolve(repository.path, path);
  const visited = new Set();
  for (;;) {
    if (visited.has(current)) return { paths, error: "symlink-cycle" };
    if (visited.size >= 64) return { paths, error: "symlink-depth-exceeded" };
    visited.add(current);
    let stat;
    try { stat = lstatSync(current); }
    catch { break; }
    if (!stat.isSymbolicLink()) break;
    current = resolve(dirname(current), readlinkSync(current));
    const target = relative(repository.path, current).replaceAll("\\", "/");
    if (!target || target === ".." || target.startsWith("../") || isAbsolute(target))
      return { paths, error: "symlink-target-outside-repository" };
    paths.push(target);
  }
  return { paths, error: null };
}

export function gitBaseCheckoutStatus(repository, path, gitBuffer) {
  if (!repository?.baseHead) return null;
  const checkout = gitBaseCheckoutPaths(repository, path);
  if (checkout.error) return checkout.error;
  for (const candidate of checkout.paths) {
    const exists = gitBuffer(
      ["cat-file", "-e", `${repository.baseHead}:${candidate}`], repository.path);
    if (exists.status !== 0) return "missing-from-base";
  }
  const diff = gitBuffer(
    ["diff", "--quiet", repository.baseHead, "--", ...checkout.paths], repository.path);
  return diff.status === 0 ? null : "differs-from-base";
}

export function isPacketLocalSource(packetPath, sourcePath) {
  try {
    const packet = resolve(packetPath);
    const source = resolve(sourcePath);
    return pathInside(packet, source) && pathInside(realpathSync(packet), realpathSync(source));
  } catch {
    return false;
  }
}

export function groundingPortabilityFindings(grounding, repositories, portable) {
  if (!Array.isArray(grounding?.readSet)) return [];
  const selected = new Map(repositories.map((repository) =>
    [repository.id, repository]));
  return grounding.readSet.flatMap((source) => {
    const repository = selected.get(source.repository || "root");
    if (!repository || !source.path || !repository.baseHead) return [];
    const reason = portable(repository, source);
    return reason === null ? [] : [{
      repository: repository.id,
      path: source.path,
      reason
    }];
  });
}

export function sandboxMovementLine(movement) {
  const shortHead = (value) => String(value || "").slice(0, 8);
  if (!movement) return "";
  if (!movement.multiRepository && movement.repositories.length === 1) {
    return movement.rebased
      ? `\n  rebased: ${shortHead(movement.from)} -> ${shortHead(movement.to)} (sandbox commits flattened into the replayed diff)`
      : `\n  target moved: ${shortHead(movement.repositories[0].from)} -> ${shortHead(movement.repositories[0].to)} (sandbox NOT rebased)`;
  }
  return movement.repositories.map((repository) => repository.rebased
    ? `\n  rebased ${repository.repository}: ${shortHead(repository.from)} -> ${shortHead(repository.to)} (sandbox commits flattened into the replayed diff)`
    : `\n  target moved ${repository.repository}: ${shortHead(repository.from)} -> ${shortHead(repository.to)} (sandbox NOT rebased)`).join("");
}
