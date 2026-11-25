import test from "node:test";
import assert from "node:assert/strict";
import { createEvent, validateEvent } from "./index.mjs";

test("events carry the contract version, type and a copied payload", () => {
  const payload = { sku: "a" };
  const event = createEvent("stock.set", payload);
  assert.deepEqual(event, { version: 1, type: "stock.set", payload: { sku: "a" } });
  assert.notEqual(event.payload, payload);
  assert.equal(validateEvent(event), true);
});

test("invalid events are rejected", () => {
  assert.throws(() => createEvent(""), TypeError);
  assert.equal(validateEvent({ version: 0, type: "x", payload: {} }), false);
  assert.equal(validateEvent({ version: 1, type: "x", payload: [] }), false);
});
