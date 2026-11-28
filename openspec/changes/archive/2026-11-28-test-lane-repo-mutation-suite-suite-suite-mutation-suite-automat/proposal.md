# Change: test lane ของ repo นี้ไม่รัน mutation suite และไม่คำนวณ suite ที่ถูกเลื่อนขึ้นซ้ำในทุก suite ส่วน mutation suite ย้ายไปเป็น automated-mutation lane ที่มี baseline

- **Change:** `test-lane-repo-mutation-suite-suite-suite-mutation-suite-automat` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

ชุดเทสต์ที่ agent รันทุกรอบเร็วขึ้นโดยแยก mutation suite ออกไปเป็นชั้นตรวจของตัวเอง ซึ่งยังรันในทุก Prove และนับเป็นการตรวจ mutation ของ readiness

## เหตุผล

[Data] test lane ของ repo ใช้ 117–125 วินาทีในสิบรอบล่าสุด เกินเกณฑ์ 120 วินาทีของ readiness

[Data] mutation suite ในชุดเริ่มต้นใช้เวลารวมราว 152 วินาที CPU ของงานรวม 1,474 วินาที และทุก suite เรียกตัวเลือก suite ที่ถูกเลื่อนขึ้นซ้ำ 287 ครั้ง

[Data] readiness ข้อ Mutation testing ratchets ยังไม่ผ่านเพราะไม่มี automated-mutation lane แม้ repo มี mutation suite อยู่แล้ว

## ขอบเขต

- **อยู่ในขอบเขต (`repository-quality`):** test lane ที่ agent รันทุกรอบสั้นลงโดยไม่ตัด suite อื่น; mutation lane วัดผลเป็นรายการ mutant ที่ ratchet ได้; readiness ข้อ Mutation testing ratchets ผ่าน
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยน run-all.sh แบบไม่ใส่ flag, --full, --release หรือ --affected (CI และ gate ก่อน commit ยังรัน mutation suite เหมือนเดิม)
- เพิ่ม crap หรือ coverage lane (วัดแล้วเพิ่มเวลา Prove ราว 3 นาที ผู้ใช้เลือกไม่เพิ่ม)
- ย้าย mutation suite ในชั้น SLOW (evidence binding, target drift) เข้า lane

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/tests/run-all.sh`, `.claude/tests/harness/run-run-all-control-tests.sh`, `.claude/tests/README.md`, `scripts/quality/repository-mutation.mjs`, `scripts/quality/test/repository-mutation.test.mjs`, `quality/foundation-quality.json`, … +3 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| run-all-skip-mutation | ตัดเฉพาะ mutation | success | T001 | test: `.claude/tests/run-all.sh`, `.claude/tests/harness/run-run-all-control-tests.sh` | — |
|  | child ไม่คำนวณซ้ำ | boundary | T001 |  |  |
|  | รายชื่อผิด | failure | T001 |  |  |
| repository-mutation-report | mutant ถูกฆ่า | success | T002 | test: `scripts/quality/test/repository-mutation.test.mjs` | — |
|  | ไม่ได้ใส่ fault | boundary | T002 |  |  |
|  | ฆ่าผิดตัว | failure | T002 |  |  |
|  | suite ไม่มีรายงาน | failure | T002 |  |  |
| repository-quality-lanes | lane ผ่าน | success | T003 | test | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (8).
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-28): Agreement expanded during Build
- Revision 2 (2026-11-28): Agreement expanded during Build

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1: JSON.parse of a suite report is unguarded. A truncated or invalid report throws an uncaught exception with no suite name, which is weaker than the 'suite ไม่มีรายงาน' contract. A report with an empty mutants array is accepted silently. (root/scripts/quality/repository-mutation.mjs:67) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f2: The missing-report test checks the return value of repositoryMutation(). It does not check main()'s exit code 1 or the stderr text naming the suite. (root/scripts/quality/test/repository-mutation.test.mjs:48) | minor | แก้แล้วในรอบ 2 | claude-opus |
