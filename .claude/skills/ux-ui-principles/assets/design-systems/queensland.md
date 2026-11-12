# Queensland Government Design System — OpenDesign Application Guide

Explore Queensland’s Bootstrap implementation through a complete illustrated resource selector with real theme roles, native checkbox styling and an accessible review dialog.

An OpenDesign original resource-pack study using QGDS Bootstrap 2.4.1. This is the Bootstrap implementation, not the alpha web-component stream; selections are local and no resources are sent.

## Source Reference

- **Runtime:** QGDS Bootstrap 2.4.1, separate from alpha web components ([source](https://www.designsystem.qld.gov.au/get-started/developing))
- **Reference:** 29 real stylesheet entries ([source](https://github.com/qld-gov-au/qgds-bootstrap5))
- **Interaction:** Multi-selection, modal review, edit and clear ([source](https://github.com/qld-gov-au/qgds-bootstrap5))


## Design Reference

Actual @qld-gov-au/qgds-bootstrap5 2.4.1 CSS exports and Bootstrap modal behavior, with locally loaded Noto Sans.

### Default light palette

[Official reference](https://github.com/qld-gov-au/qgds-bootstrap5)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --qld-color-default-color-light-action-primary | #005eb8 | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-action-primary-hover | #003e96 | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-background-default | #ffffff | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-background-alt | #e3e7ea | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-focus-default | #002e85 | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-link-default | #005eb8 | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-link-visited | #551a8b | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-text-default | #353535 | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |
| --qld-color-default-color-light-text-heading | #000053 | Actual QGDS Bootstrap 2.4.1 light role. Use with the corresponding light surface. |

### Default dark palette

[Official reference](https://github.com/qld-gov-au/qgds-bootstrap5)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --qld-color-default-color-dark-action-primary | #84d3ff | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-action-primary-hover | #a6f7ff | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-background-default | #005eb8 | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-background-alt | #001d74 | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-focus-default | #c6ffff | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-link-default | #ffffff | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-link-visited | #f2cdff | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-text-default | #ffffff | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |
| --qld-color-default-color-dark-text-heading | #ffffff | Actual paired dark role; do not reuse a light foreground on a dark surface without checking its intended pair. |

### Body, corners and modal geometry

[Official reference](https://github.com/qld-gov-au/qgds-bootstrap5)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --qld-body-font-family | var(--qld-font-sans-serif) | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-body-font-size | 1rem | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-body-line-height | 1.5 | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-border-radius | .25rem | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-border-radius-sm | .25rem | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-border-radius-lg | .25rem | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-border-radius-xl | 1rem | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-border-radius-xxl | 2rem | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-border-radius-pill | 50rem | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-modal-border-radius | var(--qld-border-radius-lg) | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |
| --qld-modal-title-line-height | 1.5 | Exported implementation value. The original resource illustration colors and 8px card corners are specimen choices, not additional official theme tokens. |

## Queensland Government Design System Choose a Queensland Implementation

### Name the runtime precisely

Queensland documents multiple implementation paths. This study uses the public @qld-gov-au/qgds-bootstrap5 package at 2.4.1, with its Bootstrap modal behavior. It does not claim to run the newer Lit web-component stream. Keeping the implementation name and version visible prevents a reader from mixing similarly named components with incompatible initialization rules.

### Separate stable examples from development streams

The official web-component repository labels its current stream alpha, while the older Vanilla path is a separate reference implementation. The runnable example here stays on one tested Bootstrap-based path. A future migration should recheck the markup, token names and component contracts rather than merely replacing a stylesheet URL.

## Queensland Government Design System Theme Roles and Resource Illustration

### Read light and dark roles together

The parameter table includes paired light and dark roles from the actual package. Primary actions, link colors, focus and text roles change with their surface context. The current resource pack uses a light composition; the dark entries are reference values, not a claim that the page has a theme-switch control.

### Use illustration without inventing brand tokens

Each card contains an original numbered document drawing. The four muted illustration backgrounds distinguish the authored resource types. Those colors and the 8px outer card radius are application styling and are identified separately from the published role table. The library supplies the real buttons, checkbox treatment and modal styling that anchor the interface.

## Queensland Government Design System Reading Scale and Card Content

### Load the public body face

The package’s body role uses its sans-serif family with a 1rem size and 1.5 line height. The preview loads local Noto Sans faces so the result does not depend on a remote Google Fonts request. Headings, descriptions and the selected-count status remain readable when cards collapse into a single column.

### Give each resource a useful description

Every card identifies a type, an illustrative reading time, a concrete title and a short purpose. The durations are authored workshop estimates, not usage analytics. The selection label repeats the resource name so the action still makes sense when encountered separately by an assistive technology. The whole card is not turned into an ambiguous click target.

## Queensland Government Design System Checkbox Selection and Derived Feedback

### Keep the review action unavailable when empty

Independent checkboxes allow any combination of the four resources. A Set holds the selected indexes; the count and review list are derived from that state. Review selection is disabled while the Set is empty. This avoids opening a dialog that has no useful content while still showing the reason through the visible zero count.

- Use independent checkboxes for a multi-resource list.
- Keep the selected count derived from the same data as the dialog.
- Name the resource in each checkbox label.

### Clear stale confirmation after any change

After a local confirmation, selecting or removing another resource hides the old result. The summary cannot remain visible as though it reflected the edited list. Clearing the list resets both the Set and the actual checkbox inputs, then returns focus to the first choice. No files are generated or transmitted by the preview.

## Queensland Government Design System Review Dialog and Focus Return

### Use the native modal for the review boundary

The Bootstrap Modal instance opens a dialog labelled by its heading. The body contains the current selected resource names, and the actions offer continued editing or local confirmation. Escape and the close control dismiss the dialog. The application restores focus to Review selection when the native hidden event fires.

### Avoid unnecessary transition races

The sample omits the optional fade class. That lets a quick confirm or Escape action close the dialog immediately instead of being ignored while a show transition is still running. The modal still supplies its focus management and backdrop behavior. Motion should not be required to understand whether a review action has taken effect.

## Queensland Government Design System Complete Resource-Pack Implementation

### Rebuild the exact local study

Create a Vite vanilla project and install the pinned QGDS Bootstrap package with Bootstrap and Noto Sans. Use the package’s exported qld.bootstrap.css path rather than a guessed deep dist import. Save the full entry and queensland.css with a root mount element. The source includes all resource records, original SVG illustrations, selection logic and modal transitions.

1. Install the pinned QGDS Bootstrap package and public font.
2. Use its exported stylesheet path with the full entry and CSS.
3. Select two resources and test Escape plus focus return.
4. Confirm locally, edit the selection and verify the old result clears.

### Choose deliberate modal transition and focus rules

The QGDS Bootstrap route uses Bootstrap Modal, so closing should follow the native modal lifecycle. Restore focus to Review selection after hidden.bs.modal rather than guessing a delay. If fade is added later, account for the transition period: an immediate hide request during opening may be ignored.

Generate the review list from the current selection when opening the modal, and invalidate a previous local confirmation after a checkbox changes. Escape should dismiss the review without changing the selections. Keeping checkbox targets separate from the card’s illustration avoids competing whole-card click behavior and gives each resource a precise accessible selection label.

## Component Examples

### main.js — complete resource selection and modal review

Full original data, illustrations, checkbox state and native modal integration.

```javascript
import Modal from 'bootstrap/js/dist/modal';
import '@qld-gov-au/qgds-bootstrap5/qld.bootstrap.css';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-700.css';
import './queensland.css';
const resources=[['Conversation planner','A short structure for a useful team discussion.','Guide','10 min'],['Observation notes','Capture what happened before interpreting why.','Worksheet','15 min'],['Decision record','Keep a reasoned account of the choice and its limits.','Template','10 min'],['Review checklist','Check content, keyboard behavior and narrow layouts.','Checklist','20 min']];document.getElementById('root').innerHTML=`<main><p class="eyebrow">QUEENSLAND DESIGN SYSTEM / ORIGINAL RESOURCE STUDY</p><h1>Build a workshop resource pack</h1><p class="lead">Choose useful sample resources, then review your local selection. No files are requested or sent.</p><div class="selection-bar"><p id="count" role="status">0 resources selected</p><button id="review" class="btn btn-primary" disabled>Review selection</button></div><div class="resource-grid">${resources.map(([title,desc,type,time],i)=>`<article class="resource-card"><div class="art art-${i}" aria-hidden="true"><span>${String(i+1).padStart(2,'0')}</span><svg viewBox="0 0 160 90"><rect x="20" y="10" width="120" height="70" rx="4"/><path d="M38 30h84M38 45h58M38 60h70"/></svg></div><div class="card-body"><p class="meta">${type} · ${time}</p><h2>${title}</h2><p>${desc}</p><div class="form-check"><input class="form-check-input" type="checkbox" value="${i}" id="resource-${i}"><label class="form-check-label" for="resource-${i}">Add ${title.toLowerCase()}</label></div></div></article>`).join('')}</div><div id="review-modal" class="modal" tabindex="-1" aria-labelledby="review-heading" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h2 id="review-heading" class="modal-title fs-4">Review your resource pack</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close review"></button></div><div class="modal-body"><p>These original resources form a local planning list.</p><ul id="review-list"></ul><p class="small">This preview does not produce files or contact a service.</p></div><div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Keep editing</button><button id="confirm" class="btn btn-primary">Confirm local list</button></div></div></div></div><section id="result" hidden role="status"><h2>Local list ready</h2><p id="result-text"></p><button id="clear" class="btn btn-secondary">Clear the list</button></section></main>`;const selected=new Set();const $=id=>document.getElementById(id);const modal=new Modal($('review-modal'));document.querySelectorAll('.form-check-input').forEach(input=>input.addEventListener('change',()=>{const i=Number(input.value);input.checked?selected.add(i):selected.delete(i);$('count').textContent=selected.size+' resource'+(selected.size===1?'':'s')+' selected';$('review').disabled=!selected.size;$('result').hidden=true}));$('review').addEventListener('click',()=>{$('review-list').replaceChildren(...[...selected].sort().map(i=>{const li=document.createElement('li');li.textContent=resources[i][0];return li}));modal.show()});$('review-modal').addEventListener('hidden.bs.modal',()=>$('review').focus());$('confirm').addEventListener('click',()=>{$('result-text').textContent=[...selected].sort().map(i=>resources[i][0]).join(', ')+'. Your selection is held only until this page reloads.';$('result').hidden=false;modal.hide()});$('clear').addEventListener('click',()=>{selected.clear();document.querySelectorAll('.form-check-input').forEach(i=>i.checked=false);$('count').textContent='0 resources selected';$('review').disabled=true;$('result').hidden=true;document.querySelector('.form-check-input').focus()});

```

[Code reference](https://github.com/qld-gov-au/qgds-bootstrap5)

- The package stylesheet uses an exported entrypoint. Local confirmation is not a file download or service submission.

### queensland.css — original card composition

Responsive cards and decorative document drawings around the native component styling.

```css
body{margin:0}main{max-width:1200px;padding:32px;margin:auto}.eyebrow{font-size:14px;font-weight:700;letter-spacing:.04em}h1{max-width:26ch}.lead{max-width:65ch}.selection-bar{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:24px 0;border-bottom:1px solid #ccc;margin-bottom:24px}.selection-bar p{margin:0;font-weight:700}.resource-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.resource-card{border:1px solid #ccc;border-radius:8px;overflow:hidden}.card-body{padding:24px}.card-body h2{font-size:24px;line-height:1.3}.meta{font-size:14px}.art{height:130px;display:flex;align-items:center;justify-content:space-between;padding:24px;background:#eaf4f7;color:#005e85}.art-1{background:#eef3ea;color:#3b6738}.art-2{background:#f4eef7;color:#6b427b}.art-3{background:#faf0e4;color:#8c592b}.art span{font-size:36px;font-weight:700}.art svg{width:160px;height:90px;fill:none;stroke:currentColor;stroke-width:3}.form-check{margin-top:24px}.modal-title{margin:0}.modal li{margin:12px 0}#result{margin-top:32px;padding:24px;background:#eef5f3;border-left:4px solid #20775b}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.resource-grid{grid-template-columns:1fr}.selection-bar{align-items:start;flex-direction:column}.art{height:110px}h1{font-size:34px}}

```

[Code reference](https://www.designsystem.qld.gov.au/components/card/tabs/design)

- Illustration colors and outer card geometry are original application choices.

## Implementation Starting Point

The preview embeds public font assets and runs native modal behavior; no server-side submission is implemented.

```sh
npm create vite@latest qld-resource-pack -- --template vanilla
cd qld-resource-pack
npm install
npm install @qld-gov-au/qgds-bootstrap5@2.4.1 bootstrap@5.3.8 @fontsource/noto-sans
# Replace src/main.js and add src/queensland.css. Keep <div id="root"></div>.
npm run dev
```

## Agent Prompt

Build the Queensland resource-pack study using QGDS Bootstrap 2.4.1, real palette roles and native Modal. Preserve checkbox labels, derived count, disabled empty review, Escape, focus return and stale-result clearing. Keep original illustrations distinct from official theme tokens and do not imply a real resource delivery.

## Sources

- [Implementation pathways](https://www.designsystem.qld.gov.au/get-started/developing) — Vanilla, Bootstrap and developing web-component options.
- [Versioned Bootstrap source](https://github.com/qld-gov-au/qgds-bootstrap5) — Published CSS, assets and implementation.
- [Card guidance](https://www.designsystem.qld.gov.au/components/card/tabs/design) — Content hierarchy and card usage.
- [Web-component status](https://github.com/qld-gov-au/qgds-web-components) — Explicit alpha status and separate integration contract.
