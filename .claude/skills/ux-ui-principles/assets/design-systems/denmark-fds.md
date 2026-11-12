# Det Fælles Designsystem Design System — OpenDesign Application Guide

Explore Denmark’s DKFDS theme, actual Sass scales and accessible table patterns through a complete resource comparison with numeric sorting, submitted search and empty-state recovery.

An OpenDesign original comparison using DKFDS 11.3.0 Borger.dk styling and fonts. Sorting, search and sample data are complete original application code, not built-in DKFDS table behavior.

## Source Reference

- **Theme:** DKFDS 11.3.0 Borger.dk ([source](https://designsystem.dk/kom-i-gang/implementering-kode/hent-kodepakken/))
- **Table contract:** Published styling; application implements sorting and search ([source](https://designsystem.dk/komponenter/tables/))
- **Reference:** 33 concrete source values ([source](https://github.com/detfaellesdesignsystem/dkfds-components))


## Design Reference

Actual DKFDS 11.3.0 Borger.dk theme, spacing map, typography map and focus variables. Names shown are Sass source references.

### Borger.dk theme and focus

[Official reference](https://github.com/detfaellesdesignsystem/dkfds-components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $borger-primary | #44831E | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $borger-primary-dark | #3C5C22 | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $borger-primary-darker | #233614 | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $header-portal-background-color | #f1f1f1 | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $theme-focus-width | 3px | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $theme-focus-offset | 1px | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $theme-focus-style | solid | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $typography-text-max-width | 66ch | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |
| $typography-font-family | IBM Plex Sans, system-ui, system, sans-serif | Actual 11.3.0 Sass configuration; these names are source variables, not CSS custom properties. |

### Spacing map keys

[Official reference](https://github.com/detfaellesdesignsystem/dkfds-components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| 0 | 0px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 1 | 2px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 2 | 4px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 3 | 8px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 305 | 12px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 4 | 16px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 405 | 20px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 5 | 24px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 505 | 28px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 6 | 32px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 7 | 40px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |
| 8 | 48px | Published $spacers map. The nonsequential keys such as 305 and 405 mean 12px and 20px; do not interpret the key as a pixel size. |

### Font-size map

[Official reference](https://github.com/detfaellesdesignsystem/dkfds-components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| 2xs | 1.2rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| xs | 1.4rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| sm | 1.6rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| md | 1.8rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| lg | 2.0rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| xl | 2.1rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| 2xl | 2.2rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| 3xl | 2.4rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| 4xl | 2.8rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| 5xl | 3.2rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| 6xl | 4.0rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |
| 7xl | 4.8rem | Published $fds-font-sizes entry. The default root is 62.5%, respecting the browser’s font preference; under a 16px browser default, 1.6rem is 16px. |

## Det Fælles Designsystem Design System DKFDS Theme and Implementation Scope

### Choose Borger.dk or Virk deliberately

Det Fælles Designsystem distributes separate Borger.dk and Virk stylesheets. This example pins dkfds 11.3.0 and uses the Borger.dk stylesheet, producing its characteristic green primary controls and IBM Plex Sans text. It does not switch only one button color and call that a complete theme change. A different theme should be loaded as a deliberate implementation choice.

### Do not attribute original sorting to the library

The published table guidance provides table markup and styling but explicitly leaves sorting and search behavior to the application. The preview includes a complete original implementation of both. This distinction matters: importing DKFDS JavaScript alone will not turn an arbitrary table into a searchable, sortable data view.

## Det Fælles Designsystem Design System Sass Values and the Baseline Rhythm

### Read the source maps as source maps

The reference records actual Sass values rather than invented --token names. The spacing map uses an 8px base with keys such as 305 for 12px and 405 for 20px. A developer must use the library’s helper or corresponding utility conventions instead of treating those numbers as literal pixels. The parameter table makes the mapping visible.

### Respect the root-font convention

The default root is 62.5% while respecting the browser font preference. The source font-size map therefore includes 1.6rem for the standard small/body step under the usual browser default. Copying a rem value into a different root-size environment can change the result substantially. The example loads the actual stylesheet so the type and spacing context remain consistent.

## Det Fælles Designsystem Design System Semantic Table Structure

### Use a caption and clear column roles

The resource comparison has a caption, column headers and ordinary data cells. Titles, formats, numeric minutes and purposes belong to separate columns because users compare those attributes. Reading times are authored sample estimates, not measured traffic or performance statistics. The caption makes that boundary clear without changing the table’s structure.

- Provide a useful caption and column headers.
- Keep numeric data as numbers in the application model.
- Label the focusable scroll region on narrow screens.

### Keep mobile scrolling inside the table

The sortable table sits in a focusable responsive-scroll region. Its minimum width preserves readable columns while the outer page stays within the viewport. The example does not turn a sorting table into unrelated cards at a narrow width, which would require another navigation and sort-control contract. A keyboard user can focus the scroll region.

## Det Fælles Designsystem Design System Sorting State and Numeric Comparison

### Maintain one active ordering

The title column starts ascending. Activating the same header reverses its direction; selecting the minutes column starts ascending. Only the active header receives aria-sort, and each button’s hidden instruction describes the next action. The visible arrow mirrors the same state rather than acting as an independent decoration.

### Compare numbers as numbers

Minutes are numeric data and are sorted with subtraction. Titles use localeCompare. Sorting numeric strings alphabetically would produce misleading orders as the values grow. The original row objects remain the source of truth, and rendering uses textContent rather than interpreting row content as markup.

## Det Fælles Designsystem Design System Submitted Search and Empty Recovery

### Apply a query on submit

Search filters across every displayed attribute when the form is submitted, including through Enter. Typing alone does not replace the table under the reader. The status reports the visible count and current ordering, while the query remains in the field. This follows the submitted-search model chosen for this example.

### Reset the query without losing the order

A query with no matches reveals a recovery message. Reset restores all rows and focuses the search field while retaining the selected sort column and direction. Search and ordering therefore remain separate state variables. There is no artificial loading state because the complete five-row dataset is already local.

## Det Fælles Designsystem Design System Complete Working Integration

### Load distribution assets with their paths intact

The 11.3.0 package export map exposes its JavaScript entry, not arbitrary CSS deep imports. The setup copies the distribution into public/dkfds and links the stylesheet from index.html, preserving its relative font and image paths. Save the supplied main.js and denmark.css alongside that shell. The local preview embeds the same assets for reliable inspection.

1. Install dkfds 11.3.0 and copy its distribution to public/dkfds.
2. Use the supplied HTML shell to load the Borger.dk stylesheet.
3. Save the full entry and CSS, then run the local app.
4. Verify numeric ordering, submitted search, reset and internal mobile scrolling.

### Check the whole comparison flow

Sort minutes in both directions, submit a query with no match and reset. Search for Template and verify that only the two template rows remain while the current order is preserved. At phone width, scroll the table internally and confirm the page itself does not overflow. The check also confirms every bundled asset loads and there are no browser errors.

## Component Examples

### main.js — complete comparison behavior

Full original data, numeric/text sorting, submitted filtering and reset.

```javascript
// index.html loads /dkfds/css/dkfds-borgerdk.css from the copied distribution.
import './denmark.css';
const rows=[{name:'Content inventory',type:'Worksheet',minutes:25,note:'Map the purpose and owner of each section.'},{name:'Accessibility review',type:'Checklist',minutes:30,note:'Inspect keyboard use, reading order and clear labels.'},{name:'Research questions',type:'Template',minutes:15,note:'Separate assumptions from questions that need evidence.'},{name:'Decision summary',type:'Template',minutes:10,note:'Record a choice, its reason and what remains uncertain.'},{name:'Prototype walkthrough',type:'Guide',minutes:20,note:'Walk through one realistic task and note friction.'}];let key='name',direction=1,query='';document.getElementById('root').innerHTML=`<main><p class="eyebrow">DET FÆLLES DESIGNSYSTEM / ORIGINAL TABLE STUDY</p><h1>Find a planning resource</h1><p class="lead">Compare five authored resources. Search the full table or sort by title and estimated reading time.</p><form id="search-form"><label class="form-label" for="search">Search sample resources</label><div class="search-controls"><input class="form-input" id="search" type="search"><button class="button button-primary" type="submit">Search</button><button class="button button-secondary" id="reset" type="button">Reset</button></div></form><p id="count" role="status"></p><div class="table--responsive-scroll" tabindex="0" role="region" aria-label="Resource comparison table"><table class="table" id="resource-table"><caption>Original resource comparison; reading times are sample estimates</caption><thead><tr><th scope="col" id="name-head" aria-sort="ascending"><button class="button button-unstyled sort" data-key="name">Resource title <span class="arrow" aria-hidden="true">↑</span><span class="sr-only"> — sort descending</span></button></th><th scope="col">Format</th><th scope="col" id="minutes-head"><button class="button button-unstyled sort" data-key="minutes">Minutes <span class="arrow" aria-hidden="true">↕</span><span class="sr-only"> — sort ascending</span></button></th><th scope="col">Purpose</th></tr></thead><tbody id="rows"></tbody></table></div><section id="empty" hidden><h2>No matching resource</h2><p>Try a shorter word, a format such as Template, or reset the search.</p></section><aside><h2>About this table</h2><p>The Borger.dk theme and table styling are from DKFDS 11.3.0. Search and sorting are complete original JavaScript: the published table component does not implement them for you.</p><ul><li>Search is applied when you submit the form.</li><li>A selected column always has an active sort order.</li><li>On a narrow screen, scroll the table without moving the whole page.</li></ul></aside></main>`;const $=id=>document.getElementById(id);function render(){const list=rows.filter(r=>Object.values(r).join(' ').toLowerCase().includes(query)).sort((a,b)=>direction*(key==='minutes'?a.minutes-b.minutes:a.name.localeCompare(b.name)));$('rows').replaceChildren(...list.map(r=>{const tr=document.createElement('tr');[r.name,r.type,String(r.minutes),r.note].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});return tr}));$('count').textContent=list.length+' of '+rows.length+' resources · sorted by '+(key==='name'?'title':'minutes')+' '+(direction===1?'ascending':'descending');$('empty').hidden=!!list.length;document.querySelectorAll('.sort').forEach(b=>{const active=b.dataset.key===key;active?b.parentElement.setAttribute('aria-sort',direction===1?'ascending':'descending'):b.parentElement.removeAttribute('aria-sort');b.querySelector('.arrow').textContent=active?(direction===1?'↑':'↓'):'↕';b.querySelector('.sr-only').textContent=' — sort '+(active&&direction===1?'descending':'ascending')})}$('search-form').addEventListener('submit',e=>{e.preventDefault();query=$('search').value.trim().toLowerCase();render()});$('reset').addEventListener('click',()=>{$('search').value='';query='';render();$('search').focus()});document.querySelectorAll('.sort').forEach(b=>b.addEventListener('click',()=>{direction=key===b.dataset.key?-direction:1;key=b.dataset.key;render()}));render();

```

[Code reference](https://designsystem.dk/komponenter/tables/)

- Sorting and searching are original application code, as required by the published table integration boundary.

### denmark.css — original page composition

Responsive search controls and a keyboard-focusable table scroll region.

```css
body{margin:0}main{max-width:1160px;padding:32px;margin:auto}.eyebrow{font-size:14px;font-weight:600;letter-spacing:.04em}.lead{max-width:66ch}#search-form{margin:32px 0}.search-controls{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.search-controls input{flex:1;min-width:180px;max-width:480px}#count{font-weight:600}.table--responsive-scroll{position:relative;max-width:100%;overflow:auto}.table{min-width:720px;width:100%}.table caption{text-align:left;font-weight:600;margin-bottom:16px}.table th:nth-child(1){width:25%}.table th:nth-child(2){width:15%}.table th:nth-child(3){width:16%}.arrow{margin-left:8px}.sort{white-space:nowrap}aside,#empty{padding:24px;margin-top:32px;background:#f1f1f1;border-left:4px solid #44831e}aside h2,#empty h2{margin-top:0}aside li{margin:8px 0}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.search-controls{gap:12px}.search-controls input{flex-basis:100%;max-width:none}h1{font-size:34px}}

@media(max-width:480px){.search-controls input{min-width:0;width:100%}.search-controls .button{max-width:100%;white-space:normal}h1{overflow-wrap:anywhere}}

```

[Code reference](https://designsystem.dk/komponenter/tables/)

- The table retains its column layout inside a scroll region at narrow widths.

### index.html — complete distribution asset shell

Load the published stylesheet with its relative assets preserved.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Planning resource comparison</title>
<link rel="stylesheet" href="/dkfds/css/dkfds-borgerdk.css">
</head>
<body><div id="root"></div><script type="module" src="/src/main.js"></script></body>
</html>
```

[Code reference](https://designsystem.dk/kom-i-gang/implementering-kode/hent-kodepakken/)

- Replace the Vite root index.html with this shell.

## Implementation Starting Point

The official stylesheet/fonts run locally. The application owns sorting and filtering; no DKFDS.init call is needed for this static table styling.

```sh
npm create vite@latest dkfds-table -- --template vanilla
cd dkfds-table
npm install
npm install dkfds@11.3.0
mkdir -p public/dkfds
cp -R node_modules/dkfds/dist/. public/dkfds/
# Replace index.html, src/main.js and src/denmark.css with the supplied examples.
npm run dev
```

## Agent Prompt

Build the DKFDS resource comparison using the real 11.3.0 Borger.dk distribution and font context. Implement complete original numeric and title sorting, one active aria-sort header, submitted search, count feedback and reset preserving order. Keep the table horizontally scrollable within its own keyboard-accessible region.

## Sources

- [Table guidance](https://designsystem.dk/komponenter/tables/) — Markup, scrolling, sorting and search responsibilities.
- [Package and themes](https://designsystem.dk/kom-i-gang/implementering-kode/hent-kodepakken/) — Distribution stylesheets and initialization boundaries.
- [Theme adjustment](https://designsystem.dk/kom-i-gang/implementering-kode/justering/) — Source-level theme configuration.
- [Versioned source](https://github.com/detfaellesdesignsystem/dkfds-components) — Sass maps, theme values and asset licenses.
