# Wonderflow Wanda Design System — OpenDesign Application Guide

Use Wanda’s real theme roles and token syntax in a complete feedback-reading workspace with topic filters, expandable evidence context and a persistent local notebook.

An OpenDesign application study using Wanda themes and tokens 16.0.0. The interface is original HTML, not the native Wanda React runtime. Every quotation is authored sample content, not customer evidence.

## Source Reference

- **Theme version:** 16.0.0 light and dark roles ([source](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens))
- **Token syntax:** token() is build-time; var() is runtime ([source](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens))
- **Example data:** Five authored observations, no customer evidence ([source](https://design.wonderflow.ai/))


## Design Reference

@wonderflow/themes 16.0.0 light/dark JSON and @wonderflow/tokens 16.0.0 web token JSON, verified against the public developer documentation.

### Theme roles with light and dark values

[Official reference](https://design.wonderflow.ai/get-started/documentation/develop/using-themes)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --global-foreground | light hsl(221 10% 30%) / dark hsl(220 16% 85%) | Paired theme role consumed by the feedback specimen. |
| --global-background | light hsl(0 0% 100%) / dark hsl(0 0% 0%) | Paired theme role consumed by the feedback specimen. |
| --global-interactive-text | light hsl(214 66% 44%) / dark hsl(206 72% 67%) | Paired theme role consumed by the feedback specimen. |
| --cta-default | light hsl(0 100% 44%) / dark hsl(0 100% 44%) | Paired theme role consumed by the feedback specimen. |
| --cta-dark | light hsl(0 100% 38%) / dark hsl(0 100% 38%) | Paired theme role consumed by the feedback specimen. |
| --cta-foreground | light hsl(0 0% 100%) / dark hsl(0 0% 100%) | Paired theme role consumed by the feedback specimen. |
| --dimmed-0 | light hsl(210 20% 98%) / dark hsl(225 11% 7%) | Paired theme role consumed by the feedback specimen. |
| --dimmed-1 | light hsl(220 19% 91%) / dark hsl(218 11% 14%) | Paired theme role consumed by the feedback specimen. |
| --dimmed-2 | light hsl(220 16% 85%) / dark hsl(219 13% 22%) | Paired theme role consumed by the feedback specimen. |
| --highlight-green-background | light hsl(149 100% 91%) / dark hsl(166 100% 13%) | Paired theme role consumed by the feedback specimen. |
| --highlight-green-foreground | light hsl(156 100% 23%) / dark hsl(145 76% 75%) | Paired theme role consumed by the feedback specimen. |
| --highlight-red-background | light hsl(343 100% 96%) / dark hsl(350 100% 15%) | Paired theme role consumed by the feedback specimen. |
| --highlight-red-foreground | light hsl(351 92% 37%) / dark hsl(351 100% 81%) | Paired theme role consumed by the feedback specimen. |
| --highlight-yellow-background | light hsl(60 100% 89%) / dark hsl(22 100% 19%) | Paired theme role consumed by the feedback specimen. |
| --highlight-yellow-foreground | light hsl(25 100% 34%) / dark hsl(38 100% 77%) | Paired theme role consumed by the feedback specimen. |

### Space primitives

[Official reference](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --space-4 | 0.250rem | Use via token() at build time or import the CSS custom-property file. |
| --space-8 | 0.500rem | Use via token() at build time or import the CSS custom-property file. |
| --space-16 | 1.000rem | Use via token() at build time or import the CSS custom-property file. |
| --space-24 | 1.500rem | Use via token() at build time or import the CSS custom-property file. |
| --space-32 | 2.000rem | Use via token() at build time or import the CSS custom-property file. |
| --space-48 | 3.000rem | Use via token() at build time or import the CSS custom-property file. |

### Radius primitives

[Official reference](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --radius-4 | 0.250rem | Use via token() at build time or import the CSS custom-property file. |
| --radius-8 | 0.500rem | Use via token() at build time or import the CSS custom-property file. |
| --radius-16 | 1.000rem | Use via token() at build time or import the CSS custom-property file. |
| --radius-24 | 1.500rem | Use via token() at build time or import the CSS custom-property file. |

### Breakpoint primitives

[Official reference](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --breakpoint-extra-small | 30em | Use via token() at build time or import the CSS custom-property file. |
| --breakpoint-small | 48em | Use via token() at build time or import the CSS custom-property file. |
| --breakpoint-medium | 60em | Use via token() at build time or import the CSS custom-property file. |
| --breakpoint-large | 80em | Use via token() at build time or import the CSS custom-property file. |

### Duration primitives

[Official reference](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --duration-100 | 0.10s | Use via token() at build time or import the CSS custom-property file. |
| --duration-200 | 0.20s | Use via token() at build time or import the CSS custom-property file. |
| --duration-250 | 0.25s | Use via token() at build time or import the CSS custom-property file. |
| --duration-300 | 0.30s | Use via token() at build time or import the CSS custom-property file. |

## Wonderflow Wanda Design System Primitives, Themes and CSS Usage

### Understand the two levels of color

Wanda’s primitive color tokens are HSL channels such as 214 66% 44%, without the hsl() wrapper. Theme roles such as --global-interactive-text resolve to a complete CSS color. Wrapping a complete theme value again would be invalid; omitting hsl() around primitive channels is also invalid. The table records complete role values and ordinary dimensions separately.

### Choose build-time or runtime tokens deliberately

The documented token() notation is processed by Wanda’s PostCSS configuration. It is not a browser CSS function. A plain HTML project can instead import the published tokens.css and use var(). The working specimen uses the published themes.css with standard custom properties, so it does not require a hidden PostCSS build step.

## Wonderflow Wanda Design System Light and Dark Theme Roles

### Switch the semantic surface together

Wanda exposes light and dark theme mappings. The specimen changes data-theme on the root and lets the theme stylesheet replace foreground, surface, border and highlight roles together. Selection and saved notes remain unchanged because a theme switch is presentation state, not a reset of research state.

### Reserve the CTA role for the main local action

The red CTA pair is used once for reviewing saved notes. Topic tags use neutral highlight roles, while sentiment tags use green, yellow and red pairs. Each tag also has a written sentiment, so a color-vision difference does not erase meaning. The specimen does not invent a separate accent palette for each card.

## Wonderflow Wanda Design System Feedback Content and Evidence Boundaries

### Keep the observation separate from the interpretation

Each card contains an authored observation and an expandable context note. The context describes what the sample illustrates and explicitly avoids frequency or severity claims. A real feedback tool should preserve the source and analysis boundary instead of turning a single quote into an unsupported trend.

### Do not manufacture proof with decoration

The example has no fabricated customer identities, star ratings or model confidence scores. Five authored notes are enough to demonstrate filtering, disclosure and saved state. In a live product, research provenance and access rules belong in the data contract; an attractive quotation card cannot supply them.

## Wonderflow Wanda Design System Filtering and Notebook State

### Combine topic and sentiment constraints

The two native selects apply an AND filter. A combination with no matching note produces a visible recovery message and a reset action. The result count states its denominator, five authored notes, rather than suggesting a count from a larger dataset. All of this is visible in the complete source.

### Keep saved notes independent of visibility

Saving adds a note to a local Set. Filtering can hide that card without removing it from the notebook. Toggling a saved note clears any old review result, keeping confirmation aligned with current selection. The notebook lists the actual text, making its contents inspectable instead of showing only a badge count.

## Wonderflow Wanda Design System Cards, Disclosure and Responsive Layout

### Use spacing to separate evidence from controls

Each note card uses a 16px radius and 24px internal spacing on a wide screen. Tags introduce the topic, the quote has a larger text size, and the expandable context sits before the save action. The notebook occupies a quieter surface beside the notes. These are original composition choices expressed with Wanda’s values, not a claim of a native research-card component.

### Keep the mobile reading sequence intact

At 768px the notebook moves after the observations, and card padding reduces to 16px. The topic and sentiment controls become full-width rows. Expanded context remains in the document flow; it does not overlay or obscure another note. Cards have no fixed heights, so longer quotes remain readable.

## Wonderflow Wanda Design System Native React Setup and HTML Boundary

### Account for the complete Wanda toolchain

Official installation uses react-components, themes, symbols and tokens, with @wonderflow/config providing the required PostCSS setup for component CSS. The React entry imports core.css and the themes package. Installing only react-components and assuming all theme roles exist is an incomplete integration. The public installation page also warns about Tailwind compatibility for versions above 10.6.

### Use this specimen without claiming native components

The executed preview uses Wanda 16.0.0 theme CSS with original semantic HTML. It does not run the React Button, Select or disclosure components. That boundary is deliberate and visible: the complete source can be run with a static server, while a native React migration must verify the current component APIs and build configuration.

## Wonderflow Wanda Design System Complete Source and Agent Review

### Reproduce the actual preview

Install the pinned theme package, copy its generated themes.css beside the supplied index.html and wanda.css, and serve the directory. The source includes all five notes, filtering, disclosure, saved state and feedback. The preview bundles the same stylesheet locally to avoid a runtime network dependency.

1. Install @wonderflow/themes 16.0.0 and copy its generated CSS.
2. Save the complete index.html and wanda.css files.
3. Filter to an empty result, reset, and save a note.
4. Switch the theme and confirm the notebook remains intact.

### Review failure and transition states

Ask the agent to retain the filter denominator, empty recovery, saved-note persistence and review invalidation. Check both appearances and a long expanded note. The local review only summarizes selected samples; it must not be relabeled as AI analysis or customer validation without a separate implementation and evidence source.

- Do not treat token() as runtime CSS.
- Keep primitive HSL channels distinct from complete theme colors.
- Keep authored samples distinct from real research evidence.

## Component Examples

### index.html — complete feedback workspace

Original semantic HTML and all application state. Uses the copied Wanda theme stylesheet.

```html
<!doctype html><html lang="en" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Feedback study</title><link rel="stylesheet" href="wanda-theme.css"><link rel="stylesheet" href="wanda.css"><body><main><header><div><span class="eyebrow">PRODUCT RESEARCH / AUTHORED SAMPLE NOTES</span><h1>Explore the feedback</h1><p>Read individual observations before turning a theme into a decision.</p></div><button id="theme" aria-pressed="false">Dark theme</button></header><div class="filters"><label>Topic <select id="topic" aria-label="Topic"><option value="all">All topics</option><option>Setup</option><option>Search</option><option>Export</option></select></label><label>Sentiment <select id="sentiment" aria-label="Sentiment"><option value="all">All sentiments</option><option value="positive">Positive</option><option value="mixed">Mixed</option><option value="negative">Negative</option></select></label><button id="reset">Reset filters</button></div><div class="workspace"><section><div class="section-heading"><h2>Sample observations</h2><span id="count" role="status"></span></div><div id="notes"></div><div id="empty" hidden><h3>No observations match</h3><p>Clear a filter to see the authored examples again.</p></div></section><aside><h2>Research notebook</h2><p>Save observations to keep them together while comparing topics.</p><ul id="saved"></ul><p id="hint">No observations saved yet.</p><button class="cta" id="review">Review saved notes</button><p id="result" role="status"></p></aside></div><footer>Original interface using Wanda 16.0.0 theme and token values. All quotations are written for this specimen, not real customer feedback or research findings.</footer></main>
<script>
const data=[{id:1,topic:'Setup',sentiment:'positive',quote:'The first checklist made it clear what I needed to prepare.',context:'Authored onboarding observation; one sample, not a measured trend.'},{id:2,topic:'Search',sentiment:'negative',quote:'I could not tell whether the filter was still active after I changed the search.',context:'Authored state-visibility observation; investigate with actual users.'},{id:3,topic:'Export',sentiment:'mixed',quote:'The file was useful, but I wanted to check the included columns first.',context:'Authored export observation; no frequency or severity estimate.'},{id:4,topic:'Setup',sentiment:'mixed',quote:'I understood the steps but needed an explanation of one unfamiliar term.',context:'Authored terminology observation; the term is intentionally unspecified.'},{id:5,topic:'Search',sentiment:'positive',quote:'Seeing a count beside each topic helped me narrow the list.',context:'Authored topic-navigation observation; not an endorsement.'}];const saved=new Set();const $=id=>document.getElementById(id);function render(){const visible=data.filter(n=>($('topic').value==='all'||n.topic===$('topic').value)&&($('sentiment').value==='all'||n.sentiment===$('sentiment').value));$('count').textContent=visible.length+' of '+data.length+' notes';$('empty').hidden=!!visible.length;$('notes').replaceChildren(...visible.map(n=>{let a=document.createElement('article');a.innerHTML=`<div class="tags"><span>${n.topic}</span><span class="${n.sentiment}">${n.sentiment}</span></div><blockquote>${n.quote}</blockquote><details><summary>Read sample context</summary><p>${n.context}</p></details><button class="save" aria-pressed="${saved.has(n.id)}" aria-label="${saved.has(n.id)?'Remove':'Save'} note ${n.id}">${saved.has(n.id)?'Saved to notebook':'Save to notebook'}</button>`;a.querySelector('.save').onclick=()=>{saved.has(n.id)?saved.delete(n.id):saved.add(n.id);$('result').textContent='';render()};return a}));$('saved').replaceChildren(...data.filter(n=>saved.has(n.id)).map(n=>{let l=document.createElement('li');l.textContent=n.topic+': '+n.quote;return l}));$('hint').hidden=!!saved.size}
$('topic').onchange=render;$('sentiment').onchange=render;$('reset').onclick=()=>{$('topic').value='all';$('sentiment').value='all';render()};$('review').onclick=()=>{$('result').textContent=saved.size?`${saved.size} authored notes ready for local review. No analysis has been generated.`:'Save a note before reviewing.'};$('theme').onclick=()=>{const dark=$('theme').getAttribute('aria-pressed')!=='true';$('theme').setAttribute('aria-pressed',dark);document.documentElement.dataset.theme=dark?'dark':'light'};render();
</script>
</body></html>
```

[Code reference](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens)

- Save as index.html beside wanda.css and wanda-theme.css.

### wanda.css — composition with real theme roles

Responsive cards and notebook layout consume the published custom properties.

```css
*{box-sizing:border-box}body{margin:0;background:var(--global-background);color:var(--global-foreground);font:16px/1.5 system-ui,sans-serif}main{padding:32px}header{display:flex;align-items:start;justify-content:space-between;gap:24px;border-bottom:1px solid var(--dimmed-1);padding-bottom:24px}h1{font-size:32px;line-height:1.25;margin:8px 0 16px}h2{font-size:20px;margin:0}h3{font-size:18px}.eyebrow,footer{font-size:12px}p{margin:8px 0 16px}.filters{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:24px 0}label{display:flex;gap:8px;align-items:center}button,select{background:var(--global-background);color:var(--global-foreground);font:inherit;padding:8px 16px;min-height:44px;border:1px solid var(--dimmed-2);border-radius:8px}button{cursor:pointer}.workspace{display:grid;grid-template-columns:1.7fr 1fr;gap:32px}.section-heading{display:flex;justify-content:space-between;gap:16px;margin-bottom:16px}#count{font-size:14px}article{padding:24px;border:1px solid var(--dimmed-1);border-radius:16px;margin-bottom:16px}.tags{display:flex;gap:8px;font-size:12px}.tags span{padding:4px 8px;background:var(--highlight-gray-background);color:var(--highlight-gray-foreground);border-radius:4px}.tags .positive{background:var(--highlight-green-background);color:var(--highlight-green-foreground)}.tags .negative{background:var(--highlight-red-background);color:var(--highlight-red-foreground)}.tags .mixed{background:var(--highlight-yellow-background);color:var(--highlight-yellow-foreground)}blockquote{margin:16px 0;font-size:20px;line-height:1.4}details{font-size:14px;margin:16px 0}summary{cursor:pointer;color:var(--global-interactive-text)}.save{font-size:14px}.save[aria-pressed=true]{border-color:var(--global-interactive-text);color:var(--global-interactive-text)}aside{background:var(--dimmed-0);padding:24px;border-radius:16px;align-self:start}aside p,aside li{font-size:14px}aside ul{padding-left:20px}aside li{margin:16px 0}.cta{background:var(--cta-default);color:var(--cta-foreground);border-color:var(--cta-default)}.cta:hover{background:var(--cta-dark)}button:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid var(--global-interactive-text);outline-offset:3px}footer{border-top:1px solid var(--dimmed-1);padding-top:16px;margin-top:32px}#empty{padding:24px;background:var(--dimmed-0);border-radius:16px}[hidden]{display:none!important}@media(max-width:767px){main{padding:16px}.workspace{grid-template-columns:1fr;gap:24px}header{display:block}header button{margin-top:8px}.filters label{width:100%;justify-content:space-between}.filters select{flex:1}article{padding:16px}h1{font-size:28px}.section-heading{align-items:center}}

```

[Code reference](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens)

- Theme values come from the installed package, not a synthetic palette.

## Implementation Starting Point

The local preview bundles the same published theme CSS. The HTML application needs no PostCSS or React.

```sh
npm install @wonderflow/themes@16.0.0
cp node_modules/@wonderflow/themes/dist/themes.css wanda-theme.css
# Save the complete index.html and wanda.css examples beside that file.
python3 -m http.server 8080
```

## Agent Prompt

Build a feedback notebook with Wanda 16.0.0 theme roles using the complete original HTML example. Preserve AND filtering, an explicit five-note denominator, expanded context, saved-state persistence and stale review clearing. Keep token() build-time usage separate from CSS variables, and never present authored observations as customer research.

## Sources

- [Design tokens](https://design.wonderflow.ai/get-started/documentation/develop/design-tokens) — HSL channel format, token(), CSS and JavaScript access.
- [Installation](https://design.wonderflow.ai/get-started/documentation/develop/installation) — Native package set, PostCSS setup and compatibility notes.
- [Using themes](https://design.wonderflow.ai/get-started/documentation/develop/using-themes) — Theme keys, data-theme and consumer responsibilities.
- [Wanda overview](https://design.wonderflow.ai/) — System scope and public documentation entry.
