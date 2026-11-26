# Change: Test discrimination ไม่สั่งซ่อมไฟล์ helper ที่ไม่มี test

- **Change:** `test-discrimination-helper-test` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

ไฟล์โค้ดช่วยของ test ที่ไม่มี test อยู่ข้างในจะไม่ถูกสั่งซ่อมอีก agent จึงไม่เสียรอบ Prove เพิ่ม

## เหตุผล

[Data] paid e2e project-tracker-api ที่ f046bbc0 ทั้งบน Pi และ Claude Code โดน REPAIR tests-pass-on-base ที่ระบุไฟล์ helper (test/helpers.js, test/support/harness.js) ทำให้ lane นี้ใช้ request และเวลาเพิ่ม

## ขอบเขต

- **อยู่ในขอบเขต (`prove`):** ไฟล์ helper ไม่ทำให้เกิด REPAIR tests-pass-on-base และไม่ขึ้นเป็น no-verdict
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนการจัดว่าไฟล์ใดเป็นไฟล์ test
- เปลี่ยนการตัดสินแบบรวมทั้ง repository

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/evidence/test-discrimination.mjs`, `.claude/harness/tests/test-discrimination-verdict.test.mjs`, `CHANGELOG.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| no-test-file-not-judged | ผลของ runner | boundary | T001 | test: `.claude/harness/tests/test-discrimination-verdict.test.mjs` | — |
|  | helper คู่กับ test ที่ดี | failure | T001 |  |  |
|  | test จริงที่ผ่านบนโค้ดเดิม | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (2); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f-helper-named-in-mixed-pass: ถ้ามี helper `no-tests` กับ test ที่ผ่านบนโค้ดเดิมแต่ไม่ได้ผูก scenario ใดเลย `judged` จะว่าง ไม่เข้า branch all-helpers และตกลงที่ `{...row, outcome}` ซึ่งเก็บ `row.testFiles` เดิมที่รวม helper ไว้ finding จึงระบุ test/helpers.js ว่า 'pass on the original code' ทั้งที่ไฟล์นั้นไม่มี test ควรตัดไฟล์ `no-tests` ออกจาก `testFiles` ในทุก branch ที่ส่ง row กลับ ไม่ใช่เฉพาะกรณีที่ทุกไฟล์เป็น `no-tests` (root/.claude/harness/runtime/evidence/test-discrimination.mjs:229) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f-no-tests-cache-untested: requirement ระบุว่าผลนี้ cache เหมือนผลอื่น โค้ดบันทึก `no-tests` ลง cache แล้ว แต่ไม่มี test ที่รัน evaluate สองรอบแล้วเห็นว่าผล `no-tests` ถูกใช้ซ้ำ นอกจากนี้ไม่มี test สำหรับกรณีที่มีแต่ helper ล้วน ซึ่งคืน `testFiles: []` (root/.claude/harness/tests/test-discrimination-verdict.test.mjs:196) | minor | ยังเปิดอยู่ | claude-opus |
