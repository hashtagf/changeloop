# Tasks

> This is the sole implementation ledger.

- [x] **T001** command telemetry มีคลาส quality-gate และ unknown-change และ export ฟังก์ชันจัดรหัส policy-guard ใหม่จาก reason [key:blocker-kinds] [kind:implementation] [paths:.claude/harness/runtime/observability/command-telemetry.mjs,.claude/harness/tests/telemetry-append.test.mjs,CHANGELOG.md] [claims:typed-gate-and-unknown-change-blockers-consumer-quality-gate-fai,typed-gate-and-unknown-change-blockers-unknown-change-a,typed-gate-and-unknown-change-blockers-unclassified-stop] — verify: `node --test .claude/harness/tests/telemetry-append.test.mjs`
- [x] **T002** lessons จัดกลุ่ม row policy-guard ใหม่และนับ quality-gate เป็น enforced [key:lessons-regroup] [kind:implementation] [paths:.claude/harness/runtime/observability/lessons-runtime.mjs,.claude/harness/tests/outcomes-lessons.test.mjs,CHANGELOG.md] [depends:T001] [claims:lessons-regroup-generic-history-change-row-policy-guard-reason-c,lessons-regroup-generic-history-change-row-policy-guard-reason-u,lessons-regroup-generic-history-row-contract-invalid-reason-cons] — verify: `node --test .claude/harness/tests/outcomes-lessons.test.mjs`
