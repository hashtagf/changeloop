// Calibration answer for 46-platform-tenant-contract: the smallest complete
// change, used only to prove the hidden oracle passes a correct delivery.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const TENANT_CONTRACT = `// Event contract v2. The source of truth lives in the contracts repository;
// each service vendors this file as event.mjs and must keep it identical.
export const EVENT_VERSION = 2;

const text = (value) => typeof value === "string" && value.length > 0;

export function createEvent(type, payload = {}, tenantId) {
  if (!text(type)) throw new TypeError("event type is required");
  if (!text(tenantId)) throw new TypeError("tenantId is required");
  return { version: EVENT_VERSION, type, tenantId, payload: { ...payload } };
}

export function validateEvent(event) {
  return Boolean(event && event.version === EVENT_VERSION && text(event.type) && text(event.tenantId) &&
    event.payload && typeof event.payload === "object" && !Array.isArray(event.payload));
}
`;

const FILES = {
  "contracts/index.mjs": TENANT_CONTRACT,
  "inventory/event.mjs": TENANT_CONTRACT,
  "payments/event.mjs": TENANT_CONTRACT,
  "orders/event.mjs": TENANT_CONTRACT,
  "notifications/event.mjs": TENANT_CONTRACT,
  "contracts/index.test.mjs": `import test from "node:test";
import assert from "node:assert/strict";
import { createEvent, validateEvent } from "./index.mjs";

test("v2 events carry the tenant", () => {
  const event = createEvent("stock.set", { sku: "a" }, "t1");
  assert.deepEqual(event, { version: 2, type: "stock.set", tenantId: "t1", payload: { sku: "a" } });
  assert.equal(validateEvent(event), true);
});

test("a missing tenant or a v1 event is invalid", () => {
  assert.throws(() => createEvent("x", {}), TypeError);
  assert.throws(() => createEvent("x", {}, ""), TypeError);
  assert.equal(validateEvent({ version: 1, type: "x", payload: {} }), false);
  assert.equal(validateEvent({ version: 2, type: "x", payload: {} }), false);
});
`,
  "auth/index.mjs": `export function createAuth(tokens = {}) {
  const unauthorized = () => Object.assign(new Error("UNAUTHORIZED"), { code: "UNAUTHORIZED" });
  const text = (value) => typeof value === "string" && value.length > 0;
  return {
    authenticate(header) {
      const match = /^Bearer (\\S+)$/.exec(String(header || ""));
      const session = match ? tokens[match[1]] : undefined;
      if (!session || !text(session.userId) || !text(session.tenantId)) throw unauthorized();
      return { userId: session.userId, role: session.role === "admin" ? "admin" : "member", tenantId: session.tenantId };
    }
  };
}
`,
  "auth/index.test.mjs": `import test from "node:test";
import assert from "node:assert/strict";
import { createAuth } from "./index.mjs";

test("a session carries its tenant", () => {
  const auth = createAuth({ t1: { userId: "u1", role: "admin", tenantId: "a" } });
  assert.deepEqual(auth.authenticate("Bearer t1"), { userId: "u1", role: "admin", tenantId: "a" });
});

test("a session without a tenant is unauthorized", () => {
  const auth = createAuth({ t1: { userId: "u1" } });
  for (const header of [undefined, "Bearer t1", "Bearer nope"])
    assert.throws(() => auth.authenticate(header), { code: "UNAUTHORIZED" });
});
`,
  "inventory/index.mjs": `import { createEvent } from "./event.mjs";

const fail = (code) => Object.assign(new Error(code), { code });
const key = (tenantId, sku) => \`\${tenantId}\\u0000\${sku}\`;

export function createInventory({ emit = () => {} } = {}) {
  const stock = new Map();
  return {
    stock: (tenantId, sku) => stock.get(key(tenantId, sku)) ?? 0,
    setStock(tenantId, sku, quantity) {
      if (!Number.isInteger(quantity) || quantity < 0) throw fail("INVALID_QUANTITY");
      stock.set(key(tenantId, sku), quantity);
      emit(createEvent("stock.set", { sku, quantity }, tenantId));
      return { sku, stock: quantity };
    },
    reserve(tenantId, sku, quantity) {
      if (!Number.isInteger(quantity) || quantity < 1) throw fail("INVALID_QUANTITY");
      const available = stock.get(key(tenantId, sku)) ?? 0;
      if (available < quantity) throw fail("OUT_OF_STOCK");
      stock.set(key(tenantId, sku), available - quantity);
      emit(createEvent("stock.reserved", { sku, quantity }, tenantId));
      return { sku, stock: available - quantity };
    },
    release(tenantId, sku, quantity) {
      if (!Number.isInteger(quantity) || quantity < 1) throw fail("INVALID_QUANTITY");
      const next = (stock.get(key(tenantId, sku)) ?? 0) + quantity;
      stock.set(key(tenantId, sku), next);
      emit(createEvent("stock.released", { sku, quantity }, tenantId));
      return { sku, stock: next };
    }
  };
}
`,
  "inventory/index.test.mjs": `import test from "node:test";
import assert from "node:assert/strict";
import { createInventory } from "./index.mjs";

test("stock is per tenant and events carry the tenant", () => {
  const events = [];
  const inventory = createInventory({ emit: (event) => events.push(event) });
  inventory.setStock("a", "shoe", 3);
  assert.equal(inventory.stock("b", "shoe"), 0);
  assert.throws(() => inventory.reserve("b", "shoe", 1), { code: "OUT_OF_STOCK" });
  assert.deepEqual(inventory.reserve("a", "shoe", 2), { sku: "shoe", stock: 1 });
  assert.deepEqual(inventory.release("a", "shoe", 2), { sku: "shoe", stock: 3 });
  assert.deepEqual(events.map((event) => \`\${event.tenantId}:\${event.type}\`), ["a:stock.set", "a:stock.reserved", "a:stock.released"]);
});
`,
  "payments/index.mjs": `import { createEvent } from "./event.mjs";

const fail = (code) => Object.assign(new Error(code), { code });

export function createPayments({ emit = () => {} } = {}) {
  const charges = new Map();
  let next = 0;
  return {
    charge({ tenantId, orderId, amount }) {
      if (!Number.isInteger(amount) || amount < 1) throw fail("INVALID_AMOUNT");
      const charge = { id: \`ch_\${++next}\`, orderId, amount, refunded: 0 };
      charges.set(charge.id, { ...charge, tenantId });
      emit(createEvent("payment.charged", { chargeId: charge.id, orderId, amount }, tenantId));
      return { ...charge };
    },
    get(tenantId, id) {
      const charge = charges.get(id);
      if (!charge || charge.tenantId !== tenantId) return null;
      const { tenantId: _owner, ...rest } = charge;
      return rest;
    }
  };
}
`,
  "payments/index.test.mjs": `import test from "node:test";
import assert from "node:assert/strict";
import { createPayments } from "./index.mjs";

test("a charge belongs to its tenant", () => {
  const events = [];
  const payments = createPayments({ emit: (event) => events.push(event) });
  const charge = payments.charge({ tenantId: "a", orderId: "o1", amount: 250 });
  assert.deepEqual(payments.get("a", charge.id), { id: charge.id, orderId: "o1", amount: 250, refunded: 0 });
  assert.equal(payments.get("b", charge.id), null);
  assert.equal(events[0].tenantId, "a");
});
`,
  "orders/index.mjs": `import { createEvent } from "./event.mjs";

const fail = (code) => Object.assign(new Error(code), { code });

export function createOrders({ emit = () => {}, inventory, payments }) {
  const orders = new Map();
  let next = 0;
  const own = (tenantId, id) => { const order = orders.get(id); return order && order.tenantId === tenantId ? order : null; };
  const view = ({ tenantId: _owner, ...order }) => order;
  return {
    place({ tenantId, userId, sku, quantity, amount }) {
      if (!Number.isInteger(amount) || amount < 1) throw fail("INVALID_AMOUNT");
      inventory.reserve(tenantId, sku, quantity);
      const id = \`ord_\${++next}\`;
      const charge = payments.charge({ tenantId, orderId: id, amount });
      const order = { id, userId, sku, quantity, amount, chargeId: charge.id, status: "placed" };
      orders.set(id, { ...order, tenantId });
      emit(createEvent("order.placed", { orderId: id, userId, sku, quantity, amount }, tenantId));
      return { ...order };
    },
    get: (tenantId, id) => { const order = own(tenantId, id); return order ? view(order) : null; },
    list: (tenantId) => [...orders.values()].filter((order) => order.tenantId === tenantId).map(view)
  };
}
`,
  "orders/index.test.mjs": `import test from "node:test";
import assert from "node:assert/strict";
import { createOrders } from "./index.mjs";

test("orders are placed and read within one tenant", () => {
  const calls = [];
  const events = [];
  const orders = createOrders({ emit: (event) => events.push(event),
    inventory: { reserve: (...args) => calls.push(["reserve", ...args]) },
    payments: { charge: (input) => (calls.push(["charge", input.tenantId]), { id: "ch_1" }) } });
  const order = orders.place({ tenantId: "a", userId: "u1", sku: "shoe", quantity: 2, amount: 100 });
  assert.deepEqual(calls, [["reserve", "a", "shoe", 2], ["charge", "a"]]);
  assert.equal(orders.get("a", order.id).status, "placed");
  assert.equal(orders.get("b", order.id), null);
  assert.deepEqual(orders.list("b"), []);
  assert.equal(events.at(-1).tenantId, "a");
});
`,
  "notifications/index.mjs": `import { validateEvent } from "./event.mjs";

const TEXT = {
  "order.placed": (payload) => \`Order \${payload.orderId} placed\`,
  "payment.charged": (payload) => \`Charged \${payload.amount} for order \${payload.orderId}\`
};

export function createNotifications() {
  const sent = [];
  return {
    handle(event) {
      if (!validateEvent(event)) throw Object.assign(new Error("INVALID_EVENT"), { code: "INVALID_EVENT" });
      const text = TEXT[event.type]?.(event.payload) ?? null;
      if (text) sent.push({ tenantId: event.tenantId, type: event.type, text });
      return text;
    },
    messages: (tenantId) => sent.filter((message) => message.tenantId === tenantId)
      .map(({ type, text }) => ({ type, text }))
  };
}
`,
  "notifications/index.test.mjs": `import test from "node:test";
import assert from "node:assert/strict";
import { createNotifications } from "./index.mjs";
import { createEvent } from "./event.mjs";

test("messages are kept per tenant", () => {
  const notifications = createNotifications();
  notifications.handle(createEvent("order.placed", { orderId: "o1" }, "a"));
  notifications.handle(createEvent("order.placed", { orderId: "o2" }, "b"));
  assert.deepEqual(notifications.messages("a"), [{ type: "order.placed", text: "Order o1 placed" }]);
});

test("an event without a tenant is refused", () => {
  assert.throws(() => createNotifications().handle({ version: 2, type: "order.placed", payload: {} }), { code: "INVALID_EVENT" });
});
`,
  "gateway/index.mjs": `const STATUS = {
  UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, OUT_OF_STOCK: 409,
  INVALID_QUANTITY: 400, INVALID_AMOUNT: 400
};
const fail = (code) => Object.assign(new Error(code), { code });

export function createGateway({ auth, orders, inventory }) {
  function route({ tenantId, userId, role }, { method, path, body }) {
    let match;
    if ((match = /^\\/stock\\/([^/]+)$/.exec(path))) {
      const sku = decodeURIComponent(match[1]);
      if (method === "GET") return [200, { sku, stock: inventory.stock(tenantId, sku) }];
      if (method === "PUT") {
        if (role !== "admin") throw fail("FORBIDDEN");
        return [200, inventory.setStock(tenantId, sku, body?.stock)];
      }
    }
    if (method === "POST" && path === "/orders")
      return [201, orders.place({ tenantId, userId, sku: body?.sku, quantity: body?.quantity, amount: body?.amount })];
    if (method === "GET" && (match = /^\\/orders\\/([^/]+)$/.exec(path))) {
      const order = orders.get(tenantId, decodeURIComponent(match[1]));
      if (!order) throw fail("NOT_FOUND");
      return [200, order];
    }
    throw fail("NOT_FOUND");
  }
  return {
    handle(request) {
      try {
        const context = auth.authenticate(request.headers?.authorization);
        const [status, body] = route(context, request);
        return { status, body };
      } catch (error) {
        if (!STATUS[error.code]) throw error;
        return { status: STATUS[error.code], body: { error: error.code } };
      }
    }
  };
}
`,
  "gateway/index.test.mjs": `import test from "node:test";
import assert from "node:assert/strict";
import { createGateway } from "./index.mjs";

test("the tenant comes from the token only", () => {
  const seen = [];
  const g = createGateway({
    auth: { authenticate: () => ({ userId: "u1", role: "admin", tenantId: "a" }) },
    inventory: { stock: (tenantId, sku) => (seen.push(tenantId), 0), setStock: (tenantId, sku, stock) => (seen.push(tenantId), { sku, stock }) },
    orders: { place: (input) => (seen.push(input.tenantId), { id: "o1" }), get: (tenantId) => (seen.push(tenantId), null) }
  });
  const headers = { authorization: "Bearer x", "x-tenant-id": "b" };
  g.handle({ method: "PUT", path: "/stock/a", headers, body: { stock: 1, tenantId: "b" } });
  g.handle({ method: "GET", path: "/stock/a", headers });
  g.handle({ method: "POST", path: "/orders", headers, body: { tenantId: "b" } });
  assert.equal(g.handle({ method: "GET", path: "/orders/o1", headers }).status, 404);
  assert.deepEqual(seen, ["a", "a", "a", "a"]);
});
`
};

export function repairPlatformTenant(project) {
  for (const [path, content] of Object.entries(FILES)) {
    mkdirSync(dirname(join(project, path)), { recursive: true });
    writeFileSync(join(project, path), content);
  }
}
