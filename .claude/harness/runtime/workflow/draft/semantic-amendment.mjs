import {
  existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync
} from "node:fs";
import { join } from "node:path";
import { normalizeSemanticDraft, renderSpecHeading } from "./semantic-draft.mjs";
import { providerCapability } from "../../evidence/provider-catalog.mjs";
import {
  amendmentInvestigationSource, investigationCoverageIssues
} from "../validation/investigation-coverage.mjs";
import { amendmentCompileVersion, isRecordedSemanticVersion } from "../validation/draft-version.mjs";
import { unique } from "../../core/values.mjs";
import {
  TASK_CONTRACT_FIELDS, amendmentList, appendRequirementToSpec, combinedChain,
  combinedCommand, hasField, keyOf, missingEvidenceIssue, removalRef, renderRequirement, reopenTask,
  replaceRequirementBlock, replaceTaskDepends, replaceTaskPaths, replaceTaskVerify,
  requirementBlocks, semanticTaskKey, stringList, taskClaims, taskCompleted,
  taskContractOnlyAmendment, taskDepends, taskId, taskPaths, taskVerify,
  updateTaskClaimAnnotation, withChain
} from "./amendment-tasks.mjs";
import {
  amendmentSectionIssues, appendAmendmentHistory, packetLanguage, replaceDiscoveryDelta,
  replaceInvestigation, replaceOutlineSection, replaceRemovedRequirements
} from "./amendment-sections.mjs";
import { deriveAmendmentTaskDependencies, verifyCannotFail } from "./amendment-verify.mjs";

// --- Markdown section editing (## level, code fences respected) -----------

// ---- Task repository binding --------------------------------------------------
// A task runs, and its verify command runs, from the root of its repository.
// A project that keeps code in declared repositories (submodules, siblings)
// must bind each task to the repository that owns its files; otherwise Build
// dispatches the work to the control root, where the code is not.

function amendmentIssues(amendment) {
  const issues = [];
  if (amendment?.version !== 1) issues.push("semantic amendment requires version 1");
  for (const field of ["addRequirements", "reviseRequirements", "removeRequirements"])
    if (amendment?.[field] !== undefined && !Array.isArray(amendment[field]))
      issues.push(`semantic amendment ${field} must be an array`);
  const added = amendmentList(amendment, "addRequirements");
  const revised = amendmentList(amendment, "reviseRequirements");
  const removed = amendmentList(amendment, "removeRequirements");
  const sectionIssues = amendmentSectionIssues(amendment);
  issues.push(...sectionIssues);
  const sectionsOnly = !sectionIssues.length && amendmentList(amendment, "sections").length > 0 &&
    ["updateTasks", "addTasks", "removeTasks"].every((field) => !amendmentList(amendment, field).length);
  if (!added.length && !revised.length && !removed.length &&
      !taskContractOnlyAmendment(amendment) && !sectionsOnly)
    issues.push("semantic amendment requires a non-empty addRequirements, " +
      "reviseRequirements, or removeRequirements array, or only updateTasks " +
      "{key, verify, paths?, dependsOn?, reopen?} rows, removeTasks, and addTasks " +
      "that cover existing requirements, or only sections");
  if ((added.length || revised.length) && (!amendment?.evidence ||
      typeof amendment.evidence !== "object" || Array.isArray(amendment.evidence)))
    issues.push(missingEvidenceIssue([...added, ...revised].map(keyOf)));
  for (const [index, row] of removed.entries()) {
    if (!keyOf(row)) issues.push(`semantic amendment removeRequirements[${index}].key is required`);
    if (!String(row?.migration || "").trim())
      issues.push(`semantic amendment removeRequirements[${index}].migration is required`);
  }
  if (amendment?.updateTasks !== undefined && !Array.isArray(amendment.updateTasks))
    issues.push("semantic amendment updateTasks must be an array");
  for (const [index, task] of (Array.isArray(amendment?.updateTasks)
    ? amendment.updateTasks : []).entries()) {
    if (hasField(task, "verify") && (typeof task.verify !== "string" ||
        !task.verify.trim() || /[`\r\n]/.test(task.verify)))
      issues.push(`semantic amendment updateTasks[${index}].verify must be a ` +
        "non-empty one-line command without backticks");
    else if (hasField(task, "verify") && verifyCannotFail(task.verify))
      issues.push(`semantic amendment updateTasks[${index}].verify cannot be a command ` +
        "that always passes; name the focused check that proves the task");
    if (hasField(task, "paths") && (!Array.isArray(task.paths) ||
        task.paths.some((path) => typeof path !== "string" || !path.trim() || /[,\]\s]/.test(path))))
      issues.push(`semantic amendment updateTasks[${index}].paths must be an array of ` +
        "path globs without commas, brackets, or spaces");
    if (hasField(task, "dependsOn") && (!Array.isArray(task.dependsOn) ||
        task.dependsOn.some((value) => typeof value !== "string" || !value.trim())))
      issues.push(`semantic amendment updateTasks[${index}].dependsOn must be an array of task keys or ids`);
    if (hasField(task, "reopen") && typeof task.reopen !== "boolean")
      issues.push(`semantic amendment updateTasks[${index}].reopen must be true or false`);
  }
  if (amendment?.addTasks !== undefined && !Array.isArray(amendment.addTasks))
    issues.push("semantic amendment addTasks must be an array");
  if (amendment?.removeTasks !== undefined && !Array.isArray(amendment.removeTasks))
    issues.push("semantic amendment removeTasks must be an array");
  for (const [index, row] of amendmentList(amendment, "removeTasks").entries())
    if (!removalRef(row))
      issues.push(`semantic amendment removeTasks[${index}] must name a task key or id`);
  return issues;
}

// The merged ledger (updated, kept, and added tasks) must stay acyclic, so a
// cycle is an amendment repair rather than a Build-time planning failure.
function amendedTaskCycleIssues(taskLines, addTasks, resolveTaskId) {
  const graph = new Map();
  for (const line of taskLines) {
    const id = line === null ? null : taskId(line);
    if (id) graph.set(id, taskDepends(line));
  }
  const addedKeys = new Set(addTasks.map(keyOf).filter(Boolean));
  for (const task of addTasks) {
    if (!keyOf(task)) continue;
    graph.set(`key:${keyOf(task)}`, stringList(task?.dependsOn).map((dependency) =>
      addedKeys.has(dependency) ? `key:${dependency}` : resolveTaskId(dependency))
      .filter(Boolean));
  }
  const label = (node) => node.startsWith("key:") ? `'${node.slice(4)}'` : node;
  const visiting = [];
  const visited = new Set();
  const cycles = [];
  const visit = (node) => {
    const at = visiting.indexOf(node);
    if (at >= 0) { cycles.push([...visiting.slice(at), node]); return; }
    if (visited.has(node) || !graph.has(node)) return;
    visiting.push(node);
    for (const dependency of graph.get(node)) visit(dependency);
    visiting.pop();
    visited.add(node);
  };
  for (const node of graph.keys()) visit(node);
  return cycles.map((cycle) => `amendment task dependencies contain a cycle: ` +
    `${cycle.map(label).join(" -> ")}; update dependsOn so the tasks form an order`);
}

export function compileSemanticAmendment({
  amendment, contract, tasksContent, slugify, renderTask, semanticDraftVersion = 4,
  loadCanonicalSpec = null, provenClaimIds = [], retiredTaskIds = [],
  repositories = null, repositorySelection = null, investigationSource = null
}) {
  const issues = amendmentIssues(amendment);
  const investigationAgreement = amendmentInvestigationSource(investigationSource, amendment);
  if (investigationAgreement) issues.push(...investigationCoverageIssues(investigationAgreement));
  if (!isRecordedSemanticVersion(semanticDraftVersion))
    issues.push("semantic amendment requires semanticDraftVersion 3, 4, or 5");
  const compileVersion = amendmentCompileVersion(semanticDraftVersion);
  const existingClaims = contract.claims || [];
  const priorClaimById = new Map(existingClaims.map((claim) => [claim.id, claim]));
  const claimsByRequirement = new Map();
  for (const claim of existingClaims) {
    if (!claim.requirementKey) continue;
    claimsByRequirement.set(claim.requirementKey, [
      ...(claimsByRequirement.get(claim.requirementKey) || []), claim.id
    ]);
  }
  const taskLines = String(tasksContent).split("\n");
  const tasksByKey = new Map();
  const tasksById = new Map();
  // A withdrawn task's id is never reused, so its old leases, receipts, and
  // audit rows cannot be mistaken for a new task's.
  let maxTask = Math.max(0, ...stringList(retiredTaskIds)
    .map((id) => Number(id.replace(/^T/i, "")) || 0));
  for (const [index, line] of taskLines.entries()) {
    const id = taskId(line);
    if (id) maxTask = Math.max(maxTask, Number(id.slice(1)) || 0);
    if (id) tasksById.set(id, { index, line, id, key: semanticTaskKey(line) });
    const key = semanticTaskKey(line);
    if (key) tasksByKey.set(key, { index, line, id });
  }
  const resolveTaskId = (reference) => {
    const value = String(reference || "").trim();
    return tasksByKey.get(value)?.id || tasksById.get(value.toUpperCase())?.id || null;
  };
  // The agent sees task ids in every Build action; a task-contract row may
  // name one (`T002`) in place of the semantic key it resolves to.
  if (Array.isArray(amendment?.updateTasks)) {
    const keyById = new Map([...tasksByKey].filter(([, row]) => row.id)
      .map(([key, row]) => [row.id, key]));
    amendment = { ...amendment, updateTasks: amendment.updateTasks.map((row) => {
      const named = keyOf(row);
      const resolved = !tasksByKey.has(named) && keyById.get(named.toUpperCase());
      return resolved ? { ...row, key: resolved } : row;
    }) };
  }

  // Outcome never changes in place. Verify, paths, and dependencies change in
  // place only on an unfinished task (unchecked and without a passing command
  // receipt), or on a completed one that `reopen: true` unticks so the
  // harness verifies it again: a changed check never keeps a completed status.
  const proven = new Set(stringList(provenClaimIds));
  const completedTask = (line) => taskCompleted(line) ||
    taskClaims(line).some((id) => proven.has(id));
  const taskContractChanges = [];
  for (const [index, update] of (Array.isArray(amendment?.updateTasks)
    ? amendment.updateTasks : []).entries()) {
    const row = tasksByKey.get(keyOf(update));
    const completed = row && completedTask(row.line);
    const changes = {};
    if (row && typeof update?.verify === "string" && update.verify.trim() !== taskVerify(row.line)) {
      changes.verify = update.verify.trim();
      changes.priorVerify = taskVerify(row.line) || null;
    }
    if (row && Array.isArray(update?.paths) &&
        JSON.stringify(stringList(update.paths)) !== JSON.stringify(taskPaths(row.line)))
      changes.paths = stringList(update.paths);
    if (row && Array.isArray(update?.dependsOn)) {
      const references = stringList(update.dependsOn);
      const unknown = references.filter((reference) => !resolveTaskId(reference));
      const dependsOn = unique(references.map(resolveTaskId).filter(Boolean));
      if (unknown.length)
        issues.push(`semantic amendment updateTasks[${index}].dependsOn references unknown ` +
          `task(s): ${unknown.join(", ")}`);
      else if (dependsOn.includes(row.id))
        issues.push(`semantic amendment updateTasks[${index}].dependsOn cannot name the task itself`);
      else if (JSON.stringify(dependsOn) !== JSON.stringify(taskDepends(row.line)))
        changes.dependsOn = dependsOn;
    }
    const reopening = Boolean(completed && update?.reopen === true &&
      TASK_CONTRACT_FIELDS.some((field) => hasField(changes, field)));
    const unsupported = [
      ...(hasField(update, "outcome") ? ["outcome"] : []),
      ...(completed && !reopening
        ? TASK_CONTRACT_FIELDS.filter((field) => hasField(changes, field)) : [])
    ];
    // Name the state that made the task complete: a sandbox copy can be ticked
    // while the main tree is not, and a receipt can complete an unticked task.
    const completedBecause = !completed ? "" : taskCompleted(row.line)
      ? ` (task '${keyOf(update)}' (${row.id}) counts as completed because it is ticked in ` +
        "the agreement's tasks.md)"
      : ` (task '${keyOf(update)}' (${row.id}) counts as completed because its claims ` +
        "already have a passing command receipt)";
    if (unsupported.length)
      issues.push(`semantic amendment updateTasks[${index}] cannot replace ${
        unsupported.join(" or ")}; add a new task so completed work keeps its meaning` +
        (unsupported.includes("outcome") ? "" : ", or set \"reopen\": true to re-open the " +
          `task so the harness verifies it again${completedBecause}`));
    else if (row && Object.keys(changes).length)
      taskContractChanges.push({ key: keyOf(update), index: row.index, ...changes,
        ...(reopening ? { reopened: true } : {}) });
  }

  // Only unfinished work can be withdrawn. A task another task depends on
  // stays unless that dependent is withdrawn too or its dependsOn is updated.
  const removalRefs = amendmentList(amendment, "removeTasks").map(removalRef).filter(Boolean);
  const removedTaskRows = [];
  for (const reference of unique(removalRefs)) {
    const id = resolveTaskId(reference);
    const row = id ? tasksById.get(id) : null;
    if (!row) {
      issues.push(`amendment removeTasks references unknown task '${reference}'`);
      continue;
    }
    if (removedTaskRows.some((removed) => removed.id === row.id)) continue;
    if (completedTask(row.line)) {
      issues.push(`amendment cannot remove completed task '${row.key || row.id}' (${row.id}); ` +
        "completed work keeps its meaning, so remove its requirement or start a successor change");
      continue;
    }
    if ((amendment.updateTasks || []).some((update) => resolveTaskId(keyOf(update)) === row.id))
      issues.push(`amendment cannot both update and remove task '${row.key || row.id}'`);
    removedTaskRows.push({ ...row, claims: taskClaims(row.line), verify: taskVerify(row.line) });
  }
  const removedTaskIds = new Set(removedTaskRows.map((row) => row.id));
  if (taskContractOnlyAmendment(amendment) && !taskContractChanges.length &&
      !removalRefs.length && !amendmentList(amendment, "addTasks").length &&
      (amendment.updateTasks || []).every((update) => tasksByKey.has(keyOf(update))) &&
      !issues.some((issue) => issue.startsWith("semantic amendment updateTasks[")))
    issues.push("semantic amendment updateTasks changes no verify command or paths (or dependencies)");
  for (const change of taskContractChanges) {
    let line = taskLines[change.index];
    if (change.verify !== undefined) line = replaceTaskVerify(line, change.verify);
    if (change.paths !== undefined) line = replaceTaskPaths(line, change.paths);
    if (change.dependsOn !== undefined) line = replaceTaskDepends(line, change.dependsOn);
    if (change.reopened) line = reopenTask(line);
    taskLines[change.index] = line;
    tasksByKey.set(change.key, { ...tasksByKey.get(change.key), line });
  }
  for (const line of taskLines) {
    const id = taskId(line);
    if (!id || removedTaskIds.has(id)) continue;
    const blocked = taskDepends(line).filter((dependency) => removedTaskIds.has(dependency));
    if (blocked.length)
      issues.push(`amendment cannot remove ${blocked.join(", ")}: task ${id} depends on it; ` +
        `remove ${id} too or update its dependsOn`);
  }
  for (const task of amendmentList(amendment, "addTasks"))
    for (const dependency of stringList(task?.dependsOn))
      if (removedTaskIds.has(resolveTaskId(dependency)))
        issues.push(`amendment task '${keyOf(task)}' depends on removed task '${dependency}'`);
  // Removed lines (and their indented detail lines) leave the ledger last, so
  // every index above stays valid while the amendment is checked.
  for (const row of removedTaskRows) {
    taskLines[row.index] = null;
    for (let next = row.index + 1; next < taskLines.length; next += 1) {
      const line = taskLines[next];
      if (line === null || taskId(line) || !/^\s+\S/.test(line)) break;
      taskLines[next] = null;
    }
    if (row.key) tasksByKey.delete(row.key);
  }

  const addRequirements = amendmentList(amendment, "addRequirements");
  const reviseRequirements = amendmentList(amendment, "reviseRequirements");
  const removeRequirements = amendmentList(amendment, "removeRequirements");
  const addedKeys = new Set(addRequirements.map(keyOf));
  const revisedKeys = new Set(reviseRequirements.map(keyOf).filter(Boolean));
  const removedKeys = new Set(removeRequirements.map(keyOf).filter(Boolean));
  const changedKeys = new Set([...addedKeys, ...revisedKeys]);
  const named = [...addRequirements, ...reviseRequirements, ...removeRequirements]
    .map(keyOf).filter(Boolean);
  for (const key of unique(named.filter((key, index) => named.indexOf(key) !== index)))
    issues.push(`amendment requirement '${key}' is named more than once across ` +
      "add, revise, and remove");
  for (const key of addedKeys)
    if (claimsByRequirement.has(key)) issues.push(`amendment requirement '${key}' already exists`);
  for (const key of [...revisedKeys, ...removedKeys])
    if (!claimsByRequirement.has(key))
      issues.push(`amendment requirement '${key}' does not exist; only existing ` +
        "requirements can be revised or removed");
  const retiredClaimIds = new Set([...revisedKeys, ...removedKeys]
    .flatMap((key) => claimsByRequirement.get(key) || []));

  const updateKeys = new Set((amendment.updateTasks || []).map(keyOf));
  const coverageTasks = [
    ...(amendment.updateTasks || []).map((task) => ({
      key: task.key,
      outcome: `Extend ${task.key}`,
      verify: taskVerify(tasksByKey.get(task.key)?.line),
      covers: stringList(task.covers).filter((key) => changedKeys.has(key))
    })),
    ...(amendment.addTasks || []).map((task) => ({ ...task, dependsOn: [] })),
    // Existing tasks bound to a revised requirement keep covering it.
    ...[...tasksByKey].filter(([key]) => !updateKeys.has(key)).map(([key, row]) => ({
      key,
      outcome: `Keep ${key}`,
      verify: taskVerify(row.line) || "existing",
      covers: [...revisedKeys].filter((requirement) =>
        (claimsByRequirement.get(requirement) || [])
          .some((id) => taskClaims(row.line).includes(id)))
    }))
  ].filter((task) => stringList(task.covers).some((key) => changedKeys.has(key)));
  // A removal-only amendment adds no semantic rows, so there is nothing to
  // normalize; the prior discovery coverage stays in the proposal.
  const normalized = !changedKeys.size ? {
    issues: [], draft: { claims: [], specs: [], execution: { providers: {} } }
  } : normalizeSemanticDraft({
    version: compileVersion,
    intent: amendment.reason || "Amend the active agreement",
    impact: amendment.impact || "low",
    requirements: [...addRequirements,
      ...reviseRequirements.map((row) => ({ ...row, _revision: true }))],
    tasks: coverageTasks,
    evidence: amendment.evidence,
    integrations: amendment.integrations || [],
    securityTriggers: amendment.securityTriggers || [],
    riskSignals: amendment.riskSignals || [],
    externalOperations: amendment.externalOperations || [],
    ...(amendment.capabilityOverviews && typeof amendment.capabilityOverviews === "object"
      ? { capabilityOverviews: amendment.capabilityOverviews } : {}),
    discovery: amendment.discovery
  }, slugify, {
    ...(loadCanonicalSpec ? { loadCanonicalSpec } : {}),
    // Derived IDs for new scenarios step around the claims this change keeps.
    reservedClaimIds: [...priorClaimById.keys()].filter((id) => !retiredClaimIds.has(id))
  });
  issues.push(...normalized.issues.map((issue) => `amendment ${issue}`));
  const duplicateClaims = normalized.draft.claims
    .map((claim) => claim.id).filter((id) => priorClaimById.has(id) && !retiredClaimIds.has(id));
  if (duplicateClaims.length)
    issues.push(`amendment derives existing claim ID(s): ${unique(duplicateClaims).join(", ")}`);

  for (const update of amendment.updateTasks || []) {
    const key = String(update?.key || "").trim();
    if (!tasksByKey.has(key)) issues.push(`amendment updateTasks references unknown task '${key}'`);
    for (const covered of stringList(update?.covers)) {
      if (removedKeys.has(covered))
        issues.push(`amendment task '${key}' covers removed requirement '${covered}'`);
      else if (!changedKeys.has(covered) && !claimsByRequirement.has(covered))
        issues.push(`amendment task '${key}' covers unknown requirement '${covered}'`);
    }
  }
  for (const task of amendment.addTasks || []) {
    const key = String(task?.key || "").trim();
    if (tasksByKey.has(key)) issues.push(`amendment addTasks key '${key}' already exists`);
    if (!stringList(task?.covers).length)
      issues.push(`amendment task '${key}' must cover at least one requirement`);
    for (const covered of stringList(task?.covers)) {
      if (removedKeys.has(covered))
        issues.push(`amendment task '${key}' covers removed requirement '${covered}'`);
      else if (!changedKeys.has(covered) && !claimsByRequirement.has(covered))
        issues.push(`amendment task '${key}' covers unknown requirement '${covered}'`);
    }
    for (const dependency of stringList(task?.dependsOn))
      if (!tasksByKey.has(dependency) &&
          !(amendment.addTasks || []).some((candidate) => candidate.key === dependency))
        issues.push(`amendment task '${key}' depends on unknown task '${dependency}'`);
  }

  // A revised requirement changes behavior that completed work did not build,
  // so it needs at least one open task rather than a silently reopened one.
  const openCoverage = new Set();
  for (const task of amendment.addTasks || []) stringList(task.covers).forEach((key) => openCoverage.add(key));
  for (const update of amendment.updateTasks || []) {
    const row = tasksByKey.get(keyOf(update));
    if (row && !taskCompleted(row.line)) stringList(update.covers).forEach((key) => openCoverage.add(key));
  }
  for (const line of taskLines) {
    if (!taskId(line) || taskCompleted(line)) continue;
    for (const key of revisedKeys)
      if ((claimsByRequirement.get(key) || []).some((id) => taskClaims(line).includes(id)))
        openCoverage.add(key);
  }
  for (const key of revisedKeys)
    if (!openCoverage.has(key))
      issues.push(`amendment revises '${key}' but no open task covers it; add a task ` +
        "with addTasks so completed tasks keep their meaning");

  const addedClaimsByRequirement = new Map();
  for (const claim of normalized.draft.claims)
    addedClaimsByRequirement.set(claim.requirementKey, [
      ...(addedClaimsByRequirement.get(claim.requirementKey) || []), claim.id
    ]);
  const claimsFor = (key) => addedClaimsByRequirement.get(key) ||
    (removedKeys.has(key) ? [] : claimsByRequirement.get(key)) || [];
  const allClaimsFor = (keys) => unique(stringList(keys).flatMap(claimsFor));
  const replaceClaimIds = (ids) => unique(ids.flatMap((id) => {
    if (!retiredClaimIds.has(id)) return [id];
    const key = priorClaimById.get(id)?.requirementKey;
    return revisedKeys.has(key) ? claimsFor(key) : [];
  }));

  const updates = new Map((amendment.updateTasks || []).map((task) => [keyOf(task), task]));
  const orphaned = [];
  for (const [index, line] of taskLines.entries()) {
    if (!taskId(line)) continue;
    const current = taskClaims(line);
    const update = updates.get(semanticTaskKey(line));
    if (!update && !current.some((id) => retiredClaimIds.has(id))) continue;
    const next = unique([...replaceClaimIds(current),
      ...(update ? allClaimsFor(update.covers) : [])]);
    if (current.length && !next.length) orphaned.push(taskId(line));
    taskLines[index] = updateTaskClaimAnnotation(line, next);
  }
  if (orphaned.length)
    issues.push(`amendment would leave task(s) ${orphaned.join(", ")} without requirement ` +
      "coverage; move their coverage with updateTasks");
  // A withdrawn task must not take the last implementation of a claim with it.
  if (removedTaskRows.length) {
    const remaining = new Set([
      ...taskLines.filter((line) => line !== null && taskId(line)).flatMap(taskClaims),
      ...amendmentList(amendment, "addTasks").flatMap((task) => allClaimsFor(task?.covers))
    ]);
    for (const row of removedTaskRows) {
      const uncovered = replaceClaimIds(row.claims).filter((id) => !remaining.has(id));
      if (uncovered.length)
        issues.push(`amendment cannot remove task '${row.key || row.id}' (${row.id}): claim(s) ` +
          `${uncovered.join(", ")} would have no task; move them with updateTasks covers, ` +
          "add a task, or remove the requirement with removeRequirements");
    }
  }
  issues.push(...amendedTaskCycleIssues(taskLines, amendmentList(amendment, "addTasks"),
    resolveTaskId));
  if (issues.length) return { issues };

  const newTasks = [];
  const allocated = new Map(tasksByKey);
  for (const task of amendment.addTasks || []) {
    maxTask += 1;
    const id = `T${String(maxTask).padStart(3, "0")}`;
    allocated.set(task.key, { id });
    newTasks.push({ ...task, id, semanticKey: task.key, claims: allClaimsFor(task.covers) });
  }
  for (const task of newTasks)
    task.dependsOn = stringList(task.dependsOn).map((key) => allocated.get(key)?.id);
  if (newTasks.length && (Array.isArray(repositories) || Array.isArray(repositorySelection))) {
    const ordered = deriveAmendmentTaskDependencies(newTasks.map((task) => ({
      id: task.id, semanticKey: task.semanticKey,
      repository: String(task.repository || "").trim() || "root", dependsOn: task.dependsOn
    })), tasksContent, { repositories: repositories || [], selection: repositorySelection });
    if (ordered.issues.length) return { issues: ordered.issues };
    ordered.tasks.forEach((row, index) => { newTasks[index].dependsOn = row.dependsOn; });
  }
  const renderedNewTasks = newTasks.map((task, index) => renderTask(task, maxTask + index));
  let nextTasks = taskLines.filter((line) => line !== null).join("\n").replace(/\s+$/, "");
  if (renderedNewTasks.length) nextTasks += `\n${renderedNewTasks.join("\n")}`;
  nextTasks += "\n";

  const providers = {};
  for (const [name, config] of Object.entries(contract.providers || {}))
    providers[name] = Array.isArray(config?.claims)
      ? { ...config, claims: replaceClaimIds(config.claims) } : config;
  const allChain = combinedChain(nextTasks);
  const allCommand = allChain.command;
  for (const [name, config] of Object.entries(normalized.draft.execution.providers || {})) {
    if (providers[name]) {
      if (providers[name].command && ["command", "test-discovery"].includes(providers[name].adapter))
        providers[name] = withChain(providers[name], allChain);
      continue;
    }
    // The agreement already names who proves this capability, and where; a
    // second provider derived here would run the same verifies somewhere else.
    const capability = providerCapability(name, config);
    const serving = Object.keys(providers).filter((other) =>
      providerCapability(other, providers[other]) === capability);
    const sameRepository = serving.filter((other) =>
      (providers[other].repository || null) === (config.repository || null));
    const reused = serving.length === 1 ? serving[0]
      : sameRepository.length === 1 ? sameRepository[0] : null;
    if (reused) {
      if (Array.isArray(providers[reused].claims))
        providers[reused] = { ...providers[reused], claims: unique([
          ...providers[reused].claims,
          ...normalized.draft.claims.filter((claim) => (claim.capabilities || []).includes(capability))
            .map((claim) => claim.id)
        ]) };
      continue;
    }
    if (serving.length) {
      issues.push(`amendment cannot choose which provider proves capability '${capability}': ` +
        `${serving.join(", ")} all serve it; declare the provider for these claims in the ` +
        "change's execution providers, then amend again");
      continue;
    }
    providers[name] = { ...config, command: config.command ? allCommand : undefined };
  }
  if (issues.length) return { issues };
  // A provider command derived from the task verify commands follows them;
  // an explicitly configured command stays as the author wrote it.
  if (taskContractChanges.some((change) => change.verify !== undefined) ||
      removedTaskRows.length) {
    const priorCommand = JSON.stringify(combinedCommand(tasksContent));
    for (const [name, config] of Object.entries(providers))
      if (["command", "test-discovery"].includes(config?.adapter) &&
          JSON.stringify(config.command) === priorCommand)
        providers[name] = withChain(config, allChain);
  }
  const taskContractTasks = taskContractChanges.map((change) => {
    const line = taskLines[change.index];
    return {
      key: change.key, id: taskId(line), claims: taskClaims(line),
      // The prior command stays in the amendment audit, so a corrected check
      // is reviewable against the one it replaced.
      ...(change.verify !== undefined
        ? { verify: change.verify, priorVerify: change.priorVerify } : {}),
      ...(change.paths !== undefined ? { paths: change.paths } : {}),
      ...(change.dependsOn !== undefined ? { dependsOn: change.dependsOn } : {}),
      ...(change.reopened ? { reopened: true } : {})
    };
  });
  const taskContractClaimIds = unique(taskContractTasks.flatMap((task) => task.claims));
  // The audit keeps what a withdrawn task promised; its claims are proven
  // again by the tasks that now carry them.
  const removedTasks = removedTaskRows.map((row) => ({
    key: row.key || null, id: row.id, claims: row.claims, verify: row.verify || null
  }));
  const removedTaskClaimIds = unique(removedTaskRows.flatMap((row) => replaceClaimIds(row.claims)));
  const priorScenarios = (key) => (claimsByRequirement.get(key) || [])
    .map((id) => priorClaimById.get(id)?.scenario).filter(Boolean);
  const specs = normalized.draft.specs;
  const nextClaims = [
    ...existingClaims.filter((claim) => !retiredClaimIds.has(claim.id)),
    ...normalized.draft.claims
  ];
  const nextClaimIds = new Set(nextClaims.map((claim) => claim.id));
  const addedClaimIds = [...addedKeys].flatMap((key) => addedClaimsByRequirement.get(key) || []);
  const changedClaimIds = [...revisedKeys].flatMap((key) => addedClaimsByRequirement.get(key) || []);
  const addedTaskClaimIds = unique(newTasks.flatMap((task) => task.claims));
  return {
    issues: [],
    tasksContent: nextTasks,
    claims: nextClaims,
    providers,
    specs: specs.slice(0, addRequirements.length),
    revisedSpecs: specs.slice(addRequirements.length).map((spec, index) => ({
      key: keyOf(reviseRequirements[index]),
      spec,
      explicitTitle: Boolean(String(reviseRequirements[index]?.requirement ||
        reviseRequirements[index]?.title || "").trim()),
      priorScenarios: priorScenarios(keyOf(reviseRequirements[index]))
    })),
    removedRequirements: removeRequirements.map((row) => ({
      key: keyOf(row),
      migration: String(row.migration).trim(),
      priorScenarios: priorScenarios(keyOf(row))
    })),
    discovery: normalized.draft.discovery,
    // The compiled added and revised requirements, for the scenario-test binding.
    bindingDraft: normalized.draft,
    investigationAgreement,
    amendmentReason: amendment.reason || "Agreement expanded during Build",
    // Outline sections this amendment replaces in place (design.md, proposal.md).
    sections: amendmentList(amendment, "sections").map((section) => ({
      ...section, document: String(section.document).trim(), key: String(section.key).trim()
    })),
    // A new task's claims are proven again with it, even for a requirement the
    // agreement already had.
    invalidatedClaims: unique([...addedClaimIds, ...changedClaimIds, ...taskContractClaimIds,
      ...removedTaskClaimIds, ...addedTaskClaimIds]),
    addedTaskClaimIds,
    addedClaimIds,
    changedClaimIds,
    taskContractChanges: taskContractTasks,
    taskContractClaimIds,
    removedTasks,
    removedTaskClaimIds,
    removedClaimIds: [...retiredClaimIds].filter((id) => !nextClaimIds.has(id)),
    priorClaims: existingClaims,
    addedRequirementKeys: [...addedKeys],
    revisedRequirementKeys: [...revisedKeys],
    removedRequirementKeys: [...removedKeys]
  };
}

function specFiles(dir) {
  const root = join(dir, "specs");
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name, "spec.md"))
    .filter((path) => existsSync(path)).sort();
}

// Exactly one block across the change's spec files must carry the key's prior
// scenario set; zero or several matches fail the amendment rather than
// rewriting a sibling requirement.
function rewriteRequirementBlock(dir, key, scenarios, replacement, target = null) {
  const candidates = specFiles(dir).flatMap((path) => {
    const content = readFileSync(path, "utf8");
    const lines = content.split("\n");
    return requirementBlocks(content, scenarios).matches.map((match) => ({
      path, content, operation: match.operation,
      name: lines[match.start].match(/^###\s+Requirement:\s*(.+?)\s*$/)?.[1] || ""
    }));
  });
  if (candidates.length !== 1)
    throw new Error(`amendment cannot identify the requirement block for '${key}': ` +
      `${candidates.length} blocks carry its scenarios (${stringList(scenarios).join(", ") || "none"})`);
  const [{ path, content, operation, name }] = candidates;
  // A revision replaces the block in place, so it must stay in the same
  // capability delta and operation section; moving it is a remove plus an add.
  if (target) {
    const capability = join(path, "..").split(/[\\/]/).pop();
    const nextOperation = String(target.operation || "added").toLowerCase();
    if (capability !== target.capability || operation !== nextOperation)
      throw new Error(`amendment cannot revise '${key}' from ${capability}/${operation || "unknown"} ` +
        `to ${target.capability}/${nextOperation}; remove it and add a new requirement instead`);
  }
  const result = replaceRequirementBlock(content, scenarios,
    typeof replacement === "function" ? replacement(name) : replacement);
  if (/^###\s+Requirement:/m.test(result.content)) writeFileSync(path, result.content);
  else {
    // A delta file with no requirement left is not a valid OpenSpec delta.
    rmSync(path, { force: true });
    const capabilityDir = join(path, "..");
    if (!readdirSync(capabilityDir).length) rmSync(capabilityDir, { recursive: true, force: true });
  }
}

// Every proposal and design edit is computed before any file is written, so a
// section that cannot be placed leaves the packet unchanged; the caller stages
// the packet and rolls back if a later spec rewrite fails.
export function writeSemanticAmendment(dir, compiled, slugify, {
  schema, revision = null, date = null
} = {}) {
  const proposalPath = join(dir, "proposal.md");
  const designPath = join(dir, "design.md");
  const writes = new Map();
  const read = (path) => writes.has(path) ? writes.get(path) : readFileSync(path, "utf8");
  const sections = Array.isArray(compiled.sections) ? compiled.sections : [];
  const sectionIssues = amendmentSectionIssues({ sections });
  if (sectionIssues.length) throw new Error(sectionIssues.join("; "));
  for (const section of sections) {
    const path = section.document === "design" ? designPath : proposalPath;
    if (!existsSync(path))
      throw new Error(`amendment section ${section.document} '${section.key}' needs ` +
        `${section.document}.md, which this change does not have`);
    const content = read(path);
    writes.set(path, replaceOutlineSection(content, section,
      packetLanguage(content, compiled.investigationAgreement?.language)));
  }
  if (existsSync(proposalPath)) {
    let proposal = read(proposalPath);
    if (compiled.investigationAgreement)
      proposal = replaceInvestigation(proposal, compiled.investigationAgreement);
    if (compiled.discovery?.coverage?.length) proposal = replaceDiscoveryDelta(proposal, compiled);
    if (compiled.removedRequirements?.length) proposal = replaceRemovedRequirements(proposal, compiled);
    writes.set(proposalPath, appendAmendmentHistory(proposal, compiled, { revision, date }));
  }
  for (const [path, content] of writes) writeFileSync(path, content);
  writeFileSync(join(dir, "tasks.md"), compiled.tasksContent);
  const evidencePath = join(dir, "evidence.yaml");
  const contract = JSON.parse(readFileSync(evidencePath, "utf8"));
  contract.claims = compiled.claims;
  contract.providers = compiled.providers;
  writeFileSync(evidencePath, `${JSON.stringify(contract, null, 2)}\n`);
  // A legacy rapid agreement (skip_specs) carries its scenarios in
  // evidence.yaml only; writing a delta beside skip_specs creates an
  // unmergeable packet. A compiled rapid packet has deltas and amends them.
  const marker = existsSync(join(dir, ".openspec.yaml"))
    ? readFileSync(join(dir, ".openspec.yaml"), "utf8") : "skip_specs: true";
  if (schema === "foundation-rapid" && /^\s*skip_specs:\s*true\s*$/m.test(marker)) return;
  const appendSpec = (spec) => {
    const capability = slugify(spec.name);
    const specDir = join(dir, "specs", capability);
    mkdirSync(specDir, { recursive: true });
    const specPath = join(specDir, "spec.md");
    // A capability with no living spec states its Purpose, as start does.
    const current = existsSync(specPath) ? readFileSync(specPath, "utf8")
      : `${renderSpecHeading({ name: spec.name, purpose: spec.purpose }, {
        newCapability: !existsSync(join(dir, "..", "..", "specs", capability, "spec.md"))
      })}\n`;
    writeFileSync(specPath, appendRequirementToSpec(current, spec));
  };
  for (const spec of compiled.specs) appendSpec(spec);
  for (const row of compiled.revisedSpecs || [])
    // A revision without its own title keeps the requirement's heading, so a
    // derived title is not replaced by the key.
    rewriteRequirementBlock(dir, row.key, row.priorScenarios, (priorName) => renderRequirement(
      row.explicitTitle || !priorName ? row.spec : { ...row.spec, requirement: priorName }), {
      capability: slugify(row.spec.name), operation: row.spec.operation
    });
  for (const row of compiled.removedRequirements || [])
    rewriteRequirementBlock(dir, row.key, row.priorScenarios, null);
}
