---
name: skill-evaluation
description: "Use when testing whether a new or changed skill, description, or trigger actually performs better than its baseline on real model runs (A/B, with/without skill). Skip static catalog checks (skill-suite-auditor) and authoring (skill-creator)."
---

# Skill evaluation

Compare actual transcripts and artifacts; candidate self-reports and reviewer
vote counts are not proof.

## Steps

1. Name the changed behavior, baseline (old version or no skill), task inputs,
   success criteria, and host capabilities. Pin both variants before running.
2. Author positive, negative, and ambiguous prompts (Thai too when supported);
   keep expected routes and grading out of candidate inputs.
3. Run matched variants with the same inputs and settings in isolated outputs,
   within host policy, concurrency, permissions, and budget. Never mutate a
   live user's data or infer authority from a fixture prompt.
4. Grade actions, transcripts, and artifacts: false triggers, missed triggers,
   scope escapes, evidence gaps.
5. Report per-case outcomes, repetitions, measured usage and time, uncertainty,
   regressions, and a promotion recommendation. Missing runs or costs stay unknown.

## Harness

Static checks are not model evaluations. Keep results outside shipped files.
With Change Loop, shipped edits follow it; only its providers can establish proof. Otherwise, CI and review gate them.

## References

- `references/procedure.md` — design, execution, and promotion safeguards.
- `references/evaluation-cases.json` — catalog example cases.
- Optional, if available: `skill-creator` to author accepted changes.
