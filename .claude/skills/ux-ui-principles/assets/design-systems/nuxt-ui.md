# Nuxt UI Design System — OpenDesign Application Guide

Build a complete Nuxt UI 4.11.3 brief composer with real Vue components, semantic theme references, input validation and explicit local draft behavior.

Actual Nuxt UI components in a standalone Vue/Vite browser app. The brief composer is original OpenDesign code and does not call an AI model, Nuxt server or persistence service.

## Source Reference

- **UI package:** @nuxt/ui 4.11.3 ([source](https://ui.nuxt.com/docs/getting-started/installation/vue))
- **Default aliases:** Primary green / neutral slate ([source](https://ui.nuxt.com/docs/getting-started/theme/colors))
- **Reference entries:** 37 semantic values and contracts ([source](https://ui.nuxt.com/docs/getting-started/theme/design-system))


## Design Reference

Nuxt UI 4.11.3 defaults, actual compiled semantic CSS and native Vue component contracts. Original layout and validation choices are marked separately.

### Default semantic color aliases

[Official reference](https://ui.nuxt.com/docs/getting-started/theme/colors)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| primary | green | Actual Nuxt UI 4.11.3 default alias. Component color props refer to semantic names, while the configured palette supplies their values. |
| secondary | blue | Actual Nuxt UI 4.11.3 default alias. Component color props refer to semantic names, while the configured palette supplies their values. |
| success | green | Actual Nuxt UI 4.11.3 default alias. Component color props refer to semantic names, while the configured palette supplies their values. |
| info | blue | Actual Nuxt UI 4.11.3 default alias. Component color props refer to semantic names, while the configured palette supplies their values. |
| warning | yellow | Actual Nuxt UI 4.11.3 default alias. Component color props refer to semantic names, while the configured palette supplies their values. |
| error | red | Actual Nuxt UI 4.11.3 default alias. Component color props refer to semantic names, while the configured palette supplies their values. |
| neutral | slate | Actual Nuxt UI 4.11.3 default alias. Component color props refer to semantic names, while the configured palette supplies their values. |

### Light text roles

[Official reference](https://ui.nuxt.com/docs/getting-started/theme/design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ui-text-dimmed | var(--ui-color-neutral-400) | Lowest-emphasis supplementary text. Do not use this role for required field labels or validation messages. |
| --ui-text-muted | var(--ui-color-neutral-500) | Supporting descriptions such as field hints and the original preview’s introductory paragraph. |
| --ui-text-toned | var(--ui-color-neutral-600) | Secondary reading hierarchy; compare it with the normal text role before reducing contrast further. |
| --ui-text | var(--ui-color-neutral-700) | Default text role for the main reading flow and user-entered content. |
| --ui-text-highlighted | var(--ui-color-neutral-900) | High-emphasis headings and foreground details, including the preview’s primary headline. |
| --ui-text-inverted | #fff | Foreground for an inverted dark surface; it is not a general white-text override on every accent. |

### Light surfaces and borders

[Official reference](https://ui.nuxt.com/docs/getting-started/theme/design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ui-bg | #fff | Base canvas and the light card surface used by the complete composer. |
| --ui-bg-muted | var(--ui-color-neutral-50) | Quiet supporting surface for a secondary region within the light appearance. |
| --ui-bg-elevated | var(--ui-color-neutral-100) | Stronger separation from the white canvas for raised or emphasized secondary surfaces. |
| --ui-bg-accented | var(--ui-color-neutral-200) | A more pronounced neutral background; keep field values legible against it. |
| --ui-bg-inverted | var(--ui-color-neutral-900) | Dark neutral surface to pair with the inverted foreground role. |
| --ui-border | var(--ui-color-neutral-200) | Default neutral dividing line for fields and card outlines. |
| --ui-border-muted | var(--ui-color-neutral-200) | Low-emphasis separators between related blocks rather than strong section boundaries. |
| --ui-border-accented | var(--ui-color-neutral-300) | Stronger neutral outline where the default border does not provide enough separation. |
| --ui-border-inverted | var(--ui-color-neutral-900) | Border role for inverted surfaces; resolve it with its intended background. |

### Shared geometry and Tailwind type

[Official reference](https://ui.nuxt.com/docs/getting-started/theme/design-system)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| --ui-radius | .25rem | Published Nuxt UI or Tailwind defaults in the actual compiled output. The original layout uses its own 1100px maximum and 24px gap. |
| --ui-container | 80rem | Published Nuxt UI or Tailwind defaults in the actual compiled output. The original layout uses its own 1100px maximum and 24px gap. |
| --spacing | .25rem | Published Nuxt UI or Tailwind defaults in the actual compiled output. The original layout uses its own 1100px maximum and 24px gap. |
| --text-sm | .875rem | Published Nuxt UI or Tailwind defaults in the actual compiled output. The original layout uses its own 1100px maximum and 24px gap. |
| --text-xl | 1.25rem | Published Nuxt UI or Tailwind defaults in the actual compiled output. The original layout uses its own 1100px maximum and 24px gap. |
| --text-4xl | 2.25rem | Published Nuxt UI or Tailwind defaults in the actual compiled output. The original layout uses its own 1100px maximum and 24px gap. |

### Vue component contracts

[Official reference](https://ui.nuxt.com/docs/getting-started/installation/vue)

| Name / Rule | Value / Configuration | Use |
| --- | --- | --- |
| Vite plugin | ui({ colorMode: false }) | Generates the component/theme imports and required browser integration. |
| Vue plugin | createApp(App).use(ui) | Import ui from @nuxt/ui/vue-plugin; a raw component import alone is not the full standalone setup. |
| UApp | Application wrapper | Provides the native app context for the component tree. |
| UFormField | label, description, name | Connects field context and readable supporting text to the control. |
| UInput / UTextarea | v-model | Both inputs are controlled Vue refs; the textarea also uses autoresize and rows. |
| USwitch | v-model + label | Optional checklist choice is a real boolean state. |
| UButton | @click / color / variant | Primary composition and neutral outlined recovery use native variants. |
| UCard | header slot + default body | Keeps field content and the readable result in matching native surfaces. |
| UBadge | color + variant="subtle" | Text and appearance distinguish waiting from a locally composed result. |

## Nuxt UI Design System Standalone Vue Runtime

### Use the official Vue integration path

This study runs @nuxt/ui 4.11.3 inside Vue 3 with Vite. It is not a Nuxt server-rendered application. The Vite plugin resolves the generated UI templates, auto component imports and framework aliases; the Vue plugin registers the required runtime integration. The complete example includes both, avoiding a misleading setup that installs a package but leaves #build or #imports unresolved.

- @nuxt/ui/vite supplies build-time integration.
- @nuxt/ui/vue-plugin supplies runtime registration.
- UApp wraps the native component tree.

### Keep the application wrapper and stylesheet

UApp wraps the composition. The stylesheet imports Tailwind CSS and @nuxt/ui, and the main entry imports that stylesheet before mounting the application. The build produces real component CSS and behavior rather than static approximations of cards and switches. This is a concrete browser setup for inspecting the library; a Nuxt application should use its own documented module setup.

## Nuxt UI Design System Semantic Colors and Component Variants

### Use semantic colors rather than a copied green

The default configuration maps primary and success to green, secondary and info to blue, warning to yellow, error to red and neutral to slate. Native components consume those aliases through their color props. The primary compose button and neutral outlined reset button therefore represent distinct action roles without introducing a custom palette that is falsely described as a Nuxt UI default.

### Keep the appearance scope explicit

The Vite plugin is configured with colorMode:false for this light-only study. The reference table lists the corresponding light text, surface and border declarations. It does not claim that those literal values are also the dark theme. A product adding color mode should enable its chosen integration and verify its controls, surfaces and saved preferences together.

## Nuxt UI Design System Text Roles, Surfaces and Geometry

### Read the semantic CSS relationships

Support copy uses --ui-text-muted, which points to neutral-500; the main heading uses --ui-text-highlighted, which points to neutral-900. Surface and border variables similarly reference the configured neutral scale. The guide preserves those relationships rather than flattening everything into a few unrelated hex values, so changing the neutral palette still produces a coherent component theme.

### Separate shared defaults from page decisions

The shared --ui-radius is .25rem and --ui-container is 80rem in this version. The original brief layout instead chooses an 1100px outer maximum, two columns with a 24px gap and a single column below 700px. Tailwind’s actual text roles supply the headline and supporting sizes. Those page decisions are in the supplied CSS, not invented library-wide requirements.

## Nuxt UI Design System Field Composition and Local Validation

### Give every input a real field context

UFormField supplies a visible label and name around UInput or UTextarea. The context field also shows a word count derived from its trimmed contents. Both controls use v-model, so the displayed values and the composition handler read the same refs. The textarea has a useful initial row count and autoresize, allowing longer user content to grow instead of disappearing into a clipped fixed box.

### Validate before composing

The original compose action requires a nonempty trimmed title and context. It shows a readable alert if either is missing and keeps the user’s current input intact. This is application validation, not an implied call to a server or a schema that has not been included. The supplied code makes the rule and the error path visible in one place.

## Nuxt UI Design System Derived Draft and Stale-State Prevention

### Assemble only the text that is present

The output combines the supplied title and context with an optional static sharing checklist. The result says it is a local draft rather than an AI response. There is no model call, loading delay or invented generated content. The optional checklist is controlled through a native USwitch boolean, and the assembled text reflects that choice directly.

### Clear an old result when inputs change

A Vue watch on the title, context and checklist removes the previous composed result after any edit. The status badge then returns to Waiting for your text. This prevents a stale draft from appearing current while the user is editing new inputs. The word count remains a computed value, so it cannot drift away from the current context.

## Nuxt UI Design System Complete Empty and Reset States

### Make the waiting panel useful

Before composition, the right card contains a full explanation of what will appear and how editing, privacy and reset work. It is not an empty content module. Once composed, that space displays the complete readable draft with preserved line breaks and wrapping. The badge repeats the state in text, so color is not the only signal.

### Reset to complete sample inputs

Reset sample restores the original title, full context and enabled checklist while clearing the result and any error. It does not leave a blank demonstration requiring the reader to guess what content belongs there. The browser check composes a changed brief and then verifies that the full sample title returns after reset.

## Nuxt UI Design System Responsive Cards and Text Flow

### Keep the result readable at narrow widths

The two cards become one column below 700px, and all inputs use the available width. The draft uses pre-wrap rather than an unwrappable preformatted line, so a long title or sentence can wrap naturally. Buttons wrap within their action group. The page is checked at 280px as well as phone, tablet and desktop sizes after a real edit and composition.

### Inspect state after native transitions

Switch styling includes its native state transition. The visual check waits before capturing the result so it does not mistake an intermediate thumb or track color for the settled state. Functional checks verify the boolean effect by confirming that an unchecked switch actually removes the checklist from the composed text.

## Nuxt UI Design System Complete Vue and Vite Project

### Use all five supplied files

The example provides App.vue, main.js, style.css, vite.config.mjs and index.html. The configuration includes @vitejs/plugin-vue and @nuxt/ui/vite; the main entry installs @nuxt/ui/vue-plugin. Installing only @nuxt/ui and pasting App.vue is not a complete runnable project. The pinned setup reproduces the local preview with its actual native components and semantic styles.

1. Save all five supplied files together.
2. Install the pinned dependencies.
3. Run Vite in that directory.
4. Test missing input, edited output, checklist removal and reset.

### Keep this browser study separate from deployment

The local build has no server endpoint, authentication, persistent storage or external model connection. Those capabilities are not implied by the component names or the compose action. A real product can reuse the field and state pattern while adding its own verified persistence and service behavior, but the complete study remains useful without those additions.

## Component Examples

### App.vue

Full native component composition and reactive state.

```vue
<script setup>
import{ref,computed,watch}from'vue';
const title=ref('A calmer project handoff'),context=ref('Help a small team understand what is ready, what needs a decision, and who owns the next step.'),checklist=ref(true),error=ref(''),brief=ref('');const words=computed(()=>context.value.trim()?context.value.trim().split(/\s+/).length:0);watch([title,context,checklist],()=>{brief.value='';error.value=''});function compose(){if(!title.value.trim()||!context.value.trim()){error.value='Add both a title and context before composing.';return}brief.value=title.value.trim()+'\n\nPurpose\n'+context.value.trim()+(checklist.value?'\n\nBefore sharing\n• Name the next decision.\n• Identify an owner.\n• Include the source materials.':'')+'\n\nThis is a local draft, not a generated AI response.';}function reset(){title.value='A calmer project handoff';context.value='Help a small team understand what is ready, what needs a decision, and who owns the next step.';checklist.value=true;brief.value='';error.value=''}
</script>
<template><UApp><main><p class="text-primary font-semibold text-sm">NUXT UI / ORIGINAL BRIEF COMPOSER</p><h1 class="text-4xl font-bold tracking-tight mt-4 text-highlighted">Put the next step into words.</h1><p class="text-muted mt-5 max-w-2xl leading-7">A local composition tool using Nuxt UI 4.11.3 in a standalone Vue application. The preview assembles your text; it does not call an AI model.</p><div class="layout"><UCard><template #header><h2 class="font-semibold text-xl">Write the essentials</h2></template><div class="stack"><UFormField label="Brief title" name="title"><UInput v-model="title" class="w-full" placeholder="Name the work" aria-label="Brief title"/></UFormField><UFormField label="Context" name="context" :description="words+' words in your context'"><UTextarea v-model="context" class="w-full" autoresize :rows="5" placeholder="What should the next person understand?" aria-label="Context"/></UFormField><USwitch v-model="checklist" label="Include the sharing checklist"/><p v-if="error" role="alert" class="text-error text-sm">{{error}}</p><div class="flex flex-wrap gap-3"><UButton @click="compose">Compose local brief</UButton><UButton color="neutral" variant="outline" @click="reset">Reset sample</UButton></div></div></UCard><UCard><template #header><div class="flex justify-between gap-3 flex-wrap"><h2 class="font-semibold text-xl">Readable draft</h2><UBadge :color="brief?'success':'neutral'" variant="subtle">{{brief?'Composed locally':'Waiting for your text'}}</UBadge></div></template><div v-if="brief" class="brief" role="status">{{brief}}</div><div v-else class="space-y-4 text-muted leading-7"><p>Your draft will keep the title and context you provide, with an optional sharing checklist.</p><ul class="list-disc pl-5 space-y-2"><li>Editing any input clears an older composed result.</li><li>No content leaves the browser.</li><li>Reset returns to the complete sample inputs.</li></ul></div></UCard></div><p class="notes text-muted">Actual UCard, UFormField, UInput, UTextarea, USwitch, UButton and UBadge components with Nuxt UI’s default semantic theme. Original application content and state; this example uses Vue/Vite, not a Nuxt server.</p></main></UApp></template>

```

[Code reference](https://ui.nuxt.com/docs/getting-started/installation/vue)

- Keep all five source files together.

### main.js

Vue mounting and Nuxt UI runtime plugin.

```javascript
import{createApp}from'vue';import ui from'@nuxt/ui/vue-plugin';import App from'./App.vue';import './style.css';createApp(App).use(ui).mount('#app');

```

[Code reference](https://ui.nuxt.com/docs/getting-started/installation/vue)

- Keep all five source files together.

### style.css

Native theme imports and original responsive layout.

```css
@import 'tailwindcss';
@import '@nuxt/ui';
body{margin:0}*{box-sizing:border-box}main{max-width:1100px;margin:auto;padding:32px}.layout{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:32px}.stack{display:grid;gap:24px}.brief{white-space:pre-wrap;line-height:1.7;overflow-wrap:anywhere}.notes{font-size:13px;line-height:1.6;margin-top:24px}@media(max-width:700px){main{padding:16px}.layout{grid-template-columns:1fr}}textarea{min-height:150px}button{max-width:100%}

```

[Code reference](https://ui.nuxt.com/docs/getting-started/installation/vue)

- Keep all five source files together.

### vite.config.mjs

Vue compiler and Nuxt UI build plugin.

```javascript
import{defineConfig}from'vite';import vue from'@vitejs/plugin-vue';import ui from'@nuxt/ui/vite';export default defineConfig({plugins:[vue(),ui({colorMode:false})],base:'./',build:{cssCodeSplit:false}});

```

[Code reference](https://ui.nuxt.com/docs/getting-started/installation/vue)

- Keep all five source files together.

### index.html

Complete browser root document.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project brief composer</title></head><body><div id="app"></div><script type="module" src="./main.js"></script></body></html>

```

[Code reference](https://ui.nuxt.com/docs/getting-started/installation/vue)

- Keep all five source files together.

## Implementation Starting Point

Save all five supplied files first. Use a Node version supported by the pinned Vite and Nuxt UI releases (the local build used Node 22.17).

```sh
npm init -y
npm install vue@3.5.43 vue-router@5.3.1 @nuxt/ui@4.11.3 tailwindcss@4.3.3 vite@8.3.2 @vitejs/plugin-vue@6.0.9
npx vite --host 127.0.0.1
```

## Agent Prompt

Implement the complete Nuxt UI 4.11.3 standalone Vue brief composer with the official Vite and Vue plugins. Preserve semantic colors, UFormField contexts, controlled input and switch refs, trim validation, computed word count, stale-result clearing, complete waiting content and reset. Do not imply an AI call or backend save.

## Sources

- [Vue installation](https://ui.nuxt.com/docs/getting-started/installation/vue) — Standalone Vue and Vite integration.
- [Design system](https://ui.nuxt.com/docs/getting-started/theme/design-system) — Semantic CSS and shared theme structure.
- [Colors](https://ui.nuxt.com/docs/getting-started/theme/colors) — Configurable semantic aliases.
- [Form fields](https://ui.nuxt.com/docs/components/form-field) — Labels, descriptions and field context.
- [Textarea](https://ui.nuxt.com/docs/components/textarea) — Controlled text and resize behavior.
