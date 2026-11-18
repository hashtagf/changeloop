#!/usr/bin/env node
// Repository quality scorecard: code health from the committed ratchet
// baselines, the test inventory, and how each rule in the agent guides is
// enforced (the poteto pyramid: architecture, type, lint, test, and mutation
// checks above judgment calls above prose). On a green build the baselines
// equal the code, because the ratchet fails until improvements are tightened.
//
//   node scripts/quality/scorecard.mjs              JSON
//   node scripts/quality/scorecard.mjs --markdown   a table for a CI job summary
//   node scripts/quality/scorecard.mjs --check      fail when the rule registry is
//                                                   stale or prose-only rules grow
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RULE_LAYERS, ruleRegistrySummary } from "../../.claude/harness/runtime/quality/rule-registry.mjs";
import { pyramidReadiness } from "../../.claude/harness/runtime/quality/pyramid-readiness.mjs";
import { incidentSummary } from "../../.claude/harness/runtime/quality/incident-records.mjs";
import { createOutcomesRuntime } from "../../.claude/harness/runtime/observability/outcomes-runtime.mjs";
import { uiReadinessFacts } from "../../.claude/harness/runtime/quality/ui-readiness.mjs";
import { enforcedLessons, enforcementKind } from "../../.claude/harness/runtime/observability/lessons-runtime.mjs";
import { COVERAGE_BASELINE } from "./coverage-ratchet.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
export const REPO_ROOT = resolve(HERE, "../..");
export const RULES = "quality/rule-enforcement.json";
const LINT_BASELINE = "quality/baselines/lint-ratchet-v1.json";
const SKILL_BASELINE = "quality/baselines/skill-contracts-v1.json";
const LAYERS = RULE_LAYERS;
const TEST_ROOTS = [".claude", "scripts", "dashboard"];

const readJson = (root, path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const sum = (values) => values.reduce((total, value) => total + value, 0);

function walk(root, dir, keep) {
  const absolute = join(root, dir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return entry.name === "node_modules" || entry.name === "results" ? [] : walk(root, path, keep);
    return entry.isFile() && keep(path) ? [path] : [];
  });
}

const lines = (text) => text.length ? text.split("\n").length - (text.endsWith("\n") ? 1 : 0) : 0;

export function codeHealth(root) {
  const baseline = readJson(root, LINT_BASELINE);
  const totals = { lint: 0, types: 0, nestingFiles: 0, nestingMax: 0, duplicateBlocks: 0, workaroundComments: 0 };
  for (const rules of Object.values(baseline.violations))
    for (const [rule, count] of Object.entries(rules)) {
      if (rule.startsWith("types/")) totals.types += count;
      else if (rule === "complexity/nesting") {
        totals.nestingFiles += 1;
        totals.nestingMax = Math.max(totals.nestingMax, count);
      } else if (rule === "duplication/block") totals.duplicateBlocks += count;
      else {
        totals.lint += count;
        if (rule === "changeloop/no-workaround-comment") totals.workaroundComments += count;
      }
    }
  const sizes = Object.entries(baseline.sizes).sort(([, a], [, b]) => b - a);
  const ceiling = baseline.sizeCeiling;
  const runtime = walk(root, ".claude/harness/runtime", (path) => path.endsWith(".mjs"));
  return {
    lintFindings: totals.lint,
    typeFindings: totals.types,
    filesOverSizeCeiling: sizes.filter(([, size]) => size > ceiling).length,
    sizeCeiling: ceiling,
    largestFile: sizes[0] ? { path: sizes[0][0], lines: sizes[0][1] } : null,
    filesNestedOverLimit: totals.nestingFiles,
    deepestNesting: totals.nestingMax,
    duplicateBlocks: totals.duplicateBlocks,
    workaroundComments: totals.workaroundComments,
    runtimeFiles: runtime.length,
    runtimeLines: sum(runtime.map((path) => lines(readFileSync(join(root, path), "utf8"))))
  };
}

export function testInventory(root) {
  const suites = readFileSync(join(root, ".claude/tests/run-all.sh"), "utf8").split("\n")
    .map((line) => line.match(/^([a-z][a-z0-9 ().,'/-]*)\|/i)?.[1]).filter(Boolean);
  const files = TEST_ROOTS.flatMap((dir) => walk(root, dir, (path) => /\.test\.m?js$/.test(path)));
  const cases = sum(files.map((path) => (readFileSync(join(root, path), "utf8").match(/^test\(/gm) || []).length));
  const skills = existsSync(join(root, SKILL_BASELINE)) ? readJson(root, SKILL_BASELINE) : null;
  return {
    suites: suites.length,
    mutationSuites: suites.filter((name) => /mutation/.test(name)).length,
    testFiles: files.length,
    testCases: cases,
    skillsWithoutContract: Array.isArray(skills?.withoutContract) ? skills.withoutContract.length : null
  };
}

export { registryIssues } from "../../.claude/harness/runtime/quality/rule-registry.mjs";

export function pyramid(root) {
  return ruleRegistrySummary(root, readJson(root, RULES));
}

// This repository's facts for the pyramid readiness criteria Change Loop
// ships to installed projects: the same criteria, read from the repository's
// own ratchets instead of consumer quality lanes.
// The repository's lessons are the rows of openspec/lessons.md; one counts as
// enforced when its "Enforced by" cell names a file in the repository.
export function repositoryLessons(root) {
  const path = join(root, "openspec/lessons.md");
  if (!existsSync(path)) return null;
  const rows = enforcedLessons(readFileSync(path, "utf8"));
  const pending = rows.filter((row) => !["check", "judgment"].includes(
    enforcementKind(row.enforcedBy, (file) => existsSync(join(root, file)))));
  return { recurring: rows.length, pending: pending.length };
}

// The local change store's archived outcomes, summarized as readiness reads
// them; null when the checkout has no store.
export function repositoryOutcomes(root) {
  const store = join(root, ".foundation");
  if (!existsSync(join(store, "runtime"))) return null;
  const evidenceDir = join(store, "evidence");
  const changes = createOutcomesRuntime({
    runtimeDir: join(store, "runtime"), evidenceDir, logsDir: join(store, "logs"),
    changeWorkTypes: () => [],
    reviewAttemptRecords: (id) => {
      const dir = join(evidenceDir, id, "review-attempts");
      return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
        .flatMap((name) => { try { return [JSON.parse(readFileSync(join(dir, name), "utf8"))]; } catch { return []; } }) : [];
    }
  }).outcomesValue().changes;
  return {
    archived: changes.length,
    measured: changes.filter((change) => change.firstProofPass !== null).length,
    firstProofPasses: changes.filter((change) => change.firstProofPass === true).length,
    escapedDefects: changes.reduce((total, change) => total + (change.escapedDefects || 0), 0)
  };
}

export function repositoryReadiness(root, card) {
  const ratcheting = "ratcheting";
  const featureMap = existsSync(join(root, "docs/feature-map.json"))
    ? { features: (readJson(root, "docs/feature-map.json").features || []).length } : null;
  const mutationBaselines = existsSync(join(root, "quality/baselines"))
    ? readdirSync(join(root, "quality/baselines")).filter((name) => /mutation/.test(name)).length : 0;
  return pyramidReadiness({
    lanes: {
      // scripts/lint/ratchet.mjs holds lint, tsc, sizes, nesting, copies, and
      // stopgap comments; architecture-check.mjs holds module boundaries.
      "file-size": ratcheting, "nesting-depth": ratcheting,
      duplication: ratcheting, "module-boundaries": ratcheting, lint: ratcheting, "type-check": ratcheting,
      "workaround-comments": ratcheting, test: "configured",
      ...(existsSync(join(root, COVERAGE_BASELINE)) ? { coverage: ratcheting } : {}),
      ...(mutationBaselines ? { "automated-mutation": ratcheting } : {})
    },
    // On a green build the committed baseline equals the code.
    findings: {
      "file-size": card.code.filesOverSizeCeiling, "nesting-depth": card.code.filesNestedOverLimit,
      duplication: card.code.duplicateBlocks, "module-boundaries": 0, lint: card.code.lintFindings,
      "type-check": card.code.typeFindings, "workaround-comments": card.code.workaroundComments
    },
    featureMap,
    lessons: repositoryLessons(root),
    rules: { registered: card.pyramid.rules, prose: card.pyramid.proseOnly.length,
      issues: card.pyramid.registryIssues.length, unregistered: card.pyramid.unregistered.length },
    incidents: incidentSummary(root),
    ui: uiReadinessFacts(root),
    // Archived-change outcomes live in .foundation state: a maintainer's
    // checkout measures them, CI (no state) reports them unmeasured.
    outcomes: repositoryOutcomes(root)
  });
}

export function scorecard(root = REPO_ROOT) {
  const card = { version: 1, code: codeHealth(root), tests: testInventory(root), pyramid: pyramid(root) };
  return { ...card, readiness: repositoryReadiness(root, card) };
}

export function markdown(card) {
  const { code, tests, pyramid: rules } = card;
  const row = (name, value) => `| ${name} | ${value} |`;
  return [
    "## Quality scorecard", "",
    "| Code health | Value |", "|---|---|",
    row("Lint findings", code.lintFindings),
    row("Type findings (tsc --checkJs)", code.typeFindings),
    row(`Files over ${code.sizeCeiling} lines`, `${code.filesOverSizeCeiling} (largest ${code.largestFile?.path} ${code.largestFile?.lines})`),
    row("Files nesting over 5 levels", `${code.filesNestedOverLimit} (deepest ${code.deepestNesting})`),
    row("Duplicated blocks", code.duplicateBlocks),
    row("Runtime", `${code.runtimeFiles} files, ${code.runtimeLines} lines`), "",
    "| Tests | Value |", "|---|---|",
    row("Suites (mutation)", `${tests.suites} (${tests.mutationSuites})`),
    row("Test files / cases", `${tests.testFiles} / ${tests.testCases}`), "",
    "| Rule enforcement (pyramid) | Rules |", "|---|---|",
    ...LAYERS.map((layer) => row(layer, rules.byLayer[layer])),
    row("Enforced share of checkable rules", `${rules.enforcedShare}%`),
    row("Prose only", rules.proseOnly.join(", ") || "none"),
    ...(rules.registryIssues.length ? ["", "Registry issues:", ...rules.registryIssues.map((issue) => `- ${issue}`)] : []),
    "", "| Pyramid readiness | Measured criteria met |", "|---|---|",
    ...card.readiness.layers.map((layer, index) => row(`${index + 1} ${layer.layer}`,
      layer.percent === null ? "unmeasured" : `${layer.percent}% (${layer.met}/${layer.measured}; ${layer.total - layer.measured} unmeasured)`)),
    ...card.readiness.criteria.filter((row) => !["met", "not-applicable"].includes(row.status))
      .map((item) => `- [${item.layer}] ${item.label}: ${item.status}, ${item.detail}`)
  ].join("\n");
}

export function checkIssues(card) {
  const issues = [...card.pyramid.registryIssues];
  const { proseOnly, proseOnlyCeiling } = card.pyramid;
  if (Number.isInteger(proseOnlyCeiling) && proseOnly.length > proseOnlyCeiling)
    issues.push(`prose-only rules grew to ${proseOnly.length} (ceiling ${proseOnlyCeiling}): enforce the new rule with a check, ` +
      "record a judgment call, or raise proseOnlyCeiling in a reviewed edit");
  if (Number.isInteger(proseOnlyCeiling) && proseOnly.length < proseOnlyCeiling)
    issues.push(`prose-only rules fell to ${proseOnly.length}: lower proseOnlyCeiling in ${RULES} to keep the gain`);
  const { unregistered, unregisteredCeiling } = card.pyramid;
  if (Number.isInteger(unregisteredCeiling) && unregistered.length > unregisteredCeiling)
    issues.push(`${unregistered.length - unregisteredCeiling} new rule sentence(s) in the agent guides have no ${RULES} row: ` +
      unregistered.slice(0, 3).map((row) => `${row.source}: "${row.sentence.slice(0, 80)}"`).join("; "));
  return issues;
}

export function main(argv = process.argv.slice(2), out = console) {
  const card = scorecard(REPO_ROOT);
  if (argv.includes("--check")) {
    const issues = checkIssues(card);
    for (const issue of issues) out.error(`scorecard: ${issue}`);
    if (issues.length) return 1;
    out.log(`scorecard: ${card.pyramid.rules} rules registered; ${card.pyramid.enforcedShare}% of checkable rules enforced`);
    return 0;
  }
  out.log(argv.includes("--markdown") ? markdown(card) : JSON.stringify(card, null, 2));
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = main();
