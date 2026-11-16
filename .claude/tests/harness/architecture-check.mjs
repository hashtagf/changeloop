#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DOMAINS = new Set([
  "composition", "contracts", "core", "evidence", "observability", "quality", "workflow"
]);

// Dependencies point upward through this table. Stateful cross-domain behavior
// is still injected by the composition root; the direct edges below are for
// stable contracts and pure helpers only.
const ALLOWED = {
  composition: new Set([...DOMAINS]),
  contracts: new Set(["contracts"]),
  core: new Set(["contracts", "core"]),
  evidence: new Set(["contracts", "core", "evidence"]),
  observability: new Set(["contracts", "core", "observability"]),
  quality: new Set(["contracts", "core", "quality"]),
  workflow: new Set(["contracts", "core", "evidence", "workflow"])
};

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function runtimeDomain(runtimeRoot, path) {
  const rel = relative(runtimeRoot, path);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) return null;
  const first = rel.split(sep)[0];
  return DOMAINS.has(first) ? first : null;
}

function importedModules(source) {
  const modules = [];
  const collect = (pattern) => {
    for (const match of source.matchAll(pattern))
      modules.push({ specifier: match[1], index: match.index });
  };
  collect(/(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g);
  collect(/\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g);
  collect(/\bcreateRequire\s*\([^)]*\)\s*\(\s*["']([^"']+)["']\s*\)/g);

  // createRequire is commonly assigned to a project-specific identifier, so a
  // literal call through that alias must be treated like require("...").
  const loaders = [...source.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:[A-Za-z_$][\w$]*\.)?createRequire\s*\(/g
  )].map((match) => match[1]);
  for (const loader of loaders) {
    const escaped = loader.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    collect(new RegExp(`\\b${escaped}\\s*\\(\\s*["']([^"']+)["']\\s*\\)`, "g"));
  }
  return [...new Map(modules.map((module) =>
    [`${module.index}:${module.specifier}`, module])).values()];
}

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

// A runtime folder outside DOMAINS would be skipped by every import check, so
// an undeclared folder is itself a finding.
export function undeclaredDomains(runtimeRoot) {
  if (!existsSync(runtimeRoot)) return [];
  return readdirSync(runtimeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !DOMAINS.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

export function dependencyFindings(runtimeRoot) {
  const findings = [];
  for (const path of walk(runtimeRoot).filter((candidate) => candidate.endsWith(".mjs"))) {
    const sourceDomain = runtimeDomain(runtimeRoot, path);
    if (!sourceDomain) continue;
    const source = readFileSync(path, "utf8");
    for (const imported of importedModules(source)) {
      if (!imported.specifier.startsWith(".")) continue;
      const target = resolve(dirname(path), imported.specifier);
      if (target === resolve(runtimeRoot, "..", "foundation.mjs")) {
        findings.push({
          path: relative(runtimeRoot, path).replaceAll("\\", "/"),
          line: lineAt(source, imported.index),
          sourceDomain,
          targetDomain: "composition root",
          specifier: imported.specifier
        });
        continue;
      }
      const targetDomain = runtimeDomain(runtimeRoot, target);
      if (!targetDomain || ALLOWED[sourceDomain].has(targetDomain)) continue;
      findings.push({
        path: relative(runtimeRoot, path).replaceAll("\\", "/"),
        line: lineAt(source, imported.index),
        sourceDomain,
        targetDomain,
        specifier: imported.specifier
      });
    }
  }
  return findings;
}

// workflow/ is split into feature groups. A group may import only the groups
// after it in this list (and itself), so the folder tree reads as a layered
// map: land and sandbox orchestrate; transaction and validation are leaves.
export const WORKFLOW_LAYERS = [
  "land", "sandbox", "delivery", "advance", "change", "authority", "draft",
  "packet", "investigation", "prototype", "repository", "transaction", "validation"
];

export function workflowLayerFindings(runtimeRoot) {
  const workflow = join(runtimeRoot, "workflow");
  const findings = [];
  const groupOf = (path) => {
    const rel = relative(workflow, path);
    if (!rel || rel.startsWith("..") || isAbsolute(rel)) return null;
    const parts = rel.split(sep);
    return parts.length > 1 ? parts[0] : "";
  };
  for (const path of walk(workflow).filter((candidate) => candidate.endsWith(".mjs"))) {
    const group = groupOf(path);
    const rel = relative(runtimeRoot, path).replaceAll("\\", "/");
    if (group === "") {
      findings.push({ path: rel, line: 1, message:
        "workflow modules live in a feature group folder; move it into the group that owns it" });
      continue;
    }
    if (!WORKFLOW_LAYERS.includes(group)) {
      findings.push({ path: rel, line: 1, message:
        `undeclared workflow group '${group}'; add it to WORKFLOW_LAYERS in architecture-check.mjs` });
      continue;
    }
    const source = readFileSync(path, "utf8");
    for (const imported of importedModules(source)) {
      if (!imported.specifier.startsWith(".")) continue;
      const target = groupOf(resolve(dirname(path), imported.specifier));
      if (!target || target === group || !WORKFLOW_LAYERS.includes(target)) continue;
      if (WORKFLOW_LAYERS.indexOf(target) > WORKFLOW_LAYERS.indexOf(group)) continue;
      findings.push({ path: rel, line: lineAt(source, imported.index), message:
        `workflow/${group} must not import workflow/${target} (${imported.specifier}); ` +
        "move the shared piece into a lower group or inject it from the composition root" });
    }
  }
  return findings;
}

function main() {
  const root = resolve(process.argv[2] || process.cwd());
  const runtimeRoot = join(root, ".claude", "harness", "runtime");
  const findings = dependencyFindings(runtimeRoot);
  const undeclared = undeclaredDomains(runtimeRoot);
  for (const name of undeclared)
    console.log(`${name}/: undeclared runtime domain; add it to DOMAINS and ALLOWED in architecture-check.mjs`);
  if (undeclared.length) process.exitCode = 1;
  const layers = workflowLayerFindings(runtimeRoot);
  for (const finding of layers) console.log(`${finding.path}:${finding.line}: ${finding.message}`);
  if (layers.length) process.exitCode = 1;
  if (!findings.length) {
    if (undeclared.length || layers.length) return;
    console.log("OK");
    return;
  }
  for (const finding of findings)
    console.log(`${finding.path}:${finding.line}: ${finding.sourceDomain} must not import ${finding.targetDomain} (${finding.specifier})`);
  process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
  main();
