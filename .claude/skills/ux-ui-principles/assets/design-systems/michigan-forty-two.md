# Michigan Forty Two Design System — OpenDesign Application Guide

Understand Forty-Two’s supported WordPress workflow, web palette and people-directory patterns through a working role-and-research filter example.

Independent OpenDesign interpretation. The supported Forty-Two WordPress theme and exact plugin internals are not bundled; all profiles are fictional.

## Source Reference

- **Institution:** Forty-Two is Michigan Engineering’s design system. ([source](https://cm.engin.umich.edu/our-brand/design-system-42/))
- **Foundations:** The system describes typography, color, lines and grids. ([source](https://cm.engin.umich.edu/our-brand/design-system-42/))
- **Components:** Its examples include lists, quotes, images and buttons. ([source](https://cm.engin.umich.edu/our-brand/design-system-42/))
- **Composition:** Component groups include calls to action, grids and galleries. ([source](https://cm.engin.umich.edu/our-brand/design-system-42/))
- **Publishing model:** WordPress blocks and patterns support page assembly. ([source](https://cm.engin.umich.edu/our-brand/design-system-42/))
- **Supported use:** The university wiki describes a C&M-supported WordPress framework. ([source](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system))
- **Contrast review:** Michigan Engineering publishes guidance for checking color contrast. ([source](https://accessibility.engin.umich.edu/color-contrast/))


## Design Reference

Official Michigan Engineering web palette, typography, training and publishing guidance. Preview geometry and runtime are explicitly original.

### Official web palette

[Official reference](https://cm.engin.umich.edu/our-brand/design-system-42/design-system-colors/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Maize / Blue | #FFCB05 / #00274C | Primary identity pair; supporting colors do not replace it. |
| Base text / surface | #131516 / #FAFAFA | Puma Black and Base White. |
| February Grey | #E9E9E9 | Light neutral division or supporting surface. |
| Community Blue | #1E406B | Supporting blue tone. |
| Research Blue | #2A5993 | Supporting blue tone. |
| Hyperlink Blue | #1779BA | Named web link tone; still check context and contrast. |
| Web A2 Amethyst | #663289 | Use web-system palette; older general brand page lists a different purple. |

### Typography and language

[Official reference](https://cm.engin.umich.edu/our-brand/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Interface/headline family | Roboto | Official web family; weight communicates emphasis. |
| Paragraph family | Open Sans | Official guidance specifically assigns it to web paragraphs. |
| Playfair Display | Print-oriented serif option | Do not infer that every web heading should use it. |
| Page and section names | Sentence case | Also applies to anchor links, promo titles and captions. |
| CTA punctuation | No punctuation | Documented writing convention; preserve meaningful wording. |

### Supported platform and patterns

[Official reference](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Runtime | Institution-supported WordPress Forty-Two theme | Available through C&M or CAEN arrangement, not a verified public npm SDK. |
| Composition | Blocks and patterns | Elements/components appear as blocks; larger groups can be patterns. |
| People directory | Role and Research filters; Query Sort or Sidebar layouts | Official documentation inventory; exact plugin API not publicly verified here. |
| Deprecated component | Accordion Item | Listed as deprecated; do not recommend it for a new page. |
| Navigation maintenance | Appearance > Editor > Navigation | Add/reorder the destination in the intended menu after page creation. |

### Explicit preview decisions

[Official reference](https://training.engin.umich.edu/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Preview runtime | Original HTML/CSS/JS | Demonstrates the documented concept; does not load the restricted institutional theme. |
| Preview typography | Arial; 17px body / 1.6 line-height | Deliberate fallback and original size, not an official token. |
| Preview geometry | 1040px max; 220px filter sidebar; 32px gap | Original composition, not published Forty-Two grid values. |
| Preview compact breakpoint | 700px | Stacks filters above results; application choice. |
| Filter semantics | Role AND research area | Original local intersection with no-results recovery. |

## Michigan Forty Two Design System Institutional implementation

### A supported WordPress ecosystem

Forty-Two is the Michigan Engineering design system and a supported WordPress theme. The official overview describes elements, components and component groups, mapped to blocks and patterns in the editor. The theme is offered to Engineering departments and units through Communications & Marketing or CAEN hosting arrangements. It should not be presented as a generic npm package that any project can install.

The local specimen is a transparent interpretation of the documented people-directory concept. It uses the published web palette and fictional profiles, while its layout and filtering code are original. An authorized institutional site should use the supported theme and its current patterns instead of copying this demonstration into a custom HTML block and assuming it is equivalent.

[Supporting specification](https://cm.engin.umich.edu/our-brand/design-system-42/)

## Michigan Forty Two Design System Web palette and contrast

### Use the web-specific reference

Maize and Blue provide the primary identity. The web palette adds Base Puma Black, Base White and named blue tones, including Hyperlink Blue. Secondary hues support the primary pair; they are not a reason to assign every academic topic an unrelated loud background. The specimen keeps the identity colors in the header and uses restrained neutrals around the results.

The web-system palette and the general brand page differ on some secondary values, including A2 Amethyst. The reference table uses the dedicated web-system source. Any departure from a theme default still needs a contrast check. A color with an official name is not automatically suitable for small text on every background.

[Supporting specification](https://cm.engin.umich.edu/our-brand/design-system-42/design-system-colors/)

## Michigan Forty Two Design System Typography and editorial voice

### Hierarchy without invented font tokens

The Engineering typography guide identifies Roboto and Open Sans as its main web families, with Open Sans used for paragraphs. Playfair Display is described for print-oriented use, so it is not evidence for a mandatory serif web heading. This preview explicitly uses Arial fallback; its 17px body and heading sizes are demonstration choices rather than fabricated Forty-Two typography tokens.

Writing guidance calls for sentence case in page titles, section headings, anchor labels, promo titles and captions. That fits a people directory: a clear name, role and research description carry more information than a promotional slogan. Keep institutional naming accurate on real sites and avoid adding unverified credentials to profiles.

[Supporting specification](https://cm.engin.umich.edu/our-brand/typography/)

## Michigan Forty Two Design System People and taxonomy structure

### Separate the person from the filter label

The official training index includes People setup, adding a role or research area, and two filter layouts: Query Sort and Sidebar. Those entries establish that people and their classifications are managed content, not manually duplicated blocks on each listing page. The exact current plugin attributes were not publicly retrieved, so this guide does not invent shortcode names or query keys.

In the independent example, each person has one role and one area. Both filters apply together. This deliberately small model makes the intersection visible: Faculty plus Robotics returns no results, while Research staff plus Robotics returns one. A production taxonomy can be richer, but its AND/OR behavior should be explicit before building the interface.

```javascript
// Original local filter composition; not a Forty-Two plugin API.
const matches = (person, role, area) =>
  (role === 'all' || person.role === role) &&
  (area === 'all' || person.area === area);
// Apply both conditions; clearing one filter must preserve the other.
// Announce the result count and offer recovery when the intersection is empty.
```

[Code reference](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system)

[Supporting specification](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system)

## Michigan Forty Two Design System Filtering and recovery

### Keep the current selection understandable

Changing a filter updates visible profiles and a result-count live region. It does not move focus away from the select, so keyboard users can compare options without repeatedly returning to the control. The no-results message explains that the combination is empty and points to changing either field or clearing both.

Clear filters restores the default values and all profiles, then returns focus to the first filter. The profiles remain in a stable order. This avoids a subtle problem in directories where each filter change both removes and unexpectedly reorders people. The names and descriptions here are fictional, with no real university appointments implied.

1. Select Research staff and confirm that the directory narrows to one profile.
2. Combine Faculty with Robotics and inspect the empty-state recovery message.
3. Clear both filters and confirm all three profiles return in the original order.

[Supporting specification](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system)

## Michigan Forty Two Design System Blocks, patterns and maintenance

### Choose a maintained pattern

The training inventory includes experts, events, query loops, recent posts and people patterns. Use the pattern that matches the content model rather than assembling a visually similar grid from unconnected text boxes. A people pattern can preserve the relationship between a person record and the directory that displays it.

The older Accordion Item is explicitly listed as deprecated. Its presence in historical training material is not a recommendation for a new implementation. When existing pages use an older block, consult the current training site and supported maintenance process before replacing it; preserve meaningful content and existing destinations while changing presentation.

- People records: names, roles, areas and profile content belong in the supported content structure.
- Patterns: use a current documented composition for the listing or promotional section.
- Navigation: treat discovery links as maintained content, not a side effect of publishing a page.

[Supporting specification](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system)

## Michigan Forty Two Design System Practical editor workflow

### Connect a new page to the site

The official new-page checklist explains that publishing a page does not automatically make it discoverable. Assign its parent, then connect it to the required header, sub-navigation, role/research filters or footer. In the documented editor flow, open Appearance, Editor and Navigation, select the appropriate menu, add the page and adjust its position in list view.

For an authorized Forty-Two project, this editor workflow is the concrete integration path. There is no fabricated public SDK command in this resource. The setup block states the supported hosting route and links to the training material; the complete local code example is separately labelled for independent study.

[Supporting specification](https://training.engin.umich.edu/page-basics/new-page-checklist/)

## Michigan Forty Two Design System Accessibility and identity limits

### Default styles do not validate content

Engineering accessibility guidance says default Forty-Two components are designed with accessible contrast, but changing colors can invalidate that benefit. Profile content also needs meaningful headings, useful link labels, accurate image alternatives and an understandable empty state. The preview checks responsive layout and filter behavior, not institutional compliance certification.

The original preview uses no Block M, university signature or real staff data. Institutional logos are distributed through authenticated brand channels and belong to an identity system separate from these teaching colors. A genuine Engineering site should follow its supported brand and publishing process; an independent prototype should identify itself honestly.

[Supporting specification](https://accessibility.engin.umich.edu/color-contrast/)

## Component Examples

### Intersect role and area

Original local filtering rule that makes the documented directory concept concrete.

```javascript
// Original local filter composition; not a Forty-Two plugin API.
const matches = (person, role, area) =>
  (role === 'all' || person.role === role) &&
  (area === 'all' || person.area === area);
// Apply both conditions; clearing one filter must preserve the other.
// Announce the result count and offer recovery when the intersection is empty.
```

[Code reference](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system)

### Complete people-directory interpretation

Includes two filters, result announcement, no-results recovery and reset.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Research collaborators</title><style>*{box-sizing:border-box}body{margin:0;color:#131516;background:#fafafa;font:17px/1.6 Arial,sans-serif}header{background:#00274c;color:#fafafa;border-top:8px solid #ffcb05;padding:32px}h1{font-size:36px;line-height:1.15;margin:8px 0 16px}h2{font-size:23px;line-height:1.25;margin:0 0 8px}main,header>div{max-width:1040px;margin:auto}.layout{display:grid;grid-template-columns:220px 1fr;gap:32px;padding:32px}label{display:block;font-weight:bold;margin:0 0 8px}select,button{font:inherit;padding:10px;width:100%;border:1px solid #00274c;margin-bottom:24px;background:white;color:#00274c}button{cursor:pointer;font-weight:bold}button:focus-visible,select:focus-visible{outline:3px solid #00274c;outline-offset:3px}article{padding:24px 0;border-top:1px solid #e9e9e9}article p{margin:8px 0}.role{color:#1e406b;font-weight:bold}.topic{display:inline-block;background:#e9e9e9;padding:4px 10px;font-size:14px}#empty{border-left:6px solid #ffcb05;padding:16px;background:white}footer{font-size:14px;padding:24px 32px;border-top:1px solid #e9e9e9}[hidden]{display:none!important}@media(max-width:700px){.layout{grid-template-columns:1fr;padding:24px;gap:8px}header{padding:24px}h1{font-size:30px}.filters{display:grid;grid-template-columns:1fr 1fr;gap:12px}.filters button{grid-column:1/-1;margin-bottom:8px}select{margin-bottom:8px}}</style><header><div><small>INDEPENDENT RESEARCH DIRECTORY</small><h1>Find a collaborator</h1><p>Explore fictional profiles by role and research area.</p></div></header><main><div class="layout"><aside class="filters" aria-label="Filter people"><div><label for="role">Role</label><select id="role"><option value="all">All roles</option><option value="faculty">Faculty</option><option value="staff">Research staff</option></select></div><div><label for="area">Research area</label><select id="area"><option value="all">All areas</option><option value="energy">Energy</option><option value="robotics">Robotics</option><option value="materials">Materials</option></select></div><button id="reset">Clear filters</button></aside><section aria-label="Matching people"><p id="count" role="status">3 people</p><article data-role="faculty" data-area="energy"><h2>Avery Chen</h2><p class="role">Faculty</p><p>Studies ways to make community energy systems easier to understand and maintain.</p><span class="topic">Energy</span></article><article data-role="staff" data-area="robotics"><h2>Jordan Ellis</h2><p class="role">Research staff</p><p>Supports experiments in human-centred robotics and field testing.</p><span class="topic">Robotics</span></article><article data-role="faculty" data-area="materials"><h2>Samira Patel</h2><p class="role">Faculty</p><p>Explores how durable materials can support repair and reuse.</p><span class="topic">Materials</span></article><div id="empty" hidden><h2>No matching people</h2><p>Try another role or research area, or clear both filters.</p></div></section></div><footer>OpenDesign interpretation of Forty-Two’s documented people-directory concept and web palette. Fictional profiles; Arial fallback, original layout and filtering. Not the university’s WordPress theme or an official directory.</footer></main><script>const role=document.querySelector('#role'),area=document.querySelector('#area');function filter(){let n=0;document.querySelectorAll('article').forEach(a=>{a.hidden=!((role.value==='all'||role.value===a.dataset.role)&&(area.value==='all'||area.value===a.dataset.area));if(!a.hidden)n++});document.querySelector('#count').textContent=n+' '+(n===1?'person':'people');document.querySelector('#empty').hidden=n!==0}role.onchange=area.onchange=filter;document.querySelector('#reset').onclick=()=>{role.value=area.value='all';filter();role.focus()};</script></html>
```

[Code reference](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system)

## Implementation Starting Point

Institutional theme adoption, not a public package installation. The independent HTML example is complete and runs locally. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/michigan-forty-two.html. Do not open module-based examples through file://.

```text
Supported institutional adoption:
1. Confirm the site is a Michigan Engineering department or unit project.
2. Arrange a Forty-Two WordPress site through Communications & Marketing or CAEN web publishing.
3. Use the Training site to select an existing block/pattern and create page stubs.
4. Build People content with the supported role/research-area structure and the current People pattern.
5. Connect the page to the intended navigation and filters in Appearance > Editor.
6. Preview real content, contrast and narrow layouts before publishing through the institution's process.

Independent study:
Open the complete HTML example below locally. It does not install or reproduce the institution's theme.
```

## Agent Prompt

For an authorized Michigan Engineering site, use the supported Forty-Two WordPress theme and current People patterns. Keep roles and research areas as maintained classifications, use the web-specific palette and documented typography, and connect new pages to navigation. For an independent prototype, label original geometry/runtime, use fictional people and avoid institutional logos. Implement clear combined filtering and empty-state recovery.

## Sources

- [System and hosting scope](https://cm.engin.umich.edu/our-brand/design-system-42/) — WordPress blocks, patterns and authorized hosting route.
- [Web colors](https://cm.engin.umich.edu/our-brand/design-system-42/design-system-colors/) — Web-specific palette and contrast obligations.
- [Typography](https://cm.engin.umich.edu/our-brand/typography/) — Roboto, Open Sans and editorial hierarchy.
- [Training inventory](https://sites.google.com/a/umich.edu/engcom-wiki/web/42-design-system) — People filters, patterns and deprecated blocks.
- [New-page workflow](https://training.engin.umich.edu/page-basics/new-page-checklist/) — Concrete navigation/editor steps.
- [Contrast guidance](https://accessibility.engin.umich.edu/color-contrast/) — Default-theme and custom-color boundaries.
- [Writing conventions](https://sites.google.com/a/umich.edu/engcom-wiki/web/writing-best-practices/text-content) — Sentence case and CTA conventions.
- [Download complete working example](/assets/demos/michigan-forty-two-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
