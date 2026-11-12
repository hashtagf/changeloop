# Kobalte Design System — OpenDesign Application Guide

Kobalte provides headless components for Solid, including numeric fields with separate raw and formatted values, compound checkbox anatomy and pressed-state buttons. This guide connects those primitives to Solid signals through a recipe scaler with derived quantities and resettable ingredient checks.

Verified with Kobalte 0.13.14 and Solid 1.9.15. All recipe-* tokens, CSS illustration and ingredient amounts are original specimen data. Pinning and gathering remain local state; no account, shopping service or persistent recipe store is connected.

## Source Reference

- **Framework:** Solid ([source](https://kobalte.dev/docs/core/overview/getting-started))
- **Visual layer:** Headless; application CSS required ([source](https://kobalte.dev/docs/core/overview/styling))
- **Number model:** rawValue and onRawValueChange ([source](https://kobalte.dev/docs/core/components/number-field))
- **Field anatomy:** Label, Input, triggers, Description, ErrorMessage ([source](https://kobalte.dev/docs/core/components/number-field))
- **Checkbox anatomy:** Input, Control, Indicator, Label ([source](https://kobalte.dev/docs/core/components/checkbox))
- **Toggle model:** pressed and onChange ([source](https://kobalte.dev/docs/core/components/toggle-button))


## Design Reference

Kobalte 0.13.14 supplies headless Solid primitives, not a canonical visual scale. Every recipe-* color and dimension below is the complete original application configuration. API names and state attributes were verified against the installed package and official component documentation.

### Original semantic colors

[Official reference](https://kobalte.dev/docs/core/overview/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --recipe-canvas | #f6f2ec | Outer canvas |
| --recipe-surface | #fffefa | Recipe and portion panels |
| --recipe-ink | #403a30 | Primary text |
| --recipe-muted | #807465 | Supporting text |
| --recipe-line | #e6ded2 | Dividers and borders |
| --recipe-action | #95612f | Selected checkbox and action text |
| --recipe-on-action | #fff | Foreground for filled action |
| --recipe-focus | #b88955 | Visible keyboard focus |
| --recipe-soft | #f1e4d3 | Stepper and pressed pin background |

### Original typography and dimensions

[Official reference](https://kobalte.dev/docs/core/overview/styling)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Body | system-ui, sans-serif | No font download |
| Page heading | 34px / 1.15; 29px narrow | Original hierarchy |
| Recipe title | Georgia, serif; 30px / 1.2 | Original editorial accent |
| Ingredient copy | 13px / 1.5; 12px narrow | Readable wrapped labels |
| --recipe-space-1 / 2 / 3 | 4px / 8px / 12px | Small gaps |
| --recipe-space-4 / 6 / 8 | 16px / 24px / 32px | Panel and page spacing |
| Panel radius | 16px | Original surface geometry |
| Checkbox control | 21 × 21px; 5px radius | Original visible indicator |
| Stepper trigger | 42px wide | Native trigger with original geometry |
| Layout breakpoint | 760px | Two columns become one |
| Focus ring | 3px; 3px offset | Original visible keyboard treatment |

### Native component state contract

[Official reference](https://kobalte.dev/docs/core/components/number-field)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| NumberField.rawValue | number | Arithmetic state rather than formatted text |
| NumberField.onRawValueChange | (value: number) => void | Updates quantities and clears stale checks |
| minValue / maxValue / step | 1 / 8 / 1 | Application limits passed to native number field |
| formatOptions.maximumFractionDigits | 0 | Whole-portion display |
| validationState | valid \| invalid | Application validity reflected in native field |
| Checkbox.checked / onChange | boolean / callback | Controlled ingredient selection |
| Checkbox data attributes | data-checked; data-focus-visible | Style native checked and keyboard-focus states |
| ToggleButton.pressed / onChange | boolean / callback | Controlled local pin |
| ToggleButton data-pressed | present when pressed | Filled local pin styling |

## Kobalte Design System Connect Kobalte Components to Solid Signals

### Connect Kobalte Components to Solid Signals

The component uses Solid signals for portions, gathered ingredients and the pin. createMemo derives validity from the numeric signal, and For renders a stable ingredient collection. Kobalte’s controlled props read these signals directly; updates do not require a separate form provider or a React-style state adapter.

NumberField, Checkbox and ToggleButton are imported from their component entry points. Their responsibilities differ: the number field handles editable numeric input, each checkbox represents one gathered ingredient, and the toggle holds the recipe’s pin. The arithmetic and invalidation rules stay in application functions rather than being embedded in visual selectors.

[Supporting specification](https://kobalte.dev/docs/core/overview/getting-started)

## Kobalte Design System Keep Numeric State Separate from Formatted Text

### Keep Numeric State Separate from Formatted Text

NumberField receives rawValue={portions()} and onRawValueChange={update}. The numeric signal drives multiplication directly, while the input handles formatting and user editing. Feeding formatted display text back into arithmetic would introduce parsing assumptions about separators or locale that the native primitive already addresses.

The example permits one through eight whole portions, with a step of one and maximumFractionDigits set to zero. A separate computed predicate still checks finiteness, integrality and bounds because an editable field can temporarily hold an incomplete or invalid value. While invalid, totals display an em dash and ingredient checkboxes are disabled. The interface does not present a plausible but incorrect quantity as if the user had supplied valid input.

[Supporting specification](https://kobalte.dev/docs/core/components/number-field)

## Kobalte Design System Compose the Field from Its Native Label and Messages

### Compose the Field from Its Native Label and Messages

The number field contains Label, DecrementTrigger, Input, IncrementTrigger, Description and ErrorMessage. The visible description explains both the range and the consequence of changing portions. The triggers have meaningful labels, Fewer portions and More portions, so their symbolic minus and plus marks do not have to carry the whole accessible name.

validationState switches between valid and invalid using the application predicate. ErrorMessage belongs to that native field rather than being an unrelated paragraph placed elsewhere on the page. For a submitted form, Kobalte also provides a HiddenInput for raw-value serialization; this local example does not include one because it has no submission endpoint or form payload.

[Supporting specification](https://kobalte.dev/docs/core/components/number-field)

## Kobalte Design System Keep Ingredient Selection in an Immutable Set

### Keep Ingredient Selection in an Immutable Set

Each ingredient uses the complete Checkbox anatomy: Input, Control, Indicator and Label. The real input preserves semantics and keyboard interaction while the visible control receives the check mark and original state styles. The label includes both the ingredient name and the amount, making the quantity part of the item a reader is gathering.

mark creates a new Set from the previous selection before adding or removing an ID. Mutating the existing Set alone would not provide the same reliable signal update. The rendered count reads the Set size, and each Checkbox reads membership by stable ingredient ID. A quantity change clears that entire selection because gathering 320 grams is not evidence that the new 400-gram requirement is satisfied.

- Associate every visible ingredient name with Checkbox.Label.
- Retain Checkbox.Input even when the visible square is custom styled.
- Use stable IDs for selection and create a new Set for each update.

[Supporting specification](https://kobalte.dev/docs/core/components/checkbox)

## Kobalte Design System Use a Toggle for a Persistent Local Choice

### Use a Toggle for a Persistent Local Choice

The pin is a ToggleButton with pressed and onChange, not a normal button that only changes its caption. Its pressed state is reflected in native semantics and the data-pressed selector. The label changes to Pinned with a check mark, and the nearby status explains that this affects the local preview only.

Pinning does not change the ingredient quantities or selection. Changing portions clears ingredient checks but preserves the pin because the recipe identity has not changed. Restore default recipe resets all three model concerns together: four portions, an empty ingredient Set and an unpressed pin. These different reset boundaries follow the meaning of the state rather than clearing everything on every interaction.

[Supporting specification](https://kobalte.dev/docs/core/components/toggle-button)

## Kobalte Design System Give Headless Controls a Reproducible Visual Configuration

### Give Headless Controls a Reproducible Visual Configuration

The recipe stylesheet separates the numeric input’s editing surface, its stepper triggers and the checkbox selection role. The muted ingredient text is applied only after a check; quantities remain legible so the user can still compare the gathered amount with the current portion count.

Spacing uses four, eight, twelve, sixteen, twenty-four and thirty-two pixels. The original type hierarchy mixes a system sans-serif for controls with Georgia for the recipe title. A twenty-one-pixel visual checkbox sits beside a full associated label; the label remains the useful activation area. These exact values are included in the full CSS so the reader can reproduce the specimen without guessing at a screenshot.

[Supporting specification](https://kobalte.dev/docs/core/overview/styling)

## Kobalte Design System Let the Composition Shrink without Hiding Information

### Let the Composition Shrink without Hiding Information

The wide layout pairs a flexible recipe card with a 280-pixel portion panel. At 760 pixels it stacks into a single column. The card heading can wrap, ingredient labels can break onto another line, and the amount remains a compact non-wrapping value. The smallest breakpoint reduces panel padding and label type slightly rather than hiding the amounts.

The salad illustration is original CSS and is marked decorative. The recipe name, portion count and ingredient quantities carry the meaning independently of that artwork. Preserve the full ingredient labels and amounts when changing the illustration or narrowing the card; they are the actual inputs to the gathering task.

[Supporting specification](https://kobalte.dev/docs/core/overview/styling)

## Kobalte Design System Handle Quantity Changes as a Dependent-State Update

### Handle Quantity Changes as a Dependent-State Update

Each portion contributes 250 grams across the five ingredients. Moving from four to five portions changes the displayed total from 1,000 to 1,250 grams and the orange requirement from 320 to 400 grams. Previously gathered checks are cleared because they described the old quantities, while the recipe pin remains unchanged because the recipe identity is the same.

The update function first compares the incoming value with the current signal using Object.is. An unchanged callback should not clear the checklist or announce a quantity change. Invalid values suppress quantities and disable gathering; the error message then explains the accepted range. These rules make intermediate edits observable without allowing an invalid number to produce a misleading total.

1. Select Orange segments at four portions.
2. Increase to five and confirm 400 g of orange, 1,250 g total and zero gathered items.
3. Pin the recipe, then restore defaults and confirm all local state resets.

[Supporting specification](https://kobalte.dev/docs/core/components/number-field)

## Kobalte Design System Use a Solid Build and Include the Entire Stylesheet

### Use a Solid Build and Include the Entire Stylesheet

The setup uses the Vite Solid template, pins the verified Solid and Kobalte versions and mounts into an explicit app root. The component and stylesheet shown above are complete files. No theme provider, icon package, external font or backend is needed for this specimen.

Keep the framework compiler and component generation aligned when integrating into another application. A React transform will not turn Solid JSX into a correct Kobalte application. Likewise, a future major Kobalte API should be checked against its own documentation before replacing the pinned dependency. The recipe quantities and palette are sample application data, so adapting them does not require changing the native primitive contract.

[Supporting specification](https://kobalte.dev/docs/core/overview/getting-started)

## Component Examples

### Complete reactive recipe component

Native number field, checkbox anatomy and toggle button with explicit invalid and reset behavior.

```jsx
import {createSignal,createMemo,For} from 'solid-js';
import {NumberField} from '@kobalte/core/number-field';
import {Checkbox} from '@kobalte/core/checkbox';
import {ToggleButton} from '@kobalte/core/toggle-button';
export default function App(){
 const[portions,setPortions]=createSignal(4),[checked,setChecked]=createSignal(new Set()),[pinned,setPinned]=createSignal(false),[notice,setNotice]=createSignal('');
 const ingredients=[{id:'orange',name:'Orange segments',grams:80},{id:'beans',name:'Cooked white beans',grams:90},{id:'leaves',name:'Salad leaves',grams:25},{id:'fennel',name:'Thinly sliced fennel',grams:40},{id:'dressing',name:'Citrus dressing',grams:15}];
 const valid=createMemo(()=>Number.isFinite(portions())&&Number.isInteger(portions())&&portions()>=1&&portions()<=8);
 function update(value){if(Object.is(value,portions()))return;setPortions(value);setChecked(new Set());setNotice('Portions changed. Ingredient checks were cleared for the new quantities.')}
 function mark(id,value){setChecked(previous=>{const next=new Set(previous);value?next.add(id):next.delete(id);return next})}
 function reset(){setPortions(4);setChecked(new Set());setPinned(false);setNotice('Restored four portions and an unchecked ingredient list.')}
 return <main class="recipe-shell"><header><p class="eyebrow">KITCHEN NOTEBOOK · REACTIVE RECIPE CARD</p><h1>A brighter bowl, sized for your table.</h1><p>Change the portions, check the scaled ingredients and pin the recipe locally. The quantities are original sample data for this interface.</p></header><div class="recipe-layout"><section class="recipe-card"><div class="salad-art" aria-hidden="true"><div class="plate"><i/><b/><em/><span/><strong/></div></div><div class="recipe-heading"><div><p class="eyebrow">CITRUS & WHITE BEAN SALAD</p><h2>Fresh, crisp, generous.</h2></div><ToggleButton class="pin" pressed={pinned()} onChange={value=>{setPinned(value);setNotice(value?'Recipe pinned in this local preview.':'Recipe unpinned in this local preview.')}} aria-label="Pin recipe">{pinned()?'Pinned ✓':'Pin recipe'}</ToggleButton></div><p class="recipe-description">Sweet citrus, tender beans and crisp fennel. Use the checklist to gather the amounts for your chosen portion count.</p><div class="ingredient-title"><h3>Ingredients</h3><span>{checked().size} / 5 gathered</span></div><div class="ingredients"><For each={ingredients}>{ingredient=><Checkbox class="ingredient" checked={checked().has(ingredient.id)} onChange={value=>mark(ingredient.id,value)} disabled={!valid()}><Checkbox.Input/><Checkbox.Control class="check-control"><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control><Checkbox.Label class="ingredient-label"><span>{ingredient.name}</span><strong>{valid()?ingredient.grams*portions()+' g':'—'}</strong></Checkbox.Label></Checkbox>}</For></div></section><aside class="portion-panel"><h2>Make it yours</h2><NumberField rawValue={portions()} onRawValueChange={update} minValue={1} maxValue={8} step={1} formatOptions={{maximumFractionDigits:0}} validationState={valid()?'valid':'invalid'} class="portion-field"><NumberField.Label class="field-label">Portions</NumberField.Label><div class="stepper"><NumberField.DecrementTrigger aria-label="Fewer portions">−</NumberField.DecrementTrigger><NumberField.Input/><NumberField.IncrementTrigger aria-label="More portions">+</NumberField.IncrementTrigger></div><NumberField.Description class="field-description">Choose 1–8 whole portions. Changing the quantity clears ingredient checks.</NumberField.Description><NumberField.ErrorMessage class="field-error">Enter a whole number from 1 to 8.</NumberField.ErrorMessage></NumberField><div class="portion-total"><span>Total ingredients</span><strong>{valid()?ingredients.reduce((s,x)=>s+x.grams,0)*portions()+' g':'—'}</strong></div><h3>A simple preparation order</h3><ol><li>Gather the scaled amounts and drain the cooked beans.</li><li>Combine the orange, fennel and leaves in a bowl.</li><li>Add the beans and dressing, then toss gently.</li></ol><button class="reset" onClick={reset}>Restore default recipe</button><p role="status" class="notice">{notice()||(pinned()?'Recipe pinned in this local preview.':'No shopping order or account update is created.')}</p></aside></div></main>
}

```

[Code reference](https://kobalte.dev/docs/core/components/number-field)

- Use the Solid Vite template, not a React JSX compiler.
- rawValue carries numeric state; all ingredient quantities derive from that signal.
- Changing portions clears the checked Set because previous quantities are no longer current.

### Complete original visual configuration

Semantic custom properties, type hierarchy, spacing, state styling and original CSS illustration.

```css
:root{--recipe-canvas:#f6f2ec;--recipe-surface:#fffefa;--recipe-ink:#403a30;--recipe-muted:#807465;--recipe-line:#e6ded2;--recipe-action:#95612f;--recipe-on-action:#fff;--recipe-focus:#b88955;--recipe-soft:#f1e4d3;--recipe-space-1:4px;--recipe-space-2:8px;--recipe-space-3:12px;--recipe-space-4:16px;--recipe-space-6:24px;--recipe-space-8:32px}html,body,#app{height:auto;min-height:0;margin:0}*{box-sizing:border-box}body{font-family:system-ui,sans-serif;color:var(--recipe-ink);background:var(--recipe-canvas)}button,input{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}button:focus-visible,input:focus-visible{outline:3px solid var(--recipe-focus);outline-offset:3px}.recipe-shell{max-width:1090px;margin:auto;padding:32px}.eyebrow{font-size:10px;font-weight:700;letter-spacing:.13em;color:var(--recipe-muted)}h1{font-size:34px;line-height:1.15;max-width:700px;margin:12px 0}header>p:last-child{font-size:14px;line-height:1.7;color:var(--recipe-muted);max-width:630px}.recipe-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px;margin-top:28px}.recipe-card,.portion-panel{background:var(--recipe-surface);border:1px solid var(--recipe-line);border-radius:16px;padding:24px;min-width:0}.portion-panel{align-self:start}.salad-art{height:180px;background:#e8e4d5;border-radius:10px;position:relative;overflow:hidden;margin-bottom:24px}.plate{position:absolute;width:210px;height:210px;left:50%;top:18px;transform:translateX(-50%);border:18px solid #faf8f0;border-radius:50%;background:#dedcbf;box-shadow:0 10px 25px #5e584b1c}.plate i,.plate b,.plate em,.plate span,.plate strong{position:absolute;display:block}.plate i{width:85px;height:42px;border-radius:0 0 85px 85px;background:#dc9658;border:6px solid #f7c888;left:14px;top:18px;transform:rotate(-23deg)}.plate b{width:72px;height:36px;border-radius:0 0 72px 72px;background:#dc9658;border:6px solid #f7c888;left:75px;top:83px;transform:rotate(28deg)}.plate em{width:50px;height:77px;background:#83976a;border-radius:80% 0 80% 0;left:108px;top:4px;transform:rotate(20deg)}.plate span{width:30px;height:50px;background:#667f56;border-radius:80% 0 80% 0;left:25px;top:88px;transform:rotate(-23deg)}.plate strong{width:24px;height:34px;background:#fff3d7;border-radius:50%;left:80px;top:46px;box-shadow:-34px 14px 0 #fff3d7,25px 28px 0 #fff3d7}.recipe-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.recipe-heading h2{font:400 30px/1.2 Georgia,serif;margin:8px 0}.pin{border:1px solid var(--recipe-line);background:white;border-radius:999px;padding:9px 13px;font-size:11px;color:var(--recipe-action)}.pin[data-pressed]{background:var(--recipe-soft);border-color:var(--recipe-action)}.recipe-description{font-size:13px;line-height:1.7;color:var(--recipe-muted)}.ingredient-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:24px}.ingredient-title h3{font-size:16px;margin:0}.ingredient-title span{font-size:11px;color:var(--recipe-muted)}.ingredients{margin-top:14px}.ingredient{display:flex;gap:12px;align-items:center;border-top:1px solid var(--recipe-line);padding:16px 0;cursor:pointer}.check-control{height:21px;width:21px;border:1px solid #b9ab98;border-radius:5px;flex-shrink:0;display:flex;justify-content:center;align-items:center;font-size:13px}.check-control[data-checked]{background:var(--recipe-action);color:white;border-color:var(--recipe-action)}.check-control[data-focus-visible]{outline:3px solid var(--recipe-focus);outline-offset:3px}.ingredient-label{display:flex;justify-content:space-between;gap:12px;width:100%;font-size:13px;line-height:1.5;cursor:pointer}.ingredient-label strong{white-space:nowrap;font-size:12px}.ingredient[data-checked] .ingredient-label>span{text-decoration:line-through;color:var(--recipe-muted)}.portion-panel>h2{font-size:20px;margin:0 0 24px}.field-label{font-size:13px;font-weight:600}.stepper{display:flex;margin-top:10px;border:1px solid var(--recipe-line);border-radius:8px;overflow:hidden}.stepper button{width:42px;flex-shrink:0;background:var(--recipe-soft);border:0;font-size:21px}.stepper input{width:100%;min-width:0;text-align:center;border:0;padding:12px 0;background:white;color:var(--recipe-ink)}.field-description{font-size:11px;line-height:1.7;color:var(--recipe-muted);margin:10px 0 0}.field-error{font-size:12px;color:#a73324}.portion-total{display:flex;justify-content:space-between;gap:12px;margin:24px 0;padding:18px 0;border-top:1px solid var(--recipe-line);border-bottom:1px solid var(--recipe-line);font-size:12px}.portion-total strong{font-size:19px;white-space:nowrap}.portion-panel h3{font-size:13px;line-height:1.6}.portion-panel ol{padding-left:18px;font-size:12px;line-height:1.7;color:var(--recipe-muted)}.portion-panel li{margin-bottom:12px}.reset{width:100%;padding:12px;border:1px solid var(--recipe-line);border-radius:8px;background:white;color:var(--recipe-action);font-size:12px;margin-top:16px}.notice{font-size:11px;line-height:1.7;color:var(--recipe-muted)}@media(max-width:760px){.recipe-layout{grid-template-columns:minmax(0,1fr)}.recipe-shell{padding:20px}h1{font-size:29px}}@media(max-width:360px){.recipe-shell{padding:14px}.recipe-card,.portion-panel{padding:16px}.ingredient-label{gap:8px;font-size:12px}.ingredient{gap:8px}.ingredient-label strong{font-size:11px}.recipe-heading h2{font-size:27px}}

```

[Code reference](https://kobalte.dev/docs/core/overview/styling)

- These recipe-* values are original application choices, not official Kobalte tokens.
- The complete stylesheet includes responsive composition and visible focus.

## Implementation Starting Point

The Solid Vite template supplies the required Solid JSX compiler. The complete App.jsx and style.css examples above contain all application code and styles; no provider or external service is required.

```javascript
// npm create vite@latest kobalte-recipe -- --template solid
// cd kobalte-recipe && npm install
// npm install solid-js@1.9.15 @kobalte/core@0.13.14
// Save the complete examples as src/App.jsx and src/style.css.
// src/index.jsx:
import {render} from 'solid-js/web';
import App from './App.jsx';
import './style.css';
render(() => <App />, document.getElementById('app'));
// index.html: <div id="app"></div><script type="module" src="/src/index.jsx"></script>
// npm run dev
```

## Agent Prompt

Use Kobalte 0.13.14 with Solid 1.9.15 to reproduce the reactive recipe card. Keep NumberField rawValue/onRawValueChange, bounds one through eight, whole-portion validation and full Label/Description/ErrorMessage anatomy. Derive ingredient grams and totals from the portion signal; a genuine quantity change clears the immutable checked-ID Set but preserves the recipe pin. Keep native Checkbox parts and ToggleButton pressed/onChange, disable gathering while quantity is invalid, and restore four portions, no checks and no pin on reset. Include the complete original recipe CSS; all state remains local.

## Sources

- [Getting started](https://kobalte.dev/docs/core/overview/getting-started) — Solid setup and component imports.
- [Styling](https://kobalte.dev/docs/core/overview/styling) — Headless styling and state selectors.
- [Number field](https://kobalte.dev/docs/core/components/number-field) — Numeric values, bounds, field anatomy and raw form input.
- [Checkbox](https://kobalte.dev/docs/core/components/checkbox) — Input, Control, Indicator and Label.
- [Toggle button](https://kobalte.dev/docs/core/components/toggle-button) — Pressed state, callback and keyboard behavior.
