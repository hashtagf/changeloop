// A dispatched review's result: the status view, recording the request,
// validating the reviewer's identity and response, normalizing its evidence,
// checking each finding's closure, and completing the attempt.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { deltaClosureIssue } from "../../evidence/review-result-validation.mjs";
import { retiredCircuitReviewRequest } from "./authority.mjs";

export function createDispatchedReview({
  authorityStatusValue, authorityStore, authorityWorkspaceHash, completeReviewAttempt, fail,
  providerConfig, requestAuthorityUnlocked, responseTemplate, reviewAttemptByDigest
}) {
  function showAuthorityStatus(id, flags = {}) {
    const value = authorityStatusValue(id, flags.request || null);
    if (!flags.template) {
      console.log(JSON.stringify(value, null, 2));
      return;
    }
    const open = value.requests.filter((request) => authorityStore.isOpen(request.status));
    if (!open.length)
      fail(`no open authority request for '${id}'; nothing to respond to`);
    console.log(JSON.stringify(open.length === 1
      ? responseTemplate(open[0]) : open.map(responseTemplate), null, 2));
  }

  function recordAuthorityRequest(id, flags) {
    const requestId = String(flags.request || "");
    const responsePath = flags.response ? resolve(flags.response) : null;
    if (!requestId || !responsePath)
      fail("authority record requires --request <id> --response <file>");
    const entry = authorityStore.list(id).find((row) => row.value.requestId === requestId);
    if (!entry) fail(`unknown authority request '${requestId}'`);
    const effective = authorityStatusValue(id, requestId).requests[0];
    const request = effective || entry.value;
    if (request.status === "stale" ||
        request.workspaceHash !== authorityWorkspaceHash(id, request.provider)) {
      // A verdict on a superseded workspace can never be recorded, but asking
      // anyone to re-request is harness bookkeeping. Issue the replacement
      // bound to the current workspace now; it spends no review attempt until
      // it is dispatched, and `advance` routes it like any open request.
      const repository = providerConfig(id, request.provider)?.repository || null;
      const fresh = requestAuthorityUnlocked(id, {
        type: request.type, ...(repository ? { repo: repository } : {})
      }, { quiet: true });
      fail(`authority request '${requestId}' judged a superseded workspace, so its response was not recorded; ` +
        `the harness re-requested ${request.type} as '${fresh.requestId}' bound to the current workspace. ` +
        `Resume with 'cloop advance ${id}'.`, 1,
      { owner: "harness", boundary: "stale-authority-request", code: "AUTHORITY_REREQUESTED" });
    }
    if (retiredCircuitReviewRequest(entry.value))
      fail(`authority request '${requestId}' used the retired legacy review circuit and was never ` +
        "dispatched, so its response cannot be recorded; resume with " +
        `'cloop advance ${id} --through proven', which requests a current review`);
    if (!authorityStore.isOpen(request.status))
      fail(`authority request '${requestId}' is ${request.status}`);
    const undispatched = request.type === "review" && request.status !== "dispatched";
    if (!existsSync(responsePath)) fail(`authority response not found: ${flags.response}`);
    return { requestId, responsePath, entry, request, undispatched };
  }

  function validateDispatchedReviewResponse(request, response, evidenceFlags) {
    if (request.type !== "review" || !request.dispatch) return null;
    const reviewer = request.dispatch.reviewer;
    validateDispatchedReviewerIdentity(reviewer, evidenceFlags);
    const { findings, verifiedFindingIds, dispatchedScope } =
      normalizeDispatchedReviewEvidence(request, evidenceFlags);
    validateReviewFindingClosure(request, response, evidenceFlags, findings,
      verifiedFindingIds, dispatchedScope);
    return { reviewer, findings, verifiedFindingIds };
  }

  function validateDispatchedReviewerIdentity(reviewer, evidenceFlags) {
    const identity = reviewEvidenceText(evidenceFlags["reviewer-identity"] ||
      evidenceFlags.reviewer).trim();
    const comparisons = [
      ["reviewer identity", identity, reviewer.identity],
      ["reviewer type", reviewEvidenceText(evidenceFlags["reviewer-type"]).toLowerCase(), reviewer.type],
      ["reviewer provider family", nullableReviewEvidence(
        evidenceFlags["reviewer-provider-family"], true), reviewer.providerFamily],
      ["reviewer model family", nullableReviewEvidence(
        evidenceFlags["reviewer-model-family"], true), reviewer.modelFamily],
      ["reviewer model", nullableReviewEvidence(evidenceFlags["reviewer-model"]), reviewer.modelId],
      ["reviewer session", nullableReviewEvidence(evidenceFlags["reviewer-session"]), reviewer.sessionId]
    ];
    const mismatch = comparisons.filter(([, actual, expected]) => actual !== expected)
      .map(([label, actual, expected]) => `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    if (mismatch.length)
      fail(`authority response does not match its dispatched reviewer\n  ${mismatch.join("\n  ")}`);
  }

  function reviewEvidenceText(value) {
    return String(value || "");
  }

  function nullableReviewEvidence(value, lowerCase = false) {
    const text = lowerCase ? reviewEvidenceText(value).toLowerCase()
      : reviewEvidenceText(value);
    return text || null;
  }

  function normalizeDispatchedReviewEvidence(request, evidenceFlags) {
    const suppliedScope = [...new Set(evidenceFlags["scope-path"] || [])].sort();
    const dispatchedScope = [...new Set(request.dispatch.scope.paths || [])].sort();
    if (suppliedScope.length && JSON.stringify(suppliedScope) !== JSON.stringify(dispatchedScope))
      fail("authority response scope-path must exactly match the paths in its dispatched delta packet");
    evidenceFlags["scope-path"] = dispatchedScope;
    const findings = Array.isArray(evidenceFlags.findings) ? evidenceFlags.findings : [];
    const verifiedFindingIds = Array.isArray(evidenceFlags.verifiedFindingIds)
      ? evidenceFlags.verifiedFindingIds : [];
    return { findings, verifiedFindingIds, dispatchedScope };
  }

  function validateReviewFindingClosure(request, response, evidenceFlags, findings,
    verifiedFindingIds, dispatchedScope) {
    const unresolved = findings.filter((finding) =>
      ["blocker", "major"].includes(String(finding?.severity || "").toLowerCase()));
    if (Number(evidenceFlags["unresolved-blockers"] || 0) !== unresolved.length)
      fail("review unresolved-blockers must equal the blocker/major finding rows");
    if (!request.packet?.closureFindings) return;
    if (response.status === "error") return;
    const expectedIds = [...(request.packet.closureFindings.ids || [])].sort();
    const suppliedIds = [...new Set(verifiedFindingIds.map((value) =>
      String(value).trim()).filter(Boolean))].sort();
    if (deltaClosureIssue({ expected: expectedIds, verified: suppliedIds,
      status: response.status, findings }))
      fail("review verifiedFindingIds must exactly close the closureFindings IDs (first-round or prior human review) " +
        "(a failing review may close fewer only by also reporting a blocker or major finding)");
    if (request.dispatch.scope.mode !== "delta") return;
    const outside = findings.filter((finding) => {
      const path = String(finding?.path || "").replace(/^\.\//, "");
      return !path || !dispatchedScope.some((candidate) =>
        candidate === path || candidate.endsWith(`/${path}`));
    });
    if (outside.length)
      fail("delta review findings must stay inside the dispatched correction paths");
  }

  function completeDispatchedReview(id, entry, request, reviewResult) {
    if (!reviewResult) return;
    const attempt = reviewAttemptByDigest(id, request.dispatch.attemptDigest);
    if (attempt?.status !== "dispatched") return;
    const completed = completeReviewAttempt(id, attempt.digest, {
      reviewerSessionId: reviewResult.reviewer.sessionId,
      resultStatus: reviewResult.responseStatus,
      findings: reviewResult.findings,
      verifiedFindingIds: reviewResult.verifiedFindingIds
    });
    request.dispatch = {
      ...request.dispatch,
      attemptDigest: completed.digest,
      reviewer: { ...request.dispatch.reviewer, sessionId: completed.reviewerSessionId }
    };
    authorityStore.replace(entry, request);
  }

  return {
    showAuthorityStatus, recordAuthorityRequest, validateDispatchedReviewResponse,
    completeDispatchedReview
  };
}
