import { randomBytes } from "node:crypto";
import { retiredCircuitReviewRequest } from "./authority.mjs";

export function authorityRequestDisplayValue(request, limit = 8192) {
  const packetBytes = Buffer.byteLength(JSON.stringify(request.packet || null));
  if (request.type !== "review" || packetBytes <= limit) return request;
  return {
    version: request.version,
    requestId: request.requestId,
    changeId: request.changeId,
    type: request.type,
    provider: request.provider,
    status: request.status,
    workspaceHash: request.workspaceHash,
    claimIds: request.claimIds,
    packetDigest: request.packetDigest,
    packet: {
      status: "persisted",
      display: "truncated",
      bytes: packetBytes,
      limit
    },
    requestedAt: request.requestedAt,
    expiresAt: request.expiresAt,
    next: `cloop authority status ${request.changeId} --request ${
      request.requestId}`
  };
}

export function requireExternalCiConfig({ fail }, provider, config) {
  if (!config || config.adapter !== "external" || !config.ci?.publicKey || !config.ci?.issuer)
    fail(`provider '${provider}' requires external ci.issuer and ci.publicKey configuration`);
  return config;
}

export function signedCiReceiptFlags(context, id, provider, config, workspaceHash, result) {
  const { payload, artifacts } = result;
  return {
    claims: context.providerClaims(id, provider, config).join(","),
    workspaceHash,
    observed: String(payload.observed || `CI ${payload.status}; commit ${payload.commit || "unknown"}`),
    source: `signed-ci:${payload.issuer}`,
    reference: [payload.runUrl, ...artifacts.map((artifact) =>
      `artifact:${artifact.name}:sha256:${artifact.sha256}`)],
    "recorded-by": `evidence-verify-ci:${payload.issuer}`
  };
}

export function recordVerifiedCiOperation(context, id, provider, source) {
  const config = requireExternalCiConfig(context, provider,
    context.providerConfig(id, provider));
  const path = context.resolvePath(source || "");
  if (!source || !context.pathExists(path))
    context.fail("evidence verify-ci requires a signed JSON envelope");
  const envelope = context.readJson(path);
  const workspaceHash = context.providerWorkspaceHash(id, provider);
  const repository = context.providerRepository(id, provider, config);
  const workspacePath = repository?.workspacePath || context.providerWorkspace(id, provider);
  const result = context.validateSignedCiEnvelope({
    envelope,
    protocolVersion: context.ciEvidenceProtocolVersion,
    issuer: config.ci.issuer,
    publicKey: config.ci.publicKey,
    changeId: id,
    provider,
    workspaceHash,
    head: context.gitHead(workspacePath)
  });
  if (!result.valid) context.fail(result.reason);
  context.recordReceipt(id, provider, result.status,
    signedCiReceiptFlags(context, id, provider, config, workspaceHash, result));
  context.output.log(`CI EVIDENCE ${id}/${provider}: ${result.status}\n  run: ${result.payload.runUrl}`);
}

export function authorityRequestSelection(context, id, flags) {
  const type = String(flags.type || "");
  if (!["review", "acceptance"].includes(type))
    context.fail("authority request --type must be review|acceptance");
  context.validate(id, "active", { quiet: true });
  const pending = context.pendingTasks(id);
  if (pending.length)
    context.fail(`authority request requires completed implementation tasks: ${
      pending.map((task) => task.id).join(", ")}`);
  const repository = String(flags.repo || "").trim() || null;
  const provider = context.authorityProvider(id, type, repository);
  if (!provider || !context.requiredProviders(id).includes(provider))
    context.fail(repository
      ? `change '${id}' has no ${type} provider scoped to repository '${repository}'`
      : `change '${id}' does not require ${type} authority`);
  return {
    type, repository, provider,
    workspaceHash: context.authorityWorkspaceHash(id, provider)
  };
}

export function pendingAuthorityRequest(entries, selection) {
  for (const entry of entries) {
    const value = entry.value;
    if (value.type === selection.type && value.provider === selection.provider &&
        value.workspaceHash === selection.workspaceHash &&
        !retiredCircuitReviewRequest(value) &&
        ["requested", "dispatched", "pending", "infrastructure-exhausted"]
          .includes(value.status))
      return value;
  }
  return null;
}

export function authorityClaimIds(claims) {
  return claims.map((claim) => claim.id);
}

export function randomAuthorityRequestHex() {
  return randomBytes(8).toString("hex");
}

export function authorityRequestPolicy(context, id, type) {
  return type === "review" ? {
    reviewCircuit: context.policy().workflow.reviewCircuit,
    requirements: context.reviewPolicy(id)
  } : {
    reviewCircuit: null,
    requirements: { actor: "human", acceptance: context.resolvedAcceptance(id) }
  };
}

export function newAuthorityRequestValue(context, id, selection) {
  const { type, provider, workspaceHash } = selection;
  const packet = context.authorityPacket(id, type);
  const requestId = `${type}-${context.timestamp()}-${context.randomHex()}`;
  const claimIds = authorityClaimIds(context.claimsForProvider(id, provider));
  const packetDigest = context.canonicalPacketDigest(packet);
  const requestedAt = context.now();
  const expiresAt = new Date(
    context.timestamp() + 24 * 60 * 60 * 1000).toISOString();
  const policy = authorityRequestPolicy(context, id, type);
  return {
    version: Number(context.protocolVersion),
    requestId,
    changeId: id, type, provider, status: "requested", workspaceHash,
    claimIds,
    packet,
    packetDigest,
    requestedAt,
    expiresAt,
    ...policy
  };
}

export function displayAuthorityRequest(context, request, quiet) {
  if (quiet) return;
  const limit = Number(context.policy().execution?.packetBytes?.review || 8192);
  context.output.log(JSON.stringify(context.displayValue(request, limit), null, 2));
}

export function requestAuthorityOperation(context, id, flags = {}, options = {}) {
  const selection = authorityRequestSelection(context, id, flags);
  const existing = pendingAuthorityRequest(context.authorityStore.list(id), selection);
  if (existing) {
    displayAuthorityRequest(context, existing, options.quiet);
    return existing;
  }
  const request = newAuthorityRequestValue(context, id, selection);
  context.authorityStore.writeRequest(id, request);
  displayAuthorityRequest(context, request, options.quiet);
  return request;
}

export function abortAuthorityOperation(context, id, flags = {}) {
  const requestId = String(flags.request || "");
  const reason = String(flags.reason || "").trim();
  if (!requestId || !reason)
    context.fail("authority abort requires --request <id> --reason <text>");
  const entry = context.authorityStore.list(id)
    .find((row) => row.value.requestId === requestId);
  if (!entry) context.fail(`unknown authority request '${requestId}'`);
  const request = entry.value;
  const dispatchedAttempt = request.dispatch?.attemptDigest
    ? context.reviewAttemptByDigest(id, request.dispatch.attemptDigest) : null;
  const attemptIsCurrent = dispatchedAttempt?.status === "dispatched" &&
    context.reviewHistoryState(id, context.loadRuntime(id)).chainHead ===
      dispatchedAttempt.digest;
  // Aborting a request whose AI review already delivered a result that has no
  // receipt strands that result: the anti-repeat guard then refuses every new
  // review. The result is still recordable, so route there instead.
  if (request.status === "dispatched" && !attemptIsCurrent &&
      context.unrecordedRequestResult?.(id, request))
    context.fail(`authority request '${requestId}' already has a completed AI review result ` +
      "without a receipt; aborting it would block every later review. Record it instead: " +
      `cloop advance ${id} --through proven (or cloop authority record ${id} ` +
      `--request ${requestId} --response <saved response>)`);
  if (attemptIsCurrent) {
    context.completeReviewAttempt(id, dispatchedAttempt.digest, {
      reviewerSessionId: dispatchedAttempt.reviewerSessionId || "",
      resultStatus: "error",
      findings: [],
      verifiedFindingIds: []
    });
  }
  if (request.status === "aborted" && attemptIsCurrent) {
    context.output.log(JSON.stringify(request, null, 2));
    return request;
  }
  if (!["requested", "dispatched"].includes(request.status))
    context.fail(`authority request '${requestId}' is ${request.status}`);
  const updated = {
    ...request,
    status: request.status === "dispatched" ? "aborted" : "cancelled",
    abortedAt: context.now(),
    abortReason: reason
  };
  context.authorityStore.replace(entry, updated);
  context.output.log(JSON.stringify(updated, null, 2));
  return updated;
}

// The user's "one more AI attempt" answer to exhausted AI review. The grant
// raises the cap by one, so the open request's next route is `authority run`
// again and `advance` dispatches it.
export function extendReviewAuthorityOperation(context, id, flags = {}) {
  context.validate(id, "active", { quiet: true });
  const decisionRef = String(flags["decision-ref"] || "").trim();
  if (!decisionRef)
    context.fail("authority extend-review requires --decision-ref <ref>");
  const open = (context.authorityStore?.list(id) || []).map((entry) => entry.value)
    .find((request) => request.type === "review" && request.status === "requested" &&
      !retiredCircuitReviewRequest(request));
  const { maxAiAttempts } = context.effectiveReviewAttemptLimit(
    context.reviewPolicy(id), context.deliveredAiAttempts(id), open?.workspaceHash || null);
  const result = context.grantExtraAiWave(id, decisionRef, maxAiAttempts);
  context.output.log(`AUTHORITY ${id}: one more AI review wave\n  waves: ${
    result.delivered}/${result.maxAiAttempts}\n  decision: ${decisionRef
    }\n  next: ${`cloop advance ${id} --through proven`}`);
  return result;
}

export function resetInfrastructureAuthorityOperation(context, id, flags = {}) {
  context.validate(id, "active", { quiet: true });
  const decisionRef = String(flags["decision-ref"] || "").trim();
  if (!decisionRef)
    context.fail("authority reset-infra requires --decision-ref <ref>");
  const reviewerName = String(flags.reviewer || "").trim() || null;
  const status = context.reviewerStatus(reviewerName);
  if (!status.ok)
    context.fail(`configured reviewer '${status.reviewer}' still fails its ${status.check} diagnosis: ${status.detail}`);
  const result = context.acknowledgeInfrastructureAttempts(id, decisionRef);
  for (const entry of context.authorityStore?.list(id) || []) {
    if (entry.value.status !== "infrastructure-exhausted") continue;
    context.authorityStore.replace(entry, {
      ...entry.value,
      status: "requested",
      infrastructureResetAt: context.now?.() || null,
      infrastructureResetDecisionRef: decisionRef
    });
  }
  context.output.log(`AUTHORITY ${id}: infrastructure retries reset\n  reviewer: ${
    status.reviewer} (${status.check})\n  acknowledged: ${
    result.digests.length} attempt(s)\n  decision: ${decisionRef
    }\n  next: request and dispatch the AI review again`);
  return result;
}

export function lockedAuthorityOperation(withAuthorityLock, operation) {
  return (id, flags = {}) => withAuthorityLock(
    id, operation.bind(null, id, flags));
}
