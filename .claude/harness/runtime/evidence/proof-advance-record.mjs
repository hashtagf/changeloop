// The proof advance record: its lock, the advance file and progress view,
// readiness requests, blocked outcomes, and reserving or clearing the active
// proof run that a provider execution belongs to.
import { acquireProcessLock } from "../core/process-lock.mjs";
import { blockedOutcomeStop } from "../core/blocked-decision.mjs";
import { requestSummary } from "./proof-execution-steps.mjs";

export function createProofAdvanceRecord({
  activeAdvance, loadRuntime, markBlocked, memoryAdvance, now, proofAdvanceLockPath,
  proofAdvancePath, quietAdvanceOutput, readJson, saveRuntime, statusRequests, writeJson
}) {
  // `proof advance` may be invoked by two agents at the same time. The
  // authority store already serializes request mutations, but that is too late
  // to prevent both agents from starting the same executable provider. This
  // process-owned lock covers the complete transition and is recoverable after
  // a killed process. A live holder is normal work, not a blocker: the second
  // caller receives IN_PROGRESS with exit zero and does not poll or execute.
  async function withProofAdvanceLock(id, operation) {
    if (activeAdvance.has(id)) return { acquired: false, owner: { pid: process.pid } };
    const path = proofAdvanceLockPath(id);
    if (!path) {
      activeAdvance.add(id);
      try { return { acquired: true, value: await operation() }; }
      finally { activeAdvance.delete(id); }
    }
    const lock = acquireProcessLock(path, { now });
    if (!lock.acquired) return { acquired: false, owner: lock.owner };
    activeAdvance.add(id);
    try { return { acquired: true, value: await operation() }; }
    finally {
      activeAdvance.delete(id);
      lock.release();
    }
  }

  function readAdvance(id) {
    const path = proofAdvancePath(id);
    return path ? readJson(path, {}) : (memoryAdvance.get(id) || {});
  }

  // Merges one scheduler event into a RUNNING record's progress: the wave's
  // providers while they run, and each finished provider with its status and
  // duration. Status, stage, and workspaceHash stay untouched for recovery.
  function recordProofProgress(id, event) {
    const record = readAdvance(id);
    if (record.status !== "RUNNING") return;
    const prior = record.progress || {};
    const progress = { startedAt: prior.startedAt || now(), wave: prior.wave || 0,
      running: [...(prior.running || [])], finished: [...(prior.finished || [])] };
    if (event.event === "wave") Object.assign(progress, { wave: event.wave, running: [...event.providers] });
    else if (event.event === "provider") {
      progress.running = progress.running.filter((provider) => provider !== event.provider);
      progress.finished.push({ provider: event.provider, status: event.status, durationMs: event.durationMs });
    } else return;
    const path = proofAdvancePath(id);
    const next = { ...record, progress };
    if (path) writeJson(path, next); else memoryAdvance.set(id, next);
  }

  // The progress a waiting caller sees, with the elapsed time since start.
  function proofProgressView(id) {
    const progress = readAdvance(id).progress;
    if (!progress) return null;
    const started = Date.parse(progress.startedAt);
    return { ...progress, elapsedMs: Number.isFinite(started) ? Math.max(0, Date.now() - started) : null };
  }

  function writeAdvance(id, outcome) {
    const requestIds = (outcome.requests || [])
      .map((request) => request.requestId).filter(Boolean).sort();
    const next = {
      version: 1,
      changeId: id,
      workspaceHash: outcome.workspaceHash || null,
      status: outcome.cursorStatus || outcome.status,
      stage: outcome.stage || null,
      requestIds,
      // Providers are durable only for a RUNNING reservation (crash recovery)
      // or an external-evidence wait. `executedProviders` is per invocation;
      // persisting it would make the next unchanged wait look like progress.
      providers: [...(outcome.providers || [])].sort(),
      subjectHash: outcome.subjectHash || null,
      recoveryDecisionRef: outcome.recoveryDecisionRef || null,
      progressFingerprint: outcome.progressFingerprint || null,
      repairCycle: Number(outcome.repairCycle || 0),
      repairPlanDigest: outcome.repairPlanDigest || null,
      route: outcome.route || null,
      decision: outcome.decision || null,
      next: outcome.next || [],
      repairPlan: outcome.repairPlan || null,
      repairGraph: outcome.repairGraph || null,
      invalidation: outcome.invalidation || null,
      attemptedStrategies: outcome.attemptedStrategies || [],
      // Advisory only: excluded from `comparable`, so it never counts as
      // lifecycle progress or changes recovery.
      ...(outcome.progress ? { progress: outcome.progress } : {}),
      updatedAt: now()
    };
    const prior = readAdvance(id);
    const comparable = (value) => JSON.stringify({
      workspaceHash: value.workspaceHash || null,
      status: value.status || null,
      stage: value.stage || null,
      requestIds: [...(value.requestIds || [])].sort(),
      providers: [...(value.providers || [])].sort(),
      subjectHash: value.subjectHash || null,
      recoveryDecisionRef: value.recoveryDecisionRef || null,
      progressFingerprint: value.progressFingerprint || null,
      repairCycle: Number(value.repairCycle || 0),
      repairPlanDigest: value.repairPlanDigest || null,
      route: value.route || null,
      decision: value.decision || null,
      next: value.next || [],
      repairPlan: value.repairPlan || null,
      repairGraph: value.repairGraph || null,
      invalidation: value.invalidation || null,
      attemptedStrategies: value.attemptedStrategies || []
    });
    const progressed = comparable(prior) !== comparable(next);
    const path = proofAdvancePath(id);
    if (path) writeJson(path, next); else memoryAdvance.set(id, next);
    const { cursorStatus: _cursorStatus, ...publicOutcome } = outcome;
    return {
      ...publicOutcome,
      requests: (outcome.requests || []).map((request) => requestSummary(id, request)),
      progressed,
      cursor: next
    };
  }

  // The decisions a readiness waiting on the user asks for.
  function readinessRequests(id, readiness) {
    return readiness.status === "NEEDS_USER_DECISION" ? statusRequests(id) : [];
  }

  // A readiness neither ready nor waiting on the user stops proof advance;
  // the outcome names the providers this pass ran or reused. Null otherwise.
  function blockedAdvanceOutcome(id, readiness, providers) {
    if (["READY", "NEEDS_USER_DECISION"].includes(readiness.status)) return null;
    return writeAdvance(id, { ...readiness, command: "proof advance", completed: false,
      stage: "blocked", requests: [], ...providers });
  }

  function printOutcome(outcome) {
    if (!quietAdvanceOutput) console.log(JSON.stringify(outcome, null, 2));
    return outcome;
  }

  function reserveProviderExecution(id, command, workspaceHash, providers, options = {}) {
    if (!providers.length || options.manageReservation === false) return null;
    const prior = readAdvance(id);
    if (["RUNNING", "INDETERMINATE"].includes(prior.status) &&
        prior.stage === "execution-running" &&
        prior.workspaceHash === workspaceHash) {
      const outcome = writeAdvance(id, {
        version: 1,
        changeId: id,
        command,
        status: "ACTION_REQUIRED",
        cursorStatus: "INDETERMINATE",
        stage: "execution-indeterminate",
        completed: false,
        workspaceHash,
        providers: prior.providers || providers,
        recoveryDecisionRef: prior.recoveryDecisionRef || null,
        requests: [],
        executedProviders: [],
        next: [{
          kind: "decide-indeterminate-execution",
          reason: "A prior command stopped after reserving provider execution but before proving its receipt. Inspect side effects before retrying.",
          command: `cloop advance ${id} --through proven`
        }]
      });
      markBlocked(blockedOutcomeStop(outcome));
      process.exitCode = 2;
      if (!options.quiet) printOutcome(outcome);
      return outcome;
    }
    writeAdvance(id, {
      version: 1,
      changeId: id,
      command,
      status: "RUNNING",
      stage: "execution-running",
      workspaceHash,
      providers,
      requests: [],
      recoveryDecisionRef: null
    });
    return null;
  }

  function clearActiveProofRun(id) {
    const current = loadRuntime(id);
    delete current.activeProofRun;
    saveRuntime(current);
  }

  return {
    withProofAdvanceLock, readAdvance, recordProofProgress, proofProgressView, writeAdvance,
    readinessRequests, blockedAdvanceOutcome, printOutcome, reserveProviderExecution,
    clearActiveProofRun
  };
}
