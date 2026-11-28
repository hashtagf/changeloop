import { assertSpecApproval } from "../../core/user-decisions.mjs";
import { isSharedProject } from "../../core/project-installation.mjs";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { transitionLifecycleState } from "../../core/lifecycle-reducer.mjs";
import { isolatedRepositoryState, worktreeOwnedByTarget } from "../../core/repository-binding.mjs";
import { runWorkspaceSetupPlan, workspaceSetupPlan } from "./sandbox-setup.mjs";
import { sandboxMovementLine } from "./sandbox-copy.mjs";

export function recordSandboxBaseMove({ id, state, movement, preDiffIdentity,
  now, changeDiffIdentity }) {
  if (!movement?.rebased) return;
  const moved = movement.repositories.filter((entry) => entry.rebased);
  state.lastBaseMove = {
    at: now(),
    movementKey: moved.map((entry) => `${entry.repository}:${entry.to}`)
      .sort().join("|"),
    preDiffIdentity,
    postDiffIdentity: changeDiffIdentity(id, state),
    repositories: moved.map(({ repository, from, to }) =>
      ({ repository, from, to }))
  };
}

export function reportSandboxSync({ id, state, movement, forwarded, conflicts,
  relevantHash, log = console.log }) {
  const movementLine = sandboxMovementLine(movement);
  log(`SYNCED ${id}\n  revision: ${state.revision}\n  workspace: ${relevantHash(id)}${
    movementLine}${
    forwarded ? `\n  fast-forwarded: ${forwarded} file(s) the target moved and the sandbox left alone` : ""
  }`);
  for (const rel of conflicts)
    log(`CONFLICT ${rel}: the target and the sandbox both changed this file since the baseline; merge the target's version into the sandbox copy (no conflict markers), then resume with 'cloop advance ${id} --through <stage>'; the copy settles once it provably contains the target's edit. Land stays blocked until every conflict is resolved.`);
  for (const conflict of movement?.conflicts || [])
    log(`CONFLICT ${movement.multiRepository ? `${conflict.repository}:` : ""}${conflict.path}: the sandbox diff no longer applies to the moved target; merge the target's version into the named repository sandbox worktree, then rerun sandbox sync. Land stays blocked until every repository sandbox replays onto its current commit.`);
  if (movement && !movement.rebased && !movement.conflicts.length)
    log(`TARGET MOVED ${id}: rerun 'cloop sandbox sync ${id}' after repairing the named repository replay.`);
}

export function sandboxCreatePreflight(context, id, flags = {}) {
  const {
    hostAttestation, loadRuntime, repositoryCatalog, root, selectedRepositories, fail
  } = context;
  if (flags.unattended) {
    const preflight = hostAttestation.preflight(id, flags, true);
    if (!preflight.safeForUnattended)
      fail(`unattended sandbox creation requires a trusted host-owned security attestation; detected virtualization alone is insufficient: ${preflight.reasons.join("; ")}`);
  }
  const initial = loadRuntime(id);
  assertSpecApproval(root, id, initial, { workspace: false });
  const topology = repositoryCatalog();
  if (topology.drift.length)
    fail(`sandbox preflight found unregistered submodule(s): ${
      topology.drift.map((repository) => repository.path).join(", ")}\n  register the complete set in openspec/repositories.yaml, select the repositories for '${id}', validate once, then create the sandbox`);
  // Uncommitted investigation records and notes do not gate Build. They are
  // control-plane documents, never Land targets: the worktree decision ignores
  // them, and the shared apply/replay pathspec plus copy apply exclude
  // openspec/investigations/, so Land can neither project nor overwrite them.
  return {
    initial,
    // Creation and repair resolve the agreement against live targets. Runtime
    // bindings may be precisely what is missing, so they cannot be required in
    // order to discover the repositories that need repair.
    repositories: selectedRepositories(id, initial, fail,
      { useTargetPaths: true, withoutGit: true })
  };
}

export function isolateSelectedRepositories(context, id, state, repositories) {
  const { root, gitHead, git, canonicalPath, fail } = context;
  state.repositories = {};
  try {
    for (const repository of repositories) {
      if (repository.id === "root") {
        state.repositories.root = {
          mode: state.workspace.mode, path: state.workspace.path, targetPath: root,
          baseHead: state.workspace.baseHead || gitHead(root), access: repository.mode
        };
        continue;
      }
      const baseHead = gitHead(repository.path);
      if (!baseHead)
        throw new Error(`repository '${repository.id}' cannot be isolated because it is not an initialized Git repository`);
      // An uninitialized submodule is an empty directory whose Git commands
      // answer for the superproject; isolating it would fork the wrong repository.
      const top = git(["rev-parse", "--show-toplevel"], repository.path);
      if (top.status !== 0 ||
          canonicalPath(String(top.stdout || "").trim()) !== canonicalPath(repository.path))
        throw new Error(`repository '${repository.id}' cannot be isolated because '${
          repository.path}' is not an initialized Git repository of its own (run 'git submodule update --init ${
          repository.relativePath || repository.path}' first)`);
      const requestedPath = join(root, ".foundation", "repository-sandboxes", id, repository.id);
      if (existsSync(requestedPath))
        throw new Error(`repository sandbox already exists: ${requestedPath}`);
      mkdirSync(dirname(requestedPath), { recursive: true });
      git(["worktree", "prune"], repository.path);
      const result = git(["worktree", "add", "--detach", requestedPath, baseHead], repository.path);
      if (result.status !== 0)
        throw new Error(`cannot create sandbox for '${repository.id}': ${result.stderr.trim()}`);
      const path = canonicalPath(requestedPath);
      state.repositories[repository.id] = {
        mode: "worktree", path, targetPath: repository.path,
        baseHead, access: repository.mode, applied: false
      };
    }
  } catch (error) {
    context.cleanupRepositorySandboxes(id, state);
    context.cleanupAppliedSandbox(id, state);
    state.workspace = {
      preexisting: state.workspace?.preexisting || {},
      mode: "current", path: root, baseHead: gitHead(root)
    };
    delete state.repositories;
    transitionLifecycleState(state, "change", "sandbox-creation-rolled-back");
    context.saveRuntime(state);
    fail(`${error.message}; created sandboxes rolled back`);
  }
}

function recoveredRepositoryBaseHead(context, repository, path) {
  const sandboxHead = context.gitHead(path);
  const targetHead = context.gitHead(repository.path);
  if (!sandboxHead || !targetHead)
    throw new Error(`repository '${repository.id}' cannot be recovered because its sandbox or target HEAD is unreadable`);
  if (sandboxHead === targetHead) return sandboxHead;
  const common = context.git(["merge-base", sandboxHead, targetHead], repository.path);
  const baseHead = String(common.stdout || "").trim();
  if (common.status !== 0 || !/^[0-9a-f]{40,64}$/i.test(baseHead))
    throw new Error(`repository '${repository.id}' sandbox does not share a recoverable base with its selected target`);
  return baseHead;
}

export function repairSelectedRepositories(context, id, state, repositories) {
  const ownsWorktree = context.worktreeOwnedByTarget || worktreeOwnedByTarget;
  const records = state.repositories || {};
  const created = [];
  const setupIds = new Set();
  state.repositories = records;
  records.root = {
    ...(records.root || {}),
    mode: state.workspace.mode,
    path: state.workspace.path,
    targetPath: context.root,
    baseHead: state.workspace.baseHead || context.gitHead(context.root),
    access: repositories.find((repository) => repository.id === "root")?.mode || "write"
  };
  try {
    for (const repository of repositories) {
      if (repository.id === "root") continue;
      const requestedPath = join(context.root, ".foundation",
        "repository-sandboxes", id, repository.id);
      const expectedPath = context.canonicalPath(requestedPath);
      const prior = records[repository.id];
      if (prior?.path && existsSync(prior.path) &&
          context.canonicalPath(prior.path) !== expectedPath)
        throw new Error(`repository '${repository.id}' has recoverable work at non-canonical path '${prior.path}'`);
      if (existsSync(expectedPath)) {
        if (!ownsWorktree(expectedPath, repository.path))
          throw new Error(`repository '${repository.id}' canonical sandbox path is not owned by its selected target`);
        if (!prior || prior.mode !== "worktree" || !prior.targetPath ||
            context.canonicalPath(prior.targetPath || repository.path) !==
              context.canonicalPath(repository.path) ||
            prior.access !== repository.mode || !prior.baseHead)
          setupIds.add(repository.id);
        records[repository.id] = {
          ...(prior || {}), mode: "worktree", path: expectedPath,
          targetPath: repository.path,
          baseHead: prior?.baseHead || recoveredRepositoryBaseHead(
            context, repository, expectedPath),
          access: repository.mode, applied: prior?.applied === true
        };
        continue;
      }
      const baseHead = context.gitHead(repository.path);
      if (!baseHead)
        throw new Error(`repository '${repository.id}' cannot be isolated because it is not an initialized Git repository`);
      mkdirSync(dirname(expectedPath), { recursive: true });
      context.git(["worktree", "prune"], repository.path);
      const result = context.git(
        ["worktree", "add", "--detach", expectedPath, baseHead], repository.path);
      if (result.status !== 0)
        throw new Error(`cannot create sandbox for '${repository.id}': ${result.stderr.trim()}`);
      created.push({ id: repository.id, path: expectedPath, targetPath: repository.path });
      setupIds.add(repository.id);
      records[repository.id] = {
        mode: "worktree", path: expectedPath, targetPath: repository.path,
        baseHead, access: repository.mode, applied: false
      };
    }
    return repositories.filter((repository) => setupIds.has(repository.id));
  } catch (error) {
    for (const record of created.reverse()) {
      context.git(["worktree", "remove", "--force", record.path], record.targetPath);
      rmSync(record.path, { recursive: true, force: true });
      delete records[record.id];
    }
    context.saveRuntime(state);
    context.fail(`${error.message}; existing work was preserved — inspect it with 'cloop sandbox inspect ${id}', retry repair with 'cloop sandbox create ${id} --all', or retire the change with 'cloop change abandon ${id} --reason <reason> --decision-ref <ref>'`);
  }
}

function setupJob(repository, record, timeoutMs, command = repository.setupCommand) {
  return { repository, record, command, cwd: record.path, timeoutMs };
}

// A writable sibling without its own setupCommand installs what its lockfiles
// pin, like the root workspace; `sandbox.installDependencies: false` opts out
// and a read-only repository is never installed into.
function siblingSetupCommand(context, repository, record) {
  if (repository.setupCommand) return repository.setupCommand;
  if (repository.id === "root" || record?.mode !== "worktree" || record.access === "read" || !record.path)
    return null;
  const installDependencies = context.policy().sandbox?.installDependencies;
  return workspaceSetupPlan({ sandbox: { installDependencies }, workspace: record.path,
    pathExists: existsSync })?.command || null;
}

function verifyReadOnlySetup(context, repository, record, warn = false) {
  if (record.access !== "read") return;
  const changed = context.git(["status", "--porcelain"], record.path);
  if (changed.status === 0 && !changed.stdout.trim()) return;
  record.setup.status = "failed";
  record.setup.reason = "setup modified a read-only repository";
  if (warn) (context.output || console).error(
    `WARNING: sandbox setup modified read-only repository '${repository.id}': ${
      changed.stdout.trim() || changed.stderr.trim() || "git status failed"}`);
}

export function applySetupResult(context, row, warn = false) {
  const { repository, record, command, result } = row;
  const failed = Boolean(result.error) || result.status !== 0;
  record.setup = {
    command, status: failed ? "failed" : "ok",
    exitCode: typeof result.status === "number" ? result.status : null
  };
  if (failed && warn) {
    const cause = typeof result.status === "number" ? `exit ${result.status}` : result.error;
    const tail = `${result.stdout || ""}\n${result.stderr || ""}`
      .trim().split("\n").filter(Boolean).slice(-5).join("\n    ");
    (context.output || console).error(`WARNING: sandbox setup command failed for '${repository.id}' (${
      cause}) in the isolated workspace. Harness preparation will repair or route this failure before Build.${
      tail ? `\n    ${tail}` : ""}`);
  }
  verifyReadOnlySetup(context, repository, record, warn);
}

export function setupSelectedRepositories(context, state, repositories) {
  const timeoutMs = context.policy().sandbox?.setupTimeoutMs;
  const eligible = repositories.flatMap((repository) => {
    const record = state.repositories[repository.id];
    const command = record?.mode === "worktree" ? siblingSetupCommand(context, repository, record) : null;
    return command ? [setupJob(repository, record, timeoutMs, command)] : [];
  });
  if (!context.runSetupBatch) {
    for (const { repository, record, command } of eligible) {
      context.runSetupCommand(record, command, timeoutMs, record.path, repository.id);
      verifyReadOnlySetup(context, repository, record, true);
    }
    return;
  }
  for (const row of context.runSetupBatch(eligible)) applySetupResult(context, row, true);
}

// Setup is Harness-owned preparation. A transient package-manager or network
// failure must not turn into a command for the user, and a successful sibling
// must not be repeated. Retry only records that are still failed; callers can
// invoke this at every lifecycle resume without redoing valid work.
export function retryFailedSandboxSetups(context, id,
  state = context.loadRuntime(id)) {
  const selected = context.selectedRepositories(id, state);
  const attempted = [];
  const configured = context.policy().sandbox || {};
  const rootSelection = selected.find((repository) => repository.id === "root");
  const prior = state.workspace?.setup;
  // A detected lockfile install retries like a configured command unless the
  // project has since configured one or opted out.
  const detected = prior?.source === "lockfile" &&
    configured.installDependencies !== false
    ? { command: prior.command, source: "lockfile", lockfile: prior.lockfile } : null;
  const rootCommand = rootSelection?.setupCommand || configured.setupCommand;
  const rootPlan = rootCommand ? { command: rootCommand, source: "configured" } : detected;
  if (prior?.status === "failed" && rootPlan && state.workspace?.path) {
    runWorkspaceSetupPlan(context.runSetupCommand, state.workspace, rootPlan,
      configured.setupTimeoutMs, state.workspace.path, "root", context.dependencyDigest);
    attempted.push("root");
  } else if (prior?.status === "failed" && prior.source === "lockfile" && !rootPlan) {
    // Opting out after a failed detected install withdraws that install.
    delete state.workspace.setup;
    attempted.push("root");
  }
  const jobs = [];
  for (const repository of selected) {
    if (repository.id === "root") continue;
    const record = state.repositories?.[repository.id];
    // A detected install retries the command it recorded.
    const command = repository.setupCommand || record?.setup?.command;
    if (record?.setup?.status !== "failed" || !command || !record.path) continue;
    if (!context.runSetupBatch) {
      context.runSetupCommand(record, command,
        configured.setupTimeoutMs, record.path, repository.id);
      verifyReadOnlySetup(context, repository, record);
      attempted.push(repository.id);
    } else jobs.push(setupJob(repository, record, configured.setupTimeoutMs, command));
  }
  for (const row of context.runSetupBatch ? context.runSetupBatch(jobs) : []) {
    applySetupResult(context, row);
    attempted.push(row.repository.id);
  }
  if (attempted.length) context.saveRuntime(state);
  return attempted;
}

export function reportMultiRepositorySandbox(context, id, state) {
  console.log(`MULTI-REPOSITORY SANDBOX ${id}`);
  for (const repository of context.selectedRepositories(id, state))
    console.log(`  ${repository.id}: ${repository.workspacePath}`);
}

export function createSandbox(context, id, flags = {}) {
  const { initial, repositories } = sandboxCreatePreflight(context, id, flags);
  if (repositories.length === 1 && repositories[0].id === "root" && !flags.all) {
    context.createSingle(id);
    return;
  }
  const expectedRepositoryPath = (repository) => context.canonicalPath(join(
    context.root, ".foundation", "repository-sandboxes", id, repository.id));
  const rootActive = isolatedRepositoryState(initial) &&
    Boolean(initial.workspace?.path && existsSync(initial.workspace.path));
  const repair = isolatedRepositoryState(initial) ||
    Object.keys(initial.repositories || {}).some((repository) => repository !== "root") ||
    repositories.some((repository) => repository.id !== "root" &&
      existsSync(expectedRepositoryPath(repository)));
  if (!rootActive) context.createSingle(id);
  const state = context.loadRuntime(id);
  const setupRepositories = repair
    ? repairSelectedRepositories(context, id, state, repositories)
    : (isolateSelectedRepositories(context, id, state, repositories), repositories);
  setupSelectedRepositories(context, state, setupRepositories);
  transitionLifecycleState(state, "building", "repository-sandboxes-created");
  context.saveRuntime(state);
  // Repository sandboxes exist only now; link them into the root sandbox.
  context.projectRepositories?.(id, state);
  context.clearSnapshotCache(id);
  reportMultiRepositorySandbox(context, id, state);
}

export function prepareBuildSandbox(context, id) {
  let state = context.loadRuntime(id);
  if (context.recoverReplay?.(id, state)) state = context.loadRuntime(id);
  if (context.root) assertSpecApproval(context.root, id, state);
  if (state.status === "change") context.validate(id, "root", { quiet: true });
  const inspection = context.workspaceInspection(id, state);
  const repositoryRecordsExist = Object.keys(state.repositories || {}).length > 0;
  const repositoryIncomplete = inspection.repositories.some((repository) =>
    repository.status !== "active" &&
    (repository.id !== "root" || repositoryRecordsExist));
  const incomplete = state.status === "change" || inspection.status !== "active" ||
    repositoryIncomplete;
  if (incomplete) context.create(id, { quiet: true });
  context.synchronizeAgreement?.(id);
  context.retryFailedSetups(id);
  // Resume, re-creation, and a sync can each leave a root path empty.
  context.projectRepositories?.(id);
  return { repaired: incomplete };
}

export function relocatedSandboxCandidate(context, id, workspace) {
  if (!["worktree", "copy"].includes(workspace.mode) ||
      !workspace.path || context.pathExists(workspace.path)) return null;
  const canonicalRoot = context.canonicalPath(
    join(context.root, ".foundation", "sandboxes"));
  const candidate = context.canonicalPath(context.sandboxRoot(id));
  if (!context.directoryExists(candidate) ||
      candidate === context.canonicalPath(workspace.path)) return null;
  if (relative(canonicalRoot, candidate).replaceAll("\\", "/") !== id)
    context.fail(`cannot rebind relocated sandbox '${candidate}': candidate escapes the canonical sandbox directory; recreate the sandbox`);
  return candidate;
}

export function assertRelocatedSandboxIdentity(context, id, workspace, candidate) {
  const packet = join(candidate, "openspec", "changes", id);
  const marker = join(packet, ".openspec.yaml");
  const expected = workspace.packetSnapshot?.[".openspec.yaml"];
  if (!context.directoryExists(packet) || !expected || !context.pathExists(marker) ||
      context.fileDigest(marker) !== expected)
    context.fail(`cannot rebind relocated sandbox '${candidate}': change identity does not match '${id}'`);
}

export function assertRelocatedSandboxLayout(context, workspace, candidate) {
  const required = [
    isSharedProject(context.root) ? join(candidate, '.changeloop.json') : join(candidate, ".claude", "harness", "foundation.mjs"),
    join(candidate, "openspec", "config.yaml")
  ];
  if (required.some((path) => !context.pathExists(path)))
    context.fail(`cannot rebind relocated sandbox '${candidate}': sandbox layout is incomplete; recreate the sandbox`);
  if (workspace.mode === "worktree" && !context.gitMetadataPresent(candidate))
    context.fail(`cannot rebind relocated sandbox '${candidate}': recorded worktree metadata is not valid at the new project location; recreate the sandbox`);
  if (workspace.mode === "copy" && workspace.git === "carried" &&
      !context.gitMetadataPresent(candidate))
    context.fail(`cannot rebind relocated sandbox '${candidate}': recorded copied Git metadata is not valid at the new project location; recreate the sandbox`);
}

export function rebindRelocatedSandboxOperation(context, id, state) {
  const workspace = state.workspace || {};
  const candidate = relocatedSandboxCandidate(context, id, workspace);
  if (!candidate) return false;
  assertRelocatedSandboxIdentity(context, id, workspace, candidate);
  assertRelocatedSandboxLayout(context, workspace, candidate);
  workspace.relocatedFrom = context.canonicalPath(workspace.path);
  workspace.path = candidate;
  workspace.reboundAt = context.now();
  state.workspace = workspace;
  context.saveRuntime(state);
  context.clearSnapshotCache(id);
  context.output.log(`REBOUND ${id}\n  workspace: ${candidate}`);
  return true;
}
