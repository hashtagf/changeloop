# Singapore Government Design System — OpenDesign Application Guide

Use current SGDS Web Components with real responsive tokens, day and night themes, and native bounded quantities that keep a local plan synchronized.

Independent implementation specimen using MIT code and original workshop content. No government masthead, affiliation, reservation, network submission or official policy limit is implied.

## Source Reference

- **Package:** @govtechsg/sgds-web-component 3.29.0 ([source](https://www.npmjs.com/package/@govtechsg/sgds-web-component))
- **Architecture:** Registered sgds-* custom elements ([source](https://www.designsystem.tech.gov.sg/get-started/develop))
- **Default typeface:** Inter, weights300/400/600/700 ([source](https://www.designsystem.tech.gov.sg/get-started/develop))
- **Utility build:** Tailwind CSS v4 ([source](https://www.designsystem.tech.gov.sg/get-started/develop))
- **Night theme:** sgds-night-theme on document root ([source](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/themes/night.css))
- **Quantity feedback:** hasFeedback:style,text,both ([source](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/custom-elements.json))


## Design Reference

Singapore SGDS web components 3.29.0, published theme files, responsive tokens and custom-elements manifest. The preview executes the original index.umd.min.js bundle with local theme imports. It uses an explicit Arial fallback, no Tailwind utility compilation and no official masthead. The v3 package is distinct from v2 Bootstrap-based SGDS.

### Real responsive type tokens

[Official reference](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/themes/responsive.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --sgds-font-size-heading-xl | 32→36→40px | Base,1024px and1440px ranges; associated line-height-xl40→44→48px. |
| --sgds-font-size-heading-md | 24→26→28px | Associated line-height-md28→32→32px. |
| --sgds-font-size-heading-sm | 20→22→24px | A compact section title role. |
| --sgds-font-size-body-md | 16px in all three ranges | Body-lg18→20→20px; body-sm14px. |
| --sgds-font-family-brand | Inter,system-ui,sans-serif | Font files are separately loaded; preview overrides to Arial. |
| --sgds-font-weight-* | 300,400,600,700 | Light,regular,semibold,bold. |
| --sgds-letter-spacing-tight | -0.4px | Heading tracking in root.css. |

### Primitive and semantic theme roles

[Official reference](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/themes/day.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --sgds-color-default | Day#1a1a1a;night#f3f3f3 | Maps gray1000→gray100; not hardcoded body text. |
| --sgds-bg-default | Day#ffffff;night#0e0e0e | Root surface changes with sgds-night-theme. |
| --sgds-color-subtle | Day#525252;night#a5a5a5 | Supporting text; keep sufficient contrast on its paired surface. |
| --sgds-primary-surface-default | #6b4feb | Product-primary600 in both current theme files. |
| --sgds-primary-color-default | Day#6b4feb;night#a999f3 | Text role differs from filled-surface role. |
| --sgds-border-color-default | Day#868686 | Do not reuse the same primitive for every night-theme border. |

### Spacing, borders and responsive changes

[Official reference](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/themes/root.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --sgds-spacer-0…12 | 0,2,4,8,12,16,20,24,32,48,64,96,128px | Values expressed in rem at16px root; these are primitives. |
| --sgds-gap-md / --sgds-gap-2-xl | 16px /32px | Fixed semantic gaps. |
| --sgds-layout-gap-md | 16→24→32px | Responsive at1024/1440px in actual package; these are not the512/768 grid breakpoints. |
| --sgds-text-gap-md | 12→16→16px | Text spacing has its own responsive role. |
| --sgds-form-border-radius-md | 8px | Alias of border-radius-md. |
| --sgds-form-border-width-default | 1px | Alias of border-width-1. |

### Standard grid reference

[Official reference](https://www.designsystem.tech.gov.sg/foundations/layout/breakpoint)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| xs / sm | 320–511 /512–767px | 4/8 columns;16px gutters;20/24px fixed margins. |
| md | 768–1023px | 8 columns;24px gutters;28px fixed margins. |
| lg | 1024–1279px | 12 columns;888px container;24px gutters. |
| xl | 1280–1439px | 12 columns;1168px container;32px gutters. |
| 2xl | 1440px+ | 12 columns;1312px container;32px gutters. |
| Preview composition | 888px maximum;two columns→one below768px | Intentional small planner composition, not a full implementation of every standard grid preset. |

### QuantityToggle public API

[Official reference](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/custom-elements.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| value / step | Number;defaults0 /1 | Read the element value after a native event. |
| min / max | Number constraints | Explain the chosen service limits through hintText. |
| label / hintText | String properties/attributes | Provide the accessible field name and visible range help. |
| hasFeedback | style \| text \| both | A string-valued feedback mode, not a bare Boolean attribute. |
| invalidFeedback / invalid | Message /Boolean state | Use the component feedback rather than an unrelated red border. |
| Events | sgds-input;sgds-change;sgds-invalid;sgds-valid | Listen to both input/change for a summary supporting typed edits and buttons. |
| Validation methods | checkValidity();reportValidity() | Return Boolean constraint results; reportValidity reveals feedback. |
| readonly versus disabled | Visible fixed value versus unavailable control | Disabled is excluded from submission; readonly retains its value. |

## Singapore Government Design System Choose the current SGDS family

### Web components and older Bootstrap pages

SGDS v 3 uses @govtechsg/sgds-web-component. Its custom elements, theme tokens and current utility integration are a different implementation path from the older @govtechsg/sgds Bootstrap stylesheet. Do not mix v 2 JavaScript instructions with v 3 tags and expect the new controls to initialize.

The specimen uses the actual 3.29.0 browser bundle to register quantity toggles and buttons. It presents an original community-workshop planner without a Singapore Government masthead or affiliation claim. The controls change local values only; there is no booking or payment workflow.

[Supporting specification](https://www.designsystem.tech.gov.sg/get-started/develop)

## Singapore Government Design System Theme tokens are layered

### Primitive colors and semantic use

The root file defines primitive grays, product-primary purple and the other palette families. Day and night theme files then map those primitives to roles such as default text, supporting text, filled surface and border. A primary text role can change in night mode even when the primary filled-surface role stays on the same primitive.

The preview uses semantic properties for its document background, text, border and muted panel. Toggling sgds-night-theme on the root therefore updates both the custom elements and their surrounding composition. A hardcoded black paragraph would defeat that relationship even though the controls themselves still switched correctly.

The purple palette is the published product default, not a reason to impersonate a government agency. Agency identity and approved masthead use need their own authorization.

[Supporting specification](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/themes/day.css)

## Singapore Government Design System Responsive type with actual values

### Read the shipped token rather than a shorthand ratio

The current responsive.css maps heading-xl to 32,36 and 40px across its three ranges, paired with 40,44 and 48px line heights. The changes occur at 1024 and 1440px. They are independent of the grid’s smaller 512 and 768px layout boundaries. Body-md remains 16px.

The public typography overview describes general ratios and pairing principles, while the shipped token sheet has exact pixel aliases for each role. This reference uses those executable aliases when giving implementation values. Keep heading semantics in HTML and apply an appropriate visual token; a small section title does not need an artificial lower heading level.

Inter is the intended brand typeface, with 300,400,600 and 700 weights documented in setup. The local specimen explicitly substitutes Arial and loads no remote fonts. In an adopting service, load and test the selected font rather than relying on the CSS family name alone.

[Supporting specification](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/themes/responsive.css)

## Singapore Government Design System Different spacing roles

### Do not collapse all gaps into one scale

The primitive spacer scale includes 2px as well as 4,8,12,16 and larger values. Fixed gap aliases and responsive layout/component/text gaps sit above those primitives. A base layout-gap-md changes 16→24→32px, whereas text-gap-md changes 12→16→16px. The same word “medium” therefore does not mean the same number for every use.

The planner uses an 888px maximum to keep two modest content regions together: the quantity controls and the current plan. Below 768px, it stacks them. This is an application composition, not a claim that the complete SGDS standard grid always stops at 888px. The reference lists the broader standard container rules separately.

[Supporting specification](https://www.designsystem.tech.gov.sg/foundations/spacing/gap)

## Singapore Government Design System A bounded count control

### Use quantity for a count, not an identifier

A quantity toggle is appropriate for a small count that a person may adjust one unit at a time. The specimen asks for 1–5 participants and 0–3 shared kits. These are demonstration constraints; a real service must derive them from actual availability or policy and state them in the hint. Postcodes, identifiers and precise currency amounts need a different input.

The native component composes decrease and increase icon buttons around a number input. Its min, max and step are numeric, value reflects the current count, and label/hintText supply context. At a bound the corresponding button becomes unavailable; direct typing still needs constraint validation.

hasFeedback takes the string style, text or both. The example uses both plus a specific invalidFeedback message. Treating hasFeedback as a Boolean copied from another component API would lose that exact configuration.

```html
<sgds-quantity-toggle
  id="people" name="people" label="Participants"
  hintText="Choose 1 to 5 participants"
  min="1" max="5" step="1" value="1"
  hasFeedback="both"
  invalidFeedback="Enter a whole number from 1 to 5">
</sgds-quantity-toggle>
<output id="participant-total">1</output>
<script>
  customElements.whenDefined('sgds-quantity-toggle').then(() => {
    const quantity = document.querySelector('#people');
    const update = () => {
      document.querySelector('#participant-total').textContent = String(quantity.value);
    };
    ['sgds-input', 'sgds-change'].forEach(name => {
      quantity.addEventListener(name, update);
    });
  });
</script>
```

[Code reference](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/custom-elements.json)

[Supporting specification](https://www.designsystem.tech.gov.sg/components/quantity-toggle)

## Singapore Government Design System Keep the summary synchronized

### Two event paths and one data source

The summary reads each host element’s value. It listens for both sgds-input and sgds-change, because typed edits and committed button changes do not necessarily use the same event path. Testing only typed input missed increment-button updates in the first local specimen; the final example handles both.

Check plan invokes reportValidity on both native elements and shows a local status message. It does not coerce an invalid number into a plausible total. Reset assigns the initial host values and clears the application-visible invalid state through setInvalid(false), then refreshes the summary after updateComplete.

A disabled field is not equivalent to a readonly field: the former is excluded from form submission, while the latter retains its value. If a real service freezes a confirmed quantity for review, use the appropriate state rather than disabling it merely to obtain a gray appearance.

- Use sgds-input and sgds-change when a summary supports both typing and increment buttons.
- Read value from the custom-element host instead of reaching into its shadow DOM.
- Keep local validity feedback distinct from a successful reservation or submission.

[Supporting specification](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/custom-elements.json)

## Singapore Government Design System Styles before registration

### Load the theme dependency chain

In a bundled application, import day.css, night.css and css/sgds.css in that order, then import the component library once. The day/night files import root.css, which imports responsive.css. The foundation file imports reboot.css and grid.css. A static copy must retain these relative dependencies, not just the first three files.

The official utility.css is a Tailwind CSS v 4 configuration entry. It must pass through a configured Tailwind build; adding it as a plain browser stylesheet does not generate all sgds: utility classes. This specimen uses ordinary layout CSS and semantic custom properties instead, so no utility build is implied.

For the isolated browser example, the published file is index.umd.min.js. The package metadata still mentions index.umd.js, but that file is absent from the inspected distribution. The local preview uses the actual minified bundle; the npm setup uses the documented package import for bundlers.

1. Pin3.29.0 and import theme tokens before foundation rules.
2. Provide Inter or make a deliberate tested fallback choice.
3. Register the custom elements once, wait for definition when necessary, then attach application listeners.

[Supporting specification](https://www.designsystem.tech.gov.sg/get-started/develop)

## Singapore Government Design System Test limits and theme together

### Boundaries reveal integration mistakes

Increment Participants twice and check that both the control and summary read 3. Type 9 directly and run Check plan: the component should show its range feedback and the status should request correction. Correct it to 5 and confirm the increment control is disabled while the value remains valid.

Switch to night theme after entering quantities and ensure the values are preserved, the summary remains readable and the boundaries still behave correctly. Reset, then repeat with the keyboard: Tab should reach the input and buttons in a sensible order, and Enter or Space should activate a focused button.

The local test verifies component behavior at 1440,768 and 390px and checks that the theme dependencies are served locally. It does not establish browser support or accessibility certification for a future government service. That service must test its full flow, wording, theme customization and data handling.

[Supporting specification](https://www.designsystem.tech.gov.sg/components/quantity-toggle)

## Component Examples

### Bounded quantities and two event paths

A complete native control and synchronized output.

```html
<sgds-quantity-toggle
  id="people" name="people" label="Participants"
  hintText="Choose 1 to 5 participants"
  min="1" max="5" step="1" value="1"
  hasFeedback="both"
  invalidFeedback="Enter a whole number from 1 to 5">
</sgds-quantity-toggle>
<output id="participant-total">1</output>
<script>
  customElements.whenDefined('sgds-quantity-toggle').then(() => {
    const quantity = document.querySelector('#people');
    const update = () => {
      document.querySelector('#participant-total').textContent = String(quantity.value);
    };
    ['sgds-input', 'sgds-change'].forEach(name => {
      quantity.addEventListener(name, update);
    });
  });
</script>
```

[Code reference](https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3.29.0/custom-elements.json)

### Bundled v3 setup

Correct theme order, library registration and explicit Tailwind utility boundary.

```bash / css / javascript
npm install --save-exact @govtechsg/sgds-web-component@3.29.0

/* globals.css — tokens before foundation rules */
@import "@govtechsg/sgds-web-component/themes/day.css";
@import "@govtechsg/sgds-web-component/themes/night.css";
@import "@govtechsg/sgds-web-component/css/sgds.css";
/* Only for a configured Tailwind CSS v4 build: */
/* @import "@govtechsg/sgds-web-component/css/utility.css"; */

// main.js — register custom elements once
import '@govtechsg/sgds-web-component';

// Enable the published night theme; omit class for day.
document.documentElement.classList.toggle('sgds-night-theme');
```

[Code reference](https://www.designsystem.tech.gov.sg/get-started/develop)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SGDS quantity specimen</title><link rel="stylesheet" href="vendor/sgds-3.29.0/themes/day.css"><link rel="stylesheet" href="vendor/sgds-3.29.0/themes/night.css"><link rel="stylesheet" href="vendor/sgds-3.29.0/css/sgds.css"><style>:root{--sgds-font-family-brand:Arial,sans-serif}*{box-sizing:border-box}body{margin:0;background:var(--sgds-bg-default);color:var(--sgds-color-default);font-family:var(--sgds-font-family-brand)}main{max-width:888px;margin:auto;padding:32px 20px}h1{font-size:var(--sgds-font-size-heading-xl);line-height:var(--sgds-line-height-xl);letter-spacing:var(--sgds-letter-spacing-tight)}h2{font-size:var(--sgds-font-size-heading-sm);line-height:var(--sgds-line-height-sm)}p{max-width:60ch;line-height:1.5}.eyebrow{color:var(--sgds-color-subtle);font-size:14px}.layout{display:grid;grid-template-columns:1fr 1fr;gap:var(--sgds-layout-gap-md);margin:32px 0}.control{border:1px solid var(--sgds-border-color-default);border-radius:var(--sgds-border-radius-md);padding:24px;background:var(--sgds-bg-alternate)}sgds-quantity-toggle{display:block;max-width:100%}dl{margin:24px 0}dt{color:var(--sgds-color-subtle)}dd{margin:0 0 16px;font-weight:600}.actions{display:flex;flex-wrap:wrap;gap:16px}#status{min-height:24px}button.native{font:inherit;background:transparent;border:1px solid var(--sgds-border-color-default);color:inherit;padding:8px 12px;border-radius:8px}button.native:focus-visible{outline:3px solid var(--sgds-primary-border-color-default);outline-offset:3px}@media(max-width:767px){.layout{grid-template-columns:1fr}.control{padding:20px}}</style><main><p class="eyebrow">Independent specimen · Community workshop planning</p><h1>Plan a small workshop group</h1><p>Adjust two bounded quantities and inspect the local summary. This example does not reserve places or equipment.</p><button class="native" id="theme" aria-pressed="false">Night theme</button><div class="layout"><section class="control"><h2>People and materials</h2><form id="planner"><sgds-quantity-toggle id="people" name="people" label="Participants" hintText="Choose 1 to 5 participants" min="1" max="5" step="1" value="1" hasFeedback="both" invalidFeedback="Enter a whole number from 1 to 5"></sgds-quantity-toggle><div style="height:24px"></div><sgds-quantity-toggle id="kits" name="kits" label="Shared material kits" hintText="Choose 0 to 3 kits" min="0" max="3" step="1" value="0" hasFeedback="both" invalidFeedback="Enter a whole number from 0 to 3"></sgds-quantity-toggle></form></section><section><h2>Current plan</h2><dl><dt>Participants</dt><dd id="p-value">1</dd><dt>Material kits</dt><dd id="k-value">0</dd></dl><p>These are demonstration limits. A real service should explain its own availability and eligibility rules.</p><div class="actions"><sgds-button id="review">Check plan</sgds-button><sgds-button id="reset" variant="outline">Reset</sgds-button></div><p id="status" role="status" aria-live="polite"></p></section></div></main><script src="vendor/sgds-3.29.0/index.umd.min.js"></script><script type="module">await Promise.all(['sgds-quantity-toggle','sgds-button'].map(x=>customElements.whenDefined(x)));const p=document.querySelector('#people'),k=document.querySelector('#kits'),status=document.querySelector('#status');await Promise.all([p.updateComplete,k.updateComplete]);const update=()=>{document.querySelector('#p-value').textContent=String(p.value);document.querySelector('#k-value').textContent=String(k.value);status.textContent=''};[p,k].forEach(x=>['sgds-input','sgds-change'].forEach(name=>x.addEventListener(name,update)));document.querySelector('#review').onclick=()=>{const validP=p.reportValidity(),validK=k.reportValidity();status.textContent=validP&&validK?'The quantities are within the demo limits. Nothing has been reserved.':'Correct the highlighted quantity before continuing.'};document.querySelector('#reset').onclick=async()=>{p.value=1;k.value=0;p.setInvalid(false);k.setInvalid(false);await Promise.all([p.updateComplete,k.updateComplete]);update()};document.querySelector('#theme').onclick=e=>{const night=document.documentElement.classList.toggle('sgds-night-theme');e.currentTarget.setAttribute('aria-pressed',String(night));e.currentTarget.textContent=night?'Day theme':'Night theme'};window.demoReady=true;</script></html>
```

[Code reference](https://www.designsystem.tech.gov.sg/components/quantity-toggle)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

The standalone preview uses the verified original index.umd.min.js bundle and local CSS dependency chain. The npm recipe is for a bundler; utility.css requires Tailwind v4 and is deliberately omitted from this static preview. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/singapore-sgds.html. Do not open module-based examples through file://.

```bash / css / javascript
npm install --save-exact @govtechsg/sgds-web-component@3.29.0

/* globals.css — tokens before foundation rules */
@import "@govtechsg/sgds-web-component/themes/day.css";
@import "@govtechsg/sgds-web-component/themes/night.css";
@import "@govtechsg/sgds-web-component/css/sgds.css";
/* Only for a configured Tailwind CSS v4 build: */
/* @import "@govtechsg/sgds-web-component/css/utility.css"; */

// main.js — register custom elements once
import '@govtechsg/sgds-web-component';

// Enable the published night theme; omit class for day.
document.documentElement.classList.toggle('sgds-night-theme');
```

## Agent Prompt

Build a Singapore SGDS v3 planner using actual3.29.0 sgds-quantity-toggle and sgds-button elements. Import the complete day/night/root/responsive token chain and foundation styles, then register the native components. Provide bounded participant and material-kit counts, hasFeedback="both", exact labels/hints, typed validation and a synchronized summary listening to both sgds-input and sgds-change. Theme switch must toggle sgds-night-theme on the root without resetting values. Preserve the distinction between local validity and a booking. Do not load v2 Bootstrap code or pretend raw utility.css generates Tailwind classes.

## Sources

- [Develop](https://www.designsystem.tech.gov.sg/get-started/develop) — v3 installation and CSS import order.
- [Quantity](https://www.designsystem.tech.gov.sg/components/quantity-toggle) — Purpose, constraints and control behavior.
- [Gap](https://www.designsystem.tech.gov.sg/foundations/spacing/gap) — Fixed and responsive spacing roles.
- [Heading](https://www.designsystem.tech.gov.sg/foundations/typography/heading) — Heading role aliases.
- [Type](https://www.designsystem.tech.gov.sg/foundations/typography) — Typography intent and font guidance.
- [Grid](https://www.designsystem.tech.gov.sg/foundations/layout/responsive-grid) — Standard responsive grid presets.
- [Breakpoints](https://www.designsystem.tech.gov.sg/foundations/layout/breakpoint) — Grid breakpoint and container reference.
- [Tokens](https://www.designsystem.tech.gov.sg/foundations/design-tokens) — Layered token model.
- [Semantic](https://www.designsystem.tech.gov.sg/foundations/colour/semantic-colour) — Semantic colour roles.
- [Download complete working example](/assets/demos/singapore-sgds-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
