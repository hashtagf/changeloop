# Aksel Design System — OpenDesign Application Guide

Use Aksel v8’s real ax tokens, native table density and semantic header structure. Sort and select fictional follow-up records while comparing light and dark themes.

Independent example records and no NAV identity. The native stylesheet is used, with disclosed font fallback. Sorting, selection and layout are application behaviour; no real benefit or case data is shown.

## Source Reference

- **Organisation:** NAV ([source](https://aksel.nav.no/designsystemet))
- **System layers:** Patterns, components, icons, layout primitives and tokens ([source](https://aksel.nav.no/designsystemet))
- **Form components:** FormProgress and FormSummary are documented ([source](https://aksel.nav.no/designsystemet))
- **Operational components:** InternalHeader and Timeline are documented ([source](https://aksel.nav.no/designsystemet))
- **Styling resources:** Theming, typography and breakpoints guidance ([source](https://aksel.nav.no/designsystemet))
- **Source availability:** Official navikt/aksel repository ([source](https://github.com/navikt/aksel))


## Design Reference

@navikt/ds-css 8.18.0 inspected native stylesheet and current v8 docs. Light/dark values are scoped; the preview replaces remote fonts with Arial and uses original example records.

### v8 typography

[Official reference](https://aksel.nav.no/grunnleggende/styling/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ax-font-family | Source Sans 3, Source Sans Pro, Arial, sans-serif | Preview explicitly uses Arial fallback. |
| --ax-font-weight-regular / bold | 400 / 600 | Do not equate the named bold token with 700. |
| --ax-font-size-medium / large | 1rem / 1.125rem | 16px / 18px at standard root. |
| --ax-font-size-heading-xlarge / 2xlarge | 2rem / 2.5rem | 32px / 40px. |

### Spacing and breakpoints

[Official reference](https://aksel.nav.no/grunnleggende/styling/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ax-space-8 / 16 / 24 / 32 | 0.5 / 1 / 1.5 / 2rem | Token names describe standard pixel equivalents. |
| --ax-radius-2 / 4 / 8 / 12 / 16 | 2 / 4 / 8 / 12 / 16px | Radius roles. |
| sm / md / lg / xl / 2xl | 480 / 768 / 1024 / 1280 / 1440px | Values inspected in versioned CSS. |

### Native table geometry

[Official reference](https://aksel.nav.no/komponenter/core/table)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Medium cell padding | 12px 8px | Default vertical / horizontal padding. |
| Small / large vertical padding | 4px / 16px | Native density modifiers; horizontal stays 8px. |
| Header divider | 2px | Body row divider remains 1px. |

### Theme roles

[Official reference](https://aksel.nav.no/grunnleggende/styling/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ax-bg-default | #fff light / #0e151f dark | Root surface. |
| --ax-text-neutral | #202733 light / #dfe1e5 dark | Resolved neutral-1000 values. |
| --ax-bg-accent-strong | #2176d4 light / #4580ca dark | Resolved accent-600 values; use role in code. |

## Aksel Design System Start from the v8 contract

### Do not mix old classes and new tokens

Aksel v8 uses --ax-* tokens and .aksel component classes. The migration guide states that old .navds classes no longer work and that component-specific tokens have been removed. A tutorial built from an older screenshot can therefore look plausible while offering broken implementation advice.

This page pins the native CSS to 8.18.0 and supplies the matching React installation. The preview uses inspected native table classes with ordinary HTML; application JavaScript owns selection and sorting. It does not claim that downloading a stylesheet instantiates a React Table.

[Supporting specification](https://aksel.nav.no/grunnleggende/migreringsguider/versjon-8)

## Aksel Design System Type roles and font loading

### Use 600 for the bold token

The token reference defines Source Sans 3, Source Sans Pro, Arial and sans-serif as the family stack. Regular is 400 and the named bold token is 600. Body sizes include 14, 16, 18 and 20px; heading roles extend through 24, 28, 32 and 40px.

The local preview sets the font token to Arial and explicitly overrides inherited font use so it makes no remote font request. That is a disclosed fallback decision, not a claim that Arial is the primary Aksel typeface. Component text sizing remains supplied by the CSS.

[Supporting specification](https://aksel.nav.no/grunnleggende/styling/design-tokens)

## Aksel Design System Spacing, radius and layout

### Pixel-named tokens resolve to rem

--ax-space-16 is 1rem and --ax-space-24 is 1.5rem. The v8 primitive syntax follows those names: padding="space-16" and gap={{xs:"space-8",md:"space-16"}}. An older numeric spacing prop is not substituted without checking migration guidance.

The documented radius roles include 2, 4, 8, 12 and 16px plus full. The preview keeps the native table geometry and uses space-24 around its application controls. Its 64rem reading width is a local choice; breakpoint values come from the inspected stylesheet.

[Supporting specification](https://aksel.nav.no/grunnleggende/kode/komponent-api)

## Aksel Design System Theme-aware semantic colour

### Preserve the role, not one hex value

The native stylesheet resolves --ax-text-neutral to neutral-1000, which is #202733 in light mode and #dfe1e5 in dark mode. --ax-bg-default changes from white to #0e151f. Hard-coding the light text value into a dark container would defeat the role mapping.

The preview switches the .light/.dark theme class and lets the table’s stripe, border and selected-row colours follow the official tokens. Selection still has a checked checkbox and a visible count. A coloured row alone is not the selection interface.

[Supporting specification](https://aksel.nav.no/grunnleggende/styling/design-tokens)

## Aksel Design System Semantic table anatomy

### Headers are not ordinary cells

The native table has distinct header, body, row, header-cell and data-cell classes. The React equivalent uses Table.Header, Table.Body, Table.Row, Table.HeaderCell and Table.DataCell. The reference column is a row header, and each column header has scope=col.

The caption names the collection. Waiting days are quantities and align right; reference identifiers remain left-aligned. The preview keeps horizontal scrolling inside a labelled, keyboard-focusable region at narrow widths instead of destroying the table relationships to make card-shaped rows.

- Use header cells for both the column labels and row identifiers.
- Right-align quantitative values, not postal codes or identifiers.
- Provide a caption so the table has a meaningful name.

[Supporting specification](https://aksel.nav.no/komponenter/core/table)

## Aksel Design System Density and sorting

### Changing density changes padding

In the inspected native CSS, medium cells use space-12 vertically and space-8 horizontally. Small uses space-4 vertically, and large uses space-16 vertically. The density selector changes the native modifier class; it does not shrink the body font to force more information into the viewport.

The Waiting days header is a native-style sort button. Its handler orders numeric values and updates aria-sort on that header. The application owns this transformation: the React API similarly exposes sort state and onSortChange, rather than sorting arbitrary domain records automatically.

[Supporting specification](https://aksel.nav.no/komponenter/core/table)

## Aksel Design System Keyboard-safe row selection

### Give each row an explicit control

The Table documentation warns that onRowClick alone is not keyboard-accessible. The specimen therefore provides a labelled checkbox for each reference and a select-all checkbox. The aggregate checkbox becomes indeterminate when only some rows are selected.

Sorting preserves selection by the stable reference identifier. It never uses the current row index as the selected key, because that would move the check to another record when order changes. The selection count updates in a polite status region. No selected records are sent anywhere.

[Supporting specification](https://aksel.nav.no/komponenter/core/table)

## Aksel Design System Load matching CSS and React

### Keep package versions in sync

Install @navikt/ds-react and @navikt/ds-css at the same version, then import the CSS once near the application root. The package already includes tokens. The official CSS-import guide also supports granular global and component files, but baseline is required and fonts/tokens must be supplied or explicitly replaced.

Aksel uses CSS layers. Avoid broad unlayered selectors that accidentally override component styling. Custom application layout belongs on your own classes. The standalone preview has local versioned CSS and a deliberately replaced font; the React example is a separate source-verified integration path.

1. Pin the React and CSS packages together.
2. Import the stylesheet once and render semantic Table children.
3. Keep sorting and selection in application state.
4. Check theme switching, keyboard controls and the narrow scroll region.

[Supporting specification](https://aksel.nav.no/grunnleggende/kode/css-import)

## Component Examples

### Semantic React Table

Real Table children and a row header; quantities align right.

```jsx
import { Table } from '@navikt/ds-react';
import '@navikt/ds-css';

export function CaseTable() {
  return <Table size="medium" zebraStripes>
    <caption>Fictional follow-up records</caption>
    <Table.Header><Table.Row>
      <Table.HeaderCell scope="col">Reference</Table.HeaderCell>
      <Table.HeaderCell scope="col">Next activity</Table.HeaderCell>
      <Table.HeaderCell scope="col" align="right">Waiting days</Table.HeaderCell>
    </Table.Row></Table.Header>
    <Table.Body><Table.Row>
      <Table.HeaderCell scope="row">DEMO-204</Table.HeaderCell>
      <Table.DataCell>Confirm appointment preference</Table.DataCell>
      <Table.DataCell align="right">4</Table.DataCell>
    </Table.Row></Table.Body>
  </Table>;
}
```

[Code reference](https://aksel.nav.no/komponenter/core/table)

### Current responsive primitive syntax

Use v8 token names in primitive props.

```jsx
import { HStack, Box } from '@navikt/ds-react';
<HStack gap={{ xs: 'space-8', md: 'space-16' }}>
  <Box padding="space-16">First region</Box>
  <Box padding="space-16">Second region</Box>
</HStack>
```

[Code reference](https://aksel.nav.no/grunnleggende/kode/komponent-api)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aksel table workbench</title><link rel="stylesheet" href="vendor/aksel-8.18.0/index.css"><style>:root{--ax-font-family:Arial,sans-serif}body,body *,body *:before,body *:after{font-family:Arial,sans-serif!important}body{background:var(--ax-bg-default);color:var(--ax-text-neutral);font-size:18px;line-height:1.5}main{max-width:64rem;padding:32px 24px;margin:auto}h1{font-size:32px;font-weight:600;line-height:1.25;margin:16px 0 24px}p{margin:16px 0}.toolbar{display:flex;gap:24px;flex-wrap:wrap;padding:24px;background:var(--ax-bg-sunken);margin:24px 0}select{font-size:16px;padding:8px;background:var(--ax-bg-input);color:var(--ax-text-neutral);border:1px solid var(--ax-border-neutral)}label{font-size:16px;display:flex;gap:8px;align-items:center}.scroll{overflow-x:auto}table{min-width:38rem}caption{text-align:left;font-weight:600;margin-bottom:16px}input[type=checkbox]{width:20px;height:20px;accent-color:var(--ax-bg-accent-strong);cursor:pointer}small{font-size:14px;display:block;margin-top:24px;color:var(--ax-text-neutral-subtle)}:focus-visible{outline:3px solid var(--ax-border-focus);outline-offset:3px}@media(max-width:767px){main{padding:24px 16px}.toolbar{padding:16px;gap:16px}h1{font-size:28px}}</style><body class="light"><main><p>AKSEL v8 · NATIVE TABLE CSS</p><h1>Follow-up record workbench</h1><p>Compare density and theme while sorting and selecting fictional records. Selection follows each reference when the rows move.</p><div class="toolbar"><label>Density <select id="density"><option value="medium">Medium</option><option value="small">Small</option><option value="large">Large</option></select></label><label>Theme <select id="theme"><option value="light">Light</option><option value="dark">Dark</option></select></label></div><p id="selection" role="status">0 records selected</p><div class="scroll" tabindex="0" role="region" aria-label="Fictional follow-up records, horizontally scrollable"><table class="aksel-table aksel-table--zebra-stripes" id="records"><caption>Fictional follow-up records</caption><thead class="aksel-table__header"><tr class="aksel-table__row"><th class="aksel-table__header-cell" scope="col"><input id="all" type="checkbox" aria-label="Select all records"></th><th class="aksel-table__header-cell" scope="col">Reference</th><th class="aksel-table__header-cell" scope="col">Next activity</th><th class="aksel-table__header-cell" id="sort-header" scope="col" aria-sort="ascending"><button id="sort" type="button" class="aksel-table__sort-button">Waiting days ↑</button></th></tr></thead><tbody class="aksel-table__body" id="rows"></tbody></table></div><small>OpenDesign specimen using native Aksel 8.18.0 CSS and an explicit Arial fallback. Fictional data, no NAV identity or external actions.</small></main><script>const data=[{id:'DEMO-204',activity:'Confirm appointment preference',days:4},{id:'DEMO-218',activity:'Read the submitted example note',days:12},{id:'DEMO-231',activity:'Arrange an example callback',days:7}];let ascending=true;const selected=new Set(),all=document.querySelector('#all');function render(){const body=document.querySelector('#rows');body.replaceChildren();for(const r of [...data].sort((a,b)=>ascending?a.days-b.days:b.days-a.days)){const tr=document.createElement('tr');tr.className='aksel-table__row'+(selected.has(r.id)?' aksel-table__row--selected':'');const td=document.createElement('td');td.className='aksel-table__data-cell';const c=document.createElement('input');c.type='checkbox';c.setAttribute('aria-label','Select '+r.id);c.checked=selected.has(r.id);c.onchange=()=>{c.checked?selected.add(r.id):selected.delete(r.id);updateSelection();tr.classList.toggle('aksel-table__row--selected',c.checked)};td.append(c);const th=document.createElement('th');th.scope='row';th.className='aksel-table__header-cell';th.textContent=r.id;const activity=document.createElement('td');activity.className='aksel-table__data-cell';activity.textContent=r.activity;const days=document.createElement('td');days.className='aksel-table__data-cell aksel-table__data-cell--align-right';days.textContent=r.days;tr.append(td,th,activity,days);body.append(tr)}updateSelection()}function updateSelection(){all.checked=selected.size===data.length;all.indeterminate=selected.size>0&&selected.size<data.length;document.querySelector('#selection').textContent=selected.size+' records selected'}all.onchange=()=>{selected.clear();if(all.checked)data.forEach(r=>selected.add(r.id));render()};document.querySelector('#sort').onclick=()=>{ascending=!ascending;document.querySelector('#sort-header').setAttribute('aria-sort',ascending?'ascending':'descending');document.querySelector('#sort').textContent='Waiting days '+(ascending?'↑':'↓');render()};document.querySelector('#density').onchange=e=>document.querySelector('table').className='aksel-table aksel-table--zebra-stripes aksel-table--'+e.target.value;document.querySelector('#theme').onchange=e=>document.body.className=e.target.value;render();</script></body></html>

```

[Code reference](https://aksel.nav.no/komponenter/core/table)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

Native CSS 8.18.0 is locally rendered in the preview. The React composition is source-verified but not separately built. Keep versions aligned; do not combine v7 navds classes with v8 CSS. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/nav-aksel.html. Do not open module-based examples through file://.

```bash
npm install @navikt/ds-react@8.18.0 @navikt/ds-css@8.18.0
# React entry:
# import "@navikt/ds-css";
# import { Table, HStack, Box } from "@navikt/ds-react";
```

## Agent Prompt

Build a semantic Aksel v8 table using matching 8.18.0 CSS/React packages. Keep caption, column headers and reference row headers. Use real ax tokens and space-* primitive props. Provide numeric sorting with aria-sort, stable-id checkbox selection and indeterminate select-all. Do not rely on onRowClick for keyboard interaction. Support light/dark role tokens and a labelled horizontal scroll region on narrow screens.

## Sources

- [Aksel design system](https://aksel.nav.no/designsystemet) — Official components, primitives, patterns and implementation entry.
- [Design tokens](https://aksel.nav.no/grunnleggende/styling/design-tokens) — Official token reference.
- [Aksel source](https://github.com/navikt/aksel) — Official source project and development history.
- [Download complete working example](/assets/demos/nav-aksel-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
