# Change: Record the 2026-11-16 concurrent-change fixes, natural Pi Land consent and runtime refactors in the Unreleased changelog, and the v3.7.3 paid-smoke exception in the release status report, so 3.7.3 can be published.

- **Change:** `record-the-2026-11-16-concurrent-change-fixes-natural-pi-land-co` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## Why

Four fixes that let several Change Loop changes run at once, the Pi Land-detection and consent change, and four behavior-preserving runtime refactors are on main but absent from the Unreleased changelog. The release workflow publishes that section as the release notes. The owner asked to release 3.7.3 without a paid scenario smoke, which the release status report must record.

## Scope

- **In scope (`release-notes`):** The Unreleased changelog lists the concurrent-change fixes and Pi consent change; The release status report records the v3.7.3 paid-smoke exception
- **Out of scope:** edits outside `CHANGELOG.md`, `docs/reports/user-scenario-release-status.md`

## Work type

docs

## Impact and risk

- **Impact:** low
- **Coupling:** isolated
- **Specs:** none; docs-only work modifies no living spec

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| changelog-concurrency | Fixes are listed | unclassified | T001 | static-analysis | — |
| status-3-7-3 | Exception recorded | unclassified | T002 | static-analysis | — |

## Definition of done

- Fresh evidence for every claim (2).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
