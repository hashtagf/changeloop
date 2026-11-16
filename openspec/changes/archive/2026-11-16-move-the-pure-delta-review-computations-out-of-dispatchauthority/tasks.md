# Tasks

> This is the sole implementation ledger.

- [x] **T001** Delta helpers extracted with focused characterization tests [key:task-1] [kind:implementation] [paths:.claude/harness/runtime/workflow/review-delta-scope.mjs,.claude/harness/runtime/workflow/authority-runtime.mjs,.claude/harness/tests/review-delta-scope.test.mjs,.claude/tests/run-all.sh] [claims:review-delta-scope-module] — verify: `node --test .claude/harness/tests/review-delta-scope.test.mjs .claude/harness/tests/authority-response-validation.test.mjs .claude/harness/tests/workflow-policy.test.mjs`
- [x] **T002** Default deterministic gate stays green [key:task-2] [kind:implementation] [paths:.claude/harness/runtime/workflow/review-delta-scope.mjs,.claude/harness/runtime/workflow/authority-runtime.mjs] [claims:review-delta-scope-module] — verify: `env -u CLAUDE_FOUNDATION_PROJECT -u CLAUDE_PROJECT_DIR bash .claude/tests/run-all.sh`
