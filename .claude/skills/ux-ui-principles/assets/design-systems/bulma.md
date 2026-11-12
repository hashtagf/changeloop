# Bulma Design System — OpenDesign Application Guide

Build an editorial desk with Bulma’s real field/control structure, responsive columns, semantic color modifiers, and CSS variables, with complete validation code.

Bulma 1.0.4 CSS reference. Local editorial rules and JavaScript are original example code; no draft is stored or published.

## Source Reference

- **Library scope:** CSS framework ([source](https://bulma.io/))
- **Platform or architecture:** Built around Flexbox layouts ([source](https://bulma.io/documentation/start/overview/))
- **Integration:** Does not provide application JavaScript ([source](https://bulma.io/documentation/start/overview/))
- **Component support:** Includes responsive layout classes ([source](https://bulma.io/documentation/start/overview/))
- **Customization or behavior:** Includes form and component styles ([source](https://bulma.io/documentation/start/overview/))
- **Additional capability:** Sass customization is documented ([source](https://bulma.io/documentation/start/overview/))


## Design Reference

Bulma 1.0.4 compiled CSS and official responsive/helper documentation. HSL components are package defaults, not a replacement brand palette. rem conversions assume a 16px root.

### Type and control foundations

[Official reference](https://bulma.io/documentation/features/css-variables/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bulma-family-primary | Inter, SF Pro, Segoe UI, Roboto, Oxygen, Ubuntu, Helvetica Neue, Helvetica, Arial, sans-serif | Font preference stack; package does not download these font files. |
| --bulma-size-normal | 1rem | Default control/body size. |
| --bulma-size-small | 0.75rem | Compact auxiliary control size. |
| --bulma-size-medium | 1.25rem | Medium modifier size. |
| --bulma-size-large | 1.5rem | Large modifier size. |
| --bulma-weight-semibold | 600 | Labels and stronger UI text. |
| --bulma-block-spacing | 1.5rem | Rhythm between block elements. |
| --bulma-radius | 0.375rem | Default 6px radius at 16px root. |
| --bulma-radius-small | 0.25rem | Small 4px radius. |
| --bulma-radius-large | 0.75rem | Large 12px radius. |
| --bulma-control-height | 2.5em | 2.5em means 40px at a 16px control size. |
| --bulma-control-border-width | 1px | Shared control border thickness. |
| --bulma-control-line-height | 1.5 | Shared control text line height. |

### Color construction

[Official reference](https://bulma.io/documentation/features/color-palettes/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bulma-primary-h / -s / -l | 171deg / 100% / 41% | Primary base HSL components. |
| --bulma-link-h / -s / -l | 233deg / 100% / 63% | Action and link role used by is-link. |
| --bulma-scheme-h / -s | 221 / 14% | Neutral scheme hue and saturation. |
| --bulma-scheme-main-l | 100% in light mode | Main light surface luminance. |
| --bulma-text-l | 29% in light mode | Normal scheme text luminance. |
| --bulma-text-title-l | 14% in light mode | Stronger title text luminance. |

### Spacing helpers

[Official reference](https://bulma.io/documentation/helpers/spacing-helpers/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| mb-0 | 0 | Bottom margin utility; other directions use the same suffix scale. |
| mb-1 | 0.25rem | Bottom margin utility; other directions use the same suffix scale. |
| mb-2 | 0.5rem | Bottom margin utility; other directions use the same suffix scale. |
| mb-3 | 0.75rem | Bottom margin utility; other directions use the same suffix scale. |
| mb-4 | 1rem | Bottom margin utility; other directions use the same suffix scale. |
| mb-5 | 1.5rem | Bottom margin utility; other directions use the same suffix scale. |
| mb-6 | 3rem | Bottom margin utility; other directions use the same suffix scale. |

### Responsive boundaries

[Official reference](https://bulma.io/documentation/start/responsiveness/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| mobile | ≤768px | Columns and level stack unless is-mobile is added. |
| tablet | ≥769px | Default columns become horizontal. |
| desktop | ≥1024px | Desktop-specific modifiers begin. |
| widescreen | ≥1216px | Wider container/layout range. |
| fullhd | ≥1408px | Largest default range. |

## Bulma Design System A CSS Framework With Explicit Behavior

### Use Bulma classes on semantic HTML

Bulma supplies a visual vocabulary of elements, components, layout helpers and modifiers. It is not a form state manager or a JavaScript widget runtime. The editorial desk loads the official 1.0.4 stylesheet and adds a small, fully shown script for validation, live text preview and theme switching. There is no React dependency or framework provider.

A field groups a label, a control wrapper and help text. The input class goes on the actual input, while select is a wrapper around the native select element. These distinctions matter because the wrapper handles decoration and spacing. Copying only a screenshot’s appearance onto generic divs would lose the native editing and keyboard behavior.

[Supporting specification](https://bulma.io/documentation/start/overview/)

## Bulma Design System HSL Roles and Light/Dark Themes

### Use modifiers rather than hardcoded patches

Bulma 1 stores color families as HSL components and derives related values. The link role drives the review button, section label and supporting accents. Warning and success tags communicate Draft and Ready for review, but the text label always remains present. The message uses is-info because it explains process boundaries rather than reporting an error.

The demo begins with data-theme=light on html. Its appearance button switches that attribute between light and dark. All cards, fields, help text and messages inherit the correct theme together. Setting a white background directly on the box would undermine that switch. For branded overrides, change the documented role variables and verify their derived states instead of changing only the final button background.

[Supporting specification](https://bulma.io/documentation/features/dark-mode/)

## Bulma Design System Font Preferences and a Usable Type Scale

### The package specifies preferences, not font delivery

The default font stack begins with Inter and includes several system fallbacks. Loading Bulma does not download Inter. This offline specimen uses whichever listed font is installed, so a production build that needs a specific face must provide the font asset and its loading policy separately. The title and subtitle classes establish visual hierarchy without changing the HTML heading level.

The desk uses title is-2 for the page, title is-4 for the form, and title is-3 for the article headline. A narrow-screen override reduces the page title to 2rem; this is explicitly a local refinement. Controls retain the normal 1rem size. Help text stays adjacent to its field so a user does not have to cross-reference instructions from a separate sidebar.

[Supporting specification](https://bulma.io/documentation/helpers/typography-helpers/)

## Bulma Design System Spacing Helpers and Responsive Columns

### A seven/five split that naturally stacks

The parent columns uses is-variable is-6; its children are column is-7 and column is-5. Those fractions reserve more width for the form than for the article preview. The default mobile-first behavior stacks columns at mobile widths, so this composition does not add is-mobile, which would preserve a cramped horizontal layout.

Spacing helper suffixes are not a linear pixel scale. In particular, suffix five is 1.5rem and six is 3rem. The card/message separation uses mt-5, while small labels use mb-3. The outer section is an application override of 2rem vertically and 1.5rem horizontally; the complete extra CSS is supplied in setup.

[Supporting specification](https://bulma.io/documentation/start/responsiveness/)

## Bulma Design System Field Anatomy and Validation

### Color is only one part of an error

Headline and summary are explicitly associated with labels and help text. A rejected submit adds is-danger to the input and help, sets aria-invalid=true, and focuses the first invalid control. The headline minimum is five trimmed characters; the summary minimum is twenty. These are example editorial requirements, not Bulma constraints.

The copy-check checkbox must also be selected. Its explanatory error is linked with aria-describedby. Bulma can draw these states but it cannot decide whether the copy is ready. The script owns that decision and prevents native form navigation. No server result is invented.

1. Clear the headline and submit to see the focused invalid input.
2. Restore a headline and a summary of at least twenty characters.
3. Select the copy check, submit, then edit again to return the brief to Draft.

[Supporting specification](https://bulma.io/documentation/form/general/)

## Bulma Design System Card, Message, and State Tags

### Give each container one job

The article card separates card-header and card-content. Header text identifies the issue, while a tag holds the editorial state. Content contains the live section, heading and summary, followed by metadata. The preview is intentionally text-first: the writer can judge hierarchy and length without a placeholder image overwhelming the brief.

The message component uses message-header and message-body to explain that review readiness is local. It stays visible regardless of validation. A transient success notification would be a poor substitute for this persistent boundary because dismissing it could leave the user believing the article was published.

- Card: the current article composition.
- Tag: the explicit draft or review state.
- Message: a persistent explanation of what the action does.

[Supporting specification](https://bulma.io/documentation/components/message/)

## Bulma Design System Application State Without a Widget Runtime

### Prevent stale success and unsafe preview insertion

Every input event updates the preview and resets the state to Draft. This avoids retaining a Ready tag after the writer changes the text that was reviewed. The display is updated with textContent, so typed HTML is shown as text rather than interpreted as markup. These are application responsibilities; Bulma’s stylesheet cannot provide them.

Restore draft calls form.reset, removes validation classes and aria-invalid, clears checkbox help and rebuilds the preview. It returns the original example content without reloading the document. The status paragraph uses role=status for changes after submission, while normal live typing does not repeatedly move focus.

[Supporting specification](https://bulma.io/documentation/start/overview/)

## Bulma Design System Install the CSS and Keep Behavior Visible

### No provider and no bundled Bulma JavaScript

Install bulma@1.0.4 and copy its compiled CSS to a local asset, or import that CSS in an existing bundler. The plain HTML setup shown here needs no build step after the asset is copied. Put the complete desk markup in body and load app.js with defer. Do not load an unrelated JavaScript package in the expectation that it will activate Bulma’s components.

If you later add a modal or dropdown, provide the corresponding keyboard, focus and dismissal behavior deliberately. A class such as is-active changes appearance; it is not a focus trap. For this specimen, native inputs and buttons keep the behavioral surface small and reviewable.

[Supporting specification](https://bulma.io/documentation/start/overview/)

## Bulma Design System Customize at the Appropriate Scope

### Inspect component variables before overriding them

Global --bulma variables establish the theme, but components also define variables on their own selectors. A more specific component assignment can override a root-level value. Inspect the class in the compiled CSS when a root override seems ineffective, then place the override on the appropriate component rather than piling on unrelated declarations.

For a long-lived product, keep package defaults, brand overrides and screen-specific layout rules distinct. The example’s small container and mobile-title adjustments are screen rules. The reference tables report actual Bulma values separately, making it clear which settings are available to reuse and which belong only to this editorial desk.

[Supporting specification](https://bulma.io/documentation/features/css-variables/)

## Component Examples

### Complete editorial desk markup

Bulma field/control/label/help anatomy, 7/5 columns, Card, Message and state tags.

```html
<section class="section"><div class="container"><div class="level"><div class="level-left"><div><p class="is-size-7 has-text-weight-bold has-text-link mb-3">BULMA / LOCAL EDITORIAL DESK</p><h1 class="title is-2">Shape the next issue.</h1><p class="subtitle is-5">An article brief, a preview, and an explicit editorial state.</p></div></div><div class="level-right"><button class="button is-light" id="theme">Dark appearance</button></div></div><div class="columns is-variable is-6"><div class="column is-7"><form id="brief" class="box" novalidate><h2 class="title is-4">Article brief</h2><div class="field"><label class="label" for="headline">Headline</label><div class="control"><input class="input" id="headline" value="A quieter way to work" maxlength="90" aria-describedby="headline-help"></div><p class="help" id="headline-help">Use 5–90 characters. This field updates the preview as you type.</p></div><div class="field"><label class="label" for="section">Section</label><div class="control"><div class="select is-fullwidth"><select id="section"><option>Design notes</option><option>Field research</option><option>Product craft</option></select></div></div></div><div class="field"><label class="label" for="summary">Summary</label><div class="control"><textarea class="textarea" id="summary" rows="3" aria-describedby="summary-help">How small choices in layout and language can make a demanding interface feel manageable.</textarea></div><p class="help" id="summary-help">Use at least 20 characters to give the reviewer enough context.</p></div><div class="field"><label class="checkbox"><input id="checked" type="checkbox" aria-describedby="checked-help" aria-describedby="checked-help"> I have checked the headline and summary</label><p class="help" id="checked-help"></p></div><div class="field is-grouped is-grouped-multiline"><div class="control"><button type="submit" class="button is-link">Mark ready for review</button></div><div class="control"><button id="reset" type="button" class="button is-light">Restore draft</button></div></div><p id="result" class="help" role="status">Draft changes stay in this page only.</p></form></div><div class="column is-5"><article class="card"><header class="card-header"><p class="card-header-title">Issue 08 / Article preview</p><span id="state" class="tag is-warning is-light mr-4 my-4">Draft</span></header><div class="card-content"><p class="is-size-7 has-text-link has-text-weight-bold mb-3" id="preview-section">Design notes</p><h2 class="title is-3" id="preview-title">A quieter way to work</h2><div class="content" id="preview-summary">How small choices in layout and language can make a demanding interface feel manageable.</div><hr><p class="is-size-7">Copy desk · Reading time assigned after editing</p></div></article><article class="message is-info mt-5"><div class="message-header"><p>Review is a separate step</p></div><div class="message-body">Ready for review is a local label. It does not publish this article, send a notification, or save a draft on a server.</div></article></div></div><p class="is-size-7">Official Bulma 1.0.4 CSS. Form validation and preview updates are original JavaScript.</p></div></section>

```

[Code reference](https://bulma.io/documentation/form/general/)

- The CSS library does not validate or submit the form.
- aria-describedby connects inputs to help text.
- The preview uses textContent to display user-entered text.

### Validation and local preview behavior

Original event handlers supply the behavior Bulma intentionally leaves to the application.

```javascript
const $=id=>document.getElementById(id);
const fields=['headline','summary'];
function draft(){ $('state').textContent='Draft';$('state').className='tag is-warning is-light mr-4 my-4';$('result').textContent='Draft changes stay in this page only.';}
function preview(){ $('preview-title').textContent=$('headline').value.trim()||'Untitled article';$('preview-summary').textContent=$('summary').value.trim()||'No summary yet.';$('preview-section').textContent=$('section').value;draft();}
for(const id of ['headline','summary','section','checked'])$(id).addEventListener('input',preview);
$('brief').addEventListener('submit',event=>{event.preventDefault();let first=null;for(const id of fields){const invalid=$(id).value.trim().length<(id==='headline'?5:20);$(id).classList.toggle('is-danger',invalid);$(id).setAttribute('aria-invalid',String(invalid));$(id+'-help').classList.toggle('is-danger',invalid);if(invalid&&!first)first=$(id);}$('checked-help').textContent=$('checked').checked?'':'Confirm the copy check before review.';$('checked-help').className='help is-danger';if(!$('checked').checked&&!first)first=$('checked');if(first){$('result').textContent='Check the highlighted brief fields.';first.focus();return;}$('state').textContent='Ready for review';$('state').className='tag is-success is-light mr-4 my-4';$('result').textContent='Marked ready in this local preview. Nothing was published.';});
$('reset').addEventListener('click',()=>{$('brief').reset();for(const id of fields){$(id).classList.remove('is-danger');$(id).removeAttribute('aria-invalid');$(id+'-help').classList.remove('is-danger');}$('checked-help').textContent='';preview();});
$('theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('theme').textContent=dark?'Light appearance':'Dark appearance';});

```

[Code reference](https://bulma.io/documentation/start/overview/)

- Invalid submission focuses the first missing field.
- Editing a ready brief returns it to Draft.
- The data-theme attribute controls appearance.

## Implementation Starting Point

Save the complete markup and JavaScript examples as indicated. Bulma provides the CSS; the supplied application script implements all validation and local state. The offline preview inlines both files. The HTML wrapper includes the full body markup; save the supplied interaction and CSS examples under the filenames referenced here.

```html
<!-- Install and copy the local asset:
npm install bulma@1.0.4
mkdir -p assets
cp node_modules/bulma/css/bulma.min.css assets/bulma.min.css
-->
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Editorial desk</title>
<link rel="stylesheet" href="assets/bulma.min.css">
<style>.section{padding:2rem 1.5rem}.container{max-width:1080px!important}.card-header{align-items:center;flex-wrap:wrap}.title{overflow-wrap:anywhere}.level-left{min-width:0}@media(max-width:768px){.title.is-2{font-size:2rem}.level-right{margin-top:1rem}}</style>
<script src="app.js" defer></script>
</head>
<body><section class="section"><div class="container"><div class="level"><div class="level-left"><div><p class="is-size-7 has-text-weight-bold has-text-link mb-3">BULMA / LOCAL EDITORIAL DESK</p><h1 class="title is-2">Shape the next issue.</h1><p class="subtitle is-5">An article brief, a preview, and an explicit editorial state.</p></div></div><div class="level-right"><button class="button is-light" id="theme">Dark appearance</button></div></div><div class="columns is-variable is-6"><div class="column is-7"><form id="brief" class="box" novalidate><h2 class="title is-4">Article brief</h2><div class="field"><label class="label" for="headline">Headline</label><div class="control"><input class="input" id="headline" value="A quieter way to work" maxlength="90" aria-describedby="headline-help"></div><p class="help" id="headline-help">Use 5–90 characters. This field updates the preview as you type.</p></div><div class="field"><label class="label" for="section">Section</label><div class="control"><div class="select is-fullwidth"><select id="section"><option>Design notes</option><option>Field research</option><option>Product craft</option></select></div></div></div><div class="field"><label class="label" for="summary">Summary</label><div class="control"><textarea class="textarea" id="summary" rows="3" aria-describedby="summary-help">How small choices in layout and language can make a demanding interface feel manageable.</textarea></div><p class="help" id="summary-help">Use at least 20 characters to give the reviewer enough context.</p></div><div class="field"><label class="checkbox"><input id="checked" type="checkbox" aria-describedby="checked-help" aria-describedby="checked-help"> I have checked the headline and summary</label><p class="help" id="checked-help"></p></div><div class="field is-grouped is-grouped-multiline"><div class="control"><button type="submit" class="button is-link">Mark ready for review</button></div><div class="control"><button id="reset" type="button" class="button is-light">Restore draft</button></div></div><p id="result" class="help" role="status">Draft changes stay in this page only.</p></form></div><div class="column is-5"><article class="card"><header class="card-header"><p class="card-header-title">Issue 08 / Article preview</p><span id="state" class="tag is-warning is-light mr-4 my-4">Draft</span></header><div class="card-content"><p class="is-size-7 has-text-link has-text-weight-bold mb-3" id="preview-section">Design notes</p><h2 class="title is-3" id="preview-title">A quieter way to work</h2><div class="content" id="preview-summary">How small choices in layout and language can make a demanding interface feel manageable.</div><hr><p class="is-size-7">Copy desk · Reading time assigned after editing</p></div></article><article class="message is-info mt-5"><div class="message-header"><p>Review is a separate step</p></div><div class="message-body">Ready for review is a local label. It does not publish this article, send a notification, or save a draft on a server.</div></article></div></div><p class="is-size-7">Official Bulma 1.0.4 CSS. Form validation and preview updates are original JavaScript.</p></div></section>
</body>
</html>
```

## Agent Prompt

Start with the complete Bulma 1.0.4 editorial desk. Keep field/control/help anatomy, responsive columns, card and message components, and the document-level light/dark theme. Headline and summary edits must update the article preview through textContent and return its state to Draft. Require the trimmed text limits and copy-check confirmation before marking Ready for review; connect invalid fields to their help and focus the first error. Restore the original draft and clear its validation state without implying publication.

## Sources

- [Overview](https://bulma.io/documentation/start/overview/) — CSS-only setup and document requirements.
- [CSS variables](https://bulma.io/documentation/features/css-variables/) — Global and component scope.
- [Form controls](https://bulma.io/documentation/form/general/) — Field and control composition.
- [Responsiveness](https://bulma.io/documentation/start/responsiveness/) — Official viewport boundaries.
- [Spacing helpers](https://bulma.io/documentation/helpers/spacing-helpers/) — Utility suffix values.
- [Dark mode](https://bulma.io/documentation/features/dark-mode/) — Theme selection.
- [Message](https://bulma.io/documentation/components/message/) — Message container anatomy.
