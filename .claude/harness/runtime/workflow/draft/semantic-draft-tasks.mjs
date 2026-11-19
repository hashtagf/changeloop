import { unique } from "../../core/values.mjs";
import {
  AUTHORITY_CAPABILITIES, placeholderIssue, stringList, text
} from "./semantic-draft-text.mjs";
import { plainObject } from "./semantic-draft-minimal.mjs";

// Every key a draft task may carry: what normalizeTasks and its readers use.
// Anything else is ignored, so it is reported (a misspelled `depends` once
// dropped a whole task order without a word).
export const TASK_FIELDS = Object.freeze([
  "key", "id", "title", "outcome", "covers", "claims", "paths", "verify", "dependsOn",
  "kind", "repository", "resources", "requestedModel", "model", "inputSchema",
  "outputSchema", "semanticKey"
]);

const TASK_FIELD_ALIASES = Object.freeze({
  depends: "dependsOn", depends_on: "dependsOn", dependson: "dependsOn", after: "dependsOn",
  path: "paths", test: "verify", check: "verify",
  requirement: "covers", requirements: "covers"
});

function editDistance(left, right) {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= right.length; j += 1)
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
    previous = current;
  }
  return previous[right.length];
}

function suggestedTaskField(field) {
  const alias = TASK_FIELD_ALIASES[field] || TASK_FIELD_ALIASES[field.toLowerCase()];
  if (alias) return alias;
  let best = null;
  let bestDistance = Infinity;
  for (const known of TASK_FIELDS) {
    const distance = editDistance(field.toLowerCase(), known.toLowerCase());
    if (distance < bestDistance) [best, bestDistance] = [known, distance];
  }
  // A short key is near everything; cap the distance at half its length.
  return bestDistance <= Math.min(3, Math.floor(field.length / 2)) ? best : null;
}

// Advisory, never blocking: compilation proceeds and ignores the field.
export function unknownTaskFieldWarnings(source) {
  const known = new Set(TASK_FIELDS);
  return (Array.isArray(source?.tasks) ? source.tasks : []).flatMap((task, index) =>
    plainObject(task) ? Object.keys(task).filter((field) => !known.has(field)).map((field) => {
      const suggestion = suggestedTaskField(field);
      return `tasks[${index}].${field} is not a known task field` +
        (suggestion ? `; did you mean ${suggestion}?` : "");
    }) : []);
}

export function normalizeTasks(source, requirements, requirementKeys, issues) {
  const claimsByRequirement = new Map(requirements.map((row) => [row.key, row.claimIds]));
  const taskIds = new Map();
  for (const [index, task] of (source.tasks || []).entries()) {
    const key = text(task?.key) || `task-${index + 1}`;
    const id = text(task?.id) || `T${String(index + 1).padStart(3, "0")}`;
    if (taskIds.has(key)) issues.push(`semantic draft tasks[${index}].key '${key}' is duplicated`);
    if ([...taskIds.values()].includes(id)) issues.push(`semantic draft tasks[${index}].id '${id}' is duplicated`);
    taskIds.set(key, id);
    placeholderIssue(key, `semantic draft tasks[${index}].key`, issues);
  }

  const covered = new Set();
  const tasks = (source.tasks || []).map((task, index) => {
    const label = `semantic draft tasks[${index}]`;
    const key = text(task?.key) || `task-${index + 1}`;
    const covers = stringList(task?.covers);
    if (!text(task?.outcome)) issues.push(`${label}.outcome is required`);
    if (!text(task?.verify)) issues.push(`${label}.verify is required`);
    if (!covers.length) issues.push(`${label}.covers must name at least one requirement` +
      (source._minimalDraft ? " (several tasks and requirements: name the requirement keys " +
        `this task implements; keys: ${[...requirementKeys].join(", ")})` : ""));
    const unknown = covers.filter((value) => !requirementKeys.has(value));
    if (unknown.length) issues.push(`${label}.covers references unknown requirement(s): ${unknown.join(", ")}`);
    covers.forEach((value) => covered.add(value));
    const dependencyKeys = stringList(task?.dependsOn);
    const unknownDependencies = dependencyKeys.filter((value) => !taskIds.has(value));
    if (unknownDependencies.length)
      issues.push(`${label}.dependsOn references unknown task(s): ${unknownDependencies.join(", ")}`);
    const dependsOn = dependencyKeys.map((value) => taskIds.get(value)).filter(Boolean);
    placeholderIssue(task?.outcome, `${label}.outcome`, issues);
    placeholderIssue(task?.verify, `${label}.verify`, issues);
    return {
      id: taskIds.get(key),
      semanticKey: key,
      outcome: text(task?.outcome),
      verify: text(task?.verify),
      repository: text(task?.repository) || undefined,
      kind: text(task?.kind) || "implementation",
      paths: stringList(task?.paths),
      dependsOn,
      resources: stringList(task?.resources),
      claims: unique(covers.flatMap((value) => claimsByRequirement.get(value) || [])),
      requestedModel: text(task?.requestedModel || task?.model) || undefined,
      inputSchema: text(task?.inputSchema) || undefined,
      outputSchema: text(task?.outputSchema) || undefined
    };
  });
  const uncovered = [...requirementKeys].filter((key) => !covered.has(key));
  if (uncovered.length)
    issues.push(`semantic draft requirements have no implementation task: ${uncovered.join(", ")}` +
      (source._minimalDraft ? "; name each in one task's 'covers'" : ""));
  const graph = new Map(tasks.map((task) => [task.id, task.dependsOn]));
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if ((graph.get(id) || []).some(visit)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  if (tasks.some((task) => visit(task.id)))
    issues.push("semantic draft task dependencies contain a cycle");
  return tasks;
}

function repositoryPath(row) {
  return String(row?.relativePath ?? row?.path ?? "").replaceAll("\\", "/")
    .replace(/^\.\//, "").replace(/\/+$/, "") || ".";
}

// Whether `inner` lies strictly inside `outer` (a superproject contains its
// submodules). Sibling repositories (`../x`) are never contained.
function repositoryContains(outer, inner) {
  if (inner === "." || inner === ".." || inner.startsWith("../") || inner === outer) return false;
  return outer === "." || inner.startsWith(`${outer}/`);
}

/**
 * Cross-repository task order the compiler derives so the author need not.
 * A task consumes another selected repository when its own repository
 * contains that repository's path (the root superproject builds and tests its
 * submodules), or, for a task without authored edges, when its repository
 * declares `dependsOn` on it (the edge the runtime already infers, made
 * explicit so an added edge never hides it). The consuming task depends on
 * every same-change task in the consumed repository. An edge that would close
 * a cycle is not added and is reported instead. `repositories` are catalog
 * rows ({id, relativePath, dependsOn}); `selection` is the draft's
 * `repositories`, whose `dependsOn` overrides the catalog's. `consumers`, when
 * given, limits which task ids may receive edges (an amendment's added tasks).
 */
export function deriveRepositoryTaskDependencies(tasks, /** @type {{ repositories?: any[], selection?: any, consumers?: any }} */ {
  repositories = [], selection, consumers = null
} = {}) {
  const rows = (Array.isArray(tasks) ? tasks : []).map((task) => ({
    ...task, dependsOn: [...(task?.dependsOn || [])]
  }));
  const repositoryOf = (task) => text(task.repository) || "root";
  const catalog = new Map((Array.isArray(repositories) ? repositories : [])
    .filter((row) => row?.id).map((row) => [String(row.id), row]));
  const selected = new Map((Array.isArray(selection) ? selection : [])
    .map((entry) => typeof entry === "string" ? { id: entry } : entry)
    .filter((entry) => entry?.id).map((entry) => [String(entry.id), entry]));
  const pathOf = (id) => id === "root" ? "." : catalog.has(id) ? repositoryPath(catalog.get(id)) : null;
  const declaredDependencies = (id) => stringList(
    selected.get(id)?.dependsOn ?? catalog.get(id)?.dependsOn);
  const taskRepositories = unique(rows.map(repositoryOf));
  const label = (task) => task.semanticKey || task.id;
  const graph = new Map(rows.map((task) => [task.id, task.dependsOn]));
  const reaches = (from, to) => {
    const seen = new Set();
    const pending = [from];
    while (pending.length) {
      const current = pending.pop();
      if (current === to) return true;
      if (seen.has(current)) continue;
      seen.add(current);
      pending.push(...(graph.get(current) || []));
    }
    return false;
  };
  const derived = [];
  const issues = [];
  for (const task of rows) {
    if (consumers && !consumers.has(task.id)) continue;
    const own = repositoryOf(task);
    const ownPath = pathOf(own);
    const consumed = [
      ...(task.dependsOn.length ? [] : declaredDependencies(own).map((id) =>
        [id, `repository '${own}' dependsOn '${id}'`])),
      ...taskRepositories.filter((id) => id !== own && ownPath !== null && pathOf(id) !== null &&
        repositoryContains(ownPath, pathOf(id)))
        .map((id) => [id, `repository '${own}' contains repository '${id}' at ${pathOf(id)}`])
    ];
    for (const [id, reason] of consumed) {
      for (const provider of rows.filter((candidate) =>
        candidate.id !== task.id && repositoryOf(candidate) === id)) {
        if (task.dependsOn.includes(provider.id)) continue;
        if (reaches(provider.id, task.id)) {
          issues.push(`task '${label(task)}' (repository '${own}') must follow ` +
            `'${label(provider)}' because ${reason}, but '${label(provider)}' already depends ` +
            `on '${label(task)}'; remove that dependency or move the shared work into one repository`);
          continue;
        }
        task.dependsOn.push(provider.id);
        derived.push({ taskId: task.id, dependsOn: provider.id, reason });
      }
    }
  }
  return { tasks: rows, derived, issues: unique(issues) };
}

// The provider command for a list of task verifies, and the verifies as
// `segments` when there are several, so test discrimination can rerun only
// the segment that names a changed test instead of the whole chain.
export function verifyChain(commands) {
  return commands.length === 1
    ? { command: ["sh", "-c", commands[0]] }
    : { command: ["sh", "-c", commands.map((value) => `(${value})`).join(" && ")],
        segments: [...commands] };
}

function derivedProviders(claims, tasks) {
  const commands = unique(tasks.map((task) => task.verify).filter(Boolean));
  const { command, segments } = verifyChain(commands);
  const capabilities = unique(claims.flatMap((claim) => claim.capabilities));
  // Derived test runs follow Build's task repository, not the control root.
  const repositories = unique(tasks.map((task) => text(task.repository) || "root"));
  const repository = repositories.length === 1 && repositories[0] !== "root"
    ? { repository: repositories[0] } : {};
  const providers = {};
  for (const capability of capabilities) {
    if (capability === "discovery") continue;
    if (capability === "test" && repositories.length > 1) {
      for (const id of repositories) {
        const scoped = unique(tasks.filter((task) => (text(task.repository) || "root") === id)
          .map((task) => task.verify).filter(Boolean));
        if (!scoped.length) continue;
        const discoveryProvider = `discovery-${id}`;
        providers[`test-${id}`] = { adapter: "test-discovery", capability: "test", repository: id,
          ...verifyChain(scoped), discoveryProvider, minimum: 1, reportFormat: "auto", claims: "declared" };
        providers[discoveryProvider] = { adapter: "test-discovery", capability: "discovery", repository: id,
          ...verifyChain(scoped), minimum: 1, reportFormat: "auto", claims: "declared" };
      }
      continue;
    }
    if (AUTHORITY_CAPABILITIES.has(capability)) {
      providers[capability] = { adapter: "external", capability, claims: "declared" };
      continue;
    }
    providers[capability] = capability === "test"
      ? {
          adapter: "test-discovery", command, ...(segments ? { segments } : {}), minimum: 1,
          reportFormat: "auto", claims: "declared", ...repository
        }
      : { adapter: "command", capability, command, claims: "declared", ...repository };
  }
  return providers;
}

// The draft's evidence wiring. Without an authored `execution` every claimed
// capability is derived from the task verifies. An authored one is kept as
// written, with one exception: when it wires no test provider (say, only the
// screenshot and visual providers a prototype needs), the test provider the
// verifies give is added, so wiring something else never drops the test run
// and the test count (discovery) the claims owe.
export function derivedExecution(source, claims, tasks) {
  const derived = derivedProviders(claims, tasks);
  if (!source.execution) return { version: 1, providers: derived, services: {} };
  const authored = source.execution.providers || {};
  const wiresTest = Object.entries(authored).some(([name, config]) =>
    ["test", "discovery"].includes(config?.capability || name) || config?.adapter === "test-discovery");
  const testProviders = Object.fromEntries(Object.entries(derived).filter(([name, config]) =>
    name === "test" || ["test", "discovery"].includes(config.capability)));
  return Object.keys(testProviders).length && !wiresTest
    ? { ...source.execution, providers: { ...testProviders, ...authored } }
    : source.execution;
}
