# Order cancellation with refunds

Read `PLATFORM.md` first. Every repository is its own Git repository. This
change is owned by `payments`, `orders`, `notifications` and `web`;
`contracts`, `auth`, `users`, `inventory`, `gateway` and `sdk` are
read-only for it and must stay byte-for-byte unchanged (cancellation is an
internal operation in this change: no gateway route and no SDK method).
`npm test` at the root runs every repository's tests. Node >=20.19, no
dependencies or network.

## payments

`refund(chargeId, amount)` refunds part or all of a charge:

- `amount` defaults to the remaining refundable amount (`amount - refunded`).
- It must be a positive integer no larger than the remaining amount; otherwise
  throw code `INVALID_REFUND` and change nothing. An unknown charge throws
  `NOT_FOUND`.
- On success `refunded` grows by `amount`, the event
  `payment.refunded` with payload `{ chargeId, orderId, amount }` is emitted,
  and the updated charge `{ id, orderId, amount, refunded }` is returned.

## orders

`cancel(orderId)` cancels a placed order:

- An unknown order throws `NOT_FOUND`; a cancelled one throws
  `ALREADY_CANCELLED` and refunds nothing again.
- Otherwise: refund the order's charge in full, release its quantity back to
  inventory (`inventory.release(sku, quantity)` already exists), set status
  `cancelled`, emit `order.cancelled` with payload `{ orderId }` after the
  refund, and return the updated order.

## notifications

`payment.refunded` becomes `Refunded <amount> for order <orderId>` and
`order.cancelled` becomes `Order <orderId> cancelled`. Existing texts stay.

## web

`reduce` marks a known order `cancelled` on `order.cancelled` (without
mutating the previous state) and ignores it for an unknown order.

Add meaningful tests in each repository you change.
