---
name: change-impact-analysis
description: "Use before changing an API, schema, config, event, or shared behavior when consumers are unknown: who breaks, blast radius, is it safe to change. Skip isolated code with known consumers, sequencing (plan-writing), and choosing between options (brainstorming)."
---

# Change impact analysis

Find who depends on the behavior before you change it, and say how far each
safety fact was proven.

## Steps

1. State the expected behavior, the affected boundary, and the assumptions
   that would make the change safe.
2. Trace real consumers beyond symbol search: serialized bytes, configuration,
   storage, other processes, feature flags, downstream dependencies. Verify
   pinned dependency behavior from its source.
3. For each safety fact, cite the source and pick the cheapest executable check
   that could falsify it; run it only within permitted scope. Rank it with
   [references/proof-ladder.md](references/proof-ladder.md) and record observed,
   inferred, unproven, and cleared findings separately.
4. Map confirmed risks to consumer, failure, compatibility, migration/rollback,
   and evidence owner. Preserve public contracts unless the change names them.
5. Route findings that change what was agreed back to the owner of the
   agreement; keep in-contract findings with the repair; never hand-edit an
   approved agreement to match the implementation.

## Harness

Findings are analysis, not receipts. With OpenSpec/Change Loop: durable decisions go via Change intake/revision/amendment; follow harness workspace and resume routes.
Otherwise: record decisions and follow-ups in the design doc or issue; tests or CI are proof.
Analysis grants no Land, Git, or external-mutation authority.

## References

- `references/proof-ladder.md` — the five proof levels and how to report where proof stopped.
