// Findings ratchet for consumer projects: lint, type-check, file-size,
// module-boundary, stopgap-comment, duplication, and nesting findings are recorded
// per file and rule. Existing findings
// become a baseline that may only shrink; a new finding, a grown file, or a
// new boundary violation fails. The same rule Change Loop applies to its own
// harness, offered to the projects that install it.
import { readFileSync, statSync } from "node:fs";
import { join, posix, relative } from "node:path";
import { configDigest } from "./quality-protocol.mjs";
import { pathMatches } from "./quality-evaluator.mjs";
import { SOURCE_EXTENSIONS, lineCount, slash, sourceFiles } from "./source-scan.mjs";
import { duplicationFindings, nestingDepthFindings, workaroundCommentFindings } from "./code-health-findings.mjs";

export const FINDINGS_PROTOCOL = "foundation-findings-v1";
export const FINDINGS_CAPABILITIES = new Set(["lint", "type-check", "file-size", "module-boundaries",
  "workaround-comments", "duplication", "nesting-depth"]);
export const FINDINGS_ADAPTER_VERSION = "1";
export const DEFAULT_FILE_SIZE_CEILING = 1000;

function tool(provider, adapter) {
  // Settings added after a lane's first release join the digest only when
  // set, so an existing baseline keeps comparing.
  const later = Object.fromEntries(["extensions", "window", "maxDepth"]
    .filter((key) => provider[key] !== undefined).map((key) => [key, provider[key]]));
  return {
    name: provider.tool?.name || adapter,
    version: String(provider.tool?.version || "unknown"),
    adapterVersion: FINDINGS_ADAPTER_VERSION,
    configDigest: configDigest({ adapter, inputs: provider.inputs || null, include: provider.include || null,
      exclude: provider.exclude || null, ceiling: provider.ceiling || null, modules: provider.modules || null,
      allow: provider.allow || null, tool: provider.tool || null, ...later })
  };
}

export function normalizeFindingsReport(report) {
  if (!report || typeof report !== "object" || !Array.isArray(report.findings))
    throw new Error(`${FINDINGS_PROTOCOL} requires a findings array`);
  const findings = report.findings.map((finding, index) => {
    const path = slash(finding?.path);
    const rule = String(finding?.rule || "").trim();
    if (!path || !rule) throw new Error(`finding ${index} requires path and rule`);
    const row = { path, rule };
    if (Number.isFinite(Number(finding.line)) && Number(finding.line) > 0) row.line = Number(finding.line);
    if (finding.message) row.message = String(finding.message).slice(0, 300);
    if (finding.value !== undefined) {
      if (!Number.isFinite(Number(finding.value))) throw new Error(`finding ${index} value must be numeric`);
      row.value = Number(finding.value);
    }
    return row;
  }).sort((left, right) => left.path.localeCompare(right.path) || left.rule.localeCompare(right.rule) ||
    (left.line || 0) - (right.line || 0));
  return {
    protocol: FINDINGS_PROTOCOL,
    repository: report.repository || null,
    repositoryCommit: report.repositoryCommit || null,
    workspaceDigest: report.workspaceDigest || null,
    language: report.language || "any",
    tool: report.tool || { name: "unknown", version: "unknown", adapterVersion: FINDINGS_ADAPTER_VERSION, configDigest: null },
    findings
  };
}

// ESLint `-f json`: [{ filePath, messages: [{ ruleId, line, message, severity }] }].
export function parseEslintJson(source, repositoryPath) {
  const files = JSON.parse(source);
  if (!Array.isArray(files)) throw new Error("ESLint JSON report must be an array");
  return files.flatMap((file) => (file.messages || []).map((message) => ({
    path: slash(relative(repositoryPath, file.filePath)),
    rule: message.ruleId ? `eslint/${message.ruleId}` : (message.fatal ? "eslint/parse-error" : "eslint/unknown"),
    line: message.line,
    message: message.message
  })));
}

// `tsc --noEmit --pretty false`: path(line,col): error TSxxxx: message
export function parseTscText(source) {
  const findings = [];
  for (const line of String(source).split(/\r?\n/)) {
    const match = line.match(/^(.+?)\((\d+),\d+\): error (TS\d+): (.*)$/);
    if (match) findings.push({ path: slash(match[1]), rule: `types/${match[3]}`, line: Number(match[2]), message: match[4] });
  }
  return findings;
}

// Files longer than the ceiling become `file-size` findings carrying their
// line count, so a tracked large file may shrink but never grow.
export function fileSizeFindings(root, provider, policyCeiling = DEFAULT_FILE_SIZE_CEILING) {
  const ceiling = Number(provider.ceiling || policyCeiling);
  if (!Number.isInteger(ceiling) || ceiling < 1) throw new Error("file-size ceiling must be a positive integer");
  return sourceFiles(root, provider).flatMap((path) => {
    const lines = lineCount(readFileSync(join(root, path), "utf8"));
    return lines > ceiling ? [{ path, rule: "file-size", value: lines,
      message: `${lines} lines exceeds the ${ceiling}-line ceiling; split it into focused modules` }] : [];
  });
}

const IMPORT_PATTERNS = [
  /(?:^|[^\w$.])(?:import|export)\s+(?:[^'"`;]*?\s+from\s+)?["']([^"']+)["']/g,
  /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g
];

function resolveImport(root, from, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = posix.normalize(posix.join(posix.dirname(from), specifier));
  if (base.startsWith("..")) return null;
  const candidates = [base, ...SOURCE_EXTENSIONS.map((ext) => `${base}${ext}`),
    ...SOURCE_EXTENSIONS.map((ext) => `${base}/index${ext}`)];
  for (const candidate of candidates) {
    try { if (statSync(join(root, candidate)).isFile()) return candidate; }
    catch (error) { if (error?.code !== "ENOENT" && error?.code !== "ENOTDIR") throw error; }
  }
  return base;
}

export function validateModuleBoundaries(provider) {
  const modules = provider.modules;
  if (!Array.isArray(modules) || !modules.length)
    throw new Error("module-boundaries requires modules: [{ name, paths: [glob] }]");
  const names = new Set();
  for (const module of modules) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(module?.name || "")) throw new Error("module name must be kebab-case");
    if (names.has(module.name)) throw new Error(`duplicate module '${module.name}'`);
    names.add(module.name);
    if (!Array.isArray(module.paths) || !module.paths.length || module.paths.some((path) => typeof path !== "string" || !path))
      throw new Error(`module '${module.name}' requires paths`);
  }
  const allow = provider.allow || {};
  for (const [from, targets] of Object.entries(allow)) {
    if (!names.has(from)) throw new Error(`allow names unknown module '${from}'`);
    if (!Array.isArray(targets) || targets.some((target) => !names.has(target)))
      throw new Error(`allow.${from} must list declared modules`);
  }
  return { modules, allow };
}

// A relative import from one declared module into another that its `allow`
// list does not name is a `boundary/<from>-><to>` finding on the importing
// line. Files outside every module and imports that leave the repository are
// not judged.
export function moduleBoundaryFindings(root, provider) {
  const { modules, allow } = validateModuleBoundaries(provider);
  const moduleOf = (path) => modules.find((module) => pathMatches(path, module.paths))?.name || null;
  const findings = [];
  for (const path of sourceFiles(root, provider)) {
    const from = moduleOf(path);
    if (!from) continue;
    const source = readFileSync(join(root, path), "utf8");
    const seen = new Set();
    for (const pattern of IMPORT_PATTERNS) for (const match of source.matchAll(pattern)) {
      const target = resolveImport(root, path, match[1]);
      const to = target ? moduleOf(target) : null;
      if (!to || to === from || (allow[from] || []).includes(to)) continue;
      const line = source.slice(0, match.index).split("\n").length;
      const key = `${line}\0${match[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({ path, rule: `boundary/${from}->${to}`, line,
        message: `${from} must not import ${to} (${match[1]}); move the shared code into a module both may import or add ${to} to allow.${from}` });
    }
  }
  return findings;
}

function report(adapter, provider, findings, identity) {
  const { repository, repositoryCommit = null, workspaceDigest = null } = identity;
  return normalizeFindingsReport({ repository: repository.id, repositoryCommit, workspaceDigest,
    tool: tool(provider, adapter), findings });
}

export const FINDINGS_ADAPTERS = Object.freeze({
  "eslint-json": { capability: "lint", inputs: ["report"],
    run: ({ repository, provider, inputs, ...identity }) =>
      report("eslint-json", provider, parseEslintJson(inputs.report, repository.path), { repository, ...identity }) },
  "tsc-text": { capability: "type-check", inputs: ["report"],
    run: ({ repository, provider, inputs, ...identity }) =>
      report("tsc-text", provider, parseTscText(inputs.report), { repository, ...identity }) },
  "generic-findings-json": { capability: null, inputs: ["report"],
    run: ({ repository, provider, inputs, ...identity }) =>
      report("generic-findings-json", provider, JSON.parse(inputs.report).findings || [], { repository, ...identity }) },
  "file-size": { capability: "file-size", inputs: [],
    run: ({ repository, provider, policy, ...identity }) =>
      report("file-size", provider, fileSizeFindings(repository.path, provider,
        policy?.findings?.fileSizeCeiling), { repository, ...identity }) },
  "module-boundaries": { capability: "module-boundaries", inputs: [],
    run: ({ repository, provider, ...identity }) =>
      report("module-boundaries", provider, moduleBoundaryFindings(repository.path, provider), { repository, ...identity }) },
  "workaround-comments": { capability: "workaround-comments", inputs: [],
    run: ({ repository, provider, ...identity }) =>
      report("workaround-comments", provider, workaroundCommentFindings(repository.path, provider), { repository, ...identity }) },
  "duplication": { capability: "duplication", inputs: [],
    run: ({ repository, provider, ...identity }) =>
      report("duplication", provider, duplicationFindings(repository.path, provider), { repository, ...identity }) },
  "nesting-depth": { capability: "nesting-depth", inputs: [],
    run: ({ repository, provider, ...identity }) =>
      report("nesting-depth", provider, nestingDepthFindings(repository.path, provider), { repository, ...identity }) }
});

function counts(findings) {
  const result = new Map();
  for (const finding of findings) {
    const key = `${finding.path}\0${finding.rule}`;
    const row = result.get(key) || { path: finding.path, rule: finding.rule, count: 0, value: null, lines: [] };
    row.count += 1;
    if (finding.value !== undefined) row.value = Math.max(row.value ?? 0, finding.value);
    if (finding.line) row.lines.push(finding.line);
    result.set(key, row);
  }
  return result;
}

function compatible(current, baseline) {
  return baseline?.repository === current.repository &&
    baseline?.tool?.name === current.tool?.name &&
    baseline?.tool?.adapterVersion === current.tool?.adapterVersion &&
    baseline?.tool?.configDigest === current.tool?.configDigest;
}

// Growth fails; shrinkage is reported so `quality baseline --write` can lower
// the baseline. Without a compatible baseline the lane passes with reduced
// assurance and says how to start the ratchet: adopting a ratchet must not
// fail every existing finding at once.
export function evaluateFindingsRatchet({ current, baseline = null }) {
  const currentCounts = counts(current.findings);
  if (!baseline || !compatible(current, baseline)) return {
    status: "pass",
    assurance: "reduced",
    baselineAvailable: Boolean(baseline),
    baselineCompatible: false,
    reason: baseline
      ? "findings baseline tool or configuration changed; rerun and update it with 'cloop quality baseline --write'"
      : "no findings baseline yet; record one with 'cloop quality baseline --write' to start the ratchet",
    regressions: [], improvements: [],
    summary: { findings: current.findings.length, regressions: 0, improvements: 0 }
  };
  const baseCounts = counts(baseline.findings || []);
  const regressions = [];
  const improvements = [];
  for (const [key, row] of currentCounts) {
    const base = baseCounts.get(key);
    if (row.value !== null) {
      if (!base || row.value > (base.value ?? 0))
        regressions.push({ path: row.path, rule: row.rule, baseline: base?.value ?? null, current: row.value,
          message: base ? `grew from ${base.value} to ${row.value}` : `new: ${row.value}` });
      else if (row.value < base.value) improvements.push({ path: row.path, rule: row.rule, baseline: base.value, current: row.value });
    } else if (!base || row.count > base.count) {
      regressions.push({ path: row.path, rule: row.rule, baseline: base?.count || 0, current: row.count, lines: row.lines });
    } else if (row.count < base.count) {
      improvements.push({ path: row.path, rule: row.rule, baseline: base.count, current: row.count });
    }
  }
  for (const [key, base] of baseCounts)
    if (!currentCounts.has(key)) improvements.push({ path: base.path, rule: base.rule,
      baseline: base.value ?? base.count, current: base.value === null ? 0 : null });
  return {
    status: regressions.length ? "fail" : "pass",
    assurance: "full",
    baselineAvailable: true,
    baselineCompatible: true,
    reason: regressions.length ? "new findings over the baseline; fix them rather than raising the baseline" : null,
    regressions, improvements,
    summary: { findings: current.findings.length, regressions: regressions.length, improvements: improvements.length }
  };
}
