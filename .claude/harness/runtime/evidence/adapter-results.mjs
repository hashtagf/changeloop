// What an executed provider's report proves: required critical cases,
// evaluation scores, mutation kills, and the discovery-count repair for a
// runner whose output cannot be counted.
import { evaluationResult } from "./provider-catalog.mjs";

// The receipt vocabulary, ordered. An adapter that runs more than one provider
// has to report the worst thing that happened — not the last one in the array,
// and never a word from a different vocabulary. `blocked` is deliberately
// absent: it means "waiting on something external" everywhere else in the
// harness, so returning it for a suite that ran and failed made a red test
// indistinguishable from a test that never got to run.
function normalizedCriticalCase(row) {
  return {
    id: String(row?.id || ""),
    status: String(row?.status || "").toLowerCase()
  };
}

function assertionCriticalCase(assertion) {
  const name = [assertion?.ancestorTitles?.join(" "), assertion?.title,
    assertion?.fullName].filter(Boolean).join(" ");
  return { id: name, status: String(assertion?.status || "").toLowerCase() };
}

function suiteCriticalCases(suite) {
  return (suite?.assertionResults || []).map(assertionCriticalCase);
}

function criticalCaseRows(report) {
  const explicit = report?.criticalCases || report?.foundation?.criticalCases;
  if (Array.isArray(explicit))
    return explicit.map(normalizedCriticalCase).filter((row) => row.id);
  return (report?.testResults || []).flatMap(suiteCriticalCases);
}

function containsCriticalCaseId(value, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^A-Za-z0-9_-])${escaped}(?:$|[^A-Za-z0-9_-])`)
    .test(value);
}

export function criticalCaseResult(report, required) {
  if (!required.length) return { status: "pass", observations: [] };
  const rows = criticalCaseRows(report);
  const observations = required.map((id) => {
    const exact = rows.find((row) => row.id === id);
    const embedded = exact || rows.find((row) =>
      containsCriticalCaseId(row.id, id));
    // A one-case provider and a one-result report have only one possible
    // binding. Requiring the model to repeat the case ID in the test title is
    // bookkeeping, not assurance, so the harness records that binding itself.
    const derived = embedded || (required.length === 1 && rows.length === 1
      ? rows[0] : null);
    return { id, status: derived?.status || "missing" };
  });
  const passWords = new Set(["pass", "passed", "success", "ok"]);
  return {
    status: observations.every((row) => passWords.has(row.status)) ? "pass" : "fail",
    observations
  };
}

// An evaluation provider passes only when its command exits 0 and its
// machine-readable result (foundation-evaluation-v1, stdout or report file)
// reports score >= threshold. The returned value names both numbers.
export function evaluationAdapterResult(result, report, config = {}) {
  const evaluation = evaluationResult(report || {}, config);
  if (result?.status !== 0 && evaluation.status === "pass")
    return { ...evaluation, status: "fail",
      observed: `${evaluation.observed}; command exited ${result?.status ?? "error"}` };
  return evaluation;
}

export function enforceCriticalCases(baseStatus, critical) {
  return baseStatus === "pass" ? critical.status : baseStatus;
}

export function mutationV2Result(report, required, mutantKillers = {}) {
  const rows = Array.isArray(report?.mutants) ? report.mutants : [];
  const observations = required.map((id) => {
    const row = rows.find((candidate) => candidate?.id === id);
    const killedBy = String(row?.killedBy || row?.killerCaseId || "");
    const expectedKiller = String(mutantKillers[id] || "");
    const killed = row?.result === "killed" || row?.killed === true;
    return {
      id,
      applied: row?.applied === true,
      compiled: row?.compiled === true,
      result: String(row?.result || (killed ? "killed" : "missing")),
      killedBy,
      expectedKiller
    };
  });
  const killerCases = [...new Set(observations.map((row) => row.expectedKiller)
    .filter(Boolean))];
  const killerResult = criticalCaseResult(report, killerCases);
  const passedKillers = new Set(killerResult.observations
    .filter((row) => ["pass", "passed", "success", "ok"].includes(row.status))
    .map((row) => row.id));
  return {
    status: observations.every((row) =>
      row.applied && row.compiled && row.result === "killed" &&
      row.expectedKiller && row.killedBy === row.expectedKiller &&
      passedKillers.has(row.expectedKiller))
      ? "pass" : "fail",
    observations,
    killerCases: killerResult.observations
  };
}

const NODE_TEST = /(?:^|[\s;&|(])node\s+(?:[^;&|]*\s)?--test(?:[\s=]|$)/;

const COUNTABLE_NODE_REPORTER = /--test-reporter(?:=|\s+)(?:tap|spec)\b/;

const SCRIPT_RUNNER = /(?:^|[\s;&|(])(npm|pnpm|yarn|bun)\s+([^;&|)]*)/;

function packageScriptName(command) {
  const match = command.match(SCRIPT_RUNNER);
  if (!match) return null;
  const [first, second] = match[2].split(/\s+/).filter((token) =>
    token && !token.startsWith("-"));
  if (["run", "run-script"].includes(first)) return second || null;
  if (["test", "t", "tst"].includes(first)) return "test";
  return match[1] === "npm" ? null : first || null;
}

function nodeTestReporterFix(command) {
  const replaced = command.replace(/--test-reporter(?:=|\s+)\S+/, "--test-reporter=tap");
  return replaced !== command ? replaced
    : command.replace(/(node\s+(?:[^;&|]*\s)?--test)(?=[\s=]|$)/, "$1 --test-reporter=tap");
}

// Discovery without a structured count stays inconclusive; this names the one
// edit that makes the same verify command countable so the agent never has to
// reverse-engineer the parser or rewire execution by hand.
export function discoveryCountRepair(command, packageScripts = null) {
  const text = (Array.isArray(command) ? command : [command])
    .map((part) => String(part ?? "")).join(" ").replace(/^sh -c /, "");
  const name = NODE_TEST.test(` ${text}`) ? null : packageScriptName(text);
  const script = name ? packageScripts?.[name] : null;
  const wrapped = typeof script === "string" && NODE_TEST.test(` ${script}`);
  const nodeCommand = wrapped ? script : NODE_TEST.test(` ${text}`) ? text : null;
  if (!nodeCommand)
    return "make the verify command print a counted result (TAP '1..N', node " +
      "'ℹ tests N', a Jest/Vitest summary, or JSON numTotalTests); for node --test add " +
      "--test-reporter=tap";
  const where = wrapped ? `package.json scripts.${name}`
    : "the task verify (through a semantic amendment)";
  if (COUNTABLE_NODE_REPORTER.test(nodeCommand))
    return `node --test already uses a countable reporter but its count never reached ` +
      `stdout; remove the pipe or redirection in ${where}`;
  return `node --test prints no countable reporter; change ${where} to ` +
    `'${nodeTestReporterFix(nodeCommand)}' so discovery can count tests`;
}

export function mutationReceiptClassification(protocol, legacyResult, configured) {
  // Receipt classification describes how the fault was exposed. The provider
  // fingerprint separately binds the result protocol and its full contract.
  return protocol === "foundation-mutation-v2"
    ? "behavioral-kill" : legacyResult || configured;
}
