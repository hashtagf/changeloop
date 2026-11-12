# Adeo Mozaic Design System — OpenDesign Application Guide

Build a practical quantity-control composition with Mozaic’s 16px magic unit, matched 48px controls, real SCSS imports and BEM classes. The shelf planner makes bounds, typed errors and a local materials summary observable.

Independent OpenDesign reference to Mozaic. The sample is not an ADEO or Leroy Merlin storefront, a live order or structural guidance. Documentation snapshots have differing version labels.

## Source Reference

- **Organization:** ADEO ([source](https://mozaic.adeo.cloud/))
- **Styles package:** @mozaic-ds/styles ([source](https://mozaic.adeo.cloud/get-started/developers/installation/))
- **Base magic unit:** 16px expressed in rem ([source](https://mozaic.adeo.cloud/foundations/spacing/magic-unit/))
- **Medium control height:** 48px ([source](https://mozaic.adeo.cloud/components/buttons/))
- **Default body:** 16px regular ([source](https://mozaic.adeo.cloud/foundations/typography/body-styles/))
- **Default token theme:** Leroy Merlin ([source](https://mozaic.adeo.cloud/get-started/developers/customize-tokens/))


## Design Reference

Mozaic SCSS/BEM documentation: foundation and installation pages identify v1.85.0; the quantity code reference identifies v1.76.0. These are documented reference contracts, not a claim that all pages track one latest package version.

### Magic-unit references

[Official reference](https://mozaic.adeo.cloud/foundations/spacing/magic-unit/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| mu025 | 4px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu050 | 8px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu075 | 12px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu100 | 16px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu125 | 20px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu150 | 24px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu175 | 28px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu200 | 32px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu250 | 40px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu300 | 48px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu350 | 56px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu400 | 64px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu500 | 80px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu600 | 96px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |
| mu700 | 112px | Rem-based spacing reference; pixel equivalent assumes the documented 16px base. |

### Button dimensions

[Official reference](https://mozaic.adeo.cloud/components/buttons/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Small height | 32px / 2mu | Compact controls. |
| Medium height | 48px / 3mu | Use for the mobile quantity composition. |
| Large height | 56px / 3.5mu | High-emphasis large action. |
| Text + icon, small / medium | 24px icon | Keep icon and label balanced. |
| Text + icon, large | 32px icon | Large button. |
| Icon-only, medium / large | 32px icon | Square control. |

### Body hierarchy

[Official reference](https://mozaic.adeo.cloud/foundations/typography/body-styles/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| mt-body-m | 16px regular | Default body. |
| Small body | 14px | Minimum recommended multiline body. |
| Large body | 18px | Upper recommended paragraph size. |

### Quantity component anatomy

[Official reference](https://mozaic.adeo.cloud/components/form/quantity-selector/code/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| mc-quantity-selector | Wrapper | Holds two controls and the input. |
| mc-quantity-selector__input | Input element | Also apply mc-text-input. |
| mc-quantity-selector__button-left | Decrement element | Also mc-button--square and --bordered. |
| mc-quantity-selector__button-right | Increment element | Also mc-button--square and --bordered. |
| Small composition | mc-text-input--s + mc-button--s | Change the complete group together. |
| is-disabled | Visual state class | Pair with native disabled for actual behavior. |

### Build and customization

[Official reference](https://mozaic.adeo.cloud/get-started/developers/installation/postcss/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| postcssPluginConfig | @mozaic-ds/css-dev-tools/postcssPluginConfig | Required plugin list. |
| Parser | postcss-scss | Read the SCSS source. |
| Production environment | MOZAIC_ENV=production | Enables production plugin configuration. |

### Spacing utilities

[Official reference](https://mozaic.adeo.cloud/foundations/spacing/margin-and-paddings/code/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| mu-mb-100 | 16px bottom margin | Space between components. |
| mu-pl-050 | 8px left padding | Utility spacing. |
| make-space-util(m, t, 075) | Top margin at mu075 | Generate a chosen utility. |

## Adeo Mozaic Design System SCSS components with a configurable retail identity

### ADEO is the organization, not the default preset

Mozaic ships source styles and tokens separately from fonts and SVG icons. Its default token theme is Leroy Merlin; ADEO is an explicit preset. A green original preview is therefore not evidence of an official ADEO corporate color.

For the ADEO preset, create mozaic.config.js with preset: "adeo" and tokens.localTokensExportPath, then run npx mozaic-tokens-build. A custom token directory deep-merges corresponding JSON paths instead of replacing unrelated values. Theme generation and component styling are separate build concerns.

- styles supplies SCSS components.
- tokens supplies source and generated token formats.
- web-fonts and icons supply separate assets.
- css-dev-tools supplies build and lint configuration.

[Supporting specification](https://mozaic.adeo.cloud/get-started/developers/customize-tokens/)

## Adeo Mozaic Design System Use the magic unit without freezing text containers

### A rem-based 16px reference

The small end of Mozaic’s scale has quarter-unit increments, the middle uses half units and larger distances use whole units. The reference table makes the actual named steps available without inventing a second spacing system.

The planner uses 16px gaps, 24px interior spacing and a 48px control height. These choices put the component on the same rhythm while allowing surrounding cards and text to grow. A minimum control height is preferable to clipping a translated or enlarged label into a fixed-height content box.

[Supporting specification](https://mozaic.adeo.cloud/foundations/spacing/magic-unit/)

## Adeo Mozaic Design System Keep body copy readable beside dense controls

### Three practical body sizes

The documented body scale centers on 16px regular. Fourteen pixels is the lower recommendation for multiline text and 18px the upper paragraph recommendation. The preview uses a system-font fallback and does not pretend to bundle Mozaic’s web-font package.

Use the larger title to name the project, body text to explain the calculation and a smaller supporting line for the example’s scope. The materials values remain real text rather than text drawn into the shelf illustration.

[Supporting specification](https://mozaic.adeo.cloud/foundations/typography/body-styles/)

## Adeo Mozaic Design System One component, three coordinated elements

### The wrapper does not provide application state

The quantity selector combines a square bordered decrement button, a numeric input and a matching increment button. Import all three component styles, including text input and button; importing only quantity-selector does not constitute the documented composition.

For a compact variant, change both button and input sizes together. The usage guidance requires the medium size at small breakpoints, so shrinking everything on a phone is the wrong optimization. The preview keeps 48px controls and stacks the surrounding composition instead.

[Supporting specification](https://mozaic.adeo.cloud/components/form/quantity-selector/)

## Adeo Mozaic Design System Boundary styling must agree with real behavior

### Typed input has more states than plus and minus

The original example validates integers from 1 to 12. At one, decrement is genuinely disabled; at twelve, increment is disabled. The is-disabled class alone would not stop keyboard activation. Native disabled and the visual class are synchronized.

An empty or fractional typed value is not silently converted into a plausible materials list. Submission explains the accepted range and focuses the field. A subsequent edit clears the old prepared result, because that result described the previous quantity. The shelf calculation is fictional sample data, not structural or purchasing advice.

1. Read the typed value without treating an empty string as zero.
2. Validate integer and range before calculating the sample counts.
3. Update both boundary buttons and the accessible error state.
4. Create a local snapshot only after validation passes.

[Supporting specification](https://mozaic.adeo.cloud/components/form/quantity-selector/code/)

## Adeo Mozaic Design System Use one solid action for the project outcome

### Separate stepping from preparing

The stepper uses quiet bordered square controls because it changes an input. The solid Prepare materials list button acts on the complete form. Two same-color solid actions side by side would obscure this distinction.

The resulting message explicitly says that nothing was ordered. There is no fake loading state, payment flow or network submission. A concrete summary is enough to demonstrate the relationship between values and actions.

[Supporting specification](https://mozaic.adeo.cloud/components/buttons/)

## Adeo Mozaic Design System Compile the documented imports through Mozaic’s pipeline

### Settings first, component output second

The all-settings import supplies variables, functions and mixins but emits no component CSS by itself. The supplied bundle follows it with text-input, button and quantity-selector. The provided plugin configuration resolves Mozaic import paths and runs its expected transformations.

The setup supplies a PostCSS CLI runner because the plugin package does not provide one. For production, MOZAIC_ENV changes the plugin configuration. The installation page now requires Node 20+ and recommends Dart Sass; older prose describing Node Sass should not be used as a reason to install the deprecated compiler.

[Supporting specification](https://mozaic.adeo.cloud/get-started/developers/installation/import/)

## Adeo Mozaic Design System Keep utility spacing outside component internals

### Use scale values where the component owns its layout

Mozaic’s margin and padding utilities are intended for spacing between components. Within a new component, use the SCSS magic-unit variables so the component remains self-contained. A border may need to be subtracted from a target dimension, as in calc($mu025 - 1px), to retain the intended rhythm.

The offline specimen does not claim native Mozaic CSS execution. It interprets the documented dimensions and quantity anatomy with original colors, a CSS shelf illustration and a local-only interaction. The separate code block supplies the actual library classes and build connection.

[Supporting specification](https://mozaic.adeo.cloud/foundations/spacing/margin-and-paddings/code/)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Original offline HTML/CSS interpretation of Mozaic’s magic unit and medium quantity control; original illustration and application palette, not native library CSS.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Shelf materials planner</title><style>*{box-sizing:border-box}body{margin:0;background:#f6f5ef;color:#242920;font:16px/1.5 Arial,sans-serif}button,input{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #23682c;outline-offset:4px}header{border-bottom:1px solid #d9ddd1;padding:16px 32px;display:flex;justify-content:space-between;gap:16px}header b{font-size:18px}header span,.note{font-size:14px;color:#5a6154}main{max-width:1056px;margin:auto;padding:32px}h1{font-size:36px;line-height:1.1;letter-spacing:-1px;margin:8px 0 16px}p{margin:0 0 16px}.eyebrow{font-size:12px;letter-spacing:2px;color:#23682c;font-weight:bold}.layout{display:grid;grid-template-columns:1.1fr 1fr;gap:32px}.art{background:#e5eadc;border-radius:4px;min-height:350px;display:grid;place-items:center;position:relative;overflow:hidden}.wall{width:78%;height:220px;background:linear-gradient(90deg,transparent 49.6%,#d8dfcf 50%,transparent 50.4%);position:relative}.board{position:absolute;left:0;right:0;top:130px;height:18px;background:repeating-linear-gradient(0deg,#bd9b6e 0 3px,#c6a477 3px 7px);box-shadow:0 10px 12px #26341b20;transform:skewY(-3deg)}.bracket{position:absolute;top:148px;width:12px;height:62px;background:#727867;transform:skewY(-3deg)}.bracket.a{left:15%}.bracket.b{right:15%}.pot{position:absolute;left:23%;top:58px;width:47px;height:72px;background:#c88462;border-radius:3px 3px 15px 15px}.leaf{position:absolute;width:52px;height:34px;background:#3d6e38;left:4px;top:-22px;border-radius:100% 0 100% 0;transform:rotate(-25deg)}.leaf:after{content:'';position:absolute;width:45px;height:30px;background:#638a47;left:20px;top:-15px;border-radius:0 100% 0 100%;transform:rotate(45deg)}.books{position:absolute;top:48px;right:20%;height:80px;display:flex;gap:4px;align-items:end}.books i{width:18px;height:76px;background:#f4efe4;display:block;border-top:6px solid #7f9673}.books i:nth-child(2){height:88px;background:#d3b795}.books i:nth-child(3){height:68px;background:#718268;transform:rotate(-10deg)}.art small{position:absolute;bottom:16px;left:24px;color:#526448}.panel{background:#fff;padding:24px;border:1px solid #d9ddd1;border-radius:4px}h2{font-size:24px;line-height:1.25;margin:0 0 8px}label{display:block;font-weight:bold;margin:24px 0 8px}.quantity{display:flex;max-width:240px;margin-bottom:8px}.quantity button,.quantity input{height:48px;border:1px solid #727a6a;background:#fff}.quantity button{width:48px;color:#23682c;font-size:24px;flex-shrink:0}.quantity button:first-child{border-radius:4px 0 0 4px}.quantity button:last-child{border-radius:0 4px 4px 0}.quantity input{width:96px;min-width:0;border-left:0;border-right:0;text-align:center;appearance:textfield}.quantity input::-webkit-inner-spin-button{appearance:none}button:disabled{color:#a2a69b;background:#f1f2ed;cursor:default}.materials{margin:24px 0;display:grid;grid-template-columns:repeat(3,1fr);border-block:1px solid #d9ddd1;padding:16px 0}.materials strong{font-size:24px;display:block}.materials span{font-size:14px;color:#62695c}.primary{min-height:48px;padding:12px 24px;background:#23682c;color:#fff;border:0;border-radius:4px;width:100%;font-weight:bold}.error{color:#ac2323;margin:8px 0;font-size:14px}.result{margin-top:16px;background:#eaf3e2;padding:16px;border-left:4px solid #23682c}.result:empty{display:none}footer{padding-top:24px;font-size:14px;color:#62695c}@media(max-width:650px){header{padding:16px}header span{max-width:140px}main{padding:24px 16px}h1{font-size:32px}.layout{grid-template-columns:1fr;gap:16px}.art{min-height:260px}.panel{padding:24px}.materials{gap:12px}}
</style><header><b>PROJECT WORKSHOP</b><span>Original Mozaic interpretation</span></header><main><p class="eyebrow">SMALL PROJECT · BIG DIFFERENCE</p><h1>Make room for what matters.</h1><p>Plan a simple shelf arrangement and prepare its sample materials list.</p><div class="layout"><div class="art" role="img" aria-label="Original illustration of a wooden shelf with books and a potted plant"><div class="wall"><div class="board"></div><div class="bracket a"></div><div class="bracket b"></div><div class="pot"><div class="leaf"></div></div><div class="books"><i></i><i></i><i></i></div></div><small>Original shelf illustration</small></div><form class="panel" id="planner" novalidate><h2>Your shelf project</h2><p class="note">Each sample shelf uses one board, two brackets and four screws.</p><label for="quantity">Number of shelves</label><div class="quantity"><button id="minus" type="button" aria-label="Remove one shelf" aria-controls="quantity">−</button><input id="quantity" type="number" min="1" max="12" step="1" required value="2" aria-describedby="hint error"><button id="plus" type="button" aria-label="Add one shelf" aria-controls="quantity">+</button></div><p class="note" id="hint">Choose a whole number from 1 to 12.</p><p class="error" id="error" role="alert"></p><div class="materials" aria-live="polite"><div><strong id="boards">2</strong><span>Boards</span></div><div><strong id="brackets">4</strong><span>Brackets</span></div><div><strong id="screws">8</strong><span>Screws</span></div></div><button type="submit" class="primary">Prepare materials list</button><div id="result" class="result" role="status"></div></form></div><footer>Local interaction example. No order is placed. Sample quantities are illustrative, not structural guidance.</footer></main><script>const input=document.querySelector('#quantity'),minus=document.querySelector('#minus'),plus=document.querySelector('#plus'),error=document.querySelector('#error'),result=document.querySelector('#result');function number(){return input.value.trim()===''?NaN:Number(input.value)}function valid(n){return Number.isInteger(n)&&n>=1&&n<=12}function update(show=false){const n=number(),ok=valid(n);result.textContent='';minus.disabled=ok&&n===1;plus.disabled=ok&&n===12;input.setAttribute('aria-invalid',String(!ok&&show));error.textContent=!ok&&show?'Enter a whole number from 1 to 12.':'';document.querySelector('#boards').textContent=ok?n:'—';document.querySelector('#brackets').textContent=ok?n*2:'—';document.querySelector('#screws').textContent=ok?n*4:'—';return ok}minus.onclick=()=>{input.value=String(Math.max(1,(valid(number())?number():1)-1));update()};plus.onclick=()=>{input.value=String(Math.min(12,(valid(number())?number():0)+1));update()};input.oninput=()=>update();document.querySelector('#planner').onsubmit=e=>{e.preventDefault();if(!update(true)){input.focus();return}result.textContent=`Local list prepared: ${number()} boards, ${number()*2} brackets and ${number()*4} screws. Nothing was ordered.`};update();</script></html>

```

[Code reference](https://mozaic.adeo.cloud/components/form/quantity-selector/)

- Shelf quantities produce a materials list, not an order. The native markup needs the documented Mozaic PostCSS output; this standalone document includes its own interpretation styles.

### A bounded shelf quantity and derived materials list

Real Mozaic classes surround a native number input. Original JavaScript supplies integer validation, boundary disabling and a local-only summary.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="./mozaic.css"><title>Shelf materials</title>
<main><h1>Plan a shelf project</h1>
<form id="planner" novalidate>
<label for="quantity">Number of shelves</label>
<p id="hint">Choose 1 to 12. Each sample shelf needs two brackets and four screws.</p>
<div class="mc-quantity-selector">
<button type="button" id="minus" class="mc-button mc-button--square mc-button--bordered mc-quantity-selector__button-left" aria-controls="quantity" aria-label="Remove one shelf">−</button>
<input id="quantity" name="quantity" class="mc-text-input mc-quantity-selector__input" type="number" min="1" max="12" step="1" value="2" required aria-describedby="hint error">
<button type="button" id="plus" class="mc-button mc-button--square mc-button--bordered mc-quantity-selector__button-right" aria-controls="quantity" aria-label="Add one shelf">+</button>
</div>
<p id="error" role="alert"></p><p id="counts" aria-live="polite"></p>
<button type="submit" class="mc-button">Prepare materials list</button>
<p id="result" role="status"></p></form></main>
<script>
const input=document.querySelector('#quantity'), minus=document.querySelector('#minus'), plus=document.querySelector('#plus');
const error=document.querySelector('#error'), counts=document.querySelector('#counts'), result=document.querySelector('#result');
function number(){return input.value.trim()===''?NaN:Number(input.value);}
function valid(n){return Number.isInteger(n)&&n>=1&&n<=12;}
function update(showError=false){
 const n=number(),ok=valid(n); result.textContent='';
 minus.disabled=ok&&n===1; plus.disabled=ok&&n===12;
 minus.classList.toggle('is-disabled',minus.disabled);plus.classList.toggle('is-disabled',plus.disabled);
 input.setAttribute('aria-invalid',String(!ok&&showError));
 error.textContent=!ok&&showError?'Enter a whole number from 1 to 12.':'';
 counts.textContent=ok?`${n} boards · ${n*2} brackets · ${n*4} screws`:'Enter a quantity to calculate materials.';
 return ok;
}
minus.onclick=()=>{input.value=String(Math.max(1,(valid(number())?number():1)-1));update();};
plus.onclick=()=>{input.value=String(Math.min(12,(valid(number())?number():0)+1));update();};
input.oninput=()=>update();
document.querySelector('#planner').onsubmit=e=>{e.preventDefault();if(!update(true)){input.focus();return;}result.textContent=`Local list prepared: ${number()} boards, ${number()*2} brackets and ${number()*4} screws. Nothing was ordered.`;};
update();
</script></html>
```

[Code reference](https://mozaic.adeo.cloud/components/form/quantity-selector/code/)

- The two stepper buttons use type="button" so they never submit the form.
- Native min/max/step remain meaningful, while custom validation covers empty and fractional input.
- Changing a quantity invalidates the previous prepared snapshot.

## Implementation Starting Point

Public SCSS workflow using the documented PostCSS configuration. Save the HTML example under public/index.html. Native package build was not executed here; the offline preview is an independent interpretation. Current installation guidance uses Dart Sass, superseding the older PostCSS page’s Node Sass wording.

```text
# Node 20+. Use a CommonJS project for this configuration.
npm install @mozaic-ds/styles sass
npm install --save-dev @mozaic-ds/css-dev-tools postcss postcss-cli postcss-scss
# Save the configuration and SCSS below, then build:
npx postcss src/bundle.scss --output public/mozaic.css
# Production build on a POSIX shell:
MOZAIC_ENV=production npx postcss src/bundle.scss --output public/mozaic.css

// postcss.config.js
module.exports = {
  syntax: require('postcss-scss'),
  plugins: require('@mozaic-ds/css-dev-tools/postcssPluginConfig')
};

// src/bundle.scss — settings must precede components.
@import 'settings-tools/all-settings';
@import 'components/c.text-input';
@import 'components/c.button';
@import 'components/c.quantity-selector';
```

## Agent Prompt

Create a Mozaic SCSS composition using settings-tools/all-settings before text-input, button and quantity-selector. Match 48px medium controls on small screens, native-disable boundary buttons, validate typed integers and make a local-only summary. Use the documented PostCSS pipeline and distinguish the default Leroy Merlin theme from the ADEO preset.

## Sources

- [Installation](https://mozaic.adeo.cloud/get-started/developers/installation/) — Packages, Node and Dart Sass.
- [PostCSS configuration](https://mozaic.adeo.cloud/get-started/developers/installation/postcss/) — Required plugin pipeline.
- [SCSS imports](https://mozaic.adeo.cloud/get-started/developers/installation/import/) — Settings dependency and import order.
- [Magic unit](https://mozaic.adeo.cloud/foundations/spacing/magic-unit/) — Actual spacing steps.
- [Body styles](https://mozaic.adeo.cloud/foundations/typography/body-styles/) — Documented paragraph sizes.
- [Buttons](https://mozaic.adeo.cloud/components/buttons/) — Dimensions and action hierarchy.
- [Quantity usage](https://mozaic.adeo.cloud/components/form/quantity-selector/) — Responsive size and intended use.
- [Quantity code](https://mozaic.adeo.cloud/components/form/quantity-selector/code/) — BEM anatomy and dependency imports.
- [Token customization](https://mozaic.adeo.cloud/get-started/developers/customize-tokens/) — Default theme and overrides.
- [Spacing utilities](https://mozaic.adeo.cloud/foundations/spacing/margin-and-paddings/code/) — Utility classes and component spacing.
