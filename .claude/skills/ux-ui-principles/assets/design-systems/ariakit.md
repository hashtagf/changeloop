# Ariakit Design System — OpenDesign Application Guide

Ariakit supplies unstyled React components with explicit shared state and composable accessible parts. Its combobox separates typed input from committed selection, making it useful for search-driven pickers; the reference finder below demonstrates that distinction with grouped and unavailable results.

Ariakit React 0.4.40. All visual tokens, artwork and sample reference values are original configuration; no official Ariakit palette or typography scale is claimed. Reading-list state is local.

## Source Reference

- **Library scope:** React toolkit ([source](https://ariakit.com/))
- **Platform or architecture:** Provides unstyled primitive components ([source](https://ariakit.com/guide/getting-started))
- **Integration:** Includes styled examples ([source](https://ariakit.com/guide/getting-started))
- **Component support:** Includes menu components ([source](https://ariakit.com/guide/getting-started))
- **Customization or behavior:** Includes dialog components ([source](https://ariakit.com/guide/getting-started))
- **Additional capability:** Includes combobox and form-related components ([source](https://ariakit.com/guide/getting-started))


## Design Reference

Ariakit React 0.4.40 is an unstyled accessibility toolkit. It does not publish the page palette, font scale or spacing below as a native design theme. All --app-* values are an explicit original configuration used by this runnable specimen; component names and state attributes are Ariakit APIs.

### Original semantic color configuration

[Official reference](https://ariakit.com/guide/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --app-canvas | #f5f3ee | Page background. |
| --app-surface | #fff | Combobox popover and reference card. |
| --app-text | #292e29 | Main readable text. |
| --app-muted | #657064 | Secondary labels and hints. |
| --app-border | #d8ddd4 | Input and card boundaries. |
| --app-action | #285f48 | Primary action and focus ring. |
| --app-on-action | #fff | Text on the primary action. |
| --app-active | #e3eee4 | Active-option and selected-action surface. |

### Original geometry and spacing

[Official reference](https://ariakit.com/guide/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --app-radius | 10px | Input, popover and reference-card radius. |
| --app-space-1 | 8px | Declared original spacing scale. |
| --app-space-2 | 16px | Declared original spacing scale. |
| --app-space-3 | 24px | Declared original spacing scale. |
| --app-space-4 | 32px | Declared original spacing scale. |
| Combobox padding | 13px 48px 13px 14px | Leaves space for the disclosure control. |
| Popover maximum height | 340px | Local scrolling for a longer result list. |
| Popover gutter | 8px | Actual gutter prop separating input and suggestions. |

### Original typography

[Official reference](https://ariakit.com/guide/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Font family | system-ui, sans-serif | No font download or Ariakit-specific font is required. |
| Page heading | 36px / 1.1; 30px mobile | Original page hierarchy. |
| Input text | 15px | Original combobox text size. |
| Option text | 14px | Original result label size. |
| Group label | 11px, uppercase, 700 | Original visible grouping style. |
| Supporting hint | 12px / 1.7 | Keyboard instruction rhythm. |

### Native composition and state

[Official reference](https://ariakit.com/reference/combobox-provider)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| ComboboxProvider.inputValue | Controlled query string | Current 0.4.40 input state API; setInputValue updates filtering. |
| ComboboxProvider.selectedValue | Controlled reference name | Committed selection is independent of the query. |
| ComboboxGroup / ComboboxGroupLabel | Foundations / Components | Native labeled option groups. |
| ComboboxPopover.sameWidth | true | Tracks the anchor width. |
| ComboboxItem.disabled | true for Experimental grid | Unavailable record cannot be selected. |
| [data-active-item] | CSS state selector | Styles the keyboard-active option independently of selection. |
| Combobox autoSelect | Not enabled in this specimen | Down moves into the list before Enter chooses an option. |

## Ariakit Design System Start with the Combobox State Model

### Start with the Combobox State Model

Ariakit’s ComboboxProvider connects the label, editable input, disclosure, popup and options. The provider owns their shared interaction state while each component supplies its part of the structure. This allows the search field and selected-detail panel to be arranged independently without treating every keystroke as a new selection.

The reference finder demonstrates six records in two named groups. Filtering belongs to the application collection; navigation and option selection belong to the native combobox. Keeping that boundary explicit is useful when replacing static records with another data source: a filtered result set and the currently committed item are not necessarily the same thing.

[Supporting specification](https://ariakit.com/guide/styling)

## Ariakit Design System Search Text and Committed Selection Are Different State

### Search Text and Committed Selection Are Different State

The example controls inputValue and setInputValue for the text being typed, and selectedValue and setSelectedValue for the chosen reference. In the verified 0.4.40 API, inputValue is the current name for the input state; older examples may show the deprecated value/setValue aliases. The complete code uses the current names.

Typing “color” narrows the suggestions but does not immediately replace the displayed detail card. Choosing Color roles commits that item and updates the panel. Clearing the search similarly leaves the last selected reference intact. Treating every partial query as a committed value would make the detail view jump to invalid or nonexistent records.

[Supporting specification](https://ariakit.com/reference/combobox-provider)

## Ariakit Design System Connect Label, Input, Disclosure and Popover

### Connect Label, Input, Disclosure and Popover

ComboboxProvider supplies shared state to ComboboxLabel, Combobox, ComboboxDisclosure and ComboboxPopover. The visible label identifies the input. The disclosure is a separate button with an explicit accessible name, while the popover uses sameWidth and an eight-pixel gutter to stay aligned with the anchor.

Each result is a ComboboxItem with a stable value. Foundations and Components are native ComboboxGroup sections with ComboboxGroupLabel headings. A visually bold heading inserted into an unstructured list would not express the same grouping relationship; the native anatomy carries that relationship along with its keyboard model.

[Supporting specification](https://ariakit.com/components/combobox)

## Ariakit Design System Filter Data Before Rendering Native Items

### Filter Data Before Rendering Native Items

The sample collection contains five available references and one deliberately unavailable Experimental grid. Filtering is an application-level case-insensitive substring match against each reference name. The two groups are rendered only when they contain matching records, avoiding empty headings between results.

A zero-result query produces a specific message that suggests clearing the search or trying “color.” It does not turn the message into a selectable option. The disabled record remains visible when relevant and carries an Unavailable label, while the native disabled prop prevents it from becoming a committed selection.

[Supporting specification](https://ariakit.com/examples/combobox-group)

## Ariakit Design System Verify the Actual Down-and-Enter Path

### Verify the Actual Down-and-Enter Path

The specimen leaves autoSelect off. After typing a query, Down enters the suggestion list and Enter selects the active item. Escape closes the popover. This matches the visible instructions and was verified against the selected detail title, not only against whether a dropdown appeared.

Auto-highlighting can be appropriate in another product, but it changes the starting point of arrow navigation. With a single already-active result, another Down press can move focus back to the input. The example avoids that mismatch and styles the active item through data-active-item, keeping keyboard position distinct from saved reading-list membership.

1. Type “color” and wait for its matching option.
2. Press Down, then Enter, and inspect the Color roles detail panel.
3. Search for an unavailable or nonexistent reference and confirm no unintended selection is committed.

[Supporting specification](https://ariakit.com/components/combobox)

## Ariakit Design System Active Option, Focus Ring and Saved State Have Different Cues

### Active Option, Focus Ring and Saved State Have Different Cues

The input and disclosure use visible focus outlines. The active option receives a pale green background plus a one-pixel internal outline through the native data-active-item attribute. Disabled options reduce emphasis and retain their explicit text label. These styles do not rely on hover alone.

The Add button becomes disabled and changes its text after the selected reference is already in the reading list. That saved state belongs to the application and is separate from the combobox’s currently active result. A pale green saved-action surface avoids representing a disabled action as another enabled primary button.

[Supporting specification](https://ariakit.com/guide/styling)

## Ariakit Design System A Reading List Does Not Replace the Current Reference

### A Reading List Does Not Replace the Current Reference

Adding a reference appends its name to a local array only once; the current reference remains visible so the user can inspect its notes. Each reading-list row has a specifically named Remove button. Removing an entry re-enables Add when that reference is still selected. The count is derived from the array length.

The sample detail content includes type, spacing and component guidance to make the finder useful to explore. Its values are clearly labeled original sample content. A reader must not mistake “Display 36px” in the Type scale record for an Ariakit typography token; Ariakit is not supplying that design language.

[Supporting specification](https://ariakit.com/components/button)

## Ariakit Design System A Popover Needs Room Without Resizing the Whole Page

### A Popover Needs Room Without Resizing the Whole Page

The popover follows the input width and caps its own height at 340px. A larger result collection scrolls inside that boundary while the selected-detail card remains normal document content. Keep the input, disclosure and option popup connected even if the detail card moves to another column; committing an item should still update the same selected record.

At the original 700px breakpoint the finder and detail card stack. The search controls, keyboard hint and reading list remain before the selected card in document order. Decorative reference artwork is hidden from assistive technology because the title and notes provide the actual meaning.

- Constrain a long option list locally while preserving readable item spacing.
- Keep the committed detail panel outside the transient popover.
- Retain visible input labels and keyboard hints on mobile.

[Supporting specification](https://ariakit.com/reference/combobox-popover)

## Ariakit Design System Connect the Provider, Collection and Stylesheet

### Connect the Provider, Collection and Stylesheet

Install @ariakit/react 0.4.40 in the React project and keep the complete provider/component composition from App.jsx. The current example uses inputValue/setInputValue and selectedValue/setSelectedValue as separate controlled pairs. Keep the selected record available even when the current input query filters it out of the popup.

Import the supplied style.css alongside the component. Its data-active-item rule follows the combobox’s keyboard position, while the saved-list styles follow application state. When substituting asynchronously loaded results, preserve those two state channels and the group/option relationships; do not replace the committed detail panel with an intermediate query string.

[Supporting specification](https://ariakit.com/components/combobox)

## Component Examples

### Complete controlled reference finder

Provider, label, input, disclosure, grouped popover items and local reading-list actions.

```jsx
import React,{useState} from 'react';
import * as Ariakit from '@ariakit/react';
const resources=[{name:'Type scale',group:'Foundations',code:'Aa',description:'A compact editorial hierarchy for headings, supporting text and labels.',notes:['Display · 36px / 1.1','Section · 24px / 1.25','Body · 16px / 1.6'],color:'#f0dbc3'},{name:'Color roles',group:'Foundations',code:'◐',description:'Separate surface, text, boundary and action roles before naming brand colors.',notes:['Canvas and raised surface','Primary and muted text','Action and on-action pair'],color:'#d6e5d8'},{name:'Spacing rhythm',group:'Foundations',code:'▥',description:'Use a small set of intervals to show relationships between content groups.',notes:['8px within a compact group','16px between related controls','32px between sections'],color:'#d6dfee'},{name:'Form field',group:'Components',code:'⌑',description:'Keep the label, hint, input and error message in one understandable group.',notes:['Persistent visible label','Hint before an error exists','Error connected to the input'],color:'#e9d8de'},{name:'Navigation menu',group:'Components',code:'☷',description:'A small set of destinations with a visible current location and keyboard access.',notes:['Destination labels describe content','Current item has a text/state cue','Collapsed layout keeps names'],color:'#e7e0c5'},{name:'Experimental grid',group:'Components',code:'▦',description:'Unavailable in this sample collection.',notes:[],color:'#e3e3e3',disabled:true}];
export default function App(){const[query,setQuery]=useState(''),[chosen,setChosen]=useState('Type scale'),[saved,setSaved]=useState([]);const selected=resources.find(x=>x.name===chosen)||resources[0],matches=resources.filter(x=>x.name.toLowerCase().includes(query.toLowerCase()));return <main className="resource-finder"><header><p className="eyebrow">ARIAKIT · ACCESSIBLE PRIMITIVES</p><h1>A reference, within reach.</h1><p>Search a small collection with the keyboard, inspect the result and keep a local reading list.</p></header><div className="finder-grid"><section className="search-area"><Ariakit.ComboboxProvider inputValue={query} setInputValue={setQuery} selectedValue={chosen} setSelectedValue={setChosen}><Ariakit.ComboboxLabel className="label">Find a reference</Ariakit.ComboboxLabel><div className="input-row"><Ariakit.Combobox className="combobox" placeholder="Try type, color or form" /><Ariakit.ComboboxDisclosure className="disclosure" aria-label="Show reference suggestions">⌄</Ariakit.ComboboxDisclosure></div><Ariakit.ComboboxPopover gutter={8} sameWidth className="popover">{['Foundations','Components'].map(group=>{const items=matches.filter(x=>x.group===group);return items.length?<Ariakit.ComboboxGroup key={group}><Ariakit.ComboboxGroupLabel className="group-label">{group}</Ariakit.ComboboxGroupLabel>{items.map(x=><Ariakit.ComboboxItem key={x.name} value={x.name} disabled={x.disabled} className="combo-item"><span>{x.name}</span><small>{x.disabled?'Unavailable':x.group==='Foundations'?'Guide':'Pattern'}</small></Ariakit.ComboboxItem>)}</Ariakit.ComboboxGroup>:null})}{!matches.length&&<p className="empty" role="status">No matching reference. Try “color” or clear the search.</p>}</Ariakit.ComboboxPopover></Ariakit.ComboboxProvider><p className="hint">Type to filter. Use ↓ and ↑ to browse, Enter to choose, Escape to close.</p><div className="collection-note"><span>06</span><div><strong>Sample references</strong><p>Five available, one deliberately disabled to show an unavailable item.</p></div></div><section className="reading-list"><h2>Your reading list <small>{saved.length}</small></h2>{saved.length?<ul>{saved.map(name=><li key={name}><span>{name}</span><Ariakit.Button className="remove" onClick={()=>setSaved(saved.filter(x=>x!==name))} aria-label={`Remove ${name}`}>Remove</Ariakit.Button></li>)}</ul>:<p className="muted">Choose a reference, then add it here.</p>}<p className="local-note">This list stays in memory and clears on reload.</p></section></section><section className="reference-card" aria-label="Selected reference"><div className="reference-art" style={{background:selected.color}} aria-hidden="true"><span>{selected.code}</span><i></i></div><div className="reference-body"><p className="eyebrow">{selected.group} · SAMPLE CONTENT</p><h2>{selected.name}</h2><p>{selected.description}</p><ul className="note-list">{selected.notes.map(note=><li key={note}>{note}</li>)}</ul><Ariakit.Button className="primary" disabled={saved.includes(selected.name)} onClick={()=>setSaved([...saved,selected.name])}>{saved.includes(selected.name)?'Added to reading list':'Add to reading list'}</Ariakit.Button><p className="scope-note">These sample reference values are original content, not Ariakit design tokens.</p></div></section></div><p className="selection-status" role="status">Selected reference: {selected.name}</p></main>}

```

[Code reference](https://ariakit.com/components/combobox)

- inputValue is the search string; selectedValue is the committed reference.
- Disabled items remain visible when they match the query.
- The original sample type and spacing values are not Ariakit defaults.

### Complete original visual configuration

Semantic application variables, focus rings, active-option styling and responsive layout.

```css
:root{--app-canvas:#f5f3ee;--app-surface:#fff;--app-text:#292e29;--app-muted:#657064;--app-border:#d8ddd4;--app-action:#285f48;--app-on-action:#fff;--app-active:#e3eee4;--app-radius:10px;--app-space-1:8px;--app-space-2:16px;--app-space-3:24px;--app-space-4:32px;font-family:system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;background:var(--app-canvas);color:var(--app-text)}button,input{font:inherit}.resource-finder{max-width:1080px;padding:32px;margin:auto}.eyebrow{font-size:11px;font-weight:700;letter-spacing:.13em;color:var(--app-muted)}h1{font-size:36px;line-height:1.1;margin:16px 0}header>p:last-child{font-size:15px;line-height:1.7;max-width:620px;color:var(--app-muted)}.finder-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:40px;margin-top:32px}.label{display:block;font-size:14px;font-weight:650;margin-bottom:10px}.input-row{position:relative;display:flex}.combobox{width:100%;padding:13px 48px 13px 14px;border:1px solid var(--app-border);border-radius:var(--app-radius);background:var(--app-surface);color:var(--app-text);font-size:15px}.disclosure{position:absolute;right:4px;top:4px;bottom:4px;width:36px;border:0;background:transparent;border-radius:6px;cursor:pointer}.combobox:focus,.disclosure:focus-visible,button:focus-visible{outline:3px solid var(--app-action);outline-offset:3px}.popover{z-index:50;max-height:340px;overflow:auto;background:var(--app-surface);border:1px solid var(--app-border);border-radius:var(--app-radius);box-shadow:0 8px 28px #243c2420;padding:8px}.group-label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:700;color:var(--app-muted);padding:10px}.combo-item{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:12px 10px;border-radius:6px;cursor:default;font-size:14px;scroll-margin:8px}.combo-item small{font-size:11px;color:var(--app-muted)}.combo-item[data-active-item]{background:var(--app-active);outline:1px solid var(--app-action);outline-offset:-1px}.combo-item[aria-disabled=true]{opacity:.45}.empty{padding:12px;font-size:14px;line-height:1.6}.hint{font-size:12px;line-height:1.7;color:var(--app-muted);margin-top:12px}.collection-note{display:flex;gap:16px;align-items:flex-start;border-block:1px solid var(--app-border);padding:24px 0;margin:28px 0}.collection-note>span{font-size:40px;line-height:1;color:var(--app-action)}.collection-note strong{font-size:14px}.collection-note p{font-size:13px;line-height:1.6;color:var(--app-muted);margin:8px 0 0}.reading-list h2{font-size:17px;display:flex;justify-content:space-between}.reading-list h2 small{background:var(--app-active);border-radius:30px;padding:3px 8px}.reading-list ul{padding:0;list-style:none}.reading-list li{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--app-border);font-size:14px}.remove{background:none;border:0;text-decoration:underline;color:var(--app-action);font-size:12px;cursor:pointer}.muted,.local-note,.scope-note{color:var(--app-muted);font-size:12px;line-height:1.7}.reference-card{border:1px solid var(--app-border);border-radius:var(--app-radius);overflow:hidden;background:var(--app-surface)}.reference-art{height:160px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}.reference-art span{font-size:96px;font-family:Georgia,serif;line-height:1;position:relative;z-index:1}.reference-art i{position:absolute;width:190px;height:190px;border:1px solid currentColor;opacity:.2;border-radius:50%;left:50%;top:35%}.reference-body{padding:24px}.reference-body h2{font-size:28px;margin:12px 0}.reference-body>p{line-height:1.65;font-size:14px}.note-list{list-style:none;padding:0;margin:24px 0}.note-list li{padding:10px 0;border-bottom:1px solid var(--app-border);font-size:13px}.primary{padding:12px 18px;border:1px solid var(--app-action);background:var(--app-action);color:var(--app-on-action);border-radius:6px;cursor:pointer;font-weight:600;font-size:14px}.primary:disabled{background:var(--app-active);color:var(--app-action);cursor:default}.scope-note{margin-top:16px}.selection-status{font-size:12px;color:var(--app-muted);margin-top:24px}@media(max-width:700px){.resource-finder{padding:24px 16px}h1{font-size:30px}.finder-grid{grid-template-columns:1fr;gap:28px}.reference-art{height:135px}}

```

[Code reference](https://ariakit.com/guide/styling)

- Ariakit supplies behavior and semantics, not this color or spacing system.
- The active result is styled through data-active-item.
- The popover has its own maximum height and scroll region.

## Implementation Starting Point

Verified with @ariakit/react 0.4.40 and React 19. Uses current inputValue/setInputValue names and a controlled selectedValue.

```jsx
// Create the project first:
// npm create vite@latest ariakit-specimen -- --template react
// cd ariakit-specimen && npm install
// In a Vite React project:
// npm install @ariakit/react@0.4.40 react@19 react-dom@19
// Save the complete component as App.jsx and the visual configuration as style.css.
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './style.css';
createRoot(document.getElementById('root')).render(<App />);
// index.html contains <div id="root"></div>.
// No Ariakit theme stylesheet is required; style.css is this example's original theme.
// Keep the template index.html and replace its entry with the code above.
// npm run dev
```

## Agent Prompt

Use the supplied Ariakit 0.4.40 reference finder in React. Keep ComboboxProvider inputValue/setInputValue independent from selectedValue/setSelectedValue, retain native labeled groups and the disabled Experimental grid option, and filter the data before rendering items. Preserve the verified Down-then-Enter path with autoSelect off and style data-active-item separately from saved membership. Add the committed reference to a duplicate-free local reading list and allow removal without discarding the current detail. Include the complete original stylesheet.

## Sources

- [Combobox](https://ariakit.com/components/combobox) — Native composition and keyboard behavior.
- [Provider](https://ariakit.com/reference/combobox-provider) — Controlled input and selected state.
- [Grouped options](https://ariakit.com/examples/combobox-group) — Accessible result groups.
- [Item API](https://ariakit.com/reference/combobox-item) — Disabled and selection behavior.
- [Popover API](https://ariakit.com/reference/combobox-popover) — Width and gutter positioning.
- [Styling](https://ariakit.com/guide/styling) — Unstyled primitives and state attributes.
- [Button](https://ariakit.com/components/button) — Accessible action primitive.
