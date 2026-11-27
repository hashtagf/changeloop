# quality-tooling

## ADDED Requirements

### Requirement: test-gap-machine-independent

เทสต์ของการนับไฟล์เทสต์ SHALL ให้ผลเดียวกันไม่ว่าเครื่องจะติดตั้งเครื่องมือของภาษานั้นหรือไม่

#### Scenario: ไม่มี gradle

- **GIVEN** repo Gradle มี src/test/java/FooTest.java และ PATH ไม่มี gradle
- **WHEN** quality discover รัน
- **THEN** testFiles เป็น 1

#### Scenario: มี gradle

- **GIVEN** repo เดียวกันและ PATH มี gradle
- **WHEN** quality discover รัน
- **THEN** เสนอ test เป็น gradle test
