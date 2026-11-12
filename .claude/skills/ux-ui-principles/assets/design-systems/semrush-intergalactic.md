# Semrush Intergalactic Design System — OpenDesign Application Guide

An Intergalactic guide with current semantic and chart tokens, native filtering controls, fixed-scale comparison, selected detail and a complete reproducible fixture.

OpenDesign application guide. The six keyword records and all metrics are fictional. Native Intergalactic controls surround an original HTML chart; it is not a Semrush report or native D3 chart implementation.

## Source Reference

- **Runtime:** Native Intergalactic controls from @semcore/ui 17.6.0 with @semcore/theme 2.3.1; original HTML bar comparison. ([source](https://developer.semrush.com/intergalactic/components/input/input))
- **Reference:** 38 concrete token/API entries ([source](https://cdn.jsdelivr.net/npm/@semcore/theme@2.3.1/lib/light.css))
- **Source:** Complete JSX + CSS ([source](https://developer.semrush.com/intergalactic/components/input/input))


## Design Reference

Native Intergalactic controls from @semcore/ui 17.6.0 with @semcore/theme 2.3.1; original HTML bar comparison.

### Semantic light roles

[Official reference](https://cdn.jsdelivr.net/npm/@semcore/theme@2.3.1/lib/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --intergalactic-bg-primary-neutral | oklch(1 0 0) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-bg-secondary-neutral | oklch(0.98 0.001 180) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-text-primary | oklch(0.1 0.03 137 / 0.899) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-text-secondary | oklch(0.088 0.026 147.7 / 0.583) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-border-primary | oklch(0.137 0.026 175.7 / 0.161) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-control-primary-info | oklch(0.23 0.01 140) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-control-primary-info-hover | oklch(0.32 0.007 140) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-control-primary-info-active | oklch(0 0 140) | Current semantic value in the pinned theme, including OKLCH expressions. |
| --intergalactic-control-rounded | 6px | Current semantic value in the pinned theme, including OKLCH expressions. |

### Text sizes

[Official reference](https://cdn.jsdelivr.net/npm/@semcore/theme@2.3.1/lib/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --intergalactic-fs-50 | 10px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-100 | 12px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-200 | 14px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-300 | 16px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-400 | 20px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-500 | 24px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-600 | 32px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-700 | 36px | Published text-size step; choose the role for the information hierarchy. |
| --intergalactic-fs-800 | 48px | Published text-size step; choose the role for the information hierarchy. |

### Spacing

[Official reference](https://cdn.jsdelivr.net/npm/@semcore/theme@2.3.1/lib/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --intergalactic-spacing-1x | 4px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-2x | 8px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-3x | 12px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-4x | 16px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-5x | 20px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-6x | 24px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-8x | 32px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-10x | 40px | Named spacing step from the theme stylesheet. |
| --intergalactic-spacing-05x | 2px | Named spacing step from the theme stylesheet. |

### Corners

[Official reference](https://cdn.jsdelivr.net/npm/@semcore/theme@2.3.1/lib/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --intergalactic-rounded-extra-small | 2px | Use the component-appropriate corner rather than a universal large radius. |
| --intergalactic-rounded-small | 4px | Use the component-appropriate corner rather than a universal large radius. |
| --intergalactic-rounded-medium | 6px | Use the component-appropriate corner rather than a universal large radius. |
| --intergalactic-rounded-large | 12px | Use the component-appropriate corner rather than a universal large radius. |
| --intergalactic-rounded-extra-large | 24px | Use the component-appropriate corner rather than a universal large radius. |

### First six chart colors

[Official reference](https://cdn.jsdelivr.net/npm/@semcore/theme@2.3.1/lib/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --intergalactic-chart-palette-order-1 | oklch(0.58 0.168 278.2) | Ordered data-series color. The specimen uses the first role for a single series. |
| --intergalactic-chart-palette-order-2 | oklch(0.82 0.15 170) | Ordered data-series color. The specimen uses the first role for a single series. |
| --intergalactic-chart-palette-order-3 | oklch(0.74 0.17 303) | Ordered data-series color. The specimen uses the first role for a single series. |
| --intergalactic-chart-palette-order-4 | oklch(0.82 0.18 80) | Ordered data-series color. The specimen uses the first role for a single series. |
| --intergalactic-chart-palette-order-5 | oklch(0.74 0.19 22) | Ordered data-series color. The specimen uses the first role for a single series. |
| --intergalactic-chart-palette-order-6 | oklch(0.82 0.088 272.1) | Ordered data-series color. The specimen uses the first role for a single series. |

## Semrush Intergalactic Design System Analytical Workspace Layout

### Give the comparison a defined question

The specimen compares six fictional keywords by one selected metric. A filter, tracked-only option and metric buttons sit above the result. A separate inspector shows both metrics for the selected term, allowing the user to compare a ranking view with the underlying values.

### Distinguish authored data from measured data

Every number is part of a fixed fixture and is labeled illustrative. The page does not present search volume or difficulty as a current Semrush measurement. There is no network query, analytics account or downloaded customer dataset behind the bars.

## Semrush Intergalactic Design System Theme and Token Generation

### Use the current theme package deliberately

The runtime pins @semcore/ui 17.6.0 and @semcore/theme 2.3.1. The native components need the current theme package, and the entry imports its light.css. The table preserves OKLCH values from that stylesheet instead of replacing them with unrelated older hexadecimal defaults.

### Keep component and chart roles separate

The native controls obtain their appearance from Intergalactic styling, while the original bar comparison uses the chart palette’s first series role. Selection is conveyed by a quiet row background and pressed state. A series color should not be reused indiscriminately as every action or error color.

## Semrush Intergalactic Design System Typography for Dense Results

### Keep labels, units and values together

Each bar row contains the term and a written numeric value. The small axis note specifies whether the scale is sample searches or a score out of 100. The inspector repeats both units, preventing a visually similar bar length from implying that the metrics are interchangeable.

### Use compact text without hiding the context

The native input uses its large size for a comfortable filter target. Result labels stay compact, with a larger workspace title and section headings. On a narrow screen the keyword moves above the bar and value instead of being truncated to an unreadable fragment.

## Semrush Intergalactic Design System Chart Scale and Sorting

### Keep scale stable while filtering

The volume chart always uses a maximum of 8,100 and the difficulty chart a maximum of 100. Filtering does not stretch the remaining longest bar to the full width. This authored choice preserves comparison meaning when the user narrows the set.

### Sort using the active metric

The same selected metric drives descending order, bar width, numeric labels and the section title. Volume and difficulty are never added or averaged together. A real product should define metric provenance and time windows before replacing this transparent fixture with measured data.

## Semrush Intergalactic Design System Native Input and Checkbox

### Use the compound input anatomy

Input supplies the outer component and Input.Value supplies the actual editable control. Its onChange callback receives the string value first, which differs from treating it as a standard DOM change event. The visible label points to the Value id.

### Keep boolean and text filters independent

The native Checkbox onChange receives the checked boolean. Text filtering and tracked-only state are combined when deriving rows, so either can legitimately produce an empty result. Reset filters restores both controls while preserving the selected inspector context.

## Semrush Intergalactic Design System Selected Detail and Empty State

### Keep selection attached to identity

The selected term is stored independently of array order. Clicking a bar updates that term and its pressed state, while the inspector looks up the full fixture record. Sorting by another metric cannot make the inspector silently point at a different row index.

### Explain a retained selection outside the filter

If the selected term is no longer visible, the inspector stays available with a written explanation. This is useful when comparing an item before and after filtering. The empty result region supplies an explicit reset action rather than rendering a blank chart panel.

## Semrush Intergalactic Design System Accessible Data Comparison

### Make the chart understandable without color

Bars are decorative spans inside real buttons. The term and value form the accessible text, and aria-pressed identifies selection. The data remains understandable without seeing the bar length or series hue. Keyboard focus is visibly separate from the selected row treatment.

1. Choose Difficulty and inspect the reordered bars and score unit.
2. Filter to an unmatched term and use Reset filters.
3. Select a term, filter it out, and read the retained-selection explanation.

### Test the filter recovery path

The native input and checkbox expose their real controls. Metric switches use buttons with pressed state, and the original reset action clears both filters. The layout keeps the result title and unit note visible so empty and non-empty states have the same context.

## Semrush Intergalactic Design System Component Imports and Theme Setup

### Import component entry points

The @semcore/ui root intentionally throws rather than exporting all components. This source imports button, input and checkbox from their dedicated entry points and imports @semcore/theme/light.css. The complete entry includes the fixture and all derivation logic.

- Dedicated @semcore/ui/button, input and checkbox imports.
- Pinned @semcore/theme/light.css.
- Original fixed-scale bar and fixture logic in the complete JSX.

### Do not label the custom bars as a native D3 chart

The controls are native Intergalactic components; the bar comparison is original accessible HTML and CSS. If a production task requires tooltips, axes, brush interaction or large datasets, choose and integrate the appropriate chart component explicitly rather than claiming those capabilities from this small specimen.

## Component Examples

### main.jsx — complete working specimen

Compare a fictional keyword set. The source below is the full React entry, including all state and validation.

```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Button from "@semcore/ui/button";
import Input from "@semcore/ui/input";
import Checkbox from "@semcore/ui/checkbox";
import "@semcore/theme/light.css";
import "./intergalactic.css";
const data = [
  { term: "design tokens", volume: 8100, difficulty: 42, tracked: true },
  { term: "component library", volume: 6600, difficulty: 58, tracked: false },
  { term: "accessible forms", volume: 2900, difficulty: 31, tracked: true },
  {
    term: "responsive typography",
    volume: 1900,
    difficulty: 24,
    tracked: false,
  },
  { term: "semantic colors", volume: 1300, difficulty: 18, tracked: false },
  { term: "design system audit", volume: 720, difficulty: 36, tracked: true },
];
function App() {
  const [q, setQ] = useState(""),
    [tracked, setTracked] = useState(false),
    [metric, setMetric] = useState("volume"),
    [selected, setSelected] = useState("design tokens");
  const rows = data
    .filter((d) => d.term.includes(q.toLowerCase()) && (!tracked || d.tracked))
    .sort((a, b) => b[metric] - a[metric]);
  const max = metric === "volume" ? 8100 : 100;
  const item = data.find((d) => d.term === selected);
  return (
    <main className="research">
      <header>
        <p>RESEARCH WORKSPACE / FICTIONAL DATA</p>
        <h1>Compare a keyword set</h1>
        <span>
          Six authored sample records · figures are illustrative, not Semrush
          measurements
        </span>
      </header>
      <div className="research-toolbar">
        <div className="research-search">
          <label htmlFor="term-search">Filter keywords</label>
          <Input size="l">
            <Input.Value
              id="term-search"
              placeholder="Find a sample term"
              value={q}
              onChange={setQ}
            />
          </Input>
        </div>
        <Checkbox
          label="Tracked only"
          checked={tracked}
          onChange={setTracked}
        />
        <div
          className="metric-options"
          role="group"
          aria-label="Comparison metric"
        >
          <Button
            use={metric === "volume" ? "primary" : "secondary"}
            aria-pressed={metric === "volume"}
            onClick={() => setMetric("volume")}
          >
            Volume
          </Button>
          <Button
            use={metric === "difficulty" ? "primary" : "secondary"}
            aria-pressed={metric === "difficulty"}
            onClick={() => setMetric("difficulty")}
          >
            Difficulty
          </Button>
        </div>
      </div>
      <div className="research-grid">
        <section className="chart-panel">
          <div className="chart-heading">
            <h2>
              {metric === "volume"
                ? "Illustrative monthly volume"
                : "Illustrative difficulty score"}
            </h2>
            <span>{rows.length} terms</span>
          </div>
          <p className="axis-note">
            {metric === "volume"
              ? "Fixed scale: 0–8,100 sample searches"
              : "Fixed scale: 0–100 sample score"}
          </p>
          {rows.length ? (
            <div className="bars">
              {rows.map((r) => (
                <button
                  className={
                    "bar-row " + (r.term === selected ? "selected" : "")
                  }
                  key={r.term}
                  onClick={() => setSelected(r.term)}
                  aria-pressed={r.term === selected}
                >
                  <span className="bar-name">{r.term}</span>
                  <span className="bar-track" aria-hidden="true">
                    <i style={{ width: (r[metric] / max) * 100 + "%" }} />
                  </span>
                  <strong>{r[metric].toLocaleString("en-US")}</strong>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>No matching terms</h3>
              <p>
                Clear the text and tracked filter to restore the full
                comparison.
              </p>
              <Button
                onClick={() => {
                  setQ("");
                  setTracked(false);
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
          <p className="chart-note">
            Values are written beside every bar. Click a term to inspect both
            metrics.
          </p>
        </section>
        <aside>
          <h2>{item.term}</h2>
          <dl>
            <dt>Sample volume</dt>
            <dd>{item.volume.toLocaleString("en-US")}</dd>
            <dt>Sample difficulty</dt>
            <dd>{item.difficulty} / 100</dd>
            <dt>Tracking</dt>
            <dd>{item.tracked ? "Tracked" : "Not tracked"}</dd>
          </dl>
          <div className="inspector-note">
            <h3>Comparison context</h3>
            <p>
              The bar scale stays fixed when filters change. Difficulty and
              volume have separate units and are not added together.
            </p>
          </div>
          {!rows.some((r) => r.term === selected) && (
            <p className="retained">
              Selected term is outside the current filter; details are retained.
            </p>
          )}
        </aside>
      </div>
      <footer>
        Native Intergalactic Input, Checkbox and Button from @semcore/ui 17.6.0.
        Original accessible HTML bar comparison; no analytics service request.
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://developer.semrush.com/intergalactic/components/input/input)

- Create a Vite React project, keep <div id="root"></div>, and load this as src/main.jsx.

### intergalactic.css — original responsive composition

Application layout layered around the native components.

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font:
    14px/1.5 Arial,
    sans-serif;
  color: var(--intergalactic-text-primary);
  background: #fff;
}
.research {
  padding: 28px;
}
.research header {
  border-bottom: 1px solid #e0e1e9;
  padding-bottom: 24px;
}
.research header p {
  font-size: 12px;
  color: #6c6e79;
  margin: 0 0 10px;
  letter-spacing: 0.07em;
}
.research h1 {
  font-size: 28px;
  margin: 0 0 8px;
}
.research header span {
  color: #6c6e79;
}
.research-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
  padding: 24px 0;
}
.research-search {
  min-width: 220px;
  flex: 1;
}
.research-search label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}
.metric-options {
  display: flex;
  gap: 8px;
}
.research-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(250px, 0.8fr);
  gap: 24px;
}
.chart-panel,
.research aside {
  border: 1px solid #c4c7cf;
  border-radius: 8px;
  padding: 24px;
  min-width: 0;
}
.chart-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.research h2 {
  font-size: 18px;
  margin: 0;
}
.chart-heading > span,
.axis-note,
.chart-note {
  font-size: 12px;
  color: #6c6e79;
}
.axis-note {
  margin: 8px 0 24px;
}
.bar-row {
  display: grid;
  grid-template-columns: 165px minmax(0, 1fr) 58px;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: 0;
  background: white;
  text-align: left;
  padding: 12px 8px;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
.bar-row.selected {
  background: #f0e8ff;
}
.bar-name {
  font-size: 13px;
}
.bar-track {
  height: 18px;
  background: #f4f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.bar-track i {
  display: block;
  height: 100%;
  background: var(--intergalactic-chart-palette-order-1);
  border-radius: 3px;
}
.bar-row strong {
  text-align: right;
  font-size: 12px;
}
.bar-row:focus-visible {
  outline: 2px solid #008ff8;
  outline-offset: 2px;
}
.chart-note {
  margin-top: 24px;
}
.research dl {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  margin: 24px 0;
}
.research dt {
  color: #6c6e79;
}
.research dd {
  margin: 0;
  font-weight: 600;
}
.inspector-note {
  padding: 16px;
  background: #f4f5f9;
  border-radius: 6px;
}
.inspector-note h3 {
  font-size: 14px;
  margin: 0 0 8px;
}
.inspector-note p {
  font-size: 12px;
  margin: 0;
}
.retained {
  font-size: 12px;
  margin: 16px 0 0;
}
.no-results {
  text-align: center;
  padding: 32px 16px;
}
.no-results h3 {
  font-size: 18px;
}
.research footer {
  font-size: 12px;
  color: #6c6e79;
  margin-top: 24px;
}
@media (max-width: 950px) {
  .research-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 550px) {
  .research {
    padding: 16px;
  }
  .chart-panel,
  .research aside {
    padding: 16px;
  }
  .research-toolbar {
    gap: 16px;
  }
  .research-search {
    flex-basis: 100%;
  }
  .bar-row {
    grid-template-columns: minmax(0, 1fr) 50px;
    gap: 8px;
  }
  .bar-name {
    grid-column: 1/-1;
  }
  .bar-track {
    grid-column: 1;
  }
  .metric-options {
    flex-wrap: wrap;
  }
}

```

[Code reference](https://developer.semrush.com/intergalactic/components/input/input)

- Save beside main.jsx. These custom composition rules are distinguished from the library token reference.

## Implementation Starting Point

The pinned native example was bundled and browser-checked locally. The specimen uses only local application state.

```sh
npm create vite@latest intergalactic-compare -- --template react
cd intergalactic-compare
npm install
npm install react@18.3.1 react-dom@18.3.1 @semcore/ui@17.6.0 @semcore/theme@2.3.1 @semcore/icon@17.3.0 @semcore/illustration
# Replace src/main.jsx and add src/intergalactic.css.
npm run dev
```

## Agent Prompt

Build a compact analytical comparison with native Intergalactic controls, dedicated imports and current theme tokens. Keep units, fixed scales, sorting and selected identity consistent. Provide textual values and empty-state recovery. Label fixture metrics and original chart code honestly rather than claiming measured Semrush data.

## Sources

- [Intergalactic Input](https://developer.semrush.com/intergalactic/components/input/input) — Native input composition and size guidance.
- [Intergalactic Tokens](https://developer.semrush.com/intergalactic/style/design-tokens/design-tokens) — Semantic design token roles.
- [Pinned Theme Export](https://cdn.jsdelivr.net/npm/@semcore/theme@2.3.1/lib/light.css) — Actual values used by the local specimen.
- [Official Source](https://github.com/semrush/intergalactic) — Component entries, public APIs and chart libraries.
