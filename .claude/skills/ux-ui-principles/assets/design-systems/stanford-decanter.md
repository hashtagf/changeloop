# Decanter Design System — OpenDesign Application Guide

Compose academic editorial pages with Decanter’s Tailwind preset, responsive type scale and fluid screen edges. Explore original event cards with working topic filters and expandable abstracts.

Independent OpenDesign educational composition, not an official university event page. Original content and no Stanford marks. Code adoption and brand-authorised identity use are separate.

## Source Reference

- **Institution:** Stanford University ([source](https://decanter.stanford.edu/))
- **System type:** Web design and development system ([source](https://decanter.stanford.edu/))
- **Layout foundation:** Responsive layout system ([source](https://decanter.stanford.edu/))
- **Pattern resource:** Browsable collection of design patterns ([source](https://decanter.stanford.edu/))
- **Developer route:** Decanter v7 documentation uses a Tailwind preset ([source](https://decanter.stanford.edu/for-developers/installation))
- **Design route:** Figma guidance is provided ([source](https://decanter.stanford.edu/for-designers/figma))


## Design Reference

Decanter 7.5.3 package and official v7 installation/conventions. v8 deprecations are treated as migration notes. Preview is a labelled HTML/CSS interpretation, using local font fallbacks and no university identity marks.

### Type configuration

[Official reference](https://decanter.stanford.edu/for-designers/type-grids-and-color)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Primary sans / serif | Source Sans 3 / Source Serif 4 | Fallbacks are Helvetica/Arial and Georgia/Times. |
| Long-form line height | 1.4–1.5em | Recommended reading range. |
| Short text / headings | 1.2–1.3em | More compact groups. |

### Selected modular settings

[Official reference](https://decanter.stanford.edu/for-developers/strategies-and-conventions)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Scale mobile / tablet / desktop | 1.15 / 1.2 / 1.25 | Ratio between type-* steps. |
| basefont-23 selection | 18px XS–SM; 21px MD–XL; 23px 2XL | Explicit configuration used by the specimen. |
| Breakpoints SM / MD / LG / XL / 2XL | 576 / 768 / 992 / 1200 / 1500px | Responsive boundaries. |
| cc maximum | 1500px at 1700px viewport | Fluid content container with screen edges. |
| Screen edge XS / SM / MD / LG / XL | 20 / 30 / 50 / 80 / 100px | Curated, not a mathematical scale. |

### Identity versus action colour

[Official reference](https://identity.stanford.edu/design-elements/color/primary-colors/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Cardinal red | #8c1515 | Primary identity colour. |
| Black / cool grey | #2e2d29 / #53565a | Primary neutral palette. |

### Web interactive palette

[Official reference](https://identity.stanford.edu/design-elements/color/web/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Digital red / dark | #b1040e / #820000 | Interactive treatment; not a replacement wordmark colour. |
| Digital blue / dark | #006cb8 / #00548f | Link treatment. |

## Decanter Design System A Tailwind preset, not an SDK

### Pin the documented generation route

The verified Decanter package is 7.5.3 and declares Tailwind CSS ^3.4.17. Its public entry is a Tailwind configuration preset. Add require("decanter") to presets, point content at actual source files and compile the utility stylesheet. There is no Decanter React provider to import.

The documentation includes upcoming v8 removals while still labelling the installation route v7. This reference pins v7.5.3 and avoids the deprecated foggy, slab and older modular-text utilities. The standalone preview is a clearly labelled interpretation of the layout rules, not a claimed Tailwind compilation.

[Supporting specification](https://decanter.stanford.edu/for-developers/installation)

## Decanter Design System Responsive modular typography

### A scale depends on its base

Source Sans 3 and Source Serif 4 are the primary sans and serif families, with Helvetica/Arial and Georgia/Times fallbacks. The type-* utilities are proportional roles rather than fixed pixel headings. Their scale multiplier is 1.15 on mobile, 1.2 on tablet and 1.25 on desktop.

The specimen chooses the documented basefont-23 configuration: 18px at XS–SM, 21px at MD–XL and 23px at 2XL. It uses a type-3-sized headline so the display remains proportionate in a compact embedded example. A project choosing a different base must recalculate the resulting sizes instead of copying this preview’s pixels.

[Supporting specification](https://decanter.stanford.edu/for-developers/strategies-and-conventions)

## Decanter Design System Fluid container and grid

### The screen edge is part of the layout

The cc container uses curated edge spacing: 20px at XS, 30px at SM, 50px at MD, 80px at LG and 100px at XL. It grows until reaching a 1500px content maximum at a 1700px viewport. This is a fluid system with explicit edge rules, not simply a fixed 1200px container.

The specimen follows those edges and changes its two editorial cards into a single column below MD. Card contents use ordinary document order, so keyboard navigation follows the same reading sequence when the layout stacks.

[Supporting specification](https://decanter.stanford.edu/for-developers/strategies-and-conventions)

## Decanter Design System Spacing that responds

### Use responsive utilities deliberately

Decanter supplies rs-m-* and rs-p-* families for responsive margin and padding. A selected step changes at its documented ranges; it is not a Tailwind fixed-space alias. The example code uses rs-p-1 around a card and ordinary fixed padding for its action.

To keep the reference reproducible, the standalone interpretation identifies every CSS adjustment as application code. For a native build, use the preset’s generated utility rather than defining a second competing rule with the same name. Avoid dynamic fragments such as "rs-p-" + size when the build scanner cannot see the complete class.

[Supporting specification](https://decanter.stanford.edu/for-developers/installation)

## Decanter Design System Identity and interactive colour

### Cardinal and digital red serve different roles

Stanford’s primary Cardinal red is #8c1515. Digital red #b1040e is an interactive/accent colour and does not replace Cardinal in the university identity. Digital blue #006cb8 is for links, with #00548f for its darker interaction state.

The specimen uses digital red for its expandable-detail action and restrained neutral surfaces. It does not include a Stanford wordmark, seal or official identity bar. An institutional deployment must use authorised identity assets and the university’s brand rules; a technical reference does not confer endorsement.

[Supporting specification](https://identity.stanford.edu/design-elements/color/web/)

## Decanter Design System Editorial cards with actions

### Compose content instead of guessing a component API

The official card examples are semantic HTML with utilities for spacing, type, surfaces and actions. Our composition keeps the event category separate from the title, shows its date and venue in text, and uses a real button to reveal an abstract in place. It does not invent a Decanter Card prop API.

A linked title would be appropriate when navigation is the actual result. Here the outcome is local expansion, so a button with aria-expanded and aria-controls communicates that behaviour. The preview uses original event names and abstracts rather than copying university news.

- Use the event title as the card heading.
- Keep time and location visible before expansion.
- Use a button for disclosure and an anchor only for real navigation.

[Supporting specification](https://decanter.stanford.edu/examples/cards)

## Decanter Design System Filters and disclosure

### Keep content available across layouts

The topic selector filters the two original research-event cards and updates a visible result count. The no-match option intentionally demonstrates an empty state and a reset path. The filter does not alter the heading hierarchy or convert cards into selectable form options.

Each abstract has its own button state. Closing a card leaves focus on the same trigger. Changing the filter closes hidden abstracts so returning to a topic starts from a consistent overview. The controls are application behaviour added to a utility-based design approach, not packaged Decanter JavaScript.

[Supporting specification](https://decanter.stanford.edu/examples/cards)

## Decanter Design System Build and validate the result

### Generated classes require scanned sources

The supplied setup targets Tailwind 3 and the verified Decanter 7.5.3 preset. It includes the input directives, content glob, output command and an original card composition. Link the resulting stylesheet from the document head. Load approved font files separately or intentionally retain the documented fallbacks.

The preview was not built through that toolchain and says so in its implementation label. A production adoption should compile its own complete class set and inspect the generated output, especially after a major-version upgrade changes deprecated utilities.

1. Pin Decanter and its compatible Tailwind major.
2. Register the preset and scan the real source directory.
3. Compile the three Tailwind directive layers.
4. Verify the chosen base font, screen edges and card actions at the documented breakpoints.

[Supporting specification](https://decanter.stanford.edu/for-developers/installation)

## Component Examples

### Original editorial card

Semantic HTML composed with verified utility families, with an application-owned disclosure button.

```html
<article class="bg-white border border-solid border-black-20 rs-p-1">
  <p class="font-semibold text-digital-red">Research conversation</p>
  <h2 class="type-2 font-serif leading-display">Reading the changing coast</h2>
  <p class="leading-normal">An original example event about field observations.</p>
  <button type="button" class="bg-digital-red text-white px-26 py-10
    hocus:bg-cardinal-red-dark focus:outline focus:outline-2">
    Show session details
  </button>
</article>
```

[Code reference](https://decanter.stanford.edu/examples/cards)

### Preset configuration

A complete minimal config for the pinned Tailwind 3 route.

```javascript
module.exports = {
  presets: [require('decanter')],
  content: ['./src/**/*.{html,js}']
};
```

[Code reference](https://decanter.stanford.edu/for-developers/installation)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Decanter editorial composition</title><style>*{box-sizing:border-box}body{margin:0;background:#f6f5f2;color:#2e2d29;font:18px/1.5 'Helvetica Neue',Helvetica,Arial,sans-serif}.cc{margin-inline:20px;max-width:1500px;padding-block:40px}h1{font-family:Georgia,serif;font-size:1.520875em;line-height:1.2;margin:24px 0}h2{font:700 1.3225em/1.25 Georgia,serif;margin:12px 0}p{margin:16px 0}.overline{letter-spacing:.12em;font-size:14px;font-weight:700}.filters{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding-block:24px;border-block:1px solid #c0c0bf;margin-block:32px}select{font:inherit;background:white;border:1px solid #767674;padding:8px}.cards{display:grid;grid-template-columns:1fr;gap:20px}article{background:white;padding:24px;border-top:4px solid #8c1515}article time{font-size:16px;color:#53565a}.topic{font-size:14px;font-weight:600;letter-spacing:.04em}.abstract{border-top:1px solid #d5d5d4;padding-top:16px}.action{font:600 16px/1.3 Arial,sans-serif;background:#b1040e;color:white;border:0;padding:12px 20px;cursor:pointer}.action:hover{background:#820000;text-decoration:underline}.reset{font:inherit;color:#006cb8;background:none;border:0;text-decoration:underline;padding:8px 0;cursor:pointer}:focus-visible{outline:3px solid #00548f;outline-offset:4px}small{display:block;font-size:14px;color:#53565a;margin-top:32px}[hidden]{display:none!important}@media(min-width:576px){.cc{margin-inline:30px}}@media(min-width:768px){body{font-size:21px}.cc{margin-inline:50px}h1{font-size:1.728em}h2{font-size:1.44em}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(min-width:992px){.cc{margin-inline:80px}.cards{gap:36px}h1{font-size:1.953125em}h2{font-size:1.5625em}}@media(min-width:1200px){.cc{margin-inline:100px}.cards{gap:40px}}@media(min-width:1500px){body{font-size:23px}.cards{gap:48px}}@media(min-width:1700px){.cc{margin-inline:auto}}
</style><main class="cc"><p class="overline">RESEARCH CONVERSATIONS · ORIGINAL EXAMPLES</p><h1>Ideas take shape in conversation.</h1><p>A compact editorial collection interpreting Decanter’s responsive type and screen-edge rules.</p><div class="filters"><label for="topic">Topic</label><select id="topic"><option value="all">All topics</option><option value="environment">Environment</option><option value="archives">Archives</option><option value="astronomy">Astronomy</option></select><span id="count" role="status">2 example events</span></div><div class="cards"><article data-topic="environment"><p class="topic">ENVIRONMENT</p><h2>Reading the changing coast</h2><time datetime="2026-10-12">12 October · Fictional seminar room</time><p>How field notes reveal changes that a single measurement cannot capture.</p><button class="action" type="button" aria-expanded="false" aria-controls="coast">Show session details</button><div class="abstract" id="coast" hidden><p>This original sample session compares written observations, sketches and repeat measurements. The conversation asks how researchers describe uncertainty when a landscape changes gradually.</p></div></article><article data-topic="archives"><p class="topic">ARCHIVES</p><h2>The stories between records</h2><time datetime="2026-10-19">19 October · Fictional reading room</time><p>Exploring how context connects objects in a community archive.</p><button class="action" type="button" aria-expanded="false" aria-controls="archive">Show session details</button><div class="abstract" id="archive" hidden><p>This original example considers correspondence, oral history and catalogue descriptions together. It examines how a collection can preserve disagreement without erasing individual perspectives.</p></div></article></div><div id="empty" hidden><h2>No events in this example topic</h2><p>Choose another topic or return to the full collection.</p><button type="button" class="reset" id="reset">Show all topics</button></div><small>Independent OpenDesign specimen. Original content, local font fallbacks and interpreted Decanter layout rules. No Stanford identity or real event listing.</small></main><script>const topic=document.querySelector('#topic'),cards=[...document.querySelectorAll('article')];function filter(){let count=0;cards.forEach(c=>{c.hidden=topic.value!=='all'&&topic.value!==c.dataset.topic;if(!c.hidden)count++;const b=c.querySelector('button');b.setAttribute('aria-expanded','false');b.textContent='Show session details';c.querySelector('.abstract').hidden=true});document.querySelector('#count').textContent=count+' example events';document.querySelector('#empty').hidden=count!==0}topic.onchange=filter;document.querySelector('#reset').onclick=()=>{topic.value='all';filter();topic.focus()};document.querySelectorAll('.action').forEach(b=>b.onclick=()=>{let open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.textContent=open?'Hide session details':'Show session details';document.getElementById(b.getAttribute('aria-controls')).hidden=!open});</script></html>

```

[Code reference](https://decanter.stanford.edu/for-developers/strategies-and-conventions)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

Source-verified preset build entry; not executed for the interpreted standalone preview. Link dist/styles.css in the document head. Fonts and institutional identity assets are separate decisions. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/stanford-decanter.html. Do not open module-based examples through file://.

```bash
npm install --save-dev decanter@7.5.3 tailwindcss@3.4.17
# tailwind.config.cjs
# module.exports = {
#   presets: [require('decanter')],
#   content: ['./src/**/*.{html,js}']
# };
# src/input.css
# @tailwind base;
# @tailwind components;
# @tailwind utilities;
npx tailwindcss -c tailwind.config.cjs -i ./src/input.css -o ./dist/styles.css
```

## Agent Prompt

Compose a Decanter 7.5.3/Tailwind 3 editorial event page. Use the preset, explicit basefont choice, type-* scale and cc screen edges. Keep topic, title, time and location distinct in semantic cards. Implement local topic filtering and aria-expanded abstract controls. Avoid deprecated foggy/slab utilities, copied university stories and identity marks. Label any manually interpreted preview separately from a compiled Decanter build.

## Sources

- [Decanter overview](https://decanter.stanford.edu/) — Official purpose, audiences and resource entry points.
- [Developer installation](https://decanter.stanford.edu/for-developers/installation) — Version-specific implementation and configuration guidance.
- [Designing in Figma](https://decanter.stanford.edu/for-designers/figma) — Official design-library entry.
- [Download complete working example](/assets/demos/stanford-decanter-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
