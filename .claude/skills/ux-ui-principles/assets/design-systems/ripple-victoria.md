# Ripple Design System — OpenDesign Application Guide

Explore Ripple’s actual color roles, 14-step spacing scale and responsive type references through a complete workshop timeline with progressive disclosure, progress and next-step keyboard focus.

An OpenDesign HTML/CSS interpretation using published Ripple design values and the documented Arial fallback. This preview does not run Ripple Vue components or include VIC font assets.

## Source Reference

- **Reference:** 35 documented values and role references ([source](https://www.ripple.sdp.vic.gov.au/design-system/design/design-tokens/))
- **Typography:** Published VIC stack; preview uses Arial fallback ([source](https://www.ripple.sdp.vic.gov.au/design-system/styles/typography/))
- **Native integration:** GitHub Packages access required by official setup ([source](https://www.ripple.sdp.vic.gov.au/design-system/develop/usage/css-only/))


## Design Reference

Published Ripple design documentation checked for this study: default color roles, spacing, type size/line-height pairs and focus colors. These are design references, not a claim of a bundled native Ripple release.

### Published color roles

[Official reference](https://www.ripple.sdp.vic.gov.au/design-system/styles/colour/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --rpl-clr-primary | #0052C2 | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-primary-alt | #003174 | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-accent | #0095EC | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-accent-alt | #E6F5FD | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-neutral-0 | #FFFFFF | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-neutral-100 | #F5F5F5 | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-neutral-200 | #E6E6E6 | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-neutral-700 | #333333 | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-neutral-800 | #1A1A1A | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-type-default | #1A1A1A | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-link | #0052C2 | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |
| --rpl-clr-link-visited | #9F46B1 | Documented default Ripple palette; theme values can differ. Keep the role name when applying a theme. |

### Published spacing scale

[Official reference](https://www.ripple.sdp.vic.gov.au/design-system/styles/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --rpl-sp-1 | 4px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-2 | 8px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-3 | 12px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-4 | 16px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-5 | 20px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-6 | 24px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-7 | 28px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-8 | 32px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-9 | 40px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-10 | 48px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-11 | 56px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-12 | 64px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-13 | 80px | Documented spacing step. Later steps are not the index multiplied by four. |
| --rpl-sp-14 | 120px | Documented spacing step. Later steps are not the index multiplied by four. |

### Type roles and fallback

[Official reference](https://www.ripple.sdp.vic.gov.au/design-system/styles/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| rpl-type-font-family | VIC, Arial, Helvetica, sans-serif | Size/line-height pairs from the published type roles. The standalone example uses the documented Arial fallback, not the VIC face. |
| rpl-type-h1 | 32/36px small · 56/60px large · 700 | Size/line-height pairs from the published type roles. The standalone example uses the documented Arial fallback, not the VIC face. |
| rpl-type-h2 | 24/32px small · 32/40px large · 700 | Size/line-height pairs from the published type roles. The standalone example uses the documented Arial fallback, not the VIC face. |
| rpl-type-h3 | 20/28px small · 24/32px large · 700 | Size/line-height pairs from the published type roles. The standalone example uses the documented Arial fallback, not the VIC face. |
| rpl-type-p | 16/24px | Size/line-height pairs from the published type roles. The standalone example uses the documented Arial fallback, not the VIC face. |
| rpl-type-p-small | 14/20px | Size/line-height pairs from the published type roles. The standalone example uses the documented Arial fallback, not the VIC face. |

### Focus contrast

[Official reference](https://www.ripple.sdp.vic.gov.au/design-system/styles/focus-state/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --rpl-clr-focus | #FF9E1B | Published focus colors. The example implements its own focus CSS rather than importing Ripple utility classes. |
| --rpl-clr-focus-contrast | #1A1A1A | Published focus colors. The example implements its own focus CSS rather than importing Ripple utility classes. |
| --rpl-clr-dark | #1A1A1A | Published focus colors. The example implements its own focus CSS rather than importing Ripple utility classes. |

## Ripple Design System Foundations and Runtime Scope

### Separate a design reference from a component runtime

The reference describes the published Ripple design system. The working workshop timeline is a complete original HTML, CSS and JavaScript interpretation of selected values. It does not run Ripple Vue components, use an undocumented package mirror or claim to be a Victorian Government service. This boundary is visible in the preview and remains in the downloadable source.

### Choose the native integration deliberately

Ripple publishes a Vue-oriented package path and a styles-only path through its core package. Official installation requires GitHub Packages access. The styles-only route still leaves markup and behavior with the application. Use the linked official access instructions and pin a chosen release when integrating that distribution; the standalone study below needs neither authentication nor a package installation.

## Ripple Design System Color Roles and Keyboard Focus

### Preserve the distinction between brand and content

The timeline header uses the darker primary value, its edge uses the accent, and reading text uses the neutral text role. These are separate CSS variables in the supplied source. The original status panel uses the pale accent surface. The reference includes role names as well as values so a future theme change can update the intended relationship rather than a set of unrelated hex literals.

### Make keyboard focus visibly different

Focus is orange with dark content, rather than another shade of the default blue. The original button and summary focus rule changes their surface and draws a dark outline. Checkbox focus remains an outline. This is an implementation of the published focus color approach, not a claim that the sample imports Ripple’s native focus utilities or establishes accessibility for every possible theme.

## Ripple Design System Spacing and Responsive Typography

### Use the real spacing sequence

The source uses named 8, 16, 24, 32 and 48px steps for its reading rhythm. The full reference also records larger steps; the sequence stops being a simple multiple of the index, so rpl-sp-9 is 40px rather than 36px. The authored grid gap and section padding deliberately share scale entries while serving different layout roles.

### Keep the font boundary explicit

Ripple documents VIC with Arial and Helvetica fallbacks. This study supplies no VIC font file and uses Arial explicitly. The heading changes from 32/36px to 56/60px at the example’s 992px breakpoint, while body text remains 16/24px. These font size and line-height values are documented references; the timeline composition is original and should not be described as a pixel-identical native component.

## Ripple Design System Timeline Content and Progressive Disclosure

### Give each stage a distinct job

The first stage defines the decision, the second prepares participation and the third records an action. Relative time labels communicate sequence without inventing a government deadline or service promise. Each stage has a short summary that remains visible and additional preparation notes in a native details element. The sequence remains an ordered list even though its visual markers are custom.

- Relative time describes the workshop sequence.
- Visible summaries communicate each stage’s purpose.
- Expandable notes carry secondary detail.
- Readiness is an explicit checkbox action.

### Do not confuse reading with readiness

Expanding preparation notes does not mark a stage complete. The separate checkbox records readiness, and the progress count derives only from checked items. This prevents a user from accidentally completing work by merely reading it. The source contains every item and all state logic, so the distinction is inspectable and editable.

## Ripple Design System Progress, Next-Step Focus and Reset

### Derive the next action from the current state

Go to next unfinished step finds the first unchecked stage, expands its notes and focuses its checkbox. It does not skip a stage merely because the reader previously opened it. Once all three checkboxes are selected, the next-step button is disabled and the status states that all preparation steps are ready. Unchecking an item makes that action available again.

### Reset every related state together

Reset clears the three checkboxes, closes the notes, updates the progress element and returns focus to the first checkbox. It does not leave a completed banner behind or pretend that a remote record was deleted. State is intentionally in memory for this local study, and the visible explanation says that it is not saved or sent.

## Ripple Design System Complete Source and Verification

### Run the self-contained study

Save the supplied complete document as index.html and serve its directory. It includes its own tokens, markup, readable sample content and interaction code, so there are no external runtime or font requests. The reference links remain the place to check native Ripple APIs, release choices and authorized brand assets before building a real service.

1. Save the complete HTML example as index.html.
2. Serve the directory locally.
3. Test next-step focus, completion and reset with a keyboard.
4. Use official package access and pinned versions for a separate native Ripple integration.

### Verify the whole state transition

Mark the first item ready, use the next-step action and verify focus moves to the second checkbox with its notes expanded. Finish every item, confirm the next-step action disables, then uncheck an item and verify it becomes available again. Reset and check both progress and disclosures. At a phone width, the status panel moves below the timeline and all controls remain available.

## Component Examples

### index.html — complete workshop timeline

All token values, responsive styling, content, progress and focus behavior in one runnable document.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workshop planning timeline</title><style>
:root{--rpl-clr-primary:#0052c2;--rpl-clr-primary-alt:#003174;--rpl-clr-accent:#0095ec;--rpl-clr-accent-alt:#e6f5fd;--rpl-clr-type-default:#1a1a1a;--rpl-clr-neutral-0:#fff;--rpl-clr-neutral-100:#f5f5f5;--rpl-clr-neutral-200:#e6e6e6;--rpl-clr-focus:#ff9e1b;--rpl-clr-focus-contrast:#1a1a1a;--rpl-sp-2:8px;--rpl-sp-4:16px;--rpl-sp-6:24px;--rpl-sp-8:32px;--rpl-sp-10:48px;--rpl-type-font-family:Arial,Helvetica,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--rpl-clr-neutral-0);color:var(--rpl-clr-type-default);font:16px/1.5 var(--rpl-type-font-family)}main{max-width:1160px;margin:auto;padding:var(--rpl-sp-8)}header{background:var(--rpl-clr-primary-alt);color:white;padding:var(--rpl-sp-8);border-bottom:8px solid var(--rpl-clr-accent)}.eyebrow{font-size:12px;letter-spacing:.08em;font-weight:700}h1{font-size:32px;line-height:36px;margin:16px 0;max-width:20ch}header p:last-child{max-width:65ch;margin-bottom:0}.layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(220px,1fr);gap:var(--rpl-sp-10);margin-top:var(--rpl-sp-8)}h2{font-size:24px;line-height:32px;margin:0 0 16px}h3{font-size:20px;line-height:28px;margin:0}.timeline{list-style:none;margin:0;padding:0 0 0 24px;border-left:2px solid var(--rpl-clr-primary);}.timeline>li{position:relative;padding:0 0 32px 8px}.timeline>li:before{content:'';position:absolute;width:14px;height:14px;background:var(--rpl-clr-primary);border:3px solid white;outline:2px solid var(--rpl-clr-primary);border-radius:50%;left:-32px;top:6px}.when{font-size:14px;font-weight:700;color:var(--rpl-clr-primary);margin:0 0 8px}.timeline p{margin:8px 0 16px}.timeline label{display:flex;align-items:flex-start;gap:8px;font-weight:700}.timeline input{width:20px;height:20px;flex-shrink:0;margin:2px 0;accent-color:var(--rpl-clr-primary)}details{background:var(--rpl-clr-neutral-100);margin:16px 0;padding:16px}summary{font-weight:700;cursor:pointer}details ul{padding-left:24px}.progress{background:var(--rpl-clr-accent-alt);padding:24px;align-self:start;border-top:4px solid var(--rpl-clr-primary)}progress{width:100%;height:16px;accent-color:var(--rpl-clr-primary)}button{font:700 16px/24px var(--rpl-type-font-family);padding:12px 16px;cursor:pointer;border:2px solid var(--rpl-clr-primary);background:var(--rpl-clr-primary);color:white;text-align:left;max-width:100%}button:hover{background:var(--rpl-clr-primary-alt)}.secondary{color:var(--rpl-clr-primary);background:white;margin-top:16px}button:disabled{cursor:default;opacity:.6}.progress button{width:100%;margin-top:16px}button:focus-visible,summary:focus-visible{outline:3px solid var(--rpl-clr-focus-contrast);outline-offset:2px;background:var(--rpl-clr-focus);color:var(--rpl-clr-focus-contrast);border-radius:0}input:focus-visible{outline:3px solid var(--rpl-clr-focus);outline-offset:3px}.note{font-size:14px;border-top:1px solid var(--rpl-clr-neutral-200);padding-top:24px;margin-top:8px;max-width:80ch}[hidden]{display:none!important}@media(min-width:992px){h1{font-size:56px;line-height:60px}h2{font-size:32px;line-height:40px}}@media(max-width:760px){main{padding:20px}header{padding:24px}.layout{grid-template-columns:1fr;gap:24px}.eyebrow{overflow-wrap:anywhere}}
</style></head><body><main><header><p class="eyebrow">OpenDesign · Workshop practice</p><h1>Make room for a useful conversation</h1><p>A short planning timeline for a team workshop. Mark what is ready and jump to the next unfinished step.</p></header><div class="layout"><section aria-labelledby="plan-heading"><h2 id="plan-heading">Your preparation timeline</h2><ol class="timeline">
<li><p class="when">One week before</p><h3>Define the decision</h3><p>Agree on the question the workshop should answer and the people who need to take part.</p><details><summary>Preparation notes</summary><ul><li>Write a one-sentence outcome.</li><li>Invite people with different perspectives on the decision.</li><li>Explain what is already decided and what is still open.</li></ul></details><label><input type="checkbox" data-step="0">The purpose and invitations are ready</label></li>
<li><p class="when">Two days before</p><h3>Prepare for participation</h3><p>Share a short agenda and offer a way to contribute before the session.</p><details><summary>Preparation notes</summary><ul><li>Send readable material in advance.</li><li>Check access needs and remote participation.</li><li>Choose someone to capture decisions.</li></ul></details><label><input type="checkbox" data-step="1">The agenda and access arrangements are ready</label></li>
<li><p class="when">On the day</p><h3>Leave with a next step</h3><p>Close with a clear decision, an owner and a date to review what happens next.</p><details><summary>Preparation notes</summary><ul><li>Leave time to compare different views.</li><li>Record unanswered questions separately.</li><li>Read back the agreed action before closing.</li></ul></details><label><input type="checkbox" data-step="2">The action and follow-up are recorded</label></li>
</ol></section><aside class="progress" aria-labelledby="progress-heading"><h2 id="progress-heading">Preparation status</h2><p id="count" role="status">0 of 3 steps ready</p><progress max="3" value="0" aria-label="Preparation progress"></progress><p id="next-note">Next: Define the decision</p><button id="next" type="button">Go to next unfinished step</button><button class="secondary" id="reset" type="button">Reset checklist</button></aside></div><p class="note">An original OpenDesign HTML/CSS study using published Ripple color, spacing and type values. It uses Arial, Ripple’s documented fallback, and does not run the Ripple Vue components or supply the VIC font. The checklist stays in this page and is not saved or sent.</p></main><script>
const checks=[...document.querySelectorAll('[data-step]')],names=['Define the decision','Prepare for participation','Leave with a next step'];const next=document.querySelector('#next');
function update(){let count=checks.filter(c=>c.checked).length,first=checks.findIndex(c=>!c.checked);document.querySelector('#count').textContent=`${count} of 3 steps ready`;document.querySelector('progress').value=count;document.querySelector('#next-note').textContent=first<0?'All three preparation steps are ready.':'Next: '+names[first];next.disabled=first<0;}
checks.forEach(c=>c.addEventListener('change',update));next.addEventListener('click',()=>{let check=checks.find(c=>!c.checked);if(check){check.closest('li').querySelector('details').open=true;check.focus();}});document.querySelector('#reset').addEventListener('click',()=>{checks.forEach(c=>c.checked=false);document.querySelectorAll('details').forEach(d=>d.open=false);update();checks[0].focus();});update();
</script></body></html>

```

[Code reference](https://www.ripple.sdp.vic.gov.au/design-system/design/design-tokens/)

- This is original application code, not the source of a Ripple Vue component.
- No external runtime, font request, account or data submission is needed.

## Implementation Starting Point

This command serves the self-contained interpretation. For native Ripple, follow the official GitHub Packages access and Vue or styles-only setup linked in Sources.

```sh
# Save the complete example as index.html in an empty directory.
python3 -m http.server 8000
# Open http://localhost:8000/
```

## Agent Prompt

Build the complete original workshop timeline from the supplied document. Preserve Ripple’s documented role values and spacing, the explicit Arial fallback, distinct reading and readiness states, next unfinished-step focus, completion and full reset. Label the result as an HTML/CSS interpretation, not a native Ripple Vue implementation.

## Sources

- [Color roles](https://www.ripple.sdp.vic.gov.au/design-system/styles/colour/) — Default palette and content roles.
- [Spacing](https://www.ripple.sdp.vic.gov.au/design-system/styles/spacing/) — The complete published spacing sequence.
- [Typography](https://www.ripple.sdp.vic.gov.au/design-system/styles/typography/) — VIC, fallbacks and responsive type pairs.
- [Focus states](https://www.ripple.sdp.vic.gov.au/design-system/styles/focus-state/) — Orange/dark focus treatment.
- [Native styles-only setup](https://www.ripple.sdp.vic.gov.au/design-system/develop/usage/css-only/) — Package access and styles-only responsibilities.
- [Design tokens](https://www.ripple.sdp.vic.gov.au/design-system/design/design-tokens/) — Role naming and theme relationships.
