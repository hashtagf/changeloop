# Tasks

> This is the sole implementation ledger.

- [x] **T001** Pure amendment helpers extracted and covered by a focused test [key:task-1] [kind:implementation] [paths:.claude/harness/runtime/workflow/amendment-record.mjs,.claude/harness/runtime/workflow/change-lifecycle.mjs,.claude/harness/tests/amendment-record.test.mjs] [claims:amendment-record-module] — verify: `node --test .claude/harness/tests/amendment-record.test.mjs .claude/harness/tests/amendment-invalidation.test.mjs .claude/harness/tests/amendment-approval-survival.test.mjs`
- [x] **T002** Default deterministic gate stays green [key:task-2] [kind:implementation] [paths:.claude/harness/runtime/workflow/amendment-record.mjs,.claude/harness/runtime/workflow/change-lifecycle.mjs] [claims:amendment-record-module] — verify: `env -u CLAUDE_FOUNDATION_PROJECT -u CLAUDE_PROJECT_DIR bash .claude/tests/run-all.sh`
- [x] **T003** The default gate runs amendment-record.test.mjs [key:task-3] [paths:.claude/tests/run-all.sh] [claims:amendment-record-module] — verify: `grep -q 'amendment-record.test.mjs' .claude/tests/run-all.sh`
