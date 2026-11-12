# Salesforce Lightning Design System — OpenDesign Application Guide

A Lightning blueprint guide for dense record work: real spacing, type and semantic colors, an editable case workspace, field validation and an activity history that reflects local changes.

OpenDesign guide to the pinned SLDS CSS package. The preview uses native CSS with original HTML and JavaScript, fictional case data and local state. It does not load Lightning Web Components or connect to Salesforce. The upstream repository is archived; evaluate the current Salesforce platform guidance for production work.

## Source Reference

- **Package:** SLDS 2.264.1 CSS ([source](https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.264.1/design-tokens/dist/ui-force.json))
- **Implementation:** Native CSS; original HTML/JS ([source](https://github.com/salesforce-ux/design-system))
- **State:** Local draft and saved record ([source](https://github.com/salesforce-ux/design-system))


## Design Reference

Published @salesforce-ux/design-system 2.264.1 native CSS and ui-force token export. This is a pinned classic blueprint reference, not a claim of compatibility with the newer SLDS 2 design language or a Lightning Web Components runtime. The historical upstream repository is archived.

### Record surfaces and semantic text

[Official reference](https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.264.1/design-tokens/dist/ui-force.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| COLOR_BACKGROUND | rgb(243, 243, 243) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_BACKGROUND_ALT | rgb(255, 255, 255) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_TEXT_DEFAULT | rgb(3, 45, 96) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_TEXT_WEAK | rgb(116, 116, 116) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_BORDER | rgb(201, 201, 201) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_BORDER_ERROR | rgb(234, 0, 30) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_BORDER_SELECTION | rgb(1, 118, 211) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_BACKGROUND_BUTTON_BRAND | rgb(1, 118, 211) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_BACKGROUND_BUTTON_BRAND_HOVER | rgb(1, 68, 134) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |
| COLOR_BACKGROUND_BUTTON_BRAND_ACTIVE | rgb(3, 45, 96) | Published package reference. Preserve the named text, surface or action role instead of applying one brand color everywhere. |

### Classic spacing scale

[Official reference](https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.264.1/design-tokens/dist/ui-force.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| SPACING_X_SMALL | 0.5rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_XXX_SMALL | 0.125rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_XX_SMALL | 0.25rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_SMALL | 0.75rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_MEDIUM | 1rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_NONE | 0 | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_X_LARGE | 2rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_XX_LARGE | 3rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |
| SPACING_LARGE | 1.5rem | Classic SPACING_* export. This is not the separate compact VAR_SPACING_* set. |

### Type scale

[Official reference](https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.264.1/design-tokens/dist/ui-force.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| FONT_SIZE_1 | 0.625rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_2 | 0.75rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_3 | 0.8125rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_4 | 0.875rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_5 | 1rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_6 | 1.125rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_7 | 1.25rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_8 | 1.5rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_9 | 1.75rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_10 | 2rem | Choose text size by role, retaining readable case notes and field labels. |
| FONT_SIZE_11 | 2.625rem | Choose text size by role, retaining readable case notes and field labels. |

### Corner radius

[Official reference](https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.264.1/design-tokens/dist/ui-force.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| BORDER_RADIUS_SMALL | 0.125rem | Published radius reference. A circular status marker is different from a rectangular form control. |
| BORDER_RADIUS_MEDIUM | 0.25rem | Published radius reference. A circular status marker is different from a rectangular form control. |
| BORDER_RADIUS_LARGE | 0.5rem | Published radius reference. A circular status marker is different from a rectangular form control. |
| BORDER_RADIUS_CIRCLE | 50% | Published radius reference. A circular status marker is different from a rectangular form control. |

### Native CSS blueprint anatomy

[Official reference](https://github.com/salesforce-ux/design-system/tree/main/ui/components)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| slds-page-header | Record context | Keep case identity and summary above the editing form. |
| slds-card | Grouped content region | Case details and activity use separate semantic regions. |
| slds-form-element | Label + control + help | Wrap each editable value in a coherent field. |
| slds-has-error | Invalid field modifier | Set beside aria-invalid and a specific error message. |
| slds-button_brand | Primary action | Save the local update; the class supplies styling, not persistence. |
| slds-button_neutral | Secondary action | Discard the draft and restore the last saved local values. |

## Salesforce Lightning Design System Record Layout and Context

### Keep record identity above local tasks

The page header holds a case number, subject, account and owner. Those values identify the object before the user changes a field. The status badge is a summary of the saved local record, so it changes on Save rather than following an uncommitted select value.

### Divide details from activity

The wider region combines customer context and the editing form. The secondary region contains an ordered history. This separation allows a user to compare the requested work with changes already recorded without navigating to a different screen. The mobile layout stacks these regions in the same semantic order.

## Salesforce Lightning Design System Semantic Colors and States

### Read token names as roles

The ui-force export distinguishes default text, weak text, selected borders and branded button backgrounds. The sample keeps body copy dark, metadata restrained and the primary action blue. Red belongs to the invalid field and its written recovery message, not to every unsaved value.

### Preserve state through more than color

Priority and status are displayed as words in the summary and new activity entry. Error state combines the native slds-has-error modifier with aria-invalid and a message tied to the textarea. The local confirmation is written in a status region; a green accent alone would not tell the user what was saved.

## Salesforce Lightning Design System Type Scale and Record Density

### Use hierarchy without oversized headings

The published numbered type scale starts at 0.625rem and extends to 2.625rem. A case workspace does not need the largest display size on every region. The native page-header title identifies the record, card headings distinguish areas and normal body text carries the customer request and note.

### Keep long record subjects intact

The custom layout allows the page title to wrap rather than truncating the subject at a narrow width. Metadata can move onto additional lines. Do not reduce all text to compensate for a long account name; test realistic subject and owner lengths before deciding where truncation has a safe full-text alternative.

## Salesforce Lightning Design System Spacing and Blueprint Structure

### Do not merge classic and variable spacing exports

This guide lists SPACING_* from ui-force. The separate var-spacing export contains different compact values; VAR_SPACING_MEDIUM is not the same reference as SPACING_MEDIUM. Mixing values based only on similar names can make a form uneven. Choose the intended density system and retain its source.

### Use the field wrapper consistently

Each label and control belongs inside slds-form-element, with slds-form-element__control around the input and help text immediately after it. The original grid arranges two related select fields side by side, then stacks them on narrow screens. That grid is application layout, while the field anatomy comes from the native blueprint.

## Salesforce Lightning Design System Draft and Saved Record Behavior

### Maintain a saved record separately from controls

The script keeps the last saved priority and status in a record object. Editing the selects changes the draft only. Save copies the values into that object, updates the summary and adds an activity item. This makes Discard draft meaningful after several successful edits.

### Avoid inventing backend success

The sample has no record ID lookup, permission model, API or database. Its button and confirmation explicitly say local. A production Salesforce integration would need the appropriate data APIs and server responses before updating a definitive record status. CSS classes cannot supply those guarantees.

## Salesforce Lightning Design System Field Validation and Activity

### Make the note explain the change

The authored rule requires ten trimmed characters and limits the textarea to 300. An empty or short note prevents all record changes, shows the field error and moves focus to the note. Editing clears the stale error, while the next Save validates the current value again.

1. Submit without a note and verify that saved summary values do not change.
2. Enter a useful note, save and inspect the newest activity entry.
3. Change fields again, discard the draft and confirm restoration to the last saved values.

### Append a readable change entry

A successful local update creates an activity title from the saved status and priority, followed by the exact note as text content. It prepends the entry so the newest change appears first. The note is never interpreted as HTML, and the static initial activity remains below the user’s local entries.

## Salesforce Lightning Design System Accessible Forms and Recovery

### Use real labels and explicit descriptions

Selects and textarea have visible labels linked by for and id. The note references helper and error text, and the required marker has a readable title. The primary and discard actions are buttons with the appropriate submit and button types, avoiding accidental submission when the user discards a draft.

### Return to a predictable place after discarding

Discard restores the saved priority and status, clears the note and field error, and focuses the priority control. It does not delete activity history or reset the record to its initial state. This distinction matters when a user saves once, experiments with another change and then cancels that second draft.

## Salesforce Lightning Design System CSS Integration and Version Scope

### Install the published styling package

The complete source imports the pinned CSS distribution and a small application stylesheet. Vite resolves the package font and image URLs. The HTML and JavaScript then supply the record behavior; this is a CSS blueprint implementation, not a wrapper around lightning-record-edit-form.

- Native package CSS provides the field, button and card appearance.
- Original HTML provides the record structure and labels.
- Original JavaScript owns draft state, validation and local activity.

### Treat the archived source as a versioned reference

The official GitHub repository is archived, so this page identifies the actual package used rather than calling it an actively maintained latest recommendation. Salesforce platform components, newer design-system guidance and styling-hook support should be checked for the target environment. Keep the chosen CSS package and framework integration decisions explicit.

## Component Examples

### index.html — complete case workspace

The record summary, form and initial activity in semantic HTML.

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Local case workspace</title>
<body>
<main class="slds-example">
  <header class="slds-page-header">
    <p class="slds-text-title_caps">Service workspace · fictional record</p>
    <div class="record-title">
      <div>
        <h1 class="slds-page-header__title">
          Case 004218 · Delivery address update
        </h1>
        <p class="slds-text-body_small">
          Northstar Studio · Opened today · Owner: Maya Chen
        </p>
      </div>
      <span id="status-badge" class="slds-badge">New</span>
    </div>
  </header>
  <div class="record-grid">
    <section class="slds-card">
      <div class="slds-card__header">
        <h2 class="slds-card__header-title">Case details</h2>
      </div>
      <div class="slds-card__body slds-card__body_inner">
        <div class="summary">
          <div>
            <span class="slds-text-title">Contact</span>
            <p>Alex Morgan</p>
          </div>
          <div>
            <span class="slds-text-title">Channel</span>
            <p>Email</p>
          </div>
          <div>
            <span class="slds-text-title">Priority</span>
            <p id="read-priority">Medium</p>
          </div>
          <div>
            <span class="slds-text-title">Status</span>
            <p id="read-status">New</p>
          </div>
        </div>
        <div class="slds-box slds-theme_shade slds-m-top_medium">
          <h3 class="slds-text-heading_small">Customer request</h3>
          <p class="slds-m-top_small">
            Please update the delivery location for order NS-1842 before it
            leaves the warehouse. The contact is available to confirm the new
            address.
          </p>
        </div>
        <form id="case-form" class="slds-m-top_large" novalidate>
          <h3 class="slds-text-heading_small slds-m-bottom_medium">
            Update the local case
          </h3>
          <div class="field-grid">
            <div class="slds-form-element">
              <label class="slds-form-element__label" for="priority"
                >Priority</label
              >
              <div class="slds-form-element__control">
                <div class="slds-select_container">
                  <select class="slds-select" id="priority">
                    <option>Low</option>
                    <option selected>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="slds-form-element">
              <label class="slds-form-element__label" for="case-status"
                >Status</label
              >
              <div class="slds-form-element__control">
                <div class="slds-select_container">
                  <select class="slds-select" id="case-status">
                    <option>New</option>
                    <option>Working</option>
                    <option>Escalated</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div id="note-field" class="slds-form-element slds-m-top_medium">
            <label class="slds-form-element__label" for="case-note"
              ><abbr class="slds-required" title="required">*</abbr> Update
              note</label
            >
            <div class="slds-form-element__control">
              <textarea
                class="slds-textarea"
                id="case-note"
                rows="3"
                maxlength="300"
                aria-describedby="note-help note-error"
              ></textarea>
            </div>
            <p id="note-help" class="slds-form-element__help">
              Explain the change in 10–300 characters. Nothing is sent to
              Salesforce.
            </p>
            <p id="note-error" class="slds-form-element__help" hidden>
              Enter an update note of at least 10 characters.
            </p>
          </div>
          <div class="form-actions">
            <button
              type="button"
              id="cancel"
              class="slds-button slds-button_neutral"
            >
              Discard draft</button
            ><button type="submit" class="slds-button slds-button_brand">
              Save local update
            </button>
          </div>
          <p id="save-result" class="slds-m-top_small" role="status"></p>
        </form>
      </div>
    </section>
    <aside class="slds-card">
      <div class="slds-card__header">
        <h2 class="slds-card__header-title">Case activity</h2>
      </div>
      <div class="slds-card__body slds-card__body_inner">
        <p class="slds-text-body_small slds-m-bottom_medium">
          Newest updates first
        </p>
        <ol id="activity" class="activity">
          <li>
            <span class="activity-dot"></span>
            <div>
              <h3 class="slds-text-heading_small">Case opened</h3>
              <p>Customer requested a delivery address change.</p>
              <small>Initial example activity</small>
            </div>
          </li>
        </ol>
      </div>
    </aside>
  </div>
  <footer>
    Native SLDS 2.264.1 CSS with original HTML and JavaScript. Local
    demonstration; no Salesforce record or message is created.
  </footer>
</main>

<script type="module" src="/src/main.js"></script>
</body></html>
```

[Code reference](https://github.com/salesforce-ux/design-system)

- Save at the Vite project root.

### main.js — draft, validation and activity

The complete application behavior and native CSS import.

```js
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css";
import "./slds.css";
let record = { priority: "Medium", status: "New" };
const form = document.querySelector("#case-form"),
  priority = document.querySelector("#priority"),
  status = document.querySelector("#case-status"),
  note = document.querySelector("#case-note"),
  field = document.querySelector("#note-field"),
  error = document.querySelector("#note-error"),
  result = document.querySelector("#save-result");
function clearError() {
  field.classList.remove("slds-has-error");
  error.hidden = true;
  note.removeAttribute("aria-invalid");
  result.textContent = "";
}
form.addEventListener("input", clearError);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = note.value.trim();
  if (text.length < 10) {
    field.classList.add("slds-has-error");
    error.hidden = false;
    note.setAttribute("aria-invalid", "true");
    note.focus();
    return;
  }
  record = { priority: priority.value, status: status.value };
  document.querySelector("#read-priority").textContent = record.priority;
  document.querySelector("#read-status").textContent = record.status;
  document.querySelector("#status-badge").textContent = record.status;
  const li = document.createElement("li"),
    dot = document.createElement("span"),
    body = document.createElement("div"),
    h = document.createElement("h3"),
    p = document.createElement("p"),
    small = document.createElement("small");
  dot.className = "activity-dot";
  h.className = "slds-text-heading_small";
  h.textContent = record.status + " · " + record.priority + " priority";
  p.textContent = text;
  small.textContent = "Local update · this session";
  body.append(h, p, small);
  li.append(dot, body);
  document.querySelector("#activity").prepend(li);
  note.value = "";
  clearError();
  result.textContent = "Local case updated. No server request was made.";
});
document.querySelector("#cancel").addEventListener("click", () => {
  priority.value = record.priority;
  status.value = record.status;
  note.value = "";
  clearError();
  priority.focus();
});

```

[Code reference](https://github.com/salesforce-ux/design-system)

- Save as src/main.js. All updates remain local.

### slds.css — responsive composition

Only the original record grid, history decoration and mobile layout.

```css
[hidden] { display: none !important; }
body {
  margin: 0;
}
.slds-example {
  background: #f3f3f3;
  padding: 24px;
  min-height: 680px;
}
.record-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-top: 12px;
}
.record-title h1 {
  white-space: normal;
}
.record-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 1fr);
  gap: 20px;
  margin-top: 20px;
}
.record-grid > .slds-card {
  margin: 0;
  min-width: 0;
}
.summary,
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.summary p {
  font-weight: 600;
  margin-top: 4px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
.activity {
  list-style: none;
  padding: 0;
  margin: 0;
}
.activity li {
  display: flex;
  gap: 12px;
  padding-bottom: 24px;
  position: relative;
}
.activity li:not(:last-child):before {
  content: "";
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: 0;
  border-left: 1px solid #c9c9c9;
}
.activity-dot {
  flex: none;
  width: 11px;
  height: 11px;
  background: #0176d3;
  border-radius: 50%;
  margin-top: 5px;
}
.activity p {
  margin: 8px 0;
}
.activity small {
  color: #747474;
}
.slds-example footer {
  font-size: 12px;
  color: #747474;
  margin-top: 20px;
}
.slds-form-element.slds-has-error #note-help {
  color: #444;
}
@media (max-width: 760px) {
  .slds-example {
    padding: 12px;
  }
  .record-grid {
    grid-template-columns: 1fr;
  }
  .record-title {
    gap: 12px;
  }
  .field-grid {
    grid-template-columns: 1fr;
  }
  .form-actions {
    justify-content: flex-start;
  }
}

```

[Code reference](https://github.com/salesforce-ux/design-system)

- Save as src/slds.css; package styles remain separate.

## Implementation Starting Point

Pinned native CSS example, not a Salesforce org deployment. Preserve package and asset notices when redistributing bundled assets.

```sh
npm create vite@latest slds-case -- --template vanilla
cd slds-case
npm install
npm install @salesforce-ux/design-system@2.264.1
# Replace index.html; add src/main.js and src/slds.css from the complete examples.
npm run dev
```

## Agent Prompt

Build a focused case workspace using the pinned SLDS CSS blueprints. Keep record identity, customer context, saved state and editing draft distinct. Use the exact field anatomy, real token references and complete source here. Validate the note before changing the summary, preserve local activity after discard, and do not imply a Salesforce backend connection.

## Sources

- [Official Source Repository](https://github.com/salesforce-ux/design-system) — Archived source, blueprints and package history.
- [Pinned Token Export](https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.264.1/design-tokens/dist/ui-force.json) — Exact classic spacing, type, radius and color values.
- [Component Blueprints](https://github.com/salesforce-ux/design-system/tree/main/ui/components) — Native markup and modifier patterns.
