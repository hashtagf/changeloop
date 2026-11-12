# Twilio Paste Design System — OpenDesign Application Guide

Compose a notification draft with Paste’s theme and button contracts, a verified spacing scale, and a clear distinction between editing, reviewing, and actually sending a message.

Independent OpenDesign reference to upstream Paste. Paste DSys is a separate unaffiliated fork. No message is sent by this example.

## Source Reference

- **Source:** twilio-labs/paste ([source](https://github.com/twilio-labs/paste))
- **Theme entry:** Theme.Provider ([source](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-theme/src/index.tsx))
- **space70:** 1.5rem ([source](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/spacing.yml))
- **fontSize30:** 0.875rem ([source](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/font-size.yml))
- **borderRadius20:** 4px ([source](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/border-radius.yml))
- **Button type default:** button ([source](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx))


## Design Reference

Verified upstream twilio-labs/paste source. Values below distinguish YAML token names from their JavaScript-style names. This reference does not represent the independent Paste DSys fork as Twilio documentation.

### Spacing aliases

[Official reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/spacing.yml)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| space10 | 0.125rem | 2px at a 16px root. |
| space20 | 0.25rem | 4px at a 16px root. |
| space30 | 0.5rem | 8px field separation. |
| space40 | 0.75rem | 12px control padding. |
| space50 | 1rem | 16px local grouping. |
| space60 | 1.25rem | 20px. |
| space70 | 1.5rem | 24px section separation. |
| space90 | 2rem | 32px large grouping. |
| space130 | 3rem | 48px larger region. |

### Font size aliases

[Official reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/font-size.yml)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontSize20 | 0.75rem | 12px at default root. |
| fontSize30 | 0.875rem | 14px body option. |
| fontSize40 | 1rem | 16px body option. |
| fontSize60 | 1.25rem | 20px heading option. |
| fontSize70 | 1.5rem | 24px heading option. |
| fontSize90 | 2rem | 32px display option. |

### Line heights

[Official reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/line-height.yml)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| lineHeight20 / lineHeight30 | 1.25rem | 20px for compact text. |
| lineHeight40 | 1.5rem | 24px for 16px text. |
| lineHeight60 | 1.75rem | 28px for 20px text. |
| lineHeight70 | 2rem | 32px for 24px text. |

### Radii

[Official reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/border-radius.yml)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| borderRadius10 | 2px | Smallest corner radius. |
| borderRadius20 | 4px | Small control radius. |
| borderRadius30 | 8px | Small-medium radius. |
| borderRadius40 | 12px | Medium radius. |
| borderRadiusCircle | 50% | Requires equal width and height for a circle. |
| borderRadiusPill | 100px | Pill radius, distinct from circle. |

### Text roles and pairing

[Official reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/global/text-color.yml)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colorText | palette-gray-100 | Main body text; resolves to #121c2d in the linked palette. |
| colorTextWeak | palette-gray-60 | Secondary text; resolves to #606b85. |
| colorTextLink | palette-blue-60 | Links; resolves to #0263e0. |
| colorTextError | palette-red-60 | Error text; resolves to #db132a. |
| colorTextSuccess | palette-green-70 | Success text; resolves to #0e7c3a. |
| colorTextWeaker | palette-gray-40 | Source warns against using it as ordinary enabled text. |

### Button behavior

[Official reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| variant | primary / secondary / destructive / link and other explicit variants | The example uses primary submit and secondary toggle. |
| type | button by default | Set submit explicitly for form submission. |
| pressed | Secondary family only | Use secondary for the theme toggle. |
| loading | aria-busy and disabled control behavior | Use only for a genuine pending operation. |
| as="a" | Requires href | Navigation links do not support disabled/loading button states. |
| tabIndex | 0 or -1 | Positive tab indices are rejected. |

### Theme names

[Official reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-theme/src/constants.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| default / dark | Theme variants | Theme selection is explicit. |
| twilio / twilio-dark | Separate variants | Do not describe every variant as identical to default. |
| sendgrid / evergreen | Additional variants | Choose intentionally rather than using brand as an arbitrary decoration. |

## Twilio Paste Design System Use the upstream system without confusing the documentation fork

### Twilio source and independent continuation

Paste is published in the twilio-labs repository. During verification, old paste.twilio.design documentation routes redirected to that repository. The separately hosted Paste DSys site describes itself as an independent fork with no Twilio affiliation. This guide therefore grounds token values and component behavior in upstream source files.

A notification composer is a useful specimen because it exposes several states that cannot be captured by a static button gallery: editable content, review confirmation, a prepared snapshot, and a clear boundary before sending. No Twilio API is called by this preview.

[Supporting specification](https://github.com/twilio-labs/paste)

## Twilio Paste Design System Read the spacing scale before choosing a suffix

### Token numbers are names, not pixel values

space30 is half a rem, while space70 is one and a half rem. The 30 and 70 suffixes are positions in the scale, not 30px and 70px. At a 16px root, the composer can use 8px between label and field, 12px inside a control, and 24px between regions.

The YAML source uses hyphenated names. The reference table presents JavaScript-style names used by Paste consumers and keeps resolved values beside them. A rem-based value scales with the root font size; its pixel equivalent should not be treated as an unconditional browser measurement.

[Supporting specification](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/spacing.yml)

## Twilio Paste Design System Pair font sizes with separate line-height tokens

### The scale does not imply identical numeric values

Font and line-height aliases are separate. fontSize30 is 14px at the default root and lineHeight30 is 20px. fontSize70 is 24px with a 32px line-height option. These pairs keep labels and multiline content readable without turning every section into a large marketing heading.

The embedded specimen uses a system sans-serif stack and an application-owned phone illustration. Those choices are explicitly illustrative. No proprietary font file is redistributed, and no phone frame dimensions are presented as Paste tokens.

[Supporting specification](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/font-size.yml)

## Twilio Paste Design System Semantic text roles include contrast constraints

### Weak text is not the same as disabled text

The upstream color source records contrast pairings alongside roles. Main text, secondary text, errors, and success messages have different intended foreground roles. The weaker text role carries a warning against using it for ordinary enabled controls. A muted character count should not simply take the faintest available gray.

In the sample, blue marks action and dark neutral text carries the message. The prepared draft does not turn green merely because the user pressed a button: its status explains that a local snapshot was created. The sample values are tied to the linked palette; other theme variants may resolve differently.

[Supporting specification](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/global/text-color.yml)

## Twilio Paste Design System Theme selection is an explicit state change

### Provider variants and application surfaces

Theme exports a Provider and Consumer, along with named theme objects and utilities. The current variant constants include default, dark, twilio, twilio-dark, sendgrid, and evergreen. The example intentionally switches only between default and dark.

Native application-owned controls need a matching surface treatment when the provider changes. A provider can theme Paste components without magically restyling every external widget. The supplied code sets the surrounding foreground and background explicitly and identifies the textarea as application-owned.

[Supporting specification](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-theme/src/index.tsx)

## Twilio Paste Design System Use pressed state only on a supported button family

### Action, navigation, and pending work have different contracts

The Button implementation validates certain prop combinations. The theme toggle uses secondary with pressed. The form action sets type="submit", because the component defaults to a button type. An anchor-shaped button requires href and cannot be treated as a disabled or loading action.

- Use primary for preparing the draft and secondary for the independent theme toggle.
- Keep navigation as a link; do not attach href to a button without the corresponding anchor form.
- Reserve loading for an actual pending operation, because it changes both busy and disabled behavior.
- Avoid positive tabIndex values; the implementation restricts the supported values to 0 and -1.

[Supporting specification](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx)

## Twilio Paste Design System Separate editable copy from the reviewed snapshot

### A truthful sequence

The live preview follows the current textarea value. The prepared copy is stored separately and changes only after validation. Editing again must not quietly rewrite the previously prepared snapshot. The review checkbox is a local interaction exercise, not evidence of recipient consent or legal compliance.

1. Write content in the labeled textarea.
2. Review the current message and confirm the local review checkbox.
3. Prepare a snapshot without calling any messaging service.
4. Edit again and compare the draft against the prepared copy before preparing a new snapshot.

[Supporting specification](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx)

## Twilio Paste Design System Make feedback understandable without interpreting a phone mockup

### Labels and text feedback remain outside the illustration

The textarea has a visible label and links to count and error descriptions. The count is defined as Unicode code points; it does not claim to measure SMS segmentation, encoding, or cost. The prepared result is also visible as ordinary text outside the illustrative device.

Validation must identify an empty message or missing review confirmation. The status region announces the local result without pretending that a message was delivered. Keyboard focus remains visible on all native controls and buttons, including at the narrow viewport.

[Supporting specification](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx)

## Twilio Paste Design System Verify the package separately from the offline interpretation

### What the supplied example proves

The setup imports real Paste Theme and Button packages and gives a complete React composition. Native form controls are stated as application-owned rather than attributed to an unverified component API. The embedded version is an offline HTML interpretation with no dependency on an external CDN.

Before using it in a service, resolve peer dependencies, build the native example, and add a genuine backend boundary for sending. A successful local preview test establishes editor behavior, not a production messaging integration or a claim about Twilio delivery.

[Supporting specification](https://github.com/twilio-labs/paste)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Offline HTML interpretation of upstream Paste scales and button state rules; not the native runtime or a messaging service.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Paste notification draft studio</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f4f6;color:#121c2d;font:14px/20px Arial,sans-serif}header{background:#121c2d;color:white;padding:20px 32px;display:flex;justify-content:space-between;gap:16px}.brand{font-weight:700;letter-spacing:.02em}header small{color:#cacdd8}main{max-width:1000px;padding:32px;margin:auto}h1{font-size:28px;line-height:40px;margin:0 0 8px}h2{font-size:18px;line-height:28px;margin:0 0 16px}.intro{color:#606b85;margin:0 0 32px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:32px}form{background:white;border:1px solid #e1e3ea;border-radius:8px;padding:24px}label{display:block;font-weight:600}textarea{width:100%;font:16px/24px Arial,sans-serif;border:1px solid #8891aa;border-radius:4px;padding:12px;margin-top:8px;resize:vertical;min-height:150px}textarea:focus,button:focus-visible,input:focus-visible{outline:3px solid #0263e0;outline-offset:3px}.count{color:#606b85;font-size:12px;line-height:20px}.review{display:flex;align-items:start;gap:8px;margin-top:24px}.review label{font-weight:400}.review input{width:16px;height:16px;accent-color:#0263e0}button{font:600 14px/20px Arial,sans-serif;cursor:pointer;border:1px solid #0263e0;border-radius:4px;padding:10px 16px;background:#0263e0;color:white}button:hover{background:#043cb5}button.secondary{background:white;color:#0263e0}.error{color:#ad1111;min-height:20px}aside{text-align:center}.phone{margin:auto;background:white;border:8px solid #121c2d;border-radius:32px;min-height:400px;padding:24px 12px;box-shadow:0 12px 32px #121c2d14}.notch{width:72px;height:5px;background:#121c2d;border-radius:8px;margin:0 auto 24px}.sender{font-size:12px;color:#606b85;padding-bottom:16px;border-bottom:1px solid #e1e3ea}.bubble{background:#ebf4ff;border-radius:12px;padding:12px;margin-top:24px;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;min-height:70px}.caption{font-size:12px;color:#606b85}.prepared{padding:24px;background:#fff;border:1px solid #e1e3ea;border-radius:8px;margin-top:24px}.prepared p{white-space:pre-wrap;overflow-wrap:anywhere}.status{color:#606b85;font-size:12px}.foot{font-size:12px;color:#606b85;margin-top:24px}@media(max-width:650px){header{padding:16px}main{padding:24px 16px}.layout{grid-template-columns:1fr}.phone{max-width:250px;min-height:300px}form{padding:20px}.intro{margin-bottom:24px}}
</style><header><span class="brand">Paste / Message studio</span><small>Local preview</small></header><main><h1>Notification draft</h1><p class="intro">Write the message. Review the copy. Keep a prepared version.</p><div class="layout"><div><form id="composer" novalidate><h2>Compose your message</h2><label for="message">Message</label><textarea id="message" aria-describedby="count error">Your appointment is confirmed for Thursday at 10:00.</textarea><p id="count" class="count"></p><div class="review"><input id="reviewed" type="checkbox"><label for="reviewed">I reviewed this draft</label></div><p id="error" class="error" role="alert"></p><button>Prepare local draft</button></form><section class="prepared"><h2>Prepared copy</h2><p id="snapshot">No draft prepared yet.</p><p class="status" id="status" role="status">Nothing has been sent.</p></section></div><aside><div class="phone" aria-label="Illustrative phone preview"><div class="notch"></div><div class="sender">Sample service · Preview</div><div class="bubble" id="bubble"></div></div><p class="caption">Live preview of the editable message</p></aside></div><p class="foot">HTML interpretation of upstream Paste · Counts Unicode code points, not SMS segments · No messaging connection</p></main><script>
const $=id=>document.getElementById(id);function update(){$('bubble').textContent=$('message').value||'Your message will appear here.';$('count').textContent=Array.from($('message').value).length+' Unicode code points. Not an SMS segment estimate.'}$('message').oninput=()=>{update();$('reviewed').checked=false};$('composer').onsubmit=e=>{e.preventDefault();$('error').textContent='';$('message').removeAttribute('aria-invalid');if(!$('message').value.trim()){$('error').textContent='Write a message before preparing a draft.';$('message').setAttribute('aria-invalid','true');$('message').focus();return}if(!$('reviewed').checked){$('error').textContent='Confirm that you reviewed the message.';$('reviewed').focus();return}$('snapshot').textContent=$('message').value.trim();$('status').textContent='Draft prepared locally. Nothing was sent.'};update();
</script></html>

```

[Code reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx)

- The phone panel displays a draft snapshot. No SMS is sent; native Paste Theme and Button behavior require the separate React example.

### A local draft with real Paste theme and button state

Theme.Provider wraps the complete composer. Secondary pressed state changes the preview theme; a primary submit button prepares a snapshot after application validation. Labels, textarea, and checkbox are explicitly native application controls.

```jsx
// npm install @twilio-paste/button @twilio-paste/theme react react-dom
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Theme} from '@twilio-paste/theme';
import {Button} from '@twilio-paste/button';
// Native textarea and labels are application-owned; this is not Paste TextArea.
function Composer() {
  const [message,setMessage] = useState('Your appointment is confirmed for Thursday at 10:00.');
  const [snapshot,setSnapshot] = useState('');
  const [error,setError] = useState('');
  const [confirmed,setConfirmed] = useState(false);
  const [mode,setMode] = useState('default');
  const length = Array.from(message).length;
  const background = mode === 'dark' ? '#121c2d' : '#ffffff';
  const foreground = mode === 'dark' ? '#ffffff' : '#121c2d';
  function prepare(event) {
    event.preventDefault();
    if (!message.trim()) return setError('Write a message before preparing a draft.');
    if (!confirmed) return setError('Confirm that you reviewed the message.');
    setError(''); setSnapshot(message.trim());
  }
  return <Theme.Provider theme={mode}>
    <main style={{padding:24,background,color:foreground,maxWidth:760,margin:'auto'}}>
      <h1>Notification draft</h1>
      <Button variant="secondary" pressed={mode==='dark'} onClick={() => setMode(mode==='dark'?'default':'dark')}>Dark preview</Button>
      <form onSubmit={prepare}>
        <label htmlFor="message" style={{display:'block',marginTop:24}}>Message</label>
        <textarea id="message" rows={5} value={message} onChange={e=>{setMessage(e.target.value);setConfirmed(false);}}
          aria-describedby="count error" aria-invalid={!!error}
          style={{width:'100%',padding:12,margin:'8px 0',font:'inherit',borderRadius:4}} />
        <p id="count">{length} Unicode code points. This is not an SMS segment estimate.</p>
        <label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} /> I reviewed this draft</label>
        <p id="error" role="alert">{error}</p>
        <Button variant="primary" type="submit">Prepare local draft</Button>
      </form>
      <section aria-label="Prepared draft" style={{marginTop:24}}>
        <h2>Prepared copy</h2>
        <p style={{whiteSpace:'pre-wrap'}}>{snapshot || 'No draft prepared yet.'}</p>
        <p role="status">{snapshot ? 'Draft prepared locally. Nothing was sent.' : ''}</p>
      </section>
    </main>
  </Theme.Provider>;
}
createRoot(document.getElementById('root')).render(<Composer />);
```

[Code reference](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx)

- This example deliberately does not claim that native controls are the Paste TextArea component.
- The character display counts Unicode code points, not SMS segments, encoding units, or billable usage.
- The native package example is source-checked; the offline HTML preview is separately tested.

## Implementation Starting Point

Use the complete React entry above with a root element. The modular packages supply the native provider and button; choose compatible peer dependencies and pin the resolved versions in the application lockfile.

```bash
npm install @twilio-paste/button @twilio-paste/theme react react-dom
```

## Agent Prompt

Build a notification draft editor using Paste Theme.Provider and Button. Keep secondary pressed toggle semantics, rem spacing, source-backed text roles, and separate draft/snapshot state. Do not invent SMS segment counts or delivery results.

## Sources

- [Upstream Paste](https://github.com/twilio-labs/paste) — Authoritative repository and system identity.
- [Spacing](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/spacing.yml) — Rem-based aliases.
- [Type scale](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/font-size.yml) — Font-size aliases.
- [Line heights](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/line-height.yml) — Separate line-height scale.
- [Corners](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/border-radius.yml) — Radius aliases.
- [Text roles](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/global/text-color.yml) — Semantic colors and contrast pairings.
- [Palette](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-design-tokens/tokens/aliases/color-palette.yml) — Resolved source palette values.
- [Button source](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-core/components/button/src/Button.tsx) — Supported prop combinations and behaviors.
- [Theme exports](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-theme/src/index.tsx) — Native provider and utilities.
- [Theme variants](https://raw.githubusercontent.com/twilio-labs/paste/main/packages/paste-theme/src/constants.ts) — Explicit supported variant names.
