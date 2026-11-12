# React Native Elements Design System — OpenDesign Application Guide

Build a complete focus-plan composer with React Native Elements 5.0.0: real theme roles, controlled inputs and selections, validation, local confirmation and a tested web build.

Actual RNEUI 5.0.0 components rendered through React Native Web. Original OpenDesign plan content and state; no native-device, timer or notification behavior is claimed.

## Source Reference

- **Components:** RNEUI 5.0.0 ([source](https://reactnativeelements.com/docs/installation))
- **Web renderer:** React Native Web 0.21.3 ([source](https://github.com/necolas/react-native-web))
- **Default spacing:** 2 / 4 / 8 / 12 / 24 ([source](https://cdn.jsdelivr.net/npm/@rneui/base@5.0.0/dist/helpers/index.js))


## Design Reference

Pinned RNEUI source defaults, public component APIs and explicitly identified application choices.

### Light theme colors

[Official reference](https://cdn.jsdelivr.net/npm/@rneui/base@5.0.0/dist/helpers/colors.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| lightColors.primary | #2089dc | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.secondary | #ad1457 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.background | #ffffff | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.black | #242424 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.white | #ffffff | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.grey1 | #43484d | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.grey2 | #5e6977 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.grey5 | #e1e8ee | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.success | #52c41a | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.error | #ff190c | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| lightColors.warning | #faad14 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |

### Dark theme colors

[Official reference](https://cdn.jsdelivr.net/npm/@rneui/base@5.0.0/dist/helpers/colors.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| darkColors.primary | #439ce0 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.secondary | #aa49eb | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.background | #080808 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.black | #f2f2f2 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.white | #080808 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.grey1 | #bdc6cf | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.grey2 | #86939e | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.grey5 | #393e42 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.success | #439946 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.error | #bf2c24 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |
| darkColors.warning | #cfbe27 | Actual RNEUI theme value. Roles such as black/white reverse their visual meaning in dark mode; use the active theme rather than hard-coded literal colors. |

### Default spacing and explicit application choices

[Official reference](https://cdn.jsdelivr.net/npm/@rneui/base@5.0.0/dist/helpers/index.js)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| spacing.xs | 2 | Published default spacing entry; these names form a theme object, not CSS variable tokens. |
| spacing.sm | 4 | Published default spacing entry; these names form a theme object, not CSS variable tokens. |
| spacing.md | 8 | Published default spacing entry; these names form a theme object, not CSS variable tokens. |
| spacing.lg | 12 | Published default spacing entry; these names form a theme object, not CSS variable tokens. |
| spacing.xl | 24 | Published default spacing entry; these names form a theme object, not CSS variable tokens. |
| Sample heading | 32px / weight 700 | Original sample choice, explicitly configured in the supplied source rather than represented as an official global type or radius token. |
| Sample body | 15px / 23px line height | Original sample choice, explicitly configured in the supplied source rather than represented as an official global type or radius token. |
| Sample cards | 24px padding / 8px radius | Original sample choice, explicitly configured in the supplied source rather than represented as an official global type or radius token. |
| Button component default | radius: 6 | Original sample choice, explicitly configured in the supplied source rather than represented as an official global type or radius token. |

### Component and provider contracts

[Official reference](https://reactnativeelements.com/docs/customization/themeprovider)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| createTheme | mode, components, lightColors, darkColors | ThemeProvider receives the constructed object; defaults remain available when only components are changed. |
| useTheme | theme, updateTheme | The appearance action changes mode without resetting application state. |
| Input | value, onChangeText, errorMessage, ref | The empty-task error is visible and focus returns to the actual input. |
| ButtonGroup | buttons, selectedIndex, onPress | The controlled index selects 15, 25 or 45 minutes; it is not the duration itself. |
| Switch | value, onValueChange | The controlled boolean changes the break description. |
| Card | Card.Title, Card.Divider | Structured surfaces inherit the selected theme. |
| Button | title, onPress, type | The save action validates local state; reset restores defaults. |
| SafeAreaProvider | Outer application provider | Required integration context; web success does not prove native device safe-area behavior. |

## React Native Elements Design System Runtime and Web Scope

### Run the actual themed components

This example uses @rneui/themed and @rneui/base at 5.0.0, React 19.2.0 and React Native Web 0.21.3. The browser build aliases react-native to react-native-web and selects .web.js modules before generic JavaScript. These are actual library components rendered for the web, not HTML boxes imitating a mobile screenshot. The supplied build file includes that resolution choice so the standalone code reproduces the preview.

### Keep web and native evidence separate

The composition is a focus-plan editor, not a running timer or notification manager. SafeAreaProvider wraps the application as required by the integration, but this browser test does not validate iOS or Android insets, native keyboard behavior or device notification permissions. A native project needs its platform build and device checks in addition to these shared component examples.

- Web rendering uses React Native Web.
- The plan is held only in local React state.
- No timer, system notification or backend save is started.

## React Native Elements Design System Theme Objects and Colors

### Use the active theme roles

createTheme merges the built-in light and dark colors with any explicit overrides. The example changes only component defaults and mode. useTheme supplies the resolved colors to the surrounding View and Text elements, so the large title, descriptions and panels follow the selected appearance. In dark mode, black means the light foreground role and white means a dark surface role; treating those names as literal color values would break the theme.

### Do not invent a universal typography scale

RNEUI provides component defaults and customization hooks rather than the same token model as a CSS design system. The reference therefore separates actual defaultSpacing entries from the sample’s 32px heading, 15px body copy and 8px card radius. Those dimensions are original composition settings visible in the code. They should not be described as mandatory React Native Elements brand rules.

## React Native Elements Design System Input Validation and Focus

### Control the task text explicitly

Input receives a value and onChangeText callback. The keep action trims the value before deciding whether it is empty. If it is empty, errorMessage displays a concrete request and the component ref returns focus to the input. Changing the text clears the previous error and invalidates the local confirmation, preventing a stale saved message from describing an edited plan.

### Use the label and error together

The visible Focus task label and accessibilityLabel name the same control. The placeholder suggests content but does not replace the label. Validation is triggered by the explicit keep action rather than on every keystroke. The user retains the draft after an error, and no asynchronous saving animation implies a server request that never occurs.

## React Native Elements Design System Controlled Selection

### Separate the selected index from the duration

ButtonGroup receives three labels, selectedIndex and onPress. Its returned index selects from the original [15, 25, 45] minute list; passing that index directly as a minute count would be an application bug. The preview’s large numeric summary is derived from the same selected index so the segmented control and the readable plan cannot disagree.

### Make the break choice a real boolean

Switch receives value and onValueChange, with an accessible name describing the setting. The summary changes between a short pause and no break reminder. This is a plan preference only: the interface does not register a system reminder or schedule a notification. The wording of the keep confirmation repeats that local scope.

## React Native Elements Design System State Preservation and Reset

### Keep theme independent of the plan

Changing appearance calls updateTheme with the opposite mode. The task, selected duration, break setting and local confirmation remain application state outside that update. The native components receive the new theme without reconstructing the plan. The browser check changes appearance after entering a custom task to verify that visual mode is not accidentally coupled to resetting data.

### Use one explicit recovery action

Reset the plan restores the sample task, 25-minute duration and enabled break, clears the validation error and removes the confirmation. It preserves the selected appearance. This separates content reset from theme preference and avoids a surprising full-page reload. The example contains no persistence layer, so reopening the document starts from the initial sample.

## React Native Elements Design System Responsive Composition

### Adapt the two-card arrangement

The content uses useWindowDimensions to choose a row above 700px and a column at narrower widths. Each Card has zero outside margin so the composition’s 24px gap controls the alignment. At widths below 500px the outer padding reduces to 16px. The two cards present an editable plan and a derived summary rather than repeated decorative placeholders.

### Inspect the component defaults in both themes

RNEUI component internals may use their own default styles in addition to global colors. For example, the unselected ButtonGroup segments retain their native surface treatment in this example. A product requiring a different contrast or visual density can supply buttonStyle and selectedButtonStyle explicitly, but that decision should be tested rather than attributed to automatic global theming.

## React Native Elements Design System Complete Browser Setup

### Include the web resolution and asset loaders

The supplied build.mjs uses esbuild with JSX parsing for JavaScript dependencies, react-native-web aliasing, .web.js priority and data loaders for packaged PNG and TTF assets. The package entry includes exports that reference those assets even when the visible composition has no icon. The build therefore cannot be replaced with a plain browser import of the unprocessed source.

### Test the whole local interaction

Save the provided source as rne.jsx and the HTML as index.html, install the pinned packages, run the build and serve the directory. Test an empty task, a custom task, a different duration, the break switch, appearance and reset. This proves the supplied composition; it does not automatically validate every exported RNEUI component or every native platform.

1. Keep the three supplied files in one directory.
2. Install the pinned dependencies and run node build.mjs.
3. Serve the generated bundle with index.html.
4. Exercise empty, edited, themed and reset states.

## Component Examples

### rne.jsx

Complete provider, native components and application state.

```jsx
import React,{useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {View,Text,useWindowDimensions} from 'react-native';
import {ThemeProvider,createTheme,Button,ButtonGroup,Input,Switch,Card,Divider,useTheme} from '@rneui/themed';
import {SafeAreaProvider} from 'react-native-safe-area-context';
const theme=createTheme({mode:'light',components:{Button:{radius:6},Input:{containerStyle:{paddingHorizontal:0}}}});
function App(){const {theme,updateTheme}=useTheme();const {width}=useWindowDimensions();const [title,setTitle]=useState('Read a chapter'),[duration,setDuration]=useState(1),[breaks,setBreaks]=useState(true),[error,setError]=useState(false),[saved,setSaved]=useState('');const input=useRef(null);let c=theme.colors;function changed(){setSaved('')}function save(){if(!title.trim()){setError(true);input.current?.focus();return;}setError(false);setSaved(`${title.trim()} · ${[15,25,45][duration]} minutes · ${breaks?'with a short break':'no break reminder'}. Kept in this preview only.`)}return <View style={{backgroundColor:c.background,padding:width<500?16:32,maxWidth:1000,width:'100%',alignSelf:'center'}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:24,flexWrap:'wrap',marginBottom:24}}><View style={{flexShrink:1}}><Text style={{color:c.primary,fontSize:13,fontWeight:'700'}}>REACT NATIVE ELEMENTS · WEB STUDY</Text><Text accessibilityRole="header" style={{fontSize:32,fontWeight:'700',color:c.black,marginTop:12}}>Make room for one thing</Text></View><Button title={theme.mode==='light'?'Use dark theme':'Use light theme'} type="outline" onPress={()=>updateTheme({mode:theme.mode==='light'?'dark':'light'})}/></View><Text style={{color:c.grey1,fontSize:15,lineHeight:23}}>An original focus-plan composer using RNEUI 5.0.0 through React Native Web. No timer or system notification is started.</Text><View style={{flexDirection:width>700?'row':'column',gap:24,marginTop:24}}><Card containerStyle={{flex:1,margin:0,padding:24,borderRadius:8}}><Card.Title>Shape your focus block</Card.Title><Card.Divider/><Input ref={input} label="Focus task" accessibilityLabel="Focus task" value={title} onChangeText={v=>{setTitle(v);setError(false);changed()}} errorMessage={error?'Enter a task before keeping this plan.':''} placeholder="What deserves your attention?"/><Text style={{fontSize:16,fontWeight:'700',color:c.grey1,marginBottom:8}}>Duration</Text><ButtonGroup buttons={['15 min','25 min','45 min']} selectedIndex={duration} onPress={i=>{setDuration(i);changed()}} containerStyle={{marginHorizontal:0,height:48,marginBottom:24}}/><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:16,marginBottom:24}}><Text style={{fontSize:16,color:c.black,flexShrink:1}}>Include a short break</Text><Switch value={breaks} onValueChange={v=>{setBreaks(v);changed()}} accessibilityLabel="Include a short break"/></View><Button title="Keep this plan" onPress={save}/></Card><Card containerStyle={{flex:1,margin:0,padding:24,borderRadius:8}}><Card.Title>Your local plan</Card.Title><Card.Divider/><Text style={{fontSize:48,fontWeight:'700',color:c.primary}}>{[15,25,45][duration]}</Text><Text style={{fontSize:16,color:c.grey1,marginBottom:24}}>minutes for {title.trim()||'your next task'}</Text><Divider/><Text style={{color:c.black,fontSize:16,lineHeight:25,marginVertical:24}}>{breaks?'Finish with a pause before choosing what comes next.':'Keep the end of this block open; no break reminder is included.'}</Text><Text style={{fontSize:13,lineHeight:21,color:c.grey2}}>The duration, task and break choice are original application state. Theme colors, Input, ButtonGroup, Switch, Card and Button come from the installed library.</Text></Card></View><Text accessibilityLiveRegion="polite" style={{color:c.black,fontSize:15,lineHeight:23,marginTop:24}}>{saved}</Text><Button title="Reset the plan" type="clear" onPress={()=>{setTitle('Read a chapter');setDuration(1);setBreaks(true);setError(false);setSaved('');}} containerStyle={{alignSelf:'flex-start',marginTop:8}}/></View>}
createRoot(document.getElementById('root')).render(<SafeAreaProvider><ThemeProvider theme={theme}><App/></ThemeProvider></SafeAreaProvider>);

```

[Code reference](https://reactnativeelements.com/docs/installation)

- Use all three files together with the pinned setup.

### build.mjs

Actual browser bundle configuration, including web module priority.

```javascript
import {build} from 'esbuild';
await build({entryPoints:['rne.jsx'],bundle:true,minify:true,outfile:'rne.bundle.js',alias:{'react-native':'react-native-web'},resolveExtensions:['.web.js','.js','.jsx','.json'],loader:{'.js':'jsx','.ttf':'dataurl','.png':'dataurl'},define:{'process.env.NODE_ENV':'"production"'}});

```

[Code reference](https://reactnativeelements.com/docs/installation)

- Use all three files together with the pinned setup.

### index.html

Complete root document loading the generated bundle.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Focus plan composer</title><style>body{margin:0;background:#f4f7fa}*{box-sizing:border-box}input:focus-visible,[role=button]:focus-visible{outline:2px solid #2089dc;outline-offset:3px}</style></head><body><div id="root"></div><script src="./rne.bundle.js"></script></body></html>
```

[Code reference](https://reactnativeelements.com/docs/installation)

- Use all three files together with the pinned setup.

## Implementation Starting Point

Save the supplied rne.jsx, build.mjs and index.html first. This is the verified browser build, not native app setup.

```sh
npm init -y
npm install react@19.2.0 react-dom@19.2.0 @rneui/themed@5.0.0 @rneui/base@5.0.0 react-native-web@0.21.3 react-native-safe-area-context@5.10.1 react-native-vector-icons@10.3.0 --legacy-peer-deps
npm install --save-dev esbuild
node build.mjs
python3 -m http.server 8000
```

## Agent Prompt

Build the supplied RNEUI 5.0.0 focus-plan composer using the full browser build and providers. Preserve controlled index-to-duration mapping, trim validation and focus, local-only confirmation, theme-independent plan state and explicit reset. Keep native device capabilities outside this web example.

## Sources

- [Installation](https://reactnativeelements.com/docs/installation) — Native peers and browser integration context.
- [Theme provider](https://reactnativeelements.com/docs/customization/themeprovider) — Theme objects and updates.
- [ButtonGroup](https://reactnativeelements.com/docs/components/buttongroup) — Controlled selection and style props.
- [Input](https://reactnativeelements.com/docs/components/input) — Labels, errors and input methods.
- [Switch](https://reactnativeelements.com/docs/components/switch) — Controlled boolean choice.
