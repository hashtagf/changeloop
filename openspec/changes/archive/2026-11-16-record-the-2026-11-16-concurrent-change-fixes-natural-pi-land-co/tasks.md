# Tasks

> This is the sole implementation ledger.

- [x] **T001** Unreleased changelog entries added [key:task-1] [kind:implementation] [paths:CHANGELOG.md] [claims:changelog-concurrency] — verify: `awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md | grep -q 'accept-target-edits' && awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md | grep -q 'land ได้'`
- [x] **T002** Release status records the v3.7.3 exception [key:task-2] [kind:implementation] [paths:docs/reports/user-scenario-release-status.md] [claims:status-3-7-3] — verify: `grep -q 'v3.7.3' docs/reports/user-scenario-release-status.md && bash .claude/tests/docs/run-doc-consistency.sh`
