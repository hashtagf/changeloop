# maintainer-pi-extensions

## ADDED Requirements

### Requirement: auto-name

session-title SHALL ตั้งชื่อ session จากข้อความแรกของผู้ใช้เมื่อ session ยังไม่มีชื่อ

- ใช้บรรทัดแรกที่มีเนื้อหา ตัดช่องว่างซ้ำ และตัดให้ยาวไม่เกิน 48 ตัวอักษรแบบไม่ตัดกลาง grapheme พร้อม … เมื่อถูกตัด
- ไม่ตั้งจากข้อความที่ขึ้นต้นด้วย / (คำสั่ง) หรือข้อความที่ไม่มีตัวอักษร
- ไม่ตั้งเมื่อ session มีชื่ออยู่แล้ว

#### Scenario: ตั้งชื่อจากคำสั่งแรก

- **GIVEN** session ยังไม่มีชื่อ
- **WHEN** ผู้ใช้ส่งข้อความ "ปรับให้แสดงชื่อ ที่ว่าทำงานอะไรอยู่"
- **THEN** ชื่อ session เป็น "ปรับให้แสดงชื่อ ที่ว่าทำงานอะไรอยู่"

#### Scenario: ข้อความยาวถูกตัด

- **WHEN** ข้อความแรกยาว 120 ตัวอักษร
- **THEN** ชื่อยาวไม่เกิน 48 ตัวอักษรและลงท้ายด้วย …

#### Scenario: ไม่ทับชื่อเดิม

- **GIVEN** session ชื่อ "Release prep" อยู่แล้ว
- **WHEN** ผู้ใช้ส่งข้อความ
- **THEN** ชื่อยังเป็น "Release prep"

#### Scenario: ข้ามคำสั่งและข้อความว่าง

- **WHEN** ข้อความแรกเป็น "/reload" หรือมีแค่ "???"
- **THEN** ไม่มีการตั้งชื่อ และข้อความถัดไปที่มีเนื้อหาจะถูกใช้แทน

### Requirement: agent-title-tool

session-title SHALL ให้ agent ตั้งชื่องานปัจจุบันผ่าน tool session_title

- รับ title 1-60 ตัวอักษรหลังตัดช่องว่าง
- เปลี่ยนชื่อได้เฉพาะเมื่อชื่อปัจจุบันว่างหรือเป็นชื่อที่ extension ตั้งเอง
- ถ้าผู้ใช้ตั้งชื่อเองด้วย /name ให้ปฏิเสธพร้อมข้อความว่าเป็นชื่อที่ผู้ใช้ตั้ง
- system prompt แนะนำให้เรียกเมื่องานหลักเปลี่ยน ด้วยชื่อสั้น 2-6 คำ

#### Scenario: agent อัปเดตชื่อ

- **GIVEN** ชื่อปัจจุบันตั้งจากข้อความแรก
- **WHEN** agent เรียก session_title { title: "Tab titles from work" }
- **THEN** ชื่อ session เป็น "Tab titles from work"

#### Scenario: ชื่อที่ผู้ใช้ตั้งไม่ถูกทับ

- **GIVEN** ผู้ใช้ตั้งชื่อ "Mine" ด้วย /name
- **WHEN** agent เรียก session_title
- **THEN** ชื่อยังเป็น "Mine" และ tool ตอบว่าผู้ใช้ตั้งชื่อเอง

#### Scenario: title ว่างหรือยาวเกิน

- **WHEN** agent เรียกด้วย title ว่างหรือยาว 61 ตัวอักษร
- **THEN** tool ปฏิเสธและชื่อไม่เปลี่ยน

#### Scenario: จำว่าชื่อไหน extension ตั้งหลัง reload

- **GIVEN** extension ตั้งชื่อไว้แล้ว Pi ถูก /reload
- **WHEN** agent เรียก session_title
- **THEN** ชื่อเปลี่ยนได้ เพราะยังรู้ว่าเป็นชื่ออัตโนมัติ

### Requirement: title-package-wiring

pi-extensions SHALL รวม session-title ใน manifest, installer, test runner และเอกสาร tool

#### Scenario: ตรวจแพ็กเกจผ่าน

- **WHEN** รัน npm run check ใน pi-extensions
- **THEN** ผ่าน และ docs/tools.md มี session_title
