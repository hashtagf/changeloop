# Change: spec-drift เลิกรายงานผิดจาก archive, '...' และ .foundation

- **Change:** `spec-drift-archive-foundation` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

รายงาน spec-drift ไม่นับ path ที่ไม่ใช่ไฟล์จริงของโปรเจกต์เป็นไฟล์หาย ไฟล์ที่หายจริงจึงเห็นชัดขึ้น

## เหตุผล

[Data] จาก 38 ข้อที่รายงานว่าไฟล์หายบน repo นี้ ราว 14 ข้อเป็นการรายงานผิดของเครื่องมือ

## ขอบเขต

- **อยู่ในขอบเขต (`spec-drift`):** false positive สามแบบหายไป และ path ที่ออกนอกโปรเจกต์ถูกรายงานแยก
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- แก้สเปกที่ชี้ไฟล์ที่ถูกลบจริง

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/change/spec-drift.mjs`, `.claude/harness/tests/spec-drift.test.mjs`, `CHANGELOG.md`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** spec-drift บน repo นี้รายงาน missing-file 38 ข้อ ในนั้นราว 14 ข้อชี้ change ที่ archive แล้ว, ข้อความ '...' หรือ .foundation/adapter-manifests
- **Root cause:** linkedFiles อ่าน path ตามตัวอักษรใน tasks.md โดยไม่แปลงชื่อ change ที่ย้ายเข้า archive, ไม่กรอง token ที่ไม่ใช่ path และนับ state ของ harness ใต้ .foundation
- **Regression proof:** test ของ spec-drift ครอบคลุมทั้งสามกรณีและ path ที่ออกนอกโปรเจกต์

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| path ออกนอกโปรเจกต์ | path นั้นอยู่ใน outside ไม่ถูกตรวจว่ามีอยู่ และ requirement เป็น missing-file | No separate step; the outcome is the handling | drift-path-accuracy |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| drift-path-accuracy | change ที่ archive แล้ว | success | T001 | test: `.claude/harness/tests/spec-drift.test.mjs` | — |
|  | ข้อความ ... ไม่ใช่ path | boundary | T001 |  |  |
|  | state ใต้ .foundation | boundary | T001 |  |  |
|  | archive วันเดียวกัน | boundary | T001 |  |  |
|  | path ออกนอกโปรเจกต์ | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (5).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
