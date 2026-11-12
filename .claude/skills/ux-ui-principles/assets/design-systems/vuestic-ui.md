# Vuestic UI Design System — OpenDesign Application Guide

A native Vuestic critique worksheet with source-verified light and dark presets, accessible rating labels, textarea validation, a derived average and a saved state that preserves the completed assessment.

Vuestic UI 1.10.3 using the default light color preset and an explicit system-font override. Original critique questions and artwork. Saved state is local, with no external review submission or persistence across reloads.

## Source Reference

- **Library scope:** Vue 3 UI framework ([source](https://ui.vuestic.dev/))
- **Platform or architecture:** MIT-licensed open-source project ([source](https://ui.vuestic.dev/getting-started/installation/))
- **Integration:** Provides configurable components ([source](https://ui.vuestic.dev/getting-started/installation/))
- **Component support:** Includes dark theme support ([source](https://ui.vuestic.dev/getting-started/installation/))
- **Customization or behavior:** Includes global configuration ([source](https://ui.vuestic.dev/getting-started/installation/))
- **Additional capability:** Documents accessibility and internationalization integration ([source](https://ui.vuestic.dev/getting-started/installation/))


## Design Reference

Vuestic UI 1.10.3. Preset values are read from the installed color service, and component variables from its CSS. The worksheet retains the default light preset but deliberately overrides --va-font-family to system-ui. Its decorative shapes and surrounding scale are original.

### Default light color preset

[Official reference](https://ui.vuestic.dev/services/colors-config/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| primary | #154EC1 | Rating and primary action. |
| secondary | #767C88 | Secondary role. |
| success | #3D9209 | Saved result. |
| info | #158DE3 | Information role. |
| danger | #E42222 | Error role. |
| warning | #FFD43A | Warning role. |
| backgroundPrimary | #f6f6f6 | Default main surface. |
| backgroundSecondary | #FFFFFF | Default raised surface. |
| backgroundElement | #ECF0F1 | Element surface. |
| backgroundBorder | #DEE5F2 | Boundary role. |
| textPrimary | #262824 | Main text. |
| textInverted | #FFFFFF | Inverted text. |
| focus | #49A8FF | Focus role. |

### Default dark preset comparison

[Official reference](https://ui.vuestic.dev/services/colors-config/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| primary | #3472F0 | Official dark-preset reference; the local specimen remains light. |
| success | #66BE33 | Official dark-preset reference; the local specimen remains light. |
| danger | #F34030 | Official dark-preset reference; the local specimen remains light. |
| backgroundPrimary | #050A10 | Official dark-preset reference; the local specimen remains light. |
| backgroundSecondary | #1F262F | Official dark-preset reference; the local specimen remains light. |
| backgroundElement | #131A22 | Official dark-preset reference; the local specimen remains light. |
| backgroundBorder | #3D4C58 | Official dark-preset reference; the local specimen remains light. |
| textPrimary | #F1F1F1 | Official dark-preset reference; the local specimen remains light. |
| textInverted | #0B121A | Official dark-preset reference; the local specimen remains light. |

### Native CSS and explicit application scales

[Official reference](https://ui.vuestic.dev/styles/css-variables/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --va-font-family | "Source Sans Pro", sans-serif | Library default; overridden explicitly to system-ui in the example. |
| --va-button-border-radius | 0.25rem | Compiled native button radius. |
| --va-form-element-border-radius | 0.25rem | Compiled shared form radius. |
| --va-button-content-py | 0.5rem | Button vertical content padding. |
| --va-button-content-px | 0.75rem | Button horizontal content padding. |
| --va-rating-number-item-margin | 0.1em | Native number-mode spacing reference. |
| --va-rating-number-item-font-weight | 700 | Native number-mode emphasis reference. |
| Application title | 34px / 1.15; 29px narrow | Original title hierarchy. |
| Application spacing | 6 / 7 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 24 / 28 / 32px | Actual original stylesheet values, not a Vuestic token ladder. |
| Application panel radius | 14px | Original surrounding geometry. |
| Layout | Flexible form + 280px summary; stack below 760px | Content-height embedded layout. |

## Vuestic UI Design System A Configurable Vue Library with Named Color Presets

### A Configurable Vue Library with Named Color Presets

Vuestic registers its shared services through createVuestic. The example uses native components imported from vuestic-ui and the default light color preset. Rating, buttons, progress and the success alert resolve semantic color names through that same service.

The worksheet is a concrete application of those components: it separates three review questions, collects a supporting observation, calculates an average and locks a saved local result. The colored criterion marks and two-column composition are original application design, not additional Vuestic components.

[Supporting specification](https://ui.vuestic.dev/getting-started/installation/)

## Vuestic UI Design System Distinguish Service Presets from CSS Geometry Variables

### Distinguish Service Presets from CSS Geometry Variables

The verified light preset defines primary #154EC1, success #3D9209 and textPrimary #262824. Its dark preset uses different primary, text and surface values rather than merely inverting the light page. The reference table records both presets, while the preview intentionally stays in light mode.

Component geometry is configured through CSS variables such as --va-button-border-radius and --va-form-element-border-radius, both 0.25rem in the installed stylesheet. A color preset and a CSS variable override solve different problems: use the service for semantic roles and the documented variable for supported component geometry.

[Supporting specification](https://ui.vuestic.dev/services/colors-config/)

## Vuestic UI Design System Load the Required Icons and State the Font Override

### Load the Required Icons and State the Font Override

Vuestic’s default --va-font-family names Source Sans Pro. The example overrides that variable to system-ui instead of silently depending on a font that was never loaded. Native component labels and application prose therefore share an explicit available font stack.

The default rating icons use Material Icons names such as star and star_outline. Their local font stylesheet is imported from @quasar/extras and bundled with its font files. Without that asset, literal icon words can replace the expected star shapes. The icon font is kept separate from the application text-family override.

[Supporting specification](https://ui.vuestic.dev/styles/css-variables/)

## Vuestic UI Design System Use Zero as an Unanswered State Rather Than a Poor Score

### Use Zero as an Unanswered State Rather Than a Poor Score

Each VaRating binds to one criterion’s numeric value. Its max is five and clearable is enabled, so choosing the current score again can return that criterion to zero. The UI says Not rated for zero rather than presenting it as a completed zero-out-of-five judgment.

The average divides by the count of positive ratings. This avoids penalizing unanswered criteria while the worksheet is in progress. Saving still requires all three to be answered, so the final average always represents the complete assessment. Changing a rating immediately updates the completion chip, progress bar and summary.

1. Save the blank worksheet and inspect both missing-rating and note feedback.
2. Assign Clarity 4, Hierarchy 3 and Feedback 2; the average becomes 3.0.
3. Write a concrete observation and save; then use Start again to reset the full worksheet.

[Supporting specification](https://ui.vuestic.dev/ui-elements/rating/)

## Vuestic UI Design System A Useful Observation Needs Meaningful Text and Enough Space

### A Useful Observation Needs Meaningful Text and Enough Space

VaTextarea has a visible label, a four-hundred-character limit and a counter. The application checks the trimmed value for at least twenty characters after an attempted save. A string of spaces therefore cannot satisfy the requirement, even though it has a nominal character length.

The textarea enables autosize with a four-row minimum and a twelve-row maximum. That is a functional setting, not just an example prop: without autosize, the minimum-row setting did not yield the intended expanding note area. The repaired version keeps a narrow-screen observation visible while retaining normal scrolling for exceptionally long notes.

[Supporting specification](https://ui.vuestic.dev/ui-elements/textarea/)

## Vuestic UI Design System Derive Progress from Completion, Not from the Rating Average

### Derive Progress from Completion, Not from the Rating Average

The progress bar measures how many criteria have a positive answer, expressed as rated divided by three times one hundred. The large number beside it measures the quality average. These are different denominators and should not be conflated: three low scores can still produce one hundred percent completion.

The completion sentence states the numerator and denominator directly. The average is labelled Average of rated criteria, and the summary repeats each criterion’s score. Those labels let readers understand the calculation instead of interpreting an unexplained progress bar as an overall quality judgment.

[Supporting specification](https://ui.vuestic.dev/ui-elements/progress-bar/)

## Vuestic UI Design System Lock a Completed Local Assessment Until an Explicit Reset

### Lock a Completed Local Assessment Until an Explicit Reset

Save sets attempted first, then checks all ratings and the observation before enabling saved state. The saved flag makes the ratings and textarea readonly and disables the Save button. The success alert states that the assessment was saved locally and nothing was sent.

Start again clears every rating, the note, validation visibility and saved state in one handler. It is deliberately explicit because changing one value after saving would otherwise make the confirmation stale. No backend, account or review recipient is implied by the example.

[Supporting specification](https://ui.vuestic.dev/ui-elements/alert/)

## Vuestic UI Design System Name Each Rating Item with Its Criterion and Value

### Name Each Rating Item with Its Criterion and Value

The native VaRating items expose buttons in the accessibility tree. aria-item-label includes the criterion name and the value/max placeholders, producing labels such as Clarity score 4 of 5. That avoids fifteen indistinguishable star controls when three ratings appear on the same page.

The textarea has its own visible label, the progress bar has a completion label, and the saved alert is a status region. Decorative criterion marks are hidden from assistive technology. The local checks clicked actual labelled rating buttons, exercised validation and inspected the final layout at 280px rather than relying only on the presence of ARIA attributes.

- Give every repeated rating a criterion-specific item label.
- Keep unanswered and readonly states visibly distinct.
- Verify the numeric summary after interacting with the actual native controls.

[Supporting specification](https://ui.vuestic.dev/ui-elements/rating/)

## Vuestic UI Design System Include the Plugin, Component CSS and Local Icon Asset

### Include the Plugin, Component CSS and Local Icon Asset

The entry registers createVuestic and imports vuestic-ui/css before the original layout stylesheet. App.vue imports every component it uses, so the example does not depend on an undocumented auto-import configuration. The shared font override is applied after the library CSS.

The package command includes @quasar/extras only as a source of the local Material Icons font; it does not register Quasar or mix its components into the worksheet. The complete SFC and stylesheet above can be dropped into the Vite Vue setup below. The generated standalone preview inlines the required assets and does not fetch a remote font.

[Supporting specification](https://ui.vuestic.dev/getting-started/installation/)

## Component Examples

### Complete native critique worksheet

VaRating, VaTextarea, VaButton, VaChip, VaProgressBar and VaAlert connect to one assessment model.

```vue
<script setup>
import {ref,computed} from 'vue';
import {VaRating,VaTextarea,VaButton,VaAlert,VaChip,VaProgressBar} from 'vuestic-ui';
const criteria=ref([{name:'Clarity',hint:'Can you tell what the next action will do?',value:0},{name:'Hierarchy',hint:'Does the most important information stand out?',value:0},{name:'Feedback',hint:'Does the page explain what changed?',value:0}]);
const note=ref(''),attempted=ref(false),saved=ref(false);
const rated=computed(()=>criteria.value.filter(x=>x.value>0).length),average=computed(()=>rated.value?(criteria.value.reduce((a,x)=>a+x.value,0)/rated.value).toFixed(1):'—');
const noteError=computed(()=>attempted.value&&note.value.trim().length<20);
function save(){attempted.value=true;if(rated.value===3&&note.value.trim().length>=20)saved.value=true}
function reset(){criteria.value.forEach(x=>x.value=0);note.value='';saved.value=false;attempted.value=false}
</script>
<template><main class="review-shell"><header><p class="eyebrow">DESIGN CRITIQUE · PERSONAL WORKSHEET</p><h1>Turn an impression into useful feedback.</h1><p>Review an interface using three specific questions. Keep one concrete observation alongside the scores.</p></header><div class="review-layout"><section class="review-form"><div class="form-head"><h2>Your assessment</h2><VaChip outline size="small">{{rated}} of 3 rated</VaChip></div><div v-for="(criterion,index) in criteria" :key="criterion.name" class="criterion"><div class="criterion-mark" :class="'mark-'+index" aria-hidden="true"><i></i><b></b></div><div class="criterion-body"><h3>{{criterion.name}}</h3><p>{{criterion.hint}}</p><VaRating v-model="criterion.value" :max="5" clearable color="primary" :readonly="saved" :aria-label="criterion.name+' rating: '+criterion.value+' of 5'" :aria-item-label="criterion.name+' score {value} of {max}'"/><span class="score">{{criterion.value?criterion.value+' / 5':'Not rated'}}</span></div></div><p v-if="attempted&&rated<3" class="error" role="alert">Rate all three criteria before saving.</p><VaTextarea v-model="note" label="One concrete observation" placeholder="For example: the Save button gives no confirmation after the form closes." autosize :min-rows="4" :max-rows="12" :max-length="400" counter :error="noteError" :error-messages="noteError?['Write at least 20 meaningful characters.']:[]" :readonly="saved"/><div class="actions"><VaButton @click="save" :disabled="saved">Save assessment</VaButton><VaButton preset="secondary" @click="reset">Start again</VaButton></div></section><aside><div class="summary"><p class="eyebrow">ASSESSMENT SNAPSHOT</p><div class="average">{{average}}<span>/ 5</span></div><p class="average-label">Average of rated criteria</p><VaProgressBar :model-value="rated/3*100" color="primary" aria-label="Criteria completion"/><p class="completion">{{rated}} of 3 criteria completed</p><p class="guidance">A score starts a conversation. Your example explains what should change and why.</p><dl><div v-for="criterion in criteria" :key="criterion.name"><dt>{{criterion.name}}</dt><dd>{{criterion.value||'—'}}</dd></div></dl></div><VaAlert v-if="saved" color="success" outline class="saved" role="status"><strong>Assessment saved locally.</strong><p>All three criteria and your observation are captured in this preview. Nothing was sent.</p></VaAlert><p v-else class="local-note">This worksheet stores only local page state. It does not submit a review to another person.</p></aside></div></main></template>

```

[Code reference](https://ui.vuestic.dev/ui-elements/rating/)

- Zero means not rated and is excluded from the average.
- Save requires all three ratings and twenty trimmed note characters.
- Saved ratings and text become readonly until Start again.

### Complete original layout and type configuration

Explicit font override, responsive cards and decorative criterion marks.

```css
:root{--va-font-family:system-ui,sans-serif}html,body,#app{height:auto;min-height:0;margin:0}*{box-sizing:border-box}body{background:#f3f5f8;color:#262824;font-family:system-ui,sans-serif}.review-shell{max-width:1100px;margin:auto;padding:32px}.eyebrow{font-size:10px;font-weight:700;letter-spacing:.13em;color:#667182}h1{font-size:34px;line-height:1.15;margin:12px 0;max-width:710px}header>p:last-child{max-width:640px;line-height:1.6;font-size:15px;color:#677080}.review-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px;margin-top:28px}.review-form,.summary{background:white;border:1px solid #dee5f2;border-radius:14px;padding:24px;min-width:0}.form-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.form-head h2{font-size:20px;font-weight:650}.criterion{display:flex;gap:18px;padding:24px 0;border-bottom:1px solid #e6eaf0}.criterion:last-of-type{margin-bottom:24px}.criterion-body{min-width:0;flex:1}.criterion h3{font-size:16px;font-weight:650;margin:0 0 6px}.criterion p{font-size:13px;line-height:1.5;color:#677080;margin:0 0 12px}.criterion-mark{width:58px;height:58px;border-radius:12px;flex-shrink:0;position:relative;overflow:hidden;background:#e8efff}.criterion-mark i,.criterion-mark b{position:absolute;display:block}.mark-0 i{width:27px;height:27px;background:#7a9cdf;border-radius:50%;left:10px;top:14px}.mark-0 b{width:14px;height:14px;background:#154ec1;border-radius:50%;left:31px;top:22px}.mark-1{background:#eee8f8}.mark-1 i{width:15px;height:34px;background:#9273b6;left:10px;top:13px}.mark-1 b{width:15px;height:19px;background:#c2aedb;left:32px;top:28px}.mark-2{background:#e6f0e0}.mark-2 i{width:36px;height:23px;border-radius:6px;background:#86a16f;left:11px;top:14px}.mark-2 b{border:8px solid transparent;border-top-color:#86a16f;left:17px;top:33px}.score{display:block;font-size:11px;color:#667182;margin-top:7px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.average{font-size:64px;line-height:1.2;font-weight:650;margin-top:16px;color:#154ec1}.average span{font-size:19px;color:#78828f;font-weight:400;margin-left:8px}.average-label{font-size:12px;color:#697482;margin:5px 0 24px}.completion{font-size:11px;color:#687387;margin-top:10px}.guidance{font-size:14px;line-height:1.6;margin:24px 0}.summary dl>div{display:flex;justify-content:space-between;border-top:1px solid #e6eaf0;padding:12px 0;font-size:13px}.summary dd{font-weight:700}.saved{margin-top:16px;font-size:13px;line-height:1.6}.saved p{margin-top:7px}.local-note{font-size:12px;line-height:1.6;color:#687387;padding:16px 5px}.error{font-size:13px;color:#b71717;margin-bottom:16px}@media(max-width:760px){.review-shell{padding:20px}.review-layout{grid-template-columns:minmax(0,1fr)}h1{font-size:29px}}@media(max-width:360px){.review-shell{padding:14px}.review-form,.summary{padding:16px}.criterion{gap:12px}.criterion-mark{width:38px;height:48px}.criterion-mark i,.criterion-mark b{transform:scale(.7);transform-origin:left}.criterion-mark i{left:4px}.criterion-mark b{left:18px}.actions>*{width:100%}.va-textarea{max-width:100%}}

```

[Code reference](https://ui.vuestic.dev/styles/css-variables/)

- Material Icons retain their own font family.
- No document height minimum is used.

## Implementation Starting Point

Verified Vuestic UI 1.10.3 and local Material Icons from @quasar/extras 2.1.0. Both complete source examples are provided; no external font service is needed.

```javascript
// npm create vite@latest vuestic-review -- --template vue
// cd vuestic-review && npm install
// npm install vuestic-ui@1.10.3 @quasar/extras@2.1.0
// Save the complete examples as src/App.vue and src/style.css.
// src/main.js:
import {createApp} from 'vue';
import {createVuestic} from 'vuestic-ui';
import 'vuestic-ui/css';
import '@quasar/extras/material-icons/material-icons.css';
import './style.css';
import App from './App.vue';
createApp(App).use(createVuestic()).mount('#app');
// index.html: <div id="app"></div><script type="module" src="/src/main.js"></script>
// npm run dev
```

## Agent Prompt

Use Vuestic UI 1.10.3 to reproduce the design critique worksheet with three native VaRating criteria, VaTextarea, progress, status and save/reset controls. Calculate the average from rated criteria and require all three scores plus the trimmed twenty-character note before saving. Preserve the autosizing textarea so the full critique stays visible, and keep the saved readonly state and reset behavior consistent. Include createVuestic, native CSS and the local icon font. This is a local critique record, not an inspection-batch service.

## Sources

- [Installation](https://ui.vuestic.dev/getting-started/installation/) — Plugin and stylesheet setup.
- [Colors config](https://ui.vuestic.dev/services/colors-config/) — Named semantic presets.
- [CSS variables](https://ui.vuestic.dev/styles/css-variables/) — Supported component geometry and font overrides.
- [Rating](https://ui.vuestic.dev/ui-elements/rating/) — Clearable state, labels and model.
- [Textarea](https://ui.vuestic.dev/ui-elements/textarea/) — Autosize, row bounds and validation display.
- [Progress bar](https://ui.vuestic.dev/ui-elements/progress-bar/) — Value and max semantics.
- [Alert](https://ui.vuestic.dev/ui-elements/alert/) — Visible result treatment.
