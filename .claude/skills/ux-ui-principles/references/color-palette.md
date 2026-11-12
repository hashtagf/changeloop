# Building and checking a color palette

Use when a product has no palette, when changing brand color, or when adding a
theme (dark mode, alternate brand). Token structure is in [visual-system.md](visual-system.md); this
file covers color decisions and checks. Run
`scripts/contrast.py` for the numeric checks. Source IDs resolve in [sources.md](sources.md).

## Roles before hues

Define roles first, then pick values. Components use roles, never raw hex.

| Role | Purpose | Typical count |
|---|---|---|
| Background, surface, sunken | Page, panels, wells | 3 |
| Line, line-strong | Dividers, input borders | 2 |
| Text, text-muted, text-faint | Primary, secondary, disabled/meta | 3 |
| Accent, accent-soft, on-accent | Primary action, selection, focus links; tint; text on accent | 3 |
| Semantic: success, warning, error, info (+ soft) | Status only | 8 |
| Data palette | Charts (categorical, sequential, diverging) | separate set |
| Focus | Focus indicator if not the accent | 1 |

**Role names across files (this table owns them).** The same role has one name per layer;
do not invent a fourth.

| Role (prose here) | DESIGN.md token ([design memory](design-memory.md)) | CSS from `export_tokens.py` ([tokens to code](tokens-export.md)) |
|---|---|---|
| ground / background | `canvas` | `--color-paper` |
| line / border | `border` | `--color-rule` |
| text-muted | `muted` | `--color-muted` |
| surface | `surface` | `--color-surface` |
| ink / text | `on-surface` | `--color-ink` |
| accent | `primary` | `--color-accent` |
| on-accent | `on-primary` | `--color-accent-ink` |
| focus | `focus` | `--color-focus` |
| success · warning · error · info | `success` · `warning` · `error` · (info) | `--color-ok` · `--color-warn` · `--color-bad` · `--color-info` |

Code you write by hand (forms, prototypes) uses the CSS names of the project; in this
skill's examples `--error` / `--error-ink` stand for the error role.

Rules:
- **Semantic colors stay fixed across brand palettes** so status meaning never
  changes when the brand does.
- **One accent.** If two colors compete for "click here", neither works.
- **Neutrals carry a slight hue** toward the accent; pure grey looks unconsidered.
- **Accent is not a status.** Don't use the brand color to mean success.

## Colour posture — declare one before code

| Posture | Rule |
|---|---|
| Restrained (default) | Accent ≤ 5 % of any viewport |
| Committed | One colour on 30–60 % of the surface via a field/paper token; the accent stays a signal |
| Full palette | 3–4 named roles, each with a job |
| Drenched | The surface is the colour |

A declared surface colour is not accent footprint; undeclared sprawl is. Record the
posture in DESIGN.md.

## Choosing the accent

- Start from brand or domain meaning (finance: trust, calm; health: clean,
  reassuring; consumer: energetic), then test against semantic colors: a red
  brand next to error red, or a green brand next to success green, needs
  separation in lightness or a different status treatment.
- Check that accent used as text meets 4.5:1 (use the `--color-accent-text` role, see
  [tokens-export.md](tokens-export.md)) and accent fills, icons and UI components 3:1 against the ground; on-accent text on accent fills meets 4.5:1. [S03, S04]
- Prepare an accent-soft tint for selected rows and highlights that still keeps
  text at 4.5:1.

- **Budget.** About 60 % neutral ground, 30 % secondary tone, ≤10 % accent. Grey builds
  structure; colour carries meaning.
- **Palette against the subject.** A palette is proportions (ground, ink, accent, fields)
  as much as hues. If the hues fight the subject's material, swap once. If the subject
  has unmistakable colours of its own, keep the proportions, take the hues from the
  subject, and say so.

## Contrast requirements to check

| Pair | Minimum | Source |
|---|---|---|
| Body text on its background | 4.5:1 (AA); large text 3:1 | WCAG 1.4.3 [S03] |
| Muted/secondary text that must be read | 4.5:1 | WCAG 1.4.3 [S03] |
| Input borders, focus indicators, informative icons, chart elements | 3:1 against adjacent colors | WCAG 1.4.11 [S04] |
| Text on accent buttons | 4.5:1 | WCAG 1.4.3 [S03] |
| Disabled controls | Exempt, but should still look like controls | WCAG 1.4.3 exception [S03] |
| Placeholder text | Treated as text if it conveys information | — |

Contrast alone doesn't guarantee meaning: never use color as the only cue. [S67]

## Data ramps with text on top

For heatmaps, level badges and status cells where numbers sit on the color:
- Choose the text color first (one for the whole ramp), then build ramp steps
  that each pass 4.5:1 against it.
- Keep steps visibly different in lightness (e.g. 4–5 steps from very light to
  medium), and keep the darkest step for the most important level only.
- In dark themes, invert: dark ramp, one light text color, check every step.
- Check every pair with `scripts/contrast.py --css <page>`; ramp tokens named
  `--l1`/`--l1i` (fill/ink) or `--x`/`--on-x` are paired automatically.

## Making it look good, not only pass contrast

Contrast makes a palette legible; these make it attractive. Work in **OKLCH**
(perceptual lightness), then export hex.

1. **One hue family drives everything.** Pick the brand or subject hue H.
   Tint neutrals with it: ground L .97–.985 C .004–.012 H; borders L .88–.92
   same hue; ink L .18–.24 C .02–.04 H. Untinted greys next to a coloured
   accent are the main reason palettes look "cheap".
2. **One accent with real chroma.** Accent C .12–.20 at L .50–.62 (light) or
   L .70–.80 (dark). Lower chroma for premium/calm, higher for playful/bold.
3. **Harmony, by keyword** (rules live here; keyword to style mapping is in [design direction](design-direction.md) §8):
   - mono + accent (minimal, trustworthy, developer) — accent hue ≈ H or ±30°;
   - analogous (natural, premium) — accent within 30–60° of H;
   - complementary pop (playful, bold) — accent 150–210° from H, used on 1–3 elements.
   At most **2 saturated hues** in UI chrome; more colour belongs in imagery.
4. **Proportion 70 / 20 / 10:** ground + surfaces / ink + neutrals / accent.
   If the accent covers more than a tenth of the first screen, it stops leading.
5. **Warm or cool, not both.** Neutrals, shadows and imagery share one temperature.
6. **Dark is not inverted light.** Ground L .08–.18 tinted (never #000),
   surface +.04 L, accent lifted to L .70–.80 and slightly less chroma,
   text off-white L .93–.96.
7. **Check by render.** Put the palette on a real hero, a button pair, a card
   with a number and a status chip, light and dark; adjust lightness (not hue)
   until all four read well. Then `python3 scripts/contrast.py --css <page>`.

### Starter palettes (contrast-checked, light · dark)

Starting points for a new direction when the project has no brand colours. Order:
ground · surface · ink · ink-2 · border · accent · on-accent. Every pair
(ink/ground ≥ 7, ink-2 on ground and surface ≥ 4.5, on-accent/accent ≥ 4.5,
accent fill/ground ≥ 3, accent used as text or link on surface ≥ 4.5; in the
table the accent column is the fill role) passes in both themes when checked
with `contrast.py` (2026-11-04). Re-check any value you edit. Shift the hue toward the brand while
keeping the lightness values.

| Palette | Keyword / fits | Light | Dark |
|---|---|---|---|
| **trust** | น่าเชื่อถือ / trustworthy — fintech, B2B, health | `#F7F8FA` `#FFFFFF` `#14213D` `#4A5568` `#E2E6EC` `#0F766E` `#FFFFFF` | `#0E1420` `#161E2D` `#E8ECF2` `#A3AEBF` `#263247` `#2DD4BF` `#062925` |
| **premium** | หรู / premium — beauty, hospitality, consulting | `#F6F3EE` `#FFFDF9` `#1C1A17` `#5E5850` `#E4DED4` `#7A5C24` `#FFFFFF` | `#12110F` `#1C1A17` `#F2EDE4` `#B3AA9C` `#2E2A24` `#C9A45C` `#1C1A17` |
| **playful** | สนุก เป็นมิตร / playful — consumer, food, kids | `#FFF8F1` `#FFFFFF` `#2B1B17` `#6B5650` `#F1E2D6` `#D9363C` `#FFFFFF` | `#1A1210` `#241916` `#FFF1E8` `#C9B1A6` `#3A2924` `#FF7A7E` `#2B1B17` |
| **bold** | กล้า / bold — creative tools, indie, neo-brutal | `#FFFBEA` `#FFFFFF` `#111111` `#3D3D3D` `#111111` `#3B5BFF` `#FFFFFF` | `#111111` `#1E1E1E` `#FFFBEA` `#C8C4B0` `#FFFBEA` `#8FA2FF` `#111111` |
| **techy** | เทค AI / techy — AI and dev-adjacent SaaS | `#F5F6FB` `#FFFFFF` `#0F1024` `#4B4D6B` `#E1E3F0` `#5B3DF5` `#FFFFFF` | `#0A0B14` `#13152A` `#ECEDFB` `#9EA1C7` `#262947` `#8B7BFF` `#0A0B14` |
| **natural** | ธรรมชาติ / natural — wellness, agriculture, sustainability | `#F4F1EA` `#FBFAF6` `#1F2A1F` `#556052` `#DDD8CB` `#3F6B3A` `#FFFFFF` | `#121611` `#1B2019` `#EAEEE4` `#A9B3A2` `#2C3329` `#8DBA7E` `#121611` |
| **minimal** | มินิมอล / minimal — general SaaS, utilities | `#FAFAFA` `#FFFFFF` `#171717` `#525252` `#E5E5E5` `#2563EB` `#FFFFFF` | `#0B0B0C` `#161618` `#F5F5F5` `#A3A3A3` `#27272A` `#60A5FA` `#0B0B0C` |
| **developer** | นักพัฒนา / developer — dev tools, docs, consoles | `#F5F7F9` `#FFFFFF` `#1E2329` `#57606A` `#D3DAE1` `#1A7F37` `#FFFFFF` | `#0E1116` `#161B22` `#E6EDF3` `#949BA4` `#2A313A` `#3FB950` `#0E1116` |

Status colours (success/warning/error/info) stay separate from the accent
and follow §"Roles before hues".

## Dark theme

- Define it as a second set of the same roles, not an inversion.
- Use dark surfaces that are not pure black; raise elevation with lighter surfaces.
- Desaturate and lighten accents and semantic colors so they don't vibrate.
- Recheck every contrast pair; values that pass in light often fail in dark.
- Images, charts and illustrations need dark-aware variants.
- Default to the system setting (`prefers-color-scheme`). When both themes are
  shipped, also give a visible switch in the header or settings: three states
  (system, light, dark) or a two-state toggle that starts from the system value.
  It is a `<button>` whose accessible name says the result ("เปลี่ยนเป็นธีมมืด"),
  sets `data-theme` on the root, remembers the choice (storage wrapped in
  try/catch) and is applied before first paint to avoid a flash.
  Token blocks: base `:root`, `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`,
  and `:root[data-theme="dark"]`, so the switch wins in both directions.

**Deriving dark from light:** body weight drops one step (−50); accent chroma −0.02 to
−0.04 and L +5–10; drop shadows off, elevation by lightness or an inset hairline; never
`filter` raster images.

### Dark pages for light directions
- Derive, then check: `python3 scripts/export_tokens.py <id> --print-dark` (see [tokens to code](tokens-export.md)); every pair passes AA.
- Surfaces step up in lightness (ground < surface < raised); no pure black or pure white; shadows give way to tone steps and a hairline border.
- Accent moves lighter to keep contrast; art and photos are dimmed or re-graded, not left glaring.
- Offer a toggle and honor `prefers-color-scheme`; do not make dark the only theme for light-leaning brands.
- Check images with transparent backgrounds and logos on the dark ground.

## Procedure

1. List roles and write light values; write dark values for the same roles.
2. Run `python3 scripts/contrast.py --css page.html` to check the role pairs
   it finds in every theme block, or list custom pairs in a JSON file and run
   `python3 scripts/contrast.py pairs.json`; fix failures.
3. Render key screens in both themes (see [render-verification.md](render-verification.md))
   and look at: selection states, disabled, error fields, charts, focus rings.
4. Simulate color vision deficiency (browser devtools) for status and chart colors.
5. Record the palette and decisions in the design context.

## Comparing palette options

When stakeholders want to "try colors", offer 2–3 complete palettes that swap
only brand roles (accent, neutrals bias, navigation) and keep semantic colors
fixed. Show them on the same real screen, in both themes, and report the
contrast results for each. Choose by brand fit and legibility, not by a single
swatch.

## Do / Don't

| Do | Don't |
|---|---|
| Define roles, then values. | Pick ten hex codes and assign them ad hoc. |
| Keep semantic colors fixed across brand themes. | Let "success" turn purple in the purple theme. |
| Check every pair in both themes with a tool. | Eyeball contrast on a bright monitor. |
| Pair color with text or icons for meaning. | Use red/green alone to show pass/fail. |
