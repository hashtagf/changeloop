# sandbox

## ADDED Requirements

### Requirement: change-phase-edits-signal

เมื่อสร้างพื้นที่แยก ระบบ SHALL ส่ง signal change-phase-target-edits ที่ระบุไฟล์ product ที่เปลี่ยนในโปรเจกต์หลัง change start

- ไม่นับ .foundation/, openspec/changes/, openspec/investigations/
- โปรเจกต์มี git เทียบกับ preexisting, ไม่มี git เทียบกับ digest ที่เก็บตอน change start

#### Scenario: โปรเจกต์ไม่มี git

- **GIVEN** change start ในโปรเจกต์ไม่มี git แล้วมีการเขียน src/coupons.js และแก้ src/checkout.js
- **WHEN** advance --through build สร้างพื้นที่แยก
- **THEN** envelope มี signal change-phase-target-edits ที่ระบุ src/checkout.js และ src/coupons.js
- **AND** ข้อความบอกให้แก้ในพื้นที่แยกเท่านั้น และห้ามลบ ย้อน หรือแก้ในโปรเจกต์

#### Scenario: โปรเจกต์มี git

- **GIVEN** change start ในโปรเจกต์มี git แล้วมีการเขียนไฟล์ product ใหม่
- **WHEN** สร้างพื้นที่แยก
- **THEN** signal ระบุไฟล์นั้น

#### Scenario: ไม่มีการเขียนก่อน Build

- **WHEN** สร้างพื้นที่แยกโดยไม่มีไฟล์ product เปลี่ยนหลัง change start
- **THEN** ไม่มี signal change-phase-target-edits

#### Scenario: ไฟล์ที่แก้อยู่แล้วก่อน change start

- **GIVEN** ไฟล์ product ถูกแก้ค้างไว้ก่อน change start และไม่เปลี่ยนอีก
- **WHEN** สร้างพื้นที่แยก
- **THEN** ไม่มี signal สำหรับไฟล์นั้น

#### Scenario: ไฟล์ของ harness

- **WHEN** มีแค่ไฟล์ใต้ .foundation/ หรือ openspec/changes/ เปลี่ยน
- **THEN** ไม่มี signal

#### Scenario: agent ทำตาม signal แล้ว Land ผ่าน

- **GIVEN** โปรเจกต์ไม่มี git ที่มีไฟล์จากขั้น Change และ agent ไม่แตะไฟล์ในโปรเจกต์
- **WHEN** prove แล้ว Land
- **THEN** ไม่มี isolated-copy conflict และโปรเจกต์ได้เนื้อหาจากพื้นที่แยก

### Requirement: bench-spec-approval

paid benchmark lane ของ Change Loop SHALL ส่งข้อความอนุมัติสเปกที่ชัดเจนพร้อม decision ref benchmark:spec-approval

#### Scenario: lane ที่อนุญาต self-review

- **WHEN** สร้างข้อความสิทธิ์ของ lane ที่อนุญาต self-review และ Land
- **THEN** ข้อความมีการอนุมัติสเปกพร้อม decision ref benchmark:spec-approval

#### Scenario: ไม่มีสิทธิ์

- **WHEN** สร้างข้อความสิทธิ์โดยไม่มีการอนุญาต
- **THEN** ไม่มีข้อความอนุมัติสเปก
