# Adobe Spectrum Design System — OpenDesign Application Guide

Study React Spectrum v3 through a selectable creative-asset table and an export-preset inspector. Understand Provider themes and input scale, supported style props, keyed collections, and the boundary between v3 and the newer Spectrum 2 implementation.

OpenDesign implementation study of the maintained React Spectrum v3 documentation, using @adobe/react-spectrum. Spectrum 2 is also available and has different APIs; this page does not label v3 as the newest implementation. The standalone asset-board preview is an original HTML/CSS interpretation with illustrative artwork and application-selected colors, not a native Spectrum component or color-managed image editor.

## Source Reference

- **Chosen implementation:** React Spectrum v3 uses @adobe/react-spectrum; Spectrum 2 is a separate migration target. ([source](https://react-spectrum.adobe.com/migrating))
- **Root setup:** Provider requires a theme such as defaultTheme. ([source](https://react-spectrum.adobe.com/v3/Provider.html))
- **Input adaptation:** Medium and large scales address pointer characteristics. ([source](https://react-spectrum.adobe.com/v3/theming.html))
- **Collection identity:** Controlled table selection is expressed as keys. ([source](https://react-spectrum.adobe.com/v3/TableView.html))
- **Layout customization:** Supported style props control external layout; internal component styling is deliberately constrained. ([source](https://react-spectrum.adobe.com/v3/styling.html))
- **Format selection:** Picker accepts selectedKey and onSelectionChange. ([source](https://react-spectrum.adobe.com/v3/Picker.html))


## Design Reference

React Spectrum v3 APIs and dimension mappings. The numeric dimension column records the base conversion in Adobe’s migration table; scale-sensitive size-* values can adapt for touch. This is not a Spectrum 2 token export. Preview colors and custom artwork are application choices.

### Provider and theme configuration

[Official reference](https://react-spectrum.adobe.com/v3/Provider.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| theme | defaultTheme | Required root theme object imported from @adobe/react-spectrum. |
| colorScheme | light \| dark | Explicit override of operating-system preference. |
| scale | medium \| large | Fine-pointer versus coarse-pointer scale; normally let Provider choose. |
| locale | BCP 47 language tag | Locale and writing-direction context. |
| breakpoints | custom name → pixel width | This guide sets tablet: 640 and desktop: 1024 explicitly, avoiding conflicting defaults in the reference page. |
| isDisabled / isReadOnly | boolean group defaults | Nested providers and individual props can override group behavior. |

### Base dimension mappings

[Official reference](https://react-spectrum.adobe.com/migrating)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| size-50 | 4px base | Small separation. |
| size-100 | 8px base | Related controls. |
| size-150 | 12px base | Toolbar gap. |
| size-200 | 16px base | Inspector group gap. |
| size-250 | 20px base | Intermediate spacing. |
| size-300 | 24px base | Panel inset. |
| size-400 | 32px base | Larger grouping. |
| size-500 | 40px base | Section separation. |
| size-600 | 48px base | Large structure. |
| size-1000 | 80px base | Fixed-size illustration region. |
| size-2400 | 192px base | Example inspector width. |
| size-6000 | 480px base | Large bounded surface. |

### Style props and adaptive values

[Official reference](https://react-spectrum.adobe.com/v3/styling.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| marginStart / marginEnd | DimensionValue | Logical spacing; prefer over left/right for writing-direction support. |
| padding / backgroundColor | View style props | Build a custom outer surface rather than overriding native control internals. |
| width | size-* \| CSS length \| calc(...) | Example: calc(100% - size-2000). |
| responsive value | {base: value, tablet: value} | Keys match the explicit Provider breakpoints. |
| UNSAFE_style / UNSAFE_className | last-resort escape hatch | Do not rely on private component DOM or styles. |
| single-line-height | 32 base mapping | Use the semantic dimension rather than claiming all controls are always 32px. |

### Collection selection contract

[Official reference](https://react-spectrum.adobe.com/v3/TableView.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| selectionMode | none \| single \| multiple | The sample uses multiple for a batch. |
| selectedKeys | Set of row keys \| all | Controlled state must handle the all sentinel. |
| onSelectionChange | callback with selection | Do not interpret selection as approval or export success. |
| disallowEmptySelection | boolean | Useful for required single selection; omitted for optional export batches. |
| TableHeader → Column | column anatomy | Give columns stable keys for dynamic rendering. |
| TableBody → Row → Cell | row anatomy | Record ids establish stable collection identity. |

### Picker and text composition

[Official reference](https://react-spectrum.adobe.com/v3/Picker.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| label | persistent text | Name the export format selector. |
| selectedKey | one item key | Controlled format such as png or jpeg. |
| onSelectionChange | key callback | Different contract from a DOM event handler. |
| Item key | stable key | Value identity independent of visible label. |
| Heading level | 1–6 | Semantic heading level; native styling follows context. |
| Button onPress | press callback | Cross-input activation instead of a custom mouse-only action. |

## Adobe Spectrum Design System Choose v3 deliberately; do not mix Spectrum generations

### What this example installs

Adobe now documents Spectrum 2 alongside the v3 library. This page chooses @adobe/react-spectrum@3 because its Provider, collection and style-prop contracts form a complete, documented asset-review example. A v3 recipe is useful for an existing v3 application, but it should not be described as the newest Spectrum implementation. New adoption decisions should inspect the linked migration reference before choosing a generation.

The practical difference is visible in the code. v3 passes size-300 through style props and supplies defaultTheme to Provider. The migration guide maps these conventions into a different styling API. Replacing only the package name would not migrate the example; component imports, styling and supported properties must be reviewed together.

[Supporting specification](https://react-spectrum.adobe.com/migrating)

## Adobe Spectrum Design System Provider coordinates appearance, scale and locale

### One root, several independent settings

Provider establishes the environment consumed by the table, picker and button. The theme object carries color-scheme and scale definitions. colorScheme can override the operating-system preference, while scale addresses input characteristics. These are separate settings: a dark desktop surface does not require large touch targets, and a light touch screen should not inherit a dense mouse layout accidentally.

Leave scale automatic for ordinary production use. In a component study, explicitly choosing medium or large can help compare the controls, but it should be described as an inspection setting. locale sets language context rather than translating your project data. Campaign names, review notes and recipe labels remain application content.

[Supporting specification](https://react-spectrum.adobe.com/v3/theming.html)

## Adobe Spectrum Design System Use supported dimensions and external layout props

### A named scale is more than a pixel shorthand

The base size-100 mapping is 8, size-200 is 16 and size-300 is 24. The reference table includes useful additional steps. A size-* dimension can adapt with platform scale; a static-size-* value intentionally does not. Keep that distinction when sizing an inspector or an interaction target. Copying every resolved desktop value into CSS would discard the adaptation that the component environment supplies.

Flex and View give the example a stable outer structure without rewriting TableView internals. The table can grow with flex and shrink with minWidth={0}; the inspector stacks at base and becomes bounded at the explicit tablet breakpoint. Padding belongs on the View that owns the surface. The documentation discourages overriding internal colors, borders and typography through unsafe escape hatches.

[Supporting specification](https://react-spectrum.adobe.com/v3/styling.html)

## Adobe Spectrum Design System Let the theme own native color and typography

### Separate a specimen palette from a token export

The preview has a restrained gray canvas, neutral controls and original colorful artwork. Those illustration colors are not certified Spectrum token values. In the native example, supported components obtain their appearance from defaultTheme. A custom native surface should use the documented backgroundColor values rather than assuming that one sampled hex works in both schemes.

Heading supplies semantic structure as well as a Spectrum presentation in its context. The page title uses level={1}; Text supplies ordinary content such as the selection count. The custom HTML preview uses an application-selected system font fallback and type sizes. It is a demonstration of the workflow and relative hierarchy, not a claim that the surrounding OpenDesign font or its illustration typography is the Spectrum font specification.

[Supporting specification](https://react-spectrum.adobe.com/v3/Heading.html)

## Adobe Spectrum Design System A collection table has keys, columns and selection semantics

### Selection is a data contract

The table is built from TableHeader and Column plus TableBody, Row and Cell. Each asset has a stable id. selectedKeys and onSelectionChange make selection controlled, so the export inspector can derive its count from the same state. A user can rename an asset without changing its identity. Using the row position as identity would make selection fragile after reordering.

The selection can be the all sentinel. The setup resolves that to all current assets before creating a recipe. An empty Set remains valid because the batch is optional; disallowEmptySelection is intentionally not enabled. In a remote or paginated application, define what all means for that data source rather than blindly assuming the currently rendered rows are the complete collection.

- Asset identity: stable key used by the collection.
- Inspection: which artwork is shown larger in the standalone specimen.
- Batch selection: which keys appear in the prepared recipe.

[Supporting specification](https://react-spectrum.adobe.com/v3/TableView.html)

## Adobe Spectrum Design System Picker and Button complete the export inspector

### Format is controlled independently from the batch

Picker uses a visible label and stable Item keys. selectedKey is png or jpeg; onSelectionChange supplies the selected key. This differs from reading event.target.value from a native select. The format remains chosen when the batch is cleared, which lets a reviewer adjust selection without rebuilding a preset.

Button uses onPress for activation and isDisabled when there are no selected assets. The native example serializes ids and the format into a local recipe. It does not transform image data, generate a real export file or contact an asset service. This is a useful implementation boundary: the action and its inputs are concrete even though the conversion engine is outside the design system.

[Supporting specification](https://react-spectrum.adobe.com/v3/Picker.html)

## Adobe Spectrum Design System Adapt the composition rather than compressing the art

### Specify the breakpoint contract

This example declares tablet:640 and desktop:1024. That choice is explicit because the Provider page currently has inconsistent defaults between explanatory prose and generated API metadata. Responsive values refer to those exact keys. The inspector is full width at base, then moves beside the flexible table. The application owns those breakpoints; they are not a new universal Spectrum standard.

The standalone illustration uses a large canvas with a side inspector and a thumbnail rail. On a small screen, the inspector moves into normal flow and the artwork keeps its aspect ratio. Text such as dimensions and format is outside the art, so it remains readable and does not alter the artwork being inspected.

[Supporting specification](https://react-spectrum.adobe.com/v3/Provider.html)

## Adobe Spectrum Design System Inspect, select and prepare are different actions

### Make the demonstration testable

Clicking an artwork thumbnail changes the large illustration and its descriptive metadata. A checkbox changes the export batch. Keeping these independent makes it possible to inspect an unselected asset without unintentionally exporting it. The preview reports the selected count and preserves format while the reviewer changes the batch.

The native TableView supplies its collection interaction; the HTML specimen uses ordinary buttons and checkboxes and does not claim to reproduce the full grid keyboard model. Both provide a keyboard route to their demonstrated actions. The recipe result is text, not only a temporary visual effect, so the reviewer can inspect exactly which ids and format were prepared.

[Supporting specification](https://react-spectrum.adobe.com/v3/TableView.html)

## Adobe Spectrum Design System Integrate the native slice before extending the tool

### Connect a real export service at an explicit boundary

Install the v3 suite in an existing React app, then use the full entry below. The example includes provider, imports, collection data, selection state, format state and result state. A production integration would replace recipe preparation with an export request and show the confirmed result per asset. Do not rename the local response to Export complete before that service exists.

When migrating to Spectrum 2, use Adobe’s mappings for dimensions, breakpoints and component changes. Verify selection behavior and format persistence again; a visually similar table can still expose a different contract. Keep the source generation explicit so future contributors do not combine a v3 Provider with incompatible examples.

1. Select one asset and confirm its id appears in the local recipe.
2. Select all, change PNG to JPEG, and inspect the complete selected set.
3. Clear selection and verify that the action disables while the format remains selected.
4. Narrow the viewport and confirm that inspection, selection and recipe output remain reachable.

[Supporting specification](https://react-spectrum.adobe.com/migrating)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Original HTML/CSS interpretation of the documented v3 collection and inspector workflow. Palette and artwork are illustrative; no native Spectrum runtime or image conversion.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Spectrum asset inspector study</title><style>*{box-sizing:border-box}body{margin:0;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2c2c2c;background:#f5f5f5}button,input,select{font:inherit}button{cursor:pointer;border:1px solid #999;border-radius:16px;background:white;color:inherit;padding:5px 16px;font-weight:600}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #1473e6;outline-offset:3px}button:disabled{opacity:.45;cursor:not-allowed}header{padding:16px 24px;background:white;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;gap:16px;align-items:center}header b{font-size:16px}header span{font-size:12px;color:#666}.workspace{display:grid;grid-template-columns:160px minmax(0,1fr) 230px;min-height:540px}.rail{padding:20px 16px;border-right:1px solid #ddd}.rail h2,.inspector h2{font-size:14px;margin:0 0 16px}.thumb{margin-bottom:20px}.thumb button{width:100%;border-radius:4px;padding:6px;background:transparent;border:2px solid transparent}.thumb button[aria-pressed=true]{border-color:#1473e6;background:#e7f1ff}.thumb label{display:flex;align-items:center;gap:6px;font-size:12px;margin-top:6px}.thumb input{accent-color:#1473e6}.mini{height:70px;display:grid;place-items:center;font-size:26px;font-weight:800;letter-spacing:-2px;background:linear-gradient(125deg,#fcab64,#ee6e63);color:#472c52;border-radius:2px}.thumb:nth-of-type(2) .mini{background:linear-gradient(125deg,#c4bdff,#8b7ddd)}.thumb:nth-of-type(3) .mini{background:linear-gradient(125deg,#9ed5c8,#449c8c)}.canvas-wrap{padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0}.canvas-meta{align-self:stretch;display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#666;gap:12px}.art{width:min(100%,540px);aspect-ratio:4/3;background:linear-gradient(130deg,#ffbd7c,#ed8178);color:#412754;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;isolation:isolate}.art:before{content:'';position:absolute;z-index:-1;width:70%;aspect-ratio:1;border:45px solid rgba(255,240,197,.65);border-radius:50%;left:-24%;bottom:-25%}.art:after{content:'';position:absolute;z-index:-1;width:60%;aspect-ratio:1;background:rgba(217,69,117,.32);border-radius:50%;right:-25%;top:-25%}.art small{letter-spacing:3px;font-size:11px;font-weight:700}.art h1{font-size:clamp(28px,5vw,64px);line-height:.96;margin:16px 0 18px;letter-spacing:-3px;font-weight:800}.art p{font-size:12px;margin:0}.art[data-art=square]{aspect-ratio:1;background:linear-gradient(130deg,#d8d0ff,#9588dd)}.art[data-art=story]{aspect-ratio:9/16;max-height:470px;width:auto;min-width:210px;background:linear-gradient(130deg,#caeee2,#69b7a5)}.art[data-art=story] h1{font-size:40px;letter-spacing:-2px}.canvas-note{font-size:12px;color:#666;margin-top:16px}.inspector{background:white;padding:24px 20px;border-left:1px solid #ddd}.inspector dl{margin:0 0 24px}.inspector dt{font-size:12px;color:#666;margin-top:16px}.inspector dd{margin:4px 0 0;overflow-wrap:anywhere}.inspector hr{border:0;border-top:1px solid #ddd;margin:24px 0}.inspector label{display:block;font-size:12px;font-weight:600;margin-bottom:6px}.inspector select{width:100%;border:1px solid #999;border-radius:4px;padding:8px;background:white}.selected-count{font-size:12px;margin:16px 0}.primary{background:#1473e6;border-color:#1473e6;color:white;width:100%}.primary:hover{background:#0d66d0}.result{margin:0 24px 20px;padding:16px;background:white;border:1px solid #ddd;border-radius:4px}.result[hidden]{display:none}.result h2{font-size:16px;margin:0 0 8px}.result pre{white-space:pre-wrap;font:12px/1.5 ui-monospace,monospace}.result p{font-size:12px;margin:0}footer{padding:12px 24px;color:#666;font-size:12px;border-top:1px solid #ddd;background:white}@media(max-width:760px){.workspace{grid-template-columns:110px minmax(0,1fr)}.rail{padding:16px 8px}.inspector{grid-column:1/-1;border-left:0;border-top:1px solid #ddd;display:grid;grid-template-columns:1fr 1fr;gap:12px 24px}.inspector h2{grid-column:1/-1;margin:0}.inspector dl{margin:0}.inspector hr{display:none}.canvas-wrap{padding:16px}.art h1{letter-spacing:-1px}.art p{padding:0 12px}.canvas-meta{display:block}.art:before{border-width:24px}header span{display:none}.inspector dt:first-child{margin-top:0}}@media(max-width:440px){.workspace{grid-template-columns:1fr}.rail{border-right:0;border-bottom:1px solid #ddd;display:flex;gap:8px}.rail h2{display:none}.thumb{flex:1;min-width:0;margin:0}.mini{height:44px;font-size:20px}.thumb label{font-size:11px}.art[data-art=story]{max-height:390px}.canvas-meta{display:flex}.inspector{grid-template-columns:1fr 1fr;padding:20px 16px}header{padding:16px}.result{margin:0 16px 16px}}
</style></head><body><header><b>Campaign library <span>/ Autumn collection</span></b><button id="select-all">Select all</button></header><main><div class="workspace"><nav class="rail" aria-label="Artwork variants"><h2>Assets</h2><div class="thumb"><button data-id="hero" aria-label="Inspect campaign master" aria-pressed="true"><div class="mini" aria-hidden="true">Made.</div></button><label><input type="checkbox" value="hero" checked>Master</label></div><div class="thumb"><button data-id="square" aria-label="Inspect social square" aria-pressed="false"><div class="mini" aria-hidden="true">Made.</div></button><label><input type="checkbox" value="square">Square</label></div><div class="thumb"><button data-id="story" aria-label="Inspect vertical story" aria-pressed="false"><div class="mini" aria-hidden="true">Made.</div></button><label><input type="checkbox" value="story">Story</label></div></nav><section class="canvas-wrap" aria-label="Selected artwork"><div class="canvas-meta"><span id="art-name">Campaign master</span><span id="dimensions">1600 × 1200</span></div><div class="art" id="art" data-art="hero" role="img" aria-label="Original orange campaign artwork with the words Made for what comes next"><div><small>AUTUMN COLLECTION</small><h1>Made for<br>what comes<br>next.</h1><p>Small ideas. A different perspective.</p></div></div><p class="canvas-note">Original artwork · illustrative preview</p></section><aside class="inspector"><h2>Export inspector</h2><dl><dt>Selected artwork</dt><dd id="detail-name">Campaign master</dd><dt>Source dimensions</dt><dd id="detail-dimensions">1600 × 1200 px</dd><dt>Review</dt><dd>Draft artwork</dd></dl><hr><div><label for="format">Export format</label><select id="format"><option value="png">PNG</option><option value="jpeg">JPEG</option></select><p class="selected-count" id="selected-count">1 asset selected</p><button class="primary" id="prepare">Prepare recipe</button><p style="font-size:12px;color:#666">Creates a local recipe only. No files are converted.</p></div></aside></div><section class="result" id="result" hidden><h2>Local export recipe</h2><pre id="recipe"></pre><p role="status" id="status"></p></section></main><footer>React Spectrum v3 collection study · HTML/CSS interpretation with illustrative colors. Inspecting an artwork and selecting it for export are independent.</footer><script>
const assets={hero:{name:'Campaign master',dimensions:'1600 × 1200',color:'orange'},square:{name:'Social square',dimensions:'1080 × 1080',color:'purple'},story:{name:'Vertical story',dimensions:'1080 × 1920',color:'green'}};const boxes=[...document.querySelectorAll('.thumb input')],$=id=>document.getElementById(id);document.querySelectorAll('[data-id]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-id]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const id=button.dataset.id,a=assets[id];$('art').dataset.art=id;$('art').setAttribute('aria-label','Original '+a.color+' campaign artwork with the words Made for what comes next');$('art-name').textContent=$('detail-name').textContent=a.name;$('dimensions').textContent=a.dimensions;$('detail-dimensions').textContent=a.dimensions+' px';});function update(){let n=boxes.filter(b=>b.checked).length;$('selected-count').textContent=n+' asset'+(n===1?'':'s')+' selected';$('prepare').disabled=n===0;$('select-all').textContent=n===boxes.length?'Clear selection':'Select all';$('result').hidden=true;}boxes.forEach(b=>b.onchange=update);$('format').onchange=()=>{$('result').hidden=true;};$('select-all').onclick=()=>{const all=boxes.every(b=>b.checked);boxes.forEach(b=>b.checked=!all);update();};$('prepare').onclick=()=>{const ids=boxes.filter(b=>b.checked).map(b=>b.value);$('recipe').textContent=JSON.stringify({format:$('format').value,assets:ids},null,2);$('status').textContent='Recipe prepared for '+ids.length+' assets. No image files were converted.';$('result').hidden=false;};
</script></body></html>

```

[Code reference](https://react-spectrum.adobe.com/v3/TableView.html)

- Artwork is original sample content. Preparing a recipe produces selection metadata, not converted image files; this document does not load Spectrum v3 or Spectrum 2.

### Complete native implementation entry

The complete implementation from setup, collected here alongside the focused API explanations. Follow the documented package and build prerequisites in setup.

```jsx
// Terminal: npm install @adobe/react-spectrum@3
// Existing React app with <div id="root"></div>; entry: src/main.jsx
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider, defaultTheme, Flex, View, Heading, Text, Button,
  TableView, TableHeader, Column, TableBody, Row, Cell, Picker, Item}
  from '@adobe/react-spectrum';
const assets = [
  {id: 'hero', name: 'Campaign master', dimensions: '1600 × 1200'},
  {id: 'square', name: 'Social square', dimensions: '1080 × 1080'},
  {id: 'story', name: 'Vertical story', dimensions: '1080 × 1920'}
];
function AssetReview() {
  const [keys, setKeys] = React.useState(new Set(['hero']));
  const [format, setFormat] = React.useState('png');
  const [recipe, setRecipe] = React.useState('');
  const selected = keys === 'all' ? assets : assets.filter(a => keys.has(a.id));
  return <Provider theme={defaultTheme} breakpoints={{tablet: 640, desktop: 1024}}>
    <View padding="size-300">
      <Heading level={1}>Campaign exports</Heading>
      <Flex direction={{base: 'column', tablet: 'row'}} gap="size-300">
        <TableView aria-label="Campaign assets" selectionMode="multiple"
          selectedKeys={keys} onSelectionChange={setKeys} flex minWidth={0}>
          <TableHeader><Column key="name">Asset</Column><Column key="dimensions">Dimensions</Column></TableHeader>
          <TableBody items={assets}>{asset => <Row key={asset.id}>
            <Cell>{asset.name}</Cell><Cell>{asset.dimensions}</Cell>
          </Row>}</TableBody>
        </TableView>
        <Flex direction="column" gap="size-200" width={{base:'100%',tablet:'size-2400'}}>
          <Picker label="Export format" selectedKey={format} onSelectionChange={setFormat}>
            <Item key="png">PNG</Item><Item key="jpeg">JPEG</Item>
          </Picker>
          <Text>{selected.length} assets selected</Text>
          <Button variant="accent" isDisabled={!selected.length} onPress={() =>
            setRecipe(JSON.stringify({format, assets:selected.map(a=>a.id)}, null, 2))}>
            Prepare recipe
          </Button>
        </Flex>
      </Flex>
      <p role="status">{recipe ? 'Local recipe prepared. No image files were converted.' : ''}</p>
      {recipe && <pre style={{whiteSpace:'pre-wrap'}}>{recipe}</pre>}
    </View>
  </Provider>;
}
createRoot(document.getElementById('root')).render(<AssetReview />);
```

[Code reference](https://react-spectrum.adobe.com/v3/TableView.html)

- Complete v3 collection and inspector example for an existing React app. It creates an export recipe in local state, not image files. Keep the resolved package version in the lockfile and do not mix this entry with Spectrum 2 imports.

### The selection can be all, not only a Set

Normalize the collection contract before calculating the batch or enabling the action. This fragment uses assets and keys from the complete setup.

```jsx
const selected = keys === 'all'
  ? assets
  : assets.filter(asset => keys.has(asset.id));
<Button variant="accent" isDisabled={selected.length === 0}
  onPress={() => setRecipe(JSON.stringify({format, assets: selected.map(a => a.id)}))}>
  Prepare recipe
</Button>
```

[Code reference](https://react-spectrum.adobe.com/v3/TableView.html)

- Stable ids survive sorting and renaming.
- An empty batch disables only the recipe action; it does not erase the current format.

### Responsive inspector using explicit breakpoint names

Use the same keys on Provider and the responsive props. The numbers are deliberate application configuration.

```jsx
<Provider theme={defaultTheme} breakpoints={{tablet:640, desktop:1024}}>
  <Flex direction={{base:"column", tablet:"row"}} gap="size-300">
    <View flex minWidth={0}>Asset table</View>
    <View width={{base:"100%",tablet:"size-2400"}}>Export inspector</View>
  </Flex>
</Provider>
```

[Code reference](https://react-spectrum.adobe.com/v3/Provider.html)

- The Provider reference prose and generated defaults table disagree about default breakpoints; an explicit map removes ambiguity.
- Logical marginStart and marginEnd adapt better than physical left and right margins.

## Implementation Starting Point

Complete v3 collection and inspector example for an existing React app. It creates an export recipe in local state, not image files. Keep the resolved package version in the lockfile and do not mix this entry with Spectrum 2 imports.

```jsx
// Terminal: npm install @adobe/react-spectrum@3
// Existing React app with <div id="root"></div>; entry: src/main.jsx
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider, defaultTheme, Flex, View, Heading, Text, Button,
  TableView, TableHeader, Column, TableBody, Row, Cell, Picker, Item}
  from '@adobe/react-spectrum';
const assets = [
  {id: 'hero', name: 'Campaign master', dimensions: '1600 × 1200'},
  {id: 'square', name: 'Social square', dimensions: '1080 × 1080'},
  {id: 'story', name: 'Vertical story', dimensions: '1080 × 1920'}
];
function AssetReview() {
  const [keys, setKeys] = React.useState(new Set(['hero']));
  const [format, setFormat] = React.useState('png');
  const [recipe, setRecipe] = React.useState('');
  const selected = keys === 'all' ? assets : assets.filter(a => keys.has(a.id));
  return <Provider theme={defaultTheme} breakpoints={{tablet: 640, desktop: 1024}}>
    <View padding="size-300">
      <Heading level={1}>Campaign exports</Heading>
      <Flex direction={{base: 'column', tablet: 'row'}} gap="size-300">
        <TableView aria-label="Campaign assets" selectionMode="multiple"
          selectedKeys={keys} onSelectionChange={setKeys} flex minWidth={0}>
          <TableHeader><Column key="name">Asset</Column><Column key="dimensions">Dimensions</Column></TableHeader>
          <TableBody items={assets}>{asset => <Row key={asset.id}>
            <Cell>{asset.name}</Cell><Cell>{asset.dimensions}</Cell>
          </Row>}</TableBody>
        </TableView>
        <Flex direction="column" gap="size-200" width={{base:'100%',tablet:'size-2400'}}>
          <Picker label="Export format" selectedKey={format} onSelectionChange={setFormat}>
            <Item key="png">PNG</Item><Item key="jpeg">JPEG</Item>
          </Picker>
          <Text>{selected.length} assets selected</Text>
          <Button variant="accent" isDisabled={!selected.length} onPress={() =>
            setRecipe(JSON.stringify({format, assets:selected.map(a=>a.id)}, null, 2))}>
            Prepare recipe
          </Button>
        </Flex>
      </Flex>
      <p role="status">{recipe ? 'Local recipe prepared. No image files were converted.' : ''}</p>
      {recipe && <pre style={{whiteSpace:'pre-wrap'}}>{recipe}</pre>}
    </View>
  </Provider>;
}
createRoot(document.getElementById('root')).render(<AssetReview />);
```

## Agent Prompt

Use @adobe/react-spectrum v3 with Provider and defaultTheme. Build the supplied keyed TableView and export inspector using Picker, Item, Flex, View and Button. Handle selection as a Set or all, preserve format when selection changes, and name the result a local recipe until a real conversion service is connected. Use explicit tablet/desktop breakpoint keys and supported style props. Keep v3 and Spectrum 2 APIs separate.

## Sources

- [Provider](https://react-spectrum.adobe.com/v3/Provider.html) — Official React Spectrum reference for the implementation and constraints discussed here.
- [styling](https://react-spectrum.adobe.com/v3/styling.html) — Official React Spectrum reference for the implementation and constraints discussed here.
- [theming](https://react-spectrum.adobe.com/v3/theming.html) — Official React Spectrum reference for the implementation and constraints discussed here.
- [TableView](https://react-spectrum.adobe.com/v3/TableView.html) — Official React Spectrum reference for the implementation and constraints discussed here.
- [Picker](https://react-spectrum.adobe.com/v3/Picker.html) — Official React Spectrum reference for the implementation and constraints discussed here.
- [Heading](https://react-spectrum.adobe.com/v3/Heading.html) — Official React Spectrum reference for the implementation and constraints discussed here.
- [Button](https://react-spectrum.adobe.com/v3/Button.html) — Official React Spectrum reference for the implementation and constraints discussed here.
- [migration](https://react-spectrum.adobe.com/migrating) — Official React Spectrum reference for the implementation and constraints discussed here.
