# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1794847787721` | pass | 1197f473625122def818b53375971cd89680eb066d9fd611e1c0ee19f98919aa | ab900956c9cd5fe7974a833d224931d1ede83126d8305011d4cd48b619642626 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| static-analysis | changelog-unreleased | pass | exit 0; 61ms; readiness observed; critical cases not declared | sh -c node -e "const t=require('fs').readFileSync('CHANGELOG.md','utf8');const u=t.indexOf('## [Unreleased]'),a=t.indexOf('maxParallelAgents'),p=t.indexOf('Pi guards'),r=t.indexOf('## [3.7.4]');if(!(u<a&&a<r&&p<r))process.exit(1)" | 0.1 s | ffb1738ccf4cf55b7a8315d2376614a08ce081113c222d11da8885b9c79c6535 |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
