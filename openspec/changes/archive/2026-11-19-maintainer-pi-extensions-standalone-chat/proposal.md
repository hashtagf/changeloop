# Change: แก้แชต 9Router ที่ติดตั้งใน Pi แล้วส่งข้อความไม่ได้

- **Change:** `maintainer-pi-extensions-standalone-chat` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-19

## เหตุผล

ส่วนขยายที่ติดตั้งใน Pi เลือกโมเดลได้ แต่ส่งแชตแล้วโหลดโมดูลไม่พบ เพราะตัวโหลด Pi ไม่รองรับพาธย่อยที่เดิมใช้อยู่ เทสต์ใน repo ผ่านเพราะมี node_modules มาช่วยบังปัญหา

## ขอบเขต

- **In scope (`maintainer-pi-extensions`):** ส่งข้อความได้เมื่อติดตั้งนอก repo โดยไม่ต้องติดตั้งแพ็กเกจเพิ่ม
- **Out of scope:** edits outside `pi-extensions/nine-router/index.ts`, `pi-extensions/nine-router/test/chat.test.cjs`

## Work type

bugfix

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| standalone-chat | แชตผ่านส่วนขยายที่ติดตั้ง | unclassified | T001 | test: `pi-extensions/nine-router/test/chat.test.cjs` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (1).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
