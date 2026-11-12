# Arco Design Design System — OpenDesign Application Guide

Build a report-section selector with Arco’s controlled Transfer component. Explore its actual spacing and size scales, CSS variable conventions, semantic surfaces, and the distinction between selecting rows and moving them.

Independent OpenDesign reference. Original report data and local-only preview; disabled rows are not an authorization boundary.

## Source Reference

- **Package:** @arco-design/web-react ([source](https://raw.githubusercontent.com/arco-design/arco-design/main/README.md))
- **CSS entry:** dist/css/arco.css ([source](https://raw.githubusercontent.com/arco-design/arco-design/main/README.md))
- **Body size:** 14px ([source](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/default.less))
- **Default control size:** 32px ([source](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/global.less))
- **Arco blue anchor:** #165dff ([source](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/color/colors.less))
- **Transfer identity:** String key ([source](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx))


## Design Reference

Arco React upstream source. Less constants are shown with @; runtime CSS variables use --. Preview spacing and panel layout are original application choices based on those scales.

### Sizing and spacing

[Official reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/global.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @size-mini | 24px | Compact component height alias. |
| @size-small | 28px | Small component height. |
| @size-default | 32px | Default component height. |
| @size-large | 36px | Large component height. |
| @spacing-1 … @spacing-6 | 2, 4, 6, 8, 10, 12px | Small spacing steps. |
| @spacing-7 … @spacing-10 | 16, 20, 24, 32px | Grouping steps. |
| @border-radius-small | 2px | Small corners. |
| @border-radius-medium | 4px | Medium corners. |
| @border-radius-large | 8px | Large corners. |

### Type and motion

[Official reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/default.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @font-size-body | 14px | Global body size. |
| @line-height-base | 1.5715 | Approximate 22px line box at 14px. |
| @font-family | Inter, system and CJK fallbacks | Naming Inter does not download it. |
| @code-family | Consolas, Menlo | Code-oriented stack. |
| @transition-duration-1 / 2 / 3 | 0.1s / 0.2s / 0.3s | First three duration constants. |
| @transition-timing-function-standard | cubic-bezier(.34,.69,.1,1) | Published standard curve. |

### Palette anchors

[Official reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/color/colors.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @arcoblue-6 | #165dff | Arco blue anchor. |
| @gray-1 | #f7f8fa | Light neutral. |
| @gray-2 | #f2f3f5 | Secondary fill neutral. |
| @gray-3 | #e5e6eb | Border neutral. |
| @gray-8 | #4e5969 | Secondary text neutral. |
| @gray-10 | #1d2129 | Main text neutral. |
| @red-6 | #f53f3f | Red anchor; do not assume small-text contrast. |
| @green-6 | #00b42a | Green anchor. |

### Runtime variable conventions

[Official reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/css-variables.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-text-1 | Primary text role | Default variable prefix is not arco. |
| --color-fill-2 | Secondary fill role | Use instead of a hardcoded gray in theme-aware areas. |
| --border-radius-medium | Medium corner role | Exported at runtime. |
| body[arco-theme="dark"] | Dark theme selector | Set or remove the body attribute. |
| --color-bg-2 | Container surface | Resolves differently in dark mode. |

### Transfer state and events

[Official reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| dataSource | {key:string,value:string,disabled?:boolean}[] | Stable keys identify sections. |
| targetKeys | string[] | Membership in the target column. |
| selectedKeys | string[] | Checkbox selection, not target membership. |
| onChange | (newTargetKeys,direction,moveKeys) | Commit the new membership array. |
| onSelectChange | (leftSelectedKeys,rightSelectedKeys) | Combine both for controlled selectedKeys. |
| filterOption | (inputValue,item) => boolean | Original default is case-sensitive substring matching. |
| showSearch | Boolean or per-list configuration | The example enables search in both columns. |
| oneWay | Boolean | Use only when removing from target is not desired. |
| simple | Boolean or retainSelectedItems options | Can move on selection; not equivalent to explicit transfer actions. |

## Arco Design Design System Transfer represents membership, not merely a checkbox list

### Choose report sections deliberately

Arco Transfer is useful when an operator must compare two sets: available sections and sections included in a report. Checking a row marks it for a later operation; it does not immediately move the section unless simple mode is enabled.

The specimen retains the explicit two-step action. A user selects Acquisition channels, activates Include, then prepares an outline. That outline is a separate snapshot, so later changes in the editor do not silently rewrite the prepared version.

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx)

## Arco Design Design System Use the size scale and spacing scale separately

### The same number can mean different dimensions

Arco size constants rise in four-pixel steps, while the spacing scale begins 2, 4, 6, 8, 10 and 12 before larger jumps. The default component size aliases 32px. Assuming every size or spacing suffix means the same amount would produce inconsistent controls.

The two transfer panels use medium-radius corners and a 24px page margin in this original composition. Small checkboxes and row dividers carry the dense selection task; larger page regions provide separation without replacing useful content with oversized cards.

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/global.less)

## Arco Design Design System Keep semantic roles in application styling

### CSS variables have their own naming contract

The default theme exports variables such as --color-text-1 and --color-fill-2 without an arco prefix. Custom builds can change that prefix, so inspect the compiled theme when integrating into a namespaced application. The primary palette variables are RGB channels; consumers need rgb(var(--primary-6)) rather than treating the variable as a complete hex color.

The preview uses the verified Arco blue anchor for the principal action and selected rows. A restricted section uses a disabled checkbox and explanatory text instead of a red color that could imply an error the operator can repair.

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/css-variables.less)

## Arco Design Design System Support dense labels and long section names

### A practical body scale

The default body size is 14px with a 1.5715 line-height multiplier. The published family starts with Inter and includes system and CJK fallbacks. This is a CSS stack, not proof that an Inter font file loaded.

A report section label may be longer than the sample. The offline version wraps row text and stacks its panels on a small viewport, keeping Include and Remove labels readable. It does not shrink the entire transfer widget until text becomes illegible.

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/default.less)

## Arco Design Design System Two controlled arrays prevent ambiguous behavior

### Membership and selection have different meanings

targetKeys says which items are in the report. selectedKeys says which checkboxes are currently active across both lists. onSelectChange supplies left and right arrays; concatenate them when controlling selectedKeys. onChange supplies the new membership, direction and moved keys.

1. Keep every source item key stable even when its display label changes.
2. Combine left and right selection arrays in onSelectChange.
3. Replace targetKeys with the new array from onChange.
4. Clear temporary selection after a move and announce its local effect.

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx)

## Arco Design Design System Search should narrow the view without deleting membership

### Make the matching rule explicit

The source default filter compares the query against the item value with a case-sensitive substring test. The provided example replaces that with lowercase matching. Searching for a hidden selected row should not imply that the row has disappeared from the report membership.

For this small list, pagination and virtualization add little value. Arco exposes those options for larger data, but the application still owns stable keys, the complete target set and the rules for selecting items across filtered views.

- Available and included lists have separately named search fields.
- A no-match message describes the filtered view, not an empty dataset.
- Preparing an outline uses targetKeys, not only the currently visible rows.

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx)

## Arco Design Design System Dark mode changes surfaces as well as text

### Set the published selector

Arco publishes its dark overrides under the theme tag with arco-theme="dark". In the default build the tag is body. Removing that attribute restores the normal rules; adding an unrelated class called dark is not the same API.

If adding a dark preview, resolve the container and text roles together. The offline specimen remains light intentionally, while the native example can use the theme CSS already imported. Do not invert report thumbnails or illustrations with a blanket filter.

```js
document.body.setAttribute('arco-theme', 'dark');
// Restore default:
document.body.removeAttribute('arco-theme');
```

[Code reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/css-variables.less)

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/css-variables.less)

## Arco Design Design System Package, stylesheet, and actual boundary

### A report outline does not export report data

The React package is @arco-design/web-react and its complete CSS entry is dist/css/arco.css. The sample imports Transfer and Button from the package root and uses controlled state, rather than inventing a report-builder API.

The standalone preview interprets the selection behavior using native checkboxes and buttons so it works offline. It validates interaction logic and responsive composition; it does not prove that the native package compiled in a consumer project. A production exporter would need a backend and permission checks beyond a disabled example row.

[Supporting specification](https://raw.githubusercontent.com/arco-design/arco-design/main/README.md)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Standalone HTML interpretation of Arco Transfer behavior and verified theme anchors; native React example supplied separately.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Arco report section transfer</title><style>
*{box-sizing:border-box}body{margin:0;color:#1d2129;background:#f7f8fa;font:14px/22px Arial,sans-serif}header{padding:20px 28px;background:white;border-bottom:1px solid #e5e6eb;display:flex;justify-content:space-between}.logo{font-size:18px;font-weight:bold;letter-spacing:-.02em}.logo i{font-style:normal;color:#165dff;margin-right:8px}header small{color:#4e5969}main{max-width:1050px;padding:28px;margin:auto}h1{font-size:24px;line-height:32px;margin:0 0 8px}.lead{color:#4e5969;margin:0 0 24px}.transfer{display:grid;grid-template-columns:minmax(0,1fr) 106px minmax(0,1fr);align-items:stretch}.list{border:1px solid #e5e6eb;background:white;border-radius:4px;min-width:0}.head{padding:16px;background:#f2f3f5;display:flex;gap:8px;justify-content:space-between}.head h2{font-size:14px;margin:0}.count{font-size:12px;color:#4e5969}.search{padding:12px;border-bottom:1px solid #e5e6eb}.search label{font-size:12px;display:block;margin-bottom:4px;color:#4e5969}.search input{height:32px;width:100%;border:1px solid transparent;background:#f2f3f5;padding:4px 12px;font:inherit;border-radius:2px}input:focus,button:focus-visible{outline:2px solid #165dff;outline-offset:2px}.items{min-height:290px;padding:8px}.item{display:flex;gap:10px;padding:12px 8px;border-radius:2px;align-items:start;cursor:pointer}.item:has(input:checked){background:#e8f3ff}.item input{width:16px;height:16px;accent-color:#165dff;margin-top:3px;flex-shrink:0}.item small{display:block;color:#4e5969;font-size:12px}.item:has(input:disabled){color:#86909c;cursor:not-allowed}.ops{padding:16px 12px;display:flex;flex-direction:column;gap:12px;justify-content:center}button{font:14px/22px Arial;border:1px solid #e5e6eb;background:white;color:#1d2129;border-radius:2px;padding:5px 12px;cursor:pointer}.ops button{padding:5px 4px}.primary{background:#165dff;border-color:#165dff;color:#fff}button:disabled{background:#f2f3f5;color:#86909c;border-color:#e5e6eb;cursor:not-allowed}.footer{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0}.footer p{font-size:12px;color:#4e5969;margin:0}.outline{background:white;border:1px solid #e5e6eb;border-radius:4px;padding:24px}.outline h2{font-size:16px;margin:0 0 12px}.outline ol{margin:0;padding-left:20px}.note{color:#4e5969;font-size:12px;margin-top:20px}.empty{padding:20px 8px;color:#4e5969}.selection{font-size:12px;color:#4e5969;padding:10px 16px;border-top:1px solid #e5e6eb}@media(max-width:650px){main{padding:24px 16px}.transfer{grid-template-columns:1fr}.ops{flex-direction:row;padding:12px}.ops button{padding:6px 16px}.items{min-height:160px}.footer{align-items:start;flex-direction:column}header{padding:16px}}
</style><header><span class="logo"><i>A /</i> Analytics workspace</span><small>Report studio</small></header><main><h1>Choose report sections</h1><p class="lead">Build an outline from the sections available to this workspace.</p><div class="transfer"><section class="list"><div class="head"><h2>Available sections</h2><span id="left-count" class="count"></span></div><div class="search"><label for="left-search">Find available section</label><input id="left-search" type="search" placeholder="Search by section name"></div><div class="items" id="left"></div><div class="selection" id="left-selected"></div></section><div class="ops"><button class="primary" id="include" disabled>Include →</button><button id="remove" disabled>← Remove</button></div><section class="list"><div class="head"><h2>Included in report</h2><span id="right-count" class="count"></span></div><div class="search"><label for="right-search">Find included section</label><input id="right-search" type="search" placeholder="Search included sections"></div><div class="items" id="right"></div><div class="selection" id="right-selected"></div></section></div><div class="footer"><p id="status" role="status">Select a section, then choose Include or Remove.</p><button id="prepare" class="primary">Prepare outline</button></div><section class="outline"><h2>Prepared outline</h2><div id="snapshot">No outline prepared yet.</div></section><p class="note">HTML interpretation of Arco Transfer · Original sample sections · Local outline only, no analytics data exported</p></main><script>
const data=[{key:'overview',value:'Executive overview',detail:'A concise summary of the reporting period'},{key:'traffic',value:'Acquisition channels',detail:'How people arrive at your product'},{key:'retention',value:'Retention cohorts',detail:'Returning usage by cohort'},{key:'revenue',value:'Revenue breakdown',detail:'Revenue categories and trends'},{key:'raw',value:'Raw event export',detail:'Restricted · unavailable in this specimen',disabled:true}];const $=id=>document.getElementById(id);let target=new Set(['overview']),selected=new Set();
function render(){for(const side of ['left','right']){const items=data.filter(x=>target.has(x.key)===(side==='right')),query=$(side+'-search').value.toLowerCase(),host=$(side);host.replaceChildren();$(side+'-count').textContent=items.length+' sections';const visible=items.filter(x=>x.value.toLowerCase().includes(query));if(!visible.length){const p=document.createElement('p');p.className='empty';p.textContent=query?'No matching sections.':'No sections in this column.';host.append(p)}for(const item of visible){const label=document.createElement('label');label.className='item';const input=document.createElement('input');input.type='checkbox';input.id='check-'+item.key;input.checked=selected.has(item.key);input.disabled=!!item.disabled;input.setAttribute('aria-label',item.value);input.onchange=()=>{input.checked?selected.add(item.key):selected.delete(item.key);render();$('check-'+item.key)?.focus()};const text=document.createElement('span'),small=document.createElement('small');text.textContent=item.value;small.textContent=item.detail;text.append(small);label.append(input,text);host.append(label)}$(side+'-selected').textContent=items.filter(x=>selected.has(x.key)).length+' selected'}$('include').disabled=!data.some(x=>selected.has(x.key)&&!target.has(x.key)&&!x.disabled);$('remove').disabled=!data.some(x=>selected.has(x.key)&&target.has(x.key)&&!x.disabled);$('prepare').disabled=!target.size}
function move(toTarget){const moved=data.filter(x=>selected.has(x.key)&&target.has(x.key)!==toTarget&&!x.disabled);for(const item of moved)toTarget?target.add(item.key):target.delete(item.key);selected.clear();render();$('status').textContent=moved.length+' section(s) '+(toTarget?'included in':'removed from')+' the local draft.';$(toTarget?'right-search':'left-search').focus()}
$('include').onclick=()=>move(true);$('remove').onclick=()=>move(false);for(const side of ['left','right'])$(side+'-search').oninput=render;$('prepare').onclick=()=>{const ol=document.createElement('ol');for(const item of data.filter(x=>target.has(x.key))){const li=document.createElement('li');li.textContent=item.value;ol.append(li)}$('snapshot').replaceChildren(ol);$('status').textContent='Local report outline prepared. No data exported.'};render();
</script></html>

```

[Code reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx)

- The restricted report section cannot be moved. Selected rows and included sections are separate states, matching the distinction explained for native Transfer.

### Controlled report section transfer

Transfer manages source and target membership while application state stores a separately prepared outline. A restricted row demonstrates a disabled option without pretending to enforce server authorization.

```jsx
// npm install @arco-design/web-react react react-dom
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Transfer,Button} from '@arco-design/web-react';
import '@arco-design/web-react/dist/css/arco.css';
const data = [
 {key:'overview',value:'Executive overview'},
 {key:'traffic',value:'Acquisition channels'},
 {key:'retention',value:'Retention cohorts'},
 {key:'revenue',value:'Revenue breakdown'},
 {key:'raw',value:'Raw event export (restricted)',disabled:true}
];
function ReportBuilder(){
 const [target,setTarget]=useState(['overview']);
 const [selected,setSelected]=useState([]);
 const [snapshot,setSnapshot]=useState([]);
 const [status,setStatus]=useState('Choose sections for a local report.');
 return <main style={{padding:24,maxWidth:960,margin:'auto'}}>
  <h1>Report sections</h1>
  <Transfer dataSource={data} targetKeys={target} selectedKeys={selected}
   titleTexts={['Available sections','Included in report']}
   operationTexts={['Include','Remove']}
   showSearch searchPlaceholder={['Find available section','Find included section']}
   filterOption={(query,item)=>item.value.toLowerCase().includes(query.toLowerCase())}
   onSelectChange={(left,right)=>setSelected([...left,...right])}
   onChange={(keys,direction,moved)=>{
    setTarget(keys);setSelected([]);
    setStatus(`${moved.length} section(s) moved to ${direction}. Draft only.`);
   }} />
  <p role="status">{status}</p>
  <Button type="primary" disabled={!target.length} onClick={()=>{
   setSnapshot([...target]);setStatus('Local report outline prepared. No data exported.');
  }}>Prepare outline</Button>
  <h2>Prepared outline</h2>
  {snapshot.length ? <ol>{snapshot.map(key=><li key={key}>{data.find(item=>item.key===key).value}</li>)}</ol> : <p>No outline prepared yet.</p>}
 </main>;
}
createRoot(document.getElementById('root')).render(<ReportBuilder />);
```

[Code reference](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx)

- Checkbox selection and included-report membership are different arrays.
- The custom filter makes matching case-insensitive.
- The example data is original; no analytics data is loaded or exported. Native compilation remains a separate integration check.

## Implementation Starting Point

Import the complete arco.css stylesheet once and mount the React example into a root element. Do not mix this React package with Arco Vue imports.

```bash
npm install @arco-design/web-react react react-dom
```

## Agent Prompt

Use Arco React Transfer with stable dataSource keys and separate controlled targetKeys and selectedKeys. Supply a case-insensitive filter, explicit Include/Remove actions, and a prepared outline snapshot. Preserve Arco CSS variable syntax and label offline interpretation honestly.

## Sources

- [React package](https://raw.githubusercontent.com/arco-design/arco-design/main/README.md) — Install and stylesheet entry.
- [Global tokens](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/global.less) — Dimensions, spacing, and semantic mappings.
- [Default theme](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/default.less) — Typography and motion.
- [Palette](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/color/colors.less) — Verified color anchors.
- [CSS variables](https://raw.githubusercontent.com/arco-design/arco-design/main/components/style/theme/css-variables.less) — Runtime names and dark selector.
- [Transfer API](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Transfer/interface.tsx) — Controlled state and callback signatures.
