# HeroUI Design System — OpenDesign Application Guide

A HeroUI v3 reference with actual semantic CSS variables, compound React controls, light and dark surfaces, and a working image-export recipe.

HeroUI 3.2.6 reference. Official variables are distinguished from original typography, artwork and layout. The native preview changes only memory-held settings and performs no image encoding.

## Source Reference

- **Library scope:** React component library ([source](https://heroui.com/))
- **Platform or architecture:** Current v3 documentation uses Tailwind CSS v4 ([source](https://heroui.com/en/docs/react/getting-started))
- **Integration:** Built on React Aria Components ([source](https://heroui.com/en/docs/react/getting-started))
- **Component support:** Components expose composable parts ([source](https://heroui.com/en/docs/react/getting-started))
- **Customization or behavior:** CSS variables and utility styling are supported ([source](https://heroui.com/en/docs/react/getting-started))
- **Additional capability:** Web and React Native documentation are separate ([source](https://heroui.com/en/docs/react/getting-started))


## Design Reference

HeroUI 3.2.6 default theme, verified against @heroui/styles/dist/themes/default/variables.css. OKLCH values below are literal package values. Artwork colors and typography are application choices, not HeroUI brand tokens.

### Semantic surfaces and contrast

[Official reference](https://heroui.com/en/docs/react/handbook/colors)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --background | oklch(0.9702 0 0) | Light page canvas; dark becomes oklch(12% 0.005 285.823). |
| --foreground | var(--eclipse) | Light reading color; dark resolves to --snow. |
| --surface | var(--white) | Light card background; dark is oklch(0.2103 0.0059 285.89). |
| --overlay | var(--white) | Floating layer background, distinct role from surface even when light values match. |
| --accent | oklch(0.6204 0.195 253.83) | Selected switch, slider fill and primary button. |
| --accent-foreground | var(--snow) | Text on solid accent. |
| --muted | oklch(0.5517 0.0138 285.94) | Secondary text; dark is oklch(70.5% 0.015 286.067). |
| --border | oklch(90% 0.004 286.32) | Light boundaries; dark is oklch(28% 0.006 286.033). |
| --focus | var(--accent) | Keyboard focus indication. |
| --field-background | var(--white) | Light input surfaces; dark follows eclipse value. |

### Shape, spacing and state

[Official reference](https://heroui.com/en/docs/react/handbook/theming)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --spacing | 0.25rem | Base spacing unit; 4px at a 16px root. |
| --radius | 0.5rem | Default radius primitive; 8px at a 16px root. |
| --field-radius | calc(var(--radius) * 1.5) | 12px default field radius. |
| --border-width | 1px | Default boundary thickness. |
| --field-border-width | 0px | Default fields do not rely on an outline border. |
| --disabled-opacity | 0.5 | Disabled visual treatment; still use component isDisabled. |
| --ring-offset-width | 2px | Space between control and focus ring. |
| --tooltip-delay | 1500ms | Initial tooltip delay in the default package. |
| --tooltip-close-delay | 500ms | Tooltip closing delay. |

### Application typography and layout

[Official reference](https://heroui.com/en/docs/react/handbook/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| body | 16px / 1.5, Arial, Helvetica, sans-serif | Explicit preview font choice; does not represent a mandatory HeroUI font. |
| h1 | 32px / 1.15; 28px below 700px | Original page heading scale. |
| h2 | 24px / 1.25 | Export settings heading. |
| helper text | 13px / inherited 1.5 | Quality explanation and local result. |
| desktop gap | 24px | Two-column artwork/settings grid. |
| mobile breakpoint | 700px | Original responsive rule, not a HeroUI breakpoint token. |
| card radius | calc(var(--radius) * 3) | 24px application composition using the official primitive. |

### Native control configuration

[Official reference](https://heroui.com/en/docs/react/components/slider)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| quality range | minValue=10; maxValue=100; step=5 | Application encoder recipe range, not a HeroUI default. |
| Slider | value + onChange | Controlled number updates output and recipe. |
| Switch | isSelected + onChange | Controlled boolean preserves one source of truth. |
| Button | onPress | React Aria press event supports pointer and keyboard activation. |

## HeroUI Design System v3 and the Export Studio

### React components plus a semantic stylesheet

This example targets HeroUI 3.2.6. Its controls are React components backed by React Aria behavior, while the visual layer comes from @heroui/styles. The official quick start requires React 19 and Tailwind CSS v4. The v3 setup does not wrap this application in the older HeroUIProvider pattern. Mixing v2 tutorials with this compound component API is a practical source of missing or incorrectly styled controls.

The specimen is an export recipe editor: artwork on the left, quality and metadata controls on the right. The illustration is drawn with original CSS. It is not an image processed by the library. Applying a recipe captures the selected settings in local React state; there is deliberately no fabricated file size or download result.

[Supporting specification](https://heroui.com/en/docs/react/getting-started/quick-start)

## HeroUI Design System Semantic Colors and Appearance

### Separate canvas, surfaces, and floating layers

Use --background for the outer canvas, --surface for the artwork and settings cards, and --overlay for a future popover or dialog. These are semantic roles, even when two resolve to white in light mode. In dark mode the canvas and elevated surfaces diverge. The example toggles the dark class on document.documentElement so all descendants share the same theme scope.

The slider fill and selected switch use the accent role. Solid accent controls pair it with --accent-foreground. Secondary text uses --muted rather than lowering opacity on an entire card. The artwork keeps its independent warm palette in both appearances because it is content, not interactive chrome.

[Supporting specification](https://heroui.com/en/docs/react/handbook/colors)

## HeroUI Design System Typography and Spacing

### State the application scale explicitly

HeroUI styling integrates with Tailwind utilities, but this page does not invent a single required HeroUI typeface. Its original CSS chooses Arial/Helvetica with a 16px body and 1.5 line height. A 32px heading becomes 28px on the narrow layout; the settings heading is 24px. The reference table distinguishes these application values from package variables.

The official --spacing primitive is 0.25rem. This composition uses 16px inside the recipe, 24px between columns and around desktop cards, and 32px around the desktop canvas. The field radius derives from the official 8px radius primitive. Card radius deliberately uses three times that primitive, so its 24px value is an application derivation, not a claimed default Card value.

[Supporting specification](https://heroui.com/en/docs/react/handbook/theming)

## HeroUI Design System Build a Complete Slider

### Keep anatomy and value ownership together

The root Slider owns value, onChange, minValue, maxValue, and step. Its Label supplies the accessible name. Slider.Output reads the same value, and Slider.Track contains Slider.Fill and Slider.Thumb. Omitting these visible parts can leave behavior without the expected track or handle. This example uses one number rather than a range array.

Quality is bounded to 10–100 in increments of five. Those limits are local product decisions. HeroUI itself defaults to a 0–100 range with step one. A quality value has no reliable universal relationship to bytes, so the helper copy explains the tradeoff without inventing a file-size estimate. To support multiple thumbs, use a number array and give each thumb the correct index.

1. Focus the quality slider and use an arrow key to change one step.
2. Check that the visible output and current recipe change together.
3. Apply the recipe and then move the slider again to distinguish the draft from the applied snapshot.

[Supporting specification](https://heroui.com/en/docs/react/components/slider)

## HeroUI Design System Compose a Boolean Setting

### A switch has control and content parts

The metadata setting uses isSelected and onChange on Switch. In the installed 3.2.6 implementation, Switch.Content wraps Switch.Control and Label; Switch.Control contains Switch.Thumb. Description sits beside Switch.Content as field-level help. This follows the installed source, whose SwitchField/SwitchButton anatomy differs from some earlier v3 documentation examples. The description explains what the boolean means instead of relying on the blue selected track. A single metadata state drives both the native control and the text recipe.

Keep this boolean separate from the apply operation. Toggling metadata edits the current draft immediately; pressing Apply to preview records a snapshot. Reset restores quality 80, strips metadata, and clears that snapshot. No saved-state indicator is reused for a different draft. If this were connected to an encoder, pass the applied object to that process rather than reading ambiguous form text.

[Supporting specification](https://heroui.com/en/docs/react/components/switch)

## HeroUI Design System Compose Surfaces Responsively

### The artwork remains content, not decoration behind controls

Desktop uses a 1.05fr/1fr grid so the artwork has slightly more room while settings remain readable. At the original 700px breakpoint the grid becomes a single column, the header stacks, and the artwork changes from a 4:5 to a 4:3 aspect ratio. Its caption remains outside the art to retain a stable reading surface.

All interactive controls sit in a solid semantic surface. Buttons wrap when space is limited. The preview has content-driven height rather than a viewport minimum; that is important when the document is embedded in an automatically sized iframe. No fixed-height scroll box hides the form or its result.

[Supporting specification](https://heroui.com/en/docs/react/handbook/styling)

## HeroUI Design System Interaction, Focus, and Honest Results

### Use native states instead of painted substitutes

Button uses onPress rather than a custom pointer-only event. Slider supplies keyboard manipulation and announced values. Switch provides its boolean state through the native accessibility implementation. Custom layout CSS does not remove focus styling. Component disabled behavior should use isDisabled rather than opacity alone; --disabled-opacity only describes the appearance.

The status paragraph has role=status so an applied snapshot can be announced without moving keyboard focus. The dark appearance button changes its label to describe the next action. Artwork has a descriptive region label and its shapes remain decorative. Nothing in this demo promises persistence after reload.

- Quality is a bounded numeric choice with a visible output.
- Metadata is a boolean with both label and explanatory text.
- Apply stores a local snapshot; Reset clears it and restores the initial draft.

[Supporting specification](https://heroui.com/en/docs/react/components/switch)

## HeroUI Design System Install and Reproduce the Example

### Choose one stylesheet pipeline

In a Vite React application, install the pinned HeroUI packages and Tailwind CSS v4 with its Vite plugin. In the main stylesheet import tailwindcss first and @heroui/styles second, then include the original layout CSS. Render App with React createRoot; no v2 provider is required for this composition. The setup block gives the entry and Vite configuration, and the complete App and CSS are available above.

The downloadable standalone specimen uses the package’s precompiled heroui.min.css plus an esbuild React bundle, both inlined. This avoids CDN dependencies for the preview. It demonstrates the same native controls but is not an instruction to import both compiled and Tailwind-generated HeroUI styles into one production app. Choose a single pipeline to avoid duplicated rules.

[Supporting specification](https://heroui.com/en/docs/react/getting-started/quick-start)

## HeroUI Design System Extend the Recipe Without Inventing an Encoder

### Keep capability boundaries visible

To add a real image conversion, introduce a file input and an actual browser or server encoder, then connect pending, failed, and completed states to that work. A Slider only selects a value; it does not provide compression. An Apply button should not become a Download button until a real output blob exists. Preserve the original image separately so repeated recipe changes do not compound lossy encoding.

When theming the application, override semantic pairs together and test both light and dark appearance. Changing only --accent while retaining an unsuitable foreground can damage button contrast. For more elaborate customization, target documented component classes and data states rather than replacing the component’s accessible input with a visually similar div.

[Supporting specification](https://heroui.com/en/docs/react/handbook/theming)

## Component Examples

### Complete export recipe application

Compound Slider and Switch parts inherit official styling. A separate applied snapshot makes draft versus applied state visible.

```jsx
import React,{useState,useEffect} from 'react';
import {Button,Switch,Label,Description,Slider} from '@heroui/react';
import './style.css';
export default function App(){
const[quality,setQuality]=useState(80),[metadata,setMetadata]=useState(false),[dark,setDark]=useState(false),[saved,setSaved]=useState(null);
useEffect(()=>{document.documentElement.classList.toggle('dark',dark)},[dark]);
return <main className='export-app'><header><div><p className='eyebrow'>HeroUI · Export studio</p><h1>Make room for the image.</h1><p className='muted'>Inspect a local export recipe before handing it to an encoder.</p></div><Button variant='secondary' onPress={()=>setDark(!dark)}>{dark?'Light appearance':'Dark appearance'}</Button></header><div className='export-grid'><section className='art-panel' aria-label='Original CSS artwork preview'><div className='art'><div className='sun'/><div className='hill one'/><div className='hill two'/><span>FIELD NOTES<br/>COLLECTION 07</span></div><div className='art-caption'><strong>Morning in the dunes</strong><span>1600 × 1200 · sample composition</span></div></section><section className='settings'><p className='eyebrow'>WEBP PRESET</p><h2>Export settings</h2><p className='muted'>The controls update a recipe. They do not encode or upload an image.</p><Slider value={quality} onChange={setQuality} minValue={10} maxValue={100} step={5}><div className='slider-heading'><Label>Image quality</Label><Slider.Output/></div><Slider.Track><Slider.Fill/><Slider.Thumb/></Slider.Track></Slider><p className='helper'>Higher quality may preserve fine texture. File size depends on the source image and encoder.</p><Switch isSelected={metadata} onChange={setMetadata}><Switch.Content><Switch.Control><Switch.Thumb/></Switch.Control><Label>Keep metadata</Label></Switch.Content><Description>Include source metadata in the recipe.</Description></Switch><div className='recipe'><p className='eyebrow'>CURRENT RECIPE</p><code>format: webp<br/>quality: {quality}<br/>metadata: {metadata?'keep':'strip'}</code></div><div className='actions'><Button onPress={()=>setSaved({quality,metadata})}>Apply to preview</Button><Button variant='tertiary' onPress={()=>{setQuality(80);setMetadata(false);setSaved(null)}}>Reset</Button></div><p role='status' className='status'>{saved?`Preview recipe applied: quality ${saved.quality}, metadata ${saved.metadata?'kept':'stripped'}. No file was generated.`:'Adjust quality with the arrow keys, then apply the recipe.'}</p></section></div><footer>Native HeroUI 3.2.6 controls and official compiled styles. Artwork and page layout are original CSS.</footer></main>;
}

```

[Code reference](https://heroui.com/en/docs/react/components/slider)

- Slider.Output reflects the controlled number.
- Switch.Control and Switch.Thumb are required visible anatomy.
- onPress applies a recipe; it does not claim an image was encoded.

### Original layout CSS

Surface and radius references use HeroUI variables; the artwork colors, font scale and breakpoint are explicit application decisions.

```css
*{box-sizing:border-box}body{margin:0;background:var(--background);color:var(--foreground);font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5}.export-app{max-width:1120px;padding:32px;margin:auto}header{display:flex;justify-content:space-between;align-items:start;gap:24px;margin-bottom:28px}h1{font-size:32px;font-weight:700;letter-spacing:-.035em;line-height:1.15;margin:8px 0 12px}h2{font-size:24px;font-weight:650;line-height:1.25;margin:8px 0 12px}.eyebrow{font-size:11px;letter-spacing:.12em;font-weight:700}.muted,.helper,footer{color:var(--muted)}.muted{margin:0 0 24px}.export-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:24px}.art-panel,.settings{background:var(--surface);border-radius:calc(var(--radius)*3);padding:24px;box-shadow:var(--surface-shadow)}.art{position:relative;aspect-ratio:4/5;background:#f0d8b8;border-radius:calc(var(--radius)*2);overflow:hidden}.sun{width:40%;aspect-ratio:1;background:#bf532f;position:absolute;top:13%;left:30%;border-radius:50%}.hill{position:absolute;width:180%;height:70%;border-radius:50%;transform:rotate(-24deg)}.one{top:50%;left:-60%;background:#c59162}.two{top:66%;left:-10%;background:#69402e}.art span{position:absolute;top:6%;left:8%;font-size:11px;letter-spacing:.2em;color:#563324}.art-caption{display:flex;flex-direction:column;gap:4px;margin-top:16px}.art-caption span{color:var(--muted);font-size:12px}.settings{display:flex;flex-direction:column;gap:16px}.settings .muted{margin-bottom:0}.slider-heading{display:flex;justify-content:space-between;gap:16px}.helper{font-size:13px;margin:0}.recipe{border:var(--border-width) solid var(--border);padding:16px;border-radius:var(--field-radius)}.recipe .eyebrow{margin-top:0}code{font-size:14px}.actions{display:flex;flex-wrap:wrap;gap:8px}.status{font-size:13px;margin:0}footer{font-size:12px;margin-top:20px}@media(max-width:700px){.export-app{padding:16px}header{flex-direction:column}h1{font-size:28px}.export-grid{grid-template-columns:1fr}.art{aspect-ratio:4/3}.art-panel,.settings{padding:20px}}

```

[Code reference](https://heroui.com/en/docs/react/handbook/styling)

- Load this CSS after the official stylesheet.
- The html dark class changes semantic values for the entire document.

## Implementation Starting Point

Native preview verified with React 19 and HeroUI 3.2.6. The provided App and layout CSS are complete. This Vite configuration uses the documented Tailwind v4 import pipeline; the offline specimen instead inlines the official precompiled stylesheet.

```jsx
// In a Vite React 19 project:
// npm install @heroui/react@3.2.6 @heroui/styles@3.2.6 tailwindcss@^4 @tailwindcss/vite@^4
// vite.config.js
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[react(),tailwindcss()]});

// globals.css: keep this import order
// @import "tailwindcss";
// @import "@heroui/styles";
// Paste the Original layout CSS after these imports.

// main.jsx
import React from 'react';
import {createRoot} from 'react-dom/client';
import './globals.css';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(<App/>);
// App.jsx is the complete application above. Remove its './style.css'
// import when the same CSS is included in globals.css.
```

## Agent Prompt

Use the supplied HeroUI 3.2.6 App.jsx, stylesheet and Tailwind integration to build the image export studio. Keep Slider quality state and Switch metadata state connected to the export summary; preserve Switch.Content, Control and Thumb with their labels. Changing quality or metadata must invalidate the saved snapshot. The dark appearance control should change the same document class used by the stylesheet. Save an explicitly local export recipe; do not imply an image file was processed or downloaded.

## Sources

- [Quick start](https://heroui.com/en/docs/react/getting-started/quick-start) — React and Tailwind requirements and import order.
- [Colors](https://heroui.com/en/docs/react/handbook/colors) — Semantic color roles.
- [Theming](https://heroui.com/en/docs/react/handbook/theming) — CSS theme customization.
- [Slider](https://heroui.com/en/docs/react/components/slider) — Compound anatomy and controlled numeric values.
- [Switch](https://heroui.com/en/docs/react/components/switch) — Boolean composition and state.
- [Styling](https://heroui.com/en/docs/react/handbook/styling) — Component styling approach.
