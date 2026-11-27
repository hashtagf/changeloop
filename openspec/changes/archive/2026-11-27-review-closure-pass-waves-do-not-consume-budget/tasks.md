# Tasks

> This is the sole implementation ledger.

- [x] **T001** effectiveReviewAttemptLimit ไม่นับรอบ pass ในเพดาน (สูงสุด 3) และ closure wave คิดจากรอบที่ไม่ผ่าน พร้อมเทสต์และ CHANGELOG [key:wave-budget] [kind:implementation] [paths:.claude/harness/runtime/core/authority-policy.mjs,.claude/harness/runtime/evidence/proof-execution-runtime.mjs,.claude/harness/tests/authority-request-operation.test.mjs,.claude/harness/tests/proof-advance.test.mjs,CHANGELOG.md] [claims:pass-waves-do-not-consume-budget-1,pass-waves-do-not-consume-budget-2,pass-waves-do-not-consume-budget-3,pass-waves-do-not-consume-budget-4] — verify: `node --test .claude/harness/tests/authority-request-operation.test.mjs`
