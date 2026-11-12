# KERN Design System — OpenDesign Application Guide

Build a native KERN interface with verified typography, semantic themes, disclosures and a reversible confirmation flow.

Original demonstration using KERN code. No government identity, persistent storage or accessibility certification is implied.

## Source Reference

- **Domain:** KERN addresses digital public administration. ([source](https://www.kern-ux.de/))
- **Approach:** The system describes technology-independent foundations and components. ([source](https://www.kern-ux.de/design-system/))
- **Implementation:** The integration guide documents HTML and CSS components. ([source](https://www.kern-ux.de/erste-schritte/entwicklerinnen/einbinden-von-kern/))
- **Package:** The documented native package is @kern-ux/native. ([source](https://www.kern-ux.de/erste-schritte/entwicklerinnen/einbinden-von-kern/))
- **Stylesheet:** The guide imports dist/kern.min.css from that package. ([source](https://www.kern-ux.de/erste-schritte/entwicklerinnen/einbinden-von-kern/))
- **Distribution:** The guide offers npm, CDN and copied-library integration paths. ([source](https://www.kern-ux.de/erste-schritte/entwicklerinnen/einbinden-von-kern/))


## Design Reference

Extracted from @kern-ux/native 2.8.2; application layout choices are labelled separately.

### Typography and geometry

[Official reference](https://www.npmjs.com/package/@kern-ux/native/v/2.8.2)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Default font | Fira Sans | Load the packaged font-face file; CSS alone does not load font files. |
| Static sizes | 16 / 18 / 21px | Small, medium and large static text. |
| Adaptive sizes below 768px | 21 / 26 / 32 / 48px | Medium through 2x-large adaptive type. |
| Adaptive sizes from 768px | 24 / 32 / 48 / 72px | The package changes adaptive tokens at this media query. |
| Font weights | 400 / 500 / 600 | Regular, medium and semi-bold. |
| Spacing | 0, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192px | Named space tokens, not a uniform increment scale. |
| Border widths | 0 / 1 / 2 / 4 / 8px | Default border is 2px. |
| Radii | 0 / 2 / 4 / 8px / 50% | None, small, default, large and circle. |
| Focus outline | 4px | Default focus-visible outline uses the contextual action focus role. |
| Specimen width | 800px | Original application choice, not a KERN container token. |

### Semantic color mapping

[Official reference](https://www.npmjs.com/package/@kern-ux/native/v/2.8.2)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Light text | neutral-950 | --kern-color-layout-text-default |
| Dark text | neutral-025 | The same semantic role changes with the theme. |
| Light action | darkblue-700 | --kern-color-action-default; on-action is white. |
| Dark action | darkblue-300 | On-action becomes black. |
| Light / dark background | white / black | --kern-color-layout-background-default |
| Theme override | data-kern-theme="light" or "dark" | Explicit attribute wins over system preference. |

## KERN Design System Native HTML, CSS and browser behavior

### What the package supplies

KERN native 2.8.2 ships component CSS and fonts. The specimen imports those files directly: the button, textarea, Details and Dialog are native elements with KERN classes. No React provider or JavaScript component constructor is necessary. The application supplies the decision logic around the dialog; styling alone does not clear an input.

1. Install the pinned native package.
2. Copy its stylesheet and fonts together, preserving their relative paths.
3. Save the complete specimen below and serve the directory over HTTP.

[Supporting specification](https://www.kern-ux.de/erste-schritte/entwicklerinnen/einbinden-von-kern/)

## KERN Design System Fira Sans and adaptive typography

### Load typography explicitly

kern.min.css names Fira Sans; fonts/fira-sans.css declares the actual font faces and relative WOFF2 assets. Keeping the font directory intact prevents a nominally correct stylesheet from silently falling back. Static text sizes remain 16, 18 and 21px, while adaptive title and heading tokens change at 768px. Use a heading element for hierarchy and the appropriate KERN class for its visual treatment. The sample keeps one h1 and gives the dialog its own h2.

[Supporting specification](https://www.npmjs.com/package/@kern-ux/native/v/2.8.2)

## KERN Design System Spacing, width and responsive layout

### Separate tokens from composition

KERN exposes named space tokens from 0 to 192px, including 2px and 4px increments at the small end. Border and radius tokens are separate scales. The example uses 24px vertical rhythm and a wrapping action row. Its 800px content maximum and 560px dialog cap are explicit application choices; neither is presented as a universal KERN container. At narrow widths, page padding becomes 16px and dialog width stays within the viewport. No viewport-height minimum is applied to the document, so embedding it does not create a resize feedback loop.

[Supporting specification](https://www.npmjs.com/package/@kern-ux/native/v/2.8.2)

## KERN Design System Semantic color and appearance

### Switch roles, not isolated hex values

The package uses semantic CSS properties for text, action, background and focus. Light and dark palettes change these roles together. For example, action-default maps to darkblue-700 in light mode and darkblue-300 in dark mode, while its foreground changes from white to black. The example sets data-kern-theme on html and exposes a pressed-state button. The preference lasts only for this document; it is not stored. Removing the explicit attribute allows the stylesheet to follow prefers-color-scheme.

[Supporting specification](https://www.kern-ux.de/erste-schritte/entwicklerinnen/light-dark-modus/)

## KERN Design System A labeled editable note

### Keep instructions available

The textarea uses kern-form-input__input inside kern-form-input, with a real label pointing to the input id. The hint has its own id and remains connected through aria-describedby. This is an optional local note, so the example does not fabricate required-field errors or a server save. Restore example sets the initial value and focuses the editable field. A status region announces the result without replacing the label or moving focus to passive text.

[Supporting specification](https://www.kern-ux.de/komponenten/form-inputs/)

## KERN Design System Supplementary information with Details

### Let the browser manage disclosure

The details element owns its open state; its summary is the trigger. KERN adds kern-details__header, a small title span and kern-details__body for presentation. The sample places retention information here because it is supplementary. Required instructions, errors and the discard action remain visible outside the disclosure. Native keyboard behavior provides activation without a second click handler or duplicated aria-expanded state.

- Keep the summary descriptive and concise.
- Do not place another button or link inside the summary.
- Use an Accordion for a collection of related disclosures, rather than disguising unrelated actions as Details.

[Supporting specification](https://www.kern-ux.de/komponenten/details/)

## KERN Design System A confirmation with a safe exit

### Structure and control

The dialog is labelled by its h2 and described by a short consequence statement. Header, body and footer use KERN’s documented classes. showModal() places the native dialog in the top layer; close() ends the interaction. Keep note receives initial focus through autofocus. Escape closes without changing the text, and the close listener returns focus to Discard note. Only Yes, discard changes the value. Backdrop clicks deliberately do nothing because this is a destructive confirmation. This follows the documented guidance for critical decisions instead of copying the generic example’s backdrop-dismiss handler indiscriminately.

[Supporting specification](https://www.kern-ux.de/komponenten/dialog/)

## KERN Design System Integration and applicability

### Ship the whole dependency chain

The setup below installs one exact package and copies its CSS and font directory. The full example includes its own layout CSS, root theme attribute, DOM structure and event wiring. Test both outcomes of the dialog, Escape and narrow screens after integrating it with a real form. KERN code is licensed under EUPL; the website distinguishes its textual and graphical material under CC BY-NC-SA. This original specimen does not copy an authority’s identity or imply that a service has passed an accessibility audit. A real application still needs persistence, server validation and an assessment of the complete user journey.

[Supporting specification](https://www.kern-ux.de/lizenz-und-nutzungsbedingungen/)

## Component Examples

### Complete native note and confirmation

All document markup, layout CSS and application behavior; install the assets using the setup block.

```html
<!doctype html><html lang="en" data-kern-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KERN workshop note</title><link rel="stylesheet" href="vendor/kern-2.8.2/kern.min.css"><link rel="stylesheet" href="vendor/kern-2.8.2/fonts/fira-sans.css"><style>body{margin:0;padding:clamp(16px,4vw,40px);color:var(--kern-color-layout-text-default)}main{max-width:800px;margin:auto;display:grid;gap:24px}.top,.actions{display:flex;gap:16px;flex-wrap:wrap;align-items:center}.top{justify-content:space-between}.kern-dialog{max-width:min(560px,calc(100% - 32px))}textarea{width:100%;resize:vertical}#status{min-height:24px}.kern-details{width:100%}</style><main><div class="top"><span class="kern-preline">KERN · Native components</span><button class="kern-btn kern-btn--secondary" id="theme" aria-pressed="false"><span class="kern-label">Dark appearance</span></button></div><h1 class="kern-heading kern-heading--large">Workshop note</h1><p class="kern-body">Prepare a short note for your next workshop. This demonstration keeps edits only in this page.</p><div class="kern-form-input"><label class="kern-label" for="note">Your note</label><p class="kern-hint" id="hint">No personal information is needed. Nothing is submitted.</p><textarea class="kern-form-input__input" rows="5" id="note" aria-describedby="hint">Discuss accessible ways to collect workshop feedback.</textarea></div><details class="kern-details"><summary class="kern-details__header"><span class="kern-title kern-title--small">What happens to this note?</span></summary><div class="kern-details__body"><p class="kern-body">Edits live in this browser tab. Reloading restores the example text. Discarding clears the current note after confirmation; it does not delete a server record.</p></div></details><div class="actions"><button class="kern-btn kern-btn--primary" id="discard"><span class="kern-label">Discard note</span></button><button class="kern-btn kern-btn--secondary" id="restore"><span class="kern-label">Restore example</span></button></div><p id="status" class="kern-body" role="status"></p><dialog class="kern-dialog" id="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-description"><header class="kern-dialog__header"><h2 class="kern-title kern-title--large" id="confirm-title">Discard this note?</h2></header><section class="kern-dialog__body"><p class="kern-body" id="confirm-description">Your current text will be cleared from this page. Choose Keep note to continue editing.</p></section><footer class="kern-dialog__footer"><button class="kern-btn kern-btn--secondary" id="keep" autofocus><span class="kern-label">Keep note</span></button><button class="kern-btn kern-btn--primary" id="clear"><span class="kern-label">Yes, discard</span></button></footer></dialog></main><script>const byId=id=>document.getElementById(id),note=byId('note'),modal=byId('confirm'),original=note.value;byId('discard').onclick=()=>modal.showModal();byId('keep').onclick=()=>modal.close('keep');byId('clear').onclick=()=>{note.value='';modal.close('discard');byId('status').textContent='Note discarded from this page.'};modal.addEventListener('close',()=>byId('discard').focus());byId('restore').onclick=()=>{note.value=original;byId('status').textContent='Example restored.';note.focus()};byId('theme').onclick=()=>{const dark=document.documentElement.dataset.kernTheme!=='dark';document.documentElement.dataset.kernTheme=dark?'dark':'light';byId('theme').setAttribute('aria-pressed',String(dark))};</script></html>
```

[Code reference](https://www.kern-ux.de/komponenten/dialog/)

## Implementation Starting Point

No build step or UI framework is required. Preserve the font directory because its CSS resolves relative WOFF2 files. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/kern.html. Do not open module-based examples through file://.

```bash
npm install --save-exact @kern-ux/native@2.8.2
mkdir -p vendor/kern-2.8.2
cp node_modules/@kern-ux/native/dist/kern.min.css vendor/kern-2.8.2/
cp -R node_modules/@kern-ux/native/dist/fonts vendor/kern-2.8.2/
# Save the complete HTML example below as kern.html beside vendor/.
python3 -m http.server 8080
# Open http://localhost:8080/kern.html
```

## Agent Prompt

Build the local workshop-note example with @kern-ux/native 2.8.2 CSS and packaged Fira Sans. Compose a labelled kern-form-input textarea, a supplementary native Details disclosure and a kern-dialog with labelled header, body and footer. Open it with showModal(), autofocus Keep note, let Escape cancel without changing the text, and clear the note only after Yes, discard. Return focus to the trigger on close and provide Restore example. Switch data-kern-theme between light and dark without inventing new palette tokens. Preserve the original application width choices and keep the note local; no upload, server draft or government-service claim is required.

## Sources

- [KERN overview](https://www.kern-ux.de/) — Public-administration context and resource entry points.
- [Design system](https://www.kern-ux.de/design-system/) — Foundations, components and the system’s approach.
- [Integration guide](https://www.kern-ux.de/erste-schritte/entwicklerinnen/einbinden-von-kern/) — Documented native package and stylesheet setup.
- [Download complete working example](/assets/demos/kern-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
