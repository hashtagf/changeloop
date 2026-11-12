# CMS Design System — OpenDesign Application Guide

Implement CMS Core with versioned theme variables, real Review component APIs, and a working edit-and-review flow that preserves user answers and focus.

Core-theme technical reference. Fictional preference values and local-only changes; no health eligibility advice, CMS affiliation, or submitted form is represented.

## Source Reference

- **Maintainer:** Centers for Medicare and Medicaid Services ([source](https://design.cms.gov/))
- **Foundation relationship:** Builds on the U.S. Web Design System ([source](https://design.cms.gov/))
- **Implementation resources:** CSS and React components with utilities and a grid ([source](https://design.cms.gov/))
- **Service contexts:** Applied to HealthCare.gov and Medicare.gov ([source](https://design.cms.gov/))
- **Package:** @cmsgov/design-system ([source](https://design.cms.gov/))
- **Review pattern:** Dedicated form-review guidance ([source](https://design.cms.gov/patterns/Forms/form-review/))


## Design Reference

CMS Core 18.1.0 published core-theme.css and component CSS. Versioned artifact wins where general documentation prose differs. Preview uses Arial fallback and an application-specific 48rem shell.

### Color roles

[Official reference](https://cdn.jsdelivr.net/npm/@cmsgov/design-system@18.1.0/dist/css/core-theme.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-base | #262626 | Versioned Core text value; older overview prose says #333. |
| --color-primary / primary-darker | #0071bc / #004f84 | Action and darker interaction references. |
| --color-error / success | #e31c3d / #12890e | Always pair state color with a textual explanation. |
| --color-border | #d9d9d9 | Also used by --review__border-color. |
| --color-focus-dark / focus-light | #bd13b8 / #ffffff | Theme focus references. |
| --color-background / gray-lightest | #ffffff / #f2f2f2 | Page and light supporting surfaces. |

### Typography

[Official reference](https://cdn.jsdelivr.net/npm/@cmsgov/design-system@18.1.0/dist/css/core-theme.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --font-family-body / heading | Open Sans, Inter, Roboto, Helvetica Neue, Arial Nova, Nimbus Sans, Arial, sans-serif | Exact family order in 18.1.0; preview substitutes Arial. |
| --font-size-sm / md / lg / xl / 2xl | .875 / 1 / 1.125 / 1.3125 / 1.5rem | 14 / 16 / 18 / 21 / 24px at 16px root. |
| --font-size-3xl--mobile / 3xl | 1.875 / 2.25rem | 30 / 36px. |
| --font-size-4xl--mobile / 4xl | 2.25 / 3rem | 36 / 48px. |
| --font-size-5xl--mobile / --tablet / 5xl | 2.25 / 3 / 3.75rem | 36 / 48 / 60px. |
| --font-line-height-base / heading | 1.5 / approximately 1.3 | Theme stores the heading value as 1.2999999523162842. |

### Space, grid and shape

[Official reference](https://cdn.jsdelivr.net/npm/@cmsgov/design-system@18.1.0/dist/css/core-theme.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --spacer-half / 1 / 2 / 3 | 4 / 8 / 16 / 24px | Utility numeric modifiers multiply by 8px. |
| --spacer-4 / 5 / 6 / 7 | 32 / 40 / 48 / 56px | Larger layout rhythm. |
| --grid-columns | 12 | Grid composition. |
| --grid-gutter-width / grid-form-gutter-width | 32 / 16px | Separate generic and form gutters in current theme. |
| --site-max-width | 1104px | Theme container reference. |
| --site-margins / site-margins-mobile | 3rem / 1.5rem | 48 / 24px at standard root. |
| --radius-default / medium / large | 3 / 4 / 8px | Not a single universal rounding value. |

### Responsive boundaries

[Official reference](https://design.cms.gov/foundation/layout-grid/responsive-design/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sm | 544px | Mobile-first small prefix. |
| md | 768px | Medium prefix. |
| lg | 1024px | Large prefix. |
| xl | 1280px | Extra-large prefix. |

## CMS Design System Choose Core or a child theme

### The package is a family, not one branded skin

CMS Core provides shared interface foundations, with separate child systems for Healthcare.gov, Medicare.gov, and CMS.gov. This reference pins @cmsgov/design-system 18.1.0 and its core-theme.css. A colour, logo, or component available in a child theme is not automatically a Core rule. The example deliberately uses a neutral notice-preference workflow and omits official government banners and identity marks.

There are React, Preact, web-component, and manual HTML/CSS integration paths. The documentation recommends JavaScript components when their built-in behavior is useful; the web-component collection is a subset. Our standalone specimen uses real Core CSS with application JavaScript for edit/save/cancel. It does not claim that CSS implements validation, routing, or persistence.

[Supporting specification](https://design.cms.gov/getting-started/for-developers/)

## CMS Design System Read the versioned theme

### Include both stylesheets

index.css defines component rules and core-theme.css supplies their variables. Omitting the theme can leave valid class names with unresolved values. Conversely, importing a Medicare theme while describing Core typography produces a misleading result even if the page renders. The setup includes both assets from the same 18.1.0 release.

The versioned theme is the source for numeric values in this guide. For example, --color-base is #262626, although the broad typography prose still mentions #333. The theme’s --grid-gutter-width is --spacer-4 (32px), while --grid-form-gutter-width is --spacer-2 (16px). A general sentence describing 16px gutters should not be applied to every grid variant. These differences matter when reproducing a real layout.

[Supporting specification](https://cdn.jsdelivr.net/npm/@cmsgov/design-system@18.1.0/dist/css/core-theme.css)

## CMS Design System Core typography and hierarchy

### One family, explicit role sizes

Core uses Open Sans for headings and body content. The 18.1.0 theme’s fallback chain continues through Inter, Roboto, Helvetica Neue, Arial Nova, Nimbus Sans, Arial, and sans-serif. The local specimen uses Arial explicitly so it does not request external font files; its metrics therefore differ from the full official typography.

The body base is 1rem with 1.5 line height. The size variables include 14, 16, 18, 21, and 24px at a 16px root, followed by larger responsive roles: 3xl is 30px mobile and 36px otherwise; 4xl is 36px mobile and 48px otherwise; 5xl is 36px mobile, 48px tablet, and 60px at its largest role. These are theme values, not permission to use the largest size for every page title. Use semantic headings and the appropriate utility or ds-content mapping.

[Supporting specification](https://cdn.jsdelivr.net/npm/@cmsgov/design-system@18.1.0/dist/css/core-theme.css)

## CMS Design System Spacing and responsive layout

### Eight-pixel rhythm with a half step

--spacer-1 through --spacer-7 map to 8–56px in eight-pixel increments. --spacer-half is 4px and --spacer-none is zero. A class such as ds-u-margin--2 therefore means 16px, not 2rem. The review row’s native CSS provides 16px vertical padding and a 2px bottom border; the surrounding form does not need another padded card around every answer.

Core’s site maximum is 1104px, with site margins of 3rem and mobile margins of 1.5rem in the versioned theme. The specimen chooses a smaller 48rem reading shell for two short review rows. This is an application width, not a new CMS token.

[Supporting specification](https://design.cms.gov/foundation/spacing/)

### Use CMS breakpoint prefixes

The documented boundaries are sm 544px, md 768px, lg 1024px, and xl 1280px. Layout and selected utility families accept these prefixes, for example ds-u-lg-display--none. Do not assume every component class has a responsive variant. On mobile the review’s long value must wrap without pushing its Edit control outside the screen; the preview also stacks the application action row when necessary.

[Supporting specification](https://design.cms.gov/foundation/layout-grid/responsive-design/)

## CMS Design System Review row anatomy and API

### A label, value, and contextual edit destination

Review wraps one reviewable item. Its heading defaults to h3, can be set with headingLevel, and is followed by children representing the current value. editHref supplies a destination; without it no edit link is shown. editAriaLabel gives a repeated visible Edit link an unambiguous accessible name. The 18.1.0 type declaration also provides editText, onEditClick, and editContent, where custom editContent replaces the default link.

The React example uses actual props verified in the published declaration. Its paths are illustrative application routes that a consuming app must implement. The native CSS alternative shows the ds-c-review, ds-c-review__content, and ds-c-review__heading structure; it still requires the application to manage navigation and updates.

```jsx
import { Review } from '@cmsgov/design-system';
import '@cmsgov/design-system/css/index.css';
import '@cmsgov/design-system/css/core-theme.css';

export default function ContactReview() {
  return <section aria-labelledby="contact-title">
    <h2 id="contact-title">Contact preferences</h2>
    <Review heading="Notice format" headingLevel="3"
      editHref="/preferences/notice-format"
      editAriaLabel="Edit notice format">
      <p>Large print</p>
    </Review>
    <Review heading="Preferred language" headingLevel="3"
      editHref="/preferences/language"
      editAriaLabel="Edit preferred language">
      <p>English</p>
    </Review>
  </section>;
}
```

[Code reference](https://cdn.jsdelivr.net/npm/@cmsgov/design-system@18.1.0/dist/react-components/types/Review/Review.d.ts)

[Supporting specification](https://design.cms.gov/components/review/)

## CMS Design System Line editing versus section editing

### Keep the correction route predictable

The CMS form-review pattern distinguishes editing one answer from editing a whole section. Independent notice-format and language preferences fit line editing. Interdependent answers, such as household members and their related relationships, may need section editing so the application can recalculate consistency together. The official guidance explicitly says that placing a section-level Edit beside its heading is not implemented by the Review component itself.

The preview opens a focused fieldset for the selected row. Save updates just that value and returns focus to the initiating Edit control; Cancel discards the draft. It also keeps the visible answer unchanged while the editor is open. A local status reports the actual change, rather than announcing success merely because the edit form appeared.

- Use the same question labels and ordering in entry and review.
- Provide a contextual edit name for each row, even when the visible link says Edit.
- Keep section editing outside the single-row component when related answers must be changed together.

[Supporting specification](https://design.cms.gov/patterns/Forms/form-review/)

## CMS Design System Review, completion and truth

### A review is not a submission receipt

Review is suitable for editable form answers, not a search-results substitute. On a real submission flow, the pattern calls for a final submit action after review. That action must represent a real backend outcome before displaying a receipt. The specimen instead offers Complete local review and explicitly states that nothing is submitted or stored.

Core distinguishes primary blue #0071bc, error red #e31c3d, success green #12890e, and border grey #d9d9d9. A saved preference is identified by text as well as color. Focus uses the theme’s light and dark focus references; do not remove the indicator when styling Edit as a minimal control. The final status can be reached with the keyboard and does not erase the review rows.

[Supporting specification](https://design.cms.gov/patterns/Forms/form-review/)

## CMS Design System Install and extend safely

### A complete CSS path and a real component path

Install the pinned package and import css/index.css plus css/core-theme.css through the package exports. React consumers import Review from the package root; Preact consumers have a /preact entry. The example does not require Sass compilation. If copying static CSS, preserve the relative font and image asset paths or explicitly choose a supported fallback as this specimen does.

The CMS namespace separates ds-l- layouts, ds-c- components, and ds-u- utilities. Application classes should not pretend to be undocumented official components. In the preview, the reading shell and inline editor are local composition; the review row and buttons use the distributed styles.

1. Load the matching Core component and theme CSS, then render the two review rows.
2. Wire each edit action to a controlled editor; return focus after save and cancel.
3. Test changed values, discarded drafts, and final local completion at desktop and mobile widths.

[Supporting specification](https://design.cms.gov/getting-started/for-developers/)

## Component Examples

### Two independent review rows

Actual 18.1.0 React props; consuming applications implement the linked edit routes.

```jsx
import { Review } from '@cmsgov/design-system';
import '@cmsgov/design-system/css/index.css';
import '@cmsgov/design-system/css/core-theme.css';

export default function ContactReview() {
  return <section aria-labelledby="contact-title">
    <h2 id="contact-title">Contact preferences</h2>
    <Review heading="Notice format" headingLevel="3"
      editHref="/preferences/notice-format"
      editAriaLabel="Edit notice format">
      <p>Large print</p>
    </Review>
    <Review heading="Preferred language" headingLevel="3"
      editHref="/preferences/language"
      editAriaLabel="Edit preferred language">
      <p>English</p>
    </Review>
  </section>;
}
```

[Code reference](https://design.cms.gov/components/review/)

- Review defaults to h3.
- editContent replaces the default edit link; editHref is required to show that link.

### Native CSS review anatomy

A useful manual HTML integration when the application owns interactions.

```html
<div class="ds-c-review">
  <div class="ds-c-review__content">
    <h3 class="ds-c-review__heading">Notice format</h3>
    <p>Large print</p>
  </div>
  <a href="/preferences/notice-format" aria-label="Edit notice format">Edit</a>
</div>
```

[Code reference](https://design.cms.gov/components/review/)

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Notice preferences — CMS Core specimen</title><link rel="stylesheet" href="vendor/cms-18.1.0/index.css"><link rel="stylesheet" href="vendor/cms-18.1.0/core-theme.css"><style>body,body *,body *::before,body *::after{font-family:Arial,sans-serif!important}body{margin:0;border-top:8px solid #0071bc}.shell{max-width:48rem;margin:auto;padding:32px 24px}h1{font-size:32px;line-height:1.3;margin:16px 0 24px}h2{font-size:24px;margin:32px 0 16px}.intro{margin-bottom:32px}.ds-c-review__content p{margin:8px 0}.edit{align-self:flex-start;min-width:48px;border:0;background:none;color:#0071bc;text-decoration:underline;font-size:16px;padding:4px;cursor:pointer}.editor{margin:24px 0;padding:24px;background:#e6f1f8;border-left:4px solid #0071bc}fieldset{padding:0;border:0;margin:0}legend{font-size:20px;font-weight:700;margin-bottom:16px}.choice{display:flex;align-items:center;gap:12px;margin:16px 0}.choice input{width:20px;height:20px;accent-color:#0071bc}.actions{display:flex;flex-wrap:wrap;gap:24px;margin-top:24px}footer{margin-top:40px;padding-top:24px;border-top:1px solid #d9d9d9}#status{margin-top:24px;font-weight:bold}button:focus-visible,input:focus-visible{outline:3px solid #bd13b8;outline-offset:3px}[hidden]{display:none!important}@media(max-width:543px){.editor{padding:16px}.actions{flex-direction:column;align-items:flex-start}}</style></head><body><main class="shell"><p>CMS Core component example</p><h1>Review your notice preferences</h1><p class="intro">Check these fictional preferences before completing the local review. This example does not collect health information or contact details.</p><section aria-labelledby="preferences"><h2 id="preferences">Notice preferences</h2><div class="ds-c-review"><div class="ds-c-review__content"><h3 class="ds-c-review__heading">Notice format</h3><p id="format-value">Standard print</p></div><button class="edit" data-field="format" aria-label="Edit notice format">Edit</button></div><div class="ds-c-review"><div class="ds-c-review__content"><h3 class="ds-c-review__heading">Preferred language</h3><p id="language-value">English</p></div><button class="edit" data-field="language" aria-label="Edit preferred language">Edit</button></div></section><form class="editor" id="editor" hidden><fieldset><legend id="legend"></legend><div id="choices"></div></fieldset><div class="actions"><button class="ds-c-button ds-c-button--solid" type="submit">Save preference</button><button class="ds-c-button" id="cancel" type="button">Cancel</button></div></form><div class="actions"><button class="ds-c-button ds-c-button--solid" id="complete">Complete local review</button><button class="ds-c-button" id="reset">Reset example</button></div><p id="status" role="status"></p><footer>Native CMS Core 18.1.0 CSS · Arial fallback<br>Changes exist only on this page. Nothing is submitted or saved after you leave.</footer></main><script>const values={format:'Standard print',language:'English'},options={format:['Standard print','Large print','Electronic text'],language:['English','Spanish']},labels={format:'Notice format',language:'Preferred language'};let field,opener;const editor=document.querySelector('#editor'),status=document.querySelector('#status');function close(){editor.hidden=true;opener?.focus()}document.querySelectorAll('.edit').forEach(button=>button.addEventListener('click',()=>{field=button.dataset.field;opener=button;document.querySelector('#legend').textContent='Edit '+labels[field].toLowerCase();document.querySelector('#choices').replaceChildren(...options[field].map((text,i)=>{const label=document.createElement('label');label.className='choice';const input=document.createElement('input');input.type='radio';input.name='preference';input.value=text;input.checked=text===values[field];label.append(input,document.createTextNode(text));return label}));editor.hidden=false;editor.querySelector('input:checked').focus();status.textContent=''}));editor.addEventListener('submit',event=>{event.preventDefault();values[field]=editor.querySelector('input:checked').value;document.querySelector('#'+field+'-value').textContent=values[field];status.textContent=labels[field]+' updated to '+values[field]+'.';close()});document.querySelector('#cancel').addEventListener('click',close);document.querySelector('#complete').addEventListener('click',()=>{if(!editor.hidden){status.textContent='Save or cancel the open edit before completing the review.';editor.querySelector('input:checked').focus();return}status.textContent='Local review complete. No data was submitted.'});document.querySelector('#reset').addEventListener('click',()=>{values.format='Standard print';values.language='English';Object.entries(values).forEach(([key,value])=>document.querySelector('#'+key+'-value').textContent=value);editor.hidden=true;status.textContent='Example reset.'});</script></body></html>
```

[Code reference](https://design.cms.gov/components/review/)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

Package exports and Review props verified in published 18.1.0 metadata/types. React example is supplied for integration; standalone preview executes native CSS plus local application JavaScript. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/cms.html. Do not open module-based examples through file://.

```jsx
// npm install @cmsgov/design-system@18.1.0
import { Review } from '@cmsgov/design-system';
import '@cmsgov/design-system/css/index.css';
import '@cmsgov/design-system/css/core-theme.css';

export default function ContactReview() {
  return <section aria-labelledby="contact-title">
    <h2 id="contact-title">Contact preferences</h2>
    <Review heading="Notice format" headingLevel="3"
      editHref="/preferences/notice-format"
      editAriaLabel="Edit notice format">
      <p>Large print</p>
    </Review>
    <Review heading="Preferred language" headingLevel="3"
      editHref="/preferences/language"
      editAriaLabel="Edit preferred language">
      <p>English</p>
    </Review>
  </section>;
}
```

## Agent Prompt

Build a CMS Core 18.1.0 review screen. Load index.css and core-theme.css together. Use Review with heading, children, editHref and editAriaLabel for each independently editable answer; section-level editing is separate application composition. Preserve question order and visible saved values while drafts are edited. Return focus on save/cancel and announce actual updates. Use Core tokens including #262626 base text, 8px spacers with 4px half step, 32px general grid gutter and 16px form gutter. Do not mix child-theme logos or pretend a local review submits an application.

## Sources

- [CMS Design System](https://design.cms.gov/) — Official introduction, foundations and component catalogue.
- [Developer guidance](https://design.cms.gov/getting-started/for-developers/) — Official integration routes and package guidance.
- [Form review](https://design.cms.gov/patterns/Forms/form-review/) — Pattern for reviewing form information.
- [Download complete working example](/assets/demos/cms-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
