# spec-drift Specification

## Purpose
รายงานสเปกที่ archive แล้วซึ่งไม่ตรงกับโค้ดปัจจุบัน.
## Requirements
### Requirement: deterministic-drift

คำสั่ง spec-drift SHALL ตรวจแบบตายตัวทุก requirement ของความสามารถที่เลือก หรือทั้งหมดเมื่อไม่ระบุ

#### Scenario: ไฟล์ที่ผูกไว้หายไป

- **GIVEN** requirement ผูกกับ test file ผ่าน change ที่ archive แล้ว และไฟล์นั้นถูกลบ
- **WHEN** รัน spec-drift
- **THEN** requirement นั้นถูกรายงาน missing-file พร้อม path

#### Scenario: ทุกไฟล์ยังอยู่

- **WHEN** รัน spec-drift กับความสามารถที่ไฟล์ที่ผูกไว้ยังอยู่ครบ
- **THEN** requirement เป็น ok

#### Scenario: หาที่มาไม่เจอ

- **GIVEN** requirement ไม่ปรากฏใน change ที่ archive
- **WHEN** รัน spec-drift
- **THEN** requirement เป็น no-origin

#### Scenario: path ในข้อความสเปกหาย

- **GIVEN** ข้อความ requirement อ้าง path ใน backtick ที่ไม่มีแล้ว
- **WHEN** รัน spec-drift
- **THEN** รายงาน missing-file

#### Scenario: ระบุความสามารถ

- **WHEN** รัน spec-drift --capability spec-review
- **THEN** รายงานมีเฉพาะ requirement ของ spec-review

#### Scenario: ความสามารถไม่มีอยู่

- **WHEN** รัน spec-drift --capability no-such
- **THEN** คำสั่งล้มเหลวพร้อมชื่อนั้น

#### Scenario: ไฟล์ archive เสียหรือรูปแบบเก่า

- **GIVEN** evidence.yaml หรือ tasks.md ของ change ที่ archive อ่านไม่ได้หรือไม่มี claim
- **WHEN** รัน spec-drift
- **THEN** requirement ที่ผูกกับ change นั้นเป็น unreadable พร้อม path ไม่นับว่า ok

#### Scenario: ความสามารถที่ไม่มี requirement

- **GIVEN** spec.md ของความสามารถไม่มี Requirement
- **WHEN** รัน spec-drift
- **THEN** ความสามารถนั้นแสดงศูนย์ requirement ไม่ล้มเหลว

### Requirement: ai-drift-review

spec-drift --review SHALL ให้ reviewer session ใหม่แบบอ่านอย่างเดียวเทียบความหมายของสเปกกับไฟล์ที่ผูกไว้ ทีละความสามารถที่ระบุ

#### Scenario: รีวิวความสามารถที่เลือก

- **WHEN** รัน spec-drift --review --capability spec-review
- **THEN** reviewer หนึ่ง session ต่อความสามารถ และผลอยู่ในรายงาน

#### Scenario: --review ไม่ระบุความสามารถ

- **WHEN** รัน spec-drift --review โดยไม่มี --capability
- **THEN** คำสั่งปฏิเสธโดยไม่ spawn reviewer

#### Scenario: reviewer ล้มเหลว

- **WHEN** reviewer ล้มเหลวสองครั้งหรือไม่มี reviewer CLI
- **THEN** ความสามารถนั้นเป็น not-run พร้อมเหตุผล ไม่นับว่าตรง

#### Scenario: ไม่มี --review ไม่เรียก AI

- **WHEN** รัน spec-drift ไม่มี --review
- **THEN** ไม่มี reviewer ถูก spawn

### Requirement: read-only-report

spec-drift SHALL เขียนเฉพาะรายงานใน .foundation/spec-drift/ และไม่แก้สเปกหรือโค้ด

#### Scenario: ไม่แตะไฟล์โปรเจกต์

- **WHEN** รัน spec-drift
- **THEN** git status ของโปรเจกต์ไม่เปลี่ยนนอกจาก .foundation/spec-drift

#### Scenario: exit code

- **WHEN** พบ drift
- **THEN** คำสั่งจบด้วย exit 0 เพราะเป็นรายงาน ไม่ใช่ gate

### Requirement: moved-files

spec-drift SHALL รายงานไฟล์ที่ผูกไว้ซึ่งไม่อยู่ที่เดิมแต่มีไฟล์ชื่อเดียวกันอยู่ที่เดียวใน repo เป็น moved พร้อม path ใหม่

#### Scenario: ไฟล์ย้ายเข้าโฟลเดอร์ย่อย

- **GIVEN** ไฟล์ที่ผูกไว้ src/page.mjs ย้ายไป src/paging/page.mjs
- **WHEN** รัน spec-drift
- **THEN** requirement เป็น moved
- **AND** moved แสดง src/page.mjs → src/paging/page.mjs

#### Scenario: ชื่อซ้ำหลายที่

- **GIVEN** มีไฟล์ชื่อ page.mjs สองที่
- **WHEN** รัน spec-drift
- **THEN** requirement เป็น missing-file ไม่เดาที่อยู่ใหม่

#### Scenario: ย้ายบางไฟล์ หายบางไฟล์

- **GIVEN** ไฟล์หนึ่งถูกย้ายและอีกไฟล์หายจริง
- **WHEN** รัน spec-drift
- **THEN** requirement เป็น missing-file และยังแสดงไฟล์ที่ถูกย้าย

#### Scenario: glob ที่โฟลเดอร์หาย

- **GIVEN** path แบบ glob ที่โฟลเดอร์ต้นทางไม่มีแล้ว
- **WHEN** รัน spec-drift
- **THEN** ยังเป็น missing-file เพราะ glob ย้ายตามชื่อไม่ได้
