import { join } from "node:path";

export function parseTelemetryEventLine(line) {
  try { return JSON.parse(line); }
  catch { return null; }
}

export function telemetryRowsForSession(text, sessionId) {
  const normalizedSession = sessionId.toLowerCase();
  return text.split(/\r?\n/).filter(Boolean)
    .map(parseTelemetryEventLine)
    .filter((row) => row && [row.sessionId, row.runId]
      .some((value) => String(value || "").toLowerCase() === normalizedSession));
}

export function telemetryRowHasModel(candidate) {
  return Boolean(candidate.modelId);
}

export function preferredSessionTelemetryRow(rows) {
  return rows.filter(telemetryRowHasModel).at(-1) ||
    rows.at(-1) || null;
}

export function telemetryProviderFamily(source) {
  const normalized = String(source || "").toLowerCase();
  if (normalized.includes("claude")) return "anthropic";
  if (normalized.includes("codex") || normalized.includes("openai"))
    return "openai";
  return "";
}

export function telemetryProvenanceValue(row) {
  if (!row) return {};
  const modelId = String(row.modelId || "").trim();
  return {
    identity: String(row.agentId || "").trim(),
    providerFamily: telemetryProviderFamily(row.source),
    modelFamily: String(row.modelFamily || modelId).trim().toLowerCase(),
    modelId
  };
}

export function sessionTelemetryProvenanceOperation(context, id, sessionId) {
  if (!sessionId) return {};
  try {
    const text = context.readFile(join(
      context.root, ".foundation", "logs", id, "events.jsonl"), "utf8");
    return telemetryProvenanceValue(preferredSessionTelemetryRow(
      telemetryRowsForSession(text, sessionId)));
  } catch { return {}; }
}

export function mainSessionEnvironment(environment) {
  const claudeSession = String(
    environment.FOUNDATION_CLAUDE_SESSION_ID || "").trim();
  const codexSession = String(environment.CODEX_THREAD_ID || "").trim();
  const genericSession = String(environment.FOUNDATION_SESSION_ID || "").trim();
  const declaredMainSession = String(
    environment.FOUNDATION_MAIN_SESSION_ID || "").trim();
  return {
    claudeSession,
    codexSession,
    ambientSession: claudeSession || genericSession || codexSession ||
      declaredMainSession
  };
}

export function bindMainSession(context, flags, environment) {
  const requestedSession = String(
    flags["main-session-id"] || environment.ambientSession).trim();
  if (environment.ambientSession && requestedSession &&
      environment.ambientSession !== requestedSession)
    context.fail("main-session fallback session must match the calling host session");
  return environment.ambientSession ? requestedSession : "";
}

export function inferredMainSession(environment) {
  if (environment.claudeSession &&
      environment.ambientSession === environment.claudeSession)
    return { providerFamily: "anthropic", identity: "claude-main-session" };
  if (environment.codexSession &&
      environment.ambientSession === environment.codexSession)
    return { providerFamily: "openai", identity: "codex-main-session" };
  return { providerFamily: "", identity: "" };
}

export function firstMainSessionValue(values, lowercase = false) {
  const value = String(values.find(Boolean) || "").trim();
  return lowercase ? value.toLowerCase() : value;
}

export function mainSessionFallbackValue(
  inheritsSubject, subjectValue, telemetryValue, inferredValue = ""
) {
  return inheritsSubject
    ? subjectValue : firstMainSessionValue([telemetryValue, inferredValue]);
}

export function mainSessionProvenanceValue(
  flags, subject, environmentVariables, session, telemetry
) {
  const inheritsSubject = subject.sessionId && session.boundSession &&
    String(subject.sessionId).toLowerCase() === session.boundSession.toLowerCase();
  const inferred = inferredMainSession(session.environment);
  const value = {
    identity: firstMainSessionValue([
      flags["main-session-identity"],
      environmentVariables.FOUNDATION_MAIN_IDENTITY,
      mainSessionFallbackValue(
        inheritsSubject, subject.identity, telemetry.identity, inferred.identity)
    ]),
    sessionId: session.boundSession || null,
    providerFamily: firstMainSessionValue([
      flags["main-session-provider-family"],
      environmentVariables.FOUNDATION_MAIN_PROVIDER_FAMILY,
      mainSessionFallbackValue(inheritsSubject, subject.providerFamily,
        telemetry.providerFamily, inferred.providerFamily)
    ], true),
    modelFamily: firstMainSessionValue([
      flags["main-session-model-family"],
      environmentVariables.FOUNDATION_MAIN_MODEL_FAMILY,
      mainSessionFallbackValue(
        inheritsSubject, subject.modelFamily, telemetry.modelFamily)
    ], true),
    modelId: firstMainSessionValue([
      flags["main-session-model"],
      environmentVariables.FOUNDATION_MODEL_ID,
      mainSessionFallbackValue(
        inheritsSubject, subject.modelId, telemetry.modelId)
    ])
  };
  const missing = Object.entries(value)
    .filter(([, fieldValue]) => !fieldValue).map(([name]) => name);
  return { ...value, missing };
}
