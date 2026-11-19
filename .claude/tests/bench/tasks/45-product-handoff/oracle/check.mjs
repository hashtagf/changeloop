// Hidden oracle for the product handoff cart (task 45).
// Usage: node check.mjs <work-copy> <seed> <sandbox>
// Drives createCart() through every item of F-01 in docs/requirements.md:
// AC-01..AC-04, BR-01, BR-02, ERR-01, then a grown passing suite, and the
// archived change's handoff.json, which must name the requirements document
// and owe every F-01 item (none excluded).
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const work = resolve(process.argv[2]);
const seed = resolve(process.argv[3]);
const sandbox = process.argv[4] ? resolve(process.argv[4]) : null;
const results = {};

let createCart = null;
try {
  ({ createCart } = await import(`${pathToFileURL(join(work, "src/cart.js"))}?oracle=${Date.now()}`));
} catch { /* every case fails below */ }

function shop({ stock = {}, prices = {}, down = false } = {}) {
  const state = { stock: { ...stock }, prices: { ...prices }, down };
  const cart = createCart({
    stock: { available: (sku) => { if (state.down) throw new Error("stock service down"); return state.stock[sku] ?? 0; } },
    prices: { current: (sku) => state.prices[sku] ?? 0 }
  });
  return { cart, state };
}
const lines = (cart) => JSON.stringify(cart.items());

async function check(id, body) {
  try { results[id] = (await body()) ? "pass" : "fail"; } catch { results[id] = "fail"; }
}

await check("CASE_ADD", () => {
  const { cart } = shop({ stock: { A: 5 }, prices: { A: 100 } });
  const result = cart.add("A", 2);
  return result.ok === true && result.quantity === 2 && lines(cart) === '[{"sku":"A","quantity":2}]';
});
await check("CASE_AC01_CAP_AT_STOCK", () => {
  const { cart } = shop({ stock: { A: 2 }, prices: { A: 100 } });
  const result = cart.add("A", 3);
  return result.ok === true && result.quantity === 2 && /only 2 left/i.test(String(result.notice || "")) &&
    lines(cart) === '[{"sku":"A","quantity":2}]';
});
await check("CASE_AC02_CURRENT_PRICE", () => {
  const { cart, state } = shop({ stock: { A: 5 }, prices: { A: 790 } });
  cart.add("A", 1);
  state.prices.A = 690;
  const totals = cart.totals();
  return totals.subtotal === 690 && totals.shipping === 50 && totals.total === 740;
});
await check("CASE_AC03_REMOVE", () => {
  const { cart } = shop({ stock: { A: 5, B: 5 }, prices: { A: 100, B: 200 } });
  cart.add("A", 1); cart.add("B", 1);
  cart.remove("A");
  return lines(cart) === '[{"sku":"B","quantity":1}]' && cart.totals().subtotal === 200;
});
await check("CASE_AC04_SAME_ITEM_LINE_CAPPED", () => {
  const { cart } = shop({ stock: { A: 3, B: 5 }, prices: { A: 100, B: 100 } });
  cart.add("A", 2); cart.add("B", 1);
  const result = cart.add("A", 2);
  return result.quantity === 3 && /only 3 left/i.test(String(result.notice || "")) &&
    lines(cart) === '[{"sku":"A","quantity":3},{"sku":"B","quantity":1}]';
});
await check("CASE_BR01_SHIPPING", () => {
  const { cart } = shop({ stock: { A: 20, B: 20 }, prices: { A: 990, B: 989 } });
  const empty = cart.totals();
  cart.add("B", 1);
  const below = cart.totals();
  cart.remove("B"); cart.add("A", 1);
  const at = cart.totals();
  return empty.shipping === 0 && empty.total === 0 && below.shipping === 50 && below.total === 1039 &&
    at.shipping === 0 && at.total === 990;
});
await check("CASE_BR02_LIMIT_TEN", () => {
  const { cart } = shop({ stock: { A: 50 }, prices: { A: 10 } });
  const first = cart.add("A", 12);
  cart.add("A", 1);
  return first.quantity === 10 && /limit 10 per item/i.test(String(first.notice || "")) &&
    lines(cart) === '[{"sku":"A","quantity":10}]';
});
await check("CASE_ERR01_STOCK_DOWN", () => {
  const { cart, state } = shop({ stock: { A: 5 }, prices: { A: 100 } });
  cart.add("A", 1);
  state.down = true;
  const result = cart.add("A", 1);
  const fresh = cart.add("B", 1);
  return result.ok === false && result.error === "STOCK_UNAVAILABLE" && fresh.ok === false &&
    lines(cart) === '[{"sku":"A","quantity":1}]';
});

function suite() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(process.execPath, ["--test", "--test-reporter=tap"],
    { cwd: work, encoding: "utf8", timeout: 60000, env, maxBuffer: 10 * 1024 * 1024 });
  return { ok: run.status === 0, pass: Number((String(run.stdout).match(/^# pass (\d+)/m) || [])[1] || 0) };
}
const seedTests = readdirSync(join(seed, "test")).filter((name) => name.endsWith(".test.mjs")).length;
await check("CASE_TESTS_PASS", () => {
  const delivered = suite();
  return delivered.ok && delivered.pass > seedTests;
});

// The change recorded the handoff: the requirements document, and every F-01
// item owed rather than excluded. The backend runs this oracle before Land, so
// the record is read from the active packet or, after Land, the archive.
const F01 = ["US-01", "AC-01", "AC-02", "AC-03", "AC-04", "BR-01", "BR-02", "ERR-01", "F-01"];
function packets(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => join(dir, entry.name));
}
await check("CASE_HANDOFF_RECORD", () => {
  if (!sandbox) return false;
  const changes = join(sandbox, "openspec/changes");
  return [...packets(changes), ...packets(join(changes, "archive"))].some((packet) => {
    const path = join(packet, "handoff.json");
    if (!existsSync(path)) return false;
    const record = JSON.parse(readFileSync(path, "utf8"));
    return (record.documents || []).some((doc) => doc.path === "docs/requirements.md") &&
      F01.every((id) => (record.owed || []).includes(id));
  });
});

const ids = Object.keys(results);
const score = ids.filter((id) => results[id] === "pass").length;
process.stdout.write(`${JSON.stringify({ results, score, max: ids.length,
  verdict: score === ids.length ? "pass" : "fail" })}\n`);
process.exit(0);
