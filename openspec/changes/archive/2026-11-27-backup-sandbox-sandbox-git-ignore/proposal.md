# Change: การ backup sandbox ก่อนลบไม่ล้มเมื่อ sandbox มีโฟลเดอร์ผลเทสต์ที่ git ignore อยู่

- **Change:** `backup-sandbox-sandbox-git-ignore` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

Land จะลบ sandbox ได้ตามปกติแม้เทสต์สร้างโฟลเดอร์ผลลัพธ์ที่ git ignore ไว้

## เหตุผล

[Data] Land ของ change แยก "ไม่มีเทสต์" กับ "หาไม่เจอ" ล้มตอน backup ด้วยข้อความ git diff failed: The following paths are ignored ... test-results และเก็บ sandbox ค้างไว้ ทดลองซ้ำแล้วพบว่า git add -A ตอบ exit 1 เมื่อ pathspec มี :(exclude)test-results/** และโฟลเดอร์นั้นมีอยู่และถูก ignore

## ขอบเขต

- **อยู่ในขอบเขต (`land`):** Land ลบ sandbox ได้หลังเทสต์สร้างโฟลเดอร์ผลลัพธ์
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยน pathspec ของ apply, replay หรือ diff identity
- ลบ sandbox ที่ค้างอยู่แล้ว

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/sandbox/sandbox-preservation.mjs`, `.claude/harness/tests/sandbox-data-loss.test.mjs`, `CHANGELOG.md`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** Land ของ discovery-repo-makefile-ci-readme-onboard-repo: sandbox มี test-results/ui-rendered ที่ .gitignore ครอบ backup ล้มด้วย git diff failed: The following paths are ignored ... test-results และ sandbox ถูกเก็บค้าง
- **Root cause:** writeSandboxBackup รัน git add -A กับ pathspec ที่มี :(exclude)test-results/** ซึ่ง git 2.54 ตอบ exit 1 ว่า path ถูก ignore เมื่อ exclude ชี้ไปยังโฟลเดอร์ที่มีอยู่และถูก ignore
- **Regression proof:** เทสต์ใน sandbox-data-loss.test.mjs ที่สร้าง sandbox มี test-results/ ที่ถูก ignore และไฟล์ที่ยังไม่ Land แล้วตรวจว่า backup เขียน changes.patch ได้

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| มี test-results ที่ถูก ignore | backup เขียน changes.patch ที่มี src/x.js และไม่มี test-results | No separate step; the outcome is the handling | backup-ignored-exclude |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| backup-ignored-exclude | exclude ที่ไม่ถูก ignore | boundary | T001 | test: `.claude/harness/tests/sandbox-data-loss.test.mjs` | — |
|  | มี test-results ที่ถูก ignore | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
