# spec-drift

## ADDED Requirements

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
