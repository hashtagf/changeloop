# ServiceNow Horizon Design System — OpenDesign Application Guide

Explore Horizon Workspace’s exact spacing, radius and typography references through a complete local request-review flow with draft retention, validation, status filters and recovery.

An original OpenDesign HTML/CSS study informed by Horizon Workspace foundations. It uses documented Cabin/Lato typography and spacing/radius values, with original colors and workflow logic. It is not a ServiceNow instance or native Workspace runtime.

## Source Reference

- **Scope:** Workspace foundation study ([source](https://horizon.servicenow.com/workspace/overview))
- **Type:** Cabin headings · Lato body ([source](https://horizon.servicenow.com/workspace/foundations/typography/typography-overview))
- **Reference:** 19 concrete foundation entries ([source](https://horizon.servicenow.com/workspace/foundations/all))


## Design Reference

Published Horizon Workspace spacing, corner-radius and typography references. Original application colors are intentionally excluded from this official reference table.

### Published Workspace spacing

[Official reference](https://horizon.servicenow.com/workspace/foundations/spacing/spacing-overview)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $now-global-space--xxs | 2px | Exact published Sass reference names; these are not invented CSS custom properties. |
| $now-global-space--xs | 4px | Exact published Sass reference names; these are not invented CSS custom properties. |
| $now-global-space--sm | 8px | Exact published Sass reference names; these are not invented CSS custom properties. |
| $now-global-space--md | 12px | Exact published Sass reference names; these are not invented CSS custom properties. |
| $now-global-space--lg | 16px | Exact published Sass reference names; these are not invented CSS custom properties. |
| $now-global-space--xl | 24px | Exact published Sass reference names; these are not invented CSS custom properties. |
| $now-global-space--xxl | 32px | Exact published Sass reference names; these are not invented CSS custom properties. |
| $now-global-space--3xl | 40px | Exact published Sass reference names; these are not invented CSS custom properties. |

### Published corner radius

[Official reference](https://horizon.servicenow.com/workspace/foundations/corner-radius)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| now-global-border-radius--sm | 2px | Published design reference. Small values suit compact labels, medium nested controls and large containers. |
| now-global-border-radius--md | 6px | Published design reference. Small values suit compact labels, medium nested controls and large containers. |
| now-global-border-radius--lg | 8px | Published design reference. Small values suit compact labels, medium nested controls and large containers. |

### Published typography roles

[Official reference](https://horizon.servicenow.com/workspace/foundations/typography/typography-overview)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Heading family | Cabin | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |
| Body family | Lato | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |
| header-hero | 32px | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |
| header-primary | 24px | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |
| header-secondary | 20px | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |
| header-tertiary | 16px | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |
| title-primary | 20px | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |
| title-secondary | 16px | Documented Workspace typography roles. The study loads public Cabin and Lato font files locally. |

## ServiceNow Horizon Design System Workspace and Implementation Scope

### Start with the app framework

Horizon covers several ServiceNow app frameworks. This page focuses on Workspace: a queue and selected record stay visible together so a reviewer can move through local work without losing context. It does not present Service Portal, Native Mobile and Core UI as interchangeable skins. The live study is an original HTML application, not an embedded ServiceNow instance.

### Separate verified foundations from original choices

The reference gives exact published spacing names, radius values and typography roles. The study’s green action color, neutral surfaces and focus blue are original OpenDesign values declared with an app prefix. They are not claimed to be official Horizon token exports. No invented ServiceNow package install or platform API is required to run the complete example.

## ServiceNow Horizon Design System Workspace Spacing, Radius and Type

### Use the actual spacing sequence

The documented scale is 2, 4, 8, 12, 16, 24, 32 and 40px. The study uses it to distinguish the gap between queue and record, the padding within a record and the smaller distances among metadata. Those values serve different grouping relationships even when the same step recurs. A uniformly padded screen would lose that hierarchy.

### Give headings and reading text separate roles

Cabin is used for headings and Lato for body text, matching the published family roles. The study uses a 32px page heading on wider screens and a 24px record heading. Radius references are 2, 6 and 8px rather than an assumed generic 4/8/12 sequence. Rounded status labels do not communicate status by shape or color alone; they also contain the words Open or Reviewed.

## ServiceNow Horizon Design System Queue, Selected Record and Filtering

### Maintain one selected record

Each queue action names a practice request and displays its owner and status. Selecting it fills the adjacent detail and focuses the new heading. The selected action has aria-current and a visible border treatment. This is an original list/detail pattern rather than a native Horizon component API; its complete state logic is supplied for inspection.

### Recover when a filter removes the selection

The status filter narrows the visible queue. If the selected request no longer belongs to it, the application selects the first available matching request. If none remain, it displays an empty message and a Show all requests action. The count uses the full three-record collection as the denominator. Filtering never deletes records or silently changes their status.

- Keep the selected record inside the current filtered set.
- Show a clear empty state when that set has no records.
- Recover through Show all requests without deleting data.

## ServiceNow Horizon Design System Draft Notes and Review Validation

### Keep drafts attached to their record

The text area updates a draft on the corresponding record as the reviewer types. Moving to another request and returning preserves that draft. A blank or whitespace-only note cannot mark a request reviewed: an inline error appears, aria-invalid is set and focus returns to the text area. The data model keeps the saved note and current draft explicit.

### Make the local state transition observable

A successful review stores the trimmed note and changes the record’s status to Reviewed. The queue is recomputed through the current filter, and a status message names the affected record. It explicitly says no record was sent to ServiceNow. This prevents a visual confirmation from implying a platform operation the example did not perform.

## ServiceNow Horizon Design System Reopening and Accessible Feedback

### Retain useful work when reopening

Reopen request returns a reviewed record to Open while retaining its saved note. Under a Reviewed-only filter this can leave the list empty; the recovery action then restores the full queue. This combination tests the relationship among record state, filtering and selected detail, which is more revealing than checking each button in isolation.

### Use text, focus and status together

Status colors are paired with text labels. Validation focuses the field that needs work, record navigation focuses the heading, and local updates use a status region. The study does not remove the need for testing with assistive technology in a production Workspace. It supplies a complete, inspectable local flow on which that testing can begin.

## ServiceNow Horizon Design System Complete Local Source and Checks

### Install the public font dependencies

The supplied entry imports public Cabin and Lato font packages and the original composition stylesheet. Its HTML shell supplies the root element. There is no ServiceNow runtime, credential or endpoint in this example. Actual platform integration should begin through Horizon’s Workspace and developer resources rather than treating the local record array as a ServiceNow API contract.

1. Install the public font dependencies in a vanilla app.
2. Save the complete entry, stylesheet and root HTML shell.
3. Test draft retention before saving a review.
4. Combine status filtering with reopening and empty-state recovery.

### Check the connected workflow

Submit an empty note, enter a draft, visit another request and return to verify it survived. Mark the record reviewed, filter to Reviewed and reopen it. Check the empty-state recovery and retained note. At narrow widths, the queue stacks before the detail without dropping any action. Font loading, JavaScript errors and horizontal overflow are checked alongside these state changes.

## Component Examples

### main.js — complete queue and review logic

All records, drafts, filters, validation and recovery.

```javascript
import '@fontsource/cabin/latin-600.css';
import '@fontsource/lato/latin-400.css';
import '@fontsource/lato/latin-700.css';
import './horizon.css';
const records=[{id:'REQ-104',title:'Review the workshop outline',owner:'Design team',priority:'Normal',detail:'Compare the proposed agenda with the decision the team needs to make. Capture one question that should be resolved before the workshop.'},{id:'REQ-105',title:'Check the shared resource list',owner:'Content team',priority:'High',detail:'Review the resource titles for clear action language and confirm that each summary explains when the resource is useful.'},{id:'REQ-106',title:'Prepare the research readout',owner:'Research team',priority:'Normal',detail:'Group the observations by theme. Keep direct observations separate from the team’s interpretation and include the questions still open.'}].map(x=>({...x,status:'Open',note:''}));let selected=records[0].id;
document.querySelector('#root').innerHTML=`<main><header><p class="eyebrow">OpenDesign · Workflow study</p><h1>Team review workspace</h1><p>Review three original practice requests. Update a local record while keeping the queue and details in context.</p></header><div class="toolbar"><label>Status <select id="filter"><option>All</option><option>Open</option><option>Reviewed</option></select></label><p id="queue-count" role="status"></p></div><div class="workspace"><nav aria-label="Practice request queue"><div id="queue"></div><p id="empty" hidden>No requests match this status.</p><button id="clear" hidden>Show all requests</button></nav><section id="detail" aria-labelledby="record-title"></section></div><p id="feedback" role="status"></p><footer><strong>Original application, documented foundations.</strong> Cabin headings, Lato body text, the published 2–40px spacing scale and 2/6/8px radius references inform this study. The colors and application behavior are original OpenDesign choices. This is not the ServiceNow platform or a connected Workspace.</footer></main>`;
function renderQueue(){let filter=document.querySelector('#filter').value,visible=records.filter(x=>filter==='All'||x.status===filter);if(!visible.some(x=>x.id===selected))selected=visible[0]?.id;const queue=document.querySelector('#queue');queue.replaceChildren(...visible.map(r=>{let b=document.createElement('button');b.className='queue-item';b.dataset.id=r.id;b.setAttribute('aria-current',String(r.id===selected));b.innerHTML=`<span class="record-id">${r.id}</span><strong>${r.title}</strong><span>${r.owner}</span><span class="status ${r.status.toLowerCase()}">${r.status}</span>`;b.onclick=()=>{selected=r.id;renderQueue();renderDetail();document.querySelector('#record-title')?.focus()};return b}));document.querySelector('#queue-count').textContent=`${visible.length} of ${records.length} requests`;document.querySelector('#empty').hidden=visible.length>0;document.querySelector('#clear').hidden=visible.length>0;}
function renderDetail(){const r=records.find(x=>x.id===selected),panel=document.querySelector('#detail');if(!r){panel.innerHTML='<h2 id="record-title">Choose another status</h2><p>All local requests are still available through the status filter.</p>';return}panel.innerHTML=`<p class="eyebrow">${r.id} · ${r.owner}</p><h2 id="record-title" tabindex="-1">${r.title}</h2><p>${r.detail}</p><dl><div><dt>Priority</dt><dd>${r.priority}</dd></div><div><dt>Status</dt><dd>${r.status}</dd></div></dl><form id="review"><label for="note">Review note</label><p class="hint" id="hint">Write one useful observation. This note remains in the page.</p><textarea id="note" rows="4" aria-describedby="hint error"></textarea><p id="error" class="error" hidden>Enter a review note before marking this request reviewed.</p><div class="actions"><button type="submit" class="primary">${r.status==='Open'?'Mark reviewed':'Update review'}</button><button type="button" id="reopen" ${r.status==='Open'?'hidden':''}>Reopen request</button></div></form>`;const note=panel.querySelector('#note');note.value=r.draft??r.note;note.oninput=()=>{r.draft=note.value;document.querySelector('#error').hidden=true;note.removeAttribute('aria-invalid');document.querySelector('#feedback').textContent=''};panel.querySelector('#review').onsubmit=e=>{e.preventDefault();if(!note.value.trim()){document.querySelector('#error').hidden=false;note.setAttribute('aria-invalid','true');note.focus();return}r.note=note.value.trim();r.draft=r.note;r.status='Reviewed';renderQueue();renderDetail();document.querySelector('#feedback').textContent=r.id+' reviewed locally. No record was sent to ServiceNow.';document.querySelector('#record-title')?.focus();};panel.querySelector('#reopen').onclick=()=>{r.status='Open';renderQueue();renderDetail();document.querySelector('#feedback').textContent=r.id+' reopened. The saved review note is retained.';document.querySelector('#record-title')?.focus();};}
document.querySelector('#filter').onchange=()=>{renderQueue();renderDetail();document.querySelector('#feedback').textContent=''};document.querySelector('#clear').onclick=()=>{document.querySelector('#filter').value='All';renderQueue();renderDetail();document.querySelector('#filter').focus()};renderQueue();renderDetail();

```

[Code reference](https://horizon.servicenow.com/workspace/overview)

- All behavior is original application code, not an official Workspace component API.

### horizon.css — original composition

Documented type/spacing/radius references with app-prefixed original colors.

```css
:root{--app-ink:#21342c;--app-action:#285c47;--app-surface:#f2f5f3;--app-border:#c9d3cd;--app-error:#a32424;--app-radius-small:2px;--app-radius-medium:6px;--app-radius-large:8px}*{box-sizing:border-box}body{margin:0;font:16px/1.5 Lato,Arial,sans-serif;color:var(--app-ink);background:var(--app-surface)}main{max-width:1160px;margin:auto;padding:32px}h1,h2,h3{font-family:Cabin,Arial,sans-serif;font-weight:600;line-height:1.25}h1{font-size:32px;margin:8px 0 16px}h2{font-size:24px;margin:8px 0 24px}.eyebrow{font-size:12px;letter-spacing:.08em;font-weight:700}header>p:last-child{max-width:68ch}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:24px 0}.toolbar label{display:flex;gap:12px;align-items:center}select,textarea,button{font:inherit}select{padding:8px;border:1px solid var(--app-border);border-radius:6px;background:white;color:var(--app-ink)}.workspace{display:grid;grid-template-columns:minmax(200px,1fr) minmax(0,2fr);gap:24px}nav{align-self:start}.queue-item{display:grid;gap:8px;width:100%;text-align:left;margin-bottom:12px;background:white;border:1px solid var(--app-border);border-radius:8px;padding:16px;color:var(--app-ink);cursor:pointer}.queue-item[aria-current=true]{border:2px solid var(--app-action);padding:15px;background:#e8f0ea}.queue-item strong{font-size:16px}.record-id,.queue-item>span{font-size:14px}.status{justify-self:start;border-radius:2px;padding:2px 8px;background:#e8eeeb}.status.reviewed{background:#d0ead9}.workspace section{background:white;padding:24px;border:1px solid var(--app-border);border-radius:8px;min-width:0}dl{display:flex;gap:40px;margin:24px 0}dt{font-size:14px;color:#58685f}dd{margin:4px 0;font-weight:700}form>label{font-weight:700}.hint{font-size:14px;margin:8px 0}textarea{width:100%;padding:12px;border:1px solid #6b7f72;border-radius:6px;resize:vertical;color:var(--app-ink)}button{border:1px solid #6b7f72;border-radius:6px;background:white;padding:8px 16px;color:var(--app-ink);cursor:pointer}.primary{background:var(--app-action);color:white;border-color:var(--app-action)}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}.error{color:var(--app-error);font-weight:700}.hint,.error{max-width:60ch}#feedback:empty{display:none}#feedback{background:#d0ead9;padding:16px;border-radius:6px}footer{font-size:14px;margin-top:32px;padding-top:24px;border-top:1px solid var(--app-border)}:focus-visible{outline:3px solid #477fd0;outline-offset:3px}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.workspace{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.workspace section{padding:16px}h1{font-size:24px}.eyebrow{overflow-wrap:anywhere}}

```

[Code reference](https://horizon.servicenow.com/workspace/overview)

- Original color values must not be described as official Horizon tokens.

### index.html — root shell

The full entry point for the standalone app.

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Team review study</title></head><body><div id="root"></div><script type="module" src="/src/main.js"></script></body></html>
```

[Code reference](https://horizon.servicenow.com/workspace/overview)

- Replace the root Vite index.html with this file.

## Implementation Starting Point

This runs the original study only. Native ServiceNow implementation requires the appropriate platform development environment.

```sh
npm create vite@latest horizon-study -- --template vanilla
cd horizon-study
npm install
npm install @fontsource/cabin@5.3.0 @fontsource/lato@5.3.0
# Save index.html at root; main.js and horizon.css in src.
npm run dev
```

## Agent Prompt

Build the complete original request-review study using the verified Horizon Workspace type, spacing and radius references. Keep original colors app-prefixed. Preserve per-record drafts, validate before review, recompute filtered selection after status changes, retain notes on reopening and provide empty recovery. Do not claim a live ServiceNow connection.

## Sources

- [Workspace overview](https://horizon.servicenow.com/workspace/overview) — Framework context and related resources.
- [Spacing](https://horizon.servicenow.com/workspace/foundations/spacing/spacing-overview) — Exact modular scale and Sass reference names.
- [Corner radius](https://horizon.servicenow.com/workspace/foundations/corner-radius) — Published 2/6/8px values.
- [Typography](https://horizon.servicenow.com/workspace/foundations/typography/typography-overview) — Cabin/Lato and size roles.
- [Color guidance](https://horizon.servicenow.com/workspace/foundations/color/color-overview) — Purpose and non-color status cues.
