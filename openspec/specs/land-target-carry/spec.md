# land-target-carry Specification

## Purpose
ให้ Land พิสูจน์งานบนสภาพเดียวกับ repo หลักหลัง Land โดยนำไฟล์ที่ยังไม่ commit ใน repo หลักทุกไฟล์ที่ change ไม่ได้แตะเข้า workspace ก่อนตรวจ.
## Requirements
### Requirement: proof-sees-post-land-target

sandbox sync SHALL คัดลอกไฟล์ที่ยังไม่ commit ใน target ทุกไฟล์ที่ change ไม่ได้แก้เข้า worktree sandbox และ Land SHALL ไม่ apply จนกว่า sandbox มีไฟล์เหล่านั้นตรงกับ target

- ไฟล์ค้างคือไฟล์ที่ git status รายงานว่าแก้หรือ untracked และยังมีอยู่ ไม่รวมไฟล์ที่ ignore และ .foundation/ หรือ openspec/changes/
- ไฟล์ที่ change แก้เองใช้เส้นทาง merge เดิมและไม่ถูกเขียนทับ
- ไฟล์ที่นำเข้ามาถูกยกเว้นจาก apply, replay, diff identity และขอบเขต task ตราบที่ bytes ไม่เปลี่ยน
- เมื่อไฟล์ใน target ไม่ค้างแล้ว sandbox กลับไปเป็น bytes ของ target

#### Scenario: ไฟล์ใหม่ที่ถูก import ถูกนำมาด้วย

- **GIVEN** อีก session แก้ไฟล์ร่วมคนละบรรทัดและเพิ่มไฟล์ใหม่ที่โค้ดนั้นต้องใช้ โดยยังไม่ commit
- **WHEN** change ถูก Land
- **THEN** หลักฐานผ่านบน sandbox ที่มีไฟล์ใหม่ และ change ถึง archived
- **AND** target ยังมีงานของทั้งสองฝั่ง

#### Scenario: ไฟล์ค้างที่เกิดหลังพิสูจน์

- **GIVEN** change proven แล้วและ target มีไฟล์ค้างที่ sandbox ยังไม่มี
- **WHEN** เริ่ม Land
- **THEN** Land หยุดด้วย target-edit-sync ให้ harness sync และพิสูจน์ใหม่ก่อน apply

#### Scenario: ไฟล์ที่นำเข้าไม่ใช่งานของ change

- **GIVEN** sandbox มีไฟล์ค้างที่นำเข้ามาโดยไม่แก้ต่อ
- **WHEN** Land apply
- **THEN** ไฟล์นั้นไม่อยู่ใน diff ของ change และ bytes ใน target ไม่ถูกเขียน

#### Scenario: งานของ change ไม่ถูกเขียนทับ

- **GIVEN** ไฟล์ที่ change แก้ถูกแก้ค้างใน target ด้วย
- **WHEN** sandbox sync
- **THEN** ไฟล์ใน sandbox ไม่ถูกแทนด้วย bytes ของ target
