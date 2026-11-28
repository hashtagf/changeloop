# quality-tooling

## ADDED Requirements

### Requirement: fast-checks-guide

skill onboard SHALL มีคู่มือ references/fast-checks.md ที่บอกวิธีทำให้เทสต์และเครื่องมือตรวจของโปรเจกต์รันเร็ว และขั้นตอน onboard SHALL ให้ agent เสนอการแก้ lane ที่ช้าผ่าน /change

- หัวข้อ: แยกชุดเร็วกับชุดเต็ม, verify ต่อ task รันเฉพาะไฟล์ของตน, ปิดทรัพยากรในเทสต์, รันขนานและ cache, lint และ type-check ที่เร็ว, output ที่ harness อ่านได้
- มีคำสั่งตัวอย่างของ JS/TS, Go, Python, Rust, JVM, Ruby, Dart

#### Scenario: คู่มือมีครบ

- **WHEN** อ่าน .claude/skills/onboard/references/fast-checks.md
- **THEN** มีหกหัวข้อและตัวอย่างของทุกภาษาที่ระบุ

#### Scenario: skill อ้างถึงคู่มือ

- **WHEN** อ่าน .claude/skills/onboard/SKILL.md
- **THEN** References มี references/fast-checks.md และขั้นตอนตรวจสุดท้ายให้เสนอการแก้ lane ที่ช้า

### Requirement: slow-lane-hint

quality doctor SHALL รายงาน info provider-slow สำหรับ lane ที่การรันล่าสุดใช้นานกว่าเกณฑ์ พร้อมจำนวนวินาทีและชี้คู่มือ fast-checks

- เกณฑ์: lane test 120 วินาที lane อื่น 60 วินาที
- อ่านจาก history ล่าสุดของ lane; lane ที่ยังไม่เคยรันไม่ได้คำแนะนำ
- ไม่ทำให้ doctor fail

#### Scenario: test lane ช้า

- **GIVEN** history ล่าสุดของ lane test ใช้ 300 วินาที
- **WHEN** quality doctor รัน
- **THEN** มี provider-slow ที่บอก 300s และชี้ fast-checks

#### Scenario: lane เร็ว

- **GIVEN** history ล่าสุดของ lane test ใช้ 30 วินาที
- **WHEN** quality doctor รัน
- **THEN** ไม่มี provider-slow

#### Scenario: ยังไม่เคยรัน

- **GIVEN** lane ไม่มี history
- **WHEN** quality doctor รัน
- **THEN** ไม่มี provider-slow
