import {
  assertSpecApproval, agreementIdentity, amendedAgreementMatches, approvalMatches,
  userDecisionError
} from "../../core/user-decisions.mjs";
import {
  cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";
import { transitionLifecycleState } from "../../core/lifecycle-reducer.mjs";
import {
  landedTargetPaths, otherLandedOutput, replayLandedEdit, resolutionKeepsLanded,
  targetUncommittedPaths, uncommittedCarryPlan
} from "../transaction/target-edits.mjs";
import { captureCopyBase, copyBaseBytes, copyEditCarried, fileSource } from "../transaction/copy-base.mjs";
import { repositoryDeliveryTransactions } from "../delivery/repository-delivery-saga.mjs";
import { recordIdentityBridge } from "./sandbox-diff-identity.mjs";
import { VERBATIM_COPY } from "./sandbox-copy.mjs";
import { recordSandboxBaseMove, reportSandboxSync } from "./sandbox-repositories.mjs";
import { unusedCopyResolveMessage } from "./sandbox-inspection.mjs";

export function createSandboxSync(ctx) {
  const {
    changeDiffIdentity, changePath, clearSnapshotCache, contractFingerprint,
    directoryHash, executionFingerprint, fail, fileDigest, gitBuffer, loadRuntime,
    mergeTaskProgress, now, packetManifest, projectRepositories, proofAdvancePath,
    proofPath, rebaseWorktree, recoverReplay, relevantHash, replayCandidates,
    repositorySelectionIdsAt, root, saveRuntime, validate, workspaceManifest
  } = ctx;

  function activeSandboxWorkspace(id, state) {
    const workspace = state.workspace;
    if (!workspace || !["worktree", "copy"].includes(workspace.mode) ||
        !workspace.path || !existsSync(workspace.path))
      fail(`change '${id}' has no active sandbox`);
    return workspace;
  }

  function assertSandboxPacketPreserved(id, workspace, source, destination) {
    // The packet's source of truth is the target copy; the sandbox copy is a
    // projection this sync overwrites. `tasks.md` is exempt because its ticks
    // merge back below. Anything else edited only in the sandbox would vanish
    // here without a trace, so refuse while the edit is still recoverable.
    if (workspace.packetSnapshot && existsSync(destination)) {
      const snapshot = workspace.packetSnapshot;
      const current = packetManifest(destination);
      const sourcePacket = packetManifest(source);
      const lost = [...new Set([...Object.keys(snapshot), ...Object.keys(current)])]
        .filter((rel) => rel !== "tasks.md")
        .filter((rel) => (current[rel] ?? null) !== (snapshot[rel] ?? null))
        .filter((rel) => (current[rel] ?? null) !== (sourcePacket[rel] ?? null))
        .sort();
      if (lost.length)
        fail(`sandbox packet edits would be lost at ${
          lost.map((rel) => `'openspec/changes/${id}/${rel}'`).join(", ")
        }; the packet's source of truth is 'openspec/changes/${id}/' in the target - port the edit there (or remove it from the sandbox copy), then sync again`);
    }
  }

  function assertSandboxRepositoryScope(source, destination) {
    const priorRepositories = repositorySelectionIdsAt(destination);
    const nextRepositories = repositorySelectionIdsAt(source);
    if (JSON.stringify(priorRepositories) !== JSON.stringify(nextRepositories))
      fail("repository scope changed during Build; finish or split the current repository work before creating a topology revision");
  }

  function sandboxSyncInputs(id, source, destination) {
    const sourceTasks = readFileSync(join(source, "tasks.md"), "utf8");
    const sandboxTasks = existsSync(join(destination, "tasks.md"))
      ? readFileSync(join(destination, "tasks.md"), "utf8") : "";
    const priorContract = existsSync(destination) ? contractFingerprint(id, destination) : null;
    const priorExecution = existsSync(destination) ? executionFingerprint(id, destination) : null;
    const nextContract = contractFingerprint(id, source);
    const nextExecution = executionFingerprint(id, source);
    const mergedTasks = mergeTaskProgress(sourceTasks, sandboxTasks);
    return {
      priorContract, priorExecution, nextContract, nextExecution, mergedTasks
    };
  }

  function replaceSandboxPacket(id, state, source, destination, mergedTasks) {
    if (existsSync(destination)) rmSync(destination, { recursive: true });
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(source, destination, { recursive: true, ...VERBATIM_COPY });
    writeFileSync(join(destination, "tasks.md"), mergedTasks);
    state.workspace.packetSnapshot = packetManifest(destination);
  }

  function advanceCopyBaseline(baseline, rel, target) {
    if (target === null) delete baseline[rel];
    else baseline[rel] = target;
  }

  function forwardCopyWorkspacePath(workspace, rel, target) {
    const destination = join(workspace.path, rel);
    rmSync(destination, { force: true });
    if (target === null) return;
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(root, rel), destination, VERBATIM_COPY);
  }

  function untouchedIsolationCopy(workspace, rel) {
    const recorded = workspace.targetDirty?.[rel];
    if (!recorded) return false;
    try { return fileDigest(join(workspace.path, rel)) === recorded; } catch { return false; }
  }

  function reconcileCopyWorkspacePath({
    rel, baseline, targetManifest, sandboxManifest, resolves, usedResolves, workspace
  }) {
    const base = baseline[rel] ?? null;
    const target = targetManifest[rel] ?? null;
    const sandboxEntry = sandboxManifest[rel] ?? null;
    // The first divergence while a side still holds the baseline bytes is the
    // last chance to keep them; without them no later merge can be proven.
    if (target !== base || sandboxEntry !== base)
      captureCopyBase({ root, baseline, path: rel, sources: [
        fileSource(join(root, rel)), fileSource(join(workspace.path, rel))] });
    if (target === base) return "unchanged";
    if (sandboxEntry === target) {
      advanceCopyBaseline(baseline, rel, target);
      return "settled";
    }
    // A path the baseline never saw (untracked at isolation, tracked since)
    // whose copy still holds its isolation bytes was never touched here.
    if (sandboxEntry === base || (base === null && untouchedIsolationCopy(workspace, rel))) {
      forwardCopyWorkspacePath(workspace, rel, target);
      advanceCopyBaseline(baseline, rel, target);
      return "forwarded";
    }
    if (resolves.has(rel)) {
      usedResolves.add(rel);
      advanceCopyBaseline(baseline, rel, target);
      return "settled";
    }
    // A plain sync is how `advance` resumes a conflict: the agent's merge
    // settles it only when a 3-way check against the captured base proves the
    // target's edit is in the sandbox copy. A changed copy proves nothing.
    if (copyEditCarried({ root, sandboxPath: workspace.path, path: rel, baseline })) {
      advanceCopyBaseline(baseline, rel, target);
      return "settled";
    }
    return "conflict";
  }

  function reconcileCopyWorkspace(id, state, flags) {
    const workspace = state.workspace;
    if (workspace.mode !== "copy" || workspace.applied)
      return { forwarded: 0, conflicts: [] };
    const resolves = new Set(String(flags.resolve || "")
      .split(",").map((entry) => entry.trim()).filter(Boolean));
    const usedResolves = new Set();
    const baseline = { ...(workspace.baseline || {}) };
    const targetManifest = workspaceManifest(root, id, true);
    const sandboxManifest = workspaceManifest(workspace.path, id, true);
    const paths = [...new Set([
      ...Object.keys(baseline), ...Object.keys(targetManifest),
      ...Object.keys(sandboxManifest)
    ])].sort();
    let forwarded = 0;
    const conflicts = [];
    for (const rel of paths) {
      const outcome = reconcileCopyWorkspacePath({
        rel, baseline, targetManifest, sandboxManifest, resolves, usedResolves, workspace
      });
      if (outcome === "forwarded") forwarded += 1;
      else if (outcome === "conflict") conflicts.push(rel);
    }
    const unusedResolves = [...resolves].filter((rel) => !usedResolves.has(rel));
    if (unusedResolves.length) fail(unusedCopyResolveMessage(unusedResolves));
    workspace.baseline = baseline;
    return { forwarded, conflicts };
  }

  // Land leaves each projection uncommitted, so a worktree that branched
  // before another change landed meets that landed diff in the target without
  // HEAD moving. For every path this sandbox also changed while the target
  // still holds the landed bytes, the landed edit is replayed into the sandbox
  // copy (3-way against the recorded base). A clean merge invalidates proof
  // like any sync; a conflict goes to the agent. The target is never written,
  // and paths this change left alone land beside it untouched.
  // A worktree starts from HEAD, so another change's landed but uncommitted
  // files were missing from it and Build and Prove ran without them. Carry
  // every such file the sandbox has not changed, at create and after each
  // sync. Only bytes a Land journal still vouches for are carried: a target
  // file the user edited afterwards stays out, as any other user edit does.
  function carryLandedOutput(id, state) {
    const workspace = state.workspace;
    if (workspace?.mode !== "worktree" || workspace.applied) return [];
    const landed = otherLandedOutput({
      transactions: join(root, ".foundation", "transactions"), changeId: id,
      readJson: (path, fallback) => {
        try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fallback; }
      }
    });
    const identity = (path) =>
      lstatSync(path, { throwIfNoEntry: false })?.isFile() ? fileDigest(path) : null;
    const landedBy = landedTargetPaths({ root, paths: Object.keys(landed), landed, identity });
    const base = workspace.baseHead || "HEAD";
    const prior = workspace.landedCarried || {};
    const carried = {};
    // Where the sandbox copy started from landed bytes (`landedCarriedFrom`),
    // kept while the target still holds them, across this change's own later
    // edits: the landed replay must not merge that landed edit in twice.
    const priorFrom = workspace.landedCarriedFrom || {};
    const carriedFrom = {};
    const added = [];
    for (const path of Object.keys(landedBy).sort()) {
      if ([".foundation/", "openspec/changes/"].some((prefix) => path.startsWith(prefix))) continue;
      const sandboxFile = join(workspace.path, path);
      const current = identity(sandboxFile);
      const digest = landed[path].after;
      const target = identity(join(root, path));
      const from = priorFrom[path]?.target === target ? priorFrom[path] : null;
      if (current === digest) {
        if (prior[path]) carried[path] = prior[path];
        carriedFrom[path] = from || { changeId: landedBy[path], target };
        continue;
      }
      if (from) carriedFrom[path] = from;
      // Never overwrite this change's own edit; a path both changed is the
      // landed replay's 3-way merge, not a carry.
      const shown = gitBuffer(["show", `${base}:${path}`], root);
      const untouched = shown.status === 0
        ? current !== null && shown.stdout.equals(readFileSync(sandboxFile))
        : !lstatSync(sandboxFile, { throwIfNoEntry: false });
      if (!untouched && prior[path]?.digest !== current) continue;
      mkdirSync(dirname(sandboxFile), { recursive: true });
      cpSync(join(root, path), sandboxFile, VERBATIM_COPY);
      carried[path] = { changeId: landedBy[path], digest: identity(sandboxFile) };
      carriedFrom[path] = { changeId: landedBy[path], target };
      added.push({ path, landedBy: landedBy[path] });
    }
    if (Object.keys(carriedFrom).length) workspace.landedCarriedFrom = carriedFrom;
    else delete workspace.landedCarriedFrom;
    // Recorded beside the copy-time carry-ins, so the change surface, task
    // paths, and review packet skip them while their bytes are unchanged.
    const digests = Object.fromEntries(Object.entries(carried).map(([path, row]) => [path, row.digest]));
    const preexisting = { ...(workspace.sandboxPreexisting || {}) };
    for (const path of Object.keys(prior)) if (!carried[path]) delete preexisting[path];
    if (Object.keys(carried).length) {
      workspace.landedCarried = carried;
      workspace.sandboxPreexisting = { ...preexisting, ...digests };
    } else {
      delete workspace.landedCarried;
      if (Object.keys(preexisting).length) workspace.sandboxPreexisting = preexisting;
      else delete workspace.sandboxPreexisting;
    }
    return added;
  }

  // Several sessions work in one target; whoever lands keeps the others'
  // uncommitted work, so its proof must run on the target Land will leave.
  // Every uncommitted target file the change has not edited is copied into the
  // sandbox and recorded (`targetUncommitted`): like landed bytes, it is not
  // this change's contribution while its bytes are unchanged. A path the
  // change edited keeps the merge route; a file no longer uncommitted in the
  // target is put back to the target's bytes. Deletions are not carried.
  function carryTargetUncommitted(id, state) {
    const workspace = state.workspace;
    if (workspace?.mode !== "worktree" || workspace.applied || !workspace.path) return [];
    const dirty = targetUncommittedPaths(gitBuffer, root);
    if (!dirty) return [];
    const kind = (path) => {
      const stats = lstatSync(path, { throwIfNoEntry: false });
      return !stats ? "missing" : stats.isFile() ? "file" : "other";
    };
    const base = workspace.baseHead || "HEAD";
    const prior = workspace.targetUncommitted || {};
    const plan = uncommittedCarryPlan({
      root, sandboxPath: workspace.path, dirty, prior,
      landed: { ...(workspace.landedCarried || {}), ...(workspace.landedCarriedFrom || {}) },
      kind, identity: fileDigest, bytes: (path) => readFileSync(path),
      baseBytes: (path) => {
        const shown = gitBuffer(["show", `${base}:${path}`], root);
        return shown.status === 0 ? shown.stdout : null;
      }
    });
    const carried = { ...plan.kept };
    for (const path of plan.carry) {
      const sandboxFile = join(workspace.path, path);
      mkdirSync(dirname(sandboxFile), { recursive: true });
      cpSync(join(root, path), sandboxFile, VERBATIM_COPY);
      carried[path] = { digest: fileDigest(sandboxFile) };
    }
    // No longer uncommitted: the sandbox takes the target's bytes again.
    for (const path of plan.restore) {
      const sandboxFile = join(workspace.path, path);
      if (kind(join(root, path)) === "missing") rmSync(sandboxFile, { force: true });
      else cpSync(join(root, path), sandboxFile, VERBATIM_COPY);
    }
    const added = [...plan.carry, ...plan.restore];
    const preexisting = { ...(workspace.sandboxPreexisting || {}) };
    for (const path of Object.keys(prior)) if (!carried[path]) delete preexisting[path];
    for (const [path, row] of Object.entries(carried)) preexisting[path] = row.digest;
    if (Object.keys(carried).length) workspace.targetUncommitted = carried;
    else delete workspace.targetUncommitted;
    if (Object.keys(preexisting).length) workspace.sandboxPreexisting = preexisting;
    else delete workspace.sandboxPreexisting;
    const dropped = Object.keys(prior).filter((path) => !carried[path]);
    return [...new Set([...added, ...dropped])].sort();
  }

  function landedCarryLine(added) {
    return added.length ? `\n  carried landed work: ${added.map((row) =>
      `${row.path} (${row.landedBy})`).join(", ")}` : "";
  }

  // The root sandbox's replay of earlier changes' landed, uncommitted work.
  function replayLandedChanges(id, state) {
    const workspace = state.workspace;
    if (workspace.mode !== "worktree" || workspace.applied) return { merged: [], conflicts: [] };
    return replayLandedWithin({
      id, targetRoot: root, transactions: join(root, ".foundation", "transactions"),
      bag: workspace, repository: "root"
    });
  }

  // The same replay for every writable repository sandbox of a multi-repository
  // change, against that repository's own target and Land journals. A
  // repository whose delivery already started is no longer replayed.
  function replayRepositoryLandedChanges(id, state) {
    const result = { merged: [], conflicts: [] };
    for (const [repositoryId, record] of Object.entries(state.repositories || {})) {
      if (repositoryId === "root" || record?.access !== "write" || record.mode !== "worktree" ||
          record.delivery || !record.path || !record.targetPath || !record.baseHead) continue;
      const replayed = replayLandedWithin({
        id, targetRoot: record.targetPath, repository: repositoryId, bag: record,
        transactions: repositoryDeliveryTransactions(
          join(root, ".foundation", "transactions"), repositoryId)
      });
      result.merged.push(...replayed.merged);
      result.conflicts.push(...replayed.conflicts);
    }
    return result;
  }

  // `bag` is the runtime record that owns the sandbox (`path`, `baseHead`) and
  // the replay bookkeeping (`landedReplay`, `landedConflicts`, `landedResolved`):
  // the root workspace, or one repository's record.
  function replayLandedWithin({ id, targetRoot, transactions, bag, repository }) {
    const workspace = bag;
    const root = targetRoot;
    const result = { merged: [], conflicts: [] };
    const landed = otherLandedOutput({
      transactions, changeId: id,
      readJson: (path, fallback) => {
        try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fallback; }
      }
    });
    const identity = (path) =>
      lstatSync(path, { throwIfNoEntry: false })?.isFile() ? fileDigest(path) : null;
    const landedBy = landedTargetPaths({ root, paths: Object.keys(landed), landed, identity });
    const base = workspace.baseHead || "HEAD";
    const priorConflicts = workspace.landedConflicts || {};
    const priorResolved = workspace.landedResolved || {};
    const pending = {};
    const resolved = {};
    for (const path of Object.keys(landedBy).sort()) {
      const shown = gitBuffer(["show", `${base}:${path}`], root);
      const baseBytes = shown.status === 0 ? shown.stdout : null;
      const sandboxFile = join(workspace.path, path);
      const sandboxBytes = identity(sandboxFile) === null ? null : readFileSync(sandboxFile);
      const untouched = baseBytes && sandboxBytes ? baseBytes.equals(sandboxBytes)
        : !baseBytes && !lstatSync(sandboxFile, { throwIfNoEntry: false });
      if (untouched) continue;
      // The sandbox copy started from exactly these landed bytes, so every
      // difference from them is this change's own edit: replaying the landed
      // edit again would conflict with its own lines. Recorded as resolved,
      // bound to the current bytes, so Land accepts it like an answered merge.
      const carriedFrom = workspace.landedCarriedFrom?.[path];
      const targetIdentity = identity(join(root, path));
      if (carriedFrom && carriedFrom.target === targetIdentity) {
        const sandboxIdentity = identity(sandboxFile);
        if (sandboxIdentity !== targetIdentity)
          resolved[path] = { target: targetIdentity, sandbox: sandboxIdentity,
            landedBy: landedBy[path] };
        continue;
      }
      const replay = replayLandedEdit({ root, sandboxPath: workspace.path, path, baseBytes });
      if (replay.status === "merged") {
        writeFileSync(sandboxFile, replay.bytes);
        result.merged.push({ repository, path, landedBy: landedBy[path] });
      } else if (replay.status === "conflict") {
        // Both changes rewrote the same lines. The agent's edit of the sandbox
        // copy after the conflict was reported is its merge of the two; it is
        // bound to the exact target and sandbox bytes it was made against.
        const row = { target: identity(join(root, path)), sandbox: identity(sandboxFile),
          landedBy: landedBy[path] };
        // An edit that dropped other landed content is not a merge: Land would
        // overwrite that content, so the conflict stays open for the agent.
        const answered = priorConflicts[path]?.target === row.target &&
          priorConflicts[path].sandbox !== row.sandbox &&
          resolutionKeepsLanded({ root, sandboxPath: workspace.path, path, baseBytes });
        const kept = priorResolved[path]?.target === row.target &&
          priorResolved[path].sandbox === row.sandbox;
        if (answered || kept) resolved[path] = row;
        else {
          pending[path] = row;
          result.conflicts.push({ repository, path, landedBy: landedBy[path] });
        }
      }
    }
    // What the replay wrote, so Land can tell a replay that already ran and
    // still does not carry the landed bytes from one that has not run yet.
    const record = (field, value) => {
      if (Object.keys(value).length) workspace[field] = value;
      else delete workspace[field];
    };
    record("landedReplay", Object.fromEntries(result.merged.map(({ path }) =>
      [path, identity(join(workspace.path, path))])));
    record("landedConflicts", pending);
    record("landedResolved", resolved);
    // Every landed path this replay looked at, with the exact target and
    // sandbox bytes it left behind. Repository Land hands a refusal back to this
    // sync: once it has run against these bytes, running it again changes
    // nothing, so Land reports the refusal instead of looping. The review diff
    // reads the same record to compare a file merged with landed work against
    // the landed bytes rather than the base.
    record("landedSynced", Object.fromEntries(
      Object.keys(landedBy).sort().map((path) => [path, {
        target: identity(join(root, path)), sandbox: identity(join(workspace.path, path))
      }])));
    return result;
  }

  // Land recorded the user's uncommitted target edits that touch other lines
  // than this change (`targetCarry`: path -> target bytes). Each one still at
  // those exact bytes is merged 3-way into the sandbox copy; a later edit is
  // left for Land to examine again. The target is never written here, and a
  // merge that no longer applies cleanly is left to Land's conflict decision.
  // Over an applied projection Land records only paths that apply never wrote,
  // so the base-to-target merge is the user's edit there too.
  function carryTargetEdits(state) {
    const workspace = state.workspace;
    const carry = workspace.targetCarry;
    const merged = [];
    if (!carry || !["worktree", "copy"].includes(workspace.mode)) {
      delete workspace.targetCarry;
      return merged;
    }
    const identity = (path) =>
      lstatSync(path, { throwIfNoEntry: false })?.isFile() ? fileDigest(path) : null;
    const base = workspace.baseHead || "HEAD";
    // A copy merges against its captured base bytes; none means no merge.
    const baseBytes = (path) => {
      if (workspace.mode === "copy")
        return copyBaseBytes({ root, baseline: workspace.baseline, path });
      const shown = gitBuffer(["show", `${base}:${path}`], root);
      return shown.status === 0 ? shown.stdout : null;
    };
    const recorded = {};
    for (const path of Object.keys(carry).sort()) {
      if (identity(join(root, path)) !== carry[path]) continue;
      const replay = replayLandedEdit({ root, sandboxPath: workspace.path, path,
        baseBytes: baseBytes(path) });
      if (replay.status !== "merged") continue;
      writeFileSync(join(workspace.path, path), replay.bytes);
      recorded[path] = { target: carry[path], sandbox: identity(join(workspace.path, path)) };
      merged.push(path);
    }
    delete workspace.targetCarry;
    if (merged.length) workspace.targetCarried = { ...(workspace.targetCarried || {}), ...recorded };
    return merged;
  }

  // A repository's path is prefixed with its id; the root's path stands alone.
  const replayedPath = (row) =>
    row.repository && row.repository !== "root" ? `${row.repository}:${row.path}` : row.path;

  function reportLandedReplay({ merged, conflicts }, log = console.log) {
    for (const row of merged)
      log(`REPLAYED ${replayedPath(row)}: merged the landed, uncommitted work of ${row.landedBy} into the ` +
        "sandbox copy; evidence covering it runs again before Land.");
    for (const row of conflicts)
      log(`CONFLICT ${replayedPath(row)}: this change and the landed, uncommitted work of ${row.landedBy} ` +
        "both changed the same lines. Edit the sandbox copy into the merge of both, keeping all the " +
        "landed content (also its other edits in this file), then resume; a merge that drops landed " +
        "content is not taken. Ask the user only if the " +
        "two changes' intents contradict.");
  }

  function updateSandboxSyncState(id, state, source, fingerprints, invalidated,
    sourceHash = directoryHash(source)) {
    const approvedSource = state.specApproval?.identity &&
      state.specApproval.revision === Number(state.contractRevision || 0) &&
      approvalMatches(state.specApproval.identity, root, id);
    state.workspace.changeSourceHash = sourceHash;
    delete state.workspace.recovery;
    if (invalidated)
      transitionLifecycleState(state, "building", "sandbox-contract-synchronized");
    state.revision = Number(state.revision || 0) + 1;
    if (fingerprints.priorContract !== fingerprints.nextContract)
      state.contractRevision = Number(state.contractRevision || 0) + 1;
    if (fingerprints.priorExecution !== fingerprints.nextExecution)
      state.executionRevision = Number(state.executionRevision || 0) + 1;
    // Sync projects the already-approved bytes; its bookkeeping revision is
    // not another product decision. Content changes still require approval.
    if (approvedSource) state.specApproval.revision = Number(state.contractRevision || 0);
    if (invalidated) {
      if (existsSync(proofPath(id))) rmSync(proofPath(id));
      // The proof-advance checkpoint describes the pre-sync workspace; left in
      // place it would read as current proof while the lifecycle is building.
      const checkpoint = proofAdvancePath(id);
      if (checkpoint && existsSync(checkpoint)) rmSync(checkpoint);
    }
  }

  function activeSandboxAmendment(id, state) {
    const destination = state.workspace?.path &&
      join(state.workspace.path, "openspec", "changes", id);
    return Boolean(destination && existsSync(destination)) &&
      amendedAgreementMatches(state, state.workspace.path, id) &&
      agreementIdentity(state.workspace.path, id) !== agreementIdentity(root, id);
  }

  function assertAmendedSource(id, state, resolves = new Set()) {
    const sourceHash = directoryHash(changePath(id));
    if (state.workspace.changeSourceHash === sourceHash) return sourceHash;
    const packet = `openspec/changes/${id}`;
    if (resolves.has(packet)) {
      // Like copy-path --resolve, this is an explicit declaration that the
      // sandbox contains the intended merged result, never automatic recovery.
      assertSpecApproval(root, id, state);
      return sourceHash;
    }
    const error = userDecisionError("AMENDED_AGREEMENT_CONFLICT",
      `The target agreement for '${id}' changed after isolation; sandbox sync would overwrite the active amended agreement. ` +
      "Compare both packets and resolve the intended agreement before continuing.", [
        { id: "merge", outcome: "Merge the intended target changes into the isolated agreement, approve it, then synchronize.",
          command: `cloop sandbox sync ${id} --resolve ${packet}` },
        { id: "retain", outcome: "Explicitly keep the approved isolated agreement instead of the competing target edits, then synchronize.",
          command: `cloop sandbox sync ${id} --resolve ${packet}` },
        { id: "pause", outcome: "Preserve both packets and pause until their intended content is decided." }
      ], "merge");
    error.decision.paths = [changePath(id), join(state.workspace.path, packet)];
    throw error;
  }

  function sync(id, flags = {}) {
    const state = loadRuntime(id);
    recoverReplay(id, state);
    const workspace = activeSandboxWorkspace(id, state);
    const source = changePath(id);
    const destination = join(workspace.path, "openspec", "changes", id);
    const preserveAmendment = activeSandboxAmendment(id, state);
    const resolves = new Set(String(flags.resolve || "").split(",")
      .map((entry) => entry.trim()).filter(Boolean));
    const acceptedSourceHash = preserveAmendment ? assertAmendedSource(id, state, resolves) : null;
    validate(id, preserveAmendment ? "active" : "root", { quiet: true });
    if (!preserveAmendment) {
      assertSandboxPacketPreserved(id, workspace, source, destination);
      assertSandboxRepositoryScope(source, destination);
    }
    const fingerprints = sandboxSyncInputs(id, preserveAmendment ? destination : source, destination);
    clearSnapshotCache(id);
    // Without an aggregate proof there is nothing to preserve. Avoid two
    // extra full snapshots on the common pre-proof sync path.
    const priorHash = existsSync(proofPath(id)) ? relevantHash(id) : null;
    // Before the packet is written, because a successful replay rebuilds the
    // worktree the packet is written into. Everything above reads the outgoing
    // sandbox and has already been captured.
    //
    // The pre-replay diff identity is captured here for the same reason:
    // whether the sync itself altered the change's diff is what base-move
    // review accounting asks, and it is only observable across this boundary.
    const capturesBaseMove = !workspace.applied && replayCandidates(state)
      .some(({ record }) => record?.mode === "worktree");
    // Also the `from` end of an identity bridge. A copy-only sync captures
    // nothing here: no replay can rewrite its diff, and a third manifest walk
    // would be pure cost.
    const preDiffIdentity = capturesBaseMove ? changeDiffIdentity(id, state) : null;
    const movement = workspace.applied ? null : rebaseWorktree(id, state, preserveAmendment);
    if (!preserveAmendment)
      replaceSandboxPacket(id, state, source, destination, fingerprints.mergedTasks);
    // An isolated copy is a snapshot; the target keeps moving while it builds
    // (another change lands, a hook rewrites a file). Every target move the
    // sandbox did not also touch fast-forwards here, baseline included, so
    // only genuinely double-edited paths reach the apply guard - and those are
    // named now, at sync, not discovered at Land. `--resolve` is the explicit
    // way out: it declares the sandbox copy already carries the merged result,
    // so the baseline may advance without the harness guessing.
    if (preserveAmendment) resolves.delete(`openspec/changes/${id}`);
    const { forwarded, conflicts } = reconcileCopyWorkspace(id, state,
      { ...flags, resolve: [...resolves].join(",") });
    const landedReplay = movement?.conflicts?.length
      ? { merged: [], conflicts: [] } : (() => {
        const rootReplay = replayLandedChanges(id, state);
        const repositoryReplay = replayRepositoryLandedChanges(id, state);
        return {
          merged: [...rootReplay.merged, ...repositoryReplay.merged],
          conflicts: [...rootReplay.conflicts, ...repositoryReplay.conflicts]
        };
      })();
    const targetCarried = movement?.conflicts?.length ? [] : carryTargetEdits(state);
    const landedCarried = movement?.conflicts?.length ? [] : carryLandedOutput(id, state);
    const uncommittedCarried = movement?.conflicts?.length ? [] : carryTargetUncommitted(id, state);
    clearSnapshotCache(id);
    const invalidated = !priorHash || priorHash !== relevantHash(id) ||
      fingerprints.priorContract !== fingerprints.nextContract ||
      fingerprints.priorExecution !== fingerprints.nextExecution ||
      conflicts.length > 0 || (movement && !movement.rebased) ||
      Boolean(movement?.conflicts?.length) ||
      landedReplay.merged.length > 0 || landedReplay.conflicts.length > 0 ||
      targetCarried.length > 0 || landedCarried.length > 0 || uncommittedCarried.length > 0;
    if (preserveAmendment && directoryHash(source) !== acceptedSourceHash)
      fail(`target agreement changed during sandbox sync for '${id}'; both packets are preserved, retry sync to resolve the current target`);
    updateSandboxSyncState(id, state, source, fingerprints, invalidated,
      preserveAmendment ? acceptedSourceHash : undefined);
    // The durable record of what this replay did to the change's own diff.
    // Identical identities mean the moved base never touched the change's
    // content — the fact that lets a review verdict rebind instead of
    // expiring. Differing identities mean the 3-way merge altered the diff,
    // and base-move review accounting reads this journal to tell that apart
    // from an author edit. Keyed by destination heads so one movement can
    // authorize at most one accounting reset.
    recordSandboxBaseMove({
      id, state, movement, preDiffIdentity, now, changeDiffIdentity
    });
    // Only the harness's own clean replays of uncommitted work bridge
    // identities. A moved base keeps its own contract (`lastBaseMove`): its
    // replay may reshape the change's hunks, so a verdict expires and the
    // attempt is released instead. A conflict leaves the agent's merge to the
    // next review.
    const harnessRewrites = [
      ...(landedReplay.merged.length ? ["landed-replay"] : []),
      ...(targetCarried.length ? ["target-carry"] : []),
      ...(landedCarried.length ? ["landed-carry"] : []),
      ...(uncommittedCarried.length ? ["uncommitted-carry"] : [])
    ];
    const cleanRewrite = harnessRewrites.length && !movement?.rebased && !conflicts.length &&
      !movement?.conflicts?.length && !landedReplay.conflicts.length;
    if (cleanRewrite && preDiffIdentity)
      recordIdentityBridge({ state, preDiffIdentity, kinds: harnessRewrites, now,
        postDiffIdentity: changeDiffIdentity(id, state) });
    clearSnapshotCache(id);
    saveRuntime(state);
    // A replay rebuilds the root worktree, and a moved gitlink names a new
    // commit for an unselected repository.
    projectRepositories(id, state);
    // Stated whether or not it could be resolved. A target that moved and a
    // sandbox that silently kept building against the old base is the failure
    // this line exists to make impossible.
    reportSandboxSync({
      id, state, movement, forwarded, conflicts, relevantHash
    });
    reportLandedReplay(landedReplay);
    for (const path of targetCarried)
      console.log(`CARRIED ${path}: merged the target checkout's uncommitted edit into the ` +
        "sandbox copy; the target edit is kept and evidence covering it runs again before Land.");
    for (const row of landedCarried)
      console.log(`CARRIED LANDED ${row.path}: copied ${row.landedBy}'s landed, uncommitted ` +
        "bytes into the sandbox; they are not this change's contribution.");
    for (const path of uncommittedCarried)
      console.log(`CARRIED UNCOMMITTED ${path}: the sandbox now matches the target checkout's ` +
        "uncommitted bytes, so proof sees what Land leaves; they are not this change's contribution.");
    return {
      status: conflicts.length || movement?.conflicts?.length || landedReplay.conflicts.length
        ? "CONFLICT" : "SYNCED",
      conflicts: [...conflicts, ...(movement?.conflicts || []), ...landedReplay.conflicts],
      movement,
      ...(landedReplay.merged.length ? { landedReplayed: landedReplay.merged } : {}),
      ...(targetCarried.length ? { targetCarried } : {}),
      ...(landedCarried.length ? { landedCarried } : {}),
      ...(uncommittedCarried.length ? { uncommittedCarried } : {})
    };
  }

  return {
    activeSandboxAmendment, assertAmendedSource, carryLandedOutput, landedCarryLine,
    sync
  };
}
