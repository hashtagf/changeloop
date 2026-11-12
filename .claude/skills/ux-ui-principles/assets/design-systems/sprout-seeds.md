# Sprout Social Seeds Design System — OpenDesign Application Guide

Inspect Seeds’ actual public color, spacing, product typography and border tokens through a complete editorial review queue with mixed selection, filtered empty states and undo.

An original OpenDesign application using published Seeds token packages. The cards and review workflow are original HTML/JavaScript, not native Seeds React components. No social account is connected and nothing is published.

## Source Reference

- **Token source:** Four pinned public Seeds packages ([source](https://seeds.sproutsocial.com/resources/tokens/))
- **Typography:** Product system-font family ([source](https://seeds.sproutsocial.com/visual/product-typography/))
- **Reference:** 38 concrete token exports ([source](https://seeds.sproutsocial.com/resources/tokens/))


## Design Reference

Actual installed Seeds color 2.5.0, space 0.8.1, typography 3.8.0 and border 1.7.1 CSS exports.

### Product-study palette references

[Official reference](https://seeds.sproutsocial.com/resources/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-neutral-0 | #ffffff | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-neutral-100 | #f3f4f4 | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-neutral-200 | #dee1e1 | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-neutral-700 | #515e5f | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-neutral-900 | #273333 | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-blue-0 | #e9f4ff | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-blue-300 | #a1c2f8 | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-blue-700 | #205bc3 | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-green-100 | #d7f4d7 | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |
| --color-green-900 | #006b40 | Actual published palette tokens. Their mapping to this original queue’s actions and statuses is application-specific. |

### Complete fixed spacing scale

[Official reference](https://seeds.sproutsocial.com/resources/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --space-size--0 | 0px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--100 | 2px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--200 | 4px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--300 | 8px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--350 | 12px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--400 | 16px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--450 | 24px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--500 | 32px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |
| --space-size--600 | 40px | Actual CSS pixel tokens. The package also has rem equivalents based on an 18px baseline; do not assume a 16px conversion. |

### Product type and readable density

[Official reference](https://seeds.sproutsocial.com/resources/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --typography-family | system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-font-size--100 | 11px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-font-size--200 | 13px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-font-size--300 | 16px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-font-size--400 | 18px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-font-size--500 | 21px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-font-size--600 | 24px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-font-size--700 | 32px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-line-height--300 | 24px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |
| --typography-line-height--500 | 29.333333333333332px | Published typography package values. The product example uses the system family, not the marketing Proxima Nova face. |

### Shape and border scale

[Official reference](https://seeds.sproutsocial.com/resources/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --border-radius-400 | 4px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-radius-500 | 6px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-radius-600 | 8px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-radius-800 | 12px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-radius-900 | 24px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-radius-1000 | 999999px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-width-500 | 1px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-width-600 | 2px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |
| --border-width-700 | 3px | Actual border package values; the original cards consume 8px rounding and one-pixel borders. |

## Sprout Social Seeds Design System Product Tokens and Runtime Scope

### Use the product foundations

Seeds distinguishes product typography from brand typography. The queue uses the actual system-font family token from the public typography package, together with published color, space and border tokens. It does not load a marketing typeface and then claim to reproduce the product system. The package versions are pinned in the setup so the reference and example remain comparable.

### Separate tokens from components

Loading Seeds token packages exposes variables; it does not create a post editor or a React component tree. The cards, selection logic and local review action in this study are original OpenDesign code. The page deliberately calls this a token-based implementation. Native Seeds React components have their own integration requirements through the official component resources.

## Sprout Social Seeds Design System Palette, Spacing and Type References

### Use exact token names

The reference includes actual exported names such as --space-size--350 for 12px and --border-radius-600 for 8px. These names cannot be inferred by multiplying a scale label. The CSS imports the token files directly and consumes their variables, so a reader can trace a rendered value back to the pinned distribution instead of a guessed palette.

### Watch the rem baseline

The space package supplies both pixel and rem forms. For example, its 16px step is also represented as 0.8888888888888888rem, reflecting an 18px baseline. The study uses pixel token forms to keep its intended spacing explicit. Blindly substituting those rem values into a 16px root would change the density rather than preserve it.

## Sprout Social Seeds Design System Editorial Cards and Review Context

### Make each card useful before interaction

Every card has a channel, a status, an original title and a complete short post. A secondary disclosure provides review criteria. The content is fictional practice material and the workspace has no social-account connection. A card can therefore communicate a believable task without implying access to actual posts or analytics.

### Keep brand accents subordinate to reading

Blue identifies the original queue’s review action and green accompanies its Ready for review text. These role assignments are application decisions using real palette entries. The status is always written out, so the meaning is not dependent on seeing the color. Borders and spacing separate the three posts without replacing readable content with decorative placeholders.

## Sprout Social Seeds Design System Visible Selection and Mixed State

### Keep bulk selection tied to the current view

Select visible posts acts on the filtered set. Selecting only one of several visible cards gives the bulk checkbox its native indeterminate state. Changing the filter clears the selection, preventing a hidden record from being changed by a later action. The visible count reports both the number shown and number selected.

- Bulk selection applies only to visible records.
- Mixed selection uses the native indeterminate property.
- Changing the filter clears selection.
- Action state is derived from selected draft records.

### Enable only a meaningful action

Mark ready for review is enabled only when at least one selected visible post is a Draft. Already-ready records are not toggled backward by that action. The update changes only the selected drafts, clears their selection and recomputes the view. No network publication or scheduling operation occurs.

## Sprout Social Seeds Design System Filtered Empty States and Undo

### Keep an empty queue recoverable

Marking all visible drafts ready while viewing Draft naturally leaves an empty result. The empty state explains that the records still exist and provides Show all posts. It does not display a loading spinner or fabricate a network error for a known local result. The distinction between no matches and no records remains visible.

### Undo the last actual change

The application stores the previous status only for records changed by the latest review action. Undo restores those values, rerenders the current view and returns focus to the filter. It does not reset unrelated records or pretend to undo a published social post. A subsequent batch replaces the single available undo operation, matching the label Undo last change.

## Sprout Social Seeds Design System Complete Runnable Queue and Checks

### Use all four token distributions

The source imports color, space, typography and border CSS before the original composition stylesheet. Save the full main.js, seeds.css and HTML shell together. The preview bundles those same public values and application code without remote fonts or a backend. The exact package versions appear in the installation command.

1. Install the four pinned Seeds token packages.
2. Save the supplied entry, CSS and root HTML.
3. Test mixed selection before changing the filter.
4. Verify filtered-empty recovery and undo after a batch review.

### Test a combination of states

Select one post and verify the mixed bulk state. Change to Draft and check that selection clears. Select the visible drafts, mark them ready and inspect the empty result. Undo and confirm the two drafts return, then show all posts. At a phone width the cards become a single reading column while labels and review controls remain accessible.

## Component Examples

### main.js — complete editorial queue

Original data, filter, mixed selection, batch change and undo.

```javascript
import '@sproutsocial/seeds-color/dist/seeds-color.css';
import '@sproutsocial/seeds-space/dist/seeds-space.css';
import '@sproutsocial/seeds-typography/dist/seeds-typography.css';
import '@sproutsocial/seeds-border/dist/seeds-border.css';
import './seeds.css';
let items=[{id:'p1',title:'A clearer first step',channel:'Team updates',copy:'A useful guide starts with the task someone needs to complete. This week, we are revisiting the first step in our workshop toolkit.',status:'Draft'},{id:'p2',title:'Room for different perspectives',channel:'Community notes',copy:'Good workshop preparation creates more than an agenda. It gives people time to think and more than one way to contribute.',status:'Draft'},{id:'p3',title:'From notes to next actions',channel:'Team updates',copy:'Close a conversation with a decision, an owner and a date to look again. Keep open questions visible alongside the agreed next step.',status:'Ready for review'}];let chosen=new Set(),previous=null;
document.querySelector('#root').innerHTML=`<main><header><div><p class="eyebrow">OpenDesign · Editorial practice</p><h1>A small queue, ready for a closer look</h1><p>Prepare original sample posts for review. This workspace does not connect to social accounts or publish content.</p></div><span class="badge">3 sample posts</span></header><section class="filters" aria-label="Queue controls"><label>Status <select id="filter"><option>All posts</option><option>Draft</option><option>Ready for review</option></select></label><label class="select-all"><input type="checkbox" id="all">Select visible posts</label><button id="review" disabled>Mark ready for review</button></section><p id="count" role="status"></p><div id="posts"></div><section id="empty" hidden><h2>No posts in this view</h2><p>Your sample posts remain available in the full queue.</p><button id="clear">Show all posts</button></section><div id="notice" hidden><p id="message" role="status"></p><button id="undo">Undo last change</button></div><footer>Uses the published Seeds color, space, typography and border token packages. The post cards, selection model and local review action are original OpenDesign code, not Sprout Social’s application or native React components.</footer></main>`;
function visible(){let value=document.querySelector('#filter').value;return items.filter(x=>value==='All posts'||x.status===value)}
function updateSelection(){let rows=visible(),selected=rows.filter(x=>chosen.has(x.id));const all=document.querySelector('#all');all.checked=rows.length>0&&selected.length===rows.length;all.indeterminate=selected.length>0&&selected.length<rows.length;all.disabled=!rows.length;document.querySelector('#review').disabled=!selected.some(x=>x.status==='Draft');document.querySelector('#count').textContent=`${rows.length} posts shown · ${selected.length} selected`;}
function render(){let rows=visible();chosen=new Set([...chosen].filter(id=>rows.some(x=>x.id===id)));const root=document.querySelector('#posts');root.replaceChildren(...rows.map(x=>{let a=document.createElement('article');a.innerHTML=`<div class="post-head"><label><input type="checkbox" data-id="${x.id}" aria-label="Select ${x.title}" ${chosen.has(x.id)?'checked':''}><span class="channel">${x.channel}</span></label><span class="status ${x.status==='Draft'?'draft':'ready'}">${x.status}</span></div><h2>${x.title}</h2><p class="copy">${x.copy}</p><details><summary>Review checklist</summary><ul><li>The first sentence makes the subject clear.</li><li>The wording describes a real next step.</li><li>The post does not promise an unavailable feature.</li></ul></details>`;a.querySelector('input').onchange=e=>{e.target.checked?chosen.add(x.id):chosen.delete(x.id);updateSelection()};return a}));document.querySelector('#empty').hidden=rows.length>0;updateSelection();}
document.querySelector('#filter').onchange=()=>{chosen.clear();render()};document.querySelector('#all').onchange=e=>{chosen=new Set(e.target.checked?visible().map(x=>x.id):[]);render()};document.querySelector('#review').onclick=()=>{let changed=items.filter(x=>chosen.has(x.id)&&x.status==='Draft');if(!changed.length)return;previous=changed.map(x=>({id:x.id,status:x.status}));changed.forEach(x=>x.status='Ready for review');chosen.clear();render();document.querySelector('#notice').hidden=false;document.querySelector('#message').textContent=`${changed.length} ${changed.length===1?'post marked':'posts marked'} ready for review locally. Nothing was published.`;};document.querySelector('#undo').onclick=()=>{previous?.forEach(p=>{items.find(x=>x.id===p.id).status=p.status});previous=null;render();document.querySelector('#notice').hidden=true;document.querySelector('#filter').focus()};document.querySelector('#clear').onclick=()=>{document.querySelector('#filter').value='All posts';render();document.querySelector('#filter').focus()};render();

```

[Code reference](https://seeds.sproutsocial.com/resources/tokens/)

- No social API, publishing operation or native React component is implied.

### seeds.css — composition using real tokens

The complete responsive layout consumes the installed CSS variables.

```css
*{box-sizing:border-box}body{margin:0;font:var(--typography-font-size--300)/var(--typography-line-height--300) var(--typography-family);color:var(--color-neutral-900);background:var(--color-neutral-100)}main{max-width:1160px;padding:var(--space-size--500);margin:auto}header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:32px}h1{font-size:var(--typography-font-size--700);line-height:var(--typography-line-height--700);margin:8px 0 16px;max-width:24ch}header p:last-child{max-width:64ch}.eyebrow,.badge{font-size:13px;font-weight:600}.badge{white-space:nowrap;background:var(--color-green-100);color:var(--color-green-900);padding:8px 12px;border-radius:var(--border-radius-400)}.filters{display:flex;align-items:center;gap:24px;flex-wrap:wrap;padding:24px;background:white;border:1px solid var(--color-neutral-200);border-radius:var(--border-radius-600)}label{display:flex;align-items:center;gap:8px}select,button{font:inherit;border:1px solid var(--color-neutral-600);border-radius:var(--border-radius-400);padding:8px 12px;min-height:40px}select{background:white;color:var(--color-neutral-900);max-width:100%}button{background:var(--color-blue-700);color:white;border-color:var(--color-blue-700);font-weight:600;cursor:pointer}button:disabled{opacity:.5;cursor:default}input{width:18px;height:18px;accent-color:var(--color-blue-700);flex-shrink:0}#count{font-size:13px;color:var(--color-neutral-700);margin:24px 0 16px}#posts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}article{display:flex;flex-direction:column;border:1px solid var(--color-neutral-200);border-radius:var(--border-radius-600);padding:24px;background:white;min-width:0}.post-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.channel,.status{font-size:13px}.status{padding:2px 8px;border-radius:4px}.draft{background:var(--color-neutral-100)}.ready{background:var(--color-green-100);color:var(--color-green-900)}h2{font-size:21px;line-height:29.333px;margin:24px 0 16px}.copy{min-height:144px}details{border-top:1px solid var(--color-neutral-200);padding-top:16px;margin-top:auto;font-size:13px;line-height:1.6}summary{cursor:pointer;font-weight:600}details ul{padding-left:20px}details li{margin:8px 0}#notice{display:flex;justify-content:space-between;align-items:center;gap:24px;background:var(--color-blue-0);border:1px solid var(--color-blue-300);border-radius:8px;padding:16px 24px;margin-top:24px}#notice p{margin:0}#empty{background:white;padding:24px;border-radius:8px}#empty h2{margin-top:0}footer{font-size:13px;line-height:1.6;border-top:1px solid var(--color-neutral-200);margin-top:32px;padding-top:24px}:focus-visible{outline:3px solid var(--color-blue-700);outline-offset:3px}[hidden]{display:none!important}@media(max-width:850px){#posts{grid-template-columns:1fr}.copy{min-height:0}header{flex-wrap:wrap}#notice{flex-wrap:wrap}}@media(max-width:480px){main{padding:16px}.filters,article{padding:16px}.filters>label:first-child{flex-wrap:wrap}h1{font-size:24px;line-height:32px}.filters{gap:16px}.eyebrow{overflow-wrap:anywhere}}

```

[Code reference](https://seeds.sproutsocial.com/resources/tokens/)

- Palette-to-role assignments are original application choices.

### index.html — complete app shell

Root element and entry for the local app.

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Editorial review queue</title></head><body><div id="root"></div><script type="module" src="/src/main.js"></script></body></html>
```

[Code reference](https://seeds.sproutsocial.com/resources/tokens/)

- Replace the root Vite index.html with this file.

## Implementation Starting Point

These are public token packages. The complete review application is original code supplied above.

```sh
npm create vite@latest seeds-review -- --template vanilla
cd seeds-review
npm install
npm install @sproutsocial/seeds-color@2.5.0 @sproutsocial/seeds-space@0.8.1 @sproutsocial/seeds-typography@3.8.0 @sproutsocial/seeds-border@1.7.1
# Save index.html at root; main.js and seeds.css in src.
npm run dev
```

## Agent Prompt

Build the supplied editorial queue using the pinned public Seeds token CSS. Preserve real token names, system product typography, visible-only selection, native mixed state, draft-only batch updates, empty recovery and one-step undo. Keep the original sample content and never imply a connected social account or publishing action.

## Sources

- [Token packages](https://seeds.sproutsocial.com/resources/tokens/) — Public distribution paths and versioned foundation values.
- [Color](https://seeds.sproutsocial.com/visual/color/) — Palette references and product versus brand context.
- [Spacing](https://seeds.sproutsocial.com/visual/space/) — Scale entries and spacing use.
- [Product typography](https://seeds.sproutsocial.com/visual/product-typography/) — System-font product guidance.
- [Native component setup](https://seeds.sproutsocial.com/components/getting-started/) — Separate React integration requirements.
