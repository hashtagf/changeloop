# B.C. Design System — OpenDesign Application Guide

Build a B.C.-style reminder preference form with real semantic tokens, native React Aria controls, conditional contact fields and complete validation behavior.

An OpenDesign application study using the current public B.C. React library. This is an original local form, not an official government service; use fictional contact details.

## Source Reference

- **Runtime:** Native @bcgov/design-system-react-components 0.8.1, tokens 5.0.0 and BC Sans 2.1.2. ([source](https://github.com/bcgov/design-system/))
- **Reference:** 36 concrete token/API entries ([source](https://www2.gov.bc.ca/gov/content/digital/design-system/foundations/design-tokens))
- **Source:** Complete JSX + CSS ([source](https://github.com/bcgov/design-system/))


## Design Reference

Native @bcgov/design-system-react-components 0.8.1, tokens 5.0.0 and BC Sans 2.1.2.

### Surface and text roles

[Official reference](https://www2.gov.bc.ca/gov/content/digital/design-system/foundations/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --surface-color-primary-button-default | #013366 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-primary-button-hover | #1e5189 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-primary-button-disabled | #edebe9 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-background-white | #ffffff | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-background-light-gray | #faf9f8 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-background-light-blue | #f1f8fe | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-border-default | #d8d8d8 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-border-medium | #898785 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --surface-color-border-active | #2e5dd7 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-color-primary | #2d2d2d | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-color-secondary | #474543 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-color-link | #255a90 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-color-danger | #ce3e39 | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-color-primary-invert | #ffffff | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |

### Layout rhythm

[Official reference](https://www2.gov.bc.ca/gov/content/digital/design-system/foundations/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --layout-padding-hair | 0.125rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-padding-xsmall | 0.25rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-padding-small | 0.5rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-padding-medium | 1rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-padding-large | 1.5rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-padding-xlarge | 2rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-margin-medium | 1rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-margin-large | 1.5rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-margin-xlarge | 2rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-margin-xxxlarge | 3rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-border-radius-small | 2px | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-border-radius-medium | 4px | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --layout-border-radius-large | 6px | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |

### Type scale

[Official reference](https://www2.gov.bc.ca/gov/content/digital/design-system/foundations/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --typography-font-size-small-body | 0.875rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-body | 1rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-large-body | 1.125rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-h5 | 1.25rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-h4 | 1.5rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-h3 | 1.75rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-h2 | 2rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-h1 | 2.25rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |
| --typography-font-size-display | 3rem | Published B.C. role; use by purpose rather than replacing it with a raw color or dimension. |

## B.C. Design System Current React Library and Tokens

### Choose the maintained implementation

The current B.C. Design System provides React components built on React Aria. This example pins react-components 0.8.1 and its design-tokens 5.0.0 dependency. The older B.C. Web Components repository is a separate legacy implementation; importing it does not reproduce the current React library. Match the implementation to the documentation before copying an example.

### Import the actual font face

The components expect the BC Sans family name with a space. Version 2.1.2 provides css/BC_Sans.css; the old BCSans.css entry is marked deprecated and declares a different family name. A developer machine with BC Sans installed can conceal a missing font import. The specimen bundles the published font so the result does not depend on a local installation.

## B.C. Design System Semantic Color and Spacing Roles

### Read the role before choosing the value

Primary buttons use the dark-blue primary-button fill, while supporting content uses typography-color-secondary. Error messages use typography-color-danger. The table records the current CSS export names; the name conveys a stable intent even when a future theme changes the underlying value. Avoid confusing an inactive control color with ordinary supporting text.

### Keep geometry deliberate

The form uses 24px field spacing and a wider 48px gap between the main task and supporting explanation. Those values correspond to the library rhythm, while the overall two-column composition is authored for this specimen. The mobile layout collapses the columns without shrinking the form labels or turning explanatory text into a tooltip.

## B.C. Design System Conditional Fields and Retained Values

### Validate only the chosen contact method

A native RadioGroup controls whether the Email address or Phone number TextField is visible. Both values stay in React state when the method changes, but only the selected field participates in review validation. This keeps useful input while preventing an invisible field from blocking the current task.

### Show useful local errors

The email field checks a simple address shape, and the phone example requires at least ten digits. These are explicitly sample rules, not a complete international contact validator. Invalid review sets isInvalid and provides a field-specific errorMessage. Missing agreement gets a visible message; the first invalid control receives focus.

## B.C. Design System React Aria Component Contracts

### Use controlled values and documented handlers

TextField receives value and onChange; RadioGroup receives value and onChange; Checkbox uses isSelected and onChange. These handlers receive their documented values, not a browser event object that must always be read through event.target. Button uses type=submit and the native form’s submit event so keyboard submission shares the same validation path.

### Keep review feedback synchronized

Review preference shows a local summary of the selected contact method. Any change clears the old result and resets submitted error state. The example does not say an email was sent or a reminder was scheduled. A real notification service would require a separate consent, persistence and delivery contract before making those claims.

## B.C. Design System Accessible Names and Responsive Composition

### Keep labels, descriptions and errors connected

The native components provide their React Aria relationships for labels, help text and error messages. The application still supplies meaningful labels, a clear group description and understandable validation text. Testing must click visible radio labels and use the keyboard; the internal visually hidden input is not the visible target.

### Separate supporting guidance from the form

The adjacent callout explains the local workflow and includes a native details disclosure with implementation context. At narrow widths it follows the form in the reading order. The information symbol is decorative because the heading carries the meaning. No official B.C. logo or government-service claim is required to study the components.

## B.C. Design System Complete React Implementation

### Reproduce the verified source

Create a Vite React project and install the pinned component, token and font packages. Use the supplied main.jsx and bc.css with a root mount element. The bundle includes native radio, field, checkbox and button behavior plus the complete local validation and state transitions. No private API or credential is necessary.

1. Install the pinned packages and import css/BC_Sans.css.
2. Save main.jsx and bc.css, keeping the root mount element.
3. Submit an empty form, then correct the visible field.
4. Switch methods and confirm the previous value is retained.

### Keep conditional validation aligned with the selected method

RadioGroup and TextField onChange handlers receive values, while Checkbox onChange receives the selected boolean. Store those values directly rather than applying a generic event.target.value handler to every component. The visible labels remain the interaction targets even when React Aria visually hides a native input.

When the contact method changes, retain both draft values but clear the old review and validate only the chosen method. Move focus to the first invalid visible control after submission. This lets a person compare contact options without losing an email address or being blocked by an invisible phone field. The sample’s ten-digit phone rule is deliberately local and must be replaced with the service’s actual international-number requirements.

- Only the selected contact field is validated.
- Editing any choice clears old review feedback.
- The result does not claim a reminder was scheduled.

## Component Examples

### main.jsx — complete working specimen

Choose and review a contact preference. The source below is the full React entry, including all state and validation.

```jsx
import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
} from "@bcgov/design-system-react-components";
import "@bcgov/bc-sans/css/BC_Sans.css";
import "./bc.css";
function App() {
  const [method, setMethod] = useState("email"),
    [email, setEmail] = useState(""),
    [phone, setPhone] = useState(""),
    [consent, setConsent] = useState(false),
    [submitted, setSubmitted] = useState(false),
    [result, setResult] = useState("");
  const panel = useRef(null);
  const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    invalidPhone = phone.replace(/\D/g, "").length < 10;
  function change(fn, value) {
    fn(value);
    setResult("");
    setSubmitted(false);
  }
  function review(e) {
    e.preventDefault();
    setSubmitted(true);
    if ((method === "email" ? invalidEmail : invalidPhone) || !consent) {
      requestAnimationFrame(() =>
        panel.current
          .querySelector(
            '[aria-invalid="true"] input,input[aria-invalid="true"],input[type=checkbox]:not(:checked)',
          )
          ?.focus(),
      );
      return;
    }
    setResult(
      `Local preference ready: ${method === "email" ? "Email to " + email : "Phone call to " + phone}. No reminder has been scheduled.`,
    );
  }
  return (
    <main>
      <header>
        <div className="eyebrow">
          SERVICE REMINDER / ORIGINAL APPLICATION STUDY
        </div>
        <h1>Choose how to hear from us</h1>
        <p>
          Set a sample reminder preference. Use fictional contact details in
          this local example.
        </p>
      </header>
      <div className="columns">
        <form onSubmit={review} noValidate ref={panel}>
          <RadioGroup
            label="Contact method"
            value={method}
            onChange={(v) => change(setMethod, v)}
            description="Choose one way to receive a reminder."
          >
            <Radio value="email">Email</Radio>
            <Radio value="phone">Phone call</Radio>
          </RadioGroup>
          <div className="field">
            {method === "email" ? (
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={(v) => change(setEmail, v)}
                isRequired
                isInvalid={submitted && invalidEmail}
                errorMessage="Enter an email address in the format name@example.com."
                description="Use a sample address, such as alex@example.com."
              />
            ) : (
              <TextField
                label="Phone number"
                type="tel"
                value={phone}
                onChange={(v) => change(setPhone, v)}
                isRequired
                isInvalid={submitted && invalidPhone}
                errorMessage="Enter a phone number with at least 10 digits."
                description="Sample validation only; a real service needs a jurisdiction-aware phone rule."
              />
            )}
          </div>
          <div className="field">
            <Checkbox
              isSelected={consent}
              onChange={(v) => change(setConsent, v)}
              isInvalid={submitted && !consent}
            >
              I agree to use these details for this sample reminder
            </Checkbox>
            {submitted && !consent && (
              <p className="error" role="alert">
                Confirm the reminder preference before continuing.
              </p>
            )}
          </div>
          <Button type="submit" variant="primary">
            Review preference
          </Button>
          <p className="result" role="status">
            {result}
          </p>
        </form>
        <aside>
          <div className="status-mark" aria-hidden="true">
            i
          </div>
          <h2>What happens next</h2>
          <ol>
            <li>Choose a contact method.</li>
            <li>Review the sample details.</li>
            <li>Connect a real notification service before scheduling.</li>
          </ol>
          <p>
            This example keeps both fields while switching methods, but only
            reviews the selected method.
          </p>
          <details>
            <summary>About this specimen</summary>
            <p>
              Native B.C. React Aria components with BC Sans. The form is
              original and is not an official government service.
            </p>
          </details>
        </aside>
      </div>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://github.com/bcgov/design-system/)

- Create a Vite React project, keep <div id="root"></div>, and load this as src/main.jsx.

### bc.css — original responsive composition

Application layout layered around the native components.

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font:
    16px/1.5 "BC Sans",
    sans-serif;
  color: var(--typography-color-primary, #2d2d2d);
  background: white;
}
main {
  padding: 32px;
}
header {
  border-top: 6px solid #fcba19;
  border-bottom: 1px solid #d8d8d8;
  padding: 24px 0;
  margin-bottom: 32px;
}
.eyebrow {
  font-size: 13px;
  color: #474543;
}
h1 {
  font-size: 32px;
  line-height: 1.25;
  margin: 8px 0 16px;
}
h2 {
  font-size: 24px;
  margin: 0 0 16px;
}
p {
  margin: 8px 0 16px;
}
.columns {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 48px;
}
form {
  max-width: 620px;
}
.field {
  margin: 24px 0;
}
aside {
  padding: 24px;
  background: #f1f8fe;
  border-left: 4px solid #1a5a96;
  align-self: start;
}
.status-mark {
  background: #1a5a96;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  font-weight: bold;
  margin-bottom: 16px;
}
ol {
  padding-left: 24px;
}
li {
  padding-left: 4px;
  margin: 12px 0;
}
.error {
  color: #ce3e39;
  font-size: 14px;
}
.result {
  margin-top: 24px;
  color: #24613b;
}
summary {
  cursor: pointer;
  text-decoration: underline;
  color: #1a5a96;
}
details {
  margin-top: 24px;
}
details p {
  font-size: 14px;
}
@media (max-width: 767px) {
  main {
    padding: 16px;
  }
  .columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  h1 {
    font-size: 28px;
  }
  aside {
    padding: 16px;
  }
}

```

[Code reference](https://github.com/bcgov/design-system/)

- Save beside main.jsx. These custom composition rules are distinguished from the library token reference.

## Implementation Starting Point

The pinned native example was bundled and browser-checked locally. The specimen uses only local application state.

```sh
npm create vite@latest bc-reminder -- --template react
cd bc-reminder
npm install
npm install @bcgov/design-system-react-components@0.8.1 @bcgov/design-tokens@5.0.0 @bcgov/bc-sans@2.1.2
# Replace src/main.jsx and add src/bc.css using the complete examples.
npm run dev
```

## Agent Prompt

Build the reminder form with B.C. React components 0.8.1 and BC Sans 2.1.2. Preserve conditional validation, retained input, visible errors and stale-result clearing. Use the current token names and correct spaced font family. Keep the example local until a real notification contract exists.

## Sources

- [Current component source](https://github.com/bcgov/design-system/) — React Aria library and package boundaries.
- [Design tokens](https://www2.gov.bc.ca/gov/content/digital/design-system/foundations/design-tokens) — Semantic token model and current values.
- [Typography](https://www2.gov.bc.ca/gov/content/digital/design-system/foundations/typography) — BC Sans foundation and usage.
- [BC Sans source](https://github.com/bcgov/bc-sans) — Public font family and correct CSS entrypoint.
