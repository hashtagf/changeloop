# Pega Bolt Design System — OpenDesign Application Guide

Explore Bolt’s Pega-branded content system: fluid typography, separate horizontal and vertical spacing, and a Twig accordion composition for an editorial resource page.

This guide focuses on the public Bolt Twig / Pattern Lab implementation. The current Bolt homepage also offers BoltDS React for applications and portals; the two implementations have separate documentation and versioning. The preview is an independent HTML interpretation, not a Bolt runtime.

## Source Reference

- **Implementations:** BoltDS React and Bolt Twig ([source](https://boltdesignsystem.com/))
- **Twig component:** @bolt/components-accordion ([source](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html))
- **Default expansion:** Multiple items allowed; single defaults to false ([source](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html))
- **Density scope:** html element only ([source](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-20-information-density/index.html))
- **Medium x spacing:** 1.55rem ([source](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-05-spacing/index.html))
- **Medium y spacing:** 1.35rem ([source](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-05-spacing/index.html))


## Design Reference

Public Bolt Twig Pattern Lab reference. Rem sizes are fluid with the page root; do not treat all rem values as fixed 16 px multiples. Preview layout and illustration are original.

### Brand color roles

[Official reference](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-00-color/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bolt-color-navy | #001f5f | Primary brand field. |
| --bolt-color-navy-dark | #081c45 | Deeper background. |
| --bolt-color-navy-xlight | #d7e2f2 | Pale brand surface. |
| --bolt-color-teal | #10a5ac | Illustration accent; not automatically accessible body text. |
| --bolt-color-teal-xdark | #005154 | Darker teal option. |
| --bolt-color-orange | #f76923 | Warm accent. |
| --bolt-color-yellow | #ffc836 | Highlight accent. |

### Two-axis spacing

[Official reference](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-05-spacing/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bolt-spacing-x-xsmall | 0.3875rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |
| --bolt-spacing-x-small | 0.775rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |
| --bolt-spacing-x-medium | 1.55rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |
| --bolt-spacing-x-large | 3.1rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |
| --bolt-spacing-y-xsmall | 0.3375rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |
| --bolt-spacing-y-small | 0.675rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |
| --bolt-spacing-y-medium | 1.35rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |
| --bolt-spacing-y-large | 2.7rem | Use the horizontal scale for x spacing and the vertical scale for y spacing. |

### Type foundation

[Official reference](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-10-typography/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --bolt-type-font-size-display | 3.75rem | Relative to the fluid root; choose semantic heading tags independently. |
| --bolt-type-font-size-xxlarge | 2.35rem | Relative to the fluid root; choose semantic heading tags independently. |
| --bolt-type-font-size-large | 1.4rem | Relative to the fluid root; choose semantic heading tags independently. |
| --bolt-type-font-size-regular | 1rem | Relative to the fluid root; choose semantic heading tags independently. |
| --bolt-type-font-size-small | 0.9rem | Relative to the fluid root; choose semantic heading tags independently. |
| Font family | Open Sans | Body and headline families in the published foundation. |
| Weights | 300 / 400 / 600 / 700 / 800 | Light through extra bold; load matching font files. |

### Page density

[Official reference](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-20-information-density/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Attribute | data-bolt-info-density | Set on the html element only. |
| comfortable | Larger font and spacing | Reading-focused density. |
| regular | Default | Attribute can be omitted. |
| compact | Smaller font and spacing | Do not apply as a local card modifier. |

### Accordion composition

[Official reference](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| single | false by default | true restricts the accordion to one open item. |
| spacing | medium | Schema lists none, xsmall, small, medium, large. |
| icon_valign | center | top aligns the icon with multiline triggers. |
| no_separator | false | Keep separators for distinct question boundaries. |
| box_shadow | false | Optional enclosing shadow. |
| item.open | false | Expand an initial item. |
| item.inactive | false | Collapsed item with no toggle icon. |
| item.trigger | Content | Write a meaningful question, replacing the default label. |

## Pega Bolt Design System Choose the Bolt implementation

### Twig and React have different contracts

This guide focuses on the public Bolt Twig / Pattern Lab implementation. The current Bolt homepage also offers BoltDS React for applications and portals; the two implementations have separate documentation and versioning. The preview is an independent HTML interpretation, not a Bolt runtime.

The specimen is a workshop resource with a visible summary and optional questions. This is a natural fit for the content-oriented Twig implementation: editorial hierarchy comes first, while the accordion makes supporting material available on demand. An application built on BoltDS React should use that documentation rather than copy Twig namespace paths.

[Supporting specification](https://boltdesignsystem.com/)

## Pega Bolt Design System Navy structure, limited bright accents

### A branded reading surface

The published palette includes navy #001f5f, teal #10a5ac and orange #f76923. The specimen uses navy as a strong editorial header and teal/orange as illustration accents. These hues are foundation values, not proof that every combination is appropriate for small text.

The resource facts sit on white and pale navy surfaces. The decorative branching diagram describes a workshop about simplifying a service journey; it is original artwork, not a Pega logo or an official diagram.

[Supporting specification](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-00-color/index.html)

## Pega Bolt Design System Fluid typography and readable measures

### Rem values are not fixed pixel promises

Bolt publishes a regular size of 1rem, large at 1.4rem, xxlarge at 2.35rem and display at 3.75rem. The root scales with viewport and density, so converting the whole table with a fixed 16 px base loses the intended behavior.

The foundation names Open Sans for body and headline text. The self-contained preview uses a local system fallback because font files are not bundled. It retains a clear title, compact eyebrow and comfortable paragraphs without claiming typographic pixel parity.

[Supporting specification](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-10-typography/index.html)

## Pega Bolt Design System Horizontal and vertical rhythm differ

### Avoid substituting a generic eight-point scale

Medium horizontal spacing is 1.55rem, while medium vertical spacing is 1.35rem. Large follows the same distinction at 3.1rem and 2.7rem. Use the x scale between adjacent objects and the y scale between stacked sections.

The preview keeps the introduction and question stack in separate columns on a wide screen, then stacks them at a local 700 px breakpoint. That breakpoint is an application choice, not a Bolt token. Long question labels wrap beside an icon without shrinking the text.

[Supporting specification](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-05-spacing/index.html)

## Pega Bolt Design System Build the question stack with Twig

### Items are captured content, not a data prop

Each accordion-item.twig invocation supplies trigger and content. A Twig set block captures the rendered items; the parent receives that markup through content. The complete example above opens the first question and uses single: true.

spacing controls item insets and icon_valign controls the icon’s alignment. Keep separators when questions need clear boundaries. The inactive flag is not a disabled form control: it collapses content and hides the icon.

- Keep dates, prerequisites and availability outside collapsed answers.
- Use the trigger to identify one concrete question.
- Avoid putting another accordion inside an answer.

[Supporting specification](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html)

## Pega Bolt Design System Expansion without losing the reading position

### One answer at a time

The HTML interpretation uses real buttons, aria-expanded, aria-controls and hidden answer panels. Clicking a closed question opens it and closes the previous answer; clicking the open question collapses it. Focus stays on the triggering button.

This mirrors the selected single-open behavior while remaining independent from Bolt JavaScript. The preview does not implement Bolt deep linking and does not claim to exercise the native component runtime. In native Bolt, a deep-linked item wins over an initially open item when single mode is enabled.

[Supporting specification](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html)

## Pega Bolt Design System Density belongs to the whole page

### A root setting, not a component prop

Bolt recognizes comfortable, regular and compact through data-bolt-info-density on the html element. Regular is the default. Comfortable increases type and spacing; compact decreases both.

Do not apply the root attribute to an accordion and expect a supported per-component density change. For this reading page, the preview keeps a fixed comfortable editorial composition instead of pretending to reproduce the native density engine.

[Supporting specification](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-20-information-density/index.html)

## Pega Bolt Design System Integrate the real component in context

### Use the documented environment

The install command is meaningful inside a Bolt Twig application that resolves component namespaces and compiles the required assets. The public repository offers a complete development environment through yarn setup and yarn start. It is a reference environment, not a two-line production deployment.

1. Choose Twig for the server-rendered content implementation and confirm its release in your application.
2. Install the accordion package, register its existing Twig namespace through the Bolt application configuration, and include compiled project assets.
3. Render the complete question example, then verify single expansion, wrapped triggers and keyboard operation in the actual project.

[Supporting specification](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html)

## Component Examples

### Complete standalone interactive specimen

Save the complete document as index.html and open it in a browser. Independent HTML/CSS interpretation of Bolt Twig foundations and single accordion behavior. System font fallback; no Bolt runtime.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Service journey workshop</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f7fb;color:#001f5f;font:16px/1.6 system-ui,sans-serif}header{background:#001f5f;color:white;padding:38px 5%;display:grid;grid-template-columns:1.6fr 1fr;gap:30px}small{letter-spacing:.13em;font-size:11px;text-transform:uppercase}h1{font-size:clamp(32px,4vw,48px);line-height:1.12;max-width:650px;margin:16px 0}header p{max-width:550px;color:#d7e2f2}svg{width:100%;max-width:310px;align-self:center;justify-self:center}main{display:grid;grid-template-columns:1fr 1.6fr;gap:40px;padding:32px 5%}h2{font-size:23px;line-height:1.25}aside p{font-size:14px}dl{font-size:14px}dt{font-weight:700;margin-top:18px}dd{margin:2px 0}section{background:white;border-top:3px solid #10a5ac}article{border-bottom:1px solid #d7e2f2}button{font:600 16px/1.5 system-ui;width:100%;display:flex;justify-content:space-between;gap:20px;text-align:left;padding:22px 24px;border:0;background:white;color:#001f5f;cursor:pointer}button:hover{background:#f0f5fc}button:focus-visible{outline:3px solid #005154;outline-offset:-4px}.answer{padding:0 24px 24px;color:#303744;font-size:15px}.answer p{margin:0}footer{padding:0 5% 22px;color:#555;font-size:11px}@media(max-width:700px){header{grid-template-columns:1fr;padding:28px 6%}svg{display:none}main{grid-template-columns:1fr;padding:24px 6%;gap:16px}button{padding:20px}dl{display:flex;flex-wrap:wrap;gap:24px}dt{margin:0}}</style><header><div><small>Field notes · Live workshop</small><h1>Make your service journey simpler.</h1><p>A practical session for turning a complex request into a clear next step.</p></div><svg viewBox="0 0 300 200" aria-hidden="true"><path d="M30 100H115M115 100V40H230M115 100V160H230" fill="none" stroke="#86cac6" stroke-width="4"/><circle cx="30" cy="100" r="22" fill="#f76923"/><rect x="95" y="80" width="40" height="40" rx="5" fill="#10a5ac"/><rect x="210" y="20" width="70" height="40" rx="6" fill="#d7e2f2"/><rect x="210" y="140" width="70" height="40" rx="6" fill="#ffc836"/></svg></header><main><aside><small>Before you join</small><h2>One journey.<br>A clearer direction.</h2><p>Map a request, find a point of friction, and rewrite the next step together.</p><dl><div><dt>Format</dt><dd>Live, small-group exercise</dd></div><div><dt>Length</dt><dd>45 minutes</dd></div><div><dt>Example only</dt><dd>No registration is collected</dd></div></dl></aside><div><h2>Useful to know</h2><section aria-label="Workshop questions"><article><h3 style="margin:0"><button aria-expanded="true" aria-controls="a1" id="q1">What should I bring?<span aria-hidden="true">−</span></button></h3><div class="answer" id="a1"><p>Bring a laptop and one workflow you want to simplify. A short description of the request and its current outcome is enough.</p></div></article><article><h3 style="margin:0"><button aria-expanded="false" aria-controls="a2" id="q2">Will there be a recording?<span aria-hidden="true">+</span></button></h3><div class="answer" id="a2" hidden><p>This workshop is live only. The written exercise is included so you can revisit the method with your team.</p></div></article><article><h3 style="margin:0"><button aria-expanded="false" aria-controls="a3" id="q3">Who is this session for?<span aria-hidden="true">+</span></button></h3><div class="answer" id="a3" hidden><p>Content teams and developers working on service journeys. No prior experience with the workshop format is required.</p></div></article></section></div></main><footer>Independent Bolt Twig interpretation · verified palette and spacing references · system font fallback</footer><script>const qs=[...document.querySelectorAll('button')];qs.forEach(b=>b.onclick=()=>{const open=b.getAttribute('aria-expanded')!=='true';qs.forEach(x=>{let yes=x===b&&open;x.setAttribute('aria-expanded',yes);x.lastElementChild.textContent=yes?'−':'+';document.getElementById(x.getAttribute('aria-controls')).hidden=!yes})});</script></html>

```

[Code reference](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html)

- The single-open question stack does not implement Bolt deep linking. The Twig example is the native integration path; essential workshop facts remain outside collapsed answers.

### Workshop questions with one open answer

Render each question with the item template, capture their markup, and pass it to the parent accordion.

```twig
{% set questions %}
  {% include '@bolt-components-accordion/accordion-item.twig' with {
    trigger: 'What should I bring?',
    content: '<p>Bring a laptop and one workflow you want to simplify.</p>',
    open: true
  } only %}
  {% include '@bolt-components-accordion/accordion-item.twig' with {
    trigger: 'Will there be a recording?',
    content: '<p>This workshop is live only. The written exercise is included.</p>'
  } only %}
  {% include '@bolt-components-accordion/accordion-item.twig' with {
    trigger: 'Who is this session for?',
    content: '<p>Content teams and developers working on service journeys.</p>'
  } only %}
{% endset %}
{% include '@bolt-components-accordion/accordion.twig' with {
  content: questions,
  single: true,
  spacing: 'medium',
  icon_valign: 'top'
} only %}
```

[Code reference](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html)

- Use this inside a configured Bolt Twig application. The official component does not provide a plain HTML usage entry.
- single limits concurrent expansion. Deep linking takes precedence over an initially open item.
- The schema lists large as the largest spacing option even though a documentation example uses xlarge; this example stays within the schema.

## Implementation Starting Point

The package command adds the component, not a standalone website. Use the project’s registered @bolt-components-accordion Twig namespace and its compiled Bolt assets. The repository development setup and application integration are different paths; neither is the current BoltDS React API.

```bash
# In an existing Bolt Twig application with its asset pipeline configured:
npm install @bolt/components-accordion

# To inspect the complete official development environment instead:
git clone https://github.com/boltdesignsystem/bolt.git
cd bolt
yarn setup
yarn start
```

## Agent Prompt

Create a Bolt Twig workshop resource page using the verified navy/teal palette, fluid type hierarchy and distinct x/y spacing scales. Keep essential facts visible. Compose accordion-item.twig inside accordion.twig with single true and medium spacing. Do not use Twig paths as React APIs.

## Sources

- [Bolt implementations](https://boltdesignsystem.com/) — React and Twig entry points.
- [Brand color tokens](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-00-color/index.html) — Pega palette and CSS variables.
- [Spacing](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-05-spacing/index.html) — Independent x and y scales.
- [Typography](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-10-typography/index.html) — Fluid rem sizes and font families.
- [Information density](https://boltdesignsystem.com/pattern-lab/patterns/10-visual-styles-20-information-density/index.html) — Page-level density setting.
- [Accordion schema](https://boltdesignsystem.com/pattern-lab/patterns/40-components-accordion/index.html) — Twig properties, item template and interaction constraints.
