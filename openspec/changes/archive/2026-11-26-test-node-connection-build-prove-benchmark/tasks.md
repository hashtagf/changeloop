# Tasks

> This is the sole implementation ledger.

- [x] **T001** แทรก --test-force-exit ใน argv ของ node --test ที่ harness รัน พร้อม test และ CHANGELOG [key:force-exit] [kind:implementation] [paths:.claude/harness/runtime/core/node-test-exit.mjs,.claude/harness/runtime/evidence/**,.claude/harness/runtime/workflow/**,.claude/harness/tests/node-test-force-exit.test.mjs,.claude/harness/tests/harness-time-seam.test.mjs,.claude/harness/tests/test-discrimination-verdict.test.mjs,.claude/harness/tests/test-discrimination.test.mjs,.claude/tests/run-all.sh,.claude/tests/README.md,CHANGELOG.md] [claims:node-test-force-exit-advance-task-verify,node-test-force-exit-advance-task-verify-2,node-test-force-exit-verify-npm-test-test-force-exit] — verify: `node --test .claude/harness/tests/node-test-force-exit.test.mjs`
- [x] **T002** runner รัน oracle ซ้ำหลังรอบซ่อม พร้อม test [key:oracle-rerun] [kind:implementation] [paths:.claude/tests/bench/openspec-native/run.mjs,.claude/tests/bench/tests/openspec-native-runner.test.mjs] [claims:bench-oracle-after-repair] — verify: `node --test .claude/tests/bench/tests/openspec-native-runner.test.mjs`
