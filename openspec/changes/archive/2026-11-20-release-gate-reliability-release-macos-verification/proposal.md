# Change: รักษาชุดตรวจรีลีสบน macOS ให้ผ่านได้โดยไม่ลดการตรวจ

- **Change:** `release-gate-reliability-release-macos-verification` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-20

## เหตุผล

การซ้อม v3.7.6 หยุดก่อนเผยแพร่เมื่อเทสต์ readiness ล้มภายใต้ coverage และ context budgets หมดเวลาบน macOS runner ทั้งสองชุดผ่านเมื่อรันแยกในเครื่อง จึงต้องแก้เงื่อนไขเวลาของ fixture และจำกัดงานพร้อมกันโดยคงชุดตรวจและเวลาเดิม แล้วให้การซ้อมรีลีสยืนยันผลบน runner จริง

## ขอบเขต

- **In scope (`release-gate-reliability`):** คงชุดตรวจทั้งหมดและไม่ผูกผลทดสอบ readiness กับอายุโปรเซสจำลองแบบตายตัว
- **Out of scope:** edits outside `.claude/harness/tests/process-runtime.test.mjs`, `.github/workflows/release.yml`; the authored Non-goals below

## Non-goals

- ไม่ข้าม suite หรือเพิ่ม timeout
- ไม่เปลี่ยน runtime ที่ผู้ใช้ติดตั้ง
- ไม่รัน paid checkpoint

## Work type

bugfix

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| release-macos-verification | รอจนตรวจ readiness สำเร็จ | unclassified | T001 | test: `.claude/harness/tests/process-runtime.test.mjs` | — |
|  | จำกัดงานพร้อมกันบน runner รีลีส | unclassified | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
