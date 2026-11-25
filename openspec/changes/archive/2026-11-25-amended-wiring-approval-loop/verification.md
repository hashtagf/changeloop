# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795586231888` | pass | e70caef6f21e8a0905f5b08a356c1307fd8a70238904fdc9015cb225c64d3eee | 015b3e388e9b8e6296d04a8c1a45d42163ae943a9ed59be33597d7264062bf67 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | amended-wiring-carried-evidence-wiring-execution-yaml-target-san, amended-wiring-carried-evidence-wiring, amended-wiring-carried-evidence-wiring-2, amended-wiring-carried-evidence-wiring-3 | pass | 12 discovered; minimum 1 | sh -c node --test .claude/harness/tests/user-decisions.test.mjs | 0.2 s | 938de761a46466d499729ebaacf067ee9050c28e4efba38287b3598e56eb3cab |
| static-analysis | amended-wiring-carried-evidence-wiring-execution-yaml-target-san, amended-wiring-carried-evidence-wiring, amended-wiring-carried-evidence-wiring-2, amended-wiring-carried-evidence-wiring-3 | pass | consumer quality reduced; lanes 13; failed 0; unavailable 0; reduced assurance 6; exit 0; 11649ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 11.6 s | ce27c40c5060fe703c6651e093d7fd5d46396dc86d207acec9f3649e72d63555 |
| test | amended-wiring-carried-evidence-wiring-execution-yaml-target-san, amended-wiring-carried-evidence-wiring, amended-wiring-carried-evidence-wiring-2, amended-wiring-carried-evidence-wiring-3 | pass | exit 0; 172ms; readiness observed; critical cases not declared | sh -c node --test .claude/harness/tests/user-decisions.test.mjs | 0.2 s | d31409961d997999edb93e26e5496ac7afdb7b5cf1da0db5364cf5cfa724eb5d |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
