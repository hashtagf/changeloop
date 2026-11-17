import { currentWaivers } from "../../core/user-decisions.mjs";
import { requireDeps } from "../../core/required-deps.mjs";
import { grantVisualRepair } from "../../evidence/repair-runtime.mjs";
import { recordVisualDriftWaiver } from "../change/gate-waivers.mjs";
import { advisoryVisualLine } from "../../evidence/visual-review.mjs";
import { inconclusiveLine } from "../../evidence/test-discrimination.mjs";
import { changeWorkTypes } from "../change/task-change.mjs";
import { proofCursorToken } from "../../evidence/proof-execution-runtime.mjs";
import { recordSignal } from "../../core/signals.mjs";
import {
  lifecycleOutcome, lifecycleUserProjection, lifecycleUserState
} from "../../core/lifecycle-outcome.mjs";
import { actionableGuidance, createAdvanceRecovery } from "./advance-recovery.mjs";

import { bestEffort } from "../../core/best-effort.mjs";
import {
  advanceFailureAction, command, envelope, envelopeContextFiles, legacyLandSagaAction,
  noProgressOutput, resume, testAdequacyInstruction, withSignals
} from "./advance-envelope.mjs";
import {
  coordinatorAction, landOperationAction, proofOperationAction
} from "./advance-actions.mjs";

const THROUGH_ORDER = ["build", "proven", "archived"];

export function createAdvanceRuntime({
  inspectSnapshots,
  loadRuntime, agentDispatchValue, relevantHash, deliveredAiAttempts,
  authorityStatusValue, authorityNext, readJson, proofAdvancePath, stableHash,
  proofReadinessValue, agentPlanValue,
  nowMs = Date.now,
  assertApproval,
  prepareBuild,
  // Harness-run operations. Without one, advance hands the agent the action
  // instead (inspection-only callers and focused tests).
  runProof = null, runLand = null,
  recoverReviewBindings,
  recoverWorkspace,
  recoverArchive,
  recoverSandbox = null, recoverApply = null, saveRuntime, proofIsCurrent = null,
  settleSessionLeases, issueSessionLease, reverifyCompletedTasks,
  // Resolves a change's packet directory; enables `contextFiles` on EDIT/REPAIR.
  changePath = null,
  // Harness-owned operations advance performs itself instead of handing the
  // agent a primitive: detected provider wiring and a configured reviewer.
  wireEvidence = null, runReview = null, synchronizeAgreement,
  authorizeLand,
  hasLandGrant,
  recordPhase, output = console.log,
  capture,
  captureAsync,
  markBlocked,
  // Authority the change already needs (signed CI, ...); asked with spec
  // approval so it never first surfaces at Build dispatch.
  pendingApprovalDecisions,
  // Writes the approval package and returns { path } or { error }; a failure
  // never changes the approval question.
  approvalPackageLink
}) {
  requireDeps("createAdvanceRuntime", {
    inspectSnapshots, authorityNext, proofReadinessValue, agentPlanValue, assertApproval,
    prepareBuild, recoverReviewBindings, recoverWorkspace, recoverArchive, saveRuntime,
    settleSessionLeases, issueSessionLease, reverifyCompletedTasks, synchronizeAgreement,
    authorizeLand, hasLandGrant, recordPhase, capture, captureAsync, markBlocked,
    pendingApprovalDecisions, approvalPackageLink
  });
  // Spec approval is the one Change-time question; known authority gates ride
  // along with it instead of stopping Build later.
  function failureAction(id, error, options) {
    if (error?.code !== "SPEC_APPROVAL_REQUIRED" || !error.decision)
      return advanceFailureAction(id, error, options);
    let alongside = [];
    alongside = bestEffort(() => pendingApprovalDecisions(id) || [], alongside);
    let link = null;
    link = bestEffort(() => approvalPackageLink(id), link);
    // The page is a file the prototype skill writes; the harness only names it.
    const pageName = link?.language === "th" ? "หน้าอนุมัติ" : "Approval page";
    const packageNote = link?.path
      ? ` ${pageName}: ${link.path}.${(link.warnings || []).map((line) => ` Warning: ${line}.`).join("")}`
      : link?.missing
        ? ` No ${pageName} yet; the prototype skill writes it.${
          link.summary?.length ? ` Summary: ${link.summary.join(" | ")}.` : ""}`
        : link?.error ? ` ${pageName} not checked (${link.error}); review the packet.` : "";
    if (!alongside.length && !packageNote) return advanceFailureAction(id, error, options);
    const summary = `${error.decision.summary}${packageNote}${alongside.length ? ` Ask in the same question, before Build: ${
      alongside.map((item) => `${item.summary} (${item.next})`).join("; ")}` : ""}`;
    return advanceFailureAction(id, Object.assign(error, {
      message: summary,
      decision: { ...error.decision, summary, ...(alongside.length ? { alongside } : {}),
        ...(link?.path ? { approvalPackage: link.path } : {}) }
    }), options);
  }

  const recovery = createAdvanceRecovery({
    loadRuntime, saveRuntime,
    // Failure recovery may run after captureAsync has unwound. Keep runtime
    // fail() calls throwable while reading the recovery binding there too.
    subject: (id) => capture(() => convergenceFingerprint(id)),
    now: () => new Date(nowMs()).toISOString()
  });

  function projected(value) {
    const result = lifecycleOutcome(actionableGuidance(value));
    return { ...result, userState: lifecycleUserState(result), user: lifecycleUserProjection(result) };
  }

  // Agents open only these files: the packet and the handed tasks' paths.
  function withContext(id, value) {
    if (!changePath || !value || !["EDIT", "REPAIR"].includes(value.action) || value.contextFiles)
      return value;
    try {
      return capture(() => {
        const tasks = value.tasks || [];
        const paths = tasks.length ? [] : value.allowedPaths || [];
        const scopedPaths = (value.repairGraph?.nodes || []).flatMap((node) => node.paths || []);
        const repairClaims = (value.repairGraph?.nodes || []).flatMap((node) => node.claimIds || []);
        const state = loadRuntime(id);
        // An EDIT names no skills: in every observed paid run agents skipped
        // routed skills, wherever the action put them. Agents choose skills
        // from the skills' own descriptions.
        const adequacy = value.action === "EDIT"
          ? testAdequacyInstruction({ workTypes: changeWorkTypes(changePath(id)), tasks }) : null;
        return { ...value, ...envelopeContextFiles({
          packetDir: changePath(id), state, tasks, paths, scopedPaths, repairClaims
        }), ...(adequacy ? { instructions: [...(value.instructions || []), adequacy] } : {}) };
      });
    } catch { return value; }
  }

  function pendingAction(id, through, pending) {
    return envelope(id, pending.paused ? "WAIT" : "ASK_USER", {
      legacyAction: pending.paused ? "PAUSED_BY_USER" : pending.legacyAction || "NO_PROGRESS_BOUNDARY",
      actor: pending.paused ? "harness" : "user",
      boundary: pending.paused ? "user-paused" : pending.boundary || "repeated-no-progress",
      decision: pending.decision,
      ...(pending.paused ? { paused: true, wait: {
        owner: "user", condition: "The user explicitly chooses to resume the preserved work."
      } } : {}),
      reason: pending.paused ? "Delivery is paused by the user; work and evidence are preserved."
        : pending.decision.summary,
      recoveryType: pending.paused ? "PAUSE" : "ASK_USER", resumeCommand: resume(id, through || pending.through)
    });
  }
  function readAdvanceValue(id, options = {}, automation = {}) {
    let stage = "build";
    try {
      return capture(() => {
        const state = loadRuntime(id);
        const legacy = legacyLandSagaAction(id, state);
        if (legacy) return legacy;
        assertApproval(id, state);
        if (state.status === "archived") return coordinatorAction({
          id, state, dispatch: { action: "build-complete" }, workspaceHash: null,
          stableHash
        });
        if (state.status === "proven") stage = "land";
        const authority = authorityStatusValue(id);
        // Plan once per read: dispatch and the Build action consume the same
        // compiled graph. A planning failure leaves dispatch to plan (and
        // report) exactly as before.
        let readPlan = null;
        try { readPlan = agentPlanValue(id, options); }
        catch { readPlan = null; }
        const dispatch = agentDispatchValue(id, options, readPlan);
        let proofPreflight = null;
        if (dispatch.action === "build-complete") {
          stage = "prove";
          proofPreflight = proofReadinessValue(id, "prove", options);
        }
        const openRequests = authority.requests || [];
        let plan = null;
        if (["run-in-session", "run-leased-in-session", "spawn-group"]
          .includes(dispatch.action)) {
          plan = bestEffort(() => readPlan || agentPlanValue(id, options), plan); // dispatch still carries an exact compatibility route
        }
        const workspaceHash = dispatch.action === "build-complete" && proofPreflight
          ? proofPreflight.workspaceHash : relevantHash(id);
        const proofCursor = readJson(proofAdvancePath(id), {});
        // The cursor this decision was read from; a proof run started from it
        // can tell a gate pass another process recorded in the meantime.
        if (automation) automation.proofCursorToken = proofCursorToken(proofCursor);
        return coordinatorAction({
          id,
          state,
          dispatch,
          workspaceHash,
          latestReview: currentWaivers(state, workspaceHash).some((row) => row.capability === "review")
            ? null : deliveredAiAttempts(id).at(-1) || null,
          proofCursor,
          authorityRequests: openRequests,
          proofPreflight,
          plan,
          proofIsCurrent: proofIsCurrent && state.status === "proven"
            ? proofIsCurrent(id) : null,
          authorityActions: authorityNext(id, openRequests[0]?.type || "review", openRequests),
          stableHash,
          automation
        });
      });
    } catch (error) {
      markBlocked(error?.message || String(error));
      return failureAction(id, error, { stage });
    }
  }

  function phaseForAction(value) {
    if (["REPAIR_PROVE_RUNTIME", "REPAIR_REVIEW_INFRASTRUCTURE"].includes(value.legacyAction)) return "prove";
    if (value.legacyAction === "REPAIR_LAND_RUNTIME") return "land";
    if (value.action === "EDIT" || value.action === "REPAIR") return "build";
    if (value.legacyAction === "LAND_READY" || value.reached === "archived") return "land";
    if (["RUN_PROOF", "RUN_INVALIDATED_EVIDENCE", "RUN_CONFIGURED_REVIEW", "WIRE_EVIDENCE",
      "WAIT_EXTERNAL", "REQUEST_DECISION"].includes(value.legacyAction)) return "prove";
    return null;
  }

  // A Land grant outlives a Prove rerun, so an in-progress Land journal stays
  // reusable. It short-circuits to Land only while the lifecycle is landable:
  // mid-apply, or proven on proof current for this workspace. A change sent
  // back to Build (root-pointer staging, target-edit or sandbox sync) re-proves
  // first instead of retrying a Land that its gate must refuse.
  function landableGrant(id) {
    if (!hasLandGrant(id)) return false;
    const status = loadRuntime(id).status;
    if (status === "applied") return true;
    return status === "proven" && (!proofIsCurrent || proofIsCurrent(id));
  }

  function reached(id, through) {
    const state = loadRuntime(id);
    if (state.status === "archived") return "archived";
    if (through === "proven" && state.status === "proven" &&
        (!proofIsCurrent || proofIsCurrent(id))) return "proven";
    return null;
  }

  // The latest AI review's advisory spec gaps ride on a proven or archived
  // result so the agent reports them; they never change the outcome.
  function reviewSpecGaps(id) {
    try {
      const gaps = deliveredAiAttempts(id).at(-1)?.specGaps;
      return Array.isArray(gaps) ? gaps : [];
    } catch { return []; }
  }

  function advisoryEvidenceRows(id) {
    try {
      const rows = loadRuntime(id).advisoryEvidence?.rows;
      return Array.isArray(rows) ? rows : [];
    } catch { return []; }
  }

  function inconclusiveDiscrimination(id) {
    try {
      const rows = loadRuntime(id).testDiscrimination?.inconclusive;
      return Array.isArray(rows) ? rows : [];
    } catch { return []; }
  }

  function done(id, stage) {
    const next = stage === "build" ? resume(id, "proven")
      : stage === "proven" ? resume(id, "archived") : null;
    const specGaps = stage === "build" ? [] : reviewSpecGaps(id);
    const advisory = stage === "build" ? [] : advisoryEvidenceRows(id);
    const inconclusive = stage === "build" ? [] : inconclusiveDiscrimination(id);
    return envelope(id, "DONE", {
      legacyAction: stage === "archived" ? "ARCHIVED" : "TARGET_REACHED",
      reason: `${stage} target reached`, completed: true, reached: stage,
      resumeCommand: null,
      ...(specGaps.length ? { reviewAdvisories: { specGaps } } : {}),
      // Reported for the user; advisory results never count as passing evidence.
      ...(advisory.length ? { advisoryEvidence: {
        passingEvidence: false, rows: advisory, summary: advisory.map(advisoryVisualLine)
      } } : {}),
      // Behavior-changing tests whose base run gave no verdict, named for the user.
      ...(inconclusive.length ? { testDiscrimination: {
        verdict: "none", rows: inconclusive, summary: inconclusive.map(inconclusiveLine)
      } } : {}),
      next
    });
  }

  function convergenceFingerprint(id) {
    const state = loadRuntime(id);
    const proof = readJson(proofAdvancePath(id), {});
    const repositoryState = Object.entries(state.repositories || {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([repository, value]) => [repository, {
        mode: value.mode || null,
        path: value.path || null,
        targetPath: value.targetPath || null,
        baseHead: value.baseHead || null,
        access: value.access || null,
        applied: value.applied === true,
        setupStatus: value.setup?.status || null,
        landCommit: value.land?.commit || null,
        landStatus: value.land?.status || null
      }]);
    return stableHash({
      workspaceHash: relevantHash(id),
      state: {
        status: state.status,
        contractRevision: state.contractRevision || 0,
        executionRevision: state.executionRevision || 0,
        approval: state.specApproval?.decisionRef || null,
        reviewContinuation: state.reviewWindow?.decisionRef || null,
        waivers: state.waivers || [],
        workspace: {
          mode: state.workspace?.mode || null,
          path: state.workspace?.path || null,
          baseHead: state.workspace?.baseHead || null,
          applied: state.workspace?.applied === true
        },
        repositories: repositoryState,
        applyStatus: state.apply?.status || state.applyTransaction?.status || null,
        landStatus: state.land?.status || null
      },
      proof: {
        status: proof.status || null,
        stage: proof.stage || null,
        completed: proof.completed === true,
        workspaceHash: proof.workspaceHash || null,
        route: proof.route || null,
        requestIds: [...(proof.requestIds || [])].sort(),
        providers: [...(proof.providers || [])].sort(),
        subjectHash: proof.subjectHash || null,
        recoveryDecisionRef: proof.recoveryDecisionRef || null,
        progressFingerprint: proof.progressFingerprint || null,
        repairPlanDigest: proof.repairPlanDigest || null,
        next: (proof.next || []).map((row) => ({
          kind: row.kind || null, command: row.command || null
        }))
      }
    });
  }

  // Review runs change authority state that the delivery fingerprint does not
  // bind; count them as progress only when a request actually moved.
  function reviewProgressFingerprint(id) {
    let requests = [];
    requests = bestEffort(() => authorityStatusValue(id).requests || [], requests); // unavailable
    return stableHash({
      delivery: convergenceFingerprint(id),
      requests: requests.map((row) => [row.requestId, row.status, row.dispatch?.attemptDigest || null])
    });
  }

  // An automated step that keeps completing without progress is handed to the
  // agent with what the step returned. Repeated rounds stay with the agent:
  // the recovery ladder changes strategy and never asks for code work.
  function noProgress(id, through, operation = null, result = null) {
    const name = operation?.legacyAction || "the automated step";
    const output = result && typeof result === "object"
      ? { issues: result.issues || null, next: result.next || null, reason: result.reason || null }
      : null;
    const observed = noProgressOutput(output);
    return projected(recovery.observe(id, withContext(id, envelope(id, "REPAIR", {
      legacyAction: "NO_PROGRESS_BOUNDARY", actor: "agent",
      boundary: "repeated-no-progress",
      reason: `The harness ran ${name} twice without changing delivery state`,
      details: output,
      step: { route: name, output: observed || null },
      instruction: `The harness ran ${name} twice and delivery state did not change. Its result: ${
          observed || "no issue, reason, or next step was reported"}. Fix what that result names ` +
        "inside the workspace (code, evidence wiring in execution.yaml, or declared setup in " +
        "foundation.json) so the step can change state, then run the resume command.",
      recoveryType: "HANDOFF",
      resumeCommand: resume(id, through)
    }))));
  }

  // An interrupted apply is settled by the harness under the Land route that
  // started it: `settle` finishes or reverses only bytes Land wrote, and
  // `keep-current` overwrites nothing (the kept target is then synchronized
  // and proved again through `recovery-sync-required`). Each resolution runs
  // at most once per invocation; if it cannot finish, the agent receives the
  // divergent paths and the transaction location, never the user.
  async function recoverInterruptedApply(id, through, value, internal) {
    const { resolution, divergentPaths = [] } = value.automaticRecovery;
    const notice = `Land kept an interrupted apply recoverable (${resolution})` +
      (divergentPaths.length ? `; the target held other content at: ${divergentPaths.join(", ")}` : "");
    recordSignal("apply-recovered", notice);
    const handoff = (reason) => projected(recovery.observe(id, withContext(id, envelope(id, "REPAIR", {
      actor: "agent", owner: "agent", legacyAction: "REPAIR_APPLY_RECOVERY",
      boundary: "internal-recovery", reason,
      details: { resolution, divergentPaths, transactions: value.decision?.transactions || [],
        transactionRoot: value.decision?.transactionRoot || null },
      instruction: "Automatic apply recovery could not finish. Compare the listed target paths " +
        "with the sandbox and the transaction backup, make each target path hold the intended " +
        "content without deleting anyone's work, then run the resume command.",
      recoveryType: "EDIT", resumeCommand: resume(id, through)
    }))));
    if (internal.applyRecovered.includes(resolution))
      return handoff(`The ${resolution} recovery already ran and the interrupted apply is still pending: ${value.reason}`);
    const next = { ...internal, applyRecovered: [...internal.applyRecovered, resolution],
      notices: [...internal.notices, notice] };
    try {
      await captureAsync(() => recoverApply(id, resolution));
    } catch (error) {
      // A settle that meets divergent content leaves a manual-recovery journal;
      // the next pass keeps the current target instead of stopping.
      if (resolution !== "settle") return handoff(`Automatic ${resolution} recovery failed: ${error.message}`);
    }
    const result = await advanceThrough(id, through, next);
    return { ...result, notices: [...new Set([...(result.notices || []), ...next.notices])] };
  }

  // The user's answer to a pending visual drift. Repair-more and accept
  // continue the same advance; amending the agreement is the agent's next edit.
  function visualDriftAnswer(id, answer, through) {
    const state = loadRuntime(id);
    if (answer.choice === "repair-more") {
      saveRuntime(grantVisualRepair(state, {
        decisionRef: answer.reference, now: new Date(nowMs()).toISOString()
      }));
      return null;
    }
    if (answer.choice === "accept") {
      recordVisualDriftWaiver({
        loadRuntime, saveRuntime, relevantHash,
        now: () => new Date(nowMs()).toISOString(),
        fail: (message) => { throw new Error(message); }
      }, id, { decisionRef: answer.reference, reason: answer.reason });
      return null;
    }
    if (answer.choice !== "amend-agreement") return null;
    return envelope(id, "EDIT", {
      legacyAction: "AMEND_AGREEMENT", actor: "agent", owner: "agent",
      boundary: "agreement-amendment",
      reason: "The user chose to amend the agreement so it matches the built UI. Author one " +
        "semantic amendment (prototype or requirements); visual evidence bound to the old " +
        "agreement is invalidated and checked again.",
      command: command(`change amend ${id} <amendment.json>`),
      decisionRef: answer.reference,
      recoveryType: "EDIT",
      resumeCommand: resume(id, through),
      alternatives: ["author the semantic amendment, then resume"]
    });
  }

  async function advanceThrough(id, through, internal = { applyRecovered: [], notices: [] }) {
    let stage = "build";
    const finish = async (value) => {
      if (value?.action === "EDIT") {
        try { value = capture(() => issueSessionLease(id, value)); }
        catch (error) { value = failureAction(id, error, { stage, through }); }
      }
      value = projected({ ...withContext(id, value), resume: resume(id, through) });
      try { value = projected(recovery.observe(id, value)); }
      catch (error) {
        // Recovery bookkeeping must not hide the original failure or turn a
        // corrupt/missing runtime into an uncaught exception loop. It is
        // harness bookkeeping, never a user decision: resume retries it.
        return envelope(id, "REPAIR", {
          actor: "harness", owner: "harness", legacyAction: "REPAIR_RECOVERY_STATE",
          boundary: "internal-recovery",
          reason: `${value.reason}; recovery state could not be retained: ${error.message}`,
          details: { original: value, error: error.message },
          command: resume(id, through),
          instruction: "The harness could not record recovery state; run the resume command to retry it.",
          recoveryType: "AUTO_RECOVER", resumeCommand: resume(id, through)
        });
      }
      if (value.action === "REPAIR" && value.automaticRecovery?.kind === "sandbox-sync" && recoverSandbox) {
        try {
          const result = await captureAsync(() => recoverSandbox(id));
          if (result?.conflicts?.length || result?.status === "CONFLICT")
            return projected(recovery.observe(id, withContext(id, envelope(id, "REPAIR", {
              actor: "agent", legacyAction: "REPAIR_SYNC_CONFLICT", boundary: "conflict",
              reason: "Sandbox synchronization found conflicting changes; choose the intended result before merging." +
                (result.conflicts?.some((row) => row?.landedBy) ? " Keep every earlier change's landed " +
                  "content; ask the user only if the two changes' intents contradict." : ""),
              details: result, recoveryType: "EDIT", resumeCommand: resume(id, through)
            }))));
          return advanceThrough(id, through, internal);
        } catch (error) {
          return projected(recovery.observe(id, failureAction(id, error, { stage, through })));
        }
      }
      if (value.action === "REPAIR" && value.automaticRecovery?.kind === "apply-recovery" &&
          recoverApply && through === "archived")
        return recoverInterruptedApply(id, through, value, internal);
      return value;
    };
    let recordedPhase = null;
    const recordActivePhase = (phase) => {
      if (phase && phase !== recordedPhase) {
        recordPhase(id, phase);
        recordedPhase = phase;
      }
    };
    // A Land that stopped before applying leaves the change proven. The
    // session's phase follows the lifecycle, so the main checkout is not held
    // under Land rules while the stop waits; mid-apply keeps Land for recovery.
    const releaseStoppedLand = (value) => {
      if (recordedPhase === "land" && value?.reached !== "archived") {
        bestEffort(() => { if (loadRuntime(id).status === "proven") recordActivePhase("prove"); });
      }
      return value;
    };
    try {
      return releaseStoppedLand(await captureAsync(async () => {
        if (through && !["build", "proven", "archived"].includes(through))
          throw new Error("advance --through must be build|proven|archived");
        let initial = loadRuntime(id);
        const legacy = legacyLandSagaAction(id, initial, through);
        if (legacy) return legacy;
        // Remember the furthest target asked for, so a route printed later
        // (next:, resume hints) continues toward it instead of repeating a
        // shorter one. Monotonic; Land authority is still its own grant.
        if (through && initial.status !== "archived" &&
            (THROUGH_ORDER.indexOf(through) > THROUGH_ORDER.indexOf(initial.requestedThrough))) {
          initial.requestedThrough = through;
          saveRuntime(initial);
        }
        if (through === "archived") {
          if (["proven", "applied", "archived"].includes(initial.status)) stage = "land";
          if (initial.advanceRecovery?.pending?.paused)
            return pendingAction(id, through, initial.advanceRecovery.pending);
          if (await recoverArchive(id)) return done(id, "archived", through);
        }
        if (initial.status === "archived") return done(id, "archived", through);
        if (initial.workspace?.amendmentReplay) {
          if (initial.advanceRecovery?.pending?.paused)
            return pendingAction(id, through, initial.advanceRecovery.pending);
          // Approval belongs to the packet retained in replay staging. Restore
          // verified bytes before checking it; never grant or refresh approval.
          await recoverWorkspace(id);
          initial = loadRuntime(id);
        }
        const explicitLand = through === "archived" && landableGrant(id);
        if (!explicitLand) assertApproval(id, initial, { workspace: false });
        const pending = recovery.pending(id);
        if (pending && (pending.paused || pending.decision.kind !== "external-dependency"))
          return pendingAction(id, through, pending);
        // A recorded user answer to an advance-owned decision is consumed
        // once, by the step that raised it: the agreement resolution by the
        // synchronization, the indeterminate retry by the next proof run.
        const answer = internal.answer;
        if (answer) delete internal.answer;
        if (answer?.kind === "visual-drift") {
          const routed = visualDriftAnswer(id, answer, through);
          if (routed) return finish(withContext(id, routed));
        }
        if (answer?.kind === "amended-agreement-conflict" && answer.choice !== "pause")
          await synchronizeAgreement(id, { resolve: `openspec/changes/${id}` });
        // An answer to a no-progress decision other than pause resumes the
        // gate as a first observation, so it returns repair work, not the
        // same question.
        const proofFlags = answer?.kind === "indeterminate-execution" && answer.choice === "retry"
          ? { "retry-indeterminate": true, "decision-ref": answer.reference }
          : answer?.kind === "repair-no-progress" && answer.choice !== "pause"
            ? { "reset-progress": true, "decision-ref": answer.reference } : null;
        // Preparation is identity-reused and also owns recovery of failed
        // sandbox setup. Re-enter it while Build is active so a prior setup
        // failure cannot be bypassed by the next coordinator invocation.
        if (!explicitLand && ["change", "building"].includes(initial.status)) {
          recordActivePhase("build");
          await prepareBuild(id);
        }
        // Resuming after a session task is its completion signal: release the
        // harness-issued lease and record the task before dispatching again.
        if (!explicitLand && loadRuntime(id).status === "building")
          capture(() => settleSessionLeases(id));
        // Implemented tasks whose execution record went stale are re-verified
        // by the harness, never handed back as work to redo or diffs to split.
        if (!explicitLand && loadRuntime(id).status === "building")
          capture(() => reverifyCompletedTasks(id));
        // Build preparation already synchronizes a revised agreement. After
        // proof, the same safe sync replaces an operator `sandbox sync`: it
        // invalidates only evidence the revision touched, and Land would
        // otherwise refuse the edited packet.
        if (loadRuntime(id).status === "proven")
          await synchronizeAgreement(id);
        if (!through) return finish(readAdvanceValue(id));
        const targetResume = (value) => ({
          ...value,
          resume: resume(id, through)
        });
        let unchangedAutomations = 0;
        const automation = { wiringAttempted: false };
        while (true) {
          const completed = reached(id, through);
          if (completed) return done(id, completed, through);
          let value = through === "archived" && landableGrant(id)
            ? { action: "WORKING", legacyAction: "LAND_READY", actor: "harness",
              reason: "explicit Land authority accepts the current assurance" }
            : readAdvanceValue(id, {}, automation);
          if (through !== "build" && value.legacyAction === "REPAIR_REVIEW_INFRASTRUCTURE") {
            stage = "prove";
            recordActivePhase("prove");
            if (await recoverReviewBindings(id)) value = readAdvanceValue(id, {}, automation);
          }
          if (through === "build" && ["RUN_PROOF", "WIRE_EVIDENCE", "LAND_READY"].includes(value.legacyAction)) {
            recordActivePhase("build");
            return done(id, "build", through);
          }
          const phase = phaseForAction(value);
          recordActivePhase(phase);
          let operation = null;
          let harnessOwned = false;
          if (value.legacyAction === "WIRE_EVIDENCE" && value.automaticWiring &&
              ["proven", "archived"].includes(through) && wireEvidence) {
            // Once per invocation: wiring that did not clear the gap falls
            // back to the external-evidence decision instead of repeating.
            stage = "prove";
            automation.wiringAttempted = true;
            harnessOwned = true;
            operation = (change) => wireEvidence(change, value.automaticWiring);
          } else if (value.legacyAction === "RUN_CONFIGURED_REVIEW" && value.automaticReview &&
              ["proven", "archived"].includes(through) && runReview) {
            // Foreground and bounded by the review window, like `authority run`.
            stage = "prove";
            harnessOwned = true;
            operation = (change) => runReview(change, value.automaticReview);
          } else if (["RUN_PROOF", "RUN_INVALIDATED_EVIDENCE"].includes(value.legacyAction) &&
              ["proven", "archived"].includes(through)) {
            if (!runProof) return finish(targetResume(value));
            stage = "prove";
            const answered = proofFlags && !automation.proofFlagsUsed ? proofFlags : null;
            if (answered) automation.proofFlagsUsed = true;
            const flags = { ...(answered || {}),
              ...(typeof automation.proofCursorToken === "string"
                ? { "cursor-token": automation.proofCursorToken } : {}) };
            operation = Object.keys(flags).length ? (change) => runProof(change, flags) : runProof;
          } else if (value.legacyAction === "LAND_READY" && through === "archived") {
            // The explicit archived target authorizes Land only once the exact
            // proof is ready. Earlier phases and inspection grant nothing.
            if (!explicitLand && !hasLandGrant(id)) await authorizeLand(id);
            if (!explicitLand && !hasLandGrant(id)) return finish(targetResume(value));
            if (!runLand) return finish(targetResume(value));
            stage = "land";
            operation = runLand;
          }
          if (!operation) return finish(targetResume(value));
          const fingerprint = harnessOwned ? reviewProgressFingerprint : convergenceFingerprint;
          const before = fingerprint(id);
          const operationResult = await operation(id);
          // Archive may remove the sandbox and active agreement. Do not hash
          // those retired paths after the authoritative lifecycle reached its
          // target; the archived proof already retains its durable identity.
          const completedAfterOperation = reached(id, through);
          if (completedAfterOperation) return done(id, completedAfterOperation, through);
          // An operation is the authoritative source for its own boundary.
          // Consume it before consulting projections, otherwise quiet proof or
          // Land composition can discard a decision and repeat the operation.
          // Wiring and review results are consumed by the next proof pass.
          const boundaryResult = harnessOwned ? null : stage === "land"
            ? landOperationAction(id, operationResult)
            : proofOperationAction(id, operationResult);
          // A reviewer the harness can run is consumed by the next pass.
          const reviewNext = boundaryResult?.automaticReview && runReview;
          if (boundaryResult && boundaryResult.legacyAction !== "LAND_IN_PROGRESS" && !reviewNext)
            return finish(targetResume(boundaryResult));
          const after = fingerprint(id);
          unchangedAutomations = before === after ? unchangedAutomations + 1 : 0;
          if (unchangedAutomations >= 2) return noProgress(id, through, value, operationResult);
        }
      }));
    } catch (error) {
      markBlocked(error?.message || String(error));
      return releaseStoppedLand(await finish(failureAction(id, error, { stage, through })));
    }
  }

  function advanceValue(id, options = {}) {
    const read = () => {
      const value = withContext(id, readAdvanceValue(id, options));
      // The original diagnostic already describes unavailable state.
      const pendingValue = bestEffort(() => {
        const pending = recovery.pending(id);
        return pending ? pendingAction(id, null, pending) : null;
      }, null);
      if (pendingValue) return pendingValue;
      return value;
    };
    return options.inspect ? inspectSnapshots(read) : read();
  }

  async function showAdvance(id, flags = {}) {
    if (flags.inspect && (flags.through || flags.decision || flags["decision-ref"] || flags["decision-fingerprint"] || flags.reason))
      throw new Error("advance --inspect cannot execute --through; inspect first, then advance");
    let through = flags.through || null;
    let answer = null;
    if (flags.decision) {
      answer = recovery.resolve(id, flags);
      through ||= answer.through;
    }
    const value = withSignals(flags.inspect ? advanceValue(id, { inspect: true })
      : await advanceThrough(id, through, { applyRecovered: [], notices: [], answer }));
    if (!flags.through && !flags.inspect &&
        process.env.FOUNDATION_READ_ONLY_INSPECTION !== "1") {
      const phase = phaseForAction(value);
      if (phase) recordPhase(id, phase);
    }
    output(JSON.stringify(value, null, flags.pretty ? 2 : 0));
    return value;
  }

  return { advanceValue, advanceThrough, showAdvance };
}
export async function prepareAdvanceBuild(context, id) {
  return context.measureAsync("build.prepare", () => context.runQuietly(async () => {
    context.prepareBuildSandbox(id);
    context.prepareExecution(id, { stage: "build" });
  }));
}

// Only the `advance --through proven|archived` route runs a harness-runnable
// configured review beside the executable providers; `proof advance` stays
// serial.
export async function runAdvanceProof(context, id, flags = null) {
  return context.measureAsync("prove.execute", () =>
    context.runQuietly(() => {
      // Prove validates the agreement with the strict OpenSpec lint, so a
      // resumed Prove re-prepares the tool Build prepared, like Land does.
      context.prepareExecution(id, { stage: "prove" });
      // `flags` carries only a recorded user answer to an indeterminate run.
      return context.proofAdvance(id, { ...(flags || {}), quiet: true, concurrentReview: true });
    }));
}

export function hasValidLandGrant(landGrantRuntime, id) {
  return landGrantRuntime.valid(id).valid;
}
