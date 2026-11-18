// Review repair closure and decision gates: normalizing findings, binding a
// deterministic closure to the evidence that repaired them, and the revision
// a grounding or decision approval must match. Executed-receipt flake marks
// live here too.

export function groundedRepairBinding(grounding, finding) {
  if (!grounding || grounding.version !== 2) return null;
  const rawPath = String(finding?.path || "")
    .replaceAll("\\", "/").replace(/^\.\//, "");
  if (!rawPath) return null;
  const repositoryIds = new Set((grounding.claims || []).flatMap((claim) =>
    [...(claim.productionPath || []), ...(claim.failurePaths || [])]
      .map((row) => row.repository || "root")));
  const separator = rawPath.indexOf("/");
  const prefix = separator > 0 ? rawPath.slice(0, separator) : "";
  const repository = repositoryIds.has(prefix) ? prefix : "root";
  const path = repository === prefix ? rawPath.slice(separator + 1) : rawPath;
  const claimIds = (grounding.claims || []).filter((claim) =>
    [...(claim.productionPath || []), ...(claim.failurePaths || [])].some((row) =>
      (row.repository || "root") === repository && row.path === path))
    .map((claim) => claim.id).filter(Boolean).sort();
  const claimSet = new Set(claimIds);
  const verificationCaseIds = (grounding.criticalCases || []).filter((row) =>
    (row.claimIds || []).some((claimId) => claimSet.has(claimId)))
    .map((row) => row.id).filter(Boolean).sort();
  return claimIds.length && verificationCaseIds.length
    ? { claimIds, verificationCaseIds, source: "grounding-v2-path" } : null;
}

export function normalizedReviewFinding(finding) {
  return {
    id: String(finding?.id || "").trim(),
    severity: String(finding?.severity || "").toLowerCase(),
    path: String(finding?.path || ""),
    line: finding?.line === null || finding?.line === undefined
      ? null : Number(finding.line),
    message: String(finding?.message || "").trim(),
    claimIds: [...new Set((finding?.claimIds || []).map((value) =>
      String(value).trim()).filter(Boolean))].sort(),
    verificationCaseIds: [...new Set((finding?.verificationCaseIds || [])
      .map((value) => String(value).trim()).filter(Boolean))].sort()
  };
}

export function repairClosureFindings(findings, resolveBinding = (..._args) => null) {
  return (findings || []).map((finding) => {
    const declaredClaims = [...new Set(finding.claimIds || [])].filter(Boolean).sort();
    const declaredCases = [...new Set(finding.verificationCaseIds || [])]
      .filter(Boolean).sort();
    if (declaredClaims.length && declaredCases.length)
      return {
        ...finding, claimIds: declaredClaims,
        verificationCaseIds: declaredCases, bindingSource: "reviewer"
      };
    const derived = resolveBinding(finding) || {};
    return {
      ...finding,
      claimIds: [...new Set(derived.claimIds || [])].filter(Boolean).sort(),
      verificationCaseIds: [...new Set(derived.verificationCaseIds || [])]
        .filter(Boolean).sort(),
      bindingSource: derived.source || null
    };
  });
}

export function approvedGroundingRevision(state, currentContractFingerprint) {
  return [...(state?.groundingReopens || [])].reverse().find((row) =>
    row.completedAt && row.newDigest === state.groundingDigest &&
    row.contractFingerprint === currentContractFingerprint) || null;
}

export function approvedDecisionRevision(state, currentContractFingerprint) {
  const grounding = approvedGroundingRevision(state, currentContractFingerprint);
  if (grounding || state?.groundingRequired === true) return grounding;
  const approval = state?.specApproval;
  if (!approval?.required || !approval.decisionRef || !approval.identity ||
      !approval.approvedAt || Number(approval.revision) !==
        Number(state?.contractRevision || 0)) return null;
  return {
    decisionRef: approval.decisionRef,
    reason: "approved non-grounding contract revision",
    priorDigest: null,
    newDigest: approval.identity,
    contractFingerprint: currentContractFingerprint,
    completedAt: approval.approvedAt
  };
}

// The existing way to get an approved decision revision for the current
// contract: a grounding reopen for grounding changes, a spec approval otherwise.
export function decisionRevisionCommand(id, state) {
  return state?.groundingRequired === true
    ? `cloop change resolve ${id} --reopen-grounding --decision-ref <ref> --reopen-reason <why>`
    : `cloop advance ${id} --approve-spec --decision-ref <ref>`;
}

// Whether the contract now differs from the one a failed final AI delta judged,
// with no approved decision revision: the same condition the closure blocks on.
export function decisionGateNoticeOperation(context, id) {
  if (!deterministicReviewClosureSource(context.deliveredAiAttempts(id))) return null;
  const currentFingerprint = context.contractFingerprint(id);
  const state = context.loadRuntime(id);
  if (approvedDecisionRevision(state, currentFingerprint)) return null;
  const stale = context.requiredProviders(id).some((provider) => {
    if (context.providerCapability(provider, context.providerConfig(id, provider)) !== "review")
      return false;
    const path = context.receiptPath(id, provider);
    const prior = context.exists(path) ? context.readJson(path, {}) : null;
    return Boolean(prior) && prior.contractFingerprint !== currentFingerprint;
  });
  return stale ? { command: decisionRevisionCommand(id, state) } : null;
}

export function deterministicReviewClosureSource(delivered) {
  const source = delivered.at(-1);
  return delivered.length >= 2 && source?.resultStatus === "fail" &&
    source.scope?.mode === "delta" ? source : null;
}

export function repairClosureBindingsComplete(blockers) {
  return blockers.length > 0 && blockers.every((finding) =>
    String(finding.path || "").trim() &&
    finding.claimIds?.length && finding.verificationCaseIds?.length);
}

export function currentRepairProviders(context, id, workspaceHash) {
  const current = context.requiredProviders(id)
    .filter((candidate) => {
      const capability = context.providerCapability(
        candidate, context.providerConfig(id, candidate));
      return capability !== "review" && capability !== "acceptance";
    })
    .map((candidate) => ({
      provider: candidate,
      config: context.providerConfig(id, candidate),
      validity: context.receiptValidity(id, candidate, workspaceHash)
    }));
  return {
    current,
    invalid: current.filter((row) => row.validity.validity !== "valid")
  };
}

export function repairClosureEvidenceBindings(context, id, blockers, current) {
  const bindings = [];
  for (const finding of blockers) {
    for (const claimId of finding.claimIds) {
      for (const caseId of finding.verificationCaseIds) {
        const row = current.find((candidate) =>
          context.claimsForProvider(id, candidate.provider)
            .some((claim) => claim.id === claimId) &&
          (candidate.config?.criticalCases || []).includes(caseId));
        if (!row)
          return {
            error: {
              closed: false,
              route: "AUTO_REPAIR",
              reason: `No current executable provider binds finding '${finding.id}' to claim '${claimId}' and critical case '${caseId}'.`,
              findingId: finding.id,
              claimId,
              caseId
            }
          };
        const evidencePath = context.receiptPath(id, row.provider);
        const evidenceReceipt = context.readJson(evidencePath, {});
        bindings.push({
          provider: row.provider,
          findingId: finding.id,
          claimId,
          caseId,
          bindingSource: finding.bindingSource,
          receiptDigest: context.stableHash(evidenceReceipt),
          receipt: context.relativeReceipt(evidencePath)
        });
      }
    }
  }
  return { bindings };
}

export function uniqueRepairEvidenceBindings(bindings) {
  return [...new Map(bindings.sort((left, right) =>
    `${left.provider}/${left.claimId}/${left.caseId}`.localeCompare(
      `${right.provider}/${right.claimId}/${right.caseId}`))
    .map((row) => [
      `${row.findingId}/${row.provider}/${row.claimId}/${row.caseId}`, row
    ])).values()];
}

export function deterministicClosureIsBound(context, id, prior, source) {
  const priorClosure = prior?.review?.repairClosure || null;
  const directlyBound = prior?.status === "fail" &&
    prior?.review?.attemptDigest === source.digest;
  const priorClosureAttempt = priorClosure && prior?.review?.attemptDigest
    ? context.reviewAttemptByDigest(id, prior.review.attemptDigest) : null;
  const closureBound = prior?.status === "pass" &&
    priorClosure?.sourceAttemptDigest === source.digest &&
    priorClosureAttempt && context.reviewAttemptIsValid(prior, priorClosureAttempt);
  return Boolean(directlyBound || closureBound);
}

export function deterministicRepairClosureValue({
  contractChanged, source, prior, priorClosure, currentContractFingerprint,
  approvedRevision, blockers, evidenceBindings
}) {
  return {
    version: 1,
    kind: contractChanged
      ? "deterministic-after-approved-contract-revision"
      : "deterministic-after-bounded-ai",
    sourceAttemptDigest: source.digest,
    sourceWorkspaceHash: source.workspaceHash,
    sourceContractFingerprint: priorClosure?.sourceContractFingerprint ||
      prior.contractFingerprint,
    contractFingerprint: currentContractFingerprint,
    ...(approvedRevision ? {
      approvedRevision: {
        decisionRef: approvedRevision.decisionRef,
        reason: approvedRevision.reason,
        priorDigest: approvedRevision.priorDigest,
        newDigest: approvedRevision.newDigest,
        completedAt: approvedRevision.completedAt
      }
    } : {}),
    findingBindings: blockers.map((finding) => ({
      findingId: finding.id,
      source: finding.bindingSource,
      claimIds: finding.claimIds,
      verificationCaseIds: finding.verificationCaseIds
    })),
    evidenceBindings
  };
}

export function recordDeterministicReviewClosureOperation(
  context, id, provider, workspaceHash
) {
  const config = context.providerConfig(id, provider);
  if (context.providerCapability(provider, config) !== "review") return null;
  const source = deterministicReviewClosureSource(context.deliveredAiAttempts(id));
  if (!source) return null;
  const priorPath = context.receiptPath(id, provider);
  const prior = context.exists(priorPath) ? context.readJson(priorPath, {}) : null;
  const priorClosure = prior?.review?.repairClosure || null;
  if (!deterministicClosureIsBound(context, id, prior, source))
    return {
      closed: false,
      route: "CONTRACT_DECISION_REQUIRED",
      reason: "Neither the failed final AI delta nor a valid deterministic closure of it is currently bound to this change."
    };
  const currentContractFingerprint = context.contractFingerprint(id);
  const contractChanged = prior.contractFingerprint !== currentContractFingerprint;
  const state = context.loadRuntime(id);
  const approvedRevision = approvedDecisionRevision(
    state, currentContractFingerprint);
  if (contractChanged && !approvedRevision)
    return {
      closed: false,
      route: "CONTRACT_DECISION_REQUIRED",
      reason: "The agreement changed after the final AI delta without a completed locked Decision Sheet revision.",
      command: decisionRevisionCommand(id, state)
    };
  if (source.workspaceHash === workspaceHash)
    return {
      closed: false,
      route: "AUTO_REPAIR",
      reason: "The final AI delta still describes the current workspace; repair its blocker/major findings before advancing."
    };
  // Passing non-review proof is the agent-satisfiable half of closure, so it
  // is checked before the bindings the agent cannot author.
  const { current, invalid: invalidProviders } = currentRepairProviders(context,
    id, workspaceHash);
  if (invalidProviders.length)
    return {
      closed: false,
      route: "AUTO_REPAIR",
      reason: "Current non-review proof is not yet valid for every required provider.",
      providers: invalidProviders.map((row) => ({
        provider: row.provider, validity: row.validity.validity
      }))
    };
  const blockers = repairClosureFindings(
    (source.findings || []).filter((finding) =>
      ["blocker", "major"].includes(finding.severity)),
    (finding) => groundedRepairBinding(context.groundingForReview(id), finding));
  // Critical-case bindings come from the reviewer and the locked contract; no
  // Build edit can create them. Without them only another delta review could
  // close the final findings, and the wave cap forbids one: that is the
  // review-exhausted user gate, never an unsatisfiable repair.
  const exhausted = (reason, details = {}) => ({
    closed: false,
    route: "REVIEW_ROUTE_EXHAUSTED",
    reason,
    findingIds: blockers.map((finding) => finding.id).sort(),
    ...details
  });
  if (!repairClosureBindingsComplete(blockers))
    return exhausted("Final blocker/major findings must name a path, claimIds, and verificationCaseIds before deterministic closure is possible; the final AI delta used the last review wave.");
  const bindingResult = repairClosureEvidenceBindings(
    context, id, blockers, current);
  if (bindingResult.error) {
    const { closed: _closed, route: _route, reason, ...details } = bindingResult.error;
    return exhausted(`${reason} No declared critical case can close it and the final AI delta used the last review wave.`, details);
  }
  const evidenceBindings = uniqueRepairEvidenceBindings(bindingResult.bindings);
  const scopePaths = [...new Set(blockers.map((finding) => finding.path))].sort();
  const scopeDigest = context.stableHash({
    priorWorkspaceHash: prior.workspaceHash || null,
    workspaceHash,
    paths: scopePaths
  });
  const verifiedFindingIds = blockers.map((finding) => finding.id).sort();
  const attempt = context.recordRepairClosureAttempt(id, {
    sourceAttemptDigest: source.digest,
    workspaceHash,
    paths: scopePaths,
    scopeDigest,
    verifiedFindingIds,
    evidenceBindings
  });
  const repairClosure = deterministicRepairClosureValue({
    contractChanged, source, prior, priorClosure, currentContractFingerprint,
    approvedRevision, blockers, evidenceBindings
  });
  context.recordReceipt(id, provider, "pass", {
    claims: "declared",
    workspaceHash,
    observed: `closed final AI finding IDs ${verifiedFindingIds.join(", ")} with current declared critical-case evidence`,
    source: `foundation-repair-closure:${source.digest}`,
    reference: evidenceBindings.map((row) => row.receipt),
    "reviewer-type": "deterministic",
    "reviewer-identity": "foundation-repair-closure",
    "subject-provenance": (prior.review.subjects || []).map((subject) =>
      JSON.stringify(subject)),
    "unresolved-blockers": 0,
    "verified-findings": verifiedFindingIds.length,
    findings: [],
    verifiedFindingIds,
    "scope-path": scopePaths,
    "review-attempt": attempt.digest
  }, { repairClosure, quiet: true });
  return {
    closed: true,
    provider,
    sourceAttemptDigest: source.digest,
    attemptDigest: attempt.digest,
    findingIds: verifiedFindingIds,
    evidenceBindings
  };
}

// A harness-executed provider that failed and then passes on byte-identical
// inputs is nondeterministic, not fixed. Resuming unchanged must not turn the
// second observation into proof: the pass is recorded as a failing receipt
// carrying the flake, so the claim needs a repair (a content change) and the
// next pass on new content is proof again. Only a prior `fail` counts; an
// `error` is infrastructure that never produced a product verdict.
export function executedReceiptFlake(prior, receipt) {
  if (!prior || receipt?.status !== "pass" || receipt.execution !== "harness" ||
      prior.execution !== "harness" || !["fail"].includes(prior.status)) return null;
  const same = (field) => JSON.stringify(prior[field] ?? null) === JSON.stringify(receipt[field] ?? null);
  if (!["workspaceHash", "inputIdentity", "providerFingerprint", "contractFingerprint",
    "executionFingerprint"].every(same)) return null;
  const first = prior.flake?.firstFailure || {
    observed: prior.observed || null, finishedAt: prior.finishedAt || null,
    log: prior.log || null
  };
  return {
    version: 1,
    rule: "fail-then-pass-on-unchanged-content",
    firstFailure: first,
    passes: Number(prior.flake?.passes || 0) + 1,
    observedPass: { observed: receipt.observed || null, log: receipt.log || null },
    repair: "Make the provider deterministic for this content (fix the flaky test or the code it exercises); a pass on changed content is proof again."
  };
}

export function markExecutedFlake(prior, receipt) {
  const flake = executedReceiptFlake(prior, receipt);
  if (!flake) return receipt;
  return { ...receipt, status: "fail", observedStatus: "pass", flake,
    observed: `flaky: failed then passed on unchanged content (${receipt.observed || "pass"})` };
}
