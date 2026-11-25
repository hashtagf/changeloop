import test from "node:test";
import assert from "node:assert/strict";
import { createInventory } from "./index.mjs";

test("stock is set, reserved and released with events", () => {
  const events = [];
  const inventory = createInventory({ emit: (event) => events.push(event) });
  inventory.setStock("shoe", 3);
  assert.deepEqual(inventory.reserve("shoe", 2), { sku: "shoe", stock: 1 });
  assert.throws(() => inventory.reserve("shoe", 2), { code: "OUT_OF_STOCK" });
  assert.deepEqual(inventory.release("shoe", 2), { sku: "shoe", stock: 3 });
  assert.deepEqual(events.map((event) => event.type), ["stock.set", "stock.reserved", "stock.released"]);
});

test("quantities are validated", () => {
  const inventory = createInventory();
  assert.throws(() => inventory.setStock("a", -1), { code: "INVALID_QUANTITY" });
  assert.throws(() => inventory.reserve("a", 0), { code: "INVALID_QUANTITY" });
  assert.equal(inventory.stock("unknown"), 0);
});
