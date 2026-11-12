---
name: plan-writing
description: "Use when an agreed change needs a design or task breakdown — ordering, dependencies, compatibility, migration, rollback, parallel slices — before coding. Skip open choices (brainstorming), impact discovery (change-impact-analysis), and obvious small work."
---

# Plan writing

Prepare design and task inputs for the agreement; never a second plan or schedule.

## Steps

1. Read the current agreement and verified source anchors. Reuse settled
   choices; compare alternatives only where real uncertainty remains.
2. Design input: load-bearing decisions only: constraints, boundary ownership,
   compatibility, persisted-data consequences, rollout/recovery, and risks with
   evidence owners. Do not restate requirements.
3. Task input: coherent outcomes with allowed paths, focused checks, and
   dependency order, grouped by provable behavioral slice. Mark parallel
   eligibility only when changed files, symbols, and checks are independent.
4. Check that every scenario has an implementation owner and an evidence claim.
   Add only necessary repository, path, provider, or resource constraints.
5. Change the agreement through its owner, not by editing the plan. With
   Change Loop: Before Build use Change intake/revision; after it starts use amendment for
   agreement changes. In-contract findings need repair, not a new plan.

## Harness

With OpenSpec/Change Loop: never hand-edit compiled design, tasks, claim IDs, or checkboxes; the compiler owns links and the harness marks
verified tasks. Otherwise: write the design doc and task list in the issue or tracker; tests or CI prove each slice.
No second ledger or status document; planning grants no Git or Land authority.

## References

None.
