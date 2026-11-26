# change-validation

## ADDED Requirements

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
