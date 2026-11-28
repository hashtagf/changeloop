# Change: Prove นับจำนวนเทสต์ของ runner หลักทุกภาษาและ JUnit XML หา test provider ให้ repo ที่ไม่มี package.json และ Change/Prove จัดไฟล์เทสต์กับไฟล์ dependency ของ JVM, .NET, Dart, Swift, Elixir ได้ถูก

- **Change:** `prove-runner-junit-xml-test-provider-repo-package-json-change-pr` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

repo ภาษาอื่นนอกจาก JavaScript ผ่านขั้นพิสูจน์ได้ด้วยผลเทสต์ปกติของภาษานั้น โดย agent ไม่ต้องเปลี่ยนรูปแบบผลเทสต์หรือตั้งคำสั่งเทสต์เอง

## เหตุผล

[Data] การสำรวจ phase-language-repo-coverage พบว่าขั้นพิสูจน์นับจำนวนเทสต์ได้เฉพาะ JavaScript, Go แบบ -json และ Python unittest ส่วน Maven, Gradle, PHPUnit, dotnet, Dart/Flutter, Swift และ Elixir นับไม่ได้เลย ทำให้ change ระดับ standard ของ repo เหล่านี้ค้างที่ผลไม่ชัดเจนและ Land ไม่ได้

[Data] ระบบหาคำสั่งเทสต์ให้เองเฉพาะ repo ที่มี package.json ทั้งที่การตั้งค่าคุณภาพของโปรเจกต์มีคำสั่งเทสต์ของภาษาอื่นอยู่แล้ว

[Data] ไฟล์เทสต์แบบ FooTest.java หรือโฟลเดอร์ Foo.Tests ของ .NET และไฟล์ manifest เช่น pom.xml ถูกนับเป็นโค้ดสินค้า ทำให้การตรวจว่าเทสต์ fail ก่อนแก้มองไม่เห็นเทสต์เหล่านั้น

## ขอบเขต

- **อยู่ในขอบเขต (`evidence-providers`):** runner หลักของทุกภาษาให้ receipt discovery ที่มีจำนวน; Gradle, Maven, PHPUnit, dotnet และ runner อื่นที่ส่ง JUnit XML ได้จำนวนเทสต์; agent ไม่ต้องตั้ง test command ใน execution.yaml เองสำหรับ repo ภาษาอื่น; work type, การตรวจเทสต์ fail ก่อนแก้ และคำเตือน task ใช้ไฟล์ของภาษาเหล่านี้ถูก
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- จำกัดไฟล์ในการตรวจว่าเทสต์ fail ก่อนแก้ให้ runner นอกจาก node --test, pytest, go test (ยังรันทั้งคำสั่งเหมือนเดิม)
- อ่าน XML ด้วย parser เต็มรูปแบบ (อ่านเฉพาะ attribute ของ testsuite/testsuites และ testcase)
- แปลง output ที่อ่านไม่ออกเป็นจำนวนเทสต์

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Prove counts tests from JUnit XML (a report file or a report directory such as target/surefire-reports) and from the default summaries of pytest, cargo test, Maven Surefire, PHPUnit, dotnet test, dart/flutter test, swift test, ExUnit, RSpec, Minitest, and go test -v. A repository without package.json gets its test provider from its quality test lane or quality discovery. Test files and dependency manifests of JVM, .NET, Dart, Swift, and Elixir projects are classified as such.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/evidence/runner-summaries.mjs`, `.claude/harness/runtime/evidence/adapter-runtime.mjs`, `.claude/harness/runtime/workflow/validation/design-blueprints.mjs`, `.claude/harness/tests/runner-summaries.test.mjs`, `.claude/harness/tests/change-atomic-start.test.mjs`, `.claude/harness/EVIDENCE.md`, … +7 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| runner-summary-counts | pytest | success | T001 | test: `.claude/harness/tests/runner-summaries.test.mjs`, `.claude/harness/tests/change-atomic-start.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | cargo หลาย crate | success | T001 |  |  |
|  | Maven | success | T001 |  |  |
|  | PHPUnit | success | T001 |  |  |
|  | dotnet | success | T001 |  |  |
|  | Dart | success | T001 |  |  |
|  | Swift | success | T001 |  |  |
|  | ExUnit | success | T001 |  |  |
|  | RSpec และ Minitest | success | T001 |  |  |
|  | go test -v | success | T001 |  |  |
|  | ไม่มีบรรทัดสรุป | boundary | T001 |  |  |
|  | parser เดิมมาก่อน | boundary | T001 |  |  |
|  | go build error | failure | T001 |  |  |
| junit-xml-counts | testsuites | success | T001 | test: `.claude/harness/tests/runner-summaries.test.mjs`, `.claude/harness/tests/change-atomic-start.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | หลาย testsuite | success | T001 |  |  |
|  | ไฟล์เก่า | boundary | T001 |  |  |
|  | attribute ไม่ใช่ตัวเลข | failure | T001 |  |  |
| test-provider-without-package-json | จาก quality lane | success | T002 | test: `.claude/harness/tests/evidence-bootstrap.test.mjs` | — |
|  | จาก discovery | success | T002 |  |  |
|  | หลาย lane | boundary | T002 |  |  |
|  | ไม่พบ | failure | T002 |  |  |
| polyglot-path-kinds | เทสต์ JVM | success | T003 | test: `.claude/harness/tests/polyglot-path-kinds.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | .NET | success | T003 |  |  |
|  | manifest | success | T003 |  |  |
|  | คำที่ไม่ใช่เทสต์ | boundary | T003 |  |  |
|  | verify ไฟล์ที่ไม่มี | failure | T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (26).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (4); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1-test-class-uppercase-before-test: The new test-class patterns require `[a-z0-9]` immediately before `Test(s)`. This appears in `LIGHT_PATHS` here, in `TEST_CLASS` in `amendment-verify.mjs`, and in `LANGUAGE_TEST_FILE` in `design-blueprints.mjs`. The spec says `<ชื่อ>Test(s).java/kt/...` with a capital T. Real test classes whose name ends in an uppercase letter are therefore treated as product code: `UITest.kt`, `APITest.java`, `UserDTOTest.java`, `RESTTests.cs`. A change that touches only such files is not inferred as a test change. A verify command naming a missing `app/UITest.kt` gets no existence or ownership issue. A task verifying another task's `APITest.java` gets no blueprint warning. `Contest` and `Latest` are already excluded by the case-sensitive capital T, so the extra lowercase/digit guard only causes false negatives. Drop the `[a-z0-9]` guard, for example `[\w.-]*Tests?\.(ext)$`. The `Test.java` and `Tests.cs` forms also need a decision, because the current guard excludes a bare `Test.java`. Add regression cases such as `app/UITest.kt` to polyglot-path-kinds.test.mjs. (root/.claude/harness/runtime/workflow/validation/dev-document.mjs) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | f2-junit-attribute-coercion: `parseJUnitXmlOutput` passes XML attribute strings through `integer()`, which uses `Number()`. `tests=""` and `tests=" "` become 0, `"1e2"` becomes 100, `"0x10"` becomes 16, and `"4.0"` becomes 4. The spec says a value that is not a non-negative integer is not counted, and the stdout parsers do use `\d+`. Validate attributes with `/^\d+$/` before converting. The test only covers `tests="many"`. (root/.claude/harness/runtime/evidence/runner-summaries.mjs) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f3-junit-nested-suites: When `<testsuites>` carries no `tests` attribute, as in PHPUnit and some other reporters, the fallback sums every `<testsuite>` tag. Nested suites, where the parent's `tests` already includes its children, are therefore counted more than once, so discovered counts can be inflated. The parser has no nesting guard and no test for nested suites. Consider summing only leaf suites, or suites that directly contain `<testcase>` elements. (root/.claude/harness/runtime/evidence/runner-summaries.mjs) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f4-precedence-and-wiring-untested: The "parser เดิมมาก่อน" test only asserts that `parseRunnerSummaryOutput` reads the vitest footer. It never runs `parsedAdapterReport`, so the claim that language parsers run only when nothing else counted rests on code in adapter-runtime.mjs alone. The directory-report branch of `freshConfiguredReport` (no artifact retained, stale directory falling back to stdout) has no adapter-level test either. The test-provider "จาก discovery" and "ไม่พบ" scenarios use a stubbed `discoverTestCommand`. No test runs the real `discoverRepositoryQuality` on a `Cargo.toml` repo, and none covers the `foundation.mjs` injection. (root/.claude/harness/tests/runner-summaries.test.mjs:95) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f5-unrequested-go-json-advisory-change: The `go test -json` advisory is now suppressed, the advice text is rewritten, and the existing assertion in change-atomic-start.test.mjs changes from `["bare","json"]` to `["bare"]`. The agreement requires only `go test -v` counting. The change appears to be accurate, because `parseGoTestJsonOutput` already counts `-json`. It is still an unrequested behavior change to an existing advisory. (root/.claude/harness/runtime/workflow/validation/design-blueprints.mjs:236) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | g1-groovy-verify-test-class: The spec lists `groovy` among the test-class extensions, and the `dev-document.mjs` and `design-blueprints.mjs` patterns include it. `TEST_SOURCE` has no `groovy`, so `verifyTestFileReferences` never returns a `FooTest.groovy` named in a verify command. That file gets no existence or ownership issue, unlike `FooTest.java` or `FooTest.kt`. Add `groovy` to `TEST_SOURCE`, with a regression case. (root/.claude/harness/runtime/workflow/draft/amendment-verify.mjs:28) | minor | แก้แล้วในรอบ 4 | claude-opus |
| 4 | m1-discovery-path-faked-not-proven: The spec scenario "จาก discovery" (Cargo.toml, no quality config, cargo on the machine) is tested only with a stub `discoverTestCommand: () => discovered`. Nothing exercises the real `discoverRepositoryQuality`, nor the chain `foundation.mjs` → `createChangeValidationRuntime` → `detectEvidenceWiring` → `discoverMissingEvidence`. If the wiring dropped the argument or the repository shape (`path`/`relativePath`) did not match discovery's, every test here would still pass. Add one case with a real `Cargo.toml` fixture through the real discovery function. (root/.claude/harness/tests/evidence-bootstrap.test.mjs:490) | minor | ยังเปิดอยู่ | claude-opus |
| 4 | m2-discovery-wrapper-skips-project-packs: `discoverTestCommand` is a one-line wrapper exported from the evidence-state composer, but it does not use that module. It also calls `discoverRepositoryQuality(repository)` without `projectPacks`, unlike the quality runtime at `quality-discovery.mjs:312`. A test command that only a project pack detects is therefore invisible to the fallback, and Prove reports `no-safe-project-command` while the quality lane finds it. Pass the packs, or import `discoverRepositoryQuality` directly in `foundation.mjs` instead of adding this layer. (root/.claude/harness/runtime/composition/evidence-state-wiring.mjs:259) | minor | ยังเปิดอยู่ | claude-opus |
| 4 | m3-junit-mixed-wrapper-undercount: `counted` uses the `<testsuites>` tags whenever every one of them carries `tests`, and ignores any bare `<testsuite>` in the same text. A report directory is concatenated, so `TEST-A.xml` containing `<testsuites tests="3">` next to `TEST-B.xml` containing a bare `<testsuite tests="2" failures="1">` counts 3 and silently drops B's tests and failure. Fall back to the outer-suite sum unless the text contains only wrapped suites, or test the mixed case. (root/.claude/harness/runtime/evidence/runner-summaries.mjs:148) | minor | ยังเปิดอยู่ | claude-opus |
| 4 | m4-swift-failures-are-assertions: XCTest's `with N failures` counts failed assertions, not failed tests, but it is used as the failed-test count. A test with two failing XCTAssert calls inside `Executed 3 tests, with 2 failures` reports failed 2, passed 1. If failures exceed the total, `result()` rejects the line and the output goes uncounted. The total stays correct, so this only skews passed/failed. Cap the failed count at the executed total, or use failed tests only if the output can name them. (root/.claude/harness/runtime/evidence/runner-summaries.mjs:96) | minor | ยังเปิดอยู่ | claude-opus |
| 4 | m5-exunit-singular-property: The ExUnit pattern accepts `properties, ` but not the singular `1 property, `, which ExUnit prints for one property test. `1 property, 5 tests, 0 failures` matches nothing, so the output stays uncounted (inconclusive, not a false pass). Use `propert(?:y\|ies)`. (root/.claude/harness/runtime/evidence/runner-summaries.mjs:113) | minor | ยังเปิดอยู่ | claude-opus |
| 4 | m6-adapter-report-directory-untested: The new `adapter-runtime.mjs` paths have no test through the adapter: a report directory is read as `content` and not kept as an artifact, the language parser is gated on `auto`, and the stderr append is skipped when the report is fresh. The tests cover only the pure functions in `runner-summaries.mjs`. A regression such as an `EISDIR` read of a directory report, or a directory artifact being pushed, would pass the current suite. Add one test through `createAdapterRuntime` or `recordTestDiscoveryAdapter` with a JUnit report directory. (root/.claude/harness/runtime/evidence/adapter-runtime.mjs:586) | minor | ยังเปิดอยู่ | claude-opus |
