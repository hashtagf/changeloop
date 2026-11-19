#!/usr/bin/env node
// Per-version paid-lane results, kept so a release only pays for the new
// version. Each released version's measured runs are recorded once in
// docs/reports/benchmarks/<version>.json with the fixture and prompt digest
// each lane ran under. A later release compares against that record and
// re-runs an old lane only when its fixture or prompt changed since (the old
// result would not be the same task) or when the old version has no result.
//
//   node scripts/release/lane-results.mjs record <version> <result-dir>   scorecards under the dir → the record
//   node scripts/release/lane-results.mjs plan <old-version> [--new <ref>] lanes to run, and on which version
//   node scripts/release/lane-results.mjs compare <old> <new> [--markdown] per-lane and total comparison
//
// A record never invents a value: a lane that did not run has no row, and a
// measurement the scorecard marks unavailable stays null.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const RESULTS_DIR = "docs/reports/benchmarks";
export const MATRIX = ".claude/tests/bench/config/openspec-native-matrix.json";
const sha = (value) => `sha256:${createHash("sha256").update(String(value)).digest("hex")}`;

// The matrix as of a commit (or the working tree for null).
export function matrixAt(commit, root = ROOT) {
  const text = commit ? execFileSync("git", ["-C", root, "show", `${commit}:${MATRIX}`], { encoding: "utf8" })
    : readFileSync(join(root, MATRIX), "utf8");
  return new Map(JSON.parse(text).scenarios.map((row) => [row.id, row]));
}

// What makes two runs the same task: the frozen fixture and the prompt.
export const taskIdentity = (scenario) => scenario
  ? { fixtureDigest: scenario.fixture_digest || null, promptDigest: sha(scenario.prompt || "") } : null;

function scorecards(dir) {
  const out = [];
  const walk = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (entry.name === "scorecard.json") out.push(child);
    }
  };
  walk(dir);
  return out;
}

const measured = (value, measurement) => measurement === "unavailable" ? null : value ?? null;

// One lane row from a scorecard and the matrix it ran under.
export function laneRow(card, matrix) {
  const scenario = typeof card.scenario === "string" ? card.scenario : card.scenario?.id;
  const outcome = card.outcome || {};
  const oracle = card.oracle || {};
  const usage = card.usage || {};
  return {
    lane: scenario,
    ...taskIdentity(matrix.get(scenario)),
    commit: card.provenance?.commit || null,
    runId: card.runId || null,
    at: card.provenance?.finishedAt || null,
    passed: outcome.workflowStatus === "archived" && oracle.verdict === "pass",
    workflow: outcome.workflowStatus || null,
    failure: outcome.failureClass || null,
    decision: outcome.decisionKind || null,
    oracleScore: oracle.score ?? null,
    oracleMax: oracle.max ?? null,
    wallMin: card.timing?.wallMs ? Math.round(card.timing.wallMs / 600) / 100 : null,
    costUsd: measured(usage.costUsd == null ? null : Math.round(usage.costUsd * 1000) / 1000, usage.costMeasurement),
    costMeasurement: usage.costMeasurement || null,
    modelRequests: measured(usage.modelRequests, usage.modelRequestsMeasurement)
  };
}

export function recordPath(version, root = ROOT) {
  return join(root, RESULTS_DIR, `${version}.json`);
}

export function readRecord(version, root = ROOT) {
  const path = recordPath(version, root);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
}

// Adds or replaces each lane's row; a lane run again keeps only its latest run.
export function record(version, dir, root = ROOT, { matrixAt: readMatrix = (commit) => matrixAt(commit, root) } = {}) {
  const cards = scorecards(resolve(dir)).map((path) => JSON.parse(readFileSync(path, "utf8")))
    .filter((card) => card.arm === undefined || card.arm === "change-loop");
  if (!cards.length) throw new Error(`no Change Loop scorecard under ${dir}`);
  const commits = [...new Set(cards.map((card) => card.provenance?.commit).filter(Boolean))];
  const matrices = new Map(commits.map((commit) => [commit, readMatrix(commit)]));
  const prior = readRecord(version, root);
  const lanes = new Map((prior?.lanes || []).map((row) => [row.lane, row]));
  for (const card of cards) {
    const row = laneRow(card, matrices.get(card.provenance?.commit) || new Map());
    const existing = lanes.get(row.lane);
    if (!existing || String(existing.at) <= String(row.at)) lanes.set(row.lane, row);
  }
  const value = { version, protocol: "changeloop-lane-results-v1", commits,
    lanes: [...lanes.values()].sort((left, right) => left.lane.localeCompare(right.lane)) };
  mkdirSync(dirname(recordPath(version, root)), { recursive: true });
  writeFileSync(recordPath(version, root), `${JSON.stringify(value, null, 2)}\n`);
  return value;
}

// Which lanes a new release must run, and where. `matrix` is the new
// version's matrix and `oldLanes` the lanes the old version had. A lane whose
// task is unchanged and that the old record holds runs on the new version
// only; so does a lane the old version never had.
export function plan(oldRecord, matrix, oldLanes = new Set((oldRecord?.lanes || []).map((row) => row.lane))) {
  const old = new Map((oldRecord?.lanes || []).map((row) => [row.lane, row]));
  const rows = [];
  for (const [lane, scenario] of matrix) {
    if (scenario.execution !== "paid" || scenario.status !== "ready") continue;
    const identity = taskIdentity(scenario);
    const previous = old.get(lane);
    if (!oldLanes.has(lane)) { rows.push({ lane, runOld: false, runNew: true, reason: "a new lane; the old version has none" }); continue; }
    const reason = !previous ? "no result for the old version"
      : previous.fixtureDigest !== identity.fixtureDigest ? "fixture changed since the old run"
        : previous.promptDigest !== identity.promptDigest ? "prompt changed since the old run" : null;
    rows.push({ lane, runOld: Boolean(reason), runNew: true, reason });
  }
  return rows;
}

const sum = (rows, key) => rows.reduce((total, row) => total + (row[key] ?? 0), 0);

// Lanes both records hold for the same task.
export function compare(oldRecord, newRecord) {
  const old = new Map(oldRecord.lanes.map((row) => [row.lane, row]));
  const pairs = newRecord.lanes.filter((row) => old.has(row.lane)).map((row) => ({ lane: row.lane, old: old.get(row.lane), new: row,
    sameTask: old.get(row.lane).fixtureDigest === row.fixtureDigest && old.get(row.lane).promptDigest === row.promptDigest }));
  const same = pairs.filter((pair) => pair.sameTask);
  const totals = (side) => ({
    passed: same.filter((pair) => pair[side].passed).length,
    wallMin: Math.round(sum(same.map((pair) => pair[side]), "wallMin") * 10) / 10,
    costUsd: Math.round(sum(same.map((pair) => pair[side]), "costUsd") * 100) / 100,
    modelRequests: sum(same.map((pair) => pair[side]), "modelRequests"),
    costUnmeasured: same.filter((pair) => pair[side].costUsd === null).length
  });
  return { old: oldRecord.version, new: newRecord.version, pairs, compared: same.length,
    totals: { old: totals("old"), new: totals("new") },
    onlyNew: newRecord.lanes.filter((row) => !old.has(row.lane)).map((row) => row.lane) };
}

const pct = (from, to) => from ? `${to <= from ? "−" : "+"}${Math.abs(Math.round((to - from) / from * 100))}%` : "—";
const cell = (row) => `${row.passed ? "✅" : "❌"} ${row.oracleScore ?? "?"}/${row.oracleMax ?? "?"} · ${row.wallMin ?? "?"} min · ` +
  `${row.costUsd === null ? "cost n/a" : `$${row.costUsd}`}${row.passed ? "" : ` · ${row.workflow}${row.decision ? ` (${row.decision})` : ""}`}`;

export function compareMarkdown(value) {
  const { old: o, new: n } = value.totals;
  return [`## ${value.new} against ${value.old}: ${value.compared} lanes with the same task`, "",
    `| | ${value.old} | ${value.new} | change |`, "|---|---|---|---|",
    `| Passed (archived, oracle pass) | ${o.passed}/${value.compared} | ${n.passed}/${value.compared} | |`,
    `| Wall time | ${o.wallMin} min | ${n.wallMin} min | ${pct(o.wallMin, n.wallMin)} |`,
    `| Cost | $${o.costUsd} | $${n.costUsd} | ${pct(o.costUsd, n.costUsd)} |`,
    `| Model requests | ${o.modelRequests} | ${n.modelRequests} | ${pct(o.modelRequests, n.modelRequests)} |`, "",
    `| Lane | ${value.old} | ${value.new} |`, "|---|---|---|",
    ...value.pairs.map((pair) => `| ${pair.lane}${pair.sameTask ? "" : " (task changed)"} | ${cell(pair.old)} | ${cell(pair.new)} |`),
    ...(value.onlyNew.length ? ["", `Only in ${value.new}: ${value.onlyNew.join(", ")}`] : [])].join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const [command, ...args] = process.argv.slice(2);
  const flag = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; };
  if (command === "record" && args.length >= 2) {
    const value = record(args[0], args[1]);
    console.log(`recorded ${value.lanes.length} lane(s) for ${value.version} in ${RESULTS_DIR}/${value.version}.json`);
  } else if (command === "plan" && args[0]) {
    const old = readRecord(args[0]);
    const oldLanes = new Set((old?.commits || []).flatMap((commit) => [...matrixAt(commit).keys()]));
    const rows = plan(old, matrixAt(flag("--new")), oldLanes.size ? oldLanes : undefined);
    for (const row of rows) console.log(`${row.lane}: ${row.runOld ? `run both (${row.reason})` : "run the new version only"}`);
    console.log(`${rows.filter((row) => !row.runOld).length} lane(s) reuse ${args[0]}; ${rows.filter((row) => row.runOld).length} need both`);
  } else if (command === "compare" && args.length >= 2) {
    const [left, right] = [readRecord(args[0]), readRecord(args[1])];
    if (!left || !right) { console.error(`no record for ${left ? args[1] : args[0]}`); process.exit(2); }
    const value = compare(left, right);
    console.log(args.includes("--markdown") ? compareMarkdown(value) : JSON.stringify(value, null, 2));
  } else {
    console.error("usage: lane-results.mjs record <version> <result-dir> | plan <old-version> [--new <ref>] | compare <old> <new> [--markdown]");
    process.exit(2);
  }
}
