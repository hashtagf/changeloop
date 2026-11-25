const STATUS = {
  UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, OUT_OF_STOCK: 409,
  INVALID_QUANTITY: 400, INVALID_AMOUNT: 400
};
const fail = (code) => Object.assign(new Error(code), { code });

export function createGateway({ auth, orders, inventory }) {
  function route(context, { method, path, body }) {
    let match;
    if ((match = /^\/stock\/([^/]+)$/.exec(path))) {
      const sku = decodeURIComponent(match[1]);
      if (method === "GET") return [200, { sku, stock: inventory.stock(sku) }];
      if (method === "PUT") {
        if (context.role !== "admin") throw fail("FORBIDDEN");
        return [200, inventory.setStock(sku, body?.stock)];
      }
    }
    if (method === "POST" && path === "/orders")
      return [201, orders.place({ userId: context.userId, sku: body?.sku,
        quantity: body?.quantity, amount: body?.amount })];
    if (method === "GET" && (match = /^\/orders\/([^/]+)$/.exec(path))) {
      const order = orders.get(decodeURIComponent(match[1]));
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
