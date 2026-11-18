// Pyramid readiness: the per-layer criteria Change Loop applies to installed
// projects and to its own repository. Unmeasured criteria never count as a
// pass or a zero, and every unmet one names its next step.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  CRITERIA, LAYERS, REVIEW_TARGETS, pyramidReadiness, readinessText
} from "../runtime/quality/pyramid-readiness.mjs";
import { createPyramidReadinessCommand } from "../runtime/composition/pyramid-readiness-command.mjs";
import { registryIssues, ruleRegistrySummary } from "../runtime/quality/rule-registry.mjs";

const ALL_LANES = ["file-size", "nesting-depth", "duplication", "module-boundaries", "lint", "type-check",
  "workaround-comments", "test", "crap", "automated-mutation"];
const ready = () => ({
  lanes: Object.fromEntries(ALL_LANES.map((lane) => [lane, "ratcheting"])),
  findings: Object.fromEntries(ALL_LANES.slice(0, 7).map((lane) => [lane, 0])),
  featureMap: { features: 6, issues: 0 },
  lessons: { recurring: 2, pending: 0 },
  rules: { registered: 10, prose: 0, issues: 0, unregistered: 0 },
  incidents: { total: 2, closed: 2, missing: [] },
  outcomes: { archived: 5, measured: 5, firstProofPasses: 4, escapedDefects: 0 }
});

function project(t, files) {
  const root = mkdtempSync(join(tmpdir(), "pyramid-readiness-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof text === "string" ? text : JSON.stringify(text));
  }
  return root;
}

test("every layer has criteria, and a fully ready project is 100% everywhere", () => {
  for (const layer of LAYERS) assert.ok(CRITERIA.some((row) => row.layer === layer), layer);
  const value = pyramidReadiness(ready());
  assert.deepEqual(value.layers.map((layer) => layer.percent), [100, 100, 100, 100, 100]);
  assert.equal(value.focus, null);
});

test("a ratchet stops growth; clearing the debt is a separate criterion", () => {
  const facts = ready();
  facts.findings["file-size"] = 4;
  const value = pyramidReadiness(facts);
  const row = (id) => value.criteria.find((criterion) => criterion.id === id);
  assert.equal(row("file-size").status, "met");
  assert.equal(row("file-size-clear").status, "unmet");
  assert.match(row("file-size-clear").detail, /4 file-size finding\(s\) remain/);
  assert.equal(value.layers[0].percent, 89);
  assert.deepEqual(value.focus, { layer: "codebase", next: row("file-size-clear").next });
});

test("missing facts are unmeasured, never a pass or a zero, and each unmet row names its next step", () => {
  const value = pyramidReadiness({});
  const review = value.layers.find((layer) => layer.layer === "review");
  assert.deepEqual([review.percent, review.measured], [null, 0]);
  for (const row of value.criteria.filter((criterion) => criterion.status === "unmet")) assert.ok(row.next, row.id);
  for (const id of ["lint-clear", "type-check-clear", "lessons", "first-proof-pass", "escaped-defects"])
    assert.equal(value.criteria.find((criterion) => criterion.id === id).status, "unmeasured", id);
  assert.match(value.criteria.find((criterion) => criterion.id === "lint").next, /add a 'lint' lane/);
  assert.match(readinessText(value), /5 review\s+unmeasured/);
});

test("review needs enough archived changes, then judges first-proof pass and escaped defects", () => {
  const facts = ready();
  facts.outcomes = { archived: 2, measured: 2, firstProofPasses: 0, escapedDefects: 2 };
  for (const id of ["first-proof-pass", "escaped-defects"])
    assert.equal(pyramidReadiness(facts).criteria.find((row) => row.id === id).status, "unmeasured", id);
  facts.outcomes = { archived: 10, measured: 10, firstProofPasses: 5, escapedDefects: 2 };
  const review = pyramidReadiness(facts).criteria
    .filter((row) => ["first-proof-pass", "escaped-defects"].includes(row.id));
  assert.deepEqual(review.map((row) => row.status), ["unmet", "unmet"]);
  assert.match(review[0].detail, new RegExp(`target ${REVIEW_TARGETS.firstProofPassRate * 100}%`));
});

test("the guide-rule criterion reads the registry, its issues, and prose-only rules", (t) => {
  const root = project(t, {
    "AGENTS.md": "Never ship secrets.\nWrite tidy prose.\n",
    "test/secrets.test.js": "",
    "quality/rule-enforcement.json": { version: 1, rules: [
      { id: "secrets", source: "AGENTS.md", quote: "Never ship secrets.", layer: "test", enforcedBy: ["test/secrets.test.js"] },
      { id: "tidy", source: "AGENTS.md", quote: "Write tidy prose.", layer: "prose" }
    ] }
  });
  const summary = ruleRegistrySummary(root);
  assert.deepEqual([summary.rules, summary.proseOnly, summary.enforcedShare], [2, ["tidy"], 50]);
  assert.deepEqual(registryIssues(root, { rules: [{ id: "x", source: "AGENTS.md", quote: "gone", layer: "lint" }] }), [
    "rules[0] x: quote is no longer in AGENTS.md; update the quote or remove the rule",
    "rules[0] x: a lint rule names the files that enforce it (enforcedBy)"
  ]);
  const verdict = pyramidReadiness({ rules: { registered: 2, prose: 1, issues: 0 } }).criteria
    .find((row) => row.id === "guide-rules");
  assert.equal(verdict.status, "unmet");
  assert.match(verdict.detail, /1 of 2 rule\(s\) are prose only/);
});

test("the installed command reads lanes, feature map, lessons, registry, and outcomes into one value", (t) => {
  const root = project(t, {
    "src/app.js": "", "openspec/feature-map.json": { version: 1, features: [
      { id: "app", name: "App", summary: "The app", paths: ["src/**"] }] }
  });
  const logged = [];
  const command = createPyramidReadinessCommand({
    root, log: (line) => logged.push(line),
    laneStates: () => ({ lanes: { "file-size": "ratcheting", test: "not-run", lint: "no-baseline" },
      findings: { "file-size": 0, lint: 3 } }),
    lessonsValue: () => ({ lessons: [{ status: "enforced" }, { status: "prose-only" }] }),
    outcomesValue: () => ({ changes: [{ firstProofPass: true, escapedDefects: 0 },
      { firstProofPass: false, escapedDefects: 1 }, { firstProofPass: null, escapedDefects: 0 }] })
  });
  const value = command.showReadiness({ pretty: true });
  const status = (id) => value.criteria.find((row) => row.id === id).status;
  assert.equal(status("feature-map"), "met");
  assert.equal(status("file-size-clear"), "met");
  assert.equal(status("tests"), "met");
  assert.equal(status("lint"), "unmet");
  assert.equal(status("lessons"), "unmet");
  assert.equal(status("guide-rules"), "unmet");
  assert.equal(status("escaped-defects"), "unmet", "one escaped defect in three archived changes is over the 10% target");
  assert.match(logged[0], /^Pyramid readiness/);
  const row = command.readinessRow();
  assert.equal(row.id, "pyramid");
  assert.equal(row.level, "info");
  assert.match(row.detail, /^1 codebase \d+%, 2 static \d+%, 3 verification \d+%, 4 prose \d+%, 5 review/);
});

test("a failing fact source leaves its criteria unmeasured instead of failing the command", (t) => {
  const command = createPyramidReadinessCommand({ root: project(t, {}), log: () => {},
    laneStates: () => { throw new Error("broken config"); },
    lessonsValue: () => { throw new Error("broken store"); },
    outcomesValue: () => { throw new Error("broken store"); } });
  const value = command.readinessValue();
  assert.equal(value.criteria.find((row) => row.id === "lessons").status, "unmeasured");
  assert.equal(value.layers[4].percent, null);
});

test("guide rule sentences are imperative prose outside code, tables, and list lead-ins", async () => {
  const { ruleSentences } = await import("../runtime/quality/guide-rules.mjs");
  const sentences = ruleSentences([
    "# Heading that must be skipped", "",
    "Agents must run the gate. This sentence states a fact.", "",
    "These are project-owned and must be preserved:", "",
    "- Never edit receipts by hand.", "",
    "| Rule | must not count |", "|---|---|", "",
    "```sh", "# you must not count code", "```"
  ].join("\n"));
  assert.deepEqual(sentences, ["Agents must run the gate.", "Never edit receipts by hand."]);
});

test("an unregistered guide rule and a closed incident without a regression are unmet", (t) => {
  const root = project(t, {
    "AGENTS.md": "Never ship secrets.\n\nAlways write the changelog.\n",
    "test/secrets.test.js": "",
    "quality/rule-enforcement.json": { version: 1, rules: [
      { id: "secrets", source: "AGENTS.md", quote: "Never ship secrets.", layer: "test", enforcedBy: ["test/secrets.test.js"] }] },
    "openspec/incidents/README.md": "x", "openspec/incidents/_template.md": "| Status | closed |",
    "openspec/incidents/2026-01-01-a.md": "| Status | closed |\n| Regression | `test/secrets.test.js` |\n",
    "openspec/incidents/2026-01-02-b.md": "| Status | closed |\n| Regression | none yet |\n",
    "openspec/incidents/2026-01-03-c.md": "| Status | open |\n| Regression | none |\n"
  });
  const summary = ruleRegistrySummary(root);
  assert.deepEqual(summary.unregistered, [{ source: "AGENTS.md", sentence: "Always write the changelog." }]);
  const command = createPyramidReadinessCommand({ root, log: () => {}, laneStates: () => null,
    lessonsValue: () => ({ lessons: [] }), outcomesValue: () => ({ changes: [] }) });
  const value = command.readinessValue();
  const row = (id) => value.criteria.find((criterion) => criterion.id === id);
  assert.equal(row("guide-rules").status, "unmet");
  assert.match(row("guide-rules").detail, /1 rule sentence\(s\) in CLAUDE.md\/AGENTS.md have no registry row/);
  assert.equal(row("incident-regressions").status, "unmet");
  assert.match(row("incident-regressions").detail, /1 closed incident\(s\) without an existing regression: 2026-01-02-b/);
});
