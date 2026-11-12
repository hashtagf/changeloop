# Melt UI Design System — OpenDesign Application Guide

Melt UI’s store/action builders attach accessible behavior to Svelte markup you own. This guide uses @melt-ui/svelte 0.86.6 to connect radio, slider and switch builders through their attributes, actions and writable stores; it is distinct from the newer runes API.

@melt-ui/svelte 0.86.6 store/action builders with Svelte 5.57.1. All visual tokens and poster content are original. Save records only local preview state and does not export or publish a design.

## Source Reference

- **Library scope:** Svelte component builder library ([source](https://www.melt-ui.com/))
- **Platform or architecture:** Components are unstyled ([source](https://www.melt-ui.com/docs/introduction))
- **Integration:** Builders include date and calendar controls ([source](https://www.melt-ui.com/docs/introduction))
- **Component support:** Builders include dialogs and menus ([source](https://www.melt-ui.com/docs/introduction))
- **Customization or behavior:** Controlled behavior is documented ([source](https://www.melt-ui.com/docs/introduction))
- **Additional capability:** A newer Runes-oriented version is linked separately ([source](https://www.melt-ui.com/docs/introduction))


## Design Reference

Verified @melt-ui/svelte 0.86.6 store/action builders running in Svelte 5.57.1. This is the documented builder API, not the separate next-generation runes API. Melt is headless; all --study-* visual values below are original application configuration supplied in full.

### Original semantic visual configuration

[Official reference](https://www.melt-ui.com/docs/usage)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --study-canvas | #f3f0e9 | Outer page. |
| --study-surface | #fffdf8 | Control panel. |
| --study-ink | #32352e | Main text. |
| --study-muted | #77796a | Supporting text. |
| --study-line | #dbdece | Track and panel boundaries. |
| --study-action | #486348 | Selected radio and active range. |
| --study-on-action | #fff | Text on action. |
| --study-focus | #8aa77c | Keyboard focus ring. |
| --study-poster | #e0e8bb | Original poster paper. |
| --study-accent | #d68f57 | Decorative orbit shape. |

### Original spacing and type scales

[Official reference](https://www.melt-ui.com/docs/usage)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --study-space-1 | 4px | Named application spacing; not a Melt default. |
| --study-space-2 | 8px | Named application spacing; not a Melt default. |
| --study-space-3 | 12px | Named application spacing; not a Melt default. |
| --study-space-4 | 16px | Named application spacing; not a Melt default. |
| --study-space-6 | 24px | Named application spacing; not a Melt default. |
| --study-space-8 | 32px | Named application spacing; not a Melt default. |
| Text family | system-ui, sans-serif | No remote font dependency. |
| Page title | 34px / 1.15; 29px narrow | Original headline hierarchy. |
| Poster title | clamp(28px,5.5vw,64px); 28px below 360px | Original responsive display scale. |
| Poster tracking | 0–8px, step 1; default 2px | Actual slider-driven letter spacing. |
| Grid spacing | 24px × 24px | Decorative guides toggled by the native switch. |
| Focus ring | 3px solid #8aa77c; 4px offset | Explicit focus-visible treatment. |

### Native builder contracts

[Official reference](https://www.melt-ui.com/docs/builders/slider)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| createRadioGroup.defaultValue | left | One selected alignment. |
| Radio orientation / loop | horizontal / true | Arrow navigation follows a horizontal group and wraps. |
| createSlider.defaultValue | [2] | The store holds an array even for one thumb. |
| Slider min / max / step | 0 / 8 / 1 | Bounded integer tracking. |
| Slider elements.thumbs | Array-producing builder store | 0.86.6 returns thumbs, not a singular thumb element. |
| createSwitch.defaultChecked | true | Guides begin visible. |
| Builder attributes + action | {...$builder} use:builder | Explicit syntax works without the optional Melt preprocessor. |
| Thumb attributes + action | {...thumb} use:thumb.action | Each generated thumb carries its own attributes/action. |

## Melt UI Design System Melt Attaches Behavior to Markup You Own

### Melt Attaches Behavior to Markup You Own

This example uses the store/action API from @melt-ui/svelte 0.86.6. createRadioGroup, createSlider and createSwitch return element builders and state stores. Ordinary buttons, spans and divs receive the attributes and actions that connect them to native control behavior.

The package does not supply the green paper, poster typography or panel geometry. Those choices are defined in the complete original stylesheet. The documentation also points to a separate newer runes API; this page deliberately identifies the verified builder version instead of mixing incompatible examples from both generations.

[Supporting specification](https://www.melt-ui.com/docs/usage)

## Melt UI Design System Spread Attributes and Install Actions Together

### Spread Attributes and Install Actions Together

An element needs both its builder attributes and its action. The example uses forms such as {...$alignRoot} use:alignRoot and {...$alignItem(value)} use:alignItem. The attributes carry roles, state and positioning; the action installs the interactive behavior and cleanup.

The shorter use:melt syntax requires Melt’s optional preprocessor. Without it, the runtime throws a specific error rather than quietly attaching the builder. The repaired code uses explicit syntax throughout, so the Vite setup below does not omit a hidden preprocessing dependency. Each slider thumb likewise spreads its returned attributes and invokes thumb.action.

[Supporting specification](https://www.melt-ui.com/docs/preprocessor)

## Melt UI Design System Define the Headless Visual System in Application CSS

### Define the Headless Visual System in Application CSS

The --study-* roles distinguish the outer canvas, control surface, text, divider, action, focus, poster paper and decorative accent. The six named spacing values run from four to thirty-two pixels. They are original choices that make this particular composition reproducible, not a token catalog maintained by Melt.

Checked radio buttons and the switch use data-state=checked, while the slider’s returned inline positions determine where the thumb and selected range appear. The stylesheet adds only their geometry and colors. Replacing those native positions with hand-calculated percentages would duplicate logic and risk breaking orientation or direction support.

[Supporting specification](https://www.melt-ui.com/docs/usage)

## Melt UI Design System Keep One Alignment Selected with Native Group Navigation

### Keep One Alignment Selected with Native Group Navigation

createRadioGroup starts at left, with horizontal orientation and looping enabled. Each radio item has a stable value: left, center or right. The poster’s text-align reads the selected value directly, so keyboard navigation and pointer selection affect the same visible composition.

The group receives an accessible Text alignment label. The three options are native builder-backed radio controls rather than ordinary buttons with manually toggled classes. Their checked state is reflected in both semantics and the data-state selector used for the filled visual treatment.

1. Choose Center and inspect the poster’s alignment.
2. Focus the Letter spacing slider and press End to reach 8px.
3. Turn the layout grid off and save the resulting local composition.

[Supporting specification](https://www.melt-ui.com/docs/builders/radio-group)

## Melt UI Design System Treat the Value as an Array Even with One Thumb

### Treat the Value as an Array Even with One Thumb

The slider starts with defaultValue:[2], not a scalar. The installed 0.86.6 builder exposes elements.thumbs, an array-producing store, and the template renders each returned thumb. The poster reads $tracking[0] and applies it as a pixel letter-spacing value.

The bounds are zero to eight with a step of one. Home and End reach the limits; arrow keys move by the defined step. Read $tracking[0] for this single-thumb composition, and retain the array model when adding another thumb rather than introducing a second unrelated scalar state.

[Supporting specification](https://www.melt-ui.com/docs/builders/slider)

## Melt UI Design System Keep a Visual Guide Separate from the Design Values

### Keep a Visual Guide Separate from the Design Values

createSwitch begins checked, and its state controls a guides class on the poster. That class draws two subtle repeating grid gradients at twenty-four-pixel intervals. Turning it off removes the gradients without changing alignment or letter spacing.

The visible Show layout grid label is associated with the switch’s stable ID. Its thumb movement is a CSS transition, with a reduced-motion override. The decorative orbit illustration is aria-hidden and has no interaction; it does not compete with the actual control semantics.

[Supporting specification](https://www.melt-ui.com/docs/builders/switch)

## Melt UI Design System Coordinate Writable Stores Without Duplicating Control State

### Coordinate Writable Stores Without Duplicating Control State

Alignment, tracking and grid visibility remain the builders’ writable stores. The rendered poster reads those stores directly: text-align uses alignment, letter-spacing uses the first slider value, and a CSS class uses the switch’s checked value. A separate application model for the same three settings would create unnecessary synchronization work.

The saved snapshot is derived from a signature of those values. Any change clears the confirmation, and reset writes left, [2] and true back to the stores. The one-element array matters: assigning the scalar 2 would not match the slider’s value contract even though only one thumb is visible.

[Supporting specification](https://www.melt-ui.com/docs/controlled)

## Melt UI Design System Give Every Builder Its Attributes, Action and Name

### Give Every Builder Its Attributes, Action and Name

The radio group receives a Text alignment label, the slider thumb refers to the visible Letter spacing text, and the switch is associated with its visible label. Those names belong on the actual builder-backed elements, not on surrounding decorative wrappers.

The explicit template syntax installs attributes and actions together. For slider thumbs the returned item includes its action, so the loop spreads the thumb attributes and invokes thumb.action. Preserve the builder’s positioning output when styling the track and range; it describes the actual numeric state and direction, while the stylesheet supplies color and geometry.

- Check the real computed output, not only the numeric label.
- Keep labels on the native builder elements.
- Respect reduced motion for custom visual transitions.

[Supporting specification](https://www.melt-ui.com/docs/builders/slider)

## Melt UI Design System Use the Verified Builder API in a Normal Svelte Project

### Use the Verified Builder API in a Normal Svelte Project

The complete component uses Svelte store subscriptions with $alignment, $tracking and $grid. Svelte 5 can compile this established component syntax; the entry uses its current mount function. No custom icon library or stylesheet package is necessary because the whole visual layer is provided above.

The standard Vite Svelte setup below pins @melt-ui/svelte 0.86.6 and Svelte 5.57.1. It does not install the Melt preprocessor because the component already uses the explicit equivalent syntax. When migrating to the newer runes package, rewrite the API intentionally instead of changing only the dependency version.

[Supporting specification](https://www.melt-ui.com/docs/installation)

## Component Examples

### Complete store/action builder composition

createRadioGroup, createSlider and createSwitch attach native semantics and behavior to ordinary markup.

```svelte
<script>
import {createRadioGroup,createSlider,createSwitch} from '@melt-ui/svelte';
const {elements:{root:alignRoot,item:alignItem},states:{value:alignment}}=createRadioGroup({defaultValue:'left',orientation:'horizontal',loop:true});
const {elements:{root:trackingRoot,range:trackingRange,thumbs},states:{value:tracking}}=createSlider({defaultValue:[2],min:0,max:8,step:1});
const {elements:{root:gridRoot},states:{checked:grid}}=createSwitch({defaultChecked:true});
let saved='';let previous='';
$: current=`${$alignment}|${$tracking[0]}|${$grid}`;
$: if(current!==previous){saved='';previous=current}
function save(){saved=`Saved locally: ${$alignment} aligned, ${$tracking[0]}px tracking, grid ${$grid?'on':'off'}.`}
function reset(){alignment.set('left');tracking.set([2]);grid.set(true);saved=''}
</script>
<main class="poster-shell"><header><p class="eyebrow">TYPE COMPOSITION · LIVE STUDY</p><h1>A small change. A different rhythm.</h1><p>Use native Melt UI builders to change the alignment, tracking and guide visibility of an original typographic poster.</p></header><div class="poster-layout"><section class="controls"><h2>Composition</h2><p class="control-label" id="alignment-label">Text alignment</p><div {...$alignRoot} use:alignRoot aria-labelledby="alignment-label" class="alignment">{#each ['left','center','right'] as value}<button {...$alignItem(value)} use:alignItem class="align-option">{value[0].toUpperCase()+value.slice(1)}</button>{/each}</div><div class="tracking-control"><p class="control-label" id="tracking-label">Letter spacing <strong>{$tracking[0]}px</strong></p><div {...$trackingRoot} use:trackingRoot class="slider"><div {...$trackingRange} use:trackingRange class="slider-range"></div>{#each $thumbs as thumb}<span {...thumb} use:thumb.action aria-labelledby="tracking-label" class="slider-thumb"></span>{/each}</div><div class="scale"><span>0px</span><span>8px</span></div></div><div class="grid-control"><label for="show-grid">Show layout grid</label><button id="show-grid" {...$gridRoot} use:gridRoot class="switch"><span></span></button></div><p class="hint">The grid is a visual aid. It does not change the poster’s text or spacing.</p><button class="primary" on:click={save} disabled={!!saved}>Save composition</button><button class="reset" on:click={reset}>Restore initial settings</button><p class="result" role="status">{saved||'This study changes only the local preview.'}</p></section><section class="poster" class:guides={$grid} style:text-align={$alignment} aria-label="Live typographic poster"><div class="poster-top"><span>TYPE / 2026</span><span>STUDY 04</span></div><div class="poster-orbit" aria-hidden="true"><i></i><b></b></div><div class="poster-title" style:letter-spacing={`${$tracking[0]}px`}><span>SPACE</span><span>TO</span><span>THINK.</span></div><div class="poster-bottom"><p>A pause between<br/>one idea and the next.</p><span>Original type study<br/>{$alignment} · {$tracking[0]}px</span></div></section></div></main>

```

[Code reference](https://www.melt-ui.com/docs/usage)

- The slider value is an array; the poster reads its first entry.
- The code uses explicit attribute spreads and actions, avoiding an unstated preprocessor.
- Saved state expires when any builder store changes.

### Complete original poster and control styles

Semantic CSS variables, control data-state selectors, focus rings and a responsive typographic poster.

```css
:root{--study-canvas:#f3f0e9;--study-surface:#fffdf8;--study-ink:#32352e;--study-muted:#77796a;--study-line:#dbdece;--study-action:#486348;--study-on-action:#fff;--study-focus:#8aa77c;--study-poster:#e0e8bb;--study-accent:#d68f57;--study-space-1:4px;--study-space-2:8px;--study-space-3:12px;--study-space-4:16px;--study-space-6:24px;--study-space-8:32px}html,body,#app{height:auto;min-height:0;margin:0}*{box-sizing:border-box}body{background:var(--study-canvas);color:var(--study-ink);font-family:system-ui,sans-serif}button{font:inherit;cursor:pointer}button:focus-visible,[role=slider]:focus-visible{outline:3px solid var(--study-focus);outline-offset:4px}button:disabled{opacity:.45;cursor:default}.poster-shell{max-width:1060px;margin:auto;padding:32px}.eyebrow{font-size:10px;font-weight:700;letter-spacing:.14em;color:var(--study-muted)}h1{font-size:34px;line-height:1.15;max-width:650px;margin:12px 0}header>p:last-child{font-size:14px;line-height:1.7;color:var(--study-muted);max-width:620px}.poster-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px;margin-top:28px}.controls{padding:24px;background:var(--study-surface);border:1px solid var(--study-line);border-radius:14px;align-self:start;min-width:0}.controls h2{font-size:20px;margin:0 0 24px}.control-label{font-size:12px;font-weight:600;margin:0 0 12px}.control-label strong{float:right;color:var(--study-action)}.alignment{display:flex;border:1px solid var(--study-line);padding:4px;border-radius:8px;gap:4px}.align-option{border:0;flex:1;padding:9px 4px;border-radius:5px;font-size:12px;background:transparent;color:var(--study-muted)}.align-option[data-state=checked]{background:var(--study-action);color:var(--study-on-action)}.tracking-control{margin-top:26px}.slider{position:relative;height:24px;display:flex;align-items:center;touch-action:none}.slider:before{content:'';height:4px;background:var(--study-line);position:absolute;inset:10px 0;border-radius:4px}.slider-range{height:4px;position:absolute;background:var(--study-action);border-radius:4px}.slider-thumb{height:20px;width:20px;border:2px solid var(--study-action);background:white;border-radius:50%;cursor:grab}.scale{display:flex;justify-content:space-between;font-size:10px;color:var(--study-muted);margin-top:8px}.grid-control{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--study-line);padding-top:22px;margin-top:24px;font-size:13px}.switch{width:42px;height:24px;padding:3px;border:0;border-radius:999px;background:#b7beaf;flex-shrink:0}.switch span{display:block;width:18px;height:18px;border-radius:50%;background:white;transition:transform .15s}.switch[data-state=checked]{background:var(--study-action)}.switch[data-state=checked] span{transform:translateX(18px)}.hint{font-size:11px;line-height:1.7;color:var(--study-muted);margin:12px 0 24px}.primary{display:block;width:100%;padding:12px;border:0;border-radius:7px;background:var(--study-action);color:white;font-size:13px;font-weight:600}.reset{width:100%;padding:12px 0;border:0;background:transparent;color:var(--study-muted);font-size:11px}.result{font-size:11px;line-height:1.7;color:var(--study-muted);margin:8px 0 0}.poster{background:var(--study-poster);padding:28px;border-radius:14px;min-width:0;overflow:hidden;position:relative}.poster.guides{background-image:linear-gradient(#6680561c 1px,transparent 1px),linear-gradient(90deg,#6680561c 1px,transparent 1px);background-size:24px 24px}.poster-top{display:flex;justify-content:space-between;gap:12px;font-size:9px;font-weight:700;letter-spacing:.1em;position:relative;z-index:1}.poster-orbit{height:130px;position:relative;margin:10px 0 20px}.poster-orbit i{display:block;position:absolute;width:140px;height:140px;background:var(--study-accent);border-radius:50%;right:10%;top:0}.poster-orbit b{display:block;position:absolute;width:140px;height:140px;border:2px solid #617748;border-radius:50%;right:27%;top:0}.poster-title{font-size:clamp(28px,5.5vw,64px);line-height:1.08;font-weight:800;position:relative}.poster-title span{display:block}.poster-bottom{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;border-top:1px solid #9fac7c;margin-top:26px;padding-top:18px;font-size:11px;line-height:1.7}.poster-bottom p{margin:0}.poster-bottom>span{font-size:9px;color:#627046}@media(max-width:740px){.poster-layout{grid-template-columns:minmax(0,1fr)}.poster-shell{padding:20px}h1{font-size:29px}.poster-title{font-size:clamp(30px,9vw,56px)}}@media(max-width:360px){.poster-shell{padding:14px}.controls,.poster{padding:16px}.poster-title{font-size:28px}.poster-orbit{height:110px}.poster-orbit i,.poster-orbit b{width:115px;height:115px}.poster-top{font-size:8px}}@media(prefers-reduced-motion:reduce){.switch span{transition:none}}

```

[Code reference](https://www.melt-ui.com/docs/usage)

- All visual tokens are original, not official Melt defaults.
- The slider thumb/range positions come from native builder attributes.
- Decorative grid visibility is independent of spacing.

## Implementation Starting Point

Verified store/action API from @melt-ui/svelte 0.86.6 in Svelte 5.57.1. Explicit builder syntax avoids requiring the optional Melt preprocessor. This is not the separate next-generation runes API.

```javascript
// npm create vite@latest melt-type-study -- --template svelte
// cd melt-type-study && npm install
// npm install svelte@5.57.1 @melt-ui/svelte@0.86.6
// Save the complete examples as src/App.svelte and src/style.css.
// src/main.js:
import {mount} from 'svelte';
import App from './App.svelte';
import './style.css';
mount(App, {target:document.querySelector('#app')});
// index.html: <div id="app"></div><script type="module" src="/src/main.js"></script>
// npm run dev
```

## Agent Prompt

Use @melt-ui/svelte 0.86.6 store/action builders with Svelte 5 for the typographic composition study. Attach both attributes and actions to createRadioGroup, createSlider and createSwitch elements; use the explicit syntax supplied rather than requiring an unstated preprocessor. Preserve the slider’s one-element array and elements.thumbs contract, alignment values and grid visibility. Bind the poster’s computed styles directly to these stores, invalidate saved feedback after changes, and reset to left, [2] and true. Do not mix in the newer runes API or an appointment model.

## Sources

- [Usage](https://www.melt-ui.com/docs/usage) — Builder attributes, actions and state stores.
- [Preprocessor](https://www.melt-ui.com/docs/preprocessor) — Why use:melt needs preprocessing and its explicit equivalent.
- [Radio group](https://www.melt-ui.com/docs/builders/radio-group) — Exclusive selection and keyboard navigation.
- [Slider](https://www.melt-ui.com/docs/builders/slider) — Array values, limits, direction and keys.
- [Switch](https://www.melt-ui.com/docs/builders/switch) — Boolean state and semantics.
- [Controlled state](https://www.melt-ui.com/docs/controlled) — Writable stores and change functions.
- [Installation](https://www.melt-ui.com/docs/installation) — Versioned package setup.
