# Tasks

> This is the sole implementation ledger.

- [x] **T001** Pi adapter Build-workspace bash cwd, forwarded guard context, updated prompt, with regressions [key:task-1] [kind:implementation] [paths:.claude/harness/adapters/pi-extension.mjs,.claude/harness/tests/pi-extension.test.mjs,.claude/harness/README.md,CHANGELOG.md] [claims:build-shell-cwd-the-session-is-in-build-and-the-agent-runs-a-bas,build-shell-cwd-the-session-has-no-recorded-build-phase-and-the,build-shell-cwd-a-worker-session-started-with-foundation-parent,guard-warning-visible] — verify: `node --test .claude/harness/tests/pi-extension.test.mjs`
- [x] **T002** Benchmark records provenance.host from --host and the lab passes --host pi [key:task-2] [kind:implementation] [paths:.claude/tests/bench/openspec-native/run.mjs,.claude/tests/bench/openspec-native/lab.mjs,.claude/tests/bench/tests/openspec-native-lab.test.mjs] [claims:scorecard-host] — verify: `node --test .claude/tests/bench/tests/openspec-native-lab.test.mjs`
