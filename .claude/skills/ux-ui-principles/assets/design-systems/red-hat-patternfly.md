# Red Hat PatternFly Design System — OpenDesign Application Guide

Use PatternFly for an operations workspace: semantic token references, selectable service cards, tri-state bulk selection, scope review, and complete native React code.

An OpenDesign-authored application guide and fictional maintenance-planning example, running native PatternFly React 6.6.1. Utilization, region and replica counts are sample data. Confirmation only updates local state; no service is restarted or scheduled.

## Source Reference

- **React package:** @patternfly/react-core 6.6.1 ([source](https://www.patternfly.org/get-started/develop/))
- **Token package:** 6.6.1 ([source](https://cdn.jsdelivr.net/npm/@patternfly/react-tokens@6.6.1/dist/esm/))
- **Theme class:** pf-v6-theme-dark ([source](https://www.patternfly.org/foundations-and-styles/theming/))


## Design Reference

PatternFly React 6.6.1 and @patternfly/react-tokens 6.6.1. Selected published light-theme token resolutions are shown below. Native components and pf-v6-theme-dark resolve dark styling; example service data and layout are application choices.

### Semantic surface and text roles

[Official reference](https://cdn.jsdelivr.net/npm/@patternfly/react-tokens@6.6.1/dist/esm/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pf-t--global--background--color--primary--default | rgb(255, 255, 255, 0.6000) | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--background--color--secondary--default | rgb(199, 199, 199, 0.3000) | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--text--color--regular | #151515 | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--text--color--subtle | #383838 | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--text--color--disabled | #a3a3a3 | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--color--brand--default | #004d99 | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--color--brand--hover | #003366 | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--color--brand--accent--default | #ee0000 | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |
| --pf-t--global--color--brand--subtle--default | #e0f0ff | Use the semantic role in the active theme; brand accent red is not the universal primary action color. |

### Status roles

[Official reference](https://cdn.jsdelivr.net/npm/@patternfly/react-tokens@6.6.1/dist/esm/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pf-t--global--color--status--success--default | #204d00 | Pair status intent with a written label. These light-theme values are not a replacement for native Label or Alert variants. |
| --pf-t--global--color--status--warning--default | #73480b | Pair status intent with a written label. These light-theme values are not a replacement for native Label or Alert variants. |
| --pf-t--global--color--status--danger--default | #731f00 | Pair status intent with a written label. These light-theme values are not a replacement for native Label or Alert variants. |
| --pf-t--global--color--status--info--default | #3d2785 | Pair status intent with a written label. These light-theme values are not a replacement for native Label or Alert variants. |
| --pf-t--global--color--status--custom--default | #004d4d | Pair status intent with a written label. These light-theme values are not a replacement for native Label or Alert variants. |
| --pf-t--global--color--status--unread--default | #0066cc | Pair status intent with a written label. These light-theme values are not a replacement for native Label or Alert variants. |

### Body and heading type

[Official reference](https://cdn.jsdelivr.net/npm/@patternfly/react-tokens@6.6.1/dist/esm/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pf-t--global--font--size--body--default | 0.875rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |
| --pf-t--global--font--size--body--lg | 1rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |
| --pf-t--global--font--size--heading--h1 | 1.5rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |
| --pf-t--global--font--size--heading--h2 | 1.25rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |
| --pf-t--global--font--size--heading--h3 | 1.125rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |
| --pf-t--global--font--size--heading--h4 | 1rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |
| --pf-t--global--font--size--heading--h5 | 1rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |
| --pf-t--global--font--size--heading--h6 | 1rem | Use type role and semantic heading level deliberately. A visual size does not determine document outline. |

### Spacing scale

[Official reference](https://cdn.jsdelivr.net/npm/@patternfly/react-tokens@6.6.1/dist/esm/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pf-t--global--spacer--xs | 0.25rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |
| --pf-t--global--spacer--sm | 0.5rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |
| --pf-t--global--spacer--md | 1rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |
| --pf-t--global--spacer--lg | 1.5rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |
| --pf-t--global--spacer--xl | 2rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |
| --pf-t--global--spacer--2xl | 3rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |
| --pf-t--global--spacer--3xl | 4rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |
| --pf-t--global--spacer--4xl | 5rem | Use the named spacing scale for groups and controls; rem values follow the user root font size. |

### Shape and focus

[Official reference](https://cdn.jsdelivr.net/npm/@patternfly/react-tokens@6.6.1/dist/esm/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pf-t--global--border--radius--tiny | 4px | Use the relevant component shape instead of applying the pill radius to every surface. |
| --pf-t--global--border--radius--small | 6px | Use the relevant component shape instead of applying the pill radius to every surface. |
| --pf-t--global--border--radius--medium | 16px | Use the relevant component shape instead of applying the pill radius to every surface. |
| --pf-t--global--border--radius--large | 24px | Use the relevant component shape instead of applying the pill radius to every surface. |
| --pf-t--global--border--radius--pill | 999px | Use the relevant component shape instead of applying the pill radius to every surface. |
| --pf-t--global--border--radius--control--form-element | 6px | Use the relevant component shape instead of applying the pill radius to every surface. |
| --pf-t--global--border--radius--action--default | 999px | Use the relevant component shape instead of applying the pill radius to every surface. |

## Red Hat PatternFly Design System Operations Layout

### A collection with persistent operational context

The service gallery lets an operator compare health, location and utilization while a separate scope panel records the chosen set. Selection is not the same as the current search results. A service that is filtered out remains selected until deliberately removed. This distinction is essential for a bulk operation with consequences beyond the visible screen.

### Use the native component hierarchy

Gallery handles responsive card columns, Card separates each service, Label identifies status, and Progress shows a sample percentage with its title. The page does not imitate an infrastructure console using arbitrary colored rectangles. Its data model, controls and review state are implemented in the full React example.

## Red Hat PatternFly Design System Semantic Color and Theme Roles

### Primary brand and red accent are distinct

PatternFly v6 exports separate brand, accent, text, background and status roles. The selected light snapshot includes blue brand-default and red brand-accent-default. Treating every prominent action as Red Hat red would collapse these roles. Native Button and Label components use the system roles appropriate to their variant.

### Resolve the dark theme at the document

The example toggles pf-v6-theme-dark on the document element. Application surfaces and text use --pf-t--global semantic variables, allowing the theme to resolve their colors as well. Do not freeze light values into custom cards and then expect a document theme class to repair them.

## Red Hat PatternFly Design System Type and Service Metadata

### Separate visual size from heading semantics

Title headingLevel h1 establishes the page heading, while its size controls visual emphasis. Body-default is 0.875rem in this package snapshot. Card labels, status and numerical utilization remain readable without turning every value into a heading. The metadata definition list keeps replica counts and service IDs explicit.

### Avoid ambiguous operational labels

Sample utilization is labeled as sample data in both the component and footer. A bare progress bar can be mistaken for a deployment task or loading operation. Its caption explains what the percentage represents, while the status Label separately communicates Healthy or Review capacity.

## Red Hat PatternFly Design System Gallery and Bulk Selection

### Use the three checkbox states

The Select visible control is true when every visible service is selected, false when none is selected, and null when only some are selected. PatternFly Checkbox supports the indeterminate null value. The application computes this state from the filtered collection; it does not use a separate boolean that can drift from the row selections.

1. Select one service and inspect the partial-selection state.
2. Select all currently visible services.
3. Search for one name; confirm the hidden selections remain in the scope.
4. Review the exact set and replica total.
5. Confirm the local plan and read the outcome.

### Make the selection set the source of truth

Each service has a stable ID. Individual checkboxes and Select visible update the same set of IDs; the scope panel derives service names and the total replica count from that set. Search changes visibility only. This makes the review summary consistent even when the operator narrows the gallery after selecting several services.

## Red Hat PatternFly Design System Spacing and Responsive Cards

### Use semantic tokens for the page shell

The example background, regular text and subtle metadata use semantic CSS properties from the published token package. The native spacing scale ranges from xs through 4xl, while the application uses 24px between the collection and scope panel. That explicit composition value is separate from the token reference.

### Let the gallery reflow before shrinking its content

Gallery receives a 230px minimum item width and a gutter. At the application breakpoint of 850px, the scope panel moves below the collection. At 500px, page padding becomes 16px and search takes the full toolbar width. These are example layout decisions, not a claim that all PatternFly products use those breakpoints.

## Red Hat PatternFly Design System Review and Selection States

### Do not make selection perform the operation

Checking a service only adds it to the scope. Review selection reveals an informational Alert and a confirmation action. Confirm local plan reports the selected service and replica totals without starting a maintenance job. Changing selection closes the review state so it cannot silently confirm an obsolete set.

### Keep search recovery separate from selection

An unmatched query shows an inline informational Alert with Clear search. This clears only the query; it retains selected services. The toolbar selection count and scope panel therefore continue to tell the same story. Resetting the selection as a side effect of an empty search would be a hidden destructive behavior.

## Red Hat PatternFly Design System Accessible Controls and Status

### Label selection and use native controls

Each Checkbox has a stable id and visible service label. SearchInput has an accessible name, Switch names the appearance setting, and Review selection is disabled while the set is empty. Native Progress communicates its value and title. The page does not depend on a hover-only action hidden inside a card.

### Keep state visible in words

The selection count uses a polite live region, service status is written inside a Label, and the final Alert describes what occurred. Do not make color the sole indicator of selected scope or health. Keyboard testing should cover partial selection, filtering away a selected service, and returning to the full collection.

- A selected checkbox is an inclusion decision, not a success status.
- A status Label describes the service, not whether it is selected.
- Progress describes sample utilization, not operation completion.

## Red Hat PatternFly Design System React Integration

### Import the reset and component styles once

The example imports @patternfly/react-core/dist/styles/base.css at its entry point. Native React components supply their component styling through the package. The application CSS is scoped to pf-example and references the current --pf-t--global namespace; it does not overwrite component internals.

### Add real scheduling only behind a service contract

The local plan is intentionally a preview. A production implementation needs authorization, maintenance windows, affected dependencies, pending feedback and server validation. Keep the selected IDs stable throughout that request and reconcile the confirmed result with the actual service response. Native presentation components do not supply the operational backend.

## Component Examples

### main.jsx — service gallery and bulk review

Complete native Gallery/Card/Checkbox/Progress composition with a derived selection scope and local confirmation.

```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  Gallery,
  GalleryItem,
  Label,
  Progress,
  SearchInput,
  Switch,
  Title,
} from "@patternfly/react-core";
import "@patternfly/react-core/dist/styles/base.css";
import "./patternfly.css";
const services = [
  {
    id: "api",
    name: "Public API",
    region: "eu-west",
    replicas: 6,
    load: 62,
    status: "Healthy",
  },
  {
    id: "jobs",
    name: "Background jobs",
    region: "eu-west",
    replicas: 3,
    load: 81,
    status: "Review capacity",
  },
  {
    id: "search",
    name: "Search index",
    region: "us-east",
    replicas: 4,
    load: 44,
    status: "Healthy",
  },
  {
    id: "events",
    name: "Event stream",
    region: "us-east",
    replicas: 8,
    load: 72,
    status: "Healthy",
  },
];
function App() {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState([]),
    [review, setReview] = useState(false),
    [notice, setNotice] = useState(""),
    [dark, setDark] = useState(false);
  const visible = services.filter((x) =>
    x.name.toLowerCase().includes(query.toLowerCase()),
  );
  const picked = services.filter((x) => selected.includes(x.id));
  const allVisible =
    visible.length > 0 && visible.every((x) => selected.includes(x.id));
  const someVisible = visible.some((x) => selected.includes(x.id));
  function choose(id, checked) {
    setSelected((v) =>
      checked ? [...new Set([...v, id])] : v.filter((x) => x !== id),
    );
    setReview(false);
  }
  function selectVisible(checked) {
    setSelected((v) =>
      checked
        ? [...new Set([...v, ...visible.map((x) => x.id)])]
        : v.filter((id) => !visible.some((x) => x.id === id)),
    );
    setReview(false);
  }
  return (
    <main className="pf-example">
      <header>
        <div>
          <span className="overline">PATTERNFLY · SERVICE OPERATIONS</span>
          <Title headingLevel="h1" size="2xl">
            Plan a maintenance review
          </Title>
          <p>
            Select services and inspect the combined scope before creating a
            local plan.
          </p>
        </div>
        <Switch
          id="dark-theme"
          label="Dark theme"
          isChecked={dark}
          onChange={(_, checked) => {
            setDark(checked);
            document.documentElement.classList.toggle(
              "pf-v6-theme-dark",
              checked,
            );
          }}
        />
      </header>
      <div className="service-toolbar">
        <SearchInput
          aria-label="Find a service"
          placeholder="Find a service"
          value={query}
          onChange={(_, value) => setQuery(value)}
          onClear={() => setQuery("")}
        />
        <Checkbox
          id="select-visible"
          label="Select visible"
          isChecked={allVisible ? true : someVisible ? null : false}
          isDisabled={!visible.length}
          onChange={(_, checked) => selectVisible(checked)}
        />
        <span aria-live="polite">{selected.length} selected</span>
        <Button isDisabled={!selected.length} onClick={() => setReview(true)}>
          Review selection
        </Button>
      </div>
      <div className="service-layout">
        <Gallery hasGutter minWidths={{ default: "230px" }}>
          {visible.map((s) => (
            <GalleryItem key={s.id}>
              <Card>
                <CardTitle>
                  <Checkbox
                    id={"select-" + s.id}
                    label={s.name}
                    isChecked={selected.includes(s.id)}
                    onChange={(_, checked) => choose(s.id, checked)}
                  />
                </CardTitle>
                <CardBody>
                  <div className="service-meta">
                    <Label color={s.status === "Healthy" ? "green" : "orange"}>
                      {s.status}
                    </Label>
                    <span>{s.region}</span>
                  </div>
                  <Progress
                    value={s.load}
                    title="Sample utilization"
                    measureLocation="outside"
                  />
                  <dl>
                    <dt>Replicas</dt>
                    <dd>{s.replicas}</dd>
                    <dt>Service ID</dt>
                    <dd>
                      <code>{s.id}</code>
                    </dd>
                  </dl>
                </CardBody>
              </Card>
            </GalleryItem>
          ))}
        </Gallery>
        <aside>
          <Card>
            <CardTitle>Maintenance scope</CardTitle>
            <CardBody>
              <p>
                {picked.length} services ·{" "}
                {picked.reduce((n, s) => n + s.replicas, 0)} replicas
              </p>
              {picked.length ? (
                <ul>
                  {picked.map((s) => (
                    <li key={s.id}>
                      {s.name}
                      <span>{s.region}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Select a service to inspect its scope.</p>
              )}
              {review && (
                <div className="review">
                  <Alert
                    isInline
                    variant="info"
                    title="Review the selected services"
                  >
                    This is a fictional plan. No workload will be restarted.
                  </Alert>
                  <Button
                    onClick={() => {
                      setNotice(
                        `Local plan includes ${picked.length} services and ${picked.reduce((n, s) => n + s.replicas, 0)} replicas. No operation was scheduled.`,
                      );
                      setReview(false);
                    }}
                  >
                    Confirm local plan
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
      {!visible.length && (
        <Alert isInline variant="info" title="No services match">
          <Button variant="link" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </Alert>
      )}
      {notice && (
        <Alert isInline variant="success" title="Local plan recorded">
          {notice}
        </Alert>
      )}
      <footer>
        Native PatternFly 6.6.1 · service data and capacity figures are
        fictional, memory-only examples.
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://www.patternfly.org/components/checkbox/)

- Save as src/main.jsx. Checkbox onChange receives the event and checked value; isChecked can be null for a mixed set.

### patternfly.css — responsive operations shell

Custom page layout consumes semantic v6 tokens and keeps the native component styling intact.

```css
body {
  margin: 0;
}
.pf-example {
  padding: 24px;
  background: var(--pf-t--global--background--color--secondary--default);
  color: var(--pf-t--global--text--color--regular);
  font-family: var(--pf-t--global--font--family--body);
}
.pf-example header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}
.overline {
  font-size: 11px;
  letter-spacing: 0.07em;
  color: var(--pf-t--global--text--color--subtle);
}
.pf-example header h1 {
  margin: 8px 0;
}
.service-toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.service-toolbar > .pf-v6-c-search-input {
  width: 280px;
}
.service-toolbar > span {
  margin-left: auto;
}
.service-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  align-items: start;
}
.service-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  margin-bottom: 24px;
}
.service-layout dl {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
  font-size: 12px;
}
.service-layout dd {
  margin: 0;
}
.service-layout ul {
  padding: 0;
  list-style: none;
  margin: 16px 0;
}
.service-layout li {
  padding: 12px 0;
  border-bottom: 1px solid var(--pf-t--global--border--color--default);
}
.service-layout li span {
  display: block;
  font-size: 12px;
  color: var(--pf-t--global--text--color--subtle);
}
.muted {
  color: var(--pf-t--global--text--color--subtle);
  margin-top: 16px;
}
.review > .pf-v6-c-button {
  margin-top: 16px;
}
.pf-example > .pf-v6-c-alert {
  margin-top: 24px;
}
.pf-example footer {
  font-size: 12px;
  color: var(--pf-t--global--text--color--subtle);
  margin-top: 24px;
}
@media (max-width: 850px) {
  .service-layout {
    grid-template-columns: 1fr;
  }
  .pf-example header {
    align-items: start;
  }
  .service-toolbar > span {
    margin-left: 0;
  }
}
@media (max-width: 500px) {
  .pf-example {
    padding: 16px;
  }
  .pf-example header {
    flex-direction: column;
  }
  .service-toolbar {
    gap: 16px;
  }
  .service-toolbar > .pf-v6-c-search-input {
    width: 100%;
  }
}

```

[Code reference](https://www.patternfly.org/foundations-and-styles/design-tokens/develop/)

- Save as src/patternfly.css. The application breakpoints are explicitly part of this example.

## Implementation Starting Point

Native React 18.3.1 / PatternFly 6.6.1 composition. Vite requires a supported Node.js version. The actual service data and operations API remain application responsibilities.

```sh
npm create vite@latest patternfly-services -- --template react
cd patternfly-services
npm install
npm install react@18.3.1 react-dom@18.3.1 @patternfly/react-core@6.6.1
# Replace src/main.jsx and add src/patternfly.css using the complete examples.
npm run dev
```

## Agent Prompt

Build an operations collection using PatternFly 6.6.1 native Gallery, Card, Checkbox, Progress, Label and Alert. Use the supplied semantic tokens and full example. Keep filtered visibility separate from selected IDs, compute partial bulk selection, and require a review of the exact affected set. Use honest pending/failure/success responses when a real API is added. Preserve mobile reflow and keyboard access.

## Sources

- [Develop with PatternFly](https://www.patternfly.org/get-started/develop/) — Native package and stylesheet integration.
- [Published Token Modules](https://cdn.jsdelivr.net/npm/@patternfly/react-tokens@6.6.1/dist/esm/) — Versioned token names and resolved light values.
- [Bulk Selection Pattern](https://www.patternfly.org/patterns/bulk-selection/) — Selection scope and collection behavior.
- [PatternFly React Repository](https://github.com/patternfly/patternfly-react) — Native component implementation and license.
