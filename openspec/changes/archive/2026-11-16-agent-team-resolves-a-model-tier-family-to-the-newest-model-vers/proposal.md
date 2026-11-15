# Change: agent-team resolves a model tier family to the newest model version by numeric version order, treating a trailing 8-digit date as a snapshot tie-break and preferring plain versioned ids over unversioned aliases.

- **Change:** `agent-team-resolves-a-model-tier-family-to-the-newest-model-vers` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

The owner requires each tier family to use its latest version. Plain string ordering picked claude-opus-4-20250514 over claude-opus-4-6 and claude-opus-latest over claude-opus-5-5, because a snapshot date or alias outranks the real version.

## Scope

- **In scope (`maintainer-pi-extensions`):** A tier family resolves to its newest version
- **Out of scope:** edits outside `pi-extensions/agent-team/roles.ts`, `pi-extensions/agent-team/roles.test.cjs`, `pi-extensions/agent-team/README.md`

## Work type

bugfix

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| newest-version | Snapshot date does not outrank a newer version | unclassified | T001 | test: `pi-extensions/agent-team/roles.test.cjs` | — |
|  | Newest version wins over aliases and snapshots | unclassified | T001 |  |  |
|  | Alias only as a last resort | unclassified | T001 |  |  |

## Definition of done

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
