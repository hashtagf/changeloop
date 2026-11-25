# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795586924291` | pass | 58ead867e14bd771c2b900acc6bb4117116a5288e9e7b1e080047f349dbfd3dd | e708532eb72542f7a83682269ac157240d158995b53e7a8603fae53aa8e96cdf |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | carry-uncommitted-change-land, carry-uncommitted-land, carry-uncommitted-land-apply, carry-uncommitted-sandbox-sync | pass | 8 discovered; minimum 1 | sh -c node --test .claude/harness/tests/landed-carry-sync.test.mjs | 77.4 s | f3eeae96df6367cd9211236fc3f0d29e458ac195a70ed1b88744c3c87e65f0b0 |
| review | carry-uncommitted-change-land, carry-uncommitted-land, carry-uncommitted-land-apply, carry-uncommitted-sandbox-sync | pass | The repair closes both unresolved findings. For F1, Land's preflight (`stopForUncarriedTarget`) and the sync now share one rule, `uncommittedCarryPlan`. That rule goes through the files the sync carried in earlier (`workspace.targetUncommitted`) as well as what is uncommitted now. A carried file still at its carried bytes, whose target copy is now missing or different (for example deleted, or reverted to HEAD), lands in `restore`. Land then stops with target-edit-sync, and the sync puts the target's bytes back or removes the sandbox copy. A test covers this for a deleted untracked file. For F2, the shared rule only carries regular files: symlinks, nested-repository directories and gitlinks get kind "other" and are skipped, and untracked nested repositories are listed with a trailing `/` and filtered out. A path whose sandbox copy differs from the base (or exists when the base does not) is skipped as the change's own work. So Land asks for a sync only when that sync would change the sandbox, and the no-progress loop cannot happen. Both sides use the same identity (`pathIdentity` returns `fileDigest` for regular files) and the same base (`sandboxBase` is `baseHead \|\| "HEAD"`). The Land apply wiring passes `lstat`, `readFile`, `gitBuffer` and `blockWithDecision`, so the preflight is not silently skipped. A test covers the symlink and nested-repository cases. One new minor issue: bookkeeping goes wrong when a path moves from the uncommitted carry to the landed carry. | — | 0.0 s | b181e3015c8cfbefcc714b46e4400f3ca984e8eb20633a72909ec6261a717937 |
| static-analysis | carry-uncommitted-change-land, carry-uncommitted-land, carry-uncommitted-land-apply, carry-uncommitted-sandbox-sync | pass | consumer quality reduced; lanes 13; failed 0; unavailable 0; reduced assurance 6; exit 0; 12437ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 12.4 s | 1ca9c47cfa4444e0bc5ced172d9ec6dd3e0a54d858f44a2ff4ac32aa940002d4 |
| test | carry-uncommitted-change-land, carry-uncommitted-land, carry-uncommitted-land-apply, carry-uncommitted-sandbox-sync | pass | exit 0; 77423ms; readiness observed; critical cases not declared | sh -c node --test .claude/harness/tests/landed-carry-sync.test.mjs | 77.4 s | 06c95e1144daa6ff7bf1f23038a553c0ebd54ccaa708dc2129867696646591fe |

## Advisory

- compatibility: policy-inferred-unwired

## Review

ดู ภาคผนวก: ผล review ใน proposal.md
