import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { openSpecEnvironment } from '../../core/project-installation.mjs';
import { targetHeadMovedDecision, undeclaredDeletions } from "../transaction/apply-recovery.mjs";
import {
  isInvestigationPath, nestedRepositoryPathMatcher, sandboxCodePathspec
} from "../../core/workspace-surface.mjs";
import { transitionLifecycleState } from "../../core/lifecycle-reducer.mjs";
import { compositeRepositorySelection } from "../../core/repository-binding.mjs";
import { createRepositoryDeliverySaga } from "../delivery/repository-delivery-saga.mjs";
import { deliveryTreeEntries, assertDeliveryEntries } from "../transaction/delivery-integrity.mjs";
import { amendedAgreementMatches, approvalMatches } from "../../core/user-decisions.mjs";

import { writeSpecBefore } from "./land-undo.mjs";
import {
  ROOT_POINTER_MOVED, repositoryPointerStop, rootPointerMoves, rootPointerRepairMessage
} from "./land-verification.mjs";
import { carriedLandedExcludes, landedTargetPaths, otherLandedOutput, parseRestoreTargetPaths, restorableTargetPaths } from "../transaction/target-edits.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import { dependencySnapshot, postLandInstall } from "./post-land-install.mjs";
import { targetBaseBytes } from "./target-restore.mjs";
import {
  assertLocalApply, beginApplyJournal, executeApplyJournal, projectionHash,
  reapplyProjection
} from "./apply-journal.mjs";
import {
  assertRecoveredArchiveReadyOperation, buildApplyEntriesOperation,
  buildReapplyEntriesOperation, gitApplyInputsOperation, planApplyEntriesOperation,
  prepareApplyTransactionOperation, refreshAppliedProjectionOperation, syncChildOnlyPacket
} from "./apply-entries.mjs";
import { createArchiveRecords } from "./archive-records.mjs";
import { createLandPreflight } from "./land-preflight.mjs";
import { createArchiveResume } from "./archive-resume.mjs";

// `checkedReadiness` is archive's own landCheck from the same Land pass. That
// check already refused any pending apply, and only the evidence breadcrumb
// was written since, so it is reused instead of recomputed. It is a separate
// positional argument so no CLI flag can ever supply it.
export function applySandboxOperation(context, id, options = {}, checkedReadiness = null) {
  const initialState = context.loadRuntime(id);
  assertLocalApply(initialState, options, context.fail);
  if (initialState.workspace?.applied && options.refresh)
    context.refreshAppliedProjection(initialState);
  context.recoverPendingApply(id, initialState);
  if ((checkedReadiness || context.landCheck(id)).archived) return;
  const state = context.loadRuntime(id);
  const reapply = reapplyProjection({ ...context, id, state });
  if (reapply.resumed) return;
  const journal = context.prepareApplyTransaction(id, state, reapply.prepared);
  beginApplyJournal({ ...context, id, journal });
  executeApplyJournal({ ...context, id, journal });
}

export function sandboxDiffNamesOperation(context, id, sandboxPath, state,
  paths = context.applyPathspec(id, state)) {
  if (!paths.length) return [];
  const tracked = context.git(["diff", "--name-only", "-z", context.sandboxBase(state), "--",
    ...paths], sandboxPath);
  if (tracked.status !== 0)
    context.fail(`cannot inspect sandbox paths: ${tracked.stderr.trim()}`);
  // Read untracked names directly. `git add -N .` used to make them visible to
  // diff, but it also mutated the sandbox index during Land and changed the
  // forced workspace snapshot after a passing proof.
  const untracked = context.git([
    "ls-files", "--others", "--exclude-standard", "-z", "--", ...paths
  ], sandboxPath);
  if (untracked.status !== 0)
    context.fail(`cannot inspect untracked sandbox paths: ${untracked.stderr.trim()}`);
  return [...new Set([
    ...tracked.stdout.split("\0"), ...untracked.stdout.split("\0")
  ].filter(Boolean))].sort();
}

export function createApplyRuntime({
  root,
  transactions,
  loadRuntime,
  saveRuntime,
  selectedRepositories = (_id, state) => [{
    id: "root", type: "git", mode: "write", path: root,
    dependsOn: [], workspacePath: state?.workspace?.path || root
  }],
  workspaceManifest,
  declaredSurfaceMatcher,
  currentChangeRelativePath,
  changePath,
  safeRootPath,
  pathIdentity,
  pathMode,
  directoryHash,
  fileDigest,
  pathInside,
  applyTransactionRoot,
  copyPath,
  proofPath,
  readJson,
  writeJson,
  stableHash,
  syncClaudeTelemetry,
  modelUsageRecorded,
  telemetryReadiness = null,
  foundationPolicy = () => ({ telemetry: { requireUsage: false } }),
  mergeTaskProgress = null,
  saveApplyJournal,
  transactionJournalPath,
  verifyAppliedProjection,
  rollbackApplyTransaction,
  applyTransactionEntry,
  cleanupApplyTransaction,
  git,
  gitBuffer,
  gitHead,
  cleanupAppliedSandbox,
  cleanupRepositorySandboxes,
  recoverPendingApply,
  landCheck,
  assertMultiRepositoryArchiveReady,
  archivedChangeRelativePath,
  assertOpenSpecCli,
  cleanupChangeLeases,
  now,
  archiveCheckpoint = (..._args) => {},
  measure = (_stage, operation) => operation(),
  assertLandGrant = (..._args) => {},
  consumeLandGrant = (..._args) => {},
  blockWithDecision,
  fail,
  // Archive appendix inputs. All optional: an unwired reader contributes no
  // rows. `reviewAttemptRecords(id)` must not migrate state;
  // `rolloutGates(id)` reads the active packet, so it runs before the move.
  reviewAttemptRecords = (_id) => [],
  rolloutGates = () => [],
  // Every repository the topology declares under root, selected or not: its
  // gitlink is its own pointer, never root projection content.
  declaredRepositoryPaths = () => []
}) {
  function nestedRepositoryPaths(id, state) {
    return [...new Set([...selectedRepositories(id, state)
      .filter((repository) => repository.id !== "root" &&
        repository.relativePath && repository.relativePath !== "." &&
        !repository.relativePath.startsWith("../"))
      .map((repository) => repository.relativePath),
    ...declaredRepositoryPaths()])];
  }

  // Another change's landed bytes the sandbox carries unchanged are that
  // change's Land, not this one's: projecting them could overwrite a target
  // edit made after it.
  function applyPathspec(id, state) {
    return [...sandboxCodePathspec(id, nestedRepositoryPaths(id, state)),
      ...carriedLandedExcludes(state.workspace, pathIdentity)];
  }

  function copyCodePaths(id, state) {
    const baseline = state.workspace.baseline || {};
    if (state.workspace?.mode === "copy" && Object.values(baseline)
      .some((identity) => /^[0-9a-f]{64}$/i.test(String(identity))))
      fail(`copy sandbox '${id}' uses the legacy content-only identity format; recreate the sandbox and prove once before Land so executable modes and symlinks are bound safely`);
    const sandbox = workspaceManifest(state.workspace.path, id, true);
    const nested = nestedRepositoryPathMatcher(nestedRepositoryPaths(id, state));
    return [...new Set([...Object.keys(baseline), ...Object.keys(sandbox)])]
      .filter((path) => baseline[path] !== sandbox[path] && !nested(path) &&
        !isInvestigationPath(path)).sort();
  }

  // Against the base the sandbox branched from, not its HEAD: an agent that
  // commits inside the sandbox moves HEAD, and a HEAD-relative diff would
  // silently omit every committed change while proof — which hashes the
  // sandbox index — still counts it. That lands a partial change as a success.
  function sandboxBase(state) {
    return state.workspace?.baseHead || "HEAD";
  }

  // Paths whose target bytes are still another change's landed, uncommitted
  // projection: path -> landing change id.
  function landedBy(id, paths) {
    if (!paths.length || !transactions) return {};
    return landedTargetPaths({ root, paths, identity: pathIdentity,
      landed: otherLandedOutput({ transactions, changeId: id, readJson }) });
  }

  const sandboxDiffNames = sandboxDiffNamesOperation.bind(null, {
    applyPathspec,
    git,
    sandboxBase,
    fail
  });

  const gitApplyInputs = gitApplyInputsOperation.bind(null, {
    root,
    git,
    loadRuntime,
    sandboxDiffNames,
    pathIdentity,
    pathMode,
    lstat: lstatSync,
    gitBuffer,
    sandboxBase,
    spawn: spawnSync,
    readlink: readlinkSync,
    readFile: readFileSync,
    writeFile: writeFileSync,
    removePath: (path) => rmSync(path, { force: true }),
    landedBy,
    saveRuntime,
    blockWithDecision,
    fail
  });

  // Records the `--restore-target` authorization Land consumes. Regenerable
  // artifacts clean at isolation need none; any other path needs the user's
  // decision reference, because restoring discards target bytes.
  function recordTargetRestore(id, value, decisionRef = null) {
    const state = loadRuntime(id);
    if (state.status === "archived") fail(`change '${id}' is already archived`);
    if (!["worktree", "copy"].includes(state.workspace?.mode))
      fail(`change '${id}' has no sandbox whose target files Land could restore`);
    const paths = parseRestoreTargetPaths(value);
    if (!paths.length) fail("--restore-target requires comma-separated target paths");
    for (const path of paths) {
      try { safeRootPath(path); } catch (error) { fail(error.message); }
    }
    const unprovable = state.workspace.mode === "copy" ? paths.filter((path) =>
      targetBaseBytes({ root, gitBuffer, sandboxBase }, state, path) === undefined) : [];
    if (unprovable.length)
      fail(`--restore-target has no recorded base bytes for the isolated copy at: ${
        unprovable.join(", ")}; Land cannot restore them. Merge the target edits into the ` +
        "sandbox copy instead (keep-target).");
    const landed = landedBy(id, paths);
    if (Object.keys(landed).length)
      fail(`--restore-target would discard the landed, uncommitted work of ${
        [...new Set(Object.values(landed))].sort().join(", ")} at: ${Object.keys(landed).sort()
        .join(", ")}; Land never overwrites an earlier landed change. Resume with ` +
        `'cloop advance ${id} --through archived' and it merges that work instead.`);
    const snapshot = state.workspace.targetDirty || state.workspace.preexisting || {};
    const needsDecision = paths.filter((path) =>
      !restorableTargetPaths([path], snapshot).length);
    const ref = String(decisionRef || "").trim() || null;
    if (needsDecision.length && !ref)
      fail(`--restore-target would discard target edits that may be user work at: ${
        needsDecision.join(", ")}; ask the user, then pass --decision-ref <user-decision>`);
    state.targetRestore = {
      paths,
      identities: Object.fromEntries(paths.map((path) =>
        [path, pathIdentity(safeRootPath(path))])),
      decisionRef: ref,
      recordedAt: now()
    };
    saveRuntime(state);
    return state.targetRestore;
  }

  function assertTargetHeadUnmoved(id, state) {
    const currentHead = gitHead(root);
    if (currentHead === state.workspace.baseHead) return;
    blockWithDecision(id, "control-head-moved", targetHeadMovedDecision({
      changeId: id,
      recordedBase: state.workspace.baseHead,
      currentHead,
      multiRepository: compositeRepositorySelection(selectedRepositories(id, state)),
      action: "Applying"
    }));
  }

  const buildApplyEntries = buildApplyEntriesOperation.bind(null, {
    root,
    workspaceManifest,
    copyCodePaths,
    pathMode,
    assertTargetHeadUnmoved,
    gitApplyInputs,
    safeRootPath,
    pathIdentity,
    currentChangeRelativePath,
    changePath,
    fail
  });

  // Paths the sandbox still wants to project once the target already carries a
  // prior projection. The virgin-target conflict guards in buildApplyEntries
  // cannot run here: after a first apply the target legitimately differs from
  // the baseline. Divergence is caught instead by matching each entry's
  // 'before' against what the previous transaction actually projected.
  function reapplyCodePaths(id, state) {
    const sandboxPath = state.workspace.path;
    if (state.workspace.mode === "copy") {
      return copyCodePaths(id, state);
    }
    if (state.workspace.mode !== "worktree") fail("change has no isolated sandbox");
    assertTargetHeadUnmoved(id, state);
    return sandboxDiffNames(id, sandboxPath, state);
  }

  // The full projection, not just the delta, so verifyAppliedProjection keeps
  // covering every path the change owns.
  const buildReapplyEntries = buildReapplyEntriesOperation.bind(null, {
    currentChangeRelativePath,
    reapplyCodePaths,
    pathIdentity,
    safeRootPath,
    pathMode
  });

  function assertDeletionsAreDeclared(id, state, entries) {
    // Apply projects the root workspace; child repositories land by commit.
    const undeclared = undeclaredDeletions(entries,
      declaredSurfaceMatcher(id, state, "root"));
    if (!undeclared.length) return;
    const preview = undeclared.slice(0, 10).map((entry) => entry.path);
    fail(`apply would delete ${undeclared.length} path(s) no task declares: ${
      preview.join(", ")}${undeclared.length > preview.length ? ", ..." : ""
    }. A deletion has to come from a removal observed inside the sandbox, not ` +
      "from a path missing from its manifest; declare the path in tasks.md " +
      "`[paths:]` if the change really owns it.");
  }

  const prepareContext = {
    root,
    directoryHash,
    changePath,
    buildApplyEntries,
    nestedRepositoryPathMatcher,
    nestedRepositoryPaths,
    assertDeletionsAreDeclared,
    dateNow: Date.now,
    pid: process.pid,
    applyTransactionRoot,
    makeDirectory: mkdirSync,
    copyPath,
    safeRootPath,
    readJson,
    proofPath,
    stableHash,
    now,
    saveApplyJournal,
    fail
  };
  const prepareApplyTransaction = prepareApplyTransactionOperation.bind(null, prepareContext);
  const planApplyEntries = planApplyEntriesOperation.bind(null, prepareContext);

  const refreshAppliedProjection = refreshAppliedProjectionOperation.bind(null, {
    transactionJournalPath,
    pathExists: existsSync,
    readJson,
    pathIdentity,
    pathMode,
    safeRootPath,
    stableHash,
    proofPath,
    now,
    saveApplyJournal,
    saveRuntime,
    fail
  });

  const applySandbox = applySandboxOperation.bind(null, {
    root,
    git,
    gitBuffer,
    writeFile: writeFileSync,
    removePath: (path) => rmSync(path, { force: true }),
    sandboxBase,
    landedBy,
    blockWithDecision,
    loadRuntime,
    saveRuntime,
    refreshAppliedProjection,
    recoverPendingApply,
    landCheck,
    verifyAppliedProjection,
    buildReapplyEntries,
    stableHash,
    prepareApplyTransaction,
    safeRootPath,
    pathIdentity,
    pathMode,
    saveApplyJournal,
    applyTransactionEntry,
    rollbackApplyTransaction,
    now,
    fail
  });

  // The multi-repository delivery saga is only needed when a non-root
  // repository is selected; single-repository Apply never constructs it.
  let repositoryDeliverySaga = null;
  const repositoryDelivery = () => repositoryDeliverySaga ||= createRepositoryDeliverySaga({
    transactions,
    loadRuntime,
    saveRuntime,
    selectedRepositories,
    git,
    fileDigest,
    directoryHash,
    pathInside,
    readJson,
    writeJson,
    stableHash,
    proofPath,
    now,
    prepareRoot: prepareApplyTransaction,
    planRoot: (id, state, options) => planApplyEntries(id, state, null, options),
    executeRoot: (id, journal) => {
      beginApplyJournal({
        id, journal, safeRootPath, pathIdentity, pathMode,
        saveApplyJournal, now, fail
      });
      executeApplyJournal({
        id, journal, root, loadRuntime, saveRuntime, safeRootPath,
        pathIdentity, pathMode, applyTransactionEntry,
        rollbackApplyTransaction, saveApplyJournal, now, fail
      });
    },
    verifyRoot: verifyAppliedProjection,
    // The single-repository reapply rule, for the root of a composite change:
    // the whole projection again, or null when the delivered one is current.
    reapplyRoot: (id, state, verification) => {
      const entries = buildReapplyEntries(id, state, verification.journal);
      return projectionHash(stableHash, entries) === state.workspace.apply.projectionHash
        ? null : entries;
    },
    fail
  });

  const {
    captureSpecSyncInputs, settleArchivedSpecEndings, verifyArchivedSpecs, recordDeliveryIntegrity,
    failSpecSync, landPreflight, outstandingSpecSync
  } = createLandPreflight({
    blockWithDecision, changePath, currentChangeRelativePath, fail, loadRuntime, now,
    pathIdentity, planApplyEntries, repositoryDelivery, root, selectedRepositories,
    specSyncPending
  });

  const assertRecoveredArchiveReady = assertRecoveredArchiveReadyOperation.bind(null, {
    root,
    assertMultiRepositoryArchiveReady,
    verifyAppliedProjection,
    fail
  });

  // OpenSpec already moved the packet and merged the specs, but the merge was
  // not yet verified (a crash, or a violation the user is repairing).
  function specSyncPending(id, state = loadRuntime(id)) {
    return state.status !== "archived" && state.land?.status === "specs-archived" &&
      !existsSync(changePath(id));
  }

  const {
    completeSpecSync, resumeArchivedChange, recoverInterruptedArchive
  } = createArchiveResume({
    appendArchiveAppendix: (...args) => appendArchiveAppendix(...args),
    archivedChangeRelativePath, assertRecoveredArchiveReady, assertRetainedArchiveIntegrity,
    cleanupAppliedSandbox, cleanupApplyTransaction, cleanupChangeLeases,
    cleanupRepositorySandboxes, consumeLandGrant, failSpecSync, now, outstandingSpecSync,
    pathIdentity, recordDeliveryIntegrity, saveRuntime, settleArchivedSpecEndings,
    stripArchiveAppendix: (...args) => stripArchiveAppendix(...args)
  });

  function assertRetainedArchiveIntegrity(id, state, archivedPath) {
    if (state.specApproval?.required &&
        (state.specApproval.revision !== Number(state.contractRevision || 0) ||
        !approvalMatches(state.specApproval.identity, root,
          archivedPath.slice("openspec/changes/".length))))
      fail("interrupted archive no longer matches the approved agreement; preserve both versions and restore the approved packet before retrying Land");
    if (state.land?.archivePacketEntries) {
      const active = `openspec/changes/${id}`;
      assertDeliveryEntries(root, state.land.archivePacketEntries.map((entry) => ({
        ...entry, path: archivedPath + entry.path.slice(active.length)
      })), pathIdentity);
    }
  }

  function archiveRecoveryReady(id) {
    const state = loadRuntime(id);
    // Only verification remains; completeSpecSync re-checks it before archiving.
    if (specSyncPending(id, state)) return true;
    if (state.status === "archived" || state.land?.status !== "archive-prepared" ||
        existsSync(changePath(id))) return false;
    const archivedPath = archivedChangeRelativePath(id);
    if (!archivedPath) return false;
    assertRecoveredArchiveReady(id, state, archivedPath);
    assertRetainedArchiveIntegrity(id, state, archivedPath);
    const outstanding = outstandingSpecSync(state);
    if (outstanding.length) failSpecSync(outstanding);
    return true;
  }

  function recoverArchive(id, authorizeLand) {
    if (loadRuntime(id).status === "archived" || specSyncPending(id)) {
      archive(id);
      return true;
    }
    if (!archiveRecoveryReady(id)) return false;
    authorizeLand(id);
    archive(id);
    return true;
  }

  function snapshotArchiveEvidence(id, readiness) {
    const journal = loadRuntime(id);
    const proof = readJson(proofPath(id), {});
    journal.land = {
      ...(journal.land || {}),
      status: "evidence-snapshotted",
      proofRunId: proof.proofRunId || null,
      assurance: readiness.assurance,
      updatedAt: now()
    };
    saveRuntime(journal);
  }

  // A declared repository's pointer moved in the root sandbox is excluded from
  // the root projection; it becomes a decision before any target write instead
  // of a silent drop.
  function assertRootPointersUnmoved(id, state) {
    if (state.workspace?.mode !== "worktree" || !state.workspace.path) return;
    const paths = nestedRepositoryPaths(id, state);
    if (!paths.length) return;
    const raw = git(["diff", "--cached", "--raw", "-z", "--no-abbrev", "--no-renames",
      sandboxBase(state), "--", ...paths], state.workspace.path);
    if (raw.status !== 0)
      fail(`cannot inspect repository pointers in the root sandbox: ${
        String(raw.stderr || "").trim()}`);
    const moves = rootPointerMoves(raw.stdout);
    if (!moves.length) return;
    const owners = new Map(selectedRepositories(id, state)
      .filter((repository) => repository.id !== "root" && repository.relativePath)
      .map((repository) => [repository.relativePath.replace(/\/+$/, ""), repository]));
    // Selecting another repository widens scope: only that is the user's call.
    const unselected = moves.filter((move) => !owners.has(move.path));
    if (unselected.length) {
      const stop = repositoryPointerStop({ changeId: id, moves: unselected });
      blockWithDecision(id, stop.code, stop.decision);
    }
    fail(rootPointerRepairMessage({
      changeId: id, rootSandbox: state.workspace.path,
      moves: moves.map((move) => {
        const repository = owners.get(move.path);
        return { ...move, repositoryId: repository.id,
          sandboxPath: state.repositories?.[repository.id]?.path || repository.workspacePath };
      })
    }), 1, { owner: "agent", boundary: "land-verification", code: ROOT_POINTER_MOVED });
  }

  function applyArchiveWorkspace(id, readiness) {
    if (!["worktree", "copy"].includes(readiness.state.workspace?.mode))
      return readiness;
    assertRootPointersUnmoved(id, readiness.state);
    const composite = compositeRepositorySelection(selectedRepositories(id, readiness.state));
    const installs = !composite && typeof pathIdentity === "function";
    const dependenciesBefore = installs ? dependencySnapshot(root, pathIdentity) : null;
    measure("land.apply", () => {
      if (composite) {
        repositoryDelivery().apply(id);
        if (typeof mergeTaskProgress === "function") syncChildOnlyPacket({
          repositories: selectedRepositories(id, readiness.state), mergeTaskProgress,
          rootPacketPath: changePath(id),
          sandboxPacketPath: join(readiness.state.workspace.path, currentChangeRelativePath(id)),
          // Only the packet an amendment left is projected whole; a packet
          // edited by hand after it is still drift for the approval gate.
          amended: amendedAgreementMatches(readiness.state, readiness.state.workspace.path, id)
        });
      }
      else applySandbox(id, { controlPlane: true }, readiness);
    });
    const install = !installs ? null : measure("land.install", () => postLandInstall({
      before: dependenciesBefore, after: dependencySnapshot(root, pathIdentity),
      sandbox: foundationPolicy().sandbox || {}, workspace: root, pathExists: existsSync,
      run: (command, cwd) => spawnSync("sh", ["-c", command], {
        cwd, encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
        timeout: Number(foundationPolicy().sandbox?.setupTimeoutMs) || 600000
      })
    }));
    if (install?.status === "ok") console.log(`LAND ${id}: dependencies installed (${install.command})`);
    else if (install) console.error(`WARNING: Land applied the change but the dependency install failed ` +
      `(exit ${install.exitCode}); run \`${install.command}\` in ${install.workspace}`);
    const journal = loadRuntime(id);
    journal.land = { ...journal.land, status: "code-applied", ...(install ? { dependencyInstall: install } : {}),
      updatedAt: now() };
    saveRuntime(journal);
    // Post-apply readiness binds the hash recorded before the destructive
    // OpenSpec archive; it is never reused.
    return measure("land.check", () => landCheck(id));
  }

  const {
    recordArchiveTelemetry, prepareArchiveAppendix, assertVerificationRecordUnclaimed,
    appendArchiveAppendix, stripArchiveAppendix
  } = createArchiveRecords({
    changePath, fail, now, proofPath, readJson, reviewAttemptRecords, rolloutGates, root,
    saveRuntime, telemetryReadiness
  });

  function runOpenSpecArchive(id, state, readiness) {
    const preArchiveWorkspaceHash = readiness.hash;
    // 'openspec archive' moves the change out of openspec/changes and rewrites
    // openspec/specs in one step, so the delta and the pre-merge spec text can
    // only be read now.
    const specSyncInputs = captureSpecSyncInputs(id);
    // This is the recovery record for the destructive OpenSpec move. Persist it
    // before the command so a crash after the move can still verify the merge.
    state.specSyncInputs = specSyncInputs;
    state.preArchiveWorkspaceHash = preArchiveWorkspaceHash;
    // The spec text OpenSpec rewrites is kept beside the Land journal, not in
    // the runtime record, so `advance --undo-land` can restore it later.
    if (state.workspace?.apply?.transactionId && applyTransactionRoot && writeJson)
      writeSpecBefore(applyTransactionRoot(id, state.workspace.apply.transactionId),
        specSyncInputs, writeJson);
    state.land = { ...state.land, status: "archive-prepared", updatedAt: now(),
      archiveAppendix: prepareArchiveAppendix(id, state),
      ...(typeof pathIdentity === "function" ? {
        archivePacketEntries: deliveryTreeEntries(root, [`openspec/changes/${id}`], pathIdentity)
      } : {}) };
    saveRuntime(state);
    // landCheck already gated this; repeated here because it is the last point
    // before the destructive step and the CLI can disappear in between.
    assertOpenSpecCli(root, fail);
    archiveCheckpoint("before-archive-command", state);
    const cli = spawnSync("openspec", ["archive", id, "--yes"], { cwd: root, encoding: "utf8", env: openSpecEnvironment(root) });
    if (cli.status !== 0) fail(`OpenSpec archive failed: ${(cli.stderr || cli.stdout).trim()}`);
    archiveCheckpoint("after-archive-command", state);
    state.preArchiveWorkspaceHash = preArchiveWorkspaceHash;
    state.archivedChangePath = archivedChangeRelativePath(id);
    // `land.status` is a breadcrumb, not the saga's position. Resume branches on
    // `workspace.cleanup?.status` and `repositoryCleanup` — never on this — so
    // reading it to work out where a Land stopped will give a confident wrong
    // answer. Named here because it reads exactly like a checkpoint.
    state.land = { ...state.land, status: "specs-archived", updatedAt: now() };
    saveRuntime(state);
    // A merge that silently drops or rewrites a requirement still exits 0, and
    // openspec/specs is durable, so the exit code is not evidence.
    archiveCheckpoint("before-spec-sync-verification", state);
    settleArchivedSpecEndings(specSyncInputs);
    const specViolations = verifyArchivedSpecs(specSyncInputs);
    if (specViolations.length) {
      state.specSyncViolations = specViolations;
      // Only retained on failure: the retry guard needs the pre-merge text to
      // re-verify, and carrying it on the happy path would bloat every state file.
      state.specSyncInputs = specSyncInputs;
      saveRuntime(state);
      failSpecSync(specViolations);
    }
    appendArchiveAppendix(state, state.archivedChangePath);
    // `archived` is reported only once the merged specs verify; a crash or a
    // violation before this resumes through interrupted-archive recovery,
    // which re-verifies from the retained inputs.
    transitionLifecycleState(state, "archived", "openspec-archive-complete");
    state.archivedAt = now();
    recordDeliveryIntegrity(state, state.archivedChangePath, specSyncInputs);
    delete state.specSyncInputs;
    delete state.specSyncViolations;
    saveRuntime(state);
    archiveCheckpoint("after-spec-sync-verification", state);
    return cli;
  }

  function finalizeArchivedChange(id, state, telemetry, cli) {
    archiveCheckpoint("before-final-audit", state);
    archiveCheckpoint("after-final-audit", state);
    state.land = { ...state.land, status: "archive-audited", updatedAt: now() };
    archiveCheckpoint("before-cleanup", state);
    state.workspace.cleanup = cleanupAppliedSandbox(id, state);
    if (state.repositories &&
        compositeRepositorySelection(selectedRepositories(id, state)))
      repositoryDelivery().cleanup(id, state);
    if (state.repositories)
      state.repositoryCleanup = cleanupRepositorySandboxes(id, state);
    cleanupChangeLeases(id);
    if (state.workspace.apply)
      state.workspace.apply.cleanup = cleanupApplyTransaction(state);
    delete state.workspace.baseline;
    state.land.status = "sandbox-cleaned";
    saveRuntime(state);
    consumeLandGrant(id);
    archiveCheckpoint("after-cleanup", state);
    if (!state.archivedChangePath)
      console.error("WARNING: OpenSpec reported success but the archived change directory was not found");
    if (["failed", "refused"].includes(state.workspace.cleanup.status))
      console.error(`WARNING: sandbox cleanup ${state.workspace.cleanup.status}: ${state.workspace.cleanup.reason}`);
    if (!telemetry && !modelUsageRecorded(id))
      console.error(`WARNING: no model usage was imported for this change; cost and token columns stay empty — cloop telemetry sync ${id} [transcript.jsonl]`);
    console.log(cli.stdout.trim());
    const assurance = state.land?.assurance?.status || "legacy-unknown";
    console.log(`LANDED ${id}\n  assurance: ${assurance}\n  lifecycle: archived`);
  }

  function archive(id) {
    const initial = loadRuntime(id);
    if (initial.status === "archived") {
      resumeArchivedChange(id, initial);
      return;
    }
    if (specSyncPending(id, initial)) {
      completeSpecSync(id, initial);
      return;
    }
    assertLandGrant(id);
    const recoveredArchive = !existsSync(changePath(id)) &&
      archivedChangeRelativePath(id);
    if (recoveredArchive) {
      recoverInterruptedArchive(id, initial, recoveredArchive);
      return;
    }
    // Drain before the first readiness report so archive cannot print
    // `telemetry: not-ingested` and then ingest the missing rows moments later.
    // Telemetry stays advisory: an absent or unreadable transcript never gates
    // Land.
    archiveCheckpoint("before-telemetry-drain", initial);
    bestEffort(() => syncClaudeTelemetry(id, { quiet: true })); // warned below
    archiveCheckpoint("after-telemetry-drain", initial);
    // Explicit Land authority may recover an interrupted mechanical apply.
    // Prepared/applying journals are rolled back safely; only a divergent
    // manual-recovery journal becomes a user work decision.
    recoverPendingApply(id, initial);
    let readiness = measure("land.check", () => landCheck(id, { preflight: "apply" }));
    if (readiness.archived) return;
    assertVerificationRecordUnclaimed(id, readiness.state || initial);
    // Land never archives unproven work. landCheck already refuses it; this
    // repeats the gate at the last point before any target mutation.
    if (readiness.assurance?.status !== "passed")
      fail(`Land requires current passing proof for '${id}' (assurance: ${
        readiness.assurance?.status || "unknown"})\n  next: cloop advance ${id} --through archived`);
    archiveCheckpoint("before-evidence-snapshot", readiness.state);
    snapshotArchiveEvidence(id, readiness);
    archiveCheckpoint("after-evidence-snapshot", readiness.state);
    // Unconditional, including when the sandbox is already applied: work done
    // after the first projection is proven and would otherwise archive as a
    // success while the target still holds the earlier code. applySandbox
    // returns early by itself when the projection is already current.
    archiveCheckpoint("before-code-apply", readiness.state);
    readiness = applyArchiveWorkspace(id, readiness);
    assertMultiRepositoryArchiveReady(id, readiness.state);
    archiveCheckpoint("after-code-apply", readiness.state);
    // Re-read rather than reuse readiness.state: on the no-sandbox path that
    // object predates the journal write above, and saving it below would
    // silently erase land.proofRunId from the record.
    const state = loadRuntime(id);
    const telemetry = recordArchiveTelemetry(id, state);
    const cli = measure("land.archive", () => runOpenSpecArchive(id, state, readiness));
    measure("land.cleanup", () => finalizeArchivedChange(id, state, telemetry, cli));
  }

  return {
    gitApplyInputs,
    recordTargetRestore,
    buildApplyEntries,
    prepareApplyTransaction,
    refreshAppliedProjection,
    applySandbox,
    archiveRecoveryReady,
    recoverArchive,
    archive,
    landPreflight
  };
}
