# quality-tooling

## ADDED Requirements

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
