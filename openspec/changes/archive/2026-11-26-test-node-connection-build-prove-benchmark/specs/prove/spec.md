# prove

## ADDED Requirements

### Requirement: node-test-force-exit

คำสั่ง node --test ที่ harness รันเป็น task verify, provider หรือ base run SHALL ได้ --test-force-exit

- ใช้กับ argv ที่ขึ้นต้นด้วย node หรือ path ของ node และมี --test
- ใช้กับบรรทัด shell ที่ขึ้นต้นด้วย node --test
- ไม่เพิ่มซ้ำถ้ามีอยู่แล้ว

#### Scenario: connection keep-alive ค้าง

- **GIVEN** task verify คือ node --test และ test ใช้ fetch กับ server ที่ไม่ได้ปิด connection
- **WHEN** advance รัน task verify
- **THEN** คำสั่งจบภายในไม่กี่วินาทีและ task ผ่าน

#### Scenario: test ล้ม

- **GIVEN** test ตัวหนึ่งล้มและ server ค้าง
- **WHEN** advance รัน task verify
- **THEN** คำสั่งจบเร็วและ task ล้ม

#### Scenario: คำสั่งอื่น

- **WHEN** verify เป็น npm test หรือมี --test-force-exit อยู่แล้ว
- **THEN** argv ไม่ถูกเปลี่ยน

### Requirement: bench-oracle-after-repair

runner ของ paid benchmark SHALL รัน oracle ซ้ำหลังรอบซ่อมทุกครั้งก่อนรายงานผล

#### Scenario: รอบซ่อมไม่มี envelope proven

- **GIVEN** oracle ล้ม และรอบซ่อมจบโดย envelope ไม่ได้ระบุ proven แต่ change ยัง proven
- **WHEN** runner จบ loop ซ่อม
- **THEN** oracle ถูกรันซ้ำ และผลนั้นคือผลที่รายงาน
