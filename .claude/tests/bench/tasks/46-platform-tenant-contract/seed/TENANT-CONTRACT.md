# Tenant-scoped event contract

The platform becomes multi-tenant. Read `PLATFORM.md` first. Every
repository is its own Git repository; change only the repositories this
contract requires and keep each one's tests passing (`npm test` at the root
runs them all). Node >=20.19, no dependencies or network.

## Event contract v2 (contracts, and every vendored `event.mjs`)

- An event is `{ version: 2, type, tenantId, payload }`; `EVENT_VERSION` is `2`.
- `createEvent(type, payload, tenantId)` throws a `TypeError` when `tenantId`
  is not a non-empty string (as it already does for a missing type).
- `validateEvent(event)` is true only for version 2 with a non-empty string
  `tenantId`, a non-empty string `type` and an object payload. Version 1
  events are invalid.
- Services vendor the contract as `event.mjs`; every vendored copy must match
  `contracts/index.mjs` byte for byte.

## Tenancy

- A token session is `{ userId, role, tenantId }`. `authenticate` returns
  `{ userId, role, tenantId }`; a session without a non-empty string
  `tenantId` is `UNAUTHORIZED` (401 at the gateway).
- The tenant comes only from the token. A `tenantId` in a request body or an
  `x-tenant-id` header is ignored.
- Stock, orders and charges are isolated per tenant. Through the gateway, one
  tenant sees stock `0` for a SKU only another tenant stocked, and
  `404 NOT_FOUND` for another tenant's order. Order ids may repeat across
  tenants or not; only isolation is required.
- Every event a request causes carries the caller's `tenantId`.
- `notifications.handle` refuses an invalid event with code `INVALID_EVENT`.
  `notifications.messages(tenantId)` returns only that tenant's messages, each
  `{ type, text }` with today's texts.

## Unchanged

`users`, `web` and `sdk` need no change and must stay byte-for-byte
unchanged; the SDK keeps working against the gateway as before.
`createPlatform({ tokens, users })` in `platform.mjs` keeps its shape.
Add meaningful tests in each repository you change.
