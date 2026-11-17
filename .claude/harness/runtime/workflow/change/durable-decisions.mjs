

// Supersession links and human context are optional: an absent link means
// none, so a compiled design shows only the fields a reader needs.
const DURABLE_DECISION_REQUIRED = ["Status", "Decision", "Why", "Rejected", "Consequences"];

const DURABLE_DECISION_FIELDS = [
  ...DURABLE_DECISION_REQUIRED, "Supersedes", "Superseded by",
  "Context", "Decided by", "Decision ref"
];

export function durableDecisionSection(content) {
  const text = String(content || "");
  // A compiled design omits the section when the change records no durable
  // decision; a hand-authored one may still end it with the next heading.
  if (!/^## Decisions\s*$/m.test(text)) return { issues: [] };
  const rawSection = text.match(
    /^## Decisions\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m
  )?.[1]?.trim();
  if (!rawSection)
    return { issues: ["design.md Decisions section is empty; list decisions or `none`"] };
  const section = rawSection.replace(/<!--[\s\S]*?-->/g, "").trim();
  if (/^`?none`?[.!]?$/i.test(section)) return { issues: [] };
  if (/^- \*\*Decision:\*\*/m.test(section))
    return { issues: [
      "every durable decision requires Decision ID metadata; legacy Decision entries are not allowed"
    ] };
  const starts = [...section.matchAll(/^- \*\*Decision ID:\*\*\s*(\S.*?)\s*$/gm)];
  if (!starts.length)
    return { issues: [
      "each durable decision requires a stable Decision ID or the section must be `none`"
    ] };
  return { issues: null, section, starts };
}

export function durableDecisionValues(block) {
  return Object.fromEntries(DURABLE_DECISION_FIELDS.map((field) => [field,
    block.match(new RegExp(
      `^\\s+- \\*\\*${field}:\\*\\*\\s*(.+?)\\s*$`, "mi"))?.[1]?.trim()
  ]));
}

export function durableDecisionBlockIssues(block, id, ids, values) {
  const issues = [];
  const label = `decision '${id}'`;
  if (!/^DEC-[A-Z0-9][A-Z0-9-]*$/i.test(id))
    issues.push(`${label} ID must match DEC-<stable-id>`);
  if (ids.has(id.toUpperCase())) issues.push(`${label} is duplicated`);
  const allowedLine = new RegExp(
    `^(?:- \\*\\*Decision ID:\\*\\*|\\s+- \\*\\*(?:${DURABLE_DECISION_FIELDS.join("|")}):\\*\\*)`
  );
  if (block.split("\n").some((line) => line.trim() && !allowedLine.test(line)))
    issues.push(`${label} contains content outside its metadata fields`);
  for (const field of DURABLE_DECISION_REQUIRED)
    if (!values[field]) issues.push(`${label} requires ${field}`);
  if (values.Status && !["accepted", "superseded"].includes(values.Status.toLowerCase()))
    issues.push(`${label} Status must be accepted|superseded`);
  return issues;
}

export function parseDurableDecisions(section, starts) {
  const issues = starts[0].index !== 0
    ? ["Decisions contains content outside a Decision ID block"] : [];
  const ids = new Set();
  const decisions = [];
  for (const [index, start] of starts.entries()) {
    const end = starts[index + 1]?.index ?? section.length;
    const block = section.slice(start.index, end);
    const id = start[1].trim();
    const values = durableDecisionValues(block);
    issues.push(...durableDecisionBlockIssues(block, id, ids, values));
    ids.add(id.toUpperCase());
    decisions.push({ id: id.toUpperCase(), label: `decision '${id}'`, values });
  }
  return { issues, decisions };
}

const DURABLE_DECISION_REFERENCE =
  /^(?:[a-z0-9][a-z0-9._-]*#)?DEC-[A-Z0-9][A-Z0-9-]*$/i;

export function localDecisionReference(value) {
  return !value.includes("#") ? value.toUpperCase() : null;
}

export function durableDecisionReferenceIssues(decision, field, value, byId) {
  if (/^none$/i.test(value)) return [];
  if (!DURABLE_DECISION_REFERENCE.test(value))
    return [`${decision.label} ${field} must be none, DEC-<id>, or <change>#DEC-<id>`];
  const local = localDecisionReference(value);
  const issues = [];
  if (local === decision.id)
    issues.push(`${decision.label} ${field} cannot reference itself`);
  if (local && !byId.has(local))
    issues.push(`${decision.label} ${field} references unknown local decision '${value}'`);
  return issues;
}

export function durableDecisionStatusIssues(decision, supersededBy) {
  const status = decision.values.Status?.toLowerCase();
  const issues = [];
  if (status === "superseded" && /^none$/i.test(supersededBy))
    issues.push(`${decision.label} with superseded status must name its replacement`);
  if (status === "accepted" && !/^none$/i.test(supersededBy))
    issues.push(`${decision.label} naming Superseded by must have superseded status`);
  return issues;
}

export function durableDecisionReciprocityIssues(
  decision, supersedes, supersededBy, byId
) {
  const issues = [];
  const supersedesLocal = !/^none$/i.test(supersedes)
    ? localDecisionReference(supersedes) : null;
  if (supersedesLocal && byId.has(supersedesLocal) &&
      byId.get(supersedesLocal).values["Superseded by"]?.toUpperCase() !== decision.id)
    issues.push(`${decision.label} Supersedes '${supersedes}' requires a reciprocal Superseded by link`);
  const supersededByLocal = !/^none$/i.test(supersededBy)
    ? localDecisionReference(supersededBy) : null;
  if (supersededByLocal && byId.has(supersededByLocal) &&
      byId.get(supersededByLocal).values.Supersedes?.toUpperCase() !== decision.id)
    issues.push(`${decision.label} Superseded by '${supersededBy}' requires a reciprocal Supersedes link`);
  return issues;
}

export function durableDecisionGraphIssues(decisions) {
  const issues = [];
  const byId = new Map(decisions.map((decision) => [decision.id, decision]));
  for (const decision of decisions) {
    const supersedes = decision.values.Supersedes || "none";
    const supersededBy = decision.values["Superseded by"] || "none";
    issues.push(...durableDecisionReferenceIssues(
      decision, "Supersedes", supersedes, byId));
    issues.push(...durableDecisionReferenceIssues(
      decision, "Superseded by", supersededBy, byId));
    issues.push(...durableDecisionStatusIssues(decision, supersededBy));
    issues.push(...durableDecisionReciprocityIssues(
      decision, supersedes, supersededBy, byId));
  }
  return issues;
}

export function durableDecisionMetadataIssues(content) {
  const section = durableDecisionSection(content);
  if (section.issues) return section.issues;
  const parsed = parseDurableDecisions(section.section, section.starts);
  return [...parsed.issues, ...durableDecisionGraphIssues(parsed.decisions)];
}
