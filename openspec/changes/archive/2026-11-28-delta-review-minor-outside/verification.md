# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 1 discovered; minimum 1 | 0.3 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 152204ms; readiness observed | 152.2 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 320ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 0.3 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795881995357` | pass | 1e7989d8ed46d2265a278e24ab60b631b69d298a46a1ce4e73f4c2bc8f0eb3be | 330620fd7c7f091ad1ff47a0e013207e79cb9783c0fc08e1de48d483281e2119 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | minor-outside-scope-recorded-1, minor-outside-scope-recorded-2, minor-outside-scope-recorded-3 | pass | 1 discovered; minimum 1 | sh -c node --test .claude/harness/tests/workflow-policy.test.mjs | 0.3 s | d0e9bca2f441ca6ab2194de52cee35b64457891b3aa42bf4940a9531efec8e61 |
| static-analysis | minor-outside-scope-recorded-1, minor-outside-scope-recorded-2, minor-outside-scope-recorded-3 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 152204ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 152.2 s | 5b5901bb9b3b451985df89241d1b1b68f408209abbe56ca99035be3e52de92ac |
| test | minor-outside-scope-recorded-1, minor-outside-scope-recorded-2, minor-outside-scope-recorded-3 | pass | exit 0; 320ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/workflow-policy.test.mjs | 0.3 s | 37b66b56d1231dda41723a7fe52011bee1df265324b95f3af889936e38bc6cd2 |
