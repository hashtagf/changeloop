# Alaska Airlines Auro Design System — OpenDesign Application Guide

Explore Auro’s Alaska theme through real semantic color and type tokens, class-based typography and the native flight component. Two original flight records demonstrate local filtering and selection without representing airline inventory or booking.

Independent OpenDesign reference. All flight numbers, dates and times are fictional; no airline schedule, fare, availability or booking is represented. Application spacing is not claimed as an official token scale.

## Source Reference

- **Theme attribute:** aag-theme-as ([source](https://github.com/AlaskaAirlines/AuroDesignTokens))
- **Token package:** @aurodesignsystem/design-tokens ([source](https://github.com/AlaskaAirlines/AuroDesignTokens))
- **Flight package:** @aurodesignsystem/auro-flight ([source](https://github.com/AlaskaAirlines/auro-flight))
- **Body family:** AS Circular ([source](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css))
- **Accent family:** Good OT ([source](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css))
- **Default reading color:** #2a2a2a ([source](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css))


## Design Reference

Current public Alaska theme CSS and Auro component documentation. Spacing and radius in the original specimen are explicitly application choices because a complete current primitive scale was not verified. Legacy Auro Classic values are not mixed into the Alaska reference.

### Alaska semantic roles

[Official reference](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ds-basic-color-brand-primary | #01426a | Primary brand role. |
| --ds-basic-color-brand-primary-bold | #00274a | Strong brand role. |
| --ds-basic-color-brand-primary-muted | #ebf3f9 | Muted brand surface. |
| --ds-basic-color-brand-secondary | #5de3f7 | Secondary accent. |
| --ds-basic-color-brand-tertiary | #a3cd6a | Tertiary accent. |
| --ds-basic-color-texticon-default | #2a2a2a | Reading text. |
| --ds-basic-color-texticon-muted | #676767 | Supporting text. |
| --ds-basic-color-border-default | #959595 | Default boundary. |
| --ds-basic-color-border-subtle | #dddddd | Subtle separation. |
| --ds-basic-color-status-success | #447a1f | Success role. |
| --ds-basic-color-status-error | #e31f26 | Error role. |

### Action states

[Official reference](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ds-advanced-color-button-primary-background | #01426a | Primary action fill. |
| --ds-advanced-color-button-primary-background-hover | #00274a | Pointer hover fill. |
| --ds-advanced-color-button-primary-background-disabled | #acc9e2 | Disabled fill. |
| --ds-advanced-color-button-primary-text | #ffffff | Primary text. |
| --ds-advanced-color-button-secondary-background | #ffffff | Secondary fill. |
| --ds-advanced-color-button-secondary-border | #01426a | Secondary boundary. |
| --ds-advanced-color-state-focused | #01426a | Focus role. |

### Alaska type roles

[Official reference](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ds-basic-type-family-body | AS Circular | Body family. |
| --ds-basic-type-family-heading | AS Circular | Heading family. |
| --ds-basic-type-family-accent | Good OT | Accent family. |
| --ds-basic-type-line-height-body | 1.625rem | Body line-height role. |
| --ds-basic-type-line-height-body2 | 1.5rem | Second body role. |
| --ds-basic-type-line-height-body3 | 1.25rem | Third body role. |
| --ds-basic-type-line-height-heading | 1.3 | Heading line-height ratio. |
| --ds-basic-type-weight-body | 450 | Body weight. |
| --ds-basic-type-weight-heading | 300 | Heading weight. |
| --ds-basic-type-letter-spacing-accent | 0.05em | Accent tracking. |

### Theme selection

[Official reference](https://github.com/AlaskaAirlines/AuroDesignTokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Alaska | data-aag-theme="aag-theme-as" | Current Alaska theme. |
| Alaska Classic | aag-theme-asc | Migration theme only. |
| Hawaiian | aag-theme-ha | Separate brand theme. |
| Atmos | aag-theme-atm | Separate brand theme. |
| Auro Classic | Deprecated legacy theme | Backward compatibility only. |

### Flight composition

[Official reference](https://github.com/AlaskaAirlines/auro-flight)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| flights | JSON array of flight labels | Example ["DEMO 01"]. |
| duration | Minutes | Original sample duration 150. |
| departureTime / arrivalTime | ISO date-time with offset | Do not infer time zone from station code. |
| departureStation / arrivalStation | Station codes | Example SEA and LAX. |
| auro-flightline | Child custom element | Connects departure and arrival presentation. |
| AuroFlight.register(name) | Custom-name registration | Avoid collisions for multiple versions. |

## Alaska Airlines Auro Design System Choose Alaska explicitly before composing the page

### Current and migration themes are not interchangeable

Auro supports Alaska, Hawaiian and Atmos as distinct themes. Alaska Classic retains older visual values behind newer names for migration; Auro Classic is deprecated. The supplied entry imports the Alaska CSS file and applies the aag-theme-as attribute.

A nested data-aag-theme value can change a subsection’s theme. That capability is useful for shared platforms, but it does not mean an Alaska-colored screen should silently borrow Hawaiian typography or legacy values. The example uses one coherent theme throughout.

[Supporting specification](https://github.com/AlaskaAirlines/AuroDesignTokens)

## Alaska Airlines Auro Design System Brand emphasis is different from reading text

### Use the semantic foreground role

The current Alaska token source uses #2a2a2a for default text and #676767 for muted text. The brand-primary role is #01426a, with #00274a as the stronger counterpart. These are different responsibilities, even when a headline and a button share the same area.

The specimen uses dark neutral type for flight facts and blue for interactive emphasis. Mint and cyan accents appear in the original landscape illustration, not as an undocumented status signal. A selected flight is identified by text and button state as well as its boundary.

[Supporting specification](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css)

## Alaska Airlines Auro Design System Apply the supported typography classes

### Four groups express purpose

Auro’s current typography guide divides styles into body, heading, display and accent. Heading is for semantic headings, while display is for visually prominent text that is not a heading in the document hierarchy. The guide recommends classes such as body-default and body-lg instead of rebuilding all the font rules per element.

The Alaska source names AS Circular for body and headings and Good OT for accent text. It also supplies distinct weight and line-height roles. The offline preview uses the documented fallback family rather than pretending those fonts are available locally.

[Supporting specification](https://auro.alaskaair.com/typography/overview)

## Alaska Airlines Auro Design System The flight component represents a structured itinerary

### Pass time information without discarding its offset

auro-flight combines departure, arrival and sector information with auro-flightline. Its basic example accepts a flight-label array, a duration in minutes, two station codes and two ISO date-times. The supplied code preserves explicit offsets rather than passing an ambiguous local clock string.

The two original sample records use the same departure and arrival zones, so their 150-minute durations agree with their times. They are not real services. A production connection itinerary also needs the documented sector representation; a flat label list alone should not be used to imply a verified connection.

[Supporting specification](https://github.com/AlaskaAirlines/auro-flight)

## Alaska Airlines Auro Design System Keep application choice outside display data

### A visible result and a selected result are different states

The native example uses auro-flight to display each record and an ordinary button for local selection. This avoids inventing a selection API on the display component. The selected identifier is owned by the application and reflected by aria-pressed.

Changing the departure-period filter clears the selection and message. Without that step, the interface could claim that a hidden option remains selected. The preview makes the outcome explicit: a sample was chosen only for this page, and no booking was made.

1. Filter the original records by departure period.
2. Render the remaining flight facts without changing their values.
3. Select a visible sample by its stable identifier.
4. Clear the choice when the filter changes.

[Supporting specification](https://github.com/AlaskaAirlines/auro-flight)

## Alaska Airlines Auro Design System Load typography foundations alongside component code

### Tokens, WCSS and elements solve different problems

Design tokens supply values. Web Core Style Sheets supply foundational styles and typography classes. The flight package registers the custom element. Installing only one of these concerns is not equivalent to a complete branded page.

WCSS is an à la carte foundation rather than a single source file for every possible style. Its v12 Sass path moved from @import to @use and @forward. The example chooses the documented prebuilt Alaska stylesheet instead of mixing old Sass instructions with the current package structure.

[Supporting specification](https://github.com/AlaskaAirlines/WebCoreStyleSheets)

## Alaska Airlines Auro Design System Use real labels for controls and status

### Do not make color carry the entire result

The filter has a visible label, and every selection action names its outcome. A status region announces the selected sample in text. Departure and arrival remain understandable without the decorative line or landscape.

For an extension that collects traveler details, Auro Input supports label and helpText slots, validates on blur by default, and can change that timing with validateOnInput or noValidate. Its clear behavior resets value to undefined. Those contracts should be respected rather than assuming every form component returns the same empty value.

- Keep time and station information as readable text.
- Label the filter independently from the result count.
- Use the status region for a real local choice.
- Do not display a pending spinner for an immediate state update.

[Supporting specification](https://auro.alaskaair.com/components/auro/input)

## Alaska Airlines Auro Design System Register alternate names only when versions really coexist

### Separate a component class from global registration

The flight package’s standard import registers auro-flight automatically. Its /class entry exposes AuroFlight for explicit register(name) calls when multiple versions need distinct custom-element names on the same document. A custom name must include a hyphen.

This is a conflict-management feature, not a requirement for a normal single-version page. Keep the default name for the simple example, pin dependencies through a lockfile and review migrations before replacing a major version. Original preview gaps and radii remain application decisions; this page does not relabel them as verified Auro primitives.

[Supporting specification](https://github.com/AlaskaAirlines/auro-flight)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Original offline HTML interpretation of Alaska theme roles and flight-information hierarchy. No native Auro runtime, brand fonts, live inventory or booking.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Original flight choices</title><style>*{box-sizing:border-box}body{margin:0;color:#2a2a2a;background:#fff;font:16px/1.625 system-ui,-apple-system,sans-serif}button,select{font:inherit}button{cursor:pointer}button:focus-visible,select:focus-visible{outline:3px solid #01426a;outline-offset:4px}header{padding:20px 32px;display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #ddd}header b{color:#01426a;letter-spacing:2px;font-size:14px}header small{color:#676767}.hero{background:#ebf3f9;position:relative;overflow:hidden}.hero-inner{max-width:1100px;margin:auto;padding:36px 32px 48px;position:relative;z-index:1}.hero h1{font-size:42px;line-height:1.3;font-weight:300;margin:0 0 12px}.hero p{max-width:480px;margin:0;color:#676767}.mountain{position:absolute;right:-20px;bottom:-25px;width:43%;height:180px;background:#cfe0ef;clip-path:polygon(0 100%,35% 10%,55% 55%,75% 0,100% 100%)}.mountain:after{content:'';position:absolute;inset:50px -15px 0 45px;background:#a3cd6a;clip-path:polygon(0 100%,45% 10%,100% 100%)}main{max-width:1100px;margin:auto;padding:32px}.toolbar{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}.toolbar label{display:block;font-size:14px;margin-bottom:8px}select{padding:10px 40px 10px 12px;border:1px solid #959595;border-radius:8px;background:#fff;color:#2a2a2a}#count{font-size:14px;color:#676767;margin:0}.flight{border:1px solid #ddd;border-radius:12px;padding:24px;margin-bottom:16px}.flight.selected{border:2px solid #01426a;padding:23px;background:#f7fbfd}.flight-head{display:flex;justify-content:space-between;gap:16px;font-size:14px;color:#676767;margin-bottom:24px}.sample-tag{background:#ebf3f9;color:#01426a;padding:0 8px;border-radius:4px}.flight-body{display:grid;grid-template-columns:1fr 160px 1fr auto;gap:24px;align-items:center}.station b{display:block;font-size:28px;line-height:1.3;font-weight:400}.station span{display:block;font-size:14px;color:#676767}.line{text-align:center;color:#676767;font-size:12px}.line i{display:block;height:1px;background:#00274a;position:relative;margin:12px 0}.line i:before,.line i:after{content:'';width:7px;height:7px;background:#fff;border:1px solid #00274a;border-radius:50%;position:absolute;top:-3px;left:0}.line i:after{left:auto;right:0}.flight button{border:0;border-radius:8px;background:#01426a;color:#fff;padding:12px 20px;white-space:nowrap}.flight button:hover{background:#00274a}.selected button{background:#fff;border:1px solid #01426a;color:#01426a}.summary{background:#ebf3f9;border-left:4px solid #01426a;padding:16px 24px;margin-top:24px}.summary:empty{display:none}footer{font-size:12px;line-height:1.5;color:#676767;margin-top:24px}@media(max-width:700px){header{padding:16px;gap:16px}header small{max-width:140px}.hero-inner{padding:28px 16px 40px}.hero h1{font-size:32px}.hero p{max-width:80%}.mountain{opacity:.45;width:70%}main{padding:24px 16px}.toolbar{gap:16px}.flight{padding:20px}.flight.selected{padding:19px}.flight-body{grid-template-columns:1fr 80px 1fr;gap:12px}.flight button{grid-column:1/-1;width:100%;margin-top:8px}.station b{font-size:22px}.flight-head{font-size:12px}.station span{font-size:12px}select{max-width:185px;padding-right:24px}}
</style><header><b>JOURNEY EXPLORER</b><small>Independent Auro interpretation</small></header><div class="hero"><div class="mountain" aria-hidden="true"></div><div class="hero-inner"><h1>A little closer to your next adventure.</h1><p>Explore two original flight examples and keep a choice for this page session.</p></div></div><main><div class="toolbar"><div><label for="period">Departure period</label><select id="period"><option value="all">All times</option><option value="morning">Morning</option><option value="evening">Evening</option></select></div><p id="count" aria-live="polite"></p></div><section id="results" aria-label="Sample flights"></section><p id="selection" class="summary" role="status"></p><footer>Fictional flights for interface exploration. No real schedule, fare, seat availability or booking. Times use the same sample UTC−07:00 offset. Original landscape artwork.</footer></main><script>const data=[{id:'am',name:'Morning sample',number:'DEMO 01',dep:'08:00',arr:'10:30',period:'morning'},{id:'pm',name:'Evening sample',number:'DEMO 02',dep:'17:00',arr:'19:30',period:'evening'}];let selected='';function render(){const period=document.querySelector('#period').value,visible=data.filter(x=>period==='all'||x.period===period);document.querySelector('#count').textContent=`${visible.length} sample ${visible.length===1?'flight':'flights'}`;document.querySelector('#results').innerHTML=visible.map(x=>`<article class="flight ${selected===x.id?'selected':''}"><div class="flight-head"><span>${x.name} · ${x.number}</span><span class="sample-tag">Original sample</span></div><div class="flight-body"><div class="station"><b>${x.dep}</b><span>SEA · Seattle</span></div><div class="line">2h 30m<i></i>Nonstop study</div><div class="station"><b>${x.arr}</b><span>LAX · Los Angeles</span></div><button type="button" data-id="${x.id}" aria-pressed="${selected===x.id}">${selected===x.id?'Selected sample':'Select this sample'}</button></div></article>`).join('');document.querySelectorAll('[data-id]').forEach(button=>button.onclick=()=>{selected=button.dataset.id;const x=data.find(x=>x.id===selected);document.querySelector('#selection').textContent=`${x.name} selected: ${x.dep} SEA → ${x.arr} LAX. No booking made.`;render();document.querySelector(`[data-id="${selected}"]`).focus()})}document.querySelector('#period').onchange=()=>{selected='';document.querySelector('#selection').textContent='';render()};render();</script></html>

```

[Code reference](https://github.com/AlaskaAirlines/auro-flight)

- The flights are fictional fixed records. The native Auro example supplies auro-flight properties and Alaska theme assets; this HTML document does not query availability.

### Native flight display with original application selection

Each auro-flight receives offset-aware dates, station codes and a JSON flight-label array. A native select and button add local filtering and choice state outside the display component.

```javascript
// src/main.js in a Vite vanilla project
// npm install @aurodesignsystem/auro-flight @aurodesignsystem/design-tokens @aurodesignsystem/webcorestylesheets
import '@aurodesignsystem/design-tokens/dist/themes/alaska/CSSCustomProperties--alaska.css';
import '@aurodesignsystem/webcorestylesheets/dist/bundled/themes/alaska.global.min.css';
import '@aurodesignsystem/auro-flight';
import './style.css';
document.documentElement.setAttribute('data-aag-theme','aag-theme-as');
const flights=[
 {id:'sample-am',label:'Morning sample',number:'DEMO 01',departure:'2030-06-15T08:00:00-07:00',arrival:'2030-06-15T10:30:00-07:00',period:'morning'},
 {id:'sample-pm',label:'Evening sample',number:'DEMO 02',departure:'2030-06-15T17:00:00-07:00',arrival:'2030-06-15T19:30:00-07:00',period:'evening'}
];
let selected='';
document.querySelector('#app').innerHTML=`<main><h1>Explore sample flights</h1>
<p class="body-default">Original records, not a live schedule or booking service.</p>
<label for="period">Departure period</label><select id="period"><option value="all">All times</option><option value="morning">Morning</option><option value="evening">Evening</option></select>
<div id="results"></div><p id="selection" role="status"></p></main>`;
function render(){const period=document.querySelector('#period').value;const target=document.querySelector('#results');target.replaceChildren();
 flights.filter(f=>period==='all'||f.period===period).forEach(f=>{
 const article=document.createElement('article'), title=document.createElement('h2');title.textContent=f.label;
 const component=document.createElement('auro-flight');component.setAttribute('flights',JSON.stringify([f.number]));component.setAttribute('duration','150');component.setAttribute('departureTime',f.departure);component.setAttribute('arrivalTime',f.arrival);component.setAttribute('departureStation','SEA');component.setAttribute('arrivalStation','LAX');component.append(document.createElement('auro-flightline'));
 const button=document.createElement('button');button.type='button';button.textContent=selected===f.id?'Selected sample':'Select this sample';button.setAttribute('aria-pressed',String(selected===f.id));button.onclick=()=>{selected=f.id;document.querySelector('#selection').textContent=f.label+' selected for this page only. No booking made.';render();};
 article.append(title,component,button);target.append(article);
 });
}
document.querySelector('#period').onchange=()=>{selected='';document.querySelector('#selection').textContent='';render();};render();

/* src/style.css — application layout, not official size tokens */
main{max-width:64rem;margin:auto;padding:24px}
article{padding:24px;margin-block:16px;border:1px solid var(--ds-basic-color-border-subtle);border-radius:12px}
button{font:inherit;background:var(--ds-advanced-color-button-primary-background);color:var(--ds-advanced-color-button-primary-text);padding:12px 24px;border:0;border-radius:8px;margin-top:16px}
button:hover{background:var(--ds-advanced-color-button-primary-background-hover)}
button:focus-visible,select:focus-visible{outline:3px solid var(--ds-advanced-color-state-focused);outline-offset:4px}
select{font:inherit;padding:12px;margin:8px 0 16px}
```

[Code reference](https://github.com/AlaskaAirlines/auro-flight)

- The selection button is application logic, not an invented auro-flight event.
- Changing the period clears a previously selected record so hidden selections cannot mislead.
- Every flight number, date and time in the example is fictional.

## Implementation Starting Point

Complete application entry and CSS for an existing Vite vanilla project. Keep installed versions in the project lockfile. Native component compilation was not verified here; the embedded specimen uses independent offline HTML. It does not bundle AS Circular or Good OT.

```javascript
// src/main.js in a Vite vanilla project
// npm install @aurodesignsystem/auro-flight @aurodesignsystem/design-tokens @aurodesignsystem/webcorestylesheets
import '@aurodesignsystem/design-tokens/dist/themes/alaska/CSSCustomProperties--alaska.css';
import '@aurodesignsystem/webcorestylesheets/dist/bundled/themes/alaska.global.min.css';
import '@aurodesignsystem/auro-flight';
import './style.css';
document.documentElement.setAttribute('data-aag-theme','aag-theme-as');
const flights=[
 {id:'sample-am',label:'Morning sample',number:'DEMO 01',departure:'2030-06-15T08:00:00-07:00',arrival:'2030-06-15T10:30:00-07:00',period:'morning'},
 {id:'sample-pm',label:'Evening sample',number:'DEMO 02',departure:'2030-06-15T17:00:00-07:00',arrival:'2030-06-15T19:30:00-07:00',period:'evening'}
];
let selected='';
document.querySelector('#app').innerHTML=`<main><h1>Explore sample flights</h1>
<p class="body-default">Original records, not a live schedule or booking service.</p>
<label for="period">Departure period</label><select id="period"><option value="all">All times</option><option value="morning">Morning</option><option value="evening">Evening</option></select>
<div id="results"></div><p id="selection" role="status"></p></main>`;
function render(){const period=document.querySelector('#period').value;const target=document.querySelector('#results');target.replaceChildren();
 flights.filter(f=>period==='all'||f.period===period).forEach(f=>{
 const article=document.createElement('article'), title=document.createElement('h2');title.textContent=f.label;
 const component=document.createElement('auro-flight');component.setAttribute('flights',JSON.stringify([f.number]));component.setAttribute('duration','150');component.setAttribute('departureTime',f.departure);component.setAttribute('arrivalTime',f.arrival);component.setAttribute('departureStation','SEA');component.setAttribute('arrivalStation','LAX');component.append(document.createElement('auro-flightline'));
 const button=document.createElement('button');button.type='button';button.textContent=selected===f.id?'Selected sample':'Select this sample';button.setAttribute('aria-pressed',String(selected===f.id));button.onclick=()=>{selected=f.id;document.querySelector('#selection').textContent=f.label+' selected for this page only. No booking made.';render();};
 article.append(title,component,button);target.append(article);
 });
}
document.querySelector('#period').onchange=()=>{selected='';document.querySelector('#selection').textContent='';render();};render();

/* src/style.css — application layout, not official size tokens */
main{max-width:64rem;margin:auto;padding:24px}
article{padding:24px;margin-block:16px;border:1px solid var(--ds-basic-color-border-subtle);border-radius:12px}
button{font:inherit;background:var(--ds-advanced-color-button-primary-background);color:var(--ds-advanced-color-button-primary-text);padding:12px 24px;border:0;border-radius:8px;margin-top:16px}
button:hover{background:var(--ds-advanced-color-button-primary-background-hover)}
button:focus-visible,select:focus-visible{outline:3px solid var(--ds-advanced-color-state-focused);outline-offset:4px}
select{font:inherit;padding:12px;margin:8px 0 16px}
```

## Agent Prompt

Compose an Auro Alaska flight list with explicit aag-theme-as, Alaska token CSS, WCSS typography and native auro-flight fields. Keep ISO offsets and duration coherent. Add application-owned filtering and selection without inventing component events, clear hidden choices and label every record as sample data.

## Sources

- [Alaska theme source](https://raw.githubusercontent.com/AlaskaAirlines/AuroDesignTokens/master/dist/themes/alaska/CSSCustomProperties--alaska.css) — Exact current color and type roles.
- [Design token setup](https://github.com/AlaskaAirlines/AuroDesignTokens) — Theme files, attributes and migration themes.
- [Token API](https://auro.alaskaair.com/getting-started/developers/design-tokens/docs/api-reference) — Generated file formats and imports.
- [Typography overview](https://auro.alaskaair.com/typography/overview) — Class-based type groups.
- [Web Core Style Sheets](https://github.com/AlaskaAirlines/WebCoreStyleSheets) — Foundation styles and Sass migration.
- [Flight component](https://github.com/AlaskaAirlines/auro-flight) — Installation, attributes and registration.
- [Input behavior](https://auro.alaskaair.com/components/auro/input) — Labels, clearing and validation timing.
