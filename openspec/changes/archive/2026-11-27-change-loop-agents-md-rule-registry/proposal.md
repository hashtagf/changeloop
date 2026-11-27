# Change: หลักการพัฒนา Change Loop สามข้อของเจ้าของโปรเจกต์ถูกบันทึกใน AGENTS.md และ rule registry ให้ทุกงานต่อจากนี้ใช้เป็นเกณฑ์

- **Change:** `change-loop-agents-md-rule-registry` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

บันทึกหลักการพัฒนา Change Loop สามข้อของเจ้าของโปรเจกต์ให้เป็นเกณฑ์ของทุกงานต่อจากนี้

## เหตุผล

[Data] เจ้าของโปรเจกต์กำหนดว่า Change Loop ต้องไม่ block agent และผู้ใช้ ต้องทำให้ workflow ของทุกงานเป็นไปตามมาตรฐานเสมอ และต้องไม่เป็นตัวถ่วงการทำงาน และให้หลักการนี้เป็นแนวคิดในการพัฒนา Change Loop ต่อไป

[Data] log ของ consumer และของ Change Loop เองแสดงว่าเวลาที่เสียมากที่สุดคือการรอเทสต์ที่ค้างและการหยุดรอผู้ใช้โดยไม่จำเป็น

## ขอบเขต

- **อยู่ในขอบเขต (`repository-guides`):** agent ที่พัฒนา Change Loop ใช้หลักการนี้ตัดสินงานทุกงาน
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนพฤติกรรมของ runtime
- แก้ไฟล์ที่ติดตั้งให้ consumer

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated
- **Specs:** none; docs-only work modifies no living spec

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `AGENTS.md`, `quality/rule-enforcement.json`

## Work type

docs

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| design-principles-recorded | อ่านหลักการ | success | T001 | test | — |
|  | registry ครบ | success | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (2).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-27): The task verify ran the scorecard script, which prints no test count, so the test provider was inconclusive; verify with the scorecard's own node:test suite, which checks the registry against the guides.
