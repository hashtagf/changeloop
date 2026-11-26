# approval-package

## MODIFIED Requirements

### Requirement: package-tolerates-evidence

ระบบ SHALL พิมพ์ข้อมูล package เป็น JSON ต่อโดยไม่เขียนไฟล์เมื่ออ่าน evidence หรือ receipt ไม่ได้ และเตือนเฉพาะ evidence ของ change ที่ยังไม่ Land

- receipt ของ change ที่ Land แล้วและ preview receipt ที่อ่านไม่ได้ถูกข้ามโดยไม่เตือน ตาม approval-data

#### Scenario: provider ไม่มี adapter

- **GIVEN** evidence.yaml มี provider ที่ไม่มี adapter
- **WHEN** รัน package ผ่าน CLI
- **THEN** exit 0 พิมพ์ JSON ทาง stdout มีคำเตือนที่ระบุ evidence ที่อ่านไม่ได้ และไม่เขียนไฟล์

#### Scenario: evidence.yaml เป็น JSON ที่เสีย

- **GIVEN** evidence.yaml อ่านเป็น JSON ไม่ได้
- **WHEN** รัน package ผ่าน CLI
- **THEN** exit 0 พิมพ์ JSON ทาง stdout มีคำเตือน และไม่เขียนไฟล์

#### Scenario: change ที่ไม่มีอยู่

- **WHEN** รัน package กับ id ที่ไม่มี
- **THEN** exit ไม่เป็นศูนย์และไม่เขียนไฟล์

### Requirement: package-labels

ระบบ SHALL ติดป้ายทุก artifact ใน package ว่าเป็น preview, stale, proof หรือยังไม่มีหลักฐาน

#### Scenario: มี receipt ใช้ได้

- **GIVEN** provider test มี receipt ที่ valid
- **WHEN** รัน package
- **THEN** artifact test map ติดป้าย proof

#### Scenario: มีแต่ preview

- **GIVEN** มีเพียง preview receipt
- **WHEN** รัน package
- **THEN** artifact ติดป้าย preview ไม่ใช่ proof

#### Scenario: preview ของ revision ก่อนหน้า

- **GIVEN** มีเพียง preview receipt ที่ contractRevision เก่ากว่า revision ปัจจุบัน
- **WHEN** รัน package
- **THEN** artifact ติดป้าย stale ไม่ใช่ preview หรือ proof

### Requirement: approval-data

คำสั่ง package SHALL พิมพ์ข้อมูลของ change เป็น JSON ได้แก่ ระดับความเสี่ยงพร้อมเหตุผล domain artifact ตาม role พร้อมป้ายหลักฐาน คำแนะนำ preview บรรทัด scratch รวม undo และ who รายการตรวจ section ที่บังคับ บรรทัดสถานะการอนุมัติ รายการที่หน้าต้องแสดง สถานะ covers สถานะ drift และ factsDigest โดย SHALL NOT เขียนไฟล์ HTML

- receipt ของ change ที่ Land แล้วและ preview receipt ที่อ่านไม่ได้ ถูกข้ามโดยไม่มีคำเตือน

#### Scenario: พิมพ์ข้อมูลครบ

- **GIVEN** change ระดับ Medium ที่มี draft และ receipt บางส่วน
- **WHEN** รัน claude-foundation package <change>
- **THEN** ได้ JSON ที่มีทุกหัวข้อข้างต้น และไม่มีไฟล์ HTML ถูกเขียนหรือเขียนทับใน .foundation/packages

#### Scenario: ค่าที่ไม่ทราบ

- **GIVEN** draft ไม่มี tasks paths และไม่มี openQuestions ที่นับได้
- **WHEN** รัน package
- **THEN** ตัวเลขนั้นเป็น unknown ไม่ใช่ 0 และไม่มีค่าที่เดา

#### Scenario: อ่าน evidence บางส่วนไม่ได้

- **GIVEN** change ที่ยังไม่ Land และการตรวจความถูกต้องของ receipt หนึ่งรายการล้มเหลว
- **WHEN** รัน package
- **THEN** ได้ JSON ที่มี warnings ระบุ provider นั้นและข้อมูลส่วนอื่นยังอยู่

#### Scenario: change ที่ไม่มี draft แบบ typed

- **GIVEN** change เก่าที่ไม่มี typed draft
- **WHEN** รัน package
- **THEN** ได้ JSON ที่ระบุว่าข้อมูลจำกัดและช่องที่ไม่มีเป็น unknown

### Requirement: facts-from-harness-only

ระดับความเสี่ยง จำนวน proof และสถานะ role lane SHALL มาจากการคำนวณของ harness เท่านั้น และ harness SHALL NOT อ่านค่าเหล่านี้จากไฟล์หน้าอนุมัติหรือ prototype

#### Scenario: หน้าอ้าง proof เอง

- **GIVEN** ไฟล์หน้าอนุมัติมีข้อความว่าผ่านทุกการทดสอบ แต่ไม่มี receipt ที่ผ่านจริง
- **WHEN** รัน package
- **THEN** จำนวน proof ในข้อมูลไม่เพิ่ม และป้ายหลักฐานของ artifact นั้นเป็น none

#### Scenario: preview ไม่ใช่ proof

- **GIVEN** มี receipt ชนิด preview ของ change นี้
- **WHEN** รัน package
- **THEN** ป้ายเป็น preview ไม่ใช่ proof และ Prove กับ Land ไม่ใช้ receipt นั้น

#### Scenario: ค่าความเสี่ยงมาจาก draft

- **GIVEN** draft ประกาศ impact high และ riskSignals financial
- **WHEN** รัน package
- **THEN** ระดับและเหตุผลคำนวณจากข้อมูลที่ harness ถือเท่านั้น ได้แก่ draft (workType, riskSignals, impact, integrations, store ของ dataModel, ชนิดของ examples) path ของ task และ fileMap, coupling และ securityTriggers ของ change และ work type ของ packet ไม่ใช่จากหน้าอนุมัติหรือ prototype

### Requirement: router-path-signals

ระบบ SHALL ยกระดับความเสี่ยงและ lane อนุมัติจาก path ที่ task แตะ เมื่อ path บอก signal ที่ draft ไม่ได้ประกาศ

- ใช้กับระดับความเสี่ยง domain artifact และ lane อนุมัติเท่านั้น ไม่เปลี่ยน discovery หรือ review
- ตัวอย่างรูปแบบ (ไม่ใช่รายการครบ รายการจริงอยู่ใน PATH_SIGNALS ของ scratch-router.mjs): migrations/ schema prisma และ .sql ให้ persisted-data-change; auth permission rbac ให้ access-control; payment billing refund checkout wallet ให้ financial; tsx jsx vue css และ components pages ให้ user-interface; .tf terraform k8s helm Dockerfile และ .github/workflows ให้ high-operational-risk; webhook ให้ external-integration
- path ที่ตรวจได้แก่ paths ของ task และ fileMap[].path

#### Scenario: migration ที่ไม่ประกาศ

- **GIVEN** workType bugfix impact medium ไม่มี riskSignals และ task แตะ migrations/003_add_status.sql
- **WHEN** เรียก routeChange
- **THEN** ระดับเป็น High และ reasons มี path:migrations/003_add_status.sql→persisted-data-change

#### Scenario: path ปกติ

- **GIVEN** task แตะ src/util/format.js
- **WHEN** เรียก routeChange
- **THEN** ไม่มี signal จาก path

#### Scenario: lane จาก path

- **GIVEN** approval.roles มี security และ task แตะ src/auth/session.js ที่ draft ไม่ประกาศ access-control
- **WHEN** advance --through build โดยอนุมัติแค่ tech-lead
- **THEN** advance ถามหา lane security

### Requirement: chat-approval-card

คำสั่ง change และ skill change SHALL ให้ agent ถามอนุมัติ spec ผ่านเครื่องมือคำถามแบบมีโครงพร้อมตัวเลือก อนุมัติ แก้ไข ขอดูละเอียด ปฏิเสธ โดยคงคำสั่ง advance เดิม

#### Scenario: ถามด้วยการ์ด

- **WHEN** agent ถึงขั้นขออนุมัติ spec
- **THEN** คำสั่งระบุตัวเลือกทั้งสี่ สำหรับ impact medium/high ใส่บรรทัด scratch (get, asIs, toBe, ifFail) ในคำถาม และบันทึกด้วย advance --approve-spec --decision-ref เดิม

#### Scenario: ใช้ถ้อยคำเดิม

- **WHEN** ผู้ใช้ตอบ ลุยเลย หรือ approve
- **THEN** ยังนับเป็นการอนุมัติตาม WORKFLOW.md โดยไม่ถามซ้ำ
