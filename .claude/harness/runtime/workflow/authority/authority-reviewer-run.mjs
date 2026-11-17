import { REVIEW_DISPATCH_TIMEOUT_MS } from "../../core/user-decisions.mjs";
import { join } from "node:path";
import { acquireProcessLock, isProcessAlive } from "../../core/process-lock.mjs";
import { authorityRunCommand, authorityStatusCommand } from "../../core/authority-run-command.mjs";
import { deltaClosureIssue } from "../../evidence/configured-reviewer.mjs";
import {
  checkpointReviewResult, recoverReviewResult
} from "../../evidence/review-result-recovery.mjs";
import { normalizeReviewCompletionFindings } from "../../evidence/review-attempt-store.mjs";
import { reviewModelClass } from "../../evidence/review-diff.mjs";

export function createAuthorityReviewerRun(ctx) {
  const {
    NO_CONFIGURED_REVIEWER, authorityStore, authorityWorkspaceHash, clearSnapshotCache,
    completeReviewAttempt, configuredReviewerNames, configuredReviewerRoute,
    deliveredAiAttempts, dispatchAuthorityUnlocked, fail, foundationPolicy, loadRuntime,
    mainSessionHandback, mainSessionProvenance, now, protocolVersion,
    recordAuthorityUnlocked, recoverReviewBindingsUnlocked, reviewAttemptByDigest,
    reviewPolicy, reviewerConfig, root, runConfiguredReview, runConfiguredReviewAsync,
    stableHash, uninstalledConfiguredReviewers, unrecordedDeliveredAiResponse,
    withAuthorityLock, writeJson
  } = ctx;

  // Current concrete `authority run` command for a stored request, from the
  // request's recorded subject and the calling host's environment.
  function nextRunCommand(id, requestId) {
    const request = authorityStore.list(id)
      .find((row) => row.value.requestId === requestId)?.value || { requestId };
    const run = authorityRunCommand(id, { ...request, requestId });
    return { command: run.command,
      ...(run.placeholders.length ? { placeholders: run.placeholders } : {}),
      ...(run.unresolved.length ? { unresolved: run.unresolved } : {}) };
  }

  function failWithNext(message, next) {
    const { command, placeholders = [] } = typeof next === "string" ? { command: next } : next;
    fail(`${message}. Next: ${command}${placeholders.length
      ? ` (supply ${placeholders.map((name) => `<${name}>`).join(", ")})` : ""}`);
  }

  function authorityRunSubject(flags, id) {
    const requestId = String(flags.request || "");
    if (!requestId) fail("authority run requires --request <id>");
    const subjectActor = String(flags["subject-actor"] || "").trim();
    if (!subjectActor)
      failWithNext("authority run requires --subject-actor", nextRunCommand(id, requestId));
    const subjectSession = String(flags["subject-session"] || "").trim() || null;
    const subjectProvider = String(flags["subject-provider-family"] || "").trim().toLowerCase() || null;
    const subjectFamily = String(flags["subject-model-family"] || "").trim().toLowerCase() || null;
    const subjectModel = String(flags["subject-model"] || "").trim() || null;
    const aiSubject = [subjectSession, subjectProvider, subjectFamily, subjectModel]
      .some(Boolean);
    if (aiSubject && [subjectSession, subjectProvider, subjectFamily, subjectModel]
      .some((value) => !value))
      failWithNext("AI implementation provenance requires subject session, provider family, model family, and model",
        nextRunCommand(id, requestId));
    return { requestId, subjectActor, subjectSession, subjectProvider,
      subjectFamily, subjectModel, aiSubject };
  }

  function authorityReviewerConfiguration(reviewerName, request, modelTier = null) {
    if (reviewerName !== "main-session") return reviewerConfig(reviewerName, modelTier);
    return {
      identity: request.fallbackAttempts?.at(-1)?.reviewer || "configured-reviewer",
      providerFamily: "",
      modelFamily: ""
    };
  }

  // The reviewer configuration that actually ran a dispatched request: the
  // model class whose identity and model match what the dispatch recorded.
  // Recomputing the class after the attempt completed counts that attempt and
  // would expect the configured model instead of a cheaper first round.
  function dispatchedReviewerConfiguration(reviewerName, request) {
    const ran = request.dispatch?.reviewer;
    if (!ran?.identity || reviewerName === "main-session") return null;
    for (const tier of ["fast", "standard", "configured"]) {
      const candidate = authorityReviewerConfiguration(reviewerName, request, tier);
      if (["identity", "providerFamily", "modelFamily", "modelId"].every((field) =>
        String(candidate[field] || "") === String(ran[field] || "")))
        return candidate;
    }
    return null;
  }

  function authorityReviewerSeparationIssue(reviewerName, configured, reviewSettings, subject) {
    const configuredProvider = String(configured.providerFamily).toLowerCase();
    const configuredFamily = String(configured.modelFamily).toLowerCase();
    const sameFamily = subject.aiSubject && subject.subjectProvider === configuredProvider &&
      subject.subjectFamily === configuredFamily;
    if (sameFamily && reviewSettings.diversity !== "single-model")
      return `configured reviewer '${reviewerName}' shares the implementation provider/model family; choose a diverse configured reviewer or commit review.diversity='single-model' before Build`;
    if (subject.aiSubject && reviewSettings.independence !== "self" &&
        subject.subjectActor.toLowerCase() === configured.identity.toLowerCase())
      return `configured reviewer '${reviewerName}' shares the implementation identity; use a distinct reviewer identity/session or commit review.independence='self' before Build`;
    return null;
  }

  function assertAuthorityReviewerSeparation(reviewerName, configured, reviewSettings, subject) {
    const issue = authorityReviewerSeparationIssue(reviewerName, configured, reviewSettings, subject);
    if (issue) fail(issue);
  }

  // N8 (3a): a fast-tier round whose scenario coverage is unparseable or has
  // an unsure scenario is re-run once on the configured model with the same
  // dispatched packet. It is not a new dispatch or AI wave. A missing scenario
  // is already an actionable major finding, so it goes straight to repair.
  // Returns the configured reviewer to escalate to, or null.
  function scenarioEscalationReviewer(reviewerName, configured, requestValue,
    reviewSettings, subject, packet, report) {
    if (!["fast", "standard"].includes(configured.modelTier) || reviewerName === "main-session" ||
        report?.status === "error" || !packet?.scenarioChecklist?.items?.length) return null;
    const coverage = report.scenarioCoverage;
    if (coverage && (coverage.missing.length > 0 || coverage.unsure.length === 0)) return null;
    const escalated = authorityReviewerConfiguration(reviewerName, requestValue, "configured");
    if (!escalated || ["fast", "standard"].includes(escalated.modelTier) ||
        escalated.modelId === configured.modelId)
      return null;
    if (authorityReviewerSeparationIssue(reviewerName, escalated, reviewSettings, subject))
      return null;
    return escalated;
  }

  function authorityRunReviewer(id, flags, subject) {
    const { requestId } = subject;
    const reviewSettings = foundationPolicy().review || {};
    const requestEntry = authorityStore.list(id)
      .find((row) => row.value.requestId === requestId);
    if (!requestEntry) fail(`unknown authority request '${requestId}'`);
    if (requestEntry.value.status === "infrastructure-exhausted" &&
        recoverReviewBindingsUnlocked(id, requestId))
      requestEntry.value = authorityStore.list(id)
        .find((row) => row.value.requestId === requestId).value;
    if (requestEntry.value.status === "infrastructure-exhausted")
      failWithNext("configured reviewer infrastructure retries are exhausted for this request",
        authorityStatusCommand(id, requestId));
    const reviewerName = configuredReviewerRoute(reviewSettings, requestEntry.value,
      String(flags.reviewer || "").trim() || null,
      String(flags["automatic-reviewer"] || "").trim() || null);
    const explicitRoute = String(flags.reviewer || "").trim() ||
      String(flags["automatic-reviewer"] || "").trim();
    const uninstalled = explicitRoute ? [] : uninstalledConfiguredReviewers(reviewSettings);
    if (!reviewerName) {
      if (uninstalled.length)
        fail(`reviewer CLI not installed: ${uninstalled.join(", ")}, and no main-session fallback is configured. Install the reviewer CLI (see DEVELOPER-SETUP.md step 6), or set foundation.json review to {"independence":"self","fallbackReviewers":["main-session"]} to let the calling session review`);
      failWithNext("configured reviewer infrastructure retries are exhausted; configure review.fallbackReviewers or record a verdict",
        authorityStatusCommand(id, requestId));
    }
    // With no named reviewer configured there is nothing to try first: the
    // main session is the configured reviewer, not a fallback after a failure.
    if (reviewerName === "main-session" && !requestEntry.value.mainSessionFallback &&
        !configuredReviewerNames(reviewSettings).length)
      return { reviewSettings, requestEntry, reviewerName,
        configured: authorityReviewerConfiguration(reviewerName, requestEntry.value),
        noConfiguredReviewer: true };
    if (reviewerName === "main-session" && !requestEntry.value.mainSessionFallback &&
        uninstalled.length) {
      // Record the missing CLI as the configured reviewer's infrastructure
      // failure so the existing main-session fallback is reachable. Nothing
      // is spawned; independence rules apply to the main-session reviewer.
      const missingName = uninstalled[0];
      const configured = authorityReviewerConfiguration(missingName, requestEntry.value);
      return { reviewSettings, requestEntry, reviewerName: missingName, configured,
        notInstalled: true };
    }
    if (reviewerName === "main-session" && !requestEntry.value.mainSessionFallback)
      failWithNext("main-session fallback was selected without a recorded configured reviewer failure; omit --reviewer and let routing choose",
        nextRunCommand(id, requestId));
    // The first low or medium round runs on its tier's cheaper model class
    // (reviewModelClass); high, later rounds, and pinned triggers keep the
    // configured model.
    const routing = reviewPolicy(id);
    const runtimeState = loadRuntime(id);
    const modelTier = reviewModelClass({
      tier: routing.tier, deliveredAiCount: deliveredAiAttempts(id).length,
      triggers: routing.triggers,
      declaredReview: Boolean(runtimeState.reviewRequired) && !runtimeState.reviewKeywordOnly,
      settings: reviewSettings
    });
    let configured = authorityReviewerConfiguration(
      reviewerName, requestEntry.value, modelTier);
    // A cheaper standard-class model that would share the implementation's
    // provider/model family under a diversity requirement never blocks the
    // review: the configured model runs instead.
    if (configured.modelTier === "standard" && authorityReviewerSeparationIssue(
      reviewerName, configured, reviewSettings, subject))
      configured = authorityReviewerConfiguration(
        reviewerName, requestEntry.value, "configured");
    assertAuthorityReviewerSeparation(reviewerName, configured, reviewSettings, subject);
    return { reviewSettings, requestEntry, reviewerName, configured };
  }

  // The reviewer call is the one yielded step, so `authority run` (sync) and
  // the concurrent Prove review (async) share every guard and record rule.
  function runAuthorityReviewerUnlocked(id, flags = {}) {
    const steps = authorityReviewerSteps(id, flags);
    let step = steps.next();
    while (!step.done) step = steps.next(runConfiguredReview(step.value));
    return step.value;
  }

  async function runAuthorityReviewerUnlockedAsync(id, flags = {}) {
    const steps = authorityReviewerSteps(id, flags);
    let step = steps.next();
    while (!step.done) step = steps.next(await (runConfiguredReviewAsync
      ? runConfiguredReviewAsync(step.value) : runConfiguredReview(step.value)));
    return step.value;
  }

  function* authorityReviewerSteps(id, flags = {}) {
    const subject = authorityRunSubject(flags, id);
    const { requestId, subjectActor, subjectSession, subjectProvider,
      subjectFamily, subjectModel, aiSubject } = subject;
    const reviewer = authorityRunReviewer(id, flags, subject);
    const { reviewSettings, reviewerName, configured } = reviewer;
    let { requestEntry } = reviewer;
    function resumeMainSessionFallback() {
      if (!requestEntry.value.mainSessionFallback)
        return { handled: false, value: null };
      const fallback = requestEntry.value.mainSessionFallback;
      if (fallback.status !== "provenance-unavailable")
        fail(`${fallback.failedAttemptDigest === null ? "" : "configured reviewer already failed; "}complete the reserved main-session fallback with authority status/record instead of rerunning authority run`);
      const direct = fallback.failedAttemptDigest === null;
      const storedSubject = fallback.subject || {};
      const mainSession = mainSessionProvenance(id, flags, storedSubject);
      if (mainSession.missing.length) {
        const blocked = {
          status: "main-session-provenance-unavailable",
          changeId: id,
          requestId,
          failedReviewer: direct ? null :
            requestEntry.value.fallbackAttempts?.at(-1)?.reviewer || configured.identity,
          infrastructureError: direct ? null :
            requestEntry.value.fallbackAttempts?.at(-1)?.summary ||
            "configured reviewer infrastructure failed",
          ...(direct ? { reason: NO_CONFIGURED_REVIEWER } : {}),
          missing: mainSession.missing,
          action: `Expose the calling host session/model provenance and rerun authority run with --main-session-* fields${direct ? "" : "; the failed reviewer will not run again"}.`,
          next: nextRunCommand(id, requestId)
        };
        console.log(JSON.stringify(blocked, null, 2));
        return { handled: true, value: blocked };
      }
      const resumed = dispatchAuthorityUnlocked(id, {
        request: requestId,
        scope: fallback.scope,
        ...(fallback.scope === "delta"
          ? { "base-attempt": fallback.baseAttemptDigest } : {}),
        "reviewer-type": "ai",
        "reviewer-identity": mainSession.identity,
        "reviewer-provider-family": mainSession.providerFamily,
        "reviewer-model-family": mainSession.modelFamily,
        "reviewer-model": mainSession.modelId,
        "reviewer-session": mainSession.sessionId
      });
      const resumedEntry = authorityStore.list(id)
        .find((row) => row.value.requestId === requestId);
      authorityStore.replace(resumedEntry, {
        ...resumedEntry.value,
        mainSessionFallback: {
          ...resumedEntry.value.mainSessionFallback,
          status: "awaiting-response",
          reviewer: {
            identity: mainSession.identity,
            providerFamily: mainSession.providerFamily,
            modelFamily: mainSession.modelFamily,
            modelId: mainSession.modelId,
            sessionId: mainSession.sessionId
          },
          missingProvenance: []
        }
      });
      const handback = mainSessionHandback(id, requestId,
        direct ? null :
          requestEntry.value.fallbackAttempts?.at(-1)?.reviewer || configured.identity,
        direct ? null : requestEntry.value.fallbackAttempts?.at(-1)?.summary ||
          "configured reviewer infrastructure failed",
        mainSession, resumed, storedSubject);
      console.log(JSON.stringify(handback, null, 2));
      return { handled: true, value: handback };
    }
    const resumedFallback = resumeMainSessionFallback();
    if (resumedFallback.handled) return resumedFallback.value;
    let recoveredReport = null;
    function recoverOrphanedController(entry) {
      if (entry.value.status !== "dispatched") return entry;
      requestEntry = entry;
      const controller = requestEntry.value.configuredController;
      if (!controller && !entry.value.configuredResult)
        fail(`configured review dispatch '${requestId}' is indeterminate; do not rerun it automatically. Abort it with a reason, then request the next bounded route or pause`);
      if (controller && isProcessAlive(Number(controller.pid)))
        fail(`configured review dispatch '${requestId}' is still running in controller PID ${controller.pid}`);
      // An escalated checkpoint binds the configured model that produced it.
      const recoveredEscalation = entry.value.configuredResult?.modelEscalation || null;
      const expectedReviewer = recoveredEscalation
        ? authorityReviewerConfiguration(reviewerName, entry.value, "configured")
        : dispatchedReviewerConfiguration(reviewerName, entry.value) || configured;
      recoveredReport = recoverReviewResult(root, entry.value, subject, expectedReviewer,
        authorityWorkspaceHash(id, entry.value.provider));
      // The receipt carries the model that actually ran, never one recomputed
      // after its own attempt completed and changed the delivered count.
      if (recoveredReport)
        recoveredReport = { ...recoveredReport, finalReviewer: expectedReviewer,
          ...(recoveredEscalation ? { modelEscalation: recoveredEscalation } : {}) };
      if (recoveredReport) return entry;
      const attemptDigest = requestEntry.value.dispatch?.attemptDigest;
      const attempt = attemptDigest ? reviewAttemptByDigest(id, attemptDigest) : null;
      if (attempt?.status === "dispatched")
        completeReviewAttempt(id, attemptDigest, {
          reviewerSessionId: "",
          resultStatus: "error",
          findings: [],
          verifiedFindingIds: []
        });
      const currentEntry = authorityStore.list(id)
        .find((row) => row.value.requestId === requestId);
      const {
        dispatch: _orphanedDispatch,
        configuredController: _orphanedController,
        ...reopenable
      } = currentEntry.value;
      authorityStore.replace(currentEntry, {
        ...reopenable,
        status: "requested",
        orphanedControllers: [
          ...(currentEntry.value.orphanedControllers || []),
          {
            ...controller,
            recoveredAt: now(),
            result: "infrastructure-error"
          }
        ]
      });
      return authorityStore.list(id)
        .find((row) => row.value.requestId === requestId);
    }
    requestEntry = recoverOrphanedController(requestEntry);
    const state = loadRuntime(id);
    const history = state.reviewHistory || {
      aiAttempts: 0, totalAttempts: 0, chainHead: null
    };
    // Delivered attempts only: a completion whose resultStatus is "error"
    // never gains a receipt, so counting it here locked the change out of
    // review forever.
    const deliveredAi = deliveredAiAttempts(id, history);
    if (!recoveredReport && unrecordedDeliveredAiResponse(id, history, requestEntry.value.provider))
      fail("a completed AI response has no matching recorded receipt; repair that authority record or pause instead of starting another configured reviewer");
    const scope = recoveredReport ? requestEntry.value.dispatch.scope.mode
      : deliveredAi.length === 0 ? "full" : "delta";
    // Starts (or blocks on provenance for) the main-session review. `failure`
    // is the configured reviewer's recorded infrastructure failure, or null
    // when no named reviewer is configured and the main session reviews first.
    function startMainSessionReview(failure) {
      const mainSession = mainSessionProvenance(id, flags, aiSubject ? {
        identity: subjectActor,
        sessionId: subjectSession,
        providerFamily: subjectProvider,
        modelFamily: subjectFamily,
        modelId: subjectModel
      } : {});
      const refreshedEntry = authorityStore.list(id)
        .find((row) => row.value.requestId === requestId);
      authorityStore.replace(refreshedEntry, {
        ...refreshedEntry.value,
        mainSessionFallback: {
          status: mainSession.missing.length
            ? "provenance-unavailable" : "dispatching",
          failedAttemptDigest: failure ? failure.attemptDigest : null,
          scope,
          baseAttemptDigest: scope === "delta" ? deliveredAi.at(-1).digest : null,
          subject: {
            identity: subjectActor,
            sessionId: subjectSession,
            providerFamily: subjectProvider,
            modelFamily: subjectFamily,
            modelId: subjectModel
          },
          reviewer: mainSession.missing.length ? null : {
            identity: mainSession.identity,
            providerFamily: mainSession.providerFamily,
            modelFamily: mainSession.modelFamily,
            modelId: mainSession.modelId,
            sessionId: mainSession.sessionId
          },
          missingProvenance: mainSession.missing
        }
      });
      if (mainSession.missing.length) {
        const blocked = {
          status: "main-session-provenance-unavailable",
          changeId: id,
          requestId,
          failedReviewer: failure ? failure.reviewer : null,
          infrastructureError: failure ? failure.summary : null,
          ...(failure ? {} : { reason: NO_CONFIGURED_REVIEWER }),
          missing: mainSession.missing,
          action: `Expose the calling host session/model provenance and rerun authority run with --main-session-* fields${failure ? "; the failed reviewer will not run again" : ""}.`,
          next: nextRunCommand(id, requestId)
        };
        console.log(JSON.stringify(blocked, null, 2));
        return { handled: true, value: blocked };
      }
      const mainDispatched = dispatchAuthorityUnlocked(id, {
        request: requestId,
        scope,
        ...(scope === "delta" ? {
          "base-attempt": deliveredAi.at(-1).digest
        } : {}),
        "reviewer-type": "ai",
        "reviewer-identity": mainSession.identity,
        "reviewer-provider-family": mainSession.providerFamily,
        "reviewer-model-family": mainSession.modelFamily,
        "reviewer-model": mainSession.modelId,
        "reviewer-session": mainSession.sessionId
      });
      const mainEntry = authorityStore.list(id)
        .find((row) => row.value.requestId === requestId);
      authorityStore.replace(mainEntry, {
        ...mainEntry.value,
        mainSessionFallback: {
          ...mainEntry.value.mainSessionFallback,
          status: "awaiting-response"
        }
      });
      const handback = mainSessionHandback(id, requestId, failure ? failure.reviewer : null,
        failure ? failure.summary : null, mainSession, mainDispatched, {
          identity: subjectActor,
          sessionId: subjectSession,
          providerFamily: subjectProvider,
          modelFamily: subjectFamily,
          modelId: subjectModel
        });
      console.log(JSON.stringify(handback, null, 2));
      return { handled: true, value: handback };
    }
    if (reviewer.noConfiguredReviewer) return startMainSessionReview(null).value;
    const workspace = loadRuntime(id).workspace?.path || root;
    const dispatched = dispatchAuthorityUnlocked(id, {
      request: requestId,
      scope,
      ...(scope === "delta" ? { "base-attempt": deliveredAi.at(-1).digest } : {}),
      "reviewer-type": "ai",
      "reviewer-identity": configured.identity,
      "reviewer-provider-family": configured.providerFamily,
      "reviewer-model-family": configured.modelFamily,
      "reviewer-model": configured.modelId,
      "reviewer-session-deferred": true
    });
    const controllerEntry = authorityStore.list(id)
      .find((row) => row.value.requestId === requestId);
    authorityStore.replace(controllerEntry, {
      ...controllerEntry.value,
      configuredController: {
        version: 1,
        pid: process.pid,
        reviewer: configured.identity,
        subject,
        startedAt: now()
      }
    });
    const reviewRequest = {
      changeId: id,
      timeoutMs: REVIEW_DISPATCH_TIMEOUT_MS,
      reviewer: reviewerName,
      modelTier: configured.modelTier || null,
      workspace,
      packet: dispatched.packet,
      forbiddenSessionIds: reviewSettings.independence === "self" ? [] : [
        subjectSession,
        ...(scope === "delta" ? [deliveredAi.at(-1)?.reviewerSessionId] : [])
      ].filter(Boolean)
    };
    let report = recoveredReport || (reviewer.notInstalled ? {
      status: "error", summary: `reviewer CLI not installed: ${reviewerName}`,
      findings: [], verifiedFindingIds: [], reportReference: null,
      reviewer: { sessionId: "" }
    } : yield reviewRequest);
    let finalReviewer = recoveredReport?.finalReviewer || configured;
    let modelEscalation = recoveredReport?.modelEscalation || null;
    const escalated = recoveredReport ? null : scenarioEscalationReviewer(reviewerName,
      configured, requestEntry.value, reviewSettings, subject, dispatched.packet, report);
    if (escalated) {
      // Same dispatch, packet, and digest; only the model changes. The fast
      // report stays on disk but is never checkpointed or recorded.
      modelEscalation = {
        escalatedFrom: configured.modelTier,
        reason: report.scenarioCoverage ? "scenario-coverage-gap" : "scenario-coverage-unparseable",
        fastModelId: configured.modelId,
        fastModelFamily: configured.modelFamily,
        fastReportReference: report.reportReference || null,
        modelId: escalated.modelId,
        modelFamily: String(escalated.modelFamily || "").toLowerCase() || null
      };
      finalReviewer = escalated;
      report = yield {
        ...reviewRequest,
        timeoutMs: REVIEW_DISPATCH_TIMEOUT_MS,
        modelTier: "configured",
        escalatedFrom: configured.modelTier
      };
    }
    // The verdict is about the bytes this dispatch carried. Anything that
    // changed them while the reviewer ran (a provider writing tracked files
    // beside a concurrent review, an edit) makes it a verdict on a superseded
    // workspace: it is never recorded or checkpointed. The attempt closes as
    // an error exactly like `authority abort`, the request ends aborted, and
    // the next pass requests a review bound to the current bytes. A recovered
    // checkpoint was already bound to its workspace hash on recovery.
    if (!recoveredReport && report.status !== "error") {
      clearSnapshotCache(id);
      const currentHash = authorityWorkspaceHash(id, requestEntry.value.provider);
      if (currentHash !== dispatched.workspaceHash) {
        completeReviewAttempt(id, dispatched.dispatch.attemptDigest, {
          reviewerSessionId: String(report.reviewer?.sessionId || "").trim(),
          resultStatus: "error", findings: [], verifiedFindingIds: []
        });
        const supersededEntry = authorityStore.list(id)
          .find((row) => row.value.requestId === requestId);
        const aborted = {
          ...supersededEntry.value, status: "aborted", abortedAt: now(),
          abortReason: "workspace changed while the reviewer ran; the verdict judged superseded content"
        };
        authorityStore.replace(supersededEntry, aborted);
        const superseded = {
          status: "review-superseded", changeId: id, requestId,
          reviewedWorkspaceHash: dispatched.workspaceHash, currentWorkspaceHash: currentHash,
          action: "The verdict was not recorded; advance requests a review of the current content."
        };
        console.log(JSON.stringify(superseded, null, 2));
        return superseded;
      }
    }
    const checkpoint = checkpointReviewResult(root, dispatched, subject, report);
    if (checkpoint) {
      const resultEntry = authorityStore.list(id)
        .find((row) => row.value.requestId === requestId);
      authorityStore.replace(resultEntry, {
        ...resultEntry.value,
        configuredResult: modelEscalation ? { ...checkpoint, modelEscalation } : checkpoint
      });
    }
    function handleConfiguredInfrastructureError() {
      if (report.status !== "error") return { handled: false, value: null };
      const failed = completeReviewAttempt(id,
        dispatched.dispatch.attemptDigest, {
          reviewerSessionId: String(report.reviewer?.sessionId || "").trim(),
          resultStatus: "error", findings: [], verifiedFindingIds: []
        });
      const failedEntry = authorityStore.list(id)
        .find((row) => row.value.requestId === requestId);
      const {
        dispatch: _failedDispatch,
        configuredController: _failedController,
        ...retryableRequest
      } = failedEntry.value;
      const failedRequest = {
        ...retryableRequest,
        status: "requested",
        fallbackAttempts: [
          ...(failedEntry.value.fallbackAttempts || []),
          {
            attemptDigest: failed.digest,
            reviewer: configured.identity,
            reportReference: report.reportReference,
            summary: report.summary
          }
        ]
      };
      authorityStore.replace(failedEntry, failedRequest);
      // Validation is deterministic for this packet/result. Changing models
      // cannot repair its binding; retain the error and existing resume route.
      const nextReviewer = report.retryable === false ? null
        : configuredReviewerRoute(reviewSettings, failedRequest);
      if (nextReviewer && nextReviewer !== "main-session") {
        const nextFlags = {
          ...flags,
          reviewer: undefined,
          "automatic-reviewer": nextReviewer
        };
        return { handled: true, retryFlags: nextFlags };
      }
      if (!nextReviewer) {
        authorityStore.replace(failedEntry, {
          ...failedRequest,
          status: "infrastructure-exhausted",
          infrastructureExhaustedAt: now(),
          ...(report.bindingFailure ? { bindingFailure: report.bindingFailure } : {}),
          infrastructureError: report.summary
        });
        const exhausted = {
          status: "configured-reviewer-infrastructure-exhausted",
          changeId: id,
          requestId,
          failedReviewer: configured.identity,
          infrastructureError: report.summary,
          attempts: failedRequest.fallbackAttempts,
          action: report.retryable === false
            ? "Repair the packet or finding bindings through the existing harness recovery; do not repeat the unchanged full review."
            : "Configure review.fallbackReviewers, repair reviewer infrastructure, or pause.",
          next: { command: authorityStatusCommand(id, requestId) }
        };
        console.log(JSON.stringify(exhausted, null, 2));
        return { handled: true, value: exhausted };
      }
      return startMainSessionReview({
        attemptDigest: failed.digest, reviewer: configured.identity, summary: report.summary
      });
    }
    const infrastructureResult = handleConfiguredInfrastructureError();
    if (infrastructureResult.retryFlags)
      return yield* authorityReviewerSteps(id, infrastructureResult.retryFlags);
    if (infrastructureResult.handled) return infrastructureResult.value;
    function validateConfiguredReviewResult() {
    const reviewerSession = String(report.reviewer?.sessionId || "").trim();
    const infrastructureError = report.status === "error";
    if (!reviewerSession && !infrastructureError)
      fail("configured reviewer did not emit an actual session ID; the review cannot be recorded truthfully");
    const findingIds = report.findings.map((finding) => finding.id);
    if (findingIds.some((findingId) => !findingId) ||
        new Set(findingIds).size !== findingIds.length)
      fail("configured reviewer finding IDs must be non-empty and unique");
    if ((scope === "delta" || dispatched.packet.closureFindings) && !infrastructureError) {
      const expectedIds = [...(dispatched.packet.closureFindings?.ids || [])].sort();
      const closureIssue = deltaClosureIssue({ expected: expectedIds,
        verified: report.verifiedFindingIds, status: report.status, findings: report.findings });
      if (closureIssue)
        fail(`AI ${closureIssue}`);
    }
    if (scope === "delta" && !infrastructureError) {
      const scoped = dispatched.dispatch.scope.paths || [];
      const outside = report.findings.filter((finding) => {
        const path = String(finding.path || "").replace(/^\.\//, "");
        return !path || !scoped.some((candidate) =>
          candidate === path || candidate.endsWith(`/${path}`));
      });
      if (outside.length)
        fail(`AI delta reviewer reported findings outside the dispatched correction scope: ${outside.map((finding) => finding.id).join(", ")}`);
    }
    return { reviewerSession, infrastructureError };
    }
    const { reviewerSession } = validateConfiguredReviewResult();
    const completion = {
        reviewerSessionId: reviewerSession,
        resultStatus: report.status,
        findings: report.findings,
        verifiedFindingIds: report.verifiedFindingIds,
        ...(modelEscalation ? { modelEscalation } : {}),
        ...(report.scenarioCoverage !== undefined
          ? { scenarioCoverage: report.scenarioCoverage } : {}),
        ...(report.specGaps?.length ? { specGaps: report.specGaps } : {})
      };
    const currentAttempt = recoveredReport && reviewAttemptByDigest(id,
      loadRuntime(id).reviewHistory?.chainHead);
    const alreadyCompleted = currentAttempt?.status === "completed";
    if (alreadyCompleted && (currentAttempt.requestId !== requestId ||
        currentAttempt.attempt !== dispatched.dispatch.attempt ||
        currentAttempt.workspaceHash !== dispatched.workspaceHash ||
        currentAttempt.reviewerSessionId !== reviewerSession ||
        currentAttempt.resultStatus !== report.status ||
        stableHash(currentAttempt.findings) !== stableHash(normalizeReviewCompletionFindings(completion)) ||
        stableHash(currentAttempt.verifiedFindingIds) !== stableHash([...report.verifiedFindingIds].sort())))
      fail("saved configured review result does not match its completed attempt");
    const completed = alreadyCompleted ? currentAttempt
      : completeReviewAttempt(id, dispatched.dispatch.attemptDigest, completion);
    const dispatchedEntry = authorityStore.list(id)
      .find((row) => row.value.requestId === requestId);
    const {
      configuredController: _completedController,
      ...completedRequest
    } = dispatchedEntry.value;
    const finalizedRequest = {
      ...completedRequest,
      dispatch: {
        ...dispatchedEntry.value.dispatch,
        attemptDigest: completed.digest,
        reviewer: {
          ...dispatchedEntry.value.dispatch.reviewer,
          ...(modelEscalation ? {
            modelFamily: modelEscalation.modelFamily, modelId: modelEscalation.modelId
          } : {}),
          sessionId: reviewerSession || null
        },
        ...(modelEscalation ? { modelEscalation } : {})
      }
    };
    authorityStore.replace(dispatchedEntry, finalizedRequest);
    const responsePath = join(root, ".foundation", "authority", id,
      `${requestId}-configured-review-response.json`);
    writeJson(responsePath, {
      version: Number(protocolVersion),
      requestId,
      changeId: id,
      type: "review",
      workspaceHash: dispatched.workspaceHash,
      status: report.status,
      evidence: {
        observed: report.summary,
        reference: [report.reportReference],
        reviewer: finalReviewer.identity,
        "reviewer-type": "ai",
        "reviewer-provider-family": finalReviewer.providerFamily,
        "reviewer-model-family": finalReviewer.modelFamily,
        "reviewer-model": finalReviewer.modelId,
        "reviewer-session": reviewerSession || null,
        // The model class actually run (fast|standard|configured), so reports
        // compare reviews by class as well as by model ID.
        "reviewer-model-tier": finalReviewer.modelTier || "configured",
        "subject-actor": subjectActor,
        ...(aiSubject ? {
          "subject-session": subjectSession,
          "subject-provider-family": subjectProvider,
          "subject-model-family": subjectFamily,
          "subject-model": subjectModel
        } : {}),
        "unresolved-blockers": report.findings.filter((finding) =>
          ["blocker", "major"].includes(finding.severity)).length,
        "verified-findings": report.verifiedFindingIds.length,
        findings: report.findings,
        verifiedFindingIds: report.verifiedFindingIds,
        ...(dispatched.dispatch.scope.mode === "delta"
          ? { "scope-path": dispatched.dispatch.scope.paths } : {})
      }
    });
    recordAuthorityUnlocked(id, {
      request: requestId, response: responsePath,
      ...(flags.proofRun ? { proofRun: flags.proofRun } : {})
    });
    return report;
  }

  function runAuthorityReviewer(id, flags = {}) {
    return withAuthorityLock(id, () => runAuthorityReviewerUnlocked(id, flags));
  }

  // Foreground and awaited by its caller: the authority lock is held across
  // the reviewer child, exactly like the synchronous route.
  async function runAuthorityReviewerAsync(id, flags = {}) {
    const locks = join(root, ".foundation", "locks");
    const lock = acquireProcessLock(join(locks, `authority-${id}.lock`), { now });
    if (!lock.acquired)
      fail(`authority mutation for '${id}' is already in progress; retry after it completes`);
    try { return await runAuthorityReviewerUnlockedAsync(id, flags); }
    finally { lock.release(); }
  }

  return {
    runAuthorityReviewer, runAuthorityReviewerAsync
  };
}
