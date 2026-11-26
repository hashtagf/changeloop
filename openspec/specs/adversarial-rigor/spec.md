# adversarial-rigor Specification

## Purpose
Brainstorming หาจุดอ่อนก่อนแนะนำ และ reviewer ไม่เชื่อคำอ้าง.
## Requirements
### Requirement: brainstorm-challenge

skill brainstorming SHALL ให้ agent หาจุดอ่อนของทุกทางเลือกก่อนแนะนำ

#### Scenario: มีขั้นหาจุดอ่อน

- **WHEN** context budget test อ่าน brainstorming SKILL.md
- **THEN** พบข้อความสั่งหาจุดอ่อนของแต่ละทางเลือกก่อนแนะนำ

#### Scenario: ไม่ชมไอเดียผู้ใช้

- **WHEN** context budget test อ่าน brainstorming SKILL.md
- **THEN** พบข้อความห้ามชมไอเดียของผู้ใช้

#### Scenario: อยู่ในงบคำ

- **WHEN** รัน context budget test
- **THEN** SKILL.md ทั้งหมดรวมไม่เกิน 9500 คำ

### Requirement: reviewer-skepticism

prompt ของ configured code reviewer SHALL สั่งให้ถือ agreement, สรุป task และผลที่ผ่านเป็นคำอ้างที่ต้องตรวจ และห้ามลดระดับ defect เพราะคำอ้างนั้น

#### Scenario: รีวิวเต็มมีคำสั่ง

- **WHEN** สร้าง prompt จาก packet แบบ full
- **THEN** prompt มีคำสั่งถือคำอ้างเป็นสิ่งที่ต้องตรวจและห้ามชม

#### Scenario: diff-only และ delta มีคำสั่ง

- **WHEN** สร้าง prompt จาก packet แบบ diff-only หรือ delta
- **THEN** prompt มีคำสั่งเดียวกัน

#### Scenario: ไม่เปลี่ยนเกณฑ์ผ่าน

- **WHEN** reviewer คืนผล pass โดยไม่มี finding
- **THEN** ผลยังเป็น pass เหมือนเดิม
