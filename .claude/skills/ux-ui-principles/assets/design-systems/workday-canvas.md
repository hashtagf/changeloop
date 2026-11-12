# Workday Canvas Design System — OpenDesign Application Guide

Build a local learning plan with Canvas Kit’s compound FormField, controlled TextInput and PrimaryButton, while distinguishing current semantic token sources from older space.x4 migration examples.

Independent OpenDesign reference. No employee enrollment or Workday API is involved. Current source names and older migration names are explicitly distinguished.

## Source Reference

- **Main package:** @workday/canvas-kit-react ([source](https://github.com/Workday/canvas-kit))
- **Token package:** @workday/canvas-tokens-web ([source](https://github.com/Workday/canvas-kit))
- **Field API:** Label / Input / Hint composition ([source](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/form-field/lib/FormField.tsx))
- **Input minimum fallback:** px2rem(280) ([source](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/text-input/lib/TextInput.tsx))
- **Current weight name:** normal ([source](https://raw.githubusercontent.com/Workday/canvas-tokens/main/packages/canvas-tokens/tokens/web/sys.json))
- **Fonts:** Not bundled by default ([source](https://github.com/Workday/canvas-kit))


## Design Reference

Current Canvas Kit source and Canvas token sys.json. Raw JSON names below are source paths, not invented generated CSS variable names. Values that alias base tokens are shown as aliases; the dated migration reference is explicitly historical.

### Current spacing semantics

[Official reference](https://raw.githubusercontent.com/Workday/canvas-tokens/main/packages/canvas-tokens/tokens/web/sys.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sys.padding.xs | {base.size.100} | Input horizontal padding role. |
| sys.padding.md | {base.size.200} | Default component padding. |
| sys.padding.xl | {base.size.300} | Card padding. |
| sys.gap.sm | {base.size.100} | Compact sibling gap. |
| sys.gap.md | {base.size.200} | Default inline gap. |
| sys.gap.xl | {base.size.400} | Card gutter. |
| sys.gap.xxl | {base.size.800} | Section gap. |

### Current type and shape

[Official reference](https://raw.githubusercontent.com/Workday/canvas-tokens/main/packages/canvas-tokens/tokens/web/sys.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sys.type.body.sm | font-size body.sm + line-height body.sm + normal weight | Composite body role. |
| sys.font-size.body.sm | {base.size.200} | Base body size alias. |
| sys.line-height.body.sm | {base.size.300} | Body leading alias. |
| sys.font-weight.normal | {base.font-weight.400} | Current normal name, not regular. |
| sys.shape.sm | {base.size.50} | Small rounding. |
| sys.shape.md | {base.size.100} | Input rounding. |
| sys.shape.full | {base.size.75} × 100 | Full rounding. |

### FormField composition

[Official reference](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/form-field/lib/FormField.tsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| FormField.Label | Connected label element | Generated relationship to input. |
| FormField.Input as={TextInput} | Polymorphic input slot | Not the old label prop API. |
| FormField.Hint | Linked helper content | Describe expected input. |
| orientation | vertical / horizontalStart / horizontalEnd | Use current alignment values. |
| FormField.Field | Input and hint alignment wrapper | Useful in horizontal layout. |

### TextInput implementation

[Official reference](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/text-input/lib/TextInput.tsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| grow | 100% width when true | Responsive input expansion. |
| width | number or string | Optional override. |
| minimum width fallback | px2rem(280) | Check narrow parent layouts. |
| error | error / caution styling | Application supplies validation. |
| transition | 0.2s box-shadow, 0.2s border-color | Actual source transition. |
| font size role | system.legacy.fontSize.subtext.lg | Do not replace component internals with unrelated title type. |

### PrimaryButton implementation

[Official reference](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/button/lib/PrimaryButton.tsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Background | brand.action.base, with legacy accent fallback | Tenant branding. |
| Hover | brand.action.dark or colorSpace.hover | State derives from action color. |
| Pressed | brand.action.darkest or colorSpace.pressed | Distinct pressed treatment. |
| variant="inverse" | Inverse surface and foreground roles | For an appropriate contrasting context. |
| Border radius | system.legacy.shape.full | Source currently retains legacy compatibility. |

### Migration reference, not current token names

[Official reference](https://github.com/Workday/canvas-tokens/discussions/77)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Former space.s → system.space.x4 | 1rem in 2023 migration table | Current source separates padding and gap. |
| Former space.m → system.space.x6 | 1.5rem in 2023 migration table | Do not assume old names remain preferred. |
| Former borderRadius.m → system.shape.x1 | 0.25rem in 2023 migration table | Current source uses semantic shape sizes. |

## Workday Canvas Design System Read the current source before copying a migration example

### Spacing now distinguishes purpose

Canvas has evolved from the t-shirt space constants in canvas-kit-react/tokens through numbered system.space tokens to source categories such as padding and gap. The current sys.json expresses their underlying values as base-token references. This reference preserves those actual paths rather than inventing a CSS variable by concatenating words.

The migration table remains useful when converting an older application: it explains why a previous space.s value corresponded to one rem. It is historical evidence, not a promise that every old export is the preferred current interface. The preview uses explicitly chosen 16 and 24px application intervals; the source table remains the authority for library token names.

[Supporting specification](https://raw.githubusercontent.com/Workday/canvas-tokens/main/packages/canvas-tokens/tokens/web/sys.json)

## Workday Canvas Design System Color belongs to the tenant and component state

### A primary button is more than a fixed blue swatch

PrimaryButton first reads brand.action.base and falls back to its legacy primary accent. Hover and pressed styles also consult brand action roles before deriving states through colorSpace helpers. This is why changing one hard-coded background cannot reproduce the component’s theme contract.

The original learning preview uses a restrained blue application palette and labels itself an HTML interpretation. It is not a rendering of a particular customer tenant or the newer Sana Canvas theme. The complete native example lets the installed token layers provide component colors.

[Supporting specification](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/button/lib/PrimaryButton.tsx)

## Workday Canvas Design System Composite roles preserve line height and weight

### A size alias is not the whole style

The current body.sm type object combines font family, normal weight, body size and body leading. Heading roles use the bold weight. Picking only a pixel size from an older screenshot would lose those relationships. The source names normal rather than the regular key that appears in older migration prose.

Fonts are not included by the Canvas Kit component package. Keep font loading a separate integration decision; the offline specimen uses a system fallback and does not claim to bundle Roboto or a Sana font.

[Supporting specification](https://raw.githubusercontent.com/Workday/canvas-tokens/main/packages/canvas-tokens/tokens/web/sys.json)

## Workday Canvas Design System FormField is a compound component

### Let the field compose its label, input and hint

The source exposes FormField.Label, FormField.Input and FormField.Hint. Passing TextInput through the Input as prop lets the model generate the accessible connections. That differs from old examples that set a label prop on the outer field and place an unwrapped input directly inside.

For horizontal forms, horizontalStart and horizontalEnd are the current orientation values. FormField.Field groups the input and hint within that alignment. Our filter stays vertical because its explanation belongs directly underneath its label and control.

- Place a real visible label in FormField.Label.
- Pass TextInput through the compound Input slot.
- Use Hint for the filter scope.
- Keep validation logic in the application when introducing constraints.

[Supporting specification](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/form-field/lib/FormField.tsx)

## Workday Canvas Design System A growing input still needs a flexible parent

### Account for the minimum width

TextInput has a 280px fallback minimum width, expressed through px2rem in its source. grow requests full width; it does not magically make a rigid two-column parent fit a narrow viewport. The offline catalog stacks its plan sidebar below the course cards on mobile and lets each layout column shrink.

The search value is ordinary React state. The app performs a case-insensitive substring match against its three course titles and displays an explicit empty result. The filter does not clear selected courses, because visibility and plan membership are different state.

[Supporting specification](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/text-input/lib/TextInput.tsx)

## Workday Canvas Design System Selection persists independently of the visible results

### Use stable course IDs and derive totals

Each original course has an ID, title and duration. The selected list stores IDs, while the displayed total is derived from the course records. Filtering the catalog does not remove a selected item. Removing an item immediately restores its Add action and reduces the total.

This is an original local planning scenario. It does not call Workday APIs, enroll a worker or modify a learning record. Keeping that boundary visible prevents a prototype from implying a real business transaction.

1. Filter only the catalog view.
2. Add a course ID once.
3. Derive selected courses and total minutes from those IDs.
4. Remove a selection without resetting the search.

[Supporting specification](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/button/lib/Button.tsx)

## Workday Canvas Design System Load tokens before expecting themed components

### Provider and CSS layers have different responsibilities

The current getting-started example imports base, brand, component and system variable styles at the application entry point, then wraps the interface with CanvasProvider. A provider alone is not a replacement for those CSS definitions. The code here follows that composition and supplies a complete React root.

Sana Canvas is opt-in: its variables are loaded after system variables and the documented html data-theme selects it. Embedded applications that cannot control the document root have a dedicated provider theme option for popup propagation. Do not add that theme accidentally to an existing tenant while upgrading packages.

[Supporting specification](https://github.com/Workday/canvas-kit)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Original offline HTML interpretation of Canvas interaction patterns and restrained enterprise hierarchy. Palette and layout are application choices, not a Sana tenant rendering.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Canvas learning plan interpretation</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f5f7;color:#20272f;font:16px/1.5 system-ui,sans-serif}button,input{font:inherit}header{background:white;border-bottom:1px solid #d5dbe0;padding:16px 24px;display:flex;gap:12px;align-items:center}.mark{width:32px;height:32px;border:4px solid #ed9b28;border-bottom:0;border-radius:50% 50% 0 0;height:16px;margin-right:8px}header span{font-size:14px;color:#59616b;margin-left:auto}main{max-width:1100px;margin:32px auto;padding:0 24px}h1{font-size:28px;line-height:36px;margin:0 0 8px}p{margin:0 0 24px}label{display:block;font-size:14px;font-weight:600;margin-bottom:8px}#search{width:100%;max-width:580px;height:40px;border:1px solid #89949f;border-radius:8px;padding:8px 12px;background:white}.hint{font-size:12px;color:#59616b;margin:8px 0 24px}.layout{display:grid;grid-template-columns:1fr 290px;gap:24px;align-items:start}.course{display:grid;grid-template-columns:96px 1fr;gap:24px;background:white;padding:24px;border-radius:8px;border:1px solid #d5dbe0;margin-bottom:16px;min-width:0}.art{height:96px;display:grid;place-items:center;border-radius:8px;font-size:40px;color:#005cb9;background:#e7f1fd}.art.orange{background:#fff0d6;color:#805200}.art.green{background:#e6f4ed;color:#236443}.category{font-size:12px;color:#59616b;text-transform:uppercase;letter-spacing:1px}h2{font-size:20px;line-height:28px;margin:4px 0 8px}.course p{font-size:14px;margin:0 0 16px;color:#59616b}.row{display:flex;justify-content:space-between;align-items:center;gap:16px}.row span{font-size:14px;color:#59616b}button{border:0;border-radius:999px;background:#005cb9;color:white;font-size:14px;font-weight:600;padding:8px 16px;cursor:pointer}button:disabled{opacity:.5;cursor:default}button:focus-visible,input:focus-visible{outline:3px solid #005cb9;outline-offset:3px}.plan{padding:24px;background:white;border:1px solid #d5dbe0;border-radius:8px}.plan h2{margin:0 0 16px}.number{font-size:36px;font-weight:700;line-height:1.2}.plan-total{padding-bottom:20px;border-bottom:1px solid #d5dbe0;margin-bottom:20px}.plan-total span{font-size:14px}.plan ul{padding:0;list-style:none;margin:0}.plan li{border-bottom:1px solid #e6e9ed;padding:0 0 16px;margin:0 0 16px;font-size:14px}.remove{background:transparent;color:#005cb9;padding:4px 0;display:block;border-radius:3px;text-decoration:underline;font-weight:400}.empty{font-size:14px;color:#59616b}.boundary{font-size:12px;color:#59616b;margin-top:24px}.no-results{background:white;border:1px solid #d5dbe0;padding:24px;border-radius:8px}@media(max-width:720px){main{padding:0 16px;margin:24px auto}.layout{grid-template-columns:1fr}.course{padding:16px;grid-template-columns:60px 1fr;gap:16px}.art{height:60px;font-size:28px}header span{display:none}.row{align-items:flex-start;flex-direction:column;gap:8px}.plan{padding:20px}}
</style><header><div class="mark" aria-hidden="true"></div><strong>Learning workspace</strong><span>Personal development · Local plan</span></header><main><h1>Make room to grow</h1><p>Choose a few focused lessons for your learning plan.</p><label for="search">Find a course</label><input id="search" type="search" placeholder="Search course titles" aria-describedby="hint"><p id="hint" class="hint">Search filters the catalog; your selected courses stay in the plan.</p><div class="layout"><section id="catalog" aria-label="Course catalog"></section><aside class="plan"><h2>Your local plan</h2><div class="plan-total" role="status"><div class="number" id="minutes">0</div><span>minutes · <span id="count">0</span> <span id="course-word">courses</span></span></div><ul id="selected"></ul><p class="empty" id="empty">Add a course to start your plan.</p><small>No enrollment is submitted.</small></aside></div><p class="boundary">Independent HTML interpretation of Canvas composition patterns. Original palette, course illustrations and content; no Workday account or enrollment service is connected.</p></main><script>const courses=[{id:'feedback',name:'Giving useful feedback',minutes:25,category:'Communication',description:'Practice clear observations and constructive next steps.',art:'◎',color:''},{id:'planning',name:'Planning a focused week',minutes:20,category:'Personal effectiveness',description:'Protect attention and organize a realistic working week.',art:'▤',color:'orange'},{id:'meetings',name:'Running inclusive meetings',minutes:30,category:'Teamwork',description:'Make space for different voices and useful decisions.',art:'◌',color:'green'}];let chosen=new Set;const catalog=document.querySelector('#catalog');function render(){let matches=courses.filter(c=>c.name.toLowerCase().includes(document.querySelector('#search').value.toLowerCase()));catalog.innerHTML=matches.length?matches.map(c=>`<article class="course"><div class="art ${c.color}" aria-hidden="true">${c.art}</div><div><div class="category">${c.category}</div><h2>${c.name}</h2><p>${c.description}</p><div class="row"><span>${c.minutes} minutes</span><button data-add="${c.id}" ${chosen.has(c.id)?'disabled':''}>${chosen.has(c.id)?'Added to plan':'Add to plan'}</button></div></div></article>`).join(''):'<div class="no-results">No matching courses. Try “feedback” or clear your search.</div>';let selected=courses.filter(c=>chosen.has(c.id));document.querySelector('#minutes').textContent=selected.reduce((sum,c)=>sum+c.minutes,0);document.querySelector('#count').textContent=selected.length;document.querySelector('#course-word').textContent=selected.length===1?'course':'courses';document.querySelector('#empty').hidden=selected.length>0;document.querySelector('#selected').innerHTML=selected.map(c=>`<li>${c.name}<button class="remove" data-remove="${c.id}" aria-label="Remove ${c.name}">Remove</button></li>`).join('');document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{let id=b.dataset.add;chosen.add(id);render();document.querySelector('[data-remove="'+id+'"]').focus()});document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{let id=b.dataset.remove;chosen.delete(id);render();let add=document.querySelector('[data-add="'+id+'"]');(add||document.querySelector('#search')).focus()})}document.querySelector('#search').oninput=render;render();</script></html>

```

[Code reference](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/form-field/lib/FormField.tsx)

- Adding a course changes the sample learning plan. The native entry separately demonstrates CanvasProvider and the compound FormField API; enrollment is not submitted.

### Compound field plus selectable learning items

FormField generates the input relationship, TextInput filters original course data, and each PrimaryButton adds an item once. Removal recomputes the selected total.

```jsx
// In a React 18+ application with a bundler:
// npm install @workday/canvas-kit-react @workday/canvas-tokens-web @workday/canvas-kit-styling @emotion/react @emotion/styled
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CanvasProvider} from '@workday/canvas-kit-react/common';
import {FormField} from '@workday/canvas-kit-react/form-field';
import {TextInput} from '@workday/canvas-kit-react/text-input';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {system} from '@workday/canvas-tokens-web';
import {cssVar} from '@workday/canvas-kit-styling';
import '@workday/canvas-tokens-web/css/base/_variables.css';
import '@workday/canvas-tokens-web/css/brand/_variables.css';
import '@workday/canvas-tokens-web/css/component/_variables.css';
import '@workday/canvas-tokens-web/css/system/_variables.css';
// Default theme example; do not silently add a Sana theme to an existing tenant.
const courses=[{id:'feedback',name:'Giving useful feedback',minutes:25},{id:'planning',name:'Planning a focused week',minutes:20},{id:'meetings',name:'Running inclusive meetings',minutes:30}];
function LearningPlan(){
 const [query,setQuery]=useState(''),[chosen,setChosen]=useState([]);
 const visible=courses.filter(c=>c.name.toLowerCase().includes(query.toLowerCase()));
 const selected=courses.filter(c=>chosen.includes(c.id));
 return <main style={{fontFamily:cssVar(system.fontFamily.default),maxWidth:900,margin:'auto',padding:24}}>
 <h1>Build a learning plan</h1>
 <FormField><FormField.Label>Find a course</FormField.Label>
  <FormField.Input as={TextInput} grow value={query} onChange={e=>setQuery(e.target.value)}/>
  <FormField.Hint>Filter the three example course titles.</FormField.Hint>
 </FormField>
 <ul>{visible.map(c=><li key={c.id} style={{margin:'24px 0'}}><h2>{c.name}</h2><p>{c.minutes} minutes</p>
  <PrimaryButton type="button" disabled={chosen.includes(c.id)} onClick={()=>setChosen(old=>[...old,c.id])}>
   {chosen.includes(c.id)?'Added to plan':'Add to plan'}
  </PrimaryButton></li>)}</ul>
 {!visible.length&&<p>No matching courses.</p>}
 <section aria-label="Learning plan"><h2>Your local plan</h2><p role="status">{selected.length} courses · {selected.reduce((sum,c)=>sum+c.minutes,0)} minutes</p>
 <ul>{selected.map(c=><li key={c.id}>{c.name} <button type="button" onClick={()=>setChosen(old=>old.filter(id=>id!==c.id))}>Remove {c.name}</button></li>)}</ul>
 <p>No enrollment is submitted.</p></section></main>;
}
createRoot(document.getElementById('root')).render(<CanvasProvider><LearningPlan/></CanvasProvider>);
```

[Code reference](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/form-field/lib/FormField.tsx)

- PrimaryButton belongs to each independent course item; the whole plan has no misleading enroll action.
- Remove uses an explicitly application-owned native button.
- A disabled Added state prevents a duplicate while a live count confirms the change.

## Implementation Starting Point

Full React composition for a bundled application. Current CanvasProvider and token CSS setup; original course data and native remove controls. No remote enrollment. Source checked, not package-compiled in this workspace.

```jsx
// In a React 18+ application with a bundler:
// npm install @workday/canvas-kit-react @workday/canvas-tokens-web @workday/canvas-kit-styling @emotion/react @emotion/styled
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CanvasProvider} from '@workday/canvas-kit-react/common';
import {FormField} from '@workday/canvas-kit-react/form-field';
import {TextInput} from '@workday/canvas-kit-react/text-input';
import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {system} from '@workday/canvas-tokens-web';
import {cssVar} from '@workday/canvas-kit-styling';
import '@workday/canvas-tokens-web/css/base/_variables.css';
import '@workday/canvas-tokens-web/css/brand/_variables.css';
import '@workday/canvas-tokens-web/css/component/_variables.css';
import '@workday/canvas-tokens-web/css/system/_variables.css';
// Default theme example; do not silently add a Sana theme to an existing tenant.
const courses=[{id:'feedback',name:'Giving useful feedback',minutes:25},{id:'planning',name:'Planning a focused week',minutes:20},{id:'meetings',name:'Running inclusive meetings',minutes:30}];
function LearningPlan(){
 const [query,setQuery]=useState(''),[chosen,setChosen]=useState([]);
 const visible=courses.filter(c=>c.name.toLowerCase().includes(query.toLowerCase()));
 const selected=courses.filter(c=>chosen.includes(c.id));
 return <main style={{fontFamily:cssVar(system.fontFamily.default),maxWidth:900,margin:'auto',padding:24}}>
 <h1>Build a learning plan</h1>
 <FormField><FormField.Label>Find a course</FormField.Label>
  <FormField.Input as={TextInput} grow value={query} onChange={e=>setQuery(e.target.value)}/>
  <FormField.Hint>Filter the three example course titles.</FormField.Hint>
 </FormField>
 <ul>{visible.map(c=><li key={c.id} style={{margin:'24px 0'}}><h2>{c.name}</h2><p>{c.minutes} minutes</p>
  <PrimaryButton type="button" disabled={chosen.includes(c.id)} onClick={()=>setChosen(old=>[...old,c.id])}>
   {chosen.includes(c.id)?'Added to plan':'Add to plan'}
  </PrimaryButton></li>)}</ul>
 {!visible.length&&<p>No matching courses.</p>}
 <section aria-label="Learning plan"><h2>Your local plan</h2><p role="status">{selected.length} courses · {selected.reduce((sum,c)=>sum+c.minutes,0)} minutes</p>
 <ul>{selected.map(c=><li key={c.id}>{c.name} <button type="button" onClick={()=>setChosen(old=>old.filter(id=>id!==c.id))}>Remove {c.name}</button></li>)}</ul>
 <p>No enrollment is submitted.</p></section></main>;
}
createRoot(document.getElementById('root')).render(<CanvasProvider><LearningPlan/></CanvasProvider>);
```

## Agent Prompt

Use the current Canvas FormField composition and token CSS layers. Keep course filtering separate from selection state, prevent duplicates and derive total minutes. Preserve tenant theming through semantic roles; do not mistake historical numbered space names for current preferred source categories.

## Sources

- [Canvas Kit setup](https://github.com/Workday/canvas-kit) — Current imports, provider and Sana boundary.
- [Current system token source](https://raw.githubusercontent.com/Workday/canvas-tokens/main/packages/canvas-tokens/tokens/web/sys.json) — Spacing categories, type and shape aliases.
- [FormField source](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/form-field/lib/FormField.tsx) — Compound API and orientation.
- [TextInput source](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/text-input/lib/TextInput.tsx) — Sizing and state styling.
- [PrimaryButton source](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/button/lib/PrimaryButton.tsx) — Brand-aware state roles.
- [Button source](https://raw.githubusercontent.com/Workday/canvas-kit/master/modules/react/button/lib/Button.tsx) — Inherited behavior and icon direction.
- [Historical migration](https://github.com/Workday/canvas-tokens/discussions/77) — Older names retained only as a migration reference.
