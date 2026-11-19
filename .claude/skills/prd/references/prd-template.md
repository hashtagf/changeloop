# PRD template

The checker (`scripts/prd-check.mjs`) reads these headings by number, so keep
the numbers and order; titles may be translated. Write in the user's language;
keep IDs, Given/When/Then, and Mermaid in English.

## Contents

- §0 Brief questions
- §1–§18 Sections
- Labels and IDs
- Review

## §0 Brief questions

Ask only what no source answers, all at once:

1. What is sold or offered, to whom, and the business goal (with a number)?
2. Where it lives and on what platform (existing site, new site, existing
   commerce or account system)?
3. Payment, sign-in, and guest rules; markets and languages; launch date and
   peak load.
4. Real data available (analytics, research, feedback) and the decision owner
   for money, personal data, and scope.

A prototype or reference URL is evidence: open it, record what it shows as
`[Data]`, and never copy its business rules as decided.

## §1–§18 Sections

| # | Section | Must hold |
|---|---|---|
| 1 | Goal | The end state in one paragraph; success metrics with targets and one guardrail metric |
| 2 | Problem and goal (Why) | Why now, business goal, user goal |
| 3 | Pain / Problem | Table: pain, who, evidence label |
| 4 | Solution and Output, Definition of Done | The solution, the deliverables, and a DoD checklist (`- [ ]`) that names tests, NFR, and sign-off |
| 5 | User Stories | Table: `US-nn`, as a, I want, so that, priority (Must/Should/Could); personas labelled |
| 6 | Acceptance Criteria | `AC-nn (US-nn)` blocks in Given/When/Then; cover the failure and boundary cases, money and stock first |
| 7 | Glossary | Table: term, meaning, terms not to mix |
| 8 | Business Rules | Table: `BR-nn`, rule, label |
| 9 | Flow Diagram | Mermaid flowchart of the main path with its error path; a state diagram for any entity with a lifecycle |
| 10 | PRD / Functional Specification | Table: `F-nn`, feature, detail, stories |
| 11 | Non-functional Requirements | Table: category, requirement with a number, how it is measured (performance, load, availability, accessibility WCAG 2.2 AA, security, privacy, localization, SEO, observability, browsers) |
| 12 | Decision Rule / ADR and review rounds | Which decisions need an ADR and who approves; ADR table (`ADR-nn`, options, proposal, status, approver); review rounds with participants and exit |
| 13 | Scope / Out of scope | In scope by feature ID; out of scope with the reason or the question that could change it |
| 14 | Dependencies and constraints | Table: type, item, impact |
| 15 | Data and Permission Requirements | Entity table (fields, personal data, retention) and a role × action permission matrix |
| 16 | Feature mapping | Table: feature → stories → criteria → rules → screens → flow |
| 17 | Error Handling | Table: situation, what the user sees, what the system does |
| 18 | Open Questions | Table: `Q-nn` or `Qn`, question, what it affects, who must answer |

End with a Changelog table (version, date, change).

## Labels and IDs

- `[Data]` — observed; name the source (page, file, dataset, date).
- `[Assumption]` — the writer's guess; every target, rule, and persona detail
  without a source carries it.
- `[Decision]` — approved in a review round; name the round or approver.
- Every `US` has at least one `AC`; every `F` names its stories; every `ADR`
  has a status. The checker enforces these links.

## Review

A PRD version is a draft until its review round closes its open questions.
Approval of a PRD approves intake choices only: a change compiled from it
still needs its own spec approval in Change Loop.
