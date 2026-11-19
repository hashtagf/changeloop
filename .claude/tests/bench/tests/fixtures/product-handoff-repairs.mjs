// Reference delivery for the product handoff cart (task 45) and the plausible
// wrong deliveries its oracle must reject: each drops one handed-over item.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
}

export function repairCart(project) {
  write(join(project, "src/cart.js"), `// The shop cart (F-01 in docs/requirements.md).
const LIMIT = 10;
const FREE_FROM = 990;
const SHIPPING = 50;

export function createCart({ stock, prices } = {}) {
  const lines = new Map();
  return {
    add(sku, quantity) {
      let available;
      try { available = stock.available(sku); } catch { return { ok: false, error: "STOCK_UNAVAILABLE" }; }
      const wanted = (lines.get(sku) || 0) + quantity;
      const cap = Math.min(available, LIMIT);
      const kept = Math.min(wanted, cap);
      lines.set(sku, kept);
      if (wanted <= cap) return { ok: true, quantity: kept };
      return { ok: true, quantity: kept, notice: available < LIMIT ? \`Only \${available} left\` : "Limit 10 per item" };
    },
    remove(sku) { lines.delete(sku); },
    items() { return [...lines].map(([sku, quantity]) => ({ sku, quantity })); },
    totals() {
      let subtotal = 0;
      for (const [sku, quantity] of lines) subtotal += quantity * prices.current(sku);
      const shipping = subtotal === 0 || subtotal >= FREE_FROM ? 0 : SHIPPING;
      return { subtotal, shipping, total: subtotal + shipping };
    }
  };
}
`);
  write(join(project, "test/cart-rules.test.mjs"), `import assert from "node:assert/strict";
import test from "node:test";
import { createCart } from "../src/cart.js";

test("adding beyond stock caps the line", () => {
  const cart = createCart({ stock: { available: () => 2 }, prices: { current: () => 100 } });
  assert.equal(cart.add("A", 3).quantity, 2);
});
`);
  // What Land leaves in the project: the archived packet with its handoff record.
  write(join(project, "openspec/changes/archive/2026-11-20-cart/handoff.json"), JSON.stringify({
    version: 1, documents: [{ field: "prd", path: "docs/requirements.md", sha256: "x" }], scope: ["F-01"],
    owed: ["US-01", "AC-01", "AC-02", "AC-03", "AC-04", "BR-01", "BR-02", "ERR-01", "F-01", "GL:Cart (ตะกร้า)"],
    excluded: [{ id: "Q1", reason: "answered in the document" }]
  }));
}

export const CART_MUTANTS = [
  ["CASE_AC01_CAP_AT_STOCK", "no stock notice", [["notice: available < LIMIT ? `Only ${available} left` : \"Limit 10 per item\"", "notice: available < LIMIT ? undefined : \"Limit 10 per item\""]]],
  ["CASE_AC02_CURRENT_PRICE", "price frozen at add", [["const lines = new Map();", "const lines = new Map();\n  const frozen = new Map();"],
    ["lines.set(sku, kept);", "lines.set(sku, kept); if (!frozen.has(sku)) frozen.set(sku, prices.current(sku));"],
    ["quantity * prices.current(sku)", "quantity * frozen.get(sku)"]]],
  ["CASE_AC03_REMOVE", "remove does nothing", [["remove(sku) { lines.delete(sku); }", "remove(sku) { void sku; }"]]],
  ["CASE_AC04_SAME_ITEM_LINE_CAPPED", "cap per add, not per line", [["const wanted = (lines.get(sku) || 0) + quantity;", "const wanted = quantity;"],
    ["lines.set(sku, kept);", "lines.set(sku, (lines.get(sku) || 0) + kept);"]]],
  ["CASE_BR01_SHIPPING", "free shipping above, not at, 990", [["subtotal >= FREE_FROM", "subtotal > FREE_FROM"]]],
  ["CASE_BR02_LIMIT_TEN", "no per-item limit", [["const cap = Math.min(available, LIMIT);", "const cap = available;"]]],
  ["CASE_ERR01_STOCK_DOWN", "stock failure treated as zero stock", [["catch { return { ok: false, error: \"STOCK_UNAVAILABLE\" }; }", "catch { available = 0; }"]]]
];
