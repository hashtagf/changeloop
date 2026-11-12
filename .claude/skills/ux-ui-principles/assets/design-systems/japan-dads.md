# Digital Agency Design System — OpenDesign Application Guide

Build readable Japanese public-service interfaces with DADS text roles, semantic tokens and native HTML component anatomy. Try a working receipt lookup with format errors, a no-match result and a reviewable status record.

Independent educational composition using official sample CSS and tokens. No government endorsement, live lookup or copied agency identity. Font falls back to locally available system sans. Application layout and record data are not official DADS specifications.

## Source Reference

- **Maintainer:** The design system is published by Japan’s Digital Agency. ([source](https://design.digital.go.jp/dads/))
- **Publication model:** The beta label is described as a living standard. ([source](https://design.digital.go.jp/dads/))
- **Design files:** The resources include corresponding Figma design data. ([source](https://design.digital.go.jp/dads/resources/))
- **Code examples:** Official examples cover plain HTML/CSS/JavaScript and React/Tailwind CSS. ([source](https://design.digital.go.jp/dads/resources/))
- **Token tooling:** The resources link a Tailwind CSS plugin based on design tokens. ([source](https://design.digital.go.jp/dads/resources/))
- **Document format:** The site provides its documentation and accessibility guidance in Markdown. ([source](https://design.digital.go.jp/dads/resources/))


## Design Reference

DADS beta v2.18.0 documentation; native HTML sample styles inspected 3 October 2026; design-tokens 2.0.1. The documentation, sample repository and token package have separate version histories. Layout choices below are explicitly distinguished from official component values.

### Typography

[Official reference](https://design.digital.go.jp/dads/foundations/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Sans family | Noto Sans JP, system fallbacks | The preview uses the documented fallback stack without downloading a font. |
| Std-17N-170 | 17px / 1.7; weight 400 | Standard reading text; token naming describes size, weight and line height. |
| Body / UI baseline | 16px or greater | 14px is reserved for limited supporting contexts. |
| Weight roles | N = 400; B = 700 | Use native regular and bold faces. |

### Native input anatomy

[Official reference](https://github.com/digital-go-jp/design-system-example-components-html/blob/main/src/components/input-text/input-text.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| data-size sm / md / lg | 2.5rem / 3rem / 3.5rem | Control heights at the root font size, not three different text sizes. |
| Input border / radius | 1px / 0.5rem | Border uses neutral-solid-gray-600; radius is component CSS. |
| Input padding | 0.75rem 1rem | Block and inline padding; max-width 100%. |
| Focus | 4px black outline, 2px offset, 2px yellow shadow | Native focus-visible style; avoid clipping at container edges. |

### Token package colours

[Official reference](https://github.com/digital-go-jp/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-key-900 | #0017c1 | Default key alias points to primitive-blue-900. |
| --color-semantic-error-1 | #ec0000 | Alias points to primitive-red-800; pair with an error message. |
| --color-neutral-solid-gray-900 | #1a1a1a | Input text. |
| --color-neutral-solid-gray-600 | #666666 | Default input border. |
| --color-primitive-yellow-300 | #ffd43d | Focus shadow behind the black outline. |

### Buttons and application spacing

[Official reference](https://design.digital.go.jp/dads/components/button/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Large minimum | 136 × 56px | Allow labels to expand and wrap. |
| Medium minimum | 96 × 48px | Suitable for a secondary action. |
| Small / extra-small minimum | 80 × 36px / 72 × 28px | Ensure a 44 CSS px target region even when the visible control is shorter. |
| Preview rhythm | 8 / 24 / 64px | Application selection from the spacing guidance examples; not a mandatory DADS scale. |

## Digital Agency Design System Resources and scope

### Choose the HTML source path

The official resource index offers HTML/CSS/JavaScript samples, React/Tailwind samples, a Tailwind plugin and Figma design data. This example selects the plain HTML path: the input and button CSS are copied unchanged, while the surrounding status lookup and client-side validation are application code. There is no invented universal DADS component package.

The preview is an independent fictional municipal procedure lookup. It does not reproduce a government masthead, query a public database or claim official service status. Its receipt format and status records are example data.

1. Load design-tokens before the two component styles.
2. Keep the documented classes and data attributes on native HTML controls.
3. Add service-specific validation, status content and focus movement in application code.

[Supporting specification](https://design.digital.go.jp/dads/resources/)

## Digital Agency Design System Typography and language

### Read the text-style name

Std-17N-170 describes 17px regular type with a unitless 1.7 line height. The preview applies that reading rhythm to prose and selects 32px bold with 1.5 line height for its heading. Noto Sans JP is the documented sans choice, with system fallbacks available when the webfont is not loaded. This local example intentionally uses those fallbacks.

Japanese text and English text do not occupy equal widths. Keep labels visible above controls, allow the heading to wrap and avoid sizing a button from an assumed character count. A translation can require more vertical space without changing the component role.

[Supporting specification](https://design.digital.go.jp/dads/foundations/typography/)

## Digital Agency Design System Semantic colour and focus

### Use the aliases actually consumed by CSS

The sample button declares its default colour from --color-key-900. The distributed token stylesheet resolves that alias to blue-900, #0017c1. Its hover and active rules select key-1000 and key-1200 instead of applying arbitrary opacity. The input error border reads --color-semantic-error-1.

The black outline and yellow shadow remain visible when a control receives keyboard focus. Place the control away from clipping containers; an overflow-hidden card can cut off the ring even when the component CSS is correct. Error text and aria-invalid supplement the red border.

[Supporting specification](https://github.com/digital-go-jp/design-tokens)

## Digital Agency Design System Spacing and responsive flow

### Choose a small application rhythm

DADS spacing guidance gives examples rather than prescribing one compulsory sequence for every interface. This composition uses 8px inside related units, 24px between form sections and 64px as a generous desktop page inset. The content maximum of 52rem is an application decision, not a DADS token.

At narrow widths the result definitions stack and controls fill available space. A 768px media query is used only by this example. It is not presented as a universal DADS breakpoint; content wrapping and the minimum button size remain the reasons for the change.

```css
.lookup { max-width:52rem; margin-inline:auto; padding:64px 24px; }
@media(max-width:767px) { .lookup { padding:24px; } .actions { align-items:stretch; } }
```

[Code reference](https://design.digital.go.jp/dads/foundations/spacing/)

[Supporting specification](https://design.digital.go.jp/dads/foundations/spacing/)

## Digital Agency Design System Input structure and errors

### Keep label, hint and error separate

The native .dads-input-text wrapper defines text defaults. The .dads-input-text__input child owns size, border, padding, radius and focus states. The accompanying label is explicitly connected with for/id. The hint remains available after an error so the user does not lose the expected format.

The example accepts exactly six ASCII digits. A malformed entry sets aria-invalid=true, reveals the linked error message and returns focus to the input. A syntactically valid value other than 123456 produces a separate no-match message; it is not described as a formatting error. Both behaviours are local demonstration rules.

- Keep the input type textual: a reference is an identifier, not a quantity.
- Use inputmode=numeric as a keyboard hint without numeric-input spin buttons.
- Keep the entered value while explaining the next correction.

[Supporting specification](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/input-text)

## Digital Agency Design System Button hierarchy and states

### One main action for this lookup

The filled Large button triggers the lookup, and the text-style button clears the example. The native data-type values are solid-fill, outline and text; data-size selects lg, md, sm or xs. These are sample HTML attributes rather than React props.

The large button has a minimum 136px width and 56px height. It can expand when its label requires more space. Small and extra-small variants use an enlarged target area in the supplied CSS; do not pack neighbouring targets into that area. The demo uses the larger variants to avoid this conflict.

[Supporting specification](https://design.digital.go.jp/dads/components/button/)

## Digital Agency Design System A useful status result

### Make local state inspectable

Entering 123456 reveals a fictional receipt with a definition list for reference, submitted date and next action. The heading receives focus after lookup, so a keyboard user reaches the new result directly. The no-match state also receives focus and includes a retry path.

The three-stage list is original application markup. It distinguishes received, checking and decision using text as well as shape and colour. A real implementation must obtain those values from its service and handle unauthorised, unavailable and expired records. The preview makes no external request and never implies that it has found an actual citizen record.

[Supporting specification](https://design.digital.go.jp/dads/components/description-list/)

## Digital Agency Design System Integrate the specimen

### Separate tokens, styles and behaviour

The token package exposes dist/tokens.css. The HTML samples are a source repository with Storybook scripts; cloning that repository gives an inspection environment. Copy the required component styles with their licence and record the source revision before adapting them for production.

For this page the token package is pinned to 2.0.1 and the HTML styles are a dated source snapshot. The standalone demo loads local files, so its verified rendering does not depend on a live CDN. The Storybook setup command is supplied as the official repository entry path; a fresh dependency installation was not executed for this preview.

[Supporting specification](https://github.com/digital-go-jp/design-system-example-components-html)

## Component Examples

### A labelled reference input

Native DADS input classes with a persistent hint and an associated error.

```html
<div class="dads-input-text">
  <label for="reference">Reference number (required)</label>
  <p id="reference-hint">Use the 6 digits on your example receipt.</p>
  <input class="dads-input-text__input" data-size="lg"
    id="reference" inputmode="numeric" autocomplete="off"
    aria-describedby="reference-hint reference-error" aria-invalid="true">
  <span class="dads-input-text__error-text" id="reference-error">
    Enter 6 digits, for example 123456.
  </span>
</div>
```

[Code reference](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/input-text)

- Remove aria-invalid and hide the error after a valid correction.
- Reference validation is application logic.

### Primary lookup and reset actions

Use native button variants and HTML action types.

```html
<button class="dads-button" data-type="solid-fill" data-size="lg" type="submit">
  Show example status
</button>
<button class="dads-button" data-type="text" data-size="md" type="reset">
  Clear reference
</button>
```

[Code reference](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/button)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DADS procedure receipt example</title><link rel="stylesheet" href="vendor/dads-2026-10-03/tokens.css"><link rel="stylesheet" href="vendor/dads-2026-10-03/input-text.css"><link rel="stylesheet" href="vendor/dads-2026-10-03/button.css"><style>
*{box-sizing:border-box}body{margin:0;color:var(--color-neutral-solid-gray-900);font:400 17px/1.7 var(--font-family-sans);background:#fff}.lookup{max-width:52rem;padding:64px 24px;margin:auto}.eyebrow{font-size:14px;letter-spacing:.08em;border-bottom:1px solid #b3b3b3;padding-bottom:16px}h1{font-size:32px;line-height:1.5;margin:24px 0}h2{font-size:24px;line-height:1.5}p{margin:8px 0 24px}.field{margin:32px 0}label{font-weight:700;display:block}.dads-input-text__input{width:22rem}#reference-hint{margin:8px 0}.actions{display:flex;gap:24px;flex-wrap:wrap;align-items:center;margin:24px 0}.result{border-top:4px solid var(--color-key-900);background:#f5f5f5;padding:24px;margin-top:32px}.result:focus{outline:3px solid #111;outline-offset:4px}dl{display:grid;grid-template-columns:10rem 1fr;gap:16px}dt{font-weight:700}dd{margin:0;overflow-wrap:anywhere}ol{padding-left:24px}li{padding:8px}li.current{font-weight:700;color:var(--color-key-900)}small{display:block;font-size:14px;margin-top:32px;color:#555}[hidden]{display:none!important}@media(max-width:767px){.lookup{padding:24px}h1{font-size:28px}.actions{align-items:stretch;flex-direction:column}.actions button{width:100%}dl{grid-template-columns:1fr;gap:4px}dd{margin-bottom:16px}}
</style><main class="lookup"><div class="eyebrow">SERVICE PATTERN · DADS HTML</div><h1>Check a procedure receipt</h1><p>Use the reference from your receipt to view the next step. This is a fictional local example.</p><form id="lookup-form" novalidate><div class="dads-input-text field"><label for="reference">Reference number (required)</label><p id="reference-hint">Enter 6 digits. Try <strong>123456</strong> for the example record.</p><input id="reference" class="dads-input-text__input" data-size="lg" inputmode="numeric" autocomplete="off" aria-describedby="reference-hint reference-error"><span id="reference-error" class="dads-input-text__error-text" hidden>Enter 6 digits, for example 123456.</span></div><div class="actions"><button class="dads-button" data-type="solid-fill" data-size="lg" type="submit">Show example status</button><button class="dads-button" data-type="text" data-size="md" type="reset">Clear reference</button></div></form><section class="result" id="missing" tabindex="-1" hidden><h2>No matching example</h2><p>This reference has the correct format, but is not in the local example data. Try 123456.</p></section><section class="result" id="found" tabindex="-1" hidden><h2>Receipt 123456</h2><dl><dt>Procedure</dt><dd>Community room request</dd><dt>Submitted</dt><dd>1 October 2026 — fictional date</dd><dt>Next action</dt><dd>Wait for the example review. No documents are currently requested.</dd></dl><ol aria-label="Procedure progress"><li>Received</li><li class="current" aria-current="step">Checking the request — current step</li><li>Decision — not started</li></ol></section><small>Independent OpenDesign demonstration. Native DADS component CSS; system font fallback. No information is sent or stored.</small></main><script>
const f=document.querySelector('form'),i=document.querySelector('input'),e=document.querySelector('#reference-error'),found=document.querySelector('#found'),missing=document.querySelector('#missing');f.addEventListener('submit',ev=>{ev.preventDefault();found.hidden=missing.hidden=true;const valid=/^[0-9]{6}$/.test(i.value.trim());e.hidden=valid;i.setAttribute('aria-invalid',String(!valid));if(!valid){i.focus();return}const target=i.value.trim()==='123456'?found:missing;target.hidden=false;target.focus()});f.addEventListener('reset',()=>{found.hidden=missing.hidden=e.hidden=true;i.removeAttribute('aria-invalid');i.focus()});
</script></html>

```

[Code reference](https://github.com/digital-go-jp/design-system-example-components-html)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

Official sample-repository workflow and verified token import path. This preview runs locally copied CSS; it does not require React or a backend. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/japan-dads.html. Do not open module-based examples through file://.

```bash
# Official HTML samples are a source repository, not a published component SDK.
git clone https://github.com/digital-go-jp/design-system-example-components-html.git
cd design-system-example-components-html
npm install
npm run storybook
# For the standalone composition, copy these component styles into your app:
# src/components/input-text/input-text.css
# src/components/button/button.css
# Install the independently versioned token package:
npm install @digital-go-jp/design-tokens@2.0.1
# In a CSS-aware bundler entry:
# import '@digital-go-jp/design-tokens/dist/tokens.css';
# import './input-text.css';
# import './button.css';
```

## Agent Prompt

Implement a fictional public-service receipt lookup using DADS HTML input-text and button styles plus design-tokens 2.0.1. Keep the visible label, format hint, aria-describedby and invalid state. Use Std-17N-170 prose rhythm and large primary action. Show separate malformed, no-match and found states. Preserve entered text, focus new status headings, avoid real personal data and government identity marks. Treat the 52rem content width and 8/24/64px spacing as application choices.

## Sources

- [Official system](https://design.digital.go.jp/dads/) — System scope, guidance and current release context.
- [Foundations](https://design.digital.go.jp/dads/foundations/) — Typography, color, layout and other visual foundations.
- [Implementation resources](https://design.digital.go.jp/dads/resources/) — Official design data, code examples and Markdown documentation.
- [Download complete working example](/assets/demos/japan-dads-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
