# advisory-guards Specification

## Purpose
Change Loop guard แนะนำแทนการบล็อก: Land, Deliver, commit/push, แก้นอกงาน, shell และจำนวน worker เตือนแล้วให้ทำต่อ.
## Requirements
### Requirement: guide-mode-runs

phase-mutation-guard ในโหมด auto SHALL ให้ commit/push จาก main checkout ระหว่าง Build หรือ Prove และ Deliver ที่ไม่มีคำสั่ง /deliver รันตามที่สั่ง พร้อมคำเตือน

- คำเตือนบอกว่า commit/push/Deliver เป็นการตัดสินใจของผู้ใช้ และบันทึกลง guardrail audit

#### Scenario: commit ระหว่าง Build รันได้

- **GIVEN** phase เป็น build และ guard อยู่ในโหมด auto
- **WHEN** เอเจนต์รัน bash: git commit -m x ใน main checkout
- **THEN** hook ไม่คืน updatedInput ที่เปลี่ยนคำสั่ง
- **AND** additionalContext เตือนว่า commit เป็นการตัดสินใจของผู้ใช้

#### Scenario: Deliver ไม่มี /deliver รันได้

- **GIVEN** guard อยู่ในโหมด auto
- **WHEN** เอเจนต์รัน bash: cloop deliver advance demo
- **THEN** hook ไม่บล็อกและไม่เปลี่ยนคำสั่ง
- **AND** additionalContext เตือนเรื่อง Deliver

### Requirement: shell-route-advice

shell-route-guard SHALL ให้เส้นทางที่แนะนำเป็นคำแนะนำ และ SHALL ปฏิเสธเฉพาะเมื่อ FOUNDATION_SHELL_GUARD หรือ FOUNDATION_GUARDRAIL_MODE เป็น block

#### Scenario: cd ต่อด้วย git ได้คำแนะนำ

- **WHEN** hook ได้ Bash: cd /repo && git status โดยไม่มี env block
- **THEN** ผลเป็น additionalContext ที่แนะนำ git -C และไม่มี decision block

#### Scenario: โหมด block ยังปฏิเสธ

- **GIVEN** FOUNDATION_SHELL_GUARD=block
- **WHEN** hook ได้ Bash: cd /repo && git status
- **THEN** ผลมี decision block

### Requirement: detached-authority-advice

no-detached-authority SHALL เขียนคำสั่ง authority run ที่ detach ให้รันแบบ foreground และ SHALL แค่เตือนเมื่อเขียนใหม่ไม่ได้ เว้นแต่ FOUNDATION_GUARDRAIL_MODE เป็น block

#### Scenario: เขียนใหม่ไม่ได้ได้แค่คำเตือน

- **GIVEN** ไม่ได้ตั้ง FOUNDATION_GUARDRAIL_MODE
- **WHEN** hook ได้คำสั่ง authority run ที่ยัง detach หลังเขียนใหม่
- **THEN** ผลเป็น additionalContext ไม่มี decision block

#### Scenario: โหมด block ยังปฏิเสธ

- **GIVEN** FOUNDATION_GUARDRAIL_MODE=block
- **WHEN** hook ได้ cloop authority run demo &
- **THEN** ผลมี decision block

### Requirement: secrets-still-redacted

การเปลี่ยนเป็นคำเตือน SHALL ไม่เปลี่ยนการปิดค่าลับ: Read, Grep และ Bash ที่อ่านไฟล์ลับยังถูกเขียนใหม่ไปอ่านสำเนาที่ปิดค่าหรือถูกปฏิเสธ

#### Scenario: อ่าน .env บน Pi ยังได้สำเนาที่ปิดค่า

- **GIVEN** โปรเจกต์มี .env ที่มีค่าลับ และ Pi อยู่ในโหมด auto
- **WHEN** เอเจนต์เรียก read .env
- **THEN** ผลไม่มีค่าลับเดิม

### Requirement: advisory-docs

AGENTS.md, CLAUDE.md, WORKFLOW.md, hooks README, harness README, phase-mutation-guard.md, build lifecycle, หน้า install ภาษาอังกฤษและไทย และ CHANGELOG SHALL อธิบายว่า guard เตือนแทนการบล็อก โดย Land ยังต้องผ่านเงื่อนไขความพร้อมของ runtime และการอนุมัติ Land เป็นแนวทางของเอเจนต์

#### Scenario: เอกสารสอดคล้อง

- **WHEN** รัน doc consistency check
- **THEN** ทุก assertion ผ่าน
