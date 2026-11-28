# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 5 discovered; minimum 1 | 32.1 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 141782ms; readiness observed | 141.8 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 32144ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 32.1 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795878630257` | pass | cb18320d280b06a9d164735f57e2e8075efd63d613d3f73685f433bbdf9b4877 | fb6d47edfb332412c64e697e722adb973014d59185efbaa34b0ece33b9a21d33 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | polyglot-lifecycle-seam-subtract-sandbox-advance-archived, polyglot-lifecycle-seam-subtract-advance-archived, polyglot-lifecycle-seam-subtract-advance-archived-2, polyglot-lifecycle-seam-subtract-advance-archived-3, polyglot-lifecycle-seam-advance-archived, polyglot-lifecycle-seam-6 | pass | 5 discovered; minimum 1 | sh -c node --test .claude/harness/tests/polyglot-lifecycle-seam.test.mjs | 32.1 s | 29deb46ff9f74534fc9313b2a34985de7ea46c744fb37e1d1521022c63634f68 |
| static-analysis | polyglot-lifecycle-seam-subtract-sandbox-advance-archived, polyglot-lifecycle-seam-subtract-advance-archived, polyglot-lifecycle-seam-subtract-advance-archived-2, polyglot-lifecycle-seam-subtract-advance-archived-3, polyglot-lifecycle-seam-advance-archived, polyglot-lifecycle-seam-6 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 141782ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 141.8 s | 1cabbf0e06f52e3a43f30f542fd54e17d01cb47f4034fc13bf699470315c336b |
| test | polyglot-lifecycle-seam-subtract-sandbox-advance-archived, polyglot-lifecycle-seam-subtract-advance-archived, polyglot-lifecycle-seam-subtract-advance-archived-2, polyglot-lifecycle-seam-subtract-advance-archived-3, polyglot-lifecycle-seam-advance-archived, polyglot-lifecycle-seam-6 | pass | exit 0; 32144ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/polyglot-lifecycle-seam.test.mjs | 32.1 s | 88ea0c8b9a2e0ac2b8ac72ab3091ee90452e86a38f90ad4fd7c8f42ea1e1acce |
