import { existsSync } from "node:fs";
import { join } from "node:path";
import { validityRecovery } from "../evidence/receipt-validity.mjs";
import { advisoryVisualLine, visualWaiverSummary } from "../evidence/visual-review.mjs";

// Advisory results the Land report names, labelled as not passing evidence.
export function landAdvisoryLines(state) {
  const rows = state?.advisoryEvidence?.rows;
  return Array.isArray(rows) ? rows.map(advisoryVisualLine) : [];
}
import { MANUAL_APPLY_STATUS, targetHeadMovedDecision } from "./apply-recovery.mjs";
import {
  compileLandPreparation, landPreparationMatches
} from "../core/graph-execution.mjs";
import {
  outOfBandDeliveryDriftValue, riskRequiresCi
} from "../core/authority-policy.mjs";
import { normalizeLifecycleStatus, transitionLifecycleState } from "../core/lifecycle-reducer.mjs";
import * as stateRuntime from "../core/state-runtime.mjs";
import { compositeRepositorySelection } from "../core/repository-binding.mjs";
import { probeOpenSpecVersion } from "../core/tool-identity.mjs";

export { riskRequiresCi } from "../core/authority-policy.mjs";

export function recordedDeliveryReferences(state) {
  const explicit = Array.isArray(state?.deliveryReferences)
    ? state.deliveryReferences : [];
  const repository = Object.entries(state?.repositories || {}).flatMap(
    ([repositoryId, runtime]) => runtime?.land?.commit &&
      runtime.land.authority?.kind !== "host-user-decision"
      ? [{ repositoryId, commit: runtime.land.commit }] : []);
  return [...explicit, ...repository];
}

export function targetProjectionObservationValue({
  root, state, git, fileDigest, pathExists = existsSync
}) {
  const workspace = state?.workspace;
  if (workspace?.mode !== "worktree" || !workspace.path || !workspace.baseHead)
    return { observed: false, paths: [], reason: "workspace-not-comparable" };
  const tracked = git(["diff", "--name-only", "-z", workspace.baseHead, "--"], workspace.path);
  const untracked = git([
    "ls-files", "--others", "--exclude-standard", "-z", "--"
  ], workspace.path);
  if (tracked.status !== 0 || untracked.status !== 0)
    return { observed: false, paths: [], reason: "workspace-diff-unavailable" };
  const paths = [...new Set(`${tracked.stdout || ""}\0${untracked.stdout || ""}`
    .split("\0").filter(Boolean))].sort();
  if (!paths.length)
    return { observed: false, paths: [], reason: "empty-change-projection" };
  const matching = paths.filter((path) => {
    const source = join(workspace.path, path);
    const target = join(root, path);
    const sourceExists = pathExists(source);
    const targetExists = pathExists(target);
    if (!sourceExists || !targetExists) return sourceExists === targetExists;
    try { return fileDigest(source) === fileDigest(target); }
    catch { return false; }
  });
  return {
    observed: matching.length === paths.length,
    paths: matching,
    expectedPathCount: paths.length,
    reason: matching.length === paths.length
      ? "target-matches-change-projection" : "target-does-not-match-change-projection"
  };
}

const OPENSPEC_REQUIRED_MAJOR = 1;
const OPENSPEC_TESTED_MINOR = 7;
const OPENSPEC_PACKAGE = "@fission-ai/openspec@^1.7";

export function landTransactionStarted(state) {
  if (state?.workspace?.applied === true) return true;
  if (state?.workspace?.apply?.transactionId) return true;
  if (Object.values(state?.repositories || {}).some((runtime) =>
    runtime?.delivery?.transactionId)) return true;
  return [
    "evidence-snapshotted", "code-applied", "archive-prepared",
    "specs-archived", "archive-audited", "sandbox-cleaned"
  ].includes(state?.land?.status);
}

export async function advanceLandOperation({
  loadRuntime, landCheck, archive, landPlanValue,
  selectedRepositories, prepareExecution = null
}, id) {
  const initial = loadRuntime(id);
  if (initial.status === "archived" || [
    "archive-prepared", "specs-archived", "archive-audited", "sandbox-cleaned"
  ].includes(initial.land?.status)) {
    const archived = await archive(id);
    return archived || { status: "ARCHIVED", archived: true };
  }
  const multiRepository = compositeRepositorySelection(selectedRepositories(id, initial));
  if (prepareExecution) await prepareExecution(id, { stage: "land" });
  const converge = async () => {
    try {
      return await archive(id);
    } catch (firstError) {
      // Once a journaled Land transaction has begun, its recovery mechanics
      // belong to the Harness. Re-enter the idempotent archive composition once
      // so pending Apply rollback or archive finalization can settle without
      // surfacing a low-level recovery command to the caller. A repeated error
      // remains a truthful boundary for the outer convergence policy.
      if (!landTransactionStarted(loadRuntime(id))) throw firstError;
      return archive(id);
    }
  };
  if (!multiRepository) {
    const archived = await converge();
    return archived || { status: "ARCHIVED", archived: true };
  }
  const plan = landPlanValue(id);
  const archived = await converge();
  return archived || { status: "ARCHIVED", archived: true, plan };
}

// Layered policy rather than a pinned string: a wrong major cannot sync specs,
// a lower minor predates behavior the archive step depends on, a higher minor
// is untested but not known-broken, and patch releases inside the tested minor
// are interchangeable.
export function openSpecVersionStatus(stdout) {
  const text = String(stdout ?? "").trim();
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(text);
  if (!match)
    return {
      level: "error", version: null,
      detail: `unrecognized OpenSpec version output '${text || "(empty)"}'; required ${OPENSPEC_PACKAGE}`
    };
  const [version, major, minor] = match;
  if (Number(major) !== OPENSPEC_REQUIRED_MAJOR)
    return {
      level: "error", version,
      detail: `OpenSpec ${version} is incompatible; required ${OPENSPEC_PACKAGE}`
    };
  if (Number(minor) < OPENSPEC_TESTED_MINOR)
    return {
      level: "error", version,
      detail: `OpenSpec ${version} predates the 1.${OPENSPEC_TESTED_MINOR} spec-sync behavior; required ${OPENSPEC_PACKAGE}`
    };
  if (Number(minor) > OPENSPEC_TESTED_MINOR)
    return {
      level: "warn", version,
      detail: `OpenSpec ${version} is newer than the tested 1.${OPENSPEC_TESTED_MINOR} line; archive behavior is unverified`
    };
  return { level: "ok", version, detail: version };
}

export function openSpecCliStatus(root) {
  // Reused per process while the resolved CLI is byte-identical.
  const probe = probeOpenSpecVersion({ cwd: root });
  if (probe.error?.code === "ENOENT")
    return {
      level: "error", version: null,
      detail: `OpenSpec CLI is required for safe spec sync and archive (${OPENSPEC_PACKAGE})`
    };
  if (probe.error || probe.status !== 0)
    return {
      level: "error", version: null,
      detail: `OpenSpec CLI could not report a version: ${
        (probe.stderr || probe.error?.message || "").trim() || `exit ${probe.status}`}`
    };
  // stdout only: matching over stdout+stderr let any warning line mentioning
  // the pinned version vouch for a CLI that was actually a different version.
  return openSpecVersionStatus(probe.stdout);
}

export function assertOpenSpecCli(root, fail) {
  const status = openSpecCliStatus(root);
  if (status.level === "error") fail(status.detail);
  if (status.level === "warn") console.error(`WARNING: ${status.detail}`);
  return status;
}

export function signedCiProvider(providers, receiptPath, readJson) {
  return providers.find((provider) => {
    const receipt = readJson(receiptPath(provider), {});
    return String(receipt.provenance?.source || "").startsWith("signed-ci:");
  }) || null;
}

export function readRepositoryLandStatus(repository, runtime, targetHead, readDirty) {
  if (runtime.mode !== "worktree") return "read-not-isolated";
  if (readDirty) return "read-sandbox-dirty";
  if (targetHead !== (runtime.baseHead || repository.baseHead))
    return "read-dependency-drift";
  return "read-only";
}

export function writeRepositoryLandStatus(repository, runtime, commit, landed,
  sandboxGitlink, targetGitlink) {
  if (repository.id === "root") return "control-plane-last";
  if (!runtime.path) return "sandbox-missing";
  if (!commit) return "awaiting-explicit-commit";
  if (!landed) return "awaiting-explicit-branch-land";
  if (repository.type === "submodule" &&
      (sandboxGitlink !== commit || targetGitlink !== commit))
    return "awaiting-root-pointer";
  return "child-landed";
}

export function ciRepositoryLandStatus(status, runtime) {
  if (runtime.land?.ciRequired && runtime.land?.ci !== "pass") return "awaiting-ci";
  if (runtime.land?.ci === "fail") return "ci-failed";
  return status;
}

export function landRepositoryPlanRow(context, state, repository) {
  const runtime = state.repositories?.[repository.id] || {};
  const commit = runtime.land?.commit || null;
  const landed = repository.id === "root"
    ? false : context.repositoryCommitLanded(repository, commit);
  const sandboxGitlink = context.rootGitlink(
    state.workspace?.path || context.root, repository);
  const targetGitlink = context.rootGitlink(context.root, repository);
  const targetHead = context.gitHead(repository.path);
  const sandboxHead = context.gitHead(runtime.path || repository.workspacePath);
  const readDirty = repository.mode === "read" && runtime.mode === "worktree"
    ? context.git(["status", "--porcelain"], runtime.path).stdout.trim() : "";
  const baseStatus = repository.mode === "read"
    ? readRepositoryLandStatus(repository, runtime, targetHead, readDirty)
    : writeRepositoryLandStatus(repository, runtime, commit, landed,
      sandboxGitlink, targetGitlink);
  return {
    id: repository.id,
    type: repository.type,
    mode: repository.mode,
    dependsOn: repository.dependsOn || [],
    targetPath: repository.path,
    sandboxPath: runtime.path || repository.workspacePath,
    baseHead: runtime.baseHead || repository.baseHead,
    targetHead,
    sandboxHead,
    commit,
    ci: runtime.land?.ci || null,
    rootGitlink: sandboxGitlink,
    targetRootGitlink: targetGitlink,
    status: ciRepositoryLandStatus(baseStatus, runtime)
  };
}

export function landPreparationRepositoryValue(state, repository) {
  return {
    id: repository.id,
    mode: repository.mode,
    dependsOn: repository.dependsOn,
    authorizedCommit: repository.id === "root"
      ? repository.sandboxHead : repository.commit,
    ci: repository.ci,
    targetHead: repository.targetHead,
    status: repository.status,
    recoveryDisposition: state.land?.recovery?.[repository.id] || "forward-fix"
  };
}

export function landPreparationBindings(proof, graph) {
  return {
    graphRevision: graph?.revision || null,
    graphIdentity: graph?.identity || null,
    aggregateProofRunId: proof?.proofRunId || null,
    aggregateProofIdentity: proof?.aggregateGraphProof?.graphIdentity || null
  };
}

// Prove records protected-path edits and sandbox deletions instead of
// refusing them; Land is where the user sees them. Paths only, never contents.
function surfaceEntryKey(entry) {
  return { repositoryId: entry.repositoryId ?? null, path: String(entry.path) };
}

export function landSurfaceReport(state) {
  const report = typeof stateRuntime.surfaceAdditionReport === "function"
    ? stateRuntime.surfaceAdditionReport(state) : null;
  const entries = report?.entries || (Array.isArray(state?.surfaceAdditions)
    ? state.surfaceAdditions : []).filter((entry) =>
    entry && typeof entry === "object" && typeof entry.path === "string");
  const protectedEntries = report?.protected || entries.filter((entry) => entry.protected === true);
  const deleted = report?.deleted || entries.filter((entry) => entry.deleted === true);
  return {
    protected: protectedEntries.map(surfaceEntryKey),
    deleted: deleted.map(surfaceEntryKey),
    requiresPresentation: report ? Boolean(report.requiresPresentation)
      : protectedEntries.length > 0 || deleted.length > 0
  };
}

function surfacePathList(entries) {
  return entries.map((entry) => entry.repositoryId && entry.repositoryId !== "root"
    ? `${entry.repositoryId}:${entry.path}` : entry.path).join(", ");
}

export function createLandRuntime({
  root,
  transactions,
  loadRuntime,
  saveRuntime,
  pendingApplyTransactions,
  recoverPendingApply,
  assertNoDroppedScenarios,
  // Required, not defaulted: a permissive default would let the Land gate
  // vanish silently if a caller stopped passing it.
  blockingDrift,
  proofAudit,
  proofPath,
  readJson,
  writeJson,
  clearSnapshotCache,
  relevantHash,
  workspaceIsolationIssues = () => [],
  targetEditNotices = () => [],
  reviewPolicy = () => null,
  requiredProviders,
  receiptValidity,
  fileDigest,
  receiptPath,
  handoffReadiness,
  telemetryReadiness = null,
  verifyAppliedProjection,
  selectedRepositories = () => [],
  git,
  gitHead,
  stableHash = (value) => JSON.stringify(value),
  agentPlanValue = null,
  executionContract = null,
  now,
  blockWithDecision,
  deliveryObservation = null,
  // Land's pre-mutation projection checks (apply planning, repository
  // delivery, landed-projection binding, spec sync). `inspect` keeps it
  // read-only for `land check`; Land runs it with recording allowed.
  landPreflight = null,
  // Required, not defaulted: Land re-checks spec approval itself so a Land
  // grant can never stand in for the user's consent to the agreement.
  assertApproval,
  fail
}) {
  if (typeof assertApproval !== "function")
    throw new Error("createLandRuntime requires assertApproval");

  // Land is the single hard gate: it never accepts missing, failed,
  // inconclusive, invalid, or stale proof. Recovery is the normal lifecycle
  // route, which proves the current workspace before it reaches Land again.
  function assertLandAssurance(id, assurance, state) {
    // The lifecycle must agree with the proof: a change returned to `building`
    // (an amendment, staged root pointers) is unproven even when its proof hash
    // still matches, and the reducer would refuse its archive only after the
    // destructive OpenSpec step.
    const status = normalizeLifecycleStatus(state?.status);
    if (!["proven", "applied"].includes(status))
      fail(`Land requires current passing proof for '${id}' (assurance: ${
        assurance?.status || "unknown"}; lifecycle is '${status}', not proven)\n` +
        `  next: claude-foundation advance ${id} --through archived`);
    if (assurance?.status === "passed" && assurance.proofWorkspaceHash &&
        assurance.proofWorkspaceHash === assurance.workspaceHash) return;
    fail(`Land requires current passing proof for '${id}' (assurance: ${
      assurance?.status || "unknown"}${assurance?.reason ? `; ${assurance.reason}` : ""})\n` +
      `  next: claude-foundation advance ${id} --through archived`);
  }

  function assertLandTargetReady(id, state) {
    // Kept target content must reach the sandbox and be proven again. That is
    // the harness's own sync, never a command handed to the agent.
    if (state.workspace?.recovery?.requiresSync)
      blockWithDecision(id, "recovery-sync-required", {
        kind: "recovery-sync-required",
        summary: "The target was preserved during manual recovery; the sandbox is synchronized " +
          "onto it and proved again before Land continues.",
        automaticRecovery: "sync",
        options: [
          { id: "sync", outcome: "Synchronize the sandbox onto the preserved target and prove it again." },
          { id: "pause", outcome: "Leave both workspaces as they are." }
        ],
        recommended: "sync"
      });
    const pending = pendingApplyTransactions(id);
    if (pending.length) {
      // Both automatic resolutions are non-destructive: settle only finishes
      // or reverses bytes Land itself wrote (divergent content turns the
      // journal into a manual recovery instead), and keep-current overwrites
      // nothing. `advance --through archived` applies them itself; restoring
      // a backup over divergent content stays the user's explicit choice.
      const manual = pending.some((transaction) => MANUAL_APPLY_STATUS.includes(transaction.status));
      const resolution = manual ? "keep-current" : "settle";
      blockWithDecision(id, "apply-pending-recovery", {
        kind: "apply-pending-recovery",
        summary: `An earlier apply for '${id}' is unresolved. Land check changes nothing while it is pending.`,
        transactions: pending.map((transaction) => ({
          transactionId: transaction.transactionId,
          status: transaction.status,
          appliedPaths: transaction.appliedPaths,
          update: transaction.counts.update,
          create: transaction.counts.create,
          delete: transaction.counts.delete
        })),
        divergentPaths: [...new Set(pending.flatMap((transaction) =>
          transaction.divergentPaths || []))].slice(0, 50),
        options: manual ? [
          { id: "keep-current", outcome: "Keep the current target files (nothing is overwritten), " +
            "then synchronize the sandbox onto them and prove again before Land continues." },
          { id: "restore-backup", outcome: "Replace the divergent target files with the recorded " +
            `pre-apply backup: 'claude-foundation advance ${id} --through archived --recover-apply ` +
            "restore-backup --decision-ref <user-decision>'." },
          { id: "pause", outcome: "Leave the transaction pending and make no change." }
        ] : [
          { id: "settle", outcome: "Finish or reverse the interrupted apply from its journal, touching " +
            "only bytes Land itself wrote, then continue Land." },
          { id: "pause", outcome: "Leave the transaction pending and make no change." }
        ],
        recommended: resolution,
        automaticRecovery: resolution
      });
    }
    assertNoDroppedScenarios(id);
    assertOpenSpecCli(root, fail);
    if (state.workspace?.mode === "worktree" && !state.workspace.applied &&
        gitHead(root) !== state.workspace.baseHead) {
      const baseDecision = targetHeadMovedDecision({
          changeId: id,
          recordedBase: state.workspace.baseHead,
          currentHead: gitHead(root),
          multiRepository: compositeRepositorySelection(selectedRepositories(id, state)),
          action: "Landing"
        });
      const projection = deliveryObservation?.(id, state) ||
        { observed: false, paths: [], reason: "observation-unavailable" };
      const references = recordedDeliveryReferences(state);
      const decision = projection.observed || references.length
        ? outOfBandDeliveryDriftValue({
          changeId: id, state,
          recordedHead: state.workspace.baseHead,
          currentHead: gitHead(root), baseDecision,
          observation: { projection, references }
        })
        : baseDecision;
      blockWithDecision(id, "control-head-moved", decision);
    }
  }

  function assertReadOnlyLandDependencies(id, state) {
    for (const repository of selectedRepositories(id, state)) {
      if (repository.mode !== "read") continue;
      const runtime = state.repositories?.[repository.id] || {};
      if (runtime.mode !== "worktree")
        fail(`read-only dependency '${repository.id}' is not isolated in a Git worktree, so Land cannot ` +
          `prove it unchanged; run claude-foundation doctor --stage build --change ${id} to see why, ` +
          `then resume with claude-foundation advance ${id} --through archived`);
      const dirty = git(["status", "--porcelain"], runtime.path);
      if (dirty.status !== 0 || dirty.stdout.trim())
        fail(`read-only dependency '${repository.id}' changed inside its sandbox: ${
          dirty.stdout.trim() || dirty.stderr.trim() || "git status failed"}`);
      const targetHead = gitHead(repository.path);
      if (targetHead !== runtime.baseHead)
        fail(`read-only dependency '${repository.id}' moved after sandbox creation (${
          String(runtime.baseHead || "").slice(0, 8)} -> ${String(targetHead || "").slice(0, 8)}); run sandbox sync and prove again`);
    }
  }

  function assertAggregateLandProof(graph, proof, hash) {
    if (!graph) return;
    const aggregate = proof.aggregateGraphProof;
    if (!aggregate || aggregate.status !== "pass")
      throw new Error(`aggregate graph proof is missing; finalize one fresh proof for graph ${graph.revision}`);
    if (aggregate.graphIdentity !== graph.identity ||
        aggregate.graphRevision !== graph.revision || aggregate.workspaceHash !== hash)
      throw new Error(`aggregate graph proof is stale for ${graph.revision}; run one fresh prove`);
    const missingNodes = (aggregate.requiredNodes || []).filter((node) =>
      !(aggregate.coveredNodes || []).includes(node));
    const missingEdges = (aggregate.requiredEdges || []).filter((edge) =>
      !(aggregate.coveredEdges || []).includes(edge));
    if (missingNodes.length || missingEdges.length)
      throw new Error(`aggregate graph proof is incomplete: nodes ${missingNodes.join(", ") || "none"}; edges ${
        missingEdges.join(", ") || "none"}`);
  }

  function landAssuranceSnapshot(id, state, multiRepository) {
    let proof = null;
    let proofReadIssue = null;
    if (existsSync(proofPath(id))) {
      try { proof = readJson(proofPath(id)); }
      catch (error) { proofReadIssue = error.message; }
    }
    clearSnapshotCache(id);
    const hash = relevantHash(id, null, true);
    const graph = agentPlanValue?.(id)?.graph || null;
    if (proofReadIssue) return {
      proof: null, graph, hash,
      assurance: { status: "invalid", proofRunId: null, proofWorkspaceHash: null,
        workspaceHash: hash, reason: `proof-unreadable: ${proofReadIssue}`,
        acceptedBy: "explicit-land-authority" }
    };
    if (!proof) return {
      proof: null, graph, hash,
      assurance: { status: "missing", proofRunId: null, proofWorkspaceHash: null,
        workspaceHash: hash, reason: "no-proof", acceptedBy: "explicit-land-authority" }
    };
    let audit;
    try { audit = proofAudit(id, true); }
    catch (error) { audit = { valid: false, reason: error.message }; }
    let status = "passed";
    let reason = null;
    if (proof.status !== "pass") {
      status = ["fail", "failed"].includes(proof.status) ? "failed"
        : proof.status === "inconclusive" ? "inconclusive" : "invalid";
      reason = `proof-${proof.status || "invalid"}`;
    } else if (!audit.valid) {
      status = "invalid";
      reason = audit.reason;
    } else if (proof.workspaceHash !== hash) {
      status = "stale";
      reason = "workspace-changed-after-proof";
    } else {
      try {
        assertAggregateLandProof(graph, proof, hash);
        assertLandEvidence(id, state, proof, hash, multiRepository);
      } catch (error) {
        status = "invalid";
        reason = error.message;
      }
      if (status === "passed" && blockingDrift(id).length) {
        status = "failed";
        reason = "model-tier-drift";
      }
    }
    return {
      proof, graph, hash,
      assurance: {
        status, proofRunId: proof.proofRunId || null,
        proofWorkspaceHash: proof.workspaceHash || null,
        workspaceHash: hash, reason, acceptedBy: "explicit-land-authority"
      }
    };
  }

  function assertLandEvidence(id, state, proof, hash, multiRepository) {
    const compiled = executionContract?.(id) || null;
    const currentProviders = requiredProviders(id);
    const providers = compiled?.evidence?.providers || currentProviders;
    if (compiled && JSON.stringify(providers) !== JSON.stringify([...currentProviders].sort()))
      throw new Error("execution contract provider projection disagrees with current Land evidence policy");
    for (const provider of providers) {
      const check = receiptValidity(id, provider, hash);
      if (check.validity !== "valid")
        throw new Error(`${provider} evidence is ${check.validity}\n  ${
          validityRecovery(check.validity, id, provider)}`);
      const manifestEntry = (proof.receipts || []).find((entry) => entry.provider === provider);
      if (!manifestEntry || fileDigest(receiptPath(id, provider)) !== manifestEntry.sha256)
        throw new Error(`${provider} live receipt differs from the proven receipt manifest`);
    }
    const independentlyRequiredCi = riskRequiresCi(state, reviewPolicy(id, state));
    const requiredCi = compiled?.land?.signedCiRequired ?? independentlyRequiredCi;
    if (compiled && requiredCi !== independentlyRequiredCi)
      throw new Error("execution contract signed-CI projection disagrees with current Land risk policy");
    if (requiredCi && !multiRepository) {
      const ciProvider = signedCiProvider(providers,
        (provider) => receiptPath(id, provider), readJson);
      if (!ciProvider)
        throw new Error(`risk policy requires signed CI evidence before Land. Configure an external ` +
          `provider with ci.issuer and ci.publicKey, then run: claude-foundation evidence ` +
          `verify-ci ${id} <provider> <signed.json>`);
    }
  }

  function assertLandOperationalSafety(_id, state) {
    if (state.workspace?.applied) {
      const applied = verifyAppliedProjection(state);
      if (!applied.valid) fail(`applied projection is invalid: ${applied.reason}`);
    }
  }

  function reportLandReady(id, state, hash, assurance, externalOperations, surface) {
    const waived = (state.waivers || []).map((row) => visualWaiverSummary(row) ||
      `${row.capability} (${row.authority?.reference || "user decision"})`);
    const rootBranch = targetBranch(root);
    const branchLine = rootBranch && ["main", "master"].includes(rootBranch)
      ? `\n  branch: ${rootBranch} (default branch — branch-first policy suggests a feature branch)` : "";
    const postLand = externalOperations.operations
      .filter((row) => ["declared-post-land", "tracked-post-land"]
        .includes(row.landDisposition))
      .map((row) => `${row.id} (${row.owner}${row.reference ? `: ${row.reference}` : ""})`);
    const telemetry = telemetryReadiness?.(id) || null;
    const hasMeasuredUsage = telemetry && (
      ["measured", "no-usage"].includes(telemetry.classification) ||
      Object.values(telemetry.measuredDimensions || {}).some(Boolean));
    const telemetryRecovery = hasMeasuredUsage
      ? null : telemetry?.recoveryActions?.[0]?.command || null;
    const surfaceLines = surface?.requiresPresentation
      ? `${surface.protected.length ? `\n  protected paths changed: ${surfacePathList(surface.protected)}` : ""}${
        surface.deleted.length ? `\n  paths deleted: ${surfacePathList(surface.deleted)}` : ""}` : "";
    console.log(`LAND READY ${id}\n  workspace: ${hash}\n  assurance: ${assurance.status}${surfaceLines}${
      postLand.length ? `\n  declared post-Land obligation: ${postLand.join(", ")}` : ""}${
      waived.length ? `\n  waived: ${waived.join(", ")}` : ""}${landAdvisoryLines(state)
      .map((line) => `\n  ${line}`).join("")}${branchLine}\n  next: /land ${id}${telemetry
        ? `\n  telemetry: ${telemetry.classification}${telemetryRecovery
          ? `; recovery: ${telemetryRecovery}` : ""}` : ""}`);
    return telemetry;
  }

  // `preflight` selects Land's full pre-mutation check: "inspect" for the
  // read-only `land check` command, "apply" for Land itself. Both run the one
  // shared preflight, so `land check` stops on every code Land stops on before
  // it writes. Internal readiness callers (Land authority, root pointers,
  // the legacy saga) keep the readiness-only check.
  function landCheck(id, { preflight = null } = {}) {
    const state = loadRuntime(id);
    if (state.status === "archived") {
      console.log(`ALREADY ARCHIVED ${id}\n  archived: ${state.archivedAt || "unknown"}`);
      return { archived: true, state };
    }
    // A Land grant is authority to apply, never consent to the agreement:
    // stale or missing spec approval refuses here, so grant issue and archive
    // (both of which run this check) refuse too.
    assertApproval(id, state, { workspace: false });
    const multiRepository = compositeRepositorySelection(selectedRepositories(id, state));
    assertLandTargetReady(id, state);
    const isolationIssues = workspaceIsolationIssues(id);
    if (isolationIssues.length) fail(isolationIssues.join("; "));
    for (const notice of targetEditNotices(state)) console.error(`NOTICE: ${notice}`);
    assertReadOnlyLandDependencies(id, state);
    const { proof, graph, hash, assurance } = landAssuranceSnapshot(
      id, state, multiRepository);
    const externalOperations = handoffReadiness(id);
    if (assurance.status === "passed" && externalOperations.blocking.length) {
      assurance.status = "inconclusive";
      assurance.reason = "external-operation-pending";
    }
    // `land check` stops on every code Land stops on, so it refuses unproven
    // work as well instead of reporting it LAND READY.
    assertLandAssurance(id, assurance, state);
    assertLandOperationalSafety(id, state);
    if (preflight && landPreflight)
      landPreflight(id, state, { inspect: preflight !== "apply" });
    if (multiRepository) persistLandPreparation(id, state, proof, graph, hash);
    const surface = landSurfaceReport(state);
    const telemetry = reportLandReady(id, state, hash, assurance, externalOperations, surface);
    return { archived: false, state, hash, assurance, externalOperations, telemetry, surface };
  }

  // The explicit half of the split. Recovery replays or reverses filesystem
  // mutations, so it carries the same decision reference every other authority
  // action does, and it says what it is about to settle before it settles it.
  function recoverLand(id, flags = {}) {
    const decisionRef = String(flags["decision-ref"] || "").trim();
    if (!decisionRef)
      fail("settling an interrupted apply requires --decision-ref <user-decision>; ask the user, then run " +
        `'claude-foundation advance ${id} --through archived --recover-apply settle --decision-ref <user-decision>'`);
    const pending = pendingApplyTransactions(id);
    if (!pending.length) {
      console.log(`NOTHING TO RECOVER ${id}\n  no unresolved apply transaction`);
      return;
    }
    const manual = pending.some((transaction) =>
      ["rolling-back", "manual-recovery", "recovering-backup", "settling-current"]
        .includes(transaction.status));
    const resolution = String(flags.resolution || "").trim();
    if (manual && !["keep-current", "restore-backup"].includes(resolution))
      fail("this interrupted apply needs a manual resolution: ask the user, then run " +
        `'claude-foundation advance ${id} --through archived --recover-apply keep-current|restore-backup ` +
        "--decision-ref <user-decision>'");
    for (const transaction of pending)
      console.log(`RECOVERING ${transaction.transactionId}\n  status: ${
        transaction.status}\n  update: ${transaction.counts.update}; create: ${
        transaction.counts.create}; delete: ${transaction.counts.delete}`);
    recoverPendingApply(id, loadRuntime(id), { resolution, decisionRef });
    const remaining = pendingApplyTransactions(id);
    console.log(`RECOVERED ${id}\n  settled: ${
      pending.length - remaining.length}/${pending.length}\n  next: claude-foundation advance ${id} --through archived`);
  }

  function orderedRepositories(id, state = loadRuntime(id)) {
    const repositories = selectedRepositories(id, state);
    const byId = new Map(repositories.map((repository) => [repository.id, repository]));
    const visiting = new Set();
    const visited = new Set();
    const ordered = [];
    function visit(repository) {
      if (visiting.has(repository.id))
        fail(`repository dependency cycle at '${repository.id}'`);
      if (visited.has(repository.id)) return;
      visiting.add(repository.id);
      for (const dependency of repository.dependsOn || []) {
        const target = byId.get(dependency);
        if (target) visit(target);
      }
      visiting.delete(repository.id);
      visited.add(repository.id);
      ordered.push(repository);
    }
    repositories.forEach(visit);
    ordered.sort((left, right) => {
      if (left.id === "root") return 1;
      if (right.id === "root") return -1;
      return 0;
    });
    return ordered;
  }

  function repositoryCommitLanded(repository, commit) {
    if (!commit || !gitHead(repository.path)) return false;
    const result = git(["merge-base", "--is-ancestor", commit, "HEAD"], repository.path);
    return result.status === 0;
  }

  function rootGitlink(workspace, repository) {
    if (repository.type !== "submodule") return null;
    const result = git(["ls-files", "-s", "--", repository.relativePath], workspace);
    if (result.status !== 0) return null;
    return result.stdout.trim().match(/^160000\s+([0-9a-f]+)/)?.[1] || null;
  }

  function landPlanValue(id, state = loadRuntime(id)) {
    const proof = existsSync(proofPath(id)) ? readJson(proofPath(id), {}) : null;
    const selected = orderedRepositories(id, state);
    if (compositeRepositorySelection(selected)) {
      const repositories = selected.map((repository) => {
        const runtime = repository.id === "root"
          ? state.repositories?.root || state.workspace
          : state.repositories?.[repository.id] || {};
        return {
          id: repository.id,
          type: repository.type,
          mode: repository.mode,
          dependsOn: repository.dependsOn || [],
          targetPath: repository.path,
          transactionId: repository.id === "root"
            ? state.workspace?.apply?.transactionId || null
            : runtime.delivery?.transactionId || null,
          status: repository.mode === "read" ? "read-only" :
            repository.id === "root" && state.workspace?.applied
              ? "applied-uncommitted"
              : runtime.delivery?.status || "pending-apply"
        };
      });
      return {
        version: 2,
        changeId: id,
        proofRunId: proof?.proofRunId || null,
        proofStatus: proof?.status || "missing",
        workspaceHash: relevantHash(id),
        strategy: "workspace-uncommitted",
        repositories,
        readyToArchive: repositories.every((repository) =>
          ["read-only", "applied-uncommitted"].includes(repository.status)),
        updatedAt: now()
      };
    }
    const repositories = selected.map(
      landRepositoryPlanRow.bind(null, {
        root, git, gitHead, rootGitlink, repositoryCommitLanded
      }, state));
    return {
      version: 1,
      changeId: id,
      proofRunId: proof?.proofRunId || null,
      proofStatus: proof?.status || "missing",
      workspaceHash: relevantHash(id),
      strategy: "ordered-resumable-saga",
      repositories,
      readyToArchive: repositories.every((repository) =>
        ["read-only", "child-landed", "control-plane-last"].includes(repository.status)),
      updatedAt: now()
    };
  }

  function currentLandProof(id, proof) {
    if (proof) return proof;
    return existsSync(proofPath(id)) ? readJson(proofPath(id), {}) : null;
  }

  function currentLandGraph(id, graph) {
    if (graph) return graph;
    return agentPlanValue?.(id)?.graph || null;
  }

  function landPreparationValue(id, state = loadRuntime(id), proof = null, graph = null, hash = null) {
    const currentProof = currentLandProof(id, proof);
    const currentGraph = currentLandGraph(id, graph);
    const plan = landPlanValue(id, state);
    const repositories = plan.repositories.map(
      landPreparationRepositoryValue.bind(null, state));
    return compileLandPreparation({
      changeId: id,
      ...landPreparationBindings(currentProof, currentGraph),
      workspaceHash: hash || relevantHash(id),
      repositories,
      stableHash,
      preparedAt: now()
    });
  }

  function persistLandPreparation(id, state, proof, graph, hash) {
    const value = landPreparationValue(id, state, proof, graph, hash);
    writeJson(join(transactions, id, "land-preparation.json"), value);
    return value;
  }

  function requirePreparedLand(id) {
    const state = loadRuntime(id);
    const proof = existsSync(proofPath(id)) ? readJson(proofPath(id), {}) : null;
    const graph = agentPlanValue?.(id)?.graph || null;
    const current = landPreparationValue(id, state, proof, graph, relevantHash(id));
    const path = join(transactions, id, "land-preparation.json");
    const prepared = existsSync(path) ? readJson(path, {}) : null;
    if (!landPreparationMatches(prepared, current))
      fail(`Land preparation changed before mutation (${current.incomplete.join(", ") || "identity drift"}); ` +
        `resolve it, then resume with claude-foundation advance ${id} --through archived`);
    return current;
  }

  function showLandPlan(id) {
    const plan = landPlanValue(id);
    writeJson(join(transactions, id, "multi-repo-land.json"), plan);
    console.log(JSON.stringify(plan, null, 2));
  }

  // Branch name of the checked-out target, or null for detached HEAD or any
  // error. Warnings only — every land guard stays commit-based, so a failed
  // branch read can never change what lands.
  function targetBranch(path) {
    try {
      const result = git(["rev-parse", "--abbrev-ref", "HEAD"], path);
      if (!result || result.status !== 0) return null;
      const branch = String(result.stdout || "").trim();
      return !branch || branch === "HEAD" ? null : branch;
    } catch {
      return null;
    }
  }

  function resumeLand(id) {
    landCheck(id);
    const plan = landPlanValue(id, loadRuntime(id));
    console.log(JSON.stringify(plan, null, 2));
    return plan;
  }

  function assertMultiRepositoryArchiveReady(id, state) {
    if (!compositeRepositorySelection(selectedRepositories(id, state))) return;
    const plan = landPlanValue(id);
    if (plan.strategy === "workspace-uncommitted") {
      const blocked = plan.repositories.filter((repository) =>
        !["read-only", "applied-uncommitted"].includes(repository.status));
      if (blocked.length)
        fail(`multi-repository workspace delivery is incomplete: ${blocked.map(
          (repository) => `${repository.id}:${repository.status}`).join(", ")}`);
      return;
    }
    fail(`multi-repository Land has an unexpected plan strategy '${plan.strategy}'`);
  }

  return {
    landCheck,
    recoverLand,
    orderedRepositories,
    repositoryCommitLanded,
    rootGitlink,
    landPlanValue,
    landPreparationValue,
    requirePreparedLand,
    showLandPlan,
    resumeLand,
    assertMultiRepositoryArchiveReady
  };
}
