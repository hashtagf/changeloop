# Esri Calcite Design System — OpenDesign Application Guide

A practical Calcite reference for focused spatial tools: semantic surfaces and blue actions, compact inspection panels, real input APIs, and a complete local site-review specimen.

OpenDesign application guide. The illustrated example is independently implemented and uses fictional data. Current Calcite use is governed by Esri licensing and requires an eligible ArcGIS account; the native integration example is an alternative for appropriately licensed projects, not the runtime of this preview.

## Source Reference

- **Component reference:** 5.1.2 ([source](https://developers.arcgis.com/calcite-design-system/get-started/))
- **Token reference:** 4.1.0 ([source](https://cdn.jsdelivr.net/npm/@esri/calcite-design-tokens@4.1.0/dist/css/global.css))
- **Preview:** Independent HTML/CSS interpretation ([source](https://developers.arcgis.com/calcite-design-system/))


## Design Reference

Calcite design tokens 4.1.0 and current component API, checked alongside Components 5.1.2. Token package and component package have separate version numbers. The embedded specimen is an original HTML/CSS interpretation; it does not redistribute the Calcite runtime or claim native behavior.

### Light theme surfaces, text and interaction

[Official reference](https://cdn.jsdelivr.net/npm/@esri/calcite-design-tokens@4.1.0/dist/css/light.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --calcite-color-surface-1 | #f7f7f7 | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-surface-2 | #ffffff | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-surface-3 | #f2f2f2 | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-surface-4 | #ebebeb | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-surface-highlight | #d6efff | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-text-1 | #141414 | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-text-2 | #4a4a4a | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-text-3 | #6b6b6b | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-text-inverse | #ffffff | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-text-link | #00619b | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-border-1 | #d4d4d4 | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-border-2 | #dedede | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-border-3 | #ebebeb | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-border-input | #949494 | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-brand | #007ac2 | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-brand-hover | #00619b | Semantic reference for the role named by the token; selection and field borders need different contrast. |
| --calcite-color-brand-press | #004874 | Semantic reference for the role named by the token; selection and field borders need different contrast. |

### Current spacing scale

[Official reference](https://cdn.jsdelivr.net/npm/@esri/calcite-design-tokens@4.1.0/dist/css/global.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --calcite-space-none | 0 | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-px | 1px | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-base | 2px | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-2xs | 0.25rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-xs | 0.375rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-sm | 0.5rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-sm-plus | 0.625rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-md | 0.75rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-md-plus | 0.875rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-lg | 1rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-xl | 1.25rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-2xl | 1.5rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-3xl | 2rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |
| --calcite-space-4xl | 2.75rem | Current space token family. Rem-based steps follow the root size; avoid mixing it with deprecated spacing aliases. |

### Type and corner scale

[Official reference](https://cdn.jsdelivr.net/npm/@esri/calcite-design-tokens@4.1.0/dist/css/global.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --calcite-corner-radius-none | 0 | Published values, not measurements inferred from a screenshot. |
| --calcite-corner-radius-xs | 2px | Published values, not measurements inferred from a screenshot. |
| --calcite-corner-radius-sm | 4px | Published values, not measurements inferred from a screenshot. |
| --calcite-corner-radius-pill | 9999px | Published values, not measurements inferred from a screenshot. |
| --calcite-font-size-xs | 10px | Published values, not measurements inferred from a screenshot. |
| --calcite-font-size-sm | 12px | Published values, not measurements inferred from a screenshot. |
| --calcite-font-size | 14px | Published values, not measurements inferred from a screenshot. |
| --calcite-font-size-md | 16px | Published values, not measurements inferred from a screenshot. |
| --calcite-font-size-lg | 18px | Published values, not measurements inferred from a screenshot. |
| --calcite-font-size-xl | 20px | Published values, not measurements inferred from a screenshot. |
| --calcite-font-size-2xl | 24px | Published values, not measurements inferred from a screenshot. |

### Input component API

[Official reference](https://developers.arcgis.com/calcite-design-system/components/input/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| scale | s / m / l; default m | Change component scale deliberately; not the same as changing page zoom. |
| status | idle / valid / invalid | Communicate field validity with a message, not only color. |
| labelText | string | Visible label text on the current input API. |
| validationMessage | string | Explain the invalid entry beside the control. |
| calciteInputInput | event | Read event.target.value as the user types. |
| setFocus() | Promise<void> | Move focus into the native component after an application validation error. |

## Esri Calcite Design System Workspace and Panel Architecture

### Keep the object context visible

A spatial task usually has at least two contexts: the area being inspected and the selected object. The example keeps a small site list next to an original schematic and an inspector. Selecting a list row or a pin sets the same stable site ID, so the name, status and note cannot accidentally refer to different objects.

### Separate the illustration from a real map

The SVG communicates the relationship between a list and a spatial surface. It has no projection, coordinates, layers, zoom, geocoding or routing. Its visible caption says schematic and not to scale. A production ArcGIS view needs its own SDK integration, data and accessibility work; a Calcite shell alone does not supply those capabilities.

## Esri Calcite Design System Semantic Color Roles

### Use surfaces to divide tools without heavy cards

The reference differentiates surface-1 through surface-4, with surface-highlight reserved for emphasis. The specimen uses a white inspector against a quiet off-white canvas and a pale blue selected row. Thin neutral borders identify panel boundaries without adding a floating card around every field.

### Give blue a consistent interaction meaning

Brand, hover and press colors form a darker sequence from #007ac2 to #00619b and #004874. The selected pin and primary save action use that family for different interaction roles. Written review states and the note validation message remain legible without relying on their color alone.

## Esri Calcite Design System Type and Information Density

### Preserve the small information hierarchy

The published absolute type references include 12px small text, 14px base text, 16px medium and 20px extra-large. The sample pairs a 20px workspace title with 16px panel headings and 14px controls. Metadata is smaller but never the only place where the selected object is identified.

### Distinguish a fallback from the branded font

This independent specimen uses Arial and system fallbacks. It does not bundle Esri branded fonts or label that fallback as Avenir. An authorized native integration should follow the assets and theme setup of its pinned Calcite release. Changing the font can affect line wraps and control widths, so test the actual deployed asset set.

## Esri Calcite Design System Space Tokens and Responsive Panels

### Choose current token names

The reference uses the current --calcite-space-* scale, which mixes pixel values for the smallest steps and rem values for larger spacing. Use these named roles consistently when implementing a native theme. The application layout in this specimen uses explicit CSS values so the interpretation can run without importing restricted packages.

### Reflow the inspector before compressing the field

At the original application breakpoint, the inspector moves below the list and illustration. On a narrow phone the three regions become a vertical sequence. The textarea remains full width with its label, helper and save action. These breakpoints are authored layout choices, not claimed Calcite token values.

## Esri Calcite Design System Selection and Filtering Behavior

### Use one selected identifier

The list and schematic share selection through A-01, B-02 and C-03, not their current array position. Filtering to Checked selects the available matching site, and the inspector follows. Pressed states are exposed on both the list button and its corresponding pin.

### Keep saved notes separate from unsaved drafts

A saved note is stored in a Map keyed by site ID. Returning to that site restores it; changing sites without saving replaces the unsaved text. The helper explicitly states the local lifetime. A production editor should add unsaved-change protection if losing a draft would have a material cost.

## Esri Calcite Design System Input Validation and Recovery

### Use the actual native input API when adopting Calcite

The native example uses labelText, value, status and validationMessage. The calciteInputInput event can clear a stale error while setFocus() returns attention to the component after a failed application rule. These are public API names, unlike reaching into a shadow root to find an internal input.

### Do not confuse local confirmation with service persistence

The independent preview requires at least ten trimmed characters and limits the field to 240. Its confirmation identifies the site and explicitly says locally. Reloading clears notes. A network-backed version would need pending, failure, retry and conflict behavior; none is implied by the local saved message.

1. Try saving an empty or short note and read the error.
2. Enter a longer note, save, select another site, then return.
3. Reload to confirm that the specimen makes no persistence promise.

## Esri Calcite Design System Accessible Spatial Alternatives

### Provide a list equivalent to each pin

Every actionable pin has a text button in the site list. The illustrated map is therefore not the only way to select an object. Its SVG receives a concise description, while controls have their own names and visible focus outlines. A real map requires more than copying the schematic alternative text.

### Place validation next to its field

The textarea references both the helper and error through aria-describedby. On failure it receives aria-invalid and focus; editing removes the stale invalid state. Confirmation uses a status region. Keyboard users can select a site, enter a note and save it without interacting with a drawn geographic shape.

## Esri Calcite Design System Version and Integration Boundaries

### Pin packages and inspect the licensing requirements

Components 5.1.2 and design tokens 4.1.0 are distinct packages. The current licensing page describes availability with an ArcGIS Online, Enterprise or Location Platform account. Do not carry an assumption about an older open-source release into the current package. The native source below is for a project that has satisfied those requirements.

- Components: 5.1.2.
- Design-token reference: 4.1.0.
- Preview: independent HTML, CSS and JavaScript; no Esri runtime.

### Register only the components you use

The minimal module example imports the input and button component entry points, then uses their public properties and events. The independent full HTML example can run alone; the native fragment is an alternative entry for a Vite project with the pinned package installed. It has been checked against the public API, not represented as the compiled runtime behind the schematic.

## Component Examples

### Independent site inspection specimen

Complete standalone HTML, CSS and JavaScript used by this preview. Save it as index.html and open it in a browser.

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" /><meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  /><title>Site inspection panel</title
  ><style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font:
        14px/1.5 Arial,
        sans-serif;
      color: #141414;
      background: #f7f7f7;
    }
    button,
    input,
    select,
    textarea {
      font: inherit;
    }
    button {
      cursor: pointer;
    }
    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
      outline: 2px solid #007ac2;
      outline-offset: 3px;
    }
    header {
      padding: 20px 24px;
      background: #fff;
      border-bottom: 1px solid #d4d4d4;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
    }
    h1 {
      font-size: 20px;
      margin: 0;
    }
    header p {
      margin: 2px 0 0;
      color: #6b6b6b;
      font-size: 12px;
    }
    .badge {
      background: #d6efff;
      color: #004874;
      padding: 4px 8px;
      font-size: 12px;
    }
    .layout {
      display: grid;
      grid-template-columns: 240px minmax(0, 1fr) 280px;
      min-height: 510px;
    }
    .sites,
    .inspector {
      background: #fff;
      padding: 20px;
      border-right: 1px solid #d4d4d4;
    }
    .inspector {
      border-right: 0;
      border-left: 1px solid #d4d4d4;
    }
    h2 {
      font-size: 16px;
      margin: 0 0 16px;
    }
    label {
      display: block;
      font-weight: 600;
      margin: 12px 0 6px;
    }
    select,
    textarea {
      width: 100%;
      border: 1px solid #949494;
      background: #fff;
      padding: 8px;
      color: inherit;
    }
    textarea {
      resize: vertical;
      min-height: 96px;
    }
    .site {
      display: block;
      width: 100%;
      text-align: left;
      background: #fff;
      border: 1px solid #dedede;
      padding: 12px;
      margin-top: 8px;
    }
    .site[aria-pressed="true"] {
      border-left: 4px solid #007ac2;
      background: #d6efff;
    }
    .site small {
      display: block;
      color: #4a4a4a;
      margin-top: 3px;
    }
    .map {
      position: relative;
      overflow: hidden;
      min-height: 360px;
      background: #ebebe5;
    }
    .map svg {
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
    }
    .map-caption {
      position: absolute;
      bottom: 12px;
      left: 12px;
      padding: 4px 8px;
      background: #fff;
      font-size: 12px;
    }
    .pin {
      position: absolute;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid #fff;
      background: #007ac2;
      color: #fff;
      font-weight: bold;
      box-shadow: 0 2px 8px #0004;
    }
    .pin[aria-pressed="true"] {
      background: #004874;
      outline: 3px solid #007ac2;
      outline-offset: 3px;
    }
    .pin[hidden] {
      display: none;
    }
    dl {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 12px;
    }
    dt {
      color: #6b6b6b;
    }
    dd {
      margin: 0;
      text-align: right;
    }
    .primary {
      background: #007ac2;
      color: white;
      border: 0;
      width: 100%;
      padding: 10px;
      margin-top: 12px;
    }
    .primary:hover {
      background: #00619b;
    }
    .error {
      color: #a11b1b;
      font-size: 12px;
    }
    .saved {
      color: #237000;
      font-size: 12px;
    }
    footer {
      padding: 16px 24px;
      border-top: 1px solid #d4d4d4;
      color: #6b6b6b;
      font-size: 12px;
      background: #fff;
    }
    @media (max-width: 1000px) {
      .layout {
        grid-template-columns: 210px minmax(0, 1fr);
      }
      .inspector {
        grid-column: 1/-1;
        border-left: 0;
        border-top: 1px solid #d4d4d4;
      }
      .inspector form {
        max-width: 640px;
      }
    }
    @media (max-width: 550px) {
      header {
        align-items: flex-start;
        flex-direction: column;
      }
      .layout {
        display: flex;
        flex-direction: column;
      }
      .sites {
        border-right: 0;
      }
      .map {
        height: 300px;
        min-height: 300px;
      }
      .inspector {
        padding: 20px;
      }
      .site {
        display: inline-block;
        width: 100%;
      }
    }
  </style>
  <body>
    <header>
      <div>
        <h1>Field inspection workspace</h1>
        <p>Original Calcite-inspired layout study · fictional site data</p>
      </div>
      <span class="badge">Local notes only</span>
    </header>
    <main class="layout">
      <aside class="sites">
        <h2>Inspection sites</h2>
        <label for="filter">Show sites</label
        ><select id="filter">
          <option value="all">All sites</option>
          <option value="review">Needs review</option>
          <option value="checked">Checked</option>
        </select>
        <div id="site-list"></div>
        <p id="count" aria-live="polite"></p>
      </aside>
      <section class="map" aria-label="Illustrated site plan">
        <svg
          viewBox="0 0 700 510"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Original schematic with a river, roads and three inspection sites; not a geographic map"
        >
          <rect width="700" height="510" fill="#e4e8db" />
          <path
            d="M480 -50Q230 110 440 260T360 570"
            fill="none"
            stroke="#b6dbe9"
            stroke-width="100"
          />
          <path
            d="M-20 150L720 280M160 -20L290 530M-20 400L720 80"
            stroke="#fff"
            stroke-width="22"
          />
          <path
            d="M-20 150L720 280M160 -20L290 530M-20 400L720 80"
            stroke="#c8c8bf"
            stroke-width="2"
          />
          <g fill="#c4cfb5">
            <rect x="50" y="50" width="100" height="70" />
            <rect x="510" y="340" width="130" height="80" />
            <rect x="80" y="260" width="70" height="60" />
          </g>
        </svg>
        <div id="pins"></div>
        <span class="map-caption">Schematic illustration · not to scale</span>
      </section>
      <aside class="inspector">
        <h2 id="site-title">North access</h2>
        <dl>
          <dt>Site ID</dt>
          <dd id="site-id"></dd>
          <dt>Review state</dt>
          <dd id="site-state"></dd>
        </dl>
        <form id="note-form" novalidate>
          <label for="note">Inspection note</label
          ><textarea
            id="note"
            aria-describedby="note-help error"
            maxlength="240"
          ></textarea>
          <p id="note-help">
            Add 10–240 characters. Notes stay in this page until reload.
          </p>
          <p id="error" class="error" hidden>
            Write at least 10 characters before saving.
          </p>
          <button class="primary" type="submit">Save local note</button>
          <p id="saved" class="saved" role="status"></p>
        </form>
      </aside>
    </main>
    <footer>
      Independent HTML/CSS interpretation by OpenDesign. No Calcite runtime,
      Esri fonts, ArcGIS map or service is loaded.
    </footer>
    <script>
      const sites = [
        { id: "A-01", name: "North access", state: "review", x: 29, y: 24 },
        { id: "B-02", name: "River crossing", state: "review", x: 62, y: 48 },
        { id: "C-03", name: "South garden", state: "checked", x: 34, y: 76 },
      ];
      let selected = "A-01";
      const notes = new Map(),
        list = document.querySelector("#site-list"),
        pins = document.querySelector("#pins"),
        filter = document.querySelector("#filter"),
        note = document.querySelector("#note"),
        error = document.querySelector("#error"),
        saved = document.querySelector("#saved");
      function render() {
        const visible = sites.filter(
          (s) => filter.value === "all" || s.state === filter.value,
        );
        if (!visible.some((s) => s.id === selected)) selected = visible[0]?.id;
        list.replaceChildren();
        pins.replaceChildren();
        for (const s of visible) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "site";
          b.setAttribute("aria-pressed", String(s.id === selected));
          b.textContent = s.name;
          const small = document.createElement("small");
          small.textContent =
            s.id + " · " + (s.state === "review" ? "Needs review" : "Checked");
          b.append(small);
          b.onclick = () => {
            selected = s.id;
            render();
          };
          list.append(b);
          const pin = document.createElement("button");
          pin.type = "button";
          pin.className = "pin";
          pin.style.left = s.x + "%";
          pin.style.top = s.y + "%";
          pin.textContent = s.id[0];
          pin.setAttribute("aria-label", "Select " + s.name);
          pin.setAttribute("aria-pressed", String(s.id === selected));
          pin.onclick = b.onclick;
          pins.append(pin);
        }
        const s = sites.find((s) => s.id === selected);
        document.querySelector("#count").textContent =
          visible.length + " sites shown";
        document.querySelector("#site-title").textContent = s.name;
        document.querySelector("#site-id").textContent = s.id;
        document.querySelector("#site-state").textContent =
          s.state === "review" ? "Needs review" : "Checked";
        note.value = notes.get(s.id) || "";
        error.hidden = true;
        note.removeAttribute("aria-invalid");
        saved.textContent = "";
      }
      filter.onchange = render;
      note.oninput = () => {
        error.hidden = true;
        note.removeAttribute("aria-invalid");
        saved.textContent = "";
      };
      document.querySelector("#note-form").onsubmit = (e) => {
        e.preventDefault();
        const value = note.value.trim();
        if (value.length < 10) {
          error.hidden = false;
          note.setAttribute("aria-invalid", "true");
          note.focus();
          return;
        }
        notes.set(selected, value);
        saved.textContent = "Note saved locally for " + selected + ".";
      };
      render();
    </script>
  </body>
</html>

```

[Code reference](https://cdn.jsdelivr.net/npm/@esri/calcite-design-tokens@4.1.0/dist/css/light.css)

- Original schematic and application behavior. No map SDK, remote data or Esri runtime is included.

### Native Calcite input alternative

Replace src/main.js in a Vite vanilla project whose index.html contains <div id="app"></div>.

```js
import "@esri/calcite-components/components/calcite-input";
import "@esri/calcite-components/components/calcite-button";

document.querySelector("#app").innerHTML = `
  <calcite-input id="inspection-note" label-text="Inspection note"
    validation-message="Enter at least ten characters"></calcite-input>
  <calcite-button id="save-note">Validate note</calcite-button>
  <p id="result" role="status"></p>`;
const field = document.querySelector("#inspection-note");
const result = document.querySelector("#result");
field.addEventListener("calciteInputInput", () => {
  field.status = "idle";
  result.textContent = "";
});
document.querySelector("#save-note").addEventListener("click", async () => {
  if (field.value.trim().length < 10) {
    field.status = "invalid";
    await field.setFocus();
    return;
  }
  field.status = "valid";
  result.textContent = "The note passes the local rule. Nothing was sent.";
});
```

[Code reference](https://developers.arcgis.com/calcite-design-system/components/input/)

- Install @esri/calcite-components@5.1.2 after reviewing the current licensing requirements. This alternative was API-checked; the independent preview above is the browser-tested specimen.

## Implementation Starting Point

The native component package requires an eligible ArcGIS account under the current licensing terms. Review asset-path requirements when self-hosting component assets.

```sh
# Independent specimen: save the complete HTML example as index.html.
# Native alternative for an appropriately licensed project:
npm create vite@latest calcite-note -- --template vanilla
cd calcite-note
npm install
npm install @esri/calcite-components@5.1.2
# Replace src/main.js with the native input example.
npm run dev
```

## Agent Prompt

Build a focused spatial inspection workspace using the Calcite references. Keep the selected object ID consistent between list and inspector, expose written states, and distinguish local notes from service persistence. Use the standalone interpretation as the starting point or deliberately choose the licensed native component path. Do not describe the original schematic as an ArcGIS map.

## Sources

- [Calcite Input API](https://developers.arcgis.com/calcite-design-system/components/input/) — Field properties, events and focus method.
- [Calcite Getting Started](https://developers.arcgis.com/calcite-design-system/get-started/) — Component registration and asset setup.
- [Current Licensing](https://developers.arcgis.com/calcite-design-system/resources/licensing/) — ArcGIS account and usage requirements.
- [Published Design Tokens](https://cdn.jsdelivr.net/npm/@esri/calcite-design-tokens@4.1.0/dist/css/global.css) — Pinned type, space and radius references.
