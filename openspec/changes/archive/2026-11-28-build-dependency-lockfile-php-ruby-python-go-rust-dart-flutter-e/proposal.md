# Change: Build ติดตั้ง dependency จาก lockfile ของ PHP, Ruby, Python, Go, Rust, Dart/Flutter และ Elixir ให้เองในทุก repository ที่เขียนได้

- **Change:** `build-dependency-lockfile-php-ruby-python-go-rust-dart-flutter-e` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

ขั้น Build เตรียม dependency ให้ repo ทุกภาษาและทุก repo ในโปรเจกต์หลาย repo เอง

## เหตุผล

[Data] การสำรวจ phase-language-repo-coverage พบว่า Build ติดตั้ง dependency ให้เองเฉพาะ repo หลักที่เป็น JavaScript ภาษาอื่นและ repo ลูกทุกตัวต้องให้ agent ตั้งคำสั่งเอง

## ขอบเขต

- **อยู่ในขอบเขต (`sandbox-setup`):** sandbox ของ repo ภาษาอื่นมี dependency ก่อน task check แรก; topology หลาย repo ได้ dependency ทุก repo ที่ change แก้
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- Maven, Gradle และ dotnet (ดึง dependency เองตอนรันเทสต์)
- สร้าง virtualenv ให้ requirements.txt ที่ไม่มี lockfile
- ติดตั้งใน repository ที่อ่านอย่างเดียว

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Build installs dependencies from the lockfiles of composer, Bundler, uv, Poetry, Pipenv, Go modules, Cargo, pub (Dart/Flutter), and Mix as well as npm/pnpm/yarn/bun, in every writable repository of a topology, skipping a tool the machine lacks.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/sandbox/sandbox-setup.mjs`, `.claude/harness/tests/sandbox-polyglot-setup.test.mjs`, `.claude/harness/lifecycle/build.md`, `.claude/harness/README.md`, `.claude/tests/run-all.sh`, `.claude/tests/README.md`, … +2 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| polyglot-lockfile-install | PHP | success | T001 | test: `.claude/harness/tests/sandbox-polyglot-setup.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | สองภาษา | success | T001 |  |  |
|  | Flutter | success | T001 |  |  |
|  | lockfile เปลี่ยน | success | T001 |  |  |
|  | ไม่มีเครื่องมือ | boundary | T001 |  |  |
|  | manifest ไม่มี lockfile | boundary | T001 |  |  |
|  | ปิดการติดตั้ง | boundary | T001 |  |  |
| sibling-repository-install | repo ลูก JS | success | T002 | test: `.claude/harness/tests/sandbox-polyglot-setup.test.mjs` | — |
|  | repo อ่านอย่างเดียว | boundary | T002 |  |  |
|  | retry | failure | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (10).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1: Land's post-install step now uses the widened `SETUP_DEPENDENCY_FILES` and the full `workspaceSetupPlan`. After Land, a change to any manifest or lockfile (for example `go.mod` or `Cargo.lock`) runs composer, bundle, cargo, mix and the others in the user's real checkout, not only in the sandbox. The agreement and the CHANGELOG entry cover Build sandboxes only. `post-land-install.test.mjs` does not exercise the new ecosystems. Either keep Land JS-only, or name this in the agreement and add a regression test. (root/.claude/harness/runtime/workflow/land/post-land-install.mjs:6) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f2: The sibling retry uses `repository.setupCommand \|\| record.setup.command` and never checks `sandbox.installDependencies === false`. The root path withdraws a failed detected install when the project opts out, but a sibling's failed detected install is still retried after opt-out. The retry also can't tell a detected command from a configured one, so a removed `setupCommand` is still retried. (root/.claude/harness/runtime/workflow/sandbox/sandbox-repositories.mjs:296) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f3: The harness README, `lifecycle/build.md` and CHANGELOG were updated. The user-facing pages `website/docs/src/content/docs/{loop/build.md,foundation-config.md}` and the `th/` copies still say detection covers only npm, pnpm, yarn and bun, and do not mention sibling repositories. REVIEW.md asks that EN and TH pages stay aligned in behavior with the canonical contract. (root/.claude/harness/README.md:744) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | d1: The README suite table is alphabetical by test file. The new `sandbox-polyglot-setup` row is inserted before `sandbox-create-phases` (line 419), when it should come after it and before `security-boundary`. The `run-all.sh` entry at line 422 is also placed after `sandbox create phases`, so the two lists are ordered differently. (root/.claude/tests/README.md:418) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 3 | m1: The Flutter check `/\bsdk:\s*flutter\b/` runs on the raw pubspec text. A commented line such as `# sdk: flutter` therefore selects `flutter pub get` for a plain Dart package. If flutter is on PATH, the setup runs the wrong tool. If it isn't, the install is silently skipped. Match only uncommented lines, or use the `flutter:` / `sdk: flutter` dependency structure. (root/.claude/harness/runtime/workflow/sandbox/sandbox-setup.mjs:160) | minor | ยังเปิดอยู่ | claude-opus |
