# Change: brainstorming หาจุดอ่อนก่อนแนะนำ และ reviewer ไม่เชื่อคำอ้าง

- **Change:** `adversarial-rigor-brainstorm-challenge` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

Agent ที่ช่วยผู้ใช้เลือกแนวทางจะชี้จุดอ่อนของทุกทางเลือกก่อนแนะนำ และ AI reviewer จะไม่เชื่อคำอ้างของผู้ลงมือทำโดยไม่ตรวจ

## เหตุผล

[Data] แนวคิด Adversarial Rigor ของ Elephant-Goldfish Model ของ Google ใช้แก้ปัญหาโมเดลคล้อยตามผู้ใช้ ตอนนี้ skill brainstorming และ prompt ของ code reviewer ใน Change Loop ยังไม่มีกติกานี้

## ขอบเขต

- **อยู่ในขอบเขต (`adversarial-rigor`):** ขั้นที่ 4 ของ brainstorming สั่งตรวจ YAGNI/ของเดิมซ้ำ, failure/scale และความเข้าใจผิด แล้วนำด้วยจุดอ่อนโดยไม่ชมไอเดียผู้ใช้; ทุกความลึกของรีวิว (full, diff-only, delta) มีคำสั่งไม่คล้อยตาม
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- รายงานสเปกที่ไม่ตรงกับโค้ด (ช่วง 2 แยก change)
- สถานะ not-run ของ reviewer (มีแล้วใน Prove และ spec-review)
- ไฟล์ reference ใหม่ของ brainstorming (installer ลบโฟลเดอร์ references ของ skill นี้ทิ้งเป็น legacy)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/skills/brainstorming/SKILL.md`, `.claude/tests/harness/run-context-budget-tests.sh`, `.claude/harness/runtime/evidence/review-diff.mjs`, `.claude/harness/runtime/evidence/configured-reviewer.mjs`, `.claude/harness/tests/configured-reviewer.test.mjs`, `.claude/harness/EVIDENCE.md`, … +1 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| brainstorm-challenge | มีขั้นหาจุดอ่อน | success | T001 | test: `.claude/tests/harness/run-context-budget-tests.sh` | — |
|  | ไม่ชมไอเดียผู้ใช้ | success | T001 |  |  |
|  | อยู่ในงบคำ | boundary | T001 |  |  |
| reviewer-skepticism | รีวิวเต็มมีคำสั่ง | success | T002 | test: `.claude/harness/tests/configured-reviewer.test.mjs` | — |
|  | diff-only และ delta มีคำสั่ง | boundary | T002 |  |  |
|  | ไม่เปลี่ยนเกณฑ์ผ่าน | boundary | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (6).
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | m1-never-praise-assertion-fragment: The never-praise test only searches for the fragment "never praise the", because the SKILL.md sentence breaks after "the" (SKILL.md:22-23). Someone could change the object of that sentence, for example by removing "user's idea", and the test would still pass. That would quietly drop the 'do not praise the user's idea' part of the scenario. Fix it by keeping the phrase on one line in SKILL.md, or by searching for a fragment on a single line that includes "user's idea". (root/.claude/tests/harness/run-context-budget-tests.sh:73) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | m2-word-budget-not-visible-in-diff: The hunks don't show the check that all SKILL.md files together stay at or under 9500 words, or the current word count. The diff adds about 30 words to brainstorming/SKILL.md, so coverage depends on an existing check I could not see under diff-only rules. I am marking this scenario unsure, not missing. (root/.claude/tests/harness/run-context-budget-tests.sh:70) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | m3-delta-fixture-shape: The 'delta' test case is built as `{ ...highPacket, closureFindings: { ids: ["F1"] } }`. It never sets reviewScope.mode to 'delta', so it is a closure round, not necessarily a delta packet. This passes today because the instruction is added without any condition in configured-reviewer.mjs:164. Setting reviewScope.mode='delta' would make the test match the scenario it names. (root/.claude/harness/tests/configured-reviewer.test.mjs:968) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | m4-constant-placement: REVIEW_SKEPTICISM_INSTRUCTIONS is placed between the spec-gaps comment and the code it describes (SPEC_GAP_LIMITS/parseSpecGaps), so that comment no longer sits on its code. The constant is also exported from review-diff.mjs even though its only visible use is in configured-reviewer.mjs, next to SCOPE_DISCIPLINE_INSTRUCTIONS. That is an extra cross-module step nobody asked for. Defining it beside SCOPE_DISCIPLINE_INSTRUCTIONS would be simpler. (root/.claude/harness/runtime/evidence/review-diff.mjs:391) | minor | แก้แล้วในรอบ 2 | claude-opus |
