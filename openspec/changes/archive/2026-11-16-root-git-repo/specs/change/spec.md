# change

## ADDED Requirements

### Requirement: Repository intelligence ของ root ที่เป็น git รวม repo ที่ประกาศ

ระบบ SHALL รวมไฟล์ที่ git ของแต่ละ repo ที่ประกาศมองเห็นเข้าในชุดที่สแกน เมื่อ root เป็น git repository

#### Scenario: repo ที่ root ignore ถูกสแกน

- **GIVEN** root เป็น git ที่ ignore services/ และประกาศ repo app ที่ services/app
- **WHEN** change start ที่ต้องสแกน repository intelligence รัน
- **THEN** ชุดที่สแกนมีไฟล์ของ services/app
- **AND** ไฟล์ของ root ที่ track ไว้ยังอยู่ในชุดที่สแกน

#### Scenario: draft เลือก repo บางตัว

- **GIVEN** root เป็น git ประกาศ repo app และ lib
- **WHEN** draft เลือก repositories เฉพาะ app
- **THEN** ไม่มีไฟล์ของ lib อยู่ในชุดที่สแกน

#### Scenario: ไฟล์ที่ repo ignore ไม่ถูกสแกน

- **GIVEN** repo app ที่ประกาศมีโฟลเดอร์ generated/ ใน .gitignore ของตัวเอง
- **WHEN** การสแกนรัน
- **THEN** ไม่มีไฟล์ใต้ services/app/generated/ อยู่ในชุดที่สแกน

#### Scenario: repo ที่ประกาศไม่มีอยู่

- **GIVEN** root เป็น git ประกาศ repo ที่ path ยังไม่มีบนเครื่อง
- **WHEN** การสแกนรัน
- **THEN** การสแกนได้ผล ready จากไฟล์ของ root โดยข้าม repo นั้น

#### Scenario: root เป็น git ที่ไม่มี repo ประกาศ

- **GIVEN** root เป็น git และ repositories.yaml ไม่มี repo
- **WHEN** การสแกนรัน
- **THEN** ชุดที่สแกนเท่ากับ git ls-files ของ root เหมือนเดิม
