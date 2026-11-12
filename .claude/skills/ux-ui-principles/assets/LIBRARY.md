# Template library

The skill keeps one library of pictures to look at before building. Whatever collection a picture came from, it is
read the same way: **`python3 scripts/look.py <kind or tag>`** lists the ones to open, and each row says what it is
and what to take from it. Rules and routed files decide the design; a picture shows one move that worked.

## One row shape

`scripts/_library.py` reads every collection into the same fields:

| Field | Meaning |
|---|---|
| `kind` | Page kind: landing, product, auth, cafe, deck, report, cover, editorial … (`look.py --kinds`) |
| `tags` | Finer words to search by: crm, finance, ai-chat, canvas, builder, inbox, marketplace … |
| `verdict` | **template** — start from its move · **study** — one detail worth learning (skipped entries are not loaded) |
| `take` | What to take from it, in our words |
| `comp` | Composition in `scripts/compositions.js` it maps to, when there is one |
| `origin` | **ours** (built with this skill) · **generated** (a rendered template or showcase page) · **product** (a real app's screen) |
| `local` | Picture is git-ignored and fetched on demand: someone else's work, study only |
| `source` | Credit line with the link; printed as `from:` so an answer can say where a move came from |

`look.py` orders rows by verdict (templates first), then committed before local, one picture per app. Origin is
there for judgement — a real product's screen shows what a team shipped; a generated page shows a composition — and
for credit. It is never a reason to prefer one picture.

## Collections

| Folder | Holds | Rows (template / study) | Pictures | Rebuild |
|---|---|---|---|---|
| [references/](references/README.md) | Rendered Apache-2.0 templates plus our own builds; first screen + long view | 34 / 0 | committed | — |
| [showcase/](showcase/README.md) | Designed pages from a public showcase, grouped into distinct captures | 21 / 24 | local | `python3 scripts/showcase_fetch.py` |
| [mobbin/](mobbin/README.md) | Real web products, four screens each (landing / product / auth), tagged by domain | 44 / 144 screens of 47 apps | local | `python3 scripts/mobbin_fetch.py` |

Not part of the library, read by `look.py` alongside it: **market studies** ([market/](market/README.md), category
research with facts and gaps, not templates) and **direction previews** (`directions/previews/`, the skill's own looks).

## Rules (every collection)

- **Take the move, never the look.** No names, logos, copy, illustration, photography or brand colour from a picture
  in client work. Name the move and the picture it came from.
- **Local pictures stay local.** Never commit, publish or ship anything from a `local` collection.
- A pattern seen here never overrides a routed rule file; check the move against it first.

## Adding a collection

1. Put it in `assets/<name>/` with a `catalog.json` and a `README.md` (source, date, verdict counts, rebuild steps).
2. Add a loader in `scripts/_library.py` that yields the row shape above and register it in `COLLECTIONS`.
3. Git-ignore its pictures if they are not ours; give it a fetch script that follows the script contract
   (exit 0 / 1 / 2 / 3).
4. Add a row to the table above and a check in `evals/regress/test_py_tools.py`. Nothing else in the skill should
   need to name it.
