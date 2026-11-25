import test from "node:test";
import assert from "node:assert/strict";
import { initialState, reduce } from "./state.mjs";

test("placed orders appear without mutating the previous state", () => {
  const before = initialState();
  const after = reduce(before, { type: "order.placed", payload: { orderId: "o1", sku: "a", quantity: 1, amount: 5 } });
  assert.deepEqual(after.orders.o1, { id: "o1", sku: "a", quantity: 1, amount: 5, status: "placed" });
  assert.deepEqual(before.orders, {});
  assert.equal(reduce(after, { type: "unknown" }), after);
});
