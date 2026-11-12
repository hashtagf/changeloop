# Emplifi Soul Design System — OpenDesign Application Guide

Read Soul’s data-table contract alongside its six-pixel spacing, layered color roles and compact Inter type. Compare bulk selection, missing-data notation and summary rows, then inspect the verified private React package entry points.

Soul is Emplifi’s design system. Its public design references and Storybook are readable, but the official quickstart requires access to a private npm scope. The browser specimen is independent HTML/CSS; it does not bundle Soul React. Table behavior interprets the design guidance, whose public page still labels React as planned.

## Source Reference

- **Primary typeface:** Inter ([source](https://soul.emplifi.io/latest/foundations/foundations/typography/typefaces-hFaPahBG))
- **Spacing base:** 6px ([source](https://soul.emplifi.io/latest/foundations/foundations/spacing-67iRzZzQ))
- **Default element radius:** 6px ([source](https://soul.emplifi.io/latest/foundations/foundations/radius-Z9zxhvSr))
- **Button package:** @sbks/ds-button ([source](https://soul.dev.emplifi.io/?path=/docs/components-button--overview))
- **Implementation access:** Private npm scope ([source](https://soul.dev.emplifi.io/?path=/docs/getting-started-quickstart-guide-overview--overview))
- **Foundation CSS:** variables.css and default-styles.css ([source](https://soul.dev.emplifi.io/?path=/docs/getting-started-quickstart-guide-css-variables-and-mixins--overview))


## Design Reference

Public Soul design documentation and live official Storybook. These are named light-mode foundation values, not an assertion that every documentation page and package release has identical status. Preview uses system fonts as a local fallback.

### Layer model

[Official reference](https://soul.emplifi.io/latest/foundations/foundations/colors/overview-X0TahKWD)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-layer-level-0 | #f3f3f5 | Light-mode surface level. |
| --color-layer-level-1 | #ffffff | Light-mode surface level. |
| --color-layer-level-2 | #f3f3f5 | Light-mode surface level. |
| --color-layer-level-3 | #e7e7e7 | Light-mode surface level. |
| --color-on-layer-primary | #24242b | Main text. |
| --color-on-layer-secondary | #505057 | Supporting text. |
| Dark level 0 / level 1 | #111114 / #24242b | Dark surfaces become lighter with depth. |

### Action and table colors

[Official reference](https://soul.emplifi.io/latest/foundations/foundations/colors/ui-colors-aysX6TuQ)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-button-primary | #0c4bff | Primary button background. |
| --color-on-layer-interactive | #003beb | Interactive text. |
| --color-border-focus-ring | #003beb | Focus ring. |
| --color-table-row-odd | #ffffff | Odd rows and table header/footer. |
| --color-table-row-even | #f9f9fa | Even rows. |
| --color-table-row-hover | #d5efff | Scanning feedback. |
| --color-layer-main-navigation | #111114 | Main navigation only. |

### Spacing and radius

[Official reference](https://soul.emplifi.io/latest/foundations/foundations/spacing-67iRzZzQ)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --space-1 | 3px | Foundation spacing. |
| --space-2 | 6px | Foundation spacing. |
| --space-3 | 9px | Foundation spacing. |
| --space-4 | 12px | Foundation spacing. |
| --space-5 | 18px | Foundation spacing. |
| --space-6 | 24px | Foundation spacing. |
| --space-7 | 30px | Foundation spacing. |
| --space-8 | 36px | Foundation spacing. |
| --space-9 | 48px | Foundation spacing. |
| Default control height | 36px | Compact option 30px; do not confuse with spacing scale. |

### Corner hierarchy

[Official reference](https://soul.emplifi.io/latest/foundations/foundations/radius-Z9zxhvSr)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --border-radius-small | 2px | Subtle softening. |
| --border-radius-medium | 6px | Default elements. |
| --border-radius-large | 8px | Containers. |
| --border-radius-full | 50% | Circle. |
| --border-radius-pill | 999px | Pill. |

### Type recipes

[Official reference](https://soul.emplifi.io/latest/foundations/foundations/typography/overview-D0qyFyli)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| headline-1 | 500 · 30px / 42px | Main page heading. |
| headline-2 | 500 · 20px / 30px | Section heading. |
| headline-3 | 500 · 16px / 24px | Subsection heading. |
| paragraph-regular | 400 · 13px / 18px | Medium body. |
| Button label | 600 · 13px / 18px | Sentence case. |
| Table numerals | Tabular numbers | Align comparable numeric values. |

### React Button API

[Official reference](https://soul.dev.emplifi.io/?path=/docs/components-button--overview)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Package | @sbks/ds-button | Private scope; Button is a named export. |
| variant | BUTTON_VARIANT.LIGHT default | Enum-backed; use exported enum constants, not raw strings in TypeScript. |
| size | BUTTON_SIZE.MEDIUM default | Medium is the base. |
| isLoading | false | Loading visualization. |
| isSelected | false | Selected appearance. |
| isApplied | false | Visual support currently for invisible variant. |
| onClick | Mouse event handler | Connect local application state. |
| badge | string \| number | Applied-selection information. |
| theme | Inherited; light fallback | Do not assume a dark surface changes all descendants automatically. |

## Emplifi Soul Design System Design guidance and implementation status

### Do not infer a package from a component name

Soul is Emplifi’s design system. Its public design references and Storybook are readable, but the official quickstart requires access to a private npm scope. The browser specimen is independent HTML/CSS; it does not bundle Soul React. Table behavior interprets the design guidance, whose public page still labels React as planned.

The supplied React example deliberately uses a semantic table and real Soul Button controls. It provides working application state without claiming an undocumented DataTable export. Publicly readable documentation does not grant package access or permission to redistribute private assets.

[Supporting specification](https://soul.dev.emplifi.io/?path=/docs/getting-started-quickstart-guide-overview--overview)

## Emplifi Soul Design System A data table contract beyond row selection

### Headers, summaries and missing values

Soul’s table guidance distinguishes headers, rows, cells and an optional summary bar. Numeric values align right; textual content aligns left. A summary can present totals or averages, so its label must identify the operation rather than show an unexplained number.

Use N/A when a measure does not apply, such as video duration for an image. An em dash represents unavailable or unknown data. Those cases should not be converted into zero: doing so changes the interpretation of a summary and any comparison built on it.

- The current specimen implements sorting and selectable rows, not a summary calculation.
- Expanded rows and missing-data explanations are documented extension points; they are not simulated in the preview.
- The design reference marks the React table as planned, so the supplied code owns its table markup instead of inventing a Soul DataTable import.

[Supporting specification](https://soul.emplifi.io/latest/components/components/data-table/usage-nLS68kIE)

### Bulk mode changes which actions are available

Soul places the bulk-action bar below the collection and suppresses individual row actions while bulk selection is active. The header checkbox has checked, unchecked and indeterminate states. Sorting is limited to one column at a time.

In the specimen, all three records are local and remain within the selection scope. The reach header announces sort direction; the selected IDs survive reordering. A future row-level action should respect the documented bulk-mode restriction rather than competing with the batch toolbar.

[Supporting specification](https://soul.emplifi.io/latest/components/components/data-table/usage-nLS68kIE)

## Emplifi Soul Design System Build depth with neutral layers

### A restrained CX workspace

Soul’s light mode alternates gray and white surfaces, while dark layers become progressively lighter. The specimen uses a gray page, a white table surface and a compact dark navigation strip. Color defines role rather than decorating every row.

The interactive blue is reserved for the review action and selected controls. Tiny original post illustrations carry decorative color. They help distinguish content subjects without assigning a false success or danger meaning to those subjects.

[Supporting specification](https://soul.emplifi.io/latest/foundations/foundations/colors/overview-X0TahKWD)

## Emplifi Soul Design System Compact type without losing hierarchy

### Inter is the primary family

Soul specifies Inter across the interface, Noto Sans Arabic for Arabic text, and Noto Sans Mono for code. The preview uses system fonts because it does not ship those font files. The measurements remain grounded in the published recipes.

A 30/42 main heading leads a 13/18 body system. Table numerals use tabular forms. The table does not use an oversized marketing display style, and post titles remain readable text rather than labels baked into an image.

[Supporting specification](https://soul.emplifi.io/latest/foundations/foundations/typography/typefaces-hFaPahBG)

## Emplifi Soul Design System Six-pixel rhythm and container radius

### Keep dense controls organized

The basic spacing unit is 6 px. Values such as 12, 18, 24 and 36 px establish larger relationships; 3 and 9 px are reserved for compact component internals rather than default page margins. The documented content padding changes from 24 px at 1559 px and below to 36 px at 1560 px and above.

Soul separates spacing numbers from T-shirt component sizes. A medium control is not --space-6. The specimen uses 36 px controls, 6 px element rounding and an 8 px container radius.

[Supporting specification](https://soul.emplifi.io/latest/foundations/foundations/spacing-67iRzZzQ)

## Emplifi Soul Design System Use emphasis to explain the next action

### A single primary review action

Soul’s primary variant highlights the strongest action. Light and ghost variants handle supporting work; invisible controls reduce visual weight in dense toolbars. The preview gives only the bulk review action the primary filled treatment.

Cancel selection clears the selected rows without changing review labels. Reviewing changes only local review state, and the message explicitly says nothing was published. The control text uses sentence case.

[Supporting specification](https://soul.emplifi.io/latest/components/components/button/usage-LajmcVQv)

## Emplifi Soul Design System Load the private library deliberately

### Foundation CSS precedes component composition

The official entry imports variables.css and default-styles.css from @sbks/ds-design-library. Its Sass entry supplies mixins; it is separate from the global CSS. Button comes from @sbks/ds-button.

The live Button API includes isLoading, isSelected, isApplied and badge. Enum-backed props require the library’s exported enum constants in TypeScript. This example uses the verified default LIGHT variant rather than guessing an enum import path.

1. Complete authorized private-scope and build-loader setup through the official quickstart.
2. Import the foundation CSS once in the application entry and configure the selected font assets.
3. Mount the supplied controlled table example, then test selection, cancellation and local review before connecting any publishing workflow.

[Supporting specification](https://soul.dev.emplifi.io/?path=/docs/getting-started-quickstart-guide-css-variables-and-mixins--overview)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent HTML/CSS interpretation of Soul design guidance and verified light-mode tokens. System font fallback; no private React assets.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Content review</title><style>:root{--color-layer-level-0:#f3f3f5;--color-layer-level-1:#fff;--color-on-layer-primary:#24242b;--color-on-layer-secondary:#505057;--color-button-primary:#0c4bff;--space-2:6px;--space-4:12px;--space-6:24px;--border-radius-medium:6px;--border-radius-large:8px}*{box-sizing:border-box}body{margin:0;background:var(--color-layer-level-0);color:var(--color-on-layer-primary);font:13px/18px system-ui}nav{padding:15px 24px;background:#111114;color:#f9f9fa;font-size:13px;display:flex;justify-content:space-between;gap:24px}main{padding:24px}header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:24px}h1{font-size:30px;font-weight:500;line-height:42px;margin:0}p{color:#505057;margin:6px 0}small{font-size:11px}.surface{background:white;border:1px solid #ddd;border-radius:8px;overflow:hidden}.bar{padding:18px 24px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;gap:12px}table{width:100%;border-collapse:collapse;table-layout:fixed}caption{text-align:left;padding:12px 24px;background:#f9f9fa;font-size:11px;color:#505057}th,td{padding:16px 12px;text-align:left;border-bottom:1px solid #e7e7e7;font-weight:400}thead th{font-size:11px;font-weight:600;padding-top:12px;padding-bottom:12px}th:first-child,td:first-child{width:44px;text-align:center}.title{width:46%}.reach{width:15%;text-align:right;font-variant-numeric:tabular-nums}tbody tr:nth-child(even){background:#f9f9fa}tbody tr:hover{background:#d5efff}input{accent-color:#003beb;width:16px;height:16px;cursor:pointer}input:focus-visible,button:focus-visible{outline:2px solid #003beb;outline-offset:3px}button{font:600 13px/18px system-ui;border:1px solid #ccc;background:white;padding:8px 12px;border-radius:6px;min-height:36px;cursor:pointer;color:inherit}button:hover{background:#f3f3f5}#sort{border:0;background:transparent;padding:0;min-height:28px;color:#003beb}#apply{background:#0c4bff;color:white;border-color:#0c4bff}#apply:hover{background:#003beb}.name{display:flex;align-items:center;gap:12px}.art{width:52px;height:52px;flex:0 0 52px;border-radius:6px;position:relative;overflow:hidden}.field{background:#d4e5d3}.field:before{content:'';position:absolute;width:65px;height:65px;border-radius:50%;background:#7ca77a;left:15px;top:20px}.field:after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff1c5;left:8px;top:8px}.studio{background:#e6daee}.studio:before{content:'';position:absolute;width:20px;height:36px;background:#a089b2;left:8px;top:16px;transform:rotate(-14deg)}.studio:after{content:'';position:absolute;width:20px;height:28px;background:#c3abc9;left:30px;top:24px;transform:rotate(12deg)}.guide{background:#f4e4c9}.guide:before{content:'';position:absolute;width:26px;height:38px;background:#fff;left:13px;top:9px;transform:rotate(8deg);border:1px solid #c9ad7c}.name strong{font-weight:600;display:block}.name small{color:#505057}.state{font-size:11px;color:#505057}#bulk{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 24px;background:#f3f3f5;border-top:1px solid #ccc}#bulk[hidden]{display:none}.actions{display:flex;gap:6px}#status{margin:18px 0;min-height:18px}footer{padding:0 24px 20px;color:#505057;font-size:11px}@media(min-width:1560px){main{padding:36px}}@media(max-width:600px){main{padding:18px}.bar{padding:12px}.channel{display:none}.title{width:57%}.reach{width:22%}.state{display:block;margin-top:4px}th,td{padding:12px 6px}.art{width:36px;height:42px;flex-basis:36px}.name{gap:6px}#bulk{padding:12px;flex-direction:column;align-items:stretch}.actions{flex-wrap:wrap}header{flex-direction:column;gap:8px}h1{font-size:27px}.bar small{max-width:140px;text-align:right}nav{padding:14px 18px}}</style><nav><strong>Soul / Content workspace</strong><span>Demo collection</span></nav><main><header><div><h1>Content review</h1><p>A final editorial check before your team publishes.</p></div><small>3 fictional drafts · No publishing connection</small></header><section class="surface" aria-label="Content drafts"><div class="bar"><strong>Draft collection</strong><small>Select items to review together</small></div><table><caption>Local sample data. Reach values are illustrative.</caption><thead><tr><th scope="col"><input id="all" type="checkbox" aria-label="Select all drafts"></th><th scope="col" class="title">Content</th><th scope="col" class="channel">Channel</th><th scope="col" class="reach" id="reach-head" aria-sort="none"><button id="sort">Reach ↕</button></th></tr></thead><tbody id="rows"></tbody></table><div id="bulk" hidden><span id="count"></span><div class="actions"><button id="apply">Mark as reviewed</button><button id="cancel">Cancel selection</button></div></div></section><p id="status" role="status">Select a draft to begin. All changes stay in this example.</p></main><footer>Independent Soul interpretation · verified light-mode tokens · system font fallback</footer><script>let items=[{id:'field',title:'A morning in the field',channel:'Instagram',reach:2480},{id:'studio',title:'Inside the studio',channel:'Facebook',reach:1860},{id:'guide',title:'Care guide: summer edition',channel:'Instagram',reach:3210}],selected=new Set(),reviewed=new Set(),direction=0;const rows=document.querySelector('#rows'),all=document.querySelector('#all'),bulk=document.querySelector('#bulk'),status=document.querySelector('#status');function render(){rows.innerHTML=items.map(i=>`<tr><td><input type="checkbox" data-id="${i.id}" aria-label="Select ${i.title}" ${selected.has(i.id)?'checked':''}></td><th scope="row"><div class="name"><div class="art ${i.id}" aria-hidden="true"></div><div><strong>${i.title}</strong><span class="state">${reviewed.has(i.id)?'Reviewed locally':'Not reviewed'}</span></div></div></th><td class="channel">${i.channel}</td><td class="reach">${i.reach.toLocaleString('en-US')}</td></tr>`).join('');rows.querySelectorAll('input').forEach(x=>x.onchange=()=>{x.checked?selected.add(x.dataset.id):selected.delete(x.dataset.id);sync()});sync()}function sync(){all.checked=selected.size===items.length;all.indeterminate=selected.size>0&&selected.size<items.length;bulk.hidden=!selected.size;document.querySelector('#count').textContent=selected.size+' selected'}all.onchange=()=>{selected=all.checked?new Set(items.map(i=>i.id)):new Set();render()};document.querySelector('#cancel').onclick=()=>{selected.clear();render();all.focus()};document.querySelector('#apply').onclick=()=>{let n=selected.size;selected.forEach(x=>reviewed.add(x));selected.clear();render();status.textContent=n+(n===1?' draft':' drafts')+' reviewed locally. Nothing published.';all.focus()};document.querySelector('#sort').onclick=()=>{direction=direction===1?-1:1;items.sort((a,b)=>(a.reach-b.reach)*direction);document.querySelector('#reach-head').setAttribute('aria-sort',direction===1?'ascending':'descending');document.querySelector('#sort').textContent='Reach '+(direction===1?'↑':'↓');render()};render();</script></html>

```

[Code reference](https://soul.emplifi.io/latest/components/components/data-table/usage-nLS68kIE)

- The table implements selection and sorting directly in HTML. It does not claim a private Soul DataTable export; the React example uses the verified Button export alongside an application-owned table.

### Selectable review table with real Soul buttons

Native semantic table and controlled checkboxes composed with the documented Button export. The table is application code, not an invented Soul DataTable component.

```tsx
// ContentReview.tsx — inside a configured, authorized Soul application
import React, { useState } from 'react';
import { Button } from '@sbks/ds-button';
import '@sbks/ds-design-library/dist/css/variables.css';
import '@sbks/ds-design-library/dist/css/default-styles.css';

const posts = [
  { id: 'field', title: 'A morning in the field', channel: 'Instagram' },
  { id: 'studio', title: 'Inside the studio', channel: 'Facebook' },
  { id: 'guide', title: 'Care guide: summer edition', channel: 'Instagram' }
];
export default function ContentReview() {
  const [selected, setSelected] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const toggle = (id: string) => setSelected(previous =>
    previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]);
  const review = () => {
    setReviewed(previous => [...new Set([...previous, ...selected])]);
    setMessage(`${selected.length} items reviewed locally. Nothing published.`);
    setSelected([]);
  };
  return <section aria-labelledby="review-title">
    <h1 id="review-title">Content review</h1>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <caption>Fictional content drafts</caption>
      <thead><tr><th scope="col">Select</th><th scope="col">Content</th>
        <th scope="col">Channel</th><th scope="col">Review</th></tr></thead>
      <tbody>{posts.map(post => <tr key={post.id}>
        <td><input type="checkbox" aria-label={`Select ${post.title}`}
          checked={selected.includes(post.id)} onChange={() => toggle(post.id)} /></td>
        <th scope="row">{post.title}</th><td>{post.channel}</td>
        <td>{reviewed.includes(post.id) ? 'Reviewed locally' : 'Not reviewed'}</td>
      </tr>)}</tbody>
    </table>
    {selected.length > 0 && <div aria-label="Bulk actions"
      style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
      <Button onClick={review}>Mark {selected.length} as reviewed</Button>
      <Button onClick={() => setSelected([])}>Cancel selection</Button>
    </div>}
    <p role="status">{message}</p>
  </section>;
}

```

[Code reference](https://soul.dev.emplifi.io/?path=/docs/components-button--overview)

- The Button default is LIGHT. This example does not guess an enum export location or invent DataTable props.
- Install and configure the private design library and button packages first. The imports are verified in the official Storybook.
- Bulk review updates local state only. No content is published.

## Implementation Starting Point

The official quickstart requires private npm and Emplifi repository/VPN access. It supports React 18/19 and Webpack 4/5, with Sass and SVG loader setup. Use the linked internal-scope onboarding rather than expecting these packages from the public registry. The standalone preview needs none of those private assets.

```bash / tsx
# For authorized Emplifi environments with the private @sbks scope configured:
npm i -D @sbks/ds-design-library @sbks/ds-button

// Application entry:
import "@sbks/ds-design-library/dist/css/variables.css";
import "@sbks/ds-design-library/dist/css/default-styles.css";

// Optional SCSS file:
@use "@sbks/ds-design-library/dist/sass/main.scss" as *;
```

## Agent Prompt

Create an Emplifi Soul content-review interface with verified layer/color/spacing variables, 13/18 body type, 6px control radius and 8px containers. Use a semantic selectable table with stable IDs, indeterminate select-all and one sorted column. For authorized apps use the real @sbks/ds-button export and foundation CSS; never invent a public DataTable package.

## Sources

- [Layer model](https://soul.emplifi.io/latest/foundations/foundations/colors/overview-X0TahKWD) — Light/dark surface hierarchy.
- [UI color tokens](https://soul.emplifi.io/latest/foundations/foundations/colors/ui-colors-aysX6TuQ) — Named colors and state roles.
- [Spacing](https://soul.emplifi.io/latest/foundations/foundations/spacing-67iRzZzQ) — Six-pixel unit and component sizing.
- [Typography](https://soul.emplifi.io/latest/foundations/foundations/typography/overview-D0qyFyli) — Type styles and semantic text colors.
- [Typefaces](https://soul.emplifi.io/latest/foundations/foundations/typography/typefaces-hFaPahBG) — Inter and Noto family roles.
- [Radius](https://soul.emplifi.io/latest/foundations/foundations/radius-Z9zxhvSr) — 2, 6, 8 px, full and pill values.
- [Button usage](https://soul.emplifi.io/latest/components/components/button/usage-LajmcVQv) — Action emphasis.
- [Table guidance](https://soul.emplifi.io/latest/components/components/data-table/usage-nLS68kIE) — Selection, sorting and summary behavior.
- [Private-package quickstart](https://soul.dev.emplifi.io/?path=/docs/getting-started-quickstart-guide-overview--overview) — Actual access and build requirements.
- [CSS entry points](https://soul.dev.emplifi.io/?path=/docs/getting-started-quickstart-guide-css-variables-and-mixins--overview) — Variables and default style imports.
- [Button API](https://soul.dev.emplifi.io/?path=/docs/components-button--overview) — Real component props and package.
