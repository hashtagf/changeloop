import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { archivedTasks, createSpecDriftRuntime, specRequirements } from "../runtime/workflow/change/spec-drift.mjs";

const REVIEWER = { adapter: "claude-cli", executable: "claude", providerFamily: "anthropic", modelFamily: "claude",
  modelId: "opus", reasoningEffort: "high", sandbox: "read-only", ephemeral: true };
const POLICY = { review: { defaultReviewer: "claude-opus", reviewers: { "claude-opus": REVIEWER } } };

function write(root, path, text) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
}
const spec = (...names) => names.map((name) => `### Requirement: ${name}\n\nThe system SHALL do ${name}.\n`).join("\n");
const task = (id, claims, paths, verify) =>
  `- [x] **${id}** work [claims:${claims.join(",")}] [paths:${paths.join(",")}] — verify: \`${verify}\`\n`;

function fixture(t, { installed = () => true, runPromptReview = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), "spec-drift-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(root, "openspec/specs/search/spec.md", spec("tag-filter", "paging", "legacy"));
  write(root, "openspec/specs/empty/spec.md", "# empty\n\n## Purpose\n\nNo requirements.\n");
  const older = "openspec/changes/archive/2026-01-01-search";
  write(root, `${older}/specs/search/spec.md`, spec("tag-filter", "paging"));
  write(root, `${older}/evidence.yaml`, JSON.stringify({ version: 2, claims: [
    { id: "c-tag", requirementKey: "tag-filter" }, { id: "c-page", requirementKey: "paging" }] }));
  write(root, `${older}/tasks.md`, "# Tasks\n\n" +
    task("T001", ["c-tag"], ["src/search/**", "src/tag.mjs"], "node --test test/tag.test.mjs") +
    task("T002", ["c-page"], ["src/page.mjs"], "node --test test/page.test.mjs"));
  write(root, "src/search/index.mjs", "");
  write(root, "src/tag.mjs", "");
  write(root, "test/tag.test.mjs", "");
  write(root, "test/page.test.mjs", "");
  const calls = [];
  const runtime = createSpecDriftRuntime({ root, foundationPolicy: () => POLICY, reviewerInstalled: installed,
    environment: {}, now: () => "2026-11-26T00:00:00.000Z", fail: (message) => { throw new Error(message); },
    log: () => {}, runPromptReview: (request) => {
      calls.push(request);
      return (runPromptReview || (() => ({ ok: true, sessionId: `s-${calls.length}`,
        output: { summary: "", findings: [{ severity: "major", section: "spec.md", message: "m", recommendation: "r" }] } })))(request);
    } });
  const status = (report, name) => report.capabilities.flatMap((row) => row.requirements)
    .find((row) => row.requirement === name);
  return { root, runtime, calls, status, older };
}

test("parsers read requirement blocks and task claims, paths, and verify", () => {
  assert.deepEqual(specRequirements(spec("a", "b")).map((row) => row.name), ["a", "b"]);
  assert.deepEqual(archivedTasks(task("T001", ["x"], ["a.mjs", "b/**"], "node t.mjs")),
    [{ claims: ["x"], paths: ["a.mjs", "b/**"], verify: "node t.mjs" }]);
});

test("a deleted linked file is missing-file with its path", (t) => {
  const value = fixture(t);
  const { report } = value.runtime.runSpecDrift();
  const paging = value.status(report, "paging");
  assert.equal(paging.status, "missing-file");
  assert.deepEqual(paging.missing, ["src/page.mjs"]);
  assert.equal(paging.origin, "2026-01-01-search");
});

test("a linked file found once elsewhere by name is moved with its new path", (t) => {
  const value = fixture(t);
  write(value.root, "src/paging/page.mjs", "");
  const paging = value.status(value.runtime.runSpecDrift().report, "paging");
  assert.equal(paging.status, "moved");
  assert.deepEqual(paging.moved, { "src/page.mjs": "src/paging/page.mjs" });
  assert.equal(paging.missing, undefined);
});

test("an ambiguous name is not guessed and stays missing-file", (t) => {
  const value = fixture(t);
  write(value.root, "src/a/page.mjs", "");
  write(value.root, "src/b/page.mjs", "");
  const paging = value.status(value.runtime.runSpecDrift().report, "paging");
  assert.equal(paging.status, "missing-file");
  assert.deepEqual(paging.missing, ["src/page.mjs"]);
  assert.equal(paging.moved, undefined);
});

test("a moved file beside a truly missing one stays missing-file and shows the move", (t) => {
  const value = fixture(t);
  write(value.root, "src/paging/page.mjs", "");
  rmSync(join(value.root, "test", "page.test.mjs"));
  const paging = value.status(value.runtime.runSpecDrift().report, "paging");
  assert.equal(paging.status, "missing-file");
  assert.deepEqual(paging.missing, ["test/page.test.mjs"]);
  assert.deepEqual(paging.moved, { "src/page.mjs": "src/paging/page.mjs" });
});

test("a glob whose directory vanished never moves", (t) => {
  const value = fixture(t);
  rmSync(join(value.root, "src", "search"), { recursive: true, force: true });
  write(value.root, "lib/search/index.mjs", "");
  const tag = value.status(value.runtime.runSpecDrift().report, "tag-filter");
  assert.equal(tag.status, "missing-file");
  assert.deepEqual(tag.missing, ["src/search/**"]);
});

test("a requirement whose linked files all exist is ok, globs checked by their prefix", (t) => {
  const value = fixture(t);
  const tag = value.status(value.runtime.runSpecDrift().report, "tag-filter");
  assert.equal(tag.status, "ok");
  assert.equal(tag.link, "requirement");
  assert.deepEqual(tag.files, ["src/search/**", "src/tag.mjs", "test/tag.test.mjs"]);
});

test("a requirement no archived change wrote is no-origin", (t) => {
  const value = fixture(t);
  assert.equal(value.status(value.runtime.runSpecDrift().report, "legacy").status, "no-origin");
});

test("a backticked path in the requirement text that is gone is missing-file", (t) => {
  const value = fixture(t);
  write(value.root, "openspec/specs/search/spec.md", spec("tag-filter") +
    "\n### Requirement: legacy\n\nThe system SHALL keep `src/old/gone.mjs` working.\n");
  const legacy = value.status(value.runtime.runSpecDrift().report, "legacy");
  assert.equal(legacy.status, "missing-file");
  assert.deepEqual(legacy.missing, ["src/old/gone.mjs"]);
});

test("--capability limits the report and an unknown capability fails by name", (t) => {
  const value = fixture(t);
  const { report } = value.runtime.runSpecDrift({ capabilities: ["empty"] });
  assert.deepEqual(report.capabilities.map((row) => row.capability), ["empty"]);
  assert.throws(() => value.runtime.runSpecDrift({ capabilities: ["no-such"] }), /unknown capability 'no-such'/);
});

test("a corrupt or old-shaped archive makes its requirements unreadable, never ok", (t) => {
  const value = fixture(t);
  write(value.root, `${value.older}/evidence.yaml`, "{ not json");
  const tag = value.status(value.runtime.runSpecDrift().report, "tag-filter");
  assert.equal(tag.status, "unreadable");
  assert.match(tag.path, /2026-01-01-search$/);
  // Old shapes with valid tasks whose files all exist are still never ok.
  for (const evidence of [{ version: 1 }, { version: 2, claims: [] },
    { version: 2, claims: [{ id: "c-x", requirementKey: "other" }] }]) {
    write(value.root, `${value.older}/evidence.yaml`, JSON.stringify(evidence));
    const row = value.status(value.runtime.runSpecDrift().report, "tag-filter");
    assert.equal(row.status, "unreadable", JSON.stringify(evidence));
    assert.match(row.reason, /no claim/);
  }
  write(value.root, `${value.older}/evidence.yaml`, JSON.stringify({ version: 2, claims: [
    { id: "c-tag", requirementKey: "tag-filter" }] }));
  write(value.root, `${value.older}/tasks.md`, task("T001", ["c-other"], ["src/tag.mjs"], "true"));
  assert.match(value.status(value.runtime.runSpecDrift().report, "tag-filter").reason, /no task/);
  write(value.root, `${value.older}/tasks.md`, "# Tasks\n\nno task lines\n");
  assert.equal(value.status(value.runtime.runSpecDrift().report, "paging").status, "unreadable");
});

test("a titled requirement links through a claim naming one of its scenarios", (t) => {
  const value = fixture(t);
  write(value.root, "openspec/specs/search/spec.md", "### Requirement: Results filter by tag\n\nSHALL.\n");
  write(value.root, `${value.older}/specs/search/spec.md`,
    "### Requirement: Results filter by tag\n\nSHALL.\n\n#### Scenario: red tag\n\n- **WHEN** x\n");
  write(value.root, `${value.older}/evidence.yaml`, JSON.stringify({ version: 2, claims: [
    { id: "c-tag", requirementKey: "tag-filter", scenario: "red tag" },
    { id: "c-page", requirementKey: "paging", scenario: "pages" }] }));
  const row = value.status(value.runtime.runSpecDrift().report, "Results filter by tag");
  assert.equal(row.status, "ok");
  assert.equal(row.link, "requirement");
  assert.deepEqual(row.files, ["src/search/**", "src/tag.mjs", "test/tag.test.mjs"]);
});

test("claims from before requirement keys link the whole change, labelled change", (t) => {
  const value = fixture(t);
  write(value.root, `${value.older}/evidence.yaml`, JSON.stringify({ version: 2, claims: [
    { id: "c-tag", scenario: "tags filter" }, { id: "c-page", scenario: "pages" }] }));
  const tag = value.status(value.runtime.runSpecDrift().report, "tag-filter");
  assert.equal(tag.link, "change");
  assert.equal(tag.status, "missing-file", "every task of the change counts, including the deleted page file");
  assert.deepEqual(tag.missing, ["src/page.mjs"]);
});

test("a capability without requirements reports zero rows without failing", (t) => {
  const value = fixture(t);
  const row = value.runtime.runSpecDrift().report.capabilities.find((entry) => entry.capability === "empty");
  assert.deepEqual(row.requirements, []);
});

test("--review runs one fresh reviewer per selected capability and records findings", (t) => {
  const value = fixture(t);
  const { report } = value.runtime.runSpecDrift({ capabilities: ["search", "empty"], review: true });
  assert.equal(value.calls.length, 2);
  assert.match(value.calls[0].prompt, /openspec\/specs\/search\/spec\.md/);
  assert.match(value.calls[0].prompt, /src\/tag\.mjs/);
  assert.doesNotMatch(value.calls[0].prompt, /src\/page\.mjs/, "missing files are not sent to the reviewer");
  assert.equal(report.capabilities[0].review.status, "completed");
  assert.equal(report.capabilities[0].review.findings.length, 1);
});

test("--review without a capability is refused before any reviewer runs", (t) => {
  const value = fixture(t);
  assert.throws(() => value.runtime.runSpecDrift({ review: true }), /requires --capability/);
  assert.equal(value.calls.length, 0);
});

test("a failing or absent reviewer leaves the capability not-run, not matched", (t) => {
  const failing = fixture(t, { runPromptReview: () => ({ ok: false, detail: "rate limited" }) });
  const review = failing.runtime.runSpecDrift({ capabilities: ["search"], review: true }).report.capabilities[0].review;
  assert.equal(review.status, "not-run");
  assert.match(review.reason, /rate limited; rate limited/);
  const absent = fixture(t, { installed: () => false });
  const none = absent.runtime.runSpecDrift({ capabilities: ["search"], review: true }).report.capabilities[0].review;
  assert.equal(none.status, "not-run");
  assert.equal(absent.calls.length, 0);
});

test("without --review no reviewer is spawned", (t) => {
  const value = fixture(t);
  value.runtime.runSpecDrift({ capabilities: ["search"] });
  assert.equal(value.calls.length, 0);
});

test("the report is the only write and drift is not an error", (t) => {
  const value = fixture(t);
  execFileSync("git", ["init", "-q"], { cwd: value.root });
  execFileSync("git", ["add", "-A"], { cwd: value.root });
  const before = execFileSync("git", ["status", "--porcelain"], { cwd: value.root, encoding: "utf8" });
  const { report, path } = value.runtime.runSpecDrift();
  assert.ok(report.counts["missing-file"] >= 1);
  assert.equal(path, ".foundation/spec-drift/latest.json");
  const after = execFileSync("git", ["status", "--porcelain"], { cwd: value.root, encoding: "utf8" });
  assert.equal(after.replace(/^\?\? \.foundation\/\n/m, ""), before);
});
