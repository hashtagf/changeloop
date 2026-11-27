import {
  effectiveReviewAttemptLimit, reviewClosureWaveAvailable
} from "../core/authority-policy.mjs";
import { createServiceSessions } from "./proof-execution/service-sessions.mjs";
import { dirname, join } from "node:path";
import { blockedOutcomeStop } from "../core/blocked-decision.mjs";
import { createProofRepairStops } from "./proof-execution/repair-stops.mjs";
import { reviewExhaustedOutcome, prepareProofExecution, assertExecutionAvailable, runProofExecutionNodes, writeProofExecutionAdvance, proofCursorToken, proofExecutionResult, proofRunExecutionStops, stopProofRun, proofRunOutcome, stopProofCollection, beginProofCollection, rebindProofCollectionReceipts, assertProofCollectionOutcomes, persistProofCollectionArtifacts, proofCollectionOutcome, settleProofCollection } from "./proof-execution-steps.mjs";
import { createProofAdvanceRecord } from "./proof-advance-record.mjs";

export function createProofExecutionRuntime({
  proofReadinessValue, relevantSnapshot, loadRuntime, saveRuntime, now,
  requiredProviders, receiptValidity, rebindReusableReceipt,
  rebindDiffBoundReceipt, executionNodes,
  collectableExecutionNodes, startRequiredServices, runExecutionDag,
  durableArtifact, pendingTasks, proofPreflight, prove, proofAudit,
  readJson, writeJson = (..._args) => {}, proofPath, proofAdvancePath = (..._args) => null,
  proofAdvanceLockPath = (..._args) => null, providerCapability = (provider, _config) => provider,
  providerConfig = (..._args) => null, providerWorkspaceHash = () => null,
  reviewPolicy = (..._args) => ({ tier: "low", requiresHumanFinal: false }),
  deliveredAiAttempts = (..._args) => [], recordDeterministicReviewClosure = (..._args) => null,
  authorityStatusValue = () => ({ requests: [] }), requestAuthority = () => null,
  // (id, request, command) => Promise | null. Starts the harness-runnable
  // configured review in the foreground; null means the route is a handoff.
  startConcurrentReview = null,
  stableHash = (value) => JSON.stringify(value), die, markBlocked = (_stop) => {},
  // (id) => boolean. Whether the retained proof binds the current receipts;
  // advance treats a proven change whose receipts were re-earned as stale.
  deliveryProofCurrent = (..._args) => true,
  // Brings the change's sandboxes current (the root sandbox's nested
  // repository paths) before any provider runs in them.
  prepareWorkspace = (..._args) => {},
  // (id, workspaceHash) => { status: pass|fail|not-applicable, findings }.
  // Whether the change's tests fail on the base source (test-discrimination.mjs).
  testDiscrimination = null,
  // (id, provider) => finding | null. The performance-regression finding a
  // failed benchmark receipt carries (benchmark-runtime.mjs).
  performanceRegression = (_id, _provider) => null,
  // (id, provider) => receipt | null. A visual receipt carries the reviewer's
  // differences; receipts live beside proof.json.
  visualReceipt = (id, provider) => {
    try { return readJson(join(dirname(proofPath(id)), `${provider}.json`), null); }
    catch { return null; }
  }
}) {
  const memoryAdvance = new Map();
  const activeAdvance = new Set();
  let quietAdvanceOutput = false;
  const { startTrackedServices, stopAll } = createServiceSessions({ startRequiredServices });
  const prepareProofExecutionFor = prepareProofExecution.bind(null, {
    proofPreflight, pendingTasks, die, relevantSnapshot, loadRuntime, saveRuntime,
    now, requiredProviders, receiptValidity, rebindReusableReceipt,
    rebindDiffBoundReceipt
  });

  const {
    withProofAdvanceLock, readAdvance, recordProofProgress, proofProgressView, writeAdvance,
    readinessRequests, blockedAdvanceOutcome, printOutcome, reserveProviderExecution,
    clearActiveProofRun
  } = createProofAdvanceRecord({
    activeAdvance, loadRuntime, markBlocked, memoryAdvance, now, proofAdvanceLockPath,
    proofAdvancePath, quietAdvanceOutput, readJson, saveRuntime,
    statusRequests: (...args) => statusRequests(...args), writeJson
  });

  async function proofCollectUnlocked(id, options = {}) {
    const readiness = options.readiness || proofReadinessValue(id, "prove");
    if (!["READY", "NEEDS_USER_DECISION"].includes(readiness.status))
      return stopProofCollection(
        { printOutcome, markBlocked, runtimeProcess: process }, readiness, options);
    prepareWorkspace(id);
    const snapshot = options.snapshot || relevantSnapshot(id, null, true);
    const execution = options.execution || executionNodes(id, snapshot.workspaceHash);
    const { nodes, unavailable } = execution;
    if (unavailable.length)
      die(`provider environment unavailable: ${unavailable.join(", ")}; run doctor --stage prove --change ${id}`);
    const collectable = options.collectable ||
      collectableExecutionNodes(id, nodes, snapshot.workspaceHash);
    const reservation = reserveProviderExecution(
      id, "proof collect", snapshot.workspaceHash,
      collectable.nodes.map((node) => node.provider), options);
    if (reservation) return reservation;
    const proofRunId = beginProofCollection(
      { loadRuntime, saveRuntime, now, timestamp: Date.now }, id, snapshot,
      options.proofRunId);
    rebindProofCollectionReceipts({
      requiredProviders, receiptValidity, rebindReusableReceipt,
      rebindDiffBoundReceipt
    }, id, snapshot, proofRunId);
    let sessions = [];
    try {
      sessions = await startTrackedServices(id, collectable.nodes, proofRunId);
      const outcomes = collectable.nodes.length
        ? await runExecutionDag(id, collectable.nodes, proofRunId, {
            quiet: options.quiet,
            onProgress: (event) => recordProofProgress(id, event)
          })
        : [];
      recordAdvisoryEvidence(id, snapshot.workspaceHash, [
        ...outcomes,
        // An advisory node whose dependency is neither run nor current.
        ...nodes.filter((node) => node.advisory && collectable.blocked.includes(node.provider))
          .map((node) => ({ provider: node.provider, status: "skipped", advisory: true,
            detail: `advisory; dependency ${node.dependsOn.join(", ")} did not run` }))
      ]);
      try { assertProofCollectionOutcomes(outcomes); } catch (error) {
        // An open merge of another change's landed edit explains a failing
        // check better than the run itself: the sandbox no longer carries
        // that change's work, which only the agent's merge can restore.
        const open = loadRuntime(id).workspace?.landedConflicts || {};
        if (Object.keys(open).length) Object.assign(error, {
          owner: "agent", boundary: "conflict",
          message: `${error.message}; the sandbox still has an open merge of earlier landed ` +
            `work in ${Object.keys(open).sort().join(", ")}: merge onto the target's bytes, ` +
            "keeping every landed and user edit, then resume",
          details: { conflicts: Object.entries(open).map(([path, row]) =>
            ({ repository: "root", path, landedBy: row.landedBy })) }
        });
        throw error;
      }
      persistProofCollectionArtifacts({
        stopAll, durableArtifact, loadRuntime, saveRuntime
      }, id, proofRunId, sessions);
      sessions = [];
      const after = proofReadinessValue(id, "prove");
      const outcome = proofCollectionOutcome(
        id, snapshot, proofRunId, outcomes, collectable, after);
      return settleProofCollection(
        { writeAdvance, printOutcome }, id, outcome, after, options);
    } catch (error) {
      stopAll(sessions);
      // Before die(), not after: a stale activeProofRun makes the next receipt
      // bind the pre-failure workspace hash and land in a dead run directory.
      clearActiveProofRun(id);
      die(error.message, 1, error.owner ? { owner: error.owner, boundary: error.boundary,
        details: error.details } : undefined);
    } finally {
      clearActiveProofRun(id);
    }
  }
  
  async function proofExecuteUnlocked(id, options = {}) {
    prepareWorkspace(id);
    const { snapshot, proofRunId } = prepareProofExecutionFor(id, options);
    let sessions = [];
    try {
      const hash = snapshot.workspaceHash;
      const execution = options.execution || executionNodes(id, hash);
      const { nodes } = execution;
      assertExecutionAvailable(execution, id);
      const reservation = reserveProviderExecution(
        id, options.command || "proof execute", snapshot.workspaceHash,
        nodes.map((node) => node.provider), options);
      if (reservation) {
        clearActiveProofRun(id);
        return reservation;
      }
      sessions = await startTrackedServices(id, nodes, proofRunId);
      const outcomes = await runProofExecutionNodes(
        { runExecutionDag, log: console.log }, id, nodes, proofRunId, options);
      recordAdvisoryEvidence(id, hash, outcomes);
      const serviceArtifacts = stopAll(sessions)
        .map((artifact) => durableArtifact(id, "service", proofRunId, {
          path: artifact.path,
          type: "service-log",
          required: true
        }));
      const withServices = loadRuntime(id);
      withServices.activeProofRun.serviceArtifacts = serviceArtifacts;
      saveRuntime(withServices);
      sessions = [];
      prove(id, proofRunId, { quiet: options.quiet });
      const audit = proofAudit(id, true);
      writeProofExecutionAdvance(
        { writeAdvance }, id, options, snapshot, proofRunId, nodes, audit);
      return proofExecutionResult(audit, proofRunId);
    } catch (error) {
      stopAll(sessions);
      clearActiveProofRun(id);
      die(error.message, 1, error.owner ? { owner: error.owner, boundary: error.boundary,
        details: error.details } : undefined);
    } finally {
      clearActiveProofRun(id);
    }
  }
  
  async function proofRunUnlocked(id, options = {}) {
    const readiness = options.readiness || proofReadinessValue(id, "prove");
    if (readiness.status !== "READY")
      return stopProofRun({ printOutcome, markBlocked, runtimeProcess: process },
        readiness, options);
    const executionResult = await proofExecuteUnlocked(id, {
      preflight: false,
      snapshot: options.snapshot,
      quiet: options.quiet,
      command: "proof run",
      manageReservation: options.manageReservation
    });
    if (proofRunExecutionStops(executionResult)) return executionResult;
    const audit = proofAudit(id, true);
    if (!audit.valid)
      die(`proof run audit failed: ${audit.reason}`);
    const proof = readJson(proofPath(id));
    const outcome = proofRunOutcome(id, proof);
    if (!options.quiet) printOutcome(outcome);
    return outcome;
  }

  async function collectAdvanceExecution(id, flags, snapshot, readiness,
    authorityRequests, advanceStart = {}) {
    const selected = executionNodes(id, snapshot.workspaceHash);
    const held = heldVisualDrift(id, snapshot.workspaceHash);
    const execution = held ? { ...selected, nodes: selected.nodes.filter((node) =>
      !held.providers.includes(node.provider)) } : selected;
    const collectable = collectableExecutionNodes(
      id, execution.nodes, snapshot.workspaceHash);
    let executedProviders = [];
    if (!collectable.nodes.length) {
      // Build may already have supplied every executable receipt. Review can
      // still overlap the base-source check without rerunning those providers.
      const review = startAdvanceReview(id, flags, snapshot, readiness,
        authorityRequests, `review-${Date.now()}`);
      if (!review) return { readiness, authorityRequests, executedProviders };
      const discrimination = await discriminationBesideReview(id, readiness, review);
      readiness = proofReadinessValue(id, "prove");
      authorityRequests = readiness.status === "NEEDS_USER_DECISION" ? statusRequests(id) : [];
      return { readiness, authorityRequests, executedProviders, discrimination };
    }

    const priorAdvance = readAdvance(id);
    const retryIndeterminate = Boolean(flags["retry-indeterminate"]);
    const decisionRef = String(flags["decision-ref"] || "").trim();
    if (["RUNNING", "INDETERMINATE"].includes(priorAdvance.status) &&
        priorAdvance.stage === "execution-running" &&
        priorAdvance.workspaceHash === readiness.workspaceHash &&
        !retryIndeterminate) {
      const outcome = writeAdvance(id, {
        version: 1,
        changeId: id,
        command: "proof advance",
        status: "ACTION_REQUIRED",
        cursorStatus: "INDETERMINATE",
        stage: "execution-indeterminate",
        completed: false,
        workspaceHash: readiness.workspaceHash,
        providers: priorAdvance.providers || collectable.nodes.map((node) => node.provider),
        recoveryDecisionRef: priorAdvance.recoveryDecisionRef || null,
        requests: [],
        executedProviders: [],
        next: [{
          kind: "decide-indeterminate-execution",
          reason: "A prior controller stopped after reserving provider execution but before proving its receipt. Inspect side effects before retrying.",
          command: `cloop advance ${id} --through proven`
        }]
      });
      return { outcome: stopProofAdvance(outcome) };
    }
    if (retryIndeterminate && !decisionRef)
      die("proof advance --retry-indeterminate requires --decision-ref");
    if (retryIndeterminate && priorAdvance.recoveryDecisionRef &&
        priorAdvance.recoveryDecisionRef === decisionRef)
      die("proof advance retry decision was already consumed by an interrupted attempt; inspect side effects again and provide a new --decision-ref");
    writeAdvance(id, {
      version: 1,
      changeId: id,
      status: "RUNNING",
      stage: "execution-running",
      workspaceHash: readiness.workspaceHash,
      providers: collectable.nodes.map((node) => node.provider),
      requests: [],
      recoveryDecisionRef: decisionRef || null,
      progress: { startedAt: now(), wave: 0, running: [], finished: [] }
    });
    const proofRunId = `collect-${Date.now()}`;
    const review = startAdvanceReview(
      id, flags, snapshot, readiness, authorityRequests, proofRunId);
    let collection;
    try {
      collection = await proofCollectUnlocked(id, {
        proofRunId,
        readiness,
        snapshot,
        execution,
        collectable,
        quiet: true,
        includeReadiness: true,
        manageReservation: false
      });
    } catch (error) {
      if (!review) throw error;
      await review;
      const combined = concurrentFailureStop(id, advanceStart);
      if (combined) return { outcome: combined };
      throw error;
    }
    executedProviders = collection.executedProviders || [];
    readiness = collection.readiness;
    // The base-source discrimination run is read-only on the workspace (it
    // builds its own scratch tree), so its async child runs beside the review
    // without blocking reviewer preparation or result collection.
    const discrimination = review
      ? await discriminationBesideReview(id, readiness, review) : null;
    // Join before classifying: the review verdict is bound to this same
    // workspace hash and belongs to this pass's readiness.
    if (review) {
      readiness = proofReadinessValue(id, "prove");
    }
    authorityRequests = readinessRequests(id, readiness);
    const blocked = blockedAdvanceOutcome(id, readiness, { executedProviders });
    if (blocked) return { outcome: stopProofAdvance(blocked) };
    return { readiness, authorityRequests, executedProviders, discrimination };
  }

  async function finishProofAdvance(id, advanceStart, readiness,
    authorityRequests, executedProviders) {
    const held = heldVisualDrift(id, readiness.workspaceHash);
    if (held) {
      // Other failures repair first; the drift question waits for them.
      const others = terminalEvidence(id, readiness)
        .filter((row) => !held.providers.includes(row.provider));
      const repair = others.length
        ? writeEvidenceRepairStop(id, readiness, advanceStart, others) : null;
      if (repair) return stopProofAdvance(repair);
      const done = requiredProviders(id).every((provider) => held.providers.includes(provider) ||
        ["valid", "reusable-inputs", "reusable-diff"].includes(
          receiptValidity(id, provider, readiness.workspaceHash).validity));
      if (done) return stopProofAdvance(
        writeVisualDriftStop(id, readiness, held, executedProviders));
    }
    if (readiness.status === "READY" && !held) {
      const outcome = await proofRunUnlocked(id, {
        readiness,
        quiet: true,
        manageReservation: false
      });
      return printOutcome(writeAdvance(id, {
        ...outcome,
        command: "proof advance",
        stage: "complete",
        requests: [],
        executedProviders,
        reused: false,
        next: [{ kind: "land", command: `cloop advance ${id} --through archived` }]
      }));
    }

    const reviewProviders = missingByCapability(id, readiness, "review");
    if (reviewProviders.length) {
      const terminal = currentRequests(
        id, reviewProviders, readiness.workspaceHash,
        ["rejected"], authorityRequests);
      if (terminal.length) {
        const outcome = writeReviewRepairStop(id, readiness, advanceStart, {
          requests: terminal, executedProviders
        });
        return stopProofAdvance(outcome);
      }
      const requests = requestMissingAuthority(
        id, reviewProviders, "review", readiness.workspaceHash, authorityRequests);
      return printOutcome(writeAdvance(id, {
        version: 1,
        changeId: id,
        command: "proof advance",
        status: "WAITING_EXTERNAL",
        stage: "review",
        completed: false,
        workspaceHash: readiness.workspaceHash,
        requests,
        executedProviders,
        next: authorityNext(id, "review", requests)
      }));
    }

    const acceptanceProviders = missingByCapability(id, readiness, "acceptance");
    const otherExternal = (readiness.externalProviders || []).filter((provider) => {
      const capability = providerCapability(provider, providerConfig(id, provider));
      return capability !== "review" && capability !== "acceptance";
    });
    if (otherExternal.length) {
      return printOutcome(writeAdvance(id, {
        version: 1,
        changeId: id,
        command: "proof advance",
        status: "WAITING_EXTERNAL",
        stage: "external-evidence",
        completed: false,
        workspaceHash: readiness.workspaceHash,
        providers: otherExternal,
        requests: [],
        executedProviders,
        next: readiness.next || []
      }));
    }
    if (acceptanceProviders.length) {
      const terminal = currentRequests(
        id, acceptanceProviders, readiness.workspaceHash,
        ["rejected"], authorityRequests);
      if (terminal.length) {
        const outcome = writeAdvance(id, {
          version: 1,
          changeId: id,
          command: "proof advance",
          status: "ACTION_REQUIRED",
          stage: "acceptance-rejected",
          completed: false,
          workspaceHash: readiness.workspaceHash,
          requests: terminal,
          executedProviders,
          next: [{
            kind: "revise-after-acceptance",
            reason: "Acceptance failed, was inconclusive, or errored for this workspace. Revise the result before another request.",
            command: `cloop packet ${id} --phase build`
          }]
        });
        return stopProofAdvance(outcome);
      }
      const requests = requestMissingAuthority(
        id, acceptanceProviders, "acceptance", readiness.workspaceHash,
        authorityRequests);
      return printOutcome(writeAdvance(id, {
        version: 1,
        changeId: id,
        command: "proof advance",
        status: "WAITING_EXTERNAL",
        stage: "acceptance",
        completed: false,
        workspaceHash: readiness.workspaceHash,
        requests,
        executedProviders,
        next: authorityNext(id, "acceptance", requests)
      }));
    }

    die(`proof advance could not classify readiness for '${id}'`);
  }

  // Every allowed AI wave is delivered, the last one still raised findings the
  // agent has since repaired, current non-review proof passes, and no declared
  // critical case can close those findings deterministically. Only a person
  // can end this: the same review-exhausted gate `REVIEW_ROUTE_COMPLETE`
  // names, never a REPAIR the agent cannot satisfy.
  function writeReviewExhaustedStop(id, readiness, exhausted, executedProviders) {
    return writeAdvance(id, reviewExhaustedOutcome(id, deliveredAiAttempts(id), readiness, exhausted, executedProviders));
  }

  function closeBoundedReviewAttempts(id, readiness, authorityRequests,
    executedProviders) {
    const delivered = deliveredAiAttempts(id);
    const boundedReviewProviders = missingByCapability(id, readiness, "review");
    if (!(delivered.length >= 2 && delivered.at(-1)?.resultStatus === "fail" &&
        boundedReviewProviders.length))
      return { readiness, authorityRequests };

    const closureProviders = new Map();
    const closures = boundedReviewProviders.map((provider) => {
      const closure = recordDeterministicReviewClosure(id, provider,
        currentProviderHash(id, provider, readiness.workspaceHash));
      if (closure) closureProviders.set(closure, provider);
      return closure;
    })
      .filter(Boolean);
    const blockedClosures = closures.filter((row) => !row.closed);
    if (blockedClosures.length) {
      const exhausted = blockedClosures.filter((row) =>
        row.route === "REVIEW_ROUTE_EXHAUSTED");
      if (exhausted.length && !blockedClosures.some((row) =>
        row.route === "CONTRACT_DECISION_REQUIRED")) {
        // The repaired final delta gets one closure review before any person
        // is asked to accept it unreviewed.
        // A user-granted extra wave reviews it the same way; the cap is judged on the repaired content.
        if (exhausted.every((row) => {
          const subject = currentProviderHash(id, closureProviders.get(row), readiness.workspaceHash);
          return reviewClosureWaveAvailable(delivered, subject) ||
            delivered.length < effectiveReviewAttemptLimit(reviewPolicy(id), delivered, subject).maxAiAttempts;
        })) return { readiness, authorityRequests };
        return { outcome: stopProofAdvance(
          writeReviewExhaustedStop(id, readiness, exhausted, executedProviders)) };
      }
      const decisionClosure = blockedClosures.find((row) =>
        row.route === "CONTRACT_DECISION_REQUIRED" && row.command);
      const outcome = writeAdvance(id, {
        version: 1,
        changeId: id,
        command: "proof advance",
        status: "ACTION_REQUIRED",
        route: blockedClosures.some((row) =>
          row.route === "CONTRACT_DECISION_REQUIRED")
          ? "CONTRACT_DECISION_REQUIRED" : "AUTO_REPAIR",
        stage: "review-repair-closure",
        completed: false,
        workspaceHash: readiness.workspaceHash,
        closures: blockedClosures,
        requests: [],
        executedProviders,
        next: [decisionClosure ? {
          kind: "contract-decision",
          reason: decisionClosure.reason,
          command: decisionClosure.command
        } : {
          kind: "repair-final-review-findings",
          // The closure's own reason names what is still unmet (unchanged
          // workspace or failing proof).
          reason: ["Repair the final finding batch inside the locked contract; do not dispatch another AI or open a generic choice interview",
            ...new Set(blockedClosures.map((row) => row.reason).filter(Boolean))]
            .join(": "),
          command: `cloop packet ${id} --phase build`
        }]
      });
      return { outcome: stopProofAdvance(outcome) };
    }
    if (closures.some((row) => row.closed)) {
      readiness = proofReadinessValue(id, "prove");
      authorityRequests = readiness.status === "NEEDS_USER_DECISION"
        ? statusRequests(id) : [];
    }
    return { readiness, authorityRequests };
  }

  function refreshedAdvanceReadiness(id) {
    const advanceStart = readAdvance(id);
    let readiness = proofReadinessValue(id, "prove");
    const audit = proofAudit(id, true);
    let forcedSnapshot = null;
    // A pass that will run providers (or a concurrent review) binds to the
    // forced snapshot, so a readiness hash read from a snapshot cached before
    // the latest edits is re-derived here, not discovered mid-pass.
    if ((readiness.status === "READY" && audit.valid) ||
        readiness.status === "NEEDS_USER_DECISION") {
      // Audit authenticates the copied evidence, while this forced snapshot
      // establishes that it still belongs to the current workspace.
      forcedSnapshot = relevantSnapshot(id, null, true);
      if (readiness.workspaceHash !== forcedSnapshot.workspaceHash)
        readiness = proofReadinessValue(id, "prove");
    }
    return { advanceStart, readiness, audit, forcedSnapshot };
  }

  function initialAdvanceStop(id, advanceStart, readiness) {
    if (!["READY", "NEEDS_USER_DECISION"].includes(readiness.status)) {
      return { outcome: stopProofAdvance(writeAdvance(id, {
        ...readiness,
        command: "proof advance",
        completed: false,
        stage: "blocked",
        requests: [],
        executedProviders: []
      })) };
    }

    const failedEvidence = terminalEvidence(id, readiness);
    if (failedEvidence.length) {
      const capabilities = new Set(failedEvidence.map((row) => row.capability));
      const stage = capabilities.has("review") ? "review-rejected"
        : capabilities.has("acceptance") ? "acceptance-rejected" : "evidence-failed";
      const outcome = capabilities.has("review")
        ? writeReviewRepairStop(id, readiness, advanceStart, {
            failures: failedEvidence
          })
        : capabilities.has("acceptance")
          ? writeAdvance(id, {
              version: 1,
              changeId: id,
              command: "proof advance",
              status: "NEEDS_USER_DECISION",
              stage,
              completed: false,
              workspaceHash: readiness.workspaceHash,
              failures: failedEvidence,
              requests: [],
              executedProviders: [],
              next: [{
                kind: "revise-after-acceptance",
                reason: "Acceptance evidence is terminal or invalid for this workspace. Resolve the behavior decision, then resume the same change.",
                command: `cloop packet ${id} --phase build`
              }]
            })
          : writeEvidenceRepairStop(id, readiness, advanceStart, failedEvidence);
      if (outcome) return { outcome: stopProofAdvance(outcome) };
    }

    const reviewProviders = missingByCapability(id, readiness, "review");
    const authorityRequests = readiness.status === "NEEDS_USER_DECISION"
      ? statusRequests(id) : [];
    const rejected = currentRequests(
      id, reviewProviders, readiness.workspaceHash,
      ["rejected"], authorityRequests);
    if (rejected.length) {
      return { outcome: stopProofAdvance(writeReviewRepairStop(
        id, readiness, advanceStart, { requests: rejected })) };
    }
    const earlyAcceptanceProviders = missingByCapability(
      id, readiness, "acceptance");
    const rejectedAcceptance = currentRequests(
      id, earlyAcceptanceProviders, readiness.workspaceHash,
      ["rejected"], authorityRequests);
    if (!reviewProviders.length && rejectedAcceptance.length) {
      return { outcome: stopProofAdvance(writeAdvance(id, {
        version: 1,
        changeId: id,
        command: "proof advance",
        status: "ACTION_REQUIRED",
        stage: "acceptance-rejected",
        completed: false,
        workspaceHash: readiness.workspaceHash,
        requests: rejectedAcceptance,
        executedProviders: [],
        next: [{
          kind: "revise-after-acceptance",
          reason: "Acceptance is terminal or its receipt is invalid for this workspace. Revise the result before another request.",
          command: `cloop packet ${id} --phase build`
        }]
      })) };
    }
    return { authorityRequests };
  }

  async function advanceUnlocked(id, flags = {}) {
    const refreshed = refreshedAdvanceReadiness(id);
    const { advanceStart, audit, forcedSnapshot } = refreshed;
    let { readiness } = refreshed;
    // Another process recorded a gate pass after this caller chose to run:
    // the same findings are not "no progress", since nobody has repaired yet.
    if (Object.hasOwn(flags, "cursor-token") &&
        flags["cursor-token"] !== proofCursorToken(advanceStart))
      advanceStart.progressFingerprint = null;
    // A user who answered the no-progress decision chose to repair again:
    // compare this pass with nothing, once, instead of asking again.
    if (flags["reset-progress"]) {
      if (!flags["decision-ref"]) die("proof advance --reset-progress requires --decision-ref");
      advanceStart.progressFingerprint = null;
    }
    // Reuse needs the retained proof to bind the receipts on disk: receipts
    // re-earned on the same workspace (e.g. after a review-policy upgrade)
    // need a new proof, or advance would refresh the same stale proof forever.
    if (readiness.status === "READY" && audit.valid && forcedSnapshot &&
        audit.proof.workspaceHash === forcedSnapshot.workspaceHash &&
        readiness.workspaceHash === forcedSnapshot.workspaceHash && deliveryProofCurrent(id)) {
      return printOutcome(writeAdvance(id, {
        version: 1,
        changeId: id,
        command: "proof advance",
        status: "PASS",
        stage: "complete",
        completed: true,
        reused: true,
        proofRunId: audit.proof.proofRunId || null,
        workspaceHash: readiness.workspaceHash,
        providers: audit.proof.providers || [],
        requests: [],
        executedProviders: [],
        next: []
      }));
    }
    const initial = initialAdvanceStop(id, advanceStart, readiness);
    if (initial.outcome) return initial.outcome;
    let { authorityRequests } = initial;

    const snapshot = forcedSnapshot || relevantSnapshot(id, null, true);
    const reusable = requiredProviders(id)
      .map((provider) => receiptValidity(id, provider, snapshot.workspaceHash))
      .filter((row) => ["reusable-inputs", "reusable-diff"].includes(row.validity));
    if (reusable.length) {
      const reuseRunId = `advance-reuse-${Date.now()}`;
      for (const row of reusable)
        (row.validity === "reusable-inputs"
          ? rebindReusableReceipt : rebindDiffBoundReceipt)(id, row, snapshot, reuseRunId);
      readiness = proofReadinessValue(id, "prove");
      authorityRequests = readinessRequests(id, readiness);
      const blocked = blockedAdvanceOutcome(id, readiness,
        { executedProviders: [], reusedProviders: reusable.map((row) => row.provider) });
      if (blocked) {
        markBlocked(blockedOutcomeStop(blocked));
        process.exitCode = 2;
        return printOutcome(blocked);
      }
    }
    const executionResult = await collectAdvanceExecution(
      id, flags, snapshot, readiness, authorityRequests, advanceStart);
    if (executionResult.outcome) return executionResult.outcome;
    ({ readiness, authorityRequests } = executionResult);
    const { executedProviders } = executionResult;
    const discrimination = await discriminationRepairStop(
      id, readiness, advanceStart, executedProviders, executionResult.discrimination);
    if (discrimination) return discrimination;

    // Two delivered AI waves are the end of the open-review route, not the
    // beginning of a human/third-AI loop. If the final delta found an
    // in-contract defect, its structured claim/case bindings let current
    // executable evidence close only those IDs. This operation is a durable
    // hash-chained deterministic attempt; it cannot invent a pass while any
    // non-review provider is stale or failing.
    const closureResult = closeBoundedReviewAttempts(
      id, readiness, authorityRequests, executedProviders);
    if (closureResult.outcome) return closureResult.outcome;
    ({ readiness, authorityRequests } = closureResult);

    return finishProofAdvance(
      id, advanceStart, readiness, authorityRequests, executedProviders);
  }

  function mutationInProgress(id, command, locked) {
    const recovery = locked.owner?.recoverableAfter ? [{
      kind: "retry-after-lock-initialization",
      reason: "The lock descriptor is still being initialized. Retry once after the recovery grace period; do not run the provider directly.",
      recoverableAfter: locked.owner.recoverableAfter,
      retryAfterMs: locked.owner.retryAfterMs
    }] : [];
    return printOutcome({
      version: 1,
      changeId: id,
      command,
      status: "IN_PROGRESS",
      stage: "controller",
      completed: false,
      progressed: false,
      // Keep the lock's state and grace period so a caller can tell an
      // initializing owner from a dead one.
      owner: locked.owner ? {
        pid: locked.owner.pid ?? null,
        ...(locked.owner.state ? { state: locked.owner.state } : {}),
        ...(locked.owner.recoverableAfter ? { recoverableAfter: locked.owner.recoverableAfter } : {})
      } : null,
      // Where the running proof is, so a waiting caller need not poll blind.
      ...(proofProgressView(id) ? { progress: proofProgressView(id) } : {}),
      next: recovery
    });
  }

  async function runProofMutation(id, command, operation) {
    const locked = await withProofAdvanceLock(id, operation);
    return locked.acquired ? locked.value : mutationInProgress(id, command, locked);
  }

  async function guardProofMutation(id, command, operation) {
    return runProofMutation(id, command, operation);
  }

  async function proofCollect(id) {
    return runProofMutation(id, "proof collect", () => proofCollectUnlocked(id));
  }

  async function proofExecute(id) {
    return runProofMutation(id, "proof execute", () => proofExecuteUnlocked(id));
  }

  async function proofRun(id) {
    return runProofMutation(id, "proof run", () => proofRunUnlocked(id));
  }

  async function proofFinalize(id) {
    return runProofMutation(id, "proof finalize", async () => prove(id));
  }

  async function proofAdvance(id, flags = {}) {
    const priorQuiet = quietAdvanceOutput;
    quietAdvanceOutput = Boolean(flags.quiet);
    try {
      const locked = await withProofAdvanceLock(id, () => advanceUnlocked(id, flags));
      if (locked.acquired) return locked.value;
      return mutationInProgress(id, "proof advance", locked);
    } finally {
      quietAdvanceOutput = priorQuiet;
    }
  }

  const {
    authorityNext, concurrentFailureStop, currentProviderHash, currentRequests,
    discriminationBesideReview, discriminationRepairStop, heldVisualDrift,
    missingByCapability, recordAdvisoryEvidence, requestMissingAuthority,
    startAdvanceReview, statusRequests, stopProofAdvance, terminalEvidence,
    writeEvidenceRepairStop, writeReviewRepairStop, writeVisualDriftStop
  } = createProofRepairStops({
    authorityStatusValue, deliveredAiAttempts, loadRuntime, markBlocked, now,
    performanceRegression, printOutcome, proofReadinessValue, providerCapability,
    providerConfig, providerWorkspaceHash, receiptValidity, requestAuthority,
    requiredProviders, reviewPolicy, saveRuntime, stableHash, startConcurrentReview,
    testDiscrimination, visualReceipt, writeAdvance
  });

  return {
    authorityNext,
    guardProofMutation,
    proofAdvance,
    proofCollect,
    proofExecute,
    proofFinalize,
    proofRun
  };
}
