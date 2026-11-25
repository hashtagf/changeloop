// Hidden acceptance: never copied into the consumer or used as project tests.
// A feature owned by four of ten repositories; the other six are read-only
// for the change and must stay byte-for-byte unchanged.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const seed = join(here, "../seed");
const scratch = mkdtempSync(join(tmpdir(), "refund-oracle-"));
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
const READ_ONLY = ["contracts", "auth", "users", "inventory", "gateway", "sdk"];

async function check(id, fn) {
  if (onlyCase && onlyCase !== id) return;
  try { await fn(); results[id] = "pass"; }
  catch (error) { results[id] = "fail"; diagnostics[id] = String(error?.message || error).slice(0, 400); }
}
function files(directory, prefix = "") {
  return readdirSync(directory).flatMap((name) => statSync(join(directory, name)).isDirectory()
    ? files(join(directory, name), `${prefix}${name}/`) : [`${prefix}${name}`]);
}
async function platform() {
  const { createPlatform } = await load("platform.mjs");
  const value = createPlatform({ tokens: { a: { userId: "u1", role: "admin" } } });
  const call = (method, path, body) => value.gateway.handle({ method, path, body,
    headers: { authorization: "Bearer a" } });
  return { ...value, call };
}
async function payments() {
  const events = [];
  const { createPayments } = await load("payments/index.mjs");
  return { events, payments: createPayments({ emit: (event) => events.push(event) }) };
}

try {
  await check("CASE_REFUND_PARTIAL", async () => {
    const { events, payments: p } = await payments();
    const charge = p.charge({ orderId: "o1", amount: 100 });
    assert.deepEqual(p.refund(charge.id, 30), { id: charge.id, orderId: "o1", amount: 100, refunded: 30 });
    assert.deepEqual(p.refund(charge.id), { id: charge.id, orderId: "o1", amount: 100, refunded: 100 });
    assert.deepEqual(events.filter((e) => e.type === "payment.refunded").map((e) => e.payload),
      [{ chargeId: charge.id, orderId: "o1", amount: 30 }, { chargeId: charge.id, orderId: "o1", amount: 70 }]);
    assert.equal(p.get(charge.id).refunded, 100);
  });
  await check("CASE_REFUND_LIMITS", async () => {
    const { events, payments: p } = await payments();
    const charge = p.charge({ orderId: "o1", amount: 50 });
    for (const amount of [0, -1, 1.5, 51, "10"])
      assert.throws(() => p.refund(charge.id, amount), { code: "INVALID_REFUND" }, `amount ${amount}`);
    p.refund(charge.id, 30);
    assert.throws(() => p.refund(charge.id, 21), { code: "INVALID_REFUND" }, "more than what remains");
    p.refund(charge.id, 20);
    assert.throws(() => p.refund(charge.id), { code: "INVALID_REFUND" });
    assert.throws(() => p.refund("missing", 1), { code: "NOT_FOUND" });
    assert.equal(p.get(charge.id).refunded, 50);
    assert.equal(events.filter((e) => e.type === "payment.refunded").length, 2);
  });
  await check("CASE_CANCEL_FLOW", async () => {
    const p = await platform();
    p.call("PUT", "/stock/shoe", { stock: 5 });
    const order = p.call("POST", "/orders", { sku: "shoe", quantity: 2, amount: 80 }).body;
    const start = p.events.length;
    const cancelled = p.orders.cancel(order.id);
    assert.equal(cancelled.status, "cancelled");
    assert.equal(p.orders.get(order.id).status, "cancelled");
    assert.equal(p.call("GET", "/stock/shoe").body.stock, 5);
    assert.equal(p.payments.get(order.chargeId).refunded, 80);
    const after = p.events.slice(start).map((e) => e.type);
    assert.ok(after.includes("stock.released"));
    assert.ok(after.indexOf("payment.refunded") >= 0 && after.indexOf("payment.refunded") < after.indexOf("order.cancelled"));
    assert.deepEqual(p.events.at(-1).payload, { orderId: order.id });
    const texts = p.notifications.messages().map((m) => m.text);
    assert.ok(texts.includes(`Refunded 80 for order ${order.id}`), texts.join(" | "));
    assert.ok(texts.includes(`Order ${order.id} cancelled`));
    assert.ok(texts.includes(`Order ${order.id} placed`), "existing texts stay");
  });
  await check("CASE_CANCEL_ONCE", async () => {
    const p = await platform();
    p.call("PUT", "/stock/shoe", { stock: 1 });
    const order = p.call("POST", "/orders", { sku: "shoe", quantity: 1, amount: 9 }).body;
    p.orders.cancel(order.id);
    const count = p.events.length;
    assert.throws(() => p.orders.cancel(order.id), { code: "ALREADY_CANCELLED" });
    assert.equal(p.events.length, count);
    assert.equal(p.payments.get(order.chargeId).refunded, 9);
    assert.equal(p.call("GET", "/stock/shoe").body.stock, 1);
  });
  await check("CASE_CANCEL_UNKNOWN", async () => {
    const p = await platform();
    assert.throws(() => p.orders.cancel("missing"), { code: "NOT_FOUND" });
    assert.equal(p.events.length, 0);
  });
  await check("CASE_WEB_CANCEL", async () => {
    const { initialState, reduce } = await load("web/state.mjs");
    const placed = reduce(initialState(), { type: "order.placed", payload: { orderId: "o1", sku: "a", quantity: 1, amount: 5 } });
    const cancelled = reduce(placed, { type: "order.cancelled", payload: { orderId: "o1" } });
    assert.equal(cancelled.orders.o1.status, "cancelled");
    assert.equal(placed.orders.o1.status, "placed", "the previous state is not mutated");
    assert.deepEqual(reduce(placed, { type: "order.cancelled", payload: { orderId: "nope" } }).orders, placed.orders);
  });
  await check("CASE_READ_ONLY_UNCHANGED", () => {
    for (const repository of READ_ONLY) {
      const expected = files(join(seed, repository)).sort();
      assert.deepEqual(files(join(work, repository)).sort(), expected, `${repository}: files added or removed`);
      for (const file of expected)
        assert.equal(readFileSync(join(work, repository, file), "utf8"),
          readFileSync(join(seed, repository, file), "utf8"), `${repository}/${file} changed`);
    }
  });

  const suite = () => spawnSync(process.execPath, ["--test", "--test-reporter=tap"], {
    cwd: work, env, encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  const delivered = !onlyCase || onlyCase.startsWith("CASE_TESTS_") || onlyCase === "CASE_DELIVERED_TESTS"
    ? suite() : null;
  await check("CASE_DELIVERED_TESTS", () => {
    assert.equal(delivered.status, 0, delivered.stdout.slice(-1500));
    assert.ok(Number((delivered.stdout.match(/^# pass (\d+)/m) || [])[1]) > 0);
  });
  for (const [name, file] of [["PAYMENTS", "payments/index.mjs"], ["ORDERS", "orders/index.mjs"],
    ["NOTIFICATIONS", "notifications/index.mjs"], ["WEB", "web/state.mjs"]]) {
    await check(`CASE_TESTS_${name}`, () => {
      assert.equal(delivered.status, 0);
      const backup = readFileSync(join(work, file));
      try {
        cpSync(join(seed, file), join(work, file));
        const mutant = suite();
        assert.notEqual(mutant.status, null, "a timeout is not test discrimination");
        assert.notEqual(mutant.status, 0, `delivered tests did not detect the seed ${file}`);
      } finally { writeFileSync(join(work, file), backup); }
    });
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

const ids = Object.keys(results);
if (!ids.length) throw new Error("unknown oracle calibration case");
const score = ids.filter((id) => results[id] === "pass").length;
process.stdout.write(`${JSON.stringify({ verdict: score === ids.length ? "pass" : "fail", score,
  max: ids.length, results, diagnostics })}\n`);
