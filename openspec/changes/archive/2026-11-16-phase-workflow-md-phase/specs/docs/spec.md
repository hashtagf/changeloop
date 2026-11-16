# docs

## ADDED Requirements

### Requirement: รายละเอียดแต่ละ phase อยู่ในไฟล์ของ phase นั้น

ระบบ SHALL เก็บสัญญาเต็มของแต่ละ lifecycle command ไว้ในไฟล์เดียวต่อ phase ใต้ .claude/harness/lifecycle/ และให้ WORKFLOW.md เหลือสรุปพร้อมลิงก์

#### Scenario: ไฟล์ phase ครบและลิงก์จาก WORKFLOW.md

- **WHEN** อ่านส่วน Lifecycle commands ของ WORKFLOW.md
- **THEN** ทุก phase มีหัวข้อเดิม สรุปสั้น และลิงก์ไปไฟล์ใน .claude/harness/lifecycle/ ที่มีอยู่จริง

#### Scenario: anchor เดิมยังเปิดได้

- **WHEN** เปิด WORKFLOW.md#land-change, #deliver-change-optional หรือ #blocking-policy
- **THEN** หัวข้อนั้นยังมีอยู่ใน WORKFLOW.md

#### Scenario: ไม่มีเนื้อหาหาย

- **WHEN** เทียบย่อหน้าของส่วน Lifecycle commands เดิมกับไฟล์ใหม่
- **THEN** ทุกย่อหน้าเดิมอยู่ในไฟล์ phase ใดไฟล์หนึ่ง

#### Scenario: ลิงก์ที่ชี้ส่วนที่ย้ายไม่เสีย

- **WHEN** เอกสารใน repo ลิงก์ไปยัง anchor ที่ย้ายออกจาก WORKFLOW.md
- **THEN** documentation test ล้มพร้อมชื่อลิงก์ที่เสีย
