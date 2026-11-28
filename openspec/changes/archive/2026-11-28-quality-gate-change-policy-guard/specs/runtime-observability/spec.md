# runtime-observability

## ADDED Requirements

### Requirement: typed-gate-and-unknown-change-blockers

ระบบ SHALL จัดการหยุดที่ข้อความระบุ quality gate เป็นรหัส quality-gate และข้อความ unknown change เป็นรหัส unknown-change ก่อนตกไปที่ policy-guard

- ลำดับ precedence: budget, authority, resource conflict, workspace, contract, quality gate, unknown change แล้วจึง policy-guard
- quality-gate มี classification quality และ recovery cloop advance <id> --through proven
- unknown-change มี classification input และ recovery cloop change start .foundation/drafts/<id>

#### Scenario: quality gate ไม่ผ่าน

- **WHEN** การหยุดมีข้อความ consumer quality gate fail ใน change a
- **THEN** รหัสเป็น quality-gate และ recovery เป็น cloop advance a --through proven

#### Scenario: change ที่ยังไม่เริ่ม

- **WHEN** การหยุดมีข้อความ unknown change 'a'
- **THEN** รหัสเป็น unknown-change และ recovery เป็น cloop change start .foundation/drafts/a

#### Scenario: ข้อความไม่เข้าคลาสไหน

- **WHEN** การหยุดมีข้อความ unclassified stop
- **THEN** รหัสยังเป็น policy-guard

### Requirement: lessons-regroup-generic-history

lessons SHALL จัดกลุ่ม row ที่บันทึกเป็น policy-guard ใหม่ตาม reason ที่บันทึกไว้ และนับบทเรียน quality-gate เป็น enforced โดย quality gate

- row ที่รหัสอื่นนอกจาก policy-guard ใช้รหัสเดิม
- row policy-guard ที่ reason ไม่เข้าคลาสไหนยังเป็น policy-guard
- บทเรียน quality-gate มี status enforced และไม่มี adoption draft

#### Scenario: ประวัติ gate เดิม

- **WHEN** สาม change มี row policy-guard ที่ reason เป็น consumer quality gate fail
- **THEN** lessons แสดง quality-gate สาม change status enforced และไม่มีบทเรียน policy-guard

#### Scenario: ประวัติ unknown change เดิม

- **WHEN** สอง change มี row policy-guard ที่ reason เป็น unknown change และหนึ่ง change มี reason ไม่เข้าคลาส
- **THEN** ไม่มีบทเรียนที่ถึงสาม change

#### Scenario: รหัสอื่นไม่ถูกแตะ

- **WHEN** row มีรหัส contract-invalid และ reason consumer quality gate fail
- **THEN** นับเป็น contract-invalid
