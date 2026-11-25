import test from "node:test";
import assert from "node:assert/strict";
import { createNotifications } from "./index.mjs";
import { createEvent } from "./event.mjs";

test("known events become messages; others are ignored", () => {
  const notifications = createNotifications();
  assert.equal(notifications.handle(createEvent("order.placed", { orderId: "o1" })), "Order o1 placed");
  assert.equal(notifications.handle(createEvent("stock.set", { sku: "a" })), null);
  assert.deepEqual(notifications.messages(), [{ type: "order.placed", text: "Order o1 placed" }]);
});

test("invalid events are refused", () => {
  assert.throws(() => createNotifications().handle({ type: "order.placed" }), { code: "INVALID_EVENT" });
});
