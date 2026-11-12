# Fomantic UI Design System — OpenDesign Application Guide

A native Fomantic UI reading shelf with verified compiled theme values, jQuery dropdown and rating modules, explicit keyboard support and a persistent local shortlist.

Fomantic UI 2.9.4 with jQuery 3.7.1. Theme values are compiled defaults; original cover artwork and keyboard augmentation are identified. All selections stay local.

## Source Reference

- **Library scope:** Community continuation of Semantic UI ([source](https://fomantic-ui.com/))
- **Platform or architecture:** Uses semantic CSS class combinations ([source](https://fomantic-ui.com/introduction/getting-started.html))
- **Integration:** Includes themed components ([source](https://fomantic-ui.com/introduction/getting-started.html))
- **Component support:** Includes JavaScript modules ([source](https://fomantic-ui.com/introduction/getting-started.html))
- **Customization or behavior:** Documentation covers installation ([source](https://fomantic-ui.com/introduction/getting-started.html))
- **Additional capability:** Includes forms, tables, and menus ([source](https://fomantic-ui.com/introduction/getting-started.html))


## Design Reference

Fomantic UI 2.9.4 compiled default CSS inspected directly. These are selector-level defaults from its Less-based theme, not invented runtime CSS tokens. Original cover colors and application dimensions are separately identified.

### Default site typography

[Official reference](https://github.com/fomantic/Fomantic-UI-CSS/blob/master/components/site.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| html font-size | 14px | Default rem baseline. |
| body font-family | Lato, system-ui, platform and emoji fallbacks | The preview includes local Lato font data. |
| body line-height | 1.4285em | About 20px at the default 14px text size. |
| body text color | rgba(0, 0, 0, 0.87) | Default high-emphasis text. |
| h1 / h2 / h3 | 2rem / 1.71428571rem / 1.28571429rem | Default heading sizes before original page overrides. |
| heading line-height | 1.28571429em | Default heading rhythm. |

### Default buttons

[Official reference](https://github.com/fomantic/Fomantic-UI-CSS/blob/master/components/button.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| .ui.button background | #e0e1e2 | Neutral default button. |
| .ui.button border-radius | 0.28571429rem | Approximately 4px at the default root size. |
| .ui.teal.button background | #00b5ad | Native teal action color used in the shortlist. |
| .ui.teal.button:hover | #009c95 | Native teal hover state. |
| .ui.teal.button:focus | #008c86 | Native teal focus background. |
| .ui.teal.button:active | #00827c | Native teal pressed background. |
| .ui.primary.button background | #2185d0 | Primary blue is separate from the named teal variant. |

### Default card geometry

[Official reference](https://github.com/fomantic/Fomantic-UI-CSS/blob/master/components/card.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| .ui.card width | 290px | Default fixed width; fluid variation fills this application grid. |
| .ui.card border-radius | 0.28571429rem | Approximately 4px with the default root size. |
| .ui.card box-shadow | 0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5 | Default elevation and outline. |
| .ui.card margin | 1em 0 | Original grid overrides to zero to align cards. |
| .ui.card transition | box-shadow 0.1s ease, transform 0.1s ease | Default card motion. |

### Rating configuration

[Official reference](https://fomantic-ui.com/modules/rating.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| maxRating | 4 by default; 5 in this example | The explicit five-point scale matches the accessible slider maximum. |
| initialRating | 0 | Unrated before user interaction. |
| clearable | auto by default; true in this example | Allows clearing an existing rating. |
| interactive | true | Mouse interaction is enabled. |
| onRate(value) | Callback after a rating is selected | Synchronizes text output and accessible value. |

### Original reading-room scale

[Official reference](https://fomantic-ui.com/usage/layout.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Page padding | 36px 28px / 24px 18px mobile | Original layout spacing. |
| Grid gap | 22px | Original three-column reading shelf. |
| Page heading | 34px / 1.15; 29px mobile | Original heading override. |
| Cover height | 175px / 155px mobile | Original CSS book-cover artwork. |
| Layout breakpoint | 760px | Original switch to a single card column. |

## Fomantic UI Design System A CSS Vocabulary with jQuery Modules

### A CSS Vocabulary with jQuery Modules

Fomantic UI combines semantic class strings with optional stateful modules. The reading shelf uses ui fluid card, ui teal button and ui basic label for appearance. The dropdown and ratings are explicitly initialized through jQuery. Loading the stylesheet alone would render the cards but would not supply the same interaction.

This specimen pins Fomantic UI 2.9.4 and jQuery 3.7.1. It includes the transition module before dropdown, then rating. Keeping those dependencies visible is more useful than showing a static star row and calling it an interactive library example. The original application module runs only after the card markup exists.

[Supporting specification](https://fomantic-ui.com/introduction/getting-started.html)

## Fomantic UI Design System Compiled Defaults Are Not Runtime Token Names

### Compiled Defaults Are Not Runtime Token Names

Fomantic’s default theme is built through Less. The reference therefore records actual selector values such as the teal button’s background and the card’s border radius. It does not invent a --fomantic-primary token API that the compiled package does not expose. A larger theme change should use the documented theme build and variable files.

The named teal variation is separate from the primary blue variation. In this reading shelf the shortlist action is teal, while the original cover artwork uses paper, sage and warm clay colors. Those covers are application illustrations, not official palette swatches. Hover, focus and pressed button values remain native Fomantic defaults.

[Supporting specification](https://fomantic-ui.com/usage/theming.html)

## Fomantic UI Design System Fourteen-Pixel Rems Change the Geometry

### Fourteen-Pixel Rems Change the Geometry

The default site stylesheet sets the root and body text to fourteen pixels. Its 0.28571429rem button and card radius is therefore approximately four pixels. Copying that rem value into an unrelated sixteen-pixel root would produce different geometry, which is why the reference includes the root size rather than listing an unexplained radius alone.

Lato is the preferred family and the compiled package includes local font assets. This standalone preview embeds those font resources rather than requesting a web-font service. The page heading is an original thirty-four-pixel override; card descriptions retain compact body text with a more generous application line height.

[Supporting specification](https://fomantic-ui.com/globals/site.html)

## Fomantic UI Design System Card Anatomy Keeps Content and Actions Distinct

### Card Anatomy Keeps Content and Actions Distinct

Each native card contains a decorative cover, a content block for topic and description, another content block for the rating and an extra content block for its shortlist action. Fluid cards fill the original three-column grid instead of using the package’s default 290px width. The page removes individual card margins so the grid supplies consistent gaps.

The prompts have different reading tasks: compare letter spacing, remove an element to study negative space, and observe contextual color changes. Their covers visually echo those exercises through type, rectangles and overlapping color. They are explicitly original prompts and do not imply endorsement by a publisher.

[Supporting specification](https://fomantic-ui.com/views/card.html)

## Fomantic UI Design System Call the Native Rating Behavior for Every Input Path

### Call the Native Rating Behavior for Every Input Path

The rating module is configured with a maximum of five and clearable true. onRate receives the current numeric value and synchronizes both the visible score and accessible slider value. The Clear rating action calls the module’s clear rating behavior rather than removing active classes by hand.

The native star module provides mouse interaction, but this example also adds explicit keyboard behavior. The rating container is a labeled slider with a zero-to-five range. Arrow keys change one step, Home clears and End chooses five. Each path calls set rating, ensuring that the displayed stars and application output share the same module state.

1. Tab to a rating and press Right twice to choose two out of five.
2. Press End to choose five, then Home to return to Not rated.
3. Click a star and confirm that the text output and accessible value update together.

[Supporting specification](https://fomantic-ui.com/modules/rating.html)

## Fomantic UI Design System Dropdown Filtering Preserves Hidden State

### Dropdown Filtering Preserves Hidden State

The topic select becomes a native Fomantic dropdown through the dropdown initializer. Its onChange callback hides cards whose topic does not match the selected value and updates the visible prompt count. The All topics option restores the complete shelf. The component uses the transition module for menu movement.

Filtering does not destroy and recreate a card. Existing ratings and shortlist membership remain attached to their original records when hidden. That behavior is deliberate: narrowing the shelf is a viewing operation, not a request to erase the user’s earlier choices. The summary can therefore mention an item outside the current filter.

[Supporting specification](https://fomantic-ui.com/modules/dropdown.html)

## Fomantic UI Design System A Shortlist Is Independent of a Rating

### A Shortlist Is Independent of a Rating

Rating expresses interest on a zero-to-five scale, while shortlist membership is a separate yes/no decision. A user can keep a prompt for discussion before rating it. The shortlist button exposes its selected state through aria-pressed and switches between Add and Remove labels. The summary derives its names from a Set of stable topic IDs.

The status region describes the selected prompts without claiming that a collection has been saved remotely. A browser reload clears this specimen. A real shared reading list would need persistence, user identity and conflict handling; those capabilities do not come from adding a card class.

[Supporting specification](https://fomantic-ui.com/elements/button.html)

## Fomantic UI Design System Keep Numeric Meaning Beyond Decorative Stars

### Keep Numeric Meaning Beyond Decorative Stars

The star icons are hidden from assistive technology because the parent slider exposes the numeric value and label. A visible Not rated or fraction output provides the same meaning without requiring the reader to count colored icons. A focus-visible outline marks the active slider, and the Clear button returns focus to that control.

The book-cover shapes are also decorative. The real prompt title, duration and description remain text inside the card. Narrow screens stack the cards at the original 760px breakpoint. The example resets the compiled body’s viewport height and hidden horizontal overflow so embedding uses the content’s actual height and does not conceal layout defects.

- Expose the current number through both text and an accessible value.
- Use native buttons for clearing and shortlist changes.
- Preserve labels and full descriptions when the grid becomes one column.

[Supporting specification](https://fomantic-ui.com/modules/rating.html)

## Fomantic UI Design System Ship the Fonts Beside the Styles or Bundle Them

### Ship the Fonts Beside the Styles or Bundle Them

For a normal project, copy the complete fomantic-ui-css directory rather than extracting semantic.css and forgetting its themes assets. The compiled styles refer to Lato and icon font files using relative paths. The setup below keeps those paths intact and loads jQuery before the package modules.

The local preview uses only the required component styles and scripts, then embeds their referenced assets into one document. It has no external font request. Production bundlers may process these assets differently, but the font path and module order still need to be tested in the delivered page rather than assumed from a successful npm install.

[Supporting specification](https://fomantic-ui.com/introduction/getting-started.html)

## Component Examples

### Three-card reading shelf

Native cards, labels, buttons, dropdown markup and rating containers.

```html
<main class="reading-room"><header><div><p class="kicker">FOMANTIC UI · READING ROOM</p><h1>Make a shelf worth returning to.</h1><p class="intro">Rate three original reading prompts and build a local discussion shortlist.</p></div><span class="ui teal basic label">Local collection</span></header><div class="toolbar"><label for="topic">Show topic</label><select id="topic" class="ui selection dropdown"><option value="all">All topics</option><option value="type">Typography</option><option value="space">Space & rhythm</option><option value="color">Color</option></select><span id="visible-count">3 prompts</span></div><div class="book-grid"><article class="ui fluid card" data-topic="type" data-name="Letters in the margins"><div class="book-cover type-cover" aria-hidden="true"><span>Aa</span><small>FORM / COUNTERFORM</small></div><div class="content"><div class="meta">TYPOGRAPHY · 18 MIN</div><h2 class="header">Letters in the margins</h2><div class="description">Compare a narrow editorial column with a generous display line. Find where the rhythm changes.</div></div><div class="content"><label class="rating-label" id="label-type">Your interest</label><div class="ui huge star rating" data-rating="0" data-max-rating="5" role="slider" tabindex="0" aria-labelledby="label-type" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"></div><output class="score">Not rated</output><button class="ui tiny basic button clear-rating" type="button">Clear rating</button></div><div class="extra content"><button class="ui fluid teal button shortlist" aria-pressed="false">Add to shortlist</button></div></article><article class="ui fluid card" data-topic="space" data-name="The space between"><div class="book-cover space-cover" aria-hidden="true"><span></span><span></span><span></span><small>PAUSE / SEQUENCE</small></div><div class="content"><div class="meta">SPACE & RHYTHM · 12 MIN</div><h2 class="header">The space between</h2><div class="description">Remove one element from a crowded page. Rebalance the remaining space without adding decoration.</div></div><div class="content"><label class="rating-label" id="label-space">Your interest</label><div class="ui huge star rating" data-rating="0" data-max-rating="5" role="slider" tabindex="0" aria-labelledby="label-space" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"></div><output class="score">Not rated</output><button class="ui tiny basic button clear-rating" type="button">Clear rating</button></div><div class="extra content"><button class="ui fluid teal button shortlist" aria-pressed="false">Add to shortlist</button></div></article><article class="ui fluid card" data-topic="color" data-name="A color and its neighbor"><div class="book-cover color-cover" aria-hidden="true"><span></span><span></span><small>CONTEXT / CONTRAST</small></div><div class="content"><div class="meta">COLOR · 15 MIN</div><h2 class="header">A color and its neighbor</h2><div class="description">Place the same accent on two backgrounds. Describe the shift before changing its value.</div></div><div class="content"><label class="rating-label" id="label-color">Your interest</label><div class="ui huge star rating" data-rating="0" data-max-rating="5" role="slider" tabindex="0" aria-labelledby="label-color" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"></div><output class="score">Not rated</output><button class="ui tiny basic button clear-rating" type="button">Clear rating</button></div><div class="extra content"><button class="ui fluid teal button shortlist" aria-pressed="false">Add to shortlist</button></div></article></div><section class="ui message summary"><h2 class="header">Discussion shortlist</h2><p id="summary" role="status">No prompts selected. Add one to begin.</p><p class="scope">Ratings and selections stay in this browser page. These are original prompts, not published books.</p></section></main>

```

[Code reference](https://fomantic-ui.com/views/card.html)

- These are original exercise prompts, not real book covers.
- Each rating has its own accessible label and numeric range.
- Shortlist actions expose aria-pressed.

### Module initialization and local interaction

Dropdown filtering, rating behavior calls, keyboard augmentation and shortlist state.

```javascript
const cards=[...document.querySelectorAll('.book-grid article')],selected=new Set();
$('#topic').dropdown({onShow(){this.setAttribute('aria-expanded','true');},onHide(){this.setAttribute('aria-expanded','false');},onChange(value){let count=0;cards.forEach(card=>{card.hidden=value!=='all'&&card.dataset.topic!==value;if(!card.hidden)count++;});document.querySelectorAll('.toolbar .menu .item').forEach(item=>item.setAttribute('aria-selected',String(item.dataset.value===value)));document.querySelector('#visible-count').textContent=`${count} ${count===1?'prompt':'prompts'}`;}});
const dropdown=document.querySelector('.toolbar div.dropdown');dropdown.setAttribute('role','combobox');dropdown.setAttribute('aria-label','Show topic');dropdown.setAttribute('aria-expanded','false');dropdown.setAttribute('aria-haspopup','listbox');dropdown.querySelector('.menu').setAttribute('role','listbox');dropdown.querySelectorAll('.menu .item').forEach(item=>{item.setAttribute('role','option');item.setAttribute('aria-selected',String(item.dataset.value==='all'));});
$('.ui.rating').each(function(){const node=this,$rating=$(node);$rating.rating({maxRating:5,clearable:true,onRate(value){node.setAttribute('aria-valuenow',value);node.setAttribute('aria-valuetext',value?`${value} out of 5`:'Not rated');node.closest('article').querySelector('.score').textContent=value?`${value} / 5`:'Not rated';}});node.setAttribute('aria-valuetext','Not rated');node.querySelectorAll('.icon').forEach(i=>i.setAttribute('aria-hidden','true'));node.addEventListener('keydown',e=>{let value=Number($rating.rating('get rating'));if(['ArrowRight','ArrowUp'].includes(e.key))value=Math.min(5,value+1);else if(['ArrowLeft','ArrowDown'].includes(e.key))value=Math.max(0,value-1);else if(e.key==='Home')value=0;else if(e.key==='End')value=5;else return;e.preventDefault();$rating.rating('set rating',value);});node.closest('article').querySelector('.clear-rating').onclick=()=>{$rating.rating('clear rating');node.focus();};});
cards.forEach(card=>{card.querySelector('.shortlist').onclick=e=>{const id=card.dataset.topic,button=e.currentTarget;if(selected.has(id)){selected.delete(id);button.textContent='Add to shortlist';button.setAttribute('aria-pressed','false');}else{selected.add(id);button.textContent='Remove from shortlist';button.setAttribute('aria-pressed','true');}const names=cards.filter(c=>selected.has(c.dataset.topic)).map(c=>c.dataset.name);document.querySelector('#summary').textContent=names.length?`${names.length} selected: ${names.join('; ')}.`:'No prompts selected. Add one to begin.';};});

```

[Code reference](https://fomantic-ui.com/modules/rating.html)

- jQuery and the Fomantic modules must load before this file.
- The same set rating method is used for arrow-key changes.
- Filtering hides cards without destroying their ratings or selections.

### Original shelf composition

Responsive grid, cover artwork and explicit focus treatment.

```css
body{background:#f6f5f2}.reading-room{max-width:1120px;margin:auto;padding:36px 28px}.reading-room header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:32px}.kicker{font-size:11px;letter-spacing:.14em;font-weight:700;color:#008c86}h1{font-size:34px;line-height:1.15;margin:12px 0}.intro{color:#666;font-size:15px;line-height:1.6}.toolbar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:24px;font-size:14px}.toolbar>label{font-weight:700}.toolbar>span{color:#767676;margin-left:auto}.book-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:start}.book-grid>.ui.card{margin:0;height:100%}.book-grid>.ui.card[hidden]{display:none}.book-cover{height:175px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}.book-cover small{position:absolute;bottom:16px;left:18px;letter-spacing:.15em;font-size:9px;font-weight:700}.type-cover{background:#e2ccb0;color:#4a332a}.type-cover>span{font-family:Georgia,serif;font-size:90px;line-height:1}.space-cover{background:#ccd7d5;gap:10px}.space-cover>span{height:65px;width:25px;background:#3c6763}.space-cover>span:nth-child(2){height:90px;width:45px}.color-cover{background:#dcb9b0}.color-cover>span{width:85px;height:85px;background:#a85243}.color-cover>span:nth-child(2){width:50px;height:50px;border-radius:50%;background:#e6c57c;position:absolute}.book-grid .description{font-size:14px;line-height:1.6;min-height:88px}.rating-label{display:block;font-size:12px;font-weight:bold;margin-bottom:10px}.score{display:block;font-size:12px;color:#666;margin:8px 0 12px}.clear-rating{margin-bottom:0!important}.book-grid .ui.rating:focus-visible{outline:3px solid #00b5ad;outline-offset:4px}.summary{margin-top:28px!important}.scope{font-size:12px;color:#666}button:focus-visible{outline:3px solid #00b5ad!important;outline-offset:3px}@media(max-width:760px){.reading-room{padding:24px 18px}.reading-room header{flex-direction:column;gap:8px}h1{font-size:29px}.book-grid{grid-template-columns:1fr}.book-grid .description{min-height:0}.book-cover{height:155px}.toolbar>span{width:100%;margin-left:0}.toolbar .dropdown{min-width:180px}}
html,body{height:auto;min-height:0}body{min-width:0;overflow-x:visible}

```

[Code reference](https://fomantic-ui.com/usage/layout.html)

- The compiled site default height:100% is reset to auto for embedding.
- Body overflow is not used to conceal layout errors.

## Implementation Starting Point

Verified with Fomantic UI 2.9.4 and jQuery 3.7.1. The standalone example embeds required font assets; the normal setup retains package-relative paths. The HTML wrapper includes the full body markup; save the supplied interaction and CSS examples under the filenames referenced here.

```html
<!-- npm install fomantic-ui-css@2.9.4 jquery@3.7.1 -->
<!-- Copy node_modules/fomantic-ui-css into public/vendor/fomantic-ui-css. -->
<!-- Copy node_modules/jquery/dist/jquery.min.js into public/vendor/jquery.min.js. -->
<link rel="stylesheet" href="/vendor/fomantic-ui-css/semantic.min.css">
<link rel="stylesheet" href="style.css">
<main class="reading-room"><header><div><p class="kicker">FOMANTIC UI · READING ROOM</p><h1>Make a shelf worth returning to.</h1><p class="intro">Rate three original reading prompts and build a local discussion shortlist.</p></div><span class="ui teal basic label">Local collection</span></header><div class="toolbar"><label for="topic">Show topic</label><select id="topic" class="ui selection dropdown"><option value="all">All topics</option><option value="type">Typography</option><option value="space">Space & rhythm</option><option value="color">Color</option></select><span id="visible-count">3 prompts</span></div><div class="book-grid"><article class="ui fluid card" data-topic="type" data-name="Letters in the margins"><div class="book-cover type-cover" aria-hidden="true"><span>Aa</span><small>FORM / COUNTERFORM</small></div><div class="content"><div class="meta">TYPOGRAPHY · 18 MIN</div><h2 class="header">Letters in the margins</h2><div class="description">Compare a narrow editorial column with a generous display line. Find where the rhythm changes.</div></div><div class="content"><label class="rating-label" id="label-type">Your interest</label><div class="ui huge star rating" data-rating="0" data-max-rating="5" role="slider" tabindex="0" aria-labelledby="label-type" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"></div><output class="score">Not rated</output><button class="ui tiny basic button clear-rating" type="button">Clear rating</button></div><div class="extra content"><button class="ui fluid teal button shortlist" aria-pressed="false">Add to shortlist</button></div></article><article class="ui fluid card" data-topic="space" data-name="The space between"><div class="book-cover space-cover" aria-hidden="true"><span></span><span></span><span></span><small>PAUSE / SEQUENCE</small></div><div class="content"><div class="meta">SPACE & RHYTHM · 12 MIN</div><h2 class="header">The space between</h2><div class="description">Remove one element from a crowded page. Rebalance the remaining space without adding decoration.</div></div><div class="content"><label class="rating-label" id="label-space">Your interest</label><div class="ui huge star rating" data-rating="0" data-max-rating="5" role="slider" tabindex="0" aria-labelledby="label-space" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"></div><output class="score">Not rated</output><button class="ui tiny basic button clear-rating" type="button">Clear rating</button></div><div class="extra content"><button class="ui fluid teal button shortlist" aria-pressed="false">Add to shortlist</button></div></article><article class="ui fluid card" data-topic="color" data-name="A color and its neighbor"><div class="book-cover color-cover" aria-hidden="true"><span></span><span></span><small>CONTEXT / CONTRAST</small></div><div class="content"><div class="meta">COLOR · 15 MIN</div><h2 class="header">A color and its neighbor</h2><div class="description">Place the same accent on two backgrounds. Describe the shift before changing its value.</div></div><div class="content"><label class="rating-label" id="label-color">Your interest</label><div class="ui huge star rating" data-rating="0" data-max-rating="5" role="slider" tabindex="0" aria-labelledby="label-color" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"></div><output class="score">Not rated</output><button class="ui tiny basic button clear-rating" type="button">Clear rating</button></div><div class="extra content"><button class="ui fluid teal button shortlist" aria-pressed="false">Add to shortlist</button></div></article></div><section class="ui message summary"><h2 class="header">Discussion shortlist</h2><p id="summary" role="status">No prompts selected. Add one to begin.</p><p class="scope">Ratings and selections stay in this browser page. These are original prompts, not published books.</p></section></main>

<script src="/vendor/jquery.min.js"></script>
<script src="/vendor/fomantic-ui-css/components/transition.min.js"></script>
<script src="/vendor/fomantic-ui-css/components/dropdown.min.js"></script>
<script src="/vendor/fomantic-ui-css/components/rating.min.js"></script>
<script src="app.js"></script>
<!-- Keep the themes/ assets beside the copied CSS. -->
```

## Agent Prompt

Extend the Fomantic UI 2.9.4 reading-room shortlist using the supplied jQuery module initialization, Dropdown and Rating components. Keep the three reading prompts, their rating state and the local shortlist behavior connected to the visible cards. Retain the explicit keyboard support and slider semantics added to the rating control, along with matching theme/icon assets. The shortlist must prevent duplicate additions and expose its current contents clearly; it is not a support-ticket workflow or a remote recommendation service.

## Sources

- [Getting started](https://fomantic-ui.com/introduction/getting-started.html) — Compiled assets and module setup.
- [Theming](https://fomantic-ui.com/usage/theming.html) — Less-based theme customization.
- [Site](https://fomantic-ui.com/globals/site.html) — Global typography and page defaults.
- [Card](https://fomantic-ui.com/views/card.html) — Card content anatomy and variations.
- [Rating](https://fomantic-ui.com/modules/rating.html) — Rating methods and onRate callback.
- [Dropdown](https://fomantic-ui.com/modules/dropdown.html) — Selection initialization and change handling.
- [Button](https://fomantic-ui.com/elements/button.html) — Native named variants and states.
