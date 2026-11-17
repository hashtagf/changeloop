// What counts as enforcing a recurring lesson. Prose is the last layer of the
// pyramid: a reminder in a Markdown or text file keeps a lesson open, so a
// change that adopts a lesson's check must change something that can fail.
// Pure contract shared by the lessons report and draft intake.

export const PROSE_FILE = /\.(?:md|mdx|txt|rst|adoc)$/i;
export const LESSON_CODE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isProsePath = (path) => PROSE_FILE.test(String(path || "").trim());

// Repairs for a draft whose `enforces` names recurring lesson codes: each code
// is well formed, and at least one task changes a file that is not prose.
export function enforcesIssues(source) {
  if (source?.enforces === undefined) return [];
  const codes = source.enforces;
  if (!Array.isArray(codes) || !codes.length || codes.some((code) =>
    typeof code !== "string" || code.length > 64 || !LESSON_CODE.test(code)))
    return ["semantic draft enforces must be a non-empty array of lesson codes from 'cloop lessons' (kebab-case)"];
  const paths = (Array.isArray(source.tasks) ? source.tasks : [])
    .flatMap((task) => Array.isArray(task?.paths) ? task.paths : []).map(String);
  if (paths.some((path) => path.trim() && !isProsePath(path))) return [];
  return [`semantic draft enforces ${codes.map((code) => `'${code}'`).join(", ")} but no task changes a file that can fail: ` +
    `${paths.length ? `every task path is prose (${paths.slice(0, 3).join(", ")})` : "no task names paths"}; ` +
    "add the check itself (a test, a lint rule, a type, or a quality lane in quality/foundation-quality.json) " +
    "to a task's paths, or record 'judgment: <why>' in openspec/lessons.md when no check can catch it"];
}
