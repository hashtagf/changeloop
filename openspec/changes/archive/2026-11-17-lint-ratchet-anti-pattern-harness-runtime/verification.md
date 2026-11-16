# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1794853529424` | pass | 9ecfcfcc0d623fa7813d8c534bace866457e8a1eeaf796a80456229a02b6dba4 | c8b34589cd62a1afa509d05db593525248ab21ff703998c588b5e6cc283393b2 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | root-cause-rules-settimeout-spawnsync-sleep, root-cause-rules-comment-todo-hack-workaround, root-cause-rules-catch-block-statement, root-cause-rules-comment-eslint-disable-next-line, root-cause-rules-await-promise-catch-throw-comment-disable, violation-ratchet-runner, violation-ratchet-violation-baseline-baseline-violation, violation-ratchet-violation-baseline, violation-ratchet-runner-tighten, violation-ratchet-baseline-json, size-ratchet-foundation-mjs-baseline, size-ratchet-size-baseline-1500, size-ratchet-size-baseline-baseline, gate-wiring-affected-selector-suite, gate-wiring-scripts-lint | pass | 13 discovered; minimum 1 | sh -c (node --test scripts/lint/test/rules.test.mjs) && (node --test scripts/lint/test/ratchet.test.mjs) && (node --test .claude/tests/harness/affected-suite-selector.test.mjs) | 2.2 s | ffdc9cea4a590328c3478d4e7818a1afc4ae6416c1c633c4b150f2551f261cf6 |
| review | root-cause-rules-settimeout-spawnsync-sleep, root-cause-rules-comment-todo-hack-workaround, root-cause-rules-catch-block-statement, root-cause-rules-comment-eslint-disable-next-line, root-cause-rules-await-promise-catch-throw-comment-disable, violation-ratchet-runner, violation-ratchet-violation-baseline-baseline-violation, violation-ratchet-violation-baseline, violation-ratchet-runner-tighten, violation-ratchet-baseline-json, size-ratchet-foundation-mjs-baseline, size-ratchet-size-baseline-1500, size-ratchet-size-baseline-baseline, gate-wiring-affected-selector-suite, gate-wiring-scripts-lint | pass | The repair closes f1. In `.claude/tests/run-all.sh:379`, the `lint rules` row now lists `scripts/lint/test/rules.test.mjs` and `scripts/lint/test/ratchet.test.mjs` by name instead of using a glob. `.claude/tests/harness/test-registration.test.mjs:37` counts a test as registered when its basename appears in the runner text from `.claude/tests/`. Both basenames now appear in `run-all.sh`, so neither is reported as an orphan, and `scripts/lint/test/` has only these two test files. The suite labels `lint ratchet` and `lint rules` are unchanged. They still match `ALWAYS` and the `scripts/lint/` mapping in `affected-suite-selector.mjs` (lines 12 and 52), so the `--affected` wiring still holds. The new README rows describe both suites accurately. They name the explicit file list and the baseline path, and they match the spec's ratchet, size-cap and `--tighten` behavior. The two scoped files contain no new defects. | — | 0.0 s | fa2547375091629c60686f960b01af2b140a0a6c729b63aa55790c5e00d95b51 |
| test | root-cause-rules-settimeout-spawnsync-sleep, root-cause-rules-comment-todo-hack-workaround, root-cause-rules-catch-block-statement, root-cause-rules-comment-eslint-disable-next-line, root-cause-rules-await-promise-catch-throw-comment-disable, violation-ratchet-runner, violation-ratchet-violation-baseline-baseline-violation, violation-ratchet-violation-baseline, violation-ratchet-runner-tighten, violation-ratchet-baseline-json, size-ratchet-foundation-mjs-baseline, size-ratchet-size-baseline-1500, size-ratchet-size-baseline-baseline, gate-wiring-affected-selector-suite, gate-wiring-scripts-lint | pass | exit 0; 2157ms; readiness observed; critical cases not declared | sh -c (node --test scripts/lint/test/rules.test.mjs) && (node --test scripts/lint/test/ratchet.test.mjs) && (node --test .claude/tests/harness/affected-suite-selector.test.mjs) | 2.2 s | c1ad6148dd0a059b7dc6434caf4eeff9bdb798e13f302adcefebc8634b3524bd |

## Advisory

ไม่มี

## Review

ดู ภาคผนวก: ผล review ใน proposal.md
