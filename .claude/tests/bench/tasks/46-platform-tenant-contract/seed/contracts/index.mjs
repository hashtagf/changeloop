// Event contract v1. The source of truth lives in the contracts repository;
// each service vendors this file as event.mjs and must keep it identical.
export const EVENT_VERSION = 1;

export function createEvent(type, payload = {}) {
  if (typeof type !== "string" || !type) throw new TypeError("event type is required");
  return { version: EVENT_VERSION, type, payload: { ...payload } };
}

export function validateEvent(event) {
  return Boolean(event && event.version === EVENT_VERSION &&
    typeof event.type === "string" && event.type &&
    event.payload && typeof event.payload === "object" && !Array.isArray(event.payload));
}
