// Calibration answer for 47-platform-refund-slice: only payments, orders,
// notifications and web change; it proves the hidden oracle passes a correct
// delivery that leaves the six read-only repositories untouched.
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function replace(project, path, before, after) {
  const file = join(project, path);
  const text = readFileSync(file, "utf8");
  if (!text.includes(before)) throw new Error(`repair anchor missing in ${path}`);
  writeFileSync(file, text.replace(before, after));
}

export function repairPlatformRefund(project) {
  replace(project, "payments/index.mjs", "    get: (id) =>", `    refund(chargeId, amount) {
      const charge = charges.get(chargeId);
      if (!charge) throw fail("NOT_FOUND");
      const remaining = charge.amount - charge.refunded;
      const value = amount === undefined ? remaining : amount;
      if (!Number.isInteger(value) || value < 1 || value > remaining) throw fail("INVALID_REFUND");
      charge.refunded += value;
      emit(createEvent("payment.refunded", { chargeId, orderId: charge.orderId, amount: value }));
      return { ...charge };
    },
    get: (id) =>`);
  appendFileSync(join(project, "payments/index.test.mjs"), `
test("refunds are partial or full and never exceed the charge", () => {
  const events = [];
  const payments = createPayments({ emit: (event) => events.push(event) });
  const charge = payments.charge({ orderId: "o1", amount: 100 });
  assert.equal(payments.refund(charge.id, 30).refunded, 30);
  assert.throws(() => payments.refund(charge.id, 71), { code: "INVALID_REFUND" });
  assert.equal(payments.refund(charge.id).refunded, 100);
  assert.throws(() => payments.refund(charge.id), { code: "INVALID_REFUND" });
  assert.throws(() => payments.refund("nope"), { code: "NOT_FOUND" });
  assert.deepEqual(events.filter((e) => e.type === "payment.refunded").map((e) => e.payload.amount), [30, 70]);
});
`);
  replace(project, "orders/index.mjs", "    get: (id) =>", `    cancel(id) {
      const order = orders.get(id);
      if (!order) throw fail("NOT_FOUND");
      if (order.status === "cancelled") throw fail("ALREADY_CANCELLED");
      payments.refund(order.chargeId);
      inventory.release(order.sku, order.quantity);
      order.status = "cancelled";
      emit(createEvent("order.cancelled", { orderId: id }));
      return { ...order };
    },
    get: (id) =>`);
  appendFileSync(join(project, "orders/index.test.mjs"), `
test("cancelling refunds, releases stock and happens once", () => {
  const calls = [];
  const events = [];
  const orders = createOrders({ emit: (event) => events.push(event),
    inventory: { reserve: () => {}, release: (sku, quantity) => calls.push(["release", sku, quantity]) },
    payments: { charge: () => ({ id: "ch_1" }), refund: (id) => calls.push(["refund", id]) } });
  const order = orders.place({ userId: "u1", sku: "shoe", quantity: 2, amount: 10 });
  assert.equal(orders.cancel(order.id).status, "cancelled");
  assert.deepEqual(calls, [["refund", "ch_1"], ["release", "shoe", 2]]);
  assert.equal(events.at(-1).type, "order.cancelled");
  assert.throws(() => orders.cancel(order.id), { code: "ALREADY_CANCELLED" });
  assert.throws(() => orders.cancel("nope"), { code: "NOT_FOUND" });
  assert.equal(calls.length, 2);
});
`);
  replace(project, "notifications/index.mjs",
    "  \"payment.charged\": (payload) => `Charged ${payload.amount} for order ${payload.orderId}`\n",
    "  \"payment.charged\": (payload) => `Charged ${payload.amount} for order ${payload.orderId}`,\n" +
    "  \"payment.refunded\": (payload) => `Refunded ${payload.amount} for order ${payload.orderId}`,\n" +
    "  \"order.cancelled\": (payload) => `Order ${payload.orderId} cancelled`\n");
  appendFileSync(join(project, "notifications/index.test.mjs"), `
test("refunds and cancellations have messages", () => {
  const notifications = createNotifications();
  assert.equal(notifications.handle(createEvent("payment.refunded", { orderId: "o1", amount: 5 })), "Refunded 5 for order o1");
  assert.equal(notifications.handle(createEvent("order.cancelled", { orderId: "o1" })), "Order o1 cancelled");
});
`);
  replace(project, "web/state.mjs", "  return state;\n}", `  if (event?.type === "order.cancelled") {
    const order = state.orders[event.payload?.orderId];
    if (!order) return state;
    return { ...state, orders: { ...state.orders, [order.id]: { ...order, status: "cancelled" } } };
  }
  return state;
}`);
  appendFileSync(join(project, "web/state.test.mjs"), `
test("a cancelled order is marked without mutation; unknown ones are ignored", () => {
  const placed = reduce(initialState(), { type: "order.placed", payload: { orderId: "o1", sku: "a", quantity: 1, amount: 5 } });
  const cancelled = reduce(placed, { type: "order.cancelled", payload: { orderId: "o1" } });
  assert.equal(cancelled.orders.o1.status, "cancelled");
  assert.equal(placed.orders.o1.status, "placed");
  assert.equal(reduce(placed, { type: "order.cancelled", payload: { orderId: "x" } }), placed);
});
`);
}
