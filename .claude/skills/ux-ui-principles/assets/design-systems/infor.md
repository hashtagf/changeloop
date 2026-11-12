# Infor Design System — OpenDesign Application Guide

Compose an enterprise maintenance form with real IDS input states, theme aliases and an exact asset identifier. Inspect the current public theme tokens, a pinned Web Components package and a local draft workflow with validation and reset.

Independent OpenDesign guide. The asset and workflow are fictional; nothing is submitted. Native code references the checked 1.17.1 package while token values are identified as a separate live core/light theme snapshot.

## Source Reference

- **Design language:** SoHo ([source](https://design.infor.com/))
- **Native package:** ids-enterprise-wc 1.17.1 ([source](https://unpkg.com/ids-enterprise-wc@1.17.1/package.json))
- **Module entry:** enterprise-wc.js ([source](https://unpkg.com/ids-enterprise-wc@1.17.1/package.json))
- **Default type family:** Source Sans Pro ([source](https://latest.wc.design.infor.com/ids-personalize/token-table.html))
- **Validation method:** checkValidation(): void ([source](https://unpkg.com/ids-enterprise-wc@1.17.1/components/ids-input/ids-input.d.ts))
- **Theme reference:** Core, Dark and Contrast ([source](https://latest.wc.design.infor.com/ids-personalize/token-table.html))


## Design Reference

The public Infor token-table theme stylesheet read on this repair pass, plus published ids-enterprise-wc 1.17.1 and official input/button examples. The latest token-table URL is a live snapshot rather than a package-version guarantee.

### Theme roles

[Official reference](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ids-color-action-default | var(--ids-color-blue-60) | Semantic alias from the public core/light theme. |
| --ids-color-action-stronger | var(--ids-color-blue-70) | Semantic alias from the public core/light theme. |
| --ids-color-background-default | var(--ids-color-white-100) | Semantic alias from the public core/light theme. |
| --ids-color-foreground-default-default | var(--ids-color-neutral-100) | Semantic alias from the public core/light theme. |
| --ids-color-foreground-default-secondary | var(--ids-color-neutral-80) | Semantic alias from the public core/light theme. |
| --ids-color-border-default | var(--ids-color-neutral-60) | Semantic alias from the public core/light theme. |
| --ids-color-border-weak | var(--ids-color-neutral-40) | Semantic alias from the public core/light theme. |

### Resolved primitive values

[Official reference](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ids-color-blue-60 | #0072ed | Public theme primitive; do not assume the same value in dark or contrast mode. |
| --ids-color-blue-70 | #0066d4 | Public theme primitive; do not assume the same value in dark or contrast mode. |
| --ids-color-neutral-100 | #161618 | Public theme primitive; do not assume the same value in dark or contrast mode. |
| --ids-color-neutral-80 | #3b3b3f | Public theme primitive; do not assume the same value in dark or contrast mode. |
| --ids-color-neutral-60 | #6f6f76 | Public theme primitive; do not assume the same value in dark or contrast mode. |
| --ids-color-neutral-10 | #f5f5f5 | Public theme primitive; do not assume the same value in dark or contrast mode. |
| --ids-color-red-60 | #da1217 | Public theme primitive; do not assume the same value in dark or contrast mode. |

### Spacing aliases

[Official reference](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ids-space-2xs | var(--ids-space-04) | Use the alias in custom application spacing. |
| --ids-space-xs | var(--ids-space-08) | Use the alias in custom application spacing. |
| --ids-space-sm | var(--ids-space-16) | Use the alias in custom application spacing. |
| --ids-space-md | var(--ids-space-24) | Use the alias in custom application spacing. |
| --ids-space-lg | var(--ids-space-32) | Use the alias in custom application spacing. |
| --ids-space-xl | var(--ids-space-40) | Use the alias in custom application spacing. |
| --ids-space-2xl | var(--ids-space-48) | Use the alias in custom application spacing. |

### Spacing values

[Official reference](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ids-space-04 | 4px | Concrete scale value from the token stylesheet. |
| --ids-space-08 | 8px | Concrete scale value from the token stylesheet. |
| --ids-space-16 | 16px | Concrete scale value from the token stylesheet. |
| --ids-space-24 | 24px | Concrete scale value from the token stylesheet. |
| --ids-space-32 | 32px | Concrete scale value from the token stylesheet. |
| --ids-space-40 | 40px | Concrete scale value from the token stylesheet. |
| --ids-space-48 | 48px | Concrete scale value from the token stylesheet. |

### Typography

[Official reference](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ids-font-family-sans | source sans pro | Typography reference; font files require separate loading. |
| --ids-font-family-mono | source code pro | Typography reference; font files require separate loading. |
| --ids-font-size-default | var(--ids-font-size-sm) | Typography reference; font files require separate loading. |
| --ids-font-size-sm | var(--ids-font-size-40) | Typography reference; font files require separate loading. |
| --ids-font-size-30 | 14px | Typography reference; font files require separate loading. |
| --ids-font-size-40 | 16px | Typography reference; font files require separate loading. |
| --ids-font-size-50 | 20px | Typography reference; font files require separate loading. |
| --ids-font-size-60 | 24px | Typography reference; font files require separate loading. |

### Radius aliases

[Official reference](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ids-border-radius-xs | var(--ids-border-radius-04) | The alias references a primitive; avoid assuming every control uses the largest radius. |
| --ids-border-radius-sm | var(--ids-border-radius-08) | The alias references a primitive; avoid assuming every control uses the largest radius. |
| --ids-border-radius-md | var(--ids-border-radius-16) | The alias references a primitive; avoid assuming every control uses the largest radius. |
| --ids-border-radius-lg | var(--ids-border-radius-24) | The alias references a primitive; avoid assuming every control uses the largest radius. |
| --ids-border-radius-circle | var(--ids-border-radius-99) | The alias references a primitive; avoid assuming every control uses the largest radius. |

### Input and button anatomy

[Official reference](https://latest.wc.design.infor.com/ids-input/example.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| label | Visible input label | Use for field identity, not placeholder alone. |
| validate | required / email required | Documented validation rules. |
| readonly | true | Preserve a readable, non-editable asset identifier. |
| disabled | true | Separate unavailable input state. |
| clearable | true | Field-level clear affordance. |
| dirty-tracker | true | Optional tracking of changed values. |
| text-align | start \| center \| end | Logical alignment for text or numeric presentation. |

### Action hierarchy

[Official reference](https://latest.wc.design.infor.com/ids-button/example.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| appearance | primary | Prepare the local draft. |
| appearance | secondary | Clear draft as a supporting action. |
| appearance | tertiary | Lower emphasis alternative. |
| appearance | primary-destructive / tertiary-destructive | For actual destructive intent, not a routine cancel. |
| disabled | Boolean attribute | Native component unavailable state. |

## Infor Design System An enterprise form with stable record identity

### Keep the equipment identifier separate from the editable request

Infor names SoHo as its design language and positions IDS around enterprise roles and productivity. The specimen applies that emphasis to a maintenance request: the asset identifier stays fixed, while the work summary, contact and urgency are the editable task information.

The ID 02006 is deliberately a string. Converting it to a number would lose the leading zero and change its identity. The native IDS example uses a readonly input so the record context remains visible without looking like a missing or unavailable field.

[Supporting specification](https://design.infor.com/)

## Infor Design System Theme aliases resolve through primitives

### Use the alias for its job

The captured public theme defines action-default through blue-60, default foreground through neutral-100 and secondary foreground through neutral-80. This two-layer structure makes a custom form consistent with its theme without duplicating literal colors across the application.

The public token page offers Core, Dark and Contrast modes. The values in this guide are from its core/light stylesheet snapshot. The preview does not claim that a blue hex value is universal across all three modes; a production component should consume its semantic alias and let the selected theme resolve it.

[Supporting specification](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

## Infor Design System A concrete scale without a fabricated density system

### Space, typography and radius have distinct alias sets

Spacing aliases include xs at the 8-pixel primitive, sm at 16, md at 24 and lg at 32. The supplied native CSS uses md for the main inset and sm between fields. This makes the intent visible in source while retaining concrete values in the reference table.

The default font family is Source Sans Pro, with Source Code Pro for monospace. The font-size-default alias leads to the 16-pixel scale entry. Loading the library does not remove the need to provide the font assets described by the package README. The offline preview uses an ordinary fallback instead.

Radius names are separate from spacing names: radius-sm resolves to 8 pixels while space-sm resolves to 16. Reusing a remembered number just because both names end in sm produces the wrong result.

[Supporting specification](https://latest.wc.design.infor.com/ids-personalize/token-table.html)

## Infor Design System Input states that carry different meanings

### Readonly, disabled and dirty are not interchangeable

The official examples expose readonly, disabled, dirty-tracker, clearable, uppercase, lowercase and logical text alignment. The request example needs only readonly for asset identity and clearable for the work summary. It does not enable automatic casing on an email or silently transform a free-text description.

The native input example declares validate="email required" for the contact field. The published type declaration provides value, focus() and checkValidation(). Because checkValidation returns void, the code does not mistake it for a Boolean form-valid result; it separately checks the conditions that permit preparing the local record.

- Readonly keeps a fixed asset visible and readable.
- Disabled means the field cannot currently be used.
- Dirty tracking describes divergence from an initial value; it is not a success or validation state.

[Supporting specification](https://latest.wc.design.infor.com/ids-input/example.html)

## Infor Design System Dirty tracking and validation have different contracts

### Track edits without treating them as valid data

The official IDS input gallery demonstrates dirty-tracker="true" on an input with an initial value. Dirty tracking concerns edits to a field; it is separate from the validate attribute, whose email and required rules describe acceptable input. A changed contact field can still contain an invalid address.

The published Input declaration exposes checkValidation(): void. Call it to trigger the component’s validation behavior, not as the Boolean condition that authorizes a work-order action. The native specimen also checks its required application values before producing a draft. Its clearable summary and readonly asset show two other independent input capabilities.

Dirty tracking is a documented extension, not enabled in this preview. The demo clears its prepared summary after edits and resets focus to the work-summary field; it does not report a maintenance request as saved.

[Supporting specification](https://unpkg.com/ids-enterprise-wc@1.17.1/components/ids-input/ids-input.d.ts)

## Infor Design System Use a two-part workspace without hiding the form

### Form first, context second

The preview pairs a form with a compact equipment context card and a simple original machine diagram. The main reading order remains heading, fields, actions, result. At narrow widths the context moves below the form instead of squeezing the inputs into unreadable columns.

The library examples use ids-layout-grid with breakpoint-specific column attributes. This specimen intentionally keeps its own simpler responsive layout; its maximum width and breakpoint are application values. The token-based gaps and native control labels are the aspects being demonstrated.

[Supporting specification](https://latest.wc.design.infor.com/ids-input/example.html)

## Infor Design System Pin the native package and initialize before reading values

### The published package is the reliable entry point

The verified package identifies version 1.17.1, an ES module entry at enterprise-wc.js and the current Infor-hosted source repository. The old GitHub location is therefore not a dependable installation instruction. The code imports the published package, inserts the composition and waits for custom-element definitions before wiring behavior.

The official live examples contain build-specific chunk URLs. Copying a random chunk name into an application would couple it to a deployment artifact; the package entry lets the bundler resolve those dependencies. This guide verifies the public method declarations and keeps the browser specimen clearly separate from a native build claim.

1. Install the pinned package in the Vite vanilla scaffold and include the documented font through your application asset policy.
2. Use the provided entry and CSS, wait for custom elements, then bind the primary and reset actions.
3. Test an empty summary, a malformed email, a valid local draft and a subsequent edit; ensure the displayed snapshot never becomes stale.

[Supporting specification](https://unpkg.com/ids-enterprise-wc@1.17.1/package.json)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent HTML/CSS interpretation using verified IDS core/light token values and a system font fallback. Not the native IDS runtime.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maintenance request — IDS interpretation</title><style>*{box-sizing:border-box}body{margin:0;color:#161618;background:#f5f5f5;font:16px/1.45 Arial,sans-serif}main{max-width:1120px;padding:32px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:1px solid #bbbbbf;padding-bottom:16px;gap:16px}header b{font-size:14px}header span{font-size:13px;color:#3b3b3f}h1{font-size:32px;line-height:1.2;font-weight:500;margin:24px 0 8px}h2{font-size:20px;font-weight:500;margin:0 0 16px}.intro{color:#3b3b3f;margin:0 0 24px}.grid{display:grid;grid-template-columns:1.4fr 1fr;gap:24px}.form,.context{background:white;border:1px solid #e0e0e1;border-radius:8px;padding:24px}label,.label{display:block;font-size:14px;margin-bottom:8px}input{width:100%;font:inherit;border:1px solid #6f6f76;border-radius:4px;padding:10px 12px;color:#161618}input[readonly]{background:#f5f5f5}input:focus,button:focus-visible{outline:3px solid #8abff7;outline-offset:2px}.field{margin-bottom:16px}.hint{font-size:12px;color:#3b3b3f;margin:4px 0 0}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:24px}button{font:inherit;border-radius:4px;padding:10px 16px;cursor:pointer;border:1px solid #6f6f76;background:white;color:#161618}.primary{background:#0072ed;color:white;border-color:#0072ed}.primary:hover{background:#0066d4}fieldset{padding:0;border:0;margin:24px 0 0}legend{font-size:14px;margin-bottom:8px}.radios{display:flex;gap:16px;flex-wrap:wrap}.radios label{display:flex;gap:8px;align-items:center;margin:0}.radios input{width:auto;accent-color:#0072ed}.equipment{height:190px;background:#e6f1fd;display:grid;place-content:center;margin-bottom:24px;border-radius:4px}.machine{border:3px solid #0054b1;width:165px;height:100px;position:relative;background:white}.machine:before{content:'';position:absolute;left:14px;top:16px;width:55px;height:55px;border:8px double #0054b1;border-radius:50%}.machine:after{content:'02006';position:absolute;right:10px;top:27px;color:#0054b1;font:16px monospace}.context dl{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0;font-size:14px}.context dt{color:#3b3b3f}.context dd{margin:0;text-align:right}.notice{font-size:13px;background:#f5f5f5;padding:16px;margin-top:24px}.error{color:#a30d11;font-size:14px;min-height:20px}.result{background:#e6f1fd;padding:16px;border-left:3px solid #0072ed;margin-top:20px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px}.result[hidden]{display:none}.foot{font-size:12px;color:#3b3b3f;margin-top:24px}@media(max-width:650px){main{padding:20px}.grid{grid-template-columns:1fr}.form,.context{padding:20px}header{flex-direction:column;gap:4px}h1{font-size:28px}.equipment{height:140px}}</style><main><header><b>ASSET SERVICE / LOCAL NOTEBOOK</b><span>Independent Infor IDS interpretation</span></header><h1>Prepare the work. Keep the context.</h1><p class="intro">Build a local maintenance draft for a fixed equipment record.</p><div class="grid"><form id="form" class="form" novalidate><div class="field"><label for="asset">Asset identifier</label><input id="asset" value="02006" readonly><p class="hint">Read-only record identity; leading zero preserved.</p></div><div class="field"><label for="summary">Work summary</label><input id="summary" required placeholder="For example, inspect the drive belt" aria-describedby="error"></div><div class="field"><label for="contact">Contact email</label><input id="contact" type="email" required placeholder="name@example.com" aria-describedby="error"></div><fieldset><legend>Planning urgency</legend><div class="radios"><label><input type="radio" name="urgency" value="Routine" checked>Routine</label><label><input type="radio" name="urgency" value="Soon">Soon</label></div></fieldset><div class="actions"><button class="primary" type="submit">Prepare local draft</button><button id="clear" type="button">Clear draft</button></div><p id="error" class="error" role="alert"></p><div id="result" class="result" role="status" hidden></div></form><aside class="context"><div class="equipment" role="img" aria-label="Original schematic of fictional equipment 02006"><div class="machine"></div></div><h2>Equipment context</h2><dl><dt>Record</dt><dd>02006</dd><dt>Area</dt><dd>Sample workshop</dd><dt>Type</dt><dd>Drive assembly</dd><dt>Connection</dt><dd>Offline sample</dd></dl><p class="notice">Preparing a draft changes only this page. It does not create a work order or send a message.</p></aside></div><p class="foot">Core/light IDS token values with native HTML controls and a system-font fallback. Original illustration and application layout; no native IDS runtime.</p></main><script>const form=document.querySelector('#form'),summary=document.querySelector('#summary'),contact=document.querySelector('#contact'),error=document.querySelector('#error'),result=document.querySelector('#result');function clearResult(){result.hidden=true;result.textContent='';error.textContent='';summary.removeAttribute('aria-invalid');contact.removeAttribute('aria-invalid')}form.addEventListener('input',clearResult);form.onsubmit=e=>{e.preventDefault();clearResult();if(!summary.value.trim()){error.textContent='Enter a work summary.';summary.setAttribute('aria-invalid','true');summary.focus();return}if(!contact.value.trim()||!contact.validity.valid){error.textContent='Enter a valid contact email.';contact.setAttribute('aria-invalid','true');contact.focus();return}result.hidden=false;result.textContent='LOCAL DRAFT / NOT SENT\n\nAsset: 02006\nSummary: '+summary.value.trim()+'\nContact: '+contact.value.trim()+'\nUrgency: '+form.elements.urgency.value};document.querySelector('#clear').onclick=()=>{form.reset();clearResult();summary.focus()};</script></html>

```

[Code reference](https://latest.wc.design.infor.com/ids-input/example.html)

- Asset 02006 stays a string. The native IDS example, not this HTML form, exercises custom-element registration and checkValidation(); neither creates a maintenance order.

### Readonly identifier, required summary and contact validation

IDS input validation is invoked explicitly; application checks prevent an empty local draft. User text is rendered with textContent.

```javascript
// Vite vanilla project: npm install ids-enterprise-wc@1.17.1
// src/main.js. Add Source Sans Pro through your approved font-hosting setup.
import 'ids-enterprise-wc';
import './style.css';
document.querySelector('#app').innerHTML=`<ids-container><main>
<h1>Maintenance request</h1><p>Local draft only; no work order is sent.</p>
<ids-input id="asset" label="Asset identifier" value="02006" readonly="true"></ids-input>
<ids-input id="summary" label="Work summary" validate="required" clearable="true"></ids-input>
<ids-input id="contact" label="Contact email" validate="email required"></ids-input>
<ids-button id="prepare" appearance="primary"><span>Prepare local draft</span></ids-button>
<ids-button id="reset" appearance="secondary"><span>Clear draft</span></ids-button>
<p id="message" role="status"></p><pre id="draft"></pre>
</main></ids-container>`;
await Promise.all(['ids-input','ids-button','ids-container'].map(n=>customElements.whenDefined(n)));
const summary=document.querySelector('#summary'),contact=document.querySelector('#contact');
const message=document.querySelector('#message'),draft=document.querySelector('#draft');
document.querySelector('#prepare').addEventListener('click',()=>{
 summary.checkValidation();contact.checkValidation();
 const title=summary.value.trim(),email=contact.value.trim();
 if(!title){message.textContent='Enter a work summary.';summary.focus();return;}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message.textContent='Enter a complete contact email.';contact.focus();return;}
 draft.textContent=JSON.stringify({asset:'02006',summary:title,contact:email},null,2);
 message.textContent='Draft prepared in this page only. No request sent.';
});
function clearResult(){draft.textContent='';message.textContent='';}
summary.addEventListener('input',clearResult);contact.addEventListener('input',clearResult);
document.querySelector('#reset').addEventListener('click',()=>{summary.value='';contact.value='';clearResult();summary.focus();});

/* src/style.css — application layout using the loaded IDS token roles */
main{max-width:44rem;margin:auto;padding:var(--ids-space-md);color:var(--ids-color-foreground-default-default)}
ids-input{display:block;margin-bottom:var(--ids-space-sm)}
ids-button{margin-inline-end:var(--ids-space-xs)}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--ids-color-accent-neutral-weakest);padding:var(--ids-space-sm)}

```

[Code reference](https://unpkg.com/ids-enterprise-wc@1.17.1/components/ids-input/ids-input.d.ts)

- checkValidation() returns void; it is not treated as a Boolean result.
- Asset 02006 is text, so its leading zero survives.
- Preparing the preview changes only local page state.

### Action appearance is explicit

Primary and secondary component variants give the workflow a clear main action.

```html
<ids-button appearance="primary"><span>Prepare local draft</span></ids-button>
<ids-button appearance="secondary"><span>Clear draft</span></ids-button>
```

[Code reference](https://latest.wc.design.infor.com/ids-button/example.html)

- An unavailable component uses disabled, not a washed-out style alone.

## Implementation Starting Point

Complete entry and stylesheet for a Vite vanilla scaffold with #app. The package version and methods were checked in the published package; compilation was not run here. Supply Source Sans Pro through an approved font source. The embedded preview is an independent native HTML implementation.

```javascript / css
// Vite vanilla project: npm install ids-enterprise-wc@1.17.1
// src/main.js. Add Source Sans Pro through your approved font-hosting setup.
import 'ids-enterprise-wc';
import './style.css';
document.querySelector('#app').innerHTML=`<ids-container><main>
<h1>Maintenance request</h1><p>Local draft only; no work order is sent.</p>
<ids-input id="asset" label="Asset identifier" value="02006" readonly="true"></ids-input>
<ids-input id="summary" label="Work summary" validate="required" clearable="true"></ids-input>
<ids-input id="contact" label="Contact email" validate="email required"></ids-input>
<ids-button id="prepare" appearance="primary"><span>Prepare local draft</span></ids-button>
<ids-button id="reset" appearance="secondary"><span>Clear draft</span></ids-button>
<p id="message" role="status"></p><pre id="draft"></pre>
</main></ids-container>`;
await Promise.all(['ids-input','ids-button','ids-container'].map(n=>customElements.whenDefined(n)));
const summary=document.querySelector('#summary'),contact=document.querySelector('#contact');
const message=document.querySelector('#message'),draft=document.querySelector('#draft');
document.querySelector('#prepare').addEventListener('click',()=>{
 summary.checkValidation();contact.checkValidation();
 const title=summary.value.trim(),email=contact.value.trim();
 if(!title){message.textContent='Enter a work summary.';summary.focus();return;}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message.textContent='Enter a complete contact email.';contact.focus();return;}
 draft.textContent=JSON.stringify({asset:'02006',summary:title,contact:email},null,2);
 message.textContent='Draft prepared in this page only. No request sent.';
});
function clearResult(){draft.textContent='';message.textContent='';}
summary.addEventListener('input',clearResult);contact.addEventListener('input',clearResult);
document.querySelector('#reset').addEventListener('click',()=>{summary.value='';contact.value='';clearResult();summary.focus();});

/* src/style.css — application layout using the loaded IDS token roles */
main{max-width:44rem;margin:auto;padding:var(--ids-space-md);color:var(--ids-color-foreground-default-default)}
ids-input{display:block;margin-bottom:var(--ids-space-sm)}
ids-button{margin-inline-end:var(--ids-space-xs)}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--ids-color-accent-neutral-weakest);padding:var(--ids-space-sm)}

```

## Agent Prompt

Create an Infor IDS maintenance draft using the verified light-theme aliases and documented input/button anatomy. Keep the asset identifier as a string and readonly. Validate the editable fields, clear stale output after edits and distinguish a local draft from a submitted work order. Do not treat checkValidation() as returning a Boolean.

## Sources

- [Infor Design](https://design.infor.com/) — SoHo language and enterprise scope.
- [Live token stylesheet](https://latest.wc.design.infor.com/ids-personalize/token-table.html) — Actual core/light token values and aliases.
- [Input examples](https://latest.wc.design.infor.com/ids-input/example.html) — Public component markup and states.
- [Button examples](https://latest.wc.design.infor.com/ids-button/example.html) — Action variants.
- [Published package 1.17.1](https://unpkg.com/ids-enterprise-wc@1.17.1/package.json) — Version and module entry.
- [Package README](https://unpkg.com/ids-enterprise-wc@1.17.1/README.md) — Installation and font requirement.
- [Input type declarations](https://unpkg.com/ids-enterprise-wc@1.17.1/components/ids-input/ids-input.d.ts) — value, focus and checkValidation signatures.
