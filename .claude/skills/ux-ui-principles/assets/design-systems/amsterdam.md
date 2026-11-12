# Amsterdam Design System — OpenDesign Application Guide

Use Amsterdam’s real open-source Switch contract with a complete neutral theme, accessible labels and immediate reading preferences.

Independent OpenDesign specimen. Amsterdam brand tokens, Amsterdam Sans, official icons and logo are not included.

## Source Reference

- **Owner:** The repository is maintained by the City of Amsterdam. ([source](https://github.com/Amsterdam/design-system))
- **Reference portal:** The system publishes its documentation through Storybook. ([source](https://github.com/Amsterdam/design-system))
- **Design assets:** The repository links an official Figma library. ([source](https://github.com/Amsterdam/design-system))
- **Developer entry:** A React getting-started guide is linked in the repository. ([source](https://github.com/Amsterdam/design-system))
- **Community:** Amsterdam participates in the NL Design System community. ([source](https://github.com/Amsterdam/design-system))
- **Identity boundary:** The NOTICE distinguishes city branding and typeface permissions from software use. ([source](https://github.com/Amsterdam/design-system/blob/develop/NOTICE.md))


## Design Reference

CSS and React4.4.0 implementation inspected; proprietary token/assets boundary checked. All preview theme values are original.

### Open-source component contract

[Official reference](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| CSS package | @amsterdam/design-system-css 4.4.0 | Native Switch stylesheet used unchanged. |
| Class anatomy | ams-switch; ams-switch__input; ams-switch__label | Input immediately precedes its associated label. |
| Input semantics | type=checkbox; role=switch | Native checked state represents on/off. |
| Native behavior | Immediate binary setting | React source says no form submission is required. |
| React props | InputHTMLAttributes<HTMLInputElement> | checked, defaultChecked, onChange, disabled and ARIA props pass to input. |
| Focus | Input focus styles the following label | Do not hide the actual input with display:none. |

### Complete original neutral switch theme

[Official reference](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ams-switch-inline-size | 50px | Original switch track width. |
| --ams-switch-thumb-inline-size / block-size | 22px / 22px | Original circular thumb geometry. |
| --ams-switch-label-border-width | 3px | Track inset; checked translation uses this value. |
| --ams-switch-background-color | #666 | Original off-track color. |
| --ams-switch-checked-background-color | #286044 | Original on-track color; not an Amsterdam brand token. |
| --ams-switch-thumb-background-color | #fff | Original thumb color. |
| --ams-switch-disabled-background-color | #aaa | Disabled appearance; native disabled property supplies behavior. |
| --ams-switch-outline-offset | 4px | Focus ring separation. |
| --ams-switch-cursor / disabled-cursor | pointer / not-allowed | Explicit interaction configuration. |
| --ams-switch-thumb-hover-box-shadow | 0 0 0 2px #fff | Original hover treatment. |

### Application typography and layout

[Official reference](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Font / body | Arial / 18px with 1.5 leading | Original neutral configuration; no Amsterdam Sans asset. |
| Heading | 36px; 30px below700px | Application choice, not an official Amsterdam scale. |
| Layout | 900px maximum; two columns with32px gap | Application choice; one column below700px. |
| Larger reading mode | 22px article text | Local preference, not a global browser zoom replacement. |
| Reduced motion | OS preference plus local preview setting | CSS component already respects prefers-reduced-motion for its transitions. |

### Reuse and identity boundary

[Official reference](https://github.com/Amsterdam/design-system/blob/develop/NOTICE.md)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Component code | EUPL-1.2 or later | Retain license and applicable notices. |
| Documentation | CC0-1.0 | Separate from proprietary assets. |
| Token package4.3.0 | Proprietary assets | Its own LICENSE excludes it from the open-source license. |
| Amsterdam Sans / icons / logo | Restricted institutional assets | Not copied into this independent specimen. |

## Amsterdam Design System Separate component and theme

### Use the open-source layer honestly

Amsterdam publishes component CSS separately so its class contract can be implemented outside React. The stylesheet depends on CSS custom properties; importing it without a complete theme leaves important dimensions and colors unresolved. The native Switch stylesheet in this specimen is therefore paired with a complete original neutral configuration.

The repository separates open-source packages from proprietary assets. The inspected token package 4.3.0 has its own license notice excluding it from the open-source license. Amsterdam Sans, icons and the city logo also have specific restrictions. This guide uses their existence as context but does not redistribute them or claim that a public npm download grants unrestricted branding rights.

[Supporting specification](https://github.com/Amsterdam/design-system/blob/develop/NOTICE.md)

## Amsterdam Design System A complete neutral configuration

### Supply every property the component needs

The reference table identifies every variable used by the selected Switch stylesheet. Width, thumb dimensions, border width, colors, outline offset, cursor and hover treatment all have explicit values. These are original values for this specimen, not copied Amsterdam design tokens. That distinction lets readers reproduce the example without guessing missing theme pieces.

The track is 50px wide with a 22px thumb and 3px border. The native checked-state transform calculates its travel from thumb width and border width. Altering only the track width can therefore leave the thumb misaligned; change related geometry together and inspect both states.

```css
:root {
  --ams-switch-label-border-width:3px;
  --ams-switch-background-color:#666;
  --ams-switch-thumb-background-color:#fff;
  --ams-switch-thumb-inline-size:22px;
  --ams-switch-thumb-block-size:22px;
  --ams-switch-inline-size:50px;
  --ams-switch-checked-background-color:#286044;
  --ams-switch-disabled-background-color:#aaa;
  --ams-switch-disabled-cursor:not-allowed;
  --ams-switch-cursor:pointer;
  --ams-switch-outline-offset:4px;
  --ams-switch-thumb-hover-box-shadow:0 0 0 2px #fff;
}
```

[Code reference](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

[Supporting specification](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

## Amsterdam Design System Native Switch anatomy

### The label must follow the input

The React implementation renders a wrapper, an input and an empty associated label. Its CSS uses adjacent-sibling selectors to style the label from input focus, checked and disabled states. Preserve that ordering in a plain HTML implementation; inserting a description between input and label breaks those selectors.

The real input is a checkbox with role="switch". It keeps the native checked property and keyboard behavior. Because the visual label has no text, provide an accessible name through aria-label or aria-labelledby. The specimen references a visible setting title and attaches its explanation through aria-describedby.

```html
<strong id="reading-label">Larger text</strong>
<p id="reading-hint">Increase the article text size immediately.</p>
<div class="ams-switch">
  <input class="ams-switch__input" id="reading" type="checkbox" role="switch"
    aria-labelledby="reading-label" aria-describedby="reading-hint">
  <label class="ams-switch__label" for="reading"></label>
</div>
```

[Code reference](https://designsystem.amsterdam/?path=/docs/components-forms-switch--docs)

[Supporting specification](https://designsystem.amsterdam/?path=/docs/components-forms-switch--docs)

## Amsterdam Design System Immediate settings

### A switch changes the current view

The component source defines Switch as an immediate binary setting. The preview follows that contract: larger text changes article size, stronger contrast changes text and outline, and reduced motion removes the short badge appearance effect. There is no Save button pretending that these local choices are sent to an account service.

Restore defaults clears all three native checked states and reapplies the default article classes. A status message describes the enabled settings. Nothing persists after navigation or reload. A production preference service could add persistence, but should state whether the setting affects this page, a device or an account.

1. Turn on Larger text and inspect the paragraph size in the adjacent article.
2. Focus Stronger contrast and press Space to toggle it from the keyboard.
3. Restore defaults and verify all three switches and the article return together.

[Supporting specification](https://designsystem.amsterdam/?path=/docs/components-forms-switch--docs)

## Amsterdam Design System Keyboard, focus and motion

### Keep the native input available

The stylesheet reduces the visual input width but preserves the actual control. Its focus selector places the outline on the following label. Replacing the input with a decorative div would discard native form semantics and require a separate keyboard implementation. Do not apply display:none to the input.

The native stylesheet limits its transitions to prefers-reduced-motion:no-preference. The article effect also respects the operating-system preference, independently of the local toggle. A user asking for less motion at the system level should not need to discover an additional switch before the example behaves calmly.

- Use the checked property as the source of truth; do not invent an unrelated visual on-state.
- Provide a stable name for each setting and keep its explanation associated with the input.
- Test off, on, focus and disabled states after changing theme geometry or colors.

[Supporting specification](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

## Amsterdam Design System Reading preview composition

### Demonstrate the effect beside the control

The example uses a two-column composition so each setting has a visible consequence in the article. Below an application-specific 700px breakpoint, controls stack before the preview. The 900px maximum width and 32px gap are original layout decisions, not evidence for a citywide grid token.

The neutral font is Arial. Body text is 18px with 1.5 leading; the larger-text mode changes only the article to 22px. This is an example of an application setting, not a substitute for browser zoom or a claim that those sizes are prescribed by Amsterdam. Long labels wrap without reducing the native switch width.

[Supporting specification](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

## Amsterdam Design System CSS or React integration

### Choose the implementation layer

For an existing React application, the verified Switch accepts standard input attributes and forwards the ref to the input. Controlled use supplies checked and onChange; uncontrolled use can supply defaultChecked. The component does not supply application storage or an account-preference API.

For this independent HTML example, only the open-source Switch CSS is required. The setup and complete code provide the missing theme configuration and local state handling. The package installer may pull proprietary assets as dependencies; their presence on disk is not permission to import or ship them. The vendored specimen contains only the selected CSS and its open-source license.

[Supporting specification](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

## Amsterdam Design System Adoption and limitations

### Do not equate visual similarity with affiliation

The city system is intended to make municipal products consistent and accessible. Its reusable code can be studied and adapted within its license, but its logo, proprietary font and icon assets have separate terms. The preview uses original branding and neutral content so it is not mistaken for an Amsterdam service.

The verified scope is one native component with a complete custom theme and meaningful local behavior. It is not a full reimplementation of the city theme. A real product adopting the broader CSS package should define and test all variables required by the additional components rather than extrapolating this Switch configuration to unrelated controls.

[Supporting specification](https://github.com/Amsterdam/design-system/blob/develop/NOTICE.md)

## Component Examples

### Complete neutral Switch theme

Every variable required by the native stylesheet is defined; all values are original.

```css
:root {
  --ams-switch-label-border-width:3px;
  --ams-switch-background-color:#666;
  --ams-switch-thumb-background-color:#fff;
  --ams-switch-thumb-inline-size:22px;
  --ams-switch-thumb-block-size:22px;
  --ams-switch-inline-size:50px;
  --ams-switch-checked-background-color:#286044;
  --ams-switch-disabled-background-color:#aaa;
  --ams-switch-disabled-cursor:not-allowed;
  --ams-switch-cursor:pointer;
  --ams-switch-outline-offset:4px;
  --ams-switch-thumb-hover-box-shadow:0 0 0 2px #fff;
}
```

[Code reference](https://github.com/Amsterdam/design-system/tree/develop/packages/css)

### Accessible native anatomy

Real checkbox input, switch role and adjacent visual label.

```html
<strong id="reading-label">Larger text</strong>
<p id="reading-hint">Increase the article text size immediately.</p>
<div class="ams-switch">
  <input class="ams-switch__input" id="reading" type="checkbox" role="switch"
    aria-labelledby="reading-label" aria-describedby="reading-hint">
  <label class="ams-switch__label" for="reading"></label>
</div>
```

[Code reference](https://designsystem.amsterdam/?path=/docs/components-forms-switch--docs)

### Complete immediate reading preferences

Native Switch CSS, custom theme and visible local effects.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reading preferences</title><link rel="stylesheet" href="vendor/amsterdam-switch-4.4.0/switch.css"><style>:root{--ams-switch-label-border-width:3px;--ams-switch-background-color:#666;--ams-switch-thumb-background-color:#fff;--ams-switch-thumb-inline-size:22px;--ams-switch-thumb-block-size:22px;--ams-switch-inline-size:50px;--ams-switch-checked-background-color:#286044;--ams-switch-disabled-background-color:#aaa;--ams-switch-disabled-cursor:not-allowed;--ams-switch-cursor:pointer;--ams-switch-outline-offset:4px;--ams-switch-thumb-hover-box-shadow:0 0 0 2px #fff;}*{box-sizing:border-box}body{margin:0;padding:32px 24px;font:18px/1.5 Arial,sans-serif;color:#242b28;background:#fafbf9}main{max-width:900px;margin:auto}h1{font-size:36px;line-height:1.2;margin:8px 0 16px}h2{font-size:24px;line-height:1.3}.layout{display:grid;grid-template-columns:1fr 1fr;gap:32px}.setting{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #d5ddd7;padding:20px 0}.setting p{margin:4px 0;font-size:16px}.ams-switch{flex-shrink:0}.sample{background:white;border:1px solid #d5ddd7;padding:24px}.sample.large{font-size:22px}.sample.high{color:#000;border:3px solid #000}.sample .meta{font-size:.85em;color:inherit}.badge{display:inline-block;background:#e7eee8;padding:4px 8px}.sample:not(.quiet) .badge{animation:appear .3s ease}@keyframes appear{from{opacity:.2}to{opacity:1}}button{font:inherit;border:1px solid #286044;background:#fff;color:#286044;padding:10px 16px;cursor:pointer}button:focus-visible{outline:3px solid #286044;outline-offset:3px}footer{font-size:14px;margin-top:32px;border-top:1px solid #d5ddd7;padding-top:20px}#status{min-height:1.5em}@media(max-width:700px){body{padding:24px 16px}.layout{grid-template-columns:1fr}h1{font-size:30px}}@media(prefers-reduced-motion:reduce){.sample .badge{animation:none!important}}</style><main><small>PERSONAL READING VIEW</small><h1>Make this page easier to read</h1><p>Settings apply immediately to the preview. They are not saved after you leave.</p><div class="layout"><section aria-label="Reading preferences"><div class="setting"><div><strong id="large-label">Larger text</strong><p id="large-hint">Increase the article text size.</p></div><div class="ams-switch"><input class="ams-switch__input" type="checkbox" role="switch" id="large" aria-labelledby="large-label" aria-describedby="large-hint"><label class="ams-switch__label" for="large"></label></div></div><div class="setting"><div><strong id="high-label">Stronger contrast</strong><p id="high-hint">Use black text and a stronger outline.</p></div><div class="ams-switch"><input class="ams-switch__input" type="checkbox" role="switch" id="high" aria-labelledby="high-label" aria-describedby="high-hint"><label class="ams-switch__label" for="high"></label></div></div><div class="setting"><div><strong id="quiet-label">Reduce preview motion</strong><p id="quiet-hint">Remove the short badge appearance effect.</p></div><div class="ams-switch"><input class="ams-switch__input" type="checkbox" role="switch" id="quiet" aria-labelledby="quiet-label" aria-describedby="quiet-hint"><label class="ams-switch__label" for="quiet"></label></div></div><button id="reset">Restore defaults</button><p id="status" role="status">Default reading settings.</p></section><article class="sample" id="sample"><span class="badge">Reading preview</span><h2>A quieter place to read</h2><p>A community reading room offers shared tables, individual seats and a small collection of reference books.</p><p>Before visiting, check opening hours and ask about any facilities you need.</p><p class="meta">Original example content · no external service</p></article></div><footer>Native Amsterdam Switch CSS 4.4.0 with an original neutral token configuration. No proprietary Amsterdam fonts, icons, logos or theme tokens. Original local preference behavior.</footer></main><script>const ids=['large','high','quiet'];function apply(){const enabled=[];ids.forEach(id=>{const on=document.getElementById(id).checked;document.querySelector('#sample').classList.toggle(id,on);if(on)enabled.push(document.querySelector('#'+id+'-label').textContent)});document.querySelector('#status').textContent=enabled.length?enabled.join(', ')+'.':'Default reading settings.'}ids.forEach(id=>document.getElementById(id).onchange=apply);document.querySelector('#reset').onclick=()=>{ids.forEach(id=>document.getElementById(id).checked=false);apply()};</script></html>
```

[Code reference](https://designsystem.amsterdam/?path=/docs/components-forms-switch--docs)

## Implementation Starting Point

Open-source CSS only; complete original theme and working HTML follow. No proprietary token or asset bundle is shipped. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/amsterdam.html. Do not open module-based examples through file://.

```bash
npm install @amsterdam/design-system-css@4.4.0
# Copy dist/switch/switch.css into your public assets.
# Load it before the complete original theme configuration below.
# Do not import the proprietary assets or tokens for this neutral example.

```

## Agent Prompt

Use Amsterdam open-source Switch CSS with a complete original theme. Preserve wrapper/input/adjacent-label anatomy, role=switch and accessible naming. Apply binary settings immediately and use checked as state. Respect reduced motion and distinguish local preferences from persisted account settings. Do not import proprietary tokens, fonts, logos or icons without the relevant rights.

## Sources

- [Repository and licenses](https://github.com/Amsterdam/design-system) — Open-source packages and proprietary separation.
- [CSS contract](https://github.com/Amsterdam/design-system/tree/develop/packages/css) — Class architecture, CSS usage and theme dependency.
- [Switch documentation](https://designsystem.amsterdam/?path=/docs/components-forms-switch--docs) — Immediate binary setting semantics.
- [Asset notice](https://github.com/Amsterdam/design-system/blob/develop/NOTICE.md) — Font, icon, branding and logo restrictions.
- [Token package scope](https://github.com/Amsterdam/design-system/tree/develop/packages-proprietary/tokens) — Separate proprietary token layer.
- [Download complete working example](/assets/demos/amsterdam-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
