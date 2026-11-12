# shadcn/ui rules and design-system pages

For projects using shadcn/ui. Run the CLI through the project's runner
(`npx shadcn@latest`) and read `info` for base (radix vs base), icon library and
aliases first.

## 1. Critical rules

- Forms: `FieldGroup` + `Field`; grouped checkboxes/radios in `FieldSet` +
  `FieldLegend`. Invalid: `data-invalid` on `Field`, `aria-invalid` on the control.
- Spacing with `gap-*` (`flex flex-col gap-4`), never `space-x/y-*`; `size-*`
  when width = height; `truncate` shorthand; `cn()` for conditionals.
- Colour through semantic tokens (`bg-primary`, `text-muted-foreground`); no
  `className` colour/typography overrides on components; no manual `dark:` colours.
- Status colours via `Badge` variants or a semantic token; never raw
  `text-emerald-600`. If no success token exists, add a CSS variable.
- Overlays: no manual `z-index`; `Dialog`/`Sheet`/`Drawer` always have a Title
  (`sr-only` if hidden); `TabsTrigger` inside `TabsList`; items inside their Group.
- Use components before custom markup: `Empty`, `Skeleton`, `Alert`, `Badge`,
  `Separator`; view-mode sets of 2–5 use `ToggleGroup` (ranges: [components-usage.md](components-usage.md)); 2–6 form answers use `RadioGroup`; `Avatar` needs a fallback.
- Buttons have no loading prop: `Spinner` + `disabled`; icons use
  `data-icon="inline-start|inline-end"` with no sizing classes.

## 2. Use-what-exists ladder

Controls: native → headless primitive → hand-rolled (last). Styling: design
system → extracted component → semantic token → one-off utility. Extract a
component on the second reuse.

## 3. Presets and upgrades

Never decode preset codes by hand (`preset decode|resolve`). Before switching,
ask: overwrite, partial (`apply <code> --only theme,font`), merge or skip. Preview
upstream changes with `add --dry-run` / `--diff`; never `--overwrite` without
approval.

## 4. Control heights move together

Changing the button height means changing input, select, tabs, toggle, OTP and
command too. Grep `h-8` / `size-8` first and change them in one pass.

## 5. Design-system page

Order: foundations → tiered components → edge cases → do/don't pairs → recipes.
Colour roles show surface + foreground + measured contrast. Primitives get a
full variant × state matrix, composed components a typical example plus
additions. Render the awkward cases (long text, empty, error).

**Pinned-state matrix:** render hover, focus and active without interaction by
overriding the variants with a `[data-preview~=…]` attribute; leave a column
identical where the spec says the state does not change.
