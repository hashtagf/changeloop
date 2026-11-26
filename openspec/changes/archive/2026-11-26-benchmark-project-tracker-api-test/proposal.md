# Change: ตัวตรวจผลของ benchmark project-tracker-api ไม่ใช้จำนวน test ขั้นต่ำที่โจทย์ไม่ได้บอก

- **Change:** `benchmark-project-tracker-api-test` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

คะแนนข้อ "มี test" ของ benchmark project-tracker-api จะดูว่า test ตรวจโค้ดจริง ไม่ใช่จำนวน test ที่โจทย์ไม่ได้บอก

## เหตุผล

[Data] paid e2e project-tracker-api บน Claude Code ได้ 32/33 เพราะ agent เขียน test 10 ตัวซึ่งล้มบนโค้ดเดิม 9 ตัว แต่ตัวตรวจผลต้องการอย่างน้อย 15 ตัวโดยโจทย์ไม่ได้บอก agent จึงเสียรอบซ่อมโดยไม่รู้เกณฑ์

## ขอบเขต

- **อยู่ในขอบเขต (`prove`):** suite ที่ตรวจพฤติกรรมจริงได้คะแนนข้อนี้ไม่ว่าจะแบ่งเป็นกี่ test
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยน TRACKER-API.md หรือ seed
- เปลี่ยนตัวตรวจผลของ lane อื่น

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/tests/bench/tasks/23-project-tracker-api/oracle/check.mjs`, `.claude/tests/bench/tests/openspec-native-workloads.test.mjs`, `CHANGELOG.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| tracker-tests-exist-no-count | ไม่มี test | boundary | T001 | test: `.claude/tests/bench/tasks/23-project-tracker-api/oracle/check.mjs`, `.claude/tests/bench/tests/openspec-native-workloads.test.mjs` | — |
|  | test น้อยตัวที่ตรวจจริง | failure | T001 |  |  |
|  | test ที่ไม่ตรวจอะไร | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (2); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | ไม่มีข้อค้นพบ | — | — | claude-opus |
