# Bootstrap Design System — OpenDesign Application Guide

Use Bootstrap 5.3.8 through its actual spacing scale, semantic colors, responsive grid and component APIs. Try a working reservation form, error summary, table filter, modal and color-mode switch, then reuse the documented code.

OpenDesign’s Bootstrap 5.3.8 application guide and runnable native-component specimen. Reference values come from the linked Bootstrap documentation and the pinned compiled CSS. Reservation records, layout composition and validation summary are original application code; no real reservation is submitted.

## Source Reference

- **Library type:** HTML, CSS, and JavaScript frontend toolkit ([source](https://getbootstrap.com/docs/5.3/getting-started/introduction/))
- **Setup:** Versioned CDN and package-manager installation are documented ([source](https://getbootstrap.com/docs/5.3/getting-started/introduction/))
- **Layout:** Responsive containers, rows, columns, and gutters ([source](https://getbootstrap.com/docs/5.3/layout/grid/))
- **Color modes:** data-bs-theme can set a color mode globally or locally ([source](https://getbootstrap.com/docs/5.3/customize/color-modes/))
- **Customization:** Theme colors and Sass customization are documented ([source](https://getbootstrap.com/docs/5.3/customize/color/))
- **Dialogs:** Modal is a JavaScript component with documented behavior ([source](https://getbootstrap.com/docs/5.3/components/modal/))
- **Accessibility:** Authors remain responsible for accessible application markup and styling ([source](https://getbootstrap.com/docs/5.3/getting-started/accessibility/))
- **Utilities:** Sass-based Utility API supports generated utilities ([source](https://getbootstrap.com/docs/5.3/utilities/api/))


## Design Reference

Bootstrap 5.3.8 default compiled CSS and the 5.3 documentation. Values are defaults, not mandatory brand rules. Rem-to-pixel comparisons assume a 16px root; responsive font sizes can vary below the large-screen endpoint. The surrounding OpenDesign page retains its own typography.

### Semantic colors and surface roles

[Official reference](https://getbootstrap.com/docs/5.3/customize/css-variables/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-primary | #0d6efd | Primary action and link base. |
| --bs-secondary | #6c757d | Secondary theme family; not the adaptive body-secondary text role. |
| --bs-success | #198754 | Positive status base; accompany with a label. |
| --bs-danger | #dc3545 | Error/destructive theme base. |
| --bs-warning | #ffc107 | Warning theme base; check foreground contrast. |
| --bs-info | #0dcaf0 | Informational theme base. |
| --bs-body-bg | #fff | Light-mode page surface. |
| --bs-body-color | #212529 | Light-mode body foreground. |
| --bs-secondary-bg | #e9ecef | Secondary surface in light mode. |
| --bs-tertiary-bg | #f8f9fa | Quiet panel surface in light mode. |
| --bs-primary-bg-subtle | #cfe2ff | Light-mode tinted primary surface. |
| --bs-primary-text-emphasis | #052c65 | Text paired with primary-subtle surfaces. |
| --bs-border-color | #dee2e6 | Light-mode border role. |

### Body typography and readable hierarchy

[Official reference](https://getbootstrap.com/docs/5.3/customize/css-variables/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-body-font-size | 1rem | Default body size: 1rem, normally 16px. |
| --bs-body-line-height | 1.5 | Unitless multiplier: normally 24px line height. |
| --bs-body-font-weight | 400 | Normal body weight. |
| --bs-body-font-family | var(--bs-font-sans-serif) | System UI stack supplied by Bootstrap. |
| --bs-font-monospace | SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace | Code and technical values use the monospace stack. |

### Heading sizes and display utilities

[Official reference](https://getbootstrap.com/docs/5.3/content/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| h1 / .h1 | 2.5rem | Large-screen endpoint; h1–h4 use responsive font sizing by default. |
| h2 / .h2 | 2rem | Large-screen endpoint; h1–h4 use responsive font sizing by default. |
| h3 / .h3 | 1.75rem | Large-screen endpoint; h1–h4 use responsive font sizing by default. |
| h4 / .h4 | 1.5rem | Large-screen endpoint; h1–h4 use responsive font sizing by default. |
| h5 / .h5 | 1.25rem | Fixed default heading size. |
| h6 / .h6 | 1rem | Fixed default heading size. |
| .lead | 1.25rem / weight 300 | Introductory text; not a substitute for a heading. |
| .small | 0.875em | Relative small text; use selectively for metadata. |

### Spacing utility scale

[Official reference](https://getbootstrap.com/docs/5.3/utilities/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| 0 | 0 | Use with m/p/gap/g utilities; e.g. p-0. |
| 1 | 0.25rem | Use with m/p/gap/g utilities; e.g. p-1. |
| 2 | 0.5rem | Use with m/p/gap/g utilities; e.g. p-2. |
| 3 | 1rem | Use with m/p/gap/g utilities; e.g. p-3. |
| 4 | 1.5rem | Use with m/p/gap/g utilities; e.g. p-4. |
| 5 | 3rem | Use with m/p/gap/g utilities; e.g. p-5. |
| ms / me | inline start / end | Logical side convention; unlike ml/mr from older Bootstrap. |
| p-3 p-md-4 | 1rem → 1.5rem at md | Responsive padding used by the example. |
| gap-2 | 0.5rem | Gap between flex/grid children. |

### Responsive grid thresholds

[Official reference](https://getbootstrap.com/docs/5.3/layout/grid/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| xs / .col- | 0 | Base tier, no xs infix. |
| sm / .col-sm- | 576px | Small tier; .container max-width 540px. |
| md / .col-md- | 768px | Medium tier; .container max-width 720px. |
| lg / .col-lg- | 992px | Large tier; .container max-width 960px. |
| xl / .col-xl- | 1200px | Extra-large tier; .container max-width 1140px. |
| xxl / .col-xxl- | 1400px | Largest default tier; .container max-width 1320px. |
| Grid columns | 12 | A col-lg-7 + col-lg-5 composition fills one row. |
| Default horizontal gutter | 1.5rem | 0.75rem column padding per side; row compensates with negative margins. |

### Borders radius and elevation

[Official reference](https://getbootstrap.com/docs/5.3/customize/css-variables/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-border-width | 1px | Default border width. |
| --bs-border-radius | 0.375rem | Inputs, cards and default rounded corners. |
| --bs-border-radius-sm | 0.25rem | Compact rounding. |
| --bs-border-radius-lg | 0.5rem | Larger rounded treatment. |
| --bs-border-radius-xl | 1rem | Large surface rounding. |
| --bs-border-radius-xxl | 2rem | Extra-large surface rounding. |
| --bs-border-radius-pill | 50rem | Pill geometry, not a measured component radius. |
| --bs-box-shadow-sm | 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) | Subtle elevation. |
| --bs-box-shadow | 0 0.5rem 1rem rgba(0, 0, 0, 0.15) | Default elevation. |
| --bs-box-shadow-lg | 0 1rem 3rem rgba(0, 0, 0, 0.175) | Strong elevation; do not apply to every surface. |

### Button sizing and state variables

[Official reference](https://getbootstrap.com/docs/5.3/components/buttons/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-btn-padding-x | 0.75rem | Default horizontal button padding. |
| --bs-btn-padding-y | 0.375rem | Default vertical button padding. |
| --bs-btn-font-size | 1rem | Default button label size. |
| --bs-btn-line-height | 1.5 | Default label line height multiplier. |
| --bs-btn-border-width | 1px | Default border thickness. |
| --bs-btn-border-radius | var(--bs-border-radius) | Default button radius. |
| --bs-btn-disabled-opacity | 0.65 | Visual treatment; use the actual disabled attribute too. |

### Light and dark role changes

[Official reference](https://getbootstrap.com/docs/5.3/customize/color-modes/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-body-bg | light #fff / dark #212529 | Page background follows data-bs-theme. |
| --bs-body-color | light #212529 / dark #dee2e6 | Foreground adapts with the surface. |
| --bs-border-color | light #dee2e6 / dark #495057 | Theme-aware border. |
| --bs-primary-bg-subtle | light #cfe2ff / dark #031633 | Tinted status background changes by mode. |
| --bs-primary-text-emphasis | light #052c65 / dark #6ea8fe | Use with its matching subtle surface. |
| data-bs-theme | light \| dark | Set on html globally or on a local subtree. |

## Bootstrap Design System Choose Bootstrap’s CSS and JavaScript Responsibilities

### One stylesheet, optional component behavior

Bootstrap’s compiled stylesheet supplies the grid, typography, utilities and component appearance. The JavaScript bundle adds interactive plugins such as Modal, Collapse and Dropdown. A styled button does not require JavaScript; a data-bs-toggle modal trigger does. The working preview loads the matching 5.3.8 stylesheet and bundle locally so that its controls demonstrate those real contracts.

The reservation table filtering, error summary and local row insertion are application code. Keeping that distinction visible makes it possible to replace the fictional records with a service without attributing booking behavior to Bootstrap itself.

- CSS: layout, typography, buttons, fields, tables and state styling.
- Bootstrap JavaScript: modal opening, backdrop, Escape and focus behavior.
- Application JavaScript: validation messages, record filtering and local data updates.

[Supporting specification](https://getbootstrap.com/docs/5.3/getting-started/introduction/)

### Choose compiled CSS or a Sass build

Use the compiled CSS for a quick start or a product that can accept the standard utility set. Use the Sass source when changing theme maps, utility generation or the grid at build time. Runtime CSS custom properties are useful for component-level customization, but changing a root color variable does not rebuild every precompiled variant.

```scss
$primary: #3159a5;
$border-radius: .5rem;
@import "bootstrap/scss/bootstrap";
```

[Code reference](https://getbootstrap.com/docs/5.3/customize/sass/)

[Supporting specification](https://getbootstrap.com/docs/5.3/customize/sass/)

## Bootstrap Design System Apply Semantic Colors and Color Modes

### Pair a status surface with its foreground

The reservation badges use bg-primary-subtle with text-primary-emphasis. These are paired semantic roles, so the foreground and background both adapt when data-bs-theme changes. A raw blue background plus an arbitrary gray text color loses that relationship. Reserved, In use and Draft also remain written labels; color is not their sole meaning.

```html
<span class="badge text-primary-emphasis bg-primary-subtle">Reserved</span>
<section data-bs-theme="dark">
  <div class="bg-body text-body border rounded p-3">Theme-scoped content</div>
</section>
```

[Code reference](https://getbootstrap.com/docs/5.3/customize/color-modes/)

[Supporting specification](https://getbootstrap.com/docs/5.3/customize/color-modes/)

### Scope customization at the component

For one custom action, override its local --bs-btn-* properties. Set hover and active values as well as the resting background. The example below is an application variant, not a Bootstrap default. Keep this class on the target button so that it does not silently alter every primary action in an unrelated part of the page.

```css
.btn-reserve {
  --bs-btn-color: #fff;
  --bs-btn-bg: #3159a5;
  --bs-btn-border-color: #3159a5;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #274783;
  --bs-btn-hover-border-color: #274783;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #203a6b;
  --bs-btn-active-border-color: #203a6b;
}
```

[Code reference](https://getbootstrap.com/docs/5.3/components/buttons/)

[Supporting specification](https://getbootstrap.com/docs/5.3/components/buttons/)

## Bootstrap Design System Use the Actual Typography Scale

### Separate document semantics from visual size

The preview’s main title is an h1 with the h3 class: it remains the page’s main heading but uses the smaller visual scale appropriate to a tool. Section headings are h2 elements with h5 styling. Bootstrap provides both element defaults and equivalent heading classes, which allows this distinction without skipping document levels.

Default body text is 1rem with a 1.5 line-height. h1 through h4 scale responsively before reaching the values in the reference table. A screenshot at one width therefore does not define the entire type scale. Use the compiled styles or the documented Sass behavior rather than copying a measured pixel size from a single viewport.

[Supporting specification](https://getbootstrap.com/docs/5.3/content/typography/)

### Give secondary text a theme-aware role

text-body-secondary follows the body color mode. It is suitable for supporting record information such as the owner name beneath an equipment title. The small class reduces size relative to its context; using it on every field label would make the form harder to scan. Keep labels at the normal form scale and reserve compact text for hints and metadata.

```html
<h1 class="h3">Equipment reservations</h1>
<p class="text-body-secondary">Review availability before booking.</p>
<small class="text-body-secondary">Local demonstration data</small>
```

[Code reference](https://getbootstrap.com/docs/5.3/utilities/colors/)

[Supporting specification](https://getbootstrap.com/docs/5.3/utilities/colors/)

## Bootstrap Design System Compose With Spacing Utilities and the Grid

### Use the scale instead of arbitrary gaps

p-3 means 1rem of padding; p-4 means 1.5rem, and p-5 jumps to 3rem. The labels are scale keys rather than literal pixel counts. The preview uses p-3 p-md-4 so that its outer padding grows at 768px, while mb-3 separates field groups by 1rem. This is a concrete policy for this example, not a new official spacing scale.

```html
<div class="p-3 p-md-4">
  <div class="d-flex flex-wrap gap-2 mb-3">
    <button class="btn btn-primary">Review</button>
    <button class="btn btn-outline-secondary">Reset</button>
  </div>
</div>
```

[Code reference](https://getbootstrap.com/docs/5.3/utilities/spacing/)

[Supporting specification](https://getbootstrap.com/docs/5.3/utilities/spacing/)

### Keep the row and column relationship intact

The demonstration uses row g-4 with col-lg-7 and col-lg-5. Both sections occupy the full width until the 992px lg threshold, then share a twelve-column row. Place grid columns inside a row: its negative margin compensates for column padding. Adding a second arbitrary margin around each column can undo that alignment.

[Supporting specification](https://getbootstrap.com/docs/5.3/layout/grid/)

## Bootstrap Design System Build Fields With Explicit Relationships

### Connect labels, hints and feedback

form-label styles a real label; its for value must match the input id. form-control styles text-like inputs, while form-select styles a select. The preview uses aria-describedby for hint and error IDs and required for the actual constraint. The class names do not create those semantic relationships automatically.

```html
<label for="equipment" class="form-label">Equipment</label>
<select id="equipment" class="form-select" required
  aria-describedby="equipment-error">
  <option value="">Choose equipment</option>
  <option>Camera kit A</option>
</select>
<div class="invalid-feedback" id="equipment-error">Choose equipment.</div>
```

[Code reference](https://getbootstrap.com/docs/5.3/forms/form-control/)

[Supporting specification](https://getbootstrap.com/docs/5.3/forms/form-control/)

### Use a real invalid state and a reachable summary

On submit, the example checks each field, sets is-invalid and aria-invalid, builds text links to the failed fields and focuses the summary. Correcting a field updates its state without clearing other answers. This application layer is essential: the Bootstrap validation documentation warns that its custom visual feedback alone is not fully exposed to assistive technology.

1. Inspect the actual constraint result before marking the field invalid.
2. Keep the error text associated with the field and expose the invalid state.
3. Place focus on a useful summary or the first invalid field after submission.

[Supporting specification](https://getbootstrap.com/docs/5.3/forms/validation/)

## Bootstrap Design System Present and Filter Records Without Losing Meaning

### Use the table component for comparable data

The table has column headers, row headers and a caption. table-hover provides a hover treatment but does not turn rows into buttons. Filtering changes the hidden state of matching rows and updates an aria-live result count. The displayed status remains text inside a badge, so the meaning survives a color-mode change.

```html
<div class="table-responsive">
  <table class="table table-hover">
    <caption>Fictional equipment reservations</caption>
    <thead><tr><th scope="col">Equipment</th><th scope="col">Status</th></tr></thead>
    <tbody><tr><th scope="row">Camera kit A</th><td>Reserved</td></tr></tbody>
  </table>
</div>
```

[Code reference](https://getbootstrap.com/docs/5.3/content/tables/)

[Supporting specification](https://getbootstrap.com/docs/5.3/content/tables/)

### Keep table scrolling local to the data

table-responsive provides horizontal scrolling when a wide table cannot fit. Avoid placing a dropdown that must escape the clipped area inside this wrapper without checking it. The example keeps its filter above the table. On mobile, only the data region may scroll horizontally; the page itself should stay within the viewport.

[Supporting specification](https://getbootstrap.com/docs/5.3/content/tables/)

## Bootstrap Design System Review the Selection With the Modal API

### Open only after the form is valid

The interactive example creates or reuses the Bootstrap Modal instance and calls show only when validation succeeds. This prevents the review layer from covering errors that need attention. Its text is populated from the current values; choosing Edit details closes the modal while retaining the form.

```javascript
const element = document.getElementById("review-modal");
const modal = bootstrap.Modal.getOrCreateInstance(element);
// Run after validation and after populating the review text.
modal.show();
element.addEventListener("hidden.bs.modal", () => {
  document.querySelector("#reservation button[type=submit]").focus();
});
```

[Code reference](https://getbootstrap.com/docs/5.3/components/modal/)

[Supporting specification](https://getbootstrap.com/docs/5.3/components/modal/)

### Treat the modal as a component lifecycle

Bootstrap controls its backdrop and transition. Use its methods and events instead of toggling display manually, which can leave focus or the backdrop inconsistent. Confirming in this demonstration adds a local table row and closes the modal; it does not call a reservation service. The success message states exactly that local outcome.

[Supporting specification](https://getbootstrap.com/docs/5.3/components/modal/)

## Bootstrap Design System Integrate and Extend This Bootstrap Example

### Load one matching CSS and JavaScript release

The embedded specimen loads locally stored Bootstrap 5.3.8 CSS and bundle files. Its data attributes and Modal API are from that release. In a Vite application, import the compiled CSS and the required plugin as shown in the setup section. Avoid loading the bundle and initializing a second copy of the same plugin through another wrapper.

[Supporting specification](https://getbootstrap.com/docs/5.3/getting-started/vite/)

### Extend with the actual component contract

To add another form field, provide its label, id, constraint, associated message and validation handling. To add another record state, define its text and an appropriate semantic badge pair. To change the layout, choose a breakpoint and grid split from the reference above. These are explicit extensions of the working specimen rather than a request to invent a new interface vocabulary.

- Use the specimen to inspect focus, modal dismissal and theme changes.
- Keep application data operations separate from Bootstrap plugin behavior.
- Recheck any theme override in normal, hover, focus, invalid and disabled states.

[Supporting specification](https://getbootstrap.com/docs/5.3/getting-started/javascript/)

## Component Examples

### index.html — complete reservation study

A complete Bootstrap 5.3.8 page with its stylesheet, modal runtime, validation, filters and local confirmation. Save this file as index.html and serve the folder using the command below. The pinned CDN dependencies require a network connection.

```html
<!doctype html><html lang="en" data-bs-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bootstrap equipment reservations — OpenDesign example</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"><style>body{margin:0}main{max-width:1120px;margin:auto}.demo-stat{font-variant-numeric:tabular-nums}.table td,.table th{vertical-align:middle}.table caption{font-size:.875rem}.demo-status:empty{display:none}@media(max-width:575px){.table th,.table td{font-size:.8125rem;padding:.65rem .4rem}.demo-mobile-hide{display:none}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head><body>
<header class="border-bottom bg-body-tertiary px-3 px-md-4 py-3 d-flex align-items-center justify-content-between gap-3"><div><strong>Studio inventory</strong><span class="badge text-bg-primary ms-2">Bootstrap 5.3.8</span></div><button id="theme" type="button" class="btn btn-outline-secondary btn-sm" aria-pressed="false">Dark mode</button></header>
<main class="p-3 p-md-4"><div class="d-flex align-items-start justify-content-between gap-3 mb-4"><div><p class="text-body-secondary small mb-1">EQUIPMENT / RESERVATIONS</p><h1 class="h3 mb-2">Keep the next shoot ready.</h1><p class="text-body-secondary mb-0">Check equipment, create a local reservation and review its details.</p></div><span class="badge rounded-pill text-primary-emphasis bg-primary-subtle border border-primary-subtle demo-mobile-hide">Interactive example</span></div>
<div class="row g-3 mb-4"><div class="col-4"><div class="border rounded p-3"><div class="text-body-secondary small">Equipment</div><strong class="fs-3 demo-stat">12</strong></div></div><div class="col-4"><div class="border rounded p-3"><div class="text-body-secondary small">Reservations</div><strong id="count" class="fs-3 demo-stat">3</strong></div></div><div class="col-4"><div class="border rounded p-3"><div class="text-body-secondary small">Available</div><strong class="fs-3 demo-stat">8</strong></div></div></div>
<div class="row g-4"><section class="col-lg-7" aria-labelledby="list-title"><div class="d-flex align-items-center justify-content-between gap-3 mb-3"><h2 id="list-title" class="h5 m-0">Reservation list</h2><div><label for="filter" class="visually-hidden">Filter reservations by status</label><select class="form-select form-select-sm" id="filter"><option value="all">All statuses</option><option value="Reserved">Reserved</option><option value="In use">In use</option><option value="Draft">Draft</option></select></div></div><div class="table-responsive border rounded"><table class="table table-hover mb-0"><caption class="px-3">Fictional records. New entries stay in this browser tab.</caption><thead class="table-light"><tr><th scope="col">Equipment</th><th scope="col">Date</th><th scope="col">Status</th></tr></thead><tbody id="rows"><tr data-status="Reserved"><th scope="row" class="fw-medium">Camera kit A<div class="small fw-normal text-body-secondary">Mia Chen</div></th><td>10 Oct</td><td><span class="badge text-primary-emphasis bg-primary-subtle">Reserved</span></td></tr><tr data-status="In use"><th scope="row" class="fw-medium">Lighting studio<div class="small fw-normal text-body-secondary">Alex Kim</div></th><td>10 Oct</td><td><span class="badge text-success-emphasis bg-success-subtle">In use</span></td></tr><tr data-status="Draft"><th scope="row" class="fw-medium">Audio recorder<div class="small fw-normal text-body-secondary">Jules Davis</div></th><td>11 Oct</td><td><span class="badge text-secondary-emphasis bg-secondary-subtle">Draft</span></td></tr></tbody></table></div><p id="empty" class="alert alert-info mt-3" hidden>No reservations match this status.</p><p id="results" class="small text-body-secondary mt-2" aria-live="polite">3 reservations shown</p><div class="alert alert-primary mt-4 mb-0"><strong>Try the system</strong><p class="small mb-0 mt-1">Switch color mode, filter the table, submit an empty form, then review a complete reservation in a Bootstrap modal.</p></div></section>
<section class="col-lg-5" aria-labelledby="form-title"><div class="card"><div class="card-body p-3 p-md-4"><h2 id="form-title" class="h5 mb-3">New reservation</h2><form id="reservation" novalidate><div id="error-summary" class="alert alert-danger" tabindex="-1" role="alert" hidden><strong>Check the reservation details.</strong><ul class="mb-0 mt-2" id="error-links"></ul></div><div class="mb-3"><label class="form-label" for="equipment">Equipment</label><select class="form-select" id="equipment" aria-describedby="equipment-error" required><option value="">Choose equipment</option><option>Camera kit A</option><option>Lighting studio</option><option>Audio recorder</option></select><div id="equipment-error" class="invalid-feedback">Choose equipment for this reservation.</div></div><div class="mb-3"><label class="form-label" for="owner">Reserved by</label><input class="form-control" id="owner" autocomplete="name" aria-describedby="owner-hint owner-error" required><div class="form-text" id="owner-hint">Use a fictional name for this example.</div><div class="invalid-feedback" id="owner-error">Enter the name of the person reserving equipment.</div></div><div class="mb-3"><label class="form-label" for="date">Reservation date</label><input class="form-control" id="date" type="date" aria-describedby="date-error" required><div class="invalid-feedback" id="date-error">Choose a reservation date.</div></div><button type="submit" class="btn btn-primary w-100">Review reservation</button></form><p class="small text-body-secondary mt-3 mb-0">This example validates input locally. It does not reserve real equipment.</p></div></div></section></div><div id="notice" class="alert alert-success mt-4 demo-status" role="status" hidden></div></main>
<div class="modal fade" id="review-modal" tabindex="-1" aria-labelledby="review-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h2 class="modal-title fs-5" id="review-title">Review reservation</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close review"></button></div><div class="modal-body"><dl class="row mb-0"><dt class="col-4">Equipment</dt><dd class="col-8" id="review-equipment"></dd><dt class="col-4">Reserved by</dt><dd class="col-8" id="review-owner"></dd><dt class="col-4">Date</dt><dd class="col-8" id="review-date"></dd></dl><p class="small text-body-secondary mt-3 mb-0">Confirming adds a row to this local example only.</p></div><div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal" type="button">Edit details</button><button class="btn btn-primary" id="confirm" type="button">Add to example</button></div></div></div></div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script><script>
const $=id=>document.getElementById(id);const fields=['equipment','owner','date'];const review=bootstrap.Modal.getOrCreateInstance($('review-modal'));
$('theme').onclick=()=>{const dark=document.documentElement.dataset.bsTheme!=='dark';document.documentElement.dataset.bsTheme=dark?'dark':'light';$('theme').setAttribute('aria-pressed',String(dark));$('theme').textContent=dark?'Light mode':'Dark mode'};
function filter(){let count=0;for(const row of $('rows').rows){row.hidden=$('filter').value!=='all'&&row.dataset.status!==$('filter').value;if(!row.hidden)count++}$('empty').hidden=count>0;$('results').textContent=count+' reservations shown'}$('filter').onchange=filter;
function validateField(id){const el=$(id),invalid=!el.checkValidity();el.classList.toggle('is-invalid',invalid);el.setAttribute('aria-invalid',String(invalid));return !invalid}
$('reservation').onsubmit=e=>{e.preventDefault();const invalid=fields.filter(id=>!validateField(id));$('error-links').replaceChildren();$('error-summary').hidden=invalid.length===0;if(invalid.length){for(const id of invalid){const li=document.createElement('li'),a=document.createElement('a');a.href='#'+id;a.className='alert-link';a.textContent=$(id+'-error').textContent;a.onclick=e=>{e.preventDefault();$(id).focus()};li.append(a);$('error-links').append(li)}$('error-summary').focus();return}for(const id of fields)$('review-'+id).textContent=$(id).value;review.show()};
for(const id of fields)$(id).addEventListener('input',()=>{if($(id).getAttribute('aria-invalid')==='true')validateField(id)});
$('review-modal').addEventListener('hidden.bs.modal',()=>$('reservation').querySelector('button').focus());
$('confirm').onclick=()=>{const row=document.createElement('tr');row.dataset.status='Reserved';const name=document.createElement('th');name.scope='row';name.className='fw-medium';name.textContent=$('equipment').value;const owner=document.createElement('div');owner.className='small fw-normal text-body-secondary';owner.textContent=$('owner').value;name.append(owner);const date=document.createElement('td');date.textContent=$('date').value;const state=document.createElement('td'),badge=document.createElement('span');badge.className='badge text-primary-emphasis bg-primary-subtle';badge.textContent='Reserved';state.append(badge);row.append(name,date,state);$('rows').prepend(row);$('count').textContent=$('rows').rows.length;$('filter').value='all';filter();review.hide();$('notice').hidden=false;$('notice').textContent='Reservation added to this local example. No data was sent.';$('reservation').reset();for(const id of fields){$(id).classList.remove('is-invalid');$(id).removeAttribute('aria-invalid')}};
</script></body></html>

```

[Code reference](https://getbootstrap.com/docs/5.3/getting-started/introduction/)

- No service receives the form. Confirmed reservations exist only in this page session.
- The local preview vendors the same pinned CSS and JavaScript; this copy uses their public CDN URLs.

### Field label, hint and explicit error state

This self-contained field composition uses Bootstrap styling and a real validation result. The page example adds an error summary with focusable links for its three fields. A red border alone does not communicate the correction.

```html
<form id="reservation" novalidate>
  <label for="owner" class="form-label">Reserved by</label>
  <input id="owner" class="form-control" required
    aria-describedby="owner-hint owner-error">
  <div id="owner-hint" class="form-text">Use a fictional name.</div>
  <div id="owner-error" class="invalid-feedback">Enter a name.</div>
  <button class="btn btn-primary mt-3" type="submit">Review reservation</button>
</form>
<script>
const form = document.querySelector('#reservation');
const input = document.querySelector('#owner');
form.addEventListener('submit', event => {
  event.preventDefault();
  const invalid = !input.checkValidity();
  input.classList.toggle('is-invalid', invalid);
  input.setAttribute('aria-invalid', String(invalid));
  if (invalid) input.focus();
});
</script>
```

[Code reference](https://getbootstrap.com/docs/5.3/forms/validation/)

- .is-invalid can be set explicitly without .was-validated.
- aria-describedby connects hint and error text; aria-invalid expresses the current state.
- The documentation warns that custom visual validation alone does not expose enough information to assistive technology.

### A native review modal with a clear label

The modal uses Bootstrap’s actual plugin, backdrop, Escape handling and focus management. Put the title inside modal-header, the review in modal-body and continuation actions in modal-footer.

```html
<button class="btn btn-primary" data-bs-toggle="modal"
  data-bs-target="#review">Review reservation</button>
<div class="modal fade" id="review" tabindex="-1"
  aria-labelledby="review-title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title fs-5" id="review-title">Review reservation</h2>
        <button class="btn-close" data-bs-dismiss="modal"
          aria-label="Close review"></button>
      </div>
      <div class="modal-body">Camera kit A · 10 October</div>
      <div class="modal-footer">
        <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Edit details</button>
      </div>
    </div>
  </div>
</div>
```

[Code reference](https://getbootstrap.com/docs/5.3/components/modal/)

- Load the matching Bootstrap JavaScript bundle once.
- The data API opens a static example; the working reservation form uses Modal.getOrCreateInstance after valid input.
- Use shown.bs.modal for behavior that must wait until the opening transition completes.

### A responsive list and form composition

The inventory list takes seven columns and the form five at the lg breakpoint. Below lg both sections stack. g-4 gives the composition a 1.5rem gutter. The columns describe width; semantic sections and headings describe the content.

```html
<main class="container py-4">
  <div class="row g-4">
    <section class="col-lg-7" aria-labelledby="reservations-title">
      <h2 id="reservations-title" class="h5">Reservations</h2>
      <div class="table-responsive">
        <table class="table table-hover">
          <caption>Fictional equipment reservations</caption>
          <thead><tr><th scope="col">Equipment</th><th scope="col">Status</th></tr></thead>
          <tbody><tr><th scope="row">Camera kit A</th><td>Reserved</td></tr></tbody>
        </table>
      </div>
    </section>
    <section class="col-lg-5" aria-labelledby="new-title">
      <h2 id="new-title" class="h5">New reservation</h2>
    </section>
  </div>
</main>
```

[Code reference](https://getbootstrap.com/docs/5.3/layout/grid/)

- The same grid can use col-md-* if the content genuinely fits earlier.
- Use the breakpoint table above rather than media queries with CSS variables; var() cannot supply a media-query threshold.

## Implementation Starting Point

No build step is required for this complete HTML example. It imports Bootstrap 5.3.8 from the pinned CDN URLs shown in the file. The shorter examples below isolate individual patterns from this working page.

```sh
# Save the complete index.html from Component Examples in a new folder.
# Serve that folder with Python 3:
python3 -m http.server 8000
# Open http://localhost:8000/ in a browser.
```

## Agent Prompt

Implement an equipment reservation interface using Bootstrap 5.3.8 and this guide. Use a row g-4 with col-lg-7 and col-lg-5, p-3 p-md-4 spacing, theme-aware body and subtle/emphasis color roles, a semantic table and labeled form controls. Validate with explicit errors and an error summary before opening the native Bootstrap Modal. Keep inputs when editing; add records only to local demo state unless a real API is supplied. Support data-bs-theme light/dark and keyboard dismissal. Do not replace the given scale with arbitrary values.

## Sources

- [Bootstrap 5.3 reference](https://getbootstrap.com/docs/5.3/) — Versioned foundations, utilities and components.
- [CSS variables and defaults](https://getbootstrap.com/docs/5.3/customize/css-variables/) — Names and default values used in the specification tables.
- [Validation and modal behavior](https://getbootstrap.com/docs/5.3/forms/validation/) — Field-state guidance; component examples additionally link their precise API pages.
