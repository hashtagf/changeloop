// The one process-wide record of the command being run: which change and
// command it is, its lifecycle phase, the change's status when it started,
// its input fingerprint, and whether it ended in a refusal. Every runtime
// reads it through the accessors here instead of through variables the
// composition root reassigns.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { blockerTelemetryValue } from "../observability/command-telemetry.mjs";
import { operationInputFingerprint } from "../observability/operation-profile.mjs";

// Commands whose first positional value names the change they act on.
const CHANGE_FIRST = new Set([
  "resolve", "validate", "audit-change", "hash", "packet", "agent-plan", "agent-dispatch", "agent-task",
  "agent-acquire", "agent-release", "metrics", "feedback", "advance", "budget-checkpoint", "budget-continue",
  "proof-plan", "proof-readiness", "proof-advance", "proof-run", "proof-collect", "proof-preflight",
  "proof-execute", "proof-audit", "evidence-verify-ci", "authority-request", "authority-dispatch",
  "authority-run", "authority-abort", "authority-status", "authority-record", "authority-reset-infra",
  "authority-extend-review", "authority-reset-base-move", "receipt", "run-provider", "prove",
  "evidence-detect", "evidence-init", "evidence-doctor", "handoff-status", "handoff-packet", "handoff-record",
  "land-check", "land-advance", "land-plan", "land-resume", "archive", "delivery-advance", "event",
  "telemetry-sync", "telemetry-import"
]);

// Positional, so a flag in the change slot is not a change: `sandbox create
// --all <change>` once created `.foundation/logs/--all/`.
const namedChange = (value) => typeof value === "string" && !value.startsWith("-") ? value : null;

export function operationChangeIdFor(command, values, env = process.env) {
  if (command === "sandbox") return namedChange(values[1]);
  if (CHANGE_FIRST.has(command)) return namedChange(values[0]);
  if (!command?.startsWith("quality-")) return null;
  const index = values.findIndex((value) => value === "--change");
  return namedChange(index >= 0 ? values[index + 1] : env.FOUNDATION_CHANGE_ID);
}

export function createOperationState({
  detachedBlockScope, env = process.env, error = console.error, exit = process.exit, startedAt = Date.now()
}) {
  // A refusal is a lifecycle stop, not a crash. Recording it as a failure would
  // bury real breakage under the guards that are working as designed.
  const state = {
    changeId: null, name: null, phase: null, statusAtStart: null, fingerprint: null,
    blocked: false, blocker: null, startedAt
  };
  let trappedFailureDepth = 0;

  // A command that prints a structured non-ready result and returns has also
  // ended in a refusal, not a crash, but it never reaches `die`. `markBlocked`
  // records the decision without exiting, so the exit handler reports what the
  // command decided instead of inferring it. Work beside an operation (the
  // concurrent review in `advance`) records its refusal in its detached scope.
  function markBlocked(message) {
    if (detachedBlockScope.capture(message)) return;
    state.blocked = true;
    state.blocker = blockerTelemetryValue(message, {
      changeId: state.changeId, operationName: state.name,
      phase: env.FOUNDATION_PUBLIC_OPERATION || state.phase
    });
  }

  /** @returns {never} */
  function die(message, code = 1, details = null) {
    markBlocked(message);
    if (trappedFailureDepth > 0) {
      throw Object.assign(new Error(String(message)), { exitCode: code, foundationBlocked: true },
        Object.fromEntries(["decision", "boundary", "owner", "code"]
          .filter((key) => details?.[key]).map((key) => [key, details[key]])));
    }
    error(`BLOCKED: ${message}`);
    return exit(code);
  }

  function trapFailures(operation) {
    trappedFailureDepth += 1;
    try { return operation(); }
    finally { trappedFailureDepth -= 1; }
  }

  async function trapFailuresAsync(operation) {
    trappedFailureDepth += 1;
    try { return await operation(); }
    finally { trappedFailureDepth -= 1; }
  }

  // The change's status and input identity when the command started.
  // Profiling is observational: a damaged change must still reach the command
  // that diagnoses or retires it, so an unreadable input leaves no fingerprint
  // rather than a new blocker.
  function begin({ command, values, root, readJson, runtimePath, activeChangePath, directoryHash, fileDigest }) {
    state.name = command || null;
    state.changeId = operationChangeIdFor(command, values, env);
    const stateAtStart = state.changeId ? readJson(runtimePath(state.changeId), {}) : {};
    state.statusAtStart = stateAtStart.status ?? null;
    if (!state.changeId) return;
    const digest = (path) => existsSync(path) ? fileDigest(path) : null;
    try {
      const changeRoot = activeChangePath(state.changeId, stateAtStart);
      state.fingerprint = operationInputFingerprint({
        operation: command, values, state: stateAtStart,
        changeDigest: existsSync(changeRoot) ? directoryHash(changeRoot) : null,
        foundationConfigDigest: digest(join(root, "foundation.json")),
        projectPolicyDigest: digest(join(root, ".foundation", "policy.json"))
      });
    } catch {
      state.fingerprint = null;
    }
  }

  return {
    state, markBlocked, die, trapFailures, trapFailuresAsync, begin,
    setChangeId(id) { state.changeId = id; }
  };
}
