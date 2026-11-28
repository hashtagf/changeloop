# Change: รีวิวรอบแก้ที่มีข้อทักระดับ minor นอกขอบเขตไฟล์ที่ส่งให้รีวิวบันทึกข้อนั้นเป็นข้อสังเกตแทนการหยุดงาน

- **Change:** `delta-review-minor-outside` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

ข้อทักเล็กของผู้รีวิวที่อยู่นอกส่วนที่ส่งให้รีวิวซ้ำจะถูกบันทึกไว้เป็นข้อสังเกต ไม่ทำให้งานหยุด

## เหตุผล

[Data] ในงานรองรับหลายภาษา ผู้รีวิวให้ผ่านแล้วแต่ทักเรื่องระดับเล็กหนึ่งข้อที่อยู่นอกไฟล์ที่ส่งให้รีวิวรอบแก้ ระบบหยุดการพิสูจน์ทั้งรอบ agent ต้องแก้และรอรีวิวใหม่ ทั้งที่ข้อระดับเล็กไม่ได้กันการผ่านอยู่แล้ว

## ขอบเขต

- **อยู่ในขอบเขต (`review-closure`):** agent ไม่ต้องวนแก้เรื่องเล็กนอกขอบเขตก่อนไปต่อ
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- ขยายขอบเขตรีวิวอัตโนมัติเมื่อข้อทักระดับ blocker หรือ major อยู่นอกขอบเขต (ยังส่งกลับให้ agent พร้อมวิธีแก้เหมือนเดิม)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

A delta review round that reports only `minor` findings outside its dispatched correction scope is recorded with those findings instead of stopping Prove; a `blocker` or `major` finding outside the scope still stops with the route to widen the task's paths.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/authority/authority-reviewer-run.mjs`, `.claude/harness/tests/workflow-policy.test.mjs`, `.claude/harness/EVIDENCE.md`, `CHANGELOG.md`

## Work type

bugfix

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| major นอกขอบเขต | หยุดพร้อมข้อความ outside the dispatched correction scope | No separate step; the outcome is the handling | minor-outside-scope-recorded |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| minor-outside-scope-recorded | minor นอกขอบเขต | success | T001 | test: `.claude/harness/tests/workflow-policy.test.mjs` | — |
|  | minor ไม่มี path | boundary | T001 |  |  |
|  | major นอกขอบเขต | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
