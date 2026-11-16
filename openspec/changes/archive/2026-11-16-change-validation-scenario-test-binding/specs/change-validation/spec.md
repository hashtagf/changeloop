# change-validation

## ADDED Requirements

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
- verify ต้องอ้างไฟล์ test หรือเรียก test runner ที่รู้จัก
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
