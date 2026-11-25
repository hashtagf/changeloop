// The app-facing client. It only speaks to the gateway's handle(request).
export function createClient(gateway, token) {
  const call = (method, path, body) => {
    const response = gateway.handle({ method, path, headers: { authorization: `Bearer ${token}` }, body });
    if (response.status >= 400)
      throw Object.assign(new Error(response.body.error), { status: response.status, code: response.body.error });
    return response.body;
  };
  const sku = (value) => encodeURIComponent(value);
  return {
    stock: (value) => call("GET", `/stock/${sku(value)}`),
    setStock: (value, stock) => call("PUT", `/stock/${sku(value)}`, { stock }),
    placeOrder: (input) => call("POST", "/orders", input),
    order: (id) => call("GET", `/orders/${encodeURIComponent(id)}`)
  };
}
