# Poncho Design System — OpenDesign Application Guide

Inspect Poncho’s Bootstrap 3 grid, semantic action colors and fully clickable service panels through a working activity directory.

Independent OpenDesign example using native CSS without government identity. The current documentation and older README disagree on font families; the pinned CSS and explicit fallback define this preview.

## Source Reference

- **Organization context:** Argentina’s national public administration ([source](https://github.com/argob/poncho))
- **Implementation foundation:** HTML and CSS based on Bootstrap ([source](https://github.com/argob/poncho))
- **Documented base:** The main documentation describes Bootstrap 3 ([source](https://argob.github.io/poncho/))
- **Package:** ar-poncho ([source](https://github.com/argob/poncho))
- **Icons:** Poncho has its own icon library ([source](https://argob.github.io/poncho/identidad/iconos/))
- **Action guidance:** Button examples distinguish primary, secondary and destructive roles ([source](https://argob.github.io/poncho/componentes/botones/))


## Design Reference

ar-poncho 2.0.320 CSS plus Bootstrap 3.4.1; computed values verified at 1440, 768 and 390px. Font fallbacks are explicit.

### Published CSS typography

[Official reference](https://github.com/argob/poncho/blob/master/dist/css/poncho.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Package inspected | ar-poncho 2.0.320 | Do not use the stale v0.3.3 banner as the package version. |
| Font documentation | Lora headings / Montserrat body | Current typography page and CSS font import; older repository README still names Encode Sans. |
| Body | 16px / 1.42857143; weight 500 | Measured with Bootstrap 3.4.1 and Poncho; local preview uses Arial. |
| H1 | 2.5rem = 40px / 44px | Preview heading remains 40px on mobile. |
| H2 / H3 | 2rem / 1.75rem | Base headings; panel-specific heading rules override these. |
| Panel H3 | 20px / 26px | Component context, measured native CSS. |
| Lead | 18px / 1.2; weight 500 | A short introduction rather than a heading. |

### Color roles

[Official reference](https://github.com/argob/poncho/blob/master/dist/css/poncho.css)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --primary |  #242C4F | Main link/action navy. |
| --secondary | #45658D | Secondary blue. |
| --success | #2e7d33 | Principal/success action role; not arbitrary decoration. |
| --danger | #c62828 | Destructive action or error role. |
| --warning | #E7BA61 | Attention role; text contrast still needs checking. |
| --gray-base | #333333 | Default text. |
| --gray-lighter | #f2f2f2 | Light neutral surface. |

### Grid and component dimensions

[Official reference](https://getbootstrap.com/docs/3.4/css/#grid)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Grid | 12 columns; 30px gutter | Bootstrap 3.4.1: 15px padding on each column side. |
| Breakpoints | 768 / 992 / 1200px | sm, md, lg; col-sm-4 creates three columns from 768px. |
| Containers | 750 / 970 / 1170px | At corresponding breakpoints; fluid width below 768px. |
| Panel body | 15px 20px | Poncho component override. |
| Panel radius / spacing | 10px / 30px bottom margin | Native CSS as used in this example. |
| Button | 16px; 8px 20px padding; 3px border; 30px radius | Poncho rounded action treatment; not Bootstrap default geometry. |
| Section spacing | 30px default; 20px small; 40px large | section, section-sm and section-lg rules. |

## Poncho Design System Version and dependencies

### A Bootstrap 3 system

Poncho layers Argentine public-service styles over Bootstrap 3.4.1. Its installation page still mentions an experimental Bootstrap 4 direction; that does not make Bootstrap 5 classes compatible with the published examples. This resource pins ar-poncho 2.0.320 and Bootstrap 3.4.1 so panel anatomy and responsive behavior can be inspected together.

The CSS banner says v0.3.3 even though the installed package is 2.0.320. Track the package manifest and lockfile, not the banner alone. The independent preview uses native CSS for panels, buttons and grid; its activity filtering is original JavaScript, not a Poncho search component.

[Supporting specification](https://github.com/argob/poncho)

## Poncho Design System Typography and evidence

### Resolve conflicting font references

The current typography documentation names Lora for headings and Montserrat for body text. The downloaded stylesheet imports those families, but also contains older Encode Sans declarations. The repository setup README still recommends Encode Sans. This is a real version/source inconsistency; a production migration must inspect the final cascade of its chosen release rather than assuming every historical reference describes one uniform theme.

The preview makes its Arial and Georgia fallbacks explicit and removes the external font import for offline reliability. Native geometry remains visible: a 16px body, 40px H1 and 18px lead. Panel headings use their own 20px size, so copying the base H3 scale into a card would change the component.

[Supporting specification](https://argob.github.io/poncho/identidad/tipografia/)

## Poncho Design System Color and action hierarchy

### Choose an action by its meaning

The button documentation distinguishes default link actions, secondary links, one principal or successful action, and destructive actions. btn-primary is the ordinary strong link-style action; btn-link supports secondary actions. btn-success marks the principal advance action and the guidance limits it to one per page. btn-danger is reserved for destructive or irreversible intent.

The activity browser uses a secondary reset and a primary return action in the expanded detail. It has no green registration button because it cannot register anybody. Never show a success claim merely because a visitor has opened a local panel.

- btn-primary: ordinary strong action; avoid competing peers in one action group.
- btn-link: secondary or informational action, such as resetting the filter.
- btn-success / btn-danger: use only when the actual action has the documented meaning.

[Supporting specification](https://argob.github.io/poncho/componentes/botones/)

## Poncho Design System Grid and spacing

### Use the inherited grid deliberately

Bootstrap 3 uses a 12-column grid with 30px gutters. A row balances the 15px padding on its columns. col-sm-4 gives the three activity panels equal thirds from 768px; below that width they become full-width blocks. Containers step to 750px, 970px and 1170px at the documented breakpoints.

Poncho adds component spacing on top: panel bodies use 15px vertically and 20px horizontally, with a 30px panel bottom margin. Buttons use a 30px radius, a 3px border and 8px by 20px padding. These values explain the visible distinction from an unmodified Bootstrap page; do not replace them with a generic rounded-card theme.

[Supporting specification](https://getbootstrap.com/docs/3.4/css/#grid)

## Poncho Design System Clickable panel anatomy

### One destination per card

Official panel examples wrap the entire panel in an anchor, with panel-body inside and the heading and supporting copy within that body. This makes a compact directory entry one coherent destination. Avoid nesting another link or button inside that anchor; it creates conflicting interactive targets.

The production snippet points to an actual activity route. The local preview instead intercepts that same semantic anchor to reveal original detail text. It records the opener, focuses the new detail region, and returns focus when the visitor closes it. This is an application behavior layered over the documented panel markup.

```html
<div class="row">
  <div class="col-sm-4">
    <a class="panel panel-default" href="/activities/repair-cafe/">
      <div class="panel-body">
        <h3>Repair café</h3>
        <p class="text-muted">Skills · Saturday, 10:00</p>
      </div>
    </a>
  </div>
</div>
```

[Code reference](https://argob.github.io/poncho/componentes/paneles/)

[Supporting specification](https://argob.github.io/poncho/componentes/paneles/)

## Poncho Design System Filtering and local state

### A real filter rather than decorative chips

The activity type select has an explicit label and three categories. A change hides nonmatching panel wrappers and updates a status message with the new count. The count describes visible activities, not total registrations or availability. Reset restores all three and places focus back on the filter.

Changing a category closes an open detail so content from a now-hidden activity is not left disconnected from the results. Opening a panel does not change the filter. These rules are intentionally small but complete enough to test the relationship between controls, results and detail.

1. Choose Arts and confirm that only Printmaking workshop remains.
2. Open the activity and inspect its description, then return to the same panel.
3. Reset the filter and confirm all three activities are visible again.

[Supporting specification](https://argob.github.io/poncho/componentes/paneles/)

## Poncho Design System Keyboard and content structure

### Do not copy visual-only disabled states

The official button table demonstrates a disabled CSS class. A real HTML button that must be disabled also needs the disabled attribute; a class alone cannot prevent keyboard activation. For links, decide whether there is still a valid destination rather than treating disabled styling as a complete interaction model.

Use one H1 and a coherent hierarchy. This directory uses H3 inside panels because the expanded detail is an H2 section; for a standalone list under no intermediate section, adapt heading levels to the actual document. Decorative icon libraries are optional and are omitted here because text labels communicate every action.

[Supporting specification](https://argob.github.io/poncho/componentes/botones/)

## Poncho Design System Native setup and scope

### Load only the layers the example uses

Load Bootstrap CSS before Poncho CSS so the theme overrides its foundation. The basic grid and panels do not require Bootstrap JavaScript or jQuery. If the application adds Bootstrap interactive widgets, load a compatible jQuery version before Bootstrap 3.4.1 JavaScript and test the widgets it actually uses.

This is a legacy dependency stack with a defined compatibility boundary. Installing modern Bootstrap alongside it is not a migration strategy. Separate code reuse under the repository MIT license from government identity, official logos and the content license visible on government pages. The preview uses fictional community activities and makes no claim to be an Argentine government service.

[Supporting specification](https://github.com/argob/poncho)

## Component Examples

### Whole-panel navigation

One anchor wraps the panel body; do not nest interactive controls.

```html
<div class="row">
  <div class="col-sm-4">
    <a class="panel panel-default" href="/activities/repair-cafe/">
      <div class="panel-body">
        <h3>Repair café</h3>
        <p class="text-muted">Skills · Saturday, 10:00</p>
      </div>
    </a>
  </div>
</div>
```

[Code reference](https://argob.github.io/poncho/componentes/paneles/)

### Complete activity directory

Native Poncho panels plus a working category filter and focus-restoring detail view.

```html
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Community activities</title><link rel="stylesheet" href="vendor/poncho-2.0.320/bootstrap.min.css"><link rel="stylesheet" href="vendor/poncho-2.0.320/poncho.min.css"><style>html,body{height:auto}body{padding:30px 0;font-family:Arial,sans-serif!important}h1,h2,h3{font-family:Georgia,serif!important}.container{max-width:100%}.panel{display:block}.filter{display:flex;gap:15px;flex-wrap:wrap;align-items:end;margin:30px 0}.filter>div{flex:1;min-width:180px}.panel:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #333;outline-offset:3px}#detail{border-left:5px solid var(--secondary);padding-left:20px;margin:25px 0}footer{font:14px/1.5 Arial;border-top:1px solid #ddd;padding-top:20px}[hidden]{display:none!important}</style><main class="container"><p class="text-muted">COMMUNITY PROGRAMME · INDEPENDENT EXAMPLE</p><h1>Find a local activity</h1><p class="lead">Browse practical sessions at the community centre.</p><div class="filter"><div><label for="category">Activity type</label><select id="category" class="form-control"><option value="all">All activities</option><option value="skills">Skills</option><option value="outdoors">Outdoors</option><option value="arts">Arts</option></select></div><button id="reset" class="btn btn-link" type="button">Reset filter</button></div><p id="count" role="status">3 activities</p><div class="row"><div class="col-sm-4" data-category="skills"><a class="panel panel-default" href="#detail" data-title="Repair café" data-copy="Bring one small household item to a supervised repair session. This demonstration does not reserve a place."><div class="panel-body"><h3>Repair café</h3><p class="text-muted">Skills · Saturday, 10:00</p></div></a></div><div class="col-sm-4" data-category="outdoors"><a class="panel panel-default" href="#detail" data-title="Community garden" data-copy="Meet at the garden gate for a planting session. Wear suitable footwear; tools are provided in this fictional programme."><div class="panel-body"><h3>Community garden</h3><p class="text-muted">Outdoors · Sunday, 09:30</p></div></a></div><div class="col-sm-4" data-category="arts"><a class="panel panel-default" href="#detail" data-title="Printmaking workshop" data-copy="Explore simple printing techniques in the studio. This local example has no registration service."><div class="panel-body"><h3>Printmaking workshop</h3><p class="text-muted">Arts · Tuesday, 16:00</p></div></a></div></div><section id="detail" hidden tabindex="-1"><h2 id="title"></h2><p id="copy"></p><button id="close" class="btn btn-primary">Back to activities</button></section><footer>Native Poncho 2.0.320 CSS with Bootstrap 3.4.1. Arial / Georgia fallbacks. Original activity data and filtering; no government identity or booking service.</footer></main><script>let opener;const select=document.querySelector('#category');function filter(){let n=0;document.querySelectorAll('[data-category]').forEach(x=>{x.hidden=select.value!=='all'&&x.dataset.category!==select.value;if(!x.hidden)n++});document.querySelector('#count').textContent=n+' activit'+(n===1?'y':'ies');document.querySelector('#detail').hidden=true}select.onchange=filter;document.querySelector('#reset').onclick=()=>{select.value='all';filter();select.focus()};document.querySelectorAll('[data-title]').forEach(a=>a.onclick=e=>{e.preventDefault();opener=a;document.querySelector('#title').textContent=a.dataset.title;document.querySelector('#copy').textContent=a.dataset.copy;document.querySelector('#detail').hidden=false;document.querySelector('#detail').focus()});document.querySelector('#close').onclick=()=>{document.querySelector('#detail').hidden=true;opener.focus()};</script></html>
```

[Code reference](https://argob.github.io/poncho/componentes/paneles/)

## Implementation Starting Point

Native CSS setup. This preview needs no Bootstrap JavaScript because its filter/detail logic is original. The complete working-example ZIP in Sources also provides the exact preview dependencies and full document. Extract it, run python3 -m http.server 8080 in that directory, then open http://localhost:8080/poncho.html. Do not open module-based examples through file://.

```bash
npm install ar-poncho@2.0.320 bootstrap@3.4.1
# Copy the following package assets into your site's public vendor directory:
# node_modules/bootstrap/dist/css/bootstrap.min.css
# node_modules/ar-poncho/dist/css/poncho.min.css
# Load Bootstrap first, then Poncho.
# Optional Bootstrap JS components also need jQuery before bootstrap.min.js.

```

## Agent Prompt

Use ar-poncho 2.0.320 on Bootstrap 3.4.1. Compose an accessible directory with a 12-column grid and single-anchor panel cards. Preserve native button role colors, padding and radii. Provide labelled filtering, result counts and focus restoration. Verify font cascade against the pinned package; do not mix Bootstrap 5 APIs or invent registration success.

## Sources

- [Official repository and installation](https://github.com/argob/poncho) — Package setup, dependencies and MIT code license.
- [Panel anatomy](https://argob.github.io/poncho/componentes/paneles/) — Whole-card anchors, supporting copy and variants.
- [Button meaning](https://argob.github.io/poncho/componentes/botones/) — Action hierarchy, class names and states.
- [Typography](https://argob.github.io/poncho/identidad/tipografia/) — Current font families and semantic text guidance.
- [Published CSS](https://github.com/argob/poncho/blob/master/dist/css/poncho.css) — Actual color, typography and geometry declarations.
- [Bootstrap 3 grid](https://getbootstrap.com/docs/3.4/css/#grid) — Inherited responsive columns, gutters and container widths.
- [Download complete working example](/assets/demos/poncho-example.zip) — ZIP with full HTML, local CSS/JavaScript dependencies, supplied licenses and exact launch instructions. No build step is required.
