# quality-tooling Specification

## Purpose
Gate ค่าเริ่มต้นของ repo ไม่รัน suite ช้าที่ตั้งใจไว้ให้รันแค่ใน CI และไม่รัน gate ซ้ำหลัง Land.
## Requirements
### Requirement: default-gate-skips-slow-upgrade

gate ค่าเริ่มต้นของ run-all SHALL ไม่รัน upgrade compat ผ่าน wrapper risk-tiered review contract ส่วน --full และ --release SHALL รันเหมือนเดิม

#### Scenario: tier ค่าเริ่มต้น

- **WHEN** รัน run-all.sh โดยไม่มี --full
- **THEN** wrapper ไม่เรียก run-upgrade-compat-tests.sh
- **AND** รายงานเคส CASE-UPGRADE-COMPAT เป็น deferred และ suite ผ่าน

#### Scenario: tier full

- **WHEN** รัน run-all.sh --full
- **THEN** wrapper เรียก run-upgrade-compat-tests.sh และเคสต้องผ่าน

#### Scenario: รัน wrapper ตรง

- **WHEN** รัน run-risk-tiered-review-tests.mjs เองโดยไม่ผ่าน run-all
- **THEN** รันทุกเคสรวม upgrade compat

### Requirement: prove-counts-as-gate

คู่มือ maintainer SHALL นับ receipt static-analysis ที่ผ่านของ change ที่ Land โดยไม่มีการแก้หลัง Land เป็น gate ค่าเริ่มต้นก่อน commit

#### Scenario: แก้ไฟล์หลัง Land

- **WHEN** มีการแก้ไฟล์หลัง Land
- **THEN** คู่มือยังสั่งให้รัน gate ค่าเริ่มต้นก่อน commit

### Requirement: reference-governance-fast

การตรวจ reference governance ของ skill SHALL ให้ผลเหมือนเดิมและแตกคำของแต่ละย่อหน้าครั้งเดียว

#### Scenario: skill จริงของ repo

- **WHEN** รันการตรวจกับ .claude/skills
- **THEN** ไม่มี issue และใช้เวลาน้อยกว่า 10 วินาที

#### Scenario: ย่อหน้าซ้ำและเกือบซ้ำ

- **GIVEN** fixture ที่มีย่อหน้าซ้ำและเกือบซ้ำข้ามไฟล์
- **WHEN** รันการตรวจ
- **THEN** รายงาน duplicate และ near-duplicate เหมือนเดิม

#### Scenario: ขนาดชุดคำต่างกันมาก

- **GIVEN** ย่อหน้ายาว 40 คำกับย่อหน้ายาว 100 คำที่มีคำของย่อหน้าแรกครบ
- **WHEN** รันการตรวจ
- **THEN** ไม่รายงาน near-duplicate
