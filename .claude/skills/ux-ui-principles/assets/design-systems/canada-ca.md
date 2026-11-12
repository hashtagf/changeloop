# Canada.ca Design System — OpenDesign Application Guide

Explore GC Design System typography, semantic tokens and native web components through a complete searchable preparation guide with disclosure and empty-state behavior.

An OpenDesign-authored Canada.ca application study using GC Design System 1.6.0. The sample topics are fictional guidance, not government requirements or an official booking service.

## Source Reference

- **Runtime:** GC Design System 1.6.0 native web components ([source](https://design-system.canada.ca/en/components/input/code/))
- **Typography:** Lato headings, Noto Sans body, 65ch reading reference ([source](https://design-system.canada.ca/en/styles/typography/))
- **Interaction:** Local filtering with retained disclosure state and empty recovery ([source](https://design-system.canada.ca/en/components/details/code/))


## Design Reference

Published @gcds-core/components 1.6.0 CSS exports and component contracts; local preview embeds @gcds-core/fonts 1.1.1.

### Semantic color and interaction roles

[Official reference](https://design-system.canada.ca/en/styles/colour/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --gcds-text-primary | #333 | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-text-secondary | #595959 | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-bg-primary | #26374a | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-bg-light | #f2f2f2 | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-link-default | #1f497a | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-link-hover | #1354ec | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-link-visited | #4b248f | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-focus-background | #1354ec | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-focus-text | #fff | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-danger-text | #b3192e | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-disabled-background | #d9d9d9 | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |
| --gcds-border-default | #8c8c8c | Use the semantic role for text, surfaces or interaction states. Focus color is not a decorative accent. |

### Typography and readable width

[Official reference](https://design-system.canada.ca/en/styles/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --gcds-font-h1 | 700 2.5625rem/117% "Lato",sans-serif | Published CSS typography export. Load Lato and Noto Sans before judging line lengths or wrapping. |
| --gcds-font-h2 | 700 2.4375rem/123% "Lato",sans-serif | Published CSS typography export. Load Lato and Noto Sans before judging line lengths or wrapping. |
| --gcds-font-h3 | 700 1.8125rem/137% "Lato",sans-serif | Published CSS typography export. Load Lato and Noto Sans before judging line lengths or wrapping. |
| --gcds-font-h4 | 700 1.6875rem/133% "Lato",sans-serif | Published CSS typography export. Load Lato and Noto Sans before judging line lengths or wrapping. |
| --gcds-font-text | 400 1.25rem/160% "Noto Sans",sans-serif | Published CSS typography export. Load Lato and Noto Sans before judging line lengths or wrapping. |
| --gcds-font-text-small | 400 1.125rem/155% "Noto Sans",sans-serif | Published CSS typography export. Load Lato and Noto Sans before judging line lengths or wrapping. |
| --gcds-text-character-limit | 65ch | Published CSS typography export. Load Lato and Noto Sans before judging line lengths or wrapping. |

### Spacing and containers

[Official reference](https://design-system.canada.ca/en/styles/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --gcds-spacing-100 | 0.5rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-spacing-150 | 0.75rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-spacing-200 | 1rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-spacing-300 | 1.5rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-spacing-400 | 2rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-spacing-600 | 3rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-container-sm | 30rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-container-md | 48rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-container-lg | 62rem | Use the exported rem value rather than treating the token suffix as a pixel count. |
| --gcds-container-xl | 71.25rem | Use the exported rem value rather than treating the token suffix as a pixel count. |

## Canada.ca Design System Current Components and Package Scope

### Use the current namespace

GC Design System is the component system used in this Canada.ca resource. The specimen pins @gcds-core/components 1.6.0 and registers the standalone input, details and button custom elements. Older examples may use the @cdssnc namespace. Follow the package version actually installed rather than mixing registration code from a different release.

### Keep the content study separate from a service

The example presents six authored preparation topics. It has no Government of Canada signature, booking integration or mandatory-document claims. Its purpose is to demonstrate a real searchable disclosure pattern. Reusing the components does not establish that an application is an official service or that its content meets every Canada.ca requirement.

## Canada.ca Design System Typography and Reading Rhythm

### Load both font families

Headings use Lato and ordinary text uses Noto Sans. The published desktop body role is 1.25rem with 160% line height; the exported readable-width reference is 65ch. Those values create a substantially more open reading rhythm than a compact dashboard. The local preview embeds the published font files so a failed external font request cannot silently change the result.

### Respect the complete font shorthand

The token table includes the actual CSS font shorthand, not just nominal pixel sizes. Weight, line height and family matter together. The main title uses a short red underline as an authored Canada.ca-inspired composition detail; its 72px width is not presented as a general GC spacing token. At a narrow viewport the layout becomes one column while retaining readable body text.

## Canada.ca Design System Semantic Color and Focus Behavior

### Use public roles for meaningful states

Primary text is #333, secondary text is #595959, and the muted blue surface role is #26374a. Links, focus and danger have distinct roles in the exported CSS. A link is not identified solely by changing its color: the native details disclosure also has an affordance and an accessible expanded state.

### Do not remove the visible focus treatment

The native input and buttons supply their component focus behavior. Application CSS handles the surrounding layout without reaching into shadow roots to erase outlines. Reset returns focus to the search field so a keyboard user can immediately refine the query. Shadow DOM changes how custom styling and visibility rules apply, so inspect the rendered component instead of assuming ordinary element selectors cover every state.

## Canada.ca Design System Details Content and Information Priority

### Reserve disclosure for supporting explanations

Each native gcds-details receives details-title and supporting text in its default slot. Essential instructions remain in the visible sidebar. A real appointment time, address or requirement must not be available only after expanding a panel. The six sample topics are deliberately informational; they do not collect identity details or simulate a completed booking.

- Keep critical service information visible without expansion.
- Use a short, specific details title.
- Avoid nested disclosures that make content difficult to discover.

### Preserve disclosure state across filtering

The application creates each details element once. Filtering hides its plain wrapper rather than destroying and rebuilding the component. This preserves an expanded topic when it temporarily disappears and returns. Wrapper visibility also avoids relying on a custom element host’s internal display styling to honor an external hidden rule.

## Canada.ca Design System Search State and Empty Recovery

### Listen to the documented custom event

gcds-input requires label, input-id and name. Its gcdsInput event provides the new value in event.detail. The application compares a trimmed, lowercased query against topic titles and body text. A live status reports the visible count; no match reveals a useful recovery message instead of leaving an unexplained blank region.

### Make reset a complete transition

The secondary native button clears the component value, restores all six entries and focuses the internal input. It does not reset which disclosure a reader previously opened. This separation keeps query state and reading state predictable. A production search over a remote dataset would additionally need loading, request failure and result-order rules; this local six-item filter needs none of those claims.

## Canada.ca Design System Complete JavaScript Integration

### Reproduce the working specimen

Create a Vite vanilla project, install the pinned component package, and replace the entry with the full JavaScript below. Save canada.css beside it and keep a root mount element. Direct custom-element entrypoints register their required dependencies; the package CSS supplies the token layer. The source contains the full dataset, registration, filtering and reset behavior.

1. Install the pinned package in a Vite vanilla project.
2. Save the full entry and canada.css, keeping the root mount.
3. Search for a word with no match and verify the recovery message.
4. Reset, expand a topic and filter again to check reading-state retention.

### Hide result wrappers without destroying disclosure state

Place each gcds-details inside an ordinary wrapper and toggle that wrapper’s hidden state when filtering. A custom element’s own display rules can otherwise defeat assumptions made by generic CSS selectors. Keep the instances mounted so an expanded topic returns in the same state when the query is cleared.

Search and disclosure are separate controls. Read the query from gcdsInput event.detail, announce the resulting count, and leave the native details element responsible for its own expanded state. Reset should update the component value as well as the query model, then restore input focus; recreating the whole result region would discard the reader’s position.

## Component Examples

### main.js — complete native topic filter

Full entry with component registration, authored topics, filtering, disclosure retention and reset.

```javascript
import {defineCustomElement as input} from '@gcds-core/components/dist/components/gcds-input.js';
import {defineCustomElement as details} from '@gcds-core/components/dist/components/gcds-details.js';
import {defineCustomElement as button} from '@gcds-core/components/dist/components/gcds-button.js';
import '@gcds-core/components/dist/gcds/gcds.css';
import './canada.css';
input();details();button();
document.getElementById('root').innerHTML=`<main><p class="eyebrow">GC DESIGN SYSTEM / ORIGINAL CONTENT STUDY</p><h1>Prepare for an appointment</h1><p class="lead">Find a preparation topic in this fictional service guide. These are sample explanations, not government requirements.</p><div class="search-row"><gcds-input id="filter" input-id="topic-search" name="topic-search" label="Filter preparation topics" hint="Try time, access or documents." type="search"></gcds-input><gcds-button id="reset" button-role="secondary" type="button">Reset filter</gcds-button></div><div class="layout"><section aria-labelledby="topic-heading"><h2 id="topic-heading">Preparation topics</h2><p id="count" role="status"></p><div id="topics"></div><div id="empty" hidden><h3>No matching topic</h3><p>Try a shorter word or reset the filter.</p></div></section><aside><h2>Before you continue</h2><p>Important information stays visible. Expandable details are reserved for supporting explanations.</p><ol><li>Confirm the purpose of the appointment with the real service.</li><li>Check its current requirements and contact information.</li><li>Ask for help if an instruction is unclear.</li></ol><p class="small">Native GC Design System components 1.6.0. No official identity marks or real service claims are used.</p></aside></div></main>`;
const topics=[['Confirm the time','Check the time and time zone shown in a real booking confirmation. This sample does not contain a live appointment.'],['Review the location','A real service should provide an address or joining instructions. A location belongs in visible booking details, not only inside a collapsed panel.'],['Plan access needs','Ask the service about accessibility arrangements through its official contact route. This sample demonstrates disclosure behavior and does not promise a particular accommodation.'],['Check documents','Follow the actual service’s published document requirements. This authored example intentionally does not invent a list of mandatory identity documents.'],['Keep a reference','If the service provides a booking reference, keep it with your confirmation. Do not paste personal reference numbers into this public specimen.'],['Prepare questions','Write down what you want to understand. In a real service, clear preparation content can reduce the need to remember questions during the appointment.']];const $=id=>document.getElementById(id);const entries=topics.map(([title,text])=>{const el=document.createElement('gcds-details');el.setAttribute('details-title',title);const p=document.createElement('p');p.textContent=text;el.append(p);const wrapper=document.createElement('div');wrapper.append(el);$('topics').append(wrapper);return{el,wrapper,title,text}});function render(q=''){let count=0;for(const item of entries){item.wrapper.hidden=!(item.title+' '+item.text).toLowerCase().includes(q.trim().toLowerCase());if(!item.wrapper.hidden)count++}$('count').textContent=count+' of '+topics.length+' sample topics';$('empty').hidden=count>0}$('filter').addEventListener('gcdsInput',e=>render(e.detail));$('reset').addEventListener('click',()=>{$('filter').value='';render();$('filter').shadowRoot.querySelector('input')?.focus()});render();

```

[Code reference](https://design-system.canada.ca/en/components/input/code/)

- Save as src/main.js with a root mount element. The published package CSS loads its default font URLs; this local preview embeds the same public fonts.

### canada.css — responsive content composition

Original page layout around the native component styling.

```css
*{box-sizing:border-box}body{margin:0;background:white;color:var(--gcds-text-primary);font:var(--gcds-font-text)}main{padding:32px}h1{font:var(--gcds-font-h1);margin:16px 0 24px;max-width:24ch}h1:after{content:'';display:block;width:72px;height:6px;background:#a62a1e;margin-top:16px}h2{font:var(--gcds-font-h3);margin:0 0 24px}h3{font:var(--gcds-font-h4)}p{margin:0 0 24px;max-width:65ch}.eyebrow,.small{font:var(--gcds-font-text-small)}.lead{max-width:65ch}.search-row{display:flex;align-items:end;gap:24px;margin:32px 0;border-top:1px solid #ccc;padding-top:24px}.search-row gcds-input{flex:1;max-width:650px}.search-row gcds-button{margin-bottom:var(--gcds-input-margin)}.layout{display:grid;grid-template-columns:1.6fr 1fr;gap:48px}aside{background:var(--gcds-color-grayscale-50);border-left:4px solid var(--gcds-color-blue-muted);padding:24px;align-self:start}aside h2{font:var(--gcds-font-h4)}aside ol{padding-left:24px}aside li{padding-left:8px;margin:16px 0}#count{font:var(--gcds-font-text-small)}#empty{padding:24px;background:var(--gcds-color-grayscale-50)}gcds-details{display:block}gcds-details p{padding-top:8px}[hidden]{display:none!important}@media(max-width:767px){main{padding:20px}.layout{grid-template-columns:1fr;gap:32px}.search-row{display:block}.search-row gcds-button{display:block;margin-top:16px}h1{font-size:2rem}aside{padding:20px}}

```

[Code reference](https://design-system.canada.ca/en/styles/typography/)

- The layout breakpoint and title underline geometry are specimen decisions, not additional official tokens.

## Implementation Starting Point

The local preview runs the pinned custom elements; no remote service or credential is required.

```sh
npm create vite@latest gc-topics -- --template vanilla
cd gc-topics
npm install
npm install @gcds-core/components@1.6.0
# Replace src/main.js and add src/canada.css; keep <div id="root"></div>.
npm run dev
```

## Agent Prompt

Build the six-topic preparation guide with GC Design System 1.6.0. Load the genuine typography and token CSS, use native input/details/button components, retain disclosure state across filters, announce result count and provide complete reset behavior. Keep essential content visible and distinguish sample explanations from official service requirements.

## Sources

- [Input API](https://design-system.canada.ca/en/components/input/code/) — Required identifiers, labels and custom events.
- [Details API](https://design-system.canada.ca/en/components/details/code/) — Supporting-content disclosure and title contract.
- [Typography](https://design-system.canada.ca/en/styles/typography/) — Font families and reading scale.
- [Spacing](https://design-system.canada.ca/en/styles/spacing/) — Published spacing system.
- [Terms and package scope](https://design-system.canada.ca/en/terms-of-use/) — Current package namespace and use context.
