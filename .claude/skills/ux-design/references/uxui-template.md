# uxui.md template

The first lines name the work type so the checker picks the section set:

```markdown
# uxui.md — <product>
Work type: back-office | landing | both
Design System: v1.0
```

Headings are `## <n>. <Title>` in this order. With `both`, write the back-office
set and add the landing items 3–5 under `## Landing` after section 8.

## Back office / web app

| # | Section | Must hold |
|---|---|---|
| 1 | Design Objective | Business goal, user goal, success metrics with numbers |
| 2 | User Persona | 2–3 personas: goal, pain point, behaviour, context, device; every item `[Data]` or `[Assumption]` |
| 3 | Information Architecture | Sitemap and menu as a tree or Mermaid |
| 4 | Permission Matrix | Role × feature × view / create / edit / delete / approve |
| 5 | User Journey | Per persona: stage, action, thought, emotion, pain point, opportunity; labelled |
| 6 | User Flow | Mermaid per main task with edge cases and the error path |
| 7 | Screen Inventory | Table: screen, feature, purpose, main components, states (empty / loading / error / success / no permission), breakpoints, status (not started / in progress / done) |
| 8 | Content & Microcopy Guideline | Tone of voice, glossary, button verbs, error, empty state, toast, confirmation dialog |
| 9 | Design Rules | Empty until Phase 2 is confirmed |
| 10 | Artifact Index | File, kind, feature or pages, design system version, status |
| 11 | Changelog | Version, date, token or component change, artifacts to update |
| 12 | Open Questions | Question, what it affects, who answers |

## Landing / marketing

| # | Section | Must hold |
|---|---|---|
| 1 | Design Objective | Goal and the conversion target |
| 2 | Persona | One persona, labelled |
| 3 | Section Structure | Sections in order, per page when there are several |
| 4 | CTA Strategy | Primary and secondary CTA, position, text |
| 5 | SEO Meta | Title, description, OG tags per page |
| 6 | Content & Microcopy Guideline | As above |
| 7 | Design Rules | Empty until Phase 2 is confirmed |
| 8 | Artifact Index | As above |
| 9 | Changelog | As above |
| 10 | Open Questions | As above |

Screen Inventory status values are exactly `not started`, `in progress`, or
`done` (Thai: `ยังไม่เริ่ม`, `กำลังทำ`, `เสร็จ`); the checker reads them.
