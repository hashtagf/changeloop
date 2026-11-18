// Draft decisions: their statuses and metadata, the rationale applied to
// requirements, and how an agent-made or settled decision is told apart.
import { stringList, text, textList } from "./semantic-draft-text.mjs";

// Alternatives the decision set aside. Only a decision that rejected one owes
// a reason; a settled fact with nothing to choose between does not.
export function rejectedAlternatives(decision) {
  const choice = text(decision?.choice);
  const listed = decision?.rejected ?? decision?.alternatives;
  return (Array.isArray(listed) ? stringList(listed) : textList(listed))
    .filter((option) => option !== choice && !/^none$/i.test(option));
}

export const DECISION_STATUSES = Object.freeze(["proposed", "accepted", "superseded"]);

// A decision without a status keeps today's meaning: it is accepted.
export function decisionStatus(decision) {
  return text(decision?.status).toLowerCase() || "accepted";
}

// The optional ADR fields: drivers, options with pros and cons, how the
// decision is confirmed, what it supersedes, and which requirements a durable
// decision governs. Older decisions without them stay valid.
export function decisionMetadataIssues(decision, label) {
  const issues = [];
  if (decision?.status !== undefined && !DECISION_STATUSES.includes(decisionStatus(decision)))
    issues.push(`${label}.status must be proposed, accepted, or superseded`);
  const stringArray = (value) => Array.isArray(value) && value.every((item) => text(item));
  if (decision?.drivers !== undefined && !stringArray(decision.drivers))
    issues.push(`${label}.drivers must be an array of non-empty strings`);
  if (decision?.requirements !== undefined && !stringArray(decision.requirements))
    issues.push(`${label}.requirements must be an array of requirement keys`);
  if (decision?.durable !== undefined && typeof decision.durable !== "boolean")
    issues.push(`${label}.durable must be true or false`);
  for (const field of ["confirmation", "supersedes"])
    if (decision?.[field] !== undefined && typeof decision[field] !== "string")
      issues.push(`${label}.${field} must be a string`);
  if (decision?.options !== undefined) {
    if (!Array.isArray(decision.options)) issues.push(`${label}.options must be an array`);
    else for (const [index, option] of decision.options.entries()) {
      if (typeof option === "string" ? !text(option) : !text(option?.option))
        issues.push(`${label}.options[${index}].option is required`);
      for (const list of ["pros", "cons"])
        if (option && typeof option === "object" && option[list] !== undefined &&
            !(typeof option[list] === "string" || stringArray(option[list])))
          issues.push(`${label}.options[${index}].${list} must be a string or an array of strings`);
    }
  }
  return issues;
}

// An accepted durable decision states its reason under each requirement it
// governs, so the reason survives archive into the living spec.
export function applyDecisionRationale(source, requirements, issues) {
  for (const [index, decision] of (Array.isArray(source?.decisions) ? source.decisions : []).entries()) {
    const keys = Array.isArray(decision?.requirements) ? stringList(decision.requirements) : [];
    for (const key of keys)
      if (!requirements.some((row) => row.key === key))
        issues.push(`semantic draft decisions[${index}].requirements references unknown requirement '${key}'`);
    if (decision?.durable !== true || decisionStatus(decision) !== "accepted" || !text(decision?.choice))
      continue;
    const reason = authoredDecisionReason(decision);
    const line = `- **Rationale (${text(decision.id) || text(decision.key)}):** ${text(decision.choice)}` +
      (reason ? ` — ${reason}` : "");
    for (const row of requirements.filter((requirement) => keys.includes(requirement.key)))
      row.spec.rationale = [...(row.spec.rationale || []), line];
  }
}

export const SETTLED_REASON = "No alternative was open; recorded as settled";

// A default the agent chose without asking (stack, storage) is recorded, not
// approved: it is reported with the agreement but never forces design.md.
export function agentDecision(decision) {
  return text(decision?.decidedBy).toLowerCase() === "agent";
}

// The author's stated reason, without the compiler's settled-fact filler.
export function authoredDecisionReason(decision) {
  const reason = text(decision?.reason) || text(decision?.why);
  return reason === SETTLED_REASON ? "" : reason;
}
