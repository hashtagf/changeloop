# SumUp Circuit Design System — OpenDesign Application Guide

A Circuit guide with exact semantic tokens, native validation props, a complete merchant item editor and an illustrated customer-side preview.

OpenDesign application guide to a pinned Circuit package generation. The illustration, amount and item are examples. This local editor creates no payment link, charge or SumUp account action; current upstream packages use the newer @sumup-oss namespace.

## Source Reference

- **Runtime:** Native @sumup/circuit-ui 8.15.0 with @sumup/design-tokens 7.3.1 light CSS; original local item editor. ([source](https://circuit.sumup.com/))
- **Reference:** 39 concrete token/API entries ([source](https://cdn.jsdelivr.net/npm/@sumup/design-tokens@7.3.1/light.css))
- **Source:** Complete JSX + CSS ([source](https://circuit.sumup.com/))


## Design Reference

Native @sumup/circuit-ui 8.15.0 with @sumup/design-tokens 7.3.1 light CSS; original local item editor.

### Merchant light surfaces and text

[Official reference](https://cdn.jsdelivr.net/npm/@sumup/design-tokens@7.3.1/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-bg-normal | #fff | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-bg-subtle | #f0f1f5 | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-bg-strong | #000 | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-bg-accent-strong | #0f131a | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-fg-normal | #0f131a | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-fg-subtle | #6a737c | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-fg-on-strong | #fff | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-fg-success | #018850 | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-fg-danger | #de331d | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |
| --cui-border-normal | #aeb6be | Semantic merchant-light reference; do not use a surface color as a foreground without checking its intended pair. |

### Spacing units

[Official reference](https://cdn.jsdelivr.net/npm/@sumup/design-tokens@7.3.1/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-spacings-bit | 4px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-byte | 8px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-kilo | 12px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-mega | 16px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-giga | 24px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-tera | 32px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-peta | 40px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-exa | 48px | Named spacing steps, copied from the pinned CSS export. |
| --cui-spacings-zetta | 56px | Named spacing steps, copied from the pinned CSS export. |

### Corner radii

[Official reference](https://cdn.jsdelivr.net/npm/@sumup/design-tokens@7.3.1/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-border-radius-bit | 4px | Use shape according to control or surface role. |
| --cui-border-radius-byte | 8px | Use shape according to control or surface role. |
| --cui-border-radius-kilo | 12px | Use shape according to control or surface role. |
| --cui-border-radius-mega | 16px | Use shape according to control or surface role. |
| --cui-border-radius-circle | 100% | Use shape according to control or surface role. |
| --cui-border-radius-pill | 999999px | Use shape according to control or surface role. |

### Font families and weights

[Official reference](https://cdn.jsdelivr.net/npm/@sumup/design-tokens@7.3.1/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-font-stack-default | aktiv-grotesk, Helvetica, Arial, system-ui, sans-serif, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" | The example uses available fallbacks; it does not fetch Aktiv Grotesk. |
| --cui-font-stack-mono | Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace | The example uses available fallbacks; it does not fetch Aktiv Grotesk. |
| --cui-font-weight-regular | 400 | The example uses available fallbacks; it does not fetch Aktiv Grotesk. |
| --cui-font-weight-bold | 700 | The example uses available fallbacks; it does not fetch Aktiv Grotesk. |

### Primary action states

[Official reference](https://cdn.jsdelivr.net/npm/@sumup/design-tokens@7.3.1/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --cui-bg-accent-strong | #0f131a | Retain separate normal, hover, pressed and disabled states. |
| --cui-bg-accent-strong-hovered | #3b3f46 | Retain separate normal, hover, pressed and disabled states. |
| --cui-bg-accent-strong-pressed | #6a737c | Retain separate normal, hover, pressed and disabled states. |
| --cui-bg-accent-strong-disabled | rgba(15, 19, 26, .4) | Retain separate normal, hover, pressed and disabled states. |

### Input and button public props

[Official reference](https://github.com/sumup-oss/circuit-ui)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Input.label | required string | Visible field purpose. |
| Input.invalid | boolean | Native invalid styling and accessibility state. |
| Input.validationHint | string | Show a specific instruction under the control. |
| Button.variant | primary / secondary / tertiary | Action hierarchy in this pinned version. |
| Button.size | s / m | Current size values in version 8.15.0. |
| Button.stretch | boolean | Fill the parent width for the local review action. |

## SumUp Circuit Design System Merchant Editor Composition

### Separate merchant input from customer presentation

The item editor and receipt-like preview show two views of the same state. A short form names the item, sets an illustrative amount and chooses whether a customer note field is shown. The preview demonstrates the effect without creating a checkout or requesting payment information.

### Use an original product illustration

The geometric print image is authored CSS artwork with an accessible description. It gives the customer preview a recognizable object instead of a blank image rectangle, while avoiding a fake merchant photograph or a copied SumUp product asset.

## SumUp Circuit Design System Semantic Theme and Package Scope

### Use the exact pinned theme

This example runs @sumup/circuit-ui 8.15.0 with @sumup/design-tokens 7.3.1. The reference table is read from that package’s light.css. Current upstream documentation has moved toward the @sumup-oss namespace; this is a reproducible pinned integration, not a claim that the older namespace is the newest release.

### Load component styles and token styles

The React entry imports both the component stylesheet and the light token file. Component class names alone are not enough when their CSS custom properties have not been defined. A scoped dark palette would also need a complete base theme to provide shared non-color values.

## SumUp Circuit Design System Neutral Surfaces and Action Contrast

### Keep the item as the visual focus

The editor uses a white surface and dark foreground while the customer preview sits on a subtle neutral background. The original artwork adds controlled color inside the item image, leaving the native primary action readable and easy to find.

### Keep the preview action visibly noninteractive

The customer-side footer is a text block labeled Preview only, not a disabled Pay button that suggests a nearly working checkout. The only real submit action belongs to the editor and reviews a local item. This helps users understand the specimen’s actual interaction boundary.

## SumUp Circuit Design System Typography and Fallbacks

### Use the theme stack honestly

The published stack begins with Aktiv Grotesk and includes Helvetica, Arial and system fallbacks. This offline specimen does not download the first font. Its native Headline and Body components still provide the intended hierarchy, while available fonts determine the final letter shapes.

### Keep the amount and its currency together

Intl.NumberFormat produces the euro display for the validated local amount. The price is visually stronger than the item description and remains on the customer preview. A malformed draft shows an em dash rather than a misleading zero or a partially parsed amount.

## SumUp Circuit Design System Spacing and Rounded Surfaces

### Use the named step sequence

The token scale uses bit, byte, kilo, mega and larger names. These are design labels rather than powers-of-two arithmetic. The table preserves exact pixel values so developers do not invent a scale from the naming metaphor.

### Align control edges without flattening hierarchy

The form uses a consistent vertical gap and full-width primary action. The preview uses a larger rounded outer surface and a smaller receipt interior. On a phone the preview follows the form, with padding reduced before the controls are compressed.

## SumUp Circuit Design System Item Validation and Draft State

### Validate the full string before formatting

The application accepts one to five integer digits and up to two decimal places, with a positive numeric value. This is an authored sample rule. It avoids parseFloat accepting a partial string such as 24abc, and it focuses the first invalid native Input after submission.

### Clear stale review on any edit

Name, amount and note visibility all invalidate the previous snapshot. The successful state includes the reviewed item name and amount, so it is tied to a concrete draft. The code does not store this result in a backend or create a payment request.

## SumUp Circuit Design System Input Recovery and Preview Semantics

### Exercise both field errors

The item name and price use native required labels, invalid state and validationHint. The source retains input refs to return focus to the first failing field. Error recovery can be tested without entering real customer or card data.

1. Clear the name and submit to inspect the first field error.
2. Try 24abc or zero, then correct the amount to 24.50.
3. Review locally and edit a field to dismiss the outdated snapshot.

### Label the illustration and static preview honestly

The artwork has a short image-role description. The customer note area is an explanatory placeholder within an explicitly labeled preview, not a fake editable input. The real note-setting checkbox stays in the merchant form and controls whether that preview region appears.

## SumUp Circuit Design System React and CSS Integration

### Include the public peers and both stylesheets

The entry uses React 18 and the pinned Circuit components, with token, icon, internationalization and Emotion peers matching the package requirements. The code imports light.css and styles.css explicitly. It does not rely on an undocumented provider or hidden project-level theme setup.

- @sumup/circuit-ui 8.15.0 component styles.
- @sumup/design-tokens 7.3.1 full light theme.
- React 18 and the component package’s declared peers.

### Add payment services only in a real application

A production payment flow needs its own authorized service integration, validated currency handling and server responses. This specimen intentionally stops at reviewing a local presentation. Preserve that wording when reusing the sample until a real transaction flow exists.

## Component Examples

### main.jsx — complete working specimen

Edit an item and inspect its customer-side preview. The source below is the full React entry, including all state and validation.

```jsx
import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Input, Checkbox, Button, Headline, Body } from "@sumup/circuit-ui";
import "@sumup/design-tokens/light.css";
import "@sumup/circuit-ui/styles.css";
import "./circuit.css";
function App() {
  const [name, setName] = useState("Studio print"),
    [price, setPrice] = useState("24.00"),
    [note, setNote] = useState(true),
    [errors, setErrors] = useState({}),
    [review, setReview] = useState(null);
  const nameRef = useRef(),
    priceRef = useRef();
  const valid = /^\d{1,5}(\.\d{1,2})?$/.test(price) && Number(price) > 0;
  const amount = valid
    ? new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: "EUR",
      }).format(Number(price))
    : "—";
  function change(fn) {
    fn();
    setReview(null);
    setErrors({});
  }
  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = "Enter an item name.";
    if (!valid)
      next.price = "Use a positive amount with up to two decimal places.";
    setErrors(next);
    if (next.name) {
      nameRef.current.focus();
      return;
    }
    if (next.price) {
      priceRef.current.focus();
      return;
    }
    setReview({ name: name.trim(), amount, note });
  }
  return (
    <main className="circuit-example">
      <header>
        <p className="eyebrow">MERCHANT TOOLS / LOCAL SPECIMEN</p>
        <Headline as="h1">Prepare a simple item</Headline>
        <Body>
          Review how an item could appear to a customer. This example never
          creates a payment link.
        </Body>
      </header>
      <div className="circuit-grid">
        <form onSubmit={submit} noValidate>
          <h2>Item details</h2>
          <Input
            ref={nameRef}
            label="Item name"
            required
            value={name}
            maxLength={80}
            invalid={!!errors.name}
            validationHint={
              errors.name || "Use a short name the customer can recognize."
            }
            onChange={(e) => change(() => setName(e.target.value))}
          />
          <Input
            ref={priceRef}
            label="Price in EUR"
            required
            inputMode="decimal"
            value={price}
            invalid={!!errors.price}
            validationHint={
              errors.price || "Example amount only; no charge will be made."
            }
            onChange={(e) => change(() => setPrice(e.target.value))}
          />
          <Checkbox
            label="Show a customer note field"
            checked={note}
            onChange={(e) => change(() => setNote(e.target.checked))}
          />
          <Button variant="primary" type="submit" stretch>
            Review item locally
          </Button>
          {review && (
            <div className="review" role="status">
              <strong>Item reviewed</strong>
              <p>
                {review.name} · {review.amount}
              </p>
              <small>
                Local snapshot only. No payment link or charge created.
              </small>
            </div>
          )}
        </form>
        <section className="preview-surface" aria-labelledby="preview-heading">
          <h2 id="preview-heading">Customer-side preview</h2>
          <div className="receipt">
            <div className="shop-mark" aria-hidden="true">
              N
            </div>
            <p className="shop-name">Northstar Studio</p>
            <div
              className="print-art"
              role="img"
              aria-label="Original geometric print illustration"
            >
              <i></i>
              <b></b>
              <span></span>
            </div>
            <h3>{name.trim() || "Your item name"}</h3>
            <p className="receipt-price">{amount}</p>
            {note && (
              <div className="note-placeholder">
                <span>Customer note</span>
                <p>A note field would appear here.</p>
              </div>
            )}
            <div className="preview-action">
              Preview only · checkout unavailable
            </div>
          </div>
        </section>
      </div>
      <footer>
        Native Circuit UI 8.15.0 components and design tokens 7.3.1. Original
        item editor and illustration by OpenDesign.
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://circuit.sumup.com/)

- Create a Vite React project, keep <div id="root"></div>, and load this as src/main.jsx.

### circuit.css — original responsive composition

Application layout layered around the native components.

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: var(--cui-bg-normal);
  color: var(--cui-fg-normal);
  font: 16px/1.5 var(--cui-font-stack-default);
}
.circuit-example {
  padding: 32px;
}
.circuit-example header {
  max-width: 720px;
  margin-bottom: 32px;
}
.eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  color: var(--cui-fg-subtle);
}
.circuit-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 1fr);
  gap: 48px;
}
.circuit-example h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px;
}
.circuit-example form {
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.circuit-example form h2 {
  margin: 0;
}
.preview-surface {
  background: var(--cui-bg-subtle);
  padding: 28px;
  border-radius: 16px;
}
.preview-surface > h2 {
  font-size: 14px;
  color: var(--cui-fg-subtle);
  text-align: center;
}
.receipt {
  max-width: 340px;
  margin: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px #0000000d;
  padding: 24px;
}
.shop-mark {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0f131a;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  margin: auto;
}
.shop-name {
  text-align: center;
  font-size: 14px;
  margin: 12px 0 20px;
}
.print-art {
  height: 150px;
  background: #f5dfbb;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}
.print-art i {
  position: absolute;
  left: 24px;
  bottom: 0;
  width: 100px;
  height: 130px;
  border-radius: 60px 60px 0 0;
  background: #ce663d;
}
.print-art b {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #385d50;
}
.print-art span {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 24px;
  background: #202e2a;
}
.receipt h3 {
  font-size: 20px;
  line-height: 1.3;
  margin: 20px 0 8px;
  overflow-wrap: anywhere;
}
.receipt-price {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px;
}
.note-placeholder {
  padding: 12px;
  border: 1px solid #bfc6cf;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 12px;
}
.note-placeholder span {
  font-weight: 700;
}
.note-placeholder p {
  margin: 4px 0 0;
  color: #4f5a65;
}
.preview-action {
  background: #e9edf2;
  text-align: center;
  border-radius: 999px;
  padding: 12px;
  font-size: 12px;
  color: #4f5a65;
}
.review {
  padding: 20px;
  background: #e7f5ef;
  border-radius: 8px;
}
.review p {
  margin: 8px 0;
}
.review small {
  font-size: 12px;
}
.circuit-example footer {
  font-size: 12px;
  color: var(--cui-fg-subtle);
  margin-top: 32px;
}
@media (max-width: 850px) {
  .circuit-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .circuit-example form {
    max-width: none;
  }
}
@media (max-width: 550px) {
  .circuit-example {
    padding: 20px 16px;
  }
  .preview-surface {
    padding: 20px;
  }
  .receipt {
    padding: 20px;
  }
}

```

[Code reference](https://circuit.sumup.com/)

- Save beside main.jsx. These custom composition rules are distinguished from the library token reference.

## Implementation Starting Point

The pinned native example was bundled and browser-checked locally. The specimen uses only local application state.

```sh
npm create vite@latest circuit-item -- --template react
cd circuit-item
npm install
npm install react@18.3.1 react-dom@18.3.1 @sumup/circuit-ui@8.15.0 @sumup/design-tokens@7.3.1 @sumup/icons @sumup/intl@1 @emotion/react @emotion/styled @emotion/is-prop-valid
# Replace src/main.jsx and add src/circuit.css.
npm run dev
```

## Agent Prompt

Build a Circuit item editor using the pinned native controls and both required stylesheets. Validate complete amount strings, preserve currency formatting, clear stale local review after edits, and keep the customer-side preview distinct from a real checkout. Use the original illustration and exact semantic token roles.

## Sources

- [Circuit Documentation](https://circuit.sumup.com/) — Current component and integration guidance.
- [Pinned Light Tokens](https://cdn.jsdelivr.net/npm/@sumup/design-tokens@7.3.1/light.css) — Exact values used by this specimen.
- [Circuit Source](https://github.com/sumup-oss/circuit-ui) — Package generations, component props and current namespace.
