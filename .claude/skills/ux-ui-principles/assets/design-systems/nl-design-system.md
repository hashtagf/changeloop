# NL Design System — OpenDesign Application Guide

Compose a public-service interface from real contributor components and an explicit theme. This reference uses Utrecht CSS to demonstrate token mapping, data-list anatomy and two original themes with the same editing workflow.

NL Design System is a brand-independent ecosystem. This educational example selects one contributor implementation and two original themes; it does not claim a national visual style or use a municipality’s identity.

## Source Reference

- **System model:** NL Design System describes an ecosystem of design systems. ([source](https://www.nldesignsystem.nl/handboek/developer/introductie/))
- **Separation:** Brand-independent components can be combined with an organization’s theme. ([source](https://www.nldesignsystem.nl/handboek/developer/introductie/))
- **Theme format:** The developer introduction describes design tokens stored as JSON. ([source](https://www.nldesignsystem.nl/handboek/developer/introductie/))
- **Composition:** Projects can combine components contributed by different organizations. ([source](https://www.nldesignsystem.nl/handboek/developer/introductie/))
- **Resources:** The ecosystem connects design resources and coded components. ([source](https://www.nldesignsystem.nl/))
- **Catalog:** An official component overview supports discovery across the ecosystem. ([source](https://www.nldesignsystem.nl/componenten/))


## Design Reference

Concrete contributor composition: @utrecht/component-library-css 9.0.15. Public token names and classes are inspected library APIs; numeric values and colours labelled “example” are original application settings, not a universal NL Design System specification.

### Architecture

[Official reference](https://www.nldesignsystem.nl/handboek/developer/introductie/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Component implementation | Utrecht CSS 9.0.15 | A selected contributor, not the only NL Design System implementation. |
| Theme boundary | Wrapper-scoped CSS custom properties | The same semantic markup supports multiple identities. |
| Source design tokens | Design Tokens JSON standard | Organisations describe their own house styles for reuse. |

### Real button token API

[Official reference](https://github.com/nl-design-system/utrecht/tree/main/packages/button)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --utrecht-button-min-block-size | 48px in example; 44px library fallback | Explicit target size. |
| --utrecht-button-border-radius | 4px / 8px in example themes | Application-owned geometry. |
| --utrecht-button-primary-action-background-color | #005a5b / #57328c in example themes | Original action colours; white foreground. |
| --utrecht-button-font-size | 1rem in example | Component text role. |
| --utrecht-focus-outline-width | 3px in example | Public focus-ring configuration. |

### Data-list API

[Official reference](https://github.com/nl-design-system/utrecht/tree/main/packages/data-list)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| .utrecht-data-list + .utrecht-data-list--rows | dl root | Semantic named values. |
| .utrecht-data-list__item | Key/value wrapper | Responsive grid row. |
| --utrecht-data-list-rows-column-min-inline-size | 12ch in example | Minimum column width chosen for receipt labels. |
| --utrecht-data-list-rows-column-inline-size | 45% in example | Two columns when space permits. |
| --utrecht-data-list-rows-gap | 24px in example | Gap between key and value. |

## NL Design System Choose a composition

### An ecosystem, not one theme

NL Design System explicitly supports combining contributions from multiple organisations while describing each organisation’s house style through design tokens. The practical unit of adoption is therefore a selected component implementation plus a selected theme. This page chooses the Utrecht CSS contributor implementation and an original demonstration theme.

That choice does not assert that Utrecht is the canonical implementation of every NL Design System component. It gives the reader a reproducible path without inventing a national font, blue colour or spacing scale. The actual native CSS package is @utrecht/component-library-css 9.0.15.

[Supporting specification](https://www.nldesignsystem.nl/handboek/developer/introductie/)

## NL Design System Public component tokens

### Keep application values outside library CSS

The supplied theme sets public --utrecht-* custom properties on a wrapper. The button consumes those values while its class determines the component anatomy. Variables beginning --_utrecht- are internal calculations in the inspected CSS; changing those directly would couple an application to implementation details.

The example’s teal #005a5b and purple #57328c are original application colours. They demonstrate replaceable branding without copying a municipal identity. Both use white action text, and the hover tone is defined separately. No colour is described as an official NL Design System token value.

```css
.example-theme {
  /* Original application values, not a national house style. */
  --utrecht-document-font-family: Arial, sans-serif;
  --utrecht-button-font-size: 1rem;
  --utrecht-button-line-height: 1.5;
  --utrecht-button-font-weight: 700;
  --utrecht-button-border-radius: .25rem;
  --utrecht-button-min-block-size: 48px;
  --utrecht-button-padding-block-start: .75rem;
  --utrecht-button-padding-block-end: .75rem;
  --utrecht-button-padding-inline-start: 1.25rem;
  --utrecht-button-padding-inline-end: 1.25rem;
  --utrecht-button-primary-action-background-color: #005a5b;
  --utrecht-button-primary-action-color: #fff;
  --utrecht-button-primary-action-hover-background-color: #003f40;
  --utrecht-button-primary-action-hover-color: #fff;
  --utrecht-focus-outline-color: #111;
  --utrecht-focus-outline-width: 3px;
  --utrecht-focus-outline-offset: 3px;
  --utrecht-focus-outline-style: solid;
}
```

[Code reference](https://github.com/nl-design-system/utrecht/tree/main/packages/button)

[Supporting specification](https://github.com/nl-design-system/utrecht/tree/main/packages/button)

## NL Design System Typography and dimensions

### Set the missing theme decisions

The demo defines Arial, sans-serif at 18px with a 1.6 line height for document reading. The first theme uses a 32px heading and a 4px button corner; the second uses the same readable body size with an 8px corner and a serif heading. These are deliberately visible theme changes.

The native button has a 44px minimum block-size fallback when its token is absent. Our theme supplies 48px and explicit block/inline padding. That is a real CSS API with an application-selected value, rather than a guessed ecosystem-wide dimension. The layout uses a 56rem content maximum and 24px gaps supplied by this example.

[Supporting specification](https://github.com/nl-design-system/utrecht/tree/main/packages/component-library-css)

## NL Design System Data-list anatomy

### A definition list for named values

The receipt uses a dl with .utrecht-data-list and the .utrecht-data-list--rows modifier. Each .utrecht-data-list__item groups a dt key and dd value. The rows modifier activates the responsive grid, row gaps and borders; without it the base data-list does not enable that layout. The HTML remains meaningful before any theme loads.

Our receipt lists a collection location, a reference and the selected item. This is not a table of repeating records: each key identifies one different attribute of the same request. At narrow sizes the key and value stack. The application sets row tokens so long location labels fit without clipping.

- Use dt for the attribute name and dd for its current value.
- Put each key/value pair in the documented item wrapper.
- Allow identifiers and long location names to wrap instead of widening the page.

[Supporting specification](https://github.com/nl-design-system/utrecht/tree/main/packages/data-list)

## NL Design System Action semantics

### A button class does not supply a workflow

.utrecht-button supplies the base component, and .utrecht-button--primary-action selects the primary appearance token group. The native element still needs type=button for a local action that should not submit a surrounding form. The data-list remains read-only until the application opens an editing panel.

The demo’s Change collection location button reveals a fieldset of native radios. Saving changes updates the definition-list value and announces the new location through a polite status region. Cancelling closes the panel without changing the saved value. These behaviours are application code; installing a CSS bundle alone does not implement them.

[Supporting specification](https://github.com/nl-design-system/utrecht/tree/main/packages/button)

## NL Design System Switch themes safely

### Change the wrapper, preserve the record

The theme selector changes data-theme on the outer wrapper. Component classes, record values and the selected radio remain intact. This gives a concrete demonstration of white-label separation: the same receipt and interaction can support distinct visual identities.

A theme switch is a development demonstration here, not a setting that a public service is required to offer. In a real multi-organisation service, choose the theme from trusted application configuration. Theme values should not alter eligibility, validation or the meaning of a status.

1. Load the versioned component CSS once.
2. Apply the relevant theme tokens to a containing element.
3. Render the same semantic component markup within that container.
4. Verify focus, wrapping and state colours for each supported theme.

[Supporting specification](https://www.nldesignsystem.nl/handboek/developer/introductie/)

## NL Design System Accessibility and maturity

### Assess the selected contribution

The NL Design System relay model describes how contributions progress toward shared standards. A component’s presence in a community repository is not by itself an assurance that every composition is production-ready. Verify the selected implementation, supported states and current maturity against the component documentation.

The preview keeps a visible legend for location choices, announces the saved result and returns focus to the initiating button after editing. Theme switching does not remove focus. The screen remains usable with native radio keyboard controls and the app’s own focus outlines; these checks complement, rather than replace, the contributor component’s testing.

[Supporting specification](https://www.nldesignsystem.nl/handboek/estafettemodel/)

## NL Design System Install and own the theme

### A CSS-only integration

Install the verified CSS package and import dist/index.css through a CSS-aware bundler, followed by your theme stylesheet. No React provider or JavaScript component initialiser is required for the CSS-only data list and button used here. The original application script owns edit, save, cancel and theme switching.

The bundled component source is licensed EUPL-1.2. Preserve source and licence notices when distributing it and do not infer permission to reuse a municipality’s logo from a code licence. This example intentionally provides original themes and no municipal marks.

[Supporting specification](https://github.com/nl-design-system/utrecht/tree/main/packages/component-library-css)

## Component Examples

### Theme tokens consumed by a native button

A complete selected button theme. Values are original; API names come from Utrecht.

```css
.example-theme {
  /* Original application values, not a national house style. */
  --utrecht-document-font-family: Arial, sans-serif;
  --utrecht-button-font-size: 1rem;
  --utrecht-button-line-height: 1.5;
  --utrecht-button-font-weight: 700;
  --utrecht-button-border-radius: .25rem;
  --utrecht-button-min-block-size: 48px;
  --utrecht-button-padding-block-start: .75rem;
  --utrecht-button-padding-block-end: .75rem;
  --utrecht-button-padding-inline-start: 1.25rem;
  --utrecht-button-padding-inline-end: 1.25rem;
  --utrecht-button-primary-action-background-color: #005a5b;
  --utrecht-button-primary-action-color: #fff;
  --utrecht-button-primary-action-hover-background-color: #003f40;
  --utrecht-button-primary-action-hover-color: #fff;
  --utrecht-focus-outline-color: #111;
  --utrecht-focus-outline-width: 3px;
  --utrecht-focus-outline-offset: 3px;
  --utrecht-focus-outline-style: solid;
}
```

[Code reference](https://github.com/nl-design-system/utrecht/tree/main/packages/button)

### Named values and an edit trigger

Semantic dl/dt/dd with contributor component classes.

```html
<dl class="utrecht-data-list utrecht-data-list--rows">
  <div class="utrecht-data-list__item">
    <dt class="utrecht-data-list__item-key">Collection location</dt>
    <dd class="utrecht-data-list__item-value">North library desk</dd>
  </div>
  <div class="utrecht-data-list__item">
    <dt class="utrecht-data-list__item-key">Reference</dt>
    <dd class="utrecht-data-list__item-value">DEMO-2048</dd>
  </div>
</dl>
<button type="button" class="utrecht-button utrecht-button--primary-action">
  Change collection location
</button>
```

[Code reference](https://github.com/nl-design-system/utrecht/tree/main/packages/data-list)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NL Design System composition</title><link rel="stylesheet" href="vendor/utrecht-9.0.15/index.css"><style>.example-theme {
  /* Original application values, not a national house style. */
  --utrecht-document-font-family: Arial, sans-serif;
  --utrecht-button-font-size: 1rem;
  --utrecht-button-line-height: 1.5;
  --utrecht-button-font-weight: 700;
  --utrecht-button-border-radius: .25rem;
  --utrecht-button-min-block-size: 48px;
  --utrecht-button-padding-block-start: .75rem;
  --utrecht-button-padding-block-end: .75rem;
  --utrecht-button-padding-inline-start: 1.25rem;
  --utrecht-button-padding-inline-end: 1.25rem;
  --utrecht-button-primary-action-background-color: #005a5b;
  --utrecht-button-primary-action-color: #fff;
  --utrecht-button-primary-action-hover-background-color: #003f40;
  --utrecht-button-primary-action-hover-color: #fff;
  --utrecht-focus-outline-color: #111;
  --utrecht-focus-outline-width: 3px;
  --utrecht-focus-outline-offset: 3px;
  --utrecht-focus-outline-style: solid;
}
*{box-sizing:border-box}body{margin:0}.example-theme{font:18px/1.6 Arial,sans-serif;color:#222;--accent:#005a5b;--wash:#eef6f4;--utrecht-data-list-rows-column-min-inline-size:12ch;--utrecht-data-list-rows-column-inline-size:45%;--utrecht-data-list-rows-gap:24px;--utrecht-data-list-rows-border-bottom-width:1px;--utrecht-data-list-rows-border-bottom-color:#ccd4d2;--utrecht-data-list-rows-item-padding-block-start:16px;--utrecht-data-list-rows-item-padding-block-end:16px;--utrecht-data-list-item-key-font-weight:700;--utrecht-data-list-item-value-line-height:1.6}.example-theme[data-theme=plum]{--accent:#57328c;--wash:#f5effa;--utrecht-button-primary-action-background-color:#57328c;--utrecht-button-primary-action-hover-background-color:#3c2262;--utrecht-button-border-radius:8px}.example-theme[data-theme=plum] h1{font-family:Georgia,serif}.toolbar{background:var(--wash);padding:20px 24px;border-bottom:4px solid var(--accent);display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}.toolbar label{font-size:16px}.toolbar select{font:inherit;max-width:100%;padding:8px}article{max-width:56rem;margin:auto;padding:32px 24px}h1{font-size:32px;line-height:1.3;margin:8px 0 24px}h2{font-size:24px}p{margin:16px 0}.utrecht-data-list__item-value{margin:0;overflow-wrap:anywhere}.utrecht-button{margin-block:8px}.editor{background:var(--wash);padding:24px;margin-block:24px}fieldset{border:0;padding:0;margin:0}legend{font-size:22px;font-weight:700;margin-bottom:16px}.choice{display:flex;align-items:center;gap:12px;padding:12px 0}.choice input{width:24px;height:24px;accent-color:var(--accent)}.buttons{display:flex;gap:24px;flex-wrap:wrap;align-items:center}.cancel{font:inherit;background:none;border:0;text-decoration:underline;min-height:48px;color:var(--accent);cursor:pointer}small{display:block;font-size:14px;margin-top:32px;color:#555}:focus-visible{outline:3px solid #111;outline-offset:3px}[hidden]{display:none!important}#notice{font-weight:700;color:var(--accent)}@media(max-width:600px){.example-theme{--utrecht-data-list-rows-column-min-inline-size:100%;}h1{font-size:28px}.toolbar{align-items:flex-start;flex-direction:column}.editor{padding:16px}}
</style><main class="example-theme" data-theme="teal"><div class="toolbar"><strong>Community collection · Example</strong><label>Original theme <select id="theme"><option value="teal">Teal</option><option value="plum">Plum</option></select></label></div><article><p>CONTRIBUTOR COMPONENTS + YOUR THEME</p><h1>Review your collection details</h1><p>This receipt uses Utrecht CSS components. Switching the theme changes public design tokens and preserves your choices.</p><dl class="utrecht-data-list utrecht-data-list--rows"><div class="utrecht-data-list__item"><dt class="utrecht-data-list__item-key">Item</dt><dd class="utrecht-data-list__item-value">Community reading pack</dd></div><div class="utrecht-data-list__item"><dt class="utrecht-data-list__item-key">Collection location</dt><dd class="utrecht-data-list__item-value" id="location">North library desk</dd></div><div class="utrecht-data-list__item"><dt class="utrecht-data-list__item-key">Reference</dt><dd class="utrecht-data-list__item-value">DEMO-2048</dd></div></dl><button id="edit" type="button" class="utrecht-button utrecht-button--primary-action">Change collection location</button><form class="editor" hidden><fieldset><legend>Choose a collection location</legend><label class="choice"><input type="radio" name="place" value="North library desk" checked>North library desk</label><label class="choice"><input type="radio" name="place" value="Riverside community room">Riverside community room</label><label class="choice"><input type="radio" name="place" value="Central welcome counter">Central welcome counter</label></fieldset><div class="buttons"><button class="utrecht-button utrecht-button--primary-action" type="submit">Save location</button><button type="button" class="cancel" id="cancel">Cancel</button></div></form><p id="notice" role="status"></p><small>Independent OpenDesign specimen. Utrecht CSS 9.0.15; original themes and fictional data. No municipal identity or external submission.</small></article></main><script>
const main=document.querySelector('main'),theme=document.querySelector('#theme'),edit=document.querySelector('#edit'),form=document.querySelector('form'),locationText=document.querySelector('#location'),notice=document.querySelector('#notice');let saved=locationText.textContent;theme.onchange=()=>main.dataset.theme=theme.value;edit.onclick=()=>{form.hidden=false;edit.hidden=true;notice.textContent='';[...form.elements.place].forEach(r=>r.checked=r.value===saved);form.querySelector(':checked').focus()};function close(){form.hidden=true;edit.hidden=false;edit.focus()}form.onsubmit=e=>{e.preventDefault();saved=form.elements.place.value;locationText.textContent=saved;notice.textContent='Collection location updated to '+saved+'.';close()};document.querySelector('#cancel').onclick=()=>{notice.textContent='No changes saved.';close()};
</script></html>
```

[Code reference](https://github.com/nl-design-system/utrecht)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

The standalone preview loads the same versioned native CSS locally. CSS-only button/data-list components do not require a React provider. Original theme values must accompany the library. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/nl-design-system.html. Do not open module-based examples through file://.

```bash
npm install @utrecht/component-library-css@9.0.15
# CSS-aware application entry:
# import '@utrecht/component-library-css/dist/index.css';
# import './example-theme.css';
# Wrap the dl/button composition in <main class="example-theme">.
# Add application event handlers for editing and theme selection.
```

## Agent Prompt

Use @utrecht/component-library-css 9.0.15 for a receipt definition list and primary button. Supply an original wrapper-scoped theme through public --utrecht-* tokens, keeping internal --_utrecht-* variables untouched. Provide location editing with labelled radio choices, save/cancel, a polite update announcement and focus return. Demonstrate a second original theme without replacing component markup or losing data. Identify all numeric theme values as application choices.

## Sources

- [Ecosystem overview](https://www.nldesignsystem.nl/) — Shared public-service design resources and community context.
- [Developer introduction](https://www.nldesignsystem.nl/handboek/developer/introductie/) — Components, organizational themes and design-token architecture.
- [Component catalog](https://www.nldesignsystem.nl/componenten/) — Discovering documented components and their available references.
- [Download complete working example](/assets/demos/nl-design-system-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
