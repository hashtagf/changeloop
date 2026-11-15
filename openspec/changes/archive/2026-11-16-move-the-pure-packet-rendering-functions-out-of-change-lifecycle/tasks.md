# Tasks

> This is the sole implementation ledger.

- [x] **T001** Rendering block moved to draft-packet-render.mjs and re-exported from change-lifecycle.mjs [key:task-1] [kind:implementation] [paths:.claude/harness/runtime/workflow/draft-packet-render.mjs,.claude/harness/runtime/workflow/change-lifecycle.mjs] [claims:rendering-module,behavior-identical] — verify: `test -f .claude/harness/runtime/workflow/draft-packet-render.mjs && ! grep -q '^export function renderDraftProposal' .claude/harness/runtime/workflow/change-lifecycle.mjs && node --test .claude/harness/tests/design-render.test.mjs .claude/harness/tests/change-draft-materialization.test.mjs .claude/harness/tests/reader-guide.test.mjs .claude/harness/tests/change-creation.test.mjs`
- [x] **T002** Default deterministic gate is green after the move [key:task-2] [kind:implementation] [paths:.claude/harness/runtime/workflow/draft-packet-render.mjs,.claude/harness/runtime/workflow/change-lifecycle.mjs] [claims:behavior-identical] — verify: `env -u CLAUDE_FOUNDATION_PROJECT -u CLAUDE_PROJECT_DIR bash .claude/tests/run-all.sh`
