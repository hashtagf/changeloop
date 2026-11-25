import { createEvent } from "./event.mjs";

const fail = (code) => Object.assign(new Error(code), { code });

export function createOrders({ emit = () => {}, inventory, payments }) {
  const orders = new Map();
  let next = 0;
  return {
    place({ userId, sku, quantity, amount }) {
      if (!Number.isInteger(amount) || amount < 1) throw fail("INVALID_AMOUNT");
      inventory.reserve(sku, quantity);
      const id = `ord_${++next}`;
      const charge = payments.charge({ orderId: id, amount });
      const order = { id, userId, sku, quantity, amount, chargeId: charge.id, status: "placed" };
      orders.set(id, order);
      emit(createEvent("order.placed", { orderId: id, userId, sku, quantity, amount }));
      return { ...order };
    },
    get: (id) => (orders.has(id) ? { ...orders.get(id) } : null),
    list: () => [...orders.values()].map((order) => ({ ...order }))
  };
}
