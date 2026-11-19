import { repairActionForWorkspace } from "../../evidence/repair-runtime.mjs";
import { isProcessAlive } from "../../core/process-lock.mjs";
import { shellDisplayArgument } from "../../core/shell-mutation-policy.mjs";
import { automaticEvidenceWiring, automaticReviewRun } from "./advance-recovery.mjs";
import {
  advanceFailureAction, command, compactPreflight, compactRepairGraph, envelope,
  repositoryWorkspace, resume, taskCheckCommand, taskVerification
} from "./advance-envelope.mjs";

// The proof run for this pass: the flags a recorded answer carries (used once
// per invocation) and the cursor a quiet proof left for its next run.
export function proofRunOperation(runProof, proofFlags, automation) {
  const answered = proofFlags && !automation.proofFlagsUsed ? proofFlags : null;
  if (answered) automation.proofFlagsUsed = true;
  const cursor = typeof automation.proofCursorToken === "string"
    ? { "cursor-token": automation.proofCursorToken } : {};
  const flags = { ...(answered || {}), ...cursor };
  return Object.keys(flags).length ? (change) => runProof(change, flags) : runProof;
}

// An exhausted request keeps replaying until its consumed attempts are
// acknowledged; name the supported command so nobody moves request files.
export function reviewInfrastructureAlternatives(id) {
  return [
    "repair or switch the configured reviewer named in requests[] (see its infrastructureError)",
    `then acknowledge the consumed attempts with the user's decision: ${command(
      `authority reset-infra ${id} --decision-ref <user-decision>`)}`,
    `then resume: ${resume(id, "proven")}`
  ];
}

// Review advisories are report-only: acting on one edits the proven workspace,
// which starts a new review wave and can exhaust the bounded AI reviews.
export const ADVISORY_HANDLING = "report-only: tell the user and stop at the reached target; do not edit code or " +
  "tests for an advisory, because any edit re-opens proof and review. Closing one is a semantic amendment the user decides.";

// A requested review no configured reviewer can start waits on a person; say
// so, rather than look like a reviewer that is still working.
export function unstartableReviewReason(id, requestId) {
  return `no configured reviewer can start review request ${requestId}: bounded AI review is ` +
    "unavailable or exhausted, so an external verdict is pending. Configure a reviewer, or " +
    `record an authorized external verdict; inspect: ${command(
      `authority status ${id} --request ${requestId}`)}`;
}

// Every routed AI wave is delivered and review is still required: only the
// user can choose who reviews next. Review is never waived here.
export function exhaustedReviewDecision(id, requestId, exhausted = {}) {
  const waves = `${exhausted.delivered ?? "?"}/${exhausted.maxAiAttempts ?? "?"}`;
  const summary = `All ${waves} AI review waves are delivered and review request ${requestId} ` +
    "still needs a verdict. Choose a human verdict, one more AI wave, or a pause.";
  return envelope(id, "ASK_USER", {
    legacyAction: "DECIDE_EXHAUSTED_REVIEW",
    actor: "user",
    boundary: "user-authority",
    reason: summary,
    requestId,
    decision: {
      kind: "review-exhausted",
      summary,
      requestId,
      aiWaves: exhausted,
      options: [
        { id: "human-verdict",
          outcome: "A person reviews the change; dispatch a human review, then record the verdict they gave.",
          command: command(`authority dispatch ${id} --request ${requestId} --scope full --reviewer-type human --reviewer-identity <person>`),
          then: command(`authority record ${id} --request ${requestId} --response <file>`) },
        { id: "one-more-ai-attempt",
          outcome: "Allow one more AI review wave on the user's recorded decision; advance then runs it.",
          command: command(`authority extend-review ${id} --decision-ref <user-decision>`) },
        { id: "pause",
          outcome: "Keep the change proven-pending with its state preserved; resume later.",
          command: null }
      ],
      recommended: "human-verdict"
    },
    recoveryType: "ASK_USER",
    alternatives: ["record a human verdict", "allow one more AI review wave", "pause"]
  });
}

// A configured reviewer the harness can start with no host-supplied input runs
// inside `advance --through`, in the foreground and bounded by the review
// window. A route with placeholders stays a handoff.
function configuredReviewAutomation(id, commandText) {
  const automaticReview = automaticReviewRun(id, commandText);
  return automaticReview ? { automaticReview, automatic: true } : {};
}

function configuredReviewWait(id, request) {
  const controller = request?.configuredController;
  if (request?.status !== "dispatched" || (!controller && !request.configuredResult)) return null;
  const live = isProcessAlive(Number(controller?.pid));
  const subject = request.configuredResult?.subject || controller?.subject;
  const subjectFlags = [
    ["subject-actor", subject?.subjectActor],
    ["subject-session", subject?.subjectSession],
    ["subject-provider-family", subject?.subjectProvider],
    ["subject-model-family", subject?.subjectFamily],
    ["subject-model", subject?.subjectModel]
  ].filter(([, value]) => value).map(([flag, value]) => `--${flag} ${shellDisplayArgument(value)}`);
  // Old controller records did not retain provenance. The host must supply its
  // original implementer identity, never silently downgrade an AI subject.
  if (!subject?.subjectActor) subjectFlags.unshift("--subject-actor <original-implementer>");
  const runCommand = command(`authority run ${id} --request ${request.requestId} ${subjectFlags.join(" ")}`);
  const automaticReview = live ? null : automaticReviewRun(id, runCommand);
  return envelope(id, live ? "WAIT" : "RUN_EXTERNAL", {
    actor: live ? "harness" : "configured-reviewer",
    legacyAction: live ? "WAIT_CONFIGURED_REVIEW" : "RUN_CONFIGURED_REVIEW",
    boundary: "resource",
    reason: live ? "The authorized configured reviewer is still running."
      : "Resume the stopped reviewer through bounded authority recovery; reuse a valid checkpoint before starting another attempt.",
    requestId: request.requestId,
    ...(!live && !subject?.subjectActor ? { requiredContext: "original implementation subject provenance" } : {}),
    command: live ? command(`authority status ${id} --request ${request.requestId}`) : runCommand,
    ...(automaticReview ? { automaticReview, automatic: true } : {}),
    wait: live ? { owner: controller.reviewer || "configured-reviewer",
      condition: `Review request ${request.requestId} returns its verdict.`, pid: controller.pid } : null,
    recoveryType: live ? "PAUSE" : "HANDOFF"
  });
}

export function proofOperationAction(id, result) {
  if (!result || typeof result !== "object") return null;
  if (result.action) return result;
  if (result.decision && (result.status === "BLOCKED" || result.decision.automaticRecovery))
    return advanceFailureAction(id, { message: result.decision.summary, decision: result.decision }, { stage: "prove" });
  if (["PASS", "READY"].includes(result.status) || result.completed === true) return null;
  // A lock whose owner cannot be read yet (released between the failed
  // acquire and the read, or still initializing) is a hand-over, not a dead
  // worker: report it as working instead of a repair that counts as no progress.
  if (result.status === "IN_PROGRESS" && result.owner && !isProcessAlive(Number(result.owner.pid)) &&
      !(result.owner.state === "initializing" && Date.parse(result.owner.recoverableAfter) > Date.now()))
    return envelope(id, "REPAIR", {
      actor: "harness", legacyAction: "REPAIR_PROOF_LOCK", boundary: "internal-lock",
      reason: "The reported proof worker is no longer live; inspect and recover its lock before resuming.",
      command: command(`doctor --stage prove --change ${id}`), recoveryType: "RECONFIGURE"
    });
  if (result.status === "IN_PROGRESS") return envelope(id, "WORKING", {
    legacyAction: "PROOF_IN_PROGRESS",
    actor: "harness",
    boundary: "internal-lock",
    reason: "proof is already running for this change",
    wait: { owner: result.owner || null, next: result.next || [],
      ...(result.progress ? { progress: result.progress } : {}) },
    recoveryType: "AUTO_RECOVER",
    alternatives: ["reuse the active proof operation"]
  });
  if (result.status === "WAITING_EXTERNAL" &&
      (result.requests || []).some((request) =>
        request.status === "infrastructure-exhausted"))
    return envelope(id, "REPAIR", {
      legacyAction: "REPAIR_REVIEW_INFRASTRUCTURE",
      actor: "harness",
      boundary: "resource",
      reason: result.next?.[0]?.reason ||
        "configured review infrastructure is exhausted",
      requests: result.requests || [],
      next: result.next || [],
      recoveryType: "RECONFIGURE",
      alternatives: reviewInfrastructureAlternatives(id)
    });
  if (result.status === "WAITING_EXTERNAL") {
    const running = (result.requests || []).map((row) => configuredReviewWait(id, row)).find(Boolean);
    if (running) return running;
    const review = (result.requests || []).find((request) =>
      request.type === "review" && request.status === "requested");
    const next = review && (result.next || []).find((row) =>
      row.requestId === review.requestId &&
      /^cloop authority run\s/.test(row.command || ""));
    if (next) return envelope(id, "RUN_EXTERNAL", {
      legacyAction: "RUN_CONFIGURED_REVIEW",
      actor: "configured-reviewer",
      boundary: "external-authority",
      reason: "configured review is ready",
      requestId: review.requestId,
      command: next.command,
      ...configuredReviewAutomation(id, next.command),
      recoveryType: "HANDOFF",
      alternatives: ["run the configured reviewer", "record an authorized external verdict"]
    });
    const exhausted = review && (result.next || []).find((row) =>
      row.requestId === review.requestId && row.aiReviewExhausted);
    if (exhausted)
      return exhaustedReviewDecision(id, review.requestId, exhausted.aiReviewExhausted);
    return envelope(id, "WAIT", {
      legacyAction: "WAIT_EXTERNAL",
      actor: "external-authority",
      boundary: "external-authority",
      reason: review ? unstartableReviewReason(id, review.requestId)
        : result.next?.[0]?.reason || "required external evidence is pending",
      requests: result.requests || [],
      providers: result.providers || [],
      wait: result.wait || null,
      next: result.next || [],
      recoveryType: "PAUSE",
      alternatives: (result.next || []).map((row) => row.reason).filter(Boolean)
    });
  }
  if (result.status === "NEEDS_USER_DECISION" ||
      ["CONTRACT_DECISION_REQUIRED", "NO_PROGRESS_DECISION"].includes(result.route))
    return envelope(id, "ASK_USER", {
      legacyAction: "REQUEST_DECISION",
      actor: "user",
      boundary: "user-authority",
      reason: result.decision?.summary || result.next?.[0]?.reason ||
        "proof reached a material work decision",
      decision: result.decision || {
        kind: "work-decision",
        summary: result.next?.[0]?.reason || "A work decision is required",
        options: []
      },
      next: result.next || [],
      ...(result.next?.find((row) => row.kind === "contract-decision")?.command
        ? { command: result.next.find((row) => row.kind === "contract-decision").command }
        : {}),
      recoveryType: "ASK_USER",
      alternatives: result.decision?.options?.map((option) => option.outcome) || []
    });
  // A provider reserved but never proved its receipt. Whether to run it again
  // is the user's external side-effect decision, answered through `advance`.
  if (result.stage === "execution-indeterminate") return envelope(id, "ASK_USER", {
    legacyAction: "DECIDE_INDETERMINATE_EXECUTION", actor: "user",
    boundary: "external-side-effect",
    reason: result.next?.[0]?.reason ||
      "A provider execution stopped before proving its receipt.",
    decision: {
      kind: "indeterminate-execution",
      summary: `${result.next?.[0]?.reason || "A provider execution stopped before proving its receipt."} ` +
        `Providers: ${(result.providers || []).join(", ") || "unknown"}.`,
      providers: result.providers || [],
      options: [
        { id: "retry", outcome: "The interrupted run's side effects were inspected; run the providers again." },
        { id: "pause", outcome: "Keep the reservation and pause until the side effects are inspected." }
      ],
      recommended: "retry"
    },
    recoveryType: "ASK_USER"
  });
  if (result.status === "ACTION_REQUIRED" || result.status === "BLOCKED")
    return envelope(id, "REPAIR", {
      legacyAction: "REPAIR_PROOF_RESULT",
      actor: "agent",
      boundary: "host-execution",
      reason: result.next?.[0]?.reason || result.issues?.[0] ||
        "proof found work that must be repaired",
      route: result.route || null,
      decision: result.decision || null,
      repairPlan: result.repairPlan || null,
      repairGraph: compactRepairGraph(result.repairGraph),
      invalidation: result.invalidation || null,
      next: result.next || [],
      recoveryType: "EDIT",
      alternatives: ["repair the dependency-ordered finding batch"]
    });
  return null;
}

export function landOperationAction(id, result) {
  if (!result || typeof result !== "object") return null;
  if (result.action) return result;
  if (result.decision?.automaticRecovery)
    return advanceFailureAction(id, { message: result.decision.summary, decision: result.decision }, { stage: "land" });
  if (["ARCHIVED", "PASS"].includes(result.status) || result.archived === true) return null;
  if (result.status === "BLOCKED" && result.decision) return envelope(id, "ASK_USER", {
    legacyAction: "REQUEST_LAND_DECISION",
    actor: "user",
    boundary: "user-authority",
    reason: result.decision.summary || "Land requires a work decision",
    decision: result.decision,
    recoveryType: "ASK_USER",
    alternatives: result.decision.options?.map((option) => option.outcome) || []
  });
  if (["WAITING_EXTERNAL", "PENDING_EXTERNAL"].includes(result.status))
    return envelope(id, "WAIT", {
      legacyAction: "WAIT_LAND_EXTERNAL",
      actor: "external-authority",
      boundary: "external-authority",
      reason: result.reason || "an external delivery dependency is pending",
      wait: result.wait || null,
      repositories: result.repositories || [],
      recoveryType: "PAUSE",
      alternatives: result.alternatives || []
    });
  if (["IN_PROGRESS", "READY", "PENDING"].includes(result.status))
    return envelope(id, "WORKING", {
      legacyAction: "LAND_IN_PROGRESS",
      actor: "harness",
      boundary: "internal-transaction",
      reason: result.reason || "Land has a resumable internal transaction",
      repositories: result.repositories || [],
      recoveryType: "AUTO_RECOVER",
      alternatives: ["resume the same Land transaction"]
    });
  return null;
}

function selectedBuildTasks(id, dispatch, plan) {
  const ids = dispatch.action === "spawn-group"
    ? (dispatch.workers || []).map((worker) => worker.taskId)
    : dispatch.task?.taskId ? [dispatch.task.taskId]
      // A session plan hands every pending task at once, in dependency order;
      // the next advance verifies and ticks each one.
      : (plan?.groups?.flat() || plan?.tasks?.slice(0, 1).map((task) => task.id) || []);
  return ids.map((id) => plan?.tasks?.find((task) => task.id === id))
    .filter(Boolean).map((task) => {
      const verify = taskVerification(task.text);
      const checkCommand = taskCheckCommand(id, task.id, verify);
      return {
        id: task.id,
        instruction: task.text,
        repository: task.repository,
        allowedPaths: task.paths || [],
        verification: [verify].filter(Boolean),
        ...(checkCommand ? { checkCommand } : {})
      };
    });
}

// Finished tasks the handed work builds on: every completed task it depends
// on, transitively, and any completed task in another repository. Each names
// the workspace that holds its output, so a task in one repository never reads
// another repository's finished work as missing.
function completedTaskContext(state, plan, tasks) {
  const nodes = (plan?.graph?.nodes || []).filter((node) => node.kind === "task" &&
    String(node.id).startsWith("task:"));
  if (!nodes.length) return [];
  const taskId = (node) => String(node.id).slice("task:".length);
  const byId = new Map(nodes.map((node) => [taskId(node), node]));
  const pending = new Set((plan.tasks || []).map((task) => task.id));
  const repositories = new Set(tasks.map((task) => task.repository));
  const needed = new Set();
  const visit = (id) => {
    for (const dependency of (byId.get(id)?.dependsOn || [])
      .filter((value) => String(value).startsWith("task:")).map((value) => value.slice(5))) {
      if (needed.has(dependency)) continue;
      needed.add(dependency);
      visit(dependency);
    }
  };
  tasks.forEach((task) => visit(task.id));
  return nodes.map((node) => [taskId(node), node])
    .filter(([id, node]) => !pending.has(id) &&
      (needed.has(id) || !repositories.has(node.repository || "root")))
    .slice(0, 20)
    .map(([id, node]) => ({
      id, repository: node.repository || "root",
      workspace: repositoryWorkspace(state, node.repository || "root")
    }));
}

function buildAction(id, dispatch, state, plan = null) {
  if (dispatch.action === "build-complete") return null;
  if (["run-in-session", "run-leased-in-session", "spawn-group"].includes(dispatch.action)) {
    const tasks = selectedBuildTasks(id, dispatch, plan);
    if (!plan || tasks.length === 0 || tasks.some((task) =>
      !task.id || task.allowedPaths.length === 0)) return envelope(id, "REPAIR", {
      legacyAction: "REPAIR_BUILD_PLAN",
      actor: "harness",
      boundary: "contract",
      reason: "the compiled Build plan is missing executable task or path scope",
      recoveryType: "AUTO_RECOVER",
      alternatives: ["regenerate the compiled task graph from the current agreement"]
    });
    // A task listed here is already implemented; only its execution record is
    // stale and the harness could not re-verify it (its check failed, a worker
    // still holds it, or a dependency is unverified). Say so, so the agent
    // repairs that instead of redoing the work or splitting diffs per task.
    const reverification = (plan.verification || [])
      .filter((row) => tasks.some((task) => task.id === row.taskId));
    const instructions = [
      ...(dispatch.action === "run-in-session" ? [
        tasks.length > 1
          ? `Implement ${tasks.map((task) => task.id).join(", ")} in this order inside the workspace.`
          : `Implement ${tasks[0].id} inside the workspace.`,
        "Then run the resume command once: advance runs every task's verify check, marks each " +
        "passing task [x], and hands back only failures with their output; run a task's " +
        "checkCommand (present only where it has a verify) just to diagnose one."
      ] : []),
      ...reverification.map((row) =>
        `${row.taskId} is already implemented; its execution record is stale (${row.reason}). ` +
        "Do not re-implement it or split the diff per task: make its checkCommand pass, " +
        "then resume and the harness re-verifies it.")
    ];
    // One location per task repository: each task names its own sandbox, and
    // the top-level workspace is that sandbox whenever every task shares it.
    const located = tasks.map((task) => ({
      ...task, workspace: repositoryWorkspace(state, task.repository)
    }));
    const workspaces = Object.fromEntries(located
      .filter((task) => task.repository && task.workspace)
      .map((task) => [task.repository, task.workspace]));
    const locations = [...new Set(located.map((task) => task.workspace))];
    const completed = completedTaskContext(state, plan, tasks);
    if (completed.length) instructions.push(
      `Already complete and verified: ${completed.map((task) =>
        `${task.id} (${task.repository})`).join(", ")}. Build on that work where its ` +
      "workspace holds it; do not re-implement it.");
    return envelope(id, "EDIT", {
      legacyAction: dispatch.action === "spawn-group" ? "EXECUTE_TASK_GROUP" : "EXECUTE_TASK",
      actor: "agent",
      boundary: "host-execution",
      reason: dispatch.reason,
      workspace: locations.length === 1 && locations[0]
        ? locations[0] : state.workspace?.path || null,
      ...(Object.keys(workspaces).length ? { workspaces } : {}),
      tasks: located,
      allowedPaths: [...new Set(tasks.flatMap((task) => task.allowedPaths))],
      verification: [...new Set(tasks.flatMap((task) => task.verification))],
      execution: {
        mode: dispatch.action === "spawn-group" ? "parallel" : "session",
        leases: dispatch.action === "spawn-group" ? dispatch.workers :
          dispatch.task ? [dispatch.task] : []
      },
      ...(reverification.length ? { reverification } : {}),
      ...(completed.length ? { completed } : {}),
      ...(instructions.length ? { instructions } : {}),
      recoveryType: "EDIT",
      alternatives: ["amend the agreement if Build discovers new behavior"]
    });
  }
  // Another active change holding a shared resource queues this one: the
  // harness waits for the holder and resumes; no repair and no question.
  if (dispatch.action === "wait" && dispatch.waitKind === "cross-change-resource")
    return envelope(id, "WAIT", {
      legacyAction: "WAIT_RESOURCE", actor: "harness", boundary: "resource",
      reason: dispatch.reason,
      resourceWaits: dispatch.resourceWaits || [],
      wait: { owner: "harness", kind: "cross-change-resource",
        holders: dispatch.holders || [], resources: (dispatch.resourceWaits || []).map((row) => row.key),
        condition: `The shared resource is released when ${(dispatch.holders || []).join(", ") ||
          "the holding change"} lands, is archived, or is abandoned.`,
        checkCommand: resume(id) },
      recoveryType: "PAUSE",
      alternatives: ["wait for the holding change to land or be abandoned"]
    });
  if (dispatch.action === "wait") return envelope(id, "WAIT", {
    legacyAction: "WAIT_RESOURCE", actor: "harness", boundary: "resource",
    reason: dispatch.reason, wait: { workers: dispatch.activeWorkers || [] },
    recoveryType: "PAUSE",
    alternatives: ["wait for the active lease", "release an abandoned lease after inspection"]
  });
  return envelope(id, "REPAIR", {
    legacyAction: "REPAIR_BUILD_PLAN", actor: "agent",
    boundary: "contract",
    reason: dispatch.reason || "the Build graph is not dispatchable",
    findings: dispatch.reasons || null,
    command: dispatch.nextCommand,
    ...(dispatch.reasons?.preview?.length ? {
      instruction: `Resolve this change's plan blockers: ${dispatch.reasons.preview.join("; ")}. ` +
        "Then run the resume command."
    } : {}),
    recoveryType: "RECONFIGURE",
    alternatives: ["repair the agreement or task graph", "inspect the Build diagnostic"]
  });
}

export function coordinatorAction({
  id, state, dispatch, workspaceHash, latestReview = null,
  proofCursor = /** @type {Record<string, any>} */ ({}), authorityRequests = [], stableHash, authorityActions = null,
  proofPreflight = null, plan = null, proofIsCurrent = null, automation = /** @type {Record<string, any>} */ ({})
}) {
  if (state.status === "archived") return envelope(id, "DONE", {
    legacyAction: "ARCHIVED", boundary: null, reason: "change is archived",
    completed: true, reached: "archived", resumeCommand: null
  });

  const pendingBuild = buildAction(id, dispatch, state, plan);
  if (pendingBuild) return pendingBuild;

  if (state.status === "proven" && proofIsCurrent === false)
    return envelope(id, "RUN_EXTERNAL", {
      legacyAction: "RUN_INVALIDATED_EVIDENCE", actor: "harness",
      reason: "The retained proof or required receipts are no longer current; refresh only invalidated evidence before delivery.",
      command: command(`proof advance ${id}`), automatic: true,
      recoveryType: "AUTO_RECOVER"
    });

  // A successful proof supersedes earlier review failures. Without this
  // ordering, the last failed AI attempt could keep routing a proven change
  // back into repair after deterministic closure had already passed.
  const proofCurrent = proofCursor.workspaceHash === workspaceHash &&
    (state.status === "proven" || proofCursor.status === "PASS");
  if (proofCurrent)
    return envelope(id, "ASK_USER", {
      legacyAction: "LAND_READY", actor: "user", 
      boundary: "land-authority",
      reason: "proof is current; explicit Land authority is required",
      command: resume(id, "archived"),
      forbidden: ["commit", "push", "publish", "open-pr", "waive"],
      recoveryType: "ASK_USER",
      alternatives: ["invoke /land to apply and archive", "leave the proven change pending"]
    });

  // A new request is evidence that invalidated checks have already advanced
  // far enough to need the configured authority. Prefer it over a stale
  // failure from the previous workspace.
  const open = authorityRequests.find((request) =>
    ["requested", "dispatched", "pending", "infrastructure-exhausted"]
      .includes(request.status));
  if (open) {
    const running = configuredReviewWait(id, open);
    if (running) return running;
    const authorityAction = authorityActions?.find((entry) => entry.requestId === open.requestId);
    const authorityCommand = authorityAction?.command || null;
    // A requested review is executable only while the authority router still
    // offers `authority run`. Once the bounded AI circuit is exhausted it
    // deliberately offers the external response template instead. Treating
    // that template as configured work makes a host print it, resume, and
    // receive the same RUN_EXTERNAL action forever.
    if (open.status === "infrastructure-exhausted") return envelope(id, "REPAIR", {
      legacyAction: "REPAIR_REVIEW_INFRASTRUCTURE",
      actor: "harness",
      boundary: "resource",
      reason: open.infrastructureError ||
        "configured review infrastructure is exhausted",
      requestId: open.requestId,
      recoveryType: "RECONFIGURE",
      alternatives: reviewInfrastructureAlternatives(id)
    });
    const configuredReview = open.type === "review" && open.status === "requested" &&
      /^cloop authority run\s/.test(authorityCommand || "");
    if (open.type === "review" && open.status === "requested" &&
        authorityAction?.aiReviewExhausted)
      return exhaustedReviewDecision(id, open.requestId, authorityAction.aiReviewExhausted);
    return envelope(id, configuredReview ? "RUN_EXTERNAL" : "WAIT", {
      legacyAction: configuredReview ? "RUN_CONFIGURED_REVIEW" : "WAIT_EXTERNAL",
      actor: configuredReview ? "configured-reviewer" : "external-authority",
      boundary: "external-authority",
      reason: configuredReview ? "configured review is ready" :
        open.type === "review" && open.status === "requested"
          ? unstartableReviewReason(id, open.requestId)
          : "external authority is pending",
      requestId: open.requestId,
      command: authorityCommand || command(`authority status ${id} --request ${open.requestId}`),
      ...(configuredReview ? configuredReviewAutomation(id, authorityCommand) : {}),
      recoveryType: configuredReview ? "HANDOFF" : "PAUSE",
      alternatives: configuredReview
        ? ["run the configured reviewer", "record an authorized external verdict"]
        : ["wait for the requested verdict", "record the external verdict when available"]
    });
  }

  const repair = repairActionForWorkspace(latestReview, workspaceHash, stableHash);
  if (repair) return envelope(id,
    repair.action === "RUN_INVALIDATED_EVIDENCE" ? "RUN_EXTERNAL" : "REPAIR", {
    legacyAction: repair.action,
    actor: repair.action === "RUN_INVALIDATED_EVIDENCE" ? "harness" : "agent",
    boundary: repair.action === "EXECUTE_REPAIR_BATCH"
      ? "host-execution" : null,
    reason: repair.reason || "review findings require a bounded repair",
    repairGraph: compactRepairGraph(repair.repairGraph),
    command: repair.action === "RUN_INVALIDATED_EVIDENCE"
      ? command(`proof advance ${id}`) : null,
    recoveryType: repair.action === "RUN_INVALIDATED_EVIDENCE" ? "AUTO_RECOVER" : "EDIT",
    alternatives: repair.action === "RUN_INVALIDATED_EVIDENCE"
      ? ["rerun only invalidated evidence"] : ["apply the dependency-ordered repair batch"]
  });

  if (proofPreflight?.status !== "READY" && (proofCursor.status === "NEEDS_USER_DECISION" ||
      proofCursor.route === "CONTRACT_DECISION_REQUIRED" ||
      proofCursor.route === "NO_PROGRESS_DECISION")) return envelope(id, "ASK_USER", {
    legacyAction: "REQUEST_DECISION", actor: "user",
    boundary: "user-authority",
    reason: proofCursor.next?.find((row) => row.kind === "contract-decision")?.reason ||
      "proof reached a material decision boundary",
    decision: proofCursor.decision || null,
    ...(proofCursor.next?.find((row) => row.kind === "contract-decision")?.command
      ? { command: proofCursor.next.find((row) => row.kind === "contract-decision").command }
      : {}),
    recoveryType: "ASK_USER",
    alternatives: proofCursor.decision?.alternatives || []
  });

  if (proofPreflight && proofPreflight.status !== "READY") {
    const next = proofPreflight.next || [];
    const needsDecision = proofPreflight.status === "NEEDS_USER_DECISION";
    // Proof already owns request creation and reuse. A required review is
    // deterministic preparation, not permission to change review policy.
    if (needsDecision && next.length &&
        (!proofPreflight.authorityPreflight ||
          proofPreflight.authorityPreflight.status === "READY") &&
        next.every((row) => row.decision?.kind === "independent-review"))
      return envelope(id, "RUN_EXTERNAL", {
        legacyAction: "RUN_PROOF", actor: "harness",
        reason: "prepare required review through the deterministic proof chain",
        command: command(`proof advance ${id}`),
        automatic: true,
        recoveryType: "AUTO_RECOVER",
        alternatives: ["collect current evidence and prepare required review"]
      });
    const wiring = automation.wiringAttempted ? null : automaticEvidenceWiring(id, proofPreflight);
    if (wiring) return envelope(id, "RUN_EXTERNAL", {
      legacyAction: "WIRE_EVIDENCE", actor: "harness",
      reason: `wire detected project-owned providers: ${wiring.providers.join(", ")}`,
      command: wiring.command,
      automaticWiring: wiring,
      automatic: true,
      recoveryType: "AUTO_RECOVER",
      alternatives: ["write the detected provider wiring, then continue proof"]
    });
    const first = (needsDecision && next.find((row) =>
      row.decision && row.decision.kind !== "independent-review")) || next[0] || null;
    const decision = proofPreflight.authorityPreflight?.decision ||
      proofPreflight.decision || first?.decision || null;
    const mapping = {
      NEEDS_CODE_CHANGE: ["EDIT", "EXECUTE_TASK", "agent", "host-execution", "EDIT"],
      CONFIGURATION_ERROR: ["REPAIR", "REPAIR_PROOF_CONTRACT", "agent", "contract", "RECONFIGURE"],
      BLOCKED_BY_ACTIVE_WORK: ["WAIT", "WAIT_RESOURCE", "harness", "resource", "PAUSE"],
      INFRASTRUCTURE_ERROR: ["REPAIR", "REPAIR_PROVIDER_ENVIRONMENT", "operator", "resource", "RECONFIGURE"],
      NEEDS_USER_DECISION: ["ASK_USER", "REQUEST_DECISION", "user", "user-authority", "ASK_USER"]
    };
    const [action, legacyAction, actor, boundary, recoveryType] = mapping[proofPreflight.status] ||
      ["REPAIR", "REPAIR_PROOF_PREFLIGHT", "agent", "contract", "RECONFIGURE"];
    return envelope(id, action, {
      legacyAction,
      actor,
      action,
      boundary,
      reason: decision?.summary || proofPreflight.issues?.[0] || proofPreflight.status,
      preflight: compactPreflight(proofPreflight),
      ...(needsDecision ? { decision } : {}),
      command: first?.command || command(`doctor --stage prove --change ${id}`),
      recoveryType,
      alternatives: needsDecision && decision?.options
        ? decision.options.map((option) => option.outcome)
        : next.map((row) => row.reason || row.command)
    });
  }

  return envelope(id, "RUN_EXTERNAL", {
    legacyAction: "RUN_PROOF", actor: "harness",
    boundary: null,
    reason: "deterministic evidence is ready to run",
    command: command(`proof advance ${id}`),
    automatic: true,
    recoveryType: "AUTO_RECOVER",
    alternatives: ["run the deterministic proof chain"]
  });
}
