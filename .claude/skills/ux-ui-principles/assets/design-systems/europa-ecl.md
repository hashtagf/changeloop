# Europa Component Library Design System — OpenDesign Application Guide

Inspect Europa’s EC color, type and spacing roles through a complete native accordion brief, including keyboard operation, open-all behavior and readable no-JavaScript fallback.

An OpenDesign application guide for ECL EC 4.11.2. Original sample notes and page composition do not represent a European Commission service, funding call or legal requirement.

## Source Reference

- **Preset:** EC 4.11.2 ([source](https://cdn.jsdelivr.net/npm/@ecl/preset-ec@4.11.2/dist/styles/ecl-ec.css))
- **Screen typography:** Arial with published role shorthands ([source](https://ec.europa.eu/component-library/v4.11.2/ec/guidelines/typography/))
- **Reference entries:** 41 concrete tokens and API entries ([source](https://cdn.jsdelivr.net/npm/@ecl/preset-ec@4.11.2/dist/styles/ecl-ec.css))


## Design Reference

Verified @ecl/preset-ec 4.11.2 stylesheet and Accordion source. Native behavior and original bulk-control composition are explicitly distinguished.

### EC palette and status roles

[Official reference](https://ec.europa.eu/component-library/v4.11.2/ec/guidelines/colours/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ecl-color-primary | #3860ed | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-primary-140 | #0f2fa2 | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-secondary | #ffbe5c | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-dark | #26324b | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-info | #3860ed | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-success | #24a148 | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-error | #da1e28 | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-warning | #f39811 | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-background | #fcfcfc | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-branding | #004494 | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-neutral-20 | #f8f9fd | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-neutral-60 | #e0e5f5 | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |
| --ecl-color-white | #fff | Published EC preset values. Branding blue is distinct from action primary; status colors do not replace written messages. |

### Spacing scale

[Official reference](https://ec.europa.eu/component-library/v4.11.2/ec/guidelines/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ecl-spacing-2xs | 0.25rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-xs | 0.5rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-s | 0.75rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-m | 1rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-l | 1.25rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-xl | 1.5rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-2xl | 2rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-3xl | 2.5rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-4xl | 3rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-5xl | 3.5rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |
| --ecl-spacing-6xl | 4rem | Actual rem-based scale in the pinned preset. Custom composition consumes these roles without inventing a different institutional scale. |

### Typography and reading measure

[Official reference](https://ec.europa.eu/component-library/v4.11.2/ec/guidelines/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ecl-font-family-default | arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-xs | normal normal 400 0.75rem/1.125rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-s | normal normal 400 0.875rem/1.125rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-m | normal normal 400 1rem/1.5rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-l | normal normal 400 1.25rem/1.75rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-xl | normal normal 400 1.5rem/2.25rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-2xl | normal normal 400 1.75rem/2.25rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-3xl | normal normal 400 2.5rem/2.75rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-font-4xl | normal normal 400 3.25rem/3.375rem arial,sans-serif | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |
| --ecl-max-width | 80ch | Complete shorthand values include weight, size, line-height and fallback. The EC screen family here is Arial; no custom web font is required. |

### Native accordion contract

[Official reference](https://cdn.jsdelivr.net/npm/@ecl/vanilla-component-accordion@4.11.2/accordion.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Initialization | data-ecl-auto-init="Accordion" + ECL.autoInit() | Initializes this component inside the preset; no framework wrapper is needed. |
| Trigger | data-ecl-accordion-toggle | The native listener is attached to each heading button. |
| Target | aria-controls matches a panel ID | Missing targets cause an error; each ID must remain unique. |
| Open state | aria-expanded + panel.hidden | The runtime changes both semantics and visible content. |
| Event | root.ECLAccordion.on("onToggle", callback) | The example derives the open-section count after a native toggle. |
| Event payload | { item, isOpening } | The item is the target panel, not an array index or a selected tab. |
| Independent panels | Several may be open together | Open-all is original application behavior that activates native trigger buttons. |

## Europa Component Library Design System Europa EC Preset and Version Choice

### Choose EC or EU before importing assets

Europa supplies separate institutional presets. This example deliberately uses @ecl/preset-ec at 4.11.2, corresponding to the linked EC documentation. It does not mix EU markup, historical EC screenshots and an unpinned stylesheet. The package provides dist/styles/ecl-ec.css and dist/scripts/ecl-ec.js, so the static example can be served without introducing a frontend framework.

- Use the EC preset for the EC implementation shown here.
- Keep CSS and JavaScript on the same version.
- Keep source IDs unique when reusing accordion items.

### Treat this as a versioned implementation

The reference describes 4.11.2, not an assertion that every later release has identical tokens or behavior. Upgrades should compare the chosen preset, component markup and initialization together. A new package name or version number alone does not prove that a previously copied pattern still behaves correctly.

## Europa Component Library Design System Europa Color Roles and Institutional Identity

### Keep branding and primary action separate

The preset’s branding color is #004494 while its primary color is #3860ed. The original brief uses branding only as a narrow top rule, then lets the component use its own primary action treatment. Neutral-20 supports the page background and neutral-60 separates content. This preserves the distinction between an institutional accent and the color of an interactive control.

### Do not invent official meaning for the sample

The page is an OpenDesign study with fictional consultation notes. It has no European Commission logo and does not represent a funding call, service or legal requirement. Error, warning and success palette entries are listed as actual tokens, but the preview does not generate an artificial application-success message merely to display all colors.

## Europa Component Library Design System Europa Typography and Spacing Scale

### Use complete font shorthand values

The EC preset defines Arial as its default screen family. Its m role is 1rem with a 1.5rem line-height at weight 400; larger roles carry their own line-height. The reference includes complete declarations rather than only isolated point sizes. The study’s heading weight is an original emphasis choice applied on top of the provided role, while component text remains under native stylesheet control.

### Keep rem spacing and content measure visible

The spacing sequence includes 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5 and 4rem. The native maximum reading measure is 80ch. The original layout uses a centered 1080px outer boundary and responsive padding, while each accordion retains the preset’s own spacing. The outer width is a composition decision, not a new official token.

## Europa Component Library Design System Europa Accordion Markup and Native Behavior

### Make heading buttons control real panels

Every .ecl-accordion__item contains a heading with an .ecl-accordion__toggle button. Its aria-controls points to the matching .ecl-accordion__content panel. The example includes a stable trigger ID and aria-labelledby on each region. The native script finds the target by ID, changes aria-expanded and changes panel.hidden; the relationships must remain correct if items are reordered or copied.

### Use an explicit indicator without an external sprite

The example supplies small original inline plus and minus SVG paths inside the native toggle-indicator classes. The preset controls which one is displayed for the expanded state. These are original simple geometry, not copied institutional logos. This keeps the full example self-contained and avoids cross-origin sprite loading while preserving the component anatomy.

## Europa Component Library Design System Europa Accordion Events and Open-All Behavior

### Derive state from the native component

ECL.autoInit() exposes the initialized component as root.ECLAccordion. The application listens to its onToggle event and calculates how many trigger buttons currently have aria-expanded="true". The event payload includes the target item and isOpening, which is useful for per-panel handling. The count does not guess state from visible text or maintain a second independent open-state array.

### Keep the bulk action predictable

When every panel is open, the bulk action closes them; otherwise it opens all of them. The handler activates only those native buttons whose state needs to change. It does not write hidden or aria-expanded itself, so native events and the derived count remain consistent. The control’s label changes between Open all sections and Close all sections to communicate the next action.

## Europa Component Library Design System Europa Keyboard and Progressive Reading

### Use normal button interaction

Tab moves to a heading button, while Enter or Space activates it through native browser button behavior. This is an accordion, not a tablist: arrow-key tab navigation should not be added by analogy. Several panels may remain open, which supports comparing the notes. The focus indicator comes from the component stylesheet and remains visible against the light surface.

### Keep the text readable without JavaScript

The source HTML starts with all panels visible and aria-expanded="true". After native initialization succeeds, the application collapses them by activating their buttons. With JavaScript disabled the text therefore remains visible, and the inactive bulk toolbar is hidden by the no-js style. This fallback was tested using actual visibility, not simply the presence of the paragraphs in source.

## Europa Component Library Design System Europa Responsive Panels and Long Content

### Allow natural height and line wrapping

The document uses no fixed accordion height. Expanded notes can grow to contain headings, ordered lists and a highlighted decision note. On smaller screens the original outer padding reduces and the headline uses a smaller provided type role. Long trigger text wraps while the indicator remains available. This was checked at 280px as well as desktop, tablet and phone widths.

### Do not turn reading controls into an approval flow

Opening or closing a panel changes only presentation. The count reports sections open, not sections completed or requirements met. The footer states that no consultation response or formal approval is submitted. A real service would need its own eligibility, persistence and backend behavior, none of which is implied by the component demo.

## Europa Component Library Design System Europa Complete Static Setup

### Install the matching preset and save every file

The supplied index.html loads the pinned preset stylesheet and browser script before ecl-app.js. Save the accompanying ecl.css and ecl-app.js beside it and serve the folder over HTTP. All content, indicator SVGs and state handlers are included. There is no hidden application scaffold or separate icon download needed for this study.

1. Install the pinned EC preset.
2. Save index.html, ecl.css and ecl-app.js together.
3. Serve the directory and test single and bulk toggles.
4. Repeat with keyboard, a narrow viewport and JavaScript disabled.

### Keep component upgrades reviewable

After an upgrade, check the trigger-to-panel IDs, initialization, onToggle listener, bulk state and no-JavaScript view. Then compare actual type, colors and narrow-screen layout. Package installation and a rendered heading are not sufficient evidence that the full expandable content still works.

## Component Examples

### ecl-index.html — complete source

Full component markup, content, inline indicators and preset asset paths.

```html
<!doctype html><html lang="en" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Public conversation brief</title><link rel="stylesheet" href="./node_modules/@ecl/preset-ec/dist/styles/ecl-ec.css"><link rel="stylesheet" href="./ecl.css"></head><body><main><header class="mast"><p class="eyebrow">European Commission preset / original study</p><h1>A clear brief for a public conversation</h1><p>Explore three preparation notes with native ECL expandable sections and an explicit open-all control.</p></header><p class="scope">ECL EC 4.11.2 CSS and native Accordion runtime. Original OpenDesign sample text; this is not an EU service, funding programme or legal guide.</p><div class="toolbar"><p id="count" role="status">0 of 3 sections open</p><button id="all" type="button" class="ecl-button ecl-button--secondary">Open all sections</button></div><div class="ecl-accordion" data-ecl-accordion data-ecl-auto-init="Accordion"><section class="ecl-accordion__item"><h2 class="ecl-accordion__title"><button class="ecl-accordion__toggle" data-ecl-accordion-toggle aria-controls="purpose" aria-expanded="true" id="toggle-purpose" type="button"><span class="ecl-accordion__toggle-flex"><span class="ecl-accordion__toggle-title">Define the purpose before collecting information</span><span class="ecl-accordion__toggle-indicator"><svg class="ecl-accordion__toggle-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M11 3h2v8h8v2h-8v8h-2v-8H3v-2h8z"/></svg><svg class="ecl-accordion__toggle-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 11h18v2H3z"/></svg></span></span></button></h2><div class="ecl-accordion__content" id="purpose" role="region" aria-labelledby="toggle-purpose"><p>This fictional planning note describes a small community consultation. It is sample editorial content, not an EU funding call, legal requirement or official application process.</p><h3>Make a decision possible</h3><ol><li>State which decision the conversation will inform.</li><li>List information already available before asking participants for more.</li><li>Name what remains outside the consultation.</li></ol><aside class="decision"><h3>Keep the outcome proportionate</h3><p>A short conversation may support a next step; it does not by itself prove consent, eligibility or public support.</p></aside></div></section><section class="ecl-accordion__item"><h2 class="ecl-accordion__title"><button class="ecl-accordion__toggle" data-ecl-accordion-toggle aria-controls="participation" aria-expanded="true" id="toggle-participation" type="button"><span class="ecl-accordion__toggle-flex"><span class="ecl-accordion__toggle-title">Make participation understandable and accessible</span><span class="ecl-accordion__toggle-indicator"><svg class="ecl-accordion__toggle-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M11 3h2v8h8v2h-8v8h-2v-8H3v-2h8z"/></svg><svg class="ecl-accordion__toggle-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 11h18v2H3z"/></svg></span></span></button></h2><div class="ecl-accordion__content" id="participation" role="region" aria-labelledby="toggle-participation"><p>Give participants enough context to decide whether and how to take part. The invitation should explain the topic, expected duration, available formats and the use of any notes.</p><h3>Provide usable alternatives</h3><ol><li>Offer a plain-language explanation of the activity.</li><li>Allow a person to contribute without speaking to the whole group.</li><li>Explain how to ask for an accessible format.</li></ol><aside class="decision"><h3>Check the invitation itself</h3><p>A technically accessible page is only one part of participation. Timing, language and the route for asking a question also affect who can join.</p></aside></div></section><section class="ecl-accordion__item"><h2 class="ecl-accordion__title"><button class="ecl-accordion__toggle" data-ecl-accordion-toggle aria-controls="record" aria-expanded="true" id="toggle-record" type="button"><span class="ecl-accordion__toggle-flex"><span class="ecl-accordion__toggle-title">Record decisions and unresolved questions separately</span><span class="ecl-accordion__toggle-indicator"><svg class="ecl-accordion__toggle-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M11 3h2v8h8v2h-8v8h-2v-8H3v-2h8z"/></svg><svg class="ecl-accordion__toggle-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 11h18v2H3z"/></svg></span></span></button></h2><div class="ecl-accordion__content" id="record" role="region" aria-labelledby="toggle-record"><p>After the session, distinguish what was agreed from what still needs investigation. A clean record helps the next reader understand how a proposal changed and why.</p><h3>Prepare a readable follow-up</h3><ol><li>Write the next action with an owner and review date.</li><li>Make open questions visible alongside conclusions.</li><li>Invite participants to correct an inaccurate summary.</li></ol><aside class="decision"><h3>Avoid a false completion signal</h3><p>Closing these panels is a reading action only. This preview sends no consultation response and records no formal approval.</p></aside></div></section></div><p class="footer">Each heading is a native button. Use Tab to move between headings and Enter or Space to toggle; several sections can remain open. Without JavaScript the notes remain readable.</p></main><script src="./node_modules/@ecl/preset-ec/dist/scripts/ecl-ec.js"></script><script src="./ecl-app.js"></script></body></html>
```

[Code reference](https://ec.europa.eu/component-library/v4.11.2/ec/getting-started/)

- Save the HTML file as index.html and keep the other supplied file names unchanged.

### ecl.css — complete source

Original responsive composition around native ECL component styling.

```css
*{box-sizing:border-box}body{margin:0;background:var(--ecl-color-neutral-20);font:var(--ecl-font-m);color:var(--ecl-color-dark)}main{max-width:1080px;margin:auto;padding:40px}.mast{border-top:6px solid var(--ecl-color-branding);padding:32px;background:white}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--ecl-color-primary-140)}h1{font:var(--ecl-font-3xl);font-weight:700;margin:16px 0;max-width:22ch}.mast p{max-width:72ch}.scope{font:var(--ecl-font-s);margin:24px 0;max-width:90ch}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;margin:32px 0 16px}.toolbar p{margin:0}.ecl-accordion{background:white}.ecl-accordion__toggle-title{padding-right:16px}.ecl-accordion__toggle-icon{width:24px;height:24px}.ecl-accordion__content p:first-child{margin-top:0}.ecl-accordion__content ol,.ecl-accordion__content ul{padding-left:24px}.ecl-accordion__content li{margin:8px 0}.ecl-accordion__content h3{font-size:18px;line-height:1.4}.decision{border-left:4px solid var(--ecl-color-secondary);padding:16px;background:var(--ecl-color-neutral-20);margin:24px 0}.footer{font:var(--ecl-font-s);margin-top:24px;border-top:1px solid var(--ecl-color-neutral-60);padding-top:24px}.no-js .toolbar{display:none}@media(max-width:600px){main{padding:16px}.mast{padding:24px}h1{font:var(--ecl-font-2xl);font-weight:700}.ecl-accordion__toggle{overflow-wrap:anywhere}}
```

[Code reference](https://ec.europa.eu/component-library/v4.11.2/ec/getting-started/)

- Save the HTML file as index.html and keep the other supplied file names unchanged.

### ecl-app.js — complete source

Native initialization and event-driven bulk behavior with readable initial HTML.

```javascript
document.documentElement.classList.remove('no-js');ECL.autoInit();const root=document.querySelector('[data-ecl-accordion]');const buttons=[...root.querySelectorAll('[data-ecl-accordion-toggle]')];const all=document.querySelector('#all');function sync(){let open=buttons.filter(b=>b.getAttribute('aria-expanded')==='true').length;document.querySelector('#count').textContent=open+' of '+buttons.length+' sections open';all.textContent=open===buttons.length?'Close all sections':'Open all sections';}root.ECLAccordion.on('onToggle',sync);buttons.forEach(b=>b.click());all.addEventListener('click',()=>{let close=buttons.every(b=>b.getAttribute('aria-expanded')==='true');buttons.filter(b=>(b.getAttribute('aria-expanded')==='true')===close).forEach(b=>b.click());});sync();
```

[Code reference](https://ec.europa.eu/component-library/v4.11.2/ec/getting-started/)

- Save the HTML file as index.html and keep the other supplied file names unchanged.

## Implementation Starting Point

Open http://localhost:8000/. The example uses the EC preset and no additional icon or font download.

```sh
npm init -y
npm install @ecl/preset-ec@4.11.2
# Save index.html, ecl.css and ecl-app.js from the supplied examples.
python3 -m http.server 8000
```

## Agent Prompt

Implement the supplied ECL EC 4.11.2 accordion brief using all three complete files. Preserve native trigger/panel relationships, onToggle-driven count, bulk open/close semantics, keyboard button activation, no-JavaScript reading and explicit original sample scope. Do not imply an official EU service or formal submission.

## Sources

- [EC getting started](https://ec.europa.eu/component-library/v4.11.2/ec/getting-started/) — Preset assets and implementation setup.
- [Accordion guidance](https://ec.europa.eu/component-library/v4.11.2/ec/components/accordion/usage/) — Component context and usage reference.
- [Color roles](https://ec.europa.eu/component-library/v4.11.2/ec/guidelines/colours/) — Primary, branding, neutral and status palette.
- [Pinned preset stylesheet](https://cdn.jsdelivr.net/npm/@ecl/preset-ec@4.11.2/dist/styles/ecl-ec.css) — The exact values used by this example.
