# release-gate-reliability

## Purpose

รักษาชุดตรวจรีลีสบน macOS ให้ผ่านได้โดยไม่ลดการตรวจ.

## ADDED Requirements

### Requirement: release-macos-verification

การซ้อมรีลีสบน macOS SHALL คงชุดตรวจทั้งหมดและไม่ผูกผลทดสอบ readiness กับอายุโปรเซสจำลองแบบตายตัว

#### Scenario: รอจนตรวจ readiness สำเร็จ

- **GIVEN** เซิร์ฟเวอร์ทดสอบตอบ 503 ก่อน 200
- **WHEN** ทดสอบ process runtime ภายใต้ coverage
- **THEN** โปรเซสทดสอบอยู่จนตรวจคำตอบพร้อมได้ และการทดสอบยังยืนยันการลองใหม่

#### Scenario: จำกัดงานพร้อมกันบน runner รีลีส

- **GIVEN** release workflow รันชุดตรวจทั้งหมดบน macOS
- **WHEN** เริ่ม deterministic gate
- **THEN** ใช้จำนวนงานพร้อมกันที่จำกัดและยังเรียก release gate ชุดเดิมครบ
