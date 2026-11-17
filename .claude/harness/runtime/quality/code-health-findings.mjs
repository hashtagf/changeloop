// Code-health findings that need no project tool: stopgap marker comments
// (the stopgap-comment lane), duplicated blocks, and deep nesting. These are
// what an agent copies first, so the ratchet keeps them from growing the same
// way it keeps files from growing. None parses the language: comment markers,
// brace or indent depth, and normalized line windows are enough to count, and
// the baseline absorbs what already exists. The text-level functions are
// shared with Change Loop's own harness ratchet.
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
const COMMENT_OPENER = /^(?:\/\/+|\/\*+|<!--|#+|-{2,}|\*+)/;
// A marker counts when it opens the comment or is followed by ':' or '(' (an
// owner tag). A marker named in prose or inside a regular expression is not
// one; upper case only, since the lower-case word is ordinary English.
const LEADING_MARKER = /^\s*(TODO|FIXME|HACK|XXX)\b/;
const TAGGED_MARKER = /\b(TODO|FIXME|HACK|XXX)\s*[:(]/;
const WORKAROUND = /\bwork-?arounds?\b/i;

export function commentMarker(line) {
  const start = line.match(COMMENT_START);
  if (!start) return null;
  const body = line.slice(start.index).replace(COMMENT_OPENER, "");
  const marker = body.match(LEADING_MARKER) || body.match(TAGGED_MARKER);
  if (marker) return marker[1].toLowerCase();
  return WORKAROUND.test(body) ? "workaround" : null;
}

// One `comment/<marker>` finding per comment line carrying a stopgap marker
// (the four upper-case markers, or the word the lane is named after).
export function markerCommentsIn(path, text) {
  return text.split("\n").flatMap((line, index) => {
    const marker = commentMarker(line);
    return marker ? [{ path, rule: `comment/${marker}`, line: index + 1,
      message: `${marker} comment: fix the cause, or track it outside the code and remove the marker` }] : [];
  });
}

export function workaroundCommentFindings(root, provider) {
  return scanned(root, provider).flatMap((path) => markerCommentsIn(path, readFileSync(join(root, path), "utf8")));
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
export function nestingIn(path, text, limit = DEFAULT_MAX_NESTING_DEPTH) {
  const extension = path.slice(path.lastIndexOf("."));
  if (UNNESTED.has(extension)) return [];
  const depths = INDENTED.has(extension) ? indentDepths(text) : braceDepths(text);
  const deepest = depths.reduce((most, depth) => Math.max(most, depth), 0);
  if (deepest <= limit) return [];
  return [{ path, rule: "complexity/nesting", line: depths.indexOf(deepest) + 1, value: deepest,
    message: `nests ${deepest} levels (limit ${limit}); return early or extract the inner block into a function` }];
}

export function nestingDepthFindings(root, provider) {
  const limit = maxNestingDepth(provider);
  return scanned(root, provider).flatMap((path) => nestingIn(path, readFileSync(join(root, path), "utf8"), limit));
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
  return duplicatesIn(scanned(root, provider).map((path) => ({ path, text: readFileSync(join(root, path), "utf8") })),
    duplicationWindow(provider));
}

// `files` in path order: [{ path, text }].
export function duplicatesIn(files, window = DEFAULT_DUPLICATION_WINDOW) {
  const firstSeen = new Map();
  const duplicateStarts = new Map();
  for (const { path, text } of files) {
    const lines = significantLines(text);
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
