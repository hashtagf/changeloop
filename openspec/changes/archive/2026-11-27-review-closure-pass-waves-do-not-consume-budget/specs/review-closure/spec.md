# review-closure

## ADDED Requirements

### Requirement: pass-waves-do-not-consume-budget

เพดานรอบรีวิว AI SHALL นับเฉพาะรอบที่ผลไม่ใช่ pass โดยรอบ pass สูงสุด 3 รอบไม่ใช้เพดาน และ closure wave SHALL คิดจากรอบที่ไม่ผ่าน

- รอบ pass ที่เกิน 3 รอบนับในเพดานตามปกติ
- closure wave มีเมื่อรอบที่ไม่ผ่านมีสองรอบ รอบล่าสุดในนั้น fail และ workspace เปลี่ยนจากรอบนั้น
- การขอรอบเพิ่มด้วย authority extend-review ยังเพิ่มจากจำนวนรอบที่ส่งผลแล้วหนึ่งรอบ

#### Scenario: fail แล้ว pass แล้วโค้ดเปลี่ยน

- **GIVEN** รอบ 1 fail รอบ 2 pass และ workspace เปลี่ยนหลังรอบ 2
- **WHEN** ระบบคำนวณเพดาน
- **THEN** เพดานเป็น 3 จึงรีวิวรอบ 3 ได้เอง

#### Scenario: fail pass fail แล้วแก้

- **GIVEN** รอบ 1 fail รอบ 2 pass รอบ 3 fail และ workspace เปลี่ยนหลังรอบ 3
- **WHEN** ระบบคำนวณเพดาน
- **THEN** เพดานเป็น 4 (closure wave จากรอบที่ไม่ผ่านสองรอบ บวกรอบ pass หนึ่งรอบ)

#### Scenario: fail สองรอบติด

- **GIVEN** รอบ 1 fail รอบ 2 fail และ workspace ไม่เปลี่ยน
- **WHEN** ระบบคำนวณเพดาน
- **THEN** เพดานเป็น 2 เหมือนเดิม

#### Scenario: pass เกินสามรอบ

- **GIVEN** รอบ pass ห้ารอบ
- **WHEN** ระบบคำนวณเพดาน
- **THEN** เพดานเป็น 5 (2 บวก 3) จึงต้องถามผู้ใช้ก่อนรอบ 6
