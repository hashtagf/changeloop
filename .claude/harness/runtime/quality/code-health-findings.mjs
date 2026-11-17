// Code-health findings that need no project tool: stopgap marker comments
// (the stopgap-comment lane), duplicated blocks, and deep nesting. Both are what an agent copies first, so the ratchet keeps
// them from growing the same way it keeps files from growing. Neither parses
// the language: comment markers and normalized line windows are enough to
// count, and the baseline absorbs what already exists.
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { sourceFiles } from "./source-scan.mjs";

// Languages whose comments start with //, /*, #, or -- (and their block bodies).
export const CODE_EXTENSIONS = Object.freeze([
  ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".mts", ".cts", ".py", ".go", ".rb", ".php",
  ".java", ".kt", ".kts", ".scala", ".rs", ".cs", ".swift", ".c", ".h", ".cc", ".cpp", ".hpp",
  ".sql", ".sh", ".vue", ".svelte"
]);
export const DEFAULT_DUPLICATION_WINDOW = 8;
export const DEFAULT_MAX_NESTING_DEPTH = 5;
// Indentation carries nesting in these; braces do in the rest.
const INDENTED = new Set([".py", ".rb"]);
// Shell and SQL nest by keywords a line scan cannot count reliably.
const UNNESTED = new Set([".sh", ".sql"]);
const MINIMUM_DUPLICATION_WINDOW = 4;
// Generated or minified files are not code an agent copies from.
const MAXIMUM_FILE_BYTES = 512 * 1024;
const MAXIMUM_LINE_CHARACTERS = 400;

const scanned = (root, provider) => sourceFiles(root, provider, CODE_EXTENSIONS)
  .filter((path) => statSync(join(root, path)).size <= MAXIMUM_FILE_BYTES);

const COMMENT_START = /\/\/|\/\*|<!--|#|--|^\s*\*/;
// Upper-case markers only: "todo" is also an ordinary word (a todo list).
const MARKER = /\b(TODO|FIXME|HACK|XXX)\b/;
const WORKAROUND = /\bwork-?around\b/i;

function commentMarker(line) {
  const start = line.match(COMMENT_START);
  if (!start) return null;
  const comment = line.slice(start.index);
  const marker = comment.match(MARKER);
  if (marker) return marker[1].toLowerCase();
  return WORKAROUND.test(comment) ? "workaround" : null;
}

// One `comment/<marker>` finding per comment line carrying a stopgap marker
// (the four upper-case markers, or the word the lane is named after).
export function workaroundCommentFindings(root, provider) {
  const findings = [];
  for (const path of scanned(root, provider)) {
    const lines = readFileSync(join(root, path), "utf8").split("\n");
    lines.forEach((line, index) => {
      const marker = commentMarker(line);
      if (marker) findings.push({ path, rule: `comment/${marker}`, line: index + 1,
        message: `${marker} comment: fix the cause, or track it outside the code and remove the marker` });
    });
  }
  return findings;
}

export function maxNestingDepth(provider) {
  const depth = provider.maxDepth === undefined ? DEFAULT_MAX_NESTING_DEPTH : Number(provider.maxDepth);
  if (!Number.isInteger(depth) || depth < 2) throw new Error("nesting-depth maxDepth must be an integer of at least 2");
  return depth;
}

// Brace depth per line with strings and comments removed. Object literals
// count like blocks: deep data and deep control flow are both hard to change.
function braceDepths(text) {
  let depth = 0;
  let inBlockComment = false;
  return text.split("\n").map((raw) => {
    let line = raw;
    if (inBlockComment) {
      const end = line.indexOf("*/");
      if (end < 0) return depth;
      line = line.slice(end + 2);
      inBlockComment = false;
    }
    line = line.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, "")
      .replace(/\/\*.*?\*\//g, "").replace(/\/\/.*$/, "");
    const open = line.indexOf("/*");
    if (open >= 0) { line = line.slice(0, open); inBlockComment = true; }
    let deepest = depth;
    for (const character of line) {
      if (character === "{") deepest = Math.max(deepest, ++depth);
      else if (character === "}") depth = Math.max(0, depth - 1);
    }
    return deepest;
  });
}

// Indentation depth per line, in units of the file's smallest indent.
function indentDepths(text) {
  const lines = text.split("\n");
  const widths = lines.filter((line) => line.trim() && !/^\s*#/.test(line))
    .map((line) => line.replace(/\t/g, "    ").match(/^ */)[0].length);
  const unit = widths.reduce((least, width) => width > 0 && width < least ? width : least, Infinity);
  return lines.map((line) => !line.trim() || !Number.isFinite(unit) ? 0
    : Math.floor(line.replace(/\t/g, "    ").match(/^ */)[0].length / unit));
}

// One `complexity/nesting` finding per file whose deepest line nests more than
// maxDepth levels, carrying that depth: like file size, a tracked file may get
// shallower but never deeper. A rough line scan, not a parser.
export function nestingDepthFindings(root, provider) {
  const limit = maxNestingDepth(provider);
  return scanned(root, provider).flatMap((path) => {
    const extension = path.slice(path.lastIndexOf("."));
    if (UNNESTED.has(extension)) return [];
    const text = readFileSync(join(root, path), "utf8");
    const depths = INDENTED.has(extension) ? indentDepths(text) : braceDepths(text);
    const deepest = depths.reduce((most, depth) => Math.max(most, depth), 0);
    if (deepest <= limit) return [];
    return [{ path, rule: "complexity/nesting", line: depths.indexOf(deepest) + 1, value: deepest,
      message: `nests ${deepest} levels (limit ${limit}); return early or extract the inner block into a function` }];
  });
}

export function duplicationWindow(provider) {
  const window = provider.window === undefined ? DEFAULT_DUPLICATION_WINDOW : Number(provider.window);
  if (!Number.isInteger(window) || window < MINIMUM_DUPLICATION_WINDOW)
    throw new Error(`duplication window must be an integer of at least ${MINIMUM_DUPLICATION_WINDOW}`);
  return window;
}

// Lines that carry meaning: blank lines, lone brackets, and minified lines
// never make two blocks look alike.
function significantLines(text) {
  return text.split("\n").map((raw, index) => ({ text: raw.trim().replace(/\s+/g, " "), line: index + 1 }))
    .filter((row) => row.text.length >= 3 && row.text.length <= MAXIMUM_LINE_CHARACTERS &&
      !/^[\s{}()[\];,]*$/.test(row.text));
}

// A run of `window` significant lines that appears earlier (in path order, or
// earlier in the same file) is a duplicate. Overlapping duplicate windows form
// one `duplication/block` finding at the first line of the run, so a copied
// 30-line function is one finding, not 23.
export function duplicationFindings(root, provider) {
  const window = duplicationWindow(provider);
  const firstSeen = new Map();
  const duplicateStarts = new Map();
  for (const path of scanned(root, provider)) {
    const lines = significantLines(readFileSync(join(root, path), "utf8"));
    for (let index = 0; index + window <= lines.length; index += 1) {
      const key = lines.slice(index, index + window).map((row) => row.text).join("\n");
      const first = firstSeen.get(key);
      if (!first) { firstSeen.set(key, { path, line: lines[index].line }); continue; }
      const starts = duplicateStarts.get(path) || [];
      starts.push({ index, line: lines[index].line, first });
      duplicateStarts.set(path, starts);
    }
  }
  const findings = [];
  for (const [path, starts] of duplicateStarts) {
    let previous = -2;
    for (const start of starts) {
      if (start.index !== previous + 1) findings.push({ path, rule: "duplication/block", line: start.line,
        message: `at least ${window} lines repeat ${start.first.path}:${start.first.line}; extract the shared code` });
      previous = start.index;
    }
  }
  return findings;
}
