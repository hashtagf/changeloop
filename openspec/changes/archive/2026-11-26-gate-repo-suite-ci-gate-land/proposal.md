# Change: gate ค่าเริ่มต้นของ repo ไม่รัน suite ช้าที่ตั้งใจไว้ให้รันแค่ใน CI และไม่รัน gate ซ้ำหลัง Land

- **Change:** `gate-repo-suite-ci-gate-land` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

change ของ Change Loop เองจะตรวจเสร็จเร็วขึ้นราวครึ่งหนึ่ง เพราะ gate ไม่รัน suite ช้าที่ตั้งใจให้รันแค่ใน CI และไม่ต้องรัน gate ซ้ำหลัง Land

## เหตุผล

[Data] gate ค่าเริ่มต้นใช้ 166 วินาที และ 158 วินาทีในนั้นมาจาก suite เดียวที่แอบรัน upgrade compat ซึ่งอยู่ใน tier ช้าของ CI ส่วน change วันนี้ทั้ง 4 ตัวรัน gate เต็มสองรอบต่อ change คือใน Prove และก่อน commit

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** wall time ของ gate ค่าเริ่มต้นไม่ถูกกำหนดด้วย upgrade compat; ไม่มีการรัน gate เต็มซ้ำหลัง Land
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- ลบหรือลด coverage ของ upgrade compatibility ใน CI
- เปลี่ยน Prove ให้ใช้ --affected (วัดแล้วไม่เร็วขึ้นเพราะ suite ช้าถูกเลือกอยู่ดี)
- เปลี่ยนพฤติกรรมของ harness ที่ ship ให้ผู้ใช้

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/tests/harness/run-risk-tiered-review-tests.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/harness/**`, `.claude/tests/README.md`, `CHANGELOG.md`, `.claude/tests/harness/risk-tiered-review-tier.test.mjs`, … +3 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| default-gate-skips-slow-upgrade | tier full | success | T001 | test: `.claude/tests/harness/run-risk-tiered-review-tests.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/harness/**`, `.claude/tests/harness/risk-tiered-review-tier.test.mjs` | — |
|  | รัน wrapper ตรง | boundary | T001 |  |  |
|  | tier ค่าเริ่มต้น | failure | T001 |  |  |
| prove-counts-as-gate | แก้ไฟล์หลัง Land | boundary | T002 | test: `.claude/tests/docs/maintainer-gate.test.mjs` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.

## Appendix: Amendment history

- Revision 1 (2026-11-26): The default gate measured about two minutes after the fix, so every guide that states its length is updated, including CONTRIBUTING.md.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f-dry-run-hook: The wrapper gains a test-only FOUNDATION_RISK_TIERED_DRY_RUN branch that fakes `passed` rows. It is an unrequested option inside the production wrapper. It is also the only thing the `full`, `release` and direct-run tests exercise. Nothing runs run-upgrade-compat-tests.sh for real under those tiers, so those scenarios are proven only at the selection level. (root/.claude/tests/harness/run-risk-tiered-review-tests.mjs:62) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f-run-all-static-check: The `run-all.sh` tier plumbing (export plus scrub allowance) is checked only by regexes on the script text. No test runs `run-all.sh --suite` or any tier end to end. A change that breaks propagation in a way the regexes still match would pass. (root/.claude/tests/harness/risk-tiered-review-tier.test.mjs:46) | minor | ยังเปิดอยู่ | claude-opus |
