# Dell Design System — OpenDesign Application Guide

Build a scoped device search with DDS v3: semantic colors, a responsive typography ramp, token spacing, and an InputGroup composition whose filtering behavior belongs to the application.

Independent DDS v3 reference. The internal package requires Dell registry access; the public versioned CDN is documented for prototyping. No Dell identity, asset management connection or official certification is implied.

## Source Reference

- **Implementation version:** Vanilla 3.2.0 ([source](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs))
- **Package access:** @dds/components is hosted on Dell internal Artifactory ([source](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs))
- **Public prototype option:** Versioned CSS and ES-module CDN ([source](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs))
- **Search architecture:** InputGroup composition; no standalone Search API ([source](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs))
- **Typography boundary:** Default ≥1024px; compact <1024px ([source](https://www.delldesignsystem.com/foundations/typography/))
- **Spacing range:** 4–96px semantic scale ([source](https://www.delldesignsystem.com/foundations/spacing))
- **Font guidance:** Roboto for Dell.com; Arial for everyday work ([source](https://www.delldesignsystem.com/partners/brand))


## Design Reference

DDS v3 foundations and the verified Vanilla 3.2.0 Storybook. Color values are the light-mode previews in the Text Input token table, not a universal theme. Preview uses these rules in independent HTML/CSS; the code example loads the real versioned DDS CDN.

### Spacing

[Official reference](https://www.delldesignsystem.com/foundations/spacing)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --dds-spacing-xs | 4px / 0.25rem | Icon-label proximity. |
| --dds-spacing-sm | 8px / 0.5rem | Adjacent search actions. |
| --dds-spacing-md | 12px / 0.75rem | Compact object rows. |
| --dds-spacing-lg | 16px / 1rem | Result content padding. |
| --dds-spacing-xl | 24px / 1.5rem | Search-to-results separation. |
| --dds-spacing-2xl | 32px / 2rem | Main page inset. |
| --dds-spacing-3xl | 40px / 2.5rem | Section spacing. |
| --dds-spacing-4xl | 48px / 3rem | Major section boundary. |
| --dds-spacing-5xl | 64px / 4rem | Large layout separation. |
| --dds-spacing-6xl | 80px / 5rem | Spacious composition. |
| --dds-spacing-7xl | 96px / 6rem | Largest listed spacing step. |

### Light-mode semantic color examples

[Official reference](https://www.delldesignsystem.com/components/text-input/?tab=Design)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --dds-color-text-primary | #1D2C3B | Primary result labels. |
| --dds-color-background-surface-secondary | #EBF1F6 | Secondary content surface. |
| --dds-color-border-brand-base | #00468B | Brand input border. |
| --dds-color-background-surface-inactive | #E1E1E1 | Inactive field surface. |
| --dds-color-border-inactive-base | #7E7E7E | Inactive boundary. |
| --dds-color-text-inactive | #B6B6B6 | Inactive label; not body copy. |

### Type ramp selected roles

[Official reference](https://www.delldesignsystem.com/foundations/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Display 1 ≥1024px | 72px / 88px; weight 300 | Large editorial title, not a dense result list. |
| Heading 1 ≥1024px | 48px / 56px; weight 300 | Wide page title. |
| Heading 1 <1024px | 40px / 48px; weight 300 | Compact page title. |
| Heading 4 ≥1024px | 24px / 32px; weight 400 | Section title. |
| Heading 4 <1024px | 20px / 28px; weight 400 | Compact section title. |
| Body 2 | 16px / 24px; weight 400 | Default paragraph role. |
| Body 3 | 14px / 20px; weight 400 | Dense metadata. |
| Caption | 12px / 20px; weight 400 | Field helper content. |
| Button 1 | 16px / 24px; weight 500 | Default action label. |

### Search composition

[Official reference](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| InputGroup(element) | Initializer exported by @dds/components | Initialize the group wrapper after it exists. |
| dds__input-group | Input and addon wrapper | Keep leading and trailing slots adjacent to input. |
| dds__text-input | Native input class | Application owns query and results. |
| dds__input-addon | Accessory wrapper | Decorative leading icon or clear action. |
| dds__button--ghost | Low-emphasis button modifier | Search/clear examples use this variant. |
| dds__button--icon-only | Icon-only button modifier | Still supply aria-label on the button. |

### Style loading

[Official reference](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| dds-styles.css | All-in-one starter | Includes component styles, tokens, fonts and helper bundles. |
| dds-tokens.css | Global and semantic tokens | Does not include component tokens. |
| dds-components.css | All component styles and component tokens | Required alongside tokens and fonts for separated bundle approach. |
| dds-fonts.css | CDN font definitions | Include for DDS font rendering. |
| dds-grid.css | Grid classes | Separate layout bundle. |
| dds-icons.css | Icon classes | Does not alone fetch icon font; consult icon setup. |

## Dell Design System DDS v3 and its implementation boundary

### A composition, not a search service

DDS separates reusable visual foundations from product behavior. The useful integration point for this inventory is InputGroup: a native input with accessory slots. There is no Search constructor to invoke, and the design system does not fetch devices. Our application keeps draft input, the applied query and selected device as separate values. This makes the difference between typing and submitting visible.

[Supporting specification](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs)

### Choose one version

The public developer example below targets Vanilla 3.2.0. Its CSS and JavaScript share that version. Existing v2 integrations use different packaging and should follow the migration documentation before adopting these imports. The current package is internal to Dell; the documented CDN offers a concrete way to evaluate this composition without inventing a public npm registry.

[Supporting specification](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs)

## Dell Design System Semantic surfaces and boundaries

### Use the published role names

The reference table records light-mode input values from the official component documentation. Product code should consume semantic CSS variables after loading DDS styles. Primary text and the secondary surface form the readable result area; brand border identifies the input boundary. Inactive foreground is intentionally subdued and must not become the default metadata color.

[Supporting specification](https://www.delldesignsystem.com/components/text-input/?tab=Design)

### Do not redefine DDS tokens

Global color primitives feed semantic roles, which in turn support component-specific decisions. Application authors should reference semantic roles instead of overriding the global scale. A dark appearance requires an actual supported token mode; changing only the page background leaves field, label and focus colors inconsistent. The local specimen remains light mode.

[Supporting specification](https://www.delldesignsystem.com/getting-started/tokens)

## Dell Design System Responsive type without changing document structure

### One semantic heading, two visual sizes

The page heading remains h1 on every viewport. It uses the documented Heading 1 sizes of 48/56 on wide layouts and 40/48 below 1024px. The specimen uses system fallback fonts because it is an independent local interpretation; the native stylesheet supplies DDS font resources. Body 2 handles descriptions, while Body 3 provides compact device metadata.

[Supporting specification](https://www.delldesignsystem.com/foundations/typography/)

### Leave room for real names

A device model, office name or support status can wrap. Keep identifiers readable and do not truncate the only copy of an asset tag. A compact layout changes the visual hierarchy and column arrangement, while maintaining the same label-to-value association.

[Supporting specification](https://www.delldesignsystem.com/foundations/typography/)

## Dell Design System A four-pixel rhythm for a split view

### Assign scale steps to relationships

Use sm between related actions, lg inside result rows and xl between the query and the result region. The outer shell can use 2xl on wider screens. These are application assignments of the published scale, not official prescriptions that every search page needs those exact insets.

[Supporting specification](https://www.delldesignsystem.com/foundations/spacing)

### Density and reflow

DDS describes compact, default and comfortable grids. This example keeps the search controls comfortable while allowing compact metadata inside each result. On narrow screens the selected-device panel follows the result list, preserving reading order. The detail panel is not fixed and cannot obscure the final result.

- Keep search label and helper above the field at all widths.
- Let the submit action move below the field when the row cannot fit.
- Move the selected-device details below the results rather than creating horizontal scrolling.

[Supporting specification](https://www.delldesignsystem.com/foundations/grid)

## Dell Design System Search anatomy and behavior

### Manual submission is intentional

The leading search symbol is decorative; the visible label defines the inventory scope. The trailing clear control appears only when input exists. Our manual mode submits through the form, so Enter and the visible Search devices button have the same effect. Changing the input alone leaves the applied result set intact.

[Supporting specification](https://www.delldesignsystem.com/components/search)

### Automatic is a different contract

DDS also describes an automatic mode beginning after the fourth entered character. Do not attach immediate one-character filtering to a UI documented as that mode. If switching to automatic search, remove the manual submit button and implement the threshold, cancellation and result announcement deliberately. The supplied example chooses manual mode.

[Supporting specification](https://www.delldesignsystem.com/components/search)

## Dell Design System Draft, applied query and selection

### State transitions in the specimen

Clear resets both the input and the applied filter, restores the full sample inventory and returns focus to the field. Selection is a separate button action: it reveals the asset details without modifying the query. A zero-result state displays the applied phrase and an explicit reset route. It never claims that a remote inventory was searched.

1. Enter an asset name or tag; the current results remain until submission.
2. Submit the form and update the result count from the filtered local array.
3. Inspect a result or clear the query; keep focus on the initiating control.

[Supporting specification](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs)

## Dell Design System Labels, landmarks and announcements

### Expose the actual scope

The form is a search landmark named Device inventory. A persistent label and helper text remain visible when typing. The clear icon is a button with aria-label, not a span with a click handler. Decorative symbols are hidden from assistive technology. The result count is a polite status message; it changes after submission rather than announcing every keystroke.

[Supporting specification](https://www.delldesignsystem.com/components/search)

### Selection is not navigation

Each result uses a real button with a pressed state and a full accessible name. The detail heading identifies the inspected item. No link pretends to open a device management page, because this specimen has no management backend. The current selection is visible with a border as well as a text label.

[Supporting specification](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs)

## Dell Design System Load real assets and initialize the group

### Start with the documented bundle

For an authorized internal application, install @dds/components from Dell Artifactory and import its dds-styles.css through the project stylesheet pipeline. For a standalone proof of concept, use the pinned public CDN links shown below. Initialize InputGroup after the markup exists. Event handlers for submission, clearing and filtering remain application code.

[Supporting specification](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs)

### Optimize after the composition works

The full stylesheet is the straightforward starting point. A selective integration needs global/semantic tokens and fonts plus each used component stylesheet. Tokens alone omit component tokens, and icon classes alone do not load the font. Removing those supporting bundles can yield apparently present but visually incomplete controls.

[Supporting specification](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs)

## Dell Design System Exercise the search contract

### A useful local test

Type Latitude without submitting and verify that the old result count persists. Submit and inspect the matching device. Search for a missing tag, verify the empty state, then clear and confirm that all sample devices return. Repeat with keyboard input and at narrow width. These checks validate this example; they do not certify a downstream Dell product or network integration.

[Supporting specification](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent HTML/CSS interpretation of DDS v3 spacing, type and documented light input colors; system fallback font.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Device inventory — DDS v3 study</title><style>*{box-sizing:border-box}body{margin:0;font:16px/24px Arial,sans-serif;color:#1d2c3b;background:white}header{padding:16px 32px;border-bottom:1px solid #c5d4e3;color:#00468b}main{padding:32px;max-width:1200px;margin:auto}h1{font-size:48px;line-height:56px;font-weight:300;margin:16px 0}h2{font-size:24px;line-height:32px;font-weight:400}label{display:block;font-weight:bold;margin-bottom:8px}.search{display:flex;gap:8px;align-items:stretch}.input{border:1px solid #00468b;display:flex;align-items:center;flex:1;min-width:0}.input span{padding:8px 12px}input{border:0;padding:12px 0;width:100%;min-width:0;font:inherit;background:transparent;color:inherit}button{font:inherit;cursor:pointer;padding:8px 16px;background:white;color:#00468b;border:1px solid #00468b}button:hover{background:#ebf1f6}button:focus-visible,input:focus-visible{outline:3px solid #00468b;outline-offset:3px}.input button{border:0}.submit{background:#00468b;color:white}.submit:hover{background:#003567}.helper{font-size:14px;line-height:20px;color:#516478}.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:32px;margin-top:24px}.result{display:flex;text-align:left;align-items:center;gap:16px;width:100%;padding:16px;margin-bottom:12px;border:1px solid #c5d4e3;color:#1d2c3b}.result[aria-pressed=true]{border:2px solid #00468b;padding:15px;background:#ebf1f6}.result strong{display:block}.result small{display:block;font-size:14px}.device{width:64px;height:40px;border:3px solid #516478;border-radius:3px;background:linear-gradient(140deg,#dcebf6,#86afce);position:relative;flex-shrink:0}.device:after{content:'';position:absolute;bottom:-8px;left:-7px;right:-7px;height:4px;background:#516478;border-radius:0 0 4px 4px}.device.desktop{width:28px;height:48px;background:#c5d4e3;margin:0 18px}.device.desktop:after{display:none}aside{background:#ebf1f6;padding:24px;align-self:start}aside h2{margin-top:0}dt{font-size:12px;color:#516478;margin-top:16px}dd{margin:4px 0 0}footer{padding:16px 32px;border-top:1px solid #c5d4e3;font-size:12px;line-height:20px;color:#516478}#empty{padding:24px;background:#ebf1f6}#count{font-size:14px;margin:24px 0 0}@media(max-width:1023px){h1{font-size:40px;line-height:48px}}@media(max-width:650px){main{padding:16px}.layout{grid-template-columns:1fr}.search{flex-wrap:wrap}.input{flex-basis:100%}.submit{width:100%}header,footer{padding:16px}}</style><header>DEVICE OPERATIONS <span style="float:right;font-size:12px">Local sample inventory</span></header><main><h1>Find a device</h1><p>Review model, location and support coverage in one place.</p><form role="search" aria-label="Device inventory" id="form"><label for="query">Search devices</label><p class="helper" id="help">Enter a model or asset tag. Results change after you submit.</p><div class="search"><div class="input"><span aria-hidden="true">⌕</span><input id="query" type="search" aria-describedby="help"><button type="button" id="clear" hidden aria-label="Clear device search">Clear</button></div><button class="submit" type="submit">Search devices</button></div></form><p id="count" role="status"></p><div class="layout"><section aria-label="Matching devices"><div id="results"></div><div id="empty" hidden>No devices match this query. Clear the search to view the sample inventory.</div></section><aside aria-label="Device details"><span class="helper">SELECTED DEVICE</span><h2 id="name"></h2><dl><dt>Asset tag</dt><dd id="tag"></dd><dt>Location</dt><dd id="location"></dd><dt>Support coverage</dt><dd id="coverage"></dd><dt>Record source</dt><dd>Local demonstration data</dd></dl></aside></div></main><footer>Independent HTML/CSS interpretation of DDS v3. Published light-mode colors, spacing and type sizes; system fallback font. No Dell services are connected.</footer><script>
const devices=[{name:'Latitude 7450',tag:'LT-104',location:'London · Design studio',coverage:'Through 30 June 2027',kind:'laptop'},{name:'Precision 5680',tag:'PR-208',location:'Berlin · Engineering lab',coverage:'Through 15 March 2028',kind:'laptop'},{name:'OptiPlex 7020',tag:'OP-316',location:'Amsterdam · Front desk',coverage:'Through 20 August 2027',kind:'desktop'}];let selected=devices[0],applied='';const $=id=>document.getElementById(id);function render(){const matches=devices.filter(d=>(d.name+' '+d.tag).toLowerCase().includes(applied.toLowerCase()));$('count').textContent=matches.length+' matching device'+(matches.length===1?'':'s')+(applied?' for “'+applied+'”':'');$('results').replaceChildren();$('empty').hidden=matches.length>0;for(const d of matches){const b=document.createElement('button');b.className='result';b.setAttribute('aria-pressed',String(d===selected));const pic=document.createElement('span');pic.className='device '+d.kind;pic.setAttribute('aria-hidden','true');const label=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=d.name;small.textContent=d.tag+' · '+d.location.split(' · ')[0];label.append(strong,small);b.append(pic,label);b.onclick=()=>{selected=d;render()};$('results').append(b)}for(const key of ['name','tag','location','coverage'])$(key).textContent=selected[key]}
$('form').onsubmit=e=>{e.preventDefault();applied=$('query').value.trim();render()};$('query').oninput=()=>{$('clear').hidden=!$('query').value};$('clear').onclick=()=>{$('query').value='';applied='';$('clear').hidden=true;render();$('query').focus()};render();
</script></html>

```

[Code reference](https://www.delldesignsystem.com/components/search)

- This document supplies its own search behavior. Use the native DDS example to check InputGroup initialization against the pinned stylesheet and script.

### Complete native implementation entry

The complete implementation from setup, collected here alongside the focused API explanations. Follow the documented package and build prerequisites in setup.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" crossorigin href="https://dds.dell.com/components/3.2.0/css/dds-styles.css">
<title>Local device search</title>
<main style="padding:24px;max-width:720px;margin:auto">
<h1>Find a device</h1>
<form role="search" aria-label="Device inventory" id="search-form">
<label for="query">Search devices</label>
<p id="help">Enter a model or asset tag, then submit.</p>
<div class="dds__input-group" id="device-search">
<div class="dds__input-addon" aria-hidden="true">⌕</div>
<input id="query" class="dds__text-input" type="search" aria-describedby="help">
<div class="dds__input-addon"><button class="dds__button dds__button--ghost dds__button--xs" type="button" id="clear" hidden aria-label="Clear device search">Clear</button></div>
</div>
<button class="dds__button dds__button--ghost dds__button--md" type="submit">Search devices</button>
</form>
<p id="count" role="status"></p><ul id="results"></ul>
</main>
<script type="module">
import { InputGroup } from 'https://dds.dell.com/components/3.2.0/js/index.mjs';
InputGroup(document.querySelector('#device-search'));
const inventory=['Latitude 7450 · LT-104','Precision 5680 · PR-208','OptiPlex 7020 · OP-316'];
const input=document.querySelector('#query'), clear=document.querySelector('#clear');
function render(query='') {
 const matches=inventory.filter(x=>x.toLowerCase().includes(query.toLowerCase()));
 document.querySelector('#results').replaceChildren(...matches.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
 document.querySelector('#count').textContent=matches.length+' matching devices';
}
input.addEventListener('input',()=>{clear.hidden=!input.value.length});
document.querySelector('#search-form').addEventListener('submit',event=>{event.preventDefault();render(input.value.trim())});
clear.addEventListener('click',()=>{input.value='';clear.hidden=true;render();input.focus()});
render();
</script></html>
```

[Code reference](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs)

- Save as index.html and serve locally with network access to the documented DDS 3.2.0 CDN. This uses real InputGroup initialization and local filtering; no Dell backend. Internal npm alternative: npm install @dds/components --registry=https://artifacts.dell.com/artifactory/api/npm/dx-npm-prod/ . The embedded preview is an offline HTML/CSS interpretation, not this CDN runtime.

### InputGroup with application-owned search

The setup composes native input and addons, initializes InputGroup and wires a real form submission. The leading symbol is a local decorative character; no icon font dependency is implied.

```javascript
import { InputGroup } from '@dds/components';
InputGroup(document.querySelector('#device-search'));
// Use the complete form and event handlers in the setup example.
```

[Code reference](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs)

- There is no standalone Search API in the verified v3 documentation.
- Use aria-label on icon-only buttons; the application supplies filtering.

## Implementation Starting Point

Save as index.html and serve locally with network access to the documented DDS 3.2.0 CDN. This uses real InputGroup initialization and local filtering; no Dell backend. Internal npm alternative: npm install @dds/components --registry=https://artifacts.dell.com/artifactory/api/npm/dx-npm-prod/ . The embedded preview is an offline HTML/CSS interpretation, not this CDN runtime.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" crossorigin href="https://dds.dell.com/components/3.2.0/css/dds-styles.css">
<title>Local device search</title>
<main style="padding:24px;max-width:720px;margin:auto">
<h1>Find a device</h1>
<form role="search" aria-label="Device inventory" id="search-form">
<label for="query">Search devices</label>
<p id="help">Enter a model or asset tag, then submit.</p>
<div class="dds__input-group" id="device-search">
<div class="dds__input-addon" aria-hidden="true">⌕</div>
<input id="query" class="dds__text-input" type="search" aria-describedby="help">
<div class="dds__input-addon"><button class="dds__button dds__button--ghost dds__button--xs" type="button" id="clear" hidden aria-label="Clear device search">Clear</button></div>
</div>
<button class="dds__button dds__button--ghost dds__button--md" type="submit">Search devices</button>
</form>
<p id="count" role="status"></p><ul id="results"></ul>
</main>
<script type="module">
import { InputGroup } from 'https://dds.dell.com/components/3.2.0/js/index.mjs';
InputGroup(document.querySelector('#device-search'));
const inventory=['Latitude 7450 · LT-104','Precision 5680 · PR-208','OptiPlex 7020 · OP-316'];
const input=document.querySelector('#query'), clear=document.querySelector('#clear');
function render(query='') {
 const matches=inventory.filter(x=>x.toLowerCase().includes(query.toLowerCase()));
 document.querySelector('#results').replaceChildren(...matches.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
 document.querySelector('#count').textContent=matches.length+' matching devices';
}
input.addEventListener('input',()=>{clear.hidden=!input.value.length});
document.querySelector('#search-form').addEventListener('submit',event=>{event.preventDefault();render(input.value.trim())});
clear.addEventListener('click',()=>{input.value='';clear.hidden=true;render();input.focus()});
render();
</script></html>
```

## Agent Prompt

Build a scoped device inventory search using the complete DDS 3.2.0 InputGroup composition. Preserve manual submission, a visible scope label, local result announcement and clear behavior. Consume DDS semantic tokens and responsive type; do not invent a Search API or substitute legacy v2 imports.

## Sources

- [DDS 3.2.0 installation](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=getting-started-installation--docs&viewMode=docs) — Internal package access, public prototype CDN, and required style bundles.
- [Search implementation](https://vanilla.delldesignsystem.com/3.2.0/iframe.html?id=components-search--docs&viewMode=docs) — Search is composed from InputGroup; no standalone Search API.
- [Search design](https://www.delldesignsystem.com/components/search) — Manual and automatic search behavior, scope labels and landmarks.
- [Spacing](https://www.delldesignsystem.com/foundations/spacing) — Eleven semantic spacing steps.
- [Typography](https://www.delldesignsystem.com/foundations/typography/) — Default and compact ramps.
- [Input tokens](https://www.delldesignsystem.com/components/text-input/?tab=Design) — Documented semantic colors used by input fields.
- [Token architecture](https://www.delldesignsystem.com/getting-started/tokens) — Global, semantic and component token boundaries.
- [Grid](https://www.delldesignsystem.com/foundations/grid) — Density and four-pixel rhythm.
