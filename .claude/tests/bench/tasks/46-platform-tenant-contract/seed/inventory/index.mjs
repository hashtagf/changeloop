import { createEvent } from "./event.mjs";

const fail = (code) => Object.assign(new Error(code), { code });

export function createInventory({ emit = () => {} } = {}) {
  const stock = new Map();
  return {
    stock: (sku) => stock.get(sku) ?? 0,
    setStock(sku, quantity) {
      if (!Number.isInteger(quantity) || quantity < 0) throw fail("INVALID_QUANTITY");
      stock.set(sku, quantity);
      emit(createEvent("stock.set", { sku, quantity }));
      return { sku, stock: quantity };
    },
    reserve(sku, quantity) {
      if (!Number.isInteger(quantity) || quantity < 1) throw fail("INVALID_QUANTITY");
      const available = stock.get(sku) ?? 0;
      if (available < quantity) throw fail("OUT_OF_STOCK");
      stock.set(sku, available - quantity);
      emit(createEvent("stock.reserved", { sku, quantity }));
      return { sku, stock: available - quantity };
    },
    release(sku, quantity) {
      if (!Number.isInteger(quantity) || quantity < 1) throw fail("INVALID_QUANTITY");
      const next = (stock.get(sku) ?? 0) + quantity;
      stock.set(sku, next);
      emit(createEvent("stock.released", { sku, quantity }));
      return { sku, stock: next };
    }
  };
}
