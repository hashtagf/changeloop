# Brownfield onboarding: existing product, no agreed design language

Use when the product already ships UI and work starts on it (ONBOARD mode, or the
first IMPROVE/REFINE in a repo with no DESIGN.md). The goal is to write down what
ships today, agree it, then change it in scoped steps. Never start a brownfield
project with a new direction: the code is rank 4 evidence
([design memory](design-memory.md) §2) and users already know it.

## Steps

| # | Step | Command / source | Output | Ask? |
|---|---|---|---|---|
| 1 | Inspect | [design memory](design-memory.md) §1; `python3 scripts/code_extract.py SRC` | One line per source found; stack; token sources | No |
| 2 | Page inventory | Routes/router files, nav config, sitemap | Table: page, role, job, pattern ([page anatomy](../assets/layouts/index.md)), tier | No |
| 3 | Extract DESIGN.md | `python3 scripts/design_md.py --from-code SRC [--interview iv.json] --out . --wire` | DESIGN.md, Status: draft, evidence per role, Drift section | No (draft only) |
| 4 | Baseline audit | AUDIT mode on the 3-5 most used pages: `render_check.js --fast`, `contrast.py --css`, `slop_check.py`, [review loop](review-loop.md) | Scored findings per page, before-screenshots kept | No |
| 5 | Agree | Show: guessed/derived rows, Drift list, top audit findings | Approved DESIGN.md (Status: approved) or corrections | **Yes**: values, merges and scope are the team's call |
| 6 | Plan changes | [Gate tiers](gate-tiers.md) §5: name polish / restyle / redesign per area | Ordered change list, smallest blast radius first | Yes if restyle or redesign |
| 7 | Change in scope | IMPROVE / REFINE per item; copy files first | Scoped diff, before/after per screen | No |
| 8 | Verify and record | [Render verification](render-verification.md) run order; Decision log entry in DESIGN.md | Pass/fail per check; DESIGN.md updated | No |

Monorepo: run steps 1 and 3 once per app (`SRC=apps/web`). The extractor reports
"variables defined with different values in different files" when the scan mixed apps.

## Reading the extract

- **found**: a named CSS variable mapped to the role. Trust it, still look at it.
- **guessed**: picked from color frequency (no variable names). Confirm each one.
- **derived**: filled in so the file is complete (status colors, focus, primary-text).
  It is not in the code; treat it as a proposal. On-surface is never guessed from a grey that
  fails 4.5:1 on canvas: the darkest passing neutral, or a derived default with the reason.
- **No radius in code**: the base radius is written as a placeholder; set it from the baseline audit.
- **React Native / Expo** (`react-native` or `expo` in package.json, or `StyleSheet.create`) is detected as the
  stack; numeric `borderRadius` / `fontSize` and theme-object colours are read.
- **Thai project** (`lang="th"` or mostly Thai text): the draft proposes body line-height 1.6 (rule: 1.55–1.7).
- **Drift**: near-duplicate colors, too many radii/fonts/sizes, hard-coded colors in
  components, Tailwind arbitrary values, conflicting variables. Each line is a
  candidate cleanup, not a mandate; merging values changes shipped screens, so it goes
  through step 5.

The extract does not cover layout, elevation, components or dials. Fill them from the
baseline audit (step 4); dials come from an interview only if a restyle is planned.

## Rules

- Draft until approved. An extracted DESIGN.md never binds until step 5.
- Keep what works. A finding that only says "looks dated" is not a reason to restyle;
  name the user or business cost ([design quality](design-quality.md)).
- One token source. After approval, move hard-coded literals to tokens as they are
  touched (boy-scout rule), not in one big sweep, unless the team asks for a sweep.
- New components extend the existing system ([components usage](components-usage.md));
  never add a parallel button, input or table.
- Redesign order: type → colour → frame (margins, rhythm, titles) → states → stock
  components. Report before/after measurements side by side.
