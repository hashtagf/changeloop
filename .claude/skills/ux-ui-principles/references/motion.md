# Motion — websites and product UI

Motion either **explains change** (feedback, continuity, state) or
**expresses the brand** (a hero moment, a reveal). Decide which job each
animation does; an animation with neither job is removed. Values here are
starting points. This file owns durations, easing, token names and the dial/baseline;
measured values are in [visual system](visual-system.md) Part C §7.

## 1. Motion level from the dial

The motion dial ([design direction](design-direction.md) §5) sets the budget.

| Dial | Allowed | Typical product |
|---|---|---|
| 1–2 | State feedback only: hover/press, focus, loading, toasts, dialog/drawer enter/exit | Finance back office, ops |
| 3–4 | + list/insert transitions, tab/accordion, skeleton → content, small page transitions; marketing pages also keep hero entrance and once-only section reveal (see baseline) | SaaS apps, consumer core flows |
| 5–6 | + scroll reveals (once), one signature hero motion, staggered sections | SaaS marketing, onboarding |
| 7–8 | + scroll-linked scenes, larger choreography, brand micro-moments | Brand and campaign pages |
| 9–10 | Motion is the content (interactive story, 3D) — needs a reason and a fallback | Campaigns, launches |

Above the dial is a defect, even if it looks good. **Below the baseline is
also a defect** — "no motion" is only correct when the user, DESIGN.md or the
context card says so. A public page ships the hero entrance and a once-only
section reveal at **any** dial, including 1–3 (owner of this rule).

**Baseline by page type** (use when no dial is given):

| Page | Minimum that must ship |
|---|---|
| Landing / marketing / portfolio (dial 4–6; a lower dial still ships the hero entrance and a once-only section reveal unless the context card states why not) | Hero entrance (headline → line → CTA stagger), one section-reveal style used on some sections (once), hover/press on every button and card link, smooth anchor scroll, one signature motion from the idea |
| Customer app screens (dial 3–4) | Press/hover states, dialog/drawer/toast enter-exit, skeleton → content, list insert/remove, tab/accordion transitions |
| Back office / ops (1–2) | Press/hover/focus, loading and saved feedback, dialog/drawer enter-exit; nothing decorative |

## 2. Types of motion

| Type | Use for | Duration / easing | Watch out |
|---|---|---|---|
| Micro-interaction | Hover, press, toggle, checkbox, copy-done | 100–150 ms, ease-out | Never delay the action itself |
| State feedback | Loading, success, error shake (small), saved | 150–300 ms | Text/icon must carry meaning without motion |
| Surface enter/exit | Dialog, drawer, popover, toast | 200–300 ms in, 150–200 ms out (exit faster) | Origin matches trigger; focus moves with it |
| Layout change | Insert/remove row, expand, reorder | 200–300 ms | Animate transform, not height on large lists |
| Page / view transition | Route change, list → detail | 200–350 ms; View Transitions API where supported | Never block navigation; keep scroll and focus sensible |
| Scroll reveal | Section entrance on marketing pages | 500–800 ms, rise 16–32 px + fade, **once** | Content visible without JS and when landing mid-page |
| Scroll-linked | Progress, parallax, pinned scenes | Tied to scroll, no easing | Motion sickness, scroll-jacking, mobile jank |
| Hero / brand moment | One signature motion that carries the idea | 600–1200 ms, once | One per page; must not delay reading the headline or CTA |
| Ambient loop | Gradient drift, subtle background | Slow (≥ 10 s), low amplitude | WCAG 2.2.2: pause control if > 5 s and alongside content |
| Data motion | Number count-up, chart draw | ≤ 600 ms | Final value readable instantly for screen readers; never on Critical numbers |

Easing: decelerate into place for entrances (`cubic-bezier(.22,1,.36,1)`),
accelerate out for exits, linear only for progress and scroll-linked. One set
of named motion tokens (`--dur-fast/base/slow`, `--ease-out/in/in-out`).

## 3. Website choreography

- **Order of attention:** headline → supporting line → CTA → visual. Stagger
  40–80 ms per item, total ≤ 400 ms. The CTA is never last by more than 300 ms.
- **First screen paints complete.** Motion starts from the rendered state or
  enhances it; no blank hero waiting for JS. LCP element is not hidden by an
  entrance animation.
- **One idea, one signature motion** — the motion should come from the page's
  idea sentence ([design quality](design-quality.md) §1), not from a library demo.
- **Neighbouring sections vary or stay still.** Not every section fades up.
- **No scroll-jacking** (overriding native scroll speed or snapping the whole
  page) unless it is the product's core experience.
- **Hover is a bonus**: anything revealed on hover must also be reachable by
  focus and by tap.

**Scroll-linked budget.** One scroll pattern per page, never on prose. Base CSS shows the end
state; the effect lives inside `@supports (animation-timeline: view())` and
`@media (prefers-reduced-motion: no-preference)`. Linear easing. Declare
`animation-timeline` after the `animation` shorthand, which resets it.

## 4. Accessibility

- `prefers-reduced-motion: reduce` → remove movement (translate, scale,
  parallax, auto-play), keep opacity, colour changes that carry state, or instant
  changes; never a blanket `0.01ms !important` that also kills feedback. Implement as the
  default branch, not an afterthought. [S16]
- Auto-moving content > 5 s next to other content needs pause/stop/hide
  (WCAG 2.2.2). [S92] Carousels never auto-advance by default.
- No flashing more than 3 times per second (WCAG 2.3.1).
- Motion never carries meaning alone; pair with text, icon or position.
- Focus follows surfaces that animate in; do not animate focus rings away.

## 5. Performance

- Animate `transform` and `opacity` only; avoid animating `width/height/top/left`,
  `box-shadow`, `filter: blur` on large areas.
- Use `IntersectionObserver` for reveals, CSS `animation-timeline: scroll()`
  or the library's scroll driver for scroll-linked — never an unthrottled
  `scroll` listener.
- Reserve space for anything that animates in (no CLS); keep INP unaffected
  (no heavy work on input).
- `will-change` only during the animation, on few elements.
- Pause non-essential loops when offscreen (`IntersectionObserver`) or the tab is hidden.
- Test on a mid-range phone; drop the effect if it stutters.

## 6. Tooling — reuse before adding

| Need | Prefer |
|---|---|
| Micro-interactions, enter/exit, reveals | CSS transitions/keyframes + a few lines of `IntersectionObserver` |
| Route/view transitions | View Transitions API (progressive enhancement) or the framework's |
| React component motion | Motion (Framer Motion) **if already in the project** |
| Complex timelines, scroll scenes | GSAP + ScrollTrigger **if already in the project** or the dial is ≥ 7 |
| Lottie / video | Brand illustrations designed for it; provide a static poster |

Adding a motion dependency is a scope change (ask; see
[design workflow](design-workflow.md) phase 5).

## 7. Motion spec (phase 4)

One short table per page; anything not listed does not move.

```
| Element | Trigger | Motion | Duration · easing | Reduced motion |
|---|---|---|---|---|
| Hero headline + CTA | load | rise 16px + fade, stagger 60ms | 600ms · ease-out | appear, no movement |
| Feature sections | enter viewport (once) | fade + rise 24px | 600ms · ease-out | appear |
| Pricing toggle | click | price cross-fade | 150ms | instant |
| Dialog | open/close | scale .98→1 + fade / fade | 200ms / 150ms | fade only |
```

### Reveal-on-scroll must not hide content

Content hidden until it scrolls into view must show when JavaScript fails, when
`prefers-reduced-motion` is on, in print, and in full-page screenshots. Set the
hidden state only under a class added by script, keep the observer margin small,
and never hide a whole section. A page that looks empty in a plain screenshot
is a defect, even if scrolling works. `render_check.js` scrolls before shooting,
so any gap it still shows is real.

## 8. Checks (phase 7)

- `node scripts/render_check.js <page> --reduced-motion` reports animations
  still moving under reduced motion and content left hidden (opacity 0) after
  load; `slop_check.py` flags motion with no reduced-motion path.
- Land mid-page via an anchor and refresh: nothing stays invisible.
- Keyboard through animated surfaces: focus lands inside and returns.
- Record a short video or several screenshots of the signature motion when
  reviewing; a single screenshot cannot show timing.

## Do / Don't

| Do | Don't |
|---|---|
| Give every animation a job (explain or express) and a dial budget. | Fade every section up because the template did. |
| Paint the first screen complete, then enhance. | Hide the hero until JS runs or an observer fires. |
| Exit faster than enter; decelerate into place. | Use browser default `ease`/`linear` for everything. |
| Make reduced motion the first branch you write. | Ship parallax and auto-play with no reduced-motion path. |
| Use one signature motion from the page's idea. | Stack parallax, tilt, glow and count-ups on one page. |

## Mechanics worth enforcing

Skip animation for actions repeated 100+ times a day. Never `scale(0)` or
`ease-in` for entrances; popovers grow from their trigger (origin-aware);
animate only `transform` and `opacity`; never `transition: all`; press feedback
`scale(0.97)`.
