# quality-tooling

## ADDED Requirements

### Requirement: reference-governance-fast

การตรวจ reference governance ของ skill SHALL ให้ผลเหมือนเดิมและแตกคำของแต่ละย่อหน้าครั้งเดียว

#### Scenario: skill จริงของ repo

- **WHEN** รันการตรวจกับ .claude/skills
- **THEN** ไม่มี issue และใช้เวลาน้อยกว่า 10 วินาที

#### Scenario: ย่อหน้าซ้ำและเกือบซ้ำ

- **GIVEN** fixture ที่มีย่อหน้าซ้ำและเกือบซ้ำข้ามไฟล์
- **WHEN** รันการตรวจ
- **THEN** รายงาน duplicate และ near-duplicate เหมือนเดิม

#### Scenario: ขนาดชุดคำต่างกันมาก

- **GIVEN** ย่อหน้ายาว 40 คำกับย่อหน้ายาว 100 คำที่มีคำของย่อหน้าแรกครบ
- **WHEN** รันการตรวจ
- **THEN** ไม่รายงาน near-duplicate
