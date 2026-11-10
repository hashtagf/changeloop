# Sandbox sync and `--resolve` disagree on a stacked change after the first change lands

| Field | Value |
|---|---|
| Id | 2026-11-10-stacked-sync-resolve-disagrees |
| Detected | 2026-11-10, by release scenario (`order-inventory-lifecycle`, v3.7.0 candidate checkpoint) |
| Affected versions | v3.6.11 runtime and candidate `88f28fe6` (runtime identical except the update-advisory URL); passed once at v3.6.11 on Claude Code 2.1.319, failed twice on 2.1.322 |
| Severity | major |
| Status | scheduled |
| Decision | Maintainer published v3.7.0 as an explicit exception because the runtime equals v3.6.11 and the release adds no new risk; fix in the next release |
| Fix change | none yet |
| Regression | none yet; the lane `order-inventory-lifecycle` reproduces it |

## Symptom

After change A lands, change B's `sandbox sync` lists `backend/server.mjs`
(and `sdk/client.mjs`, `sdk/client.test.mjs`, `web/state.mjs`,
`web/state.test.mjs`) as conflicts. `claude-foundation sandbox sync <change>
--resolve server.mjs` answers "not in conflict; drop it and sync again", and
the next plain `sync` lists the same conflicts. The agent retried 11 times
and stopped. Delivery stayed blocked; the hidden oracle scored 7/27.

## Evidence

Lab runs `order-inventory-lifecycle-1794301288700` and
`order-inventory-lifecycle-1794315632745` (raw bundles outside Git, see the
[checkpoint report](../../docs/reports/scenario-checkpoint-candidate-88f28fe-2026-11-10.md)).
Both host transcripts show the same loop. The sandbox files contain the landed
content plus the change's additions and no conflict markers.

## Cause

Unknown. Unverified hypothesis from the transcripts: the conflict list is
recomputed on each `sync`, while `--resolve` validates against a different
stored list. The Claude Code version change (2.1.319 → 2.1.322) is not ruled
out as a trigger.

## Resolution

Open.
