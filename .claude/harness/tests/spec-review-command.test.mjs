import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const FOUNDATION = fileURLToPath(new URL("../foundation.mjs", import.meta.url));
const ROUTER = fileURLToPath(new URL("../runtime/core/cli-router.mjs", import.meta.url));

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
}

// A stand-in `claude` CLI: ready, read-only flags present, and every review a
// new session. Each invocation is logged so a test can prove nothing spawned.
const FAKE_CLAUDE = `#!/bin/sh
echo "$1" >> "$FAKE_CLAUDE_LOG"
case "$1" in
  auth) echo '{"loggedIn":true}'; exit 0;;
  --help) echo "--print --output-format --json-schema --model --effort --permission-mode --tools --safe-mode --session-id --no-session-persistence"; exit 0;;
esac
session="fresh-$$-$(date +%s%N)"
printf '{"type":"result","subtype":"success","session_id":"%s","structured_output":{"summary":"read","findings":[{"severity":"major","section":"proposal.md","message":"Who is affected is unstated","recommendation":"Name the user"}]}}\\n' "$session"
`;

function project(t, { status = "planned", install = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "foundation-spec-review-cli-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(join(root, "openspec", "config.yaml"), "schema: foundation-standard\n");
  write(join(root, ".claude", "harness", "foundation.mjs"), "// project marker\n");
  write(join(root, "foundation.json"), { review: {
    independence: "self", diversity: "single-model",
    defaultReviewer: "claude-opus", fallbackReviewers: ["main-session"],
    reviewers: { "claude-opus": { adapter: "claude-cli", executable: "claude",
      providerFamily: "anthropic", modelFamily: "claude", modelId: "opus",
      reasoningEffort: "high", sandbox: "read-only", ephemeral: true } }
  } });
  write(join(root, ".foundation", "runtime", "demo.json"),
    { id: "demo", status, contractRevision: 1, impact: "medium", riskSignals: [] });
  write(join(root, "openspec", "changes", "demo", "proposal.md"), "## Summary\n\nFilter by tag.\n");
  write(join(root, "openspec", "changes", "demo", "evidence.yaml"), JSON.stringify({ version: 2, claims: [] }));
  write(join(root, "openspec", "changes", "demo", "specs", "search", "spec.md"),
    "### Requirement: tag\n\nThe system SHALL filter by tag.\n");
  const bin = join(root, "bin");
  const log = join(root, "claude.log");
  if (install) {
    write(join(bin, "claude"), FAKE_CLAUDE);
    chmodSync(join(bin, "claude"), 0o755);
  }
  writeFileSync(log, "");
  const run = (...args) => spawnSync(process.execPath, [FOUNDATION, ...args], {
    cwd: root, encoding: "utf8",
    env: { ...process.env, CLAUDE_FOUNDATION_PROJECT: root, FOUNDATION_TELEMETRY: "0",
      FAKE_CLAUDE_LOG: log, FOUNDATION_CLAUDE_SESSION_ID: "host-session",
      PATH: install ? `${bin}${delimiter}${process.env.PATH}` : "/usr/bin:/bin" }
  });
  const reviews = () => readFileSync(log, "utf8").split("\n").filter((line) => line.startsWith("-p"));
  return { root, run, log, reviews };
}

test("spec-review runs three fresh reviews and records them against the packet", (t) => {
  const { root, run, reviews } = project(t);
  const result = run("spec-review", "demo");
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.advisory, true);
  assert.equal(summary.status, "current");
  assert.deepEqual(summary.lenses.map((row) => row.status), ["completed", "completed", "completed"]);
  assert.equal(summary.counts.major, 3);
  assert.equal(reviews().length, 3);
  const record = JSON.parse(readFileSync(join(root, ".foundation", "spec-reviews", "demo", "latest.json"), "utf8"));
  assert.equal(new Set(record.lenses.map((row) => row.sessionId)).size, 3);
  assert.match(record.packetDigest, /^sha256:/);
  // package now carries it as advisory data.
  const packaged = JSON.parse(run("package", "demo").stdout);
  assert.equal(packaged.specReview.status, "current");
  assert.equal(packaged.specReview.counts.major, 3);
});

test("spec-review --pretty prints a readable advisory summary", (t) => {
  const { run } = project(t);
  const result = run("spec-review", "demo", "--pretty");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^SPEC REVIEW demo \(advisory; approval is not blocked\)/m);
  assert.match(result.stdout, /zoom-out: completed/);
});

test("only the spec-review command runs a spec review; package and start never do", (t) => {
  const { run, reviews } = project(t);
  assert.equal(run("package", "demo").status, 0);
  assert.equal(reviews().length, 0);
  const router = readFileSync(ROUTER, "utf8");
  assert.equal(router.match(/showSpecReview\(/g)?.length, 1, "called from one handler only");
  const handler = router.slice(router.indexOf('"spec-review": async'));
  assert.ok(handler.indexOf("showSpecReview(rest[0], flags)") > 0 &&
    handler.indexOf("showSpecReview(rest[0], flags)") < handler.indexOf("\n    },"));
});

test("an unknown change fails naming the id and spawns no reviewer", (t) => {
  const { run, log } = project(t);
  const result = run("spec-review", "missing-change");
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /unknown change 'missing-change'/);
  assert.equal(readFileSync(log, "utf8"), "");
  assert.notEqual(run("spec-review").status, 0, "a change id is required");
});

test("a change that entered Land is refused and spawns no reviewer", (t) => {
  for (const status of ["applied", "archived"]) {
    const { root, run, log } = project(t, { status });
    const result = run("spec-review", "demo");
    assert.notEqual(result.status, 0, status);
    assert.match(`${result.stderr}${result.stdout}`, /already entered Land/);
    assert.equal(readFileSync(log, "utf8"), "");
    assert.equal(existsSync(join(root, ".foundation", "spec-reviews")), false);
  }
});

test("without the reviewer CLI every lens is not-run and the command still reports", (t) => {
  const { run } = project(t, { install: false });
  const result = run("spec-review", "demo");
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  assert.deepEqual(summary.notRun, ["comprehension", "implementation-readiness", "zoom-out"]);
  assert.deepEqual(summary.findings, []);
});
