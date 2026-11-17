import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deriveRepositoryTaskDependencies } from "./semantic-draft-tasks.mjs";
import { scopeAllowsPath } from "../../core/graph-execution.mjs";
import { unique } from "../../core/values.mjs";
import { verifyShapeIssues } from "../validation/verify-shape.mjs";
import {
  amendmentList, hasField, keyOf, semanticTaskKey, stringList, taskDepends, taskId,
  taskPaths
} from "./amendment-tasks.mjs";

// A corrected verify command replaces a failing check, so it must still be a
// check: a command that cannot fail would turn the task's acceptance (and any
// provider command derived from it) into a pass with no evidence behind it.
// A text screen, so best-effort: it catches a no-op as the whole command or as
// the last command after `;`, `||`, `|`, `&`, or a newline (`&&` still fails).
export function verifyCannotFail(command) {
  const text = String(command || "").trim().replace(/\s+#[^'"\n]*$/, "").trim();
  return /^\(?\s*(?:true|:|exit(?:\s+0)?|echo(?:\s.*)?|printf(?:\s.*)?)\s*\)?$/i.test(text) ||
    /(?:;|\n|\|\|?|(?<!&)&(?!&))\s*\(?\s*(?:true|:|exit(?:\s+0)?|echo(?:\s[^;&|\n]*)?|printf(?:\s[^;&|\n]*)?)\s*\)?\s*$/i
      .test(text);
}

// A test source file named in a verify command. Build used to discover a
// mistyped or never-created test path only when the check ran; the draft
// already says which files exist and which files its tasks create.
const TEST_SOURCE = /\.(?:[cm]?[jt]sx?|py|rb|go|rs|java|kts?|scala|php|cs|fs|swift|exs?|sh|bash|lua|dart|c|cc|cpp|clj)$/i;

const TEST_NAME = /(?:^|[/._-])(?:tests?|specs?|__tests__|e2e)(?:[/._-]|$)/i;

// A command that changes its working directory resolves paths elsewhere.
const WORKING_DIRECTORY_CHANGE =
  /(?:^|[;&|(]\s*)(?:cd|pushd)\s|--prefix\b|--cwd\b|--dir(?:ectory)?\b|--workspace\b|--filter\b|--root-dir\b|--rootDir\b|(?:^|\s)-C\s/;

export function verifyTestFileReferences(command) {
  const text = String(command || "");
  if (!text.trim() || WORKING_DIRECTORY_CHANGE.test(text)) return [];
  return unique(text.split(/\s+/).map((token) => token
    .replace(/^['"(]+|['");,]+$/g, "")
    .replace(/^--?[\w-]+=/, "")
    .replace(/::.*$/, "")
    .replace(/:\d+(?::\d+)?$/, "")
    .replace(/^\.\//, ""))
    .filter((token) => token && !token.startsWith("-") && !token.startsWith("/") &&
      !token.includes("..") && !/[*?{}[\]$<>`~]/.test(token) && !/^[a-z]+:\/\//i.test(token) &&
      TEST_SOURCE.test(token) && TEST_NAME.test(token)));
}

/**
 * Agent repairs for task verify commands that name a test file which neither
 * exists nor falls inside any task's paths (the files Build may create).
 * `tasks` rows carry { key|semanticKey|id, verify, paths, repository? };
 * `scopes` adds paths owned by tasks outside this batch.
 */
export function verifyPathIssues(tasks, { exists, scopes = [], label = "task" } = {}) {
  const rows = Array.isArray(tasks) ? tasks.filter((task) => task && typeof task === "object") : [];
  const owned = [...stringList(scopes), ...rows.flatMap((task) => stringList(task.paths))];
  const issues = [];
  rows.forEach((task, index) => {
    const repository = String(task.repository || "").trim();
    if (repository && repository !== "root") return;
    const name = String(task.semanticKey || task.key || task.id || "").trim() || `#${index + 1}`;
    for (const path of verifyTestFileReferences(task.verify)) {
      if (exists(path) || owned.some((scope) => scopeAllowsPath(scope, path))) continue;
      issues.push(`${label} '${name}' verify references '${path}', which does not exist and ` +
        "no task's paths create it; correct the path in verify or add it to that task's paths");
    }
  });
  return issues;
}

/** Added tasks and tasks whose verify an amendment changes, with their effective paths. */
function amendmentVerifyRows(amendment, tasksContent) {
  const lines = String(tasksContent || "").split("\n").filter((line) => taskId(line));
  const existing = new Map(lines.map((line) => [semanticTaskKey(line) || taskId(line), line]));
  const updated = amendmentList(amendment, "updateTasks").filter((task) =>
    task && hasField(task, "verify")).map((task) => {
    const line = existing.get(keyOf(task)) || existing.get(String(task.key || "").toUpperCase());
    return { key: keyOf(task), verify: task.verify,
      paths: hasField(task, "paths") ? task.paths : line ? taskPaths(line) : [] };
  });
  return [...amendmentList(amendment, "addTasks"), ...updated];
}

/** Verify-shape repairs for an amendment's added and verify-changing tasks. */
export function amendmentVerifyShapeIssues(amendment, tasksContent, { workTypes }) {
  return verifyShapeIssues(amendmentVerifyRows(amendment, tasksContent),
    { workTypes, label: "amendment task" });
}

/** The same check for an amendment's added and updated tasks. */
export function amendmentVerifyPathIssues(amendment, tasksContent, { exists }) {
  const lines = String(tasksContent || "").split("\n").filter((line) => taskId(line));
  const existing = new Map(lines.map((line) => [semanticTaskKey(line) || taskId(line), line]));
  const updated = amendmentList(amendment, "updateTasks").filter((task) =>
    task && hasField(task, "verify")).map((task) => {
    const line = existing.get(keyOf(task)) || existing.get(String(task.key || "").toUpperCase());
    return { key: keyOf(task), verify: task.verify,
      paths: hasField(task, "paths") ? task.paths : line ? taskPaths(line) : [] };
  });
  const added = amendmentList(amendment, "addTasks");
  return verifyPathIssues([...added, ...updated], {
    exists, label: "amendment task",
    scopes: lines.flatMap((line) => taskPaths(line))
  });
}

const GLOB = /[*?{}[\]]/;

const DYNAMIC_PATH = /[$`]/;

function literalPrefix(path) {
  const text = String(path || "").trim().replace(/^\.\//, "").replace(/\/+$/, "");
  const parts = text.split("/");
  const index = parts.findIndex((part) => GLOB.test(part));
  return (index < 0 ? parts : parts.slice(0, index)).join("/");
}

const atOrUnder = (path, directory) =>
  Boolean(directory) && (path === directory || path.startsWith(`${directory}/`));

function normalizedRelative(base, target) {
  const parts = [];
  for (const part of `${base ? `${base}/` : ""}${target}`.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (!parts.length || parts.at(-1) === "..") parts.push("..");
      else parts.pop();
    } else parts.push(part);
  }
  return parts.join("/");
}

const unquote = (value) => String(value || "").replace(/^(['"])(.*)\1$/, "$2");

/**
 * Working-directory changes a verify command makes, resolved against the
 * directory it starts in: `cd`/`pushd` targets (which accumulate), and
 * `-C`, `--prefix`, `--cwd`, `--dir`, or `--directory` arguments (which apply
 * to one tool). Dynamic targets (`$VAR`, command substitution) are unknown and
 * omitted. A text screen, so best-effort like `verifyCannotFail`.
 */
export function verifyDirectoryTargets(command) {
  const text = String(command || "");
  const targets = [];
  let current = "";
  const pattern = new RegExp(String.raw`(?:^|[;&|(]|&&|\|\|)\s*(cd|pushd)(?=$|[\s;&|)])(?:[ \t]+("[^"]*"|'[^']*'|[^\s;&|)]+))?` +
    String.raw`|(?:^|\s)(?:-C|--prefix|--cwd|--dir|--directory)(?:=|\s+)("[^"]*"|'[^']*'|[^\s;&|)]+)`, "g");
  for (const match of text.matchAll(pattern)) {
    const raw = unquote(match[2] ?? match[3] ?? "");
    const shell = Boolean(match[1]);
    if (shell && (!raw || raw === "-")) {
      if (!raw) targets.push({ raw: "~", outside: true, path: null });
      continue;
    }
    if (DYNAMIC_PATH.test(raw)) continue;
    if (raw.startsWith("/") || raw.startsWith("~")) {
      targets.push({ raw, outside: true, path: null });
      continue;
    }
    const path = normalizedRelative(current, raw);
    const outside = path === ".." || path.startsWith("../");
    targets.push({ raw, outside, path: outside ? null : path });
    if (shell && !outside) current = path;
  }
  return targets;
}

// Declared repositories other than root: nested ones and trusted siblings
// (`../sdk`, admitted by the catalog only with allowOutsideRoot).
function catalogRepositories(repositories) {
  return (Array.isArray(repositories) ? repositories : [])
    .filter((row) => row && row.id && row.id !== "root")
    .map((row) => ({
      id: String(row.id),
      path: String(row.relativePath || "").replace(/^\.\//, "").replace(/\/+$/, ""),
      absolutePath: row.path || null,
      mode: row.mode === "read" ? "read" : "write"
    }))
    .filter((row) => row.path && row.path !== "." && row.path !== "..");
}

function selectionEntries(selection) {
  return new Map((Array.isArray(selection) ? selection : [])
    .map((entry) => typeof entry === "string" ? { id: entry } : entry)
    .filter((entry) => entry?.id).map((entry) => [String(entry.id).trim(), entry]));
}

function selectionIds(selection) {
  return (Array.isArray(selection) ? selection : [])
    .map((entry) => String(typeof entry === "string" ? entry : entry?.id || "").trim())
    .filter(Boolean);
}

/**
 * Agent repairs for tasks bound to the wrong repository: a root task whose
 * paths or verify reach into a declared repository, a repository task whose
 * paths are written from the control root, a task naming a repository the
 * draft does not select, and a verify command that changes into a directory
 * outside its task repository. `repositories` are catalog rows
 * ({id, relativePath, path}); `selection` is the draft's `repositories`.
 */
export function taskRepositoryIssues(tasks, {
  repositories = [], selection, exists = (..._args) => false, label = "task", selectionSource = "draft"
} = {}) {
  const rows = Array.isArray(tasks) ? tasks.filter((task) => task && typeof task === "object") : [];
  const declared = catalogRepositories(repositories);
  const byId = new Map(declared.map((row) => [row.id, row]));
  const selected = selectionIds(selection);
  const selectedSet = new Set(selected);
  const selectedEntries = selectionEntries(selection);
  const selectsOtherRepository = selected.some((id) => id !== "root");
  const declaredList = declared.map((row) => `${row.id} (${row.path})`).join(", ");
  const owner = (path) => declared.find((row) => atOrUnder(path, row.path)) || null;
  const issues = [];
  rows.forEach((task, index) => {
    const name = String(task.semanticKey || task.key || task.id || "").trim() || `#${index + 1}`;
    const repository = String(task.repository || "").trim() || "root";
    const repositoryRow = byId.get(repository) || null;
    const subject = `${label} '${name}'`;
    if (repository !== "root" && declared.length && !repositoryRow)
      issues.push(`${subject} names repository '${repository}', which ` +
        `openspec/repositories.yaml does not declare; use one of: ${declaredList}`);
    if (repository !== "root" && !selectedSet.has(repository))
      issues.push(selectionSource === "change"
        ? `${subject} runs in repository '${repository}', which this change does not select; ` +
          "bind it to a selected repository (a new repository needs 'change revise' before Build)"
        : `${subject} runs in repository '${repository}', which the draft's 'repositories' ` +
          `does not list; add { "id": "${repository}", "mode": "write" } to 'repositories'`);
    const mode = selectedEntries.get(repository)?.mode || repositoryRow?.mode;
    if (repositoryRow && mode === "read" && stringList(task.paths).length)
      issues.push(`${subject} edits files in repository '${repository}', which is read-only ` +
        "in this change; bind the task to a writable repository");
    if (!String(task.repository || "").trim() && selectsOtherRepository)
      issues.push(`${subject} names no 'repository' while the draft selects ` +
        `${selected.join(", ")}; set 'repository' to the one that owns its files`);
    for (const path of stringList(task.paths)) {
      const prefix = literalPrefix(path);
      if (repository === "root") {
        const inside = prefix && owner(prefix);
        if (inside)
          issues.push(`${subject} path '${path}' is inside repository '${inside.id}' ` +
            `(${inside.path}) but the task runs in root; set "repository": "${inside.id}", write ` +
            `its paths and verify relative to ${inside.path}, and list ${inside.id} in 'repositories'`);
      } else if (repositoryRow && atOrUnder(prefix, repositoryRow.path)) {
        const relativePath = path.replace(/^\.\//, "").slice(repositoryRow.path.length + 1) || "**";
        issues.push(`${subject} path '${path}' is written from the control root; task ` +
          `paths are relative to repository '${repository}', so write '${relativePath}'`);
      }
    }
    for (const target of verifyDirectoryTargets(task.verify)) {
      if (target.outside) {
        issues.push(`${subject} verify changes into '${target.raw}', outside repository ` +
          `'${repository}'; verify runs from that repository's root, so name a path inside it`);
        continue;
      }
      if (repository === "root") {
        const inside = owner(target.path);
        if (inside)
          issues.push(`${subject} verify changes into '${target.raw}', which is repository ` +
            `'${inside.id}'; set "repository": "${inside.id}" and write verify to run from its root`);
        continue;
      }
      const reached = owner(target.path);
      if (!reached) continue;
      const local = repositoryRow?.absolutePath &&
        exists(`${repositoryRow.absolutePath}/${target.path}`);
      if (local) continue;
      issues.push(reached.id === repository
        ? `${subject} verify changes into '${target.raw}', but verify already runs from ` +
          `repository '${repository}' (${reached.path}); remove that directory change`
        : `${subject} verify changes into '${target.raw}', which is repository ` +
          `'${reached.id}'; verify runs from repository '${repository}', so split the check ` +
          `into a task bound to '${reached.id}'`);
    }
  });
  return unique(issues);
}

/**
 * Repository-derived order for an amendment's added tasks, exactly as start
 * derives it: an added task follows the ledger's and the amendment's tasks in
 * repositories nested inside its own (or that its repository `dependsOn`).
 * Existing ledger lines keep their edges. `newTasks` are {id, semanticKey,
 * repository, dependsOn} rows whose dependsOn already holds task ids.
 */
export function deriveAmendmentTaskDependencies(newTasks, tasksContent, options = {}) {
  const existing = String(tasksContent || "").split("\n").filter((line) => taskId(line))
    .map((line) => ({
      id: taskId(line), semanticKey: semanticTaskKey(line),
      repository: String(line).match(/\[repo:([^\]\s]+)\]/i)?.[1] || "root",
      dependsOn: taskDepends(line)
    }));
  const derived = deriveRepositoryTaskDependencies([...existing, ...newTasks], {
    ...options, consumers: new Set(newTasks.map((task) => task.id))
  });
  return {
    tasks: derived.tasks.slice(existing.length),
    issues: derived.issues.map((issue) => `amendment ${issue}`)
  };
}

/** The repository-order issues `change amend --inspect` reports in one EDIT. */
export function amendmentRepositoryOrderIssues(amendment, tasksContent, options = {}) {
  const added = amendmentList(amendment, "addTasks").filter((task) => keyOf(task));
  if (!added.length) return [];
  const existingIds = new Map(String(tasksContent || "").split("\n")
    .filter((line) => taskId(line))
    .flatMap((line) => [[semanticTaskKey(line), taskId(line)], [taskId(line), taskId(line)]]));
  const addedKeys = new Set(added.map(keyOf));
  const resolve = (value) => addedKeys.has(value) ? value
    : existingIds.get(value) || existingIds.get(String(value).toUpperCase()) || value;
  return deriveAmendmentTaskDependencies(added.map((task) => ({
    id: keyOf(task), semanticKey: keyOf(task),
    repository: String(task.repository || "").trim() || "root",
    dependsOn: stringList(task.dependsOn).map(resolve)
  })), tasksContent, options).issues;
}

/** The same repository checks for an amendment's added and updated tasks. */
export function amendmentTaskRepositoryIssues(amendment, tasksContent, options = {}) {
  const lines = String(tasksContent || "").split("\n").filter((line) => taskId(line));
  const existing = new Map(lines.flatMap((line) => [
    [semanticTaskKey(line) || taskId(line), line], [taskId(line), line]]));
  const repositoryOf = (line) => String(line).match(/\[repo:([^\]\s]+)\]/)?.[1] || "";
  const updated = amendmentList(amendment, "updateTasks").filter((task) =>
    task && (hasField(task, "verify") || hasField(task, "paths"))).map((task) => {
    const line = existing.get(keyOf(task)) || existing.get(keyOf(task).toUpperCase()) || "";
    return { key: keyOf(task), repository: repositoryOf(line),
      verify: hasField(task, "verify") ? task.verify : "",
      paths: hasField(task, "paths") ? task.paths : [] };
  });
  return taskRepositoryIssues([...amendmentList(amendment, "addTasks"), ...updated], {
    ...options, selection: options.selection ?? ["root"], label: "amendment task",
    selectionSource: "change"
  });
}

/**
 * The verify-only amendment `change amend <change> --task <key> --verify
 * <command>` submits: an unfinished task's check corrected in place, with the
 * spec approval, requirements, claims, and capabilities untouched.
 */
export function taskVerifyAmendment({ task, verify, reason = "", reopen = false }) {
  return {
    version: 1,
    reason: String(reason || "").trim() ||
      `Correct the verify command of task '${String(task || "").trim()}'`,
    updateTasks: [{ key: String(task || "").trim(), verify: String(verify || "").trim(),
      ...(reopen === true ? { reopen: true } : {}) }]
  };
}

// Runs the verify-only amendment through the same transactional `change
// amend` path (validation, invalidation, rollback, approval carry) without the
// agent authoring a JSON file. The staged file lives in machine state and is
// removed on success, failure, or exit.
export function amendTaskVerifyOperation({ root, amendChange, pid = process.pid,
  now = Date.now, onExit = (cleanup) => process.once("exit", cleanup) }, id, options) {
  const directory = join(root, ".foundation", "amendments");
  mkdirSync(directory, { recursive: true });
  const path = join(directory, `${id}-verify-${now()}-${pid}.json`);
  writeFileSync(path, `${JSON.stringify(taskVerifyAmendment(options), null, 2)}\n`);
  const cleanup = () => rmSync(path, { force: true });
  onExit(cleanup);
  try { return amendChange(id, path, { consumeAmendment: true }); }
  finally { cleanup(); }
}
