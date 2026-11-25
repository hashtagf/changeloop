// Reference composition of the ten services. Every repository stays
// self-contained (no cross-repository imports); this file wires them.
import { createAuth } from "./auth/index.mjs";
import { createUsers } from "./users/index.mjs";
import { createInventory } from "./inventory/index.mjs";
import { createPayments } from "./payments/index.mjs";
import { createOrders } from "./orders/index.mjs";
import { createNotifications } from "./notifications/index.mjs";
import { createGateway } from "./gateway/index.mjs";

export function createPlatform({ tokens = {}, users = [] } = {}) {
  const events = [];
  const notifications = createNotifications();
  const emit = (event) => { events.push(event); notifications.handle(event); };
  const inventory = createInventory({ emit });
  const payments = createPayments({ emit });
  const orders = createOrders({ emit, inventory, payments });
  const auth = createAuth(tokens);
  const gateway = createGateway({ auth, orders, inventory });
  return { gateway, auth, users: createUsers(users), inventory, payments, orders, notifications, events };
}
