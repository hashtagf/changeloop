# change-validation

## MODIFIED Requirements

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
