# Form design

Forms are where most tasks succeed or fail. This file is the full form
reference; [patterns.md](patterns.md) holds the short summary. Source IDs resolve in [sources.md](sources.md).

## 1. Decide what to ask

- Ask only for information the task or law needs. For each field, write why it
  is needed and what happens if it is wrong. Remove fields nobody can justify.
- Reuse what the service already knows; don't ask twice in one journey
  (WCAG 3.3.7 Redundant Entry, with exceptions). [S11]
- Required vs optional: mark the minority (rule in the §2 table); if most fields are optional, reconsider the form.
- Allow honest uncertainty ("ไม่ทราบ", "ไม่มี") when it is a meaningful answer.

## 2. Structure

| Decision | Guidance |
|---|---|
| One page or many | Long or branching forms for occasional users: start with one question per page. [S17] Short forms or forms experts edit often: keep on one page so values can be compared. |
| Layout | Prefer a single column; it gives one reading path and fewer skipped fields. [S83] Place short related fields on one row only when they form a unit (date parts, first/last name if split). |
| Multi-column, if used | Only for a related pair (first/last name, city/postcode), never unrelated fields (company + launch date). Each row aligns to the **top** (`align-items: start`), every label is one line or rows share the same label height, and errors/hints grow **downward** without moving the field beside them. Collapse to one column below ~640px |
| Control size | One height for every single-line control (input, select, date) and one width rule per row; a field must not grow because of an icon, hint or error |
| Required vs optional | Mark the minority: if most fields are required, label the few others "(ไม่บังคับ)" / "(optional)"; otherwise mark required ones. Never rely on an asterisk alone without a legend |
| Grouping | Group by the user's decision, with a heading or `fieldset`/`legend` per group; not by backend payload. |
| Order | Follow the order users think in (who → what → when → how to pay), easiest and most certain first. |
| Progress | For multi-step forms show step names and position; allow going back without losing data. Use a task list when parts can be done in any order. [S42] |
| Review | For consequential submissions, check-answers before submitting. [S43, S48] |

## 3. Labels, hints and help

- Every control has a visible, persistent label (WCAG 3.3.2). [S65] Placeholder
  text is not a label; it disappears while typing and often has low contrast. [S68, S82]
- The accessible name must contain the visible label text so voice users can
  say what they see (WCAG 2.5.3). [S64]
- Labels sit above the field in single-column forms; this survives long Thai
  labels, translation and narrow screens.
- Hints go between label and field, connected with `aria-describedby`; explain
  format or why the data is needed, before the user makes a mistake.
- Field width suggests expected length (postcode short, address long). [S68]
- Use help links or expandable details for rare questions; don't hide essential
  rules in tooltips.

### Placeholders — use them, but only as an example

Placeholder is a supplement under a visible label, not a replacement and not
the only place a rule lives. Default: give every free-text field whose format
or content is not obvious a short example placeholder.

| Field | Placeholder | Why |
|---|---|---|
| Phone | `081 234 5678` | Shows grouping users can type |
| Email | `name@company.com` | Shows expected domain type |
| National ID | `1 2345 67890 12 3` | Shows digit grouping |
| Date typed as text | `31/12/2568` | Shows order and Buddhist Era (also state it in the hint) |
| Amount | `0.00` (with ฿ prefix outside the field) | Shows decimals |
| Search | `ค้นหาด้วยชื่อ เลขคำสั่งซื้อ หรือเบอร์โทร` | Says what is searchable; search may have no visible label if it has an accessible name and a search icon/button |
| Free text, notes | `เช่น ฝากไว้ที่ป้อม รปภ.` | Example of useful content |
| Name, select, checkbox, radio, obvious fields | none | Adds noise |

Rules: start with "เช่น" / "e.g." or show a literal example; never put
instructions or requirements only in the placeholder (put them in the hint);
never use a placeholder that looks like a filled value (use a lighter color
with **≥ 4.5:1** contrast — placeholder text is text under WCAG 1.4.3); never
a placeholder that repeats the label ("กรอกชื่อ").

## 4. Choose the right control

| Answer type | Control | Notes |
|---|---|---|
| One choice from 2–6 visible options | Radios [S70] | All options visible; no default unless one is clearly right and harmless |
| Several choices | Checkboxes [S70] | Add "ไม่มีข้อใดตรง" option when "none" is a real answer |
| One choice from many known options | Select or autocomplete | Select for ~7–15 stable options; autocomplete/combobox for long lists (provinces, banks) |
| Yes/no that applies immediately | Switch | Only for settings with instant effect; use checkbox in forms submitted later |
| Short free text | Text input with correct `type`, `inputmode`, `autocomplete` [S66] | `inputmode="numeric"` for codes, `type="email"`, `type="tel"` |
| Long free text | Textarea with visible character limit if any | Show remaining count only near the limit |
| Known date (birth date) | Three fields day/month/year or a typed field [S69] | Date pickers are slow for distant dates |
| Date near today / availability | Calendar or list of available dates | Show unavailable dates as such, with reason |
| Number with unit | Input + unit label outside the field | Accept users' formatting (commas, spaces) and normalize |
| File | File input with type/size rules stated up front | Show upload progress, allow remove/replace |

Avoid custom controls when a native one works; custom ones must replicate
keyboard, focus and screen-reader behavior (see [accessibility.md](accessibility.md)).

## 5. Common fields

| Field | Guidance |
|---|---|
| Name | Single or multiple fields depending on user and system needs; a single field accommodates the widest range of names; allow any characters and long names; avoid asking for title [S71] |
| Address | Use the country's structure; Thai: บ้านเลขที่/อาคาร, ถนน/ซอย, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์; postcode lookup can prefill but must be editable |
| Phone | Accept spaces, dashes and +66; normalize on the server; explain use ("ส่ง SMS ยืนยัน") [S71] |
| Email | `type="email"`, `autocomplete="email"`; don't ask to type twice — show it back for review instead [S71] |
| National ID | 13 digits; accept with or without dashes; validate checksum on blur; mask after entry if sensitive |
| Money | Show currency; right-aligned in tables but left in forms is fine; allow decimals only if valid |
| Password | Allow paste and password managers; show/hide toggle; state rules up front; no arbitrary maximum [S12] |
| OTP | `autocomplete="one-time-code"`, `inputmode="numeric"`; one field rather than six boxes unless tested; resend with timer |

Set `autocomplete` tokens for personal data fields so browsers can fill them
(WCAG 1.3.5). [S66]

## 6. Validation

| When | Do |
|---|---|
| Before | Constraints and good defaults; hints with format; disable impossible options with reason |
| While typing | Only for constraints the user is clearly building toward (password rules checklist, character count) |
| On leaving a field | Format and obvious errors, only after the user has typed something; don't flag empty untouched fields |
| On submit | Full validation; error summary at top linking to each field, focus moved to summary; inline message at each field [S18, S20] |
| Server-side | Same messages as client; keep all entered values; distinguish user-fixable errors from service failures [S19] |

**Error state visuals** (one look across the product): field border in the
error role (≥ 3:1 against the surface, WCAG 1.4.11), an error icon before the
message, message text in error color with ≥ 4.5:1, the field's own background
unchanged. Style it from `[aria-invalid="true"]` so state and visuals can't drift.
Remove all three as soon as the value is valid.

**Thai keyboard layout in Latin fields.** Email, URL, username, code and
password fields often receive Thai characters typed with the wrong keyboard
("ฟหกฟหก" = "asdasd"). Detect `[\u0E00-\u0E7F]` and say so:
"ดูเหมือนพิมพ์ด้วยแป้นภาษาไทย ลองสลับเป็นภาษาอังกฤษ" / "This looks like it was
typed with a Thai keyboard — switch to English". Never silently strip it.

Error messages say what is wrong and how to fix it, in the field's own words
("ใส่เบอร์มือถือ 10 หลัก เช่น 081 234 5678"), not "ข้อมูลไม่ถูกต้อง".
Associate each message with its field (`aria-describedby`, `aria-invalid`).
Use an icon plus text, never color alone (WCAG 1.4.1). [S67] See
[content-design.md](content-design.md) for wording.

Inline real-time validation that fires too early annoys users and can
interrupt legitimate input; validate after the field is completed unless the
rule is incremental. [S84]

**Message placement.** The error appears directly below its field, in the same place as the hint, and never moves
the control or the fields around it. Give every field one reserved message line (hint, error or empty) so showing
an error causes no layout shift; in dense grids or table cells reserve it too, so inputs in one row stay on one
baseline. A message that must wrap needs a wide enough column, not a taller row.

**Form lifecycle:** pristine · dirty · validating · field error · form error ·
submitting · success. Show async validation inline without shifting layout. Warn before
leaving with unsaved (dirty) changes.

### 6b. Implementation contract — every built form

A built form is not done until each item exists. Specify the rules per field
first (required, type/format, length, range, cross-field), then implement:

1. **Rules in markup:** `required`, `type`, `inputmode`, `autocomplete`,
   `minlength/maxlength`, `min/max`, `pattern` where it helps — the baseline that
   works without script.
2. **Own messages:** `novalidate` on the form + script that validates on blur
   (after input) and on submit, writing the specific message from §6 into a
   per-field error element (`id`, linked by `aria-describedby`) and setting
   `aria-invalid="true"`; clear both when fixed.
3. **On submit with errors:** error summary at the top listing each error as a
   link to its field; move focus to the summary; do not send.
4. **Submit pending:** disable double submit, show progress on the button, keep values.
5. **Server/request errors:** map field errors back to fields; show service
   failures in a banner with retry; never clear valid input.
6. **Success:** confirmation with reference and next step (§7).
7. **Reuse the project's stack** when present (react-hook-form + zod/yup,
   Formik, vee-validate, Angular forms, native constraint API) instead of
   hand-rolling; the contract above still applies.

Minimal vanilla pattern:

```html
<style>
  /* one control size: >= 16px text (no iOS zoom), >= 48px tall */
  input, select, textarea, button { font: inherit; font-size: 16px; min-height: 48px; padding: 0 14px; }
  label { display: block; margin-bottom: 6px; }
  /* one error look, driven by state */
  [aria-invalid="true"] { border-color: var(--error); }
  .field-error { color: var(--error-ink); display: flex; gap: .4em; }
  .field-error::before { content: "⚠"; } /* or the product's icon */
  .form-row { display: grid; gap: 16px 24px; align-items: start; }
  @media (min-width: 640px) { .form-row.pair { grid-template-columns: 1fr 1fr; } }
</style>
<form id="f" novalidate>
  <div role="alert" id="f-summary" tabindex="-1" hidden></div>
  <label for="phone">เบอร์มือถือ</label>
  <p id="phone-hint">ใช้ติดต่อเรื่องการจัดส่งเท่านั้น</p>
  <input id="phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel"
         required pattern="0[0-9]{8,9}" placeholder="081 234 5678"
         aria-describedby="phone-hint phone-err">
  <p id="phone-err" class="field-error" hidden></p>
  <button type="submit">ส่งคำขอ</button>
</form>
<script>
const msgs = { phone: { valueMissing: 'ใส่เบอร์มือถือ', patternMismatch: 'ใส่เบอร์มือถือ 10 หลัก เช่น 081 234 5678' } };
const THAI = /[\u0E00-\u0E7F]/; // Thai typed into a Latin-only field
const thaiMsg = 'ดูเหมือนพิมพ์ด้วยแป้นภาษาไทย ลองสลับเป็นภาษาอังกฤษ';
const f = document.getElementById('f');
const check = el => {
  if (el.type === 'tel') el.value = el.value.replace(/[\s-]/g, ''); // accept 081 234 5678
  const err = document.getElementById(el.id + '-err');
  const latin = ['email', 'url', 'password', 'tel'].includes(el.type);
  const key = latin && THAI.test(el.value) ? 'thai' : Object.keys(msgs[el.name] || {}).find(k => el.validity[k]);
  err.hidden = !key; err.textContent = key === 'thai' ? thaiMsg : key ? msgs[el.name][key] : '';
  el.toggleAttribute('aria-invalid', !!key); return !key;
};
f.querySelectorAll('input,select,textarea').forEach(el =>
  el.addEventListener('blur', () => { if (el.value) check(el); }));
f.addEventListener('submit', e => {
  e.preventDefault();
  const bad = [...f.elements].filter(el => el.name && !check(el));
  const s = document.getElementById('f-summary');
  s.hidden = !bad.length;
  if (bad.length) {
    s.innerHTML = '<p>แก้ไข ' + bad.length + ' รายการ</p><ul>' + bad.map(el =>
      `<li><a href="#${el.id}">${document.getElementById(el.id + '-err').textContent}</a></li>`).join('') + '</ul>';
    s.focus(); return;
  }
  /* send; set button pending; on failure keep values and show banner */
});
</script>
```

## 7. Submission and after

- Primary button names the action ("ส่งคำขอ", "ชำระเงิน ฿1,250"); one primary per form.
- Prevent double submission; show pending state on the button.
- Preserve input on failure, timeout or session expiry (save drafts where policy allows).
- Unknown outcome: say the result is being checked; never invite a second payment
  ([patterns.md](patterns.md#async-and-interrupted-operations)).
- Success: confirmation page or message with reference, what happens next, and
  how to change. [S44]
- Leaving with unsaved changes: warn in-page; don't trap users.
- Multi-step or long forms: end with a review page (summary list: key, value, a
  "Change" link whose accessible name includes the key); returning from a change
  goes back to the review; answers are retained throughout [S102]
  ([design system benchmarks](design-system-benchmarks.md) §5).

## 8. Mobile forms

- Correct keyboard via `type`/`inputmode`; `enterkeyhint` for next/done.
- Keep the focused field and its error visible above the on-screen keyboard;
  sticky buttons must not cover them.
- Targets follow platform guidance (iOS default 44 pt, Android ≥48 dp; WCAG 2.5.8
  24 CSS px as the web minimum with exceptions). [S07, S74, S78]
- Prefer native pickers for dates and selects on mobile.

## 9. Back-office forms

- Experts edit more than they create: support keyboard flow (Tab order, Enter to
  submit where safe), and show current values clearly in edit mode.
- Settings forms state instant vs submission effect (see [back-office.md](back-office.md)).
- Two-column layouts are acceptable for dense record editing when groups are
  clearly separated and tab order follows reading order; test with real data.
- Show who last changed a record and when, near the save action.

## Form review checklist

1. Every field has a stated purpose; nothing unnecessary is asked.
2. Visible persistent labels; hints before errors; no placeholder-only labels;
   example placeholders on fields whose format isn't obvious (§3).
3. Single reading path; groups with headings/legends.
4. Control matches answer type; native controls preferred.
5. `autocomplete`, `type` and `inputmode` set for personal data and numbers.
6. Validation timing doesn't flag untouched fields; messages explain the fix and sit below the field in a reserved line (no layout shift).
7. Error summary links to fields on submit; focus goes to it.
8. Input preserved on every failure path; double submit prevented.
9. Works with keyboard only, at 200% zoom and on a phone with the keyboard open.
10. Thai and long values tested; formats accepted as users type them.
11. Rows align at the top; errors grow downward without shifting neighbours;
    all single-line controls share one height; one column on phones.
12. Invalid fields show border + icon + message from `[aria-invalid]`; Thai
    typed into Latin fields gets the keyboard-layout message.
13. Required/optional marked on the minority; no unexplained asterisks.
14. Built forms meet the §6b contract: tried empty submit, one invalid value,
    and a request failure — each shows the right message and keeps input.

## Do / Don't

| Do | Don't |
|---|---|
| Ask only what the task needs and say why. | Collect "nice to have" data in a required field. |
| Use a single column with visible labels above fields. | Use placeholder text as the only label. |
| Accept natural formats and normalize. | Reject "081-234-5678" because of the dashes. |
| Validate after input and explain the fix. | Turn every field red before the user has typed. |
| Keep entered data on every error. | Clear the form after a server error. |
