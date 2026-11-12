# CoreUI Design System — OpenDesign Application Guide

A CoreUI review queue built with real 5.9 theme variables, native tabs, checkbox batch selection and a persistent toast that can undo the last local archive operation.

CoreUI for Bootstrap 5.9.0 free components. Theme defaults and original density choices are distinguished. Archive and undo affect only local sample records.

## Source Reference

- **Library scope:** UI components and administration templates ([source](https://coreui.io/))
- **Platform or architecture:** Bootstrap-oriented documentation is available ([source](https://coreui.io/bootstrap/docs/getting-started/introduction/))
- **Integration:** React implementation is available separately ([source](https://coreui.io/bootstrap/docs/getting-started/introduction/))
- **Component support:** Vue implementation is available separately ([source](https://coreui.io/bootstrap/docs/getting-started/introduction/))
- **Customization or behavior:** Angular implementation is available separately ([source](https://coreui.io/bootstrap/docs/getting-started/introduction/))
- **Additional capability:** Includes navigation, forms, and table patterns ([source](https://coreui.io/bootstrap/docs/getting-started/introduction/))


## Design Reference

CoreUI for Bootstrap 5.9.0 light-theme defaults from the installed compiled stylesheet. These --cui-* names are actual runtime variables. The sample application uses free components; it does not assume CoreUI PRO widgets.

### Light-theme roles

[Official reference](https://coreui.io/bootstrap/docs/customize/color/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-primary | #5856d6 | CoreUI primary purple. |
| --cui-primary-contrast | #fff | Text paired with primary. |
| --cui-secondary | #6b7785 | Secondary role. |
| --cui-success | #1b9e3e | Success role. |
| --cui-info | #39f | Information role. |
| --cui-warning | #f9b115 | Warning role. |
| --cui-danger | #e55353 | Danger role. |
| --cui-primary-bg-subtle | #cfc7f3 | Soft primary context-card background. |
| --cui-primary-text-emphasis | #3634a3 | Text on the soft primary surface. |
| --cui-primary-border-subtle | #9d92e6 | Context-card border. |
| --cui-danger-bg-subtle | #f9d4d4 | High-priority badge surface. |
| --cui-danger-text-emphasis | #671414 | High-priority badge text. |
| --cui-warning-bg-subtle | #feecc5 | Medium-priority badge surface. |
| --cui-warning-text-emphasis | #764705 | Medium-priority badge text. |

### Typography and surface defaults

[Official reference](https://coreui.io/bootstrap/docs/content/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-font-sans-serif | system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | System UI font stack. |
| --cui-body-font-size | 1rem | Default 1rem body size; the dense table uses an original 14px override. |
| --cui-body-line-height | 1.5 | Default body line-height. |
| --cui-body-color | rgba(37, 42.92, 54.02, 0.95) | Primary light-theme body color. |
| --cui-body-bg | #fff | Primary surface. |
| --cui-tertiary-bg | #f3f4f7 | Page background in this example. |
| --cui-secondary-color | rgba(37, 42.92, 54.02, 0.681) | Supporting text role. |
| --cui-border-color | #dbdfe6 | Default separator color. |

### Corner and focus variables

[Official reference](https://coreui.io/bootstrap/docs/customize/css-variables/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-border-radius | 0.375rem | Default 6px equivalent at a 16px root. |
| --cui-border-radius-sm | 0.25rem | Small 4px equivalent. |
| --cui-border-radius-lg | 0.5rem | Large 8px equivalent. |
| --cui-border-radius-xl | 1rem | Extra-large 16px equivalent. |
| --cui-border-radius-pill | 50rem | Pill shape. |
| --cui-focus-ring-width | 0.25rem | Focus-ring width. |
| --cui-focus-ring-opacity | 0.25 | Focus-ring opacity. |
| --cui-focus-ring-color | rgba(88, 86, 214, 0.25) | Primary-based focus-ring color. |

### Original queue density choices

[Official reference](https://coreui.io/bootstrap/docs/layout/gutters/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Page padding | 32px; 24px 14px mobile | Original application inset. |
| Table minimum width | 740px | Columns remain readable in a local responsive scroll region. |
| Table cell padding | 16px | Original density choice around native table anatomy. |
| Table text | 14px; headings 12px | Original compact hierarchy. |
| g-3 summary row | 1rem native gutter | Responsive metric cards use the standard grid gutter. |
| Toast behavior | autohide: false | The undo action stays available until dismissed or replaced by a later batch. |

## CoreUI Design System Choose the CoreUI Runtime You Are Actually Using

### Choose the CoreUI Runtime You Are Actually Using

This specimen uses CoreUI for Bootstrap 5.9.0, the CSS and browser-JavaScript package. CoreUI also has framework-specific packages, but their component imports are not interchangeable with this example’s data attributes. The setup supplies one matched stylesheet and bundled script, without assuming a React or Vue provider.

The review desk uses free cards, tables, forms, tabs and toasts. It does not quietly substitute a PRO data-grid or advanced paid selector. That boundary keeps the complete example reproducible from the named package rather than requiring an undocumented template purchase.

[Supporting specification](https://coreui.io/bootstrap/docs/getting-started/introduction/)

## CoreUI Design System Use the Actual Purple Primary and Paired Status Roles

### Use the Actual Purple Primary and Paired Status Roles

CoreUI’s light primary is #5856d6, with white primary contrast. The review principle card uses primary-bg-subtle, primary-border-subtle and primary-text-emphasis together. Those names describe a coordinated surface treatment, so the supporting text is not placed on a tinted background with an arbitrary foreground color.

High and Medium badges similarly pair danger or warning subtle surfaces with their emphasis text. The text labels retain the classification independently of color. These are sample design-review priorities, not a claim that every red badge in a product must mean the same domain state.

[Supporting specification](https://coreui.io/bootstrap/docs/customize/color/)

## CoreUI Design System Separate Default Body Type from a Dense Work Table

### Separate Default Body Type from a Dense Work Table

The compiled CoreUI body defaults to one rem and a 1.5 line height. The specimen intentionally uses fourteen-pixel text in the table and twelve-pixel column labels to support a dense review queue. Page heading and summary values have their own larger original sizes. The guide does not mislabel those application overrides as library-wide defaults.

The three context cards use the native responsive grid and g-3 gutter. Inbox and Archived remain side by side on small screens, while the explanatory third card takes a full row. Every number is derived from the five visible sample records; there are no unrelated dashboard metrics or invented growth charts.

[Supporting specification](https://coreui.io/bootstrap/docs/content/typography/)

## CoreUI Design System Data Attributes Control Real Tab Panels

### CoreUI Data Attributes Control Real Tab Panels

Inbox and Archive are button-based tabs with data-coreui-toggle="tab" and targets for matching tab panels. The markup includes tablist, tab, tabpanel, aria-controls and aria-labelledby relationships. The CoreUI JavaScript component updates the active state and visibility rather than an application handler merely changing an underline.

The class nav-underline-border gives this component its visual treatment. Changing a tab does not archive records or clear a selection. The tab controls what part of the local queue is shown, while the application’s selected and archived Sets remain separate state.

[Supporting specification](https://coreui.io/bootstrap/docs/components/navs-tabs/)

## CoreUI Design System Select-All Has a Meaningful Mixed State

### Select-All Has a Meaningful Mixed State

Every note uses a stable R-series ID. Checking a row adds that ID to a selected Set. The header checkbox is checked only when all current inbox records are selected, indeterminate when some are selected, and disabled when the inbox is empty. These states are recalculated whenever the queue is rendered.

The batch button is disabled when nothing is selected and its neighboring text reports the current count. Selection is cleared after an archive action so an already-archived record cannot accidentally remain in the next batch. The original note and owner stay attached to the record rather than being replaced by a generic Resolved label.

1. Select two notes and inspect the header checkbox’s mixed state.
2. Archive the selection and confirm that the inbox count drops by two.
3. Open Archive to read the original requests and owners.

[Supporting specification](https://coreui.io/bootstrap/docs/forms/checks-radios/)

## CoreUI Design System A Toast Presents One Specific Reversible Operation

### A Toast Presents One Specific Reversible Operation

The application records the exact IDs of the most recent archived batch, then calls the native Toast instance’s show method. autohide is false because the notice contains an Undo action; the example does not remove the opportunity after an arbitrary short timer. The toast can still be dismissed explicitly.

Undo removes only those saved IDs from the archived Set, clears the last-batch snapshot and disables its action. An earlier archive batch remains archived if a later batch is undone. This is deliberately a one-level operation, not a misleading claim of a complete undo history.

[Supporting specification](https://coreui.io/bootstrap/docs/components/toasts/)

## CoreUI Design System Keep the Request Readable After It Is Archived

### Keep the Request Readable After It Is Archived

The inbox table shows the note title, specific requested change, area, priority and owner. Archive renders a compact list that preserves the title, ID, owner and full request. It reduces table chrome after resolution without deleting the information someone would need to understand what was changed.

On mobile, the table retains a 740px minimum width inside table-responsive. The named region is keyboard-focusable and has a visible focus treatment; horizontal movement stays within the table instead of widening the document. Removing important columns just to avoid a scrollbar would weaken this review task.

[Supporting specification](https://coreui.io/bootstrap/docs/content/tables/)

## CoreUI Design System Use a Persistent Result Without Inventing a Backend

### Use a Persistent Result Without Inventing a Backend

The toast has a polite status role and atomic announcement. A second inline status describes the local archive or undo result. Neither says that an external issue was closed: the page explicitly has no connected issue tracker. The preview mutates only its in-memory Sets, so reloading restores the original five notes.

Record titles and descriptions are inserted with textContent, including the archive list. Fixed class mappings represent the two known priorities. This keeps user-like text separate from HTML structure and makes the example’s data flow inspectable.

- Describe the actual batch size and local scope.
- Keep the undo button available while its snapshot is valid.
- Do not call a local DOM update a successful remote resolution.

[Supporting specification](https://coreui.io/bootstrap/docs/components/toasts/)

## CoreUI Design System Load the CoreUI Bundle Before the Local Module

### Load the CoreUI Bundle Before the Local Module

The complete setup copies the package’s dist assets to a local public path and loads coreui.bundle.min.js before app.js. The bundle exposes coreui.Toast and provides tab behavior for the data-coreui attributes. Adding a second Bootstrap runtime is unnecessary for this composition and could create confusing duplicate ownership.

The light theme is explicit through data-coreui-theme="light". A larger application can adopt CoreUI’s color-mode mechanism, but should review semantic text and surface pairs together. The local verification covered partial selection, a two-record batch, archive tab reading, undo restoration and a 390px viewport.

[Supporting specification](https://coreui.io/bootstrap/docs/getting-started/introduction/)

## Component Examples

### Queue, archive tab and undo toast

CoreUI data attributes, table controls, semantic priority badges and a persistent toast.

```html
<main class="review-desk"><header class="desk-heading"><div><p class="eyebrow">COREUI · REVIEW OPERATIONS</p><h1>Keep the review queue moving.</h1><p class="text-body-secondary">Archive resolved design notes and undo the last local batch.</p></div><span class="badge text-bg-primary">LOCAL WORKSPACE</span></header><div class="row g-3 mb-4"><div class="col-6 col-md-4"><div class="card metric"><div class="card-body"><div class="text-body-secondary small">Inbox</div><strong id="inbox-count">5</strong><span>design notes</span></div></div></div><div class="col-6 col-md-4"><div class="card metric"><div class="card-body"><div class="text-body-secondary small">Archived</div><strong id="archive-count">0</strong><span>local resolutions</span></div></div></div><div class="col-12 col-md-4"><div class="card metric context-card"><div class="card-body"><div class="text-body-secondary small">Review principle</div><p class="mt-2 mb-0">Keep the original request visible, even after the note is resolved.</p></div></div></div></div><section class="card"><div class="card-header bg-body"><ul class="nav nav-underline-border" role="tablist"><li class="nav-item" role="presentation"><button id="inbox-tab" class="nav-link active" data-coreui-toggle="tab" data-coreui-target="#inbox-panel" type="button" role="tab" aria-controls="inbox-panel" aria-selected="true">Inbox</button></li><li class="nav-item" role="presentation"><button id="archive-tab" class="nav-link" data-coreui-toggle="tab" data-coreui-target="#archive-panel" type="button" role="tab" aria-controls="archive-panel" aria-selected="false">Archive</button></li></ul></div><div class="tab-content"><div id="inbox-panel" class="tab-pane fade show active" role="tabpanel" aria-labelledby="inbox-tab" tabindex="0"><div class="batch-bar"><span id="selection" class="small text-body-secondary">No notes selected</span><button id="archive" class="btn btn-primary btn-sm" disabled>Archive selected</button></div><div class="table-responsive" tabindex="0" role="region" aria-label="Design review inbox"><table class="table table-hover align-middle mb-0"><thead><tr><th scope="col"><input id="select-all" class="form-check-input" type="checkbox" aria-label="Select all inbox notes"></th><th scope="col">Design note</th><th scope="col">Area</th><th scope="col">Priority</th><th scope="col">Owner</th></tr></thead><tbody id="inbox-rows"></tbody></table></div><p id="inbox-empty" class="empty-copy" hidden>All sample notes are archived. Open Archive to inspect them.</p></div><div id="archive-panel" class="tab-pane fade" role="tabpanel" aria-labelledby="archive-tab" tabindex="0"><div class="p-4"><h2 class="h5">Resolved in this local session</h2><p class="text-body-secondary small">The original note and owner stay attached to the record.</p><ul id="archive-list" class="list-group list-group-flush"></ul><p id="archive-empty" class="mb-0 text-body-secondary">No notes archived yet.</p></div></div></div></section><section class="decision-key"><span class="badge bg-danger-subtle text-danger-emphasis">High</span><p>Blocks a clear next action or access to important information.</p><span class="badge bg-warning-subtle text-warning-emphasis">Medium</span><p>Creates avoidable friction while the flow remains usable.</p></section><div class="toast-container position-static mt-4"><div id="undo-toast" class="toast w-100" role="status" aria-live="polite" aria-atomic="true"><div class="toast-header"><strong class="me-auto">Local archive updated</strong><button type="button" class="btn-close" data-coreui-dismiss="toast" aria-label="Dismiss notice"></button></div><div class="toast-body"><p id="toast-copy" class="mb-3"></p><button id="undo" class="btn btn-outline-primary btn-sm">Undo last batch</button></div></div></div><p id="result" class="small text-body-secondary mt-3" role="status">No external issue tracker is connected.</p></main>

```

[Code reference](https://coreui.io/bootstrap/docs/components/navs-tabs/)

- Use data-coreui-* attributes with this bundle, not data-bs-* copied from another library.
- The table has a named local horizontal-scroll region.
- Priority colors are paired with explicit High/Medium labels.

### Batch selection and last-batch undo

Stable record IDs drive selected and archived sets, while native Toast handles notice visibility.

```javascript
const records=[{id:'R-201',title:'Explain the empty search result',detail:'Offer a way to clear the filter without losing the query.',area:'Search',priority:'High',owner:'Maya'},{id:'R-202',title:'Label the compact navigation icons',detail:'The collapsed sidebar needs understandable accessible names.',area:'Navigation',priority:'High',owner:'Jules'},{id:'R-203',title:'Keep form errors beside their fields',detail:'Retain entered values after a failed submission.',area:'Forms',priority:'High',owner:'Alex'},{id:'R-204',title:'Align the table’s numeric column',detail:'Right-align quantities so differences can be scanned.',area:'Tables',priority:'Medium',owner:'Sam'},{id:'R-205',title:'Clarify the download format',detail:'Show the file type before the visitor starts the download.',area:'Content',priority:'Medium',owner:'Maya'}];const archived=new Set(),selected=new Set();let lastBatch=[];const q=s=>document.querySelector(s),toast=coreui.Toast.getOrCreateInstance(q('#undo-toast'),{autohide:false});
function render(){const inbox=records.filter(r=>!archived.has(r.id));q('#inbox-rows').replaceChildren();q('#archive-list').replaceChildren();records.forEach(r=>{if(archived.has(r.id)){let li=document.createElement('li');li.className='list-group-item px-0';let title=document.createElement('strong'),detail=document.createElement('p');title.textContent=`${r.id} · ${r.title}`;detail.className='small text-body-secondary mb-0 mt-1';detail.textContent=`${r.owner} · ${r.detail}`;li.append(title,detail);q('#archive-list').append(li);return;}let tr=document.createElement('tr');tr.innerHTML='<td><input class="form-check-input" type="checkbox"></td><td><strong></strong><p class="small text-body-secondary mb-0 mt-1"></p></td><td></td><td><span class="badge"></span></td><td></td>';let cells=tr.children,check=tr.querySelector('input');check.setAttribute('aria-label',`Select ${r.id}: ${r.title}`);check.checked=selected.has(r.id);check.onchange=()=>{check.checked?selected.add(r.id):selected.delete(r.id);sync();};cells[1].querySelector('strong').textContent=r.title;cells[1].querySelector('p').textContent=r.detail;cells[2].textContent=r.area;let badge=tr.querySelector('.badge');badge.classList.add(r.priority==='High'?'bg-danger-subtle':'bg-warning-subtle',r.priority==='High'?'text-danger-emphasis':'text-warning-emphasis');badge.textContent=r.priority;cells[4].textContent=r.owner;q('#inbox-rows').append(tr);});q('#inbox-count').textContent=inbox.length;q('#archive-count').textContent=archived.size;q('#inbox-empty').hidden=inbox.length!==0;q('#archive-empty').hidden=archived.size!==0;sync();}
function sync(){let total=records.length-archived.size;q('#selection').textContent=selected.size?`${selected.size} ${selected.size===1?'note':'notes'} selected`:'No notes selected';q('#archive').disabled=!selected.size;q('#select-all').disabled=!total;q('#select-all').checked=total>0&&selected.size===total;q('#select-all').indeterminate=selected.size>0&&selected.size<total;}
q('#select-all').onchange=e=>{selected.clear();if(e.target.checked)records.filter(r=>!archived.has(r.id)).forEach(r=>selected.add(r.id));render();};q('#archive').onclick=()=>{lastBatch=[...selected];lastBatch.forEach(id=>archived.add(id));selected.clear();render();q('#toast-copy').textContent=`${lastBatch.length} ${lastBatch.length===1?'note was':'notes were'} archived locally. You can undo this most recent batch.`;q('#undo').disabled=false;toast.show();q('#result').textContent='The archive is local. No external issue tracker was changed.';};q('#undo').onclick=()=>{let count=lastBatch.length;lastBatch.forEach(id=>archived.delete(id));lastBatch=[];q('#undo').disabled=true;render();toast.hide();q('#result').textContent=`Restored ${count} ${count===1?'note':'notes'} to the inbox.`;};render();

```

[Code reference](https://coreui.io/bootstrap/docs/components/toasts/)

- Select-all exposes checked, unchecked and indeterminate states.
- Undo restores exactly the IDs from the most recent batch.
- All record text is inserted with textContent.

### Original queue density

Page composition around native CoreUI cards and table styling.

```css
html,body{min-height:0;height:auto}body{background:var(--cui-tertiary-bg)}.review-desk{max-width:1120px;padding:32px;margin:auto}.desk-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:28px}.eyebrow{color:var(--cui-primary);font-size:11px;font-weight:700;letter-spacing:.12em}h1{font-size:32px;line-height:1.2;margin:12px 0}.desk-heading p:last-child{font-size:15px;line-height:1.6}.metric{height:100%}.metric strong{display:inline-block;font-size:32px;line-height:1.2;margin:12px 10px 0 0}.metric span{font-size:12px;color:var(--cui-secondary-color)}.context-card{background:var(--cui-primary-bg-subtle);border-color:var(--cui-primary-border-subtle)}.context-card p{font-size:14px;line-height:1.6;color:var(--cui-primary-text-emphasis)}.batch-bar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 20px}.table{min-width:740px;font-size:14px}.table th,.table td{padding:16px}.table th:first-child,.table td:first-child{width:48px}.table td:nth-child(2){max-width:380px}.table td:nth-child(2) p{line-height:1.5}.table th{font-size:12px;color:var(--cui-secondary-color);font-weight:600}.empty-copy{padding:24px;margin:0}.decision-key{display:grid;grid-template-columns:max-content 1fr;align-items:start;gap:10px 14px;margin-top:24px;font-size:12px;color:var(--cui-secondary-color)}.decision-key p{margin:0;line-height:1.6}.toast-container{max-width:520px}[hidden]{display:none!important}@media(max-width:650px){.review-desk{padding:24px 14px}.desk-heading{flex-direction:column;gap:4px}h1{font-size:28px}.metric strong{font-size:28px}.batch-bar{padding:14px}.table-responsive:focus-visible{outline:3px solid var(--cui-primary);outline-offset:-3px}}

```

[Code reference](https://coreui.io/bootstrap/docs/content/tables/)

- The 740px table width is an application readability choice, not a CoreUI default.

## Implementation Starting Point

Verified CoreUI for Bootstrap 5.9.0. The supplied app.js expects the full queue markup and exposes no network operation. The HTML wrapper includes the full body markup; save the supplied interaction and CSS examples under the filenames referenced here.

```html
<!-- npm install @coreui/coreui@5.9.0 -->
<!-- Copy node_modules/@coreui/coreui/dist to public/vendor/coreui. -->
<html lang="en" data-coreui-theme="light">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/vendor/coreui/css/coreui.min.css">
<link rel="stylesheet" href="style.css">
<main class="review-desk"><header class="desk-heading"><div><p class="eyebrow">COREUI · REVIEW OPERATIONS</p><h1>Keep the review queue moving.</h1><p class="text-body-secondary">Archive resolved design notes and undo the last local batch.</p></div><span class="badge text-bg-primary">LOCAL WORKSPACE</span></header><div class="row g-3 mb-4"><div class="col-6 col-md-4"><div class="card metric"><div class="card-body"><div class="text-body-secondary small">Inbox</div><strong id="inbox-count">5</strong><span>design notes</span></div></div></div><div class="col-6 col-md-4"><div class="card metric"><div class="card-body"><div class="text-body-secondary small">Archived</div><strong id="archive-count">0</strong><span>local resolutions</span></div></div></div><div class="col-12 col-md-4"><div class="card metric context-card"><div class="card-body"><div class="text-body-secondary small">Review principle</div><p class="mt-2 mb-0">Keep the original request visible, even after the note is resolved.</p></div></div></div></div><section class="card"><div class="card-header bg-body"><ul class="nav nav-underline-border" role="tablist"><li class="nav-item" role="presentation"><button id="inbox-tab" class="nav-link active" data-coreui-toggle="tab" data-coreui-target="#inbox-panel" type="button" role="tab" aria-controls="inbox-panel" aria-selected="true">Inbox</button></li><li class="nav-item" role="presentation"><button id="archive-tab" class="nav-link" data-coreui-toggle="tab" data-coreui-target="#archive-panel" type="button" role="tab" aria-controls="archive-panel" aria-selected="false">Archive</button></li></ul></div><div class="tab-content"><div id="inbox-panel" class="tab-pane fade show active" role="tabpanel" aria-labelledby="inbox-tab" tabindex="0"><div class="batch-bar"><span id="selection" class="small text-body-secondary">No notes selected</span><button id="archive" class="btn btn-primary btn-sm" disabled>Archive selected</button></div><div class="table-responsive" tabindex="0" role="region" aria-label="Design review inbox"><table class="table table-hover align-middle mb-0"><thead><tr><th scope="col"><input id="select-all" class="form-check-input" type="checkbox" aria-label="Select all inbox notes"></th><th scope="col">Design note</th><th scope="col">Area</th><th scope="col">Priority</th><th scope="col">Owner</th></tr></thead><tbody id="inbox-rows"></tbody></table></div><p id="inbox-empty" class="empty-copy" hidden>All sample notes are archived. Open Archive to inspect them.</p></div><div id="archive-panel" class="tab-pane fade" role="tabpanel" aria-labelledby="archive-tab" tabindex="0"><div class="p-4"><h2 class="h5">Resolved in this local session</h2><p class="text-body-secondary small">The original note and owner stay attached to the record.</p><ul id="archive-list" class="list-group list-group-flush"></ul><p id="archive-empty" class="mb-0 text-body-secondary">No notes archived yet.</p></div></div></div></section><section class="decision-key"><span class="badge bg-danger-subtle text-danger-emphasis">High</span><p>Blocks a clear next action or access to important information.</p><span class="badge bg-warning-subtle text-warning-emphasis">Medium</span><p>Creates avoidable friction while the flow remains usable.</p></section><div class="toast-container position-static mt-4"><div id="undo-toast" class="toast w-100" role="status" aria-live="polite" aria-atomic="true"><div class="toast-header"><strong class="me-auto">Local archive updated</strong><button type="button" class="btn-close" data-coreui-dismiss="toast" aria-label="Dismiss notice"></button></div><div class="toast-body"><p id="toast-copy" class="mb-3"></p><button id="undo" class="btn btn-outline-primary btn-sm">Undo last batch</button></div></div></div><p id="result" class="small text-body-secondary mt-3" role="status">No external issue tracker is connected.</p></main>

<script src="/vendor/coreui/js/coreui.bundle.min.js"></script>
<script src="app.js"></script>
</html>
```

## Agent Prompt

Start from the CoreUI 5.9.0 design-review operations desk. Preserve the native tabs and undo toast using data-coreui attributes, the five review records and the selected-ID set with a derived mixed bulk-selection state. Archive the selected batch, expose it in the archived tab and let Undo restore the last batch. Keep the table’s horizontal scrolling contained and distinguish selection from archived membership. Use the matching CoreUI bundle; do not substitute Bootstrap attribute names or claim a server-side archive.

## Sources

- [Introduction](https://coreui.io/bootstrap/docs/getting-started/introduction/) — Matched CSS and bundled JavaScript.
- [CSS variables](https://coreui.io/bootstrap/docs/customize/css-variables/) — Runtime theme customization.
- [Colors](https://coreui.io/bootstrap/docs/customize/color/) — Semantic theme roles.
- [Typography](https://coreui.io/bootstrap/docs/content/typography/) — Native type foundations.
- [Tabs](https://coreui.io/bootstrap/docs/components/navs-tabs/) — Data attributes and panel semantics.
- [Toasts](https://coreui.io/bootstrap/docs/components/toasts/) — Persistent notice and component methods.
- [Checkboxes](https://coreui.io/bootstrap/docs/forms/checks-radios/) — Native checkbox states.
- [Tables](https://coreui.io/bootstrap/docs/content/tables/) — Responsive table composition.
