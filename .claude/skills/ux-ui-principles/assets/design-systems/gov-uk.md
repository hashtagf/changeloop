# GOV.UK Design System — OpenDesign Application Guide

Build a GOV.UK-style question and check-answers journey with the current v6 type scale, responsive spacing, functional colours, linked validation and concrete Frontend integration.

Independent OpenDesign application study using GOV.UK Frontend 6.5.1 component CSS and JavaScript. No government logo, Transport font, official service, real submission or compliance certification is implied. The form rules and review navigation are original application code.

## Source Reference

- **Maintainer:** Government Digital Service ([source](https://design-system.service.gov.uk/))
- **Reference structure:** Styles, components and patterns ([source](https://design-system.service.gov.uk/))
- **Review pattern:** Check answers before submitting information ([source](https://design-system.service.gov.uk/patterns/check-answers/))
- **Question pattern:** Dedicated question-page guidance ([source](https://design-system.service.gov.uk/patterns/question-pages/))
- **Error component:** Error summary ([source](https://design-system.service.gov.uk/components/error-summary/))
- **Frontend distribution:** GOV.UK Frontend is available through npm ([source](https://frontend.design-system.service.gov.uk/installing-with-npm/))


## Design Reference

GOV.UK Frontend 6.5.1 and current v6 documentation, checked 3 October 2026. Hex values are a reference snapshot; prefer named Sass functions in production. The preview loads the local official CSS and JavaScript with an alternative font and independent identity.

### Typeface and responsive type

[Official reference](https://design-system.service.gov.uk/styles/type-scale/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| govuk-heading-xl | 32px / 35px → 48px / 50px | Font size / line height below and above the tablet boundary; page title. |
| govuk-heading-l | 27px / 30px → 36px / 40px | Font size / line height below and above the tablet boundary; question heading. |
| govuk-heading-m | 21px / 25px → 24px / 30px | Font size / line height below and above the tablet boundary; section heading. |
| govuk-body-l | 21px / 25px → 24px / 30px | Font size / line height below and above the tablet boundary; lead text. |
| govuk-body | 19px / 25px → 19px / 25px | Font size / line height below and above the tablet boundary; ordinary text. |
| govuk-body-s | 16px / 20px → 16px / 20px | Font size / line height below and above the tablet boundary; supporting text. |

### Font eligibility

[Official reference](https://design-system.service.gov.uk/styles/typeface/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| GDS Transport | service.gov.uk services | The official font is required for services on that subdomain. |
| Independent preview | Helvetica Neue, Helvetica, Arial, sans-serif | Alternative stack recommended by the unbranded Frontend guidance; no Transport files are loaded. |

### Responsive and static spacing

[Official reference](https://design-system.service.gov.uk/styles/spacing/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| unit 0 | 0px → 0px; static 0px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 1 | 5px → 5px; static 5px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 2 | 10px → 10px; static 10px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 3 | 15px → 15px; static 15px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 4 | 15px → 20px; static 20px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 5 | 15px → 25px; static 25px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 6 | 20px → 30px; static 30px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 7 | 25px → 40px; static 40px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 8 | 30px → 50px; static 50px | Responsive small → large; govuk-spacing(unit) stays static. |
| unit 9 | 40px → 60px; static 60px | Responsive small → large; govuk-spacing(unit) stays static. |

### Functional colour names

[Official reference](https://design-system.service.gov.uk/styles/colour/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| govuk-functional-colour("text") | #0b0c0c | Main readable content |
| govuk-functional-colour("secondary-text") | #484949 | Hints and supporting information |
| govuk-functional-colour("link") | #1a65a6 | Ordinary links |
| govuk-functional-colour("link-hover") | #0f385c | Link hover |
| govuk-functional-colour("link-visited") | #54319f | Visited destinations |
| govuk-functional-colour("border") | #cecece | Structural separators |
| govuk-functional-colour("input-border") | #0b0c0c | Input boundary |
| govuk-functional-colour("focus") | #ffdd00 | Keyboard focus only |
| govuk-functional-colour("focus-text") | #0b0c0c | Text on focus yellow |
| govuk-functional-colour("error") | #ca3535 | Validation feedback |
| govuk-functional-colour("success") | #0f7a52 | Success feedback |
| govuk-functional-colour("body-background") | #ffffff | Reading surface |

### Layout primitives

[Official reference](https://design-system.service.gov.uk/styles/layout/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| govuk-width-container | 1020px maximum | Default outer content width; may be overridden for a genuine content need. |
| govuk-grid-row + govuk-grid-column-two-thirds | 2/3 at wider widths | Keep questions and prose in a readable column; stack at small widths. |
| govuk-main-wrapper | Main content region | Use on the main landmark inside the width container. |

### Breakpoints and control outlines

[Official reference](https://frontend.design-system.service.gov.uk/sass-api-reference/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $govuk-breakpoints.mobile | 320px | Sass breakpoint key, not a mandatory extra layout. |
| $govuk-breakpoints.tablet | 641px | Default responsive type, spacing and grid boundary; the styles guide describes this as wider than 640px. |
| $govuk-breakpoints.desktop | 769px | Additional named breakpoint. |
| $govuk-focus-width | 3px | Focus outline width; pair it with the documented focus treatment. |

## GOV.UK Design System Version and Identity

### A v6 reference with an independent identity

This reference uses the v6 documentation, including its larger small-screen type and revised functional colours. An older screenshot may therefore show different values. The table above records the current documented defaults rather than silently mixing releases.

The live study is a fictional community event enquiry. It uses no crown, GOV.UK wordmark, Transport font or real submission endpoint. Its task content and local validation rules are application choices; the component anatomy is grounded in the linked official examples.

[Supporting specification](https://frontend.design-system.service.gov.uk/using-govuk-frontend-without-govuk-branding/)

### Choose the correct font route

For an eligible service.gov.uk service, GDS Transport belongs to the official implementation. Public services on other domains must use another typeface. This independent study follows the recommended Helvetica Neue, Helvetica, Arial, sans-serif alternative; changing the font does not require discarding the system’s hierarchy.

[Supporting specification](https://design-system.service.gov.uk/styles/typeface/)

## GOV.UK Design System Type and Reading Rhythm

### Use the complete size and line-height pair

Use govuk-heading-l for the enquiry question and govuk-body for supporting copy. At small widths the heading is 27/30px; at larger widths it becomes 36/40px. Body copy remains 19/25px in v6. A small-screen body size of 16px would reproduce older behaviour rather than this reference.

The scale table includes both sizes because a screenshot of one viewport cannot establish the responsive rule. The production CSS uses relative units. A class such as govuk-heading-l controls appearance without determining whether the semantic element should be h1 or h2.

```scss
.app-question-note {
  @include govuk-font($size: 19);
}
// Size and line-height only, without changing the font family:
.app-existing-font { @include govuk-font-size($size: 19); }
```

[Code reference](https://design-system.service.gov.uk/styles/type-scale/)

[Supporting specification](https://design-system.service.gov.uk/styles/type-scale/)

## GOV.UK Design System Spacing and Page Width

### Responsive units are not fixed pixels

Unit 6 is useful between question groups: it gives 20px on a narrow screen and 30px above the tablet boundary. The static helper govuk-spacing(6) returns 30px at every width. Choosing the helper therefore changes behaviour, even when both versions look identical on desktop.

```scss
.app-question-group {
  @include govuk-responsive-margin(6, "bottom");
}
.app-fixed-inset { padding: govuk-spacing(3); }
```

[Code reference](https://design-system.service.gov.uk/styles/spacing/)

[Supporting specification](https://design-system.service.gov.uk/styles/spacing/)

### Put a reading column inside the container

The standard width container has a 1020px maximum. Inside it, a two-thirds grid column constrains the question flow while allowing the outer page structure to remain aligned. The small-screen presentation stacks naturally. Our preview keeps this reading hierarchy instead of spreading each field across a dashboard card.

```html
<div class="govuk-width-container">
  <main class="govuk-main-wrapper" id="main-content">
    <div class="govuk-grid-row">
      <div class="govuk-grid-column-two-thirds">
        <h1 class="govuk-heading-l">Tell us about the event</h1>
        <!-- Question form -->
      </div>
    </div>
  </main>
</div>
```

[Code reference](https://design-system.service.gov.uk/styles/layout/)

[Supporting specification](https://design-system.service.gov.uk/styles/layout/)

## GOV.UK Design System Colour and Focus

### Use roles rather than matching old screenshots

The v6 functional link colour is #1a65a6 and its error colour is #ca3535. Use govuk-functional-colour("link") and govuk-functional-colour("error") in a real Sass build so an upgrade can carry the upstream palette. These functional roles are different from choosing a general red or blue illustration colour.

Focus yellow is reserved for focus. It should not become the default selection or promotional accent. The preview pairs yellow with dark text and a visible dark edge; an error remains identified through text and placement, not red alone.

```scss
.app-supporting-text { color: govuk-functional-colour("secondary-text"); }
.app-custom-error { color: govuk-functional-colour("error"); }
```

[Code reference](https://design-system.service.gov.uk/styles/colour/)

[Supporting specification](https://design-system.service.gov.uk/styles/colour/)

## GOV.UK Design System Question Components

### A field is a connected structure

The input example combines govuk-form-group, govuk-label, govuk-hint and govuk-input. The label targets the input ID; aria-describedby points to the hint. When invalid, add the error message ID as well as the error classes. A visual red border without that relationship is an incomplete reproduction.

This enquiry keeps an event name and contact email together. They are separate labelled values within one short task, not an instruction to place every field on its own page. The preview requires both only to demonstrate validation; it does not establish any real permit requirement.

- Persistent label: Event name.
- Persistent hint: Use the name shown on your event information.
- Recoverable error: Enter an event name.

[Supporting specification](https://design-system.service.gov.uk/components/text-input/)

### Native markup and application behaviour have different jobs

GOV.UK Frontend styles and enhances the components. It does not decide which email is acceptable for this service, save a draft, or receive an enquiry. In the preview, JavaScript validates the two fields and stores their values only in the current page. Reloading clears the study.

[Supporting specification](https://design-system.service.gov.uk/patterns/question-pages/)

## GOV.UK Design System Linked Error Recovery

### Make the summary a route to correction

After an invalid Continue action, show the error summary before the form and move focus to it. Each list link targets the corresponding answer. A single text field targets its input ID; a grouped choice should target the appropriate first control as described by the official guidance.

The native summary uses data-module="govuk-error-summary" for enhancement. The preview inserts the summary only when validation fails, then constructs ErrorSummary from the local 6.5.1 module. The library handles focus and linked navigation; the application supplies the messages, retains values and removes obsolete errors.

[Supporting specification](https://design-system.service.gov.uk/components/error-summary/)

### Try the actual recovery sequence

Continue with both fields blank. Follow the event-name error, enter a fictional title, then enter an invalid email. Continue again: only the remaining error should appear and the title should remain. Correct the address to reach review. This makes the state contract visible rather than displaying a permanent specimen error.

[Supporting specification](https://design-system.service.gov.uk/components/error-summary/)

## GOV.UK Design System Check Answers and Change

### Use a definition list, not a data table

The check-answers screen contains a govuk-summary-list. Each row has a dt key, dd value and dd actions region. A hidden label after Change identifies the particular answer. Long event names wrap in the value without concealing the edit route.

The change action restores the form and focuses the selected field. Continuing validates again and returns to the updated review. The return route is application code; the design system supplies the presentation structure.

[Supporting specification](https://design-system.service.gov.uk/components/summary-list/)

### End at the truthful boundary

This study ends at review because no service receives the data. A real check-answers page precedes the actual send action and must show the information that will be sent. An application with declarations or a backend confirmation needs additional service logic; a green panel cannot create that result.

1. Complete the two fictional answers and continue to review.
2. Choose Change event name; edit only that answer.
3. Continue and verify both the corrected title and preserved email.

[Supporting specification](https://design-system.service.gov.uk/patterns/check-answers/)

## GOV.UK Design System Frontend Integration

### Compile the unbranded Sass entry

The setup below uses govuk-frontend@6 and Dart Sass with the Node package importer. It compiles the documented unbranded font configuration and copies the browser JavaScript distribution. Commit the resolved lockfile so a real project records its exact release.

The sample does not load Transport or use government image assets. An eligible branded service must additionally serve the official assets through the documented asset path. Applications using another build tool can keep the same Sass module and initAll entry while adapting their bundling.

[Supporting specification](https://frontend.design-system.service.gov.uk/include-css/)

### Initialise after the component markup exists

For a static page, load the copied module and call initAll. In a client-rendered application, initialise a newly inserted region with initAll({ scope: element }) after that region exists. Do not initialise a hidden error specimen on startup and mistake it for a live validation flow.

The standalone preview runs the official CSS and JavaScript copied locally at version 6.5.1. A narrowly scoped font override replaces Transport throughout the study. The form validation and review screen are application code, while Button and ErrorSummary enhancement come from the library. The separate Sass build recipe documents the preferred configurable setup; that compilation was not executed here.

[Supporting specification](https://frontend.design-system.service.gov.uk/import-javascript/)

## Component Examples

### Text input: label, hint and inline error

The example state adds the error modifier to the group and input. The input description joins the persistent hint and the current error by ID.

```html
<div class="govuk-form-group govuk-form-group--error">
  <label class="govuk-label" for="event-name">Event name</label>
  <div id="event-name-hint" class="govuk-hint">Use the name shown on your event information.</div>
  <p id="event-name-error" class="govuk-error-message">
    <span class="govuk-visually-hidden">Error:</span> Enter an event name
  </p>
  <input class="govuk-input govuk-input--error" id="event-name"
    name="eventName" type="text"
    aria-describedby="event-name-hint event-name-error">
</div>
```

[Code reference](https://design-system.service.gov.uk/components/text-input/)

- Remove the error paragraph, error modifiers and error ID from aria-describedby in the valid state.
- Keep the actual value when validation fails; use escaped server output or DOM text/value assignment.

### Error summary: navigation to the answer

Place the summary before the question content. Its message matches the inline error and its link targets the input, not an unrelated wrapper.

```html
<div class="govuk-error-summary" data-module="govuk-error-summary">
  <div role="alert">
    <h2 class="govuk-error-summary__title">There is a problem</h2>
    <div class="govuk-error-summary__body">
      <ul class="govuk-list govuk-error-summary__list">
        <li><a href="#event-name">Enter an event name</a></li>
      </ul>
    </div>
  </div>
</div>
```

[Code reference](https://design-system.service.gov.uk/components/error-summary/)

- Frontend initialisation supplies the summary focus behaviour in a native implementation.
- The live study constructs a new ErrorSummary after inserting each failed-validation summary; application validation remains separate.

### Check answers: a semantic summary list

A definition list pairs the answer label with its value and a targeted edit destination. The hidden suffix makes repeated Change links distinguishable.

```html
<dl class="govuk-summary-list">
  <div class="govuk-summary-list__row">
    <dt class="govuk-summary-list__key">Event name</dt>
    <dd class="govuk-summary-list__value">Riverside community picnic</dd>
    <dd class="govuk-summary-list__actions">
      <a class="govuk-link" href="/event-details?returnTo=check-answers">
        Change<span class="govuk-visually-hidden"> event name</span>
      </a>
    </dd>
  </div>
</dl>
```

[Code reference](https://design-system.service.gov.uk/components/summary-list/)

- The returnTo parameter is an application convention used here, not a Frontend API.
- Return from editing to review, keeping all unrelated answers intact.

### Complete standalone specimen

The full document includes its layout, controls and initialization. Extract the linked example archive to obtain the exact relative vendor assets, then serve it over HTTP.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Event enquiry — OpenDesign component study</title><link rel="stylesheet" href="vendor/govuk-6.5.1/govuk-frontend.min.css"><style>
body{margin:0;background:#fff}body,body *,body *::before,body *::after{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif!important}[hidden]{display:none!important}.study-header{border-bottom:1px solid #cecece;padding:15px 0;background:#f3f3f3}.study-header p{margin:0}.study-header strong{display:block;margin-bottom:5px}.study-note{border-top:1px solid #cecece;padding-top:20px;margin-top:30px}.study-actions{display:flex;gap:20px;align-items:baseline;flex-wrap:wrap}.govuk-summary-list__value{overflow-wrap:anywhere}main:focus,h1:focus{outline:none}.govuk-width-container{max-width:1020px}.study-tools{margin:20px 0}.study-tools button{font:inherit;background:none;border:0;padding:0;color:#1a65a6;text-decoration:underline;cursor:pointer}.study-tools button:focus{outline:3px solid #ffdd00;background:#ffdd00;color:#0b0c0c}.study-header .govuk-body-s{max-width:75ch}
</style></head><body class="govuk-template__body"><script>document.body.className+=' js-enabled'+('noModule' in HTMLScriptElement.prototype?' govuk-frontend-supported':'');</script>
<a class="govuk-skip-link" href="#main-content">Skip to main content</a>
<header class="study-header"><div class="govuk-width-container"><p class="govuk-body-s"><strong>OpenDesign · Component study</strong>GOV.UK Frontend 6.5.1 with an alternative font. Fictional enquiry; no information is sent.</p></div></header>
<main class="govuk-width-container govuk-main-wrapper" id="main-content"><div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">
<section id="questions"><div id="errors"></div><h1 class="govuk-heading-l" id="question-title" tabindex="-1">Tell us about the event</h1><p class="govuk-body">Enter fictional details to try linked validation and the check-answers pattern.</p>
<form id="event-form" novalidate>
<div class="govuk-form-group" id="name-group"><label class="govuk-label" for="event-name">Event name</label><div class="govuk-hint" id="event-name-hint">Use the name shown on your event information.</div><input class="govuk-input" id="event-name" name="eventName" type="text" aria-describedby="event-name-hint"></div>
<div class="govuk-form-group" id="email-group"><label class="govuk-label" for="contact-email">Contact email</label><div class="govuk-hint" id="contact-email-hint">For example, organiser@example.com. Use a fictional address.</div><input class="govuk-input" id="contact-email" name="email" type="email" spellcheck="false" autocomplete="email" aria-describedby="contact-email-hint"></div>
<button class="govuk-button" data-module="govuk-button" type="submit">Continue to check answers</button>
</form><div class="study-tools govuk-body-s"><button id="fill" type="button">Use example details</button></div></section>
<section id="review" hidden><a class="govuk-back-link" href="#questions" id="back">Back</a><h1 class="govuk-heading-l govuk-!-margin-top-6" tabindex="-1" id="review-title">Check your answers</h1><dl class="govuk-summary-list"><div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">Event name</dt><dd class="govuk-summary-list__value" id="review-name"></dd><dd class="govuk-summary-list__actions"><a class="govuk-link change" href="#event-name" data-field="event-name">Change<span class="govuk-visually-hidden"> event name</span></a></dd></div><div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">Contact email</dt><dd class="govuk-summary-list__value" id="review-email"></dd><dd class="govuk-summary-list__actions"><a class="govuk-link change" href="#contact-email" data-field="contact-email">Change<span class="govuk-visually-hidden"> contact email</span></a></dd></div></dl><h2 class="govuk-heading-m">This example ends at review</h2><p class="govuk-body">Nothing has been submitted. Your answers stay in this page until it is reset or reloaded.</p><button class="govuk-button govuk-button--secondary" data-module="govuk-button" id="reset" type="button">Start again</button></section>
<aside class="study-note"><h2 class="govuk-heading-s">Try the recovery path</h2><ol class="govuk-list govuk-list--number"><li>Continue with empty fields to show the error summary.</li><li>Follow an error link, enter a title and an invalid email.</li><li>Correct the email, then change an answer from review.</li></ol><p class="govuk-body-s">Native component CSS and ErrorSummary behaviour. Local application logic only. No government logo, Transport font, external request or stored account.</p><p class="govuk-body-s"><a class="govuk-link" href="https://design-system.service.gov.uk/components/error-summary/" target="_blank" rel="noreferrer">Official error summary reference</a> · <a class="govuk-link" href="vendor/govuk-6.5.1/LICENSE.txt">Frontend licence</a></p></aside>
</div></div></main><script type="module">
import {initAll, ErrorSummary} from './vendor/govuk-6.5.1/govuk-frontend.min.js';
initAll();
const q=document.querySelector('#questions'),r=document.querySelector('#review'),form=document.querySelector('#event-form'),holder=document.querySelector('#errors');
const fields=[{id:'event-name',group:'name-group',empty:'Enter an event name'},{id:'contact-email',group:'email-group',empty:'Enter a contact email',invalid:'Enter an email address in the correct format, like name@example.com'}];
function clearErrors(){holder.replaceChildren();for(const f of fields){document.getElementById(f.group).classList.remove('govuk-form-group--error');const input=document.getElementById(f.id);input.classList.remove('govuk-input--error');input.removeAttribute('aria-invalid');input.setAttribute('aria-describedby',f.id+'-hint');document.getElementById(f.id+'-error')?.remove();}document.title='Event enquiry — OpenDesign component study';}
function edit(id='event-name'){r.hidden=true;q.hidden=false;document.getElementById(id).focus();}
form.addEventListener('submit',event=>{event.preventDefault();clearErrors();const errors=[];for(const f of fields){const input=document.getElementById(f.id);const value=input.value.trim();const message=!value?f.empty:(f.id==='contact-email'&&(!input.validity.valid||!value.includes('@'))?f.invalid:null);if(message){errors.push({id:f.id,message});document.getElementById(f.group).classList.add('govuk-form-group--error');input.classList.add('govuk-input--error');input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',f.id+'-hint '+f.id+'-error');const p=document.createElement('p');p.id=f.id+'-error';p.className='govuk-error-message';const hidden=document.createElement('span');hidden.className='govuk-visually-hidden';hidden.textContent='Error: ';p.append(hidden,document.createTextNode(message));input.before(p);}}
if(errors.length){const summary=document.createElement('div');summary.className='govuk-error-summary';summary.dataset.module='govuk-error-summary';summary.innerHTML='<div role="alert"><h2 class="govuk-error-summary__title">There is a problem</h2><div class="govuk-error-summary__body"><ul class="govuk-list govuk-error-summary__list"></ul></div></div>';for(const err of errors){const li=document.createElement('li'),a=document.createElement('a');a.href='#'+err.id;a.textContent=err.message;li.append(a);summary.querySelector('ul').append(li);}holder.append(summary);new ErrorSummary(summary);document.title='Error: Event enquiry — OpenDesign component study';return;}
document.getElementById('review-name').textContent=document.getElementById('event-name').value;document.getElementById('review-email').textContent=document.getElementById('contact-email').value;q.hidden=true;r.hidden=false;document.getElementById('review-title').focus();document.title='Check your answers — OpenDesign component study';});
document.querySelectorAll('.change').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();edit(a.dataset.field)}));document.getElementById('back').addEventListener('click',e=>{e.preventDefault();edit()});document.getElementById('fill').addEventListener('click',()=>{clearErrors();document.getElementById('event-name').value='Riverside community picnic';document.getElementById('contact-email').value='organiser@example.com';document.getElementById('event-name').focus()});document.getElementById('reset').addEventListener('click',()=>{form.reset();clearErrors();edit();document.getElementById('question-title').focus()});
</script></body></html>

```

[Code reference](https://design-system.service.gov.uk/components/error-summary/)

- Download the complete example from Sources. Its README gives the exact local launch command.
- Keep vendor paths relative to this document; the archive includes the complete assets used by this preview.

## Implementation Starting Point

Separate the shell commands, app.scss contents and HTML fragments into their indicated locations. The preview runs locally copied official 6.5.1 assets with a font override; this Sass build recipe is documented but has not been compiled in this workspace. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/gov-uk.html. Do not open module-based examples through file://.

```sh / scss / html
# Run in a project directory
npm install govuk-frontend@6.5.1
npm install --save-dev sass
mkdir -p public/assets

# Save the following as app.scss
@use "pkg:govuk-frontend" as * with (
  $govuk-font-family: ("Helvetica Neue", Helvetica, Arial, sans-serif)
);

# Compile, then copy the browser module
npx sass --pkg-importer=node app.scss public/assets/app.css
cp node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js public/assets/

<!-- In the HTML head -->
<link rel="stylesheet" href="/assets/app.css">
<!-- At the start of body -->
<script>document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');</script>
<!-- After the question / summary markup -->
<script type="module">
  import { initAll } from '/assets/govuk-frontend.min.js';
  initAll();
</script>
```

## Agent Prompt

Implement the two-field event enquiry using GOV.UK Frontend v6 and the unbranded Helvetica font configuration in this guide. Use the actual form-group/input/error-summary and summary-list structures, linked inline errors, retained answers, targeted Change links and review-only completion. Apply the documented responsive type and spacing through Frontend classes. Keep the real project identity and do not create an official submission or invented backend result. Verify blank, invalid-email, corrected, review and change-answer states.

## Sources

- [v6 type scale](https://design-system.service.gov.uk/styles/type-scale/) — Small and large screen size/line-height pairs.
- [Responsive spacing](https://design-system.service.gov.uk/styles/spacing/) — Static and responsive units and Sass helpers.
- [Functional colours](https://design-system.service.gov.uk/styles/colour/) — Current roles and Sass accessors.
- [Layout](https://design-system.service.gov.uk/styles/layout/) — Container and grid composition.
- [Text input](https://design-system.service.gov.uk/components/text-input/) — Label, hint and error structure.
- [Error summary](https://design-system.service.gov.uk/components/error-summary/) — Linked correction and focus behaviour.
- [Summary list](https://design-system.service.gov.uk/components/summary-list/) — Keys, values and contextual change actions.
- [Without GOV.UK branding](https://frontend.design-system.service.gov.uk/using-govuk-frontend-without-govuk-branding/) — Font, identity and Sass configuration.
- [Include CSS](https://frontend.design-system.service.gov.uk/include-css/) — Dart Sass and package integration.
- [Import JavaScript](https://frontend.design-system.service.gov.uk/import-javascript/) — Browser modules and initAll.
- [Download complete working example](/assets/demos/gov-uk-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
