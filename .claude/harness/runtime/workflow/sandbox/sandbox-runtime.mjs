import { spawnSync } from "node:child_process";
import {
  cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync,
  rmSync, statSync
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { sandboxCodePathspec } from "../../core/workspace-surface.mjs";
import { transitionLifecycleState } from "../../core/lifecycle-reducer.mjs";
import {
  compositeRepositorySelection, nestedRepositoryRelativePaths, worktreeOwnedByTarget
} from "../../core/repository-binding.mjs";
import { carriedLandedExcludes } from "../transaction/target-edits.mjs";
import { captureCopyBaseSurface } from "../transaction/copy-base.mjs";
import {
  projectNestedRepositories, projectableRepositories, projectionWorkspace
} from "../repository/repository-projection.mjs";
import {
  runSandboxSetupCommand, runMeasuredSandboxSetupBatch, workspaceSetupPlan, sandboxSetupLine, dependencyDigest, runWorkspaceSetupPlan, refreshChangedSandboxDependencies
} from "./sandbox-setup.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import {
  changeDiffCandidatePlan, changeDiffCandidateRow, changeDiffCandidates,
  changeDiffIdentityOperation, combinedDiffIdentity, normalizedDiffDigest
} from "./sandbox-diff-identity.mjs";
import {
  VERBATIM_COPY, carryableGitMetadata, copySandboxEntries, copyTrackedRootMetadata,
  sandboxCopyPlan, sandboxCopyWorkspace
} from "./sandbox-copy.mjs";
import {
  createSandbox, prepareBuildSandbox, rebindRelocatedSandboxOperation,
  retryFailedSandboxSetups
} from "./sandbox-repositories.mjs";
import {
  assertReplayPacket, assertSandboxGroundingPortable, carrySandboxIgnoredArtifacts,
  commitSandboxReplay, manuallyRebasedMovement, prepareWorktreeReplay, preserveReplayPacket,
  recoverAmendedReplay, unrelatedSandboxTargetChanges
} from "./sandbox-replay.mjs";
import {
  headOfRepository, inspectSandbox, showSandboxInspection, workspaceInspectionFor
} from "./sandbox-inspection.mjs";
import { createSandboxSync } from "./sandbox-sync.mjs";
// Sandbox setup moved to sandbox-setup.mjs; re-exported so importers are unchanged.
export {
  runSandboxSetupCommand, runSandboxSetupBatch, executeSandboxSetupBatch, runMeasuredSandboxSetupBatch, DEPENDENCY_LOCKFILES, workspaceSetupPlan, sandboxSetupLine, SETUP_DEPENDENCY_FILES, dependencyDigest, runWorkspaceSetupPlan, refreshChangedSandboxDependencies
} from "./sandbox-setup.mjs";

export function createSandboxRuntime({
  root, policy, excludedWorkspaceDirs, sandboxCopyExcludedDirs, hostAttestation,
  loadRuntime, saveRuntime,
  canonicalPath, workspaceManifest, directoryHash, fileDigest, changePath, gitHead, git,
  gitBuffer, porcelainStatusRecords,
  selectedRepositories, cleanupRepositorySandboxes, cleanupAppliedSandbox,
  repositoryCatalog,
  clearSnapshotCache, validate, repositorySelectionIdsAt, contractFingerprint,
  executionFingerprint, taskBlocks, proofPath, proofAdvancePath = () => null, relevantHash, now, fail,
  markBlocked,
  recordScheduler,
  declaredSurfaceMatcher = null
}) {
  function sandboxRoot(id) {
    return join(root, ".foundation", "sandboxes", id);
  }

  function declaredRepositoryPaths() {
    return typeof repositoryCatalog === "function"
      ? nestedRepositoryRelativePaths(repositoryCatalog()) : [];
  }

  // Every declared nested repository path of the root sandbox holds that
  // repository's sandbox (selected) or its recorded commit (not selected);
  // see repository-projection.mjs. Selection is read from the packet, never
  // from runtime bindings that may be exactly what is still being created.
  function projectRepositories(id, state = loadRuntime(id)) {
    if (typeof repositoryCatalog !== "function" || !projectionWorkspace(state)) return null;
    const repositories = repositoryCatalog().repositories || [];
    if (!projectableRepositories(repositories).length) return null;
    return projectNestedRepositories({
      root, git, gitHead, now, fail,
      repositories,
      selectedIds: typeof repositorySelectionIdsAt === "function"
        ? repositorySelectionIdsAt(changePath(id)) : Object.keys(state.repositories || {}),
      log: (line) => console.error(line)
    }, id, state);
  }

  // A freshly created sandbox has no installed dependencies: the copy path
  // excludes them by name and by gitignore, and a worktree is a bare checkout.
  // The setup command exists so the first proof run does not have to discover
  // that. Failure keeps the sandbox — the workspace itself is correct, and
  // destroying it over a flaky install would discard valid isolation. The
  // lifecycle preparation step retries failed records internally on resume.
  const runSetupCommand = runSandboxSetupCommand.bind(null, {
    spawn: spawnSync, output: console
  });
  const runSetupBatch = runMeasuredSandboxSetupBatch.bind(null, {
    policy, recordScheduler
  });

  // Single-repository setup comes from foundation.json; a repository row in a
  // multi-repository change carries its own `setupCommand` because each
  // repository installs its own toolchain.
  // Without a configured command the harness runs the workspace's pinned
  // lockfile install itself, recorded exactly like a configured setup.
  function runWorkspaceSetup(state) {
    const configured = policy().sandbox || {};
    const plan = workspaceSetupPlan({
      sandbox: configured, workspace: state.workspace.path, pathExists: existsSync
    });
    if (!plan) return null;
    return runWorkspaceSetupPlan(runSetupCommand, state.workspace, plan,
      configured.setupTimeoutMs, state.workspace.path, null, dependencyDigest);
  }

  // Per-file digests of a packet directory. `sync` copies the target's packet
  // over the sandbox's wholesale; without a record of what the last copy wrote,
  // a packet edited in the sandbox is indistinguishable from one the copy wrote,
  // and the overwrite is silent.
  function packetManifest(dir) {
    const result = {};
    function collect(current) {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const path = join(current, entry.name);
        if (entry.isDirectory()) collect(path);
        else result[relative(dir, path).replaceAll("\\", "/")] = fileDigest(path);
      }
    }
    if (existsSync(dir)) collect(dir);
    return result;
  }

  // Keep the base bytes of the change's declared surface while the target
  // still holds them. An undeclared or whole-tree surface is left to lazy
  // capture rather than duplicating the repository.
  function captureDeclaredCopyBase(id, state) {
    if (!declaredSurfaceMatcher) return;
    const matches = declaredSurfaceMatcher(id, state, "root");
    if (matches(".foundation/\0unconfined")) return;
    captureCopyBaseSurface({ root, baseline: state.workspace.baseline, matches });
  }

  function createCopy(id, state, reason) {
    const requestedPath = sandboxRoot(id);
    if (existsSync(requestedPath))
      fail(`sandbox path already occupied: ${requestedPath}`);
    // `.git` is excluded from every hash and every apply diff by name, so a
    // copy that carries it never projects it back and never hashes it. What it
    // does buy is that the copy stays a git repository: without it `gitHead`
    // returns null, the changed surface degrades from `git diff` to a walk of
    // the whole tree, and `singleRelevantSnapshot` loses its `.gitignore`
    // awareness — so running the evidence wrote build output into the workspace
    // hash and expired the evidence that had just been collected.
    const carriesGit = carryableGitMetadata(root);
    mkdirSync(requestedPath, { recursive: true });
    // The sandbox lives under `.foundation/`, which is inside the tree being
    // copied. `cpSync(root, dest)` rejects that outright — it checks for a
    // destination inside the source before it ever consults `filter`, so the
    // exclusion that makes the copy terminate is never seen. Copying each
    // top-level entry instead keeps the exclusion authoritative: `.foundation`
    // is dropped at the top level, so nothing recurses into the sandbox itself.
    // What git tracks is content, whatever it is named. Without this the copy
    // silently omitted committed fixtures whose directory name collided with a
    // build-output name, and git inside the sandbox then reported them deleted.
    const plan = sandboxCopyPlan({
      root, carriesGit, git, sandboxCopyExcludedDirs, excludedWorkspaceDirs,
      nestedPaths: declaredRepositoryPaths()
    });
    // A copy that dies partway leaves a directory the runtime never recorded:
    // `state.workspace` is still whatever it was, so nothing knows the tree
    // exists, while `sandbox path already occupied` blocks every retry. Filling
    // the disk is exactly how that happens, so the failure path has to remove
    // what it wrote before reporting.
    copySandboxEntries({ root, requestedPath, plan, fail });
    // `.foundation/` and `.workflow/` are excluded by name at the root because
    // they are machine state, and that exclusion must not weaken — the sandbox
    // itself lives under `.foundation/`. But the installer *ships* two tracked
    // files inside `.foundation/`, and it checks for one of them as a source
    // precondition: without them `run-installer-tests.sh` cannot run in any
    // sandbox, so Build could not verify the installer it was changing.
    //
    // Carry exactly what git tracks and nothing else. Untracked machine state —
    // including this sandbox — is never listed, so the recursion the name-based
    // exclusion prevents stays prevented.
    copyTrackedRootMetadata(root, requestedPath, plan.listedPaths);
    const path = canonicalPath(requestedPath);
    // The copied `.git/worktrees` still names the *target's* linked worktrees by
    // absolute path. Left in place, a `git worktree` command run inside the
    // sandbox would operate on directories outside it.
    if (carriesGit)
      rmSync(join(path, ".git", "worktrees"), { recursive: true, force: true });
    const preexisting = state.workspace?.preexisting || {};
    state.workspace = {
      ...sandboxCopyWorkspace({
        id, root, path, reason, carriesGit, preexisting, gitHead, workspaceManifest,
        fileDigest, directoryHash, changePath, packetManifest
      }),
      targetDirty: targetDirtySnapshot()
    };
    captureDeclaredCopyBase(id, state);
    transitionLifecycleState(state, "building", "copy-sandbox-created");
    saveRuntime(state);
    projectRepositories(id, state);
    const setup = runWorkspaceSetup(state);
    if (setup) saveRuntime(state);
    console.log(`SANDBOX ${id}\n  mode: isolated-copy\n  reason: ${reason}\n  git: ${
      carriesGit ? "carried" : "absent (target has no usable .git directory)"
    }\n  path: ${path}${sandboxSetupLine(setup)}`);
  }

  function createChallenge(id) {
    const challenge = hostAttestation.createChallenge(id);
    console.log(JSON.stringify(challenge, null, 2));
    return challenge;
  }

  function directoryExists(path) {
    if (!path || !existsSync(path)) return false;
    try { return statSync(path).isDirectory(); }
    catch { return false; }
  }

  function gitMetadataPresent(workspacePath) {
    if (!directoryExists(workspacePath)) return false;
    const metadataPath = join(workspacePath, ".git");
    if (!existsSync(metadataPath)) return false;
    try {
      const metadata = statSync(metadataPath);
      if (metadata.isDirectory()) return true;
      if (!metadata.isFile() || metadata.size > 4096) return false;
      const match = readFileSync(metadataPath, "utf8").match(/^gitdir:\s*(.+?)\s*$/m);
      return Boolean(match && directoryExists(resolve(dirname(metadataPath), match[1])));
    } catch {
      return false;
    }
  }

  const rebindRelocatedSandbox = rebindRelocatedSandboxOperation.bind(null, {
    root,
    sandboxRoot,
    canonicalPath,
    pathExists: existsSync,
    directoryExists,
    fileDigest,
    gitMetadataPresent,
    saveRuntime,
    clearSnapshotCache,
    now,
    fail,
    output: console
  });

  const workspaceInspection = workspaceInspectionFor({
    root,
    loadRuntime,
    selectedRepositories,
    gitMetadataPresent,
    directoryExists,
    headOfRepository,
    worktreeOwnedByTarget
  });

  const inspect = inspectSandbox.bind(null, { workspaceInspection, hostAttestation });
  const showInspection = showSandboxInspection.bind(null, {
    inspect, markBlocked, output: console, runtimeProcess: process
  });
  const assertGroundingPortable = assertSandboxGroundingPortable.bind(null, {
    changePath,
    pathExists: existsSync,
    readText: readFileSync,
    selectedRepositories,
    fileDigest,
    gitBuffer,
    fail
  });

  // The target's dirty files at isolation, by digest. Prove and Land compare
  // against it to find target edits made outside the sandbox.
  function targetDirtySnapshot() {
    const dirty = git(["status", "--porcelain", "-z", "--untracked-files=all"], root);
    const snapshot = {};
    if (dirty.status !== 0) return snapshot;
    for (const { path: rel } of porcelainStatusRecords(dirty.stdout)) {
      bestEffort(() => {
        const absolute = join(root, rel);
        if (rel && existsSync(absolute) && lstatSync(absolute).isFile())
          snapshot[rel] = fileDigest(absolute);
      });
    }
    return snapshot;
  }

  function createSingle(id) {
    const state = loadRuntime(id);
    if (state.status === "archived") fail(`change '${id}' is already archived`);
    if (recoverReplay(id, state)) return;
    if (rebindRelocatedSandbox(id, state)) return;
    if (["worktree", "copy"].includes(state.workspace?.mode) && existsSync(state.workspace.path))
      fail(`sandbox already exists: ${state.workspace.path}`);
    // The sandbox is taken from the current HEAD, so portability is judged
    // against it. The HEAD recorded when the change was created made "commit
    // the source" a dead end: a committed readSet file still read as
    // missing-from-base until the change was recompiled.
    const head = gitHead(root);
    if (head && (!state.workspace || state.workspace.mode === "current"))
      state.workspace = { ...(state.workspace || {}), baseHead: head };
    assertGroundingPortable(id, state);
    if (!head) {
      createCopy(id, state, "no-git");
      return;
    }
    const dirty = git(["status", "--porcelain", "-z", "--untracked-files=all"], root);
    if (dirty.status !== 0) fail(`cannot inspect target workspace: ${dirty.stderr.trim()}`);
    // Dirt the harness produced itself must not cost this change its worktree.
    // Landing a *previous* change moves its packet into `changes/archive/` and
    // leaves that move uncommitted, so the very next `sandbox create` saw a
    // dirty target and fell back to an isolated copy — a mode with strictly
    // lower fidelity — for a reason the operator had no part in. Neither path
    // is ever this change's surface: `.foundation/` is machine state, and
    // `allowed()` in the snapshot drops `changes/archive/` outright, so a
    // worktree taken from HEAD cannot lose work by ignoring them here.
    //
    // Every other change's draft belongs in that same category. The loop keeps
    // drafts uncommitted until Land by design, so a second active change made
    // every later `sandbox create` fall back to a copy — the expensive mode —
    // for state the operator was told to leave uncommitted. Nothing is lost by
    // ignoring it: `singleRelevantSnapshot` drops `openspec/changes/` that is
    // not this change, and the apply diff excludes this change's own directory.
    // Dirt that was already there when the change began is not this change's
    // doing, and it should not cost the change its worktree. The surface
    // already ignores these paths; without the same test here a single stray
    // untracked file downgraded every sandbox to a whole-tree copy — lower
    // fidelity and, on a large repository, the expensive mode — for a file
    // nobody in this change had touched. Compared by digest, so a pre-existing
    // file the operator has since edited still counts as a dirty target.
    const unrelated = unrelatedSandboxTargetChanges({
      root, pathExists: existsSync, fileDigest, porcelainStatusRecords
    }, id, state, dirty.stdout);
    if (unrelated.length) {
      createCopy(id, state, `dirty-target:${unrelated[0].status} ${unrelated[0].path}`);
      return;
    }
    const requestedPath = sandboxRoot(id);
    mkdirSync(dirname(requestedPath), { recursive: true });
    // A sandbox directory deleted out from under git stays registered, and
    // `worktree add` then refuses the same path — dead-ending the recovery
    // the missing-workspace error advertises. Prune only drops registrations
    // whose directories are gone, so it is safe unconditionally.
    git(["worktree", "prune"]);
    const result = git(["worktree", "add", "--detach", requestedPath, "HEAD"]);
    if (result.status !== 0) fail(`cannot create sandbox: ${result.stderr.trim()}`);
    const path = canonicalPath(requestedPath);
    cpSync(changePath(id), join(path, "openspec", "changes", id),
      { recursive: true, ...VERBATIM_COPY });
    state.workspace = {
      preexisting: state.workspace?.preexisting || {},
      targetDirty: targetDirtySnapshot(),
      mode: "worktree", path, baseHead: gitHead(root), applied: false,
      changeSourceHash: directoryHash(changePath(id)),
      packetSnapshot: packetManifest(join(path, "openspec", "changes", id))
    };
    const carried = carryLandedOutput(id, state);
    transitionLifecycleState(state, "building", "worktree-sandbox-created");
    saveRuntime(state);
    projectRepositories(id, state);
    const setup = runWorkspaceSetup(state);
    if (setup) saveRuntime(state);
    console.log(`SANDBOX ${id}\n  path: ${path}${landedCarryLine(carried)}${sandboxSetupLine(setup)}`);
  }

  function mergeTaskProgress(source, sandbox) {
    const completedIds = new Set(taskBlocks(sandbox)
      .filter((task) => task.done && task.id).map((task) => task.id));
    const completedText = new Set(taskBlocks(sandbox)
      .filter((task) => task.done)
      .map((task) => task.text.replace(/\s+/g, " ").trim()));
    return source.split("\n").map((line) => {
      if (!/^\s*-\s*\[\s\]/.test(line)) return line;
      const text = line.replace(/^\s*-\s*\[\s\]\s*/, "").trim();
      const taskId = text.match(/^\*{0,2}(T\d{3,})\*{0,2}\b/i)?.[1]?.toUpperCase();
      return (taskId ? completedIds.has(taskId) : completedText.has(text))
        ? line.replace("[ ]", "[x]") : line;
    }).join("\n");
  }

  // A worktree sandbox is pinned to the commit it branched from and nothing
  // moved it. An isolated copy has always reconciled a moving target here; a
  // worktree did not, and said nothing either — so Build and Prove ran to
  // completion against a base the target no longer had, and the refusal only
  // arrived inside the apply transaction, after the evidence was spent.
  //
  // Replay, not `git rebase`: the sandbox's whole contribution is its diff from
  // `baseHead`, which is exactly what apply projects, and no contract downstream
  // reads sandbox commit history. Flattening it into working-tree changes costs
  // nothing that is ever consulted.
  const replayCandidates = changeDiffCandidates.bind(null, root);

  // The change's whole contribution is its diff from `baseHead` — the same
  // content replay projects and a reviewer reads. Hashing the raw patch would
  // still churn on a moved base: blob ids (`index` lines) and hunk offsets
  // (`@@` coordinates) shift under work nobody edited. With those volatile
  // coordinates removed, the identity survives a clean replay onto a moved
  // base and changes exactly when the diff's content changes — which is when
  // a review verdict genuinely needs renewing.
  // Copy sandboxes use their Apply manifests instead of a Git patch.
  // Read-only repositories contribute no diff and retain their independent
  // freshness/Land guards. Null means unavailable, never an empty contribution.
  //
  // One canonical representation, staged into a throwaway index. Splitting
  // "tracked changes as patch text" from "untracked files as raw digests"
  // made identity a function of index state, and sync changes index state:
  // replay's `add -A` plus `apply --3way` turn a file that was untracked at
  // verdict time into a staged one afterwards, expiring the verdict over a
  // representation flip with no content behind it. Staging everything into a
  // temporary GIT_INDEX_FILE folds new, edited, and deleted files through the
  // same `diff --cached` patch regardless of what the real index says — and
  // never mutates it, so no snapshot hash moves as a side effect of reading.
  // The diff drivers are pinned because patch text is the identity: a
  // machine-level `diff.algorithm` or prefix tweak must not expire verdicts.
  const landedIdentity = (path) =>
    lstatSync(path, { throwIfNoEntry: false })?.isFile() ? fileDigest(path) : null;
  const changeDiffIdentityPlan = changeDiffCandidatePlan.bind(null, {
    pathExists: existsSync,
    selectedRepositories,
    declaredRepositoryPaths,
    codePathspec: sandboxCodePathspec,
    carriedExcludes: (workspace) => carriedLandedExcludes(workspace, landedIdentity),
    pid: process.pid,
    environment: process.env
  });
  const changeDiffIdentityRow = changeDiffCandidateRow.bind(null, {
    remove: rmSync,
    spawn: spawnSync,
    diffDigest: normalizedDiffDigest,
    workspaceManifest
  });
  const changeDiffIdentityForState = changeDiffIdentityOperation.bind(null, {
    candidates: replayCandidates,
    plan: changeDiffIdentityPlan,
    row: changeDiffIdentityRow,
    combine: combinedDiffIdentity
  });
  function changeDiffIdentity(id, state = loadRuntime(id)) {
    // Selection validation is the fail-closed boundary for an isolated
    // multi-repository runtime. Without it a missing child record turns this
    // into a root-only identity and can preserve evidence for the wrong tree.
    selectedRepositories(id, state);
    return changeDiffIdentityForState(id, state);
  }

  const prepareReplay = prepareWorktreeReplay.bind(null, {
    git, gitBuffer, gitHead, selectedRepositories, fail,
    declaredRepositoryPaths: () => typeof repositoryCatalog === "function"
      ? nestedRepositoryRelativePaths(repositoryCatalog()) : [],
    carriedExcludes: (workspace) => carriedLandedExcludes(workspace, landedIdentity)
  });

  // `worktree remove --force` destroys everything the checkout accumulated
  // beyond tracked content — node_modules, dist, build caches that take long
  // to rebuild. A land-time replay wiped a workspace's installed artifacts
  // exactly this way, forcing a full rebuild plus an extra review round to
  // prove the wipe was environmental rather than a regression. Carry ignored
  // artifacts into the replacement worktree instead: they are ignored, so
  // they cannot alter any tracked state the replay verified.
  const carryIgnoredArtifacts = carrySandboxIgnoredArtifacts.bind(null, {
    git, pathExists: existsSync, makeDirectory: mkdirSync, rename: renameSync
  });
  const commitReplay = commitSandboxReplay.bind(null, {
    carryIgnoredArtifacts, git, fail, selectedRepositories,
    runSetupCommand, policy, directoryHash
  });

  const recoverReplay = recoverAmendedReplay.bind(null, {
    root, pathExists: existsSync, ownsWorktree: worktreeOwnedByTarget,
    gitHead, git, directoryHash, saveRuntime, fail,
    invalidateProof: (id, state) => {
      clearSnapshotCache(id);
      if (existsSync(proofPath(id))) rmSync(proofPath(id));
      // Same rule as a sync: a checkpoint left behind would read as current
      // proof while the lifecycle is back in Build.
      const checkpoint = proofAdvancePath(id);
      if (checkpoint && existsSync(checkpoint)) rmSync(checkpoint);
      transitionLifecycleState(state, "building", "sandbox-replay-recovered");
      // No pre-crash diff comparison is available to authorize review rebinding.
      delete state.lastBaseMove;
    }
  });

  function rebaseWorktree(id, state, preserveAmendment = false) {
    const selection = selectedRepositories(id, state);
    const candidates = replayCandidates(state)
      .filter((candidate) => candidate.record.mode === "worktree");
    if (!candidates.length) return null;
    const multiRepository = compositeRepositorySelection(selection);
    const prepared = [];
    const manuallyRebased = [];
    try {
      for (const candidate of candidates) {
        const manualMovement = manuallyRebasedMovement(candidate, gitHead);
        if (manualMovement) {
          manuallyRebased.push({ candidate, movement: manualMovement });
          continue;
        }
        const replay = prepareReplay(id, state, candidate);
        if (!replay) continue;
        prepared.push(replay);
        if (replay.movement.conflicts.length) {
          prepared.forEach((entry) => entry.discardStaging());
          return {
            rebased: false, multiRepository,
            repositories: prepared.map((entry) => entry.movement),
            conflicts: prepared.flatMap((entry) =>
              entry.movement.conflicts.map((path) => ({
                repository: entry.movement.repository, path
              })))
          };
        }
        // Stage the packet before any original worktree is removed. A failed
        // replacement must leave the amendment in the original or staging tree.
        if (preserveAmendment && candidate.repository === "root")
          preserveReplayPacket(id, replay, directoryHash);
      }
      for (const replay of prepared)
        if (replay.packetHash) assertReplayPacket(id, replay, directoryHash);
    } catch (error) {
      prepared.forEach((entry) => entry.discardStaging());
      throw error;
    }
    if (!prepared.length && !manuallyRebased.length) return null;
    const amendedRoot = prepared.find((entry) => entry.packetHash);
    if (amendedRoot) {
      state.workspace.amendmentReplay = {
        from: amendedRoot.movement.from, to: amendedRoot.movement.to,
        packetHash: amendedRoot.packetHash
      };
      saveRuntime(state);
    }
    prepared.forEach((entry) => commitReplay(id, state, entry));
    if (amendedRoot) delete state.workspace.amendmentReplay;
    prepared.forEach((entry) => rmSync(entry.patch, { force: true }));
    for (const entry of manuallyRebased) {
      entry.candidate.record.baseHead = entry.movement.to;
      if (entry.candidate.repository === "root") state.workspace.baseHead = entry.movement.to;
    }
    const repositories = [
      ...prepared.map((entry) => entry.movement),
      ...manuallyRebased.map((entry) => entry.movement)
    ];
    const movement = {
      rebased: true, multiRepository, repositories, conflicts: []
    };
    if (repositories.length === 1)
      Object.assign(movement, {
        repository: repositories[0].repository,
        from: repositories[0].from,
        to: repositories[0].to
      });
    return movement;
  }

  const create = createSandbox.bind(null, {
    root,
    policy,
    hostAttestation,
    loadRuntime,
    saveRuntime,
    canonicalPath,
    gitHead,
    git,
    porcelainStatusRecords,
    selectedRepositories,
    cleanupRepositorySandboxes,
    cleanupAppliedSandbox,
    repositoryCatalog,
    clearSnapshotCache,
    createSingle,
    projectRepositories,
    runSetupCommand, runSetupBatch,
    output: console,
    fail
  });

  const retryFailedSetups = retryFailedSandboxSetups.bind(null, {
    loadRuntime, saveRuntime, selectedRepositories, policy, runSetupCommand,
    runSetupBatch, git, dependencyDigest
  });
  const refreshChangedDependencies = refreshChangedSandboxDependencies.bind(null, {
    loadRuntime, saveRuntime, policy, runSetupCommand, pathExists: existsSync,
    dependencyDigest
  });

  // Brings an intentionally revised target agreement into Build. Returns
  // whether a sync ran; an unchanged source is a no-op.
  function synchronizeAgreement(id, flags = {}) {
    const state = loadRuntime(id);
    // Semantic amendments live in the sandbox until Land. A changed target
    // packet must not make automatic preparation import the older agreement
    // or deadlock on the explicit sync overwrite guard. A recorded user
    // answer (`advance --decision`) is the explicit resolution.
    if (activeSandboxAmendment(id, state)) {
      if (flags.resolve) {
        sync(id, { resolve: flags.resolve });
        return true;
      }
      assertAmendedSource(id, state);
      return false;
    }
    if (!agreementStale(id, state)) return false;
    sync(id);
    return true;
  }

  function agreementStale(id, state = loadRuntime(id)) {
    return Boolean(state.workspace?.changeSourceHash &&
      state.workspace.changeSourceHash !== directoryHash(changePath(id)));
  }

  const prepareBuild = prepareBuildSandbox.bind(null, {
    root, loadRuntime, validate, workspaceInspection, create, retryFailedSetups, recoverReplay,
    synchronizeAgreement, projectRepositories
  });

  const {
    activeSandboxAmendment, assertAmendedSource, carryLandedOutput, landedCarryLine,
    sync
  } = createSandboxSync({
    changeDiffIdentity, changePath, clearSnapshotCache, contractFingerprint,
    directoryHash, executionFingerprint, fail, fileDigest, gitBuffer, loadRuntime,
    mergeTaskProgress, now, packetManifest, projectRepositories, proofAdvancePath,
    proofPath, rebaseWorktree, recoverReplay, relevantHash, replayCandidates,
    repositorySelectionIdsAt, root, saveRuntime, validate, workspaceManifest
  });

  return {
    createChallenge, workspaceInspection, inspect, showInspection,
    createSingle, create, retryFailedSetups, refreshChangedDependencies, prepareBuild,
    mergeTaskProgress, sync, projectRepositories,
    synchronizeAgreement, agreementStale,
    recoverReplay: (id) => recoverReplay(id, loadRuntime(id)),
    changeDiffIdentity
  };
}
