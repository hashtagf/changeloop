# Change: discovery แยกให้ได้ว่า repo ไม่มีเทสต์จริงหรือแค่หาคำสั่งไม่เจอ เสนอคำสั่งจากตัวรันที่ติดตั้งไว้และจาก Makefile/CI/README และ onboard บอกตรง ๆ เมื่อ repo ไม่มีเทสต์

- **Change:** `discovery-repo-makefile-ci-readme-onboard-repo` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

onboard จะแยกได้ว่า repo ไม่มีเทสต์จริงหรือระบบแค่หาคำสั่งไม่เจอ และเสนอทางที่ตรงกับแต่ละกรณี

## เหตุผล

[Data] นับบน 828 repo ของผู้ใช้หลังขั้น monorepo: มี lane เทสต์ 451 repo ใน 377 repo ที่ไม่มี มี 187 repo JS ที่ไม่มี script เทสต์ (Nuxt 127, Vue 36, อื่น 24) ในนั้นมีไฟล์เทสต์แค่ 19 repo ส่วน 91 repo ไม่มี manifest ของภาษาใด และมีแค่ 15 repo ที่มีคำสั่งเทสต์ใน Makefile, CI หรือ README (/tmp/cl-cmdsrc.out)

[Data] ไฟล์ .vue พบใน 239 repo แต่ pack ของ JS/TS ไม่นับนามสกุลนี้

[Data] ผู้ใช้เลือกแผนที่ปรับตามข้อมูลจริงแทนแผนเดิมที่ให้ agent ร่างคำสั่งจาก Makefile/CI/README อย่างเดียว

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** repo Vue/Nuxt ที่ไม่มีไฟล์ .ts หรือ .js ที่รากถูกจัดเป็น JS/TS; repo ที่มีเทสต์แต่ไม่มี script ได้ lane เทสต์; onboard มีคำสั่งให้ผู้ใช้เลือกแทนการเดา; ผู้ใช้เห็นว่า repo ไม่มีเทสต์ ไม่ใช่ระบบหาไม่เจอ; pattern ที่ลงท้ายด้วย backslash ถูกปฏิเสธตอนอ่าน config ไม่ใช่ error ตอนรัน lane
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เขียนเทสต์หรือติดตั้ง vitest ให้ repo อัตโนมัติ
- เขียน proposal ลง quality config โดยไม่มีผู้ใช้ยืนยัน
- รองรับ repo ที่ไม่มี manifest ของภาษาใดเลย (91 repo) นอกจากรายงานว่าไม่มีเทสต์
- คำสั่ง CLI ใหม่สำหรับลองรันคำสั่ง (ใช้ quality run --capability test)

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Quality discovery now counts .vue files as JavaScript/TypeScript, proposes an installed test runner for a repository that has test files but no test script, lists test commands found in its Makefile, CI, and README for the user to confirm, and says plainly when a repository has no tests at all.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/quality/toolchain-packs.json`, `.claude/harness/runtime/quality/language-profiles.mjs`, `.claude/harness/runtime/quality/quality-discovery.mjs`, `.claude/harness/runtime/quality/test-gap-discovery.mjs`, `.claude/harness/runtime/quality/pyramid-readiness.mjs`, `.claude/harness/runtime/composition/pyramid-readiness-command.mjs`, … +8 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| vue-is-js | repo Nuxt | success | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | ไฟล์ .vue อย่างเดียว | boundary | T001 |  |  |
| test-files-runner | มีไฟล์เทสต์และ vitest | success | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | มีไฟล์เทสต์แต่ไม่มีตัวรัน | boundary | T001 |  |  |
| test-command-proposals | Makefile มี target test | success | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | CI มีคำสั่งเทสต์ | success | T001 |  |  |
|  | มี lane test แล้ว | boundary | T001 |  |  |
| no-tests-readiness | repo Nuxt ไม่มีเทสต์ | failure | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | readiness ไม่มีเทสต์ | failure | T001 |  |  |
| duration-pattern-alone | pattern ลงท้าย backslash | failure | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/tests/run-all.sh` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (10).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (3); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | ci-run-regex-crosses-newline: `CI_RUN` ends its key with `\s*` before the capture. `\s*` also matches a newline. For a GitLab or Bitbucket list `script:\n  - npm test`, `script:` is followed by the next line, so the capture is `- npm test`. `clean()` does not strip the dash, so a malformed proposal `- npm test` is added next to the correct `npm test` from `CI_BLOCK_LINE`. It also uses up one of the ten proposal slots. The only CI test uses a GitHub workflow with `run: go test ...`, so `.gitlab-ci.yml` and `bitbucket-pipelines.yml` have no test, although the requirement names them. Use `[ \t]*` after the colon, or require the value on the same line. (root/.claude/harness/runtime/quality/test-gap-discovery.mjs:65) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | no-tests-overclaims-for-unmatched-languages: Readiness runs `countTestFiles` for every repository that has no test lane, whatever its language. `TEST_FILE` only knows js/ts/vue `.test`/`.spec`, `_test.go`, `test_*.py`, `*_test.py`, `*_spec.rb` and `.cy.*`. A Java, PHP, Dart or Rust repository, or one that uses `__tests__/`, can have real tests and still count 0. Readiness then says "the repository has no tests" and suggests vitest, go test or pytest. The walk also stops at `maximumEntries` and returns a partial count, so a large repository can wrongly count 0. The agreement lists only those patterns, so the behaviour matches the spec. It is a false statement for other languages. Consider only reporting 0 when the pattern covers the detected profile, or when the walk was not truncated. (root/.claude/harness/runtime/composition/pyramid-readiness-command.mjs:52) | minor | ยังเปิดอยู่ | claude-opus |
