# Helsinki Design System — OpenDesign Application Guide

Compose native HDS selection groups, semantic feedback colors and linked error summaries with a complete local review-and-correction flow.

Independent OpenDesign example. No Helsinki font asset or service identity; no registration or backend result.

## Source Reference

- **Institution:** HDS is the City of Helsinki’s open-source design system. ([source](https://github.com/City-of-Helsinki/helsinki-design-system))
- **Implementations:** The repository provides React and CSS component tracks. ([source](https://github.com/City-of-Helsinki/helsinki-design-system))
- **React package:** The documented React package is hds-react. ([source](https://github.com/City-of-Helsinki/helsinki-design-system/blob/development/packages/react/README.md))
- **Core package:** The repository includes hds-core. ([source](https://github.com/City-of-Helsinki/helsinki-design-system))
- **Tokens:** Design tokens are published as hds-design-tokens. ([source](https://github.com/City-of-Helsinki/helsinki-design-system))
- **Font distribution:** The React package does not include Helsinki fonts. ([source](https://github.com/City-of-Helsinki/helsinki-design-system/blob/development/packages/react/README.md))


## Design Reference

hds-core5.2.2 package CSS and official form guidance. Native styles; Arial fallback; original minimum-selection rule.

### Typography tokens

[Official reference](https://github.com/City-of-Helsinki/helsinki-design-system/tree/development/packages/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --font-default | HelsinkiGroteskPro, Arial, sans-serif | Copyrighted Helsinki fonts are not in Core package; demo uses native Arial fallback. |
| --fontsize-body-s/m/l/xl | 14 /16 /18 /20px | At normal root; choose a role, not arbitrary per-field sizes. |
| --fontsize-heading-xxl/xl | 64 /48px | Largest headings. |
| --fontsize-heading-xl-mobile | 40px | Explicit token; preview switches at576px as an application choice. |
| --fontsize-heading-l/m/s | 32 /24 /20px | Secondary headings. |
| --lineheight-s/m/l/xl | 1 /1.2 /1.5 /1.75 | Multipliers, not pixel heights. |

### Component and layout spacing

[Official reference](https://github.com/City-of-Helsinki/helsinki-design-system/tree/development/packages/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Component scale | 2,4,8,12,16,24,32,40,48,56,64,72px | spacing-4-xs through spacing-5-xl. |
| Layout scale | 16,24,32,48,64,96,128px | spacing-layout-2-xs through spacing-layout-2-xl. |
| Breakpoints | 320,576,768,992,1248,1440px | xs through xxl; declared token values do not themselves create media queries. |
| Container widths | 288,544,720,944,1200px | xs through xl reference widths. |
| Checkbox geometry | 24px size;2px border;3px focus outline | Actual Core5.2.2 CSS. |
| Button minimum | 56px; square corners | 2px border with padding derived from spacing-s/l. |

### Semantic and palette colors

[Official reference](https://github.com/City-of-Helsinki/helsinki-design-system/tree/development/packages/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Bus | #0000bf | Default checkbox selected and primary-button theme. |
| Coat of arms / focus | #0072c6 | Distinct city blue and focus role. |
| Copper | #00d7a7 | Accent palette; demo header rule. |
| Error / light | #b01038 /#f6e2e6 | Validation feedback; not interchangeable with decorative Brick. |
| Success / light | #007a64 /#e2f5f3 | Confirmed outcome role. |
| Info / alert | #0062b9 /#ffda07 | Information and attention roles. |
| Text / secondary | #1a1a1a /#595959 | black-90 and black-60. |

### Form structure and recovery

[Official reference](https://hds.hel.fi/patterns/forms/form-building/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Selection group | fieldset + legend | Legend describes the choice; labels describe options. |
| Vertical items | hds-selection-group__items--vertical | Avoid forcing long options into one horizontal row. |
| Error summary | Notification error variant with linked error list | Place below form heading, focus heading after failed submit. |
| Inline error | hds-selection-group__error-text | Keep helper instructions visible during correction. |
| Application rule | At least two topics | Original scenario validation, not an HDS checkbox default. |

## Helsinki Design System Core and React boundaries

### Choose the implementation you actually run

HDS provides Core CSS, React components and design tokens. This specimen pins hds-core5.2.2, the package downloaded and inspected for the example. Repository release numbers can differ from an individual package version, so a newer repository tag is not evidence that this specimen runs that version.

Core supplies base variables and individual component styles. It does not provide the form application state used here. The selection, validation, review and change logic is original JavaScript built around native HTML inputs and the documented HDS form pattern.

[Supporting specification](https://github.com/City-of-Helsinki/helsinki-design-system/blob/development/packages/core/README.md)

## Helsinki Design System Typography and the font boundary

### Use native fallback transparently

The font variable names HelsinkiGroteskPro first, followed by Arial and sans-serif. The Core README explicitly excludes the Helsinki font files for copyright reasons. The preview retains the fallback rather than downloading restricted fonts or silently claiming an exact branded rendering.

The base body token is16px with1.5 line height. Heading-xl is48px and the mobile token is40px; the preview switches between them at576px. Those are named values, but a CSS variable containing a breakpoint does not automatically create responsive behavior. The explicit media rule belongs to the application composition.

[Supporting specification](https://github.com/City-of-Helsinki/helsinki-design-system/blob/development/packages/core/README.md)

## Helsinki Design System Two spacing systems

### Separate component gaps from page rhythm

HDS distinguishes a component spacing sequence from a larger layout sequence. The former includes2,4,8,12,16 and24px before growing through72px. Layout spacing reaches128px. Using spacing-layout-xl as a gap between adjacent checkboxes would overwhelm the group even though the variable is valid.

The checkbox component defines a24px control,2px border and3px focus outline. The button minimum is56px with square corners. The preview preserves these native shapes, while the form sits in an application container capped at the published720px reference width.

[Supporting specification](https://github.com/City-of-Helsinki/helsinki-design-system/tree/development/packages/design-tokens)

## Helsinki Design System Color roles in a form

### Do not confuse palette names with feedback

The default interactive theme uses Bus blue, while the focus outline uses Coat of arms blue. Error feedback uses a separate berry tone and pale error surface. A palette accent such as Copper can support a header, but it should not replace the error role simply because it looks more distinctive.

The selection group’s inline error combines text, a contrasting left border and an icon treatment. It does not rely on red alone. The error summary links use the familiar interactive color so people can recognize the route back to the field.

[Supporting specification](https://github.com/City-of-Helsinki/helsinki-design-system/tree/development/packages/design-tokens)

## Helsinki Design System Checkbox group anatomy

### A group has one question and several answers

The native structure is a fieldset with a legend, an items container and individual checkbox wrappers. Each input immediately precedes its label because the stylesheet uses that relationship for visual states. The legend explains the selection task; each label names one available topic.

The demo asks for at least two topics, an original business rule. Checkboxes are appropriate because several choices may remain selected. A radio group would express a mutually exclusive choice and would contradict the task. The fieldset hint remains visible before and after validation.

```html
<fieldset class="hds-selection-group" aria-describedby="topics-hint">
  <legend class="hds-selection-group__legend">Topics for your afternoon</legend>
  <p id="topics-hint">Choose at least two topics.</p>
  <div class="hds-selection-group__items hds-selection-group__items--vertical">
    <div class="hds-checkbox">
      <input class="hds-checkbox__input" type="checkbox" id="repair" value="Repair and reuse">
      <label class="hds-checkbox__label" for="repair">Repair and reuse</label>
    </div>
    <div class="hds-checkbox">
      <input class="hds-checkbox__input" type="checkbox" id="garden" value="Urban gardening">
      <label class="hds-checkbox__label" for="garden">Urban gardening</label>
    </div>
  </div>
</fieldset>
```

[Code reference](https://hds.hel.fi/patterns/forms/form-building/)

[Supporting specification](https://hds.hel.fi/patterns/forms/form-building/)

## Helsinki Design System Linked errors and recovery

### Focus the problem, then preserve the work

HDS recommends an error summary below the form heading after failed submission. Its list links to erroneous controls, and focus moves to the summary heading. The demo follows that sequence: reviewing zero or one topic reveals the summary and inline message; the link focuses the first checkbox.

After the initial attempt, each selection change rechecks the minimum. Once two topics are selected, both error presentations disappear without clearing the selected inputs. On another failed attempt, focus returns to the summary heading. The rule is checked again at review; client-side feedback is not a substitute for server validation in a real service.

1. Review with no topics and confirm the summary receives focus.
2. Follow its link and choose two topics; confirm the error clears.
3. Open the local review, return to change topics and verify both selections remain.

[Supporting specification](https://hds.hel.fi/patterns/forms/form-validation/)

## Helsinki Design System Assets and complete example

### Load base plus selected components

The Core package separates base.css from component styles. Importing base alone gives variables and typography but not the checkbox or notification anatomy. The setup names the exact files used by this specimen, keeping the asset set smaller than the all-components bundle.

The complete example includes application validation and reset. It names the final state a local review, because nothing is registered or sent. Clear selection is a deliberate action that resets choices and validation history, then focuses the first input; it is not triggered by an ordinary field error.

- base.css supplies colors, spacing, typography and reference dimensions.
- checkbox and selection-group styles supply the grouped controls and inline feedback.
- notification and button styles provide the error summary surface and actions.

[Supporting specification](https://github.com/City-of-Helsinki/helsinki-design-system/blob/development/packages/core/README.md)

## Helsinki Design System What the example proves

### Implementation detail without a false service claim

The preview exercises real HDS component styling, keyboard focus, correction and data preservation at1440,768 and390px. It does not claim an exhaustive accessibility audit. A real multilingual city service also needs localized labels, suitable language metadata, server-side rules and a confirmed response from its service backend.

The source code is MIT licensed, but the custom city font has its own rights boundary. This independent learning example uses fictional programme topics and no official Helsinki identity. Its visible appearance and local state should never be mistaken for a real event registration.

[Supporting specification](https://github.com/City-of-Helsinki/helsinki-design-system)

## Component Examples

### Native grouped checkbox structure

Fieldset and legend establish the question; inputs and labels express multiple answers.

```html
<fieldset class="hds-selection-group" aria-describedby="topics-hint">
  <legend class="hds-selection-group__legend">Topics for your afternoon</legend>
  <p id="topics-hint">Choose at least two topics.</p>
  <div class="hds-selection-group__items hds-selection-group__items--vertical">
    <div class="hds-checkbox">
      <input class="hds-checkbox__input" type="checkbox" id="repair" value="Repair and reuse">
      <label class="hds-checkbox__label" for="repair">Repair and reuse</label>
    </div>
    <div class="hds-checkbox">
      <input class="hds-checkbox__input" type="checkbox" id="garden" value="Urban gardening">
      <label class="hds-checkbox__label" for="garden">Urban gardening</label>
    </div>
  </div>
</fieldset>
```

[Code reference](https://hds.hel.fi/patterns/forms/form-building/)

### Complete linked-error selection flow

Error-summary focus, linked correction, review, change and clear selection.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Plan a skills afternoon</title><link rel="stylesheet" href="vendor/hds-core-5.2.2/base.css"><link rel="stylesheet" href="vendor/hds-core-5.2.2/checkbox.css"><link rel="stylesheet" href="vendor/hds-core-5.2.2/selection-group.css"><link rel="stylesheet" href="vendor/hds-core-5.2.2/notification.css"><link rel="stylesheet" href="vendor/hds-core-5.2.2/button.css"><style>*{box-sizing:border-box}body{margin:0;padding:var(--spacing-layout-s) var(--spacing-s);font-family:var(--font-default);color:var(--color-black-90)}main{max-width:720px;margin:auto}h1{margin-top:8px}header{border-top:8px solid var(--color-copper);padding-top:var(--spacing-m)}.hds-selection-group{margin:24px 0}.hds-notification{margin:24px 0}.actions{display:flex;gap:16px;flex-wrap:wrap;margin-top:32px}footer{font-size:14px;line-height:1.5;margin-top:32px;border-top:1px solid var(--color-black-20);padding-top:16px}#review{background:var(--color-silver-light);padding:24px;margin-top:24px}[hidden]{display:none!important}@media(max-width:575px){.heading-xl{font-size:var(--fontsize-heading-xl-mobile)}}button{max-width:100%}</style><main class="text-body"><header><small>COMMUNITY SKILLS · LOCAL PLAN</small><h1 class="heading-xl">Plan a skills afternoon</h1><p>Select at least two topics for an example programme. Nothing is registered or sent.</p></header><form id="form" novalidate><div id="summary" class="hds-notification hds-notification--error" hidden><div class="hds-notification__content"><h2 id="summary-heading" class="hds-notification__label" tabindex="-1">Check your topic selection</h2><div class="hds-notification__body"><ul><li><a href="#repair" id="error-link">Choose at least two topics</a></li></ul></div></div></div><fieldset class="hds-selection-group" aria-describedby="hint field-error"><legend class="hds-selection-group__legend">Topics for your afternoon</legend><p id="hint">Choose two or more. You can change your selection before reviewing the plan.</p><div class="hds-selection-group__items hds-selection-group__items--vertical"><div class="hds-checkbox"><input id="repair" type="checkbox" class="hds-checkbox__input" value="Repair and reuse"><label class="hds-checkbox__label" for="repair">Repair and reuse</label></div><div class="hds-checkbox"><input id="digital" type="checkbox" class="hds-checkbox__input" value="Everyday digital skills"><label class="hds-checkbox__label" for="digital">Everyday digital skills</label></div><div class="hds-checkbox"><input id="garden" type="checkbox" class="hds-checkbox__input" value="Urban gardening"><label class="hds-checkbox__label" for="garden">Urban gardening</label></div></div><div id="field-error" class="hds-selection-group__error-text" hidden>Choose at least two topics.</div></fieldset><p id="count" role="status">0 topics selected.</p><div class="actions"><button class="hds-button hds-button--primary" type="submit">Review local plan</button><button id="reset" class="hds-button hds-button--secondary" type="button">Clear selection</button></div></form><section id="review" hidden tabindex="-1"><h2 class="heading-m">Your selected topics</h2><ul id="selected"></ul><p>This is a local review, not a booking confirmation.</p><button id="change" class="hds-button hds-button--secondary">Change topics</button></section><footer>Native HDS Core5.2.2 styles with Arial fallback. Original selection rule and local review. No Helsinki branding, registration or backend.</footer></main><script>let attempted=false;const boxes=[...document.querySelectorAll('input[type=checkbox]')];const values=()=>boxes.filter(x=>x.checked);function validate(focus=false){const n=values().length;document.querySelector('#count').textContent=n+' topics selected.';const bad=attempted&&n<2;document.querySelector('#summary').hidden=!bad;document.querySelector('#field-error').hidden=!bad;boxes.forEach(x=>{if(bad)x.setAttribute('aria-invalid','true');else x.removeAttribute('aria-invalid')});if(bad&&focus)document.querySelector('#summary-heading').focus();return !bad}boxes.forEach(x=>x.onchange=()=>validate());document.querySelector('#error-link').onclick=e=>{e.preventDefault();boxes[0].focus()};document.querySelector('#form').onsubmit=e=>{e.preventDefault();attempted=true;if(!validate(true))return;const list=document.querySelector('#selected');list.replaceChildren();values().forEach(x=>{const li=document.createElement('li');li.textContent=x.value;list.append(li)});document.querySelector('#form').hidden=true;document.querySelector('#review').hidden=false;document.querySelector('#review').focus()};document.querySelector('#change').onclick=()=>{document.querySelector('#form').hidden=false;document.querySelector('#review').hidden=true;boxes[0].focus()};document.querySelector('#reset').onclick=()=>{boxes.forEach(x=>x.checked=false);attempted=false;validate();boxes[0].focus()};</script></html>
```

[Code reference](https://hds.hel.fi/patterns/forms/form-validation/)

## Implementation Starting Point

Exact Core asset paths. Application code handles validation and review; HelsinkiGroteskPro is not bundled. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/helsinki.html. Do not open module-based examples through file://.

```bash
npm install hds-core@5.2.2
# CSS imports in a bundler:
# import 'hds-core/lib/base.css';
# import 'hds-core/lib/components/checkbox/checkbox.css';
# import 'hds-core/lib/components/selection-group/selection-group.css';
# import 'hds-core/lib/components/notification/notification.css';
# import 'hds-core/lib/components/button/button.css';
# In plain HTML, copy these files into public assets and link base.css first.
# HelsinkiGroteskPro is not bundled; the native font stack falls back to Arial.

```

## Agent Prompt

Use HDS Core5.2.2 base and selected component CSS. Group related checkboxes with fieldset/legend, preserve labels and hints, and use semantic error tokens. On failed review, show linked errors below the form heading and focus the summary heading. Recheck after correction, preserve selected values and distinguish local review from a server-confirmed submission.

## Sources

- [Core setup](https://github.com/City-of-Helsinki/helsinki-design-system/blob/development/packages/core/README.md) — Base/component CSS split and font copyright boundary.
- [Form building](https://hds.hel.fi/patterns/forms/form-building/) — Grouping, control choice and focus order.
- [Validation pattern](https://hds.hel.fi/patterns/forms/form-validation/) — Summary placement, links, correction and backend boundary.
- [Design tokens](https://github.com/City-of-Helsinki/helsinki-design-system/tree/development/packages/design-tokens) — Typography, spacing and color roles.
- [Official repository](https://github.com/City-of-Helsinki/helsinki-design-system) — Package architecture and MIT license.
- [Download complete working example](/assets/demos/helsinki-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
