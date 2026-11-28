# quality-tooling

## ADDED Requirements

### Requirement: quality-source-sandbox

quality run, quality doctor และ quality baseline SHALL ใช้ quality/foundation-quality.json และ quality/baselines ใน root workspace ของ change ที่ active เมื่อ workspace นั้นยังไม่ apply และมีไฟล์ตั้งค่า

- change ที่ active มาจาก --change หรือ FOUNDATION_CHANGE_ID
- ไม่มี change, workspace apply แล้ว หรือ sandbox ไม่มีไฟล์ตั้งค่า ใช้ project root
- quality baseline --write เขียน baseline และ manifest ลง sandbox ของ change จึง land ไปพร้อม change
- ผลรันและ history ของ lane ยังเขียนที่ .foundation/quality ของ project root

#### Scenario: lane ใหม่ใน sandbox

- **GIVEN** sandbox ของ change a เพิ่ม lane lint ที่ project root ไม่มี
- **WHEN** รัน quality run --change a --capability lint
- **THEN** lane lint รันและผ่าน

#### Scenario: baseline ลง sandbox

- **GIVEN** lane lint ของ change a รันแล้ว
- **WHEN** รัน quality baseline --write --change a
- **THEN** baseline และ manifest อยู่ใน sandbox และ project root ไม่มี baseline นั้น

#### Scenario: ไม่มี change

- **GIVEN** sandbox ของ change a แก้ไฟล์ตั้งค่า
- **WHEN** รัน quality run โดยไม่มี change
- **THEN** ใช้ไฟล์ตั้งค่าของ project root

#### Scenario: sandbox ไม่มีไฟล์ตั้งค่า

- **GIVEN** change a อยู่ใน sandbox ที่ไม่มี quality/foundation-quality.json
- **WHEN** รัน quality run --change a
- **THEN** ใช้ไฟล์ตั้งค่าของ project root

#### Scenario: baseline ใน sandbox ถดถอย

- **GIVEN** baseline lint ใน sandbox ของ change a ไม่มี finding
- **WHEN** lane lint ของ change a พบ finding ใหม่
- **THEN** lane lint fail
