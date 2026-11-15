# Change: Move the maintainer's own Pi extensions (agent-team, ask-user, background-bash) into a repository-only pi-extensions/ folder with a test runner and an installer that copies them into the Pi agent directory, so they are developed in one place and installed from it.

- **Change:** `move-the-maintainer-s-own-pi-extensions-agent-team-ask-user-back` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

The maintainer develops these extensions directly inside ~/.pi/agent/extensions, outside version control. The owner chose to keep them in this repository as unshipped development tooling (excluding the personal claude-accounts extension) and to install them into Pi from here.

## Scope

- **In scope (`maintainer-pi-extensions`):** agent-team, ask-user and background-bash live side by side under pi-extensions/; The folder never reaches consumers; One command installs the extensions into Pi with a backup; One command runs the extensions' tests
- **Out of scope:** edits outside `pi-extensions/agent-team`, `pi-extensions/ask-user`, `pi-extensions/background-bash`, `pi-extensions/install.sh`, `pi-extensions/test.sh`, `pi-extensions/README.md`, … +1 more

## Work type

chore

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| extensions-in-repo | Extensions are present without personal paths | unclassified | T001 | static-analysis | — |
| not-shipped | Shipping surfaces ignore the folder | unclassified | T004 | static-analysis | — |
| installer | Fresh install | unclassified | T002 | static-analysis | — |
|  | Replaced copy is backed up | unclassified | T002 |  |  |
|  | Dry run changes nothing | unclassified | T002 |  |  |
| test-runner | Runner and docs exist | unclassified | T003 | static-analysis | — |

## Definition of done

- Fresh evidence for every claim (6).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
