# Segment Evergreen Design System — OpenDesign Application Guide

An Evergreen reference with actual theme values, controlled tag entry, live rule matching, an empty-state recovery path and a native review dialog.

OpenDesign application guide to Evergreen 7.1.9. Five fictional records demonstrate local filtering and snapshot review. No Segment customer data or audience API is connected.

## Source Reference

- **Runtime:** Native Evergreen 7.1.9 React components and defaultTheme; original local audience rules. ([source](https://evergreen.segment.com/components/tag-input))
- **Reference:** 36 concrete token/API entries ([source](https://cdn.jsdelivr.net/npm/evergreen-ui@7.1.9/esm/themes/default/index.js))
- **Source:** Complete JSX + CSS ([source](https://evergreen.segment.com/components/tag-input))


## Design Reference

Native Evergreen 7.1.9 React components and defaultTheme; original local audience rules.

### Corner radii

[Official reference](https://cdn.jsdelivr.net/npm/evergreen-ui@7.1.9/esm/themes/default/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| radii.0 | 0px | Indexed theme radius; choose a role rather than progressively rounding every nested box. |
| radii.1 | 4px | Indexed theme radius; choose a role rather than progressively rounding every nested box. |
| radii.2 | 8px | Indexed theme radius; choose a role rather than progressively rounding every nested box. |

### Type sizes

[Official reference](https://cdn.jsdelivr.net/npm/evergreen-ui@7.1.9/esm/themes/default/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontSizes.0 | 10px | Indexed font-size values in the published default theme. |
| fontSizes.1 | 12px | Indexed font-size values in the published default theme. |
| fontSizes.2 | 14px | Indexed font-size values in the published default theme. |
| fontSizes.3 | 16px | Indexed font-size values in the published default theme. |
| fontSizes.4 | 18px | Indexed font-size values in the published default theme. |
| fontSizes.5 | 20px | Indexed font-size values in the published default theme. |
| fontSizes.6 | 24px | Indexed font-size values in the published default theme. |
| fontSizes.7 | 32px | Indexed font-size values in the published default theme. |

### Line heights

[Official reference](https://cdn.jsdelivr.net/npm/evergreen-ui@7.1.9/esm/themes/default/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| lineHeights.0 | 16px | Pair with the intended text role rather than setting every paragraph to the heading rhythm. |
| lineHeights.1 | 18px | Pair with the intended text role rather than setting every paragraph to the heading rhythm. |
| lineHeights.2 | 20px | Pair with the intended text role rather than setting every paragraph to the heading rhythm. |
| lineHeights.3 | 24px | Pair with the intended text role rather than setting every paragraph to the heading rhythm. |
| lineHeights.4 | 28px | Pair with the intended text role rather than setting every paragraph to the heading rhythm. |
| lineHeights.5 | 32px | Pair with the intended text role rather than setting every paragraph to the heading rhythm. |
| lineHeights.6 | 40px | Pair with the intended text role rather than setting every paragraph to the heading rhythm. |

### Font weights

[Official reference](https://cdn.jsdelivr.net/npm/evergreen-ui@7.1.9/esm/themes/default/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontWeights.light | 300 | Evergreen names semibold as 500 and bold as 600 in this theme; do not silently replace them with browser keyword defaults. |
| fontWeights.normal | 400 | Evergreen names semibold as 500 and bold as 600 in this theme; do not silently replace them with browser keyword defaults. |
| fontWeights.semibold | 500 | Evergreen names semibold as 500 and bold as 600 in this theme; do not silently replace them with browser keyword defaults. |
| fontWeights.bold | 600 | Evergreen names semibold as 500 and bold as 600 in this theme; do not silently replace them with browser keyword defaults. |

### Default palette references

[Official reference](https://cdn.jsdelivr.net/npm/evergreen-ui@7.1.9/esm/themes/default/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colors.gray900 | #101840 | Primary dark text. |
| colors.gray700 | #696f8c | Supporting text. |
| colors.gray400 | #d8dae5 | Defined boundary. |
| colors.gray200 | #edeff5 | Subtle separator. |
| colors.gray100 | #F4F5F9 | Quiet background. |
| colors.blue500 | #3366FF | Primary blue reference. |
| colors.blue600 | #2952CC | Stronger blue interaction reference. |
| colors.red500 | #D14343 | Critical/error reference. |
| colors.green500 | #52BD95 | Success reference. |

### Layout functions and controlled-input API

[Official reference](https://evergreen.segment.com/components/tag-input)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| majorScale(3) | 24px | Eight-pixel major scale for section spacing. |
| minorScale(3) | 12px | Four-pixel minor scale for smaller relationships. |
| TagInput.values | controlled array | Application owns the accepted tags. |
| TagInput.onChange | new array; return false to retain input | Validate additions before accepting them. |
| TagInput.separator | comma and new line by default | Allow multiple tags without a custom parser. |

## Segment Evergreen Design System Audience Builder Structure

### Keep rules beside their consequences

The specimen pairs a rule panel with matching fictional records. The plan select and required tags are visible at the same time as the result count, so changing a rule has an understandable effect. The user does not need to save or open a dialog just to discover whether the current combination matches anyone.

### Use a finite transparent fixture

Five named sample records expose their plan and tags. The page does not pretend to query a customer warehouse or estimate a real audience size. A zero result is a useful part of the example, with an action that restores the complete fixture.

## Segment Evergreen Design System Theme Values and Semantics

### Read the actual default theme

Evergreen 7.1.9 provides indexed radii, font sizes and line heights alongside named colors and component styles. The table keeps those exported values intact. Its font-weight names are particularly worth reading: semibold and bold resolve to 500 and 600, which differ from common assumptions.

### Keep the custom composition aligned

ThemeProvider supplies the native inputs, tags, badges, buttons and dialog. The authored panels use the same restrained cool-gray and blue relationship. The example does not overwrite native component internals with broad CSS selectors, so the supplied interaction styling stays intact.

## Segment Evergreen Design System Typography for Rule Editing

### Give the task a clear hierarchy

Heading roles separate the audience title from panel titles and individual result names. Supporting copy explains tag entry and the fictional data scope. A count badge sits next to the result heading rather than replacing it, allowing the user to identify the region before interpreting the number.

### Keep metadata readable

Plan and tag information supports the matching explanation and is not merely decorative. The layout allows tags to wrap and stacks a record’s text and badges on a narrow phone. Reducing every label to tiny text would hide the evidence the user needs to understand the rules.

## Segment Evergreen Design System Major and Minor Scales

### Use functions for repeatable spacing

majorScale and minorScale express eight- and four-pixel steps. The component example uses majorScale(3) for a 24px panel heading gap, while the custom stylesheet handles the responsive composition. Keep that distinction clear: a grid breakpoint is an application decision, not a result of a spacing function.

### Preserve field relationships on mobile

The rule panel moves above results at the original application breakpoint. Labels, hints and controls stay together, and the tag input uses full available width. Native tag wrapping prevents a long set of values from becoming a horizontally scrolling form.

## Segment Evergreen Design System Controlled Tags and Matching

### Normalize before accepting values

The onChange handler trims and lowercases strings, removes duplicates and rejects more than four distinct tags. Returning false keeps the input when an addition is rejected. This policy belongs to the audience application; TagInput provides the controlled interaction rather than choosing a business limit.

### Use all-tags matching deliberately

A record must match the selected plan and every required tag. Clearing the tags removes that constraint; choosing Any removes the plan constraint. The current result count comes from the same filtered array rendered on screen, avoiding a count that disagrees with the visible cards.

## Segment Evergreen Design System Review Dialog and Local Snapshot

### Review the current rules before saving

A non-empty audience name is required before the dialog opens. The dialog repeats the name, count, plan and tags, then offers Save locally. This extra step demonstrates a native overlay around a concrete snapshot instead of an empty confirmation that says only Are you sure.

### Invalidate the old success when rules change

Changing name, plan or tags clears the saved snapshot indicator. A previous local success therefore cannot be mistaken for confirmation of newly edited rules. The application never describes the snapshot as a Segment audience or sends a request to a customer platform.

## Segment Evergreen Design System Keyboard Entry and Dialog Recovery

### Test tags, results and review as one flow

Tags can be added with the documented entry keys, and the input receives a visible label through its id. A rejected tag limit produces a native danger alert. The review uses the native Dialog focus behavior instead of a hand-built overlay with unmanaged focus.

1. Add newsletter to the initial active tag and compare the count.
2. Add an unmatched tag, then clear the rules to restore five records.
3. Review and save locally, then change a rule and verify that the old success disappears.

### Keep empty-state recovery in the current task

Clear rules removes both plan and tag restrictions and dismisses a stale saved state. The result region then contains all five records again. The user can continue editing immediately; no hidden navigation or page reload is required.

## Segment Evergreen Design System React Integration

### Use a complete controlled example

The native entry imports ThemeProvider, defaultTheme and the components it renders. State holds rules, errors, dialog visibility and the local saved snapshot. The complete JSX and CSS below include the fictional fixture, so the result calculation is reproducible without an external API.

- ThemeProvider uses the pinned defaultTheme.
- TagInput values are controlled by the application.
- Dialog reviews the same rules used by the result list.

### Add data access as a separate application layer

A real audience tool would need authenticated data access, a defined matching query, a loading state and server-backed save behavior. Preserve the distinction between previewing rules and persisting an audience. Do not keep the five-record fixture count when connecting to a real dataset.

## Component Examples

### main.jsx — complete working specimen

Build and review a local audience. The source below is the full React entry, including all state and validation.

```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ThemeProvider,
  defaultTheme,
  Heading,
  Text,
  Paragraph,
  Button,
  TagInput,
  TextInputField,
  SelectField,
  Alert,
  Dialog,
  Badge,
  majorScale,
} from "evergreen-ui";
import "./evergreen.css";
const people = [
  { name: "Avery Stone", plan: "Pro", tags: ["active", "newsletter"] },
  { name: "Taylor Reed", plan: "Free", tags: ["newsletter"] },
  { name: "Jordan Park", plan: "Pro", tags: ["active"] },
  { name: "Morgan Lee", plan: "Team", tags: ["active", "newsletter"] },
  { name: "Casey Chen", plan: "Free", tags: ["trial"] },
];
function App() {
  const [tags, setTags] = useState(["active"]),
    [plan, setPlan] = useState("Any"),
    [name, setName] = useState("Active customers"),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [saved, setSaved] = useState(null);
  const matches = people.filter(
    (p) =>
      (plan === "Any" || p.plan === plan) &&
      tags.every((t) => p.tags.includes(t)),
  );
  function changeTags(values) {
    const unique = [
      ...new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean)),
    ];
    if (unique.length > 4) {
      setError("Use at most four tags.");
      return false;
    }
    setTags(unique);
    setError("");
    setSaved(null);
  }
  return (
    <ThemeProvider value={defaultTheme}>
      <main className="audience">
        <header>
          <Text size={300}>WORKSPACE / AUDIENCES</Text>
          <Heading size={700} marginTop={8}>
            Build a focused audience
          </Heading>
          <Paragraph marginTop={8}>
            Combine a plan and tags against five fictional records. No customer
            data is loaded.
          </Paragraph>
        </header>
        <div className="audience-grid">
          <section className="rule-panel">
            <Heading size={500} marginBottom={majorScale(3)}>
              Audience rules
            </Heading>
            <TextInputField
              label="Audience name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(null);
              }}
            />
            <SelectField
              label="Plan"
              value={plan}
              onChange={(e) => {
                setPlan(e.target.value);
                setSaved(null);
              }}
            >
              <option>Any</option>
              <option>Free</option>
              <option>Pro</option>
              <option>Team</option>
            </SelectField>
            <label htmlFor="audience-tags">Required tags</label>
            <Paragraph size={300} marginBottom={8}>
              Press Enter or comma to add a tag. Every tag must match.
            </Paragraph>
            <TagInput
              values={tags}
              onChange={changeTags}
              width="100%"
              inputProps={{ id: "audience-tags", placeholder: "Add tag…" }}
            />
            <Paragraph size={300} marginTop={8}>
              Available sample tags: active, newsletter, trial.
            </Paragraph>
            {error && <Alert intent="danger" title={error} marginTop={16} />}
            <Button
              appearance="primary"
              marginTop={24}
              onClick={() => {
                if (!name.trim()) {
                  setError("Name the audience before reviewing.");
                  return;
                }
                setError("");
                setOpen(true);
              }}
            >
              Review audience
            </Button>
          </section>
          <section className="results-panel">
            <div className="results-title">
              <Heading size={500}>Matching sample records</Heading>
              <Badge color="blue">
                {matches.length} of {people.length}
              </Badge>
            </div>
            {matches.length ? (
              <div className="record-list">
                {matches.map((p) => (
                  <article key={p.name}>
                    <div>
                      <Heading size={400}>{p.name}</Heading>
                      <Text size={300}>{p.plan} plan</Text>
                    </div>
                    <div className="tag-list">
                      {p.tags.map((t) => (
                        <Badge key={t} color="neutral">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                <Heading size={500}>No matching sample records</Heading>
                <Paragraph marginTop={8}>
                  Remove a tag or change the plan to broaden the selection.
                </Paragraph>
                <Button
                  marginTop={16}
                  onClick={() => {
                    setTags([]);
                    setPlan("Any");
                    setSaved(null);
                  }}
                >
                  Clear rules
                </Button>
              </div>
            )}
            {saved && (
              <Alert
                intent="success"
                title="Local audience saved"
                marginTop={20}
              >
                {saved.name} · {saved.count} sample records. Nothing was sent to
                Segment.
              </Alert>
            )}
          </section>
        </div>
        <Dialog
          isShown={open}
          title="Review local audience"
          onCloseComplete={() => setOpen(false)}
          confirmLabel="Save locally"
          onConfirm={() => {
            setSaved({ name: name.trim(), count: matches.length });
            setOpen(false);
          }}
          width={560}
        >
          <Paragraph>
            <strong>{name}</strong> matches {matches.length} of {people.length}{" "}
            fictional records.
          </Paragraph>
          <Paragraph marginTop={12}>
            Plan: {plan}. Required tags: {tags.join(", ") || "none"}.
          </Paragraph>
          <Paragraph marginTop={12}>
            This saves only a local snapshot; it does not create a Segment
            audience.
          </Paragraph>
        </Dialog>
        <footer>
          Native Evergreen 7.1.9 React components. Original audience logic; no
          analytics or customer service connection.
        </footer>
      </main>
    </ThemeProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://evergreen.segment.com/components/tag-input)

- Create a Vite React project, keep <div id="root"></div>, and load this as src/main.jsx.

### evergreen.css — original responsive composition

Application layout layered around the native components.

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #f4f5f9;
  color: #101840;
  font:
    14px/1.5 system-ui,
    sans-serif;
}
.audience {
  padding: 32px;
}
.audience header {
  max-width: 800px;
  margin-bottom: 28px;
}
.audience-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.5fr);
  gap: 24px;
}
.rule-panel,
.results-panel {
  padding: 24px;
  background: white;
  border: 1px solid #d8dae5;
  border-radius: 8px;
  min-width: 0;
}
.rule-panel > label {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}
.results-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.record-list article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #edeff5;
}
.record-list article:first-child {
  padding-top: 0;
}
.record-list article:last-child {
  border: 0;
}
.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.empty {
  padding: 36px 12px;
  text-align: center;
  background: #f4f5f9;
  border-radius: 4px;
}
.audience footer {
  margin-top: 24px;
  font-size: 12px;
  color: #696f8c;
}
.audience input {
  max-width: 100%;
}
[role="dialog"] {
  max-width: calc(100vw - 32px);
}
@media (max-width: 850px) {
  .audience-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 550px) {
  .audience {
    padding: 16px;
  }
  .rule-panel,
  .results-panel {
    padding: 20px;
  }
  .record-list article {
    align-items: flex-start;
    flex-direction: column;
  }
  .results-title {
    align-items: flex-start;
  }
}

```

[Code reference](https://evergreen.segment.com/components/tag-input)

- Save beside main.jsx. These custom composition rules are distinguished from the library token reference.

## Implementation Starting Point

The pinned native example was bundled and browser-checked locally. The specimen uses only local application state.

```sh
npm create vite@latest evergreen-audience -- --template react
cd evergreen-audience
npm install
npm install react@18.3.1 react-dom@18.3.1 evergreen-ui@7.1.9
# Replace src/main.jsx and add src/evergreen.css.
npm run dev
```

## Agent Prompt

Build an Evergreen audience editor using the actual theme and controlled TagInput. Normalize and deduplicate tags, make all-tags matching explicit, keep results and counts consistent, review in a native Dialog, and clear stale success when rules change. Do not claim a Segment service connection.

## Sources

- [Evergreen Tag Input](https://evergreen.segment.com/components/tag-input) — Controlled values, separators and rejection behavior.
- [Evergreen Dialog](https://evergreen.segment.com/components/dialog) — Native focus, confirmation and close behavior.
- [Pinned Theme Source](https://cdn.jsdelivr.net/npm/evergreen-ui@7.1.9/esm/themes/default/index.js) — Published default theme composition.
