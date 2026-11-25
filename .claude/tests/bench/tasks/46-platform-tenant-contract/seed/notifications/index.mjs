import { validateEvent } from "./event.mjs";

const TEXT = {
  "order.placed": (payload) => `Order ${payload.orderId} placed`,
  "payment.charged": (payload) => `Charged ${payload.amount} for order ${payload.orderId}`
};

export function createNotifications() {
  const sent = [];
  return {
    handle(event) {
      if (!validateEvent(event)) throw Object.assign(new Error("INVALID_EVENT"), { code: "INVALID_EVENT" });
      const text = TEXT[event.type]?.(event.payload) ?? null;
      if (text) sent.push({ type: event.type, text });
      return text;
    },
    messages: () => sent.map((message) => ({ ...message }))
  };
}
