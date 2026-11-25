# Tasks

> This is the sole implementation ledger.

- [x] **T001** sync นำไฟล์ค้างเข้า sandbox และ Land ตรวจว่าไฟล์ค้างถูกนำเข้าครบ พร้อม regression แบบ end-to-end [key:carry-uncommitted-target] [kind:implementation] [paths:.claude/harness/runtime/workflow/transaction/target-edits.mjs,.claude/harness/runtime/workflow/sandbox/sandbox-sync.mjs,.claude/harness/runtime/workflow/land/apply-entries.mjs,.claude/harness/tests/landed-carry-sync.test.mjs,.claude/tests/harness/contracts/sandbox-land.sh] [claims:carry-uncommitted-change-land,carry-uncommitted-land,carry-uncommitted-land-apply,carry-uncommitted-sandbox-sync] — verify: `node --test .claude/harness/tests/landed-carry-sync.test.mjs`
