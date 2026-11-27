# quality-tooling

## ADDED Requirements

### Requirement: quality-module-lanes

quality config SHALL มีหลาย lane ต่อ capability ได้ด้วย provider ชื่อ <capability>:<name> ที่รันในโฟลเดอร์ cwd ของตัวเอง

- capability ของ lane คือฟิลด์ capability หรือส่วนก่อน : ของชื่อ
- cwd เป็น path ที่สัมพันธ์กับ repository ห้ามเป็น absolute ห้ามมี .. และต้องมีอยู่
- ผลรัน history และ baseline แยกตามชื่อ lane
- ทุก lane ที่ capability เดียวกันนับครอบ capability ของ profile และนับเป็นหลักฐานชดเชย
- readiness อ่าน history ของทุก lane ที่ capability เป็น test
- --capability test เลือกทุก lane ที่ capability เป็น test

#### Scenario: lane ของ module

- **GIVEN** provider test:services/wallet มี cwd services/wallet และคำสั่งที่ล้มถ้าไม่ได้รันในโฟลเดอร์นั้น
- **WHEN** quality run รัน
- **THEN** lane รันใน services/wallet และรายงาน capability test กับ lane test:services/wallet

#### Scenario: สอง lane capability เดียวกัน

- **GIVEN** test:a และ test:b ไม่มี paths
- **WHEN** quality run รัน
- **THEN** ได้สอง lane และ history แยกกัน

#### Scenario: cwd ออกนอก repository

- **GIVEN** provider มี cwd ../other
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธพร้อมชื่อ provider

#### Scenario: cwd ไม่มีอยู่

- **GIVEN** provider มี cwd services/missing
- **WHEN** quality run รัน
- **THEN** lane fail พร้อมเหตุผลว่าไม่มีโฟลเดอร์

#### Scenario: config เดิม

- **GIVEN** provider ชื่อ test ไม่มี cwd
- **WHEN** quality run รัน
- **THEN** ผลและไฟล์ผลเหมือนเดิม

### Requirement: discovery-module-lanes

quality discover SHALL เสนอ lane test และ static-analysis ต่อ module ให้โฟลเดอร์ย่อยที่มี manifest ของภาษาเมื่อรากของ repository ไม่มี lane ของ capability นั้นจากภาษาเดียวกัน

- module คือโฟลเดอร์ที่มี marker ของ pack และไม่ใช่ git repository แยก
- lane ที่เสนอมีชื่อ <capability>:<dir>, cwd dir และ paths dir/**
- คำสั่งมาจาก discovery เดียวกับรากของ repository ที่รันกับโฟลเดอร์นั้น
- เสนอได้สูงสุด 40 module เกินจากนั้นรายงาน modulesTruncated
- module ที่อยู่ใน module อื่นของภาษาเดียวกันไม่ถูกเสนอซ้ำ

#### Scenario: Go หลาย module ไม่มี go.mod ที่ราก

- **GIVEN** services/a/go.mod และ services/b/go.mod
- **WHEN** quality discover รัน
- **THEN** เสนอ test:services/a และ test:services/b คำสั่ง go test ./... พร้อม cwd และ paths

#### Scenario: ราก repo ครอบอยู่แล้ว

- **GIVEN** package.json ที่รากมี scripts.test และ packages/x/package.json
- **WHEN** quality discover รัน
- **THEN** ไม่เสนอ lane ของ packages/x

#### Scenario: module มากเกิน

- **GIVEN** 45 โฟลเดอร์ที่มี go.mod
- **WHEN** quality discover รัน
- **THEN** เสนอ 40 lane และ modulesTruncated เป็น 5

#### Scenario: module ที่เป็น git repository แยก

- **GIVEN** libs/x มี .git และ go.mod
- **WHEN** quality discover รัน
- **THEN** ไม่เสนอ lane ของ libs/x

### Requirement: toolchain-pack-tightening

toolchain pack SHALL ถูกตรวจรูปแบบเวลาเทสต์ว่ามี pattern และกลุ่มดึงตัวเลข, ใช้รูปแบบเวลาของ pack ที่โปรเจกต์ประกาศใน quality lane และ config ที่อ่านไม่ได้ต้องหยุด discovery พร้อมสาเหตุ

- pack ที่ไม่มีทั้ง markers และ extensions ใช้ได้เป็น profile ที่ระบุเองแต่ไม่ถูกตรวจพบอัตโนมัติ
- pack ของโปรเจกต์ที่ชื่อซ้ำแทนที่ pack ของ harness ทั้งก้อน รวม durations
- คำสั่งของ pack ไม่ถูกเสนอเมื่อเครื่องไม่มี executable หรือไฟล์ใน requires ไม่มี
- doctor เสนอ paths ครบทุกโฟลเดอร์เมื่อคำสั่งระบุหลายโฟลเดอร์

#### Scenario: duration ไม่มีกลุ่ม

- **GIVEN** pack มี durations [{ pattern: "took" }]
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธว่า pattern ต้องมีกลุ่มดึงตัวเลข

#### Scenario: duration ไม่มี pattern

- **GIVEN** pack มี durations [{}]
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธ

#### Scenario: เวลาเทสต์จาก pack โปรเจกต์

- **GIVEN** pack โปรเจกต์มี duration Finished in (\d+)s และ lane test พิมพ์ Finished in 2s แต่ใช้ 60 วินาที
- **WHEN** quality run รัน
- **THEN** history ของ lane บันทึก lingering testsMs 2000

#### Scenario: config อ่านไม่ได้

- **GIVEN** quality/foundation-quality.json ไม่ใช่ JSON
- **WHEN** quality discover รัน
- **THEN** หยุดพร้อมบอกว่า config อ่านไม่ได้

#### Scenario: หลายโฟลเดอร์

- **GIVEN** lane test คำสั่ง go test ./a/... ./b/...
- **WHEN** quality doctor รัน
- **THEN** เสนอ paths a/** และ b/**

#### Scenario: เครื่องไม่มีเครื่องมือ

- **GIVEN** repository มี pubspec.yaml และ test/ แต่ไม่มี flutter บน PATH
- **WHEN** quality discover รัน
- **THEN** profile toolchain-dart-flutter ถูกพบแต่ไม่เสนอคำสั่ง

#### Scenario: Flutter ไม่มีโฟลเดอร์ test

- **GIVEN** repository มี pubspec.yaml แต่ไม่มี test/
- **WHEN** quality discover รัน
- **THEN** เสนอ flutter analyze แต่ไม่เสนอ flutter test
