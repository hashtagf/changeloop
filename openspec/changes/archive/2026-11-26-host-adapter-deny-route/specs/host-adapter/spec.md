# host-adapter

## ADDED Requirements

### Requirement: deny-route

shell-route-guard SHALL ตอบคำสั่งที่ตรงกับกฎ permissions.deny ของโปรเจกต์ด้วยเหตุผลและคำสั่งที่รันได้แทน

- ตอบเป็น block พร้อมเหตุผล เพราะ host จะปฏิเสธคำสั่งนั้นอยู่แล้ว จึงไม่ลดสิ่งที่ agent ทำได้
- ใช้เฉพาะเมื่อมีกฎ deny ที่ตรงจริงใน settings ของโปรเจกต์หรือผู้ใช้
- FOUNDATION_GUARDRAIL_MODE=off ปิดการตอบนี้

#### Scenario: find -exec grep

- **GIVEN** settings มี Bash(find * -exec*) ใน permissions.deny
- **WHEN** agent รัน find . -name '*.md' -exec grep -l x {} +
- **THEN** hook block พร้อมเหตุผลที่แนะนำ rg หรือ Grep tool

#### Scenario: find -delete

- **GIVEN** settings มีกฎ deny ของ find -delete
- **WHEN** agent รัน find build -name '*.tmp' -delete
- **THEN** เหตุผลแนะนำให้รัน find build -name '*.tmp' -print ก่อน แล้วลบด้วยคำสั่งแยก

#### Scenario: git --output

- **GIVEN** settings มีกฎ deny ของ git diff --output
- **WHEN** agent รัน git diff HEAD~1 --output=patch.diff
- **THEN** เหตุผลแนะนำ git diff HEAD~1 > patch.diff

#### Scenario: ไม่มีกฎ deny

- **GIVEN** settings ไม่มี permissions.deny
- **WHEN** agent รัน find . -exec grep x {} +
- **THEN** hook ไม่ตอบอะไร

#### Scenario: คำสั่งอ่านปกติ

- **GIVEN** settings มีกฎ deny ที่ ship
- **WHEN** agent รัน find . -name '*-okhttp*'
- **THEN** hook ไม่ตอบอะไร

#### Scenario: ปิด guard

- **GIVEN** FOUNDATION_GUARDRAIL_MODE=off
- **WHEN** agent รัน find . -delete
- **THEN** hook ไม่ตอบอะไร
