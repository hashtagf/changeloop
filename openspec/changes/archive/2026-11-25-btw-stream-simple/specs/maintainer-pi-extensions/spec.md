# maintainer-pi-extensions

## ADDED Requirements

### Requirement: btw-provider-neutral-call

/btw SHALL เรียกโมเดลผ่าน modelRegistry.streamSimple ด้วย AbortSignal ของตัวเอง ซึ่งเป็นเส้นทางที่ Pi route โมเดลเสมือนสำหรับคำขอนอก agent loop

#### Scenario: ใช้ streamSimple ไม่ใช่ complete

- **GIVEN** โมเดลปัจจุบันถูกเลือกไว้
- **WHEN** ผู้ใช้พิมพ์ /btw คำถาม
- **THEN** คำตอบมาจาก modelRegistry.streamSimple
- **AND** ไม่เรียก modelRegistry.complete

#### Scenario: ยกเลิกยังใช้ signal ของตัวเอง

- **GIVEN** คำตอบยังไม่มา
- **WHEN** ผู้ใช้กด Esc
- **THEN** signal ที่ส่งให้ streamSimple ถูก abort และงานหลักไม่ถูก abort
