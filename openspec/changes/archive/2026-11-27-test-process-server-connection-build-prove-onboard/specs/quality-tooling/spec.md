# quality-tooling

## Purpose

ผู้ใช้เลือกแก้อีก 4 ข้อจาก log ของ 10 repo ผู้ใช้: Prove เสียเวลา 405 จาก 785 นาที ไปกับ lane คุณภาพที่ change ไม่ได้แตะ การรัน provider ที่หมดเวลาซ้ำบนเนื้อหาเดิม และเทสต์ค้างที่ตัวจับเดิมอ่านได้แค่ node:test.

## ADDED Requirements

### Requirement: quality-lane-paths

quality lane ที่ประกาศ paths SHALL ไม่ถูกรันใน change ที่ไม่มีไฟล์ที่เปลี่ยนตรงกับ paths นั้น

- provider ใน quality/foundation-quality.json ประกาศ paths เป็น glob ที่สัมพันธ์กับ repository ได้
- lane ที่ไม่ถูกรันรายงาน status pass, assurance not-affected, required false และเหตุผล และไม่เขียน history ของ lane
- รันทุก lane เมื่อไม่มี change หรือใช้ --full
- lane not-affected นับเป็นหลักฐานชดเชยได้เฉพาะเมื่อผลที่บันทึกล่าสุดของ lane นั้นผ่าน
- paths ที่ไม่ใช่ array ของ string ที่ไม่ว่าง ถูกปฏิเสธตอนอ่าน config

#### Scenario: change ไม่แตะ paths

- **GIVEN** lane automated-mutation ประกาศ paths backend/** และ change แก้แค่ frontend/app.tsx
- **WHEN** quality run ของ change รัน
- **THEN** lane นั้นไม่ถูกรันและรายงาน not-affected

#### Scenario: change แตะ paths

- **GIVEN** lane เดียวกันและ change แก้ backend/x.go
- **WHEN** quality run ของ change รัน
- **THEN** lane ถูกรันตามปกติ

#### Scenario: ไม่มี change หรือ --full

- **GIVEN** lane ประกาศ paths
- **WHEN** quality run รันโดยไม่มี change หรือใช้ --full
- **THEN** lane ถูกรัน

#### Scenario: ผลล่าสุดล้ม

- **GIVEN** lane test ประกาศ paths ที่ change ไม่แตะ และผลที่บันทึกล่าสุดของมันล้ม
- **WHEN** quality run ตัดสินหลักฐานชดเชย
- **THEN** lane นั้นไม่นับเป็นหลักฐานชดเชย

#### Scenario: paths ผิดรูป

- **GIVEN** provider ประกาศ paths เป็น string
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธพร้อมชื่อฟิลด์

### Requirement: quality-provider-swallowed-exit

cloop quality doctor SHALL เตือนเมื่อ lane ที่ตัดสินจาก exit code มีคำสั่งที่กลืนความล้มเหลว และแนะนำ paths ให้ lane ที่รันในโฟลเดอร์เดียว

- lane ที่ตัดสินจาก exit code คือ kind command ที่ไม่มี protocol
- รูปแบบที่กลืนความล้มเหลวคือ || true, || : และ ; exit 0
- lane builtin หรือมี protocol ไม่ถูกเตือน เพราะตัดสินจาก output ที่ parse ได้
- lane ที่ไม่มี paths และคำสั่งเริ่มด้วย cd <dir> && ได้คำแนะนำระดับ info ให้ประกาศ paths <dir>/**

#### Scenario: test lane กลืน exit

- **GIVEN** lane test kind command คำสั่ง sh -c 'go test ./... || true'
- **WHEN** quality doctor รัน
- **THEN** มี warning provider-swallows-failure ที่ชื่อ lane

#### Scenario: lane ที่ parse output

- **GIVEN** lane lint builtin eslint-json คำสั่งลงท้าย || true
- **WHEN** quality doctor รัน
- **THEN** ไม่มี warning provider-swallows-failure

#### Scenario: lane รันในโฟลเดอร์เดียว

- **GIVEN** lane test ไม่มี paths คำสั่ง sh -c 'cd backend && go test ./...'
- **WHEN** quality doctor รัน
- **THEN** มี info provider-paths-suggested ที่เสนอ backend/**
