# UIkit Design System — OpenDesign Application Guide

UIkit combines a CSS framework, Less customization and attribute-driven JavaScript components. Its Switcher, Accordion and responsive grid work together in the workshop planner below, illustrating where native component behavior ends and application selection state begins.

UIkit 3.25.25 native component reference. Less values are compile-time definitions; local title/padding/focus overrides are original. No event booking is performed.

## Source Reference

- **Library scope:** Frontend interface framework ([source](https://getuikit.com/))
- **Platform or architecture:** Documentation covers Less and Sass ([source](https://getuikit.com/docs/sass))
- **Integration:** Includes JavaScript components ([source](https://getuikit.com/docs/introduction))
- **Component support:** Includes grid and container patterns ([source](https://getuikit.com/docs/introduction))
- **Customization or behavior:** Includes slideshow and lightbox components ([source](https://getuikit.com/docs/introduction))
- **Additional capability:** Includes accessibility guidance ([source](https://getuikit.com/docs/introduction))


## Design Reference

UIkit 3.25.25 Less source and compiled default CSS. @ names are compile-time Less variables, not runtime CSS custom properties. The preview adds explicitly stated screen-specific overrides.

### Typography

[Official reference](https://getuikit.com/docs/less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @global-font-family | -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | Default system font stack. |
| @global-font-size | 16px | Base text size. |
| @global-line-height | 1.5 | Body rhythm. |
| @global-large-font-size | 1.5rem | Large text helper. |
| @global-medium-font-size | 1.25rem | Medium text helper. |
| @global-small-font-size | 0.875rem | Small text helper. |

### Color roles

[Official reference](https://getuikit.com/docs/less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @global-color | #666 | Default text. |
| @global-emphasis-color | #333 | Stronger text and headings. |
| @global-muted-color | #999 | Default muted text; preview overrides metadata to #65717a. |
| @global-link-color | #1e87f0 | Default links. |
| @global-background | #fff | Default page/surface background. |
| @global-muted-background | #f8f8f8 | Muted tile/surface. |
| @global-primary-background | #1e87f0 | Primary accent surface. |
| @global-secondary-background | #222 | Secondary dark surface. |
| @global-border | #e5e5e5 | Neutral borders. |

### Spacing and controls

[Official reference](https://getuikit.com/docs/less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @global-margin | 20px | Default margin rhythm. |
| @global-small-margin | 10px | Small margin. |
| @global-medium-margin | 40px | Medium margin. |
| @global-large-margin | 70px | Large margin. |
| @global-gutter | 30px | Default grid gutter. |
| @global-small-gutter | 15px | Small grid gutter. |
| @global-medium-gutter | 40px | Medium grid gutter. |
| @global-control-height | 40px | Normal input/button height. |
| @global-control-small-height | 30px | Small control height. |
| @global-control-large-height | 55px | Large control height. |

### Responsive ranges

[Official reference](https://getuikit.com/docs/less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @breakpoint-small | 640px | @s width rules begin. |
| @breakpoint-medium | 960px | @m width rules begin; planner two-column layout. |
| @breakpoint-large | 1200px | @l width rules begin. |
| @breakpoint-xlarge | 1600px | @xl width rules begin. |

### Original workshop refinements

[Official reference](https://getuikit.com/docs/utility)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Heading | 42px; 34px below 640px | Explicit local override of uk-heading-small. |
| Card padding | 28px; 20px below 640px | Explicit local compact composition. |
| Metadata color | #65717a | Darker local metadata text on pale surfaces. |
| Focus outline | 3px solid #145ca5, offset 4px | Added keyboard emphasis for tabs, accordion titles and buttons. |

## UIkit Design System CSS Classes and Attribute-Driven Behavior

### CSS Classes and Attribute-Driven Behavior

UIkit combines a CSS framework with a JavaScript component layer. A uk-card class styles a surface; a uk-switcher attribute initializes an interactive component. The distinction is visible in the workshop example: cards and form controls can render with CSS alone, but session switching and accordion expansion depend on the UIkit JavaScript bundle.

The preview loads the actual 3.25.25 compiled stylesheet and runtime locally. Its three sessions have different lengths and layouts, so switching demonstrates real content behavior rather than changing a label in an otherwise identical card. The local attendee-plan script is separate from UIkit’s runtime and is included in full.

[Supporting specification](https://getuikit.com/docs/javascript)

## UIkit Design System Less Variables and Runtime Styling

### Less Variables and Runtime Styling

The reference names beginning with @ are Less variables. They are resolved during compilation; placing @global-primary-background in an ordinary browser stylesheet will not change a runtime theme. The table reports verified values from the installed source, while the preview uses the package’s precompiled default CSS.

To build a branded UIkit theme, use the documented Less import/customization pipeline and recompile. For isolated page refinements, ordinary CSS can target a class after the official stylesheet. This example takes that second route for title size, card padding and metadata color. It does not claim those overrides are new official UIkit tokens.

[Supporting specification](https://getuikit.com/docs/less)

## UIkit Design System Text, Color, and Surface Hierarchy

### Text, Color, and Surface Hierarchy

The default global font is a system stack at sixteen pixels with a 1.5 line height. The default primary background is #1e87f0, secondary is a dark neutral, and muted surfaces are #f8f8f8. These roles make a primary choose action distinct from a quieter explanatory tile. The provided specification table includes both text and surface values rather than a decorative four-color palette.

The workshop uses a large but bounded heading, a small program label, and a title inside each session card. Metadata is locally darkened to #65717a. The preparation tile has an original pale-blue surface and ordinary dark text. There is no automatic inverse assumption: a dark background needs the appropriate UIkit inverse treatment or explicit matching text styles.

[Supporting specification](https://getuikit.com/docs/card)

## UIkit Design System Connect Session Navigation to Content

### Connect Session Navigation to Content

The navigation list carries uk-switcher with connect: #sessions and a fade animation. The content list has the uk-switcher class and the matching ID. The list order is the mapping: the first toggle controls the first content item, so adding or reordering a session requires updating both sides together. The explicit connect selector avoids relying on immediate-sibling placement.

The navigation uses uk-tab for visual treatment. UIkit handles active item state and the associated accessibility behavior. The original plan state is deliberately independent: viewing a different session does not silently choose it. Only Choose session changes the selected label and moves attention to the attendee field.

1. Open Prototyping and inspect its distinct content.
2. Choose that session and check the selected label below.
3. Switch to Systems clinic without choosing it; the local plan still names Prototyping.

[Supporting specification](https://getuikit.com/docs/switcher)

## UIkit Design System Responsive Widths and Gutter Ownership

### Responsive Widths and Gutter Ownership

The session content uses uk-width-2-3@m and uk-width-1-3@m inside uk-grid. At the medium breakpoint, 960px, the content and preparation tile split horizontally. Below it, they stack. The plan and preparation sections use matching half-width rules at the same breakpoint, preserving a logical source order on smaller screens.

UIkit’s grid uses gutter logic associated with its grid classes. The example uses uk-grid-medium for substantial sections and uk-grid-small in the header. Do not add arbitrary margins to grid children and then assume their fractional widths still sum correctly. The outer container and padding provide the edge spacing; local mobile refinements reduce card padding and heading size.

[Supporting specification](https://getuikit.com/docs/grid)

## UIkit Design System Preparation Details With Native Component State

### Preparation Details With Native Component State

The uk-accordion-default class supplies the default styled treatment. The uk-accordion attribute sets multiple: true, so opening one preparation answer does not close the other. Each item contains a uk-accordion-title and uk-accordion-content. The runtime controls expanded state and content visibility; the CSS classes alone do not provide that behavior.

The two questions answer different practical concerns: what to bring and whether the local planner reserves a seat. Keeping the second answer explicit prevents the interface from implying an external event transaction. Accordion content is not the only place this boundary appears; the applied status also says no seat was reserved.

- multiple: true allows both answers to stay open.
- Title and content must remain in the same accordion item.
- The keyboard focus outline remains visible on each title.

[Supporting specification](https://getuikit.com/docs/accordion)

## UIkit Design System Separate Library Appearance From Application Validation

### Separate Library Appearance From Application Validation

The attendee field uses uk-input inside uk-form-controls, with a real label and explanatory text. The browser’s required validation stops an empty submission. The application adds a whitespace check and applies uk-form-danger plus aria-invalid on invalid events, keeping visual and semantic state aligned. Editing clears the stale error.

Choosing a session updates the local selection and focuses the name input. Submitting writes a status message with the attendee and selected session. Text is inserted with textContent, so typed markup is not executed. This is a local planner with no backend; UIkit does not invent registration, save or notification semantics for the form.

[Supporting specification](https://getuikit.com/docs/form)

## UIkit Design System Load CSS, Runtime, Then Application Code

### Load CSS, Runtime, Then Application Code

Install uikit@3.25.25 and copy the compiled CSS and JavaScript from dist into local assets. Load the CSS before the small layout override and load uikit.min.js before app.js. The two scripts can both use defer so their source order is preserved after parsing. The body example supplies all component attributes and content.

The icon bundle is optional here because the page does not use uk-icon. If adding icons later, load the matching icon runtime and give icon-only controls meaningful labels. Avoid mixing a newer JavaScript bundle with an older stylesheet merely because the filenames match: component structure and styles should come from the same pinned package.

[Supporting specification](https://getuikit.com/docs/installation)

## UIkit Design System Keep Switcher Connections Stable as Content Grows

### Keep Switcher Connections Stable as Content Grows

The switcher maps navigation items to content items by order. Adding a session requires adding both sides in the same position, while connect: #sessions establishes the explicit target. For multiple independent switchers on one page, give each target a unique ID and preserve that relationship in its initialization attribute.

The selected workshop remains separate from the active pane. Browsing another session should not silently overwrite a choice already made in the planner. When adding longer panes, check the shared responsive grid and accordion content in the newly active pane; sizing only the initial panel can conceal layout problems until the user switches.

[Supporting specification](https://getuikit.com/docs/switcher)

## Component Examples

### Workshop page with native UIkit attributes

Switcher connects to #sessions; Accordion allows multiple sections; grid widths activate at @m.

```html
<main class="uk-container uk-container-small uk-padding"><div class="uk-grid-small uk-flex-middle" uk-grid><div class="uk-width-1-1 uk-width-expand@s"><p class="uk-text-meta uk-text-uppercase">UIkit / Workshop program</p><h1 class="uk-heading-small">One afternoon.<br>Three ways to learn.</h1></div><div><span class="uk-label">Local planner</span></div></div><ul class="uk-tab uk-margin-medium-top" uk-switcher="connect: #sessions; animation: uk-animation-fade"><li><a href="#">Design critique</a></li><li><a href="#">Prototyping</a></li><li><a href="#">Systems clinic</a></li></ul><ul class="uk-switcher" id="sessions"><li><div class="uk-card uk-card-default uk-card-body"><div class="uk-grid-medium" uk-grid><div class="uk-width-2-3@m"><p class="uk-text-meta">13:00–14:00 / STUDIO A</p><h2 class="uk-card-title">A useful critique starts with context.</h2><p>Bring one interface and a question you cannot resolve alone. Practice separating observation, interpretation, and a proposed change.</p><ul class="uk-list uk-list-bullet"><li>Frame the user’s task before discussing style.</li><li>Compare two alternatives against the same goal.</li><li>Leave with one specific next experiment.</li></ul></div><div class="uk-width-1-3@m"><div class="uk-tile uk-tile-muted uk-padding-small"><strong>Bring with you</strong><p>A screenshot, a short task description, and one unresolved decision.</p><button class="uk-button uk-button-primary uk-width-1-1 choose" data-session="Design critique">Choose session</button></div></div></div></div></li><li><div class="uk-card uk-card-default uk-card-body"><p class="uk-text-meta">14:15–15:15 / STUDIO B</p><h2 class="uk-card-title">Prototype the difficult transition.</h2><p>Build a small interaction that covers an empty state, an interrupted action, and recovery. The target is a useful decision, not a polished full product.</p><p>Bring a laptop and a flow with one state transition you need to test.</p><button class="uk-button uk-button-primary choose" data-session="Prototyping">Choose session</button></div></li><li><div class="uk-card uk-card-default uk-card-body"><p class="uk-text-meta">15:30–16:30 / STUDIO A</p><h2 class="uk-card-title">Make the exception explicit.</h2><p>Compare two components that almost match. Decide whether their difference belongs in a token, a variant, a composition, or a one-off exception.</p><p>Bring a component screenshot and its current implementation constraints.</p><button class="uk-button uk-button-primary choose" data-session="Systems clinic">Choose session</button></div></li></ul><div class="uk-grid-medium uk-margin-medium-top" uk-grid><section class="uk-width-1-2@m"><h2 class="uk-h3">Plan details</h2><form class="uk-form-stacked" id="planner"><div class="uk-margin"><label class="uk-form-label" for="attendee">Attendee name</label><div class="uk-form-controls"><input class="uk-input" id="attendee" required placeholder="Your name" aria-describedby="name-help"></div><p id="name-help" class="uk-text-small">Use a name to label this local plan.</p></div><p>Selected: <strong id="chosen">Design critique</strong></p><button class="uk-button uk-button-secondary" type="submit">Add to local plan</button><p id="result" role="status" class="uk-text-small">No plan recorded yet.</p></form></section><section class="uk-width-1-2@m"><h2 class="uk-h3">Before you arrive</h2><ul class="uk-accordion-default" uk-accordion="multiple: true"><li><a class="uk-accordion-title" href="#">What should I prepare?</a><div class="uk-accordion-content"><p>Pick one concrete design decision. A small, well-described example is more useful than a whole product tour.</p></div></li><li><a class="uk-accordion-title" href="#">Does this reserve a seat?</a><div class="uk-accordion-content"><p>No. This preview records a choice only in memory. It is not connected to an event or registration service.</p></div></li></ul></section></div><p class="uk-text-meta uk-margin-medium-top">Official UIkit 3.25.25 CSS and JavaScript. Session content and plan behavior are original.</p></main>

```

[Code reference](https://getuikit.com/docs/switcher)

- The uk-switcher attribute initializes behavior; uk-switcher class identifies its content container.
- No UIkit icon pack is needed for this composition.

### Original local-plan behavior

Session choices and validation are application logic alongside native UIkit interactions.

```javascript
const name=document.getElementById('attendee');const chosen=document.getElementById('chosen');const result=document.getElementById('result');document.querySelectorAll('.choose').forEach(button=>button.addEventListener('click',()=>{chosen.textContent=button.dataset.session;result.textContent='Choice updated. Add it to the local plan when ready.';name.focus()}));name.addEventListener('input',()=>{name.setCustomValidity('');name.classList.remove('uk-form-danger');name.removeAttribute('aria-invalid')});name.addEventListener('invalid',()=>{name.classList.add('uk-form-danger');name.setAttribute('aria-invalid','true')});document.getElementById('planner').addEventListener('submit',event=>{event.preventDefault();if(!name.value.trim()){name.setCustomValidity('Enter a non-empty name.');name.reportValidity();return;}result.textContent=name.value.trim()+' — '+chosen.textContent+' added to this local plan. No seat was reserved.';});

```

[Code reference](https://getuikit.com/docs/form)

- Choosing a session focuses the attendee field.
- No booking service or notification is called.

### Explicit screen-level refinements

Small spacing and focus adjustments while retaining UIkit components.

```css
body{background:#fafafa}.uk-container-small{max-width:1040px}.uk-heading-small{font-size:42px}.uk-card-body{padding:28px}.uk-text-meta{color:#65717a}.uk-button{white-space:normal}.uk-tab{flex-wrap:wrap}.uk-card-title{font-size:24px;line-height:1.3}.uk-tile-muted{background:#edf3f8}.uk-button:focus-visible,.uk-tab a:focus-visible,.uk-accordion-title:focus-visible{outline:3px solid #145ca5;outline-offset:4px}@media(max-width:639px){.uk-padding{padding:20px}.uk-heading-small{font-size:34px}.uk-card-body{padding:20px}.uk-card-title{font-size:22px}}

```

[Code reference](https://getuikit.com/docs/utility)

- These overrides are not official default token values.

## Implementation Starting Point

Save the provided screen refinements as style.css and local-plan behavior as app.js. UIkit handles the Switcher and Accordion. This composition does not require the icon bundle. The HTML wrapper includes the full body markup; save the supplied interaction and CSS examples under the filenames referenced here.

```html
<!-- npm install uikit@3.25.25
mkdir -p assets
cp node_modules/uikit/dist/css/uikit.min.css assets/
cp node_modules/uikit/dist/js/uikit.min.js assets/ -->
<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Workshop planner</title>
<link rel="stylesheet" href="assets/uikit.min.css">
<link rel="stylesheet" href="style.css">
<script src="assets/uikit.min.js" defer></script>
<script src="app.js" defer></script></head>
<body><main class="uk-container uk-container-small uk-padding"><div class="uk-grid-small uk-flex-middle" uk-grid><div class="uk-width-1-1 uk-width-expand@s"><p class="uk-text-meta uk-text-uppercase">UIkit / Workshop program</p><h1 class="uk-heading-small">One afternoon.<br>Three ways to learn.</h1></div><div><span class="uk-label">Local planner</span></div></div><ul class="uk-tab uk-margin-medium-top" uk-switcher="connect: #sessions; animation: uk-animation-fade"><li><a href="#">Design critique</a></li><li><a href="#">Prototyping</a></li><li><a href="#">Systems clinic</a></li></ul><ul class="uk-switcher" id="sessions"><li><div class="uk-card uk-card-default uk-card-body"><div class="uk-grid-medium" uk-grid><div class="uk-width-2-3@m"><p class="uk-text-meta">13:00–14:00 / STUDIO A</p><h2 class="uk-card-title">A useful critique starts with context.</h2><p>Bring one interface and a question you cannot resolve alone. Practice separating observation, interpretation, and a proposed change.</p><ul class="uk-list uk-list-bullet"><li>Frame the user’s task before discussing style.</li><li>Compare two alternatives against the same goal.</li><li>Leave with one specific next experiment.</li></ul></div><div class="uk-width-1-3@m"><div class="uk-tile uk-tile-muted uk-padding-small"><strong>Bring with you</strong><p>A screenshot, a short task description, and one unresolved decision.</p><button class="uk-button uk-button-primary uk-width-1-1 choose" data-session="Design critique">Choose session</button></div></div></div></div></li><li><div class="uk-card uk-card-default uk-card-body"><p class="uk-text-meta">14:15–15:15 / STUDIO B</p><h2 class="uk-card-title">Prototype the difficult transition.</h2><p>Build a small interaction that covers an empty state, an interrupted action, and recovery. The target is a useful decision, not a polished full product.</p><p>Bring a laptop and a flow with one state transition you need to test.</p><button class="uk-button uk-button-primary choose" data-session="Prototyping">Choose session</button></div></li><li><div class="uk-card uk-card-default uk-card-body"><p class="uk-text-meta">15:30–16:30 / STUDIO A</p><h2 class="uk-card-title">Make the exception explicit.</h2><p>Compare two components that almost match. Decide whether their difference belongs in a token, a variant, a composition, or a one-off exception.</p><p>Bring a component screenshot and its current implementation constraints.</p><button class="uk-button uk-button-primary choose" data-session="Systems clinic">Choose session</button></div></li></ul><div class="uk-grid-medium uk-margin-medium-top" uk-grid><section class="uk-width-1-2@m"><h2 class="uk-h3">Plan details</h2><form class="uk-form-stacked" id="planner"><div class="uk-margin"><label class="uk-form-label" for="attendee">Attendee name</label><div class="uk-form-controls"><input class="uk-input" id="attendee" required placeholder="Your name" aria-describedby="name-help"></div><p id="name-help" class="uk-text-small">Use a name to label this local plan.</p></div><p>Selected: <strong id="chosen">Design critique</strong></p><button class="uk-button uk-button-secondary" type="submit">Add to local plan</button><p id="result" role="status" class="uk-text-small">No plan recorded yet.</p></form></section><section class="uk-width-1-2@m"><h2 class="uk-h3">Before you arrive</h2><ul class="uk-accordion-default" uk-accordion="multiple: true"><li><a class="uk-accordion-title" href="#">What should I prepare?</a><div class="uk-accordion-content"><p>Pick one concrete design decision. A small, well-described example is more useful than a whole product tour.</p></div></li><li><a class="uk-accordion-title" href="#">Does this reserve a seat?</a><div class="uk-accordion-content"><p>No. This preview records a choice only in memory. It is not connected to an event or registration service.</p></div></li></ul></section></div><p class="uk-text-meta uk-margin-medium-top">Official UIkit 3.25.25 CSS and JavaScript. Session content and plan behavior are original.</p></main>
</body></html>
```

## Agent Prompt

Use UIkit 3.25.25 to extend the supplied workshop planner. Preserve uk-switcher with its explicit #sessions connection, matching navigation/content order, uk-grid responsive fractions and the native multiple-open accordion. Viewing a session must remain separate from choosing it. Choosing focuses the labeled attendee input; whitespace-only submission must show uk-form-danger and aria-invalid. The status should name the chosen session and attendee as a local plan, without claiming a seat was booked. Load the matching UIkit runtime before the application script.

## Sources

- [Less](https://getuikit.com/docs/less) — Compile-time theme variables.
- [Switcher](https://getuikit.com/docs/switcher) — Connected navigation/content behavior.
- [Accordion](https://getuikit.com/docs/accordion) — Multiple expansion and anatomy.
- [Grid](https://getuikit.com/docs/grid) — Responsive widths and gutters.
- [Form](https://getuikit.com/docs/form) — Input and validation classes.
- [Installation](https://getuikit.com/docs/installation) — Runtime and style loading.
