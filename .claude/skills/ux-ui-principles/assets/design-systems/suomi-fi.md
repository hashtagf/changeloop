# Suomi.fi Design System — OpenDesign Application Guide

Build readable Finnish public-service forms with Source Sans 3, explicit spacing tokens and a recoverable document-selection pattern.

The embedded preview and downloadable ZIP are an OpenDesign HTML/CSS interpretation. The separate complete React example uses suomifi-ui-components 18.0.0 and its verified FileInput value and onChange contracts. Both examples handle local file selection; neither uploads or stores a document on a server.

## Source Reference

- **Owner:** Digi- ja väestötietovirasto ([source](https://designsystem.suomi.fi/info))
- **Resources:** Styles, components, patterns and principles ([source](https://designsystem.suomi.fi/))
- **Implementation:** React components with TypeScript support ([source](https://github.com/vrk-kpa/suomifi-ui-components))
- **Package:** suomifi-ui-components ([source](https://github.com/vrk-kpa/suomifi-ui-components))
- **Pattern examples:** Validation, multiple entries, dates and filtered tables ([source](https://designsystem.suomi.fi/patterns/))
- **Brand boundary:** The Suomi.fi logo is reserved for services in the Suomi.fi brand family ([source](https://designsystem.suomi.fi/info))


## Design Reference

Official documentation, inspected token repository and suomifi-ui-components 18.0.0 metadata. Preview is an original interpretation, not the native React runtime.

### Typography

[Official reference](https://designsystem.suomi.fi/components/text/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Family | Source Sans 3 | Version 18; version 17 and earlier used Source Sans Pro. Load fonts separately. |
| Body text | 18px | Same default on mobile and desktop. |
| Small body | 16px | Text smallScreen treatment, not an automatic viewport rule. |
| Lead | 22px / 20px smallScreen | One introduction per view; do not use lead for every paragraph. |
| Weights | 300 / 400 / 600 | Font assets required by component package. |

### Spacing and surfaces

[Official reference](https://github.com/vrk-kpa/suomifi-design-tokens/blob/master/src/tokens.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Space scale | 5, 10, 15, 20, 25, 30, 40, 60, 80px | xxs through xxxxl in inspected repository JSON. |
| Inset scale | 2, 4, 6, 8, 10, 16, 20px | insetXxs through insetXxl; not the outer spacing scale. |
| Basic radius | 2px | Repository radius.basic; do not infer a large card radius. |
| Highlight base | hsl(212, 63%, 45%) | Default interactive blue. |
| Highlight dark 1 | hsl(212, 63%, 37%) | Darker interaction role. |
| Highlight light 2 | hsl(212, 63%, 90%) | Light surface role; verify contrast against chosen text. |

### FileInput layout and language

[Official reference](https://designsystem.suomi.fi/components/fileinput/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Default maximum width | 600px | Component-specific width, not a whole-site grid. |
| fullWidth | Boolean layout option | Stretch within the parent when the form needs it. |
| smallScreen | Explicit compact presentation option | Do not invent a global automatic breakpoint from this prop. |
| Single selection | Chosen file replaces picker and drop area | Multiple selection is a separate pattern with files listed below. |
| Required copy roles | labelText, hintText, dragAreaText, removeFileText, addedFileAriaText | Localize each role; filename alone is not a full accessible announcement. |

## Suomi.fi Design System Implementation boundary

### React component system

Suomi.fi provides React components styled through styled-components and a separate token package. Version 18 switches the expected font to Source Sans 3. Existing version 17 pages may still use Source Sans Pro; comparing those screenshots without checking the package version can produce a false typography correction.

The embedded preview remains an explicitly labelled HTML/CSS interpretation of the documented single-file pattern. A separate native React FileInput example is now included below with its verified callback, controlled value, dependencies and font imports. These are two implementations of the same local selection task; the native example does not retroactively turn the embedded HTML preview into the React component.

[Supporting specification](https://github.com/vrk-kpa/suomifi-ui-components)

## Suomi.fi Design System Typography and font loading

### Keep prose readable

Use the documented 18px body size on both mobile and desktop. A narrow viewport is not permission to reduce all form explanations. The small text treatment is 16px and belongs to secondary information. Lead text is 22px, reduced to 20px with the compact treatment; reserve it for the page introduction.

Load the intended font weights before comparing line wrapping. The component package expects Source Sans 3 assets, while this independent preview deliberately uses Arial. That substitution is visible in the preview note and must not be presented as an exact rendering of the native component.

[Supporting specification](https://designsystem.suomi.fi/components/text/)

## Suomi.fi Design System Spacing and width

### Two different spacing scales

The token source separates ordinary spacing from inset spacing. Ordinary l is 25px in the inspected JSON; do not copy an older README example that describes l as 32px. Insets begin at 2px and step through a different sequence. Use actual exports from the installed version when generating styles.

FileInput has a documented 600px maximum width and a fullWidth option. This is a component constraint, not evidence for a universal 600px page container. A document intake form can place the field inside a wider layout while keeping explanatory text close to its label.

[Supporting specification](https://github.com/vrk-kpa/suomifi-design-tokens/blob/master/src/tokens.json)

## Suomi.fi Design System File selector anatomy

### Copy is part of the component contract

The visible label names the requested document. The hint explains supported formats, file size and count before a person opens the chooser. The drop area adds a pointer shortcut but must not replace the file input. Official guidance describes the choose control as the label of a hidden native file input.

In single-file mode, the selected document replaces the picker and drop region. Keep a clear removal action next to that document. Multiple-file mode uses a different list arrangement; do not silently append additional files to a single-file request.

- labelText: name the evidence or document requested, not merely “Upload”.
- removeFileText: make the removal action understandable in the file context.
- addedFileAriaText: provide selection context before the filename is announced.

[Supporting specification](https://designsystem.suomi.fi/components/fileinput/)

## Suomi.fi Design System Selection and recovery

### A local attachment state machine

The example accepts one PDF no larger than 5,000,000 bytes. Those are application rules chosen for this workshop scenario. They are not package defaults or an official Suomi.fi upload policy. Browser accept filtering is only a chooser hint; the example independently checks the filename and size after selection or drop.

Invalid metadata leaves the picker available and explains how to recover. A valid choice displays its name using textContent, reports the byte count and moves focus to the removal control. Removing it clears the underlying input value, restores the chooser and returns focus, allowing the same file to be selected again.

1. Select or drop exactly one file; reject multiple files with a specific message.
2. Check the local example rules and announce either the error or selected filename.
3. Remove the attachment and restore the original selection affordance.

[Supporting specification](https://designsystem.suomi.fi/components/fileinput/)

## Suomi.fi Design System Native integration

### Install a matched dependency set

The version 18.0.0 published FileInput implementation calls onChange with a FileList, not a React change event. Controlled value is an array of file-item objects; the example maps each accepted File to { file }. The same callback runs when the built-in remove action changes the list, so an empty FileList clears the controlled array. These contracts were checked in the published dist/esm/core/Form/FileInput/FileInput.js module.

Keep value controlled from the first render by starting with an empty array. Validate the incoming FileList before mapping it into that array. This example rejects files whose names do not end in .pdf or whose size exceeds 5,000,000 bytes, and clears the selection on rejection. Those are local example rules, not a security check or a Suomi.fi policy. Server-side content validation remains necessary before accepting an actual upload.

The native example below loads Source Sans 3 at weights 400 and 600, mounts React into an explicit root element and uses styled-components through the library. Include tslib explicitly: the 18.0.0 ESM modules import its helpers, and a clean build without that dependency failed. The pinned setup below includes the missing runtime and the font assets. No extra theme provider is needed for this default-theme example.

[Supporting specification](https://www.npmjs.com/package/suomifi-ui-components/v/18.0.0)

### Use verified token exports

The official styles guide demonstrates suomifiDesignTokens.spacing and suomifiDesignTokens.colors. The example below uses those exported paths for a custom wrapper; it is not a replacement implementation of FileInput internals.

```tsx
import { suomifiDesignTokens } from 'suomifi-design-tokens';
// Real exported token paths. Use values instead of copying README example numbers.
const attachmentStyle = {
  maxWidth: 600,
  padding: suomifiDesignTokens.spacing.m,
  borderColor: suomifiDesignTokens.colors.highlightBase
};
```

[Code reference](https://designsystem.suomi.fi/styles)

[Supporting specification](https://designsystem.suomi.fi/styles)

## Suomi.fi Design System Accessibility and responsive use

### Reach the field without dragging

Keep a keyboard-operable native file input even when the drop area is prominent. Associate its hint and error through aria-describedby. Announce selection changes and removal without reading the entire page again. A remove button should identify the selected file when several such controls could occur in a form.

The official smallScreen prop provides compact presentation. It does not establish a global breakpoint. This independent preview uses an application-specific 480px padding adjustment while keeping body text at 18px. Test long filenames, zoom and translated labels; wrap filenames without forcing the whole page wider.

[Supporting specification](https://designsystem.suomi.fi/components/fileinput/)

## Suomi.fi Design System Production responsibilities

### A selected file is not an uploaded file

The demo never reads document contents or sends a request. A selected filename and byte count do not prove that a document is valid, stored or accepted. Real services need server-side validation, upload progress, recoverable failure, retention rules and a confirmation tied to an actual response.

The component code is MIT licensed. That code license does not authorize an independent project to represent itself as a Finnish government service or use restricted institutional identity. Use a neutral project name for experiments and obtain the appropriate branding guidance for an official implementation.

[Supporting specification](https://github.com/vrk-kpa/suomifi-ui-components)

## Component Examples

### Use official token exports

Verified spacing and colour export paths for a custom wrapper.

```tsx
import { suomifiDesignTokens } from 'suomifi-design-tokens';
// Real exported token paths. Use values instead of copying README example numbers.
const attachmentStyle = {
  maxWidth: 600,
  padding: suomifiDesignTokens.spacing.m,
  borderColor: suomifiDesignTokens.colors.highlightBase
};
```

[Code reference](https://designsystem.suomi.fi/styles)

### Single-file selection and removal

Complete local interpretation. PDF and size limits are scenario choices; no upload occurs.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Attachment example</title><style>*{box-sizing:border-box}body{margin:0;padding:30px 20px;font:18px/1.5 Arial,sans-serif;color:#202020;background:#fff}main{max-width:600px;margin:auto}h1{font-size:32px;line-height:1.2;font-weight:400;margin:0 0 20px}p{margin:0 0 20px}label{font-weight:600;display:block}small{display:block;font-size:16px}.drop{margin-top:15px;border:2px dashed hsl(212,63%,45%);padding:30px;text-align:center;background:hsl(212,63%,90%)}button,input::file-selector-button{font:600 18px Arial;padding:12px 20px;border:1px solid hsl(212,63%,37%);border-radius:2px;background:hsl(212,63%,45%);color:white;cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #202020;outline-offset:3px}input{width:100%;font-size:16px;margin:15px 0}input::file-selector-button{margin-right:10px}.file{border:1px solid #777;padding:20px;margin:20px 0;overflow-wrap:anywhere}.file button{margin-top:15px;background:white;color:hsl(212,63%,37%)}#error{color:#a32020;font-weight:bold}footer{font-size:14px;margin-top:30px;border-top:1px solid #ccc;padding-top:15px}[hidden]{display:none!important}@media(max-width:480px){body{padding:20px 15px}.drop{padding:20px}h1{font-size:28px}}</style><main><small>COMMUNITY WORKSHOP · ATTACHMENT</small><h1>Add your project outline</h1><p>Choose one PDF up to 5 MB. This local example checks file metadata; it does not read or send the document.</p><div id="picker"><label for="file">Project outline</label><small id="hint">One PDF file. Maximum 5 MB (5,000,000 bytes).</small><input id="file" type="file" accept=".pdf,application/pdf" aria-describedby="hint error"><div class="drop" id="drop">Or drop one PDF here</div></div><p id="error" role="alert" hidden></p><section id="selected" class="file" hidden aria-label="Selected attachment"><strong id="name"></strong><small id="size"></small><button id="remove" type="button">Remove file</button></section><p id="status" role="status">No file selected.</p><footer>OpenDesign interpretation of the Suomi.fi attachment pattern. Arial fallback; no official identity or React component runtime. PDF and 5 MB are example rules.</footer></main><script>const input=document.querySelector('#file'),picker=document.querySelector('#picker'),selected=document.querySelector('#selected'),error=document.querySelector('#error'),status=document.querySelector('#status');function choose(files){error.hidden=true;if(files.length!==1){error.textContent='Choose exactly one file.';error.hidden=false;input.value='';return}const file=files[0];if(!/\.pdf$/i.test(file.name)||file.size>5000000){error.textContent='Choose a PDF no larger than 5 MB.';error.hidden=false;input.setAttribute('aria-invalid','true');input.value='';return}input.removeAttribute('aria-invalid');document.querySelector('#name').textContent=file.name;document.querySelector('#size').textContent=file.size.toLocaleString('en')+' bytes · selected locally';document.querySelector('#remove').setAttribute('aria-label','Remove '+file.name);picker.hidden=true;selected.hidden=false;status.textContent='Selected file: '+file.name;document.querySelector('#remove').focus()}input.addEventListener('change',()=>{if(input.files.length)choose(input.files)});document.querySelector('#drop').addEventListener('dragover',e=>e.preventDefault());document.querySelector('#drop').addEventListener('drop',e=>{e.preventDefault();choose(e.dataTransfer.files)});document.querySelector('#remove').onclick=()=>{input.value='';picker.hidden=false;selected.hidden=true;error.hidden=true;input.removeAttribute('aria-invalid');status.textContent='File removed. Choose another file.';input.focus()};</script></html>
```

[Code reference](https://designsystem.suomi.fi/components/fileinput/)

- Not the native React component.
- For a production service, validate file contents on the server.

### Native FileInput with controlled validation

Save as main.jsx. Together these three files reproduce the native React example using the setup commands.

```jsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FileInput } from 'suomifi-ui-components';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import './app.css';
function App() {
  const [value, setValue] = useState([]);
  const [error, setError] = useState('');
  function change(files) {
    const next = Array.from(files);
    const invalid = next.length > 1 || next.some(file => !/\.pdf$/i.test(file.name) || file.size > 5000000);
    if (invalid) {
      setValue([]);
      setError('Choose one PDF no larger than 5 MB.');
      return;
    }
    setValue(next.map(file => ({ file })));
    setError('');
  }
  return <main><h1>Select a workshop document</h1><p>This local example does not upload or read the document.</p>
    <FileInput id="document" labelText="Workshop document" hintText="One PDF, maximum 5 MB (5,000,000 bytes)."
      inputButtonText="Choose PDF" dragAreaText="or drop a PDF here" removeFileText="Remove file"
      addedFileAriaText="Selected file" accept=".pdf" value={value} onChange={change}
      status={error ? 'error' : 'default'} statusText={error} />
    <p role="status">{value.length ? `${value[0].file.name} selected locally.` : 'No file selected.'}</p>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);

```

[Code reference](https://www.npmjs.com/package/suomifi-ui-components/v/18.0.0)

- The application handles validation; the native component supplies selection, removal and its accessible file controls.

### Native example page layout

Save as app.css. Together these three files reproduce the native React example using the setup commands.

```css
body{margin:0;font:18px/1.5 'Source Sans 3',sans-serif;color:#292929;background:#fff}main{max-width:600px;margin:0 auto;padding:24px}h1{font-size:32px;line-height:1.2}*{box-sizing:border-box}

```

[Code reference](https://www.npmjs.com/package/suomifi-ui-components/v/18.0.0)

- The application handles validation; the native component supplies selection, removal and its accessible file controls.

### Native example mount and emitted assets

Save as index.html. Together these three files reproduce the native React example using the setup commands.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Native Suomi.fi FileInput</title><link rel="stylesheet" href="./app.css"><div id="root"></div><script type="module" src="./app.js"></script></html>

```

[Code reference](https://www.npmjs.com/package/suomifi-ui-components/v/18.0.0)

- The application handles validation; the native component supplies selection, removal and its accessible file controls.

## Implementation Starting Point

This builds the native React example below, including local Source Sans 3 font files. Tested with invalid format, valid selection, built-in removal and an oversized PDF at 390px and 1440px. The existing downloadable preview ZIP is the separate HTML/CSS interpretation; its README remains accurate.

```bash
npm install --save-exact suomifi-ui-components@18.0.0 react@18.3.1 react-dom@18.3.1 styled-components@6.5.3 tslib@2.8.1 @fontsource/source-sans-3@5.3.0
npm install --save-dev --save-exact esbuild@0.28.2
# Save main.jsx, app.css and index.html from the complete examples below.
npx esbuild main.jsx --bundle --outdir=dist --entry-names=app --loader:.woff=copy --loader:.woff2=copy
cp index.html dist/index.html
python3 -m http.server 8080 --directory dist
# Open http://localhost:8080
```

## Agent Prompt

Use the supplied native Suomi.fi FileInput 18.0.0 React example with Source Sans 3 and the pinned runtime dependencies, including tslib. Control value as an array of { file } objects and receive FileList directly in onChange; do not read event.target from that callback. Validate format and size before accepting a local selection, handle the empty list emitted by removal, and keep hint and error text visible. Treat the embedded HTML preview as a separately labelled interpretation. Neither implementation uploads a file; server validation, progress and confirmed storage require an actual backend contract.

## Sources

- [FileInput guidance](https://designsystem.suomi.fi/components/fileinput/) — Anatomy, copy roles, widths and single/multiple selection behavior.
- [Typography](https://designsystem.suomi.fi/styles/typography/) — Source Sans 3 and version transition.
- [Text component](https://designsystem.suomi.fi/components/text/) — Body, small and lead text sizes.
- [Token source](https://github.com/vrk-kpa/suomifi-design-tokens/blob/master/src/tokens.json) — Actual spacing, color and radius values.
- [Component repository](https://github.com/vrk-kpa/suomifi-ui-components) — React implementation, dependencies and MIT license.
- [Download complete working example](/assets/demos/suomi-fi-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
- [Verified FileInput 18.0.0 implementation](https://www.npmjs.com/package/suomifi-ui-components/v/18.0.0) — Published package source: dist/esm/core/Form/FileInput/FileInput.js. The controlled value and FileList callback were checked against this release and exercised in a separate native build.
