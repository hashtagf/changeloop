# Design system study guides — all 126 kept

Source: Open Design study guides of public design systems, <https://open-design.ai/design-system/>
(repo `nexu-io/open-design`, **Apache-2.0**; copies here keep their text unchanged, fetched 2026-11-05). They are
a **secondary study** (illustrative previews, version-pinned), not the systems own documentation: confirm any
exact value at the linked official source inside each file before citing it (source S102).
Cross-system findings: [design system benchmarks](../../references/design-system-benchmarks.md).

**Do not open a whole guide** (~30 KB, mostly HTML in Component Examples). Use the lookup script:
`python3 scripts/ds_lookup.py gov-uk` (outline) · `… gov-uk design-reference --sub spacing` (one token table) ·
`… nhs agent-prompt` · `… --find "density"` (search all 126, grouped by system and section). Cite the guide's
own linked official source for any exact value.

Each file has the same six sections: Source Reference, Design Reference (token tables), Implementation Starting
Point, Component Examples, Agent Prompt, Sources. Read one file for a sector, not the folder. The 14 curated rows come first, then every other system.

| File | Sector | Version studied | Read it for |
|---|---|---|---|
| [gov-uk](gov-uk.md) | Government | Frontend 6.5.1 | Responsive type pairs, spacing units, error summary, check-answers journey |
| [uswds](uswds.md) | Government | 3.14.0 | Spacing units, theme roles, semantic comparison table, accordion |
| [nhs](nhs.md) | Health / public | frontend 10.6.1 | Grouped radios, details, appointment preference flow |
| [japan-dads](japan-dads.md) | Government (JP) | tokens 2.0.1 | Japanese text roles, lookup with malformed / no-match / found |
| [nav-aksel](nav-aksel.md) | Public sector (NO) | ds-css 8.18.0 | Light/dark role resolution, table density, sortable selectable table |
| [digdir-designsystemet](digdir-designsystemet.md) | Public sector (NO) | 1.23.0 | Role ladder per hue (background/surface/border/text/base), size modes |
| [atlassian](atlassian.md) | Enterprise SaaS | checked 2026-10 | Semantic tokens, 8px scale, selection vs status, theme init |
| [sap-fiori](sap-fiori.md) | Enterprise | Horizon / UI5 | Content density, value states, high-contrast themes |
| [workday-canvas](workday-canvas.md) | Enterprise | Canvas Kit | base → sys token layers, padding/gap roles, FormField |
| [microsoft-fluent](microsoft-fluent.md) | Platform | Fluent UI v9 | Semantic tokens, type and spacing ramps, dialog validation |
| [radix-themes](radix-themes.md) | Open-source kit | — | Scale-based theming |
| [twilio-paste](twilio-paste.md) | Product / dev | Paste | rem spacing aliases, draft vs review vs send states |
| [porsche](porsche.md) | Brand-led | v4.8.0 | Fluid spacing, CSS color schemes, small radius, configurator |
| [palantir-blueprint](palantir-blueprint.md) | Data / dense | 6.21.0 | Dense table workspace, intent tokens, review inspector |

## Other systems (112)

| File | What the guide builds |
|---|---|
| [adeo-mozaic](adeo-mozaic.md) | Build a practical quantity-control composition with Mozaic’s 16px magic unit, matched 48px controls, real SCSS imports and BEM classes. The shelf… |
| [adobe-spectrum](adobe-spectrum.md) | Study React Spectrum v3 through a selectable creative-asset table and an export-preset inspector. Understand Provider themes and input scale,… |
| [agriculture-agds](agriculture-agds.md) | Build longer service transactions with AgDS’s concrete spacing, responsive props and TaskList status model. Try a preparation workflow whose review… |
| [alaska-auro](alaska-auro.md) | Explore Auro’s Alaska theme through real semantic color and type tokens, class-based typography and the native flight component. Two original flight… |
| [alberta](alberta.md) | Use Alberta’s native web components and published design tokens to build a complete preparation checklist with accessible choices, derived progress… |
| [amsterdam](amsterdam.md) | Use Amsterdam’s real open-source Switch contract with a complete neutral theme, accessible labels and immediate reading preferences. |
| [arco-design](arco-design.md) | Build a report-section selector with Arco’s controlled Transfer component. Explore its actual spacing and size scales, CSS variable conventions,… |
| [ariakit](ariakit.md) | Ariakit supplies unstyled React components with explicit shared state and composable accessible parts. Its combobox separates typed input from… |
| [aws-cloudscape](aws-cloudscape.md) | A Cloudscape configuration guide with real visual-refresh tokens, density-aware spacing, controlled form APIs, and a working two-step resource wizard. |
| [backbase](backbase.md) | Build a branded banking review flow with Backbase’s Angular modules, semantic theme export, and explicit review states. Compare web APIs with… |
| [bits-ui](bits-ui.md) | Bits UI provides headless Svelte components that compose through native parts and Svelte 5 state. The example combines a derived mixed-state… |
| [bootstrap](bootstrap.md) | Use Bootstrap 5.3.8 through its actual spacing scale, semantic colors, responsive grid and component APIs. Try a working reservation form, error… |
| [british-columbia](british-columbia.md) | Build a B.C.-style reminder preference form with real semantic tokens, native React Aria controls, conditional contact fields and complete validation… |
| [bulma](bulma.md) | Build an editorial desk with Bulma’s real field/control structure, responsive columns, semantic color modifiers, and CSS variables, with complete… |
| [canada-ca](canada-ca.md) | Explore GC Design System typography, semantic tokens and native web components through a complete searchable preparation guide with disclosure and… |
| [cfpb](cfpb.md) | Implement CFPB’s editorial grid, current typography and native Expandables with a working reading worksheet, verified package APIs, and explicit… |
| [chakra-ui](chakra-ui.md) | A Chakra UI v3 reference for tokens, semantic color roles, recipes, and compound form components. Inspect the actual spacing and type scales, then… |
| [cms](cms.md) | Implement CMS Core with versioned theme variables, real Review component APIs, and a working edit-and-review flow that preserves user answers and… |
| [coreui](coreui.md) | A CoreUI review queue built with real 5.9 theme variables, native tabs, checkbox batch selection and a persistent toast that can undo the last local… |
| [daisyui](daisyui.md) | A CSS-native invitation studio that demonstrates daisyUI 5 semantic themes, paired content colors, radio-button joins, range controls, browser… |
| [dell](dell.md) | Build a scoped device search with DDS v3: semantic colors, a responsive typography ramp, token spacing, and an InputGroup composition whose filtering… |
| [denmark-fds](denmark-fds.md) | Explore Denmark’s DKFDS theme, actual Sass scales and accessible table patterns through a complete resource comparison with numeric sorting,… |
| [designers-italia](designers-italia.md) | Implement a readable service sequence with Bootstrap Italia’s real typography, responsive Stepper structure and recoverable local form state. |
| [dsfr](dsfr.md) | Understand the French State system’s concrete typography, grid and accordion API within its institutional scope. Compare linked and independent… |
| [duet](duet.md) | Study Duet’s LocalTapiola color and spacing scales through a date-range workflow, with ISO date values, explicit range validation, component focus… |
| [elastic-ui](elastic-ui.md) | Build an Elastic UI log explorer with verified Borealis scales, native table and search controls, severity filtering, local saved events, and… |
| [element-plus](element-plus.md) | Use Element Plus’s real Transfer model, filters and disabled options to build a module-selection workbench, backed by verified colors, type sizes and… |
| [emplifi-soul](emplifi-soul.md) | Read Soul’s data-table contract alongside its six-pixel spacing, layered color roles and compact Inter type. Compare bulk selection, missing-data… |
| [esri-calcite](esri-calcite.md) | A practical Calcite reference for focused spatial tools: semantic surfaces and blue actions, compact inspection panels, real input APIs, and a… |
| [europa-ecl](europa-ecl.md) | Inspect Europa’s EC color, type and spacing roles through a complete native accordion brief, including keyboard operation, open-all behavior and… |
| [flowbite](flowbite.md) | A native Flowbite 4 accordion and drawer composition, with verified semantic theme aliases, a persistent packing checklist and an accessible local… |
| [fomantic-ui](fomantic-ui.md) | A native Fomantic UI reading shelf with verified compiled theme values, jQuery dropdown and rating modules, explicit keyboard support and a… |
| [foundation](foundation.md) | A working Foundation proof desk using XY Grid, Abide custom validators, Reveal confirmation, actual Sass settings, and complete local integration… |
| [framework7](framework7.md) | A native Framework7 sketchbook with real swipeout actions, explicit iOS theme values, a keyboard-accessible action opener and a filtered list that… |
| [gitlab-pajamas](gitlab-pajamas.md) | A Pajamas guide for technical workflows: actual semantic tokens, fluid type and spacing, a staged pipeline inspector, readable failure output and an… |
| [gluestack-ui](gluestack-ui.md) | Build a field-kit checklist with gluestack’s real core Button and Input creators, explicit v5 semantic colors and complete React Native Web source.… |
| [gov-cz](gov-cz.md) | Explore Gov Design System CE’s real color roles, card slots and native pagination through a complete six-resource reading toolkit with explicit focus… |
| [harvard-sites](harvard-sites.md) | Understand HarvardSites as an editorial platform: compare site styles, choose documented font pairings, and assemble university pages from… |
| [headless-ui](headless-ui.md) | Headless UI provides unstyled React interaction components for dialogs, listboxes and switches. This guide focuses on composing their native focus,… |
| [helsinki](helsinki.md) | Compose native HDS selection groups, semantic feedback colors and linked error summaries with a complete local review-and-correction flow. |
| [heroui](heroui.md) | A HeroUI v3 reference with actual semantic CSS variables, compound React controls, light and dark surfaces, and a working image-export recipe. |
| [hpe-grommet](hpe-grommet.md) | Model a capacity reservation with Grommet’s layout primitives, controlled form fields and numeric meters. Use its theme scale deliberately, and keep… |
| [indiana-rivet](indiana-rivet.md) | Build university pages with Rivet’s real token scale, HTML component anatomy, and native keyboard interactions. Explore a compact workshop detail… |
| [infor](infor.md) | Compose an enterprise maintenance form with real IDS input states, theme aliases and an exact asset identifier. Inspect the current public theme… |
| [ionic](ionic.md) | A native Ionic reading-preferences interface with verified color roles, iOS and Material range geometry, real segment and switch behavior, and an… |
| [kajabi-sage](kajabi-sage.md) | Build a creator-facing sharing panel with readable course context, clear copy actions and honest clipboard feedback. Explore Sage’s Rails component… |
| [kern](kern.md) | Build a native KERN interface with verified typography, semantic themes, disclosures and a reversible confirmation flow. |
| [kiwi-orbit](kiwi-orbit.md) | A travel-focused Orbit guide with real product colors and spacing, native baggage choices, a consistent price breakdown and a complete local review… |
| [kobalte](kobalte.md) | Kobalte provides headless components for Solid, including numeric fields with separate raw and formatted values, compound checkbox anatomy and… |
| [maersk](maersk.md) | Study Maersk’s operational interface language through real light-theme roles, headline and text scales, nested radii and identifier handling. A… |
| [mantine](mantine.md) | A Mantine 9 reference built around a native participant table and scheduling drawer. Inspect the actual theme scales, connect useForm to TextInput,… |
| [melt-ui](melt-ui.md) | Melt UI’s store/action builders attach accessible behavior to Svelte markup you own. This guide uses @melt-ui/svelte 0.86.6 to connect radio, slider… |
| [michigan-forty-two](michigan-forty-two.md) | Understand Forty-Two’s supported WordPress workflow, web palette and people-directory patterns through a working role-and-research filter example. |
| [monday-vibe](monday-vibe.md) | Compose a working delivery board with Vibe 4 tokens and React controls. Understand semantic action colors versus board labels, named spacing steps,… |
| [morningstar](morningstar.md) | Build a research interface where numbers align, asset colors keep their meaning and typography remains readable. Explore MDS constants, Vue 3… |
| [mozilla-protocol](mozilla-protocol.md) | An editorial Protocol guide with real font stacks, spacing and container scales, a responsive illustrated reading page, and a complete native-CSS… |
| [naive-ui](naive-ui.md) | A native Naive UI data-table workbench with verified theme-object values, row selection, expansion, sorting, pagination and a local batch review… |
| [nl-design-system](nl-design-system.md) | Compose a public-service interface from real contributor components and an explicit theme. This reference uses Utrecht CSS to demonstrate token… |
| [nordhealth](nordhealth.md) | Inspect Nord’s Therapy theme tokens and Web Component contracts through a room-request draft: real color roles, responsive field sizing, explicit… |
| [nsw](nsw.md) | Explore NSW design tokens, Public Sans typography and native keyboard-accessible tabs through a complete workshop guide with an independent local… |
| [nuxt-ui](nuxt-ui.md) | Build a complete Nuxt UI 4.11.3 brief composer with real Vue components, semantic theme references, input validation and explicit local draft… |
| [ons](ons.md) | Build a survey answer that cannot contradict itself: native ONS checkboxes, mutually exclusive responses, exact type and color references, and a… |
| [ontario](ontario.md) | Build an Ontario-style long-form guide with real typography, published spacing and color values, native accordion behavior and complete… |
| [oracle-redwood](oracle-redwood.md) | Study Oracle JET 19 Redwood’s actual palette, semantic roles, spacing and density boundaries through a complete original editable stock-review… |
| [orange-ouds](orange-ouds.md) | Inspect Orange OUDS 1.4’s real semantic tokens, theme packages and native Offcanvas behavior through a complete responsive comparison study. |
| [oruga-ui](oruga-ui.md) | A native Oruga catalog editor with searchable, removable topic tags, enforced vocabulary limits, an optional theme’s real tokens and a live card that… |
| [pega-bolt](pega-bolt.md) | Explore Bolt’s Pega-branded content system: fluid typography, separate horizontal and vertical spacing, and a Twig accordion composition for an… |
| [pico-css](pico-css.md) | Pico CSS styles semantic HTML with a responsive rem-based type scale and theme variables. Its standard, classless and conditional distributions have… |
| [poncho](poncho.md) | Inspect Poncho’s Bootstrap 3 grid, semantic action colors and fully clickable service panels through a working activity directory. |
| [preline-ui](preline-ui.md) | A native Preline session planner with linked tabs, a constrained input-number plugin, installed theme aliases, real Tailwind scales and a local… |
| [prime-ui](prime-ui.md) | A version-pinned PrimeVue implementation of the Prime UI ecosystem: an Aura-themed document tree with real preset references, controlled expansion,… |
| [pure-css](pure-css.md) | Pure CSS is a modular stylesheet for grids, forms, buttons, menus and tables, without a widget runtime. This guide shows how its optional responsive… |
| [quasar](quasar.md) | A native Quasar guided workflow with actual brand and spacing values, QForm validation, a three-step brief builder, radio format choices and a live… |
| [queensland](queensland.md) | Explore Queensland’s Bootstrap implementation through a complete illustrated resource selector with real theme roles, native checkbox styling and an… |
| [react-native-elements](react-native-elements.md) | Build a complete focus-plan composer with React Native Elements 5.0.0: real theme roles, controlled inputs and selections, validation, local… |
| [react-suite](react-suite.md) | A native React Suite review calendar with verified v6 CSS variables, date-cell markers, a selected-day agenda, modal validation, and explicit local… |
| [red-hat-patternfly](red-hat-patternfly.md) | Use PatternFly for an operations workspace: semantic token references, selectable service cards, tri-state bulk selection, scope review, and complete… |
| [rei-cedar](rei-cedar.md) | Build a concrete Cedar fulfillment selector with native Vue tiles, real token values, complete keyboard navigation and a responsive product… |
| [ripple-victoria](ripple-victoria.md) | Explore Ripple’s actual color roles, 14-step spacing scale and responsive type references through a complete workshop timeline with progressive… |
| [sainsburys](sainsburys.md) | Apply Sainsbury’s public design guidance to a complete collection-slot flow: real palette and size references, accessible radio choices, an updating… |
| [salesforce-lightning](salesforce-lightning.md) | A Lightning blueprint guide for dense record work: real spacing, type and semantic colors, an editable case workspace, field validation and an… |
| [samsung-one-ui](samsung-one-ui.md) | Study One UI’s viewing and interaction structure, 24dp margin guidance and 200% text-scaling requirement through a complete original… |
| [scottish-government](scottish-government.md) | Apply the Scottish Government’s responsive type, spacing and color roles through a native character-count field that preserves over-limit text and… |
| [seek-braid](seek-braid.md) | Understand Braid through an original job-search composition: theme-scoped variables, four real breakpoints, contextual text, distinct button tones… |
| [segment-evergreen](segment-evergreen.md) | An Evergreen reference with actual theme values, controlled tag entry, live rule matching, an empty-state recovery path and a native review dialog. |
| [semi-design](semi-design.md) | Create a sequential workspace setup with Semi’s recommended basic Steps, controlled Input and Switch, real theme tokens, and an explicit React 18… |
| [semrush-intergalactic](semrush-intergalactic.md) | An Intergalactic guide with current semantic and chart tokens, native filtering controls, fixed-scale comparison, selected detail and a complete… |
| [servicenow-horizon](servicenow-horizon.md) | Explore Horizon Workspace’s exact spacing, radius and typography references through a complete local request-review flow with draft retention,… |
| [servicetitan-anvil](servicetitan-anvil.md) | Make Anvil2 concrete with its three-tier token model, verified light/dark role values and a complete service-assignment interaction with synchronized… |
| [siemens-ix](siemens-ix.md) | Inspect industrial events with an explicit severity vocabulary, theme-aware color roles and the iX Event List API. This guide builds a local… |
| [singapore-sgds](singapore-sgds.md) | Use current SGDS Web Components with real responsive tokens, day and night themes, and native bounded quantities that keep a local plan synchronized. |
| [skeleton](skeleton.md) | Compare Skeleton 5.0.1’s real Cerberus, Mint and Rose themes through a complete reading desk with live token inspection, dark surface pairings and… |
| [sprout-seeds](sprout-seeds.md) | Inspect Seeds’ actual public color, spacing, product typography and border tokens through a complete editorial review queue with mixed selection,… |
| [stanford-decanter](stanford-decanter.md) | Compose academic editorial pages with Decanter’s Tailwind preset, responsive type scale and fluid screen edges. Explore original event cards with… |
| [sumup-circuit](sumup-circuit.md) | A Circuit guide with exact semantic tokens, native validation props, a complete merchant item editor and an illustrated customer-side preview. |
| [suomi-fi](suomi-fi.md) | Build readable Finnish public-service forms with Source Sans 3, explicit spacing tokens and a recoverable document-selection pattern. |
| [tabler](tabler.md) | A native Tabler project journal with actual 1.6 theme variables, timeline cards, datagrid context, modal validation and a light/dark composition that… |
| [tamagui](tamagui.md) | Explore Tamagui’s actual v5 token categories and light/dark blue themes through a complete native-component habit board with validation, progress and… |
| [tdesign](tdesign.md) | Build a compact API policy editor with TDesign React: concrete theme roles, its two-pixel size scale, Form field registration, and a typed Table… |
| [thumbtack-thumbprint](thumbtack-thumbprint.md) | Build a service discovery interface with Thumbprint’s documented v2 primitives: compact provider cards, readable comparison details, clear selection… |
| [uikit](uikit.md) | UIkit combines a CSS framework, Less customization and attribute-driven JavaScript components. Its Switcher, Accordion and responsive grid work… |
| [undp](undp.md) | Explore UNDP’s published color and spacing tokens, native keyboard-operated tabs and a complete workshop-reading example with local review progress. |
| [va](va.md) | Build clear service journeys with VA’s semantic tokens and native Process List: visible step explanations, meaningful status labels, and… |
| [vant](vant.md) | A mobile address-selection flow built with Vant 4: real CSS variables, controlled address identity, field validation, theme switching and an explicit… |
| [visa](visa.md) | Use Visa’s Nova CSS to build a clear statement-format preference with native radio controls, an alternate-color header and a review summary. Inspect… |
| [volvo-cars](volvo-cars.md) | Inspect Volvo Cars’ HTML-first web foundation, actual light-mode tokens and native selectable-card styling through a complete packing-plan example… |
| [vuestic-ui](vuestic-ui.md) | A native Vuestic critique worksheet with source-verified light and dark presets, accessible rating labels, textarea validation, a derived average and… |
| [w3c](w3c.md) | Build resilient reading interfaces with fluid type, semantic color roles and native collapsible content that remains readable without JavaScript. |
| [web-awesome](web-awesome.md) | Inspect Web Awesome’s actual semantic tokens across native custom elements, including scoped radius and spacing changes, shadow-DOM styling, select… |
| [wikimedia-codex](wikimedia-codex.md) | Use Codex’s real SearchInput anatomy, action hierarchy and reading-oriented tokens. Search a local article index, inspect a result and return to the… |
| [wonderflow-wanda](wonderflow-wanda.md) | Use Wanda’s real theme roles and token syntax in a complete feedback-reading workspace with topic filters, expandable evidence context and a… |
| [zendesk-garden](zendesk-garden.md) | A Garden guide for support work with real theme aliases, type and radius scales, a complete reply composer, visibility-aware local drafts and field… |

Original pages: `https://open-design.ai/design-system/<slug>/`.
