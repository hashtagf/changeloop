# USWDS Design System — OpenDesign Application Guide

Connect USWDS spacing tokens, theme roles, semantic tables and native accordions in a searchable opportunity comparison.

Independent USWDS 3.14.0 component study. Fictional opportunity records, no federal identity claim or application endpoint. Helvetica/Arial and Georgia are local font substitutions, not the default USWDS font assets.

## Source Reference

- **Maintaining organisation:** U.S. General Services Administration ([source](https://designsystem.digital.gov/))
- **System foundation:** Named design tokens ([source](https://designsystem.digital.gov/design-tokens/))
- **Component guidance:** UX, accessibility and implementation ([source](https://designsystem.digital.gov/components/))
- **Pattern layer:** Guidance for inclusive user experiences ([source](https://designsystem.digital.gov/patterns/))
- **Implementation tools:** Utilities and page templates are provided ([source](https://designsystem.digital.gov/))
- **Intended context:** Accessible, mobile-friendly government websites ([source](https://designsystem.digital.gov/))


## Design Reference

USWDS 3.14.0 native component distribution. Default tokens from official documentation; preview font substitutions are explicit local choices.

### Spacing units

[Official reference](https://designsystem.digital.gov/design-tokens/spacing-units/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| 0.5 / 05 | 4px | Half-unit spacing and utility form |
| 1 | 8px | Base spacing unit |
| 1.5 / 105 | 12px | Intermediate spacing |
| 2 | 16px | Compact inner padding |
| 3 | 24px | Related content gap |
| 4 | 32px | Section spacing |
| 5 | 40px | Larger separation |
| 6 | 48px | Large spacing |
| tablet | 640px | Named width token |
| desktop | 1024px | Named width token |

### Default type mapping

[Official reference](https://designsystem.digital.gov/design-tokens/typesetting/font-family/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sans | source-sans-pro | Type-based family token |
| serif | merriweather | Type-based family token |
| body / ui | sans | Role-based mapping |
| heading | serif | Role-based mapping |
| code | mono → roboto-mono | Code role mapping |

### Default theme colours

[Official reference](https://designsystem.digital.gov/design-tokens/color/theme-tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| primary | blue-60v / #005ea2 | Primary alias |
| primary-lighter | blue-10 / #d9e8f6 | Supporting primary tint |
| primary-dark | blue-warm-70v / #1a4480 | Darker primary alias |
| ink | gray-90 / #1b1b1b | Main text alias |

### Component contracts

[Official reference](https://designsystem.digital.gov/components/accordion/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| aria-controls | Panel ID | Connects each accordion button to content. |
| aria-expanded | true / false | Native JS maintains open state. |
| data-allow-multiple | Accordion root attribute | Allows independently open panels. |
| usa-accordion--bordered | Root modifier | Provides the bordered variant. |

## USWDS Design System A Configurable Foundation

### Default tokens are a starting configuration

USWDS separates system tokens, project theme settings, utility classes and components. The reference below records default theme choices from the current documentation. A federal programme may configure different type roles or colour aliases without replacing every component.

The preview is an independent research-opportunity comparison using 3.14.0 CSS and accordion JavaScript. It omits the government banner and identity marks. Programme names and stages are fictional, and filtering occurs entirely in the browser.

[Supporting specification](https://designsystem.digital.gov/documentation/developers/)

## USWDS Design System Spacing and Theme Tokens

### Read the unit rather than the numeral

One USWDS spacing unit is 8px: units(2) means 16px, while units(3) means 24px. Half-unit tokens expose smaller gaps, and the utility spelling uses 05 for a half unit. A margin-2 utility does not mean a two-pixel margin.

The scale also includes named widths such as tablet and desktop. Those names are reusable tokens, not a requirement to redesign every page at each width. The comparison uses grid-container around the content and a focused scrollable region for the table.

```scss
@use "uswds-core" as *;
.opportunity-meta {
  padding: units(2);
  margin-bottom: units(3);
}
```

[Code reference](https://designsystem.digital.gov/design-tokens/spacing-units/)

[Supporting specification](https://designsystem.digital.gov/design-tokens/spacing-units/)

## USWDS Design System Font Types and Roles

### A role can change without renaming components

The default sans token maps to Source Sans Pro and serif to Merriweather. Body and UI roles map to sans; heading maps to serif. The family("body") function resolves that chain. Distinguish the semantic role from the final font family when documenting a project.

The local preview explicitly uses Helvetica/Arial for body and Georgia for headings so no font downloads are needed. This is a study override, not the standard USWDS type identity. A production build should configure those roles through uswds-core settings or copy the distributed font assets.

```scss
@use "uswds-core" with (
  $theme-font-type-sans: "helvetica",
  $theme-font-type-serif: "georgia",
  $theme-font-role-body: "sans",
  $theme-font-role-heading: "serif"
);
```

[Code reference](https://designsystem.digital.gov/design-tokens/typesetting/font-family/)

[Supporting specification](https://designsystem.digital.gov/design-tokens/typesetting/font-family/)

## USWDS Design System Theme Colour Aliases

### Keep aliases tied to their role

The default primary alias resolves to blue-60v, #005ea2. Primary-dark resolves to blue-warm-70v, #1a4480; ink resolves to gray-90, #1b1b1b. These are theme values, not a claim that every USWDS site must use the same brand colour.

Use the semantic alias for an action or heading treatment, and a system colour token only when that is the actual design decision. Replacing a primary alias in settings is more controlled than replacing every matching hex string in compiled CSS.

[Supporting specification](https://designsystem.digital.gov/design-tokens/color/theme-tokens/)

## USWDS Design System Comparable Opportunity Rows

### Keep the table semantic

The example uses a caption, column headers with scope="col", and an opportunity name with scope="row". It is a table because readers compare the same topic and stage fields across records. Those relationships remain available when the region scrolls.

The scrollable wrapper has tabindex="0" so a keyboard user can enter it. It confines wide data to that region instead of widening the whole document. The preview contains ordinary text cells; missing programme data would need an explicit content state rather than an invented number.

[Supporting specification](https://designsystem.digital.gov/components/table/)

### Sorting is a separate enhancement

USWDS supports sortable headers through data-sortable. A sortable table also needs a usa-table__announcement-region with aria-live="polite". Numeric displays may need data-sort-value so a formatted amount sorts as a value rather than alphabetically. The current comparison does not enable sorting because its three-row topic filter is the intended demonstration.

[Supporting specification](https://designsystem.digital.gov/components/table/)

## USWDS Design System Requirements as Disclosures

### Connect the button and panel IDs

Each usa-accordion__button has aria-controls pointing to the associated usa-accordion__content. The native JavaScript updates aria-expanded and visibility. The bordered modifier changes the enclosure; data-allow-multiple allows several sections to remain open.

A heading contains the button so the content outline remains understandable. Requirements needed to decide whether a programme is relevant should remain visible above the disclosure. Here, the panels hold supplementary preparation notes and an explanation of the fictional dataset.

- The heading describes the panel topic.
- The button carries expanded state and a target ID.
- The panel keeps the same ID when its visibility changes.

[Supporting specification](https://designsystem.digital.gov/components/accordion/)

## USWDS Design System Install the Whole Asset Tree

### Preserve paths used by compiled CSS

Install @uswds/uswds@3.14.0 and copy its dist directory without flattening css, js, img and fonts into one folder. The stylesheet uses relative paths to icons and fonts. A page can otherwise look partly correct while missing disclosure symbols or typefaces.

Load uswds-init.min.js in the head, the stylesheet next, and uswds.min.js after the body markup. The bundled library enhances the accordion. The search input and topic filter below are custom application logic; they do not call a remote search service.

[Supporting specification](https://designsystem.digital.gov/documentation/developers/)

## USWDS Design System Filtering and Recovery

### A query must expose its result

The native label, input, select and button styles provide the controls; the application compares the query and selected topic against the three fictional records. The result count is a polite live region. No match shows an explanation and a reset action, while preserving the entered query.

The demonstration intentionally distinguishes discovering an opportunity from applying. Opening preparation content does not create a draft or mark a requirement complete. A real funding application would need its own programme policy, authentication and persistent transaction state.

1. Filter to Environment and inspect the remaining opportunity.
2. Search for an unmatched phrase and use Clear filters.
3. Open both preparation panels and verify their independent expanded states.

[Supporting specification](https://designsystem.digital.gov/documentation/developers/)

## Component Examples

### Supplementary preparation accordion

A native USWDS disclosure with an explicit relationship between button and panel.

```html
<div class="usa-accordion usa-accordion--bordered" data-allow-multiple>
  <h3 class="usa-accordion__heading">
    <button type="button" class="usa-accordion__button"
      aria-expanded="false" aria-controls="preparation">Before you prepare a draft</button>
  </h3>
  <div id="preparation" class="usa-accordion__content usa-prose" hidden>
    <p>This fictional opportunity asks for a project summary and a named contact.</p>
  </div>
</div>
```

[Code reference](https://designsystem.digital.gov/components/accordion/)

### Opportunity comparison table

Caption and row/column headers retain the comparison relationships.

```html
<div class="usa-table-container--scrollable" tabindex="0">
  <table class="usa-table usa-table--borderless">
    <caption>Illustrative research opportunities</caption>
    <thead><tr><th scope="col">Opportunity</th><th scope="col">Topic</th><th scope="col">Stage</th></tr></thead>
    <tbody><tr><th scope="row">Community water study</th><td>Environment</td><td>Example draft</td></tr></tbody>
  </table>
</div>
```

[Code reference](https://designsystem.digital.gov/components/table/)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Research opportunities — OpenDesign study</title><script src="vendor/uswds-3.14.0/uswds-init.min.js"></script><link rel="stylesheet" href="vendor/uswds-3.14.0/css/uswds.min.css"><style>body,body *,body *:before,body *:after{font-family:Helvetica,Arial,sans-serif!important}h1,h2{font-family:Georgia,serif!important}body{color:#1b1b1b;margin:0}[hidden]{display:none!important}.study-head{background:#d9e8f6;padding:16px 0;border-bottom:4px solid #005ea2}.study-head p{margin:0}.study-form{display:flex;gap:24px;align-items:end;flex-wrap:wrap}.study-form>div{flex:1;min-width:200px}.study-form .usa-input,.study-form .usa-select{max-width:none}.usa-table{width:100%}.study-main{padding-top:32px;padding-bottom:48px}.usa-table th{min-width:120px}#count{margin-top:24px}.study-note{border-top:1px solid #a9aeb1;margin-top:32px;padding-top:16px;line-height:1.5}</style></head><body><header class="study-head"><div class="grid-container"><p><strong>OpenDesign · USWDS component study</strong><br>Fictional research records. No application is submitted.</p></div></header><main class="grid-container study-main"><h1>Research opportunities</h1><p class="usa-intro">Compare topics and read the preparation notes.</p><form class="study-form" id="filters"><div><label class="usa-label" for="query">Search opportunity names</label><input class="usa-input" id="query" type="search"></div><div><label class="usa-label" for="topic">Topic</label><select class="usa-select" id="topic"><option value="">All topics</option><option>Environment</option><option>Transport</option><option>Education</option></select></div><button type="submit" class="usa-button">Apply filters</button><button type="button" class="usa-button usa-button--outline" id="clear">Clear filters</button></form><p id="count" aria-live="polite">3 opportunities</p><div class="usa-table-container--scrollable" tabindex="0"><table class="usa-table usa-table--borderless"><caption>Illustrative research opportunities</caption><thead><tr><th scope="col">Opportunity</th><th scope="col">Topic</th><th scope="col">Stage</th></tr></thead><tbody><tr data-topic="Environment"><th scope="row">Community water study</th><td>Environment</td><td>Example draft</td></tr><tr data-topic="Transport"><th scope="row">Accessible transport research</th><td>Transport</td><td>Example review</td></tr><tr data-topic="Education"><th scope="row">Local skills survey</th><td>Education</td><td>Example draft</td></tr></tbody></table></div><p id="empty" hidden>No matching opportunities. Broaden the topic or clear the filters.</p><h2>Preparation notes</h2><div class="usa-accordion usa-accordion--bordered" data-allow-multiple>
  <h3 class="usa-accordion__heading">
    <button type="button" class="usa-accordion__button"
      aria-expanded="false" aria-controls="preparation">Before you prepare a draft</button>
  </h3>
  <div id="preparation" class="usa-accordion__content usa-prose" hidden>
    <p>This fictional opportunity asks for a project summary and a named contact.</p>
  </div>
<h3 class="usa-accordion__heading"><button type="button" class="usa-accordion__button" aria-expanded="false" aria-controls="scope">What the example data means</button></h3><div id="scope" class="usa-accordion__content usa-prose" hidden><p>Draft and review are demonstration stages. They do not indicate an actual funding programme or eligibility decision.</p></div>
</div><p class="study-note">USWDS 3.14.0 native accordion and styles, with local Helvetica/Georgia font overrides. Filters are original application code. <a href="vendor/uswds-3.14.0/LICENSE.md">Distribution licence</a>.</p></main><script src="vendor/uswds-3.14.0/uswds.min.js"></script><script>const rows=[...document.querySelectorAll('tbody tr')],q=document.getElementById('query'),t=document.getElementById('topic');function filter(){let n=0;for(const row of rows){const show=(!t.value||row.dataset.topic===t.value)&&row.firstElementChild.textContent.toLowerCase().includes(q.value.trim().toLowerCase());row.hidden=!show;if(show)n++}document.getElementById('count').textContent=n+' '+(n===1?'opportunity':'opportunities');document.getElementById('empty').hidden=n!==0;}document.getElementById('filters').addEventListener('submit',e=>{e.preventDefault();filter()});document.getElementById('clear').addEventListener('click',()=>{q.value='';t.value='';filter();q.focus()});</script></body></html>
```

[Code reference](https://designsystem.digital.gov/components/accordion/)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

Preserve the dist directory structure so CSS resolves fonts and icons. This is the precompiled distribution route; theme customisation requires a Sass build. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/uswds.html. Do not open module-based examples through file://.

```sh / html
npm install @uswds/uswds@3.14.0
mkdir -p public/assets/uswds
cp -R node_modules/@uswds/uswds/dist public/assets/uswds/

<!-- HTML head -->
<script src="/assets/uswds/dist/js/uswds-init.min.js"></script>
<link rel="stylesheet" href="/assets/uswds/dist/css/uswds.min.css">
<!-- After the component markup, before closing body -->
<script src="/assets/uswds/dist/js/uswds.min.js"></script>
```

## Agent Prompt

Build a fictional research-opportunity comparison using USWDS 3.14.0. Load the complete dist asset tree, initialization script, component stylesheet and JavaScript. Present comparable records in a semantic table with a caption and column headers; provide labelled search and category filtering, a result count, a useful no-match state and reset. Use native accordions for supporting requirements while keeping essential comparison information visible. Preserve the documented spacing units and theme-role mappings; label the system-font override. Do not turn this directory into a submission workflow or imply real eligibility or award commitments.

## Sources

- [Spacing units](https://designsystem.digital.gov/design-tokens/spacing-units/) — Numeric units and named widths.
- [Font family roles](https://designsystem.digital.gov/design-tokens/typesetting/font-family/) — Type and role token resolution.
- [Theme colours](https://designsystem.digital.gov/design-tokens/color/theme-tokens/) — Default aliases and settings.
- [Table](https://designsystem.digital.gov/components/table/) — Semantic comparison and scrolling.
- [Accordion](https://designsystem.digital.gov/components/accordion/) — Panel states and markup.
- [Developer setup](https://designsystem.digital.gov/documentation/developers/) — Distribution and asset paths.
- [Download complete working example](/assets/demos/uswds-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
