#!/usr/bin/env node
// Harness coverage ratchet: line, branch, and function coverage of the shipped
// runtime and hooks under the harness unit suites (.claude/harness/tests).
// Coverage may only rise: a drop below the baseline fails, and a rise of more
// than the slack fails until `--tighten` raises the floor, so gains are kept.
// Shell and multi-process runners are outside this measurement; the slow tier
// and mutation suites cover them.
//
//   node scripts/quality/coverage-ratchet.mjs                 measure and compare
//   node scripts/quality/coverage-ratchet.mjs --summary <f>   compare an existing c8 json-summary
//   node scripts/quality/coverage-ratchet.mjs --tighten       raise the baseline to the measurement
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
export const REPO_ROOT = resolve(HERE, "../..");
export const COVERAGE_BASELINE = "quality/baselines/harness-coverage-v1.json";
export const METRICS = Object.freeze(["lines", "branches", "functions"]);
// Parallel suites shift a few branch counts between runs; a drop within this
// many points is noise, a larger rise must be kept with --tighten.
export const TOLERANCE = 0.3;
const INCLUDE = [".claude/harness/runtime/**", ".claude/harness/foundation.mjs", ".claude/hooks/*.mjs"];

export function measure(root = REPO_ROOT) {
  const reportDir = mkdtempSync(join(tmpdir(), "harness-coverage-"));
  try {
    const tests = readdirSync(join(root, ".claude/harness/tests"))
      .filter((name) => name.endsWith(".test.mjs")).map((name) => join(".claude/harness/tests", name));
    const run = spawnSync(join(root, "node_modules/.bin/c8"), [
      "--reporter=json-summary", `--report-dir=${reportDir}`,
      ...INCLUDE.flatMap((glob) => ["--include", glob]),
      process.execPath, "--test", "--test-concurrency=8", ...tests
    ], { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, CLAUDE_FOUNDATION_PROJECT: "" } });
    if (run.status !== 0) throw new Error(`harness tests failed under coverage:\n${(run.stdout + run.stderr).slice(-3000)}`);
    return summaryValue(JSON.parse(readFileSync(join(reportDir, "coverage-summary.json"), "utf8")));
  } finally { rmSync(reportDir, { recursive: true, force: true }); }
}

export function summaryValue(summary) {
  return Object.fromEntries(METRICS.map((metric) => [metric, summary.total[metric].pct]));
}

export function compareCoverage(baseline, current) {
  const regressions = [];
  const gains = [];
  for (const metric of METRICS) {
    if (current[metric] < baseline[metric] - TOLERANCE)
      regressions.push(`${metric} ${current[metric]}% is below the ${baseline[metric]}% baseline; ` +
        "add tests for the new or changed code instead of lowering the baseline");
    else if (current[metric] > baseline[metric] + TOLERANCE)
      gains.push(`${metric} ${baseline[metric]}% -> ${current[metric]}%`);
  }
  return { regressions, gains };
}

export function main(argv = process.argv.slice(2), out = console) {
  const path = join(REPO_ROOT, COVERAGE_BASELINE);
  const summaryAt = argv.indexOf("--summary");
  const current = summaryAt >= 0
    ? summaryValue(JSON.parse(readFileSync(argv[summaryAt + 1], "utf8"))) : measure();
  if (!existsSync(path)) { out.error(`coverage baseline is missing: ${COVERAGE_BASELINE}`); return 2; }
  const baseline = JSON.parse(readFileSync(path, "utf8"));
  const { regressions, gains } = compareCoverage(baseline, current);
  if (argv.includes("--tighten") && gains.length) {
    const raised = { ...baseline };
    for (const metric of METRICS) raised[metric] = Math.max(baseline[metric], current[metric]);
    writeFileSync(path, `${JSON.stringify(raised, null, 2)}\n`);
    out.log(`coverage ratchet: raised ${gains.join(", ")}`);
    return regressions.length ? 1 : 0;
  }
  for (const line of regressions) out.error(`coverage ratchet: ${line}`);
  if (regressions.length) return 1;
  if (gains.length) {
    out.error(`coverage ratchet: coverage rose (${gains.join(", ")}); run ` +
      "`node scripts/quality/coverage-ratchet.mjs --tighten` and commit the raised baseline");
    return 1;
  }
  out.log(`coverage ratchet: ${METRICS.map((metric) => `${metric} ${current[metric]}%`).join(", ")} at or above the baseline`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = main();
