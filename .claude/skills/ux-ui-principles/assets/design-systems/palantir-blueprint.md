# Palantir Blueprint Design System — OpenDesign Application Guide

Build a dense data workspace with Blueprint: verified type and intent tokens, a selectable dataset table, a review inspector, and complete React source.

OpenDesign application guide to Blueprint 6.21.0, with an original dataset-review example running the actual React package. Dataset names and review results are local sample data. The workbench layout is application code; the reference values come from the versioned published package.

## Source Reference

- **Native package:** @blueprintjs/core 6.21.0 ([source](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css))
- **Component namespace:** bp6-* ([source](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css))
- **Body medium:** 14px ([source](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css))


## Design Reference

Blueprint core 6.21.0 published CSS and native React components. These are selected light-theme token values; use the library dark theme rather than manually inverting them. Application layout choices are identified in the example CSS.

### Intent colors and interaction states

[Official reference](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bp-intent-primary-rest | #2d72d2 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-primary-hover | #215db0 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-primary-active | #184a90 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-primary-disabled | #4c90f0 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-primary-foreground | #ffffff | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-success-rest | #238551 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-success-hover | #1c6e42 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-success-active | #165a36 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-success-disabled | #32a467 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-success-foreground | #ffffff | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-warning-rest | #c87619 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-warning-hover | #935610 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-warning-active | #77450d | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-warning-disabled | #ec9a3c | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-warning-foreground | #111418 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-danger-rest | #cd4246 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-danger-hover | #ac2f33 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-danger-active | #8e292c | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-danger-disabled | #e76a6e | Use the named semantic role; keep state and foreground pairings together. |
| --bp-intent-danger-foreground | #ffffff | Use the named semantic role; keep state and foreground pairings together. |

### Typography scale and weights

[Official reference](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bp-typography-size-body-x-small | 10px | Body, label and supporting data scale; do not turn small metadata into the primary reading size. |
| --bp-typography-size-body-small | 12px | Body, label and supporting data scale; do not turn small metadata into the primary reading size. |
| --bp-typography-size-body-medium | 14px | Body, label and supporting data scale; do not turn small metadata into the primary reading size. |
| --bp-typography-size-body-large | 16px | Body, label and supporting data scale; do not turn small metadata into the primary reading size. |
| --bp-typography-size-heading-small | 16px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-size-heading-medium | 20px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-size-heading-large | 24px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-size-heading-x-large | 28px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-size-heading-display | 46px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-size-code-small | 12px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-size-code-medium | 13px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-size-code-large | 14px | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-weight-default | 400 | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-weight-bold | 600 | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-line-height-default | 1.28581 | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |
| --bp-typography-line-height-large | 1.5 | Apply the role at its named hierarchy; table figures can additionally use tabular numerals. |

### Surfaces, borders and semantic text

[Official reference](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bp-surface-border-color-default | #5f6b7c1f | Use the named semantic role; keep state and foreground pairings together. |
| --bp-surface-border-color-strong | #5f6b7c40 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-surface-border-width | 1px | Use the named semantic role; keep state and foreground pairings together. |
| --bp-surface-border-radius | 4px | Use the named semantic role; keep state and foreground pairings together. |
| --bp-surface-spacing | 4px | Use the named semantic role; keep state and foreground pairings together. |
| --bp-surface-background-color-default-rest | #ffffff | Use the named semantic role; keep state and foreground pairings together. |
| --bp-surface-background-color-default-hover | #f6f7f9 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-typography-color-default-rest | #1c2127 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-typography-color-muted | #5f6b7c | Use the named semantic role; keep state and foreground pairings together. |

### Focus and motion

[Official reference](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bp-emphasis-transition-duration | 100ms | Use the named semantic role; keep state and foreground pairings together. |
| --bp-emphasis-ease-default | cubic-bezier(0.4, 1, 0.75, 0.9) | Use the named semantic role; keep state and foreground pairings together. |
| --bp-emphasis-ease-bounce | cubic-bezier(0.54, 1.12, 0.38, 1.11) | Use the named semantic role; keep state and foreground pairings together. |
| --bp-emphasis-focus-color | #2d72d2 | Use the named semantic role; keep state and foreground pairings together. |
| --bp-emphasis-focus-width | 2px | Use the named semantic role; keep state and foreground pairings together. |
| --bp-emphasis-focus-offset | 2px | Use the named semantic role; keep state and foreground pairings together. |
| --bp-emphasis-motion-reduced | 0 | Use the named semantic role; keep state and foreground pairings together. |

### Native components used in the dataset workbench

[Official reference](https://blueprintjs.com/docs/#core/components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| HTMLTable | striped · interactive · condensed | Native semantic table; the condensed prop changes density without changing data. |
| InputGroup | value · onChange · intent | Controlled search and review note; application validation sets danger intent. |
| FormGroup | labelFor · helperText · intent | Connect a visible field label and explain the invalid note. |
| HTMLSelect | options · value · onChange | A native select for the small, fixed set of dataset types. |
| Tag | minimal · intent | Pair the status text with success or warning treatment. |
| Button | intent="primary" · type="submit" | Commit the local review through a real form; selection buttons remain secondary. |
| Switch | checked · onChange | Independent appearance and density controls. |
| Callout | intent · title | Explain no results or the outcome; avoid communicating status by color alone. |

## Palantir Blueprint Design System Workspace Built Around Data

### Dense controls with an explicit reading order

Blueprint is useful when a screen combines a collection, filters, status and contextual actions. The example keeps the dataset table on the left and the selected record on the right. A reader can compare records without opening a new page for each one. The inspector carries the writable review note; the table remains a scanning surface.

### Use the v6 package contract

The example is compiled with @blueprintjs/core 6.21.0. Its CSS namespace is bp6 and its published semantic tokens begin --bp-. An older bp5 stylesheet is not a substitute for v6 component CSS. Import the package stylesheet once at the application entry, then scope application layout rules to a separate class.

## Palantir Blueprint Design System Intent and Color Roles

### Separate record status from selection

A warning Tag means the dataset needs review; the primary-tinted row means it is selected. Those meanings are independent. Marking a row reviewed changes its label and intent to success, while selection remains on the same dataset. The table retains words for each status so the color does not carry the entire meaning.

### Keep dark mode at the component boundary

The specimen adds bp6-dark to its wrapper, allowing native components to resolve their dark styling. The light-theme values above are a reference snapshot, not an instruction to override every component. When introducing a portal such as Dialog, ensure its rendered content receives the same theme context; a wrapper that does not contain the portal is insufficient.

## Palantir Blueprint Design System Typography for Records and Metadata

### Read the body scale before choosing headings

The published body sizes include 10, 12, 14 and 16px; the medium body is 14px. Dataset names stay at the main reading level. IDs and record types use supporting text, while numeric record counts use tabular numerals so changing values remain easy to compare. The guide does not recommend 10px for primary content.

### Give the inspector a compact hierarchy

The inspector uses a 20px heading and a definition list for ID, owner, type and count. Labels and values share a stable two-column alignment. The review note follows those facts, separated by a rule, so the action cannot be mistaken for a table filter.

## Palantir Blueprint Design System Table, Filters and Inspector

### Keep table semantics intact

HTMLTable supplies a native table with Blueprint styling. Buttons inside the first cell select records and remain keyboard reachable; the example does not make a pointer-only row handler the sole route to selection. The interactive prop provides row hover styling, and condensed toggles density independently of filtering.

### Make the controlled data flow visible

Search and the type selector derive a visible collection from the same local rows. The selected record can remain in the inspector when a filter hides its row; this prevents a typed review note from vanishing merely because a collection filter changed. Production software should decide and document this relationship rather than silently discarding edits.

1. Find a dataset by its displayed name.
2. Narrow the same collection with the type selector.
3. Select the name button to load the inspector.
4. Enter a review note and submit the local review.

## Palantir Blueprint Design System Spacing, Surfaces and Density

### Use a smaller unit without making every gap tiny

The published surface-spacing token is 4px. The workbench uses application multiples: 12px between filter controls, 20px between collection and inspector, and 24px around the desktop specimen. These are composition decisions shown in CSS. The 4px border-radius token keeps control and surface geometry restrained.

### Change the layout before sacrificing labels

At the example's application breakpoint of 800px, the inspector moves below the collection. Filters wrap, the main padding becomes 16px, and the table receives its own horizontal scrolling container when necessary. This breakpoint belongs to this workbench; it is not presented as an official universal Blueprint breakpoint.

## Palantir Blueprint Design System Review and Empty States

### Validation belongs to the review operation

Submitting an empty note sets danger intent on the InputGroup and FormGroup, supplies explanatory helper text, and moves focus to the field. Entering text clears the error. A valid submission changes only the selected local record, clears the note, and displays a success Callout that explicitly states no data was sent.

### Keep recovery next to the empty collection

The no-results Callout offers Clear filters. It resets both the search query and type selector so the complete collection returns. It does not delete rows or alter the inspector. The following state boundaries are intentional:

- Selection changes the inspected record, not its review status.
- Compact mode changes density, not record ordering.
- Theme changes visual appearance, not the current filters.
- A successful local review changes one record and announces the result.

## Palantir Blueprint Design System Focus and Accessible Component Use

### Label each native control

InputGroup receives an accessible name for search and an id for the labeled review field. HTMLSelect has its own name, Switch renders visible labels, and each record is opened by a real button. Use these library APIs rather than replacing controls with styled divs.

### Preserve a visible focus treatment

The package reference includes a 2px focus width and 2px offset. Keep focus indication visible against Cards and selected rows. Keyboard users should be able to reach filters, row buttons and the review form in document order. The example's status paragraph and success Callout communicate results without moving the reader to another screen.

## Palantir Blueprint Design System Installation and Application Boundaries

### Run the same source as the specimen

The complete App source and application CSS are provided below. App mounts into the root element generated by the Vite React template. Installing the pinned core package supplies the native components and package CSS; no hidden design asset is required for the text-based specimen.

### Extend the review with a real persistence contract

A production review needs record identifiers, permissions, pending state and an error response. Keep those concerns in the application while preserving Blueprint's FormGroup and intent APIs. Do not announce a successful save before the service accepts it; the local example deliberately makes no such claim.

## Component Examples

### main.jsx — complete dataset-review application

A full native composition with filtering, selection, density, theme, field validation and a local review result.

```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Card,
  Callout,
  FormGroup,
  HTMLSelect,
  HTMLTable,
  InputGroup,
  Switch,
  Tag,
} from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./blueprint.css";
const initial = [
  {
    id: "D-1042",
    name: "Harbor sensors",
    type: "Telemetry",
    rows: "18,420",
    owner: "Maya",
    status: "Reviewed",
  },
  {
    id: "D-1043",
    name: "Transit stops",
    type: "Reference",
    rows: "842",
    owner: "Alex",
    status: "Needs review",
  },
  {
    id: "D-1044",
    name: "Water samples",
    type: "Field survey",
    rows: "2,608",
    owner: "Sam",
    status: "Reviewed",
  },
  {
    id: "D-1045",
    name: "Street survey",
    type: "Field survey",
    rows: "4,120",
    owner: "Lee",
    status: "Needs review",
  },
];
function App() {
  const [dark, setDark] = useState(false),
    [compact, setCompact] = useState(false),
    [query, setQuery] = useState(""),
    [rows, setRows] = useState(initial),
    [selected, setSelected] = useState(initial[1]),
    [note, setNote] = useState(""),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(false),
    [type, setType] = useState("All");
  const visible = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) &&
      (type === "All" || r.type === type),
  );
  function review(e) {
    e.preventDefault();
    if (!note.trim()) {
      setError(true);
      document.getElementById("review-note").focus();
      return;
    }
    const updated = { ...selected, status: "Reviewed" };
    setRows(rows.map((r) => (r.id === selected.id ? updated : r)));
    setSelected(updated);
    setNotice(
      `${selected.name} marked reviewed in this local example. No data was sent.`,
    );
    setNote("");
    setError(false);
  }
  return (
    <main className={"specimen " + (dark ? "bp6-dark" : "")}>
      <header>
        <div>
          <span className="eyebrow">BLUEPRINT · DATA WORKSPACE</span>
          <h1 className="bp6-heading">Dataset review</h1>
          <p className="bp6-text-muted">
            Inspect a record and attach a review note.
          </p>
        </div>
        <Switch
          label="Dark theme"
          checked={dark}
          onChange={(e) => setDark(e.target.checked)}
        />
      </header>
      <div className="workbench">
        <Card className="collection">
          <div className="toolbar">
            <InputGroup
              aria-label="Find a dataset"
              placeholder="Find a dataset…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <HTMLSelect
              aria-label="Dataset type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={["All", "Telemetry", "Reference", "Field survey"]}
            />
            <Switch
              label="Compact rows"
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
            />
          </div>
          <p className="bp6-text-small bp6-text-muted" role="status">
            {visible.length} matching datasets
          </p>
          <div className="table-scroll">
            <HTMLTable
              striped
              interactive
              condensed={compact}
              style={{ width: "100%" }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Records</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr
                    key={r.id}
                    className={selected.id === r.id ? "selected" : ""}
                  >
                    <td>
                      <Button
                        variant="minimal"
                        onClick={() => {
                          setSelected(r);
                          setError(false);
                          setNote("");
                        }}
                        text={r.name}
                      />
                      <div className="bp6-text-small bp6-text-muted">
                        {r.id} · {r.type}
                      </div>
                    </td>
                    <td className="numeric">{r.rows}</td>
                    <td>
                      <Tag
                        minimal
                        intent={r.status === "Reviewed" ? "success" : "warning"}
                      >
                        {r.status}
                      </Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </HTMLTable>
          </div>
          {!visible.length && (
            <Callout title="No matching datasets">
              Clear the search or choose a different dataset type.
              <Button
                variant="minimal"
                onClick={() => {
                  setQuery("");
                  setType("All");
                }}
              >
                Clear filters
              </Button>
            </Callout>
          )}
        </Card>
        <Card className="inspector">
          <span className="eyebrow">SELECTED DATASET</span>
          <h2 className="bp6-heading">{selected.name}</h2>
          <dl>
            <dt>Dataset ID</dt>
            <dd>
              <code>{selected.id}</code>
            </dd>
            <dt>Owner</dt>
            <dd>{selected.owner}</dd>
            <dt>Type</dt>
            <dd>{selected.type}</dd>
            <dt>Records</dt>
            <dd>{selected.rows}</dd>
          </dl>
          <form onSubmit={review}>
            <FormGroup
              label="Review note"
              labelFor="review-note"
              intent={error ? "danger" : "none"}
              helperText={
                error
                  ? "Add a note describing what you checked."
                  : "A short note keeps the decision understandable."
              }
            >
              <InputGroup
                id="review-note"
                value={note}
                intent={error ? "danger" : "none"}
                aria-invalid={error}
                onChange={(e) => {
                  setNote(e.target.value);
                  setError(false);
                }}
              />
            </FormGroup>
            <Button intent="primary" type="submit" fill>
              Mark reviewed locally
            </Button>
          </form>
          <p className="bp6-text-small bp6-text-muted">
            Selection, filters and review notes exist only in this preview.
          </p>
        </Card>
      </div>
      {notice && (
        <Callout intent="success" role="status">
          {notice}
        </Callout>
      )}
      <footer>
        Native Blueprint 6.21.0 · HTMLTable, Card, FormGroup, InputGroup,
        Switch, Tag and Callout.
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://blueprintjs.com/docs/#core/components)

- Save this as src/main.jsx and the next example as src/blueprint.css.
- The createRoot call uses the root element in the Vite React index.html.

### blueprint.css — responsive workbench layout

Application layout rules complement the imported native CSS. The 800px breakpoint and 260px inspector are explicit example choices.

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
.specimen {
  padding: 24px;
  background: #f6f7f9;
  color: #1c2127;
  font-size: 14px;
}
.specimen.bp6-dark {
  background: #252a31;
  color: #f6f7f9;
}
.specimen header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}
.eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--bp-typography-color-muted);
}
h1.bp6-heading {
  margin: 8px 0;
  font-size: 28px;
}
.workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 20px;
}
.collection,
.inspector {
  min-width: 0;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.toolbar > .bp6-input-group {
  flex: 1;
  min-width: 150px;
}
.toolbar .bp6-control {
  margin: 0;
}
.table-scroll {
  overflow: auto;
}
table td {
  vertical-align: middle !important;
}
.numeric {
  font-variant-numeric: tabular-nums;
}
tr.selected td {
  background: #2d72d20d !important;
}
.inspector h2 {
  font-size: 20px;
  margin-top: 12px;
}
.inspector dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 24px 0;
}
.inspector dt {
  color: var(--bp-typography-color-muted);
}
.inspector dd {
  margin: 0;
}
.inspector form {
  border-top: 1px solid var(--bp-surface-border-color-default);
  padding-top: 20px;
}
.inspector p {
  margin: 16px 0 0;
}
.specimen > .bp6-callout {
  margin-top: 20px;
}
.specimen footer {
  font-size: 11px;
  margin-top: 24px;
  color: var(--bp-typography-color-muted);
}
@media (max-width: 800px) {
  .workbench {
    grid-template-columns: 1fr;
  }
  .specimen {
    padding: 16px;
  }
  .specimen header {
    align-items: start;
  }
  .toolbar {
    gap: 16px;
  }
  h1.bp6-heading {
    font-size: 24px;
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}

.bp6-dark .eyebrow,
.bp6-dark .inspector dt,
.bp6-dark footer {
  color: #abb3bf;
}

```

[Code reference](https://blueprintjs.com/docs/#core/typography)

- The bp6-dark class activates the library theme; the specimen canvas background is application CSS.

## Implementation Starting Point

The native preview was bundled and run with React 18.3.1 and Blueprint 6.21.0. Use a Node.js version supported by your selected Vite release. Both application files are supplied above.

```sh
npm create vite@latest blueprint-review -- --template react
cd blueprint-review
npm install
npm install react@18.3.1 react-dom@18.3.1 @blueprintjs/core@6.21.0
# Replace src/main.jsx and add src/blueprint.css using the complete examples.
npm run dev
```

## Agent Prompt

Use Blueprint 6.21.0 to build a dataset review workspace. Read the supplied tokens and complete React/CSS example. Preserve native HTMLTable, labeled InputGroup/FormGroup, status Tags, and keyboard-reachable row selection. Keep filter, selection, density, appearance and review state independent. Add the real save service only when its API is provided; show pending and failed responses without losing the note. Retain the responsive inspector and visible focus states.

## Sources

- [Blueprint Component Documentation](https://blueprintjs.com/docs/#core/components) — Native component contracts and examples.
- [Published 6.21.0 Design Tokens](https://cdn.jsdelivr.net/npm/@blueprintjs/core@6.21.0/lib/css/blueprint-design-tokens.css) — Exact versioned values used by the reference tables.
- [Blueprint Source Repository](https://github.com/palantir/blueprint) — Implementation, package release history and Apache licensing.
