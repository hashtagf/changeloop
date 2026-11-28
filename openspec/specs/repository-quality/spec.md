# repository-quality Specification

## Purpose
Test lane ของ repo นี้ไม่รัน mutation suite และไม่คำนวณ suite ที่ถูกเลื่อนขึ้นซ้ำในทุก suite ส่วน mutation suite ย้ายไปเป็น automated-mutation lane ที่มี baseline.
## Requirements
### Requirement: run-all-skip-mutation

run-all.sh --skip-mutation SHALL ตัด suite ที่อยู่ในรายชื่อ MUTATION ออกจาก selection ของ tier ที่เลือก และ child ของแต่ละ suite SHALL ไม่เรียกตัวเลือก suite ที่ถูกเลื่อนขึ้น

- MUTATION คือ land surface mutation, lifecycle safety mutation, shipping boundary mutation และ risk-tiered review mutation
- --mutation-commands พิมพ์ label|command ของ suite ใน MUTATION ตามลำดับตาราง
- phase mutation guard เป็นเทสต์ของ hook ไม่ใช่ mutation testing จึงไม่อยู่ใน MUTATION

#### Scenario: ตัดเฉพาะ mutation

- **WHEN** รัน run-all.sh --skip-mutation --list
- **THEN** ได้รายการ default ที่ไม่มีชื่อใน MUTATION และ suite อื่นครบ

#### Scenario: รายชื่อผิด

- **WHEN** MUTATION มีชื่อที่ไม่มีในตาราง
- **THEN** control test fail พร้อมชื่อนั้น

#### Scenario: child ไม่คำนวณซ้ำ

- **WHEN** รัน suite เดียวผ่าน --suite ขณะที่ไฟล์ที่เปลี่ยนเลื่อน installer smoke ขึ้น
- **THEN** stderr ของ child ไม่มีข้อความ default gate: also running

### Requirement: repository-mutation-report

scripts/quality/repository-mutation.mjs SHALL รัน mutation suite จาก run-all.sh --mutation-commands พร้อมกัน และพิมพ์รายงาน mutant ที่ adapter generic-mutation-json อ่านได้

- id ของ mutant คือ <suite>:<id> เพื่อไม่ซ้ำข้าม suite
- killed ที่ killedBy ตรง expectedKiller เป็น Killed, applied false เป็น Ignored, compiled false เป็น CompileError, นอกนั้น Survived
- suite ที่ไม่เขียนรายงานทำให้สคริปต์ exit 1 พร้อมชื่อ suite

#### Scenario: mutant ถูกฆ่า

- **WHEN** แปลง row result killed killedBy ตรง expectedKiller
- **THEN** status Killed และ killedBy มีชื่อนั้น

#### Scenario: ฆ่าผิดตัว

- **WHEN** แปลง row result killed แต่ killedBy ไม่ตรง expectedKiller
- **THEN** status Survived และ killedBy ว่าง

#### Scenario: ไม่ได้ใส่ fault

- **WHEN** แปลง row applied false
- **THEN** status Ignored

#### Scenario: suite ไม่มีรายงาน

- **WHEN** suite จบโดยไม่เขียนรายงาน
- **THEN** exit 1 และ stderr มีชื่อ suite

### Requirement: repository-quality-lanes

quality/foundation-quality.json ของ repo SHALL ใช้ run-all.sh --skip-mutation เป็น test lane และมี automated-mutation lane ที่ ratchet กับ baseline

- lane ใช้ adapter generic-mutation-json isolation tool และอ่านรายงานจาก stdout
- baseline เขียนจากผลรันที่ mutant ถูกฆ่าทุกตัว

#### Scenario: lane ผ่าน

- **WHEN** รัน quality-run --capability automated-mutation --enforce
- **THEN** lane pass และ ratchet กับ baseline
