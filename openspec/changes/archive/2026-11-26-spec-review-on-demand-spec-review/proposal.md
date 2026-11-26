# Change: ตรวจสเปกด้วย reviewer ที่ไม่รู้บริบทก่อนอนุมัติ เมื่อขอ

- **Change:** `spec-review-on-demand-spec-review` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-25

## สรุป

ผู้อนุมัติสั่งให้ reviewer สามตัวที่ไม่เคยเห็นบทสนทนาอ่านสเปกก่อนกดอนุมัติได้ แต่ละตัวดูคนละมุม: อ่านแล้วเข้าใจได้เองไหม, พร้อมให้ลงมือทำไหม, และเรียบง่ายหรือใช้ของเดิมซ้ำแล้วหรือยัง ผลแสดงเป็นคำแนะนำในหน้าอนุมัติ

## เหตุผล

[Data] ตอนนี้ก่อนอนุมัติมีแค่ตัวตรวจแบบตายตัว ช่องโหว่ของสเปกโผล่ตอน Prove เป็น specGaps ซึ่งการแก้ต้องทำ amendment และเปิดรอบรีวิวใหม่ [Assumption] ผู้ที่ร่างสเปกมักมองไม่เห็นสมมติฐานที่ตัวเองไม่ได้เขียน ซึ่งเป็นแนวคิดหลักของ Elephant-Goldfish Model ของ Google

## ขอบเขต

- คำสั่งใหม่ spec-review <change> รันเมื่อสั่งเท่านั้น
- reviewer 3 session แยกมุม อ่านอย่างเดียว
- สถานะ not-run เมื่อ reviewer รันไม่สำเร็จ
- แสดงผลใน package แบบคำแนะนำ

- **อยู่ในขอบเขต (`spec-review`):** คำสั่ง spec-review คืนผลรีวิวของ packet ปัจจุบัน; สามมุม comprehension, implementation-readiness, zoom-out ได้ session แยกกัน; สถานะของแต่ละมุมเป็น completed หรือ not-run พร้อมเหตุผล; package แสดงข้อสังเกตแยกตามมุมและระดับ blocker, major, nit
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- รายงานสเปกที่ไม่ตรงกับโค้ด (ช่วง 2 แยก change)
- ขั้นหาจุดอ่อนใน skill brainstorming (ช่วง 3 แยก change)
- กติกาห้าม reviewer คล้อยตามผู้ใช้ (ช่วง 4 แยก change)
- รันอัตโนมัติตอน change start หรือ advance
- บล็อกการอนุมัติสเปกด้วยผลรีวิว

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

คำสั่งใหม่ spec-review ให้ reviewer สามตัวที่ไม่เคยเห็นบทสนทนาตรวจสเปกก่อนอนุมัติ ผลเป็นคำแนะนำในหน้าอนุมัติ

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/change/spec-review.mjs`, `.claude/harness/runtime/evidence/configured-reviewer.mjs`, `.claude/harness/tests/spec-review.test.mjs`, `.claude/harness/runtime/core/cli-router.mjs`, `.claude/harness/commands.json`, `.claude/harness/runtime/composition/**`, … +10 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| on-demand-spec-review | สั่งรีวิว change ที่รออนุมัติ | success | T001, T002, T004 | test: `.claude/harness/tests/spec-review.test.mjs`, `.claude/harness/tests/public-command-golden.test.mjs`, `.claude/harness/tests/spec-review-command.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | change start ไม่รันรีวิวเอง | boundary | T001, T002, T004 |  |  |
|  | change ไม่มีอยู่ | failure | T001, T002, T004 |  |  |
|  | change เข้า Land แล้ว | failure | T001, T002, T004 |  |  |
| three-isolated-lenses | สามมุมแยก session | success | T001 | test: `.claude/harness/tests/spec-review.test.mjs` | — |
|  | prompt ไม่มีบทสนทนา | boundary | T001 |  |  |
|  | change ระดับ medium ใช้รุ่น standard | boundary | T001 |  |  |
|  | reviewer ใช้ session ของผู้ร่างสเปกซ้ำ | failure | T001 |  |  |
| not-run-status | reviewer ล้มเหลวครั้งเดียว | success | T001 | test: `.claude/harness/tests/spec-review.test.mjs` | — |
|  | reviewer ล้มเหลวสองครั้ง | failure | T001 |  |  |
|  | ไม่มี reviewer CLI | failure | T001 |  |  |
| advisory-findings | แสดงผลในหน้าอนุมัติ | success | T003 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | มี blocker แต่ยังอนุมัติได้ | boundary | T003 |  |  |
|  | packet เปลี่ยนหลังรีวิว | boundary | T003 |  |  |
|  | ยังไม่เคยรีวิว | boundary | T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (15).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: การสืบค้น

- **ID:** egm-adoption
- **ผลลัพธ์:** ready-for-change
- **สรุป:** ข้อ 1 คุ้มที่สุดและใช้ configured reviewer แบบ ephemeral ที่มีอยู่ได้ ต้องรายงาน not-run เมื่อเปิด session ใหม่ไม่ได้; ข้อ 2 ยังไม่มีเลย; ข้อ 3 เป็นงานแก้ skill ภายใต้ budget; ข้อ 4 ส่วน not-run มีแล้วใน Prove เหลือแค่กติกาห้ามคล้อยตามและสถานะ not-run ของรีวิวสเปกใหม่
- **เจตนาของ change:** Pre-approval Goldfish spec review: a fresh-session read-only reviewer checks the compiled packet for comprehension, implementation readiness, and simplicity/reuse, reported as advisory findings on the approval page with an explicit not-run status (phase 1 of 4; drift report, adversarial brainstorming, and anti-sycophancy reviewer rule follow as separate changes)
- **State:** .foundation/investigations/egm-adoption.json @ d5e59e883698c79c5de300c2a9aca54639f47d8ea235f2694d0f6b4487eff575
- **Sources:** sha256:ed343b2d907f40a8d15ac9eedfb8e60df8dff02976e99365cbf5f4e6b3d4ab3d

เป้าหมาย: นำจุดแข็งของ EGM มาเสริม Change Loop โดยไม่ซ้ำของเดิมและไม่ขัดหลัก Land เป็นด่านบังคับเดียว

ผลลัพธ์ที่ต้องการ: หลักฐานต่อช่วง 1-4 พร้อมขอบเขตที่ส่งเข้า Change ได้

### ขอบเขตและผู้เกี่ยวข้อง

- pre-approval spec review
- spec drift report
- brainstorming skill
- reviewer rules
- maintainer
- consumer agent
- ผู้อนุมัติสเปก

### ความครบของ requirement

| Source | Requirement | สถานะ | Targets | รายละเอียด |
|---|---|---|---|---|
| goldfish-spec-review@1 | ก่อนผู้ใช้อนุมัติสเปก ให้ reviewer ที่เปิด session ใหม่และไม่รู้บริบทตรวจ packet ที่คอมไพล์แล้วในมุม อ่านเข้าใจได้เอง, พร้อมลงมือทำ, เรียบง่าย/ใช้ของเดิมซ้ำ แล้วแสดงผลเป็นคำแนะนำในหน้าอนุมัติ | behavior / stated / user | requirement: on-demand-spec-review; requirement: three-isolated-lenses; requirement: advisory-findings | — |
| spec-drift-report@1 | มีรายงานอ่านอย่างเดียวที่เทียบสเปกที่ archive แล้วใน openspec/specs กับโค้ดปัจจุบัน และให้ผู้ใช้ตัดสินว่าจะแก้สเปกหรือโค้ด | behavior / stated / user | non-goal: รายงานสเปกที่ไม่ตรงกับโค้ด (ช่วง 2 แยก change) | — |
| adversarial-brainstorming@1 | skill brainstorming มีขั้นหาจุดอ่อนของแต่ละทางเลือก (YAGNI/ใช้ของเดิมซ้ำ, failure/scale, ความชัดเจน) ก่อนแนะนำ | behavior / stated / user | non-goal: ขั้นหาจุดอ่อนใน skill brainstorming (ช่วง 3 แยก change) | — |
| reviewer-rules@1 | reviewer ที่ไม่ได้รันต้องไม่ถูกนับเป็นการตรวจผ่าน และ reviewer ต้องไม่คล้อยตามผู้ใช้โดยอัตโนมัติ เฉพาะส่วนที่ยังขาด | behavior / stated / user | requirement: not-run-status; non-goal: กติกาห้าม reviewer คล้อยตามผู้ใช้ (ช่วง 4 แยก change) | — |
| advisory-only@1 | สิ่งที่เพิ่มต้องเป็นคำแนะนำ ไม่สร้างด่านบังคับใหม่ก่อน Land ตาม WORKFLOW.md blocking policy | constraint / superseded / agent | — | เป็นกติกาเดิมของ repo (Land เป็นด่านบังคับเดียว) ไม่ใช่เจตนาใหม่ที่ต้องให้ผู้ใช้ยืนยัน; → advisory-only@2 |
| advisory-only@2 | สิ่งที่เพิ่มต้องเป็นคำแนะนำ ไม่สร้างด่านบังคับใหม่ก่อน Land ตาม WORKFLOW.md blocking policy ที่มีอยู่แล้ว | constraint / proposed / agent | — | — |

ลิงก์นี้ตรวจความครบเชิงโครงสร้าง Agent ต้องตรวจความหมายกับต้นทางก่อนเสนออนุมัติ spec

### คำถามและคำตอบ

- q-scope [answered]: เริ่มนำแนวคิด EGM จากขอบเขตไหน → ทั้ง 4 ข้อ

### สาระจากบทสนทนา

- u1 [user]: ศึกษา https://github.com/google/elephant-goldfish-model (session message)
- u2 [user]: วางแผนนำ แนวคิดมาพัฒนา changeloop (session message)
- u3 [user]: เลือกทั้ง 4 ข้อ: Goldfish spec review, Spec drift report, Adversarial brainstorming, ปรับกติกา reviewer (ask\_user answer egm-plan-scope)

### ช่องว่างของประวัติ

- เนื้อหา EGM มาจาก clone ภายนอก google/elephant-goldfish-model@63e239d8d4c3ddc6774faf533b4997405f78c549 ไม่อยู่ใน repo; สรุปภายนอกบันทึกใน openspec/investigations/egm-adoption.md

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (5); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ประวัติการแก้ไข

- Revision 1 (2026-11-25): The CLI router receives its command handlers from the composition root foundation.mjs, so wiring the spec-review command needs that file in T002's paths; no behavior changes.
- Revision 2 (2026-11-25): A new public command must update the frozen public-command golden fixture (count and digest) that public-command-golden.test.mjs checks; no behavior changes.
- Revision 3 (2026-11-25): docs/feature-map.md is generated from docs/feature-map.json (and mirrored to openspec/feature-map.json) by scripts/docs/feature-map.mjs --write, so registering the new command in the feature map needs those files in T004's paths; no behavior changes.
- Revision 4 (2026-11-25): cli.sh owns the public command routes (single-source tables test) and the installer test bounds the agent command surface; the approved spec-review command needs a cli.sh route and the bound raised by one. No behavior changes.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | dead-current-summary: `currentSummary` is exported from `createSpecReviewRuntime` but nothing calls it. `approval-package.mjs` `specReviewField` repeats the same read, files, digest and summary steps. This is dead code and a duplicate path; remove it or have the package call it. (root/.claude/harness/runtime/workflow/change/spec-review.mjs:284) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 1 | approve-spec-proof-weak: The scenario 'blocker finding but approval still works' is proven only by checking that approval status and the facts digest are unchanged, plus a grep that `change-resolution.mjs` and `change-policy.mjs` never mention spec-review. No test runs `advance --approve-spec` with a blocker-level review on disk. The behaviour holds by construction, but the evidence is indirect. (root/.claude/harness/tests/approval-package.test.mjs:446) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | dead-current-summary: `currentSummary` is still returned from `createSpecReviewRuntime`, and nothing in the delta calls it. `approval-package.mjs` repeats the same read, files, digest and summary steps. Remove it or have the package call it. (root/.claude/harness/runtime/workflow/change/spec-review.mjs:346) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 2 | unrelated-declared-sources-fallback: `declaredSourcesFallback` and `discoveryOverBudget` are added here. `change-lifecycle.mjs` also adds a new `declared-sources` status to `intelligenceUsable` and wraps the repository scan with it. This changes how change intake treats repositories over the scan budget. None of the spec-review requirements or scenarios mention that, so it is an unrelated edit and belongs in its own change. (root/.claude/harness/runtime/workflow/validation/repository-intelligence.mjs:283) | minor | แก้แล้วในรอบ 3 | claude-opus |
