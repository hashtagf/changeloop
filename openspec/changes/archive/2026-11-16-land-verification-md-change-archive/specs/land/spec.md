# land

## ADDED Requirements

### Requirement: verification-record-written

ระบบ SHALL เขียน verification.md ในโฟลเดอร์ change ที่ archive เพื่อสรุปผล proof run ที่ Land ยอมรับ

- เขียนหลังตรวจ spec ที่ merge แล้ว และก่อนบันทึก delivery integrity
- ใช้ภาษาเดียวกับ draft (th หรือ en)
- ไม่ใส่ log path, environment หรือ path ใต้ .foundation
- receipt ที่อ่านไม่ได้แสดงเป็น unavailable ไม่เคยเป็น pass

#### Scenario: Proof ผ่านมี receipt test

- **GIVEN** proof ที่ Land ยอมรับมี receipt test ที่ status pass พร้อม claims, observed และ command
- **WHEN** Land archive change
- **THEN** archive folder มี verification.md ที่มี proof run id, status, workspace hash และแถวของ provider test
- **AND** แถวนั้นมี claims, status pass, observed, command และ sha256 ของ receipt

#### Scenario: Receipt อ่านไม่ได้

- **GIVEN** proof อ้าง receipt ที่ไฟล์หายไปจาก .foundation
- **WHEN** Land archive change
- **THEN** แถวของ provider นั้นมี status unavailable และ sha256 จาก proof

#### Scenario: ไม่มีข้อมูลเครื่อง

- **GIVEN** receipt มี log path ใต้ .foundation และ field environment
- **WHEN** Land archive change
- **THEN** verification.md ไม่มีข้อความ .foundation/ และไม่มีค่า environment

#### Scenario: Review ไม่บังคับ

- **GIVEN** change ไม่มี review attempt ที่ completed
- **WHEN** Land archive change
- **THEN** verification.md บอกว่าไม่มี review record

#### Scenario: Review มีผล

- **GIVEN** change มี review attempt ที่ completed
- **WHEN** Land archive change
- **THEN** verification.md ชี้ไปที่ Appendix: Review record ใน proposal.md

#### Scenario: Packet ภาษาไทย

- **GIVEN** draft ตั้ง language เป็น th
- **WHEN** Land archive change
- **THEN** หัวข้อและป้ายตารางใน verification.md เป็นภาษาไทย

#### Scenario: Packet ที่ active ไม่มีไฟล์

- **GIVEN** change ยังไม่ archive
- **WHEN** openspec archive เริ่มทำงาน
- **THEN** openspec/changes/<id> ไม่มี verification.md

#### Scenario: Delivery integrity ครอบไฟล์

- **GIVEN** Land archive change สำเร็จ
- **WHEN** อ่าน delivery integrity record
- **THEN** record มี entry ของ verification.md ใน archive folder

### Requirement: verification-record-resume

ระบบ SHALL เขียน verification.md ครั้งเดียวด้วยเนื้อหาเดิมเมื่อ Land ที่ค้างถูกทำต่อ

#### Scenario: ทำต่อหลังเขียนไฟล์

- **GIVEN** Land เขียน verification.md แล้วค้างก่อนบันทึก delivery integrity
- **WHEN** Land ถูกทำต่อ
- **THEN** verification.md มี byte เท่ากับรอบแรก
- **AND** delivery integrity ถูกบันทึก

#### Scenario: ไฟล์ถูกแก้ระหว่างค้าง

- **GIVEN** Land ค้าง และ verification.md ใน archive ถูกแก้ให้ต่างจากที่บันทึก
- **WHEN** Land ถูกทำต่อ
- **THEN** Land หยุดและบอกว่า verification.md ต่างจากที่บันทึก

### Requirement: verification-name-reserved

ระบบ SHALL ปฏิเสธ Land ก่อนแก้ target เมื่อ packet ของ change มี verification.md อยู่แล้ว

#### Scenario: Packet มีไฟล์ชื่อซ้ำ

- **GIVEN** openspec/changes/<id> มี verification.md
- **WHEN** Land เริ่ม
- **THEN** Land หยุดพร้อมข้อความที่บอกชื่อไฟล์ และ change ยังไม่ archive
