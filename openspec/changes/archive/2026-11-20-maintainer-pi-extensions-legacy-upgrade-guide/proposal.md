# Change: เพิ่มคู่มือย้ายจาก claude-foundation บนเว็บไซต์

- **Change:** `maintainer-pi-extensions-legacy-upgrade-guide` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-19

## เหตุผล

ประกาศในรีโปเดิมบอกวิธีติดตั้ง CLI ใหม่ แต่ผู้ใช้ยังต้องอัปเกรดโปรเจกต์เดิมแยกต่างหาก จึงควรรวมขั้นตอนย้ายไว้ในหน้าติดตั้งที่มีอยู่ทั้งภาษาไทยและอังกฤษ โดยไม่เปลี่ยนตัวติดตั้งหรือเผยแพร่ขึ้นเว็บจริงในขั้นนี้

## ขอบเขต

- **In scope (`maintainer-pi-extensions`):** บอกวิธีอัปเกรดจาก claude-foundation ในโปรเจกต์เดิม โดยไม่ให้ผู้ใช้เข้าใจว่าติดตั้ง CLI ใหม่แล้วโปรเจกต์จะอัปเกรดเอง
- **Out of scope:** edits outside `website/docs/src/content/docs/install.md`, `website/docs/src/content/docs/th/install.md`, `CHANGELOG.md`

## Work type

docs

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated
- **Specs:** none; docs-only work modifies no living spec

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| legacy-upgrade-guide | อัปเกรดจาก Homebrew tap เดิม | unclassified | T001 | static-analysis | — |
|  | อัปเกรดจากซอร์ส | unclassified | T001 |  |  |
|  | ตรวจผลหลังอัปเกรด | unclassified | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Amendment discovery coverage

Reason: ผู้ใช้เลือกให้ cloop เป็นชื่อสูตร Homebrew จริง และเก็บชื่อเก่าเพื่อให้อัปเกรดต่อได้ ไม่อนุญาตให้เผยแพร่ในขั้นนี้

| Dimension | Status | Requirements | Sources | Rationale |
|---|---|---|---|---|
| compatibility | covered | canonical-cloop-homebrew-formula | none | none |
| non-goals | covered | canonical-cloop-homebrew-formula | none | none |

## Appendix: Amendment history

- Revision 1 (2026-11-19): ผู้ใช้เลือกให้ cloop เป็นชื่อสูตร Homebrew จริง และเก็บชื่อเก่าเพื่อให้อัปเกรดต่อได้ ไม่อนุญาตให้เผยแพร่ในขั้นนี้
