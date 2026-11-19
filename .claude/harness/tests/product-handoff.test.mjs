// Product handoff coverage: a change built from PRD.md and uxui.md owes every
// in-scope item, cited in the right section or excluded with a reason.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  namedIds, parsePrd, parseUxui, productHandoffCoverage, productHandoffShapeIssues, renderProductHandoff, scopedItems
} from "../runtime/workflow/validation/product-handoff.mjs";
import { createSemanticReferences } from "../runtime/workflow/change/semantic-references.mjs";

const PRD = `# PRD
## 5. User Stories
| ID | As a | I want |
|---|---|---|
| US-01 | shopper | a cart |
| US-02 | shopper | a code |
## 6. Acceptance Criteria
**AC-01 (US-01) over stock**
- Given stock 2
**AC-02 (US-02) code minimum**
- Given a code
## 8. Business Rules
| ID | Rule |
|---|---|
| BR-01 | Price at order time |
## 10. Functional Specification
| ID | Feature |
|---|---|
| F-01 | Cart |
| F-02 | Codes |
## 11. NFR
| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | LCP ≤ 2.5 s |
## 12. ADR
| ADR | Topic | Status |
|---|---|---|
| ADR-01 | Platform | Proposed |
## 16. Feature Mapping
| Feature | Stories | AC | BR | NFR | Errors |
|---|---|---|---|---|---|
| F-01 Cart | US-01 | AC-01 | BR-01 | NFR-01 | ERR-01 |
| F-02 Codes | US-02 | AC-02 | — | — | — |
## 17. Error Handling
| ID | Situation |
|---|---|
| ERR-01 | Session expired |
## 18. Open Questions
| # | Question |
|---|---|
| Q1 | Does F-01 keep the cart for 7 days? |
| Q2 | Ship abroad? |
`;
const UXUI = `# uxui.md
Work type: back-office
## 7. Screen Inventory
| Screen | Feature | Purpose | States | Status |
|---|---|---|---|---|
| Cart | Cart | review | empty, error | done |
| Codes | Codes | apply | default | done |
`;

const covered = {
  requirements: [{ key: "cart", description: "US-01 cart; BR-01 price at order time",
    scenarios: [{ name: "AC-01 over stock", when: "x", then: "y" },
      { name: "ERR-01 session expired", kind: "failure", when: "x", then: "y" }] }],
  tasks: [{ key: "t", outcome: "F-01 cart" }],
  nfr: [{ key: "speed", measure: "NFR-01" }],
  decisions: [{ key: "keep", choice: "Q1: keep 7 days" }],
  uiStates: [{ screen: "Cart", states: [{ state: "empty" }, { state: "error" }] }]
};

test("IDs, ranges, and the PRD's items and mapping are read", () => {
  assert.deepEqual([...namedIds("AC-03–AC-05 and US-01, Q2")].sort(), ["AC-03", "AC-04", "AC-05", "Q2", "US-01"]);
  const prd = parsePrd(PRD);
  assert.deepEqual([...prd.items.keys()].sort(), ["AC-01", "AC-02", "ADR-01", "BR-01", "ERR-01", "F-01", "F-02",
    "NFR-01", "Q1", "Q2", "US-01", "US-02"]);
  assert.equal(prd.items.get("US-01").text, "shopper · a cart");
  assert.deepEqual([...scopedItems(prd, ["F-01"])].sort(), ["AC-01", "BR-01", "ERR-01", "F-01", "NFR-01", "Q1", "US-01"],
    "a feature owes its mapping row, the criteria of its stories, and the open questions that mention it");
  assert.equal(scopedItems(prd, "all").size, 12);
  assert.deepEqual(parseUxui(UXUI).screens[0], { screen: "Cart", feature: "Cart", states: ["empty", "error"] });
});

test("a draft that cites every scoped item in the right place is covered", () => {
  const { issues, rows } = productHandoffCoverage(covered, { prd: "PRD.md", uxui: "uxui.md", scope: ["F-01"] },
    { prdText: PRD, uxuiText: UXUI });
  assert.deepEqual(issues, []);
  assert.ok(rows.every((row) => row.coveredBy.length));
  assert.deepEqual(rows.find((row) => row.id === "AC-01").coveredBy, ['scenario "AC-01 over stock"']);
  assert.ok(!rows.some((row) => row.text.startsWith("Codes")), "screens of other features are not owed");
});

test("each missing item names where it belongs; the wrong place does not count", () => {
  const draft = { ...covered,
    requirements: [{ key: "cart", description: "US-01 cart, AC-01 here is not a scenario; BR-01",
      scenarios: [{ name: "ERR-01 not a failure", when: "x", then: "y" }] }],
    uiStates: [{ screen: "Cart", states: [{ state: "empty" }] }] };
  const { issues } = productHandoffCoverage(draft, { prd: "PRD.md", uxui: "uxui.md", scope: ["F-01"] },
    { prdText: PRD, uxuiText: UXUI });
  const has = (text) => assert.ok(issues.some((issue) => issue.includes(text)), `${text}\n${issues.join("\n")}`);
  has('does not cover AC-01 from the PRD: cite "AC-01" in a scenario');
  has('does not cover ERR-01 from the PRD: cite "ERR-01" in a scenario with "kind": "failure"');
  has('does not cover screen:Cart/error from uxui.md: add a uiStates row for screen "Cart" with state "error"');
  assert.equal(issues.length, 3);
});

test("exclusions need a reason and must be owed; excluding a story excludes its criteria", () => {
  const { issues, rows } = productHandoffCoverage({ requirements: [], tasks: [{ outcome: "F-02 codes" }] },
    { prd: "PRD.md", scope: ["F-02"], excluded: [{ id: "US-02", reason: "next change" }, { id: "US-01", reason: "x" },
      { id: "F-02" }] }, { prdText: PRD });
  assert.equal(rows.find((row) => row.id === "AC-02").excluded, "with US-02: next change");
  assert.ok(issues.some((issue) => issue.includes("excluded[2] needs an id and the reason")));
  assert.ok(issues.some((issue) => issue.includes("excluded names US-01, which is not owed")));
  assert.ok(!issues.some((issue) => issue.includes("AC-02")));
  assert.ok(productHandoffCoverage({}, { prd: "PRD.md", scope: ["F-09"] }, { prdText: PRD }).issues
    .some((issue) => issue.includes("scope names F-09, which the PRD does not define")));
  assert.deepEqual(productHandoffShapeIssues({ scope: "all" }), ["semantic draft productHandoff names neither prd nor uxui"]);
});

test("the proposal section groups items under the PRD headings and shows exclusions", () => {
  const coverage = productHandoffCoverage(covered, { prd: "PRD.md", uxui: "uxui.md", scope: ["F-01"] },
    { prdText: PRD, uxuiText: UXUI });
  const body = renderProductHandoff({ ...coverage, documents: "`PRD.md`" });
  for (const heading of ["### User stories", "### Acceptance criteria", "### Business rules", "### Error handling",
    "### Open questions", "### Screens and states"]) assert.ok(body.includes(heading), heading);
  assert.match(body, /\| AC-01 \| \(US-01\) over stock \| scenario "AC-01 over stock" \|/);
  assert.equal(renderProductHandoff(null), "");
});

test("change start reads the documents from the project and refuses an uncovered draft", (t) => {
  const root = mkdtempSync(join(tmpdir(), "product-handoff-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "docs"));
  writeFileSync(join(root, "docs", "PRD.md"), PRD);
  const references = createSemanticReferences({ root, pathInside: (base, path) => path.startsWith(base),
    fail: (message) => { throw new Error(message); } });
  const draft = { productHandoff: { prd: "docs/PRD.md", scope: ["F-02"] }, requirements: [], tasks: [] };
  const issues = references.semanticReferenceIssues(draft);
  assert.ok(issues.some((issue) => issue.includes("does not cover US-02")));
  assert.equal(draft._productHandoffCoverage.documents, "`docs/PRD.md`");
  assert.ok(references.semanticReferenceIssues({ productHandoff: { prd: "docs/missing.md" } })
    .some((issue) => issue.includes("productHandoff.prd must reference an existing regular file")));
});
