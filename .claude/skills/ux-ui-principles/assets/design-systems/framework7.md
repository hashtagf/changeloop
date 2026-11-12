# Framework7 Design System — OpenDesign Application Guide

A native Framework7 sketchbook with real swipeout actions, explicit iOS theme values, a keyboard-accessible action opener and a filtered list that retains completed studies until reset.

Framework7 Core/Vue 9.2.0 with verified iOS mode. Original sketch prompts and decorative artwork. Completion is reversible local state; no map, location service, device storage or routed app is connected.

## Source Reference

- **Library scope:** Framework for mobile and desktop app interfaces ([source](https://framework7.io/))
- **Platform or architecture:** Core framework is documented ([source](https://framework7.io/docs/introduction))
- **Integration:** React integration is available ([source](https://framework7.io/docs/introduction))
- **Component support:** Vue integration is available ([source](https://framework7.io/docs/introduction))
- **Customization or behavior:** Includes application routing ([source](https://framework7.io/docs/introduction))
- **Additional capability:** Includes mobile-oriented UI components ([source](https://framework7.io/docs/introduction))


## Design Reference

Framework7 Core/Vue 9.2.0 with explicit iOS mode. Theme colors below were verified from the rendered document after initialization; list and typography values come from the shipped iOS stylesheet. Original note illustrations and outer layout are identified separately.

### Resolved iOS theme colors

[Official reference](https://framework7.io/docs/color-themes)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --f7-theme-color | #007aff | Default primary, verified in the actual iOS document. |
| --f7-theme-color-rgb | 0, 122, 255 | RGB channels for alpha calculations. |
| --f7-theme-color-shade | #0066d6 | Derived primary shade. |
| --f7-theme-color-tint | #298fff | Derived primary tint. |
| colors.green | #4cd964 | Default green named color used for swipeout completion. |
| colors.red | #ff3b30 | Default red role reference; no destructive action in this example. |
| --f7-text-color | #000 | Native iOS default text; original page prose uses #26343f. |

### Native iOS text and list geometry

[Official reference](https://framework7.io/docs/css-variables)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --f7-font-size | 14px | Framework base text size. |
| --f7-font-family | -apple-system, SF Pro Text, SF UI Text, system-ui, Helvetica Neue, Helvetica, Arial, sans-serif | Shipped iOS platform stack. |
| --f7-line-height | 1.4 | iOS base line height. |
| --f7-list-font-size | 17px | Native iOS list text. |
| --f7-list-item-padding-vertical | 12px | Native row inset. |
| --f7-list-item-padding-horizontal | 16px | Native horizontal inset. |
| --f7-list-item-min-height | 52px | Native iOS minimum row height. |
| --f7-list-item-media-margin | 16px | Native media gap. |
| --f7-list-inset-border-radius | 24px | Native inset-list radius reference. |
| --f7-list-item-subtitle-font-size | 15px | Default; original specimen overrides subtitles to 11px. |
| --f7-list-item-text-font-size | 15px | Default; original specimen overrides descriptions to 12px. |
| --f7-list-item-text-line-height | 21px | Native default description line height. |

### Explicit original embedded composition

[Official reference](https://framework7.io/vue/app-layout.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Page title | 35px / 1.15; 29px narrow | Original hierarchy. |
| Advice title | Georgia, serif; 29px | Original editorial heading. |
| Page/grid spacing | 32px page; 26px columns; 28px hero-to-grid | Original application values. |
| Main panel | 22px inset; 16px narrow; 16px radius | Original framing, independent of native inset-list defaults. |
| Grid breakpoint | 780px | Stack the advice panel below the sketch list. |
| Artwork | 48×62px list thumbnails; 170px tall route illustration | Original CSS, no map or image service. |
| Embedding reset | html/body/#app/.framework7-root height:auto; min-height:0 | Explicit specimen adaptation, not full-screen app guidance. |

## Framework7 Design System Supplies App Behavior as Well as Components

### Framework7 Supplies App Behavior as Well as Components

Framework7’s Vue integration sits on its core application runtime. The entry installs Framework7Vue on Framework7 before mounting Vue, and f7-app initializes the application that owns swipeout behavior. Importing only a few styled Vue wrappers would not supply that native interaction layer.

The local specimen keeps the scope small: three original sketch prompts, native list actions, a completion filter and reset. It does not configure a router, device bridge, map or persistent notebook. Those broader app capabilities should be added deliberately rather than implied by a mobile-looking preview.

[Supporting specification](https://framework7.io/vue/initialize-app.html)

## Framework7 Design System Verify That the Requested Platform Theme Really Applied

### Verify That the Requested Platform Theme Really Applied

This version accepts theme="ios" directly on f7-app. An old-style params object was not an equivalent working prop in the inspected component, and it initially left desktop auto-detection in Material mode. The repaired example checks the rendered html.ios class and resolved theme values before describing them as iOS.

In verified iOS mode, --f7-theme-color is #007aff, with shade #0066d6 and tint #298fff. A theme seed, a platform rendering mode and generated Material color roles are different concepts. Reading the computed value after initialization avoids documenting a color that the example does not actually display.

[Supporting specification](https://framework7.io/vue/app.html)

## Framework7 Design System Use Native Media Rows and Mark Local Type Overrides

### Use Native Media Rows and Mark Local Type Overrides

The list uses f7-list media-list with strong surfaces and iOS dividers. Each row supplies title, subtitle and text through the native list-item API, with original small illustrations in the media slot. The default iOS list minimum height is fifty-two pixels, but multi-line media content naturally makes these rows taller.

Native subtitle and description defaults are fifteen pixels. The specimen deliberately uses eleven- and twelve-pixel supporting text for these short study cards, while allowing title rows and descriptions to wrap. Those local choices are stated separately from the official variables so a reader can reproduce either the default or the specimen.

[Supporting specification](https://framework7.io/vue/list-item.html)

## Framework7 Design System A Swipeout Is a List-Item Configuration with an Action Container

### A Swipeout Is a List-Item Configuration with an Action Container

The row has swipeout enabled and contains f7-swipeout-actions on its right side. f7-swipeout-button supplies the actionable surface and closes the revealed area after activation. The application toggles the note’s done flag rather than enabling the delete prop, because completion is reversible and the record must remain available.

The native core can reveal the same actions through a gesture. A visible Actions control also calls f7.swipeout.open for the row’s stable ID. This makes the command discoverable for desktop and keyboard users instead of requiring everyone to discover a hidden horizontal gesture.

1. Activate Actions for River steps and choose Mark sketched.
2. Switch to Sketched and confirm only River steps remains visible.
3. Open its action again to undo, or reset the whole list.

[Supporting specification](https://framework7.io/vue/swipeout.html)

## Framework7 Design System Keep Completion in the Model Rather Than in a Removed Element

### Keep Completion in the Model Rather Than in a Removed Element

All three note objects stay in the Vue array. A computed collection filters them only when the Sketched segment is selected, and another computed value counts completed studies. Stable IDs connect each native action opener to the correct row even after filtering.

The action label changes from Mark sketched to Undo sketch for a completed note. There is no overswipe shortcut that unexpectedly performs an action after a long drag, and no automatic delete that removes an element without updating the application model. The same record can return to the active list without being recreated from incomplete data.

[Supporting specification](https://framework7.io/vue/swipeout.html)

## Framework7 Design System Make the Filter’s Empty State Explain the Next Action

### Make the Filter’s Empty State Explain the Next Action

When Sketched has no records, the panel explains that no studies have been marked and offers Show all studies. That control changes the same filter model as the segmented buttons. It is a real recovery path rather than a decorative empty illustration with nowhere to go.

Reset clears all completion flags, returns to All studies and announces that all three are ready again. The status text identifies the exact note after individual actions. A reload also restores the original sample data because this preview does not persist a notebook to a device or server.

[Supporting specification](https://framework7.io/vue/segmented.html)

## Framework7 Design System Adapt a Full-App Framework Carefully for Content-Height Embedding

### Adapt a Full-App Framework Carefully for Content-Height Embedding

Framework7 normally supports full-screen app layouts and page containers. This specimen has no routed pages and intentionally overrides root document height and overflow so its content determines the iframe height. Keeping a viewport-height minimum would create a feedback loop with a parent that resizes the iframe to the child document.

The native list remains inside the initialized app root. The original two-column sketch/advice layout stacks at 780px, and narrower rows reduce thumbnail width while preserving wrapped descriptions. These embedding choices should not be copied wholesale into a normal routed mobile app that relies on Framework7’s page scrolling model.

[Supporting specification](https://framework7.io/vue/app-layout.html)

## Framework7 Design System Pair Gesture Actions with an Explicit Control

### Pair Gesture Actions with an Explicit Control

The visible action opener names its row, such as Actions for River steps. The segmented choices expose pressed state, the result is a status region, and the original artwork is decorative. A user can inspect the same action without a touch gesture and hear which note changed afterward.

The local test used the visible opener to reveal the actual native swipeout surface, marked River steps, filtered the list and verified that one model-backed row remained. It also checked the rendered iOS theme and the 280px layout. The presence of swipeout CSS alone would not establish any of those behaviors.

- Keep the action opener labelled with the record name.
- Maintain a reversible model action instead of deleting only DOM.
- Test the filtered collection and status after the native action.

[Supporting specification](https://framework7.io/vue/swipeout.html)

## Framework7 Design System Install Matching Core and Vue Versions

### Install Matching Core and Vue Versions

The entry imports Framework7 from framework7/bundle, Framework7Vue from framework7-vue and the bundle stylesheet. The bundle contains the Swipeout module required by this example. Framework7.use(Framework7Vue) happens before createApp mounts the complete SFC.

Both packages are pinned to 9.2.0. The full SFC and original stylesheet above are supplied, and the root HTML in the Vite setup has the expected app mount. No icon package is needed for the visible original illustrations; the framework’s core CSS embeds its own small internal icon font.

[Supporting specification](https://framework7.io/vue/installation.html)

## Component Examples

### Complete native swipeout sketchbook

f7App, segmented buttons, media list rows and native swipeout actions with persistent Vue model state.

```vue
<script setup>
import {ref,computed} from 'vue';
import {f7App,f7List,f7ListItem,f7SwipeoutActions,f7SwipeoutButton,f7Button,f7Segmented,f7} from 'framework7-vue';
const filter=ref('all'),message=ref('');
const notes=ref([{id:'river',title:'River steps',place:'North bank · 12-minute study',description:'Look for the rhythm between the stone edges and reflected lines.',done:false},{id:'market',title:'Market awning',place:'Old square · 8-minute study',description:'Use three values to separate canvas, shade and open sky.',done:false},{id:'window',title:'Window shadows',place:'Library wall · 10-minute study',description:'Follow the long diagonal before adding the smaller window shapes.',done:false}]);
const visible=computed(()=>notes.value.filter(n=>filter.value==='all'||n.done));const done=computed(()=>notes.value.filter(n=>n.done).length);
function actions(id){f7.swipeout.open('#note-'+id,'right')}
function toggle(note){note.done=!note.done;message.value=`${note.title} ${note.done?'marked as sketched':'returned to your sketch list'}.`}
function reset(){notes.value.forEach(n=>n.done=false);filter.value='all';message.value='All three studies are ready to sketch again.'}
</script>
<template><f7-app name="Field sketchbook" theme="ios"><main class="sketch-shell"><header><p class="eyebrow">FIELD SKETCHBOOK · THREE SMALL STUDIES</p><h1>A walk worth looking at.</h1><p>Keep a short list of things to draw. Swipe a study left, or use its Actions button, to mark it as sketched.</p></header><div class="sketch-layout"><section class="sketch-list"><div class="list-heading"><h2>Today's studies</h2><span>{{done}} / 3 sketched</span></div><f7-segmented strong><f7-button type="button" :active="filter==='all'" @click="filter='all'" :aria-pressed="filter==='all'">All studies</f7-button><f7-button type="button" :active="filter==='done'" @click="filter='done'" :aria-pressed="filter==='done'">Sketched</f7-button></f7-segmented><f7-list media-list strong dividers-ios class="study-list"><f7-list-item v-for="note in visible" :id="'note-'+note.id" :key="note.id" swipeout :title="note.title" :subtitle="note.place" :text="note.description"><template #media><div class="study-art" :class="note.id" aria-hidden="true"><i></i><b></b></div></template><template #after><f7-button type="button" small @click="actions(note.id)" :aria-label="'Actions for '+note.title">Actions</f7-button></template><f7-swipeout-actions right><f7-swipeout-button role="button" @keydown.space.prevent="$event.currentTarget.click()" close color="green" @click="toggle(note)">{{note.done?'Undo sketch':'Mark sketched'}}</f7-swipeout-button></f7-swipeout-actions></f7-list-item></f7-list><div v-if="!visible.length" class="empty"><strong>No studies marked yet.</strong><p>Return to All studies and mark one after you finish drawing.</p><f7-button type="button" @click="filter='all'">Show all studies</f7-button></div><p class="result" role="status">{{message||'Your list changes only in this local preview.'}}</p><f7-button type="button" outline @click="reset">Reset sketch list</f7-button></section><aside><div class="route-art" aria-hidden="true"><i></i><b></b><span></span><em></em></div><p class="eyebrow">A SIMPLE DRAWING ROUTINE</p><h2>Look. Reduce. Draw.</h2><ol><li><strong>Look for one relationship.</strong><span>Choose an edge, a shadow or a repeated shape.</span></li><li><strong>Reduce the scene.</strong><span>Keep only three values before adding detail.</span></li><li><strong>Stop at the time limit.</strong><span>A small finished study teaches more than an unfinished page.</span></li></ol><p class="aside-note">Original sample locations and prompts. No map, location service or real-world itinerary is connected.</p></aside></div></main></f7-app></template>

```

[Code reference](https://framework7.io/vue/swipeout.html)

- theme="ios" is a direct f7-app prop in this version.
- The visible Actions control calls the native swipeout.open API.
- Marking changes the Vue object; it does not delete the DOM row.

### Complete original embedded layout

Content-height overrides, narrow row wrapping and original sketch illustrations.

```css
html,body,#app,.framework7-root{height:auto!important;min-height:0!important;overflow:visible!important;position:relative!important}body{margin:0;background:#f1f3f6;color:#26343f}*{box-sizing:border-box}.sketch-shell{max-width:1120px;margin:auto;padding:32px}.eyebrow{font-size:10px;font-weight:700;letter-spacing:.14em;color:#6b7882}h1{font-size:35px;line-height:1.15;max-width:680px;margin:12px 0}header>p:last-child{font-size:15px;line-height:1.6;max-width:650px;color:#687986}.sketch-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:26px;margin-top:28px}.sketch-list{background:white;border:1px solid #dce3e9;border-radius:16px;padding:22px;min-width:0}.list-heading{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:20px}.list-heading h2{font-size:20px;margin:0}.list-heading span{font-size:12px;color:#6d7b84}.study-list{margin:24px -22px}.study-list .item-title-row{flex-wrap:wrap;gap:7px}.study-list .item-title{white-space:normal;overflow:visible}.study-list .item-after{margin-left:0}.study-list .item-subtitle{white-space:normal;font-size:11px;color:#72808a}.study-list .item-text{font-size:12px;line-height:1.5;max-height:none;-webkit-line-clamp:unset}.study-list .item-media{align-self:flex-start;padding-top:17px}.study-art{width:48px;height:62px;background:#e0e9ef;border-radius:7px;position:relative;overflow:hidden}.study-art i,.study-art b{position:absolute;display:block}.river i{width:55px;height:28px;top:30px;left:0;background:#8eaebe;transform:rotate(-18deg)}.river b{width:24px;height:40px;left:0;top:0;background:repeating-linear-gradient(#c5c1b6 0 8px,#a7a295 8px 10px)}.market{background:#ecdcbf}.market i{width:60px;height:24px;left:-5px;top:12px;background:repeating-linear-gradient(90deg,#bc735f 0 10px,#f9e9d1 10px 20px);transform:rotate(8deg)}.market b{width:26px;height:35px;left:11px;top:37px;background:#7b8072}.window{background:#ece9df}.window i{width:25px;height:29px;left:9px;top:9px;border:5px solid #617381}.window b{width:28px;height:55px;left:22px;top:25px;background:#b1b9b9;transform:skew(25deg)}.result{font-size:12px;line-height:1.6;color:#4f6a79;min-height:38px}.empty{padding:30px 12px;text-align:center;font-size:13px;line-height:1.6}.sketch-layout aside{padding:0 4px;min-width:0}.route-art{height:170px;border-radius:14px;background:#dce8df;position:relative;overflow:hidden;margin-bottom:24px}.route-art i{position:absolute;width:190px;height:190px;border:21px solid #aac6b4;border-radius:50%;left:55px;top:34px}.route-art b{position:absolute;width:90px;height:190px;border:15px solid #f4eed9;border-radius:50%;left:23px;top:-17px;transform:rotate(-25deg)}.route-art span,.route-art em{position:absolute;width:13px;height:13px;border:3px solid white;background:#537b70;border-radius:50%;left:67px;top:111px}.route-art em{left:167px;top:52px}.sketch-layout aside h2{font-family:Georgia,serif;font-size:29px;font-weight:400}.sketch-layout ol{padding-left:20px}.sketch-layout li{padding:0 0 20px;font-size:13px;line-height:1.6}.sketch-layout li strong,.sketch-layout li span{display:block}.sketch-layout li span{color:#71808a;font-size:12px;margin-top:5px}.aside-note{font-size:11px;line-height:1.6;color:#7b8790}@media(max-width:780px){.sketch-layout{grid-template-columns:minmax(0,1fr)}.sketch-shell{padding:20px}h1{font-size:29px}}@media(max-width:360px){.sketch-shell{padding:14px}.sketch-list{padding:16px}.study-list{margin:20px -16px}.study-art{width:34px}.study-list .item-media{--f7-list-item-media-margin:10px}.study-list .item-inner{min-width:0}.study-list .item-title{font-size:15px}}

```

[Code reference](https://framework7.io/docs/css-variables)

- This reset is for an embedded specimen, not a routed full-screen app shell.
- List subtitle and description overrides are explicit.

## Implementation Starting Point

Verified matching Framework7/Core Vue 9.2.0. This is an initialized component specimen with content-height overrides, not a complete routed mobile application.

```javascript
// npm create vite@latest field-sketchbook -- --template vue
// cd field-sketchbook && npm install
// npm install framework7@9.2.0 framework7-vue@9.2.0
// Save the complete examples as src/App.vue and src/style.css.
// src/main.js:
import {createApp} from 'vue';
import Framework7 from 'framework7/bundle';
import Framework7Vue from 'framework7-vue';
import 'framework7/css/bundle';
import './style.css';
import App from './App.vue';
Framework7.use(Framework7Vue);
createApp(App).mount('#app');
// index.html: <div id="app"></div><script type="module" src="/src/main.js"></script>
// npm run dev
```

## Agent Prompt

Use Framework7 Core/Vue 9.2.0 with the supplied Field sketchbook, explicit theme="ios" and native media-list swipeout anatomy. Keep the three sketch studies, their reversible done flags and All/Sketched filtering. Visible Actions buttons should call f7.swipeout.open; completion toggles model state rather than deleting the row. Preserve type="button" on f7-button and the swipeout command’s button semantics and Space support. Keep the content-height embedding CSS, empty-filter recovery and reset. No itinerary or location service is required.

## Sources

- [Vue installation](https://framework7.io/vue/installation.html) — Core/Vue integration.
- [App component](https://framework7.io/vue/app.html) — Direct theme and application props.
- [Swipeout](https://framework7.io/vue/swipeout.html) — Action containers, native open/close and deletion behavior.
- [List item](https://framework7.io/vue/list-item.html) — Media slots, title and description APIs.
- [Segmented](https://framework7.io/vue/segmented.html) — Grouped selection presentation.
- [CSS variables](https://framework7.io/docs/css-variables) — Platform-dependent typography and geometry.
- [Color themes](https://framework7.io/docs/color-themes) — Theme roles and named colors.
- [App layout](https://framework7.io/vue/app-layout.html) — Normal full-screen application boundary.
