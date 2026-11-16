# Tasks

> This is the sole implementation ledger.

- [x] **T001** Setup block moved to sandbox-setup.mjs and re-exported from sandbox-runtime.mjs [key:task-1] [kind:implementation] [paths:.claude/harness/runtime/workflow/sandbox-setup.mjs,.claude/harness/runtime/workflow/sandbox-runtime.mjs] [claims:sandbox-setup-module] — verify: `test -f .claude/harness/runtime/workflow/sandbox-setup.mjs && ! grep -q '^export function runSandboxSetupCommand' .claude/harness/runtime/workflow/sandbox-runtime.mjs && node --test .claude/harness/tests/sandbox-runtime-sync.test.mjs`
- [x] **T002** Default deterministic gate stays green [key:task-2] [kind:implementation] [paths:.claude/harness/runtime/workflow/sandbox-setup.mjs,.claude/harness/runtime/workflow/sandbox-runtime.mjs] [claims:sandbox-setup-module] — verify: `env -u CLAUDE_FOUNDATION_PROJECT -u CLAUDE_PROJECT_DIR bash .claude/tests/run-all.sh`
