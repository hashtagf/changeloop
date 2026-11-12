# NSW Design System — OpenDesign Application Guide

Explore NSW design tokens, Public Sans typography and native keyboard-accessible tabs through a complete workshop guide with an independent local reading list.

An OpenDesign-authored workshop study using NSW Design System 3.27.0. The native tab behavior is real; the content and saved-prompt workflow are original local application logic.

## Source Reference

- **Runtime:** NSW Design System 3.27.0 native Tabs ([source](https://designsystem.nsw.gov.au/components/tabs/index.html))
- **Typography:** Public Sans 400 and 700; responsive type pairs ([source](https://designsystem.nsw.gov.au/core/typography/index.html))
- **Reference:** 33 real CSS entries ([source](https://github.com/digitalnsw/nsw-design-system))


## Design Reference

Actual nsw-design-system 3.27.0 CSS exports and Tabs implementation, with local Public Sans fonts.

### Brand and neutral roles

[Official reference](https://github.com/digitalnsw/nsw-design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --nsw-brand-dark | #002664 | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-brand-light | #cbedfd | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-brand-supplementary | #146cfd | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-brand-accent | #d7153a | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-brand-accent-light | #ffe6ea | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-grey-01 | #22272b | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-grey-02 | #495054 | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-grey-03 | #cdd3d6 | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-grey-04 | #ebebeb | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-off-white | #f2f2f2 | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-text-dark | #22272b | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |
| --nsw-text-light | #fff | Actual 3.27.0 default theme. Text-light means light-colored text for dark surfaces, not low-emphasis text on white. |

### Status pairs

[Official reference](https://github.com/digitalnsw/nsw-design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --nsw-status-success | #008a07 | Pair the meaningful status color with its background role and a readable textual explanation. |
| --nsw-status-success-bg | #e5f6e6 | Pair the meaningful status color with its background role and a readable textual explanation. |
| --nsw-status-info | #2e5299 | Pair the meaningful status color with its background role and a readable textual explanation. |
| --nsw-status-info-bg | #eaedf4 | Pair the meaningful status color with its background role and a readable textual explanation. |
| --nsw-status-warning | #c95000 | Pair the meaningful status color with its background role and a readable textual explanation. |
| --nsw-status-warning-bg | #fbeee5 | Pair the meaningful status color with its background role and a readable textual explanation. |
| --nsw-status-error | #b81237 | Pair the meaningful status color with its background role and a readable textual explanation. |
| --nsw-status-error-bg | #f7e7eb | Pair the meaningful status color with its background role and a readable textual explanation. |

### Typography and radius

[Official reference](https://github.com/digitalnsw/nsw-design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --nsw-font-family | "Public Sans",sans-serif | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size | 16px | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-normal | 400 | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-bold | 700 | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-md-mobile | 1.125rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-md-desktop | 1.25rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-lg-mobile | 1.375rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-lg-desktop | 1.5rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-xl-mobile | 1.75rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-xl-desktop | 2rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-xxl-mobile | 2.25rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-font-size-xxl-desktop | 3rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |
| --nsw-border-radius | 0.25rem | Published responsive type reference and shared corner role. A mobile and desktop type pair is not a separate font family. |

## NSW Design System Pinned Runtime and Theme

### Use the native tab implementation

The specimen runs nsw-design-system 3.27.0. It imports the package CSS and the Tabs class, then initializes the single tab group after creating the markup. This focused initialization avoids registering unrelated components that are not present. The live documentation may describe a newer release; the downloadable code and token values here remain tied to the verified package.

### Separate components from application state

The native Tabs class owns tab selection, panel visibility and keyboard navigation. The application owns a Set of saved prompts. Moving between stages therefore leaves the reading list unchanged. This division is explicit in the source: there is no hidden global store, backend request or imitation of a government account.

## NSW Design System Brand Roles and Readable Surfaces

### Use the dark and light roles as a pair

The default dark brand color is #002664, while the light surface is #CBEDFD. The prompt panel uses the light role and a dark action. The active tab uses the package’s accent treatment. These are the actual theme roles, rather than an arbitrary blue palette chosen to suggest a public-sector site. The example does not use an official government logo.

### Interpret token names carefully

The text-light token is white. It belongs on a dark background and should not be used as a generic synonym for subdued text. Supporting stage text uses the darker neutral role instead. The reference includes status foreground/background pairs, but the workshop does not invent an error or success alert merely to display every available color.

## NSW Design System Public Sans and Responsive Scale

### Load the font before inspecting the layout

The example loads the public Public Sans 400 and 700 faces locally. The package defines mobile and desktop sizes separately: medium text grows from 1.125rem to 1.25rem, and the largest heading reference grows from 2.25rem to 3rem. These pairs help maintain reading hierarchy as the available width changes.

### Keep the content hierarchy modest

A short stage label precedes a descriptive heading, introduction, explanatory paragraph and one saved prompt. The page does not turn each sentence into a card. On narrow screens the reading list follows the stage panel, while the short three-label tab strip remains usable without squeezing the text into multiple lines.

## NSW Design System Tab Markup and Keyboard Behavior

### Let the component enhance real links

The starting tab list contains links to unique content IDs. Initialization adds the tablist/tab/tabpanel semantics, manages selection and sets the focusable tab. Keeping the href targets correct is necessary for the component to find its panels. Do not duplicate IDs when placing more than one tab group on a page.

- Keep every tab link matched to one panel ID.
- Initialize the group after inserting its markup.
- Let the native component manage selection and keyboard focus.

### Check keyboard selection as well as clicking

The native implementation responds to arrow-key navigation. The browser check focuses Prepare, presses ArrowRight and confirms Discuss becomes selected. That behavior is distinct from simply styling the last clicked label. A tab group is appropriate for these peer stages because a reader can move between them; it is not used to conceal required fields in a sequential submission.

## NSW Design System Saved Prompts and Honest Feedback

### Keep saved state independent of the visible tab

Each stage’s action toggles that prompt in a Set, updates aria-pressed and changes its label from Save to Remove. The reading-list count and entries are derived from that Set. Returning to a saved stage shows its selected state correctly. Clear reading list removes every selection and disables itself when there is nothing to clear.

### Explain the persistence boundary

The reading list is local page state and disappears on reload. The interface says so directly. A real persistent list would need an explicit storage model and restoration behavior; neither is implied here. The content is an original design-discussion study, not a service eligibility guide or a claim that an official NSW workflow has been reproduced.

## NSW Design System Complete Implementation and Review

### Reproduce the source with its dependencies

Create a Vite vanilla project, install nsw-design-system 3.27.0 and Public Sans, then save the supplied entry and nsw.css. Keep a root mount element. The full three-stage content, original prompts, native Tabs initialization and reading-list handlers are included. There is no pseudocode standing in for the save/reset behavior.

1. Install the pinned NSW package and Public Sans font files.
2. Save the full entry and nsw.css with a root mount element.
3. Save prompts in two different tabs and check retained state.
4. Use ArrowRight, clear the list and inspect the empty state.

### Keep tab navigation separate from saved content

Initialize the native Tabs class only after its link targets and panels exist. Matching fragment IDs form the enhancement contract: changing a panel ID without its href breaks the relationship even if the tab labels still look correct. If several groups share a page, give each group distinct IDs.

Treat the reading list as application state outside the tab instance. A prompt’s saved state must survive panel changes, and aria-pressed must reflect that state when the panel returns. Use tabs for peer content that readers may revisit; a sequential form requiring completed steps needs a different navigation model. Persistence would also require an explicit storage and restoration policy rather than silently changing this page-only example.

## Component Examples

### main.js — complete native tab and reading-list example

Includes all original stage content, tab initialization and complete save/remove/reset logic.

```javascript
import Tabs from 'nsw-design-system/src/components/tabs/tabs.js';
import 'nsw-design-system/css';
import '@fontsource/public-sans/latin-400.css';
import '@fontsource/public-sans/latin-700.css';
import './nsw.css';
const sessions=[['Prepare','Choose one question to explore','Start with a clear outcome rather than a long list of activities.','Write a one-sentence purpose. Identify the people who can answer the question and the evidence you already have.'],['Discuss','Make room for different views','Use a short, structured discussion to compare observations.','Ask participants to describe what they noticed before proposing solutions. Keep a separate record of assumptions that need evidence.'],['Review','Turn observations into a next step','End with an action that has an owner and a clear reason.','Choose one improvement to investigate. Record what would count as success and when the group will review the result.']];
document.getElementById('root').innerHTML=`<main><p class="eyebrow">NSW DESIGN SYSTEM / ORIGINAL WORKSHOP STUDY</p><h1>Plan a focused discussion</h1><p class="nsw-intro">Move between three stages and save useful prompts to a local reading list.</p><div class="layout"><section class="nsw-tabs js-tabs"><ul class="nsw-tabs__list">${sessions.map(([name],i)=>`<li><a href="#session-${i}">${name}</a></li>`).join('')}</ul>${sessions.map(([name,title,lead,body],i)=>`<section id="session-${i}" class="nsw-tabs__content"><p class="step">STAGE ${i+1} / 3</p><h2>${title}</h2><p class="nsw-intro">${lead}</p><p>${body}</p><div class="prompt"><h3>Prompt to keep</h3><blockquote>${['What do we need to understand before choosing a solution?','Which observations are shared, and where do they differ?','What is the smallest next step that would reduce uncertainty?'][i]}</blockquote><button class="nsw-button nsw-button--dark save" data-index="${i}" aria-pressed="false">Save this prompt</button></div></section>`).join('')}</section><aside><h2>Your reading list</h2><p id="count" role="status">0 prompts saved</p><ul id="saved"></ul><p id="empty">Save a prompt from any stage. Changing tabs keeps your selection.</p><button class="nsw-button nsw-button--white" id="clear" disabled>Clear reading list</button><p class="note">This is an original local study using NSW 3.27.0 tabs and CSS. Nothing is stored after reloading.</p></aside></div></main>`;
new Tabs(document.querySelector('.js-tabs')).init();const saved=new Set();const $=id=>document.getElementById(id);function render(){$('count').textContent=saved.size+' prompt'+(saved.size===1?'':'s')+' saved';$('saved').replaceChildren(...[...saved].sort().map(i=>{const li=document.createElement('li');li.textContent=sessions[i][0]+': '+sessions[i][1];return li}));$('empty').hidden=saved.size>0;$('clear').disabled=!saved.size;document.querySelectorAll('.save').forEach(b=>{const yes=saved.has(Number(b.dataset.index));b.setAttribute('aria-pressed',String(yes));b.textContent=yes?'Remove saved prompt':'Save this prompt'})}document.querySelectorAll('.save').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.index);saved.has(i)?saved.delete(i):saved.add(i);render()}));$('clear').addEventListener('click',()=>{saved.clear();render()});

```

[Code reference](https://designsystem.nsw.gov.au/components/tabs/index.html)

- The NSW class owns tabs; the Set owns the original reading list.

### nsw.css — original responsive composition

Layout and prompt surfaces using the published semantic theme roles.

```css
body{margin:0}main{max-width:1240px;padding:32px;margin:auto}.eyebrow,.step{font-size:14px;letter-spacing:.05em;font-weight:700}.eyebrow{color:var(--nsw-brand-dark)}h1{max-width:24ch}.layout{display:grid;grid-template-columns:1.8fr 1fr;gap:32px;margin-top:40px}.nsw-tabs__content{min-height:0}.prompt{margin-top:32px;padding:24px;background:var(--nsw-brand-light)}.prompt h3{margin-top:0}.prompt blockquote{margin:16px 0 24px;padding:0;border:0;font-size:20px;line-height:1.5}.step{margin-top:0;color:var(--nsw-grey-02)}aside{padding:24px;border-top:4px solid var(--nsw-brand-dark);background:var(--nsw-off-white);align-self:start}aside h2{font-size:24px;margin-top:0}aside li{margin:16px 0}aside ul{padding-left:24px}.note{font-size:14px;margin-top:24px}button:disabled{opacity:.5;cursor:not-allowed}[hidden]{display:none!important}@media(max-width:760px){main{padding:20px}.layout{grid-template-columns:1fr}h1{font-size:36px}.prompt{padding:20px}}

```

[Code reference](https://designsystem.nsw.gov.au/get-started/for-developers.html)

- The supporting stage label uses a dark neutral; --nsw-text-light is white.

## Implementation Starting Point

Native tab clicks and arrow keys, retained saved state, clearing and responsive layout were tested locally.

```sh
npm create vite@latest nsw-workshop -- --template vanilla
cd nsw-workshop
npm install
npm install nsw-design-system@3.27.0 @fontsource/public-sans
# Replace src/main.js and add src/nsw.css. Keep <div id="root"></div>.
npm run dev
```

## Agent Prompt

Build the NSW workshop guide with native Tabs from 3.27.0, Public Sans and actual semantic roles. Maintain unique panel IDs, keyboard selection, independent saved-prompt state and a useful empty reading list. Make the local-only persistence boundary clear and avoid official service claims.

## Sources

- [Tabs](https://designsystem.nsw.gov.au/components/tabs/index.html) — Peer-content navigation and native behavior.
- [Developer integration](https://designsystem.nsw.gov.au/get-started/for-developers.html) — Package, stylesheet and JavaScript setup.
- [Typography](https://designsystem.nsw.gov.au/core/typography/index.html) — Public Sans and type hierarchy.
- [Versioned implementation](https://github.com/digitalnsw/nsw-design-system) — Theme exports and Tabs source.
