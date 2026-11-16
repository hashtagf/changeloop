

export const AUTHORITY_CAPABILITIES = new Set(["review", "acceptance", "semantic-acceptance"]);

export const PLACEHOLDER = /(?:replace-with|needs clarification|\btodo\b|\btbd\b|<[^>]+>)/i;

export function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function stringList(value) {
  return Array.isArray(value)
    ? value.map((item) => text(item)).filter(Boolean)
    : [];
}

export function textList(value) {
  return typeof value === "string" ? [text(value)].filter(Boolean) : stringList(value);
}

export function placeholderIssue(value, label, issues) {
  if (PLACEHOLDER.test(text(value))) issues.push(`${label} contains unresolved placeholder text`);
}

export function rawScenarioEntries(requirement) {
  return Array.isArray(requirement?.scenarios) ? requirement.scenarios
    : requirement?.scenario !== undefined ? [requirement.scenario] : [];
}

export function comparableLabel(value) {
  return text(value).toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();
}
