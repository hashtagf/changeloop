# Designsystemet Design System — OpenDesign Application Guide

Explore Designsystemet’s real theme roles, size modes and native field behavior through a complete task-brief editor with character feedback and preserved presentation state.

An OpenDesign-authored local editor using Designsystemet CSS and web behavior 1.23.0. The default theme and field observer are native; the brief content, 140-character rule and review workflow are original.

## Source Reference

- **Runtime:** Designsystemet web and CSS 1.23.0 ([source](https://designsystemet.no/en/fundamentals/code/setup))
- **Modes:** data-color-scheme and data-size ([source](https://designsystemet.no/en/fundamentals/code/setup))
- **Reference:** 35 real theme entries ([source](https://github.com/digdir/designsystemet))


## Design Reference

Default theme exports and native ds-field implementation in @digdir/designsystemet-css/web 1.23.0. Color rows explicitly record light-mode values.

### Default light accent roles

[Official reference](https://github.com/digdir/designsystemet)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ds-color-accent-background-default | #fff | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-background-tinted | #eef4fa | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-surface-tinted | #ddeaf6 | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-surface-hover | #c7ddf0 | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-border-subtle | #99c0e3 | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-border-default | #2a7cc5 | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-text-default | #002c54 | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-base-default | #0062ba | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-base-hover | #004f96 | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-base-active | #003d75 | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |
| --ds-color-accent-base-contrast-default | #fff | Actual default light-theme role in 1.23.0. The runtime dark scheme uses its separate role values. |

### Default light neutral roles

[Official reference](https://github.com/digdir/designsystemet)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ds-color-neutral-background-default | #fff | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-background-tinted | #f3f3f4 | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-surface-default | #fff | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-surface-tinted | #e8e8e9 | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-border-subtle | #bbbcbd | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-text-subtle | #5b5d60 | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-text-default | #292c30 | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-base-default | #24272b | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |
| --ds-color-neutral-base-contrast-default | #fff | Use neutral roles for supporting surfaces and text without assigning an unnecessary status meaning. |

### Size mode and type foundations

[Official reference](https://github.com/digdir/designsystemet)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ds-size-mode-font-size--sm | 1 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-size-mode-font-size--md | 1.125 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-size-mode-font-size--lg | 1.3125 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-size-base | 18 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-font-family | Inter | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-font-weight-regular | 400 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-font-weight-medium | 500 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-font-weight-semibold | 600 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-line-height-sm | 1.3 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-line-height-md | 1.5 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-line-height-lg | 1.7 | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-border-radius-base | 0.25rem | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-border-radius-sm | min(.5 * var(--ds-border-radius-base), var(--ds-border-radius-scale)) | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-border-radius-md | min(var(--ds-border-radius-base), 2 * var(--ds-border-radius-scale)) | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |
| --ds-border-radius-lg | min(2 * var(--ds-border-radius-base), 5 * var(--ds-border-radius-scale)) | Actual exported scalar or expression. Use data-size modes instead of interpreting every scalar as a pixel value. |

## Designsystemet Design System Behavior, CSS and Theme Packages

### Load the three parts in the right order

Designsystemet separates framework-independent behavior, component CSS and theme values. This example pins designsystemet-web and designsystemet-css at 1.23.0, imports the CSS and then the default theme, and registers the behavior once. A styled field without its behavior package is not the same implementation as the connected ds-field shown here.

### Use the current plain-HTML contract

The specimen uses ds-field around normal input, textarea and select elements with ds-input classes. This retains native form controls while the package connects labels and descriptions. It does not copy an older React-only field API. The full source includes the correct package imports and the original application’s review logic.

## Designsystemet Design System Color Scheme and Size Modes

### Change appearance through data attributes

The page sets data-color-scheme to light or dark on the root. The theme supplies the corresponding semantic colors, while the form values remain unchanged. The parameter table records the default light values explicitly; it does not pretend those same hex colors apply in dark mode. A secondary appearance button describes the action that will happen next.

### Let size mode affect the whole system

The reading-size control changes data-size among sm, md and lg. This changes the theme’s size mode rather than zooming only the title. The published mode factors are 1, 1.125 and 1.3125; they participate in the token formulas and are not a universal instruction to set a control to those pixel values. The example tests the large mode at phone width as well as desktop.

## Designsystemet Design System Inter and Semantic Typography

### Include the intended weights

The preview bundles Inter 400, 500 and 600 and enables the documented cv05 font feature for the lowercase l form. The page uses native heading and paragraph classes so font weight and line height follow the theme. A fixed 14px annotation is an authored supporting note, clearly outside the main interactive scale.

### Keep helper content adjacent to its control

The title hint explains the label’s purpose; the outcome hint describes the kind of content expected. They stay beside their controls and are connected by ds-field. Supporting guidance sits in a separate card that follows the form on narrow screens. The layout does not rely on hover to expose instructions.

## Designsystemet Design System Automatic Relationships and Character Feedback

### Let ds-field connect one control

Each ds-field contains one input-like control, its label and optional data-field descriptions. The package assigns IDs and builds the label/description relationships. Grouping unrelated controls inside one ds-field would make that automatic contract ambiguous. Use a fieldset for a group rather than assuming the wrapper is a generic form container.

- Keep one input-like control in each ds-field.
- Use data-field descriptions for related helper content.
- Let the native observer maintain IDs and described-by relationships.

### Understand what the counter measures

The native counter uses data-limit, data-under and data-over, with %d replaced by the remaining or excess count. In 1.23.0 it computes against JavaScript string length and exposes feedback through data-label/data-state, including an invalid state when over the limit. This is not a grapheme-count guarantee for every emoji. The 140-character limit is this example’s writing constraint, not an official Designsystemet content rule.

## Designsystemet Design System Application Validation and Review State

### Validate the authored task separately

The application requires a nonempty task title and outcome and rejects an outcome longer than the sample limit. It focuses the relevant field after showing an actionable message. The native counter explains length while the submit handler enforces the local review rule. No maxlength truncation silently discards pasted text.

### Preserve data when changing presentation

A successful review shows the current title and outcome as text. Editing either field clears the result; changing appearance or size preserves it because those controls do not change the brief. This distinction is intentional and verified. Nothing is sent to a project-management service, and the preview never claims an external task was created.

## Designsystemet Design System Complete Native-Field Implementation

### Reproduce the versioned specimen

Create a Vite vanilla project, install the two pinned Designsystemet packages and Inter, then save the complete entry and digdir.css. Keep the root mount element. The source includes registration, theme order, counter markup, presentation controls and all review-validation transitions. The local preview uses the same native field observer rather than a hand-drawn imitation.

1. Import behavior once, then component CSS and the default theme.
2. Load Inter 400, 500 and 600 and save the complete entry/CSS.
3. Exercise the over-limit counter and correct the outcome.
4. Review, switch size and appearance, then edit text to clear the result.

### Test over-limit and recovery behavior

Paste 150 ordinary characters into the outcome and verify that ten over the limit is reported. Review must reject it. Replace the text with a short outcome, review successfully, then change dark mode and reading size without losing the result. Edit the title and confirm the old review clears. Check visible focus and wrapping at each viewport width.

## Component Examples

### main.js — complete native field and theme study

Full editor, real counter markup, appearance/size controls and local review validation.

```javascript
import '@digdir/designsystemet-web';
import '@digdir/designsystemet-css';
import '@digdir/designsystemet-css/theme';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './digdir.css';
document.documentElement.dataset.colorScheme='light';document.documentElement.dataset.size='md';document.getElementById('root').innerHTML=`<main><header><div><p class="eyebrow">DESIGNSYSTEMET / NATIVE FIELD STUDY</p><h1 class="ds-heading" data-size="lg">Write a useful task brief</h1></div><button id="theme" class="ds-button" data-variant="secondary" aria-pressed="false">Dark appearance</button></header><p class="ds-paragraph lead">Describe one outcome clearly. The native field connects its label, hint and character feedback while the theme controls size and appearance.</p><div class="layout"><form id="brief-form" novalidate><ds-field class="ds-field"><label>Task title</label><input id="title" class="ds-input" type="text" value="Review the navigation"/><p data-field="description">Use a short label that identifies the work.</p></ds-field><ds-field class="ds-field"><label>Desired outcome</label><textarea id="outcome" class="ds-input" rows="4">Make the main sections easier to find without changing the accepted content.</textarea><p data-field="description">Describe the result, not a list of implementation instructions.</p><p data-field="counter" data-limit="140" data-over="%d characters over the sample limit" data-under="%d characters remaining"></p></ds-field><p id="error" class="ds-validation-message" hidden role="alert"></p><button class="ds-button" type="submit">Review brief</button></form><aside class="ds-card" data-color="neutral"><h2 class="ds-heading" data-size="sm">Reading size</h2><p class="ds-paragraph">The theme changes the complete size mode rather than scaling only a heading.</p><ds-field class="ds-field"><label for="size">Component size</label><select class="ds-input" id="size"><option value="sm">Small</option><option value="md" selected>Medium</option><option value="lg">Large</option></select></ds-field><h3 class="ds-heading" data-size="xs">A clear brief contains</h3><ul><li>One concrete outcome.</li><li>Constraints that must remain true.</li><li>A way to check the result.</li></ul><p class="small">Default theme and web behavior 1.23.0. Original local application; no task is created elsewhere.</p></aside></div><section id="review" class="ds-card" data-color="success" hidden tabindex="-1"><h2 class="ds-heading" data-size="sm">Local brief review</h2><h3 id="review-title" class="ds-heading" data-size="xs"></h3><p id="review-body" class="ds-paragraph"></p><p class="small">Editing a field clears this review. Appearance and reading size preserve it.</p></section></main>`;const $=id=>document.getElementById(id);function edit(){$('review').hidden=true;$('error').hidden=true}['title','outcome'].forEach(id=>$(id).addEventListener('input',edit));$('theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.colorScheme!=='dark';document.documentElement.dataset.colorScheme=dark?'dark':'light';$('theme').setAttribute('aria-pressed',String(dark));$('theme').textContent=dark?'Light appearance':'Dark appearance'});$('size').addEventListener('change',e=>document.documentElement.dataset.size=e.target.value);$('brief-form').addEventListener('submit',e=>{e.preventDefault();let message='',focus='outcome';if(!$('title').value.trim()){message='Enter a task title.';focus='title'}else if(!$('outcome').value.trim())message='Describe the desired outcome.';else if($('outcome').value.length>140)message='Shorten the outcome to 140 characters or fewer.';if(message){$('error').textContent=message;$('error').hidden=false;$(focus).focus();return}$('review-title').textContent=$('title').value.trim();$('review-body').textContent=$('outcome').value.trim();$('review').hidden=false;$('review').focus()});

```

[Code reference](https://designsystemet.no/en/fundamentals/code/setup)

- Select uses the current ds-input styling inside ds-field. Counter feedback is managed by the native observer.

### digdir.css — original responsive composition

Layout around the native theme, including the Inter feature setting.

```css
body{margin:0;font-family:Inter,sans-serif;font-feature-settings:"cv05" 1}main{max-width:1160px;margin:auto;padding:32px}header{display:flex;gap:24px;justify-content:space-between;align-items:start}.eyebrow{font-size:13px;letter-spacing:.04em;font-weight:600}.lead{max-width:65ch;margin-top:24px}.layout{display:grid;grid-template-columns:1.6fr 1fr;gap:40px;margin-top:32px}form{display:grid;gap:24px;align-content:start}form button{justify-self:start}aside{padding:24px;align-self:start}aside h3{margin-top:32px}aside select{margin-top:8px}aside li{margin:12px 0}.small{font-size:14px;line-height:1.6}#review{padding:24px;margin-top:32px}#review h3{margin-top:16px}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.layout{grid-template-columns:1fr;gap:24px}header{flex-direction:column}}

```

[Code reference](https://designsystemet.no/en/fundamentals/code/setup)

- Theme and size changes preserve values; only content edits invalidate review.

## Implementation Starting Point

Native label relationships, counter state, validation recovery and light/dark size changes were tested in a real browser.

```sh
npm create vite@latest ds-brief -- --template vanilla
cd ds-brief
npm install
npm install @digdir/designsystemet-css@1.23.0 @digdir/designsystemet-web@1.23.0 @fontsource/inter
# Replace src/main.js and add src/digdir.css. Keep <div id="root"></div>.
npm run dev
```

## Agent Prompt

Build the brief editor using Designsystemet 1.23.0 behavior/CSS/default theme in the correct order. Use ds-field with one native control, actual data-field counter attributes and Inter weights. Preserve review during appearance and size changes, clear it after content edits and enforce the original 140-character rule without truncating pasted input.

## Sources

- [Setup and theme order](https://designsystemet.no/en/fundamentals/code/setup) — Native behavior, CSS, theme and font configuration.
- [Theme foundations](https://designsystemet.no/en/fundamentals) — Size, color and typography entrypoints.
- [Public implementation](https://github.com/digdir/designsystemet) — Versioned ds-field observer and generated theme.
- [System scope](https://designsystemet.no/en/intro) — Shared component and guideline scope.
