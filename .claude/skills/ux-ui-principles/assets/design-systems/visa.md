# Visa Product Design System — OpenDesign Application Guide

Use Visa’s Nova CSS to build a clear statement-format preference with native radio controls, an alternate-color header and a review summary. Inspect the exact 1.6.5 theme values, scalable spacing and complete stylesheet integration.

Independent OpenDesign guide with native Nova CSS. This fictional preference task does not use account data or change any financial service. The preview discloses its system-font substitution.

## Source Reference

- **Package:** @visa/nova-styles 1.6.5 ([source](https://unpkg.com/@visa/nova-styles@1.6.5/package.json))
- **Theme entry:** themes/visa/index.css ([source](https://github.com/visa/nova-styles))
- **Theme root:** 14px ([source](https://unpkg.com/@visa/nova-styles@1.6.5/themes/visa/index.css))
- **Default active:** #1434cb ([source](https://unpkg.com/@visa/nova-styles@1.6.5/themes/visa/index.css))
- **Radio element:** Native input with v-radio ([source](https://unpkg.com/@visa/nova-styles@1.6.5/data.json))
- **Browser scope:** Current evergreen browsers ([source](https://design.visa.com/developing/))


## Design Reference

Published @visa/nova-styles 1.6.5 styles, Visa theme and example metadata. Default/light values are separated from alternate and dark overrides. The preview embeds official CSS locally and removes remote font-face rules, using a system fallback.

### Default palette

[Official reference](https://unpkg.com/@visa/nova-styles@1.6.5/themes/visa/index.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --palette-default-active | #1434cb | Visa 1.6.5 default/light theme reference. |
| --palette-default-active-hover | #173be8 | Visa 1.6.5 default/light theme reference. |
| --palette-default-active-pressed | #0f2595 | Visa 1.6.5 default/light theme reference. |
| --palette-default-active-accent | #fcc015 | Visa 1.6.5 default/light theme reference. |
| --palette-default-surface-1 | #ffffff | Visa 1.6.5 default/light theme reference. |
| --palette-default-surface-2 | #f5f5f5 | Visa 1.6.5 default/light theme reference. |
| --palette-default-surface-3 | #f0f0f0 | Visa 1.6.5 default/light theme reference. |
| --palette-default-text | #000000 | Visa 1.6.5 default/light theme reference. |
| --palette-default-text-subtle | #4a4a4a | Visa 1.6.5 default/light theme reference. |
| --palette-default-text-on-active | #ffffff | Visa 1.6.5 default/light theme reference. |
| --palette-default-border | rgba(0, 0, 0, 0.1) | Visa 1.6.5 default/light theme reference. |

### Theme size and type

[Official reference](https://unpkg.com/@visa/nova-styles@1.6.5/themes/visa/index.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --theme-font-size | 14px | Visa 1.6.5 default/light theme reference. |
| --theme-border-radius | 6px | Visa 1.6.5 default/light theme reference. |
| --typography-headline-1-font-size | 2.2857142857rem | Visa 1.6.5 default/light theme reference. |
| --typography-headline-2-font-size | 1.7857142857rem | Visa 1.6.5 default/light theme reference. |
| --typography-headline-3-font-size | 1.4285714286rem | Visa 1.6.5 default/light theme reference. |
| --typography-body-1-font-size | 1.1428571429rem | Visa 1.6.5 default/light theme reference. |
| --typography-body-2-font-size | 1rem | Visa 1.6.5 default/light theme reference. |
| --typography-body-3-font-size | 0.8571428571rem | Visa 1.6.5 default/light theme reference. |

### Scalable dimensions

[Official reference](https://unpkg.com/@visa/nova-styles@1.6.5/styles.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --size-scalable-4 | calc(4px * var(--theme-scale-factor)) | Base scalable dimension; responsive contexts may apply an additional factor. |
| --size-scalable-8 | calc(8px * var(--theme-scale-factor)) | Base scalable dimension; responsive contexts may apply an additional factor. |
| --size-scalable-12 | calc(12px * var(--theme-scale-factor)) | Base scalable dimension; responsive contexts may apply an additional factor. |
| --size-scalable-16 | calc(16px * var(--theme-scale-factor)) | Base scalable dimension; responsive contexts may apply an additional factor. |
| --size-scalable-24 | calc(24px * var(--theme-scale-factor)) | Base scalable dimension; responsive contexts may apply an additional factor. |
| --size-scalable-32 | calc(32px * var(--theme-scale-factor)) | Base scalable dimension; responsive contexts may apply an additional factor. |
| --size-scalable-40 | calc(40px * var(--theme-scale-factor)) | Base scalable dimension; responsive contexts may apply an additional factor. |

### Published utility and component classes

[Official reference](https://unpkg.com/@visa/nova-styles@1.6.5/data.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| v-flex | Flex layout | Parent required for gap examples. |
| v-gap-20 | Gap utility | Shown in the official default-gap example. |
| v-col-gap-20 | Column gap utility | Separates columns. |
| v-button | Primary button | Use a native button element. |
| v-button-secondary | Secondary modifier | Supporting Reset action in the specimen. |
| v-radio | Native radio style | Retain shared name and distinct values. |
| v-label | Label style | Keep an associated label or wrapping label. |
| v-alternate | Alternate palette context | Shown on a surface or button. |
| v-typography-headline-1 | Headline visual role | Apply to the semantic h1 in this page. |

### Composition contract

[Official reference](https://design.visa.com/components/radio/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Radio group | One shared name per question | Format and frequency are independent groups. |
| fieldset / legend | Group question | Announce what the options answer. |
| checked | Native selected state | Do not use CSS alone for selection. |
| disabled | Native unavailable state | Retain a visible explanation if unavailable. |
| aria-describedby | Optional supporting description | Connect additional text when not part of the label. |

## Visa Product Design System A preference task with a readable review state

### Make each question independent

The example asks for statement format and summary frequency. Those are separate radio groups: changing the frequency does not deselect the format. The summary repeats both choices before the primary action, so the user can inspect the result without interpreting an icon or a hidden default.

Review preference records a local confirmation only. The page does not request a card number, retrieve an account, generate a statement or change a financial-service setting. This keeps the specimen focused on the design system’s selection and feedback behavior.

[Supporting specification](https://design.visa.com/components/radio/)

## Visa Product Design System Nova styles and the Visa theme are separate imports

### Structure is not the entire theme

The official installation shows styles.css followed by themes/visa/index.css. The first provides the component and utility rules; the second supplies the Visa theme. Loading only one is an incomplete integration. The standalone example and import snippet both preserve that order.

The checked package is version 1.6.5. The specimen embeds its CSS locally so it does not depend on a third-party stylesheet request at viewing time. Remote font-face declarations are removed and the application explicitly uses a system fallback; this is native Nova CSS with a disclosed font substitution, not a claim of exact proprietary-font parity.

[Supporting specification](https://github.com/visa/nova-styles)

## Visa Product Design System Default and alternate palettes carry paired foregrounds

### Do not transplant a fill without its text role

The default/light active color is #1434cb, with #173be8 on hover and #0f2595 when pressed. Its text-on-active role is white. The alternate theme context changes the role mapping, which is why the specimen uses v-alternate on the header surface rather than overriding only its background.

Accent #fcc015 is not a universal button fill. Theme context decides how the accent and active roles are used. The reference table describes the default palette; later dark and alternate definitions in the same stylesheet are not merged into a single misleading set of values.

[Supporting specification](https://unpkg.com/@visa/nova-styles@1.6.5/themes/visa/index.css)

## Visa Product Design System Read the rem scale against the theme root

### A 14-pixel theme root changes familiar rem assumptions

The Visa theme defines a 14-pixel font root. Its headline-1 value of approximately 2.285714rem therefore corresponds to 32 pixels at that root, not the value obtained by assuming a 16-pixel root. Body-1 is approximately 1.142857rem, while body-2 is 1rem.

Scalable size tokens express a pixel quantity multiplied by the theme scale factor. Responsive contexts can introduce a second factor. Keep the expression when adapting spacing to an application; copying only the default computed number loses that relationship. The specimen uses official gap utilities in the frequency controls and original application dimensions for the overall split layout.

[Supporting specification](https://unpkg.com/@visa/nova-styles@1.6.5/styles.css)

## Visa Product Design System Native radio semantics beneath Nova presentation

### A styled circle is not a radio group

The public metadata places v-radio on an actual input type="radio" and pairs it with a label. The preview keeps that native structure and wraps each option’s visible description in its label. Keyboard arrows can move within a group, and the checked state remains available to the browser and assistive technology.

A fieldset and legend name each question. The format options explain their consequences: a PDF is a downloadable sample, while HTML is described as reflowable. The exact product content is original; the control anatomy and classes come from the native library.

- Use one name for the two format options and another for frequency.
- Keep the radio value distinct from the visible prose so the summary can use a stable label.
- Use checked and disabled attributes for state rather than a decorative class alone.

[Supporting specification](https://unpkg.com/@visa/nova-styles@1.6.5/data.json)

## Visa Product Design System Nova CSS styles controls; native HTML owns the choice

### Keep grouping and review logic outside the stylesheet

The specimen uses Nova’s v-radio class on real radio inputs. Shared name attributes make format choices exclusive, while a different name separates the frequency group. Fieldset and legend provide the group context; an associated label makes the complete option text part of the control’s accessible name.

The CSS package does not choose an option, manage application persistence or create a review record. The provided script reads the two native groups and builds a local summary. An edit clears that summary because the previous values no longer describe the current preference.

Keep both the structural stylesheet and the Visa theme in the implementation. The alternate header uses v-alternate, while the form remains in the default color context; do not imitate the header by changing only its background and leaving foreground roles unresolved.

[Supporting specification](https://unpkg.com/@visa/nova-styles@1.6.5/styles.css)

## Visa Product Design System One reading order at every width

### Move the summary without changing the task sequence

On wide screens the choice groups and current-selection summary appear side by side. At small widths the summary follows the form. The original document illustration disappears because it contributes no task information, while all labels, explanations and actions remain.

The CSS library supports modern evergreen browsers. The official development guidance does not promise legacy-browser compatibility, so a production team should test its actual supported versions rather than treating a successful modern preview as universal support.

1. Load the pinned structural CSS and Visa theme, then add application layout styles.
2. Select Accessible HTML and Quarterly, review the preference and verify that both appear in the summary.
3. Change either choice, confirm that review feedback resets, then test Reset and the narrow layout.

[Supporting specification](https://design.visa.com/developing/)

## Component Examples

### Complete Nova CSS preference composition

Two native radio groups update a summary immediately; the primary action creates an explicit local review state.

```html
<!-- index.html after installing @visa/nova-styles@1.6.5 in a Vite vanilla project -->
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Statement preference</title>
<link rel="stylesheet" href="/node_modules/@visa/nova-styles/styles.css">
<link rel="stylesheet" href="/node_modules/@visa/nova-styles/themes/visa/index.css">
<style>:root{font-family:Arial,sans-serif}body{font-family:Arial,sans-serif;background:#fff}*{box-sizing:border-box}.app{max-width:1150px;margin:auto;padding:24px}.hero{padding:32px;display:grid;grid-template-columns:1fr 150px;align-items:center;gap:24px;border-radius:6px}.hero h1{font-family:Arial,sans-serif;font-weight:600;line-height:1.2;margin:12px 0 16px}.hero p{font-family:Arial,sans-serif}.eyebrow{font-size:11px;letter-spacing:.12em;font-weight:600}.paper{width:120px;height:150px;background:white;border-radius:6px;transform:rotate(8deg);padding:20px;box-shadow:8px 8px 0 #0f2595;position:relative}.paper span{display:block;height:3px;background:#1434cb;margin:10px 0;width:70px}.paper span:nth-child(2){width:45px}.paper b{position:absolute;bottom:10px;right:15px;color:#1434cb;font:600 36px Arial}.workspace{display:grid;grid-template-columns:1.5fr 1fr;gap:40px;margin:32px 0}.workspace h2,.workspace legend{font-family:Arial,sans-serif;font-weight:600}.hint{font-size:14px;color:#4a4a4a;line-height:1.5;margin:12px 0 16px}.option{display:flex;gap:16px;padding:20px 16px;border:1px solid #ddd;border-radius:6px;margin:12px 0;cursor:pointer}.option:has(:checked){border:2px solid #1434cb;padding:19px 15px;background:#f6f9ff}.option b{font-size:16px}.option small{display:block;font-size:14px;color:#4a4a4a;line-height:1.5;margin-top:4px}.option .v-radio{flex-shrink:0}.frequency{margin-top:28px}.frequency legend{margin-bottom:16px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.v-button{font-family:Arial,sans-serif}.summary{background:#f5f5f5;padding:24px;border-radius:6px;align-self:start;min-height:285px}.summary h2{margin:16px 0 8px}.rule{height:1px;background:#ddd;margin-top:20px}.status{padding:16px 0;font-size:14px;line-height:1.5}.confirmed{color:#1434cb;font-weight:600}footer{font-size:12px;color:#4a4a4a;border-top:1px solid #ddd;padding-top:16px;line-height:1.5}@media(max-width:650px){.app{padding:16px}.hero{padding:24px;grid-template-columns:1fr}.paper{display:none}.workspace{grid-template-columns:1fr;gap:24px}.hero h1{font-size:28px}.option{padding:16px 12px}.option:has(:checked){padding:15px 11px}}
</style><main class="app"><header class="v-surface v-alternate hero"><div><p class="eyebrow">ACCOUNT PREFERENCES / SAMPLE</p><h1 class="v-typography-headline-1">Choose how you read<br>your statement.</h1><p class="v-typography-body-1">One clear choice, with the details visible before you confirm.</p></div><div class="paper" aria-hidden="true"><span></span><span></span><span></span><b>01</b></div></header><div class="workspace"><form id="form"><fieldset><legend class="v-typography-headline-3">Statement format</legend><p class="hint">This page stores a demonstration preference only.</p><label class="option"><input class="v-radio" type="radio" name="delivery" value="Digital PDF" checked><span><b>Digital PDF</b><small>A downloadable sample statement for offline reading.</small></span></label><label class="option"><input class="v-radio" type="radio" name="delivery" value="Accessible HTML"><span><b>Accessible HTML</b><small>A reflowable sample statement with structured headings.</small></span></label></fieldset><fieldset class="frequency"><legend class="v-typography-headline-3">Summary frequency</legend><div class="v-flex v-gap-16"><label class="v-flex v-align-items-center v-gap-4"><input class="v-radio" type="radio" name="frequency" value="Monthly" checked>Monthly</label><label class="v-flex v-align-items-center v-gap-4"><input class="v-radio" type="radio" name="frequency" value="Quarterly">Quarterly</label></div></fieldset><div class="actions"><button class="v-button" type="submit">Review preference</button><button class="v-button v-button-secondary" id="reset" type="button">Reset</button></div></form><aside class="summary"><p class="eyebrow">YOUR CURRENT SELECTION</p><h2 class="v-typography-headline-3" id="selection">Digital PDF</h2><p id="period">Monthly summary</p><div class="rule"></div><p class="hint">No account data is used. No statement is generated or delivered.</p><p class="status" id="status" role="status">Review your preference to create a local confirmation.</p></aside></div><footer>Nova styles 1.6.5 and Visa theme. The example application styles use a system-font fallback. Original demonstration, no financial service connection.</footer></main>
<script>const form=document.querySelector('#form'),status=document.querySelector('#status');function update(){document.querySelector('#selection').textContent=form.elements.delivery.value;document.querySelector('#period').textContent=form.elements.frequency.value+' summary';status.textContent='Review your preference to create a local confirmation.';status.classList.remove('confirmed')}form.onchange=update;form.onsubmit=e=>{e.preventDefault();status.textContent='Reviewed locally: '+form.elements.delivery.value+', '+form.elements.frequency.value.toLowerCase()+'. No account setting changed.';status.classList.add('confirmed')};document.querySelector('#reset').onclick=()=>{HTMLFormElement.prototype.reset.call(form);update()};</script>
</html>
```

[Code reference](https://unpkg.com/@visa/nova-styles@1.6.5/data.json)

- CSS provides the component presentation; the small script supplies application behavior.
- Changing a preference clears its previous review status.
- The alternate header is a real theme context, not a hand-painted imitation of the palette.
- Save the complete HTML as index.html and open it in a browser with access to the pinned public CSS URLs. The embedded preview in this guide keeps those styles local.

### Load structure and theme together

In a bundled application, import both layers once before the application stylesheet.

```javascript
import '@visa/nova-styles/styles.css';
import '@visa/nova-styles/themes/visa/index.css';
import './application.css';
```

[Code reference](https://github.com/visa/nova-styles)

- A missing theme file can leave structural classes present without the intended Visa tokens.

## Implementation Starting Point

The complete HTML uses the verified styles.css and themes/visa/index.css paths. Both are required. The iframe has these styles embedded locally; official remote font-face declarations are omitted there.

```shell / html
npm create vite@latest statement-preference -- --template vanilla
cd statement-preference
npm install
npm install @visa/nova-styles@1.6.5
# Replace index.html with the complete example below.
npm run dev
```

## Agent Prompt

Build the Visa Nova statement-preference example with the pinned structural and theme CSS. Preserve native radio groups, clear legends and associated labels. Separate default from alternate theme roles, and respect the 14px root when reading rem values. Keep the review local, clear stale confirmation after changes and stack the summary on small screens.

## Sources

- [Nova repository](https://github.com/visa/nova-styles) — Official installation and theme loading.
- [Styles 1.6.5](https://unpkg.com/@visa/nova-styles@1.6.5/styles.css) — Native component rules and scalable dimensions.
- [Visa theme 1.6.5](https://unpkg.com/@visa/nova-styles@1.6.5/themes/visa/index.css) — Exact theme palette and typography.
- [Example metadata](https://unpkg.com/@visa/nova-styles@1.6.5/data.json) — Verified HTML class anatomy.
- [CSS getting started](https://design.visa.com/developing/styles-css/) — Public integration guidance.
- [Browser support](https://design.visa.com/developing/) — Evergreen support boundary.
