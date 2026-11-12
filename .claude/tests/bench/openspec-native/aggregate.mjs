#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { BENCH_ARMS, DEFAULT_ARM } from "./scorecard.mjs";

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function median(values) {
  const measured = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (!measured.length) return null;
  const middle = Math.floor(measured.length / 2);
  return measured.length % 2 ? measured[middle]
    : Number(((measured[middle - 1] + measured[middle]) / 2).toFixed(6));
}

function percentile(values, fraction) {
  const measured = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (!measured.length) return null;
  return measured[Math.max(0, Math.ceil(fraction * measured.length) - 1)];
}

// Unknown stays unknown: null when no run measured the value.
function sum(values) {
  const measured = values.filter(Number.isFinite);
  return measured.length ? measured.reduce((total, value) => total + value, 0) : null;
}

function measurement(values) {
  const measured = values.filter(Number.isFinite).length;
  return { measured, unavailable: values.length - measured };
}

function skillCalls(row) {
  const usage = row.scorecard?.skillUsage;
  return usage?.measurement === "measured" ? usage.skillToolCalls : undefined;
}

// Runs that loaded each skill, null when no run had a host stream.
function skillCounts(rows) {
  const measured = rows.filter((row) => skillCalls(row) !== undefined);
  if (!measured.length) return null;
  const counts = {};
  for (const row of measured)
    for (const name of row.scorecard.skillUsage.skillsLoaded) counts[name] = (counts[name] || 0) + 1;
  return counts;
}

function runRows(root, label = null) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    .map((entry) => {
      const runDir = join(root, entry.name);
      const manifest = readJson(join(runDir, "manifest.json"));
      if (!manifest) return null;
      const scorecard = readJson(join(runDir, "openspec-native-runs",
        manifest.runId, "scorecard.json"));
      // Rows written before arms existed are Change Loop rows.
      const arm = manifest.arm || scorecard?.arm || DEFAULT_ARM;
      return { runDir, manifest, scorecard, arm, label };
    }).filter(Boolean);
}

// The Change Loop source a run measured: its commit, plus the uncommitted
// patch when the checkout was dirty.
function sourceIdentity(manifest) {
  const commit = String(manifest.source?.commit || "unknown").slice(0, 7);
  const patch = String(manifest.source?.patchDigest || "").replace(/^sha256:/, "").slice(0, 7);
  return manifest.source?.dirty === true && patch ? `${commit}+${patch}` : commit;
}

// A row's variant within its arm: the `--label` of its result root, else, when
// one scenario's unlabeled Change Loop rows measured more than one source,
// that source (so two harness versions never merge into one arm). Null keeps
// the historical (scenario, arm) row.
function assignVariants(rows) {
  const sources = new Map();
  for (const row of rows) {
    if (row.label || row.arm !== DEFAULT_ARM) continue;
    const scenario = row.manifest.scenario;
    if (!sources.has(scenario)) sources.set(scenario, new Set());
    sources.get(scenario).add(sourceIdentity(row.manifest));
  }
  return rows.map((row) => ({ ...row, variant: row.label ||
    (row.arm === DEFAULT_ARM && sources.get(row.manifest.scenario)?.size > 1
      ? sourceIdentity(row.manifest) : null) }));
}

// One aggregate row per (scenario, arm, variant). Several result roots can be
// read at once so arms collected in separate runs compare side by side;
// `labels[i]` names every run under `root[i]` (for example two releases).
export function aggregateLabRuns(root, source = null, { labels = [] } = {}) {
  const groups = new Map();
  const roots = Array.isArray(root) ? root : [root];
  const rowsForSource = assignVariants(roots.flatMap((path, index) =>
    runRows(resolve(path), labels[index] || null)).filter((row) =>
    !source || (
      row.manifest.source?.commit === source.commit &&
      row.manifest.source?.patchDigest === source.patchDigest)));
  for (const row of rowsForSource) {
    const key = `${row.manifest.scenario}\0${row.arm}\0${row.variant ?? ""}`;
    if (!groups.has(key)) groups.set(key, { scenario: row.manifest.scenario, arm: row.arm,
      variant: row.variant, rows: [] });
    groups.get(key).rows.push(row);
  }
  return [...groups.values()].sort((left, right) =>
    left.scenario.localeCompare(right.scenario) ||
      BENCH_ARMS.indexOf(left.arm) - BENCH_ARMS.indexOf(right.arm) ||
      String(left.variant ?? "").localeCompare(String(right.variant ?? "")))
    .map(({ scenario, arm, variant, rows }) => {
      const strictPasses = rows.filter((row) => row.manifest.strictPass === true &&
        row.scorecard?.outcome?.complete === true &&
        (row.scorecard?.oracle?.configured !== true || row.scorecard.oracle.verdict === "pass") &&
        !Number(row.scorecard?.quality?.fail || 0)).length;
      const paidModelRows = rows.filter((row) =>
        Number(row.scorecard?.usage?.modelRequests) > 0);
      const paidModelStrictPasses = paidModelRows.filter((row) =>
        row.manifest.strictPass === true && row.scorecard?.outcome?.complete === true &&
        (row.scorecard?.oracle?.configured !== true || row.scorecard.oracle.verdict === "pass") &&
        !Number(row.scorecard?.quality?.fail || 0)).length;
      return {
        version: 1,
        scenario,
        arm,
        ...(variant ? { variant } : {}),
        runs: rows.length,
        strictPasses,
        paidModelRuns: paidModelRows.length,
        paidModelStrictPasses,
        paidModelStrictPass: paidModelRows.length > 0 &&
          paidModelStrictPasses === paidModelRows.length,
        strictPass: strictPasses === rows.length,
        reliabilityRate: rows.length
          ? Number((strictPasses / rows.length).toFixed(6)) : null,
        lifecycle: Object.fromEntries(rows.map((row) => [row.manifest.runId,
          row.scorecard?.outcome?.status || "unavailable"])),
        oraclePasses: rows.filter((row) => row.scorecard?.oracle?.verdict === "pass").length,
        medianOracleScore: median(rows.map((row) => row.scorecard?.oracle?.score)),
        oracleMax: rows.some((row) => Number.isFinite(row.scorecard?.oracle?.max))
          ? Math.max(...rows.map((row) => row.scorecard?.oracle?.max).filter(Number.isFinite))
          : null,
        projectCommandPasses: rows.filter((row) =>
          row.manifest.verification?.projectCommand?.status === "pass").length,
        cleanInstallPasses: rows.filter((row) =>
          ["pass", "not-applicable"].includes(row.manifest.verification?.cleanInstall?.status) &&
          ["pass", "not-applicable"].includes(
            row.manifest.verification?.cleanInstallProjectCommand?.status)).length,
        medianWallMs: median(rows.map((row) => row.scorecard?.timing?.wallMs)),
        p95WallMs: percentile(rows.map((row) => row.scorecard?.timing?.wallMs), 0.95),
        medianCostUsd: median(rows.map((row) => row.scorecard?.usage?.costUsd)),
        p95CostUsd: percentile(rows.map((row) => row.scorecard?.usage?.costUsd), 0.95),
        // A host stopped before its result envelope reports only partial cost.
        partialCostRuns: rows.filter((row) =>
          row.scorecard?.usage?.costMeasurement === "partial").length,
        medianModelRequests: median(rows.map((row) => row.scorecard?.usage?.modelRequests)),
        p95ModelRequests: percentile(rows.map((row) =>
          row.scorecard?.usage?.modelRequests), 0.95),
        medianToolCalls: median(rows.map((row) =>
          row.scorecard?.operations?.hostToolCalls?.total)),
        medianOperations: median(rows.map((row) => row.scorecard?.operations?.total)),
        p95Operations: percentile(rows.map((row) => row.scorecard?.operations?.total), 0.95),
        medianResumptions: median(rows.map((row) =>
          row.scorecard?.evidenceReuse?.resumptions)),
        p95Resumptions: percentile(rows.map((row) =>
          row.scorecard?.evidenceReuse?.resumptions), 0.95),
        // Friction the harness put on the agent. The target for a normal run
        // is zero hook refusals; prompts are host approvals the agent waited on.
        hookBlocks: sum(rows.map((row) => row.scorecard?.friction?.hookBlocks)),
        permissionPrompts: sum(rows.map((row) => row.scorecard?.friction?.permissionPrompts)),
        medianToolErrors: median(rows.map((row) => row.scorecard?.friction?.toolErrors)),
        askUserActions: sum(rows.map((row) => row.scorecard?.friction?.advanceActions?.ASK_USER)),
        repairActions: sum(rows.map((row) => row.scorecard?.friction?.advanceActions?.REPAIR)),
        // Skills the agent chose to load. Runs without a host stream are
        // unavailable, never zero.
        skillToolCalls: sum(rows.map(skillCalls)),
        skillRuns: rows.some((row) => skillCalls(row) !== undefined)
          ? rows.filter((row) => skillCalls(row) > 0).length : null,
        skillsLoaded: skillCounts(rows),
        measurements: {
          friction: measurement(rows.map((row) => row.scorecard?.friction?.toolErrors)),
          skillUsage: measurement(rows.map(skillCalls)),
          wallMs: measurement(rows.map((row) => row.scorecard?.timing?.wallMs)),
          costUsd: measurement(rows.map((row) => row.scorecard?.usage?.costUsd)),
          modelRequests: measurement(rows.map((row) =>
            row.scorecard?.usage?.modelRequests)),
          operations: measurement(rows.map((row) => row.scorecard?.operations?.total)),
          resumptions: measurement(rows.map((row) =>
            row.scorecard?.evidenceReuse?.resumptions))
        },
        coverageMinimum: rows.some((row) => Number.isFinite(row.scorecard?.quality?.coverageMinimum))
          ? Math.min(...rows.map((row) => row.scorecard?.quality?.coverageMinimum)
            .filter(Number.isFinite)) : null,
        crapMaximum: rows.some((row) => Number.isFinite(row.scorecard?.quality?.crapMaximum))
          ? Math.max(...rows.map((row) => row.scorecard?.quality?.crapMaximum)
            .filter(Number.isFinite)) : null,
        runDirs: rows.map((row) => row.runDir)
      };
    });
}

function armSummary(row) {
  if (!row) return null;
  return {
    runs: row.runs,
    strictPasses: row.strictPasses,
    oraclePasses: row.oraclePasses,
    medianOracleScore: row.medianOracleScore,
    oracleMax: row.oracleMax,
    medianCostUsd: row.medianCostUsd,
    partialCostRuns: row.partialCostRuns,
    medianWallMs: row.medianWallMs,
    medianModelRequests: row.medianModelRequests,
    medianToolCalls: row.medianToolCalls,
    permissionPrompts: row.permissionPrompts,
    hookBlocks: row.hookBlocks,
    askUserActions: row.askUserActions
  };
}

function difference(left, right) {
  return Number.isFinite(left) && Number.isFinite(right)
    ? Number((left - right).toFixed(6)) : null;
}

function armDelta(left, right) {
  return left && right ? {
    oraclePasses: difference(left.oraclePasses / left.runs, right.oraclePasses / right.runs),
    medianOracleScore: difference(left.medianOracleScore, right.medianOracleScore),
    medianCostUsd: difference(left.medianCostUsd, right.medianCostUsd),
    medianWallMs: difference(left.medianWallMs, right.medianWallMs),
    medianModelRequests: difference(left.medianModelRequests, right.medianModelRequests),
    medianToolCalls: difference(left.medianToolCalls, right.medianToolCalls),
    permissionPrompts: difference(left.permissionPrompts, right.permissionPrompts)
  } : null;
}

const ARM_COLUMNS = { "change-loop": "CL", baseline: "base", "baseline-review": "base+review" };
function armColumn(arm, variant) {
  const name = ARM_COLUMNS[arm] || arm;
  return variant ? `${name} ${variant}` : name;
}

// Per scenario: every arm present side by side. Change Loop against the
// no-harness baseline stays the headline pair (`changeLoop`, `baseline`,
// `delta`); when a reviewed baseline or several Change Loop sources are
// present, `arms` lists every column and `deltas` compares each with the
// baseline. A missing arm stays null; a delta exists only when both sides
// measured it.
export function compareArms(aggregates) {
  const scenarios = [...new Set(aggregates.map((row) => row.scenario))].sort();
  const extended = aggregates.some((row) => row.variant ||
    !["change-loop", "baseline"].includes(row.arm || DEFAULT_ARM));
  return scenarios.map((scenario) => {
    const find = (arm) => aggregates.find((row) => row.scenario === scenario &&
      (row.arm || DEFAULT_ARM) === arm && !row.variant) || null;
    const changeLoop = armSummary(find("change-loop"));
    const baseline = armSummary(find("baseline"));
    const comparison = {
      version: 1,
      protocol: "foundation-openspec-native-arm-comparison-v1",
      scenario,
      changeLoop,
      baseline,
      delta: armDelta(changeLoop, baseline)
    };
    if (!extended) return comparison;
    const arms = aggregates.filter((row) => row.scenario === scenario).map((row) => ({
      column: armColumn(row.arm || DEFAULT_ARM, row.variant),
      arm: row.arm || DEFAULT_ARM, variant: row.variant || null, summary: armSummary(row)
    }));
    return { ...comparison, arms, deltas: Object.fromEntries(arms
      .filter((entry) => entry.column !== "base")
      .map((entry) => [entry.column, armDelta(entry.summary, baseline)])) };
  });
}

function cell(summary, render) {
  return summary ? render(summary) : "-";
}

function shown(value, format = (number) => String(number)) {
  return Number.isFinite(value) ? format(value) : "n/a";
}

export function formatArmComparison(rows) {
  const oracle = (summary) => `${summary.oraclePasses}/${summary.runs} (${
    shown(summary.medianOracleScore)}/${shown(summary.oracleMax)})`;
  const cost = (summary) => `${shown(summary.medianCostUsd, (value) => `$${value.toFixed(4)}`)}${
    summary.partialCostRuns ? "*" : ""}`;
  const wall = (summary) => shown(summary.medianWallMs, (value) => `${(value / 1000).toFixed(1)}s`);
  const metrics = [["oracle", oracle], ["cost", cost], ["wall", wall],
    ["requests", (s) => shown(s.medianModelRequests)], ["tools", (s) => shown(s.medianToolCalls)],
    ["prompts", (s) => shown(s.permissionPrompts)]];
  // The headline pair keeps its historical columns; extended comparisons add
  // one column per arm (and Change Loop source) present in any scenario.
  const columns = rows.some((row) => row.arms) ? [...new Map(rows.flatMap((row) =>
    row.arms || []).map((entry) => [entry.column, entry])).values()]
    .sort((left, right) => BENCH_ARMS.indexOf(left.arm) - BENCH_ARMS.indexOf(right.arm) ||
      String(left.variant ?? "").localeCompare(String(right.variant ?? "")))
    .map((entry) => entry.column) : ["CL", "base"];
  const summaryFor = (row, column) => row.arms
    ? row.arms.find((entry) => entry.column === column)?.summary ?? null
    : column === "CL" ? row.changeLoop : row.baseline;
  const lines = [
    `| scenario | ${metrics.flatMap(([name]) => columns.map((column) => `${name} ${column}`))
      .join(" | ")} |`,
    `|---|${metrics.flatMap(() => columns.map(() => "---")).join("|")}|`
  ];
  for (const row of rows)
    lines.push(`| ${row.scenario} | ${metrics.flatMap(([, render]) =>
      columns.map((column) => cell(summaryFor(row, column), render))).join(" | ")} |`);
  if (rows.some((row) => columns.some((column) => summaryFor(row, column)?.partialCostRuns)))
    lines.push("", "\\* at least one run reported partial cost (host stopped before its result envelope).");
  return `${lines.join("\n")}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const mode = argv.includes("--compare") ? "table"
    : argv.includes("--compare-json") ? "json" : "aggregate";
  // `--label <name>` names the runs of the result root that follows it.
  const roots = [];
  const labels = [];
  let label = null;
  let usage = false;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--label") {
      label = argv[index + 1];
      if (!label || label.startsWith("--")) usage = true;
      index += 1;
    } else if (!argv[index].startsWith("--")) {
      roots.push(argv[index]);
      labels.push(label);
      label = null;
    }
  }
  if (!roots.length || usage || label) {
    process.stderr.write(
      "usage: aggregate.mjs [--label <name>] <lab-results-directory>... [--compare | --compare-json]\n");
    process.exitCode = 2;
  } else if (mode === "aggregate") {
    const result = aggregateLabRuns(roots, null, { labels });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.some((row) => !row.strictPass)) process.exitCode = 1;
  } else {
    const comparison = compareArms(aggregateLabRuns(roots, null, { labels }));
    process.stdout.write(mode === "json" ? `${JSON.stringify(comparison, null, 2)}\n`
      : formatArmComparison(comparison));
  }
}
