# Harness runtime architecture

`foundation.mjs` is the compatibility entrypoint and composition root. Runtime
implementation is grouped by domain:

- `core/` — CLI parsing/routing, process execution, shared trust, the compiled
  execution contract, convergent gates, authority policy, lifecycle reducer,
  and read-only runtime/proof/journal projections.
- `evidence/` — evidence contracts, artifacts, proof, review, CI, signed semantic
  acceptance, and provider execution.
- `workflow/` — change, agent, repository, sandbox, authority, Land, and archive state machines.
- `observability/` — telemetry ingestion, normalization, and read-only metrics reporting.
- `quality/` — consumer quality discovery, policy, adapters, and evaluation.
- `contracts/` — portable schemas for instruction provenance and host execution results.

## Dependency rules

1. The entrypoint creates stores and runtimes through explicit factory dependencies.
2. Domain modules should not import `foundation.mjs` or mutate another domain's private state.
3. Dependencies point from `workflow` to `evidence`, then to `core`/`contracts`;
   `observability` and `quality` depend only on `core`/`contracts`; reverse edges are forbidden. Direct cross-domain imports are limited to stable pure
   helpers and contracts along that direction. Stateful behavior is injected as a callback.
4. Pure validation and normalization stay separate from filesystem/process adapters.
5. Public CLI compatibility remains in `foundation.mjs` and `core/cli-router.mjs`.
6. Import a symbol from the module that owns it. Re-exports are allowed only for the
   surfaces `openspec/specs/runtime-maintainability` pins (`change-lifecycle` and
   `sandbox-runtime`'s sandbox-setup functions).
7. Timers go through `core/timing.mjs` and deliberately ignored failures through
   `core/best-effort.mjs`; lint allows neither anywhere else.

These rules keep subsystem tests bounded and prevent the compatibility entrypoint from
growing back into a monolith.

The deterministic architecture suite enforces this graph and fails on any
runtime folder that is not a declared domain:

```text
          contracts / core
                   ^
 evidence / observability / quality
                   ^
         workflow
            ^
       composition root
```

## Workflow groups

Every workflow module lives in a feature folder. A group imports only itself
and the groups below it, so the tree is a layered map; the architecture suite
fails on an upward import, a module left at `workflow/`, or an undeclared group.

| Group | Owns |
|---|---|
| `land/` | Land readiness, Apply, archive, undo, and post-apply verification |
| `sandbox/` | Isolated workspace creation, copy, replay, inspection, sync, setup, cleanup |
| `delivery/` | Multi-repository delivery saga, merge, and pull requests |
| `advance/` | The `advance` driver: envelopes, phase actions, recovery |
| `change/` | Change start, materialize, resolve, revise, amend, validate, abandon, approval page |
| `authority/` | Authority requests, budgets, leases, agent planning and dispatch, handoff |
| `draft/` | Semantic draft and amendment compilers, draft folders, packet rendering |
| `packet/` | Task and review packets, review delta scope, resume packet, verification plan |
| `investigation/` | Investigation records and reports |
| `prototype/` | Prototype binding, checklist, sync, and previews |
| `repository/` | Repository topology, snapshots, and projections |
| `transaction/` | Target-edit records, Land journal, undo plan, delivery integrity, copy base |
| `validation/` | Pure draft and field validators |

Order (top may import below): land → sandbox → delivery → advance → change →
authority → draft → packet → investigation → prototype → repository →
transaction → validation.
