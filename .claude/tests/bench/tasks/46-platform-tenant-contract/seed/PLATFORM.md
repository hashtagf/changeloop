# Platform

Ten repositories, each its own Git repository with its own tests:

| repository | owns |
|---|---|
| contracts | the event envelope (source of truth for every vendored `event.mjs`) |
| auth | bearer-token sessions |
| users | the user directory |
| inventory | stock per SKU; emits stock events |
| payments | charges; emits payment events |
| orders | order placement; reserves stock and charges |
| notifications | turns events into user messages |
| gateway | the HTTP-shaped entry point (`handle(request)`) |
| sdk | the client used by apps; talks only to the gateway |
| web | the UI state reducer fed by events |

`platform.mjs` at the root wires them. Services never import each other;
dependencies are injected. `npm test` at the root runs every repository's tests.
