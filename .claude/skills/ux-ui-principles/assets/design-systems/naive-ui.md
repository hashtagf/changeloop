# Naive UI Design System — OpenDesign Application Guide

A native Naive UI data-table workbench with verified theme-object values, row selection, expansion, sorting, pagination and a local batch review action.

Naive UI 2.45.3. Theme defaults and original overrides are separately identified. Review records and batch changes stay local.

## Source Reference

- **Library scope:** Vue 3 component library ([source](https://www.naiveui.com/))
- **Platform or architecture:** Uses TypeScript ([source](https://github.com/tusen-ai/naive-ui))
- **Integration:** Theme customization is supported ([source](https://github.com/tusen-ai/naive-ui))
- **Component support:** Includes data table components ([source](https://github.com/tusen-ai/naive-ui))
- **Customization or behavior:** Includes form components ([source](https://github.com/tusen-ai/naive-ui))
- **Additional capability:** Includes notification and feedback components ([source](https://github.com/tusen-ai/naive-ui))


## Design Reference

Naive UI 2.45.3 common light-theme object inspected from the installed package. These camelCase properties are theme overrides, not a public --token CSS variable naming scheme. The preview’s custom common overrides are listed separately.

### Default common colors

[Official reference](https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/light.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| primaryColor | #18a058 | Default primary green. |
| primaryColorHover | #36ad6a | Hover variant. |
| primaryColorPressed | #0c7a43 | Pressed variant. |
| primaryColorSuppl | #36ad6a | Supplementary primary color. |
| infoColor | #2080f0 | Information role. |
| successColor | #18a058 | Success role. |
| warningColor | #f0a020 | Warning role. |
| errorColor | #d03050 | Error role. |
| textColor1 | rgb(31, 34, 37) | Strong text. |
| textColor2 | rgb(51, 54, 57) | Normal text. |
| textColor3 | rgb(118, 124, 130) | Secondary text. |
| borderColor | rgb(224, 224, 230) | Default boundary. |
| dividerColor | rgb(239, 239, 245) | Subtle separators. |
| tableHeaderColor | rgb(250, 250, 252) | Table header background. |

### Type and control geometry

[Official reference](https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/light.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontFamily | v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" | Preferred UI font stack; v-sans is not automatically downloaded. |
| fontSize | 14px | Default 14px type. |
| fontSizeMini | 12px | Mini text size. |
| fontSizeSmall | 14px | Small control text. |
| fontSizeMedium | 14px | Medium control text. |
| fontSizeLarge | 15px | Large control text. |
| fontSizeHuge | 16px | Huge control text. |
| lineHeight | 1.6 | Default text rhythm. |
| heightTiny | 22px | Tiny control height. |
| heightSmall | 28px | Small control height. |
| heightMedium | 34px | Medium control height. |
| heightLarge | 40px | Large control height. |
| heightHuge | 46px | Huge control height. |
| borderRadius | 3px | Default 3px radius. |
| borderRadiusSmall | 2px | Default 2px small radius. |

### Actual preview theme overrides

[Official reference](https://github.com/tusen-ai/naive-ui/tree/main/src/config-provider)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| common.primaryColor | #176b57 | Original darker green primary action. |
| common.primaryColorHover | #238a71 | Original coordinated hover value. |
| common.primaryColorPressed | #115340 | Original coordinated pressed value. |
| common.borderRadius | 6px | Original radius override; default is 3px. |
| Layout spacing | 32px outer / 24px section gaps / 16px toolbar gap | Original page spacing, not a claimed global Naive spacing scale. |

## Naive UI Design System A JavaScript Theme Object, Not a Sass Pipeline

### A JavaScript Theme Object, Not a Sass Pipeline

Naive UI is a Vue 3 component library whose theme customization is expressed through a JavaScript object. The review queue passes themeOverrides to NConfigProvider. Its common section overrides primaryColor, primaryColorHover, primaryColorPressed and borderRadius, while the other component defaults remain available through the provider.

The reference table reports actual values from the installed 2.45.3 common light theme. It does not fabricate CSS-variable names from those camelCase keys. The default primary is #18a058 and default border radius is three pixels; the darker green and six-pixel radius in this specimen are explicitly original overrides.

[Supporting specification](https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/light.ts)

## Naive UI Design System Dense UI Type and Control Heights

### Dense UI Type and Control Heights

The common theme uses fourteen-pixel text with a 1.6 line height. Its small and medium text sizes are both fourteen pixels, while their control heights differ. heightSmall is twenty-eight pixels and heightMedium is thirty-four pixels; size names therefore describe component geometry, not merely a font-size progression.

The preferred font stack starts with v-sans, but the library does not require downloading that font to render this specimen. The surrounding page uses system-ui, a 34px heading and 18px supporting section titles. Those page styles are original. A designer adopting the library should distinguish the theme’s control scale from the larger editorial hierarchy of a landing page.

[Supporting specification](https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/light.ts)

## Naive UI Design System Column Definitions Carry Behavior

### Column Definitions Carry Behavior

NDataTable receives a columns array and a records array. The example begins with a selection column, then an expand column, followed by named data columns. The Reference column renders a strong name and a smaller stable ID. Entries uses a numeric comparator, while the name column uses the default sorter. Review renders a native NTag based on the record’s status.

This configuration is actual behavior rather than a screenshot with decorative table headings. Sorting the Entries column compares numeric counts, not formatted strings. Expanded content exposes each record’s specific review question. The data table controls row display while the application owns the meaning of those records.

[Supporting specification](https://github.com/tusen-ai/naive-ui/tree/main/src/data-table/demos/enUS)

## Naive UI Design System Selection Must Survive Reordering

### Selection Must Survive Reordering

The row-key function returns each record’s stable ID. checked-row-keys and update:checked-row-keys keep the selection controlled in Vue state. Sorting or paging can change where a record is displayed without changing the identity used by the batch action. Using array indexes instead would make this relationship fragile when row order changes.

The selection column disables Archived records. These records remain visible for historical context but cannot be added to the review batch. The application also checks status when applying the action, keeping its data mutation consistent with the visible restriction. In a real system, the server would still need to enforce authorization; a disabled checkbox is not a permission boundary.

1. Select one reviewable record on the first page.
2. Move to the next page and inspect the preserved selection count.
3. Apply the batch and verify the selected record’s status changes without touching an archived record.

[Supporting specification](https://github.com/tusen-ai/naive-ui/tree/main/src/data-table/demos/enUS)

## Naive UI Design System Filtering and Pagination Have Separate State

### Filtering and Pagination Have Separate State

The search input matches reference names and owners. Changing its value resets the current page to one so a filtered result does not remain on a now-empty later page. Pagination uses a page size of four and an onChange handler; the six records make page transitions observable in the local specimen.

Selection is intentionally separate from the filtered array and can span pages. The toolbar count communicates that scope. A production batch operation should preserve or clear hidden selections according to a deliberate rule; this example preserves them. It never treats a filter as a mutation of the underlying review records.

[Supporting specification](https://github.com/tusen-ai/naive-ui/tree/main/src/data-table/demos/enUS)

## Naive UI Design System Expand Rows Before Making a Batch Decision

### Expand Rows Before Making a Batch Decision

Each expandable row includes a concrete task, such as checking keyboard movement in navigation or comparing different empty-state meanings. This makes the expanded area useful evidence for a review decision rather than another repeated generic description. The expand column uses renderExpand to produce ordinary content beneath the corresponding record.

The table retains its column structure on narrow screens and receives scroll-x=640. This allows the native table region to scroll horizontally while the page remains within the viewport. The toolbar stacks on mobile, but data is not silently removed to make the screenshot look cleaner.

[Supporting specification](https://github.com/tusen-ai/naive-ui/tree/main/src/data-table/demos/enUS)

## Naive UI Design System Batch Review Is a Local Data Transformation

### Batch Review Is a Local Data Transformation

Mark selected reviewed is disabled when the controlled key array is empty. When activated, it maps the records and changes only selected, nonarchived items to Reviewed. The selection is cleared afterward, and a native success alert reports exactly the local operation. The reviewed counter in the card header is derived from the records rather than incremented independently.

No repository, review service or external document is modified. A real asynchronous implementation would need loading, rejection and partial-failure handling. It should not clear the selection before it knows which updates succeeded. This specimen keeps the operation synchronous and explicitly local so its success statement matches the code.

- The batch button reflects whether any keys are selected.
- The reviewed count is derived from the same records shown in the table.
- The result notice states that no repository was changed.

[Supporting specification](https://github.com/tusen-ai/naive-ui/tree/main/src/data-table/demos/enUS)

## Naive UI Design System A Vue Component Without a Required CSS Import

### A Vue Component Without a Required CSS Import

Install naive-ui@2.45.3 in a Vue 3 project and import the components used by App.vue. Naive UI supplies its component styling at runtime; unlike many CSS-first libraries, it does not require a global package stylesheet import for these components. The supplied style.css contains only the original workbench layout.

NConfigProvider receives English component and date locales as well as the common theme override. The full SFC can be compiled with the standard Vite Vue plugin. The standalone specimen bundles that compiled component, keeping the native components and application behavior available without network requests.

[Supporting specification](https://github.com/tusen-ai/naive-ui)

## Naive UI Design System Theme and Data Boundaries Stay Inspectable

### Theme and Data Boundaries Stay Inspectable

The workbench is a small reference library, not a general administration dashboard with invented metrics. Every row is sample content, every status has an explicit meaning, and the expansion text gives a concrete reason to inspect it. The theme table and full SFC make both the styling and behavior reproducible.

When adopting Naive UI into a larger system, keep global common overrides coordinated with component-level overrides. A primary default, hover and pressed color should be reviewed together. Avoid styling generated internals as the first customization strategy when the provider offers a supported theme surface.

[Supporting specification](https://github.com/tusen-ai/naive-ui/tree/main/src/config-provider)

## Component Examples

### Complete Vue review queue

DataTable column configuration, stable row keys, selection, expansion and controlled pagination.

```vue
<script setup>
import {ref,computed,h} from 'vue';
import {NConfigProvider,NDataTable,NButton,NInput,NTag,NAlert,NCard,NSpace,enUS,dateEnUS} from 'naive-ui';
const themeOverrides={common:{primaryColor:'#176b57',primaryColorHover:'#238a71',primaryColorPressed:'#115340',borderRadius:'6px'}};
const rows=ref([{id:'DS-101',name:'Navigation patterns',owner:'Maya',items:18,status:'Needs review',note:'Check keyboard movement between primary and overflow navigation.'},{id:'DS-102',name:'Empty-state copy',owner:'Alex',items:9,status:'Needs review',note:'Compare first-use guidance with filtered-empty and permission-empty states.'},{id:'DS-103',name:'Color role mapping',owner:'Jules',items:24,status:'Reviewed',note:'Semantic aliases were compared in light and dark appearances.'},{id:'DS-104',name:'Form error summary',owner:'Sam',items:12,status:'Needs review',note:'Verify error links focus the corresponding input.'},{id:'DS-105',name:'Legacy icon export',owner:'Maya',items:36,status:'Archived',note:'Historical export retained for reference; batch review is disabled.'},{id:'DS-106',name:'Density variants',owner:'Alex',items:15,status:'Needs review',note:'Check compact controls with long translated labels.'}]);
const query=ref(''),checked=ref([]),page=ref(1),notice=ref('');const filtered=computed(()=>rows.value.filter(r=>(r.name+' '+r.owner).toLowerCase().includes(query.value.toLowerCase())));
const columns=[{type:'selection',disabled:r=>r.status==='Archived'},{type:'expand',renderExpand:r=>h('div',{class:'row-note'},r.note)},{title:'Reference',key:'name',sorter:'default',width:240,render:r=>h('div',[h('strong',r.name),h('div',{class:'row-id'},r.id)])},{title:'Owner',key:'owner',width:100},{title:'Entries',key:'items',sorter:(a,b)=>a.items-b.items,width:95},{title:'Review',key:'status',width:140,render:r=>h(NTag,{type:r.status==='Reviewed'?'success':r.status==='Archived'?'default':'warning',bordered:false},{default:()=>r.status})}];
const pagination=computed(()=>({page:page.value,pageSize:4,onChange:p=>page.value=p}));function apply(){rows.value=rows.value.map(r=>checked.value.includes(r.id)&&r.status!=='Archived'?{...r,status:'Reviewed'}:r);notice.value=`Marked ${checked.value.length} selected references reviewed in this preview. No repository was changed.`;checked.value=[];}
</script>
<template><NConfigProvider :locale="enUS" :date-locale="dateEnUS" :theme-overrides="themeOverrides"><main class="review-desk"><header><p class="eyebrow">NAIVE UI / REFERENCE REVIEW</p><h1>A review queue with context.</h1><p>Search, expand a row, compare entry counts, and apply a local batch action.</p></header><NCard title="Reference library"><template #header-extra><NTag :bordered="false" type="success">{{rows.filter(r=>r.status==='Reviewed').length}} reviewed</NTag></template><div class="toolbar"><NInput v-model:value="query" placeholder="Search reference or owner" clearable aria-label="Search reference or owner" @update:value="page=1"/><NButton type="primary" :disabled="!checked.length" @click="apply">Mark selected reviewed</NButton></div><p class="selection-note">{{checked.length}} selected · Selection uses stable IDs and can span pages.</p><NDataTable :columns="columns" :data="filtered" :row-key="r=>r.id" :checked-row-keys="checked" @update:checked-row-keys="keys=>checked=keys" :pagination="pagination" :scroll-x="640" :single-line="false"/><NAlert v-if="notice" type="success" class="notice">{{notice}}</NAlert></NCard><div class="notes"><section><h2>Expand before judging</h2><p>The expand control reveals a concrete review question for each reference. A title alone is not enough context for a meaningful batch decision.</p></section><section><h2>Archived is a separate state</h2><p>Archived records stay visible but cannot join the batch selection. Search and pagination never change the underlying review data.</p></section></div><footer>Native Naive UI 2.45.3 DataTable, Input, Button, Tag, Card and Alert. All records and mutations are local examples.</footer></main></NConfigProvider></template>

```

[Code reference](https://github.com/tusen-ai/naive-ui/tree/main/src/data-table/demos/enUS)

- Selection is keyed by stable reference IDs.
- Archived rows are disabled by the selection-column predicate.
- The common theme override is supplied through NConfigProvider.

### Original workbench layout

Page typography and responsive spacing surrounding the native data table.

```css
*{box-sizing:border-box}body{margin:0;background:#f5f7f6;color:#1f2225;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6}.review-desk{max-width:1120px;margin:auto;padding:32px}header{max-width:720px;margin-bottom:28px}h1{font-size:34px;line-height:1.2;letter-spacing:-.03em;margin:10px 0 16px}.eyebrow{font-size:11px;letter-spacing:.12em;font-weight:700;color:#426258}.toolbar{display:flex;align-items:center;gap:16px}.toolbar .n-input{max-width:360px}.selection-note,.row-id{font-size:12px;color:#767c82}.row-id{margin-top:4px}.row-note{padding:12px 16px;max-width:65ch;color:#335547}.notice{margin-top:20px}.notes{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}.notes section{border-top:2px solid #c8d7cf;padding:18px 0}.notes h2{font-size:18px;margin:0 0 10px}.notes p{margin:0}footer{font-size:12px;color:#767c82;margin-top:20px}@media(max-width:700px){.review-desk{padding:20px 16px}h1{font-size:28px}.toolbar{align-items:stretch;flex-direction:column}.toolbar .n-input{max-width:none}.notes{grid-template-columns:1fr}.n-card>.n-card__content{padding:16px!important}}

```

[Code reference](https://github.com/tusen-ai/naive-ui)

- Naive UI injects component styles; this stylesheet contains only application layout.

## Implementation Starting Point

Verified with Vue 3 and Naive UI 2.45.3. Uses standard SFC compilation. All reference records are local.

```javascript
// Create the project first:
// npm create vite@latest naive-ui-specimen -- --template vue
// cd naive-ui-specimen && npm install
// In a Vite Vue 3 project:
// npm install naive-ui@2.45.3
// Save the complete component above as App.vue and layout as style.css.
import {createApp} from 'vue';
import App from './App.vue';
import './style.css';
createApp(App).mount('#app');
// index.html contains <div id="app"></div>.
// NConfigProvider, locales, themeOverrides and component imports are in App.vue.
// No Naive UI global CSS import is required for these components.
// Keep the template index.html and replace its entry with the code above.
// npm run dev
```

## Agent Prompt

Use the Naive UI 2.45.3 reference review queue with NConfigProvider and native NDataTable columns, expansion, sorting, pagination and selection. Preserve stable reference keys when filtering or changing pages, and make the batch action operate on the selected records rather than only the visible rows. Keep empty and disabled-action states tied to the actual collection. Retain the supplied themeOverrides as application overrides distinct from package defaults, with the full original layout. The queue is local reference review, not a dataset import service.

## Sources

- [Official repository](https://github.com/tusen-ai/naive-ui) — Vue 3, runtime styles and theme customization.
- [DataTable examples](https://github.com/tusen-ai/naive-ui/tree/main/src/data-table/demos/enUS) — Native data-table patterns and API examples.
- [Common light theme](https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/light.ts) — Actual default palette and derived roles.
- [Common geometry](https://github.com/tusen-ai/naive-ui/blob/main/src/_styles/common/_common.ts) — Font sizes, control heights and radii.
- [Config provider](https://github.com/tusen-ai/naive-ui/tree/main/src/config-provider) — Provider theme configuration.
