# Change: ให้ /btw ตอบได้กับทุกโมเดล รวมโมเดลเสมือน (auto) และ provider ที่มีแค่ streamSimple

- **Change:** `btw-stream-simple` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-25

## เหตุผล

การทดสอบ /btw ใน Pi จริงพบว่าคำตอบค้างที่ Thinking… เมื่อ provider มีแค่ streamSimple เพราะ btw เรียก modelRegistry.complete ซึ่งใช้ stream เฉพาะ API และไม่ route โมเดลเสมือนอย่าง auto ผู้ใช้จึงอาจใช้ /btw ไม่ได้กับบางโมเดล เปลี่ยนไปใช้ streamSimple ซึ่งเป็นเส้นทางกลางของทุก provider

## ขอบเขต

- btw เรียก streamSimple().result() พร้อม signal ของตัวเอง

- **In scope (`maintainer-pi-extensions`):** /btw ได้คำตอบจาก provider ที่มีแค่ streamSimple และจากโมเดลเสมือน
- **Out of scope:** edits outside `pi-extensions/btw/index.ts`, `pi-extensions/btw/btw.test.cjs`, `pi-extensions/btw/README.md`; the authored Non-goals below

## Non-goals

- ไม่เปลี่ยนรูปแบบคำถาม บริบท หรือกล่องคำตอบ

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** smoke ใน Pi จริงกับ provider ที่ลงทะเบียนเฉพาะ streamSimple: /btw ค้างที่ Thinking… ไม่จบ
- **Root cause:** btw เรียก modelRegistry.complete ซึ่งใช้ provider.stream เฉพาะ API และไม่ route โมเดลเสมือน
- **Regression proof:** btw.test.cjs: registry ที่มีแค่ streamSimple ต้องได้คำตอบและ complete ไม่ถูกเรียก

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| btw-provider-neutral-call | provider มีแค่ streamSimple | success | T001 | test: `pi-extensions/btw/btw.test.cjs` | — |
|  | ยกเลิกยังใช้ signal ของตัวเอง | boundary | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-25): Correction: the reported hang was a defect of the smoke fixture, not of /btw; modelRegistry.complete works for a streamSimple-only provider. The real reason is Pi's virtual-models contract: requests made outside the agent loop are routed only through modelRegistry.streamSimple (docs/virtual-models.md, reason 'direct'); complete has no routing branch.
