#!/usr/bin/env node
// Feature map: Change Loop features as users meet them, tied to the commands
// and states users see and the code, tests, and docs that own each feature.
//
//   node scripts/docs/feature-map.mjs          check docs/feature-map.json and docs/feature-map.md
//   node scripts/docs/feature-map.mjs --write  regenerate docs/feature-map.md and openspec/feature-map.json
//
// Repository-only: not shipped to consumers.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
export const MAP_PATH = "docs/feature-map.json";
export const DOC_PATH = "docs/feature-map.md";
const PHASES = ["setup", "investigate", "change", "build", "prove", "land", "deliver", "cross-phase"];
// Shared foundations every feature uses; they belong to no single feature.
const SHARED_DOMAINS = new Set(["core", "contracts", "composition"]);

function list(value) {
  return Array.isArray(value) ? value : [];
}

// The surfaces a feature map must cover, read from their canonical sources.
export function surfaces(root = REPO_ROOT) {
  const registry = JSON.parse(readFileSync(join(root, ".claude/harness/commands.json"), "utf8"));
  const commands = registry.commands.map((command) => command.name);
  const commandDir = join(root, ".claude/commands");
  const slashCommands = readdirSync(commandDir).filter((name) => name.endsWith(".md"))
    .map((name) => `/${name.slice(0, -3)}`);
  const outcome = readFileSync(join(root, ".claude/harness/runtime/core/lifecycle-outcome.mjs"), "utf8");
  const body = outcome.match(/export function lifecycleUserState[\s\S]*?\n}/)?.[0] || "";
  const states = [...new Set([...body.matchAll(/"([A-Z][A-Z_]+)"/g)].map((match) => match[1]))]
    .filter((state) => !["WAIT", "DONE", "ASK_USER"].includes(state));
  const runtime = join(root, ".claude/harness/runtime");
  const groups = [];
  for (const entry of readdirSync(runtime, { withFileTypes: true })) {
    if (!entry.isDirectory() || SHARED_DOMAINS.has(entry.name)) continue;
    if (entry.name === "workflow") {
      for (const group of readdirSync(join(runtime, "workflow"), { withFileTypes: true }))
        if (group.isDirectory()) groups.push(`workflow/${group.name}`);
    } else groups.push(entry.name);
  }
  return { commands, slashCommands, states, groups: groups.sort() };
}

export function validateFeatureMap(map, root = REPO_ROOT) {
  const issues = [];
  if (map?.version !== 1 || !Array.isArray(map.features)) return ["feature map must be { version: 1, features: [...] }"];
  const expected = surfaces(root);
  const owners = { commands: new Map(), slashCommands: new Map(), states: new Map(), groups: new Map() };
  const ids = new Set();
  for (const feature of map.features) {
    const label = feature?.id || "(missing id)";
    if (!/^[a-z][a-z0-9-]*$/.test(feature?.id || "")) issues.push(`${label}: id must be kebab-case`);
    if (ids.has(feature.id)) issues.push(`${label}: duplicate id`);
    ids.add(feature.id);
    for (const language of ["en", "th"]) {
      if (!String(feature.name?.[language] || "").trim()) issues.push(`${label}: name.${language} is required`);
      if (!String(feature.summary?.[language] || "").trim()) issues.push(`${label}: summary.${language} is required`);
    }
    if (!PHASES.includes(feature.phase)) issues.push(`${label}: phase must be one of ${PHASES.join(", ")}`);
    for (const [field, kind] of [["cliCommands", "commands"], ["slashCommands", "slashCommands"]]) {
      for (const name of list(feature[field])) {
        if (owners[kind].has(name)) issues.push(`${label}: ${name} is already mapped to ${owners[kind].get(name)}`);
        owners[kind].set(name, feature.id);
      }
    }
    for (const state of list(feature.states)) owners.states.set(state, feature.id);
    for (const group of list(feature.groups)) owners.groups.set(group, feature.id);
    for (const field of ["code", "tests", "docs"]) {
      if (!list(feature[field]).length) issues.push(`${label}: ${field} must name at least one path`);
      for (const path of list(feature[field]))
        if (!existsSync(join(root, path))) issues.push(`${label}: ${field} path does not exist: ${path}`);
    }
    for (const name of list(feature.cliCommands))
      if (!expected.commands.includes(name)) issues.push(`${label}: unknown CLI command '${name}'`);
    for (const name of list(feature.slashCommands))
      if (!expected.slashCommands.includes(name)) issues.push(`${label}: unknown slash command '${name}'`);
    for (const state of list(feature.states))
      if (!expected.states.includes(state)) issues.push(`${label}: unknown user state '${state}'`);
    for (const group of list(feature.groups))
      if (!expected.groups.includes(group)) issues.push(`${label}: unknown runtime group '${group}'`);
  }
  const missing = (kind, values, what) => {
    for (const value of values)
      if (!owners[kind].has(value)) issues.push(`${what} '${value}' belongs to no feature; add it to ${MAP_PATH}`);
  };
  missing("commands", expected.commands, "CLI command");
  missing("slashCommands", expected.slashCommands, "slash command");
  missing("states", expected.states, "user state");
  missing("groups", expected.groups, "runtime group");
  return issues;
}

const code = (value) => `\`${value}\``;
const cell = (values) => values.length ? values.map(code).join(", ") : "—";

export function renderFeatureMap(map) {
  const lines = [
    "# Feature map",
    "",
    "<!-- Generated from docs/feature-map.json by `node scripts/docs/feature-map.mjs --write`. Edit the JSON, not this file. -->",
    "",
    "**Audience:** maintainers and coding agents changing Change Loop. Use these",
    "feature names when you describe or request work, so people and agents mean the",
    "same thing. Each feature lists what the user sees and the code, tests, and",
    "docs that own it. User-facing terms are defined in the",
    "[glossary](../website/docs/src/content/docs/glossary.md); the rules for",
    "keeping this map current are in [How the map is kept current](#how-the-map-is-kept-current).",
    "",
    "| Feature | ชื่อไทย | Phase | User sees |",
    "|---|---|---|---|"
  ];
  for (const feature of map.features) {
    const shown = [...list(feature.slashCommands), ...list(feature.states)];
    const surface = shown.length ? shown : list(feature.cliCommands).slice(0, 3);
    lines.push(`| [${feature.name.en}](#${feature.id}) | ${feature.name.th} | ${feature.phase} | ${cell(surface)} |`);
  }
  for (const feature of map.features) {
    lines.push("", `<a id="${feature.id}"></a>`, "", `## ${feature.name.en} — ${feature.name.th}`, "",
      `**Phase:** ${feature.phase}`, "", feature.summary.en, "", feature.summary.th, "",
      "| | |", "|---|---|",
      `| Slash commands | ${cell(list(feature.slashCommands))} |`,
      `| CLI commands | ${cell(list(feature.cliCommands))} |`,
      `| User states | ${cell(list(feature.states))} |`,
      `| Runtime groups | ${cell(list(feature.groups))} |`,
      `| Code | ${cell(list(feature.code))} |`,
      `| Tests | ${cell(list(feature.tests))} |`,
      `| Docs | ${cell(list(feature.docs))} |`);
  }
  lines.push("", "## How the map is kept current", "",
    "`node scripts/docs/feature-map.mjs` (run by the documentation suite in the",
    "default gate) fails when:", "",
    "- a CLI command in `.claude/harness/commands.json`, a slash command in",
    "  `.claude/commands/`, a user state from `lifecycleUserState`, or a runtime",
    "  group belongs to no feature, or a command belongs to two;",
    "- a feature names a command, state, group, or path that does not exist;",
    "- this page differs from what `--write` renders from the JSON.", "",
    "Adding a user-facing command, state, or runtime group therefore means choosing",
    "its feature in `docs/feature-map.json` and running `--write`.", "");
  return lines.join("\n");
}

// The same features in the project feature-map shape every installed project
// uses (openspec/feature-map.json), so Change Loop onboards itself through the
// consumer path: `cloop features`, readiness, and change intake read it.
export const PROJECT_MAP_PATH = "openspec/feature-map.json";

export function projectFeatureMap(map) {
  return { version: 1, features: map.features.map((feature) => ({
    id: feature.id, name: feature.name.en, summary: feature.summary.en,
    paths: feature.code, tests: feature.tests, docs: feature.docs
  })) };
}

export function main(argv = process.argv.slice(2), root = REPO_ROOT, out = console) {
  const map = JSON.parse(readFileSync(join(root, MAP_PATH), "utf8"));
  const issues = validateFeatureMap(map, root);
  const rendered = renderFeatureMap(map);
  const project = `${JSON.stringify(projectFeatureMap(map), null, 2)}\n`;
  if (argv.includes("--write") && !issues.length) {
    writeFileSync(join(root, DOC_PATH), rendered);
    writeFileSync(join(root, PROJECT_MAP_PATH), project);
  } else {
    if (!existsSync(join(root, DOC_PATH)) || readFileSync(join(root, DOC_PATH), "utf8") !== rendered)
      issues.push(`${DOC_PATH} is stale; run node scripts/docs/feature-map.mjs --write`);
    if (!existsSync(join(root, PROJECT_MAP_PATH)) || readFileSync(join(root, PROJECT_MAP_PATH), "utf8") !== project)
      issues.push(`${PROJECT_MAP_PATH} is stale; run node scripts/docs/feature-map.mjs --write`);
  }
  for (const issue of issues) out.error(`feature map: ${issue}`);
  if (issues.length) return 1;
  out.log(`feature map: ${map.features.length} features cover every command, state, and runtime group`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = main();
