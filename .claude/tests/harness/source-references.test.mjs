// Suites that inject faults into, or grep, real harness source name it by
// path and by exact text. When code moves to another module those suites
// break only when they run, often in the slow tier. This check reads every
// such reference statically and fails the default gate, naming the suite,
// the reference, and where the text now lives.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const exists = (path) => existsSync(join(ROOT, path));

function files(dir, pattern) {
  const out = [];
  const walk = (absolute) => {
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const path = join(absolute, entry.name);
      if (entry.isDirectory()) { if (!["node_modules", "bench"].includes(entry.name)) walk(path); }
      else if (pattern.test(entry.name)) out.push(relative(ROOT, path));
    }
  };
  walk(join(ROOT, dir));
  return out.sort();
}

const RUNTIME = join(ROOT, ".claude", "harness", "runtime");
const runtimeSources = () => files(".claude/harness", /\.mjs$/).filter((path) => !path.includes("/tests/"));

// Where a snippet lives now, so a failure says what to point the suite at.
function locate(matches) {
  const found = runtimeSources().filter((path) => matches(read(path)));
  return found.length ? ` (now in ${found.join(", ")})` : " (found in no harness module)";
}

// 1. Mutation catalogs: `sourcePath` plus the exact `before` text replaced.
function catalogReferences() {
  const out = [];
  for (const path of [...files(".claude/tests/harness", /mutation\.mjs$/), ...files("scripts/quality", /mutation\.mjs$/)]) {
    const text = read(path);
    // One catalog entry at a time: from its sourcePath to the next one.
    const entries = text.split(/(?=sourcePath:)/).slice(1);
    for (const entry of entries) {
      const file = entry.match(/^sourcePath:\s*"([^"]+)"/)?.[1];
      const before = entry.match(/\bbefore:\s*("(?:\\.|[^"\\])*")/)?.[1];
      // A template-literal `before` is computed at run time; only its file is checked.
      if (file) out.push({ suite: path, file, ...(before ? { literal: JSON.parse(before) } : {}) });
    }
  }
  return out;
}

// 2. Shell mutation runners: `VAR="$SOURCE/<path>"` and the regex a heredoc
//    `node - "$VAR"` applies to it.
function shellMutationReferences() {
  const out = [];
  for (const path of files(".claude/tests/harness", /mutation\.sh$/)) {
    const text = read(path);
    const vars = Object.fromEntries([...text.matchAll(/^([A-Z_]+)="\$SOURCE\/([^"]+)"$/gm)].map((m) => [m[1], m[2]]));
    for (const [name, file] of Object.entries(vars)) out.push({ suite: path, file });
    for (const block of text.matchAll(/node - "\$([A-Z_]+)" <<'MUTATE'\n([\s\S]*?)\nMUTATE/g)) {
      const file = vars[block[1]];
      const literal = block[2].match(/\.replace\(\s*\/((?:\\.|[^/\\\n])+)\/([a-z]*)/);
      if (file && literal) out.push({ suite: path, file, pattern: new RegExp(literal[1], literal[2]) });
    }
  }
  return out;
}

// 3. Content checks: assert_file_contains "$ROOT/<harness source>" '<text>'.
function contentReferences() {
  const out = [];
  for (const path of files(".claude/tests", /\.sh$/)) {
    const text = read(path);
    for (const match of text.matchAll(/assert_file_contains\s+"[^"]*"\s*\\?\s*\n?\s*"\$ROOT\/(\.claude\/harness\/[^"$]+)"\s*\\?\s*\n?\s*'([^']+)'/g))
      out.push({ suite: path, file: match[1], literal: match[2] });
  }
  return out;
}

// 4. Module copies in JS runners: resolve(".claude/harness/runtime/...").
function resolvedModuleReferences() {
  const out = [];
  for (const path of files(".claude/tests/harness", /\.mjs$/)) {
    const text = read(path);
    for (const match of text.matchAll(/resolve\(\s*"(\.claude\/harness\/runtime\/[^"]+\.mjs)"\s*\)/g))
      out.push({ suite: path, file: match[1] });
  }
  return out;
}

const ALL = () => [...catalogReferences(), ...shellMutationReferences(), ...contentReferences(), ...resolvedModuleReferences()];

test("every harness source a suite injects into or greps exists and still holds the text", () => {
  const references = ALL();
  assert.ok(references.length >= 40, `only ${references.length} references found; the scanner lost its patterns`);
  const issues = [];
  for (const ref of references) {
    if (!exists(ref.file)) { issues.push(`${ref.suite}: ${ref.file} does not exist`); continue; }
    const text = read(ref.file);
    if (ref.literal !== undefined && !text.includes(ref.literal))
      issues.push(`${ref.suite}: ${ref.file} no longer contains ${JSON.stringify(ref.literal.slice(0, 70))}` +
        locate((source) => source.includes(ref.literal)));
    if (ref.pattern && !ref.pattern.test(text))
      issues.push(`${ref.suite}: ${ref.file} no longer matches ${ref.pattern}` + locate((source) => ref.pattern.test(source)));
  }
  assert.deepEqual(issues, [], `point each suite at the module that holds the code now:\n${issues.join("\n")}`);
});

test("the scanner reads each reference family", () => {
  assert.ok(catalogReferences().length > 0, "mutation catalogs");
  assert.ok(shellMutationReferences().some((ref) => ref.pattern), "shell mutation regexes");
  assert.ok(contentReferences().length > 0, "assert_file_contains on harness source");
  assert.ok(resolvedModuleReferences().length > 0, "resolved module copies");
  assert.ok(existsSync(RUNTIME));
});
