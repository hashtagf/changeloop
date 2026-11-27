# quality-tooling

## ADDED Requirements

### Requirement: no-tests-only-when-known

discovery และ readiness SHALL บอกว่า repo ไม่มีเทสต์เฉพาะเมื่อการนับไฟล์เทสต์เดินครบ และ repo มีภาษาที่ระบบรู้จักรูปแบบไฟล์เทสต์เท่านั้น

- รูปแบบไฟล์เทสต์เพิ่ม: *Test.java, *Tests.java, *Test.kt, *Test.php, *_test.dart, tests/*.rs, ไฟล์ใน __tests__/
- ภาษาที่รู้จักรูปแบบ: JS/TS, Go, Python, Ruby, Java/Kotlin, PHP, Dart, Rust
- นับไม่ครบหรือภาษาไม่รู้จัก testFiles เป็น null, ไม่มี test-setup และ readiness คงข้อความ no test lane

#### Scenario: Java มีเทสต์

- **GIVEN** build.gradle และ src/test/java/FooTest.java ไม่มีเครื่องมือบน PATH
- **WHEN** quality discover รัน
- **THEN** testFiles เป็น 1 และไม่มี test-setup

#### Scenario: __tests__

- **GIVEN** package.json ไม่มี scripts.test และ src/__tests__/a.js
- **WHEN** quality discover รัน
- **THEN** testFiles เป็น 1

#### Scenario: นับไม่ครบ

- **GIVEN** การเดินเกินเพดานจำนวนไฟล์
- **WHEN** นับไฟล์เทสต์
- **THEN** ได้ null ไม่ใช่ 0

#### Scenario: ภาษาที่ไม่รู้จักรูปแบบ

- **GIVEN** repo Terraform อย่างเดียวไม่มี lane test
- **WHEN** quality discover รัน
- **THEN** testFiles เป็น null และไม่มี test-setup

### Requirement: ci-list-commands

การอ่านคำสั่งเทสต์จาก CI SHALL อ่าน script แบบรายการหลายบรรทัดของ GitLab และ Bitbucket โดยไม่มีเครื่องหมาย - นำหน้าคำสั่ง

#### Scenario: GitLab script แบบรายการ

- **GIVEN** .gitlab-ci.yml มี script: ขึ้นบรรทัดใหม่ - npm test
- **WHEN** quality discover รัน
- **THEN** proposals มี npm test รายการเดียว ไม่มี - npm test

#### Scenario: Bitbucket script แบบรายการ

- **GIVEN** bitbucket-pipelines.yml มี script: ขึ้นบรรทัดใหม่ - go test ./...
- **WHEN** quality discover รัน
- **THEN** proposals มี go test ./... จาก bitbucket-pipelines.yml
