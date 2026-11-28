# change

## ADDED Requirements

### Requirement: change-id-from-draft-name

change start SHALL ตั้งชื่อ change จากชื่อโฟลเดอร์หรือไฟล์ draft เมื่อ draft ไม่มี id และ intent มีตัวอักษรนอก ASCII

- draft ที่เป็นไฟล์ change.json ใช้ชื่อโฟลเดอร์ที่ครอบ ไฟล์ .json อื่นใช้ชื่อไฟล์
- ชื่อ draft ทั่วไป (draft, change, new, tmp) ไม่ถูกใช้
- intent ภาษาอังกฤษล้วนได้ชื่อจาก intent เหมือนเดิม
- id ที่ draft ระบุชนะเสมอ

#### Scenario: intent ไทยปนอังกฤษ

- **GIVEN** draft โฟลเดอร์ polyglot-build-setup ที่ intent เป็น Build ติดตั้ง dependency จาก lockfile ของ PHP
- **WHEN** change start
- **THEN** ชื่อ change คือ polyglot-build-setup

#### Scenario: intent อังกฤษ

- **GIVEN** draft subtract.json ที่ intent เป็น Calc exports subtract that returns a minus b
- **WHEN** change start
- **THEN** ชื่อ change คือ calc-exports-subtract-that-returns-a-minus-b

#### Scenario: ชื่อ draft ทั่วไป

- **GIVEN** draft .foundation/drafts/draft.json ที่ intent เป็นภาษาไทย
- **WHEN** change start
- **THEN** ใช้ชื่อจาก intent และ requirement แบบเดิม

#### Scenario: id ระบุเอง

- **GIVEN** draft มี id my-change และ intent ภาษาไทย
- **WHEN** change start
- **THEN** ชื่อ change คือ my-change
