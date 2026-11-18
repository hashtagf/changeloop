// The steps of one proof execution and collection, as context-taking
// operations: preparing and checking availability, the advance value and
// cursor, stopping a run, and settling a collection's receipts and artifacts.
import { blockedOutcomeStop } from "../core/blocked-decision.mjs";
import { gateProgressValue, noProgressDecision } from "../core/convergent-gate.mjs";

export function requestSummary(id, request) {
  if (!request) return null;
  const requestId = request.requestId || null;
  return {
    requestId,
    type: request.type || null,
    provider: request.provider || null,
    status: request.status || null,
    workspaceHash: request.workspaceHash || null,
    expiresAt: request.expiresAt || null,
    packetDigest: request.packetDigest || null,
    attemptDigest: request.dispatch?.attemptDigest || null,
    scopeMode: request.dispatch?.scope?.mode || null,
    packetCommand: requestId
      ? `cloop authority status ${id} --request ${requestId}` : null,
    statusCommand: requestId
      ? `cloop authority status ${id} --request ${requestId} --template` : null
  };
}

export function prepareProofExecution(context, id, options = {}) {
  if (options.preflight !== false) context.proofPreflight(id, "prove", true);
  const pending = context.pendingTasks(id);
  if (pending.length)
    context.die(`${pending.length} implementation task(s) remain unchecked`);
  const snapshot = options.snapshot || context.relevantSnapshot(id, null, true);
  const state = context.loadRuntime(id);
  const proofRunId = `proof-${Date.now()}`;
  state.activeProofRun = {
    id: proofRunId,
    snapshotId: snapshot.id,
    workspaceHash: snapshot.workspaceHash,
    startedAt: context.now()
  };
  context.saveRuntime(state);
  for (const provider of context.requiredProviders(id)) {
    const row = context.receiptValidity(id, provider, snapshot.workspaceHash);
    if (row.validity === "reusable-inputs")
      context.rebindReusableReceipt(id, row, snapshot, proofRunId);
    else if (row.validity === "reusable-diff")
      context.rebindDiffBoundReceipt(id, row, snapshot, proofRunId);
  }
  return { snapshot, proofRunId };
}

export function executionAvailabilityError(execution, id) {
  if (execution.unconfigured.length)
    return `missing executable adapter for provider(s): ${execution.unconfigured.join(", ")}; record external receipts or configure evidence v2`;
  if (execution.unavailable.length)
    return `provider environment unavailable: ${execution.unavailable.join(", ")}; run doctor --stage prove --change ${id}`;
  return null;
}

export function assertExecutionAvailable(execution, id) {
  const error = executionAvailabilityError(execution, id);
  if (error) throw new Error(error);
}

export function proofExecutionAdvanceValue(id, options, snapshot, proofRunId, nodes, audit) {
  if (options.manageReservation === false || !nodes.length) return null;
  return {
    version: 1,
    changeId: id,
    command: options.command || "proof execute",
    status: audit.valid ? "PASS" : "ACTION_REQUIRED",
    stage: audit.valid ? "complete" : "proof-invalid",
    completed: audit.valid,
    proofRunId,
    workspaceHash: snapshot.workspaceHash,
    providers: audit.valid ? (audit.proof.providers || []) : [],
    requests: [],
    executedProviders: nodes.map((node) => node.provider),
    next: audit.valid ? [{
      kind: "land",
      command: `cloop advance ${id} --through archived`
    }] : []
  };
}

export async function runProofExecutionNodes(context, id, nodes, proofRunId, options) {
  if (nodes.length)
    return await context.runExecutionDag(id, nodes, proofRunId, { quiet: options.quiet }) || [];
  if (!options.quiet)
    context.log(`EXECUTION ${proofRunId}: all receipts reused`);
  return [];
}

export function writeProofExecutionAdvance(
  context, id, options, snapshot, proofRunId, nodes, audit
) {
  const advance = proofExecutionAdvanceValue(
    id, options, snapshot, proofRunId, nodes, audit);
  if (advance) context.writeAdvance(id, advance);
}

// Identifies one gate pass's cursor. Every pass bumps `repairCycle` or writes a
// new fingerprint, so a caller that read a different token decided to run
// before another pass recorded this one.
export function proofCursorToken(cursor) {
  return `${Number(cursor?.repairCycle || 0)}:${cursor?.progressFingerprint || ""}:${
    cursor?.updatedAt || ""}`;
}

export function proofExecutionResult(audit, proofRunId) {
  return { status: audit.valid ? "PASS" : "ACTION_REQUIRED", proofRunId };
}

export function proofRunExecutionStops(result) {
  return result?.stage === "execution-indeterminate" ||
    result?.status === "ACTION_REQUIRED";
}

export function stopProofRun(context, readiness, options = {}) {
  const stopped = {
    ...readiness,
    command: "proof run",
    completed: false
  };
  if (!options.quiet) context.printOutcome(stopped);
  context.markBlocked(blockedOutcomeStop(stopped));
  context.runtimeProcess.exitCode = 2;
  return readiness;
}

export function proofRunOutcome(id, proof) {
  return {
    version: 1,
    changeId: id,
    command: "proof run",
    status: "PASS",
    completed: true,
    proofRunId: proof.proofRunId || null,
    workspaceHash: proof.workspaceHash,
    providers: proof.providers || []
  };
}

export function stopProofCollection(context, readiness, options = {}) {
  const stopped = {
    ...readiness,
    command: "proof collect",
    completed: false
  };
  if (!options.quiet) context.printOutcome(stopped);
  context.markBlocked(blockedOutcomeStop(stopped));
  context.runtimeProcess.exitCode = 2;
  return readiness;
}

export function beginProofCollection(context, id, snapshot, explicitRunId = null) {
  const state = context.loadRuntime(id);
  const proofRunId = explicitRunId || `collect-${context.timestamp()}`;
  state.activeProofRun = {
    id: proofRunId,
    snapshotId: snapshot.id,
    workspaceHash: snapshot.workspaceHash,
    startedAt: context.now(),
    mode: "collect"
  };
  context.saveRuntime(state);
  return proofRunId;
}

export function rebindProofCollectionReceipts(
  context, id, snapshot, proofRunId
) {
  for (const provider of context.requiredProviders(id)) {
    const row = context.receiptValidity(id, provider, snapshot.workspaceHash);
    if (row.validity === "reusable-inputs")
      context.rebindReusableReceipt(id, row, snapshot, proofRunId);
    else if (row.validity === "reusable-diff")
      context.rebindDiffBoundReceipt(id, row, snapshot, proofRunId);
  }
}

export function assertProofCollectionOutcomes(outcomes) {
  // An advisory provider reports; its result never fails the collection.
  const failed = outcomes.filter((row) => row.status !== "pass" && !row.advisory);
  if (failed.length) {
    const summary = failed.map((row) =>
      `${row.provider}:${row.status}${row.detail ? ` (${row.detail})` : ""}`).join(", ");
    const critical = failed.flatMap((row) => (row.observations || [])
      .filter((observation) => observation.kind === "critical-case" &&
        !["pass", "passed", "success", "ok"].includes(observation.status))
      .map((observation) => `${observation.id}=${observation.status}`));
    const recovery = critical.length
      ? `; critical cases non-passing: ${critical.join(", ")}; ` +
        "tag each covering test title with its literal [case-id] and resume advance --through proven"
      : "";
    throw new Error(`evidence collection failed: ${summary}${recovery}`);
  }
}

export function persistProofCollectionArtifacts(
  context, id, proofRunId, sessions
) {
  const serviceArtifacts = context.stopAll(sessions)
    .map((artifact) => context.durableArtifact(id, "service", proofRunId, {
      path: artifact.path,
      type: "service-log",
      required: true
    }));
  // Not on activeProofRun: the caller clears that before `prove` reads it.
  // This key survives the clear; finalize consumes and removes it.
  const state = context.loadRuntime(id);
  state.collectedServiceArtifacts = serviceArtifacts;
  context.saveRuntime(state);
}

export function proofCollectionOutcome(
  id, snapshot, proofRunId, outcomes, collectable, readiness
) {
  return {
    version: 1,
    changeId: id,
    command: "proof collect",
    status: readiness.status,
    completed: true,
    proofFinalized: false,
    proofRunId,
    workspaceHash: snapshot.workspaceHash,
    executedProviders: outcomes.map((row) => row.provider),
    blockedExecutableProviders: collectable.blocked,
    remainingExternalProviders: readiness.externalProviders
  };
}

export function settleProofCollection(context, id, outcome, readiness, options) {
  const settled = options.manageReservation === false ? outcome : context.writeAdvance(id, {
    ...outcome,
    stage: "evidence-collected",
    providers: [],
    requests: []
  });
  if (!options.quiet) context.printOutcome(settled);
  return options.includeReadiness ? { ...settled, readiness } : settled;
}

// The stop when every AI review wave is delivered and the last one's findings
// were repaired with nothing left to close them: the user chooses a human
// verdict, one more AI wave, a revised agreement, or a pause.
export function reviewExhaustedOutcome(id, delivered, readiness, exhausted, executedProviders) {
  const findingIds = [...new Set(exhausted.flatMap((row) => row.findingIds || []))].sort();
  const findings = (delivered.at(-1)?.findings || [])
    .filter((finding) => findingIds.includes(finding.id));
  const progress = gateProgressValue({
    phase: "prove", gate: "review", findings,
    strategy: { route: "review-route-exhausted" },
    workspaceHash: readiness.workspaceHash
  });
  const decision = noProgressDecision({
    changeId: id,
    phase: "prove",
    gate: "review",
    progress,
    findings,
    attemptedStrategies: [{
      id: "repair-final-review-findings",
      result: "repaired-without-remaining-review-wave"
    }],
    recommended: "human-verdict",
    options: [{
      id: "human-verdict",
      outcome: "A person reviews the final repair; request a review, dispatch it to them, then record the verdict they gave.",
      command: `cloop authority request ${id} --type review`
    }, {
      id: "one-more-ai-attempt",
      outcome: "Allow one more AI review wave on the user's recorded decision; advance then runs it.",
      command: `cloop authority extend-review ${id} --decision-ref <user-decision>`
    }, {
      id: "revise-agreement",
      outcome: "Amend the agreement to declare a critical case that proves the repaired findings, then resume."
    }, {
      id: "pause",
      outcome: "Preserve the change and all completed work."
    }],
    resumeCommand: `cloop advance ${id} --through proven`
  });
  return {
    version: 1,
    changeId: id,
    command: "proof advance",
    status: "NEEDS_USER_DECISION",
    route: "NO_PROGRESS_DECISION",
    stage: "review-repair-closure",
    completed: false,
    workspaceHash: readiness.workspaceHash,
    progressFingerprint: progress.fingerprint,
    closures: exhausted,
    decision: {
      ...decision.decision,
      kind: "review-route-exhausted",
      summary: `All ${delivered.length} AI review wave(s) are delivered and the last one raised ${findingIds.join(", ") || "findings"}. The repair is in place and current tests pass, but no review wave or declared critical case remains to close those findings.`
    },
    attemptedStrategies: decision.attemptedStrategies,
    requests: [],
    executedProviders,
    next: [{
      kind: "review-route-exhausted",
      reason: "Report the repaired findings, passing checks, and the unreviewed final repair; let the user choose a human verdict, one more AI wave, a revised agreement, or a pause.",
      command: `cloop authority extend-review ${id} --decision-ref <user-decision>`
    }, ...decision.next]
  };
}
