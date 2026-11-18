// The rule-enforcement registry, quality/rule-enforcement.json: each rule in a
// project's agent guides (CLAUDE.md, AGENTS.md) with the layer that enforces
// it. A check names the files that fail when the rule is broken, a judgment
// says why no check can catch it, and prose is the last layer of the pyramid.
// Change Loop's own repository and installed projects use the same file shape.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const RULE_REGISTRY_PATH = "quality/rule-enforcement.json";
export const RULE_CHECK_LAYERS = Object.freeze(["architecture", "type", "lint", "test", "mutation"]);
export const RULE_LAYERS = Object.freeze([...RULE_CHECK_LAYERS, "judgment", "prose"]);

const normalize = (text) => String(text).replace(/\s+/g, " ").trim();

export function readRuleRegistry(root) {
  const path = join(root, RULE_REGISTRY_PATH);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
}

// Repairs for the registry: each quote is still in its guide, each layer is
// known, a check names files that exist, a judgment says why.
export function registryIssues(root, registry) {
  const issues = [];
  const sources = new Map();
  const ids = new Set();
  for (const [index, rule] of (registry?.rules || []).entries()) {
    const at = `rules[${index}] ${rule.id || ""}`.trim();
    if (!rule.id || ids.has(rule.id)) issues.push(`${at}: id is missing or repeated`);
    ids.add(rule.id);
    if (!RULE_LAYERS.includes(rule.layer)) issues.push(`${at}: layer must be one of ${RULE_LAYERS.join(", ")}`);
    if (!sources.has(rule.source))
      sources.set(rule.source, existsSync(join(root, rule.source || "")) ? normalize(readFileSync(join(root, rule.source), "utf8")) : null);
    const text = sources.get(rule.source);
    if (text === null) issues.push(`${at}: source ${rule.source} does not exist`);
    else if (!normalize(rule.quote) || !text.includes(normalize(rule.quote)))
      issues.push(`${at}: quote is no longer in ${rule.source}; update the quote or remove the rule`);
    if (RULE_CHECK_LAYERS.includes(rule.layer)) {
      const paths = Array.isArray(rule.enforcedBy) ? rule.enforcedBy : [];
      if (!paths.length) issues.push(`${at}: a ${rule.layer} rule names the files that enforce it (enforcedBy)`);
      for (const path of paths) if (!existsSync(join(root, path))) issues.push(`${at}: enforcedBy ${path} does not exist`);
    }
    if (rule.layer === "judgment" && !normalize(rule.judgment || "")) issues.push(`${at}: a judgment says why no check can catch it`);
  }
  return issues;
}

// Counts by layer, the enforced share of rules a check could hold, and the
// prose-only rules; null when the project has no registry.
export function ruleRegistrySummary(root, registry = readRuleRegistry(root)) {
  if (!registry) return null;
  const rules = Array.isArray(registry.rules) ? registry.rules : [];
  const byLayer = Object.fromEntries(RULE_LAYERS.map((layer) => [layer, 0]));
  for (const rule of rules) byLayer[rule.layer] = (byLayer[rule.layer] || 0) + 1;
  const checked = RULE_CHECK_LAYERS.reduce((total, layer) => total + byLayer[layer], 0);
  const decidable = checked + byLayer.prose;
  return {
    rules: rules.length,
    byLayer,
    enforcedShare: decidable ? Math.round(checked / decidable * 100) : null,
    proseOnly: rules.filter((rule) => rule.layer === "prose").map((rule) => rule.id),
    proseOnlyCeiling: registry.proseOnlyCeiling ?? null,
    registryIssues: registryIssues(root, registry)
  };
}
