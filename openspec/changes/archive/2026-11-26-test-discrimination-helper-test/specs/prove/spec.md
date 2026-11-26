# prove

## ADDED Requirements

### Requirement: no-test-file-not-judged

เมื่อรันไฟล์ที่เปลี่ยนรายไฟล์บนโค้ดเดิม ไฟล์ที่ไม่มี test จริง SHALL ไม่ถูกตัดสินว่าผ่านบนโค้ดเดิม

- ไม่มี test จริง: ผลสรุปบอก tests 0 หรือ test ที่ผ่านมีแค่บรรทัดของตัวไฟล์เอง
- ผลนี้ cache เหมือนผลอื่น

#### Scenario: helper คู่กับ test ที่ดี

- **GIVEN** test/cases.test.js ล้มบนโค้ดเดิม และ test/helpers.js ไม่มี test
- **WHEN** harness ตรวจ discrimination รายไฟล์
- **THEN** ไม่มี finding ของ test discrimination
- **AND** ไม่มีแถว no-verdict สำหรับ test/helpers.js

#### Scenario: test จริงที่ผ่านบนโค้ดเดิม

- **GIVEN** test/b.test.js มี test ที่ผ่านบนโค้ดเดิมและผูกกับ scenario ที่ไม่ใช่ regression
- **WHEN** harness ตรวจ discrimination รายไฟล์
- **THEN** ได้ REPAIR ที่ระบุ test/b.test.js เหมือนเดิม

#### Scenario: ผลของ runner

- **WHEN** ผลรันเป็นบรรทัดของตัวไฟล์เท่านั้นใน spec หรือ TAP หรือ tests 0
- **THEN** ถือว่าไม่มี test
- **AND** ผลที่มีชื่อ test อื่นหรืออ่านไม่ออกใช้ exit code เหมือนเดิม
