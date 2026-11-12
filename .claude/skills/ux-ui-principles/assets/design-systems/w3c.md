# W3C Design System — OpenDesign Application Guide

Build resilient reading interfaces with fluid type, semantic color roles and native collapsible content that remains readable without JavaScript.

Independent OpenDesign specimen using official public assets. No W3C affiliation or accessibility certification is implied.

## Source Reference

- **Scope:** The site documents styles, components and page templates. ([source](https://design-system.w3.org/))
- **CSS tooling:** Its stylesheet architecture uses Sass with SCSS syntax. ([source](https://design-system.w3.org/))
- **CSS structure:** The documented architecture is influenced by CUBE CSS. ([source](https://design-system.w3.org/))
- **Progressive styling:** The build separates core, advanced and print stylesheets. ([source](https://design-system.w3.org/))
- **Script hooks:** The guidance prefers data attributes for JavaScript hooks. ([source](https://design-system.w3.org/))
- **Template catalogue:** Page templates have a dedicated reference area. ([source](https://design-system.w3.org/templates/))


## Design Reference

Official W3C documentation and public CDN snapshot downloaded 3 October 2026; actual CSS and native script inspected.

### Fluid typography

[Official reference](https://design-system.w3.org/styles/typography.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Web font / fallback | Noto Sans / Trebuchet MS, Geneva, sans-serif | Native CSS applies Noto Sans after fonts-loaded; demo keeps system fallback. |
| Fluid range | 320–1120px viewport | Clamp values plateau outside this range; no hard typographic jump. |
| --w3c-text-0 | clamp(.9375rem, .9125rem + .125vw, 1rem) | Body: 15px to 16px at normal root size. |
| --w3c-text-5 | clamp(1.6894rem, 1.6444rem + .2253vw, 1.802rem) | H1 scale; approximately 27–28.8px. |
| --w3c-text-7 | clamp(2.1382rem, 2.0811rem + .2851vw, 2.2807rem) | Largest text-xl scale, not the default H1. |
| Body line height | 1.5 | Relative to fluid font size. |
| Collapsible H3 | --w3c-text-1 / line-height 1.5 | Component override: approximately 16.9–18px. |

### Semantic colors

[Official reference](https://design-system.w3.org/settings/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Text | #111111 | off-black; ordinary reading text. |
| Link | #005a9c | W3C blue; distinct from hover and visited. |
| Hover / visited | #002a56 / #75336c | Preserve state distinction. |
| Focus | #f9dc4a | Yellow focus treatment with a visible boundary. |
| Input border | #545454 | Different contrast role from decorative dividers. |
| Success / error | #046704 / #a82615 | Status meaning, not random accents. |
| Warning | #c28605 | Border role for warning notes. |

### Layout and spacing

[Official reference](https://www.w3.org/assets/website-2021/styles/core.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| l-center | max-inline-size:70rem; padding-inline:5vw | Native wide container; preview applies a narrower 55rem application cap. |
| Reading measure | 41.25rem | Maximum content width inside collapsible bodies. |
| Stack default | 1em between direct siblings | Official Sass mixin accepts an explicit measure; not a fixed 8px scale. |
| Collapsible inset | 1.5625rem | 25px at normal root size. |
| Collapsible separation / radius | 1rem / .375rem | 16px separation and 6px corners. |
| Collapsible shadow | -.0625rem .0625rem .25rem rgba(55,70,95,.12) | Subtle surface separation; native CSS. |

### Progressive enhancement contract

[Official reference](https://design-system.w3.org/components/collapsible-containers.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Outer hook | data-component="collapsibles" | Script locates each component root. |
| Heading hook | data-heading="collapsibles" | Script inserts an actual button into each heading. |
| Collapsed state | aria-expanded=false; next sibling aria-hidden=true | Advanced CSS requires the html.js marker to hide the body. |
| data-anchor="no" | Suppress automatic heading anchors for this subtree | Avoid injecting another link into the collapsible heading. |
| No JavaScript | All content remains visible | Do not ship hidden content as the unenhanced initial markup. |

## W3C Design System Progressive enhancement

### Content precedes controls

W3C separates core styling from advanced components. The collapsible starts as ordinary headings followed by content. With no script, every session outline is readable. main.js inserts buttons and changes the state only after it discovers the documented data attributes. This is a different implementation model from shipping an already-hidden accordion whose controls may never initialize.

The preview uses the official CDN core.css, advanced.css and main.js, saved as a dated local snapshot. The html.js marker activates advanced selectors. Omitting that marker changes ARIA attributes while leaving the bodies visually open; the preview explicitly tests actual visibility as well as aria-expanded.

[Supporting specification](https://design-system.w3.org/)

## W3C Design System Fluid type and font loading

### A modest reading scale

The body size grows from 15px at the lower viewport bound to 16px at 1120px. Nine named custom properties provide the scale. H1 uses --w3c-text-5, not the largest --w3c-text-7; a 36px display title copied indiscriminately into every document would not match the standard heading hierarchy.

Noto Sans is the intended web font. The native fallback stack uses Trebuchet MS and Geneva until the font-loading path adds fonts-loaded to the root. This independent example leaves the fallback active and labels that choice. The fluid size and line-height remain native; the preview does not claim exact Noto Sans glyph metrics.

[Supporting specification](https://design-system.w3.org/styles/typography.html)

## W3C Design System Reading width and spacing

### Compose layout primitives

The l-center primitive supplies a 70rem maximum inline size and 5vw side padding. The preview adds an application-specific 55rem cap to keep three short learning outlines compact. That cap is not a new W3C token. Within each collapsible body, the native 41.25rem text measure limits long lines.

The documented Stack mixin creates a column and applies margin-top to direct siblings after the first. Its default measure is 1em and callers can pass another unit. Treat it as a relationship between blocks, rather than inventing a global numbered spacing scale. The collapsible itself has separately verified 25px inset, 16px separation and 6px radius.

[Supporting specification](https://design-system.w3.org/styles/vertical-spacing.html)

## W3C Design System Semantic color roles

### Keep link history and focus visible

The system distinguishes the default blue link, deep-blue hover and purple visited state. These roles matter on a site where people return to long documents and navigate between references. Reusing the link alias for unrelated decoration makes future theme changes alter unrelated surfaces.

Focus uses yellow with a visible boundary. The settings page separates ordinary borders from the darker input-border role. It also lists different meanings for information, success, warning and error colors. Preserve the role and verify its pairing against the actual background; a color swatch alone is not proof that a component state has sufficient contrast.

[Supporting specification](https://design-system.w3.org/settings/)

## W3C Design System Collapsible markup and script

### Heading, button and adjacent body

Each direct child contains a heading followed immediately by its content body. The script uses nextElementSibling to find that body, so inserting unrelated metadata between them would break the relationship. Place a category label inside the heading span, as in the documented group list pattern. The script wraps the heading content in a button.

The native code toggles aria-expanded on that button and aria-hidden on the body. The advanced stylesheet hides the collapsed body. data-anchor="no" prevents the separate heading-anchor feature from introducing unwanted links into this component. Initialize main.js once; repeated enhancement would nest extra buttons in headings.

```html
<div class="component--collapsibles" data-component="collapsibles" data-anchor="no">
  <div>
    <h3 data-heading="collapsibles">Inclusive forms <span>Practical workshop</span></h3>
    <div>
      <p>Connect each field to its label, hint and recovery message.</p>
      <ul><li>Preserve entered values</li><li>Test keyboard recovery</li></ul>
    </div>
  </div>
</div>
```

[Code reference](https://design-system.w3.org/components/collapsible-containers.html)

[Supporting specification](https://design-system.w3.org/components/collapsible-containers.html)

## W3C Design System Bulk controls and keyboard use

### Extend through the existing buttons

Expand all and Collapse all are original example controls. They inspect each native button and click it only when its state needs to change. This keeps the native state transition and visual rule together. They do not directly edit one ARIA attribute while leaving the other stale.

Native buttons provide Enter and Space activation. The preview checks an individual button, expands all, collapses all and opens one again from the keyboard. A polite status message describes the bulk action. The source component permits several outlines to be open at once; it is not an exclusive one-open accordion.

1. Open Inclusive forms and inspect its practical list.
2. Expand all to compare the three session descriptions.
3. Collapse all, then use Enter on one heading to reopen only that section.

[Supporting specification](https://design-system.w3.org/components/collapsible-containers.html)

## W3C Design System Assets and integration

### No invented package installation

The official getting-started page publishes stable CDN entry points for core, advanced and print styles, plus main.js and optional feature scripts. The setup block uses those actual paths. A React provider or an npm package is unnecessary for this HTML implementation. The local demo vendors the downloaded files to make the specimen independent of a live connection.

Production integration should retain the documented CSS capability gate for advanced styles when supporting the same older browser population. The compact setup loads advanced styles directly for modern browsers. Include the print stylesheet in a full document site; the standalone preview focuses on the interactive screen specimen.

- core.css: base typography, layouts and unenhanced components.
- advanced.css: rules for JavaScript-enhanced states.
- main.js: discovers data hooks and enhances supported components once.

[Supporting specification](https://design-system.w3.org/getting-started.html)

## W3C Design System Scope and verification

### Design system, not conformance certification

A W3C-styled page is not automatically WCAG conformant. Test its actual content, focus order, zoom behavior and recovery states. This example checks three viewport widths and the no-script baseline; it does not claim certification or an exhaustive assistive-technology audit.

The learning-circle names and descriptions are original fictional content. They are not official working groups, schedules or registration opportunities. The example deliberately avoids W3C logos and membership claims. Reusing a public style asset must remain separate from implying institutional endorsement.

[Supporting specification](https://design-system.w3.org/getting-started.html)

## Component Examples

### Progressively enhanced session outline

Heading and adjacent body are the required anatomy; main.js adds the toggle.

```html
<div class="component--collapsibles" data-component="collapsibles" data-anchor="no">
  <div>
    <h3 data-heading="collapsibles">Inclusive forms <span>Practical workshop</span></h3>
    <div>
      <p>Connect each field to its label, hint and recovery message.</p>
      <ul><li>Preserve entered values</li><li>Test keyboard recovery</li></ul>
    </div>
  </div>
</div>
```

[Code reference](https://design-system.w3.org/components/collapsible-containers.html)

### Complete native learning list

Includes root enhancement marker, official assets, native collapsibles and bulk controls.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script>document.documentElement.classList.add("js")</script><title>Web learning circles</title><link rel="stylesheet" href="vendor/w3c-2026-10-03/core.css"><link rel="stylesheet" href="vendor/w3c-2026-10-03/advanced.css"><style>body{min-block-size:0;padding-block:2rem}.demo{max-inline-size:55rem}header{margin-bottom:2rem}.actions{display:flex;gap:1rem;flex-wrap:wrap;margin:1.5rem 0}.component--collapsibles{padding:1rem;background:#f8f8fb}footer{margin-top:2rem;border-top:1px solid #bdbdbd;padding-top:1rem;font-size:.875rem}#notice{min-height:1.5em}button{max-width:100%}</style><main class="l-center demo" data-anchor="no"><header><p>INDEPENDENT LEARNING PROGRAMME</p><h1>Web learning circles</h1><p class="lead">Explore three small-group sessions for people building a more usable web.</p></header><div class="actions"><button class="button button--ghost" id="expand">Expand all sessions</button><button class="button button--ghost" id="collapse">Collapse all sessions</button></div><p id="notice" role="status">Choose a session to read its outline.</p><div class="component--collapsibles" data-component="collapsibles" data-anchor="no"><div><h3 data-heading="collapsibles">Inclusive forms <span>Practical workshop</span></h3><div><p>Trace a form from its label to its hint, error message and recovery action. Compare the experience with a keyboard and with enlarged text.</p><ul><li>Associate labels and help text</li><li>Keep entered values after an error</li><li>Move focus only when it helps recovery</li></ul></div></div><div><h3 data-heading="collapsibles">Resilient reading <span>Discussion circle</span></h3><div><p>Examine document structure before adding interaction. The content in this example remains visible when JavaScript is unavailable.</p><p>Bring a short article and identify its heading hierarchy, reading measure and meaningful links.</p></div></div><div><h3 data-heading="collapsibles">International text <span>Peer review</span></h3><div><p>Review language declarations, long translated labels and mixed-direction text. A font choice alone cannot guarantee a usable multilingual interface.</p><p>All sessions are fictional examples, with no membership or registration service.</p></div></div></div><footer>Native W3C CDN styles and collapsible script, snapshot 3 October 2026. System font fallback; original learning content, no W3C affiliation.</footer></main><script src="vendor/w3c-2026-10-03/main.js"></script><script>document.querySelector('.component--collapsibles').addEventListener('click',()=>{const n=document.querySelectorAll('[data-heading] button[aria-expanded=true]').length;document.querySelector('#notice').textContent=n+' session outline'+(n===1?' is':'s are')+' expanded.'});function all(open){document.querySelectorAll('[data-heading="collapsibles"] button').forEach(b=>{if((b.getAttribute('aria-expanded')==='true')!==open)b.click()});document.querySelector('#notice').textContent=open?'All three session outlines are expanded.':'All session outlines are collapsed.'}document.querySelector('#expand').onclick=()=>all(true);document.querySelector('#collapse').onclick=()=>all(false);</script></html>
```

[Code reference](https://design-system.w3.org/components/collapsible-containers.html)

## Implementation Starting Point

Actual official CDN paths. The local preview vendors these assets and retains the native system font fallback. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/w3c.html. Do not open module-based examples through file://.

```html
<!-- Core is useful without JavaScript. -->
<link rel="stylesheet" href="https://www.w3.org/assets/website-2021/styles/core.css">
<link rel="stylesheet" href="https://www.w3.org/assets/website-2021/styles/advanced.css">
<link rel="stylesheet" href="https://www.w3.org/assets/website-2021/styles/print.css" media="print">
<script>document.documentElement.classList.add('js');</script>
<!-- Put component markup in the document, then load the script once. -->
<script defer src="https://www.w3.org/assets/website-2021/js/main.js"></script>
```

## Agent Prompt

Use W3C core and advanced styles with main.js and the html.js enhancement marker. Build semantic headings with adjacent collapsible content using the actual data hooks. Preserve the no-JavaScript readable baseline, native fluid type and semantic link/focus colors. Do not initialize twice or infer WCAG conformance from styling alone.

## Sources

- [Getting started](https://design-system.w3.org/getting-started.html) — Official CDN assets and loading instructions.
- [Collapsible containers](https://design-system.w3.org/components/collapsible-containers.html) — Native anatomy, hooks and progressive behavior.
- [Typography](https://design-system.w3.org/styles/typography.html) — Noto Sans and fluid scale.
- [Settings](https://design-system.w3.org/settings/) — Color roles and font-loading behavior.
- [Vertical spacing](https://design-system.w3.org/styles/vertical-spacing.html) — Stack mixin and explicit measures.
- [Download complete working example](/assets/demos/w3c-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
