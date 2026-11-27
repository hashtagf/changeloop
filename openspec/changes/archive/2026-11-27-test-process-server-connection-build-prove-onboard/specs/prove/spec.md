# prove

## ADDED Requirements

### Requirement: lingering-test-run

เมื่อ test ของ Node รายงานว่าจบแล้วแต่คำสั่งใช้เวลานานกว่านั้นมาก harness SHALL บอกเวลาที่ test ใช้ เวลาที่คำสั่งใช้ และวิธีแก้

- เวลาของ test คือผลรวมเวลาของ test ระดับบนสุดใน output แบบ spec หรือ TAP
- นับว่าค้างเมื่อคำสั่งนานกว่าเวลาของ test อย่างน้อย 30 วินาทีและเวลาของ test ไม่ถึงครึ่งของคำสั่ง
- แจ้งเป็น signal slow-check ใน task verify และ provider ของ Prove
- quality lane test บันทึกค่าไว้ใน history และ readiness tests-fast เป็น unmet พร้อมวิธีแก้

#### Scenario: npm test ค้างหลัง test จบ

- **GIVEN** output ของคำสั่งมี test ระดับบนสุดรวม 7 วินาทีแต่คำสั่งใช้ 360 วินาที
- **WHEN** harness ตรวจผลของ task verify หรือ provider
- **THEN** signal slow-check บอก 7s กับ 360s และให้เพิ่ม --test-force-exit ถัดจาก --test ใน script หรือปิด handle

#### Scenario: test ช้าจริง

- **GIVEN** test ระดับบนสุดรวม 100 วินาทีและคำสั่งใช้ 110 วินาที
- **WHEN** harness ตรวจผล
- **THEN** ไม่รายงานว่าค้าง

#### Scenario: อ่านเวลา test ไม่ได้

- **GIVEN** output ไม่ใช่รูปแบบของ node:test
- **WHEN** harness ตรวจผล
- **THEN** ไม่รายงานว่าค้าง และ slow-check เดิมยังทำงาน

#### Scenario: readiness ของ lane ที่ค้าง

- **GIVEN** history ล่าสุดของ quality lane test บันทึกว่าค้าง
- **WHEN** cloop quality readiness ประเมิน tests-fast
- **THEN** tests-fast เป็น unmet และ next บอกวิธีแก้ handle ที่ค้าง

### Requirement: provider-timeout-no-rerun

Prove SHALL ไม่รัน provider ซ้ำเมื่อผลล่าสุดของมันหมดเวลาบนเนื้อหาและ config เดียวกัน และบอกวิธีแก้แทน

- เนื้อหาและ config เดียวกันคือ receipt ยังผูกกับ workspace และ provider fingerprint ปัจจุบัน
- ผลที่ได้คือ error พร้อม detail ที่บอกเวลาที่หมด และให้เพิ่ม timeoutMs แยกคำสั่ง หรือแก้สิ่งที่ค้าง
- FOUNDATION_RERUN_TIMED_OUT=1 รันซ้ำได้สำหรับกรณีเครื่องช้าชั่วคราว

#### Scenario: หมดเวลาซ้ำโดยไม่มีอะไรเปลี่ยน

- **GIVEN** receipt ล่าสุดของ provider test บันทึก timeout after 140000ms บน workspace และ config ปัจจุบัน
- **WHEN** advance --through proven รัน providers
- **THEN** provider test ไม่ถูกรันและ detail บอก 140000ms กับวิธีแก้

#### Scenario: เนื้อหาหรือ config เปลี่ยน

- **GIVEN** receipt หมดเวลาแต่ workspace หรือ timeoutMs เปลี่ยนแล้ว
- **WHEN** advance --through proven รัน providers
- **THEN** provider ถูกรันตามปกติ

#### Scenario: สั่งรันซ้ำ

- **GIVEN** receipt หมดเวลาบนเนื้อหาเดิมและตั้ง FOUNDATION_RERUN_TIMED_OUT=1
- **WHEN** advance --through proven รัน providers
- **THEN** provider ถูกรัน

### Requirement: lingering-test-run-runners

การตรวจ test ที่จบแล้วแต่คำสั่งค้าง SHALL อ่านเวลาจากสรุปของ vitest, jest และ Playwright ด้วย

- vitest: บรรทัด Duration <n>s หรือ <n>ms
- jest: บรรทัด Time: <n> s หรือ ms
- Playwright: บรรทัด <n> passed (<n>s|<n>m|<n>ms)
- หลายชุดใน output เดียว เช่น turbo หลาย package รวมเวลากัน
- เกณฑ์ค้างเหมือน node:test

#### Scenario: vitest ค้าง

- **GIVEN** output vitest มี Duration 5.83s และคำสั่งใช้ 120 วินาที
- **WHEN** harness ตรวจผล
- **THEN** รายงานว่าค้าง เวลา test 6s

#### Scenario: Playwright และ jest รวมกัน

- **GIVEN** output มี jest Time: 3.2 s และ Playwright 8 passed (1.6m)
- **WHEN** harness ตรวจผลที่ใช้ 400 วินาที
- **THEN** เวลา test รวมเป็น 99s และรายงานว่าค้าง

#### Scenario: Playwright ช้าจริง

- **GIVEN** output Playwright 1415 passed (4.3m) และคำสั่งใช้ 270 วินาที
- **WHEN** harness ตรวจผล
- **THEN** ไม่รายงานว่าค้าง

## MODIFIED Requirements

### Requirement: node-test-force-exit

คำสั่ง node --test หรือ tsx --test ที่ harness รันเป็น task verify, provider, base run หรือ quality lane SHALL ได้ --test-force-exit

- ใช้กับ argv ที่ขึ้นต้นด้วย node หรือ path ของ node และมี --test
- ใช้กับ argv ที่ขึ้นต้นด้วย tsx หรือ npx ตามด้วยตัวเลือกและ tsx และมี --test
- ใช้กับบรรทัด shell ที่ขึ้นต้นด้วย node --test, tsx --test หรือ npx tsx --test
- ไม่เพิ่มซ้ำถ้ามีอยู่แล้ว

#### Scenario: connection keep-alive ค้าง

- **GIVEN** task verify คือ node --test และ test ใช้ fetch กับ server ที่ไม่ได้ปิด connection
- **WHEN** advance รัน task verify
- **THEN** คำสั่งจบภายในไม่กี่วินาทีและ task ผ่าน

#### Scenario: test ล้ม

- **GIVEN** test ตัวหนึ่งล้มและ server ค้าง
- **WHEN** advance รัน task verify
- **THEN** คำสั่งจบเร็วและ task ล้ม

#### Scenario: คำสั่งอื่น

- **WHEN** verify เป็น npm test หรือมี --test-force-exit อยู่แล้ว
- **THEN** argv ไม่ถูกเปลี่ยน

#### Scenario: tsx --test

- **GIVEN** verify คือ npx tsx --test หรือ tsx --test
- **WHEN** harness เตรียม argv หรือบรรทัด shell
- **THEN** --test-force-exit อยู่ถัดจาก --test

#### Scenario: quality lane

- **GIVEN** provider ของ quality lane test คือ node --test และมี server ค้าง
- **WHEN** cloop quality run รัน lane นั้น
- **THEN** lane จบเร็วและผ่าน
