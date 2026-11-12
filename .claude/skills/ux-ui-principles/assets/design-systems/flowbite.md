# Flowbite Design System — OpenDesign Application Guide

A native Flowbite 4 accordion and drawer composition, with verified semantic theme aliases, a persistent packing checklist and an accessible local materials-note workflow.

Flowbite 4.0.2 with its default theme. The packing content, decorative artwork and focus augmentation are original. Materials notes remain local.

## Source Reference

- **Library scope:** Open-source component library ([source](https://flowbite.com/))
- **Platform or architecture:** Built with Tailwind CSS ([source](https://github.com/themesberg/flowbite))
- **Integration:** JavaScript powers interactive components ([source](https://github.com/themesberg/flowbite))
- **Component support:** Documentation includes forms ([source](https://github.com/themesberg/flowbite))
- **Customization or behavior:** Documentation includes navigation and overlays ([source](https://github.com/themesberg/flowbite))
- **Additional capability:** Framework integrations are available separately ([source](https://github.com/themesberg/flowbite))


## Design Reference

Flowbite 4.0.2 default theme with Tailwind CSS 4.3.3. The named aliases below are actual Flowbite theme variables; their referenced ramps come from Tailwind. The packing illustration and application spacing choices are original.

### Default semantic text and status roles

[Official reference](https://github.com/themesberg/flowbite/blob/main/src/themes/default.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-body | var(--color-gray-600) | Normal explanatory text. |
| --color-body-subtle | var(--color-gray-500) | Supporting descriptions. |
| --color-heading | var(--color-gray-900) | Headings and high-emphasis labels. |
| --color-fg-brand | var(--color-blue-700) | Brand-colored foreground. |
| --color-fg-success | var(--color-emerald-700) | Success foreground. |
| --color-fg-danger | var(--color-rose-700) | Error foreground. |
| --color-fg-warning | var(--color-orange-900) | Warning foreground. |
| --color-fg-disabled | var(--color-gray-400) | Disabled foreground. |

### Default surfaces and borders

[Official reference](https://github.com/themesberg/flowbite/blob/main/src/themes/default.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-neutral-primary | var(--color-white) | Card and drawer surface. |
| --color-neutral-secondary | var(--color-gray-50) | Page background. |
| --color-neutral-tertiary | var(--color-gray-100) | Progress track. |
| --color-brand | var(--color-blue-700) | Primary action and packed progress. |
| --color-brand-soft | var(--color-blue-100) | Focus ring or soft brand surface. |
| --color-brand-softer | var(--color-blue-50) | Open accordion and illustration surface. |
| --color-brand-strong | var(--color-blue-800) | Action hover. |
| --color-default | var(--color-gray-200) | Standard component border. |
| --color-success-soft | var(--color-emerald-50) | Local result surface. |

### Default geometry and font variables

[Official reference](https://github.com/themesberg/flowbite/blob/main/src/themes/default.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --font-sans | 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' | Inter-first UI stack; preview uses available system fallback, no remote font. |
| --font-mono | 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace' | Code stack. |
| --radius-xxs | 2px | Two-pixel radius. |
| --radius-xs | 4px | Four-pixel radius. |
| --radius-sm | 6px | Six-pixel radius. |
| --radius | 8px | Eight-pixel radius. |
| --radius-base | 12px | Twelve-pixel panel radius used by rounded-base. |
| --radius-lg | 16px | Sixteen-pixel radius. |
| --default-border-width | 1px | One-pixel borders. |
| --leading-5 | 20px | Twenty-pixel leading. |
| --leading-6 | 24px | Twenty-four-pixel leading. |

### Tailwind layout values used by the example

[Official reference](https://tailwindcss.com/docs/theme)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| p-6 / md:p-10 | 1.5rem / 2.5rem | Page padding from Tailwind’s default quarter-rem spacing unit. |
| gap-8 | 2rem | Gap between packing categories and progress summary. |
| md breakpoint | 48rem | Switch to two columns. |
| text-sm / text-xl / text-3xl | 0.875rem / 1.25rem / 1.875rem | Body, section title and page title utilities. |
| w-96 / max-w-full | 24rem / 100% | Drawer width stays within the mobile viewport. |

## Flowbite Design System Four Adds a Named Default Theme

### Flowbite Four Adds a Named Default Theme

This example uses Flowbite 4.0.2, not an unversioned collection of old blue-and-gray snippets. Its default theme defines semantic aliases such as color-body, color-heading, color-brand and color-neutral-primary. The page imports that theme before applying the Flowbite Tailwind plugin, then uses corresponding classes such as text-heading and bg-brand.

The aliases point into Tailwind’s color ramps. For example, the normal brand action references blue-700, while its stronger hover role references blue-800. The specification preserves those references so a reader can distinguish the semantic role from a primitive color value. The packing artwork reuses the same brand roles without becoming an official Flowbite illustration.

[Supporting specification](https://flowbite.com/docs/getting-started/quickstart/)

## Flowbite Design System Theme Geometry and Tailwind Layout Work Together

### Theme Geometry and Tailwind Layout Work Together

The default theme’s radius-base is twelve pixels, used by rounded-base on the main containers, drawer controls and result notice. It also defines distinct two-, four-, six-, eight- and sixteen-pixel radii. Importing the theme therefore matters when a copied component uses the newer semantic class names.

Inter leads the supplied font stack, but this self-contained preview does not download a remote font. It uses the available system fallback. Page spacing follows Tailwind utilities: p-6 is one-and-a-half rem, gap-8 is two rem and the desktop p-10 is two-and-a-half rem. These layout utilities are not presented as a separate invented Flowbite spacing scale.

[Supporting specification](https://flowbite.com/docs/getting-started/quickstart/)

## Flowbite Design System One Accordion Instance Owns Three Categories

### One Accordion Instance Owns Three Categories

The JavaScript constructs an Accordion with an array of items. Every item has a stable ID, a trigger element and a target panel; the paper category starts active. alwaysOpen is false, so opening Tools closes Paper. Custom activeClasses and inactiveClasses use the default theme’s semantic foreground and surface names.

The class controls panel visibility and updates aria-expanded on its trigger. The markup provides aria-controls and matching panel IDs. The checklist inputs remain in the document while a panel is collapsed, so their checked state survives category changes. Collapsing a section is a visibility action, not a reset of the user’s packing work.

[Supporting specification](https://flowbite.com/docs/components/accordion/)

## Flowbite Design System Progress Is Derived from Actual Checkboxes

### Progress Is Derived from Actual Checkboxes

Six real checkboxes represent specific workshop materials. The application derives packed count, next item and remaining-item text from their current checked properties. The progress bar’s width and aria-valuenow update from that same count; no separate counter can drift away from the checklist.

Drawing sheets and tracing paper are separate choices because their preparation differs. The cutting mat describes a shared station, and the low-tack tape includes a wall-surface caution. Those concrete details make the expanded category useful; the accordion is not simply hiding repeated generic paragraphs.

1. Open Paper and mark Drawing sheets packed.
2. Open Tools, mark Pencils and markers packed, then return to Paper.
3. Check that both choices remain selected and the summary reports two of six.

[Supporting specification](https://flowbite.com/docs/forms/checkbox/)

## Flowbite Design System A Drawer Instance Handles Visibility and Backdrop

### A Drawer Instance Handles Visibility and Backdrop

The materials panel is initialized through new Drawer with placement right, backdrop true and bodyScrolling false. Opening the panel calls show; Close calls hide. The native Flowbite implementation applies the positioning and transition classes, backdrop and visibility attributes. This page deliberately uses the JavaScript API rather than mixing it with a second data-attribute initializer for the same panel.

The drawer width is twenty-four rem with max-w-full, so it remains usable at a narrow viewport. Its content can scroll vertically inside the panel. The page itself is sized by its content; the drawer’s h-screen is an intentional fixed overlay and does not create a minimum-height loop for the embedded page.

[Supporting specification](https://flowbite.com/docs/components/drawer/)

## Flowbite Design System Add Focus Management Around the Drawer Lifecycle

### Add Focus Management Around the Drawer Lifecycle

The onShow callback makes the background main element inert and focuses the Prepared by input. onHide removes inert and returns focus to Prepare materials note. A small keydown handler loops Tab and Shift+Tab between the panel’s first and last controls. These additions are visible in the complete source rather than assumed to be provided by a styling class.

Flowbite handles Escape for its drawer. The example’s callbacks ensure that whichever close path is used, the background becomes interactive again. The panel is labeled with aria-labelledby; the close control has an explicit accessible name. A real application should test this behavior alongside its own portals and routing, not treat a library name as a blanket accessibility guarantee.

[Supporting specification](https://flowbite.com/docs/components/drawer/)

## Flowbite Design System Validate the Owner and Save Only Local Text

### Validate the Owner and Save Only Local Text

Prepared by is required with minimum and maximum length constraints. The submit handler additionally trims the name and rejects whitespace-only input. Session note is optional and limited to 240 characters. The remaining-items summary is refreshed when the drawer opens, so it describes the current checklist rather than an earlier packing state.

Saving closes the drawer and announces a local note containing the owner, packed count and optional text. No email is sent and no shared document is created. User strings are assigned with textContent. Editing the packing checklist clears the old result notice because its previous count would otherwise become misleading.

[Supporting specification](https://flowbite.com/docs/forms/input-field/)

## Flowbite Design System Include Classes Generated by the JavaScript Library

### Include Classes Generated by the JavaScript Library

The Tailwind input imports the default Flowbite theme and registers flowbite/plugin. Explicit source directives cover the HTML, the application module and Flowbite’s ESM library. The last source is significant: classes that the library adds at runtime must exist in the generated stylesheet even when they were not written directly into the initial HTML.

The bundle imports Accordion and Drawer from flowbite. The supplied example initializes each instance once after its markup exists. Framework applications that mount and unmount views should pair lifecycle setup with instance cleanup to avoid duplicate listeners. The local page has one mount and no client-side route transitions.

[Supporting specification](https://flowbite.com/docs/getting-started/javascript/)

## Flowbite Design System A Packing Aid with Visible Implementation Boundaries

### A Packing Aid with Visible Implementation Boundaries

The field guide demonstrates a content-heavy accordion, persistent checkbox state and an overlay workflow. It has no fabricated stock data or remote procurement result. All six materials are sample workshop preparation tasks, and the saved note remains in memory for the duration of the page.

The default semantic theme, component classes and JavaScript behavior are from Flowbite; the workshop content, original illustration and focus augmentation are application code. This separation lets a reader copy a useful composition while understanding which responsibilities the library actually covers.

- Use Flowbite’s stateful instance for panel visibility.
- Keep checklist data and derived progress in application logic.
- Handle real purchasing or shared persistence only through an explicit backend integration.

[Supporting specification](https://flowbite.com/docs/getting-started/quickstart/)

## Component Examples

### Packing guide and drawer markup

Semantic theme classes, real checkbox controls and linked accordion panels.

```html
<main id="page" class="mx-auto max-w-5xl p-6 md:p-10 text-body"><header class="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p class="text-xs font-semibold tracking-widest text-fg-brand">FLOWBITE · FIELD GUIDE</p><h1 class="mt-3 text-3xl font-semibold tracking-tight text-heading">Pack for a day of making.</h1><p class="mt-3 max-w-xl text-sm leading-6">A workshop packing guide with grouped instructions and a local materials note.</p></div><button id="open-note" class="rounded-base bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-strong focus:ring-4 focus:ring-brand-soft">Prepare materials note</button></header><div class="grid gap-8 md:grid-cols-[1.4fr_1fr]"><section aria-label="Packing categories"><div id="packing-accordion" class="overflow-hidden rounded-base border border-default"><h2><button id="paper-trigger" type="button" class="category-trigger" aria-expanded="true" aria-controls="paper-panel"><span><b>01</b> Paper & surfaces</span><span aria-hidden="true">⌄</span></button></h2><div id="paper-panel" aria-labelledby="paper-trigger"><div class="category-body"><p>Choose stocks before the session. Keep one sheet untouched as a reference.</p><label><input type="checkbox" data-item="Drawing sheets" class="check"> <span><strong>Drawing sheets</strong><small>12 × A3 sheets, 120–160 gsm</small></span></label><label><input type="checkbox" data-item="Tracing paper" class="check"> <span><strong>Tracing paper</strong><small>6 sheets for overlays and revisions</small></span></label></div></div><h2><button id="tools-trigger" type="button" class="category-trigger" aria-expanded="false" aria-controls="tools-panel"><span><b>02</b> Tools & marks</span><span aria-hidden="true">⌄</span></button></h2><div id="tools-panel" class="hidden" aria-labelledby="tools-trigger"><div class="category-body"><p>Test every marker. Put cutting tools in a separate protective sleeve.</p><label><input type="checkbox" data-item="Pencils and markers" class="check"> <span><strong>Pencils and markers</strong><small>2B pencils, one broad and one fine marker</small></span></label><label><input type="checkbox" data-item="Ruler and cutting mat" class="check"> <span><strong>Ruler and cutting mat</strong><small>One shared station per four people</small></span></label></div></div><h2><button id="space-trigger" type="button" class="category-trigger" aria-expanded="false" aria-controls="space-panel"><span><b>03</b> Shared space</span><span aria-hidden="true">⌄</span></button></h2><div id="space-panel" class="hidden" aria-labelledby="space-trigger"><div class="category-body"><p>Make wall space usable and document ideas before taking them down.</p><label><input type="checkbox" data-item="Low-tack tape" class="check"> <span><strong>Low-tack tape</strong><small>Test on a hidden part of the wall first</small></span></label><label><input type="checkbox" data-item="Documentation cards" class="check"> <span><strong>Documentation cards</strong><small>One title and author card per final piece</small></span></label></div></div></div></section><aside class="rounded-base border border-default bg-neutral-primary p-6"><div class="kit-art" aria-hidden="true"><i></i><i></i><i></i><em class="bg-brand-medium"></em></div><p class="mt-5 text-xs tracking-widest text-fg-brand font-semibold">WORKSHOP KIT</p><h2 class="mt-2 text-xl font-semibold text-heading">Six things, one shared table.</h2><p class="mt-3 text-sm leading-6">Check items as you pack. Opening another category keeps your choices.</p><div class="mt-6 flex items-center justify-between text-sm"><span>Packed</span><output id="count" class="font-semibold text-heading">0 of 6</output></div><div class="mt-2 h-2 rounded-full bg-neutral-tertiary" role="progressbar" aria-label="Packing progress" aria-valuemin="0" aria-valuemax="6" aria-valuenow="0"><div id="bar" class="h-2 rounded-full bg-brand" style="width:0%"></div></div><p id="next-item" class="mt-4 text-sm text-body-subtle">Next: Drawing sheets</p><button id="clear" class="mt-5 text-sm font-medium text-fg-brand underline underline-offset-4">Clear packed items</button></aside></div><p id="result" class="mt-6 rounded-base bg-success-soft p-4 text-sm text-fg-success" role="status" hidden></p></main><aside id="materials-drawer" tabindex="-1" aria-labelledby="drawer-title" class="fixed right-0 top-0 z-40 h-screen w-96 max-w-full translate-x-full overflow-y-auto border-l border-default bg-neutral-primary p-6"><div class="flex items-center justify-between gap-4"><h2 id="drawer-title" class="text-xl font-semibold text-heading">Materials note</h2><button id="close-note" class="rounded-base border border-default px-3 py-2 text-sm" aria-label="Close materials note">Close</button></div><p class="mt-4 text-sm leading-6 text-body">Record who is preparing the kit and which items still need attention.</p><form id="note-form" class="mt-6"><label for="owner" class="mb-2 block text-sm font-medium text-heading">Prepared by</label><input id="owner" class="mb-5 block w-full rounded-base border border-default bg-neutral-secondary p-3 text-sm text-heading focus:border-brand focus:ring-brand" required minlength="2" maxlength="60" placeholder="Your name"><label for="note" class="mb-2 block text-sm font-medium text-heading">Session note</label><textarea id="note" rows="4" maxlength="240" class="block w-full rounded-base border border-default bg-neutral-secondary p-3 text-sm text-heading focus:border-brand focus:ring-brand" placeholder="For example: bring the shared cutting mat."></textarea><p id="remaining" class="mt-5 text-sm leading-6 text-body"></p><button type="submit" class="mt-6 w-full rounded-base bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-strong">Save local note</button><p class="mt-3 text-xs leading-5 text-body-subtle">No email, purchase or shared document is created.</p></form></aside>

```

[Code reference](https://flowbite.com/docs/components/accordion/)

- Buttons connect to panel IDs through aria-controls.
- The drawer is labeled by its heading.
- The progressbar exposes the same count shown to sighted users.

### Native Flowbite instances and local state

Accordion/Drawer initialization plus application-specific checklist and focus management.

```javascript
import {Accordion,Drawer} from 'flowbite';
const q=s=>document.querySelector(s),drawerEl=q('#materials-drawer'),page=q('#page');
const accordion=new Accordion(q('#packing-accordion'),['paper','tools','space'].map((id,i)=>({id,triggerEl:q(`#${id}-trigger`),targetEl:q(`#${id}-panel`),active:i===0})),{alwaysOpen:false,activeClasses:'bg-brand-softer text-fg-brand',inactiveClasses:'bg-neutral-primary text-heading'});
const drawer=new Drawer(drawerEl,{placement:'right',backdrop:true,bodyScrolling:false,onShow(){page.inert=true;q('#owner').focus();},onHide(){page.inert=false;q('#open-note').focus();}});
const boxes=[...document.querySelectorAll('[data-item]')];
function refresh(){let packed=boxes.filter(x=>x.checked),left=boxes.filter(x=>!x.checked);q('#count').value=`${packed.length} of 6`;q('#bar').style.width=`${packed.length/6*100}%`;q('[role="progressbar"]').setAttribute('aria-valuenow',packed.length);q('#next-item').textContent=left.length?`Next: ${left[0].dataset.item}`:'Everything on the list is packed.';q('#remaining').textContent=left.length?`Still needed: ${left.map(x=>x.dataset.item).join(', ')}.`:'All six materials are packed.';q('#result').hidden=true;}
boxes.forEach(x=>x.addEventListener('change',refresh));q('#clear').onclick=()=>{boxes.forEach(x=>x.checked=false);refresh();};q('#open-note').onclick=()=>{refresh();drawer.show();};q('#close-note').onclick=()=>drawer.hide();drawerEl.addEventListener('keydown',e=>{if(e.key==='Tab'){let els=[...drawerEl.querySelectorAll('button,input,textarea')],first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});q('#note-form').onsubmit=e=>{e.preventDefault();const owner=q('#owner');if(owner.value.trim().length<2){owner.setCustomValidity('Enter at least two non-space characters.');owner.reportValidity();return;}drawer.hide();q('#result').hidden=false;q('#result').textContent=`Local note prepared by ${owner.value.trim()}: ${boxes.filter(x=>x.checked).length} of 6 items packed. ${q('#note').value.trim()||'No extra note.'}`;};q('#owner').oninput=()=>q('#owner').setCustomValidity('');refresh();

```

[Code reference](https://flowbite.com/docs/components/drawer/)

- One Accordion instance controls all three categories.
- Drawer lifecycle callbacks make the background inert and restore focus.
- The focus loop is an explicit application addition.

### Original packing illustration and supporting CSS

Application layout details surrounding native utilities.

```css
body{margin:0;background:var(--color-neutral-secondary);font-family:var(--font-sans)}.category-trigger{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px;width:100%;text-align:left;font-size:15px;font-weight:600;border-bottom:1px solid var(--color-default)}.category-trigger b{font-size:11px;opacity:.6;margin-right:12px}.category-trigger:focus-visible{outline:3px solid var(--color-brand);outline-offset:-3px}.category-body{padding:20px;background:var(--color-neutral-primary);font-size:14px;line-height:1.7;border-bottom:1px solid var(--color-default)}.category-body p{margin-bottom:20px}.category-body label{display:flex;align-items:flex-start;gap:12px;margin:16px 0;cursor:pointer}.category-body small{display:block;font-size:12px;color:var(--color-body-subtle);margin-top:4px}.check{width:18px;height:18px;border:1px solid var(--color-default);border-radius:4px;margin-top:3px;color:var(--color-brand)}.kit-art{height:160px;background:var(--color-brand-softer);border-radius:var(--radius-base);position:relative;overflow:hidden}.kit-art i{position:absolute;width:110px;height:95px;background:#fff;border:1px solid var(--color-brand-medium);top:35px;left:20%;transform:rotate(-12deg)}.kit-art i:nth-child(2){left:35%;transform:rotate(10deg);background:var(--color-brand-soft)}.kit-art i:nth-child(3){width:8px;height:120px;left:70%;top:20px;transform:rotate(25deg);background:var(--color-brand)}.kit-art em{position:absolute;width:95px;height:22px;background:var(--color-brand-medium);bottom:20px;left:20%;transform:rotate(-20deg)}[hidden]{display:none!important}button{cursor:pointer}button:focus-visible{outline:3px solid var(--color-brand);outline-offset:3px}@media(max-width:600px){.category-trigger,.category-body{padding:16px}}

```

[Code reference](https://flowbite.com/docs/customize/colors/)

- The paper, pencil and ruler geometry is original decorative CSS.

### Complete index.html document

Use with the stylesheet build and complete interaction source supplied above.

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flowbite specimen</title><link rel="stylesheet" href="output.css"><link rel="stylesheet" href="style.css"></head><body>
<main id="page" class="mx-auto max-w-5xl p-6 md:p-10 text-body"><header class="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p class="text-xs font-semibold tracking-widest text-fg-brand">FLOWBITE · FIELD GUIDE</p><h1 class="mt-3 text-3xl font-semibold tracking-tight text-heading">Pack for a day of making.</h1><p class="mt-3 max-w-xl text-sm leading-6">A workshop packing guide with grouped instructions and a local materials note.</p></div><button id="open-note" class="rounded-base bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-strong focus:ring-4 focus:ring-brand-soft">Prepare materials note</button></header><div class="grid gap-8 md:grid-cols-[1.4fr_1fr]"><section aria-label="Packing categories"><div id="packing-accordion" class="overflow-hidden rounded-base border border-default"><h2><button id="paper-trigger" type="button" class="category-trigger" aria-expanded="true" aria-controls="paper-panel"><span><b>01</b> Paper & surfaces</span><span aria-hidden="true">⌄</span></button></h2><div id="paper-panel" aria-labelledby="paper-trigger"><div class="category-body"><p>Choose stocks before the session. Keep one sheet untouched as a reference.</p><label><input type="checkbox" data-item="Drawing sheets" class="check"> <span><strong>Drawing sheets</strong><small>12 × A3 sheets, 120–160 gsm</small></span></label><label><input type="checkbox" data-item="Tracing paper" class="check"> <span><strong>Tracing paper</strong><small>6 sheets for overlays and revisions</small></span></label></div></div><h2><button id="tools-trigger" type="button" class="category-trigger" aria-expanded="false" aria-controls="tools-panel"><span><b>02</b> Tools & marks</span><span aria-hidden="true">⌄</span></button></h2><div id="tools-panel" class="hidden" aria-labelledby="tools-trigger"><div class="category-body"><p>Test every marker. Put cutting tools in a separate protective sleeve.</p><label><input type="checkbox" data-item="Pencils and markers" class="check"> <span><strong>Pencils and markers</strong><small>2B pencils, one broad and one fine marker</small></span></label><label><input type="checkbox" data-item="Ruler and cutting mat" class="check"> <span><strong>Ruler and cutting mat</strong><small>One shared station per four people</small></span></label></div></div><h2><button id="space-trigger" type="button" class="category-trigger" aria-expanded="false" aria-controls="space-panel"><span><b>03</b> Shared space</span><span aria-hidden="true">⌄</span></button></h2><div id="space-panel" class="hidden" aria-labelledby="space-trigger"><div class="category-body"><p>Make wall space usable and document ideas before taking them down.</p><label><input type="checkbox" data-item="Low-tack tape" class="check"> <span><strong>Low-tack tape</strong><small>Test on a hidden part of the wall first</small></span></label><label><input type="checkbox" data-item="Documentation cards" class="check"> <span><strong>Documentation cards</strong><small>One title and author card per final piece</small></span></label></div></div></div></section><aside class="rounded-base border border-default bg-neutral-primary p-6"><div class="kit-art" aria-hidden="true"><i></i><i></i><i></i><em class="bg-brand-medium"></em></div><p class="mt-5 text-xs tracking-widest text-fg-brand font-semibold">WORKSHOP KIT</p><h2 class="mt-2 text-xl font-semibold text-heading">Six things, one shared table.</h2><p class="mt-3 text-sm leading-6">Check items as you pack. Opening another category keeps your choices.</p><div class="mt-6 flex items-center justify-between text-sm"><span>Packed</span><output id="count" class="font-semibold text-heading">0 of 6</output></div><div class="mt-2 h-2 rounded-full bg-neutral-tertiary" role="progressbar" aria-label="Packing progress" aria-valuemin="0" aria-valuemax="6" aria-valuenow="0"><div id="bar" class="h-2 rounded-full bg-brand" style="width:0%"></div></div><p id="next-item" class="mt-4 text-sm text-body-subtle">Next: Drawing sheets</p><button id="clear" class="mt-5 text-sm font-medium text-fg-brand underline underline-offset-4">Clear packed items</button></aside></div><p id="result" class="mt-6 rounded-base bg-success-soft p-4 text-sm text-fg-success" role="status" hidden></p></main><aside id="materials-drawer" tabindex="-1" aria-labelledby="drawer-title" class="fixed right-0 top-0 z-40 h-screen w-96 max-w-full translate-x-full overflow-y-auto border-l border-default bg-neutral-primary p-6"><div class="flex items-center justify-between gap-4"><h2 id="drawer-title" class="text-xl font-semibold text-heading">Materials note</h2><button id="close-note" class="rounded-base border border-default px-3 py-2 text-sm" aria-label="Close materials note">Close</button></div><p class="mt-4 text-sm leading-6 text-body">Record who is preparing the kit and which items still need attention.</p><form id="note-form" class="mt-6"><label for="owner" class="mb-2 block text-sm font-medium text-heading">Prepared by</label><input id="owner" class="mb-5 block w-full rounded-base border border-default bg-neutral-secondary p-3 text-sm text-heading focus:border-brand focus:ring-brand" required minlength="2" maxlength="60" placeholder="Your name"><label for="note" class="mb-2 block text-sm font-medium text-heading">Session note</label><textarea id="note" rows="4" maxlength="240" class="block w-full rounded-base border border-default bg-neutral-secondary p-3 text-sm text-heading focus:border-brand focus:ring-brand" placeholder="For example: bring the shared cutting mat."></textarea><p id="remaining" class="mt-5 text-sm leading-6 text-body"></p><button type="submit" class="mt-6 w-full rounded-base bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-strong">Save local note</button><p class="mt-3 text-xs leading-5 text-body-subtle">No email, purchase or shared document is created.</p></form></aside>

<script src="bundle.js" defer></script></body></html>
```

[Code reference](https://flowbite.com/)

- Save the supplied interaction as main.js and compile it to bundle.js as shown in setup.
- The viewport and native asset loading are included.

## Implementation Starting Point

Verified Flowbite 4.0.2 with Tailwind CSS 4.3.3. Adapt the node_modules source path to the actual location of input.css. No remote fonts are required.

```css
/* npm install flowbite@4.0.2 */
/* npm install -D tailwindcss@4.3.3 @tailwindcss/cli@4.3.3 esbuild */
/* input.css, next to body.html and main.js: */
@import "tailwindcss" source(none);
@import "flowbite/src/themes/default";
@plugin "flowbite/plugin";
@source "./body.html";
@source "./main.js";
@source "./node_modules/flowbite/lib/esm";
/* npx @tailwindcss/cli -i input.css -o output.css --minify */
/* npx esbuild main.js --bundle --format=iife --outfile=bundle.js */
/* index.html: link output.css then style.css; include the supplied markup. */
/* Load bundle.js with defer, or after the markup. */
```

## Agent Prompt

Use the complete Flowbite 4.0.2 workshop packing guide, including its Tailwind source discovery, native Accordion and Drawer initialization. Keep the grouped materials and checklist state connected to the guide, and validate the owner information before recording a local packing note. Preserve the drawer’s keyboard focus, inert background handling and dismissal behavior. Keep original illustration CSS separate from the library’s semantic theme. No service ticket or external submission should be introduced into this local packing workflow.

## Sources

- [Official repository](https://github.com/themesberg/flowbite) — Version-four setup and component API.
- [Default theme source](https://github.com/themesberg/flowbite/blob/main/src/themes/default.css) — Actual semantic aliases and geometry.
- [Accordion implementation](https://github.com/themesberg/flowbite/blob/main/src/components/accordion/index.ts) — Instance options and aria-expanded updates.
- [Drawer implementation](https://github.com/themesberg/flowbite/blob/main/src/components/drawer/index.ts) — Visibility, backdrop and lifecycle methods.
- [Accordion guide](https://flowbite.com/docs/components/accordion/) — Official composition reference.
- [Drawer guide](https://flowbite.com/docs/components/drawer/) — Official overlay API.
- [Tailwind theme](https://tailwindcss.com/docs/theme) — Primitive spacing and typography utilities.
