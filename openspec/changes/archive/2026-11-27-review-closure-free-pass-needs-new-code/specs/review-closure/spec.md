# review-closure

## ADDED Requirements

### Requirement: free-pass-needs-new-code

รอบรีวิว AI ที่ผ่าน SHALL ไม่นับเพดานเฉพาะเมื่อ workspace ปัจจุบันต่างจาก workspace ของรอบที่ส่งผลล่าสุด

#### Scenario: pass สองรอบ แล้วขอรอบสามบนโค้ดเดิม

- **GIVEN** รอบ 1 pass บน w0 รอบ 2 pass บน w1 และ workspace ปัจจุบันเป็น w1
- **WHEN** ระบบคำนวณเพดาน
- **THEN** เพดานเป็น 2 จึงปฏิเสธรอบสาม

#### Scenario: pass แล้วแก้โค้ด

- **GIVEN** รอบ 1 fail บน w1 รอบ 2 pass บน w2 และ workspace ปัจจุบันเป็น w3
- **WHEN** ระบบคำนวณเพดาน
- **THEN** เพดานเป็น 3
