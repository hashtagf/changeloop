# review-closure

## ADDED Requirements

### Requirement: minor-outside-scope-recorded

การบันทึกผลรีวิวรอบแก้ SHALL หยุดเฉพาะเมื่อข้อทักนอกขอบเขตที่ส่งให้รีวิวมีระดับ blocker หรือ major

- ข้อทัก minor นอกขอบเขตถูกเก็บไว้ในผลรีวิวพร้อมข้อทักอื่น
- ข้อทักที่ไม่มี path ถือว่าอยู่นอกขอบเขต
- ผลรีวิว pass ที่มีแต่ข้อทัก minor นอกขอบเขตบันทึกเป็น pass

#### Scenario: minor นอกขอบเขต

- **GIVEN** รีวิวรอบแก้ปิดข้อเดิมครบและรายงาน minor F-OUT ที่ outside.txt ซึ่งอยู่นอกขอบเขต
- **WHEN** บันทึกผลรีวิว
- **THEN** ผลถูกบันทึกเป็น pass และเก็บ F-OUT ไว้

#### Scenario: major นอกขอบเขต

- **GIVEN** รีวิวรอบแก้รายงาน major F-OUT ที่ outside.txt
- **WHEN** บันทึกผลรีวิว
- **THEN** หยุดพร้อมข้อความ outside the dispatched correction scope

#### Scenario: minor ไม่มี path

- **GIVEN** รีวิวรอบแก้รายงาน minor ที่ไม่มี path
- **WHEN** บันทึกผลรีวิว
- **THEN** ผลถูกบันทึก
