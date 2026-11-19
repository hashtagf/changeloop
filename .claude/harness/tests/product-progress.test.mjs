import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  createProductProgressCommand, documentItems, productProgress, productProgressLines
} from "../runtime/workflow/validation/product-progress.mjs";

const PRD = `# Shop
## Cart (F-01)
### US-01 Shopper keeps a cart
- AC-01: caps at stock
- AC-02: current price
- BR-01: free shipping from 990
## Checkout (F-02)
- US-02: pays by QR
  - AC-03: QR expires
## Coupons (F-03)
- US-03: enters a code
`;
const UXUI = `## Screen Inventory
| Screen | Feature | States |
|---|---|---|
| Cart | F-01 | empty, error |
## Copy
| ID | Screen | Text |
|---|---|---|
| MC-01 | Cart | "Your cart is empty" |
`;

function write(root, path, value) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), typeof value === "string" ? value : JSON.stringify(value));
}
const sha = (value) => createHash("sha256").update(value).digest("hex");
const record = (owed, excluded = [], digest = sha(PRD)) =>
  ({ version: 1, documents: [{ field: "prd", path: "docs/PRD.md", sha256: digest }], scope: ["F-01"], owed, excluded });

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "product-progress-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(root, "docs/PRD.md", PRD);
  // Archived: the cart, with AC-02 deferred.
  write(root, "openspec/changes/archive/2026-11-01-cart/handoff.json",
    record(["F-01", "US-01", "AC-01", "BR-01"], [{ id: "AC-02", reason: "ships with checkout" }]));
  // Proven, not landed: checkout, compiled against an earlier PRD.
  write(root, "openspec/changes/checkout/handoff.json", record(["F-02", "US-02", "AC-03", "AC-02"], [], sha("older")));
  write(root, ".foundation/runtime/checkout.json", { status: "proven" });
  return root;
}

test("every product item gets the latest state of the changes that owe it", (t) => {
  const root = fixture(t);
  const [doc] = productProgress(root).documents;
  assert.equal(doc.path, "docs/PRD.md");
  const state = Object.fromEntries(doc.items.map((item) => [item.id, item.state]));
  assert.deepEqual(state, { "F-01": "archived", "US-01": "archived", "AC-01": "archived", "AC-02": "proven",
    "BR-01": "archived", "F-02": "proven", "US-02": "proven", "AC-03": "proven", "F-03": "not-started", "US-03": "not-started" });
  assert.deepEqual(doc.summary, { "not-started": 2, "in-change": 0, proven: 4, archived: 4, total: 10 });
  const ac02 = doc.items.find((item) => item.id === "AC-02");
  assert.deepEqual(ac02.deferredBy, [{ change: "cart", reason: "ships with checkout" }]);
  assert.deepEqual(doc.changed, [{ change: "checkout", state: "proven" }], "compiled against an earlier revision");
  const lines = productProgressLines(productProgress(root)).join("\n");
  assert.match(lines, /docs\/PRD\.md: 4\/10 archived, 4 proven, 0 in a change, 2 not started/);
  assert.match(lines, /\[ \] F-03 Coupons \(F-03\)\n {4}\[ \] US-03/);
  assert.match(lines, /\[x\] AC-01 caps at stock — cart \(archived\)/);
  assert.match(lines, /! checkout \(proven\) was compiled against an earlier docs\/PRD\.md/);
});

test("strict fails while an item is in no change; a project without documents says so", (t) => {
  const root = fixture(t);
  const failures = [];
  const logs = [];
  createProductProgressCommand({ root, log: (line) => logs.push(line), fail: (message) => failures.push(message) })
    .showProductProgress({ strict: true });
  assert.deepEqual(failures, ["2 product item(s) are not in any change"]);
  assert.equal(JSON.parse(logs[0]).version, 1);
  const empty = mkdtempSync(join(tmpdir(), "product-progress-empty-"));
  t.after(() => rmSync(empty, { recursive: true, force: true }));
  assert.match(productProgressLines(productProgress(empty))[0], /No product documents/);
});

test("uxui documents contribute screen states and microcopy rows", () => {
  assert.deepEqual(documentItems(UXUI).map((item) => item.id), ["MC-01", "screen:Cart/empty", "screen:Cart/error"]);
});
