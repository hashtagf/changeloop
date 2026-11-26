# change-validation Specification

## Purpose
TBD - created by archiving change fix-review-authority-guards-and-land-recovery-defects. Update Purpose after archive.
## Requirements
### Requirement: Spec wording lint runs at change validate

`change validate` SHALL run the OpenSpec strict validation for the change when the OpenSpec CLI is available and SHALL fail with the reported findings, so that normative-wording defects surface before Prove instead of inside `openspec archive`; when the CLI is absent, validate SHALL warn and continue.

#### Scenario: Missing SHALL fails validate

- **WHEN** a change's spec delta lacks SHALL/MUST wording and the OpenSpec CLI is installed
- **THEN** `change validate` fails and reports the strict-validation findings

#### Scenario: Corrected wording passes

- **WHEN** the spec delta is corrected to strict-valid wording
- **THEN** `change validate` passes

#### Scenario: Absent CLI degrades to a warning

- **WHEN** the OpenSpec CLI is not installed
- **THEN** `change validate` warns about the skipped lint and does not fail for that reason

#### Scenario: Prove requires the OpenSpec CLI

- **WHEN** Prove-stage validation runs and the OpenSpec CLI is not installed
- **THEN** validation fails until the CLI is prepared
- **AND** the absent-CLI warning applies only before Prove
- **AND** a legacy rapid packet with skip_specs: true is not linted

### Requirement: Dependency-safe semantic validation is aggregated

`change validate` SHALL report every independent claim-contract defect in one
claim-layer result and every independent task-contract defect in one task-layer
result after the artifacts required by that layer are valid. It SHALL stop
before a dependent layer when its prerequisites cannot be parsed or trusted.

#### Scenario: Several claims are independently invalid

- **WHEN** multiple evidence claims have invalid impact, repository scope, or
  cross-repository capability declarations
- **THEN** one validation invocation reports every affected claim and defect

#### Scenario: Several tasks are independently invalid

- **WHEN** multiple tasks reference unknown or out-of-scope claims or invalid
  repository/path scopes
- **THEN** one validation invocation reports every affected task and defect

#### Scenario: A prerequisite artifact is malformed

- **WHEN** a semantic layer cannot safely read its prerequisite artifact
- **THEN** validation stops at that prerequisite instead of cascading derived
  errors from later layers

### Requirement: Critical-case wiring is executable before Build

Change validation SHALL reject a provider that declares critical cases when its adapter, report format, or configured report path cannot produce per-case observations, and SHALL name a supported correction before Build begins.

#### Scenario: Plain command cannot report declared cases

- **WHEN** a provider declares critical cases but exposes only an unstructured exit code
- **THEN** validation fails and names a structured report or capable adapter route

#### Scenario: Supported structured report is configured

- **WHEN** the adapter and report format can produce every declared critical-case observation
- **THEN** validation accepts the wiring while runtime results remain responsible for pass, fail, skipped, and missing status

### Requirement: provider-config-approval

ระบบ SHALL ไม่นับ config ของ provider ใน execution.yaml และ evidence.yaml เป็นส่วนของการอนุมัติ spec ยกเว้นชื่อของ provider และ claim ของ evidence ซึ่งยังเป็นส่วนของการอนุมัติ

#### Scenario: แก้ timeoutMs

- **GIVEN** change ที่อนุมัติ spec แล้ว
- **WHEN** agent แก้ timeoutMs ของ provider test
- **THEN** การอนุมัติยังอยู่ และ receipt ของ provider test ต้องรันใหม่

#### Scenario: ถอด provider

- **GIVEN** change ที่อนุมัติ spec แล้ว
- **WHEN** agent ถอด provider test ออก
- **THEN** harness ขออนุมัติ spec ใหม่

#### Scenario: แก้ claim

- **GIVEN** change ที่อนุมัติ spec แล้ว
- **WHEN** agent แก้ capability ของ claim ใน evidence.yaml
- **THEN** harness ขออนุมัติ spec ใหม่

### Requirement: Scenario ของงานที่เปลี่ยนพฤติกรรมผูกกับไฟล์ test

ระบบ SHALL ส่ง EDIT เมื่อ scenario ของงานที่เปลี่ยนพฤติกรรมไม่ผูกกับไฟล์ test

- ผูกได้ผ่านแถว testMap ที่ระบุชื่อ scenario หรือ claim id พร้อม file
- หรือ path ที่เป็น test ใน paths ของ task ที่ covers requirement นั้น
- ใช้กับ change start, change revise และ requirement ที่ amendment เพิ่ม
- การผูกถูกบันทึกให้ Prove ใช้

#### Scenario: ทุก scenario ผูกไฟล์ test

- **GIVEN** draft feature ที่ทุก scenario มีแถว testMap หรือ task ที่ covers มี path tests/config.test.mjs
- **WHEN** agent รัน change start
- **THEN** ไม่มี issue เรื่องการผูก test
- **AND** การผูก scenario กับไฟล์ test ถูกบันทึกใน runtime state

#### Scenario: scenario ไม่มีไฟล์ test

- **GIVEN** draft feature ที่ task ซึ่ง covers requirement มี paths แค่ src/** และไม่มีแถว testMap ของ scenario ค่า default
- **WHEN** agent รัน change start
- **THEN** ได้ EDIT ที่ระบุชื่อ scenario และ requirement
- **AND** EDIT บอกให้เพิ่มแถว testMap หรือ test path ใน task

#### Scenario: งาน behavior-neutral ไม่ต้องผูก

- **GIVEN** draft workType refactor ที่ไม่มีไฟล์ test
- **WHEN** agent รัน change start
- **THEN** ไม่มี issue เรื่องการผูก test

#### Scenario: amendment เพิ่ม scenario ที่ไม่ผูก

- **GIVEN** change ที่ approve แล้ว
- **WHEN** amendment เพิ่ม requirement ที่ scenario ไม่มีไฟล์ test
- **THEN** change amend ส่ง EDIT ที่ระบุ scenario นั้น

### Requirement: Verify ของ task ที่แก้โค้ด product ต้องรัน test

ระบบ SHALL ส่ง EDIT เมื่อ verify ของ task ที่แก้โค้ด product ในงานที่เปลี่ยนพฤติกรรมไม่รัน test

- คำสั่งไม่มีผล เช่น true, :, exit 0, echo เป็น EDIT เสมอ
- คำสั่งที่ตรวจแค่ lint, format หรือ typecheck เป็น EDIT; คำสั่งที่อ้างไฟล์ test, เรียก test runner ที่รู้จัก หรือเป็นคำสั่งของโปรเจกต์อื่น (เช่น make check, sh scripts/check.sh) ผ่าน
- task ที่ paths เป็น test, docs หรือ manifest อย่างเดียวได้รับการยกเว้น
- ใช้กับ task ใน change start, revise และ task ที่ amendment เพิ่มหรือแก้ verify

#### Scenario: verify ไม่มีผล

- **GIVEN** task ที่ paths เป็น src/** และ verify เป็น true
- **WHEN** agent รัน change start
- **THEN** ได้ EDIT ที่ระบุ task และบอกว่า verify ต้องรัน test

#### Scenario: verify เป็น lint

- **GIVEN** task ที่ paths เป็น src/** และ verify เป็น npm run lint
- **WHEN** agent รัน change start
- **THEN** ได้ EDIT ที่ระบุ task นั้น

#### Scenario: verify อ้างไฟล์ test

- **GIVEN** task ที่ verify เป็น node --test tests/config.test.mjs
- **WHEN** agent รัน change start
- **THEN** ไม่มี issue เรื่องรูปแบบ verify

#### Scenario: verify เรียก test runner

- **GIVEN** task ที่ verify เป็น npm test
- **WHEN** agent รัน change start
- **THEN** ไม่มี issue เรื่องรูปแบบ verify

#### Scenario: task เอกสารอย่างเดียว

- **GIVEN** task ที่ paths เป็น docs/** และ verify เป็น npm run lint:docs
- **WHEN** agent รัน change start
- **THEN** ไม่มี issue เรื่องรูปแบบ verify

#### Scenario: amendment แก้ verify เป็น echo

- **GIVEN** change ที่อยู่ใน Build
- **WHEN** amendment updateTasks ตั้ง verify ของ task product เป็น echo ok
- **THEN** change amend ส่ง EDIT ที่ระบุ task นั้น

### Requirement: task-only-amend-verify

change amend ที่มีแค่การแก้ task SHALL ตรวจ verify shape และ verify path ของ task ที่เพิ่มหรือแก้ verify เหมือน amendment ที่มี requirement

#### Scenario: updateTasks ตั้ง verify เป็น no-op

- **GIVEN** change ที่ task implement แก้ src/**
- **WHEN** amend ด้วย updateTasks ตั้ง verify ของ implement เป็น true
- **THEN** amend ล้มเหลวพร้อมข้อความว่า verify runs no test และ tasks.md ไม่เปลี่ยน

#### Scenario: addTasks verify lint อย่างเดียว

- **WHEN** amend ด้วย addTasks ที่แก้ src/** และ verify เป็น npm run lint
- **THEN** amend ล้มเหลวและ contract revision ไม่เปลี่ยน

#### Scenario: verify อ้างไฟล์ test ที่ไม่มี

- **WHEN** amend ด้วย updateTasks ตั้ง verify เป็น node --test test/missing.test.mjs ที่ไม่มีและไม่มี task สร้าง
- **THEN** amend ล้มเหลวพร้อมชื่อไฟล์

#### Scenario: verify ที่รัน test ผ่าน

- **WHEN** amend ด้วย updateTasks ตั้ง verify เป็น npm test
- **THEN** amend สำเร็จ

#### Scenario: แก้ covers อย่างเดียวไม่ถูกตรวจ verify

- **WHEN** amend ด้วย updateTasks ที่แก้แค่ covers
- **THEN** ไม่มีการตรวจ verify shape และ amend ดำเนินต่อตามเดิม
