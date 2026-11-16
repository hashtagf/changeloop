# Tasks

> This is the sole implementation ledger.

- [x] **T001** Bootstrap helper, loader registration and post-reload dispatch, with tests [key:task-1] [kind:implementation] [paths:.claude/harness/adapters/pi-bootstrap.mjs,.claude/harness/adapters/pi-shared.ts,.claude/harness/tests/pi-shared.test.mjs] [claims:bootstrap-commands-a-trusted-git-repository-without-settings-run,bootstrap-commands-a-pending-command-is-older-than-two-minutes-o,bootstrap-refusals-an-untrusted-repository-runs-change,bootstrap-refusals-change-runs-in-the-home-directory-with-no-git,bootstrap-refusals-pi-opens-a-project-that-has-claude-harness-fo,no-write-on-open] — verify: `FOUNDATION_UPDATE_CHECK=0 node --test .claude/harness/tests/pi-shared.test.mjs`
- [x] **T002** Harness README and changelog [key:task-2] [kind:implementation] [paths:.claude/harness/README.md,CHANGELOG.md] [claims:first-use-docs] — verify: `grep -q 'first' .claude/harness/README.md && grep -q 'first' CHANGELOG.md && bash .claude/tests/docs/run-doc-consistency.sh`
