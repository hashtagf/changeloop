// Repository rules from AGENTS.md that a check can enforce:
// - generated state, results, build output, caches, and secrets stay untracked;
// - shipped (installer-managed) code never depends on repository-only tests,
//   fixtures, release or quality tooling, reports, or baselines.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const git = (...args) => spawnSync("git", ["-C", ROOT, ...args], { encoding: "utf8" });
const inGit = git("rev-parse", "--is-inside-work-tree").stdout.trim() === "true";

test("no tracked file matches an ignore rule", { skip: !inGit && "not a Git checkout" }, () => {
  const tracked = git("ls-files", "-ci", "--exclude-standard").stdout.split("\n").filter(Boolean);
  assert.deepEqual(tracked, [],
    "generated or ignored files are tracked; remove them from the index (git rm --cached) instead of committing them");
});

test("only the installer-managed .foundation files are tracked", { skip: !inGit && "not a Git checkout" }, () => {
  const tracked = git("ls-files", ".foundation").stdout.split("\n").filter(Boolean).sort();
  assert.deepEqual(tracked, [".foundation/.gitignore", ".foundation/README.md"],
    ".foundation holds machine state; commit only its managed .gitignore and README");
});

function bashArray(source, name) {
  const body = source.match(new RegExp(`^${name}=\\(\\n([\\s\\S]*?)^\\)`, "m"))?.[1];
  assert.ok(body, `install.sh declares ${name}`);
  return [...body.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function filesUnder(path) {
  const absolute = join(ROOT, path);
  if (!existsSync(absolute)) return [];
  if (statSync(absolute).isFile()) return [path];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) =>
    entry.name === "node_modules" ? [] : filesUnder(join(path, entry.name)));
}

const REPOSITORY_ONLY = /["'`][^"'`\n]*(\.claude\/tests\/|\.claude\/harness\/tests\/|\.claude\/harness\/fixtures\/|scripts\/(?:release|quality|lint)\/|docs\/reports\/|quality\/baselines\/)[^"'`\n]*["'`]/;

test("shipped code never references repository-only paths", () => {
  const install = readFileSync(join(ROOT, "install.sh"), "utf8");
  const unshipped = bashArray(install, "UNSHIPPED");
  const shipped = bashArray(install, "MANAGED").flatMap(filesUnder)
    .map((file) => relative(ROOT, join(ROOT, file)).split("\\").join("/"))
    .filter((file) => !unshipped.some((skip) => file === skip || file.startsWith(`${skip}/`)))
    .filter((file) => /\.(mjs|cjs|js|sh|py)$/.test(file));
  assert.ok(shipped.length > 50, "the managed surface was found");
  const findings = [];
  const repositoryOnly = (path) => /^(\.claude\/tests|\.claude\/harness\/tests|\.claude\/harness\/fixtures|scripts|docs|quality)(\/|$)/.test(path);
  for (const file of shipped) {
    const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
    lines.forEach((line, index) => {
      const match = REPOSITORY_ONLY.exec(line);
      if (match) findings.push(`${file}:${index + 1}: ${match[1]}`);
      for (const imported of line.matchAll(/(?:from\s+|import\s*\(\s*|require\s*\(\s*)["'`](\.{1,2}\/[^"'`]+)["'`]/g)) {
        const target = relative(ROOT, join(ROOT, dirname(file), imported[1])).split("\\").join("/");
        if (repositoryOnly(target)) findings.push(`${file}:${index + 1}: imports ${target}`);
      }
    });
  }
  assert.deepEqual(findings, [],
    "installed files cannot reach repository-only paths; move the dependency into the shipped surface or keep it in tests");
});
