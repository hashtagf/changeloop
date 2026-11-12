# Behavior held constant, one purpose per slice

A refactor changes structure while preserving observable outputs, validation,
errors, persisted state, contracts, and effects. State that equivalence claim
and the focused executable check before editing. Characterize uncovered behavior
first; a green unrelated suite is not a safety net.

Separate structural moves from intentional behavior changes so each has a
clear reason to fail and a reversible diff. If a move changes behavior, repair
the regression or route the new semantics through its own agreed change (with
Change Loop, Change revision/amendment).
Do not change assertions simply to accept accidental drift.

Example: extract invoice calculation helpers and retain totals/rounding/writes.
Changing rounding to half-up is a distinct behavior change with its own
requirement and regression test. Those are separate slices, not instructions
to create commits or PRs.

Apply a small move, run the narrowest valid check, then continue. Undo only your
failed move while preserving other work. Never reset the workspace as a shortcut.

No per-step commit, stage, branch, or merge is part of refactoring; Git
mutations need separate authority (`git-workflow`, if available, covers an
authorized Git operation). Within Change Loop all moves stay in returned Build
paths, the harness marks verified tasks and records proof, and Land applies an
uncommitted diff and archives after proof.

Read [characterization tests](characterization-tests.md) for baseline capture,
[catalog](catalog.md) for moves, and [large-scale](large-scale.md) for sequencing.
