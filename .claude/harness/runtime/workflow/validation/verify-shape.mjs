// A task that edits product code in behavior-changing work is ticked only by
// its verify, so that verify must exercise behavior. A no-op (`true`, `echo`)
// or a check that never runs a test (lint, format, typecheck) passes on any
// code and would tick an unimplemented task. Opaque project commands (make,
// a script) are accepted: the harness cannot tell what they run.
import { BEHAVIOR_NEUTRAL_WORK } from "../../contracts/work-types.mjs";
import { lightKind } from "./dev-document.mjs";

const NO_OP = /^(?:true|:|exit(?:\s+0)?|echo(?:\s.*)?|printf(?:\s.*)?|sleep\s+\d+)$/;
const CHECK_ONLY = new RegExp([
  String.raw`^(?:npx\s+|pnpm\s+(?:exec\s+|dlx\s+)?|yarn\s+|bunx\s+)?` +
    String.raw`(?:eslint|prettier|tsc|stylelint|biome|oxlint|standard|xo|markdownlint(?:-cli2?)?|shellcheck)\b`,
  String.raw`^(?:python3?\s+-m\s+)?(?:ruff|black|flake8|pylint|mypy|pyright|isort)\b`,
  String.raw`^(?:gofmt|goimports|golangci-lint|staticcheck|rubocop|swiftlint|ktlint)\b`,
  String.raw`^go\s+(?:vet|fmt|build)\b`,
  String.raw`^cargo\s+(?:fmt|clippy|check|build)\b`,
  String.raw`^(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:lint|format|fmt|typecheck|type-check|check-types|types|tsc|prettier|eslint|build)(?:[:\w-]*)?(?:\s|$)`
].join("|"));
// Leading `cd dir` and `VAR=value` only position the real command.
const POSITIONING = /^(?:cd|pushd)\s/;
const ASSIGNMENT = /^(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)+/;

const text = (value) => typeof value === "string" ? value.trim() : "";

/** "no-op", "check-only", "positioning", or "other" for one command segment. */
export function verifySegmentKind(segment) {
  const command = text(segment).replace(/^\(+|\)+$/g, "").replace(ASSIGNMENT, "").trim();
  if (!command) return "no-op";
  if (POSITIONING.test(command)) return "positioning";
  if (NO_OP.test(command)) return "no-op";
  if (CHECK_ONLY.test(command)) return "check-only";
  return "other";
}

/** True when the verify can exercise behavior: some segment is not a no-op or check-only command. */
export function verifyRunsBehavior(verify) {
  const kinds = text(verify).split(/&&|\|\||;|\n/).map(verifySegmentKind)
    .filter((kind) => kind !== "positioning");
  return kinds.some((kind) => kind === "other");
}

export function behaviorChangingTypes(workTypes) {
  const types = (workTypes || []).map((type) => text(type).toLowerCase()).filter(Boolean);
  return types.length > 0 && types.some((type) => !BEHAVIOR_NEUTRAL_WORK.has(type));
}

const productPaths = (paths) => (Array.isArray(paths) ? paths : [])
  .map(text).filter(Boolean).filter((path) => !lightKind(path));

/**
 * EDIT issues for tasks that edit product paths in behavior-changing work but
 * whose verify only runs no-op or lint/format/typecheck commands. Tasks rows
 * carry { semanticKey|key|id, verify, paths }.
 */
export function verifyShapeIssues(tasks, { workTypes, label = "task" } = {}) {
  if (!behaviorChangingTypes(workTypes)) return [];
  const issues = [];
  (Array.isArray(tasks) ? tasks : []).forEach((task, index) => {
    if (!task || typeof task !== "object" || !text(task.verify)) return;
    if (!productPaths(task.paths).length || verifyRunsBehavior(task.verify)) return;
    const name = text(task.semanticKey || task.key || task.id) || `#${index + 1}`;
    issues.push(`${label} '${name}' edits product code but its verify '${text(task.verify)}' ` +
      "runs no test (a no-op, lint, format, or typecheck command passes on unchanged code); " +
      "make verify run the tests that prove this task, e.g. 'node --test tests/x.test.mjs' or 'npm test'");
  });
  return issues;
}
