# Change: harness รู้จักภาษาและเครื่องมือจากชุดข้อมูล toolchain pack ที่โปรเจกต์ขยายเองได้ ครอบทุกภาษาที่ repo ผู้ใช้ใช้จริง และงานจับเทสต์ค้างกับการเสนอ paths ใช้ได้ข้ามภาษา

- **Change:** `harness-toolchain-pack-repo-paths` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

harness จะรู้จักภาษาจากชุดข้อมูลที่โปรเจกต์ขยายเองได้ แทนการเขียนโค้ดเพิ่มทีละภาษา และครอบทุกภาษาที่ repo ของผู้ใช้ใช้จริง

## เหตุผล

[Data] all-repo-ms มีราว 584 repo: Go 339, JS/TS 325, Python 10, Gradle 6, Flutter 4, Ruby/PHP/Rust อย่างละ 1 และ zyra-v2 มี Terraform แต่ harness รู้จักแค่ JS/TS, Go, Python, PHP, Bash, SQL, MongoDB, HTML/CSS แบบเขียนในโค้ด onboard จึงตั้ง lane ให้ Gradle, Flutter, Rust, Ruby และ infra ไม่ได้

[Data] ตัวจับเทสต์ค้างที่เพิ่ง Land อ่านเวลาได้แค่ node:test, vitest, jest และ Playwright ส่วนการเสนอ paths อ่านได้แค่ cd dir && ทั้งที่ repo ผู้ใช้ใช้ go test ./svc/..., make และ npm --prefix

[Assumption] การเพิ่มภาษาด้วยโค้ดทีละภาษาไม่มีวันครบ ผู้ใช้เลือกแนวทางเก็บความรู้เรื่องภาษาเป็นข้อมูลและทำเป็นขั้น change นี้คือขั้นแรก

## ขอบเขต

- **อยู่ในขอบเขต:** onboard ตั้ง lane ให้ repo Flutter, Gradle, Rust, Ruby และ infra ได้เอง; โปรเจกต์รองรับภาษาใหม่ได้ทันทีโดยไม่ต้องรอออกเวอร์ชัน harness; repo Go, Python, Rust และ Ruby ได้คำเตือนเรื่องเทสต์ค้างเหมือน JS; monorepo ที่ไม่ได้ใช้ cd ก็ได้ paths ที่แนะนำ; คำสั่ง node --test ที่ใช้กันทั่วไปทุกรูปแบบจบเมื่อเทสต์จบ
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- แยก lane ตาม module ใน monorepo อัตโนมัติ (change ถัดไป)
- ให้ agent ร่างคำสั่งของภาษาที่ไม่รู้จักแล้วรันยืนยัน (change ถัดไป)
- รูปแบบเวลาเทสต์จาก pack ที่โปรเจกต์เพิ่มเอง (ใช้ได้เฉพาะ pack ที่ harness ติดตั้ง)
- อ่าน JUnit XML จากไฟล์รายงาน (อ่านเฉพาะที่อยู่ใน output ของคำสั่ง)
- เปลี่ยนการค้นพบของ JS/TS, Go, Python และ PHP ที่มีอยู่

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Quality discovery now reads languages from toolchain packs: Dart/Flutter, Gradle, Maven, Rust, Ruby, Terraform, Helm, Dockerfile and Kubernetes are recognized, and a project can declare its own packs in quality/foundation-quality.json. Lingering-test detection reads go test, pytest, cargo, RSpec and JUnit XML times.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/quality/toolchain-packs.json`, `.claude/harness/runtime/quality/language-profiles.mjs`, `.claude/harness/runtime/quality/quality-discovery.mjs`, `.claude/harness/runtime/quality/quality-policy.mjs`, `.claude/harness/runtime/quality/quality-runtime.mjs`, `.claude/harness/tests/toolchain-packs.test.mjs`, … +9 more

## Capability ที่เปลี่ยน

| Capability | Requirements | Tasks |
|---|---|---|
| quality-tooling | toolchain-packs, project-toolchain-packs, quality-paths-hint-commands | T001, T002 |
| prove | lingering-test-run-languages, force-exit-node-options | T002 |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| toolchain-packs | repo Flutter | success | T001 | test: `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | repo Gradle มี wrapper | success | T001 |  |  |
|  | repo Terraform | success | T001 |  |  |
|  | marker อยู่ในโฟลเดอร์ย่อย | boundary | T001 |  |  |
|  | repo Go เดิม | boundary | T001 |  |  |
| project-toolchain-packs | ภาษาที่ harness ไม่รู้จัก | success | T001 | test: `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | profile อ้าง pack ที่ประกาศ | success | T001 |  |  |
|  | pack ผิดรูป | failure | T001 |  |  |
|  | profile ที่ไม่มีอยู่ | failure | T001 |  |  |
| lingering-test-run-languages | JUnit XML | success | T002 | test: `.claude/harness/tests/node-test-force-exit.test.mjs`, `.claude/harness/tests/quality-runtime.test.mjs` | — |
|  | pytest ช้าจริง | boundary | T002 |  |  |
|  | go test ค้าง | failure | T002 |  |  |
| quality-paths-hint-commands | go test โฟลเดอร์เดียว | success | T002 | test: `.claude/harness/tests/node-test-force-exit.test.mjs`, `.claude/harness/tests/quality-runtime.test.mjs` | — |
|  | make -C | success | T002 |  |  |
|  | ทั้ง repo | boundary | T002 |  |  |
| force-exit-node-options | script ที่รับ --test | boundary | T002 | test: `.claude/harness/tests/node-test-force-exit.test.mjs`, `.claude/harness/tests/quality-runtime.test.mjs` | — |
|  | shell line มี --import | failure | T002 |  |  |
|  | argv มี --test-timeout | failure | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (18).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (5); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f-flutter-requires-test-dir: The `toolchain-dart-flutter` test command has `requires: ["test"]`, but the "repo Flutter" scenario GIVEN is only a `pubspec.yaml` at the root. A bare Flutter repo gets no `flutter test` proposal. The test adds `test/` to the fixture to pass. The same pack also proposes `flutter` for a pure Dart project. The `requires` gate is a defensible choice, but the scenario and the pack disagree. (root/.claude/harness/runtime/quality/toolchain-packs.json:84) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f-pack-validation-gaps: `validateToolchainPack` accepts `durations: [{}]` because `new RegExp(undefined)` is valid, and it does not require a capture group. A project pack can therefore pass validation with a pattern that matches everything and yields NaN. The check `pack.id !== "database-mongodb"` hardcodes a shipped id into generic validation. (root/.claude/harness/runtime/quality/language-profiles.mjs:43) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f-declared-toolchains-swallow: `declaredToolchains()` returns `[]` when the config file can't be read or parsed. A broken config then silently drops the project's packs from `quality discover` and `init`, and the user sees 'no profile found' instead of the cause. (root/.claude/harness/runtime/quality/quality-runtime.mjs:223) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f-hint-multi-directory: `commandDirectory` returns the first directory it finds. For `go test ./a/... ./b/...` or `make -C a test && make -C b test` it suggests `a/**` alone. If the user accepts, the lane stops running for changes in `b`. The hint is info-level, but it narrows the lane based on only part of the command. (root/.claude/harness/runtime/quality/quality-doctor-hints.mjs:21) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f-project-durations-unused: Project packs may declare `durations`, which are validated but never read. Only the shipped pack data reaches `test-durations.mjs`. This is a speculative field that does nothing. `CONSUMER-QUALITY.md` documents it as 'not read yet'. (root/.claude/harness/runtime/quality/language-profiles.mjs:49) | minor | ยังเปิดอยู่ | claude-opus |
