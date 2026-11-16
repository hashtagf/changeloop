# Change: pi-extensions เป็น Pi package มาตรฐานที่พร้อม publish npm

- **Change:** `pi-extensions-pi-package-publish-npm` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

pi-extensions ทำงานได้แต่ยังไม่มีโครงสร้างแพ็กเกจแบบที่แพ็กเกจใน pi.dev/packages ใช้ ทั้ง package.json, version, CHANGELOG, typecheck, config และเอกสารอ้างอิง จึงติดตั้งผ่าน pi install หรือ publish ไม่ได้และเอกสารคลาดจากโค้ดได้ง่าย งานนี้ทำให้แพ็กเกจพร้อม publish โดยยังติดตั้งแบบ copy เหมือนเดิม

## ขอบเขต

- **In scope (`maintainer-pi-extensions`):** เพิ่ม package.json พร้อม pi manifest, peerDependencies, version และ files; เพิ่ม LICENSE, CHANGELOG.md, tsconfig.json และสคริปต์ตรวจ package; สร้าง docs/tools.md จาก tool/command/shortcut ที่ลงทะเบียนจริง; ask-user อ่านค่า bell จากไฟล์ config และใช้ชื่อ event ที่มี prefix ของแพ็กเกจ
- **Out of scope:** edits outside `pi-extensions/package.json`, `pi-extensions/package-lock.json`, `pi-extensions/LICENSE`, `pi-extensions/CHANGELOG.md`, `pi-extensions/scripts/pack-check.mjs`, `pi-extensions/scripts/pack-check.test.cjs`, … +10 more; the authored Non-goals below

## Non-goals

- ไม่ publish ขึ้น npm ในงานนี้ (ต้องได้สิทธิ์ publish แยก และยังไม่ได้ login npm)
- ไม่เปลี่ยนวิธีติดตั้ง: install.sh ยัง copy เข้า ~/.pi/agent/extensions
- ไม่แยกเป็นหลายแพ็กเกจ และไม่ตัด import ระหว่าง extension ทั้งสาม
- ไม่ย้ายไป build dist/ หรือเปลี่ยน test runner

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| package-manifest | Manifest ถูกต้อง | success | T001 | test: `pi-extensions/scripts/pack-check.test.cjs` | — |
|  | แพ็กเกจของ host อยู่ใน dependencies | failure | T001 |  |  |
|  | ไฟล์ใน pi.extensions หายไป | failure | T001 |  |  |
| pack-contents | เนื้อหา tarball ถูกต้อง | success | T001 | test: `pi-extensions/scripts/pack-check.test.cjs` | — |
|  | มีไฟล์เทสต์หลุดเข้า tarball | failure | T001 |  |  |
| changelog-version | version ตรงกัน | success | T001 | test: `pi-extensions/scripts/pack-check.test.cjs` | — |
|  | ลืมเพิ่มหัวข้อ version ใหม่ | failure | T001 |  |  |
| typecheck | โค้ดปัจจุบันผ่าน typecheck | success | T002 | test: `pi-extensions/scripts/typecheck.test.cjs` | — |
|  | เรียก API ที่ไม่มีอยู่ | failure | T002 |  |  |
| tool-docs | เอกสารตรงกับโค้ด | success | T004 | test: `pi-extensions/scripts/tool-docs.test.cjs` | — |
|  | เอกสารล้าสมัย | failure | T004 |  |  |
| ask-user-config | ปิด bell จาก config | success | T003 | test | — |
|  | ไม่มีไฟล์ config | boundary | T003 |  |  |
|  | ค่าผิดชนิด | boundary | T003 |  |  |
|  | JSON เสีย | failure | T003 |  |  |
| event-namespace | bridge ภายนอกตอบผ่านชื่อใหม่ | success | T003 | test | — |
|  | ชื่อเดิมไม่มีผล | boundary | T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (17).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (7); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for package-manifest, pack-contents, changelog-version, typecheck, tool-docs, ask-user-config, event-namespace.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | ไม่มีข้อค้นพบ | — | — | claude-opus |
