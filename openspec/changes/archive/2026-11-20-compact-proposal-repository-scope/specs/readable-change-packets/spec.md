# readable-change-packets

## ADDED Requirements

### Requirement: Proposals state repository scope from selected repositories

proposal SHALL สรุปขอบเขต repo โดยไม่แจกแจงชื่อ repo ที่ไม่ได้เลือก

#### Scenario: เลือกบาง repo จากหลายร้อย repo

- **GIVEN** โปรเจกต์มี 821 repo และ change เลือก 1 repo
- **WHEN** สร้าง proposal
- **THEN** Scope แสดงชื่อ repo ที่เลือกและบอกว่า repo อื่นอยู่นอกขอบเขตโดยไม่แสดงชื่อ repo เหล่านั้น
- **AND** ข้อจำกัดเรื่อง path และ Non-goals ยังคงอยู่

#### Scenario: เลือกหลาย repo ครบทั้งโปรเจกต์

- **GIVEN** change เลือกครบทุก repo ในโปรเจกต์หลาย repo
- **WHEN** สร้าง proposal
- **THEN** Scope แสดง repo ที่เลือกทั้งหมดโดยไม่อ้างว่ามี repo อื่นอยู่นอกขอบเขต

#### Scenario: โปรเจกต์ repo เดียว

- **GIVEN** โปรเจกต์ใช้ repo เดียว
- **WHEN** สร้าง proposal
- **THEN** Scope ไม่เพิ่มบรรทัดสรุป repo
