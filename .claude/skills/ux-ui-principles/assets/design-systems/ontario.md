# Ontario Design System — OpenDesign Application Guide

Build an Ontario-style long-form guide with real typography, published spacing and color values, native accordion behavior and complete version-matched source.

An OpenDesign-authored workshop guide using Ontario 9.1.0 styles and its published expand/collapse script. The content and page composition are original; this is not an official service page.

## Source Reference

- **Implementation:** Ontario 9.1.0 HTML/CSS and native accordion script ([source](https://designsystem.ontario.ca/docs/documentation/develop/npm-packages.html))
- **Reference:** 32 concrete token entries ([source](https://github.com/ongov/ontario-design-system))
- **Interaction:** Independent panels, expand/collapse all and linked opening ([source](https://designsystem.ontario.ca/components/detail/accordions.html))


## Design Reference

Ontario design tokens and complete-styles 9.1.0; actual package export paths, accordion SCSS and published script verified locally.

### Text, surface and interaction colors

[Official reference](https://github.com/ongov/ontario-design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ontario-colour-greyscale-white | #FFFFFF | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-greyscale-black | #1A1A1A | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-greyscale-greyscale5 | #F2F2F2 | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-greyscale-greyscale20 | #CCCCCC | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-link | #0066CC | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-link-hover | #00478F | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-link-active | #002142 | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-link-visited | #551A8B | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-focus | #009ADB | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-alert | #CD0000 | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-success | #118847 | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |
| --ontario-colour-system-information | #1080A6 | Actual 9.1.0 token export. The compiled component CSS resolves these roles to values; importing a token alone does not create a component. |

### Spacing scale

[Official reference](https://github.com/ongov/ontario-design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ontario-spacing-0 | 0 | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-1 | 0.25rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-2 | 0.5rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-3 | 0.75rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-4 | 1rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-5 | 1.5rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-6 | 2rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-7 | 2.5rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-8 | 3rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-9 | 4rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |
| --ontario-spacing-10 | 5rem | Published rem spacing; spacing-5 is 1.5rem, so the suffix is not a direct pixel value. |

### Type and grid reference

[Official reference](https://github.com/ongov/ontario-design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ontario-font-sizes-small | 0.875rem | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-font-sizes-standard-body-text | 1rem | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-font-sizes-large | 1.25rem | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-font-sizes-x-large | 1.5rem | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-breakpoints-small | 40em | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-breakpoints-medium | 73em | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-grid-columns-total-columns | 12 | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-grid-columns-row-width | 1152 | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |
| --ontario-grid-columns-column-gutter | 32 | Published token value; unitless grid values describe the source system and must be interpreted in the relevant grid implementation. |

## Ontario Design System Package Exports and Component Styles

### Use the complete styles package deliberately

The sample pins @ongov/ontario-design-system-complete-styles 9.1.0 and uses its published expand/collapse script. This is an HTML/CSS implementation, not the separate Ontario web-component runtime. The package’s export map exposes the compiled theme through styles/css/compiled/ontario-theme.min.css; a guessed deep import with an extra dist prefix fails in a modern bundler.

### Include the accordion rules

In the inspected 9.1.0 package, the compiled theme does not include the accordion selectors used by this specimen. The page therefore includes rules compiled from the package’s own ontario-accordion.scss in the supplied CSS. The script is copied from the published dist/scripts directory because that deep JavaScript path is not exported. These are concrete build requirements, not optional visual polish.

## Ontario Design System Ontario Typography and Hierarchy

### Preserve the intended font pairing

The published theme supplies Raleway Modified for headings and Open Sans for ordinary text. The preview bundles the normal 400 and 700 faces used by the page. This keeps the distinctive heading forms while avoiding a remote-font dependency. Typography should be inspected after fonts load: fallback rendering can change both line wrapping and the relative weight of the accordion headings.

### Make stages easy to scan

The title introduces one task, the lead explains how to use the guide, and three stage headings provide a clear sequence. Supporting paragraphs and lists sit inside each panel. The adjacent note remains visible because essential joining and access information should not depend on discovering a hidden panel. The hierarchy is part of the content model, not a reason to make every sentence a headline.

## Ontario Design System Color Roles and Component Affordances

### Give links and focus different jobs

The exported link color is #0066CC, with separate hover, active and visited colors. Focus uses #009ADB. The accordion combines a visible label, directional icon and expanded state; its behavior is not explained by blue text alone. The gray boundary distinguishes stages without turning every paragraph into a separate card.

### Use the published spacing progression

The spacing table runs from zero through five rem with named intermediate steps. The specimen applies an authored two-column layout around the official component rules. Its 760px collapse point is a composition decision for this embedded guide and is not advertised as a new Ontario breakpoint. Official breakpoints remain recorded separately in the reference table.

## Ontario Design System Accordion Structure and State

### Connect each button to its content

Each stage has a heading containing a real button. Its aria-controls points to one uniquely identified content section, and aria-expanded describes whether that section is open. The content references the button through aria-labelledby. The native script coordinates component classes and aria-hidden as the panel opens and closes. A duplicate ID would break this relationship even when the visual layout appears correct.

- Use unique button and content IDs.
- Keep the heading around a real interactive button.
- Match the markup to the versioned script’s visibility behavior.

### Keep all-stage controls synchronized

Expand all and Collapse all operate on the three stage panels together. Individual panels remain independently operable. The sample follows the pinned script’s supported markup rather than mixing it with newer website markup such as hidden-until-found behavior that the pinned script does not remove. A documentation page can evolve independently of an installed release; the runnable example must match the actual package.

## Ontario Design System Linked Opening and Essential Content

### Open a stage through its real button

The sidebar links identify a stage and then invoke that stage’s native button when it is closed. They focus the button after opening. This keeps the button’s expanded attribute, heading class and content visibility in the same transition. The additional handler is application code; it is included in full so a reader can reproduce the behavior.

### Write supporting information worth expanding

The three authored stages cover preparation, materials and follow-up for a small workshop. Each contains specific actions and a paragraph explaining the sample boundary. A real invitation must still surface its purpose, access arrangements and joining details directly. This pattern organizes a longer guide; it should not conceal essential information merely to make a page look shorter.

## Ontario Design System Complete Source and Verification

### Recreate the versioned example

Create a Vite vanilla project, install the pinned complete-styles package and copy its expand/collapse script into src. Save the supplied main.js and ontario.css, preserving the root mount element. The CSS includes the official accordion rules compiled for this release plus clearly marked original layout rules. No component registration or backend service is needed for this HTML implementation.

1. Install the pinned complete-styles package.
2. Copy its expand/collapse script and save the full entry and CSS.
3. Open all panels, then collapse and reopen a stage through its link.
4. Inspect keyboard focus, expanded attributes and the phone layout.

### Inspect linked and group behavior

Test opening every stage, collapsing all and then using a sidebar link to reopen the middle stage. Confirm the button’s expanded state and the visible content agree. Repeat at phone width, where the sidebar follows the guide. The local check also confirms font assets load, the page has no horizontal overflow and the native script produces no browser errors.

## Component Examples

### main.js — complete workshop guide

Full original content, published script import and linked-opening behavior.

```javascript
import '@ongov/ontario-design-system-complete-styles/styles/css/compiled/ontario-theme.min.css';
import './ontario-expand-collapse.js';
import './ontario.css';
const topics=[['Plan the session','Make the purpose clear before people arrive.',['Publish the topic, duration and format in plain language.','Explain how participants can ask about access needs.','Tell people whether any preparation is optional or required.'],'In this sample workshop, participants discuss one familiar interface and identify one improvement. No personal information or application account is needed.'],['Prepare the materials','Offer content in a form people can use during and after the session.',['Use a meaningful heading structure in documents.','Give diagrams a concise written explanation.','Provide an accessible alternative to an activity that depends on dragging or precise pointer movement.'],'A simple agenda and an editable notes document are enough for this authored example. A real organizer should confirm the tools and formats with participants.'],['Follow up clearly','Make the next action explicit without overstating what has been agreed.',['Separate decisions from ideas that still need investigation.','State who owns any agreed follow-up.','Share notes through the channel agreed with participants.'],'This local example does not email participants or store a registration. It demonstrates the relationship between persistent guidance and expandable supporting content.']];
const icon=(dir)=>`<svg class="ontario-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="${dir==='up'?'M6 15l6-6 6 6':'M6 9l6 6 6-6'}" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>`;
document.getElementById('root').innerHTML=`<main><p class="kicker">ONTARIO DESIGN SYSTEM / ORIGINAL CONTENT STUDY</p><h1>Run an inclusive workshop</h1><p class="ontario-lead-statement">Use this sample guide to prepare a small design discussion. Expand a stage for supporting details, or open all stages to read them together.</p><div class="layout"><section aria-labelledby="guide-heading"><h2 id="guide-heading">Workshop stages</h2><div class="ontario-accordions__container"><div class="ontario-accordion__controls"><button class="ontario-accordion__button--expand-all" aria-expanded="false"><span class="ontario-accordion--expand-open-all">Expand all</span><span class="ontario-accordion--expand-close-all">Collapse all</span></button></div>${topics.map(([title,intro,items,note],i)=>`<div class="ontario-accordion" id="stage-${i}"><h3 class="ontario-accordion-heading"><button class="ontario-accordion__button" id="stage-button-${i}" aria-controls="stage-content-${i}" aria-expanded="false" data-toggle="ontario-collapse"><span class="ontario-accordion__button-icon--close">${icon('up')}</span><span class="ontario-accordion__button-icon--open">${icon('down')}</span>${title}</button></h3><section class="ontario-accordion__content" id="stage-content-${i}" aria-labelledby="stage-button-${i}" aria-hidden="true" data-toggle="ontario-expander-content"><p>${intro}</p><ul>${items.map(x=>'<li>'+x+'</li>').join('')}</ul><p>${note}</p></section></div>`).join('')}</div></section><aside><h2>Keep the essentials visible</h2><p>Session purpose, access arrangements and joining instructions belong in the main invitation. Do not hide them inside a collapsed guide.</p><h3>Jump to a stage</h3><ul class="jump">${topics.map(([title],i)=>`<li><a class="stage-link" href="#stage-${i}">${title}</a></li>`).join('')}</ul><p class="note">Published Ontario 9.1.0 styles and expand/collapse script, with original content and composition. This is not an official service page.</p></aside></div></main>`;

// Drive linked opening through the native button so its ARIA state stays synchronized.
document.querySelectorAll(".stage-link").forEach(link=>link.addEventListener("click",()=>{const button=document.querySelector(link.hash+" .ontario-accordion__button");if(button.getAttribute("aria-expanded")!=="true")button.click();button.focus()}));

```

[Code reference](https://designsystem.ontario.ca/components/detail/accordions.html)

- Copy the published script using the setup command. Links invoke the native button to maintain synchronized ARIA state.

### ontario.css — compiled accordion and original layout

Official 9.1.0 accordion rules, followed by original responsive composition.

```css
/* Accordion rules compiled from Ontario 9.1.0 published SCSS. */
.ontario-accordion__button--expand-all:focus,.ontario-accordion__button:focus{box-shadow:0 0 0 4px #009adb;outline:4px solid rgba(0,0,0,0);transition:box-shadow .1s ease-in-out}.ontario-accordion__button{font-style:normal;font-weight:700;text-rendering:optimizeLegibility;margin-bottom:1rem;font-feature-settings:normal;font-family:"Raleway Modified","Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif}.ontario-accordion__button{font-size:1.25rem;letter-spacing:.03rem;line-height:1.5;margin:0 0 .75rem 0;max-width:48rem}@media screen and (min-width: 40em){.ontario-accordion__button{font-size:1.5rem;letter-spacing:.0313rem;line-height:1.5}}.ontario-accordions__container{max-width:48rem;width:100%}.ontario-accordion{border-top:2px solid #ccc}.ontario-accordion:last-of-type{border-bottom:2px solid #ccc}.ontario-accordion__controls{display:flex;justify-content:flex-end}.ontario-accordion__button,.ontario-accordion__button--expand-all{background:none;border:0;box-sizing:border-box}.ontario-accordion__button--expand-all{font-size:1rem;margin-bottom:.5rem;color:#06c;cursor:pointer}.ontario-accordion__button--expand-all:focus,.ontario-accordion__button--expand-all:hover{color:#00478f;text-decoration:underline}.ontario-accordion__button--expand-all:active{color:#002142;text-decoration:underline}.ontario-accordion--expand-close-all{display:none}.ontario-accordion__controls--active .ontario-accordion--expand-close-all{display:block}.ontario-accordion__controls--active .ontario-accordion--expand-open-all{display:none}.ontario-accordion__button{display:flex;align-items:flex-start;color:#06c;cursor:pointer;padding:.75rem .5rem;text-align:left;width:100%;margin-bottom:0}.ontario-accordion__button .ontario-accordion__button-icon--close,.ontario-accordion__button .ontario-accordion__button-icon--open{margin-right:.5rem}.ontario-accordion__button .ontario-icon{width:1.75rem;height:1.75rem}.ontario-accordion__button:focus,.ontario-accordion__button:hover{background-color:hsl(0,0%,95%);color:#00478f}.ontario-accordion__button:focus{box-shadow:0 0 0 4px #009adb inset}.ontario-accordion__button:active{color:#002142}.ontario-accordion__content{display:none;padding:.75rem .75rem 2rem .75rem;margin-left:0}@media screen and (min-width: 40em){.ontario-accordion__content{margin-left:2rem}}.ontario-accordion__content *{margin-top:0;max-width:48rem;width:100%}.ontario-accordion__content ul,.ontario-accordion__content ol{max-width:calc(100% - 3rem)}.ontario-accordion__content>:last-child{margin-bottom:0}.ontario-accordion__button-icon--close,.ontario-expander--active .ontario-accordion__button-icon--open{display:none}.ontario-expander--active~.ontario-accordion__content,.ontario-expander--active .ontario-accordion__button-icon--close{display:block}.ontario-accordions__container .ontario-h1,.ontario-accordions__container .ontario-h2,.ontario-accordions__container .ontario-h3,.ontario-accordions__container .ontario-h4,.ontario-accordions__container .ontario-h5,.ontario-accordions__container p,.ontario-accordions__container h1,.ontario-accordions__container h2,.ontario-accordions__container h3,.ontario-accordions__container h4,.ontario-accordions__container h5,.ontario-accordions__container h6{margin:0}

/* Original composition. */
main{max-width:1200px;padding:32px;margin:auto}.kicker{font-size:14px;font-weight:700;letter-spacing:.04em}h1{max-width:24ch}.ontario-lead-statement{max-width:65ch}.layout{display:grid;grid-template-columns:1.7fr 1fr;gap:48px;margin-top:40px}aside{padding:24px;border-top:4px solid #1a1a1a;background:#f2f2f2;align-self:start}aside h2{font-size:26px;line-height:1.35;margin-top:0}aside h3{font-size:20px}.jump{padding-left:24px}.jump li{margin-bottom:16px}.note{font-size:16px;line-height:1.5}.ontario-accordion__content p+ul{margin-top:16px}.ontario-accordion__content ul+p{margin-top:16px}@media(max-width:760px){main{padding:20px}.layout{grid-template-columns:1fr;gap:32px}h1{font-size:36px}}

```

[Code reference](https://github.com/ongov/ontario-design-system)

- The compiled theme and the component-specific accordion stylesheet are both required for this pinned release.

## Implementation Starting Point

The preview runs the same published accordion script with local font assets. The example does not load the separate web-component library.

```sh
npm create vite@latest ontario-guide -- --template vanilla
cd ontario-guide
npm install
npm install @ongov/ontario-design-system-complete-styles@9.1.0
cp node_modules/@ongov/ontario-design-system-complete-styles/dist/scripts/ontario-expand-collapse.js src/ontario-expand-collapse.js
# Replace src/main.js and add src/ontario.css. Keep <div id="root"></div>.
npm run dev
```

## Agent Prompt

Build the Ontario workshop guide with complete-styles 9.1.0 and its matching accordion script. Include the component-specific accordion CSS, genuine Raleway Modified/Open Sans fonts, accessible button-content IDs and synchronized expand/collapse behavior. Keep essential information visible and route stage links through the native buttons.

## Sources

- [Accordion guidance](https://designsystem.ontario.ca/components/detail/accordions.html) — Content, markup and expansion model.
- [Package setup](https://designsystem.ontario.ca/docs/documentation/develop/npm-packages.html) — Package roles and integration choices.
- [Colour system](https://designsystem.ontario.ca/components/detail/colours.html) — Interaction and semantic colors.
- [Versioned public source](https://github.com/ongov/ontario-design-system) — Published styles, token exports and accordion implementation.
