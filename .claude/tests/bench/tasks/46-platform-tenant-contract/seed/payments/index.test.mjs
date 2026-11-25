import test from "node:test";
import assert from "node:assert/strict";
import { createPayments } from "./index.mjs";

test("a charge is recorded and announced", () => {
  const events = [];
  const payments = createPayments({ emit: (event) => events.push(event) });
  const charge = payments.charge({ orderId: "o1", amount: 250 });
  assert.deepEqual(payments.get(charge.id), { id: charge.id, orderId: "o1", amount: 250, refunded: 0 });
  assert.equal(events[0].type, "payment.charged");
  assert.throws(() => payments.charge({ orderId: "o1", amount: 0 }), { code: "INVALID_AMOUNT" });
  assert.equal(payments.get("nope"), null);
});
