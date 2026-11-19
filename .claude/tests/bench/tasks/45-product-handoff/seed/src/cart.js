// The shop cart. See ISSUE.md for the interface and docs/requirements.md for
// the behaviour the product team agreed.
export function createCart({ stock, prices } = {}) {
  const lines = new Map();
  return {
    add(sku, quantity) {
      lines.set(sku, (lines.get(sku) || 0) + quantity);
      return { ok: true, quantity: lines.get(sku) };
    },
    items() {
      return [...lines].map(([sku, quantity]) => ({ sku, quantity }));
    },
    totals() {
      return { subtotal: 0, shipping: 0, total: 0 };
    }
  };
}
