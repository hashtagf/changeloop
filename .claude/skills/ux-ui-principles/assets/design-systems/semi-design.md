# Semi Design Design System — OpenDesign Application Guide

Create a sequential workspace setup with Semi’s recommended basic Steps, controlled Input and Switch, real theme tokens, and an explicit React 18 versus React 19 package choice.

Independent OpenDesign reference. Original workspace specimen; no account or notification subscription is created.

## Source Reference

- **React 18 package:** @douyinfe/semi-ui ([source](https://semi.design/en-US/start/getting-started))
- **React 19 package:** @douyinfe/semi-ui-19 ([source](https://semi.design/en-US/start/getting-started))
- **Default control height:** 32px ([source](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/variables.scss))
- **Regular typography:** 14px / 20px ([source](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/_font.scss))
- **Small radius:** 3px ([source](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/global.scss))
- **Recommended Steps type:** basic ([source](https://semi.design/en-US/navigation/steps))


## Design Reference

Semi official documentation and default-theme SCSS snapshot. $ names are compile-time Sass constants; --semi-* names are runtime CSS variables. Application workflow data is original.

### Spacing and control sizes

[Official reference](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/variables.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $height-control-small / default / large | 24 / 32 / 40px | Published control heights. |
| $spacing-super-tight | 2px | Tightest spacing. |
| $spacing-extra-tight | 4px | Very tight spacing. |
| $spacing-tight | 8px | Tight spacing. |
| $spacing-base-tight | 12px | Compact group spacing. |
| $spacing-base | 16px | Default spacing. |
| $spacing-base-loose | 20px | Looser grouping. |
| $spacing-loose | 24px | Section spacing. |
| $spacing-extra-loose | 32px | Large separation. |
| $spacing-super-loose | 40px | Largest named spacing in this set. |

### Typography pairs

[Official reference](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/_font.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| font-size-small mixin | 12 / 16px | Size from variables.scss, line-height from mixin. |
| font-size-regular mixin | 14 / 20px | Body text. |
| font-size-header-6 mixin | 16 / 22px | Small heading. |
| font-size-header-4 mixin | 20 / 28px | Section heading. |
| font-size-header-3 mixin | 24 / 32px | Page heading option. |
| font-size-header-1 mixin | 32 / 44px | Largest named heading. |

### Theme role mappings

[Official reference](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/global.scss)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --semi-color-primary | rgba(var(--semi-blue-5),1) | Light palette resolves to rgb(0,100,250). |
| --semi-color-primary-hover | rgba(var(--semi-blue-6),1) | Light palette resolves to rgb(0,98,214). |
| --semi-color-text-0 | rgba(var(--semi-grey-9),1) | Light primary text resolves to rgb(28,31,35). |
| --semi-color-text-2 | Grey 9 at .62 opacity in light mode | Secondary text; dark uses a different opacity. |
| --semi-color-fill-0 | Grey 8 at .05 opacity in light mode | Subtle fill adapts to its surface. |
| --semi-border-radius-small | 3px | Common controls. |
| --semi-border-radius-medium | 6px | Menus and similar surfaces. |
| --semi-border-radius-large | 12px | Large container role. |
| --semi-border-radius-full | 9999px | Pill treatment. |

### Steps contract

[Official reference](https://semi.design/en-US/navigation/steps)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| type="basic" | Recommended simple step bar | The older default style is deprecated in docs. |
| current | Zero-based number | Starts at 0. |
| status | wait / process / finish / error / warning | Status of current step. |
| type="nav" | Non-interactive navigation appearance | Not a shortcut for a clickable wizard. |
| onChange(index) | Index includes initial offset | Application decides whether navigation is allowed. |

### Input and Switch

[Official reference](https://semi.design/en-US/input/input)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Input onChange | (value,event) | First argument is the new value. |
| Input validateStatus | default / error / warning | Visual styling only; does not validate business data. |
| Input composition | Boolean, false by default | Delay onChange until IME confirmation when enabled. |
| Input aria-describedby | Description ID | Connect help and error text. |

### Switch and button variants

[Official reference](https://semi.design/en-US/input/switch)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Switch checked | Controlled Boolean | Keep the preference in parent state. |
| Switch onChange | (checked,event) | Use the Boolean directly. |
| Switch aria-label | Meaningful state label | Describe the preference, not the visual toggle. |
| Switch size="small" | No checkedText / uncheckedText treatment | Keep long labels outside the switch. |

## Semi Design Design System Choose the package for the actual React major

### The suffix changes the integration

Semi’s current Quick Start separates the React 19 package from the package used by earlier React versions. This example chooses React 18 and @douyinfe/semi-ui explicitly. Replacing that with React 19 requires the documented @douyinfe/semi-ui-19 imports and dependency choice.

Supported bundlers load related CSS from the component JavaScript. Compile-time changes such as a custom prefix, theme compilation, or CSS layers have separate tooling considerations. Do not turn a basic import example into a claim that every theme customization works without configuration.

[Supporting specification](https://semi.design/en-US/start/getting-started)

## Semi Design Design System Named Sass scales make density concrete

### Use the published 24, 32 and 40px control heights

Semi’s three control-height constants are 24, 32 and 40px. Its spacing names cover 2 through 40px with a nonuniform progression. A default field inside the wizard can use 12px help spacing and 24px separation from the next section without introducing a new spacing language.

These values are Sass constants, not automatically runtime variables. The specimen uses their resolved dimensions in original page CSS. The difference matters when a developer wants to theme a layout at runtime rather than rebuild a stylesheet.

[Supporting specification](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/variables.scss)

## Semi Design Design System Use real size and line-height pairs

### Body text and headings have different rhythm

The regular mixin pairs 14px text with 20px line height; the small mixin pairs 12 with 16. Header 3 is 24/32 and header 1 is 32/44. A short wizard title can use the former, leaving the latter for a stronger page hierarchy.

The source family begins with Inter followed by platform and CJK fallbacks. The offline preview uses an available system stack and does not claim it has downloaded a particular font. Keep step names brief so they retain meaning when the step bar wraps on a narrow viewport.

[Supporting specification](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/_font.scss)

## Semi Design Design System Theme roles and palette channels are separate

### Use resolved roles in application CSS

The primary role wraps a palette-channel variable with rgba. Using --semi-color-primary is suitable for an ordinary color property; a raw --semi-blue-5 channel list alone is not a complete CSS color. Light and dark palettes change those channel values.

Text roles also use opacity. Secondary text is not an arbitrary lighter hex code, and disabled text should not be reused for important help. The wizard keeps its completion message neutral because preparing configuration does not create a live account.

[Supporting specification](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/global.scss)

## Semi Design Design System Basic Steps communicates progress, not permission to skip validation

### The application owns transition rules

Semi recommends type="basic" for the simple step bar. current begins at zero, while the current step can carry process, error or another supported status. The older default appearance is marked deprecated in the documentation.

The sample deliberately advances through Continue and Previous controls. It does not wire every step click to setCurrent, which would allow the user to reach Review with an empty name. The separately documented nav appearance is not interactive and should not be mistaken for wizard routing.

1. Validate the name before leaving the first step.
2. Preserve the chosen weekly-digest Boolean while navigating backward.
3. Show the complete settings on Review.
4. Prepare local configuration without claiming that an account or subscription now exists.

[Supporting specification](https://semi.design/en-US/navigation/steps)

## Semi Design Design System Visual validation does not validate the value

### Use the value-first callback correctly

Semi Input invokes onChange with the value before the event. The example can therefore pass setName directly. validateStatus changes the appearance only; the empty-name check is application logic and needs a visible explanation.

For text that triggers live queries, composition can defer callbacks until an IME composition is confirmed. The workspace-name field does not perform a live query, so the sample leaves that optional behavior out rather than treating it as a universal requirement.

[Supporting specification](https://semi.design/en-US/input/input)

## Semi Design Design System A preference remains understandable beside its switch

### Keep the state in the parent

Switch uses checked and a Boolean-first onChange callback. The label should explain the preference, such as Weekly digest, while surrounding text explains what the setting means. Long checked and unchecked strings belong outside the tiny control, and small switches do not support those inner text treatments.

- Use a clear accessible name that identifies the preference.
- Keep the preference value when moving between wizard steps.
- Render the final value in ordinary text on the review page.

[Supporting specification](https://semi.design/en-US/input/switch)

## Semi Design Design System Button type and theme answer different questions

### Semantic role versus visual treatment

Semi Button type selects a role such as primary or danger. theme selects the visual treatment: light, solid, borderless, or outline. The sample uses a solid primary Continue action and a quieter Previous action, rather than misusing danger to make a button more visible.

The offline specimen moves focus to the new section heading when the step changes and back to the invalid field when validation fails. Its mobile layout and keyboard sequence are tested independently from the source-checked native React example.

[Supporting specification](https://semi.design/en-US/basic/button)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Offline HTML interpretation of Semi theme scales and Steps/Input/Switch behavior. Native React example is separate.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Semi workspace setup interpretation</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f6f8;color:#1c1f23;font:14px/20px Inter,system-ui,sans-serif}button,input{font:inherit}button{cursor:pointer;min-height:32px;border:0;border-radius:3px;padding:6px 16px;background:rgba(46,50,56,.05);color:inherit}button.primary{background:#0064fa;color:white}button.primary:hover{background:#0062d6}button:focus-visible,input:focus-visible{outline:2px solid #0064fa;outline-offset:3px}header{padding:20px 32px;border-bottom:1px solid rgba(28,31,35,.08);background:white;display:flex;justify-content:space-between;gap:16px}header strong{font-size:16px}header span,.muted{color:#63656a}main{max-width:950px;margin:32px auto;padding:0 24px}h1{font-size:24px;line-height:32px;font-weight:600;margin:0 0 8px}h2{font-size:20px;line-height:28px;font-weight:600;margin:0 0 12px}p{margin:0 0 16px}.card{background:white;border:1px solid rgba(28,31,35,.08);border-radius:12px;overflow:hidden;margin-top:24px}.steps{padding:24px;display:flex;list-style:none;margin:0;border-bottom:1px solid rgba(28,31,35,.08);gap:12px}.steps li{flex:1;display:flex;align-items:center;gap:8px;color:#63656a;font-size:12px}.steps b{height:24px;width:24px;border-radius:50%;display:grid;place-items:center;background:#eee;flex-shrink:0}.steps [aria-current]{color:#0064fa}.steps [aria-current] b{background:#0064fa;color:white}.steps .done b{background:#eaf5ff;color:#0064fa}.workspace{display:grid;grid-template-columns:1fr 240px;min-height:300px}.panel{padding:32px}.illustration{background:#eaf5ff;display:flex;flex-direction:column;justify-content:center;padding:24px;gap:12px}.mini{background:white;box-shadow:0 6px 20px #0064fa12;border-radius:6px;padding:16px;transform:rotate(-3deg)}.mini i{display:block;height:8px;background:#eaf5ff;width:80%;margin:8px 0;border-radius:3px}.mini i:first-child{background:#0064fa;width:36%}.mini i:nth-child(3){width:55%}.mini:last-child{transform:rotate(4deg);margin-left:20px}.mini span{font-size:12px;color:#63656a}.form-label{display:block;font-weight:600;margin:20px 0 8px}input[type=text]{height:32px;background:rgba(46,50,56,.05);border:1px solid transparent;border-radius:3px;padding:5px 12px;width:100%}input[aria-invalid=true]{border-color:#d52515}.error{color:#b21b13;min-height:20px;font-size:12px;margin:8px 0}.preference{border:1px solid #eee;border-radius:6px;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:20px}.preference p{margin:4px 0 0;font-size:12px}.toggle{appearance:none;width:40px;height:24px;border-radius:999px;background:#bbb;position:relative;cursor:pointer;flex-shrink:0}.toggle:checked{background:#0064fa}.toggle:before{content:'';position:absolute;left:3px;top:3px;background:white;border-radius:50%;width:18px;height:18px}.toggle:checked:before{left:19px}footer{display:flex;justify-content:space-between;padding:20px 32px;border-top:1px solid rgba(28,31,35,.08)}dl{margin:20px 0}dt{color:#63656a;font-size:12px}dd{margin:4px 0 20px;font-size:16px;font-weight:600;overflow-wrap:anywhere}#result{margin-top:16px;border-radius:6px;background:#eaf5ff;padding:16px}#result:empty{display:none}.boundary{font-size:12px;margin-top:20px;color:#63656a}h2:focus{outline:none}@media(max-width:600px){header{padding:16px}header span{display:none}main{margin:24px auto;padding:0 16px}.workspace{grid-template-columns:1fr}.illustration{display:none}.steps{padding:16px;gap:8px}.steps li{flex-direction:column;align-items:flex-start;gap:4px}.panel{padding:24px 20px}footer{padding:16px 20px;gap:12px}footer button{padding:6px 12px}}
</style><header><strong>◒ Workspace</strong><span>Configuration studio</span></header><main><h1>Make room for your team</h1><p class="muted">Three steps to prepare a workspace configuration.</p><div class="card"><ol class="steps" aria-label="Setup progress"><li><b>1</b>Name workspace</li><li><b>2</b>Choose updates</li><li><b>3</b>Review settings</li></ol><div class="workspace"><section class="panel" id="panel"></section><aside class="illustration" aria-hidden="true"><div class="mini"><i></i><i></i><i></i><span>A place for shared ideas</span></div><div class="mini"><i></i><i></i><i></i><span>Updates on your terms</span></div></aside></div><footer><button id="previous">Previous</button><button class="primary" id="next">Continue</button></footer></div><div id="result" role="status"></div><p class="boundary">Independent HTML interpretation of Semi’s theme and components. This example stores a draft only in memory; it does not create an account.</p></main><script>
let step=0,name='',digest=true;const panel=document.querySelector('#panel'),next=document.querySelector('#next'),previous=document.querySelector('#previous'),result=document.querySelector('#result');function render(focus=false){document.querySelectorAll('.steps li').forEach((el,i)=>{el.className=i<step?'done':'';el.removeAttribute('aria-current');if(i===step)el.setAttribute('aria-current','step')});previous.style.visibility=step?'visible':'hidden';next.textContent=step===2?'Prepare configuration':'Continue';if(step===0){panel.innerHTML='<h2 tabindex="-1">Name your workspace</h2><p class="muted">Choose a name your team will recognize.</p><label class="form-label" for="name">Workspace name</label><input id="name" type="text" placeholder="e.g. Studio North" autocomplete="organization" aria-describedby="help error"><p id="error" class="error" role="alert"></p><p id="help" class="muted">You can revisit this step before preparing the configuration.</p>';let input=document.querySelector('#name');input.value=name;input.oninput=()=>{name=input.value;input.removeAttribute('aria-invalid');document.querySelector('#error').textContent='';result.textContent=''};input.onkeydown=e=>{if(e.key==='Enter')next.click()}}else if(step===1){panel.innerHTML='<h2 tabindex="-1">Choose your updates</h2><p class="muted">Keep the weekly digest in your configuration, or switch it off.</p><label class="preference"><span><strong>Weekly digest</strong><p class="muted">A weekly summary of workspace activity.</p></span><input class="toggle" type="checkbox" role="switch" aria-label="Weekly digest" id="digest"></label>';let input=document.querySelector('#digest');input.checked=digest;input.onchange=()=>{digest=input.checked;result.textContent=''}}else{panel.innerHTML='<h2 tabindex="-1">Review settings</h2><p class="muted">Check the draft before preparing it.</p><dl><dt>Workspace name</dt><dd id="review-name"></dd><dt>Weekly digest</dt><dd id="review-digest"></dd></dl>';document.querySelector('#review-name').textContent=name.trim();document.querySelector('#review-digest').textContent=digest?'Enabled':'Disabled'}if(focus)panel.querySelector('h2').focus()}
next.onclick=()=>{if(step===0&&!name.trim()){document.querySelector('#error').textContent='Enter a workspace name.';let input=document.querySelector('#name');input.setAttribute('aria-invalid','true');input.focus();return}if(step<2){step++;render(true)}else result.textContent='Configuration prepared locally: '+name.trim()+' · Weekly digest '+(digest?'enabled':'disabled')+'. No account created.'};previous.onclick=()=>{step=Math.max(0,step-1);result.textContent='';render(true)};render();
</script></html>

```

[Code reference](https://semi.design/en-US/navigation/steps)

- Continue validates the workspace name before advancing. This document interprets the steps; the separate React entry specifies the package boundary between React 18 and 19.

### A validated three-step configuration wizard

Basic Steps tracks current progress; Input and Switch preserve values between pages. Continue validates the name and the final action prepares local configuration only.

```jsx
// React 18 example. React 19 uses @douyinfe/semi-ui-19 instead.
// npm install react@18 react-dom@18 @douyinfe/semi-ui
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Steps,Input,Switch,Button} from '@douyinfe/semi-ui';
function WorkspaceSetup(){
 const [current,setCurrent]=useState(0),[name,setName]=useState('');
 const [digest,setDigest]=useState(true),[error,setError]=useState('');
 const [prepared,setPrepared]=useState(false);
 function next(){
  if(current===0&&!name.trim()){setError('Enter a workspace name.');return;}
  setError('');setCurrent(n=>Math.min(2,n+1));
 }
 return <main style={{maxWidth:760,margin:'auto',padding:24,color:'var(--semi-color-text-0)'}}>
  <h1>Workspace setup</h1>
  <Steps type="basic" current={current} status={error?'error':'process'}>
   <Steps.Step title="Name workspace"/>
   <Steps.Step title="Choose updates"/>
   <Steps.Step title="Review settings"/>
  </Steps>
  <section style={{padding:'24px 0'}}>
   {current===0&&<><label htmlFor="workspace-name">Workspace name</label>
    <Input id="workspace-name" value={name} onChange={setName}
      validateStatus={error?'error':'default'} aria-invalid={!!error} aria-describedby="error" />
    <p id="error" role="alert">{error}</p></>}
   {current===1&&<><h2>Weekly digest</h2><p>Include a weekly activity summary in the local configuration.</p>
    <Switch checked={digest} onChange={setDigest} aria-label="Weekly digest"/></>}
   {current===2&&<><h2>Review your draft</h2><dl><dt>Workspace</dt><dd>{name}</dd>
    <dt>Weekly digest</dt><dd>{digest?'Enabled':'Disabled'}</dd></dl>
    <p>No workspace or notification subscription is created.</p></>}
  </section>
  {current>0&&<Button onClick={()=>{setCurrent(n=>n-1);setPrepared(false);}}>Previous</Button>}
  {current<2 ? <Button theme="solid" type="primary" onClick={next}>Continue</Button> :
    <Button theme="solid" type="primary" onClick={()=>setPrepared(true)}>Prepare configuration</Button>}
  <p role="status">{prepared?'Configuration prepared locally. No account created.':''}</p>
 </main>;
}
createRoot(document.getElementById('root')).render(<WorkspaceSetup />);
```

[Code reference](https://semi.design/en-US/navigation/steps)

- The React 18 example intentionally installs @douyinfe/semi-ui; React 19 requires the -19 package documented in Quick Start.
- Semi component JavaScript imports its related CSS in supported bundlers; the default setup does not require an invented global stylesheet step.
- The embedded HTML specimen has explicit focus movement; reproduce that behavior around native components in the product.

## Implementation Starting Point

Choose one dependency branch. The example uses React 18. Current Quick Start states that component JavaScript imports its related CSS in Vite/Webpack/Rspack; theme compilation has additional tooling requirements.

```bash
npm install react@18 react-dom@18 @douyinfe/semi-ui
# For a React 19 application instead:
# npm install react@19 react-dom@19 @douyinfe/semi-ui-19
```

## Agent Prompt

Use Semi basic Steps with controlled Input and Switch. Match the React package to the installed React major. Validate before advancing, retain data on Previous, and present a final local configuration without a fictitious account creation result.

## Sources

- [Quick Start](https://semi.design/en-US/start/getting-started) — React-major package split and CSS loading.
- [Theme variables](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/variables.scss) — Actual spacing, dimensions and font sizes.
- [Font mixins](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/_font.scss) — Bound line heights.
- [Runtime roles](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/global.scss) — Color roles, radii and theme selectors.
- [Palette channels](https://raw.githubusercontent.com/DouyinFE/semi-design/main/packages/semi-theme-default/scss/_palette.scss) — Resolved light and dark channel values.
- [Steps](https://semi.design/en-US/navigation/steps) — Recommended appearance and current state.
- [Input](https://semi.design/en-US/input/input) — Callbacks and validation boundaries.
- [Switch](https://semi.design/en-US/input/switch) — Controlled preference state.
- [Button](https://semi.design/en-US/basic/button) — Role and visual treatment.
