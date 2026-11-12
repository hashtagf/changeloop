# Backbase Design System — OpenDesign Application Guide

Build a branded banking review flow with Backbase’s Angular modules, semantic theme export, and explicit review states. Compare web APIs with separately documented native dimensions.

Backbase package access requires an authorized repository account. The browser preview is independent HTML, not Backbase Angular. Its blue palette follows published default button colors; panel spacing and illustration are application choices. Native dimensions below are labeled by platform.

## Source Reference

- **Web package:** @backbase/ui-ang ([source](https://designsystem.backbase.com/latest/getting-started/installation/web-CUY99MQ3-CUY99MQ3))
- **Package access:** Authorized repo.backbase.com account ([source](https://designsystem.backbase.com/latest/getting-started/installation/web-CUY99MQ3-CUY99MQ3))
- **Web button:** button[bbButton] ([source](https://designsystem.backbase.com/latest/components/web/button-rc5AvJme))
- **Button default type:** button ([source](https://designsystem.backbase.com/latest/components/web/button-rc5AvJme))
- **Header title:** Semantic h2 ([source](https://designsystem.backbase.com/latest/components/web/mode-header-OzvKV5Zj))
- **Theme creation:** Backbase Visualizer ([source](https://designsystem.backbase.com/latest/theming/global-branding-QaOcQsRp))


## Design Reference

Public Backbase latest documentation. Web code targets @backbase/ui-ang; native values are explicitly separated and must not be treated as Angular CSS variables. Custom customer themes may replace defaults.

### Angular button inputs

[Official reference](https://designsystem.backbase.com/latest/components/web/button-rc5AvJme)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Selector | button[bbButton] | Native button semantics with Backbase styling. |
| buttonSize | sm \| md; default md | Choose a documented size. |
| color | primary \| secondary \| tertiary \| link-text \| success \| danger \| neutral \| dark | Visual and semantic variants. |
| type | button by default | Set submit explicitly inside a form. |
| block | false | true fills the parent width. |
| circle | false | Only for an icon without text. |

### Mode header anatomy

[Official reference](https://designsystem.backbase.com/latest/components/web/mode-header-OzvKV5Zj)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| title | string | Main h2 title. |
| secondaryTitle | string | Context line. |
| reverseTitleOrder | true | Controls title ordering. |
| showCloseButton | true | Set false for a persistent page header. |
| closeButtonAriaLabel | string | Name the close action. |
| close | EventEmitter<void> | Connect to an actual exit handler. |
| mode-header-utility-area | Projected content | Place contextual actions in the header. |

### Published default button colors

[Official reference](https://designsystem.backbase.com/latest/components/android/button/jetpack-compose-WIvwEPYT)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| primary / default background | #295eff | Default documented palette, not a universal customer brand. |
| primary / hovered background | #2049c6 | Hover state. |
| primary / pressed background | #152f80 | Pressed state. |
| primary / foreground | #ffffff | Text on primary. |
| secondary / default background | transparent | Brand border and foreground. |
| secondary / pressed background | #dee2ff | Subtle surface. |
| danger / default background | #bf2310 | Destructive intent, not review. |
| disabled / background | #ccd5df | Pair with disabled behavior. |

### UIKit dimensions, not web variables

[Official reference](https://designsystem.backbase.com/latest/components/i-os/button/ui-kit-KEp4q4lA)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| theme.radius.button.default | 99 | Pill shape in the UIKit token table. |
| theme.height.button.sm | 32 | Native small height. |
| theme.height.button.md | 44 | Native medium height. |
| theme.padding-x.button.sm | 16 | Native horizontal inset. |
| theme.padding-x.button.md | 24 | Native horizontal inset. |
| theme.border-width.button.default | 1 | Native border width. |
| Button typeface | preferredFont(.body, .semibold) | Uses the native font system. |

### Web theme delivery

[Official reference](https://designsystem.backbase.com/latest/theming/applying-theme/web-0gWHJbYT)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Theme source | Visualizer export | Copy web/default into project styles. |
| Font family source | styles/default/variables/_font-family.scss | Match @font-face family names. |
| Root sizing | 16px optimal; supported up to 32px | Rem-based theme dimensions. |
| Logo variants | light/dark × small/big | Supply each required asset; do not stretch one logo. |

## Backbase Design System A banking system with customer branding

### Theme the journey, not isolated buttons

Backbase’s Visualizer exposes a supported set of brand primitives and exports a theme for web, iOS and Android. A customer can change heading and body families and propagate branding through component and journey styles.

The specimen is an internal account-to-account review. Account identifiers and amounts are fictional. The visual structure deliberately distinguishes editable draft fields from the final local review, instead of implying that a click has moved money.

[Supporting specification](https://designsystem.backbase.com/latest/theming/global-branding-QaOcQsRp)

## Backbase Design System Customer themes must reach each platform correctly

### A Visualizer export is more than a brand hex

The Visualizer produces separate web, iOS and Android output. For web, the exported default directory carries Sass design tokens and the logos directory carries the brand assets. Apply that web output through the project stylesheet instead of copying native JSON dimensions into Angular overrides.

The web theming instructions require light and dark logos in both small and big variants. Font files are supplied separately, and their @font-face family names must match the exported font-family configuration. This keeps a banking journey’s headings, controls and branding aligned under the same customer theme.

The review specimen intentionally stops at an application-owned draft: changing destination or amount clears the previous result. That behavior is separate from theme export and does not imply payment execution or a bank-specific validation policy.

[Supporting specification](https://designsystem.backbase.com/latest/theming/applying-theme/web-0gWHJbYT)

## Backbase Design System Follow the exported semantic theme

### Keep platform values in their own context

The reference table includes default button colors and a separate UIKit dimensions group. A native theme.height.button.md value is not a CSS variable to paste into an Angular app. Web implementations should consume the exported styles or installed SCSS.

The preview uses the documented default primary blue and secondary tint. Its overall panel padding, summary artwork and responsive two-column split are application choices, clearly separated from official tokens.

[Supporting specification](https://designsystem.backbase.com/latest/components/android/button/jetpack-compose-WIvwEPYT)

## Backbase Design System Load the selected brand fonts

### A family name does not provide the asset

The web theming guide requires font files to be supplied separately. The @font-face family must agree with the exported $font-family configuration. The example font in documentation is not a required global Backbase typeface.

The theme uses rem units and documents 16 px as an optimal root, with support up to 32 px. Test the complete review at enlarged text sizes. Our standalone browser interpretation uses system fonts and avoids pretending that customer fonts are available.

[Supporting specification](https://designsystem.backbase.com/latest/theming/applying-theme/web-0gWHJbYT)

## Backbase Design System Compose the mode header and button bar

### Project real actions into a contextual header

ModeHeaderModule provides a contextual title with an optional secondary line and close control. The example sets showCloseButton to false because the specimen has no external route to close. The reset button uses the mode-header-utility-area projection slot.

ButtonModule enhances a native button through bbButton. Set color to a documented role and use buttonSize sm or md. A circle button is reserved for an icon-only control; it is inappropriate for the written review action.

- Use primary for the single local review action.
- Use secondary for the reversible reset action.
- Keep account names and amounts in a definition list, not decorative button labels.

[Supporting specification](https://designsystem.backbase.com/latest/components/web/button-rc5AvJme)

## Backbase Design System A summary that survives a narrow screen

### Preserve reading order

The original illustration shows two account surfaces connected by a directional path. It supports the transfer relationship without becoming a second action. On small screens the decorative account diagram is omitted while all account text remains visible.

The editor precedes the review output in DOM order. Native labels, field errors and a status region remain available to keyboard and screen-reader users. No hover-only details are required to understand the amount or destination.

[Supporting specification](https://designsystem.backbase.com/latest/guides/custom-icons-on-web-HM1dEzeo)

## Backbase Design System Connect the authorized Angular environment

### Install styles and modules together

The official web setup requires repository access and separately imports the global Backbase SCSS. Importing only ButtonModule does not supply the complete visual environment. The standalone example can be mounted in an existing Angular application once its package and styles are configured.

1. Use your authorized repo.backbase.com account and the Angular/Node combination required by the selected release.
2. Install @backbase/ui-ang and add its global SCSS to the stylesheet already configured in angular.json.
3. Import ButtonModule and ModeHeaderModule in the consuming component, then mount the complete example and verify its reset/review cycle.

[Supporting specification](https://designsystem.backbase.com/latest/getting-started/installation/web-CUY99MQ3-CUY99MQ3)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent responsive HTML interpretation with published default button colors; application-specific form and layout. Not Backbase Angular runtime.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Transfer review</title><style>*{box-sizing:border-box}body{margin:0;color:#172b4d;background:#f3f5fa;font:16px/1.5 system-ui}header{background:white;border-bottom:1px solid #dce2ee;padding:24px 5%;display:flex;justify-content:space-between;gap:20px;align-items:center}h1{font-size:28px;margin:0}small{color:#566781}button{border:0;border-radius:99px;background:#295eff;color:white;min-height:44px;padding:10px 24px;font:600 15px system-ui;cursor:pointer}button:hover{background:#2049c6}button:active{background:#152f80}.secondary{background:white;border:1px solid #295eff;color:#295eff}.secondary:hover{background:#dee2ff}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #152f80;outline-offset:3px}main{display:grid;grid-template-columns:1.15fr 1fr;gap:40px;padding:36px 5%}.panel{background:white;border:1px solid #dce2ee;border-radius:16px;padding:28px}h2{font-size:20px;margin:0 0 20px}label{display:block;font-weight:600;font-size:14px;margin:20px 0 8px}input,select{width:100%;min-height:48px;border:1px solid #8090aa;border-radius:8px;padding:10px 12px;color:inherit;font:16px system-ui;background:white}p{font-size:14px;color:#566781}.from{padding:16px;background:#f3f5fa;border-radius:8px;font-size:14px}.from strong{display:block;font-size:17px}.review{width:100%;margin-top:18px}#error{color:#bf2310;margin:8px 0;min-height:21px}#result{padding:18px;border-left:4px solid #295eff;background:#edf2ff;margin-top:22px}#result:empty{display:none}svg{width:100%;max-height:200px}aside{padding:20px 10px}aside h2{font-size:24px;margin-top:24px}footer{padding:0 5% 22px;font-size:11px;color:#566781}@media(max-width:650px){header{align-items:flex-start;padding:20px;flex-wrap:wrap}h1{font-size:25px}main{grid-template-columns:1fr;padding:20px;gap:0}.panel{padding:20px}aside{padding:24px 0}svg{display:none}}</style><header><div><small>Accounts / Internal transfer</small><h1>Review your transfer</h1></div><button class="secondary" id="reset">Reset draft</button></header><main><section class="panel"><h2>Transfer details</h2><div class="from">From<strong>Everyday account · 2048</strong>Fictional account</div><form novalidate><label for="destination">To account</label><select id="destination"><option>Travel savings · 9012</option><option>Emergency savings · 3046</option></select><label for="amount">Amount in USD</label><input id="amount" value="120.00" inputmode="decimal" aria-describedby="error" autocomplete="off"><div id="error" role="alert"></div><button class="review" type="submit">Review details</button></form><div id="result" role="status"></div></section><aside><svg viewBox="0 0 360 190" aria-hidden="true"><rect x="10" y="15" width="205" height="120" rx="16" fill="#295eff"/><path d="M35 48H80M35 72H145" stroke="white" stroke-width="8" opacity=".7"/><rect x="143" y="76" width="205" height="110" rx="16" fill="#dee2ff" stroke="#295eff"/><path d="M168 106H213M168 130H278" stroke="#295eff" stroke-width="8"/><circle cx="254" cy="40" r="24" fill="white" stroke="#295eff"/><path d="M244 40H264M256 32L264 40L256 48" fill="none" stroke="#295eff" stroke-width="3"/></svg><h2>A clear check before<br>the next step.</h2><p>Review the destination and amount together. Editing either detail clears the previous review.</p><p><strong>Local demonstration.</strong> No account connection, balance check or payment submission takes place.</p></aside></main><footer>Independent Backbase interpretation · default button palette · system font fallback</footer><script>const form=document.querySelector('form'),amount=document.querySelector('#amount'),destination=document.querySelector('#destination'),error=document.querySelector('#error'),result=document.querySelector('#result');function clear(){result.textContent='';error.textContent='';amount.removeAttribute('aria-invalid')}form.oninput=clear;form.onchange=clear;form.onsubmit=e=>{e.preventDefault();clear();const s=amount.value.trim();if(!/^\d+(\.\d{1,2})?$/.test(s)||Number(s)<=0||!Number.isFinite(Number(s))){error.textContent='Enter a positive amount with up to two decimal places.';amount.setAttribute('aria-invalid','true');amount.focus();return}result.textContent='Reviewed locally: '+new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(s))+' to '+destination.value+'. No transfer submitted.'};document.querySelector('#reset').onclick=()=>{form.reset();clear()};</script></html>

```

[Code reference](https://designsystem.backbase.com/latest/components/web/button-rc5AvJme)

- The amount and destination are fictional. This HTML form has no banking connection; the Angular ModeHeader and bbButton example needs authorized Backbase package access.

### Mode header plus a local review action

A standalone Angular component using two real Backbase modules, projected reset action and explicit local state.

```typescript
// transfer-review.component.ts — in an authorized Backbase Angular application
import { Component } from '@angular/core';
import { ButtonModule } from '@backbase/ui-ang/button';
import { ModeHeaderModule } from '@backbase/ui-ang/mode-header';

@Component({
  selector: 'app-transfer-review',
  standalone: true,
  imports: [ButtonModule, ModeHeaderModule],
  template: `
    <bb-mode-header-ui title="Review transfer" secondaryTitle="Local demonstration"
      [showCloseButton]="false">
      <button bbButton color="secondary" mode-header-utility-area
        (click)="reviewed = false">Reset review</button>
    </bb-mode-header-ui>
    <dl><dt>From</dt><dd>Everyday account · 2048</dd>
      <dt>To</dt><dd>Travel savings · 9012</dd>
      <dt>Amount</dt><dd>USD 120.00</dd></dl>
    <p>No money is moved by this example.</p>
    <div class="bb-button-bar">
      <button bbButton class="bb-button-bar__button" [disabled]="reviewed"
        (click)="reviewed = true">Mark as reviewed</button>
    </div>
    <p role="status">{{ reviewed ? 'Reviewed locally. No transfer submitted.' : 'Check the account details.' }}</p>
  `
})
export class TransferReviewComponent { reviewed = false; }

```

[Code reference](https://designsystem.backbase.com/latest/components/web/mode-header-OzvKV5Zj)

- Requires the installed Backbase package and global SCSS, not public npm access alone.
- button[bbButton] supplies the directive. ModeHeaderModule supplies bb-mode-header-ui.
- The review flag has no payment side effect. In a real transfer flow, submission must be a separate confirmed application operation.

## Implementation Starting Point

Use the release compatibility required by your licensed project. Ensure angular.json includes the global stylesheet. Older Angular 17 / ui-ang 11 setups have a documented esbuild restriction; ui-ang 12+ supports esbuild. This guide does not provide registry credentials.

```bash / scss
# First obtain authorized npm access to repo.backbase.com.
# The linked installation guide specifies Node 20.11.1 and Angular 18+.
npm install --save @backbase/ui-ang

// At the top of the Angular application global styles.scss:
@import "@backbase/ui-ang/scss/main";
```

## Agent Prompt

Create a Backbase Angular transfer review using real ButtonModule and ModeHeaderModule imports. Load authorized package styles and the customer theme. Keep platform-specific tokens separate. Validate application data, clear stale review on edits, and never present a local specimen as a submitted payment.

## Sources

- [Web installation](https://designsystem.backbase.com/latest/getting-started/installation/web-CUY99MQ3-CUY99MQ3) — Registry, Angular and stylesheet setup.
- [Web Button](https://designsystem.backbase.com/latest/components/web/button-rc5AvJme) — Directive inputs and action grouping.
- [Web Mode Header](https://designsystem.backbase.com/latest/components/web/mode-header-OzvKV5Zj) — Title, close event and content projection.
- [Apply a web theme](https://designsystem.backbase.com/latest/theming/applying-theme/web-0gWHJbYT) — Exported styles, font assets and rem sizing.
- [Global branding](https://designsystem.backbase.com/latest/theming/global-branding-QaOcQsRp) — Visualizer and customer branding.
- [UIKit Button](https://designsystem.backbase.com/latest/components/i-os/button/ui-kit-KEp4q4lA) — Native token aliases and dimensions.
- [Compose Button](https://designsystem.backbase.com/latest/components/android/button/jetpack-compose-WIvwEPYT) — Default button palette and Compose properties.
- [Web icons](https://designsystem.backbase.com/latest/guides/custom-icons-on-web-HM1dEzeo) — Material icon font replacement.
