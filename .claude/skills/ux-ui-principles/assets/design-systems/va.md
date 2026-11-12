# VA Design System — OpenDesign Application Guide

Build clear service journeys with VA’s semantic tokens and native Process List: visible step explanations, meaningful status labels, and supplementary details that keep the main path readable.

Technical component demonstration with fictional records-request stages. No real VA request, case status, benefits decision, or institutional endorsement is represented.

## Source Reference

- **Organisation:** U.S. Department of Veterans Affairs ([source](https://design.va.gov/))
- **Guidance breadth:** Components, patterns, templates, foundations and content ([source](https://design.va.gov/))
- **Prefill patterns:** Guidance for recognising and updating prefilled information ([source](https://design.va.gov/patterns/))
- **Representation patterns:** Identify who is filling out a form ([source](https://design.va.gov/patterns/))
- **Signature patterns:** Guidance includes forms needing a second signer ([source](https://design.va.gov/patterns/))
- **Component evidence:** Design-decision and accessibility-test pages are included ([source](https://design.va.gov/components/))


## Design Reference

Published css-library 0.36.1 variables and component-library 56.14.0 dependency web-components 24.14.0. Fonts are explicit local fallbacks. The 52rem specimen shell is an application choice.

### Semantic typography

[Official reference](https://design.va.gov/foundation/design-tokens/typography)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --vads-font-family-heading | Bitter, Georgia, Cambria, Times New Roman, Times, serif | Heading family; preview uses Georgia. |
| --vads-font-family-sans | Source Sans Pro Web / Source Sans Pro, system sans fallbacks | Body and UI family; preview uses Arial. |
| --vads-font-size-body-default | 1.06rem (about 17px) | Preferred semantic role over source-sans-normalized. |
| --vads-font-size-heading-level-1 / 2 / 3 | 2.5 / 2 / 1.25rem | 40 / 32 / 20px at 16px root. |
| --vads-font-size-heading-level-4 / 5 / 6 | 1.063 / .938 / .938rem | About 17 / 15 / 15px. |
| --vads-font-line-height-default / heading / body-lead | 1.5 / 1.2 / 1.75 | Match the text role. |

### Space

[Official reference](https://design.va.gov/foundation/design-tokens/spacing)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --vads-spacing-inset-s / m / l | 1 / 1.5 / 2rem | 16 / 24 / 32px. |
| --vads-spacing-vertical-stack-default | 1rem / 16px | General vertical stack. |
| --vads-forms-spacing-vertical-stack-default | 2rem / 32px | Form-field stack. |
| --vads-spacing-0p5 / 1 / 1p5 / 2 / 2p5 / 3 | 4 / 8 / 12 / 16 / 20 / 24px | Primitive scale at standard root. |
| --vads-spacing-4 / 5 / 6 / 7 / 8 | 32 / 40 / 48 / 56 / 64px | Larger primitive values. |

### Semantic color

[Official reference](https://design.va.gov/foundation/design-tokens/color)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --vads-color-text | #1b1b1b | Preferred default text role. |
| --vads-color-link / link-active | #005ea2 / #0b4778 | Default and active link roles. |
| --vads-color-primary-darker | #162e51 | High-emphasis primary surface reference. |
| --vads-color-base-lighter / base-lightest | #dfe1e2 / #f0f0f0 | Neutral dividers and backgrounds. |
| --vads-color-error | #d54309 | Use error semantics instead of deprecated secondary red. |
| --vads-color-success-darker | #216e1f | Darker success reference; status still needs words. |

### Responsive boundaries

[Official reference](https://design.va.gov/foundation/design-tokens/breakpoints)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --vads-breakpoint-mobile / mobile-lg | 320 / 480px | Small-screen reference boundaries. |
| --vads-breakpoint-tablet / tablet-lg | 640 / 880px | Intermediate layouts. |
| --vads-breakpoint-desktop / desktop-lg | 1024 / 1201px | Desktop boundaries. |
| --vads-breakpoint-widescreen | 1400px | Wide layout reference. |

## VA Design System A service system for Veterans

### Foundations and components are separate packages

VA’s system combines service patterns, content guidance, tokens, CSS utilities, and Web Components. The documented installation uses a CSS-library package for global foundations and a component-library package for interactive elements. This reference pairs component-library 56.14.0 with css-library 0.36.1; those packages have independent version numbers.

The example is a fictional records-request explanation. It teaches how a process list communicates progression without claiming that a request was filed or that someone qualifies for a benefit. No VA logo, government identity banner, personal record, or real case status appears. Production service copy still needs verification with the responsible VA programme.

[Supporting specification](https://design.va.gov/about/developers/install)

## VA Design System Semantic type roles

### Body and heading families are deliberately different

The semantic heading family is Bitter, with Georgia and other serif fallbacks. The body stack begins with Source Sans Pro Web and Source Sans Pro, then platform sans-serif fallbacks. The default body role is 1.06rem, approximately 17px at a 16px root; headings use 40px for level 1, 32px for level 2, 20px for level 3, and approximately 17px for level 4.

Use --vads-font-size-body-default rather than the older source-sans-normalized name. The semantic token states the role, while the older normalization name exposes a font implementation detail. The preview explicitly uses Arial for body text and Georgia for headings. Native process component CSS still owns its internal structure and sizes; the fallback does not claim to reproduce the exact Source Sans and Bitter metrics.

[Supporting specification](https://design.va.gov/foundation/design-tokens/typography)

### Line height belongs to the role

The default paragraph line height is 1.5 and heading line height is 1.2. Lead body text has a 1.75 role; the serif line-height token is 1.9, intended for serif running text rather than every serif heading. Assigning 1.9 to a compact process heading would confuse two separate roles. The process items in this specimen use level 3 beneath the page’s level 2 section title.

[Supporting specification](https://design.va.gov/foundation/design-tokens/typography)

## VA Design System Semantic spacing and layout

### Distinguish an ordinary stack from a form

The general vertical-stack-default is 1rem/16px. The forms vertical-stack-default is 2rem/32px. This difference is useful: two short explanatory items need a different rhythm from separate questions with labels, hints, controls, and errors. Insets s, m, and l map to 16, 24, and 32px respectively.

The primitive spacing family includes 4, 8, 12, 16, 20, 24px and larger eight-pixel steps, plus special one- and two-pixel values. Prefer semantic spacing names when their purpose matches the layout. The example’s 52rem outer shell is an application choice, while the 24px inset and 32px section separation use published scale values. It does not impose that shell on every VA page template.

[Supporting specification](https://design.va.gov/foundation/design-tokens/spacing)

## VA Design System Colors and responsive tokens

### Use a role instead of a historical alias

The current text token is --vads-color-text (#1b1b1b). --vads-color-link is #005ea2 and the link active role is #0b4778; these are not the same as every darker primary-family entry. The error role is #d54309. The inherited secondary red family is deprecated for this purpose, so a new validation treatment should refer to error semantics rather than secondary.

The primitive and semantic tables are generated from a named CSS-library release. The specimen loads those actual variables rather than copying an old USWDS palette and labelling it VA. Its native components may contain their own compiled values in addition to those variables; verify both layers when upgrading.

[Supporting specification](https://design.va.gov/foundation/design-tokens/color)

### VA boundaries are not a generic framework scale

The token set defines mobile 320px, mobile-lg 480px, tablet 640px, tablet-lg 880px, desktop 1024px, desktop-lg 1201px, and widescreen 1400px. The unusual 1201px threshold matters when matching existing templates. Breakpoint variables document values; CSS custom properties cannot simply be substituted inside a native media-query condition. Use the corresponding build-time value or a literal derived from the verified token.

[Supporting specification](https://design.va.gov/foundation/design-tokens/breakpoints)

## VA Design System Process List anatomy

### Three to ten meaningful steps

VA’s Process List is also described as a subway map. It explains a longer process or reports where a person is within it. Guidance calls for three to ten steps and only one such list per page. Each item needs a concise verb-led heading and visible explanatory content; it is not a decorative number beside an otherwise empty title.

The native tags are va-process-list and va-process-list-item. An item takes header and level, plus active, pending, checkmark, and status-text. The published component module gives checkmark precedence, then active, then pending. Avoid contradictory combinations by clearing the other boolean states when setting one. Explicit status text accompanies status styling and makes the stage understandable without reading color.

```html
<va-process-list>
  <va-process-list-item header="Prepare your request" level="3"
      checkmark="true" status-text="Complete">
    <p>Identify the record you need and the office that holds it.</p>
    <va-details label="What information helps identify a record?">
      <p>A title, approximate date, or reference number can help distinguish similar records. This is illustrative content, not a VA records-request procedure.</p>
    </va-details>
  </va-process-list-item>
  <va-process-list-item header="Send the request" level="3"
      active="true" status-text="Active">
    <p>In this example, a request is ready for the appropriate service. No request is sent from this page.</p>
  </va-process-list-item>
  <va-process-list-item header="Read the response" level="3"
      pending="true" status-text="Pending">
    <p>A real service should explain where a response appears and how to ask about missing information.</p>
  </va-process-list-item>
</va-process-list>
```

[Code reference](https://design.va.gov/components/process-list)

[Supporting specification](https://design.va.gov/components/process-list)

## VA Design System Details support a visible step

### Do not turn every step into an accordion

The process guidance rejects combining an accordion header with a process step. Hiding all explanation defeats the purpose of showing the process. It does allow a Details component within a step for supplemental information. The specimen keeps the record-identification explanation visible and places an optional elaboration in va-details.

The component’s label attribute becomes the disclosure’s visible question. A short question is more useful than More information because it tells readers whether the hidden content is relevant. In this example the details explain what may help identify a record, with an explicit note that these are illustrative content choices rather than instructions for a particular VA procedure.

- Keep a summary of each stage visible, including stages marked Pending.
- Use a Details disclosure only for a secondary explanation within a stage.
- Keep the next real service action outside the process heading rather than turning the heading into a control.

[Supporting specification](https://design.va.gov/components/process-list)

## VA Design System Status demonstration and truth

### Use a scenario selector, not fake progress

The preview’s Example stage selector changes the component specimen among preparation, sending, and response review. It does not advance a real request, estimate an official processing time, or infer completion from a user clicking a button. A live service should map verified backend state into these visual states and explain the meaning of any delay separately.

Changing the selector sets prior stages to Complete, the selected stage to Active, and later stages to Pending. A live status sentence announces the example state change. The process keeps all three explanations visible and the optional Details state is retained. Reset returns to the first illustrative stage and closes the supplemental disclosure.

[Supporting specification](https://design.va.gov/components/process-list)

## VA Design System Load native Web Components

### Register once and preserve dependencies

The documented bundler path imports main.css and calls defineCustomElements from the component-library package. Fonts come from CSS-library and are delivered separately. Components using the icon sprite need a same-origin sprite path, by default /img/sprite.svg. These are real integration requirements, not optional polish to discover after deployment.

The standalone specimen uses the official browser ESM entry from web-components 24.14.0, the dependency declared by component-library 56.14.0, plus the specific lazy modules for Process List, Process List Item, and Details. Its application script only selects example states. The browser runtime supplies the native custom-element behavior, including the Details control.

1. Load the matching token CSS and browser component entry, preserving relative module locations.
2. Wait for va-process-list-item to be defined before assigning example state properties.
3. Test all scenario states, the Details keyboard control, and narrow widths without hiding explanatory content.

[Supporting specification](https://design.va.gov/about/developers/install)

## Component Examples

### A native three-stage explanation

Real Web Component attributes and a permitted Details disclosure inside a step.

```html
<va-process-list>
  <va-process-list-item header="Prepare your request" level="3"
      checkmark="true" status-text="Complete">
    <p>Identify the record you need and the office that holds it.</p>
    <va-details label="What information helps identify a record?">
      <p>A title, approximate date, or reference number can help distinguish similar records. This is illustrative content, not a VA records-request procedure.</p>
    </va-details>
  </va-process-list-item>
  <va-process-list-item header="Send the request" level="3"
      active="true" status-text="Active">
    <p>In this example, a request is ready for the appropriate service. No request is sent from this page.</p>
  </va-process-list-item>
  <va-process-list-item header="Read the response" level="3"
      pending="true" status-text="Pending">
    <p>A real service should explain where a response appears and how to ask about missing information.</p>
  </va-process-list-item>
</va-process-list>
```

[Code reference](https://design.va.gov/components/process-list)

- Use 3–10 steps and one Process List on a page.
- Do not replace step headings with accordion triggers.
- Only one status flag should be set on each item.

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Request journey — VA component specimen</title><link rel="stylesheet" href="vendor/va-56.14.0/variables.css"><style>*{box-sizing:border-box}:root{--font-serif:Georgia,serif;--font-sans:Arial,sans-serif;--vads-font-family-heading:Georgia,serif;--vads-font-family-serif:Georgia,serif;--vads-font-family-sans:Arial,sans-serif}body{margin:0;font:1.06rem/1.5 Arial,sans-serif;color:var(--vads-color-text);border-top:8px solid var(--vads-color-primary-darker)}main{max-width:52rem;margin:auto;padding:32px 24px}h1,h2{font-family:Georgia,serif;line-height:1.2}h1{font-size:40px;margin:16px 0 24px}h2{font-size:32px;margin:32px 0 24px}.controls{padding:24px;background:var(--vads-color-base-lightest);display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin:32px 0}label{font-weight:bold}select,button{font:inherit;padding:8px 12px;max-width:100%;background:white;color:var(--vads-color-text);border:1px solid var(--vads-color-base-dark)}button{cursor:pointer;color:var(--vads-color-link)}select:focus-visible,button:focus-visible{outline:3px solid #ffbe2e;outline-offset:3px}va-process-list-item,va-process-list-item *,va-process-list-item::before{font-family:Arial,sans-serif!important}va-process-list-item .usa-process-list__heading{font-family:Georgia,serif!important}va-process-list-item p{margin:8px 0 16px}footer{border-top:1px solid #dfe1e2;padding-top:24px;margin-top:32px}.note{background:#e7f6f8;padding:16px;border-left:4px solid #005ea2}#state{font-weight:bold}@media(max-width:479px){h1{font-size:32px}.controls{padding:16px;align-items:flex-start;flex-direction:column}}</style></head><body><main><p>VA native component example</p><h1>Understand a request journey</h1><p>See how a service can explain preparation, sending a request, and reviewing its response.</p><p class="note">Fictional process for design exploration. These are not VA submission instructions or a real case status.</p><div class="controls"><label for="stage">Example stage</label><select id="stage"><option value="0">Preparing a request</option><option value="1">Sending a request</option><option value="2">Reviewing a response</option></select><button id="reset" type="button">Reset example</button></div><p id="state" role="status">Example: preparing a request.</p><h2>The three stages</h2><va-process-list>
  <va-process-list-item header="Prepare your request" level="3"
      checkmark="true" status-text="Complete">
    <p>Identify the record you need and the office that holds it.</p>
    <va-details label="What information helps identify a record?">
      <p>A title, approximate date, or reference number can help distinguish similar records. This is illustrative content, not a VA records-request procedure.</p>
    </va-details>
  </va-process-list-item>
  <va-process-list-item header="Send the request" level="3"
      active="true" status-text="Active">
    <p>In this example, a request is ready for the appropriate service. No request is sent from this page.</p>
  </va-process-list-item>
  <va-process-list-item header="Read the response" level="3"
      pending="true" status-text="Pending">
    <p>A real service should explain where a response appears and how to ask about missing information.</p>
  </va-process-list-item>
</va-process-list><footer>Native VA Web Components 24.14.0 · CSS tokens 0.36.1<br>Arial and Georgia fallbacks. No request is sent or stored.</footer></main><script>globalThis.getVaIconSpriteLocation=()=>new URL("vendor/va-web-24.14.0/sprite.svg",document.baseURI).pathname;</script><script type="module" src="vendor/va-web-24.14.0/component-library.esm.js"></script><script type="module">await customElements.whenDefined('va-process-list-item');const items=[...document.querySelectorAll('va-process-list-item')],select=document.querySelector('#stage');function render(){const current=Number(select.value);items.forEach((item,i)=>{for(const [key,on] of Object.entries({active:i===current,pending:i>current,checkmark:i<current})){item[key]=on;if(on)item.setAttribute(key,'true');else item.removeAttribute(key)}item.statusText=i<current?'Complete':i===current?'Active':'Pending';item.setAttribute('status-text',item.statusText)});document.querySelector('#state').textContent='Example: '+select.selectedOptions[0].textContent.toLowerCase()+'.'}select.addEventListener('change',render);document.querySelector('#reset').addEventListener('click',()=>{select.value='0';render();const detail=document.querySelector('va-details');if(detail.shadowRoot){if(detail.shadowRoot.querySelector('details').open)detail.shadowRoot.querySelector('summary').click()}select.focus()});render();</script></body></html>
```

[Code reference](https://design.va.gov/components/process-list)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

Documented bundler initialization with verified package versions. The standalone browser example uses the corresponding native web-components ESM distribution rather than a React build. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/va.html. Do not open module-based examples through file://.

```javascript
// Install in an application with a JavaScript bundler:
// npm install @department-of-veterans-affairs/component-library@56.14.0 \
//   @department-of-veterans-affairs/css-library@0.36.1
import '@department-of-veterans-affairs/component-library/dist/main.css';
import '@department-of-veterans-affairs/css-library/dist/tokens/css/variables.css';
import { defineCustomElements } from '@department-of-veterans-affairs/component-library';
defineCustomElements();
// Render the va-process-list markup in your page after this initialization.
// Deliver the CSS-library fonts separately, or choose an explicit fallback.
// Components that use va-icon also require the same-origin /img/sprite.svg.
```

## Agent Prompt

Create a VA service-process explanation with one va-process-list containing three to ten va-process-list-item elements. Use verb-led headers, level=3 beneath an h2, visible descriptions, and a single active/pending/checkmark state per item with explicit status-text. Use va-details only for supplementary text within a step, never hide the whole step. Import the current VADS CSS token file and register native components. Preserve 17px body, Bitter/Source Sans family roles, semantic spacing, and 320/480/640/880/1024/1201/1400px boundaries. Any interactive specimen must identify its stages as illustrative and never impersonate a submitted VA application.

## Sources

- [VA Design System](https://design.va.gov/) — Official foundations, content, components and governance.
- [VA patterns](https://design.va.gov/patterns/) — Patterns for application tasks, prefill, signatures and recovery.
- [VA components](https://design.va.gov/components/) — Component specifications, decisions and accessibility material.
- [Download complete working example](/assets/demos/va-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
