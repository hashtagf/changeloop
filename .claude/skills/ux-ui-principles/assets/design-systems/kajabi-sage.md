# Kajabi Sage Design System — OpenDesign Application Guide

Build a creator-facing sharing panel with readable course context, clear copy actions and honest clipboard feedback. Explore Sage’s Rails component anatomy, its published typography specifications and the newer externally loaded Pine token layer.

Independent OpenDesign guide. Courses and cover illustrations are original. The preview uses native HTML and documented visual references, while Rails examples require an existing authorized Sage integration. No content is published or sent.

## Source Reference

- **Component forms:** Rails and React ([source](https://sage.kajabi.com/pages/index))
- **Token layer:** Pine loaded externally ([source](https://raw.githubusercontent.com/Kajabi/sage-lib/develop/packages/sage-assets/README.md))
- **CSS asset entry:** dist/main.css ([source](https://raw.githubusercontent.com/Kajabi/sage-lib/develop/packages/sage-assets/package.json))
- **Distribution:** GitHub Packages ([source](https://raw.githubusercontent.com/Kajabi/sage-lib/develop/packages/sage-assets/package.json))
- **Copy helpers:** SageCopyText, SageCopyTextCard, SageCopyButton ([source](https://sage.kajabi.com/pages/component/copy_text))
- **Body class specification:** 16px / 24px ([source](https://sage.kajabi.com/pages/foundations/typography))


## Design Reference

Sage public component and type documentation, plus the default/light Pine stylesheet actually loaded by the current documentation. The published Sage type table and newer Pine aliases are separate references; do not silently treat them as identical.

### Live Pine color roles

[Official reference](https://cdn.jsdelivr.net/npm/@kajabi-ui/styles@latest/dist/pine/pine.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pine-color-primary | var(--pine-color-grey-900) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-primary-hover | var(--pine-color-grey-950) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-text | var(--pine-color-grey-900) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-text-primary | var(--pine-color-white) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-background-app | var(--pine-color-grey-100) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-background-container | var(--pine-color-white) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-border | var(--pine-color-grey-300) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |

### Live Pine primitive colors

[Official reference](https://cdn.jsdelivr.net/npm/@kajabi-ui/styles@latest/dist/pine/pine.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pine-color-grey-100 | #f8f8f8 | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-grey-300 | #d2d1d1 | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-grey-900 | #343332 | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-grey-950 | #1a1a19 | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-color-white | #ffffff | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |

### Live Pine dimensions and radius

[Official reference](https://cdn.jsdelivr.net/npm/@kajabi-ui/styles@latest/dist/pine/pine.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pine-dimension-xs | var(--pine-dimension-100) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-sm | var(--pine-dimension-200) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-md | var(--pine-dimension-300) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-lg | var(--pine-dimension-400) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-100 | 8px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-200 | 16px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-300 | 24px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-400 | 32px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-border-radius-md | var(--pine-dimension-125) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-dimension-125 | 10px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-border-radius-full | 9999px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |

### Live Pine type entry

[Official reference](https://cdn.jsdelivr.net/npm/@kajabi-ui/styles@latest/dist/pine/pine.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --pine-font-family-body | var(--pine-font-family-inter) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-font-family-inter | "Inter", system-ui, "Segoe UI", "Roboto", "Ubuntu", sans-serif | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-font-size-body-md | var(--pine-font-size-100) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-font-size-100 | 14px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-font-size-body-lg | var(--pine-font-size-116) | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |
| --pine-font-size-116 | 16px | Current default/light Pine stylesheet snapshot loaded by the Sage docs. |

### Published Sage type classes

[Official reference](https://sage.kajabi.com/pages/foundations/typography)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| t-sage-heading-1 | 40px / 48px; 700; -0.6px tracking | Published documentation type specification. |
| t-sage-heading-2 | 32px / 40px; 700; -0.5px | Published heading specification. |
| t-sage-heading-3 | 28px / 32px; 700; -0.15px | Published heading specification. |
| t-sage-heading-4 | 24px / 32px; 600; -0.15px | Published heading specification. |
| t-sage-body | 16px / 24px; 400 | Published body specification. |
| t-sage-body-small | 14px / 20px; 400 | Published supporting type specification. |
| t-sage-body-xsmall | 12px / 16px; 400 | Published smallest body specification. |
| Body weight suffixes | -med 500 / -semi 600 / -bold 700 | Append to body class family. |

### Copy component properties

[Official reference](https://sage.kajabi.com/pages/component/copy_text)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| SageCopyText.value | Required string | Text to display and copy. |
| semibold | Boolean, default false | Whole-block emphasis. |
| SageCopyButton.fill_container | Boolean, default false | Full-container copy-button width. |
| SageCopyButton.borderless | Boolean example | Low-emphasis copy action. |
| SageCopyTextCard.truncate_contents | true enables truncation | Constrain long content only when full text remains available. |

## Kajabi Sage Design System A sharing panel for a creator workflow

### The course remains recognizable beside its link

Sage serves Kajabi’s creator and knowledge-commerce interfaces. A course-sharing panel is a useful small composition because it combines product context, a long technical value and an action whose success can fail independently of the page. The specimen provides two fictional courses with original cover art, a learner URL and an email-ready message.

Switching the course updates both outputs. Switching the output format changes the text that will be copied, while the selected course remains visible. Nothing is published or sent; the only optional side effect happens when a person activates the clipboard button.

[Supporting specification](https://sage.kajabi.com/pages/index)

## Kajabi Sage Design System and Pine have an explicit dependency boundary

### A CSS color function is not always a hex lookup

The current Sage Assets README says Pine tokens are loaded by the consuming application and are not bundled in sage-assets. It distinguishes sage-color(), which returns a semantic CSS variable, from sage-color-hex(), which reads legacy values for Sass color operations. A color function that now returns var(...) cannot safely be fed into a compile-time hex calculation.

The live docs load @kajabi-ui/styles/dist/pine/pine.css. In that stylesheet’s default/light root, the primary role resolves through grey-900, while the older README’s hex example is blue. The guide keeps those facts separate: the former is the live semantic role, the latter illustrates a legacy hex lookup. A new implementation must not substitute one for the other by assumption.

[Supporting specification](https://raw.githubusercontent.com/Kajabi/sage-lib/develop/packages/sage-assets/README.md)

## Kajabi Sage Design System Restraint in the application, expression in the content

### Keep action colors attached to meaning

The Sage color guidance uses color to identify interaction, selected state and feedback rather than adding arbitrary personality to the interface. The specimen keeps its application frame neutral; course artwork supplies the expressive color. This makes the copy action easy to locate without painting every panel a different status hue.

Success belongs to a successful clipboard write. A blocked clipboard should produce a practical manual-copy state, not a green success message. The selected course and selected output format use their own control states, independent of the last copy result.

[Supporting specification](https://sage.kajabi.com/pages/foundations/color)

## Kajabi Sage Design System Published Sage specifications and current token aliases

### Type role and HTML semantics remain independent

The published Sage table provides t-sage-heading and t-sage-body classes with exact size, line-height and weight combinations. The table is useful for reproducing that documented specification. The newer Pine stylesheet also exposes its own body aliases, including a 14-pixel medium body role, so a current integration should inspect which layer its component consumes.

Applying a visual heading class to an element does not change that element’s semantic level. The course name remains a heading, the URL remains form content and the copy action remains a button. The preview uses the published Sage 32/40 heading and 16/24 reading treatment with a system fallback; it does not pretend that the font files are bundled.

[Supporting specification](https://sage.kajabi.com/pages/foundations/typography)

## Kajabi Sage Design System Copy Text, Copy Button and Copy Text Card

### Choose anatomy by content shape

The documentation separates inline copy text, a block card and a copy button. The block is useful when a label and multiple lines need to stay together. A button can fill its container or use a borderless presentation, and semibold applies emphasis at component level.

The specimen uses a readonly textarea for the active payload. This is an intentional native implementation: it allows selection when clipboard access is unavailable and keeps a multiline email message readable. Its value is the exact payload passed to the browser, without an invisible extra label or a stale course identifier.

- Inline copy text suits a short single value beside other prose.
- A copy card groups related lines with enough width for inspection.
- A separate button makes the action explicit when the value is long or multiline.

[Supporting specification](https://sage.kajabi.com/pages/component/copy_text)

## Kajabi Sage Design System Long links should not break the panel

### A two-column composition that becomes sequential

The desktop specimen places a course-selection rail beside the active course and sharing controls. On a small viewport, the rail becomes a horizontal pair of cards and the sharing panel follows it. The value field wraps within its container; the button remains visible below it.

The official Copy Text guidance recommends a local maximum width and offers truncation for card contents. This example chooses wrapping and manual selection instead of hiding a critical part of the URL. Padding follows the verified Pine 8/16/24/32 dimension steps, while the two-column ratio and breakpoint are application choices.

[Supporting specification](https://sage.kajabi.com/pages/component/copy_text)

## Kajabi Sage Design System A complete public specimen and an honest native path

### Copy only after the user activates the action

The standalone setup loads public Pine tokens and supplies its own HTML and clipboard handler. It can run without a Sage package account. The native Rails example is separately identified as a composition for an existing Sage application; it does not claim that a pasted helper alone installs the system.

Sage Assets declares GitHub Packages as its publication registry. Teams using that route must use their approved registry access and load the external Pine layer before relying on semantic color variables. The documentation also notes font-domain restrictions, so a system fallback is more honest than silently assuming brand fonts loaded successfully.

1. Open the standalone example from localhost or HTTPS and select a course and payload format.
2. Activate copy; report success only after the clipboard promise resolves, otherwise select the text for manual copying.
3. Change the course or format and clear the old copy status so it never describes an outdated payload.

[Supporting specification](https://raw.githubusercontent.com/Kajabi/sage-lib/develop/packages/sage-assets/package.json)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent native HTML interpretation of Sage Copy Text anatomy, published type specifications and live default/light Pine values. No Sage runtime or proprietary font bundle.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Course sharing — Sage interpretation</title><style>*{box-sizing:border-box}body{margin:0;background:#f8f8f8;color:#343332;font:16px/1.5 system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:32px}.top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.08em;border-bottom:1px solid #d2d1d1;padding-bottom:16px;gap:16px}h1{font-size:32px;line-height:40px;letter-spacing:-.5px;margin:24px 0 8px}h2{font-size:24px;line-height:32px;margin:0 0 8px}.intro{margin:0 0 24px;color:#6c6a69}.grid{display:grid;grid-template-columns:240px 1fr;gap:24px}.courses{display:grid;gap:16px;align-content:start}.course{background:white;border:1px solid #d2d1d1;border-radius:10px;padding:12px;text-align:left;color:inherit;font:inherit;cursor:pointer}.course[aria-pressed=true]{border:2px solid #343332;padding:11px}.course small{display:block;font-size:12px;color:#6c6a69}.art{position:relative;overflow:hidden;border-radius:6px;display:grid;place-content:center;letter-spacing:.08em;font-size:11px;text-align:center}.art b{z-index:1;position:relative;line-height:1.2}.art.studio{background:#f2b9a5;color:#682923}.art.studio:before{content:'';position:absolute;border-radius:50%;width:150px;height:150px;background:#c26e4f;right:-40px;top:25px}.art.studio:after{content:'';position:absolute;width:55px;height:120px;background:#f9e7bc;transform:rotate(25deg);left:20px;top:-20px}.art.journal{background:#d1ddaa;color:#203a30}.art.journal:before{content:'';position:absolute;width:100px;height:160px;border:22px solid #68865b;border-radius:60% 0;transform:rotate(20deg);right:5px;top:-5px}.art.journal:after{content:'';position:absolute;width:90px;height:70px;border:18px solid #b29f59;border-radius:50%;left:-30px;bottom:-20px}.course .art{height:115px;margin-bottom:12px}.panel{background:white;padding:24px;border:1px solid #d2d1d1;border-radius:10px}.hero{display:grid;grid-template-columns:140px 1fr;gap:24px;align-items:center;margin-bottom:24px}.hero .art{height:140px}.hero p{font-size:14px;color:#6c6a69;margin:0}.format{display:flex;gap:16px;border-bottom:1px solid #d2d1d1;margin-bottom:24px}.format button{background:none;border:0;border-bottom:3px solid transparent;padding:10px 0;font:inherit;color:#6c6a69;cursor:pointer}.format button[aria-pressed=true]{border-bottom-color:#343332;color:#343332}label{display:block;font-size:14px;font-weight:600;margin-bottom:8px}textarea{width:100%;resize:vertical;min-height:135px;border:1px solid #d2d1d1;border-radius:10px;padding:16px;font:14px/1.5 system-ui;background:#fcfcfc;color:#343332}.copy{font:600 14px/20px system-ui;border:0;border-radius:9999px;background:#343332;color:white;padding:12px 24px;cursor:pointer;margin-top:16px}.copy:hover{background:#1a1a19}button:focus-visible,textarea:focus-visible{outline:3px solid #6c6a69;outline-offset:3px}.status{min-height:42px;font-size:13px;color:#4d4d4c}.foot{font-size:12px;color:#6c6a69;margin-top:24px}@media(max-width:650px){main{padding:20px}.grid{grid-template-columns:1fr}.courses{grid-template-columns:1fr 1fr;gap:12px}.course .art{height:85px}.hero{grid-template-columns:90px 1fr;gap:16px}.hero .art{height:110px}.panel{padding:20px}.top{flex-direction:column;gap:4px}h1{font-size:28px;line-height:36px}h2{font-size:20px;line-height:28px}}</style><main><header class="top"><b>CREATOR WORKSPACE</b><span>Local sharing specimen</span></header><h1>Give your course a clear invitation.</h1><p class="intro">Choose a sample course and prepare the exact text to share.</p><div class="grid"><nav class="courses" aria-label="Choose a course"><button class="course" data-course="studio" aria-pressed="true"><div class="art studio" aria-hidden="true"><b>STUDIO<br>NOTES</b></div><b>Studio Notes</b><small>6 lessons · Original sample</small></button><button class="course" data-course="journal" aria-pressed="false"><div class="art journal" aria-hidden="true"><b>FIELD<br>JOURNAL</b></div><b>Field Journal</b><small>4 lessons · Original sample</small></button></nav><section class="panel"><div class="hero"><div id="cover" class="art studio" aria-hidden="true"><b>STUDIO<br>NOTES</b></div><div><h2 id="title">Studio Notes</h2><p id="description">A fictional course about building a daily creative practice.</p></div></div><div class="format" aria-label="Copy format"><button data-format="link" aria-pressed="true">Course link</button><button data-format="message" aria-pressed="false">Invitation text</button></div><label for="payload">Text to copy</label><textarea id="payload" readonly></textarea><button id="copy" class="copy" type="button">Copy visible text</button><p class="status" id="status" role="status"></p></section></div><p class="foot">Independent Sage interpretation using verified Pine light-theme colors and dimensions. Original course covers; system-font fallback. No course is published and no message is sent.</p></main><script>const courses={studio:{name:'Studio Notes',slug:'studio-notes',desc:'A fictional course about building a daily creative practice.',art:'STUDIO<br>NOTES'},journal:{name:'Field Journal',slug:'field-journal',desc:'A fictional course about observing, collecting and recording ideas.',art:'FIELD<br>JOURNAL'}};let selected='studio',format='link';const payload=document.querySelector('#payload'),status=document.querySelector('#status');function render(){const c=courses[selected],url='https://example.com/courses/'+c.slug;document.querySelector('#title').textContent=c.name;document.querySelector('#description').textContent=c.desc;document.querySelector('#cover').className='art '+selected;document.querySelector('#cover').innerHTML='<b>'+c.art+'</b>';payload.value=format==='link'?url:'You are invited to explore '+c.name+'.\n\n'+c.desc+'\n\nView the sample: '+url;document.querySelectorAll('[data-course]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.course===selected));document.querySelectorAll('[data-format]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.format===format));status.textContent=''}document.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>{selected=b.dataset.course;render()});document.querySelectorAll('[data-format]').forEach(b=>b.onclick=()=>{format=b.dataset.format;render()});document.querySelector('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(payload.value);status.textContent='Visible text copied.'}catch{payload.focus();payload.select();status.textContent='Copy was unavailable. The text is selected; copy it manually.'}};render();</script></html>

```

[Code reference](https://sage.kajabi.com/pages/component/copy_text)

- Copy attempts use the browser clipboard API and expose a manual-copy fallback. The illustrated courses are original; native Rails CopyText components are documented separately.

### Complete copy interaction with failure handling

The copied text remains selectable if browser permissions or the embedding context disallow clipboard writes.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Share a sample course link</title>
<!-- Public Pine token stylesheet used by the Sage documentation. Pin its reviewed package version in production. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@kajabi-ui/styles@latest/dist/pine/pine.css">
<style>
body{font-family:var(--pine-font-family-body);color:var(--pine-color-text);background:var(--pine-color-background-app);padding:var(--pine-dimension-md)}
main{max-width:42rem;margin:auto;background:var(--pine-color-background-container);padding:var(--pine-dimension-md);border:var(--pine-border-width) solid var(--pine-color-border);border-radius:var(--pine-border-radius-md)}
textarea{box-sizing:border-box;width:100%;padding:var(--pine-dimension-sm);font:inherit;resize:vertical}
button{font:inherit;cursor:pointer;margin-top:var(--pine-dimension-sm);padding:var(--pine-dimension-xs) var(--pine-dimension-sm)}
button:focus-visible,textarea:focus-visible{outline:2px solid currentColor;outline-offset:3px}
</style><main><h1>Share a sample course link</h1><p>This is a fictional course URL.</p>
<label for="link">Text to copy</label><textarea id="link" readonly rows="2">https://example.com/courses/studio-notes</textarea>
<button type="button" id="copy">Copy course link</button><p id="message" role="status"></p></main>
<script>
const field=document.querySelector('#link'),message=document.querySelector('#message');
document.querySelector('#copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(field.value);message.textContent='Course link copied.'}
 catch{field.focus();field.select();message.textContent='Copy was unavailable. The link is selected; copy it manually.'}
};
</script></html>
```

[Code reference](https://sage.kajabi.com/pages/component/copy_text)

- A resolved clipboard promise is required before showing Copied.
- The visible value and copied value are the same string.
- This is an independent implementation using published Pine tokens, not a fabricated Sage clipboard API.

### Native Sage Rails copy anatomy

Use the documented Rails helpers inside an already configured Sage Rails application.

```erb
<h2 class="t-sage-heading-4">Course link</h2>
<%= sage_component SageCopyTextCard, {} do %>
  <p><b>Course:</b> Studio Notes</p>
  <p>https://example.com/courses/studio-notes</p>
<% end %>
<%= sage_component SageCopyButton, { value: "https://example.com/courses/studio-notes", semibold: true, fill_container: true } %>
```

[Code reference](https://sage.kajabi.com/pages/component/copy_text)

- The helpers require the existing Sage Rails, asset and system-JavaScript integration.
- Use semibold for the whole component rather than adding a broad bold override.

## Implementation Starting Point

Complete standalone public-token implementation; save as an HTML file and serve on localhost or HTTPS for clipboard support. This does not load Sage Rails/React components. Native Sage assets are distributed through the GitHub Packages registry, and the current asset README requires Pine tokens to be loaded separately.

```html
<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Share a sample course link</title>
<!-- Public Pine token stylesheet used by the Sage documentation. Pin its reviewed package version in production. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@kajabi-ui/styles@latest/dist/pine/pine.css">
<style>
body{font-family:var(--pine-font-family-body);color:var(--pine-color-text);background:var(--pine-color-background-app);padding:var(--pine-dimension-md)}
main{max-width:42rem;margin:auto;background:var(--pine-color-background-container);padding:var(--pine-dimension-md);border:var(--pine-border-width) solid var(--pine-color-border);border-radius:var(--pine-border-radius-md)}
textarea{box-sizing:border-box;width:100%;padding:var(--pine-dimension-sm);font:inherit;resize:vertical}
button{font:inherit;cursor:pointer;margin-top:var(--pine-dimension-sm);padding:var(--pine-dimension-xs) var(--pine-dimension-sm)}
button:focus-visible,textarea:focus-visible{outline:2px solid currentColor;outline-offset:3px}
</style><main><h1>Share a sample course link</h1><p>This is a fictional course URL.</p>
<label for="link">Text to copy</label><textarea id="link" readonly rows="2">https://example.com/courses/studio-notes</textarea>
<button type="button" id="copy">Copy course link</button><p id="message" role="status"></p></main>
<script>
const field=document.querySelector('#link'),message=document.querySelector('#message');
document.querySelector('#copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(field.value);message.textContent='Course link copied.'}
 catch{field.focus();field.select();message.textContent='Copy was unavailable. The link is selected; copy it manually.'}
};
</script></html>
```

## Agent Prompt

Create a Kajabi Sage course-sharing panel with explicit course selection and copy payload. Preserve the distinction between published Sage typography and the externally loaded Pine token layer. Keep the exact payload visible, show clipboard success only after it succeeds and offer manual selection when blocked. Use no real course, customer or publishing integration.

## Sources

- [Sage overview](https://sage.kajabi.com/pages/index) — Creator products, Rails and React.
- [Typography specification](https://sage.kajabi.com/pages/foundations/typography) — Published class sizes and weights.
- [Copy components](https://sage.kajabi.com/pages/component/copy_text) — Anatomy, Rails props and truncation guidance.
- [Color guidance](https://sage.kajabi.com/pages/foundations/color) — Purposeful interaction and feedback use.
- [Sage asset dependency](https://raw.githubusercontent.com/Kajabi/sage-lib/develop/packages/sage-assets/README.md) — External Pine tokens and legacy hex lookups.
- [Assets package metadata](https://raw.githubusercontent.com/Kajabi/sage-lib/develop/packages/sage-assets/package.json) — CSS entry and GitHub Packages distribution.
- [Live Pine stylesheet](https://cdn.jsdelivr.net/npm/@kajabi-ui/styles@latest/dist/pine/pine.css) — Default/light token aliases and values.
