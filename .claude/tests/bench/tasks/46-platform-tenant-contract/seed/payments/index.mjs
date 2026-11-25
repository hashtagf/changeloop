import { createEvent } from "./event.mjs";

const fail = (code) => Object.assign(new Error(code), { code });

export function createPayments({ emit = () => {} } = {}) {
  const charges = new Map();
  let next = 0;
  return {
    charge({ orderId, amount }) {
      if (!Number.isInteger(amount) || amount < 1) throw fail("INVALID_AMOUNT");
      const charge = { id: `ch_${++next}`, orderId, amount, refunded: 0 };
      charges.set(charge.id, charge);
      emit(createEvent("payment.charged", { chargeId: charge.id, orderId, amount }));
      return { ...charge };
    },
    get: (id) => (charges.has(id) ? { ...charges.get(id) } : null)
  };
}
