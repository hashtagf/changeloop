# prove Specification

## Purpose
TBD - created by archiving change prove-readiness-fixit. Update Purpose after archive.
## Requirements
### Requirement: Changed-surface blocker carries a copy-pasteable fix

When proof readiness blocks because a repository changed files outside every
task's declared paths, the readiness output SHALL include a recovery
instruction containing the exact undeclared paths in `[paths:]` annotation
form, ready to append to the owning task in `tasks.md`.

#### Scenario: undeclared paths are rendered as a paste-ready annotation

- **WHEN** a multi-repository change has modified a file no task declares and
  proof readiness runs
- **THEN** the blocker names the repository and the offending paths, and the
  recovery section includes the same paths formatted as a `[paths:...]`
  annotation the agent can paste into `tasks.md`

#### Scenario: declared surfaces stay silent

- **WHEN** every changed file matches a declared task path
- **THEN** readiness reports no changed-surface blocker and no fix-it text

### Requirement: Build declares test files as they are created

The `/build` instruction SHALL direct that a newly created test file is added
to the owning task's `[paths:]` annotation in `tasks.md` in the same step that
creates the file.

#### Scenario: instruction present

- **WHEN** the shipped `/build` command text is read
- **THEN** it states that new test files are declared in the ledger when they
  are created, before Prove runs

### Requirement: Rejected review becomes bounded repair work

The proof controller SHALL derive machine-owned repair nodes from current in-contract blocker and major findings, bind them to the source attempt, workspace, claims, paths, and verification cases, and SHALL reject deterministic closure until an authorized changed workspace and current evidence close every required finding.

#### Scenario: Current review rejects the workspace

- **WHEN** a delivered current review contains blocker or major findings inside the locked contract
- **THEN** Proof returns one dependency-ordered repair graph and bounded host action
- **AND** does not ask the user to make a product decision

#### Scenario: Repair would change the agreement

- **WHEN** a finding requires a behavior, security, data, or rollout choice outside the locked contract
- **THEN** Proof returns `CONTRACT_DECISION_REQUIRED` and preserves the repair state

#### Scenario: Repair result does not change the workspace

- **WHEN** a host reports a repair result but the bound workspace identity is unchanged
- **THEN** the finding cannot receive deterministic closure

### Requirement: Repair invalidates only soundly affected evidence

The proof controller SHALL explain each provider invalidation or reuse from its recorded input manifest and SHALL invalidate ambiguous scope rather than reuse possibly stale evidence.

#### Scenario: Repair changes one provider's complete input set

- **WHEN** a repair changes paths consumed by one provider but not another
- **THEN** Proof reruns the affected provider and reuses the unaffected valid receipt with a recorded reason

### Requirement: Repository proof surfaces share one base binding

Foundation SHALL derive changed-surface, composite snapshot, review-packet, and
provider-manifest repository bases from one mode-aware binding. A current
pre-isolation selection MAY use the observed source head; an isolated selection
SHALL require its recorded runtime base.

#### Scenario: current multi-repository selection has no runtime rows yet

- **WHEN** a change selects a non-root repository before isolation and `state.repositories` is absent
- **THEN** the repository snapshot remains composite and binds the selected source head instead of collapsing to a root-only snapshot

#### Scenario: isolated child base is absent

- **WHEN** an isolated selected child has no recorded runtime base or valid worktree
- **THEN** provider readiness reports infrastructure failure and no packet, manifest, receipt, or proof substitutes the live target head

#### Scenario: repository workspace is missing before snapshot hashing

- **WHEN** readiness observes a missing or foreign selected worktree that would make workspace hashing fail
- **THEN** it returns typed `INFRASTRUCTURE_ERROR` with `sandbox create <change> --all` before attempting the hash

#### Scenario: review and executable evidence observe the same base

- **WHEN** a repository-scoped review packet and provider manifest are built for one workspace
- **THEN** both report the same mode-aware repository base used by changed-surface identity

### Requirement: A waiver cannot leave proof without evidence

ระบบ SHALL ปฏิเสธ change waive เมื่อหลังบันทึก waiver แล้วไม่เหลือ required provider

#### Scenario: waive test ที่เป็นหลักฐานเดียว

- **GIVEN** claim ทั้งหมดต้องการเฉพาะ capability test และไม่ต้องการ review
- **WHEN** change waive --capability test
- **THEN** คำสั่งล้มด้วยข้อความว่าไม่เหลือหลักฐานที่รันจริงและ Land จะปฏิเสธ proof ที่ไม่มี receipt
- **AND** ไม่มี waiver ถูกบันทึก

#### Scenario: waive ที่ยังเหลือหลักฐาน

- **GIVEN** change ต้องการ test และ review
- **WHEN** change waive --capability review
- **THEN** waiver ถูกบันทึกตามเดิม

### Requirement: Proof never finalizes without receipts

ระบบ SHALL ไม่ประกาศ PROVEN เมื่อไม่มี required provider และ SHALL ระบุสาเหตุ missing-receipt-manifest ใน REPAIR

#### Scenario: finalize โดยไม่มี required provider

- **GIVEN** waiver เดิมทำให้ required providers ว่าง
- **WHEN** proof finalize
- **THEN** ไม่เขียน proof pass และรายงานว่าไม่มี receipt manifest

#### Scenario: proof ปกติ

- **GIVEN** มี required provider ที่ผ่าน
- **WHEN** proof finalize
- **THEN** เขียน proof pass พร้อม receipts ตามเดิม

### Requirement: Proof no-progress decisions are answered through advance

ระบบ SHALL บันทึก decision repair-no-progress ของ proof gate ที่ตัวเลือกไม่มีคำสั่งของตัวเองเป็น decision ที่ตอบได้ด้วย advance --decision

#### Scenario: ตัวเลือกมีคำสั่งตอบ

- **GIVEN** proof gate คืน ASK_USER repair-no-progress
- **WHEN** advance แสดง decision
- **THEN** แต่ละตัวเลือกมีคำสั่ง advance --decision พร้อม fingerprint

#### Scenario: ตอบ change-strategy

- **GIVEN** decision นั้นเป็น pending
- **WHEN** advance --decision change-strategy พร้อม decision-ref และ reason
- **THEN** คำตอบถูกบันทึกและ advance รอบนั้นคืน REPAIR จาก findings แทน ASK_USER เดิม

#### Scenario: ตอบ pause

- **GIVEN** decision นั้นเป็น pending
- **WHEN** advance --decision pause
- **THEN** change ถูกพักและคงหลักฐานทั้งหมด

#### Scenario: decision ที่ตัวเลือกมีคำสั่งเองคงเดิม

- **GIVEN** review route exhausted มีตัวเลือก accept-review-risk ที่มีคำสั่ง change waive
- **WHEN** advance แสดง decision
- **THEN** คำสั่งเดิมของตัวเลือกไม่ถูกแทน

#### Scenario: fingerprint ไม่ตรง

- **GIVEN** decision เปลี่ยนแล้ว
- **WHEN** advance --decision ด้วย fingerprint เก่า
- **THEN** ปฏิเสธว่า decision stale

### Requirement: Exhausted review infrastructure names its supported reset

ระบบ SHALL ระบุ claude-foundation authority reset-infra ใน recovery ของ REPAIR_REVIEW_INFRASTRUCTURE

#### Scenario: request หมด fallback

- **GIVEN** review request status infrastructure-exhausted
- **WHEN** advance
- **THEN** envelope REPAIR_REVIEW_INFRASTRUCTURE มีคำสั่ง authority reset-infra ของ change นั้นพร้อม --decision-ref

### Requirement: A review no reviewer can start says so

ระบบ SHALL ระบุใน WAIT ของ review ที่ requested แต่ไม่มี configured reviewer ที่รันได้ ว่าไม่มี reviewer ที่เริ่มได้ และคำสั่งที่ใช้บันทึก verdict หรือดูสถานะ

#### Scenario: ไม่มี authority run

- **GIVEN** review request requested และ router ไม่เสนอ authority run
- **WHEN** advance
- **THEN** reason ระบุว่าไม่มี configured reviewer ที่เริ่มได้ และ requestId กับคำสั่ง authority status

### Requirement: A gate pass another process recorded is not no progress

ระบบ SHALL ไม่ประกาศ no-progress เมื่อ proof cursor ถูกเขียนโดย gate pass อื่นหลังจากที่ advance ตัดสินใจรัน proof

#### Scenario: cursor เปลี่ยนหลังตัดสินใจ

- **GIVEN** advance B อ่าน cursor token ก่อนที่ advance A จะรัน gate ที่ fail จบ
- **WHEN** B รัน gate บนหลักฐานเดิม
- **THEN** ผลเป็น ACTION_REQUIRED ไม่ใช่ NO_PROGRESS_DECISION

#### Scenario: ไม่มี pass อื่นแทรก

- **GIVEN** token ตรงกับ cursor ปัจจุบัน
- **WHEN** gate fail ด้วย findings และ fingerprint เดิม
- **THEN** ยังได้ NO_PROGRESS_DECISION ตามเดิม

#### Scenario: advance ส่ง token

- **WHEN** advance เรียก proof ด้วย RUN_PROOF
- **THEN** proof ได้ cursor token ที่อ่านตอนตัดสินใจ

### Requirement: A transient proof-lock owner is still working

ระบบ SHALL รายงาน WORKING เมื่อ proof lock ถูกถือแต่ owner ยังอ่านไม่ได้หรือกำลัง initialize ภายในช่วง grace

#### Scenario: owner เป็น null

- **GIVEN** proof advance คืน IN_PROGRESS และ owner null
- **WHEN** advance แปลงผล
- **THEN** ได้ WORKING

#### Scenario: owner กำลัง initialize

- **GIVEN** owner state initializing และ recoverableAfter ยังไม่ถึง
- **WHEN** advance แปลงผล
- **THEN** ได้ WORKING

#### Scenario: owner ตายแล้ว

- **GIVEN** owner มี pid ของ process ที่ไม่มีชีวิต
- **WHEN** advance แปลงผล
- **THEN** ยังได้ REPAIR_PROOF_LOCK

### Requirement: proof-progress

ระบบ SHALL ให้ advance ที่ถูกเรียกขณะ proof ของ change เดียวกันกำลังรัน คืน WORKING พร้อม progress ที่ระบุ provider ใน wave ปัจจุบัน provider ที่จบแล้วพร้อม status และเวลา และเวลาที่ proof รันมาแล้ว

#### Scenario: progress ระหว่างรัน

- **GIVEN** proof ของ change กำลังรัน provider test โดย discovery จบแล้ว
- **WHEN** agent รัน advance อีกครั้ง
- **THEN** ผลลัพธ์ WORKING มี progress ที่ระบุ test เป็น provider ที่กำลังรัน และเวลาที่ผ่านไปเป็นมิลลิวินาที

#### Scenario: provider ที่จบแล้ว

- **GIVEN** provider lint จบด้วย pass ใน wave แรก
- **WHEN** agent รัน advance ระหว่าง wave ที่สอง
- **THEN** progress ระบุ lint เป็น pass พร้อม durationMs

#### Scenario: สถานะเดิมไม่เปลี่ยน

- **GIVEN** proof ที่มี progress บันทึกไว้
- **WHEN** harness ตรวจ proof ที่ค้างหลัง process ตาย
- **THEN** status, stage และ workspaceHash ของ record เหมือนเดิมและการกู้คืนทำงานเหมือนเดิม

### Requirement: narrow-discrimination

ระบบ SHALL ให้การตรวจว่า test ล้มบนโค้ดเดิมรัน segment ของ provider ตั้งแต่ segment แรกจนถึง segment สุดท้ายที่ระบุ test file ที่เปลี่ยน เมื่อ provider บันทึก segment ไว้และทุก test file ที่เปลี่ยนมี segment ในช่วงนั้นระบุชื่อ และ SHALL รันทั้งคำสั่งเหมือนเดิมเมื่อจับคู่ไม่ได้ชัดเจน

#### Scenario: รันถึง segment สุดท้ายที่ test เปลี่ยน

- **GIVEN** provider test มี segment ของสาม task และมีเพียง test ของ task ที่สองที่เปลี่ยน
- **WHEN** harness ตรวจ test บนโค้ดเดิม
- **THEN** รัน segment ของ task ที่หนึ่งและสอง และไม่รัน segment ของ task ที่สาม

#### Scenario: ขั้นเตรียมก่อนหน้ายังรัน

- **GIVEN** segment แรกเป็นคำสั่ง build และ segment ที่สองรัน test ที่เปลี่ยน
- **WHEN** harness ตรวจ test บนโค้ดเดิม
- **THEN** รัน build ก่อน test

#### Scenario: จับคู่ไม่ได้รันทั้งหมด

- **GIVEN** มี test file ที่เปลี่ยนที่ไม่ปรากฏใน segment ใดเลย
- **WHEN** harness ตรวจ test บนโค้ดเดิม
- **THEN** รันทั้งคำสั่งของ provider เหมือนเดิม

#### Scenario: ไม่มี segment ใช้แบบเดิม

- **GIVEN** provider ที่ไม่มีข้อมูล segment เช่นของ change เก่า
- **WHEN** harness ตรวจ test บนโค้ดเดิม
- **THEN** ใช้วิธีเดิมโดยไม่มีข้อผิดพลาด

### Requirement: Test discrimination ตัดสินรายไฟล์ test

ระบบ SHALL ส่ง REPAIR เมื่อไฟล์ test ที่ผูกกับ scenario ที่ไม่ใช่ regression ผ่านบนโค้ดเดิม

- รันไฟล์ test ที่เปลี่ยนแต่ละไฟล์บนโค้ดเดิมแยกกันเมื่อ runner รับไฟล์ได้
- runner ที่รับไฟล์ไม่ได้รันคำสั่งรวมครั้งเดียวเหมือนเดิม
- ผลแต่ละไฟล์ cache ตาม digest เดิม
- ไฟล์ test ที่ผูกไว้แต่ไม่มีใน workspace ตอน Prove เป็น REPAIR

#### Scenario: test ที่ไม่ทดสอบซ่อนหลังไฟล์อื่น

- **GIVEN** ไฟล์ test a.test.mjs ล้มบนโค้ดเดิม และ b.test.mjs ซึ่งผูกกับ scenario ที่ไม่ใช่ regression ผ่านบนโค้ดเดิม
- **WHEN** agent รัน advance --through proven
- **THEN** ได้ REPAIR tests-not-discriminating ที่ระบุ b.test.mjs และ scenario ของมัน
- **AND** REPAIR ไม่ระบุ a.test.mjs

#### Scenario: ทุกไฟล์ล้มบนโค้ดเดิม

- **GIVEN** ไฟล์ test ที่เปลี่ยนทุกไฟล์ล้มบนโค้ดเดิม
- **WHEN** agent รัน advance --through proven
- **THEN** ไม่มี finding ของ test discrimination

#### Scenario: ไฟล์ของ scenario regression ผ่านบนโค้ดเดิม

- **GIVEN** b.test.mjs ผูกกับ scenario ที่ประกาศ regression: true เท่านั้นและผ่านบนโค้ดเดิม
- **WHEN** agent รัน advance --through proven
- **THEN** ไม่มี finding สำหรับ b.test.mjs

#### Scenario: ไฟล์ test ที่ผูกไว้ไม่มีอยู่

- **GIVEN** scenario ผูกกับ tests/config.test.mjs ที่ไม่มีใน workspace
- **WHEN** agent รัน advance --through proven
- **THEN** ได้ REPAIR ที่ระบุ scenario และ path tests/config.test.mjs

#### Scenario: runner รับไฟล์ไม่ได้

- **GIVEN** provider test ใช้ runner ที่รับไฟล์เป็น argument ไม่ได้
- **WHEN** harness ตรวจ discrimination
- **THEN** รันคำสั่งรวมครั้งเดียวเหมือนเดิม
- **AND** ผลบันทึก scoped เป็น false

#### Scenario: รันซ้ำโดยไม่เปลี่ยนอะไร

- **GIVEN** ผลรายไฟล์ของ workspace เดิมถูก cache แล้ว
- **WHEN** agent รัน advance --through proven ซ้ำ
- **THEN** ใช้ผลจาก cache โดยไม่รันไฟล์ test บนโค้ดเดิมอีก

### Requirement: Discrimination ที่ไม่มีคำตัดสินไม่ผ่านแบบเงียบ

ระบบ SHALL แสดงผล test discrimination ที่ไม่มีคำตัดสินของงานที่เปลี่ยนพฤติกรรมใน outcome ของ Prove และรายงาน Land

- repository ที่โค้ด product เปลี่ยนแต่ไม่มี test provider เป็น REPAIR
- unavailable และ timed-out ไม่ block แต่แสดงพร้อมเหตุผล

#### Scenario: ไม่มี test provider

- **GIVEN** งาน feature ที่ repository มีโค้ด product เปลี่ยนแต่ไม่มี test provider
- **WHEN** agent รัน advance --through proven
- **THEN** ได้ REPAIR ที่ระบุ repository และบอกให้เพิ่ม capability test

#### Scenario: รันบนโค้ดเดิมเกินเวลา

- **GIVEN** การรัน test บนโค้ดเดิมเกิน timeout ของ provider
- **WHEN** Prove ถึง proven
- **THEN** outcome ของ advance แสดงแถว discrimination ไม่มีคำตัดสิน เหตุผล timed-out
- **AND** รายงาน Land แสดงแถวเดียวกัน

#### Scenario: เตรียมโค้ดเดิมไม่ได้

- **GIVEN** git archive ของ base ล้มเหลว
- **WHEN** Prove ถึง proven
- **THEN** outcome และรายงาน Land แสดงแถวไม่มีคำตัดสิน เหตุผล unavailable

#### Scenario: มีคำตัดสิน

- **GIVEN** ทุก repository ได้ผล fails-on-base
- **WHEN** Prove ถึง proven
- **THEN** ไม่มีแถวไม่มีคำตัดสินใน outcome และรายงาน Land

### Requirement: no-test-file-not-judged

เมื่อรันไฟล์ที่เปลี่ยนรายไฟล์บนโค้ดเดิม ไฟล์ที่ไม่มี test จริง SHALL ไม่ถูกตัดสินว่าผ่านบนโค้ดเดิม

- ไม่มี test จริง: ผลสรุปบอก tests 0 หรือ test ที่ผ่านมีแค่บรรทัดของตัวไฟล์เอง
- ผลนี้ cache เหมือนผลอื่น

#### Scenario: helper คู่กับ test ที่ดี

- **GIVEN** test/cases.test.js ล้มบนโค้ดเดิม และ test/helpers.js ไม่มี test
- **WHEN** harness ตรวจ discrimination รายไฟล์
- **THEN** ไม่มี finding ของ test discrimination
- **AND** ไม่มีแถว no-verdict สำหรับ test/helpers.js

#### Scenario: test จริงที่ผ่านบนโค้ดเดิม

- **GIVEN** test/b.test.js มี test ที่ผ่านบนโค้ดเดิมและผูกกับ scenario ที่ไม่ใช่ regression
- **WHEN** harness ตรวจ discrimination รายไฟล์
- **THEN** ได้ REPAIR ที่ระบุ test/b.test.js เหมือนเดิม

#### Scenario: ผลของ runner

- **WHEN** ผลรันเป็นบรรทัดของตัวไฟล์เท่านั้นใน spec หรือ TAP หรือ tests 0
- **THEN** ถือว่าไม่มี test
- **AND** ผลที่มีชื่อ test อื่นหรืออ่านไม่ออกใช้ exit code เหมือนเดิม

### Requirement: node-test-force-exit

คำสั่ง node --test ที่ harness รันเป็น task verify, provider หรือ base run SHALL ได้ --test-force-exit

- ใช้กับ argv ที่ขึ้นต้นด้วย node หรือ path ของ node และมี --test
- ใช้กับบรรทัด shell ที่ขึ้นต้นด้วย node --test
- ไม่เพิ่มซ้ำถ้ามีอยู่แล้ว

#### Scenario: connection keep-alive ค้าง

- **GIVEN** task verify คือ node --test และ test ใช้ fetch กับ server ที่ไม่ได้ปิด connection
- **WHEN** advance รัน task verify
- **THEN** คำสั่งจบภายในไม่กี่วินาทีและ task ผ่าน

#### Scenario: test ล้ม

- **GIVEN** test ตัวหนึ่งล้มและ server ค้าง
- **WHEN** advance รัน task verify
- **THEN** คำสั่งจบเร็วและ task ล้ม

#### Scenario: คำสั่งอื่น

- **WHEN** verify เป็น npm test หรือมี --test-force-exit อยู่แล้ว
- **THEN** argv ไม่ถูกเปลี่ยน

### Requirement: bench-oracle-after-repair

runner ของ paid benchmark SHALL รัน oracle ซ้ำหลังรอบซ่อมทุกครั้งก่อนรายงานผล

#### Scenario: รอบซ่อมไม่มี envelope proven

- **GIVEN** oracle ล้ม และรอบซ่อมจบโดย envelope ไม่ได้ระบุ proven แต่ change ยัง proven
- **WHEN** runner จบ loop ซ่อม
- **THEN** oracle ถูกรันซ้ำ และผลนั้นคือผลที่รายงาน

### Requirement: tracker-tests-exist-no-count

ตัวตรวจผลของ project-tracker-api SHALL ให้ CASE_TESTS_EXIST ผ่านเมื่อ test ที่ส่งมาผ่านบนโค้ดใหม่ มีอย่างน้อยหนึ่งตัว และล้มบน src ของ seed โดยไม่มีจำนวนขั้นต่ำอื่น

#### Scenario: test น้อยตัวที่ตรวจจริง

- **GIVEN** reference solution กับ test ตัวเดียวที่ล้มบน src ของ seed
- **WHEN** รันตัวตรวจผล
- **THEN** CASE_TESTS_EXIST เป็น pass

#### Scenario: test ที่ไม่ตรวจอะไร

- **GIVEN** reference solution กับ test ที่ผ่านบน src ของ seed ด้วย
- **WHEN** รันตัวตรวจผล
- **THEN** CASE_TESTS_EXIST เป็น fail

#### Scenario: ไม่มี test

- **GIVEN** reference solution ที่ไม่มีไฟล์ test
- **WHEN** รันตัวตรวจผล
- **THEN** CASE_TESTS_EXIST เป็น fail
