import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { jsonLines, recordedChangeIds } from "./outcomes-runtime.mjs";

// Lessons: blocker codes and review finding codes that recur across distinct
// changes become advisory proposals for a permanent check, made through the
// normal /change route. Only typed codes count; untyped blockers and findings
// without a well-formed code are reported as uncoded totals. Free-text reasons
// and messages are never exported.
export const LESSONS_SCHEMA_VERSION = 1;
export const LESSONS_DEFAULT_MIN_CHANGES = 3;
export const LESSONS_MIN_CHANGES_FLOOR = 2;

const FINDING_CODE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Fixed code → check mapping; anything unmapped is investigated first.
export function suggestedCheck(code) {
  const tokens = new Set(code.split("-"));
  if (code === "authority-required" || tokens.has("permission") || tokens.has("authz") ||
      tokens.has("authorization")) return "authorization-test";
  if (code === "contract-invalid") return "contract-compatibility-check";
  if (code === "workspace-boundary" || tokens.has("boundary") || tokens.has("import"))
    return "dependency-rule";
  if (tokens.has("idempotency")) return "idempotency-test";
  if (tokens.has("type") || tokens.has("types")) return "type-rule";
  if (tokens.has("lint")) return "lint-rule";
  return "investigate";
}

// The strongest workable enforcement for each suggested check, in the order
// architecture → type → lint whose message names the fix → test → prose last.
const ENFORCEMENT = Object.freeze({
  "dependency-rule": { layer: "architecture",
    how: "declare the boundary as a module-boundaries lane in quality/foundation-quality.json so a forbidden import fails Prove" },
  "type-rule": { layer: "type",
    how: "make the bad state unrepresentable in the type, then ratchet type-check findings with a type-check lane" },
  "lint-rule": { layer: "lint",
    how: "add a lint rule whose message names the fix and ratchet it with a lint lane so only new occurrences fail" },
  "authorization-test": { layer: "test",
    how: "add a test that a caller without the permission is refused, at the lowest boundary that enforces it" },
  "contract-compatibility-check": { layer: "test",
    how: "add a contract test that fails when the published shape changes incompatibly" },
  "idempotency-test": { layer: "test",
    how: "add a test that repeats the operation and asserts one effect" },
  investigate: { layer: "investigate",
    how: "find the cause with /investigate, then choose the strongest enforcement: architecture, type, lint that names the fix, test; prose only for judgment calls" }
});

export function enforcementFor(check) {
  return ENFORCEMENT[check] || ENFORCEMENT.investigate;
}

// openspec/lessons.md rows whose "Enforced by" cell names a check. A lesson
// whose code appears in such a row is already enforced and shows where.
export function enforcedLessons(markdown) {
  const rows = [];
  for (const line of String(markdown || "").split("\n")) {
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 4 || /^-+$/.test(cells[0]) || cells[0].toLowerCase() === "date") continue;
    const enforcedBy = cells.at(-1);
    if (enforcedBy) rows.push({ text: cells.join(" "), enforcedBy });
  }
  return rows;
}

function enforcedBy(code, rows) {
  const pattern = new RegExp(`(^|[^a-z0-9-])${code.replace(/[-]/g, "\\-")}([^a-z0-9-]|$)`);
  return rows.find((row) => pattern.test(row.text))?.enforcedBy || null;
}

// The --min-changes value, or null when it is not an integer of at least 2.
export function minChangesValue(raw) {
  if (raw === undefined) return LESSONS_DEFAULT_MIN_CHANGES;
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value >= LESSONS_MIN_CHANGES_FLOOR ? value : null;
}

const validCode = (value) => typeof value === "string" && value.length <= 64 &&
  FINDING_CODE.test(value);

export function lessonsText(value) {
  const lines = [`Lessons (recurring in at least ${value.minChanges} changes): ${value.lessons.length}`];
  for (const lesson of value.lessons)
    lines.push(`- ${lesson.source} ${lesson.code}: ${lesson.changeCount} changes, ` +
      `${lesson.occurrences} occurrence(s) → ${lesson.enforcedBy
        ? `enforced by ${lesson.enforcedBy}`
        : `${lesson.suggestedCheck} (${lesson.enforcement.layer}) via ${lesson.route}: ${lesson.enforcement.how}`}`);
  lines.push(`Uncoded: ${value.uncoded.blocker} blocker(s), ${value.uncoded.review} review finding(s)`);
  return lines.join("\n");
}

export function createLessonsRuntime({
  runtimeDir, evidenceDir, logsDir,
  // (id) => review attempt records, read only.
  reviewAttemptRecords,
  // The project's openspec/lessons.md; its "Enforced by" column marks lessons
  // that already have a check.
  lessonsDocument = null,
  fail
}) {
  function lessonsValue(minChanges = LESSONS_DEFAULT_MIN_CHANGES) {
    const groups = new Map();
    const uncoded = { blocker: 0, review: 0 };
    const observe = (source, code, id) => {
      const key = `${source}:${code}`;
      const group = groups.get(key) || { source, code, changes: new Set(), occurrences: 0 };
      group.changes.add(id);
      group.occurrences += 1;
      groups.set(key, group);
    };
    for (const id of recordedChangeIds({ runtimeDir, evidenceDir, logsDir })) {
      for (const row of jsonLines(join(logsDir, id, "operations.jsonl")) || []) {
        if (row?.status !== "blocked") continue;
        const code = row.blocker?.code;
        if (validCode(code) && code !== "untyped") observe("blocker", code, id);
        else uncoded.blocker += 1;
      }
      let attempts = [];
      try { attempts = reviewAttemptRecords(id) || []; } catch { attempts = []; }
      for (const attempt of attempts)
        for (const finding of Array.isArray(attempt?.findings) ? attempt.findings : []) {
          if (validCode(finding?.code)) observe("review", finding.code, id);
          else uncoded.review += 1;
        }
    }
    const enforcedRows = lessonsDocument && existsSync(lessonsDocument)
      ? enforcedLessons(readFileSync(lessonsDocument, "utf8")) : [];
    const lessons = [...groups.values()]
      .filter((group) => group.changes.size >= minChanges)
      .map((group) => ({
        code: group.code,
        source: group.source,
        changeCount: group.changes.size,
        changes: [...group.changes].sort(),
        occurrences: group.occurrences,
        suggestedCheck: suggestedCheck(group.code),
        route: "/change",
        enforcement: enforcementFor(suggestedCheck(group.code)),
        // A new check must fail on a real past occurrence: these changes hold one.
        adoption: {
          intent: `Add a permanent ${suggestedCheck(group.code)} for recurring ${group.source} code ` +
            `'${group.code}' (seen in ${group.changes.size} changes)`,
          mustFailOn: [...group.changes].sort()
        },
        enforcedBy: enforcedBy(group.code, enforcedRows)
      }))
      .sort((left, right) => right.changeCount - left.changeCount ||
        (left.code < right.code ? -1 : left.code > right.code ? 1 : 0) ||
        (left.source < right.source ? -1 : 1));
    return { version: LESSONS_SCHEMA_VERSION, minChanges, lessons, uncoded };
  }

  function showLessons(flags = {}) {
    const minChanges = minChangesValue(flags["min-changes"]);
    if (minChanges === null)
      fail(`lessons --min-changes must be an integer of at least ${LESSONS_MIN_CHANGES_FLOOR}`);
    const value = lessonsValue(minChanges);
    console.log(flags.pretty ? lessonsText(value) : JSON.stringify(value, null, 2));
    return value;
  }

  return { lessonsValue, showLessons };
}
