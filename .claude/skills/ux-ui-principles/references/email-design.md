# Email design — layout, build and client limits for HTML email

How to design and build HTML email that survives real mail clients: layout,
type (Thai included), dark mode, images-off, buttons, accessibility, testing and
per-type templates. *What* to say and when to send lives in
[notifications.md](notifications.md); wording rules in [content-design.md](content-design.md);
Thai type pairing in [visual-system.md](visual-system.md#thai-with-latin-display-faces).
Source IDs resolve in [sources.md](sources.md); others are listed at the end.

## Transactional vs marketing

| | Transactional (receipt, OTP, booking, reset) | Marketing (campaign, newsletter, promo) |
|---|---|---|
| Job | Prove an outcome, carry a reference | Persuade one action |
| Layout | Single column, text-first, data table for facts | Single column, hero image allowed, 1–3 content blocks |
| Images | Logo only; nothing needed to understand it | Allowed, but the message must survive images-off |
| CTA | One, often secondary to the facts | One primary; repeat once at most |
| Unsubscribe | Not for required service mail; offer preference link | Required, visible, one click (see Footer) |
| Sender | Separate address/subdomain from marketing (e.g. `no-reply@notify.` vs `news@`) | Own subdomain so its reputation can't sink receipts |

Separating streams by subdomain is this skill's recommendation; it protects
transactional deliverability.

## Layout and width

| Decision | Value | Why |
|---|---|---|
| Content width | 600px (up to 640px) container, `width:100%; max-width:600px` | Fits preview panes and mobile scaling; common industry default |
| Columns | One. Two only for short pairs (label/value, product thumb + text) that stack on mobile | Multi-column breaks in Outlook and on phones |
| Gutters | 24px desktop, 16px mobile | Matches app phone gutter |
| Mobile | Fluid-hybrid: tables at 100% width with max-width; `@media` only as enhancement | Some clients (e.g. Gmail with non-Google accounts) drop `<style>` |
| Structure | `<table role="presentation">` for layout; `<div>` inside cells is fine | Classic Outlook for Windows renders with Word, which ignores most `div` layout, flex, grid, `max-width` |
| CSS | Inline styles on elements; `<style>` in head only for media queries, dark mode, resets | Inlining (Maizzle, MJML, Juice) at build time, not by hand |
| Size | Keep HTML under ~100KB | Gmail clips messages over ~102KB and hides the rest (including footer and unsubscribe) behind "View entire message" |

For Outlook-only fixes use conditional comments (`<!--[if mso]>…<![endif]-->`)
for ghost tables that fix width. Never JavaScript, forms, video, `position`,
external CSS files, or SVG as the only image — support is missing or inconsistent;
check caniemail.com per feature.

## Type, including Thai

Web fonts load in Apple Mail/iOS and some others; Gmail and classic Outlook
ignore them. Design with the fallback, enhance with the web font.

| Use | Stack (this skill's recommendation) |
|---|---|
| Thai + Latin body | `'IBM Plex Sans Thai','Noto Sans Thai','Leelawadee UI',Leelawadee,Tahoma,Thonburi,'Sukhumvit Set',sans-serif` |
| Latin-only body | `-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif` |
| Numbers/codes (OTP, refs) | `'SF Mono',Menlo,Consolas,'Courier New',monospace` (Latin digits only) |

- Windows/Outlook: Leelawadee UI / Tahoma carry Thai. macOS/iOS: Thonburi /
  Sukhumvit Set. Android/Gmail app: system Noto Sans Thai.
- Classic Outlook may jump to Times New Roman when the first family is a web
  font. Wrap `@font-face` in `@media screen` or set an `mso`-only family in a
  conditional `<style>`.
- Sizes: body 16px (14px minimum for dense receipts), line-height 1.6 for Thai
  (Thai ≤1.35 clips stacked marks, see [visual-system.md](visual-system.md)),
  headings 22–28px. Set line-height in px for Outlook (`line-height:26px`).
- iOS auto-links dates, phones, addresses; style or neutralize with
  `<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">`
  and mark real phone numbers as `tel:` links yourself.

## Dark mode

Clients behave in three ways (check Litmus/caniemail for current behavior):

| Behavior | Examples (commonly reported) | Design response |
|---|---|---|
| No change | Some webmail, older clients | Light design must stand alone |
| Partial invert (light backgrounds darkened, dark text lightened) | Outlook.com, Gmail Android | Avoid near-white text on mid-tone colors; test brand color both ways |
| Full invert | Gmail iOS, Outlook Windows/Mac in dark | You cannot control it; avoid meaning carried only by background color |
| Honors your dark styles | Apple Mail, iOS Mail | `@media (prefers-color-scheme: dark)` + meta tags |

- Add `<meta name="color-scheme" content="light dark">` and
  `<meta name="supported-color-schemes" content="light dark">`, plus `:root{color-scheme:light dark}`.
- Logos: transparent PNG with a 2–4px light outline/glow, or a solid
  rounded background plate; a black wordmark disappears on dark.
- Images with text baked in never invert; another reason to keep text live.

## Images-off and alt text

Classic Outlook blocks images by default; many users keep them off.

- Every image has `alt`; decorative images `alt=""`. Style alt text
  (`font-family`, `color`, `font-size` on the `<img>`) so it reads as content.
- Set `width`/`height` attributes and `display:block; border:0`.
- Background colors on cells (not images) carry the layout when images are off.
- Never send image-only email: unreadable images-off, inaccessible, and
  commonly flagged by spam filters (heuristic). Keep real text for every claim.
- Logos 2x resolution, displayed width set by attribute; total images small (<1MB).

## Buttons, links, preheader

- **Bulletproof button**: a link styled with padding inside a table cell
  (`<td style="border-radius:8px;background:#0B5FFF"><a style="display:inline-block;padding:14px 24px;…">`),
  or VML `v:roundrect` for Outlook (generator: buttons.cm). Never an image button.
- Button height ≥44px, label 16px, the whole padded area clickable.
- Link text says where it goes ("ดูใบเสร็จ"), not "คลิกที่นี่". Underline body links.
- **Preheader**: the first ~40–100 characters shown after the subject in the
  inbox list (varies by client). Write it; don't let "View in browser" fill it.
  Hidden `<div style="display:none;max-height:0;overflow:hidden">` then pad with
  `&zwnj;&nbsp;` so body text doesn't leak in.
- **Plain-text part**: send `multipart/alternative` with a hand-checked text
  version (URLs written out, reference numbers present). Most ESPs generate one;
  read it once per template.

## Accessibility

| Item | Value |
|---|---|
| Language | `<html lang="th" dir="ltr">`; mark English parts `lang="en"` [S49] |
| Title | `<title>` = subject line (read by some screen readers, shown in browser view) |
| Layout tables | `role="presentation"` on every layout table; real `<th scope>` only on data tables (receipt lines) |
| Semantics | Real `<h1>`/`<h2>`, `<p>`; one `<h1>` |
| Contrast | Text 4.5:1, large text 3:1 [S03]; check in dark mode too |
| Body size | 16px default, never below 14px |
| Alignment | Left-aligned body; centered only for short heading + button |
| Images | Meaningful alt [S63]; no text-only-in-image |

## Links, tracking and trust

- Click tracking rewrites links to a redirect domain; to users and filters
  this can look like phishing. Use a branded tracking domain
  (`click.yourbrand.co.th`), and keep security mail (OTP, reset, login alert)
  free of tracking redirects and shorteners (see [notifications.md](notifications.md#security-and-trust)).
- Visible link text and actual destination share a domain.
- Open-tracking pixels are unreliable (Apple Mail Privacy Protection preloads
  images); don't make UX decisions on open rate alone.
- Authenticate the sending domain (SPF, DKIM, DMARC). Google's and Yahoo's
  bulk-sender rules (2024) require these plus one-click unsubscribe for bulk
  marketing; check current thresholds.

## Templates per type

| Type | Above the fold | Body | CTA | Notes |
|---|---|---|---|---|
| Receipt | "ชำระเงินแล้ว ฿1,250.00", date, order no. | Line items table (qty, price, total), payment method last 4, VAT line, seller tax ID if applicable | "ดูคำสั่งซื้อ" | Attach or link PDF ([print-documents.md](print-documents.md)); must be readable images-off |
| OTP | Code in 28–32px mono, letter-spaced, selectable as text | Purpose, expiry ("ใช้ได้ 5 นาที"), "อย่าบอกรหัสนี้กับใคร" | None | Code also in subject/preheader only if policy allows; no tracking links |
| Booking confirmation | "ยืนยันการจองแล้ว", date/time with day, place | Reference, map link, what to bring, change/cancel policy | "ดูหรือเลื่อนนัด" | Add `.ics` attachment for calendars |
| Password reset | "ตั้งรหัสผ่านใหม่" | Link expiry, "ถ้าไม่ได้ขอ ไม่ต้องทำอะไร", support contact | One button + raw URL as text | Generic, no account hints; no tracking |
| Digest | Count + period ("5 รายการใหม่สัปดาห์นี้") | 3–7 items, each title + one line + link | "ดูทั้งหมด" | Frequency control in footer |
| Marketing | One offer, headline in live text | Hero (with alt), 1–3 blocks, terms | One primary | Unsubscribe visible; respects consent records |

## Footer

| Element | Transactional | Marketing |
|---|---|---|
| Sender identity | Company legal name, product name | Same |
| Postal address | Recommended | Commonly required by anti-spam laws (e.g. US CAN-SPAM); check local rules |
| Why you got this | "คุณได้รับอีเมลนี้เพราะสั่งซื้อที่…" | "คุณสมัครรับข่าวสารเมื่อ…" |
| Unsubscribe | Preference link if any optional content | One click, no login, plus `List-Unsubscribe` header |
| Help | Support link/phone (not "reply to no-reply") | Same |
| Privacy | Link to privacy notice | Link; PDPA consent records — check current regulation and counsel |

Footer text ≥12px and ≥4.5:1 contrast; tiny grey legal text is the most-failed
contrast in email (this skill's observation, not measured).

## Testing matrix

| Client group | Must check |
|---|---|
| Gmail web + Gmail iOS/Android | Clipping, stripped `<style>`, dark invert, Thai fallback font |
| Apple Mail macOS + iOS Mail | Dark-mode styles, web font, auto-linking |
| Outlook classic Windows (Word engine) | Widths, buttons, line-height, Times fallback, images-off |
| New Outlook / Outlook.com | Partial dark invert, `[data-ogsc]` overrides |
| Yahoo / LINE-in-app browser opening links | Link landing and login continuation |

Tools: Litmus or Email on Acid for screenshots across clients; caniemail.com for
feature support; Mailpit/Mailtrap for staging capture; build with MJML, Maizzle
or React Email. Send a real test to a real Thai-locale phone before launch.

## Do / Don't

| Do | Don't |
|---|---|
| Single 600px column, table layout, inline CSS. | Flex/grid layout or external CSS. |
| Lead with outcome and reference in live text. | Put the whole message in one image. |
| Thai fallback stack ending in Tahoma/Thonburi. | Rely on a Google Font to render Thai in Gmail. |
| Padded-cell or VML button with real text. | Image buttons or "คลิกที่นี่". |
| Keep under ~100KB so the footer isn't clipped. | Inline huge CSS frameworks that push past 102KB. |
| Test dark mode and images-off on every template. | Ship after checking only the ESP preview. |
| Untracked links in OTP/reset mail. | Shorteners or redirect domains in security email. |

## Sources (not yet in sources.md)

- Can I Email — https://www.caniemail.com/ (feature support per client)
- Litmus, dark mode and Outlook rendering guides — https://www.litmus.com/blog/
- Gmail clipping and CSS support — https://developers.google.com/workspace/gmail/design/css
- Google email sender guidelines (2024 bulk-sender rules) — https://support.google.com/a/answer/81126
- RFC 8058, one-click unsubscribe — https://www.rfc-editor.org/rfc/rfc8058
- Campaign Monitor bulletproof buttons — https://buttons.cm/
- US FTC CAN-SPAM compliance guide — https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
