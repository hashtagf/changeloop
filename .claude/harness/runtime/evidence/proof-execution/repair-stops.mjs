import { effectiveReviewAttemptLimit } from "../../core/authority-policy.mjs";
import {
  compareGateProgress, gateProgressValue, gateRepairPlan, noProgressRepair
} from "../../core/convergent-gate.mjs";
import {
  derivedReviewRepairGraph, planVisualRepair, visualRepairGraph
} from "../repair-runtime.mjs";
import { advisoryVisualRow, visualDriftDecision } from "../visual-review.mjs";
import { blockedOutcomeStop } from "../../core/blocked-decision.mjs";
import { authorityRunCommand, authorityStatusCommand } from "../../core/authority-run-command.mjs";

export function createProofRepairStops(ctx) {
  const {
    authorityStatusValue, deliveredAiAttempts, loadRuntime, markBlocked, now,
    performanceRegression, printOutcome, proofReadinessValue, providerCapability,
    providerConfig, providerWorkspaceHash, receiptValidity, requestAuthority,
    requiredProviders, reviewPolicy, saveRuntime, stableHash, startConcurrentReview,
    testDiscrimination, visualReceipt, writeAdvance
  } = ctx;

  function currentProviderHash(id, provider, workspaceHash) {
    return providerWorkspaceHash(id, provider, workspaceHash) || workspaceHash;
  }

  function reviewRepairBatch(id) {
    const latestReview = deliveredAiAttempts(id).at(-1) || null;
    const findings = (latestReview?.findings || [])
      .filter((finding) => ["blocker", "major"].includes(finding.severity));
    return findings.length ? {
      version: 1,
      kind: "review-findings",
      attemptDigest: latestReview.digest,
      workspaceHash: latestReview.workspaceHash,
      findingIds: findings.map((finding) => finding.id).sort(),
      findings: findings.slice(0, 8)
    } : null;
  }

  function writeConvergentRepairStop(id, readiness, advanceStart, {
    gate, stage, findings, failures = [], requests = [], executedProviders = [],
    repairBatch = null, repairGraph = null, strategy, workspaceHash = readiness.workspaceHash,
    route = "AUTO_REPAIR", nextReason
  }) {
    const repairPlan = gateRepairPlan(findings, { phase: "prove", gate });
    const progress = gateProgressValue({
      phase: "prove", gate, findings,
      evidence: failures.map(({ provider, validity }) => ({ provider, validity })),
      strategy: { route: strategy }, workspaceHash
    });
    const progressComparison = compareGateProgress(
      advanceStart.progressFingerprint
        ? { fingerprint: advanceStart.progressFingerprint } : null,
      progress);
    const noProgress = advanceStart.stage === stage && !progressComparison.progressed;
    // An unchanged coding repair cycle is a strategy change for the agent, not
    // a user decision; the advance recovery ladder counts repetitions.
    const stall = noProgress ? noProgressRepair({
      changeId: id,
      phase: "prove",
      gate,
      progress,
      findings,
      attemptedStrategies: [{
        id: strategy,
        repairPlanDigest: repairPlan.digest,
        result: "same-findings-and-inputs"
      }],
      resumeCommand: `cloop packet ${id} --phase build`
    }) : null;
    const written = writeAdvance(id, {
      version: 1,
      changeId: id,
      command: "proof advance",
      status: "ACTION_REQUIRED",
      // The caller's route stands: a contract decision it already raised stays one.
      route,
      stage,
      completed: false,
      workspaceHash: readiness.workspaceHash,
      ...(gate === "review" ? { subjectHash: workspaceHash } : {}),
      progressFingerprint: progress.fingerprint,
      repairCycle: Number(advanceStart.repairCycle || 0) + 1,
      repairPlanDigest: repairPlan.digest,
      failures,
      requests,
      repairBatch,
      repairPlan,
      ...(repairBatch ? { repairGraph: derivedReviewRepairGraph(
        deliveredAiAttempts(id).at(-1), stableHash
      ) } : repairGraph ? { repairGraph } : {}),
      ...(stall ? { noProgress: {
        reason: stall.reason,
        progressFingerprint: stall.progressFingerprint,
        findingIds: stall.next[0].findingIds
      }, attemptedStrategies: stall.attemptedStrategies } : {}),
      executedProviders,
      next: noProgress ? stall.next : [{
        kind: gate === "review" ? "correct-workspace" : "correct-failed-evidence",
        // Lead with the first finding's own diagnosis so the agent can act on
        // the returned envelope instead of reading receipts.
        reason: [nextReason, (findings.find((finding) => finding?.message || finding?.reason) || {})
          .message || (findings.find((finding) => finding?.reason) || {}).reason]
          .filter(Boolean).join(": "),
        command: `cloop packet ${id} --phase build`
      }]
    });
    return noProgress ? { ...written, progressed: false } : written;
  }

  function writeReviewRepairStop(id, readiness, advanceStart, {
    requests = [], failures = [], executedProviders = []
  } = {}) {
    const reviewProvider = requiredProviders(id).find((provider) =>
      providerCapability(provider, providerConfig(id, provider)) === "review") || "review";
    const subjectHash = currentProviderHash(id, reviewProvider, readiness.workspaceHash);
    const repairBatch = reviewRepairBatch(id);
    // Review findings and executable failures at the same workspace are one
    // repair batch; neither hides the other.
    const findings = repairBatch ? [...repairBatch.findings, ...evidenceFailureFindings(
      failures.filter((failure) => failure.capability && failure.capability !== "review"))]
      : failures.map((failure) => ({
      id: `${failure.provider || "review"}:${failure.validity || "invalid"}`,
      provider: failure.provider || reviewProvider,
      classification: failure.validity === "unavailable" ? "infrastructure" : "product",
      severity: "error",
      rootCause: failure.reason || failure.validity || "review-failed",
      message: failure.reason || `review evidence is ${failure.validity || "invalid"}`
    }));
    return writeConvergentRepairStop(id, readiness, advanceStart, {
      gate: "review", stage: "review-rejected", findings, failures, requests,
      executedProviders, repairBatch, workspaceHash: subjectHash,
      strategy: repairBatch ? "repair-in-contract-findings" : "diagnose-review",
      route: repairBatch ? "AUTO_REPAIR" : "CONTRACT_DECISION_REQUIRED",
      nextReason: repairBatch
        ? "Repair every blocker/major finding in the dependency-ordered batch; the Build packet carries the same repair context. Continue the same gate loop until it passes."
        : "The review was inconclusive or errored. Repair its infrastructure or make a contract decision before another request."
    });
  }

  function evidenceFailureFindings(failures) {
    return failures.map((failure) => ({
      id: `${failure.provider || "evidence"}:${failure.validity || "invalid"}`,
      provider: failure.provider || null,
      classification: failure.validity === "unavailable"
        ? "infrastructure" : "product",
      severity: "error",
      rootCause: failure.reason || failure.validity || "evidence-failed",
      message: failure.reason || `${failure.provider || "evidence"} is ${
        failure.validity || "invalid"}`,
      claimIds: failure.claimIds || [],
      criticalCaseIds: failure.criticalCaseIds || []
    }));
  }

  // Executable evidence passed, but for behavior-changing work no new or
  // modified test fails on the base source: the suite cannot tell the change
  // from the original code. The agent strengthens the tests; this is the same
  // convergent evidence gate, so changed tests are progress and an unchanged
  // rerun reaches the existing no-progress boundary.
  async function discriminationRepairStop(id, readiness, advanceStart, executedProviders,
    early = null) {
    if (!testDiscrimination || !["READY", "NEEDS_USER_DECISION"].includes(readiness.status))
      return null;
    // A result computed beside the concurrent review binds to the hash it ran
    // on; any other hash is evaluated again.
    const result = early?.workspaceHash === readiness.workspaceHash
      ? early.result : await testDiscrimination(id, readiness.workspaceHash);
    recordInconclusiveDiscrimination(id, readiness.workspaceHash, result);
    if (result?.status !== "fail" || !result.findings?.length) return null;
    return stopProofAdvance(writeConvergentRepairStop(id, readiness, advanceStart, {
      gate: "evidence", stage: "tests-not-discriminating", findings: result.findings,
      failures: result.findings.map((finding) => ({
        provider: finding.provider, repositoryId: finding.repositoryId,
        validity: finding.rootCause === "tests-pass-on-base" ? "passes-on-base" : finding.rootCause,
        reason: finding.message
      })),
      executedProviders,
      strategy: "strengthen-discriminating-tests",
      nextReason: "The change's tests pass on the original code, so they do not verify the change. Add or strengthen a test that fails without the change and passes with it, then resume this same gate"
    }));
  }

  // A behavior-changing run whose base check gave no verdict (timed out,
  // base unavailable) is kept on the change so the Prove outcome and the Land
  // report say the tests were not shown to fail on the original code.
  function recordInconclusiveDiscrimination(id, workspaceHash, result) {
    if (!result || !Array.isArray(result.repositories)) return;
    const rows = Array.isArray(result.inconclusive) ? result.inconclusive : [];
    const state = loadRuntime(id);
    if (!rows.length && !state.testDiscrimination) return;
    if (rows.length) state.testDiscrimination = { workspaceHash, recordedAt: now(), inconclusive: rows };
    else delete state.testDiscrimination;
    saveRuntime(state);
  }

  // What advisory providers reported this run, kept on the change so the
  // Prove outcome, the proof, and the Land report can show it. It is never
  // passing evidence and never read by a gate.
  function recordAdvisoryEvidence(id, workspaceHash, outcomes = []) {
    const advisory = outcomes.filter((row) => row?.advisory);
    if (!advisory.length) return;
    const state = loadRuntime(id);
    const rows = new Map((state.advisoryEvidence?.rows || []).map((row) => [row.provider, row]));
    for (const outcome of advisory) {
      const receipt = ["pass", "fail", "inconclusive"].includes(outcome.status)
        ? visualReceipt(id, outcome.provider) : null;
      rows.set(outcome.provider, { ...advisoryVisualRow(outcome, receipt), workspaceHash });
    }
    state.advisoryEvidence = { workspaceHash, recordedAt: now(),
      rows: [...rows.values()].sort((left, right) => left.provider.localeCompare(right.provider)) };
    saveRuntime(state);
  }

  // Failed visual receipts with blocker/major differences become a visual
  // repair batch while the visual budget lasts; once spent, they become a
  // pending drift and leave the batch, so every other gate keeps repairing.
  function visualRepairSplit(id, failures) {
    const failed = failures.filter((failure) =>
      failure.capability === "visual" && failure.validity === "fail");
    const result = { failures: failures.filter((failure) => !failed.includes(failure)),
      repaired: [], findings: [], graph: null, drift: false };
    if (!failed.length) return result;
    const state = loadRuntime(id);
    // One Prove pass is one round: every failed visual provider's blocking
    // differences are planned together, so a second provider never reads
    // the first one's fresh batch as a declined repair.
    const blocking = [];
    let workspaceHash = null;
    for (const failure of failed) {
      const receipt = visualReceipt(id, failure.provider);
      workspaceHash ||= receipt?.workspaceHash || null;
      const own = (receipt?.visual?.findings || [])
        .filter((finding) => ["blocker", "major"].includes(finding?.severity));
      if (!own.length) { result.failures.push(failure); continue; }
      blocking.push({ failure, findings: own.map((finding) =>
        failed.length > 1 ? { ...finding, provider: failure.provider } : finding) });
    }
    if (!blocking.length) return result;
    const providers = blocking.map((row) => row.failure.provider);
    const plan = planVisualRepair(state, {
      provider: providers.length === 1 ? providers[0] : providers.join(","),
      receipt: { workspaceHash, visual: { findings: blocking.flatMap((row) => row.findings) } },
      now: now()
    });
    state.visualRepair = plan.visualRepair;
    if (plan.action === "drift") result.drift = true;
    else {
      for (const row of blocking) {
        result.repaired.push(row.failure);
        result.findings.push(...row.findings.map((finding) => ({
          id: `visual:${finding.id}`, provider: row.failure.provider, classification: "product",
          severity: finding.severity, rootCause: "visual-mismatch",
          message: `${finding.screen}: ${finding.difference}`,
          claimIds: finding.claimIds || [], criticalCaseIds: []
        })));
      }
      result.graph = visualRepairGraph({ findings: plan.findings, workspaceHash, round: plan.round },
        stableHash);
    }
    saveRuntime(state);
    return result;
  }

  // Returns null when the only failure is visual drift: it waits for the
  // user's one question after the other gates, never stopping them here.
  function writeEvidenceRepairStop(id, readiness, advanceStart, allFailures) {
    const visual = visualRepairSplit(id, allFailures);
    const failures = visual.failures;
    if (!failures.length && !visual.findings.length) return null;
    // A benchmark whose head ran cleanly but slower than its threshold is a
    // performance repair with its measured medians, not a generic failure.
    const regressions = failures.filter((failure) => failure.validity === "fail")
      .map((failure) => performanceRegression(id, failure.provider)).filter(Boolean);
    const regressed = new Set(regressions.map((finding) => finding.provider));
    const findings = [...regressions, ...visual.findings, ...evidenceFailureFindings(
      failures.filter((failure) => !regressed.has(failure.provider)))];
    if (regressions.length && regressions.length === failures.length && !visual.findings.length)
      return writeConvergentRepairStop(id, readiness, advanceStart, {
        gate: "evidence", stage: "performance-regression", findings, failures,
        strategy: "repair-performance-regression",
        nextReason: "Head is slower than base beyond the benchmark threshold. Remove the slowdown in product code, then resume this same gate; base and head are measured again"
      });
    return writeConvergentRepairStop(id, readiness, advanceStart, {
      gate: "evidence", stage: "evidence-failed", findings,
      failures: [...failures, ...visual.repaired], repairGraph: visual.graph,
      strategy: "repair-failed-evidence",
      nextReason: "Repair every failed evidence finding in the dependency-ordered batch, then resume this same gate. The controller will reuse unaffected current receipts." +
        (visual.findings.length ? " A visual difference that would contradict the approved agreement is not " +
          "yours to apply: resume without editing for it, and the harness asks the user to decide." : "")
    });
  }

  function missingByCapability(id, readiness, capability) {
    // Capability order is policy, not lexical provider order. In particular,
    // validation sorts names and therefore returns `acceptance` before
    // `review`; basing the transition on externalProviders[0] asks a person to
    // accept work that has not passed review. Receipt validity is the gate and
    // the capability determines the stage.
    return requiredProviders(id).filter((provider) =>
      providerCapability(provider, providerConfig(id, provider)) === capability &&
      receiptValidity(id, provider, readiness.workspaceHash).validity !== "valid");
  }

  function statusRequests(id) {
    return authorityStatusValue(id)?.requests || [];
  }

  function terminalEvidence(id, readiness) {
    const executableRetryStates = new Set([
      "missing", "stale", "provider-inputs-stale", "contract-stale",
      "provider-fingerprint-stale", "provider-version-stale",
      "adapter-version-stale", "invalid-artifacts", "execution-log-missing"
    ]);
    const externalRetryStates = new Set([
      "missing", "stale", "provider-inputs-stale", "contract-stale",
      "provider-fingerprint-stale", "provider-version-stale",
      "adapter-version-stale", "review-version-stale", "acceptance-version-stale"
    ]);
    return requiredProviders(id).map((provider) => {
      const config = providerConfig(id, provider);
      return {
        provider,
        capability: providerCapability(provider, config),
        adapter: config?.adapter || "external",
        ...receiptValidity(id, provider, readiness.workspaceHash)
      };
    }).filter((row) => {
      if (["valid", "reusable-inputs", "reusable-diff"].includes(row.validity)) return false;
      const automatic = row.adapter === "external"
        ? externalRetryStates : executableRetryStates;
      return !automatic.has(row.validity);
    });
  }

  function currentRequests(id, providers, workspaceHash, statuses, requests = null) {
    const providerSet = new Set(providers);
    return (requests || statusRequests(id)).filter((request) =>
      providerSet.has(request.provider) && statuses.includes(request.status) &&
      request.workspaceHash === currentProviderHash(
        id, request.provider, workspaceHash));
  }

  function authorityNext(id, stage, requests) {
    // `authority run` dispatches an AI wave, and the wave cap refuses it once
    // every allotted wave is delivered — prescribing it then hands the agent a
    // command guaranteed to block. Route the exhausted case to the external
    // recording template (a human verdict) instead.
    const delivered = deliveredAiAttempts(id);
    return requests.map((request) => {
      const maxAiAttempts = stage === "review" && request.status === "requested"
        ? effectiveReviewAttemptLimit(reviewPolicy(id), delivered, request.workspaceHash).maxAiAttempts
        : null;
      const runnable = maxAiAttempts !== null && delivered.length < maxAiAttempts;
      return {
        requestId: request.requestId,
        provider: request.provider,
        status: request.status,
        // Distinguishes "every AI wave is used" (a user decision) from "no
        // reviewer can start" (a wait) for the advance router.
        ...(maxAiAttempts !== null && !runnable
          ? { aiReviewExhausted: { delivered: delivered.length, maxAiAttempts } } : {}),
        owner: request.status === "infrastructure-exhausted" ? "harness" :
          stage === "review" ? "harness" : "external",
        ...(() => {
          if (!runnable)
            return { command: authorityStatusCommand(id, request.requestId) };
          const run = authorityRunCommand(id, request);
          return { command: run.command,
            ...(run.placeholders.length ? { placeholders: run.placeholders } : {}),
            ...(run.unresolved.length ? { unresolved: run.unresolved } : {}) };
        })()
      };
    });
  }

  function requestMissingAuthority(id, providers, type, workspaceHash, knownRequests) {
    const openStatuses = [
      "requested", "dispatched", "pending", "infrastructure-exhausted"
    ];
    const existing = currentRequests(
      id, providers, workspaceHash, openStatuses, knownRequests);
    const byProvider = new Map(existing.map((request) => [request.provider, request]));
    for (const provider of providers) {
      if (byProvider.has(provider)) continue;
      const config = providerConfig(id, provider);
      const request = requestAuthority(id, {
        type,
        ...(config?.repository ? { repo: config.repository } : {})
      }, { quiet: true });
      byProvider.set(provider, request);
    }
    return providers.map((provider) => byProvider.get(provider)).filter(Boolean);
  }

  function stopProofAdvance(outcome) {
    markBlocked(blockedOutcomeStop(outcome));
    process.exitCode = 2;
    return printOutcome(outcome);
  }

  // During `advance --through proven|archived`, a required configured review
  // that the harness can run starts beside the executable providers for the
  // same workspace hash. Anything else (handoff routes, external reviewers,
  // the bounded-closure route, several review providers) keeps the serial
  // path. The returned promise never rejects: an unsettled review stays an
  // open request that the next pass routes exactly as before.
  function startAdvanceReview(id, flags, snapshot, readiness, authorityRequests,
    proofRunId) {
    if (!flags.concurrentReview || !startConcurrentReview) return null;
    if (readiness.status !== "NEEDS_USER_DECISION" ||
        snapshot.workspaceHash !== readiness.workspaceHash) return null;
    const reviewProviders = missingByCapability(id, readiness, "review");
    if (reviewProviders.length !== 1) return null;
    const subjectHash = currentProviderHash(id, reviewProviders[0], readiness.workspaceHash);
    const delivered = deliveredAiAttempts(id);
    // A failed final wave first tries deterministic closure in this pass; its
    // closure review, if still needed, is requested only after that.
    if (delivered.length >= 2 && delivered.at(-1)?.resultStatus === "fail") return null;
    if (delivered.length >= effectiveReviewAttemptLimit(
      reviewPolicy(id), delivered, subjectHash).maxAiAttempts) return null;
    const known = authorityRequests.length ? authorityRequests : statusRequests(id);
    if (currentRequests(id, reviewProviders, readiness.workspaceHash,
      ["dispatched", "pending", "infrastructure-exhausted", "rejected"], known).length)
      return null;
    let request = null;
    let running = null;
    try {
      [request] = requestMissingAuthority(
        id, reviewProviders, "review", readiness.workspaceHash, known);
      if (request?.status !== "requested" || request.mainSessionFallback ||
          request.workspaceHash !== subjectHash) return null;
      // The receipt binds this pass's run and snapshot explicitly; reading
      // activeProofRun when the review finishes would depend on whether the
      // providers had already cleared it.
      running = startConcurrentReview(
        id, request, authorityNext(id, "review", [request])[0]?.command, {
          proofRunId, workspaceSnapshotId: snapshot.id || null,
          workspaceHash: subjectHash
        });
    } catch { return null; }
    return running ? Promise.resolve(running).then(() => true, () => false) : null;
  }

  // Executable evidence failed while the concurrent review rejected the same
  // workspace: report both in one repair stop instead of the provider error.
  function concurrentFailureStop(id, advanceStart) {
    const readiness = proofReadinessValue(id, "prove");
    const failed = terminalEvidence(id, readiness);
    if (!failed.some((row) => row.capability === "review") ||
        !failed.some((row) => row.capability !== "review")) return null;
    return stopProofAdvance(writeReviewRepairStop(
      id, readiness, advanceStart, { failures: failed }));
  }

  async function discriminationBesideReview(id, readiness, review) {
    let discrimination = null;
    try {
      if (["READY", "NEEDS_USER_DECISION"].includes(readiness.status) &&
          testDiscrimination) {
        discrimination = {
          workspaceHash: readiness.workspaceHash,
          result: await testDiscrimination(id, readiness.workspaceHash)
        };
      }
    } finally {
      // Recovery must never return while this pass still owns a reviewer.
      await review;
    }
    return discrimination;
  }

  // Visual providers whose current receipt failed after the visual budget was
  // spent wait for the user's decision; unchanged content is not reviewed
  // again while every other gate runs.
  function heldVisualDrift(id, workspaceHash) {
    const drift = loadRuntime(id).visualRepair?.drift;
    if (!drift) return null;
    const providers = requiredProviders(id).filter((provider) =>
      providerCapability(provider, providerConfig(id, provider)) === "visual" &&
      receiptValidity(id, provider, workspaceHash).validity === "fail");
    return providers.length ? { drift, providers } : null;
  }

  function writeVisualDriftStop(id, readiness, held, executedProviders) {
    const decision = visualDriftDecision(id, held.drift);
    return writeAdvance(id, {
      version: 1,
      changeId: id,
      command: "proof advance",
      status: "NEEDS_USER_DECISION",
      route: "VISUAL_DRIFT_DECISION",
      stage: "visual-drift",
      completed: false,
      workspaceHash: readiness.workspaceHash,
      providers: held.providers,
      visualDrift: held.drift,
      decision,
      requests: [],
      executedProviders,
      next: [{ kind: "visual-drift", reason: decision.summary }]
    });
  }

  return {
    authorityNext, concurrentFailureStop, currentProviderHash, currentRequests,
    discriminationBesideReview, discriminationRepairStop, heldVisualDrift,
    missingByCapability, recordAdvisoryEvidence, requestMissingAuthority,
    startAdvanceReview, statusRequests, stopProofAdvance, terminalEvidence,
    writeEvidenceRepairStop, writeReviewRepairStop, writeVisualDriftStop
  };
}
