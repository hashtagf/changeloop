#!/usr/bin/env node
// Change Loop's own findings in the consumer protocol, so this repository
// onboards through the same `quality/foundation-quality.json` path its users
// take instead of being scored by a side channel. Each capability reuses the
// repository's existing guard rather than a second, diverging checker: the
// lint ratchet (ESLint, tsc --checkJs, sizes, nesting, copies, stopgap
// comments over the harness) and the architecture check (domain and workflow
// layering). Repository-only; never shipped.
//
//   node scripts/quality/repository-findings.mjs <capability>
//
// Prints `{ "findings": [...] }` for the generic-findings-json adapter.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_BASELINE, collect } from "../lint/ratchet.mjs";
import {
  dependencyFindings, reexportFindings, undeclaredDomains, workflowLayerFindings
} from "../../.claude/tests/harness/architecture-check.mjs";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const RUNTIME = ".claude/harness/runtime";

// Which lint-ratchet rules belong to which consumer capability.
const RULES = Object.freeze({
  lint: (rule) => !rule.startsWith("types/") && rule !== "complexity/nesting" && rule !== "duplication/block",
  "type-check": (rule) => rule.startsWith("types/"),
  "nesting-depth": (rule) => rule === "complexity/nesting",
  duplication: (rule) => rule === "duplication/block",
  "workaround-comments": (rule) => rule === "changeloop/no-workaround-comment"
});

function ratchetFindings(current, capability, ceiling) {
  if (capability === "file-size")
    return Object.entries(current.sizes).filter(([, lines]) => lines > ceiling)
      .map(([path, lines]) => ({ path, rule: "file-size", value: lines,
        message: `${lines} lines exceeds the ${ceiling}-line ceiling` }));
  const owns = RULES[capability];
  return Object.entries(current.details).flatMap(([path, rules]) => Object.entries(rules)
    .filter(([rule]) => owns(rule))
    .flatMap(([rule, rows]) => rows.map((row) => ({ path, rule, line: row.line, message: row.message }))));
}

function architectureFindings() {
  const runtime = join(ROOT, RUNTIME);
  const at = (path) => `${RUNTIME}/${path}`;
  return [
    ...dependencyFindings(runtime).map((row) => ({ path: at(row.path), line: row.line,
      rule: `boundary/${row.sourceDomain}->${String(row.targetDomain || "other").replace(/\s+/g, "-")}`,
      message: row.message || `${row.sourceDomain} must not import ${row.targetDomain}` })),
    ...workflowLayerFindings(runtime).map((row) => ({ path: at(row.path), line: row.line,
      rule: "boundary/workflow-layer", message: row.message })),
    ...reexportFindings(runtime).map((row) => ({ path: at(row.path), line: row.line,
      rule: "boundary/reexport", message: row.message })),
    ...undeclaredDomains(runtime).map((name) => ({ path: `${RUNTIME}/${name}`, rule: "boundary/undeclared-domain",
      message: `runtime folder '${name}' is not a declared domain` }))
  ];
}

export async function repositoryFindings(capability) {
  if (capability === "module-boundaries") return architectureFindings();
  if (capability !== "file-size" && !RULES[capability]) throw new Error(`unknown capability '${capability}'`);
  const ceiling = JSON.parse(readFileSync(join(ROOT, DEFAULT_BASELINE), "utf8")).sizeCeiling;
  return ratchetFindings(await collect(ROOT), capability, ceiling);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(`${JSON.stringify({ findings: await repositoryFindings(process.argv[2]) })}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
