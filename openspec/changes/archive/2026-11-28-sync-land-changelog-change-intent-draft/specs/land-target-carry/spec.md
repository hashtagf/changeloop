# land-target-carry

## ADDED Requirements

### Requirement: union-merge-landed-replay

การ replay งานที่ land แล้วเข้า sandbox SHALL รวมแบบเก็บทั้งสองฝั่งสำหรับ path ที่ .gitattributes ของ target ระบุ merge=union หรือเป็นไฟล์ changelog ที่ไม่ได้ระบุ merge

- ไฟล์ changelog คือชื่อไฟล์ CHANGELOG*.md หรือ CHANGES.md ในโฟลเดอร์ใดก็ได้
- attribute merge ที่ระบุค่าอื่น (เช่น merge=binary หรือ -merge) ใช้การรวมแบบเดิม
- ผลที่รวมแล้วถูกบันทึกเหมือน clean merge จึง Land ได้โดยไม่ต้องให้ agent แก้

#### Scenario: CHANGELOG สองรายการ

- **GIVEN** change A land รายการใหม่ใต้ ## [Unreleased] และ change B เพิ่มรายการอื่นที่บรรทัดเดียวกันใน sandbox
- **WHEN** sync replay งานของ A
- **THEN** sandbox ของ B มีทั้งสองรายการและไม่มี conflict

#### Scenario: gitattributes union

- **GIVEN** .gitattributes มี NOTES.md merge=union และทั้งสอง change แก้บรรทัดเดียวกันของ NOTES.md
- **WHEN** sync replay
- **THEN** ได้ทั้งสองบรรทัด

#### Scenario: ไฟล์โค้ดชนยังเป็น conflict

- **GIVEN** ทั้งสอง change แก้บรรทัดเดียวกันของ src/a.js
- **WHEN** sync replay
- **THEN** ได้ conflict เหมือนเดิม

#### Scenario: ปิด union ด้วย attribute

- **GIVEN** .gitattributes มี CHANGELOG.md -merge
- **WHEN** sync replay ที่ชนบรรทัดเดียวกัน
- **THEN** ได้ conflict
