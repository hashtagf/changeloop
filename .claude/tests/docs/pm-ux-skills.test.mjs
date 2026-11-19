// The PRD and ux-design skills: their checkers turn the document contracts
// into findings, and the PRD renderer produces a self-contained page.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const SKILLS = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "skills");
const { prdFindings } = await import(join(SKILLS, "prd/scripts/prd-check.mjs"));
const { page, inline } = await import(join(SKILLS, "prd/scripts/prd-html.mjs"));
const { BASE_COMPONENTS, projectFindings, uxuiFindings } = await import(join(SKILLS, "ux-design/scripts/uxui-check.mjs"));

function prd({ drop = null, ac = "AC-01 (US-01, US-02)" } = {}) {
  const body = {
    1: "Shoppers buy in three minutes [Assumption]. Metric: conversion ≥ 2.5%.",
    2: "Traffic peaks on the main site [Data] (analytics, 2026-11).",
    3: "| Pain | Who | Label |\n|---|---|---|\n| Shop is hidden | fans | [Data] |",
    4: "Landing plus checkout.\n\n- [ ] Every AC passes\n- [ ] Sign-off",
    5: "| ID | As a | I want | So that | Priority |\n|---|---|---|---|---|\n| US-01 | fan | buy | own it | Must |\n| US-02 | admin | edit | keep it current | Must |\n\nPersonas [Assumption].",
    6: `**${ac}**\n- Given stock 2\n- When adding 3\n- Then the cart holds 2`,
    7: "| Term | Meaning |\n|---|---|\n| SKU | variant code |",
    8: "| ID | Rule | Label |\n|---|---|---|\n| BR-01 | VAT included | [Assumption] |",
    9: "```mermaid\nflowchart TD\n  A --> B\n```",
    10: "| ID | Feature | Stories |\n|---|---|---|\n| F-01 | Landing | US-01 |\n| F-02 | Admin | US-02 |",
    11: "| Category | Requirement | Measure |\n|---|---|---|\n| Performance | LCP ≤ 2.5 s | Lighthouse |",
    12: "| ADR | Topic | Status |\n|---|---|---|\n| ADR-01 | Where the shop lives | Proposed |",
    13: "In scope: F-01, F-02. Out of scope: mobile app.",
    14: "| Type | Item | Impact |\n|---|---|---|\n| Dependency | Payment gateway | checkout |",
    15: "| Role | View | Edit |\n|---|---|---|\n| Admin (permission) | ✓ | ✓ |",
    16: "| Feature | Stories |\n|---|---|\n| F-01 | US-01 |\n| F-02 | US-02 |",
    17: "| Situation | User sees | System does |\n|---|---|---|\n| Card declined | Try another card | Keep order |",
    18: "| # | Question | Who |\n|---|---|---|\n| Q1 | What is sold? | Owner |"
  };
  return "# PRD — Shop\n\n" + Object.entries(body).filter(([n]) => Number(n) !== drop)
    .map(([n, text]) => `## ${n}. Section ${n}\n\n${text}\n`).join("\n");
}

test("a complete PRD has no finding; each broken contract is named", () => {
  assert.deepEqual(prdFindings(prd()), []);
  assert.ok(prdFindings(prd({ drop: 7 })).includes("missing section 7"));
  assert.ok(prdFindings(prd({ ac: "AC-01 (US-01)" })).includes("US-02 has no acceptance criterion in section 6"));
  assert.ok(prdFindings(prd().replace("```mermaid", "```text")).includes("section 9 has no Mermaid diagram"));
  assert.ok(prdFindings(prd().replace("| F-02 | US-02 |\n|", "|")).some((f) => f.includes("F-02 is missing")) ||
    prdFindings(prd().replace(/\| F-02 \| US-02 \|\n\n## 17/, "\n## 17")).some((f) => f.includes("F-02 is missing")));
  assert.ok(prdFindings(prd().replace("| Proposed |", "| |")).includes("ADR-01 has no status"));
  assert.ok(prdFindings(prd().replace("[Assumption]. Metric", ". Metric")).includes(
    "section 1 carries no [Data]/[Assumption]/[Decision] label"));
});

test("the PRD page has contents, labels, tables, checkboxes, and Mermaid blocks, escaped", () => {
  const html = page(prd() + "\n<script>alert(1)</script>\n");
  assert.match(html, /<nav aria-label="Contents">[\s\S]*href="#s0"/);
  assert.match(html, /<span class="tag tag-assumption">Assumption<\/span>/);
  assert.match(html, /<pre class="mermaid">flowchart TD\n  A --&gt; B<\/pre>/);
  assert.match(html, /<li class="task"><input type="checkbox" disabled> Every AC passes/);
  assert.match(html, /<div class="table"><table><thead><tr><th>ID<\/th>/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.equal(inline("`[Data]` and **bold** and `x<y`"), '<span class="tag tag-data">Data</span> and <strong>bold</strong> and <code>x&lt;y</code>');
});

const BLOCK = (version) => `/* Design System v${version} — 2026-11-19 */\n:root{--primary:#123}\n/* end Design System */`;
const system = (version = "1.0", components = BASE_COMPONENTS) => `<!doctype html><style>@media (prefers-reduced-motion: reduce){*{transition:none}}</style>
${components.map((name) => `<section data-component="${name}"><pre><code>x</code></pre><button type="button" data-copy>Copy</button></section>`).join("\n")}
<pre id="token-block">${BLOCK(version)}</pre>`;
const artifact = (version = "1.0", extra = "") => `<!doctype html><style>${BLOCK(version)}</style><div data-component="button"></div>${extra}
<section id="design-qa">Design System v${version}</section>`;
const uxui = (status = "done") => `# uxui.md — Shop
Work type: back-office
Design System: v1.0

## 1. Design Objective
Goal.
## 2. User Persona
- Busy admin [Assumption]
## 3. Information Architecture
Tree.
## 4. Permission Matrix
| Role | View |
## 5. User Journey
- Stage: find order [Data]
## 6. User Flow
Flow.
## 7. Screen Inventory
| Screen | Status |
|---|---|
| Orders | ${status} |
## 8. Content & Microcopy Guideline
Tone.
## 9. Design Rules
Rules.
## 10. Artifact Index
- orders.html
## 11. Changelog
| v1.0 | 2026-11-19 | first |
## 12. Open Questions
None.
`;

function project(t, files) {
  const dir = mkdtempSync(join(tmpdir(), "uxui-check-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

test("a consistent ux-design folder has no finding", (t) => {
  assert.deepEqual(projectFindings(project(t, { "uxui.md": uxui(), "design-system.html": system(),
    "orders.html": artifact() })), []);
});

test("each broken design contract is a finding", (t) => {
  const findings = projectFindings(project(t, {
    "uxui.md": uxui("finished").replace("- Busy admin [Assumption]", "- Busy admin").replace("## 4. Permission Matrix\n| Role | View |\n", ""),
    "design-system.html": system("1.1", BASE_COMPONENTS.filter((name) => name !== "date-picker")),
    "orders.html": artifact("1.0", '<div data-component="kanban"></div>'),
    "stale.html": artifact("1.1").replace("--primary:#123", "--primary:#456")
  }));
  const has = (text) => assert.ok(findings.some((finding) => finding.includes(text)), `${text}\n${findings.join("\n")}`);
  has('missing section "Permission Matrix"');
  has("User Persona item(s) without [Data] or [Assumption]");
  has('status "finished"');
  has("missing base component(s): date-picker");
  has("orders.html: Token Block v1.0 is not the current v1.1");
  has("orders.html: uses component(s) not in the design system: kanban");
  has("stale.html: Token Block v1.1 differs from the design system's");
  has("Changelog has no row for Design System v1.1");
  has("Artifact Index does not list stale.html");
});

test("uxui.md without a work type line is a finding", () => {
  assert.ok(uxuiFindings("# uxui.md\n").some((finding) => finding.includes("Work type")));
});
