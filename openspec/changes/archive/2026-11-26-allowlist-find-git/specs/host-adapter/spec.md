# host-adapter

## ADDED Requirements

### Requirement: headless-read-deny

installer SHALL ติดตั้ง permissions.deny ที่ปฏิเสธ flag ของ find และ git ที่ลบ เขียน หรือรันคำสั่ง ควบคู่กับ allowlist อ่านอย่างเดียว

#### Scenario: find ลบไฟล์ถูกปฏิเสธ

- **GIVEN** settings.json ที่ installer ติดตั้ง
- **WHEN** ตรวจคำสั่ง find . -delete, find -delete, find . -exec rm {} + และ find . -execdir sh -c x
- **THEN** แต่ละคำสั่งตรงกับกฎใน permissions.deny

#### Scenario: git เขียนไฟล์ถูกปฏิเสธ

- **WHEN** ตรวจคำสั่ง git diff --output=x, git log -p --output=x และ git show HEAD --output=x
- **THEN** แต่ละคำสั่งตรงกับกฎใน permissions.deny

#### Scenario: คำสั่งอ่านยังผ่าน

- **WHEN** ตรวจคำสั่ง find . -name '*.md', git diff HEAD~1, git log --oneline และ git show HEAD
- **THEN** ไม่มีคำสั่งใดตรงกับกฎ deny

#### Scenario: upgrade ใส่ deny ให้โปรเจกต์เดิม

- **GIVEN** settings.json เดิมมี permissions.deny ของผู้ใช้ Bash(rm *)
- **WHEN** รัน install.sh
- **THEN** permissions.deny เป็นกฎผู้ใช้ตามด้วยกฎที่ ship และรันซ้ำไม่เพิ่มอะไร

#### Scenario: opt-out ไม่แตะ deny

- **GIVEN** --no-permission-allowlist
- **WHEN** รัน install.sh
- **THEN** ไม่มีกฎ deny ที่ ship ถูกเพิ่ม และ install ใหม่ไม่มี permissions

#### Scenario: คำสั่ง headless ที่พิมพ์ออกมา

- **WHEN** installer พิมพ์คำสั่ง claude -p ตัวอย่าง
- **THEN** คำสั่งมี --disallowedTools ที่มีกฎ deny ทั้งหมด
