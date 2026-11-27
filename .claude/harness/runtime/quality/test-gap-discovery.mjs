// Why a repository has no test lane, and what to offer. Across 828 consumer
// repositories, 377 had no test lane: 187 JavaScript repositories (Nuxt 127,
// Vue 36) had no test script and only 19 of them had any test file, so most
// had no tests at all rather than tests discovery missed; 15 named a test
// command in a Makefile, CI workflow, or README. Discovery therefore counts
// the test files, uses a runner the repository already installed, lists the
// commands it finds for the user to confirm (never into providers), and says
// plainly when there is nothing to run.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gitIgnored, nestedRepository } from "./source-scan.mjs";

const SKIP = new Set([".git", ".claude", ".foundation", "node_modules", "vendor", "dist", "build",
  "coverage", ".nuxt", ".next", ".output", "target", ".venv", "venv", "__pycache__"]);
const TEST_FILE = /(?:\.(?:test|spec)\.(?:[cm]?[jt]sx?|vue)|_test\.go|_test\.py|_spec\.rb|\.cy\.[jt]sx?|Tests?\.(?:java|kt)|Test\.php|_test\.dart)$|^test_.*\.py$/;
// Files that are tests by where they live: `__tests__/`, and Rust's `tests/*.rs`.
const TEST_PATH = /(?:^|\/)__tests__\/[^/]+\.(?:[cm]?[jt]sx?|vue)$|(?:^|\/)tests\/[^/]+\.rs$/;
// Profiles whose test files the patterns above recognise; for any other
// language a count of 0 says nothing, so "no tests" is never claimed.
export const COUNTED_PROFILES = Object.freeze(["application-js-ts", "application-go", "application-python",
  "toolchain-ruby", "toolchain-jvm-gradle", "toolchain-jvm-maven", "application-php",
  "toolchain-dart-flutter", "toolchain-rust"]);
const MAX_PROPOSALS = 10;

/**
 * The number of test files in the repository, or null when the bounded walk
 * stopped early: a partial count of 0 is not "no tests".
 */
export function countTestFiles(root, { maximumEntries = 20000 } = {}) {
  let count = 0;
  let seen = 0;
  let truncated = false;
  const ignored = gitIgnored(root);
  const walk = (directory, path) => {
    let entries = [];
    try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (++seen > maximumEntries) { truncated = true; return; }
      if (SKIP.has(entry.name)) continue;
      const relativePath = path ? `${path}/${entry.name}` : entry.name;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!nestedRepository(absolute) && !ignored(relativePath, true)) walk(absolute, relativePath);
      } else if (entry.isFile() && (TEST_FILE.test(entry.name) || TEST_PATH.test(relativePath))) count += 1;
    }
  };
  walk(root, "");
  return truncated ? null : count;
}

/** The test-file count when its zero would mean "no tests" for these profiles, else null. */
export function knownTestFileCount(root, profiles, options) {
  return profiles.some((profile) => COUNTED_PROFILES.includes(profile)) ? countTestFiles(root, options) : null;
}

// A runner the repository installed, in the order a JavaScript project most
// likely means: unit runners before a browser runner.
const RUNNERS = [
  { bin: "vitest", command: ["npx", "--no-install", "vitest", "run"] },
  { bin: "jest", command: ["npx", "--no-install", "jest"] },
  { bin: "playwright", command: ["npx", "--no-install", "playwright", "test"] }
];

/** The installed runner's command for test files without a test script, or null. */
export function installedRunnerCommand(root) {
  const runner = RUNNERS.find((row) => existsSync(join(root, "node_modules", ".bin", row.bin)));
  return runner ? [...runner.command] : null;
}

function text(path) {
  try { return readFileSync(path, "utf8"); } catch { return ""; }
}

const README_COMMAND = /^\s*(?:\$\s*)?((?:npm|pnpm|yarn|bun)\s+(?:run\s+)?test\b.*|go test\b.*|(?:python3?\s+-m\s+)?pytest\b.*|cargo test\b.*|\.?\/?gradlew?\s+test\b.*|flutter test\b.*|make\s+test\b.*|bundle exec (?:rspec|rake test)\b.*|mix test\b.*|dotnet test\b.*)$/;
const MAKE_TARGET = /^(test|tests|check|unit|test-[\w-]+)\s*:(?!=)/gm;
// The value on the same line only: a `script:` list continues on the next lines.
const CI_RUN = /^[ \t]*(?:-[ \t]*)?(?:run|script)[ \t]*:[ \t]*(?![|>])(\S.*\btest\b.*)$/gm;
const CI_BLOCK_LINE = /^\s{2,}(?:-\s+)?((?:npm|pnpm|yarn|go|pytest|python3?|cargo|\.\/gradlew|gradle|flutter|make|bundle|mix|dotnet)\b[^#\n]*\btest\b[^#\n]*)$/gm;

function clean(command) {
  return command.trim().replace(/\s+/g, " ").replace(/^["']|["']$/g, "");
}

/** Test commands the repository names, each `{ command, source, verified: false }`, at most ten. */
export function testCommandProposals(root) {
  const found = new Map();
  const add = (command, source) => {
    const value = clean(command);
    if (value && !found.has(value) && found.size < MAX_PROPOSALS) found.set(value, { command: value, source, verified: false });
  };
  for (const name of ["Makefile", "makefile", "GNUmakefile"])
    for (const match of text(join(root, name)).matchAll(MAKE_TARGET)) add(`make ${match[1]}`, name);
  const workflows = join(root, ".github", "workflows");
  let files = [];
  try { files = readdirSync(workflows).filter((name) => /\.ya?ml$/.test(name)).map((name) => `.github/workflows/${name}`); }
  catch { files = []; }
  for (const source of [...files, ".gitlab-ci.yml", "bitbucket-pipelines.yml"]) {
    const body = text(join(root, source));
    for (const match of body.matchAll(CI_RUN)) add(match[1], source);
    for (const match of body.matchAll(CI_BLOCK_LINE)) add(match[1], source);
  }
  for (const name of ["README.md", "readme.md", "README"]) {
    const body = text(join(root, name));
    for (const block of body.matchAll(/```[^\n]*\n([\s\S]*?)```/g))
      for (const line of block[1].split("\n")) {
        const match = line.match(README_COMMAND);
        if (match) add(match[1], name);
      }
  }
  return [...found.values()];
}

const SETUP = {
  "application-js-ts": { runner: "vitest", reason: "a Vite-based runner that also tests Vue and Nuxt components" },
  "application-go": { runner: "go test", reason: "Go's own test runner; add *_test.go files" },
  "application-python": { runner: "pytest", reason: "the common Python runner" }
};

/** What to offer a repository with no test files and no test lane, or null. */
export function testSetupProposal(profiles) {
  const profile = Object.keys(SETUP).find((name) => profiles.includes(name));
  if (!profile) return null;
  return { ...SETUP[profile], profile,
    message: `this repository has no tests; propose adding ${SETUP[profile].runner} through /change ` +
      "(the user approves it per repository; no test is written automatically)" };
}
