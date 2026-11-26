# Change: การตรวจ reference ของ skill ให้ผลเหมือนเดิมแต่ใช้เวลาไม่กี่วินาที แทน 41 วินาที

- **Change:** `reference-skill-41` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

การตรวจ reference ของ skill ใน gate เร็วขึ้นราว 40 วินาที โดยผลตรวจเหมือนเดิม

## เหตุผล

[Data] profile ของ suite context budgets พบว่า 41 จาก 44 วินาทีอยู่ในสคริปต์ตรวจ reference ที่เทียบทุกคู่ย่อหน้าและแตกคำซ้ำทุกครั้ง

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** ตรวจ .claude/skills ของ repo เสร็จภายในไม่กี่วินาที
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนเกณฑ์ duplicate, near-duplicate, anchor หรือ cycle
- แก้ run-all process control (รันเดี่ยว 26 วินาที ส่วนใหญ่เป็นงานย่อยหลายตัวที่ช้าเพราะเครื่องโหลด)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/tests/harness/reference-governance.mjs`, `.claude/tests/harness/reference-governance.test.mjs`, `CHANGELOG.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| reference-governance-fast | skill จริงของ repo | success | T001 | test: `.claude/tests/harness/reference-governance.mjs`, `.claude/tests/harness/reference-governance.test.mjs` | — |
|  | ขนาดชุดคำต่างกันมาก | boundary | T001 |  |  |
|  | ย่อหน้าซ้ำและเกือบซ้ำ | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1: The size prune compares `min >= 0.92 * max` in floating point, but `similarity` computes `intersection/union` and compares that to 0.92. At the exact boundary the two can disagree. For example, a 23-word set that is a subset of a 25-word set gives 23/25, which equals the double 0.92, but `0.92*25` may round just above 23. Such a pair would now be pruned where it was previously reported. This only matters for pairs with 40 or more tokens whose sets hold few unique words, so it is very unlikely. Comparing `min / max >= NEAR_DUPLICATE`, or cross-multiplying with integers, would match the old arithmetic exactly. (root/.claude/tests/harness/reference-governance.mjs:135) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f2: The wall-clock assertion (<10000 ms) is required by the spec, but it can be flaky on a loaded CI machine. The 10-second budget is about 10x the expected runtime, so the risk is low. (root/.claude/tests/harness/reference-governance.test.mjs:73) | minor | ยังเปิดอยู่ | claude-opus |
