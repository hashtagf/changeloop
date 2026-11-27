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
import { rawColorLiterals, uiReadinessFacts } from "../runtime/quality/ui-readiness.mjs";
import { verifyFacts } from "../runtime/quality/verify-readiness.mjs";

const ALL_LANES = ["file-size", "nesting-depth", "duplication", "module-boundaries", "lint", "type-check",
  "workaround-comments", "test", "crap", "automated-mutation"];
const ready = () => ({
  lanes: Object.fromEntries(ALL_LANES.map((lane) => [lane, "ratcheting"])),
  findings: Object.fromEntries(ALL_LANES.slice(0, 7).map((lane) => [lane, 0])),
  statuses: { test: "pass" },
  histories: { test: [{ status: "pass", durationMs: 40000, workspaceDigest: "a" },
    { status: "pass", durationMs: 41000, workspaceDigest: "a" }] },
  verify: { source: ".claude/skills/verify", kind: "skill" },
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
  assert.deepEqual(value.focus, { layer: "codebase", next: row("file-size-clear").next, why: row("file-size-clear").why });
});

test("a test lane counts only while its latest run passes", () => {
  const verdict = (statuses) => pyramidReadiness({ ...ready(), statuses }).criteria.find((row) => row.id === "tests");
  assert.equal(verdict({ test: "pass" }).status, "met");
  assert.equal(verdict({}).status, "unmeasured", "a configured lane that never ran is not a pass");
  const failing = verdict({ test: "fail" });
  assert.equal(failing.status, "unmet");
  assert.match(failing.next, /fix the failing tests/);
});

test("SCSS line comments are not code: tokens defined under one are not raw colors", () => {
  const sheet = "// Slate tokens\n:root {\n  // ---- light ----\n  --sc-ground: #eef1f6;\n}\n.a { background: url(http://x.test/a.png); color: #fff; }\n";
  assert.equal(rawColorLiterals(sheet, { lineComments: true }), 1, "only the color written outside a token counts");
  assert.equal(rawColorLiterals(sheet), 2, "plain CSS keeps // as text, as browsers do");
});

test("type-check is not applicable to JavaScript without TypeScript", (t) => {
  const js = project(t, { "package.json": { name: "x" }, "jsconfig.json": { compilerOptions: { paths: {} } } });
  const command = (root) => createPyramidReadinessCommand({ root, log: () => {}, laneStates: () => null,
    lessonsValue: () => ({ lessons: [] }), outcomesValue: () => ({ changes: [] }) }).readinessValue();
  const row = (value, id) => value.criteria.find((criterion) => criterion.id === id);
  assert.equal(row(command(js), "type-check").status, "not-applicable");
  assert.equal(row(command(js), "type-check-clear").status, "not-applicable");
  const checked = project(t, { "package.json": { name: "x" }, "jsconfig.json": { compilerOptions: { checkJs: true } } });
  assert.equal(row(command(checked), "type-check").status, "unmet", "checkJs makes a type checker apply");
  const ts = project(t, { "package.json": { name: "x", devDependencies: { typescript: "5" } } });
  assert.equal(row(command(ts), "type-check").status, "unmet");
});

test("a test lane must be fast and stable, and an unmet test row is the first next step", () => {
  const status = (facts, id) => pyramidReadiness({ ...ready(), ...facts }).criteria.find((row) => row.id === id);
  const run = (status, durationMs, workspaceDigest) => ({ status, durationMs, workspaceDigest });
  assert.equal(status({ histories: {} }, "tests-fast").status, "unmeasured");
  assert.equal(status({ histories: { test: [run("pass", 300000, "a")] } }, "tests-fast").status, "unmet");
  assert.equal(status({ histories: { test: [run("pass", 300000, "a"), run("pass", 9000, "b")] } }, "tests-fast").status, "met",
    "the latest run decides");
  // A consumer suite passed in 7s and then waited 360s for an open server: the next step names that, not a split.
  const lingering = status({ histories: { test: [{ ...run("pass", 360000, "a"), lingering: { testsMs: 7000, wallMs: 360000 } }] } },
    "tests-fast");
  assert.equal(lingering.status, "unmet");
  assert.match(lingering.detail, /finished in 7s but the run took 360s/);
  assert.match(lingering.next, /--test-force-exit right after --test/);
  const quickButLingering = status({ histories: { test: [{ ...run("pass", 60000, "a"),
    lingering: { testsMs: 2000, wallMs: 60000 } }] } }, "tests-fast");
  assert.equal(quickButLingering.status, "unmet", "under the time target, a run that waits after its tests still wastes every turn");
  assert.equal(status({ histories: { test: [{ ...run("pass", 9000, "a"), lingering: null }] } }, "tests-fast").status, "met",
    "a row without lingering facts, as older history rows are, reads as not lingering");
  assert.equal(status({ histories: { test: [run("pass", 1, "a"), run("fail", 1, "b")] } }, "tests-stable").status, "unmeasured",
    "a failure after a code change is not flakiness");
  const flaky = status({ histories: { test: [run("pass", 1, "a"), run("fail", 1, "a")] } }, "tests-stable");
  assert.equal(flaky.status, "unmet");
  assert.match(flaky.next, /rerun instead of fix/);

  // Lint debt is the weakest layer, but a flaky test lane is still the first thing to fix.
  const facts = { ...ready(), histories: { test: [run("pass", 1, "a"), run("fail", 1, "a")] } };
  facts.findings.lint = 9;
  const value = pyramidReadiness(facts);
  assert.equal(value.focus.next, flaky.next);
  assert.equal(pyramidReadiness({ ...ready(), verify: null }).focus.next,
    status({ verify: null }, "verify").next, "no verify route comes right after no tests");
});

test("a verify route is a skill, an end-to-end script, tool, config, or directory", (t) => {
  assert.equal(verifyFacts(project(t, { "src/a.js": "" })), null);
  assert.deepEqual(verifyFacts(project(t, { ".claude/skills/verify/SKILL.md": "# Verify\n" })),
    { source: ".claude/skills/verify", kind: "skill" });
  assert.equal(verifyFacts(project(t, { "package.json": { scripts: { "test:e2e": "x" } } })).source, "npm run test:e2e");
  assert.equal(verifyFacts(project(t, { "package.json": { devDependencies: { supertest: "7" } } })).kind, "dependency");
  assert.equal(verifyFacts(project(t, { "playwright.config.ts": "" })).kind, "config");
  assert.equal(verifyFacts(project(t, { "tests/e2e/flow.test.js": "" })).kind, "directory");
});

test("every criterion says in plain words why it helps the work", () => {
  for (const row of pyramidReadiness({}).criteria) assert.match(row.why || "", /\w+ \w+ \w+/, row.id);
});

test("a project without a quality config gets one setup step instead of a lane per gap", () => {
  const value = pyramidReadiness({ configured: false });
  assert.match(value.setup.next, /onboard skill/);
  assert.ok(["file-size", "lint", "type-check", "tests", "coverage", "mutation"].every((id) => value.setup.criteria.includes(id)));
  const text = readinessText(value);
  assert.match(text, /not set up yet; one onboarding pass covers \d+ criteria/);
  assert.equal(text.split(value.setup.next).length - 1, 2, "the setup step prints once, plus the focus line");
  assert.doesNotMatch(text, /file-size has no result/, "debt rows of an unconfigured lane are not repeated");
  assert.equal(pyramidReadiness({ configured: true }).setup, null);
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
      findings: { "file-size": 0, lint: 3 }, statuses: { test: "pass" } }),
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
  // A hyphenated compound names a kind of thing, not an instruction.
  assert.deepEqual(ruleSentences("Repository-only and read-only files are listed in docs.\n\nOnly the owner may delete.\n"),
    ["Only the owner may delete."]);
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

test("UI criteria apply only to a project with a user interface", (t) => {
  const uiRows = (value) => value.criteria.filter((row) => row.id.startsWith("ui-"));
  const without = pyramidReadiness({ ...ready(), ui: { present: false } });
  assert.ok(uiRows(without).every((row) => row.status === "not-applicable"));
  assert.ok(without.layers.every((layer) => layer.percent === 100), "not-applicable is neither measured nor met");
  assert.doesNotMatch(readinessText(without), /ui-|design tokens|DESIGN\.md/);

  const bare = { present: true, framework: "react", uiFiles: 3 };
  const gaps = pyramidReadiness({ ...ready(), ui: bare });
  assert.deepEqual(uiRows(gaps).map((row) => [row.id, row.layer, row.status]), [
    ["ui-tokens", "codebase", "unmet"], ["ui-a11y-lint", "static", "unmet"],
    ["ui-rendered", "verification", "unmet"], ["ui-accessibility", "verification", "unmet"],
    ["ui-design-doc", "prose", "unmet"]]);
  assert.ok(uiRows(gaps).every((row) => row.next), "each unmet UI criterion names its next step");
  const guarded = pyramidReadiness({ ...ready(), ui: { ...bare,
    tokens: { source: "src/tokens.css", rawColors: 0, rawColorFiles: [] },
    a11yLint: "eslint-plugin-jsx-a11y", rendered: "@playwright/test", a11yCheck: "@axe-core/playwright",
    design: "DESIGN.md" } });
  assert.ok(guarded.layers.every((layer) => layer.percent === 100));
  assert.equal(pyramidReadiness({ ...ready(), ui: null }).criteria.find((row) => row.id === "ui-tokens").status,
    "unmeasured");

  const app = project(t, {
    "package.json": JSON.stringify({ dependencies: { react: "19" },
      devDependencies: { "eslint-plugin-jsx-a11y": "6", "@playwright/test": "1" },
      scripts: { "test:a11y": "playwright test a11y" } }),
    "src/App.tsx": "export const App = () => null;\n",
    "src/theme.css": ":root { --space-1: 4px; --ink: #111; }\n",
    "docs/DESIGN.md": "# Design\n"
  });
  assert.deepEqual(uiReadinessFacts(app), { present: true, framework: "react", uiFiles: 1,
    tokens: { source: "src/theme.css", rawColors: 0, rawColorFiles: [] }, a11yLint: "eslint-plugin-jsx-a11y", rendered: "@playwright/test",
    a11yCheck: "test:a11y", design: "docs/DESIGN.md" });
  const html = project(t, { "index.html": "<main></main>\n", "test/fixture.html": "<p></p>\n" });
  assert.equal(uiReadinessFacts(html).uiFiles, 1, "test fixtures are not UI");
  assert.deepEqual(uiReadinessFacts(project(t, { "src/a.js": "1\n" })), { present: false });
  assert.equal(uiReadinessFacts(project(t, { "index.html": "<main></main>\n", "uxui.md": "# uxui.md\n" })).design,
    "uxui.md", "the ux-design skill's uxui.md is the design document");
});

test("design tokens are met only when no color is written outside a token definition", (t) => {
  assert.equal(rawColorLiterals(":root{--ink:#111;--soft:rgba(0,0,0,.1)}\n/* #fff */a{color:var(--ink)}"), 0);
  assert.equal(rawColorLiterals("a { color: #fff; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 1px hsl(0 0% 0%); }"), 3);
  assert.equal(rawColorLiterals(".x{background:linear-gradient(rgba(1,2,3,.1) 1px,transparent 1px)}"), 1,
    "a semicolon-free function argument stays one declaration");
  assert.equal(rawColorLiterals("a{color:currentColor;border-color:transparent}"), 0, "keywords are not literals");
  const row = (tokens) => pyramidReadiness({ ...ready(), ui: { present: true, framework: "react", uiFiles: 1,
    tokens } }).criteria.find((criterion) => criterion.id === "ui-tokens");
  assert.equal(row({ source: null, rawColors: 0, rawColorFiles: [] }).status, "unmet");
  const drift = row({ source: "src/theme.css", rawColors: 5,
    rawColorFiles: [{ path: "src/a.css", count: 4 }, { path: "src/b.css", count: 1 }] });
  assert.equal(drift.status, "unmet");
  assert.match(drift.detail, /5 color literal\(s\) outside token definitions: src\/a\.css 4, src\/b\.css 1/);
  assert.match(drift.next, /named token/);
  const app = project(t, {
    "src/App.tsx": "export const App = () => null;\n",
    "src/base.css": ":root { --ink: #111; }\nbody { color: var(--ink); background: #fafafa; }\n",
    "test/fixture.css": "a { color: red; background: #000; }\n"
  });
  assert.deepEqual(uiReadinessFacts(app).tokens, { source: "src/base.css", rawColors: 1,
    rawColorFiles: [{ path: "src/base.css", count: 1 }] }, "custom properties are a source; test fixtures are skipped");
});
