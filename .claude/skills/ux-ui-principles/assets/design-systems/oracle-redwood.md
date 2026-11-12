# Oracle Redwood Design System — OpenDesign Application Guide

Study Oracle JET 19 Redwood’s actual palette, semantic roles, spacing and density boundaries through a complete original editable stock-review worksheet.

An OpenDesign interpretation using public Oracle JET 19 Redwood variables. The preview is plain HTML/CSS/JavaScript, not native JET components or an Oracle inventory service. Arial fallback is explicit.

## Source Reference

- **Reference version:** Oracle JET 19.0.0 Redwood ([source](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css))
- **Runtime boundary:** Original HTML/CSS interpretation ([source](https://docs.oracle.com/en/middleware/developer-tools/jet/19/reference-styling/CssVariablesOverview.html))
- **Reference entries:** 45 public values and styling rules ([source](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css))


## Design Reference

Base public declarations from the pinned JET 19.0.0 Redwood stylesheet. Original worksheet behavior and layout are identified separately; private variables and later inverted overrides are excluded from the base reference.

### Redwood base semantic roles

[Official reference](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --oj-core-text-color-primary | rgb(var(--oj-palette-neutral-rgb-190)) | First/base declarations from JET 19 Redwood. Inverted and density selectors may override values; do not flatten all declarations into a last-value lookup. |
| --oj-core-text-color-secondary | rgba(var(--oj-palette-neutral-rgb-190), .70) | First/base declarations from JET 19 Redwood. Inverted and density selectors may override values; do not flatten all declarations into a last-value lookup. |
| --oj-core-text-color-disabled | rgba(var(--oj-palette-neutral-rgb-190), .4) | First/base declarations from JET 19 Redwood. Inverted and density selectors may override values; do not flatten all declarations into a last-value lookup. |
| --oj-core-bg-color-content | rgb(var(--oj-palette-neutral-rgb-0)) | First/base declarations from JET 19 Redwood. Inverted and density selectors may override values; do not flatten all declarations into a last-value lookup. |
| --oj-body-bg-color | rgb(var(--oj-palette-neutral-rgb-10)) | First/base declarations from JET 19 Redwood. Inverted and density selectors may override values; do not flatten all declarations into a last-value lookup. |
| --oj-core-divider-color | rgba(var(--oj-palette-neutral-rgb-190),.12) | First/base declarations from JET 19 Redwood. Inverted and density selectors may override values; do not flatten all declarations into a last-value lookup. |
| --oj-core-focus-border-color | rgb(var(--oj-palette-neutral-rgb-190)) | First/base declarations from JET 19 Redwood. Inverted and density selectors may override values; do not flatten all declarations into a last-value lookup. |

### Palette values used by the worksheet

[Official reference](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --oj-palette-neutral-rgb-0 | 255, 255, 255 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-neutral-rgb-10 | 251, 249, 248 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-neutral-rgb-20 | 245, 244, 242 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-neutral-rgb-190 | 22, 21, 19 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-brand-rgb-120 | 0, 104, 140 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-info-rgb-20 | 237, 246, 249 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-danger-rgb-120 | 179, 49, 31 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-success-rgb-20 | 235, 248, 222 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |
| --oj-palette-success-rgb-140 | 53, 86, 23 | Raw RGB channel values are consumed inside rgb() or rgba(). These are not complete CSS color values by themselves. |

### Spacing and shape

[Official reference](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --oj-core-spacing-1x | .25rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-2x | .5rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-3x | .75rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-4x | 1rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-5x | 1.25rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-6x | 1.5rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-7x | 1.75rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-8x | 2rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-9x | 2.25rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-10x | 2.5rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-11x | 2.75rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-spacing-12x | 3rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-border-radius-sm | 2px | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-border-radius-md | .25rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-border-radius-lg | .375rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |
| --oj-core-border-radius-xl | .5rem | Published foundation scale. The worksheet’s native HTML controls consume selected values without claiming JET component behavior. |

### Body typography and control dimensions

[Official reference](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --oj-typography-body-xs-font-size | 0.75rem | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |
| --oj-typography-body-sm-font-size | 0.859rem | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |
| --oj-typography-body-md-font-size | 1rem | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |
| --oj-typography-body-lg-font-size | 1.125rem | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |
| --oj-typography-body-xl-font-size | 1.25rem | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |
| --oj-typography-body-md-line-height | 1.25 | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |
| --oj-button-height | 2.75rem | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |
| --oj-button-border-radius | var(--oj-core-border-radius-md) | Base theme declarations. The original example uses Arial fallback, and its table/content layout is application code. |

### Public styling boundaries

[Official reference](https://docs.oracle.com/en/middleware/developer-tools/jet/19/reference-styling/CssVariablesOverview.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Global theme overrides | :root declarations after JET CSS | A root override affects every consumer of that public variable. |
| Instance styling | A class scoped to the target component | Scope a public variable when only one native component needs the change. |
| Redwood base | Tracks Oracle visual changes | Choose it when matching Oracle’s look is the goal; upgrades can change inherited values. |
| Stable base | Alternative for a distinct custom theme | Do not present it as identical to Redwood or assume all inverted/scaling capabilities match. |
| Private variables | --oj-private-* excluded | The sample does not build its public reference on private implementation hooks. |

## Oracle Redwood Design System and JET Version Boundaries

### Name the implementation layer precisely

Redwood is broader than one downloadable component library. This guide uses the public CSS foundations shipped with Oracle JET 19.0.0, which are a concrete inspectable reference. The preview is an original HTML/CSS stock-review worksheet consuming those values; it does not instantiate oj-table, oj-input-number or any other native JET custom element. The runtime statement is explicit so a reader does not confuse visual foundations with a complete Oracle application SDK.

- Reference source: Oracle JET 19 Redwood CSS.
- Preview runtime: original native-browser HTML/CSS/JavaScript.
- Data and validation rules: original local sample.

### Keep Oracle application adoption separate

Adopting Redwood in an Oracle SaaS product, configuring a JET application and borrowing a public theme reference are different activities. The example does not change a tenant, connect to inventory records or perform a product migration. Its complete local document is useful for studying the visual rules and state model, while a real JET application should follow the versioned framework setup and native component documentation.

## Oracle Redwood Design System Semantic Roles and Palette Values

### Resolve the base declarations correctly

The reference takes the first/base declaration of each public variable from the pinned stylesheet. Later inverted or density scopes can redefine the same name. A naive last-match extraction would therefore label an inverted foreground as the default light text color. The guide keeps the base scope explicit and excludes --oj-private-* hooks from the published reference.

### Distinguish raw channels from color values

Palette variables such as --oj-palette-brand-rgb-120 contain three RGB channels, while semantic roles wrap them with rgb() or rgba(). The original action uses the brand channels through rgb(), text uses core-text-color-primary, and the card surface uses core-bg-color-content. Copying the raw channel string directly into background-color would be invalid CSS even though the numbers look plausible.

## Oracle Redwood Design System Spacing, Type and Density

### Use the concrete foundation scale

The public core-spacing sequence runs in 4px steps from 1x through 12x. Small, medium, large and extra-large border roles are distinct, and the button height is a separate component variable. The worksheet consumes these actual values where appropriate and identifies its 32px heading, responsive table transformation and 1120px outer measure as original composition decisions.

### Do not mix density-specific values

The base body-md size is 1rem with a 1.25 line-height in this pinned stylesheet; later selectors may expose scaled pixel values. The guide records the base rather than implying that every Redwood context must use one computed size. The browser example uses Arial fallback instead of claiming Oracle Sans is loaded. A native JET application should test its selected density, theme and platform together.

## Oracle Redwood Design System Oracle Redwood-Inspired Worksheet Structure

### Make the data and actions understandable

Each original row names a studio supply, describes its unit, compares current stock with a minimum and offers a quantity input. A review-state label repeats whether that item contributes to the local draft. The summary counts units across the entire draft, including rows hidden by the filter. These are fictional sample records, not inventory evidence or procurement recommendations.

### Keep row identity stable through sorting

The application stores quantities by item ID rather than table position. Sorting by name or returning to the original order therefore preserves edits. Filtering Below minimum stock changes only the visible collection. A positional array tied to rendered row order would risk assigning one item’s quantity to another after sorting; the supplied code avoids that failure explicitly.

## Oracle Redwood Design System Oracle Redwood-Inspired Quantity Validation

### Reject values outside the stated local rule

The original quantity input permits whole numbers from zero through 99. Empty, negative, fractional and out-of-range values expose an inline error and disable the review action. The draft model retains the last valid quantity until a valid edit replaces it. The visible error makes that difference clear, and no invalid value is included in the reviewed total.

### Explain when an invalid edit is discarded

Changing the filter or sort reconstructs the visible rows from the last valid draft values, so an invalid unfinished edit is discarded. This is a deliberate local example boundary, not a native JET validation guarantee. A production editable table might instead preserve invalid drafts across every view or block navigation; that behavior must be designed and tested in its own state model.

## Oracle Redwood Design System Oracle Redwood-Inspired Review and Reset

### Describe a local review without pretending to submit

Review this draft produces a readable count of units and contributing items. It explicitly says no order was sent. The action accepts a valid zero-unit draft because the example does not invent a mandatory purchase rule. Editing a quantity clears the previous review message so a changed draft cannot retain a stale confirmation.

### Provide predictable recovery

Reset quantities restores the original suggested additions and clears the review message. It preserves the current filter and sort, then redraws those rows from the reset model. This makes recovery visible without reloading the page. The sample has no storage or backend, so reloading also restores its initial local data.

## Oracle Redwood Design System Oracle Redwood-Inspired Responsive Table

### Retain the information hierarchy on narrow screens

The wide layout is a table with column headers and row-header item names. Below 650px, rows become readable blocks and each data cell shows its label before its value. Inputs remain within their available width and the item description stays attached to the item name. The transition is original application CSS rather than a claim about oj-table’s responsive behavior.

### Test edited and filtered states

The browser check enters an invalid quantity, corrects it, sorts the items, filters below-minimum rows and reviews the resulting total before measuring layout. Four widths from 1440px down to 280px were checked. This tests actual content and state changes, not simply the presence of an empty table container.

## Oracle Redwood Design System Complete Reference Implementation

### Run the supplied complete document

The HTML example contains the required public token declarations, original styles, sample records and all event handlers. Save it as index.html and serve the directory; there are no missing imports or external runtime calls. The reference values are pinned to JET 19.0.0 even though the local implementation needs no JET JavaScript package to run.

1. Save the complete supplied document as index.html.
2. Serve its folder over local HTTP.
3. Test invalid quantities and correction.
4. Sort and filter, then review and reset the same draft.

### Use native JET components through their own setup

For a native application, install the matching Oracle JET package and follow its framework setup, then use the versioned oj-* component contracts and public styling variables. Do not paste an oj-* tag into this standalone interpretation and assume it will initialize. The linked styling overview distinguishes root-level theming from component-scoped overrides and explains when Redwood or Stable is a more appropriate base.

## Component Examples

### index.html — complete original worksheet

Full public-token subset, responsive HTML, validation, stable row state and local review/reset behavior.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Studio supplies worksheet</title><style>:root{--oj-palette-danger-rgb-10:255, 248, 247;--oj-palette-danger-rgb-20:255, 241, 239;--oj-palette-danger-rgb-30:255, 235, 232;--oj-palette-danger-rgb-40:255, 217, 211;--oj-palette-danger-rgb-50:255, 193, 184;--oj-palette-danger-rgb-60:255, 157, 144;--oj-palette-danger-rgb-70:255, 134, 117;--oj-palette-danger-rgb-80:254, 104, 84;--oj-palette-danger-rgb-90:236, 79, 58;--oj-palette-danger-rgb-100:214, 59, 37;--oj-palette-danger-rgb-110:195, 53, 34;--oj-palette-danger-rgb-120:179, 49, 31;--oj-palette-danger-rgb-130:170, 34, 34;--oj-palette-danger-rgb-140:143, 39, 25;--oj-palette-danger-rgb-150:124, 34, 22;--oj-palette-danger-rgb-160:102, 28, 18;--oj-palette-danger-rgb-170:86, 24, 15;--oj-palette-warning-rgb-10:254, 249, 242;--oj-palette-warning-rgb-20:253, 242, 229;--oj-palette-warning-rgb-30:252, 237, 220;--oj-palette-warning-rgb-40:249, 221, 188;--oj-palette-warning-rgb-50:246, 199, 146;--oj-palette-warning-rgb-60:240, 169, 87;--oj-palette-warning-rgb-70:235, 150, 50;--oj-palette-warning-rgb-80:225, 128, 18;--oj-palette-warning-rgb-90:198, 113, 14;--oj-palette-warning-rgb-100:172, 99, 12;--oj-palette-warning-rgb-110:156, 89, 11;--oj-palette-warning-rgb-120:143, 82, 10;--oj-palette-warning-rgb-130:129, 73, 9;--oj-palette-warning-rgb-140:114, 65, 8;--oj-palette-warning-rgb-150:99, 56, 7;--oj-palette-warning-rgb-160:81, 47, 6;--oj-palette-warning-rgb-170:69, 39, 5;--oj-palette-success-rgb-10:244, 252, 235;--oj-palette-success-rgb-20:235, 248, 222;--oj-palette-success-rgb-30:228, 245, 211;--oj-palette-success-rgb-40:207, 235, 179;--oj-palette-success-rgb-50:177, 221, 136;--oj-palette-success-rgb-60:138, 201, 79;--oj-palette-success-rgb-70:125, 186, 69;--oj-palette-success-rgb-80:111, 169, 57;--oj-palette-success-rgb-90:94, 148, 43;--oj-palette-success-rgb-100:80, 130, 35;--oj-palette-success-rgb-110:73, 118, 32;--oj-palette-success-rgb-120:67, 107, 29;--oj-palette-success-rgb-130:60, 96, 26;--oj-palette-success-rgb-140:53, 86, 23;--oj-palette-success-rgb-150:46, 73, 20;--oj-palette-success-rgb-160:38, 61, 16;--oj-palette-success-rgb-170:31, 51, 14;--oj-palette-info-rgb-10:246, 250, 252;--oj-palette-info-rgb-20:237, 246, 249;--oj-palette-info-rgb-30:228, 241, 247;--oj-palette-info-rgb-40:208, 229, 238;--oj-palette-info-rgb-50:180, 213, 225;--oj-palette-info-rgb-60:143, 191, 208;--oj-palette-info-rgb-70:121, 177, 198;--oj-palette-info-rgb-80:95, 162, 186;--oj-palette-info-rgb-90:65, 144, 172;--oj-palette-info-rgb-100:34, 126, 158;--oj-palette-info-rgb-110:14, 114, 151;--oj-palette-info-rgb-120:0, 104, 140;--oj-palette-info-rgb-130:2, 94, 126;--oj-palette-info-rgb-140:4, 83, 111;--oj-palette-info-rgb-150:6, 72, 95;--oj-palette-info-rgb-160:6, 60, 78;--oj-palette-info-rgb-170:5, 50, 66;--oj-palette-brand-rgb-10:246, 250, 252;--oj-palette-brand-rgb-20:237, 246, 249;--oj-palette-brand-rgb-30:228, 241, 247;--oj-palette-brand-rgb-40:208, 229, 238;--oj-palette-brand-rgb-50:180, 213, 225;--oj-palette-brand-rgb-60:143, 191, 208;--oj-palette-brand-rgb-70:121, 177, 198;--oj-palette-brand-rgb-80:95, 162, 186;--oj-palette-brand-rgb-90:65, 144, 172;--oj-palette-brand-rgb-100:34, 126, 158;--oj-palette-brand-rgb-110:14, 114, 151;--oj-palette-brand-rgb-120:0, 104, 140;--oj-palette-brand-rgb-130:2, 94, 126;--oj-palette-brand-rgb-140:4, 83, 111;--oj-palette-brand-rgb-150:6, 72, 95;--oj-palette-brand-rgb-160:6, 60, 78;--oj-palette-brand-rgb-170:5, 50, 66;--oj-palette-neutral-rgb-0:255, 255, 255;--oj-palette-neutral-rgb-10:251, 249, 248;--oj-palette-neutral-rgb-20:245, 244, 242;--oj-palette-neutral-rgb-30:241, 239, 237;--oj-palette-neutral-rgb-40:228, 225, 221;--oj-palette-neutral-rgb-50:212, 207, 202;--oj-palette-neutral-rgb-60:188, 182, 177;--oj-palette-neutral-rgb-70:174, 168, 162;--oj-palette-neutral-rgb-80:158, 152, 146;--oj-palette-neutral-rgb-90:139, 133, 128;--oj-palette-neutral-rgb-100:123, 117, 112;--oj-palette-neutral-rgb-110:111, 105, 100;--oj-palette-neutral-rgb-120:101, 95, 91;--oj-palette-neutral-rgb-130:92, 86, 81;--oj-palette-neutral-rgb-140:81, 76, 71;--oj-palette-neutral-rgb-150:71, 66, 62;--oj-palette-neutral-rgb-160:58, 54, 50;--oj-palette-neutral-rgb-170:49, 45, 42;--oj-palette-neutral-rgb-180:32, 30, 28;--oj-palette-neutral-rgb-190:22, 21, 19;--oj-palette-neutral-rgb-200:00, 00, 00;--oj-palette-dvt-rgb-1:36, 93, 99;--oj-palette-dvt-rgb-2:215, 121, 15;--oj-palette-dvt-rgb-3:49, 160, 156;--oj-palette-dvt-rgb-4:78, 65, 55;--oj-palette-dvt-rgb-5:105, 158, 97;--oj-palette-dvt-rgb-6:180, 114, 130;--oj-palette-dvt-rgb-7:131, 64, 30;--oj-palette-dvt-rgb-8:158, 127, 204;--oj-palette-dvt-rgb-9:168, 142, 0;--oj-palette-dvt-rgb-10:88, 49, 110;--oj-palette-dvt-rgb-11:89, 153, 181;--oj-palette-dvt-rgb-12:49, 122, 69;--oj-core-text-color-primary:rgb(var(--oj-palette-neutral-rgb-190));--oj-core-text-color-secondary:rgba(var(--oj-palette-neutral-rgb-190), .70);--oj-core-text-color-disabled:rgba(var(--oj-palette-neutral-rgb-190), .4);--oj-core-text-color-brand:rgb(var(--oj-palette-brand-rgb-110));--oj-core-text-color-danger:rgb(var(--oj-palette-danger-rgb-120));--oj-core-text-color-warning:rgb(var(--oj-palette-warning-rgb-120));--oj-core-text-color-success:rgb(var(--oj-palette-success-rgb-120));--oj-core-bg-color-content:rgb(var(--oj-palette-neutral-rgb-0));--oj-core-bg-color-hover:rgba(var(--oj-palette-neutral-rgb-190), .08);--oj-core-bg-color-active:rgba(var(--oj-palette-neutral-rgb-190), .16);--oj-core-bg-color-selected:rgb(var(--oj-palette-brand-rgb-30));--oj-core-border-color-selected:rgb(var(--oj-palette-brand-rgb-100));--oj-core-border-color-enabled:rgba(var(--oj-palette-neutral-rgb-190), 0.5);--oj-core-color-disabled-1:rgba(var(--oj-palette-neutral-rgb-190), 0.04);--oj-core-color-disabled-2:rgba(var(--oj-palette-neutral-rgb-190),.20);--oj-core-icon-size-lg:1.5rem;--oj-core-icon-size-sm:1rem;--oj-core-divider-color:rgba(var(--oj-palette-neutral-rgb-190),.12);--oj-core-divider-margin:0.5rem;--oj-core-neutral-1:rgb(var(--oj-palette-neutral-rgb-100));--oj-core-neutral-2:rgb(var(--oj-palette-neutral-rgb-110));--oj-core-neutral-3:rgb(var(--oj-palette-neutral-rgb-120));--oj-core-neutral-contrast:rgb(var(--oj-palette-neutral-rgb-0));--oj-core-neutral-secondary-1:rgba(var(--oj-palette-neutral-rgb-190), 0.08);--oj-core-neutral-secondary-2:rgb(var(--oj-palette-neutral-rgb-20));--oj-core-neutral-secondary-3:rgb(var(--oj-palette-neutral-rgb-10));--oj-core-neutral-secondary-contrast:rgb(var(--oj-palette-neutral-rgb-190));--oj-core-brand-1:rgb(var(--oj-palette-brand-rgb-100));--oj-core-brand-2:rgb(var(--oj-palette-brand-rgb-110));--oj-core-brand-3:rgb(var(--oj-palette-brand-rgb-120));--oj-core-brand-contrast:rgb(var(--oj-palette-neutral-rgb-0));--oj-core-danger-1:rgb(var(--oj-palette-danger-rgb-120));--oj-core-danger-2:rgb(var(--oj-palette-danger-rgb-110));--oj-core-danger-3:rgb(var(--oj-palette-danger-rgb-120));--oj-core-danger-contrast:rgb(var(--oj-palette-neutral-rgb-0));--oj-core-danger-secondary-1:rgba(var(--oj-palette-danger-rgb-60), 0.4);--oj-core-danger-secondary-2:rgb(var(--oj-palette-danger-rgb-20));--oj-core-danger-secondary-3:rgb(var(--oj-palette-danger-rgb-10));--oj-core-danger-secondary-contrast:rgb(var(--oj-palette-neutral-rgb-190));--oj-core-warning-1:rgb(var(--oj-palette-warning-rgb-120));--oj-core-warning-2:rgb(var(--oj-palette-warning-rgb-110));--oj-core-warning-3:rgb(var(--oj-palette-warning-rgb-120));--oj-core-warning-contrast:rgb(var(--oj-palette-neutral-rgb-0));--oj-core-warning-secondary-1:rgba(var(--oj-palette-warning-rgb-60), 0.4);--oj-core-warning-secondary-2:rgb(var(--oj-palette-warning-rgb-20));--oj-core-warning-secondary-3:rgb(var(--oj-palette-warning-rgb-10));--oj-core-warning-secondary-contrast:rgb(var(--oj-palette-neutral-rgb-190));--oj-core-success-1:rgb(var(--oj-palette-success-rgb-120));--oj-core-success-2:rgb(var(--oj-palette-success-rgb-110));--oj-core-success-3:rgb(var(--oj-palette-success-rgb-120));--oj-core-success-contrast:rgb(var(--oj-palette-neutral-rgb-0));--oj-core-success-secondary-1:rgba(var(--oj-palette-success-rgb-60), 0.4);--oj-core-success-secondary-2:rgb(var(--oj-palette-success-rgb-20));--oj-core-success-secondary-3:rgb(var(--oj-palette-success-rgb-10));--oj-core-success-secondary-contrast:rgb(var(--oj-palette-neutral-rgb-190));--oj-core-info-1:rgb(var(--oj-palette-info-rgb-120));--oj-core-info-2:rgb(var(--oj-palette-info-rgb-110));--oj-core-info-3:rgb(var(--oj-palette-info-rgb-120));--oj-core-info-contrast:rgb(var(--oj-palette-neutral-rgb-0));--oj-core-info-secondary-1:rgba(var(--oj-palette-info-rgb-60), 0.4);--oj-core-info-secondary-2:rgb(var(--oj-palette-info-rgb-20));--oj-core-info-secondary-3:rgb(var(--oj-palette-info-rgb-10));--oj-core-info-secondary-contrast:rgb(var(--oj-palette-neutral-rgb-190));--oj-core-focus-border-color:rgb(var(--oj-palette-neutral-rgb-190));--oj-core-cursor-clickable:pointer;--oj-core-drag-drop-color-1:rgb(var(--oj-palette-brand-rgb-40));--oj-core-drag-drop-color-2:rgb(var(--oj-palette-brand-rgb-100));--oj-core-drag-drop-line-color:rgb(var(--oj-palette-brand-rgb-100));--oj-core-touch-target-min-size:2.25rem;--oj-core-box-shadow-rgb:var(--oj-palette-neutral-rgb-200);--oj-core-box-shadow-xs:0px 1px 4px 0px rgba(var(--oj-core-box-shadow-rgb),.12);--oj-core-box-shadow-sm:0px 4px 8px 0px rgba(var(--oj-core-box-shadow-rgb),.16);--oj-core-box-shadow-md:0px 6px 12px 0px rgba(var(--oj-core-box-shadow-rgb),.2);--oj-core-box-shadow-lg:0px 8px 16px 0px rgba(var(--oj-core-box-shadow-rgb),0.24);--oj-core-box-shadow-xl:0px 12px 20px 0px rgba(var(--oj-core-box-shadow-rgb),0.28);--oj-core-dropdown-box-shadow:var(--oj-core-box-shadow-sm);--oj-core-scrim-color:rgba(var(--oj-palette-neutral-rgb-190), .4);--oj-core-spacing-1x:.25rem;--oj-core-spacing-2x:.5rem;--oj-core-spacing-3x:.75rem;--oj-core-spacing-4x:1rem;--oj-core-spacing-5x:1.25rem;--oj-core-spacing-6x:1.5rem;--oj-core-spacing-7x:1.75rem;--oj-core-spacing-8x:2rem;--oj-core-spacing-9x:2.25rem;--oj-core-spacing-10x:2.5rem;--oj-core-spacing-11x:2.75rem;--oj-core-spacing-12x:3rem;--oj-core-border-radius-sm:2px;--oj-core-border-radius-md:.25rem;--oj-core-border-radius-lg:.375rem;--oj-core-border-radius-xl:.5rem;--oj-core-z-index-popup:1000;--oj-core-z-index-dialog:1050;--oj-core-z-index-messages:2000;--oj-typography-heading-2xl-font-size:2.5rem;--oj-typography-heading-2xl-font-weight:800;--oj-typography-heading-2xl-line-height:1.3;--oj-typography-heading-xl-font-size:2.25rem;--oj-typography-heading-xl-font-weight:800;--oj-typography-heading-xl-line-height:1.222;--oj-typography-heading-lg-font-size:2rem;--oj-typography-heading-lg-font-weight:800;--oj-typography-heading-lg-line-height:1.25;--oj-typography-heading-md-font-size:1.75rem;--oj-typography-heading-md-font-weight:800;--oj-typography-heading-md-line-height:1.2857;--oj-typography-heading-sm-font-size:1.5rem;--oj-typography-heading-sm-font-weight:800;--oj-typography-heading-sm-line-height:1.3333;--oj-typography-heading-xs-font-size:1.25rem;--oj-typography-heading-xs-font-weight:800;--oj-typography-heading-xs-line-height:1.4;--oj-typography-subheading-2xl-font-size:2.25rem;--oj-typography-subheading-2xl-font-weight:bold;--oj-typography-subheading-2xl-line-height:1.2222;--oj-typography-subheading-xl-font-size:2rem;--oj-typography-subheading-xl-font-weight:bold;--oj-typography-subheading-xl-line-height:1.25;--oj-typography-subheading-lg-font-size:1.75rem;--oj-typography-subheading-lg-font-weight:bold;--oj-typography-subheading-lg-line-height:1.2857;--oj-typography-subheading-md-font-size:1.5rem;--oj-typography-subheading-md-font-weight:bold;--oj-typography-subheading-md-line-height:1.3333;--oj-typography-subheading-sm-font-size:1.25rem;--oj-typography-subheading-sm-font-weight:bold;--oj-typography-subheading-sm-line-height:1.4;--oj-typography-subheading-xs-font-size:1rem;--oj-typography-subheading-xs-font-weight:bold;--oj-typography-subheading-xs-line-height:1.5;--oj-typography-body-xl-font-size:1.25rem;--oj-typography-body-xl-line-height:1.4;--oj-typography-body-lg-font-size:1.125rem;--oj-typography-body-lg-line-height:1.3333;--oj-typography-body-md-font-size:1rem;--oj-typography-body-md-line-height:1.25;--oj-typography-body-sm-font-size:0.859rem;--oj-typography-body-sm-line-height:1.2;--oj-typography-body-xs-font-size:0.75rem;--oj-typography-body-xs-line-height:1.3333;--oj-typography-body-2xs-font-size:0.625rem;--oj-typography-body-2xs-line-height:1.2;--oj-body-bg-color:rgb(var(--oj-palette-neutral-rgb-10));--oj-button-height:2.75rem;--oj-button-border-radius:var(--oj-core-border-radius-md);}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;font-size:16px;color:var(--oj-core-text-color-primary);background:var(--oj-body-bg-color)}main{max-width:1120px;padding:32px;margin:auto}header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;flex-wrap:wrap}h1{font-size:32px;line-height:1.2;margin:12px 0 24px}.eyebrow{font-size:12px;letter-spacing:.08em;font-weight:700}.scope{font-size:14px;line-height:1.6;max-width:78ch;color:var(--oj-core-text-color-secondary)}.count{padding:16px 24px;border:1px solid var(--oj-core-divider-color);border-radius:var(--oj-core-border-radius-lg);background:var(--oj-core-bg-color-content);min-width:140px}.count strong{display:block;font-size:32px}.toolbar{display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin:24px 0}button,select,input{font:inherit}button{min-height:var(--oj-button-height);padding:8px 16px;border:1px solid var(--oj-core-divider-color);border-radius:var(--oj-button-border-radius);background:var(--oj-core-bg-color-content);color:var(--oj-core-text-color-primary);cursor:pointer}button.primary{background:rgb(var(--oj-palette-brand-rgb-120));color:white;border-color:transparent}button:disabled{opacity:.5;cursor:default}select{min-height:44px;border:1px solid var(--oj-core-divider-color);border-radius:4px;padding:8px;background:white;max-width:100%}.table-wrap{overflow:auto;background:var(--oj-core-bg-color-content);border:1px solid var(--oj-core-divider-color);border-radius:var(--oj-core-border-radius-lg)}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{text-align:left;padding:20px 24px;vertical-align:top;border-bottom:1px solid var(--oj-core-divider-color)}thead th{font-size:13px;background:rgb(var(--oj-palette-neutral-rgb-20))}th:first-child{width:36%}tbody tr:last-child td,tbody tr:last-child th{border-bottom:0}td p,th p{font-size:13px;color:var(--oj-core-text-color-secondary);font-weight:400;margin:8px 0;line-height:1.5}input{width:88px;max-width:100%;padding:8px;border:1px solid var(--oj-core-divider-color);border-radius:4px;background:white;min-height:44px}.note{margin:24px 0;padding:24px;background:rgb(var(--oj-palette-info-rgb-20));border-left:4px solid rgb(var(--oj-palette-brand-rgb-120));line-height:1.6}.actions{display:flex;gap:16px;flex-wrap:wrap}.error{color:rgb(var(--oj-palette-danger-rgb-120));font-size:13px;line-height:1.5}.status{font-size:13px;padding:4px 8px;border-radius:4px;background:rgb(var(--oj-palette-neutral-rgb-20));display:inline-block}.status.ready{background:rgb(var(--oj-palette-success-rgb-20));color:rgb(var(--oj-palette-success-rgb-140))}:focus-visible{outline:2px solid var(--oj-core-focus-border-color);outline-offset:3px}[hidden]{display:none!important}@media(max-width:650px){main{padding:16px}table,tbody,tr,td,th{display:block}table{table-layout:auto}thead{display:none}th:first-child{width:auto}tbody tr{padding:16px;border-bottom:1px solid var(--oj-core-divider-color)}tbody tr:last-child{border-bottom:0}td,th{padding:8px;border:0!important}td:before{content:attr(data-label);display:block;font-size:12px;font-weight:700;margin-bottom:8px}.toolbar label{display:flex;flex-wrap:wrap;gap:8px}}
</style></head><body><main><header><div><p class="eyebrow">REDWOOD FOUNDATIONS / ORIGINAL WORKSHEET</p><h1>Prepare the studio supplies</h1><p class="scope">An original stock-review worksheet using public Oracle JET 19 Redwood variables. This is plain HTML/CSS and JavaScript, not a native JET component runtime or an Oracle inventory service. Arial is an explicit font fallback.</p></div><div class="count"><strong id="total">0</strong>units in the local draft</div></header><div class="toolbar"><label for="filter">Show <select id="filter"><option value="all">All sample items</option><option value="low">Below minimum stock</option></select></label><button id="sort">Sort by item name</button></div><div class="table-wrap"><table><thead><tr><th scope="col">Item</th><th scope="col">On hand / minimum</th><th scope="col">Add to draft</th><th scope="col">Review state</th></tr></thead><tbody id="rows"></tbody></table></div><p id="empty" hidden>No items match this view. <button id="show-all">Show all items</button></p><p class="note">Change a quantity to build a local replenishment draft. A draft may contain zero units. Nothing is ordered, approved or sent from this example.</p><div class="actions"><button class="primary" id="keep">Review this draft</button><button id="reset">Reset quantities</button></div><p id="message" role="status"></p></main><script>const initial=[{id:'paper',name:'Sketch paper',detail:'A4 recycled sheets',stock:18,min:30},{id:'markers',name:'Fine-tip markers',detail:'Black ink / single pens',stock:12,min:10},{id:'clips',name:'Binder clips',detail:'Medium / single clips',stock:6,min:20}];let amounts={paper:12,markers:0,clips:14},ascending=false;const tbody=document.querySelector('#rows');function visible(){let a=initial.filter(x=>document.querySelector('#filter').value!=='low'||x.stock<x.min);return ascending?[...a].sort((a,b)=>a.name.localeCompare(b.name)):a;}function count(){let inputs=[...document.querySelectorAll('input')];let bad=inputs.some(x=>!x.checkValidity()||x.value==='');document.querySelector('#keep').disabled=bad;document.querySelector('#total').textContent=Object.values(amounts).reduce((a,b)=>a+b,0);return bad;}function render(){tbody.innerHTML=visible().map(x=>`<tr><th scope="row">${x.name}<p>${x.detail}</p></th><td data-label="On hand / minimum">${x.stock} / ${x.min}<p>${x.stock<x.min?'Below minimum':'Above minimum'}</p></td><td data-label="Add to draft"><input id="qty-${x.id}" aria-label="Quantity for ${x.name}" type="number" min="0" max="99" step="1" value="${amounts[x.id]}" data-id="${x.id}"><p class="error" hidden>Use a whole number from 0 to 99.</p></td><td data-label="Review state"><span class="status ${amounts[x.id]?'ready':''}">${amounts[x.id]?'In draft':'No addition'}</span></td></tr>`).join('');tbody.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{let valid=input.checkValidity()&&input.value!=='';input.setAttribute('aria-invalid',String(!valid));input.nextElementSibling.hidden=valid;document.querySelector('#message').textContent='';if(valid){amounts[input.dataset.id]=Number(input.value);const status=input.closest('tr').querySelector('.status');status.textContent=Number(input.value)?'In draft':'No addition';status.classList.toggle('ready',Number(input.value)>0)}count()}));document.querySelector('#empty').hidden=visible().length>0;count()}document.querySelector('#filter').addEventListener('change',render);document.querySelector('#sort').addEventListener('click',e=>{ascending=!ascending;e.currentTarget.textContent=ascending?'Use original order':'Sort by item name';render()});document.querySelector('#show-all').addEventListener('click',()=>{document.querySelector('#filter').value='all';render()});document.querySelector('#keep').addEventListener('click',()=>{if(!count())document.querySelector('#message').textContent='Reviewed '+Object.values(amounts).reduce((a,b)=>a+b,0)+' units across '+Object.values(amounts).filter(x=>x>0).length+' items in this local draft. No order was sent.'});document.querySelector('#reset').addEventListener('click',()=>{amounts={paper:12,markers:0,clips:14};document.querySelector('#message').textContent='';render()});render();</script></body></html>
```

[Code reference](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css)

- This is deliberately not oj-table or oj-input-number.
- No Oracle application, inventory service or order endpoint is connected.

## Implementation Starting Point

Runs the original standalone interpretation. Native JET adoption is a separate framework setup described in the linked official documentation.

```sh
# Save the complete supplied document as index.html.
python3 -m http.server 8000
# Open http://localhost:8000/
```

## Agent Prompt

Implement the supplied original Redwood-inspired stock-review worksheet using verified JET 19 public base variables. Preserve RGB-channel syntax, valid quantity state keyed by item ID, validation boundaries, sort/filter preservation, local-only review and reset. Do not describe this browser implementation as native JET or an Oracle service.

## Sources

- [JET styling overview](https://docs.oracle.com/en/middleware/developer-tools/jet/19/reference-styling/CssVariablesOverview.html) — Public variable scope, Redwood versus Stable and theme boundaries.
- [Pinned Redwood CSS](https://cdn.jsdelivr.net/npm/@oracle/oraclejet@19.0.0/dist/css/redwood/oj-redwood.css) — Actual base values used in the reference and example.
- [Oracle JET documentation](https://docs.oracle.com/en/middleware/developer-tools/jet/19/develop/index.html) — Native framework setup and development context.
- [Redwood adoption](https://docs.oracle.com/en/cloud/saas/readiness/redwood-adoption/) — Separate Oracle application adoption context.
