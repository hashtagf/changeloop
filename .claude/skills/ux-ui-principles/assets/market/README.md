# Market studies — what the category looks like before you pick a look

`catalog.json` holds one study per kind of business: the **category look** (what most sites in that market
converge on), the **designed moves** (what design-led sites do differently), the **gaps** a new page can own,
**facts** of that market with a source and the date checked, and one note per studied site.

Used in [design direction](../../references/design-direction.md) §9, Round B option "research the market first",
and listed by `python3 scripts/look.py <kind>` next to the reference pages.

| Kind | Studied | Sites | Synonyms |
|---|---|---|---|
| clinic | 2026-11-06 | 6 Thai (category) · 7 design-led abroad | dental, dentist, medical, health, ทันตกรรม, คลินิก, หมอฟัน |

**Pictures.** `img/<kind>-<slug>-1.jpg` (first screen, 1440×900) and `-2.jpg` (one screen down) are other
businesses' pages: git-ignored, a local study set only. Rebuild: `node scripts/market_fetch.js --kind clinic`.

**Adding a study.** Write `slug url TH|intl` lines (6 local sites in the category and 6 design-led sites abroad;
search award galleries for the second half), run `node scripts/market_fetch.js --kind <kind> --urls urls.txt`,
open every picture, then fill the printed stub: category look, designed moves, three gaps, verdict and a one-line
note per site. Facts go in only with a source and a check date; re-check anything older than a year before a page
uses it.

**Rules.** Never reuse a studied site's name, copy or imagery. A gap is only a gap if no site in the local half does
it; say which site came closest.
