// A repository's own files must not reach into another repository by a
// relative path. `../payments/index.mjs` from the `orders` repository works
// only while the checkouts sit side by side (the harness sandboxes, one
// developer's machine) and breaks wherever `orders` is checked out alone; it is
// also how an agent turns a fake into a "real" collaborator when a scenario
// was placed in a repository that cannot prove it. Deterministic: only
// relative import/require/export specifiers in changed JavaScript/TypeScript
// files are read; a bare package name is never judged.
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";

const SCRIPT = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".mts", ".cts", ".tsx"]);
const SPECIFIER = /(?:\bimport\s*(?:[^'"`]*?\bfrom\s*)?|\bexport\s+[^'"`]*?\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])(\.{1,2}\/[^'"]+)\1/g;

export function escapingImports(workspacePath, changedPaths = [], read = (path) => readFileSync(path, "utf8")) {
  const root = resolve(workspacePath);
  const found = [];
  for (const path of changedPaths) {
    if (!SCRIPT.has(extname(path))) continue;
    const file = join(root, path);
    let text;
    try { if (!existsSync(file)) continue; text = read(file); } catch { continue; }
    for (const match of text.matchAll(SPECIFIER)) {
      const target = relative(root, resolve(dirname(file), match[2]));
      if (target === ".." || target.startsWith("../") || isAbsolute(target))
        found.push({ path, specifier: match[2] });
    }
  }
  return found;
}

export function escapingImportIssue(taskId, repositoryId, found) {
  if (!found.length) return null;
  const listed = found.slice(0, 5).map((row) => `${row.path} imports '${row.specifier}'`).join("; ");
  return `task ${taskId} reaches outside repository '${repositoryId}': ${listed}. A repository ` +
    "must stand alone, so a test here cannot use another repository's code. If the scenario " +
    "needs the real collaborator, prove it where the repositories are composed (a root or " +
    "integration task) through a semantic amendment; otherwise test this repository's side of " +
    "the contract only, then resume.";
}
