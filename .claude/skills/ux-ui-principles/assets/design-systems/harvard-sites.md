# HarvardSites Design System — OpenDesign Application Guide

Understand HarvardSites as an editorial platform: compare site styles, choose documented font pairings, and assemble university pages from purpose-built content components.

Editorial reference for HarvardSites and an independent fictional event prototype. Official institutional marks, platform access, and production configuration remain governed by Harvard. No booking, affiliation, or SDK compatibility is claimed.

## Source Reference

- **Institutional context:** University websites across Harvard schools and departments ([source](https://designsystem.harvardsites.harvard.edu/))
- **Foundation areas:** Principles, accessibility, brand, graphic design and university policy ([source](https://designsystem.harvardsites.harvard.edu/))
- **Editorial components:** Cards, columns, hero and list components ([source](https://designsystem.harvardsites.harvard.edu/))
- **Media resources:** Media gallery and quote-card guidance ([source](https://designsystem.harvardsites.harvard.edu/))
- **Event guidance:** Dedicated event landing-page how-to material ([source](https://designsystem.harvardsites.harvard.edu/design-effective-event-landing-pages))
- **Image guidance:** Cropping, captions, credits and hero readability ([source](https://designsystem.harvardsites.harvard.edu/using-images-effectively))


## Design Reference

Official HarvardSites editorial standards and component guidance. Public references define configurable styles and requirements, not a universal public CSS-token package. The preview uses explicitly original numeric layout/color values and system font fallbacks.

### Typography requirements

[Official reference](https://designsystem.harvardsites.harvard.edu/graphic-design)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Number of typefaces | At most 2 | At least one sans serif; wayfinding uses sans serif. |
| Minimum text size | 1rem | Do not shrink captions or control labels below the browser default. |
| Required x-height reference | 8.3px ±5% at a 16px font size | Official theme selection criterion; not an automatic compliance claim for fallback fonts. |
| Text and heading alignment | Left or right according to language | Do not center or justify text blocks. |
| Special effects | No outline, drop shadow, tracking or horizontal scaling | Preserve typeface shape; use italics sparingly. |

### Available font pairings

[Official reference](https://designsystem.harvardsites.harvard.edu/typography-options)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Academic pairing | Baskerville + Source Sans Pro | Heading and body pairing. |
| Content-heavy pairing | Merriweather + Roboto | Separate from site style selection. |
| Single-family pairing | Inter + Inter | Does not alter component structure. |

### Site style options

[Official reference](https://designsystem.harvardsites.harvard.edu/site-styles)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Light & Elegant | Soft corners; slightly lifted imagery | Open presentation, generally without outlines. |
| Bold & Compelling | Straight corners; borders and dividers | Allows eyebrows beyond Hero. |
| Friendly & Approachable | Rounded cards; pill buttons | Softer grouped presentation. |
| What style does not change | Typography, color roles, keyboard behavior | Those remain independently configured or handled by components. |

### Image preparation guidance

[Official reference](https://designsystem.harvardsites.harvard.edu/choose-right-image-size-and-format)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Hero export width | Approximately 1920px | Prepare close to maximum display width, then test cropping. |
| 50/50 Card export width | Approximately 800px | Contextual imagery for one featured item. |
| Vertical Card export width | Approximately 600px | Equal-priority item cards. |
| List thumbnail export width | Approximately 400px | Summary-oriented listings. |
| Most image file sizes | Under 200KB | A practical recommendation, not a guaranteed platform hard limit. |
| Formats | JPG photographs; PNG transparency/line art; SVG simple graphics | Choose according to source content. |

### Original specimen values — not official tokens

[Official reference](https://designsystem.harvardsites.harvard.edu/site-styles)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Body / headings | Arial / Georgia | Local fallbacks; not one of the delivered platform font pairings. |
| Text / accent / surface | #242424 / #653f3a / #f4f1ec | Original neutral palette; not Harvard color token names. |
| Outer width / mobile inset | 70rem / 1.25rem | Application choices. |
| Spacing / layout switch | 1 / 1.5 / 2rem; 48rem breakpoint | Example implementation values, not a published system scale. |

## HarvardSites Design System A platform for editors

### Start with a real HarvardSites configuration

The public design-system site describes reusable editorial components and the choices available across University websites. It is not evidence for a package called harvard-design-system or an importable React API. An authorized site editor assembles the platform’s components; an independent developer can study the documented content patterns without pretending to run the same CMS.

The useful starting decision is the kind of page: a conference one-pager needs an overview, an agenda, session discovery, and supporting attendee information. The supplied configuration recipe maps each need to a real HarvardSites component. The standalone HTML demonstrates that composition independently, with fictional content and no institutional identity marks.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/)

## HarvardSites Design System Typography and readability

### Separate the font pairing from the style

The platform presents three heading/body combinations: Baskerville with Source Sans Pro, Merriweather with Roboto, and Inter with Inter. These are choices independent of site style. Switching a page from a framed layout to a rounded layout does not imply switching its fonts.

Graphic-design standards restrict a design to two typefaces, require at least one sans serif, and set a minimum text size of 1rem. Menus, controls, labels, and other wayfinding elements use sans serif. The published x-height criterion is 8.3px ±5% when set at 16px; this is more specific than simply recommending a readable font. The specimen uses Arial and Georgia as visible fallbacks, without claiming they are a provisioned platform pairing or formally audited against that criterion.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/graphic-design)

### Alignment is part of the standard

Text blocks and headings follow the reading direction rather than centered or justified alignment. Non-link text is not underlined. Keep headings clear and use weight for emphasis; do not create display treatment by stretching letters, adding outlines, or inserting large tracking. The preview therefore keeps every label at 1rem or above and aligns the event introduction to the left.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/graphic-design)

## HarvardSites Design System Three independent style choices

### Frame, color, and typography are different settings

Light & Elegant presents open sections, mild rounding, and subtly offset images. Bold & Compelling emphasizes straight edges, outlines, and separators. Friendly & Approachable uses rounded grouping and pill-shaped buttons. These affect the visual framing of the same content and component structure.

The specimen offers a layout-style selector so the differences can be explored without changing text, accordion state, or focus behavior. It approximates the documented visual ideas with original CSS; it does not reproduce the CMS stylesheets. In particular, its border widths and corner radii are application choices, not extracted HarvardSites tokens.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/site-styles)

### Assign colors by role

HarvardSites describes roles for text, backgrounds, buttons, and accents, with light and dark mappings. A palette can vary while these relationships remain consistent. The public reference does not establish one mandatory hexadecimal color set for all sites. The preview therefore labels its neutral ink, brown accent, and warm background as original values instead of calling them Harvard brand tokens.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/color-roles)

## HarvardSites Design System Compose the event one-pager

### Keep the main schedule visible

Use a Hero or Section Heading to introduce the event, then an inline table for its schedule. The official one-pager guide recommends concise cells, a consistent time notation, and few columns for mobile readability. The specimen uses Time and Session columns; venue and access context live above or below the table rather than becoming a cramped five-column agenda.

An accordion fits additional practical questions. Essential eligibility, venue access, cancellations, or deadlines should remain visible because collapsed text can be missed. A single event can use a short self-contained page; a major programme with long abstracts and many parallel tracks needs linked detail pages rather than endlessly nested disclosures.

- Use a Hero or Section Heading for purpose and orientation.
- Use a table for times that attendees need to compare at a glance.
- Use a taxonomy-driven List when event or session discovery requires filtering.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/building-event-one-pager-summits-conferences-and-symposiums)

## HarvardSites Design System Choose the right card structure

### One feature is different from a collection

A 50/50 Card pairs an image or a text region with explanatory copy. Its documented fields include an image, caption, optional eyebrow, heading, description, and call-to-action links. Reserve it for one prominent story or event; Vertical Cards better express several equally important records, and Button-Style Cards serve quick actions.

A 50/50 Card needs room to work. The guidance discourages squeezing it into a narrow side-navigation region and asks for images that provide meaning, not stock decoration. The specimen uses a text-only split composition, a variant shown in the official examples: a short theme on one side, a description and schedule link on the other. This avoids implying that an invented campus photograph is an authentic Harvard setting.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/5050-card)

## HarvardSites Design System Image sizes and alternatives

### Prepare assets for the component

The official image guide suggests exports near 1920px for Hero images, 800px for a 50/50 Card, 600px for Vertical Cards, and 400px for list thumbnails. These are approximate preparation targets, not fixed CSS rendered widths. It recommends most files stay below 200KB, JPG for photos, PNG where transparency or line art requires it, and SVG for simple graphics.

Supply meaningful alt text for informative images, and use captions when visible context or credit belongs with the image. A venue map needs a text route or equivalent location explanation as well as a visual. Changing a crop can remove a face, object, or label that the copy refers to; inspect the actual narrow layout after uploading, rather than assuming a wide desktop crop covers every device.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/choose-right-image-size-and-format)

## HarvardSites Design System Accordion behavior and controls

### Secondary information with a clear name

HarvardSites documents both auto-close accordions and a stay-open variant with controls that reveal or close all sections. The example deliberately selects independent stay-open behavior so a visitor can read travel and preparation notes together. Individual headings describe the hidden subject without requiring the reader to open each panel to identify it.

The code here uses native details and summary for an independent implementation. It is not a claim about the markup generated by HarvardSites. Open-all and close-all buttons update every details.open property; the browser retains native keyboard activation for each summary. No nested accordion is needed, and mandatory information stays outside this group.

```html
<!-- Independent HTML interpretation, not HarvardSites CMS output. -->
<div aria-label="Attendee information">
  <button type="button" id="open-all">Open all sections</button>
  <button type="button" id="close-all">Close all sections</button>
  <details><summary>What will I need?</summary>
    <p>Bring a notebook. The fictional workshop supplies all reading material.</p>
  </details>
  <details><summary>Can I join part of the day?</summary>
    <p>The example schedule lets visitors choose either morning or afternoon sessions.</p>
  </details>
</div>
<script>
const panels = [...document.querySelectorAll('details')];
document.querySelector('#open-all').addEventListener('click', () => {
  panels.forEach(panel => { panel.open = true; });
});
document.querySelector('#close-all').addEventListener('click', () => {
  panels.forEach(panel => { panel.open = false; });
});
</script>
```

[Code reference](https://designsystem.harvardsites.harvard.edu/accordion)

[Supporting specification](https://designsystem.harvardsites.harvard.edu/accordion)

## HarvardSites Design System A concrete editor workflow

### Configure once, assemble consistently

In an authorized HarvardSites project, select the approved site style, font pairing, and color roles before composing the event page. Use the platform’s existing components rather than pasting the independent demo HTML into an editor and expecting its custom script to execute. The exact editor controls depend on the provisioned site; the recipe names documented choices without inventing a settings screen.

The demo’s style selector changes only framing. After opening both attendee panels, change styles and verify the panels remain open. Then close them all and use the keyboard to reopen one. This is a useful continuity check: visual presentation should not erase a reader’s place or change the content model.

1. Prepare verified event title, date, place, agenda, access information, and the owner responsible for updates.
2. Build the introduction, short agenda table, and secondary accordion from documented components.
3. Preview narrow layouts and keyboard use; confirm that registration links lead to the actual approved destination.

[Supporting specification](https://designsystem.harvardsites.harvard.edu/building-event-one-pager-summits-conferences-and-symposiums)

## Component Examples

### Stay-open attendee information

Independent semantic HTML for the documented accordion behavior, including open-all and close-all controls.

```html
<!-- Independent HTML interpretation, not HarvardSites CMS output. -->
<div aria-label="Attendee information">
  <button type="button" id="open-all">Open all sections</button>
  <button type="button" id="close-all">Close all sections</button>
  <details><summary>What will I need?</summary>
    <p>Bring a notebook. The fictional workshop supplies all reading material.</p>
  </details>
  <details><summary>Can I join part of the day?</summary>
    <p>The example schedule lets visitors choose either morning or afternoon sessions.</p>
  </details>
</div>
<script>
const panels = [...document.querySelectorAll('details')];
document.querySelector('#open-all').addEventListener('click', () => {
  panels.forEach(panel => { panel.open = true; });
});
document.querySelector('#close-all').addEventListener('click', () => {
  panels.forEach(panel => { panel.open = false; });
});
</script>
```

[Code reference](https://designsystem.harvardsites.harvard.edu/accordion)

- This is not HarvardSites generated markup or an official SDK.
- Critical access information must remain visible outside collapsed panels.

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Research forum — HarvardSites pattern interpretation</title><style>*{box-sizing:border-box}body{margin:0;font:1rem/1.6 Arial,sans-serif;color:#242424;background:#fff}main{max-width:70rem;margin:auto;padding:2rem 1.25rem}.config{padding:1rem 0;border-bottom:1px solid #b9b4ac;margin-bottom:2rem;display:flex;gap:1rem;align-items:center;flex-wrap:wrap}select,button{font:inherit;color:inherit;background:white;border:1px solid #615a51;padding:.65rem .9rem}button{cursor:pointer}h1,h2{font-family:Georgia,serif;line-height:1.15}h1{font-size:clamp(2.5rem,6vw,4rem);max-width:15ch;margin:1rem 0}h2{font-size:1.75rem}a{color:#653f3a;text-underline-offset:4px}a:focus-visible,button:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #005fcc;outline-offset:4px}.hero{padding-bottom:2rem;border-bottom:1px solid #b9b4ac}.meta{color:#653f3a;font-weight:bold}.split{display:grid;gap:1.5rem;margin:2rem 0;padding:1.5rem;background:#f4f1ec}.split h2{margin:0}.split p{margin:0 0 1rem}table{width:100%;border-collapse:collapse;margin:1rem 0 2rem}caption{text-align:left;font-weight:bold;margin-bottom:1rem}th,td{text-align:left;padding:1rem .5rem;border-bottom:1px solid #b9b4ac;vertical-align:top}th:first-child,td:first-child{width:7rem}.controls{display:flex;flex-wrap:wrap;gap:.75rem;margin:1rem 0}details{border-top:1px solid #b9b4ac;padding:1rem 0}details:last-of-type{border-bottom:1px solid #b9b4ac}summary{font-weight:bold;cursor:pointer}details p{max-width:55ch;margin-bottom:0}.note{margin:2rem 0 0;padding:1rem;border-left:4px solid #653f3a;background:#f4f1ec}footer{padding-top:2rem;margin-top:2rem;border-top:1px solid #b9b4ac}body[data-style="bold"] .split{border:2px solid #242424}body[data-style="friendly"] .split{border-radius:1.5rem}body[data-style="friendly"] button{border-radius:3rem}body[data-style="light"] .split{border-radius:.3rem;background:#faf9f6}@media(min-width:48rem){.split{grid-template-columns:1fr 1fr;padding:2rem}.body-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:3rem}main{padding:2.5rem}}</style></head><body data-style="bold"><main><div class="config"><label for="style">Explore framing</label><select id="style"><option value="bold">Bold &amp; Compelling interpretation</option><option value="light">Light &amp; Elegant interpretation</option><option value="friendly">Friendly &amp; Approachable interpretation</option></select></div><header class="hero"><p class="meta">An original academic event example</p><h1>Ideas across disciplines</h1><p>A one-day forum on how researchers turn shared questions into new methods.</p><p><strong>Friday, 16 October · 9:30–16:00 · Example Learning Centre</strong></p><p>Fictional programme. No registration or university affiliation is implied.</p></header><section class="split" aria-labelledby="theme"><h2 id="theme">One question.<br>Many ways of seeing.</h2><div><p>Historians, scientists, and designers compare the evidence they work with and the assumptions they bring to it.</p><a href="#agenda">Explore the day’s programme →</a></div></section><div class="body-grid"><section id="agenda" tabindex="-1"><h2>The day at a glance</h2><table><caption>Illustrative programme</caption><thead><tr><th scope="col">Time</th><th scope="col">Session</th></tr></thead><tbody><tr><td>09:30</td><td><strong>Welcome and questions</strong><br>Shared framing for the day</td></tr><tr><td>10:00</td><td><strong>Working with evidence</strong><br>A conversation across disciplines</td></tr><tr><td>13:30</td><td><strong>Methods in practice</strong><br>Small-group demonstrations</td></tr><tr><td>15:30</td><td><strong>What changes next?</strong><br>Reflection and closing discussion</td></tr></tbody></table></section><section><h2>Attendee information</h2><div class="controls"><button id="open-all" type="button">Open all sections</button><button id="close-all" type="button">Close all sections</button></div><details><summary>What will I need?</summary><p>Bring a notebook. All reading material is provided in this fictional programme, and no specialist preparation is required.</p></details><details><summary>Can I join part of the day?</summary><p>The example schedule has morning and afternoon sessions. A real event page should state whether individual sessions require separate registration.</p></details><p class="note"><strong>Access information stays visible.</strong><br>A real event must provide verified venue access details and an accommodation contact here, outside collapsed panels.</p></section></div><footer>Independent interpretation of HarvardSites editorial guidance. Original layout values and colors; Arial and Georgia fallbacks. This is not a HarvardSites CMS page.</footer></main><script>document.querySelector('#style').addEventListener('change',e=>document.body.dataset.style=e.target.value);const panels=[...document.querySelectorAll('details')];document.querySelector('#open-all').addEventListener('click',()=>panels.forEach(p=>p.open=true));document.querySelector('#close-all').addEventListener('click',()=>panels.forEach(p=>p.open=false));</script></body></html>
```

[Code reference](https://designsystem.harvardsites.harvard.edu/building-event-one-pager-summits-conferences-and-symposiums)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

A concrete configuration and composition path for authorized HarvardSites editors. No public package API or unverified token scale is invented. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/harvard-sites.html. Do not open module-based examples through file://.

```text
HarvardSites editorial configuration recipe (not a package command)

1. In an authorized HarvardSites site, choose an available site style:
   Bold & Compelling for clearly framed conference sections.
2. Choose typography separately:
   Baskerville + Source Sans Pro, Merriweather + Roboto, or Inter + Inter.
3. Apply the site's approved color roles; do not hand-color every card.
4. Compose an event page from available platform components:
   Section Heading/Hero -> inline schedule table -> attendee Accordion.
5. Use a 50/50 Card for one featured event or a venue map with text;
   use Vertical Cards or a taxonomy-driven List for equal event records.
6. Add descriptive headings, image alternatives, verified times and locations.
   Preview mobile layout and keyboard interactions before publication.

Standalone demonstration: open the supplied harvard-sites.html.
It uses ordinary HTML, CSS and JavaScript, not the HarvardSites runtime.
```

## Agent Prompt

Compose an authorized HarvardSites research-event page using a Section Heading or Hero, a compact two-column schedule table, and a stay-open attendee Accordion. Choose site style, approved font pairing, and color roles independently. Keep critical access and timing information visible. Use 1rem minimum text, no more than two typefaces, sans-serif controls, and left-aligned English copy. Do not invent a HarvardSites npm package, public token scale, or editor UI. If implementing an independent prototype, label its CSS values as original and do not claim official CMS output.

## Sources

- [Graphic-design standards](https://designsystem.harvardsites.harvard.edu/graphic-design) — Typeface limits, minimum text size, alignment and wayfinding.
- [Font pairings](https://designsystem.harvardsites.harvard.edu/typography-options) — Three documented heading/body combinations.
- [Site styles](https://designsystem.harvardsites.harvard.edu/site-styles) — Framing choices independent of typography and color.
- [Event one-pager](https://designsystem.harvardsites.harvard.edu/building-event-one-pager-summits-conferences-and-symposiums) — Component choices for agenda, sessions and attendee information.
- [Accordion](https://designsystem.harvardsites.harvard.edu/accordion) — Secondary-content structure and independent open/close behavior.
- [Image preparation](https://designsystem.harvardsites.harvard.edu/choose-right-image-size-and-format) — Approximate exports and format guidance.
- [Download complete working example](/assets/demos/harvard-sites-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
