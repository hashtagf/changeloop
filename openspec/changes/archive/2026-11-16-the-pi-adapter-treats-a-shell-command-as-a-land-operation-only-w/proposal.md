# Change: The Pi adapter treats a shell command as a Land operation only when the Change Loop CLI runs a Land subcommand, so the word archive in a path or argument no longer blocks git, rg, or other ordinary commands.

- **Change:** `the-pi-adapter-treats-a-shell-command-as-a-land-operation-only-w` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## Why

On 2026-11-16 the Pi bash guard refused 'git add openspec/changes/archive/...' and even a read-only 'rg archive' with 'Land needs user approval', because it matched the bare word archive anywhere in the command. Committing an archived change, which every Change Loop delivery does, was impossible from a Pi session. Land subcommands are only reachable through the Change Loop CLI (claude-foundation or foundation.mjs), so the match must be anchored there.

## Scope

- **In scope (`pi-host-adapter`):** Ordinary commands mentioning archive are not treated as Land
- **Out of scope:** edits outside `.claude/harness/adapters/pi-extension.mjs`, `.claude/harness/tests/pi-extension.test.mjs`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** In a Pi session without /land, run git add openspec/changes/archive/x/tasks.md.
- **Root cause:** pi-extension.mjs matches land subcommand words (including bare 'archive') anywhere in the normalized command instead of only after a Change Loop CLI invocation.
- **Regression proof:** —

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| archive-word-not-land | Git on an archived change path runs | success | T001, T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | CLI archive still needs Land | boundary | T001, T002 |  |  |

## Definition of done

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-16): The owner asked to also fix natural Land consent: 'land ได้' (without เลย) was not recognized, while questions and refusals must never count as consent.
