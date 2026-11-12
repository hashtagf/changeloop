# Element Plus Design System — OpenDesign Application Guide

Use Element Plus’s real Transfer model, filters and disabled options to build a module-selection workbench, backed by verified colors, type sizes and control dimensions.

Element Plus 2.14.7 native reference. Module names and permissions are original examples; local selection performs no installation or entitlement change.

## Source Reference

- **Library scope:** Vue 3 component library ([source](https://element-plus.org/))
- **Platform or architecture:** Full import and on-demand import are documented ([source](https://element-plus.org/en-US/guide/quickstart.html))
- **Integration:** Element Plus includes a stylesheet ([source](https://element-plus.org/en-US/guide/quickstart.html))
- **Component support:** Table components are documented ([source](https://element-plus.org/en-US/guide/quickstart.html))
- **Customization or behavior:** Form components are documented ([source](https://element-plus.org/en-US/guide/quickstart.html))
- **Additional capability:** Locale configuration is documented ([source](https://element-plus.org/en-US/guide/quickstart.html))


## Design Reference

Element Plus 2.14.7 default compiled CSS. Variables are verified package values, including semantic aliases. The transfer layout uses original responsive composition rules, separated from the system foundation.

### Primary and status colors

[Official reference](https://element-plus.org/en-US/guide/theming.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --el-color-primary | #409eff | Default primary accent. |
| --el-color-primary-light-3 | #79bbff | Primary tint used in lighter interactions. |
| --el-color-primary-light-5 | #a0cfff | Middle tint. |
| --el-color-primary-light-7 | #c6e2ff | Light tint. |
| --el-color-primary-light-9 | #ecf5ff | Quiet selection/key-panel surface. |
| --el-color-primary-dark-2 | #337ecc | Darker primary state. |
| --el-color-success | #67c23a | Success role. |
| --el-color-warning | #e6a23c | Warning role. |
| --el-color-danger | #f56c6c | Error/danger role. |
| --el-color-info | #909399 | Informational neutral role. |

### Semantic text and surfaces

[Official reference](https://element-plus.org/en-US/guide/theming.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --el-text-color-primary | #303133 | Main reading text. |
| --el-text-color-regular | #606266 | Ordinary component text. |
| --el-text-color-secondary | #909399 | Help and metadata. |
| --el-text-color-placeholder | #a8abb2 | Placeholder role. |
| --el-bg-color | #fff | Default surface. |
| --el-bg-color-page | #f2f3f5 | Page background. |
| --el-bg-color-overlay | #fff | Overlay surface. |
| --el-border-color | #dcdfe6 | Default boundary. |
| --el-border-color-light | #e4e7ed | Subtle card/summary boundary. |

### Typography, controls and shape

[Official reference](https://element-plus.org/en-US/guide/theming.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --el-font-family | "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif | Default family preference. |
| --el-font-size-extra-large | 20px | 20px title scale. |
| --el-font-size-large | 18px | 18px scale. |
| --el-font-size-medium | 16px | 16px scale. |
| --el-font-size-base | 14px | 14px base. |
| --el-font-size-small | 13px | 13px scale. |
| --el-font-size-extra-small | 12px | 12px scale. |
| --el-border-radius-base | 4px | Standard component corner. |
| --el-border-radius-small | 2px | Small corner. |
| --el-component-size-large | 40px | Large control height. |
| --el-component-size | 32px | Default control height. |
| --el-component-size-small | 24px | Small control height. |

### Original module-workbench layout

[Official reference](https://element-plus.org/en-US/component/transfer.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Desktop panel arrangement | two panels with 180px reserved between | Original adaptation around the native Transfer. |
| Narrow layout | ≤700px: stacked panels | Original breakpoint, not an Element Plus token. |
| Page spacing | 32px desktop; 20px 16px mobile | Original outer padding. |
| Summary spacing | 24px padding / 24px gap | Original selected-key and module-summary composition. |

## Element Plus Design System A Transfer List Has Two Kinds of Selection

### A Transfer List Has Two Kinds of Selection

Element Plus Transfer presents available and target lists with controls for moving checked items. The module workbench uses the actual 2.14.7 Vue component. Its v-model contains the target keys, initially catalog and tokens. A checkbox inside a list marks an item for the next transfer action; it does not itself mean the item already belongs to the target.

That distinction is made visible by the live model readout. Checking a source item prepares it for Add. Pressing Add changes the target key array, updates the selected-module summary, and clears any previous applied result. A reader can therefore see the library’s model contract rather than guessing it from a pair of static lists.

[Supporting specification](https://element-plus.org/en-US/component/transfer.html)

## Element Plus Design System Default Roles and Concrete Component Dimensions

### Default Roles and Concrete Component Dimensions

Element Plus exposes --el-color-primary and its light/dark derivatives, status roles, text colors and surface variables. The table reports actual compiled values from the installed package. The surrounding key panel uses primary-light-9 and ordinary text, while the action button uses the native primary treatment.

The default typography includes a fourteen-pixel base with twelve, thirteen, sixteen, eighteen and twenty-pixel companion sizes. Component-size variables describe small/default/large control dimensions. These should not be mistaken for a page layout spacing scale. The workbench’s twenty-four-pixel gaps and thirty-two-pixel outer padding are explicit original composition choices.

[Supporting specification](https://element-plus.org/en-US/guide/theming.html)

## Element Plus Design System Stable Keys, Labels, and Disabled Options

### Stable Keys, Labels, and Disabled Options

Each option has a key, label and disabled flag. The selected array is made of those keys, allowing labels to change without changing identity. The sample modules include Asset catalog, Token inspector, Review queue, Version history and Cross-project search. Audit export stays disabled to demonstrate a visible but unavailable choice.

Availability in this example is static demonstration data. It is not an entitlement check or a promise that these modules exist as installable products. In an actual application, the option source and permission rules must come from the product’s model. Do not infer authorization from the fact that a Transfer checkbox can be clicked.

[Supporting specification](https://element-plus.org/en-US/component/transfer.html)

## Element Plus Design System Search Changes Visibility, Not Membership

### Search Changes Visibility, Not Membership

filterable adds independent searches to the panels. The filter placeholder gives a concrete action, Find a module. Default filtering matches the option label. A selected item can disappear from the visible target list under a search without being removed from the selected key array; the summary and readout continue to reveal the complete target set.

Custom left-empty and right-empty slots distinguish a panel with no matching choices from the global case where nothing is selected. The page also disables Apply locally when the target array is empty. These are separate states: no search matches does not mean no selected modules.

1. Search for Review queue in the available panel.
2. Check the matching option and press Add.
3. Clear the search and verify that review appears in the model readout and target list.

[Supporting specification](https://element-plus.org/en-US/component/transfer.html)

## Element Plus Design System Keep the Two-List Relationship on Mobile

### Keep the Two-List Relationship on Mobile

The native Transfer panels are arranged side by side on desktop, with a dedicated area for Add and Remove. On screens no wider than seven hundred pixels, the panels stack and the action buttons form a horizontal row between them. The titles continue to identify Available modules and Workspace modules so the direction of a move remains clear.

The workbench does not scale the entire control down to fit the phone. It adapts the composition while keeping labels, checkboxes, searches and list content at native readable sizes. The selected-key readout and textual summary move into a single column below, preserving the same information rather than hiding it at a smaller breakpoint.

[Supporting specification](https://element-plus.org/en-US/component/transfer.html)

## Element Plus Design System Draft Membership and Applied Snapshot

### Draft Membership and Applied Snapshot

Apply locally copies the selected key array. A subsequent transfer change clears that applied state, so a success alert does not persist after the user changes the draft membership. Restore starting set assigns a fresh catalog/tokens array and also clears the applied result. The state transitions are a few explicit lines in the Vue source.

The alert says only that the local preview selection was applied. It does not claim installation, entitlement changes or an external update. For a real settings screen, the applied snapshot would need to correspond to a confirmed persistence result; a component event alone is not a server acknowledgment.

[Supporting specification](https://element-plus.org/en-US/component/transfer.html)

## Element Plus Design System Native Controls and Understandable Instructions

### Native Controls and Understandable Instructions

The example keeps the native Transfer checkboxes and transfer buttons. Button text is set to Remove and Add rather than leaving only directional icons, which becomes particularly useful when the lists stack vertically. Panel titles explain the source/target roles and the help sentence explains the check-then-move sequence.

The disabled option remains in context, and the empty panel slots communicate the absence of matching options. Keyboard users should be able to reach search fields, checkboxes and buttons without custom pointer-only handlers. The component manages its own internal behavior; the application avoids replacing that structure with painted rows that merely resemble selection controls.

- Panel titles establish which list is the target.
- Text labels keep transfer direction clear in the stacked layout.
- The live model readout makes hidden selected items discoverable.

[Supporting specification](https://element-plus.org/en-US/component/transfer.html)

## Element Plus Design System Compile the Vue Component and Load the CSS

### Compile the Vue Component and Load the CSS

In a Vue 3 Vite project, install element-plus@2.14.7 and import element-plus/dist/index.css before the original layout CSS. The complete App.vue uses script setup and imports its components directly. ElConfigProvider receives the English locale so built-in panel and empty-state text stays consistent with the English reference page.

The provided production-style setup imports App.vue through the Vue Vite plugin. The offline specimen was built by compiling the same single-file component and bundling it locally. It does not need an external CDN, an auto-import service or a runtime template compiler. If an existing project uses an auto-import plugin, keep its generated styles consistent with the chosen full or per-component import strategy.

[Supporting specification](https://element-plus.org/en-US/guide/quickstart.html)

## Element Plus Design System Theme Overrides Must Preserve Component Relationships

### Theme Overrides Must Preserve Component Relationships

CSS custom properties are useful for changing shared roles without rewriting every component selector. The workbench consumes the actual --el variables for background, text, borders and corners. It changes only layout selectors needed to fit the native Transfer into this particular composition.

For a broader brand theme, use the documented Sass or CSS-variable approach and examine hover, disabled and focus states together. Replacing only the primary hex value in one screenshot misses its lighter surfaces and darker interactions. The source-backed table provides the starting values; the full native preview lets a reader inspect the consequences in a working component.

[Supporting specification](https://element-plus.org/en-US/guide/theming.html)

## Component Examples

### Complete Vue module-selection component

A single-file component using native Transfer, Card, Alert, Button and Tag.

```vue
<script setup>
import {ref,computed} from 'vue';
import {ElConfigProvider,ElTransfer,ElCard,ElButton,ElTag,ElAlert} from 'element-plus';
import en from 'element-plus/es/locale/lang/en';
const modules=[{key:'catalog',label:'Asset catalog',disabled:false},{key:'tokens',label:'Token inspector',disabled:false},{key:'review',label:'Review queue',disabled:false},{key:'history',label:'Version history',disabled:false},{key:'audit',label:'Audit export · unavailable',disabled:true},{key:'search',label:'Cross-project search',disabled:false}];
const selected=ref(['catalog','tokens']),applied=ref(null);const names=computed(()=>modules.filter(x=>selected.value.includes(x.key)).map(x=>x.label));
const changed=()=>{applied.value=null};
</script>
<template><ElConfigProvider :locale="en"><main class="module-desk"><header><p class="eyebrow">ELEMENT PLUS / WORKSPACE COMPOSITION</p><h1>Choose the tools this team needs.</h1><p>Move modules between lists, then inspect the exact selected keys.</p></header><ElCard shadow="never"><template #header><div class="card-heading"><h2>Module selection</h2><ElTag type="info">{{selected.length}} selected</ElTag></div></template><ElTransfer v-model="selected" :data="modules" filterable filter-placeholder="Find a module" :titles="['Available modules','Workspace modules']" :button-texts="['Remove','Add']" @change="changed"><template #left-empty><p class="empty">No available module matches.</p></template><template #right-empty><p class="empty">No selected module matches.</p></template></ElTransfer><p class="help">Check a module before using Add or Remove. Audit export stays disabled in this sample.</p></ElCard><div class="summary-grid"><section class="summary"><h2>Workspace modules</h2><ul v-if="names.length"><li v-for="name in names" :key="name">{{name}}</li></ul><p v-else>No modules selected. Add at least one before applying.</p><div class="actions"><ElButton type="primary" :disabled="!selected.length" @click="applied=[...selected]">Apply locally</ElButton><ElButton @click="selected=['catalog','tokens'];changed()">Restore starting set</ElButton></div><ElAlert v-if="applied" title="Selection applied to the local preview" type="success" :closable="false" show-icon description="No installation, entitlement change or external update was performed." /></section><section class="key-panel"><p class="eyebrow">V-MODEL VALUE</p><pre>{{JSON.stringify(selected,null,2)}}</pre><p>The model contains keys, not option objects. Search filters visibility without changing this array.</p></section></div><footer>Native Element Plus Transfer, Card, Tag, Button and Alert. Local module names and availability are original examples.</footer></main></ElConfigProvider></template>

```

[Code reference](https://element-plus.org/en-US/component/transfer.html)

- v-model stores selected keys, not entire option objects.
- A disabled option remains visible but cannot be transferred.
- Changing the transfer selection clears the stale applied state.

### Responsive Transfer composition

Styles preserve native panels and controls while stacking them on narrow screens.

```css
body{margin:0;background:var(--el-bg-color-page);font-family:var(--el-font-family);color:var(--el-text-color-primary);font-size:var(--el-font-size-base);line-height:1.6}.module-desk{max-width:1080px;margin:auto;padding:32px}header{max-width:700px;margin-bottom:28px}h1{font-size:34px;line-height:1.2;letter-spacing:-.03em;margin:10px 0 16px}h2{font-size:20px;line-height:1.3;margin:0}.eyebrow{font-size:11px;letter-spacing:.12em;font-weight:700;color:var(--el-text-color-secondary)}.card-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.el-transfer{--el-transfer-panel-body-height:210px;display:flex;align-items:center;justify-content:center}.el-transfer-panel{width:calc((100% - 180px)/2)}.el-transfer__buttons{padding:0 20px;display:flex;flex-direction:column;gap:10px}.el-transfer__buttons .el-button{margin:0}.help,.empty{font-size:13px;color:var(--el-text-color-secondary)}.empty{padding:16px}.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}.summary,.key-panel{background:var(--el-bg-color);border:1px solid var(--el-border-color-light);border-radius:var(--el-border-radius-base);padding:24px}.actions{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}.actions .el-button{margin:0}.key-panel{background:var(--el-color-primary-light-9)}pre{font:14px/1.7 monospace;white-space:pre-wrap}.key-panel p{font-size:13px}.summary li{margin:6px 0}footer{font-size:12px;color:var(--el-text-color-secondary);margin-top:20px}@media(max-width:700px){.module-desk{padding:20px 16px}h1{font-size:28px}.el-transfer{flex-direction:column;gap:16px}.el-transfer-panel{width:100%}.el-transfer__buttons{flex-direction:row;padding:0}.summary-grid{grid-template-columns:1fr}.el-card__body{padding:16px}}

```

[Code reference](https://element-plus.org/en-US/guide/theming.html)

- The breakpoint and surrounding layout are original choices.

## Implementation Starting Point

Verified with Vue 3 and Element Plus 2.14.7. App.vue supplies the English ConfigProvider and explicit component imports. All state is local.

```javascript
// Create the project first:
// npm create vite@latest element-plus-specimen -- --template vue
// cd element-plus-specimen && npm install
// In a Vite Vue 3 project:
// npm install element-plus@2.14.7
// Save the complete single-file component above as App.vue.
// main.js
import {createApp} from 'vue';
import 'element-plus/dist/index.css';
import './style.css';
import App from './App.vue';
createApp(App).mount('#app');
// index.html: <div id="app"></div>
// style.css: use the complete responsive composition above.
// Vite's standard Vue template includes @vitejs/plugin-vue for .vue files.
// Keep the template index.html and replace its entry with the code above.
// npm run dev
```

## Agent Prompt

Extend the supplied Element Plus 2.14.7 workspace module selector using native ElTransfer. Keep the six keyed modules, disabled Audit entry, filter behavior and controlled selected-key array. Applying must capture the current module selection; later edits should make that snapshot visibly stale, while restore returns the initial selection. Preserve the responsive two-panel layout and disabled-item semantics rather than rebuilding Transfer as unrelated lists. Load the native stylesheet before the original composition CSS.

## Sources

- [Transfer](https://element-plus.org/en-US/component/transfer.html) — Model keys, filtering, disabled data and empty slots.
- [Theming](https://element-plus.org/en-US/guide/theming.html) — CSS variables and Sass customization.
- [Quick start](https://element-plus.org/en-US/guide/quickstart.html) — Vue component and stylesheet setup.
- [Config Provider](https://element-plus.org/en-US/component/config-provider.html) — Locale configuration.
- [Color](https://element-plus.org/en-US/component/color.html) — Default color roles.
- [Border](https://element-plus.org/en-US/component/border.html) — Border and shape foundations.
