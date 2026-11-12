# GitLab Pajamas Design System — OpenDesign Application Guide

A Pajamas guide for technical workflows: actual semantic tokens, fluid type and spacing, a staged pipeline inspector, readable failure output and an explicitly local retry simulation.

OpenDesign application guide to GitLab Pajamas and @gitlab/ui 138.0.0. Native package CSS styles this original HTML/JavaScript specimen. The pipeline is fictional and no GitLab API, Vue runtime, CI runner or repository action is invoked.

## Source Reference

- **Package:** @gitlab/ui 138.0.0 ([source](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js))
- **Preview:** Native CSS + original DOM behavior ([source](https://design.gitlab.com/))
- **Type scale:** Fixed small roles; fluid larger roles ([source](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js))


## Design Reference

@gitlab/ui 138.0.0 published light token export and native CSS. GL_* names are JavaScript exports; their lower-case --gl-* equivalents appear in the compiled CSS. The example uses the native stylesheet with original HTML/state logic, not mounted Vue components.

### Semantic surfaces, text and borders

[Official reference](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| GL_BACKGROUND_COLOR_DEFAULT | #fff | Use the role named by the token; this is the light reference export. |
| GL_BACKGROUND_COLOR_SUBTLE | #f7f7f5 | Use the role named by the token; this is the light reference export. |
| GL_BACKGROUND_COLOR_STRONG | #ecebea | Use the role named by the token; this is the light reference export. |
| GL_TEXT_COLOR_DEFAULT | #3a383d | Use the role named by the token; this is the light reference export. |
| GL_TEXT_COLOR_SUBTLE | #646163 | Use the role named by the token; this is the light reference export. |
| GL_TEXT_COLOR_STRONG | #18171d | Use the role named by the token; this is the light reference export. |
| GL_TEXT_COLOR_HEADING | #18171d | Use the role named by the token; this is the light reference export. |
| GL_TEXT_COLOR_LINK | #27599f | Use the role named by the token; this is the light reference export. |
| GL_BORDER_COLOR_DEFAULT | #dcdbd9 | Use the role named by the token; this is the light reference export. |
| GL_BORDER_COLOR_SUBTLE | #ecebea | Use the role named by the token; this is the light reference export. |
| GL_BORDER_COLOR_STRONG | #c1bfbe | Use the role named by the token; this is the light reference export. |

### Interface spacing

[Official reference](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| GL_SPACING_SCALE_0 | 0px | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_1 | 0.125rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_2 | 0.25rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_3 | 0.5rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_4 | 0.75rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_5 | 1rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_6 | 1.5rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_7 | 2rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_8 | 2.5rem | Spacing scale values are not their index multiplied by a single constant. |
| GL_SPACING_SCALE_9 | 3rem | Spacing scale values are not their index multiplied by a single constant. |

### Responsive type scale

[Official reference](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| GL_FONT_SIZE_100 | 0.75rem | Larger roles use clamp; preserve the expression when fluid typography is intended. |
| GL_FONT_SIZE_200 | 0.8125rem | Larger roles use clamp; preserve the expression when fluid typography is intended. |
| GL_FONT_SIZE_300 | 0.875rem | Larger roles use clamp; preserve the expression when fluid typography is intended. |
| GL_FONT_SIZE_400 | 1rem | Larger roles use clamp; preserve the expression when fluid typography is intended. |
| GL_FONT_SIZE_500 | clamp(1.125rem, 0.9027777778rem + 0.462962963vw, 1.25rem) | Larger roles use clamp; preserve the expression when fluid typography is intended. |
| GL_FONT_SIZE_600 | clamp(1.3125rem, 0.8680555556rem + 0.9259259259vw, 1.5625rem) | Larger roles use clamp; preserve the expression when fluid typography is intended. |
| GL_FONT_SIZE_700 | clamp(1.5rem, 0.8333333333rem + 1.3888888889vw, 1.875rem) | Larger roles use clamp; preserve the expression when fluid typography is intended. |
| GL_FONT_SIZE_800 | clamp(1.75rem, 0.8611111111rem + 1.8518518519vw, 2.25rem) | Larger roles use clamp; preserve the expression when fluid typography is intended. |

### Control and surface radius

[Official reference](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| GL_BORDER_RADIUS_NONE | 0px | Radius represents component shape, not action importance. |
| GL_BORDER_RADIUS_XS | 1px | Radius represents component shape, not action importance. |
| GL_BORDER_RADIUS_SM | 0.125rem | Radius represents component shape, not action importance. |
| GL_BORDER_RADIUS_MD | 0.25rem | Radius represents component shape, not action importance. |
| GL_BORDER_RADIUS_LG | 0.5rem | Radius represents component shape, not action importance. |
| GL_BORDER_RADIUS_XL | 0.75rem | Radius represents component shape, not action importance. |
| GL_BORDER_RADIUS_FULL | 9999px | Radius represents component shape, not action importance. |
| GL_BORDER_RADIUS_DEFAULT | 0.25rem | Radius represents component shape, not action importance. |

### Status color references

[Official reference](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| GL_COLOR_GREEN_50 | #e6f5ea | Quiet successful-state surface. |
| GL_COLOR_GREEN_800 | #075048 | Successful-state foreground on its light surface. |
| GL_COLOR_RED_50 | #feeef0 | Quiet failed-state surface. |
| GL_COLOR_RED_800 | #891c2f | Failed-state foreground on its light surface. |
| GL_COLOR_BLUE_50 | #e8f2fd | Selected job surface. |
| GL_COLOR_BLUE_700 | #27599f | Selection border and visible focus reference. |

## GitLab Pajamas Design System Pipeline Information Architecture

### Put failure context before recovery

The header names a fictional pipeline, branch and commit so the job inspector has context. Build, Test and Publish are visible groupings, and a selected job opens its own output. The failed link check includes the route and exit condition that explain the failure before the user sees the retry action.

### Keep a compact graph readable

This specimen uses stage columns and buttons rather than pretending to implement a full dependency graph. On a narrow screen, stages stack in document order. A production pipeline may need parallel jobs, dependencies, waiting, manual and canceled states; those should be modeled explicitly rather than inferred from the three sample headings.

## GitLab Pajamas Design System Semantic Colors and Status

### Use semantic UI roles for the work surface

The light export provides warm neutral surfaces, distinct text strengths and subtle borders. The sample uses the default surface for job cards, a blue selected surface and a dark log region. The guide lists exact package values so a user can reproduce the relationship without sampling pixels from a screenshot.

### Make state labels carry the meaning

Passed and Failed are written in each job row and badge. A check or cross supplements that text; colored badges alone would be ambiguous. Brand purple is not used as a generic success indicator. The status references in the table are intentionally separate from the selection blue.

## GitLab Pajamas Design System Type Scale and Technical Text

### Preserve fluid expressions where they apply

The package exposes fixed small roles and clamp-based larger roles. Replacing a clamp with its largest endpoint changes the responsive behavior. The original specimen uses an application-sized 24px title and compact 12–14px supporting roles; those choices are identified as layout decisions rather than additional package tokens.

### Use monospace for identifiers and output

The branch and commit use code styling, while job names remain readable interface text. Output uses a wrapped monospace block with a keyboard focus target. Long paths can wrap instead of forcing the entire page wider than a phone, and selection changes replace the text rather than injecting raw HTML.

## GitLab Pajamas Design System Spacing and Border Rhythm

### Do not calculate token values from their number

GL_SPACING_SCALE_3 is 0.5rem and scale_5 is 1rem; the index is a key, not a direct multiplier. Use the exported value when implementing the scale. The reference table preserves the exact unit, including the zero-pixel step.

### Use boundaries to clarify regions

A light border divides the workspace header and toolbar, while a stronger card boundary contains the output inspector. Job buttons have their own selected border. Keeping these boundaries distinct makes it clear which object is selected without wrapping every line of metadata in another box.

## GitLab Pajamas Design System Job Selection and Filtering

### Keep selected identity independent of filter position

The script uses stable string IDs such as links and accessibility. The filter changes which jobs are listed, and chooses a matching job when one exists. Clicking a job updates its pressed state, stage, state badge and log together. This avoids showing one job title with another job’s output.

### Retain recovery context when the result disappears

After the failed job is simulated as passed, a Failed jobs filter has no results. The empty message explains how to restore the list, while the inspector retains the just-completed result. This deliberate choice lets the user understand why the row disappeared instead of losing the confirmation.

## GitLab Pajamas Design System Retry and Reset Behavior

### Label the simulation honestly

The action says Simulate successful retry, changes only the local fixture and replaces the log with a written simulation result. It does not enqueue a runner, create a job or inspect a repository. The overall pipeline badge is recalculated from all job states rather than blindly setting success after any click.

### Restore the entire initial fixture

Reset creates a fresh copy of the initial job data, selects the failed link job, restores All jobs and re-renders both panels. It clears the simulated result without a reload. This makes the specimen repeatable and prevents a second viewer from mistaking a previously simulated success for the starting condition.

1. Select Failed jobs and inspect the failed route.
2. Simulate success and read the retained inspector plus empty filtered list.
3. Reset the specimen and verify that the failure and original output return.

## GitLab Pajamas Design System Accessible Job Controls

### Use buttons for local selection

Each job is a real button with aria-pressed. The state is written beside the duration, and visible keyboard focus remains separate from the selected appearance. The filter has a visible label. No custom keyboard-only graph navigation is claimed for these simple controls.

### Announce the outcome without moving the reader

The result is written to a status region after retry or reset. The log is selectable text and can receive keyboard focus for reading, but the application does not automatically pull focus into it after every selection. This keeps repeated comparisons between jobs predictable.

## GitLab Pajamas Design System CSS and Vue Integration Boundaries

### Choose one integration level explicitly

This source imports the published CSS distribution and supplies original HTML/JavaScript behavior. It does not instantiate GlButton, GlFormSelect or other Vue exports. A Vue application should use the corresponding native components and their current props/events rather than treating this DOM implementation as a Vue example.

- CSS distribution: native appearance and semantic variables.
- Original HTML: accessible controls and region structure.
- Original JavaScript: fixture data, selection, filters and simulation.

### Keep tokens tied to the imported release

The reference values come from the same 138.0.0 package used by the preview. Future token and component changes should be reviewed together. The complete source below includes the original CSS composition and fixture logic, so the downloaded guide contains enough material to recreate the demonstrated behavior.

## Component Examples

### index.html — pipeline workspace

Complete semantic layout and controls.

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pipeline specimen</title>
<body>
<main class="pipeline-example">
  <header>
    <p class="eyebrow">sample-team / documentation</p>
    <div class="title-row">
      <div>
        <h1>Pipeline #1842</h1>
        <p>
          Preview build for <code>docs/update-navigation</code> ·
          <code>7c31a82</code>
        </p>
      </div>
      <span id="pipeline-state" class="state failed">Failed</span>
    </div>
  </header>
  <div class="toolbar">
    <label for="job-filter">Show jobs</label
    ><select id="job-filter" class="gl-form-select">
      <option value="all">All jobs</option>
      <option value="failed">Failed jobs</option>
      <option value="passed">Passed jobs</option></select
    ><button id="reset" class="btn btn-default gl-button">
      Reset specimen
    </button>
  </div>
  <div class="pipeline-layout">
    <section aria-label="Pipeline stages">
      <div id="stages" class="stages"></div>
      <p id="empty" hidden>
        No jobs match this filter. Choose All jobs to restore the pipeline.
      </p>
    </section>
    <section class="job-detail" aria-labelledby="job-title">
      <div class="detail-heading">
        <h2 id="job-title"></h2>
        <span id="job-state" class="state"></span>
      </div>
      <dl>
        <dt>Stage</dt>
        <dd id="job-stage"></dd>
        <dt>Runner</dt>
        <dd>local-example-runner</dd>
        <dt>Execution</dt>
        <dd>Simulated in this page</dd>
      </dl>
      <h3>Job output</h3>
      <pre id="job-log" tabindex="0" aria-label="Selected job output"></pre>
      <button id="retry" class="btn btn-confirm gl-button">
        Simulate successful retry
      </button>
      <p id="feedback" role="status"></p>
    </section>
  </div>
  <footer>
    Native @gitlab/ui 138.0.0 CSS with original HTML and state logic. Fictional
    pipeline; no runner, repository or CI job is started.
  </footer>
</main>

<script type="module" src="/src/main.js"></script>
</body></html>
```

[Code reference](https://design.gitlab.com/)

- Save at the Vite project root.

### main.js — fixture and recovery logic

Native CSS import plus the full staged-job behavior.

```js
import "@gitlab/ui/dist/index.css";
import "./pajamas.css";
const initial = [
  {
    id: "lint",
    stage: "Build",
    state: "passed",
    time: "12s",
    log: "$ npm run lint\nNo lint errors.\nJob succeeded.",
  },
  {
    id: "bundle",
    stage: "Build",
    state: "passed",
    time: "31s",
    log: "$ npm run build\nStatic assets generated.\nJob succeeded.",
  },
  {
    id: "links",
    stage: "Test",
    state: "failed",
    time: "18s",
    log: "$ npm run check:links\n/docs/old-navigation returned 404\n1 broken internal link.\nJob failed: exit code 1.",
  },
  {
    id: "accessibility",
    stage: "Test",
    state: "passed",
    time: "24s",
    log: "$ npm run check:a11y\nExample fixture checks passed.\nJob succeeded.",
  },
  {
    id: "preview",
    stage: "Publish",
    state: "passed",
    time: "9s",
    log: "$ npm run package:preview\nLocal preview archive generated.\nJob succeeded.",
  },
];
let jobs = structuredClone(initial),
  selected = "links";
const filter = document.querySelector("#job-filter"),
  stages = document.querySelector("#stages"),
  retry = document.querySelector("#retry"),
  feedback = document.querySelector("#feedback");
function render() {
  stages.replaceChildren();
  let count = 0;
  for (const name of ["Build", "Test", "Publish"]) {
    const matches = jobs.filter(
      (j) =>
        j.stage === name &&
        (filter.value === "all" || j.state === filter.value),
    );
    if (!matches.length) continue;
    const section = document.createElement("div");
    section.className = "stage";
    const h = document.createElement("h2");
    h.textContent = name;
    section.append(h);
    for (const j of matches) {
      count++;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "job";
      b.setAttribute("aria-pressed", String(j.id === selected));
      const strong = document.createElement("strong"),
        small = document.createElement("small");
      strong.textContent = j.id;
      small.textContent =
        (j.state === "passed" ? "✓ Passed" : "× Failed") + " · " + j.time;
      b.append(strong, small);
      b.onclick = () => {
        selected = j.id;
        feedback.textContent = "";
        render();
      };
      section.append(b);
    }
    stages.append(section);
  }
  document.querySelector("#empty").hidden = count !== 0;
  const j = jobs.find((j) => j.id === selected);
  document.querySelector("#job-title").textContent = j.id;
  document.querySelector("#job-stage").textContent = j.stage;
  document.querySelector("#job-log").textContent = j.log;
  const state = document.querySelector("#job-state");
  state.className = "state " + j.state;
  state.textContent = j.state === "passed" ? "Passed" : "Failed";
  retry.hidden = j.state !== "failed";
  const failed = jobs.some((j) => j.state === "failed"),
    overall = document.querySelector("#pipeline-state");
  overall.textContent = failed ? "Failed" : "Passed";
  overall.className = "state " + (failed ? "failed" : "passed");
}
filter.onchange = () => {
  const match = jobs.find(
    (j) => filter.value === "all" || j.state === filter.value,
  );
  if (match) selected = match.id;
  feedback.textContent = "";
  render();
};
retry.onclick = () => {
  const j = jobs.find((j) => j.id === selected);
  j.state = "passed";
  j.time = "15s";
  j.log =
    "$ npm run check:links\nSimulation: updated route found.\nNo broken internal links.\nJob succeeded (local simulation).";
  render();
  feedback.textContent =
    "Simulated retry completed locally. No CI job was started.";
};
document.querySelector("#reset").onclick = () => {
  jobs = structuredClone(initial);
  selected = "links";
  filter.value = "all";
  feedback.textContent = "Specimen restored.";
  render();
};
render();

```

[Code reference](https://design.gitlab.com/)

- Save as src/main.js. There are no CI requests.

### pajamas.css — original composition

Responsive stages, selected cards, metadata and wrapped log output.

```css
[hidden] {
  display: none !important;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: var(--gl-text-color-default, #3a383d);
  background: var(--gl-background-color-default, #fff);
}
.pipeline-example {
  padding: 28px;
}
.pipeline-example header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gl-border-color-default);
}
.eyebrow {
  font-size: 12px;
  color: var(--gl-text-color-subtle);
  margin-bottom: 16px;
}
.title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
}
h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
h3 {
  font-size: 14px;
  font-weight: 600;
}
.title-row p {
  margin: 0;
  color: var(--gl-text-color-subtle);
}
code {
  font: 12px monospace;
  background: #f7f7f5;
  color: #3a383d;
  padding: 2px 4px;
  overflow-wrap: anywhere;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
}
.toolbar label {
  margin: 0;
  font-weight: 600;
}
.toolbar select {
  max-width: 180px;
}
.toolbar button {
  margin-left: auto;
}
.pipeline-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 1fr);
  gap: 24px;
}
.stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.stage h2 {
  font-size: 13px;
  margin-bottom: 12px;
  color: var(--gl-text-color-subtle);
}
.job {
  display: block;
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1px solid var(--gl-border-color-default);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.job[aria-pressed="true"] {
  border-color: #27599f;
  box-shadow: inset 0 0 0 1px #27599f;
  background: #e8f2fd;
}
.job strong {
  display: block;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.job small {
  display: block;
  margin-top: 6px;
  color: var(--gl-text-color-subtle);
}
.job-detail {
  border: 1px solid var(--gl-border-color-default);
  border-radius: 4px;
  padding: 20px;
  min-width: 0;
}
.detail-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}
.state {
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  padding: 3px 9px;
  white-space: nowrap;
}
.state.failed {
  background: #feeef0;
  color: #891c2f;
}
.state.passed {
  background: #e6f5ea;
  color: #075048;
}
dl {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 8px;
  margin: 20px 0;
  font-size: 12px;
}
dt {
  color: var(--gl-text-color-subtle);
  font-weight: 400;
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
}
pre {
  background: #18171d;
  color: #ecebea;
  padding: 16px;
  border-radius: 4px;
  font: 12px/1.7 monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  min-height: 160px;
  margin-bottom: 16px;
}
#feedback {
  font-size: 12px;
  margin: 12px 0 0;
}
footer {
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--gl-border-color-subtle);
  font-size: 12px;
  color: var(--gl-text-color-subtle);
}
button:focus-visible,
select:focus-visible,
pre:focus-visible {
  outline: 2px solid #27599f;
  outline-offset: 3px;
}
@media (max-width: 1050px) {
  .pipeline-layout {
    grid-template-columns: 1fr;
  }
  .stages {
    gap: 16px;
  }
}
@media (max-width: 550px) {
  .pipeline-example {
    padding: 16px;
  }
  .toolbar {
    flex-wrap: wrap;
  }
  .toolbar button {
    margin-left: 0;
  }
  .stages {
    grid-template-columns: 1fr;
  }
  .stage {
    border-bottom: 1px solid var(--gl-border-color-subtle);
    padding-bottom: 8px;
  }
  .title-row {
    flex-wrap: wrap;
  }
  .job-detail {
    padding: 16px;
  }
}

```

[Code reference](https://design.gitlab.com/)

- Save as src/pajamas.css. System font fallback is explicit; no GitLab branded font is bundled.

## Implementation Starting Point

This integration imports the native CSS distribution only. Follow GitLab UI peer dependency requirements separately if adopting its Vue components.

```sh
npm create vite@latest pajamas-pipeline -- --template vanilla
cd pajamas-pipeline
npm install
npm install @gitlab/ui@138.0.0
# Replace index.html; add src/main.js and src/pajamas.css from the complete examples.
npm run dev
```

## Agent Prompt

Build a technical job inspector with Pajamas semantic surfaces, real spacing/type references, stable job IDs and accessible selection. Use the complete fixture source, preserve visible failure context, make filtered empty states understandable, and label all local simulation. Do not imply that CSS or the example retry creates a GitLab CI job.

## Sources

- [Pajamas Color Guidance](https://design.gitlab.com/product-foundations/color/) — UI roles and status meaning.
- [Pajamas Buttons](https://design.gitlab.com/components/button/) — Action hierarchy and button behavior.
- [Pinned Token Export](https://cdn.jsdelivr.net/npm/@gitlab/ui@138.0.0/dist/tokens/build/js/tokens.js) — Exact 138.0.0 reference values.
- [Official Source](https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com) — Pajamas and GitLab UI source repository.
