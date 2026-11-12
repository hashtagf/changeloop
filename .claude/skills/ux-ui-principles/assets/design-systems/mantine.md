# Mantine Design System — OpenDesign Application Guide

A Mantine 9 reference built around a native participant table and scheduling drawer. Inspect the actual theme scales, connect useForm to TextInput, Select, Checkbox, and DatePickerInput, and try validation before adding a local record.

Original OpenDesign example using Mantine 9.6.3. Default theme values are distinguished from the cyan/shape application overrides. The native preview demonstrates local records and validation only, without collecting consent or saving research data.

## Source Reference

- **Tested packages:** core, hooks, form, and dates are aligned to 9.6.3. ([source](https://mantine.dev/theming/theme-object/))
- **Theme composition:** createTheme provides overrides to MantineProvider. ([source](https://mantine.dev/theming/mantine-provider/))
- **Styles:** Core and dates CSS are separate imports in this example. ([source](https://mantine.dev/dates/date-picker-input/))
- **Form binding:** getInputProps connects values, events, and errors. ([source](https://mantine.dev/form/use-form/))
- **Drawer:** opened and onClose control visibility; data-autofocus targets initial focus. ([source](https://mantine.dev/core/drawer/))
- **Table overflow:** Table.ScrollContainer confines a minimum-width table. ([source](https://mantine.dev/core/table/))


## Design Reference

Selected DEFAULT_THEME values verified from @mantine/core 9.6.3. Numeric pixel equivalents assume a 16px root and theme.scale=1; scaled tokens resolve through --mantine-scale. Cyan primary color, shade 8, and radius md are explicit application overrides.

### Cyan palette used in the example

[Official reference](https://mantine.dev/theming/colors/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colors.cyan[0] | #e3fafc | Quiet theme summary surface. |
| colors.cyan[1] | #c5f6fa | Light tint. |
| colors.cyan[2] | #99e9f2 | Tint. |
| colors.cyan[3] | #66d9e8 | Tint. |
| colors.cyan[4] | #3bc9db | Mid tint. |
| colors.cyan[5] | #22b8cf | Mid shade. |
| colors.cyan[6] | #15aabf | Standard palette shade. |
| colors.cyan[7] | #1098ad | Darker shade. |
| colors.cyan[8] | #0c8599 | Chosen primary action shade. |
| colors.cyan[9] | #0b7285 | Strong text accent. |

### Type scale at scale 1

[Official reference](https://mantine.dev/theming/theme-object/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontSizes.xs / sm | 12px / 14px | Record IDs / supporting text. |
| fontSizes.md / lg / xl | 16px / 18px / 20px | Default body and larger text. |
| lineHeights.xs / sm / md | 1.4 / 1.45 / 1.55 | Paired body scales. |
| lineHeights.lg / xl | 1.6 / 1.65 | Larger reading scales. |
| headings.h1 | 34px / 1.3 | Participant sessions title. |
| headings.h2 / h3 | 26px / 1.35; 22px / 1.4 | Available heading tiers. |
| fontFamily | Platform sans-serif stack | No downloaded font required. |

### Spacing and radius at scale 1

[Official reference](https://mantine.dev/theming/theme-object/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| spacing.xs / sm | 10px / 12px | Small gaps. |
| spacing.md / lg / xl | 16px / 20px / 32px | Mobile inset / field gap / section gap. |
| radius.xs / sm | 2px / 4px | Small geometry. |
| radius.md / lg / xl | 8px / 16px / 32px | Example default / larger corners. |
| defaultRadius | md (application override) | Applied centrally by createTheme. |

### Breakpoints

[Official reference](https://mantine.dev/theming/theme-object/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| breakpoints.xs | 36em | 576px at 16px default. |
| breakpoints.sm | 48em | Summary cards become three columns. |
| breakpoints.md | 62em | 992px at 16px default. |
| breakpoints.lg / xl | 75em / 88em | 1200px / 1408px at 16px default. |

### CSS and component mapping

[Official reference](https://mantine.dev/styles/css-variables/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --mantine-primary-color-filled | Resolved from primaryColor and primaryShade | The example chooses cyan shade 8. |
| --mantine-spacing-lg | calc(1.25rem * var(--mantine-scale)) | Stack gap lg and panel padding lg. |
| --mantine-radius-md | calc(0.5rem * var(--mantine-scale)) | Default rounded panel. |
| --mantine-font-size-sm | calc(0.875rem * var(--mantine-scale)) | Table record labels. |
| Button.extend defaultProps | size: sm | Explicit application default. |
| TextInput.extend defaultProps | size: md | Explicit application default. |

## Mantine Design System Mantine’s Theme and Package Boundaries

### One provider, three feature packages

The example uses core for the interface, form for validation and bindings, and dates for the calendar input. MantineProvider receives createTheme overrides. Core CSS and dates CSS are both imported; loading the React component alone is insufficient to reproduce the styled calendar.

The theme selects cyan with primaryShade 8 and defaultRadius md. Button.extend makes small buttons the application default, while TextInput.extend selects medium controls. These are deliberate settings shown in source, not an assertion that every Mantine product should use them.

[Supporting specification](https://mantine.dev/theming/theme-object/)

## Mantine Design System Use Palette Indices and Resolved Color Roles

### An ordered palette is not a list of unrelated swatches

Mantine colors are indexed shade arrays. This specimen uses cyan.0 for a quiet summary panel, cyan.9 for accent text, and the configured primary shade for filled actions. The reference lists the entire cyan ramp used by this theme.

The table’s confirmed badge uses a light cyan variant; withdrawn uses orange. Those statuses retain text. A withdrawal changes the consent state but leaves the prior session visible, preventing a color change from silently deleting history.

[Supporting specification](https://mantine.dev/theming/colors/)

### Theme colors versus arbitrary CSS

The component color prop can reference a named palette; styling a raw hexadecimal background separately would bypass some variant decisions. When using plain CSS, prefer the generated variables for repeated theme decisions. The example’s CSS-variable mapping explains which values remain linked to scale and primary color.

[Supporting specification](https://mantine.dev/styles/css-variables/)

## Mantine Design System Apply the Exported Font and Heading Scales

### Reproduce the hierarchy

The table uses sm text for names and study labels and xs for identifiers and dates. Title order={1} uses the h1 scale; the drawer has an h2 semantic heading rendered with size="h3" so its visual tier is more compact. These decisions are independent of the label and helper text supplied by input components.

Mantine’s platform-font stack does not require a remote font download. Scaled font values include --mantine-scale; the reference’s pixel values assume scale 1. Avoid treating those pixel equivalents as invariant if the application changes its scale.

[Supporting specification](https://mantine.dev/theming/theme-object/)

## Mantine Design System Bind useForm to Real Input Components

### Validation belongs to the form model

initialValues includes a name, study, nullable date, and boolean consent. validate returns an error string or null for the name, date, and consent fields. form.onSubmit runs that validation before the local row is appended. No separate collection of manually painted error labels is needed.

TextInput and DatePickerInput receive getInputProps for their field path. Checkbox additionally specifies type:"checkbox" so its checked value is bound correctly. Select uses a fixed study list and allowDeselect={false}; the workflow does not accept an empty study.

[Supporting specification](https://mantine.dev/form/use-form/)

### Date value and display format

The date component is from @mantine/dates, with the matching stylesheet imported after core styles. The specimen’s package uses string date values; the displayed DD MMM YYYY format is separate from the stored date string shown in the table. defaultDate opens the calendar at the example month without pre-filling a valid session date.

[Supporting specification](https://mantine.dev/dates/date-picker-input/)

## Mantine Design System Control Density and Overflow at the Component Boundary

### Keep the table inside its own scroll region

Table.ScrollContainer uses minWidth={580}, preserving four readable columns on narrow screens. The document itself remains within the viewport; only the data region scrolls horizontally when needed. horizontalSpacing="lg" and verticalSpacing="md" use theme spacing rather than independent cell padding.

The three summary cards use SimpleGrid with one base column and three columns from sm. The page inset similarly changes from md to xl. These are responsive style objects, while the table’s minimum width is an explicit content decision.

[Supporting specification](https://mantine.dev/core/table/)

## Mantine Design System Distinguish Invalid Enrollment From Consent Withdrawal

### The example has two different mutations

The scheduling form cannot add a row until the name, session date, and example consent satisfy validation. A successful local addition closes the drawer, appends one record, and updates the summary counts. The alert says that no research record was stored.

Withdraw changes only the selected row’s status and disables that row’s action. The date remains visible as history, while the scheduled count excludes withdrawn rows. This is a stated preview policy, not a real research-retention rule.

- Invalid form: show input-level errors and keep the drawer open.
- Accepted local entry: append the row once and reset the next draft.
- Withdrawn example consent: preserve the record while disabling another withdrawal.

## Mantine Design System Let Drawer and Input Semantics Work Together

### Focus and labels

The drawer receives a title and uses its native focus management. The name input has data-autofocus. Every form control has a visible label; validation messages come from the bound error prop. The withdrawal button’s accessible name includes the participant so several identical visual labels remain distinguishable.

Closing the drawer cancels the draft in this specimen: opening Add participant resets the form. The calendar is a native Mantine popup within the drawer. Test its keyboard interaction together with the surrounding focus trap rather than assuming two individually accessible components always compose correctly.

[Supporting specification](https://mantine.dev/core/drawer/)

## Mantine Design System Install Version-Aligned Packages and Both Stylesheets

### The complete setup is supplied

Use the terminal commands below, replace App.jsx with the full composition, and mount it with the supplied main.jsx. The four Mantine package versions are deliberately aligned. App.jsx contains the provider and theme, so no hidden provider file is needed.

Do not copy a date example from a different major version without checking its value type. Keep the form’s initial date and validation consistent with the actual DatePickerInput API. This example was built against the specified package versions rather than inferred from an older tutorial.

1. Install core, hooks, form, dates, and the dates dependency dayjs.
2. Import core/styles.css and dates/styles.css once at the application boundary.
3. Run the form, add a dated record, then inspect the table and withdrawal result.

## Mantine Design System Verify the Calendar, Form, and Table as One Unit

### What to try

Submit the empty drawer to reveal name, date, and consent errors. Fill a name, select a day in the calendar, and confirm the example consent before submitting again. The new participant should appear with the selected date and a stable preview ID. Then withdraw that participant’s consent and observe both the row and summary.

The data model is deliberately small and memory-only. There is no study recruitment, consent collection, server persistence, or timezone conversion. The concrete value of this example is the native package integration and visible control behavior, not an implied research-management backend.

## Component Examples

### App.jsx — provider, theme, table, and scheduling drawer

Complete native Mantine example. Contains the theme overrides, useForm validation, DatePickerInput, table updates, and consent-status change.

```jsx
import React, {useState} from 'react';
import {MantineProvider, createTheme, Box, Group, Stack, Title, Text, Button, Paper, Badge, Table, Drawer, TextInput, Select, Checkbox, Alert, SimpleGrid} from '@mantine/core';
import {useForm} from '@mantine/form';
import {DatePickerInput} from '@mantine/dates';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
const theme=createTheme({primaryColor:'cyan',primaryShade:8,defaultRadius:'md',components:{Button:Button.extend({defaultProps:{size:'sm'}}),TextInput:TextInput.extend({defaultProps:{size:'md'}})}});
function Tracker(){
 const[opened,setOpened]=useState(false),[notice,setNotice]=useState(''),[rows,setRows]=useState([{name:'Alex Morgan',study:'Navigation study',date:'2026-10-14',status:'Confirmed'},{name:'Sam Rivera',study:'Editor study',date:'2026-10-16',status:'Confirmed'}]);
 const form=useForm({initialValues:{name:'',study:'Navigation study',date:null,consent:false},validate:{name:v=>v.trim().length<2?'Enter a name with at least two characters.':null,date:v=>!v?'Choose a session date.':null,consent:v=>!v?'Confirm consent before scheduling this example.':null}});
 const submit=values=>{setRows([...rows,{name:values.name.trim(),study:values.study,date:values.date,status:'Confirmed'}]);setOpened(false);setNotice('Participant added in this browser only. No research record was stored.');form.reset();};
 return <Box p={{base:'md',sm:'xl'}} bg='gray.0'><Box maw={1040} mx='auto'>
 <Group justify='space-between' align='flex-start' mb='xl'><Box><Text c='cyan.9' fw={700} size='xs' tt='uppercase' mb='xs'>Mantine · Research operations</Text><Title order={1}>Participant sessions</Title><Text c='dimmed' mt='xs'>Consent and scheduling stay visible in the same working view.</Text></Box><Button onClick={()=>{form.reset();setOpened(true)}}>Add participant</Button></Group>
 <SimpleGrid cols={{base:1,sm:3}} mb='xl'><Paper withBorder p='lg'><Text size='sm' c='dimmed'>In this preview</Text><Text fz={32} fw={700}>{rows.length}</Text><Text size='sm'>Participant records</Text></Paper><Paper withBorder p='lg'><Text size='sm' c='dimmed'>Scheduled</Text><Text fz={32} fw={700}>{rows.filter(r=>r.status==='Confirmed').length}</Text><Text size='sm'>With confirmed example consent</Text></Paper><Paper withBorder p='lg' bg='cyan.0'><Text size='sm' c='cyan.9' fw={600}>Working theme</Text><Text mt='xs' size='sm'>cyan.8 action · radius md<br/>spacing lg · body md</Text></Paper></SimpleGrid>
 {notice&&<Alert title='Local change' color='cyan' mb='md' withCloseButton onClose={()=>setNotice('')}>{notice}</Alert>}
 <Paper withBorder radius='md'><Table.ScrollContainer minWidth={580}><Table verticalSpacing='md' horizontalSpacing='lg' highlightOnHover><Table.Thead><Table.Tr><Table.Th>Participant</Table.Th><Table.Th>Study / session</Table.Th><Table.Th>Consent</Table.Th><Table.Th>Action</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{rows.map((r,i)=><Table.Tr key={i}><Table.Td><Text fw={600} size='sm'>{r.name}</Text><Text size='xs' c='dimmed'>P-{String(i+1).padStart(3,'0')}</Text></Table.Td><Table.Td><Text size='sm'>{r.study}</Text><Text size='xs' c='dimmed'>{r.date}</Text></Table.Td><Table.Td><Badge variant='light' color={r.status==='Confirmed'?'cyan':'orange'}>{r.status}</Badge></Table.Td><Table.Td><Button variant='subtle' color='gray' disabled={r.status==='Withdrawn'} aria-label={'Withdraw consent for '+r.name} onClick={()=>{setRows(rows.map((x,j)=>j===i?{...x,status:'Withdrawn'}:x));setNotice('Consent withdrawn in the preview. The prior session remains visible as history.')}}>Withdraw</Button></Table.Td></Table.Tr>)}</Table.Tbody></Table></Table.ScrollContainer></Paper>
 <Text size='xs' c='dimmed' mt='lg'>Native Mantine 9.6.3: Table, Drawer, useForm, DatePickerInput, and input error styles. All records are memory-only examples.</Text>
 <Drawer opened={opened} onClose={()=>setOpened(false)} position='right' size='md' title={<Title order={2} size='h3'>Schedule a participant</Title>}><form onSubmit={form.onSubmit(submit)} noValidate><Stack gap='lg'><Text size='sm' c='dimmed'>All fields below belong to this one study enrollment. Closing discards the draft.</Text><TextInput label='Participant name' placeholder='Jules Davis' data-autofocus {...form.getInputProps('name')}/><Select label='Study' data={['Navigation study','Editor study']} allowDeselect={false} {...form.getInputProps('study')}/><DatePickerInput label='Session date' placeholder='Choose a date' valueFormat='DD MMM YYYY' defaultDate='2026-10-01' {...form.getInputProps('date')}/><Checkbox label='Consent is confirmed for this example study' {...form.getInputProps('consent',{type:'checkbox'})}/><Button type='submit'>Add to preview</Button><Text size='xs' c='dimmed'>This checkbox demonstrates validation; it is not a research consent collection process.</Text></Stack></form></Drawer>
 </Box></Box>;
}
export default function App(){return <MantineProvider theme={theme} forceColorScheme='light'><Tracker/></MantineProvider>}

```

[Code reference](https://mantine.dev/form/use-form/)

- Core and dates CSS are both imported.
- The consent checkbox is an example validation condition, not a real consent collection flow.

## Implementation Starting Point

Use a Node release supported by the selected Vite template. The source includes provider, theme, and stylesheet imports; no backend or custom CSS is required for the demonstrated flow.

```text
# Terminal
npm create vite@latest participant-demo -- --template react
cd participant-demo
npm install
npm install @mantine/core@9.6.3 @mantine/hooks@9.6.3 @mantine/form@9.6.3 @mantine/dates@9.6.3 dayjs

# Save the complete example as src/App.jsx.
# Replace src/main.jsx with:
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App/>);

# Terminal
npm run dev
```

## Agent Prompt

Use the supplied Mantine 9.6.3 composition and keep core/form/dates versions aligned. Preserve the provider, both CSS imports, getInputProps bindings, date value type, and table scroll boundary. Replace local enrollment changes with the real service only after defining consent and persistence policies. Keep withdrawal distinct from deletion, and preserve readable input errors and drawer focus.

## Sources

- [Theme reference](https://mantine.dev/theming/theme-object/) — Official Mantine documentation for theme.
- [Colors reference](https://mantine.dev/theming/colors/) — Official Mantine documentation for colors.
- [Variables reference](https://mantine.dev/styles/css-variables/) — Official Mantine documentation for variables.
- [Provider reference](https://mantine.dev/theming/mantine-provider/) — Official Mantine documentation for provider.
- [Form reference](https://mantine.dev/form/use-form/) — Official Mantine documentation for form.
- [Date reference](https://mantine.dev/dates/date-picker-input/) — Official Mantine documentation for date.
- [Drawer reference](https://mantine.dev/core/drawer/) — Official Mantine documentation for drawer.
- [Table reference](https://mantine.dev/core/table/) — Official Mantine documentation for table.
- [Styles reference](https://mantine.dev/styles/styles-api/) — Official Mantine documentation for styles.
- [Select reference](https://mantine.dev/core/select/) — Official Mantine documentation for select.
- [Input reference](https://mantine.dev/core/text-input/) — Official Mantine documentation for input.
