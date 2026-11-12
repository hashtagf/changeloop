# gluestack UI Design System — OpenDesign Application Guide

Build a field-kit checklist with gluestack’s real core Button and Input creators, explicit v5 semantic colors and complete React Native Web source. Inspect validation, keyboard actions, stable item identity and locally derived packing progress.

Actual @gluestack-ui/core 5.0.15 behavior through React Native Web 0.21.3. The field-kit layout, artwork and state model are original OpenDesign work. This direct-creator browser example uses explicit styles; it is not the CLI-generated NativeWind/Uniwind component set and has not been tested on iOS or Android.

## Source Reference

- **Core runtime:** @gluestack-ui/core 5.0.15 ([source](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx))
- **Styling route:** Explicit original styles using documented v5 light roles ([source](https://gluestack.io/ui/docs/home/theme-configuration/default-tokens))
- **Host platform:** React Native Web 0.21.3; browser study ([source](https://github.com/gluestack/gluestack-ui))


## Design Reference

The reference separates documented v5 light colors from the installed core creator API. Direct creators do not apply the CLI theme automatically. The preview explicitly maps the listed colors to original styles and uses a stronger custom focus outline. Geometry and artwork are application choices.

### Documented v5 light color roles

[Official reference](https://gluestack.io/ui/docs/home/theme-configuration/default-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| background | #ffffff | Page canvas. |
| foreground | #0a0a0a | Normal readable text. |
| card | #ffffff | Card surface. |
| popover | #ffffff | Overlay surface; no popover is used in this study. |
| popover-foreground | #0a0a0a | Text paired with the overlay surface. |
| muted | #f5f5f5 | Supporting surfaces, including the original artwork panel. |
| muted-foreground | #737373 | Secondary descriptions and status details. |
| destructive | #e7000b | Invalid input feedback; the error also appears as text. |
| border | #e5e5e5 | Card outlines and list separators. |
| input | #e5e5e5 | Resting field border. |
| ring | #d4d4d4 | Documented default ring color; this study uses a stronger original #737373 focus outline. |
| primary | #171717 | Main action surface and progress fill. |
| primary-foreground | #fafafa | Text paired with the dark action surface. |
| secondary | #f5f5f5 | Lower-emphasis action surface. |
| secondary-foreground | #171717 | Text paired with secondary surfaces. |
| accent | #f7f7f7 | Additional accent surface role. |
| accent-foreground | #343434 | Text paired with the accent role. |

### Core Button factory and states

[Official reference](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| createButton | { Root, Text, Group, Spinner, Icon } | Supply actual host components; the creator adds behavior, not a complete theme. |
| Button.Text | Text host | Keeps button text inside its state context. |
| Button.Group | Group host | Generated subcomponent for grouping buttons; unused in this layout. |
| Button.Spinner | Spinner host | Generated loading affordance; do not display it for an instantaneous local action. |
| Button.Icon | Icon host | Generated icon subcomponent; the preview uses explicit text actions. |
| Button isDisabled | boolean | Disables the actual press behavior, not only its appearance. |
| Button data-focus-visible | true / false | The original CSS applies a visible outline for keyboard focus. |
| Button data-active | true / false | Exposes a pressed interaction state to styling. |

### Core Input context and host props

[Official reference](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/input/creator/Input.jsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| createInput | { Root, Icon, Slot, Input } | Creates the field context and its related slots. |
| Input.Input | TextInput host | The text entry component returned by the creator. |
| isInvalid | Input root boolean | Propagates invalid context and aria-invalid to the field. |
| isRequired | Input root boolean | Propagates the required state; the application still performs its own trim validation. |
| value / onChangeText | Controlled TextInput props | Keep draft text in React state. |
| onSubmitEditing | TextInput callback | Adds an item when Enter is pressed in this browser example. |
| maxLength | 60 in the original study | A TextInput limit chosen for this application; not a gluestack default. |
| aria-label | Item name in the original study | Names the input, alongside a visible label. |

## gluestack UI Design System Versions, Creators and Generated Components

### Choose the actual implementation route

gluestack has more than one layer. The standard installation flow generates styled components into an application. This study instead imports createButton and createInput from the installed core package and supplies React Native Web hosts. The distinction matters: installing core alone does not provide the generated button variants or the complete theme.

The running example pins core 5.0.15 and utils 5.0.6. Its React Native Web adapters are real components, while the shell and state are original. Use the installation documentation when building a full Expo or Next.js application; use the complete files here to reproduce this particular browser study.

## gluestack UI Design System Semantic Colors and Explicit Styling

### Pair roles before choosing decoration

The page uses a white canvas with a dark primary action, muted supporting areas and visible border roles. These values are copied from the documented v5 light palette, then assigned explicitly through React Native styles and ordinary CSS. No runtime provider is silently applying them.

An invalid field combines its destructive-colored outline with a readable explanation and focus return. The original focus outline is darker than the documented default ring, so the stylesheet labels that choice instead of presenting it as a library token.

### Keep migrations deliberate

Older examples using numerical palette names should not be mixed blindly with the v5 semantic vocabulary. Inspect the installed generated configuration and the upgrade guide before replacing a token name. A direct creator study can demonstrate behavior without proving that a full application migration is complete.

## gluestack UI Design System Button Composition and Keyboard Actions

### Give the creator all its hosts

createButton receives Pressable, Text, View, ActivityIndicator and an icon host. It returns the Button plus Text, Group, Spinner and Icon subcomponents. The complete example uses Button.Text rather than placing a bare string into the pressable root.

Packing is a synchronous state transition, so there is no fabricated spinner or save delay. Each action includes its item name in the accessible label. The visible action changes between Pack item and Unpack so the next effect remains clear.

### Verify the rendered behavior

1. Tab to a Pack item action and press Space.
2. Confirm both the textual packed state and progress value change.
3. Use Unpack and confirm the same item remains in the list.
4. Inspect the focus outline instead of assuming a mouse hover proves keyboard support.

## gluestack UI Design System Input Context and Complete Validation

### Validate the value that will be stored

The input stays controlled through value and onChangeText. Adding first trims the draft, rejects an empty result, then compares names without case sensitivity. A rejected value remains in the field so the user can correct it.

The root receives isInvalid and isRequired; the real field receives the label, description reference and a ref for focus restoration. Validation belongs to the application: marking a core input required does not create the duplicate-name rule.

### Handle every visible field state

- Initial: the field is empty and the length hint is visible.
- Invalid: the explanation appears in an alert and the field receives focus.
- Editing: stale error text clears as the user changes the draft.
- Accepted: a new unpacked row appears, the field clears and the status names the addition.

## gluestack UI Design System Stable Identity and Derived Progress

### Store the items, derive the summary

Every item has a stable numeric id, a name and a packed flag. A ref supplies new ids; the displayed name is not used as the React key. Toggling maps by id, so two unrelated UI updates cannot accidentally change a different row.

The progress numerator is calculated from packed flags and the denominator from the current list. Adding an unpacked item can reduce the percentage without losing already packed items. This is the correct consequence of a larger checklist, not an animation error.

### Make reset an explicit local action

Reset restores the three sample items, clears the draft and error, resets the next id and announces the result. Reloading also starts with the sample state. There is no server, account synchronization or persistent storage behind this preview.

## gluestack UI Design System Responsive Layout and Original Artwork

### Distinguish host behavior from page geometry

The desktop composition places the checklist beside its input panel. At 700 pixels it becomes one column. Rows wrap when necessary and long item names break within the available space; a fixed-width action should not push the entire document sideways.

The notebook and pencil are original CSS shapes, not copied gluestack brand assets. The 14-pixel card radius, 24-pixel panel spacing and heading scale are study decisions. The reference table keeps those separate from the documented color roles.

## gluestack UI Design System Browser Accessibility and Platform Scope

### Test the environment actually represented

The preview renders React Native Web and has been checked in a browser. It does not establish native iOS or Android behavior. An Expo application must separately verify touch targets, screen-reader announcements, keyboard avoidance and platform navigation.

The progress element includes its name, minimum, maximum and current value. A live status describes completed actions without moving the reader away from the checklist. The form preserves the draft on rejection and returns focus to the field. These are application responsibilities layered on the native core behavior.

## gluestack UI Design System Complete Build and Dependency Boundary

### Reproduce this exact study

Save all four files from Component Examples into one directory and install the pinned packages shown below. The build aliases react-native to react-native-web because core imports the native module name internally. The source imports browser hosts directly and never loads an Expo runtime.

The narrow package installation uses legacy peer resolution for this web-only subset. That is not a recommendation for a complete native application: the full library advertises peers for native, SVG and safe-area integrations that this particular two-creator bundle does not use. Add the correct peers when expanding the component set.

### Change one layer at a time

1. Build the unchanged files and verify add, duplicate rejection, pack and reset.
2. Change the original layout or application content while keeping creator wiring intact.
3. If adopting generated NativeWind components, replace the styling and provider setup as a separate integration step.
4. Recheck keyboard behavior and the real target platforms after that change.

## Component Examples

### app.jsx — complete core component study

Actual creator wiring and the entire checklist state model.

```jsx
import React,{useState,useRef} from 'react';
import{createRoot}from'react-dom/client';
import{Pressable,Text,View,TextInput,ActivityIndicator}from'react-native-web';
import{createButton}from'@gluestack-ui/core/button/creator';
import{createInput}from'@gluestack-ui/core/input/creator';
const Button=createButton({Root:Pressable,Text,Group:View,Spinner:ActivityIndicator,Icon:View});
const Input=createInput({Root:View,Input:TextInput,Slot:Pressable,Icon:View});
const seed=[{id:1,name:'Sketchbook',packed:true},{id:2,name:'Pencil roll',packed:false},{id:3,name:'Water bottle',packed:false}];
function App(){const[items,setItems]=useState(seed),[name,setName]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState('Pack each item when it is ready.');const next=useRef(4),field=useRef(null);const count=items.filter(x=>x.packed).length;
function add(){const v=name.trim();if(!v||items.some(x=>x.name.toLowerCase()===v.toLowerCase())){setError(!v?'Enter the name of an item.':'That item is already in the kit.');field.current.focus();return}setItems([...items,{id:next.current++,name:v,packed:false}]);setName('');setError('');setMessage(v+' added to this local kit.')}
return <main><header><p className="eyebrow">GLUESTACK UI / CORE COMPONENT STUDY</p><h1>A small kit.<br/>A clearer start.</h1><p className="intro">Prepare a drawing kit with actual gluestack core Button and Input creators. Your checklist stays in this browser session.</p></header><div className="layout"><section className="panel"><div className="sectionhead"><h2>Your field kit</h2><span className="badge">{count} of {items.length} packed</span></div><div className="meter" role="progressbar" aria-label="Packed items" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={count}><i style={{width:100*count/items.length+'%'}}/></div><ul>{items.map(item=><li key={item.id}><div><strong>{item.name}</strong><span>{item.packed?'Packed and ready':'Still to pack'}</span></div><Button onPress={()=>{setItems(items.map(x=>x.id===item.id?{...x,packed:!x.packed}:x));setMessage(item.name+(item.packed?' marked to pack.':' marked packed.'))}} style={item.packed?styles.secondary:styles.primary} aria-label={(item.packed?'Unpack ':'Pack ')+item.name}><Button.Text style={{color:item.packed?'#171717':'#fafafa',fontSize:14,fontWeight:600}}>{item.packed?'Unpack':'Pack item'}</Button.Text></Button></li>)}</ul><p className="status" role="status">{message}</p></section><aside className="panel"><div className="drawing" aria-hidden="true"><span className="book">FIELD<br/>NOTES</span><i className="pencil"/></div><h2>Add one useful thing</h2><label htmlFor="kit-name">Item name</label><Input isInvalid={!!error} isRequired style={styles.input}><Input.Input id="kit-name" aria-label="Item name" aria-describedby={error?'kit-error':'kit-hint'} ref={field} value={name} onChangeText={v=>{setName(v);setError('')}} onSubmitEditing={add} maxLength={60} style={styles.field}/></Input><p id="kit-hint" className="hint">Use a short, unique name. Maximum 60 characters.</p>{error&&<p id="kit-error" className="error" role="alert">{error}</p>}<Button onPress={add} style={styles.primary}><Button.Text style={styles.primaryText}>Add to kit</Button.Text></Button><Button onPress={()=>{setItems(seed);setName('');setError('');setMessage('Example kit restored.');next.current=4}} style={styles.reset}><Button.Text style={{color:'#737373',fontSize:14}}>Reset example kit</Button.Text></Button></aside></div><p className="scope">Native @gluestack-ui/core 5.0.15 behavior rendered through React Native Web. Original OpenDesign layout and artwork; explicitly styled with documented v5 light color roles. This is a web-only study, not an Expo build or the CLI-generated NativeWind component set.</p></main>}
const styles={primary:{backgroundColor:'#171717',paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:'center',justifyContent:'center'},secondary:{backgroundColor:'#f5f5f5',paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:'center',justifyContent:'center'},primaryText:{color:'#fafafa',fontSize:14,fontWeight:600},input:{borderWidth:1,borderColor:'#e5e5e5',borderRadius:8,marginTop:8},field:{padding:12,fontSize:16,color:'#0a0a0a',outlineStyle:'none'},reset:{paddingVertical:16,alignItems:'center'}};
createRoot(document.getElementById('app')).render(<App/>);

```

[Code reference](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx)

### style.css — original layout and explicit light roles

Complete responsive shell, artwork, state outlines and browser focus treatment.

```css
*{box-sizing:border-box}body{margin:0;background:#fff;color:#0a0a0a;font-family:Arial,sans-serif}main{max-width:1100px;margin:auto;padding:40px}.eyebrow{font-size:12px;letter-spacing:.12em;font-weight:700}.intro{max-width:62ch;color:#737373;line-height:1.6}h1{font-size:52px;line-height:1.03;letter-spacing:-.045em;margin:24px 0}h2{font-size:22px;margin:0 0 20px}.layout{display:grid;grid-template-columns:1.35fr 1fr;gap:24px;margin-top:32px}.panel{border:1px solid #e5e5e5;border-radius:14px;padding:24px;min-width:0}.sectionhead{display:flex;gap:12px;justify-content:space-between;align-items:baseline;flex-wrap:wrap}.badge{font-size:12px;background:#f5f5f5;padding:6px 10px;border-radius:20px}.meter{height:6px;border-radius:8px;background:#f5f5f5;margin:6px 0 24px;overflow:hidden}.meter i{display:block;height:100%;background:#171717}ul{list-style:none;padding:0;margin:0}li{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:20px 0;border-bottom:1px solid #e5e5e5}li>div:first-child{min-width:0;flex:1}li strong{display:block;font-size:16px;overflow-wrap:anywhere}li span{display:block;font-size:13px;color:#737373;margin-top:8px}.status{font-size:14px;line-height:1.6;margin-top:24px}.hint,.scope{font-size:12px;line-height:1.6;color:#737373}.scope{margin-top:28px}.error{font-size:14px;color:#e7000b;line-height:1.5}label{font-size:14px}.drawing{height:130px;background:#f5f5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:24px}.book{display:block;background:#171717;color:#fafafa;border-left:5px solid #737373;width:80px;height:96px;padding:22px 12px;font-size:12px;line-height:1.6;transform:rotate(-8deg)}.pencil{height:90px;width:8px;background:#a3a3a3;transform:rotate(14deg)}[data-focus-visible=true]{outline:3px solid #737373;outline-offset:3px}[data-invalid=true]{border-color:#e7000b!important}input:focus-visible{outline:2px solid #737373!important;outline-offset:3px}@media(max-width:700px){main{padding:20px}h1{font-size:40px}.layout{grid-template-columns:1fr}.panel{padding:20px}li{gap:12px;flex-wrap:wrap}li>div:first-child{flex-basis:120px}}

```

[Code reference](https://gluestack.io/ui/docs/home/theme-configuration/default-tokens)

### build.mjs — complete web bundler configuration

The native import alias is required even though app.jsx imports its hosts from React Native Web.

```javascript
import { build } from 'esbuild';
await build({entryPoints:['app.jsx'],bundle:true,minify:true,outfile:'app.js',alias:{'react-native':'react-native-web'},resolveExtensions:['.web.js','.js','.jsx','.ts','.tsx','.json'],loader:{'.js':'jsx'},define:{'process.env.NODE_ENV':'"production"'}});

```

[Code reference](https://github.com/gluestack/gluestack-ui)

### index.html — complete browser entry

Keep this file beside style.css and the generated app.js.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>gluestack field kit</title><link rel="stylesheet" href="style.css"></head><body><div id="app"></div><script src="app.js"></script></body></html>
```

[Code reference](https://github.com/gluestack/gluestack-ui)

## Implementation Starting Point

Save the four complete files first. This setup is scoped to the demonstrated browser subset and does not initialize NativeWind, Uniwind, Expo or a generated component registry.

```sh
npm init -y
npm install react@19.3.0 react-dom@19.3.0 react-native-web@0.21.3 @gluestack-ui/core@5.0.15 @gluestack-ui/utils@5.0.6 esbuild@0.28.2 --legacy-peer-deps
node build.mjs
python3 -m http.server 8000
# Open http://localhost:8000/
```

## Agent Prompt

Implement the complete gluestack core 5.0.15 field-kit browser study using createButton/createInput and React Native Web hosts. Preserve stable ids, controlled draft text, trim and duplicate validation, focus restoration, derived packed count, local reset and explicit v5 light-role mapping. Keep original layout choices separate from library defaults. Do not claim native mobile testing or backend persistence.

## Sources

- [Installation](https://gluestack.io/ui/docs/home/getting-started/installation) — The standard generated-component installation path.
- [v5 semantic tokens](https://gluestack.io/ui/docs/home/theme-configuration/default-tokens) — Current light color roles and customization.
- [Button API](https://gluestack.io/ui/docs/components/button) — Button anatomy, interaction and state attributes.
- [Core Button factory](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/button/creator/index.jsx) — Exact installed 5.0.15 creator implementation.
- [Core Input implementation](https://cdn.jsdelivr.net/npm/@gluestack-ui/core@5.0.15/lib/esm/input/creator/Input.jsx) — Controlled field, invalid state and accessibility wiring.
- [Upgrade to v5](https://gluestack.io/ui/docs/guides/more/upgrade-to-v5) — Version migration and naming changes.
