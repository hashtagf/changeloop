import test from "node:test";
import assert from "node:assert/strict";
import { createUsers } from "./index.mjs";

test("users are looked up by id and copied out", () => {
  const users = createUsers([{ id: "u1", name: "Ann" }]);
  assert.deepEqual(users.get("u1"), { id: "u1", name: "Ann" });
  users.get("u1").name = "changed";
  assert.equal(users.displayName("u1"), "Ann");
  assert.equal(users.get("nope"), null);
  assert.equal(users.displayName("nope"), "unknown");
  assert.equal(users.list().length, 1);
});
