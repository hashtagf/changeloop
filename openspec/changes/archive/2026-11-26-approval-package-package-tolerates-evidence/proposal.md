# Change: สเปก 5 ความสามารถตรงกับโค้ดปัจจุบัน

- **Change:** `approval-package-package-tolerates-evidence` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

สเปก 5 ความสามารถถูกแก้ให้ตรงกับสิ่งที่ระบบทำจริงตอนนี้ โดยไม่เปลี่ยนโค้ด

## เหตุผล

[Data] spec-drift --review ของ approval-package, change-validation, host-adapter, skill-guidance และ build-skill-routing พบ blocker 2 และ major 15 ข้อ ในนั้น 13 ข้อเป็นสเปกที่ตามโค้ดไม่ทัน เช่น requirement ของ skill prototype ที่ลบไปแล้ว และ package ที่ไม่เขียนไฟล์แล้ว

## ขอบเขต

- **อยู่ในขอบเขต:** ระบบ พิมพ์ข้อมูล package เป็น JSON ต่อพร้อมคำเตือนเมื่ออ่าน evidence หรือ receipt ไม่ได้ โดยไม่เขียนไฟล์; ระบบ ติดป้ายทุก artifact ใน package ว่าเป็น preview, stale, proof หรือยังไม่มีหลักฐาน; คำสั่ง package พิมพ์ข้อมูลของ change เป็น JSON ได้แก่ ระดับความเสี่ยงพร้อมเหตุผล domain artifact ตาม role พร้อมป้ายหลักฐาน คำแนะนำ preview บรรทัด scratch รวม undo และ who รายการตรวจ section ที่บังคับ; ระดับความเสี่ยง จำนวน proof และสถานะ role lane มาจากการคำนวณของ harness เท่านั้น และ harness SHALL NOT อ่านค่าเหล่านี้จากไฟล์หน้าอนุมัติหรือ prototype; ระบบ ยกระดับความเสี่ยงและ lane อนุมัติจาก path ที่ task แตะ เมื่อ path บอก signal ที่ draft ไม่ได้ประกาศ; คำสั่ง change และ skill change ให้ agent ถามอนุมัติ spec ผ่านเครื่องมือคำถามแบบมีโครงพร้อมตัวเลือก อนุมัติ แก้ไข ขอดูละเอียด ปฏิเสธ โดยคงคำสั่ง advance เดิม; ระบบ ส่ง EDIT เมื่อ verify ของ task ที่แก้โค้ด product ในงานที่เปลี่ยนพฤติกรรมไม่รัน test; `change validate` run the OpenSpec strict validation for the change when the OpenSpec CLI is available and SHALL fail with the reported findings, so that normative-wording defects surface before Prove; Foundation expose an additive high-level coordinator that evaluates the current lifecycle and returns one versioned machine action for implementation, repair, configured review, external wait, decisio; Skill prototype ถูกลบใน 3.6.10; approval.html แสดงข้อเท็จจริงของ harness, prototype ถ้ามี และรายละเอียดตามลำดับ โดยไม่มีฟอร์มตัดสินใจ; ระบบ ให้ description ของ skill ทั้ง 42 ตัว (ที่ไม่ใช่ lifecycle 34 ตัวและ lifecycle 8 ตัว ไม่นับ skill ที่ vendor มาทั้งชุดตาม Requirement vendored-skills) เป็นประโยค trigger สั้นที่บอกว่าใช้ทำอะไร ใช; ระบบ ให้ SKILL.md ของ skill ในขอบเขตใช้โครงเดียวกัน: จุดยืน 1 บรรทัด, Steps ≤ 6 ข้อ, Harness ≤ 3 บรรทัด และรายการ References ที่อ่านเมื่อจำเป็น; ระบบ ให้ references ของ skill ในขอบเขตเป็นไปตามแผน keep/merge/drop รายไฟล์ด้านล่าง โดยคงเนื้อหาที่ spec หรือ test pin ไว้ครบ
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- แก้ข้อสังเกตระดับ nit
- เปลี่ยนพฤติกรรมของโค้ด
- allowlist และ amend verify (แยกเป็น change ของตัวเอง)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/tests/approval-package.test.mjs`, `.claude/harness/tests/verify-shape.test.mjs`, `.claude/harness/tests/advance-runtime.test.mjs`, `.claude/tests/docs/skill-catalog.test.mjs`, `openspec/specs/build-skill-routing/spec.md`, `CHANGELOG.md`

## Capability ที่เปลี่ยน

| Capability | Requirements | Tasks |
|---|---|---|
| approval-package | package-tolerates-evidence, package-labels, approval-data, facts-from-harness-only, router-path-signals, chat-approval-card | T001 |
| change-validation | Verify ของ task ที่แก้โค้ด product ต้องรัน test, Spec wording lint runs at change validate | T002 |
| host-adapter | One coordinator projects the next safe host action | T003 |
| skill-guidance | prototype-skill-contract, approval-page-contract, trigger-descriptions, minimal-skill-bodies, pruned-references | T004 |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| package-tolerates-evidence | provider ไม่มี adapter | unclassified | T001 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | evidence.yaml เป็น JSON ที่เสีย | unclassified | T001 |  |  |
|  | change ที่ไม่มีอยู่ | unclassified | T001 |  |  |
| package-labels | preview ของ revision ก่อนหน้า | boundary | T001 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | มี receipt ใช้ได้ | unclassified | T001 |  |  |
|  | มีแต่ preview | unclassified | T001 |  |  |
| approval-data | พิมพ์ข้อมูลครบ | unclassified | T001 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | ค่าที่ไม่ทราบ | unclassified | T001 |  |  |
|  | อ่าน evidence บางส่วนไม่ได้ | unclassified | T001 |  |  |
|  | change ที่ไม่มี draft แบบ typed | unclassified | T001 |  |  |
| facts-from-harness-only | หน้าอ้าง proof เอง | unclassified | T001 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | preview ไม่ใช่ proof | unclassified | T001 |  |  |
|  | ค่าความเสี่ยงมาจาก draft | unclassified | T001 |  |  |
| router-path-signals | migration ที่ไม่ประกาศ | unclassified | T001 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | path ปกติ | unclassified | T001 |  |  |
|  | lane จาก path | unclassified | T001 |  |  |
| chat-approval-card | ถามด้วยการ์ด | unclassified | T001 | test: `.claude/harness/tests/approval-package.test.mjs` | — |
|  | ใช้ถ้อยคำเดิม | unclassified | T001 |  |  |
| Verify ของ task ที่แก้โค้ด product ต้องรัน test | verify ไม่มีผล | unclassified | T002 | test: `.claude/harness/tests/verify-shape.test.mjs` | — |
|  | verify เป็น lint | unclassified | T002 |  |  |
|  | verify อ้างไฟล์ test | unclassified | T002 |  |  |
|  | verify เรียก test runner | unclassified | T002 |  |  |
|  | task เอกสารอย่างเดียว | unclassified | T002 |  |  |
|  | amendment แก้ verify เป็น echo | unclassified | T002 |  |  |
| Spec wording lint runs at change validate | Missing SHALL fails validate | failure | T002 | test: `.claude/harness/tests/verify-shape.test.mjs` | — |
|  | Absent CLI degrades to a warning | failure | T002 |  |  |
|  | Prove requires the OpenSpec CLI | failure | T002 |  |  |
|  | Corrected wording passes | unclassified | T002 |  |  |
| One coordinator projects the next safe host action | An internal lifecycle dependency throws | failure | T003 | test: `.claude/harness/tests/advance-runtime.test.mjs` | — |
|  | Runnable implementation or repair work exists | unclassified | T003 |  |  |
|  | Configured review is ready | unclassified | T003 |  |  |
|  | Coordinator reaches an authority boundary | unclassified | T003 |  |  |
|  | Safe progress continues | unclassified | T003 |  |  |
|  | A host requests a lifecycle target | unclassified | T003 |  |  |
|  | A target is reached | unclassified | T003 |  |  |
|  | The coordinator cannot continue safely | unclassified | T003 |  |  |
|  | A long deterministic chain keeps progressing | unclassified | T003 |  |  |
|  | Automated continuation repeats unchanged | unclassified | T003 |  |  |
| approval-page-contract | ลำดับของหน้า | unclassified | T004 | test | — |
|  | แถบข้อเท็จจริงคัดลอกจากข้อมูล | unclassified | T004 |  |  |
|  | ค่าที่ไม่ทราบ | unclassified | T004 |  |  |
|  | ป้ายไม่ใช่ proof | unclassified | T004 |  |  |
|  | ไม่พึ่งเครือข่าย | unclassified | T004 |  |  |
|  | ใช้คีย์บอร์ดและไม่พึ่งสี | unclassified | T004 |  |  |
| trigger-descriptions | description ยาวเกิน | failure | T004 | test | — |
|  | description ตรงตามข้อความที่กำหนด | unclassified | T004 |  |  |
|  | spec-vocabulary ยังอยู่ | unclassified | T004 |  |  |
|  | body ของ lifecycle skill ไม่ถูกแตะ | unclassified | T004 |  |  |
| minimal-skill-bodies | guardrail ยังถูกจับ | failure | T004 | test | — |
|  | ทุก body อยู่ใน budget และใช้โครงเดียวกัน | unclassified | T004 |  |  |
|  | จำนวน assertion ห้ามคำไม่ลดลง | unclassified | T004 |  |  |
| pruned-references | ขนาดรวมลดและ governance ผ่าน | unclassified | T004 | test | — |
|  | เนื้อหาที่ pin ยังครบ | unclassified | T004 |  |  |
|  | ไฟล์ที่แผนบอกว่าลบหรือรวมหายไปจริง | unclassified | T004 |  |  |
|  | ลบไฟล์ที่ยังถูกอ้าง | unclassified | T004 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (55).
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for prototype-skill-contract.

## Appendix: Amendment history

- Revision 1 (2026-11-26): Review found package-tolerates-evidence (warn whenever a receipt is unreadable) contradicts approval-data (landed and preview receipts are skipped silently); the code warns only for a change that has not landed.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1-scenarios-unverifiable-in-diff: None of the changed hunks implements or tests the listed scenarios. The only test change, skill-catalog.test.mjs:504-523, covers skill-guidance pruned references and nothing else. The scenarios cover: package exits 0 with JSON and warnings and writes no file; package exits non-zero for an unknown id; artifacts get the proof, preview, stale or none label; approval-data fields and unknown values; risk computed only from harness-held facts; routeChange path signals and the security lane; the approval card's four choices; and the verify EDIT for no-op or lint-only commands. The packet says evidence for the test provider is 'missing', so nothing in this review proves these claims. Close them with current test-provider receipts that run the real package CLI, routeChange, advance and change start. Do not use fakes in their place. (contract/specs/approval-package/spec.md) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F2-unreadable-receipt-warning-ambiguity: The approval-data bullet says unreadable preview receipts, and receipts of changes that have already landed, are skipped with no warning. That conflicts with package-tolerates-evidence (line 7), which requires a warning whenever evidence or a receipt can't be read. It also blurs scenario 'อ่าน evidence บางส่วนไม่ได้', which requires a warning naming the provider when receipt validation fails. The spec doesn't say whether a preview receipt that fails validation counts as 'unreadable' (no warning) or 'validation failed' (warning). Name the exception explicitly in package-tolerates-evidence, so a reader can't decide the silent skip is a spec violation, or the other way round. (contract/specs/approval-package/spec.md:52) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 4 | F1-preview-receipt-partition-untested: The new test covers an unreadable stored receipt after Land and a thrown validity check before Land, but not the separate preview-receipt representation that the amended requirement explicitly says must be skipped without warning. A malformed file under `.foundation/previews/<change>/receipts/` could therefore regress to producing a warning without this test detecting it. (root/.claude/harness/tests/approval-package.test.mjs:79) | minor | ยังเปิดอยู่ | codex-sol |
