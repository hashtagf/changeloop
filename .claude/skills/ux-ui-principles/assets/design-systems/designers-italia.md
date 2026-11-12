# Design System .italia — OpenDesign Application Guide

Implement a readable service sequence with Bootstrap Italia’s real typography, responsive Stepper structure and recoverable local form state.

Independent OpenDesign example focused on Bootstrap Italia. No public authority identity or actual booking service.

## Source Reference

- **Scope:** The system supports Italian public-administration websites and digital services. ([source](https://designers.italia.it/design-system/))
- **Guidance:** Foundations cover content, language, visual design and accessibility. ([source](https://designers.italia.it/design-system/))
- **Developer resource:** Bootstrap Italia is an official implementation resource. ([source](https://designers.italia.it/design-system/come-iniziare/per-sviluppatori/))
- **Version context:** The developer page distinguishes the current v2 resource from v3 beta work. ([source](https://designers.italia.it/design-system/come-iniziare/per-sviluppatori/))
- **Framework ecosystem:** React Kit and Angular Kit are described as community-driven implementations. ([source](https://designers.italia.it/design-system/come-iniziare/per-sviluppatori/))
- **Web Components:** Dev Kit Italia is described as a beta Lit-based Web Component resource. ([source](https://designers.italia.it/design-system/come-iniziare/per-sviluppatori/))


## Design Reference

Bootstrap Italia 2.18.3 installed package and official documentation; native CSS and font rendering checked at three widths.

### Typography and fonts

[Official reference](https://italia.github.io/bootstrap-italia/docs/organizzare-i-contenuti/tipografia/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Main family | Titillium Web | Native WOFF2 weights 400/600/700 included in preview. |
| Long reading / code | Lora / Roboto Mono | font-serif and font-monospace; do not use monospace as the whole interface. |
| Body | 16px / 1.5 | Default base since the 2.7 typography revision. |
| H1 mobile | 40px / 48px | Actual 2.18.3 CSS below 576px. |
| H1 from 576px | 48px / 56px | Measured native CSS; documentation table still says 60px leading. |
| Responsive typography | 576px threshold | Different from the Stepper compact threshold of 992px. |

### Native semantic tokens

[Official reference](https://github.com/italia/bootstrap-italia/blob/v2.18.3/dist/css/bootstrap-italia.min.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-primary | hsl(210,100%,40%) = #0066cc | Primary action and link color. |
| --bs-body-color | hsl(0,0%,10%) | Default reading color. |
| --bs-success | hsl(160,100%,25%) | Success meaning, not an automatic completion state. |
| --bs-danger | hsl(350,60%,50%) | Error or destructive meaning. |
| --bs-warning | hsl(36,100%,30%) | Warning role, distinct from palette yellow. |
| --bs-border-radius | 4px | Small 2px and large 8px variants also exist. |

### Spacing and layout

[Official reference](https://italia.github.io/bootstrap-italia/docs/organizzare-gli-spazi/spaziature/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Utility sizes 0–5 | 0, 4, 8, 16, 24, 48px | At normal 16px root; e.g. p-3=1rem, p-5=3rem. |
| Responsive thresholds | 576 / 768 / 992 / 1200 / 1400px | sm through xxl. |
| Container maxima | 540 / 720 / 960 / 1176 / 1320px | Actual Italia CSS; xl differs from stock Bootstrap 1140px. |
| Preview width | 900px maximum | Application choice for a short local plan, not an official container token. |
| Stepper compact mode | Below 992px | Only active label plus the textual index are visible. |

### Stepper structure

[Official reference](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Root/header | steppers / steppers-header | Header contains a list of stages. |
| Stage states | confirmed / active | Application code must update them after validation. |
| Mobile index | steppers-index | Keep n/total synchronized with active stage. |
| Body | steppers-content; aria-live=polite | Announces changing single-page content. |
| Navigation | steppers-nav; steppers-btn-prev / steppers-btn-next | Classes define presentation, not automatic form routing. |

## Design System .italia System and implementation

### Designers Italia through its code library

Designers Italia is broader than a CSS package: it includes service design guidance, kits and implementation resources. This specimen focuses on the documented Bootstrap Italia implementation, pinned to 2.18.3. It does not imply that installing the library completes a public service design or satisfies every requirement for a municipal website.

Bootstrap Italia includes and customizes Bootstrap 5.2.3 in the inspected release. Do not layer a second stock Bootstrap bundle on top. The preview uses its native CSS and locally supplied Titillium Web font files, with an original three-stage library-visit planning flow.

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/come-iniziare/introduzione/)

## Design System .italia Typography and exact values

### Fonts have distinct jobs

Titillium Web is the normal interface family. Lora is the serif option for longer reading and Roboto Mono handles code or fixed-width material. The preview loads the actual Titillium Web weights it uses, retaining the font license rather than silently substituting a system font.

The body remains 16px. Headings change at 576px: H1 is 40px with 48px leading on a small screen, then 48px with 56px leading in the installed CSS. The documentation table gives 60px desktop leading; the reference table here records the inspected release and explains the discrepancy instead of mixing two sources.

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/organizzare-i-contenuti/tipografia/)

## Design System .italia Responsive stages and spacing

### Two breakpoints solve different problems

The typography threshold is 576px, while the Stepper changes its header presentation below 992px. On compact screens, the current label and n/total index remain visible. The other stage names are not squeezed into unreadable columns. A mobile visitor still needs a current-stage announcement, which the example supplies through heading focus and accessible state text.

Spacing utilities follow the verified rem scale: 4, 8, 16, 24 and 48px for sizes 1 through 5 at a normal root size. The grid container maxima include 1176px at xl, rather than the stock Bootstrap value often copied from memory. The independent plan uses a narrower 900px cap as an explicit application choice.

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/organizzare-gli-spazi/spaziature/)

## Design System .italia Stepper anatomy and ownership

### The header does not drive the workflow

The documented structure separates steppers-header, steppers-content and steppers-nav. Header list items receive confirmed and active classes; the index reports position. Previous and next buttons receive their specific classes. These classes describe presentation. The application must decide whether the current form is valid and whether a later stage can be entered.

The example uses ordinary sections for each step and keeps controls in the DOM, hiding inactive sections. Returning to the access-note step therefore preserves the note. A review step reads the existing controls; it does not recreate them from a guessed server result.

```html
<div class="steppers">
  <div class="steppers-header">
    <ul>
      <li class="confirmed">Visit type <span class="visually-hidden">Completed</span></li>
      <li class="active" aria-current="step">Access note <span class="visually-hidden">Current step</span></li>
      <li>Review</li>
    </ul>
    <span class="steppers-index" aria-hidden="true">2/3</span>
  </div>
  <div class="steppers-content" aria-live="polite">
    <h2>Add an access note</h2>
    <label for="note">Access note (optional)</label>
    <textarea id="note" class="form-control" rows="3"></textarea>
  </div>
  <nav class="steppers-nav" aria-label="Plan steps">
    <button class="btn btn-outline-primary steppers-btn-prev">Back</button>
    <button class="btn btn-primary steppers-btn-next">Continue</button>
  </nav>
</div>
```

[Code reference](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/)

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/)

## Design System .italia Validation and meaningful progress

### Advance only after the required choice

Visit type is required. Continue without choosing it leaves the first step active, reveals a specific error and focuses the first radio. Choosing a type and continuing marks the first stage complete. The optional note can remain blank, in which case the review says that no note was added.

Back moves to the previous stage without clearing the selection or note. Start again deliberately clears both and returns to the beginning. The final screen is called a local plan: it never claims that a booking was submitted, approved or stored.

1. Attempt Continue with no radio selected and inspect the error.
2. Choose a visit type, add a short note and open Review.
3. Return to the note, confirm its value persists, then start again to clear the plan.

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/)

## Design System .italia Accessible state and focus

### Keep visual and spoken position aligned

The active list item carries aria-current="step" and a visually hidden current-stage label. Earlier stages receive completion text as well as their confirmed class. The compact numeric index is hidden from assistive technology because the current heading and stage semantics already express position; it remains visible for visual orientation.

The changing body uses aria-live="polite" as the official guidance recommends for a single-page sequence. The example also focuses the new heading so keyboard users have a predictable reading start. Test that combination with your supported assistive technology to avoid overly repetitive announcements in a more complex form.

- Use real buttons for step changes, with disabled on Back at the first stage.
- Keep labels connected to radios and the textarea; placeholder text is not a label.
- Expose current/completed states in text, not only blue color or an icon.

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/)

## Design System .italia Native assets and initialization

### CSS, fonts and optional JavaScript

The package provides CSS, a bundled script, source fonts and an SVG sprite. This Stepper specimen needs CSS and the chosen fonts; its navigation is application logic. Other widgets use data-bs-toggle or their documented data attributes for automatic initialization. Do not combine automatic initialization with a second manual instance for the same widget.

If using modules, import only the components the application needs. The official guidance notes that transition methods return before the transition ends and calls during a transition may be ignored. Wait for the relevant completion event before chaining dependent actions in those components; this simple Stepper does not invent a native transition API.

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/come-iniziare/introduzione/)

## Design System .italia Integration boundaries

### Use the kit without implying service completion

The library documentation recommends keeping its version current and discourages a public CDN dependency for production. The setup pins the verified release and the local specimen includes its own assets and licenses. A real service still needs content design, data handling, server validation and a confirmed submission response.

The example uses a generic library visit without a municipal logo or official insignia. It is an OpenDesign teaching specimen, not a public authority service. Keep that distinction in any prototype so a visually polished review state cannot be mistaken for a real request record.

[Supporting specification](https://italia.github.io/bootstrap-italia/docs/come-iniziare/introduzione/)

## Component Examples

### Stepper anatomy at the second stage

Confirmed, active and mobile index states must be synchronized by application code.

```html
<div class="steppers">
  <div class="steppers-header">
    <ul>
      <li class="confirmed">Visit type <span class="visually-hidden">Completed</span></li>
      <li class="active" aria-current="step">Access note <span class="visually-hidden">Current step</span></li>
      <li>Review</li>
    </ul>
    <span class="steppers-index" aria-hidden="true">2/3</span>
  </div>
  <div class="steppers-content" aria-live="polite">
    <h2>Add an access note</h2>
    <label for="note">Access note (optional)</label>
    <textarea id="note" class="form-control" rows="3"></textarea>
  </div>
  <nav class="steppers-nav" aria-label="Plan steps">
    <button class="btn btn-outline-primary steppers-btn-prev">Back</button>
    <button class="btn btn-primary steppers-btn-next">Continue</button>
  </nav>
</div>
```

[Code reference](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/)

### Complete local planning flow

Native CSS/fonts, required radio validation, optional note, review, back and reset.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prepare a library visit</title><link rel="stylesheet" href="vendor/bootstrap-italia-2.18.3/bootstrap-italia.min.css"><link rel="stylesheet" href="vendor/bootstrap-italia-2.18.3/fonts.css"><style>body{padding:32px 16px}main{max-width:900px;margin:auto}.steppers-content{padding:24px 0}.steppers-nav{display:flex;gap:16px;justify-content:space-between}.form-check{margin-bottom:16px}footer{font-size:14px;margin-top:32px;border-top:1px solid #ccc;padding-top:16px}[hidden]{display:none!important}.error{color:var(--bs-danger)}@media(max-width:575px){body{padding:24px 16px}}</style><main><p class="text-uppercase">Independent service example</p><h1>Prepare a library visit</h1><p class="lead">Choose a visit format, add a note and review your local plan.</p><div class="steppers"><div class="steppers-header"><ul id="steps"><li class="active" aria-current="step">Visit type <span class="visually-hidden">Current step</span></li><li>Access note</li><li>Review</li></ul><span class="steppers-index" id="index" aria-hidden="true">1/3</span></div><div class="steppers-content" aria-live="polite"><section data-step="0"><h2 tabindex="-1">Choose a visit type</h2><fieldset><legend class="visually-hidden">Visit type</legend><div class="form-check"><input id="guided" type="radio" name="visit" value="Guided introduction"><label for="guided">Guided introduction</label></div><div class="form-check"><input id="quiet" type="radio" name="visit" value="Quiet reading visit"><label for="quiet">Quiet reading visit</label></div></fieldset><p id="error" class="error" role="alert" hidden>Choose a visit type before continuing.</p></section><section data-step="1" hidden><h2 tabindex="-1">Add an access note</h2><p id="hint">Optional. Describe what would help you use the space; avoid sensitive personal information.</p><label for="note">Access note</label><textarea id="note" rows="3" class="form-control" aria-describedby="hint" maxlength="200"></textarea></section><section data-step="2" hidden><h2 tabindex="-1">Review your local plan</h2><dl><dt>Visit type</dt><dd id="review-type"></dd><dt>Access note</dt><dd id="review-note"></dd></dl><p>This is a local plan only. No booking or request has been sent.</p></section></div><nav class="steppers-nav" aria-label="Plan steps"><button id="back" class="btn btn-outline-primary steppers-btn-prev" disabled>Back</button><button id="next" class="btn btn-primary steppers-btn-next">Continue</button><button id="reset" class="btn btn-primary" hidden>Start again</button></nav></div><footer>Native Bootstrap Italia 2.18.3 CSS and Titillium Web. Original local planning flow; no municipal identity or booking service.</footer></main><script>let step=0;const labels=['Visit type','Access note','Review'];function render(){document.querySelectorAll('[data-step]').forEach(x=>x.hidden=Number(x.dataset.step)!==step);document.querySelectorAll('#steps li').forEach((li,i)=>{li.className=i===step?'active':i<step?'confirmed':'';li.removeAttribute('aria-current');li.textContent=labels[i];const state=document.createElement('span');state.className='visually-hidden';state.textContent=i===step?' Current step':i<step?' Completed':'';li.append(state);if(i===step)li.setAttribute('aria-current','step')});document.querySelector('#index').textContent=(step+1)+'/3';document.querySelector('#back').disabled=step===0;document.querySelector('#next').hidden=step===2;document.querySelector('#reset').hidden=step!==2;if(step===2){document.querySelector('#review-type').textContent=document.querySelector('[name=visit]:checked').value;document.querySelector('#review-note').textContent=document.querySelector('#note').value.trim()||'No note added'}document.querySelector('[data-step="'+step+'"] h2').focus()}document.querySelector('#next').onclick=()=>{if(step===0&&!document.querySelector('[name=visit]:checked')){document.querySelector('#error').hidden=false;document.querySelector('#guided').focus();return}document.querySelector('#error').hidden=true;step++;render()};document.querySelector('#back').onclick=()=>{step--;render()};document.querySelector('#reset').onclick=()=>{document.querySelectorAll('[name=visit]').forEach(x=>x.checked=false);document.querySelector('#note').value='';step=0;render()};</script></html>
```

[Code reference](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/)

## Implementation Starting Point

Native CSS and font setup. Stepper navigation is application logic; a complete working example follows. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/designers-italia.html. Do not open module-based examples through file://.

```bash
npm install bootstrap-italia@2.18.3
# Copy dist/css/bootstrap-italia.min.css into public/vendor.
# Copy the needed src/fonts/Titillium_Web WOFF2 files and declare @font-face.
# CSS is sufficient for the Stepper presentation; application code owns navigation.
# For data-bs-toggle widgets, load dist/js/bootstrap-italia.bundle.min.js once.

```

## Agent Prompt

Use Bootstrap Italia 2.18.3 native CSS and Titillium Web. Build the documented steppers/header/content/nav structure with active, confirmed and synchronized mobile index states. Own validation and navigation in application code, preserve values on Back, and label the final state according to a real backend response. Do not mix a second Bootstrap runtime or claim a local review was submitted.

## Sources

- [Installation and assets](https://italia.github.io/bootstrap-italia/docs/come-iniziare/introduzione/) — CSS, modules, bundle, fonts and runtime boundaries.
- [Steppers](https://italia.github.io/bootstrap-italia/docs/componenti/steppers/) — Native structure, states, compact mode and live region.
- [Typography](https://italia.github.io/bootstrap-italia/docs/organizzare-i-contenuti/tipografia/) — Font families and responsive headings.
- [Spacing](https://italia.github.io/bootstrap-italia/docs/organizzare-gli-spazi/spaziature/) — Utility scale and syntax.
- [Published source](https://github.com/italia/bootstrap-italia/blob/v2.18.3/dist/css/bootstrap-italia.min.css) — Pinned release dimensions and semantic variables.
- [Download complete working example](/assets/demos/designers-italia-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
