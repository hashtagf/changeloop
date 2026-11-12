# Vant Design System — OpenDesign Application Guide

A mobile address-selection flow built with Vant 4: real CSS variables, controlled address identity, field validation, theme switching and an explicit local-only save.

Vant 4.10.2. Default tokens and original page choices are distinguished. Sample addresses are fictional; selection and editing stay local.

## Source Reference

- **Library scope:** Vue component library ([source](https://vant-ui.github.io/vant/))
- **Platform or architecture:** Designed for mobile web applications ([source](https://github.com/youzan/vant))
- **Integration:** Vant 4 targets Vue 3 ([source](https://github.com/youzan/vant))
- **Component support:** Includes form components ([source](https://github.com/youzan/vant))
- **Customization or behavior:** Includes address and commerce-oriented components ([source](https://github.com/youzan/vant))
- **Additional capability:** Theme customization is documented ([source](https://github.com/youzan/vant))


## Design Reference

Vant 4.10.2 CSS variables, read from the installed base stylesheet. The preview applies an original teal primary override through ConfigProvider; the default roles below remain explicitly identified.

### Default color roles

[Official reference](https://github.com/youzan/vant/blob/main/packages/vant/src/style/var.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --van-primary-color | var(--van-blue) | Default action alias; blue is #1989fa. |
| --van-success-color | var(--van-green) | Success alias; green is #07c160. |
| --van-danger-color | var(--van-red) | Danger alias; red is #ee0a24. |
| --van-warning-color | var(--van-orange) | Warning alias; orange is #ff976a. |
| --van-text-color | var(--van-gray-8) | Main text alias; gray-8 is #323233. |
| --van-text-color-2 | var(--van-gray-6) | Secondary text alias; gray-6 is #969799. |
| --van-border-color | var(--van-gray-3) | Divider alias; gray-3 is #ebedf0. |
| --van-background | var(--van-gray-1) | Page surface; gray-1 is #f7f8fa. |
| --van-background-2 | var(--van-white) | Component surface; white is #fff. |

### Padding scale

[Official reference](https://github.com/youzan/vant/blob/main/packages/vant/src/style/var.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --van-padding-base | 4px | Fine internal offset. |
| --van-padding-xs | 8px | Small internal gap. |
| --van-padding-sm | 12px | Address item padding. |
| --van-padding-md | 16px | Normal page inset. |
| --van-padding-lg | 24px | Section inset. |
| --van-padding-xl | 32px | Large page inset. |

### Typography and shape

[Official reference](https://github.com/youzan/vant/blob/main/packages/vant/src/style/var.less)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --van-font-size-xs | 10px | Default UI type size. |
| --van-font-size-sm | 12px | Default UI type size. |
| --van-font-size-md | 14px | Default UI type size. |
| --van-font-size-lg | 16px | Default UI type size. |
| --van-line-height-xs | 14px | Matching line-height token. |
| --van-line-height-sm | 18px | Matching line-height token. |
| --van-line-height-md | 20px | Matching line-height token. |
| --van-line-height-lg | 22px | Matching line-height token. |
| --van-radius-sm | 2px | Named corner radius. |
| --van-radius-md | 4px | Named corner radius. |
| --van-radius-lg | 8px | Named corner radius. |
| --van-radius-max | 999px | Named corner radius. |
| --van-disabled-opacity | .5 | Default disabled opacity. |
| --van-duration-base | .3s | Standard transition duration. |

### Address-list and preview adjustments

[Official reference](https://vant-ui.github.io/vant/#/en-US/address-list)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --van-address-list-padding | 12px 12px 80px | Official default reserves space for the bottom add button. |
| themeVars.addressListPadding | 12px | Original adjustment because this preview hides the fixed add button. |
| themeVars.primaryColor | #176b77 | Original primary override mapped to --van-primary-color. |
| --van-address-list-item-font-size | 13px | Official address text size. |
| --van-address-list-edit-icon-size | 20px | Official edit icon size; not the whole touch target. |

## Vant Design System Mobile Components with Explicit CSS Roles

### Mobile Components with Explicit CSS Roles

Vant targets Vue mobile web interfaces. Its AddressList, Field and CellGroup provide compact receiving-address rows and form cells rather than a desktop administration table. The sample-kit flow uses those native components and makes the selected destination visible in a separate summary.

The primary role defaults to blue through --van-primary-color. Success, danger and warning each reference separate color variables. The specimen deliberately changes the primary to #176b77 through ConfigProvider; it does not call that teal an official Vant brand color. Its original paper-stock artwork is decorative and carries no control state.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/config-provider)

## Vant Design System The Four-Pixel Padding Scale and Compact Type

### The Four-Pixel Padding Scale and Compact Type

Vant exposes padding values of 4, 8, 12, 16, 24 and 32 pixels. These are actual base variables, not inferred from a screenshot. The address-list items use the small padding token, while the surrounding preview adds larger section gaps to make the form and order summary distinct.

The named text sizes run from 10 to 16 pixels, with paired line heights from 14 to 22 pixels. Address text has its own 13px component variable. A mobile product may need larger editorial text than those control defaults: the specimen heading is an original 32px size, reduced to 27px at the page breakpoint.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/config-provider)

## Vant Design System An Address ID Drives the Radio Selection

### An Address ID Drives the Radio Selection

AddressList receives list records with id, name, tel, address and optional isDefault. Its v-model value identifies the chosen record. The summary is computed by finding that ID in the current list, so editing a recipient immediately updates the displayed destination without a second independent summary state.

The unavailable warehouse is passed through disabled-list and given a clear disabled-text explanation. It remains visible for context but cannot become the selected destination. The Default badge identifies the record’s default status; it is separate from the current selection and does not change simply because another radio option is chosen.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/address-list)

## Vant Design System Keep the Draft Separate from the Saved Record

### Keep the Draft Separate from the Saved Record

The edit event supplies the address record. The editor copies only its editable fields into a reactive draft and stores its stable ID separately. Cancel hides this draft without mutating the saved address. Save replaces the matching record or appends a new local one, then selects that ID.

The specimen renders editing inline below the list instead of opening a bottom popup. That keeps the full example usable in an embedded document. Vant also offers AddressEdit for standardized address entry; this example uses Form and Field because its sample addresses deliberately avoid assuming one country’s administrative area data.

1. Select a studio and check the summary before opening Edit.
2. Change the recipient, then cancel to confirm the saved row is unchanged.
3. Open the editor again, save valid fields and inspect the selected summary.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/form)

## Vant Design System Field Rules Gate the Submit Event

### Field Rules Gate the Submit Event

The Form uses validate-trigger="onSubmit". The recipient validator trims whitespace and requires at least two characters. The telephone validator accepts a modest range of digits, spaces, parentheses and hyphens with an optional leading plus. The address validator requires ten non-whitespace characters. These checks demonstrate mechanics; they are not postal verification or universal telephone validation.

A primary Button with native-type="submit" submits the native form. Vant emits submit only after its rules pass. Errors appear beside the relevant Field, and scroll-to-error moves the invalid field into view. The preview also focuses the first recipient input when editing begins. It preserves the draft during validation failures.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/form)

## Vant Design System ConfigProvider Maps CamelCase Values to CSS Variables

### ConfigProvider Maps CamelCase Values to CSS Variables

The theme-vars object includes primaryColor, buttonPrimaryBackground, buttonPrimaryBorderColor and addressListPadding. ConfigProvider maps those names into the corresponding --van-* variables. The provider uses theme-vars-scope="global" in this isolated document so aliases declared at the root resolve against the changed primary role. Overriding the role and both primary-button values keeps the native action and radio selection coordinated.

Switching the theme prop between light and dark updates Vant’s component theme. The page still needs its own background and text declarations using the theme variables; setting the provider alone does not paint every application element. Decorative paper samples intentionally keep their material colors in both themes.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/config-provider)

## Vant Design System A Fixed Mobile Action Needs an Embedding Decision

### A Fixed Mobile Action Needs an Embedding Decision

AddressList normally reserves eighty pixels of bottom padding for its fixed add button. The preview sets show-add-button to false and provides an ordinary in-flow Button. It also changes addressListPadding to twelve pixels, avoiding both a detached fixed action and an unexplained empty bottom area inside the embedded example.

On a wide screen, the list and material summary form two columns. Below the original 680px breakpoint, they stack. The native AddressList height:100% is explicitly reset to height:auto so the panel follows its content rather than overlapping the next grid row. No global minimum viewport height is used, so the parent page can size the embedded document from its content. The address names wrap on narrow screens rather than forcing the page wider.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/address-list)

## Vant Design System Visible Focus and Explicit Local Results

### Visible Focus and Explicit Local Results

The Vant base reset removes default focus outlines. The accompanying page stylesheet restores a three-pixel focus-visible ring on buttons, inputs, textareas and tab-indexed controls. This is an application-level addition, not a claim that a library import alone completes accessibility work. The theme switch receives an accessible name and visible label.

A status notice records a local save or destination selection. It explicitly states that no delivery was booked. The example has no checkout endpoint, storage or external side effect. A real checkout would need server-side address validation, delivery eligibility and a final review before purchase.

- Keep unavailable addresses visibly explained rather than silently deleting them.
- Retain the draft after an invalid submit so the user can correct one field.
- Describe whether an action changes local selection or actually books a delivery.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/form)

## Vant Design System Import the Locale and the Component Styles

### Import the Locale and the Component Styles

The complete SFC imports its components locally. The entry file installs the English locale through Locale.use and imports vant/lib/index.css before the original layout stylesheet. The verified package is Vant 4.10.2 with Vue 3; the .mjs suffix on the English locale import matches the installed ESM file.

The standalone preview bundles its JavaScript, CSS and icon font into the document. It removes the unused remote WOFF fallback after preserving the bundled WOFF2 font, so the example does not depend on a third-party font request. Production applications should use their own bundler and asset policy rather than copying a hosted demo URL.

[Supporting specification](https://vant-ui.github.io/vant/#/en-US/quickstart)

## Component Examples

### Address selection and validated editing

Complete Vue SFC using AddressList, Form, Field, ConfigProvider and a controlled draft.

```vue
<script setup>
import {ref,reactive,computed,nextTick} from 'vue';
import {ConfigProvider,AddressList,Button,Form,Field,CellGroup,Tag,Switch,NoticeBar} from 'vant';
const list=ref([{id:'studio',name:'Alex Morgan',tel:'+44 20 7946 0101',address:'Studio 4, 18 Paper Street, London',isDefault:true},{id:'workshop',name:'Jules Chen',tel:'+44 20 7946 0122',address:'Workshop B, 52 Clay Road, London'}]);
const disabledList=[{id:'archive',name:'Sam Rivera',tel:'+44 20 7946 0133',address:'Old warehouse, 8 Mill Lane, London'}];
const chosen=ref('studio'),editing=ref(false),editingId=ref(null),notice=ref(''),dark=ref(false),formRef=ref();
const draft=reactive({name:'',tel:'',address:''});
const selected=computed(()=>list.value.find(x=>x.id===chosen.value));
const themeVars={primaryColor:'#176b77',addressListPadding:'12px',buttonPrimaryBackground:'#176b77',buttonPrimaryBorderColor:'#176b77'};
async function edit(item){editingId.value=item?.id||null;Object.assign(draft,item?{name:item.name,tel:item.tel,address:item.address}:{name:'',tel:'',address:''});editing.value=true;notice.value='';await nextTick();formRef.value?.resetValidation();document.querySelector('[name="recipient"]')?.focus();}
function save(){const value={id:editingId.value||`local-${Date.now()}`,name:draft.name.trim(),tel:draft.tel.trim(),address:draft.address.trim()};if(editingId.value)list.value=list.value.map(x=>x.id===editingId.value?{...x,...value}:x);else list.value.push(value);chosen.value=value.id;editing.value=false;notice.value='Address saved in this local preview.';}
function confirm(){notice.value=`Selected ${selected.value.name} at ${selected.value.address}. No delivery was booked.`;}
const nonempty=v=>v.trim().length>=2;
const phone=v=>/^\+?[\d ()-]{7,22}$/.test(v.trim());
</script>
<template><ConfigProvider theme-vars-scope="global" :theme="dark?'dark':'light'" :theme-vars="themeVars"><main class="delivery" :class="{dark}"><header><div><p class="eyebrow">VANT · MOBILE COMMERCE</p><h1>A destination for your sample kit.</h1><p class="intro">Choose a studio, update a recipient or add a local address.</p></div><label class="mode"><span>Dark</span><Switch v-model="dark" size="22px" aria-label="Dark theme" /></label></header><div class="columns"><section class="address-panel" aria-label="Delivery addresses"><div class="section-heading"><h2>Delivery address</h2><Tag plain type="primary">{{list.length}} available</Tag></div><AddressList v-model="chosen" :list="list" :disabled-list="disabledList" disabled-text="Outside the sample delivery area" default-tag-text="Default" :show-add-button="false" @edit="edit" @select="notice=''" /><div class="actions"><Button plain block type="primary" @click="edit()">Add a local address</Button></div></section><aside><section class="kit"><div class="paper-samples" aria-hidden="true"><i></i><i></i><i></i></div><p class="eyebrow">MATERIAL LIBRARY</p><h2>Paper & pigment kit</h2><p>Six paper stocks. Three print finishes. One place to compare them.</p><dl><div><dt>Recipient</dt><dd>{{selected?.name}}</dd></div><div><dt>Destination</dt><dd>{{selected?.address}}</dd></div></dl><Button block type="primary" @click="confirm">Use this address</Button><p class="local-note">Selection only. Nothing is purchased or shipped.</p></section></aside></div><section v-if="editing" class="editor"><h2>{{editingId?'Edit recipient':'Add an address'}}</h2><Form ref="formRef" validate-trigger="onSubmit" label-align="top" scroll-to-error @submit="save"><CellGroup inset><Field v-model="draft.name" name="recipient" label="Recipient" placeholder="Full name" :rules="[{validator:nonempty,message:'Enter at least two characters.'}]" /><Field v-model="draft.tel" name="telephone" type="tel" label="Telephone" placeholder="+44 20 7946 0100" :rules="[{validator:phone,message:'Use 7–22 characters: digits, spaces, +, brackets or hyphens.'}]" /><Field v-model="draft.address" name="address" type="textarea" rows="2" autosize label="Address" placeholder="Building, street and city" :rules="[{validator:v=>v.trim().length>=10,message:'Enter a complete address of at least ten characters.'}]" /></CellGroup><div class="form-actions"><Button type="primary" native-type="submit">Save locally</Button><Button native-type="button" @click="editing=false">Cancel</Button></div></Form></section><NoticeBar v-if="notice" wrapable :scrollable="false" color="var(--van-primary-color)" background="var(--van-background-2)" class="result" role="status">{{notice}}</NoticeBar></main></ConfigProvider></template>

```

[Code reference](https://vant-ui.github.io/vant/#/en-US/address-list)

- The selected value is an address ID, not a position in the array.
- The fixed AddressList add button is hidden; an in-flow Button opens the editor.
- Form submit runs only after the Field validators pass.

### Responsive page and visible focus

Original desktop split layout collapses into a mobile delivery flow.

```css
*{box-sizing:border-box}body{margin:0;background:#f7f8fa;color:#323233}.delivery{padding:32px;max-width:1080px;margin:auto;background:var(--van-background);color:var(--van-text-color)}.delivery.dark{background:var(--van-background);color:var(--van-text-color)}header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:32px}.eyebrow{font-size:11px;font-weight:600;letter-spacing:.12em;color:var(--van-text-color-2)}h1{font-size:32px;line-height:1.2;margin:12px 0;max-width:550px}h2{font-size:18px;line-height:24px;margin:0 0 12px}.intro{font-size:15px;line-height:24px;color:var(--van-text-color-2)}.mode{display:flex;gap:8px;align-items:center;font-size:12px}.columns{display:grid;grid-template-columns:1.25fr 1fr;gap:24px}.section-heading{display:flex;justify-content:space-between;align-items:center;padding:0 12px}.section-heading h2{margin:0}.actions{padding:0 12px}.kit{background:var(--van-background-2);padding:24px;border-radius:8px}.kit p{line-height:1.6}.paper-samples{height:130px;position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:24px;background:#e9edef;border-radius:4px;overflow:hidden}.paper-samples i{height:90px;width:90px;background:#d6b59b;box-shadow:0 4px 8px #0001;transform:rotate(-12deg);margin-right:-25px}.paper-samples i:nth-child(2){background:#efdfbe;transform:rotate(2deg)}.paper-samples i:nth-child(3){background:#94adb1;transform:rotate(16deg)}dl{font-size:14px;line-height:20px;margin:24px 0}dl div{display:grid;grid-template-columns:90px 1fr;margin:12px 0;gap:12px}dt{color:var(--van-text-color-2)}dd{margin:0}.local-note{font-size:12px;color:var(--van-text-color-2);margin-bottom:0}.editor{max-width:640px;margin-top:32px}.editor h2{margin-left:16px}.form-actions{display:flex;gap:12px;margin:16px}.result{margin-top:24px;border-radius:8px}button:focus-visible,input:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid #176b77!important;outline-offset:3px}@media(max-width:680px){.delivery{padding:24px 12px}.columns{grid-template-columns:1fr}header{gap:8px;margin-bottom:24px}h1{font-size:27px}.mode{padding-top:4px}.kit{padding:20px}.paper-samples{height:110px}.van-address-item__name{white-space:normal}}

.delivery .van-address-list{height:auto}

```

[Code reference](https://vant-ui.github.io/vant/#/en-US/config-provider)

- Component geometry comes from Vant; the 680px page breakpoint is an application choice.
- The preview restores a visible focus ring because the base reset removes default outlines.

## Implementation Starting Point

Verified with Vue 3 and Vant 4.10.2. The example stores no address outside its in-memory state.

```javascript
// Create the project first:
// npm create vite@latest vant-specimen -- --template vue
// cd vant-specimen && npm install
// In a Vite Vue 3 project:
// npm install vant@4.10.2
// Save the complete SFC as App.vue and the supplied layout as style.css.
import {createApp} from 'vue';
import {Locale} from 'vant';
import enUS from 'vant/es/locale/lang/en-US.mjs';
import 'vant/lib/index.css';
import './style.css';
import App from './App.vue';
Locale.use('en-US',enUS);
createApp(App).mount('#app');
// index.html must contain <div id="app"></div>.
// Keep the template index.html and replace its entry with the code above.
// npm run dev
```

## Agent Prompt

Start from the Vant 4.10.2 sample-kit address selector. Preserve native AddressList and the Form/Field editing flow for adding or modifying a local address, including field validation and selected-address state. Keep Locale setup, the en-US module, ConfigProvider theme scope and content-height AddressList adaptation. Cancellation must not replace an existing address; successful validation updates only the local address collection. Do not add payment or delivery-slot success claims to this address-only specimen.

## Sources

- [AddressList](https://vant-ui.github.io/vant/#/en-US/address-list) — Address record shape, selection and disabled-list API.
- [Form](https://vant-ui.github.io/vant/#/en-US/form) — Submit/failed events and validation rules.
- [Field](https://vant-ui.github.io/vant/#/en-US/field) — Native form-field composition.
- [ConfigProvider](https://vant-ui.github.io/vant/#/en-US/config-provider) — Theme variables and dark theme.
- [Quick start](https://vant-ui.github.io/vant/#/en-US/quickstart) — Vue component and stylesheet setup.
- [Locale](https://vant-ui.github.io/vant/#/en-US/locale) — English locale registration.
- [Base token source](https://github.com/youzan/vant/blob/main/packages/vant/src/style/var.less) — Official base colors, padding, typography and radii.
