import { deltaClosureIssue } from "../../evidence/configured-reviewer.mjs";

export function acceptanceResponseEvidence(context, request) {
  const claimRows = context.expandList(request.packet?.claims);
  const criteria = claimRows.map((claim) => claim.criterion).filter(Boolean);
  const count = context.listCount(request.packet?.claims);
  if (criteria.length && criteria.length < count)
    criteria.push(`<${count - criteria.length} further criteria omitted from this preview; read the packet's claims>`);
  return {
    observed: "<what the responder actually saw, in their own words>",
    artifact: [],
    reference: ["<url or path the responder inspected>"],
    acceptor: "<name of the person who decided>",
    decision: "accept",
    criterion: criteria.length ? criteria : ["<criterion the responder confirmed>"]
  };
}

export function responseEvidenceBase() {
  return {
    observed: "<what the responder actually saw, in their own words>",
    artifact: [],
    reference: ["<url or path the responder inspected>"]
  };
}

export function reviewerResponseEvidence(dispatched) {
  const evidence = {
    reviewer: dispatched?.identity || "<independent reviewer identity>",
    "reviewer-type": dispatched?.type || "human|ai"
  };
  if (!dispatched || dispatched.type === "ai") {
    evidence["reviewer-provider-family"] = dispatched?.providerFamily ||
      "<AI provider family>";
    evidence["reviewer-model-family"] = dispatched?.modelFamily ||
      "<AI model family>";
    evidence["reviewer-model"] = dispatched?.modelId || "<AI model id>";
    evidence["reviewer-session"] = dispatched?.sessionId ||
      "<AI review session>";
  }
  return evidence;
}

export function reviewSubjectResponseEvidence() {
  return {
    "subject-actor": "<who or what implemented the change>",
    "subject-session": "<implementation session id, omit for a human implementer>",
    "subject-provider-family":
      "<implementation provider family, omit for a human implementer>",
    "subject-model-family":
      "<implementation model family, omit for a human implementer>",
    "subject-model": "<implementation model id, omit for a human implementer>"
  };
}

// Whether the latest delivered AI attempt is a real response that still owes a
// recorded receipt. A migrated attempt was synthesized from its receipt, and a
// placeholder the harness wrote while rebuilding a corrupt chain carries no
// response at all, so neither can be "recorded"; treating them as unrecorded
// locked every later dispatch, including a human review, out of the change.
export function attemptAwaitsRecordedReceipt(attempt) {
  if (!attempt) return false;
  return !attempt.migrated && !attempt.recovered;
}

export function reviewFindingResponseEvidence(request) {
  // The count matches the prefilled first-round IDs, so a delta response
  // recorded as given passes the count check.
  const verifiedFindingIds = request.packet?.closureFindings?.ids || [];
  const evidence = {
    "unresolved-blockers": 0,
    "verified-findings": verifiedFindingIds.length,
    findings: [],
    verifiedFindingIds
  };
  if (request.dispatch?.scope?.mode === "delta")
    evidence["scope-path"] = request.dispatch.scope.paths;
  return evidence;
}

export function reviewResponseEvidence(request) {
  return {
    ...responseEvidenceBase(),
    ...reviewerResponseEvidence(request.dispatch?.reviewer || null),
    ...reviewSubjectResponseEvidence(),
    ...reviewFindingResponseEvidence(request)
  };
}

const RESPONSE_REFERENCE_URI = /^[a-z][a-z0-9+.-]*:\/\//i;

// The response problems `authority record` can decide before validating the
// receipt, collected together: dispatch, references, provenance, and finding
// closure. The later checks stay as the authority; this only reports early.
export function authorityResponsePreflightIssues({ request, response, undispatched = false,
  referenceExists = () => true }) {
  const issues = [];
  if (undispatched)
    issues.push(`dispatch the request first: cloop authority dispatch ${request.changeId} ` +
      `--request ${request.requestId} --scope full|delta --reviewer-type human|ai --reviewer-identity <id>`);
  if (request.type !== "review") return issues;
  const evidence = response?.evidence && typeof response.evidence === "object" ? response.evidence : {};
  // An error response closes the attempt as an infrastructure outcome; it
  // carries no receipt, so receipt provenance and references do not apply.
  const infrastructureError = response?.status === "error";
  const references = (Array.isArray(evidence.reference) ? evidence.reference : [])
    .map((value) => String(value).trim()).filter(Boolean);
  const missing = infrastructureError ? [] : references.filter((reference) =>
    !RESPONSE_REFERENCE_URI.test(reference) && !referenceExists(reference));
  if (missing.length)
    issues.push(`a reference must be a URI or a path that exists: ${missing.join(", ")}`);
  // `subject-provenance` is the other accepted form, and the only one for
  // several implementers.
  const hasProvenance = evidence["subject-provenance"] !== undefined &&
    evidence["subject-provenance"] !== null && evidence["subject-provenance"] !== "";
  if (!infrastructureError && !hasProvenance && !String(evidence["subject-actor"] || "").trim())
    issues.push("add evidence.subject-actor (who implemented the change) or evidence.subject-provenance");
  const aiSubject = ["subject-provider-family", "subject-model-family", "subject-model"]
    .some((key) => String(evidence[key] || "").trim());
  if (!infrastructureError && !hasProvenance && aiSubject &&
      !String(evidence["subject-session"] || "").trim())
    issues.push("an AI implementer needs evidence.subject-session");
  const verifiedIds = Array.isArray(evidence.verifiedFindingIds) ? evidence.verifiedFindingIds : [];
  // The receipt validator's rule: counts bind only when finding rows or
  // verified IDs are supplied, or the scope is a delta.
  const suppliedRows = (Array.isArray(evidence.findings) && evidence.findings.length > 0) ||
    verifiedIds.length > 0 || request.dispatch?.scope?.mode === "delta" ||
    (Array.isArray(evidence["scope-path"]) && evidence["scope-path"].length > 0);
  if (!infrastructureError && suppliedRows && evidence["verified-findings"] !== undefined &&
      Number(evidence["verified-findings"]) !== verifiedIds.length)
    issues.push(`evidence.verified-findings (${evidence["verified-findings"]}) must equal the ` +
      `${verifiedIds.length} verifiedFindingIds`);
  const expected = request.packet?.closureFindings?.ids;
  if (Array.isArray(expected) && response?.status !== "error") {
    const supplied = [...new Set(verifiedIds.map((value) => String(value).trim()).filter(Boolean))].sort();
    if (deltaClosureIssue({ expected, verified: supplied, status: response?.status,
      findings: Array.isArray(evidence.findings) ? evidence.findings : [] }))
      issues.push(`verifiedFindingIds must close exactly the closureFindings (first-round or prior human review): ${[...expected].sort().join(", ")}` +
        " (a failing response may close fewer only by also reporting a blocker or major finding)");
  }
  return issues;
}

export function authorityResponseTemplate(context, request) {
  // Preserve the established eager claim expansion. The production compactor
  // supports both arrays and previews, and callers may rely on malformed packet
  // shapes failing before a review template is projected.
  const acceptanceEvidence = acceptanceResponseEvidence(context, request);
  // A full-delta review is recorded only after dispatch; say so up front.
  const dispatchFirst = request.type === "review" && request.status !== "dispatched"
    ? `cloop authority dispatch ${request.changeId} --request ${request.requestId} ` +
      "--scope full|delta --reviewer-type human|ai --reviewer-identity <id>"
    : null;
  return {
    version: Number(context.protocolVersion),
    requestId: request.requestId,
    changeId: request.changeId,
    type: request.type,
    ...(dispatchFirst ? { dispatchFirst } : {}),
    workspaceHash: request.workspaceHash,
    status: "pass|fail|inconclusive|error",
    evidence: request.type === "acceptance"
      ? acceptanceEvidence : reviewResponseEvidence(request)
  };
}

export function authorityPacketOperation(context, id, type) {
  if (type === "review") return context.reviewPacketValue(id);
  const state = context.loadRuntime(id);
  const contract = context.evidence(id);
  const acceptance = context.resolvedAcceptance(id, state, contract);
  const reviewContext = context.reviewPacketValue(id);
  const claims = contract.claims
    .filter((claim) => acceptance.claimIds.includes(claim.id))
    .map((claim) => ({
      id: claim.id,
      scenario: claim.scenario,
      impact: claim.impact,
      criterion: `Confirm the final result satisfies: ${claim.scenario}`
    }));
  return {
    version: Number(context.protocolVersion),
    packetType: "acceptance",
    changeId: id,
    workspaceHash: context.relevantHash(id),
    reason: acceptance.reason,
    intent: state.intent,
    claims,
    inspection: {
      workspaces: reviewContext.changedSurface?.inspection || [],
      changedSurface: reviewContext.changedSurface || null,
      decisions: reviewContext.decisions || null,
      automatedEvidence: reviewContext.evidence || []
    },
    response: {
      statuses: ["pass", "fail", "inconclusive", "error"],
      instructions: "Inspect the final workspace against every criterion. Pass only when all criteria are satisfied; otherwise reject, report uncertainty, or pause without a response.",
      requiredForPass: [
        "named human", "criterion observations", "durable artifact or reference"
      ]
    },
    requiredActor: "human"
  };
}
