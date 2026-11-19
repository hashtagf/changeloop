# Change: เพิ่มช่องกรอก URL ของ 9Router ในขั้นตอน /login ของ Pi โดยไม่ต้องแก้ JSON หรือใช้คำสั่งแยก

- **Change:** `url-9router-pi-json` · **Lane:** rapid (low risk)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-19

## Why

ผู้ใช้พบ 9Router ใน `/login` แล้วแต่ไม่มีช่องตั้ง URL จึงต้องออกไปแก้ JSON เอง เพิ่มช่อง Base URL ในขั้นตอนล็อกอินเดิมตามที่ผู้ใช้ยืนยัน โดยไม่สร้างคำสั่งใหม่หรือแก้ตัว Pi

## Scope

- **In scope (`maintainer-pi-extensions`):** ให้ผู้ใช้ตั้งปลายทางและคีย์ผ่าน /login ของ Pi โดยเก็บทั้งสองค่าด้วยระบบล็อกอินของ Pi
- **Out of scope:** edits outside `pi-extensions/nine-router/index.ts`, `pi-extensions/nine-router/config.ts`, `pi-extensions/nine-router/README.md`, `pi-extensions/nine-router/provider.test.cjs`, `pi-extensions/nine-router/models.ts`, `pi-extensions/nine-router/test/chat.test.cjs`, … +1 more

## Work type

feature

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ปฏิเสธปลายทางผิดรูปแบบ | Pi แจ้งรูปแบบที่ถูกต้อง ให้ลองใหม่ และยังไม่บันทึกหรือส่งคีย์ | No separate step; the outcome is the handling | configure-from-pi |

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| configure-from-pi | ปฏิเสธปลายทางผิดรูปแบบ | failure | T001 | test: `pi-extensions/nine-router/provider.test.cjs`, `pi-extensions/nine-router/test/chat.test.cjs`, `pi-extensions/nine-router/test/interactive-start.py` | — |
|  | ตั้งค่าผ่านเมนูเดิม | unclassified | T001 |  |  |
|  | ยกเลิกได้ | unclassified | T001 |  |  |
|  | ค่าที่ตั้งไว้ยังใช้ได้ | unclassified | T001 |  |  |
|  | ปลายทางที่ผู้ใช้เห็นตรงกับปลายทางจริง | unclassified | T001 |  |  |

## Definition of done

- Fresh evidence for every claim (5).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Review record

| Round | Finding | Severity | Fix | Reviewer |
|---|---|---|---|---|
| 3 | No findings | — | — | codex-sol |
