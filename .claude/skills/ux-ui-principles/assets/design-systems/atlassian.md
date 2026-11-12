# Atlassian Design System — OpenDesign Application Guide

Build an issue-planning board with semantic Atlassian tokens, an eight-pixel spacing scale, real Button, Lozenge and Toggle APIs, and the required Compiled styling setup. Inspect an issue, filter the board, and move a local work item without confusing selection with status.

OpenDesign study of the public Atlassian Design System React packages, checked against the linked documentation in October 2026. The embedded board is an HTML/CSS interpretation with illustrative palette values and fictional issues, not Jira or a native Atlaskit runtime. Public package access does not imply unrestricted rights to Atlassian branding or the same support available internally.

## Source Reference

- **Package scope:** Public packages are distributed under @atlaskit. ([source](https://atlassian.design/get-started/develop/atlassians))
- **Styling integration:** Consumers of current platform packages must configure Compiled CSS integration. ([source](https://atlassian.design/get-started/develop/atlassians))
- **Global theme:** setGlobalTheme loads theme CSS and updates document theme attributes. ([source](https://atlassian.design/components/tokens/code))
- **Spacing base:** space.100 represents the 8px base unit. ([source](https://atlassian.design/foundations/spacing/))
- **App fonts:** Atlassian Sans and Atlassian Mono are the documented application typefaces. ([source](https://atlassian.design/foundations/typography/product-typefaces-and-scale))
- **Font token application:** Composite font tokens belong on font, not font-size. ([source](https://atlassian.design/components/tokens/all-tokens))


## Design Reference

Use the exact semantic token names in code. The official reference exposes color palette aliases that vary by light/dark theme, so these rows preserve aliases instead of inventing a stable hex value. Numeric spacing and radius values are from the documented scales. Preview hex colors are illustrative, not a token export.

### Spacing from an eight-pixel base

[Official reference](https://atlassian.design/foundations/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| space.0 | 0px / 0rem | Spacing token; suffix is a percentage of the 8px base. |
| space.025 | 2px / 0.125rem | Spacing token; suffix is a percentage of the 8px base. |
| space.050 | 4px / 0.25rem | Spacing token; suffix is a percentage of the 8px base. |
| space.075 | 6px / 0.375rem | Spacing token; suffix is a percentage of the 8px base. |
| space.100 | 8px / 0.5rem | Spacing token; suffix is a percentage of the 8px base. |
| space.150 | 12px / 0.75rem | Spacing token; suffix is a percentage of the 8px base. |
| space.200 | 16px / 1rem | Spacing token; suffix is a percentage of the 8px base. |
| space.250 | 20px / 1.25rem | Spacing token; suffix is a percentage of the 8px base. |
| space.300 | 24px / 1.5rem | Spacing token; suffix is a percentage of the 8px base. |
| space.400 | 32px / 2rem | Spacing token; suffix is a percentage of the 8px base. |
| space.500 | 40px / 2.5rem | Spacing token; suffix is a percentage of the 8px base. |
| space.600 | 48px / 3rem | Spacing token; suffix is a percentage of the 8px base. |
| space.800 | 64px / 4rem | Spacing token; suffix is a percentage of the 8px base. |
| space.1000 | 80px / 5rem | Spacing token; suffix is a percentage of the 8px base. |

### Semantic text and surface roles

[Official reference](https://atlassian.design/components/tokens/all-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| color.text | Neutral1000 / DarkNeutral1000 | Primary text; values shown as light / dark palette aliases. |
| color.text.subtle | Neutral800 / DarkNeutral800 | Secondary labels. |
| color.text.subtlest | Neutral700 / DarkNeutral700 | Metadata. |
| color.text.selected | Blue700 / Blue400 | Selection, not business workflow state. |
| color.text.danger | Red800 / Red300 | Critical explanatory text. |
| color.text.inverse | Neutral0 / DarkNeutral100 | Text on supported bold fills. |
| elevation.surface | Neutral0 / DarkNeutral100 | Main application surface. |
| elevation.surface.sunken | Neutral100 / DarkNeutral0 | Board column grouping. |
| elevation.surface.raised | Neutral0 / DarkNeutral200 | Movable work-item cards. |
| elevation.surface.overlay | Neutral0 / DarkNeutral250 | Popover or overlay surface, paired with overlay shadow. |

### Typography uses the CSS font shorthand

[Official reference](https://atlassian.design/foundations/typography/applying-typography)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| font.heading.large | heading role | Page heading. |
| font.heading.medium | heading role | Large component or detail title. |
| font.heading.small | heading role | Small component heading. |
| font.body | body role | Default short descriptions and component text. |
| font.body.large | reading role | Longer explanations. |
| font.body.small | secondary role | Limited use for metadata. |
| font.code | code role | Technical identifiers; not ordinary discussion. |
| font.weight.regular / medium / bold | weight roles | Apply weight as a deliberate override of the font shorthand. |

### Shape and depth

[Official reference](https://atlassian.design/components/tokens/all-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| radius.xsmall | 2px | Small detail such as checkbox or badge. |
| radius.small | 4px | Supporting labels and compact controls. |
| radius.medium | 6px | Interactive controls. |
| elevation.shadow.raised | theme-resolved multi-layer shadow | Pair with elevation.surface.raised. |
| elevation.shadow.overlay | theme-resolved multi-layer shadow | Pair with overlay surface; not a stronger border for every card. |

### Component parameters used in the board

[Official reference](https://atlassian.design/components/button/examples)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Button appearance | primary / default / subtle / danger / warning | Choose according to action meaning. |
| Button isSelected | boolean | Visual selection; does not change issue state. |
| Button isLoading | boolean | Blocks repeat interaction while displaying progress. |
| Button spacing | default / compact | Compact is documented for denser settings such as tables. |
| Button shouldFitContainer | boolean | Allows the action to use its container width. |

### Status and filter composition

[Official reference](https://atlassian.design/components/lozenge/examples)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Lozenge appearance="information" | In progress | Status marker, not a clickable transition control. |
| Lozenge appearance="danger" | Blocked | Use text to identify the condition. |
| Lozenge appearance="success" | Completed | A confirmed local state in this specimen. |
| Toggle isChecked + onChange | controlled boolean | The example uses it for an owner filter, not a workflow transition. |

## Atlassian Design System Public ADS packages and the actual styling requirement

### A component import is not the whole integration

Atlassian Design System components are published under @atlaskit, but the wider Atlaskit catalog also contains app-specific packages. This example chooses three documented primitives: Button, Lozenge and Toggle, plus tokens and CSS reset. Its data model is intentionally local. Nothing in those imports provides Jira issue permissions, sprint logic or a backend.

The current setup reference requires Compiled integration for applications consuming platform packages, even if the application does not author Compiled styles. The supplied Parcel configuration is therefore part of the example. A copied Button import with no bundler setup can produce incomplete or incorrectly ordered styles, which is a functional integration problem rather than a cosmetic footnote.

[Supporting specification](https://atlassian.design/get-started/develop/atlassians)

## Atlassian Design System Use semantic tokens instead of palette guesses

### A token describes a job

token("color.text") is the primary foreground, while token("color.text.subtle") is secondary information. Selected text uses a separate role from danger text. The board uses elevation.surface for its main region and elevation.surface.sunken for a grouping region. Those choices remain understandable when the theme changes because their names express purpose.

The official catalog gives light and dark palette aliases for these roles. The reference table preserves that information rather than promising one permanent hex. The embedded specimen uses an illustrative palette and is labeled accordingly. Its colors make the local example legible, but they are not an alternative source of truth for a production Atlaskit theme.

[Supporting specification](https://atlassian.design/components/tokens/all-tokens)

## Atlassian Design System An eight-pixel base with deliberate fractional steps

### Read the suffix as a percentage

space.100 is 8px; space.200 is 16px; space.025 is 2px. The scale has fractional steps because small gaps and optical alignment need more precision than whole eight-pixel units. The board uses space.300 around major content and space.150 between local items. A token call returns a theme-aware CSS value rather than a number to perform arbitrary JavaScript arithmetic on.

Use the same gap for the same relationship. The distance between an issue key and its title should be smaller than the space separating the issue list from the inspector. Negative spacing tokens exist, but the ordinary board layout does not need them. A dense work surface should gain space through composition, not by pulling unrelated elements over one another.

[Supporting specification](https://atlassian.design/foundations/spacing/)

## Atlassian Design System Typography tokens are complete font declarations

### Do not place font.body in font-size

The catalog explicitly defines composite font tokens for the CSS font property. The sample assigns font.heading.large to its page title and font.heading.medium to the detail title. Using one of these tokens as fontSize would discard its intended contract. The body role suits short issue summaries, while long descriptions may use font.body.large when the surrounding layout supports reading.

The current application typefaces are Atlassian Sans and Atlassian Mono. Sans is derived from Inter Variable; Mono is derived from JetBrains Mono. That identity matters when describing the system, but this standalone preview does not redistribute those fonts. It uses a system fallback and says so. A production adoption should use the supported font delivery and licensing path rather than renaming an arbitrary typeface.

[Supporting specification](https://atlassian.design/foundations/typography/product-typefaces-and-scale)

## Atlassian Design System Use shape and elevation to explain the work surface

### A card is raised because it is an object

The reference distinguishes a sunken grouping surface, raised cards and overlay surfaces. A movable work item belongs conceptually with the raised layer, while a board column groups those items. An inspector that is part of the regular page does not automatically need an overlay shadow. Pair surface and shadow roles when elevation actually matters.

The current shape names include radius.xsmall at 2px, radius.small at 4px and radius.medium at 6px. These are not the older border.radius spelling that a developer might remember from another system. The table retains exact names. Native controls should use their supplied styling; custom outer containers can adopt the relevant role without overriding private generated classes.

[Supporting specification](https://atlassian.design/components/tokens/all-tokens)

## Atlassian Design System Button selection is different from an issue transition

### Choose an appearance and state deliberately

The verified Button import is @atlaskit/button/default/button. appearance="primary" emphasizes a main action; isSelected marks the current issue in this compact native example. Clicking it changes only the inspected issue. A separate control edits the workflow state. That separation prevents selecting a row from silently starting or completing work.

The API also includes isLoading, isDisabled, spacing="compact" and shouldFitContainer. Loading represents an operation in progress, not a permanent issue status. A disabled action needs an understandable reason, since disabled controls may be skipped in keyboard navigation. The standalone board therefore keeps its inspection controls available and lets the user review the current local state directly.

[Supporting specification](https://atlassian.design/components/button/examples)

## Atlassian Design System Lozenge and Toggle communicate different kinds of state

### Status is not an interaction mode

Lozenge appearances include information, danger and success, which the sample maps to In progress, Blocked and Done. The words carry the meaning; color is redundant. A blocked item stays blocked when it becomes selected. The owner filter uses Toggle with isChecked and onChange, because that boolean affects what the board shows rather than changing any issue.

The local state selector is intentionally simple and does not imply a real permission model. A production issue transition may require a reason, role or service response. Keep that authorization logic outside the Lozenge and show the confirmed result only after the service establishes it.

- Selection identifies the issue currently being inspected.
- Workflow state describes the work item itself.
- Owner filtering changes the visible set without changing ownership.

[Supporting specification](https://atlassian.design/components/lozenge/examples)

## Atlassian Design System Initialize theme before rendering custom token surfaces

### Global theme loading is asynchronous

setGlobalTheme updates the document theme attributes and loads the selected theme CSS. The entry awaits that operation before rendering the board. It selects light and dark themes explicitly with light mode initially active. A real preference control can update colorMode through the same API instead of replacing random inline colors.

The current custom-brand options are marked alpha and use an UNSAFE API. This guide does not adopt that unstable path merely to recolor the example. Keep the stable semantic theme contract first, then evaluate experimental customization as a separate dependency decision.

[Supporting specification](https://atlassian.design/components/tokens/code)

## Atlassian Design System Validate a real issue-reading interaction

### Use the supplied files together

The native example needs the JSX entry, CSS reset import and both Parcel configuration files. It includes the issue collection, selection, owner filter, status mapping and live result message. The standalone preview expands the composition into columns and an inspector but remains an explicitly labeled HTML interpretation. Neither claims to connect to Jira.

When a filter excludes the selected issue, the native example deliberately retains its detail. The reader can still inspect the object rather than being silently moved to another item. A production design can choose another policy, but it should explain that policy and preserve meaningful focus. Verify the behavior with a narrow viewport as well as with all columns visible.

1. Inspect WEB-18, then select a different issue without changing its workflow state.
2. Enable the owner filter and check which issues remain visible.
3. Change the selected local issue state and verify that its status text and column agree.
4. Return to the unfiltered board and confirm the same issue identity and updated state.

[Supporting specification](https://atlassian.design/components/toggle/examples)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. HTML/CSS interpretation using verified spacing and shape values with an illustrative color palette and system-font fallback; not a Jira or native Atlaskit runtime.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Issue board — Atlassian interpretation</title><style>*{box-sizing:border-box}body{margin:0;background:#fff;color:#172b4d;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,select{font:inherit}button{cursor:pointer}header{padding:16px 24px;border-bottom:1px solid #dfe1e6;display:flex;align-items:center;justify-content:space-between;gap:16px}header strong{font-size:18px}.logo{color:#0c66e4;margin-right:12px}button{border:0;border-radius:4px;background:#f1f2f4;color:#172b4d;padding:8px 12px}button:hover{background:#dcdfe4}button:focus-visible,select:focus-visible{outline:3px solid #0c66e4;outline-offset:2px}.primary{background:#0c66e4;color:white}.primary:hover{background:#0055cc}main{padding:24px}.crumb{color:#626f86;font-size:12px}h1{font-size:24px;line-height:32px;margin:8px 0 16px}.tools{display:flex;align-items:center;gap:12px;margin-bottom:24px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:24px}.board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:start}.column{background:#f7f8f9;min-height:280px;padding:8px;border-radius:6px}.column h2{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#626f86;margin:8px 4px 16px}.issue{text-align:left;background:white;box-shadow:0 1px 2px #091e4240;width:100%;margin-bottom:8px;padding:12px;display:block;border:2px solid transparent}.issue[aria-pressed=true]{border-color:#0c66e4}.issue:hover{background:#fff;border-color:#85b8ff}.issue strong{display:block;font-weight:500;min-height:46px}.meta{display:flex;justify-content:space-between;align-items:center;margin-top:20px;font-size:11px;color:#626f86}.avatar{display:inline-grid;place-items:center;width:24px;height:24px;background:#dfe1e6;border-radius:50%;font-weight:600}.tag{font-size:11px;line-height:18px;padding:1px 5px;font-weight:700;border-radius:3px;display:inline-block;background:#dfe1e6}.tag[data-status="In progress"]{background:#e9f2ff;color:#0055cc}.tag[data-status=Blocked]{background:#ffedeb;color:#ae2a19}.tag[data-status=Done]{background:#dcfff1;color:#216e4e}aside{border-left:1px solid #dfe1e6;padding-left:24px}aside h2{font-size:18px;line-height:26px;margin:12px 0 24px}dl{margin:0}dt{font-weight:600;margin:20px 0 8px}dd{margin:0}select{padding:8px;border:1px solid #8590a2;border-radius:4px;background:white;color:#172b4d;max-width:100%}.empty{padding:12px;color:#626f86;font-size:12px}footer{border-top:1px solid #dfe1e6;padding:16px 24px;color:#626f86;font-size:11px}#announcement{min-height:20px;color:#44546f;margin-top:16px}@media(max-width:720px){main{padding:16px}.layout{grid-template-columns:1fr}.board{grid-template-columns:1fr}.column{min-height:100px}aside{border-left:0;border-top:1px solid #dfe1e6;padding:16px 0 0}.issue strong{min-height:0}header{padding:16px}.tools{flex-wrap:wrap}}
</style><header><strong><span class="logo">▲</span>Product delivery</strong><span class="tag">LOCAL DEMO</span></header><main><div class="crumb">Projects / Website / Board</div><h1>Website release</h1><div class="tools"><label><input type="checkbox" id="mine"> Only Maya’s issues</label><button id="reset">Reset board</button></div><div class="layout"><section class="board" aria-label="Issues by status" id="board"></section><aside aria-label="Selected issue"><span id="key" class="crumb"></span><h2 id="title"></h2><span id="badge" class="tag"></span><dl><dt>Assignee</dt><dd id="owner"></dd><dt>Description</dt><dd id="description"></dd><dt><label for="status">Move issue to</label></dt><dd><select id="status"><option>To do</option><option>In progress</option><option>Blocked</option><option>Done</option></select></dd></dl><p id="announcement" role="status"></p></aside></div></main><footer>Independent HTML/CSS interpretation of Atlassian spacing, semantic status and persistent issue selection. System font and sample colors; no Jira connection.</footer><script>
const initial=[{id:'WEB-18',title:'Audit navigation labels',owner:'Maya Chen',status:'To do',description:'Review the wording of top-level links and check that each label describes its destination.'},{id:'WEB-21',title:'Connect locale switcher',owner:'Theo Park',status:'In progress',description:'Keep the current resource selected when a reader switches between supported languages.'},{id:'WEB-24',title:'Resolve missing image credits',owner:'Maya Chen',status:'Blocked',description:'The launch requires confirmation of the source and permitted use of two editorial images.'}];let issues=structuredClone(initial),selected='WEB-21';const board=document.querySelector('#board'),status=document.querySelector('#status');
function render(){board.replaceChildren();for(const state of ['To do','In progress','Blocked / Done']){const col=document.createElement('section');col.className='column';const entries=issues.filter(x=>(state==='Blocked / Done'?['Blocked','Done'].includes(x.status):x.status===state)&&(!document.querySelector('#mine').checked||x.owner==='Maya Chen'));const h=document.createElement('h2');h.textContent=state+' · '+entries.length;col.append(h);for(const issue of entries){const b=document.createElement('button');b.className='issue';b.setAttribute('aria-pressed',String(selected===issue.id));const t=document.createElement('strong');t.textContent=issue.title;const meta=document.createElement('span');meta.className='meta';meta.textContent=issue.id;const av=document.createElement('span');av.className='avatar';av.textContent=issue.owner.split(' ').map(x=>x[0]).join('');av.title=issue.owner;meta.append(av);b.append(t,meta);b.onclick=()=>{selected=issue.id;render();document.querySelector('#announcement').textContent='Selected '+issue.id};col.append(b)}if(!entries.length){const p=document.createElement('p');p.className='empty';p.textContent='No matching issues';col.append(p)}board.append(col)}const item=issues.find(x=>x.id===selected);document.querySelector('#key').textContent=item.id;document.querySelector('#title').textContent=item.title;document.querySelector('#owner').textContent=item.owner;document.querySelector('#description').textContent=item.description;const badge=document.querySelector('#badge');badge.textContent=item.status;badge.dataset.status=item.status;status.value=item.status}
status.onchange=()=>{const i=issues.find(x=>x.id===selected);i.status=status.value;render();document.querySelector('#announcement').textContent=i.id+' moved to '+i.status+' in this local board.'};document.querySelector('#mine').onchange=render;document.querySelector('#reset').onclick=()=>{issues=structuredClone(initial);selected='WEB-21';document.querySelector('#mine').checked=false;render();document.querySelector('#announcement').textContent='Board reset.'};render();
</script></html>

```

[Code reference](https://atlassian.design/components/button/examples)

- Issue transitions affect the sample board only. This HTML entry does not exercise the Compiled build configuration required by the separate Atlaskit implementation.

### Complete native implementation entry

The complete implementation from setup, collected here alongside the focused API explanations. Follow the documented package and build prerequisites in setup.

```jsx
// Existing React 18 project; use the Parcel configuration examples below.
// npm install @atlaskit/css-reset @atlaskit/tokens @atlaskit/button @atlaskit/lozenge @atlaskit/toggle
// npm install --save-dev parcel @compiled/parcel-config
// src/main.jsx; HTML entry contains <div id="root"></div> and a module script pointing here.
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import '@atlaskit/css-reset';
import {token, setGlobalTheme} from '@atlaskit/tokens';
import Button from '@atlaskit/button/default/button';
import Lozenge from '@atlaskit/lozenge/lozenge';
import Toggle from '@atlaskit/toggle';
const initial = [
  {id:'WEB-18',title:'Clarify first-project copy',owner:'Maya',status:'To do'},
  {id:'WEB-21',title:'Review keyboard path',owner:'Alex',status:'In progress'},
  {id:'WEB-24',title:'Resolve missing illustrations',owner:'Maya',status:'Blocked'}
];
const appearance = {'To do':'default','In progress':'information','Blocked':'danger','Done':'success'};
function Board() {
  const [issues,setIssues]=React.useState(initial);
  const [selected,setSelected]=React.useState('WEB-18');
  const [mine,setMine]=React.useState(false);
  const [notice,setNotice]=React.useState('');
  const issue=issues.find(i=>i.id===selected);
  return <main style={{padding:token('space.300'),color:token('color.text'),background:token('elevation.surface')}}>
    <h1 style={{font:token('font.heading.large')}}>Onboarding improvements</h1>
    <label htmlFor="mine">Assigned to Maya</label>
    <Toggle id="mine" isChecked={mine} onChange={e=>setMine(e.currentTarget.checked)}/>
    <div style={{display:'flex',flexWrap:'wrap',gap:token('space.300'),marginTop:token('space.200')}}>
      <ul style={{flex:'1 1 280px',listStyle:'none',padding:0}}>
        {issues.filter(i=>!mine||i.owner==='Maya').map(i=><li key={i.id} style={{marginBottom:token('space.150')}}>
          <Button isSelected={i.id===selected} onClick={()=>setSelected(i.id)}>{i.id}: {i.title}</Button>
          {' '}<Lozenge appearance={appearance[i.status]}>{i.status}</Lozenge>
        </li>)}
      </ul>
      <section aria-label="Issue details" style={{flex:'1 1 280px',padding:token('space.200'),background:token('elevation.surface.sunken')}}>
        <h2 style={{font:token('font.heading.medium')}}>{issue.id}: {issue.title}</h2>
        <p>Owner: {issue.owner}</p>
        <label htmlFor="status">Workflow state</label>{' '}
        <select id="status" value={issue.status} onChange={event=>{
          const status=event.target.value;
          setIssues(items=>items.map(i=>i.id===issue.id?{...i,status}:i));
          setNotice(`${issue.id} moved to ${status} in this local example.`);
        }}>{Object.keys(appearance).map(s=><option key={s}>{s}</option>)}</select>
        <p>This local demonstration has no Jira connection or permission rules.</p>
      </section>
    </div><p role="status">{notice}</p>
  </main>;
}
async function start(){
  await setGlobalTheme({light:'light',dark:'dark',colorMode:'light'});
  createRoot(document.getElementById('root')).render(<Board/>);
}
start();
```

[Code reference](https://atlassian.design/get-started/develop/atlassians)

- Complete React board logic plus the required configuration fragments below. Use Parcel with Compiled integration; importing only CSS reset is insufficient for current packages. Native package compilation has not been claimed in this local prototype.

### Parcel must process the distributed Compiled styles

Create .parcelrc at the project root. Start Parcel using its HTML entry after installing the dependencies listed in setup.

```json
{
  "extends": ["@parcel/config-default", "@compiled/parcel-config"]
}
```

[Code reference](https://atlassian.design/get-started/develop/atlassians)

- This chooses the documented Parcel integration rather than silently treating the experimental Vite path as the recommended setup.

### Compiled configuration for token transformation

Create .compiledcssrc beside .parcelrc. This is part of the consuming application setup, not a package-release script.

```json
{
  "transformerBabelPlugins": [["@atlaskit/tokens/babel-plugin"]],
  "extract": true,
  "inlineCss": true,
  "sortShorthand": true
}
```

[Code reference](https://atlassian.design/get-started/develop/atlassians)

- The optional strip-runtime plugin is for packages distributing extracted CSS; it is not required by this consuming application.

### A lozenge describes state; a control changes state

The display and the transition control have separate responsibilities in the issue detail.

```jsx
<Lozenge appearance="danger">Blocked</Lozenge>
<Button appearance="primary" onClick={openIssueDetail}>Review blocker</Button>
```

[Code reference](https://atlassian.design/components/lozenge/examples)

- openIssueDetail is the application handler; the full setup demonstrates selection state.
- Do not make the status label look like a menu unless it actually exposes a transition interaction.

## Implementation Starting Point

Complete React board logic plus the required configuration fragments below. Use Parcel with Compiled integration; importing only CSS reset is insufficient for current packages. Native package compilation has not been claimed in this local prototype.

```jsx
// Existing React 18 project; use the Parcel configuration examples below.
// npm install @atlaskit/css-reset @atlaskit/tokens @atlaskit/button @atlaskit/lozenge @atlaskit/toggle
// npm install --save-dev parcel @compiled/parcel-config
// src/main.jsx; HTML entry contains <div id="root"></div> and a module script pointing here.
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import '@atlaskit/css-reset';
import {token, setGlobalTheme} from '@atlaskit/tokens';
import Button from '@atlaskit/button/default/button';
import Lozenge from '@atlaskit/lozenge/lozenge';
import Toggle from '@atlaskit/toggle';
const initial = [
  {id:'WEB-18',title:'Clarify first-project copy',owner:'Maya',status:'To do'},
  {id:'WEB-21',title:'Review keyboard path',owner:'Alex',status:'In progress'},
  {id:'WEB-24',title:'Resolve missing illustrations',owner:'Maya',status:'Blocked'}
];
const appearance = {'To do':'default','In progress':'information','Blocked':'danger','Done':'success'};
function Board() {
  const [issues,setIssues]=React.useState(initial);
  const [selected,setSelected]=React.useState('WEB-18');
  const [mine,setMine]=React.useState(false);
  const [notice,setNotice]=React.useState('');
  const issue=issues.find(i=>i.id===selected);
  return <main style={{padding:token('space.300'),color:token('color.text'),background:token('elevation.surface')}}>
    <h1 style={{font:token('font.heading.large')}}>Onboarding improvements</h1>
    <label htmlFor="mine">Assigned to Maya</label>
    <Toggle id="mine" isChecked={mine} onChange={e=>setMine(e.currentTarget.checked)}/>
    <div style={{display:'flex',flexWrap:'wrap',gap:token('space.300'),marginTop:token('space.200')}}>
      <ul style={{flex:'1 1 280px',listStyle:'none',padding:0}}>
        {issues.filter(i=>!mine||i.owner==='Maya').map(i=><li key={i.id} style={{marginBottom:token('space.150')}}>
          <Button isSelected={i.id===selected} onClick={()=>setSelected(i.id)}>{i.id}: {i.title}</Button>
          {' '}<Lozenge appearance={appearance[i.status]}>{i.status}</Lozenge>
        </li>)}
      </ul>
      <section aria-label="Issue details" style={{flex:'1 1 280px',padding:token('space.200'),background:token('elevation.surface.sunken')}}>
        <h2 style={{font:token('font.heading.medium')}}>{issue.id}: {issue.title}</h2>
        <p>Owner: {issue.owner}</p>
        <label htmlFor="status">Workflow state</label>{' '}
        <select id="status" value={issue.status} onChange={event=>{
          const status=event.target.value;
          setIssues(items=>items.map(i=>i.id===issue.id?{...i,status}:i));
          setNotice(`${issue.id} moved to ${status} in this local example.`);
        }}>{Object.keys(appearance).map(s=><option key={s}>{s}</option>)}</select>
        <p>This local demonstration has no Jira connection or permission rules.</p>
      </section>
    </div><p role="status">{notice}</p>
  </main>;
}
async function start(){
  await setGlobalTheme({light:'light',dark:'dark',colorMode:'light'});
  createRoot(document.getElementById('root')).render(<Board/>);
}
start();
```

## Agent Prompt

Build the supplied React 18 Atlassian issue example with @atlaskit tokens, CSS reset and the documented Compiled Parcel integration. Use semantic token calls, font shorthand roles and the verified Button/Lozenge/Toggle imports. Keep selection, owner filtering and workflow state independent. Preserve the selected issue context, announce local changes, and do not claim Jira connectivity or real permissions.

## Sources

- [tokens](https://atlassian.design/components/tokens/all-tokens) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [theme](https://atlassian.design/components/tokens/code) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [setup](https://atlassian.design/get-started/develop/atlassians) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [space](https://atlassian.design/foundations/spacing/) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [type](https://atlassian.design/foundations/typography/applying-typography) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [font](https://atlassian.design/foundations/typography/product-typefaces-and-scale) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [button](https://atlassian.design/components/button/examples) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [lozenge](https://atlassian.design/components/lozenge/examples) — Official source for the concrete API, scale or integration requirement discussed in this guide.
- [toggle](https://atlassian.design/components/toggle/examples) — Official source for the concrete API, scale or integration requirement discussed in this guide.
