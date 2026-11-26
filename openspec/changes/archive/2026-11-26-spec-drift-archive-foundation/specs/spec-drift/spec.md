# spec-drift

## ADDED Requirements

### Requirement: drift-path-accuracy

spec-drift SHALL ไม่รายงาน missing-file สำหรับ path ที่ไม่ใช่ไฟล์ของโปรเจกต์หรือ change ที่ archive แล้ว

#### Scenario: change ที่ archive แล้ว

- **GIVEN** tasks.md อ้าง openspec/changes/foo/** และ foo อยู่ที่ openspec/changes/archive/2026-01-01-foo
- **WHEN** รัน spec-drift
- **THEN** path นั้นนับว่ามีอยู่

#### Scenario: ข้อความ ... ไม่ใช่ path

- **GIVEN** paths ใน tasks.md มี '...'
- **WHEN** รัน spec-drift
- **THEN** '...' ไม่อยู่ใน files หรือ missing

#### Scenario: state ใต้ .foundation

- **GIVEN** paths มี .foundation/adapter-manifests
- **WHEN** รัน spec-drift
- **THEN** path นั้นไม่ถูกตรวจและไม่อยู่ใน missing

#### Scenario: path ออกนอกโปรเจกต์

- **GIVEN** paths มี ../outside.mjs หรือ /etc/passwd
- **WHEN** รัน spec-drift
- **THEN** path นั้นอยู่ใน outside ไม่ถูกตรวจว่ามีอยู่ และ requirement เป็น missing-file

#### Scenario: archive วันเดียวกัน

- **GIVEN** มี archive สองชุดวันเดียวกันที่เขียน requirement เดียวกัน
- **WHEN** รัน spec-drift
- **THEN** origin เป็นชุดที่ archive ทีหลังตามเวลาแก้ไขโฟลเดอร์ล่าสุด
