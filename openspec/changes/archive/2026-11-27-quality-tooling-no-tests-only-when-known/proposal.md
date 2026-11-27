# Change: ระบบบอกว่า repo ไม่มีเทสต์เฉพาะเมื่อนับครบและรู้จักรูปแบบไฟล์เทสต์ของภาษานั้น และคำสั่งจาก CI แบบรายการอ่านได้ถูก

- **Change:** `quality-tooling-no-tests-only-when-known` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

ระบบจะไม่บอกผิดว่า repo ไม่มีเทสต์ และคำสั่งเทสต์ที่อ่านจาก CI ของ GitLab และ Bitbucket จะไม่ซ้ำหรือผิดรูป

## เหตุผล

[Data] รีวิวของ change ที่แยก "ไม่มีเทสต์" กับ "หาไม่เจอ" พบว่า repo Java, PHP, Dart, Rust หรือที่ใช้ __tests__/ อาจถูกบอกว่าไม่มีเทสต์ทั้งที่มี และ repo ใหญ่ที่นับไม่ครบก็อาจได้ 0

[Data] script แบบรายการหลายบรรทัดใน .gitlab-ci.yml และ bitbucket-pipelines.yml ทำให้ได้ proposal "- npm test" ซ้ำกับ "npm test"

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** ไม่มีการบอกผิดว่า repo ไม่มีเทสต์; proposal จาก CI ไม่ซ้ำและไม่ผิดรูป
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เพิ่มภาษาใหม่นอกจากรูปแบบไฟล์เทสต์
- เสนอตัวรันให้ภาษานอก JS/TS, Go, Python

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/quality/test-gap-discovery.mjs`, `.claude/harness/runtime/quality/quality-discovery.mjs`, `.claude/harness/runtime/composition/pyramid-readiness-command.mjs`, `.claude/harness/tests/test-gap-discovery.test.mjs`, `.claude/harness/CONSUMER-QUALITY.md`, `CHANGELOG.md`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** repo Java ที่มี src/test/java/FooTest.java และไม่มี lane test ได้ readiness ว่า the repository has no tests; .gitlab-ci.yml ที่มี script: ขึ้นบรรทัดใหม่ - npm test ได้ proposal - npm test ซ้ำกับ npm test
- **Root cause:** TEST_FILE รู้จักแค่ไฟล์เทสต์ของ JS, Go, Python, Ruby และ countTestFiles คืนค่าบางส่วนเมื่อเดินเกินเพดาน ส่วน CI_RUN ใช้ \s* หลัง : ซึ่งข้ามบรรทัดได้
- **Regression proof:** เทสต์ใน test-gap-discovery.test.mjs สำหรับ Java, PHP, Dart, Rust, __tests__, การนับที่ถูกตัด และ CI ของ GitLab กับ Bitbucket

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| Java มีเทสต์ | testFiles เป็น 1 และไม่มี test-setup | No separate step; the outcome is the handling | no-tests-only-when-known |
| __tests__ | testFiles เป็น 1 | No separate step; the outcome is the handling | no-tests-only-when-known |
| GitLab script แบบรายการ | proposals มี npm test รายการเดียว ไม่มี - npm test | No separate step; the outcome is the handling | ci-list-commands |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| no-tests-only-when-known | นับไม่ครบ | boundary | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs` | — |
|  | ภาษาที่ไม่รู้จักรูปแบบ | boundary | T001 |  |  |
|  | Java มีเทสต์ | failure | T001 |  |  |
|  | __tests__ | failure | T001 |  |  |
| ci-list-commands | Bitbucket script แบบรายการ | success | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs` | — |
|  | GitLab script แบบรายการ | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (6).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
