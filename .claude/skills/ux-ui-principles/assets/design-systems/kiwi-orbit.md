# Kiwi Orbit Design System — OpenDesign Application Guide

A travel-focused Orbit guide with real product colors and spacing, native baggage choices, a consistent price breakdown and a complete local review flow.

OpenDesign application guide. The route, duration, prices and baggage allowances are fictional. Native Orbit controls run locally; no flight search, booking or payment is performed.

## Source Reference

- **Runtime:** Native Orbit React components 27.7.0 with defaultTheme and compiled Tailwind CSS; token reference 11.0.0. ([source](https://orbit.kiwi/getting-started/))
- **Reference:** 38 concrete token/API entries ([source](https://cdn.jsdelivr.net/npm/@kiwicom/orbit-design-tokens@11.0.0/dist/index.js))
- **Source:** Complete JSX + CSS ([source](https://orbit.kiwi/getting-started/))


## Design Reference

Native Orbit React components 27.7.0 with defaultTheme and compiled Tailwind CSS; token reference 11.0.0.

### Product action colors

[Official reference](https://cdn.jsdelivr.net/npm/@kiwicom/orbit-design-tokens@11.0.0/dist/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| buttonPrimaryBackground | #008F7B | Primary action state reference. Keep hover, active and focus roles distinct. |
| buttonPrimaryBackgroundHover | #007565 | Primary action state reference. Keep hover, active and focus roles distinct. |
| buttonPrimaryBackgroundActive | #006153 | Primary action state reference. Keep hover, active and focus roles distinct. |
| buttonPrimaryForeground | #FFFFFF | Primary action state reference. Keep hover, active and focus roles distinct. |
| buttonPrimaryForegroundHover | #FFFFFF | Primary action state reference. Keep hover, active and focus roles distinct. |
| buttonPrimaryForegroundActive | #FFFFFF | Primary action state reference. Keep hover, active and focus roles distinct. |
| buttonPrimaryBorderColorFocus | rgba(0, 143, 123, 0.5) | Primary action state reference. Keep hover, active and focus roles distinct. |

### Component spacing

[Official reference](https://cdn.jsdelivr.net/npm/@kiwicom/orbit-design-tokens@11.0.0/dist/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| space50 | 2px | Actual pixel spacing steps from the published token package. |
| space100 | 4px | Actual pixel spacing steps from the published token package. |
| space150 | 6px | Actual pixel spacing steps from the published token package. |
| space200 | 8px | Actual pixel spacing steps from the published token package. |
| space300 | 12px | Actual pixel spacing steps from the published token package. |
| space400 | 16px | Actual pixel spacing steps from the published token package. |
| space500 | 20px | Actual pixel spacing steps from the published token package. |
| space600 | 24px | Actual pixel spacing steps from the published token package. |
| space800 | 32px | Actual pixel spacing steps from the published token package. |
| space1000 | 40px | Actual pixel spacing steps from the published token package. |
| space1200 | 48px | Actual pixel spacing steps from the published token package. |

### Corner radii

[Official reference](https://cdn.jsdelivr.net/npm/@kiwicom/orbit-design-tokens@11.0.0/dist/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| borderRadius50 | 2px | Different radius roles support controls and larger travel surfaces. |
| borderRadius100 | 4px | Different radius roles support controls and larger travel surfaces. |
| borderRadius150 | 6px | Different radius roles support controls and larger travel surfaces. |
| borderRadius200 | 8px | Different radius roles support controls and larger travel surfaces. |
| borderRadius300 | 12px | Different radius roles support controls and larger travel surfaces. |
| borderRadius400 | 16px | Different radius roles support controls and larger travel surfaces. |
| borderRadiusNone | 0 | Different radius roles support controls and larger travel surfaces. |
| borderRadiusFull | 9999px | Different radius roles support controls and larger travel surfaces. |

### Body type

[Official reference](https://cdn.jsdelivr.net/npm/@kiwicom/orbit-design-tokens@11.0.0/dist/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontSizeTextSmall | 13px | Published body roles; custom page headings remain application composition. |
| fontSizeTextNormal | 15px | Published body roles; custom page headings remain application composition. |
| fontSizeTextLarge | 16px | Published body roles; custom page headings remain application composition. |
| fontSizeTextExtraLarge | 18px | Published body roles; custom page headings remain application composition. |

### Product and neutral surfaces

[Official reference](https://cdn.jsdelivr.net/npm/@kiwicom/orbit-design-tokens@11.0.0/dist/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| paletteCloudLight | #F5F7F9 | Use calm surfaces and readable text around the product action color. |
| paletteCloudNormal | #E8EDF1 | Use calm surfaces and readable text around the product action color. |
| paletteInkDark | #252A31 | Use calm surfaces and readable text around the product action color. |
| paletteInkLight | #657890 | Use calm surfaces and readable text around the product action color. |
| paletteInkNormal | #4F5E71 | Use calm surfaces and readable text around the product action color. |
| paletteProductLight | #E1F4F3 | Use calm surfaces and readable text around the product action color. |
| paletteProductNormal | #008F7B | Use calm surfaces and readable text around the product action color. |
| paletteProductDark | #007061 | Use calm surfaces and readable text around the product action color. |

## Kiwi Orbit Design System Travel Selection Layout

### Present the route before the extras

The route summary shows the two airport codes, city names and a fictional duration before baggage options. This keeps the purchase context visible while the user compares extras. The dashed connector is original CSS illustration, not a carrier route graphic or a promise about a real service.

### Separate choices from the total

Travellers and baggage are on one side, while a price breakdown sits beside them. The same state produces both the selected controls and the amounts. On a phone the summary follows the choices in document order, so it remains clear which inputs explain the total.

## Kiwi Orbit Design System Product Color and Feedback

### Use the product family for the main action

The token package supplies a green product action with distinct hover and active shades. The reference lists the exact button role values instead of relying on a guessed brand green. Neutral cloud surfaces frame the selectable extras without making every panel compete with the review action.

### Keep feedback specific to the result

The native success alert says Selection reviewed locally and names the traveller count and total. It is cleared whenever a choice changes. A previous green confirmation therefore cannot remain visible as if it validated a newly edited set of extras.

## Kiwi Orbit Design System Typography and Price Hierarchy

### Use native text roles for explanatory copy

Orbit exposes 13px small and 15px normal body roles alongside larger options. The specimen uses native Text and Heading components, while the route codes and total are original emphasis. The browser uses a documented fallback stack here; no Kiwi.com brand font is silently fetched.

### Keep units next to amounts

Each baggage price says per traveller. The breakdown multiplies each selected extra by the traveller count, and the total is visually stronger than its component lines. The unit should not disappear on mobile, because a large attractive number without its scope is easy to misread.

## Kiwi Orbit Design System Radius and Spacing Scales

### Distinguish controls from larger surfaces

The current radius scale includes 2, 4, 6, 8, 12 and 16px steps plus none and full. The authored route and summary panels use 12px corners, while native controls retain their own theme rules. Applying the largest radius to every nested element would make the form lose its hierarchy.

### Keep the option row intact while it wraps

A baggage row groups its native checkbox, supporting allowance text and price. Flexible width is given to the descriptive content while the price stays readable. The page moves to one column before either main region becomes too narrow to support the comparison.

## Kiwi Orbit Design System Controlled Checkbox and Select

### Use component labels and information fields

Checkbox receives its visible label and supporting info through public props. Select receives a label and explicit options for one through four travellers. These native compositions retain their interaction and labeling behavior without a clickable div masquerading as a baggage control.

### Model each extra independently

Cabin and checked baggage are separate booleans. The application does not imply that selecting one automatically deselects the other. This is a deliberately simple example policy; a real airline may have mutually exclusive bundles or passenger-specific allowances that need a different model.

## Kiwi Orbit Design System Selection Calculation and Review

### Derive the total from one formula

The example computes travellers multiplied by the base fare plus selected per-person extras. It does not store an independently editable total that can drift from the visible options. All prices and allowances are explicitly fictional and are not current Kiwi.com offers.

### Capture a review snapshot

Review stores count, baggage choices and total together. Changing any control clears that snapshot. The example therefore demonstrates state consistency without presenting a local click as a reservation, payment, live availability check or final quote.

## Kiwi Orbit Design System Accessible Choice Feedback

### Check labels and recalculation together

A keyboard or pointer user can select travellers and toggle either baggage choice using the native controls. The review outcome appears in a status region. Validation is not fabricated for optional baggage: leaving both extras unchecked is a legitimate state of this fictional fare.

1. Select two travellers and add cabin baggage.
2. Add checked baggage and verify all three breakdown amounts.
3. Review locally, change a choice, and confirm that the previous success disappears.

### Avoid hidden consequences

The page explains the fictional scope above the form and beside the total. The action is Review local selection, not Buy or Book. All changes remain in the page, and no personal passenger information is requested for a demonstration that does not need it.

## Kiwi Orbit Design System Provider and Compiled Styles

### Use the matching stable release

This specimen pins React components 27.7.0 and token references 11.0.0. It imports OrbitProvider, the package defaultTheme and the compiled lib/tailwind.css. Omitting that stylesheet would leave utility-based component styling incomplete even if the React tree renders.

- OrbitProvider and package defaultTheme.
- Compiled lib/tailwind.css from components 27.7.0.
- Node.js 22 or newer for the package build environment.

### Keep deployment requirements explicit

The package declares Node.js 22 or newer. The supplied Vite entry can be reproduced with that environment and the pinned component package. The original CSS handles only the trip composition; the native controls keep the published component styles and provider behavior.

## Component Examples

### main.jsx — complete working specimen

Choose baggage and review an example total. The source below is the full React entry, including all state and validation.

```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  OrbitProvider,
  Button,
  Checkbox,
  Select,
  Alert,
  Heading,
  Text,
} from "@kiwicom/orbit-components";
import defaultTheme from "@kiwicom/orbit-components/lib/defaultTheme";
import "@kiwicom/orbit-components/lib/tailwind.css";
import "./orbit.css";
function App() {
  const [travellers, setTravellers] = useState("1"),
    [cabin, setCabin] = useState(false),
    [checked, setChecked] = useState(false),
    [saved, setSaved] = useState(null);
  const count = Number(travellers),
    extras = (cabin ? 18 : 0) + (checked ? 32 : 0),
    total = count * (96 + extras);
  function update(fn) {
    fn();
    setSaved(null);
  }
  return (
    <OrbitProvider theme={defaultTheme}>
      <main className="trip">
        <header>
          <Text size="small">ORIGINAL TRAVEL SPECIMEN</Text>
          <Heading as="h1" type="title1">Choose what travels with you</Heading>
          <Text>
            Fictional one-way fare. Prices illustrate the interface, not a
            bookable flight.
          </Text>
        </header>
        <div className="trip-grid">
          <section>
            <div className="route">
              <div>
                <strong>PRG</strong>
                <span>Prague</span>
              </div>
              <div className="route-line">
                <span>1h 45m · direct</span>
                <i></i>
              </div>
              <div>
                <strong>AMS</strong>
                <span>Amsterdam</span>
              </div>
            </div>
            <div className="options">
              <Heading as="h2" type="title3">Travellers and baggage</Heading>
              <Select
                label="Travellers"
                ariaLabel="Travellers"
                value={travellers}
                options={[1, 2, 3, 4].map((n) => ({
                  value: String(n),
                  label: n + " adult" + (n === 1 ? "" : "s"),
                }))}
                onChange={(e) => update(() => setTravellers(e.target.value))}
              />
              <div className="bag-option">
                <div>
                  <Heading as="h3" type="title4">Personal item</Heading>
                  <Text size="small">
                    Fits under the seat · included in this example fare
                  </Text>
                </div>
                <strong>Included</strong>
              </div>
              <div className="bag-option">
                <Checkbox
                  label="Add cabin baggage"
                  info="One 10 kg bag per traveller · fictional allowance"
                  checked={cabin}
                  onChange={(e) => update(() => setCabin(e.target.checked))}
                />
                <strong>
                  €18<span>/ traveller</span>
                </strong>
              </div>
              <div className="bag-option">
                <Checkbox
                  label="Add checked baggage"
                  info="One 20 kg bag per traveller · fictional allowance"
                  checked={checked}
                  onChange={(e) => update(() => setChecked(e.target.checked))}
                />
                <strong>
                  €32<span>/ traveller</span>
                </strong>
              </div>
            </div>
          </section>
          <aside>
            <Heading as="h2" type="title3">Your example selection</Heading>
            <dl>
              <dt>Base fare × {count}</dt>
              <dd>€{96 * count}</dd>
              {cabin && (
                <>
                  <dt>Cabin baggage × {count}</dt>
                  <dd>€{18 * count}</dd>
                </>
              )}
              {checked && (
                <>
                  <dt>Checked baggage × {count}</dt>
                  <dd>€{32 * count}</dd>
                </>
              )}
            </dl>
            <div className="trip-total">
              <span>Total</span>
              <strong>€{total}</strong>
            </div>
            <Text size="small">
              All amounts are illustrative. No payment or reservation will be
              created.
            </Text>
            <Button
              fullWidth
              onClick={() => setSaved({ count, cabin, checked, total })}
            >
              Review local selection
            </Button>
            {saved && (
              <div role="status" className="trip-confirm">
                <Alert type="success" title="Selection reviewed locally">
                  {saved.count} traveller{saved.count === 1 ? "" : "s"} · €
                  {saved.total}. No booking created.
                </Alert>
              </div>
            )}
          </aside>
        </div>
        <footer>
          Native Orbit 27.7.0 components and compiled package styles. Original
          layout and fictional pricing logic by OpenDesign.
        </footer>
      </main>
    </OrbitProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://orbit.kiwi/getting-started/)

- Create a Vite React project, keep <div id="root"></div>, and load this as src/main.jsx.

### orbit.css — original responsive composition

Application layout layered around the native components.

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #f5f7f9;
  color: #252a31;
  font:
    16px/1.5 Arial,
    sans-serif;
}
.trip {
  padding: 32px;
}
.trip header {
  max-width: 760px;
  margin-bottom: 28px;
}
.trip header h1 {
  margin: 8px 0 12px;
}
.trip-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 24px;
}
.route,
.options,
.trip aside {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8edf1;
  padding: 24px;
}
.route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}
.route strong {
  font-size: 32px;
  display: block;
}
.route span {
  font-size: 14px;
  display: block;
  color: #4f5e71;
}
.route-line {
  flex: 1;
  text-align: center;
}
.route-line i {
  display: block;
  border-top: 2px dashed #bac7d5;
  margin-top: 12px;
}
.options > h3 {
  margin-bottom: 20px;
}
.options > div:first-of-type {
  margin-bottom: 12px;
}
.bag-option {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  border-top: 1px solid #e8edf1;
}
.bag-option:last-child {
  padding-bottom: 0;
}
.bag-option > strong {
  white-space: nowrap;
  font-size: 18px;
}
.bag-option > strong span {
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: #657890;
}
.trip aside {
  align-self: start;
}
.trip dl {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  margin: 24px 0;
}
.trip dd {
  margin: 0;
  text-align: right;
  font-weight: 600;
}
.trip-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #bac7d5;
  padding: 20px 0;
}
.trip-total strong {
  font-size: 32px;
}
.trip aside > button {
  margin-top: 24px;
}
.trip-confirm {
  margin-top: 20px;
}
.trip footer {
  font-size: 12px;
  color: #657890;
  margin-top: 24px;
}
@media (max-width: 900px) {
  .trip-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 550px) {
  .trip {
    padding: 16px;
  }
  .route,
  .options,
  .trip aside {
    padding: 20px;
  }
  .route {
    gap: 12px;
  }
  .route strong {
    font-size: 28px;
  }
  .route-line span {
    font-size: 12px;
  }
  .bag-option {
    align-items: flex-start;
    gap: 12px;
  }
}

```

[Code reference](https://orbit.kiwi/getting-started/)

- Save beside main.jsx. These custom composition rules are distinguished from the library token reference.

## Implementation Starting Point

The pinned native example was bundled and browser-checked locally. The specimen uses only local application state.

```sh
npm create vite@latest orbit-trip -- --template react
cd orbit-trip
npm install
npm install react@18.3.1 react-dom@18.3.1 @kiwicom/orbit-components@27.7.0
# Use Node.js >=22. Replace src/main.jsx and add src/orbit.css.
npm run dev
```

## Agent Prompt

Build a travel extras selector with Orbit native components and compiled styles. Keep route context, per-traveller prices, chosen extras and total consistent. Mark fictional prices and local review clearly, clear stale review on edit, and do not imply booking or payment functionality.

## Sources

- [Orbit Getting Started](https://orbit.kiwi/getting-started/) — Current component and token versions and implementation resources.
- [Orbit Component Source](https://github.com/kiwicom/orbit) — Native props, styles and package requirements.
- [Pinned Token Export](https://cdn.jsdelivr.net/npm/@kiwicom/orbit-design-tokens@11.0.0/dist/index.js) — Exact product, type, spacing and radius values.
