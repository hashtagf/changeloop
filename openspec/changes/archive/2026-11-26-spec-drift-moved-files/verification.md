# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 19 discovered; minimum 1 | 0.6 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 215675ms; readiness observed | 215.7 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 581ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 0.6 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795668246723` | pass | 2028ee5be3d2a37850bb3e9403a885f0db17819c1614af0e10ce04de43ef570c | 1910e1e4dea59d1c7868a76bf770a10c7a72032c2703ee10fb9e98e2d8ca5a73 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | moved-files-spec-drift, moved-files-spec-drift-2, moved-files-spec-drift-3, moved-files-spec-drift-4 | pass | 19 discovered; minimum 1 | sh -c node --test .claude/harness/tests/spec-drift.test.mjs | 0.6 s | 6a7e9e2ff42b2152374c0a4f925d0c1cb25543f4280c2787e16d031681dc2f15 |
| static-analysis | moved-files-spec-drift, moved-files-spec-drift-2, moved-files-spec-drift-3, moved-files-spec-drift-4 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 215675ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 215.7 s | 13be3c135d81faa1dc75075a341d88daab74d82f821561c0dbc007f96929be5f |
| test | moved-files-spec-drift, moved-files-spec-drift-2, moved-files-spec-drift-3, moved-files-spec-drift-4 | pass | exit 0; 581ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/spec-drift.test.mjs | 0.6 s | 337c3af6980592bdd4ba4b0bde1189ed2b742de2cc4c62ee5719ba1f0ef828f5 |
