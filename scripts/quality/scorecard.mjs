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

const HERE = fileURLToPath(new URL(".", import.meta.url));
export const REPO_ROOT = resolve(HERE, "../..");
export const RULES = "quality/rule-enforcement.json";
const LINT_BASELINE = "quality/baselines/lint-ratchet-v1.json";
const SKILL_BASELINE = "quality/baselines/skill-contracts-v1.json";
const CHECK_LAYERS = ["architecture", "type", "lint", "test", "mutation"];
const LAYERS = [...CHECK_LAYERS, "judgment", "prose"];
const TEST_ROOTS = [".claude", "scripts", "dashboard"];

const readJson = (root, path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const normalize = (text) => String(text).replace(/\s+/g, " ").trim();
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
  const totals = { lint: 0, types: 0, nestingFiles: 0, nestingMax: 0, duplicateBlocks: 0 };
  for (const rules of Object.values(baseline.violations))
    for (const [rule, count] of Object.entries(rules)) {
      if (rule.startsWith("types/")) totals.types += count;
      else if (rule === "complexity/nesting") {
        totals.nestingFiles += 1;
        totals.nestingMax = Math.max(totals.nestingMax, count);
      } else if (rule === "duplication/block") totals.duplicateBlocks += count;
      else totals.lint += count;
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

// Repairs for the registry: each quote is still in its guide, each layer is
// known, a check names files that exist, a judgment says why.
export function registryIssues(root, registry) {
  const issues = [];
  const sources = new Map();
  const ids = new Set();
  for (const [index, rule] of (registry.rules || []).entries()) {
    const at = `rules[${index}] ${rule.id || ""}`.trim();
    if (!rule.id || ids.has(rule.id)) issues.push(`${at}: id is missing or repeated`);
    ids.add(rule.id);
    if (!LAYERS.includes(rule.layer)) issues.push(`${at}: layer must be one of ${LAYERS.join(", ")}`);
    if (!sources.has(rule.source))
      sources.set(rule.source, existsSync(join(root, rule.source || "")) ? normalize(readFileSync(join(root, rule.source), "utf8")) : null);
    const text = sources.get(rule.source);
    if (text === null) issues.push(`${at}: source ${rule.source} does not exist`);
    else if (!normalize(rule.quote) || !text.includes(normalize(rule.quote)))
      issues.push(`${at}: quote is no longer in ${rule.source}; update the quote or remove the rule`);
    if (CHECK_LAYERS.includes(rule.layer)) {
      const paths = Array.isArray(rule.enforcedBy) ? rule.enforcedBy : [];
      if (!paths.length) issues.push(`${at}: a ${rule.layer} rule names the files that enforce it (enforcedBy)`);
      for (const path of paths) if (!existsSync(join(root, path))) issues.push(`${at}: enforcedBy ${path} does not exist`);
    }
    if (rule.layer === "judgment" && !normalize(rule.judgment || "")) issues.push(`${at}: a judgment says why no check can catch it`);
  }
  return issues;
}

export function pyramid(root) {
  const registry = readJson(root, RULES);
  const byLayer = Object.fromEntries(LAYERS.map((layer) => [layer, 0]));
  for (const rule of registry.rules) byLayer[rule.layer] = (byLayer[rule.layer] || 0) + 1;
  const checked = sum(CHECK_LAYERS.map((layer) => byLayer[layer]));
  const decidable = checked + byLayer.prose;
  return {
    rules: registry.rules.length,
    byLayer,
    // Rules a check could hold, and the share that one does.
    enforcedShare: decidable ? Math.round(checked / decidable * 100) : null,
    proseOnly: registry.rules.filter((rule) => rule.layer === "prose").map((rule) => rule.id),
    proseOnlyCeiling: registry.proseOnlyCeiling ?? null,
    registryIssues: registryIssues(root, registry)
  };
}

export function scorecard(root = REPO_ROOT) {
  return { version: 1, code: codeHealth(root), tests: testInventory(root), pyramid: pyramid(root) };
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
    ...(rules.registryIssues.length ? ["", "Registry issues:", ...rules.registryIssues.map((issue) => `- ${issue}`)] : [])
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
