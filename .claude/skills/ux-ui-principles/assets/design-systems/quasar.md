# Quasar Design System — OpenDesign Application Guide

A native Quasar guided workflow with actual brand and spacing values, QForm validation, a three-step brief builder, radio format choices and a live forty-five-minute agenda.

Quasar 2.34.0 with native components and local Material Icons. Original agendas and visual artwork are sample content. Saving neither creates a calendar event nor sends invitations.

## Source Reference

- **Library scope:** Vue-based application framework ([source](https://quasar.dev/))
- **Platform or architecture:** Provides its own UI component library ([source](https://quasar.dev/start/quick-start/))
- **Integration:** CLI project creation is documented ([source](https://quasar.dev/start/quick-start/))
- **Component support:** Supports multiple application deployment modes ([source](https://quasar.dev/start/quick-start/))
- **Customization or behavior:** Components include QTable and QForm ([source](https://quasar.dev/start/quick-start/))
- **Additional capability:** Layout components organize application shells ([source](https://quasar.dev/start/quick-start/))


## Design Reference

Quasar 2.34.0 with Vue 3. Colors are actual --q-* runtime variables; spacing and typography references come from its Sass defaults. The application heading, agenda artwork and system-font override are original. Material Icons are supplied locally through @quasar/extras 2.1.0.

### Default Quasar brand roles

[Official reference](https://quasar.dev/style/color-palette/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --q-primary | #1976D2 | Stepper state, main action and slider. |
| --q-secondary | #26A69A | Secondary role. |
| --q-accent | #9C27B0 | Accent role. |
| --q-positive | #21BA45 | Positive feedback role. |
| --q-negative | #C10015 | Validation/error role. |
| --q-info | #31CCEC | Information role. |
| --q-warning | #F2C037 | Warning role. |

### Native spacing helpers

[Official reference](https://quasar.dev/style/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $space-base | 16px | Base Sass spacing unit. |
| q-pa-xs / q-ma-xs | 4px | Quarter-base spacing. |
| q-pa-sm / q-ma-sm | 8px | Half-base spacing. |
| q-pa-md / q-ma-md | 16px | Base spacing. |
| q-pa-lg / q-ma-lg | 24px | One-and-a-half base spacing. |
| q-pa-xl / q-ma-xl | 48px | Three-base spacing. |
| q-mt-md | 16px top margin | Used above the remote-participation toggle. |
| q-ml-sm | 8px left margin | Used between navigation actions. |

### Native typography class scale

[Official reference](https://quasar.dev/style/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| text-h4 | 2.125rem / 2.5rem, weight 400 | Default display heading utility. |
| text-h5 | 1.5rem / 2rem, weight 400 | Default section heading utility. |
| text-h6 | 1.25rem / 2rem, weight 500 | Default small heading utility. |
| text-body1 | 1rem / 1.5rem, weight 400 | Default large body utility. |
| text-body2 | 0.875rem / 1.25rem, weight 400 | Default compact body utility. |
| Application font | system-ui, sans-serif | Explicit original override; Quasar’s default Roboto family is not downloaded here. |

### Breakpoints and explicit application geometry

[Official reference](https://quasar.dev/style/breakpoints/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sm minimum | 600px | Native Quasar breakpoint start. |
| md minimum | 1024px | Native Quasar breakpoint start. |
| lg minimum | 1440px | Native Quasar breakpoint start. |
| xl minimum | 1920px | Native Quasar breakpoint start. |
| Application stack breakpoint | 740px | Original two-column-to-stacked transition. |
| Page title | 34px / 1.15; 29px mobile | Original type hierarchy. |
| Page gap / padding | 24px / 32px | Original surrounding composition. |
| Participants slider | min 2, max 16, step 1 | Actual QSlider props; not a visual-only range. |

## Quasar Design System Components Can Build a Complete Guided Task

### Quasar Components Can Build a Complete Guided Task

Quasar provides Vue components together with styling helpers and an application framework. This specimen uses the components directly in a Vue 3 entry: a native stepper coordinates a form, radio group, slider, toggle and final confirmation. It does not require a full-screen QLayout shell merely to demonstrate those controls.

The session brief has a specific purpose: choose a working format and group setup while seeing a corresponding agenda. The component library supplies the controls and navigation states; the three original agendas and their forty-five-minute totals are application content. No scheduling service is implied.

[Supporting specification](https://quasar.dev/start/vite-plugin/)

## Quasar Design System Brand Variables and Named Palette Classes Coexist

### Brand Variables and Named Palette Classes Coexist

The runtime --q-primary value is #1976D2 in the verified default stylesheet. QStepper, QBtn and QSlider receive color="primary", so their primary styling follows that role. Secondary, accent, positive, negative, info and warning remain separate named roles rather than ad hoc colors chosen for each control.

The saved banner uses named green palette utilities for a pale surface and dark text. Its explicit sentence communicates success as well as color. The blue ring illustration is original decorative artwork and is hidden from assistive technology; it does not encode an additional form state.

[Supporting specification](https://quasar.dev/style/color-palette/)

## Quasar Design System Read the Quasar Spacing Suffixes Literally

### Read the Quasar Spacing Suffixes Literally

Quasar spacing classes combine type, direction and size. q-mt-md means margin-top at the medium value; q-ml-sm adds a small left margin. The default base is sixteen pixels, with xs four, sm eight, md sixteen, lg twenty-four and xl forty-eight. The jump to xl is three base units, not a guessed thirty-two-pixel step.

The page uses these native helpers inside the controls and original CSS for the wider composition. Default typography utilities include text-body2 at 0.875rem and text-h5 at 1.5rem. The original page title is thirty-four pixels, and the page explicitly switches the font to system-ui while preserving Material Icons for native component glyphs.

[Supporting specification](https://quasar.dev/style/spacing/)

## Quasar Design System A Stepper Does Not Validate the Form by Itself

### A Stepper Does Not Validate the Form by Itself

QStepper holds the current step number and contains three named QStep sections. A step is marked done only after navigation has moved past it. The specimen uses a vertical orientation in both layouts, retaining a clear sequence without squeezing three horizontal headers on a phone.

The first Continue action belongs to QForm. Its handler awaits validate before assigning step two. Header navigation is not enabled, so clicking a future heading cannot bypass that gate. Back actions deliberately preserve the title, format and group values because those models live in the parent SFC rather than inside an unmounted field.

[Supporting specification](https://quasar.dev/vue-components/stepper/)

## Quasar Design System QForm Uses Internal Rules, Not Every Native Constraint

### QForm Uses Internal Rules, Not Every Native Constraint

The title QInput has an internal rules array that trims whitespace and requires five meaningful characters. That rule participates in QForm.validate. A native required or email attribute alone is not a substitute for the rule when calling validate programmatically, which is why the working example expresses the actual constraint directly.

An invalid attempt shows the field error and keeps the user on the first step. Correcting the input allows the same Continue button to advance. The sixty-character limit and visible counter help the title fit the brief, while the inline rule explains why a short or blank title cannot proceed.

1. Submit the first step with an empty title to inspect the validation message.
2. Enter a meaningful title and choose a session format.
3. Continue and return with Back to confirm the input values survive navigation.

[Supporting specification](https://quasar.dev/vue-components/form/)

## Quasar Design System Radio, Slider and Toggle Represent Different Decisions

### Radio, Slider and Toggle Represent Different Decisions

QOptionGroup represents one choice among Design critique, Sketching session and Research synthesis. Changing it selects a corresponding agenda array. The agenda lengths are fixed sample content, so a change of format updates the named activities while preserving the forty-five-minute total.

QSlider controls an integer participant count from two to sixteen. QToggle records whether remote participants are included. The adjacent hint changes from one shared table to a shared board and remote facilitation. These controls alter the visible brief rather than functioning as disconnected demo widgets.

[Supporting specification](https://quasar.dev/vue-components/option-group/)

## Quasar Design System The Final Step Locks a Local Result Until Reset

### The Final Step Locks a Local Result Until Reset

The review step repeats the trimmed title, format, participant count and participation mode. Saving changes a local saved flag, disables Save and Back, and reveals a banner naming the group size. Start another clears all models and returns to step one, giving the example an observable complete loop.

There is no request to a calendar or messaging API. The banner explicitly states that no invitation was sent, and the review copy says saving does not create an event. A production scheduler would need date, timezone, recipients and a real backend response before making such a claim.

[Supporting specification](https://quasar.dev/vue-components/banner/)

## Quasar Design System Use Native Component Semantics and Real Focus Tests

### Use Native Component Semantics and Real Focus Tests

The native controls provide radio, slider and switch roles. The slider receives a Participants label, and the title field has a visible label and field-level validation message. The stepper identifies the current step and labels its content using the step title. The example leaves decorative artwork out of the accessible reading sequence.

The local test changed the slider with the keyboard, toggled remote participation, advanced through validation and saved a nine-person hybrid brief. It also checked the narrow layout. A static picture of a stepper would not establish those relationships or prove that the validation gate is connected.

- Keep the active step and its content title consistent.
- Validate through rules before changing the step model.
- Use a status banner that describes the exact local result.

[Supporting specification](https://quasar.dev/vue-components/stepper/)

## Quasar Design System Include Quasar CSS and the Icon Set It Expects

### Include Quasar CSS and the Icon Set It Expects

The entry file imports Quasar, registers its plugin, loads quasar/dist/quasar.css and imports the Material Icons stylesheet from @quasar/extras. The SFC imports the components it uses. The local bundle inlines the icon font files so checkmarks and edit indicators render without a remote font request.

The original stylesheet follows Quasar CSS and resets document height to content for embedding. It does not globally restyle every native component or invent a replacement spacing scale. A full Quasar CLI or Vite-plugin application can use its standard build integration; this complete sample demonstrates the same components in a small Vue entry.

[Supporting specification](https://quasar.dev/start/vite-plugin/)

## Component Examples

### Complete native stepper workflow

QStepper/QStep, QForm/QInput, QOptionGroup, QSlider, QToggle and a derived agenda.

```vue
<script setup>
import {ref,computed} from 'vue';import {QStepper,QStep,QStepperNavigation,QForm,QInput,QOptionGroup,QSlider,QToggle,QBtn,QCard,QCardSection,QBadge,QBanner} from 'quasar';
const step=ref(1),title=ref(''),format=ref('critique'),people=ref(8),remote=ref(false),saved=ref(false),form=ref();const formats=[{label:'Design critique',value:'critique'},{label:'Sketching session',value:'sketch'},{label:'Research synthesis',value:'research'}];const names={critique:'Design critique',sketch:'Sketching session',research:'Research synthesis'};const agenda=computed(()=>format.value==='critique'?[['10 min','Set the question'],['25 min','Review the work'],['10 min','Choose next actions']]:format.value==='sketch'?[['5 min','Frame the prompt'],['25 min','Sketch independently'],['15 min','Compare directions']]:[['10 min','Sort observations'],['20 min','Name the patterns'],['15 min','Record open questions']]);async function next(){if(await form.value.validate())step.value=2;}function reset(){step.value=1;title.value='';format.value='critique';people.value=8;remote.value=false;saved.value=false;}
</script>
<template><main class="session-builder"><header><div><p class="eyebrow">QUASAR · GUIDED WORKFLOW</p><h1>Make time for better work.</h1><p class="intro">Build a small session brief with a native stepper, validated fields and a live agenda.</p></div><QBadge color="primary" label="45 MINUTES"/></header><div class="builder-grid"><QStepper v-model="step" vertical color="primary" animated flat bordered class="session-stepper"><QStep :name="1" prefix="1" title="Name the session" caption="Purpose and format" :done="step>1"><QForm ref="form" @submit="next"><QInput v-model="title" outlined label="Session title" maxlength="60" counter lazy-rules :rules="[v=>v.trim().length>=5||'Use at least five non-space characters.']"/><p class="field-label">Session format</p><QOptionGroup v-model="format" :options="formats" color="primary"/><QStepperNavigation><QBtn color="primary" label="Continue" type="submit" no-caps/></QStepperNavigation></QForm></QStep><QStep :name="2" prefix="2" title="Shape the group" caption="People and participation" :done="step>2"><p class="field-label">Participants: <strong>{{people}}</strong></p><QSlider v-model="people" :min="2" :max="16" :step="1" label color="primary" aria-label="Participants"/><QToggle v-model="remote" label="Include remote participants" color="primary" class="q-mt-md"/><p class="hint">{{remote?'Reserve a shared board and a facilitator for the remote group.':'Use one shared table and keep the work visible to everyone.'}}</p><QStepperNavigation><QBtn color="primary" label="Review brief" no-caps @click="step=3"/><QBtn flat label="Back" no-caps class="q-ml-sm" @click="step=1"/></QStepperNavigation></QStep><QStep :name="3" prefix="3" title="Review the brief" caption="Save a local snapshot"><p class="review-title">{{title.trim()}}</p><p>{{names[format]}} · {{people}} people · {{remote?'Hybrid':'In person'}}</p><p class="hint">The agenda totals 45 minutes. Saving does not create a calendar event or invite anyone.</p><QStepperNavigation><QBtn color="primary" :label="saved?'Saved locally':'Save local brief'" :disable="saved" no-caps @click="saved=true"/><QBtn flat label="Back" no-caps class="q-ml-sm" :disable="saved" @click="step=2"/></QStepperNavigation><QBanner v-if="saved" rounded class="bg-green-1 text-green-10 q-mt-lg" role="status">Local brief saved for {{people}} people. No invitation was sent.<template #action><QBtn flat label="Start another" no-caps @click="reset"/></template></QBanner></QStep></QStepper><QCard flat bordered class="agenda-card"><QCardSection><p class="eyebrow">LIVE AGENDA</p><h2>{{title.trim()||'Your next working session'}}</h2><p class="agenda-format">{{names[format]}}</p><div class="time-art" aria-hidden="true"><i></i><i></i><i></i><span>45′</span></div><ol class="agenda-list"><li v-for="row in agenda" :key="row[1]"><span>{{row[0]}}</span><strong>{{row[1]}}</strong></li></ol><div class="session-meta"><span>{{people}} participants</span><span>{{remote?'Hybrid setup':'One shared table'}}</span></div><p class="local-note">Original sample agenda. Quasar supplies the form and navigation components.</p></QCardSection></QCard></div></main></template>

```

[Code reference](https://quasar.dev/vue-components/stepper/)

- The first transition waits for QForm.validate().
- The title rule checks meaningful trimmed length.
- The review step does not create a calendar event.

### Original agenda composition

Responsive layout and decorative time illustration around native Quasar components.

```css
html,body{height:auto;min-height:0}body{background:#f3f5f8;font-family:system-ui,sans-serif}.session-builder{max-width:1120px;padding:32px;margin:auto}header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:32px}.eyebrow{font-size:11px;font-weight:650;letter-spacing:.13em;color:#5c6c80}h1{font-size:34px;line-height:1.15;font-weight:650;margin:14px 0;letter-spacing:-.02em}.intro{font-size:15px;line-height:1.7;max-width:610px;color:#5c6c80}.builder-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:24px;align-items:start}.field-label{font-size:14px;font-weight:600;margin:20px 0 8px}.hint,.local-note{font-size:12px;line-height:1.7;color:#647187}.review-title{font-size:20px;font-weight:650;line-height:1.4}.agenda-card .q-card__section{padding:24px}.agenda-card h2{font-size:25px;line-height:1.25;font-weight:600;margin:16px 0 8px;letter-spacing:0}.agenda-format{font-size:14px;color:#647187}.time-art{height:140px;background:#e6eef8;border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin:24px 0}.time-art i{position:absolute;width:130px;height:130px;border:18px solid #8db8e8;border-radius:50%;left:10%;top:45%}.time-art i:nth-child(2){border-color:#c1d7ef;width:170px;height:170px;left:35%;top:-30%}.time-art i:nth-child(3){border-color:#d8e5f5;width:150px;height:150px;left:65%;top:40%}.time-art span{font-size:45px;font-weight:700;position:relative;color:#175a9e}.agenda-list{list-style:none;padding:0;margin:0}.agenda-list li{display:grid;grid-template-columns:65px 1fr;gap:16px;border-bottom:1px solid #dfe5ec;padding:16px 0;font-size:14px}.agenda-list span{color:#657991;font-size:12px}.agenda-list strong{font-weight:600}.session-meta{display:flex;justify-content:space-between;gap:12px;margin:24px 0;font-size:12px;color:#5c6c80}.local-note{margin-bottom:0}@media(max-width:740px){.session-builder{padding:24px 14px}header{flex-direction:column;gap:4px}h1{font-size:29px}.builder-grid{grid-template-columns:1fr}.session-stepper .q-stepper__step-inner{padding-right:18px}.agenda-card .q-card__section{padding:22px}}

```

[Code reference](https://quasar.dev/style/spacing/)

- The page uses content height for embedding.
- The application font override is explicit.

## Implementation Starting Point

Verified Quasar 2.34.0 and @quasar/extras 2.1.0 with Vue 3. The icon font is a required local asset for the default step indicators.

```javascript
// Create the project first:
// npm create vite@latest quasar-specimen -- --template vue
// cd quasar-specimen && npm install
// In a Vite Vue 3 project:
// npm install quasar@2.34.0 @quasar/extras@2.1.0
// Save the complete SFC as App.vue and layout as style.css.
import {createApp} from 'vue';
import {Quasar} from 'quasar';
import 'quasar/dist/quasar.css';
import '@quasar/extras/material-icons/material-icons.css';
import './style.css';
import App from './App.vue';
createApp(App).use(Quasar, {plugins: {}}).mount('#app');
// index.html contains <div id="app"></div>.
// Components are explicitly imported in App.vue; no auto-import plugin is required here.
// Keep the template index.html and replace its entry with the code above.
// npm run dev
```

## Agent Prompt

Use Quasar 2.34.0 and the supplied guided session brief. Preserve QStepper, QForm and QInput validation, the session-format radio controls, participant slider and agenda toggle. Await form validation before advancing, keep the entered values when moving back, and derive the review summary from those same values. Saving records a local brief; subsequent changes invalidate its saved status. Include the Quasar stylesheet and local Material Icons setup, and keep the narrow layout usable without inventing a dispatch or booking service.

## Sources

- [Stepper](https://quasar.dev/vue-components/stepper/) — Step state, navigation and accessibility.
- [Form](https://quasar.dev/vue-components/form/) — Internal rule validation and submit behavior.
- [Input](https://quasar.dev/vue-components/input/) — Labels, counter and rules.
- [Option group](https://quasar.dev/vue-components/option-group/) — Mutually exclusive format choices.
- [Slider](https://quasar.dev/vue-components/slider/) — Numeric keyboard and pointer control.
- [Colors](https://quasar.dev/style/color-palette/) — Runtime brand roles.
- [Spacing](https://quasar.dev/style/spacing/) — Native spacing helper syntax.
- [Typography](https://quasar.dev/style/typography/) — Default type utilities.
- [Integration](https://quasar.dev/start/vite-plugin/) — Vue/Vite integration reference.
