# land

## ADDED Requirements

### Requirement: backup-ignored-exclude

การ backup งานที่ยังไม่ Land ของ sandbox SHALL สำเร็จเมื่อ pathspec exclude ชี้ไปยังโฟลเดอร์ที่ git ignore อยู่

- exclude ที่ชี้ไปยัง path ที่ถูก ignore ไม่ถูกส่งให้ git add เพราะ git add -A ไม่ add path ที่ถูก ignore อยู่แล้ว
- diff ของ backup ยังใช้ pathspec เดิม

#### Scenario: มี test-results ที่ถูก ignore

- **GIVEN** sandbox มี test-results/a.png ที่ .gitignore ครอบ และไฟล์ src/x.js ที่ target ไม่มี
- **WHEN** backup ก่อนลบ sandbox
- **THEN** backup เขียน changes.patch ที่มี src/x.js และไม่มี test-results

#### Scenario: exclude ที่ไม่ถูก ignore

- **GIVEN** sandbox มี coverage/a.json ที่ไม่ถูก ignore
- **WHEN** backup ก่อนลบ sandbox
- **THEN** changes.patch ไม่มี coverage/a.json
