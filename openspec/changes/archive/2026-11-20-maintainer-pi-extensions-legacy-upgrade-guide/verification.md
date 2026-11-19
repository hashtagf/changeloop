# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795110526198` | pass | 872c6ae4d88491d5b0ee0fb1d5ea74b400c3e2b8138221770b33e2d3af7d4ee7 | 67b2641893ff95cb2252c9076e759bd7a9d8d1708872b7ed97189f039d786c9e |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | canonical-cloop-homebrew-formula-homebrew-tap-hashtagf-changeloo, canonical-cloop-homebrew-formula-homebrew-tap, canonical-cloop-homebrew-formula-release-candidate, canonical-cloop-homebrew-formula-4 | pass | 15 discovered; minimum 1 | sh -c (rtk test bash .claude/tests/docs/run-doc-consistency.sh && rtk npm --prefix website/docs run build) && (rtk proxy ruby -c Formula/cloop.rb && rtk proxy node --test .claude/tests/harness/release-preflight.test.mjs .claude/tests/harness/local-release-rehearsal.test.mjs && rtk test bash .claude/tests/docs/run-doc-consistency.sh && rtk npm --prefix website/docs run build) | 14.2 s | ab7e694cc526a7288a97939b5e2a9452697a163a68048a841a7ec30385f120bd |
| static-analysis | legacy-upgrade-guide-cli-homebrew-tap, legacy-upgrade-guide-2, legacy-upgrade-guide-installer | pass | exit 0; 7573ms; readiness observed; critical cases not declared | sh -c rtk test bash .claude/tests/docs/run-doc-consistency.sh && rtk npm --prefix website/docs run build | 7.6 s | 25f12bc0e0cb9dabca27f231b6da871b8028c44919b93b0e59dd29bafc09e282 |
| test | canonical-cloop-homebrew-formula-homebrew-tap-hashtagf-changeloo, canonical-cloop-homebrew-formula-homebrew-tap, canonical-cloop-homebrew-formula-release-candidate, canonical-cloop-homebrew-formula-4 | pass | exit 0; 14193ms; readiness observed; critical cases not declared | sh -c (rtk test bash .claude/tests/docs/run-doc-consistency.sh && rtk npm --prefix website/docs run build) && (rtk proxy ruby -c Formula/cloop.rb && rtk proxy node --test .claude/tests/harness/release-preflight.test.mjs .claude/tests/harness/local-release-rehearsal.test.mjs && rtk test bash .claude/tests/docs/run-doc-consistency.sh && rtk npm --prefix website/docs run build) | 14.2 s | 6cf1405a61fcc67004a5fb43f5fbfdc8e5a1874d0f46b38c5e98d5361bb65b8f |

## Advisory

- accessibility: policy-inferred-unwired
- deployment: policy-inferred-unwired

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
