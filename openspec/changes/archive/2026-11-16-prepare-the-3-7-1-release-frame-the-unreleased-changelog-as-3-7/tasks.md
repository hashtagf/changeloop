# Tasks

> This is the sole implementation ledger.

- [x] **T001** CHANGELOG Unreleased section names 3.7.1 and documents the shared Pi runtime install [key:task-1] [kind:implementation] [paths:CHANGELOG.md] [claims:changelog-names-3-7-1] — verify: `grep -q 'release \*\*3.7.1\*\*' CHANGELOG.md && ! grep -q '3\.8\.0' CHANGELOG.md && grep -q 'shared-runtime' CHANGELOG.md`
- [x] **T002** Release status report records the v3.7.1 paid-smoke exception [key:task-2] [kind:implementation] [paths:docs/reports/user-scenario-release-status.md] [claims:status-records-exception] — verify: `grep -q 'v3.7.1' docs/reports/user-scenario-release-status.md`
- [x] **T003** .gitignore ignores the machine-local .pi/bin/ wrapper [key:task-3] [kind:implementation] [paths:.gitignore] [claims:ignore-pi-bin] — verify: `grep -qx '/.pi/bin/' .gitignore`
