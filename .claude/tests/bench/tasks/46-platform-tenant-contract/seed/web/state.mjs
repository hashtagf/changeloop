export const initialState = () => ({ orders: {} });

export function reduce(state, event) {
  if (event?.type === "order.placed") {
    const { orderId, sku, quantity, amount } = event.payload;
    return { ...state, orders: { ...state.orders,
      [orderId]: { id: orderId, sku, quantity, amount, status: "placed" } } };
  }
  return state;
}
