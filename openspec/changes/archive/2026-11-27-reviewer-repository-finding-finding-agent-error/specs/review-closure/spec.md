# review-closure

## ADDED Requirements

### Requirement: outside-scope-finding-is-repairable

finding ของ reviewer ที่ชี้ไฟล์ที่มีอยู่จริงใน workspace ของ repository root แต่ไม่ตรงกับ review scope SHALL ถูกรับเป็น finding ปกติที่มี outsideScope true และข้อความบอกให้ขยาย paths ของ task ก่อนซ่อม

- ใช้เมื่อ path ไม่ตรงกับ scope ใดเลย (ศูนย์รายการ) เท่านั้น ชื่อที่ตรงหลายรายการยังเป็น issue
- ไฟล์ต้องมีอยู่จริงใน workspace root และ line ต้องอยู่ในไฟล์
- path ของ finding ถูกบันทึกเป็น root/<path>

#### Scenario: ไฟล์จริงนอก scope

- **GIVEN** review scope มีแค่ root/a.js และ reviewer รายงาน major ที่ b.js ซึ่งมีอยู่ใน workspace
- **WHEN** ระบบตรวจผลรีวิว
- **THEN** ผลรีวิวเป็น fail ปกติ finding มี path root/b.js และ outsideScope true

#### Scenario: ไฟล์ที่ไม่มีอยู่

- **GIVEN** reviewer รายงาน finding ที่ missing.js ซึ่งไม่มีใน workspace
- **WHEN** ระบบตรวจผลรีวิว
- **THEN** ยังเป็น issue ว่าอยู่นอก review scope

#### Scenario: ชื่อกำกวม

- **GIVEN** path ตรงกับ scope สองรายการ
- **WHEN** ระบบตรวจผลรีวิว
- **THEN** ยังเป็น issue ว่าอยู่นอก review scope
