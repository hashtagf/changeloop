# spec-approval

## Purpose

หยุดวงวนขออนุมัติสเปกซ้ำ เมื่อ harness เขียน provider wiring ระหว่าง Build ของ change ที่ถูก amend แล้ว.

## ADDED Requirements

### Requirement: amended-wiring-keeps-consent

harness SHALL นับ execution.yaml ที่ evidence wiring เขียนระหว่าง Build ของ change ที่ amend แล้ว เป็นส่วนของข้อตกลงที่ amend ล่าสุด

- ทำเฉพาะเมื่อมี snapshot ของ amendment ล่าสุดและ packet ใน sandbox
- อัปเดตเฉพาะ execution.yaml ใน snapshot และ identity ของ amendment ล่าสุด
- changeSourceHash เลื่อนตามเฉพาะเมื่อก่อน wiring มันตรงกับ target อยู่แล้ว

#### Scenario: wiring หลัง amend

- **GIVEN** change ถูก amend ระหว่าง Build และได้รับอนุมัติแล้ว
- **WHEN** evidence wiring เขียน execution.yaml ลง target และ sandbox
- **THEN** การตรวจอนุมัติสเปกผ่านโดยไม่กู้คืน packet
- **AND** execution.yaml ยังอยู่ใน sandbox
- **AND** target ไม่ถูกนับเป็นการแก้ที่ขัดกับ amendment

#### Scenario: การแก้ข้อตกลงจริงยังถูกกู้คืน

- **GIVEN** change ถูก amend และ proposal ใน sandbox ถูกแก้นอก amendment
- **WHEN** evidence wiring ทำงาน
- **THEN** snapshot ไม่เปลี่ยนและการแก้ proposal ยังถูกกู้คืน

#### Scenario: target ถูกแก้จากที่อื่นก่อน

- **GIVEN** target packet ถูกแก้หลัง isolation ก่อน wiring
- **WHEN** evidence wiring ทำงาน
- **THEN** changeSourceHash ไม่ถูกเลื่อน การแก้นั้นยังต้องให้ผู้ใช้ตัดสิน

#### Scenario: change ที่ไม่ได้ amend

- **GIVEN** change ไม่มี amendment
- **WHEN** evidence wiring ทำงาน
- **THEN** state และ packet ไม่ถูกเปลี่ยนโดยการแก้นี้
