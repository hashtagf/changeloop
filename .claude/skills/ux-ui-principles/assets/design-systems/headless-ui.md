# Headless UI Design System — OpenDesign Application Guide

Headless UI provides unstyled React interaction components for dialogs, listboxes and switches. This guide focuses on composing their native focus, selection and popup behavior with ordinary CSS, using a document-sharing flow as the working example.

Original OpenDesign visual configuration and React example using native Headless UI 2.2.10 behavior. CSS values are explicitly application choices; Headless UI does not provide this theme. Invitations and permission changes exist only in local preview memory.

## Source Reference

- **Library scope:** Unstyled interface components ([source](https://headlessui.com/))
- **Platform or architecture:** React and Vue implementations are documented ([source](https://headlessui.com/react/dialog))
- **Integration:** Dialog open state is application controlled ([source](https://headlessui.com/react/dialog))
- **Component support:** DialogPanel defines dialog content ([source](https://headlessui.com/react/dialog))
- **Customization or behavior:** DialogTitle supplies the dialog heading ([source](https://headlessui.com/react/dialog))
- **Additional capability:** Dialog handles dismissal callbacks for Escape and outside interaction ([source](https://headlessui.com/react/dialog))


## Design Reference

Headless UI has no official visual token scale. Every numeric or color value below belongs to this OpenDesign example; the linked documentation supplies behavior and state APIs. Package tested: @headlessui/react 2.2.10.

### Original CSS color roles

[Official reference](https://headlessui.com/react/dialog)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --canvas | #f5f5f4 | Document workspace. |
| --surface | #ffffff | Paper, access panel, and dialog. |
| --ink | #1c1917 | Primary text. |
| --muted | #57534e | Secondary copy. |
| --line | #d6d3d1 | Panel and input borders. |
| --accent | #4338ca | Primary action and focus outline. |
| --accent-soft | #eef2ff | Focused option and avatar background. |
| --error | #b91c1c | Invalid email text and border. |

### Original spacing and geometry

[Official reference](https://headlessui.com/react/dialog)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --space-1 / --space-2 | 4px / 8px | Small increments. |
| --space-3 / --space-4 | 12px / 16px | Control gaps and mobile inset. |
| --space-6 / --space-8 | 24px / 32px | Panel padding and major separation. |
| --radius-control | 8px | Buttons and inputs. |
| --radius-panel | 16px | Paper and dialog. |
| .dialog-panel width | min(100%, 460px) | Bounded overlay on narrow screens. |
| .dialog-panel max-height | calc(100% - 16px) | Leaves space inside the fixed positioning container. |

### Original type and responsive choices

[Official reference](https://headlessui.com/react/dialog)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Body | 16px / 1.5 system-ui | No external font required. |
| Screen title | 28px / 1.25 | Document identity. |
| Document headline | 32px; 26px below 700px | Editorial content hierarchy. |
| Dialog heading | 20px / 1.3 | Names the sharing task. |
| Labels and helper copy | 14px | Field context. |
| Error and access description | 13px | Persistent feedback. |
| Breakpoint | 700px | Document and access panels stack. |

### Native interaction contracts

[Official reference](https://headlessui.com/react/listbox)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Dialog open / onClose | Controlled boolean / dismissal callback | Escape and outside interaction request dismissal; they do not save. |
| DialogPanel | Content boundary | Backdrop and positioning wrapper sit outside this boundary. |
| Listbox value / onChange | Controlled permission string | Keyboard selection updates the selected permission. |
| data-focus / data-selected | Native state attributes | CSS separates keyboard focus from confirmed selection. |
| Switch checked / onChange | Controlled boolean | data-checked styles its visual state. |

## Headless UI Design System Compose the Behavior Before Styling the Screen

### Compose the Behavior Before Styling the Screen

Dialog, Listbox and Switch each model a different interaction. Dialog controls a bounded task and its focus context; Listbox represents one committed choice; Switch represents an independent Boolean setting. Combining them does not require combining their state: the invitation draft, selected permission and public-link setting remain separate.

The example uses the React component API with direct imports such as DialogPanel and ListboxButton. Its dialog contains a listbox, so popup positioning and dismissal must work inside an existing overlay. Start with that composition before adding the document panel and access summary around it. The supplied CSS is one complete appearance for these native parts.

## Headless UI Design System Dialog, Listbox, and Switch Anatomy

### Keep the overlay boundaries intentional

DialogBackdrop is a sibling of the fixed positioning container. DialogPanel is the bounded white panel inside that container; it does not fill the viewport. DialogTitle names the task and Description explains what closing does. The native input has data-autofocus, and Headless UI manages the surrounding dialog focus behavior.

[Supporting specification](https://headlessui.com/react/dialog)

### A listbox selects a value; a switch changes a boolean

ListboxButton shows the selected role. ListboxOptions uses anchor="bottom" and a width based on --button-width, so the popup aligns with its trigger. Each ListboxOption has a stable string value. Native data-focus and data-selected attributes drive two distinct CSS treatments.

The public-link Switch sits in Field with Label, rather than an unlabeled painted pill. Its checked state changes the accessible control and the visible explanatory sentence. The local invitation is independent of the public-link setting.

[Supporting specification](https://headlessui.com/react/listbox)

## Headless UI Design System Separate Selection, Dismissal, and Local Confirmation

### The state model used here

Opening initializes a fresh recipient draft and the Can view role. Cancel, Escape, and an outside click close the dialog; none adds a recipient. Submitting validates the email, rejects an address already present, then appends an invitation to memory and closes. The confirmation explicitly says no email was sent.

The permission listbox changes the draft role, not the existing recipient’s access. Public-link state changes a separate boolean. This avoids the common mistake of treating every close event as permission persistence.

- Invalid input: keep the dialog open and associate the error with the email.
- Duplicate recipient: leave the existing access list unchanged.
- Accepted local invitation: update the list and announce the preview-only result.

## Headless UI Design System Style Selection and Keyboard Position Independently

### Style Selection and Keyboard Position Independently

ListboxOption exposes data-focus and data-selected for different conditions. The focused option receives the pale accent treatment, while the committed permission receives a check mark. A keyboard user can therefore move through alternatives without losing track of the existing choice.

The same distinction applies outside the popup: the error role belongs to the invalid recipient field, while the Switch’s checked appearance belongs to public-link access. Scope CSS to the component state it describes. A broad selector that colors every focused or checked element identically would obscure these different meanings.

```css
:root { --accent: #4338ca; --accent-soft: #eef2ff; --error: #b91c1c; }
.role-option[data-focus] { background: var(--accent-soft); }
.role-option[data-selected] .selected { visibility: visible; }
```

[Code reference](https://headlessui.com/react/listbox)

## Headless UI Design System Make Document Identity and Permissions Readable

### Type settings that can be reproduced

The document title is 28px with a 1.25 line height, while the dialog title is 20px with a 1.3 line height. Body text is 16px/1.5 in the platform system font. Field labels and helper copy are 14px. These exact values are in style.css; readers do not need to infer them from a screenshot.

The email in the access list uses overflow-wrap:anywhere so an address cannot force its column wider. The permission remains on a separate line. Inside the dialog, the complete document title and selected permission are visible at the moment the invitation is added.

## Headless UI Design System Complete Overlay Positioning and Responsive CSS

### The layout is not hidden in a prerequisite

The supplied stylesheet includes the entire overlay: fixed inset positioning, backdrop opacity, z-index, maximum width, vertical scrolling, and padding. Below 700px the document panels stack, and the dialog reduces its padding. No Tailwind build is assumed.

Keep the positioning container distinct from DialogPanel. The container covers the available viewport and provides edge padding; the panel provides the bounded content surface. Give longer dialog content a scrolling region so the recipient field, permission choice and dismissal actions remain reachable at narrow widths.

```css
.dialog-position { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; }
.dialog-panel { width: min(100%, 460px); max-height: calc(100% - 16px); overflow-y: auto; }
```

[Code reference](https://headlessui.com/react/dialog)

## Headless UI Design System Use Native State and Focus Behavior

### Keyboard verification

Open the dialog and verify initial focus on the recipient. Reach the permission trigger with Tab; use arrow keys and Enter to choose a role. Escape dismisses the active popup or dialog according to the native component’s current focus context. After closing the dialog, focus should return to the sharing trigger.

The email uses aria-invalid and aria-describedby for its custom error. The check mark in an option is decorative because Listbox supplies selection semantics. The public-link control has a visible Label and the explanatory sentence remains after toggling. Reduced-motion CSS removes the decorative switch-thumb transition.

[Supporting specification](https://headlessui.com/react/switch)

## Headless UI Design System Use One React API Generation Consistently

### Use One React API Generation Consistently

The complete React entry mounts App, whose stylesheet supplies the overlay geometry and state selectors. DialogPanel, DialogBackdrop, ListboxButton and ListboxOptions are direct imports in the verified 2.2.10 example. Older compound-component spellings should be migrated deliberately instead of mixed into this composition.

ListboxOptions uses anchor="bottom" and the native --button-width variable to align the options to the trigger. Those details are part of the integration, not optional decoration: removing the positioning container or replacing the width with an unrelated fixed value can break a nested popup even when the closed field still looks correct.

1. Install @headlessui/react in the React project.
2. Save App.jsx and style.css from the examples, then replace main.jsx as shown.
3. Run the development server and test dialog dismissal, permission selection, and duplicate-email recovery.

## Headless UI Design System Inspect a Real Permission Interaction

### Acceptance conditions

A useful review begins with a document and an existing recipient, not an empty component gallery. Add a valid invitation as Can comment, then reopen and try the same email. Confirm that the original row is retained and the duplicate produces a specific error. Turn on the public link and inspect its independent explanation.

The example demonstrates local UI state only. It provides neither recipient search nor a sharing backend. Connecting a real service requires a pending/error response model and an explicit policy for concurrent permission changes; the native primitives do not decide authorization rules.

## Component Examples

### App.jsx — native sharing composition

Complete controlled Dialog, permission Listbox, labeled Switch, and local validation.

```jsx
import React, { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description, Listbox, ListboxButton, ListboxOptions, ListboxOption, Switch, Field, Label } from '@headlessui/react';
import './style.css';
const roles = ['Can view', 'Can comment', 'Can edit'];
export default function App() {
 const [open,setOpen]=useState(false),[role,setRole]=useState(roles[0]),[publicLink,setPublicLink]=useState(false),[email,setEmail]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [people,setPeople]=useState([{email:'alex@example.test',role:'Can edit'}]);
 const start=()=>{setEmail('');setError('');setRole(roles[0]);setOpen(true)};
 const submit=e=>{e.preventDefault();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Enter a complete email address.');return;}if(people.some(p=>p.email===email)){setError('This person already appears in the access list.');return;}setPeople([...people,{email,role}]);setOpen(false);setNotice('Invitation added to this local example only. No email was sent.');};
 return <main className='sharing-shell'>
  <header><div><span className='eyebrow'>HEADLESS UI / CUSTOM SURFACE</span><h1>Quarterly brief</h1><p className='muted'>Research · Updated today</p></div><button className='primary' onClick={start}>Share document</button></header>
  <div className='document-grid'><article className='paper'><span className='tag'>WORKING DOCUMENT</span><h2>Make the next decision clearer.</h2><p>Three research priorities for the coming quarter, shared with the people who need to review them.</p><div className='rule'/><h3>01 / Understand the handoff</h3><p>Compare where context is lost between research notes and the next product decision.</p><h3>02 / Review access deliberately</h3><p>Keep editing rights separate from the ability to read a document.</p></article>
  <aside className='access'><h2>People with access</h2><p className='muted'>The list below is local demonstration state.</p>{people.map((p,i)=><div className='person' key={p.email}><span className='avatar'>{i===0?'AK':'+'}</span><div><strong>{p.email}</strong><small>{p.role}</small></div></div>)}<Field className='link-setting'><Label>Public link</Label><Switch checked={publicLink} onChange={setPublicLink} className='switch'><span /></Switch></Field><p className='link-detail'>{publicLink?'Anyone with the example link could view this document. This changes only the local preview.':'Restricted to the named people in this example.'}</p><p role='status' className='notice'>{notice}</p></aside></div>
  <Dialog open={open} onClose={()=>setOpen(false)} className='dialog-root'><DialogBackdrop className='backdrop'/><div className='dialog-position'><DialogPanel className='dialog-panel'><DialogTitle as='h2'>Share quarterly brief</DialogTitle><Description className='muted'>Choose one recipient and a permission. Closing discards this invitation draft.</Description><form noValidate onSubmit={submit}><label className='field-label' htmlFor='recipient'>Recipient email</label><input id='recipient' data-autofocus type='email' value={email} onChange={e=>{setEmail(e.target.value);setError('')}} aria-invalid={!!error} aria-describedby={error?'email-error':undefined} placeholder='jules@example.test'/>{error&&<p id='email-error' role='alert' className='error'>{error}</p>}<Listbox value={role} onChange={setRole}><Label className='field-label'>Permission</Label><ListboxButton className='role-button'>{role}<span aria-hidden='true'>⌄</span></ListboxButton><ListboxOptions anchor='bottom' className='role-options'>{roles.map(value=><ListboxOption key={value} value={value} className='role-option'><span>{value}</span><span className='selected' aria-hidden='true'>✓</span></ListboxOption>)}</ListboxOptions></Listbox><p className='muted permission-help'>{role==='Can edit'?'May change document content in this example.':role==='Can comment'?'May add comments without editing content.':'May read the document without changing it.'}</p><div className='dialog-actions'><button type='button' onClick={()=>setOpen(false)}>Cancel</button><button className='primary' type='submit'>Add invitation</button></div></form></DialogPanel></div></Dialog>
  <footer>Native Dialog, Listbox, and Switch behavior. Original CSS below supplies all visual values; Headless UI does not ship this palette.</footer>
 </main>;
}

```

[Code reference](https://headlessui.com/react/dialog)

- No email or request is sent.
- Escape and cancel discard the unsaved invitation.

### style.css — complete original visual system

All visual tokens, state selectors, overlay placement, and responsive rules required by App.jsx. These are example choices, not official Headless UI defaults.

```css
:root{--canvas:#f5f5f4;--surface:#fff;--ink:#1c1917;--muted:#57534e;--line:#d6d3d1;--accent:#4338ca;--accent-soft:#eef2ff;--error:#b91c1c;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-6:24px;--space-8:32px;--radius-control:8px;--radius-panel:16px;font:16px/1.5 system-ui,sans-serif;color:var(--ink);background:var(--canvas)}*{box-sizing:border-box}body{margin:0}button,input{font:inherit}button{cursor:pointer;border:1px solid var(--line);border-radius:var(--radius-control);padding:10px 16px;background:var(--surface);color:var(--ink);font-weight:600}button:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.primary{background:var(--accent);color:white;border-color:var(--accent)}.sharing-shell{max-width:1120px;margin:auto;padding:32px}.sharing-shell>header{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:32px}.eyebrow{font-size:11px;letter-spacing:.1em;color:var(--accent);font-weight:700}h1{font-size:28px;line-height:1.25;margin:8px 0}h2{font-size:20px;line-height:1.3;margin:0 0 12px}h3{font-size:16px;margin:24px 0 8px}p{margin:0 0 16px}.muted{color:var(--muted);font-size:14px}.document-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr);gap:24px}.paper,.access{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-panel);padding:32px}.paper h2{font-size:32px;max-width:15ch;margin-top:24px}.paper p{max-width:48ch}.tag{font-size:11px;font-weight:600;border:1px solid var(--line);padding:4px 8px;border-radius:4px}.rule{height:1px;background:var(--line);margin:24px 0}.person{display:flex;gap:12px;padding:16px 0;border-bottom:1px solid var(--line)}.person strong{display:block;font-size:14px;overflow-wrap:anywhere}.person small{color:var(--muted)}.avatar{flex:none;width:32px;height:32px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font-size:12px}.link-setting{display:flex;align-items:center;justify-content:space-between;margin-top:24px;font-weight:600}.switch{padding:3px;width:44px;height:26px;border:0;border-radius:999px;background:#a8a29e}.switch span{display:block;width:20px;height:20px;border-radius:50%;background:white;transition:transform .15s}.switch[data-checked]{background:var(--accent)}.switch[data-checked] span{transform:translateX(18px)}.link-detail{margin-top:12px;font-size:13px;color:var(--muted)}.notice{font-size:13px;color:var(--accent)}footer{font-size:12px;color:var(--muted);margin-top:24px}.dialog-root{position:fixed;inset:0;z-index:20}.backdrop{position:fixed;inset:0;background:rgb(28 25 23/.45)}.dialog-position{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}.dialog-panel{width:min(100%,460px);max-height:calc(100% - 16px);overflow-y:auto;background:var(--surface);padding:32px;border-radius:var(--radius-panel);box-shadow:0 24px 64px rgb(0 0 0/.22)}.field-label{display:block;font-size:14px;font-weight:600;margin:20px 0 8px}input[type=email]{display:block;width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:var(--radius-control);background:white;color:var(--ink)}input[aria-invalid=true]{border-color:var(--error)}.error{font-size:13px;color:var(--error);margin:8px 0}.role-button{display:flex;justify-content:space-between;width:100%;text-align:left}.role-options{z-index:30;width:var(--button-width);--anchor-gap:4px;background:var(--surface);border:1px solid var(--line);padding:4px;border-radius:8px;box-shadow:0 8px 24px rgb(0 0 0/.12);outline:none}.role-option{display:flex;justify-content:space-between;padding:10px;border-radius:4px;cursor:pointer;font-size:14px}.role-option[data-focus]{background:var(--accent-soft)}.role-option .selected{visibility:hidden;color:var(--accent)}.role-option[data-selected] .selected{visibility:visible}.permission-help{margin-top:12px}.dialog-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}@media(max-width:700px){.sharing-shell{padding:20px}.sharing-shell>header{align-items:flex-start;flex-direction:column}.document-grid{grid-template-columns:1fr}.paper,.access{padding:24px}.paper h2{font-size:26px}.dialog-panel{padding:24px}}@media(prefers-reduced-motion:reduce){.switch span{transition:none}}

```

[Code reference](https://headlessui.com/react/listbox)

- Keep data-focus and data-selected distinct.
- There is no Tailwind prerequisite.

## Implementation Starting Point

The full styling and component files are supplied above. Requires the Node version supported by the selected Vite release. The demo bundles the same native component package locally.

```text
# Terminal
npm create vite@latest sharing-demo -- --template react
cd sharing-demo
npm install
npm install @headlessui/react@2.2.10

# Save the complete examples as src/App.jsx and src/style.css.
# Replace src/main.jsx with:
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App/>);

# Terminal
npm run dev
```

## Agent Prompt

Use the supplied Headless UI App.jsx and style.css. Preserve the native Dialog, Listbox, and Switch composition, separate draft permissions from confirmed access, and keep all focus and selected-state selectors. Replace the local invitation append with our authorized API, including pending and failed states; never save on onClose. Do not describe the custom CSS palette as an official Headless UI theme.

## Sources

- [Dialog API](https://headlessui.com/react/dialog) — Official interaction, composition, and state reference.
- [Listbox API](https://headlessui.com/react/listbox) — Official interaction, composition, and state reference.
- [Switch API](https://headlessui.com/react/switch) — Official interaction, composition, and state reference.
