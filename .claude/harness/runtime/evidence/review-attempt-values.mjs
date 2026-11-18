// Review attempt values: dispatching a review (type, budget, scope, the
// dispatched record) and completing it (identity, findings, the delivered
// record), plus the chain checks history recovery relies on. Pure; the store
// that persists them lives in review-attempt-store.mjs.
import { join } from "node:path";

export function reviewDispatchType(details, fail) {
  const reviewerType = String(details.reviewerType || "").toLowerCase();
  if (!["ai", "human"].includes(reviewerType))
    fail("review dispatch requires reviewerType ai|human");
  return reviewerType;
}

export function validateReviewDispatchBudget(context, id, reviewerType,
  history, details, completedAi, infrastructureAi) {
  const maxAiAttempts = Number(details.maxAiAttempts || 2);
  const maxInfrastructureRetries = Number(details.maxInfrastructureRetries ?? 1);
  if (reviewerType !== "ai") return;
  if (completedAi.length >= maxAiAttempts)
    context.blockAiExhausted(id, history, maxAiAttempts);
  if (infrastructureAi.length > maxInfrastructureRetries)
    context.fail(`REVIEW_INFRASTRUCTURE_ERROR: ${maxInfrastructureRetries} automatic reviewer infrastructure retry has already been used. Repair or switch the configured reviewer and resume: the harness resets this itself whenever the reviewer diagnosis passes under a changed reviewer configuration, and once per review wave for the same one. A reviewer configuration fault is the agent's repair; a reviewer that is not logged in or whose credential was rejected is a cause only the user can clear, which advance asks with the exact fix. It is never a product decision.`, 1, { code: "REVIEW_INFRASTRUCTURE_ERROR" });
}

export function reviewDispatchScope(details, reviewerType, aiAttempts,
  completedAi, fail) {
  const scopeMode = String(details.scope?.mode || "");
  if (!["full", "delta"].includes(scopeMode))
    fail("review dispatch scope must be full|delta");
  if (reviewerType === "ai") {
    const expectedMode = completedAi.length === 0 ? "full" : "delta";
    if (scopeMode !== expectedMode)
      fail(`AI review dispatch ${aiAttempts.length + 1} requires --scope ${expectedMode}`);
    const expectedBase = completedAi.at(-1)?.digest || null;
    if (scopeMode === "delta" && details.scope?.baseAttemptDigest !== expectedBase)
      fail(`AI delta review must reference the first AI dispatch with --base-attempt ${expectedBase}`);
    if (scopeMode === "full" && details.scope?.baseAttemptDigest)
      fail("the first AI full review must not declare --base-attempt");
  }
  return scopeMode;
}

export function reviewDispatchAttemptValue(context, id, details, history,
  reviewerType, scopeMode) {
  /** @type {Record<string, any>} */ const attempt = {
    version: 2, changeId: id,
    attempt: Number(history.totalAttempts || 0) + 1,
    reviewerType,
    reviewerIdentity: String(details.reviewerIdentity || "").trim(),
    reviewerProviderFamily: details.reviewerProviderFamily || null,
    reviewerModelFamily: details.reviewerModelFamily || null,
    reviewerModelId: details.reviewerModelId || null,
    reviewerSessionId: details.reviewerSessionId || null,
    sessionDeferred: details.sessionDeferred === true,
    requestId: String(details.requestId || ""),
    workspaceHash: details.workspaceHash,
    scope: {
      mode: scopeMode,
      baseAttemptDigest: details.scope?.baseAttemptDigest || null,
      paths: [...new Set(details.scope?.paths || [])].sort(),
      digest: details.scope?.digest || null
    },
    packetDigest: details.packetDigest || null,
    // The advisory REVIEW.md hash the dispatched packet carried (null: none).
    // A caller that knows nothing of review rules leaves the attempt as before.
    ...(Object.hasOwn(details, "reviewRulesHash")
      ? { reviewRulesHash: details.reviewRulesHash ?? null } : {}),
    status: "dispatched",
    priorChainHead: history.chainHead || null,
    timestamp: context.now()
  };
  if (!attempt.reviewerIdentity || !attempt.requestId || !attempt.workspaceHash)
    context.fail("review dispatch requires reviewer identity, request, and workspace hash");
  attempt.digest = context.stableHash(attempt);
  return attempt;
}

export function reviewHistoryAfterDispatch(history, attempt, reviewerType) {
  return {
    ...history,
    version: 1,
    aiAttempts: Number(history.aiAttempts || 0) + (reviewerType === "ai" ? 1 : 0),
    totalAttempts: attempt.attempt,
    chainHead: attempt.digest
  };
}

export function reviewCompletionIdentity(dispatched, details, fail) {
  const resultStatus = String(details.resultStatus || "");
  const sessionId = String(details.reviewerSessionId || "").trim();
  if (dispatched.reviewerType === "ai" && !sessionId && resultStatus !== "error")
    fail("AI review completion requires the actual reviewer session ID");
  if (!dispatched.sessionDeferred &&
      (dispatched.reviewerSessionId || null) !== (sessionId || null))
    fail("review completion session does not match the dispatched reviewer");
  return { resultStatus, sessionId };
}

const FINDING_CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// A malformed code is dropped, never rejected; an absent code adds no key so
// uncoded findings keep their prior digest.
function findingCode(value) {
  return typeof value === "string" && value.length <= 64 &&
    FINDING_CODE_PATTERN.test(value) ? { code: value } : {};
}

export function normalizeReviewCompletionFindings(details) {
  return (details.findings || []).map((finding) => ({
    id: String(finding.id || "").trim(),
    severity: String(finding.severity || "").toLowerCase(),
    path: String(finding.path || ""),
    line: finding.line === null || finding.line === undefined
      ? null : Number(finding.line),
    message: String(finding.message || "").trim(),
    claimIds: [...new Set((finding.claimIds || []).map((value) =>
      String(value).trim()).filter(Boolean))].sort(),
    verificationCaseIds: [...new Set((finding.verificationCaseIds || [])
      .map((value) => String(value).trim()).filter(Boolean))].sort(),
    ...findingCode(finding.code)
  }));
}

export function validateReviewCompletionFindings(resultStatus, findings, fail) {
  const findingIds = findings.map((finding) => finding.id);
  if (!["pass", "fail", "inconclusive", "error"].includes(resultStatus) ||
      findingIds.some((idValue) => !idValue) ||
      new Set(findingIds).size !== findingIds.length)
    fail("review completion finding IDs must be non-empty and unique");
  if (findings.some((finding) =>
    !["blocker", "major", "minor"].includes(finding.severity) ||
    !finding.message ||
    (finding.line !== null && (!Number.isInteger(finding.line) || finding.line < 1))))
    fail("review completion findings require valid severity, message, and optional positive line");
  if (resultStatus === "pass" && findings.some((finding) =>
    ["blocker", "major"].includes(finding.severity)))
    fail("a passing review completion cannot carry blocker or major findings");
}

export function validateFinalReviewFindings(resultStatus, findings, priorDelivered, fail) {
  const finalBlocking = resultStatus === "fail" && priorDelivered.length >= 1
    ? findings.filter((finding) => ["blocker", "major"].includes(finding.severity))
    : [];
  if (finalBlocking.some((finding) =>
    !finding.path || finding.claimIds.length === 0 ||
    finding.verificationCaseIds.length === 0))
    fail("a blocker or major finding in the final AI delta must name a path, claimIds, and verificationCaseIds for deterministic repair closure");
  return finalBlocking;
}

export function completedReviewAttemptValue(context, dispatched, details,
  resultStatus, sessionId, findings) {
  const verifiedFindingIds = [...new Set((details.verifiedFindingIds || [])
    .map((value) => String(value).trim()).filter(Boolean))].sort();
  const completed = {
    ...dispatched,
    version: 3,
    status: "completed",
    resultStatus,
    reviewerSessionId: sessionId || null,
    findings,
    verifiedFindingIds,
    completedAt: context.now()
  };
  // A same-packet model escalation (N8) keeps one attempt and one wave; the
  // completed attempt binds the model whose verdict is final.
  const escalation = details.modelEscalation;
  if (escalation && typeof escalation === "object") {
    completed.reviewerModelId = escalation.modelId || completed.reviewerModelId;
    completed.reviewerModelFamily = escalation.modelFamily || completed.reviewerModelFamily;
    completed.modelEscalation = escalation;
  }
  if (details.scenarioCoverage && typeof details.scenarioCoverage === "object")
    completed.scenarioCoverage = details.scenarioCoverage;
  // Advisory only: recorded with the verdict, never part of the gate.
  if (Array.isArray(details.specGaps) && details.specGaps.length)
    completed.specGaps = details.specGaps;
  delete completed.digest;
  completed.digest = context.stableHash(completed);
  return completed;
}

export function completeReviewAttemptOperation(context, id, digest, details) {
  const state = context.loadRuntime(id);
  const history = context.reviewHistoryState(id, state);
  if (history.chainHead !== digest)
    context.fail("review completion must finalize the current dispatched attempt");
  const dispatched = context.reviewAttemptByDigest(id, digest);
  if (!dispatched || dispatched.version !== 2 || dispatched.status !== "dispatched")
    context.fail("review completion requires a valid dispatched attempt");
  const { resultStatus, sessionId } = reviewCompletionIdentity(
    dispatched, details, context.fail);
  const findings = normalizeReviewCompletionFindings(details);
  validateReviewCompletionFindings(resultStatus, findings, context.fail);
  const priorDelivered = context.deliveredAiAttempts(id, history);
  validateFinalReviewFindings(resultStatus, findings, priorDelivered, context.fail);
  const completed = completedReviewAttemptValue(context,
    dispatched, details, resultStatus, sessionId, findings);
  context.writeJson(join(context.evidenceVault, id, "review-attempts",
    `${String(completed.attempt).padStart(4, "0")}-${completed.digest.slice(0, 12)}.json`), completed);
  state.reviewHistory = { ...history, chainHead: completed.digest };
  context.saveRuntime(state);
  return completed;
}

export function reviewHistoryAttemptValid(attempt, id, expectedAttempt) {
  return Boolean(attempt) &&
    Number(attempt.attempt) === expectedAttempt &&
    attempt.changeId === id;
}

export function reviewHistoryChainValidOperation(context, id, history) {
  if (context.reviewChainLowered?.(id, history)) return false;
  let digest = history.chainHead || null;
  let expectedAttempt = Number(history.totalAttempts || 0);
  let base = null;
  const seen = new Set();
  while (digest) {
    if (seen.has(digest) || seen.size > 1000) return false;
    seen.add(digest);
    const attempt = context.reviewAttemptByDigest(id, digest);
    if (!reviewHistoryAttemptValid(attempt, id, expectedAttempt)) return false;
    base = attempt;
    digest = attempt.priorChainHead || null;
    expectedAttempt -= 1;
  }
  // Migrated histories intentionally have no records before their synthetic
  // base. A real attempt may subsequently sit above that migrated base.
  return expectedAttempt === 0 || Boolean(base?.migrated);
}
