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

const PRD2 = `${PRD}
## 7. Glossary
| Term | Meaning |
|---|---|
| ตะกร้า (Cart) | chosen items |
| Invoice | tax document |
## 14. Dependencies
| ID | Type | Item |
|---|---|---|
| DEP-01 | Dependency | Stock service for F-01 |
## 15. Data and Permission
| ID | Entity |
|---|---|
| DATA-01 | Cart rows for F-01 |
| ID | Permission | Shopper |
|---|---|---|
| PERM-01 | Edit own cart (F-01) | ✓ |
`;
const UXUI2 = `${UXUI}
## 4. Permission Matrix
| ID | Feature | Role | Edit |
|---|---|---|---|
| UP-01 | Cart | Guest | – |
| UP-02 | Codes | Admin | ✓ |
## 8. Content & Microcopy Guideline
| ID | Screen | Kind | Text |
|---|---|---|---|
| MC-01 | Cart | empty | "Your cart is empty" |
`;

test("dependencies, data, permissions, glossary terms, and uxui permission and copy rows are owed", () => {
  const prd = parsePrd(PRD2);
  assert.deepEqual([...scopedItems(prd, ["F-01"])].filter((id) => /^(DEP|DATA|PERM)/.test(id)).sort(), ["DATA-01", "DEP-01", "PERM-01"]);
  assert.deepEqual(prd.glossary.map((row) => row.aliases), [["ตะกร้า", "Cart"], ["Invoice"]]);
  const ux = parseUxui(UXUI2);
  assert.deepEqual(ux.microcopy[0].copy, ["Your cart is empty"]);
  const { issues } = productHandoffCoverage(covered, { prd: "PRD.md", uxui: "uxui.md", scope: ["F-01"] },
    { prdText: PRD2, uxuiText: UXUI2 });
  const has = (text) => assert.ok(issues.some((issue) => issue.includes(text)), `${text}\n${issues.join("\n")}`);
  has('does not cover DEP-01 from the PRD: cite "DEP-01" in a dependencies row');
  has('does not cover DATA-01 from the PRD: cite "DATA-01" in a dataModel row');
  has('does not cover PERM-01 from the PRD: cite "PERM-01" in a scenario');
  has('uses the PRD glossary term "ตะกร้า (Cart)" but its domainLanguage does not define it');
  has('does not cover UP-01 from uxui.md');
  has('does not cover MC-01 from uxui.md');
  assert.ok(!issues.some((issue) => issue.includes("Invoice") || issue.includes("UP-02")), "unused terms and other features are not owed");
  const complete = { ...covered,
    requirements: [{ ...covered.requirements[0], scenarios: [...covered.requirements[0].scenarios,
      { name: "PERM-01 shopper edits own cart", when: "x", then: "y" }, { name: "UP-01 guest cannot edit", when: "x", then: "y" }] }],
    dependencies: [{ name: "DEP-01 stock service" }], dataModel: [{ entity: "Cart", note: "DATA-01" }],
    domainLanguage: [{ term: "Cart", meaning: "chosen items", avoid: "basket" }],
    uiStates: [{ screen: "Cart", states: [{ state: "empty", shows: "Your cart is empty" }, { state: "error" }] }] };
  assert.deepEqual(productHandoffCoverage(complete, { prd: "PRD.md", uxui: "uxui.md", scope: ["F-01"] },
    { prdText: PRD2, uxuiText: UXUI2 }).issues, [], "microcopy counts when its exact text is used");
});

test("a project with product documents makes every draft declare productHandoff or why not", async (t) => {
  const { productDocuments, undeclaredHandoffIssues } = await import("../runtime/workflow/validation/handoff-binding.mjs");
  const root = mkdtempSync(join(tmpdir(), "handoff-discover-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(undeclaredHandoffIssues(root, undefined), []);
  for (const path of ["docs/PRD.md", "design/shop.uxui.md", "node_modules/x/PRD.md", "openspec/changes/a/PRD.md"]) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), "# x\n");
  }
  assert.deepEqual(productDocuments(root), ["design/shop.uxui.md", "docs/PRD.md"]);
  assert.match(undeclaredHandoffIssues(root, undefined)[0], /product documents \(design\/shop\.uxui\.md, docs\/PRD\.md\)/);
  assert.deepEqual(undeclaredHandoffIssues(root, { none: "typo fix" }), []);
  assert.deepEqual(productHandoffShapeIssues({ none: "typo fix" }), []);
  assert.ok(productHandoffShapeIssues({ none: "x", prd: "PRD.md" })[0].includes("cannot be combined"));
});

test("the packet record catches an edited document and an owed ID an amendment dropped", async (t) => {
  const { handoffPacketIssues, handoffRecordFor, writeHandoffRecord } =
    await import("../runtime/workflow/validation/handoff-binding.mjs");
  const root = mkdtempSync(join(tmpdir(), "handoff-binding-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packet = join(root, "openspec", "changes", "c");
  mkdirSync(join(packet, "specs", "cart"), { recursive: true });
  writeFileSync(join(root, "PRD.md"), PRD);
  writeFileSync(join(packet, "specs", "cart", "spec.md"), "US-01 cart\n#### Scenario: AC-01 over stock\nERR-01 BR-01\n");
  writeFileSync(join(packet, "tasks.md"), "- [ ] T001 F-01 cart\n");
  writeFileSync(join(packet, "design.md"), "NFR-01 Q1\n");
  writeFileSync(join(packet, "proposal.md"), "## Handoff coverage (PRD and UX/UI)\n\nAC-01 US-01\n");
  const record = handoffRecordFor(root, covered, { prd: "PRD.md", scope: ["F-01"] });
  assert.deepEqual(record.owed.sort(), ["AC-01", "BR-01", "ERR-01", "F-01", "NFR-01", "Q1", "US-01"]);
  writeHandoffRecord(packet, record);
  assert.deepEqual(handoffPacketIssues(root, packet), []);
  writeFileSync(join(packet, "specs", "cart", "spec.md"), "US-01 cart\nERR-01 BR-01\n");
  writeFileSync(join(packet, "design.md"), "NFR-01 Q1 AC-01\n");
  assert.match(handoffPacketIssues(root, packet).join("\n"), /no longer covers AC-01/,
    "a criterion must stay in the contract, not only in design.md or the coverage table");
  writeFileSync(join(root, "PRD.md"), `${PRD}\n| BR-02 | new |\n`);
  assert.match(handoffPacketIssues(root, packet).join("\n"), /PRD\.md changed after this agreement was compiled/);
  assert.equal(handoffRecordFor(root, {}, { none: "x" }), null);
});
