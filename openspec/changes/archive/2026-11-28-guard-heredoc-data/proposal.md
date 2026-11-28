# Change: phase guard ไม่อ่านเนื้อหา heredoc ที่ส่งให้คำสั่งที่ไม่ใช่ shell หรือ interpreter เป็น path แม้คำสั่งส่วนอื่นจะมี sh -c หรือ node -e

- **Change:** `guard-heredoc-data` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

ตัวเฝ้าคำสั่งไม่เตือนผิดเมื่อ agent เขียนไฟล์ด้วย heredoc ภายในพื้นที่ทำงานของตัวเอง

## เหตุผล

[Data] ระหว่างเพิ่มเทสต์ในงานแก้ขั้นพิสูจน์ ตัวเฝ้าคำสั่งเตือนว่ามี path ออกนอกพื้นที่ทำงาน เพราะเนื้อหาของไฟล์ที่เขียนด้วย cat มีข้อความ ../../.. และคำสั่งเดียวกันมีส่วนที่รัน sh -c อยู่ด้วย ทั้งที่ไฟล์ถูกเขียนในพื้นที่ทำงานถูกต้อง คำเตือนผิดแบบนี้ทำให้ agent เสียรอบและเปลือง token

## ขอบเขต

- **อยู่ในขอบเขต (`advisory-guards`):** agent ไม่ได้คำเตือนผิดเมื่อเขียนไฟล์ด้วย heredoc ใน workspace
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนการตรวจของคำสั่งที่อยู่ใน sh -c เอง
- เปลี่ยนการตรวจ heredoc ที่ delimiter ไม่มี quote (shell ขยายตัวแปรในนั้น)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

The shell guard no longer reports a path written inside a quoted heredoc body fed to `cat` or `tee` as a mutation target just because another part of the same command runs `sh -c` or an interpreter; a heredoc fed to a shell or interpreter is still read as code.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/core/shell-mutation-policy.mjs`, `.claude/harness/tests/shell-heredoc-data.test.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/README.md`, `CHANGELOG.md`

## Work type

bugfix

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| node heredoc | ได้ violation ว่ามี path ออกนอก workspace | No separate step; the outcome is the handling | heredoc-data-stays-data |
| redirect ออกนอก | ได้ violation | No separate step; the outcome is the handling | heredoc-data-stays-data |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| heredoc-data-stays-data | cat heredoc กับ sh -c | success | T001 | test: `.claude/harness/tests/shell-heredoc-data.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | node heredoc | failure | T001 |  |  |
|  | redirect ออกนอก | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
