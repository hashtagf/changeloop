# Change: Move the sandbox setup functions (setup commands, batches, setup plan, dependency digest, dependency refresh) out of sandbox-runtime.mjs into a new sandbox-setup.mjs, keeping every output and import identical.

- **Change:** `move-the-sandbox-setup-functions-setup-commands-batches-setup-pl` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## Why

sandbox-runtime.mjs is the largest workflow file after change-lifecycle (2,639 lines). About 195 lines in it run and record the project's sandbox setup commands, a job separate from creating, syncing and replaying sandboxes, and they share no factory state. Moving them as one unit makes both parts easier to read. Slice 3 of the owner-approved refactor of the largest runtime files.

## Scope

- **In scope (`runtime-maintainability`):** Sandbox setup lives in its own module
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/sandbox-setup.mjs`, `.claude/harness/runtime/workflow/sandbox-runtime.mjs`

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
| sandbox-setup-module | Importers keep working | boundary | T001, T002 | test | — |

## Definition of done

- Fresh evidence for every claim (1).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
