# change

## ADDED Requirements

### Requirement: Repository intelligence ของ root ที่ไม่ใช่ git ใช้ repo ที่ประกาศไว้

ระบบ SHALL สแกน repository intelligence เฉพาะไฟล์ที่ git ของ repo ที่ประกาศใน openspec/repositories.yaml มองเห็น เมื่อ root ไม่ใช่ git repository

#### Scenario: สแกนเฉพาะ repo ที่ประกาศ

- **GIVEN** root ไม่ใช่ git, repositories.yaml ประกาศ repo app ที่ path services/app และมีโฟลเดอร์พี่น้องที่ไม่ประกาศรวมเกิน 12,000 entries
- **WHEN** change start ที่ต้องสแกน repository intelligence รัน
- **THEN** ผลการสแกนเป็น ready
- **AND** candidate ทุกตัวอยู่ใต้ services/app/

#### Scenario: draft เลือก repo บางตัว

- **GIVEN** root ไม่ใช่ git ประกาศ repo app และ lib
- **WHEN** draft เลือก repositories เฉพาะ app
- **THEN** ไม่มีไฟล์ของ lib อยู่ในชุดที่สแกน

#### Scenario: ไฟล์ seed ที่ root ยังถูกอ่าน

- **GIVEN** root ไม่ใช่ git มี openspec/lessons.md และ repo ที่ประกาศ
- **WHEN** การสแกนรัน
- **THEN** openspec/lessons.md อยู่ในชุดที่สแกนและไม่เกิด seed-not-discovered

#### Scenario: ไฟล์ที่ repo ignore ไม่ถูกสแกน

- **GIVEN** repo ที่ประกาศมี node_modules ที่อยู่ใน .gitignore
- **WHEN** การสแกนรัน
- **THEN** ไม่มีไฟล์ใต้ node_modules อยู่ในชุดที่สแกน

#### Scenario: ไม่ได้ประกาศ repo

- **GIVEN** root ไม่ใช่ git และ repositories.yaml ไม่มี repo
- **WHEN** โฟลเดอร์ใต้ root เกินเพดาน entries
- **THEN** ผลการสแกนเป็น blocked ด้วย scan-entry-limit เหมือนเดิม

#### Scenario: root เป็น git

- **GIVEN** root เป็น git repository
- **WHEN** การสแกนรัน
- **THEN** ชุดที่สแกนมาจาก git ls-files ของ root เหมือนเดิม

### Requirement: Phase guard รับ draft แบบโฟลเดอร์และ repositories.yaml ก่อน Build

ระบบ SHALL ยอมให้ Write/Edit ไฟล์ draft แบบโฟลเดอร์และ openspec/repositories.yaml ก่อนมี phase และระหว่าง Change

#### Scenario: Write draft โฟลเดอร์ก่อนมี phase

- **GIVEN** guard mode block และยังไม่มี phase
- **WHEN** Write .foundation/drafts/fix/change.json หรือ .foundation/drafts/fix/proposal.md
- **THEN** guard ไม่ block

#### Scenario: Write repositories.yaml ก่อนมี phase

- **GIVEN** guard mode block และยังไม่มี phase
- **WHEN** Write openspec/repositories.yaml
- **THEN** guard ไม่ block

#### Scenario: Write repositories.yaml ใน Change

- **GIVEN** phase เป็น change และ guard mode block
- **WHEN** Edit openspec/repositories.yaml
- **THEN** guard ไม่ block

#### Scenario: ไฟล์อื่นก่อนมี phase ยังถูก block

- **GIVEN** guard mode block และยังไม่มี phase
- **WHEN** Write openspec/config.yaml หรือ src/app.js
- **THEN** guard block
- **AND** ข้อความชี้ให้เขียน .foundation/drafts/<change-id>/ แล้วรัน cloop change start .foundation/drafts/<change-id> โดยไม่มี --inspect

#### Scenario: path หลุดออกจากโฟลเดอร์ draft

- **GIVEN** guard mode block และยังไม่มี phase
- **WHEN** Write .foundation/drafts/fix/../../src/app.js หรือ .foundation/drafts/fix/sub/x.md
- **THEN** guard block

#### Scenario: repositories.yaml ใน Build

- **GIVEN** phase เป็น build และ guard mode block
- **WHEN** Write openspec/repositories.yaml ที่ main checkout
- **THEN** guard block เหมือนเดิม
