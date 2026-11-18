import { currentWaivers } from "../../core/user-decisions.mjs";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { acquireProcessLock } from "../../core/process-lock.mjs";
import { effectiveReviewAttemptLimit } from "../../core/authority-policy.mjs";
import {
  deltaClosureIssue, reviewFindingIssues, reviewPacketIssues, validReview
} from "../../evidence/review-result-validation.mjs";
import { openHumanReviewClosure } from "../../evidence/review-attempt-store.mjs";
import {
  reviewAgreementValue, reviewDepthForTier, reviewDiffValue, reviewScenarioChecklist
} from "../../evidence/review-diff.mjs";
import { applyDeltaPacket, closureFindingsValue, deltaScopeRows } from "../packet/review-delta-scope.mjs";
import { retiredCircuitReviewRequest } from "./authority.mjs";
import {
  bindMainSession, mainSessionEnvironment, mainSessionProvenanceValue,
  sessionTelemetryProvenanceOperation
} from "./session-provenance.mjs";
import {
  attemptAwaitsRecordedReceipt, authorityPacketOperation, authorityResponsePreflightIssues,
  authorityResponseTemplate
} from "./authority-response.mjs";
import {
  abortAuthorityOperation, authorityRequestDisplayValue, extendReviewAuthorityOperation,
  lockedAuthorityOperation, randomAuthorityRequestHex, recordVerifiedCiOperation,
  requestAuthorityOperation, resetInfrastructureAuthorityOperation
} from "./authority-requests.mjs";
import { createAuthorityReviewerRun } from "./authority-reviewer-run.mjs";

export function createAuthorityRuntime({
  root,
  protocolVersion,
  ciEvidenceProtocolVersion,
  authorityStore,
  requiredProviders,
  providerCapability,
  providerConfig,
  reviewPacketValue,
  loadRuntime,
  evidence,
  resolvedAcceptance,
  relevantHash,
  validate,
  pendingTasks,
  claimsForProvider,
  stableHash,
  now,
  reviewPolicy,
  readJson,
  receiptPath,
  recordReceipt,
  receiptValidity,
  fileDigest,
  providerWorkspaceHash,
  providerRepository,
  providerWorkspace,
  gitHead,
  validateSignedCiEnvelope,
  providerClaims,
  expandList,
  listCount,
  dispatchReviewAttempt,
  completeReviewAttempt,
  reviewHistoryState,
  reviewAttempts,
  deliveredAiAttempts,
  reviewAttemptByDigest,
  assertReviewDispatchAllowed,
  foundationPolicy,
  reviewerConfig,
  reviewerStatus,
  // Absent in narrow compositions: every configured reviewer is routable.
  reviewerInstalled = (..._args) => true,
  runConfiguredReview,
  // Optional non-blocking twin of runConfiguredReview; absent means the
  // asynchronous route awaits the synchronous reviewer.
  runConfiguredReviewAsync = null,
  acknowledgeInfrastructureAttempts,
  // Absent in narrow compositions: extend-review then refuses.
  grantExtraAiWave = () => fail("extra AI review waves are unavailable in this composition"),
  acknowledgeBaseMoveAttempts,
  // Absent in narrow compositions: dispatch then keeps the manual reset routes.
  autoReleaseReviewBudget = (..._args) => [],
  // Drops the process-local snapshot cache so the post-review content check
  // reads the bytes on disk, not the snapshot taken before the reviewer ran.
  clearSnapshotCache = () => {},
  writeJson,
  fail,
  // { git, pathExists, readFile, readDirectory, isDirectory }; absent means
  // AI dispatch carries no inline diff and the reviewer inspects the workspace.
  reviewDiffContext = null
}) {
  function withAuthorityLock(id, operation) {
    const locks = join(root, ".foundation", "locks");
    const lock = join(locks, `authority-${id}.lock`);
    const acquired = acquireProcessLock(lock, { now });
    if (!acquired.acquired)
      fail(`authority mutation for '${id}' is already in progress; retry after it completes`);
    try { return operation(); }
    finally { acquired.release(); }
  }
  function authorityProvider(id, type, repository = null) {
    return requiredProviders(id).find((provider) => {
      const config = providerConfig(id, provider);
      if (providerCapability(provider, config) !== type) return false;
      return repository ? config?.repository === repository : true;
    }) || (repository ? null : type);
  }

  // A review provider that names a repository is a verdict about that
  // repository, so it binds to that repository's workspace hash. Binding every
  // verdict to the composite meant an edit in *any* selected repository
  // invalidated a review already earned elsewhere — on a wide change, review
  // became a moving target.
  function authorityWorkspaceHash(id, provider) {
    return providerWorkspaceHash(id, provider);
  }

  const authorityPacket = authorityPacketOperation.bind(null, {
    protocolVersion, reviewPacketValue, loadRuntime, evidence,
    resolvedAcceptance, relevantHash
  });

  function canonicalPacketDigest(packet) {
    const canonical = JSON.parse(JSON.stringify(packet || {}));
    delete canonical.packetDigest;
    return stableHash(canonical);
  }

  // The receipt records only the latest attempt digest, so counting delivered
  // attempts against receipt-matching ones misfires the moment a delta receipt
  // overwrites the full receipt or a human receipt supersedes the AI one. The
  // sound question is latest-vs-latest: is the newest delivered AI response
  // still waiting for its receipt, with nothing recorded after it?
  function unrecordedDeliveredAiResponse(id, history, provider) {
    const latest = deliveredAiAttempts(id, history).at(-1);
    if (!attemptAwaitsRecordedReceipt(latest)) return null;
    const path = receiptPath(id, provider);
    const receipt = existsSync(path) ? readJson(path, {}) : {};
    const recordedDigest = receipt.review?.attemptDigest || null;
    if (!recordedDigest) return latest;
    const recorded = reviewAttempts(id, history).find((attempt) =>
      attempt.digest === recordedDigest);
    if (recorded && Number(recorded.attempt) >= Number(latest.attempt))
      return null;
    return latest;
  }

  const requestAuthorityUnlocked = requestAuthorityOperation.bind(null, {
    validate,
    pendingTasks,
    authorityProvider,
    requiredProviders,
    authorityWorkspaceHash,
    authorityStore,
    authorityPacket,
    claimsForProvider,
    canonicalPacketDigest,
    protocolVersion,
    timestamp: Date.now,
    randomHex: randomAuthorityRequestHex,
    now,
    policy: foundationPolicy,
    reviewPolicy,
    resolvedAcceptance,
    displayValue: authorityRequestDisplayValue,
    output: console
  });

  function requestAuthority(id, flags = {}, options = {}) {
    return withAuthorityLock(id, () => requestAuthorityUnlocked(id, flags, options));
  }

  function dispatchRequestContext(id, flags) {
    const requestId = String(flags.request || "");
    if (!requestId) fail("authority dispatch requires --request <id>");
    const entry = authorityStore.list(id)
      .find((row) => row.value.requestId === requestId);
    if (!entry) fail(`unknown authority request '${requestId}'`);
    const request = entry.value;
    if (request.status === "dispatched") {
      console.log(JSON.stringify(request, null, 2));
      return { handled: true, value: request };
    }
    if (request.type !== "review")
      fail("authority dispatch currently reserves review authority only");
    if (request.reviewCircuit !== "full-delta")
      fail(`authority request '${requestId}' predates the full-delta circuit; cancel it and request review again`);
    if (request.status !== "requested")
      fail(`authority request '${requestId}' is ${request.status}`);
    if (request.workspaceHash !== authorityWorkspaceHash(id, request.provider))
      fail(`authority request '${requestId}' is stale`);
    if (Date.parse(request.expiresAt || "") <= Date.now())
      fail(`authority request '${requestId}' is expired`);
    if (canonicalPacketDigest(request.packet) !== request.packetDigest)
      fail(`authority request '${requestId}' packet no longer matches its recorded digest`);
    const reviewerType = String(flags["reviewer-type"] || "").toLowerCase();
    if (!["ai", "human"].includes(reviewerType))
      fail("authority dispatch requires --reviewer-type ai|human");
    return { handled: false, entry, request, requestId, reviewerType };
  }

  function reviewInfrastructureRetryLimit() {
    const reviewSettings = foundationPolicy().review || {};
    const configuredFallbacks = (Array.isArray(reviewSettings.fallbackReviewers)
      ? reviewSettings.fallbackReviewers
      : reviewSettings.fallbackReviewer ? [reviewSettings.fallbackReviewer] : [])
      .filter((name) => name !== "main-session");
    return Math.max(1,
      (1 + configuredFallbacks.length) * Number(reviewSettings.infraFailureThreshold || 1));
  }

  // Release harness-caused review accounting before any dispatch guard reads
  // it, and reopen requests an exhausted infrastructure circuit had closed.
  function releaseHarnessReviewBudget(id) {
    const released = autoReleaseReviewBudget(id, {
      maxInfrastructureRetries: reviewInfrastructureRetryLimit(),
      reviewerHealthy: () => reviewerStatus(null).ok === true,
      reviewerIdentity: stableHash(foundationPolicy().review || {}).slice(0, 12)
    });
    const infrastructure = released.find((reference) => reference.startsWith("harness:infra:"));
    if (infrastructure) for (const entry of authorityStore.list(id)) {
      if (entry.value.status !== "infrastructure-exhausted") continue;
      authorityStore.replace(entry, {
        ...entry.value, status: "requested",
        infrastructureResetAt: now(), infrastructureResetDecisionRef: infrastructure
      });
    }
    for (const reference of released)
      console.error(`AUTHORITY ${id}: harness released review accounting (${reference})`);
    return released;
  }

  function dispatchAuthorityUnlocked(id, flags = {}) {
    releaseHarnessReviewBudget(id);
    const context = dispatchRequestContext(id, flags);
    if (context.handled) return context.value;
    const { entry, request, requestId, reviewerType } = context;
    function dispatchRouting() {
    const routing = reviewPolicy(id);
    const historySnapshot = reviewHistoryState(id);
    const deliveredSnapshot = deliveredAiAttempts(id, historySnapshot);
    const { promotesLow, maxAiAttempts } = effectiveReviewAttemptLimit(
      routing, deliveredSnapshot, request.workspaceHash);
    const maxInfrastructureRetries = reviewInfrastructureRetryLimit();
    // The route-aware cap still wins over malformed scope/base details.
    const history = assertReviewDispatchAllowed(
      id, reviewerType, maxAiAttempts, maxInfrastructureRetries);
    const deliveredAi = deliveredAiAttempts(id, history);
    if (unrecordedDeliveredAiResponse(id, history, request.provider))
      fail("a completed AI response has no matching recorded receipt; repair that authority record or pause instead of dispatching another reviewer");
    if (promotesLow) {
      // A second dispatch means the first review did not close the change and
      // production moved. That is the one permitted low→medium promotion.
      request.requirements = {
        ...request.requirements,
        tier: "medium",
        promotedFrom: "low",
        promotionReason: "post-review-correction"
      };
    }
    const humanClosure = openHumanReviewClosure(reviewAttempts(id, history));
    return { routing, deliveredAi, maxAiAttempts, maxInfrastructureRetries,
      humanClosure };
    }
    const { routing, deliveredAi, maxAiAttempts,
      maxInfrastructureRetries, humanClosure } = dispatchRouting();
    function dispatchReviewer() {
    const reviewerIdentity = String(flags["reviewer-identity"] || "").trim();
    if (!reviewerIdentity)
      fail("authority dispatch requires --reviewer-identity");
    const reviewerProviderFamily = String(flags["reviewer-provider-family"] || "").trim().toLowerCase() || null;
    const reviewerModelFamily = String(flags["reviewer-model-family"] || "").trim().toLowerCase() || null;
    const reviewerModelId = String(flags["reviewer-model"] || "").trim() || null;
    const reviewerSessionId = String(flags["reviewer-session"] || "").trim() || null;
    const sessionDeferred = flags["reviewer-session-deferred"] === true;
    if (reviewerType === "ai" && [
      reviewerProviderFamily, reviewerModelFamily, reviewerModelId
    ].some((value) => !value))
      fail("AI dispatch requires reviewer provider/model family and model ID");
    if (reviewerType === "ai" && !reviewerSessionId && !sessionDeferred)
      fail("AI dispatch requires reviewer session unless a configured reviewer defers it to the actual thread.started event");
    function validateDispatchReviewerRoute() {
    if (reviewerType === "ai" && deliveredAi.length > 0) {
      const priorAi = deliveredAi.at(-1);
      if (priorAi?.reviewerType === "ai" &&
          priorAi.reviewerSessionId === reviewerSessionId)
        fail("AI delta closure requires a fresh reviewer session");
    }
    if (reviewerType === "ai" && providerConfig(id, request.provider)?.repository)
      fail("AI full-delta review requires one composite unscoped review provider; reconfigure the provider or split the change");
    }
    validateDispatchReviewerRoute();
    return { reviewerIdentity, reviewerProviderFamily, reviewerModelFamily,
      reviewerModelId, reviewerSessionId, sessionDeferred };
    }
    const { reviewerIdentity, reviewerProviderFamily, reviewerModelFamily,
      reviewerModelId, reviewerSessionId, sessionDeferred } = dispatchReviewer();
    function dispatchScope() {
    const scopeMode = String(flags.scope || "").toLowerCase();
    if (!["full", "delta"].includes(scopeMode))
      fail("authority dispatch requires --scope full|delta");
    const baseAttemptDigest = String(flags["base-attempt"] || "").trim() || null;
    const currentManifest = Array.isArray(request.packet?.changedSurface?.manifest)
      ? request.packet.changedSurface.manifest : [];
    let scopeRows = currentManifest;
    let baseWorkspaceHash = null;
    let baseAttempt = null;
    function resolveDeltaScope() {
    if (scopeMode === "delta") {
      baseAttempt = reviewAttemptByDigest(id, baseAttemptDigest);
      if (!baseAttempt || baseAttempt.reviewerType !== "ai")
        fail("AI delta review requires --base-attempt naming the first durable AI dispatch");
      const baseRequest = authorityStore.list(id)
        .find((row) => row.value.requestId === baseAttempt.requestId)?.value;
      if (!baseRequest)
        fail("AI delta review cannot resolve the packet used by its base dispatch");
      if (canonicalPacketDigest(baseRequest.packet) !== baseAttempt.packetDigest)
        fail("AI delta review base packet no longer matches the immutable first dispatch");
      const baseManifest = Array.isArray(baseRequest.packet?.changedSurface?.manifest)
        ? baseRequest.packet.changedSurface.manifest : [];
      const projected = request.packet.reviewScope?.mode === "delta" &&
        request.packet.reviewScope.baseAttemptDigest === baseAttemptDigest &&
        request.packet.changedSurface?.deltaFrom?.attemptDigest === baseAttemptDigest;
      scopeRows = deltaScopeRows(baseManifest, currentManifest, projected);
      if (scopeRows.length === 0)
        fail("AI delta review has no files changed since the first AI dispatch; do not spend the second review round");
      baseWorkspaceHash = baseAttempt.workspaceHash;
    }
    }
    resolveDeltaScope();
    const scopePaths = scopeRows.map((row) => `${row.repositoryId}/${row.path}`);
    const scopeDigest = stableHash({
      mode: scopeMode,
      baseAttemptDigest,
      baseWorkspaceHash,
      workspaceHash: request.workspaceHash,
      rows: scopeRows
    });
    return { scopeMode, baseAttemptDigest, baseWorkspaceHash, baseAttempt,
      scopeRows, scopePaths, scopeDigest };
    }
    const { scopeMode, baseAttemptDigest, baseWorkspaceHash, baseAttempt,
      scopeRows, scopePaths, scopeDigest } = dispatchScope();
    function dispatchPacket() {
    const packet = JSON.parse(JSON.stringify(request.packet));
    packet.reviewScope = {
      mode: scopeMode,
      baseAttemptDigest,
      baseWorkspaceHash,
      workspaceHash: request.workspaceHash,
      paths: scopePaths,
      digest: scopeDigest
    };
    function applyHighRiskHumanClosure() {
    if (routing.tier === "high" && reviewerType === "human" && deliveredAi.length)
      packet.closureFindings = closureFindingsValue(deliveredAi.at(-1));
    }
    applyHighRiskHumanClosure();
    if (scopeMode === "delta") applyDeltaPacket(packet, {
      request, scopeRows, scopePaths, baseAttempt, baseAttemptDigest, baseWorkspaceHash, stableHash
    });
    // A newer human verdict with blocker/major findings owns closure for the
    // next review of either reviewer type and scope; AI-only chains keep the
    // closure chosen above.
    if (humanClosure) packet.closureFindings = closureFindingsValue(humanClosure);
    // Diff-scoped by default: changed hunks plus the agreement, bound by
    // the packet digest. Low risk before any delivered AI round is diff-only.
    if (reviewerType === "ai") packet.reviewDepth = reviewDepthForTier(routing.tier, deliveredAi.length);
    if (reviewerType === "ai" && reviewDiffContext) {
      packet.reviewDiff = reviewDiffValue(reviewDiffContext, scopeRows,
        packet.changedSurface?.inspection || []);
      packet.agreement = reviewAgreementValue(reviewDiffContext, packet);
    }
    // One checklist item per agreement scenario (N8), bound by the packet
    // digest. A delta round reviews only its correction scope.
    const checklist = reviewerType === "ai" && reviewDiffContext && scopeMode === "full"
      ? reviewScenarioChecklist({ ...reviewDiffContext, packetDir: packet.contractWorkspacePath }) : null;
    if (checklist?.items.length) packet.scenarioChecklist = checklist;
    delete packet.packetDigest;
    packet.packetDigest = canonicalPacketDigest(packet);
    return packet;
    }
    const packet = dispatchPacket();
    const attempt = dispatchReviewAttempt(id, {
      requestId,
      workspaceHash: request.workspaceHash,
      reviewerType,
      reviewerIdentity,
      reviewerProviderFamily,
      reviewerModelFamily,
      reviewerModelId,
      reviewerSessionId,
      sessionDeferred,
      scope: {
        mode: scopeMode,
        baseAttemptDigest,
        paths: scopePaths,
        digest: scopeDigest
      },
      packetDigest: packet.packetDigest,
      reviewRulesHash: packet.reviewRules?.hash ?? null,
      maxAiAttempts,
      maxInfrastructureRetries
    });
    const updated = {
      ...request,
      status: "dispatched",
      dispatchedAt: now(),
      dispatch: {
        attemptDigest: attempt.digest,
        attempt: attempt.attempt,
        reviewer: {
          type: reviewerType,
          identity: reviewerIdentity,
          providerFamily: reviewerProviderFamily,
          modelFamily: reviewerModelFamily,
          modelId: reviewerModelId,
          sessionId: reviewerSessionId
        },
        scope: attempt.scope
      },
      packet,
      packetDigest: packet.packetDigest
    };
    authorityStore.replace(entry, updated);
    console.log(JSON.stringify(updated, null, 2));
    return updated;
  }

  function dispatchAuthority(id, flags = {}) {
    return withAuthorityLock(id, () => dispatchAuthorityUnlocked(id, flags));
  }

  const abortAuthorityUnlocked = abortAuthorityOperation.bind(null, {
    authorityStore, reviewAttemptByDigest, reviewHistoryState, loadRuntime,
    completeReviewAttempt, now, fail, output: console,
    // The latest delivered AI attempt still lacks a receipt and belongs to
    // this request.
    unrecordedRequestResult: (id, request) => {
      const latest = unrecordedDeliveredAiResponse(
        id, reviewHistoryState(id, loadRuntime(id)), request.provider);
      return Boolean(latest && latest.requestId === request.requestId);
    }
  });

  function abortAuthority(id, flags = {}) {
    return withAuthorityLock(id, () => abortAuthorityUnlocked(id, flags));
  }

  const sessionTelemetryProvenance = sessionTelemetryProvenanceOperation.bind(
    null, { root, readFile: readFileSync });

  function mainSessionProvenance(id, flags, subject = {}) {
    const environment = mainSessionEnvironment(process.env);
    const boundSession = bindMainSession({ fail }, flags, environment);
    const telemetry = sessionTelemetryProvenance(id, boundSession);
    return mainSessionProvenanceValue(flags, subject, process.env, {
      environment, boundSession
    }, telemetry);
  }

  const NO_CONFIGURED_REVIEWER =
    "no named reviewer is configured; review.fallbackReviewers routes the review to the main session";

  function mainSessionHandback(id, requestId, configuredIdentity,
    infrastructureError, mainSession, mainDispatched, subject) {
    const template = responseTemplate(mainDispatched);
    template.evidence["subject-actor"] = subject.identity;
    if (subject.sessionId) {
      template.evidence["subject-session"] = subject.sessionId;
      template.evidence["subject-provider-family"] = subject.providerFamily;
      template.evidence["subject-model-family"] = subject.modelFamily;
      template.evidence["subject-model"] = subject.modelId;
    } else {
      delete template.evidence["subject-session"];
      delete template.evidence["subject-provider-family"];
      delete template.evidence["subject-model-family"];
      delete template.evidence["subject-model"];
    }
    return {
      status: "needs-main-session-review",
      changeId: id,
      requestId,
      failedReviewer: configuredIdentity,
      infrastructureError,
      ...(configuredIdentity ? {} : { reason: NO_CONFIGURED_REVIEWER }),
      reviewer: mainSession,
      packet: mainDispatched.packet,
      responseTemplate: template,
      next: {
        record: `cloop authority record ${id} --request ${requestId} --response <response.json>`
      }
    };
  }

  function configuredReviewerRoute(settings, request, explicitReviewer = null,
    automaticReviewer = null) {
    if (explicitReviewer) return explicitReviewer;
    if (automaticReviewer) return automaticReviewer;
    const threshold = Number(settings.infraFailureThreshold || 1);
    const fallbacks = reviewFallbacks(settings);
    const configured = configuredReviewerNames(settings);
    const attempts = request.fallbackAttempts || [];
    for (const reviewer of configured) {
      if (!reviewerInstalled(reviewer)) continue;
      const failures = attempts.filter((attempt) =>
        attempt.reviewer === reviewer && !attempt.bindingRecoveredAt).length;
      if (failures < threshold) return reviewer;
    }
    return fallbacks.includes("main-session") ? "main-session" : null;
  }

  function reviewFallbacks(settings) {
    return Array.isArray(settings.fallbackReviewers)
      ? settings.fallbackReviewers
      : settings.fallbackReviewer ? [settings.fallbackReviewer] : [];
  }

  // Named reviewers routing may try before the main session, in order.
  function configuredReviewerNames(settings) {
    return [settings.defaultReviewer,
      ...reviewFallbacks(settings).filter((name) => name !== "main-session")]
      .filter(Boolean);
  }

  // Configured reviewers whose CLI is absent on this host. They are skipped by
  // routing, so without a recorded failure the main-session fallback would be
  // unreachable on a host that has no reviewer CLI at all.
  function uninstalledConfiguredReviewers(settings) {
    return configuredReviewerNames(settings)
      .filter((name) => !reviewerInstalled(name));
  }

  function recoverReviewBindingsUnlocked(id, requestId = null) {
    let recovered = false;
    for (const entry of authorityStore.list(id)) {
      const request = entry.value;
      if (requestId && request.requestId !== requestId) continue;
      if (request.type !== "review" || request.status !== "infrastructure-exhausted" ||
          !["packet", "result"].includes(request.bindingFailure) ||
          request.workspaceHash !== authorityWorkspaceHash(id, request.provider)) continue;
      const failure = request.fallbackAttempts?.at(-1);
      if (!failure?.reportReference) continue;
      const failedAttempt = reviewAttemptByDigest(id, failure.attemptDigest);
      if (canonicalPacketDigest(request.packet) !== request.packetDigest ||
          failedAttempt?.packetDigest !== request.packetDigest ||
          failedAttempt.status !== "completed" || failedAttempt.resultStatus !== "error") continue;
      const report = readJson(resolve(root, failure.reportReference), null);
      if (report?.status !== "error" || report.changeId !== id) continue;
      const packet = structuredClone(request.packet);
      if (!Array.isArray(packet?.reviewScope?.paths)) continue;
      // Restore location metadata lost by old delta projection, never scope.
      const inspection = packet.changedSurface?.inspection;
      if (Array.isArray(inspection) && !inspection.some((row) => row.repositoryId === "root")) {
        const control = reviewPacketValue(id).changedSurface?.inspection
          ?.find((row) => row.repositoryId === "root");
        if (control) inspection.push({ ...control, paths: [], pathCount: 0, truncated: false });
      }
      if (reviewPacketIssues(packet).length || request.bindingFailure === "result" &&
          (!validReview({ ...report, status: "pass" }) || reviewFindingIssues(report, packet).length)) continue;
      if (!reviewerStatus(failure.reviewer).ok) continue;
      const at = now();
      delete packet.packetDigest;
      packet.packetDigest = canonicalPacketDigest(packet);
      const { bindingFailure: _bindingFailure, ...rest } = request;
      authorityStore.replace(entry, {
        ...rest, status: "requested", packet, packetDigest: packet.packetDigest,
        bindingRecoveredAt: at,
        fallbackAttempts: request.fallbackAttempts.map((row) =>
          row === failure ? { ...row, bindingRecoveredAt: at } : row)
      });
      // The immutable attempt and its infrastructure budget remain consumed.
      // Only the repaired binding's reviewer-routing failure is released.
      recovered = true;
    }
    return recovered;
  }

  function recoverReviewBindings(id) {
    return withAuthorityLock(id, () => recoverReviewBindingsUnlocked(id));
  }

  function authorityStatusValue(id, requestId = null) {
    loadRuntime(id);
    const workspaceHash = relevantHash(id);
    // Scoped requests carry their own hash; status compares against the
    // composite for unscoped ones only.
    const result = authorityStore.status(id, workspaceHash, requestId,
      (request) => authorityWorkspaceHash(id, request.provider));
    if (!result.found) fail(`unknown authority request '${requestId}'`);
    const waived = new Set(currentWaivers(loadRuntime(id), workspaceHash).map((row) => row.capability));
    return { ...result.value, requests: result.value.requests.map((request) =>
      waived.has(request.type) ? { ...request, status: "user-waived", originalStatus: request.status } : request) };
  }

  // The response shape is a contract. Without a way to emit it, a responder
  // discovers it one rejection at a time while the person who gave the verdict
  // waits. The identity fields are prefilled because those are exactly the
  // ones `validateResponse` matches against the request.
  const responseTemplate = authorityResponseTemplate.bind(null, {
    protocolVersion, expandList, listCount
  });

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

  function recordAuthorityInfrastructureError(entry, request, requestId,
    responsePath) {
    authorityStore.replace(entry, {
      ...request,
      status: "error",
      infrastructureError: true,
      responseDigest: fileDigest(responsePath),
      receiptDigest: null,
      completedAt: now()
    });
    console.log(`AUTHORITY ${requestId}: infrastructure error\n  receipt: unchanged\n  next: repair the configured reviewer, run doctor --stage prove, then request the bounded retry`);
  }

  function recordAuthorityReceipt(id, entry, request, requestId, response,
    responsePath, evidenceFlags, proofRun = null) {
    const priorPath = receiptPath(id, request.provider);
    const prior = existsSync(priorPath) ? readFileSync(priorPath) : null;
    // A review started beside proof collection names its run explicitly, so
    // the receipt never depends on whether collection is still active.
    const runBinding = proofRun?.proofRunId &&
      proofRun.workspaceHash === request.workspaceHash ? {
        proofRunId: proofRun.proofRunId,
        workspaceSnapshotId: proofRun.workspaceSnapshotId || null
      } : {};
    recordReceipt(id, request.provider, response.status, {
      ...evidenceFlags,
      ...runBinding,
      claims: request.claimIds.join(","), workspaceHash: request.workspaceHash,
      "review-attempt": request.dispatch?.attemptDigest,
      source: evidenceFlags.source || `authority-request:${requestId}`,
      "recorded-by": evidenceFlags["recorded-by"] || `authority-bridge:${requestId}`
    });
    const validity = receiptValidity(id, request.provider, request.workspaceHash);
    if (response.status === "pass" && validity.validity !== "valid") {
      if (prior) writeFileSync(priorPath, prior); else if (existsSync(priorPath)) rmSync(priorPath);
      fail(`authority response produced invalid evidence: ${validity.validity}`);
    }
    const receiptDigest = fileDigest(priorPath);
    authorityStore.complete(entry, request, response, fileDigest(responsePath), receiptDigest);
    console.log(`AUTHORITY ${requestId}: ${response.status}\n  receipt: ${relative(root, priorPath)}`);
  }

  function recordAuthorityUnlocked(id, flags = {}) {
    const { requestId, responsePath, entry, request, undispatched } = recordAuthorityRequest(id, flags);
    const response = readJson(responsePath);
    // Every problem known before validation, at once, instead of one per run.
    const preflight = authorityResponsePreflightIssues({
      request, response, undispatched,
      // The receipt validator's bases: the root and the provider's workspace.
      referenceExists: (reference) => [root, providerWorkspace(id, request.provider)]
        .some((base) => base && existsSync(resolve(base, reference)))
    });
    if (preflight.length)
      fail(`authority response for '${requestId}' cannot be recorded:\n  - ${preflight.join("\n  - ")}`);
    const validated = authorityStore.validateResponse(response, request, id);
    if (!validated.valid) fail(validated.reason);
    const evidenceFlags = validated.evidence;
    const reviewResult = validateDispatchedReviewResponse(request, response,
      evidenceFlags);
    completeDispatchedReview(id, entry, request, reviewResult && {
      ...reviewResult, responseStatus: response.status
    });
    // A configured reviewer/tool failure is infrastructure telemetry, not a
    // delivered review verdict. Persist the completed error attempt and close
    // this request, but do not overwrite an earlier full/delta receipt or
    // manufacture a baseline receipt from an error. The bounded infrastructure
    // retry therefore starts full when no delivered baseline exists and keeps
    // a prior delivered baseline when a closure runner failed.
    if (request.type === "review" && response.status === "error") {
      recordAuthorityInfrastructureError(entry, request, requestId, responsePath);
      return;
    }
    recordAuthorityReceipt(id, entry, request, requestId, response, responsePath,
      evidenceFlags, flags.proofRun || null);
  }

  function recordAuthority(id, flags = {}) {
    return withAuthorityLock(id, () => recordAuthorityUnlocked(id, flags));
  }

  const recordVerifiedCi = recordVerifiedCiOperation.bind(null, {
    providerConfig,
    resolvePath: resolve,
    pathExists: existsSync,
    readJson,
    providerWorkspaceHash,
    providerRepository,
    providerWorkspace,
    gitHead,
    validateSignedCiEnvelope,
    ciEvidenceProtocolVersion,
    recordReceipt,
    providerClaims,
    fail,
    output: console
  });

  // The bounded infrastructure recovery consumed by a failed reviewer run has
  // no automatic escape: the guard's own message routes the operator through a
  // provider repair and doctor. This is that route — it re-runs the reviewer
  // diagnosis in-process and acknowledges the consumed attempts only when the
  // diagnosis passes and the decision reference is fresh.
  const resetInfrastructureAuthorityUnlocked =
    resetInfrastructureAuthorityOperation.bind(null, {
      validate, reviewerStatus, acknowledgeInfrastructureAttempts, fail,
      authorityStore, now, output: console
    });

  const resetInfrastructureAuthority = lockedAuthorityOperation(
    withAuthorityLock, resetInfrastructureAuthorityUnlocked);

  const extendReviewAuthority = lockedAuthorityOperation(withAuthorityLock,
    extendReviewAuthorityOperation.bind(null, {
      validate, authorityStore, reviewPolicy, deliveredAiAttempts,
      effectiveReviewAttemptLimit, grantExtraAiWave, fail, output: console
    }));

  // A moved base whose replay altered the change's diff expires a delivered
  // passing verdict through no fault of the work. This route releases exactly
  // that attempt from the wave budget, on a recorded user decision, so the
  // fresh review the move forces cannot brick the change at the cap. No
  // reviewer diagnosis here — nothing is broken; only the accounting moves.
  function resetBaseMoveAuthority(id, flags = {}) {
    return withAuthorityLock(id, () => {
      validate(id, "active", { quiet: true });
      const decisionRef = String(flags["decision-ref"] || "").trim();
      if (!decisionRef) fail("authority reset-base-move requires --decision-ref <ref>");
      const result = acknowledgeBaseMoveAttempts(id, decisionRef);
      console.log(`AUTHORITY ${id}: base-move review release\n  movement: ${
        result.movementKey}\n  released: ${result.digests.length} attempt(s)\n  decision: ${
        decisionRef}\n  next: request and dispatch the AI review again`);
      return result;
    });
  }

  const {
    runAuthorityReviewer, runAuthorityReviewerAsync
  } = createAuthorityReviewerRun({
    NO_CONFIGURED_REVIEWER, authorityStore, authorityWorkspaceHash, clearSnapshotCache,
    completeReviewAttempt, configuredReviewerNames, configuredReviewerRoute,
    deliveredAiAttempts, dispatchAuthorityUnlocked, fail, foundationPolicy, loadRuntime,
    mainSessionHandback, mainSessionProvenance, now, protocolVersion,
    recordAuthorityUnlocked, recoverReviewBindingsUnlocked, reviewAttemptByDigest,
    reviewPolicy, reviewerConfig, root, runConfiguredReview, runConfiguredReviewAsync,
    stableHash, uninstalledConfiguredReviewers, unrecordedDeliveredAiResponse,
    withAuthorityLock, writeJson
  });

  return {
    authorityProvider,
    authorityPacket,
    requestAuthority,
    dispatchAuthority,
    runAuthorityReviewer,
    runAuthorityReviewerAsync,
    abortAuthority,
    resetInfrastructureAuthority,
    extendReviewAuthority,
    recoverReviewBindings,
    resetBaseMoveAuthority,
    unrecordedDeliveredAiResponse,
    authorityStatusValue,
    showAuthorityStatus,
    recordAuthority,
    recordVerifiedCi
  };
}
