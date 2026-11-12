# Skeleton Design System — OpenDesign Application Guide

Compare Skeleton 5.0.1’s real Cerberus, Mint and Rose themes through a complete reading desk with live token inspection, dark surface pairings and reversible local state.

Actual Skeleton Tailwind CSS utilities and shipped themes, with original plain-JavaScript page behavior. No Skeleton Svelte or React runtime is loaded.

## Source Reference

- **Theme package:** @skeletonlabs/skeleton 5.0.1 ([source](https://cdn.jsdelivr.net/npm/@skeletonlabs/skeleton@5.0.1/package.json))
- **Runtime:** Compiled Tailwind CSS + original JavaScript ([source](https://www.skeleton.dev/docs/svelte/get-started/fundamentals))
- **Reference entries:** 40 theme values and integration rules ([source](https://www.skeleton.dev/docs/svelte/design/themes))


## Design Reference

Pinned Skeleton 5.0.1 theme files, compiled CSS utility behavior and explicit original composition choices.

### Cerberus theme values

[Official reference](https://cdn.jsdelivr.net/npm/@skeletonlabs/skeleton@5.0.1/src/themes/cerberus.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --spacing | 0.25rem | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --radius-base | 0.5rem | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --typo-base--font-family | system-ui | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --typo-heading--font-weight | bold | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-100 | oklch(0.84 0.08 254.62) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-300 | oklch(0.7 0.15 254.36) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-500 | oklch(0.57 0.21 258.29) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-700 | oklch(0.46 0.17 257.78) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-900 | oklch(0.34 0.11 257.14) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-surface-50 | oklch(0.99 0 0) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-surface-950 | oklch(0.18 0 0) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |

### Mint theme values

[Official reference](https://cdn.jsdelivr.net/npm/@skeletonlabs/skeleton@5.0.1/src/themes/mint.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --spacing | 0.25rem | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --radius-base | 0.375rem | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --typo-base--font-family | system-ui, sans-serif | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --typo-heading--font-weight | normal | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-100 | oklch(89.8% 0.08 156.34deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-300 | oklch(86.28% 0.13 151.76deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-500 | oklch(83.57% 0.18 148.98deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-700 | oklch(71.28% 0.15 148.61deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-900 | oklch(58.17% 0.13 148.16deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-surface-50 | oklch(89.13% 0.03 155.27deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-surface-950 | oklch(21.88% 0.02 186.33deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |

### Rose theme values

[Official reference](https://cdn.jsdelivr.net/npm/@skeletonlabs/skeleton@5.0.1/src/themes/rose.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --spacing | 0.25rem | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --radius-base | 0.375rem | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --typo-base--font-family | Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --typo-heading--font-weight | normal | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-100 | oklch(92.93% 0.03 340.64deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-300 | oklch(81.16% 0.08 345.32deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-500 | oklch(69.89% 0.13 348.12deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-700 | oklch(57.25% 0.1 346.44deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-primary-900 | oklch(43.55% 0.07 343deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-surface-50 | oklch(96.76% 0.01 318.08deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |
| --color-surface-950 | oklch(25.82% 0.01 304.87deg) | Actual theme declaration. These values change together when data-theme selects this imported theme; the original reading state remains unchanged. |

### CSS integration and semantic pairings

[Official reference](https://www.skeleton.dev/docs/svelte/get-started/fundamentals)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Foundation import | @import "@skeletonlabs/skeleton" | Load after Tailwind so the utility definitions are compiled. |
| Theme selection | data-theme="cerberus" / "mint" / "rose" | Only imported themes can provide their variables. |
| Class-based appearance | @custom-variant dark (&:where(.dark, .dark *)) | Makes the original appearance button affect the actual compiled dark variant. |
| Surface pairings | light-dark(light value, dark value) | Skeleton’s globals set color-scheme; simply changing a class without a matching variant is insufficient. |
| Filled action | btn preset-filled-primary-500 | Combines native button geometry with a theme-aware preset. |
| Supporting action | btn preset-tonal-primary | Uses a tonal pairing appropriate to the current appearance. |
| Disclosure | details.disclosure > summary | Native browser open state with Skeleton CSS; no Svelte component initialization is involved. |

## Skeleton Design System CSS Foundations and Framework Layers

### Choose the layer that actually runs

The reading desk uses @skeletonlabs/skeleton 5.0.1, its Tailwind CSS utilities and three shipped themes. It does not load skeleton-svelte or skeleton-react. The buttons, badge, chip, card and disclosure presentation are genuine CSS utilities; the theme selector and saved-state logic are original JavaScript. That boundary lets the complete example run as a small Vite page without implying a framework component runtime.

### Compile the utilities instead of importing raw CSS into a browser

Skeleton’s source contains Tailwind directives such as @utility and @variant. The provided Vite configuration includes @tailwindcss/vite, and the stylesheet imports Tailwind before Skeleton and the chosen themes. A raw link to the source package would not reproduce the compiled styles. The full build source is included so the preview is not dependent on hidden generated CSS.

1. Import Tailwind CSS.
2. Import Skeleton utilities.
3. Import each theme you want to select.
4. Compile the stylesheet with the Tailwind Vite plugin.

## Skeleton Design System Theme Selection and Actual Values

### Import each available theme explicitly

Cerberus, Mint and Rose are each imported from the package’s themes path. Selecting a name changes data-theme on the root, which selects the corresponding variable declarations. The reference lists real primary palette samples, surface extremes, spacing, radius and font declarations for each theme. These values are read from the pinned files rather than generated by swapping one accent color.

- Cerberus is the initial presentation.
- Mint and Rose are actual separately imported themes.
- Theme selection changes data-theme, not a copied content tree.

### Keep the same complete content during comparison

The reading card, checklist and saved state remain intact when the theme changes. The side panel reads computed variables from the root after each selection, showing what the browser actually resolved. This makes the comparison useful: typography, shape and palette can change while the reader judges the same content and state.

## Skeleton Design System Dark Appearance and Color-Scheme

### Wire the dark variant to the actual control

The stylesheet defines a class-based dark variant matching .dark on the root or its descendants. Skeleton’s global rules use that variant to set color-scheme. The appearance button therefore changes the conditions used by light-dark() surface pairings. A toggle that changes a class but leaves Tailwind’s default media-based variant untouched can report Dark while the actual surfaces remain light.

### Use a preset that remains legible

The appearance action uses preset-tonal-primary, and the reading action uses preset-filled-primary-500. Presets control the relationship between surface and foreground; a color token alone does not establish readable contrast. The actual dark rendered state was inspected after switching to Rose, including the control text and disclosure, rather than assuming a successful class change proved visual correctness.

## Skeleton Design System Typography, Shape and Layout

### Separate theme declarations from original hierarchy

Cerberus declares a system font, while Rose includes a different fallback stack. No remote font is fetched by this study; the browser uses available fonts in the selected stack. The original layout assigns a 36px page heading and 28px reading heading explicitly. Those composition choices remain distinct from the theme’s own family and weight declarations.

### Let radius and spacing come from the theme

The palette samples use --radius-base, so their corner shape changes with the selected theme. The complete reference also exposes --spacing. The outer two-column layout uses a 24px gap and becomes one column below 720px; these are original composition decisions. A theme does not decide the information architecture or force every page to share an identical grid.

## Skeleton Design System Reading State and Presentation Reset

### Keep saving local and reversible

The reading action toggles aria-pressed, changes its label and updates a readable status message. It saves only an in-memory boolean for this page. There is no account, persistence or network request. The same state remains visible after changing themes, allowing readers to compare an active state across palettes.

### Reset presentation without deleting reading state

Reset presentation returns to Cerberus and light appearance but deliberately leaves the saved boolean unchanged. Its label describes that scope. A separate action can remove the reading card from the local desk. Conflating these two actions would make a harmless visual reset unexpectedly discard a user’s current choice.

## Skeleton Design System Native Disclosure and Real Content

### Use a browser details element

The supporting explanation is a real details/summary structure with the disclosure utility. Keyboard and pointer opening are provided by the browser, while Skeleton supplies its presentation. This is not the Skeleton Svelte Accordion component, and no component API or event is fabricated. The paragraph contains a concrete explanation of what changes and what stays fixed.

### Inspect the open state after its transition

The stylesheet can animate disclosure sizing. The visual check waits for the transition before capturing the open state; an immediate screenshot can catch the content partway through expansion. Layout validation includes the opened paragraph and the long computed font stack so the side panel cannot pass only while its substantial content is hidden.

## Skeleton Design System Responsive Theme Inspection

### Keep values readable on narrow screens

The workbench stacks below 720px, and outer padding reduces to 16px. Each computed token name and value occupies its own row, allowing long font stacks and OKLCH strings to wrap rather than force horizontal scrolling. The five color samples remain visible in a compact grid, and theme controls wrap onto additional lines.

### Test theme and state combinations

The browser test saves the reading card, switches through Mint and Rose, enables dark appearance, opens the disclosure and then resets presentation. The saved state must survive throughout. This sequence was checked down to 280px, so the test covers the real long values and expanded content instead of a single initial theme screenshot.

## Skeleton Design System Complete Vite Source

### Save all four source files

The example includes index.html, style.css, main.js and vite.config.mjs. Install the pinned Skeleton, Tailwind and Vite dependencies, then run Vite in that directory. The explicit @source points to the HTML containing the utility classes, ensuring the compiled output includes the classes used by the reading desk. There is no missing framework scaffold.

### Choose framework components separately when needed

A product requiring a Skeleton Svelte or React component should use the corresponding framework package and its documented setup. This CSS-based example remains useful for understanding the shared themes and utility layer, but it does not claim the same API as those components. Keep that distinction when adapting the supplied guide for an agent.

## Component Examples

### index.html

Complete reading content, native CSS components and original controls.

```html
<!doctype html><html lang="en" data-theme="cerberus"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Theme reading desk</title></head><body><main><header><div><p class="text-sm font-bold">SKELETON / THEME READING DESK</p><h1>The same content, three themes.</h1><p class="intro">Inspect actual Skeleton 5.0.1 palettes, surface pairings and native CSS components while keeping a complete reading card in view.</p></div><span class="badge preset-tonal-primary">Original OpenDesign study</span></header><div class="controls"><label for="theme">Theme<select id="theme" class="select"><option value="cerberus">Cerberus</option><option value="mint">Mint</option><option value="rose">Rose</option></select></label><button id="mode" class="btn preset-tonal-primary">Use dark appearance</button><button id="reset" class="btn preset-tonal-surface">Reset presentation</button></div><div class="workbench"><article class="card preset-outlined-surface-200-800 reading"><span class="chip preset-tonal-primary">Reading / 4 minutes</span><h2 class="mt-6">Make the next step easier to see</h2><p>A useful interface explains the next action without making every detail compete for attention. Start with a complete piece of content, then inspect how its hierarchy survives a change of theme.</p><ul><li>Keep the heading clear in both appearances.</li><li>Use a supporting surface to group related information.</li><li>Repeat an important state in text, not color alone.</li></ul><button id="bookmark" class="btn preset-filled-primary-500 bookmark" aria-pressed="false">Save to this reading desk</button><p id="message" role="status">This reading card is not saved.</p></article><aside class="card preset-tonal-surface side"><h2 class="text-xl font-bold">Current theme values</h2><div class="palette" aria-label="Primary palette samples"><div class="swatch" style="background:var(--color-primary-100)"></div><div class="swatch" style="background:var(--color-primary-300)"></div><div class="swatch" style="background:var(--color-primary-500)"></div><div class="swatch" style="background:var(--color-primary-700)"></div><div class="swatch" style="background:var(--color-primary-900)"></div></div><dl class="tokens" id="tokens"></dl><details class="disclosure mt-6"><summary class="preset-tonal-primary">What changes with the theme?</summary><p>The imported theme changes palette, typography declarations and shape variables. The reading text and local saved state stay the same. Dark appearance changes surface pairings; it is not a second copy of the content.</p></details></aside></div><p class="scope">Uses Skeleton’s actual Tailwind CSS utilities and three shipped themes. The page logic is original plain JavaScript; no Skeleton Svelte or React component runtime is loaded. Saving changes this page only and sends nothing.</p></main><script type="module" src="./main.js"></script></body></html>

```

[Code reference](https://www.skeleton.dev/docs/svelte/get-started/installation)

- Keep all four source files in one project directory.

### style.css

Theme imports, class-based dark variant and responsive composition.

```css
@import 'tailwindcss';
@import '@skeletonlabs/skeleton';
@import '@skeletonlabs/skeleton/themes/cerberus';
@import '@skeletonlabs/skeleton/themes/mint';
@import '@skeletonlabs/skeleton/themes/rose';
@source './index.html';
@custom-variant dark (&:where(.dark, .dark *));
body{margin:0}*{box-sizing:border-box}main{max-width:1080px;margin:auto;padding:32px}header{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:flex-start}h1{font-size:36px;line-height:1.15;font-weight:700;margin:16px 0}.intro{max-width:66ch;line-height:1.6}.controls{display:flex;gap:16px;align-items:end;flex-wrap:wrap;margin:32px 0}.controls label{display:grid;gap:8px}.workbench{display:grid;grid-template-columns:1.25fr 1fr;gap:24px}.reading{padding:32px}.reading h2{font-size:28px;line-height:1.25;font-weight:700}.reading p{line-height:1.7;margin:24px 0}.reading ul{list-style:disc;padding-left:24px}.reading li{margin:12px 0}.palette{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:24px 0}.swatch{height:72px;border-radius:var(--radius-base)}.tokens{display:grid;gap:12px;font-size:13px}.tokens div{display:grid;gap:8px;padding-bottom:12px;border-bottom:1px solid currentColor}.tokens dd{overflow-wrap:anywhere}.side{padding:24px}.disclosure p{padding:16px;line-height:1.6}.scope{font-size:13px;line-height:1.6;margin-top:32px}.bookmark{margin-top:24px}#message{font-size:14px;margin-top:16px}:focus-visible{outline:3px solid var(--color-primary-500);outline-offset:3px}@media(max-width:720px){main{padding:16px}.workbench{grid-template-columns:1fr}.reading{padding:24px}.palette{gap:4px}.swatch{height:56px}}

.workbench>*{min-width:0}.bookmark{max-width:100%;white-space:normal;height:auto;min-height:2rem;text-align:center}.disclosure summary{white-space:normal}

```

[Code reference](https://www.skeleton.dev/docs/svelte/get-started/installation)

- Keep all four source files in one project directory.

### main.js

Computed token inspection and independent reading/presentation state.

```javascript
import './style.css';
const root=document.documentElement;let saved=false;function inspect(){const style=getComputedStyle(root);const keys=['--color-primary-500','--radius-base','--spacing','--typo-base--font-family'];document.querySelector('#tokens').replaceChildren(...keys.map(key=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=style.getPropertyValue(key).trim();row.append(dt,dd);return row}));}document.querySelector('#theme').addEventListener('change',e=>{root.dataset.theme=e.target.value;inspect()});document.querySelector('#mode').addEventListener('click',e=>{let dark=root.classList.toggle('dark');e.currentTarget.textContent=dark?'Use light appearance':'Use dark appearance';inspect()});document.querySelector('#bookmark').addEventListener('click',e=>{saved=!saved;e.currentTarget.setAttribute('aria-pressed',String(saved));e.currentTarget.textContent=saved?'Remove from this reading desk':'Save to this reading desk';document.querySelector('#message').textContent=saved?'Saved in this preview only.':'This reading card is not saved.'});document.querySelector('#reset').addEventListener('click',()=>{root.dataset.theme='cerberus';root.classList.remove('dark');document.querySelector('#theme').value='cerberus';document.querySelector('#mode').textContent='Use dark appearance';inspect()});inspect();

```

[Code reference](https://www.skeleton.dev/docs/svelte/get-started/installation)

- Keep all four source files in one project directory.

### vite.config.mjs

Actual Tailwind compiler integration.

```javascript
import{defineConfig}from'vite';import tailwindcss from'@tailwindcss/vite';export default defineConfig({plugins:[tailwindcss()],base:'./',build:{cssCodeSplit:false}});

```

[Code reference](https://www.skeleton.dev/docs/svelte/get-started/installation)

- Keep all four source files in one project directory.

## Implementation Starting Point

Save the supplied four files first. This is the CSS utility layer and requires no Svelte or React runtime.

```sh
npm init -y
npm install @skeletonlabs/skeleton@5.0.1
npm install --save-dev tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 vite@8.3.2
npx vite --host 127.0.0.1
```

## Agent Prompt

Implement the complete Skeleton 5.0.1 reading desk using its actual CSS utilities and Cerberus/Mint/Rose theme imports. Preserve class-based dark color-scheme, readable computed token rows, complete content, local saved state and presentation reset that does not delete that state. Keep the CSS layer distinct from framework component APIs.

## Sources

- [Installation](https://www.skeleton.dev/docs/svelte/get-started/installation) — CSS and framework integration choices.
- [Themes](https://www.skeleton.dev/docs/svelte/design/themes) — Theme composition and selection.
- [Colors](https://www.skeleton.dev/docs/svelte/design/colors) — Palette and contrast pairings.
- [Dark appearance](https://www.skeleton.dev/docs/svelte/guides/mode) — Color-scheme and variant behavior.
- [Disclosures](https://www.skeleton.dev/docs/svelte/tailwind-components/disclosures) — Native details/summary CSS layer.
