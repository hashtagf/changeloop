# Visual assets — where the pictures come from

[design-quality.md](design-quality.md) says what to avoid; this file says what
to put there instead. Read it for any public page (landing, marketing, product,
service) and for any page where the brief supplies no photography or brand
illustration. A page that follows the avoid-list but adds no visuals comes out
as text on a background, which reads as unfinished, not as restrained.

## 1. Every section gets a visual anchor

A **visual anchor** is the one non-text element a section is built around: a
working product fragment, a composed product scene, a diagram, an
illustration, a photo, an icon-led list or a figure/number band.

- Hero: one bespoke anchor taking roughly 40–55% of the width on desktop.
- Content sections: an anchor in most of them. Text-only is allowed for FAQ,
  legal, the form itself and one deliberate "statement" section; write the
  reason in the plan.
- Vary the anchor type between neighbouring sections (fragment → diagram →
  icon list → scene), and alternate which side it sits on.
- Count before shipping: if more than a third of content sections are
  text-only, the page fails the critique ([design-quality.md](design-quality.md) §5).

## 2. Source ladder — use the highest rung available

| Rung | Source | When | Notes |
|---|---|---|---|
| 1 | Client assets: photos, screenshots, brand illustration | Supplied or on the client site | Always first; ask for them |
| 1b | Open-collection photographs (Wikimedia Commons, Openverse, museum collections) | No client photos, and an honest picture of the subject's world exists: a studio, hands, a tool, a place | See §2b: licence, credit, treatment, never presented as the client's own |
| 2 | Working product fragments in HTML/CSS | Software, apps, services with a UI | Real labels, believable data, real interface size, operable where useful |
| 3 | Composed product scene | Hero of a software page | 2–3 fragments layered (main panel + phone + notification/chip), on a field of brand colour, slight overlap; no tilt, no laptop frame |
| 4 | Diagram in inline SVG | Process, data flow, integrations, architecture, timelines | Real step names; nodes and connectors in the palette; text labels in HTML or SVG `<text>` |
| 5 | Illustration in inline SVG | Concepts with no UI (security, people, places) | Built from the subject's shapes, 2–3 palette colours, one style per page |
| 6 | Icons from one open family | Feature lists, contact rows, process steps, nav of services | See §3 |
| 7 | Pattern or texture from the subject | Section fields, footers | Calendar grid, map contour, receipt perforation; low contrast, decorative `aria-hidden` |
| 8 | Generated images | Only when a generation tool is available and the user agrees | Mark as generated; never present as real customers, staff or offices |

**Generated images as a reference pass.** When a generation tool exists, use it for a
direction board (mood, material, colour; no UI) or a paintover of the current screenshot.
Take palette, density and proportions from it, then build in code. A generated image is
never the delivered UI.

### 2b. Open-collection photographs

`assets/photos/` holds 15 already-licensed stand-ins (coffee roasting, concrete, stage
light, street food, misty forest, a potter's hands, type cases, a wet street at night, a daylit dental room …)
with credits in `credits.json`; use one when the subject matches and web search is not
available, credit it, and list it in the hand-off as a picture to replace.

#### Finding more

A page with no photographs reads as unfinished; four to six real pictures lift
it more than any amount of drawing. Do this when the client has none:

1. **Search the subject's world, not the category**: the craft, the tool, the
   room, the material (for an agency: a print studio, hands sketching, a desk in
   daylight), not "business team". Prefer a documented library when the host
   offers one; otherwise `python3 scripts/photo_search.py "<the room>" "<the tool>"`
   (Commons, `--source both` adds Openverse; licences already filtered) and
   `--download <project>/img --pick 2,5 --name a,b`, which writes `credits.json`.
   Open each candidate before choosing: reject clutter, staged stock, and people who
   could pass for the client's staff or patients.
2. **Licence**: allow CC0, public domain, CC BY and CC BY-SA; reject
   non-commercial and no-derivatives licences for a commercial page. Record
   title, creator, licence and page URL for each.
3. **Credit on the page**: one line in the footer, "Photographs: creator
   (licence), …", each linked to its source page. Do not write sentences about
   where pictures come from beside the picture; a caption says what it shows.
4. **Honesty**: a found picture shows the world around the client; never present
   it as the client's own team, office, product or customer. Say in the hand-off
   which pictures are stand-ins to replace.
5. **Treatment**: one treatment for all pictures (greyscale with contrast, a
   single tint, or natural with slightly lowered saturation) so mixed sources
   look like one set; crops share one ratio family; radius follows the direction.
   Print-led directions (Halftone, Riso, Paste-up, Newsprint) print their pictures:
   `python3 scripts/halftone.py` makes a real one-ink dot screen whose dots follow the
   picture's darkness. A CSS dot pattern over a photo reads as a filter, not print.
   Halftone only photos with clear shapes; a dark, busy one goes muddy, so use it as a
   one-colour duotone band.
6. **Technical**: size to the layout (`sizes`), give each an `alt` that describes
   it (swap with the language on bilingual pages), load the first-screen picture
   eagerly, and make a failed load degrade to the slot colour, not a broken icon.
   A full-page screenshot of lazy images can show empty slots; `render_check.js`
   forces them eager and reports any that fail to load.

Never use: grey-bar fake dashboards, stock "handshake" photos, gradient blobs
as the whole visual, logos or testimonials the client did not supply.

## 3. Icons on marketing pages

Icons are welcome on public pages when they help scanning: feature lists,
service menus, process steps, contact methods, deliverables, comparison rows.

- **One family**, one stroke width, one size per context. Free families with
  wide coverage: Lucide, Phosphor, Tabler, Heroicons. Default to Lucide and paste only
  the icons you use: `python3 scripts/icons.py lucide phone map-pin calendar-check`
  (inline SVG) or `--sprite icons.svg`. Brand marks (LINE, WhatsApp, Facebook, payment
  networks) come from Simple Icons via `icons.py brand line --ground <ground hex>`, under the
  trademark rules in [iconography.md](iconography.md) "Icon libraries".
- **Always with a label**; decorative icons get `aria-hidden="true"`
  ([iconography.md](iconography.md)).
- **Containers are allowed** when consistent: plain glyph, or a 40–48px circle
  or rounded square in a tint of the field colour, but not repeated as rows of
  identical card tiles ([design-quality.md](design-quality.md) §2). Pick one treatment per page.
- Sizes: 20–24px in lists; 32px as a step marker (icon sizes: [visual-system.md](visual-system.md)); never as hero art.
- Meaning must match: a plug for integrations, a calendar for scheduling; if
  no glyph fits honestly, drop the icon rather than force one.

## 4. Section recipes with anchors

| Section job | Anchor | Composition |
|---|---|---|
| What we build / features | Bento: one large working fragment + 2–3 smaller tiles, each with icon + title + one line | Asymmetric grid; tiles differ in size and content type |
| Feature deep-dive | Fragment beside 3–4 icon-led points | Alternate sides per feature |
| How it works | SVG process diagram or timeline with icon nodes | Horizontal on desktop, vertical on phone |
| Plan, estimate, pricing | Interactive fragment: chosen option updates bars, dates or totals | Bars or Gantt strip rather than a plain list |
| Choosing a physical product (drinks, dishes, bags, sizes) | Cross-section or anatomy infographic in inline SVG, drawn in the subject's own vessel or package shape (cup layers, what is in the bag, size beside size) | One row before the menu or price list; parts told apart by fill **and** pattern, a part list beside each item in the same order as the drawing, a text summary for screen readers. General-knowledge proportions are labelled "approximate"; anything specific to the client is a placeholder, never invented |
| What you get | Icon list beside an artefact preview (report page, invoice, export) | Split 50/50 |
| Integrations, stack | Diagram of the real systems, or text chips of the real tools | No borrowed vendor logos without permission |
| Proof | Real numbers, quotes, logos only from the client | Otherwise omit the section and list it in hand-off |
| Contact | Form + icon contact rows | Form in a panel; icons for email/phone/location |
| Footer | Brand field colour, wordmark, pattern from §2 rung 7 | Designed close |

**Texture budget.** One texture family per page (grain, halftone, misregistration or
scanline). Opacity ≤ 0.08 page-wide, ≤ 0.05 under body text; never animated; overlays get
`pointer-events: none` and `aria-hidden`; CSS or data-URI only.

**Photo balance.** Below the hero, photographs cover at most a third of the page and never
lead two sections in a row. Text over a photo sits on its calmest part, over an ink scrim on
that side only, at 4.5:1.

## 5. Mockups and frames — when they are fine

- A **phone outline** is fine on app pages, where it tells the visitor the
  platform; keep it a simple rounded rectangle, content at or above the minimum text size ([visual-system.md](visual-system.md)).
- A **window chrome strip** (title bar with the product name) is fine when it
  identifies which product the fragment belongs to; no fake traffic lights.
- Shrinking a full screenshot until text is unreadable is not fine; crop to the
  part that proves the claim and show it at real size.

## 6. Checks

1. Each content section names its anchor and rung in the plan.
2. Hero anchor is bespoke (rung 1–3), not an icon or blob.
3. Neighbouring sections use different anchor types.
4. One icon family, labels present, decorative icons hidden from AT.
5. Fragments use real labels and believable data; sample data is listed for the client.
6. Screenshots at desktop and 390px reviewed: anchors visible, readable, no overflow.

## Do / Don't

| Do | Don't |
|---|---|
| Give each section one anchor and vary its type. | Ship five sections of heading + paragraph. |
| Build product fragments and diagrams when no photos exist. | Leave space empty because mockups and icons are on the avoid list. |
| Fill a missing-picture slot, or a section that would reuse a photo, with a one-line spot drawing of an object from the subject (a shopfront with its awning, a coffee bag, a cup) in the accent, plus the placeholder label. | Ship an empty tinted box with "[photo]" in it, or recrop the hero photo for a second section. |
| Use one icon family with labels for scannable lists. | Mix icon sets or use icons as the only label. |
| Compose 2–3 fragments into a hero scene on a field of colour. | Put a shrunken screenshot in a laptop frame. |

## No system display face, no geometric masks

Source and self-host a face that matches the approved lettering; the closest
installed font is a failure. A circle or polygon cut-out standing in for a photo
subject is worse than omitting the effect: use a real alpha matte or a cut-out
asset.
