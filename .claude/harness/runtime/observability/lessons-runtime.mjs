import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { jsonLines, recordedChangeIds } from "./outcomes-runtime.mjs";
import { LESSON_CODE, PROSE_FILE } from "../contracts/lesson-enforcement.mjs";

// Lessons: blocker codes and review finding codes that recur across distinct
// changes become advisory proposals for a permanent check, made through the
// normal /change route. Only typed codes count; untyped blockers and findings
// without a well-formed code are reported as uncoded totals. Free-text reasons
// and messages are never exported.
export const LESSONS_SCHEMA_VERSION = 1;
export const LESSONS_DEFAULT_MIN_CHANGES = 3;
export const LESSONS_MIN_CHANGES_FLOOR = 2;


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

// How an "Enforced by" cell counts. A check names a project file (a test, a
// lint rule, a type) or a quality lane as `quality:<capability>`; a judgment
// call says why no check can catch it as `judgment: <why>`. Anything else is
// prose, the last layer of the pyramid, and keeps the lesson open.
/** @param {unknown} cell @param {(path: string) => boolean} exists */
export function enforcementKind(cell, exists) {
  const value = String(cell || "").trim();
  if (!value) return "open";
  if (/^judgment\s*:\s*\S/i.test(value)) return "judgment";
  if (/(?:^|[\s,;`(])quality:[a-z0-9][a-z0-9-]*/.test(value)) return "check";
  const paths = value.split(/[\s,;`()]+/).map((token) => token.replace(/[#:].*$/, "").replace(/^\.\//, ""))
    .filter((token) => token.includes(".") && !token.split("/").includes("..") && !PROSE_FILE.test(token));
  return paths.some((path) => exists(path)) ? "check" : "prose";
}

const STATUS_BY_KIND = { check: "enforced", judgment: "judgment", prose: "prose-only", open: "open" };

// The change a lesson's check is adopted through: a starting draft the agent
// completes with the files and command, then starts with `change start`.
// An uncategorized code is investigated first, so it has no draft.
export function adoptionDraft({ code, source, changes }, check, enforcement) {
  if (check === "investigate") return null;
  const title = `Enforce '${code}' with a ${enforcement.layer} check`;
  const label = (change) => change.length > 50 ? `${change.slice(0, 47)}...` : change;
  return {
    "change.json": {
      version: 5,
      enforces: [code],
      intent: title.length <= 70 ? title : `Enforce a recurring ${source} code with a ${enforcement.layer} check`,
      workType: [enforcement.layer === "test" ? "test" : "chore"],
      requirements: [{
        description: `The project SHALL fail its ${check} on a new occurrence of ${source} code '${code}'`,
        scenarios: [
          ...changes.slice(0, 3).map((change) => ({ name: `Fails on the occurrence from ${label(change)}`,
            when: `the occurrence recorded in change ${change} is reintroduced`,
            then: `the ${check} fails and its message names the fix` })),
          { name: "Passes without an occurrence", when: `the code has no occurrence of '${code}'`,
            then: "the check passes" }
        ]
      }]
    },
    "proposal.md": `## Why\n\n${source} code '${code}' recurred in ${changes.length} changes. A ${enforcement.layer} ` +
      "check stops it recurring, where a reminder in prose would not.\n",
    next: "Keep enforces; add tasks: the files the check lives in (paths, not prose) and the command that runs it (verify); " +
      "save the folder under .foundation/drafts/<id>/ with the Write tool and run cloop change start; " +
      `afterwards name the check in openspec/lessons.md "Enforced by" for '${code}'`
  };
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

const PENDING = new Set(["open", "prose-only"]);

// One `doctor` setup row: recurring lessons that still rely on memory or
// prose. Never an error; it names the command that lists their drafts.
export function lessonsReadiness(value) {
  const pending = value.lessons.filter((lesson) => PENDING.has(lesson.status));
  if (!pending.length) return { id: "lessons-enforcement", level: "ok", detail: value.lessons.length
    ? `${value.lessons.length} recurring lesson(s), each enforced or a recorded judgment call`
    : "no recurring lessons yet", next: null };
  const codes = pending.slice(0, 3).map((lesson) => lesson.code).join(", ") +
    (pending.length > 3 ? ` (+${pending.length - 3} more)` : "");
  return { id: "lessons-enforcement", level: "warn",
    detail: `${pending.length} recurring lesson(s) without a check: ${codes}`,
    next: "cloop lessons --pretty; adopt each check through /change from its adoption draft, or record " +
      "'judgment: <why>' in openspec/lessons.md when no check can catch it" };
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
  LESSON_CODE.test(value);

export function lessonsText(value) {
  const lines = [`Lessons (recurring in at least ${value.minChanges} changes): ${value.lessons.length}`];
  for (const lesson of value.lessons)
    lines.push(`- ${lesson.source} ${lesson.code}: ${lesson.changeCount} changes, ` +
      `${lesson.occurrences} occurrence(s) → ${lesson.status === "enforced" || lesson.status === "judgment"
        ? `${lesson.status === "judgment" ? "judgment call" : "enforced by"} ${lesson.enforcedBy}`
        : `${lesson.status === "prose-only" ? `only prose (${lesson.enforcedBy}); ` : ""}` +
          `${lesson.suggestedCheck} (${lesson.enforcement.layer}) via ${lesson.route}: ${lesson.enforcement.how}`}`);
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
  // Whether a project-relative path exists; a cell naming one is a check.
  projectFileExists = /** @type {(path: string) => boolean} */ (() => false),
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
      .map((group) => {
        const check = suggestedCheck(group.code);
        const enforcement = enforcementFor(check);
        const cell = enforcedBy(group.code, enforcedRows);
        const status = STATUS_BY_KIND[enforcementKind(cell, projectFileExists)];
        const changes = [...group.changes].sort();
        return {
          code: group.code,
          source: group.source,
          changeCount: group.changes.size,
          changes,
          occurrences: group.occurrences,
          suggestedCheck: check,
          route: "/change",
          enforcement,
          // A new check must fail on a real past occurrence: these changes hold one.
          adoption: {
            intent: `Add a permanent ${check} for recurring ${group.source} code ` +
              `'${group.code}' (seen in ${group.changes.size} changes)`,
            mustFailOn: changes,
            draft: PENDING.has(status) ? adoptionDraft({ code: group.code, source: group.source, changes },
              check, enforcement) : null
          },
          enforcedBy: cell,
          status
        };
      })
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
