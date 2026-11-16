# prove

## ADDED Requirements

### Requirement: Test discrimination ตัดสินรายไฟล์ test

ระบบ SHALL ส่ง REPAIR เมื่อไฟล์ test ที่ผูกกับ scenario ที่ไม่ใช่ regression ผ่านบนโค้ดเดิม

- รันไฟล์ test ที่เปลี่ยนแต่ละไฟล์บนโค้ดเดิมแยกกันเมื่อ runner รับไฟล์ได้
- runner ที่รับไฟล์ไม่ได้รันคำสั่งรวมครั้งเดียวเหมือนเดิม
- ผลแต่ละไฟล์ cache ตาม digest เดิม
- ไฟล์ test ที่ผูกไว้แต่ไม่มีใน workspace ตอน Prove เป็น REPAIR

#### Scenario: test ที่ไม่ทดสอบซ่อนหลังไฟล์อื่น

- **GIVEN** ไฟล์ test a.test.mjs ล้มบนโค้ดเดิม และ b.test.mjs ซึ่งผูกกับ scenario ที่ไม่ใช่ regression ผ่านบนโค้ดเดิม
- **WHEN** agent รัน advance --through proven
- **THEN** ได้ REPAIR tests-not-discriminating ที่ระบุ b.test.mjs และ scenario ของมัน
- **AND** REPAIR ไม่ระบุ a.test.mjs

#### Scenario: ทุกไฟล์ล้มบนโค้ดเดิม

- **GIVEN** ไฟล์ test ที่เปลี่ยนทุกไฟล์ล้มบนโค้ดเดิม
- **WHEN** agent รัน advance --through proven
- **THEN** ไม่มี finding ของ test discrimination

#### Scenario: ไฟล์ของ scenario regression ผ่านบนโค้ดเดิม

- **GIVEN** b.test.mjs ผูกกับ scenario ที่ประกาศ regression: true เท่านั้นและผ่านบนโค้ดเดิม
- **WHEN** agent รัน advance --through proven
- **THEN** ไม่มี finding สำหรับ b.test.mjs

#### Scenario: ไฟล์ test ที่ผูกไว้ไม่มีอยู่

- **GIVEN** scenario ผูกกับ tests/config.test.mjs ที่ไม่มีใน workspace
- **WHEN** agent รัน advance --through proven
- **THEN** ได้ REPAIR ที่ระบุ scenario และ path tests/config.test.mjs

#### Scenario: runner รับไฟล์ไม่ได้

- **GIVEN** provider test ใช้ runner ที่รับไฟล์เป็น argument ไม่ได้
- **WHEN** harness ตรวจ discrimination
- **THEN** รันคำสั่งรวมครั้งเดียวเหมือนเดิม
- **AND** ผลบันทึก scoped เป็น false

#### Scenario: รันซ้ำโดยไม่เปลี่ยนอะไร

- **GIVEN** ผลรายไฟล์ของ workspace เดิมถูก cache แล้ว
- **WHEN** agent รัน advance --through proven ซ้ำ
- **THEN** ใช้ผลจาก cache โดยไม่รันไฟล์ test บนโค้ดเดิมอีก

### Requirement: Discrimination ที่ไม่มีคำตัดสินไม่ผ่านแบบเงียบ

ระบบ SHALL แสดงผล test discrimination ที่ไม่มีคำตัดสินของงานที่เปลี่ยนพฤติกรรมใน outcome ของ Prove และรายงาน Land

- repository ที่โค้ด product เปลี่ยนแต่ไม่มี test provider เป็น REPAIR
- unavailable และ timed-out ไม่ block แต่แสดงพร้อมเหตุผล

#### Scenario: ไม่มี test provider

- **GIVEN** งาน feature ที่ repository มีโค้ด product เปลี่ยนแต่ไม่มี test provider
- **WHEN** agent รัน advance --through proven
- **THEN** ได้ REPAIR ที่ระบุ repository และบอกให้เพิ่ม capability test

#### Scenario: รันบนโค้ดเดิมเกินเวลา

- **GIVEN** การรัน test บนโค้ดเดิมเกิน timeout ของ provider
- **WHEN** Prove ถึง proven
- **THEN** outcome ของ advance แสดงแถว discrimination ไม่มีคำตัดสิน เหตุผล timed-out
- **AND** รายงาน Land แสดงแถวเดียวกัน

#### Scenario: เตรียมโค้ดเดิมไม่ได้

- **GIVEN** git archive ของ base ล้มเหลว
- **WHEN** Prove ถึง proven
- **THEN** outcome และรายงาน Land แสดงแถวไม่มีคำตัดสิน เหตุผล unavailable

#### Scenario: มีคำตัดสิน

- **GIVEN** ทุก repository ได้ผล fails-on-base
- **WHEN** Prove ถึง proven
- **THEN** ไม่มีแถวไม่มีคำตัดสินใน outcome และรายงาน Land
