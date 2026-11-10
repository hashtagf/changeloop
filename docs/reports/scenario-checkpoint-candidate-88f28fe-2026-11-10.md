# Scenario checkpoint: v3.7.0 candidate `88f28fe` — 2026-11-10

**Status:** complete. Observed paid evidence for the release checkpoint of
[RELEASING.md](../../RELEASING.md), n=1 per lane plus one rerun: 30 of 31 lanes
passed. `order-inventory-lifecycle` failed in the run and in its rerun with the
same cause ([incident](../../openspec/incidents/2026-11-10-stacked-sync-resolve-disagrees.md)).
**Release decision:** the user approved publishing v3.7.0 with that failure as
an explicit exception, because the shipped runtime equals v3.6.11 except one
URL constant, so the release adds no new risk.

## Scope and conditions

| Item | Value |
|---|---|
| Candidate | `88f28fe6` on `hashtagf/changeloop` `main`; clean worktree, lab `source.dirty: false` |
| Change since v3.6.11 | Repository and site move, `cloop` command, docs and SEO. Shipped runtime diff: `update-advisory.mjs` release URL only |
| Lanes | All 31 paid rows of `openspec-native-matrix.json`, run in sequence, one disposable consumer each |
| Model | `ANTHROPIC_MODEL=claude-sonnet-5-5`; every lane reported it (the failing lane also used `claude-haiku-5-5` for a subagent) |
| Host | Claude Code 2.1.322 (v3.6.11 checkpoint: 2.1.319) |
| Authority | User approved a US$60 cap; driver stop threshold US$55 |
| Zero-cost gates | `npm run bench:openspec-native:sentinel` pass; `npm run release:preflight` `publicationReady: true`; release dry-run rehearsal run 42651682179 on `88f28fe6` succeeded |
| Raw evidence | Outside Git: `.claude/tests/bench/results/openspec-native-lab/<lane>-<run-id>/` in the candidate worktree |
| Cost source | Host result envelopes only. The `visual` reviewer runs as a separate process whose cost is not measured |

## Results

Ran 2026-11-10T08:25Z–10:08Z. Times are scorecard `wallMs` (host only), matching
the v3.6.11 report.

| lane | v3.6.11 candidate (sonnet) | v3.7.0 candidate (sonnet) |
|---|---|---|
| bare-node-boundary | ✓ $0.42 102s | ✓ $0.60 117s |
| typescript-react-state | ✓ $0.43 90s | ✓ $0.40 59s |
| python-api-validation | ✓ $0.38 76s | ✓ $0.45 76s |
| database-migration-rollback | ✓ $0.50 125s | ✓ $0.51 114s |
| refactor-no-reproduction | ✓ $0.44 65s | ✓ $0.40 51s |
| multi-service-event-flow | ✓ $0.43 104s | ✓ $0.48 110s |
| tiny-feature | ✓ $0.35 90s | ✓ $0.41 60s |
| notes-api | ✓ $0.64 221s | ✓ $0.68 205s |
| cart-coupons | ✓ $0.62 137s | ✓ $0.62 131s |
| project-tracker-api | ✗ $1.88 2695s (32/33, `CASE_TESTS_EXIST`) | ✓ $1.19 446s |
| order-inventory | ✓ $1.41 586s | ✓ $1.23 537s |
| order-inventory-lifecycle | ✓ $4.84 2432s | ✗ $4.10 1631s (7/27) |
| owner-only-delete | ✓ $0.44 102s | ✓ $0.46 95s |
| idempotent-refund | ✓ $0.57 190s | ✓ $0.59 212s |
| speed-up-search | ✓ $0.49 110s | ✓ $0.46 72s |
| regression-fix-with-fixes | ✓ $0.53 135s | ✓ $0.47 63s |
| library-cli-flag | ✓ $0.40 78s | ✓ $0.44 62s |
| platform-migration | ✓ $0.55 110s | ✓ $0.44 58s |
| webhook-integration | ✓ $0.52 170s | ✓ $0.64 221s |
| config-flag | ✓ $0.50 110s | ✓ $0.55 120s |
| dependency-upgrade | ✓ $0.52 125s | ✓ $0.44 74s |
| deprecate-option | ✓ $0.53 101s | ✓ $0.57 132s |
| infra-config | ✓ $0.42 51s | ✓ $0.50 92s |
| add-metrics | ✓ $0.44 55s | ✓ $0.37 55s |
| privacy-erasure | ✓ $0.47 72s | ✓ $0.46 78s |
| feature-experiment | ✓ $0.42 67s | ✓ $0.59 149s |
| client-version-gate | ✓ $0.49 100s | ✓ $0.50 108s |
| ml-eval-threshold | ✓ $0.45 65s | ✓ $0.49 85s |
| security-hotfix | ✓ $0.43 80s | ✓ $0.49 90s |
| visual-prototype-match | ✓ $0.50 81s | ✓ $0.53 146s |
| visual-prototype-drift | ✓ $0.51 103s | ✓ $0.59 134s |
| | v3.6.11 candidate | v3.7.0 candidate |
|---|---|---|
| Lanes passed | 30/31 | 30/31 |
| Measured cost, 31 lanes | US$21.49 | US$20.65 |

- **Delivery checks:** every passing lane reached `archived` and passed the hidden
  oracle, clean install, and the post-install project command.
- **`project-tracker-api`** passed 33/33 in 446 s. It failed `CASE_TESTS_EXIST`
  at v3.6.8, v3.6.9, and v3.6.11. With an unchanged runtime this is one
  observation, not a fix.
- **`order-inventory-lifecycle`** failed twice (US$4.10 and US$4.80; oracle 7/27
  both times). Change A landed; change B's `sandbox sync` kept listing the same
  conflicts that `sandbox sync --resolve` rejected as "not in conflict". Proof
  and Land of change A succeeded; the scorecard records `host-exit-1`. It passed
  once at v3.6.11 on Claude Code 2.1.319; the host version change is not ruled
  out as the trigger.
- **Cost against v3.6.11 on the 30 lanes both passed:** similar (n=1 each). No
  cost or speed claim is made.
- **Spend:** US$20.65 run + US$4.80 rerun = US$25.45 measured, within the US$60
  authorization, plus the unmeasured `visual` and configured-reviewer cost.

## Limits

n=1 per lane; repeated assurance is not claimed. The failing lane's cause is
unverified. Raw bundles are archived outside Git as
`~/changeloop-release-evidence/v3.7.0-candidate-88f28fe-2026-11-10.tar.gz`
(SHA-256 `cc8fe81fd2f79f8a96b0b616090d46eb97d51b09829b2090c4e1457303076a40`).
