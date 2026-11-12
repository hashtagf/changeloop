# Duet Design System — OpenDesign Application Guide

Study Duet’s LocalTapiola color and spacing scales through a date-range workflow, with ISO date values, explicit range validation, component focus methods and the separate open-source picker boundary.

Independent OpenDesign reference. Original planner; no policy, booking or quote is created. Main-system Duet and its separate open-source date picker have different contracts.

## Source Reference

- **Default primary:** #0077b3 ([source](https://www.duetds.com/tokens/))
- **Base type:** 16px ([source](https://www.duetds.com/typography/))
- **Default spacing:** 16px ([source](https://www.duetds.com/tokens/))
- **Button radius:** 20rem ([source](https://www.duetds.com/tokens/))
- **Date value format:** YYYY-MM-DD ([source](https://www.duetds.com/components/date-picker/))
- **Date focus method:** setFocus() ([source](https://www.duetds.com/components/date-picker/))


## Design Reference

Duet public documentation snapshot: main system components, LocalTapiola default tokens, and documented 10.7.0/CDN integration. This is not the separate @duetds/date-picker 1.x package. Some radius tokens remain marked In Review.

### Default and Turva roles

[Official reference](https://www.duetds.com/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --color-primary | #0077b3 | LocalTapiola action. |
| --color-primary-dark | #004b81 | Darker interactive state. |
| --color-primary-darker | #00619b | Link role. |
| --color-primary-light | #c6e1ee | Range tint. |
| --color-secondary | #082a4d | Body text. |
| --color-primary-turva | #e61740 | Turva action, separate theme. |
| --color-danger | #d61c52 | Validation. |
| --radius-default | 4px | Inputs and containers. |
| --radius-pill | 20rem | Buttons. |
| --radius-medium | 8px; In Review | Do not call production-ready. |

### Spacing tokens

[Official reference](https://www.duetds.com/tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --space-xxx-small | 2px | Tight. |
| --space-xx-small | 4px | Tight. |
| --space-x-small | 8px | Compact. |
| --space-small | 12px | Small. |
| --space-medium | 16px | Default. |
| --space-large | 20px | Between components. |
| --space-x-large | 28px | Larger gap. |
| --space-xx-large | 36px | Button horizontal padding. |
| --space-xxx-large | 48px | Section. |
| --size-layout-max-width | 1110px | Documented layout maximum. |

### Type scale

[Official reference](https://www.duetds.com/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $font-size-medium | 16px / 1rem | Body and H5. |
| $font-size-large | 20px / 1.25rem | H4. |
| $font-size-x-large | 24px / 1.5rem | H3. |
| $font-size-xx-large | 36px / 2.25rem | H2. |
| $font-size-xxx-large | 48px / 3rem | H1. |
| $font-size-xxxx-large | 72px / 4.5rem | H0. |

### Date Picker contract

[Official reference](https://www.duetds.com/components/date-picker/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| value / min / max | YYYY-MM-DD strings | Storage is ISO, not display text. |
| duetChange | detail.value and detail.valueAsDate | Selected date event. |
| validity | badInput / valueMissing / rangeOverflow / rangeUnderflow / customError | Inspect before accepting. |
| setFocus() | Promise<void> | Focus input; not host focus(). |
| show() / hide() | Promise<void> | Calendar and focus management. |
| language | Deprecated | Use html lang. |
| disallow-weekends | Boolean | Component-level exclusion. |

### Action properties

[Official reference](https://www.duetds.com/components/button/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| variation="primary" | Main action | One principal action per view. |
| submit | Boolean, default false | Explicit form submission opt-in. |
| url | Anchor destination | Navigation semantics. |
| expand | 100% container | Wide action. |
| theme | default / turva / inherited empty | Brand selection. |
| margin="none" | Remove automatic margin | Application controls spacing. |

## Duet Design System The main Duet system and open-source picker are separate

### Keep the package contract attached to the example

Duet serves LocalTapiola and Turva with themed components and foundations. The separately published @duetds/date-picker project is a narrower open-source distribution. Sharing a tag name does not make its properties, localization setup or CSS variables interchangeable with the current main design system.

This page’s integration code targets the main system. Its offline preview uses native date inputs and original styling based on the linked Duet tokens. It demonstrates range rules without claiming to run Duet’s calendar popup or its keyboard model.

[Supporting specification](https://www.duetds.com/using-components/)

## Duet Design System Brand blue and status red have distinct jobs

### Use a theme rather than swapping a single accent

The default LocalTapiola theme combines a blue action with dark blue body text. Turva has its own red action and secondary text role. Switching only the action color would omit the remaining theme relationships. The current table also marks older Turva tints deprecated; copying every historic palette entry would preserve obsolete guidance.

Our original travel-date specimen uses blue for the next action and red only when a chosen period needs correction. It is a scheduling demonstration, not an insurance recommendation, quote or purchase.

[Supporting specification](https://www.duetds.com/tokens/)

## Duet Design System A 16px body anchors the hierarchy

### The scale does not require a giant title everywhere

Duet’s table progresses through 16, 20, 24, 36, 48 and 72px at the larger levels. An embedded planning panel uses the 24px level so that its action and date labels remain prominent. The marketing-sized 72px level is not a default for a compact form.

LocalTapiola and Turva font packages are separate assets. The offline interpretation uses a system fallback; it does not bundle those brand font files. An authorized application should load the chosen family through the documented font path and then use its matching weight tokens.

[Supporting specification](https://www.duetds.com/typography/)

## Duet Design System Use the actual 20px and 28px steps

### Duet is not a generic eight-pixel scale

The scale includes 12, 20, 28 and 36px in addition to familiar powers of two. Those intermediate intervals matter when matching the system’s form rhythm. Use the 20px gap between the two fields in the wide layout and preserve each label with its field when stacking. The specimen’s breakpoint is an application choice.

Default control corners use 4px while buttons use the pill radius. Some newer container radius values in the token reference are explicitly In Review; this guide retains that status instead of presenting every listed token as approved.

[Supporting specification](https://www.duetds.com/tokens/)

## Duet Design System Store ISO values and describe the visible format

### Do not parse localized display strings as data

The component’s value and bounds use YYYY-MM-DD. Its selected-date event includes both a string and a Date object. Keep the string for comparison and storage; the localized field display is a presentation concern. The document language is the current localization entry point, while the old language property is deprecated.

The example permits dates only during June 2027. This fixed interval makes testing deterministic and is clearly a specimen constraint. A production form would derive its allowable interval from the product rule and explain that rule next to the field.

[Supporting specification](https://www.duetds.com/components/date-picker/)

## Duet Design System A valid date is not necessarily a valid range

### Check the relationship after each field is valid

The component validity object describes individual field errors. A return date that precedes departure may still be a valid calendar date, so the application must check the pair separately. The native example assigns a clear error and uses setFocus(), the documented method that reaches the inner input.

The count is inclusive: departure and return on the same day produce one calendar day. Converting ISO dates at UTC midnight avoids a daylight-saving change turning one calendar interval into a fractional duration. This calculation is original application logic, not a Duet pricing rule.

1. Reject missing, malformed or out-of-bound endpoints.
2. Reject a return date before departure.
3. Move focus to the field that needs correction.
4. Prepare the inclusive range only after both checks pass.

[Supporting specification](https://www.duetds.com/components/date-picker/)

## Duet Design System Primary action does not imply submission

### Duet uses an explicit submit property

The main-system button opts into form submission with submit; its default is false. The supplied composition uses a click action that prepares a local result, so it does not need that property. A destination belongs in url, which produces anchor semantics.

The preview clears its prepared message whenever either input changes. Otherwise the message could appear to confirm values that the visitor has already replaced. No spinner is shown because there is no asynchronous operation.

- Use one primary preparation action.
- State that the result is local.
- Do not reuse success wording to imply policy creation.

[Supporting specification](https://www.duetds.com/components/button/)

## Duet Design System Pin the main-system assets as a compatible set

### The sample is a documented snapshot, not a latest-version promise

The inspected usage page supplies components 10.7.0 with CSS 5.1.4; search-index snapshots already mention later releases. The example deliberately keeps the directly inspected pair together. Production adoption should select one release and verify the matching CSS, fonts and component behavior.

The date fields are custom elements. Wait for their definition before method calls, attach listeners to duetChange, and read the documented payload instead of assuming a native change event. Do not mix the main-system CDN module with the standalone picker on the same page: both define the same tag.

[Supporting specification](https://www.duetds.com/using-components/)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Offline HTML interpretation using native date inputs and verified Duet default-theme values; it is not the Duet calendar runtime.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Duet travel period interpretation</title><style>*{box-sizing:border-box}body{margin:0;background:#f0f7fa;color:#082a4d;font:16px/1.5 system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:36px 28px}.eyebrow{font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}h1{font-size:36px;line-height:1.2;font-weight:600;margin:0 0 20px}p{margin:0 0 20px}.hero{display:grid;grid-template-columns:1fr 300px;gap:28px;align-items:center;margin-bottom:28px}.art{height:170px;position:relative;overflow:hidden;border-radius:50%;background:#c6e1ee}.sun{position:absolute;top:25px;right:60px;width:36px;height:36px;border-radius:50%;background:white}.hill{position:absolute;background:#0077b3;width:210px;height:170px;bottom:-95px;left:-10px;transform:rotate(25deg);border-radius:24px}.hill.two{left:135px;background:#00619b;bottom:-110px;transform:rotate(-25deg)}.road{position:absolute;width:150px;height:200px;border:12px solid white;border-radius:50%;top:65px;left:95px;transform:rotate(25deg)}.card{background:white;border-radius:4px;padding:28px;box-shadow:0 2px 8px #082a4d0d;display:grid;grid-template-columns:1fr 230px;gap:28px}h2{font-size:24px;line-height:1.3;margin:0 0 20px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:20px}label{display:block;font-weight:600;margin-bottom:8px}input{width:100%;max-width:100%;min-width:0;border:1px solid #909599;border-radius:4px;font:inherit;color:inherit;padding:12px;background:white}input[aria-invalid=true]{border-color:#d61c52}button{background:#0077b3;color:white;border:0;border-radius:20rem;padding:12px 36px;font:600 16px/1.5 system-ui;cursor:pointer}button:hover{background:#004b81}button:focus-visible,input:focus-visible{outline:3px solid #082a4d;outline-offset:3px}.error{font-size:14px;color:#d61c52;min-height:24px;margin:8px 0 20px}.calendar{background:#f0f7fa;border-radius:4px;padding:20px}.calendar strong{display:block;margin-bottom:12px}.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:12px;text-align:center}.grid span{padding:3px 0}.grid .in-range{background:#c6e1ee}.grid .endpoint{background:#0077b3;color:white;border-radius:50%}.caption{font-size:12px;margin:12px 0 0}.result{margin-top:20px;background:#e4f1f7;padding:20px;border-radius:4px}.result:empty{display:none}.boundary{font-size:12px;margin-top:28px}.hint{font-size:14px}@media(max-width:650px){main{padding:24px 16px}.hero{grid-template-columns:1fr}.art{display:none}h1{font-size:28px}.card{grid-template-columns:1fr;padding:20px}.fields{grid-template-columns:1fr;gap:16px}.calendar{max-width:300px;width:100%}button{width:100%;padding:12px 20px}}
</style><main><div class="hero"><div><div class="eyebrow">Travel period planner</div><h1>Make time for a change of scenery.</h1><p>Choose a departure and return date to explore an inclusive calendar-day count.</p></div><div class="art" aria-hidden="true"><div class="sun"></div><div class="hill"></div><div class="hill two"></div><div class="road"></div></div></div><div class="card"><section><h2>When will you travel?</h2><p class="hint" id="hint">Use dates from 1–30 June 2027. This fixed month is for demonstration.</p><form novalidate><div class="fields"><div><label for="start">Departure</label><input id="start" type="date" min="2027-06-01" max="2027-06-30" value="2027-06-10" required aria-describedby="hint error"></div><div><label for="end">Return</label><input id="end" type="date" min="2027-06-01" max="2027-06-30" value="2027-06-17" required aria-describedby="hint error"></div></div><div class="error" id="error" role="alert"></div><button type="submit">Prepare date range</button></form></section><aside class="calendar"><strong>June 2027</strong><div class="grid" id="calendar" aria-hidden="true"></div><p class="caption" id="range-caption">10–17 June selected</p></aside></div><div class="result" id="result" role="status"></div><p class="boundary">Independent HTML interpretation of Duet tokens with native date fields. The calendar image is a non-interactive range overview. No insurance quote, booking or policy is created.</p></main><script>const start=document.querySelector('#start'),end=document.querySelector('#end'),result=document.querySelector('#result'),error=document.querySelector('#error');function valid(){return start.validity.valid&&end.validity.valid&&start.value&&end.value&&end.value>=start.value}function draw(){let days=['M','T','W','T','F','S','S'].map(d=>'<span>'+d+'</span>').join('')+'<span></span>';for(let i=1;i<=30;i++){let iso='2027-06-'+String(i).padStart(2,'0'),range=valid()&&iso>=start.value&&iso<=end.value,edge=range&&(iso===start.value||iso===end.value);days+='<span class="'+(edge?'endpoint':range?'in-range':'')+'">'+i+'</span>'}document.querySelector('#calendar').innerHTML=days;document.querySelector('#range-caption').textContent=valid()?start.value+' to '+end.value:'Choose a valid range to highlight it.'}function changed(){result.textContent='';error.textContent='';start.removeAttribute('aria-invalid');end.removeAttribute('aria-invalid');draw()}[start,end].forEach(el=>el.oninput=changed);document.querySelector('form').onsubmit=e=>{e.preventDefault();let bad;if(!start.value||!start.validity.valid){error.textContent='Choose a departure date in June 2027.';bad=start}else if(!end.value||!end.validity.valid){error.textContent='Choose a return date in June 2027.';bad=end}else if(end.value<start.value){error.textContent='Return must be on or after departure.';bad=end}if(bad){bad.setAttribute('aria-invalid','true');bad.focus();result.textContent='';return}const days=(Date.parse(end.value+'T00:00:00Z')-Date.parse(start.value+'T00:00:00Z'))/86400000+1;result.textContent=days+' calendar '+(days===1?'day':'days')+', including departure and return. Local draft: '+start.value+' to '+end.value+'. No policy created.'};draw();</script></html>

```

[Code reference](https://www.duetds.com/components/date-picker/)

- Browser-native date controls power this document. The separate Duet example uses the main-system picker; it must not be confused with the standalone open-source date-picker package.

### Validate a pair of main-system Date Pickers

Two labelled fields, bounded June dates, ordered endpoints, focus on the invalid picker, and an inclusive date count.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Date range draft</title>
<link rel="stylesheet" href="https://cdn.duetds.com/api/css/5.1.4/lib/duet.min.css">
<script type="module" src="https://cdn.duetds.com/api/components/10.7.0/lib/duet/duet.esm.js"></script>
<style>main{max-width:680px;margin:auto;padding:28px}.range{display:grid;grid-template-columns:1fr 1fr;gap:20px}@media(max-width:576px){.range{grid-template-columns:1fr}}</style>
<main><h1>Choose a travel period</h1><p>Demonstration only. No insurance is quoted or purchased.</p><div class="range">
<duet-date-picker id="start" label="Departure" required expand value="2027-06-10" min="2027-06-01" max="2027-06-30"></duet-date-picker>
<duet-date-picker id="end" label="Return" required expand value="2027-06-17" min="2027-06-01" max="2027-06-30"></duet-date-picker></div>
<duet-button id="prepare" variation="primary">Prepare date range</duet-button>
<p id="result" role="status"></p></main><script type="module">
await customElements.whenDefined('duet-date-picker');
const start=document.querySelector('#start'),end=document.querySelector('#end'),result=document.querySelector('#result');
function error(picker){const v=picker.validity;if(!picker.value)return 'Choose a date.';if(v&&!v.valid)return 'Choose a valid date in June 2027.';return '';}
function validate(){start.error=error(start);end.error=error(end);if(!start.error&&!end.error&&end.value<start.value)end.error='Return must be on or after departure.';return !start.error&&!end.error;}
[start,end].forEach(p=>p.addEventListener('duetChange',()=>{result.textContent='';validate()}));
document.querySelector('#prepare').addEventListener('click',async()=>{if(!validate()){await(start.error?start:end).setFocus();return;}const a=Date.parse(start.value+'T00:00:00Z'),b=Date.parse(end.value+'T00:00:00Z');result.textContent=`Local range: ${start.value} to ${end.value}, ${(b-a)/86400000+1} calendar days inclusive. No policy created.`;});
</script></html>
```

[Code reference](https://www.duetds.com/components/date-picker/)

- This uses @duetds/components through its main-system CDN, not @duetds/date-picker 1.x.
- Same-day ranges contain one inclusive calendar day.
- UTC arithmetic avoids daylight-saving offsets in the count.

## Implementation Starting Point

Complete main-system CDN composition, using the versions explicitly present in the inspected integration page. Public search snapshots also show newer versions; pin a compatible release rather than assuming this is latest. Fonts are not redistributed here.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Date range draft</title>
<link rel="stylesheet" href="https://cdn.duetds.com/api/css/5.1.4/lib/duet.min.css">
<script type="module" src="https://cdn.duetds.com/api/components/10.7.0/lib/duet/duet.esm.js"></script>
<style>main{max-width:680px;margin:auto;padding:28px}.range{display:grid;grid-template-columns:1fr 1fr;gap:20px}@media(max-width:576px){.range{grid-template-columns:1fr}}</style>
<main><h1>Choose a travel period</h1><p>Demonstration only. No insurance is quoted or purchased.</p><div class="range">
<duet-date-picker id="start" label="Departure" required expand value="2027-06-10" min="2027-06-01" max="2027-06-30"></duet-date-picker>
<duet-date-picker id="end" label="Return" required expand value="2027-06-17" min="2027-06-01" max="2027-06-30"></duet-date-picker></div>
<duet-button id="prepare" variation="primary">Prepare date range</duet-button>
<p id="result" role="status"></p></main><script type="module">
await customElements.whenDefined('duet-date-picker');
const start=document.querySelector('#start'),end=document.querySelector('#end'),result=document.querySelector('#result');
function error(picker){const v=picker.validity;if(!picker.value)return 'Choose a date.';if(v&&!v.valid)return 'Choose a valid date in June 2027.';return '';}
function validate(){start.error=error(start);end.error=error(end);if(!start.error&&!end.error&&end.value<start.value)end.error='Return must be on or after departure.';return !start.error&&!end.error;}
[start,end].forEach(p=>p.addEventListener('duetChange',()=>{result.textContent='';validate()}));
document.querySelector('#prepare').addEventListener('click',async()=>{if(!validate()){await(start.error?start:end).setFocus();return;}const a=Date.parse(start.value+'T00:00:00Z'),b=Date.parse(end.value+'T00:00:00Z');result.textContent=`Local range: ${start.value} to ${end.value}, ${(b-a)/86400000+1} calendar days inclusive. No policy created.`;});
</script></html>
```

## Agent Prompt

Build a Duet main-system date range using two labelled date pickers, ISO values and validity checks. Validate endpoint order separately, call setFocus on errors, and use an explicit primary local preparation action. Keep the standalone picker package out of the same page.

## Sources

- [Design tokens](https://www.duetds.com/tokens/) — Theme colors, spacing and token status.
- [Typography](https://www.duetds.com/typography/) — Scale and separate brand fonts.
- [Date Picker](https://www.duetds.com/components/date-picker/) — ISO values, validation and methods.
- [Button](https://www.duetds.com/components/button/) — Submit opt-in and variation.
- [Components usage](https://www.duetds.com/using-components/) — Main-system CDN and packages.
- [Standalone picker](https://github.com/duetds/date-picker) — Separate open-source distribution; not the code target here.
