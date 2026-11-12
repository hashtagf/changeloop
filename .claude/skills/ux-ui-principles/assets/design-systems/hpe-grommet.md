# HPE Grommet Design System — OpenDesign Application Guide

Model a capacity reservation with Grommet’s layout primitives, controlled form fields and numeric meters. Use its theme scale deliberately, and keep the base Grommet theme distinct from the separately installed HPE theme.

Independent base Grommet implementation reference. HPE branded theme adoption is shown separately. Capacity numbers are fictional local data, not infrastructure metrics or provisioning.

## Source Reference

- **Theme boundary:** Base Grommet and grommet-theme-hpe are distinct ([source](https://github.com/grommet/grommet-theme-hpe))
- **Default scale:** Generated from 24px base spacing ([source](https://raw.githubusercontent.com/grommet/grommet/master/src/js/themes/base.js))
- **Form state:** Controlled value object with onChange ([source](https://v2.grommet.io/form))
- **Select callback:** Destructured value and option ([source](https://v2.grommet.io/select))
- **Meter denominator:** Explicit max property ([source](https://v2.grommet.io/meter))
- **Page sizing:** full="min" allows document scrolling ([source](https://v2.grommet.io/grommet))
- **Responsive layout:** ResponsiveContext exposes theme breakpoint names ([source](https://v2.grommet.io/responsivecontext))


## Design Reference

Grommet v2 base theme generated with baseSpacing=24 and scale=6; these are not grommet-theme-hpe values. The native starter explicitly sets Arial and the demonstrated brand/focus colors as application theme choices.

### Default edge-size scale

[Official reference](https://raw.githubusercontent.com/grommet/grommet/master/src/js/themes/base.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| global.edgeSize.hair | 1px | Default size outside the small responsive override. |
| global.edgeSize.xxsmall | 3px | Default size outside the small responsive override. |
| global.edgeSize.xsmall | 6px | Default size outside the small responsive override. |
| global.edgeSize.small | 12px | Default size outside the small responsive override. |
| global.edgeSize.medium | 24px | Default size outside the small responsive override. |
| global.edgeSize.large | 48px | Default size outside the small responsive override. |
| global.edgeSize.xlarge | 96px | Default size outside the small responsive override. |

### Small responsive overrides

[Official reference](https://raw.githubusercontent.com/grommet/grommet/master/src/js/themes/base.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| global.breakpoints.small.value | 768 | Small breakpoint boundary in the base theme. |
| small.edgeSize.xxsmall | 2px | Small-screen fine spacing. |
| small.edgeSize.xsmall | 3px | Small-screen xsmall spacing. |
| small.edgeSize.small | 6px | Responsive small padding. |
| small.edgeSize.medium | 12px | Responsive medium padding. |
| small.edgeSize.large | 24px | Responsive large padding. |
| global.breakpoints.medium.value | 1536 | Next base breakpoint boundary. |

### Base colors and controls

[Official reference](https://raw.githubusercontent.com/grommet/grommet/master/src/js/themes/base.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| global.colors.brand | #7D4CDB | Default Grommet brand, not HPE green. |
| global.colors.focus | #6FFFB0 | Default focus accent. |
| global.colors.text.light | #444444 | Light-theme body text. |
| global.colors.text.dark | #f8f8f8 | Dark-theme body text. |
| global.colors.background-front.light | #FFFFFF | Front light surface. |
| global.colors.background-front.dark | #444444 | Front dark surface. |
| global.control.border.radius | 4px | Base control corner. |
| global.control.border.width | 1px | Base control border. |

### Form and field contract

[Official reference](https://v2.grommet.io/form)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Form.value | Object keyed by field name | Use a single controlled reservation object. |
| Form.onChange | (value) => {} | Receives the updated object, not a DOM event. |
| Form.onSubmit | ({ value, touched }) => {} | Read the accepted current form value. |
| Form.validate | blur \| submit \| change | Choose when validation runs. |
| Form.errors | Object keyed like value | Attach remote or application errors to fields. |

### Select and range integration

[Official reference](https://v2.grommet.io/select)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Select.options | String array or object array | The example uses strings to keep the value shape simple. |
| Select.onChange | ({ value, option }) => {} | Do not read event.target.value for Select. |
| Select.valueKey | { key, reduce } for object options | reduce returns the keyed value instead of the full object. |
| Select.labelKey | Property name or function | Visible label for object options. |
| Select.onSearch | Function; enables search input | Provide application filtering when needed. |

### Meter anatomy

[Official reference](https://v2.grommet.io/meter)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| value | number | Amount represented; ignored when values is supplied. |
| max | number or numeric string | Total available capacity; do not mistake value for percentage. |
| type | bar \| circle \| pie \| semicircle | Use circle for the utilization overview. |
| color | Color identifier | Valid with a single value. |
| a11yTitle | string | Describe the measure and denominator. |
| size | Named size or CSS dimension | Keep ring inside available width. |

## HPE Grommet Design System Base Grommet and the HPE theme

### Do not label purple as an HPE token

Grommet is an HPE-associated React framework with its own base theme. The separate grommet-theme-hpe package exports hpe for applications adopting HPE design styling. This reference teaches the base framework and explicitly configured example. Its purple brand and mint focus color come from the base theme; they are not presented as the current HPE branded palette.

[Supporting specification](https://github.com/grommet/grommet-theme-hpe)

### A small explicit application theme

The setup supplies Arial as an application font choice and repeats the documented base brand and focus colors. All other component rules inherit from Grommet. A real HPE product can instead pass the approved hpe theme, then verify the resulting spacing and typography because theme overrides can change the base values listed here.

[Supporting specification](https://v2.grommet.io/grommet)

## HPE Grommet Design System Theme scales can change at a breakpoint

### Named values are responsive decisions

The base generator starts at 24 pixels. Default medium edge spacing is 24px, but the small breakpoint changes medium to 12px. A Box using responsive padding can therefore shrink even when the JSX still says medium. Read the scale and breakpoint override together; do not promise that medium is always twenty-four pixels.

[Supporting specification](https://raw.githubusercontent.com/grommet/grommet/master/src/js/themes/base.js)

### Use Box for the actual layout

The planner uses a column Box as its page and a responsive row/column Box for the form and capacity summary. The child form can grow while the summary keeps a useful minimum width. On small screens the chart follows the controls, matching the document order.

[Supporting specification](https://v2.grommet.io/box)

## HPE Grommet Design System A deliberately specified readable baseline

### Font size and line height are separate theme values

The base generator derives an eighteen-pixel font with a twenty-four-pixel line height from its spacing input. The example explicitly uses that pair with Arial to avoid implying that a proprietary brand font was downloaded. Headings use Grommet Heading and text uses Text, allowing the theme to resolve their roles instead of reproducing component internals in CSS.

[Supporting specification](https://raw.githubusercontent.com/grommet/grommet/master/src/js/themes/base.js)

## HPE Grommet Design System One controlled reservation object

### Names join fields to the form

Form owns the coordinated form contract. In the controlled pattern, value and onChange belong to the caller. The name on each FormField and child input identifies the corresponding value key. Our reservation object contains name and pool. The capacity slider is held as a separate number because it drives a live diagram before submission.

[Supporting specification](https://v2.grommet.io/form)

### Validate the reservation name

A required FormField with name="name" surrounds TextInput id="reservation-name". htmlFor connects the visible label. The custom validator returns a concrete error if the trimmed value is shorter than three characters. Set validation to submit so an untouched empty form does not greet the reader with an error.

[Supporting specification](https://v2.grommet.io/formfield)

## HPE Grommet Design System Select has its own event shape

### Strings keep the simple case predictable

The sample pool options are Production and Development. Their controlled value is therefore a string. If moving to object options, set labelKey and optionally valueKey with reduce, then keep the stored value consistent with that choice. Select onChange exposes a value/option object, unlike the native range input event.

[Supporting specification](https://v2.grommet.io/select)

### Search and option loading are application work

Select can display a search field when onSearch is supplied. That prop does not mean every option has automatically been filtered. Maintain the unfiltered source collection separately so closing or clearing a search can restore it. For two pools the sample intentionally omits search.

[Supporting specification](https://v2.grommet.io/select)

## HPE Grommet Design System A meter needs units and a denominator

### Represent capacity, not an unexplained percentage

Meter receives the projected used amount and max=100. In this illustrative planner the sample pool has 35 units already used and the proposed reservation ranges from 5 to 60. The percentage happens to match the number because the demonstration denominator is one hundred. The code still passes max explicitly so the data contract survives a different total.

[Supporting specification](https://v2.grommet.io/meter)

### Keep the chart and text synchronized

The circle, projected usage label and remaining units are derived from the same numeric slider value. Native RangeInput emits a DOM event, so convert event.target.value to Number before arithmetic. Otherwise adding a string to thirty-five can produce a visually plausible but incorrect total.

[Supporting specification](https://v2.grommet.io/rangeinput)

## HPE Grommet Design System Document scrolling and a narrow-screen composition

### Choose full="min" for this page

Grommet full=true is intended for an application that controls its own viewport and inner scrolling. This planner uses full="min" so the document can grow. That prevents the form and its validation message being trapped under a fixed-height shell on a phone.

[Supporting specification](https://v2.grommet.io/grommet)

### Read ResponsiveContext inside Grommet

A child component consumes the current context and chooses column for small, row otherwise. The provider must wrap that child so its context represents the chosen theme. The fallback layout remains a natural column when the available width is narrow.

- Keep the field labels above their inputs.
- Place the capacity summary after the controls in source order.
- Allow the action row to wrap without hiding validation text.

[Supporting specification](https://v2.grommet.io/responsivecontext)

## HPE Grommet Design System Connect label, error and measurement

### Give every numeric display its meaning

The range control has a persistent label and a visible unit. The circle receives an a11yTitle containing projected usage and total capacity. Nearby text exposes the same numbers so information does not depend on a colored arc. Error copy names the reservation problem and remains next to its field.

[Supporting specification](https://v2.grommet.io/formfield)

### Make the local outcome explicit

Prepare plan stores a local snapshot of the validated form and the current allocation. It does not provision infrastructure. The result changes only after valid submission, while slider changes remain a proposal. This distinction is useful for comparing a prepared plan with the currently edited draft.

1. Submit an empty name and verify the required-field error.
2. Enter a name, choose a pool and adjust the allocation.
3. Prepare the plan and verify that the local snapshot contains the selected pool and numeric units.

[Supporting specification](https://v2.grommet.io/form)

## HPE Grommet Design System Mount a complete Grommet composition

### Install the framework and its styling peer

Install grommet with styled-components and the React runtime in a client project. The setup mounts Grommet, then a child consuming ResponsiveContext, a controlled Form, FormField/TextInput/Select, RangeInput and Meter. Use Button label rather than children so the default label-styled button behavior remains explicit.

[Supporting specification](https://github.com/grommet/grommet)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent HTML/CSS interpretation of base Grommet dimensions and colors, with an explicitly chosen Arial font; not the separate HPE theme.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Capacity reservation — Grommet study</title><style>*{box-sizing:border-box}body{margin:0;background:white;color:#444;font:18px/24px Arial,sans-serif}header{padding:24px 36px;border-bottom:1px solid #ddd;display:flex;gap:12px;align-items:center}.mark{width:22px;height:22px;border:4px solid #7d4cdb;border-radius:50%}main{max-width:1050px;margin:auto;padding:36px}h1{font-size:36px;line-height:42px;margin:12px 0 24px;color:#222}h2{font-size:24px;line-height:30px;margin:0 0 12px}.intro{max-width:650px;margin-bottom:36px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:48px}label{display:block;font-weight:600;margin-bottom:12px}input,select,button{font:inherit;max-width:100%}input[type=text],select{width:100%;border:1px solid #888;border-radius:4px;background:transparent;padding:12px;color:#444}input:focus-visible,select:focus-visible,button:focus-visible{outline:3px solid #6fffb0;outline-offset:3px}.field{margin-bottom:24px}input[type=range]{width:100%;accent-color:#7d4cdb}.limits{display:flex;justify-content:space-between;font-size:14px;color:#666;margin-top:6px}button{border:2px solid #7d4cdb;border-radius:24px;background:#7d4cdb;color:white;padding:10px 24px;font-weight:600;cursor:pointer}button:hover{background:#6839c0}aside{background:#f2f2f2;padding:24px;border-radius:12px;align-self:start;text-align:center}.ring{width:192px;height:192px;border-radius:50%;background:conic-gradient(#7d4cdb var(--used),#dadada 0);margin:24px auto;display:grid;place-items:center;position:relative}.ring:before{content:'';position:absolute;inset:12px;background:#f2f2f2;border-radius:50%}.ring span{position:relative;font-size:36px;font-weight:bold}.ring small{display:block;font-size:14px;font-weight:400;line-height:20px}.legend{text-align:left;border-top:1px solid #ddd;padding-top:12px;font-size:14px}.legend div{display:flex;justify-content:space-between;margin:8px 0}.error{font-size:14px;color:#b30000;margin-top:6px}#result{background:#f2f2f2;border-left:4px solid #7d4cdb;padding:24px;margin-top:36px}footer{font-size:12px;line-height:18px;color:#666;border-top:1px solid #ddd;padding:24px 36px}@media(max-width:700px){main{padding:24px}.layout{grid-template-columns:1fr;gap:24px}h1{font-size:30px;line-height:36px}header,footer{padding:24px}.intro{margin-bottom:24px}}</style><header><span class="mark" aria-hidden="true"></span><strong>Capacity planner</strong></header><main><h1>Plan a reservation</h1><p class="intro">Explore a proposed allocation before preparing a local plan. This model contains 100 capacity units.</p><div class="layout"><form id="form" novalidate><div class="field"><label for="name">Reservation name</label><input id="name" type="text" required aria-describedby="error"><div class="error" id="error" hidden></div></div><div class="field"><label for="pool">Capacity pool</label><select id="pool"><option>Production</option><option>Development</option></select></div><div class="field"><label for="units">Requested allocation: <output id="requested">20</output> units</label><input id="units" type="range" min="5" max="60" step="5" value="20"><div class="limits"><span>5 units</span><span>60 units</span></div></div><button type="submit">Prepare plan</button><p style="font-size:14px;color:#666">No infrastructure will be provisioned.</p></form><aside><h2>Projected usage</h2><div class="ring" id="ring" style="--used:55%" role="img" aria-label="55 of 100 units projected usage"><span><output id="used">55</output><small>of 100 units</small></span></div><div class="legend"><div><span>Already used</span><strong>35</strong></div><div><span>Proposed reservation</span><strong id="proposed">20</strong></div><div><span>Remaining</span><strong id="remaining">45</strong></div></div></aside></div><section id="result" hidden><h2>Prepared local plan</h2><p id="snapshot" role="status"></p><p style="font-size:14px">This snapshot changes only when you prepare the plan again.</p></section></main><footer>Independent base Grommet HTML/CSS interpretation. Base purple/mint palette and spacing; Arial is an application font choice. This is not the separate HPE branded theme.</footer><script>
const $=id=>document.getElementById(id);$('units').oninput=()=>{const units=Number($('units').value),used=35+units;$('requested').textContent=$('proposed').textContent=units;$('used').textContent=used;$('remaining').textContent=100-used;$('ring').style.setProperty('--used',used+'%');$('ring').setAttribute('aria-label',used+' of 100 units projected usage')};$('form').onsubmit=e=>{e.preventDefault();const name=$('name').value.trim();if(name.length<3){$('error').textContent='Use at least three characters for the reservation name.';$('error').hidden=false;$('name').setAttribute('aria-invalid','true');$('name').focus();return}$('error').hidden=true;$('name').removeAttribute('aria-invalid');$('snapshot').textContent=name+' · '+$('pool').value+' · '+$('units').value+' units. Prepared in this local demonstration.';$('result').hidden=false};
</script></html>

```

[Code reference](https://v2.grommet.io/grommet)

- Capacity calculations use the displayed sample pool. The standalone layout is independent HTML; the native example selects base Grommet rather than the separate HPE theme.

### Complete native implementation entry

The complete implementation from setup, collected here alongside the focused API explanations. Follow the documented package and build prerequisites in setup.

```jsx
// npm install react react-dom grommet styled-components
import React, { useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Grommet, Box, Heading, Text, Form, FormField, TextInput,
 Select, RangeInput, Meter, Button, ResponsiveContext } from 'grommet';
const theme={global:{font:{family:'Arial, sans-serif',size:'18px',height:'24px'},colors:{brand:'#7D4CDB',focus:'#6FFFB0'}}};
function Planner(){
 const size=useContext(ResponsiveContext);
 const [value,setValue]=useState({name:'',pool:'Production'});
 const [units,setUnits]=useState(20),[plan,setPlan]=useState(null);
 const used=35+units;
 return <Box pad="medium" gap="medium" width={{max:'large'}} margin="auto">
 <Heading level={1} margin="none">Plan a reservation</Heading>
 <Text>Local capacity model. No infrastructure is provisioned.</Text>
 <Box direction={size==='small'?'column':'row'} gap="large">
 <Box flex><Form value={value} onChange={setValue} validate="submit" onSubmit={({value:accepted})=>setPlan({...accepted,units})}>
 <FormField name="name" htmlFor="reservation-name" label="Reservation name" required validate={name=>String(name || '').trim().length<3?'Use at least three characters':undefined}>
 <TextInput name="name" id="reservation-name"/></FormField>
 <FormField name="pool" htmlFor="pool" label="Capacity pool"><Select name="pool" id="pool" options={['Production','Development']}/></FormField>
 <Box gap="small" margin={{vertical:'medium'}}><label htmlFor="units">Requested allocation: {units} units</label>
 <RangeInput id="units" min={5} max={60} step={5} value={units} onChange={event=>setUnits(Number(event.target.value))}/></Box>
 <Button type="submit" primary label="Prepare plan"/>
 </Form></Box>
 <Box align="center" gap="small" pad="medium" background="light-2" round="small">
 <Meter type="circle" value={used} max={100} size="small" thickness="small" color="brand" a11yTitle={`${used} of 100 units projected usage`}/>
 <Text weight="bold">{used} / 100 units used</Text><Text>{100-used} units remaining</Text>
 </Box></Box>
 {plan&&<Box background="light-2" pad="medium" role="status"><Text>Local plan: {plan.name} · {plan.pool} · {plan.units} units</Text></Box>}
 </Box>
}
createRoot(document.getElementById('root')).render(<Grommet theme={theme} themeMode="light" full="min"><Planner/></Grommet>);
```

[Code reference](https://github.com/grommet/grommet-theme-hpe)

- Client main.jsx for a project with a root element. Base Grommet plus an explicitly declared application font/brand override. No HPE theme is silently assumed. API checked against official documentation; native compilation has not been verified here.

### Switch deliberately to the HPE branded theme

Use the separate package only when that is the intended design target; recheck values against its installed release.

```jsx
// npm install grommet-theme-hpe
import { Grommet } from 'grommet';
import { hpe } from 'grommet-theme-hpe';
// Wrap the Planner from the full setup example:
<Grommet theme={hpe} themeMode="light" full="min"><Planner /></Grommet>
```

[Code reference](https://github.com/grommet/grommet-theme-hpe)

- The reference table above describes the base theme, not this optional override.

### Object Select values

Store a pool id while displaying its label.

```jsx
<Select options={[{id:'prod',label:'Production'},{id:'dev',label:'Development'}]}
 labelKey="label" valueKey={{key:'id',reduce:true}}
 value={poolId} onChange={({value})=>setPoolId(value)} />
```

[Code reference](https://v2.grommet.io/select)

- Declare poolId/setPoolId with useState in the calling component.
- With reduce enabled the stored value is the id, not the object.

## Implementation Starting Point

Client main.jsx for a project with a root element. Base Grommet plus an explicitly declared application font/brand override. No HPE theme is silently assumed. API checked against official documentation; native compilation has not been verified here.

```jsx
// npm install react react-dom grommet styled-components
import React, { useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Grommet, Box, Heading, Text, Form, FormField, TextInput,
 Select, RangeInput, Meter, Button, ResponsiveContext } from 'grommet';
const theme={global:{font:{family:'Arial, sans-serif',size:'18px',height:'24px'},colors:{brand:'#7D4CDB',focus:'#6FFFB0'}}};
function Planner(){
 const size=useContext(ResponsiveContext);
 const [value,setValue]=useState({name:'',pool:'Production'});
 const [units,setUnits]=useState(20),[plan,setPlan]=useState(null);
 const used=35+units;
 return <Box pad="medium" gap="medium" width={{max:'large'}} margin="auto">
 <Heading level={1} margin="none">Plan a reservation</Heading>
 <Text>Local capacity model. No infrastructure is provisioned.</Text>
 <Box direction={size==='small'?'column':'row'} gap="large">
 <Box flex><Form value={value} onChange={setValue} validate="submit" onSubmit={({value:accepted})=>setPlan({...accepted,units})}>
 <FormField name="name" htmlFor="reservation-name" label="Reservation name" required validate={name=>String(name || '').trim().length<3?'Use at least three characters':undefined}>
 <TextInput name="name" id="reservation-name"/></FormField>
 <FormField name="pool" htmlFor="pool" label="Capacity pool"><Select name="pool" id="pool" options={['Production','Development']}/></FormField>
 <Box gap="small" margin={{vertical:'medium'}}><label htmlFor="units">Requested allocation: {units} units</label>
 <RangeInput id="units" min={5} max={60} step={5} value={units} onChange={event=>setUnits(Number(event.target.value))}/></Box>
 <Button type="submit" primary label="Prepare plan"/>
 </Form></Box>
 <Box align="center" gap="small" pad="medium" background="light-2" round="small">
 <Meter type="circle" value={used} max={100} size="small" thickness="small" color="brand" a11yTitle={`${used} of 100 units projected usage`}/>
 <Text weight="bold">{used} / 100 units used</Text><Text>{100-used} units remaining</Text>
 </Box></Box>
 {plan&&<Box background="light-2" pad="medium" role="status"><Text>Local plan: {plan.name} · {plan.pool} · {plan.units} units</Text></Box>}
 </Box>
}
createRoot(document.getElementById('root')).render(<Grommet theme={theme} themeMode="light" full="min"><Planner/></Grommet>);
```

## Agent Prompt

Implement the supplied base Grommet reservation planner with a controlled Form, named FormFields, Select, RangeInput and a Meter with an explicit max. Keep base-theme values distinct from grommet-theme-hpe. Convert the slider value to a number, expose units, validate the name and produce only a local plan snapshot.

## Sources

- [Grommet container](https://v2.grommet.io/grommet) — Theme, full-page sizing and portal scope.
- [Base theme source](https://raw.githubusercontent.com/grommet/grommet/master/src/js/themes/base.js) — Default scale, colors and responsive overrides.
- [Box](https://v2.grommet.io/box) — Layout and responsive padding.
- [Form](https://v2.grommet.io/form) — Controlled object value and validation lifecycle.
- [FormField](https://v2.grommet.io/formfield) — Name binding, labels and custom validation.
- [Select](https://v2.grommet.io/select) — Value/option callbacks and object options.
- [RangeInput](https://v2.grommet.io/rangeinput) — Native range interaction.
- [Meter](https://v2.grommet.io/meter) — Value, maximum and accessible description.
- [ResponsiveContext](https://v2.grommet.io/responsivecontext) — Read the active theme breakpoint.
- [HPE theme](https://github.com/grommet/grommet-theme-hpe) — Optional separate branded theme package.
