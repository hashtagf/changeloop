# Change: แยกหน้าอนุมัติออกจากต้นแบบและแก้บั๊กเขียนไฟล์พรีวิวก่อนเริ่ม Change

- **Change:** `phase-guard-change` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-19

## เหตุผล

Change Loop ใช้พาธต้นแบบเป็นหน้าอนุมัติ ทำให้ต้นแบบจำลองการใช้งานถูกเรียกว่าหน้าอนุมัติและถูกตรวจความสดด้วยข้อมูลคนละชุด อีกทั้งโหมด block ปฏิเสธการเขียนต้นแบบก่อนเริ่ม Change ทั้งที่เป็นไฟล์ประกอบ ให้ `prototype.html` ใช้ลองการทำงาน และ `approval.html` ใช้อ่านขอบเขต ความเสี่ยง และหลักฐานก่อนตัดสินใจ หากไม่มีหน้าอนุมัติยังใช้สรุปข้อความได้ ต้นแบบเดิมไม่ถูกย้ายหรือแก้ และการตัดสินใจยังอยู่ในช่องทางเดิม

## ขอบเขต

- **In scope (`approval-package`):** อนุญาต Write, Edit หรือ MultiEdit เฉพาะพาธมาตรฐานของหน้าอนุมัติ `approval.html` และต้นแบบ `prototype.html` ใน `.foundation/previews/<change-id>/` สำหรับข้อยกเว้นใหม่นี้; ใช้หน้าอนุมัติ `.foundation/previews/<change>/approval.html` ที่เอเจนต์หรือผู้ใช้เขียน หรือใช้สรุปข้อความเมื่อไม่มีหน้า โดยไม่ใช้ต้นแบบแทน; บันทึก digest และรายงานความสดของหน้าอนุมัติจาก `approval.html` เท่านั้น โดยคำเตือนไม่กั้น Change, Build, Prove หรือ Land; บอกรายการสิ่งที่ต้นแบบของ change ควรแสดงจาก work type และฟิลด์ใน draft เท่านั้น ครอบคลุมทุก work type และไม่กั้น Change, Build, Prove หรือ Land
- **Out of scope:** edits outside `.claude/hooks/phase-mutation-guard.mjs`, `.claude/tests/hooks/run-phase-mutation-guard-tests.sh`, `.claude/harness/runtime/workflow/change/approval-package.mjs`, `.claude/harness/runtime/workflow/prototype/prototype-sync.mjs`, `.claude/harness/runtime/workflow/prototype/prototype-checklist.mjs`, `.claude/harness/runtime/workflow/draft/draft-packet-render.mjs`, … +5 more

## Work type

bugfix

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ปฏิเสธพาธนอกขอบเขต | guard ไม่ให้ข้อยกเว้นและยังปฏิเสธ | No separate step; the outcome is the handling | prephase-approval-preview |

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| prephase-approval-preview | เขียนหน้าอนุมัติและต้นแบบ | success | T001 | test: `.claude/tests/hooks/run-phase-mutation-guard-tests.sh` | — |
|  | ปฏิเสธพาธนอกขอบเขต | failure | T001 |  |  |
| approval-page-authored-by-skill | ยังไม่มีหน้า | boundary | T002 | test: `.claude/harness/tests/approval-package.test.mjs`, `.claude/harness/tests/prototype-checklist.test.mjs` | — |
|  | มีหน้าแล้ว | unclassified | T002 |  |  |
|  | ไม่เขียนไฟล์หน้า | unclassified | T002 |  |  |
|  | ตัวอย่างใน draft ยังถูกตรวจ | unclassified | T002 |  |  |
|  | ข้อมูลหน้าอนุมัติแยกจากต้นแบบ | unclassified | T002 |  |  |
| prototype-sync | แก้ไฟล์แล้วเตือน | unclassified | T002 | test: `.claude/harness/tests/approval-package.test.mjs`, `.claude/harness/tests/prototype-checklist.test.mjs` | — |
|  | revise แล้วหายเตือน | unclassified | T002 |  |  |
|  | ข้อมูลของ harness ในหน้าล้าสมัย | unclassified | T002 |  |  |
|  | แก้ไฟล์แต่ไม่แก้ change | unclassified | T002 |  |  |
|  | ไม่มีไฟล์ | unclassified | T002 |  |  |
|  | คำเตือนไม่ใช่หลักฐาน | unclassified | T002 |  |  |
|  | แก้เฉพาะต้นแบบ | unclassified | T002 |  |  |
| prototype-checklist | งาน API | failure | T002 | test: `.claude/harness/tests/approval-package.test.mjs`, `.claude/harness/tests/prototype-checklist.test.mjs` | — |
|  | งานข้อมูล | unclassified | T002 |  |  |
|  | งานหน้าจอ | unclassified | T002 |  |  |
|  | ครบทุก work type | unclassified | T002 |  |  |
|  | หลายชนิดรวมกัน | unclassified | T002 |  |  |
|  | ฟิลด์ไม่ระบุ | unclassified | T002 |  |  |
|  | งานที่ไม่ต้องมีภาพมาก | unclassified | T002 |  |  |
|  | ชนิดใหม่ที่ยังไม่มีรายการ | unclassified | T002 |  |  |
|  | ไม่กั้นการเริ่ม | unclassified | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (23).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
