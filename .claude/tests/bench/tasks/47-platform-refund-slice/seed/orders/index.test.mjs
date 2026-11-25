import test from "node:test";
import assert from "node:assert/strict";
import { createOrders } from "./index.mjs";

function fakes() {
  const calls = [];
  return {
    calls,
    inventory: { reserve: (sku, quantity) => calls.push(["reserve", sku, quantity]) },
    payments: { charge: ({ orderId, amount }) => (calls.push(["charge", orderId, amount]), { id: "ch_1" }) }
  };
}

test("placing an order reserves stock, charges and records it", () => {
  const { calls, inventory, payments } = fakes();
  const events = [];
  const orders = createOrders({ emit: (event) => events.push(event), inventory, payments });
  const order = orders.place({ userId: "u1", sku: "shoe", quantity: 2, amount: 100 });
  assert.deepEqual(calls, [["reserve", "shoe", 2], ["charge", order.id, 100]]);
  assert.equal(orders.get(order.id).status, "placed");
  assert.equal(events.at(-1).type, "order.placed");
});

test("an invalid amount places nothing", () => {
  const { calls, inventory, payments } = fakes();
  const orders = createOrders({ inventory, payments });
  assert.throws(() => orders.place({ userId: "u1", sku: "a", quantity: 1, amount: 0 }), { code: "INVALID_AMOUNT" });
  assert.deepEqual(calls, []);
  assert.equal(orders.list().length, 0);
});
