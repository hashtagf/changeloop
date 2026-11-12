# Thumbtack Thumbprint Design System — OpenDesign Application Guide

Build a service discovery interface with Thumbprint’s documented v2 primitives: compact provider cards, readable comparison details, clear selection states and a persistent shortlist.

An OpenDesign application guide to Thumbprint. The working specimen is original HTML using selected v2 values, not the native Thumbtack React library. The public typography guide describes an older scale; this page keeps that separate from the v2 token reference. All providers are fictional.

## Source Reference

- **Reference generation:** Thumbprint v2 public tokens ([source](https://thumbprint.design/tokens/v2/javascript))
- **Implementation:** Complete original HTML, CSS and JavaScript ([source](https://thumbprint.design/tokens/v2/javascript))
- **Type boundary:** System fallback; no Rise font distribution ([source](https://thumbprint.design/guidelines/typography))


## Design Reference

Thumbprint public v2 JavaScript token reference; values read October 2026. Numeric dimensions are converted to CSS pixels in the specimen.

### Color primitives and application roles

[Official reference](https://thumbprint.design/tokens/v2/javascript)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| tpV2ColorGray50 | #f5f6f6 | Quiet shortlist surface. |
| tpV2ColorGray200 | #dddee1 | Card boundaries and dividers. |
| tpV2ColorGray600 | #595c61 | Secondary details on white. |
| tpV2ColorGray900 | #2b2d2f | Main text. |
| tpV2ColorBlue50 | #f0faff | Selected control surface. |
| tpV2ColorBlue100 | #e0f4fe | Original house illustration fill. |
| tpV2ColorBlue600 | #009fd9 | Reference primitive; not used for small white text. |
| tpV2ColorBlue700 | #0175A3 | Application action color with white text. |
| tpV2ColorBlue800 | #066286 | Focus outline and illustration stroke. |
| tpV2ColorGreen50 | #eefbf4 | Availability label surface. |
| tpV2ColorGreen200 | #b0eacb | Decorative garden illustration. |
| tpV2ColorGreen700 | #126a4b | Availability text. |

### Spacing and corners

[Official reference](https://thumbprint.design/tokens/v2/javascript)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| tpV2SpaceXxsmall | 4 | Numeric pixel value; use for composition spacing. |
| tpV2SpaceXsmall | 8 | Numeric pixel value; use for composition spacing. |
| tpV2SpaceSmall | 12 | Numeric pixel value; use for composition spacing. |
| tpV2SpaceMedium | 16 | Numeric pixel value; use for composition spacing. |
| tpV2SpaceLarge | 20 | Numeric pixel value; use for composition spacing. |
| tpV2SpaceXlarge | 24 | Numeric pixel value; use for composition spacing. |
| tpV2SpaceXxlarge | 32 | Numeric pixel value; use for composition spacing. |
| tpV2CornerRadiusXsmall | 4 | Numeric pixel value; specimen uses Medium for controls and Large for cards. |
| tpV2CornerRadiusSmall | 6 | Numeric pixel value; specimen uses Medium for controls and Large for cards. |
| tpV2CornerRadiusMedium | 8 | Numeric pixel value; specimen uses Medium for controls and Large for cards. |
| tpV2CornerRadiusLarge | 12 | Numeric pixel value; specimen uses Medium for controls and Large for cards. |
| tpV2CornerRadiusXlarge | 16 | Numeric pixel value; specimen uses Medium for controls and Large for cards. |
| tpV2CornerRadiusSides | 9999 | Numeric pixel value; specimen uses Medium for controls and Large for cards. |

### Responsive type and layout

[Official reference](https://thumbprint.design/tokens/v2/javascript)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| tpV2BreakpointSmall | 481px | Small-layout threshold. |
| tpV2BreakpointMedium | 700px | The specimen becomes two columns at this threshold. |
| tpV2BreakpointLarge | 1025px | Large-layout threshold. |
| tpV2BreakpointSplitViewSmall | 769px | Split-view-specific threshold, not a synonym for Medium. |
| tpV2BreakpointSplitViewMedium | 1060px | Wider split-view threshold. |
| tpV2FontTitle2Size | 28 | Small-screen title size in pixels. |
| tpV2FontTitle2ResponsiveSize | 36 | Larger-screen title size in pixels. |
| tpV2FontTitle2LineHeight | 1.1 | Unitless title line height; independent of semantic heading level. |
| tpV2FontText1Size | 16 | Body text size. |
| tpV2FontText1LineHeight | 1.4 | Body line-height multiplier. |
| tpV2FontWeightRegular | 400 | Regular body text. |
| tpV2FontWeightBold | 700 | Strong emphasis when using the fallback font. |

## Thumbtack Thumbprint Design System Choose a Token Generation

### Keep v1 and v2 distinct

Thumbprint exposes both token generations. The v2 export names begin with tpV2 and include a new gray ramp, responsive title values and intermediate font weights. A native component documented under a v1 route is not evidence that it consumes those v2 values. Record which package and generation your product already uses before replacing shared styles.

### Use this specimen as a composition study

This example applies public primitives directly to original HTML. It does not wrap ServiceCard or claim feature parity with the Thumbtack application. A native implementation should start from the documented package API and substitute real service data only after its loading, error and permission contracts are defined.

## Thumbtack Thumbprint Design System Color Roles and Selection

### Separate action, selection and availability

Blue700 is used for the primary local action, Blue50 for saved controls, and Green700 on Green50 for availability text. Gray900 carries the provider name while Gray600 carries supporting details. These mappings are application choices built from documented primitives, not invented semantic token names.

### Avoid a color-only shortlist

A saved provider changes its button label and aria-pressed state as well as its tint. Availability remains written as a time phrase. Filtering can hide a saved provider without deleting it from the shortlist; the list remains visible so the user can understand that distinction.

## Thumbtack Thumbprint Design System Typography and Content

### Respect version differences in type

The public typography guide lists Rise in weights 400 and 700 and an older responsive title scale. The v2 token page includes different sizes and fractional weights. Do not merge those into an imagined single default. This preview uses a system-font fallback, with explicit sizes inspired by the v2 scale, and does not redistribute Rise.

### Write details that support comparison

Each provider has a service category, a short description and a readable availability label. The directory deliberately omits fabricated review counts, ratings and prices. In a real marketplace, those values need reliable provenance and units; decorative stars would add false confidence rather than useful information.

## Thumbtack Thumbprint Design System Cards, Spacing and Responsive Layout

### Keep comparison details together

Provider cards use 24px padding, a 16px internal gap and a 12px corner. The initials are decorative; the adjacent heading is the accessible name. Cards do not turn the whole surface into a nested link. Saving stays a separate button, which prevents a future profile link from swallowing selection behavior.

### Stack the shortlist on narrow screens

The layout changes at 700px, putting the shortlist below the results. At narrow widths, the save action moves below the text and the decorative house illustration is hidden. The header still contains its complete meaning. No fixed-height panel clips provider descriptions or forces an empty viewport-sized preview.

## Thumbtack Thumbprint Design System Filtering and Shortlist States

### Keep filters and saved state independent

The category select and availability checkbox narrow the three authored records. Choosing Garden care plus Available this week produces an empty result and a reset action. Previously saved records stay in the shortlist because filtering is not deletion. This rule is visible in the source and can be checked without a backend.

### Give the review action an honest result

Reviewing an empty shortlist explains what to do next. Reviewing a nonempty one reports its size and explicitly stays local. Changing a saved item clears that result, preventing a stale confirmation from describing a different shortlist. The example never claims to contact a professional.

## Thumbtack Thumbprint Design System Keyboard and Accessible Selection

### Use native semantics for the controls

A labeled select handles category choice and a labeled checkbox handles a boolean constraint. Each save button has a provider-specific accessible name and aria-pressed. The result count uses a polite live region; the review feedback uses status semantics. Keyboard focus is visible independently of hover.

### Use actual headings and flexible heights

Provider names are h2 elements within the specimen, not bold spans. Initials and the original decorative SVG are excluded from the accessibility tree. Long names and descriptions should wrap without displacing the action offscreen; text zoom requires flexible rows rather than truncation.

## Thumbtack Thumbprint Design System Complete Implementation

### Run and inspect the complete example

Save the HTML example as index.html and serve the containing folder. It has inline CSS and JavaScript, no package installation and no network dependency. The three records and selection Set are explicit so the behavior can be adapted without reverse engineering a generated bundle.

1. Save the complete HTML file.
2. Serve it locally and open it in a browser.
3. Filter to an empty result and reset.
4. Save two providers, review, then remove one.

### Upgrade deliberately to native components

When moving to the React library, inspect the current ServiceCard, Button and type documentation for the exact generation in use. Keep the state model from this example if it fits the product, but replace the original markup with verified APIs. Do not paste v2 values over v1 components without visual and keyboard regression checks.

## Thumbtack Thumbprint Design System Agent Handoff and Review

### Give the agent a bounded task

Ask for a home-service comparison screen using the selected Thumbprint generation, with explicit source URLs and local-only fictional records. Preserve the filter-versus-selection distinction. Supply the complete example as a behavior reference and specify whether native React components or independent HTML are expected.

### Inspect the failure paths

Review empty results, no shortlist, multiple saved providers, removal after review, long names and narrow screens. A screenshot with three attractive cards proves none of these interactions. Compare the token table with the pinned source before shipping a change to a shared theme.

- Saved state survives filtering.
- Changing the shortlist clears old confirmation.
- No ratings or contact results are invented.

## Component Examples

### Complete home-project shortlist

Original, self-contained HTML/CSS/JavaScript with filters, selected state, empty recovery and local review.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Home project shortlist</title><style>
:root{--ink:#2b2d2f;--muted:#595c61;--line:#dddee1;--soft:#f5f6f6;--action:#0175a3;--selected:#f0faff}*{box-sizing:border-box}body{margin:0;padding:32px;font:400 16px/1.4 system-ui,sans-serif;color:var(--ink);background:white}h1{font-size:36px;line-height:1.05;letter-spacing:-.02em;margin:12px 0}h2{font-size:22px;margin:0 0 8px}p{margin:8px 0 20px}.eyebrow,.meta{font-size:14px;color:var(--muted)}header{display:grid;grid-template-columns:1fr 180px;gap:32px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:24px}svg{width:180px;height:120px}.filters{display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin:24px 0}select,button{font:inherit;border:1px solid var(--line);border-radius:8px;min-height:44px;padding:10px 16px;background:white;color:var(--ink)}label{display:flex;align-items:center;gap:8px}input{accent-color:var(--action);width:18px;height:18px}main{display:grid;grid-template-columns:2fr 1fr;gap:24px}.cards{display:grid;gap:16px}.card{padding:24px;border:1px solid var(--line);border-radius:12px;display:grid;grid-template-columns:48px 1fr auto;gap:16px;align-items:start}.avatar{display:grid;place-items:center;border-radius:50%;height:48px;background:var(--selected);color:var(--action);font-weight:700}.card p{margin:4px 0 12px}.card button[aria-pressed=true]{background:var(--selected);border-color:var(--action);color:var(--action)}.badge{display:inline-block;background:#eefbf4;color:#126a4b;padding:4px 8px;border-radius:6px;font-size:14px}aside{align-self:start;border:1px solid var(--line);border-radius:12px;padding:24px;background:var(--soft)}aside ul{padding-left:20px}aside li{margin:12px 0}.primary{background:var(--action);color:white;border-color:var(--action)}button{cursor:pointer}button:hover{border-color:var(--action)}button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #066286;outline-offset:3px}#notice{font-size:14px;color:#126a4b}footer{font-size:12px;color:var(--muted);margin-top:24px}#empty{padding:24px;border:1px dashed var(--line);border-radius:12px}[hidden]{display:none!important}@media(max-width:699px){body{padding:20px}header{grid-template-columns:1fr}header svg{display:none}h1{font-size:28px}main{grid-template-columns:1fr}.card{grid-template-columns:40px 1fr;padding:16px}.avatar{height:40px}.card button{grid-column:2;justify-self:start}}
</style><body><header><div><span class="eyebrow">HOME PROJECT / FICTIONAL DIRECTORY</span><h1>Find the right help for home</h1><p>Compare the details, then build a shortlist for a garden project.</p></div><svg viewBox="0 0 180 120" aria-hidden="true"><path d="M20 66 84 16l64 50v45H20z" fill="#e0f4fe"/><path d="m9 68 75-58 75 58" fill="none" stroke="#0175a3" stroke-width="5"/><path d="M65 110V70h38v40" fill="#fff" stroke="#066286" stroke-width="3"/><circle cx="146" cy="80" r="24" fill="#b0eacb"/><path d="M146 80v35" stroke="#126a4b" stroke-width="4"/></svg></header><div class="filters"><label>Project type <select id="category"><option value="all">All garden services</option><option value="design">Garden design</option><option value="care">Garden care</option></select></label><label><input id="available" type="checkbox">Available this week</label><span id="count" class="meta" aria-live="polite"></span></div><main><section aria-label="Service providers"><div id="cards" class="cards"></div><div id="empty" hidden><h2>No matching services</h2><p>Try a different project type or include later availability.</p><button id="reset">Reset filters</button></div></section><aside><h2>Project shortlist</h2><p class="meta">Saved only while this preview is open.</p><ul id="saved"></ul><p id="savedEmpty">Save a provider to compare your options.</p><button class="primary" id="review">Review shortlist</button><p id="notice" role="status"></p></aside></main><footer>Original HTML study using documented Thumbprint v2 primitives. System font fallback; no Thumbtack service, ratings or contact request.</footer><script>
const providers=[{id:'fern',name:'Fern & Field',type:'design',description:'Planting plans for small outdoor spaces.',timing:'This week',available:true,initials:'FF'},{id:'grove',name:'Grove Garden Care',type:'care',description:'Seasonal pruning, planting and routine care.',timing:'Next week',available:false,initials:'GG'},{id:'yard',name:'Yard Workshop',type:'design',description:'Practical layouts for shared courtyards.',timing:'This week',available:true,initials:'YW'}];const chosen=new Set();const $=id=>document.getElementById(id);
function render(){const shown=providers.filter(p=>($('category').value==='all'||p.type===$('category').value)&&(!$('available').checked||p.available));$('cards').replaceChildren(...shown.map(p=>{const card=document.createElement('article');card.className='card';card.innerHTML=`<span class="avatar" aria-hidden="true">${p.initials}</span><div><h2>${p.name}</h2><p>${p.description}</p><span class="badge">${p.timing}</span></div><button aria-pressed="${chosen.has(p.id)}" aria-label="${chosen.has(p.id)?'Remove':'Save'} ${p.name}">${chosen.has(p.id)?'Saved':'Save'}</button>`;card.querySelector('button').onclick=()=>{chosen.has(p.id)?chosen.delete(p.id):chosen.add(p.id);$('notice').textContent='';render()};return card}));$('count').textContent=`${shown.length} of ${providers.length} sample providers`;$('empty').hidden=shown.length>0;$('saved').replaceChildren(...providers.filter(p=>chosen.has(p.id)).map(p=>{const li=document.createElement('li');li.textContent=p.name;return li}));$('savedEmpty').hidden=chosen.size>0;}
$('category').onchange=render;$('available').onchange=render;$('reset').onclick=()=>{$('category').value='all';$('available').checked=false;render()};$('review').onclick=()=>{$('notice').textContent=chosen.size?`Shortlist ready: ${chosen.size} provider${chosen.size===1?'':'s'}. No contact request has been sent.`:'Save at least one provider first.'};render();
</script></body></html>

```

[Code reference](https://thumbprint.design/tokens/v2/javascript)

- Save as index.html. No native Thumbprint component runtime is used.

## Implementation Starting Point

No package or API credentials required. The example is a local application study.

```sh
# Save the complete HTML example as index.html
python3 -m http.server 8080
# Open http://localhost:8080
```

## Agent Prompt

Build a service comparison screen using the Thumbprint v2 values in this guide. Preserve a local shortlist across filters, include an empty recovery state, and keep review feedback synchronized with selection. Use fictional records and native semantic HTML unless a verified Thumbprint React package is explicitly chosen. Do not mix v1 component assumptions with v2 token names.

## Sources

- [V2 token reference](https://thumbprint.design/tokens/v2/javascript) — Concrete values and generation-specific export names.
- [Typography guide](https://thumbprint.design/guidelines/typography) — Rise and the separately documented older type scale.
- [Service Card documentation](https://thumbprint.design/components/service-card/v1/usage) — Native component reference; v1 route is not a v2 compatibility claim.
