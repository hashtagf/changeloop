# Porsche Design System — OpenDesign Application Guide

Explore Porsche Design System v4 through fluid spacing, CSS color schemes, Porsche Next typography and a two-choice configurator. The reference includes real token expressions and a complete Vite entry using current segmented-control events.

Independent OpenDesign reference scoped to PDS v4. Original artwork and finish names are not Porsche vehicle specifications, paint codes or available options. No transaction is performed.

## Source Reference

- **Reference generation:** Porsche Design System v4 ([source](https://designsystem.porsche.com/v4/news/migration-guide/porsche-design-system/))
- **Native package:** @porsche-design-system/components-js ([source](https://designsystem.porsche.com/v4/developing/vanilla-js/getting-started/))
- **Type family:** Porsche Next ([source](https://designsystem.porsche.com/v4/tokens/font/))
- **Control radius:** 12px ([source](https://designsystem.porsche.com/v4/tokens/border/))
- **Container radius:** 24px ([source](https://designsystem.porsche.com/v4/tokens/border/))
- **Theme selector:** CSS color-scheme ([source](https://designsystem.porsche.com/v4/tokens/color/))


## Design Reference

Porsche Design System v4 documentation, with token pages displaying v4.8.0. This is a version-scoped reference, not a latest-release claim. Original finish swatches are application data, not official Porsche paint codes.

### Static spacing

[Official reference](https://designsystem.porsche.com/v4/tokens/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| spacingStatic2Xs | 1px | Fixed spacing token. |
| spacingStaticXs | 4px | Fixed spacing token. |
| spacingStaticSm | 8px | Fixed spacing token. |
| spacingStaticMd | 16px | Fixed spacing token. |
| spacingStaticLg | 32px | Fixed spacing token. |
| spacingStaticXl | 48px | Fixed spacing token. |
| spacingStatic2Xl | 80px | Fixed spacing token. |

### Fluid spacing

[Official reference](https://designsystem.porsche.com/v4/tokens/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| spacingFluidXs | clamp(4px, 0.25vw + 3px, 8px) | Small adaptive separation. |
| spacingFluidSm | clamp(8px, 0.5vw + 6px, 16px) | Compact adaptive gap. |
| spacingFluidMd | clamp(16px, 1.25vw + 12px, 36px) | Example page padding. |
| spacingFluidLg | clamp(32px, 2.75vw + 23px, 76px) | Section spacing. |
| spacingFluidXl | clamp(48px, 3vw + 38px, 96px) | Large spacing. |
| spacingFluid2Xl | clamp(80px, 7.5vw + 56px, 200px) | Major composition spacing. |

### Color roles

[Official reference](https://designsystem.porsche.com/v4/tokens/color/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colorCanvas | light-dark(#fff,hsl(225 66.7% 1.2%)) | Page canvas. |
| colorSurface | light-dark(hsl(240 10% 95%),hsl(240 2% 10%)) | Secondary surface. |
| colorPrimary | light-dark(hsl(225 66.7% 1.2%),hsl(225 100% 99%)) | Primary text. |
| colorFocus | light-dark(#1A44EA,#1A44EA) | Keyboard focus. |
| colorContrastLow / colorContrastLower | Decorative only | Not accessibility-compliant text roles. |

### Type expressions

[Official reference](https://designsystem.porsche.com/v4/tokens/font/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontPorscheNext | 'Porsche Next','Arial Narrow',Arial,'Heiti SC',SimHei,sans-serif | Official family and fallbacks. |
| typescale2Xs | .75rem | Smallest listed type size. |
| typescaleXs | .875rem | Small metadata. |
| typescaleSm | 1rem | Body baseline. |
| typescaleMd | clamp(1.13rem, 0.21vw + 1.08rem, 1.33rem) | Fluid type. |
| typescale2Xl | clamp(1.6rem, 1.56vw + 1.29rem, 3.16rem) | Fluid large title. |
| leadingNormal | calc(6px + 2.125ex) | Typeface-sensitive line height. |
| fontWeightNormal / Semibold / Bold | 400 / 600 / 700 | Available weights. |

### Shape

[Official reference](https://designsystem.porsche.com/v4/tokens/border/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| radiusXs / Sm / Md | 2px / 4px / 6px | Small shapes. |
| radiusLg | 8px | Compact interactive controls. |
| radiusXl | 12px | Standard interactive controls. |
| radius2Xl | 16px | Notifications. |
| radius3Xl | 24px | Tiles and dialog-like containers. |
| radius4Xl | 32px | Largest fixed radius. |
| radiusFull | calc(infinity * 1px) | Standalone pill indicators. |

### Breakpoints

[Official reference](https://designsystem.porsche.com/v4/tokens/breakpoint/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| breakpointXs | 480 | Numeric token used with px. |
| breakpointSm | 760 | Numeric token used with px. |
| breakpointMd | 1000 | Numeric token used with px. |
| breakpointLg | 1300 | Numeric token used with px. |
| breakpointXl | 1760 | Numeric token used with px. |
| breakpoint2Xl | 1920 | Numeric token used with px. |

### Segmented choice contract

[Official reference](https://designsystem.porsche.com/v4/components/segmented-control/api/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| value | string \| number | Selected item value. |
| change event | detail: { value: string \| number } | Update application state. |
| columns | auto or 1–25; responsive values supported | Control the item grid. |
| noWrap | false by default | True creates a scrollable single row. |
| state | none / error / success | Validation styling. |
| disabled | Excludes value from form submission | Different from an ordinary unselected item. |

## Porsche Design System Use the v4 foundation as a complete set

### Global variables are now required

Version 4 builds component styles on global CSS variables. Importing the global stylesheet is therefore an architectural requirement, not a decorative reset. The same import includes normalization and Porsche Next font-face definitions.

This reference keeps the v4 component and token contracts together. Older examples using text-field wrappers or per-component theme props should not be transplanted without the migration guide. The documentation itself is versioned, so the page names its scope rather than claiming a timeless API.

[Supporting specification](https://designsystem.porsche.com/v4/news/migration-guide/porsche-design-system/)

## Porsche Design System Color scheme selects complete role pairs

### Separate interface roles from finish samples

The canvas, surface and primary foreground tokens contain light-dark() pairs. The CSS color-scheme property chooses the branch. Set light, dark or light dark depending on whether the application fixes a mode or follows the user’s preference.

The finish colors in this example are independent original swatches. Switching the interface to dark mode changes surrounding surfaces and text, not the selected finish. The lower contrast color roles are for decoration; using them for an essential option label would violate the token’s intended boundary.

[Supporting specification](https://designsystem.porsche.com/v4/tokens/color/)

## Porsche Design System Fluid rhythm and fixed control gaps coexist

### Use clamp expressions where space should grow

Porsche provides both static and fluid scales. The native entry uses the medium fluid expression for page padding, while 16px and 32px gaps provide stable relationships inside the option area. A fluid maximum avoids endlessly expanding whitespace on a wide display.

The specimen switches from a wide visual-and-controls arrangement to stacked sections below 760px, one of the documented breakpoint values. The decision to stack is an application composition choice; the breakpoint value itself is the system reference.

[Supporting specification](https://designsystem.porsche.com/v4/tokens/spacing/)

## Porsche Design System Typography depends on the supplied face

### The line-height expression is not a generic ratio

Porsche Next has a documented fallback stack and a type scale with fixed small sizes and fluid larger sizes. leadingNormal uses ex units, which respond to the font’s x-height, plus a fixed pixel addition. Replacing that with an arbitrary 1.5 ratio changes the intended rhythm.

The offline interpretation uses a local fallback and a comfortably readable line height rather than pretending the licensed face has been bundled. In the native entry the global stylesheet defines the actual font face. Headings use regular weight in the v4 design language; larger type does not require a heavy weight to establish hierarchy.

[Supporting specification](https://designsystem.porsche.com/v4/tokens/font/)

## Porsche Design System Controls and containers use different radii

### Twelve and twenty-four pixels define the main hierarchy

The standard interactive radius is 12px; the card and dialog family uses 24px. Compact controls move to 8px, while notifications use 16px. Applying the largest rounding to every element would erase these relationships.

The original preview places its vehicle study on a broad 24px surface and uses 12px controls. Its vehicle silhouette is original CSS artwork, not a Porsche model render or product photograph. The same composition can be used for a material selector without implying real configuration availability.

[Supporting specification](https://designsystem.porsche.com/v4/tokens/border/)

## Porsche Design System A segmented control is a choice, not a tab bar

### Use stable values and one state owner

Each p-segmented-control-item supplies a value. A change event returns that value in event.detail, which the example stores before redrawing the summary. The group exposes a visible label so the finish options and wheel options remain distinguishable.

The v4 API supports a responsive column count and an optional non-wrapping scroller. Short options can remain visible together; long localized labels should wrap or use an intentional scroller instead of being clipped. Disabled controls are excluded from form data, which matters when extending this sample into a real form.

1. Initialize finish and wheel values once in application state.
2. Read detail.value from the group’s change event.
3. Update the visible study and textual selection together.
4. Clear any previously kept summary after an edit.

[Supporting specification](https://designsystem.porsche.com/v4/components/segmented-control/api/)

## Porsche Design System A local selection is not a completed transaction

### Use explicit button types

p-button defaults to submit. The example sets type="button" because keeping a combination and changing color scheme are local interactions. Navigation belongs to the Link component rather than a button with an invented destination.

The primary action reports exactly what happened: a combination was kept for the current page session. It does not claim persistence after reload, account storage or a placed order. This limited behavior is deliberate and complete for an interface specimen.

- Primary keeps the current local combination.
- Secondary changes the interface color scheme.
- Visible labels remain present for both actions.
- No loading spinner is shown when there is no pending operation.

[Supporting specification](https://designsystem.porsche.com/v4/components/button/api/)

## Porsche Design System Load components and protect their first render

### Loader, stylesheet and compiler work together

The Vite configuration injects the official loader partial into the document body. The main entry imports the global stylesheet and renders real custom elements. Scoped :not(:defined) rules prevent the selected component tags from flashing before registration.

The documented Vite setup excludes Lightning CSS’s LightDark transform because that polyfill is identified as broken. Keeping this exclusion matters: compiling away the token function incorrectly can break the theme even when the component markup is correct. Recommended preloads can be added later through the documented font, icon and component partials.

[Supporting specification](https://designsystem.porsche.com/v4/developing/vanilla-js/getting-started/)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Original offline HTML/CSS interpretation of v4 token roles and segmented-choice behavior. No native PDS runtime, remote fonts, official model imagery or real vehicle data.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Original finish study</title><style>:root{color-scheme:light;--canvas:#fff;--surface:hsl(240 10% 95%);--ink:hsl(225 66.7% 1.2%);--line:#c8c8cd;--paint:#b9b6ae}*{box-sizing:border-box}body{margin:0;background:var(--canvas);color:var(--ink);font:16px/1.5 'Arial Narrow',Arial,sans-serif}body.dark{color-scheme:dark;--canvas:hsl(225 66.7% 1.2%);--surface:hsl(240 2% 10%);--ink:#fcfcff;--line:#515156}button{font:inherit;cursor:pointer}button:focus-visible,input:focus-visible+span{outline:3px solid #1a44ea;outline-offset:4px}header{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:24px 32px;border-bottom:1px solid var(--line)}header b{letter-spacing:3px;font-weight:400}header button{border:1px solid var(--line);color:var(--ink);background:var(--canvas);border-radius:12px;padding:8px 16px}main{max-width:1200px;padding:clamp(16px,1.25vw + 12px,36px);margin:auto}h1{font-size:clamp(1.6rem,1.56vw + 1.29rem,3.16rem);font-weight:400;line-height:1.2;margin:16px 0}.intro{color:var(--ink);opacity:.8;max-width:650px}.layout{display:grid;grid-template-columns:1.4fr 1fr;gap:32px;margin-top:32px}.stage{background:var(--surface);border-radius:24px;display:flex;flex-direction:column;justify-content:center;min-height:360px;overflow:hidden;padding:32px;position:relative}.scene{height:210px;position:relative;width:100%;max-width:520px;margin:auto}.car{height:80px;width:94%;position:absolute;bottom:28px;left:3%;background:var(--paint);border-radius:60% 35% 18% 22% / 75% 65% 25% 35%;box-shadow:inset 0 5px 10px #ffffff70,inset 0 -10px 12px #0003}.roof{position:absolute;bottom:80px;left:25%;width:46%;height:70px;background:var(--paint);border-radius:65% 55% 0 0;transform:skewX(-9deg)}.window{position:absolute;inset:9px 13px 4px;background:linear-gradient(135deg,#202d37,#67737b);border-radius:70% 52% 0 0;border-right:7px solid var(--paint)}.window:after{content:'';position:absolute;left:46%;top:0;height:100%;width:6px;background:var(--paint)}.wheel{position:absolute;bottom:12px;width:69px;height:69px;background:repeating-conic-gradient(#d2d5d8 0deg 13deg,#42464b 13deg 60deg);border:11px solid #191a1d;border-radius:50%;box-shadow:0 0 0 4px #08090a}.wheel.a{left:16%}.wheel.b{right:12%}.aero .wheel{background:radial-gradient(circle,#505860 0 18%,#c6c9cc 20% 65%,#464a4d 68%)}.headlight{position:absolute;right:0;top:18px;width:34px;height:12px;background:#fff9d8;border:2px solid #ffffff80;border-radius:80%;transform:rotate(15deg)}.shadow{height:10px;background:#0002;position:absolute;bottom:7px;width:90%;left:5%;border-radius:50%;filter:blur(5px)}.stage small{font-size:12px;opacity:.7}.panel{padding:8px 0}fieldset{border:0;padding:0;margin:0 0 32px;min-width:0}legend{font-size:18px;margin-bottom:16px}.segments{display:flex;background:var(--surface);padding:4px;border-radius:16px;gap:4px}.segments label{flex:1;min-width:0;position:relative;text-align:center;cursor:pointer}.segments input{position:absolute;opacity:0;width:1px;height:1px}.segments span{display:block;padding:12px 8px;border:1px solid transparent;border-radius:12px}.segments input:checked+span{background:var(--canvas);border-color:var(--ink);box-shadow:0 1px 4px #0002}.swatch{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;border:1px solid #777}.summary{border-top:1px solid var(--line);padding-top:24px;margin:0 0 24px}.summary small{display:block;opacity:.65;margin-bottom:4px}.summary strong{font-weight:400;font-size:20px}.primary{border:0;border-radius:12px;min-height:52px;background:var(--ink);color:var(--canvas);padding:12px 24px;width:100%}.saved{border-left:3px solid var(--ink);padding-left:16px;margin-top:24px}.saved:empty{display:none}footer{font-size:12px;opacity:.7;padding-top:32px}@media(max-width:759px){header{padding:16px}header b{font-size:13px;letter-spacing:1px}.layout{grid-template-columns:1fr;gap:24px}.stage{min-height:270px;padding:16px}.scene{height:210px}.wheel{width:53px;height:53px;border-width:8px;bottom:21px}.car{bottom:38px}.roof{bottom:91px;height:60px}.segments span{padding:12px 5px;font-size:14px}fieldset{margin-bottom:24px}}
</style><header><b>DESIGN STUDY / 01</b><button id="theme" type="button">Dark interface</button></header><main><h1>A different point of view.</h1><p class="intro">Explore two small choices in an original vehicle study. See how a restrained interface keeps the object at the center.</p><div class="layout"><div class="stage"><div class="scene" id="scene" role="img" aria-label="Original vehicle illustration in Chalk with Classic wheels"><div class="shadow"></div><div class="roof"><div class="window"></div></div><div class="car"><div class="headlight"></div></div><div class="wheel a"></div><div class="wheel b"></div></div><small>Original illustration · Not a Porsche model render</small></div><section class="panel" aria-label="Study options"><fieldset><legend>Finish</legend><div class="segments"><label><input type="radio" name="paint" value="chalk" checked><span><i class="swatch" style="background:#b9b6ae"></i>Chalk</span></label><label><input type="radio" name="paint" value="blue"><span><i class="swatch" style="background:#456171"></i>Coastal blue</span></label><label><input type="radio" name="paint" value="red"><span><i class="swatch" style="background:#9f2937"></i>Garnet</span></label></div></fieldset><fieldset><legend>Wheel study</legend><div class="segments"><label><input type="radio" name="wheel" value="Classic" checked><span>Classic</span></label><label><input type="radio" name="wheel" value="Aero"><span>Aero</span></label></div></fieldset><p class="summary" aria-live="polite"><small>YOUR COMBINATION</small><strong id="summary">Chalk · Classic</strong></p><button class="primary" id="save" type="button">Keep this combination</button><p class="saved" id="saved" role="status"></p></section></div><footer>Independent PDS v4 interpretation. Original finish names and illustration; no pricing, vehicle specification, live configuration or order. Choices last only for this page session.</footer></main><script>const colors={chalk:'#b9b6ae',blue:'#456171',red:'#9f2937'},names={chalk:'Chalk',blue:'Coastal blue',red:'Garnet'};function values(){return[document.querySelector('[name=paint]:checked').value,document.querySelector('[name=wheel]:checked').value]}function update(){const[p,w]=values();document.documentElement.style.setProperty('--paint',colors[p]);document.querySelector('#scene').classList.toggle('aero',w==='Aero');document.querySelector('#scene').setAttribute('aria-label',`Original vehicle illustration in ${names[p]} with ${w} wheels`);document.querySelector('#summary').textContent=`${names[p]} · ${w}`;document.querySelector('#saved').textContent=''}document.querySelectorAll('input').forEach(x=>x.addEventListener('change',update));document.querySelector('#save').onclick=()=>{const[p,w]=values();document.querySelector('#saved').textContent=`Kept for this page session: ${names[p]}, ${w}. No order submitted.`};document.querySelector('#theme').onclick=e=>{const dark=document.body.classList.toggle('dark');e.currentTarget.textContent=dark?'Light interface':'Dark interface'};</script></html>

```

[Code reference](https://designsystem.porsche.com/v4/components/segmented-control/api/)

- Finish and wheel choices update an original configurator illustration. They are not Porsche product specifications; native segmented-control events appear in the separate v4 example.

### Two controlled choices with a session-only summary

Native p-segmented-control elements emit change events with detail.value; p-button uses click and an explicit type.

```typescript
import './style.css';
const paints={chalk:'#b9b6ae',blue:'#456171',red:'#9f2937'};
const names={chalk:'Chalk',blue:'Coastal blue',red:'Garnet'};
type Paint=keyof typeof paints;
let paint:Paint='chalk',wheel='Classic';
document.querySelector<HTMLDivElement>('#app')!.innerHTML=`
<main><h1>Explore an original color study</h1>
<p>This specimen is not a real vehicle configurator or order.</p>
<div class="options">
<p-segmented-control id="paint" label="Finish" value="chalk">
 <p-segmented-control-item value="chalk">Chalk</p-segmented-control-item>
 <p-segmented-control-item value="blue">Coastal blue</p-segmented-control-item>
 <p-segmented-control-item value="red">Garnet</p-segmented-control-item>
</p-segmented-control>
<p-segmented-control id="wheel" label="Wheel study" value="Classic">
 <p-segmented-control-item value="Classic">Classic</p-segmented-control-item>
 <p-segmented-control-item value="Aero">Aero</p-segmented-control-item>
</p-segmented-control>
</div><div class="preview"><div id="swatch" style="height:120px;border-radius:12px"></div>
<p id="summary" aria-live="polite"></p></div>
<div class="actions"><p-button id="save" type="button">Keep this combination</p-button>
<p-button id="scheme" type="button" variant="secondary">Switch color scheme</p-button></div>
<p id="saved" role="status"></p></main>`;
function render(){document.querySelector<HTMLElement>('#swatch')!.style.background=paints[paint];document.querySelector('#summary')!.textContent=`${names[paint]} · ${wheel} wheel study`;document.querySelector('#saved')!.textContent='';}
document.querySelector('#paint')!.addEventListener('change',e=>{const v=(e as CustomEvent<{value:string}>).detail.value;if(v in paints){paint=v as Paint;render();}});
document.querySelector('#wheel')!.addEventListener('change',e=>{wheel=String((e as CustomEvent<{value:string}>).detail.value);render();});
document.querySelector('#save')!.addEventListener('click',()=>{document.querySelector('#saved')!.textContent=`Kept for this page session: ${names[paint]}, ${wheel}. No order submitted.`;});
document.querySelector('#scheme')!.addEventListener('click',()=>{const root=document.documentElement;root.style.colorScheme=root.style.colorScheme==='dark'?'light':'dark';});
render();
```

[Code reference](https://designsystem.porsche.com/v4/components/segmented-control/api/)

- Changing either choice clears the previous kept combination.
- The color-scheme property controls the system theme; finish swatches remain original application data.
- The example does not collect contact information, reserve a vehicle or submit an order.

## Implementation Starting Point

Version 4 native Web Component setup with the documented global stylesheet and loader partial. The offline preview has no remote fonts or package runtime; native package compilation was not verified here.

```text
# In a new Vite vanilla-ts project:
npm create vite@latest pds-specimen -- --template vanilla-ts
cd pds-specimen
npm install
npm install @porsche-design-system/components-js@4
npm install --save-dev lightningcss

// vite.config.ts
import {defineConfig} from 'vite';
import {Features} from 'lightningcss';
import {getLoaderScript} from '@porsche-design-system/components-js/partials';
export default defineConfig({
 plugins:[{name:'pds-loader',transformIndexHtml(html){
  return html.replace('</body>',getLoaderScript()+'</body>');
 }}],
 css:{transformer:'lightningcss',lightningcss:{exclude:Features.LightDark}}
});

/* src/style.css */
@import '@porsche-design-system/components-js';
html { color-scheme: light; }
:is(p-button,p-segmented-control,p-segmented-control-item):not(:defined){visibility:hidden}
main{max-width:60rem;margin:auto;padding:clamp(16px,1.25vw + 12px,36px)}
.options{display:grid;gap:32px}
.preview{padding:32px;border-radius:24px;margin-block:32px;border:1px solid currentColor}
.actions{display:flex;gap:16px;flex-wrap:wrap}

# Replace src/main.ts with the example below, then:
npm run dev
```

## Agent Prompt

Build a version 4 PDS composition with mandatory global styles, the loader partial, color-scheme, actual fluid spacing and 12px control/24px container radii. Use segmented-control change detail.value for two original sample choices and explicit type=button for local actions. Do not mix legacy wrapper APIs or represent the sample as a real vehicle configuration.

## Sources

- [Version 4 migration](https://designsystem.porsche.com/v4/news/migration-guide/porsche-design-system/) — Global styles and color-scheme changes.
- [Vanilla JS setup](https://designsystem.porsche.com/v4/developing/vanilla-js/getting-started/) — Loader, stylesheet and Vite configuration.
- [Spacing tokens](https://designsystem.porsche.com/v4/tokens/spacing/) — Static and fluid expressions.
- [Color tokens](https://designsystem.porsche.com/v4/tokens/color/) — Paired roles and decorative limits.
- [Font tokens](https://designsystem.porsche.com/v4/tokens/font/) — Porsche Next, type sizes and line height.
- [Border tokens](https://designsystem.porsche.com/v4/tokens/border/) — Control and container radii.
- [Breakpoint tokens](https://designsystem.porsche.com/v4/tokens/breakpoint/) — Actual responsive thresholds.
- [Segmented control API](https://designsystem.porsche.com/v4/components/segmented-control/api/) — Values, change events and form behavior.
- [Button API](https://designsystem.porsche.com/v4/components/button/api/) — Types, variants and pending state.
