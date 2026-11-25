import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { deliveryTreeEntries } from "../transaction/delivery-integrity.mjs";
import { gatheringRoot, nestedRepositoryAncestor } from "../sandbox/sandbox-copy.mjs";
import { rejectedPaths } from "../sandbox/sandbox-replay.mjs";
import {
  replayCarriesLanded, targetEditCarried, targetEditSyncStop, targetUncommittedPaths,
  uncommittedCarryPlan
} from "../transaction/target-edits.mjs";
import {
  baseBlob, restoreAuthorizedTargetPaths, restoreRegenerableConflicts,
  stopForTargetConflict
} from "./target-restore.mjs";
import { projectionHash } from "./apply-journal.mjs";

// `inspect` is the read-only Land preflight: every refusal and decision is
// the one Land raises at this point, but no target path is restored and no
// carry is recorded. A path Land would restore first counts as restored.
export function gitApplyInputsOperation(context, id, sandboxPath,
  { regenerated = false, inspect = false } = {}) {
  const state = context.loadRuntime(id);
  const names = context.sandboxDiffNames(id, sandboxPath, state);
  stopForUncarriedTarget(context, id, state, sandboxPath);
  const restored = new Set(restoreAuthorizedTargetPaths(context, state, names, { inspect }));
  const pending = names.filter((path) => !(inspect && restored.has(path))).filter((path) =>
    context.pathIdentity(join(context.root, path)) !==
      context.pathIdentity(join(sandboxPath, path)) ||
    context.pathMode(join(context.root, path)) !== context.pathMode(join(sandboxPath, path)));
  if (!pending.length) return names;
  const directoryPaths = pending.filter((path) =>
    [join(context.root, path), join(sandboxPath, path)].some((candidate) =>
      context.lstat(candidate, { throwIfNoEntry: false })?.isDirectory()));
  if (directoryPaths.length)
    context.fail(`apply encountered nested repository or directory path(s): ${
      directoryPaths.join(", ")}; register nested repositories in openspec/repositories.yaml before creating the sandbox`);
  const diff = context.gitBuffer([
    "diff", "--binary", context.sandboxBase(state), "--", ...pending
  ], sandboxPath);
  if (diff.status !== 0) context.fail("cannot inspect sandbox diff");
  // A target edit the sandbox copy already carries is not overwritten work,
  // nor is landed work the agent merged by hand into these exact bytes after
  // the sandbox replay reported a same-line conflict.
  const resolvedLanded = (path) => {
    const row = state.workspace?.landedResolved?.[path];
    return Boolean(row) && row.target === context.pathIdentity(join(context.root, path)) &&
      row.sandbox === context.pathIdentity(join(sandboxPath, path));
  };
  // The harness's own clean replay of landed work carries it by construction.
  const replayed = (path) => replayCarriesLanded({
    record: state.workspace, path,
    targetIdentity: context.pathIdentity(join(context.root, path)),
    sandboxIdentity: context.pathIdentity(join(sandboxPath, path))
  });
  const carried = (path) => resolvedLanded(path) || replayed(path) || targetEditCarried({
    root: context.root, sandboxPath, path, baseBytes: baseBlob(context, state, path) });
  // An untracked-only or mode-only projection has no Git patch, but the
  // transaction below still copies it and binds its bytes/mode. Patch-check
  // only the tracked part; target-clobber checks still cover every path.
  if (diff.stdout.length) {
    const check = context.spawn("git", ["apply", "--check", "--whitespace=nowarn", "-"], {
      cwd: context.root, input: diff.stdout, encoding: "utf8"
    });
    if (check.status !== 0) {
      const rejected = rejectedPaths(check.stderr);
      if (!rejected.length)
        context.fail(`sandbox diff conflicts with target: ${check.stderr.trim()}`);
      const conflicts = rejected.filter((path) => !carried(path) &&
        !(inspect && restored.has(path)));
      if (conflicts.length && !regenerated &&
          restoreRegenerableConflicts(context, state, conflicts, { inspect })) {
        if (!inspect)
          return gitApplyInputsOperation(context, id, sandboxPath, { regenerated: true });
        // Land restores these and checks again, once; the rest is checked below.
        for (const path of conflicts) restored.add(path);
        regenerated = true;
      } else if (conflicts.length) {
        stopForTargetConflict(context, id, state, conflicts,
          "sandbox diff conflicts with target", { inspect });
      }
    }
  }
  const base = context.sandboxBase(state);
  const workingBlob = (path) => {
    const stats = context.lstat(path, { throwIfNoEntry: false });
    if (!stats) return null;
    return stats.isSymbolicLink()
      ? Buffer.from(context.readlink(path)) : context.readFile(path);
  };
  const clobbered = pending.filter((path) => !(inspect && restored.has(path))).filter((path) => {
    const target = workingBlob(join(context.root, path));
    if (target === null) return false;
    const sandboxContent = workingBlob(join(sandboxPath, path));
    if (sandboxContent !== null && target.equals(sandboxContent)) return false;
    const shown = context.gitBuffer(["show", `${base}:${path}`], context.root);
    return (shown.status !== 0 || !target.equals(shown.stdout)) && !carried(path);
  });
  if (clobbered.length && !regenerated &&
      restoreRegenerableConflicts(context, state, clobbered, { inspect }))
    return inspect ? names
      : gitApplyInputsOperation(context, id, sandboxPath, { regenerated: true });
  if (clobbered.length)
    stopForTargetConflict(context, id, state, clobbered,
      "apply would overwrite uncommitted target edits", { inspect });
  return names;
}

// Proof must have run on the target Land leaves. Whatever the sync would
// still carry or put back (one shared rule, so this stop always leads to a
// sync that changes the sandbox) sends Land back through the sync and proof
// before anything is applied: an uncommitted file that appeared or changed
// after the last sync, or a carried file the target has since reverted.
function stopForUncarriedTarget(context, id, state, sandboxPath) {
  const workspace = state.workspace;
  if (workspace?.mode !== "worktree" || workspace.applied || !context.blockWithDecision ||
      !context.gitBuffer || !context.lstat) return;
  const dirty = targetUncommittedPaths(context.gitBuffer, context.root);
  if (!dirty) return;
  const kind = (path) => {
    const stats = context.lstat(path, { throwIfNoEntry: false });
    return !stats ? "missing" : stats.isFile?.() ? "file" : "other";
  };
  const plan = uncommittedCarryPlan({
    root: context.root, sandboxPath, dirty, prior: workspace.targetUncommitted || {},
    landed: { ...(workspace.landedCarried || {}), ...(workspace.landedCarriedFrom || {}) },
    kind, identity: context.pathIdentity, bytes: context.readFile,
    baseBytes: (path) => baseBlob(context, state, path)
  });
  const stale = [...plan.carry, ...plan.restore].sort();
  if (!stale.length) return;
  const stop = targetEditSyncStop({ changeId: id, paths: stale });
  context.blockWithDecision(id, stop.code, stop.decision);
}

export function copyApplyCodePaths(context, id, state, sandboxPath) {
  const baseline = state.workspace.baseline || {};
  const target = context.workspaceManifest(context.root, id, true);
  const sandbox = context.workspaceManifest(sandboxPath, id, true);
  const codePaths = context.copyCodePaths(id, state);
  // A root without Git that gathers checkouts never copied its nested
  // repositories into the sandbox, so a path below one is work written where
  // no repository sandbox reads it; projecting it would edit that checkout.
  if (gatheringRoot(context.root)) {
    const nested = codePaths.filter((path) => nestedRepositoryAncestor(context.root, path));
    if (nested.length)
      context.fail(`apply encountered nested repository path(s): ${nested.slice(0, 10).join(", ")}${
        nested.length > 10 ? ", ..." : ""}; register nested repositories in openspec/repositories.yaml before creating the sandbox`);
  }
  for (const path of codePaths) {
    if ((target[path] ?? null) !== (baseline[path] ?? null) &&
        ((target[path] ?? null) !== (sandbox[path] ?? null) ||
         context.pathMode(join(context.root, path)) !==
           context.pathMode(join(sandboxPath, path))))
      context.fail(`isolated-copy conflict at '${path}'`);
  }
  return codePaths;
}

export function applyCodePaths(context, id, state, sandboxPath, options = {}) {
  if (state.workspace.mode === "copy")
    return copyApplyCodePaths(context, id, state, sandboxPath);
  if (state.workspace.mode === "worktree") {
    context.assertTargetHeadUnmoved(id, state);
    return context.gitApplyInputs(id, sandboxPath, options);
  }
  context.fail("change has no isolated sandbox");
}

export function applyCodeEntry(context, sandboxPath, rel) {
  const source = resolve(sandboxPath, rel);
  const target = context.safeRootPath(rel);
  return {
    path: rel,
    role: "code",
    before: context.pathIdentity(target),
    beforeMode: context.pathMode(target),
    after: context.pathIdentity(source),
    afterMode: context.pathMode(source),
    ...(context.pathIdentity(source)?.startsWith("directory:") ? {
      afterEntries: deliveryTreeEntries(sandboxPath, [rel], context.pathIdentity)
    } : {})
  };
}

// A composite Land without a writable root has no root projection, so the
// packet entry above never runs and Build's ticks stay in the sandbox. Merge
// only the ticks back into the root ledger before archive; the root packet
// stays the agreement source for every other line.
export function syncChildOnlyTaskProgress({ repositories, rootTasksPath, sandboxTasksPath,
  mergeTaskProgress, pathExists = existsSync }) {
  if (repositories.some((row) => row.id === "root" && row.mode === "write")) return false;
  if (!pathExists(rootTasksPath) || !pathExists(sandboxTasksPath)) return false;
  const current = readFileSync(rootTasksPath, "utf8");
  const merged = mergeTaskProgress(current, readFileSync(sandboxTasksPath, "utf8"));
  if (merged === current) return false;
  writeFileSync(rootTasksPath, merged);
  return true;
}

// A composite Land without a writable root, for a change amended during
// Build: the agreement the user approved and the agent implemented is the
// sandbox packet (new tasks, revised requirements, spec delta, amendment
// history), not the root packet an amendment never wrote. Archiving the root
// packet would archive the pre-amendment agreement and merge the wrong spec
// delta. The whole sandbox packet replaces the root packet before archive;
// the root's own files absent from the sandbox are removed. Without an
// amendment the tick-only merge above keeps every other root line.
// Returns "replaced", true (ticks merged), or false (nothing to do).
export function syncChildOnlyPacket({ repositories, rootPacketPath, sandboxPacketPath,
  amended = false, mergeTaskProgress, pathExists = existsSync }) {
  if (repositories.some((row) => row.id === "root" && row.mode === "write")) return false;
  if (!amended)
    return syncChildOnlyTaskProgress({ repositories, mergeTaskProgress, pathExists,
      rootTasksPath: join(rootPacketPath, "tasks.md"),
      sandboxTasksPath: join(sandboxPacketPath, "tasks.md") });
  if (!pathExists(rootPacketPath) || !pathExists(sandboxPacketPath)) return false;
  const files = (base, prefix = "") => {
    const out = [];
    for (const entry of readdirSync(join(base, prefix), { withFileTypes: true })) {
      const name = `${prefix}${entry.name}`;
      if (entry.isDirectory()) out.push(...files(base, `${name}/`));
      else if (entry.isFile()) out.push(name);
    }
    return out;
  };
  const wanted = files(sandboxPacketPath);
  for (const name of files(rootPacketPath))
    if (!wanted.includes(name)) rmSync(join(rootPacketPath, name), { force: true });
  for (const name of wanted) {
    const target = join(rootPacketPath, name);
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, readFileSync(join(sandboxPacketPath, name)));
  }
  return "replaced";
}

export function changeArtifactApplyEntry(context, id, sandboxPath) {
  const changeRel = context.currentChangeRelativePath(id);
  return {
    path: changeRel,
    role: "change-artifacts",
    before: context.pathIdentity(context.changePath(id)),
    beforeMode: context.pathMode(context.changePath(id)),
    after: context.pathIdentity(join(sandboxPath, changeRel)),
    afterMode: context.pathMode(join(sandboxPath, changeRel))
  };
}

export function buildApplyEntriesOperation(context, id, state, options = {}) {
  const sandboxPath = state.workspace.path;
  const entries = [];
  for (const rel of applyCodePaths(context, id, state, sandboxPath, options))
    entries.push(applyCodeEntry(context, sandboxPath, rel));
  entries.push(changeArtifactApplyEntry(context, id, sandboxPath));
  return entries;
}

export function buildReapplyEntriesOperation(context, id, state, priorJournal) {
  const sandboxPath = state.workspace.path;
  const projected = new Map((priorJournal.entries || [])
    .map((entry) => [entry.path, entry]));
  const changeRel = context.currentChangeRelativePath(id);
  const paths = [...new Set([
    ...projected.keys(), ...context.reapplyCodePaths(id, state), changeRel
  ])].sort();
  return paths.map((rel) => {
    const prior = projected.get(rel);
    return {
      path: rel,
      role: prior?.role || (rel === changeRel ? "change-artifacts" : "code"),
      before: prior ? prior.after : context.pathIdentity(context.safeRootPath(rel)),
      beforeMode: prior && Object.prototype.hasOwnProperty.call(prior, "afterMode")
        ? prior.afterMode : context.pathMode(context.safeRootPath(rel)),
      after: context.pathIdentity(resolve(sandboxPath, rel)),
      afterMode: context.pathMode(resolve(sandboxPath, rel))
    };
  });
}

export function assertApplySourceUnchanged(context, id, state, prepared) {
  if (!prepared && context.directoryHash(context.changePath(id)) !==
      state.workspace.changeSourceHash)
    context.fail("active change was edited after the last sandbox sync");
}

export function assertNoChildApplyEntries(context, id, state, entries) {
  const nested = context.nestedRepositoryPathMatcher(context.nestedRepositoryPaths(id, state));
  for (const entry of entries) {
    if (entry.role === "code" && nested(entry.path))
      context.fail(`apply entry '${entry.path}' crosses into a child repository`);
  }
}

export function backupApplyEntries(context, transactionRoot, entries) {
  for (const [index, entry] of entries.entries()) {
    entry.backup = `backup/${index}`;
    if (entry.before !== null)
      context.copyPath(context.safeRootPath(entry.path),
        join(transactionRoot, entry.backup));
  }
}

// Every refusal Apply raises before its first write. Land runs it inside the
// transaction below; the read-only Land preflight (`land check`) runs the same
// function with `inspect`, so both report the same stop.
export function planApplyEntriesOperation(context, id, state, prepared = null, options = {}) {
  assertApplySourceUnchanged(context, id, state, prepared);
  const entries = prepared || context.buildApplyEntries(id, state, options);
  assertNoChildApplyEntries(context, id, state, entries);
  context.assertDeletionsAreDeclared(id, state, entries);
  return entries;
}

export function prepareApplyTransactionOperation(context, id, state, prepared = null) {
  const entries = planApplyEntriesOperation(context, id, state, prepared);
  const transactionId = `apply-${context.dateNow()}-${context.pid}`;
  const transactionRoot = context.applyTransactionRoot(id, transactionId);
  context.makeDirectory(transactionRoot, { recursive: true });
  backupApplyEntries(context, transactionRoot, entries);
  const proof = context.readJson(context.proofPath(id), {});
  const journal = {
    version: 1,
    changeId: id,
    transactionId,
    proofRunId: proof.proofRunId || null,
    mode: state.workspace.mode,
    status: "prepared",
    sandboxPath: state.workspace.path,
    targetPath: context.root,
    projectionHash: projectionHash(context.stableHash, entries),
    entries,
    appliedPaths: [],
    inFlightPaths: [],
    createdAt: context.now()
  };
  context.saveApplyJournal(journal);
  return journal;
}

export function refreshProjectionEntry(context, state, entry) {
  const source = resolve(state.workspace.path, entry.path);
  const expected = context.pathIdentity(source);
  const expectedMode = context.pathMode(source);
  const current = context.pathIdentity(context.safeRootPath(entry.path));
  const currentMode = context.pathMode(context.safeRootPath(entry.path));
  if (current !== expected || currentMode !== expectedMode)
    context.fail(`cannot refresh diverged applied path '${entry.path}'`);
  entry.after = expected;
  entry.afterMode = expectedMode;
}

export function refreshAppliedProjectionOperation(context, state) {
  const transactionId = state.workspace?.apply?.transactionId;
  const journalPath = context.transactionJournalPath(state.id, transactionId);
  if (!transactionId || !context.pathExists(journalPath))
    context.fail("cannot refresh an applied projection without its transaction journal");
  const journal = context.readJson(journalPath);
  for (const entry of journal.entries) refreshProjectionEntry(context, state, entry);
  journal.projectionHash = projectionHash(context.stableHash, journal.entries);
  journal.proofRunId = context.readJson(context.proofPath(state.id), {}).proofRunId || null;
  journal.status = "verified";
  journal.refreshedAt = context.now();
  context.saveApplyJournal(journal);
  state.workspace.apply.projectionHash = journal.projectionHash;
  state.workspace.apply.status = "verified";
  context.saveRuntime(state);
}

export function assertRecoveredProjection(context, id, state, archivedPath) {
  if (!["worktree", "copy"].includes(state.workspace?.mode)) return;
  if (!state.workspace.applied)
    context.fail(`the interrupted archive never projected the sandbox into the target; ` +
      `restore 'openspec/changes/${id}' from '${archivedPath}' and land again`);
  const verification = context.verifyAppliedProjection(state, { archivedChangePath: archivedPath });
  if (!verification.valid)
    context.fail(`recovered archive has an invalid applied projection: ${verification.reason}`);
}

export function assertRecoveredArchiveReadyOperation(context, id, state, archivedPath) {
  context.assertMultiRepositoryArchiveReady(id, state);
  assertRecoveredProjection(context, id, state, archivedPath);
}
