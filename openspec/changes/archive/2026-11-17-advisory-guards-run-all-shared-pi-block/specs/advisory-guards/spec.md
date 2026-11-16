# advisory-guards

## ADDED Requirements

### Requirement: advisory-tests-gated

default gate SHALL รัน advisory-guards-docs.test.mjs และเทสต์ shared Pi ที่ตรวจการปฏิเสธ SHALL รันในโหมด block

#### Scenario: gate ผ่าน

- **WHEN** รัน test-registration และ pi-shared test
- **THEN** ทั้งสองผ่าน

### Requirement: release-status-exception

รายงานสถานะ release SHALL บันทึกว่า v3.7.5 ไม่มี paid smoke และออกโดยข้อยกเว้นของเจ้าของ

#### Scenario: รายงานมีข้อยกเว้น

- **WHEN** อ่าน docs/reports/user-scenario-release-status.md
- **THEN** มีหัวข้อ v3.7.5 candidate ที่ระบุ no paid smoke
