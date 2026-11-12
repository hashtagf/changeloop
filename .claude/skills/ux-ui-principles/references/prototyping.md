# Producing design deliverables

This skill produces designs directly, without other tools: written specs,
text wireframes and working HTML prototypes. Choose the lightest deliverable
that answers the question; render and check anything visual
([render-verification.md](render-verification.md)).

## Choose the deliverable

| Question being answered | Deliverable | Fidelity |
|---|---|---|
| Is this the right structure and flow? | Flow list + text wireframe per page | Low |
| What exactly should be built? | Page spec ([page-spec.md](../assets/page-spec.md)) with wireframe and state table | Medium |
| Will it look and feel right; can people try it? | HTML prototype with real content, states and both themes | High |
| Which of several options? | 2–3 variants of the same page with identical content | Medium–high |
| Is the design system coherent? | Foundations sheet + component sheet (all states) as HTML | High |

## Text wireframes

Use boxes to show regions and priority, not pixels. Label regions with real
content examples and note responsive changes.

```text
┌ Page header: คิวตรวจถอนเงิน · อัปเดต 14:44 ──────────────── [ตัวกรอง] ┐
│ Queue (oldest first)         │ WD-2048 · รอตรวจ · SLA 12/30 นาที      │
│ [ค้นหา] [ทั้งหมด|เกิน SLA]   │ ฿125,000 → กสิกรไทย ****4821            │
│ ▸ WD-2041 ฿210,000 เกิน SLA  │ หลักฐาน: KYC ✓ · ความเสี่ยง กลาง (2 เหตุผล) │
│   WD-2047 ฿48,000            │ [ปฏิเสธ…]                    [อนุมัติ…] │
└──────────────────────────────┴────────────────────────────────────────┘
Compact (below 1024px): list only → select → detail with "← กลับไปที่คิว"
```

## HTML prototypes

A prototype is a design artifact, not production code. It must still be
honest about what it demonstrates.

**Structure**
- Tokens first: a `:root` block with color roles (light + dark), type styles,
  spacing, radius, elevation ([visual-system.md](visual-system.md)).
  Every color in the page comes from a token.
- Semantic HTML: landmarks, headings in order, native controls, labels.
- Real content in the user's language; realistic data volume; marked as sample data.
- Responsive from the start: content-driven breakpoints; check 390 px and 320 px.

**States**
- Build the states from the page spec, not only the happy path: loading,
  empty, error, permission, pending, success.
- Add a clearly labeled demo control strip to switch role, simulate failure,
  or trigger timeouts, so reviewers can see every state.

**Behavior**
- Forms validate as specified; errors are linked; input preserved.
- Consequential actions show the review/confirm step.
- Focus moves as specified after actions; live regions announce results.

**Variants**
- When asked to "try another color/layout", add a switch between complete
  variants on the same page rather than replacing the original, so options can
  be compared ([color-palette.md](color-palette.md)).

**Verify before presenting**
- Run `scripts/render_check.js` and inspect screenshots; run `scripts/contrast.py --css <page>`
  on the token blocks; drive the critical journey and one failure path.
- State what the prototype does not prove (real data, API latency, screen
  readers, real users).

## Hand-off package

| Item | Content |
|---|---|
| Page spec | Required rows for the tier |
| Wireframe or prototype link | Wide and compact |
| Foundations | Tokens used, any new tokens with reason |
| Components | Which components, variants, states ([components-usage.md](components-usage.md)) |
| Copy | Final strings, glossary terms, error messages |
| Acceptance | Scenarios incl. failure path; design QA list ([measurement.md](measurement.md)) |
| Open questions | Assumptions and risks |

## Do / Don't

| Do | Don't |
|---|---|
| Use real Thai copy and realistic data. | Present lorem ipsum or three placeholder rows. |
| Show error, empty and permission states. | Demo only the happy path. |
| Keep variants side by side for comparison. | Overwrite the previous option when asked to "try another". |
| Render and check before presenting. | Send a prototype that was never opened at phone width. |

## Wireframe deliverables (greybox, annotated, flow, sketch)

Use when the question is structure, not skin. Medium-grey blocks with crisp darker borders so the thumbnail does not
read blank; placeholder text as grey bars; images as a rectangle with a diagonal cross; exactly one accent (a redline)
reserved for annotations in monospace. **Annotated**: a browser-chrome canvas on the left, numbered pins on regions, a
narrow spec panel on the right turning each pin into one engineering or UX note. **Mobile flow**: 3 to 4 phone frames in
a row, connectors labelled verb-first with a number ("1 tap Start"). **Sketch**: loose connectors and notes are fine,
the blocks stay clean. Ignore finished-UI tokens here; do not add real brand color or copy.
