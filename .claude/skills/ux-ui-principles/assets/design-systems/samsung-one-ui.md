# Samsung One UI Design System — OpenDesign Application Guide

Study One UI’s viewing and interaction structure, 24dp margin guidance and 200% text-scaling requirement through a complete original reading-preferences preview with dark appearance and explicit reset recovery.

An original OpenDesign browser interpretation of One UI principles. It is not a native One UI runtime and does not change device settings. Published requirements and original web values are separated in the reference.

## Source Reference

- **Published layout:** At least 24dp side margins ([source](https://developer.samsung.com/one-ui/layout/grid.html))
- **Text access:** Resize up to 200% without lost content or function ([source](https://developer.samsung.com/one-ui/accessibility/layout-and-typo.html))
- **Preview runtime:** Original browser study, no device connection ([source](https://developer.samsung.com/one-ui/index.html))


## Design Reference

Samsung’s public layout and accessibility guidance, with original CSS-study choices labeled separately. No unpublished palette, font or component API is invented.

### Published layout and access requirements

[Official reference](https://developer.samsung.com/one-ui/accessibility/layout-and-typo.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Side margins | At least 24dp on left and right | Native layout reference; do not silently relabel dp as CSS pixels. |
| Viewing and interaction areas | Viewing above; frequently used interaction below | Arrange context and reachable actions deliberately; this is a layout principle, not a fixed screen-height fraction. |
| Cutout handling | Adapt placement to camera cutouts and orientation | Do not put essential content behind a device cutout. |
| Text resizing | Up to 200% without losing content or function | Published accessibility guidance; the browser study demonstrates paragraph reflow with its explicit reading-size control. |
| Target separation | Large enough touch areas with space between them | The public text does not supply a numeric minimum here; the example’s 48px controls are an original web choice. |

### Published interaction rules

[Official reference](https://developer.samsung.com/one-ui/accessibility/interaction-and-control.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Complex gestures | Provide an alternative action | Do not make drag or multi-finger interaction the only way to complete a task. |
| Automatic content | Provide control for moving content over 5 seconds | The study includes no automatic carousel or timed disappearance. |
| Error recovery | Clear message and focus on the next useful action | Use visible text and a clear recovery action. |
| Screen transitions | Feedback and an explicit way back | The reset dialog supplies cancellation and keyboard Escape recovery. |
| Focus blocks | Subdued surfaces for function-focused content | Color-role guidance; no numeric palette is invented as an official token export. |

### Original browser-study choices — not Samsung tokens

[Official reference](https://developer.samsung.com/one-ui/color/system.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --study-background | #F3F3F6 | Authored for this standalone browser interpretation. This value is not presented as an official One UI design token. |
| --study-card | #FFFFFF | Authored for this standalone browser interpretation. This value is not presented as an official One UI design token. |
| --study-text | #17171C | Authored for this standalone browser interpretation. This value is not presented as an official One UI design token. |
| --study-action | #2557C8 | Authored for this standalone browser interpretation. This value is not presented as an official One UI design token. |
| Card radius | 24px | Authored for this standalone browser interpretation. This value is not presented as an official One UI design token. |
| Minimum control height | 48px | Authored for this standalone browser interpretation. This value is not presented as an official One UI design token. |
| Reading-size options | 100%, 150%, 200% | Authored for this standalone browser interpretation. This value is not presented as an official One UI design token. |

## Samsung One UI Design System One UI Design Guidance and Browser Scope

### Treat One UI as platform guidance

One UI describes interaction across Samsung devices, including phones, larger screens and foldables. It is not a generic web component package. The supplied example is an original browser study of reading preferences. It demonstrates a viewing region, a lower interaction region and explicit recovery, while making no claim to run Samsung components or change a device setting.

### Keep implementation values honest

The reference separates published requirements from authored browser values. A 24dp native margin is recorded in its original unit; the preview’s 24px inset is a deliberate web interpretation. The blue, gray surfaces and 24px card radius are original study values. This distinction prevents an agent from treating a visually plausible CSS variable as a verified Samsung token.

- Keep dp and CSS px distinct.
- Label original palette and radius choices as original.
- Do not describe a browser preview as a Samsung system setting.

## Samsung One UI Design System Viewing Area and Reachable Actions

### Give the opening area a useful role

The upper region names Reading preferences and provides a short context line. Below it, grouped settings and a reading sample carry the task. Apply and reset appear after those groups. The structure makes the title easy to read while keeping the meaningful actions together, rather than distributing unrelated controls around a decorative device frame.

### Adapt the structure instead of faking a device

The browser study has no operating-system status bar, camera cutout or device permissions. Its narrow layout keeps all settings available and allows the action row to stack. Native implementations still need to account for real safe areas, cutouts, orientation and foldable changes. A responsive browser screenshot cannot verify those device-specific behaviors.

## Samsung One UI Design System Quiet Surfaces and Explicit Appearance

### Use background blocks to group related content

Each setting and the reading sample sit on a quiet card surface. The action color identifies interactive choices, while the descriptive text uses a separate muted role. The dark appearance changes the same roles instead of placing a dark overlay on a light interface. All of these CSS colors are authored interpretation values, and the downloadable source labels them accordingly.

### Preserve settings when appearance changes

The appearance checkbox affects only the preview’s theme. It does not clear the selected reading size or imply that a Samsung system preference has changed. The application clears any earlier applied confirmation when a choice changes, so the status message cannot describe a state that is no longer current.

## Samsung One UI Design System Reading Scale and Reflow

### Demonstrate the 200 percent case explicitly

The reading-size control provides 100, 150 and 200 percent options. It changes the sample paragraph’s font size and lets its card grow naturally. The text does not truncate, overlap adjacent controls or require a second fixed-height region. The control is specifically a reading sample, not a claim to change every browser or operating-system font setting.

### Keep the complete words available

The paragraph uses ordinary text and a line height that scales with it. At the narrowest tested width, words wrap within the card and the content remains available in document order. This demonstrates one reflow case; a production interface must additionally test its complete labels, translations and real user content under native accessibility settings.

## Samsung One UI Design System Apply, Reset and Dialog Focus

### Use confirmation language that matches the action

Apply to this preview reports the chosen appearance and reading percentage. The message explicitly says nothing was sent to a device. It is a persistent status message instead of a quickly disappearing toast, giving a reader time to inspect the result. Changing either setting clears that previous confirmation.

### Make resetting an explicit choice

Reset opens a native browser dialog with Keep preferences and Reset actions. Cancel and Escape retain both current choices. Confirming reset restores the light appearance and standard size, then returns focus to the action that opened the dialog. The complete state transition is provided in source rather than described as an unspecified handler.

## Samsung One UI Design System Complete Browser Study and Native Next Steps

### Run without an invented One UI dependency

The complete HTML document includes all styles, content and JavaScript. Save it as index.html and serve it locally. It makes no external font or runtime request and requires no Samsung SDK. When moving to a native app, use the official One UI and Android resources for actual platform controls, density units, accessibility services and configuration changes.

1. Save the supplied self-contained HTML document.
2. Serve its directory locally and open the preview.
3. Test 200 percent reading size and both appearance modes.
4. Verify cancel, Escape and confirmed reset separately.

### Test the sequence that exposes mistakes

Choose dark appearance and 200 percent reading size, apply them and inspect the confirmation. Open reset, cancel and verify both choices remain. Repeat with Escape, then confirm reset and verify the values and focus return. Review the enlarged paragraph at desktop and phone widths, checking that no words or controls are clipped.

## Component Examples

### index.html — complete reading-preferences study

The complete layout, light/dark roles, text-scale control and cancel-safe reset dialog.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reading preferences study</title><style>
/* Original web-study values, not exported Samsung design tokens. */
:root{--study-background:#f3f3f6;--study-card:#fff;--study-text:#17171c;--study-muted:#5b5b66;--study-action:#2557c8;--study-border:#d9d9e1;--study-text-scale:1}*{box-sizing:border-box}body{margin:0;background:var(--study-background);font-family:Arial,sans-serif;color:var(--study-text)}body.dark{--study-background:#101014;--study-card:#222228;--study-text:#f7f7fb;--study-muted:#bbbbc8;--study-action:#9bbaff;--study-border:#41414c}main{max-width:980px;padding:32px;margin:auto}.context{font-size:13px;line-height:1.6;color:var(--study-muted);max-width:74ch}.phone{max-width:560px;margin:32px auto;background:var(--study-background)}.viewing{padding:40px 24px 32px;min-height:230px;display:flex;flex-direction:column;justify-content:flex-end}.viewing p{font-size:14px;margin:0 0 16px;color:var(--study-muted)}h1{font-size:40px;line-height:1.15;margin:0;letter-spacing:-.025em}h2,.setting-title{font-size:20px;line-height:1.4;margin:0}section.settings{padding:0 24px}.card{border-radius:24px;background:var(--study-card);padding:24px;margin-bottom:16px}.setting{display:flex;gap:24px;justify-content:space-between;align-items:center}.setting p{font-size:14px;line-height:1.5;color:var(--study-muted);margin:8px 0 0}input[type=checkbox]{width:28px;height:28px;accent-color:var(--study-action);flex-shrink:0}label{cursor:pointer}.field{display:grid;gap:12px}select,button{font:inherit}select{width:100%;border:1px solid var(--study-border);border-radius:12px;padding:12px;background:var(--study-card);color:var(--study-text);min-height:48px}.sample{font-size:calc(16px * var(--study-text-scale));line-height:1.55;overflow-wrap:anywhere;margin:16px 0 0}.actions{padding:16px 24px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px}button{border:0;border-radius:999px;min-height:48px;padding:12px 16px;color:var(--study-action);background:var(--study-card);font-weight:700;cursor:pointer}.primary{background:var(--study-action);color:var(--study-background)}:focus-visible{outline:3px solid var(--study-action);outline-offset:4px}dialog{width:min(440px,calc(100% - 32px));border:0;border-radius:24px;padding:24px;background:var(--study-card);color:var(--study-text)}dialog::backdrop{background:#0008}dialog p{line-height:1.6}dialog .dialog-actions{display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap}#confirmation{font-size:14px;line-height:1.5;padding:0 24px 16px;color:var(--study-muted)}#confirmation:empty{display:none}@media(max-width:600px){main{padding:16px}.phone{margin:16px auto}.viewing{padding:32px 24px}.card{padding:20px}.actions{grid-template-columns:1fr}.setting{gap:16px}h1{font-size:34px}h2,.setting-title{font-size:18px}}
</style></head><body><main><p class="context">OpenDesign original One UI-inspired web study. This demonstrates viewing and interaction areas, readable settings and explicit recovery. It does not control a Samsung device or run native One UI components.</p><div class="phone"><header class="viewing"><p>Make space to read</p><h1>Reading preferences</h1></header><section class="settings" aria-label="Reading preferences"><div class="card"><label class="setting"><span><strong class="setting-title">Dark appearance</strong><p>Use a darker surface in this preview.</p></span><input type="checkbox" id="dark" aria-label="Dark appearance"></label></div><div class="card"><label class="field" for="size"><strong class="setting-title">Reading size</strong><select id="size"><option value="1">Standard · 100%</option><option value="1.5">Large · 150%</option><option value="2">Extra large · 200%</option></select></label></div><div class="card"><h2>A moment to pause</h2><p class="sample">A clear page gives each idea room to breathe. Keep the words that help the reader decide what to do next.</p></div></section><div class="actions"><button id="reset">Reset preferences</button><button class="primary" id="apply">Apply to this preview</button></div><p id="confirmation" role="status"></p></div><dialog aria-labelledby="reset-title"><h2 id="reset-title">Reset reading preferences?</h2><p>This returns the preview to its light appearance and standard reading size.</p><div class="dialog-actions"><button id="cancel">Keep preferences</button><button id="confirm-reset" class="primary">Reset</button></div></dialog><p class="context">Published references include the 24dp side-margin guidance and text scaling up to 200%. CSS pixels here are an original browser interpretation of the layout; app colors and radii are explicitly original. Reading-size changes affect the sample paragraph so its reflow can be inspected. No preference is saved beyond this page.</p></main><script>
const dark=document.querySelector('#dark'),size=document.querySelector('#size'),confirmation=document.querySelector('#confirmation'),dialog=document.querySelector('dialog');function refresh(){document.body.classList.toggle('dark',dark.checked);document.documentElement.style.setProperty('--study-text-scale',size.value);confirmation.textContent='';}dark.onchange=refresh;size.onchange=refresh;document.querySelector('#apply').onclick=()=>{confirmation.textContent=`Applied to this preview: ${dark.checked?'dark':'light'} appearance, ${Math.round(Number(size.value)*100)}% reading size. Nothing was sent to a device.`};document.querySelector('#reset').onclick=()=>dialog.showModal();document.querySelector('#cancel').onclick=()=>dialog.close();document.querySelector('#confirm-reset').onclick=()=>{dark.checked=false;size.value='1';refresh();dialog.close();confirmation.textContent='Light appearance and standard reading size restored.';};dialog.addEventListener('close',()=>document.querySelector('#reset').focus());
</script></body></html>

```

[Code reference](https://developer.samsung.com/one-ui/accessibility/interaction-and-control.html)

- Study-prefixed colors and dimensions are original web choices.
- Reading scale changes the sample paragraph; no browser or device preference is modified.

## Implementation Starting Point

This runs the original browser study. There is no One UI npm package or native Samsung runtime in this example.

```sh
# Save the supplied complete example as index.html.
python3 -m http.server 8000
# Open http://localhost:8000/
```

## Agent Prompt

Build the supplied One UI-inspired reading study as an explicitly original browser interpretation. Preserve viewing and interaction areas, responsive text reflow at 200%, explicit appearance state, local-only confirmation, cancel-safe reset and focus return. Keep native dp requirements separate from original CSS pixel decisions.

## Sources

- [One UI principles](https://developer.samsung.com/one-ui/index.html) — Viewing, interaction and adaptable experience.
- [Grid system](https://developer.samsung.com/one-ui/layout/grid.html) — 24dp margins, cutouts and device contexts.
- [Layout and typography](https://developer.samsung.com/one-ui/accessibility/layout-and-typo.html) — 200 percent text scaling and target separation.
- [Interaction and control](https://developer.samsung.com/one-ui/accessibility/interaction-and-control.html) — Recovery, alternate input and explicit navigation.
- [Color system](https://developer.samsung.com/one-ui/color/system.html) — Quiet focus blocks and deliberate color roles.
