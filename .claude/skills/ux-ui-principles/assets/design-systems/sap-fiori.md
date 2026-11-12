# SAP Fiori Design System — OpenDesign Application Guide

Use SAP Fiori’s Horizon theme through UI5 Web Components: real theme parameters, explicit content density, semantic value states, and a purchase-request composition with local validation.

Independent OpenDesign reference. UI5 Web Components example, not a deployed SAP transaction or complete Fiori elements application.

## Source Reference

- **Implementation:** UI5 Web Components ([source](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/))
- **Default theme:** sap_horizon ([source](https://ui5.github.io/webcomponents/docs/advanced/configuration/))
- **Density marker:** data-ui5-compact-size ([source](https://ui5.github.io/webcomponents/docs/advanced/RTL-and-compact-mode/))
- **Theme font:** 72 / 72full ([source](https://raw.githubusercontent.com/SAP/theming-base-content/master/content/Base/baseLib/sap_horizon/base.less))
- **Base font size:** 0.875rem ([source](https://raw.githubusercontent.com/SAP/theming-base-content/master/content/Base/baseLib/sap_horizon/base.less))
- **Input value:** String ([source](https://ui5.github.io/webcomponents/components/Input/))


## Design Reference

Morning Horizon (sap_horizon) source parameters plus current UI5 Web Components documentation. Less @sap names below are source parameters; browser styles use the corresponding --sap custom properties. Protected dimensions are observations, not recommended override points.

### Horizon color roles

[Official reference](https://raw.githubusercontent.com/SAP/theming-base-content/master/content/Base/baseLib/sap_horizon/base.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @sapBrandColor | #0070f2 | Primary brand role. |
| @sapBackgroundColor | #f5f6f7 | Page background. |
| @sapBaseColor | #ffffff | Base surface. |
| @sapTextColor | #131e29 | Primary text. |
| @sapNegativeColor | #aa0808 | Negative state. |
| @sapCriticalColor | #e76500 | Critical role; text has a separate derived role. |
| @sapPositiveColor | #256f3a | Positive state. |
| @sapInformationBackground | #e1f4ff | Informational message surface. |
| @sapWarningBackground | #fff8d6 | Critical message surface. |

### Type and geometry

[Official reference](https://raw.githubusercontent.com/SAP/theming-base-content/master/content/Base/baseLib/sap_horizon/base.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| @sapFontFamily | "72", "72full", Arial, Helvetica, sans-serif | Published font stack. |
| @sapFontSize | 0.875rem | Base size. |
| @sapContent_LineHeight | 1.5 | Content line-height multiplier. |
| @sapElement_Height | 2.25rem | Protected regular dimension. |
| @sapElement_Compact_Height | 1.625rem | Protected compact dimension. |
| @sapElement_LineHeight | 2.75rem | Protected regular line box. |
| @sapElement_Compact_LineHeight | 2rem | Protected compact line box. |
| @sapButton_BorderCornerRadius | 0.5rem | Button corner parameter. |
| @sapContent_FocusWidth | 0.125rem | Focus width. |
| @sapContent_FocusColor | #0032a5 | Focus color. |

### Theme and density setup

[Official reference](https://ui5.github.io/webcomponents/docs/advanced/configuration/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sap_horizon | Morning Horizon | Default theme built into components. |
| sap_horizon_dark | Evening Horizon | Additional theme requires assets. |
| sap_horizon_hcb / sap_horizon_hcw | High contrast black / white | Separate supported high-contrast themes. |
| Assets.js | One import per component library used | Register additional theme assets. |
| setTheme(name) | @ui5/webcomponents-base/dist/config/Theme.js | Change theme through the public API. |

### Select contract

[Official reference](https://ui5.github.io/webcomponents/components/Select/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| ui5-select value | Matches option value or text | Do not mix with option selected flags. |
| selectedOption | Read-only IOption | Read the selected option object. |
| change | event.detail.selectedOption | Finalized selection change. |
| live-change | Navigation preview | Do not treat it as a committed business choice. |
| accessible-name-ref | ID of visible labeling element | Link visible text to the control. |

### Input and feedback

[Official reference](https://ui5.github.io/webcomponents/components/Input/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| value | String | Convert numeric input explicitly. |
| input | Each keystroke | Use for live estimated totals. |
| change | Enter or focusout | Different from per-keystroke input. |
| value-state | None / Negative / Critical / Information / Positive | State names in the current API. |
| slot="valueStateMessage" | One root element | Specific field explanation. |

### Message strip

[Official reference](https://ui5.github.io/webcomponents/components/MessageStrip/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| design | Information / Positive / Critical / Negative | Semantic application message. |
| hide-close-button | Boolean attribute | Keep required explanation visible. |
| default slot | Prefer text content | Avoid turning a strip into a complex panel. |

## SAP Fiori Design System design and UI5 implementation have different scopes

### A concrete entry point

SAP Fiori describes an enterprise user experience. This reference chooses UI5 Web Components for an implementable purchase-request specimen. It does not imply that installing these components creates an SAPUI5 application, a Fiori elements floorplan, or an authorized SAP business transaction.

The main component package provides Input, Select and Button. Higher-order Fiori components live in a separate package. Importing only the modules used in this example keeps the entry point explicit and avoids suggesting an unsupported all-components CDN.

[Supporting specification](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/)

## SAP Fiori Design System Use named Horizon parameters rather than a generic blue palette

### Surface and state roles

Morning Horizon resolves the page to a light gray surface and uses a white base surface. Brand blue and text color are separate parameters. Negative, critical, positive and informative roles describe meaning, not a list of decorative colors to rotate through cards.

The preview uses an information strip for the prepared summary because local preparation is not purchase approval. Its item price, cost centers and approval annotations are original sample data. They should never be interpreted as SAP-provided business rules.

[Supporting specification](https://raw.githubusercontent.com/SAP/theming-base-content/master/content/Base/baseLib/sap_horizon/base.less)

## SAP Fiori Design System Compact is a component setting, not a smaller screenshot

### Apply density to a meaningful region

UI5 supports a compact marker on the root, body, a region, or a component. The attribute data-ui5-compact-size and the ui5-content-density-compact class are public mechanisms. Changing the marker dynamically does not require a separate density API.

Use compact controls for a dense desktop task only when the interaction remains suitable. The embedded interpretation reduces control and row spacing but keeps the same information. Its narrow layout stacks regions rather than shrinking every label and button.

```html
<section data-ui5-compact-size>
  <ui5-input accessible-name="Request title"></ui5-input>
</section>
```

[Code reference](https://ui5.github.io/webcomponents/docs/advanced/RTL-and-compact-mode/)

[Supporting specification](https://ui5.github.io/webcomponents/docs/advanced/RTL-and-compact-mode/)

## SAP Fiori Design System The 72 family and its loading behavior

### Font availability is part of setup

The Horizon theme names 72 and 72full before fallback fonts. UI5 documents how to disable its default font loading and how to host fonts locally. The convenience FontFace.css entry is marked experimental, so pin and recheck its path when choosing that route.

The standalone preview uses Arial as an explicit offline fallback. The native UI5 example uses the published font-family variable. This distinction avoids claiming that a visually similar fallback screenshot is proof that the SAP font assets loaded.

[Supporting specification](https://ui5.github.io/webcomponents/docs/advanced/fonts/)

## SAP Fiori Design System A Select has committed and provisional changes

### Choose one controlled selection strategy

The Select value matches an Option value or text. Mixing a Select value with selected flags on Options is discouraged; a nonexistent value produces no selected option. The example initializes a real cost-center option and reads the Select value when preparing the result.

The change event carries the selected option. live-change also fires while navigating options and reverting with Escape. Use committed selection for business data and reserve provisional changes for previews.

- Import Select and Option registrations before rendering their tags.
- Connect the visible cost-center label through accessible-name-ref.
- Keep value as the single selection strategy in this example.

[Supporting specification](https://ui5.github.io/webcomponents/components/Select/)

## SAP Fiori Design System Numeric input still needs application validation

### Value state and message belong together

The Input value is a string even when the input type is Number. Convert it and check finite integer bounds before multiplying by the sample price. An empty value must not become an accepted zero. The current semantic error state is Negative rather than an invented Error enum.

The valueStateMessage slot supplies one root element containing a specific explanation. The live total listens to input; the prepared summary is updated only when the user activates the action.

1. Read the title and numeric string from their components.
2. Require a title and a whole quantity from 1 to 20 for this specimen.
3. Mark the affected controls Negative and retain their typed values.
4. Prepare the summary only after both conditions pass.

[Supporting specification](https://ui5.github.io/webcomponents/components/Input/)

## SAP Fiori Design System Keep the result descriptive and local

### Use a strip for a concise outcome

MessageStrip supports semantic designs and a close control. A required explanation can hide the close button so it remains available. Its default slot is best kept as text rather than expanded into a form or dashboard.

The summary includes title, quantity, sample total and cost center. Its final sentence explains that nothing was submitted. A real service would replace this local step with an authorized request and a response that carries the actual backend status.

[Supporting specification](https://ui5.github.io/webcomponents/components/MessageStrip/)

## SAP Fiori Design System Theme assets and module registration

### Theme selection needs its corresponding resources

Morning Horizon is the documented default and built into components. Additional themes require the Assets.js module for each library used. Then setTheme can choose Evening Horizon or one of the high-contrast variants. Choosing a dark name without checking loaded resources is not a complete integration.

The provided entry point registers each custom element before creating the markup. Vite handles dynamic ES imports and JSON resources. Compile the native project and verify fonts, theme loading and keyboard behavior separately from the offline HTML specimen.

[Supporting specification](https://ui5.github.io/webcomponents/docs/advanced/configuration/)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Offline HTML interpretation of Morning Horizon parameters and UI5 form composition. Native package example is included separately.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Fiori purchase request</title><style>
*{box-sizing:border-box}body{margin:0;color:#131e29;background:#f5f6f7;font:14px/1.5 Arial,sans-serif}header{background:white;padding:12px 24px;display:flex;gap:16px;align-items:center;border-bottom:1px solid #d5dadd}.symbol{width:32px;height:32px;display:grid;place-items:center;background:#0070f2;color:white;border-radius:8px;font-weight:bold}header strong{font-size:16px}header span:last-child{margin-left:auto;color:#556b82;font-size:12px}main{max-width:1100px;margin:auto;padding:24px}.objecthead{display:flex;justify-content:space-between;gap:20px;align-items:start;margin-bottom:24px}h1{font-size:28px;line-height:36px;margin:0 0 6px}h2{font-size:18px;margin:0 0 16px}.subtitle{color:#556b82;margin:0}.draft{background:#e1f4ff;color:#0032a5;padding:6px 12px;border-radius:6px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px}.panel{background:white;border-radius:12px;padding:24px;border:1px solid #d5dadd}label{display:block;margin-bottom:6px;color:#556b82}input,select{width:100%;height:44px;border:1px solid #758ca4;border-radius:8px;padding:8px 12px;background:#fff;font:inherit;color:inherit}input:focus,select:focus,button:focus-visible{outline:2px solid #0032a5;outline-offset:3px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}.fields>div:first-child{grid-column:1/-1}.line{border-top:1px solid #d5dadd;padding-top:20px;display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:16px;align-items:center}.monitor{background:#e1f4ff;border:2px solid #556b82;height:42px;border-radius:4px;position:relative;margin-bottom:12px}.monitor:after{content:'';position:absolute;bottom:-12px;left:25%;width:50%;height:10px;border-bottom:3px solid #556b82;border-left:8px solid transparent;border-right:8px solid transparent}.line strong{display:block}.line small{color:#556b82}.money{font-size:24px;font-weight:600;white-space:nowrap}.unit{font-size:12px;color:#556b82}.total{display:flex;justify-content:space-between;padding-top:24px;font-weight:600}.controls{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}button{border:1px solid #0070f2;background:white;color:#0057b8;padding:10px 16px;border-radius:8px;font:600 14px/20px Arial;cursor:pointer}button.primary{background:#0070f2;color:white}button:hover{filter:brightness(.95)}.steps{list-style:none;padding:0;margin:0;counter-reset:step}.steps li{position:relative;padding:0 0 24px 36px;color:#556b82}.steps li:before{counter-increment:step;content:counter(step);position:absolute;left:0;top:0;border:1px solid #758ca4;border-radius:50%;width:24px;height:24px;text-align:center;background:white}.steps strong{display:block;color:#131e29}.steps li:first-child:before{background:#e1f4ff;color:#0057b8;border-color:#0070f2}.strip{margin-top:24px;background:#e1f4ff;border:1px solid #0070f2;padding:12px 16px;border-radius:8px}.strip.error{background:#ffeaf4;border-color:#aa0808;color:#aa0808}.foot{font-size:12px;color:#556b82;margin-top:24px}.compact input,.compact select{height:32px;padding:4px 8px}.compact .fields{gap:12px}.compact .panel{padding:16px}.compact .line{padding-top:12px}.compact button{padding:6px 12px}.hint{font-size:12px;color:#556b82;margin:6px 0 0}@media(max-width:700px){main{padding:20px 16px}.layout{grid-template-columns:1fr}.fields{grid-template-columns:1fr}.objecthead{display:block}.draft{display:inline-block;margin-top:12px}.line{grid-template-columns:48px minmax(0,1fr)}.line>.money{grid-column:2}.panel{padding:20px}header{padding:12px 16px}}
</style><header><span class="symbol">P</span><strong>Procurement workspace</strong><span>Sample environment</span></header><main><div class="objecthead"><div><h1>Purchase request</h1><p class="subtitle">PR-DRAFT · Workplace equipment</p></div><span class="draft">Draft · not submitted</span></div><div class="layout"><section class="panel"><h2>Request details</h2><form id="form" novalidate><div class="fields"><div><label for="title">Request title</label><input id="title" placeholder="e.g. Studio display upgrade" aria-describedby="notice"></div><div><label for="team">Cost center</label><select id="team"><option value="Design · CC-240">Design · CC-240</option><option value="Research · CC-360">Research · CC-360</option></select></div><div><label for="qty">Monitor quantity</label><input id="qty" type="number" min="1" max="20" step="1" value="2" aria-describedby="qty-help notice"><p id="qty-help" class="hint">Whole number from 1 to 20.</p></div></div><div class="line"><div class="monitor" aria-hidden="true"></div><div><strong>27-inch studio monitor</strong><small>Equipment · Item 100240</small></div><div class="money">€320 <span class="unit">/ unit</span></div></div><div class="total"><span>Estimated line total</span><output id="total">€640</output></div><div class="controls"><button class="primary">Prepare summary</button><button type="button" id="density" aria-pressed="false">Compact controls</button></div></form></section><aside class="panel"><h2>Request path</h2><ol class="steps"><li><strong>Prepare draft</strong>Check quantities and cost center.</li><li><strong>Review summary</strong>Confirm the local request details.</li><li><strong>Submit to service</strong>Not connected in this preview.</li></ol><p class="hint">The review path and price are illustrative application data.</p></aside></div><div class="strip" id="notice" role="status">Complete the draft before preparing the summary.</div><p class="foot">HTML interpretation of SAP Morning Horizon · UI5 native integration provided in guide · No SAP transaction created</p></main><script>
const $=id=>document.getElementById(id);function amount(){const n=Number($('qty').value);return Number.isInteger(n)&&n>=1&&n<=20?n:null}$('qty').oninput=()=>{$('total').textContent=amount()===null?'Invalid quantity':'€'+amount()*320};$('density').onclick=()=>{const active=document.body.classList.toggle('compact');$('density').setAttribute('aria-pressed',String(active));$('density').textContent=active?'Cozy controls':'Compact controls'};$('form').onsubmit=e=>{e.preventDefault();const title=$('title').value.trim(),n=amount();$('title').setAttribute('aria-invalid',String(!title));$('qty').setAttribute('aria-invalid',String(n===null));$('notice').classList.toggle('error',!title||n===null);if(!title||n===null){$('notice').textContent=!title?'Enter a title for this request.':'Use a whole quantity from 1 to 20.';(!title?$('title'):$('qty')).focus();return}$('notice').textContent='Local summary: '+title+' · '+n+' monitors · €'+n*320+' · '+$('team').value+'. Nothing submitted.'};
</script></html>

```

[Code reference](https://raw.githubusercontent.com/SAP/theming-base-content/master/content/Base/baseLib/sap_horizon/base.less)

- The density switch in this HTML document is an interpretation. The UI5 entry demonstrates the real compact marker, registered custom elements and Horizon assets.

### Horizon purchase request with validated quantities

Input, Select/Option, Button and MessageStrip compose a local requisition summary. Per-keystroke totals remain separate from the prepared result.

```javascript
// main.js in a Vite vanilla project. index.html contains <div id="app"></div>.
import '@ui5/webcomponents/dist/Button.js';
import '@ui5/webcomponents/dist/Input.js';
import '@ui5/webcomponents/dist/Select.js';
import '@ui5/webcomponents/dist/Option.js';
import '@ui5/webcomponents/dist/MessageStrip.js';
import '@ui5/webcomponents/dist/Assets.js';
import {setTheme} from '@ui5/webcomponents-base/dist/config/Theme.js';
setTheme('sap_horizon');
document.querySelector('#app').innerHTML = `
  <main style="max-width:800px;margin:auto;padding:24px;font-family:var(--sapFontFamily)">
    <h1>Purchase request</h1>
    <p>Prepare a local requisition summary. No SAP transaction is created.</p>
    <p id="request-label">Request title</p>
    <ui5-input id="title" accessible-name-ref="request-label" required>
      <span slot="valueStateMessage">Enter a title for this request.</span>
    </ui5-input>
    <p id="team-label">Cost center</p>
    <ui5-select id="team" accessible-name-ref="team-label" value="design">
      <ui5-option value="design">Design · CC-240</ui5-option>
      <ui5-option value="research">Research · CC-360</ui5-option>
    </ui5-select>
    <p id="qty-label">Monitor quantity</p>
    <ui5-input id="qty" type="Number" accessible-name-ref="qty-label" value="2">
      <span slot="valueStateMessage">Use a whole number from 1 to 20.</span>
    </ui5-input>
    <p id="total">Estimated line total: €640</p>
    <ui5-button id="prepare" design="Emphasized">Prepare summary</ui5-button>
    <ui5-button id="density">Toggle compact controls</ui5-button>
    <ui5-message-strip id="notice" design="Information" hide-close-button style="display:block;margin-top:24px">
      Complete the draft before preparing the summary.
    </ui5-message-strip>
  </main>`;
const title=document.querySelector('#title'),qty=document.querySelector('#qty');
qty.addEventListener('input',()=>{
  const n=Number(qty.value);
  document.querySelector('#total').textContent=Number.isInteger(n)&&n>=1&&n<=20
    ? `Estimated line total: €${n*320}` : 'Enter a valid quantity to calculate the total.';
});
document.querySelector('#prepare').addEventListener('click',()=>{
  const n=Number(qty.value), validTitle=!!title.value.trim(), validQty=Number.isInteger(n)&&n>=1&&n<=20;
  title.valueState=validTitle?'None':'Negative';qty.valueState=validQty?'None':'Negative';
  const notice=document.querySelector('#notice');
  if(!validTitle||!validQty){notice.design='Negative';notice.textContent='Correct the request title or quantity before continuing.';return;}
  notice.design='Information';
  notice.textContent=`Local summary: ${title.value.trim()}, ${n} monitors, €${n*320}, ${document.querySelector('#team').value}. Nothing submitted.`;
});
document.querySelector('#density').addEventListener('click',()=>document.body.toggleAttribute('data-ui5-compact-size'));
```

[Code reference](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/)

- The quantity rule, €320 item price and cost centers are invented application data, not SAP policy.
- UI5 Web Components are one implementation of Fiori patterns; this is not a complete SAPUI5 application or Fiori elements floorplan.
- No SAP transaction is created. Native dependency compilation is not implied by offline preview validation.

## Implementation Starting Point

Replace the Vite main.js with the full example. UI5 documentation expects an ES module bundler; it does not provide an official all-components CDN.

```bash
npm create vite@latest fiori-request -- --template vanilla
cd fiori-request
npm install
npm install @ui5/webcomponents @ui5/webcomponents-base
npm run dev
```

## Agent Prompt

Compose a Fiori purchase request using UI5 Web Components Input, Select, Button and MessageStrip with Horizon theme. Preserve numeric validation, correct Negative value state, explicit compact density and honest local summary behavior.

## Sources

- [First steps](https://ui5.github.io/webcomponents/docs/getting-started/first-steps/) — Official package and bundler setup.
- [Horizon source](https://raw.githubusercontent.com/SAP/theming-base-content/master/content/Base/baseLib/sap_horizon/base.less) — Theme parameter snapshot.
- [Configuration](https://ui5.github.io/webcomponents/docs/advanced/configuration/) — Theme names and asset loading.
- [Density](https://ui5.github.io/webcomponents/docs/advanced/RTL-and-compact-mode/) — Compact markers and RTL.
- [Fonts](https://ui5.github.io/webcomponents/docs/advanced/fonts/) — 72 loading and local font guidance.
- [Input](https://ui5.github.io/webcomponents/components/Input/) — Value states and input events.
- [Select](https://ui5.github.io/webcomponents/components/Select/) — Selection strategies and events.
- [MessageStrip](https://ui5.github.io/webcomponents/components/MessageStrip/) — Semantic message anatomy.
- [Button source](https://raw.githubusercontent.com/SAP/ui5-webcomponents/main/packages/main/src/Button.ts) — Native button implementation.
