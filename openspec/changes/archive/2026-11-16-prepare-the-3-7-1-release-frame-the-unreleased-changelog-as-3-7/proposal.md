# Change: Prepare the 3.7.1 release: frame the Unreleased changelog as 3.7.1, document the shared Pi runtime install, record the owner-authorized paid-smoke exception, and ignore the machine-local Pi wrapper so the release source tree is clean.

- **Change:** `prepare-the-3-7-1-release-frame-the-unreleased-changelog-as-3-7` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

The owner chose to publish current main as 3.7.1 instead of 3.8.0 and approved publishing without the paid scenario smoke. The changelog still claims 3.8.0 and omits the shared Pi runtime install, and the untracked .pi/bin/ wrapper makes release preflight report a dirty source tree.

## Scope

- **In scope (`release-notes`):** The changelog describes the next release as 3.7.1 including the shared Pi runtime; The release status report records the 3.7.1 paid-smoke exception; The machine-local Pi wrapper never dirties the release source tree
- **Out of scope:** edits outside `CHANGELOG.md`, `docs/reports/user-scenario-release-status.md`, `.gitignore`

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
| changelog-names-3-7-1 | Changelog names 3.7.1 | unclassified | T001 | static-analysis | — |
| status-records-exception | Status report records the exception | unclassified | T002 | static-analysis | — |
| ignore-pi-bin | Pi wrapper is ignored | unclassified | T003 | static-analysis | — |

## Definition of done

- Fresh evidence for every claim (3).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
