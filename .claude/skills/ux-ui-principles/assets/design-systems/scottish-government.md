# Scottish Government Design System — OpenDesign Application Guide

Apply the Scottish Government’s responsive type, spacing and color roles through a native character-count field that preserves over-limit text and supports recovery.

Independent implementation reference. Scottish Government directorates must use Roboto; this unbranded specimen uses an explicit Arial fallback. Original text, no storage/submission or official affiliation. Code license and government graphic-asset permissions are separate.

## Source Reference

- **Package:** @scottish-government/design-system 4.3.0 ([source](https://www.npmjs.com/package/@scottish-government/design-system))
- **Default font:** Roboto; required for government directorates ([source](https://designsystem.gov.scot/styles/typography))
- **Body type:** 16/24px small,19/32px large ([source](https://designsystem.gov.scot/styles/typography))
- **Grid:** 2,6 or12 columns by viewport ([source](https://designsystem.gov.scot/styles/column-grid))
- **Counter limit:** Removes maxlength after enhancement ([source](https://designsystem.gov.scot/components/character-count))
- **Initialization:** DS.initAll or individual component init ([source](https://designsystem.gov.scot/get-started/javascript))


## Design Reference

Scottish Government Design System 4.3.0 published CSS and JavaScript, with current official typography, color and grid guidance. Native CharacterCount and styling run in the preview. Arial is an explicit independent-example fallback; Scottish Government directorates must use Roboto. Current package assets differ from older installation examples.

### Responsive type

[Official reference](https://designsystem.gov.scot/styles/typography)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Body | 16/24px small →19/32px large | Regular400; native large styles start at48rem. |
| H1 | 30/40px →44/56px | Bold700. |
| H2 / H3 | 22/32 →30/40px;19/24 →22/32px | Use semantic heading levels; ds_h3 can alter appearance without changing the level. |
| H4 / H5 | 16/24 →19/32px;14/24 →16/24px | Bold700. |
| Lead | 19/32px →24/40px | Light300; one concise lead per page. |
| Font | Roboto | Required for Scottish Government directorates/policy areas; independent demo uses Arial explicitly. |

### Sass color roles

[Official reference](https://designsystem.gov.scot/styles/colour)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $ds_colour__brand / __link | #0065bd | Primary blue; link hover #00437e. |
| $ds_colour__text | #1a1a1a | Secondary text #5e5e5e. |
| $ds_colour__focus / --background | #1a1a1a / #fdd522 | Retain these focus roles even in an adapted brand theme. |
| $ds_colour__state--negative | #d32205 | Over-limit field/error messages. |
| $ds_colour__state--positive | #1a7032 | Positive messaging; not a claim that local text was submitted. |
| $ds_colour__border | #b3b3b3 | Strong #1a1a1a and faint #ebebeb alternatives. |

### Responsive spacing utilities

[Official reference](https://cdn.jsdelivr.net/npm/@scottish-government/design-system@4.3.0/dist/css/design-system.min.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| ds_!_margin-bottom--1 / --2 / --3 | 8 /16 /24px | Unchanged across48rem. |
| ds_!_margin-bottom--4 | 24px →32px | Small → large at48rem. |
| ds_!_margin-bottom--5 / --6 | 32→40px /40→48px | Responsive rather than a single fixed spacing number. |
| ds_!_margin-bottom--7 / --8 / --9 | 40→56px /48→64px /56→72px | Use for larger separation; avoid applying the largest spacing everywhere. |

### Grid and usable inner widths

[Official reference](https://designsystem.gov.scot/styles/column-grid)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Viewport thresholds | 480,768,992,1200px | Columns grow2→6→12, then remain12. |
| Content width at medium/large/xl | 736 /928 /1120px | Published inner grid width; differs from wrapper box width. |
| Native ds_wrapper box | 768 /960 /1152px | Includes16px padding on each side in the release CSS. |
| Gutter / side padding | 32px /16px | Below768px the wrapper is fluid. |
| Reading width in specimen | 42rem maximum | Application choice inside the native wrapper, not an official universal token. |

### CharacterCount contract

[Official reference](https://cdn.jsdelivr.net/npm/@scottish-government/design-system@4.3.0/src/components/character-count/character-count.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Root | data-module="ds-character-count" | Contains a native input or textarea. |
| Limit | maxlength="200" | Consumed then removed by initialization; over-limit text remains editable. |
| Alternative | data-maxlength on root | No native maxlength fallback if JavaScript is unavailable. |
| Threshold | data-threshold="80" | Rounds limit×.8; for200 it appears at160 characters. |
| Error state | ds_input--error;aria-invalid="true" | Applied while count is negative; paired with a visible excess count. |
| Announcements | Separate hidden message;1000ms delay | aria-describedby preserves the existing hint and adds generated message IDs. |
| Counting unit | JavaScript value.length | UTF-16 code units; do not promise grapheme-aware emoji counting. |

## Scottish Government Design System A practical text-entry reference

### Keep a person’s work recoverable

The defining interaction here is non-destructive length guidance. A user can paste a long access note, see how much needs editing, and keep all of the text while reducing it. The native character counter handles the visible remaining count, over-limit style and delayed assistive-technology message. The application separately decides whether the note is valid enough to preview.

This is an original workshop-note example, not a Scottish Government service or a request for medical information. It has no identity graphics, storage or submission. The field hint asks for a practical access need and discourages private details so the task is understandable without borrowing an official transaction.

[Supporting specification](https://designsystem.gov.scot/components/character-count)

## Scottish Government Design System Roboto and responsive hierarchy

### Preserve the published metrics

The system requires Roboto for Scottish Government directorates and policy areas. Other adopting organizations can use a different legible font while preserving the size and line-height rules and testing the result. The standalone example states its Arial fallback explicitly; it does not claim that a missing web font is Roboto.

The body moves from 16/24px to 19/32px, and the main title from 30/40px to 44/56px. Both changes occur in the native larger-screen stylesheet. A ds_h 3 class changes visual size without requiring a third-level semantic heading. That distinction matters when a short form needs a smaller section title but no artificial gap in the document outline.

[Supporting specification](https://designsystem.gov.scot/styles/typography)

## Scottish Government Design System A distinct focus treatment

### Separate focus, error and completion

Blue provides the primary brand/link role, black provides text and yellow supports focus. These are named Sass settings, not a fabricated collection of CSS custom properties. Brand adaptation happens before loading the system through its settings module. The official guidance keeps the focus palette even when other brand colors change.

The character counter introduces the negative red only when the permitted length is exceeded. A second application-level empty-field error can use the same negative role, but its message must describe a missing answer rather than a character-count problem. The preview never uses positive green to imply a remote submission succeeded.

- Preserve a visible keyboard focus outline on the textarea and action buttons.
- Describe excess length in text, not only through a red border.
- Keep error summaries and field hints tied to a stable field ID.

[Supporting specification](https://designsystem.gov.scot/styles/colour)

## Scottish Government Design System Wrapper width and spacing

### Avoid confusing outer and inner widths

The official grid table describes inner content widths of 736,928 and 1120px at the medium, large and extra-large breakpoints. The corresponding native wrapper boxes are 768,960 and 1152px because each includes 16px side padding. This distinction prevents an adopter from nesting the two widths and accidentally narrowing the layout twice.

The preview places a 42rem reading column inside the native wrapper. That maximum is an application choice suitable for a short form, not a new system setting. Below 768px, the wrapper becomes fluid and the same 16px side spacing protects the textarea from the screen edge.

Spacing utilities are responsive. For example, ds_!_margin-bottom--4 grows from 24 to 32px at 48rem; larger levels also increase. The reference supplies both values so a desktop screenshot is not mistaken for a fixed universal gap.

[Supporting specification](https://designsystem.gov.scot/styles/column-grid)

## Scottish Government Design System A native character-count field

### Start with a real textarea

The ds_question root carries the data-module and optional percentage threshold. Its associated label and hint are ordinary accessible HTML. A textarea with maxlength supplies a useful no-JavaScript fallback. After enhancement, the component reads that value and removes the hard limit so a paste is not silently truncated.

For a 200-character field with an 80% threshold, the count is shown at 160 characters. The public component page’s sample prose and 250-character code example do not share the same numbers, so this specimen uses one consistent limit throughout. Without JavaScript, the visible hint still states the limit and native maxlength applies.

```html
<div class="ds_question" data-threshold="80" data-module="ds-character-count">
  <label class="ds_label" for="access-note">What would help you take part?</label>
  <p class="ds_hint-text" id="access-hint">Describe an access need for this practice workshop. Do not include medical or contact details.</p>
  <textarea maxlength="200" class="ds_input" rows="5" id="access-note"
    name="access-note" aria-describedby="access-hint"></textarea>
</div>
```

[Code reference](https://designsystem.gov.scot/components/character-count)

[Supporting specification](https://designsystem.gov.scot/components/character-count)

## Scottish Government Design System What the native component owns

### Messages, timing and counting

The versioned implementation creates a visible message with aria-hidden and a separate hidden message for assistive technology. It adds the relevant IDs to the existing aria-describedby rather than discarding the authored hint. It waits 1000ms before updating the hidden announcement, allowing typing feedback to finish first.

The actual length comes from JavaScript string.value.length: it counts UTF-16 code units. A symbol outside the basic multilingual plane can consume two units, and a combined emoji can consume more. A service needing a different character policy must align its counter and server validation rather than promise human-perceived character counting from this component.

The component listens for input events. If an application fills a sample or clears the field programmatically, it must dispatch input too. The demo’s sample and reset actions do this. A comment in the source mentions speech-recognition polling, but the inspected implementation does not install a polling interval; this guide therefore does not claim that behavior.

[Supporting specification](https://cdn.jsdelivr.net/npm/@scottish-government/design-system@4.3.0/src/components/character-count/character-count.ts)

## Scottish Government Design System Use the current release paths

### Module loading and scoped initialization

The current package is @scottish-government/design-system. Version 4.3.0 places its compiled stylesheet at dist/css/design-system.min.css, while an older installation paragraph still refers to dist/styles/main.css. This recipe follows the actual published asset. Its script has an ES-module export, so import it with type="module" instead of using an ordinary classic script tag.

Create a CharacterCount instance for this one field and call init. DS.initAll is also available for a page with several components, but this specimen initializes only the counter it needs. No extra analytics service is configured. Server validation remains separate from the library: a counter is a helpful editing control, not an enforcement boundary.

1. Install the pinned4.3.0 package and copy the compiled CSS and module to a local asset directory.
2. Place the full label, hint and textarea structure in the page before importing the module.
3. Initialize the counter once, then connect application preview/reset actions using normal input events.

[Supporting specification](https://designsystem.gov.scot/get-started/javascript)

## Scottish Government Design System Test over-limit recovery

### Do not test only an empty field

Start below the threshold, cross 160 characters, then paste more than 200. The full value must remain in the textarea while a “too many” message appears and aria-invalid becomes true. Reduce the value below the limit and confirm that both the error class and invalid state recover.

The application Preview action blocks empty or over-limit notes with a linked error. A valid note appears in a local preview using textContent, so typed markup is displayed as text rather than interpreted. Edit note returns to the same textarea with the value intact. Reset clears it through an input event so the native count also resets.

At 390px, inspect the title wrap, full-width textarea, button wrapping and error summary. At larger widths, the reading column should not become a wide paragraph. These checks verify this specimen; a real service still needs user research, font testing and assistive-technology review in its final context.

[Supporting specification](https://designsystem.gov.scot/components/error-summary)

## Component Examples

### A non-destructive character limit

A label, hint, textarea and80% threshold with progressive enhancement.

```html
<div class="ds_question" data-threshold="80" data-module="ds-character-count">
  <label class="ds_label" for="access-note">What would help you take part?</label>
  <p class="ds_hint-text" id="access-hint">Describe an access need for this practice workshop. Do not include medical or contact details.</p>
  <textarea maxlength="200" class="ds_input" rows="5" id="access-note"
    name="access-note" aria-describedby="access-hint"></textarea>
</div>
```

[Code reference](https://designsystem.gov.scot/components/character-count)

### Current4.3.0 compiled assets

Version-verified CSS path and ES-module initialization.

```bash / html
npm install --save-exact @scottish-government/design-system@4.3.0
mkdir -p public/vendor/scot
cp node_modules/@scottish-government/design-system/dist/css/design-system.min.css public/vendor/scot/
cp node_modules/@scottish-government/design-system/dist/scripts/design-system.js public/vendor/scot/

<link rel="stylesheet" href="/vendor/scot/design-system.min.css">
<script type="module">
  import DS from '/vendor/scot/design-system.js';
  const root = document.querySelector('[data-module="ds-character-count"]');
  new DS.components.CharacterCount(root).init();
  // Or DS.initAll() when the page uses multiple DS components.
</script>
```

[Code reference](https://designsystem.gov.scot/get-started/javascript)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Scottish design system character count specimen</title><link rel="stylesheet" href="vendor/scot-4.3.0/dist/css/design-system.min.css"><style>body,button,input,textarea{font-family:Arial,sans-serif!important}body{margin:0}main{padding-top:32px;padding-bottom:32px}.reading{max-width:42rem}.eyebrow{border-top:4px solid #0065bd;padding-top:16px;color:#5e5e5e}.actions{display:flex;flex-wrap:wrap;gap:16px}.actions .ds_button{margin:0}.preview-text{white-space:pre-wrap;overflow-wrap:anywhere;border-left:4px solid #b3b3b3;padding-left:24px}[hidden]{display:none!important}</style><main class="ds_wrapper"><div class="reading"><p class="ds_small eyebrow">Independent specimen · Workshop access note</p><section id="entry"><h1>Tell us what would help</h1><p>Practice a short access note for a community workshop. This page does not save or send your text.</p><div id="error" class="ds_error-summary" tabindex="-1" hidden><h2 class="ds_error-summary__title">There is a problem</h2><p><a href="#access-note" id="error-link"></a></p></div><form id="form" novalidate><div class="ds_question" data-threshold="80" data-module="ds-character-count">
  <label class="ds_label" for="access-note">What would help you take part?</label>
  <p class="ds_hint-text" id="access-hint">Describe an access need for this practice workshop. Do not include medical or contact details.</p>
  <textarea maxlength="200" class="ds_input" rows="5" id="access-note"
    name="access-note" aria-describedby="access-hint"></textarea>
</div><p class="ds_small">Use up to 200 characters. The count appears after 160.</p><div class="actions"><button class="ds_button" type="submit">Preview note</button><button class="ds_button ds_button--secondary" id="sample" type="button">Try a long example</button><button class="ds_button ds_button--secondary" id="reset" type="button">Reset</button></div></form></section><section id="preview" hidden><h1 tabindex="-1">Your note preview</h1><p id="result" class="preview-text"></p><p>No note has been sent. You can return to edit it.</p><button id="edit" class="ds_button ds_button--secondary">Edit note</button></section></div></main><script type="module">import DS from './vendor/scot-4.3.0/dist/scripts/design-system.js';const field=document.querySelector('[data-module="ds-character-count"]');new DS.components.CharacterCount(field).init();const input=document.querySelector('#access-note'),entry=document.querySelector('#entry'),preview=document.querySelector('#preview'),error=document.querySelector('#error');function setValue(value){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()}document.querySelector('#sample').onclick=()=>setValue('A clear route from the entrance to the workshop room would help me take part. Please describe where the quiet seating area is and whether instructions will be available in writing. I would also appreciate knowing where to find the nearest accessible entrance.');document.querySelector('#reset').onclick=()=>{setValue('');error.hidden=true};document.querySelector('#form').onsubmit=e=>{e.preventDefault();let message=!input.value.trim()?'Enter a short access note.':input.value.length>200?'Shorten your note to 200 characters or fewer.':'';if(message){document.querySelector('#error-link').textContent=message;error.hidden=false;error.focus();return}error.hidden=true;document.querySelector('#result').textContent=input.value;entry.hidden=true;preview.hidden=false;preview.querySelector('h1').focus()};document.querySelector('#edit').onclick=()=>{entry.hidden=false;preview.hidden=true;input.focus()};window.demoReady=true;</script></html>
```

[Code reference](https://designsystem.gov.scot/components/character-count)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

The local demo runs the real 4.3.0 CSS and CharacterCount module. Its font fallback is explicit; the install page’s older dist/styles path is not used. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/scottish-government.html. Do not open module-based examples through file://.

```bash / html
npm install --save-exact @scottish-government/design-system@4.3.0
mkdir -p public/vendor/scot
cp node_modules/@scottish-government/design-system/dist/css/design-system.min.css public/vendor/scot/
cp node_modules/@scottish-government/design-system/dist/scripts/design-system.js public/vendor/scot/

<link rel="stylesheet" href="/vendor/scot/design-system.min.css">
<script type="module">
  import DS from '/vendor/scot/design-system.js';
  const root = document.querySelector('[data-module="ds-character-count"]');
  new DS.components.CharacterCount(root).init();
  // Or DS.initAll() when the page uses multiple DS components.
</script>
```

## Agent Prompt

Use the real Scottish Government Design System4.3.0 CharacterCount component in an independent access-note form. Pin the verified dist/css/design-system.min.css and ES-module dist/scripts/design-system.js paths. Provide a200-character textarea with80% threshold, associated hint and scoped component initialization. Preserve pasted over-limit text, leave native count/ARIA updates to the library, and add separate local validation plus safe text-only preview/edit/reset. Programmatic sample/reset must emit input events. Use published responsive type and spacing, an explicit font decision and no official identity or fake submission.

## Sources

- [Type](https://designsystem.gov.scot/styles/typography) — Typography and font adoption rules.
- [Color](https://designsystem.gov.scot/styles/colour) — Sass palette roles and theme boundaries.
- [Grid](https://designsystem.gov.scot/styles/column-grid) — Inner grid widths, columns and gutters.
- [Count](https://designsystem.gov.scot/components/character-count) — Non-destructive limits and threshold behavior.
- [Js](https://designsystem.gov.scot/get-started/javascript) — Initialization APIs and enhancement.
- [Install](https://designsystem.gov.scot/get-started/installation) — Package installation; compare current published paths.
- [Focus](https://designsystem.gov.scot/styles/focus-states) — Visible keyboard focus guidance.
- [Question](https://designsystem.gov.scot/components/question) — Question grouping structure.
- [Error](https://designsystem.gov.scot/components/error-summary) — Recovery and error-summary guidance.
- [Download complete working example](/assets/demos/scottish-government-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
