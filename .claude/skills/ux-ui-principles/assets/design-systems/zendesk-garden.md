# Zendesk Garden Design System — OpenDesign Application Guide

A Garden guide for support work with real theme aliases, type and radius scales, a complete reply composer, visibility-aware local drafts and field recovery.

OpenDesign application guide. Native Garden components render the specimen; fictional ticket content and local drafts do not connect to Zendesk or send messages.

## Source Reference

- **Runtime:** Native Garden 9.16.1 React ThemeProvider, Buttons and Forms; original local drafting workflow. ([source](https://garden.zendesk.com/components/input/))
- **Reference:** 42 concrete token/API entries ([source](https://github.com/zendeskgarden/react-components/tree/main/packages/theming))
- **Source:** Complete JSX + CSS ([source](https://garden.zendesk.com/components/input/))


## Design Reference

Native Garden 9.16.1 React ThemeProvider, Buttons and Forms; original local drafting workflow.

### Control radius

[Official reference](https://github.com/zendeskgarden/react-components/tree/main/packages/theming)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| borderRadii.sm | 2px | Choose shape by component role; the default medium corner is not a pill. |
| borderRadii.md | 4px | Choose shape by component role; the default medium corner is not a pill. |
| borderRadii.lg | 8px | Choose shape by component role; the default medium corner is not a pill. |

### Responsive breakpoints

[Official reference](https://github.com/zendeskgarden/react-components/tree/main/packages/theming)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| breakpoints.xs | 0px | Theme breakpoints, not a promise that the application switches every region at each step. |
| breakpoints.sm | 576px | Theme breakpoints, not a promise that the application switches every region at each step. |
| breakpoints.md | 768px | Theme breakpoints, not a promise that the application switches every region at each step. |
| breakpoints.lg | 992px | Theme breakpoints, not a promise that the application switches every region at each step. |
| breakpoints.xl | 1200px | Theme breakpoints, not a promise that the application switches every region at each step. |

### Type sizes

[Official reference](https://github.com/zendeskgarden/react-components/tree/main/packages/theming)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontSizes.xs | 10px | Retain distinct body, label, metadata and heading roles. |
| fontSizes.sm | 12px | Retain distinct body, label, metadata and heading roles. |
| fontSizes.md | 14px | Retain distinct body, label, metadata and heading roles. |
| fontSizes.lg | 18px | Retain distinct body, label, metadata and heading roles. |
| fontSizes.xl | 22px | Retain distinct body, label, metadata and heading roles. |
| fontSizes.xxl | 26px | Retain distinct body, label, metadata and heading roles. |
| fontSizes.xxxl | 36px | Retain distinct body, label, metadata and heading roles. |

### Line heights

[Official reference](https://github.com/zendeskgarden/react-components/tree/main/packages/theming)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| lineHeights.sm | 16px | Use alongside the text role; do not derive all line heights from font size. |
| lineHeights.md | 20px | Use alongside the text role; do not derive all line heights from font size. |
| lineHeights.lg | 24px | Use alongside the text role; do not derive all line heights from font size. |
| lineHeights.xl | 28px | Use alongside the text role; do not derive all line heights from font size. |
| lineHeights.xxl | 32px | Use alongside the text role; do not derive all line heights from font size. |
| lineHeights.xxxl | 44px | Use alongside the text role; do not derive all line heights from font size. |

### Spacing steps

[Official reference](https://github.com/zendeskgarden/react-components/tree/main/packages/theming)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| space.base | 4 | Theme spacing entries for predictable rhythm. |
| space.xxs | 4px | Theme spacing entries for predictable rhythm. |
| space.xs | 8px | Theme spacing entries for predictable rhythm. |
| space.sm | 12px | Theme spacing entries for predictable rhythm. |
| space.md | 20px | Theme spacing entries for predictable rhythm. |
| space.lg | 32px | Theme spacing entries for predictable rhythm. |
| space.xl | 40px | Theme spacing entries for predictable rhythm. |
| space.xxl | 48px | Theme spacing entries for predictable rhythm. |

### Light semantic role mapping

[Official reference](https://github.com/zendeskgarden/react-components/tree/main/packages/theming)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colors.variables.light.background.default | palette.white | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.background.subtle | neutralHue.100 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.background.danger | dangerHue.100 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.background.primaryEmphasis | primaryHue.700 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.foreground.default | neutralHue.900 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.foreground.subtle | neutralHue.700 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.foreground.onEmphasis | palette.white | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.foreground.primary | primaryHue.700 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.foreground.danger | dangerHue.700 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.border.default | neutralHue.300 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.border.subtle | neutralHue.200 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.border.danger | dangerHue.300 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |
| colors.variables.light.border.primaryEmphasis | primaryHue.700 | Theme role alias; resolve through the selected hue and palette instead of treating the alias as a CSS color. |

## Zendesk Garden Design System Support Workspace Structure

### Keep the customer request in view

A support composer needs enough context to avoid a polished but irrelevant reply. The specimen places the customer request above the draft, with requester, organization and topic beside it. The interface is dense enough to compare the new text with the original question without switching screens.

### Separate history from the active draft

Saved local entries appear above the composer with an explicit visibility label. The active draft remains in the native Textarea. Saving adds a snapshot and clears that field, so later edits cannot silently rewrite an earlier saved note.

## Zendesk Garden Design System Theme Roles and Palette

### Read aliases before copying colors

Garden 9 DEFAULT_THEME maps semantic roles to hue families and numbered palette values. A role such as background.primaryEmphasis is not a literal hexadecimal value. The reference table retains those aliases so a custom theme can change the primary hue without leaving hardcoded blue fragments in native controls.

### Keep authored regions compatible with the provider

ThemeProvider supplies native component styling. This specimen uses DEFAULT_THEME and a matching light custom workspace; it does not add a fake dark-mode toggle that only changes the surrounding background. If adding color-scheme support, convert the custom message and sidebar colors alongside the provider.

## Zendesk Garden Design System Typography and Density

### Keep 14px work text readable

The default theme exposes a 14px medium role and a 20px medium line height, with separate 12px supporting and 18px heading roles. The sample uses a 26px ticket title and smaller context metadata. The original customer message and saved notes stay in normal body text rather than compressed labels.

### Let long replies wrap naturally

Saved text preserves line breaks and wraps long words. A narrow mobile screen therefore retains the full note instead of forcing a horizontal scroll. The composer grows vertically through its textarea rather than turning the whole message history into an internal scrolling box.

## Zendesk Garden Design System Field and Button Composition

### Keep label, hint and error connected

The native Field groups Label, Hint, Textarea and conditional Message. The validation prop changes the textarea appearance when the authored minimum-length rule fails. This follows the component composition rather than applying error color to an unrelated paragraph outside the field.

### Give visibility its own control

A native Select chooses Public reply or Internal note. The label and hint update with the mode, and the saved snapshot retains that mode. The action remains Save local draft in both cases, making it clear that selecting Public reply does not send a message.

## Zendesk Garden Design System Draft State and Local History

### Validate before appending a message

The application requires at least twelve trimmed characters. A failed submission leaves the draft intact, reveals a field message and focuses the textarea. Editing clears the stale error; a later submission checks the current text again. This rule is application behavior, not an undocumented Garden default.

### Keep internal notes visually distinct

Internal entries have a warm authored background and a written Internal note draft label. Public entries use the normal surface. Both explicitly say not sent. The distinction demonstrates visibility context without imitating a live Zendesk conversation or implying that another person has received anything.

## Zendesk Garden Design System Responsive Work Areas

### Stack the context after the main task

At the application breakpoint the ticket context moves below the conversation and composer. The order of the underlying document remains the same. On a phone, the visibility control spans the available width and the action row wraps so button labels are not compressed.

### Use moderate radii and thin dividers

Native controls draw from the 2px, 4px and 8px radius scale. The original message panels use a 4px corner with subtle borders. Stronger visual emphasis belongs to the active action and validation state, not to shadows around every message.

## Zendesk Garden Design System Validation and Keyboard Recovery

### Exercise the complete draft flow

A useful check starts with an invalid submission, then verifies that typing, changing visibility, saving and clearing all leave the interface understandable. The source uses a React ref to restore focus after an error or clear action. The result count is announced in a status region.

1. Submit a short draft and follow the field error.
2. Choose Internal note, enter a useful note and save it.
3. Clear a later draft and confirm that the saved local snapshot remains.

### Preserve a stable reading order

The request precedes the draft, and newly saved local snapshots stay in chronological order. Native buttons expose their actions as text. No keyboard shortcut or automatic sending behavior is hidden behind the composer, and the visibility choice remains a labeled select.

## Zendesk Garden Design System React Integration

### Install matching package generations

The specimen pins theming, buttons and forms to 9.16.1 and uses React 18 with styled-components. Mixing older Garden package generations can create mismatched theme expectations. The full JSX entry includes the provider, field composition and local state, while the CSS file contains only authored layout.

- @zendeskgarden/react-theming 9.16.1
- @zendeskgarden/react-buttons 9.16.1
- @zendeskgarden/react-forms 9.16.1

### Extend only the missing service layer

To make this a real support tool, add authorized ticket data, permission checks and a verified send/draft API with pending and failure behavior. Keep the local snapshot semantics until those responses exist. Do not convert the button label to Send merely because the form validation succeeds.

## Component Examples

### main.jsx — complete working specimen

Draft a reply with the customer context in view. The source below is the full React entry, including all state and validation.

```jsx
import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, DEFAULT_THEME } from "@zendeskgarden/react-theming";
import { Button } from "@zendeskgarden/react-buttons";
import {
  Field,
  Label,
  Textarea,
  Hint,
  Message,
  Select,
} from "@zendeskgarden/react-forms";
import "./garden.css";
function App() {
  const [mode, setMode] = useState("public"),
    [text, setText] = useState(""),
    [error, setError] = useState(false),
    [items, setItems] = useState([]);
  const ref = useRef();
  function submit(e) {
    e.preventDefault();
    if (text.trim().length < 12) {
      setError(true);
      ref.current.focus();
      return;
    }
    setItems([...items, { mode, text: text.trim() }]);
    setText("");
    setError(false);
  }
  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <main className="garden-workspace">
        <header>
          <span>SUPPORT WORKSPACE / FICTIONAL TICKET</span>
          <h1>Help with an invoice address</h1>
          <p>Ticket #1028 · Nadia Walker · Email channel</p>
        </header>
        <div className="garden-grid">
          <section>
            <div className="message customer">
              <strong>Nadia Walker</strong>
              <small>Customer · example message</small>
              <p>
                Could you update the company address on our next invoice? The
                billing contact has changed.
              </p>
            </div>
            {items.map((i, n) => (
              <article className={"message " + i.mode} key={n}>
                <strong>
                  {i.mode === "public"
                    ? "Public reply draft"
                    : "Internal note draft"}
                </strong>
                <small>Saved locally · not sent</small>
                <p>{i.text}</p>
              </article>
            ))}
            <form onSubmit={submit} noValidate>
              <div className="composer-head">
                <h2>Compose a draft</h2>
                <Field>
                  <Label>Visibility</Label>
                  <Select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="public">Public reply</option>
                    <option value="internal">Internal note</option>
                  </Select>
                </Field>
              </div>
              <Field>
                <Label>
                  {mode === "public" ? "Reply text" : "Internal note"}
                </Label>
                <Hint>
                  {mode === "public"
                    ? "Prepared for the customer; this demo will not send it."
                    : "Internal context for the support team; saved only in this page."}
                </Hint>
                <Textarea
                  ref={ref}
                  value={text}
                  rows={5}
                  validation={error ? "error" : undefined}
                  onChange={(e) => {
                    setText(e.target.value);
                    setError(false);
                  }}
                />
                {error && (
                  <Message validation="error">
                    Write at least 12 characters.
                  </Message>
                )}
              </Field>
              <div className="composer-actions">
                <span>{text.length} characters</span>
                <Button
                  type="button"
                  onClick={() => {
                    setText("");
                    setError(false);
                    ref.current.focus();
                  }}
                >
                  Clear draft
                </Button>
                <Button isPrimary type="submit">
                  Save local draft
                </Button>
              </div>
            </form>
            <p role="status">
              {items.length > 0
                ? `${items.length} draft${items.length === 1 ? "" : "s"} saved locally. No message sent.`
                : ""}
            </p>
          </section>
          <aside>
            <h2>Ticket context</h2>
            <dl>
              <dt>Requester</dt>
              <dd>Nadia Walker</dd>
              <dt>Organization</dt>
              <dd>Northstar Studio</dd>
              <dt>Priority</dt>
              <dd>Normal</dd>
              <dt>Topic</dt>
              <dd>Billing details</dd>
            </dl>
            <div className="context-note">
              <h3>Before replying</h3>
              <ul>
                <li>Confirm the billing contact.</li>
                <li>Keep invoice identifiers out of public examples.</li>
                <li>State whether the change affects future invoices.</li>
              </ul>
            </div>
          </aside>
        </div>
        <footer>
          Native Garden 9.16.1 React components. Original local drafting
          workflow; no Zendesk connection.
        </footer>
      </main>
    </ThemeProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://garden.zendesk.com/components/input/)

- Create a Vite React project, keep <div id="root"></div>, and load this as src/main.jsx.

### garden.css — original responsive composition

Application layout layered around the native components.

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font:
    14px/1.5 system-ui,
    sans-serif;
  color: #293239;
  background: #f8f9f9;
}
.garden-workspace header {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #d8dcde;
}
.garden-workspace header span {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: #5c6970;
}
.garden-workspace h1 {
  font-size: 26px;
  line-height: 1.3;
  margin: 8px 0;
}
.garden-workspace header p {
  color: #5c6970;
  margin: 0;
}
.garden-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  padding: 24px 32px;
}
.message {
  padding: 20px;
  background: white;
  border: 1px solid #d8dcde;
  border-radius: 4px;
  margin-bottom: 16px;
}
.message p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 12px 0 0;
}
.message small {
  display: block;
  color: #5c6970;
  margin-top: 4px;
}
.message.internal {
  background: #fff8ed;
  border-color: #e7ce99;
}
form {
  padding: 24px;
  background: white;
  border: 1px solid #d8dcde;
  border-radius: 4px;
}
.composer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}
.composer-head > div {
  max-width: 220px;
}
.garden-workspace h2 {
  font-size: 18px;
  margin: 0 0 12px;
}
.composer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.composer-actions span {
  font-size: 12px;
  color: #5c6970;
  margin-right: auto;
}
.garden-grid aside {
  background: white;
  border: 1px solid #d8dcde;
  border-radius: 4px;
  padding: 20px;
  align-self: start;
}
dl {
  margin: 0;
}
dt {
  font-size: 12px;
  color: #5c6970;
  margin-top: 16px;
}
dd {
  margin: 4px 0 0;
  font-weight: 600;
}
.context-note {
  margin-top: 24px;
  border-top: 1px solid #e8eaec;
  padding-top: 16px;
}
.context-note h3 {
  font-size: 14px;
}
.context-note ul {
  padding-left: 18px;
  font-size: 12px;
}
.context-note li {
  margin: 8px 0;
}
footer {
  padding: 16px 32px;
  font-size: 12px;
  color: #5c6970;
  border-top: 1px solid #d8dcde;
  background: white;
}
@media (max-width: 850px) {
  .garden-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 550px) {
  .garden-grid {
    padding: 16px;
  }
  .garden-workspace header {
    padding: 20px 16px;
  }
  .composer-head {
    display: block;
  }
  .composer-head > div {
    max-width: none;
  }
  .composer-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .composer-actions span {
    width: 100%;
  }
  form {
    padding: 16px;
  }
}

```

[Code reference](https://garden.zendesk.com/components/input/)

- Save beside main.jsx. These custom composition rules are distinguished from the library token reference.

## Implementation Starting Point

The pinned native example was bundled and browser-checked locally. The specimen uses only local application state.

```sh
npm create vite@latest garden-draft -- --template react
cd garden-draft
npm install
npm install react@18.3.1 react-dom@18.3.1 styled-components @zendeskgarden/react-theming@9.16.1 @zendeskgarden/react-buttons@9.16.1 @zendeskgarden/react-forms@9.16.1
# Replace src/main.jsx and add src/garden.css.
npm run dev
```

## Agent Prompt

Build a Garden support composer with native Field/Label/Hint/Textarea/Message composition. Keep visibility in each saved draft snapshot, validate before appending, preserve customer context, and distinguish local saving from sending. Use the exact theme roles and complete source here.

## Sources

- [Garden Forms](https://garden.zendesk.com/components/input/) — Native Field, Label and validation composition.
- [Garden Buttons](https://garden.zendesk.com/components/button/) — Action variants and supported sizes.
- [Theme Source](https://github.com/zendeskgarden/react-components/tree/main/packages/theming) — DEFAULT_THEME aliases, palette and scales.
