# Monday Vibe Design System — OpenDesign Application Guide

Compose a working delivery board with Vibe 4 tokens and React controls. Understand semantic action colors versus board labels, named spacing steps, font shorthands and the explicit CSS setup that a new application needs.

Independent Vibe 4 reference and local board demonstration. No monday.com account, workspace data or SDK connection. The native starter uses real Vibe Button controls and application-owned table markup.

## Source Reference

- **Current package:** @vibe/core; Vibe 4 is actively maintained ([source](https://github.com/mondaycom/vibe))
- **Token import:** @vibe/core/tokens ([source](https://github.com/mondaycom/vibe))
- **Component import:** Named exports from @vibe/core ([source](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md))
- **Font loading:** Not automatically installed by the component library ([source](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md))
- **Layout prerequisite:** Global border-box sizing ([source](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md))
- **Default action color:** #0073ea in the light theme ([source](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/themes/light-theme.scss))
- **Spacing API:** --space-2 through --space-80 ([source](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/spacing.scss))


## Design Reference

Vibe 4 public source and @vibe/core integration. Values below are the verified light-theme and style definitions; board-label colors are distinct from semantic success/error roles. Native example uses real Vibe Button controls inside an application-owned HTML table.

### Current spacing variables

[Official reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/spacing.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --space-2 | 2px | Use for application spacing; numeric token name is the current source spelling. |
| --space-4 | 4px | Use for application spacing; numeric token name is the current source spelling. |
| --space-8 | 8px | Use for application spacing; numeric token name is the current source spelling. |
| --space-12 | 12px | Use for application spacing; numeric token name is the current source spelling. |
| --space-16 | 16px | Use for application spacing; numeric token name is the current source spelling. |
| --space-20 | 20px | Use for application spacing; numeric token name is the current source spelling. |
| --space-24 | 24px | Use for application spacing; numeric token name is the current source spelling. |
| --space-32 | 32px | Use for application spacing; numeric token name is the current source spelling. |
| --space-40 | 40px | Use for application spacing; numeric token name is the current source spelling. |
| --space-48 | 48px | Use for application spacing; numeric token name is the current source spelling. |
| --space-64 | 64px | Use for application spacing; numeric token name is the current source spelling. |
| --space-80 | 80px | Use for application spacing; numeric token name is the current source spelling. |

### Action and surface colors

[Official reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/themes/light-theme.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --primary-color | #0073ea | Primary actions. |
| --primary-hover-color | #0060b9 | Hovered primary action. |
| --primary-selected-color | #cce5ff | Selected content background. |
| --primary-text-color | #323338 | Default readable text. |
| --secondary-text-color | #676879 | Secondary labels. |
| --primary-background-color | #ffffff | Main surface. |
| --allgrey-background-color | #f6f7fb | Application background. |
| --ui-border-color | #c3c6d4 | Control boundary. |
| --positive-color | #00854d | Semantic positive action. |
| --negative-color | #d83a52 | Semantic negative action. |

### Board-label palette

[Official reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/themes/light-theme.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-done-green | #00c875 | Categorical Done label, not the semantic positive color. |
| --color-working_orange | #fdab3d | Categorical Working label; exact source name includes underscore. |
| --color-stuck-red | #df2f4a | Categorical Stuck label. |
| --color-dark_purple | #784bd1 | Group identity example. |

### Typography shorthands

[Official reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/typography.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --font-family | Figtree, Roboto, Noto script fallbacks, sans-serif | Body family; font files are separately installed. |
| --title-font-family | Poppins, Roboto, Noto script fallbacks, sans-serif | Title family. |
| --font-h1-medium | 600 32px/40px; title family | Board title. |
| --font-h2-medium | 600 24px/30px; title family | Group heading. |
| --font-h3-medium | 600 18px/24px; title family | Compact subsection. |
| --font-text1-normal | 400 16px/22px; body family | Regular content. |
| --font-text2-normal | 400 14px/20px; body family | Dense row content. |
| --font-text3-normal | 400 12px/16px; body family | Supporting detail. |

### Corners

[Official reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/border-radius.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --border-radius-4 | 4px | Small controls. |
| --border-radius-8 | 8px | Medium containers. |
| --border-radius-12 | 12px | Available numeric corner step. |
| --border-radius-16 | 16px | Large containers. |
| --border-radius-small | var(--border-radius-4) | Named small alias. |
| --border-radius-medium | var(--border-radius-8) | Named medium alias. |
| --border-radius-big | var(--border-radius-16) | Named large alias. |

### Button API

[Official reference](https://github.com/mondaycom/vibe/blob/master/packages/components/button/src/Button/Button.tsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| kind | Default: primary | Visual emphasis, including the tertiary actions used by this example. |
| size | Default: medium | Use small for compact row actions. |
| type | Default: button | Set submit explicitly for form submission. |
| disabled | boolean | Disables batch action when no rows are selected. |
| loading | boolean | Displays a loader for a real pending operation. |
| active | boolean | Visual active state; expose aria-pressed as well for a toggle. |
| onClick | React mouse-event callback | Update application state here. |
| aria-pressed | ARIA pressed state | Communicate row-toggle selection if using button toggles. |

## Monday Vibe Design System Build against the current Vibe entry points

### Core components and token CSS are separate imports

Vibe 4 exposes named React components through @vibe/core and the CSS variables through @vibe/core/tokens. Import both in a new client application. A component may inject its own styles while still relying on variables supplied by the token file. The board example uses native table structure and real Vibe Button controls, with application-owned row data and selection.

[Supporting specification](https://github.com/mondaycom/vibe)

### Avoid mixing earlier package generations

The older monday-ui-react-core package belongs to Vibe 2. Vibe 3 is maintained for critical fixes rather than new features. This guide uses the current Vibe 4 interface and numbered spacing variables. The integration is not a monday.com SDK client and has no account, workspace or item API connection.

[Supporting specification](https://github.com/mondaycom/vibe)

## Monday Vibe Design System Action colors and board labels do different jobs

### Use semantic roles for controls

Primary actions use the primary role with its matching hover color. Selection uses the selected background, while normal reading uses primary and secondary text roles. Use the theme values as a connected set instead of changing the body background in isolation. This local study stays in the verified light theme.

[Supporting specification](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/themes/light-theme.scss)

### A Done cell is not a success button

The source includes categorical board colors alongside semantic feedback colors. Done green is #00c875, while the semantic positive color is #00854d. Our row status cells use the board colors with contrasting readable text, retain the words Working, Stuck and Done, and never ask color alone to describe state.

[Supporting specification](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/themes/light-theme.scss)

## Monday Vibe Design System Use the complete font shorthand

### Titles and work rows have separate voices

The source assigns Poppins to titles and Figtree to body content, with script-aware fallbacks. The current h1-medium shorthand is 600 32px/40px, whereas text2-normal is 400 14px/20px. Apply the shorthand with the CSS font property so weight, size, line height and family remain connected. The source also contains older heading aliases; do not silently substitute their different scale.

[Supporting specification](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/typography.scss)

### Load the font files deliberately

Vibe does not import the recommended font files for you. Add the documented Figtree/Poppins stylesheet link to the application HTML or host appropriately licensed files yourself. The offline specimen explicitly uses system fallback fonts, so its rendering is an interpretation rather than a claim of exact monday.com typography.

[Supporting specification](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md)

## Monday Vibe Design System A compact board without compressed controls

### Numbered spaces define the rhythm

Use --space-8 for adjacent toolbar actions, --space-16 for panel padding and --space-24 between board regions. All are exact names from the current source. These placements are choices made for this application. The scale also includes a two-pixel step for fine alignment and larger values up to eighty pixels for composition.

[Supporting specification](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/spacing.scss)

### Corners establish containment

Small aliases resolve to four pixels, medium to eight and big to sixteen. Give the enclosing board a medium corner while allowing the table cells to remain square and aligned. Rounding every colored cell into a badge makes dense column relationships harder to scan.

[Supporting specification](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/border-radius.scss)

## Monday Vibe Design System An editable table with a batch toolbar

### Keep the data shape explicit

Each work item has a stable id, a title, an owner and a status. Native column headers explain those values. A row checkbox adds the id to a Set; changing status replaces the matching object rather than mutating the array. The Complete selected action reads that same Set and updates only selected rows. The completion summary is derived from the rows.

- The primary batch button is disabled when the selection Set is empty.
- The per-row tertiary action cycles the local status for demonstration.
- The reset action restores the initial rows and clears the selection.

[Supporting specification](https://github.com/mondaycom/vibe/blob/master/packages/components/button/src/Button/Button.tsx)

## Monday Vibe Design System Expose state through the actual Button API

### Disabled, loading and pressed are different

The native example uses disabled for an unavailable batch action. It does not display loading or success because there is no remote operation. If connecting a real persistence layer, bind loading to the request lifecycle and update success only after confirmation. The Button source also exposes active for appearance and aria-pressed for toggle semantics; one is not a substitute for the other.

[Supporting specification](https://github.com/mondaycom/vibe/blob/master/packages/components/button/src/Button/Button.tsx)

### Do not convert local edits into a service claim

The live message says how many local items changed. It does not say that a monday.com board was updated. On reload, initial sample data returns. A production integration would need explicit workspace permissions, error handling and synchronization outside the design-system layer.

[Supporting specification](https://github.com/mondaycom/vibe)

## Monday Vibe Design System Preserve row meaning across widths

### Reflow the demonstration thoughtfully

The offline board stacks each row into a labeled item card on a narrow screen. Column names are repeated as visible labels so owner and status remain understandable. This is an application layout choice, not a claim that Vibe automatically transforms every table. The native starter keeps a semantic table in a labeled horizontal overflow region as an alternative for denser data.

[Supporting specification](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md)

### Global box sizing is a prerequisite

Apply border-box to elements and pseudo-elements before using the library. Without it, a fixed-width cell plus padding can exceed its intended size, especially where a button is nested inside a dense column. Keep the outer container flexible and let toolbar actions wrap.

[Supporting specification](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md)

## Monday Vibe Design System Selection and status need independent names

### Label every row control

A selection checkbox includes the work-item title in its accessible name. Each status action includes the item name as well as the current status. A polite status message reports the batch result. Keyboard users can select rows, activate the batch command and reset the board using native controls; the page does not invent spreadsheet arrow-key behavior.

1. Select Design handoff and confirm that the batch action becomes available.
2. Complete the selection and check that the status text and derived count agree.
3. Reset and verify that both the data and checkbox selection return to their initial state.

[Supporting specification](https://github.com/mondaycom/vibe/blob/master/packages/components/button/src/Button/Button.tsx)

## Monday Vibe Design System A complete client-side entry

### Install, import, mount

The setup below is a main.jsx entry for a React client project containing a root element. Install react, react-dom and @vibe/core@4, load token CSS once, and apply the listed global stylesheet. The current package uses ES-module exports. Server-side style extraction is documented as experimental; this starter deliberately uses client rendering.

[Supporting specification](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/core/package.json)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent HTML/CSS interpretation using verified Vibe light-theme palette, spacing and typography dimensions; system fallback font.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Weekly delivery — Vibe study</title><style>*{box-sizing:border-box}body{margin:0;background:#f6f7fb;color:#323338;font:14px/20px Arial,sans-serif}button,input{font:inherit}button{cursor:pointer;border:0;border-radius:4px;padding:8px 16px;background:white;color:#323338}button:hover{background:#e7e9ef}button:disabled{opacity:.45;cursor:not-allowed}button:focus-visible,input:focus-visible{outline:3px solid #0073ea;outline-offset:2px}.shell{display:grid;grid-template-columns:180px minmax(0,1fr);min-height:600px}aside{padding:24px 16px;border-right:1px solid #d0d4e4;background:#fff}.brand{font-size:20px;font-weight:bold;margin-bottom:40px}.brand span{color:#0073ea}aside p{font-size:12px;color:#676879}aside strong{display:block;background:#cce5ff;padding:12px;border-radius:4px;color:#323338}main{padding:32px;min-width:0}h1{font-size:32px;line-height:40px;font-weight:600;margin:0 0 8px}.sub{color:#676879}.overview{margin:24px 0;display:grid;grid-template-columns:1fr 2fr;gap:24px;align-items:center}.count{font-size:32px;line-height:40px}.count small{font-size:14px;color:#676879}.bar{display:flex;border-radius:8px;overflow:hidden;height:16px;background:#e7e9ef}.bar span{transition:width .15s}.legend{display:flex;gap:16px;font-size:12px;margin-top:8px}.legend span:before{content:'●';color:var(--c);margin-right:4px}.tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}.primary{background:#0073ea;color:white}.primary:hover{background:#0060b9}h2{font-size:18px;line-height:24px;color:#784bd1;font-weight:600}.board{border-left:6px solid #784bd1;border-radius:8px;background:white;overflow:hidden}.row,.head{display:grid;grid-template-columns:36px minmax(180px,1fr) 90px 130px;align-items:center;min-height:52px;border-bottom:1px solid #d0d4e4}.head{color:#676879;min-height:36px;font-size:12px}.row>*{padding:12px}.head>*{padding:8px}.row label{display:flex;align-items:center;justify-content:center}.row input{accent-color:#0073ea}.row .status{border-radius:0;height:100%;font-weight:500}.status[data-status=Working]{background:#fdab3d}.status[data-status=Stuck]{background:#df2f4a;color:white}.status[data-status=Done]{background:#00c875}.person{display:inline-flex;align-items:center;gap:8px}.avatar{width:24px;height:24px;border-radius:50%;background:#eceff8;display:inline-grid;place-items:center;font-size:11px}.row.selected{background:#f0f7ff}#message{min-height:24px;margin-top:16px;color:#676879}.mobile-label{display:none}footer{padding:16px 24px;color:#676879;font-size:11px;border-top:1px solid #d0d4e4}@media(max-width:800px){.shell{grid-template-columns:1fr}aside{display:none}main{padding:24px}}@media(max-width:560px){main{padding:16px}.overview{grid-template-columns:1fr;gap:12px}.head{display:none}.row{grid-template-columns:36px 1fr}.row .person,.row .status{grid-column:2}.row .status{margin:0 12px 12px;width:calc(100% - 24px);border-radius:4px}.mobile-label{display:inline;color:#676879;margin-right:8px}.row{padding:8px 0}.legend{flex-wrap:wrap}}</style><div class="shell"><aside><div class="brand"><span>▰</span> workroom</div><p>TEAM WORKSPACE</p><strong>Weekly delivery</strong><p>Sample project<br>No external account</p></aside><main><h1>Weekly delivery</h1><div class="sub">A shared view of the work moving this week.</div><section class="overview" aria-label="Completion summary"><div class="count"><span id="done">1</span><small> / 3 completed</small></div><div><div class="bar" aria-hidden="true"><span id="working-bar" style="background:#fdab3d"></span><span id="stuck-bar" style="background:#df2f4a"></span><span id="done-bar" style="background:#00c875"></span></div><div class="legend"><span style="--c:#fdab3d">Working</span><span style="--c:#df2f4a">Stuck</span><span style="--c:#00c875">Done</span></div></div></section><div class="tools"><button class="primary" id="complete" disabled>Complete selected</button><button id="reset">Reset board</button><span id="selection" style="padding:8px;color:#676879">0 selected</span></div><h2>▼ This week</h2><div class="board"><div class="head" aria-hidden="true"><span></span><span>Item</span><span>Owner</span><span>Status</span></div><div id="rows"></div></div><p id="message" role="status">Select items or click a status to change it locally.</p></main></div><footer>Independent Vibe 4 HTML/CSS study. Published light-theme and board-label colors; system fallback fonts. No monday.com workspace connection.</footer><script>
const initial=[{id:1,title:'Design handoff',owner:'Maya',status:'Working'},{id:2,title:'Accessibility review',owner:'Theo',status:'Stuck'},{id:3,title:'Release notes',owner:'Sam',status:'Done'}],states=['Working','Stuck','Done'];let items=structuredClone(initial),selection=new Set();const $=id=>document.getElementById(id);function totals(){$('done').textContent=items.filter(x=>x.status==='Done').length;for(const state of states)$(state.toLowerCase()+'-bar').style.width=items.filter(x=>x.status===state).length/items.length*100+'%';$('complete').disabled=!selection.size;$('selection').textContent=selection.size+' selected'}function render(){$('rows').replaceChildren();for(const item of items){const row=document.createElement('div');row.className='row'+(selection.has(item.id)?' selected':'');const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=selection.has(item.id);check.setAttribute('aria-label','Select '+item.title);check.onchange=()=>{check.checked?selection.add(item.id):selection.delete(item.id);row.classList.toggle('selected',check.checked);totals()};label.append(check);const name=document.createElement('span');name.textContent=item.title;const person=document.createElement('span');person.className='person';const av=document.createElement('span');av.className='avatar';av.setAttribute('aria-hidden','true');av.textContent=item.owner[0];const pl=document.createElement('span');pl.className='mobile-label';pl.textContent='Owner';person.append(pl,av,document.createTextNode(item.owner));const status=document.createElement('button');status.className='status';status.dataset.status=item.status;status.textContent=item.status;status.setAttribute('aria-label',item.title+': '+item.status+'. Change status');status.onclick=()=>{item.status=states[(states.indexOf(item.status)+1)%states.length];status.dataset.status=item.status;status.textContent=item.status;status.setAttribute('aria-label',item.title+': '+item.status+'. Change status');totals();$('message').textContent=item.title+' is now '+item.status+' locally.'};row.append(label,name,person,status);$('rows').append(row)}totals()}
$('complete').onclick=()=>{let n=selection.size;items.forEach(x=>{if(selection.has(x.id))x.status='Done'});selection.clear();render();$('message').textContent=n+' local items completed.'};$('reset').onclick=()=>{items=structuredClone(initial);selection.clear();render();$('message').textContent='Board reset.'};render();
</script></html>

```

[Code reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/themes/light-theme.scss)

- The batch toolbar changes sample task statuses. Label colors describe this board’s workflow and are not a replacement for Vibe semantic action tokens.

### Complete native implementation entry

The complete implementation from setup, collected here alongside the focused API explanations. Follow the documented package and build prerequisites in setup.

```jsx
// npm install react react-dom @vibe/core@4
// main.jsx in a client React project with <div id="root"></div>
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vibe/core';
import '@vibe/core/tokens';
import './board.css';
const initial=[{id:1,title:'Design handoff',owner:'Maya',status:'Working'},
{id:2,title:'Accessibility review',owner:'Theo',status:'Stuck'},
{id:3,title:'Release notes',owner:'Sam',status:'Done'}];
const states=['Working','Stuck','Done'];
function Board(){
 const [items,setItems]=useState(initial),[selected,setSelected]=useState(new Set()),[message,setMessage]=useState('');
 const toggle=id=>setSelected(old=>{const next=new Set(old);next.has(id)?next.delete(id):next.add(id);return next});
 const complete=()=>{setItems(old=>old.map(item=>selected.has(item.id)?{...item,status:'Done'}:item));setMessage(selected.size+' local items completed');setSelected(new Set())};
 return <main className="board"><h1>Weekly delivery</h1>
 <p>{items.filter(x=>x.status==='Done').length} of {items.length} items completed</p>
 <div className="toolbar"><Button disabled={!selected.size} onClick={complete}>Complete selected</Button>
 <Button kind="tertiary" onClick={()=>{setItems(initial);setSelected(new Set());setMessage('Board reset')}}>Reset</Button></div>
 <div className="table-scroll" role="region" aria-label="Delivery items" tabIndex={0}>
 <table><thead><tr><th>Select</th><th>Item</th><th>Owner</th><th>Status</th></tr></thead><tbody>
 {items.map(item=><tr key={item.id}><td><input type="checkbox" aria-label={'Select '+item.title} checked={selected.has(item.id)} onChange={()=>toggle(item.id)}/></td>
 <th scope="row">{item.title}</th><td>{item.owner}</td><td><Button kind="tertiary" size="small" aria-label={item.title+': '+item.status+'. Change status'} onClick={()=>setItems(old=>old.map(x=>x.id===item.id?{...x,status:states[(states.indexOf(x.status)+1)%states.length]}:x))}>{item.status}</Button></td></tr>)}
 </tbody></table></div><p role="status">{message}</p></main>
}
createRoot(document.getElementById('root')).render(<Board/>);
```

[Code reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/spacing.scss)

- Complete local board entry; add board.css from the component example. Fonts are not bundled automatically. Native package API checked against official source; this environment has not compiled the package example.

### Token-based board stylesheet

Use the tokens export for layout and typography. The parent region keeps the semantic table usable at narrow widths.

```css
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--allgrey-background-color);color:var(--primary-text-color);font:var(--font-text2-normal)}
.board{max-width:960px;margin:auto;padding:var(--space-24)}
h1{font:var(--font-h1-medium)}
.toolbar{display:flex;flex-wrap:wrap;gap:var(--space-8);margin-bottom:var(--space-16)}
.table-scroll{overflow:auto;border:1px solid var(--layout-border-color);border-radius:var(--border-radius-medium)}
table{width:100%;min-width:560px;border-collapse:collapse;background:var(--primary-background-color)}
th,td{text-align:left;padding:var(--space-12);border-bottom:1px solid var(--layout-border-color)}
```

[Code reference](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/spacing.scss)

- This is application CSS using actual Vibe variables.
- The embedded preview uses an independently responsive HTML interpretation.

### Font loading in the application HTML

Load the two recommended families explicitly; the CSS token import does not download them.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap">
```

[Code reference](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md)

- A self-hosted licensed font setup can replace this external stylesheet.

## Implementation Starting Point

Complete local board entry; add board.css from the component example. Fonts are not bundled automatically. Native package API checked against official source; this environment has not compiled the package example.

```jsx
// npm install react react-dom @vibe/core@4
// main.jsx in a client React project with <div id="root"></div>
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vibe/core';
import '@vibe/core/tokens';
import './board.css';
const initial=[{id:1,title:'Design handoff',owner:'Maya',status:'Working'},
{id:2,title:'Accessibility review',owner:'Theo',status:'Stuck'},
{id:3,title:'Release notes',owner:'Sam',status:'Done'}];
const states=['Working','Stuck','Done'];
function Board(){
 const [items,setItems]=useState(initial),[selected,setSelected]=useState(new Set()),[message,setMessage]=useState('');
 const toggle=id=>setSelected(old=>{const next=new Set(old);next.has(id)?next.delete(id):next.add(id);return next});
 const complete=()=>{setItems(old=>old.map(item=>selected.has(item.id)?{...item,status:'Done'}:item));setMessage(selected.size+' local items completed');setSelected(new Set())};
 return <main className="board"><h1>Weekly delivery</h1>
 <p>{items.filter(x=>x.status==='Done').length} of {items.length} items completed</p>
 <div className="toolbar"><Button disabled={!selected.size} onClick={complete}>Complete selected</Button>
 <Button kind="tertiary" onClick={()=>{setItems(initial);setSelected(new Set());setMessage('Board reset')}}>Reset</Button></div>
 <div className="table-scroll" role="region" aria-label="Delivery items" tabIndex={0}>
 <table><thead><tr><th>Select</th><th>Item</th><th>Owner</th><th>Status</th></tr></thead><tbody>
 {items.map(item=><tr key={item.id}><td><input type="checkbox" aria-label={'Select '+item.title} checked={selected.has(item.id)} onChange={()=>toggle(item.id)}/></td>
 <th scope="row">{item.title}</th><td>{item.owner}</td><td><Button kind="tertiary" size="small" aria-label={item.title+': '+item.status+'. Change status'} onClick={()=>setItems(old=>old.map(x=>x.id===item.id?{...x,status:states[(states.indexOf(x.status)+1)%states.length]}:x))}>{item.status}</Button></td></tr>)}
 </tbody></table></div><p role="status">{message}</p></main>
}
createRoot(document.getElementById('root')).render(<Board/>);
```

## Agent Prompt

Build the supplied Vibe 4 delivery board. Import @vibe/core/tokens, use current numbered spacing variables and complete font shorthands, and keep semantic feedback colors distinct from board-label colors. Implement local row selection, status edits and a derived completion count. Use disabled on the batch button; do not simulate remote saving.

## Sources

- [Vibe 4 overview](https://github.com/mondaycom/vibe) — Current package, tokens entry and older-version boundaries.
- [Core integration](https://github.com/mondaycom/vibe/blob/master/packages/core/README.md) — Root imports, global box sizing and separately loaded fonts.
- [Light theme source](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/themes/light-theme.scss) — Semantic colors, board-label colors and shadows.
- [Spacing source](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/spacing.scss) — Current numbered space variables.
- [Typography source](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/typography.scss) — Figtree/Poppins families and shorthand styles.
- [Radius source](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/style/src/border-radius.scss) — Numeric and named corner tokens.
- [Button source](https://github.com/mondaycom/vibe/blob/master/packages/components/button/src/Button/Button.tsx) — Controlled action, disabled, loading and pressed semantics.
- [Package exports](https://raw.githubusercontent.com/mondaycom/vibe/master/packages/core/package.json) — ES module entry and tokens CSS export.
