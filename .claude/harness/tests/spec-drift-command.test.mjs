import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const FOUNDATION = fileURLToPath(new URL("../foundation.mjs", import.meta.url));
const CLI = fileURLToPath(new URL("../../../cli.sh", import.meta.url));

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
}

const FAKE_CLAUDE = `#!/bin/sh
echo "$1" >> "$FAKE_CLAUDE_LOG"
case "$1" in
  auth) echo '{"loggedIn":true}'; exit 0;;
  --help) echo "--print --output-format --json-schema --model --effort --permission-mode --tools --safe-mode --session-id --no-session-persistence"; exit 0;;
esac
printf '{"type":"result","subtype":"success","session_id":"fresh-%s","structured_output":{"summary":"read","findings":[{"severity":"major","section":"spec.md","message":"Paging no longer stops at the last page","recommendation":"Update the spec"}]}}\\n' "$$"
`;

function project(t, { install = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "foundation-spec-drift-cli-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(join(root, "openspec", "config.yaml"), "schema: foundation-standard\n");
  write(join(root, ".claude", "harness", "foundation.mjs"), "// project marker\n");
  write(join(root, "foundation.json"), { review: { independence: "self", diversity: "single-model",
    defaultReviewer: "claude-opus", fallbackReviewers: ["main-session"],
    reviewers: { "claude-opus": { adapter: "claude-cli", executable: "claude", providerFamily: "anthropic",
      modelFamily: "claude", modelId: "opus", reasoningEffort: "high", sandbox: "read-only", ephemeral: true } } } });
  write(join(root, "openspec", "specs", "search", "spec.md"),
    "### Requirement: paging\n\nThe system SHALL page results.\n");
  write(join(root, "openspec", "specs", "other", "spec.md"), "### Requirement: other\n\nThe system SHALL.\n");
  const archive = join(root, "openspec", "changes", "archive", "2026-01-01-search");
  write(join(archive, "specs", "search", "spec.md"), "### Requirement: paging\n\nThe system SHALL page results.\n");
  write(join(archive, "evidence.yaml"), { version: 2, claims: [{ id: "c1", requirementKey: "paging" }] });
  write(join(archive, "tasks.md"), "- [x] **T001** page [claims:c1] [paths:src/page.mjs] — verify: `node --test test/page.test.mjs`\n");
  write(join(root, "test", "page.test.mjs"), "");
  const bin = join(root, "bin");
  const log = join(root, "claude.log");
  if (install) {
    write(join(bin, "claude"), FAKE_CLAUDE);
    chmodSync(join(bin, "claude"), 0o755);
  }
  writeFileSync(log, "");
  const env = { ...process.env, CLAUDE_FOUNDATION_PROJECT: root, FOUNDATION_TELEMETRY: "0",
    FAKE_CLAUDE_LOG: log, PATH: install ? `${bin}${delimiter}${process.env.PATH}` : "/usr/bin:/bin" };
  const run = (...args) => spawnSync(process.execPath, [FOUNDATION, ...args], { cwd: root, encoding: "utf8", env });
  const reviews = () => readFileSync(log, "utf8").split("\n").filter((line) => line.startsWith("-p"));
  return { root, run, reviews };
}

test("spec-drift reports a vanished linked file, writes only its report, and exits 0", (t) => {
  const { root, run, reviews } = project(t);
  const result = run("spec-drift");
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.advisory, true);
  assert.deepEqual(report.counts, { "missing-file": 1, "no-origin": 1 });
  const paging = report.capabilities.find((row) => row.capability === "search").requirements[0];
  assert.deepEqual(paging.missing, ["src/page.mjs"]);
  assert.equal(existsSync(join(root, ".foundation", "spec-drift", "latest.json")), true);
  assert.equal(reviews().length, 0, "no reviewer without --review");
});

test("--capability scopes the report and an unknown one fails by name", (t) => {
  const { run } = project(t);
  const scoped = JSON.parse(run("spec-drift", "--capability", "other").stdout);
  assert.deepEqual(scoped.capabilities.map((row) => row.capability), ["other"]);
  const unknown = run("spec-drift", "--capability", "no-such");
  assert.notEqual(unknown.status, 0);
  assert.match(`${unknown.stderr}${unknown.stdout}`, /unknown capability 'no-such'/);
});

test("--review runs one fresh reviewer per capability and refuses without --capability", (t) => {
  const { run, reviews } = project(t);
  const refused = run("spec-drift", "--review");
  assert.notEqual(refused.status, 0);
  assert.match(`${refused.stderr}${refused.stdout}`, /requires --capability/);
  assert.equal(reviews().length, 0);
  const result = run("spec-drift", "--review", "--capability", "search,other", "--pretty");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(reviews().length, 2);
  assert.match(result.stdout, /^SPEC DRIFT \(advisory; nothing was changed\)/m);
  assert.match(result.stdout, /\[missing-file\] search · paging: src\/page\.mjs/);
  assert.match(result.stdout, /review search: completed, 1 finding/);
});

test("without the reviewer CLI --review leaves capabilities not-run", (t) => {
  const { run } = project(t, { install: false });
  const report = JSON.parse(run("spec-drift", "--review", "--capability", "search").stdout);
  assert.equal(report.capabilities[0].review.status, "not-run");
});

test("cli.sh routes spec-drift to the runtime", () => {
  assert.match(readFileSync(CLI, "utf8"), /\n {2}spec-drift\)\n {4}shift\n {4}run_runtime write spec-drift "\$@" ;;/);
});
