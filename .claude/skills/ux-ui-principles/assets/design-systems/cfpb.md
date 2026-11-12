# CFPB Design System — OpenDesign Application Guide

Implement CFPB’s editorial grid, current typography and native Expandables with a working reading worksheet, verified package APIs, and explicit identity boundaries.

Independent implementation reference. Native package components do not establish CFPB affiliation. Original educational content, no financial advice or submission; inspect TERMS.md before reuse.

## Source Reference

- **Package:** @cfpb/cfpb-design-system 5.10.2 ([source](https://www.npmjs.com/package/@cfpb/cfpb-design-system))
- **Current brand font:** Source Sans 3 since July 2025 ([source](https://cfpb.github.io/design-system/foundation/fonts))
- **Grid:** 12 columns, 30px gutters, 1230px maximum ([source](https://cfpb.github.io/design-system/foundation/grid))
- **Mobile type boundary:** 600px and below ([source](https://cfpb.github.io/design-system/foundation/headings))
- **Expandable API:** expand, collapse, isExpanded in the versioned module ([source](https://cdn.jsdelivr.net/npm/@cfpb/cfpb-design-system@5.10.2/dist/index.js))
- **Public reuse:** Public-domain code with separate identity and third-party conditions ([source](https://github.com/cfpb/design-system/blob/main/TERMS.md))


## Design Reference

CFPB package 5.10.2 compiled CSS and ES module; current public foundation guidance. The demo uses native Expandable classes and JavaScript. Global base CSS is copied verbatim from the published module’s base-style string, with a system-font fallback. Font-size-adjust and heading leading below follow the versioned code where the documentation table differs. No CFPB logo or affiliation is implied.

### Colors and actual custom properties

[Official reference](https://cfpb.github.io/design-system/foundation/color)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --black | #101820 | Default text; use green as a brand accent, not default body text. |
| --green | #20aa3f | Slug-header accent and institutional palette reference. |
| --pacific | #0072ce | Link and interactive cue family. |
| --gray-5 / --gray-40 | #f7f8f9 / #b4b5b6 | Expandable background and border in 5.10.2. |
| --red / --gold | #d14124 / #ff9e1b | Supporting palette; do not replace textual status with color alone. |

### Type from the versioned base styles

[Official reference](https://cdn.jsdelivr.net/npm/@cfpb/cfpb-design-system@5.10.2/dist/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Current brand font | Source Sans 3 | Replaced Avenir Next in July 2025; demo uses the package system-ui fallback. |
| Body | 16px / 1.375 | 22px line box at the default browser root size. |
| H1 | 34px / 1.25; weight 600 | 26px at <=600px; code line height is 42.5px on desktop. |
| H2 | 26px / 1.25; weight 600 | 22px at <=600px. |
| H3 / H4 | 22px weight 400 / 18px weight 500 | 18px / 16px on small screens; both use 1.25 leading. |
| H5 | 14px / 1.25; weight 600 | Uppercase, 1px letter spacing. |
| Normalization | base .517; step .0054 | Versioned custom properties add progressively larger adjustments for headings; this differs from the simplified foundation table. |

### Grid, rhythm and responsive ranges

[Official reference](https://cfpb.github.io/design-system/foundation/grid)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Grid | 12 columns; 30px gutters | Documentation layout model; the demo composes an 8/4 editorial split. |
| Maximum width | 1230px | Use responsive outer margins rather than fixed-width content. |
| Edge spacing | 15px mobile; 30px tablet/desktop | Retain readable space on narrow screens. |
| Breakpoints | 0–600, 601–900, 901–1020, 1021–1200, 1201+ | Verified exported varsBreakpoints in the 5.10.2 module. |
| Text rhythm | 15px paragraph gap; 30px stacked headings | Editorial spacing, not a claim of a universal 4px token scale. |
| Measure | 66 characters ideal; 45–90 range | Font guidance for continuous reading; preview uses a 66ch maximum. |

### Expandable anatomy and runtime

[Official reference](https://cdn.jsdelivr.net/npm/@cfpb/cfpb-design-system@5.10.2/dist/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Root | o-expandable | Background and border modifiers are optional independent choices. |
| Required descendants | __header, __label, __content | Header is a native button. Runtime adds behavior hooks and ARIA state. |
| Initialization | Expandable.init(container) | Returns initialized instances for the matching roots. |
| Instance API | expand(), collapse(), isExpanded(), getLabelText() | Verified against published 5.10.2, rather than an older toggleTargetState documentation entry. |
| Initial expanded state | o-expandable--onload-open | Set before initialization; do not manually fight runtime visibility classes. |
| Group choice | o-expandable-group--accordion | Opt-in mutually exclusive behavior. The preview deliberately allows comparison across open panels. |

## CFPB Design System CFPB implementation scope

### Consumer information before decoration

CFPB combines an editorial information architecture with form and disclosure components. Its grid, type hierarchy and small uppercase slug headings are as significant as its familiar green. The specimen is an original reading worksheet: essential orientation remains visible, while optional explanations use native Expandables. It is not a financial recommendation, a complaint submission, or a government service.

The package is public, but the government seal and CFPB identity have separate restrictions. Reusing the code does not make a service official. This example therefore has no seal, logo, official-site banner, or imitation government header.

[Supporting specification](https://cfpb.github.io/design-system/)

## CFPB Design System Typography and reading rhythm

### Source Sans 3 and version differences

Current font guidance names Source Sans 3, following the July 2025 change from Avenir Next. The local example has no externally hosted font dependency and intentionally uses the compiled system-font fallback. A real branded implementation should provide the authorized font files through the documented licensed-font mixin.

The public heading table and the current base-style string are not identical. In package 5.10.2 H1 is 2.125em with 1.25 leading, producing 34/42.5 at a 16px root, rather than the table’s 60px line height. The reference above follows that executable source. Heading normalization also uses per-level adjustments; do not turn the simplified table into a global override.

Keep paragraphs near 66 characters, with 15px gaps. Headings are sentence case except the compact H5/slug treatment. This makes a guidance article scannable without forcing every paragraph into a card.

[Supporting specification](https://cfpb.github.io/design-system/foundation/fonts)

## CFPB Design System Color and editorial framing

### Use the role, not just the green

The compiled CSS exposes --black, --green, --pacific and the graded supporting families. Text uses black; Pacific supplies a more recognizable interaction cue. The pale-gray Expandable background is a reading boundary, not a disabled state. Native slug headings combine a thin full-width gray rule with a thicker short green segment.

The worksheet intentionally leaves its main reading surface white. Green appears at the section divider, while the progress count is ordinary readable text. A finished or checked item remains understandable without distinguishing green from red. The page does not invent success or error meaning for every palette swatch.

- Use --gray-5 for a quiet expandable surface and --gray-40 for its outline.
- Keep links distinguishable by their underline or interaction treatment as well as hue.
- Reserve the identity marks for authorized use; a palette license is not permission to imply affiliation.

[Supporting specification](https://cfpb.github.io/design-system/foundation/color)

## CFPB Design System Twelve columns and useful density

### An article with a working margin

The documented grid has twelve columns, fixed 30px gutters and a 1230px maximum width. Mobile outer spacing is 15px; larger layouts use 30px. The preview translates this into an eight-column reading area and a four-column working checklist at 901px and above, then stacks the checklist below the article. That split is an application composition using the published grid, not an official universal page template.

Long text keeps its own 66ch maximum even when the page could grow wider. Buttons wrap, and the sidebar has no sticky height or nested scrolling region. Expanding an explanation increases ordinary document height, so the same composition works in the resource page’s embedded preview.

[Supporting specification](https://cfpb.github.io/design-system/foundation/grid)

## CFPB Design System Native Expandable structure

### Keep the trigger and optional content separate

A legacy Expandable root contains a __header button, a __label and a __content region. The button is the focus target. In this specimen a span supplies its label, while decorative plus/minus cues are hidden from the accessible name. The library assigns expanded state and behavior hooks during initialization; the application does not duplicate those changes.

The --background and --border modifiers supply the framed treatment. The --padded modifier is a larger presentation with a correspondingly larger label, not a requirement for every disclosure. Critical worksheet instructions remain outside the hidden panel, because readers must understand the task before opening optional explanations.

```html
<div class="o-expandable o-expandable--background o-expandable--border">
  <button class="o-expandable__header" type="button">
    <span class="o-expandable__label">Keep the question specific</span>
    <span class="o-expandable__cues" aria-hidden="true">
      <span class="o-expandable__cue-open">+</span>
      <span class="o-expandable__cue-close">−</span>
    </span>
  </button>
  <div class="o-expandable__content">
    <p>Describe the document and the words you want explained.</p>
  </div>
</div>
```

[Code reference](https://cfpb.github.io/design-system/components/expandables)

[Supporting specification](https://cfpb.github.io/design-system/components/expandables)

## CFPB Design System Disclosure and checklist behavior

### Two independent kinds of state

The native library owns disclosure state. The worksheet owns its three ordinary checkbox values and the resulting count. Opening a panel does not mark a task complete, and checking a task does not collapse information. These are deliberately separate models: visibility is not evidence of comprehension.

The 5.10.2 instance exposes expand, collapse and isExpanded. The public Expandables page includes an older toggleTargetState reference, so this guide uses the actual versioned API. Open all and Close all iterate the initialized instances. Independent panels are preferable here because a reader may compare the two explanations.

The reset action clears all checkbox values and collapses panels through the library API. It does not manufacture a submission confirmation. Progress is announced through a polite status element without moving keyboard focus after every checkbox change.

[Supporting specification](https://cdn.jsdelivr.net/npm/@cfpb/cfpb-design-system@5.10.2/dist/index.js)

## CFPB Design System Compiled assets and base styles

### An ES module, not a classic script

Install the pinned package, copy the two compiled assets into your static directory, and import Expandable with a module script. The published 5.10.2 index.js contains ES exports, so a classic script tag copied from the older integration example would cause a syntax error. It also does not automatically initialize the legacy Expandable roots.

The component stylesheet alone does not contain the page-wide heading and body rules. Production projects can compile the package base SCSS as shown by the official integration guide. This isolated specimen instead retains the exact base CSS string embedded in the same published module as a separately documented local file. That extraction is a local packaging choice, not a newly published CFPB entry point.

If you build source SCSS containing icon references, include the project’s documented PostCSS SVG replacement. The compiled snapshot already resolves those references. Avoid inventing a Sass-only setup that leaves --cfpb-background-icon-svg unresolved.

1. Install 5.10.2 and retain its TERMS.md alongside locally served assets.
2. Load the component CSS plus the chosen global base styles; configure fonts explicitly.
3. Use a module import, initialize the container after its markup exists, then attach application actions to the returned instances.

[Supporting specification](https://cfpb.github.io/design-system/development/integrating-the-design-system-into-your-project)

## CFPB Design System Verify the reading workflow

### A disclosure is not the whole accessibility test

At narrow width, the main title reduces through the native base styles and the checklist follows the article. At desktop width, the two-column arrangement exposes optional reading and working notes together. Test both views with all panels open, not only the collapsed state.

Use Tab to reach each native button and Enter or Space to toggle it. Confirm the library updates aria-expanded and that hidden content no longer appears in the tab order. Then check two tasks, open and close all explanations, and confirm the count remains two until reset. These tests catch application/library state conflicts that a screenshot cannot show.

This local example has no storage, analytics, network submission or real personal data. Native component use alone does not certify the resulting site; contrast, content, browser support and assistive-technology behavior still need review in the adopting service.

[Supporting specification](https://cfpb.github.io/design-system/components/expandables)

## Component Examples

### A native Expandable

Required legacy structure, decorative cues, and optional explanatory content.

```html
<div class="o-expandable o-expandable--background o-expandable--border">
  <button class="o-expandable__header" type="button">
    <span class="o-expandable__label">Keep the question specific</span>
    <span class="o-expandable__cues" aria-hidden="true">
      <span class="o-expandable__cue-open">+</span>
      <span class="o-expandable__cue-close">−</span>
    </span>
  </button>
  <div class="o-expandable__content">
    <p>Describe the document and the words you want explained.</p>
  </div>
</div>
```

[Code reference](https://cfpb.github.io/design-system/components/expandables)

### Initialize and control disclosures

Use the 5.10.2 module and returned instances; global base styles are a separate decision.

```html
npm install --save-exact @cfpb/cfpb-design-system@5.10.2
# Copy the published compiled files as static assets:
mkdir -p public/vendor/cfpb
cp node_modules/@cfpb/cfpb-design-system/dist/index.css public/vendor/cfpb/
cp node_modules/@cfpb/cfpb-design-system/dist/index.js public/vendor/cfpb/

# In the HTML document:
<link rel="stylesheet" href="/vendor/cfpb/index.css">
<!-- Supply project global/base typography separately. -->
<script type="module">
  import { Expandable } from '/vendor/cfpb/index.js';
  const panels = Expandable.init(document.querySelector('#guide'));
  document.querySelector('#open-all').addEventListener('click', () => {
    panels.forEach(panel => panel.expand());
  });
  document.querySelector('#close-all').addEventListener('click', () => {
    panels.forEach(panel => panel.collapse());
  });
</script>
```

[Code reference](https://cfpb.github.io/design-system/development/integrating-the-design-system-into-your-project)

- Published 5.10.2 is ESM. Do not load it as a classic script.
- The specimen uses verbatim extracted package base styles, documented in its vendor SOURCE.md.

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CFPB reading worksheet specimen</title><link rel="stylesheet" href="vendor/cfpb-5.10.2/index.css"><link rel="stylesheet" href="vendor/cfpb-5.10.2/base-extracted.css"><style>*{box-sizing:border-box}body{margin:0;background:#fff}main{max-width:1230px;margin:auto;padding:30px}header{max-width:66ch;margin-bottom:30px}.layout{display:grid;grid-template-columns:2fr 1fr;gap:30px}.article{min-width:0}.o-expandable{margin:15px 0}.toolbar{display:flex;gap:15px;flex-wrap:wrap;margin:15px 0}.notes{border-top:5px solid var(--gray-40);padding-top:15px}.notes label{display:flex;gap:10px;margin:20px 0;align-items:flex-start}.notes input{flex:none;width:20px;height:20px;margin-top:2px;accent-color:var(--pacific)}.o-expandable__content p{max-width:66ch}.eyebrow{color:var(--gray);font-size:14px}.note{font-size:14px;margin-top:30px;color:var(--gray)}button{font-family:inherit}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid var(--pacific);outline-offset:3px}@media(max-width:900px){.layout{grid-template-columns:1fr}}@media(max-width:600px){main{padding:20px 15px}}</style><main><header><p class="eyebrow">Independent educational specimen · CFPB components</p><h1>Make your question easier to answer</h1><p>Use this reading worksheet to organize a question about an unfamiliar document. No information is submitted or saved.</p></header><div class="layout"><section class="article" id="guide"><div class="m-slug-header"><h2 class="m-slug-header__heading">Before a conversation</h2></div><p>A useful question identifies the document, quotes the unclear wording, and says what you want explained. Keep account numbers and other private details out of this practice worksheet.</p><div class="toolbar"><button id="open-all" class="a-btn a-btn--secondary">Open all explanations</button><button id="close-all" class="a-btn a-btn--secondary">Close all</button></div><div class="o-expandable o-expandable--background o-expandable--border">
  <button class="o-expandable__header" type="button">
    <span class="o-expandable__label">Keep the question specific</span>
    <span class="o-expandable__cues" aria-hidden="true">
      <span class="o-expandable__cue-open">+</span>
      <span class="o-expandable__cue-close">−</span>
    </span>
  </button>
  <div class="o-expandable__content">
    <p>Describe the document and the words you want explained.</p>
  </div>
</div><div class="o-expandable o-expandable--background o-expandable--border">
  <button class="o-expandable__header" type="button">
    <span class="o-expandable__label">Separate a question from a request</span>
    <span class="o-expandable__cues" aria-hidden="true">
      <span class="o-expandable__cue-open">+</span>
      <span class="o-expandable__cue-close">−</span>
    </span>
  </button>
  <div class="o-expandable__content">
    <p>“What does this label mean?” asks for an explanation. “Please send a copy” asks for an action. Writing them separately makes the desired response easier to identify.</p>
  </div>
</div><p class="note">Original practice content. This example does not provide financial advice or represent a CFPB service.</p></section><aside class="notes"><h2>Your working notes</h2><p>Use the checklist as a local memory aid.</p><label><input type="checkbox">I can name the document I am asking about.</label><label><input type="checkbox">I have identified the wording I want explained.</label><label><input type="checkbox">I know whether I need an explanation or an action.</label><p id="count" role="status" aria-live="polite">0 of 3 notes checked</p><button id="reset" class="a-btn">Reset worksheet</button></aside></div></main><script type="module">import {Expandable} from './vendor/cfpb-5.10.2/index.js';const panels=Expandable.init(document.querySelector('#guide'));document.querySelector('#open-all').onclick=()=>panels.forEach(x=>x.expand());document.querySelector('#close-all').onclick=()=>panels.forEach(x=>x.collapse());const checks=[...document.querySelectorAll('input[type=checkbox]')];const update=()=>document.querySelector('#count').textContent=checks.filter(x=>x.checked).length+' of 3 notes checked';checks.forEach(x=>x.onchange=update);document.querySelector('#reset').onclick=()=>{checks.forEach(x=>x.checked=false);update();panels.forEach(x=>x.collapse())};window.demoReady=true;</script></html>
```

[Code reference](https://cfpb.github.io/design-system/components/expandables)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

The local demo executes the native 5.10.2 compiled module and CSS. The npm copying recipe is supplied for a project; source-SCSS builds additionally require the documented icon processing. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/cfpb.html. Do not open module-based examples through file://.

```bash / html
npm install --save-exact @cfpb/cfpb-design-system@5.10.2
# Copy the published compiled files as static assets:
mkdir -p public/vendor/cfpb
cp node_modules/@cfpb/cfpb-design-system/dist/index.css public/vendor/cfpb/
cp node_modules/@cfpb/cfpb-design-system/dist/index.js public/vendor/cfpb/

# In the HTML document:
<link rel="stylesheet" href="/vendor/cfpb/index.css">
<!-- Supply project global/base typography separately. -->
<script type="module">
  import { Expandable } from '/vendor/cfpb/index.js';
  const panels = Expandable.init(document.querySelector('#guide'));
  document.querySelector('#open-all').addEventListener('click', () => {
    panels.forEach(panel => panel.expand());
  });
  document.querySelector('#close-all').addEventListener('click', () => {
    panels.forEach(panel => panel.collapse());
  });
</script>
```

## Agent Prompt

Create an independent CFPB-informed editorial worksheet using the actual 5.10.2 Expandable module. Include the required header/label/content structure, independent open-all and close-all actions, and an ordinary checkbox checklist whose values survive disclosure changes. Use a twelve-column 8/4 composition that stacks below 901px, 15px mobile edges and a 66ch reading measure. Supply base typography separately from component CSS. Do not add CFPB identity marks, financial advice, fake submission, or classic-script imports for the ESM bundle.

## Sources

- [Fonts](https://cfpb.github.io/design-system/foundation/fonts) — Current font, normalization and reading rhythm.
- [Headings](https://cfpb.github.io/design-system/foundation/headings) — Responsive heading hierarchy; compare with versioned code.
- [Color](https://cfpb.github.io/design-system/foundation/color) — CFPB palette and usage guidance.
- [Grid](https://cfpb.github.io/design-system/foundation/grid) — Twelve columns, gutters and maximum width.
- [Expand](https://cfpb.github.io/design-system/components/expandables) — Component structure and variants.
- [Install](https://cfpb.github.io/design-system/development/integrating-the-design-system-into-your-project) — Package and source build integration.
- [Tokens](https://cfpb.github.io/design-system/development/design-tokens) — Scope of the newer token pipeline.
- [Download complete working example](/assets/demos/cfpb-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
