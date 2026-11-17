import { renderRequirementMarkdown, renderSpecHeading } from "./semantic-draft.mjs";
import { verifyChain } from "./semantic-draft-tasks.mjs";
import { unique } from "../../core/values.mjs";

export const stringList = (value) => Array.isArray(value)
  ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];

export const markdownCell = (value) => String(value ?? "")
  .replace(/\r?\n/g, " ").replaceAll("|", "\\|");

export const keyOf = (row) => String(row?.key || "").trim();

export function semanticTaskKey(line) {
  return String(line).match(/\[key:([^\]]+)\]/i)?.[1]?.trim() || null;
}

export function taskId(line) {
  return String(line).match(/^\s*-\s*\[[ xX]\]\s*\*{0,2}(T\d{3,})\*{0,2}\b/i)?.[1]
    ?.toUpperCase() || null;
}

export function taskCompleted(line) {
  return /^\s*-\s*\[[xX]\]/.test(String(line));
}

export function taskClaims(line) {
  return stringList(String(line).match(/\[claims:([^\]]*)\]/i)?.[1]?.split(","));
}

export function taskVerify(line) {
  return String(line).match(/—\s*verify:\s*`([^`]+)`/i)?.[1]?.trim() || "";
}

export function taskPaths(line) {
  return stringList(String(line).match(/\[paths:([^\]]*)\]/i)?.[1]?.split(","));
}

export function replaceTaskVerify(line, verify) {
  return /—\s*verify:\s*`[^`]+`/i.test(line)
    ? line.replace(/—\s*verify:\s*`[^`]+`/i, `— verify: \`${verify}\``)
    : `${line.trimEnd()} — verify: \`${verify}\``;
}

export function replaceTaskPaths(line, paths) {
  const annotation = paths.length ? `[paths:${paths.join(",")}]` : "";
  if (/\[paths:[^\]]*\]/i.test(line))
    return line.replace(/ ?\[paths:[^\]]*\]/i, annotation ? ` ${annotation}` : "");
  if (!annotation) return line;
  const marker = line.indexOf(" — verify:");
  return marker < 0
    ? `${line.trimEnd()} ${annotation}`
    : `${line.slice(0, marker).trimEnd()} ${annotation}${line.slice(marker)}`;
}

export function taskDepends(line) {
  return stringList(String(line).match(/\[depends:([^\]]*)\]/i)?.[1]?.split(","))
    .map((id) => id.toUpperCase());
}

export function replaceTaskDepends(line, ids) {
  const annotation = ids.length ? `[depends:${ids.join(",")}]` : "";
  if (/\[depends:[^\]]*\]/i.test(line))
    return line.replace(/ ?\[depends:[^\]]*\]/i, annotation ? ` ${annotation}` : "");
  if (!annotation) return line;
  const marker = line.indexOf(" — verify:");
  return marker < 0
    ? `${line.trimEnd()} ${annotation}`
    : `${line.slice(0, marker).trimEnd()} ${annotation}${line.slice(marker)}`;
}

// Re-opening unticks a completed task, so the harness must verify it again.
export function reopenTask(line) {
  return String(line).replace(/^(\s*-\s*\[)[xX](\])/, "$1 $2");
}

// The fields an update may change in place. On a completed task they change
// only with `reopen: true`, which unticks it so its claims are proven again.
export const TASK_CONTRACT_FIELDS = ["verify", "paths", "dependsOn"];

const TASK_ROW_FIELDS = ["key", ...TASK_CONTRACT_FIELDS, "reopen"];

export const hasField = (row, field) => Object.prototype.hasOwnProperty.call(row || {}, field);

export const removalRef = (row) => String(typeof row === "string" ? row : row?.key || "").trim();

/**
 * A task-contract amendment corrects the verify command (and optionally the
 * paths or dependencies) of existing tasks, or withdraws unfinished tasks
 * (`removeTasks`, which may move their coverage with `updateTasks` covers).
 * It carries no requirement change, so it needs no requirement, evidence, or
 * semantic-intake input.
 */
export function taskContractOnlyAmendment(amendment) {
  const updates = amendment?.updateTasks;
  const removals = amendment?.removeTasks;
  if (!["addRequirements", "reviseRequirements", "removeRequirements"]
    .every((field) => !amendmentList(amendment, field).length)) return false;
  if ((updates !== undefined && !Array.isArray(updates)) ||
      (removals !== undefined && !Array.isArray(removals))) return false;
  // A task added for a requirement the agreement already has changes no
  // requirement either; its covers are checked against the agreement later.
  const adding = amendmentList(amendment, "addTasks").length > 0;
  const rows = updates || [];
  const removing = (removals || []).length > 0;
  const fields = removing ? [...TASK_ROW_FIELDS, "covers"] : TASK_ROW_FIELDS;
  return (rows.length > 0 || removing || adding) &&
    rows.every((row) => row && typeof row === "object" && !Array.isArray(row) &&
      (hasField(row, "verify") || hasField(row, "dependsOn") ||
        (removing && hasField(row, "covers"))) &&
      Object.keys(row).every((field) => fields.includes(field)));
}

/**
 * The shape `change amend --template` prints; the verify-only form leads.
 * `save` comes first: the host refuses a shell-written JSON file, while the
 * file tool falls under the seeded `Edit(/.foundation/drafts/**)` rule.
 */
export function semanticAmendmentTemplate() {
  return {
    save: "Write one form below (its value, without the form name) with the Write tool to " +
      ".foundation/drafts/<change>-amendment.json; that path is pre-allowed and the tool " +
      "creates the folder. Do not save it through the shell (heredoc, cat >, echo >): the " +
      "host refuses those. Then run cloop change amend <change> " +
      ".foundation/drafts/<change>-amendment.json.",
    verifyOnly: {
      version: 1,
      reason: "Correct the verify command of an unfinished task",
      updateTasks: [{ key: "<existing-task-key>", verify: "<command>" }]
    },
    // A completed task's verify changes only by re-opening it, and only an
    // unfinished task can be withdrawn; neither changes a requirement.
    reopenCompleted: {
      version: 1,
      reason: "Correct the verify command of a completed task and verify it again",
      updateTasks: [{ key: "<completed-task-key>", verify: "<command>", reopen: true }]
    },
    removeUnfinished: {
      version: 1,
      reason: "<why the task is no longer needed>",
      removeTasks: ["<unfinished-task-key-or-id>"]
    },
    requirementChange: {
      version: 1,
      reason: "<what Build discovered>",
      addRequirements: [{
        key: "<new-requirement-key>", capability: "<capability>", operation: "added",
        scenarios: [{ name: "<scenario>", when: "<condition>", then: "<outcome>" }],
        outcome: "<observable outcome>"
      }],
      reviseRequirements: [],
      removeRequirements: [{ key: "<requirement-key>", migration: "<why and what replaces it>" }],
      updateTasks: [{ key: "<existing-task-key>", covers: ["<requirement-key>"] }],
      addTasks: [{
        key: "<new-task-key>", outcome: "<task outcome>", covers: ["<new-requirement-key>"],
        paths: ["<path/glob>"], verify: "<command>"
      }],
      evidence: { "<new-requirement-key>": { capabilities: ["test"] } }
    }
  };
}

export function updateTaskClaimAnnotation(line, claimIds) {
  const claims = `[claims:${unique(claimIds).join(",")}]`;
  if (/\[claims:[^\]]*\]/i.test(line))
    return line.replace(/\[claims:[^\]]*\]/i, claims);
  const marker = line.indexOf(" — verify:");
  return marker < 0
    ? `${line.trimEnd()} ${claims}`
    : `${line.slice(0, marker).trimEnd()} ${claims}${line.slice(marker)}`;
}

export const renderRequirement = (spec) => renderRequirementMarkdown(spec);

export function appendRequirementToSpec(content, spec) {
  const operation = String(spec.operation || "added").toUpperCase();
  const heading = `## ${operation} Requirements`;
  const rendered = renderRequirement(spec);
  const existing = String(content || "").replace(/\s+$/, "");
  // A new capability file starts with its human heading, as start renders it.
  const source = existing || renderSpecHeading(spec);
  const start = source.indexOf(heading);
  if (start < 0) return `${source}\n\n${heading}\n\n${rendered}\n`;
  const afterHeading = start + heading.length;
  const next = source.slice(afterHeading).search(/\n##\s+/);
  if (next < 0) return `${source}\n\n${rendered}\n`;
  const insertion = afterHeading + next;
  return `${source.slice(0, insertion).replace(/\s+$/, "")}\n\n${rendered}\n\n` +
    `${source.slice(insertion).replace(/^\s+/, "")}\n`;
}

/**
 * Locate the requirement blocks whose scenario set equals the named set. A
 * block runs from its `### Requirement:` heading to the next `##`/`###`
 * heading. Scenario names are unique only within a requirement, so a partial
 * overlap never identifies a block.
 */
export function requirementBlocks(content, scenarios) {
  const names = [...new Set(stringList(scenarios))].sort();
  const lines = String(content || "").split("\n");
  const matches = [];
  if (!names.length) return { lines, matches };
  let operation = null;
  for (let index = 0; index < lines.length; index += 1) {
    const section = lines[index].match(/^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements\s*$/i);
    if (section) { operation = section[1].toLowerCase(); continue; }
    if (/^##\s/.test(lines[index])) { operation = null; continue; }
    if (!/^###\s+Requirement:/.test(lines[index])) continue;
    let end = index + 1;
    while (end < lines.length && !/^##{1,2}\s/.test(lines[end])) end += 1;
    const own = [...new Set(lines.slice(index, end)
      .map((line) => line.match(/^####\s+Scenario:\s*(.+?)\s*$/)?.[1]).filter(Boolean))].sort();
    if (own.length === names.length && own.every((name, position) => name === names[position]))
      matches.push({ start: index, end, operation });
  }
  return { lines, matches };
}

/**
 * Replace (or, with a null replacement, delete) the one requirement block
 * whose scenario set equals the named set, preserving manual sections and
 * sibling requirements byte-for-byte.
 */
export function replaceRequirementBlock(content, scenarios, replacement) {
  const { lines, matches } = requirementBlocks(content, scenarios);
  if (matches.length !== 1) return { found: false, matches: matches.length, content: String(content || "") };
  const [{ start, end }] = matches;
  const inserted = replacement === null ? [] : String(replacement).split("\n");
  const rest = lines.slice(end);
  const next = [...lines.slice(0, start), ...inserted,
    ...(inserted.length && rest.length ? [""] : []), ...rest];
  let text = next.join("\n").replace(/\n{3,}/g, "\n\n");
  if (!text.endsWith("\n")) text += "\n";
  return { found: true, matches: 1, content: text };
}

export function combinedChain(tasksContent) {
  return verifyChain(unique(String(tasksContent).split("\n").map(taskVerify).filter(Boolean)));
}

export function combinedCommand(tasksContent) {
  return combinedChain(tasksContent).command;
}

// A rebuilt test provider carries the matching segments; a single verify has none.
export function withChain(config, chain) {
  const { segments: _prior, ...rest } = config;
  return { ...rest, command: chain.command,
    ...(chain.segments && config.adapter === "test-discovery" ? { segments: chain.segments } : {}) };
}

export function amendmentList(amendment, field) {
  return Array.isArray(amendment?.[field]) ? amendment[field] : [];
}
