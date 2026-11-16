# sandbox

## ADDED Requirements

### Requirement: Sandbox ของ root ที่ไม่ใช่ git ไม่รวม repo ย่อย

ระบบ SHALL ไม่คัดลอกและไม่บันทึก manifest ของไฟล์ใน repo ย่อยเมื่อสร้าง copy sandbox ของ root ที่ไม่ใช่ git repository

#### Scenario: repo ที่ประกาศไม่ถูกคัดลอกเข้า sandbox ของ root

- **GIVEN** root ไม่ใช่ git ประกาศ repo app ที่ services/app
- **WHEN** สร้าง copy sandbox ของ root
- **THEN** sandbox ของ root ไม่มีไฟล์ใต้ services/app
- **AND** baseline และ sandboxBaseline ไม่มี path ใต้ services/app

#### Scenario: repo ที่ไม่ได้ประกาศไม่ถูกคัดลอก

- **GIVEN** root ไม่ใช่ git มีไดเรกทอรี archive/other ที่เป็น git repository แต่ไม่ได้ประกาศ
- **WHEN** สร้าง copy sandbox ของ root
- **THEN** sandbox ของ root และ manifest ไม่มีไฟล์ใต้ archive/other

#### Scenario: ไฟล์ control plane ของ root ยังอยู่

- **GIVEN** root ไม่ใช่ git มี openspec/ และไฟล์ README.md ที่ root
- **WHEN** สร้าง copy sandbox ของ root
- **THEN** sandbox ของ root มี openspec/ และ README.md และ manifest มีทั้งสอง

#### Scenario: root ที่เป็น git ไม่เปลี่ยน

- **GIVEN** root เป็น git repository มีไฟล์ที่ track ไว้
- **WHEN** สร้าง copy sandbox ของ root
- **THEN** ไฟล์ที่ track ไว้ทั้งหมดถูกคัดลอกเหมือนเดิม

#### Scenario: แก้ไฟล์ใน repo ที่ไม่ได้ประกาศ

- **GIVEN** root ไม่ใช่ git และ agent สร้างไฟล์ใต้ archive/other ใน sandbox ของ root
- **WHEN** Land
- **THEN** Land ปฏิเสธพร้อมบอกให้ประกาศ repo ใน openspec/repositories.yaml
