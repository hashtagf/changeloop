import test from "node:test";
import assert from "node:assert/strict";
import { createAuth } from "./index.mjs";

test("a known bearer token yields its session", () => {
  const auth = createAuth({ t1: { userId: "u1", role: "admin" }, t2: { userId: "u2" } });
  assert.deepEqual(auth.authenticate("Bearer t1"), { userId: "u1", role: "admin" });
  assert.deepEqual(auth.authenticate("Bearer t2"), { userId: "u2", role: "member" });
});

test("missing or unknown tokens are unauthorized", () => {
  const auth = createAuth({ t1: { userId: "u1" } });
  for (const header of [undefined, "", "t1", "Bearer nope"])
    assert.throws(() => auth.authenticate(header), { code: "UNAUTHORIZED" });
});
