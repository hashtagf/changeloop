# Advanced components, flows and interaction states

Rules for the components that are hard to get right. Picture: back-office screen `advanced`
(`assets/backoffice/previews/<look>-advanced.jpg`). Basics are in
[components usage](components-usage.md) and [component states](component-states.md).

## Editable grid cell
- Enter, F2 or double-click edits; Enter commits and moves down, Tab moves right, Esc cancels and restores.
- Validate on commit, not per keystroke. Invalid: red outline, reason under the grid and in `aria-describedby`; keep the edit open.
- Saved: brief green tint, then back to normal; no toast per cell. Failed save keeps the typed value with a retry.
- Read-only cells look read-only (no hover affordance). Announce "editing, row 2, Amount".

## Drag to reorder
- Handle `⋮⋮` is the only drag target; the row keeps normal click behavior.
- Lifted row: shadow, slight rotation allowed, accent border; the origin stays as a dashed ghost; a 3px accent line shows the drop point.
- Always give a keyboard path: Space lifts, arrows move, Space drops, Esc cancels, with live announcements ("Approve amount, position 2 of 4"). Also offer Move up / Move down in the row menu.
- Save order on drop with undo; do not reorder silently on error.

## Color picker
- Parts: 2D area, hue slider, swatches, hex field. Every part keyboard-operable; hex is the source of truth.
- Show contrast against the real background (AA badge); warn, do not block, below 4.5:1 for text.
- Never ask for color alone to carry meaning; pair with a name.

## Rich-text editor
- Toolbar with pressed states; bubble menu on selection (bold, italic, link). Shortcuts shown in tooltips.
- Show save state ("Saved as draft") and a counter when there is a limit. Paste strips foreign styles by default.
- Toolbar is a `toolbar` role with arrow-key navigation; the editor has a label and visible focus.

## Mention and tag input
- `@` opens a list of people with avatar, name, role; up/down choose, Enter adds, Esc closes.
- Tags are removable (✕ and Backspace); comma or Enter creates a free tag when allowed.
- Announce results count; keep the list under the field, never over what is being typed.

## Notification centre
- Bell with a count badge (cap per [components-usage.md](components-usage.md), 99+); the panel has All / Unread / Mentions, groups by day, "Mark all read", link to settings.
- Unread = tinted row plus dot (not color alone); each row says who, what, when, and opens the thing.
- Empty state says what will appear here. Do not auto-open; do not play sound by default.

## Onboarding tour
- Max 4 steps, each tied to a real control; non-modal spotlight (dim the page, ring the target), focus moves to the card, Esc or Skip closes and returns focus.
- Always "Skip tour" and "Back"; show "Step 2 of 4". Never start twice automatically; offer "Show tour again" in help.
- Do not block the task: the tour is skippable and resumable.

## Multi-step form with autosave
- Stepper shows done / current / upcoming with text, not color alone; done steps are reachable.
- Autosave on blur and every few seconds; show "Saved 12:41", "Saving…", or "Offline, kept here, retrying". Say how long drafts are kept.
- Warn before leaving only when there are unsaved changes; the final step shows a review, not a surprise.
- Errors are per field and per step; Back never loses data.

## Password recovery
1. Ask for email; say a link is sent **if** the account exists.
2. Same message whether or not the account exists; link expiry stated; resend with a countdown.
3. New password: length over composition rules, paste allowed, strength meter with text, show/hide.
4. Done: other sessions signed out, go to sign in. Expired link: one clear action to request a new one.

## Interaction states
Owned by [component states](component-states.md) (states, focus ring spec, touch rules).
