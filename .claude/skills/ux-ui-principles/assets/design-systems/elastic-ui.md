# Elastic UI Design System — OpenDesign Application Guide

Build an Elastic UI log explorer with verified Borealis scales, native table and search controls, severity filtering, local saved events, and complete React source.

OpenDesign-authored guide and fictional local log explorer running native Elastic UI 123.0.0 with Borealis 8.1.0. Sample events are not live telemetry and the save action is in-memory only. EUI carries its own Elastic/SSPL licensing choices; consult the official package license for your distribution.

## Source Reference

- **Native package:** @elastic/eui 123.0.0 ([source](https://eui.elastic.co/docs/getting-started/setup/))
- **Theme package:** Borealis 8.1.0 ([source](https://cdn.jsdelivr.net/npm/@elastic/eui-theme-borealis@8.1.0/lib/eui_theme_borealis_light.json))
- **React runtime:** 18.3.1 ([source](https://eui.elastic.co/docs/getting-started/setup/))


## Design Reference

Elastic UI 123.0.0 with Borealis theme 8.1.0 and React 18.3.1. Tables use names from the published theme JSON; these are export keys, not literal useEuiTheme object paths. The actual preview uses the native React theme API.

### Borealis semantic colors

[Official reference](https://cdn.jsdelivr.net/npm/@elastic/eui-theme-borealis@8.1.0/lib/eui_theme_borealis_light.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| euiColorPrimary | light: #0B64DD; dark: #61A2FF | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiColorSuccess | light: #008A5E; dark: #24C292 | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiColorWarning | light: #FACB3D; dark: #FACB3D | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiColorDanger | light: #C61E25; dark: #F6726A | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiColorEmptyShade | light: #FFFFFF; dark: #111C2C | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiColorFullShade | light: #07101F; dark: #FFFFFF | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiPageBackgroundColor | light: #ECF1F9; dark: #07101F | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiTextColor | light: #384861; dark: #B4C1D5 | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |
| euiTextSubduedColor | light: #516381; dark: #98A8C3 | Published theme-export names. In React, consume the corresponding semantic role through useEuiTheme rather than hardcoding these values. |

### Spacing scale

[Official reference](https://cdn.jsdelivr.net/npm/@elastic/eui-theme-borealis@8.1.0/lib/eui_theme_borealis_light.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| euiSizeXS | 4px | Use matching EuiSpacer/FlexGroup sizes for layout rhythm; base is 16px in this theme export. |
| euiSizeS | 8px | Use matching EuiSpacer/FlexGroup sizes for layout rhythm; base is 16px in this theme export. |
| euiSizeM | 12px | Use matching EuiSpacer/FlexGroup sizes for layout rhythm; base is 16px in this theme export. |
| euiSize | 16px | Use matching EuiSpacer/FlexGroup sizes for layout rhythm; base is 16px in this theme export. |
| euiSizeL | 24px | Use matching EuiSpacer/FlexGroup sizes for layout rhythm; base is 16px in this theme export. |
| euiSizeXL | 32px | Use matching EuiSpacer/FlexGroup sizes for layout rhythm; base is 16px in this theme export. |
| euiSizeXXL | 40px | Use matching EuiSpacer/FlexGroup sizes for layout rhythm; base is 16px in this theme export. |

### Typography

[Official reference](https://cdn.jsdelivr.net/npm/@elastic/eui-theme-borealis@8.1.0/lib/eui_theme_borealis_light.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| euiFontSizeXS | 12px | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |
| euiFontSizeS | 14px | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |
| euiFontSize | 14px | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |
| euiFontSizeM | 16px | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |
| euiFontSizeL | 20px | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |
| euiFontSizeXL | 24px | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |
| euiFontSizeXXL | 30px | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |
| euiLineHeight | 1.5 | Published type reference. Use EuiText/EuiTitle variants for the component hierarchy. |

### Borders and shape

[Official reference](https://cdn.jsdelivr.net/npm/@elastic/eui-theme-borealis@8.1.0/lib/eui_theme_borealis_light.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| euiBorderWidthThin | 1px | Distinguish inline, control, panel and frame shape; a single universal corner radius would erase the hierarchy. |
| euiBorderWidthThick | 2px | Distinguish inline, control, panel and frame shape; a single universal corner radius would erase the hierarchy. |
| euiBorderColor | #E3E8F2 | Distinguish inline, control, panel and frame shape; a single universal corner radius would erase the hierarchy. |
| euiBorderRadiusInline | 4px | Distinguish inline, control, panel and frame shape; a single universal corner radius would erase the hierarchy. |
| euiBorderRadiusControl | 8px | Distinguish inline, control, panel and frame shape; a single universal corner radius would erase the hierarchy. |
| euiBorderRadiusPanel | 12px | Distinguish inline, control, panel and frame shape; a single universal corner radius would erase the hierarchy. |
| euiBorderRadiusFrame | 16px | Distinguish inline, control, panel and frame shape; a single universal corner radius would erase the hierarchy. |

### Focus and motion

[Official reference](https://cdn.jsdelivr.net/npm/@elastic/eui-theme-borealis@8.1.0/lib/eui_theme_borealis_light.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| euiFocusRingSize | 2px | Keep native focus and motion behavior instead of overriding internal .eui selectors. |
| euiFocusBackgroundColor | #ECF1F9 | Keep native focus and motion behavior instead of overriding internal .eui selectors. |
| euiAnimSpeedExtraFast | 90ms | Keep native focus and motion behavior instead of overriding internal .eui selectors. |
| euiAnimSpeedFast | 150ms | Keep native focus and motion behavior instead of overriding internal .eui selectors. |
| euiAnimSpeedNormal | 250ms | Keep native focus and motion behavior instead of overriding internal .eui selectors. |
| euiAnimSpeedSlow | 350ms | Keep native focus and motion behavior instead of overriding internal .eui selectors. |

### Native API contract in this explorer

[Official reference](https://eui.elastic.co/docs/components/tables/basic/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| EuiProvider | colorMode="light" \| "dark" | Supplies theme context and Emotion styles. |
| useEuiTheme | { euiTheme } | Resolve semantic colors for custom elements and EuiHealth. |
| EuiBasicTable | items · itemId · columns | Render the controlled visible collection using stable IDs. |
| EuiFieldSearch | value · onChange · incremental | Application filters a six-event local collection. |
| EuiButtonGroup | options · idSelected · onChange | Controlled severity filter with a visible legend. |
| EuiHealth | color + readable child label | A status dot supplements, rather than replaces, the severity word. |

## Elastic UI Design System Explorer Structure

### An investigation workspace rather than a generic dashboard

The specimen has three compact summary statistics and a single event stream. A search field and severity group narrow that stream; each row exposes an independent save action. Keeping the action next to its event lets a reader collect evidence without leaving the filtered context. The summary explicitly counts sample events rather than claiming live traffic.

### Use the current theme boundary

This example pairs EUI 123.0.0 with Borealis 8.1.0. The reference values come from that published theme, not an older Amsterdam screenshot. EuiProvider owns the visual mode and style context. Application state remains outside any theme calculation, so changing appearance does not reset saved events or the current query.

## Elastic UI Design System Semantic Color Roles

### Apply severity as a meaningful relationship

Info uses the primary role, Warning the warning role, and Error the danger role in this application. EuiHealth displays the severity word alongside the dot. The mapping is application policy; it does not imply that every primary-colored element represents informational severity. Error counts and event labels still need readable text.

### Resolve colors from the active theme

Screen calls useEuiTheme and uses the resolved colors for its canvas, body text and health indicators. The export tables include paired light/dark values so the difference is visible. Do not copy one hex value into both modes or target generated Emotion class names to force a match.

## Elastic UI Design System Type and Numerical Hierarchy

### Give statistics context before emphasizing the number

EuiStat pairs the 6 sample events, 1 error event and saved count with descriptions. The number alone would be ambiguous. EuiTitle introduces the investigation, while EuiText supplies the time window and sample-data qualification. The stream header is a smaller heading rather than a second page title.

### Keep log text readable at compact density

Borealis uses a 14px base export with a 1.5 line-height reference, plus 12/16/20/24/30px type steps. Timestamps and service names have predictable columns, while the event message receives flexible width. The example uses available system fonts through the native stack and does not claim a remotely loaded Inter asset.

## Elastic UI Design System Basic Table and Controlled Filters

### Separate presentation from filtering

EuiBasicTable receives the already-filtered items. Columns define a field or custom renderer, and itemId uses the stable event ID. EuiFieldSearch updates query state; EuiButtonGroup updates the selected severity ID. The application combines both predicates before handing the visible collection to the table.

1. Type a service name or message fragment.
2. Choose Error or Warning to combine a severity predicate.
3. Save a matching event using its row action.
4. Clear the filters and verify the saved event remains marked.

### Save by event identity, not row position

The Save event action toggles an ID in a local set. Sorting or filtering should never make a bookmark point at another event because its array position changed. The specimen shows Saved locally in the message and changes the action to Unsave, giving the operation an explicit reversible outcome.

## Elastic UI Design System Spacing and Responsive Data

### Use the native spacing scale across groups

The published sizes are 4, 8, 12, 16, 24, 32 and 40px. EuiSpacer and EuiFlexGroup provide the space between summary statistics, filters and the event table. EuiPanel supplies the container shape; the theme distinguishes its 12px panel radius from the 8px control and 16px frame radii.

### Keep the page inside the mobile viewport

The summary and filter groups reflow through native FlexGroup behavior. The table sits in a bounded horizontal scrolling region with a 640px application minimum, preserving the timestamp, message and action relationships instead of letting the entire page overflow. A production table can choose the documented responsive-table options for its actual column set.

## Elastic UI Design System Search, Empty and Saved States

### A zero-result search has a direct recovery action

An impossible query displays No events match the current filters and a Clear filters action. Resetting query and severity restores all six sample events without altering saved IDs. The count above the table announces the matching-event total through a polite live region.

### A local save is not an incident workflow

Saving an event changes the visible row label and the saved statistic. It does not contact Elasticsearch, create an incident or persist across refresh. A real investigation product should add a documented persistence endpoint and report pending or failed responses before claiming that the saved collection is durable.

## Elastic UI Design System Accessible Table Actions

### Name filters independently of placeholders

The search has an accessible name, and the button group supplies a severity legend. Table columns have descriptive headers; each row action is a native EuiButtonEmpty. EuiHealth includes text, so the status color is never the only information. Preserve these contracts when replacing sample data.

- Use visible words for severity.
- Retain the table caption and column names.
- Keep saved state associated with the stable event ID.

### Keep keyboard and visual state together

Users can focus search, select a severity filter, reach row actions and toggle the appearance setting. The 2px focus ring is part of the theme reference. Test a filtered set after saving a row and after clearing the filter; the action label and saved statistic should continue to agree.

## Elastic UI Design System Setup and Theme Integration

### Install the documented peer dependencies

The official setup guide uses Yarn and lists Borealis, Emotion, datemath and moment alongside EUI. This specimen runs React 18 and does not wrap the tree in StrictMode. The setup below keeps those constraints explicit rather than silently inheriting React 19 from a newly generated application.

### Treat the full entry file as the implementation

The example below contains the provider, dataset, controlled state, column renderers, filter controls and createRoot entry. The Vite scaffold supplies index.html. This native specimen was bundled with esbuild and checked in the browser; the official setup guide documents caveats for Vite and other non-Webpack bundlers. Test your production bundler independently.

## Component Examples

### main.jsx — complete native log explorer

EuiProvider and Borealis support a controlled event table with severity/search filtering and local saved-event state.

```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  EuiProvider,
  EuiPanel,
  EuiTitle,
  EuiText,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiButtonGroup,
  EuiButtonEmpty,
  EuiBasicTable,
  EuiHealth,
  EuiStat,
  EuiSwitch,
  EuiCallOut,
  useEuiTheme,
} from "@elastic/eui";
const logs = [
  {
    id: 1,
    time: "09:42:18",
    service: "gateway",
    message: "Request completed",
    level: "Info",
    duration: 42,
  },
  {
    id: 2,
    time: "09:42:21",
    service: "worker",
    message: "Retry queued after timeout",
    level: "Warning",
    duration: 1200,
  },
  {
    id: 3,
    time: "09:42:24",
    service: "gateway",
    message: "Upstream connection refused",
    level: "Error",
    duration: 800,
  },
  {
    id: 4,
    time: "09:42:29",
    service: "indexer",
    message: "Batch indexed",
    level: "Info",
    duration: 180,
  },
  {
    id: 5,
    time: "09:42:32",
    service: "worker",
    message: "Job completed",
    level: "Info",
    duration: 94,
  },
  {
    id: 6,
    time: "09:42:36",
    service: "gateway",
    message: "Upstream connection restored",
    level: "Info",
    duration: 51,
  },
];
function Screen({ dark, setDark }) {
  const { euiTheme } = useEuiTheme();
  const [query, setQuery] = useState(""),
    [level, setLevel] = useState("all"),
    [saved, setSaved] = useState([]);
  const visible = logs.filter(
    (x) =>
      (level === "all" || x.level === level) &&
      (x.service + " " + x.message).toLowerCase().includes(query.toLowerCase()),
  );
  const colors = {
    Info: euiTheme.colors.primary,
    Warning: euiTheme.colors.warning,
    Error: euiTheme.colors.danger,
  };
  const columns = [
    { field: "time", name: "Time", width: "105px" },
    { field: "service", name: "Service", width: "105px" },
    {
      field: "message",
      name: "Event",
      render: (value, item) => (
        <span>
          {value}
          {saved.includes(item.id) ? " · Saved locally" : ""}
        </span>
      ),
    },
    {
      field: "level",
      name: "Level",
      width: "110px",
      render: (value) => <EuiHealth color={colors[value]}>{value}</EuiHealth>,
    },
    {
      name: "Action",
      width: "110px",
      render: (item) => (
        <EuiButtonEmpty
          size="xs"
          onClick={() =>
            setSaved((v) =>
              v.includes(item.id)
                ? v.filter((id) => id !== item.id)
                : [...v, item.id],
            )
          }
        >
          {saved.includes(item.id) ? "Unsave" : "Save event"}
        </EuiButtonEmpty>
      ),
    },
  ];
  return (
    <main
      style={{
        padding: 24,
        background: euiTheme.colors.backgroundBasePlain,
        color: euiTheme.colors.textParagraph,
      }}
    >
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem>
          <EuiText size="xs">
            <p>ELASTIC UI · LOG EXPLORER</p>
          </EuiText>
          <EuiTitle size="m">
            <h1>Investigate gateway events</h1>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch
            label="Dark mode"
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat title="6" description="Sample events" titleSize="m" />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              title="1"
              description="Error event"
              titleSize="m"
              titleColor="danger"
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              title={String(saved.length)}
              description="Saved in this preview"
              titleSize="m"
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      <EuiPanel>
        <EuiTitle size="xs">
          <h2>Event stream</h2>
        </EuiTitle>
        <EuiText size="s">
          <p>09:42:18–09:42:36 · fictional data · no live telemetry</p>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiFieldSearch
              fullWidth
              aria-label="Search log events"
              placeholder="Search service or message"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              incremental
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonGroup
              legend="Filter severity"
              options={[
                { id: "all", label: "All" },
                { id: "Warning", label: "Warning" },
                { id: "Error", label: "Error" },
              ]}
              idSelected={level}
              onChange={(id) => setLevel(id)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiText size="xs">
          <p aria-live="polite">{visible.length} matching events</p>
        </EuiText>
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
          <div style={{ minWidth: 640 }}>
            <EuiBasicTable
                  responsiveBreakpoint={false}
              items={visible}
              itemId="id"
              columns={columns}
              tableCaption="Fictional application events"
              noItemsMessage="No events match the current filters."
            />
          </div>
        </div>
        {!visible.length && (
          <EuiButtonEmpty
            onClick={() => {
              setLevel("all");
              setQuery("");
            }}
          >
            Clear filters
          </EuiButtonEmpty>
        )}
      </EuiPanel>
      <EuiSpacer size="l" />
      <EuiCallOut size="s" title="Local investigation workspace">
        Saving an event only changes this preview. No query is sent to
        Elasticsearch and no incident is created.
      </EuiCallOut>
      <EuiSpacer size="m" />
      <EuiText size="xs">
        <p>
          Native Elastic UI 123.0.0 · Borealis 8.1.0 theme · controlled filters
          and table actions.
        </p>
      </EuiText>
    </main>
  );
}
function App() {
  const [dark, setDark] = useState(false);
  return (
    <EuiProvider colorMode={dark ? "dark" : "light"}>
      <Screen dark={dark} setDark={setDark} />
    </EuiProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);

```

[Code reference](https://eui.elastic.co/docs/components/tables/basic/)

- Save as src/main.jsx in the React scaffold. This entry deliberately does not enable StrictMode.
- The 640px bounded table width is application CSS; all component visuals come from EUI.

### Custom theme-aware note

Use the active theme inside a provider instead of coupling custom markup to generated component classes.

```jsx
import React from 'react';
import { useEuiTheme } from '@elastic/eui';
export function InvestigationNote({ children }) {
  const { euiTheme } = useEuiTheme();
  return <aside style={{ padding: euiTheme.size.m, color: euiTheme.colors.textParagraph, borderLeft: `2px solid ${euiTheme.colors.primary}` }}>{children}</aside>;
}
```

[Code reference](https://eui.elastic.co/docs/getting-started/setup/)

- Render InvestigationNote under EuiProvider. The note inherits the selected visual mode.

## Implementation Starting Point

The official EUI guide documents Yarn installation and React 18 support. Non-Webpack bundlers have documented caveats; this specific native example was bundled with esbuild and browser-tested. Use a Node.js version supported by your scaffold.

```sh
yarn create vite elastic-investigation --template react
cd elastic-investigation
yarn add react@18.3.1 react-dom@18.3.1 @elastic/eui@123.0.0 @elastic/eui-theme-borealis@8.1.0 @elastic/datemath @emotion/react @emotion/css moment
# Replace src/main.jsx with the complete example above.
yarn dev
```

## Agent Prompt

Build a log investigation screen with Elastic UI 123.0.0, Borealis 8.1.0 and React 18. Read the supplied theme export and native source. Use EuiProvider, a controlled EuiBasicTable, accessible search and severity filters. Save by stable event ID, preserve bookmarks across filtering, and distinguish local UI state from a real Elasticsearch query or persistence response. Keep the table contained on mobile.

## Sources

- [Official Setup](https://eui.elastic.co/docs/getting-started/setup/) — Provider, installation, peers and environment support.
- [Basic Table API](https://eui.elastic.co/docs/components/tables/basic/) — Column definitions, renderers and native table behavior.
- [Borealis Light Theme Export](https://cdn.jsdelivr.net/npm/@elastic/eui-theme-borealis@8.1.0/lib/eui_theme_borealis_light.json) — Versioned values used by this reference.
- [EUI Source and License](https://github.com/elastic/eui) — Native implementation and licensing information.
