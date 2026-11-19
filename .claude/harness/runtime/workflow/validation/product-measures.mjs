// Post-release measurement of the product documents' success metrics. A PRD
// names each metric with a `KPI-nn` ID and its target ("≥ 2.5%"); after a
// release, `product measure` records an observed value with the source it came
// from (a dashboard, query, or export) in openspec/product-measurements.jsonl,
// a project-owned file the team reviews and commits. The product view then
// shows each metric's target, its latest value, whether the target is met, and
// the value before and after the last release of the feature it belongs to.
// Nothing is inferred: a metric with no recorded value is unmeasured, and a
// target that names no comparison is shown without a verdict.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { bestEffort } from "../../core/best-effort.mjs";

export const MEASUREMENTS_PATH = "openspec/product-measurements.jsonl";
const KPI_ROW = /^(?:\|\s*|[-*+]\s+|\d+[.)]\s+|#{1,6}\s+)?(?:\*\*)?(KPI-\d+)(?!\d)/;
const TARGET = /(≥|>=|≤|<=|>|<|=)\s*([-+]?\d[\d,]*(?:\.\d+)?)\s*(%|[^\s|·,;)]*)?/;

// The metrics a document defines: { id, text, target: { op, value, unit } | null }.
export function documentMetrics(text) {
  const rows = [];
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    const id = line.match(KPI_ROW)?.[1];
    if (!id || rows.some((row) => row.id === id)) continue;
    const body = line.replace(/^[|*#\-+\s]+|[|*\s]+$/g, "").replace(/\s*\|\s*/g, " · ").replace(new RegExp(`^${id}\\b\\s*[·:–—-]?\\s*`), "");
    const match = body.match(TARGET);
    rows.push({ id, text: body.slice(0, 160),
      target: match ? { op: match[1].replace(">=", "≥").replace("<=", "≤"), value: Number(match[2].replaceAll(",", "")), unit: match[3] || "" } : null });
  }
  return rows;
}

export function targetMet(target, value) {
  if (!target || !Number.isFinite(value)) return null;
  return { "≥": value >= target.value, "≤": value <= target.value, ">": value > target.value,
    "<": value < target.value, "=": value === target.value }[target.op] ?? null;
}

export function readMeasurements(root) {
  const path = join(root, MEASUREMENTS_PATH);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(Boolean).flatMap((line) => {
    // A hand-edited line that is not JSON is not a measurement.
    const row = bestEffort(() => JSON.parse(line), null);
    return row && typeof row.kpi === "string" ? [row] : [];
  });
}

// Validates and appends one measurement. `at` defaults to now.
export function measurementIssues(row, metrics) {
  const issues = [];
  if (!metrics.some((metric) => metric.id === row.kpi)) issues.push(`${row.kpi} is not a success metric in ${row.document}`);
  if (!Number.isFinite(row.value)) issues.push("--value must be a number");
  if (!String(row.source || "").trim()) issues.push("--source must name where the value came from (a dashboard, query, or export)");
  if (Number.isNaN(Date.parse(row.at))) issues.push("--at must be an ISO date");
  return issues;
}

export function recordMeasurement(root, row) {
  const path = join(root, MEASUREMENTS_PATH);
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(row)}\n`);
}

// Each metric with its latest value and verdict. `releases` maps a feature to
// the date its last change was archived; a metric names its feature by an
// F-nn ID in its row, or belongs to the whole document.
export function metricProgress(metrics, measurements, document, releases = new Map()) {
  return metrics.map((metric) => {
    const rows = measurements.filter((row) => row.kpi === metric.id && row.document === document)
      .sort((left, right) => Date.parse(left.at) - Date.parse(right.at));
    const latest = rows.at(-1) || null;
    const feature = metric.text.match(/\bF-\d+\b/)?.[0] || null;
    const released = feature ? releases.get(feature) || null : [...releases.values()].sort().at(-1) || null;
    const before = released ? rows.filter((row) => row.at.slice(0, 10) < released).at(-1) || null : null;
    const after = released ? rows.filter((row) => row.at.slice(0, 10) >= released).at(-1) || null : null;
    return { ...metric, feature, released, latest, before, after,
      status: !latest ? "unmeasured" : targetMet(metric.target, latest.value) === null ? "measured"
        : targetMet(metric.target, latest.value) ? "met" : "missed" };
  });
}

export function metricLine(metric) {
  const target = metric.target ? `target ${metric.target.op} ${metric.target.value}${metric.target.unit}` : "no comparable target";
  if (!metric.latest) return `${metric.id} ${metric.text.slice(0, 60)} — ${target}; not measured yet`;
  const change = metric.before && metric.after
    ? `; ${metric.before.value} before the ${metric.released} release, ${metric.after.value} after` : "";
  return `${metric.id} ${metric.text.slice(0, 60)} — ${target}; ${metric.latest.value} on ${metric.latest.at.slice(0, 10)} ` +
    `(${metric.latest.source}): ${metric.status}${change}`;
}
