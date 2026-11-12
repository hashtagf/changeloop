# gov.cz Design System — OpenDesign Application Guide

Explore Gov Design System CE’s real color roles, card slots and native pagination through a complete six-resource reading toolkit with explicit focus and page state.

An original OpenDesign service-toolkit study using Gov Design System CE 4.7.1 components, styles, icons and fonts. Sample writing and collection behavior are original; this is not an official government service.

## Source Reference

- **Distribution:** Gov CE 4.7.1 · four matched packages ([source](https://designsystem.gov.cz/zaciname/developers/html))
- **Preview:** Native card/button/pagination + original reading flow ([source](https://designsystem.gov.cz/komponenty/pagination))
- **Reference:** 25 concrete color and state values ([source](https://designsystem.gov.cz/principy/barevne-tokeny))


## Design Reference

Actual @gov-design-system-ce/styles 4.7.1 tokens.css color primitives and semantic aliases. The preview uses the published styles and Roboto package.

### Primary and neutral primitives

[Official reference](https://designsystem.gov.cz/principy/barevne-tokeny)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-primary-50 | rgb(242, 246, 252) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-primary-100 | rgb(226, 238, 248) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-primary-600 | rgb(0, 70, 155) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-primary-700 | rgb(14, 53, 120) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-primary-800 | rgb(16, 38, 87) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-secondary-600 | rgb(250, 180, 19) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-neutral-0 | rgb(255, 255, 255) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-neutral-50 | rgb(246, 246, 246) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |
| --color-neutral-950 | rgb(38, 38, 38) | Published 4.7.1 primitive values. The application should normally consume the corresponding semantic role. |

### Reading and feedback roles

[Official reference](https://designsystem.gov.cz/principy/barevne-tokeny)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --text-primary | var(--color-neutral-950) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --text-secondary | var(--color-neutral-700) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --text-primary-color | var(--color-primary-600) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --text-white | var(--color-neutral-0) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --text-status-error | var(--color-error-700) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --text-status-success | var(--color-success-700) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --status-focus | var(--color-focus-600) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --status-warning | var(--color-warning-400) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |
| --status-error | var(--color-error-600) | Semantic aliases are preserved so the role remains visible; do not flatten every alias into an unrelated local hex value. |

### Primary button states

[Official reference](https://designsystem.gov.cz/principy/barevne-tokeny)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --button-solid-primary | var(--color-primary-600) | Actual state tokens used by the published button styling. Keep disabled, hover and active distinct. |
| --button-solid-primary-hover | var(--color-primary-700) | Actual state tokens used by the published button styling. Keep disabled, hover and active distinct. |
| --button-solid-primary-active | var(--color-primary-800) | Actual state tokens used by the published button styling. Keep disabled, hover and active distinct. |
| --button-solid-disabled | var(--color-neutral-200) | Actual state tokens used by the published button styling. Keep disabled, hover and active distinct. |
| --button-outlined-primary | var(--color-primary-50) | Actual state tokens used by the published button styling. Keep disabled, hover and active distinct. |
| --button-outlined-primary-hover | var(--color-primary-100) | Actual state tokens used by the published button styling. Keep disabled, hover and active distinct. |
| --button-outlined-primary-active | var(--color-primary-200) | Actual state tokens used by the published button styling. Keep disabled, hover and active distinct. |

## gov.cz Design System Gov CE Foundations and Asset Order

### Keep the package versions aligned

This example pins components, styles, icons and fonts to 4.7.1. The five foundation stylesheets load in the published order. Their responsibilities differ: variables alone do not style a card, and registering a custom element alone does not bring in the global component CSS. The full entry includes all five before its small original composition layer.

### Initialize configuration before component registration

The icon path is configured before the dynamically imported component entry modules run. That ordering matters because pagination renders arrow icons as part of its own dependencies. Copy the complete icon directory to the configured public path while keeping its subdirectories. A successful JavaScript import does not prove those separate icon requests succeeded.

## gov.cz Design System Semantic Color and State References

### Connect color to a role

The reference distinguishes the blue primary primitive from text, focus and button state aliases. Using the same apparent blue everywhere would erase those contracts. The toolkit uses the official solid primary buttons and lets the component stylesheet choose their active, hover and disabled appearance. Only the surrounding collection layout is original CSS.

### Keep typography and content context visible

Roboto comes from the matched font package. Cards have short actionable headings, a metadata line and a summary before the reading action. The six resource texts are original OpenDesign practice material, not translated official Czech government instructions. Their purpose is to demonstrate hierarchy and a complete local interaction without pretending to be a government service.

## gov.cz Design System Card Slots and Read Actions

### Place the heading in its supported slot

Each gov-card receives a heading in the headline slot. Its metadata, description and button form the content. The action has an aria-label that includes the resource title, distinguishing repeated Read resource buttons for assistive technology. The component transfers ARIA attributes to its internal interactive element; an invented accessible-label attribute would not do that.

### Keep layout outside the component contract

A three-column CSS grid becomes one column on a narrow screen. The grid and its breakpoint are authored for this example, not additional official card properties. The preview also removes the global 320px minimum body width inside its very narrow embedded container. This limited composition adjustment preserves component styling while preventing the parent page from overflowing.

## gov.cz Design System Native Pagination and Application State

### Read the native event payload

gov-pagination receives total=6 and page-size=3. Its gov-page event supplies detail.pagination.currentPage, which selects the matching three records. The pagination component owns its current-page controls; the application owns the dataset and visible slice. All default Czech navigation labels are explicitly replaced with English labels for this English study.

- total is the number of records, not the number of pages.
- page-size controls the slice length.
- gov-page exposes detail.pagination.currentPage.
- Navigation labels must match the language of the interface.

### Avoid stale details after a page change

Changing page closes the currently open resource so the detail cannot appear to belong to a different set of cards. The count reports Resources 1–3 or 4–6 of 6. This is local pagination over a known small dataset, so there is no artificial loading spinner or claim of a server fetch. A server-backed implementation would need a separate pending, error and result contract.

## gov.cz Design System Reading Focus and Return Behavior

### Move focus to the opened resource

The read action fills a local detail region and focuses its heading. This gives keyboard users a clear destination after an action that adds content below the collection. A focusable heading uses tabindex=-1 so it can be focused by the application without becoming an extra regular Tab stop. The opened content remains ordinary readable text.

### Return to the action that opened it

Back to resources hides the detail and focuses the original internal button. This is not a modal: it does not trap focus, add dialog semantics or dim the page. The original collection remains available. Repeatedly opening, closing and moving between pages checks whether application state and focus follow the same resource.

## gov.cz Design System Complete Local Integration

### Use the supplied files together

The entry is complete application code, including all six records, card creation, pagination handling and detail focus. The stylesheet contains the original composition only. Install the four pinned packages, copy the icons and save both files into a vanilla Vite project. The browser preview bundles exactly these component entries and local font assets.

1. Install all four Gov CE packages at 4.7.1.
2. Copy icons into public/assets/gov-cz-icons with subdirectories preserved.
3. Save the complete JavaScript and composition CSS in src.
4. Run the app and inspect paging, focus return and icon requests.

### Verify interaction and asset loading

Open the first resource, return to its button, advance to the second page and read a different resource. Verify the first/previous controls are disabled at the beginning and the next/last controls at the end. Inspect the same flow at desktop and phone widths, including a narrower embedded width. Check the network panel for missing icons as well as JavaScript errors.

## Component Examples

### main.js — complete paginated toolkit

Full data, native component registration, page slicing and reading focus.

```javascript
import '@gov-design-system-ce/styles/tokens.css';
import '@gov-design-system-ce/styles/styles.css';
import '@gov-design-system-ce/styles/layout.css';
import '@gov-design-system-ce/styles/components.css';
import '@gov-design-system-ce/styles/animations.css';
import '@gov-design-system-ce/fonts/lib/roboto.css';
import './gov-cz.css';
window.GOV_DS_CONFIG={iconsPath:'/assets/gov-cz-icons'};
const resources=[
 {title:'Map the service journey',kind:'Workshop',time:'25 minutes',summary:'Connect the first question to a useful outcome.',body:'Start with the person’s goal. Record how they discover the service, what they need before starting and how they know the task has finished. Mark every hand-off where the person must repeat information.'},
 {title:'Write a clear action label',kind:'Writing guide',time:'10 minutes',summary:'Name what will happen after a button is activated.',body:'Use a verb and the object of the action. Compare Save draft with Send application and make the distinction explicit. Keep destructive and reversible actions visually and verbally distinguishable.'},
 {title:'Review keyboard access',kind:'Checklist',time:'20 minutes',summary:'Inspect focus order, visible focus and recovery.',body:'Work through the page using only the keyboard. Check the first useful control, the order through repeated items, the next-page action and return from a detail view. A selected page and keyboard focus are separate states.'},
 {title:'Prepare an error message',kind:'Writing guide',time:'15 minutes',summary:'Explain the issue next to a recoverable action.',body:'State what needs changing and how to change it. Preserve the person’s input. Avoid a generic failure message when the application knows which field or prerequisite is causing the problem.'},
 {title:'Test a narrow layout',kind:'Checklist',time:'20 minutes',summary:'Keep reading and actions available on a small screen.',body:'Inspect a long title, two lines of metadata and the pagination controls at a narrow width. Avoid hiding essential actions behind hover. Check that only a genuinely two-dimensional region scrolls sideways.'},
 {title:'Record the decision',kind:'Template',time:'10 minutes',summary:'Give the next team enough context to continue.',body:'Record the decision, the evidence used, the person responsible and the condition that would make the team revisit it. A useful record explains the reasoning without presenting an experiment as a settled rule.'}
];
document.querySelector('#root').innerHTML=`<main><p class="eyebrow">OPENDESIGN · ORIGINAL SERVICE TOOLKIT</p><h1>Small steps toward a clearer service</h1><p class="lead">Six practical resources for a team review. Explore two pages and open a resource without leaving the collection.</p><div id="cards" class="cards"></div><div class="pagination-row"><p id="range" role="status"></p><gov-pagination total="6" page-size="3" current="1" color="primary" size="s" accessible-page-label="Page" accessible-select-label="Choose a page" label-prev="Previous page" label-next="Next page" label-start="First page" label-end="Last page" aria-label="Toolkit pages"></gov-pagination></div><section id="detail" hidden aria-labelledby="detail-title"><p class="eyebrow" id="detail-meta"></p><h2 id="detail-title" tabindex="-1"></h2><p id="detail-body"></p><gov-button id="close" type="outlined" color="primary" size="m">Back to resources</gov-button></section><aside><strong>About this example</strong><p>These are original OpenDesign practice notes, not Czech government guidance. Cards, buttons and pagination use Gov Design System CE 4.7.1. Reading a resource is local and does not submit information.</p></aside></main>`;
await import('@gov-design-system-ce/components/dist/components/gov-card.js');
await import('@gov-design-system-ce/components/dist/components/gov-pagination.js');
let page=1,opened=-1;
const cards=document.querySelector('#cards'), detail=document.querySelector('#detail');
function render(){cards.replaceChildren();resources.slice((page-1)*3,page*3).forEach((r,i)=>{let id=(page-1)*3+i;let card=document.createElement('gov-card');card.innerHTML=`<h2 slot="headline">${r.title}</h2><p class="meta">${r.kind} · ${r.time}</p><p>${r.summary}</p><gov-button type="solid" color="primary" size="m" data-resource="${id}" aria-label="Read ${r.title}">Read resource</gov-button>`;cards.append(card)});document.querySelector('#range').textContent=`Resources ${(page-1)*3+1}–${page*3} of ${resources.length}`;detail.hidden=true;opened=-1;}
cards.addEventListener('gov-click',e=>{let b=e.target.closest('[data-resource]');if(!b)return;opened=Number(b.dataset.resource);let r=resources[opened];document.querySelector('#detail-meta').textContent=r.kind+' · '+r.time;document.querySelector('#detail-title').textContent=r.title;document.querySelector('#detail-body').textContent=r.body;detail.hidden=false;document.querySelector('#detail-title').focus();});
document.querySelector('gov-pagination').addEventListener('gov-page',e=>{page=e.detail.pagination.currentPage;render();});
document.querySelector('#close').addEventListener('gov-click',()=>{detail.hidden=true;const button=cards.querySelector(`[data-resource="${opened}"] button`);button?.focus();opened=-1;});render();

```

[Code reference](https://designsystem.gov.cz/zaciname/developers/html)

- Configuration runs before component entry imports. ARIA names use aria-label.

### gov-cz.css — original collection composition

Responsive grid and readable local detail, retaining native component styles.

```css
body{margin:0;color:var(--text-primary);font-family:Roboto,Arial,sans-serif}main{max-width:1160px;margin:auto;padding:32px}.eyebrow{font-size:12px;letter-spacing:.08em;font-weight:700;color:var(--color-primary-600)}h1{max-width:22ch;font-size:40px;line-height:1.15;margin:16px 0}.lead{max-width:66ch;font-size:18px;line-height:1.6}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:32px 0}.cards gov-card{height:100%}.cards h2{font-size:22px;line-height:1.3}.cards p{margin-bottom:20px;line-height:1.6}.meta{font-size:14px;color:#555}.pagination-row{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}#range{font-size:14px}#detail{padding:24px;border-left:4px solid var(--color-primary-600);background:var(--color-primary-50);margin-top:32px}#detail-body{max-width:66ch;line-height:1.7}aside{margin-top:32px;padding-top:24px;border-top:1px solid #ddd;font-size:14px;line-height:1.6}aside p{max-width:80ch}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.cards{grid-template-columns:1fr}h1{font-size:32px}.pagination-row{display:block}gov-pagination{max-width:100%;overflow:auto}}

html,body{min-width:0}.eyebrow{overflow-wrap:anywhere}

```

[Code reference](https://designsystem.gov.cz/komponenty/card)

- Grid layout and the embedded minimum-width override are original application CSS.

## Implementation Starting Point

Keep icon subdirectories intact. This example imports direct component entry modules; it does not require a copied lazy-loader runtime.

```sh
npm create vite@latest gov-toolkit -- --template vanilla
cd gov-toolkit
npm install
npm install @gov-design-system-ce/components@4.7.1 @gov-design-system-ce/styles@4.7.1 @gov-design-system-ce/icons@4.7.1 @gov-design-system-ce/fonts@4.7.1
mkdir -p public/assets/gov-cz-icons
cp -R node_modules/@gov-design-system-ce/icons/lib/. public/assets/gov-cz-icons/
# Save the supplied files as src/main.js and src/gov-cz.css.
# The root index.html must contain <div id="root"></div> and load /src/main.js.
npm run dev
```

## Agent Prompt

Build the supplied Gov CE 4.7.1 toolkit using native cards, buttons and pagination. Keep the actual stylesheet order and icon path configuration. Use gov-page detail.pagination.currentPage, meaningful English ARIA labels, closed stale detail on page changes, and focus return after reading. Preserve original sample-content attribution.

## Sources

- [HTML integration](https://designsystem.gov.cz/zaciname/developers/html) — Asset order, registration and component composition.
- [Pagination](https://designsystem.gov.cz/komponenty/pagination) — Page controls and navigation semantics.
- [Card](https://designsystem.gov.cz/komponenty/card) — Card content and heading slot.
- [Color tokens](https://designsystem.gov.cz/principy/barevne-tokeny) — Primitive and semantic color roles.
- [Typography](https://designsystem.gov.cz/principy/typografie) — Font and text hierarchy.
