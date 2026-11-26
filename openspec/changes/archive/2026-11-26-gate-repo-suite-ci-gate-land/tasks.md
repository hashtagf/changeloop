# Tasks

> This is the sole implementation ledger.

- [x] **T001** wrapper อ่าน tier จาก run-all และ test ใน run-all process control พร้อม README/CHANGELOG [key:tier-aware-wrapper] [kind:implementation] [paths:.claude/tests/harness/run-risk-tiered-review-tests.mjs,.claude/tests/run-all.sh,.claude/tests/harness/**,.claude/tests/README.md,CHANGELOG.md,.claude/tests/harness/risk-tiered-review-tier.test.mjs] [claims:default-gate-skips-slow-upgrade-run-all-sh-full,default-gate-skips-slow-upgrade-run-all-sh-full-2,default-gate-skips-slow-upgrade-run-risk-tiered-review-tests-mjs] — verify: `node --test .claude/tests/harness/risk-tiered-review-tier.test.mjs`
- [x] **T002** AGENTS.md และ CLAUDE.md บอกว่า Prove static-analysis นับเป็น gate [key:prove-gate-docs] [kind:implementation] [paths:AGENTS.md,CLAUDE.md,CONTRIBUTING.md,.claude/tests/docs/maintainer-gate.test.mjs] [claims:prove-counts-as-gate] — verify: `node --test .claude/tests/docs/maintainer-gate.test.mjs`
