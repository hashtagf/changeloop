# Print documents — invoices, receipts, reports, labels and PDFs

Documents a product prints or exports as PDF (invoices, Thai tax invoices,
quotations, reports, labels, tickets, certificates): page sizes, print CSS, PDF
generation with Thai shaping, money/dates, numbering, PromptPay QR, PDF
accessibility and the "Print / Download PDF" flow. Emailing the document is in
[email-design.md](email-design.md); Thai type in [visual-system.md](visual-system.md);
tables in [components-usage.md](components-usage.md). Source IDs resolve in [sources.md](sources.md).

## Document types and what they must carry

| Document | Core content | Thai-market notes |
|---|---|---|
| ใบเสนอราคา (quotation) | Number, date, validity ("ยืนราคา 30 วัน"), items, totals, terms, signer | Not a tax document; say "ใบเสนอราคา" clearly |
| ใบแจ้งหนี้ (invoice / bill) | Number, due date, items, totals, how to pay, QR | Often combined with ใบวางบิล in B2B |
| ใบเสร็จรับเงิน (receipt) | Number, date paid, payer, amount, method, issuer | Proof of payment |
| ใบกำกับภาษี (tax invoice) | See next section | Only VAT registrants issue; often combined "ใบเสร็จรับเงิน/ใบกำกับภาษี" |
| Report | Title, scope, period, generated time, page x of y | Period in the user's calendar (พ.ศ. or ค.ศ.) stated explicitly |
| Shipping label / slip | Recipient, phone, address, postcode large; barcode/QR; order ref; COD amount | Thai addresses are long: allow 4–5 lines, never truncate |
| Ticket / boarding pass | Name, date/time, place, seat/gate, scannable code | Code works from a phone screen and from paper |
| Certificate | Name (large), what, date, issuer, verification URL/QR | Name in Thai and English if used abroad |

## Thai tax invoice and e-Tax (check current regulation)

Legal requirements change; confirm with the Revenue Department and an
accountant. Commonly required on a full tax invoice (ใบกำกับภาษีเต็มรูป):

| Field | Common practice |
|---|---|
| Heading | The word "ใบกำกับภาษี" prominently |
| Seller | Name, address, 13-digit tax ID, "สำนักงานใหญ่" or "สาขาที่ 00001" |
| Buyer | Name, address; tax ID and head office/branch when the buyer is a VAT registrant |
| Number | Invoice number (and book number if books are used) |
| Items | Description, quantity, unit price, value |
| VAT | VAT amount shown separately from the price |
| Date | Issue date |
| Copy marker | "ต้นฉบับ" / "สำเนา" (common practice) |

- Abbreviated tax invoices (ใบกำกับภาษีอย่างย่อ, retail/POS) carry fewer fields.
- Corrections go through ใบลดหนี้ / ใบเพิ่มหนี้ (credit/debit note) referencing
  the original, never by editing an issued document.
- e-Tax Invoice & e-Receipt: an electronic document under Revenue Department
  rules, commonly an XML per the ETDA standard, often delivered as PDF/A-3 with
  the XML embedded and digitally signed (or "e-Tax Invoice by Email" for
  smaller issuers). Check current RD/ETDA specs before designing the export.

## Page sizes and margins

| Format | Size | Default margins | Use |
|---|---|---|---|
| A4 | 210 × 297 mm | 15–20 mm; 25 mm on binding edge if filed | Default in Thailand for invoices, reports, certificates |
| US Letter | 8.5 × 11 in (216 × 279 mm) | 0.75–1 in | US/Canada customers; let the user choose, design to fit both (≈ 210 × 279 mm safe area) |
| A5 / A6 | 148 × 210 / 105 × 148 mm | 8–10 mm | Small receipts, A6 shipping labels |
| 100 × 150 mm (4×6 in) | label stock | 3–5 mm | Courier labels (check the carrier's spec) |
| Thermal 80 mm | ~72 mm printable (commonly) | 0–4 mm sides | POS receipts; 12–14px-equivalent text, monochrome |
| Thermal 58 mm | ~48 mm printable (commonly) | 0–2 mm | Mobile printers; one column only |

Values are this skill's defaults; check the driver's printable area and keep
content off the outer 5 mm (many office printers can't print edge to edge).

## Print CSS

```css
@page { size: A4; margin: 18mm 16mm 20mm; }
@media print {
  .app-nav, .toolbar, .toast, button { display: none !important; }
  body { background: #fff; color: #000; font-size: 10.5pt; line-height: 1.5; }
  thead { display: table-header-group; }   /* repeat header on each page */
  tfoot { display: table-footer-group; }
  tr, .total-block, .signature, figure { break-inside: avoid; }
  h2, h3 { break-after: avoid; }
  .page-break { break-before: page; }
  a[href^="http"]::after { content: " (" attr(href) ")"; } /* reports only */
  .brand-band { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}
```

| Concern | Rule |
|---|---|
| Units | `mm`/`pt` in print CSS; body 10–11pt, small print ≥ 8pt, Thai body line-height ≥ 1.5 |
| Background | Browsers drop backgrounds by default; use `print-color-adjust: exact` only where needed (brand band, status stamp) |
| Color vs B/W | Must read in grayscale: status as text + border, not color only [S67]; totals bold, not just colored |
| Page numbers | `@page` margin boxes (`@bottom-right { content: counter(page) " / " counter(pages) }`) work in recent Chromium and print engines; check support, else render in the PDF tool's footer template |
| Long tables | Repeat `<thead>`, keep rows whole, put totals in a block that cannot split from the last rows |
| Fonts | Same Thai-capable family as the app (IBM Plex Sans Thai, Noto Sans Thai, Sarabun); tabular figures for amounts |
| Images | Logo as SVG or ≥300 dpi PNG; QR as SVG |

## PDF generation choices

| Approach | Strengths | Risks | Choose when |
|---|---|---|---|
| Browser print (`window.print()` + print CSS) | Zero infra, uses the same HTML, user picks printer | User's margins/headers/scale vary; no control over file name | Internal tools, reports a user prints themselves |
| Headless Chromium (Puppeteer/Playwright `page.pdf`, Gotenberg) | Same engine as the app; good Thai shaping and line breaking; header/footer templates; tagged-PDF option in recent versions | Heavy runtime, cold starts, needs fonts installed in the container | Default for invoices/tax docs generated server-side |
| HTML-to-PDF engines (WeasyPrint, Prince, Paged.js) | Strong paged-media CSS (margin boxes, running headers) | Thai line breaking depends on build (needs dictionary-based breaking); test | Long reports, books |
| Drawing libraries (PDFKit, pdfmake, jsPDF, ReportLab, TCPDF/mPDF) | Small, fast, precise positioning | Many lack full complex-script shaping: Thai tone marks and upper vowels overlap or float, sara am (ำ) breaks; break only at spaces, so Thai lines overflow | Fixed-layout labels/tickets after a Thai shaping test passes |
| wkhtmltopdf | Familiar | Archived project, old WebKit; avoid for new work | Never for new builds |

**Thai checks before choosing a generator** (this skill's recommendation):
render `ผู้ใหญ่ ปั้นจั่น ญี่ปุ่น ฎีกา ฐานะ ฤๅษี น้ำ ป่ำ ปู่ ฟุ้ง` in body and bold at
8pt and 14pt; verify marks stack without overlap, descenders of ฎ ฏ ญ ฐ are not
clipped, a long Thai paragraph wraps between words, and copy-paste from the PDF
returns correct Thai text. Embed (subset) the font; never rely on viewer fonts.
Breaking rules: [S24].

## Numbers, money and dates

| Item | Format | Example |
|---|---|---|
| Money | Two decimals, thousands separators, currency once per column header or prefix | `฿1,250.00` or `1,250.00 บาท` |
| Alignment | Right-align amounts, tabular figures, same decimals in a column | — |
| Totals block | Subtotal → discount → before VAT → VAT 7% → total; state if prices include VAT | "ราคารวมภาษีมูลค่าเพิ่มแล้ว" |
| Baht text | Total in words on tax invoices/receipts (common practice) | 100 → "หนึ่งร้อยบาทถ้วน"; 1,250.50 → "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์"; 21 → "ยี่สิบเอ็ดบาทถ้วน"; 0.75 → "เจ็ดสิบห้าสตางค์" |
| Rounding | Compute VAT per document or per line consistently; show the rounded figure used | — |
| Buddhist Era | พ.ศ. = ค.ศ. + 543; label the era | "5 พฤศจิกายน 2569" or "05/11/2569" |
| Code | `Intl.DateTimeFormat('th-TH')` gives Buddhist calendar; `th-TH-u-ca-gregory` for ค.ศ. | — |
| Generated time | Date, time, time zone on reports | "พิมพ์เมื่อ 5 พ.ย. 2569 14:30 น." |

Unit-test baht text: 10 → สิบ (not หนึ่งสิบ), 11 → สิบเอ็ด, 20 → ยี่สิบ, 1,000,000 →
หนึ่งล้าน, satang-only, zero. Store dates ISO/UTC; convert only for display.

## Document numbering

- Pattern: prefix + period + sequence, e.g. `INV-2569-000123`, `RC-2611-00042`;
  pick ค.ศ. or พ.ศ. once and document it.
- Sequential with no gaps per series for tax documents (common expectation;
  confirm with accountant); allocate the number at issue, not at draft.
- Drafts show "ร่าง / DRAFT" watermark and no tax-document number.
- Cancelled documents stay, marked "ยกเลิก" with reason; never delete or reuse.
- Number appears top-right on every page and in the PDF file name.

## QR codes and barcodes

- PromptPay / Thai QR Payment: EMVCo merchant-presented format; embed the
  exact amount and a reference so payment reconciles; follow the bank's Thai
  QR Payment logo and layout guideline.
- Print QR as vector, quiet zone ≥ 4 modules, high contrast black on white,
  no logo overlay unless error correction is raised and scanning is tested.
- Test-scan from paper and screen with 2–3 banking apps; label it ("สแกนเพื่อชำระ ฿1,250.00").
- Shipping: carrier barcode at the carrier's size, tracking number printed under it.

## Accessible PDFs

| Need | Rule |
|---|---|
| Tags | Produce tagged PDF (headings, tables with header cells, lists); PDF/UA is the target standard |
| Reading order | Matches visual order: header → parties → items → totals → payment → footer |
| Language | Document language set to `th` (or `en`); mixed parts tagged |
| Title | Document title metadata = "ใบกำกับภาษี INV-2569-000123", shown instead of file name |
| Text | Real text, never a scanned image of text; searchable and copyable |
| Images | QR/logo have alt text; decorative marks artifacted |
| HTML alternative | Offer the same content as an accessible HTML page in the app |

## "Print / Download PDF" UX in the app

| Element | Rule |
|---|---|
| Entry | "ดาวน์โหลด PDF" and "พิมพ์" on the document detail page, near the title |
| Preview | Show the real paginated preview (A4 proportion) before download; page count visible |
| Options | Only what matters: paper (A4/Letter), language (TH/EN), copy type (ต้นฉบับ/สำเนา) |
| States | Generating (spinner on the button, text "กำลังสร้าง PDF…"), ready, failed with retry; long batch exports run in background and notify |
| File name | `{type}-{number}-{date}.pdf`, ASCII-safe, e.g. `tax-invoice-INV-2569-000123-2026-11-05.pdf` |
| Immutability | Issued documents regenerate identically; show issue date, not today's date |
| Mobile | Open in the system viewer/share sheet; don't force download-only |

## Review checklist

1. Prints on A4 (and Letter if offered) without clipped content or blank last page.
2. Grayscale print keeps every status and total readable.
3. Long item lists split with repeated headers; totals never orphaned.
4. Thai test string renders correctly in the PDF and copy-pastes as Thai.
5. Money aligned, two decimals, VAT separate, baht text matches the total.
6. Dates labeled พ.ศ./ค.ศ.; generated time and time zone on reports.
7. Number, copy marker, draft/cancel watermark rules applied.
8. Tax-invoice fields checked against current RD guidance by someone accountable.
9. QR scans from paper with real banking apps.
10. PDF tagged, titled, language set; file name follows the pattern.

## Do / Don't

| Do | Don't |
|---|---|
| Design for A4 first and test on a real printer. | Design at screen width and hope print CSS fixes it. |
| Use headless Chromium for Thai PDFs unless a lib passes the Thai test. | Ship a PDF library that floats Thai tone marks. |
| Embed and subset the Thai font. | Rely on fonts installed on the viewer's machine. |
| Issue corrections as credit/debit notes. | Edit or regenerate an issued tax invoice with new data. |
| Label calendar era and time zone. | Print "05/11/69" with no era. |
| Show a paginated preview and progress state. | Freeze the button with no feedback for 10 s. |

## Sources (not yet in sources.md)

- Thai Revenue Department, VAT and tax invoice rules — https://www.rd.go.th/
- Thai Revenue Department, e-Tax Invoice & e-Receipt — https://etax.rd.go.th/
- ETDA electronic transaction standards — https://www.etda.or.th/
- Bank of Thailand, Thai QR Payment / PromptPay — https://www.bot.or.th/
- EMVCo QR Code Specification for Payment Systems (Merchant-Presented) — https://www.emvco.com/
- MDN, `@page` and paged media — https://developer.mozilla.org/en-US/docs/Web/CSS/@page
- MDN, `print-color-adjust` — https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust
- W3C CSS Paged Media Module Level 3 — https://www.w3.org/TR/css-page-3/
- Puppeteer `page.pdf()` options — https://pptr.dev/api/puppeteer.pdfoptions
- PDF/UA (ISO 14289) overview, PDF Association — https://pdfa.org/resource/pdfua-in-a-nutshell/
