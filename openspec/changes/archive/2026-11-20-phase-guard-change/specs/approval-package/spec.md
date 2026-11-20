# หน้าอนุมัติและต้นแบบ

ผู้ใช้ดูข้อมูลเพื่ออนุมัติจากหน้าอนุมัติ และดูจำลองการใช้งานจากต้นแบบ ไม่ต้องมีทั้งคู่พร้อมกัน

## ADDED Requirements

### Requirement: prephase-approval-preview

ในโหมด block ที่ยังไม่มี phase ระบบ SHALL อนุญาต Write, Edit หรือ MultiEdit เฉพาะพาธมาตรฐานของหน้าอนุมัติ `approval.html` และต้นแบบ `prototype.html` ใน `.foundation/previews/<change-id>/` สำหรับข้อยกเว้นใหม่นี้

- ตรวจพาธจริง; ไม่เพิ่มสิทธิ์ให้ shell หรือไฟล์อื่น และไม่เปลี่ยนกติกาเมื่อมี phase

#### Scenario: เขียนหน้าอนุมัติและต้นแบบ

- **GIVEN** โหมด block และยังไม่มี phase
- **WHEN** ใช้ Write กับ prototype.html ของ b2b-office-uat หรือ approval.html ในโฟลเดอร์เดียวกัน
- **THEN** guard อนุญาตแต่ละไฟล์โดยไม่ต้องเริ่ม Change

#### Scenario: ปฏิเสธพาธนอกขอบเขต

- **GIVEN** โหมด block และยังไม่มี phase
- **WHEN** ขอเขียนไฟล์พรีวิวอื่นหรือไฟล์ที่ resolve แล้วเป็นซอร์สผลิตภัณฑ์
- **THEN** guard ไม่ให้ข้อยกเว้นและยังปฏิเสธ

## MODIFIED Requirements

### Requirement: approval-page-authored-by-skill

คำถามอนุมัติ SHALL ใช้หน้าอนุมัติ `.foundation/previews/<change>/approval.html` ที่เอเจนต์หรือผู้ใช้เขียน หรือใช้สรุปข้อความเมื่อไม่มีหน้า โดยไม่ใช้ต้นแบบแทน

- ไฟล์เดิมยังเปิดอ่านได้ที่ตำแหน่งเดิม ระบบไม่ย้าย ไม่คัดลอก และไม่ตีความ prototype เป็นหน้าอนุมัติโดยอัตโนมัติ
- หน้าอนุมัติอ่านประกอบการตัดสินใจเท่านั้น ตัดสินใจในช่องทางเดิมและไม่ใช่หลักฐาน

#### Scenario: มีหน้าแล้ว

- **GIVEN** มีไฟล์ `.foundation/previews/<change>/approval.html` ไม่ว่าจะมีต้นแบบหรือไม่
- **WHEN** advance ถามเรื่องอนุมัติ
- **THEN** คำถามลิงก์ `approval.html` ในชื่อหน้าอนุมัติ

#### Scenario: ยังไม่มีหน้า

- **GIVEN** ไม่มี `approval.html` แม้ว่ามี `prototype.html` หรือตัวอย่างชนิด prototype
- **WHEN** advance ถามเรื่องอนุมัติ
- **THEN** ข้อความแสดงสรุป 4 บรรทัด ไม่เรียกต้นแบบว่าหน้าอนุมัติ และไม่หยุดการถาม

#### Scenario: ไม่เขียนไฟล์หน้า

- **GIVEN** รัน change start advance หรือ package
- **WHEN** คำสั่งทำงานจนเสร็จ
- **THEN** ไม่มีการสร้างหรือเขียนทับ HTML ใน `.foundation/previews/` หรือ `.foundation/packages/`

#### Scenario: ตัวอย่างใน draft ยังถูกตรวจ

- **GIVEN** draft มี example ชนิดที่ไม่รู้จัก
- **WHEN** รัน change start
- **THEN** ได้ EDIT ที่ระบุ path ของ example นั้นตามเดิม และ harness ไม่เรนเดอร์ example ใด

#### Scenario: ข้อมูลหน้าอนุมัติแยกจากต้นแบบ

- **GIVEN** มีทั้งหน้าอนุมัติและตัวอย่างต้นแบบใน draft
- **WHEN** รัน package
- **THEN** JSON รายงานหน้าอนุมัติแยกจากต้นแบบ และการประกาศ covers ของต้นแบบยังคงใช้กับรายการต้นแบบ

### Requirement: prototype-sync

ระบบ SHALL บันทึก digest และรายงานความสดของหน้าอนุมัติจาก `approval.html` เท่านั้น โดยคำเตือนไม่กั้น Change, Build, Prove หรือ Land

- บันทึก digest ของหน้าและ factsDigest ตอน change start, revise หรือ amend; ไม่ใช้ digest ของต้นแบบเดิมตัดสินว่าหน้าอนุมัติถูกแก้

#### Scenario: แก้ไฟล์แล้วเตือน

- **GIVEN** บันทึก digest ของ approval.html ที่ฉบับ 2 แล้วไฟล์ถูกแก้
- **WHEN** รัน package
- **THEN** ข้อมูลมี drift true ระบุว่าถูกแก้หลังฉบับ 2 ให้ตรวจให้ตรงกับ change แล้ว change revise

#### Scenario: revise แล้วหายเตือน

- **GIVEN** ข้อมูลมี drift true
- **WHEN** agent แก้ draft ให้ตรงแล้วรัน change revise
- **THEN** digest ใหม่ถูกบันทึกและ drift เป็น false

#### Scenario: ข้อมูลของ harness ในหน้าล้าสมัย

- **GIVEN** หน้าอ้าง factsDigest เก่าเพราะมี receipt ใหม่หลังจากนั้น
- **WHEN** รัน package
- **THEN** ข้อมูลมี factsStale true และคำถามอนุมัติเตือนให้อัปเดตข้อเท็จจริงในหน้าอนุมัติ

#### Scenario: แก้ไฟล์แต่ไม่แก้ change

- **GIVEN** หน้าถูกแก้แต่ change ไม่ถูก revise
- **WHEN** รัน advance หรือ prove
- **THEN** คำเตือนยังอยู่ แต่ไม่ถูกนับเป็น EDIT และไม่หยุดการทำงาน

#### Scenario: ไม่มีไฟล์

- **GIVEN** ไม่มี approval.html แม้ draft ชี้ไฟล์ต้นแบบที่มีอยู่
- **WHEN** รัน package
- **THEN** ข้อมูลหน้าอนุมัติระบุว่ายังไม่มีไฟล์ และไม่มีคำเตือนเรื่อง drift หรือ facts

#### Scenario: คำเตือนไม่ใช่หลักฐาน

- **GIVEN** มีหรือไม่มีคำเตือนเรื่อง drift หรือ facts
- **WHEN** รัน prove หรือ land
- **THEN** ผลของ Prove และ Land ไม่เปลี่ยนเพราะสถานะนั้น

#### Scenario: แก้เฉพาะต้นแบบ

- **GIVEN** มี snapshot ของหน้าอนุมัติและข้อเท็จจริงไม่ได้เปลี่ยน
- **WHEN** แก้เฉพาะ prototype แล้วรัน package
- **THEN** หน้าอนุมัติไม่ถูกแจ้งว่าแก้หลังบันทึก

### Requirement: prototype-checklist

ข้อมูลของ package และผลของ change start SHALL บอกรายการสิ่งที่ต้นแบบของ change ควรแสดงจาก work type และฟิลด์ใน draft เท่านั้น ครอบคลุมทุก work type และไม่กั้น Change, Build, Prove หรือ Land

#### Scenario: งาน API

- **GIVEN** workType เป็น api และ draft มี apiContracts ที่มี error 400 เมื่อ title ว่าง
- **WHEN** รัน package
- **THEN** รายการมี แผง API ที่แสดง request response และกรณี error 400 พร้อม เส้นทางผู้ใช้ กรณีพลาดพร้อม recovery และ ก่อน-หลัง

#### Scenario: งานข้อมูล

- **GIVEN** workType เป็น migration และ draft มี migrationPlan กับ rollout
- **WHEN** รัน package
- **THEN** รายการมี schema ก่อน-หลัง ลำดับปล่อย และ rollback

#### Scenario: งานหน้าจอ

- **GIVEN** workType เป็น ui และ uiStates มี loading empty error success
- **WHEN** รัน package
- **THEN** รายการระบุว่าต้องแสดงครบทุกสถานะของทุกหน้าจอที่ draft ระบุ

#### Scenario: ครบทุก work type

- **GIVEN** catalog ประกาศ work type ทั้ง 26 ชนิด
- **WHEN** สร้างรายการของแต่ละชนิดแยกกัน
- **THEN** ทุกชนิดมีรายการอย่างน้อย 1 ข้อ และทุกข้อระบุฟิลด์ใน draft ที่เป็นที่มา หรือเป็นข้อร่วมคือ ก่อน-หลัง

#### Scenario: หลายชนิดรวมกัน

- **GIVEN** workType เป็น feature, api และ data
- **WHEN** รัน package
- **THEN** รายการเป็นผลรวมเรียงลำดับคงที่ ไม่มีข้อซ้ำ และแต่ละข้อบอกที่มา

#### Scenario: ฟิลด์ไม่ระบุ

- **GIVEN** workType เป็น api แต่ draft ไม่มี apiContracts
- **WHEN** รัน package
- **THEN** รายการมีแผง API ที่ต้องมี และระบุว่า draft ยังไม่ระบุ ไม่ประดิษฐ์ endpoint

#### Scenario: งานที่ไม่ต้องมีภาพมาก

- **GIVEN** workType เป็น docs เท่านั้น
- **WHEN** รัน package
- **THEN** รายการมีเฉพาะ ก่อน-หลัง และไม่เตือนว่าขาดอย่างอื่น

#### Scenario: ชนิดใหม่ที่ยังไม่มีรายการ

- **GIVEN** มีคนเพิ่ม work type ใหม่ใน catalog โดยไม่เพิ่มรายการ
- **WHEN** รันชุดทดสอบของ harness
- **THEN** ชุดทดสอบล้มและระบุชื่อชนิดที่ไม่มีรายการ

#### Scenario: ไม่กั้นการเริ่ม

- **GIVEN** draft ประเภท ui ยังไม่มีต้นแบบ แม้มีหน้าอนุมัติ
- **WHEN** รัน change start
- **THEN** พิมพ์ NOTE เกี่ยวกับต้นแบบโดยไม่เรียกว่าหน้าอนุมัติ ไม่ EDIT ไม่ถามผู้ใช้ และไม่หยุด
