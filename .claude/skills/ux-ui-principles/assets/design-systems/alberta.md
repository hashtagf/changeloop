# Alberta Design System — OpenDesign Application Guide

Use Alberta’s native web components and published design tokens to build a complete preparation checklist with accessible choices, derived progress and honest review feedback.

An OpenDesign component study running Alberta web components 3.0.0 with an explicit Arial font fallback. The authored tasks are fictional and do not define government eligibility or submission requirements.

## Source Reference

- **Runtime:** @abgov/web-components 3.0.0 ([source](https://design.alberta.ca/get-started/developers/setup/))
- **Checkbox contract:** _change detail includes name, checked and value ([source](https://design.alberta.ca/components/checkbox/))
- **Reference:** 33 real stylesheet entries ([source](https://github.com/GovAlta/ui-components))


## Design Reference

Actual light-theme CSS exports in @abgov/web-components 3.0.0; licensed Acumin is not bundled.

### Light-theme interaction and status roles

[Official reference](https://github.com/GovAlta/ui-components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --goa-color-interactive-default | #006dcc | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |
| --goa-color-interactive-hover | #045092 | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |
| --goa-color-interactive-focus | #006dcc | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |
| --goa-color-text-default | var(--goa-color-greyscale-black) | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |
| --goa-color-greyscale-100 | #f2f0f0 | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |
| --goa-color-emergency-default | #da291c | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |
| --goa-color-success-default | #006f4c | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |
| --goa-color-success-light | #d8f7e6 | Values extracted from the pinned 3.0.0 stylesheet before dark-theme overrides. Use semantic roles for the intended state. |

### Spacing and corner scale

[Official reference](https://github.com/GovAlta/ui-components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --goa-space-3xs | .125rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-2xs | .25rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-xs | .5rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-s | .75rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-m | 1rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-l | 1.5rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-xl | 2rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-2xl | 3rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-space-3xl | 4rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-border-radius-xs | .25rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-border-radius-s | .375rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-border-radius-m | .5rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |
| --goa-border-radius-l | .625rem | Published spacing or radius primitive. The application’s two-column breakpoint is an authored layout choice. |

### Typography primitives

[Official reference](https://github.com/GovAlta/ui-components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --goa-font-family-sans | acumin-variable, helvetica-neue, arial, sans-serif | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-size-2 | .875rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-size-3 | 1rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-size-4 | 1.125rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-size-6 | 1.5rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-size-8 | 2rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-size-9 | 2.5rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-line-height-3 | 1.5rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-line-height-6 | 2.5rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-line-height-7 | 3rem | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-weight-regular | 400 | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |
| --goa-font-weight-bold | 700 | The official family export is recorded here; the public specimen deliberately uses Arial fallback rather than redistributing licensed Acumin font files. |

## Alberta Design System Web Components and Version Boundaries

### Start with the implementation actually running

This specimen runs @abgov/web-components 3.0.0. Importing its JavaScript registers the custom elements and importing index.css supplies the global token layer. The raw HTML API uses goa-prefixed elements; React examples use Goab wrappers with a different event surface. Do not copy React onChange props directly onto the raw custom elements.

### Distinguish package and design versions

A package version and a component styling version are not the same field. Some controls document an independent version attribute. This example keeps the pinned package’s defaults instead of silently switching a styling version while citing another set of token values. The table records the actual light-theme exports used by this build.

## Alberta Design System Roles, Rhythm and Typography

### Use color to explain state

The primary action and progress accent use the interactive-default role. Invalid review shows emergency text with a useful instruction; a completed local review uses a success-colored supporting surface. A success color describes the local review state, not an application submitted to a government service. Text labels and the numeric count carry the same information without relying on hue.

### Document the font boundary

The published family starts with Acumin, and the stylesheet includes externally hosted font declarations. The preview uses an explicit Arial fallback and removes those remote font requests; it does not redistribute Acumin. The token reference preserves the real family name so an authorized service can load its approved brand fonts. Recheck wrapping when switching from the fallback to a licensed face.

## Alberta Design System Checkbox Labels and Descriptions

### Use independent choices for independent tasks

Four native goa-checkbox controls model preparation items that can be reviewed in any order. Each has a unique name, visible text and a description that explains its purpose. Radio controls would imply a single choice and would misrepresent this task. A real service must replace the fictional preparation content with researched instructions.

- Give each checkbox a stable, unique name.
- Keep the visible label concise and the description specific.
- Use independent checkboxes only when multiple choices are meaningful.

### Read the custom event payload

The raw web component emits _change with name, checked and value in event.detail. The application uses the checked boolean to update a Set of selected indexes. It does not infer state from the label text or require a click on a tiny internal input. Clicking the visible label and using keyboard selection therefore share the same state transition.

## Alberta Design System Progress and Review State

### Keep progress derived from selection

The count and native HTML progress element are derived from the same Set. Selecting two items yields two of four, and clearing the controls returns both indicators to zero. The progress element has an accessible name; the adjacent status text gives an explicit count. There is no simulated upload, network request or completion timer.

### Invalidate old summaries after an edit

Review creates a local textual summary only when at least one item is selected. An empty attempt reveals a message and focuses the first checkbox. Every subsequent checkbox change hides the previous review so it cannot appear to represent new choices. Clear selections also updates the actual native controls, not just the visual count.

## Alberta Design System Responsive Checklist Composition

### Keep the task and context legible

The desktop layout places the checklist beside a supporting progress panel. At a narrow width the panel follows the controls in document order. The task labels retain readable sizing, and descriptions wrap naturally below them. The side panel’s blue rule is a restrained signpost; it does not create another competing action.

### Preserve interaction targets

The component library supplies checkbox and button interaction styling. Application CSS controls spacing and the surrounding grid without replacing the native hit areas. The two actions can wrap on small screens. Review is the primary action; Clear selections is visually secondary and does not masquerade as the next step in a real application.

## Alberta Design System Complete Checklist Implementation

### Run the complete source

Create a Vite vanilla project, install the pinned web-components package, and save the supplied entry and CSS. Keep the root mount element. The JavaScript includes all four authored tasks, the native event bindings, the derived count and the review/reset transitions. No account, private endpoint or external dataset is needed.

1. Install @abgov/web-components 3.0.0 and import JavaScript plus index.css.
2. Save the complete entry and alberta.css with the root mount.
3. Select multiple tasks and check the derived progress.
4. Review, edit a choice, then clear all native selections.

### Separate component events from checklist policy

Use event.detail.checked from the raw _change event as the source of truth for selection. React wrapper props and raw goa-checkbox events are different interfaces; a handler copied between them without adapting its payload can leave the progress display out of sync with the visible checkbox.

The checklist’s one-item minimum is application policy, not a built-in checkbox rule. Derive the count, progress value and review text from one selection Set. On Clear selections, reset each custom element’s checked property as well as the Set. Editing a choice should retire the old review immediately so it cannot describe a previous selection. A real preparation service may permit incomplete checklists; choose that policy before making progress a gate.

## Component Examples

### main.js — complete native checklist

All registration, authored task content, selection handling and review/reset transitions.

```javascript
import '@abgov/web-components';
import '@abgov/web-components/index.css';
import './alberta.css';
document.getElementById('root').innerHTML=`<main><p class="eyebrow">ALBERTA DESIGN SYSTEM / COMPONENT STUDY</p><h1>Prepare a submission</h1><p class="lead">Track an original sample checklist. These preparation steps are illustrative, not eligibility rules for a government program.</p><div class="workspace"><section aria-labelledby="tasks-heading"><h2 id="tasks-heading">Your preparation checklist</h2><p>Check each item when you have reviewed it.</p><div id="tasks"></div><div class="actions"><goa-button id="review">Review checklist</goa-button><goa-button id="reset" type="tertiary">Clear selections</goa-button></div><p id="error" role="alert" hidden>Select at least one item before reviewing.</p><section id="result" hidden tabindex="-1" aria-labelledby="result-heading"><h3 id="result-heading">Local review</h3><p id="result-text"></p></section></section><aside><p class="eyebrow">YOUR PROGRESS</p><strong id="total">0 of 4</strong><progress id="progress" value="0" max="4" aria-label="Reviewed preparation items"></progress><p id="status" role="status">No items reviewed yet.</p><h3>What happens next</h3><p>Your selections stay only in this page. Review summarizes your progress; it does not submit an application.</p><ul><li>Use the real service’s current instructions.</li><li>Do not enter personal information in a public example.</li><li>Recheck the summary after changing a selection.</li></ul></aside></div></main>`;
const labels=['Read the service instructions','Identify questions to ask','Check your own supporting information','Choose a time to complete the task'];const selected=new Set();const $=id=>document.getElementById(id);const controls=labels.map((text,i)=>{const el=document.createElement('goa-checkbox');el.setAttribute('name','step-'+i);el.setAttribute('text',text);el.setAttribute('description',['Understand the actual task before collecting information.','Record anything that needs clarification from the service.','Use the real service’s requirements, not this sample list.','Leave enough time to review the information you provide.'][i]);el.addEventListener('_change',e=>{e.detail.checked?selected.add(i):selected.delete(i);update()});$('tasks').append(el);return el});function update(){$('total').textContent=selected.size+' of 4';$('progress').value=selected.size;$('status').textContent=selected.size===4?'All sample items reviewed.':selected.size+' sample items reviewed.';$('result').hidden=true;$('error').hidden=true}$('review').addEventListener('_click',()=>{if(!selected.size){$('error').hidden=false;controls[0].shadowRoot.querySelector('input')?.focus();return}$('result-text').textContent=selected.size+' reviewed: '+[...selected].sort().map(i=>labels[i]).join('; ')+'. This is a local summary only.';$('result').hidden=false;$('result').focus()});$('reset').addEventListener('_click',()=>{selected.clear();controls.forEach(el=>el.setAttribute('checked','false'));update()});

```

[Code reference](https://design.alberta.ca/components/checkbox/)

- Raw custom elements use _change and _click events; do not substitute React wrapper callbacks.

### alberta.css — task layout and explicit font fallback

Original responsive composition around the native controls.

```css
main{padding:32px;max-width:1200px;margin:auto}.eyebrow{font-size:14px;letter-spacing:.06em;font-weight:700}h1{margin:16px 0 24px}.lead{max-width:65ch}.workspace{display:grid;grid-template-columns:1.5fr 1fr;gap:48px;margin-top:40px}h2{margin-top:0}goa-checkbox{display:block;margin-bottom:24px}.actions{display:flex;flex-wrap:wrap;gap:16px;margin-top:32px}aside{padding:24px;background:var(--goa-color-greyscale-100);border-top:4px solid var(--goa-color-interactive-default);align-self:start}aside strong{display:block;font:var(--goa-typography-heading-l)}progress{display:block;width:100%;height:12px;margin:24px 0;accent-color:var(--goa-color-interactive-default)}aside li{margin:12px 0}#error{margin-top:24px;color:var(--goa-color-emergency-default)}#result{margin-top:24px;padding:24px;border-left:4px solid var(--goa-color-success-default);background:var(--goa-color-success-light)}#result h3{margin-top:0}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.workspace{grid-template-columns:1fr;gap:32px}h1{font-size:32px;line-height:1.2}}

/* Public specimen font fallback; load approved Acumin only where licensed. */
:root{--goa-font-family-sans:Arial,sans-serif;--goa-font-family-mono:monospace;}

```

[Code reference](https://design.alberta.ca/get-started/developers/setup/)

- The local preview omits unused external font imports. The complete package stylesheet can contain external font declarations; the override keeps this study on Arial.

## Implementation Starting Point

The pinned native controls were browser-tested locally with no submission backend.

```sh
npm create vite@latest alberta-checklist -- --template vanilla
cd alberta-checklist
npm install
npm install @abgov/web-components@3.0.0
# Replace src/main.js and add src/alberta.css. Keep <div id="root"></div>.
npm run dev
```

## Agent Prompt

Build the Alberta preparation checklist using web-components 3.0.0, real semantic CSS roles and explicit font licensing boundaries. Use native checkbox descriptions, derive progress from selection, reject empty review, clear stale summaries after edits and reset actual controls. Keep all results local and the authored tasks clearly illustrative.

## Sources

- [Developer setup](https://design.alberta.ca/get-started/developers/setup/) — Package imports and supported implementations.
- [Checkbox API](https://design.alberta.ca/components/checkbox/) — Raw custom-element attributes and events.
- [Button API](https://design.alberta.ca/components/button/) — Action types and component behavior.
- [Public source](https://github.com/GovAlta/ui-components) — Versioned component implementation and CSS exports.
