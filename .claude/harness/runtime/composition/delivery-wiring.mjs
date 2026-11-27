// Composition: the advance coordinator and what it drives at the end of the
// lifecycle — Land undo, abandon, session leases, feedback, outcomes and
// lessons, the project feature map, and pyramid readiness. Wiring only.
import { advanceLandOperation, openSpecCliStatus } from "../workflow/land/land-runtime.mjs";
import { assertExecutionPreparationReady, ensureProjectOpenSpec, executionPreparationValue } from "../core/tool-preparation.mjs";
import { assertSpecApproval, carryWiringIntoAmendment, preserveSpecApprovalAcross } from "../core/user-decisions.mjs";
import { changeWorkTypes, taskChangeIssue } from "../workflow/change/task-change.mjs";
import { createAbandonRuntime } from "../workflow/change/abandon-runtime.mjs";
import { createAdvanceRuntime, hasValidLandGrant, prepareAdvanceBuild, runAdvanceProof } from "../workflow/advance/advance-runtime.mjs";
import { createFeedbackRuntime } from "../observability/feedback-runtime.mjs";
import { createLandUndo } from "../workflow/land/land-undo.mjs";
import { createLessonsRuntime } from "../observability/lessons-runtime.mjs";
import { createOutcomesRuntime, runtimeStates } from "../observability/outcomes-runtime.mjs";
import { createCheckReuse } from "../core/check-reuse.mjs";
import { noticeSlowTaskCheck } from "../core/node-test-exit.mjs";
import { escapingImportIssue, escapingImports } from "../workflow/change/repository-escape.mjs";
import { createProjectFeaturesCommand } from "../workflow/validation/project-feature-map.mjs";
import { createProductProgressCommand } from "../workflow/validation/product-progress.mjs";
import { createPyramidReadinessCommand } from "./pyramid-readiness-command.mjs";
import { createSessionLeaseRuntime, runTaskCheck } from "../workflow/authority/session-lease.mjs";
import { currentDeliveryProof } from "../workflow/advance/advance-recovery.mjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { providerCapability } from "../evidence/provider-catalog.mjs";
import { spawnSync } from "node:child_process";
import { transactionJournals as readTransactionJournals } from "../workflow/transaction/land-journal.mjs";

export function composeDeliveryRuntimes({
  ATTESTATIONS, AUTHORITY, CHANGES, DELIVERIES, EVIDENCE_VAULT, HANDOFFS,
  INSTRUCTION_MANIFESTS, LOGS, PACKAGES, PLANS, PREVIEWS, RECEIPTS, RECOVERY, REVIEWS, ROOT,
  RUNTIME, SNAPSHOTS, TRANSACTIONS, acquireAgentLease, activeChangeLeases, activeChangePath,
  adapterRuntime, agentDispatchValue, agentPlanValue, applyRuntime, applyTransactionRoot,
  approvalPackageLink, archive, authorityNext, authorityPreflight, authorityStatusValue,
  blockWithDecision, canonicalChangedSurface, changePath, changedSurfaceResolvable,
  cleanupAppliedSandbox, cleanupChangeLeases, cleanupRepositorySandboxes, commandPhaseRecorder,
  copyPath, deliveredAiAttempts, die, directoryHash, discardAgentLease, externalEvidenceRecovery, fileDigest,
  git, gitBuffer, gitHead, guardedRunAuthorityReviewer, initializeEvidence, inspectSnapshots,
  landCheck, landGrantRuntime, landPlanValue, loadRuntime, markBlocked, metricsValue, now,
  packetRuntime, parkAgentLease, pathIdentity, pathMode, prepareBuildSandbox,
  projectRootRepositories, proofAdvance, proofAudit, proofReadinessValue, providerConfig,
  pullRequestRuntime, qualityLaneStates, readJson, readJsonLines, readJsonOrNull, receiptPath,
  receiptValidity, recordPhaseContext, recoverLand, recoverReviewBindings, releaseAgentLease,
  relevantHash, repositoryById, repositoryCatalog, requiredProviders, reviewAttemptRecords,
  rollbackApplyTransaction, safeRootPath, sandboxRuntime, saveRuntime, selectedRepositories,
  stableHash, syncSandbox, transactionJournalPath, trapFailures, trapFailuresAsync, writeJson
}) {
  const { showAdvance: showDeliveryAdvance } = pullRequestRuntime;
  const advanceLand = advanceLandOperation.bind(null, {
    loadRuntime, landCheck, archive, landPlanValue,
    selectedRepositories,
    prepareExecution: (id, options) => prepareExecution(id, options)
  });

  function preparationPlanPath(id) {
    return join(PLANS, `${id}-preparation.json`);
  }

  function preparationProviders(id) {
    return requiredProviders(id).map((provider) => {
      const config = providerConfig(id, provider) || {};
      return {
        id: provider,
        repository: config.repository || null,
        adapter: config.adapter || "external",
        command: config.command || null
      };
    });
  }

  function prepareExecution(id, { stage = "build" } = {}) {
    if (stage !== "land") projectRootRepositories(id);
    const state = loadRuntime(id);
    const repositories = selectedRepositories(id, state);
    const openSpec = ensureProjectOpenSpec({
      root: ROOT,
      status: openSpecCliStatus,
      spawn: spawnSync,
      stage
    });
    const prior = readJsonOrNull(preparationPlanPath(id));
    const plan = executionPreparationValue({
      id,
      state,
      repositories,
      providers: preparationProviders(id),
      openSpec,
      stableHash,
      prior,
      now
    });
    plan.stage = stage;
    writeJson(preparationPlanPath(id), plan);
    return assertExecutionPreparationReady(plan);
  }
  async function runAdvanceQuietly(operation) {
    const priorLog = console.log;
    const priorExitCode = process.exitCode;
    console.log = () => {};
    try {
      const result = await operation();
      // Primitive proof commands retain their diagnostic non-zero exits. The
      // unified lifecycle transports the same structured boundary successfully
      // so the host consumes it instead of retrying a command it thinks crashed.
      process.exitCode = priorExitCode;
      return result;
    } finally {
      console.log = priorLog;
    }
  }
  const checkReuse = createCheckReuse({ logs: LOGS, workspaceHash: (id) => relevantHash(id) });
  const sessionLeases = createSessionLeaseRuntime({
    loadRuntime, activeChangeLeases, stableHash, saveRuntime, agentPlanValue,
    // D5: advance runs the handed-off task's own verify check and ticks it.
    // A pass on this exact workspace (from an earlier advance or the agent's
    // own `exec --task`) is reused, never waited on again.
    runCheck: (id, check) => commandPhaseRecorder.measure("build.task-check", () => {
      projectRootRepositories(id);
      const reused = checkReuse.reusable(id, check.repository, check.command);
      if (reused) return { status: "pass", exitCode: 0, reused: true,
        output: `passed on this exact workspace (${reused.source}, ${reused.at}); not run again` };
      const started = Date.now();
      const result = adapterRuntime.runTaskCheckAsEvidence(id, check) ||
        runTaskCheck({ loadRuntime }, id, check);
      const durationMs = Date.now() - started;
      checkReuse.record(id, check.repository, check.command, { status: result?.status, durationMs, source: "advance" });
      noticeSlowTaskCheck(check.command, result, durationMs);
      return result;
    }),
    taskChangeIssue: (id, taskId) => {
      try {
        const state = loadRuntime(id);
        const task = (agentPlanValue(id)?.tasks || []).find((row) => row.id === taskId);
        if (!task || !changedSurfaceResolvable(id, state)) return null;
        const repository = trapFailures(() =>
          repositoryById(id, task.repository || "root", state));
        const changedPaths = trapFailures(() => canonicalChangedSurface(id, state))
          .filter((row) => row.repositoryId === repository.id).map((row) => row.path);
        // A child repository must stand alone: no relative path into another.
        if (repository.id !== "root" && repository.workspacePath) {
          const escaped = escapingImportIssue(taskId, repository.id,
            escapingImports(repository.workspacePath, changedPaths));
          if (escaped) return escaped;
        }
        return taskChangeIssue({
          workTypes: changeWorkTypes(activeChangePath(id)), task, changeId: id, changedPaths
        });
      } catch { return null; }
    },
    acquire: acquireAgentLease, release: releaseAgentLease, discard: discardAgentLease,
    park: parkAgentLease
  });
  const { advanceValue, advanceThrough, showAdvance } = createAdvanceRuntime({
    approvalPackageLink,
    pendingApprovalDecisions: (id) => trapFailures(() => {
      const preflight = authorityPreflight(id);
      const authority = preflight.status === "READY" ? [] : preflight.blockers.map((blocker) => ({
        code: blocker.code, summary: blocker.summary, next: blocker.next
      }));
      // External evidence nobody can wire automatically is the same Prove-time
      // question; review and acceptance have their own routes.
      const state = loadRuntime(id);
      const providers = changedSurfaceResolvable(id, state) ? requiredProviders(id) : [];
      const external = providers.flatMap((provider) => {
        const config = providerConfig(id, provider);
        if (config && config.adapter !== "external") return [];
        if (["review", "acceptance"].includes(providerCapability(provider, config))) return [];
        const recovery = /** @type {Record<string, any>} */ (externalEvidenceRecovery(id, provider));
        if (recovery.kind !== "user-decision" ||
            recovery.wiring?.kind === "configure-provider") return [];
        return [{
          code: "EXTERNAL_EVIDENCE_REQUIRED", summary: recovery.decision.summary,
          next: `wire provider '${provider}' in openspec/changes/${id}/execution.yaml or agree how its external result will be supplied`
        }];
      });
      return [...authority, ...external];
    }),
    settleSessionLeases: sessionLeases.settle,
    reverifyCompletedTasks: (id) => {
      sessionLeases.tickAccepted(id, agentPlanValue(id, { inspect: true }).resultReady || []);
      return sessionLeases.reverify(id, agentPlanValue(id, { inspect: true }).verification || []);
    },
    issueSessionLease: sessionLeases.issue,
    changePath,
    assertApproval: (id, state, options) => assertSpecApproval(ROOT, id, state, options),
    inspectSnapshots,
    capture: trapFailures,
    captureAsync: trapFailuresAsync,
    markBlocked,
    loadRuntime,
    saveRuntime,
    recoverSandbox: (id) => commandPhaseRecorder.measureAsync("advance.sandbox-sync",
      () => runAdvanceQuietly(() => syncSandbox(id))),
    // Non-destructive interrupted-apply resolutions only (settle|keep-current),
    // recorded under the Land route that started the apply.
    recoverApply: (id, resolution) => runAdvanceQuietly(() => recoverLand(id, {
      "decision-ref": `harness:automatic-apply-recovery:${resolution}`,
      ...(resolution === "settle" ? {} : { resolution })
    })),
    synchronizeAgreement: async (id, flags = {}) => flags.resolve || sandboxRuntime.agreementStale(id)
      ? commandPhaseRecorder.measureAsync("advance.sandbox-sync",
        () => runAdvanceQuietly(() => sandboxRuntime.synchronizeAgreement(id, flags)))
      : false,
    // Detected provider wiring is a write, not a question: write the
    // recommended providers, then sync the revised agreement
    // into Build so Land never sees an edited-after-sync packet.
    wireEvidence: (id) => commandPhaseRecorder.measureAsync("advance.evidence-wiring",
      () => runAdvanceQuietly(async () => {
        // Wiring-only: an approval valid before the write stays valid; the
        // agreement's behavior did not change. An amended packet takes the
        // wiring into its snapshot so the drift check keeps it.
        preserveSpecApprovalAcross(ROOT, id, { loadRuntime, saveRuntime, now },
          () => carryWiringIntoAmendment(ROOT, id,
            { loadRuntime, saveRuntime, directoryHash, changePath },
            () => initializeEvidence(id, { write: true })), "evidence-wiring");
        if (loadRuntime(id).status === "building") prepareBuildSandbox(id);
        else await sandboxRuntime.synchronizeAgreement(id);
      })),
    runReview: (id, flags) => commandPhaseRecorder.measureAsync("advance.review-run",
      () => runAdvanceQuietly(() => guardedRunAuthorityReviewer(id, { ...flags }))),
    recoverWorkspace: (id) => runAdvanceQuietly(() => sandboxRuntime.recoverReplay(id)),
    recoverArchive: (id) => runAdvanceQuietly(() =>
      applyRuntime.recoverArchive(id, landGrantRuntime.issue)),
    proofIsCurrent: currentDeliveryProof.bind(null, {
      proofAudit, relevantHash, requiredProviders, receiptValidity, receiptPath, fileDigest
    }),
    agentDispatchValue,
    agentPlanValue,
    relevantHash,
    deliveredAiAttempts,
    authorityStatusValue,
    authorityNext,
    proofReadinessValue,
    hasLandGrant: hasValidLandGrant.bind(null, landGrantRuntime),
    authorizeLand: (id) => runAdvanceQuietly(() => landGrantRuntime.issue(id)),
    prepareBuild: prepareAdvanceBuild.bind(null, {
      measureAsync: commandPhaseRecorder.measureAsync,
      runQuietly: runAdvanceQuietly, prepareBuildSandbox, prepareExecution
    }),
    runProof: runAdvanceProof.bind(null, {
      measureAsync: commandPhaseRecorder.measureAsync,
      runQuietly: runAdvanceQuietly, prepareExecution, proofAdvance
    }),
    recoverReviewBindings,
    runLand: (id) => runAdvanceQuietly(() => advanceLand(id)),
    recordPhase: (id, phase) => {
      commandPhaseRecorder.transition(phase);
      recordPhaseContext(id, phase);
    },
    readJson,
    proofAdvancePath: (id) => join(EVIDENCE_VAULT, id, "proof-advance.json"),
    stableHash
  });
  const { showFeedback } = createFeedbackRuntime({
    inspectSnapshots,
    logs: LOGS,
    evidenceVault: EVIDENCE_VAULT,
    readJson,
    readJsonLines,
    metricsValue,
    packetValue: packetRuntime.inspectionPacketValue,
    nextAction: (id) => advanceValue(id, { inspect: true })
  });
  const { outcomesValue, showOutcomes } = createOutcomesRuntime({ runtimeDir: RUNTIME, evidenceDir: EVIDENCE_VAULT,
    logsDir: LOGS, changeWorkTypes: (id, state) => changeWorkTypes(activeChangePath(id, state)), reviewAttemptRecords,
    // Onboarding is when the quality configuration was first committed.
    onboardedAt: () => {
      const result = git(["log", "--diff-filter=A", "--format=%cI", "--", "quality/foundation-quality.json"]);
      const at = result.status === 0 ? String(result.stdout || "").trim().split("\n").filter(Boolean).at(-1) : null;
      return at ? { at, source: "git: quality/foundation-quality.json first committed" } : null;
    },
    repositoryOnboardedAt: () => {
      const path = join(ROOT, "quality", "foundation-quality.json");
      const config = existsSync(path) ? readJsonOrNull(path) : null;
      return Object.fromEntries((config?.repositories || []).filter((row) => row.onboardedAt)
        .map((row) => [row.id, row.onboardedAt]));
    } });
  const { lessonsValue, showLessons } = createLessonsRuntime({ runtimeDir: RUNTIME, evidenceDir: EVIDENCE_VAULT,
    logsDir: LOGS, reviewAttemptRecords, lessonsDocument: join(ROOT, "openspec", "lessons.md"),
    projectFileExists: (path) => existsSync(join(ROOT, path)), fail: die });
  const pyramidReadinessCommand = createPyramidReadinessCommand({ root: ROOT, laneStates: qualityLaneStates,
    lessonsValue, outcomesValue, repositoryCatalog,
    changeStates: () => runtimeStates(RUNTIME).filter((row) => row.state).map((row) => row.state) });
  const { showFeatures } = createProjectFeaturesCommand({
    root: ROOT, loadRuntime, activeChangePath, canonicalChangedSurface, fail: die
  });
  const { measureProduct, showProductProgress } = createProductProgressCommand({ root: ROOT, fail: die });
  const abandonRuntime = createAbandonRuntime({
    root: ROOT,
    paths: {
      recovery: RECOVERY,
      runtime: RUNTIME,
      receipts: RECEIPTS,
      evidenceVault: EVIDENCE_VAULT,
      transactions: TRANSACTIONS,
      snapshots: SNAPSHOTS,
      plans: PLANS,
      handoffs: HANDOFFS,
      authority: AUTHORITY,
      reviews: REVIEWS,
      instructionManifests: INSTRUCTION_MANIFESTS,
      attestations: ATTESTATIONS,
      deliveries: DELIVERIES,
      previews: PREVIEWS,
      packages: PACKAGES,
      logs: LOGS,
      changes: CHANGES
    },
    loadRuntime,
    cleanupChangeLeases,
    cleanupAppliedSandbox,
    cleanupRepositorySandboxes,
    transactionJournals: (id) => readTransactionJournals(TRANSACTIONS, id, readJson),
    rollbackApplyTransaction,
    writeJson,
    now,
    blockWithDecision,
    fail: die
  });
  const { abandonChange } = abandonRuntime;
  const { undoLand } = createLandUndo({
    root: ROOT,
    paths: {
      recovery: RECOVERY, runtime: RUNTIME, receipts: RECEIPTS, evidenceVault: EVIDENCE_VAULT,
      transactions: TRANSACTIONS, snapshots: SNAPSHOTS, plans: PLANS, handoffs: HANDOFFS,
      logs: LOGS, authority: AUTHORITY, reviews: REVIEWS,
      instructionManifests: INSTRUCTION_MANIFESTS, attestations: ATTESTATIONS,
      deliveries: DELIVERIES, previews: PREVIEWS, packages: PACKAGES
    },
    loadRuntime, saveRuntime, readJson, writeJson, now, gitHead, git, gitBuffer,
    pathIdentity, pathMode, safeRootPath, copyPath,
    transactionRoot: applyTransactionRoot, journalPath: transactionJournalPath,
    cleanupChangeLeases, fail: die
  });
  const [command, ...values] = process.argv.slice(2);
  return {
    abandonChange, advanceLand, advanceThrough, advanceValue, command, lessonsValue,
    pyramidReadinessCommand, sessionLeases, showAdvance, showDeliveryAdvance, showFeatures,
    showFeedback, showLessons, showOutcomes, showProductProgress, measureProduct, undoLand, values
  };
}
