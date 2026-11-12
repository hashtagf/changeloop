# Volvo Cars Web Design System — OpenDesign Application Guide

Inspect Volvo Cars’ HTML-first web foundation, actual light-mode tokens and native selectable-card styling through a complete packing-plan example with independent choices, theme switching and reset.

An original OpenDesign packing study using @volvo-cars/css 2.5.1. It is not a vehicle configurator. Volvo font files are not bundled; native stylesheet fallbacks are used.

## Source Reference

- **CSS release:** 2.5.1 · matching selectable-card reference ([source](https://designsystem.volvocars.com/web/components/selectable-cards/))
- **Architecture:** Native HTML inputs and published CSS ([source](https://designsystem.volvocars.com/web/developing/getting-started/))
- **Reference:** 34 concrete token values ([source](https://designsystem.volvocars.com/web/developing/installation/))


## Design Reference

Actual public @volvo-cars/css 2.5.1 tokens, matched to the documented selectable-card markup. Default light values are shown; dark mode is supplied by the same stylesheet.

### Default light-mode roles

[Official reference](https://designsystem.volvocars.com/web/core-concepts/colors/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --v-color-foreground-primary | #000 | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-foreground-secondary | #5e5e5e | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-foreground-tertiary | #787878 | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-foreground-inverted | #fff | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-foreground-accent-blue | #0b2ded | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-background-primary | #fff | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-background-secondary | #fafafa | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-background-feedback-green | #d7f9df | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-background-feedback-red | #fce5e3 | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |
| --v-color-surface-gray | #e3e3e3 | First light-mode declarations from 2.5.1; the native dark theme overrides these role values. |

### Fixed spacing and shape

[Official reference](https://designsystem.volvocars.com/web/developing/installation/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --v-space-2 | .125rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-4 | .25rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-8 | .5rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-12 | .75rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-16 | 1rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-24 | 1.5rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-32 | 2rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-48 | 3rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-space-64 | 4rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-radius-sm | .25rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-radius-md | .5rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-radius-lg | 1rem | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |
| --v-radius-full | 9999px | Published fixed scale. Keep these separate from the fluid page-spacing tokens. |

### Text and border rules

[Official reference](https://designsystem.volvocars.com/web/developing/installation/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --v-font-sans-family | "Volvo Centum", "Helvetica Neue", "Helvetica", "Noto Sans", "Segoe UI", "Arial", sans-serif | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-regular-weight | 400 | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-emphasis-weight | 600 | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-14-size | .875rem | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-14-lineheight | 1.572 | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-16-size | 1rem | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-16-lineheight | 1.5 | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-20-size | 1.25rem | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-font-20-lineheight | 1.4 | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-border-width-default | 1px | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |
| --v-border-width-selected | 2px | Actual public 2.5.1 values. The example does not bundle Volvo font files and therefore uses the font stack fallback. |

## Volvo Cars Web Design System HTML-First Foundation and Version Choice

### Pin the stylesheet that matches the pattern

The example uses @volvo-cars/css 2.5.1, matching the selectable-card reference used for the implementation. Version 3 has a different contract, so installing the latest package without checking markup can leave a pattern incomplete. The version belongs in the setup as well as the guide: a component class is not a guarantee that every release styles it in the same way.

### Use the public web layer deliberately

This study imports the public web tokens and all-media stylesheet directly. It does not depend on the separate internal EDLS package. The application remains plain HTML with a small amount of JavaScript for its checklist. The installed CSS handles selectable-card appearance, control styling and color-mode roles; the app supplies the content and state.

## Volvo Cars Web Design System Neutral Roles, Type and Spacing

### Keep the light and dark roles connected

The table records the default light declarations, while data-color-mode selects the corresponding native dark values. The composition uses background and foreground roles instead of hard-coding white text onto every card. A theme switch should preserve the selected plan and extras; changing the palette is independent of changing the checklist.

### Distinguish fixed steps from fluid page rhythm

Fixed spacing values run from 2px through 64px in the selected reference. Other public page tokens use clamp and round, so they respond with the viewport. The example’s two-column composition and 40px gap are original layout choices around the native cards. The published font stack is retained, but Volvo font assets are not bundled; rendering uses the available system fallback.

## Volvo Cars Web Design System Selectable Card Semantics

### Use radio inputs for one plan

The two plan cards contain native radios with the same name inside a fieldset with a legend. Each card is a label with title, meta and description slots. Clicking the card selects its radio, and ordinary radio keyboard behavior remains available. A selected plan is therefore actual form state rather than a decorative border managed separately.

### Use checkboxes for independent additions

Water and an extra layer can be selected independently, so they use checkboxes. The cards contain no nested links or buttons: an interactive element inside a label would create conflicting activation behavior. The summary actions sit outside the cards. The published React forms layer is an alternative when the design genuinely needs more complex interactive card content.

- Keep a radio group within one fieldset and legend.
- Use checkboxes for independent additions.
- Keep links and buttons outside a CSS-only label card.

## Volvo Cars Web Design System Derived Checklist and Confirmation

### Derive the summary from the same controls

The summary combines the chosen plan’s base items with the selected extras. Changing a radio updates its title and base items while retaining independent extras. The count is derived from the resulting list. All sample packing content is original and deliberately avoids vehicle specifications, prices or claims about an actual Volvo purchase configuration.

### Clear stale confirmation when choices change

Keep this plan displays a local confirmation. Any subsequent plan or extra change hides that message so it cannot imply that the new combination was already kept. The action does not write to an account, purchase anything or submit data. The visible note and the source describe this limited in-page behavior consistently.

## Volvo Cars Web Design System Color Mode and Responsive Composition

### Keep theme separate from checklist state

The color-mode select changes data-color-mode on the document. It does not recreate the radios, checkboxes or summary. The native stylesheet transitions some surfaces, so visual verification should inspect the settled theme rather than a screenshot captured halfway through the change. Text, control state and surface contrast should be checked together.

### Stack the reading order at narrow widths

The packing choices precede the summary in document order. At phone widths the two-column grid becomes a single column, preserving that order and every action. Fieldsets have min-width:0 so their default sizing cannot force horizontal overflow. Long card content wraps within the selected-card layout rather than escaping the parent.

## Volvo Cars Web Design System Complete Source and Local Verification

### Run the two source files with the matching package

The JavaScript includes the complete original content and all interaction handlers. The CSS contains only application composition plus a local checkbox checkmark fallback. Use the supplied HTML shell, save the two source files and install the pinned CSS release. Importing the stylesheet alone would style controls but would not implement checklist counts or local confirmation.

1. Create the vanilla app and install @volvo-cars/css 2.5.1.
2. Save main.js, volvo.css and the supplied root HTML shell.
3. Run the app and compare radio and checkbox behavior.
4. Inspect settled light and dark themes and the reset state.

### Check choice, theme and recovery together

Choose the coastal plan, add water and confirm that four items appear. Keep the plan, add a layer and check the old confirmation disappears. Switch to dark mode without losing the choices, then reset to the first plan with no extras. Verify keyboard radio selection and narrow-screen wrapping, and inspect the settled light and dark surfaces.

## Component Examples

### main.js — complete plan selection

All choices, derived summary, local confirmation, theme and reset.

```javascript
import '@volvo-cars/css/tokens.css';
import '@volvo-cars/css/styles_all-media.css';
import './volvo.css';
document.querySelector('#root').innerHTML=`<main><header><p class="eyebrow">OpenDesign · Original planning study</p><h1>A little room for the weekend.</h1><p class="intro">Build a simple packing plan with selectable cards. These sample choices are not vehicle options or product specifications.</p><label class="mode">Color mode <select id="mode"><option value="light">Light</option><option value="dark">Dark</option></select></label></header><div class="composition"><div><fieldset class="stack-16"><legend>Choose your plan</legend><label class="selectable-card"><input type="radio" name="plan" value="city" checked><span slot="title">A day in the city</span><span slot="meta">Travel light</span><span slot="description">Space for a day bag and the things you use most.</span></label><label class="selectable-card"><input type="radio" name="plan" value="coast"><span slot="title">A quiet coastal break</span><span slot="meta">Stay a little longer</span><span slot="description">Bring layers, a weekend bag and time to pause.</span></label></fieldset><fieldset class="stack-16 extras"><legend>Add to your checklist</legend><label class="selectable-card"><input type="checkbox" value="water"><span slot="title">Water and a reusable cup</span><span slot="description">Keep everyday essentials close at hand.</span></label><label class="selectable-card"><input type="checkbox" value="layers"><span slot="title">An extra layer</span><span slot="description">Prepare for a change in the weather.</span></label></fieldset></div><aside class="summary bg-secondary p-24 shape-default"><p class="eyebrow">Your local checklist</p><h2 id="plan-title">A day in the city</h2><ul id="items"></ul><p id="count" role="status"></p><button type="button" class="button-filled" id="save">Keep this plan</button><button type="button" class="button-text" id="reset">Start again</button><p id="saved" role="status" hidden></p></aside></div><p class="note">Published Volvo Cars CSS 2.5.1 selectable-card styling with original packing content and local behavior. The preview uses the stylesheet’s system-font fallback; Volvo font assets are not bundled. Nothing is booked, purchased or sent.</p></main>`;
const plans={city:{title:'A day in the city',items:['Day bag','Comfortable shoes']},coast:{title:'A quiet coastal break',items:['Weekend bag','Route notes','A good book']}};const extras={water:'Water and a reusable cup',layers:'An extra layer'};let current='city';
function render(){current=document.querySelector('[name=plan]:checked').value;let list=[...plans[current].items,...[...document.querySelectorAll('.extras input:checked')].map(e=>extras[e.value])];document.querySelector('#plan-title').textContent=plans[current].title;const ul=document.querySelector('#items');ul.replaceChildren(...list.map(x=>{let li=document.createElement('li');li.textContent=x;return li}));document.querySelector('#count').textContent=`${list.length} things on your checklist`;document.querySelector('#saved').hidden=true;}
document.querySelectorAll('fieldset input').forEach(e=>e.addEventListener('change',render));document.querySelector('#mode').addEventListener('change',e=>document.documentElement.dataset.colorMode=e.target.value);document.querySelector('#save').addEventListener('click',()=>{let p=document.querySelector('#saved');p.hidden=false;p.textContent='Plan kept in this page. Changing a choice will clear this confirmation.';});document.querySelector('#reset').addEventListener('click',()=>{document.querySelector('[value=city]').checked=true;document.querySelectorAll('.extras input').forEach(e=>e.checked=false);render();document.querySelector('[value=city]').focus();});render();

```

[Code reference](https://designsystem.volvocars.com/web/components/selectable-cards/)

- Uses the same-name radio and label-slot pattern from the pinned stylesheet.

### volvo.css — original composition

Responsive arrangement and local checkbox checkmark fallback.

```css
html{color-scheme:light}html[data-color-mode=dark]{color-scheme:dark}body{margin:0}main{max-width:1100px;padding:32px;margin:auto}header{padding:16px 0 40px}.eyebrow{font-size:12px;letter-spacing:.06em}.intro{max-width:60ch;margin-top:24px}.mode{display:flex;align-items:center;gap:16px;margin-top:24px}.mode select{max-width:180px}.composition{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(240px,1fr);gap:40px}fieldset{min-width:0;border:0;padding:0;margin:0}legend{font-size:20px;margin-bottom:16px}.extras{margin-top:32px}.summary{align-self:start}#items{padding-left:20px;margin:24px 0}#items li{margin:8px 0}.summary button{display:block;width:100%;margin-top:16px}.note{font-size:14px;color:var(--v-color-foreground-secondary);border-top:1px solid var(--v-color-surface-gray);padding-top:24px;margin-top:40px;max-width:80ch}#saved{margin-top:24px}.selectable-card input[type=checkbox]:checked:before{background-image:none!important;content:'✓';color:var(--v-color-foreground-inverted);display:grid;place-items:center}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.composition{grid-template-columns:1fr;gap:32px}.selectable-card{overflow-wrap:anywhere}.eyebrow{overflow-wrap:anywhere}}

```

[Code reference](https://designsystem.volvocars.com/web/components/selectable-cards/)

- The layout is original; card styling comes from the installed public CSS.

### index.html — root shell

Complete root and module entry.

```html
<!doctype html>
<html lang="en" data-color-mode="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Weekend packing study</title></head><body><div id="root"></div><script type="module" src="/src/main.js"></script></body></html>
```

[Code reference](https://designsystem.volvocars.com/web/components/selectable-cards/)

- Replace the root Vite index.html with this file.

## Implementation Starting Point

The pinned version matches this selectable-card implementation. Official font assets are not bundled into the preview.

```sh
npm create vite@latest weekend-plan -- --template vanilla
cd weekend-plan
npm install
npm install @volvo-cars/css@2.5.1
# Save index.html at the root; main.js and volvo.css in src.
npm run dev
```

## Agent Prompt

Build the original weekend packing study using Volvo Cars CSS 2.5.1 and the supplied complete source. Use native label-based selectable cards, a fieldset radio group, independent checkbox extras, derived counts, stale-confirmation clearing and theme state independent of choices. Keep all sample content distinct from real vehicle specifications.

## Sources

- [Selectable cards](https://designsystem.volvocars.com/web/components/selectable-cards/) — Label slots, radio grouping and interactive-content limits.
- [Installation](https://designsystem.volvocars.com/web/developing/installation/) — Public web CSS and separate internal EDLS boundaries.
- [Getting started](https://designsystem.volvocars.com/web/developing/getting-started/) — HTML-first foundations and optional React layers.
- [Colors](https://designsystem.volvocars.com/web/core-concepts/colors/) — Color-role and theme relationships.
