# Pure CSS Design System — OpenDesign Application Guide

Pure CSS is a modular stylesheet for grids, forms, buttons, menus and tables, without a widget runtime. This guide shows how its optional responsive grid module and native semantic elements fit together in a filterable equipment catalog, with sorting and selection implemented explicitly.

Pure CSS 3.1.0. Selector values are official package values; catalog typography, colors, spacing and application behavior are original. No reservations are made.

## Source Reference

- **Library scope:** Small CSS modules ([source](https://pure-css.github.io/))
- **Platform or architecture:** Includes base styles ([source](https://pure-css.github.io/start/))
- **Integration:** Includes responsive grids ([source](https://pure-css.github.io/start/))
- **Component support:** Includes form styles ([source](https://pure-css.github.io/start/))
- **Customization or behavior:** Includes button styles ([source](https://pure-css.github.io/start/))
- **Additional capability:** Includes table and menu styles ([source](https://pure-css.github.io/start/))


## Design Reference

Pure CSS 3.1.0 compiled package modules. These are literal selector values, not a named design-token API: Pure does not publish a semantic CSS-variable theme like Chakra or Pico. The application adds its own typography, layout spacing and stronger focus outline.

### Official button and form values

[Official reference](https://github.com/pure-css/pure)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| .pure-button padding | 0.5em 1em | Scales with inherited button text size. |
| .pure-button radius | 2px | Default button corner shape. |
| .pure-button background | #E6E6E6 | Neutral button fill. |
| .pure-button-primary background | rgb(0, 120, 231) | Optional primary/selected fill. |
| .pure-button disabled opacity | 0.40 | Use the disabled attribute for behavior as well. |
| .pure-form input padding | 0.5em 0.6em | Common text input padding. |
| .pure-form input border | 1px solid #ccc | Default input boundary. |
| .pure-form input radius | 4px | Input shape differs from button radius. |

### Official table values

[Official reference](https://github.com/pure-css/pure)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| .pure-table border | 1px solid #cbcbcb | Table outer boundary. |
| .pure-table td / th padding | 0.5em 1em | Readable cell spacing. |
| .pure-table thead background | #e0e0e0 | Column header surface. |
| .pure-table-striped odd-row fill | #f2f2f2 | Optional striping; this specimen chooses horizontal rules. |
| .pure-table-horizontal | Bottom borders only | Keeps row structure without vertical separators. |

### Responsive grid boundaries

[Official reference](https://github.com/pure-css/pure)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sm | 35.5em | 568px at a 16px browser default. |
| md | 48em | 768px; sidebar becomes one quarter width. |
| lg | 64em | 1024px. |
| xl | 80em | 1280px. |
| xxl | 120em | 1920px in the installed 3.1.0 responsive grid. |

### Original catalog styling

[Official reference](https://github.com/pure-css/pure)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Body | 16px / 1.5 Arial, Helvetica, sans-serif | Explicit application typography. |
| Page heading | 34px / 1.15; 28px on mobile | Original editorial hierarchy. |
| Section heading | 18px / 1.3 | Original sidebar and selection title. |
| Content gutters | 24px desktop, 16px mobile | Original outer padding. |
| Focus outline | 3px solid #0078e7; offset 3px | Application enhancement over the default button focus gradient. |
| Table minimum width | 540px | Preserves column meaning in a locally scrollable region. |

## Pure CSS Design System A Small Set of CSS Modules

### A Small Set of CSS Modules

Pure offers base normalization, grids, buttons, forms, menus and tables. This catalog uses the package’s compiled rollup and a separate responsive grid file. It does not import a JavaScript framework, provider or widget runtime. Filtering, sorting and selection are application code shown in full above.

The distinction matters when comparing Pure with a full component platform. A pure-table class supplies cell styling; it does not supply sorting, pagination, virtualization or selection semantics. A pure-button is a visual class that can be placed on a native button. The example keeps the underlying semantic elements rather than expecting class names to manufacture behavior.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Literal CSS Values, Not an Invented Token System

### Literal CSS Values, Not an Invented Token System

Pure’s compiled button styles use a neutral #E6E6E6 fill, a two-pixel radius and em-based padding. The optional primary button is rgb(0,120,231) with white text. Form inputs use a four-pixel radius and their own padding. The system reference exposes these actual differences instead of normalizing them into a fictitious shared radius scale.

This catalog adds a deliberately restrained application palette: dark blue-gray text, neutral separators and a pale selection summary. Those choices are not official Pure brand colors. There is no dark-mode toggle because this version of the example does not implement a complete alternate application palette. A theme switch would need to cover forms, table headers, borders, text and focus states together.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Typography and Spacing Belong to the Application

### Typography and Spacing Belong to the Application

The original page layer chooses Arial/Helvetica at sixteen pixels with a 1.5 line height, a 34px heading and 18px section titles. On narrow screens the heading becomes 28px. These are explicit choices rather than a claim that Pure prescribes an editorial scale. All values needed to reproduce the composition are present in the CSS example.

Pure’s grid adjusts text rendering and letter spacing on the grid container to handle inline units. Its unit rules restore normal text behavior. The catalog also assigns its font family to grid units, avoiding an unexpected font change within the sidebar and results. Application padding is placed inside the units, with border-box sizing, so the fractional widths remain intact.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Responsive Fractions Need the Responsive Module

### Responsive Fractions Need the Responsive Module

The sidebar combines pure-u-1 with pure-u-md-1-4; the results combine pure-u-1 with pure-u-md-3-4. Both are full width initially. At the md media boundary, 48em, they become a quarter and three quarters. This gives the filter a readable fixed proportion without custom JavaScript layout calculations.

The main pure-min.css rollup does not include the responsive grid media-query classes. Forgetting grids-responsive-min.css leaves these md modifiers ineffective. The setup loads both files explicitly. At mobile widths, the sidebar precedes the table and the result border is removed, giving one continuous reading order.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Filtering Is Separate From Selecting

### Filtering Is Separate From Selecting

The stacked form has a labeled search input, a category select and an availability checkbox. Every input change rerenders the visible rows using all three conditions. A form submit is prevented so pressing Enter in the search field does not navigate away. Clear filters calls native reset and rerenders after the browser restores defaults.

Selection is stored in a Set of stable kit IDs. Hiding a selected item with a filter does not remove it from that Set. The always-visible review list therefore remains the authority for what is selected. This behavior is explained next to the selection count; otherwise a user might mistake filtered-out rows for deselected equipment.

1. Select an available recorder or camera.
2. Filter to a different category and check that the selected item remains in the review list.
3. Clear selection to remove all selected IDs independently of filters.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Keep Table Meaning on Narrow Screens

### Keep Table Meaning on Narrow Screens

The table uses caption, thead, tbody and column-header scope attributes. The Equipment header contains a native button that reverses name order. Its parent th receives aria-sort=ascending or descending, matching the visible arrow. All rows keep the same column structure when sorting.

A 540px minimum width preserves the meaning of Select, Equipment, Category and Availability. On a narrow screen only the labeled table region scrolls horizontally. That region is keyboard focusable and has a visible focus outline. The page itself does not widen. This is a deliberate data-table treatment rather than forcing each row into a visually unrelated card.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Disabled, Empty, and Focus States Need Real Behavior

### Disabled, Empty, and Focus States Need Real Behavior

On-loan items remain in the list to explain availability but cannot be selected: their native checkboxes are disabled. Clear selection is also disabled when the Set is empty. Pure’s opacity rule helps communicate disabled appearance, but the HTML attribute is what prevents activation.

A filter with no results shows a specific empty message and retains the headers. The result count is a polite status region. The original stylesheet adds a strong focus-visible outline because the default Pure button focus treatment is a gradient with outline reset; for this working tool, a clearer keyboard indicator is useful.

- Disabled checkboxes explain unavailable kits without removing their rows.
- The empty state explains how to recover by clearing filters.
- Focus outlines cover buttons, inputs, selects and the scroll region.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Install and Reproduce the Entire Catalog

### Install and Reproduce the Entire Catalog

Install purecss@3.1.0, copy pure-min.css and grids-responsive-min.css into the local assets directory, and include them in that order before style.css. The complete body, application script and CSS are supplied above. A static server can serve the resulting files; no build runtime is required by the catalog itself.

The package modules are also available separately if bundle size requires a narrower selection. Keep the base and grid dependencies coherent when reducing the CSS. Do not copy only a table stylesheet and then assume form or button classes will still be styled. The current specimen favors a reproducible complete setup over an unexplained partial bundle.

[Supporting specification](https://github.com/pure-css/pure)

## Pure CSS Design System Choose CSS Modules Without Losing Their Dependencies

### Choose CSS Modules Without Losing Their Dependencies

The compiled rollup styles the catalog’s buttons, forms and table, while grids-responsive-min.css supplies the breakpoint-qualified fractions. Removing the responsive file does not produce an error: the md classes simply stop changing the layout. Check the resulting column behavior when narrowing the imported modules.

Grid units also restore text behavior that the grid container adjusts for its inline layout. Keep the application font assignment on the units and place padding inside them with border-box sizing. If the catalog later gains pagination, retain selection by stable IDs in application state; neither table CSS nor a grid fraction implements that behavior.

[Supporting specification](https://github.com/pure-css/pure)

## Component Examples

### Catalog markup with Pure modules

Responsive quarter/three-quarter layout, stacked form and horizontally ruled table.

```html
<main class="catalog"><header><p class="eyebrow">PURE CSS / LENDING DESK</p><h1>A small equipment catalog.</h1><p>Find a kit, select available items, and review the local selection.</p></header><div class="pure-g"><aside class="pure-u-1 pure-u-md-1-4"><div class="sidebar"><h2>Refine the list</h2><form class="pure-form pure-form-stacked" id="filters"><label for="query">Equipment name</label><input id="query" type="search" placeholder="Camera, recorder…"><label for="kind">Category</label><select id="kind"><option value="all">All categories</option><option>Camera</option><option>Audio</option><option>Lighting</option></select><label class="pure-checkbox"><input id="available" type="checkbox"> Available only</label><button class="pure-button" type="reset">Clear filters</button></form><div class="selection"><strong id="selected-count">0 items selected</strong><p>Selection is kept when a filter hides a row.</p><button id="clear-selection" class="pure-button" disabled>Clear selection</button></div></div></aside><section class="pure-u-1 pure-u-md-3-4"><div class="results"><p id="count" role="status"></p><div class="table-scroll" tabindex="0" role="region" aria-label="Equipment table, scroll horizontally on narrow screens"><table class="pure-table pure-table-horizontal"><caption>Studio lending kits — local sample records</caption><thead><tr><th scope="col">Select</th><th scope="col" aria-sort="ascending"><button id="sort" class="sort">Equipment ↑</button></th><th scope="col">Category</th><th scope="col">Availability</th></tr></thead><tbody id="rows"></tbody></table></div><p id="empty" hidden>No matching equipment. Clear the filters to see all six kits.</p><section class="summary" aria-labelledby="selection-title"><h2 id="selection-title">Selected for review</h2><ul id="selection-list"><li>No equipment selected.</li></ul><p>This is a browsing example. Selecting a kit does not reserve it.</p></section></div></section></div></main>

```

[Code reference](https://github.com/pure-css/pure)

- grids-responsive-min.css is loaded separately.
- On-loan checkboxes use disabled, not just muted styling.

### Filter, sort and selection state

Original behavior renders six fixed sample records and maintains selection by stable ID.

```javascript
const data=[{id:'c1',name:'Compact camera kit',kind:'Camera',available:true},{id:'c2',name:'Cinema camera kit',kind:'Camera',available:false},{id:'a1',name:'Field recorder',kind:'Audio',available:true},{id:'a2',name:'Wireless microphone pair',kind:'Audio',available:true},{id:'l1',name:'Portable LED panel',kind:'Lighting',available:false},{id:'l2',name:'Softbox lighting kit',kind:'Lighting',available:true}];const selected=new Set();let ascending=true;const $=id=>document.getElementById(id);
function selection(){ $('selected-count').textContent=selected.size+(selected.size===1?' item selected':' items selected');$('clear-selection').disabled=!selected.size;const list=$('selection-list');list.replaceChildren();for(const x of data.filter(x=>selected.has(x.id))){const li=document.createElement('li');li.textContent=x.name;list.append(li);}if(!selected.size){const li=document.createElement('li');li.textContent='No equipment selected.';list.append(li);}}
function render(){const query=$('query').value.toLowerCase().trim();const visible=data.filter(x=>x.name.toLowerCase().includes(query)&&($('kind').value==='all'||x.kind===$('kind').value)&&(!$('available').checked||x.available)).sort((a,b)=>(ascending?1:-1)*a.name.localeCompare(b.name));$('count').textContent=visible.length+' of '+data.length+' kits shown';$('empty').hidden=visible.length!==0;$('rows').replaceChildren();for(const x of visible){const tr=document.createElement('tr');const choice=document.createElement('td');const input=document.createElement('input');input.type='checkbox';input.disabled=!x.available;input.checked=selected.has(x.id);input.setAttribute('aria-label','Select '+x.name);input.addEventListener('change',()=>{input.checked?selected.add(x.id):selected.delete(x.id);selection()});choice.append(input);tr.append(choice);for(const value of [x.name,x.kind,x.available?'Available':'On loan']){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('rows').append(tr);}selection();}
$('filters').addEventListener('input',render);$('filters').addEventListener('submit',e=>e.preventDefault());$('filters').addEventListener('reset',()=>setTimeout(render,0));$('sort').addEventListener('click',()=>{ascending=!ascending;$('sort').textContent='Equipment '+(ascending?'↑':'↓');$('sort').parentElement.setAttribute('aria-sort',ascending?'ascending':'descending');render()});$('clear-selection').addEventListener('click',()=>{selected.clear();render()});render();

```

[Code reference](https://github.com/pure-css/pure)

- Filtering does not silently discard selected IDs.
- User-entered search never becomes HTML.

### Application typography and focus CSS

A complete visual layer that complements the intentionally minimal library.

```css
*{box-sizing:border-box}body{font:16px/1.5 Arial,Helvetica,sans-serif;color:#263238;background:#fff}.catalog{max-width:1120px;margin:auto;padding:32px 24px}h1{font-size:34px;line-height:1.15;letter-spacing:-.03em;margin:12px 0}h2{font-size:18px;line-height:1.3}.eyebrow{font-size:11px;letter-spacing:.12em;font-weight:700;color:#435c68}header{border-bottom:3px solid #263238;padding-bottom:24px;margin-bottom:24px}.pure-g [class*=pure-u]{font-family:Arial,Helvetica,sans-serif}.sidebar{padding-right:24px}.results{padding-left:24px;border-left:1px solid #d7dfe3}.pure-form input[type=search],.pure-form select{width:100%;max-width:100%}.pure-form label{margin-top:16px}.selection{border-top:1px solid #d7dfe3;margin-top:28px;padding-top:20px;font-size:14px}.table-scroll{overflow:auto}table{width:100%;min-width:540px}.pure-table caption{text-align:left;font-style:normal;color:#52616a}.sort{border:0;background:none;padding:0;color:inherit;text-align:left;font-weight:700;cursor:pointer}.summary{padding:16px 20px;background:#f3f6f7;margin-top:24px}.summary p{font-size:14px;color:#52616a}.pure-button:focus-visible,.sort:focus-visible,.table-scroll:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #0078e7;outline-offset:3px}#empty{padding:20px;border:1px dashed #83919a}@media(max-width:767px){.catalog{padding:24px 16px}h1{font-size:28px}.sidebar{padding:0}.results{padding:24px 0 0;border-left:0}.selection{margin-bottom:24px}}

```

[Code reference](https://github.com/pure-css/pure)

- These values are original application choices, not official Pure tokens.

## Implementation Starting Point

Save the CSS and JavaScript examples as style.css and app.js. Responsive grid media classes are a separate file. The offline preview inlines both official stylesheets and the original application code. The HTML wrapper includes the full body markup; save the supplied interaction and CSS examples under the filenames referenced here.

```html
<!-- npm install purecss@3.1.0
mkdir -p assets
cp node_modules/purecss/build/pure-min.css assets/
cp node_modules/purecss/build/grids-responsive-min.css assets/ -->
<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Equipment catalog</title>
<link rel="stylesheet" href="assets/pure-min.css">
<link rel="stylesheet" href="assets/grids-responsive-min.css">
<link rel="stylesheet" href="style.css">
<script src="app.js" defer></script></head>
<body><main class="catalog"><header><p class="eyebrow">PURE CSS / LENDING DESK</p><h1>A small equipment catalog.</h1><p>Find a kit, select available items, and review the local selection.</p></header><div class="pure-g"><aside class="pure-u-1 pure-u-md-1-4"><div class="sidebar"><h2>Refine the list</h2><form class="pure-form pure-form-stacked" id="filters"><label for="query">Equipment name</label><input id="query" type="search" placeholder="Camera, recorder…"><label for="kind">Category</label><select id="kind"><option value="all">All categories</option><option>Camera</option><option>Audio</option><option>Lighting</option></select><label class="pure-checkbox"><input id="available" type="checkbox"> Available only</label><button class="pure-button" type="reset">Clear filters</button></form><div class="selection"><strong id="selected-count">0 items selected</strong><p>Selection is kept when a filter hides a row.</p><button id="clear-selection" class="pure-button" disabled>Clear selection</button></div></div></aside><section class="pure-u-1 pure-u-md-3-4"><div class="results"><p id="count" role="status"></p><div class="table-scroll" tabindex="0" role="region" aria-label="Equipment table, scroll horizontally on narrow screens"><table class="pure-table pure-table-horizontal"><caption>Studio lending kits — local sample records</caption><thead><tr><th scope="col">Select</th><th scope="col" aria-sort="ascending"><button id="sort" class="sort">Equipment ↑</button></th><th scope="col">Category</th><th scope="col">Availability</th></tr></thead><tbody id="rows"></tbody></table></div><p id="empty" hidden>No matching equipment. Clear the filters to see all six kits.</p><section class="summary" aria-labelledby="selection-title"><h2 id="selection-title">Selected for review</h2><ul id="selection-list"><li>No equipment selected.</li></ul><p>This is a browsing example. Selecting a kit does not reserve it.</p></section></div></section></div></main>
</body></html>
```

## Agent Prompt

Build from the supplied Pure CSS 3.1.0 equipment catalog and load both pure-min.css and grids-responsive-min.css. Preserve quarter/three-quarter responsive grid units, labeled filters, a semantic sortable table and its contained horizontal scrolling region. Combine search, category and availability filters without clearing selected IDs. Keep on-loan checkboxes disabled, update aria-sort when reversing the Equipment column, and retain selected items in the review list when filters hide them. Selection is local and must not be reported as a reservation.

## Sources

- [Official repository](https://github.com/pure-css/pure) — Module boundaries, build files, responsive grid inclusion and license.
- [Grid implementation](https://github.com/pure-css/pure/blob/main/src/grids/css/grids-core.css) — Grid container and unit text handling.
- [Package source](https://github.com/pure-css/pure/tree/main/src) — Selector-level source used to verify the installed 3.1.0 modules.
