# SEEK Braid Design System — OpenDesign Application Guide

Understand Braid through an original job-search composition: theme-scoped variables, four real breakpoints, contextual text, distinct button tones and a controlled field that explains validation instead of disabling the action.

Independent OpenDesign reference. Original sample listings, no live vacancies or application submission. Named Braid variables resolve through the selected theme.

## Source Reference

- **Package:** braid-design-system ([source](https://github.com/seek-oss/braid-design-system))
- **Theme example:** seekJobs ([source](https://github.com/seek-oss/braid-design-system))
- **Tablet threshold:** 740px ([source](https://seek-oss.github.io/braid-design-system/css/breakpoints/))
- **Desktop threshold:** 992px ([source](https://seek-oss.github.io/braid-design-system/css/breakpoints/))
- **Wide threshold:** 1200px ([source](https://seek-oss.github.io/braid-design-system/css/breakpoints/))
- **Field callback:** React ChangeEventHandler ([source](https://seek-oss.github.io/braid-design-system/components/TextField/props/))


## Design Reference

Current Braid component and CSS references. Named sizes resolve through the selected theme; no unverified pixel equivalents or generated CSS variable names are invented here. The native example explicitly selects seekJobs.

### Responsive thresholds

[Official reference](https://seek-oss.github.io/braid-design-system/css/breakpoints/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| mobile | 0 | Base styles. |
| tablet | 740px | First larger condition. |
| desktop | 992px | Desktop condition. |
| wide | 1200px | Wide condition. |

### Theme variable API

[Official reference](https://seek-oss.github.io/braid-design-system/css/vars/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| vars.space.medium | Theme-scoped CSS expression | Use directly; arithmetic needs calc. |
| vars.space.gutter | Theme gutter expression | Layout gutter. |
| vars.backgroundColor.body | Theme body background | Page surface. |
| vars.backgroundColor.surface | Theme surface background | Container surface. |
| vars.backgroundColor.brandAccent | Theme brand action background | Do not assume a universal hex. |
| vars.foregroundColor.neutral | Theme text role | Main content. |
| vars.foregroundColor.secondary | Theme secondary role | Metadata. |
| vars.borderColor.focus | Theme focus role | Visible focus. |
| vars.borderRadius.standard | Theme radius expression | Standard shape. |

### Box layout API

[Official reference](https://seek-oss.github.io/braid-design-system/components/Box/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| component | div by default | Choose semantic main, section, form as needed. |
| padding | Named space, responsive object allowed | Example mobile medium / tablet xlarge. |
| gap | Named spacing values | Sibling spacing. |
| background="customDark" | Context for custom dark surfaces | Enables matching foreground behavior. |
| borderRadius | none / small / standard / large / xlarge / full | Theme-resolved shape. |

### Text and field contract

[Official reference](https://seek-oss.github.io/braid-design-system/components/TextField/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| label / secondaryLabel / tertiaryLabel | Three label levels | Purpose, optional context, assistance. |
| description | Below-label context | Announced on field focus. |
| message + tone | critical / positive / caution / neutral | Explain field state. |
| onClear | Callback required for clear action | Application resets controlled value. |
| clearLabel | Accessible clear-control label | Localize it. |

### Button prominence and behavior

[Official reference](https://seek-oss.github.io/braid-design-system/components/Button/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| variant | solid / ghost / soft / transparent | Visual emphasis. |
| tone | brandAccent / formAccent / critical / neutral | Action meaning. |
| No explicit tone | Neutral ghost by default | Low-key baseline. |
| Explicit tone, no variant | Solid default | Specify both to remove ambiguity. |
| size | standard / small | Supported sizes. |
| loading | Also disables interaction | Only for actual pending work. |
| Ordinary disabled | Not supported | Allow attempts and explain errors. |

### Text semantics

[Official reference](https://seek-oss.github.io/braid-design-system/components/Text/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| size | large / standard / small / xsmall | Theme type scale. |
| weight | regular / medium / strong | Text emphasis. |
| component="p" | Paragraph element | Visual type and semantics are separate. |
| maxLines | Number | Clamps visible user-generated content. |
| tone="secondary" | Metadata emphasis | Not a substitute for an error role. |

## SEEK Braid Design System A selected theme resolves the visual contract

### Provider, reset and generated variables work together

Braid targets multiple SEEK Group themes. Its variable API contains scoped CSS expressions, so names such as vars.space.medium are stable references while the generated custom-property identifier is not something to reproduce manually. The example chooses seekJobs through BraidProvider.

The reset must be imported before other Braid styles. In an embedded application, styleBody={false} can keep the provider from changing the host body’s background and spacing. That option does not remove the need for the theme context.

[Supporting specification](https://seek-oss.github.io/braid-design-system/components/BraidProvider/)

## SEEK Braid Design System Responsive values use named theme space

### Keep the four real breakpoint conditions

The shared thresholds are mobile at zero, tablet at 740px, desktop at 992px and wide at 1200px. The native example changes padding at the tablet threshold through a responsive prop object. It does not duplicate a CSS media query for that same change.

A theme’s medium spacing is not documented here as a guessed pixel value. Box and Stack are the first choice for spacing. vars is the lower-level escape hatch when a layout cannot be expressed through those components; because its values are CSS expressions, multiplication belongs in calc rather than JavaScript numeric arithmetic.

[Supporting specification](https://seek-oss.github.io/braid-design-system/css/breakpoints/)

## SEEK Braid Design System Text roles carry their surrounding color context

### Choose hierarchy and semantics independently

Text offers named sizes and weights while Heading expresses title hierarchy. A job’s city can use secondary tone, but the title should retain enough prominence to identify the result. Text can render a paragraph through component="p" when the content is a paragraph, rather than choosing an HTML element merely for its default appearance.

Braid adjusts foreground tones for dark background contexts. With an original image or custom background, a Box customDark context communicates that relationship. A manually colored div cannot be assumed to provide the same contextual behavior.

[Supporting specification](https://seek-oss.github.io/braid-design-system/components/Text/)

## SEEK Braid Design System Tone is meaning; variant is prominence

### Reserve the brand accent for the search action

The example explicitly pairs a solid variant with brandAccent for Search jobs. Clear search is a quieter ghost action. formAccent can emphasize repeatable form actions; critical belongs to destructive consequences and should not be used to make ordinary controls more noticeable.

Braid’s default is nuanced: a neutral button is ghost unless otherwise specified, while setting a tone makes the implicit variant solid. Stating both props in a key action keeps its intended hierarchy clear. Actions handles the usual mobile stack and wider inline arrangement.

[Supporting specification](https://seek-oss.github.io/braid-design-system/components/Button/)

## SEEK Braid Design System An actionable error is preferable to an unavailable button

### Use the controlled field contract

TextField’s onChange callback receives the React input event. The sample reads event.target.value, stores draft text, and changes the applied search only when the user activates Search. A clear callback is supplied because the control cannot clear application state by itself.

message explains an empty-query error and critical tone supplies its visual state. description is reserved for persistent context. A regular disabled Braid Button is not supported; the action stays available so the visitor can discover how to proceed. The offline preview additionally moves focus to the invalid field.

1. Keep edits in draft query state.
2. On Search, require a non-empty trimmed query.
3. Display a helpful critical message on failure.
4. Apply the query on success and preserve an explicit empty-results state.

[Supporting specification](https://seek-oss.github.io/braid-design-system/components/TextField/)

## SEEK Braid Design System The specimen searches original data only

### Local results do not imply live vacancies

The preview contains three invented job records with role, city and workplace metadata. Search compares the title and city case-insensitively. It does not retrieve live SEEK listings, and the results are labelled as samples.

Keeping draft text and applied results separate makes the interaction observable: editing a role does not silently replace the current results before Search is pressed. Clear search resets both values. A result list with no match states that outcome and leaves the search controls accessible.

- Expose a result count after applying a query.
- Keep the last applied query understandable during editing.
- Do not add a fake Apply submission to sample listings.

[Supporting specification](https://seek-oss.github.io/braid-design-system/components/TextField/props/)

## SEEK Braid Design System Use a build that extracts Braid styles

### A package install is only one part of setup

The official setup is optimized for sku. Braid’s Vanilla Extract styling needs build integration in a custom bundler, while the reset and selected theme must enter the application in the documented order. The supplied code is a complete entry for an existing compatible sku project, not a claim that a random script tag can run Braid.

Braid performs development assertions and environment-based warnings. The official build guidance describes stripping assertions and replacing the environment at build time for production. Keep this concern in the implementation workflow; the page’s offline HTML example has no such package build dependency.

[Supporting specification](https://github.com/seek-oss/braid-design-system)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Original offline HTML interpretation of Braid search composition, hierarchy and breakpoint guidance; no live SEEK data or Braid runtime. Preview colors and physical spacing are application choices.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Braid sample job search interpretation</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f5f5;color:#222;font:16px/1.5 system-ui,sans-serif}header{background:white;padding:16px 32px;border-bottom:1px solid #ddd;display:flex;align-items:center;justify-content:space-between}header strong{color:#0d3880;font-size:20px}header span{font-size:14px;color:#666}.hero{background:#0d3880;color:white;padding:32px}.hero-inner{max-width:980px;margin:auto}h1{font-size:32px;line-height:1.2;margin:0 0 24px}form{display:grid;grid-template-columns:1fr auto auto;gap:16px;align-items:end}label{display:block;font-weight:600;margin-bottom:8px}input{height:48px;border:1px solid #aaa;border-radius:4px;padding:10px 12px;font:inherit;width:100%;min-width:0;color:#222}input[aria-invalid=true]{border:2px solid #c90040}button{height:48px;border:1px solid transparent;border-radius:4px;font:600 16px/1.2 system-ui;padding:0 24px;cursor:pointer}.search{background:#e60278;color:white}.clear{background:transparent;color:white;border-color:white}button:focus-visible,input:focus-visible{outline:3px solid #69d8ff;outline-offset:3px}.error{background:white;color:#b70040;padding:8px 12px;margin:16px 0 0;border-radius:4px}.error:empty{display:none}.help{font-size:14px;color:#e4eaf6;margin:16px 0 0}main{max-width:1044px;margin:32px auto;padding:0 32px}.results-head{display:flex;justify-content:space-between;gap:16px;margin-bottom:20px}h2{font-size:24px;line-height:1.3;margin:0 0 8px}.applied{font-size:14px;color:#555}article{display:grid;grid-template-columns:1fr 100px;gap:24px;padding:24px;background:white;border:1px solid #ddd;border-radius:4px;margin-bottom:16px}.company{font-size:14px;color:#555}.meta{margin:16px 0;display:flex;gap:8px;flex-wrap:wrap}.meta span{background:#f0f4fb;padding:4px 8px;font-size:12px;border-radius:4px}article p{margin:0;color:#555;font-size:14px}.monogram{background:#f1e5f4;color:#673b78;height:72px;width:72px;border-radius:12px;display:grid;place-items:center;font-weight:700;font-size:24px;justify-self:end}.monogram.blue{color:#0d3880;background:#e4efff}.monogram.green{color:#326342;background:#e8f4eb}.notice{background:white;border:1px solid #ddd;padding:24px}.boundary{font-size:12px;color:#666;margin:24px 0}@media(max-width:739px){header{padding:16px}header span{display:none}.hero{padding:24px 16px}h1{font-size:28px}form{grid-template-columns:1fr;gap:12px}form button{width:100%}main{padding:0 16px;margin:24px auto}article{padding:20px;grid-template-columns:1fr 48px;gap:12px}.monogram{height:48px;width:48px;font-size:18px}article h2{font-size:20px}.results-head{display:block}}</style><header><strong>Possibilities</strong><span>Original job-search specimen</span></header><section class="hero"><div class="hero-inner"><h1>Find your next possibility.</h1><form novalidate><div><label for="query">Role or city</label><input id="query" type="search" placeholder="Try designer or Melbourne" aria-describedby="error help"></div><button class="search" type="submit">Search jobs</button><button class="clear" type="button" id="clear">Clear search</button></form><div id="error" class="error" role="alert"></div><p id="help" class="help">Search three original sample roles. These are not live vacancies.</p></div></section><main><div class="results-head"><div><h2 id="count">3 sample results</h2><div class="applied" id="applied">Showing all sample roles</div></div></div><div id="results"></div><p class="boundary">Independent HTML interpretation of Braid’s search composition and responsive guidance. Original content and application palette; no SEEK data, account or application service is connected.</p></main><script>const jobs=[{title:'Product designer',city:'Melbourne',company:'North Studio',type:'Full time',mode:'Hybrid',initial:'NS',color:'',description:'Shape useful experiences with a small multidisciplinary product team.'},{title:'Design systems engineer',city:'Sydney',company:'Harbour Works',type:'Full time',mode:'Flexible',initial:'HW',color:'blue',description:'Build accessible components and improve the way teams deliver interfaces.'},{title:'UX researcher',city:'Melbourne',company:'Fern Collective',type:'Contract',mode:'On site',initial:'FC',color:'green',description:'Turn thoughtful field research into clear product opportunities.'}];const input=document.querySelector('#query'),error=document.querySelector('#error');let applied='';function render(){let matches=jobs.filter(j=>(j.title+' '+j.city).toLowerCase().includes(applied.toLowerCase()));document.querySelector('#count').textContent=matches.length+' sample '+(matches.length===1?'result':'results');document.querySelector('#applied').textContent=applied?'Applied search: '+applied:'Showing all sample roles';document.querySelector('#results').innerHTML=matches.length?matches.map(j=>`<article><div><h2>${j.title}</h2><div class="company">${j.company} · ${j.city}</div><div class="meta"><span>${j.type}</span><span>${j.mode}</span><span>Sample listing</span></div><p>${j.description}</p></div><div class="monogram ${j.color}" aria-hidden="true">${j.initial}</div></article>`).join(''):'<div class="notice">No sample roles match. Try another role or city, or clear your search.</div>'}document.querySelector('form').onsubmit=e=>{e.preventDefault();if(!input.value.trim()){error.textContent='Enter a role or city.';input.setAttribute('aria-invalid','true');input.focus();return}error.textContent='';input.removeAttribute('aria-invalid');applied=input.value.trim();render()};input.oninput=()=>{error.textContent='';input.removeAttribute('aria-invalid')};document.querySelector('#clear').onclick=()=>{input.value='';applied='';error.textContent='';input.removeAttribute('aria-invalid');render();input.focus()};render();</script></html>

```

[Code reference](https://seek-oss.github.io/braid-design-system/components/Button/)

- The search applies to the included fictional jobs. The native Braid entry requires its style-extraction build and selected seekJobs theme.

### Draft query, applied search and explicit recovery

A controlled TextField validates a local query, Actions groups two different button treatments, and Card/Stack/Heading/Text render original results.

```jsx
// Entry module in an existing sku application:
// npm install braid-design-system
import 'braid-design-system/reset'; // Keep this first.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import seekJobsTheme from 'braid-design-system/themes/seekJobs';
import {BraidProvider,Box,Stack,Heading,Text,TextField,Button,Actions,Card} from 'braid-design-system';
const jobs=[{id:1,title:'Product designer',city:'Melbourne'},{id:2,title:'Design systems engineer',city:'Sydney'},{id:3,title:'UX researcher',city:'Melbourne'}];
function JobSearch(){
 const [draft,setDraft]=useState(''),[query,setQuery]=useState(''),[error,setError]=useState('');
 const results=jobs.filter(j=>(j.title+' '+j.city).toLowerCase().includes(query.toLowerCase()));
 function search(){if(!draft.trim()){setError('Enter a role or city.');return;}setError('');setQuery(draft.trim());}
 function clear(){setDraft('');setQuery('');setError('');}
 return <Box component="main" padding={{mobile:'medium',tablet:'xlarge'}}>
  <Stack space="large">
   <Heading level="2">Find your next possibility</Heading>
   <TextField id="job-query" label="Role or city" value={draft}
     onChange={event=>{setDraft(event.target.value);setError('');}}
     onClear={()=>setDraft('')} clearLabel="Clear role or city"
     tone={error?'critical':'neutral'} message={error||'Search three original sample roles.'}/>
   <Actions><Button tone="brandAccent" variant="solid" onClick={search}>Search jobs</Button>
    <Button variant="ghost" onClick={clear}>Clear search</Button></Actions>
   <Text>{results.length} sample results</Text>
   {results.map(job=><Card key={job.id}><Stack space="small"><Heading level="3">{job.title}</Heading><Text tone="secondary">{job.city}</Text></Stack></Card>)}
   {!results.length&&<Text>No sample roles match. Try a different title or city.</Text>}
   <Text size="small" tone="secondary">These are sample listings, not live vacancies.</Text>
  </Stack>
 </Box>;
}
createRoot(document.getElementById('root')).render(<BraidProvider theme={seekJobsTheme}><JobSearch/></BraidProvider>);
```

[Code reference](https://seek-oss.github.io/braid-design-system/components/TextField/props/)

- onChange receives the input event, not a raw string.
- An empty query leaves Search available and explains what to enter.
- Clear search resets both draft text and applied results.

## Implementation Starting Point

Complete application entry for an existing sku build, which the official setup supports directly. Custom bundlers require Vanilla Extract integration. Reset import must remain first. Native package compile is not claimed by the offline preview.

```jsx
// Entry module in an existing sku application:
// npm install braid-design-system
import 'braid-design-system/reset'; // Keep this first.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import seekJobsTheme from 'braid-design-system/themes/seekJobs';
import {BraidProvider,Box,Stack,Heading,Text,TextField,Button,Actions,Card} from 'braid-design-system';
const jobs=[{id:1,title:'Product designer',city:'Melbourne'},{id:2,title:'Design systems engineer',city:'Sydney'},{id:3,title:'UX researcher',city:'Melbourne'}];
function JobSearch(){
 const [draft,setDraft]=useState(''),[query,setQuery]=useState(''),[error,setError]=useState('');
 const results=jobs.filter(j=>(j.title+' '+j.city).toLowerCase().includes(query.toLowerCase()));
 function search(){if(!draft.trim()){setError('Enter a role or city.');return;}setError('');setQuery(draft.trim());}
 function clear(){setDraft('');setQuery('');setError('');}
 return <Box component="main" padding={{mobile:'medium',tablet:'xlarge'}}>
  <Stack space="large">
   <Heading level="2">Find your next possibility</Heading>
   <TextField id="job-query" label="Role or city" value={draft}
     onChange={event=>{setDraft(event.target.value);setError('');}}
     onClear={()=>setDraft('')} clearLabel="Clear role or city"
     tone={error?'critical':'neutral'} message={error||'Search three original sample roles.'}/>
   <Actions><Button tone="brandAccent" variant="solid" onClick={search}>Search jobs</Button>
    <Button variant="ghost" onClick={clear}>Clear search</Button></Actions>
   <Text>{results.length} sample results</Text>
   {results.map(job=><Card key={job.id}><Stack space="small"><Heading level="3">{job.title}</Heading><Text tone="secondary">{job.city}</Text></Stack></Card>)}
   {!results.length&&<Text>No sample roles match. Try a different title or city.</Text>}
   <Text size="small" tone="secondary">These are sample listings, not live vacancies.</Text>
  </Stack>
 </Box>;
}
createRoot(document.getElementById('root')).render(<BraidProvider theme={seekJobsTheme}><JobSearch/></BraidProvider>);
```

## Agent Prompt

Compose a Braid search using seekJobs theme, reset first, TextField event state, and Actions. Use explicit brandAccent solid for the single hero search and a neutral ghost reset. Allow empty search attempts and explain the error; never disable the ordinary Button to hide validation.

## Sources

- [Setup and build](https://github.com/seek-oss/braid-design-system) — Reset order, sku and Vanilla Extract.
- [BraidProvider](https://seek-oss.github.io/braid-design-system/components/BraidProvider/) — Theme and embedded-body behavior.
- [Variables](https://seek-oss.github.io/braid-design-system/css/vars/) — Scoped CSS expressions and role names.
- [Breakpoints](https://seek-oss.github.io/braid-design-system/css/breakpoints/) — Shared responsive thresholds.
- [Box](https://seek-oss.github.io/braid-design-system/components/Box/) — Semantic elements and responsive utility props.
- [Text](https://seek-oss.github.io/braid-design-system/components/Text/) — Type size, semantics and contextual tones.
- [Button](https://seek-oss.github.io/braid-design-system/components/Button/) — Tone, variant and disabled behavior.
- [TextField](https://seek-oss.github.io/braid-design-system/components/TextField/) — Labels, errors and clearing.
- [TextField props](https://seek-oss.github.io/braid-design-system/components/TextField/props/) — Exact callback and controlled-value types.
