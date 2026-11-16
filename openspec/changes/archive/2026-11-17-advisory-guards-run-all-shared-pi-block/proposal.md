# Change: ลงทะเบียนเทสต์เอกสาร advisory guards ใน run-all และให้เทสต์ shared Pi รันในโหมด block

- **Change:** `advisory-guards-run-all-shared-pi-block` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

default gate ล้มหลัง Land งาน advisory guards: เทสต์เอกสารใหม่ยังไม่ได้ลงทะเบียนใน run-all.sh และเทสต์ shared Pi ยังคาดว่า guard ปฏิเสธในโหมดเริ่มต้น ต้องแก้ก่อน commit และออก release

## ขอบเขต

- **In scope (`advisory-guards`):** รัน advisory-guards-docs.test.mjs และเทสต์ shared Pi ที่ตรวจการปฏิเสธ SHALL รันในโหมด block
- **Out of scope:** edits outside `.claude/tests/run-all.sh`, `.claude/harness/tests/pi-shared.test.mjs`, `.claude/tests/harness/test-registration.test.mjs`

## Work type

test

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| advisory-tests-gated | gate ผ่าน | success | T001 | test: `.claude/tests/run-all.sh`, `.claude/harness/tests/pi-shared.test.mjs`, `.claude/tests/harness/test-registration.test.mjs` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (1).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-16): ผู้ใช้อนุญาตออก 3.7.5 โดยข้าม paid smoke เป็นข้อยกเว้น ต้องบันทึกลงรายงานสถานะ release
- Revision 2 (2026-11-16): Correct the verify command of task 'release-status-note'
