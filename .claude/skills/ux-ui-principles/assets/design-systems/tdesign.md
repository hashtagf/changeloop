# TDesign Design System — OpenDesign Application Guide

Build a compact API policy editor with TDesign React: concrete theme roles, its two-pixel size scale, Form field registration, and a typed Table composition.

Independent OpenDesign reference. The preview is an offline interpretation, not Tencent software or a deployed authorization service.

## Source Reference

- **Package:** tdesign-react ([source](https://github.com/Tencent/tdesign-react))
- **Style entry:** tdesign-react/es/style/index.css ([source](https://github.com/Tencent/tdesign-react))
- **Light brand:** #0052d9 ([source](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_light.less))
- **Body medium:** 14px / 22px ([source](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_font.less))
- **Medium component height:** 32px ([source](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_size.less))
- **Default radius:** 3px ([source](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_radius.less))


## Design Reference

TDesign React with current public develop-branch theme and component sources. Theme values are source snapshots, not a pinned package compatibility promise. The standalone preview is an HTML interpretation; the React example uses the real package API.

### Light theme roles

[Official reference](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_light.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --td-brand-color | #0052d9 | Primary action, resolved from brand step 7. |
| --td-brand-color-hover | #366ef4 | Primary hover. |
| --td-brand-color-active | #003cab | Pressed action. |
| --td-brand-color-light | #f2f3ff | Subtle selected surface. |
| --td-bg-color-page | #eee | Outer canvas. |
| --td-bg-color-container | #fff | Editor and table panels. |
| --td-text-color-primary | rgba(0,0,0,.9) | Main copy. |
| --td-text-color-secondary | rgba(0,0,0,.6) | Supporting copy. |
| --td-border-level-1-color | #e8e8e8 | Dividers. |
| --td-border-level-2-color | #ddd | Control borders. |
| --td-error-color | #d54941 | Field error role. |
| --td-success-color | #2ba471 | Positive role; do not infer contrast from color alone. |

### Type roles

[Official reference](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_font.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --td-font-family | PingFang SC, Microsoft YaHei, Arial Regular | System-oriented stack; fonts are not downloaded by this declaration. |
| --td-font-body-small | 12px / 20px | Secondary compact labels. |
| --td-font-body-medium | 14px / 22px | Console body copy. |
| --td-font-body-large | 16px / 24px | Larger reading text. |
| --td-font-title-medium | 600 16px / 24px | Panel title. |
| --td-font-headline-small | 600 24px / 32px | Page heading. |
| --td-font-display-medium | 600 48px / 56px | Display role, not necessary in a policy editor. |

### Size and semantic spacing

[Official reference](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_size.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --td-size-1 … --td-size-8 | 2, 4, 6, 8, 12, 16, 20, 24px | Nonlinear base scale. |
| --td-size-9 … --td-size-16 | 28, 32, 36, 40, 48, 56, 64, 72px | Larger scale values. |
| --td-comp-size-m | 32px | Medium component height alias. |
| --td-comp-paddingLR-m | 12px | Medium horizontal padding alias. |
| --td-comp-paddingTB-l | 16px | Large vertical padding alias. |
| --td-comp-margin-xl | 20px | Spacing alias differs from padding xl. |
| --td-pop-padding-xxl | 16px | Popup padding alias. |

### Corner treatment

[Official reference](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_radius.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --td-radius-small | 2px | Small radius. |
| --td-radius-default | 3px | Default radius. |
| --td-radius-medium | 6px | Medium radius. |
| --td-radius-large | 9px | Large radius. |
| --td-radius-extraLarge | 12px | Extra large radius. |
| --td-radius-round | 999px | Pill treatment. |
| --td-radius-circle | 50% | Circular treatment requires equal dimensions. |

### Form and table contracts

[Official reference](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/form/_example/base.tsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Form.useForm() | [form] | Pass the instance to Form. |
| FormItem name | Registered field key | Must match submitted fields and setFields errors. |
| Form onSubmit | event.validateResult === true | Gate application updates on successful validation. |
| form.setFields | name + status + validateMessage | Set a concrete field error. |
| FormItem for | Input association | Official Switch example uses for="status". |

### Data table configuration

[Official reference](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/table/type.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| rowKey | Stable unique data property | The example generates id once per rule. |
| columns[].colKey | Data key or custom cell key | Use a dedicated action column. |
| columns[].cell | ({row,col,rowIndex,colIndex}) | Render row-specific controls. |
| tableLayout | fixed by default; auto available | Decide column widths for long resource paths. |
| disableDataPage | false by default | Local pagination is handled by Table unless explicitly disabled. |

## TDesign Design System A console system with explicit implementation families

### Choose the React implementation

TDesign has separate framework implementations. This example deliberately uses tdesign-react, not a similarly named Vue package or the mobile component set. The global stylesheet is part of the integration: importing a component alone does not supply the shown layout and theme rules.

The useful unit is a registered Form beside a structured Table. Name, resource path, and enabled are data fields; row removal is a table action. A page-wide claim that an API is now protected would be false because this example has no authorization backend.

[Supporting specification](https://github.com/Tencent/tdesign-react)

## TDesign Design System Semantic colors, including real dark-mode differences

### Brand step seven is not universal across modes

The light theme resolves the brand role through step seven, while the dark theme resolves it through step eight. Preserve the semantic variable in application CSS instead of copying the light blue into every component. The dark canvas is #181818 and its container is #242424; those roles are separate surfaces.

The preview intentionally stays in light mode. In a native implementation, set theme-mode="dark" on the document root to select the published dark rules; scope any custom policy illustration separately rather than recoloring every image through a filter.

```js
document.documentElement.setAttribute('theme-mode', 'dark');
// Restore the published light theme:
document.documentElement.setAttribute('theme-mode', 'light');
```

[Code reference](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_dark.less)

[Supporting specification](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_dark.less)

## TDesign Design System Dense typography without losing field meaning

### Use full font roles

Body medium supplies a 14px size and 22px line height. Title medium adds a 600 weight at 16/24; the small headline uses 24/32. These are distinct jobs: table data, panel labels, and the page title should not all become bold body text.

The source font family names available system fonts. Add a sensible sans-serif fallback in application-owned typography and verify Chinese and Latin strings at the same time. A resource path can use a monospace application style without claiming it is a TDesign type token.

[Supporting specification](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_font.less)

## TDesign Design System Map size aliases to the actual region

### Spacing names are not interchangeable

Medium horizontal component padding resolves to 12px, but extra-large component margin resolves to 20px. Do not translate all semantic suffixes through a single guessed scale. The editor uses 24px outer padding and smaller field spacing to keep controls grouped.

The standalone preview stacks its editor above the rule list at narrow widths. That breakpoint is an application decision, not a framework guarantee. Long API paths wrap in the list instead of forcing the entire page wider than the viewport.

[Supporting specification](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_size.less)

## TDesign Design System Register, validate, then add a rule

### Keep the field error attached to its key

The Form instance is passed to the Form component; each FormItem supplies the field name. The submit handler first checks validateResult, then reads the collected fields. Application checks normalize strings and reject duplicate paths, so two labels cannot silently configure the same example endpoint.

1. Register name, path, and enabled using FormItem keys.
2. Reject missing names and paths that do not begin with / before adding data.
3. Use setFields with the same field key to display the error and leave the typed values available for correction.
4. Append a stable id only after the checks pass; announce that the result is local.

[Supporting specification](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/form/_example/base.tsx)

## TDesign Design System Let row identity survive edits and removal

### Separate display data from action cells

The table gets its id field through rowKey. The enabled column maps a Boolean to readable text rather than showing an unlabeled color dot. The action column renders a button with the row name, avoiding three indistinguishable Remove controls for assistive technology.

For a small rule set, the full table can remain unpaginated. If pagination is introduced, distinguish built-in local slicing from server-driven data before setting disableDataPage. Reusing array positions as identity is unsafe when removal changes their order.

- name is the human-facing label; path is the resource identity.
- enabled is application data and is rendered with explicit text.
- actions is a custom column and does not need a matching stored property.

[Supporting specification](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/table/type.ts)

## TDesign Design System Local state is not a deployed policy

### Test the policy editor as an editor

The offline preview uses native labeled controls, a live status region, and keyboard-visible focus. Submitting an empty name or a duplicate path must keep the form open and identify the concrete problem. Removing a rule changes only the local list.

A production service still needs server validation, authorization, conflict handling, audit logging, and recovery from a rejected save. Those concerns should be designed around this editor, not simulated with a success toast that claims deployment.

[Supporting specification](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/form/_example/base.tsx)

## TDesign Design System Integrate the package and keep the specimen honest

### Use the native example for application code

The React example imports actual TDesign Form, Input, Switch, Button, and Table components. The embedded preview is a self-contained HTML/CSS interpretation so it works without a package download or network access. Its interaction checks do not establish that every library dependency has compiled in your project.

The linked theme files are current development sources. Resolve the installed release in a lockfile and compare its tokens before copying custom overrides. This page intentionally documents role names and source provenance so that a later theme change can be evaluated rather than hidden behind an illustrative palette.

[Supporting specification](https://github.com/Tencent/tdesign-react)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Standalone HTML/CSS interpretation of TDesign light tokens and Form/Table composition; not the native React runtime.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TDesign API rule editor</title><style>
*{box-sizing:border-box}body{margin:0;background:#eee;color:rgba(0,0,0,.9);font:14px/22px Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:#fff;border-bottom:1px solid #ddd}.mark{font-weight:700;color:#0052d9;font-size:20px}.tag{background:#f2f3ff;color:#003cab;padding:4px 8px;border-radius:3px}main{padding:24px;max-width:1100px;margin:auto}h1{font-size:24px;line-height:32px;margin:0 0 8px}h2{font-size:16px;line-height:24px;margin:0 0 20px}.sub{color:rgba(0,0,0,.6);margin:0 0 24px}.layout{display:grid;grid-template-columns:310px minmax(0,1fr);gap:16px}.panel{background:white;border:1px solid #e8e8e8;border-radius:6px;padding:24px}label{display:block;margin-bottom:6px}input[type=text]{width:100%;height:36px;border:1px solid #ddd;border-radius:3px;padding:0 12px;font:inherit;margin-bottom:4px}input:focus,button:focus-visible{outline:2px solid #0052d9;outline-offset:3px}.hint{font-size:12px;color:#666;margin:0 0 20px}.toggle{display:flex;gap:8px;align-items:center;margin:18px 0 24px}.toggle input{accent-color:#0052d9;width:18px;height:18px}.toggle label{margin:0}button{font:inherit;border:1px solid #ddd;border-radius:3px;padding:5px 12px;background:white;color:#0052d9;cursor:pointer}button:hover{background:#f2f3ff}.primary{background:#0052d9;color:white;border-color:#0052d9;width:100%;margin-top:8px}.primary:hover{background:#366ef4}.error{color:#ad352f;min-height:22px;margin:0}.listhead{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e8e8e8;padding-bottom:16px;margin-bottom:0}.listhead h2{margin:0}.row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:20px 0;border-bottom:1px solid #e8e8e8}.row strong{display:block;font-weight:600}.path{display:block;overflow-wrap:anywhere;font:12px/20px monospace;color:#666}.state{font-size:12px;color:#003cab}.row button{align-self:center;font-size:12px}.diagram{margin-top:24px;padding:16px;background:#f2f3ff;border-radius:3px;display:flex;align-items:center;gap:12px}.node{padding:8px 12px;background:white;border:1px solid #b5c7ff;border-radius:3px}.diagram span{color:#0052d9}.status{font-size:12px;color:#555;min-height:20px;margin:20px 0 0}.foot{font-size:12px;color:#666;margin:20px 0 0}#empty{padding:24px 0;color:#666}@media(max-width:680px){header{padding:16px}.layout{grid-template-columns:1fr}main{padding:20px 16px}.panel{padding:20px}.diagram{flex-wrap:wrap}.tag{font-size:12px}}
</style><header><span class="mark">T / Console</span><span class="tag">Local policy workspace</span></header><main><h1>API access rules</h1><p class="sub">Define which resources belong in your draft policy.</p><div class="layout"><section class="panel"><h2>Create a rule</h2><form id="editor" novalidate><label for="name">Rule name</label><input type="text" id="name" aria-describedby="error"><p class="hint">A short label your team can recognize.</p><label for="path">Resource path</label><input type="text" id="path" placeholder="/reports" aria-describedby="path-help error"><p class="hint" id="path-help">Start with /. Each path must be unique.</p><div class="toggle"><input id="enabled" type="checkbox" checked><label for="enabled">Enabled in this draft</label></div><p class="error" id="error" role="alert"></p><button class="primary">Add local rule</button></form><p class="foot">This editor does not connect to an API gateway.</p></section><section class="panel"><div class="listhead"><h2>Policy rules</h2><span id="count" class="tag"></span></div><div id="rules"></div><div class="diagram" aria-label="Illustrative policy flow"><div class="node">Client</div><span aria-hidden="true">→</span><div class="node">Policy draft</div><span aria-hidden="true">→</span><div class="node">Resource</div></div><p class="status" id="status" role="status">Two example rules are loaded locally.</p></section></div><p class="foot">HTML interpretation of TDesign light theme roles · Native React integration is provided in the guide.</p></main><script>
const $=id=>document.getElementById(id);let rules=[{id:1,name:'Reports read access',path:'/reports',enabled:true},{id:2,name:'Billing export',path:'/billing/export',enabled:false}];let next=3;
function render(){const host=$('rules');host.replaceChildren();$('count').textContent=rules.length+' rules';if(!rules.length){const p=document.createElement('p');p.id='empty';p.textContent='No rules in this draft. Add a resource to begin.';host.append(p)}for(const rule of rules){const row=document.createElement('div');row.className='row';const copy=document.createElement('div'),name=document.createElement('strong'),path=document.createElement('code'),state=document.createElement('span'),remove=document.createElement('button');name.textContent=rule.name;path.textContent=rule.path;path.className='path';state.textContent=rule.enabled?'Enabled':'Disabled';state.className='state';copy.append(name,path,state);remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+rule.name);remove.onclick=()=>{rules=rules.filter(x=>x.id!==rule.id);render();$('status').textContent='Removed '+rule.name+' from this local draft.';$('name').focus()};row.append(copy,remove);host.append(row)}}
$('editor').onsubmit=e=>{e.preventDefault();$('error').textContent='';for(const id of ['name','path'])$(id).removeAttribute('aria-invalid');const name=$('name').value.trim(),path=$('path').value.trim();const fail=!name?['name','Enter a rule name.']:!path.startsWith('/')?['path','Start the resource path with /.']:rules.some(r=>r.path===path)?['path','This path already has a rule.']:null;if(fail){$('error').textContent=fail[1];$(fail[0]).setAttribute('aria-invalid','true');$(fail[0]).focus();return}rules.push({id:next++,name,path,enabled:$('enabled').checked});render();$('status').textContent='Added '+name+' locally. No policy was deployed.';$('name').value='';$('path').value='';$('name').focus()};render();
</script></html>

```

[Code reference](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/form/_example/base.tsx)

- Rules exist only in the visible sample collection. Native Form registration, validation callbacks and Table rendering are demonstrated separately in React.

### Registered rule editor and row-specific removal

Form collects name, resource path, and enabled state. Application validation catches empty names, malformed paths, and duplicate resources before a local Table row is added.

```jsx
// npm install tdesign-react react react-dom
// main.jsx — a client-side React entry point
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, Form, Input, Switch, Table} from 'tdesign-react';
import 'tdesign-react/es/style/index.css';
const {FormItem} = Form;
function AccessRules() {
  const [form] = Form.useForm();
  const [rules, setRules] = useState([]);
  const [notice, setNotice] = useState('No local rules yet.');
  const addRule = ({validateResult, fields}) => {
    if (validateResult !== true) return;
    const name = String(fields.name || '').trim();
    const path = String(fields.path || '').trim();
    const invalid = !name ? ['name','Enter a rule name.'] :
      !path.startsWith('/') ? ['path','Start the resource path with /.'] :
      rules.some(rule => rule.path === path) ? ['path','This path already has a rule.'] : null;
    if (invalid) {
      form.setFields([{name:invalid[0],status:'error',validateMessage:{type:'error',message:invalid[1]}}]);
      setNotice(invalid[1]); return;
    }
    setRules(previous => [...previous, {id:crypto.randomUUID(),name,path,enabled:!!fields.enabled}]);
    setNotice(`Added ${name} to this browser session. No access policy was deployed.`);
  };
  const columns = [
    {colKey:'name', title:'Rule'}, {colKey:'path', title:'Resource'},
    {colKey:'enabled', title:'State', cell:({row}) => row.enabled ? 'Enabled' : 'Disabled'},
    {colKey:'actions', title:'Action', cell:({row}) => <Button variant="text" onClick={() => {
      setRules(previous => previous.filter(item => item.id !== row.id));
      setNotice(`Removed ${row.name} locally.`);
    }}>Remove {row.name}</Button>}
  ];
  return <main style={{padding:24,maxWidth:960,margin:'auto',font:'var(--td-font-body-medium)'}}>
    <h1>API access rules</h1>
    <Form form={form} onSubmit={addRule} labelWidth={100}>
      <FormItem name="name" label="Rule name"><Input /></FormItem>
      <FormItem name="path" label="Resource path"><Input placeholder="/reports" /></FormItem>
      <FormItem name="enabled" label="Enabled" for="enabled"><Switch /></FormItem>
      <FormItem><Button type="submit" theme="primary">Add local rule</Button></FormItem>
    </Form>
    <p role="status">{notice}</p>
    <Table rowKey="id" data={rules} columns={columns} bordered hover />
  </main>;
}
createRoot(document.getElementById('root')).render(<AccessRules />);
```

[Code reference](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/form/_example/base.tsx)

- Table column and rowKey contracts are linked in the specification above.
- This example changes local React state only; an enabled label is not an authorization decision.
- The installation/API example was checked against official source; package compilation is separate from the tested offline preview.

## Implementation Starting Point

Use the complete client entry example above with an HTML root element. Import tdesign-react/es/style/index.css once. Pin versions and test against your build tool before shipping.

```bash
npm install tdesign-react react react-dom
```

## Agent Prompt

Use tdesign-react Form and Table for an API rule editor. Preserve semantic --td-* roles, registered field keys, stable row ids, explicit validation, and truthful local-state messages.

## Sources

- [TDesign React](https://github.com/Tencent/tdesign-react) — Package installation and implementation family.
- [Light theme](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_light.less) — Semantic light color mappings.
- [Dark theme](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_dark.less) — Dark root selector and role mappings.
- [Typography](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_font.less) — Font, size and line-height definitions.
- [Size tokens](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_size.less) — Base and semantic spacing aliases.
- [Radii](https://raw.githubusercontent.com/Tencent/tdesign-common/develop/style/web/theme/_radius.less) — Published corner values.
- [Form example](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/form/_example/base.tsx) — Registration, submit and field error APIs.
- [Table types](https://raw.githubusercontent.com/Tencent/tdesign-react/develop/packages/components/table/type.ts) — Row identity and column rendering contracts.
