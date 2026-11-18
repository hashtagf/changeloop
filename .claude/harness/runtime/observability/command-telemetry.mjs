// Command telemetry: one row per CLI command with its status, phase, and a
// sanitized blocker kind and reason, plus the recorder that tracks the active
// lifecycle phase. Free text never leaves the machine unsanitized.
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

export function commandTelemetryStatus(code, blocked) {
  return code === 0 ? "completed" : blocked ? "blocked" : "failed";
}

// Ordered by precedence: a message naming several kinds takes the first, so a
// stop is never demoted to the generic policy guard just for saying more.
const BLOCKER_KINDS = Object.freeze([
  {
    code: "budget-exhausted", classification: "budget",
    pattern: /\bbudget\b|request limit|allowance/i,
    summary: "A measured execution budget checkpoint stopped the operation",
    recovery: (id) => `cloop advance ${id} --inspect`
  },
  {
    code: "authority-required", classification: "authority",
    pattern: /authority|approval|acceptance|review receipt|decision-ref/i,
    summary: "Required external authority has not been recorded",
    recovery: (id) => `cloop authority status ${id}`
  },
  {
    code: "resource-conflict", classification: "resource-conflict",
    pattern: /conflict|lease|already active|scope path|resource/i,
    summary: "Another active operation owns a conflicting resource",
    recovery: (id) => `cloop agents plan ${id} --pretty`
  },
  {
    code: "workspace-boundary", classification: "workspace",
    pattern: /workspace|sandbox|base move|outside.*scope|undeclared path/i,
    summary: "The isolated workspace or declared write boundary is not ready",
    recovery: (id) => `cloop advance ${id}`
  },
  {
    code: "contract-invalid", classification: "contract",
    pattern: /protocol|provider|adapter|criticalcase|critical case|evidence|claim|contract/i,
    summary: "The executable change or evidence contract is incomplete",
    recovery: (id) => `cloop change validate ${id}`
  }
]);

// Codes only a caller can assert; message text never selects them.
const DECLARED_BLOCKER_KINDS = Object.freeze([
  {
    code: "decision-required", classification: "decision",
    summary: "A recorded decision is required before the operation can continue",
    recovery: (id, phase) => `cloop packet ${id} --phase ${phase}`
  },
  {
    code: "execution-indeterminate", classification: "recovery",
    summary: "Provider execution stopped before its receipt; inspect side effects before retrying",
    recovery: (id) => `cloop advance ${id} --through proven`
  }
]);

const POLICY_GUARD_KIND = Object.freeze({
  code: "policy-guard", classification: "policy",
  summary: "A Change Loop policy guard stopped the operation",
  recovery: (id, phase) => `cloop packet ${id} --phase ${phase}`
});

const BLOCKER_REASON_LIMIT = 200;

// The reason stays in local command telemetry only; exported projections carry
// the code. Paths and credential-shaped values never reach the log.
export function sanitizedBlockerReason(value) {
  const text = String(value || "")
    .replace(/\b(authorization)(\s*[:=]\s*|\s+)(?:(?:bearer|basic)\s+)?\S+/gi, "$1$2<redacted>")
    .replace(/\b(bearer|token|password|passwd|secret|api[_-]?key)(\s*[:=]\s*)\S+/gi,
      "$1$2<redacted>")
    // A spaced value is prose unless it looks like a credential.
    .replace(/\b(bearer|token|password|passwd|secret|api[_-]?key)(\s+)(\S+)/gi,
      (match, name, space, word) => /\d|[-_]|^\S{16,}$/.test(word) ||
        name.toLowerCase() === "bearer" ? `${name}${space}<redacted>` : match)
    .replace(/\b(?:sk|pk|rk|ghp|gho|ghs|ghu|github_pat|xox[abprs]|AKIA|ASIA)[-_A-Za-z0-9]{8,}/g, "<redacted>")
    .replace(/(?:~|[A-Za-z]:)?(?:[\\/][\w.@+-]+){2,}[\\/]?/g, "<path>")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > BLOCKER_REASON_LIMIT
    ? `${text.slice(0, BLOCKER_REASON_LIMIT - 1)}…` : text;
}

function blockerKind(code, source) {
  const declared = code
    ? [...BLOCKER_KINDS, ...DECLARED_BLOCKER_KINDS, POLICY_GUARD_KIND]
      .find((candidate) => candidate.code === code)
    : null;
  return declared ||
    BLOCKER_KINDS.find((candidate) => candidate.pattern.test(source)) ||
    POLICY_GUARD_KIND;
}

function safeChangeId(value) {
  const id = String(value || "");
  return /^[a-z0-9][a-z0-9-]*$/.test(id) ? id : "<change>";
}

function safeLifecyclePhase(value) {
  const phase = String(value || "").toLowerCase();
  return ["change", "build", "prove", "review", "land"].includes(phase)
    ? phase : "build";
}

// `message` is the refusal text, or `{ code, reason }` when the caller knows
// the kind. A declared code wins; otherwise the first matching pattern does.
export function blockerTelemetryValue(message, context = {}) {
  const declared = message && typeof message === "object" ? message : null;
  const source = String((declared ? declared.reason : message) || "");
  const kind = blockerKind(declared?.code || null, source);
  const operation = String(context.operationName || "unknown")
    .replace(/[^a-z0-9-]/gi, "-").slice(0, 64) || "unknown";
  return {
    code: kind.code,
    classification: kind.classification,
    summary: kind.summary,
    reason: sanitizedBlockerReason(source),
    recovery: kind.recovery(safeChangeId(context.changeId),
      safeLifecyclePhase(context.phase)),
    fingerprint: `sha256:${createHash("sha256")
      .update(`${kind.code}\0${operation}`).digest("hex")}`
  };
}

export function commandTelemetryDetails(context) {
  return {
    ...(context.stageSpans ? { stageSpans: context.stageSpans } : {}),
    ...(context.schedulerEvents?.length ? { schedulerEvents: context.schedulerEvents } : {})
  };
}

export function commandTelemetryRow(context, code) {
  const inspection = context.readOnlyOperations.has(context.operationName);
  const status = commandTelemetryStatus(code, context.blocked);
  return {
    version: 5,
    changeId: context.changeId,
    operation: context.operationName,
    kind: inspection ? "inspection" : "lifecycle",
    phase: context.publicOperation || context.operationPhase || null,
    status,
    blocker: status === "blocked"
      ? context.blocker || blockerTelemetryValue("", context) : null,
    exitCode: code,
    startedAt: new Date(context.operationStartedAt).toISOString(),
    finishedAt: context.now(),
    durationMs: context.timestamp() - context.operationStartedAt,
    ...(context.phaseSpans ? { phaseSpans: context.phaseSpans } : {}),
    ...commandTelemetryDetails(context),
    requests: null,
    inputTokens: null,
    outputTokens: null,
    cacheCreationTokens: null,
    cacheReadTokens: null,
    cacheTokens: null,
    cost: null,
    inputFingerprint: context.operationInputFingerprint || null,
    inputMeasurement: context.operationInputFingerprint
      ? "command-args+runtime-state+change-content+policy" : "unavailable",
    measurement: "command-observed; model usage requires host telemetry ingestion"
  };
}

export function commandTelemetryEligible(context) {
  if (context.telemetryDisabled || !context.changeId || !context.operationName)
    return false;
  return context.operationStatusAtStart !== "archived";
}

export function recordCommandTelemetry(context, code) {
  if (!commandTelemetryEligible(context)) return false;
  try {
    const ledger = context.readOnlyOperations.has(context.operationName)
      ? "inspections.jsonl" : "operations.jsonl";
    const path = join(context.logs, context.changeId, ledger);
    context.mkdir(dirname(path), { recursive: true });
    context.append(path, `${JSON.stringify(commandTelemetryRow(context, code))}\n`);
    return true;
  } catch (error) {
    if (context.telemetryDebug)
      context.warn(`WARNING: telemetry unavailable: ${error.message}`);
    return false;
  }
}

// Retain one invocation row, with disjoint child phase intervals. Readers use
// the intervals for phase attribution and the parent for command accounting.
export function createCommandPhaseRecorder(context, record = recordCommandTelemetry) {
  let phase = null;
  let startedAt = null;
  const spans = [];
  const stageSpans = [];
  const schedulerEvents = [];
  const measuredStage = (stage, operation) => {
    const started = context().timestamp();
    try {
      const value = operation();
      stageSpans.push({ stage, durationMs: context().timestamp() - started, status: "completed" });
      return value;
    } catch (error) {
      stageSpans.push({ stage, durationMs: context().timestamp() - started, status: "failed" });
      throw error;
    }
  };
  const close = (at, status) => spans.push({
    phase, startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date(at).toISOString(), durationMs: at - startedAt, status
  });
  return {
    measure: measuredStage,
    scheduler(event = {}) {
      schedulerEvents.push({
        scheduler: String(event.scheduler || "unknown"),
        wave: Number(event.wave || 0),
        readyNodes: Number(event.readyNodes || 0),
        executedNodes: Number(event.executedNodes || 0),
        reusedNodes: event.reusedNodes === null || event.reusedNodes === undefined
          ? null : Number(event.reusedNodes),
        queueingMs: event.queueingMs === null || event.queueingMs === undefined
          ? null : Number(event.queueingMs),
        peakConcurrency: Number(event.peakConcurrency || 0)
      });
    },
    async measureAsync(stage, operation) {
      const started = context().timestamp();
      try {
        const value = await operation();
        stageSpans.push({ stage, durationMs: context().timestamp() - started, status: "completed" });
        return value;
      } catch (error) {
        stageSpans.push({ stage, durationMs: context().timestamp() - started, status: "failed" });
        throw error;
      }
    },
    transition(next) {
      const base = context();
      if (base.operationName !== "advance" || phase === next ||
          !["change", "build", "prove", "land"].includes(next)) return;
      const at = base.timestamp();
      if (phase) close(at, "completed");
      startedAt = phase ? at : base.operationStartedAt;
      phase = next;
    },
    finish(code) {
      const base = context();
      if (!phase) return record({ ...base, stageSpans, schedulerEvents }, code);
      const at = base.timestamp();
      close(at, commandTelemetryStatus(code, base.blocked));
      return record({ ...base, phaseSpans: spans, stageSpans, schedulerEvents,
        now: () => new Date(at).toISOString(), timestamp: () => at,
        ...(spans.length === 1 ? { operationPhase: phase, publicOperation: phase } : {})
      }, code);
    }
  };
}
