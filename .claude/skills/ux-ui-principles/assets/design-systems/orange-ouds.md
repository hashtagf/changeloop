# Orange OUDS Web Design System — OpenDesign Application Guide

Inspect Orange OUDS 1.4’s real semantic tokens, theme packages and native Offcanvas behavior through a complete responsive comparison study.

Actual OUDS Web CSS and Offcanvas runtime with original OpenDesign fictional bundles and local selection. Arial fallback is explicit; no commercial offer or order is represented.

## Source Reference

- **Package pair:** web-common + web-orange 1.4.0 ([source](https://web.unified-design-system.orange.com/orange/docs/1.4/getting-started/download/))
- **Native interaction:** Offcanvas data API and show event ([source](https://web.unified-design-system.orange.com/orange/docs/1.4/components/offcanvas/))
- **Reference entries:** 37 tokens and component contracts ([source](https://cdn.jsdelivr.net/npm/@ouds/web-orange@1.4.0/dist/css/ouds-web.css))


## Design Reference

Pinned @ouds/web-orange and @ouds/web-common 1.4.0 source, with original layout decisions identified separately.

### Light semantic color roles

[Official reference](https://cdn.jsdelivr.net/npm/@ouds/web-orange@1.4.0/dist/css/ouds-web.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-color-action-enabled | #000 | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-action-selected | #f15e00 | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-action-hover | rgba(0, 0, 0, 0.68) | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-action-pressed | #f15e00 | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-bg-primary | #fff | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-bg-secondary | #f4f4f4 | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-border-default | rgba(0, 0, 0, 0.2) | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-always-black | #000 | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |
| --bs-color-always-white | #fff | The first/light declarations in the Orange 1.4 preset. Dark appearance resolves its own values through data-bs-theme rather than reusing this table as literal colors. |

### Scaled spacing

[Official reference](https://cdn.jsdelivr.net/npm/@ouds/web-orange@1.4.0/dist/css/ouds-web.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-space-scaled-none | 0px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-3xsmall | 2px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-2xsmall | 4px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-xsmall | 8px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-small | 12px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-medium | 16px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-large | 24px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-xlarge | 32px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-2xlarge | 40px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |
| --bs-space-scaled-3xlarge | 48px | Actual exported spacing scale. The original comparison composition chooses its own 24px gaps using these values. |

### Type roles

[Official reference](https://cdn.jsdelivr.net/npm/@ouds/web-orange@1.4.0/dist/css/ouds-web.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-font-sans-serif | "HelvNeueOrange", "Helvetica Neue", Helvetica, "SF Pro", Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |
| --bs-font-size-display-large | 2.5rem | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |
| --bs-font-size-heading-large | 1.5rem | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |
| --bs-font-size-body-large | 1rem | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |
| --bs-font-size-body-medium | 0.875rem | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |
| --bs-font-size-body-small | 0.75rem | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |
| --bs-font-line-height-body-large | 1.5 | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |
| --bs-font-line-height-body-medium | 1.4285714286 | Published font and type declarations. The embedded study uses explicit Arial fallback, not the branded HelvNeueOrange font files. |

### Offcanvas defaults

[Official reference](https://cdn.jsdelivr.net/npm/@ouds/web-orange@1.4.0/dist/css/ouds-web.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bs-offcanvas-zindex | 1045 | Native component defaults. The original drawer overrides width to 440px while the native max-width rule keeps it within the viewport. |
| --bs-offcanvas-width | 400px | Native component defaults. The original drawer overrides width to 440px while the native max-width rule keeps it within the viewport. |
| --bs-offcanvas-height | 30vh | Native component defaults. The original drawer overrides width to 440px while the native max-width rule keeps it within the viewport. |
| --bs-offcanvas-transition | transform 0.3s ease-in-out | Native component defaults. The original drawer overrides width to 440px while the native max-width rule keeps it within the viewport. |

### Native drawer and button contracts

[Official reference](https://web.unified-design-system.orange.com/orange/docs/1.4/components/offcanvas/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Brand action | .btn.btn-brand | The real Orange variant; do not assume upstream Bootstrap .btn-primary means the same thing. |
| Default action | .btn.btn-default | The actual secondary/default treatment used for appearance and clearing the local choice. |
| Open trigger | data-bs-toggle="offcanvas" / data-bs-target | Native data API opens the shared drawer from each original plan button. |
| Content event | show.bs.offcanvas / event.relatedTarget | Read the clicked plan from the trigger before rendering the drawer content. |
| Close API | oudsWeb.Offcanvas.getInstance(element).hide() | Close the existing native instance after a local choice. |
| Theme | data-bs-theme="light" or "dark" | Changes the actual theme variables without rebuilding the comparison state. |

## Orange OUDS Web Design System Orange OUDS Package and Theme Structure

### Install the common and Orange packages together

OUDS Web 1.4.0 separates shared behavior from the branded theme. The example installs @ouds/web-common and @ouds/web-orange at the same version. The Orange package supplies compiled CSS, while the common package supplies the bundled browser JavaScript. The root document imports both explicit paths, so the guide does not leave the reader with a package command and an unstyled static page.

- @ouds/web-orange supplies the Orange theme CSS.
- @ouds/web-common supplies shared JavaScript.
- Both packages are pinned to 1.4.0 in this example.

### Treat OUDS as its own component contract

OUDS is based on Bootstrap, but that ancestry does not make every upstream class a drop-in match. This version uses btn-brand, btn-default and other named variants. The supplied comparison uses those actual classes and native Offcanvas data attributes. A migration should compare both markup and theme values rather than just changing a stylesheet URL.

## Orange OUDS Web Design System Orange OUDS Semantic Color and Type Roles

### Use the installed semantic variables

The original cards use color-bg-primary and color-border-default. The narrow header accent follows color-action-selected, which resolves to #f15e00 in the light declarations. The dark theme changes these roles through data-bs-theme on the root. The guide therefore records the light values with their scope and lets the runtime select the correct appearance, instead of describing one orange hex code as the entire design system.

### Be explicit about typography

The package names HelvNeueOrange first in its font stack. This locally embedded study removes unused font-face declarations and uses Arial as an explicit fallback. The table still explains the actual published family and body roles. Loading component CSS is not evidence that the branded typeface has loaded, and a project adopting that face needs to handle its font assets deliberately.

## Orange OUDS Web Design System Orange OUDS Comparison Cards and Content

### Give the comparison a real decision structure

The three cards show fictional data allowances, a short usage description and an inspect action. Each card carries complete text rather than a screenshot of placeholder rows. They are original study content, not current Orange products, prices or contracts. Keeping prices out of this design exercise also avoids implying a purchasable offer or checkout flow.

### Keep the repeated card baseline consistent

The desktop composition uses three equal grid tracks and flex-column cards, allowing the inspect actions to align at the bottom. At 720px it becomes a single column with natural height. The native button classes supply the actual action states; the surrounding grid, 24px padding and content order are original application decisions visible in the supplied CSS.

## Orange OUDS Web Design System Orange OUDS Native Offcanvas Composition

### Populate the drawer from its trigger

Each inspect button points to the same #details Offcanvas and carries a small data-plan index. The show.bs.offcanvas event exposes relatedTarget, which selects the corresponding original title, description and feature list before the drawer is shown. The list is built with textContent and real list items, keeping data separate from markup. The drawer title is connected through aria-labelledby.

### Let the native runtime own open and close behavior

The data API handles opening, backdrop, Escape and focus behavior. After a local choice, the handler uses oudsWeb.Offcanvas.getInstance(drawer).hide() to close the existing instance. It does not remove a CSS class and leave the focus trap or backdrop behind. The test waits for the transition before checking focus return, because asynchronous closing is part of the component contract.

## Orange OUDS Web Design System Orange OUDS Local Choice and Recovery

### Describe the action that actually happened

Keep this local choice stores only which fictional plan was selected and shows that choice below the cards. The message explicitly says no order was placed. A new choice replaces the previous one; clearing it hides the message and returns focus to the first inspect button. Nothing is sent to an account, cart or payment service.

### Keep appearance separate from selection

The light/dark action changes the root theme attribute and its own action label. It preserves the current local choice and the three card contents. This is a useful distinction when testing a theme: a visual change should not silently reset the user’s current comparison. The study uses native CSS in both appearances, with only the outer composition supplied by the application.

## Orange OUDS Web Design System Orange OUDS Keyboard and Narrow-Screen Behavior

### Name the close and inspect actions

Every card action includes the plan name, and the icon-only native close button has an explicit Close details accessible label. The drawer has tabindex and a labeled title so focus management can work with the native implementation. Tests open the Explore drawer, close it with Escape and verify that focus returns to its trigger before moving to a different card.

### Keep the drawer within the actual viewport

The application chooses a 440px drawer width, but the native Offcanvas max-width rule keeps it within a narrow viewport. The cards stack and the outer padding reduces at small sizes. The example was checked at 280px, 390px, tablet and desktop widths after selecting a plan and switching appearance, not only in its initial state.

## Orange OUDS Web Design System Orange OUDS Complete Static Integration

### Use the complete three-file example

Save orange-index.html as index.html and keep orange.css and orange-app.js beside it. Install the two pinned packages and serve the directory. The HTML includes both native asset paths, all card content, the drawer structure and the application script. No React wrapper, missing scaffold or invented SDK is required to reproduce this browser composition.

1. Save all three supplied files together.
2. Install both matching OUDS packages.
3. Serve the folder and inspect each card.
4. Test Escape, focus return, local clearing and both appearances.

### Keep code and assets on the same release

If changing versions, verify the button variants, data API namespace, event names and theme variables together. CSS from one release and scripts from another can appear correct before an interaction exposes the mismatch. The supplied version is a concrete tested reference, not a promise that any future package combination behaves identically.

## Component Examples

### orange-index.html

Complete markup and native CSS/JavaScript imports.

```html
<!doctype html><html lang="en" data-bs-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bundle comparison study</title><link rel="stylesheet" href="./node_modules/@ouds/web-orange/dist/css/ouds-web.min.css"><link rel="stylesheet" href="./orange.css"></head><body><main><header><div><p>OUDS WEB / ORIGINAL COMPARISON STUDY</p><h1>Choose room for your day</h1><p class="scope">Three fictional mobile-data bundles for inspecting Orange-themed cards, buttons and a native detail drawer. These are not commercial offers.</p></div><button id="theme" class="btn btn-default" type="button">Use dark appearance</button></header><div class="plans"><article class="plan"><h2>Everyday</h2><p class="amount">8 GB</p><p>For messages, maps and occasional listening.</p><button class="btn btn-brand" data-plan="0" data-bs-toggle="offcanvas" data-bs-target="#details" aria-controls="details">Inspect Everyday</button></article><article class="plan"><h2>Explore</h2><p class="amount">25 GB</p><p>More room for podcasts and a longer journey.</p><button class="btn btn-brand" data-plan="1" data-bs-toggle="offcanvas" data-bs-target="#details" aria-controls="details">Inspect Explore</button></article><article class="plan"><h2>Create</h2><p class="amount">60 GB</p><p>A larger sample allowance for sharing on the move.</p><button class="btn btn-brand" data-plan="2" data-bs-toggle="offcanvas" data-bs-target="#details" aria-controls="details">Inspect Create</button></article></div><section id="selected" hidden><p role="status" id="selection-message"></p><button id="clear" class="btn btn-default">Clear local choice</button></section><p class="fine">OUDS Web 1.4.0 native CSS and Offcanvas runtime; original sample content and local selection. Arial fallback is used instead of Orange’s branded typeface.</p></main><aside class="offcanvas offcanvas-end" tabindex="-1" id="details" aria-labelledby="drawer-title"><div class="offcanvas-header"><h2 class="offcanvas-title" id="drawer-title">Bundle details</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close details"></button></div><div class="offcanvas-body"><p id="drawer-description"></p><ul id="features"></ul><p>No account is connected. Keeping a choice changes this preview only.</p><button id="choose" class="btn btn-brand">Keep this local choice</button></div></aside><script src="./node_modules/@ouds/web-common/dist/js/ouds-web.bundle.min.js"></script><script src="./orange-app.js"></script></body></html>
```

[Code reference](https://web.unified-design-system.orange.com/orange/docs/1.4/getting-started/introduction/)

- Save orange-index.html as index.html; keep the other two names unchanged.

### orange.css

Original responsive card arrangement and explicit font fallback.

```css
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}main{max-width:1080px;margin:auto;padding:32px}header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;border-bottom:4px solid var(--bs-color-action-selected);padding-bottom:24px}h1{font-size:36px;line-height:1.15;margin:12px 0}.scope{font-size:14px;line-height:1.6;max-width:75ch}.plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:32px}.plan{display:flex;flex-direction:column;border:1px solid var(--bs-color-border-default);padding:24px;background:var(--bs-color-bg-primary)}.plan h2{font-size:24px}.amount{font-size:40px;font-weight:700;line-height:1.2;margin:24px 0}.plan p{line-height:1.6}.plan .btn{margin-top:auto}.fine{font-size:13px;line-height:1.6;margin-top:24px}.offcanvas{--bs-offcanvas-width:440px}.offcanvas-header,.offcanvas-body{padding:24px}.offcanvas-header{gap:16px}.offcanvas-title{font-size:24px}.offcanvas-body p,.offcanvas-body li{line-height:1.6}.offcanvas-body ul{padding-left:24px}.offcanvas-body li{margin:12px 0}#selected{padding:24px;border:1px solid var(--bs-color-border-default);margin-top:24px}#selected p{margin:0}#selected .btn{margin-top:16px}@media(max-width:720px){main{padding:16px}.plans{grid-template-columns:1fr}.plan{padding:24px}.amount{margin:16px 0}.plan .btn{margin-top:16px}}[hidden]{display:none!important}
```

[Code reference](https://web.unified-design-system.orange.com/orange/docs/1.4/getting-started/introduction/)

- Save orange-index.html as index.html; keep the other two names unchanged.

### orange-app.js

Native drawer event handling and local selection/theme state.

```javascript
const plans=[["Everyday", "8 GB", "For messages, maps and occasional listening.", ["8 GB of fictional monthly data", "One original study profile", "No contract, order or payment"]], ["Explore", "25 GB", "More room for podcasts and a longer journey.", ["25 GB of fictional monthly data", "One original study profile", "No contract, order or payment"]], ["Create", "60 GB", "A larger sample allowance for sharing on the move.", ["60 GB of fictional monthly data", "One original study profile", "No contract, order or payment"]]];let current=0;const drawer=document.querySelector('#details');drawer.addEventListener('show.bs.offcanvas',event=>{current=Number(event.relatedTarget.dataset.plan);const[name,amount,description,features]=plans[current];document.querySelector('#drawer-title').textContent=name+' · '+amount;document.querySelector('#drawer-description').textContent=description;document.querySelector('#features').replaceChildren(...features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));});document.querySelector('#choose').addEventListener('click',()=>{document.querySelector('#selected').hidden=false;document.querySelector('#selection-message').textContent=plans[current][0]+' is your local preview choice. No order was placed.';oudsWeb.Offcanvas.getInstance(drawer).hide();});document.querySelector('#clear').addEventListener('click',()=>{document.querySelector('#selected').hidden=true;document.querySelector('[data-plan]').focus()});document.querySelector('#theme').addEventListener('click',e=>{let dark=document.documentElement.dataset.bsTheme!=='dark';document.documentElement.dataset.bsTheme=dark?'dark':'light';e.currentTarget.textContent=dark?'Use light appearance':'Use dark appearance'});
```

[Code reference](https://web.unified-design-system.orange.com/orange/docs/1.4/getting-started/introduction/)

- Save orange-index.html as index.html; keep the other two names unchanged.

## Implementation Starting Point

Open http://localhost:8000/. This uses compiled native assets and does not require a Sass build.

```sh
npm init -y
npm install @ouds/web-common@1.4.0 @ouds/web-orange@1.4.0
# Save index.html, orange.css and orange-app.js from the supplied examples.
python3 -m http.server 8000
```

## Agent Prompt

Implement the complete OUDS Web 1.4 comparison study with matched common/Orange packages, real btn-brand and btn-default variants, native Offcanvas events and API, light/dark token resolution and explicit Arial fallback. Keep all bundle content fictional and the selection strictly local.

## Sources

- [Installation](https://web.unified-design-system.orange.com/orange/docs/1.4/getting-started/download/) — Matching common and theme package setup.
- [Offcanvas](https://web.unified-design-system.orange.com/orange/docs/1.4/components/offcanvas/) — Drawer structure, events and API.
- [Buttons](https://web.unified-design-system.orange.com/orange/docs/1.4/components/buttons/) — OUDS-specific variants and states.
- [JavaScript](https://web.unified-design-system.orange.com/orange/docs/1.4/getting-started/javascript/) — Runtime behavior and integration boundaries.
