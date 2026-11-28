# sandbox-setup Specification

## Purpose
Build ติดตั้ง dependency จาก lockfile ของ PHP, Ruby, Python, Go, Rust, Dart/Flutter และ Elixir ให้เองในทุก repository ที่เขียนได้.
## Requirements
### Requirement: polyglot-lockfile-install

Build SHALL รันคำสั่งติดตั้งแบบล็อกของทุก ecosystem ที่ workspace มีทั้ง manifest และ lockfile เมื่อไม่ได้ตั้ง setupCommand

- composer.json+composer.lock: composer install --no-interaction --no-progress
- Gemfile+Gemfile.lock: bundle install
- pyproject.toml+uv.lock: uv sync --frozen; pyproject.toml+poetry.lock: poetry install --no-interaction; Pipfile+Pipfile.lock: pipenv sync --dev
- go.mod+go.sum: go mod download; Cargo.toml+Cargo.lock: cargo fetch --locked
- pubspec.yaml+pubspec.lock: flutter pub get ถ้า pubspec ใช้ sdk flutter ไม่อย่างนั้น dart pub get; mix.exs+mix.lock: mix deps.get
- JS ใช้ลำดับ lockfile เดิม
- หลาย ecosystem รันต่อกันด้วย && ตามลำดับข้างบน
- ecosystem ที่เครื่องไม่มีเครื่องมือถูกข้าม
- digest ของ setup รวม manifest และ lockfile ทุกตัวในรายการ

#### Scenario: PHP

- **GIVEN** workspace มี composer.json และ composer.lock และเครื่องมี composer
- **WHEN** สร้างแผน setup
- **THEN** คำสั่งคือ composer install --no-interaction --no-progress และ lockfile คือ composer.lock

#### Scenario: สองภาษา

- **GIVEN** workspace มี package.json, package-lock.json, go.mod และ go.sum
- **WHEN** สร้างแผน setup
- **THEN** คำสั่งคือ npm ci && go mod download

#### Scenario: Flutter

- **GIVEN** pubspec.yaml มี sdk: flutter และมี pubspec.lock
- **WHEN** สร้างแผน setup
- **THEN** คำสั่งคือ flutter pub get

#### Scenario: ไม่มีเครื่องมือ

- **GIVEN** workspace มี Gemfile และ Gemfile.lock แต่ไม่มี bundle บน PATH
- **WHEN** สร้างแผน setup
- **THEN** ไม่มีแผน

#### Scenario: manifest ไม่มี lockfile

- **GIVEN** workspace มี pyproject.toml เท่านั้น
- **WHEN** สร้างแผน setup
- **THEN** ไม่มีแผน

#### Scenario: ปิดการติดตั้ง

- **GIVEN** sandbox.installDependencies เป็น false
- **WHEN** สร้างแผน setup
- **THEN** ไม่มีแผน

#### Scenario: lockfile เปลี่ยน

- **GIVEN** setup สำเร็จแล้วและ Build แก้ Cargo.lock
- **WHEN** คำนวณ dependency digest
- **THEN** digest เปลี่ยน

### Requirement: sibling-repository-install

Build SHALL ติดตั้ง dependency ที่ตรวจพบจาก lockfile ให้ repository ลูกที่เขียนได้ซึ่งไม่ได้ตั้ง setupCommand และ retry การติดตั้งนั้นเมื่อล้มเหลว

- repository ที่อ่านอย่างเดียวไม่ถูกติดตั้งอัตโนมัติ
- setupCommand ของ repository ชนะการตรวจพบ
- retry ใช้คำสั่งที่บันทึกไว้ใน record.setup

#### Scenario: repo ลูก JS

- **GIVEN** repository web เขียนได้ มี package.json และ package-lock.json และไม่มี setupCommand
- **WHEN** สร้าง sandbox
- **THEN** รัน npm ci ใน worktree ของ web

#### Scenario: repo อ่านอย่างเดียว

- **GIVEN** repository shared อ่านอย่างเดียว มี go.mod และ go.sum
- **WHEN** สร้าง sandbox
- **THEN** ไม่มีการติดตั้ง

#### Scenario: retry

- **GIVEN** การติดตั้งที่ตรวจพบของ web ล้มเหลว
- **WHEN** lifecycle resume
- **THEN** รันคำสั่งเดิมอีกครั้ง
