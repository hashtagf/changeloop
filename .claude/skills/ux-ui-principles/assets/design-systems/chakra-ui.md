# Chakra UI Design System — OpenDesign Application Guide

A Chakra UI v3 reference for tokens, semantic color roles, recipes, and compound form components. Inspect the actual spacing and type scales, then try a native workspace-profile form with validation, a failed-save simulation, and light/dark appearance.

Original OpenDesign implementation guide using documented Chakra UI v3 foundations. Default token references are separated from application-specific workspace roles. The native preview is a local state demonstration; it does not save workspace data or implement the entire onboarding journey.

## Source Reference

- **Version scope:** Examples target the v3 system API and the 3.37.0 package. ([source](https://chakra-ui.com/docs/theming/overview))
- **Provider contract:** ChakraProvider receives a styling system through value. ([source](https://chakra-ui.com/docs/theming/overview))
- **Token definition:** Leaf tokens use an object containing value. ([source](https://chakra-ui.com/docs/theming/tokens))
- **Theme conditions:** Semantic colors can select base and _dark values. ([source](https://chakra-ui.com/docs/theming/semantic-tokens))
- **Field validation:** invalid belongs on Field.Root; Field.ErrorText renders the message. ([source](https://chakra-ui.com/docs/components/field))
- **Pending button:** loading and loadingText expose pending feedback. ([source](https://chakra-ui.com/docs/components/button))
- **Component styling:** Recipes define base styles, variants, and defaults. ([source](https://chakra-ui.com/docs/theming/recipes))


## Design Reference

Chakra UI 3.37.0 default theme references, plus explicitly identified OpenDesign application tokens. rem values follow the root font size; pixel equivalents assume 16px. This is a selected working reference, not the full exported theme.

### Default semantic colors

[Official reference](https://chakra-ui.com/docs/theming/colors)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| bg | white / black | Light / dark page canvas. |
| bg.panel | white / gray.950 | Light / dark card surface. |
| bg.subtle | gray.50 / gray.950 | Quiet surface. |
| fg | black / gray.50 | Primary text. |
| fg.muted | gray.600 / gray.400 | Supporting text. |
| border | gray.200 / gray.800 | Panel and control boundary. |
| fg.error | red.500 / red.400 | Error text. |
| bg.error | red.50 / red.950 | Error surface. |
| teal.fg | teal.700 / teal.300 | Text on a teal subtle surface. |
| teal.subtle | teal.100 / teal.900 | Current-step treatment. |

### Primitive values used by this example

[Official reference](https://chakra-ui.com/docs/theming/colors)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| gray.50 | #fafafa | Light canvas. |
| gray.200 | #e4e4e7 | Light border. |
| gray.800 | #27272a | Dark border. |
| gray.950 | #111111 | Dark canvas. |
| teal.700 | #0c5d56 | Custom light action references this value. |
| teal.300 | #5eead4 | Custom dark action references this value. |

### Default spacing subset

[Official reference](https://chakra-ui.com/docs/theming/spacing)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| spacing.1 | 0.25rem / 4px | Status vertical padding. |
| spacing.2 | 0.5rem / 8px | Inline control gap. |
| spacing.3 | 0.75rem / 12px | Action group gap. |
| spacing.4 | 1rem / 16px | Small viewport padding. |
| spacing.6 | 1.5rem / 24px | Form field separation. |
| spacing.8 | 2rem / 32px | Major layout gap. |
| spacing.10 | 2.5rem / 40px | Available larger separation. |
| spacing.12 | 3rem / 48px | Available section spacing. |

### Default typography subset

[Official reference](https://chakra-ui.com/docs/theming/typography)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fonts.body / fonts.heading | Inter, system fallbacks | The font token does not itself download Inter. |
| fontSizes.xs | 0.75rem | Specimen annotation. |
| fontSizes.sm | 0.875rem | Helper text. |
| fontSizes.md | 1rem | Inputs and normal reading. |
| fontSizes.lg | 1.125rem | Available larger body. |
| fontSizes.xl | 1.25rem | Card heading. |
| fontSizes.2xl | 1.5rem | Specimen title. |
| fontWeights.medium / semibold | 500 / 600 | Label hierarchy. |
| lineHeights.shorter / moderate | 1.25 / 1.5 | Title / paragraph rhythm. |
| letterSpacings.wide | 0.025em | Small overline. |

### Default radii

[Official reference](https://chakra-ui.com/docs/theming/radii)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| radii.sm | 0.25rem / 4px | Tight edge. |
| radii.md | 0.375rem / 6px | Status chip in this example. |
| radii.lg | 0.5rem / 8px | Moderate rounding. |
| radii.xl | 0.75rem / 12px | Profile card in this example. |
| radii.full | 9999px | Pill geometry, not used for the form. |

### Default responsive thresholds

[Official reference](https://chakra-ui.com/docs/theming/breakpoints)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| sm | 480px | Action row can become horizontal. |
| md | 768px | Progress column sits beside the form. |
| lg | 1024px | Available wide layout threshold. |
| xl | 1280px | Available desktop threshold. |
| 2xl | 1536px | Available extra-wide threshold. |

### Application semantic tokens: defined below

[Official reference](https://chakra-ui.com/docs/theming/semantic-tokens)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| workspace.canvas | gray.50 / gray.950 | Custom light / dark canvas mapping. |
| workspace.action | brand.700 / brand.300 | Custom action background; brand primitives are declared in theme.js. |
| workspace.onAction | white / gray.950 | Custom action text paired with its background. |

## Chakra UI Design System The v3 System: Configuration, Tokens, and Components

### Create a system instead of passing an old theme object

The implementation has three layers: theme.js defines design decisions, main.jsx supplies the resulting system, and App.jsx composes the form. createSystem(defaultConfig, config) keeps the default component recipes while merging the application configuration. A bare custom system would require more definitions; extending the defaults is the deliberate choice here.

The preview uses Chakra components rather than painted substitutes. Its sidebar is an application-specific ordered progress list, not a claim that the Chakra Steps component is mounted. The profile card, fields, select, alerts, and buttons are native Chakra compositions.

[Supporting specification](https://chakra-ui.com/docs/theming/overview)

### What belongs in each layer

- tokens: reusable primitive values, including the example’s two brand colors.
- semanticTokens: condition-aware roles such as workspace.action, independent of individual screens.
- recipes: reusable component variants; application React state controls whether the form is invalid, pending, failed, or confirmed.

## Chakra UI Design System Primitive Colors and Semantic Theme Roles

### Use roles where appearance changes

bg.panel and fg.muted express surface and text jobs; gray.950 and gray.400 are the underlying values. The reference table shows their light/dark resolution. In the demo, changing the document root between light and dark activates those conditional values without rewriting each Field or Card. This local switch deliberately has no persistence or system-preference integration.

The workspace.* roles are application additions. They choose a dark teal action on a light surface and a pale teal action on a dark surface, together with a paired text color. They are not official Chakra token names. Keeping the pair in the theme avoids a dark-mode button whose background changes but whose label remains white.

[Supporting specification](https://chakra-ui.com/docs/theming/semantic-tokens)

### Reference syntax is different from component shorthand

Inside token definitions, use the complete reference {colors.gray.950}. In a style prop, bg="workspace.canvas" resolves within the color category. In a composite CSS value, the complete token path is needed again. This distinction prevents a literal string from being mistaken for a theme reference.

```jsx
<Box bg="workspace.canvas" color="fg" border="1px solid {colors.gray.200}" p="4" />
```

[Code reference](https://chakra-ui.com/docs/theming/tokens)

## Chakra UI Design System A Readable Type Scale With Explicit Tokens

### Map the scale to this composition

The title uses fontSize="2xl" and lineHeight="shorter"; the card heading uses xl; helper text uses sm; the specimen annotation uses xs. Those choices create hierarchy without changing semantic heading levels: the screen title is h1 and the form title is h2. Normal form content remains at the default body scale.

Chakra’s default body and heading stack starts with Inter and falls back to platform fonts. The self-contained demo makes no external font request, so the rendered fallback can vary by operating system. If exact typography is required, serve an appropriately licensed font locally; setting a font token alone does not deliver font files.

[Supporting specification](https://chakra-ui.com/docs/theming/typography)

### Keep typography and meaning independent

The current-step chip is compact metadata, not the main instruction. Required and invalid messages remain beside the field at a readable scale. Changing the overline’s letter spacing does not alter the form labels, and a long workspace name is kept inside the input rather than changing the width of the surrounding card.

## Chakra UI Design System Compose Field, NativeSelect, Card, and Alert

### Field is a relationship, not a styled input

Field.Root groups the label, control, helper, and error. The required flag and RequiredIndicator communicate the requirement; invalid controls the error state. The example keeps the input controlled through React and places the workspace-name error in Field.ErrorText. It does not set error styles independently on a detached paragraph.

Team size uses NativeSelect.Root, NativeSelect.Field, and NativeSelect.Indicator. This retains native select behavior for a short fixed option set. It does not pretend to provide searchable remote results; that would be a different control and data interaction.

[Supporting specification](https://chakra-ui.com/docs/components/field)

### Feedback has a separate composition

Card.Header contains the form identity, while Card.Body contains the editable content. Alert.Root selects an error or success status, Alert.Indicator supplies its icon, and Alert.Content groups the title and description. The failed-save alert is separate from field validation because the workspace name can be valid while the simulated submission fails.

[Supporting specification](https://chakra-ui.com/docs/components/alert)

## Chakra UI Design System Apply Spacing Tokens and Responsive Style Props

### A concrete spacing policy

Use gap="6" between field groups, gap="3" between actions, and gap="8" between the progress column and form. The page changes from p="4" to p="8" at md. With a 16px root these correspond to 24px, 12px, 32px, 16px, and 32px. Rem-based values scale with the user’s root font size.

The card uses rounded="xl" and the status chip rounded="md". The different radii are intentional: the large container and compact label have different geometry. Do not read these usage choices as default rules that all Chakra applications must follow.

[Supporting specification](https://chakra-ui.com/docs/theming/spacing)

### Change the composition at md

The grid uses one column below md and a 220px progress column beside a flexible form from md upward. minmax(0, 1fr) lets the form shrink within the grid. The action stack changes at sm. These object values are mobile-first overrides, not device detection.

```jsx
<Grid templateColumns={{ base: "1fr", md: "220px minmax(0, 1fr)" }} gap="8">
  <Box as="nav" aria-label="Setup progress">…</Box>
  <Card.Root rounded="xl">…</Card.Root>
</Grid>
```

[Code reference](https://chakra-ui.com/docs/styling/responsive-design)

## Chakra UI Design System Connect Validation, Loading, and Recovery

### The preview state machine

Submitting an empty trimmed name sets invalid and focuses the input. A valid submission enters pending, disables editing, and shows Button loadingText. After the local timer, the failure checkbox determines whether the demonstration shows failed or complete. Neither branch performs a network request or stores data.

A failed result keeps the controlled name and selected size intact. Turning off failure simulation allows a retry. Completion disables the profile fields and changes the first progress chip; Reset returns to editing. This proves the visible state composition, not a backend save contract.

[Supporting specification](https://chakra-ui.com/docs/components/button)

### Try the states in order

1. Reset the form and submit without a name; inspect the field message and focused input.
2. Enter a name, enable failed-save simulation, and submit; verify the values remain after the error.
3. Disable the failure simulation and submit again; inspect the confirmed summary, then change appearance.

## Chakra UI Design System Keep Native Semantics Through Composition

### Validation and progress stay understandable

The form uses noValidate so this specimen can demonstrate its custom Field error path instead of stopping at browser validation UI. The label remains attached through Field, and the first invalid input receives focus. Pending work is described by a live status region; it is not conveyed only by a spinner.

The progress list uses ordered-list semantics and aria-current="step" on the active item. It does not include fake links to unavailable screens. The preview’s second and third steps describe context but are not clickable. This makes the limit of the demonstration visible.

[Supporting specification](https://chakra-ui.com/docs/components/field)

### Focus is part of the custom action recipe

The onboarding variant defines an explicit focus-visible outline with an offset. Dark appearance changes the outline role together with the action role. The native checkbox and select remain keyboard operable. Review focus, field announcements, zoom, and screen-reader output in the consuming application as well; a component-level specimen cannot prove accessibility of an entire onboarding product.

## Chakra UI Design System Recipes, Provider Wiring, and Version Boundaries

### Extend Button; define Status locally

The onboarding Button variant is added under theme.recipes.button. Existing variants such as outline remain available because the configuration extends defaultConfig. The status chip uses defineRecipe plus useRecipe locally: its state variants map current, complete, and waiting to different semantic roles. It is an application component, not a Chakra export.

A single-element recipe returns one style object. Multi-part components such as Field have several slots and need slot recipes when their parts are themed together. Applying a button-like recipe to an entire Field would not individually control its label, control, and error.

[Supporting specification](https://chakra-ui.com/docs/theming/recipes)

### Use the supplied files together

Create the Vite React project with the setup commands, replace its default App and main modules with the examples below, and add theme.js. The JSX example uses JavaScript so custom token and variant names do not require generated TypeScript declarations. A TypeScript adaptation should run Chakra CLI typegen against its theme file.

Do not import a v2 extendTheme setup or pass theme={...} to this v3 provider. The actual root uses ChakraProvider value={system}. The example intentionally does not add a second color-mode provider: its local light/dark class switch is adequate for this isolated preview, while a real app may need persisted preference and server rendering support.

[Supporting specification](https://chakra-ui.com/docs/theming/overview)

## Chakra UI Design System Verify the Theme and Form Together

### What this specimen proves

The meaningful review unit is the whole profile card in both appearances: label, input, helper text, invalid feedback, pending button, failure alert, and success summary. A single button cannot expose a missing semantic background or a control whose error state is disconnected from its label.

Compare the reference table with the computed interface. The custom teal action should differ from the default outline action; spacing 6 should separate fields; the grid should become one column below md. These checks link the written rules to rendered output.

### What remains outside the example

The preview has no account creation, invitation delivery, persistence, authentication, or integration with another onboarding screen. Its timer is explicitly a simulation. When connecting a real endpoint, retain the demonstrated field and request-state distinction, replace the timer with the request, and define whether completion means locally accepted, remotely saved, or fully activated.

## Component Examples

### theme.js — primitive tokens, semantic roles, and recipes

Complete application theme for the specimen. The workspace roles and onboarding variant are original additions; defaultConfig supplies Chakra’s standard theme.

```javascript
import { createSystem, defaultConfig, defineConfig, defineRecipe } from '@chakra-ui/react';

export const statusRecipe = defineRecipe({
  base: { display: 'inline-flex', px: '2', py: '1', rounded: 'md', fontSize: 'xs', fontWeight: 'semibold' },
  variants: {
    state: {
      current: { bg: 'teal.subtle', color: 'teal.fg' },
      complete: { bg: 'bg.success', color: 'fg.success' },
      waiting: { bg: 'bg.muted', color: 'fg.muted' },
    },
  },
  defaultVariants: { state: 'waiting' },
});

const config = defineConfig({
  theme: {
    tokens: { colors: { brand: { 700: { value: '#0c5d56' }, 300: { value: '#5eead4' } } } },
    semanticTokens: { colors: {
      'workspace.canvas': { value: { base: '{colors.gray.50}', _dark: '{colors.gray.950}' } },
      'workspace.action': { value: { base: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
      'workspace.onAction': { value: { base: '{colors.white}', _dark: '{colors.gray.950}' } },
    } },
    recipes: {
      button: defineRecipe({ variants: { variant: {
        onboarding: {
          bg: 'workspace.action', color: 'workspace.onAction',
          _hover: { opacity: 0.9 },
          _focusVisible: { outline: '2px solid', outlineColor: 'workspace.action', outlineOffset: '2px' },
        },
      } } }),
    },
  },
});
export const system = createSystem(defaultConfig, config);

```

[Code reference](https://chakra-ui.com/docs/theming/overview)

- Brand values intentionally match the referenced teal primitives.
- The status recipe is local; the Button variant is registered in the system.

### App.jsx — complete native form and state specimen

The actual React composition used by the preview. Includes theme switching, Field validation, a native select, pending feedback, simulated failure, confirmation, and reset.

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Card, Field, Grid, Heading, Input, NativeSelect, Stack, Text, Alert, chakra, useRecipe } from '@chakra-ui/react';
import { statusRecipe } from './theme';

function Status({ state, children }) {
  const recipe = useRecipe({ recipe: statusRecipe });
  return <chakra.span css={recipe({ state })}>{children}</chakra.span>;
}

export default function App() {
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.className = dark ? 'dark' : 'light'; }, [dark]);
  const [name, setName] = useState('Northstar Studio');
  const [size, setSize] = useState('2–10');
  const [invalid, setInvalid] = useState(false);
  const [phase, setPhase] = useState('editing');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const nameInput = useRef(null);
  const pending = phase === 'pending';
  const complete = phase === 'complete';
  const save = (event) => {
    event.preventDefault();
    if (!name.trim()) { setInvalid(true); nameInput.current?.focus(); return; }
    setInvalid(false); setPhase('pending');
    window.setTimeout(() => setPhase(simulateFailure ? 'failed' : 'complete'), 600);
  };
  return <Box className={dark ? 'dark' : 'light'} bg='workspace.canvas' color='fg' p={{ base: '4', md: '8' }}>
    <Box maxW='960px' mx='auto'>
      <Stack direction={{ base: 'column', sm: 'row' }} justify='space-between' align={{ base: 'stretch', sm: 'center' }} gap='4' mb='8'>
        <Box><Text fontSize='xs' fontWeight='semibold' color='teal.fg' letterSpacing='wide'>CHAKRA UI · NATIVE SPECIMEN</Text><Heading as='h1' fontSize='2xl' lineHeight='shorter' mt='2'>Set up your workspace</Heading></Box>
        <Button variant='outline' size='sm' onClick={() => setDark(!dark)} aria-pressed={dark}> {dark ? 'Light appearance' : 'Dark appearance'} </Button>
      </Stack>
      <Grid templateColumns={{ base: '1fr', md: '220px minmax(0, 1fr)' }} gap='8'>
        <Box as='nav' aria-label='Setup progress'>
          <Stack as='ol' gap='6' listStyleType='none' m='0' p='0'>
            <Box as='li' aria-current={complete ? undefined : 'step'}><Status state={complete ? 'complete' : 'current'}>{complete ? 'Complete' : 'Current'}</Status><Text fontWeight='semibold' mt='2'>1. Workspace profile</Text><Text fontSize='sm' color='fg.muted'>Name and team size</Text></Box>
            <Box as='li'><Status state='waiting'>Next</Status><Text fontWeight='medium' mt='2'>2. Invite your team</Text><Text fontSize='sm' color='fg.muted'>Available in the full product</Text></Box>
            <Box as='li'><Status state='waiting'>Optional</Status><Text fontWeight='medium' mt='2'>3. Connect tools</Text><Text fontSize='sm' color='fg.muted'>Complete this later</Text></Box>
          </Stack>
          <Box mt='8' borderTopWidth='1px' borderColor='border' pt='4'><Text fontSize='xs' color='fg.muted'>Scale in this specimen</Text><Text fontSize='sm' mt='2'>Field gap 6 · Card padding 6<br/>Page gap 8 · Radius xl</Text></Box>
        </Box>
        <Card.Root bg='bg.panel' borderColor='border' rounded='xl'>
          <Card.Header><Heading as='h2' fontSize='xl'>Workspace profile</Heading><Text color='fg.muted' fontSize='sm'>The name appears on your team's workspace.</Text></Card.Header>
          <Card.Body>
            <form onSubmit={save} noValidate>
              <Stack gap='6'>
                <Field.Root required invalid={invalid} disabled={pending || complete}>
                  <Field.Label>Workspace name <Field.RequiredIndicator /></Field.Label>
                  <Input ref={nameInput} value={name} onChange={e => {setName(e.target.value);setInvalid(false);}} autoComplete='organization' />
                  <Field.HelperText>Use a name your teammates will recognize.</Field.HelperText>
                  <Field.ErrorText>Enter a workspace name.</Field.ErrorText>
                </Field.Root>
                <Field.Root disabled={pending || complete}>
                  <Field.Label>Team size</Field.Label>
                  <NativeSelect.Root><NativeSelect.Field value={size} onChange={e => setSize(e.target.value)}><option>Just me</option><option>2–10</option><option>11–50</option><option>51+</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
                  <Field.HelperText>Used only for this local preview summary.</Field.HelperText>
                </Field.Root>
                <Box><label style={{display:'flex',gap:'8px',alignItems:'center',fontSize:'14px'}}><input type='checkbox' checked={simulateFailure} disabled={pending || complete} onChange={e=>setSimulateFailure(e.target.checked)} />Simulate a failed save</label></Box>
                {phase === 'failed' && <Alert.Root status='error'><Alert.Indicator /><Alert.Content><Alert.Title>Demo save failed</Alert.Title><Alert.Description>Your values are still here. Turn off failure simulation and retry.</Alert.Description></Alert.Content></Alert.Root>}
                {complete && <Alert.Root status='success'><Alert.Indicator /><Alert.Content><Alert.Title>Profile confirmed in this preview</Alert.Title><Alert.Description>{name.trim()} · {size} people. Nothing was sent or stored.</Alert.Description></Alert.Content></Alert.Root>}
                <Stack direction={{base:'column',sm:'row'}} gap='3'>
                  <Button type='submit' variant='onboarding' loading={pending} loadingText='Checking profile' disabled={complete}>Confirm profile</Button>
                  <Button type='button' variant='outline' disabled={pending} onClick={()=>{setPhase('editing');setInvalid(false);setName('');setSize('2–10');setSimulateFailure(false);nameInput.current?.focus();}}>Reset example</Button>
                </Stack>
                <Text role='status' aria-live='polite' fontSize='sm' color='fg.muted'>{pending ? 'Simulating a response. No network request is made.' : complete ? 'Profile step complete. Reset to try another state.' : 'Try an empty name, a failed save, or a different appearance.'}</Text>
              </Stack>
            </form>
          </Card.Body>
        </Card.Root>
      </Grid>
      <Text mt='6' fontSize='xs' color='fg.muted'>Actual Chakra UI 3.37.0 components. Custom workspace semantic tokens and button recipe. Memory-only demonstration.</Text>
    </Box>
  </Box>;
}

```

[Code reference](https://chakra-ui.com/docs/components/field)

- No request is sent; the 600ms delay demonstrates pending UI.
- The next steps are contextual labels, not functioning navigation.

## Implementation Starting Point

Use Node.js supported by the installed Vite release and Chakra (Chakra documents Node 20 or later). This block separates terminal commands from src/main.jsx. The full theme and App files are provided above; no hidden provider snippet or external CSS is required.

```text
# Terminal: create a JavaScript React application
npm create vite@latest chakra-profile -- --template react
cd chakra-profile
npm install
npm install @chakra-ui/react@3.37.0 @emotion/react

# Save the two complete examples as src/theme.js and src/App.jsx.
# Replace src/main.jsx with:
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme';
import App from './App';
createRoot(document.getElementById('root')).render(<ChakraProvider value={system}><App /></ChakraProvider>);

# Start from the project directory:
npm run dev
```

## Agent Prompt

Use Chakra UI 3.37.0 and the supplied theme.js and App.jsx as the starting point. Preserve the workspace semantic roles, Field composition, native select, and separation between invalid input and failed submission. Replace only the simulated timer with our actual persistence API; do not mark profile completion before the confirmed result. Preserve keyboard focus, responsive base/md layout, and light/dark values. Explain any new tokens or recipe variants.

## Sources

- [Architecture](https://chakra-ui.com/docs/theming/overview) — Official Chakra UI reference for architecture.
- [Tokens](https://chakra-ui.com/docs/theming/tokens) — Official Chakra UI reference for tokens.
- [Semantic](https://chakra-ui.com/docs/theming/semantic-tokens) — Official Chakra UI reference for semantic.
- [Colors](https://chakra-ui.com/docs/theming/colors) — Official Chakra UI reference for colors.
- [Spacing](https://chakra-ui.com/docs/theming/spacing) — Official Chakra UI reference for spacing.
- [Typography](https://chakra-ui.com/docs/theming/typography) — Official Chakra UI reference for typography.
- [Radii](https://chakra-ui.com/docs/theming/radii) — Official Chakra UI reference for radii.
- [Breakpoints](https://chakra-ui.com/docs/theming/breakpoints) — Official Chakra UI reference for breakpoints.
- [Recipes](https://chakra-ui.com/docs/theming/recipes) — Official Chakra UI reference for recipes.
- [Custom Recipes](https://chakra-ui.com/docs/theming/customization/recipes) — Official Chakra UI reference for custom recipes.
- [Field](https://chakra-ui.com/docs/components/field) — Official Chakra UI reference for field.
- [Button](https://chakra-ui.com/docs/components/button) — Official Chakra UI reference for button.
- [Card](https://chakra-ui.com/docs/components/card) — Official Chakra UI reference for card.
- [Native Select](https://chakra-ui.com/docs/components/native-select) — Official Chakra UI reference for native select.
- [Alert](https://chakra-ui.com/docs/components/alert) — Official Chakra UI reference for alert.
- [Responsive](https://chakra-ui.com/docs/styling/responsive-design) — Official Chakra UI reference for responsive.
- [Install](https://chakra-ui.com/docs/get-started/installation) — Official Chakra UI reference for install.
