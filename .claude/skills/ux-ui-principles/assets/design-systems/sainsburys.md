# Sainsbury's Design System — OpenDesign Application Guide

Apply Sainsbury’s public design guidance to a complete collection-slot flow: real palette and size references, accessible radio choices, an updating summary and honest local feedback.

An OpenDesign application study of Sainsbury’s public guidance. This is original HTML, not the private Fable runtime. It uses Arial rather than redistributed Mary Ann assets, with fictional collection slots and fees.

## Source Reference

- **Implementation:** Complete independent HTML study ([source](https://design-systems.sainsburys.co.uk/getting-started/for-third-party-partners/))
- **Body type:** Arial, 1rem / 1.5 ([source](https://design-systems.sainsburys.co.uk/foundations/typography/))
- **Touch target:** 48px minimum in the component guidance ([source](https://design-systems.sainsburys.co.uk/components/button/))


## Design Reference

Public Sainsbury’s color, size-token, typography and component guidance. Conflicting published breakpoint tables are identified rather than merged.

### Sainsbury’s palette roles

[Official reference](https://design-systems.sainsburys.co.uk/foundations/colour/sainsburys-colours/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Primary brand base | #F06C00 | Brand accent and button fill with dark text in this study. |
| Primary hover | #E55000 | Hover fill; not a small-text color on white. |
| Primary pressed | #C15100 | Pressed state. |
| Primary light | #FEF5F0 | Selection and summary background. |
| Secondary base | #7F0442 | Sparing decorative accent. |
| Monochrome darker | #262626 | Primary content. |
| Monochrome dark | #404040 | Supporting content. |
| Monochrome light | #D8D8D8 | Boundaries. |
| Monochrome lighter | #F2F2F2 | Unavailable option surface. |
| Success lighter | #E6F4ED | Local review feedback surface. |
| Success darker | #246127 | Feedback text. |
| Info darker | #135CA3 | Application focus outline. |

### Published size tokens

[Official reference](https://design-systems.sainsburys.co.uk/foundations/design-tokens/size-tokens/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| xs | 2px | Spacing value from the public size-token table. |
| sm | 4px | Spacing value from the public size-token table. |
| md | 8px | Spacing value from the public size-token table. |
| lg | 16px | Spacing value from the public size-token table. |
| xl | 24px | Spacing value from the public size-token table. |
| 2xl | 32px | Spacing value from the public size-token table. |
| 3xl | 40px | Spacing value from the public size-token table. |
| 4xl | 48px | Spacing value from the public size-token table. |
| width-sm | 1px | Border token; keep width and radius names distinct. |
| width-base | 2px | Border token; keep width and radius names distinct. |
| radius-base | 2px | Border token; keep width and radius names distinct. |
| radius-xl | 12px | Border token; keep width and radius names distinct. |
| min-width-sm | 576px | Token breakpoint; differs from the editorial layout page. |
| min-width-md | 768px | Token breakpoint; differs from the editorial layout page. |
| min-width-lg | 992px | Token breakpoint; differs from the editorial layout page. |
| min-width-xl | 1200px | Token breakpoint; differs from the editorial layout page. |

### Sainsbury’s type scale

[Official reference](https://design-systems.sainsburys.co.uk/foundations/typography/)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Body 1 | 1rem / 1.5 / Arial Regular | Main copy. |
| Caption | 0.875rem / 1.571 / Arial Regular | Supporting notes. |
| Label 1 | 1rem / 1.5 / Arial Bold | Control labels. |
| Display 1 | 1.25rem / 1.3 | Brand display face in official guidance; fallback here. |
| Display 2 | 1.5rem / 1.333 | Responsive alternative is Display 3. |
| Display 3 | 1.875rem / 1.333 | Responsive alternative is Display 4. |
| Display 4 | 2.375rem / 1.316 | Responsive alternative is Display 5. |
| Display 5 | 3rem / 1.292 | Responsive alternative is Display 6. |
| Display 6 | 3.75rem / 1.267 | Top documented display size. |
| Responsive type threshold | larger than 720px | Independent of the 768px size-token breakpoint. |

## Sainsbury's Design System Multi-brand System and Access

### Choose one brand theme

Fable supports Sainsbury’s, Argos, Nectar, Tu and Habitat through shared component structures and brand-specific values. This guide uses the Sainsbury’s palette only. Mixing Nectar purple into a Sainsbury’s interaction or assuming all brands use the same font would erase an explicit system boundary. Keep the selected theme attached to the application entry point.

### Distinguish public guidance from private packages

The public partner guide describes React components, Fable Styles and the design-token package, but access to the codebase requires credentials requested through a Sainsbury’s contact. This example needs none: it is complete original HTML based on published guidance. It does not pretend to run Fable or invent install commands for an inaccessible registry.

## Sainsbury's Design System Palette and Contrast

### Use orange with an appropriate text pair

The source documents that base and dark orange do not meet ordinary body-text contrast on white. The specimen uses orange as a fill with black button text, rather than small orange copy on white or small white copy on orange. A brand exception in documentation should not silently become a claim that every pair is accessible.

### Keep feedback semantic

The review result uses the green success surface and dark green text. Unavailable slots use a neutral surface and a written label, while selected slots have both a checked radio and an orange outline. Color is a supporting cue; it never replaces timing, availability or selection text.

## Sainsbury's Design System Spacing, Corners and Breakpoint Boundaries

### Follow the published size scale

The specimen uses 8px between choices, 16px within each slot and 24–32px between major groups. Controls use a 2px corner while the summary uses the documented 12px radius. Those differences express grouping rather than applying the same rounded card treatment everywhere.

### Record the documentation discrepancy

The layout guide lists 600px and 900px device thresholds, while the size-token table lists 576px, 768px and 992px. The typography guide separately changes display sizes above 720px. These are not interchangeable names for one scale. This implementation chooses the size-token 768px threshold for columns and states that choice explicitly.

## Sainsbury's Design System Typography and Useful Content

### Preserve the brand-font boundary

Official Sainsbury’s display styles use Mary Ann Extra Bold, while ordinary body text uses Arial. The public specimen uses Arial throughout because no brand-font asset is included. It retains the scale and line-height relationship without claiming the fallback is visually identical. Semantic heading levels remain independent from display sizes.

### Make the collection decision readable

Each slot has a time range and a fee or unavailable label. The summary repeats the selected day, time and sample location. The main action says Review collection, which describes the next local step. No timer, order total or reservation success is fabricated to make the example look more commercial.

## Sainsbury's Design System Radio Choices and Local State

### Use dependent choices within a group

The day controls change the available time options, and each time is a native radio in one named group. Changing the day selects its first available slot and updates the summary. An unavailable option remains visible but cannot become selected. Native radios provide familiar keyboard behavior without recreating it with clickable divs.

### Prevent stale reservation claims

Review shows a local confirmation and says that no slot has been reserved. Changing either day or time hides that result. A production flow would need a fresh availability check and server response before claiming a reservation. The example isolates the interaction contract so that missing backend work cannot be mistaken for a completed booking.

## Sainsbury's Design System Targets, Focus and Responsive Behavior

### Give choices enough room

The public button guidance recommends a 48px touch target. Day buttons and the review action meet that height, while each entire labeled slot is clickable. A blue focus outline remains visible against orange and pale surfaces. The decorative basket mark is hidden from assistive technology.

### Let long content wrap

At narrow widths, the summary follows the choice list and the decorative mark disappears. Slot labels and prices remain in normal document flow, with flexible height. A translated or longer location name should not be clipped into a fixed card; this English prototype keeps that space available for the later localization stage.

## Sainsbury's Design System Implementation and Agent Review

### Run the self-contained example

Save the complete HTML example and serve it locally. Its three days and three slots per day are authored sample data, and all changes stay in memory. The source contains the CSS, radio creation, summary update and stale-feedback clearing so there is no missing application layer behind the preview.

1. Save the complete file as index.html.
2. Choose Tuesday and confirm the unavailable morning slot cannot be selected.
3. Change the time and inspect the summary.
4. Review, then change the day and confirm the old result clears.

### Move to Fable only with verified access

For an authorized internal integration, obtain the real package access and inspect the current theme and component APIs. Preserve the behavior of the specimen while replacing its original markup with supported components. Verify that the installed token scale matches the public references before treating a screenshot as implementation proof.

- Use one brand theme consistently.
- Verify package access and current APIs.
- Check text contrast separately from brand color fidelity.

## Component Examples

### Complete collection-slot flow

Independent HTML/CSS/JavaScript with day selection, radio slots, disabled availability and a live summary.

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" /><meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  /><title>Collection slot study</title
  ><style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      background: #fff;
      color: #262626;
      font:
        16px/1.5 Arial,
        sans-serif;
      padding: 32px;
    }
    header {
      border-top: 8px solid #f06c00;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }
    h1 {
      font-size: 38px;
      line-height: 1.316;
      margin: 8px 0 16px;
    }
    h2 {
      font-size: 24px;
      line-height: 1.333;
      margin: 0 0 16px;
    }
    .eyebrow,
    small {
      font-size: 14px;
      color: #404040;
    }
    p {
      margin: 8px 0 24px;
    }
    .basket {
      font-size: 48px;
      line-height: 1;
      background: #fef5f0;
      border-radius: 50%;
      width: 96px;
      height: 96px;
      display: grid;
      place-items: center;
      color: #7f0442;
    }
    main {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
      margin-top: 24px;
    }
    fieldset {
      border: 0;
      padding: 0;
      margin: 0 0 24px;
    }
    legend {
      font-weight: bold;
      margin-bottom: 16px;
    }
    .dates {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    button,
    select {
      font: inherit;
      min-height: 48px;
      padding: 12px 16px;
      border: 1px solid #737373;
      border-radius: 2px;
      background: white;
      color: #262626;
      cursor: pointer;
    }
    .dates button[aria-pressed="true"] {
      border: 2px solid #f06c00;
      background: #fef5f0;
      padding: 11px 15px;
    }
    .slots {
      display: grid;
      gap: 8px;
    }
    .slot {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      border: 1px solid #d8d8d8;
      border-radius: 2px;
      cursor: pointer;
    }
    .slot:has(input:checked) {
      border: 2px solid #f06c00;
      padding: 15px;
      background: #fef5f0;
    }
    .slot:has(input:disabled) {
      background: #f2f2f2;
      cursor: default;
    }
    .slot input {
      accent-color: #c15100;
      width: 20px;
      height: 20px;
    }
    .slot strong {
      margin-left: auto;
    }
    .unavailable {
      color: #404040;
    }
    .primary {
      background: #f06c00;
      border: 2px solid #f06c00;
      font-weight: bold;
      color: #000;
    }
    .primary:hover {
      background: #e55000;
      border-color: #e55000;
    }
    .primary:active {
      background: #c15100;
      border-color: #c15100;
    }
    .summary {
      background: #fef5f0;
      border-radius: 12px;
      padding: 24px;
      align-self: start;
    }
    .summary dl {
      margin: 0;
    }
    .summary dt {
      font-size: 14px;
      margin-top: 16px;
    }
    .summary dd {
      margin: 4px 0;
      font-weight: bold;
    }
    #result {
      padding: 16px;
      background: #e6f4ed;
      color: #246127;
      margin-top: 24px;
    }
    button:focus-visible,
    input:focus-visible {
      outline: 3px solid #135ca3;
      outline-offset: 3px;
    }
    footer {
      border-top: 1px solid #d8d8d8;
      margin-top: 32px;
      padding-top: 16px;
      font-size: 14px;
      color: #404040;
    }
    [hidden] {
      display: none !important;
    }
    @media (max-width: 767px) {
      body {
        padding: 16px;
      }
      main {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      h1 {
        font-size: 30px;
      }
      .basket {
        display: none;
      }
      .dates button {
        flex: 1;
      }
      .summary {
        padding: 16px;
      }
    }
  </style>
  <body>
    <header>
      <div>
        <span class="eyebrow">GROCERIES / ORIGINAL COLLECTION STUDY</span>
        <h1>Choose a collection slot</h1>
        <p>
          Select a sample day and time. No order or real availability is
          connected.
        </p>
      </div>
      <div class="basket" aria-hidden="true">▥</div>
    </header>
    <main>
      <section>
        <fieldset>
          <legend>Collection day</legend>
          <div class="dates" id="dates"></div>
        </fieldset>
        <fieldset>
          <legend id="slotLabel">Available times</legend>
          <div id="slots" class="slots"></div>
        </fieldset>
      </section>
      <aside class="summary">
        <h2>Collection details</h2>
        <dl>
          <dt>Sample location</dt>
          <dd>Riverside collection point</dd>
          <dt>Day and time</dt>
          <dd id="selection"></dd>
          <dt>Sample fee</dt>
          <dd id="fee"></dd>
        </dl>
        <p><small>All fees and slots are illustrative.</small></p>
        <button class="primary" id="review">Review collection</button>
        <div id="result" role="status" hidden></div>
      </aside>
    </main>
    <footer>
      Independent HTML interpretation of Sainsbury’s public guidance. Arial
      fallback; no private Fable runtime or brand font assets.
    </footer>
    <script>
      const days = [
        {
          label: "Monday",
          slots: [
            ["09:00–10:00", 1, true],
            ["12:00–13:00", 0, true],
            ["17:00–18:00", 2, false],
          ],
        },
        {
          label: "Tuesday",
          slots: [
            ["09:00–10:00", 0, false],
            ["12:00–13:00", 1, true],
            ["17:00–18:00", 1, true],
          ],
        },
        {
          label: "Wednesday",
          slots: [
            ["09:00–10:00", 0, true],
            ["12:00–13:00", 0, true],
            ["17:00–18:00", 2, true],
          ],
        },
      ];
      let day = 0,
        slot = 0;
      const $ = (id) => document.getElementById(id);
      function update() {
        const choice = days[day].slots[slot];
        $("selection").textContent = days[day].label + ", " + choice[0];
        $("fee").textContent =
          choice[1] === 0 ? "No collection fee" : "£" + choice[1].toFixed(2);
        $("result").hidden = true;
      }
      function render() {
        $("dates").replaceChildren(
          ...days.map((d, i) => {
            let b = document.createElement("button");
            b.textContent = d.label;
            b.setAttribute("aria-pressed", i === day);
            b.onclick = () => {
              day = i;
              slot = d.slots.findIndex((s) => s[2]);
              render();
            };
            return b;
          }),
        );
        $("slotLabel").textContent = days[day].label + " collection times";
        $("slots").replaceChildren(
          ...days[day].slots.map((s, i) => {
            let l = document.createElement("label");
            l.className = "slot";
            let input = document.createElement("input");
            input.type = "radio";
            input.name = "time";
            input.checked = i === slot;
            input.disabled = !s[2];
            input.onchange = () => {
              slot = i;
              update();
            };
            let text = document.createElement("span");
            text.textContent = s[0];
            let fee = document.createElement("strong");
            fee.textContent = s[2]
              ? s[1] === 0
                ? "No fee"
                : "£" + s[1].toFixed(2)
              : "Unavailable";
            l.append(input, text, fee);
            return l;
          }),
        );
        update();
      }
      $("review").onclick = () => {
        $("result").hidden = false;
        $("result").textContent =
          "Local selection ready: " +
          $("selection").textContent +
          ". No slot has been reserved.";
      };
      render();
    </script>
  </body>
</html>

```

[Code reference](https://design-systems.sainsburys.co.uk/components/radio-button/)

- No private package or credentials are needed.

## Implementation Starting Point

Fable package access is separate from this public, self-contained study.

```sh
# Save the complete HTML example as index.html
python3 -m http.server 8080
# Open http://localhost:8080
```

## Agent Prompt

Build a Sainsbury’s-guided collection-slot selector from this complete HTML example. Keep one brand palette, black text on the orange action, native labeled radios, a 48px target, and the explicit 768px layout choice. Clear review feedback whenever selection changes. Use fictional availability and do not claim Fable runtime or a successful reservation.

## Sources

- [Sainsbury’s colors](https://design-systems.sainsburys.co.uk/foundations/colour/sainsburys-colours/) — Palette values and the documented orange contrast limitation.
- [Size tokens](https://design-systems.sainsburys.co.uk/foundations/design-tokens/size-tokens/) — Border, spacing and breakpoint values.
- [Typography](https://design-systems.sainsburys.co.uk/foundations/typography/) — Brand faces, scale and responsive behavior.
- [Radio button](https://design-systems.sainsburys.co.uk/components/radio-button/) — Selection, labels and grouping.
- [Button](https://design-systems.sainsburys.co.uk/components/button/) — Action hierarchy, labels and targets.
- [Partner access](https://design-systems.sainsburys.co.uk/getting-started/for-third-party-partners/) — Private codebase access and implementation paths.
- [Layout](https://design-systems.sainsburys.co.uk/foundations/layout/) — Editorial layout grid; differs from size-token breakpoints.
