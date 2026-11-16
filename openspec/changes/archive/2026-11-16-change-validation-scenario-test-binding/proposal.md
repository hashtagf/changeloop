# Change: ทุก scenario มี test ที่แยกโค้ดใหม่ออกจากโค้ดเดิมได้

- **Change:** `change-validation-scenario-test-binding` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ตอนนี้ verify ของ task ที่ exit 0 ทำให้ทุก scenario ของ requirement นั้นนับว่าผ่าน และ test discrimination ผ่านทั้ง repository ได้ถ้ามี test ไฟล์เดียวล้มบนโค้ดเดิม paid run จึงถึง proven ทั้งที่ scenario หลุด (project-tracker-api fail CASE_TESTS_EXIST ซ้ำหลายเวอร์ชัน, config-flag หลุดค่า default และลำดับ env เหนือไฟล์) change นี้ทำให้ทุก scenario ต้องมี test ที่แยกโค้ดใหม่ออกจากโค้ดเดิมได้จริงก่อน proven

## User story

- **P1** ในฐานะ ผู้ใช้ที่ approve spec ฉันต้องการ ทุก scenario ที่ตกลงมี test ที่พิสูจน์ได้จริงก่อน proven เพื่อ ไม่ต้องเจอ scenario หลุดหลัง Land Requirement: scenario-test-binding, per-file-discrimination.
- **P2** ในฐานะ agent ที่วาง implementation plan ฉันต้องการ รู้ตั้งแต่ change start ว่า verify หรือ scenario ไหนยังไม่พอ เพื่อ แก้ draft ครั้งเดียวแทนการ repair ตอน Prove Requirement: verify-runs-tests, scenario-test-binding.
- **P2** ในฐานะ ผู้ใช้ที่อ่านรายงาน Land ฉันต้องการ เห็นเมื่อ discrimination ไม่มีคำตัดสิน เพื่อ ไม่เข้าใจผิดว่า test ถูกพิสูจน์แล้ว Requirement: discrimination-no-verdict-visible.

## เกณฑ์ความสำเร็จ

- regression test ใหม่ครอบทุก scenario ใน 4 requirement และผ่าน
- default gate .claude/tests/run-all.sh ผ่าน

## ขอบเขต

- **In scope:** ทุก scenario ของงานที่เปลี่ยนพฤติกรรมมีไฟล์ test อย่างน้อยหนึ่งไฟล์ก่อน compile; test ที่ไม่ได้ทดสอบอะไรซ่อนหลัง test ไฟล์อื่นที่ล้มบนโค้ดเดิมไม่ได้; task ถูกติ๊กได้ด้วยหลักฐาน test เท่านั้น; ผู้ใช้เห็นว่า repository ใดยังไม่มีหลักฐานว่า test แยกโค้ดใหม่ออกจากโค้ดเดิม
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/validation/verify-shape.mjs`, `.claude/harness/runtime/workflow/change-lifecycle.mjs`, `.claude/harness/runtime/workflow/semantic-amendment.mjs`, `.claude/harness/tests/verify-shape.test.mjs`, `.claude/harness/runtime/workflow/validation/scenario-test-binding.mjs`, `.claude/harness/runtime/workflow/semantic-draft.mjs`, … +10 more; the authored Non-goals below

## Non-goals

- ผูก scenario กับ test case รายตัวภายในไฟล์
- block การแก้ไฟล์นอก task paths
- เปลี่ยน discrimination ของงาน behavior-neutral

## Capability ที่เปลี่ยน

| Capability | Requirements | Tasks |
|---|---|---|
| change-validation | Scenario ของงานที่เปลี่ยนพฤติกรรมผูกกับไฟล์ test, Verify ของ task ที่แก้โค้ด product ต้องรัน test | T001, T002, T005 |
| prove | Test discrimination ตัดสินรายไฟล์ test, Discrimination ที่ไม่มีคำตัดสินไม่ผ่านแบบเงียบ | T003, T004, T005 |

## ผลกระทบและความเสี่ยง

- Draft ที่เคยผ่านอาจได้ EDIT ใหม่เรื่องการผูก test หรือรูปแบบ verify ซึ่ง agent แก้ได้ใน draft เดียว
- Prove ช้าขึ้นตามจำนวนไฟล์ test ที่เปลี่ยนในรอบแรก ผลถูก cache ต่อไฟล์
- change ที่อยู่ระหว่าง Build ก่อนอัปเกรดไม่มีการผูกที่บันทึกไว้ จึงใช้ discrimination แบบเดิม

- **Impact:** medium
- **Coupling:** coupled
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Change ต้องผูกทุก scenario กับไฟล์ test และ verify ต้องรัน test; Prove ตัดสิน test discrimination รายไฟล์และแสดงผลที่ไม่มีคำตัดสิน

## วิธีตรวจด้วยตัวเอง

รัน `node --test .claude/harness/tests/verify-shape.test.mjs .claude/harness/tests/scenario-test-binding.test.mjs .claude/harness/tests/test-discrimination.test.mjs .claude/harness/tests/test-discrimination-verdict.test.mjs` แล้วรัน `bash .claude/tests/run-all.sh`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| Scenario ของงานที่เปลี่ยนพฤติกรรมผูกกับไฟล์ test | ทุก scenario ผูกไฟล์ test | success | T002, T005 | test: `.claude/harness/tests/scenario-test-binding.test.mjs` | — |
|  | งาน behavior-neutral ไม่ต้องผูก | boundary | T002, T005 |  |  |
|  | scenario ไม่มีไฟล์ test | failure | T002, T005 |  |  |
|  | amendment เพิ่ม scenario ที่ไม่ผูก | failure | T002, T005 |  |  |
| Test discrimination ตัดสินรายไฟล์ test | ทุกไฟล์ล้มบนโค้ดเดิม | success | T003, T005 | test: `.claude/harness/tests/test-discrimination.test.mjs` | — |
|  | รันซ้ำโดยไม่เปลี่ยนอะไร | success | T003, T005 |  |  |
|  | ไฟล์ของ scenario regression ผ่านบนโค้ดเดิม | boundary | T003, T005 |  |  |
|  | runner รับไฟล์ไม่ได้ | boundary | T003, T005 |  |  |
|  | test ที่ไม่ทดสอบซ่อนหลังไฟล์อื่น | failure | T003, T005 |  |  |
|  | ไฟล์ test ที่ผูกไว้ไม่มีอยู่ | failure | T003, T005 |  |  |
| Verify ของ task ที่แก้โค้ด product ต้องรัน test | verify อ้างไฟล์ test | success | T001, T005 | test: `.claude/harness/tests/verify-shape.test.mjs` | — |
|  | verify เรียก test runner | success | T001, T005 |  |  |
|  | task เอกสารอย่างเดียว | boundary | T001, T005 |  |  |
|  | verify ไม่มีผล | failure | T001, T005 |  |  |
|  | verify เป็น lint | failure | T001, T005 |  |  |
|  | amendment แก้ verify เป็น echo | failure | T001, T005 |  |  |
| Discrimination ที่ไม่มีคำตัดสินไม่ผ่านแบบเงียบ | มีคำตัดสิน | success | T004, T005 | test: `.claude/harness/tests/test-discrimination-verdict.test.mjs` | — |
|  | รันบนโค้ดเดิมเกินเวลา | boundary | T004, T005 |  |  |
|  | เตรียมโค้ดเดิมไม่ได้ | boundary | T004, T005 |  |  |
|  | ไม่มี test provider | failure | T004, T005 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (20).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, configured model).
- Land archives it; Land never commits.
- Success: the Success criteria above hold.

## ภาคผนวก: การสืบค้น

- **ID:** implementation-plan-strictness
- **ผลลัพธ์:** ready-for-change
- **สรุป:** Plan เข้มเรื่องโครงสร้าง (ทุก requirement มี task, harness ติ๊กงานเอง, กัน task กลวง, test ต้อง fail บนโค้ดเดิม) แต่หลักฐานพฤติกรรมยังหยาบ: scenario ไม่ได้ผูกกับ test รายตัว verify ระดับ task exit 0 ก็ถือว่า claim ผ่าน และ discrimination ผ่านได้ถ้ามี test ตัวเดียว fail บนโค้ดเดิม ซึ่งตรงกับความพลาดจริงจาก paid run (CASE_TESTS_EXIST, config-flag) ข้อเสนอหลักคือผูก scenario กับ test และทำ discrimination รายไฟล์ ร่วมกับตรวจรูปแบบ verify และไม่ปล่อยผลไม่มีคำตัดสินผ่านเงียบ
- **เจตนาของ change:** ผูก scenario ของงานที่เปลี่ยนพฤติกรรมกับไฟล์ test และรัน test discrimination รายไฟล์; ตรวจรูปแบบ verify ของ task ตอน compile; ไม่ปล่อยผล discrimination ที่ไม่มีคำตัดสินผ่านเงียบ
- **State:** .foundation/investigations/implementation-plan-strictness.json @ 1abdcd721125413956781daaf31b19b2ad4a67f7cfe94e74cb2ee801ec80edc6
- **Sources:** sha256:4fb20e214ecb3b367a76df27cfc50883f2b286be7201b4886692d6d4235f47c7

เป้าหมาย: ให้ทุก scenario ที่ตกลงใน Change ถูกพิสูจน์ด้วย test ที่แยกโค้ดใหม่ออกจากโค้ดเดิมได้จริง ก่อนถึง proven

ผลลัพธ์ที่ต้องการ: รู้ช่องที่ agent ผ่าน Build/Prove ได้ทั้งที่งานไม่ครบ พร้อมทางแก้ที่จัดลำดับแล้ว

### ขอบเขตและผู้เกี่ยวข้อง

- semantic draft tasks (outcome, verify, paths, covers)
- Build task tick (advance)
- Prove test discrimination
- acceptance traceability
- user
- agent
- harness

### ความครบของ requirement

| Source | Requirement | สถานะ | Targets | รายละเอียด |
|---|---|---|---|---|
| find-gaps@1 | หาช่องที่ทำให้ task หรือ scenario ผ่าน proven ได้โดยไม่มี test ที่พิสูจน์พฤติกรรมนั้น และเสนอทางแก้ | behavior / stated / user | requirement: scenario-test-binding; requirement: per-file-discrimination; requirement: verify-runs-tests; requirement: discrimination-no-verdict-visible; design: d-scope | — |

ลิงก์นี้ตรวจความครบเชิงโครงสร้าง Agent ต้องตรวจความหมายกับต้นทางก่อนเสนออนุมัติ spec

### สาระจากบทสนทนา

- u-strict [user]: implement plan เราเข้ม พอให้ agent ทำงานไม่พลาดหรือยัง (session message)
- u-investigate [user]: investigate และหา solution ปรับปรุง (session message)
- u-choose [user]: ทำครบสามข้อ (question answer f895356b)

### ช่องว่างของประวัติ

- ยังไม่ได้เปิด raw run ของ project-tracker-api เพื่อยืนยันว่า CASE\_TESTS\_EXIST fail เพราะ scenario ไม่มี test (raw bench ไม่อยู่ใน git) ข้อเชื่อมโยงนี้ยังเป็นการอนุมาน
- ยังไม่ได้วัดว่า discrimination รายไฟล์ทำให้ Prove ช้าขึ้นเท่าไร

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (8); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for scenario-test-binding, per-file-discrimination, verify-runs-tests, discrimination-no-verdict-visible.

## ภาคผนวก: ประวัติการแก้ไข

- Revision 1 (2026-11-16): Existing test fixtures drafted scenarios without test files; binding them and registering the new suites widens the write scope

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1-no-provider-false-repair: `no-test-provider` is now a failing outcome (discriminationStatus and missingProviderFinding), but evaluateRepository still produces it whenever testProvider() returns null. testProvider() (lines 333-342) also returns null for a valid test provider that it only skips because it cannot be overlaid. That covers a provider with `repositories` (multi-repository), `service`, or `readiness`, and any test-capability provider whose adapter is not command or test-discovery. Concrete failure: a feature change in a repository whose only test provider runs against a service (config.service set) gets REPAIR `rootCause: no-test-provider`. The REPAIR says the repository 'has no test provider' and tells the user to add one through an amendment. Proof never converges because the provider already exists, so adding one does not change what testProvider() returns. Before this change the same case was silent and not-applicable. The fix is to tell an absent test provider apart from one that is present but ineligible. The ineligible case should be reported as no verdict (an inconclusive row), not as a REPAIR. The only test for this (test-discrimination-verdict.test.mjs:84) uses `providers: []`, so it does not cover this case. (root/.claude/harness/runtime/evidence/test-discrimination.mjs:369) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F2-amend-binding-not-recorded: The requirement says the binding applies to requirements an amendment adds and is recorded for Prove. Start (line 2121) and revise (line 2454) set `scenarioTestBinding`. The amendment apply path (around lines 2782-2797) updates requirementFingerprints but never updates `scenarioTestBinding`. Result: suppose an amendment adds a requirement whose test file test/new.test.mjs passes on base, and another changed file fails on base. boundScenarios() finds no row for test/new.test.mjs, so combineBaseRuns skips it and the repository is fails-on-base, which passes. That is the hidden non-discriminating test this change exists to catch. In the other direction, a requirement removed by `removeRequirements` keeps its rows. missingBoundFiles() then reports its deleted test files as `bound-test-missing`, a REPAIR that cannot be resolved without recreating tests for a dropped scenario. amendmentScenarioBindingIssues only validates and does not persist anything. (root/.claude/harness/runtime/workflow/change-lifecycle.mjs:2782) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F3-per-file-no-verdict-masked: combineBaseRuns records `noVerdict` but then evaluates `fails ? "fails-on-base" : noVerdict \|\| ...`. When any one file fails on base, a sibling bound to a scenario that is not a regression and whose base run timed out (or could not be prepared, line 420) is dropped. inconclusiveRows() only looks at row.outcome, so neither the Prove DONE outcome nor the Land report gets a row. The requirement 'Discrimination ที่ไม่มีคำตัดสินไม่ผ่านแบบเงียบ' says timed-out and unavailable runs do not block but must be shown with their reason. Per-file mode now has a new way to stay silent: the timed-out file is the one that could be non-discriminating. Keep each file's no-verdict reason (for example, list the files without a verdict) even when another file fails. (root/.claude/harness/runtime/evidence/test-discrimination.mjs:182) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F4-outcome-recording-untested: The `testDiscrimination` block in the advance DONE envelope and recordInconclusiveDiscrimination (proof-execution-runtime.mjs:786) are not exercised by any test. The timed-out and unavailable tests only call landAdvisoryLines on a hand-built state. So the scenario 'outcome ของ advance แสดงแถว' is implemented in code but no test checks it, including that the row is cleared once a later run reaches a verdict. (root/.claude/harness/runtime/workflow/advance-runtime.mjs:1300) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F5-verify-shape-denylist: The requirement bullet says verify must reference a test file or call a known test runner. verifyRunsBehavior instead accepts any segment that is not a no-op and not check-only. So `node scripts/build.mjs`, `ls src`, or `npm test \|\| true` (the `\|\| true` makes it always pass) are accepted. The listed scenarios pass, but the bullet is only partly enforced. (root/.claude/harness/runtime/workflow/validation/verify-shape.mjs:36) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | D1-multi-repo-provider-defaults-root: `own` is computed as `(providerRepository(...)?.id \|\| "root") === repositoryId`. providerRepositoryValue only reads `config.repository`, so a multi-repository test provider such as `{ repositories: ["web", "api"] }` with no `repository` counts as root's own provider. If root changes product code and its only test provider covers other repositories, root gets the inconclusive outcome `test-provider-not-runnable-on-base` instead of the REPAIR `no-test-provider`. Before this delta the provider was skipped entirely. The row is still visible, so nothing is silent. Suggested fix: when `config.repositories` is set, judge ownership only by whether the list includes the repository. (root/.claude/harness/runtime/evidence/test-discrimination.mjs:350) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 2 | D2-amend-binding-wiring-untested: amendedScenarioTestBinding has a unit test only (scenario-test-binding.test.mjs). No test runs `change amend` and checks the persisted `scenarioTestBinding` on the runtime state. Such a test would exercise how compiled.bindingDraft, the claim tags on taskBlocks(compiled.tasksContent), and removedClaimIds/changedClaimIds fit together. If the claim tags that compiled amendment tasks write ever drift from normalized.draft claim ids, nothing would catch it. (root/.claude/harness/runtime/workflow/change-lifecycle.mjs:2795) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 3 | M1-multi-repo-provider-own-defaults-root: This is the earlier D1 issue, still open. providerRepositoryValue only reads `config.repository`. So a test provider configured with `repositories: ["web", "api"]` and no `repository` counts as root's own provider (`own` is true for root). If root changes product code and its only test provider covers other repositories, root gets the no-verdict `test-provider-not-runnable-on-base` instead of the REPAIR `no-test-provider`. The row is still visible, so nothing passes silently. Fix: when `config.repositories` is set, decide ownership only by whether the list includes the repository. (root/.claude/harness/runtime/evidence/test-discrimination.mjs:350) | minor | ยังเปิดอยู่ | claude-opus |
| 3 | M2-undecided-dropped-on-judged-return: When any bound file passes on base (judged.length), combineBaseRuns returns early without `undecided`. A sibling file that timed out or was unavailable in the same run is then missing from result.inconclusive, and recordInconclusiveDiscrimination clears state.testDiscrimination. The REPAIR still blocks, and timed-out runs are never cached, so the file is evaluated and reported again on the next run. That makes this a gap in what the REPAIR shows, not a silent pass. Spreading `undecided` into the judged return as well would keep the output consistent. (root/.claude/harness/runtime/evidence/test-discrimination.mjs:184) | minor | ยังเปิดอยู่ | claude-opus |
| 3 | M3-amend-binding-wiring-untested: This is the earlier D2 issue, still open. amendedScenarioTestBinding only has a unit test. No integration test runs `change amend` and checks the persisted runtime `scenarioTestBinding`. If the claim tags written into the compiled tasksContent drift from the claim ids in compiled.bindingDraft, no test would catch it. (root/.claude/harness/runtime/workflow/change-lifecycle.mjs:2795) | minor | ยังเปิดอยู่ | claude-opus |
