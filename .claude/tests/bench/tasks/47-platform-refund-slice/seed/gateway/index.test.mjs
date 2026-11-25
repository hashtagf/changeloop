import test from "node:test";
import assert from "node:assert/strict";
import { createGateway } from "./index.mjs";

function gateway() {
  const stock = new Map();
  const placed = new Map();
  return createGateway({
    auth: { authenticate: (header) => {
      if (header === "Bearer admin") return { userId: "u1", role: "admin" };
      if (header === "Bearer member") return { userId: "u2", role: "member" };
      throw Object.assign(new Error("UNAUTHORIZED"), { code: "UNAUTHORIZED" });
    } },
    inventory: { stock: (sku) => stock.get(sku) ?? 0,
      setStock: (sku, value) => (stock.set(sku, value), { sku, stock: value }) },
    orders: { place: (input) => { const order = { id: "o1", ...input }; placed.set("o1", order); return order; },
      get: (id) => placed.get(id) ?? null }
  });
}
const call = (g, method, path, token, body) => g.handle({ method, path, headers: token ? { authorization: `Bearer ${token}` } : {}, body });

test("routes stock and orders for an authenticated caller", () => {
  const g = gateway();
  assert.deepEqual(call(g, "PUT", "/stock/a%20b", "admin", { stock: 4 }), { status: 200, body: { sku: "a b", stock: 4 } });
  assert.deepEqual(call(g, "GET", "/stock/a%20b", "member"), { status: 200, body: { sku: "a b", stock: 4 } });
  assert.equal(call(g, "POST", "/orders", "member", { sku: "a", quantity: 1, amount: 5 }).body.userId, "u2");
  assert.equal(call(g, "GET", "/orders/o1", "member").status, 200);
});

test("maps failures to status codes", () => {
  const g = gateway();
  assert.equal(call(g, "GET", "/stock/a").status, 401);
  assert.equal(call(g, "PUT", "/stock/a", "member", { stock: 1 }).status, 403);
  assert.deepEqual(call(g, "GET", "/orders/none", "member"), { status: 404, body: { error: "NOT_FOUND" } });
});
