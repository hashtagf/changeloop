# quality-tooling

## ADDED Requirements

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
