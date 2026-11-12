# Shared design context — template

One project file that every design and implementation agent reads before
deciding, so design, implementation and review work do not make
conflicting choices. Suggested location: `docs/design-context.md` in the
product repository (or the path the project already uses). Keep it short and
current; link to detailed documents instead of copying them.

Create or update it only when the user asks for project documentation or the
host workflow owns such a file. Otherwise state the assumed context in the
answer. Look and rationale (personality, dials, anti-patterns) belong in
`DESIGN.md` — see [design memory](../references/design-memory.md); keep one
source per fact.

## Design context card — per task

Put this at the top of every DESIGN or ARCHITECT answer, filled from evidence
or marked *assumed*:

| Field | Example (assumed) |
|---|---|
| Product type | Payment back office |
| Target role | Finance operator |
| Primary job | Review and approve payouts |
| Main action | Approve / reject |
| Risk → rigor tier | High → Critical |
| Data volume / density | High · density 8/10 |
| Main device · language · entry context | Desktop · Thai + English · from the payout alert email |
| Page pattern · composition | Data table + master–detail · sidebar workspace |
| Style · dials | Minimal, calm, precise · variance 2 · motion 2 |
| Direction · rules it overrides · stated exceptions (no motion, all-square) | Back-office look "Calm" · none · none |
| Success metric · guardrail | Review time · error / reversal rate |
| Idea sentence · signature element (public pages) | One ledger is the page's main visual device · ruled rows as dividers |
| Waivers (Reflex rule class, one-line reason each) | None — see [gate tiers](../references/gate-tiers.md) §1 |

## Project file template

```markdown
# Design context: <product>
Last updated: <date> · Owner: <name/role>

## Product
- Purpose (one sentence):
- Primary outcomes and metrics (+ guardrails):
- Non-goals:
- Platforms: web (browsers) / iOS / Android; supported widths:
- Locales and calendar: e.g. th-TH (Buddhist Era in UI), en-US; time zone rules:
- Accessibility target: e.g. WCAG 2.2 AA
- Regulatory / security constraints:

## Roles
| Role | Goals | Frequency | Device | Key permissions | Cost of error |
|---|---|---|---|---|---|

## Information architecture
- Domain objects and relationships:
- Navigation sections (and which roles see them):
- URL conventions:
- Canonical page per object:

## Vocabulary
| Term | Meaning | Avoid |
|---|---|---|
Status names:
| Status | Meaning | Semantic color | Used on |
|---|---|---|---|
Voice: register, politeness, Thai/English term policy.

## Design system
- Token source (file/package/Figma library):
- Color roles; type roles; spacing scale; radius; elevation:
- Density modes and where each is used:
- Component library and version:
- Approved deviations (with reason):

## Patterns decided
| Situation | Pattern chosen | Reason | Date |
|---|---|---|---|
e.g. Settings save behavior; destructive confirmation; table bulk selection scope;
empty-state wording; session timeout warning; notification deep links.

## Quality bars
- Rigor tier rules (which pages are Critical):
- Performance budgets:
- Required checks before release (design QA list):
- Analytics event naming convention and excluded data:

## Open questions and assumptions
| Item | Risk | How/when to resolve |
|---|---|---|
```
