# Web Awesome Design System — OpenDesign Application Guide

Inspect Web Awesome’s actual semantic tokens across native custom elements, including scoped radius and spacing changes, shadow-DOM styling, select behavior and input validation.

Web Awesome 3.14.0 public components and default theme. Layout choices are original; local name application creates no workspace or storage.

## Source Reference

- **Library scope:** Framework-agnostic web components ([source](https://webawesome.com/))
- **Platform or architecture:** Components use the wa- element prefix ([source](https://webawesome.com/docs/))
- **Integration:** Installation supports a package route ([source](https://webawesome.com/docs/))
- **Component support:** Documentation covers theme customization ([source](https://webawesome.com/docs/))
- **Customization or behavior:** Components can be loaded individually ([source](https://webawesome.com/docs/))
- **Additional capability:** Shoelace migration is documented ([source](https://webawesome.com/docs/))


## Design Reference

Web Awesome 3.14.0 default theme CSS, inspected in the installed package. Color entries below are semantic aliases; their palette references are retained rather than replaced by guessed hex equivalents. Scale-derived pixel examples assume a 16px root and scale=1.

### Semantic surface and text roles

[Official reference](https://webawesome.com/docs/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --wa-color-surface-default | white | Main specimen surface. |
| --wa-color-surface-raised | white | Elevated layer. |
| --wa-color-surface-lowered | var(--wa-color-neutral-95) | Code readout surface. |
| --wa-color-surface-border | var(--wa-color-neutral-90) | Container boundary. |
| --wa-color-text-normal | var(--wa-color-neutral-10) | Normal text. |
| --wa-color-text-quiet | var(--wa-color-neutral-40) | Secondary text. |
| --wa-color-text-link | var(--wa-color-brand-40) | Link role. |
| --wa-color-brand-fill-loud | var(--wa-color-brand-50) | Strong brand fill. |
| --wa-color-brand-on-loud | white | Text on strong brand fill. |
| --wa-color-brand-fill-quiet | var(--wa-color-brand-95) | Quiet badge fill. |
| --wa-color-brand-on-quiet | var(--wa-color-brand-40) | Text on quiet brand fill. |

### Spacing and shape

[Official reference](https://webawesome.com/docs/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --wa-space-scale | 1 | Multiplier used by spacing tokens. |
| --wa-space-xs | calc(var(--wa-space-scale) * 0.5rem) | 8px at default scale. |
| --wa-space-s | calc(var(--wa-space-scale) * 0.75rem) | 12px at default scale. |
| --wa-space-m | calc(var(--wa-space-scale) * 1rem) | 16px at default scale. |
| --wa-space-l | calc(var(--wa-space-scale) * 1.5rem) | 24px at default scale. |
| --wa-space-xl | calc(var(--wa-space-scale) * 2rem) | 32px at default scale. |
| --wa-space-2xl | calc(var(--wa-space-scale) * 2.5rem) | 40px at default scale. |
| --wa-border-radius-scale | 1 | Multiplier used by scalable radii. |
| --wa-border-radius-s | calc(var(--wa-border-radius-scale) * 0.1875rem) | 3px at default scale. |
| --wa-border-radius-m | calc(var(--wa-border-radius-scale) * 0.375rem) | 6px at default scale. |
| --wa-border-radius-l | calc(var(--wa-border-radius-scale) * 0.75rem) | 12px at default scale. |

### Typography

[Official reference](https://webawesome.com/docs/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --wa-font-family-body | ui-sans-serif, system-ui, sans-serif | Body system sans-serif. |
| --wa-font-family-heading | var(--wa-font-family-body) | Heading family alias. |
| --wa-font-family-code | ui-monospace, monospace | Monospaced readout. |
| --wa-font-size-scale | 1 | Type scale multiplier. |
| --wa-font-size-m | calc(1rem * var(--wa-font-size-scale)) | 16px at default root and scale. |
| --wa-font-size-l | round(calc(var(--wa-font-size-m) * 1.125 * 1.125), 1px) | 20px at default root and scale. |
| --wa-font-size-xl | round(calc(var(--wa-font-size-l) * 1.125 * 1.125), 1px) | 25px at default root and scale. |
| --wa-font-size-2xl | round(calc(var(--wa-font-size-xl) * 1.125 * 1.125), 1px) | 32px at default root and scale. |
| --wa-line-height-condensed | 1.2 | Condensed titles/labels. |
| --wa-line-height-normal | 1.6 | Normal reading line height. |

### Form control aliases

[Official reference](https://webawesome.com/docs/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --wa-form-control-background-color | var(--wa-color-surface-default) | Input surface alias. |
| --wa-form-control-border-color | var(--wa-color-neutral-border-loud) | Input boundary role. |
| --wa-form-control-border-radius | var(--wa-border-radius-m) | Field radius alias. |
| --wa-form-control-label-color | var(--wa-color-text-normal) | Accessible label color. |
| --wa-form-control-hint-color | var(--wa-color-text-quiet) | Hint color alias. |

## Web Awesome Design System Custom Elements With Their Own Component Boundary

### Custom Elements With Their Own Component Boundary

Web Awesome provides registered HTML custom elements rather than requiring a React application. Once wa-input or wa-select is imported, it can be placed in ordinary HTML and controlled through its documented properties and events. This workbench bundles version 3.14.0 and uses only components available in the public package.

The visible controls are the actual custom elements, including their shadow-root implementation. The surrounding header, sections and readout are original HTML. This makes the specimen useful for observing which styling decisions cross the component boundary through inherited custom properties and which belong to the page composition.

[Supporting specification](https://webawesome.com/docs/usage)

## Web Awesome Design System Keep Semantic Color Aliases Intact

### Keep Semantic Color Aliases Intact

The default theme distinguishes raised, default and lowered surfaces, normal and quiet text, and multiple brand fill/on-color pairs. The token readout uses the lowered surface, the main specimen uses the default surface, and the small badge pairs brand-fill-quiet with brand-on-quiet. These roles remain meaningful when the appearance changes.

The reference retains aliases such as var(--wa-color-neutral-10) instead of translating every role into an assumed hex value. A palette can change while the semantic assignment remains valid. If customizing a strong brand action, consider both the fill and its on-color. Changing one without its partner can make button text hard to read.

[Supporting specification](https://webawesome.com/docs/tokens/)

## Web Awesome Design System Change the Scale Without Rewriting Every Component

### Change the Scale Without Rewriting Every Component

The radius selector changes --wa-border-radius-scale on the specimen only. At scale one, the default small/medium/large radii resolve to three, six and twelve pixels at a sixteen-pixel root. Setting scale zero makes those scalable corners square; scale two doubles them. The pill and circle tokens are separate concepts and should not be assumed to follow this multiplier.

The spacing selector changes --wa-space-scale. The specimen’s padding, gaps and readout spacing consume the official space tokens, so their relationships change together. This does not promise that every dimension of every component scales: component control sizing has its own token relationships. The editing panel is outside the scope, making comparison stable while the specimen changes.

1. Choose Square and inspect the input, container and readout corners.
2. Choose Relaxed spacing and compare the specimen gaps with the unchanged editing panel.
3. Restore defaults to return both multipliers and appearance together.

[Supporting specification](https://webawesome.com/docs/customizing)

## Web Awesome Design System Typography Tokens and Original Heading Choices

### Typography Tokens and Original Heading Choices

The default body family is ui-sans-serif, system-ui, sans-serif. Heading family aliases the body family, while code uses ui-monospace. The normal line-height token is 1.6; condensed is 1.2. The medium type token is one rem multiplied by font-size-scale, and larger sizes use rounded calculations. The table shows those expressions rather than hiding their dependencies.

The workbench itself chooses a 34px heading and 23px section heading, reducing the page heading at a 700px local breakpoint. These are explicitly original page rules. The native fields retain the library’s label and hint styling, allowing the user to compare a custom page hierarchy with default component typography.

[Supporting specification](https://webawesome.com/docs/tokens/)

## Web Awesome Design System Initial Values, Properties and Change Events

### Initial Values, Properties and Change Events

Each select contains wa-option children with stable values. The default options use selected, matching the current component guidance for initial selection. Runtime changes read the select value property. The theme controls listen for change events and update CSS custom properties; they do not parse text from rendered option labels.

The region select is a normal specimen field and does not control an external storage service. Its selected value is reported in the local action message. The interface avoids pretending that choosing Europe allocates storage. This distinction matters when a realistic-looking component demonstration uses product vocabulary.

[Supporting specification](https://webawesome.com/docs/components/select/)

## Web Awesome Design System Style Through Tokens and Documented Parts

### Style Through Tokens and Documented Parts

Ordinary descendant selectors cannot freely reach inside a component’s shadow tree. This example uses inherited theme variables so the field background, text and radius can remain coordinated with surrounding HTML. That is a supported styling surface rather than an attempt to target internal generated markup.

For component-specific changes, consult the documented CSS custom properties and CSS parts for that component. A global input selector will not necessarily alter the internal input of wa-input. Conversely, placing a theme class or variable on a common ancestor can intentionally affect many descendant custom elements, so the scope must be chosen carefully.

[Supporting specification](https://webawesome.com/docs/customizing)

## Web Awesome Design System Upgrade, Validation and Local Results

### Upgrade, Validation and Local Results

Component registration is asynchronous from the page’s perspective. The example waits for customElements.whenDefined for the APIs it uses, then waits for select updates before reading initial values. This avoids applying defaults against an element that has not yet upgraded from an unknown HTML tag to its component class.

The workspace action uses setCustomValidity and reportValidity on wa-input. A trimmed name under two characters is rejected; an input event clears the custom error so a correction can be retried. The disabled Invite later button is a native component disabled state. The status text reports only a locally applied name, and the complete code contains no workspace creation or allocation request.

- Accessible labels are supplied through label attributes.
- Hints explain the name constraint before an error occurs.
- The disabled action remains noninteractive while still showing its purpose.

[Supporting specification](https://webawesome.com/docs/components/input/)

## Web Awesome Design System Import the Theme and the Components You Use

### Import the Theme and the Components You Use

Install @awesome.me/webawesome@3.14.0 in a Vite vanilla application and use the supplied main.js as the entry. The default theme stylesheet is required; the example deliberately does not load the broader native reset or utility bundle because its page layout is explicit CSS. Imports register the five component types used in the markup.

The npm dist modules are intended for bundlers. The dist-cdn distribution is the alternative for direct browser module loading because dependencies are bundled differently. Do not copy a dist import into a plain script tag and assume bare dependencies will resolve. Components that need external assets require the documented base-path setup; this specimen avoids user-supplied icon assets and is bundled for offline operation.

[Supporting specification](https://webawesome.com/docs/)

## Web Awesome Design System Public Components and Honest Theme Boundaries

### Public Components and Honest Theme Boundaries

The workbench demonstrates the default theme and public components. Some Web Awesome components, patterns and design resources are Pro offerings, so the page does not imply that installing the public package unlocks every item in the catalog. A component’s availability should be checked before making it a required dependency in a shared design system.

A reusable product theme should document which variables are changed, where they are scoped, and how both appearance modes are checked. The live workbench is a small example of that process: a reader can inspect the exact changed variables and compare the resulting native components, rather than relying on a disconnected palette image.

[Supporting specification](https://webawesome.com/docs/customizing)

## Component Examples

### Custom-element workbench markup

Native wa-select, wa-option, wa-input, wa-switch and wa-button composed with ordinary semantic HTML.

```html
<main class="token-workbench"><header><p class="eyebrow">WEB AWESOME / TOKEN WORKBENCH</p><h1>See the theme cross the component boundary.</h1><p>Change a scoped token and inspect native custom elements alongside ordinary HTML.</p></header><div class="workbench-grid"><section class="controls"><h2>Theme controls</h2><wa-select id="radius" label="Corner scale"><wa-option value="0">Square / 0</wa-option><wa-option value="1" selected>Default / 1</wa-option><wa-option value="2">Rounder / 2</wa-option></wa-select><wa-select id="spacing" label="Spacing scale"><wa-option value="0.8">Compact / 0.8</wa-option><wa-option value="1" selected>Default / 1</wa-option><wa-option value="1.25">Relaxed / 1.25</wa-option></wa-select><wa-switch id="dark">Dark appearance</wa-switch><wa-button id="reset" appearance="outlined">Restore defaults</wa-button><p class="hint">These controls change only the specimen. The editing controls keep their original dimensions.</p></section><section id="specimen" class="specimen" aria-label="Theme specimen"><div class="sample-head"><span class="badge">COMPONENT PREVIEW</span><span class="hint">Free components</span></div><h2>Your next workspace</h2><p class="hint">Form labels, field borders and actions inherit semantic tokens through the shadow boundary.</p><wa-input id="workspace" label="Workspace name" hint="Use at least two characters." value="Field notes"></wa-input><wa-select id="region" label="Storage region"><wa-option value="europe" selected>Europe</wa-option><wa-option value="america">North America</wa-option><wa-option value="asia">Asia Pacific</wa-option></wa-select><div class="sample-actions"><wa-button id="create" variant="brand">Apply name locally</wa-button><wa-button disabled>Invite later</wa-button></div><p id="result" role="status">No workspace is created by this specimen.</p><div class="token-readout"><code id="values">--wa-border-radius-scale: 1;<br>--wa-space-scale: 1;</code></div></section></div><footer>Native Web Awesome 3.14.0. The surrounding workbench is original HTML/CSS.</footer></main>

```

[Code reference](https://webawesome.com/docs/components/select/)

- Initial choices use selected on wa-option.
- Only free components are used.

### Complete imports and token controls

Registers components, waits for upgrade, changes scoped custom properties and applies local validity.

```javascript
import '@awesome.me/webawesome/dist/styles/themes/default.css';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/switch/switch.js';
import './style.css';
const $=id=>document.getElementById(id);function update(){const s=$('specimen');s.style.setProperty('--wa-border-radius-scale',$('radius').value);s.style.setProperty('--wa-space-scale',$('spacing').value);s.classList.toggle('wa-dark',$('dark').checked);s.classList.toggle('wa-light',!$('dark').checked);$('values').textContent=`--wa-border-radius-scale: ${$('radius').value};\n--wa-space-scale: ${$('spacing').value};`;}
Promise.all(['wa-select','wa-switch','wa-input','wa-button'].map(x=>customElements.whenDefined(x))).then(async()=>{await Promise.all([...document.querySelectorAll('wa-select')].map(e=>e.updateComplete));for(const id of ['radius','spacing','dark'])$(id).addEventListener('change',update);$('reset').addEventListener('click',()=>{$('radius').value='1';$('spacing').value='1';$('dark').checked=false;update()});$('create').addEventListener('click',()=>{const field=$('workspace');field.setCustomValidity(field.value.trim().length<2?'Use at least two non-space characters.':'');if(!field.reportValidity())return;$('result').textContent=`Applied “${field.value.trim()}” in the ${$('region').value} specimen. No workspace or storage allocation was created.`});$('workspace').addEventListener('input',()=>$('workspace').setCustomValidity(''));update()});

```

[Code reference](https://webawesome.com/docs)

- whenDefined prevents reading an unupgraded custom element API.
- The code imports only the components used.

### Scoped specimen CSS

Ordinary HTML consumes the same theme variables inherited by the native custom elements.

```css
*{box-sizing:border-box}body{margin:0;font-family:var(--wa-font-family-body);font-size:16px;line-height:var(--wa-line-height-normal);color:var(--wa-color-text-normal);background:#f5f6f8}.token-workbench{max-width:1100px;margin:auto;padding:32px}header{max-width:740px;margin-bottom:28px}h1{font-size:34px;line-height:1.15;letter-spacing:-.03em}h2{font-size:23px;line-height:1.25}.eyebrow{font-size:11px;letter-spacing:.12em;font-weight:700}.workbench-grid{display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px}.controls{display:flex;flex-direction:column;gap:20px;padding:24px;background:white;border:1px solid #d9dde3;border-radius:12px}.controls h2{margin:0}.hint,footer{color:var(--wa-color-text-quiet);font-size:14px}.specimen{background:var(--wa-color-surface-default);color:var(--wa-color-text-normal);border:1px solid var(--wa-color-surface-border);border-radius:var(--wa-border-radius-l);padding:var(--wa-space-xl);display:flex;flex-direction:column;gap:var(--wa-space-l)}.specimen h2,.specimen p{margin:0}.sample-head,.sample-actions{display:flex;align-items:center;flex-wrap:wrap;gap:var(--wa-space-s)}.sample-head{justify-content:space-between}.badge{font-size:10px;letter-spacing:.09em;font-weight:700;background:var(--wa-color-brand-fill-quiet);color:var(--wa-color-brand-on-quiet);padding:4px 8px;border-radius:var(--wa-border-radius-s)}.token-readout{background:var(--wa-color-surface-lowered);padding:var(--wa-space-m);border-radius:var(--wa-border-radius-m);font:13px/1.7 var(--wa-font-family-code);white-space:pre-wrap;overflow-wrap:anywhere}#result{font-size:13px}footer{margin-top:20px}@media(max-width:700px){.token-workbench{padding:20px 16px}.workbench-grid{grid-template-columns:1fr}.controls{padding:20px}h1{font-size:28px}.specimen{padding:var(--wa-space-l)}}

```

[Code reference](https://webawesome.com/docs/customizing)

- The workbench heading and layout breakpoint are original choices.

### Complete index.html document

The Vite root document for the supplied main.js and stylesheet.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Web Awesome token workbench</title></head><body><main class="token-workbench"><header><p class="eyebrow">WEB AWESOME / TOKEN WORKBENCH</p><h1>See the theme cross the component boundary.</h1><p>Change a scoped token and inspect native custom elements alongside ordinary HTML.</p></header><div class="workbench-grid"><section class="controls"><h2>Theme controls</h2><wa-select id="radius" label="Corner scale"><wa-option value="0">Square / 0</wa-option><wa-option value="1" selected>Default / 1</wa-option><wa-option value="2">Rounder / 2</wa-option></wa-select><wa-select id="spacing" label="Spacing scale"><wa-option value="0.8">Compact / 0.8</wa-option><wa-option value="1" selected>Default / 1</wa-option><wa-option value="1.25">Relaxed / 1.25</wa-option></wa-select><wa-switch id="dark">Dark appearance</wa-switch><wa-button id="reset" appearance="outlined">Restore defaults</wa-button><p class="hint">These controls change only the specimen. The editing controls keep their original dimensions.</p></section><section id="specimen" class="specimen" aria-label="Theme specimen"><div class="sample-head"><span class="badge">COMPONENT PREVIEW</span><span class="hint">Free components</span></div><h2>Your next workspace</h2><p class="hint">Form labels, field borders and actions inherit semantic tokens through the shadow boundary.</p><wa-input id="workspace" label="Workspace name" hint="Use at least two characters." value="Field notes"></wa-input><wa-select id="region" label="Storage region"><wa-option value="europe" selected>Europe</wa-option><wa-option value="america">North America</wa-option><wa-option value="asia">Asia Pacific</wa-option></wa-select><div class="sample-actions"><wa-button id="create" variant="brand">Apply name locally</wa-button><wa-button disabled>Invite later</wa-button></div><p id="result" role="status">No workspace is created by this specimen.</p><div class="token-readout"><code id="values">--wa-border-radius-scale: 1;<br>--wa-space-scale: 1;</code></div></section></div><footer>Native Web Awesome 3.14.0. The surrounding workbench is original HTML/CSS.</footer></main>
<script type="module" src="/main.js"></script></body></html>
```

[Code reference](https://webawesome.com/)

- Create a Vite vanilla project and use the complete main.js and style.css shown above.

## Implementation Starting Point

The complete main.js, CSS and body examples reproduce the workbench in a bundler. The offline demo is an esbuild bundle with the theme CSS inlined. No React provider is required.

```javascript
// Create a Vite vanilla project, then install:
// npm install @awesome.me/webawesome@3.14.0
// index.html: paste the complete workbench markup in body,
// then add <script type="module" src="/main.js"></script>.
// main.js: use the complete imports and token-controls example above.
// style.css: use the complete scoped specimen CSS above.

// Minimum registration pattern used by this example:
import '@awesome.me/webawesome/dist/styles/themes/default.css';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/switch/switch.js';
// Do not duplicate these imports if using the complete main.js above.
```

## Agent Prompt

Use the Web Awesome 3.14.0 scoped token workbench and register the supplied wa-select, wa-option, wa-input, wa-button and wa-switch elements. Wait for component definition and updateComplete before reading initial selections. Apply --wa-border-radius-scale and --wa-space-scale only to the specimen region, and toggle its wa-light/wa-dark class without changing unrelated page content. Keep the visible token readout synchronized with the native controls and preserve labels. Treat the workbench as an inspection tool, not a device-management interface.

## Sources

- [Installation](https://webawesome.com/docs/) — npm/dist versus dist-cdn and required theme.
- [Design tokens](https://webawesome.com/docs/tokens/) — Theme token categories.
- [Customizing](https://webawesome.com/docs/customizing) — Custom properties and shadow boundaries.
- [Select](https://webawesome.com/docs/components/select/) — Options, values and initial selection.
- [Input](https://webawesome.com/docs/components/input/) — Validation API.
- [Switch](https://webawesome.com/docs/components/switch/) — Boolean custom element.
