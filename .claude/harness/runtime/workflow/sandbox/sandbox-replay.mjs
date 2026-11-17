import { resumeThrough } from "../../core/next-step.mjs";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isInvestigationPath, sandboxCodePathspec } from "../../core/workspace-surface.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import {
  VERBATIM_COPY, gitBaseCheckoutStatus, groundingPortabilityFindings,
  isPacketLocalSource
} from "./sandbox-copy.mjs";

export function carrySandboxIgnoredArtifacts(context, sourcePath, stagingPath) {
  const listed = context.git(["ls-files", "-z", "--others", "--ignored",
    "--exclude-standard", "--directory"], sourcePath);
  if (listed.status !== 0) return;
  for (const entry of listed.stdout.split("\0").filter(Boolean)) {
    const to = join(stagingPath, entry);
    if (context.pathExists(to)) continue;
    bestEffort(() => {
      context.makeDirectory(dirname(to), { recursive: true });
      context.rename(join(sourcePath, entry), to);
    }); // Best effort: an artifact that cannot move falls back to rebuilding it.
  }
}

export function commitSandboxReplay(context, id, state, prepared) {
  const { movement, record, targetPath, staging, patch } = prepared;
  if (prepared.packetHash) assertReplayPacket(id, prepared, context.directoryHash);
  context.carryIgnoredArtifacts(record.path, staging);
  const removed = context.git(["worktree", "remove", "--force", record.path], targetPath);
  if (removed.status !== 0)
    context.fail(`cannot replace the '${movement.repository}' sandbox worktree: ${
      removed.stderr.trim()}. Prepared replay remains at '${staging}' with patch '${patch}'.`);
  const moved = context.git(["worktree", "move", staging, record.path], targetPath);
  if (moved.status !== 0)
    context.fail(`the '${movement.repository}' sandbox worktree was removed and its replacement could not be moved into place: ${
      moved.stderr.trim()}. The replayed work is at '${staging}' and the patch at '${patch}'.`);
  record.baseHead = movement.to;
  if (movement.repository === "root") state.workspace.baseHead = movement.to;
  const repository = context.selectedRepositories(id, state)
    .find((entry) => entry.id === movement.repository);
  if (repository?.setupCommand && movement.repository !== "root") {
    context.runSetupCommand(record, repository.setupCommand,
      context.policy().sandbox?.setupTimeoutMs, record.path, repository.id);
    if (record.access === "read") {
      const changed = context.git(["status", "--porcelain"], record.path);
      if (changed.status !== 0 || changed.stdout.trim()) {
        record.setup.status = "failed";
        record.setup.reason = "setup modified a read-only repository";
      }
    }
  }
  movement.rebased = true;
}

export function preserveReplayPacket(id, prepared, directoryHash) {
  const packet = join("openspec", "changes", id);
  const source = join(prepared.record.path, packet);
  const destination = join(prepared.staging, packet);
  const expected = directoryHash(source);
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, ...VERBATIM_COPY });
  if (directoryHash(destination) !== expected || directoryHash(source) !== expected)
    throw new Error("amended packet changed while preparing sandbox replay; original sandbox preserved");
  prepared.packetHash = expected;
}

export function assertReplayPacket(id, prepared, directoryHash) {
  const packet = join("openspec", "changes", id);
  if (directoryHash(join(prepared.record.path, packet)) !== prepared.packetHash ||
      directoryHash(join(prepared.staging, packet)) !== prepared.packetHash)
    throw new Error("amended packet changed before sandbox replay; original sandbox preserved");
}

export function recoverAmendedReplay(context, id, state) {
  const workspace = state.workspace;
  const pending = workspace?.amendmentReplay;
  if (!pending) return false;
  const staging = `${workspace.path}.rebase`;
  const originalExists = context.pathExists(workspace.path);
  const candidate = originalExists ? workspace.path : staging;
  const head = context.gitHead(candidate);
  if (workspace.mode !== "worktree" || !context.ownsWorktree(candidate, context.root) ||
      !context.pathExists(join(candidate, "openspec", "changes", id)) ||
      (!originalExists && (head !== pending.to ||
        context.directoryHash(join(candidate, "openspec", "changes", id)) !== pending.packetHash)))
    context.fail(`interrupted amendment replay for '${id}' cannot be verified; preserve '${workspace.path}' and '${staging}' and inspect the retained work before recovery`);
  if (!originalExists) {
    const moved = context.git(["worktree", "move", staging, workspace.path], context.root);
    if (moved.status !== 0)
      context.fail(`cannot restore the verified amendment replay for '${id}': ${moved.stderr.trim()}; retained at '${staging}', retry sandbox sync`);
  }
  // An original that still exists may have newer agent edits after an aborted
  // replay. Keep those bytes and discard only the checkpoint; ordinary approval
  // and proof checks must evaluate them, never restore the older staged copy.
  // Staging already incorporates pending.to. Keeping pending.from would replay
  // upstream changes as product edits if the target moves again before resume.
  // The original can also be the moved staging plus later agent commits; retain
  // those commits as product work by recording the verified replay base, not HEAD.
  const replayed = !originalExists || head === pending.to ||
    context.git(["merge-base", "--is-ancestor", pending.to, head], candidate).status === 0;
  if (replayed) {
    workspace.baseHead = pending.to;
    if (state.repositories?.root?.path === workspace.path)
      state.repositories.root.baseHead = pending.to;
    context.invalidateProof?.(id, state);
  }
  delete workspace.amendmentReplay;
  context.saveRuntime(state);
  return !originalExists;
}

export function unrelatedSandboxTargetChanges(context, id, state, statusOutput) {
  const allowedPrefix = `openspec/changes/${id}/`;
  const preexisting = state.workspace?.preexisting || {};
  const unrelated = [];
  for (const row of context.porcelainStatusRecords(statusOutput)) {
    const path = row.path;
    if (path === `openspec/changes/${id}` || path.startsWith(allowedPrefix)) continue;
    if (path === ".foundation" || path.startsWith(".foundation/")) continue;
    if (path === "openspec/changes" || path.startsWith("openspec/changes/")) continue;
    if (isInvestigationPath(path)) continue;
    if (Object.prototype.hasOwnProperty.call(preexisting, path)) {
      const absolute = join(context.root, path);
      // An unreadable carried-in path is dirty because its identity is unknown.
      const unchanged = bestEffort(() => context.pathExists(absolute) &&
        preexisting[path] === context.fileDigest(absolute), false);
      if (unchanged) continue;
    }
    unrelated.push(row);
  }
  return unrelated;
}

export function assertSandboxGroundingPortable(context, id, state) {
  const groundingPath = join(context.changePath(id), "grounding.yaml");
  if (!state.groundingRequired || !context.pathExists(groundingPath)) return;
  let grounding;
  try { grounding = JSON.parse(context.readText(groundingPath, "utf8")); }
  catch { grounding = null; }
  const portability = groundingPortabilityFindings(
    grounding,
    context.selectedRepositories(id, state),
    (repository, source) => {
      const absolute = resolve(repository.path, source.path);
      const plannedStatus = plannedGroundingPortabilityStatus(
        source, context.pathExists(absolute));
      if (plannedStatus !== undefined) return plannedStatus;
      let matchesDigest = false;
      matchesDigest = bestEffort(() => context.fileDigest(absolute) ===
          String(source.sha256 || "").toLowerCase(), matchesDigest);
      if (!matchesDigest) return "working-tree-digest-mismatch";
      if (repository.id === "root" &&
          isPacketLocalSource(context.changePath(id), absolute)) return null;
      // A cited investigation record is digest-pinned control-plane
      // evidence: it is read from the target checkout, never replayed into
      // the sandbox, so an untracked one is portable as it stands.
      if (repository.id === "root" && isInvestigationPath(String(source.path || "")
        .replace(/^\.\//, ""))) return null;
      return gitBaseCheckoutStatus(repository, source.path, context.gitBuffer);
    }
  );
  if (portability.length)
    context.fail(`grounding readSet is not sandbox-portable: ${
      portability.map((entry) => `${entry.repository}:${entry.path} (${entry.reason})`).join(", ")
    } — move the cited decision or evidence into openspec/changes/${id}/ or refresh its readSet digest through one semantic amendment, then resume with 'cloop advance ${id} --through ${resumeThrough(state)}'`);
}

export function plannedGroundingPortabilityStatus(source, pathExists) {
  if (source?.sha256 !== "planned") return undefined;
  if (!["production-path", "runtime-path", "test-topology"]
    .includes(source?.role)) return "invalid-planned-role";
  return pathExists ? "planned-path-exists" : null;
}

// Which files `git apply` refused, so a replay that cannot proceed names the
// same thing the isolated-copy path names: the files, not the exit code.
//
// Merge conflicts are read first and exclusively. A three-way apply reports
// `patch failed:` for every hunk it could not place directly — including the
// ones it then merged successfully — so mixing the two vocabularies names files
// that are not in conflict at all. `git apply --3way` reports a genuine
// conflict as `U <path>`, not in `git merge`'s vocabulary.
export function rejectedPaths(output) {
  const text = String(output || "");
  const merged = new Set();
  for (const pattern of [
    /^U (.+)$/gm,
    /^Applied patch to '(.+)' with conflicts\.$/gm,
    /^CONFLICT \([^)]*\): Merge conflict in (.+)$/gm
  ])
    for (const match of text.matchAll(pattern)) merged.add(match[1]);
  if (merged.size) return [...merged].sort();
  const paths = new Set();
  const patterns = [
    /^error: patch failed: (.+?):\d+$/gm,
    /^error: (.+?): patch does not apply$/gm,
    /^error: (.+?): does not exist in index$/gm,
    /^error: (.+?): already exists in working directory$/gm
  ];
  for (const pattern of patterns)
    for (const match of text.matchAll(pattern)) paths.add(match[1]);
  return [...paths].sort();
}

export function assertReadOnlyReplayClean(repository, record, git, fail) {
  if (record.access !== "read") return;
  const dirty = git(["status", "--porcelain"], record.path);
  if (dirty.status !== 0 || dirty.stdout.trim())
    fail(`read-only repository '${repository}' changed inside its sandbox: ${
      dirty.stdout.trim() || dirty.stderr.trim() || "git status failed"}`);
}

export function replayContext({
  id, state, candidate, gitHead, selectedRepositories, declaredRepositoryPaths = () => [],
  carriedExcludes = (..._args) => []
}) {
  const { repository, record, targetPath } = candidate;
  const currentHead = targetPath ? gitHead(targetPath) : null;
  if (!targetPath || !currentHead || !record.baseHead || currentHead === record.baseHead)
    return null;
  // Apply and replay share one pathspec: every declared nested repository is
  // excluded from the root projection, selected or not.
  const nested = repository === "root"
    ? [...new Set([...selectedRepositories(id, state)
      .filter((entry) => entry.type === "submodule")
      .map((entry) => entry.relativePath), ...declaredRepositoryPaths()])]
    : [];
  return {
    id, state, repository, record, targetPath, currentHead,
    movement: {
      repository, from: record.baseHead, to: currentHead,
      rebased: false, conflicts: []
    },
    // Carried landed work is not replayed; the sync carries it again onto
    // the new base.
    pathspec: [...sandboxCodePathspec(id, nested),
      ...(repository === "root" ? carriedExcludes(state.workspace) : [])],
    staging: `${record.path}.rebase`,
    patch: `${record.path}.rebase.patch`
  };
}

export function manuallyRebasedMovement(candidate, gitHead) {
  const { repository, record, targetPath } = candidate;
  const targetHead = targetPath ? gitHead(targetPath) : null;
  const sandboxHead = record.path ? gitHead(record.path) : null;
  if (!targetHead || !sandboxHead || !record.baseHead ||
      record.baseHead === targetHead || sandboxHead !== targetHead) return null;
  return {
    repository, from: record.baseHead, to: targetHead,
    rebased: true, conflicts: [], manuallyRebased: true
  };
}

export function stageReplayWorkspace(context, { git, remove = rmSync, fail }) {
  const { repository, record, targetPath, currentHead, staging } = context;
  remove(staging, { recursive: true, force: true });
  git(["worktree", "prune"], targetPath);
  const staged = git(["worktree", "add", "--detach", staging, currentHead], targetPath);
  if (staged.status !== 0) {
    const kind = record.access === "read" ? "read-only worktree refresh" : "rebase worktree";
    fail(`cannot stage the '${repository}' ${kind}: ${staged.stderr.trim()}`);
  }
}

export function replayStagingCleanup(context, { git, remove = rmSync }, removePatch = true) {
  return () => {
    git(["worktree", "remove", "--force", context.staging], context.targetPath);
    remove(context.staging, { recursive: true, force: true });
    if (removePatch) remove(context.patch, { force: true });
  };
}

function preparedReplay(context, discardStaging) {
  const { movement, record, targetPath, staging, patch } = context;
  return { movement, record, targetPath, staging, patch, discardStaging };
}

function prepareReadOnlyReplay(context, dependencies) {
  stageReplayWorkspace(context, dependencies);
  return preparedReplay(context, replayStagingCleanup(context, dependencies, false));
}

function prepareWritableReplay(context, dependencies) {
  const { git, gitBuffer, write = writeFileSync, fail } = dependencies;
  const { repository, record, pathspec, patch, staging, movement } = context;
  git(["add", "-A"], record.path);
  const diff = gitBuffer(["diff", "--binary", record.baseHead, "--", ...pathspec],
    record.path);
  if (diff.status !== 0)
    fail(`cannot read the '${repository}' sandbox diff to replay: ${
      String(diff.stderr).trim()}`);
  stageReplayWorkspace(context, dependencies);
  const discardStaging = replayStagingCleanup(context, dependencies);
  if (diff.stdout.length) {
    write(patch, diff.stdout);
    const replayed = git(
      ["apply", "--3way", "--binary", "--whitespace=nowarn", patch], staging);
    if (replayed.status !== 0) {
      movement.conflicts = rejectedPaths(
        `${replayed.stderr || ""}\n${replayed.stdout || ""}`);
      if (!movement.conflicts.length) movement.conflicts.push(".");
    }
  }
  return preparedReplay(context, discardStaging);
}

export function prepareWorktreeReplay(
  options, id = options.id, state = options.state, candidate = options.candidate
) {
  const { git, gitHead, selectedRepositories, declaredRepositoryPaths, fail,
    carriedExcludes } = options;
  assertReadOnlyReplayClean(candidate.repository, candidate.record, git, fail);
  const context = replayContext({
    id, state, candidate, gitHead, selectedRepositories, declaredRepositoryPaths,
    carriedExcludes
  });
  if (!context) return null;
  return candidate.record.access === "read"
    ? prepareReadOnlyReplay(context, options)
    : prepareWritableReplay(context, options);
}
