import { taskMetadata } from "../../contracts/change-artifacts.mjs";

export const GROUNDING_READ_ROLES = [
  "requirement", "backlog", "architecture", "contract", "composition-root",
  "runtime-path", "production-path", "test-topology", "dependency-source", "history"
];

export const CRITICAL_CASE_ORACLES = [
  "production-entry", "real-wire", "contract-oracle", "failure-path"
];

function normalizedScope(path) {
  return String(path || "").replace(/^\.\//, "")
    .replace(/\/\*\*?$/, "").replace(/\/$/, "");
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globMatchesPath(scope, path) {
  const raw = String(scope || "").replace(/^\.\//, "").replace(/\/$/, "");
  let pattern = "";
  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    if (character === "*") {
      if (raw[index + 1] === "*") {
        pattern += ".*";
        index += 1;
      } else pattern += "[^/]*";
    } else if (character === "?") pattern += "[^/]";
    else pattern += escapeRegex(character);
  }
  return new RegExp(`^${pattern}$`).test(path);
}

function scopeCouldTouchPath(scope, path) {
  const raw = String(scope || "").replace(/^\.\//, "").replace(/\/$/, "");
  if (raw === "*") return true;
  if (/[*?]/.test(raw)) {
    if (globMatchesPath(raw, path)) return true;
    const prefix = raw.slice(0, raw.search(/[*?]/)).replace(/\/$/, "");
    return Boolean(prefix && (prefix === path || prefix.startsWith(`${path}/`)));
  }
  const normalized = normalizedScope(raw);
  return path === normalized || path.startsWith(`${normalized}/`) ||
    normalized.startsWith(`${path}/`);
}

export function groundingTaskOverlapFindings(readSet = [], tasks = []) {
  const immutableRoles = new Set([
    "requirement", "backlog", "architecture", "contract",
    "dependency-source", "history"
  ]);
  const findings = [];
  for (const source of readSet) {
    if (!immutableRoles.has(source?.role)) continue;
    const sourceRepo = source.repository || "root";
    const sourcePath = normalizedScope(source.path);
    if (!sourcePath) continue;
    for (const task of tasks.map(taskMetadata)) {
      if (!["implementation", "migration"].includes(task.kind) ||
          task.repository !== sourceRepo) continue;
      for (const declared of task.paths) {
        if (scopeCouldTouchPath(declared, sourcePath)) {
          findings.push({
            taskId: task.id,
            repository: sourceRepo,
            path: source.path,
            role: source.role,
            taskPath: declared
          });
          break;
        }
      }
    }
  }
  return findings;
}

function taskOwnsGroundingPath(tasks, repository, path) {
  return tasks.map(taskMetadata).some((task) =>
    ["implementation", "migration"].includes(task.kind) &&
    task.repository === repository && task.paths.some((scope) =>
      scopeCouldTouchPath(scope, path)));
}

export function plannedGroundingPathEligible(source, pathExists, tasks = [], firstLock = true) {
  if (source?.sha256 !== "planned") return false;
  if (!["production-path", "runtime-path", "test-topology"]
    .includes(source?.role)) return false;
  if (firstLock && pathExists) return false;
  return taskOwnsGroundingPath(tasks, source.repository || "root",
    normalizedScope(source.path));
}

export function plannedGroundingPathRecovery(source, pathExists, tasks = [], firstLock = true) {
  if (source?.sha256 !== "planned" || pathExists || !firstLock) return null;
  const allowedRoles = [
    "production-path", "runtime-path", "test-topology"
  ];
  if (!allowedRoles.includes(source?.role))
    return `path is marked planned but role '${source?.role || "missing"}' cannot own ` +
      `a new path; change role to ${allowedRoles.join("|")} and add ` +
      `[kind:implementation] [repo:${source?.repository || "root"}] ` +
      `[paths:${source?.path}] to its owning task`;
  if (taskOwnsGroundingPath(tasks, source.repository || "root",
    normalizedScope(source.path))) return null;
  const repository = source.repository || "root";
  return `path is marked planned but no implementation or migration task owns it; ` +
    `add [kind:implementation] [repo:${repository}] [paths:${source.path}] to the ` +
    `owning task (a matching glob is also valid), then keep sha256 as planned`;
}

export function groundingPathRowShapeIssue(label, row) {
  if (row && typeof row === "object" && !Array.isArray(row)) return null;
  return `${label} must be an object with repository and path, for example ` +
    `{"repository":"root","path":"src/index.js"}`;
}

export function groundingMissingReadSourceRecovery(sourcePath, repositoryId, role) {
  return `for a new path add ` +
    `{"repository":"${repositoryId}","path":"${sourcePath}",` +
    `"role":"${role}","mode":"full","sha256":"planned"} to readSet ` +
    `and add [kind:implementation] [repo:${repositoryId}] [paths:${sourcePath}] ` +
    `to its owning task`;
}

export function hasObservableSecurityControl(claim) {
  return /(?:cannot|denied|reject|refus|block|prevent|unauthor|forbid|invalid|malform|oversiz|travers|isolation|privacy|redact|saniti|escap)/i
    .test(`${claim?.id || ""} ${claim?.scenario || ""}`);
}

export function groundingInteractionRequirements({
  coupling = "isolated", repositoryCount = 1, capabilities = [], semantics = ""
} = {}) {
  const declared = capabilities instanceof Set ? capabilities : new Set(capabilities);
  const semanticText = String(semantics).toLowerCase();
  const explicitServiceBoundary =
    /\b(queue|message broker|rabbit(?:mq)?|kafka|webhook|cross-service|remote service|event (?:bus|stream|consumer|producer))\w*\b/
      .test(semanticText);
  const service = coupling === "coupled" || repositoryCount > 1 ||
    ["cross-repo-contract", "integration", "live", "queue"]
      .some((capability) => declared.has(capability)) ||
    explicitServiceBoundary;
  const wire = service || ["compatibility", "browser"]
    .some((capability) => declared.has(capability)) ||
    /\b(wire|contract|http|api|json|message|payload)\w*\b/.test(semanticText);
  return { service, wire };
}
