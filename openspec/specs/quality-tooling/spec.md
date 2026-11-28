# quality-tooling Specification

## Purpose
Gate ค่าเริ่มต้นของ repo ไม่รัน suite ช้าที่ตั้งใจไว้ให้รันแค่ใน CI และไม่รัน gate ซ้ำหลัง Land.
## Requirements
### Requirement: default-gate-skips-slow-upgrade

gate ค่าเริ่มต้นของ run-all SHALL ไม่รัน upgrade compat ผ่าน wrapper risk-tiered review contract ส่วน --full และ --release SHALL รันเหมือนเดิม

#### Scenario: tier ค่าเริ่มต้น

- **WHEN** รัน run-all.sh โดยไม่มี --full
- **THEN** wrapper ไม่เรียก run-upgrade-compat-tests.sh
- **AND** รายงานเคส CASE-UPGRADE-COMPAT เป็น deferred และ suite ผ่าน

#### Scenario: tier full

- **WHEN** รัน run-all.sh --full
- **THEN** wrapper เรียก run-upgrade-compat-tests.sh และเคสต้องผ่าน

#### Scenario: รัน wrapper ตรง

- **WHEN** รัน run-risk-tiered-review-tests.mjs เองโดยไม่ผ่าน run-all
- **THEN** รันทุกเคสรวม upgrade compat

### Requirement: prove-counts-as-gate

คู่มือ maintainer SHALL นับ receipt static-analysis ที่ผ่านของ change ที่ Land โดยไม่มีการแก้หลัง Land เป็น gate ค่าเริ่มต้นก่อน commit

#### Scenario: แก้ไฟล์หลัง Land

- **WHEN** มีการแก้ไฟล์หลัง Land
- **THEN** คู่มือยังสั่งให้รัน gate ค่าเริ่มต้นก่อน commit

### Requirement: reference-governance-fast

การตรวจ reference governance ของ skill SHALL ให้ผลเหมือนเดิมและแตกคำของแต่ละย่อหน้าครั้งเดียว

#### Scenario: skill จริงของ repo

- **WHEN** รันการตรวจกับ .claude/skills
- **THEN** ไม่มี issue และใช้เวลาน้อยกว่า 10 วินาที

#### Scenario: ย่อหน้าซ้ำและเกือบซ้ำ

- **GIVEN** fixture ที่มีย่อหน้าซ้ำและเกือบซ้ำข้ามไฟล์
- **WHEN** รันการตรวจ
- **THEN** รายงาน duplicate และ near-duplicate เหมือนเดิม

#### Scenario: ขนาดชุดคำต่างกันมาก

- **GIVEN** ย่อหน้ายาว 40 คำกับย่อหน้ายาว 100 คำที่มีคำของย่อหน้าแรกครบ
- **WHEN** รันการตรวจ
- **THEN** ไม่รายงาน near-duplicate

### Requirement: quality-lane-paths

quality lane ที่ประกาศ paths SHALL ไม่ถูกรันใน change ที่ไม่มีไฟล์ที่เปลี่ยนตรงกับ paths นั้น

- provider ใน quality/foundation-quality.json ประกาศ paths เป็น glob ที่สัมพันธ์กับ repository ได้
- lane ที่ไม่ถูกรันรายงาน status pass, assurance not-affected, required false และเหตุผล และไม่เขียน history ของ lane
- รันทุก lane เมื่อไม่มี change หรือใช้ --full
- lane not-affected นับเป็นหลักฐานชดเชยได้เฉพาะเมื่อผลที่บันทึกล่าสุดของ lane นั้นผ่าน
- paths ที่ไม่ใช่ array ของ string ที่ไม่ว่าง ถูกปฏิเสธตอนอ่าน config

#### Scenario: change ไม่แตะ paths

- **GIVEN** lane automated-mutation ประกาศ paths backend/** และ change แก้แค่ frontend/app.tsx
- **WHEN** quality run ของ change รัน
- **THEN** lane นั้นไม่ถูกรันและรายงาน not-affected

#### Scenario: change แตะ paths

- **GIVEN** lane เดียวกันและ change แก้ backend/x.go
- **WHEN** quality run ของ change รัน
- **THEN** lane ถูกรันตามปกติ

#### Scenario: ไม่มี change หรือ --full

- **GIVEN** lane ประกาศ paths
- **WHEN** quality run รันโดยไม่มี change หรือใช้ --full
- **THEN** lane ถูกรัน

#### Scenario: ผลล่าสุดล้ม

- **GIVEN** lane test ประกาศ paths ที่ change ไม่แตะ และผลที่บันทึกล่าสุดของมันล้ม
- **WHEN** quality run ตัดสินหลักฐานชดเชย
- **THEN** lane นั้นไม่นับเป็นหลักฐานชดเชย

#### Scenario: paths ผิดรูป

- **GIVEN** provider ประกาศ paths เป็น string
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธพร้อมชื่อฟิลด์

### Requirement: quality-provider-swallowed-exit

cloop quality doctor SHALL เตือนเมื่อ lane ที่ตัดสินจาก exit code มีคำสั่งที่กลืนความล้มเหลว และแนะนำ paths ให้ lane ที่รันในโฟลเดอร์เดียว

- lane ที่ตัดสินจาก exit code คือ kind command ที่ไม่มี protocol
- รูปแบบที่กลืนความล้มเหลวคือ || true, || : และ ; exit 0
- lane builtin หรือมี protocol ไม่ถูกเตือน เพราะตัดสินจาก output ที่ parse ได้
- lane ที่ไม่มี paths และคำสั่งเริ่มด้วย cd <dir> && ได้คำแนะนำระดับ info ให้ประกาศ paths <dir>/**

#### Scenario: test lane กลืน exit

- **GIVEN** lane test kind command คำสั่ง sh -c 'go test ./... || true'
- **WHEN** quality doctor รัน
- **THEN** มี warning provider-swallows-failure ที่ชื่อ lane

#### Scenario: lane ที่ parse output

- **GIVEN** lane lint builtin eslint-json คำสั่งลงท้าย || true
- **WHEN** quality doctor รัน
- **THEN** ไม่มี warning provider-swallows-failure

#### Scenario: lane รันในโฟลเดอร์เดียว

- **GIVEN** lane test ไม่มี paths คำสั่ง sh -c 'cd backend && go test ./...'
- **WHEN** quality doctor รัน
- **THEN** มี info provider-paths-suggested ที่เสนอ backend/**

### Requirement: toolchain-packs

การค้นพบคุณภาพ SHALL รู้จักภาษาจาก toolchain pack ที่ harness ติดตั้ง ซึ่งครอบ Dart/Flutter, Gradle, Maven, Rust, Ruby, Terraform, Helm, Dockerfile และ Kubernetes นอกเหนือจากภาษาเดิม

- pack มี id, languages, extensions, markers, capabilities และ commands ของ capability ที่เสนอ
- คำสั่งของ pack ถูกเสนอเมื่อ marker อยู่ที่รากของ repository และไฟล์ที่คำสั่งต้องการมีอยู่
- การค้นพบเดิมของ JS/TS, Go, Python และ PHP มาก่อน คำสั่งของ pack เติมเฉพาะ capability ที่ยังว่าง
- profile เดิมทุกชื่อยังใช้ได้

#### Scenario: repo Flutter

- **GIVEN** repository มี pubspec.yaml ที่ราก
- **WHEN** quality discover รัน
- **THEN** profile toolchain-dart-flutter ถูกพบ และเสนอ test เป็น flutter test กับ static-analysis เป็น flutter analyze

#### Scenario: repo Gradle มี wrapper

- **GIVEN** repository มี build.gradle และ gradlew ที่ราก
- **WHEN** quality discover รัน
- **THEN** เสนอ test เป็น ./gradlew test

#### Scenario: repo Terraform

- **GIVEN** repository มีไฟล์ .tf
- **WHEN** quality discover รัน
- **THEN** profile toolchain-terraform ถูกพบ และเสนอ static-analysis เป็น terraform fmt -check -recursive

#### Scenario: marker อยู่ในโฟลเดอร์ย่อย

- **GIVEN** Cargo.toml อยู่แค่ใน tools/x/
- **WHEN** quality discover รัน
- **THEN** profile rust ถูกพบแต่ไม่เสนอคำสั่งของ rust

#### Scenario: repo Go เดิม

- **GIVEN** repository มี go.mod
- **WHEN** quality discover รัน
- **THEN** providers เหมือนก่อน change นี้

### Requirement: project-toolchain-packs

quality/foundation-quality.json SHALL ประกาศ toolchain pack เพิ่มหรือทับของ harness ได้ในฟิลด์ toolchains และ profile ของ repository อ้างชื่อ pack นั้นได้

- pack ที่ประกาศถูก validate รูปแบบตอนอ่าน config และผิดรูปถูกปฏิเสธพร้อมชื่อฟิลด์
- capability ของ profile มาจาก pack ที่ประกาศ
- quality discover และ quality init ใช้ pack ที่ประกาศเมื่อ config มีอยู่

#### Scenario: ภาษาที่ harness ไม่รู้จัก

- **GIVEN** config ประกาศ pack id toolchain-elixir marker mix.exs คำสั่ง test mix test และ repository มี mix.exs
- **WHEN** quality discover รัน
- **THEN** profile toolchain-elixir ถูกพบ และเสนอ test เป็น mix test

#### Scenario: profile อ้าง pack ที่ประกาศ

- **GIVEN** repository ใช้ profile toolchain-elixir ที่ประกาศไว้
- **WHEN** อ่าน config
- **THEN** ผ่าน และ capability ของ profile มาจาก pack

#### Scenario: pack ผิดรูป

- **GIVEN** pack ไม่มี capabilities
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธพร้อมชื่อฟิลด์

#### Scenario: profile ที่ไม่มีอยู่

- **GIVEN** repository ใช้ profile ที่ไม่มีทั้งใน harness และ config
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธเหมือนเดิม

### Requirement: quality-paths-hint-commands

quality doctor SHALL เสนอ paths ให้ lane ที่คำสั่งระบุโฟลเดอร์เดียวด้วย make -C, npm/pnpm/yarn --prefix หรือ --dir, go test ./<dir>/..., gradle -p หรือ cargo --manifest-path

- ใช้ได้ทั้งคำสั่งแบบ argv และบรรทัด sh -c
- โฟลเดอร์ . หรือ .. และ ./... ไม่ได้คำแนะนำ

#### Scenario: go test โฟลเดอร์เดียว

- **GIVEN** lane test คำสั่ง go test ./services/wallet/...
- **WHEN** quality doctor รัน
- **THEN** เสนอ paths services/wallet/**

#### Scenario: make -C

- **GIVEN** lane test คำสั่ง sh -c 'make -C backend test'
- **WHEN** quality doctor รัน
- **THEN** เสนอ paths backend/**

#### Scenario: ทั้ง repo

- **GIVEN** lane test คำสั่ง go test ./...
- **WHEN** quality doctor รัน
- **THEN** ไม่เสนอ paths

### Requirement: quality-module-lanes

quality config SHALL มีหลาย lane ต่อ capability ได้ด้วย provider ชื่อ <capability>:<name> ที่รันในโฟลเดอร์ cwd ของตัวเอง

- capability ของ lane คือฟิลด์ capability หรือส่วนก่อน : ของชื่อ
- cwd เป็น path ที่สัมพันธ์กับ repository ห้ามเป็น absolute ห้ามมี .. และต้องมีอยู่
- ผลรัน history และ baseline แยกตามชื่อ lane
- ทุก lane ที่ capability เดียวกันนับครอบ capability ของ profile และนับเป็นหลักฐานชดเชย
- readiness อ่าน history ของทุก lane ที่ capability เป็น test
- --capability test เลือกทุก lane ที่ capability เป็น test

#### Scenario: lane ของ module

- **GIVEN** provider test:services/wallet มี cwd services/wallet และคำสั่งที่ล้มถ้าไม่ได้รันในโฟลเดอร์นั้น
- **WHEN** quality run รัน
- **THEN** lane รันใน services/wallet และรายงาน capability test กับ lane test:services/wallet

#### Scenario: สอง lane capability เดียวกัน

- **GIVEN** test:a และ test:b ไม่มี paths
- **WHEN** quality run รัน
- **THEN** ได้สอง lane และ history แยกกัน

#### Scenario: cwd ออกนอก repository

- **GIVEN** provider มี cwd ../other
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธพร้อมชื่อ provider

#### Scenario: cwd ไม่มีอยู่

- **GIVEN** provider มี cwd services/missing
- **WHEN** quality run รัน
- **THEN** lane fail พร้อมเหตุผลว่าไม่มีโฟลเดอร์

#### Scenario: config เดิม

- **GIVEN** provider ชื่อ test ไม่มี cwd
- **WHEN** quality run รัน
- **THEN** ผลและไฟล์ผลเหมือนเดิม

### Requirement: discovery-module-lanes

quality discover SHALL เสนอ lane test และ static-analysis ต่อ module ให้โฟลเดอร์ย่อยที่มี manifest ของภาษาเมื่อรากของ repository ไม่มี lane ของ capability นั้นจากภาษาเดียวกัน

- module คือโฟลเดอร์ที่มี marker ของ pack และไม่ใช่ git repository แยก
- lane ที่เสนอมีชื่อ <capability>:<dir>, cwd dir และ paths dir/**
- คำสั่งมาจาก discovery เดียวกับรากของ repository ที่รันกับโฟลเดอร์นั้น
- เสนอได้สูงสุด 40 module เกินจากนั้นรายงาน modulesTruncated
- module ที่อยู่ใน module อื่นของภาษาเดียวกันไม่ถูกเสนอซ้ำ

#### Scenario: Go หลาย module ไม่มี go.mod ที่ราก

- **GIVEN** services/a/go.mod และ services/b/go.mod
- **WHEN** quality discover รัน
- **THEN** เสนอ test:services/a และ test:services/b คำสั่ง go test ./... พร้อม cwd และ paths

#### Scenario: ราก repo ครอบอยู่แล้ว

- **GIVEN** package.json ที่รากมี scripts.test และ packages/x/package.json
- **WHEN** quality discover รัน
- **THEN** ไม่เสนอ lane ของ packages/x

#### Scenario: module มากเกิน

- **GIVEN** 45 โฟลเดอร์ที่มี go.mod
- **WHEN** quality discover รัน
- **THEN** เสนอ 40 lane และ modulesTruncated เป็น 5

#### Scenario: module ที่เป็น git repository แยก

- **GIVEN** libs/x มี .git และ go.mod
- **WHEN** quality discover รัน
- **THEN** ไม่เสนอ lane ของ libs/x

### Requirement: toolchain-pack-tightening

toolchain pack SHALL ถูกตรวจรูปแบบเวลาเทสต์ว่ามี pattern และกลุ่มดึงตัวเลข, ใช้รูปแบบเวลาของ pack ที่โปรเจกต์ประกาศใน quality lane และ config ที่อ่านไม่ได้ต้องหยุด discovery พร้อมสาเหตุ

- pack ที่ไม่มีทั้ง markers และ extensions ใช้ได้เป็น profile ที่ระบุเองแต่ไม่ถูกตรวจพบอัตโนมัติ
- pack ของโปรเจกต์ที่ชื่อซ้ำแทนที่ pack ของ harness ทั้งก้อน รวม durations
- คำสั่งของ pack ไม่ถูกเสนอเมื่อเครื่องไม่มี executable หรือไฟล์ใน requires ไม่มี
- doctor เสนอ paths ครบทุกโฟลเดอร์เมื่อคำสั่งระบุหลายโฟลเดอร์

#### Scenario: duration ไม่มีกลุ่ม

- **GIVEN** pack มี durations [{ pattern: "took" }]
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธว่า pattern ต้องมีกลุ่มดึงตัวเลข

#### Scenario: duration ไม่มี pattern

- **GIVEN** pack มี durations [{}]
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธ

#### Scenario: เวลาเทสต์จาก pack โปรเจกต์

- **GIVEN** pack โปรเจกต์มี duration Finished in (\d+)s และ lane test พิมพ์ Finished in 2s แต่ใช้ 60 วินาที
- **WHEN** quality run รัน
- **THEN** history ของ lane บันทึก lingering testsMs 2000

#### Scenario: config อ่านไม่ได้

- **GIVEN** quality/foundation-quality.json ไม่ใช่ JSON
- **WHEN** quality discover รัน
- **THEN** หยุดพร้อมบอกว่า config อ่านไม่ได้

#### Scenario: หลายโฟลเดอร์

- **GIVEN** lane test คำสั่ง go test ./a/... ./b/...
- **WHEN** quality doctor รัน
- **THEN** เสนอ paths a/** และ b/**

#### Scenario: เครื่องไม่มีเครื่องมือ

- **GIVEN** repository มี pubspec.yaml และ test/ แต่ไม่มี flutter บน PATH
- **WHEN** quality discover รัน
- **THEN** profile toolchain-dart-flutter ถูกพบแต่ไม่เสนอคำสั่ง

#### Scenario: Flutter ไม่มีโฟลเดอร์ test

- **GIVEN** repository มี pubspec.yaml แต่ไม่มี test/
- **WHEN** quality discover รัน
- **THEN** เสนอ flutter analyze แต่ไม่เสนอ flutter test

### Requirement: vue-is-js

pack application-js-ts SHALL นับไฟล์ .vue, .svelte และ .astro เป็นภาษาของตน

#### Scenario: repo Nuxt

- **GIVEN** repository มี package.json และ pages/index.vue
- **WHEN** quality discover รัน
- **THEN** languages มี javascript และ typescript

#### Scenario: ไฟล์ .vue อย่างเดียว

- **GIVEN** repository มีแค่ components/a.vue ไม่มี package.json
- **WHEN** quality discover รัน
- **THEN** profile application-js-ts ถูกพบแต่ไม่มี lane test

### Requirement: test-files-runner

เมื่อ repo JS ไม่มี script test แต่มีไฟล์เทสต์และตัวรันที่ติดตั้งไว้ใน node_modules/.bin discovery SHALL เสนอ lane test จากตัวรันนั้น

- ไฟล์เทสต์คือ *.test.* หรือ *.spec.* ของ js/ts/vue, _test.go, test_*.py, *_test.py, *_spec.rb
- ลำดับตัวรัน: vitest (vitest run), jest, playwright (playwright test)
- discovery รายงาน testFiles เป็นจำนวนไฟล์เทสต์ที่พบ

#### Scenario: มีไฟล์เทสต์และ vitest

- **GIVEN** package.json ไม่มี scripts.test, มี tests/a.spec.ts และ node_modules/.bin/vitest
- **WHEN** quality discover รัน
- **THEN** เสนอ test เป็น npx --no-install vitest run

#### Scenario: มีไฟล์เทสต์แต่ไม่มีตัวรัน

- **GIVEN** มี tests/a.spec.ts แต่ไม่มีตัวรันใน node_modules/.bin และไม่มี dependency
- **WHEN** quality discover รัน
- **THEN** ไม่เสนอ lane test และ testFiles เป็น 1

### Requirement: test-command-proposals

เมื่อไม่มี lane test discovery SHALL รายงานคำสั่งเทสต์ที่พบใน Makefile, CI และ README เป็น proposals.test-commands พร้อมแหล่งที่มา โดยไม่ใส่ใน providers

- Makefile: target ชื่อ test, tests, check, unit หรือขึ้นต้นด้วย test- เป็น make <target>
- CI: บรรทัด run ใน .github/workflows/*.yml, .gitlab-ci.yml และ bitbucket-pipelines.yml ที่มีคำว่า test
- README: บรรทัดในบล็อกโค้ดที่เป็นคำสั่งเทสต์ของตัวรันที่รู้จัก
- แต่ละรายการมี command, source และ verified false และไม่เกิน 10 รายการ

#### Scenario: Makefile มี target test

- **GIVEN** ไม่มี lane test และ Makefile มี test: target
- **WHEN** quality discover รัน
- **THEN** proposals.test-commands มี make test จาก Makefile และ providers ไม่มี test

#### Scenario: CI มีคำสั่งเทสต์

- **GIVEN** .github/workflows/ci.yml มี run: go test -race ./...
- **WHEN** quality discover รัน
- **THEN** proposals.test-commands มี go test -race ./... จาก .github/workflows/ci.yml

#### Scenario: มี lane test แล้ว

- **GIVEN** package.json มี scripts.test
- **WHEN** quality discover รัน
- **THEN** ไม่มี proposals.test-commands

### Requirement: no-tests-readiness

เมื่อ repository ไม่มีไฟล์เทสต์และไม่มี lane test discovery SHALL รายงาน proposals.test-setup และ readiness tests SHALL บอกว่าไม่มีเทสต์พร้อมให้เสนอการตั้งตัวรันผ่าน /change

- ตัวรันที่แนะนำ: vitest สำหรับ JS/TS, go test สำหรับ Go, pytest สำหรับ Python
- ข้อความ next ของ readiness ไม่สั่งเขียนเทสต์ให้อัตโนมัติ

#### Scenario: repo Nuxt ไม่มีเทสต์

- **GIVEN** package.json ไม่มี scripts.test และไม่มีไฟล์เทสต์
- **WHEN** quality discover รัน
- **THEN** proposals.test-setup แนะนำ vitest พร้อมเหตุผลว่าไม่มีเทสต์

#### Scenario: readiness ไม่มีเทสต์

- **GIVEN** config ไม่มี lane test และ discovery บอก testFiles 0
- **WHEN** quality readiness ประเมิน tests
- **THEN** unmet และ next บอกว่าไม่มีเทสต์ ให้เสนอตั้งตัวรันผ่าน /change

### Requirement: duration-pattern-alone

การตรวจ durations ของ toolchain pack SHALL คอมไพล์ pattern ด้วยตัวเองก่อนนับกลุ่ม

#### Scenario: pattern ลงท้าย backslash

- **GIVEN** pack มี durations pattern (\d+)\
- **WHEN** อ่าน config
- **THEN** ถูกปฏิเสธว่า pattern ไม่ถูกต้อง

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

### Requirement: fast-checks-guide

skill onboard SHALL มีคู่มือ references/fast-checks.md ที่บอกวิธีทำให้เทสต์และเครื่องมือตรวจของโปรเจกต์รันเร็ว และขั้นตอน onboard SHALL ให้ agent เสนอการแก้ lane ที่ช้าผ่าน /change

- หัวข้อ: แยกชุดเร็วกับชุดเต็ม, verify ต่อ task รันเฉพาะไฟล์ของตน, ปิดทรัพยากรในเทสต์, รันขนานและ cache, lint และ type-check ที่เร็ว, output ที่ harness อ่านได้
- มีคำสั่งตัวอย่างของ JS/TS, Go, Python, Rust, JVM, Ruby, Dart

#### Scenario: คู่มือมีครบ

- **WHEN** อ่าน .claude/skills/onboard/references/fast-checks.md
- **THEN** มีหกหัวข้อและตัวอย่างของทุกภาษาที่ระบุ

#### Scenario: skill อ้างถึงคู่มือ

- **WHEN** อ่าน .claude/skills/onboard/SKILL.md
- **THEN** References มี references/fast-checks.md และขั้นตอนตรวจสุดท้ายให้เสนอการแก้ lane ที่ช้า

### Requirement: slow-lane-hint

quality doctor SHALL รายงาน info provider-slow สำหรับ lane ที่การรันล่าสุดใช้นานกว่าเกณฑ์ พร้อมจำนวนวินาทีและชี้คู่มือ fast-checks

- เกณฑ์: lane test 120 วินาที lane อื่น 60 วินาที
- อ่านจาก history ล่าสุดของ lane; lane ที่ยังไม่เคยรันไม่ได้คำแนะนำ
- ไม่ทำให้ doctor fail

#### Scenario: test lane ช้า

- **GIVEN** history ล่าสุดของ lane test ใช้ 300 วินาที
- **WHEN** quality doctor รัน
- **THEN** มี provider-slow ที่บอก 300s และชี้ fast-checks

#### Scenario: lane เร็ว

- **GIVEN** history ล่าสุดของ lane test ใช้ 30 วินาที
- **WHEN** quality doctor รัน
- **THEN** ไม่มี provider-slow

#### Scenario: ยังไม่เคยรัน

- **GIVEN** lane ไม่มี history
- **WHEN** quality doctor รัน
- **THEN** ไม่มี provider-slow

### Requirement: quality-source-sandbox

quality run, quality doctor และ quality baseline SHALL ใช้ quality/foundation-quality.json และ quality/baselines ใน root workspace ของ change ที่ active เมื่อ workspace นั้นยังไม่ apply และมีไฟล์ตั้งค่า

- change ที่ active มาจาก --change หรือ FOUNDATION_CHANGE_ID
- ไม่มี change, workspace apply แล้ว หรือ sandbox ไม่มีไฟล์ตั้งค่า ใช้ project root
- quality baseline --write เขียน baseline และ manifest ลง sandbox ของ change จึง land ไปพร้อม change
- ผลรันและ history ของ lane ยังเขียนที่ .foundation/quality ของ project root

#### Scenario: lane ใหม่ใน sandbox

- **GIVEN** sandbox ของ change a เพิ่ม lane lint ที่ project root ไม่มี
- **WHEN** รัน quality run --change a --capability lint
- **THEN** lane lint รันและผ่าน

#### Scenario: baseline ลง sandbox

- **GIVEN** lane lint ของ change a รันแล้ว
- **WHEN** รัน quality baseline --write --change a
- **THEN** baseline และ manifest อยู่ใน sandbox และ project root ไม่มี baseline นั้น

#### Scenario: ไม่มี change

- **GIVEN** sandbox ของ change a แก้ไฟล์ตั้งค่า
- **WHEN** รัน quality run โดยไม่มี change
- **THEN** ใช้ไฟล์ตั้งค่าของ project root

#### Scenario: sandbox ไม่มีไฟล์ตั้งค่า

- **GIVEN** change a อยู่ใน sandbox ที่ไม่มี quality/foundation-quality.json
- **WHEN** รัน quality run --change a
- **THEN** ใช้ไฟล์ตั้งค่าของ project root

#### Scenario: baseline ใน sandbox ถดถอย

- **GIVEN** baseline lint ใน sandbox ของ change a ไม่มี finding
- **WHEN** lane lint ของ change a พบ finding ใหม่
- **THEN** lane lint fail

### Requirement: findings-preflight

advance SHALL รัน findings lane ของ change ก่อน Prove รัน provider สำหรับเนื้อหา workspace ที่ยังไม่เคยตรวจ และคืน REPAIR เมื่อ lane ใดไม่ผ่าน

- findings lane คือ lint, type-check, file-size, nesting-depth, duplication, workaround-comments และ module-boundaries ใน quality config ที่ change ใช้
- ผลผ่านถูกจำไว้คู่กับ hash ของเนื้อหา change และไม่รันซ้ำจนกว่าเนื้อหาจะเปลี่ยน
- REPAIR ระบุ lane และ finding ที่ถดถอยและ Prove ไม่เริ่ม
- ไม่มี quality config หรือไม่มี findings lane ข้ามการตรวจนี้
- Prove ยังรัน quality gate เต็มทุกครั้ง

#### Scenario: ไฟล์โตเกิน ratchet

- **GIVEN** quality config มี lane file-size และ change ทำให้ไฟล์ที่ติด ratchet โตขึ้น
- **WHEN** advance --through proven
- **THEN** ได้ REPAIR ที่ระบุ file-size และ Prove ไม่เริ่ม

#### Scenario: ผ่านแล้วเข้า Prove

- **GIVEN** findings lane ทุกตัวผ่าน
- **WHEN** advance --through proven
- **THEN** Prove รันและเนื้อหานี้ถูกจำว่าตรวจแล้ว

#### Scenario: เนื้อหาเดิม

- **GIVEN** เนื้อหานี้ผ่านการตรวจแล้ว
- **WHEN** advance --through proven อีกครั้ง
- **THEN** ไม่รัน findings lane ซ้ำ

#### Scenario: ไม่มี quality config

- **GIVEN** project ไม่มี quality/foundation-quality.json
- **WHEN** advance --through proven
- **THEN** ไม่มีการตรวจก่อน Prove

### Requirement: lane-changed-files

quality run SHALL ส่งรายชื่อ path ที่ change แก้ใน repository นั้นให้ทุก lane ผ่าน FOUNDATION_QUALITY_CHANGED_FILES

- หนึ่ง path ต่อบรรทัด สัมพันธ์กับ repository
- ไม่มี change ได้ค่าว่าง

#### Scenario: มี change

- **GIVEN** change a แก้ src/a.js และ test/a.test.js
- **WHEN** quality run --change a
- **THEN** lane เห็น FOUNDATION_QUALITY_CHANGED_FILES เป็น src/a.js และ test/a.test.js

#### Scenario: ไม่มี change

- **GIVEN** ไม่มี change ที่ active
- **WHEN** quality run
- **THEN** FOUNDATION_QUALITY_CHANGED_FILES ว่าง
