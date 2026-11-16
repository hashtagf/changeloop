# Change: Turn on Change Loop model-tier routing for this repository by setting models.routing to true in foundation.json, so Build tasks use the fast, standard or deep tier by task kind and risk, matching the agent-team worker roles.

- **Change:** `turn-on-change-loop-model-tier-routing-for-this-repository-by-se` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

The owner chose to align Change Loop with agent-team: agent-team already picks haiku, sonnet or opus by role from foundation.json, while routing off put every Change Loop task on the standard tier.

## Scope

- **In scope (`repository-change-loop-config`):** This repository routes Build tasks across model tiers
- **Out of scope:** edits outside `foundation.json`

## Work type

config

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| routing-on | Routing enabled | unclassified | T001 | test | — |

## Definition of done

- Fresh evidence for every claim (1).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-15): test provider needs a counted result
