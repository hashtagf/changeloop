# prove

## ADDED Requirements

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
