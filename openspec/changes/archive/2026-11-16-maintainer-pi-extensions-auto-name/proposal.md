# Change: แท็บ Pi แสดงชื่องานที่ session กำลังทำ

- **Change:** `maintainer-pi-extensions-auto-name` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ทุกแท็บของ Pi ขึ้นว่า "Pi - changeloop" เหมือนกันเพราะ session ไม่มีชื่อ ผู้ใช้จึงแยกไม่ออกว่าแท็บไหนทำงานอะไร Orca titlebar แสดงชื่อ session ใน title อยู่แล้ว จึงต้องตั้งชื่อ session ให้อัตโนมัติจากงานที่ทำ

## ขอบเขต

- **In scope (`maintainer-pi-extensions`):** เพิ่ม extension session-title ใน pi-extensions; ตั้งชื่อ session จากข้อความแรกของผู้ใช้เมื่อยังไม่มีชื่อ; เพิ่ม tool session_title ให้ agent อัปเดตชื่อเมื่องานหลักเปลี่ยน; ลงทะเบียนใน package.json, install.sh, test.sh, CHANGELOG และ docs/tools.md
- **Out of scope:** edits outside `pi-extensions/session-title/**`, `pi-extensions/package.json`, `pi-extensions/install.sh`, `pi-extensions/test.sh`, `pi-extensions/scripts/**`, `pi-extensions/CHANGELOG.md`, … +2 more; the authored Non-goals below

## Non-goals

- ไม่แก้ extension ของ Orca (orca-titlebar-spinner.ts เป็นไฟล์ที่ Orca จัดการ)
- ไม่เรียก model เพิ่มเพื่อสรุปชื่อ
- ไม่เปลี่ยนชื่อที่ผู้ใช้ตั้งเองด้วย /name

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| auto-name | ตั้งชื่อจากคำสั่งแรก | success | T001 | test | — |
|  | ข้อความยาวถูกตัด | boundary | T001 |  |  |
|  | ไม่ทับชื่อเดิม | boundary | T001 |  |  |
|  | ข้ามคำสั่งและข้อความว่าง | failure | T001 |  |  |
| agent-title-tool | agent อัปเดตชื่อ | success | T001 | test | — |
|  | title ว่างหรือยาวเกิน | boundary | T001 |  |  |
|  | จำว่าชื่อไหน extension ตั้งหลัง reload | boundary | T001 |  |  |
|  | ชื่อที่ผู้ใช้ตั้งไม่ถูกทับ | failure | T001 |  |  |
| title-package-wiring | ตรวจแพ็กเกจผ่าน | success | T002 | test | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (9).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (2); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for auto-name, agent-title-tool, title-package-wiring.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | ไม่มีข้อค้นพบ | — | — | claude-opus |
