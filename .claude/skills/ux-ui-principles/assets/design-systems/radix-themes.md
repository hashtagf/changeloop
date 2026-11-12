# Radix Themes — OpenDesign Application Guide

Original OpenDesign guidance. See the official Radix Themes documentation for component APIs and licensing.

## 1. Visual Theme & Atmosphere

### A Working Interface, Not a Mood Board

Radix Themes is a useful reference for products where people read, decide, enter information, and return to unfinished work. The visual character comes from measured spacing, restrained surfaces, a clear type hierarchy, and repeatable component states. Use this guide to build a project workspace, an account area, a settings screen, or a data review flow. The goal is a coherent working screen with real content, not a collection of attractive components arranged without a task.

### Choose the Right Starting Point

For a React application, start with the actual Radix Themes package and use its components before writing custom replacements. For a visual concept in another stack, use these principles as a reference and describe the result as inspired by the system. Radix Themes and Radix Primitives are different starting points: this guide concerns the styled Themes library. An OpenDesign guide does not turn an arbitrary HTML mockup into a native Radix implementation.

### Build Around a Concrete Task

Choose one primary action for the first screen, such as creating a project or saving account settings. Put the information required for that decision before the action. Keep navigation, object metadata, editable fields, and feedback visually distinct. Use realistic long titles, mixed status values, and an empty state while designing. A screen that only works with three short placeholder labels has not established a usable system.

### Tone and Content

Use short descriptive labels, specific verbs, and direct explanations. A button should describe what happens next: Save Changes, Invite Member, or Create Project. Reserve a heading for the subject of a section; avoid giving every small control a marketing slogan. When an action fails, explain what the person can fix and preserve their work. These are OpenDesign editorial recommendations for applying the reference, not additional APIs supplied by Radix.

## 2. Color Palette & Roles

### Separate Brand Color From Meaning

Choose an accent family for primary actions, selected controls, and a small number of emphasis points. Do not reuse that accent as the only signal for errors, warnings, or success. A green brand accent can coexist with a success message, but the message still needs explicit text and an appropriate icon. Define the semantic role first, then choose the visual treatment; this keeps the interface readable when themes or brand colors change.

### Use the Theme Rather Than Hard-Coding Screens

The official Theme configuration exposes accentColor and grayColor. Choose them at the root so components share the same decisions. In custom components, refer to the current theme's CSS variables rather than copying a color from a screenshot. The token reference below lists a compact working subset. A token is a role within a configured theme; it is not a guarantee that one hexadecimal value will remain the same across light mode, dark mode, and every accent choice.

### Surface and Border Hierarchy

Start with a quiet page background. Give cards and editable panels a distinct surface only when they group related work. Use separators for rows that belong to the same list. Avoid putting a border, shadow, tinted background, and badge around every item at once. In a settings screen, a single panel with divided rows is usually clearer than six floating cards. Keep hierarchy visible at low contrast without making essential text faint.

### Light and Dark Appearance

Use the official appearance setting for native components and verify both appearances with the same content. Do not derive a dark screen by blindly inverting colors or reusing light-mode shadows. Check overlays, inactive fields, separators, selected rows, and text on accents individually. The interactive study on this page demonstrates a small set of theme choices; the official playground is the reference for the complete library and its native behavior.

### Contrast and Redundant Cues

Check the final foreground/background pairs after changing the accent or surface. Combine color with text for statuses such as Pending, Complete, and Failed. Include a check mark or another visible distinction for selected options. Do not assume an accessible component library makes every content or theme combination accessible: your labels, nesting, custom CSS, and information order still affect whether the complete screen can be used.

## 3. Typography Rules

### A Deliberate Reading Hierarchy

Give the screen one clear title, then distinguish section headings, body text, field labels, and supporting metadata. Use the smallest number of sizes that explains those relationships. Dense product screens need readable labels more than oversized display type. Keep a descriptive paragraph close to the control it explains, and keep labels visible after an input receives a value. Placeholder text is a hint, not a replacement for a field label.

### Type Scale and Weight

Radix documents a nine-step typography scale with paired font sizes, line heights, and letter spacing. The reference table on this page preserves those values at the base scale. Choose a step as a complete combination rather than mixing an unrelated line height with it. Use regular weight for body copy and a stronger weight for headings or selected labels. Bold everything and the hierarchy disappears; lighten all secondary text and the screen becomes difficult to read.

### Font Choice and Fallbacks

Radix Themes defaults to a system font stack. Retain that stack when portability is more important than a particular brand typeface, or configure a licensed font through the documented customization mechanism. The surrounding OpenDesign site uses Albert Sans; that does not make Albert Sans the official Radix font. For multilingual applications, test representative Chinese, Japanese, Korean, and long European-language labels in the actual fallback fonts.

### Numbers, Code, and Wrapping

Keep numerical columns aligned so values can be compared vertically. Use a monospaced treatment for code, identifiers, and tokens where character boundaries matter. Allow titles and descriptions to wrap naturally; do not clip critical instructions merely to preserve card height. For a genuinely unbroken string such as an ID, provide a controlled wrap or copy action. On mobile, keep the full meaning available even when the layout changes.

### Content Length Is Part of the Design

Test a long project name, a two-line member role, and a translated action before calling a component reusable. Let buttons grow where possible instead of giving every button a fixed width. Keep body paragraphs to a comfortable reading measure, and use lists or a table when the user needs to compare parallel facts. Do not break explanatory text into many tiny decorative cards simply to make the page look more designed.

## 4. Component Styling & States

### Buttons and Action Hierarchy

Within one action group, identify the primary decision and give it the strongest treatment. Secondary actions should remain easy to find without competing equally. Separate destructive actions from ordinary confirmation. During submission, prevent duplicate operations and give visible progress; after completion, show the actual result. A disabled button should have an understandable reason nearby when that reason is not obvious from the form.

### Inputs and Forms

Place a persistent label above or alongside each input. Keep help text next to the relevant field, and attach validation messages to the field rather than only showing a generic banner. Preserve entered values when validation fails. Group related fields under a meaningful section heading. Use the appropriate input type and autocomplete value so the browser and assistive tools can help the person complete the task.

### Cards, Lists, and Tables

Use a card for a self-contained object with a meaningful summary and action. Use a list for a sequence of similar records, and a table when people need to compare attributes across records. Show actual fields such as owner, update time, and status rather than decorative chart fragments. A card should not be clickable in a way that competes with nested links or buttons; choose a clear link target and preserve normal keyboard behavior.

### Navigation and Selection

Keep global navigation separate from page-level tabs and local filters. The active destination should remain identifiable without relying only on accent color. Use links for navigation and buttons for in-place changes. If you implement a tab pattern, include its keyboard behavior; otherwise use a clearly labeled group of ordinary buttons. Do not make a row of visually styled spans look interactive when it cannot be operated.

### Menus, Dialogs, and Overlays

Use the native library component for complex behavior when implementing a React product. A dialog needs a title, a clear dismissal path, appropriate focus management, and a return to the triggering control. Avoid building a modal from an absolutely positioned card without those behaviors. Keep the dialog focused on a single decision; longer editing workflows often deserve their own page instead of an increasingly crowded overlay.

### Loading, Empty, Error, and Success

Design each state against the same real task. An empty project list should explain how to create the first project. A loading state should preserve enough structure to avoid a disruptive jump. An error should offer a meaningful next action and should not erase completed work. A success message should identify what changed. Static specimen buttons on this page demonstrate appearance; they do not prove production behavior for those states.

## 5. Layout, Spacing & Density

### Use a Shared Spacing Scale

The documented spacing scale has nine base steps: 4, 8, 12, 16, 24, 32, 40, 48, and 64 pixels. Use small steps inside tightly related controls and larger steps between independent sections. Maintain a visible relationship between a heading and its content. Do not distribute blank space evenly just to fill the screen: proximity should communicate which pieces of information belong together.

### Density Follows the Job

A resource directory needs enough visible entries to support comparison. A configuration form needs room for labels, help, and errors. A reading page needs a stable measure and a visible outline. Choose density for the task rather than applying the same card size everywhere. Radix also exposes a scaling setting that adjusts related dimensions together; evaluate the resulting readability and targets before making a compact scale the product default.

### Grid and Container Behavior

Start with a page container, then define the primary content and any supporting rail. Keep long text in a readable column even when the outer canvas is wide. At narrower widths, move supporting content below the main content or convert a long rail into an accessible local navigation control. Maintain source order so the mobile flow and keyboard order make sense without depending on the desktop grid placement.

### Rows Before Nested Cards

For a compact token reference, place name, value, and usage on one scan line. For a catalog, keep the title, category, description, and destination together. Repeated nested boxes add visual noise and consume width that should belong to the content. Prefer a thin separator between related rows; reserve an enclosed panel for a genuine change in context such as a live preview or code example.

### Keep the Important Content Visible

Do not reduce a detailed guide to short summaries just to make the page shorter. Provide a table of contents and strong subheadings so people can enter at the relevant point. If a filter or accordion changes visibility, the empty state and selected state should be clear. Avoid an independently scrolling inner list unless it solves a real interaction need; ordinary page scrolling is usually easier for a long resource collection.

## 6. Radius, Depth & Motion

### Radius Is a Relationship

Radix offers named radius settings and contextual component behavior. Choose a setting at the theme level instead of assigning the same arbitrary radius to every element. A button, a checkbox, and a large panel have different structural roles. Keep their shapes related without erasing those roles. If your own component uses a radius token, test it beside a native button and field before deciding that it belongs to the same system.

### Elevation Explains Layers

Use depth to distinguish an overlay from its underlying page or an interactive panel from a quiet canvas. Radix provides a six-step shadow scale. Avoid treating the shadow index as a decorative popularity ranking for cards. A dense catalog can often work with borders alone. Review shadows in both appearances; a light-mode blur copied onto a dark surface can disappear or create a halo that suggests the wrong depth.

### Motion Should Clarify a Change

Use short transitions to explain selection, opening, progress, or movement between related states. Do not delay content behind an entrance animation. Avoid continuous background motion in a work-focused screen. Respect reduced-motion preferences and keep the final state legible when transitions are removed. Timing choices in a custom implementation are application decisions; this guide does not invent an official Radix duration token where none has been verified.

### Interaction Without Decoration

A hover treatment should reinforce that an element can be operated. A focus treatment should remain clearly visible against adjacent surfaces. Do not move an entire dense row so much on hover that the information shifts while someone is reading it. On touch screens, essential actions must remain available without hover. The effect is successful when it helps the user understand the control, not when it draws attention to the animation itself.

## 7. Do’s & Don’ts

### Do: Establish One Complete Screen

Build a screen with its real navigation, meaningful content, primary action, and at least one exceptional state. Review the screen before extracting dozens of reusable components. Record deliberate choices such as the accent, density, typography steps, and empty-state wording. This gives a coding agent a specific contract to follow and makes deviations easier to spot during later iterations.

### Do: Keep Native and Custom Work Consistent

Prefer the library's existing components for behavior that it already supports. Use theme variables in custom wrappers, and check those wrappers in both appearances. Preserve labels and semantic HTML while styling. When the project has an existing design system, compare it with this reference before replacing it; a second uncontrolled theme layer can introduce more inconsistency than it removes.

### Don’t: Recreate a Brand by Swapping Colors

Changing the accent alone does not establish a coherent interface. Spacing, type, content hierarchy, interaction patterns, and responsive choices carry much of the visual identity. Do not claim an official integration just because a mockup resembles the library. Avoid copying another product's trademark, proprietary assets, or business claims into a new product screen.

### Don’t: Trade Meaning for a Cleaner Screenshot

Do not remove explanatory text, field labels, error messages, or useful metadata merely to reduce visual clutter. Improve grouping and hierarchy first. Avoid tiny low-contrast captions as a shortcut to density. Keep a screen honest about its content: a realistic paragraph, a long file name, or a multi-line status message is part of the interface, not an inconvenience to hide.

## 8. Responsive & Accessible Behavior

### Adapt the Structure Before Shrinking It

When the screen narrows, reduce columns, shorten the path to the main action, and move secondary information into the normal reading flow. Do not scale a desktop dashboard down as one image and call it a mobile layout. Keep the same content available, using wrapping, stacking, or an appropriate table treatment. Preserve descriptive link text so a destination still makes sense outside its surrounding desktop card.

### Use the Documented Breakpoints Intentionally

The official breakpoint names are initial, xs, sm, md, lg, and xl. Their minimum widths are 0, 520, 768, 1024, 1280, and 1640 pixels. Treat them as available tools, not mandatory layout changes at every step. Add a breakpoint when the content needs a different arrangement. Test a width between named breakpoints as well as the breakpoint itself to find fragile intermediate layouts.

### Keyboard and Focus

All meaningful actions need a keyboard path. Make the visible focus state distinct from hover, and keep it visible when a container clips its content. Avoid positive tabindex values that reorder controls unpredictably. After a filter changes results, keep focus on the control and expose a concise result count. After closing a modal, return focus to a sensible place rather than leaving the person at the beginning of the document.

### Labels, Targets, and Assistive Text

Give icon-only actions an accessible name that states the action, not the shape of the icon. Make touch targets comfortable even when the visual icon is small. Keep decorative icons out of the accessibility tree. Expose updates such as saved changes or search result counts without repeatedly announcing unrelated content. When a state uses both icon and text, avoid giving a screen reader the same message twice.

### Validate With Real Content

Check a desktop, a tablet, and a narrow phone. Include text expansion, a missing image, an empty list, and a long unbroken identifier. Test the page with reduced motion and with keyboard navigation. Inspect both appearances after any substantial color change. Automated checks can find structural problems, but they cannot decide whether the hierarchy, content density, and overall visual character meet the intended product needs.

## 9. Agent Prompt Guide & Implementation

### Prepare the Project Context

Tell the coding agent what is being built, who uses it, the main action, and which existing files define the current design. Attach this guide as a reference rather than asking it to imitate an unspecified screenshot. If using React, state that native Radix Themes components should be preferred. If using another stack, ask for an explicitly labeled interpretation and review the additional interaction work it will require.

### Specify a Complete First Pass

Ask for one working screen with real content and a small set of states. Specify the navigation, fields, object metadata, and expected result of the primary action. Include keyboard focus, an empty state, validation, and a narrow layout in the request. Name the constraints that must remain, such as an existing header, a production data contract, or a previously approved content block.

### Review in an Order That Finds Real Problems

First verify that the screen supports the intended task. Then compare the information hierarchy, spacing, typography, and colors with the chosen reference. Finally test the interactive states and responsive layouts. Do not accept a visual change merely because the page compiles or because a screenshot looks tidy. Check that longer content, errors, and repeated actions still work after the visual adjustments.

### Extend Through Explicit Decisions

Once the first screen works, record the theme configuration, type roles, spacing choices, and component patterns that should repeat. Ask the agent to apply those decisions to the next screen without silently rewriting accepted content. When a new screen needs a different pattern, document the reason and check the earlier screen for consistency. Extend from verified behavior rather than generating a large collection of superficially similar pages.

### Known Scope and Source Boundaries

This is an OpenDesign-authored application guide, not an official Radix specification or a guarantee of compatibility with every framework. The numerical reference is drawn from the linked Radix documentation. The illustrated workspace and component specimens are local HTML/CSS studies. Consult the installed package documentation for current APIs, and review the source repository's license before distributing third-party code. The downloadable guide contains this original guidance, not a redistributed copy of the library.

## Starter Prompt

Read DESIGN-radix-themes.md before making changes. Build a responsive project workspace for a small design team using native Radix Themes components where possible. Include a project list with owner and status, a create-project flow, and workspace settings. Use a green accent, a neutral surface hierarchy, a clear type scale, and consistent spacing. Preserve our existing site navigation and content. Include loading, empty, validation, and success states; visible keyboard focus; and a narrow-screen layout. Explain any deviations from the guide. Start with one complete screen before extending the system.

## Sources

https://www.radix-ui.com/themes/docs/overview/getting-started
https://www.radix-ui.com/themes/docs/theme/color
https://www.radix-ui.com/themes/docs/theme/spacing
https://www.radix-ui.com/themes/docs/theme/typography
https://www.radix-ui.com/themes/docs/theme/radius
https://www.radix-ui.com/themes/docs/theme/shadows
https://www.radix-ui.com/themes/docs/theme/breakpoints
