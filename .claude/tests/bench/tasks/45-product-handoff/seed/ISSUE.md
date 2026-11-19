# Cart

The product team handed over `docs/requirements.md`. Implement feature F-01
(the cart) in `src/cart.js`; F-02 is a later change.

Interface: `createCart({ stock, prices })` where `stock.available(sku)` returns
the units in stock (it may throw when the stock service is down) and
`prices.current(sku)` returns the current unit price in baht. The cart has
`add(sku, quantity)`, `remove(sku)`, `items()` (an array of `{ sku, quantity }`
in the order first added), and `totals()` (`{ subtotal, shipping, total }`).
`add` returns `{ ok: true, quantity, notice? }` or `{ ok: false, error }`.

`npm test` runs the unit tests.
