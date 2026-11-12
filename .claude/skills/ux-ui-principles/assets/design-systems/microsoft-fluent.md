# Microsoft Fluent 2 Design System — OpenDesign Application Guide

Build a Fluent UI React v9 workspace with real semantic tokens, the web type and spacing ramps, controlled tabs, and a validated access dialog. Compare the theme values, inspect the component anatomy, and try a local interaction before using the complete React example.

An OpenDesign application study of Fluent UI React v9, not a Microsoft product or live sharing service. The standalone preview is an HTML/CSS interpretation of verified web tokens and component anatomy; the React code below uses native Fluent components. Reference values reflect the linked source snapshot checked on 3 October 2026, not a promise that every release, platform, or brand uses identical values.

## Source Reference

- **Implementation:** @fluentui/react-components uses FluentProvider with an explicit theme. ([source](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-components/README.md))
- **Theme selection:** webLightTheme is created from the brandWeb ramp; it is not the Teams purple theme. ([source](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/themes/web/lightTheme.ts))
- **Body typography:** body1 combines fontSizeBase300, lineHeightBase300 and fontWeightRegular. ([source](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/typographyStyles.ts))
- **Field contract:** Field associates labels and messages with its child control; validationState includes error, warning, success and none. ([source](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts))
- **Controlled tabs:** selectedValue and onTabSelect control the selected tab; the application supplies its panels. ([source](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-tabs/library/src/components/TabList/TabList.types.ts))
- **Dialog structure:** DialogSurface contains a form around DialogBody when footer actions submit that form. ([source](https://fluent2.microsoft.design/components/web/react/core/dialog/usage))


## Design Reference

Fluent UI React v9 web references. Global numeric values come from the linked React token sources. Color values below resolve the light alias mapping with brandWeb, not the stale example hex comments in alias/lightColor.ts. Dark colors and Teams themes have separate mappings. The website type chart currently lists Subtitle1 at 20/26; the React fonts.ts source uses 20/28, which this implementation follows. Sources checked 3 October 2026; confirm against the version recorded in your lockfile.

### Light-theme neutral roles

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colorNeutralForeground1 | #242424 | Primary document text. |
| colorNeutralForeground2 | #424242 | Secondary labels. |
| colorNeutralForeground3 | #616161 | Metadata; still check final contrast. |
| colorNeutralBackground1 | #ffffff | Main surface. |
| colorNeutralBackground2 | #fafafa | Quiet supporting surface. |
| colorNeutralBackground3 | #f5f5f5 | Workspace canvas. |
| colorNeutralStroke1 | #d1d1d1 | Ordinary component boundary. |
| colorNeutralStroke2 | #e0e0e0 | Subtle divider. |
| colorNeutralStrokeAccessible | #616161 | Higher-contrast control boundary. |
| colorNeutralForegroundOnBrand | #ffffff | Text on supported brand fills. |
| colorStrokeFocus1 / colorStrokeFocus2 | #ffffff / #000000 | Two focus colors; preserve contrast at the component edge. |

### Web brand roles, resolved from brandWeb

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/brandColors.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colorBrandBackground | #0f6cbd · brandWeb[80] | Primary action in webLightTheme. |
| colorBrandBackgroundHover | #115ea3 · brandWeb[70] | Hover branch of that action. |
| colorBrandBackgroundPressed | #0c3b5e · brandWeb[40] | Pressed branch; not a generic selected status. |
| colorBrandBackground2 | #ebf3fc · brandWeb[160] | Subtle brand background. |
| colorBrandForegroundLink | #115ea3 · brandWeb[70] | Link foreground in the light web theme. |

### Horizontal and vertical spacing

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/spacings.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| spacingHorizontalNone / spacingVerticalNone | 0 | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalXXS / spacingVerticalXXS | 2px | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalXS / spacingVerticalXS | 4px | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalSNudge / spacingVerticalSNudge | 6px | Choose axis by layout direction; icon alignment nudge. |
| spacingHorizontalS / spacingVerticalS | 8px | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalMNudge / spacingVerticalMNudge | 10px | Choose axis by layout direction; icon alignment nudge. |
| spacingHorizontalM / spacingVerticalM | 12px | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalL / spacingVerticalL | 16px | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalXL / spacingVerticalXL | 20px | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalXXL / spacingVerticalXXL | 24px | Choose axis by layout direction; shared spacing step. |
| spacingHorizontalXXXL / spacingVerticalXXXL | 32px | Choose axis by layout direction; shared spacing step. |

### React web typography combinations

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Caption2 · fontSizeBase100 | 10px / 14px / 400 | Size / line-height / weight. Pair with lineHeightBase100. |
| Caption1 · fontSizeBase200 | 12px / 16px / 400 | Size / line-height / weight. Pair with lineHeightBase200. |
| Body1 · fontSizeBase300 | 14px / 20px / 400 | Size / line-height / weight. Pair with lineHeightBase300. |
| Body2 / Subtitle2 · fontSizeBase400 | 16px / 22px / 400 / 600 | Size / line-height / weight. Pair with lineHeightBase400. |
| Subtitle1 · fontSizeBase500 | 20px / 28px / 600 | Size / line-height / weight. Pair with lineHeightBase500. |
| Title3 · fontSizeBase600 | 24px / 32px / 600 | Size / line-height / weight. Pair with lineHeightBase600. |
| Title2 · fontSizeHero700 | 28px / 36px / 600 | Size / line-height / weight. Pair with lineHeightHero700. |
| Title1 · fontSizeHero800 | 32px / 40px / 600 | Size / line-height / weight. Pair with lineHeightHero800. |
| LargeTitle · fontSizeHero900 | 40px / 52px / 600 | Size / line-height / weight. Pair with lineHeightHero900. |
| Display · fontSizeHero1000 | 68px / 92px / 600 | Size / line-height / weight. Pair with lineHeightHero1000. |

### Font family and weight

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| fontFamilyBase | 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif | Provider default web stack; do not relabel the surrounding site font as Fluent. |
| fontFamilyMonospace | Consolas, 'Courier New', Courier, monospace | Code and technical identifiers. |
| fontWeightRegular / Medium / Semibold / Bold | 400 / 500 / 600 / 700 | Use role weight with its paired type scale. |

### Shape tokens

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/borderRadius.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| borderRadiusNone | 0 | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadiusSmall | 2px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadiusMedium | 4px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadiusLarge | 6px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadiusXLarge | 8px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadius2XLarge | 12px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadius3XLarge | 16px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadius4XLarge | 24px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadius5XLarge | 32px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadius6XLarge | 40px | Use the component default first; this is an available token, not a mandate for every surface. |
| borderRadiusCircular | 10000px | Use the component default first; this is an available token, not a mandate for every surface. |

### Motion duration ramp

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/durations.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| durationUltraFast | 50ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |
| durationFaster | 100ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |
| durationFast | 150ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |
| durationNormal | 200ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |
| durationGentle | 250ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |
| durationSlow | 300ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |
| durationSlower | 400ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |
| durationUltraSlow | 500ms | Available runtime token; the example uses Fast for hover and removes transitions under reduced motion. |

### Theme changes are semantic, not an inversion

[Official reference](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/darkColor.ts)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| colorNeutralBackground1 | #292929 | Dark main surface instead of light #ffffff. |
| colorNeutralForeground1 | #ffffff | Dark primary text instead of light #242424. |
| colorNeutralForeground2 | #d6d6d6 | Dark secondary text. |
| colorBrandBackground | brandWeb[70] = #115ea3 | Dark primary fill; light mode uses brandWeb[80]. |
| colorBrandForegroundLink | brandWeb[100] = #479ef5 | Dark link role; differs from the primary-button fill. |

## Microsoft Fluent 2 Design System and the React v9 implementation

### Choose the web implementation explicitly

Fluent 2 is a cross-platform design language. This guide makes a narrower, usable choice: @fluentui/react-components, the converged React v9 library. The root is FluentProvider, and this example uses webLightTheme or webDarkTheme. A Teams theme is a separate branded configuration; the familiar purple used in Teams is not the default blue web ramp. Native Windows, iOS and Android resources are also not interchangeable React packages.

The complete example below renders a project brief and a local access list. It combines Title3 and Body1 for hierarchy, TabList and Tab for two views, and Dialog with Field, Input and Select for an access decision. The code does not claim to invite a real person. That separation keeps the component behavior demonstrable without inventing a sharing service.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-components/README.md)

### What the provider actually supplies

FluentProvider places theme variables in its subtree. A custom surface styled with tokens.colorNeutralBackground2 follows the selected theme, while a surface hard-coded to white does not. Keep the provider above the components that need the theme. The library styles its components through its styling runtime; the example does not ask you to import an invented fluent.css file.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/docs/architecture/design-tokens.md)

## Microsoft Fluent 2 Design System Semantic colors and the real web brand ramp

### Resolve aliases against the chosen brand

The light alias source assigns colorBrandBackground to brand[80]. The web theme supplies brandWeb, where step 80 is #0f6cbd. Therefore #0f6cbd is the resolved primary fill in this example. The alias file contains older illustrative hex comments; reading those comments as the current web palette would produce the wrong result. The source relationship, not the comment, establishes the value.

Use colorNeutralForeground1 for the brief, colorNeutralForeground2 for supporting labels, and colorNeutralBackground3 for the surrounding workspace. A primary action can use colorBrandBackground with colorNeutralForegroundOnBrand. The role names remain the contract when the theme changes. A person's permission is represented in text; a blue border or blue tab indicator expresses selection, not authorization.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts)

### Dark mode changes the mapping

Dark mode resolves the main surface to #292929 and primary text to #ffffff. Its primary brand fill uses step 70 while the link foreground uses step 100. That is why the preview changes its token roles together instead of merely reversing the page background. Compare the access dialog, selected tab and muted metadata after toggling: all are part of the same theme boundary.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/darkColor.ts)

## Microsoft Fluent 2 Design System Typography: map text roles to runtime tokens

### Use paired size and line-height values

Body1 is the baseline reading style at 14px with 20px line-height. Caption1 is 12/16, Subtitle2 is 16/22 with semibold weight, and Title3 is 24/32 with semibold weight. These pairs create a distinct title, label and body hierarchy without arbitrary intermediate sizes. The table above includes the larger steps for reference, but a compact workspace does not need a display-sized headline.

The React token source and the design website currently disagree on one useful detail: fontSizeBase500 / lineHeightBase500 is 20/28 in the runtime source, while the web design chart lists Subtitle1 at 20/26. This example follows the runtime pair. Treat such differences as a version and implementation check rather than silently combining whichever numbers fit the mockup.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts)

### Text presets and the font stack

Use semantic HTML alongside the visual preset: Title3 as="h1" is a heading; styling alone does not create the document outline. The base stack begins with Segoe UI and includes platform fallbacks. Do not bundle a proprietary font just to make a screenshot match. The specimen uses the documented stack, so its exact glyphs depend on fonts installed on the viewing device.

For custom text, typographyStyles.body1 bundles family, size, weight and line-height. Prefer that combination over copying just fontSizeBase300. The access list uses readable email addresses with wrapping; the permission label uses semibold emphasis but does not compete with the page title.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/typographyStyles.ts)

## Microsoft Fluent 2 Design System Spacing, shape and density in a workspace

### The React spacing names are not the design-tool names

The general Fluent layout guidance uses global size names and a four-unit rhythm, including 2, 6 and 10 for alignment adjustments. React exposes axis-specific aliases: spacingHorizontalS is 8px, M is 12px, L is 16px and XXL is 24px, with matching vertical names. Do not translate size120 into spacingHorizontal120; that React identifier does not exist.

This composition uses 24px panel padding, a 16px gap between form fields, and 12px spacing for access rows. The exact page width and two-column arrangement are application decisions, not official Fluent breakpoints. On a narrow screen the supporting team context moves below the brief, while the two tab labels remain visible.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/spacings.ts)

### Shape describes component scale

The available radius tokens include Medium at 4px and XLarge at 8px, but availability does not mean every control receives the same radius. The HTML specimen uses a 4px control shape and an 8px document surface as explicit study choices. Native components should retain their own supported default anatomy unless the selected design requirement justifies an override. Do not reach into generated class names to force a different shape.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/borderRadius.ts)

## Microsoft Fluent 2 Design System TabList: selection, panels and keyboard behavior

### The selected value is application state

The example owns tab in React state and passes it to selectedValue. onTabSelect receives data.value, which updates that state. Each Tab has a stable value and points to its panel through aria-controls. Each panel has role="tabpanel", aria-labelledby and a hidden condition. The component does not supply your project brief or access list; those are rendered explicitly.

The API separates focusing from selecting: selectTabOnFocus defaults to false. In the standalone specimen, Left/Right and Home/End move focus, and Enter or Space activates the focused tab. This manual-activation behavior allows someone to inspect the tab choices without triggering an unexpected content switch. Keep the tab labels short; the official layout guidance says horizontal tabs do not automatically wrap or scroll.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-tabs/library/src/components/TabList/TabList.types.ts)

### Choose a different pattern when categories multiply

Brief and People are two closely related views of one workspace, so tabs fit. A list of every project in the organization would be navigation, not another row of tabs. If the categories no longer fit at a narrow width, design an overflow or another selection pattern deliberately; shrinking labels until they become unreadable is not a responsive strategy.

[Supporting specification](https://fluent2.microsoft.design/components/web/react/core/tablist/usage)

## Microsoft Fluent 2 Design System Field: accessible labels and meaningful validation

### A field is a composition, not a styled input

Field combines a label slot, its child control, an optional hint and a validation message. Its documented control contract includes id, aria-labelledby, aria-describedby, aria-invalid and aria-required. Fluent inputs can be direct children; custom controls can consume the render-function props. This is why wrapping the email Input in Field is more useful than placing unrelated text above an input.

In the example, validationState is error only after an invalid local submission. The application checks an email-shaped value and duplicates in its in-memory list. It preserves the entered value and supplies a correction through validationMessage. Field presents and associates that result; it does not decide whether the address exists, deliver an invitation, or grant access.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts)

### Keep validation state distinct from permission

The permission Select contains Can view and Can edit, while the email field contains its own error state. Avoid making an entire dialog red because one address is incomplete. required is an accessible indication, not a substitute for server authorization or validation. The sample form uses noValidate so its explicit validation message can be demonstrated consistently; a production service must validate the request again.

- Empty or malformed address: keep the dialog open and explain the accepted format.
- Address already in the local access list: show a duplicate-specific message without adding another row.
- Valid new address: add the chosen permission locally, close the dialog, and show an honest local-only result.

[Supporting specification](https://fluent2.microsoft.design/components/web/react/core/field/usage)

## Microsoft Fluent 2 Design System Dialog: a form inside the supported anatomy

### Keep the submission button in the form

The composition is Dialog, DialogTrigger, DialogSurface, a form element, and DialogBody containing DialogTitle, DialogContent and DialogActions. The form wraps the body so the footer submit button participates in submission. Cancel is type="button" and lives in a closing DialogTrigger; otherwise a default button type could accidentally submit the form.

open and onOpenChange control visibility. disableButtonEnhancement prevents the trigger from redundantly enhancing a Fluent Button that already supplies button behavior. The success handler closes only after the local validation passes. A validation failure leaves the same email and permission available for correction.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-dialog/library/src/components/Dialog/Dialog.types.ts)

### Choose modal behavior for the actual decision

This short access decision uses the default modal type. A non-modal dialog would allow background work, while an alert dialog is intended for an urgent decision and has stricter dismissal behavior. A normal access form does not need alert semantics. The official guidance calls for focus inside the dialog and a return to its trigger after closing; the standalone interpretation uses the native dialog element and explicitly restores its trigger.

[Supporting specification](https://fluent2.microsoft.design/components/web/react/core/dialog/usage)

## Microsoft Fluent 2 Design System Custom styling without breaking the theme

### Use makeStyles and semantic variables

The complete code uses makeStyles with tokens for surfaces, gaps and radius. That keeps its custom panel aligned with the provider. A generated class name is an implementation detail, so do not copy it from DevTools into a stylesheet. For theme experimentation, change the provider theme and inspect both native controls and custom regions together.

The published duration ramp runs from 50ms through 500ms. The HTML specimen uses durationFast, 150ms, for simple hover changes and removes those transitions under prefers-reduced-motion. This is an application choice using an available token, not a claim that every Fluent interaction must last 150ms. The content and error messages remain understandable with motion removed.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/durations.ts)

### Test the boundaries of an interpretation

The embedded example is intentionally labeled HTML/CSS, not a native Fluent build. It demonstrates the verified values and access-dialog interaction without downloading a framework in the preview. Use the full React example when evaluating native styling, portals, focus management and component updates. Passing the standalone interaction checks is evidence for this specimen, not certification of a production sharing application.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-components/README.md)

## Microsoft Fluent 2 Design System Install and verify the complete composition

### A runnable entry, not a task outline

The setup targets an existing React application with an element whose id is root. Install the v9 suite, then place the JSX entry in the application. The imports, provider, component tree, handlers, state and root render are supplied together. No external sharing API is called. If your starter already renders App, keep its root entry and export App instead of creating a second root.

Record the resolved package version in the lockfile. The linked source references describe the inspected React v9 implementation, while master URLs can evolve. Before upgrading, compare the exported theme and the exact Field, TabList and Dialog behavior used here. The setup deliberately does not combine v8 @fluentui/react components with v9 examples.

1. Install @fluentui/react-components@9 in the existing React project and retain the generated lockfile.
2. Render the supplied entry under one FluentProvider, with webLightTheme as the initial theme.
3. Open the dialog, submit an invalid address, correct it, and confirm the added person appears only in local state.
4. Repeat in webDarkTheme and with keyboard navigation; verify panel association, error announcement and focus return.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-components/README.md)

### What to connect in a real sharing product

Replace the local addition only after defining the service contract: authenticated actor, target workspace, allowed permission values, invitation result and duplicate behavior. Keep the dialog open when the service rejects a request and show the confirmed result rather than optimistically claiming access. Those rules are outside Fluent, but the code makes the handoff point explicit instead of hiding it behind a generic submit button.

[Supporting specification](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Standalone HTML/CSS interpretation of Fluent UI React v9 web tokens and documented Field, TabList and Dialog anatomy. Not a native Fluent component runtime.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Fluent web workspace study</title><style>
:root{color-scheme:light;--colorNeutralForeground1:#242424;--colorNeutralForeground2:#424242;--colorNeutralForeground3:#616161;--colorNeutralBackground1:#fff;--colorNeutralBackground2:#fafafa;--colorNeutralBackground3:#f5f5f5;--colorNeutralStroke1:#d1d1d1;--colorNeutralStroke2:#e0e0e0;--colorBrandBackground:#0f6cbd;--colorBrandBackgroundHover:#115ea3;--colorBrandBackgroundPressed:#0c3b5e;--colorBrandBackground2:#ebf3fc;--colorBrandForegroundLink:#115ea3;--colorNeutralForegroundOnBrand:#fff;--borderRadiusMedium:4px;--borderRadiusXLarge:8px;--spacingHorizontalS:8px;--spacingHorizontalM:12px;--spacingHorizontalL:16px;--spacingHorizontalXXL:24px;--durationFast:150ms}
[data-theme=dark]{color-scheme:dark;--colorNeutralForeground1:#fff;--colorNeutralForeground2:#d6d6d6;--colorNeutralForeground3:#adadad;--colorNeutralBackground1:#292929;--colorNeutralBackground2:#1f1f1f;--colorNeutralBackground3:#141414;--colorNeutralStroke1:#666;--colorNeutralStroke2:#525252;--colorBrandBackground:#115ea3;--colorBrandBackgroundHover:#0f6cbd;--colorBrandBackground2:#082338;--colorBrandForegroundLink:#479ef5}
*{box-sizing:border-box}body{margin:0;background:var(--colorNeutralBackground3);color:var(--colorNeutralForeground1);font-family:'Segoe UI','Segoe UI Web (West European)',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',sans-serif;font-size:14px;line-height:20px}button,input,select{font:inherit}button{cursor:pointer;min-height:32px;padding:5px 12px;border:1px solid var(--colorNeutralStroke1);border-radius:var(--borderRadiusMedium);background:var(--colorNeutralBackground1);color:var(--colorNeutralForeground1);font-weight:600;transition:background var(--durationFast)}button:hover{background:var(--colorNeutralBackground3)}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--colorBrandForegroundLink);outline-offset:3px}.primary{background:var(--colorBrandBackground);color:var(--colorNeutralForegroundOnBrand);border-color:transparent}.primary:hover{background:var(--colorBrandBackgroundHover)}.primary:active{background:var(--colorBrandBackgroundPressed)}.topbar{display:flex;justify-content:space-between;align-items:center;padding:12px 24px;background:var(--colorNeutralBackground1);border-bottom:1px solid var(--colorNeutralStroke2);gap:16px}.brand{display:flex;align-items:center;gap:12px;font-weight:600}.mark{display:grid;grid-template-columns:repeat(2,7px);gap:3px}.mark i{width:7px;height:7px;background:var(--colorBrandBackground)}.top-note{font-size:12px;color:var(--colorNeutralForeground3)}.page{max-width:1100px;margin:auto;padding:24px}.heading{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px}.eyebrow{font-size:12px;line-height:16px;color:var(--colorNeutralForeground3);margin-bottom:4px}h1{font-size:24px;line-height:32px;font-weight:600;margin:0 0 4px}h2{font-size:20px;line-height:28px;font-weight:600;margin:0 0 16px}h3{font-size:16px;line-height:22px;font-weight:600;margin:20px 0 8px}p{margin:0 0 12px}.muted{color:var(--colorNeutralForeground3)}.tabs{display:flex;gap:16px;border-bottom:1px solid var(--colorNeutralStroke2);margin-bottom:24px}.tab{position:relative;background:none;border:0;border-radius:0;font-weight:400;padding:12px 4px;color:var(--colorNeutralForeground2)}.tab[aria-selected=true]{font-weight:600;color:var(--colorBrandForegroundLink)}.tab[aria-selected=true]:after{content:'';position:absolute;bottom:0;left:4px;right:4px;height:3px;background:var(--colorBrandBackground);border-radius:3px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:24px}.document,.aside,.people{background:var(--colorNeutralBackground1);border:1px solid var(--colorNeutralStroke2);border-radius:var(--borderRadiusXLarge);padding:24px}.document{max-width:720px}.docmeta{display:flex;gap:8px;align-items:center;color:var(--colorNeutralForeground3);font-size:12px;line-height:16px;margin-bottom:24px}.avatar{flex:none;display:grid;place-items:center;background:var(--colorBrandBackground2);color:var(--colorBrandForegroundLink);font-weight:600;width:32px;height:32px;border-radius:50%}.quote{padding:12px 16px;background:var(--colorNeutralBackground2);border-left:3px solid var(--colorBrandBackground);margin:16px 0}.checklist{list-style:none;padding:0;margin:12px 0}.checklist li{display:flex;gap:8px;margin:8px 0}.checklist input{accent-color:var(--colorBrandBackground);width:16px;height:16px;margin-top:2px}.aside{padding:20px;height:fit-content}.aside h2{font-size:16px;line-height:22px;margin-bottom:16px}.person{display:flex;gap:8px;align-items:center;margin-bottom:16px}.person p{margin:0}.small{font-size:12px;line-height:16px}.aside hr{border:0;border-top:1px solid var(--colorNeutralStroke2);margin:20px 0}.tag{display:inline-block;border:1px solid var(--colorNeutralStroke1);padding:2px 8px;border-radius:4px;font-size:12px;color:var(--colorNeutralForeground2)}.people-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px}.people-head h2{margin:0}.people ul{list-style:none;padding:0;margin:0}.member{display:flex;align-items:center;gap:12px;padding:16px 0;border-top:1px solid var(--colorNeutralStroke2)}.member-info{flex:1;min-width:0;overflow-wrap:anywhere}.member-info p{margin:0}.member .tag{flex:none}.caption{margin:20px 0 0;color:var(--colorNeutralForeground3);font-size:12px;line-height:16px}.status{margin-top:16px;overflow-wrap:anywhere;color:var(--colorNeutralForeground2)}.status:empty{display:none}[hidden]{display:none!important}dialog{width:min(520px,calc(100vw - 32px));padding:24px;border:1px solid var(--colorNeutralStroke1);border-radius:8px;background:var(--colorNeutralBackground1);color:var(--colorNeutralForeground1);max-height:calc(100dvh - 32px);overflow:auto}dialog::backdrop{background:rgba(0,0,0,.4)}dialog h2{font-size:20px;line-height:28px;margin-bottom:12px}.field{margin:20px 0}.field label{display:block;font-weight:600;margin-bottom:8px}.required{color:#b10e1e}.field input,.field select{width:100%;min-height:36px;background:var(--colorNeutralBackground1);color:var(--colorNeutralForeground1);padding:7px 12px;border:1px solid var(--colorNeutralStroke1);border-bottom-color:var(--colorNeutralForeground3);border-radius:4px}.field input:focus{border-bottom:2px solid var(--colorBrandBackground);padding-bottom:6px}.hint{font-size:12px;line-height:16px;color:var(--colorNeutralForeground3);margin-top:8px}.error{font-size:12px;line-height:16px;color:#b10e1e;margin-top:8px}.field input[aria-invalid=true]{border-color:#b10e1e}.actions{display:flex;justify-content:flex-end;gap:8px;margin-top:24px}[data-theme=dark] .error,[data-theme=dark] .required{color:#ff99a4}footer{padding:0 24px 20px;text-align:center;font-size:12px;color:var(--colorNeutralForeground3)}@media(max-width:700px){.page{padding:16px}.topbar{padding:12px 16px}.top-note{display:none}.layout{grid-template-columns:1fr}.document,.people{padding:20px}.aside{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px}.aside h2,.aside hr{grid-column:1/-1}.aside hr{margin:0}.heading{align-items:flex-start}.heading .primary{flex:none}.member{flex-wrap:wrap}.member .tag{margin-left:44px}.topbar button,.heading button{min-height:40px}}@media(max-width:420px){h1{font-size:20px;line-height:28px}.heading{flex-direction:column;gap:12px}.aside{display:block}.member .tag{margin-left:0}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style></head><body>
<header class="topbar"><div class="brand"><span class="mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Northstar workspace <span class="top-note">/ Product team</span></div><button id="theme" aria-pressed="false">Dark theme</button></header>
<main class="page"><div class="heading"><div><div class="eyebrow">Team workspace · October launch</div><h1>Launch workspace</h1><p class="muted">One brief. A clear decision. The right people.</p></div><button class="primary" id="share">Add a person</button></div>
<div class="tabs" role="tablist" aria-label="Workspace views"><button class="tab" id="brief-tab" role="tab" aria-controls="brief-panel" aria-selected="true" tabindex="0">Brief</button><button class="tab" id="people-tab" role="tab" aria-controls="people-panel" aria-selected="false" tabindex="-1">People <span id="count">2</span></button></div>
<section id="brief-panel" role="tabpanel" aria-labelledby="brief-tab" tabindex="0"><div class="layout"><article class="document"><div class="docmeta"><span class="avatar" aria-hidden="true">AC</span><span>Alex Chen · Product design<br>Updated today at 09:30</span></div><h2>A more welcoming first project</h2><p>Help a new team move from an empty workspace to its first useful result. This review focuses on the welcome screen and the first-project setup.</p><h3>The decision</h3><div class="quote">Should a sample project be created automatically, or offered as an option?</div><p>We want a clear starting point without filling the workspace with content someone did not choose. Review both paths before the team walkthrough.</p><h3>Review checklist</h3><ul class="checklist"><li><input id="c1" type="checkbox" checked><label for="c1">Welcome copy explains the next step</label></li><li><input id="c2" type="checkbox"><label for="c2">Empty workspace offers a sample project</label></li><li><input id="c3" type="checkbox"><label for="c3">Keyboard path reaches the first project action</label></li></ul><p class="small muted">Checklist changes are local to this example.</p></article><aside class="aside"><h2>Working together</h2><div class="person"><span class="avatar" aria-hidden="true">AC</span><div><p>Alex Chen</p><span class="small muted">Workspace owner</span></div></div><div class="person"><span class="avatar" aria-hidden="true">MP</span><div><p>Maya Patel</p><span class="small muted">Can edit</span></div></div><hr><div><h3>Next review</h3><p>Thursday, 10:00<br><span class="muted small">Team walkthrough · UTC</span></p></div><div><h3>Access</h3><span class="tag">Specific people</span><p class="small muted" style="margin-top:8px">Adding a person here updates only this local preview.</p></div></aside></div></section>
<section id="people-panel" role="tabpanel" aria-labelledby="people-tab" tabindex="0" hidden><div class="people"><div class="people-head"><h2>People with access</h2><span class="tag">Local example</span></div><p class="muted">The roles below are fictional. No invitation or real access change is made.</p><ul id="members"><li class="member"><span class="avatar" aria-hidden="true">AC</span><div class="member-info"><p>Alex Chen</p><span class="small muted">alex@example.com</span></div><span class="tag">Owner</span></li><li class="member"><span class="avatar" aria-hidden="true">MP</span><div class="member-info"><p>Maya Patel</p><span class="small muted">maya@example.com</span></div><span class="tag">Can edit</span></li></ul></div></section><p class="status" id="status" role="status"></p><p class="caption">Fluent UI React v9 web-token study · HTML/CSS interpretation, not native library components. Try tabs, theme, checkboxes and the access form.</p></main>
<dialog id="access" aria-labelledby="dialog-title"><form id="access-form" novalidate><h2 id="dialog-title">Add a person to Launch workspace</h2><p class="muted">Choose an address and permission. This demonstration updates the local list only.</p><div class="field"><label for="email">Email address <span class="required" aria-hidden="true">*</span></label><input id="email" type="email" autocomplete="email" aria-required="true" aria-describedby="email-hint" autofocus><div class="hint" id="email-hint">For example, jordan@example.com</div><div class="error" id="error" role="alert" hidden></div></div><div class="field"><label for="permission">Permission</label><select id="permission" aria-describedby="permission-hint"><option>Can view</option><option>Can edit</option></select><div class="hint" id="permission-hint">Viewers can read; editors can change the brief in a real application</div></div><div class="actions"><button type="button" id="cancel">Cancel</button><button class="primary" type="submit">Add locally</button></div></form></dialog>
<script>
const $=id=>document.getElementById(id),tabs=[...document.querySelectorAll('[role=tab]')],emails=new Set(['alex@example.com','maya@example.com']);
function selectTab(tab){tabs.forEach(t=>{const chosen=t===tab;t.setAttribute('aria-selected',String(chosen));t.tabIndex=chosen?0:-1;$(t.getAttribute('aria-controls')).hidden=!chosen;});}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs.forEach(t=>t.tabIndex=-1);tabs[next].tabIndex=0;tabs[next].focus();}});});
$('theme').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('theme').textContent=dark?'Light theme':'Dark theme';$('theme').setAttribute('aria-pressed',String(dark));};
const dialog=$('access'),email=$('email'),error=$('error');function clearError(){error.hidden=true;error.textContent='';email.removeAttribute('aria-invalid');email.setAttribute('aria-describedby','email-hint');}function showError(message){error.textContent=message;error.hidden=false;email.setAttribute('aria-invalid','true');email.setAttribute('aria-describedby','email-hint error');email.focus();}
$('share').onclick=()=>{clearError();dialog.showModal();email.focus();};$('cancel').onclick=()=>dialog.close();dialog.addEventListener('close',()=>$('share').focus());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});email.addEventListener('input',clearError);
$('access-form').addEventListener('submit',event=>{event.preventDefault();const value=email.value.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){showError('Enter an email address such as name@example.com');return;}if(emails.has(value)){showError('This address already appears in the local access list');return;}const permission=$('permission').value;emails.add(value);const item=document.createElement('li');item.className='member';const avatar=document.createElement('span');avatar.className='avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent=value.slice(0,2).toUpperCase();const info=document.createElement('div');info.className='member-info';const name=document.createElement('p');name.textContent=value;const sub=document.createElement('span');sub.className='small muted';sub.textContent='Added in this local example';info.append(name,sub);const role=document.createElement('span');role.className='tag';role.textContent=permission;item.append(avatar,info,role);$('members').append(item);$('count').textContent=emails.size;$('status').textContent='Added '+value+' as '+permission.toLowerCase()+' locally. No invitation was sent.';email.value='';clearError();selectTab($('people-tab'));dialog.close();});
</script></body></html>

```

[Code reference](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-components/README.md)

- The access dialog and tabs in this document use native HTML controls; run the separate React v9 entry to evaluate FluentProvider, Field and Dialog behavior.

### Complete native implementation entry

The complete implementation from setup, collected here alongside the focused API explanations. Follow the documented package and build prerequisites in setup.

```jsx
// Terminal: npm install @fluentui/react-components@9
// Existing React application; index.html must contain <div id="root"></div>.
// Entry file: src/main.jsx
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  FluentProvider, webLightTheme, webDarkTheme, makeStyles, tokens,
  Button, Body1, Title3, TabList, Tab, Field, Input, Select,
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle,
  DialogContent, DialogActions
} from '@fluentui/react-components';

const useStyles = makeStyles({
  page: { maxWidth: '880px', margin: '0 auto', padding: tokens.spacingHorizontalXXL },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacingHorizontalL },
  panel: { padding: tokens.spacingHorizontalXXL, marginTop: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground2, borderRadius: tokens.borderRadiusXLarge },
  form: { display: 'grid', gap: tokens.spacingVerticalL },
  row: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalM, paddingBottom: tokens.spacingVerticalM },
});

function Workspace({ dark, setDark }) {
  const styles = useStyles();
  const [tab, setTab] = React.useState('brief');
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [permission, setPermission] = React.useState('Can view');
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [people, setPeople] = React.useState([{ email: 'alex@example.com', permission: 'Owner' }]);
  function submit(event) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter an email address such as name@example.com'); return;
    }
    if (people.some(person => person.email === value)) {
      setError('This address already appears in the local access list'); return;
    }
    setPeople(previous => [...previous, { email: value, permission }]);
    setNotice(`Added ${value} as ${permission.toLowerCase()} in this local example. No invitation was sent.`);
    setEmail(''); setError(''); setOpen(false); setTab('people');
  }
  return <main className={styles.page}>
    <div className={styles.header}>
      <Title3 as="h1">Launch workspace</Title3>
      <Button onClick={() => setDark(!dark)}>{dark ? 'Light theme' : 'Dark theme'}</Button>
    </div>
    <Body1>Project brief and access settings · local demonstration</Body1>
    <TabList aria-label="Workspace views" selectedValue={tab}
      onTabSelect={(_, data) => setTab(data.value)}>
      <Tab id="brief-tab" value="brief" aria-controls="brief-panel">Brief</Tab>
      <Tab id="people-tab" value="people" aria-controls="people-panel">People</Tab>
    </TabList>
    <section id="brief-panel" role="tabpanel" aria-labelledby="brief-tab"
      hidden={tab !== 'brief'} className={styles.panel} tabIndex={0}>
      <h2>Launch a clearer onboarding flow</h2>
      <p>Review the welcome screen and first-project setup before the team walkthrough.</p>
      <p>Decision needed: should the sample project be created automatically or offered as an option?</p>
    </section>
    <section id="people-panel" role="tabpanel" aria-labelledby="people-tab"
      hidden={tab !== 'people'} className={styles.panel} tabIndex={0}>
      <h2>People with access</h2>
      <ul>{people.map(person => <li key={person.email} className={styles.row}>
        <span>{person.email}</span><strong>{person.permission}</strong>
      </li>)}</ul>
    </section>
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement><Button appearance="primary">Add a person</Button></DialogTrigger>
      <DialogSurface>
        <form noValidate onSubmit={submit}>
          <DialogBody>
            <DialogTitle>Add a person to Launch workspace</DialogTitle>
            <DialogContent className={styles.form}>
              <p>This example updates local state only. It does not send email or change real access.</p>
              <Field label="Email address" required validationState={error ? 'error' : 'none'}
                validationMessage={error || undefined}>
                <Input type="email" value={email} onChange={(_, data) => { setEmail(data.value); setError(''); }} />
              </Field>
              <Field label="Permission" hint="Viewers can read; editors can change the brief in a real application">
                <Select value={permission} onChange={(_, data) => setPermission(data.value)}>
                  <option>Can view</option><option>Can edit</option>
                </Select>
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button type="button">Cancel</Button></DialogTrigger>
              <Button type="submit" appearance="primary">Add locally</Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
    <p role="status">{notice}</p>
  </main>;
}
function App() {
  const [dark, setDark] = React.useState(false);
  return <FluentProvider theme={dark ? webDarkTheme : webLightTheme}>
    <Workspace dark={dark} setDark={setDark} />
  </FluentProvider>;
}
createRoot(document.getElementById('root')).render(<App />);

```

[Code reference](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts)

- Complete React v9 component composition for an existing React app. The standalone preview is a separate HTML/CSS interpretation. This code performs local validation and state updates only; no email or real permission change occurs. The source APIs have been checked; native package compilation is not claimed until tested in the target project.

### Field + Input + Select: one labeled access form

These fragments use the state variables and imports in the complete setup below. Field owns label, hint and validation presentation; the application owns the email rule and duplicate check.

```jsx
<Field label="Email address" required
  validationState={error ? 'error' : 'none'}
  validationMessage={error || undefined}>
  <Input type="email" value={email}
    onChange={(_, data) => { setEmail(data.value); setError(''); }} />
</Field>
<Field label="Permission" hint="Choose what this person can do">
  <Select value={permission}
    onChange={(_, data) => setPermission(data.value)}>
    <option>Can view</option><option>Can edit</option>
  </Select>
</Field>
```

[Code reference](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts)

- required supplies an accessible required indication; it does not implement the application validation rule.
- The default validation state becomes error when validationMessage exists. Set none explicitly when no error should appear.
- Input onChange provides the current string in data.value; do not confuse its handler with a plain DOM event-only input.

### Controlled TabList with explicitly associated panels

TabList controls selection and tab behavior. Render the content panels yourself and keep their ids and accessible names connected to each Tab.

```jsx
<TabList selectedValue={tab} aria-label="Workspace views"
  onTabSelect={(_, data) => setTab(data.value)}>
  <Tab id="brief-tab" value="brief" aria-controls="brief-panel">Brief</Tab>
  <Tab id="people-tab" value="people" aria-controls="people-panel">People</Tab>
</TabList>
<section id="brief-panel" role="tabpanel" aria-labelledby="brief-tab"
  hidden={tab !== 'brief'} tabIndex={0}>Project brief</section>
<section id="people-panel" role="tabpanel" aria-labelledby="people-tab"
  hidden={tab !== 'people'} tabIndex={0}>People with access</section>
```

[Code reference](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-tabs/library/src/components/TabList/TabList.types.ts)

- selectedValue belongs on TabList; each Tab has a distinct value.
- selectTabOnFocus defaults to false. Arrow focus and activation are separate unless that behavior is deliberately changed.
- Fluent horizontal tabs do not wrap or scroll automatically; the example uses two short labels so they remain visible.

## Implementation Starting Point

Complete React v9 component composition for an existing React app. The standalone preview is a separate HTML/CSS interpretation. This code performs local validation and state updates only; no email or real permission change occurs. The source APIs have been checked; native package compilation is not claimed until tested in the target project.

```jsx
// Terminal: npm install @fluentui/react-components@9
// Existing React application; index.html must contain <div id="root"></div>.
// Entry file: src/main.jsx
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  FluentProvider, webLightTheme, webDarkTheme, makeStyles, tokens,
  Button, Body1, Title3, TabList, Tab, Field, Input, Select,
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle,
  DialogContent, DialogActions
} from '@fluentui/react-components';

const useStyles = makeStyles({
  page: { maxWidth: '880px', margin: '0 auto', padding: tokens.spacingHorizontalXXL },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacingHorizontalL },
  panel: { padding: tokens.spacingHorizontalXXL, marginTop: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground2, borderRadius: tokens.borderRadiusXLarge },
  form: { display: 'grid', gap: tokens.spacingVerticalL },
  row: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalM, paddingBottom: tokens.spacingVerticalM },
});

function Workspace({ dark, setDark }) {
  const styles = useStyles();
  const [tab, setTab] = React.useState('brief');
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [permission, setPermission] = React.useState('Can view');
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [people, setPeople] = React.useState([{ email: 'alex@example.com', permission: 'Owner' }]);
  function submit(event) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter an email address such as name@example.com'); return;
    }
    if (people.some(person => person.email === value)) {
      setError('This address already appears in the local access list'); return;
    }
    setPeople(previous => [...previous, { email: value, permission }]);
    setNotice(`Added ${value} as ${permission.toLowerCase()} in this local example. No invitation was sent.`);
    setEmail(''); setError(''); setOpen(false); setTab('people');
  }
  return <main className={styles.page}>
    <div className={styles.header}>
      <Title3 as="h1">Launch workspace</Title3>
      <Button onClick={() => setDark(!dark)}>{dark ? 'Light theme' : 'Dark theme'}</Button>
    </div>
    <Body1>Project brief and access settings · local demonstration</Body1>
    <TabList aria-label="Workspace views" selectedValue={tab}
      onTabSelect={(_, data) => setTab(data.value)}>
      <Tab id="brief-tab" value="brief" aria-controls="brief-panel">Brief</Tab>
      <Tab id="people-tab" value="people" aria-controls="people-panel">People</Tab>
    </TabList>
    <section id="brief-panel" role="tabpanel" aria-labelledby="brief-tab"
      hidden={tab !== 'brief'} className={styles.panel} tabIndex={0}>
      <h2>Launch a clearer onboarding flow</h2>
      <p>Review the welcome screen and first-project setup before the team walkthrough.</p>
      <p>Decision needed: should the sample project be created automatically or offered as an option?</p>
    </section>
    <section id="people-panel" role="tabpanel" aria-labelledby="people-tab"
      hidden={tab !== 'people'} className={styles.panel} tabIndex={0}>
      <h2>People with access</h2>
      <ul>{people.map(person => <li key={person.email} className={styles.row}>
        <span>{person.email}</span><strong>{person.permission}</strong>
      </li>)}</ul>
    </section>
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement><Button appearance="primary">Add a person</Button></DialogTrigger>
      <DialogSurface>
        <form noValidate onSubmit={submit}>
          <DialogBody>
            <DialogTitle>Add a person to Launch workspace</DialogTitle>
            <DialogContent className={styles.form}>
              <p>This example updates local state only. It does not send email or change real access.</p>
              <Field label="Email address" required validationState={error ? 'error' : 'none'}
                validationMessage={error || undefined}>
                <Input type="email" value={email} onChange={(_, data) => { setEmail(data.value); setError(''); }} />
              </Field>
              <Field label="Permission" hint="Viewers can read; editors can change the brief in a real application">
                <Select value={permission} onChange={(_, data) => setPermission(data.value)}>
                  <option>Can view</option><option>Can edit</option>
                </Select>
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button type="button">Cancel</Button></DialogTrigger>
              <Button type="submit" appearance="primary">Add locally</Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
    <p role="status">{notice}</p>
  </main>;
}
function App() {
  const [dark, setDark] = React.useState(false);
  return <FluentProvider theme={dark ? webDarkTheme : webLightTheme}>
    <Workspace dark={dark} setDark={setDark} />
  </FluentProvider>;
}
createRoot(document.getElementById('root')).render(<App />);

```

## Agent Prompt

Use Fluent UI React v9 from @fluentui/react-components. Render FluentProvider with webLightTheme and a webDarkTheme toggle. Compose the brief with Title3 and Body1, controlled TabList/Tab views with explicit panels, and an access Dialog containing Field/Input/Select and a real form. Use tokens for custom surfaces and spacing. Follow the supplied component example and runtime type pairs, including Subtitle1 at 20/28. Preserve invalid input, reject local duplicate addresses, restore dialog focus, and describe local additions honestly. Connect a sharing service only when its authorization and result contract is supplied.

## Sources

- [React v9 package entry](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-components/README.md) — Provider and suite installation.
- [Theme architecture](https://github.com/microsoft/fluentui/blob/master/docs/architecture/design-tokens.md) — Semantic token use and available themes.
- [Runtime typography](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts) — Font stack, size, line-height and weights.
- [Text-style mapping](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/typographyStyles.ts) — Presets mapped to global tokens.
- [Design type ramp](https://fluent2.microsoft.design/typography) — Design-language table; Subtitle1 differs from the runtime pair.
- [Runtime spacing](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/spacings.ts) — Horizontal and vertical token names.
- [Layout guidance](https://fluent2.microsoft.design/layout) — Global spacing and responsive considerations.
- [Radius tokens](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/borderRadius.ts) — Available runtime shape values.
- [Motion durations](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/durations.ts) — Runtime duration values.
- [Light semantic mapping](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts) — Neutral and brand alias assignments.
- [Dark semantic mapping](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/darkColor.ts) — Dark-theme alias assignments.
- [Brand ramps](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/brandColors.ts) — Actual web and Teams brand values.
- [Web theme construction](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/themes/web/lightTheme.ts) — webLightTheme uses brandWeb.
- [Field usage](https://fluent2.microsoft.design/components/web/react/core/field/usage) — Labels, validation and composition guidance.
- [Field API](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts) — Slots and accessible child contract.
- [TabList usage](https://fluent2.microsoft.design/components/web/react/core/tablist/usage) — Layout and category-selection guidance.
- [TabList API](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-tabs/library/src/components/TabList/TabList.types.ts) — Controlled selection and focus options.
- [Dialog usage](https://fluent2.microsoft.design/components/web/react/core/dialog/usage) — Form placement and modal interaction guidance.
- [Dialog API](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-dialog/library/src/components/Dialog/Dialog.types.ts) — Controlled visibility and modal types.
