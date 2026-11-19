import assert from "node:assert/strict";
import test from "node:test";
import { createCart } from "../src/cart.js";

test("a cart starts empty", () => {
  const cart = createCart({ stock: { available: () => 5 }, prices: { current: () => 100 } });
  assert.deepEqual(cart.items(), []);
});
