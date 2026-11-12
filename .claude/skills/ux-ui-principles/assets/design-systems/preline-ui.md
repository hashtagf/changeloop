# Preline UI Design System — OpenDesign Application Guide

A native Preline session planner with linked tabs, a constrained input-number plugin, installed theme aliases, real Tailwind scales and a local materials estimate that updates with the selected session.

Native Preline npm 4.2.0 with Tailwind CSS 4.3.3. Original session descriptions, illustrations and fictional materials allowances. Save stores only local page state; no booking, payment or external message occurs.

## Source Reference

- **Library scope:** Tailwind CSS component library ([source](https://preline.co/))
- **Platform or architecture:** Installation uses the preline package ([source](https://preline.co/docs/))
- **Integration:** Interactive elements use JavaScript ([source](https://preline.co/docs/))
- **Component support:** Documentation includes CSS variants ([source](https://preline.co/docs/))
- **Customization or behavior:** Manual initialization options are documented ([source](https://preline.co/docs/))
- **Additional capability:** Framework-specific guides are available ([source](https://preline.co/docs/))


## Design Reference

Preline npm 4.2.0 with Tailwind CSS 4.3.3; default theme from the installed package. The marketing/docs site can show a newer release banner, so the executable example is explicitly pinned. Theme aliases remain aliases; no guessed hexadecimal conversions.

### Default light semantic theme

[Official reference](https://preline.co/docs/themes.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --background | var(--color-white) | Default background role. |
| --foreground | var(--color-gray-800) | Main text role. |
| --border | var(--color-gray-200) | Shared border role. |
| --primary | var(--color-primary-600) | Active tab and main action. |
| --primary-foreground | var(--color-white) | Text on primary. |
| --primary-hover | var(--color-primary-700) | Hover state. |
| --primary-focus | var(--color-primary-700) | Focus state. |
| --primary-active | var(--color-primary-700) | Active state. |
| --layer | var(--color-white) | Quantity control surface. |
| --layer-line | var(--color-gray-200) | Quantity boundary. |
| --layer-hover | var(--color-gray-50) | Hover surface. |
| --card | var(--color-white) | Session and group cards. |
| --card-line | var(--color-gray-200) | Card boundary. |
| --muted-foreground-1 | var(--color-gray-500) | Supporting text. |

### Tailwind scales actually used

[Official reference](https://preline.co/docs/typography.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| p-2 / gap-2 | 0.5rem | Quantity shell and tab gaps. |
| px-3 / gap-3 | 0.75rem | Tab padding and number control spacing. |
| p-5 | 1.25rem | Cards and default page inset. |
| sm:p-8 | 2rem from 640px | Page inset at the small breakpoint. |
| mt-7 | 1.75rem | Space before the planner. |
| text-xs | 0.75rem / 1rem | Supporting labels. |
| text-sm | 0.875rem / 1.25rem | Controls and explanatory copy. |
| text-lg | 1.125rem / 1.75rem | Group heading. |
| text-2xl | 1.5rem / 2rem | Session title. |
| text-3xl | 1.875rem / 2.25rem | Page heading and total. |
| rounded-lg / rounded-xl | 0.5rem / 0.75rem | Controls / cards; default Tailwind radius values. |

### Original application and plugin constraints

[Official reference](https://preline.co/plugins/input-number.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Group size | min 1 / max 6 / step 1 | HSInputNumber data options and HTML input constraints agree. |
| Print studio allowance | $12 per participant | Fictional materials estimate. |
| Clay workshop allowance | $18 per participant | Fictional materials estimate. |
| Drawing walk allowance | $5 per participant | Fictional materials estimate. |
| Layout | Flexible session + 280px group card; stack at 760px | Original responsive composition. |
| Theme mapping | bg-primary → --color-primary → --primary | Semantic Tailwind utility resolves through the Preline alias. |

## Preline UI Design System Preline Combines Utility Markup with Behavior Plugins

### Preline Combines Utility Markup with Behavior Plugins

The planner uses two native Preline plugins: HSTabs selects a session panel, and HSInputNumber manages bounded increment and decrement controls. Tailwind classes supply most visual treatment. The original session illustration and budget calculation belong to the application rather than to a fictional all-in-one booking component.

This distinction matters when copying the example. Installing the JavaScript package alone does not compile the utility classes or supply the application’s markup. Conversely, copying the HTML without initializing the plugins leaves tab and number behavior incomplete. The full integration below supplies each part explicitly.

[Supporting specification](https://preline.co/docs/index.html)

## Preline UI Design System Read Semantic Aliases Through to Their Palette Roles

### Read Semantic Aliases Through to Their Palette Roles

In the packaged default light theme, --primary refers to --color-primary-600, whose underlying primary ramp is blue. The primary foreground resolves to white; hover, focus and active use the seven-hundred role. The selected tab and Save action share that family through semantic utility classes.

Cards use --card and --card-line, while the quantity field uses --layer and --layer-line. Keeping those roles separate makes future theme changes more predictable than scattering literal white and gray classes everywhere. The table preserves official aliases instead of presenting computed approximations as source tokens.

[Supporting specification](https://preline.co/docs/themes.html)

## Preline UI Design System Use Tailwind’s Real Scale and Mark Original Exceptions

### Use Tailwind’s Real Scale and Mark Original Exceptions

The page title and estimate use text-3xl, the session title uses text-2xl, and form copy uses text-sm. Card padding p-5 equals 1.25rem under the default spacing unit. The larger sm:p-8 page inset starts at Tailwind’s 640px small breakpoint, while the original grid switches to one column at 760px.

The local stylesheet uses system-ui and does not fetch the optional custom fonts named in Preline’s theme file. At 280px, tabs wrap onto two rows and the group card moves below the session. Those are deliberate application composition choices rather than a claim that every Preline layout has this geometry.

[Supporting specification](https://preline.co/docs/typography.html)

## Preline UI Design System Keep Tab Controls and Panels Linked by Stable IDs

### Keep Tab Controls and Panels Linked by Stable IDs

Each tab has data-hs-tab pointing to one unique panel. The tab’s aria-controls and the panel’s aria-labelledby repeat that relationship for assistive technology. Exactly one initial tab carries active and aria-selected=true, and the other panels begin hidden. Native HSTabs updates those states as the user navigates.

The active visual style uses hs-tab-active:bg-primary and hs-tab-active:text-primary-foreground. Those variants come from Preline’s variants.css, so omitting that import can make the selected state visually ambiguous even when the JavaScript changes classes correctly. The application observes selection changes to refresh the adjacent summary.

1. Select Clay workshop and confirm its title, materials and duration.
2. Increase Participants from two to three and verify the $54 estimate.
3. Save the local plan, then change a tab to clear the old confirmation.

[Supporting specification](https://preline.co/plugins/tabs.html)

## Preline UI Design System Plugin Options and Input Constraints Must Agree

### Plugin Options and Input Constraints Must Agree

The quantity wrapper sets min one, max six and step one in data-hs-input-number. The native number input repeats those constraints. This gives both the plugin buttons and browser validity the same allowed domain instead of letting a typed number bypass a limit that only exists in the button handler.

The summary listens to input, change and the plugin’s change callback. Invalid manual input replaces the total with an em dash and disables Save; the save handler also calls reportValidity before reading the value. The six-person limit is a sample planning constraint, not a claim about real availability.

[Supporting specification](https://preline.co/plugins/input-number.html)

## Preline UI Design System Calculate from the Active Panel Instead of Stale Labels

### Calculate from the Active Panel Instead of Stale Labels

Each panel stores a stable session name, price and duration as data attributes. The update function reads the visible panel and multiplies its allowance by the valid group size. This makes Print studio, Clay workshop and Drawing walk genuinely distinct choices rather than tabs that reveal the same placeholder card.

The displayed estimate includes materials only. The original descriptions state what the allowance represents, and the page explicitly says it does not book a place. There is no payment, inventory check or external schedule behind the numbers. A real booking flow would need those separate systems and server validation.

[Supporting specification](https://preline.co/docs/components/tabs.html)

## Preline UI Design System Use the Exported Manual Entry in This Package Version

### Use the Exported Manual Entry in This Package Version

The verified 4.2.0 package exposes named HSTabs and HSInputNumber exports from preline/non-auto. The example imports them and calls their autoInit methods after the markup exists. Despite the name, autoInit here is an explicit scan invoked by the application, not an implicit full-package page-load hook.

During verification, the per-plugin .mjs paths did not expose a default class, and bare imports from those paths were removable under package side-effect metadata. Using the exported manual entry resolved that concrete build issue. The setup therefore shows the working versioned import rather than an untested generic plugin import.

[Supporting specification](https://preline.co/docs/preline-javascript.html)

## Preline UI Design System Make Confirmation Expire When the Plan Changes

### Make Confirmation Expire When the Plan Changes

Save local plan writes a status sentence containing the exact session, count and materials total, then disables itself. Any quantity edit or selected-tab change calls update, restoring the normal explanatory message and recalculating whether saving is allowed. A previously saved sentence cannot remain attached to a new plan.

The local test selected Clay workshop, increased the count to three and checked the resulting $54 status. It also inspected the actual rendered page at 280px. A static total or a button that merely changes its own label would not prove that the two native plugins and the application state are connected.

- Use a status region for the precise local result.
- Keep invalid values out of the calculated total.
- Retain stable tab/panel IDs when adapting the markup.

[Supporting specification](https://preline.co/plugins/input-number.html)

## Preline UI Design System Compile the Theme, Variants and Actual Source Markup

### Compile the Theme, Variants and Actual Source Markup

The stylesheet imports Tailwind first, then Preline variants and the packaged default theme. Explicit source paths include the local HTML, application JavaScript and Preline distribution files, so state-dependent utilities are available in the generated CSS. The original layout stylesheet follows those imports.

The standalone preview inlines the compiled CSS and bundled JavaScript and makes no CDN request. A production project can serve the same outputs as separate files. Keep file paths relative to the actual CSS entry; the reproducible example below puts all source files at the project root to avoid hidden temporary-workspace dependencies.

[Supporting specification](https://preline.co/docs/index.html)

## Component Examples

### Complete semantic planner markup

Tab IDs, panel relationships, input-number hooks and an explicit local status region.

```html
<main class="max-w-5xl mx-auto p-5 sm:p-8"><header><p class="text-xs font-semibold tracking-widest text-muted-foreground-1">STUDIO SATURDAY · SAMPLE PROGRAM</p><h1 class="text-3xl font-semibold tracking-tight mt-3">Choose a different kind of afternoon.</h1><p class="text-sm text-muted-foreground-1 leading-6 mt-3 max-w-2xl">Explore three creative sessions and calculate a sample materials budget for your group. This planner does not book a place.</p></header><div class="planner-grid mt-7"><section class="min-w-0"><nav class="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Creative sessions"><button type="button" id="tab-print" data-hs-tab="#panel-print" role="tab" aria-controls="panel-print" aria-selected="true" class="active hs-tab-active:bg-primary hs-tab-active:text-primary-foreground py-2 px-3 text-sm rounded-lg border border-border text-foreground hover:bg-layer-hover focus-visible:outline-2 focus-visible:outline-primary">Print studio</button><button type="button" id="tab-ceramics" data-hs-tab="#panel-ceramics" role="tab" aria-controls="panel-ceramics" aria-selected="false" class=" hs-tab-active:bg-primary hs-tab-active:text-primary-foreground py-2 px-3 text-sm rounded-lg border border-border text-foreground hover:bg-layer-hover focus-visible:outline-2 focus-visible:outline-primary">Clay workshop</button><button type="button" id="tab-drawing" data-hs-tab="#panel-drawing" role="tab" aria-controls="panel-drawing" aria-selected="false" class=" hs-tab-active:bg-primary hs-tab-active:text-primary-foreground py-2 px-3 text-sm rounded-lg border border-border text-foreground hover:bg-layer-hover focus-visible:outline-2 focus-visible:outline-primary">Drawing walk</button></nav><div id="panel-print" role="tabpanel" aria-labelledby="tab-print" class="" data-name="Print studio" data-price="12" data-duration="90 minutes"><div class="session-art print" aria-hidden="true"><i></i><b></b><span></span></div><div class="p-5 bg-card rounded-b-xl border border-card-line border-t-0"><p class="text-xs text-muted-foreground-1 font-medium">09:30–11:00 · 90 minutes</p><h2 class="text-2xl mt-3 font-semibold">Ink, paper, repeat.</h2><p class="text-sm leading-6 mt-3 text-muted-foreground-1">Make a two-color print from a simple cut-paper composition.</p><h3 class="text-sm font-semibold mt-5">Materials included in the estimate</h3><ul class="mt-3 space-y-2 text-sm"><li class="flex gap-2"><span aria-hidden="true">↗</span>Cobalt ink</li><li class="flex gap-2"><span aria-hidden="true">↗</span>Warm white stock</li><li class="flex gap-2"><span aria-hidden="true">↗</span>Registration guide</li></ul><p class="mt-5 text-sm font-medium">Sample materials allowance: $12 per person</p></div></div><div id="panel-ceramics" role="tabpanel" aria-labelledby="tab-ceramics" class="hidden" data-name="Clay workshop" data-price="18" data-duration="120 minutes"><div class="session-art ceramics" aria-hidden="true"><i></i><b></b><span></span></div><div class="p-5 bg-card rounded-b-xl border border-card-line border-t-0"><p class="text-xs text-muted-foreground-1 font-medium">13:00–15:00 · 120 minutes</p><h2 class="text-2xl mt-3 font-semibold">A shape held by hand.</h2><p class="text-sm leading-6 mt-3 text-muted-foreground-1">Build a small pinch vessel and explore three surface textures.</p><h3 class="text-sm font-semibold mt-5">Materials included in the estimate</h3><ul class="mt-3 space-y-2 text-sm"><li class="flex gap-2"><span aria-hidden="true">↗</span>Stoneware clay</li><li class="flex gap-2"><span aria-hidden="true">↗</span>Wooden modeling tool</li><li class="flex gap-2"><span aria-hidden="true">↗</span>Texture samples</li></ul><p class="mt-5 text-sm font-medium">Sample materials allowance: $18 per person</p></div></div><div id="panel-drawing" role="tabpanel" aria-labelledby="tab-drawing" class="hidden" data-name="Drawing walk" data-price="5" data-duration="60 minutes"><div class="session-art drawing" aria-hidden="true"><i></i><b></b><span></span></div><div class="p-5 bg-card rounded-b-xl border border-card-line border-t-0"><p class="text-xs text-muted-foreground-1 font-medium">16:00–17:00 · 60 minutes</p><h2 class="text-2xl mt-3 font-semibold">Notice the edges.</h2><p class="text-sm leading-6 mt-3 text-muted-foreground-1">Make a sequence of quick drawings along an original sample walking route.</p><h3 class="text-sm font-semibold mt-5">Materials included in the estimate</h3><ul class="mt-3 space-y-2 text-sm"><li class="flex gap-2"><span aria-hidden="true">↗</span>Pocket sketchbook</li><li class="flex gap-2"><span aria-hidden="true">↗</span>Soft graphite pencil</li><li class="flex gap-2"><span aria-hidden="true">↗</span>Portable drawing board</li></ul><p class="mt-5 text-sm font-medium">Sample materials allowance: $5 per person</p></div></div></section><aside class="bg-card border border-card-line rounded-xl p-5 self-start"><h2 class="text-lg font-semibold">Your group</h2><label for="people" class="block text-sm mt-5 mb-2">Participants</label><div id="quantity" data-hs-input-number='{"min":1,"max":6,"step":1}' class="flex items-center gap-3 border border-layer-line rounded-lg p-2 bg-layer"><button type="button" data-hs-input-number-decrement aria-label="Decrease participants" class="size-9 shrink-0 rounded-md border border-border disabled:opacity-40">−</button><input id="people" type="number" value="2" min="1" max="6" step="1" data-hs-input-number-input class="w-full min-w-0 text-center bg-transparent"/><button type="button" data-hs-input-number-increment aria-label="Increase participants" class="size-9 shrink-0 rounded-md border border-border disabled:opacity-40">+</button></div><p class="text-xs text-muted-foreground-1 mt-2">1–6 participants · sample planning limit</p><dl class="mt-6 space-y-3 text-sm"><div><dt class="text-muted-foreground-1">Selected session</dt><dd id="selected-name" class="font-semibold mt-1"></dd></div><div><dt class="text-muted-foreground-1">Duration</dt><dd id="selected-duration" class="font-semibold mt-1"></dd></div><div class="pt-4 border-t border-border"><dt class="text-muted-foreground-1">Materials estimate</dt><dd id="total" class="text-3xl font-semibold mt-1"></dd></div></dl><button id="save" class="mt-6 w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary-hover disabled:opacity-50" type="button">Save local plan</button><p id="feedback" role="status" class="text-xs leading-5 mt-3 text-muted-foreground-1">No booking or payment is created.</p></aside></div></main>
```

[Code reference](https://preline.co/docs/components/tabs.html)

- The three sessions and prices are original sample data.
- The native input has the same constraints as the plugin.

### Complete plugin initialization and calculation

Manual initialization from the exported non-auto entry; selection and quantity feed one derived summary.

```javascript
import {HSTabs,HSInputNumber} from 'preline/non-auto';
HSTabs.autoInit();HSInputNumber.autoInit();
const quantity=document.querySelector('#people'),save=document.querySelector('#save'),feedback=document.querySelector('#feedback');
function selected(){return document.querySelector('[role=tabpanel]:not(.hidden)')}
function update(){const panel=selected(),count=Number(quantity.value);document.querySelector('#selected-name').textContent=panel.dataset.name;document.querySelector('#selected-duration').textContent=panel.dataset.duration;document.querySelector('#total').textContent=quantity.checkValidity()&&count>=1?'$'+count*Number(panel.dataset.price):'—';save.disabled=!quantity.checkValidity()||count<1;feedback.textContent='No booking or payment is created.'}
document.querySelectorAll('[data-hs-tab]').forEach(button=>button.addEventListener('click',()=>queueMicrotask(update)));
new MutationObserver(update).observe(document.querySelector('nav'),{subtree:true,attributes:true,attributeFilter:['aria-selected']});
quantity.addEventListener('input',update);quantity.addEventListener('change',update);
const instance=HSInputNumber.getInstance('#quantity');instance.on('change',update);
save.addEventListener('click',()=>{if(!quantity.reportValidity())return;const panel=selected();feedback.textContent=`Saved locally: ${panel.dataset.name}, ${quantity.value} people, $${Number(quantity.value)*Number(panel.dataset.price)} materials estimate.`;save.disabled=true});update();

```

[Code reference](https://preline.co/plugins/input-number.html)

- Use the named exports from preline/non-auto.
- The versioned plugin subpath .mjs files do not export a default class.
- Input change events and plugin change callbacks both update the summary.

### Complete original responsive composition

Decorative print, clay and drawing illustrations around the native tab and number plugins.

```css
html,body{margin:0;height:auto;min-height:0}body{background:#f7f8fb;font-family:ui-sans-serif,system-ui,sans-serif;color:var(--foreground)}button{cursor:pointer}button:disabled{cursor:default}.planner-grid{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px}.session-art{height:200px;position:relative;overflow:hidden;border-radius:12px 12px 0 0}.session-art i,.session-art b,.session-art span{display:block;position:absolute}.print{background:#e2e9f4}.print i{width:160px;height:140px;left:15%;top:45px;background:#2456a7;transform:rotate(-13deg)}.print b{width:150px;height:150px;right:14%;top:30px;background:#f0a979;border-radius:50%;mix-blend-mode:multiply}.print span{width:180px;height:8px;left:20%;top:160px;background:#f9f8ef;transform:rotate(-13deg)}.ceramics{background:#e8d9c8}.ceramics i{width:150px;height:100px;left:25%;top:65px;border-radius:15% 15% 50% 50%;background:#a87862}.ceramics b{width:150px;height:32px;border-radius:50%;left:25%;top:53px;background:#704a3d;box-shadow:inset 0 0 0 10px #bd8f78}.ceramics span{width:150px;height:12px;left:25%;top:171px;background:#c7b39e;border-radius:50%}.drawing{background:#e2e8de}.drawing i{width:160px;height:145px;left:23%;top:25px;background:#fffdf4;transform:rotate(8deg);border:1px solid #d6d8cb}.drawing b{height:90px;width:80px;left:33%;top:49px;border:2px solid #4d655b;transform:rotate(-18deg);border-radius:50% 50% 10% 10%}.drawing span{width:130px;height:7px;background:#ad754c;left:45%;top:145px;transform:rotate(-33deg)}@media(max-width:760px){.planner-grid{grid-template-columns:minmax(0,1fr)}.session-art{height:170px}}@media(max-width:360px){main{padding:14px!important}.session-art i,.session-art b,.session-art span{transform:scale(.8)}.session-art{height:150px}h1{font-size:26px!important}}

```

[Code reference](https://preline.co/docs/themes.html)

- The artwork is original CSS and aria-hidden.
- This stylesheet follows the Tailwind and Preline imports.

## Implementation Starting Point

Verified native Preline 4.2.0. The complete markup, logic and CSS are supplied above. The input.css source paths assume all four source files are at the project root.

```bash
# Create an empty directory and run:
npm init -y
npm install preline@4.2.0 tailwindcss@4.3.3 @tailwindcss/cli@4.3.3 esbuild
# Save the complete examples above as body.html, app.js and style.css.
# Create input.css with exactly:
# @import "tailwindcss" source(none);
# @import "./node_modules/preline/variants.css";
# @import "./node_modules/preline/css/themes/theme.css";
# @source "./body.html";
# @source "./app.js";
# @source "./node_modules/preline/dist/*.js";
# @import "./style.css";
npx @tailwindcss/cli -i input.css -o bundle.css --minify
npx esbuild app.js --bundle --format=iife --outfile=bundle.js
# Assemble the actual root document without placeholder markup:
node -e 'const f=require("fs");f.writeFileSync("index.html",`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Studio planner</title><link rel="stylesheet" href="bundle.css"></head><body>${f.readFileSync("body.html","utf8")}<script src="bundle.js"></script></body></html>`)'
# Serve this directory with your existing static server.
```

## Agent Prompt

Use Preline 4.2.0 with named HSTabs and HSInputNumber imports from preline/non-auto and explicitly initialize both plugins. Preserve the three Studio Saturday workshops, the one-to-six quantity range and the selected workshop’s material cost. Derive the total from the active panel and quantity, invalidate the saved plan after either changes, and validate the numeric range before saving locally. Include the supplied Tailwind theme/variants setup and original layout. Do not convert the local studio plan into a booking or payment confirmation.

## Sources

- [Themes](https://preline.co/docs/themes.html) — Semantic role mapping and theme customization.
- [Tabs plugin](https://preline.co/plugins/tabs.html) — Target relationships, initialization and behavior.
- [Input number](https://preline.co/plugins/input-number.html) — Boundaries, hooks, methods and change callbacks.
- [Tab markup](https://preline.co/docs/components/tabs.html) — Tablist and panel composition.
- [JavaScript integration](https://preline.co/docs/preline-javascript.html) — Initialization boundaries and framework lifecycle.
- [Typography](https://preline.co/docs/typography.html) — Utility-based text hierarchy.
- [Installation](https://preline.co/docs/index.html) — Tailwind compilation and package setup.
