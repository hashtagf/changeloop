# approval-package

## ADDED Requirements

### Requirement: legacy-prototype-sync

คำสั่ง package SHALL คง prototype.sync ให้เครื่องมือเดิมอ่านได้โดยไม่ปะปนกับสถานะ approval.html

#### Scenario: เครื่องมือเดิมอ่านสถานะต้นแบบ

- **GIVEN** change เดิมมี snapshot ของต้นแบบและมีหน้าอนุมัติแยกกัน
- **WHEN** รัน package หลังอัปเกรด
- **THEN** prototype.sync คืนสถานะและ drift ของต้นแบบ และ approvalPage.sync ตรวจเฉพาะหน้าอนุมัติ

#### Scenario: ไม่มีต้นแบบ

- **GIVEN** มีหน้าอนุมัติแต่ draft ไม่ได้ระบุต้นแบบ
- **WHEN** รัน package
- **THEN** prototype.sync ยังคงอยู่และรายงาน file เป็น none ไม่ใช้สถานะของหน้าอนุมัติ

#### Scenario: ต้นแบบเปลี่ยนหลังบันทึก

- **GIVEN** ระบบบันทึก snapshot ของต้นแบบและหน้าอนุมัติใน change ปัจจุบัน
- **WHEN** แก้เฉพาะต้นแบบแล้วรัน package
- **THEN** prototype.sync รายงาน drift แต่ approvalPage.sync ไม่รายงาน drift
