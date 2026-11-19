# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795111428585` | pass | 2277ca717d2ba0753de81296a61ee7687adf6e3ec2751b835f0551f2e4350fe3 | 3ebbdc10944923069516847bfcd65bc961b790c18341ff78df1abed0231718c6 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| static-analysis | same-version-brew-migration | pass | exit 0; 182ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c rtk proxy ruby -c Formula/cloop.rb && rtk proxy node --test .claude/tests/harness/local-release-rehearsal.test.mjs | 0.2 s | 3dfbfa32d1ba7e113941ea7e6da23995e558f35ca969141933538e3aaf931c31 |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
