# Render verification — check the built page, not the intent

Most defects in generated UI appear only when the page is rendered: horizontal
overflow on phones, class-name collisions, stretched grid rows, overlapping
chart labels, wrong fonts for Thai, hidden elements that still show, failing
contrast in dark mode. Reading the code does not find them reliably. Run this
procedure whenever you build or change UI and tools allow it. Record results as
passed, failed or not tested.

## States reachable by URL

Every page this skill builds answers `?state=loading|empty|nomatch|error|denied|partial`
with mock data (and `?density=compact`, `?theme=dark` where they exist), so each state can
be rendered and screenshotted, not only declared. `state_check.py` finds the markers
statically; `scripts/admin_check.js --type <list|detail|form|dashboard> --states` (or `check.py <page> --admin <type>`) renders each URL, fails a state identical to the default page, and runs the rendered admin rules (numeric alignment, tabular figures, disabled-with-reason, sticky bars that cannot stick, one primary action, table above the fold). (S103)

## Tools in this skill

| Script | Checks | Run from the skill root |
|---|---|---|
| `scripts/render_check.js` | Renders at 1440/768/390 px (+320 px with `--zoom`) in light and dark; reports JS/console errors, failed requests, horizontal page overflow with the offending elements, images without alt, unnamed buttons/links, unlabeled fields, form controls with different heights, fields in one row not top-aligned, invalid fields styled like valid ones, spaces or over-wide glyphs before punctuation, text left at opacity 0 on the first screen, **images that failed to load** (lazy images are forced eager first), **text touching the viewport edge** (no gutter), phone tap targets, and a NOTE when an h1/h2 wraps to 3+ lines; `--reduced-motion` adds animations still moving and content never revealed; `--toggle "<selector>"` clicks a language or theme switch after the first pass and repeats every viewport (screenshots prefixed `alt-`); saves full-page screenshots; composition (FAIL: unequal outer margins, blank gap ≥ 0.6 viewport, no h1 on the first screen of a public page; NOTE: lopsided sections, hero void, scattered left edges, < 4 pictures at ≥1280, no focal point, body text < 16px / < 7:1 / > 88ch, mostly centred text, > 9 font sizes, side-scroll rows, difference-blend text, fonts not loaded, a page that barely moves or uses one animation everywhere, a dev-server target); screenshots go to `render-check/` next to a local page, for a URL to a new temp folder (path printed); `--out` overrides | `node scripts/render_check.js <url-or-file> [--out <dir>] [--zoom]`; while iterating `--fast` (1440 + 390, light, viewport shots) |
| `scripts/state_check.py` | Static scan of source for markers of loading, empty, error, disabled, focus, selected, submitting, success, hover (`--need` adds offline, permission; `--per-file` requires each data-fetching file to carry its own loading/error/empty markers, plus form busy state, no-match, refetch and retry; `--matrix` prints a surface × state table for the report); a miss means unverified, a hit does not prove the state works; an unknown state in `--need` is a usage error (exit 2) | `python3 scripts/state_check.py <src-dir-or-file> [more ...] [--json]` |
| `scripts/direction_preview.js` | Renders one-screen previews of the directions in `assets/directions/directions.json` in their compositions (`--sheet`, `--comp`, `--subject`, `--brief`) so a look can be chosen from pictures; not a verification of a built page | `node scripts/direction_preview.js [--ids a,b] [--group company] [--sheet]` |
| `scripts/backoffice_preview.js` | Renders previews of the back-office screens (pages plus component, advanced and page-states sheets) in every back-office look from `assets/backoffice/styles.json`, with `--mobile` (390 x 844 phone set), `--thai`, `--sheet`, `--style-sheets` and `--singles`, so density and tone can be chosen from pictures; not a verification of a built screen | `node scripts/backoffice_preview.js [--styles a,b] [--screens records,approval] [--sheet]` |
| `scripts/slop_check.py` | Template-look and slop heuristics in HTML + local CSS: eyebrow labels, accent-word headlines, gradient text, identical icon-card rows, >2 typefaces, >4 raw radii, raw hex count, filler copy, generic CTAs, inert forms, forms without validation or own error messages, format fields without example/hint, removed focus, motion without reduced-motion; flag vs note | `python3 scripts/slop_check.py page.html [--json]` |
| `scripts/design_md_check.py` | DESIGN.md against the Google design.md spec (alpha): front matter tokens, `{refs}`, value formats, canonical section order, duplicates, component contrast, plus our dials, status, dark values, don'ts, decision log; prose-only files are flagged legacy |
| `scripts/export_tokens.py` | Direction → `tokens.css`, Tailwind v4 theme, shadcn variables; derives dark, checks AA, prints notes where it bent a color (see [tokens to code](tokens-export.md)) |
| `scripts/design_md.py` | Interview answers + direction → DESIGN.md (draft, light and dark roles, reasons, decision log) and a marked pointer block in `AGENTS.md` / `CLAUDE.md`; passes `design_md_check.py` |
| `scripts/code_extract.py` | Existing codebase → stack, color/font/radius usage, Tailwind utilities, drift, and DESIGN.md role mapping (found / guessed / derived); feeds `design_md.py --from-code` |
| `scripts/direction_recipe.py` | Direction → build recipe (hard rules, banned, required components, motion, pre-flight) from directions.json ([recipes](direction-recipes.md)) |
| `scripts/tweaks_panel.py` | Adds a live panel (accent swatches, text size, density, mode, motion; persisted; `T` hides, `R` resets) to a page that uses CSS custom properties, for client reviews; remove before shipping |
| `scripts/review_report.py` | Review findings JSON → one HTML report with radar chart, banded scores, Keep / Fix / Quick wins ([review loop](review-loop.md)) |
| `scripts/contrast.py` | WCAG contrast ratio for color pairs with per-pair minimums; `--css` reads token blocks (light, dark, palettes) from a page and checks role pairs automatically | `python3 scripts/contrast.py --css page.html` (or a `.css` file) or `python3 scripts/contrast.py pairs.json`; follows local `@import` and `<link>` stylesheets and resolves `#hex`, `rgb()`, `hsl()`, `oklch()` and `var()`; understands `--color-ink`/`--color-paper` style names and `--X`/`--X-ink`/`--on-X` pairs; token blocks are `:root`, `html`, `body`, `.dark`/theme classes, `[data-theme]` and `@theme`; no token block or no checkable pair prints N/A and exits 0; `--json` |

**Evidence labels.** Close every verification report with each check as **Ran**
(command executed, artifact exists), **Skipped** (reason), **Planned** (not yet) or
**Manual** (eyes only; keyboard, screen reader, static marker scans). Never
write "passes" for a Manual or Skipped check.

**Setup budget — never stall on tooling.** Run `node scripts/render_check.js --doctor`
once. It finds a Playwright module (project, NODE_PATH, global, `PW_MODULE`)
and any installed Chromium/headless shell or system Chrome, whatever the
version. Exit 3 means none is available: record the render check as
**not tested**, run the static checks (`slop_check.py`, `contrast.py --css`)
and continue. Do not download browsers, install packages, or sleep/poll for
a download mid-task; give the user the one-time setup command instead. Use
`--timeout` rather than a shell `timeout` (absent on macOS). Fragments
(no doctype/html) are wrapped automatically. A missing local file or a bad option
prints one `error:` line and exits 2 before a browser starts; a refused or unreachable
URL prints `ERROR` and exits 1; a load that times out is checked as far as it rendered (WARN).
Exit codes and result words of every script follow the README "Script contract".
`--json` on `render_check.js`, `fold_check.js`, `admin_check.js`, `flow_check.js` and `script_check.js` prints one JSON
document on stdout (log lines go to stderr) with the same exit code: `script`, `target`, `result`, `exit`, `error` (usage
error, NOT RUN, could not load), `findings` (`level`, `rule`, `message`, `where`), `artifacts` (screenshots) and a per-script summary.

`check.py` takes each check's result from that script's exit code (0 PASS, 1 FAIL/FLAG,
2 ERROR, 3 NOT RUN) and itself exits 3 when nothing failed but a check did not run. Its
metadata line also FLAGs unfinished placeholders: `example.com`/`.org`/`.net` in canonical,
`og:url`, `og:image`, and `[…]` / `{{…}}` in title, description, `og:title`, `og:description`.

`render_check.js` needs Playwright. It loads the page once and switches widths
and color schemes in place; full-page screenshots are the slow part on long
pages — use `--viewport-shots` or `--fast` while iterating and the full run
(with `--zoom`) once before delivery. Load errors and failed requests are
reported once, at the first viewport. It is a smoke check: it does not prove
keyboard operability, screen-reader behavior, task success or WCAG conformance.
`slop_check.py` and `design_md_check.py` use the standard library only; their
hits are prompts to inspect, not verdicts on taste.

## Run order (mandatory)

Verification is the slowest part of a BUILD. A full `render_check.js` run
renders every width in both themes with full-page shots; re-running it after
each small fix multiplies the time without finding more. Follow this order;
deviating from it is a process defect, like skipping a check.

| Step | Run | Scope | Count |
|---|---|---|---|
| A. Baseline | `python3 scripts/check.py <page> --render` on every page/route (script, slop, contrast, states, public-page metadata, then `render_check --fast` and `fold_check.js`; without a browser the static checks still run and render says NOT RUN), look at the shots; public pages also once at 1920 (`render_check --widths 1920 --schemes light --viewport-shots`): gutters grow, measure and columns hold | All pages | Once |
| B. Batch fix | Collect **every** finding from A (render, screenshots, slop, contrast) into one list, then fix them all | — | No checks between fixes |
| C. Confirm | `--fast` only on pages the batch touched; journey script (`flow_check.js steps.json`, happy + failure path) once | Changed pages | Once per fix round |
| D. Final | `render_check.js --zoom` (full) + `--reduced-motion` if animated; journey script; contrast | Each page once | Once, before delivery |

- **Budget:** fix rounds (B→C) ≤ 3 ([gate tiers](gate-tiers.md) §4); the full run
  happens **once per page** in D. A page set of 3 needs about 3–6 fast runs and
  3 full runs, not a full run per fix.
- **One fix, one check is forbidden.** Do not re-run a check to confirm a single
  CSS line; fold it into the batch.
- **Judge heuristic hits once.** When a flag is a known false positive (e.g.
  field alignment across grid rows, text at the edge of a deliberate scroll
  region, in-table sticky cells), decide in round A, record why, and do not
  re-run to chase it.
- **Journey script:** write it once as `steps.json` for `scripts/flow_check.js`, run it in C and D only. Re-run between
  only if behavior (not styling) changed.
- **After D:** a further fix re-runs D only for the page it touched.
- **Report the count** in delivery: "fast runs N, full runs N, journey runs N".

**Final gate on the shipped build.** Run the last check on the production build
(`vite build && vite preview`, `next build && next start`, the built `index.html`), not the
dev server: minifiers and bundlers change what ships.

## Procedure

1. **Automated pass.** Run `render_check.js` following the run order above
   (`--fast` while iterating, `--zoom` full run once at the end). Fix every
   reported problem in one batch before visual review.
2. **Look at the screenshots** (at least widest and narrowest, both themes).
   Check, in order:
   - Overlap and clipping: labels over labels, text cut off, chart labels
     outside the plot, sticky bars covering content.
   - Unexpected visibility: elements meant to be hidden appear (often a
     `display` rule overriding the `hidden` attribute).
   - Stretching: grid/flex children stretched to sibling height, leaving large
     gaps inside cards or lists.
   - Name collisions: a generic class (`.done`, `.active`, `.row`) styled for one
     component leaking into another.
   - Fonts: Thai rendered in the intended face (not a monospace or fallback),
     tone marks not clipped, line height adequate.
   - Hierarchy: one focal point, consistent alignment, density as specified
     ([design-quality.md](design-quality.md)).
3. **Drive the critical journey** with a script or manually: the happy path
   plus at least one failure path from the page spec (validation error,
   server failure, permission denial). Assert the visible result, not only the
   absence of errors.
4. **Keyboard pass** on changed areas: Tab order follows reading order, focus is
   visible, dialogs trap and return focus, Escape closes overlays.
5. **Contrast**: run `contrast.py --css <page>` to check role pairs in every
   theme block; add a JSON pairs file for pairs the script can't infer.
6. **Content stress**: longest real Thai and English values, empty values,
   large numbers, many rows.
7. **Batch fix → re-run steps 1–2 with `--fast`** on changed pages only; the full
   run stays in the final step of the run order. Report what was not re-checked.

## Example: a flow check with Playwright

```js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  await p.goto('file:///path/to/page.html');
  await p.click('[data-act=reject]');                 // failure path: reject without a reason
  if (!(await p.isVisible('#noteErr'))) throw new Error('missing field error');
  await p.fill('#note', 'ชื่อบัญชีไม่ตรง');
  await p.click('[data-act=reject]');
  await p.click('[data-act=commit]');
  await p.waitForSelector('.toast:not([hidden])');
  console.log('reject path ok');
  await b.close();
})();
```

## Common defects and fixes

| Symptom | Usual cause | Fix |
|---|---|---|
| Text touches the screen edge at every width | A later shorthand (`.section{padding:96px 0}`) overrides the container's side padding | Use `padding-block` for vertical section spacing; keep the gutter on `.container` |
| Empty image slots in a full-page screenshot | `loading="lazy"` images never entered the viewport, or the URL failed | Load the first-screen pictures eagerly; confirm URLs resolve; `render_check.js` reports failures |
| Thai heading breaks mid-word | No spaces in Thai; the heading column is narrow | Wrap phrases in `display:inline-block` chunks ([visual system](visual-system.md) Part A) |
| English headline wraps to 3 lines on phones while Thai fits | Latin display faces are wider per character than the Thai text implies | Check both languages (`--toggle`); shorten the English line or lower its size at 390 px |
| Page scrolls sideways on phone | Grid track sized by content (`grid` without `minmax(0,1fr)`), long unbroken strings, fixed widths | `grid-template-columns: minmax(0,1fr)`; `min-width:0` on flex/grid children; `overflow-wrap:anywhere` for IDs; tables in their own `overflow-x:auto` |
| Hidden element still visible | Component sets `display:grid/flex`, overriding `[hidden]` | Global `[hidden]{display:none !important}` |
| Big gaps inside a list or card | `align-items: stretch` with grid rows | `align-content:start` / `align-self:start` |
| Styles appear in unrelated component | Generic class names reused | Scope classes by component (`.queue-row`, `.stepper-item`) |
| Chart labels overlap | Labels positioned without collision rules | Move one label, reduce ticks, add right padding inside the viewBox |
| Thai text in monospace | Mono font applied to a container with mixed text | Apply mono only to IDs/numbers spans |
| Dark mode text unreadable | Literal colors outside the token system | Use tokens only; check pairs in both themes |
| Focus ring invisible on accent buttons | Focus color equals button color | Offset outline or a contrasting focus token |
| White text on a light semantic color in dark mode | Badge text hard-coded to white while the dark theme lightens the badge | Give badges an `--on-<color>` token per theme |
| Cells or rows faded to show state become unreadable | Opacity used as a state | Use a text badge or header label instead ([design-quality.md](design-quality.md)) |
| Users say colors are hard to read | Too many encodings per element | Apply the signal budget; one text color per ramp |

## Reporting

| Check | Result | Evidence |
|---|---|---|
| render_check (8 viewports; ×2 with `--toggle` on bilingual pages) | passed / failed (n issues) | output + screenshot paths |
| Visual review | issues found and fixed | before/after screenshots |
| Critical journey + failure path | passed / failed | script name or steps |
| Keyboard | passed / not tested | notes |
| Contrast | n/m pairs pass | contrast.py output |
| Not tested | screen reader, real API, real users… | — |

## Do / Don't

| Do | Don't |
|---|---|
| Render and screenshot before saying a page is done. | Report "built" from code that was never rendered. |
| Test the narrowest width and dark theme. | Check only a desktop light screenshot. |
| Drive at least one failure path. | Count "no console errors" as a passing flow. |
| Re-run checks after fixes and say what wasn't re-checked. | Assume a fix worked because the edit applied. |
