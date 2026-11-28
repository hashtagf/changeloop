# quality-tooling

## ADDED Requirements

### Requirement: findings-preflight

advance SHALL รัน findings lane ของ change ก่อน Prove รัน provider สำหรับเนื้อหา workspace ที่ยังไม่เคยตรวจ และคืน REPAIR เมื่อ lane ใดไม่ผ่าน

- findings lane คือ lint, type-check, file-size, nesting-depth, duplication, workaround-comments และ module-boundaries ใน quality config ที่ change ใช้
- ผลผ่านถูกจำไว้คู่กับ hash ของเนื้อหา change และไม่รันซ้ำจนกว่าเนื้อหาจะเปลี่ยน
- REPAIR ระบุ lane และ finding ที่ถดถอยและ Prove ไม่เริ่ม
- ไม่มี quality config หรือไม่มี findings lane ข้ามการตรวจนี้
- Prove ยังรัน quality gate เต็มทุกครั้ง

#### Scenario: ไฟล์โตเกิน ratchet

- **GIVEN** quality config มี lane file-size และ change ทำให้ไฟล์ที่ติด ratchet โตขึ้น
- **WHEN** advance --through proven
- **THEN** ได้ REPAIR ที่ระบุ file-size และ Prove ไม่เริ่ม

#### Scenario: ผ่านแล้วเข้า Prove

- **GIVEN** findings lane ทุกตัวผ่าน
- **WHEN** advance --through proven
- **THEN** Prove รันและเนื้อหานี้ถูกจำว่าตรวจแล้ว

#### Scenario: เนื้อหาเดิม

- **GIVEN** เนื้อหานี้ผ่านการตรวจแล้ว
- **WHEN** advance --through proven อีกครั้ง
- **THEN** ไม่รัน findings lane ซ้ำ

#### Scenario: ไม่มี quality config

- **GIVEN** project ไม่มี quality/foundation-quality.json
- **WHEN** advance --through proven
- **THEN** ไม่มีการตรวจก่อน Prove

### Requirement: lane-changed-files

quality run SHALL ส่งรายชื่อ path ที่ change แก้ใน repository นั้นให้ทุก lane ผ่าน FOUNDATION_QUALITY_CHANGED_FILES

- หนึ่ง path ต่อบรรทัด สัมพันธ์กับ repository
- ไม่มี change ได้ค่าว่าง

#### Scenario: มี change

- **GIVEN** change a แก้ src/a.js และ test/a.test.js
- **WHEN** quality run --change a
- **THEN** lane เห็น FOUNDATION_QUALITY_CHANGED_FILES เป็น src/a.js และ test/a.test.js

#### Scenario: ไม่มี change

- **GIVEN** ไม่มี change ที่ active
- **WHEN** quality run
- **THEN** FOUNDATION_QUALITY_CHANGED_FILES ว่าง
