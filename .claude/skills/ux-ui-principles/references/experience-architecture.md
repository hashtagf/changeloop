# Experience architecture — level 2

Design the system, not isolated pages. Each page can be good on its own while
the product is still hard to use if pages do not connect. Source IDs resolve in
[sources.md](sources.md). Interaction-level navigation guidance is in
[interaction.md](interaction.md) and [patterns.md](patterns.md).

## Artifacts and when to make them

| Artifact | Answers | Make it when |
|---|---|---|
| Journey map | What happens across channels and time, including outside the product? | New service, multi-day process, or handoffs between people |
| User flow | Which screens/decisions a role passes through for one task | Any task spanning more than one screen |
| IA map (sitemap) | What objects and pages exist and how they are grouped | New product/section; navigation complaints |
| Page inventory | Every page with type, owner role, entry points and data source | Before visual design of a section |
| Permission matrix | Which role can see/do what, and what others see instead | Any multi-role product |
| URL map | Stable addresses for objects, lists, filters and views | Web apps where links are shared or bookmarked |

## Information architecture

- **Model objects first.** List the domain objects (customer, transaction,
  withdrawal, provider) and their relationships, then derive pages: list →
  detail → related objects. Users navigate between objects, not menus.
- **Name things in users' vocabulary.** Card sorting reveals mental models;
  tree testing checks whether people can find items in a proposed hierarchy.
  Neither proves the final visual navigation works. [S31, S32]
- **Group by task frequency and role**, not by internal team ownership.
- **One home per object.** A record should have one canonical detail page that
  other pages link to, rather than several partial views that disagree.

## Navigation model

How to group, order and label the menu itself (counts, depth, settings,
mobile tabs, worked examples) is in [navigation-grouping.md](navigation-grouping.md).


| Element | Rule | Check |
|---|---|---|
| Global navigation | Top-level sections reflect major user goals; current section is indicated programmatically and visually | Each page highlights exactly one section; screen reader announces current page |
| Local navigation | Sub-sections or tabs only when content is truly separate (see Tabs in [back-office.md](back-office.md)) | Users do not need to compare across tabs |
| Breadcrumbs | Show location in hierarchy, not session history, and supplement primary navigation (project rule); see NN/g breadcrumb guidelines, including mobile tradeoffs [S57] | Breadcrumb trail is identical no matter how the page was reached |
| Back behavior | Browser Back returns to the previous view with filters, search, selection and scroll preserved where practical | Filter a list, open a record, press Back; the filtered list reappears |
| Deep links | Every object, filtered list and significant view has a shareable URL | Copy the URL into a new session; same view loads (subject to permission) |
| Cross-links | Related objects link to each other in both directions | From a withdrawal reach the customer; from the customer reach their withdrawals |
| Search | Global search finds objects by the identifiers users actually have (IDs, names, phone, reference numbers) | Test with real identifiers support staff receive |

## URL structure

- Use readable, stable, hierarchical paths: `/withdrawals`, `/withdrawals/WD-2048`,
  `/customers/C-10392/withdrawals`.
- Encode list state that users share in query parameters:
  `/withdrawals?status=pending&sla=overdue&sort=age`.
- No secrets, tokens or personal data in URLs: see [trust-security-privacy.md](trust-security-privacy.md).
- Changing a URL scheme needs redirects for existing bookmarks.

## Flows across pages

For each primary task, trace entry → understand → act → feedback → recover →
finish across pages (the same chain used per page in SKILL.md). Check:

- **Entry points:** from navigation, notifications, email/SMS links, search, and
  other pages. A notification link must open the exact object, not a list.
- **Handoffs:** when a task moves between roles (operator → manager), the next
  role must see the context and the reason for the handoff.
- **Return path:** after completing an action, where does the user land? In a
  queue, the next item; after creating a record, its detail page; after a
  long form, a confirmation page with next steps. [S44]
- **Dead ends:** no page without a way forward or back; empty and error states
  include a next action.
- **Long or multi-part work:** use a task list showing each part's status and
  which parts cannot start yet. [S42]

## Permission flows

| Situation | Preferred behavior |
|---|---|
| Role never needs the feature | Hide it from navigation |
| Role can see but not act | Show the data; replace the action with an explanation and, if useful, a request/handoff path |
| Action allowed with a limit | Show the limit before the user invests effort (e.g. amount above approval limit) |
| Access revoked during a session | On next request, explain the change and keep unsaved work recoverable where policy allows |
| Direct URL to a forbidden object | Explain lack of access without revealing sensitive details; avoid confirming existence when that leaks information |

Hidden versus disabled: hiding reduces clutter but can confuse when users know
the feature exists (e.g. a colleague mentioned it). Disabled controls need a
visible reason. Decide per action and record it in the permission matrix.

## Role-based variations

Several roles may use the same data for different goals. Prefer one canonical
object page plus role-specific entry views (operator queue, manager overview,
auditor log) over a single page that tries to satisfy everyone.

## Mobile and multi-device

- Decide which tasks must be fully supported on mobile and which are view-only.
- Keep the same IA and names across devices; change layout, not structure.
- Native apps: follow platform navigation conventions (tab bars, back gestures)
  and check current platform guidance before prescribing specifics.

## Verification

| Check | Method |
|---|---|
| Findability | Tree test top tasks against the IA [S32] |
| Flow completeness | Walk each primary task through the page inventory; list missing pages/states |
| Navigation consistency | Inspect current-location indicators, breadcrumbs and titles on every page |
| Deep links | Open sampled URLs in a fresh session for each role |
| Permission correctness | Matrix review plus testing with one account per role |

## Do / Don't

| Do | Don't |
|---|---|
| Derive pages from domain objects and role tasks. | Mirror the org chart or database tables in the menu. |
| Give every object one canonical page with stable URL. | Build three partial views of the same record with different fields. |
| Preserve list state on Back and in shareable URLs. | Reset filters and scroll every time users return from a detail page. |
| Show limits and permission reasons before effort is spent. | Let users fill a form and reject it at submit for a permission they never had. |
| Land users on the next useful place after completing a task. | Return to a generic home page after every action. |
