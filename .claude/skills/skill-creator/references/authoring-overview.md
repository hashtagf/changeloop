# Skill authoring workflow

Use this only for explicitly requested or approved skill work. Reuse settled
intent from the conversation. A description selects work; it grants no authority.

With Change Loop: read the compiled packet, edit only the returned Build
paths, and resume its action; the harness owns task completion, dispatch,
evidence, recovery, and Land. Otherwise: edit the skill files directly, record
decisions in the issue or PR, and use CI or review output as proof. Evaluation
artifacts are experiment data, never a second implementation ledger or proof.

## Phases

1. Capture the intended task, positive/negative triggers, examples, output,
   required tools, and boundaries. Resolve facts before asking material choices.
2. Draft concise metadata and an operational body. Link selectively loaded
   resources and canonical contracts; remove contradictory instructions from
   every reachable reference, not just the entry point.
3. Run catalog/reference checks. For observed comparisons use
   [skill-evaluation](../../skill-evaluation/SKILL.md) if installed; either
   way keep a real runner, pinned baseline, isolated outputs, budget, and
   independent grading, and leave unmeasured values unknown.
4. Improve from actual transcripts, artifacts, and user feedback. Keep a pinned
   baseline and separate static results from model observations.
5. With Change Loop, resume the active harness action. Land, Git, publication, paid execution,
   and external messages retain their distinct authority.

## Resources

- [Creating skills](creating-skills.md): metadata, anatomy, prompts.
- [Testing and evaluation](testing-and-evaluation.md): optional formats/viewer.
- [Improving skills](improving-skills.md): interpretation and iteration.
- [Description optimization](description-optimization.md): routing experiments.
- [Environment specifics](environment-specifics.md): capability checks/packaging.
- [Schemas](schemas.md): existing artifact formats.

Bundled grader/comparator/analyzer prompts are optional rubrics. Their names
do not create workers or independent sessions. Use them only through available,
authorized host execution. Unavailable independent grading stays unavailable.
Structural validation does not prove model behavior.
