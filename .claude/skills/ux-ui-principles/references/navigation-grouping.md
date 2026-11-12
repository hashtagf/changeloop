# Navigation grouping — sidebars, settings, mega menus, mobile tabs

How to group, order and label menu items. Principles of IA, navigation model,
URLs and permission flows are in [experience-architecture.md](experience-architecture.md);
component choice (tabs vs segmented control vs anchors) in
[components-usage.md](components-usage.md); admin page types in [back-office.md](back-office.md).

Evidence: navigation of 21 products studied from public pages, docs, help
centres, public demos and open source on 2026-11-04 — see
[nav study](../assets/evidence.md). No signed-in dashboards were opened.
Counts describe practice in that set; they are project recommendations, not
research findings. Validate a proposed menu with tree testing [S32].

## 1. Start from objects and tasks

1. List domain objects and the top tasks per role (card sort when vocabulary is
   uncertain [S31]).
2. Each object gets one home: a plural-noun destination ("ออเดอร์", "Customers").
3. Cross-object activities (reports, automations, a SQL editor) become tool items.
4. Then group, order and label using the rules below.

## 2. Grouping methods that products actually use

| Method | Seen | Use for |
|---|---|---|
| **Personal hub first** — Home, Inbox, My work, For you, Recents | 12/14 apps | Queues and items waiting on *this* user; put counts here |
| **By object / record type** — Orders, Customers, Transactions, Issues | 9/14 | The core of any CRUD or back office |
| **By product / module** — Payments, Billing, Connect; CRM, Marketing | 4/14 | Multi-product platforms; pair with Shortcuts/Bookmarks |
| **By task / tool** — Table editor, SQL editor, Automations, Reports | 3/14 | Activities spanning objects |
| **User-curated** — Favorites, Starred, Bookmarks, pinned | 8/14 | Every product with >~10 destinations had one |
| **Scope** — personal vs shared/team vs admin | 6/14 | Workspace tools (Private / Shared / Teamspaces) |
| **By department / org chart** | 0/14 | Don't |
| **Separate menu per role** | 0/14 | Don't — one structure, items removed by permission (7/14) |

## 3. Numbers

- Visible top-level items: **5–9**; past that, collapse into groups, a More
  item for rarely used destinations, or user bookmarks (HubSpot shows 14 but
  compensates with collapsed flyouts and 10 bookmarks).
- Groups: **3–5** including the personal block and the bottom group.
- Items per group: median **4** (range 1–9); single-item groups only for
  anchors such as Home or Settings.
- Depth: **two levels** (group header → item) in 11/14. A third level only as
  a collapsible item; unlimited depth only for user content trees (pages,
  folders), never for features.
- Mobile tab bar: **3–5** labelled tabs, rule owned by [mobile-native.md](mobile-native.md); the studied apps used 4–5 (5/5 documented; Material 3 allows 3–5 [S94], not independently re-verified, see [sources.md](sources.md)).
- Marketing mega menu: 4–6 triggers; 3–5 columns per panel; 4–8 links per column.

## 4. Order

Top to bottom (app sidebar):

1. Workspace / org / store switcher (top-left in 8/14)
2. Search (⌘K) and a global **Create** button
3. Personal hub (Home, Inbox, งานของฉัน) with counts
4. Core objects — workflow order where a process exists (data → auth →
   storage → functions), otherwise frequency
5. User-curated section (Favorites)
6. Secondary modules, then **More**
7. Bottom group: Settings, Help, then the account menu (sign out lives inside it)

- Alphabetical only for long lists of equal peers (industries, integrations),
  never for app features.
- Let users reorder or pin (7/14) and always offer "reset to default".
- Keep positions stable between releases; announce renames and keep redirects
  (Jira Projects → Spaces, GitHub Security → Security and quality).

## 5. Labels

- Collections: plural nouns ("Orders", "ออเดอร์", "ไรเดอร์"). Hubs and modules:
  singular/mass nouns ("Home", "Billing", "การเงิน", "รายงาน", "ตั้งค่า").
- Verbs only for actions and guides ("New issue", "+ สร้าง", "Accept online
  payments").
- **1–2 words** (13/14 sidebars); front-load the distinguishing word; no
  near-identical labels.
- Thai: short nouns; no "จัดการ…" prefix on every item — it pushes the
  meaningful word to the end and kills scanning.
- Icon **plus** label (14/14). Icon-only rails always have an expand control or
  tooltips; mobile bars keep labels [S94, S95].
- Mega-menu items: name + 2–4 word descriptor ("Billing — Recurring revenue").
  Group headers: short nouns ("By industry") or outcome phrases ("Get paid").

## 6. What goes where

| Thing | Put it | Not |
|---|---|---|
| "Add X" | Global Create menu or the list page's header button | A separate "เพิ่ม X" item beside "X" |
| Saved views (Today, Pending, Mine) | Tabs or saved filters on the list | Separate menu items per filter |
| Sub-types of one object (Refunds, Disputes) | Tabs within the object page, unless the role works them as a queue | Their own top-level items |
| Queues that need action | Personal hub ("ต้องตรวจสอบ (5)") | Scattered across modules |
| Users, roles, API keys, billing | Settings (role-gated) or one Developers group | Top-level items for everyone |
| Sign out, profile, theme | Account menu at the bottom or top-right | Sidebar items |
| Help | Bottom group or account menu | Mixed into object groups |

## 7. Settings pages

- **Scope ladder** (5/7): Personal/account → Workspace/organization/business →
  Product or feature settings → Team/project → Administration (security,
  members and roles, billing).
- Admin-only sections are separate and hidden for non-admins.
- Access/members, security and billing each get their own header.
- Personal settings: 5–7 flat items (Profile, Account, Appearance,
  Notifications, Language).
- Per-product settings live under Settings grouped by product, not inside each
  product's nav.
- Organization vs project settings are separate destinations when both exist.

## 8. Permissions

Build one information architecture; remove what a role cannot use (7/14).
Hide-versus-disable rules live in [experience-architecture.md](experience-architecture.md) (permission flows).

## 9. Marketing mega menus

- Products: by product family or capability. Solutions: by stage/size → use
  case → industry. Developers: docs, guides (verb-first), resources.
  Resources: learn, support, company, contact.
- Pricing is a direct link, not a menu (4/5). Enterprise often its own link.
- Right side: Sign in, then the primary CTA as the rightmost item (5/5).
- One "See all" link and at most one promo tile per panel; mark external links ↗.
- Open on click (or hover with delay), no multi-level cascades, search outside the menu.

## 10. Mobile navigation

- 3–5 tabs (studied apps used 4–5), labels always on, Home first, Me/Account last (rightmost 3/3).
- Tabs are for navigation, not actions [S95]; the trend is away from a centre
  "create" tab — put Scan/Create on Home or a header button.
- Help and Settings go inside Me/Account; avoid a "More" overflow tab [S95].
- Don't hide or disable tabs by state; show the tab with an explanatory empty state.
- Tabs may differ by region (LINE changed its Thailand bar in 2026); keep them
  fixed within a release and announce changes.

## 11. Anti-patterns

1. Department / org-chart menus.
2. Duplicate entries (Settings in sidebar and header; "Payments" and "Payment list").
3. "เพิ่ม X" items next to "X".
4. Key tasks hidden in More or a hamburger on desktop.
5. Icon-only navigation without labels or an expand option.
6. Long verb or "จัดการ…" labels; near-identical labels.
7. A separate menu per role instead of permission filtering.
8. Renaming sections without redirects or notice.
9. Sign out, theme toggles and logos as sidebar items.

## 12. Worked examples

**Thai delivery back office.** Before — 20 flat items mixing departments and
actions: แดชบอร์ด, ฝ่ายปฏิบัติการ, ฝ่ายการเงิน, ฝ่ายการตลาด, ฝ่าย CS,
จัดการไรเดอร์, เพิ่มไรเดอร์, รายชื่อร้านค้า, เพิ่มร้านค้า, ออเดอร์วันนี้,
ออเดอร์ทั้งหมด, รายงาน, รายงานยอดขาย, โปรโมชั่น, คูปอง, ตั้งค่า, ตั้งค่าระบบ,
ผู้ใช้งาน, ช่วยเหลือ, ออกจากระบบ.

```
[โซน: กรุงเทพฯ ▾]   [ค้นหา ⌘K]   [+ สร้าง ▾  ออเดอร์ · ร้านค้า · ไรเดอร์ · คูปอง]
ภาพรวม
งานของฉัน (3)              ← เคสรอดำเนินการ, ร้านรออนุมัติ
ปฏิบัติการ
  ออเดอร์                  ← แท็บ วันนี้ / ทั้งหมด
  การจัดส่ง                 ← แผนที่ไรเดอร์
  ไรเดอร์
  ร้านค้า
ลูกค้าและบริการ
  ลูกค้า
  เคสร้องเรียน
การเงิน
  การชำระเงิน
  การโอนเงิน (ร้าน/ไรเดอร์)
  คืนเงิน
การตลาด
  โปรโมชัน                 ← คูปองเป็นแท็บข้างใน
รายงาน                     ← ยอดขายเป็นรายงานหนึ่ง
──────────
ตั้งค่า (แอดมิน: ผู้ใช้งานและสิทธิ์, ระบบ)
ช่วยเหลือ
[โปรไฟล์ ▾ → ออกจากระบบ]
```

Departments became object groups; "เพิ่ม…" moved to Create; Today/All and
Promotions/Coupons became tabs; two settings items merged and role-gated;
sign-out moved to the profile menu. Four groups of 1–4 items, two levels.

**Payments back office.** Before — 21 flat items: Home, Payments, Payment
List, Refunds, Refund Requests, Disputes, Merchants, Merchant Onboarding, KYC,
Payouts, Settlement, Reconciliation, Reports, Finance Reports, API Keys,
Webhooks, Logs, Users, Roles, Settings, Help.

```
[Org ▾]  [Search ⌘K]  [+ New ▾  payment link · refund · merchant]
Home
Needs review (5)     ← KYC pending, disputes due, refund requests
Money
  Payments           ← tabs: All · Refunds · Disputes
  Payouts
  Settlements        ← Reconciliation as a tab
Merchants            ← tabs: Active · Onboarding · KYC
Reports
Developers  (dev/admin only)   API keys · Webhooks · Logs
──────────
Settings  (Account · Team & roles · Security · Billing)
Help
[User ▾]
```

## Review checklist

1. Groups follow objects and tasks, not departments; one structure for all roles.
2. Personal hub first with actionable counts; Create and Search reachable everywhere.
3. Heuristic from the [nav study](../assets/evidence.md), not a rule: about 5–9 visible top-level items, 3–5 groups, ≤2 levels for features.
4. Labels 1–2 words, plural nouns for collections, front-loaded, icon + label.
5. No duplicates, no "Add X" items, saved views as tabs or filters.
6. Settings follow a scope ladder; admin areas hidden for non-admins.
7. Mobile: 3–5 labelled tabs, navigation only, account last.
8. Tree-test top tasks with real labels before building [S32].
