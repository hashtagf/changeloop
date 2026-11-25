# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795587152073` | pass | 0e5c30a69be6a38193a96706e64f3a114ac32b1dfe515d93c9954a03b47cb9dc | 524319393b5748711a9c68342036bd74cd15b8c2738a178930275251aa5be57b |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| accessibility | btw-command-btw, btw-command-btw-2, btw-command-btw-3, btw-command-btw-4, btw-isolation-btw, btw-isolation-esc, btw-isolation-btw-2 | pass | exit 0; 129ms; readiness observed; critical cases not declared | node /Users/hashtagf/Desktop/Work/changeloop/.claude/harness/runtime/evidence/accessibility-check.mjs | 0.1 s | ab2886d3689358f6eeca964f147462f1b2bad84efa35c40ca9b44a50752749a1 |
| dependency-supply-chain | btw-command-btw, btw-command-btw-2, btw-command-btw-3, btw-command-btw-4, btw-isolation-btw, btw-isolation-esc, btw-isolation-btw-2 | pass | exit 0; 348ms; readiness observed; critical cases not declared | node /Users/hashtagf/Desktop/Work/changeloop/.claude/harness/runtime/evidence/npm-lockfile-check.mjs | 0.3 s | dc0ddd1f81dcdb5775d0199db8aadfba1070d63b6c73926a1d4de862f14268cf |
| discovery | btw-command-btw, btw-command-btw-2, btw-command-btw-3, btw-command-btw-4, btw-isolation-btw, btw-isolation-esc, btw-isolation-btw-2 | pass | 12 discovered; minimum 1 | sh -c (cd pi-extensions && node --test btw/btw.test.cjs) && (cd pi-extensions && npm test) | 40.0 s | 6359ccfb5733898c365a389a23db29da96c635e7962c02ef34c4bd95a5d9d3d0 |
| review | btw-command-btw, btw-command-btw-2, btw-command-btw-3, btw-command-btw-4, btw-isolation-btw, btw-isolation-esc, btw-isolation-btw-2 | pass | I found no defects in the diff. All seven scenarios are implemented and exercised by tests in btw.test.cjs. I read the diff only and ran no tests. The packet carries no test evidence. The tests fake modelRegistry.complete and sessionManager.buildContextEntries, so only type-checking can confirm those match Pi's real API. | — | 0.0 s | 1c3e362fcb9eb6492109e3cc2c7e06f5bbc370e8dfa462896996202faa9d175f |
| static-analysis | btw-command-btw, btw-command-btw-2, btw-command-btw-3, btw-command-btw-4, btw-isolation-btw, btw-isolation-esc, btw-isolation-btw-2 | pass | consumer quality reduced; lanes 13; failed 0; unavailable 0; reduced assurance 6; exit 0; 13067ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 13.1 s | d55c01710113636cec98bd4751a30e6cd1a92aaeee6a660fe49bdbf5ed7f439f |
| test | btw-command-btw, btw-command-btw-2, btw-command-btw-3, btw-command-btw-4, btw-isolation-btw, btw-isolation-esc, btw-isolation-btw-2 | pass | exit 0; 40035ms; readiness observed; critical cases not declared | sh -c (cd pi-extensions && node --test btw/btw.test.cjs) && (cd pi-extensions && npm test) | 40.0 s | bcb5cd79dfff767320a305d18393656d97bba2a7ec8df54c6da096c4235953e8 |

## Advisory

- browser: policy-inferred-unwired

## Review

ดู ภาคผนวก: ผล review ใน proposal.md
