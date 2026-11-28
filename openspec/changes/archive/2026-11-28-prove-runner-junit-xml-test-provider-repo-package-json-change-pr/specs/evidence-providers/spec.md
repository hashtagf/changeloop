# evidence-providers

## Purpose

Prove นับจำนวนเทสต์ของ runner หลักทุกภาษาและ JUnit XML หา test provider ให้ repo ที่ไม่มี package.json และ Change/Prove จัดไฟล์เทสต์กับไฟล์ dependency ของ JVM, .NET, Dart, Swift, Elixir ได้ถูก.

## ADDED Requirements

### Requirement: runner-summary-counts

Prove SHALL นับจำนวนเทสต์จากบรรทัดสรุปมาตรฐานของ pytest, cargo test, Maven Surefire, PHPUnit, dotnet test, dart/flutter test, swift test, ExUnit, RSpec, Minitest และ go test -v เมื่อ parser เดิมนับไม่ได้

- ใช้บรรทัดสรุปสุดท้ายของแต่ละ runner ยกเว้น cargo และ dotnet ที่รวมทุกบรรทัดสรุป (หนึ่งบรรทัดต่อ crate หรือ project)
- Maven ใช้บรรทัด Tests run ที่ไม่มี Time elapsed (บรรทัดรวม)
- go test -v นับบรรทัด --- PASS/FAIL/SKIP และต้องมีบรรทัด ok หรือ FAIL ของ package; package ที่ FAIL โดยไม่มีเทสต์ fail นับเป็น fail หนึ่ง
- จำนวนที่ไม่ใช่จำนวนเต็มบวกหรือศูนย์ทำให้ไม่นับ
- parser เดิม (JSON, go -json, TAP, node spec, shell assertion, vitest/jest/unittest) มาก่อนเสมอ

#### Scenario: pytest

- **WHEN** output มี ===== 1 failed, 5 passed, 2 skipped in 0.12s =====
- **THEN** นับได้ 8 เทสต์ fail 1

#### Scenario: cargo หลาย crate

- **WHEN** output มีบรรทัด test result ของ cargo สองบรรทัด แต่ละบรรทัด 3 passed 0 failed 1 ignored
- **THEN** นับได้ 8 เทสต์

#### Scenario: Maven

- **WHEN** output มีบรรทัดต่อ class ที่มี Time elapsed และบรรทัดรวม Tests run: 7, Failures: 1, Errors: 1, Skipped: 0
- **THEN** นับได้ 7 เทสต์ fail 2

#### Scenario: PHPUnit

- **WHEN** output มี OK (5 tests, 10 assertions)
- **THEN** นับได้ 5 เทสต์

#### Scenario: dotnet

- **WHEN** output มี Passed!  - Failed:     0, Passed:     5, Skipped:     0, Total:     5
- **THEN** นับได้ 5 เทสต์

#### Scenario: Dart

- **WHEN** output มี 00:01 +4 -1: Some tests failed.
- **THEN** นับได้ 5 เทสต์ fail 1

#### Scenario: Swift

- **WHEN** output มี Executed 6 tests, with 0 failures (0 unexpected) in 0.01 seconds
- **THEN** นับได้ 6 เทสต์

#### Scenario: ExUnit

- **WHEN** output มี 1 doctest, 5 tests, 0 failures
- **THEN** นับได้ 6 เทสต์

#### Scenario: RSpec และ Minitest

- **WHEN** output มี 5 examples, 1 failure หรือ 5 runs, 9 assertions, 0 failures, 0 errors, 1 skips
- **THEN** นับได้ 5 เทสต์

#### Scenario: go test -v

- **WHEN** output มี --- PASS สองบรรทัด --- FAIL หนึ่งบรรทัด และ FAIL ของ package
- **THEN** นับได้ 3 เทสต์ fail 1

#### Scenario: go build error

- **WHEN** output มีแค่ FAIL	pkg [build failed]
- **THEN** ผลเป็น fail ไม่ใช่ pass

#### Scenario: ไม่มีบรรทัดสรุป

- **WHEN** output เป็นข้อความทั่วไปเช่น BUILD SUCCESSFUL
- **THEN** ไม่นับและ discovery ยังเป็น inconclusive

#### Scenario: parser เดิมมาก่อน

- **WHEN** output มีทั้ง footer ของ vitest และบรรทัดที่หน้าตาเหมือน pytest
- **THEN** ใช้ผลของ vitest

### Requirement: junit-xml-counts

Prove SHALL นับจำนวนเทสต์จาก JUnit XML ที่พิมพ์ออกมาหรือที่ provider ชี้ด้วย report ซึ่งเป็นไฟล์หรือโฟลเดอร์

- ใช้ attribute tests, failures, errors, skipped ของ testsuites ถ้ามี ไม่อย่างนั้นรวม testsuite ทุกตัว
- report ที่เป็นโฟลเดอร์อ่านไฟล์ .xml ในโฟลเดอร์นั้นที่แก้ไขหลังเริ่มรัน
- testcase ที่มี failure หรือ error เป็น critical case สถานะ fail ที่เหลือ pass หรือ skip

#### Scenario: testsuites

- **WHEN** XML มี <testsuites tests="4" failures="1" errors="0" skipped="1">
- **THEN** นับได้ 4 เทสต์ fail 1

#### Scenario: หลาย testsuite

- **WHEN** report เป็นโฟลเดอร์ที่มี TEST-A.xml (3 เทสต์) และ TEST-B.xml (2 เทสต์)
- **THEN** นับได้ 5 เทสต์

#### Scenario: ไฟล์เก่า

- **WHEN** โฟลเดอร์ report มีแต่ไฟล์ที่แก้ไขก่อนเริ่มรัน
- **THEN** ไม่นับจากไฟล์เหล่านั้น

#### Scenario: attribute ไม่ใช่ตัวเลข

- **WHEN** testsuite มี tests="many"
- **THEN** ไม่นับ

### Requirement: test-provider-without-package-json

การหา evidence SHALL เสนอ test provider ให้ repository ที่ไม่มี package.json จาก test lane ใน quality/foundation-quality.json หรือจาก quality discovery

- test lane ของ repository นั้นที่มีหนึ่งตัวใช้คำสั่งของมัน; lane ที่มี cwd รันผ่าน sh -c ในโฟลเดอร์นั้น
- หลาย test lane หรือหลาย repository ได้ความมั่นใจ review ไม่ถูกเขียนอัตโนมัติ
- ไม่มี lane ใช้ test provider ที่ quality discovery พบ
- ไม่พบทั้งสองทางยังได้ unresolved เหมือนเดิม

#### Scenario: จาก quality lane

- **WHEN** repo ไม่มี package.json และ quality config มี test lane คำสั่ง go test ./...
- **THEN** ได้ candidate test-discovery คำสั่ง go test ./... ความมั่นใจ high

#### Scenario: จาก discovery

- **WHEN** repo มี Cargo.toml ไม่มี quality config และเครื่องมี cargo
- **THEN** ได้ candidate คำสั่ง cargo test

#### Scenario: หลาย lane

- **WHEN** quality config มี test:a และ test:b
- **THEN** candidate มีความมั่นใจ review

#### Scenario: ไม่พบ

- **WHEN** repo ไม่มี manifest ที่รู้จักและไม่มี quality config
- **THEN** ได้ unresolved no-safe-project-command

### Requirement: polyglot-path-kinds

การจัดประเภท path SHALL รู้จักไฟล์เทสต์และ manifest ของ JVM, .NET, Dart, Swift และ Elixir

- เทสต์: โฟลเดอร์ <ชื่อ>.Tests/ หรือ .Test/, ไฟล์ <ชื่อ>Test(s).java/kt/scala/groovy/cs/php/swift ที่ T เป็นตัวใหญ่, *_test.dart, *_test.exs, *_spec.rb
- dependency: pom.xml, build.gradle(.kts), settings.gradle(.kts), gradle.lockfile, *.csproj, packages.lock.json, Directory.Packages.props, pubspec.yaml/lock, mix.exs/lock, Package.swift/resolved, go.work(.sum)
- verify ที่ชี้ไฟล์เทสต์เหล่านี้ถูกตรวจว่ามีอยู่และอยู่ใน task เหมือนไฟล์ *.test.*

#### Scenario: เทสต์ JVM

- **WHEN** จัดประเภท src/test/java/FooTest.java และ app/FooTest.kt
- **THEN** ได้ test ทั้งคู่

#### Scenario: .NET

- **WHEN** จัดประเภท Billing.Tests/InvoiceSpec.cs
- **THEN** ได้ test

#### Scenario: manifest

- **WHEN** จัดประเภท pom.xml, app/build.gradle.kts, Api.csproj, pubspec.yaml
- **THEN** ได้ dependency

#### Scenario: คำที่ไม่ใช่เทสต์

- **WHEN** จัดประเภท src/Contest.java และ src/Latest.cs
- **THEN** ได้โค้ดสินค้า

#### Scenario: verify ไฟล์ที่ไม่มี

- **WHEN** task verify คือ ./gradlew test --tests src/test/java/MissingTest.java ที่ไม่มีอยู่และไม่อยู่ใน paths
- **THEN** ได้ issue ว่าไฟล์ไม่มีอยู่
