# Change: รอบรีวิวที่ผ่านจะไม่นับเพดานก็ต่อเมื่อมีโค้ดใหม่หลังรอบรีวิวล่าสุด ไม่เช่นนั้นการขอรีวิวซ้ำบนโค้ดเดิมยังถูกปฏิเสธตามเพดาน

- **Change:** `review-closure-free-pass-needs-new-code` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

แก้ CI ชุดเต็มที่ล้มหลัง commit daabc99c: รอบรีวิวที่ผ่านจะไม่นับเพดานเฉพาะเมื่อมีโค้ดใหม่หลังรอบรีวิวล่าสุด

## เหตุผล

[Data] CI run 46008188889 ล้มในชุด feedback review (และชุด evidence binding mutation ที่รันชุดเดียวกัน) เพราะการขอรีวิวรอบสามบนโค้ดเดิมหลัง pass สองรอบไม่ถูกปฏิเสธ ชุดนี้อยู่ใน tier --full จึงไม่ได้รันใน default gate ก่อน push

## ขอบเขต

- **อยู่ในขอบเขต (`review-closure`):** รีวิวต่อได้เองเมื่อมีโค้ดใหม่ และการขอรีวิวซ้ำบนโค้ดเดิมยังถูกปฏิเสธ
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนกติกาของรอบที่ไม่ผ่าน
- เปลี่ยนจำนวนรอบฟรีสูงสุด

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/core/authority-policy.mjs`, `.claude/harness/tests/authority-request-operation.test.mjs`, `CHANGELOG.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| free-pass-needs-new-code | pass แล้วแก้โค้ด | success | T001 | test: `.claude/harness/tests/authority-request-operation.test.mjs` | — |
|  | pass สองรอบ แล้วขอรอบสามบนโค้ดเดิม | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | ไม่มีข้อค้นพบ | — | — | claude-opus |
