# Oruga UI Design System — OpenDesign Application Guide

A native Oruga catalog editor with searchable, removable topic tags, enforced vocabulary limits, an optional theme’s real tokens and a live card that reflects the selected labels.

Oruga 0.14.4 with optional default theme 0.10.0. Original vocabulary and catalog illustration. Save changes local page state only, with no upload, publication or persistence across reloads.

## Source Reference

- **Library scope:** Vue component library ([source](https://oruga-ui.com/))
- **Platform or architecture:** CSS-framework agnostic ([source](https://oruga-ui.com/documentation/))
- **Integration:** Default setup does not require a CSS framework ([source](https://oruga-ui.com/documentation/))
- **Component support:** Class mapping supports customization ([source](https://oruga-ui.com/documentation/))
- **Customization or behavior:** Components can be themed ([source](https://oruga-ui.com/documentation/))
- **Additional capability:** Components are tree-shakeable ([source](https://oruga-ui.com/documentation/))


## Design Reference

Oruga Vue 3 package 0.14.4 with @oruga-ui/theme-oruga 0.10.0. Values below belong to that optional default theme, not to an immutable headless core. MDI 7.4.47 icons are supplied locally. The surrounding catalog composition and folder artwork are original.

### Optional Oruga theme semantic colors

[Official reference](https://oruga-ui.com/documentation/themes)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --oruga-primary | #445e00 | Selected tags and main action. |
| --oruga-primary-invert | #fff | Text on primary tags. |
| --oruga-success | #006724 | Success variant. |
| --oruga-info | #005c98 | Information variant. |
| --oruga-warning | #f4c300 | Warning variant. |
| --oruga-danger | #b60000 | Field error variant. |
| --oruga-control-border-color | #dbdbdb | Default field boundary. |

### Optional theme type, spacing and geometry

[Official reference](https://oruga-ui.com/documentation/themes)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --oruga-font-size | 1rem | Default text size. |
| --oruga-line-height | 1.5 | Default line-height ratio. |
| --oruga-border-radius | 4px | Standard control corners. |
| --oruga-control-spacer | .5em | Shared control spacing. |
| --oruga-control-height | 2.25em | Control height relative to its font. |
| --oruga-control-padding-vertical | calc(.375em - 1px) | Vertical inset accounting for border. |
| --oruga-control-padding-horizontal | calc(.8em - 1px) | Horizontal inset accounting for border. |
| --oruga-control-disabled-opacity | .5 | Disabled visual state. |
| --oruga-animation-speed-fast | .15s | Fast transition duration. |
| --oruga-animation-speed | .3s | Standard transition duration. |

### Explicit original application scales

[Official reference](https://oruga-ui.com/components/taginput)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Font stack | system-ui, sans-serif | Outer application text; optional theme also uses a platform font stack. |
| Page title | 34px / 1.15; 29px narrow | Original hierarchy. |
| Catalog card title | Georgia, serif; 29px / 1.25 | Original editorial contrast, not an Oruga default. |
| Supporting type | 10 / 11 / 12 / 13 / 14 / 15px | Explicit original captions, definitions and prose. |
| Spacing | 4 / 5 / 7 / 12 / 13 / 14 / 16 / 20 / 22 / 24 / 28 / 32px | Actual layout values; the headless library supplies no grid scale. |
| Layout | Flexible editor + 330px catalog card; stack at 760px | Original grid. |
| Topic constraints | 1–3 unique existing labels | allow-new=false, allow-duplicates=false, maxitems=3. |
| Title constraint | 5–80 characters; minimum evaluated after trim | Application validation plus native length bound. |

## Oruga UI Design System Separate Oruga’s Component Behavior from Its Optional Theme

### Separate Oruga’s Component Behavior from Its Optional Theme

Oruga provides Vue components without requiring a particular CSS framework. This example pairs the Vue 3 package with the separate Oruga default theme. The selected green tags and outlined fields come from that theme, while search, selection and removal are native component behavior.

This boundary is useful when assessing the library. A team can retain the component API and replace class configuration or choose another supported theme. The reference table therefore names the theme package and version instead of describing its green primary color as a universal requirement of every Oruga application.

[Supporting specification](https://oruga-ui.com/documentation/)

## Oruga UI Design System Use the Actual Default Theme Variables

### Use the Actual Default Theme Variables

The installed optional theme defines --oruga-primary as #445e00 and --oruga-primary-invert as white. Danger is #b60000, and control borders use #dbdbdb. The component variant prop selects the appropriate semantic family rather than requiring a separate CSS rule for each field or tag.

The same theme defines a four-pixel standard radius, a 2.25em control height and padding formulas that subtract the one-pixel border. Because these values are relative to control text, changing the font scale affects geometry. The theme’s half-em spacer is a component relationship, not evidence of a complete page-layout spacing scale.

[Supporting specification](https://oruga-ui.com/documentation/themes)

## Oruga UI Design System Provide the Layout Oruga Intentionally Does Not Impose

### Provide the Layout Oruga Intentionally Does Not Impose

The catalog uses a flexible editor column and a 330px card column, stacking below 760px. The page title uses system sans, while the card title uses Georgia to suggest an editorial record. Both choices are original; no external font file is needed for them.

Oruga does not prescribe a grid or utility framework. The complete stylesheet therefore makes panel padding, narrow-screen insets and wrapping rules visible to the reader. The tag counter keeps its numerator and denominator together, and the card title allows long note names to wrap rather than pushing the embedded page sideways.

[Supporting specification](https://oruga-ui.com/documentation/)

## Oruga UI Design System Keep Selected Values Separate from the Search Query

### Keep Selected Values Separate from the Search Query

OTaginput binds its selected topic array through v-model. Its internal autocomplete text filters candidate labels without replacing that array. The vocabulary has six original topics with concrete definitions, and the live card repeats definitions only for the selected topics.

The default search comparison is case-insensitive. The local test typed Color and waited for filtering to settle before selecting the resulting option. An immediate assertion during the input’s debounce would incorrectly suggest that filtering had failed. Selection then clears the query while preserving previously chosen tags.

1. Search Color and select the matching option.
2. Add Forms to reach three topics alongside Navigation.
3. Remove a tag, confirm the card changes, and choose a replacement before saving.

[Supporting specification](https://oruga-ui.com/components/taginput)

## Oruga UI Design System Control Vocabulary, Duplicates and Count Independently

### Control Vocabulary, Duplicates and Count Independently

allow-new=false prevents an arbitrary typed phrase from becoming a label. allow-duplicates=false prevents the same existing label from being added twice. maxitems=3 limits total selections and displays the counter. Each setting protects a different aspect of a controlled vocabulary.

The application still checks that at least one topic is selected when Save is attempted. Maximum selection behavior does not imply a minimum requirement. It also checks the trimmed title for five meaningful characters, while the native input’s maxlength limits the outer bound to eighty characters.

[Supporting specification](https://oruga-ui.com/components/taginput)

## Oruga UI Design System Use OField for Labels and Specific Validation Messages

### Use OField for Labels and Specific Validation Messages

OField supplies the visible Note title and Topics labels and their messages. After an invalid save, the relevant field receives a danger variant and a concrete correction message. The topic guidance explains the available range and vocabulary restriction before an error occurs.

The native tag-input dropdown follows a combobox/listbox pattern. In this version the combobox role belongs to a wrapper and the editable textbox is nested inside it. The QA therefore fills the actual Search topics input instead of assuming the element with the combobox role is itself an input.

[Supporting specification](https://oruga-ui.com/components/field)

## Oruga UI Design System A Default Icon Pack Still Needs Its Font Asset

### A Default Icon Pack Still Needs Its Font Asset

The tag removal control uses Oruga’s default MDI icon pack. Loading the component theme does not automatically load that font, so the complete setup includes @mdi/font. The standalone preview keeps a local WOFF2 asset and the required icon rules, avoiding a remote font dependency.

Removal remains a real button with an accessible Remove topic label. The decorative folder illustration is unrelated to those control icons and is hidden from assistive technology. This distinction prevents an ornamental mark from being mistaken for an actionable control.

[Supporting specification](https://oruga-ui.com/components/icon)

## Oruga UI Design System Invalidate a Saved Snapshot When Its Inputs Change

### Invalidate a Saved Snapshot When Its Inputs Change

The Save action records a sentence naming the trimmed title and selected topic count. A watcher observes both the title and the topic array deeply; removing an item therefore clears the confirmation just as changing the title does. Save is disabled only while the current snapshot remains saved.

Clear note resets the title, all selected topics, attempted validation and saved status. The card then says Untitled research note and No topics selected. The user can see the whole empty-to-edited-to-saved loop without a backend, upload or publishing operation hidden behind the button.

- Preserve the selected-array model while the query changes.
- Clear saved feedback on nested array mutations.
- Describe the result as local state, not publication.

[Supporting specification](https://oruga-ui.com/components/button)

## Oruga UI Design System Import Components Explicitly with Current Oruga Registration

### Import Components Explicitly with Current Oruga Registration

The verified 0.14.4 setup creates an Oruga instance and installs it on the Vue app. App.vue imports OField, OInput, OTaginput, OTag and OButton explicitly. This follows the current registration model; relying on older examples that assumed all components were globally registered can leave an application incomplete.

The theme README states that this default theme uses Oruga’s existing class names and needs its stylesheet, without an additional theme configuration object. The entry imports that stylesheet, the MDI asset and the original layout in order. The complete source examples above and the Vite root below contain every required piece.

[Supporting specification](https://oruga-ui.com/documentation/)

## Component Examples

### Complete topic catalog SFC

OTaginput, OField, OInput, OTag and OButton connect a constrained vocabulary to a live catalog card.

```vue
<script setup>
import {ref,computed,watch} from 'vue';
import {OField,OInput,OTaginput,OButton,OTag} from '@oruga-ui/oruga-next';
const title=ref('Finding a calmer navigation'),topics=ref(['Navigation']),attempted=ref(false),saved=ref('');
const definitions={'Navigation':'Menus, wayfinding and the path through a product.','Typography':'Type hierarchy, reading rhythm and legibility.','Color':'Semantic roles, contrast and theme behavior.','Forms':'Input labels, validation and correction.','Motion':'Transitions, reduced motion and continuity.','Accessibility':'Keyboard flow, semantics and assistive technology.'};
const options=Object.keys(definitions),valid=computed(()=>title.value.trim().length>=5&&topics.value.length>=1&&topics.value.length<=3);
watch([title,topics],()=>saved.value='',{deep:true});
function save(){attempted.value=true;if(valid.value)saved.value=`Saved locally: “${title.value.trim()}” with ${topics.value.length} ${topics.value.length===1?'topic':'topics'}.`}
function reset(){title.value='';topics.value=[];attempted.value=false;saved.value=''}
</script>
<template><main class="catalog-shell"><header><p class="eyebrow">RESEARCH CATALOG · LABEL A NOTE</p><h1>Give the next reader a useful starting point.</h1><p>Name a research note and choose up to three topics from a controlled vocabulary.</p></header><div class="catalog-layout"><section class="editor"><h2>Note details</h2><OField label="Note title" :variant="attempted&&title.trim().length<5?'danger':undefined" :message="attempted&&title.trim().length<5?'Use at least five meaningful characters.':undefined"><OInput v-model="title" maxlength="80" expanded placeholder="What did you learn?"/></OField><OField label="Topics" :variant="attempted&&!topics.length?'danger':undefined" :message="attempted&&!topics.length?'Choose at least one topic.':'Choose 1–3 existing topics; duplicate and new labels are not added.'"><OTaginput v-model="topics" :options="options" :allow-new="false" :allow-duplicates="false" :maxitems="3" open-on-focus :keep-open="false" expanded variant="primary" placeholder="Search topics" aria-close-label="Remove topic"><template #empty>No matching topic. Try Color, Forms or Motion.</template></OTaginput></OField><div class="actions"><OButton variant="primary" @click="save" :disabled="!!saved">Save local note</OButton><OButton @click="reset">Clear note</OButton></div><p role="status" class="result">{{saved||'The preview keeps only local page state.'}}</p><h3>Vocabulary guide</h3><dl class="vocabulary"><div v-for="(meaning,name) in definitions" :key="name"><dt>{{name}}</dt><dd>{{meaning}}</dd></div></dl></section><aside class="note-card"><div class="folder-art" aria-hidden="true"><i></i><b></b><span></span></div><p class="eyebrow">CATALOG CARD PREVIEW</p><h2>{{title.trim()||'Untitled research note'}}</h2><div class="topic-tags"><OTag v-for="topic in topics" :key="topic" variant="primary">{{topic}}</OTag><span v-if="!topics.length" class="empty-topics">No topics selected</span></div><p class="card-label">This note will appear under</p><ul><li v-for="topic in topics" :key="topic"><strong>{{topic}}</strong><span>{{definitions[topic]}}</span></li></ul><p class="card-foot">Original sample note · no upload or publishing</p></aside></div></main></template>

```

[Code reference](https://oruga-ui.com/components/taginput)

- The selected-array model is different from the inner search text.
- Selection is limited to existing, nonduplicate labels.
- A deep watcher clears saved confirmation after a topic is removed.

### Complete original catalog layout

Responsive editor/card grid, controlled wrapping and an original CSS folder illustration.

```css
html,body,#app{height:auto;min-height:0;margin:0}*{box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f4f4ed;color:#34392b}.catalog-shell{max-width:1100px;margin:auto;padding:32px}.eyebrow{font-size:10px;letter-spacing:.14em;font-weight:700;color:#6e775f}h1{font-size:34px;line-height:1.15;max-width:700px;margin:12px 0}header>p:last-child{font-size:15px;line-height:1.6;color:#727965;max-width:630px}.catalog-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:24px;margin-top:28px}.editor,.note-card{background:white;border:1px solid #dfe3d4;border-radius:14px;padding:24px;min-width:0}.editor>h2{font-size:20px;margin:0 0 24px}.editor .o-field{margin-bottom:22px}.editor .o-field__message{font-size:12px;line-height:1.6}.actions{display:flex;gap:12px;flex-wrap:wrap}.result{font-size:12px;line-height:1.6;color:#596d2e;margin:16px 0 28px}.editor h3{font-size:14px}.vocabulary{margin:0}.vocabulary>div{padding:12px 0;border-bottom:1px solid #eaede3}.vocabulary dt{font-size:13px;font-weight:650}.vocabulary dd{font-size:12px;line-height:1.6;margin:4px 0 0;color:#707763}.note-card{align-self:start;background:#fcfcf5}.note-card h2{font-family:Georgia,serif;font-size:29px;line-height:1.25;font-weight:400;overflow-wrap:anywhere}.folder-art{height:145px;background:#e3e8cf;border-radius:8px;position:relative;overflow:hidden;margin-bottom:24px}.folder-art i{position:absolute;left:15%;top:40px;width:70%;height:100px;border-radius:7px;background:#7e8e52;transform:rotate(-8deg)}.folder-art b{position:absolute;left:21%;top:24px;width:60%;height:115px;background:#fffef5;transform:rotate(5deg);border-radius:4px}.folder-art span{position:absolute;left:16%;top:71px;width:70%;height:80px;background:#a6b57a;border-radius:7px}.topic-tags{display:flex;gap:7px;flex-wrap:wrap}.card-label{font-size:11px;color:#737b65;margin-top:24px}.note-card ul{list-style:none;padding:0}.note-card li{border-top:1px solid #e0e4d6;padding:13px 0}.note-card li strong{font-size:13px;display:block}.note-card li span{font-size:12px;color:#6c765b;line-height:1.6;display:block;margin-top:5px}.card-foot{font-size:10px;line-height:1.6;color:#7c846e;margin-top:20px}.empty-topics{font-size:12px;color:#7c846e}.o-taginput{max-width:100%}.o-taginput__container{min-width:0}.o-taginput .o-input{min-width:0}@media(max-width:760px){.catalog-layout{grid-template-columns:minmax(0,1fr)}.catalog-shell{padding:20px}h1{font-size:29px}}@media(max-width:360px){.catalog-shell{padding:14px}.editor,.note-card{padding:16px}.actions>*{width:100%}}
.o-taginput__counter{white-space:nowrap;flex-shrink:0}

```

[Code reference](https://oruga-ui.com/documentation/configuration)

- Oruga supplies no required grid system; this layout is explicit application CSS.
- Counter text stays on one line at narrow widths.

## Implementation Starting Point

Verified Oruga 0.14.4, optional default theme 0.10.0 and MDI 7.4.47. Components are explicitly imported; the default theme needs no extra JavaScript theme configuration.

```javascript
// npm create vite@latest oruga-catalog -- --template vue
// cd oruga-catalog && npm install
// npm install @oruga-ui/oruga-next@0.14.4 @oruga-ui/theme-oruga@0.10.0 @mdi/font@7.4.47
// Save the complete examples as src/App.vue and src/style.css.
// src/main.js:
import {createApp} from 'vue';
import {createOruga} from '@oruga-ui/oruga-next';
import '@oruga-ui/theme-oruga/style.css';
import '@mdi/font/css/materialdesignicons.css';
import './style.css';
import App from './App.vue';
createApp(App).use(createOruga()).mount('#app');
// index.html: <div id="app"></div><script type="module" src="/src/main.js"></script>
// npm run dev
```

## Agent Prompt

Start with the Oruga 0.14.4 research note catalog and its 0.10.0 theme. Preserve OTaginput controlled selection from the six-topic vocabulary, case-insensitive search, disabled new/duplicate tags and the three-tag maximum. Keep the live topic definitions and title validation connected to the saved snapshot, clearing saved feedback after changes. Include createOruga, theme CSS and the local MDI asset setup. Reset to an empty draft; do not invent product comparison data or a remote catalog update.

## Sources

- [Introduction](https://oruga-ui.com/documentation/) — Current plugin and explicit component registration.
- [Theme choices](https://oruga-ui.com/documentation/themes) — Optional styling boundary.
- [Configuration](https://oruga-ui.com/documentation/configuration) — Global and local class customization.
- [Tag input](https://oruga-ui.com/components/taginput) — Vocabulary constraints, model, limits and removal.
- [Autocomplete](https://oruga-ui.com/components/autocomplete) — Filtering, nested combobox behavior and native popover.
- [Field](https://oruga-ui.com/components/field) — Visible labels and validation messages.
- [Icon](https://oruga-ui.com/components/icon) — Icon-pack configuration.
- [Default theme source](https://github.com/oruga-ui/theme-oruga) — Official theme setup and token source.
