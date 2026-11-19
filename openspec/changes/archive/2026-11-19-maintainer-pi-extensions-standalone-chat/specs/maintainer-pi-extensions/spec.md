# maintainer-pi-extensions

## ADDED Requirements

### Requirement: standalone-chat

ส่วนขยาย 9Router SHALL ส่งข้อความได้เมื่อติดตั้งนอก repo โดยไม่ต้องติดตั้งแพ็กเกจเพิ่ม

#### Scenario: แชตผ่านส่วนขยายที่ติดตั้ง

- **WHEN** Pi โหลดส่วนขยายจากโฟลเดอร์แยกที่ไม่มี node_modules และส่งข้อความไปยัง 9Router หลังล็อกอิน
- **THEN** Pi รับข้อความตอบกลับจากปลายทางที่บันทึกไว้โดยไม่มีข้อผิดพลาดว่าไม่พบโมดูล
