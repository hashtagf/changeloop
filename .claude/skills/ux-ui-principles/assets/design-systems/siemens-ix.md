# Siemens iX Design System — OpenDesign Application Guide

Inspect industrial events with an explicit severity vocabulary, theme-aware color roles and the iX Event List API. This guide builds a local equipment notebook without confusing a reviewed record with a resolved machine alarm.

Independent OpenDesign guide. Event data and equipment illustration are fictional. Preview styling is an original interpretation; the separate React example uses the documented iX API. No machine connection, telemetry or live acknowledgement is implemented.

## Source Reference

- **Implementation:** Core web components plus React wrappers ([source](https://ix.siemens.io/docs/home/installation/react))
- **Theme attribute:** data-ix-color-schema ([source](https://ix.siemens.io/docs/home/installation/react))
- **Density:** Event List supports compact and itemHeight ([source](https://raw.githubusercontent.com/siemens/ix/main/packages/core/component-api.json))
- **Selection event:** itemClick; React onItemClick ([source](https://raw.githubusercontent.com/siemens/ix/main/packages/core/component-api.json))
- **Type format:** ix-typography format="h3" ([source](https://ix.siemens.io/docs/styles/typography/code))
- **State language:** Alarm, Critical, Warning, Success, Info and Neutral ([source](https://ix.siemens.io/docs/styles/colors))


## Design Reference

Current public iX documentation and the official main-branch component API snapshot. Color entries below are semantic roles, not invented fixed hex values. Installed package versions must be locked together; the offline specimen uses its own clearly identified palette and dimensions.

### Theme and package entry

[Official reference](https://ix.siemens.io/docs/home/installation/react)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Core package | @siemens/ix | Web components and global stylesheet. |
| React wrappers | @siemens/ix-react | React component integration. |
| Icons | @siemens/ix-icons | Official icon dependency. |
| data-ix-theme | classic | Document-level theme selector. |
| data-ix-color-schema | dark \| light \| system | Exact attribute spelling uses schema. |
| Global CSS | @siemens/ix/dist/siemens-ix/siemens-ix.css | Import once at the application entry. |

### Reading and surface roles

[Official reference](https://ix.siemens.io/docs/styles/colors)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --theme-color-primary | Primary action role | Resolve through the chosen theme. |
| --theme-color-std-text | Default reading color | Event titles and body text. |
| --theme-color-soft-text | Secondary reading color | Times and asset metadata. |
| --theme-color-weak-text | Disabled reading color | Do not use for important secondary information. |
| --theme-color-alarm-text | Alarm text role | Use when error text needs a foreground color. |
| --theme-color-component-1 | Interactive component fill | Semitransparent; underlying surface affects its appearance. |
| color-0 | Transparent background role | Other background levels are opaque. |

### Severity vocabulary

[Official reference](https://ix.siemens.io/docs/styles/colors)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Alarm | Error, invalid or dangerous condition | Keep its text label alongside the colored marker. |
| Critical | Between alarm and warning | A separate meaning, not another shade for decoration. |
| Warning | Condition requiring attention | Do not silently promote it to alarm. |
| Success | Positive outcome | A review action does not necessarily make an alarm successful. |
| Info | Informational condition | Separate from disabled content. |
| Neutral | Unclassified neutral condition | Available when no status judgment applies. |

### Boundary hierarchy

[Official reference](https://ix.siemens.io/docs/styles/borders)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --theme-color-hard-bdr | Strong solid boundary | High separation. |
| --theme-color-std-bdr | Standard control boundary | Input or selection control. |
| --theme-color-soft-bdr | Card boundary | Used for the notebook inspector. |
| --theme-color-weak-bdr | Region boundary | Separate major regions gently. |
| --theme-color-x-weak-bdr | Very subtle boundary | Low-emphasis division. |
| --theme-primary-bdr-1 | Complete border value | Use as border: var(--theme-primary-bdr-1), not as a color. |

### Type roles

[Official reference](https://ix.siemens.io/docs/styles/typography/guide)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Headings | H1 through H6 | Document hierarchy. |
| Body | Multiline reading | Inspection notes and explanation. |
| Label | Single-line component text | Short controls and fields. |
| Display | Single-line KPI presentation | Counts; not paragraphs. |
| Code | Code and technical syntax | API examples or identifiers when appropriate. |

### Event List API snapshot

[Official reference](https://raw.githubusercontent.com/siemens/ix/main/packages/core/component-api.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| IxEventList.itemHeight | S \| L \| number; default S | Use L for the sample title and metadata. |
| IxEventList.compact | boolean; default false | Compact mode is explicitly selected. |
| IxEventList.chevron | boolean; default false | Show navigational affordance. |
| IxEventList.animated | boolean; default false | Avoid unnecessary movement in a static log. |
| IxEventListItem.itemColor | string | Theme CSS color expression. |
| IxEventListItem.selected | boolean; default false | Controlled by selected record ID. |
| IxEventListItem.variant | outline \| filled; default outline | Presentation choice. |
| IxEventListItem.disabled | boolean; default false | Disable only when interaction is unavailable. |
| itemClick | Custom event | React wrapper onItemClick selects the record. |

## Siemens iX Design System Industrial events with distinct review and resolution states

### A notebook, not a machine control panel

The working example is a fictional equipment notebook. Three records retain their source severity while a separate local review state tracks what a reader has inspected. This separation is essential to the composition: selecting a row, reading a note and resolving a physical condition are different operations. The preview implements the first two and makes no live control claim.

The Event List is a better starting point than decorative cards because its selected state, severity marker and chevron make repeated records legible as a navigable collection. The inspector holds longer text outside the row. There is no fake telemetry stream or success toast claiming an alarm has cleared.

[Supporting specification](https://ix.siemens.io/docs/components/event-list/code)

## Siemens iX Design System Color roles for operational meaning

### Pair markers with reading colors

The color system distinguishes opaque background layers from semitransparent component fills. A component fill cannot be assessed independently of the surface beneath it. Use the actual theme variables in native code, rather than copying a screenshot hex value into every row.

Standard and soft text serve different reading priorities. Weak text is intended for disabled material, so a timestamp needed for an investigation should not automatically be pushed into that role. The dedicated alarm-text role is more appropriate for an error foreground than blindly reusing a status fill.

- Show the word Alarm, Warning or Info next to the colored edge.
- Keep the alarm marker after local review; review does not change the source condition.
- Reserve selected styling for navigation state, so severity and selection remain distinguishable.

[Supporting specification](https://ix.siemens.io/docs/styles/colors)

## Siemens iX Design System Typography that separates notes from labels

### Use formats rather than a guessed pixel scale

iX divides typography into headings, body, labels, display and code. Inspection notes need the multiline body behavior; a large count is a display candidate; a short filter label belongs to the label category. A display treatment is not a convenient way to make an entire event description larger.

The documented ix-typography format="h3" example supplies a concrete implementation entry. The equivalent Sass typography-h3 mixin supports a custom element without recreating its font rules. The preview deliberately uses a system fallback and application type sizes; those values are not presented as official Siemens tokens.

[Supporting specification](https://ix.siemens.io/docs/styles/typography/code)

## Siemens iX Design System Event List selection and density

### Control identity independently from item appearance

The API snapshot exposes itemHeight as S, L or a number. The sample chooses L, leaves compact at its default false and enables a chevron. A production log with longer localized titles must verify the chosen height against wrapping rather than assuming every record fits because the sample does.

Each item receives selected from an ID comparison and sends itemClick through the wrapper’s onItemClick handler. The inspector reads from the same ID. This avoids a visual selection and a detail panel silently referring to different records. Filter changes explicitly clear the selected ID.

[Supporting specification](https://raw.githubusercontent.com/siemens/ix/main/packages/core/component-api.json)

## Siemens iX Design System An inspector that survives a narrow viewport

### Move detail below the event collection

The example’s two-to-one grid is an application layout, not a published iX grid token. On a narrow viewport it becomes one column, preserving record order before the inspector. The inspector does not create a nested scrolling trap; a reader can scroll the whole example naturally.

Event metadata is a second line with a readable secondary color. The filter stays outside the repeated rows and does not move when records change. A status paragraph reports the selected record’s local review result without altering the filter or replacing the title.

[Supporting specification](https://ix.siemens.io/docs/components/event-list/code)

## Siemens iX Design System Make state perceivable without color or pointer precision

### Text, keyboard controls and focus

The offline preview uses native buttons for records, a labeled select for severity and an aria-live status region for review feedback. Enter and Space can select a record. The native library composition uses its Event List wrappers; it should be tested with the installed version’s keyboard and assistive-technology behavior before adopting custom focus overrides.

The labels describe the business distinction: Mark reviewed locally, not Resolve alarm. A disabled review action is accompanied by a visible reviewed state. Color does not carry the entire meaning, and the filter does not leave an inaccessible stale selection hidden in another category.

[Supporting specification](https://ix.siemens.io/docs/guidelines/accessibility/code)

## Siemens iX Design System Connect the package, theme and local application state

### A deliberate integration sequence

The setup block contains the package imports, document theme attributes, actual component properties, complete React state and application CSS. The theme selector is data-ix-color-schema, not a similarly named custom attribute. Lock the installed core, wrappers and icons to compatible versions in the application.

The visual specimen is offline HTML/CSS that interprets these interaction rules. Its dark navy palette, 24-pixel gutters and schematic equipment drawing are original application choices. For native visual parity, run the separate React example with the official stylesheet and inspect the computed theme values.

1. Install core, React wrappers and icons in a Vite React scaffold; retain the generated root element.
2. Replace main.jsx and style.css with the supplied files, then select classic plus dark, light or system on the document.
3. Select a record, mark it reviewed, filter the list and confirm that severity persists while hidden selection clears.

[Supporting specification](https://ix.siemens.io/docs/home/installation/react)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent offline HTML/CSS interpretation. Original palette, system font and application dimensions; not the native iX runtime.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Equipment event notebook — iX interpretation</title><style>
*{box-sizing:border-box}body{margin:0;background:#000028;color:#f3f3fa;font:15px/1.5 Arial,sans-serif}button,select{font:inherit;color:inherit}button{cursor:pointer}button:focus-visible,select:focus-visible{outline:3px solid #00cccc;outline-offset:3px}.app{max-width:1200px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #55556b;padding-bottom:18px}.brand{letter-spacing:.12em;color:#00cccc}.dim{color:#b6b6c8}h1{font-size:30px;font-weight:500;line-height:1.2;margin:20px 0 8px}h2{font-size:21px;font-weight:500;margin:0 0 12px}.banner{display:grid;grid-template-columns:1.2fr 1fr;gap:24px;align-items:center;padding-bottom:24px}.schematic{height:140px;position:relative;display:flex;align-items:center;justify-content:space-evenly;border-bottom:2px solid #77788e;background:linear-gradient(transparent 23px,#23233c 24px);background-size:24px 24px}.schematic:before{content:'';position:absolute;left:10%;right:10%;top:68px;height:5px;background:#666780}.unit{position:relative;width:76px;height:76px;border:2px solid #b6b6c8;background:#141432;display:grid;place-content:center;text-align:center}.unit:first-child{border-color:#ff8da5}.unit span{color:#b6b6c8;font:12px monospace}.toolbar{display:flex;align-items:center;gap:16px;margin:10px 0 18px}select{background:#23233c;border:1px solid #8b8b9e;padding:8px 28px 8px 10px}.layout{display:grid;grid-template-columns:1.6fr 1fr;gap:24px}.event{width:100%;display:grid;grid-template-columns:70px 1fr 20px;gap:14px;text-align:left;align-items:center;padding:18px 14px;border:1px solid #55556b;border-left:4px solid var(--severity);background:#141432;margin-bottom:10px}.event:hover{background:#292944}.event[aria-pressed=true]{outline:2px solid #00cccc;outline-offset:1px}.event strong{font-size:15px;font-weight:600;display:block}.event small{display:block;color:#c0c0cf;margin-top:4px}.severity{font-size:11px;letter-spacing:.06em}.inspector{padding:20px;background:#23233c;border-top:3px solid #00cccc;min-height:290px}.meta{font:12px monospace;color:#b6b6c8}.tag{font-size:12px;border:1px solid #6c6c80;padding:3px 8px;display:inline-block;margin:10px 0}.action{background:#00cccc;border:0;color:#000028;padding:11px 16px;margin-top:10px}.action:disabled{background:#515168;color:#e0e0e8;cursor:default}.status{min-height:48px;color:#b7eeee;font-size:13px}.note{border-top:1px solid #55556b;margin-top:24px;padding-top:16px;color:#b6b6c8;font-size:12px}@media(max-width:650px){.app{padding:18px}.top{font-size:12px}.banner,.layout{grid-template-columns:1fr}.banner{gap:8px}.schematic{height:115px}.schematic:before{top:56px}.unit{height:60px;width:65px}h1{font-size:26px}.event{grid-template-columns:60px 1fr 10px;gap:8px}.toolbar{flex-wrap:wrap}}
</style><main class="app"><header class="top"><b class="brand">EVENT NOTEBOOK</b><span class="dim">Sample plant / offline</span></header><div class="banner"><div><h1>Inspect the event.<br>Keep its meaning.</h1><p class="dim">Review equipment notes without changing their original severity.</p></div><div class="schematic" aria-label="Original schematic of three fictional equipment units" role="img"><div class="unit">A<span>PUMP</span></div><div class="unit">B<span>PUMP</span></div><div class="unit">C<span>LINE</span></div></div></div><div class="toolbar"><label for="severity">Severity</label><select id="severity"><option value="all">All events</option><option value="alarm">Alarm</option><option value="warning">Warning</option><option value="info">Info</option></select><span class="dim" id="count"></span></div><div class="layout"><section aria-label="Event records" id="events"></section><aside class="inspector" aria-label="Selected event" id="detail"></aside></div><p class="note">Independent HTML interpretation of Siemens iX interaction rules. Original colors, dimensions and fictional equipment records. Local review does not acknowledge or resolve a live alarm.</p></main><script>
const data=[{id:'E-014',severity:'alarm',color:'#ff8da5',title:'Cooling flow below sample threshold',asset:'Pump A',time:'09:42',note:'Inspect the cooling circuit before considering a reset. This fictional record remains an alarm after you mark the note reviewed.'},{id:'E-015',severity:'warning',color:'#ffce6b',title:'Filter service approaching',asset:'Pump B',time:'09:38',note:'Schedule a filter inspection. Reviewing this notebook entry does not schedule maintenance or alter equipment.'},{id:'E-016',severity:'info',color:'#65cfff',title:'Inspection checklist attached',asset:'Line C',time:'09:30',note:'A fictional checklist is available for review. This sample displays the record; it does not connect to a document service.'}];let selected='E-014';const reviewed=new Set();function render(){let visible=data.filter(r=>severity.value==='all'||r.severity===severity.value);document.querySelector('#count').textContent=visible.length+' event'+(visible.length===1?'':'s');events.innerHTML=visible.map(r=>`<button class="event" id="row-${r.id}" style="--severity:${r.color}" aria-pressed="${selected===r.id}" data-id="${r.id}"><span class="severity">${r.severity.toUpperCase()}</span><span><strong>${r.title}</strong><small>${r.asset} · ${r.time}${reviewed.has(r.id)?' · Reviewed locally':''}</small></span><span aria-hidden="true">›</span></button>`).join('');const r=visible.find(r=>r.id===selected);detail.innerHTML=r?`<div class="meta">${r.id} / ${r.asset}</div><h2>${r.title}</h2><span class="tag">${r.severity.toUpperCase()} · source condition unchanged</span><p>${r.note}</p><button class="action" id="review" ${reviewed.has(r.id)?'disabled':''}>Mark reviewed locally</button><p class="status" role="status">${reviewed.has(r.id)?'Reviewed in this browser session. Source severity is unchanged.':''}</p>`:'<h2>Select an event</h2><p class="dim">Choose a record to inspect its note.</p>';events.querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.id;render();document.getElementById('row-'+selected).focus()});if(r&&!reviewed.has(r.id))document.querySelector('#review').onclick=()=>{reviewed.add(r.id);render()}}const severity=document.querySelector('#severity'),events=document.querySelector('#events'),detail=document.querySelector('#detail');severity.onchange=()=>{selected='';render()};render();
</script></html>

```

[Code reference](https://ix.siemens.io/docs/components/event-list/code)

- Marking an event reviewed does not change its severity or resolve an equipment alarm. The native iX entry separately demonstrates Event List selection and theme attributes.

### Event List with a separately controlled inspection panel

A selected ID drives the item highlight and details. Reviewing only records a local notebook state; the original severity stays visible.

```jsx
// In a Vite React project: npm install @siemens/ix @siemens/ix-react @siemens/ix-icons
// src/main.jsx
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {IxEventList, IxEventListItem, IxTypography} from '@siemens/ix-react';
import '@siemens/ix/dist/siemens-ix/siemens-ix.css';
import './style.css';
document.documentElement.dataset.ixTheme='classic';
document.documentElement.dataset.ixColorSchema='dark';
const records=[
 {id:'E-014',severity:'alarm',title:'Cooling flow below sample threshold',asset:'Pump A',time:'09:42',note:'Original demonstration record: inspect the cooling circuit before considering a reset.'},
 {id:'E-015',severity:'warning',title:'Filter service approaching',asset:'Pump B',time:'09:38',note:'Original demonstration record: schedule a filter inspection.'},
 {id:'E-016',severity:'info',title:'Inspection checklist attached',asset:'Line C',time:'09:30',note:'Original demonstration record: a checklist is available for review.'}
];
function App(){
 const [filter,setFilter]=useState('all'),[selected,setSelected]=useState('E-014'),[reviewed,setReviewed]=useState([]);
 const visible=records.filter(r=>filter==='all'||r.severity===filter);
 const record=visible.find(r=>r.id===selected);
 return <main><h1>Equipment event notebook</h1><p>Fictional records. Reviewing an entry does not control equipment or acknowledge a live alarm.</p>
 <label htmlFor="severity">Severity</label><select id="severity" value={filter} onChange={e=>{setFilter(e.target.value);setSelected('')}}>
 <option value="all">All events</option><option value="alarm">Alarm</option><option value="warning">Warning</option><option value="info">Info</option></select>
 <div className="workspace"><section aria-label="Event records"><IxEventList itemHeight="L" chevron>
 {visible.map(r=><IxEventListItem key={r.id} selected={selected===r.id} itemColor={`var(--theme-color-${r.severity})`} onItemClick={()=>setSelected(r.id)}>
 <div className="record"><strong>{r.title}</strong><span>{r.severity.toUpperCase()} · {r.asset} · {r.time}{reviewed.includes(r.id)?' · Reviewed locally':''}</span></div>
 </IxEventListItem>)}
 </IxEventList></section><aside aria-label="Selected event">
 {record?<><IxTypography format="h3">{record.id} / {record.asset}</IxTypography><p>{record.note}</p>
 <button type="button" onClick={()=>setReviewed(a=>a.includes(record.id)?a:[...a,record.id])} disabled={reviewed.includes(record.id)}>Mark reviewed locally</button>
 <p role="status">{reviewed.includes(record.id)?'Reviewed in this browser session. Source severity is unchanged.':''}</p></>:<p>Select an event to inspect its record.</p>}
 </aside></div></main>
}
createRoot(document.getElementById('root')).render(<App/>);

/* src/style.css — custom dimensions are application choices */
main{max-width:72rem;margin:auto;padding:24px;color:var(--theme-color-std-text)}
.workspace{display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-top:24px}
.workspace>*{min-width:0}aside{padding:20px;border:1px solid var(--theme-color-soft-bdr)}
.record{display:grid;gap:4px;padding:8px;white-space:normal;overflow-wrap:anywhere}
.record span{color:var(--theme-color-soft-text)}
button,select{font:inherit;padding:10px;background:var(--theme-color-component-1);color:var(--theme-color-std-text);border:1px solid var(--theme-color-std-bdr)}
button:focus-visible,select:focus-visible{outline:2px solid var(--theme-color-primary);outline-offset:3px}
@media(max-width:700px){.workspace{grid-template-columns:1fr}}

```

[Code reference](https://raw.githubusercontent.com/siemens/ix/main/packages/core/component-api.json)

- Use itemColor for the severity marker and a readable textual severity label.
- Changing the severity filter clears selection, preventing an inspector from describing a hidden event.
- The local review button is application logic, not an invented iX alarm-acknowledgement API.

### Theme-aware typography without copied font sizes

Use the documented format prop or Sass mixin rather than freezing a type size across themes.

```html / scss
<ix-typography format="h3">Inspection record</ix-typography>

@import "@siemens/ix/scss/mixins/font";
.inspection-title { @include typography-h3; }
```

[Code reference](https://ix.siemens.io/docs/styles/typography/code)

- The preview uses a system font fallback; it does not distribute Siemens brand fonts.

## Implementation Starting Point

Complete main.jsx and style.css for a Vite React scaffold with its existing root element. The official wrappers, CSS import and Event List properties are documented; native package compilation was not executed here. Embedded preview is an independent offline interpretation.

```jsx
// In a Vite React project: npm install @siemens/ix @siemens/ix-react @siemens/ix-icons
// src/main.jsx
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {IxEventList, IxEventListItem, IxTypography} from '@siemens/ix-react';
import '@siemens/ix/dist/siemens-ix/siemens-ix.css';
import './style.css';
document.documentElement.dataset.ixTheme='classic';
document.documentElement.dataset.ixColorSchema='dark';
const records=[
 {id:'E-014',severity:'alarm',title:'Cooling flow below sample threshold',asset:'Pump A',time:'09:42',note:'Original demonstration record: inspect the cooling circuit before considering a reset.'},
 {id:'E-015',severity:'warning',title:'Filter service approaching',asset:'Pump B',time:'09:38',note:'Original demonstration record: schedule a filter inspection.'},
 {id:'E-016',severity:'info',title:'Inspection checklist attached',asset:'Line C',time:'09:30',note:'Original demonstration record: a checklist is available for review.'}
];
function App(){
 const [filter,setFilter]=useState('all'),[selected,setSelected]=useState('E-014'),[reviewed,setReviewed]=useState([]);
 const visible=records.filter(r=>filter==='all'||r.severity===filter);
 const record=visible.find(r=>r.id===selected);
 return <main><h1>Equipment event notebook</h1><p>Fictional records. Reviewing an entry does not control equipment or acknowledge a live alarm.</p>
 <label htmlFor="severity">Severity</label><select id="severity" value={filter} onChange={e=>{setFilter(e.target.value);setSelected('')}}>
 <option value="all">All events</option><option value="alarm">Alarm</option><option value="warning">Warning</option><option value="info">Info</option></select>
 <div className="workspace"><section aria-label="Event records"><IxEventList itemHeight="L" chevron>
 {visible.map(r=><IxEventListItem key={r.id} selected={selected===r.id} itemColor={`var(--theme-color-${r.severity})`} onItemClick={()=>setSelected(r.id)}>
 <div className="record"><strong>{r.title}</strong><span>{r.severity.toUpperCase()} · {r.asset} · {r.time}{reviewed.includes(r.id)?' · Reviewed locally':''}</span></div>
 </IxEventListItem>)}
 </IxEventList></section><aside aria-label="Selected event">
 {record?<><IxTypography format="h3">{record.id} / {record.asset}</IxTypography><p>{record.note}</p>
 <button type="button" onClick={()=>setReviewed(a=>a.includes(record.id)?a:[...a,record.id])} disabled={reviewed.includes(record.id)}>Mark reviewed locally</button>
 <p role="status">{reviewed.includes(record.id)?'Reviewed in this browser session. Source severity is unchanged.':''}</p></>:<p>Select an event to inspect its record.</p>}
 </aside></div></main>
}
createRoot(document.getElementById('root')).render(<App/>);

/* src/style.css — custom dimensions are application choices */
main{max-width:72rem;margin:auto;padding:24px;color:var(--theme-color-std-text)}
.workspace{display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-top:24px}
.workspace>*{min-width:0}aside{padding:20px;border:1px solid var(--theme-color-soft-bdr)}
.record{display:grid;gap:4px;padding:8px;white-space:normal;overflow-wrap:anywhere}
.record span{color:var(--theme-color-soft-text)}
button,select{font:inherit;padding:10px;background:var(--theme-color-component-1);color:var(--theme-color-std-text);border:1px solid var(--theme-color-std-bdr)}
button:focus-visible,select:focus-visible{outline:2px solid var(--theme-color-primary);outline-offset:3px}
@media(max-width:700px){.workspace{grid-template-columns:1fr}}

```

## Agent Prompt

Build a Siemens iX event notebook using the verified Event List properties and document theme attributes in this guide. Preserve severity independently of selection and local review. Use semantic theme colors in the native version. Never imply that a notebook action resolves a physical alarm. Keep filters labeled, rows keyboard accessible and the inspector stacked on narrow screens.

## Sources

- [React installation](https://ix.siemens.io/docs/home/installation/react) — Packages, CSS and theme attributes.
- [Component API snapshot](https://raw.githubusercontent.com/siemens/ix/main/packages/core/component-api.json) — Actual event properties and events.
- [Color foundations](https://ix.siemens.io/docs/styles/colors) — Surface, reading and status roles.
- [Typography](https://ix.siemens.io/docs/styles/typography/guide) — Text categories and their purposes.
- [Typography implementation](https://ix.siemens.io/docs/styles/typography/code) — Format and Sass entry.
- [Borders](https://ix.siemens.io/docs/styles/borders) — Boundary hierarchy.
- [Event List](https://ix.siemens.io/docs/components/event-list/code) — Component examples and density variations.
