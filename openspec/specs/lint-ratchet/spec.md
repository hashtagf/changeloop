# lint-ratchet Specification

## Purpose
gate แบบ deterministic ที่กัน anti-pattern ใหม่ในโค้ด harness โดยยอมรับของเดิมเป็น baseline ที่ลดได้อย่างเดียว
## Requirements
### Requirement: กฎเฉพาะ repo บอกวิธีแก้ที่ต้นเหตุ

ระบบ SHALL รายงาน anti-pattern ที่กำหนดในโค้ด harness พร้อมข้อความที่บอกวิธีแก้ที่ต้นเหตุ

- no-timer-wait: setTimeout, setInterval, setImmediate, Atomics.wait และการ spawn คำสั่ง sleep
- no-workaround-comment: comment ที่มี TODO, FIXME, HACK, XXX หรือ workaround
- no-silent-catch: catch block ที่ว่าง
- no-bare-disable: eslint-disable ที่ไม่มีเหตุผลหลัง --
- กฎ built-in: no-undef, no-unused-vars, no-unreachable, no-dupe-keys
- ข้อยกเว้นที่มีชื่อ: setTimeout ใช้ได้เฉพาะใน runtime/core/timing.mjs และ catch ที่ไม่จัดการ error ใช้ได้เฉพาะใน runtime/core/best-effort.mjs ข้อความของกฎบอกชื่อ helper ที่ต้องใช้
- ผลของ `tsc --checkJs` บันทึกเป็นกฎ `types/TS<code>` ต่อไฟล์ และ ratchet แบบเดียวกับ lint

#### Scenario: timer เป็นทางรอ

- **WHEN** โค้ดเรียก setTimeout หรือ spawnSync('sleep')
- **THEN** no-timer-wait รายงานพร้อมข้อความให้รอเหตุการณ์หรือเงื่อนไขจริงแทน timer

#### Scenario: comment workaround

- **WHEN** comment มีคำว่า TODO, HACK หรือ workaround
- **THEN** no-workaround-comment รายงานพร้อมข้อความให้แก้ต้นเหตุหรือแปลงเป็น test/lint

#### Scenario: catch ว่าง

- **WHEN** catch block ไม่มี statement
- **THEN** no-silent-catch รายงานพร้อมข้อความให้จัดการ, throw ต่อ หรือกรองด้วยเงื่อนไขที่มีชื่อ

#### Scenario: disable ไม่มีเหตุผล

- **WHEN** comment eslint-disable-next-line ไม่มีข้อความหลัง --
- **THEN** no-bare-disable รายงาน

#### Scenario: โค้ดปกติไม่ถูกรายงาน

- **WHEN** โค้ดใช้ await บน promise, catch ที่ throw ต่อ, comment อธิบายเหตุผลทั่วไป และ disable ที่มีเหตุผล
- **THEN** ไม่มีกฎ custom ใดรายงาน

### Requirement: จำนวน violation ลดได้อย่างเดียว

ระบบ SHALL ล้มเมื่อจำนวน violation ของไฟล์และกฎใดเกิน baseline

#### Scenario: ไม่มีการเปลี่ยน

- **GIVEN** จำนวน violation ทุกไฟล์ทุกกฎเท่ากับ baseline
- **WHEN** รัน runner
- **THEN** exit 0

#### Scenario: violation ใหม่

- **WHEN** ไฟล์หนึ่งมี violation ของกฎหนึ่งมากกว่า baseline หรือไฟล์ใหม่ที่ไม่มีใน baseline มี violation
- **THEN** exit ไม่ใช่ 0 และแสดงไฟล์ กฎ จำนวน baseline จำนวนปัจจุบัน บรรทัด และข้อความวิธีแก้

#### Scenario: เก็บกวาดแล้วแต่ baseline ค้าง

- **WHEN** จำนวน violation ต่ำกว่า baseline
- **THEN** exit ไม่ใช่ 0 พร้อมบอกให้รัน --tighten

#### Scenario: tighten ลดได้อย่างเดียว

- **GIVEN** บางรายการต่ำกว่า baseline และบางรายการเกิน baseline
- **WHEN** รัน runner ด้วย --tighten
- **THEN** baseline ลดเฉพาะรายการที่ต่ำกว่า รายการที่เกินไม่ถูกเพิ่ม และ exit ไม่ใช่ 0

#### Scenario: baseline เสียหรือหาย

- **WHEN** ไฟล์ baseline ไม่มีหรือ JSON ผิดรูป
- **THEN** exit ไม่ใช่ 0 พร้อมชื่อไฟล์ ไม่ถือว่าผ่าน

### Requirement: ไฟล์ใหญ่และ composition root ห้ามโต

ระบบ SHALL ล้มเมื่อไฟล์ใน size baseline มีจำนวนบรรทัดเกิน baseline หรือไฟล์อื่นในขอบเขตเกินเพดาน `sizeCeiling` ของ baseline (ตอนนี้ 1000 บรรทัด)

- foundation.mjs อยู่ใน size baseline เสมอเพราะต้องเป็น composition root

#### Scenario: composition root โต

- **WHEN** foundation.mjs ยาวกว่าใน baseline
- **THEN** exit ไม่ใช่ 0 พร้อมข้อความให้ย้าย logic ไป domain ใต้ runtime/

#### Scenario: ไฟล์ใหม่เกินเพดาน

- **WHEN** ไฟล์ที่ไม่อยู่ใน size baseline ยาวเกิน `sizeCeiling`
- **THEN** exit ไม่ใช่ 0 พร้อมข้อความให้แยกโมดูล

#### Scenario: ไฟล์ใหญ่หดลง

- **WHEN** ไฟล์ใน size baseline สั้นกว่า baseline
- **THEN** exit ไม่ใช่ 0 พร้อมบอกให้รัน --tighten และ --tighten ลดค่าให้

### Requirement: lint ratchet อยู่ใน gate ก่อน commit

ระบบ SHALL รัน lint ratchet และ test ของกฎใน run-all ทั้งแบบ default และ --affected

#### Scenario: affected เลือกเสมอ

- **WHEN** affected selector คำนวณ suite จากไฟล์ที่เปลี่ยนใด ๆ
- **THEN** ผลมี suite lint ratchet

#### Scenario: แก้ test ของกฎ

- **WHEN** ไฟล์ใต้ scripts/lint เปลี่ยน
- **THEN** affected selector เลือก suite lint rules
