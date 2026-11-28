# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 4 discovered; minimum 1 | 0.5 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 142889ms; readiness observed | 142.9 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 514ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 0.5 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795880690663` | pass | 083b9f41583dc14b42a32cef38966ce17b2acdc1aed203b8a77c946e22851639 | 7f3ca9ed5e5f563fc0effe3dda7805fb5b97764a08a070d84b971c4fe58fa9b1 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | quality-source-sandbox-quality-run-change-a-capability-lint, quality-source-sandbox-quality-baseline-write-change-a, quality-source-sandbox-quality-run-change, quality-source-sandbox-quality-run-change-a, quality-source-sandbox-lane-lint-change-a-finding | pass | 4 discovered; minimum 1 | sh -c node --test .claude/harness/tests/quality-source-sandbox.test.mjs | 0.5 s | e2b4b2044df8859a194be87dc8d7a26ae745bb71cf5970c5931cbb257eed6772 |
| static-analysis | quality-source-sandbox-quality-run-change-a-capability-lint, quality-source-sandbox-quality-baseline-write-change-a, quality-source-sandbox-quality-run-change, quality-source-sandbox-quality-run-change-a, quality-source-sandbox-lane-lint-change-a-finding | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 142889ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 142.9 s | 3af220340bbbc1d6d504fbebff3290484db2d96f18f2b12107c3a2085bc1f4ca |
| test | quality-source-sandbox-quality-run-change-a-capability-lint, quality-source-sandbox-quality-baseline-write-change-a, quality-source-sandbox-quality-run-change, quality-source-sandbox-quality-run-change-a, quality-source-sandbox-lane-lint-change-a-finding | pass | exit 0; 514ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/quality-source-sandbox.test.mjs | 0.5 s | bcb27958e5910ce47dbea09d1b84429da2c7dc0ceb613f0bd32a7f0de660c29e |
