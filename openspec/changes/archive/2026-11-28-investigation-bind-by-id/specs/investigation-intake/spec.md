# investigation-intake

## ADDED Requirements

### Requirement: investigation-binding-by-id

การอ่าน draft SHALL เติม binding ของ investigation จาก state ปัจจุบันเมื่อ draft ระบุ investigation เป็น id หรือ object ที่มีแค่ id

- state ต้องเป็น DONE และ ready-for-change จึงได้ binding เต็ม
- state ที่ไม่มีหรือยังไม่เสร็จได้ binding ที่มีแค่ version, id และ statePath ซึ่ง validation รายงานสาเหตุ
- binding เต็มที่ draft เขียนเองใช้ตามเดิม
- ข้อความแก้ของ binding ที่ไม่ตรงหรือไม่มี intake บอกให้ใช้ "investigation": "<id>"

#### Scenario: ผูกด้วย id

- **GIVEN** investigation demo เป็น DONE ready-for-change
- **WHEN** draft มี investigation เป็น demo
- **THEN** binding เท่ากับ handoff ของ state และผ่าน validation

#### Scenario: object มีแค่ id

- **GIVEN** investigation demo เป็น DONE ready-for-change
- **WHEN** draft มี investigation เป็น { id: demo }
- **THEN** binding เท่ากับ handoff ของ state

#### Scenario: ยังไม่เสร็จ

- **GIVEN** investigation demo ยัง investigating
- **WHEN** draft มี investigation เป็น demo
- **THEN** validation รายงานว่าต้องเป็น ready-for-change DONE state

#### Scenario: binding เต็มเดิม

- **GIVEN** draft มี binding เต็มที่มี statePath
- **WHEN** อ่าน draft
- **THEN** binding ไม่ถูกแก้
