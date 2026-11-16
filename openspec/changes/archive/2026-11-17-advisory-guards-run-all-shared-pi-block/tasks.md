# Tasks

> This is the sole implementation ledger.

- [x] **T001** run-all.sh เรียก advisory-guards-docs.test.mjs และ pi-shared.test.mjs ตั้งโหมด block ในเทสต์ที่ตรวจการปฏิเสธ [key:wire-tests] [kind:implementation] [paths:.claude/tests/run-all.sh,.claude/harness/tests/pi-shared.test.mjs,.claude/tests/harness/test-registration.test.mjs] [claims:advisory-tests-gated] — verify: `FOUNDATION_UPDATE_CHECK=0 node --test .claude/tests/harness/test-registration.test.mjs .claude/harness/tests/pi-shared.test.mjs`
- [x] **T002** รายงานสถานะ release มีหัวข้อ v3.7.5 candidate พร้อมข้อยกเว้น paid smoke [key:release-status-note] [paths:docs/reports/user-scenario-release-status.md] [claims:release-status-exception] — verify: `grep -q 'v3.7.5 candidate.*no paid smoke' docs/reports/user-scenario-release-status.md`
