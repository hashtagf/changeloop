# Bits UI Design System — OpenDesign Application Guide

Bits UI provides headless Svelte components that compose through native parts and Svelte 5 state. The example combines a derived mixed-state checkbox, independently expanded accordion sections and a portal-based review dialog, with the complete styling configuration included.

Bits UI 2.19.5 with Svelte 5.57.1. Original application tokens and illustrations. This is a manual checklist with local state, not an automated accessibility audit or certification.

## Source Reference

- **Library scope:** Headless component library for Svelte ([source](https://www.bits-ui.com/))
- **Platform or architecture:** Components are unstyled ([source](https://bits-ui.com/docs/getting-started))
- **Integration:** Accessibility is a stated focus ([source](https://bits-ui.com/docs/getting-started))
- **Component support:** Provides composable component parts ([source](https://bits-ui.com/docs/getting-started))
- **Customization or behavior:** Documentation includes installation ([source](https://bits-ui.com/docs/getting-started))
- **Additional capability:** Includes dialogs, selectors, and form primitives ([source](https://bits-ui.com/docs/getting-started))


## Design Reference

Bits UI 2.19.5 with Svelte 5.57.1. Bits UI is headless: all --app-* colors, type and spacing values are the explicit original configuration shipped with this example, not official Bits UI design tokens. Native data attributes and component props are identified separately.

### Original semantic CSS configuration

[Official reference](https://www.bits-ui.com/docs/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --app-canvas | #f4f3f8 | Page background. |
| --app-surface | #ffffff | Panel and dialog surface. |
| --app-ink | #2d2938 | Main text. |
| --app-muted | #746d80 | Supporting text. |
| --app-line | #e3dfeb | Dividers and borders. |
| --app-action | #604c88 | Checked controls and main actions. |
| --app-on-action | #fff | Text on actions. |
| --app-focus | #9a80ce | Visible keyboard focus. |
| --app-soft | #eee8f7 | Optional soft surface role. |

### Original spacing and geometry

[Official reference](https://www.bits-ui.com/docs/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --app-space-1 | 4px | Smallest named spacing unit. |
| --app-space-2 | 8px | Compact spacing. |
| --app-space-3 | 12px | Control/label gap. |
| --app-space-4 | 16px | Narrow panel inset. |
| --app-space-6 | 24px | Desktop panel inset and column gap. |
| --app-space-8 | 32px | Desktop page inset. |
| Checkbox geometry | 22×22px; 5px radius; 1px border | Explicit original control styling. |
| Focus ring | 3px solid #9a80ce; 3px offset | Applied to keyboard-visible button focus. |
| Dialog width | min(440px, 100% − 28px) | Explicit responsive overlay geometry. |
| Dialog maximum height | 100vh − 28px with overflow:auto | Overlay-only viewport constraint; no page-height feedback. |
| Type hierarchy | 34px title / 29px mobile; 16px accordion; 13px checks; 12px guidance | Original system-font hierarchy. |

### Native component contracts

[Official reference](https://www.bits-ui.com/docs/components/dialog)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Checkbox.Root checked | boolean | Completed or incomplete state. |
| Checkbox.Root indeterminate | boolean | Bulk control exposes mixed state when some checks are marked. |
| Checkbox data-state | checked / unchecked / indeterminate | Used directly by the stylesheet. |
| Accordion.Root type | multiple | Several review sections may remain open. |
| Accordion value | string[] | Svelte-bound list of expanded group IDs. |
| Dialog.Root open | boolean, two-way bound | Controls review visibility. |
| Dialog.Title / Description | Native title and description relationships | No manual duplicate ARIA IDs are needed. |
| Dialog.Portal | Overlay and content rendered outside the normal panel | Avoids clipping by the panel’s document flow. |

## Bits UI Design System Compose Native Parts Around Svelte 5 State

### Compose Native Parts Around Svelte 5 State

The checklist uses $state for the individual answers, expanded section IDs and dialog visibility. A $derived completion count feeds both the visible progress and the bulk checkbox. This puts the source of truth in one Svelte model while Bits UI supplies the native interaction for each component.

Checkbox, Accordion and Dialog are composed from their own parts. The review dialog does not need to own the checklist answers, and an accordion does not need to discard those answers when it closes. That separation is the useful starting point for a multi-section form: the model survives changes in which parts of the interface are visible.

[Supporting specification](https://www.bits-ui.com/docs/styling)

## Bits UI Design System Use the Svelte 5 Component and Styling Sources Together

### Use the Svelte 5 Component and Styling Sources Together

The example uses Svelte 5 runes: $state for groups, expanded sections, dialog visibility and saved state; $derived for completion count. Bits UI 2.19.5 is imported directly. No Tailwind plugin, theme provider or icon library is required for this original visual treatment.

The complete App.svelte and style.css work in a standard Vite Svelte project. The entry uses mount from Svelte rather than an older new App constructor. Keep the component’s runes syntax and the Bits UI 2.19.5 dependency together when transferring the example; the bindings and callbacks shown here are not an older Svelte component API.

[Supporting specification](https://www.bits-ui.com/docs/getting-started)

## Bits UI Design System Derive a True Mixed State from the Individual Checks

### Derive a True Mixed State from the Individual Checks

Six Boolean checks live in three groups. The bulk control is checked only when all six are true and indeterminate when the count is between one and five. Its onCheckedChange callback updates every check, making the mixed state a computed result rather than a separately stored flag that can drift out of sync.

Individual controls call a small change function that updates their model and invalidates saved feedback. The rendered native bulk checkbox exposes aria-checked=mixed after one check is selected. The stylesheet responds to data-state=checked and data-state=indeterminate, keeping behavior and presentation tied to the same native state.

1. Select the first focus-indicator check and inspect the bulk control’s dash.
2. Open Review checklist and confirm Save completed review is disabled.
3. Return, mark all checks and save the complete local snapshot.

[Supporting specification](https://www.bits-ui.com/docs/components/checkbox)

## Bits UI Design System Allow Independent Sections Without Losing Their Answers

### Allow Independent Sections Without Losing Their Answers

Accordion.Root uses type=multiple and a bound array of expanded group IDs. Keyboard flow starts expanded, while Form correction and Result feedback can be opened independently. Collapsing a section does not clear its checks because those values live in the parent state.

Each trigger repeats its own completed count, so progress remains visible when content is collapsed. Native Header, Trigger and Content parts preserve the expected relationship and keyboard behavior. The plus marker rotates based on the trigger’s data-state and respects reduced-motion preferences rather than driving expansion through a separate click handler.

[Supporting specification](https://www.bits-ui.com/docs/components/accordion)

## Bits UI Design System Compose the Full Dialog Anatomy and Let It Own Focus

### Compose the Full Dialog Anatomy and Let It Own Focus

The review uses Dialog.Root, Trigger, Portal, Overlay, Content, Title, Description and Close. The title and description are actual native parts, allowing Bits UI to establish their accessible relationships. The portal places the overlay outside the checklist panel’s normal flow.

The content has a bounded responsive width and an overlay-only maximum height, with scrolling for a longer review. Escape dismisses the dialog without clearing the checklist. Keep the trigger available as the focus return target instead of removing it when the overlay opens.

[Supporting specification](https://www.bits-ui.com/docs/components/dialog)

## Bits UI Design System Make the Application’s Visual Rules Explicit and Reusable

### Make the Application’s Visual Rules Explicit and Reusable

The CSS maps the native checked and indeterminate states to the same action role but uses different glyphs for each. A separate focus role belongs to keyboard position, so a control can remain visibly selected while also showing where the next keyboard action will occur.

The named spacing scale is four, eight, twelve, sixteen, twenty-four and thirty-two pixels. Panels use the twenty-four-pixel value on desktop and sixteen on narrow screens. The specification table documents those concrete choices as original configuration so readers can reproduce or replace them without mistaking demo styling for a package guarantee.

[Supporting specification](https://www.bits-ui.com/docs/styling)

## Bits UI Design System Separate a Manual Mark from an Automated Test Result

### Separate a Manual Mark from an Automated Test Result

The checklist records what the reader has marked. It does not inspect another page, execute keyboard tests or establish accessibility conformance. Both the introductory copy and the review description make that scope explicit, which is necessary because the six checks concern real accessibility behaviors.

Save is disabled until all six are marked. The saved sentence says that all six were marked by the reader and that the result is local. A partial review can still be opened to inspect missing work, but it cannot produce a completed-review message. That distinction keeps the example’s state transitions meaningful.

[Supporting specification](https://www.bits-ui.com/docs/components/dialog)

## Bits UI Design System Clear Completion Messages Whenever the Evidence Changes

### Clear Completion Messages Whenever the Evidence Changes

Any individual or bulk change clears saved state. This prevents a completed confirmation from surviving after a check is removed. The Clear all action also restores the initially expanded section and closes the review dialog, returning every related state to a known starting point.

The status region is outside the overlay, so the saved message remains in the document after the dialog closes. It describes local page state and does not suggest a report was submitted. A reload discards the checklist, which is appropriate for this self-contained demonstration.

[Supporting specification](https://www.bits-ui.com/docs/state-management)

## Bits UI Design System Connect Component Parts to the Visible Labels

### Connect Component Parts to the Visible Labels

Every checkbox has a stable ID and an associated visible label. Its checked or indeterminate state is represented by the native control; the tick and dash are decorative. Keep both the Boolean checked value and the derived indeterminate value connected to the bulk control so that a partial selection is not announced as an ordinary unchecked item.

Dialog.Title and Dialog.Description supply the review’s name and explanation through the native anatomy. The portal separates the overlay from the accordion’s layout, while Dialog.Close remains the explicit dismissal action. The outside status region holds the saved result after the overlay closes, so it is not lost with the dialog content.

- Keep the visible label associated with its control.
- Retain a strong focus-visible ring after applying custom styles.
- Do not remove title or description parts while restyling a dialog.

[Supporting specification](https://www.bits-ui.com/docs/components/checkbox)

## Component Examples

### Complete Svelte 5 checklist

Native Bits UI composition with $state/$derived models, controlled checkboxes and a portal-based review dialog.

```svelte
<script>
import {Accordion,Checkbox,Dialog} from 'bits-ui';
let groups=$state([{id:'keyboard',name:'Keyboard flow',description:'Move through the interface without a pointer.',checks:[{id:'focus',label:'Every action has a visible focus indicator.',done:false},{id:'order',label:'Focus follows the visual reading order.',done:false}]},{id:'forms',name:'Form correction',description:'Make a mistake and recover from it.',checks:[{id:'labels',label:'Each input has a persistent visible label.',done:false},{id:'errors',label:'Errors identify the field and explain the correction.',done:false}]},{id:'feedback',name:'Result feedback',description:'Confirm that the outcome is understandable.',checks:[{id:'status',label:'A status message describes the completed action.',done:false},{id:'color',label:'Meaning remains clear without color alone.',done:false}]}]);
let expanded=$state(['keyboard']),open=$state(false),saved=$state(false);
const complete=$derived(groups.reduce((sum,g)=>sum+g.checks.filter(c=>c.done).length,0));
function change(check,value){check.done=value;saved=false}
function all(value){groups.forEach(g=>g.checks.forEach(c=>c.done=value));saved=false}
function reset(){all(false);expanded=['keyboard'];open=false}
</script>
<main class="check-shell"><header><p class="eyebrow">INTERFACE REVIEW · MANUAL CHECKLIST</p><h1>Check the experience between the screens.</h1><p>Work through six practical checks, then review what you have marked. This is a personal checklist, not an automated accessibility test.</p></header><div class="check-layout"><section class="check-panel"><div class="bulk"><Checkbox.Root id="all-checks" checked={complete===6} indeterminate={complete>0&&complete<6} onCheckedChange={all} class="checkbox"><span aria-hidden="true">{complete===6?'✓':complete>0?'−':''}</span></Checkbox.Root><label for="all-checks">Mark all checks</label><span class="count">{complete}/6</span></div><Accordion.Root type="multiple" bind:value={expanded} class="accordion">{#each groups as group}<Accordion.Item value={group.id} class="accordion-item"><Accordion.Header class="accordion-heading"><Accordion.Trigger class="accordion-trigger"><span>{group.name}<small>{group.checks.filter(c=>c.done).length} of 2 checked</small></span><span class="plus" aria-hidden="true">+</span></Accordion.Trigger></Accordion.Header><Accordion.Content class="accordion-content"><p class="group-description">{group.description}</p>{#each group.checks as check}<div class="check-row"><Checkbox.Root id={check.id} checked={check.done} onCheckedChange={value=>change(check,value)} class="checkbox"><span aria-hidden="true">{check.done?'✓':''}</span></Checkbox.Root><label for={check.id}>{check.label}</label></div>{/each}</Accordion.Content></Accordion.Item>{/each}</Accordion.Root><Dialog.Root bind:open><Dialog.Trigger class="primary">Review checklist</Dialog.Trigger><Dialog.Portal><Dialog.Overlay class="overlay"/><Dialog.Content class="dialog"><Dialog.Title class="dialog-title">Your review snapshot</Dialog.Title><Dialog.Description class="dialog-description">{complete} of 6 checks are marked. Saving records your own review state; it does not certify the interface.</Dialog.Description><ul class="review-summary">{#each groups as group}<li><strong>{group.name}</strong><span>{group.checks.filter(c=>c.done).length} / 2</span></li>{/each}</ul>{#if complete<6}<p class="remaining">Return to the checklist to finish the remaining {6-complete} checks.</p>{/if}<div class="dialog-actions"><Dialog.Close class="secondary">Back to checks</Dialog.Close><button class="primary" disabled={complete<6} onclick={()=>{saved=true;open=false}}>Save completed review</button></div></Dialog.Content></Dialog.Portal></Dialog.Root><button class="reset" onclick={reset}>Clear all checks</button><p class="result" role="status">{saved?'Completed review saved locally. All six checks were marked by you.':'Progress stays in this preview until you reload.'}</p></section><aside class="check-notes"><div class="focus-art" aria-hidden="true"><span></span><i></i><b></b></div><p class="eyebrow">WHAT TO LOOK FOR</p><h2>Make the next action clear.</h2><p>A good check leaves evidence: where focus moved, what an error said, or how a result was announced.</p><dl><div><dt>Keyboard</dt><dd>Tab, Shift+Tab, Enter and Escape should support the relevant task.</dd></div><div><dt>Correction</dt><dd>Keep the user’s input and point to a specific next step.</dd></div><div><dt>Feedback</dt><dd>Describe the outcome in words as well as visual styling.</dd></div></dl></aside></div></main>

```

[Code reference](https://www.bits-ui.com/docs/components/checkbox)

- The master control derives both checked and indeterminate state from six individual checks.
- Saving is gated by completion, not by whether the dialog is open.
- This manual worksheet does not run an accessibility audit.

### Complete original visual configuration

Named semantic colors, spacing scale, native data-state selectors and responsive overlay styling.

```css
:root{--app-canvas:#f4f3f8;--app-surface:#ffffff;--app-ink:#2d2938;--app-muted:#746d80;--app-line:#e3dfeb;--app-action:#604c88;--app-on-action:#fff;--app-focus:#9a80ce;--app-soft:#eee8f7;--app-radius:12px;--app-space-1:4px;--app-space-2:8px;--app-space-3:12px;--app-space-4:16px;--app-space-6:24px;--app-space-8:32px}html,body,#app{height:auto;min-height:0;margin:0}*{box-sizing:border-box}body{font-family:system-ui,sans-serif;background:var(--app-canvas);color:var(--app-ink)}button{font:inherit;cursor:pointer}button:disabled{opacity:.45;cursor:default}button:focus-visible{outline:3px solid var(--app-focus);outline-offset:3px}.check-shell{max-width:1080px;margin:auto;padding:var(--app-space-8)}.eyebrow{font-size:10px;letter-spacing:.14em;font-weight:700;color:var(--app-muted)}h1{font-size:34px;line-height:1.15;max-width:710px;margin:12px 0}header>p:last-child{font-size:14px;line-height:1.7;max-width:640px;color:var(--app-muted)}.check-layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:var(--app-space-6);margin-top:28px}.check-panel{background:var(--app-surface);border:1px solid var(--app-line);border-radius:16px;padding:var(--app-space-6);min-width:0}.bulk{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600;padding-bottom:24px}.count{margin-left:auto;color:var(--app-muted);font-size:12px}.checkbox{width:22px;height:22px;flex-shrink:0;border:1px solid #aaa1ba;background:white;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;padding:0;line-height:1}.checkbox[data-state=checked],.checkbox[data-state=indeterminate]{background:var(--app-action);border-color:var(--app-action);color:var(--app-on-action)}.accordion{margin-bottom:24px}.accordion-item{border-top:1px solid var(--app-line)}.accordion-item:last-child{border-bottom:1px solid var(--app-line)}.accordion-heading{margin:0;font-size:16px}.accordion-trigger{width:100%;border:0;background:transparent;display:flex;align-items:center;justify-content:space-between;text-align:left;padding:20px 0;color:var(--app-ink);font-weight:600}.accordion-trigger small{display:block;font-weight:400;font-size:11px;color:var(--app-muted);margin-top:6px}.plus{font-size:23px;font-weight:400;transition:transform .15s}.accordion-trigger[data-state=open] .plus{transform:rotate(45deg)}.accordion-content{padding:0 0 20px}.group-description{font-size:12px;line-height:1.6;color:var(--app-muted);margin:0 0 16px}.check-row{display:flex;align-items:flex-start;gap:12px;margin-top:14px}.check-row label{font-size:13px;line-height:1.6;cursor:pointer}.primary,.secondary{border:1px solid transparent;border-radius:8px;padding:12px 16px;font-size:13px;font-weight:600}.primary{background:var(--app-action);color:var(--app-on-action)}.secondary{background:white;color:var(--app-ink);border-color:var(--app-line)}.reset{border:0;background:transparent;color:var(--app-muted);font-size:12px;padding:12px}.result{font-size:12px;line-height:1.6;color:var(--app-muted);margin:18px 0 0}.check-notes{min-width:0;padding:0 4px}.check-notes h2{font:400 29px/1.2 Georgia,serif}.check-notes>p:not(.eyebrow){font-size:13px;line-height:1.7;color:var(--app-muted)}.check-notes dl>div{padding:14px 0;border-top:1px solid var(--app-line)}.check-notes dt{font-size:13px;font-weight:600}.check-notes dd{font-size:12px;line-height:1.7;color:var(--app-muted);margin:5px 0 0}.focus-art{height:165px;background:#e6e0ef;border-radius:12px;position:relative;overflow:hidden;margin-bottom:24px}.focus-art span{position:absolute;width:140px;height:85px;left:35px;top:44px;background:white;border-radius:8px;transform:rotate(-9deg);box-shadow:0 0 0 6px #b3a3cd}.focus-art i{position:absolute;width:75px;height:13px;background:#b7adc6;left:60px;top:61px;transform:rotate(-9deg)}.focus-art b{position:absolute;width:72px;height:28px;background:#695587;left:87px;top:91px;border-radius:5px;transform:rotate(-9deg)}.overlay{position:fixed;inset:0;background:#21193180;z-index:20}.dialog{position:fixed;z-index:21;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,calc(100% - 28px));max-height:calc(100vh - 28px);overflow:auto;background:white;padding:24px;border-radius:14px;box-shadow:0 20px 80px #23193640}.dialog-title{font-size:23px;margin:0 0 12px}.dialog-description,.remaining{font-size:13px;line-height:1.7;color:var(--app-muted)}.review-summary{padding:0;list-style:none}.review-summary li{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--app-line);font-size:13px}.dialog-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}@media(max-width:740px){.check-layout{grid-template-columns:minmax(0,1fr)}.check-shell{padding:20px}h1{font-size:29px}}@media(max-width:360px){.check-shell{padding:14px}.check-panel,.dialog{padding:16px}.check-panel>.primary,.dialog-actions>*{width:100%}}@media(prefers-reduced-motion:reduce){.plus{transition:none}}

```

[Code reference](https://www.bits-ui.com/docs/styling)

- These are original --app-* variables, not an official Bits palette.
- Focus and reduced-motion styles are included.
- Only the overlay uses a viewport-relative maximum height.

## Implementation Starting Point

Verified Bits UI 2.19.5 with Svelte 5.57.1. The full original stylesheet is required; Bits UI supplies no default colors or page layout.

```javascript
// npm create vite@latest bits-review -- --template svelte
// cd bits-review && npm install
// npm install svelte@5.57.1 bits-ui@2.19.5
// Save the complete examples as src/App.svelte and src/style.css.
// src/main.js:
import {mount} from 'svelte';
import App from './App.svelte';
import './style.css';
mount(App, {target:document.querySelector('#app')});
// index.html: <div id="app"></div><script type="module" src="/src/main.js"></script>
// npm run dev
```

## Agent Prompt

Use Bits UI 2.19.5 and Svelte 5 to build the supplied manual interface review. Keep six checks in three Accordion sections, derive bulk checked/indeterminate state from the individual answers and preserve answers when sections collapse. Compose the full Dialog parts for review, allowing incomplete inspection while disabling Save until all six are marked. Every answer change invalidates saved feedback; Clear all restores initial expansion and closes review. Include the complete CSS and describe results as reader-marked local checks, not automated accessibility certification.

## Sources

- [Getting started](https://www.bits-ui.com/docs/getting-started) — Svelte setup and package integration.
- [Styling](https://www.bits-ui.com/docs/styling) — Headless styling boundary and data attributes.
- [Checkbox](https://www.bits-ui.com/docs/components/checkbox) — Checked, indeterminate and controlled state.
- [Accordion](https://www.bits-ui.com/docs/components/accordion) — Multiple expansion and native anatomy.
- [Dialog](https://www.bits-ui.com/docs/components/dialog) — Portal, title, description, focus and dismissal.
- [State management](https://www.bits-ui.com/docs/state-management) — Bindings and controlled values.
