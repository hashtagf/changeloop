# skill-contracts Specification

## Purpose
ทุก skill ระบุ trigger, input, action, output และ handoff เป็นข้อมูลแบบมีโครงสร้างที่ตรวจได้ พร้อมแบ่งงานเป็น AI ทำ, คนทำ และคนตัดสินใจ
## Requirements
### Requirement: สัญญา 5 ข้อมีโครงสร้างที่ตรวจได้

ระบบ SHALL ตรวจว่า contract.json ของ skill มี trigger, inputs, action, outputs, handoff และ responsibility ตาม schema v1

- trigger, action: ข้อความไม่ว่าง
- inputs: array ไม่ว่างของข้อความ
- outputs: array ไม่ว่างของ { kind, description } โดย kind เป็นหนึ่งใน agreement, code, evidence, report, decision-request, document, state, git
- handoff: array ของ { to, when } โดย to เป็น skill:<name>, command:<name> หรือ user
- responsibility: { aiDoes, humanDoes, humanDecides } เป็น array ของข้อความ และ aiDoes ไม่ว่าง
- version ต้องเป็น 1 และ skill ต้องตรงกับชื่อโฟลเดอร์

#### Scenario: สัญญาครบ

- **WHEN** contract.json มีทุก field ถูกชนิด
- **THEN** ไม่มี finding

#### Scenario: ขาด field

- **WHEN** contract.json ไม่มี handoff หรือ outputs ว่าง
- **THEN** finding ระบุ skill และ path ของ field ที่ขาด

#### Scenario: kind ไม่รู้จัก

- **WHEN** output มี kind ที่ไม่อยู่ในรายการ
- **THEN** finding ระบุ path ของ kind และรายการที่ยอมรับ

#### Scenario: JSON เสีย

- **WHEN** contract.json ไม่ใช่ JSON ที่ถูกต้อง
- **THEN** finding ระบุไฟล์ ไม่ถือว่าผ่าน

#### Scenario: ชื่อไม่ตรงโฟลเดอร์

- **WHEN** field skill ไม่ตรงกับชื่อโฟลเดอร์
- **THEN** finding ระบุทั้งสองชื่อ

### Requirement: handoff ชี้ปลายทางที่มีอยู่จริง

ระบบ SHALL ปฏิเสธ handoff ที่ชี้ skill หรือ command ที่ไม่มีอยู่ใน repo

#### Scenario: skill ปลายทางไม่มี

- **WHEN** handoff.to เป็น skill:no-such-skill
- **THEN** finding ระบุ skill ต้นทางและปลายทางที่ไม่มี

#### Scenario: command ปลายทางมีอยู่

- **WHEN** handoff.to เป็น command:deliver และมี .claude/commands/deliver.md
- **THEN** ไม่มี finding

#### Scenario: รูปแบบปลายทางผิด

- **WHEN** handoff.to เป็นข้อความที่ไม่ขึ้นต้นด้วย skill:, command: และไม่ใช่ user
- **THEN** finding ระบุรูปแบบที่ยอมรับ

### Requirement: output ที่ต้องใช้อำนาจคนต้องมีคนตัดสินใจ

ระบบ SHALL ปฏิเสธสัญญาที่มี output kind agreement หรือ git แต่ responsibility.humanDecides ว่าง

- kind ที่ต้องมี humanDecides: agreement, git
- skill ที่ handoff ไป user ต้องมี humanDecides หรือ humanDoes อย่างน้อยหนึ่งข้อ

#### Scenario: git ไม่มีคนตัดสินใจ

- **WHEN** outputs มี kind git และ humanDecides ว่าง
- **THEN** finding บอกให้ระบุสิ่งที่คนต้องตัดสินใจ

#### Scenario: agreement มีคนอนุมัติ

- **WHEN** outputs มี kind agreement และ humanDecides มีการอนุมัติ spec
- **THEN** ไม่มี finding

#### Scenario: ส่งต่อคนแต่ไม่บอกคนทำอะไร

- **WHEN** handoff.to เป็น user และ humanDecides กับ humanDoes ว่างทั้งคู่
- **THEN** finding บอกให้ระบุสิ่งที่คนทำหรือตัดสินใจ

### Requirement: skill ที่ไม่มีสัญญาลดได้อย่างเดียว

ระบบ SHALL ล้มเมื่อ skill ที่ไม่มี contract.json ไม่อยู่ใน baseline และเมื่อ skill ใน baseline มีสัญญาแล้ว

- --tighten ลบ skill ที่มีสัญญาแล้วหรือไม่มีอยู่แล้วออกจาก baseline และไม่เพิ่ม skill ใด
- baseline ที่ไม่มีหรือผิดรูปทำให้ล้ม

#### Scenario: repo ตรง baseline

- **WHEN** skill ที่ไม่มีสัญญาตรงกับ baseline
- **THEN** exit 0

#### Scenario: skill ใหม่ไม่มีสัญญา

- **WHEN** เพิ่มโฟลเดอร์ skill ใหม่ที่มี SKILL.md แต่ไม่มี contract.json
- **THEN** exit ไม่ใช่ 0 พร้อมชื่อ skill และให้เพิ่ม contract.json

#### Scenario: baseline ค้าง

- **WHEN** skill ใน baseline มี contract.json แล้ว
- **THEN** exit ไม่ใช่ 0 พร้อมบอกให้รัน --tighten และ --tighten ลบ skill นั้นออก

#### Scenario: baseline เสีย

- **WHEN** ไฟล์ baseline ไม่มีหรือ JSON ผิดรูป
- **THEN** exit ไม่ใช่ 0 พร้อมชื่อไฟล์

### Requirement: skill หลักของ lifecycle มีสัญญา

ระบบ SHALL มี contract.json ที่ผ่านการตรวจสำหรับ investigate, change, build, prove, land, dev, feature และ changes

#### Scenario: Land อยู่กับคน

- **WHEN** อ่านสัญญาของ land
- **THEN** humanDecides ระบุการสั่ง Land และ output ไม่มี kind git

#### Scenario: Change ส่งต่อให้คนอนุมัติ

- **WHEN** อ่านสัญญาของ change
- **THEN** outputs มี agreement, humanDecides มีการอนุมัติ spec และ handoff มี skill:build

### Requirement: check สัญญาอยู่ใน gate ก่อน commit

ระบบ SHALL รัน check สัญญาของ skill ใน run-all และ affected selector เลือกเมื่อ .claude/skills หรือ .claude/commands เปลี่ยน

#### Scenario: แก้ skill

- **WHEN** ไฟล์ใต้ .claude/skills หรือ .claude/commands เปลี่ยน
- **THEN** affected selector เลือก suite skill contracts

#### Scenario: แก้ไฟล์อื่น

- **WHEN** เปลี่ยนเฉพาะ dashboard/server.mjs
- **THEN** affected selector ไม่เลือก suite skill contracts
