# Tamagui Design System — OpenDesign Application Guide

Explore Tamagui’s actual v5 token categories and light/dark blue themes through a complete native-component habit board with validation, progress and empty-state recovery.

Actual Tamagui 2.7.7 web components using the v5 preset. The habit board and state rules are original OpenDesign code; no account, reminder or native-device behavior is connected.

## Source Reference

- **Package / preset:** 2.7.7 packages / v5 configuration ([source](https://tamagui.dev/docs/core/configuration))
- **Token distinction:** size $4 44 / space $4 18 / radius 4 9 ([source](https://cdn.jsdelivr.net/npm/@tamagui/themes@2.7.7/src/v5-tokens.ts))
- **Reference entries:** 50 actual values and contracts ([source](https://tamagui.dev/docs/core/tokens))


## Design Reference

Values exported by @tamagui/config/v5 and @tamagui/themes at 2.7.7, plus verified native component contracts.

### v5 size tokens

[Official reference](https://cdn.jsdelivr.net/npm/@tamagui/themes@2.7.7/src/v5-tokens.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| size.$1 | 20 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| size.$2 | 28 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| size.$3 | 36 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| size.$4 | 44 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| size.$5 | 52 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| size.$6 | 64 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |

### v5 space tokens

[Official reference](https://cdn.jsdelivr.net/npm/@tamagui/themes@2.7.7/src/v5-tokens.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| space.$1 | 2 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$1.5 | 4 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$2 | 7 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$2.5 | 10 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$3 | 13 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$3.5 | 16 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$4 | 18 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$5 | 24 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| space.$6 | 32 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |

### v5 radius tokens

[Official reference](https://cdn.jsdelivr.net/npm/@tamagui/themes@2.7.7/src/v5-tokens.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| radius.0 | 0 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| radius.1 | 3 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| radius.2 | 5 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| radius.3 | 7 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| radius.4 | 9 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| radius.5 | 10 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |
| radius.6 | 16 | Actual v5 configuration value. The same numeric token label has a different meaning in size, space and radius; do not treat $4 as a universal pixel value. |

### light_blue semantic theme

[Official reference](https://cdn.jsdelivr.net/npm/@tamagui/themes@2.7.7/src/generated-v5.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| light_blue.background | hsla(207, 100%, 98%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| light_blue.backgroundHover | hsla(210, 100%, 99%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| light_blue.backgroundPress | hsla(205, 92%, 95%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| light_blue.color | hsla(216, 71%, 23%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| light_blue.borderColor | hsla(203, 100%, 92%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| light_blue.borderColorFocus | hsla(203, 100%, 92%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| light_blue.placeholderColor | hsla(206, 100%, 50%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |

### dark_blue semantic theme

[Official reference](https://cdn.jsdelivr.net/npm/@tamagui/themes@2.7.7/src/generated-v5.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| dark_blue.background | hsla(218, 39%, 11%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| dark_blue.backgroundHover | hsla(212, 69%, 16%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| dark_blue.backgroundPress | hsla(215, 42%, 9%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| dark_blue.color | hsla(205, 100%, 88%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| dark_blue.borderColor | hsla(209, 100%, 19%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| dark_blue.borderColorFocus | hsla(209, 100%, 19%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |
| dark_blue.placeholderColor | hsla(206, 100%, 50%, 1) | Resolved semantic role from the v5 blue theme. The component may select a more specific child theme for its hover, press or active state. |

### System-font roles

[Official reference](https://cdn.jsdelivr.net/npm/@tamagui/config@2.7.7/src/v5-fonts.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| body.family | -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif | The v5 system stack requires no remote font request. |
| body.$2 | 13px / 20px | Size and line-height are paired font roles, independent of the component size token with the same label. |
| body.$3 | 14px / 21px | Size and line-height are paired font roles, independent of the component size token with the same label. |
| body.$4 | 15px / 23px | Size and line-height are paired font roles, independent of the component size token with the same label. |
| body.$5 | 16px / 24px | Size and line-height are paired font roles, independent of the component size token with the same label. |
| body.$6 | 18px / 27px | Size and line-height are paired font roles, independent of the component size token with the same label. |
| body.$8 | 26px / 38px | Size and line-height are paired font roles, independent of the component size token with the same label. |

### Native composition contracts

[Official reference](https://tamagui.dev/docs/core/configuration)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| createTamagui | defaultConfig from @tamagui/config/v5 | One configuration instance outside React; getCSS() supplies web theme CSS. |
| TamaguiProvider | config + defaultTheme | The application chooses light or dark while preserving board state. |
| Theme | name="blue" | Resolves the blue child theme of the current appearance. |
| Checkbox | checked + onCheckedChange | The board treats only value === true as complete; indeterminate is not completion. |
| Input | value + onChangeText | Controlled draft, trim validation and explicit duplicate handling. |
| Progress | value from 0 to 100 | The indicator is derived from complete count divided by all rows. |
| YStack / XStack | directional layout with token gap | Keep the reading layout responsive without a separate imitation stylesheet. |

## Tamagui Design System Versioned Configuration and CSS

### Use the named v5 preset

This example pins tamagui and @tamagui/config to 2.7.7 and imports defaultConfig from @tamagui/config/v5. The configuration name is v5; it is not the npm package major version. Mixing those two numbers would give a reader the wrong installation command. createTamagui runs once outside the component, and its generated CSS is inserted before the board renders so theme variables and native styles have a real web definition.

### Make the small configuration override explicit

The supplied source sets onlyAllowShorthands to false because this teaching example uses readable long-form properties such as padding and backgroundColor. That is an application choice on top of the preset. The v5 base does not bundle an animation driver, and this example does not invent one or claim animated transitions. The simple progress and checkbox behavior works without adding a separate animation dependency.

## Tamagui Design System Size, Space and Radius Tokens

### Do not confuse identical token labels

In the pinned v5 configuration, size $4 is 44, space $4 is 18 and radius 4 is 9. A component size, a layout gap and a corner radius therefore cannot be converted by one shared multiplication rule. The reference lists each category separately and the example consumes those category-aware values through actual Tamagui props. This is more useful than a list of generic 4px increments that the configuration does not use.

- size.$4 = 44
- space.$4 = 18
- radius.4 = 9
- body font $4 = 15px with 23px line-height

### Keep the type scale separate too

The body font $4 is 15px with a 23px line-height, while the component size $4 remains 44. The system font stack is supplied by v5 and requires no downloaded face. H1, H2 and Text receive their native font contexts; explicit fontSize and lineHeight values in the source determine the original board’s hierarchy. The 880px outer width is a local layout choice, not a global Tamagui token.

## Tamagui Design System Semantic Themes and Appearance

### Compose light or dark with a blue child

TamaguiProvider receives the chosen defaultTheme and Theme name="blue" resolves a corresponding child theme. The source uses background, backgroundHover, color and borderColor roles instead of repeating literal hex values throughout the component tree. The table records actual light_blue and dark_blue values so a reader can compare the resolved configuration rather than assume one fixed brand palette.

### Preserve board state across appearance changes

The dark flag is independent of the rows, input draft and filter. Switching appearance updates the native components while leaving the board intact. Buttons and checkboxes can select their own component child-theme values, so their computed color need not be identical to the parent background token. Inspect the rendered state before flattening the hierarchy into custom CSS.

## Tamagui Design System Checkboxes and Derived Progress

### Keep completion in one row collection

Each row has a stable ID, readable text and a done boolean. Checkbox receives checked and onCheckedChange; only the literal true value marks it complete. Checkbox.Indicator provides the checked mark. The adjacent text and accessible name identify the same habit, while the strike-through repeats the completed state visually. The source does not create a separate count that can fall out of sync with the rows.

### Calculate progress from the whole board

The completed count is calculated from all rows, then converted to a percentage for Progress. Filtering unfinished items changes only what is shown, not the denominator. This prevents the progress bar from resetting when completed rows disappear from view. The count also appears as readable text in a polite live region, so the percentage is not communicated only by bar length.

## Tamagui Design System Draft Validation and Duplicate Recovery

### Add a real controlled input

Input holds the current draft through value and onChangeText. The Add habit action trims it and rejects an empty value with a visible message, aria-invalid and an error description. Focus returns to the input after empty submission. A case-insensitive duplicate check prevents a second row with the same text and leaves the draft available for correction. These rules belong to the original board, not the library itself.

### Update the board only after a valid addition

A valid draft adds a new incomplete row, clears the input and removes the error. The progress denominator changes immediately because it is derived from the new collection. Adding a habit does not register a reminder or create an account. The board is deliberately held in local React state and a document reload returns to the sample.

## Tamagui Design System Filtered Views and Empty Recovery

### Make the filter describe its scope

Show unfinished only hides completed rows while retaining them in the collection. When nothing remains in that view, a written empty state explains that the full list still exists and provides a direct return action. This is a meaningful empty state produced by the user’s choices, rather than a decorative toggle that swaps arbitrary placeholder cards.

### Keep reset distinct from appearance

Reset sample board restores the initial three rows, clears the draft and error, and returns to the full list. It does not change the current appearance. Because each change is explicit state, a reset does not require reloading the document or discarding the configured provider. Theme and content recovery remain independently testable.

## Tamagui Design System Responsive Stacks and Accessible Reading

### Let stack content determine height

YStack lays out the main reading flow and XStack aligns the heading controls, checkbox rows and actions. The control groups wrap rather than forcing a fixed desktop width. The outer container is at most 880px and uses the real space $4 token for padding. Each row allows its text to shrink and wrap, while controls remain available at 280px as well as larger test widths.

### Test the interaction after reflow

The browser check adds a habit, marks it complete, filters the list and switches appearance before measuring overflow. A screenshot of the initial layout alone would not reveal whether an error, long label or filtered state breaks the narrow composition. Native checkbox semantics and visible text were exercised alongside the derived progress, rather than counted as present and assumed to work.

## Tamagui Design System Complete Browser Build

### Supply the provider, CSS and build definitions

The three supplied files are sufficient for the local web study. The JSX includes the provider, one configuration, generated theme CSS and the entire board. build.mjs pins the web target and production environment and supplies an empty process.env fallback for other browser-only environment reads. Without that last definition, this plain bundle can fail with process is not defined even though it compiles.

1. Save tamagui.jsx, build.mjs and index.html together.
2. Install the pinned React and Tamagui packages.
3. Build and serve the local directory.
4. Test empty and duplicate additions, completion, filters, theme and reset.

### Keep native and web adoption separate

The example is a browser composition of actual Tamagui components. It does not prove a native build, navigation integration or platform-specific input behavior. A production application should adopt its chosen framework’s supported setup and evaluate extraction, server rendering and animation needs separately. The concrete local bundle remains a complete way to inspect the theme and state contracts shown here.

## Component Examples

### tamagui.jsx

Configuration, generated CSS, native components and complete board state.

```jsx
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{createTamagui,TamaguiProvider,Theme,YStack,XStack,Text,H1,H2,Button,Input,Checkbox,Progress,Separator}from'tamagui';import{defaultConfig}from'@tamagui/config/v5';
const config=createTamagui({...defaultConfig,settings:{...defaultConfig.settings,onlyAllowShorthands:false}});const sheet=document.createElement('style');sheet.textContent=config.getCSS();document.head.append(sheet);
const initial=[{id:1,text:'Read ten pages',done:false},{id:2,text:'Step outside for a break',done:true},{id:3,text:'Write one useful note',done:false}];
function App(){const[dark,setDark]=useState(false),[rows,setRows]=useState(initial),[draft,setDraft]=useState(''),[error,setError]=useState(''),[filter,setFilter]=useState(false);const done=rows.filter(x=>x.done).length;let shown=rows.filter(x=>!filter||!x.done);function add(){let text=draft.trim();if(!text){setError('Write a small habit before adding it.');document.querySelector('#habit-input')?.focus();return}if(rows.some(x=>x.text.toLowerCase()===text.toLowerCase())){setError('That habit is already in this list.');return}setRows([...rows,{id:Date.now(),text,done:false}]);setDraft('');setError('')}return <TamaguiProvider config={config} defaultTheme={dark?'dark':'light'}><Theme name="blue"><YStack backgroundColor="$background" color="$color" padding="$4" gap="$4" maxWidth={880} margin="auto" width="100%" minHeight={0}><XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3"><Text fontSize="$2" fontWeight="700">TAMAGUI / ORIGINAL HABIT BOARD</Text><Button size="$3" onPress={()=>setDark(!dark)}>{dark?'Light appearance':'Dark appearance'}</Button></XStack><H1 fontSize="$8" lineHeight="$8">A little progress, every day.</H1><Text fontSize="$4" lineHeight="$5">A local board built with Tamagui 2.7.7 and its v5 blue theme. Your changes stay in this page; no account or daily reminder is connected.</Text><YStack backgroundColor="$backgroundHover" borderWidth={1} borderColor="$borderColor" borderRadius="$4" padding="$4" gap="$3"><XStack justifyContent="space-between" gap="$3" flexWrap="wrap"><H2 fontSize="$5">Today’s small steps</H2><Text id="progress-count" aria-live="polite">{done} of {rows.length} complete</Text></XStack><Progress value={rows.length?done/rows.length*100:0} size="$2" aria-label="Completed habits"><Progress.Indicator animation={undefined}/></Progress><Button size="$3" alignSelf="flex-start" onPress={()=>setFilter(!filter)}>{filter?'Show all habits':'Show unfinished only'}</Button><Separator/>{shown.length?shown.map(row=><XStack key={row.id} gap="$3" alignItems="center" paddingVertical="$2"><Checkbox id={'habit-'+row.id} checked={row.done} onCheckedChange={value=>setRows(rows.map(x=>x.id===row.id?{...x,done:value===true}:x))} aria-label={row.text} size="$4"><Checkbox.Indicator><Text fontWeight="700">✓</Text></Checkbox.Indicator></Checkbox><Text flex={1} fontSize="$4" lineHeight="$5" textDecorationLine={row.done?'line-through':'none'} opacity={row.done?.65:1}>{row.text}</Text></XStack>):<YStack gap="$3"><Text fontWeight="700">Nothing unfinished in this view</Text><Text>All your habits remain in the full list. You can revisit any completed item.</Text><Button onPress={()=>setFilter(false)}>Return to all habits</Button></YStack>}</YStack><YStack gap="$3"><Text htmlFor="habit-input" tag="label" fontWeight="700">Add one small habit</Text><Input id="habit-input" value={draft} onChangeText={v=>{setDraft(v);setError('')}} placeholder="For example, stretch for five minutes" aria-describedby={error?'habit-error':undefined} aria-invalid={!!error} onKeyPress={e=>{if(e.nativeEvent.key==='Enter')add()}}/><Text id="habit-error" color="$color" aria-live="polite">{error}</Text><XStack gap="$3" flexWrap="wrap"><Button theme="active" onPress={add}>Add habit</Button><Button onPress={()=>{setRows(initial);setDraft('');setError('');setFilter(false)}}>Reset sample board</Button></XStack></YStack><Text fontSize="$2" lineHeight="$3">Native Checkbox, Input, Button and Progress components; original board content and state. Theme changes preserve the current board.</Text></YStack></Theme></TamaguiProvider>}
createRoot(document.getElementById('root')).render(<App/>);

```

[Code reference](https://tamagui.dev/docs/core/configuration)

- Use these three complete files together.

### build.mjs

Browser environment definitions used by the tested bundle.

```javascript
import {build} from 'esbuild';
await build({entryPoints:['tamagui.jsx'],bundle:true,minify:true,outfile:'tamagui.bundle.js',define:{'process.env.NODE_ENV':'"production"','process.env.TAMAGUI_TARGET':'"web"','process.env':'{}'}});

```

[Code reference](https://tamagui.dev/docs/core/configuration)

- Use these three complete files together.

### index.html

Standalone root document and bundle import.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Small habits board</title><style>body{margin:0}*{box-sizing:border-box}button,input{max-width:100%}</style></head><body><div id="root"></div><script src="./tamagui.bundle.js"></script></body></html>
```

[Code reference](https://tamagui.dev/docs/core/configuration)

- Use these three complete files together.

## Implementation Starting Point

Save the supplied files first and open http://localhost:8000/. This setup intentionally targets the browser.

```sh
npm init -y
npm install react@19.2.0 react-dom@19.2.0 tamagui@2.7.7 @tamagui/config@2.7.7
npm install --save-dev esbuild
node build.mjs
python3 -m http.server 8000
```

## Agent Prompt

Implement the complete Tamagui 2.7.7 web habit board with the v5 preset. Keep size, space, radius and font token categories distinct; preserve generated theme CSS, light/dark blue child themes, controlled checkboxes, trim and duplicate validation, all-row progress denominator, unfinished-view recovery and reset without changing appearance.

## Sources

- [Configuration](https://tamagui.dev/docs/core/configuration) — Provider, preset and configuration responsibilities.
- [Tokens](https://tamagui.dev/docs/core/tokens) — Category-aware token resolution.
- [Checkbox](https://tamagui.dev/ui/checkbox) — Controlled state and indicator anatomy.
- [Progress](https://tamagui.dev/ui/progress) — Progress value and indicator composition.
- [Official installation](https://tamagui.dev/docs/intro/installation) — Framework and platform setup options.
