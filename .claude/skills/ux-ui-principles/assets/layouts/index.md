# Layout example library

43 original, task-based blueprints. These are this skill's project examples, not
research findings, finished visual designs, or evidence that a layout increases
conversion. Choose by task and context; adapt to actual users, content and constraints.

External inspiration: [OpenDesign reference catalogue](opendesign.md) maps
16 site references and 8 prototype/template references to these layout IDs.
It records inspection depth and source limitations; external references are
not counted as additional original blueprints.

## Page anatomy by job (start here)

Formerly references/layout index.md: pick sections from the visitor's job, then a blueprint below.
For public pages (Persuade surface).

### 1. Start from the visitor's job

Name the one job (subscribe, book, visit, attend, buy, try, hire, join, listen).
Then build the sections that category's real sites are built around, and put
the action where those sites put it, not a default run of hero → three features
→ steps → email band.

| Job | Action sits | Page is built around | Ends with |
|---|---|---|---|
| Hire (agency, studio) | Hero and after the work | The work, the way of working, a first-month plan | A direct contact line |
| Book (service, venue) | Hero, repeated at the price | What is on offer, times, place | The booking path |
| Try (software) | Hero beside the product itself | The product doing its one job, price | Sign-up |
| Buy | Beside the product and price | The product, proof, delivery, returns | Checkout path |

Missing proof (logos, case studies, quotes) is left out, not invented.

### 2. Signature and mirror test

- **Signature:** the one real thing a visitor remembers, on the first screen
  (a live demo, the product at its best, a price set huge). Test: delete the
  picture; if the screen says the same thing, it is not the signature.
- **Mirror test:** would a neighbouring prompt in the same category get this
  exact combination of shape, hero, nav, footer and action position? If yes,
  change one decision and say which.
- **Rotation:** log each build's six structural axes (shape, hero, nav, footer,
  imagery, section order). The next build differs from the last three on ≥ 3.

### 3. Screen budget and invariants

- About 80 words per 900px window, about 450 visible words per page. Hero:
  headline and subheadline length follow [marketing-copy.md](../../references/marketing-copy.md)
  (headline ≤ 2 lines at every width; Thai per [visual system](../../references/visual-system.md) Part A "Headline length"), 1–2 actions. Fullness comes from
  scale and pictures, not words.
- **Invariants:** one primary button recipe, one container width, one column
  gap below the hero, one radius per nesting level; centred heading groups
  never outnumber left-aligned ones.

### 4. Full-page failure checks

| Failure | Test |
|---|---|
| Thin section | No mass, or a narrow body beside an empty half |
| Dead band | > 160px of nothing under the hero |
| Weak section head | Section headings under 40px on desktop |
| Photo wall | Photos cover more than a third of the page below the hero |
| Echo | One fact printed in 4+ sections |
| Counting marks | 24+ identical marks standing in for a number |

### 5. Template tics to refuse

Rotated vertical text, scroll cues, a BETA or version pill in the hero (a true version label elsewhere is fine: [design quality](../../references/design-quality.md) §2),
weather/locale strips, credit captions under stand-ins, middle-dot-joined meta
strings, arrows glued to link text, decorative status dots.

### 6. A world lends; it does not supply

On Operate and Read surfaces a visual world may set only type, palette, density
and one signature move; layout, navigation and controls stay category-standard
(no terminal-themed dashboards). On a Persuade page the world may build the
page but never becomes a poster: nav stays readable links, the primary action
stays plainly clickable. Costume test: if the direction copies an instrument
the audience uses, keep only what transfers.

## Select and adapt

1. Identify the primary task: learn, choose, transact, monitor, manage, create or recover.
2. Read one relevant category, then select one base layout. Consult a second layout
   only if the user task actually combines them; avoid assembling every pattern together.
3. Explain the match and important tradeoff. Prefer a simpler variant when complexity
   does not serve the task; reuse the project's established shell and design system.
4. Replace placeholder nouns with real content. Specify wide/compact behavior,
   applicable states, focus/keyboard contracts and one recovery path.
5. Review against [the shared specification](specification.md), then verify the
   rendered task if implementation is requested. A blueprint is not a tested screen.

For paired usage and misuse checks, read [Do / Don't examples](../../references/do-and-dont.md).
Reuse relevant examples when adapting these layouts; their presence does not certify a screen.

## Browse by task

| Category | Examples | Guide |
|---|---|---|
| Marketing and public services | Product landing; Service overview; Pricing comparison; Campaign landing; Help or contact hub | [M01–M05](marketing.md) |
| Commerce and transactions | Product listing; Product detail; Cart review; Checkout; Booking | [C01–C05](commerce.md) |
| Dashboards and analysis | Operational overview; Analytical exploration; Finance reporting; Monitoring incidents; Comparison workspace; Matrix / heatmap | [D01–D06](dashboards.md) |
| Administration and back office | Record management; Record detail; Approval workbench; Access management; Import wizard; Audit log; Settings with save behavior; Worklist | [A01–A08](admin.md) |
| Content, learning and discovery | Article or documentation; Knowledge base; Search results; Course learning; Community discussion | [E01–E05](content.md) |
| Productivity and collaboration | Inbox master-detail; Kanban board; Calendar workspace; Document editor; Collaboration workspace | [P01–P05](productivity.md) |
| Accounts, onboarding and settings | Sign-in and recovery; Setup onboarding; Profile settings; Security settings; Subscription management | [U01–U05](accounts.md) |
| Mobile-first tasks and services | Mobile task home; Mobile detail and action; Appointment self-service; Location search; Upload or capture | [B01–B05](mobile.md) |

## Choose between close alternatives

| User need | Start here | Adaptation |
|---|---|---|
| Learn about one offering | M01 / M02 | Commercial proposition vs eligibility/preparation |
| Compare alternatives | M03 / C01 / D05 | Plans vs products vs aligned record/metric comparison |
| Complete a transaction | C04 / C05 | Payment outcome vs scarce appointment availability |
| Monitor exceptions | D01 / D04 | Operating decisions vs incident ownership/timeline |
| Act on records | A01 / A03 | General management vs consequential approval |
| Find content | E02 / E03 | Topic entry point vs query results |
| Continue frequent work | P01 / P02 | Queue triage vs stage-based workflow |
| Prepare or recover access | U01 / U02 | Authentication/recovery vs initial setup |
| Perform a short mobile action | B02 / B05 | Object action vs file capture/upload |

## Worked examples

[Three Thai worked specifications](worked-examples.md) show how to turn a template
into an implementation-ready proposal: checkout, record management, and service booking.
[Back-office worked examples](worked-examples-back-office.md) apply the page spec and
rigor tiers to a payments back office: overview, approval queue, audit log and access.
Read them for deliverable depth, not as mandatory domain assumptions.

## Add another example

Use the structure in each category file: ID, task, wide wireframe, compact behavior,
states, avoidance/tradeoff, acceptance example and customization. Add the entry here.
Mark new material as a project example; cite research separately if making an external
claim. Add a unique ID and prefer a meaningfully different user task over cosmetic variants.
