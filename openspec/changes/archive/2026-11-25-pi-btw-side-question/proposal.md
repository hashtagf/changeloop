# Change: เพิ่ม extension /btw ให้ Pi ถามคำถามข้างเคียงจากบริบทบทสนทนาโดยไม่รบกวนงานหลัก เหมือน /btw ของ Claude Code

- **Change:** `pi-btw-side-question` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-25

## เหตุผล

ผู้ใช้ต้องการถามคำถามข้างเคียงระหว่างที่เอเจนต์ใน Pi ทำงาน เหมือน /btw ของ Claude Code โดยไม่ให้คำถามนั้นเข้าไปในบริบทงานหลักหรือขัดจังหวะงาน Pi ทำคำสั่ง extension ทันทีแม้ระหว่าง streaming จึงทำได้เป็น extension ใน pi-extensions

## ขอบเขต

- คำสั่ง /btw ตอบจากบริบทบทสนทนาด้วยโมเดลปัจจุบัน ไม่มีเครื่องมือ
- กล่องคำตอบที่เลื่อนอ่านได้และกด Esc ปิดหรือยกเลิก
- ไม่บันทึกลง session

ไม่รวม: บันทึกประวัติ /btw, การใช้เครื่องมือ, ส่วน product ของ Change Loop

- **In scope (`maintainer-pi-extensions`):** ผู้ใช้ได้คำตอบที่รู้บริบทงานโดยโมเดลทำได้แค่ตอบ; เอเจนต์หลักไม่เห็นคำถามข้างเคียงและบริบทงานหลักไม่เพิ่ม
- **Out of scope:** edits outside `pi-extensions/btw/index.ts`, `pi-extensions/btw/context.ts`, `pi-extensions/btw/README.md`, `pi-extensions/btw/btw.test.cjs`, `pi-extensions/package.json`, `pi-extensions/install.sh`, … +4 more; the authored Non-goals below

## Non-goals

- ไม่บันทึกคำถามหรือคำตอบของ /btw ลงไฟล์ session
- ไม่ให้ /btw ใช้เครื่องมือ แก้ไฟล์ หรือรันคำสั่ง
- ไม่แก้ส่วน product ของ Change Loop หรือ installer ของ product

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| btw-command | ถามตอนเอเจนต์ว่าง | success | T001, T002 | test: `pi-extensions/btw/btw.test.cjs` | — |
|  | บริบทยาวเกิน | boundary | T001, T002 |  |  |
|  | ไม่ใส่คำถาม | failure | T001, T002 |  |  |
|  | ไม่มีโมเดล | failure | T001, T002 |  |  |
| btw-isolation | ไม่เขียนลง session | success | T001 | test: `pi-extensions/btw/btw.test.cjs` | — |
|  | ยกเลิกระหว่างรอ | boundary | T001 |  |  |
|  | โมเดลล้มเหลว | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (7).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (3); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for btw-command, btw-isolation.

## Appendix: Amendment history

- Revision 1 (2026-11-25): Registering a new extension also requires the typecheck include list (tsconfig.json) and the pack-check extension list (scripts/pack-check.mjs); their tests fail otherwise
- Revision 2 (2026-11-25): pack-check.test.cjs fixtures enumerate every extension; adding btw to the pack-check list requires adding it to those fixtures

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | ไม่มีข้อค้นพบ | — | — | claude-opus |
