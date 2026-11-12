# Maersk Design System — OpenDesign Application Guide

Study Maersk’s operational interface language through real light-theme roles, headline and text scales, nested radii and identifier handling. A sample shipment lookup demonstrates exact reference matching and an accessible event history without claiming access to live logistics data.

Independent OpenDesign reference. Native MDS packages require authorized corporate access. All shipment identifiers, routes and events in the preview are fictional sample data; no tracking service is called.

## Source Reference

- **Package access:** Private corporate registries ([source](https://designsystem.maersk.com/develop/index.html))
- **Body typeface:** Maersk Text ([source](https://designsystem.maersk.com/foundations/themes/maersk/brand/text/index.html))
- **Headline typeface:** Maersk Headline ([source](https://designsystem.maersk.com/foundations/themes/maersk/brand/index.html))
- **Spacing base:** 4px ([source](https://designsystem.maersk.com/foundations/spacing/))
- **Input radius:** 6px ([source](https://designsystem.maersk.com/foundations/corner-radius/index.html))
- **Light primary fill:** #141414 ([source](https://designsystem.maersk.com/foundations/themes/maersk/light/))


## Design Reference

Public MDS foundation and component usage documentation. Native component packages are in private Maersk registries; the runnable example uses native HTML and a documented token snapshot, not invented mc-* APIs.

### Maersk light roles

[Official reference](https://designsystem.maersk.com/foundations/themes/maersk/light/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --mds_brand_appearance_primary_default_background-color | #141414 | Primary filled action. |
| --mds_brand_appearance_primary_default_on-background-color | #FFFFFF | Text on primary fill. |
| --mds_brand_appearance_primary_default_link-color | #0077B2 | Link text. |
| --mds_brand_appearance_secondary_default_background-color | #42B0D5 | Brand secondary fill. |
| --mds_brand_appearance_secondary_default_on-background-color | #141414 | Text on secondary fill. |
| --mds_brand_appearance_secondary_weak_background-color | #E2F3F9 | Subtle secondary surface. |
| --mds_brand_appearance_neutral_default_border-color | #D4D4D4 | Default border. |
| --mds_brand_appearance_neutral_weakest_text-color | #6A6A6A | Supporting text. |
| --mds_brand_appearance_neutral_weakest_background-color | #F7F7F7 | Subtle page surface. |

### Text scale

[Official reference](https://designsystem.maersk.com/foundations/themes/maersk/brand/text/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --mds_brand_typography_text_font-family | Maersk Text | Native brand face. |
| text_large desktop/mobile | 18px / 28px line height | Same on both platforms. |
| text_medium desktop/mobile | 16px / 24px line height | Default reading size. |
| text_small desktop/mobile | 14px / 20px line height | Compact metadata. |
| text_x-small desktop/mobile | 12px / 16px line height | Smallest reference size. |
| normal / light / medium / semibold / bold | 400 / 300 / 500 / 600 / 700 | Documented text weights. |

### Headline scale

[Official reference](https://designsystem.maersk.com/foundations/themes/maersk/brand/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| headline_large desktop | 50px / 56px, weight 300 | Large display headline. |
| headline_large mobile | 38px / 38px, weight 300 | Mobile counterpart. |
| headline_medium desktop | 40px / 40px, weight 300 | Page heading. |
| headline_medium mobile | 26px / 32px, weight 300 | Mobile page heading. |
| headline_small desktop | 26px / 32px, weight 400 | Section heading. |
| headline_small mobile | 22px / 26px, weight 400 | Mobile section heading. |
| headline_x-small desktop/mobile | 20px / 24px, weight 400 | Small heading. |

### Corner radii

[Official reference](https://designsystem.maersk.com/foundations/corner-radius/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| radius-xs | 2px | Small nested elements. |
| radius-sm | 4px | Checkbox-sized elements. |
| radius-md | 6px | Buttons and inputs. |
| radius-lg | 8px | Notifications and tables. |
| radius-xl | 12px | Cards with nested controls. |
| radius-2xl | 16px | Large images and dialogs. |
| radius-full | 9999px | Fully rounded shapes. |

### Spacing and density

[Official reference](https://designsystem.maersk.com/foundations/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Base rhythm | 4px multiples | Padding, margins and gaps. |
| Fine component exceptions | 2px, 6px, 10px | Small component alignment. |
| Responsive dimensions | Not required to be divisible by 4 | Keep sibling spacing on the rhythm. |

### Action hierarchy

[Official reference](https://designsystem.maersk.com/components/button/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Primary action | Primary + Filled | Single main action. |
| Secondary action | Neutral + Outlined | Supporting action in an open form. |
| Tertiary action | Neutral + Plain | Clear, reset or repeated disclosure. |
| Secondary in a dialog | Neutral + Filled | Avoid competing outlines. |
| Brand hero exception | Secondary + Filled | Not the default form action. |

## Maersk Design System Public rules and private components are different resources

### Choose the adoption path honestly

MDS exposes substantial foundation and usage guidance publicly, while its developer guide places packages in private Maersk Global GitHub Packages and Nexus repositories. Reading a component page does not grant package or font distribution rights.

Authorized teams should use the package and Storybook associated with their corporate setup. This public reference instead supplies a complete native HTML implementation of the visible rules, so a reader can inspect the behavior without a fictitious public install command.

1. Confirm corporate registry access before choosing the native package path.
2. Match component documentation to the installed release.
3. Use the original HTML specimen for public exploration without private dependencies.

[Supporting specification](https://designsystem.maersk.com/develop/index.html)

## Maersk Design System Read the role before recognizing the brand color

### The primary action is dark in the light theme

Maersk blue is recognizable, but the light-theme primary filled role is #141414 with white on-background text. The secondary filled role is #42B0D5 with dark text. This distinction prevents every control from becoming a bright brand accent.

The sample’s main lookup action uses the dark primary role. A pale secondary surface frames the route study, and neutral borders organize the supporting records. Token names encode depth, item, variant, platform, state and attribute, allowing the role to remain understandable when a theme changes.

[Supporting specification](https://designsystem.maersk.com/foundations/themes/maersk/light/)

## Maersk Design System Separate headline character from reading density

### Use the actual desktop and mobile pairs

Maersk Headline and Maersk Text serve different purposes. A medium headline changes from 40/40 on desktop to 26/32 on mobile, while medium body text stays 16/24. Applying one percentage scale to every text style would miss this deliberate difference.

The original preview uses Arial because it does not redistribute brand font files. It follows the documented size hierarchy: a light page title, clear section labels and readable 14px event metadata. Reference identifiers remain selectable text so readers can inspect leading zeros and copy the exact string.

[Supporting specification](https://designsystem.maersk.com/foundations/themes/maersk/brand/index.html)

## Maersk Design System Density comes from spacing, not missing information

### Preserve relationships in a compact operational view

MDS uses a four-pixel spacing rhythm with 2, 6 and 10px exceptions for detailed component alignment. Density tokens support Default, Compact and Spacious modes, but an unverified package-specific density value should not be guessed from those names.

The example’s 8px and 16px gaps group labels, events and metadata; 24px and 32px separate larger regions. At narrow widths the route and event history stack. The information remains present rather than disappearing to make a small screenshot cleaner.

[Supporting specification](https://designsystem.maersk.com/foundations/spacing/)

## Maersk Design System Outer containers need room for inner controls

### The radius scale communicates nesting

Cards use the 12px reference, buttons and fields use 6px, and large images or dialogs use 16px. The corner-radius guidance explicitly asks for a larger outer radius when one component contains another.

The sample places its route illustration inside a rounded card, while the lookup field keeps a tighter shape. A border is a structural separator here, not a decorative outline around every line of text. The documented global border is one solid pixel.

[Supporting specification](https://designsystem.maersk.com/foundations/corner-radius/index.html)

## Maersk Design System A shipment number is an identifier, not an amount

### Do not let a number input change the reference

MDS input guidance distinguishes quantities from identifiers such as container numbers and reference numbers. A number input can discard leading zeros or change on accidental stepping. The sample therefore uses type="text" with inputmode="numeric" and exact string keys.

The six-digit format is an original specimen constraint, not a Maersk shipment-number specification. Empty or malformed input receives a specific correction message; a well-formed but unknown reference receives a separate no-match result. These outcomes should never collapse into a vague Invalid error.

- Keep the label above the field.
- Preserve every identifier digit as a string.
- Link format help and error text with aria-describedby.
- Set aria-invalid only for a format error, not for a valid unknown record.

[Supporting specification](https://designsystem.maersk.com/components/input/index.html)

## Maersk Design System Keep the main lookup distinct from sample shortcuts

### Use sentence-case verbs with concrete outcomes

Show shipment is the single filled action. Sample-reference shortcuts are low-emphasis actions that populate the same query rather than competing as several primary buttons. In an open form, the primary action precedes a supporting action in keyboard and reading order.

The preview renders a selected sample’s event history as an ordered list. Event labels carry the status in text, so the blue marker and connector are supplementary. The record is explicitly fictional; no ETA or route is presented as live operational information.

[Supporting specification](https://designsystem.maersk.com/components/button/index.html)

## Maersk Design System A dark theme needs its own semantic values

### Avoid inverting a screenshot

The public dark-theme table changes primary text to #F0F0F0 and the primary fill to white, while its neutral canvas becomes #141414. Those are intentional role mappings rather than an instruction to invert every RGB value.

This specimen stays in the documented light theme. Extending it to dark mode requires replacing the role set coherently, including hover, border and on-background colors. The original route diagram would then need separate contrast review rather than inheriting a global filter.

[Supporting specification](https://designsystem.maersk.com/foundations/themes/maersk/dark/)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Original offline native HTML interpretation using documented Maersk light roles and spacing. No private MDS runtime, brand font files or live shipment connection.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sample shipment lookup</title><style>*{box-sizing:border-box}body{font:16px/24px Arial,sans-serif;background:#f7f7f7;color:#141414;margin:0}button,input{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #0077b2;outline-offset:3px}header{background:#fff;padding:20px 32px;display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #d4d4d4}header b{font-weight:500;letter-spacing:1px}header span{font-size:12px;color:#6a6a6a}main{max-width:1120px;margin:auto;padding:32px}h1{font-size:40px;line-height:40px;font-weight:300;margin:8px 0 16px}p{margin:0 0 16px}.subtitle{color:#6a6a6a}.search{background:#fff;border:1px solid #d4d4d4;padding:24px;border-radius:12px;margin:24px 0}.search label{display:block;margin-bottom:8px}.entry{display:flex;gap:8px}.entry input{border:1px solid #8a8a8a;border-radius:6px;padding:12px 16px;max-width:360px;min-width:0;width:100%;background:#fff;color:#141414}.entry button{border:0;background:#141414;color:#fff;border-radius:6px;padding:12px 24px}.hint{font-size:14px;color:#6a6a6a;margin:8px 0 0}.error{color:#b80012;margin:8px 0 0}.error:empty{display:none}.layout{display:grid;grid-template-columns:250px 1fr;gap:24px}aside{background:#fff;border-radius:12px;border:1px solid #d4d4d4;padding:24px}aside h2{font-size:20px;line-height:24px;font-weight:400;margin:0 0 16px}.record{display:block;text-align:left;background:none;border:0;border-top:1px solid #e2e2e2;padding:16px 0;width:100%;color:#141414}.record strong,.record small{display:block}.record strong{font-size:16px;font-weight:500}.record small{color:#6a6a6a;font-size:12px;margin-top:4px}.record[aria-pressed=true]{color:#0077b2}.record[aria-pressed=true] strong:after{content:' →'}.detail{background:#fff;border:1px solid #d4d4d4;border-radius:12px;padding:24px;min-width:0}.detail h2{font-size:26px;line-height:32px;font-weight:400;margin:0}.topline{display:flex;justify-content:space-between;gap:16px;margin-bottom:20px}.tag{font-size:12px;border-radius:4px;background:#e2f3f9;color:#141414;padding:4px 8px;align-self:start;white-space:nowrap}.route{height:148px;border-radius:12px;background:#e2f3f9;display:flex;align-items:center;justify-content:space-between;padding:24px;position:relative;gap:16px}.port{position:relative;z-index:1;font-size:14px;max-width:40%}.port b{display:block;font-size:20px;line-height:24px;font-weight:400}.port:last-child{text-align:right}.route:before{content:'';height:2px;background:#42b0d5;position:absolute;left:24px;right:24px;top:52%}.port{background:#e2f3f9;padding:8px}.history{list-style:none;margin:24px 0 0;padding:0}.history li{position:relative;padding:0 0 24px 28px;border-left:2px solid #d4d4d4;margin-left:5px}.history li:last-child{padding-bottom:0;border-color:transparent}.history li:before{content:'';position:absolute;left:-6px;top:7px;width:10px;height:10px;background:#42b0d5;border-radius:50%}.history b{font-weight:500;display:block}.history small{font-size:14px;line-height:20px;color:#6a6a6a;display:block;margin-top:4px}.notice{padding:32px 0;max-width:430px}footer{font-size:12px;line-height:16px;color:#6a6a6a;margin-top:24px}@media(max-width:650px){header{padding:16px}header span{max-width:115px}main{padding:24px 16px}h1{font-size:26px;line-height:32px}.layout{grid-template-columns:1fr}aside{padding:16px}.record{padding:12px 0}.search,.detail{padding:20px}.entry{flex-wrap:wrap}.entry input{max-width:none}.entry button{width:100%}.topline{flex-wrap:wrap}.route{padding:8px}.port b{font-size:18px}.route:before{left:16px;right:16px}}
</style><header><b>CARGO / WORKSPACE</b><span>Independent MDS interpretation</span></header><main><h1>Follow the next milestone.</h1><p class="subtitle">A reference lookup and event history, using original sample records.</p><form id="lookup" class="search" novalidate><label for="reference">Shipment reference</label><div class="entry"><input id="reference" type="text" inputmode="numeric" value="000042" required aria-describedby="hint error"><button type="submit">Show shipment</button></div><p class="hint" id="hint">Try 000042 or 000108. Keep the leading zeros.</p><p class="error" id="error" role="alert"></p></form><div class="layout"><aside><h2>Sample shipments</h2><button class="record" data-id="000042" aria-pressed="true"><strong>000042</strong><small>Rotterdam → Singapore</small></button><button class="record" data-id="000108" aria-pressed="false"><strong>000108</strong><small>Hamburg → New York</small></button></aside><section class="detail" id="result" aria-live="polite"></section></div><footer>All references, routes and events are fictional. No live tracking, shipment status or transport commitment is represented.</footer></main><script>const data={'000042':{from:'Rotterdam',to:'Singapore',status:'In transit',events:[['Booking received','Sample milestone 1 · Reference created'],['Loaded at origin','Sample milestone 2 · Origin handling complete'],['In transit','Sample milestone 3 · Next event pending']]},'000108':{from:'Hamburg',to:'New York',status:'Awaiting handover',events:[['Booking received','Sample milestone 1 · Reference created'],['Awaiting origin handover','Sample milestone 2 · Cargo handover pending']]}};const input=document.querySelector('#reference'),result=document.querySelector('#result'),error=document.querySelector('#error');function resetError(){error.textContent='';input.setAttribute('aria-invalid','false')}function show(){resetError();const id=input.value.trim();document.querySelectorAll('.record').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.id===id)));result.replaceChildren();if(!/^\d{6}$/.test(id)){error.textContent='Use a six-digit sample reference, including leading zeros.';input.setAttribute('aria-invalid','true');input.focus();result.innerHTML='<p class="notice">Correct the reference to view a sample event history.</p>';return}const r=data[id];if(!r){result.innerHTML='<h2>No sample shipment found</h2><p class="notice">This reference does not match the two sample records. Try 000042 or 000108.</p>';return}result.innerHTML=`<div class="topline"><h2>Shipment ${id}</h2><span class="tag">${r.status}</span></div><div class="route"><div class="port"><small>ORIGIN</small><b>${r.from}</b></div><div class="port"><small>DESTINATION</small><b>${r.to}</b></div></div><ol class="history">${r.events.map(([a,b])=>`<li><b>${a}</b><small>${b}</small></li>`).join('')}</ol>`}document.querySelector('#lookup').onsubmit=e=>{e.preventDefault();show()};document.querySelectorAll('.record').forEach(x=>x.onclick=()=>{input.value=x.dataset.id;show()});input.oninput=()=>{resetError();document.querySelectorAll('.record').forEach(x=>x.setAttribute('aria-pressed','false'));result.innerHTML='<p class="notice">Select Show shipment to look up the edited reference.</p>'};show();</script></html>

```

[Code reference](https://designsystem.maersk.com/components/input/index.html)

- Only the included sample shipment references can be found. Exact string matching preserves identifiers; the document does not contain private Maersk components or tracking access.

### Preserve shipment references as text

A native form follows MDS input guidance and uses public token roles. Exact-match sample data preserves leading zeros and distinguishes invalid format from no matching record.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Sample shipment lookup</title><style>
/* Local snapshot of documented Maersk light roles; not an MDS package import. */
:root{--mds_brand_appearance_primary_default_background-color:#141414;
--mds_brand_appearance_primary_default_on-background-color:#fff;
--mds_brand_appearance_neutral_default_border-color:#d4d4d4;
--mds_brand_appearance_secondary_weak_background-color:#e2f3f9}
body{font:16px/24px Arial,sans-serif;color:#141414;margin:32px}
main{max-width:48rem;margin:auto}label{display:block;margin-bottom:8px}
input,button{font:inherit;padding:12px 16px;border-radius:6px}
input{border:1px solid var(--mds_brand_appearance_neutral_default_border-color);max-width:100%;box-sizing:border-box}
button{border:0;background:var(--mds_brand_appearance_primary_default_background-color);color:var(--mds_brand_appearance_primary_default_on-background-color)}
.actions{display:flex;gap:8px;flex-wrap:wrap}li{padding:12px 0}#error{color:#b80012}#result{margin-top:24px;padding:24px;border-radius:12px;background:var(--mds_brand_appearance_secondary_weak_background-color)}
</style><main><h1>Find a sample shipment</h1>
<form id="lookup" novalidate><label for="reference">Shipment reference</label>
<p id="hint">Try 000042 or 000108. These are original sample records.</p>
<div class="actions"><input id="reference" type="text" inputmode="numeric" value="000042" aria-describedby="hint error" required>
<button type="submit">Show shipment</button></div><p id="error" role="alert"></p></form>
<section id="result" aria-live="polite"></section></main>
<script>
const shipments={'000042':{route:'Rotterdam → Singapore',events:['Booking received','Loaded at origin','In transit']},'000108':{route:'Hamburg → New York',events:['Booking received','Awaiting origin handover']}};
const input=document.querySelector('#reference'),result=document.querySelector('#result'),error=document.querySelector('#error');
function lookup(e){e.preventDefault();const id=input.value.trim();error.textContent='';input.setAttribute('aria-invalid','false');result.replaceChildren();
 if(!/^\d{6}$/.test(id)){error.textContent='Use a six-digit sample reference, including leading zeros.';input.setAttribute('aria-invalid','true');input.focus();return;}
 const record=shipments[id];if(!record){result.textContent='No sample shipment matches this reference. Try 000042 or 000108.';return;}
 const heading=document.createElement('h2');heading.textContent=id+' · '+record.route;
 const list=document.createElement('ol');record.events.forEach(x=>{const li=document.createElement('li');li.textContent=x;list.append(li)});
 result.append(heading,list);
}
document.querySelector('#lookup').addEventListener('submit',lookup);
input.addEventListener('input',()=>{error.textContent='';input.setAttribute('aria-invalid','false');result.replaceChildren();});
</script></html>
```

[Code reference](https://designsystem.maersk.com/components/input/index.html)

- type="text" preserves identifier digits; inputmode only suggests a keyboard.
- The visible label, persistent hint and linked error have separate jobs.
- This code is an original implementation, not the private MDS Input component API.

## Implementation Starting Point

The public developer page documents private registry access. Exact native imports and event signatures are intentionally not fabricated from unavailable code snippets. The supplied HTML is a complete, working interpretation of public foundations.

```text
Native MDS adoption (authorized Maersk teams):
1. Obtain access to Maersk Global GitHub Packages or the private Nexus registry.
2. Use the corporate authentication and SSO flow in the official developer guide.
3. Install the approved component or core package and its documented token/font dependencies.
4. Read exact component properties and events in the MDS Storybook for that installed release.

Public reference specimen:
Save the complete HTML example as index.html and open it in a browser.
It requires no registry, external script or private asset.
Its token declarations are a local light-theme snapshot; they do not initialize MDS Web Components.
```

## Agent Prompt

Create a Maersk-inspired operational lookup using documented light roles, a dark primary action, 4px-based gaps, 6px input corners and 12px cards. Preserve shipment identifiers as text, distinguish malformed input from a missing record and expose event history as an ordered list. Do not invent public package access or private component APIs.

## Sources

- [Developer access](https://designsystem.maersk.com/develop/index.html) — Private registries and native adoption.
- [Token architecture](https://designsystem.maersk.com/foundations/themes/about-our-design-tokens/) — Naming, brands and density.
- [Maersk light](https://designsystem.maersk.com/foundations/themes/maersk/light/) — Exact semantic color roles.
- [Maersk dark](https://designsystem.maersk.com/foundations/themes/maersk/dark/) — Theme counterpart values.
- [Text tokens](https://designsystem.maersk.com/foundations/themes/maersk/brand/text/index.html) — Body size and weight pairs.
- [Headline tokens](https://designsystem.maersk.com/foundations/themes/maersk/brand/index.html) — Platform-specific headline scale.
- [Spacing](https://designsystem.maersk.com/foundations/spacing/) — Four-pixel rhythm and exceptions.
- [Corner radius](https://designsystem.maersk.com/foundations/corner-radius/index.html) — Nested shape scale.
- [Input guidance](https://designsystem.maersk.com/components/input/index.html) — Identifiers, labels and errors.
- [Button guidance](https://designsystem.maersk.com/components/button/index.html) — Action prominence and order.
