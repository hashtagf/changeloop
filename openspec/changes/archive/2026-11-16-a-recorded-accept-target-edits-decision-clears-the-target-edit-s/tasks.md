# Tasks

> This is the sole implementation ledger.

- [x] **T001** targetEditIssues accepts per path against the recorded acceptance [key:task-1] [kind:implementation] [paths:.claude/harness/runtime/workflow/target-edits.mjs,.claude/harness/tests/target-edits.test.mjs] [claims:acceptance-per-path-the-gate-re-checks-with-only-the-blocking-pa,acceptance-per-path-that-path-s-bytes-change-afterwards] — verify: `node --test .claude/harness/tests/target-edits.test.mjs`
- [x] **T002** Default deterministic gate stays green [key:task-2] [kind:implementation] [paths:.claude/harness/runtime/workflow/target-edits.mjs] [claims:acceptance-per-path-the-gate-re-checks-with-only-the-blocking-pa,acceptance-per-path-that-path-s-bytes-change-afterwards] — verify: `env -u CLAUDE_FOUNDATION_PROJECT -u CLAUDE_PROJECT_DIR bash .claude/tests/run-all.sh`
