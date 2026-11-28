<!-- change-loop:generated-investigation-report:v1 -->
# รายงานการสำรวจปัญหา: phase-language-repo-coverage

**สถานะ:** ข้อสรุปปัจจุบัน

อัปเดต: 2026-11-28T14:18:03.519Z · 3ed1e8f6c75a026103033db42f7b078dcad48bbba985865ec2cfbfb3caf1a9de

## ปัญหา

ทุก phase (Investigate, Change, Build, Prove, Land) รองรับทุกภาษาโปรแกรมและหลาย repository แล้วหรือยัง

## ความต้องการและบริบทที่บันทึกไว้

**เป้าหมาย:** รู้ว่าแต่ละ phase ทำงานกับภาษาและโครงสร้าง repo ใดได้เองโดยไม่ต้องตั้งค่า และตรงไหนที่ agent ต้องตั้งค่าเองหรือได้ผลลดลง

**ผลลัพธ์ที่ต้องการ:** ตารางช่องว่างตาม phase และภาษา พร้อมลำดับที่ควรแก้


### ผู้เกี่ยวข้อง

- maintainer
- consumer agent

### ขอบเขต

- toolchain packs
- sandbox setup
- test evidence discovery
- test count parsing
- test discrimination
- path classification
- multi-repository setup

## ข้อสรุปปัจจุบัน

ยังไม่ครบ Investigate และ Land ไม่ขึ้นกับภาษา Change ขึ้นกับภาษาแค่การจัดไฟล์เทสต์ quality gate (static/lint/test lane) ครอบ 18 pack แต่ Build ติดตั้ง dependency ให้เฉพาะ JS ที่ root และ Prove หา test provider และนับจำนวนเทสต์ได้เองเฉพาะ JS, Go -json, Python unittest; ภาษาอื่นต้องให้ agent ตั้ง setupCommand และ test provider เอง และ JVM, PHP, .NET, Dart, Swift, Elixir ยังได้ผลนับเป็น inconclusive จนกว่าจะใช้ reporter JSON/TAP ช่องที่คุ้มสุดคือ parser JUnit XML และ test provider จาก quality test lane

## ข้อเสนอแนะและเหตุผล

Prove นับจำนวนเทสต์จาก JUnit XML และบรรทัดสรุปของ runner หลักทุก pack ใช้ test lane ใน quality config เป็น test provider เมื่อไม่มี package.json และ Build ติดตั้ง dependency จาก lockfile ของทุก pack ในทุก repository

## ข้อเท็จจริงที่มีแหล่งอ้างอิง

- **packs:** toolchain pack มี 18 ตัว: JS/TS, Go, Python, PHP, Bash, SQL, MongoDB, HTML, CSS แบบเต็ม capability และ Dart/Flutter, JVM Gradle, JVM Maven, Rust, Ruby (test+static), Terraform, Helm, Dockerfile, Kubernetes (static เท่านั้น); ไม่มี .NET, Swift, Elixir, C/C++, Scala ([.claude/harness/runtime/quality/toolchain-packs.json](<../../.claude/harness/runtime/quality/toolchain-packs.json>))
- **build-setup-js-only:** Build ติดตั้ง dependency ให้เองเฉพาะ root workspace ที่มี package.json พร้อม lockfile ของ npm/pnpm/yarn/bun ภาษาอื่น (เช่น vendor/ ของ composer, .venv ของ Python) ต้องตั้ง sandbox.setupCommand เอง ([.claude/harness/runtime/workflow/sandbox/sandbox-setup.mjs](<../../.claude/harness/runtime/workflow/sandbox/sandbox-setup.mjs>))
- **sibling-setup-configured-only:** repository อื่นนอกจาก root ใน topology หลาย repo ไม่มีการติดตั้งจาก lockfile อัตโนมัติ รันเฉพาะ setupCommand ที่ประกาศ แม้เป็น repo JS ([.claude/harness/runtime/workflow/sandbox/sandbox-repositories.mjs](<../../.claude/harness/runtime/workflow/sandbox/sandbox-repositories.mjs>))
- **prove-test-discovery-js-only:** Prove หา test provider เองได้เฉพาะ repo ที่มี package.json (vitest, jest, mocha, node --test) ภาษาอื่นได้ unresolved 'configure a project-owned test command in execution.yaml' ให้ agent ตั้งเอง ส่วน static-analysis ใช้ consumer quality gate ที่ครอบทุก pack ([.claude/harness/runtime/evidence/evidence-bootstrap.mjs](<../../.claude/harness/runtime/evidence/evidence-bootstrap.mjs>))
- **test-count-parsers:** receipt discovery ต้องการจำนวนเทสต์; parser นับได้จาก JSON (numTotalTests/totalTests/tests/testCount/expected), go test -json, TAP, node spec, vitest/jest footer, python unittest และ shell assertion; ไม่มี JUnit XML; นอก rapid lane ผลที่นับไม่ได้เป็น inconclusive ลองป้อนบรรทัดสรุปมาตรฐาน: pytest, cargo, rspec, go -v ได้แค่ marker แบบ rapid; maven, gradle, phpunit, dotnet, dart/flutter, swift, mix ไม่ได้ทั้งสองแบบ ([.claude/harness/runtime/evidence/evidence-results.mjs](<../../.claude/harness/runtime/evidence/evidence-results.mjs>), [.claude/harness/runtime/evidence/adapter-runtime.mjs](<../../.claude/harness/runtime/evidence/adapter-runtime.mjs>), [.claude/harness/runtime/evidence/adapter-reports.mjs](<../../.claude/harness/runtime/evidence/adapter-reports.mjs>))
- **discrimination-scoped-runners:** test discrimination (เทสต์ต้อง fail ก่อนแก้) จำกัดไฟล์ได้เฉพาะ node --test, pytest และ go test; runner อื่นยังทำงานแต่รันทั้งคำสั่ง ([.claude/harness/runtime/evidence/test-discrimination.mjs](<../../.claude/harness/runtime/evidence/test-discrimination.mjs>))
- **test-path-kind:** การจัดไฟล์ว่าเป็นเทสต์ใน Change/Prove รู้จักโฟลเดอร์ test/tests/spec/\_\_tests\_\_, \*.test.\*, \*.spec.\*, test\_\*.py, \*\_test.go/py; ไม่รู้จักโปรเจกต์ .NET แบบ Foo.Tests/ และไฟล์ FooTest.java นอกโฟลเดอร์ test; ไฟล์ dependency ไม่รวม pom.xml, build.gradle, pubspec, \*.csproj, mix.exs, Package.swift; ตัวเตือน task ownership ใน design-blueprints จับเฉพาะ \*.test.\*/\*.spec.\* ([.claude/harness/runtime/workflow/validation/dev-document.mjs](<../../.claude/harness/runtime/workflow/validation/dev-document.mjs>), [.claude/harness/runtime/workflow/validation/design-blueprints.mjs](<../../.claude/harness/runtime/workflow/validation/design-blueprints.mjs>), [.claude/harness/runtime/workflow/draft/amendment-verify.mjs](<../../.claude/harness/runtime/workflow/draft/amendment-verify.mjs>))
- **paid-lanes-js-heavy:** paid smoke 10 lane ของ v3.7.10 เป็น JS/TS เกือบทั้งหมด มี python-api-validation หนึ่ง lane; workload 49 ชุดมี package.json 34 ชุด ไม่มี Go, JVM, PHP, Rust, Ruby, Dart ([docs/reports/scenario-smoke-candidate-ee09e1c0-2026-11-28.md](<../../docs/reports/scenario-smoke-candidate-ee09e1c0-2026-11-28.md>))

## สมมติฐานและหลักฐาน

ยังไม่ได้บันทึก

## การตัดสินใจ

ยังไม่ได้บันทึก

## สิ่งที่ยังไม่รู้และงานที่เหลือ

ยังไม่ได้บันทึก

## แหล่งอ้างอิง

- [.claude/harness/runtime/evidence/adapter-reports.mjs](<../../.claude/harness/runtime/evidence/adapter-reports.mjs>)
- [.claude/harness/runtime/evidence/adapter-runtime.mjs](<../../.claude/harness/runtime/evidence/adapter-runtime.mjs>)
- [.claude/harness/runtime/evidence/evidence-bootstrap.mjs](<../../.claude/harness/runtime/evidence/evidence-bootstrap.mjs>)
- [.claude/harness/runtime/evidence/evidence-results.mjs](<../../.claude/harness/runtime/evidence/evidence-results.mjs>)
- [.claude/harness/runtime/evidence/test-discrimination.mjs](<../../.claude/harness/runtime/evidence/test-discrimination.mjs>)
- [.claude/harness/runtime/quality/toolchain-packs.json](<../../.claude/harness/runtime/quality/toolchain-packs.json>)
- [.claude/harness/runtime/workflow/draft/amendment-verify.mjs](<../../.claude/harness/runtime/workflow/draft/amendment-verify.mjs>)
- [.claude/harness/runtime/workflow/sandbox/sandbox-repositories.mjs](<../../.claude/harness/runtime/workflow/sandbox/sandbox-repositories.mjs>)
- [.claude/harness/runtime/workflow/sandbox/sandbox-setup.mjs](<../../.claude/harness/runtime/workflow/sandbox/sandbox-setup.mjs>)
- [.claude/harness/runtime/workflow/validation/design-blueprints.mjs](<../../.claude/harness/runtime/workflow/validation/design-blueprints.mjs>)
- [.claude/harness/runtime/workflow/validation/dev-document.mjs](<../../.claude/harness/runtime/workflow/validation/dev-document.mjs>)
- [docs/reports/scenario-smoke-candidate-ee09e1c0-2026-11-28.md](<../../docs/reports/scenario-smoke-candidate-ee09e1c0-2026-11-28.md>)

## ขั้นตอนถัดไป

พร้อมเสนอ Change โดยยังต้องมีเจตนาของผู้ใช้

The investigation is source-grounded and has a terminal conclusion.

คำสั่งที่ agent ใช้ทำต่อ:

```text
cloop investigate openspec/investigations/phase-language-repo-coverage.json
```

