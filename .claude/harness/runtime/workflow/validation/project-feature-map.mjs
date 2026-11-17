// A project's feature map: the features its users meet, each with the paths
// that implement it, so people and agents name the same thing. Project-owned
// at openspec/feature-map.json; Change Loop seeds it once and never rewrites it.
// Investigation and change intake read it as grounding, `features` checks it
// and names the features a change touches, and the approval page lists them.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { leasePathIsAllowed } from "../../core/graph-execution.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import { taskBlocks, taskMetadata } from "../../contracts/change-artifacts.mjs";

export const PROJECT_FEATURE_MAP_PATH = "openspec/feature-map.json";

const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === "string" ? value.trim() : "";

export function readProjectFeatureMap(root) {
  const path = join(root, PROJECT_FEATURE_MAP_PATH);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

// `exists(path)` reports whether a repository-relative path exists; omit it to
// skip path checks (for example in a sandbox that has not copied every file).
export function validateProjectFeatureMap(map, { exists = null } = {}) {
  const issues = [];
  if (!map || map.version !== 1 || !Array.isArray(map.features))
    return [`${PROJECT_FEATURE_MAP_PATH} must be { "version": 1, "features": [...] }`];
  const ids = new Set();
  for (const [index, feature] of map.features.entries()) {
    const label = text(feature?.id) || `features[${index}]`;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(text(feature?.id))) issues.push(`${label}: id must be kebab-case`);
    else if (ids.has(feature.id)) issues.push(`${label}: duplicate id`);
    ids.add(feature?.id);
    if (!text(feature?.name)) issues.push(`${label}: name is required`);
    if (!text(feature?.summary)) issues.push(`${label}: summary says what the user sees or does`);
    if (!list(feature?.paths).length || list(feature.paths).some((path) => !text(path)))
      issues.push(`${label}: paths must list the files or globs that implement it`);
    for (const field of ["tests", "docs"])
      if (feature?.[field] !== undefined && (!Array.isArray(feature[field]) || feature[field].some((path) => !text(path))))
        issues.push(`${label}: ${field} must be a list of paths`);
    if (exists) for (const field of ["tests", "docs"])
      for (const path of list(feature?.[field]))
        if (!/[*?]/.test(path) && !exists(path)) issues.push(`${label}: ${field} path does not exist: ${path}`);
    if (exists) for (const path of list(feature?.paths)) {
      const literal = String(path).replace(/\/\*\*?$/, "").replace(/\/$/, "");
      if (!/[*?]/.test(literal) && !exists(literal)) issues.push(`${label}: paths entry does not exist: ${path}`);
    }
  }
  return issues;
}

// The literal directory or file a `[paths:]` scope or glob starts from.
function prefixOf(scope) {
  const parts = String(scope).replace(/^\.\//, "").split("/");
  const fixed = [];
  for (const part of parts) { if (/[*?]/.test(part)) break; fixed.push(part); }
  return fixed.join("/");
}

// Features whose paths overlap any of the given changed paths or task scopes.
// A scope overlaps a feature when either one's literal prefix contains the other.
export function featuresForPaths(map, paths) {
  if (!map || !Array.isArray(map.features)) return [];
  const scopes = [...new Set(list(paths).map((path) => String(path).replace(/^\.\//, "")).filter(Boolean))];
  const overlaps = (featurePath, scope) => {
    if (leasePathIsAllowed(scope, [featurePath]) || leasePathIsAllowed(prefixOf(scope), [featurePath])) return true;
    const a = prefixOf(featurePath);
    const b = prefixOf(scope);
    return Boolean(a && b) && (a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`));
  };
  return map.features
    .filter((feature) => list(feature?.paths).some((featurePath) => scopes.some((scope) => overlaps(featurePath, scope))))
    .map((feature) => ({ id: feature.id, name: feature.name }));
}

export function projectFeaturesForDraft(root, draft) {
  let map = null;
  try { map = readProjectFeatureMap(root); }
  catch (error) { return { available: false, error: `invalid ${PROJECT_FEATURE_MAP_PATH}: ${error.message}`, features: [] }; }
  if (!map) return { available: false, features: [] };
  const paths = list(draft?.tasks).flatMap((task) => list(task?.paths));
  return { available: true, features: featuresForPaths(map, paths) };
}

// `features [--change <id>]`: validates the map and, for a change, names the
// features its task scopes and changed files touch.
export function createProjectFeaturesCommand({
  root, loadRuntime, activeChangePath, canonicalChangedSurface, fail, log = console.log
}) {
  // Changed files of the root repository; none before Build has a sandbox.
  const changedPaths = (id, state) => bestEffort(() => canonicalChangedSurface(id, state)
    .filter((row) => (row.repositoryId || "root") === "root").map((row) => row.path), []);
  const taskScopes = (changeDir) => {
    const tasks = join(changeDir, "tasks.md");
    return existsSync(tasks)
      ? taskBlocks(readFileSync(tasks, "utf8")).map(taskMetadata).flatMap((task) => task.paths || [])
      : [];
  };
  function featuresValue(flags = {}) {
    let map;
    try { map = readProjectFeatureMap(root); }
    catch (error) { fail(`invalid ${PROJECT_FEATURE_MAP_PATH}: ${error.message}`); }
    if (!map) return { path: PROJECT_FEATURE_MAP_PATH, available: false, issues: [], features: [],
      next: `write ${PROJECT_FEATURE_MAP_PATH} (seeded on install) to name this project's features` };
    const issues = validateProjectFeatureMap(map, { exists: (path) => existsSync(join(root, path)) });
    const value = { path: PROJECT_FEATURE_MAP_PATH, available: true, issues,
      features: map.features.map((feature) => ({ id: feature.id, name: feature.name, summary: feature.summary })) };
    if (flags.change) {
      const state = loadRuntime(flags.change);
      const scopes = [...taskScopes(activeChangePath(flags.change, state)), ...changedPaths(flags.change, state)];
      value.change = flags.change;
      value.touched = featuresForPaths(map, scopes);
    }
    return value;
  }

  function showFeatures(flags = {}) {
    const value = featuresValue(flags);
    if (!flags.pretty) log(JSON.stringify(value, null, 2));
    else {
      const lines = [value.available ? `Features (${value.path}): ${value.features.length}` : `No feature map: ${value.next}`];
      for (const feature of value.features) lines.push(`- ${feature.id}: ${feature.name}`);
      for (const issue of value.issues) lines.push(`! ${issue}`);
      if (value.change) lines.push(`Touched by ${value.change}: ${value.touched.map((row) => row.id).join(", ") || "none"}`);
      log(lines.join("\n"));
    }
    if (value.issues.length && flags.strict) fail(`${PROJECT_FEATURE_MAP_PATH} has ${value.issues.length} issue(s)`);
    return value;
  }

  return { featuresValue, showFeatures };
}
