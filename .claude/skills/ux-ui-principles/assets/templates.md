# Output templates

Write in the user's language. These are contracts for useful information, not a
requirement to produce long documents for small tasks.

## Which template, when

| Mode (SKILL.md §2) | Final deliverable | Use |
|---|---|---|
| ANSWER, REFINE | Answer or the one change, in chat | No template |
| RESEARCH | Source-backed synthesis | [Research synthesis](#research-synthesis) |
| DISCOVER | Problem, evidence, metric | [product discovery](../references/product-discovery.md) "Discovery outputs"; add [Validation plan](#validation-plan) when a study is proposed |
| ARCHITECT | Journeys, IA, page inventory | [Design decision](#design-decision) for each structural choice the user must approve |
| DESIGN | Page spec, states | [Design decision](#design-decision) + [Validation plan](#validation-plan) |
| BUILD, IMPROVE | Working UI | [Design decision](#design-decision) for the "decisions to confirm" only; verification → [render verification](../references/render-verification.md) "Reporting" |
| AUDIT, ONBOARD baseline | Ranked findings | [Audit finding](#audit-finding) |

**Depth by rigor tier** ([framework](../references/framework.md)):
- **Light:** Design decision → Decision, Rationale, Acceptance only. Audit → ID,
  Observation, Severity, Proposed fix.
- **Standard:** every field of the template.
- **Critical:** every field, plus a Validation plan, plus the Tradeoff and States
  fields filled even when they seem obvious.

## Other formats in this skill (don't duplicate them)

| Format | Where | Use for |
|---|---|---|
| Critique line | [review loop](../references/review-loop.md) §2 | Each finding *during* critique and fix rounds (phase 6–8) |
| Round report | [review loop](../references/review-loop.md) §8b | The per-round summary while scoring a page |
| Scored HTML review | `scripts/review_report.py` ([review loop](../references/review-loop.md) "Report format") | When the user wants a shareable scored review |
| Study report | [research methods](../references/research-methods.md) "Reporting template" | Results of a study with real users (interviews, usability tests) |
| Post-launch review | [measurement](../references/measurement.md) "Report template" | Metric review after release |
| Verification table | [render verification](../references/render-verification.md) "Reporting" | What was rendered and checked, tested vs not |
| Accessibility report | [accessibility](../references/accessibility.md) "Report accurately" | Claims of WCAG conformance |

Critique lines and Audit findings carry the same facts: use critique lines while
working; when the deliverable *is* the audit, convert them into the Audit finding
table (blocker → Critical/High, major → Medium, minor/note → Low).

## Design decision

**Use when:** a choice the user should approve or a reviewer should be able to
challenge, in DESIGN, ARCHITECT, BUILD or IMPROVE. **Skip when:** the choice follows
directly from DESIGN.md or an existing pattern; just apply it.

**Task and context:** User, goal, entry condition, device and constraints.
**Evidence/assumptions:** Supplied artifact or observation; unresolved assumptions.
**Decision:** Concrete label, control, sequence, layout or behavior.
**Rationale:** Principle + source ID/link and why it applies here.
**Tradeoff:** What becomes harder or less efficient; mitigation.
**Do / Don't (when relevant):** Paired intended usage and likely misuse, consequence,
context/exception and observable check; see `references/do-and-dont.md` from the skill root.
**States:** Applicable state matrix including failure and recovery.
**Acceptance:** Observable condition and test procedure.
**Validation status:** Tested result or proposed research, clearly separated.

## Audit finding

**Use when:** the deliverable is an evaluation of existing UI (AUDIT, the baseline
audit in ONBOARD) and nothing is changed. **Skip when:** you are fixing as you go;
use review-loop critique lines instead.

| ID | Artifact/location/state | Observation | User consequence | Principle/source | Severity | Confidence | Proposed fix | Verification |
|---|---|---|---|---|---|---|---|---|

Severity uses the scale in [validation](../references/validation.md) "Prioritize
findings". Follow the table with prioritized actions and material unknowns. Add
frequency evidence and effort when known; do not fabricate numeric ratings or
impact lifts.

## Research synthesis

**Use when:** RESEARCH mode: answering from published sources (standards, NN/g,
platform guidelines, papers). **Skip when:** the evidence comes from your own
study with users; use the study report in research methods.

- Question and scope.
- Source register with authority, version/date, access date and limitations.
- Principle → application → caveat → example → verification.
- Standards separated from heuristics and project recommendations.
- Open questions and plan for updating unstable facts.

## Validation plan

**Use when:** proposing how to test a design or decision before or after launch
(DESIGN, DISCOVER, any Critical-tier work). **Skip when:** the check is a render or
automated check; that belongs in the verification table.

**Decision to inform:** …
**Participants/context:** …
**Method and rationale:** …
**Neutral task prompts:** …
**Success/failure definitions:** …
**Measures and guardrails:** …
**Sample rationale and limitations:** …
**Procedure/accessibility/privacy:** …
**Analysis and next decision:** …
