# prove

## ADDED Requirements

### Requirement: lingering-test-run-languages

การตรวจ test ที่จบแล้วแต่คำสั่งค้าง SHALL อ่านเวลาเทสต์ของ go test, pytest, cargo test, RSpec และ JUnit XML ที่อยู่ใน output ด้วย

- go test: บรรทัด ok หรือ FAIL ของ package พร้อมเวลาเป็นวินาที
- pytest: บรรทัดสรุป in <n>s
- cargo test: finished in <n>s
- RSpec: Finished in <n> seconds
- JUnit XML: แอตทริบิวต์ time ของ testsuite ระดับบนสุด
- รูปแบบเวลาเก็บใน toolchain pack ที่ harness ติดตั้ง

#### Scenario: go test ค้าง

- **GIVEN** output มี ok example.com/a 1.2s และ ok example.com/b 0.8s และคำสั่งใช้ 120 วินาที
- **WHEN** harness ตรวจผล
- **THEN** รายงานว่าค้าง เวลาเทสต์ 2s

#### Scenario: pytest ช้าจริง

- **GIVEN** output มี 12 passed in 95.00s และคำสั่งใช้ 100 วินาที
- **WHEN** harness ตรวจผล
- **THEN** ไม่รายงานว่าค้าง

#### Scenario: JUnit XML

- **GIVEN** output มี testsuites ที่มี testsuite time="3.5" สองชุด และคำสั่งใช้ 90 วินาที
- **WHEN** harness ตรวจผล
- **THEN** รายงานว่าค้าง เวลาเทสต์ 7s

### Requirement: force-exit-node-options

harness SHALL เพิ่ม --test-force-exit ให้ node --test ที่มี option นำหน้าทั้งในบรรทัด shell และใน argv ที่มี option ที่รับค่าของ test runner

- บรรทัด shell: node --import tsx --test, node -r x --test
- option ที่รับค่า: --test-timeout, --test-shard, --test-skip-pattern, --watch-path, --test-coverage-include, --test-coverage-exclude

#### Scenario: shell line มี --import

- **GIVEN** verify คือ node --import tsx --test tests/
- **WHEN** harness เตรียมบรรทัด shell
- **THEN** --test-force-exit อยู่ถัดจาก --test

#### Scenario: argv มี --test-timeout

- **GIVEN** argv คือ node --test-timeout 5000 --test
- **WHEN** harness เตรียม argv
- **THEN** --test-force-exit อยู่ถัดจาก --test

#### Scenario: script ที่รับ --test

- **GIVEN** บรรทัด shell คือ node scripts/x.js --test
- **WHEN** harness เตรียมบรรทัด
- **THEN** ไม่ถูกเปลี่ยน
