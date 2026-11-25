import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "./index.mjs";

test("the client sends the token and surfaces gateway errors", () => {
  const seen = [];
  const gateway = { handle: (request) => {
    seen.push(request);
    return request.path === "/orders/x" ? { status: 404, body: { error: "NOT_FOUND" } } : { status: 200, body: { ok: true } };
  } };
  const client = createClient(gateway, "tok");
  assert.deepEqual(client.stock("a/b"), { ok: true });
  assert.equal(seen[0].path, "/stock/a%2Fb");
  assert.equal(seen[0].headers.authorization, "Bearer tok");
  assert.throws(() => client.order("x"), { status: 404, code: "NOT_FOUND" });
});
