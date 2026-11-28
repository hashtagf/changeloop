# ชั้น Codebase ของ pyramid readiness

## Purpose

วัดว่าตัวโค้ดเองต้านการใช้ผิด เรียงจาก data domain → architecture → code architecture → โค้ดระดับไฟล์และฟังก์ชัน ด้วยเกณฑ์ขั้นต่ำที่ตั้งหลวมกว่าไม่ได้ และหนี้เดิมเก็บใน baseline

## ADDED Requirements

### Requirement: codebase-floors

readiness SHALL นับเกณฑ์ชั้น Codebase เป็น met เฉพาะเมื่อ lane ratchet และค่าที่ตั้งไม่หลวมกว่า floor ของ policy

- floor: ไฟล์ 1000 บรรทัด, ฟังก์ชัน 80 บรรทัด, cognitive complexity 15, nesting 5 ชั้น, duplication window 8 บรรทัด, วงจร import 0
- โปรเจกต์ตั้งเข้มกว่า floor ได้
- ค่าที่ตั้งไม่ใช่ตัวเลขที่ถูกต้องยังเป็น error เดิมของ lane

#### Scenario: เพดานหลวมกว่า floor

- **GIVEN** lane file-size ratchet และตั้ง ceiling 5000
- **WHEN** quality readiness ประเมิน file-size
- **THEN** ข้อ file-size เป็น unmet
- **AND** detail บอกค่าที่ตั้งและ floor 1000
- **AND** next บอกให้ลดเพดานลงไม่เกิน floor

#### Scenario: เพดานเท่า floor

- **GIVEN** lane file-size ratchet และตั้ง ceiling 1000
- **WHEN** quality readiness ประเมิน file-size
- **THEN** ข้อ file-size เป็น met

#### Scenario: เพดานเข้มกว่า floor

- **GIVEN** lane nesting-depth ratchet และตั้ง maxDepth 4
- **WHEN** quality readiness ประเมิน nesting-depth
- **THEN** ข้อ nesting-depth เป็น met

#### Scenario: duplication window กว้างกว่า floor

- **GIVEN** lane duplication ratchet และตั้ง window 20
- **WHEN** quality readiness ประเมิน duplication
- **THEN** ข้อ duplication เป็น unmet

### Requirement: ordered-codebase-layer

readiness SHALL จัดเกณฑ์ชั้น Codebase เป็นลำดับย่อย data domain → architecture → code architecture → code และเลือก next step จากลำดับย่อยแรกที่ยังไม่ผ่าน

- แต่ละเกณฑ์มี sublayer: domain, architecture, code-architecture, code
- ข้อเทสต์ 4 ข้อยังเป็น next step แรกตามเดิม

#### Scenario: domain ยังไม่ผ่านแต่ไฟล์ใหญ่ด้วย

- **GIVEN** ข้อ data-domains unmet และ file-size-clear unmet และข้อเทสต์ผ่านหมด
- **WHEN** quality readiness คำนวณ next ของชั้น codebase
- **THEN** next มาจาก data-domains

#### Scenario: ข้อเทสต์ยังไม่ผ่าน

- **GIVEN** ข้อ tests unmet และ data-domains unmet
- **WHEN** quality readiness คำนวณ next step แรก
- **THEN** next step แรกมาจาก tests

### Requirement: data-domains

feature map SHALL รับ domains ที่ระบุข้อมูลที่เป็นเจ้าของ paths และ API สาธารณะ และ lane data-domains SHALL รายงานโค้ดนอก domain ที่เข้าถึงส่วนภายในหรือข้อมูลของ domain นั้น

- domains: [{ id, name, summary, paths, api, data: [{ name, match? }] }]; feature มี domain ได้
- finding domain/private-import: import path ภายใน domain อื่นที่ไม่อยู่ใน api
- finding domain/foreign-data: ไฟล์นอก domain อ้างชื่อข้อมูลที่ domain นั้นเป็นเจ้าของ (match เป็นคำ/regex ที่ประกาศ)
- ข้อมูลหนึ่งชุดมีเจ้าของได้ domain เดียว; ซ้ำเป็น issue ของ feature map
- ไม่มี domains: เกณฑ์ data-domains เป็น unmet พร้อม next ให้ onboard ร่าง ไม่ใช่ met

#### Scenario: import ผ่าน API

- **GIVEN** domain orders มี api src/orders/index.ts
- **WHEN** src/billing/x.ts import src/orders/index.ts
- **THEN** ไม่มี finding

#### Scenario: import ส่วนภายใน

- **GIVEN** domain orders มี api src/orders/index.ts
- **WHEN** src/billing/x.ts import src/orders/repo.ts
- **THEN** มี finding domain/private-import ที่ src/billing/x.ts

#### Scenario: อ้างตารางของ domain อื่น

- **GIVEN** domain orders เป็นเจ้าของข้อมูล orders
- **WHEN** src/billing/x.ts มี SQL ที่อ้าง orders
- **THEN** มี finding domain/foreign-data ที่ src/billing/x.ts

#### Scenario: ข้อมูลมีสองเจ้าของ

- **GIVEN** domain orders และ billing ต่างประกาศข้อมูล orders
- **WHEN** ตรวจ feature map
- **THEN** มี issue ข้อมูลซ้ำเจ้าของ

#### Scenario: ไม่มี domains

- **GIVEN** feature map ไม่มี domains
- **WHEN** quality readiness ประเมิน data-domains
- **THEN** ข้อ data-domains เป็น unmet พร้อม next ให้ onboard ร่าง domains

### Requirement: directed-architecture

lane import-cycles SHALL รายงานวงจร import ระหว่างโมดูล และ readiness SHALL ไม่นับ module-boundaries ที่อนุญาตทุกทิศว่าผ่าน

- อ่าน import ของ JS/TS, Python, Go, Java/Kotlin และ PHP แบบประมาณ
- วงจรหนึ่งวงเป็น finding import-cycle/<modules> หนึ่งรายการ
- allow ที่ทุกโมดูลไปถึงทุกโมดูลได้ถือว่าไม่มีทิศทาง
- ภาษาที่อ่าน import ไม่ได้: unmeasured

#### Scenario: โมดูลวนกัน

- **GIVEN** โมดูล a import b และ b import a
- **WHEN** รัน lane import-cycles
- **THEN** มี finding วงจร a-b หนึ่งรายการ

#### Scenario: วงจรใน Python

- **GIVEN** pkg/a.py from pkg.b import x และ pkg/b.py import pkg.a
- **WHEN** รัน lane import-cycles
- **THEN** มี finding วงจร

#### Scenario: allow ทุกทิศ

- **GIVEN** module-boundaries ratchet และ allow ให้ทุกโมดูลไปทุกโมดูล
- **WHEN** quality readiness ประเมิน module-boundaries
- **THEN** ข้อ module-boundaries เป็น unmet ด้วยเหตุไม่มีทิศทาง

#### Scenario: ภาษาไม่รู้จัก

- **GIVEN** repo มีแต่ไฟล์ .ex
- **WHEN** quality readiness ประเมิน import-cycles
- **THEN** ข้อ import-cycles เป็น unmeasured

### Requirement: feature-ownership

lane feature-ownership SHALL รายงานไฟล์ source นอกเทสต์ที่ไม่มี feature ใดใน feature map อ้างถึง

- ใช้ paths และ glob ของทุก feature
- ไฟล์เทสต์ fixture และไฟล์ที่ระบุใน feature map ignore ไม่นับ

#### Scenario: ไฟล์ไม่มีเจ้าของ

- **GIVEN** feature map อ้าง src/a/** เท่านั้น
- **WHEN** รัน lane feature-ownership บน repo ที่มี src/b/x.ts
- **THEN** มี finding feature/unowned ที่ src/b/x.ts

#### Scenario: ไฟล์เทสต์

- **GIVEN** feature map อ้าง src/a/** เท่านั้น
- **WHEN** repo มี src/a/x.test.ts และ test/y.ts
- **THEN** ไม่มี finding สำหรับไฟล์เทสต์

### Requirement: function-metrics

lane function-size และ cognitive-complexity SHALL รายงานฟังก์ชันที่ยาวหรือซับซ้อนเกินเกณฑ์ พร้อมชื่อฟังก์ชันและบรรทัด

- หาขอบฟังก์ชันจากวงเล็บสำหรับภาษาที่ใช้ปีกกา และจากย่อหน้าสำหรับ Python/Ruby
- cognitive complexity ตามกฎหลักของ SonarSource: +1 ต่อ branch/loop/catch/ลำดับ boolean operator และ +nesting
- adapter eslint-complexity-json อ่านผลของ eslint complexity/sonarjs ถ้ามี
- ภาษาที่หาขอบฟังก์ชันไม่ได้: unmeasured

#### Scenario: ฟังก์ชันยาว

- **GIVEN** ฟังก์ชัน JS 81 บรรทัด และ maxLines 80
- **WHEN** รัน lane function-size
- **THEN** มี finding function/size ที่ชื่อฟังก์ชันนั้น value 81

#### Scenario: ยาวพอดีเกณฑ์

- **GIVEN** ฟังก์ชัน 80 บรรทัด
- **WHEN** รัน lane function-size
- **THEN** ไม่มี finding

#### Scenario: ซับซ้อนเกิน

- **GIVEN** ฟังก์ชัน Python ที่ if ซ้อนกันจน cognitive 16
- **WHEN** รัน lane cognitive-complexity
- **THEN** มี finding function/cognitive value 16

#### Scenario: object literal ไม่ใช่ฟังก์ชัน

- **GIVEN** ไฟล์มี config object ยาว 200 บรรทัด
- **WHEN** รัน lane function-size
- **THEN** ไม่มี finding

### Requirement: dead-code

lane dead-code SHALL รายงานไฟล์ source ที่ไม่มีไฟล์ใด import และไม่ใช่ entry point หรือใช้ผลจาก knip หรือ vulture เมื่อโปรเจกต์มี

- entry: main/bin/exports ของ package.json, ไฟล์ที่ feature map หรือ provider ระบุ entries, ไฟล์เทสต์, ไฟล์ config ที่ root
- adapter knip-json และ vulture-text
- ภาษาที่อ่าน import ไม่ได้: unmeasured

#### Scenario: ไฟล์ไม่มีใครใช้

- **GIVEN** src/old.ts ไม่มีไฟล์ใด import และไม่ใช่ entry
- **WHEN** รัน lane dead-code
- **THEN** มี finding dead/file ที่ src/old.ts

#### Scenario: entry point

- **GIVEN** package.json bin ชี้ src/cli.ts ที่ไม่มีใคร import
- **WHEN** รัน lane dead-code
- **THEN** ไม่มี finding สำหรับ src/cli.ts

#### Scenario: ผลจาก knip

- **GIVEN** provider adapter knip-json พร้อมรายงานที่มี unused export 2 รายการ
- **WHEN** รัน lane dead-code
- **THEN** มี finding 2 รายการ

### Requirement: type2-duplication

lane duplication SHALL ตรวจโค้ดซ้ำแบบ Type-2 โดยแทนชื่อตัวแปรและค่าคงที่ด้วย token กลางก่อนเทียบ

- window นับเป็นบรรทัดที่มีความหมายเหมือนเดิม
- keyword ของภาษาไม่ถูกแทน
- baseline เดิมของ lane duplication ยังเทียบได้ หรือ readiness บอกให้ตั้ง baseline ใหม่ด้วยเหตุผล scope เปลี่ยน

#### Scenario: เปลี่ยนชื่อตัวแปร

- **GIVEN** สองไฟล์มีบล็อก 8 บรรทัดเหมือนกันยกเว้นชื่อตัวแปรและตัวเลข
- **WHEN** รัน lane duplication
- **THEN** มี finding duplication/block หนึ่งรายการ

#### Scenario: โครงสร้างต่าง

- **GIVEN** สองบล็อกใช้ if กับ for ต่างกัน
- **WHEN** รัน lane duplication
- **THEN** ไม่มี finding

### Requirement: approximate-languages

lane ใหม่ทุกตัว SHALL รายงานภาษาที่วัดไม่ได้เป็น unmeasured และ discovery SHALL เสนอ adapter ของเครื่องมือภาษาที่โปรเจกต์ติดตั้งอยู่แล้ว

#### Scenario: มี knip ใน devDependencies

- **GIVEN** package.json มี knip
- **WHEN** รัน quality discover
- **THEN** ร่าง lane dead-code ใช้ adapter knip-json

#### Scenario: ไม่มีเครื่องมือ

- **GIVEN** repo Go ไม่มีเครื่องมือ dead code
- **WHEN** รัน quality discover
- **THEN** ร่าง lane dead-code แบบในตัว

### Requirement: repository-scope

repo Change Loop SHALL วัดขนาดไฟล์ nesting และโค้ดซ้ำใน scripts/ และไฟล์เทสต์ด้วย และหนี้เดิมเข้า baseline พร้อมเหตุผล

- เพดานไฟล์ของ repo นี้ลงมาไม่เกิน floor 1000
- repo นี้มี domains ใน feature map ตาม 7 runtime domain
- repo นี้เปิด lane ใหม่ทุกตัวพร้อม baseline

#### Scenario: ไฟล์ใน scripts โตเกิน

- **GIVEN** baseline ปัจจุบัน
- **WHEN** ไฟล์ใน scripts/ ยาวเกิน 1000 บรรทัด
- **THEN** lane file-size ของ repo นี้รายงาน regression

#### Scenario: readiness ของ repo

- **GIVEN** repo นี้หลังงานนี้
- **WHEN** รัน npm run quality:scorecard
- **THEN** ชั้น codebase แสดงทุกเกณฑ์ใหม่

### Requirement: golden-fixture

ชุดทดสอบ SHALL มี golden fixture repo ที่สะอาดได้ Codebase 100% และการใส่ข้อบกพร่องหนึ่งอย่างทำให้เฉพาะเกณฑ์ของข้อนั้นไม่ผ่าน

- ข้อบกพร่องหนึ่งอย่างต่อเกณฑ์ codebase ทุกข้อ
- fixture มี JS และ Python อย่างน้อย
- golden fixture มี invariant, contract, reference และ sdk อย่างละหนึ่ง และข้อบกพร่องของแต่ละข้อ

#### Scenario: fixture สะอาด

- **GIVEN** golden fixture ไม่มีข้อบกพร่อง
- **WHEN** รัน readiness ชั้น codebase
- **THEN** ทุกเกณฑ์ที่วัดได้เป็น met

#### Scenario: ใส่วงจร

- **GIVEN** golden fixture
- **WHEN** เพิ่ม import ย้อนกลับให้เกิดวงจร
- **THEN** เฉพาะ import-cycles เป็น unmet

#### Scenario: ใส่ไฟล์ไม่มีเจ้าของ

- **GIVEN** golden fixture
- **WHEN** เพิ่มไฟล์ source ที่ไม่มี feature อ้าง
- **THEN** feature-ownership และ dead-code เป็น unmet เท่านั้น

### Requirement: domain-invariants

feature map SHALL รับ invariants ของแต่ละ domain และ lane domain-invariants SHALL รายงานกฎที่ไม่มีเทสต์บังคับหรือเทสต์ที่อ้างไม่มีอยู่จริง

- invariants: [{ id, statement, tests: [path] }] ภายใน domain
- กฎที่ tests ว่าง (empty) หรือ path ไม่มีอยู่ (missing) เป็น finding
- domain ที่ไม่ประกาศ invariants ไม่ใช่ finding แต่ readiness แสดงจำนวน domain ที่มีกฎ

#### Scenario: กฎมีเทสต์

- **GIVEN** domain wallet มี invariant balance-never-negative ที่ tests ชี้ไฟล์ที่มีอยู่
- **WHEN** รัน lane domain-invariants
- **THEN** ไม่มี finding

#### Scenario: กฎไม่มีเทสต์

- **GIVEN** invariant balance-never-negative มี tests ว่าง
- **WHEN** รัน lane domain-invariants
- **THEN** มี finding domain/invariant-untested ที่ invariant นั้น

#### Scenario: เทสต์ที่อ้างไม่มีอยู่

- **GIVEN** invariant ชี้ test/wallet.test.ts ที่ไม่มีไฟล์
- **WHEN** รัน lane domain-invariants
- **THEN** มี finding domain/invariant-missing-test

### Requirement: api-contracts

lane api-contracts SHALL รายงาน domain ที่มี api แต่ไม่มี contract ชี้ไฟล์สัญญาที่มีอยู่จริง

- contract: [path] รับ OpenAPI, proto, JSON Schema, GraphQL schema หรือไฟล์ type ที่ export
- ไฟล์ contract ต้องอยู่ใน paths ของ domain หรือโฟลเดอร์ contracts ที่ประกาศ

#### Scenario: มี OpenAPI

- **GIVEN** domain orders มี api และ contract ชี้ contracts/orders.yaml ที่มีอยู่
- **WHEN** รัน lane api-contracts
- **THEN** ไม่มี finding

#### Scenario: ไม่มีสัญญา

- **GIVEN** domain orders มี api แต่ไม่มี contract
- **WHEN** รัน lane api-contracts
- **THEN** มี finding domain/no-contract

#### Scenario: สัญญาชี้ไฟล์หาย

- **GIVEN** contract ชี้ contracts/missing.yaml
- **WHEN** รัน lane api-contracts
- **THEN** มี finding domain/missing-contract

### Requirement: reference-implementations

feature map SHALL รับ references ต่อ domain หรือ pattern และ lane reference-implementations SHALL รายงาน reference ที่ไม่มีอยู่หรือมี finding จาก lane ชั้น Codebase ใดก็ตาม

- references: [{ pattern, path, summary }]
- reference ที่มี finding ใดใน baseline ของ lane codebase (file-size, function-size, cognitive-complexity, nesting, duplication, boundary, cycles) นับว่าไม่สะอาด
- readiness บอกจำนวน domain ที่ไม่มี reference เลยเป็น unmet พร้อม next

#### Scenario: reference สะอาด

- **GIVEN** reference ชี้ src/orders/create-order.ts ที่ไม่มี finding
- **WHEN** รัน lane reference-implementations
- **THEN** ไม่มี finding

#### Scenario: reference มีหนี้

- **GIVEN** reference ชี้ไฟล์ที่มีฟังก์ชันยาวเกินเกณฑ์
- **WHEN** รัน lane reference-implementations
- **THEN** มี finding reference/unclean ที่อ้าง rule ของหนี้นั้น

#### Scenario: reference หาย

- **GIVEN** reference ชี้ไฟล์ที่ไม่มี
- **WHEN** รัน lane reference-implementations
- **THEN** มี finding reference/missing

### Requirement: shared-sdk

feature map SHALL รับ sdks ที่ระบุ module กลางและ import ที่ห้ามใช้ตรง และ lane shared-sdk SHALL รายงานไฟล์นอก module นั้นที่ import สิ่งที่ห้าม

- sdks: [{ id, paths, forbids: [import specifier หรือ prefix] , reason }]
- ไฟล์ใน paths ของ sdk และไฟล์เทสต์ import สิ่งที่ห้ามได้
- message ของ finding บอกเหตุผล (reason) และ SDK ที่ต้องใช้แทน
- อ่าน import แบบเดียวกับ lane import-cycles; ภาษาที่อ่านไม่ได้เป็น unmeasured

#### Scenario: เรียกผ่าน SDK

- **GIVEN** sdk payments มี paths packages/payments/** และ forbids stripe
- **WHEN** src/checkout/pay.ts import packages/payments
- **THEN** ไม่มี finding

#### Scenario: เรียก driver ตรง

- **GIVEN** sdk payments forbids stripe
- **WHEN** src/checkout/pay.ts import stripe
- **THEN** มี finding sdk/bypass ที่บอก reason และให้ใช้ payments

#### Scenario: ภายใน SDK

- **GIVEN** sdk payments forbids stripe
- **WHEN** packages/payments/client.ts import stripe
- **THEN** ไม่มี finding

#### Scenario: Go import ตรง

- **GIVEN** sdk db forbids go.mongodb.org/mongo-driver
- **WHEN** internal/handler/x.go import go.mongodb.org/mongo-driver/mongo
- **THEN** มี finding sdk/bypass
