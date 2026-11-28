# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 18 discovered; minimum 1 | 2.9 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 135171ms; readiness observed | 135.2 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 2918ms; readiness observed; critical cases not declared | 2.9 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795839343317` | pass | 99fafe651bca00f3c53403a23739bae31ca39f89775e2c53553f38b6ebe55d08 | 546fe764b9227fb5690404a2f45395ad98d8e2630d636a81889d129e4f755fda |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | fast-checks-guide-claude-skills-onboard-references-fast-checks-m, fast-checks-guide-claude-skills-onboard-skill-md, slow-lane-hint-quality-doctor, slow-lane-hint-quality-doctor-2, slow-lane-hint-quality-doctor-3 | pass | 18 discovered; minimum 1 | sh -c (node --test .claude/tests/docs/skill-catalog.test.mjs) && (node --test .claude/harness/tests/quality-runtime.test.mjs) | 2.9 s | afa89e5247100ae9d1f215b765eb4fa31016b25802841ff8fbf5f1f07d553965 |
| static-analysis | fast-checks-guide-claude-skills-onboard-references-fast-checks-m, fast-checks-guide-claude-skills-onboard-skill-md, slow-lane-hint-quality-doctor, slow-lane-hint-quality-doctor-2, slow-lane-hint-quality-doctor-3 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 135171ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 135.2 s | d9b84bb7a35910297b140beb93fdd4af1b225128b05b4242f60a9b48dedb7e9b |
| test | fast-checks-guide-claude-skills-onboard-references-fast-checks-m, fast-checks-guide-claude-skills-onboard-skill-md, slow-lane-hint-quality-doctor, slow-lane-hint-quality-doctor-2, slow-lane-hint-quality-doctor-3 | pass | exit 0; 2918ms; readiness observed; critical cases not declared | sh -c (node --test .claude/tests/docs/skill-catalog.test.mjs) && (node --test .claude/harness/tests/quality-runtime.test.mjs) | 2.9 s | e73d3471b0692a3ccf8993827817e0d2620222b1d73c1bf67fc3bdf6db6d29cf |
