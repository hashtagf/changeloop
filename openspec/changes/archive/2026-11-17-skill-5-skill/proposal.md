# Change: ให้ skill มีสัญญา 5 ข้อแบบตรวจได้ และกัน skill ใหม่ที่ไม่มีสัญญา

- **Change:** `skill-5-skill` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ตอนนี้ skill ทั้ง 41 ตัวมีแค่ description ที่เป็น prose จึงตอบแบบตรวจได้ไม่ได้ว่า skill ส่งอะไรออก ส่งต่อให้ใคร และคนต้องตัดสินใจอะไร การนิยามแต่ละ skill ด้วย trigger, input, action, output และ handoff พร้อมแบ่งงานเป็น AI ทำ คนทำ และคนตัดสินใจ แล้วให้ check บังคับ จะทำให้ process ถูกออกแบบก่อนสร้าง agent และให้ความรับผิดชอบของงานที่มีผลจริงอยู่กับคนเสมอ

## ขอบเขต

- **In scope (`skill-contracts`):** schema contract.json v1 และตัวตรวจ scripts/lint/skill-contracts.mjs; contract.json ของ investigate, change, build, prove, land, dev, feature, changes; baseline quality/baselines/skill-contracts-v1.json ของ skill ที่ยังไม่มีสัญญา; suite ใน run-all และ affected selector, เอกสาร maintainer
- **Out of scope:** edits outside `scripts/lint/skill-contracts.mjs`, `scripts/lint/test/skill-contracts.test.mjs`, `.claude/skills/investigate/contract.json`, `.claude/skills/change/contract.json`, `.claude/skills/build/contract.json`, `.claude/skills/prove/contract.json`, … +12 more; the authored Non-goals below

## Non-goals

- เขียนสัญญาให้ skill ที่เหลือทั้งหมดในงานนี้
- ให้ runtime หรือ host อ่าน contract.json ไป route งาน
- แก้ skill-suite-auditor ที่ติดตั้งให้ผู้ใช้
- แก้ SKILL.md หรือ description ของ skill

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

skill ของ Change Loop มี contract.json ระบุ trigger, input, action, output, handoff และคนตัดสินใจอะไร; repo มี check (scripts/lint/skill-contracts.mjs) ใน run-all ที่กัน skill ใหม่ไม่มีสัญญา, handoff ชี้ skill ที่ไม่มีอยู่ และ output ที่ต้องใช้อำนาจคนแต่ไม่ระบุว่าคนตัดสินใจ

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| สัญญา 5 ข้อมีโครงสร้างที่ตรวจได้ | สัญญาครบ | success | T001 | test: `scripts/lint/test/skill-contracts.test.mjs` | — |
|  | ชื่อไม่ตรงโฟลเดอร์ | boundary | T001 |  |  |
|  | ขาด field | failure | T001 |  |  |
|  | kind ไม่รู้จัก | failure | T001 |  |  |
|  | JSON เสีย | failure | T001 |  |  |
| handoff ชี้ปลายทางที่มีอยู่จริง | command ปลายทางมีอยู่ | success | T001 | test: `scripts/lint/test/skill-contracts.test.mjs` | — |
|  | skill ปลายทางไม่มี | failure | T001 |  |  |
|  | รูปแบบปลายทางผิด | failure | T001 |  |  |
| output ที่ต้องใช้อำนาจคนต้องมีคนตัดสินใจ | agreement มีคนอนุมัติ | success | T001 | test: `scripts/lint/test/skill-contracts.test.mjs` | — |
|  | git ไม่มีคนตัดสินใจ | failure | T001 |  |  |
|  | ส่งต่อคนแต่ไม่บอกคนทำอะไร | failure | T001 |  |  |
| skill ที่ไม่มีสัญญาลดได้อย่างเดียว | repo ตรง baseline | success | T001 | test: `scripts/lint/test/skill-contracts.test.mjs` | — |
|  | baseline ค้าง | boundary | T001 |  |  |
|  | skill ใหม่ไม่มีสัญญา | failure | T001 |  |  |
|  | baseline เสีย | failure | T001 |  |  |
| skill หลักของ lifecycle มีสัญญา | Land อยู่กับคน | success | T002 | test: `scripts/lint/test/lifecycle-contracts.test.mjs` | — |
|  | Change ส่งต่อให้คนอนุมัติ | success | T002 |  |  |
| check สัญญาอยู่ใน gate ก่อน commit | แก้ skill | success | T003 | test: `.claude/tests/run-all.sh`, `.claude/tests/affected-suite-selector.mjs`, `.claude/tests/harness/affected-suite-selector.test.mjs` | — |
|  | แก้ไฟล์อื่น | boundary | T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (19).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (9); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for contract-shape, handoff-resolution, human-accountability, missing-contract-ratchet, lifecycle-contracts, gate-wiring.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | malformed-baseline-exit-unasserted: For a malformed baseline (bad JSON, or `{"version":1}`), the test checks only the error text, not the exit code. The scenario requires a non-zero exit. The code does return 2 there, but the test should also assert status === 2 for both malformed cases, as it already does for a missing baseline. (root/scripts/lint/test/skill-contracts.test.mjs:164) | minor | ยังเปิดอยู่ | claude-opus |
