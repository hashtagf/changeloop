# Change: รักษา prototype.sync ใน package เมื่ออัปเกรดเป็น v3.7.6

- **Change:** `prototype-sync-package-v3-7-6` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-20

## เหตุผล

เครื่องมือที่อ่าน JSON จาก `package` ยังอาจพึ่ง `prototype.sync` ซึ่งหายไปเมื่อแยกหน้าอนุมัติจากต้นแบบ จึงต้องคืนสถานะต้นแบบในฟิลด์เดิมก่อนเผยแพร่ v3.7.6 โดยไม่ใช้ต้นแบบแทนหน้าอนุมัติ

## ขอบเขต

- **In scope (`approval-package`):** คง prototype.sync ให้เครื่องมือเดิมอ่านได้โดยไม่ปะปนกับสถานะ approval.html
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/change/approval-package.mjs`, `.claude/harness/runtime/workflow/prototype/prototype-sync.mjs`, `.claude/harness/tests/approval-package.test.mjs`, `.claude/harness/lifecycle/change.md`, `CHANGELOG.md`, `docs/reports/user-scenario-release-status.md`; the authored Non-goals below

## Non-goals

- ไม่ใช้ต้นแบบแทนหน้าอนุมัติ
- ไม่เปลี่ยนเกณฑ์หลักฐานหรือสิทธิ์เขียนไฟล์

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| legacy-prototype-sync | เครื่องมือเดิมอ่านสถานะต้นแบบ | success | T001 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | ต้นแบบเปลี่ยนหลังบันทึก | success | T001 |  |  |
|  | ไม่มีต้นแบบ | boundary | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for legacy-prototype-sync.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 4 | F1: The paid-checkpoint exception does not trace to the prototype.sync compatibility agreement and is an unrelated release-policy edit in this change. (root/CHANGELOG.md:12) | minor | ยังเปิดอยู่ | codex-sol |
| 4 | F2: The v3.7.6 paid-checkpoint exception is unrelated to the scoped prototype.sync requirements and should be handled separately. (root/docs/reports/user-scenario-release-status.md:21) | minor | ยังเปิดอยู่ | codex-sol |
