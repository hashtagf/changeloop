# Mozilla Protocol Design System — OpenDesign Application Guide

An editorial Protocol guide with real font stacks, spacing and container scales, a responsive illustrated reading page, and a complete native-CSS form example.

OpenDesign application guide to Mozilla Protocol 22.0.0. The specimen runs the published CSS and bundled fonts with original copy, illustration and local form behavior. It is not a Mozilla product, newsletter or subscription service; brand and asset rights remain with their respective owners.

## Source Reference

- **Package:** @mozilla-protocol/core 22.0.0 ([source](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json))
- **Mozilla typography:** Mozilla Headline / Mozilla Text ([source](https://protocol.mozilla.org/docs/fundamentals/typography))
- **Maximum token width:** 1440px ([source](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json))


## Design Reference

Mozilla Protocol 22.0.0 published token JSON and native CSS. Dollar-prefixed names are Sass tokens. The original specimen uses the Mozilla typography theme; its density controls and circular illustration are application choices.

### Typeface stacks

[Official reference](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $font-stack-base | Inter, X-LocaleSpecific, sans-serif | Choose the Mozilla or Firefox brand stack explicitly; do not use a headline face for long body text. |
| $font-stack-firefox | Metropolis, X-LocaleSpecific, sans-serif | Choose the Mozilla or Firefox brand stack explicitly; do not use a headline face for long body text. |
| $font-stack-mozilla-headline | 'Mozilla Headline', 'Helvetica Neue', Arial, X-LocaleSpecific, sans-serif | Choose the Mozilla or Firefox brand stack explicitly; do not use a headline face for long body text. |
| $font-stack-mozilla-text | 'Mozilla Text', 'Helvetica Neue', Arial, X-LocaleSpecific, sans-serif | Choose the Mozilla or Firefox brand stack explicitly; do not use a headline face for long body text. |
| $font-stack-mono | Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace | Choose the Mozilla or Firefox brand stack explicitly; do not use a headline face for long body text. |

### Component spacing

[Official reference](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $spacing-xs | 4px | Space within a component or between closely related elements. |
| $spacing-sm | 8px | Space within a component or between closely related elements. |
| $spacing-md | 16px | Space within a component or between closely related elements. |
| $spacing-lg | 24px | Space within a component or between closely related elements. |
| $spacing-xl | 32px | Space within a component or between closely related elements. |
| $spacing-2xl | 48px | Space within a component or between closely related elements. |

### Large-scale layout rhythm

[Official reference](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $layout-2xs | 16px | Use larger separations between editorial sections; these are distinct from component spacing. |
| $layout-xs | 24px | Use larger separations between editorial sections; these are distinct from component spacing. |
| $layout-sm | 32px | Use larger separations between editorial sections; these are distinct from component spacing. |
| $layout-md | 48px | Use larger separations between editorial sections; these are distinct from component spacing. |
| $layout-lg | 64px | Use larger separations between editorial sections; these are distinct from component spacing. |
| $layout-xl | 96px | Use larger separations between editorial sections; these are distinct from component spacing. |
| $layout-2xl | 192px | Use larger separations between editorial sections; these are distinct from component spacing. |

### Content widths

[Official reference](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $content-xs | 304px | Choose a readable maximum for the actual content rather than stretching every text block to the largest container. |
| $content-sm | 432px | Choose a readable maximum for the actual content rather than stretching every text block to the largest container. |
| $content-md | 688px | Choose a readable maximum for the actual content rather than stretching every text block to the largest container. |
| $content-lg | 928px | Choose a readable maximum for the actual content rather than stretching every text block to the largest container. |
| $content-xl | 1152px | Choose a readable maximum for the actual content rather than stretching every text block to the largest container. |
| $content-max | 1440px | Choose a readable maximum for the actual content rather than stretching every text block to the largest container. |

### Screen breakpoints

[Official reference](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $screen-xs | 320px | Published viewport steps. Individual component mixins may adapt at selected steps. |
| $screen-sm | 480px | Published viewport steps. Individual component mixins may adapt at selected steps. |
| $screen-md | 768px | Published viewport steps. Individual component mixins may adapt at selected steps. |
| $screen-lg | 1024px | Published viewport steps. Individual component mixins may adapt at selected steps. |
| $screen-xl | 1312px | Published viewport steps. Individual component mixins may adapt at selected steps. |

### Corner radius

[Official reference](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $border-radius-xs | 2px | Use the radius appropriate to the component; keep the authored illustration separate from UI shape. |
| $border-radius-sm | 4px | Use the radius appropriate to the component; keep the authored illustration separate from UI shape. |
| $border-radius-md | 8px | Use the radius appropriate to the component; keep the authored illustration separate from UI shape. |
| $border-radius-lg | 16px | Use the radius appropriate to the component; keep the authored illustration separate from UI shape. |

### Typographic utility and theme selection

[Official reference](https://protocol.mozilla.org/docs/fundamentals/typography)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| $brand-theme: mozilla | Mozilla Headline + Mozilla Text | Mozilla-themed editorial content; the preview loads fonts from the official package. |
| $brand-theme: firefox | Metropolis + Inter | Firefox-themed typography is a separate brand choice. |
| mzp-u-title-lg | Responsive title utility | Use on the main editorial headline; do not infer heading semantics from its visual size. |
| mzp-u-title-xs | Small title utility | The two supporting sections use this class on semantic h2 elements. |
| mzp-u-title-2xs | Compact title utility | The short article uses this on its h3. |
| Comfortable / Compact sample | 16px / 1.6 and 14px / 1.4 | Original reading preference, not two official Protocol themes. |

## Mozilla Protocol Design System Editorial Composition

### Start with a readable editorial hierarchy

Protocol serves editorial and marketing surfaces as well as supporting UI. The specimen opens with one large headline and an original circular illustration, then narrows into an article preview and a digest form. This composition gives the message room before asking the reader to operate controls. It is different from a dense administrative dashboard.

### Separate the brand theme from the application idea

The example uses mzp-t-mozilla and native Protocol typography. Its article, illustration and density preference are original application content. Neither the native class names nor the font files make it an official Mozilla service. The footer states the scope, and the digest action only previews a confirmation.

## Mozilla Protocol Design System Fonts and Title Utilities

### Choose the brand-specific type pair

Protocol 22 exports Mozilla Headline and Mozilla Text stacks for Mozilla, and Metropolis with Inter for Firefox. The specimen loads the fonts supplied by the package. Keep headline and body roles separate: a display face on every paragraph removes the contrast that makes the editorial hierarchy useful.

### Keep heading semantics independent of visual size

The hero is an h1 with mzp-u-title-lg. Supporting sections are h2 with mzp-u-title-xs, and the article title is h3 with mzp-u-title-2xs. Responsive utilities can change visual scale without changing that outline. The reading density control changes only the sample paragraphs; it does not resize the entire page or its controls.

- h1 introduces the page.
- h2 divides the reading preview and form.
- h3 names the article excerpt.

## Mozilla Protocol Design System Color and Illustration

### Use illustration as editorial content

The circular gradient is original CSS artwork with a short accessible description. Its warm-to-purple treatment is not presented as a new official Mozilla logo or a token exported by Protocol. The rest of the page uses restrained neutral surfaces so the illustration and primary action retain a clear role.

### Give form state its own meaning

The local email error has a written explanation and a visible invalid border. Success appears in a separate confirmation block that includes the entered example address and states that no email was sent. A colorful hero should not compete with the error state or make it ambiguous whether the form succeeded.

## Mozilla Protocol Design System Component and Layout Scales

### Use the two spacing scales deliberately

The published component spacing steps are 4, 8, 16, 24, 32 and 48px. A separate layout scale extends through 64, 96 and 192px. Use the smaller scale inside forms and cards, and the larger rhythm between editorial sections. Increasing every small gap to a layout value would dilute the relationship between a label and its field.

### Constrain the line length before adding more columns

Protocol provides content widths from 304px to a 1440px maximum. The specimen uses an 1152px editorial container with two columns where room permits. Below its application breakpoint, the reading article and form stack. The headline, article and form each retain a sensible measure rather than expanding to an unbounded line.

## Mozilla Protocol Design System Buttons, Details and Form

### Preserve the real form anatomy

The digest example is a native form with a visible label, email input, explanatory note, error text and submit button. Protocol styles the components; the application validates and reports the local result. A link is used for the hero action because it moves to an on-page section, while submission is a button.

### Use a simple disclosure for supporting explanation

The What changes disclosure is a native details/summary pair. It explains the custom comfortable and compact paragraph values without interrupting the main article. This is not a fake navigation tab or a hidden prerequisite; the form and density controls remain usable whether the disclosure is open or closed.

## Mozilla Protocol Design System Reading and Validation States

### Change one reading preference at a time

The two density buttons form a labeled group and expose aria-pressed. Switching to Compact changes paragraph font size, line-height and bottom spacing in the article only. The text, title and form input stay in place. The example intentionally distinguishes this preference from switching Mozilla and Firefox brand themes.

### Make local form recovery predictable

An invalid address reveals the error and focuses the input. Editing clears the stale error and hides any previous confirmation. A valid address displays a locally generated result and focuses that result. Try another address clears the form, removes invalid state and returns focus to the input; no asynchronous subscription is implied.

1. Submit an empty or malformed address and read the field error.
2. Enter an example address and preview the local confirmation.
3. Use Try another address to reset and restore input focus.

## Mozilla Protocol Design System Accessible Editorial Controls

### Give artwork and controls different roles

The illustration is an image-role element with concise alternative text. Density buttons, the disclosure and the submit action are actual controls. The email field references both its note and error through aria-describedby. A visible focus outline complements the native styling for keyboard use.

### Keep the order meaningful when the layout stacks

The document order is headline, reading preview, explanation and form. On mobile, the same order remains; CSS does not move the form ahead of the context. The 180px mobile illustration is decorative editorial support rather than a fixed-width obstruction that makes the page scroll sideways.

## Mozilla Protocol Design System CSS Integration

### Bundle the published assets with the example

The supplied entry imports a compiled theme, protocol.css and protocol-components.css, then the application stylesheet. Protocol 22 requires the theme custom properties on :root; merely attaching a legacy brand class leaves typography unresolved. Compile protocol-theme.scss before starting Vite. A module-aware bundler follows their font and image URLs. The HTML, JavaScript and CSS blocks below provide the complete source of the specimen; there is no hidden newsletter backend or package-specific state provider.

### Extend the form only when a real subscription service exists

For production, replace the local result with a verified request and define consent, pending, duplicate-subscription and server-error behavior appropriate to your service. Keep Protocol's presentation separate from those application requirements. Do not relabel the local confirmation as a successful subscription merely because the email passes syntax validation.

## Component Examples

### index.html — complete editorial page

Semantic article, density controls, disclosure and local digest form with an original CSS illustration.

```html
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reading specimen</title></head>
<body>
<main class="reading-example mzp-t-mozilla">
  <header class="reading-top">
    <strong>MOZILLA PROTOCOL · EDITORIAL SPECIMEN</strong
    ><span>Original example by OpenDesign</span>
  </header>
  <section class="reading-hero">
    <div>
      <h1 class="mzp-u-title-lg">A little more room to read.</h1>
      <p>
        Make space for useful ideas, quieter pages, and a reading rhythm that
        feels like yours.
      </p>
      <a class="mzp-c-button" href="#reading-controls"
        >Explore the reading preview</a
      >
    </div>
    <div
      class="orb"
      role="img"
      aria-label="Original warm-to-purple circular illustration"
    ></div>
  </section>
  <div class="reading-main">
    <section id="reading-controls">
      <h2 class="mzp-u-title-xs">Choose your reading rhythm</h2>
      <p>
        Compare two application-defined densities using the same short article.
      </p>
      <div class="density-options" role="group" aria-label="Reading density">
        <button
          class="mzp-c-button mzp-t-secondary"
          data-density="comfortable"
          aria-pressed="true"
        >
          Comfortable</button
        ><button
          class="mzp-c-button mzp-t-secondary"
          data-density="compact"
          aria-pressed="false"
        >
          Compact
        </button>
      </div>
      <article id="article-sample">
        <h3 class="mzp-u-title-2xs">The open page</h3>
        <p>
          A useful page gives an idea enough room to breathe. Its headings show
          the path, its paragraphs keep a readable measure, and its controls
          remain easy to find.
        </p>
        <p>
          Changing density should preserve the story. This preview adjusts
          paragraph size and spacing without replacing the article or changing
          your place in the task.
        </p>
      </article>
      <details>
        <summary>What changes in this example?</summary>
        <p>
          Comfortable uses 16px text with 1.6 line height. Compact uses 14px
          with 1.4. These are example reading preferences, not separate official
          Protocol themes.
        </p>
      </details>
    </section>
    <aside class="signup">
      <h2 class="mzp-u-title-xs">Preview a reading digest</h2>
      <p>
        Try the form styling and local validation. No subscription is created.
      </p>
      <form id="reading-form" novalidate>
        <label for="email">Email address</label
        ><input
          id="email"
          type="email"
          autocomplete="email"
          aria-describedby="email-note email-error"
        />
        <p class="note" id="email-note">
          Use an example address. Nothing will be sent.
        </p>
        <p id="email-error" class="error" role="alert" hidden>
          Enter an email address, such as reader@example.com.
        </p>
        <button class="mzp-c-button" type="submit">Preview confirmation</button>
      </form>
      <div id="confirmation" tabindex="-1" role="status" hidden>
        Local preview confirmed for <strong></strong>. No email was sent.<button
          id="reset"
          class="mzp-c-button mzp-t-secondary"
          type="button"
        >
          Try another address
        </button>
      </div>
    </aside>
  </div>
  <footer class="reading-footer">
    Native Mozilla Protocol 22.0.0 CSS and fonts. Original illustration, copy
    and JavaScript; not an official Mozilla service.
  </footer>
</main>
<script type="module" src="/src/main.js"></script>
</body></html>
```

[Code reference](https://protocol.mozilla.org/components/detail/example-form)

- Save as index.html in the project root. The next two blocks are src/main.js and src/protocol.css.

### main.js — native assets and local behavior

Imports official styles and implements density selection, validation, focus and reset without sending data.

```js
import "./protocol-theme.css";
import "@mozilla-protocol/core/protocol/css/protocol.css";
import "@mozilla-protocol/core/protocol/css/protocol-components.css";
import "./protocol.css";
const form = document.querySelector("#reading-form"),
  error = document.querySelector("#email-error"),
  input = document.querySelector("#email"),
  result = document.querySelector("#confirmation");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error.hidden = false;
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  error.hidden = true;
  input.removeAttribute("aria-invalid");
  result.hidden = false;
  result.querySelector("strong").textContent = value;
  result.focus();
});
input.addEventListener("input", () => {
  error.hidden = true;
  input.removeAttribute("aria-invalid");
  result.hidden = true;
});
document.querySelector("#reset").addEventListener("click", () => {
  form.reset();
  result.hidden = true;
  error.hidden = true;
  input.removeAttribute("aria-invalid");
  input.focus();
});
document.querySelectorAll("[data-density]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-density]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    document
      .querySelector("#article-sample")
      .classList.toggle("compact", button.dataset.density === "compact");
  }),
);

```

[Code reference](https://protocol.mozilla.org/docs/usage/framework)

- This behavior is application JavaScript, not a Protocol newsletter service.

### protocol.css — original composition

Responsive page layout, reading preferences and the original circular illustration.

```css
[hidden] { display: none !important; }
body {
  margin: 0;
}
.reading-example {
  background: #fff;
  color: #000;
}
.reading-top {
  padding: 24px;
  border-bottom: 1px solid #cdcdd4;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 12px;
}
.reading-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(200px, 0.7fr);
  gap: 48px;
  align-items: center;
  padding: 48px;
  max-width: 1152px;
  margin: auto;
}
.reading-hero h1 {
  max-width: 680px;
}
.reading-hero p {
  max-width: 580px;
}
.orb {
  aspect-ratio: 1;
  background: radial-gradient(
    circle at 33% 32%,
    #ffea80 0 10%,
    #ff8a50 30%,
    #ff298a 55%,
    #7542e5 82%
  );
  border-radius: 50%;
  position: relative;
  box-shadow: 16px 24px 0 #f0f0f4;
}
.orb:after {
  content: "";
  position: absolute;
  inset: 23%;
  border-radius: 50%;
  background: white;
}
.reading-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
  gap: 48px;
  max-width: 1152px;
  margin: auto;
  padding: 0 48px 48px;
}
.density-options {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}
.density-options button {
  font-size: 12px;
  padding: 8px 12px;
}
.density-options button[aria-pressed="true"] {
  box-shadow: 0 0 0 2px #0060df;
}
#article-sample {
  padding: 24px;
  border: 1px solid #cdcdd4;
  border-radius: 8px;
  background: #f9f9fb;
}
#article-sample p {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 16px;
}
#article-sample.compact p {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}
.signup {
  padding: 24px;
  background: #e7dfff;
  border-radius: 8px;
}
.signup input {
  width: 100%;
  margin-bottom: 8px;
}
.signup label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
}
.signup .note {
  font-size: 12px;
  line-height: 1.5;
}
.signup .error {
  color: #a4000f;
  font-size: 14px;
  font-weight: 700;
}
.signup input[aria-invalid="true"] {
  border-color: #a4000f;
  box-shadow: 0 0 0 2px #a4000f;
}
.signup .mzp-c-button {
  width: 100%;
  margin: 8px 0;
}
#confirmation {
  padding: 16px;
  background: #e3fff3;
  margin-top: 16px;
  border-left: 4px solid #008a46;
  overflow-wrap: anywhere;
}
.reading-footer {
  padding: 24px;
  border-top: 1px solid #cdcdd4;
  font-size: 12px;
}
.reading-example details {
  margin-top: 24px;
}
.reading-example summary {
  cursor: pointer;
  font-weight: 700;
}
.reading-example details p {
  font-size: 14px;
  margin-top: 12px;
}
button:focus-visible,
input:focus-visible,
summary:focus-visible {
  outline: 3px solid #0060df;
  outline-offset: 4px;
}
@media (max-width: 760px) {
  .reading-hero {
    grid-template-columns: 1fr;
    padding: 32px 24px;
    gap: 24px;
  }
  .orb {
    width: 180px;
    justify-self: center;
    box-shadow: 8px 12px 0 #f0f0f4;
  }
  .reading-main {
    grid-template-columns: 1fr;
    padding: 0 24px 32px;
    gap: 32px;
  }
  .reading-top {
    flex-wrap: wrap;
  }
  .reading-hero h1 {
    font-size: 36px;
  }
  .density-options {
    flex-wrap: wrap;
  }
}

```

[Code reference](https://protocol.mozilla.org/docs/fundamentals/design-tokens)

- Application density and layout choices are identified separately from the published Sass tokens.

### protocol-theme.scss — required Mozilla root theme

Compile this into src/protocol-theme.css before starting the app.

```scss
@use '@mozilla-protocol/core/protocol/css/includes/config' with ($brand-theme: 'mozilla');
@use '@mozilla-protocol/core/protocol/css/includes/themes';

```

[Code reference](https://protocol.mozilla.org/docs/usage/framework)

- The Sass configuration selects the brand; this is not a runtime class switch.

## Implementation Starting Point

The native CSS/fonts and original script were bundled for the local preview. Use a Node.js version supported by your Vite release. Keep the package license and asset attribution with a redistributed build.

```sh
npm create vite@latest protocol-reading -- --template vanilla
cd protocol-reading
npm install
npm install @mozilla-protocol/core@22.0.0
npm install --save-dev sass
npx sass --load-path=node_modules src/protocol-theme.scss src/protocol-theme.css
# Replace index.html; add src/main.js and src/protocol.css from the full examples.
npm run dev
```

## Agent Prompt

Create an editorial page with Mozilla Protocol 22.0.0. Read the actual font, spacing and container references. Use the supplied complete HTML/CSS/JS composition as a starting point, retain semantic headings and visible form labels, and distinguish original illustration/density choices from official tokens. Keep local validation honest; integrate a real subscription only after its service and consent requirements are defined.

## Sources

- [Protocol Typography](https://protocol.mozilla.org/docs/fundamentals/typography) — Brand type pairs and title utilities.
- [Published Token Export](https://cdn.jsdelivr.net/npm/@mozilla-protocol/core@22.0.0/protocol/css/includes/tokens/dist/index.json) — Spacing, layout, content widths and font stacks.
- [Protocol CSS Usage](https://protocol.mozilla.org/docs/usage/framework) — Stylesheet integration.
- [Protocol Source](https://github.com/mozilla/protocol) — Implementation, assets and MPL licensing.
