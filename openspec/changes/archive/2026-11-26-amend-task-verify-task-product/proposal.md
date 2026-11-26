# Change: amend ที่แก้แค่ task ตรวจ verify ของ task ที่แก้โค้ด product

- **Change:** `amend-task-verify-task-product` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

การแก้ task ระหว่าง Build จะไม่ปล่อยให้ task ที่แก้โค้ดถูกติ๊กว่าเสร็จด้วยคำสั่งตรวจที่ไม่ได้รัน test อีก

## เหตุผล

[Data] AI review ของ spec-drift พบว่า change amend ที่มีแค่ updateTasks ข้ามการตรวจ verify ทั้งที่สเปก change-validation กำหนดให้ตรวจ task ที่ amendment เพิ่มหรือแก้ verify

## ขอบเขต

- **อยู่ในขอบเขต (`change-validation`):** verify ที่ไม่รัน test หรืออ้างไฟล์ test ที่ไม่มี ถูกปฏิเสธก่อน amend และไม่มีอะไรเปลี่ยน
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนเกณฑ์ว่า verify แบบไหนนับว่ารัน test
- คำสั่ง change amend --task --verify แบบตรง

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/change/change-amendment.mjs`, `.claude/harness/tests/change-revise.test.mjs`, `CHANGELOG.md`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** change amend ด้วย amendment ที่มีแค่ updateTasks ตั้ง verify ของ task ที่แก้ src/** เป็น 'true' ถูกยอมรับ
- **Root cause:** amendChangeUnlocked ข้ามการ inspect สำหรับ task-contract-only amendment และตรวจแค่ repository binding จึงไม่เรียก amendmentVerifyShapeIssues และ amendmentVerifyPathIssues
- **Regression proof:** test ใน change-revise.test.mjs รัน amendChange กับ updateTasks และ addTasks ที่ verify ไม่รัน test แล้วต้องถูกปฏิเสธ

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| updateTasks ตั้ง verify เป็น no-op | amend ล้มเหลวพร้อมข้อความว่า verify runs no test และ tasks.md ไม่เปลี่ยน | ตั้ง verify ที่รัน test | task-only-amend-verify |
| addTasks verify lint อย่างเดียว | amend ล้มเหลวและ contract revision ไม่เปลี่ยน | No separate step; the outcome is the handling | task-only-amend-verify |
| verify อ้างไฟล์ test ที่ไม่มี | amend ล้มเหลวพร้อมชื่อไฟล์ | No separate step; the outcome is the handling | task-only-amend-verify |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| task-only-amend-verify | verify ที่รัน test ผ่าน | success | T001 | test: `.claude/harness/tests/change-revise.test.mjs` | — |
|  | แก้ covers อย่างเดียวไม่ถูกตรวจ verify | boundary | T001 |  |  |
|  | updateTasks ตั้ง verify เป็น no-op | failure | T001 |  |  |
|  | addTasks verify lint อย่างเดียว | failure | T001 |  |  |
|  | verify อ้างไฟล์ test ที่ไม่มี | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (5).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
