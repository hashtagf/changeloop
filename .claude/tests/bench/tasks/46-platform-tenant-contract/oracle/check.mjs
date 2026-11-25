// Hidden acceptance: never copied into the consumer or used as project tests.
// Ten repositories; a tenant-scoped event contract must reach every consumer
// that needs it, and the three repositories that do not must stay untouched.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const seed = join(here, "../seed");
const scratch = mkdtempSync(join(tmpdir(), "tenant-oracle-"));
const work = join(scratch, "work");
const results = {};
const diagnostics = {};
const onlyCase = process.argv[3];
cpSync(resolve(process.argv[2]), work, { recursive: true,
  filter: (path) => ![".git", ".claude", ".foundation", "openspec", "node_modules"].includes(path.split("/").at(-1)) });
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
let generation = 0;
const load = (path) => import(`${pathToFileURL(join(work, path))}?v=${++generation}`);

async function check(id, fn) {
  if (onlyCase && onlyCase !== id) return;
  try { await fn(); results[id] = "pass"; }
  catch (error) { results[id] = "fail"; diagnostics[id] = String(error?.message || error).slice(0, 400); }
}

const TOKENS = {
  a: { userId: "u1", role: "admin", tenantId: "t1" },
  a2: { userId: "u3", role: "member", tenantId: "t1" },
  b: { userId: "u2", role: "admin", tenantId: "t2" },
  none: { userId: "u4", role: "admin" }
};
async function platform() {
  const { createPlatform } = await load("platform.mjs");
  const value = createPlatform({ tokens: TOKENS, users: [{ id: "u1", name: "Ann" }] });
  const call = (token, method, path, body, headers = {}) => value.gateway.handle({ method, path, body,
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers } });
  return { ...value, call };
}
const VENDORED = ["inventory", "payments", "orders", "notifications"];
const UNTOUCHED = ["users", "web", "sdk"];
const same = (path) => existsSync(join(work, path)) &&
  readFileSync(join(work, path), "utf8") === readFileSync(join(seed, path), "utf8");

try {
  await check("CASE_CONTRACT_V2", async () => {
    const { createEvent, validateEvent, EVENT_VERSION } = await load("contracts/index.mjs");
    assert.equal(EVENT_VERSION, 2);
    const event = createEvent("order.placed", { orderId: "o1" }, "t1");
    assert.deepEqual(event, { version: 2, type: "order.placed", tenantId: "t1", payload: { orderId: "o1" } });
    assert.equal(validateEvent(event), true);
    for (const tenant of [undefined, "", 7]) assert.throws(() => createEvent("x", {}, tenant), TypeError);
    assert.equal(validateEvent({ version: 1, type: "x", payload: {} }), false);
    assert.equal(validateEvent({ version: 2, type: "x", payload: {} }), false);
    assert.equal(validateEvent({ version: 2, type: "x", tenantId: "", payload: {} }), false);
  });
  await check("CASE_VENDORED_COPIES", () => {
    const source = readFileSync(join(work, "contracts/index.mjs"), "utf8");
    for (const repository of VENDORED)
      assert.equal(readFileSync(join(work, repository, "event.mjs"), "utf8"), source,
        `${repository}/event.mjs differs from contracts/index.mjs`);
  });
  await check("CASE_AUTH_TENANT", async () => {
    const { createAuth } = await load("auth/index.mjs");
    const auth = createAuth(TOKENS);
    assert.deepEqual(auth.authenticate("Bearer a"), { userId: "u1", role: "admin", tenantId: "t1" });
    assert.throws(() => auth.authenticate("Bearer none"), { code: "UNAUTHORIZED" });
    const p = await platform();
    assert.equal(p.call("none", "GET", "/stock/shoe").status, 401);
  });
  await check("CASE_STOCK_ISOLATION", async () => {
    const p = await platform();
    assert.equal(p.call("a", "PUT", "/stock/shoe", { stock: 5 }).status, 200);
    assert.equal(p.call("b", "GET", "/stock/shoe").body.stock, 0);
    assert.equal(p.call("a2", "GET", "/stock/shoe").body.stock, 5);
    assert.equal(p.call("b", "POST", "/orders", { sku: "shoe", quantity: 1, amount: 10 }).status, 409);
    assert.equal(p.call("a", "GET", "/stock/shoe").body.stock, 5);
  });
  await check("CASE_ORDER_ISOLATION", async () => {
    const p = await platform();
    p.call("a", "PUT", "/stock/shoe", { stock: 5 });
    const placed = p.call("a2", "POST", "/orders", { sku: "shoe", quantity: 2, amount: 40 });
    assert.equal(placed.status, 201);
    assert.equal(p.call("a", "GET", `/orders/${encodeURIComponent(placed.body.id)}`).status, 200);
    assert.deepEqual(p.call("b", "GET", `/orders/${encodeURIComponent(placed.body.id)}`),
      { status: 404, body: { error: "NOT_FOUND" } });
    assert.equal(p.call("a", "GET", "/stock/shoe").body.stock, 3);
  });
  await check("CASE_TENANT_FROM_TOKEN_ONLY", async () => {
    const p = await platform();
    p.call("b", "PUT", "/stock/shoe", { stock: 2, tenantId: "t1" }, { "x-tenant-id": "t1" });
    assert.equal(p.call("a", "GET", "/stock/shoe").body.stock, 0);
    assert.equal(p.call("b", "GET", "/stock/shoe", undefined, { "x-tenant-id": "t1" }).body.stock, 2);
    const order = p.call("b", "POST", "/orders", { sku: "shoe", quantity: 1, amount: 5, tenantId: "t1" },
      { "x-tenant-id": "t1" });
    assert.equal(order.status, 201);
    assert.equal(p.call("a", "GET", `/orders/${encodeURIComponent(order.body.id)}`).status, 404);
  });
  await check("CASE_EVENTS_CARRY_TENANT", async () => {
    const p = await platform();
    p.call("a", "PUT", "/stock/shoe", { stock: 3 });
    p.call("a2", "POST", "/orders", { sku: "shoe", quantity: 1, amount: 9 });
    p.call("b", "PUT", "/stock/hat", { stock: 1 });
    const { validateEvent } = await load("contracts/index.mjs");
    const types = p.events.map((event) => `${event.tenantId}:${event.type}`);
    assert.deepEqual(types, ["t1:stock.set", "t1:stock.reserved", "t1:payment.charged", "t1:order.placed", "t2:stock.set"]);
    assert.ok(p.events.every((event) => event.version === 2 && validateEvent(event)));
  });
  await check("CASE_NOTIFICATIONS_TENANT", async () => {
    const p = await platform();
    p.call("a", "PUT", "/stock/shoe", { stock: 3 });
    p.call("b", "PUT", "/stock/shoe", { stock: 3 });
    const one = p.call("a2", "POST", "/orders", { sku: "shoe", quantity: 1, amount: 9 }).body;
    const two = p.call("b", "POST", "/orders", { sku: "shoe", quantity: 1, amount: 7 }).body;
    assert.deepEqual(p.notifications.messages("t1"), [
      { type: "payment.charged", text: `Charged 9 for order ${one.id}` },
      { type: "order.placed", text: `Order ${one.id} placed` }]);
    assert.deepEqual(p.notifications.messages("t2").map((m) => m.text),
      [`Charged 7 for order ${two.id}`, `Order ${two.id} placed`]);
    assert.throws(() => p.notifications.handle({ version: 1, type: "order.placed", payload: {} }), { code: "INVALID_EVENT" });
    assert.throws(() => p.notifications.handle({ version: 2, type: "order.placed", payload: {} }), { code: "INVALID_EVENT" });
  });
  await check("CASE_SDK_ROUNDTRIP", async () => {
    const p = await platform();
    const { createClient } = await load("sdk/index.mjs");
    const admin = createClient(p.gateway, "a");
    const other = createClient(p.gateway, "b");
    admin.setStock("sku / x", 4);
    const order = admin.placeOrder({ sku: "sku / x", quantity: 1, amount: 3 });
    assert.equal(admin.order(order.id).status, "placed");
    assert.equal(admin.stock("sku / x").stock, 3);
    assert.throws(() => other.order(order.id), { status: 404, code: "NOT_FOUND" });
  });
  await check("CASE_UNTOUCHED", () => {
    for (const repository of UNTOUCHED)
      for (const file of readdirFiles(join(seed, repository)))
        assert.ok(same(join(repository, file)), `${repository}/${file} changed`);
  });

  const suite = () => spawnSync(process.execPath, ["--test", "--test-reporter=tap"], {
    cwd: work, env, encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  const delivered = !onlyCase || onlyCase.startsWith("CASE_TESTS_") || onlyCase === "CASE_DELIVERED_TESTS"
    ? suite() : null;
  await check("CASE_DELIVERED_TESTS", () => {
    assert.equal(delivered.status, 0, delivered.stdout.slice(-1500));
    assert.ok(Number((delivered.stdout.match(/^# pass (\d+)/m) || [])[1]) > 0);
  });
  // A repository's delivered tests must notice its seed implementation coming back.
  for (const [name, files] of [["CONTRACTS", ["contracts/index.mjs"]], ["AUTH", ["auth/index.mjs"]],
    ["INVENTORY", ["inventory/index.mjs", "inventory/event.mjs"]], ["NOTIFICATIONS", ["notifications/index.mjs", "notifications/event.mjs"]]]) {
    await check(`CASE_TESTS_${name}`, () => {
      assert.equal(delivered.status, 0);
      const backups = files.map((file) => [file, readFileSync(join(work, file))]);
      try {
        for (const file of files) cpSync(join(seed, file), join(work, file));
        const mutant = suite();
        assert.notEqual(mutant.status, null, "a timeout is not test discrimination");
        assert.notEqual(mutant.status, 0, `delivered tests did not detect the seed ${files[0]}`);
      } finally { for (const [file, content] of backups) writeFileSync(join(work, file), content); }
    });
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

function readdirFiles(directory, prefix = "") {
  return readdirSync(directory).flatMap((name) => statSync(join(directory, name)).isDirectory()
    ? readdirFiles(join(directory, name), `${prefix}${name}/`) : [`${prefix}${name}`]);
}

const ids = Object.keys(results);
if (!ids.length) throw new Error("unknown oracle calibration case");
const score = ids.filter((id) => results[id] === "pass").length;
process.stdout.write(`${JSON.stringify({ verdict: score === ids.length ? "pass" : "fail", score,
  max: ids.length, results, diagnostics })}\n`);
