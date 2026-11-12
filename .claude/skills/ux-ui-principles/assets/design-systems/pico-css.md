# Pico CSS Design System — OpenDesign Application Guide

Pico CSS styles semantic HTML with a responsive rem-based type scale and theme variables. Its standard, classless and conditional distributions have different integration scopes; this guide uses the standard build for a reading-preferences form with native disclosure and dialog behavior.

Pico CSS 2.1.1. Default tokens are separated from the original reading layout and profile rules. No persistence or remote service is implemented.

## Source Reference

- **Library scope:** Minimal CSS framework ([source](https://picocss.com/))
- **Platform or architecture:** Styles semantic HTML ([source](https://picocss.com/docs))
- **Integration:** Provides a classless option ([source](https://picocss.com/docs))
- **Component support:** Supports light and dark color schemes ([source](https://picocss.com/docs))
- **Customization or behavior:** Includes form styling ([source](https://picocss.com/docs))
- **Additional capability:** Documentation covers CSS variables ([source](https://picocss.com/docs))


## Design Reference

Pico CSS 2.1.1 default compiled stylesheet. The first color definitions are its light theme. Responsive root font scaling changes the pixel value of rem; do not assume every viewport uses a 16px root. Reading widths and the 800px composition breakpoint are application choices.

### Typography and rhythm

[Official reference](https://picocss.com/docs/css-variables)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pico-font-family | var(--pico-font-family-sans-serif) | System sans-serif family alias. |
| --pico-line-height | 1.5 | Default body line height. |
| --pico-font-size | 100% | Initial root size, before responsive media rules. |
| --pico-spacing | 1rem | Base spacing unit. |
| --pico-typography-spacing-vertical | 1rem | Vertical text rhythm. |
| --pico-grid-column-gap | var(--pico-spacing) | Gap between native .grid columns. |
| --pico-border-radius | 0.25rem | Default control/card shape. |
| --pico-border-width | 0.0625rem | Default boundary thickness. |
| --pico-outline-width | 0.125rem | Focus outline width. |
| --pico-form-element-spacing-vertical | 0.75rem | Vertical input/button padding. |
| --pico-form-element-spacing-horizontal | 1rem | Horizontal input/button padding. |

### Light primary roles

[Official reference](https://picocss.com/docs/css-variables)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pico-primary | #0172ad | Link/primary reading color. |
| --pico-primary-background | #0172ad | Primary button background. |
| --pico-primary-hover | #015887 | Hovered primary text. |
| --pico-primary-hover-background | #02659a | Hovered primary button surface. |
| --pico-primary-focus | rgba(2, 154, 232, 0.5) | Focus emphasis color. |
| --pico-primary-inverse | #fff | Text on primary background. |
| --pico-background-color | #fff | Page surface. |
| --pico-color | #373c44 | Default body text. |
| --pico-muted-color | #646b79 | Secondary text. |

### Responsive root sizes

[Official reference](https://picocss.com/docs/css-variables)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Base | 100% | 16px if browser default is 16px. |
| ≥576px | 106.25% | 17px under the same assumption. |
| ≥768px | 112.5% | 18px. |
| ≥1024px | 118.75% | 19px. |
| ≥1280px | 125% | 20px. |
| ≥1536px | 131.25% | 21px. |

### Heading sizes and application controls

[Official reference](https://picocss.com/docs/css-variables)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| h1 | 2rem / 1.125 | Official heading size and line height. |
| h2 | 1.75rem / 1.15 | Official second-level heading. |
| h3 | 1.5rem / 1.175 | Official third-level heading. |
| Reading measure | 48ch / 62ch / 72ch | Original selectable maximum line lengths. |
| Sample scale | 90–125%; step 5 | Original range limits, applied only to sample text. |
| Composition breakpoint | 800px | Original two-column-to-stack rule. |

## Pico CSS Design System A Small Semantic HTML Surface

### A Small Semantic HTML Surface

Pico styles familiar HTML elements rather than asking every paragraph, field, or button to carry a long component class list. In this example, article supplies the preference card, its header and footer establish boundaries, and labels contain the native input/select controls. The main element uses container because this is the standard Pico build, not the separate classless distribution.

This makes Pico useful for compact tools and content-driven interfaces where the browser’s native controls are sufficient. It does not turn a form into an application by itself. The complete JavaScript owns the reading sample, review snapshot and local result, while the browser handles basic input semantics.

[Supporting specification](https://picocss.com/docs/forms)

## Pico CSS Design System Theme Variables and Semantic Roles

### Theme Variables and Semantic Roles

The default primary role is not a single color applied indiscriminately. Pico separates primary text, background, hover, focus and inverse values. The reference table lists the actual light definitions so a brand customization can preserve the relationships. Reading-room labels use the primary text role; buttons inherit the full component treatment from Pico.

The appearance switch sets data-theme on html. An explicit light or dark attribute overrides automatic scheme selection. If you remove it, Pico can follow the browser’s preferred color scheme. The demo uses an explicit starting mode to keep its checkbox and visual appearance synchronized. Override both scheme definitions when introducing a custom primary palette; changing a light root value alone is insufficient for a complete dark theme.

[Supporting specification](https://picocss.com/docs/css-variables)

## Pico CSS Design System Responsive Typography Changes the Whole Scale

### Responsive Typography Changes the Whole Scale

Pico changes its root font size at several viewport widths: 100% initially, then 106.25%, 112.5%, 118.75%, 125%, and 131.25%. At a browser default of 16px these correspond to 16–21px. Because component spacing uses rem, the comfortable layout expands alongside the text. A token described as one rem therefore does not always equal sixteen pixels.

The sample’s slider changes only #sample font-size to a percentage of its inherited size. It does not rewrite Pico’s root variable or the browser’s zoom setting. This distinction keeps the settings controls stable and makes the local scope clear. The native output displays the selected percentage. Heading sizes retain Pico defaults: h1 is 2rem and h2 is 1.75rem.

[Supporting specification](https://picocss.com/docs/typography)

## Pico CSS Design System Line Measure and the Reading Composition

### Line Measure and the Reading Composition

The three line measures are original choices expressed in ch units. They set a maximum width rather than forcing the text to exceed its column. The sample may be narrower than the selected maximum on mobile; that is the expected result of a responsive maximum. No horizontal scroll is necessary to honor a wide preference.

The custom reading-layout has two minmax columns and collapses below 800px. That threshold is specific to this composition, not an official Pico breakpoint. The paired review/reset buttons use Pico’s grid helper, while the dialog footer uses a wrapping flex row. Keeping a readable settings panel takes priority over maintaining a two-column arrangement on narrow screens.

[Supporting specification](https://picocss.com/docs/grid)

## Pico CSS Design System Native Validation With a Useful Review Step

### Native Validation With a Useful Review Step

Profile name uses required and minlength, with associated small help text. Native constraint validation prevents an empty submission. The script adds a trimmed-value check so a pair of spaces cannot satisfy the application rule. An invalid event adds aria-invalid for Pico’s invalid styling; typing clears the custom error and stale invalid attribute.

Select and range are normal browser controls. They update the reading sample immediately, while Review profile captures a separate pending object. That snapshot is the text shown in the dialog and the data used by Apply locally, so the confirmation does not accidentally describe one set of values and apply another.

1. Leave the profile name empty and try Review profile.
2. Enter a name, choose a width, and change the sample size.
3. Review the snapshot, cancel to keep editing, or apply it to the local status.

[Supporting specification](https://picocss.com/docs/forms)

## Pico CSS Design System A Real Modal, Not Just a Styled Overlay

### A Real Modal, Not Just a Styled Overlay

Pico styles dialog and its article content but does not supply application JavaScript. This specimen calls HTMLDialogElement.showModal. The browser places the dialog in the top layer, makes the rest of the document inert, and provides native Escape dismissal. Merely setting the open attribute would create a different, nonmodal behavior and is not used here.

The dialog has aria-labelledby pointing to its heading. The close button has an explicit accessible label, while Keep editing and Apply locally describe the two outcomes. Both cancellation buttons call close without changing the saved status. Applying records the pending profile in visible text and closes the dialog; it does not write localStorage or send a request.

[Supporting specification](https://picocss.com/docs/modal)

## Pico CSS Design System A Native Disclosure for Supporting Explanation

### A Native Disclosure for Supporting Explanation

The details/summary pair explains which controls affect the sample and which do not. It is genuinely expandable without JavaScript because that behavior belongs to the HTML element. The summary provides a descriptive question and remains keyboard operable. The explanation is supporting content, so it does not interrupt the main form with another always-open panel.

Do not replace details with a styled heading merely because the closed screenshot looks similar. Likewise, the appearance input retains type=checkbox with role=switch, so it has a real binary state. Pico’s styling is applied to semantic structures; those structures carry much of the interaction contract.

- article provides a visually grouped preference surface.
- details and summary provide native disclosure.
- dialog opened with showModal provides a modal review boundary.

[Supporting specification](https://picocss.com/docs/accordion)

## Pico CSS Design System Install Once and Keep the Example Reproducible

### Install Once and Keep the Example Reproducible

The standard package contains a compiled pico.min.css. Copy it to a local assets folder, include it before the application’s layout rules, and load the supplied app.js with defer. The complete markup, CSS and script are provided above. No framework provider, icon font or third-party JavaScript plugin is required for this example.

Use the standard stylesheet consistently with its container/grid classes. The classless build makes different layout assumptions, and the conditional build scopes styling differently; exchanging these distributions without checking markup is not a neutral optimization. If adding Pico to an established site, inspect how its element selectors interact with existing form and typography styles before applying it globally.

[Supporting specification](https://picocss.com/docs/css-variables)

## Pico CSS Design System Choose the Distribution Before Adapting the Markup

### Choose the Distribution Before Adapting the Markup

This specimen uses the standard distribution and its container and grid helpers. The classless distribution changes the layout assumptions, while the conditional distribution scopes Pico styling. Treat choosing a distribution as an integration decision rather than an interchangeable file-size optimization.

On an established site, examine the reach of element selectors over existing headings, forms, articles and dialogs. The reading sample’s percentage font size is a local override and should stay local; changing the root scale would also change Pico’s rem-based spacing and controls. Keep the appearance attribute and application preference controls aligned when deciding which parts of the document inherit the theme.

[Supporting specification](https://picocss.com/docs/forms)

## Component Examples

### Complete semantic reading interface

Labels wrap their controls, article creates the settings card, details supplies disclosure, and dialog contains the review.

```html
<main class="container"><header><p class="kicker">PICO CSS / READING ROOM</p><h1>A calmer reading setup</h1><p>Adjust a local reading profile. Semantic HTML does most of the work.</p></header><div class="reading-layout"><article><header><h2>Reading preferences</h2></header><form id="preferences"><label for="reader">Profile name<input id="reader" name="reader" required minlength="2" placeholder="Weekend reader" aria-describedby="name-help"></label><small id="name-help">At least two characters. Saved only for this open preview.</small><label for="measure">Reading width<select id="measure"><option value="48">Narrow — 48 characters</option><option value="62" selected>Balanced — 62 characters</option><option value="72">Wide — 72 characters</option></select></label><label for="scale">Text size <output id="size-label">100%</output><input id="scale" type="range" min="90" max="125" step="5" value="100"></label><label><input id="night" type="checkbox" role="switch"> Dark appearance</label><div class="grid"><button type="submit">Review profile</button><button type="reset" class="secondary outline">Reset</button></div></form><footer id="saved" role="status">No profile applied yet.</footer></article><section class="reading-copy"><p class="kicker">A SHORT SAMPLE</p><h2>Make space for attention.</h2><div id="sample"><p>The margin is not leftover space. It gives each paragraph a clear beginning and lets the eye return to the next line without effort.</p><p>A reading interface can be quiet without becoming empty. Descriptive headings, useful contrast, and a predictable rhythm let the content remain in charge.</p></div><details><summary>What changes in this preview?</summary><p>Width changes the maximum line measure, text size scales only this sample, and the appearance switch changes Pico’s theme. These are local preferences, not browser accessibility settings.</p></details></section></div><small>Official Pico CSS 2.1.1. Native form, details, and dialog elements; original application behavior.</small></main><dialog id="review" aria-labelledby="review-title"><article><header><button id="close" aria-label="Close review" rel="prev"></button><h2 id="review-title">Review reading profile</h2></header><p id="review-text"></p><footer><button id="cancel" class="secondary">Keep editing</button><button id="apply">Apply locally</button></footer></article></dialog>

```

[Code reference](https://picocss.com/docs/modal)

- Pico styles these elements; browser APIs provide native behavior.
- Dialog opens through showModal, not by adding an open attribute.

### Original profile interaction

Live styles, native validation, safe review text, and local apply/reset behavior.

```javascript
const $=id=>document.getElementById(id);let pending=null;
function update(){ $('sample').style.maxWidth=$('measure').value+'ch';$('sample').style.fontSize=$('scale').value+'%';$('size-label').value=$('scale').value+'%';document.documentElement.dataset.theme=$('night').checked?'dark':'light';}
for(const id of ['measure','scale','night'])$(id).addEventListener('input',update);
$('preferences').addEventListener('submit',event=>{event.preventDefault();pending={name:$('reader').value.trim(),width:$('measure').value,size:$('scale').value,dark:$('night').checked};if(pending.name.length<2){$('reader').setCustomValidity('Use at least two non-space characters.');$('reader').reportValidity();return;}$('review-text').textContent=`${pending.name}: ${pending.width}-character maximum, ${pending.size}% sample text, ${pending.dark?'dark':'light'} appearance. This will apply only to this preview.`;$('review').showModal();});
$('reader').addEventListener('input',()=>{$('reader').setCustomValidity('');$('reader').removeAttribute('aria-invalid')});$('reader').addEventListener('invalid',()=>{$('reader').setAttribute('aria-invalid','true')});
for(const id of ['close','cancel'])$(id).addEventListener('click',()=>$('review').close());
$('apply').addEventListener('click',()=>{$('saved').textContent=`Applied ${pending.name} locally (${pending.width}ch, ${pending.size}%, ${pending.dark?'dark':'light'}). Reloading clears this profile.`;$('review').close();});
$('preferences').addEventListener('reset',()=>{setTimeout(()=>{$('reader').setCustomValidity('');$('reader').removeAttribute('aria-invalid');$('saved').textContent='No profile applied yet.';update()},0)});update();

```

[Code reference](https://picocss.com/docs/forms)

- The profile never leaves this document.
- Whitespace-only names are rejected with setCustomValidity.

### Reading layout

Explicit application rules separate the settings panel from the sample.

```css
main.container{max-width:1120px;padding:2rem 1rem}.kicker{font-size:.7rem;letter-spacing:.13em;font-weight:700;color:var(--pico-primary)}.reading-layout{display:grid;grid-template-columns:minmax(260px,.95fr) minmax(0,1.05fr);gap:2rem;align-items:start}.reading-copy{padding-top:1rem}#sample{transition:font-size .15s}output{float:right}#review article{max-width:560px}#review footer{display:flex;flex-wrap:wrap;gap:.5rem}#review footer button{flex:1}h1{max-width:20ch}header>p{max-width:65ch}@media(max-width:800px){.reading-layout{grid-template-columns:1fr;gap:1rem}}

```

[Code reference](https://picocss.com/docs/grid)

- The 800px breakpoint and ch measures are custom choices.

## Implementation Starting Point

Save the complete examples above as the body, style.css and app.js. The standalone preview inlines the same official CSS and original application code. Uses current browser support for the native dialog API. The HTML wrapper includes the full body markup; save the supplied interaction and CSS examples under the filenames referenced here.

```html
<!-- npm install @picocss/pico@2.1.1
mkdir -p assets
cp node_modules/@picocss/pico/css/pico.min.css assets/pico.min.css -->
<!doctype html>
<html lang="en" data-theme="light">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reading room</title>
<link rel="stylesheet" href="assets/pico.min.css">
<link rel="stylesheet" href="style.css">
<script src="app.js" defer></script></head>
<body><main class="container"><header><p class="kicker">PICO CSS / READING ROOM</p><h1>A calmer reading setup</h1><p>Adjust a local reading profile. Semantic HTML does most of the work.</p></header><div class="reading-layout"><article><header><h2>Reading preferences</h2></header><form id="preferences"><label for="reader">Profile name<input id="reader" name="reader" required minlength="2" placeholder="Weekend reader" aria-describedby="name-help"></label><small id="name-help">At least two characters. Saved only for this open preview.</small><label for="measure">Reading width<select id="measure"><option value="48">Narrow — 48 characters</option><option value="62" selected>Balanced — 62 characters</option><option value="72">Wide — 72 characters</option></select></label><label for="scale">Text size <output id="size-label">100%</output><input id="scale" type="range" min="90" max="125" step="5" value="100"></label><label><input id="night" type="checkbox" role="switch"> Dark appearance</label><div class="grid"><button type="submit">Review profile</button><button type="reset" class="secondary outline">Reset</button></div></form><footer id="saved" role="status">No profile applied yet.</footer></article><section class="reading-copy"><p class="kicker">A SHORT SAMPLE</p><h2>Make space for attention.</h2><div id="sample"><p>The margin is not leftover space. It gives each paragraph a clear beginning and lets the eye return to the next line without effort.</p><p>A reading interface can be quiet without becoming empty. Descriptive headings, useful contrast, and a predictable rhythm let the content remain in charge.</p></div><details><summary>What changes in this preview?</summary><p>Width changes the maximum line measure, text size scales only this sample, and the appearance switch changes Pico’s theme. These are local preferences, not browser accessibility settings.</p></details></section></div><small>Official Pico CSS 2.1.1. Native form, details, and dialog elements; original application behavior.</small></main><dialog id="review" aria-labelledby="review-title"><article><header><button id="close" aria-label="Close review" rel="prev"></button><h2 id="review-title">Review reading profile</h2></header><p id="review-text"></p><footer><button id="cancel" class="secondary">Keep editing</button><button id="apply">Apply locally</button></footer></article></dialog>
</body>
</html>
```

## Agent Prompt

Use the Pico 2.1.1 reading-profile example with its standard stylesheet, semantic article, native form and details disclosure. Keep text-size and line-measure changes scoped to the sample, and synchronize the appearance checkbox with data-theme. Validate the trimmed profile name, capture a review snapshot and open it with dialog.showModal; cancellation must not apply it. Apply only the captured local profile and reset after native form defaults are restored. Retain Pico’s responsive root scale rather than replacing it with the sample text-size setting.

## Sources

- [CSS variables](https://picocss.com/docs/css-variables) — Actual style and color definitions.
- [Typography](https://picocss.com/docs/typography) — Semantic headings and type.
- [Forms](https://picocss.com/docs/forms) — Native form composition.
- [Modal](https://picocss.com/docs/modal) — Dialog styling and application behavior boundary.
- [Grid](https://picocss.com/docs/grid) — Responsive layout helper.
- [Accordion](https://picocss.com/docs/accordion) — Details and summary disclosure.
