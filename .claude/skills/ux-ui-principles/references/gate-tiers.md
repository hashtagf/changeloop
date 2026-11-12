# Gate tiers, reviews and change scope

How strict each rule is (rule classes), who reviews and how much verification
to spend. This file owns the rule classes (Floor, Reflex, Finish); the device list itself is owned by
[design quality](design-quality.md) §2; "tier" elsewhere means the rigor tier (Light / Standard / Critical,
[framework](framework.md)).

## 1. Three rule classes for every rule

| Rule class | Meaning | Waivable? |
|---|---|---|
| **Floor** | Defect in every context (invented proof, no focus style, horizontal overflow, text unreadable, no reduced-motion branch) | Never |
| **Reflex** | A default a model falls into (eyebrow above a heading, three icon cards, hero-metric template, 01/02/03 numbering, gradient text) | Yes, on the record: one line naming the page-specific reason (≥ 24 characters, shares a word with this page's content) |
| **Finish** | Craft detail (concentric radius, tabular numerals, balanced wrapping) | Answered, never blocking |

Keep a waiver list in the design context card ("Waivers" row in [design context](../assets/design-context.md)). Three waivers of the same
Reflex across builds means it is a house style: move it into DESIGN.md
instead of waiving it again. A pinned brief overrides habits and Reflex rules,
but never the Floor.

## 2. Pre-emit critique

Before writing code, score the plan 1–5 (plan-only check; the final score is the [review loop](review-loop.md) rubric) on Philosophy (one idea), Hierarchy,
Execution, Specificity (could only be this product), Restraint, Variety.
Anything under 3 is revised before building, and the weakest axis plus the
planned fix goes in the hand-off.

## 3. Fresh-context reviews

The builder is its own weakest reviewer. When subagents exist, run two reviews
with no build transcript:

1. **Hero review**, once, before any section below the fold exists. It sees only
   screenshots, the idea sentence and the signature element.
2. **Finish review** at the end, on the full render.

Each opens with one word: `ship`, `fix`, `rebuild` or `recapture`, then 5–8
ranked findings. Without subagents, re-read the render after a break from the
code and say the review was self-run.

## 4. Verification budget

Inside each fix round: one batched inspection → one fix batch → one confirming
check. The number of rounds is capped at ≤ 3 by [design workflow](design-workflow.md)
Phase 8 (the single fix-round budget). Each review adds one fix batch and its
recapture to a round. Never report a pass for a check or rule class that did not run.
Which run goes where (fast vs full, journey script, counts):
[render verification](render-verification.md) "Run order" — mandatory.

## 5. Refine preserves, redesign replaces

Fix the depth before touching anything: **polish** (keep world, content,
behavior), **restyle** (keep layout, replace type/colour/components) or
**redesign** (keep product truth, content, wiring and brand commitments;
replace the look). Hand over every changed line as before/after. A polish pass
that finds the concept wrong says so and recommends a redesign; it never
smuggles one in.

## 6. Brief wins, plus a quiet exit

A pinned brief, aesthetic or brand beats these rules except the Floor. Every
direction round offers one quiet, category-standard option played straight;
the user chooses it, you do not recommend it.

Questioning cadence before code (≤ 3 questions per batch; the new-look interview runs in rounds A/B/C) lives in
[design workflow](design-workflow.md) "Asking well".
