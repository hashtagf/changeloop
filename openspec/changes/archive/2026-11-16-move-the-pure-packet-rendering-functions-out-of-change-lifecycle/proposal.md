# Change: Move the pure packet-rendering functions out of change-lifecycle.mjs into a new draft-packet-render.mjs, keeping every output and import identical.

- **Change:** `move-the-pure-packet-rendering-functions-out-of-change-lifecycle` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

change-lifecycle.mjs is the largest runtime file (3,527 lines) and mixes two jobs: about 590 lines of pure Markdown rendering for proposal, design, tasks and specs, and the stateful change lifecycle. The rendering block uses no factory state, so it can move as one unit. This is slice 1 of the owner-approved refactor of the five largest runtime files.

## Scope

- **In scope (`runtime-maintainability`):** Packet rendering lives in its own module and change-lifecycle.mjs shrinks by the moved block; Existing importers and rendered packets are unchanged
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/draft-packet-render.mjs`, `.claude/harness/runtime/workflow/change-lifecycle.mjs`

## Work type

refactor

## Refactor invariants

- —

- **Characterization:** —

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| rendering-module | Rendering module owns the functions | success | T001 | test | — |
| behavior-identical | Existing importers keep working | boundary | T001, T002 | test | — |

## Definition of done

- Fresh evidence for every claim (2).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
