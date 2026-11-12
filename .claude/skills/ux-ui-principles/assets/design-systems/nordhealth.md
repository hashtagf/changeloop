# Nord Design System — OpenDesign Application Guide

Inspect Nord’s Therapy theme tokens and Web Component contracts through a room-request draft: real color roles, responsive field sizing, explicit validation and locally prepared results.

Independent OpenDesign reference. Nord states its intended use is Nordhealth products. This original HTML interpretation neither reserves a room nor grants brand or component usage rights.

## Source Reference

- **Token reference:** 9.0.4 ([source](https://nordhealth.design/core/tokens/))
- **Default theme:** Therapy ([source](https://nordhealth.design/core/tokens/))
- **CSS framework:** Required alongside components ([source](https://nordhealth.design/docs/developer/web-components/))
- **Input default width:** 240px ([source](https://nordhealth.design/components/input/))
- **Select options:** Native option elements ([source](https://nordhealth.design/components/select/))
- **Default button type:** submit ([source](https://nordhealth.design/components/button/))


## Design Reference

Nord tokens 9.0.4 and current component documentation. Values below describe the default Therapy theme, not every Nordhealth brand. Public documentation does not grant permission to use Nord outside its intended Nordhealth scope.

### Therapy role values

[Official reference](https://nordhealth.design/core/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --n-color-accent | #3559c7 | Primary action. |
| --n-color-text | #0c1a3d | Main content. |
| --n-color-text-weak | #36434a | Supporting text. |
| --n-color-background | #fafbfb | Page. |
| --n-color-surface | #ffffff | Panel. |
| --n-color-border | #d8dee4 | Divider. |
| --n-color-border-strong | #bcc5cc | Control edge. |
| --n-color-text-error | #d24023 | Error message. |

### Spacing

[Official reference](https://nordhealth.design/core/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --n-space-xs | 4px | Tight. |
| --n-space-s | 8px | Related. |
| --n-space-m | 16px | Group. |
| --n-space-l | 24px | Section. |
| --n-space-xl | 36px | Large. |
| --n-space-xxl | 72px | Major. |

### Type and shape

[Official reference](https://nordhealth.design/core/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --n-font-size-m | 0.875rem | Body. |
| --n-font-size-l | 1rem | Large text. |
| --n-font-size-xl | 1.25rem | Section title. |
| --n-font-size-xxl | 1.5rem | Title. |
| --n-line-height | 1.5 | Body multiplier. |
| --n-line-height-form | 20px | Control line. |
| --n-font-weight-heading | 600 | Heading. |
| --n-border-radius-s | 3px | Control. |
| --n-border-radius | 5px | Surface. |

### Input contract

[Official reference](https://nordhealth.design/components/input/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| label / hint / error | Built-in field text | Standalone input labels itself. |
| expand | Boolean, default false | Fill parent width. |
| size | s / m / l | Medium default. |
| readonly versus disabled | Submitted versus excluded | Read-only remains focusable. |
| --n-input-inline-size | 240px | Default fixed width; prefer expand for responsive forms. |

### Select contract

[Official reference](https://nordhealth.design/components/select/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Default slot | Native option elements | Do not invent nord-option. |
| value | String | Controlled selection. |
| required | Boolean | Use novalidate and application errors. |
| change | User selection event | Read component.value. |
| focus() | Component method | Wait for definition before calling. |

### Button contract

[Official reference](https://nordhealth.design/components/button/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| type | submit by default | Specify button for non-submit actions. |
| variant | default / primary / dashed / plain / danger | Primary once per section. |
| href | Creates anchor semantics | For navigation. |
| size | s / m / l | Medium default. |
| loading | Busy presentation | Pair with an announced status. |

## Nord Design System Nord is an internal product system with public references

### Keep intended use visible

Nord’s documentation describes a system built for Nordhealth experiences. Its publicly inspectable components are useful references, but the example is not a claim that the brand or component terms permit arbitrary commercial reuse. The room names and request workflow here are original demonstration data.

The default token table represents Therapy. A veterinary or healthcare application must select its intended theme instead of assuming that a blue accent defines every Nordhealth product. Keep the theme decision at application level.

[Supporting specification](https://nordhealth.design/docs/developer/web-components/)

## Nord Design System Therapy roles keep the workspace quiet

### Separate text, edge and surface roles

The specimen uses the main text role for request details and the weaker role for explanations. White panels sit above the off-white page; a stronger border identifies editable fields. Error text appears beside the invalid title rather than tinting the entire interface red. The preview contains no clinical or patient information.

[Supporting specification](https://nordhealth.design/core/tokens/)

## Nord Design System Compact text needs enough line space

### Use the documented size and leading together

The token pairs a 0.875rem body size with a 1.5 body line-height, while form text has a separate 20px line box. Those are different rules: applying the form value to long paragraphs unnecessarily compresses them. The live reference uses the Nordhealth Sans family token; this offline interpretation deliberately uses available system fonts rather than claiming a licensed font has been supplied.

[Supporting specification](https://nordhealth.design/core/tokens/)

## Nord Design System Expand controls inside the application grid

### The component does not choose a page breakpoint

Input starts with a 240px inline-size variable. expand is the documented way to occupy the available field column. Our specimen places the room list beside the editor on desktop and stacks them on mobile; that breakpoint is an application decision, not a Nord token. The room name, capacity and availability label remain visible when a row is selected.

The selected-room list in the offline interpretation is a native radio group. The separately supplied library example uses a five-option Select. Both choose one room, but they demonstrate different layouts and are not presented as identical component runtime implementations.

[Supporting specification](https://nordhealth.design/components/input/)

## Nord Design System Choose one owner for labels and error messages

### Standalone fields are enough for this form

An Input or Select can expose label, hint and error itself. The newer Field composition takes over these responsibilities when used, so duplicating both sets would produce redundant guidance. This example uses the standalone route and assigns one short error when the trimmed title is empty.

Disabled fields are removed from submission, whereas readonly preserves a relevant value for focus and submission. Do not disable a room identifier merely to prevent editing if it still needs to accompany the request.

- Keep the request title label visible.
- Use the hint for expected content, not as a substitute label.
- Associate the validation message with the invalid control.

[Supporting specification](https://nordhealth.design/components/input/)

## Nord Design System Select contains ordinary option elements

### Read the value from the host component

The default slot accepts native option elements. Each room has a stable value and a descriptive visible label containing its capacity. The change event tells the application to recompute its summary from the host value. There is no custom nord-option tag in this composition.

Nord suggests Select for a larger choice set and radio buttons when showing a few choices directly is useful. The example provides five rooms; the offline radio treatment makes the visual difference between capacities easy to inspect.

[Supporting specification](https://nordhealth.design/components/select/)

## Nord Design System Button defaults affect form composition

### Choose action, link and loading semantics explicitly

Nord Button defaults to type="submit". A secondary preview or reset-like action inside a form therefore needs an explicit type when it must not submit. Giving the component an href changes its exposed semantics to a link; use that route for navigation rather than a click handler that imitates an anchor.

The loading state keeps a button focusable while preventing repeated activation. Its spinner is hidden from assistive technology, so the application must communicate progress in words. Do not substitute disabled indiscriminately: an unavailable action and an action already running have different focus and feedback needs.

The room-request example performs a synchronous draft calculation, so it needs no loading interval. Its main button validates the title and reads the chosen room; editing either removes the obsolete draft sentence. The field and Select sections above explain which Nord APIs own those inputs.

[Supporting specification](https://nordhealth.design/components/button/)

## Nord Design System Load the required CSS before calling component methods

### Prototype loading and production bundling differ

The official quick start pairs the component module with the CSS framework. The latter supplies shared tokens and foundation styles. For a bundled application, install @nordhealth/css and @nordhealth/components, import the CSS once and import only the component modules you use. Package modules register their elements as side effects.

React 19 can use these custom elements directly. The older @nordhealth/react wrapper is deprecated in current guidance. Server rendering does not include the component shadow DOM; Next.js imports need the client boundary. Keep these integration limits separate from the offline HTML preview, whose interactions run without the library.

1. Load framework CSS before the component modules.
2. Wait for customElements.whenDefined before calling focus during initialization.
3. Attach validation and local state handlers.
4. Bundle production dependencies instead of relying on many CDN module requests.

[Supporting specification](https://nordhealth.design/docs/developer/web-components/)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Offline HTML/CSS interpretation of Nord Therapy tokens; native Web Component integration appears separately.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nord room request interpretation</title><style>*{box-sizing:border-box}body{margin:0;background:#fafbfb;color:#0c1a3d;font:14px/1.5 system-ui,sans-serif}button,input{font:inherit}header{height:52px;background:white;border-bottom:1px solid #d8dee4;padding:0 24px;display:flex;align-items:center;justify-content:space-between}header small{color:#36434a}main{max-width:960px;margin:36px auto;padding:0 24px}h1{font-size:24px;line-height:1.2;margin:0 0 8px}h2{font-size:20px;line-height:1.2;margin:0 0 16px}p{margin:0 0 24px}.muted{color:#36434a}.layout{display:grid;grid-template-columns:310px 1fr;gap:24px}.panel{background:white;border:1px solid #d8dee4;border-radius:5px;padding:24px}fieldset{margin:0;padding:0;border:0;min-width:0}legend{font-weight:600;margin-bottom:16px}.room{display:flex;gap:12px;padding:12px;border:1px solid #d8dee4;border-radius:3px;margin-bottom:8px;cursor:pointer;align-items:center}.room:has(:checked){border-color:#3559c7;background:#f0f4ff}.room input{accent-color:#3559c7}.room span{flex:1}.room small{display:block;color:#36434a}.room b{font-size:12px;font-weight:500}.diagram{height:120px;background:#f6f8f8;display:grid;place-items:center;margin:-24px -24px 24px;border-radius:5px 5px 0 0;border-bottom:1px solid #d8dee4}.table{height:50px;border:2px solid #bcc5cc;border-radius:5px;background:#fff;position:relative;transition:width .2s ease}.chair{position:absolute;width:12px;height:10px;border:1px solid #bcc5cc;background:white;border-radius:3px;top:-16px}.chair.bottom{top:auto;bottom:-16px}label.field{display:block;font-weight:600;margin:16px 0 8px}#title{width:100%;border:1px solid #bcc5cc;border-radius:3px;height:36px;padding:7px 12px;color:inherit;background:white}#title[aria-invalid=true]{border-color:#d24023}.error{color:#d24023;min-height:20px;font-size:12px;margin:4px 0 12px}button{background:#3559c7;color:white;border:1px solid transparent;box-shadow:0 1px 3px #0c0c0c17;border-radius:3px;padding:7px 16px;cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid #3559c7;outline-offset:3px}.summary{margin-top:24px;background:#f0f4ff;border:1px solid #c6d4f9;padding:16px;border-radius:5px;overflow-wrap:anywhere}.summary:empty{display:none}.boundary{font-size:12px;color:#36434a;margin-top:24px}#selected{font-weight:600}.facts{display:flex;gap:24px;margin-bottom:24px}.facts strong{font-size:20px;display:block}.facts span{font-size:12px;color:#36434a}@media(max-width:650px){main{margin:24px auto;padding:0 16px}.layout{grid-template-columns:1fr;gap:16px}.panel{padding:16px}.diagram{margin:-16px -16px 16px}.room{padding:8px 12px}header{padding:0 16px}header small{display:none}}</style><header><strong>◈ Workplace</strong><small>Room request workspace</small></header><main><h1>A room for your next conversation</h1><p class="muted">Choose a room and prepare a request draft.</p><div class="layout"><section class="panel"><fieldset><legend>Choose a room</legend><div id="rooms"></div></fieldset></section><section class="panel"><div class="diagram" aria-hidden="true"><div class="table" id="table"></div></div><h2 id="selected">Birch</h2><div class="facts"><div><strong id="capacity">4</strong><span>Seats</span></div><div><strong>Draft</strong><span>Request status</span></div></div><form novalidate><label class="field" for="title">Request title</label><input id="title" type="text" aria-describedby="hint error" placeholder="e.g. Design review"><div id="error" class="error" role="alert"></div><p id="hint" class="muted">Use a non-sensitive meeting title. Availability is not checked in this example.</p><button type="submit">Prepare request</button></form><div class="summary" id="result" role="status"></div></section></div><p class="boundary">Independent HTML interpretation of Nord Therapy tokens. Nord is intended for Nordhealth products. This example creates a local draft only; it does not reserve a room.</p></main><script>const rooms=[['Birch',4],['Cedar',6],['Elm',8],['Maple',10],['Pine',12]],field=document.querySelector('#title'),result=document.querySelector('#result');let selected=0;document.querySelector('#rooms').innerHTML=rooms.map(([name,n],i)=>`<label class="room"><input type="radio" name="room" value="${i}" ${i===0?'checked':''}><span>${name}<small>Meeting room</small></span><b>${n} seats</b></label>`).join('');function update(){let [name,n]=rooms[selected];document.querySelector('#selected').textContent=name;document.querySelector('#capacity').textContent=n;let table=document.querySelector('#table');table.style.width=(n*12+44)+'px';table.innerHTML=Array.from({length:n},(_,i)=>`<i class="chair ${i>=n/2?'bottom':''}" style="left:${12+(i%(n/2))*24}px"></i>`).join('');result.textContent=''}document.querySelectorAll('[name=room]').forEach(input=>input.onchange=()=>{selected=Number(input.value);update()});document.querySelector('form').onsubmit=e=>{e.preventDefault();if(!field.value.trim()){document.querySelector('#error').textContent='Enter a request title.';field.setAttribute('aria-invalid','true');field.focus();return}result.textContent='Draft prepared: '+field.value.trim()+' · '+rooms[selected][0]+' · '+rooms[selected][1]+' seats. No room is reserved.'};field.oninput=()=>{field.removeAttribute('aria-invalid');document.querySelector('#error').textContent='';result.textContent=''};update();</script></html>

```

[Code reference](https://nordhealth.design/core/tokens/)

- This specimen exposes the room choices as radios; the native Nord example uses Select with ordinary option elements. Neither reserves a real room.

### A labelled room request with explicit validation

Standalone nord-input and nord-select provide labels without the optional Field family. Submit reads component values and assigns the input error property.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Room request draft</title>
<link rel="stylesheet" href="https://nordcdn.net/ds/css/5.2.4/nord.min.css">
<script type="module" src="https://nordcdn.net/ds/components/5.3.0/index.js"></script>
<style>main{max-width:560px;margin:auto;padding:var(--n-space-l)}form{display:grid;gap:var(--n-space-l)}</style>
<main><h1>Prepare a room request</h1><p>For an authorized Nordhealth product. Local demonstration only.</p>
<form novalidate>
<nord-input id="request" name="request" label="Request title" hint="Use a non-sensitive meeting title." required expand></nord-input>
<nord-select id="room" name="room" label="Room" value="Birch" expand>
<option value="Birch">Birch · 4 seats</option><option value="Cedar">Cedar · 6 seats</option>
<option value="Elm">Elm · 8 seats</option><option value="Maple">Maple · 10 seats</option><option value="Pine">Pine · 12 seats</option>
</nord-select>
<nord-button type="submit" variant="primary">Prepare request</nord-button>
</form><p id="result" role="status"></p></main>
<script type="module">
await Promise.all(['nord-input','nord-select','nord-button'].map(name=>customElements.whenDefined(name)));
const form=document.querySelector('form'), title=document.querySelector('#request'),room=document.querySelector('#room'),result=document.querySelector('#result');
form.addEventListener('submit',event=>{
 event.preventDefault();title.error=title.value.trim()?'':'Enter a request title.';
 if(title.error){title.focus();return;}
 result.textContent=`Draft: ${title.value.trim()} in ${room.value}. No room is reserved.`;
});
form.addEventListener('input',()=>{result.textContent='';title.error='';});
form.addEventListener('change',()=>{result.textContent='';});
</script></html>
```

[Code reference](https://nordhealth.design/components/input/)

- Five room options make Select a useful compact choice.
- Button defaults to submit; this example states that type explicitly.
- Custom elements are awaited before methods are used. No booking service is called.

## Implementation Starting Point

Complete public-CDN prototype for authorized Nordhealth use. Documentation currently specifies CSS 5.2.4 and components 5.3.0. Production should bundle npm packages; the offline visual interpretation below does not load these remote packages.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Room request draft</title>
<link rel="stylesheet" href="https://nordcdn.net/ds/css/5.2.4/nord.min.css">
<script type="module" src="https://nordcdn.net/ds/components/5.3.0/index.js"></script>
<style>main{max-width:560px;margin:auto;padding:var(--n-space-l)}form{display:grid;gap:var(--n-space-l)}</style>
<main><h1>Prepare a room request</h1><p>For an authorized Nordhealth product. Local demonstration only.</p>
<form novalidate>
<nord-input id="request" name="request" label="Request title" hint="Use a non-sensitive meeting title." required expand></nord-input>
<nord-select id="room" name="room" label="Room" value="Birch" expand>
<option value="Birch">Birch · 4 seats</option><option value="Cedar">Cedar · 6 seats</option>
<option value="Elm">Elm · 8 seats</option><option value="Maple">Maple · 10 seats</option><option value="Pine">Pine · 12 seats</option>
</nord-select>
<nord-button type="submit" variant="primary">Prepare request</nord-button>
</form><p id="result" role="status"></p></main>
<script type="module">
await Promise.all(['nord-input','nord-select','nord-button'].map(name=>customElements.whenDefined(name)));
const form=document.querySelector('form'), title=document.querySelector('#request'),room=document.querySelector('#room'),result=document.querySelector('#result');
form.addEventListener('submit',event=>{
 event.preventDefault();title.error=title.value.trim()?'':'Enter a request title.';
 if(title.error){title.focus();return;}
 result.textContent=`Draft: ${title.value.trim()} in ${room.value}. No room is reserved.`;
});
form.addEventListener('input',()=>{result.textContent='';title.error='';});
form.addEventListener('change',()=>{result.textContent='';});
</script></html>
```

## Agent Prompt

Use Nord Therapy semantic roles with labelled controls. Expand fields inside a responsive application layout. Validate the trimmed request title, retain a single selected room, and show only a local draft outcome. Use the documented package and theme permissions for real Nordhealth implementation.

## Sources

- [Token reference](https://nordhealth.design/core/tokens/) — Therapy values, spacing and typography.
- [Web Components setup](https://nordhealth.design/docs/developer/web-components/) — Required CSS, imports and framework boundaries.
- [Input](https://nordhealth.design/components/input/) — Labelling, errors and responsive sizing.
- [Select](https://nordhealth.design/components/select/) — Options and value handling.
- [Button](https://nordhealth.design/components/button/) — Submit semantics and action variants.
