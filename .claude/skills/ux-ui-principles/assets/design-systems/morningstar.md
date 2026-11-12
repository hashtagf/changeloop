# Morningstar Design System — OpenDesign Application Guide

Build a research interface where numbers align, asset colors keep their meaning and typography remains readable. Explore MDS constants, Vue 3 adoption, the Morningstar Intrinsic transition and a sortable fictional allocation notebook.

Independent OpenDesign guide. Allocation examples are fictional and are not financial advice. Historical numeric constants are labeled by their source version; current package and font access remains controlled by Morningstar.

## Source Reference

- **Distribution:** Internal Artifacts registry ([source](https://designsystem.morningstar.com/getting-started/for-engineers/?tab=vue-3))
- **UI / chart packages:** @mds and @mce ([source](https://designsystem.morningstar.com/getting-started/for-engineers/?tab=vue-3))
- **Current font transition:** Morningstar Intrinsic, announced February 2025 ([source](https://designsystem.morningstar.com/whats-new/blog/introducing-morningstar-intrinsic/))
- **Intrinsic weights:** Regular and Bold ([source](https://designsystem.morningstar.com/whats-new/blog/introducing-morningstar-intrinsic/))
- **Table structure:** Composable elements and Vue slots ([source](https://designsystem.morningstar.com/components/how-to-use-data-tables/?tab=examples))
- **IP icons:** Reserved for their established Morningstar meanings ([source](https://designsystem.morningstar.com/ui-elements-docs/icon-vue3/2.0.0/index.html))


## Design Reference

Current Vue 3 adoption and 2025 Intrinsic guidance, with explicitly versioned public constants references. Legacy v2.37 numeric values are historical reference only, not claims about the current Vue 3 package. The specimen uses those cited historic chart colors and its own application layout.

### Current adoption boundary

[Official reference](https://designsystem.morningstar.com/getting-started/for-engineers/?tab=vue-3)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| UI scope | @mds | Individually versioned components. |
| Chart scope | @mce | Separately scoped chart elements. |
| Vue 3 packages | -vue3 suffix | Use the matching library generation. |
| Registry | artifacts.morningstar.com/repository/npm-prod-group/ | Internal access required. |
| Sass | Dart Sass / sass package | Compile supplied component styles. |
| CSS Modules | [local]___researchNotebook | Example application namespace, not an official required suffix. |

### Intrinsic transition

[Official reference](https://designsystem.morningstar.com/whats-new/blog/introducing-morningstar-intrinsic/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Typeface | Morningstar Intrinsic | Approved assets must be obtained separately. |
| Weights | Regular and Bold | Current supported weight families. |
| Thin / Light / Regular | Map to Intrinsic Regular | Old weight names do not imply three new font files. |
| Bold / Heavy | Map to Intrinsic Bold | Keep emphasis intentional. |
| Vue 3 typography | @mds/typography-vue3 | Updated mixins. |
| Legacy monolith / MBC | No Intrinsic updates | Do not base a new integration on the old monolith. |

### Text colors — constants 3.3.0 snapshot

[Official reference](https://designsystem.morningstar.com/component-docs/constants/3.3.0/color.html?tab=text)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $mds-text-color-primary | #1e1e1e | Primary text on light backgrounds. |
| $mds-text-color-secondary | #5e5e5e | Supporting text on light backgrounds. |
| $mds-text-color-primary-on-dark | #ffffff | Primary text on dark. |
| $mds-text-color-secondary-on-dark | #ababab | Supporting text on dark. |
| $mds-text-color-interactive-primary | #006fba | Interactive text; prefer the link mixin for links. |
| $mds-text-color-error | #ca0000 | Error text, distinct from a feedback fill. |

### Historical allocation palette — v2.37

[Official reference](https://designsystem.morningstar.com/legacy/visual-language/constants.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $mds-visualization-color-asset-allocation-equity | #1f55a5 | Equity chart segment. |
| $mds-visualization-color-asset-allocation-fixed-income | #ef7622 | Fixed-income chart segment. |
| $mds-visualization-color-asset-allocation-cash | #518428 | Cash chart segment. |
| $mds-visualization-color-asset-allocation-alternative | #a50032 | Alternative asset segment. |
| $mds-visualization-color-asset-allocation-not-classified | #e5e5e5 | Unclassified segment; pair with label. |

### Historical spacing — v2.37

[Official reference](https://designsystem.morningstar.com/legacy/visual-language/constants.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $mds-space-quarter-x | 2px | Historical constant; verify installed package before adoption. |
| $mds-space-half-x | 4px | Historical constant; verify installed package before adoption. |
| $mds-space-1-x | 8px | Historical constant; verify installed package before adoption. |
| $mds-space-1-and-a-half-x | 12px | Historical constant; verify installed package before adoption. |
| $mds-space-2-x | 16px | Historical constant; verify installed package before adoption. |
| $mds-space-3-x | 24px | Historical constant; verify installed package before adoption. |
| $mds-space-4-x | 32px | Historical constant; verify installed package before adoption. |
| $mds-space-6-x | 48px | Historical constant; verify installed package before adoption. |

### Table composition controls

[Official reference](https://designsystem.morningstar.com/components/how-to-use-data-tables/?tab=examples)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| row-numbers | Boolean on mds-table | Provide row number on mds-tr. |
| nested-headers | Number of levels | Use mds-thead-group-n slots. |
| multiselection | Boolean on mds-table | Separate all-selected and partially-selected states. |
| mds-thead.indeterminate | Boolean | Represents partial selection. |
| mds-tr.multiselection-label | Row-identifying text | Names the selection checkbox. |
| mds-pagination-page-changed | Pagination event | Application supplies the page-change logic. |

## Morningstar Design System A research notebook built around comparable numbers

### Tables carry the exact values

The original specimen shows two fictional allocation models, a stacked bar and an exact-value table. The visual strip explains relative composition; the table remains the authoritative reading surface. Every model totals 100%, and the selected model is named in both the heading and the table caption.

Sorting changes row order without changing the denominator or asset-class colors. A reader can move from a broad allocation impression to the exact percentage without interpreting a proprietary rating icon. This is a concrete research interaction, not an invented Morningstar product or recommendation.

[Supporting specification](https://designsystem.morningstar.com/components/how-to-use-data-tables/?tab=examples)

## Morningstar Design System Constants have intended roles and version boundaries

### Do not turn every gray into a text token

MDS distinguishes role-based constants from generic colors. The engineer guide specifically separates a text color from a generic neutral when the same visual value is needed for a non-text element. The supplied Sass example uses the reading role for text and a generic neutral for a custom table rule.

The reference tables retain their version boundaries: constants 3.3.0 supports the cited text values, while the public v2.37 archive supports the historical allocation and spacing values. These are useful for reading an existing interface, but they are not proof that every current Vue 3 constant resolves identically. Inspect the authorized installed package before treating an archived number as a current design requirement.

[Supporting specification](https://designsystem.morningstar.com/getting-started/for-engineers/?tab=vue-3)

## Morningstar Design System Morningstar Intrinsic changes the implementation baseline

### Two weight families, coordinated component updates

The 2025 Intrinsic announcement maps the older thin, light and regular names to the regular font, and bold and heavy to the bold font. Updating a font-family declaration alone does not reproduce this migration: the announcement calls for component updates, including the font and typography packages.

The old morningstar-design-system monolith and Morningstar Base Charts do not receive Intrinsic updates. New examples should not combine those archived install paths with current Vue 3 instructions. The offline notebook uses a system fallback and does not embed proprietary font files.

[Supporting specification](https://designsystem.morningstar.com/whats-new/blog/introducing-morningstar-intrinsic/)

## Morningstar Design System Compose table features explicitly

### Selection, nested headings and pagination are separate responsibilities

MDS offers table elements for composition rather than forcing all data operations into a single opaque grid. The documented patterns expose row numbers, nested header slots, multi-selection and pagination. An application still owns its data transformation and selection state.

The provided working example intentionally uses a native table with constants-based styles. The documented MDS composition reference remains useful when moving into the native component family: a partial selection belongs in the header indeterminate state, and every row checkbox needs a row-identifying multiselection-label.

- Keep percentage values numeric until display formatting; do not sort formatted strings.
- Give numeric headers the same right alignment as their cells.
- Preserve the asset label when sorting; index positions are not stable record identifiers.

[Supporting specification](https://designsystem.morningstar.com/components/how-to-use-data-tables/?tab=examples)

## Morningstar Design System Asset colors are not generic decoration

### Use fixed meaning and an equivalent text reading

The historical allocation palette distinguishes equity, fixed income, cash, alternatives and unclassified material. In the specimen, those three relevant asset colors remain attached to their asset classes when the model or row order changes. Colors do not rotate based on which segment happens to be first.

A text table repeats every value, so a user does not need to distinguish blue, orange and green to understand the model. The sample avoids Morningstar star, medalist or style-box imagery: the official icon reference reserves intellectual-property icons for their established meanings.

[Supporting specification](https://designsystem.morningstar.com/ui-elements-docs/icon-vue3/2.0.0/index.html)

## Morningstar Design System Separate historical scale from application layout

### A compact reading surface without hidden columns

The archive documents an 8-pixel base spacing step with quarter and half steps. The sample uses a restrained 8/16/24/32 rhythm inspired by that historical reference. Its overall width, stacked-bar height and mobile threshold are original application choices rather than invented official constants.

The table keeps only three columns: asset class, percentage and comparison bar. At narrow widths the miniature comparison bar is removed while the asset and exact percentage remain. The model selector stays above the data and its label remains visible; there is no unlabeled icon-only filter.

[Supporting specification](https://designsystem.morningstar.com/legacy/visual-language/constants.html)

## Morningstar Design System Adopt the current package generation within its access boundary

### Configure the actual assets before styling a product

Authorized teams can use the documented internal registry, Vue 3 package suffix and Sass setup. CSS Modules scope component styles so different versions can coexist; the example uses a product-specific namespace. Hosted font assets must be configured before styles that consume them.

The public preview requires none of that access. It is a complete independent HTML demonstration of the allocation interaction, with source-backed historical colors and explicit system-font fallback. The separate Vue example is a concrete constants-based adoption path, not a claim that this page can grant registry or font access.

1. Confirm approved internal registry and font access, then create the scoped project configuration shown above.
2. Compile the Sass entry before the application component and mount the complete App.vue example.
3. Switch the allocation model in the preview, sort both directions and verify that labels, values and total remain synchronized.

[Supporting specification](https://designsystem.morningstar.com/getting-started/for-engineers/?tab=vue-3)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Offline native HTML interpretation using cited historical MDS allocation colors and a system font. No MDS Vue runtime, proprietary ratings or live investment data.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Allocation notebook — MDS interpretation</title><style>*{box-sizing:border-box}body{margin:0;background:#fff;color:#1e1e1e;font:16px/1.45 Arial,sans-serif}.app{max-width:1100px;margin:auto;padding:32px}.mast{border-bottom:2px solid #333;display:flex;justify-content:space-between;padding-bottom:16px;gap:16px}.mast b{letter-spacing:.06em}.mast span,.muted{color:#5e5e5e;font-size:13px}h1{font-size:36px;font-weight:400;line-height:1.2;margin:28px 0 10px}.intro{max-width:600px;color:#5e5e5e;margin:0 0 24px}.controls{background:#f2f2f2;display:flex;align-items:center;gap:16px;padding:16px;margin-bottom:24px}select{font:inherit;padding:8px 32px 8px 10px;background:white;border:1px solid #808080;border-radius:2px}button:focus-visible,select:focus-visible{outline:3px solid #006fba;outline-offset:3px}.chart{display:grid;grid-template-columns:1fr 90px;gap:24px;align-items:center;margin:28px 0 32px}.stack{display:flex;height:42px;overflow:hidden}.segment{min-width:0}.total{text-align:right;font-size:30px}.total small{display:block;font-size:11px;color:#5e5e5e}.legend{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;margin-top:12px}.legend i{display:inline-block;width:8px;height:8px;margin-right:6px}table{width:100%;border-collapse:collapse}caption{text-align:left;font-size:20px;padding-bottom:12px}th,td{padding:16px 8px;border-bottom:1px solid #e5e5e5;text-align:left;font-weight:400}thead th{border-top:2px solid #333;border-bottom:1px solid #808080;font-size:13px}.numeric{text-align:right;font-variant-numeric:tabular-nums}.sort{border:0;background:none;color:#006fba;cursor:pointer;padding:0;font:inherit;text-align:right}.spark{width:35%}.track{height:6px;background:#f2f2f2}.fill{height:6px}.status{font-size:12px;min-height:20px;color:#5e5e5e}.foot{margin-top:32px;padding-top:16px;border-top:1px solid #ccc;font-size:12px;color:#5e5e5e}@media(max-width:600px){.app{padding:20px}.mast{flex-direction:column;gap:4px}h1{font-size:30px}.controls{align-items:flex-start;flex-direction:column;gap:8px}.chart{grid-template-columns:1fr 70px;gap:12px}.spark{display:none}.numeric{width:35%}th,td{padding:16px 4px}.legend{gap:10px}}</style><main class="app"><header class="mast"><b>RESEARCH NOTEBOOK</b><span>Independent MDS interpretation</span></header><h1>One model. Every allocation.</h1><p class="intro">Read the mix at a glance, then inspect the exact numbers. These two original models are fictional.</p><div class="controls"><label for="model">Sample model</label><select id="model"><option value="balanced">Balanced sample</option><option value="reserve">Reserve sample</option></select><span class="muted">No market data or investment recommendation</span></div><div class="chart"><div><div class="stack" id="stack" aria-hidden="true"></div><div class="legend"><span><i style="background:#1f55a5"></i>Equity</span><span><i style="background:#ef7622"></i>Fixed income</span><span><i style="background:#518428"></i>Cash</span></div></div><div class="total">100<small>PERCENT TOTAL</small></div></div><table><caption id="caption">Balanced sample allocation</caption><thead><tr><th scope="col">Asset class</th><th scope="col" id="sorthead" class="numeric" aria-sort="descending"><button class="sort" id="sort">Allocation (%) ↓</button></th><th scope="col" class="spark">Share of model</th></tr></thead><tbody id="rows"></tbody></table><p class="status" id="status" role="status">Sorted by allocation, highest first.</p><p class="foot">Historical MDS v2.37 allocation colors; original application layout and system-font fallback. No Morningstar ratings, proprietary font assets or native Vue components are included.</p></main><script>const models={balanced:[55,35,10],reserve:[20,45,35]},assets=[{name:'Equity',color:'#1f55a5'},{name:'Fixed income',color:'#ef7622'},{name:'Cash',color:'#518428'}];let ascending=false;const model=document.querySelector('#model');function render(){const entries=assets.map((a,i)=>({...a,value:models[model.value][i]}));document.querySelector('#stack').innerHTML=entries.map(a=>`<div class="segment" style="width:${a.value}%;background:${a.color}"></div>`).join('');document.querySelector('#caption').textContent=model.selectedOptions[0].textContent+' allocation';document.querySelector('#rows').innerHTML=[...entries].sort((a,b)=>ascending?a.value-b.value:b.value-a.value).map(a=>`<tr><th scope="row">${a.name}</th><td class="numeric">${a.value.toFixed(1)}%</td><td class="spark"><div class="track"><div class="fill" style="width:${a.value}%;background:${a.color}"></div></div></td></tr>`).join('');document.querySelector('#sorthead').setAttribute('aria-sort',ascending?'ascending':'descending');document.querySelector('#sort').textContent='Allocation (%) '+(ascending?'↑':'↓');document.querySelector('#status').textContent='Sorted by allocation, '+(ascending?'lowest first.':'highest first.')}model.onchange=render;document.querySelector('#sort').onclick=()=>{ascending=!ascending;render()};render();</script></html>

```

[Code reference](https://designsystem.morningstar.com/components/how-to-use-data-tables/?tab=examples)

- Allocation values are fictional. Asset colors retain their category meaning when sorting; this document does not embed proprietary MDS Vue assets or Intrinsic fonts.

### A complete sortable table with an explicit denominator

A Vue 3 table uses native semantics and the MDS visual-language setup above. Sorting preserves numeric values and reports direction.

```vue
<!-- src/App.vue — native table styled with MDS constants, not MdsTable -->
<script setup>
import {computed,ref} from 'vue';
const ascending=ref(false);
const rows=[{name:'Sample Equity',allocation:55},{name:'Sample Bonds',allocation:35},{name:'Sample Cash',allocation:10}];
const sorted=computed(()=>[...rows].sort((a,b)=>ascending.value?a.allocation-b.allocation:b.allocation-a.allocation));
</script>
<template>
 <main><h1>Research notebook</h1><p>Fictional allocation; not an investment recommendation.</p>
 <table><caption>Sample allocation, total 100%</caption><thead><tr><th scope="col">Asset</th><th scope="col" class="numeric" :aria-sort="ascending?'ascending':'descending'"><button type="button" @click="ascending=!ascending">Allocation (%) {{ascending?'↑':'↓'}}</button></th></tr></thead>
 <tbody><tr v-for="row in sorted" :key="row.name"><th scope="row">{{row.name}}</th><td class="numeric">{{row.allocation.toFixed(1)}}%</td></tr></tbody></table>
 <p role="status">Sorted by allocation, {{ascending?'lowest first':'highest first'}}.</p></main>
</template>
```

[Code reference](https://designsystem.morningstar.com/getting-started/about-mds/)

- MDS permits teams to adapt its constants and visual language without its Vue components.
- This example deliberately does not invent MdsTable imports or undocumented sorting events.
- The 55/35/10 allocation is fictional, totals 100 and is not market data.

### Separate typographic scale from semantic heading level

The official mixin can style an h1 at level-2 visual scale without changing its document meaning.

```scss
@use '@mds/constants-vue3' as *;
@use '@mds/typography-vue3' as *;
h1 { @include mds-level-2-heading($bold:true); color:$mds-text-color-primary; }
p { @include mds-body-text-m(); color:$mds-text-color-primary; }
```

[Code reference](https://designsystem.morningstar.com/getting-started/for-engineers/?tab=vue-3)

- Typography mixins do not set text color.
- Use separately scoped MCE constants for chart elements rather than assuming MDS overrides propagate into charts.

## Implementation Starting Point

Restricted registry setup for authorized teams. The font path must point to licensed files actually hosted by the application. Pair with App.vue below. This is a constants-based native HTML table, not a claim that MDS packages are available publicly or that native compilation was verified.

```shell / javascript / scss
# Authorized Morningstar teams only: project .npmrc
@mds:registry=https://artifacts.morningstar.com/repository/npm-prod-group/
@mce:registry=https://artifacts.morningstar.com/repository/npm-prod-group/

# Within a Vite Vue 3 project with approved registry access
pnpm add @mds/constants-vue3 @mds/typography-vue3 @mds/fonts-vue3
pnpm add -D sass

// vite.config.js
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({
  plugins:[vue()],
  css:{modules:{generateScopedName:'[local]___researchNotebook'}}
});

// src/main.js
import {createApp} from 'vue';
import './main.scss';
import App from './App.vue';
createApp(App).mount('#app');

// src/main.scss — host licensed font files at this application path first
@use '@mds/fonts-vue3/scss/config' with ($font-path:'/fonts/morningstar-intrinsic');
@use '@mds/fonts-vue3';
@use '@mds/constants-vue3' as *;
@use '@mds/typography-vue3' as *;
h1 { @include mds-level-2-heading($bold:true); color:$mds-text-color-primary; }
p,td,th { @include mds-body-text-m(); color:$mds-text-color-primary; }
main { margin:$mds-space-4-x; }
table { width:100%;border-collapse:collapse; }
th,td { text-align:left; border-bottom:1px solid $mds-color-neutral-37; }
.numeric { text-align:right;font-variant-numeric:tabular-nums; }
button { font:inherit;cursor:pointer; }

```

## Agent Prompt

Create a Morningstar-inspired research notebook using the explicit version boundaries in this guide. Keep exact allocation values in a semantic table and colors fixed to their asset meanings. Do not invent ratings or use IP icons as decoration. Use the current authorized Vue 3 constants/font configuration only with approved access; otherwise keep the offline implementation clearly identified.

## Sources

- [Vue 3 adoption](https://designsystem.morningstar.com/getting-started/for-engineers/?tab=vue-3) — Registry, Sass, fonts, modules and constants.
- [Intrinsic announcement](https://designsystem.morningstar.com/whats-new/blog/introducing-morningstar-intrinsic/) — Current font transition and legacy exclusions.
- [Historical constants v2.37](https://designsystem.morningstar.com/legacy/visual-language/constants.html) — Explicitly historical spacing and allocation colors.
- [Text constants 3.3.0](https://designsystem.morningstar.com/component-docs/constants/3.3.0/color.html?tab=text) — Versioned reading color values.
- [Table feature guide](https://designsystem.morningstar.com/components/how-to-use-data-tables/?tab=examples) — Composition, selection and pagination.
- [Icon semantics](https://designsystem.morningstar.com/ui-elements-docs/icon-vue3/2.0.0/index.html) — IP icon restrictions and accessible use.
- [About MDS](https://designsystem.morningstar.com/getting-started/about-mds/) — Constants-based adoption without native components.
