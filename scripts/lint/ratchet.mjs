#!/usr/bin/env node
// Lint ratchet for harness code: existing findings are recorded per file and
// rule in a baseline that may only shrink. New findings, growth of tracked
// large files, or a new file over the size ceiling fail. When findings drop,
// the gate fails until `--tighten` lowers the baseline, so cleanup is kept.
//
//   node scripts/lint/ratchet.mjs              check against the baseline
//   node scripts/lint/ratchet.mjs --tighten    lower the baseline where possible
//   node scripts/lint/ratchet.mjs --init       create a missing baseline once
//
// Raising a baseline entry is never automatic: edit the JSON so the review
// shows the accepted exception.
import { ESLint } from "eslint";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import config from "./eslint.config.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
export const REPO_ROOT = resolve(HERE, "../..");
export const DEFAULT_BASELINE = "quality/baselines/lint-ratchet-v1.json";
export const COMPOSITION_ROOT = ".claude/harness/foundation.mjs";
export const SIZE_CEILING = 1500;

// Scope: harness runtime, composition root, host adapters, and hooks. Tests,
// vendored code, and TypeScript host shims are outside the ratchet.
const SCOPE = [
  { dir: ".claude/harness", recursive: false },
  { dir: ".claude/harness/runtime", recursive: true },
  { dir: ".claude/harness/adapters", recursive: false },
  { dir: ".claude/hooks", recursive: false }
];
const SKIP_DIRS = new Set(["node_modules", "tests", "test", "fixtures", "vendor"]);

const SIZE_GROWTH = "Tracked large file grew. Move the new logic into a focused module " +
  "instead of extending this file.";
const ROOT_GROWTH = "foundation.mjs is the composition root: it wires domains and holds no " +
  "behavior. Put the new logic in its domain under .claude/harness/runtime/ and inject it.";
const NEW_LARGE = `File exceeds ${SIZE_CEILING} lines. Split it into focused modules ` +
  "before adding it.";
const ROOT_UNTRACKED = "The composition root must stay tracked in the size baseline.";

function toPosix(path) {
  return path.split(sep).join("/");
}

function walk(root, dir, recursive) {
  const absolute = join(root, dir);
  if (!existsSync(absolute)) return [];
  const files = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (recursive && !SKIP_DIRS.has(entry.name)) files.push(...walk(root, path, true));
    } else if (entry.isFile() && entry.name.endsWith(".mjs")) {
      files.push(path);
    }
  }
  return files;
}

export function scopeFiles(root = REPO_ROOT) {
  return [...new Set(SCOPE.flatMap(({ dir, recursive }) => walk(root, dir, recursive)))].sort();
}

export function lineCount(text) {
  if (text.length === 0) return 0;
  const breaks = text.split("\n").length - 1;
  return text.endsWith("\n") ? breaks : breaks + 1;
}

export async function collect(root = REPO_ROOT, files = scopeFiles(root)) {
  const eslint = new ESLint({ cwd: root, overrideConfigFile: true, overrideConfig: config });
  const results = files.length ? await eslint.lintFiles(files.map((file) => join(root, file))) : [];
  const violations = {};
  const details = {};
  for (const result of results) {
    const path = toPosix(relative(root, result.filePath));
    for (const message of result.messages) {
      const rule = message.ruleId || (message.fatal ? "parse-error" : "unknown");
      violations[path] ??= {};
      violations[path][rule] = (violations[path][rule] || 0) + 1;
      details[path] ??= {};
      (details[path][rule] ??= []).push({ line: message.line, message: message.message });
    }
  }
  const sizes = {};
  for (const file of files) sizes[file] = lineCount(readFileSync(join(root, file), "utf8"));
  return { violations, details, sizes };
}

export function loadBaseline(path) {
  if (!existsSync(path)) throw new Error(`lint ratchet baseline is missing: ${path}`);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`lint ratchet baseline is not valid JSON: ${path} (${error.message})`);
  }
  const valid = parsed && parsed.version === 1 &&
    parsed.violations && typeof parsed.violations === "object" &&
    parsed.sizes && typeof parsed.sizes === "object";
  if (!valid) throw new Error(`lint ratchet baseline has the wrong shape: ${path}`);
  return parsed;
}

export function compare(baseline, current) {
  const regressions = [];
  const improvements = [];
  const paths = new Set([...Object.keys(baseline.violations), ...Object.keys(current.violations)]);
  for (const path of [...paths].sort()) {
    const before = baseline.violations[path] || {};
    const now = current.violations[path] || {};
    for (const rule of [...new Set([...Object.keys(before), ...Object.keys(now)])].sort()) {
      const allowed = before[rule] || 0;
      const found = now[rule] || 0;
      const entry = { kind: "lint", path, rule, baseline: allowed, current: found };
      if (found > allowed)
        regressions.push({ ...entry, findings: current.details?.[path]?.[rule] || [] });
      else if (found < allowed) improvements.push(entry);
    }
  }
  const ceiling = baseline.sizeCeiling ?? SIZE_CEILING;
  for (const [path, lines] of Object.entries(current.sizes)) {
    const tracked = baseline.sizes[path];
    if (tracked === undefined) {
      if (path === COMPOSITION_ROOT)
        regressions.push({ kind: "size", path, baseline: null, current: lines, message: ROOT_UNTRACKED });
      else if (lines > ceiling)
        regressions.push({ kind: "size", path, baseline: ceiling, current: lines, message: NEW_LARGE });
    } else if (lines > tracked) {
      regressions.push({ kind: "size", path, baseline: tracked, current: lines,
        message: path === COMPOSITION_ROOT ? ROOT_GROWTH : SIZE_GROWTH });
    } else if (lines < tracked) {
      improvements.push({ kind: "size", path, baseline: tracked, current: lines });
    }
  }
  for (const [path, tracked] of Object.entries(baseline.sizes))
    if (current.sizes[path] === undefined)
      improvements.push({ kind: "size", path, baseline: tracked, current: null });
  return { regressions, improvements };
}

// Lowers every entry to the current value; never raises one or adds a new one.
export function tighten(baseline, current) {
  const violations = {};
  for (const [path, rules] of Object.entries(baseline.violations)) {
    for (const [rule, allowed] of Object.entries(rules)) {
      const value = Math.min(allowed, current.violations[path]?.[rule] || 0);
      if (value > 0) (violations[path] ??= {})[rule] = value;
    }
  }
  const sizes = {};
  for (const [path, tracked] of Object.entries(baseline.sizes)) {
    if (current.sizes[path] === undefined) continue;
    sizes[path] = Math.min(tracked, current.sizes[path]);
  }
  return { ...baseline, violations: sortObject(violations), sizes: sortObject(sizes) };
}

export function initialBaseline(current, ceiling = SIZE_CEILING) {
  const sizes = {};
  for (const [path, lines] of Object.entries(current.sizes))
    if (lines > ceiling || path === COMPOSITION_ROOT) sizes[path] = lines;
  return {
    version: 1,
    sizeCeiling: ceiling,
    violations: sortObject(current.violations),
    sizes: sortObject(sizes)
  };
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}

function writeBaseline(path, baseline) {
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`);
}

export function formatRegression(entry) {
  if (entry.kind === "size") {
    const limit = entry.baseline === null ? "untracked" : `${entry.baseline} lines`;
    return `${entry.path}: ${entry.current} lines (allowed ${limit})\n    ${entry.message}`;
  }
  const head = `${entry.path}: ${entry.rule} ${entry.current} (baseline ${entry.baseline})`;
  const lines = entry.findings.map((finding) => `    line ${finding.line}: ${finding.message}`);
  return [head, ...lines].join("\n");
}

function parseArgs(argv) {
  const options = { tighten: false, init: false, root: REPO_ROOT, baseline: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--tighten") options.tighten = true;
    else if (arg === "--init") options.init = true;
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else if (arg === "--baseline") options.baseline = argv[++index];
    else throw new Error(`unknown argument: ${arg}`);
  }
  options.baseline = resolve(options.root, options.baseline || DEFAULT_BASELINE);
  return options;
}

export async function main(argv = process.argv.slice(2), out = console) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    out.error(error.message);
    return 2;
  }
  const current = await collect(options.root);
  if (options.init) {
    if (existsSync(options.baseline)) {
      out.error(`baseline already exists; --init only creates a missing one: ${options.baseline}`);
      return 2;
    }
    writeBaseline(options.baseline, initialBaseline(current));
    out.log(`lint ratchet: created ${options.baseline}`);
    return 0;
  }
  let baseline;
  try {
    baseline = loadBaseline(options.baseline);
  } catch (error) {
    out.error(error.message);
    return 2;
  }
  const { regressions, improvements } = compare(baseline, current);
  if (options.tighten && improvements.length) {
    writeBaseline(options.baseline, tighten(baseline, current));
    out.log(`lint ratchet: lowered ${improvements.length} baseline entr${improvements.length === 1 ? "y" : "ies"}`);
  }
  if (regressions.length) {
    out.error(`lint ratchet: ${regressions.length} regression(s) over the baseline`);
    for (const entry of regressions) out.error(`  ${formatRegression(entry)}`);
    out.error("Fix the root cause named above. Raising the baseline is a reviewed edit " +
      `to ${DEFAULT_BASELINE}, never a command.`);
    return 1;
  }
  if (improvements.length && !options.tighten) {
    out.error(`lint ratchet: ${improvements.length} entr${improvements.length === 1 ? "y is" : "ies are"} ` +
      "below the baseline. Run `node scripts/lint/ratchet.mjs --tighten` and commit the lowered baseline.");
    for (const entry of improvements)
      out.error(`  ${entry.path}${entry.rule ? ` ${entry.rule}` : " lines"}: ${entry.baseline} -> ${entry.current ?? "removed"}`);
    return 1;
  }
  out.log(`lint ratchet: ${Object.keys(current.sizes).length} files at or below the baseline`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = await main();
