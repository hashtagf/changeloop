# Other platforms: kiosk, POS, desktop, watch, TV, voice, car, XR

Rules for surfaces beyond responsive web and phone apps. Web and mobile rules still apply unless a
row below overrides them; phone specifics are in [mobile-native.md](mobile-native.md), shared-device
privacy in [trust-security-privacy.md](trust-security-privacy.md), keyboard and focus in
[accessibility.md](accessibility.md). Source IDs resolve in [sources.md](sources.md); platform links
not yet registered are at the end. Platform values change with OS releases: recheck before shipping.

## Which surface rules apply

| Surface | Defining constraint | Primary input | Read section | Also read |
|---|---|---|---|---|
| Self-order kiosk, ticket machine | Strangers, standing, shared screen, walk-away | Touch, card/QR | Kiosk & POS | trust-security-privacy, forms |
| Cashier POS, waiter tablet | Speed under queue pressure, trained staff | Touch, scanner, keyboard | Kiosk & POS | back-office |
| Desktop app (macOS, Windows, Electron/Tauri) | Long sessions, many windows, OS conventions | Keyboard + pointer | Desktop apps | back-office, interaction |
| Smartwatch | 2–5 s glance, tiny screen | Tap, crown/bezel, voice | Smartwatch | notifications |
| TV, set-top, signage with remote | 3 m viewing, no pointer | D-pad remote | TV / 10-foot | motion |
| Voice assistant, IVR, call bot | No screen, linear time | Speech, DTMF | Voice UI | content-design |
| In-car display | Driver attention is the budget | Touch, knob, voice | In-car | — |
| AR/VR headset | Comfort, depth, gaze | Gaze, hands, controller | XR | motion |

A product on several surfaces keeps one IA and vocabulary; adapt containers and density, not names.

## Kiosk & POS

| Decision | Customer kiosk | Staff POS | Why / evidence |
|---|---|---|---|
| Touch target | ≥ 60×60 px (≈15 mm), 12 px gaps | ≥ 48×48 px; bigger for top-10 items | Standing users, arm extended, glare; WCAG 2.2 minimum is 24×24 [S07]. Sizes are this skill's recommendation |
| Interactive zone | Controls between ~38 and ~120 cm from floor; nothing critical at top edge | Fixed counter height, staff can reach | Reach ranges: US ADA 2010 §308 (forward reach 15–48 in) [K1] |
| Text | Body ≥ 20 px, prices ≥ 28 px at 50–70 cm | Body 16 px, dense lists OK | This skill's recommendation |
| Language | TH/EN toggle on every screen (flag + "ภาษาไทย / English"); add 中文 at tourist sites | Thai default | — |
| Start | Attract screen: one looping visual + "แตะเพื่อสั่งอาหาร"; no auto-playing audio | Last-used screen, cashier signed in | — |
| Idle timeout | Warn after 60–90 s idle: "ยังสั่งอยู่ไหม?" with countdown 15–20 s and big "สั่งต่อ"; then wipe cart and return to attract | Lock after shift-defined idle; keep open bill | Timing adjustable: warn and allow extension [S47] |
| Reset | Full wipe: cart, phone number, member ID, payment state, input history | Per-bill only | Next stranger must not see previous data |
| Privacy | Mask phone/member no. after entry (08x-xxx-1234); never show full name + points on attract | Customer-facing second display shows items, total, QR only | Shared screen = public screen |
| Offline | Show menu cached with "ออฟไลน์ — ชำระเงินสดที่เคาน์เตอร์"; disable QR pay | Queue orders locally with sync badge; never mark payment done without confirmation | Same rule as [mobile-native.md](mobile-native.md) money row |
| Mode switch | Hidden staff entry (PIN on long-press corner), auto-exit after 30 s | Role-based: void/refund needs manager PIN | Prevent customers reaching admin |

**Payment and device states.** Model each device as a state machine and show the state in words, not
only an icon.

| Device | States to design | Customer copy (example) |
|---|---|---|
| PromptPay / Thai QR | generating → shown (amount, merchant name, expiry countdown) → waiting → paid / expired / failed | "สแกนจ่ายด้วยแอปธนาคาร ภายใน 4:59" then "ชำระแล้ว ฿185.00" |
| Card terminal (EDC) | ready → insert/tap → PIN → approved / declined / timeout / removed early | "แตะบัตรหรือเสียบบัตรที่เครื่องด้านล่าง ↓" |
| Receipt printer | ready → printing → done / paper out / jam / offline | "ใบเสร็จหมด — รับ e-receipt ทาง LINE หรือ SMS" |
| Cash drawer / coin changer | closed → open → closed; short change | Staff-only alert, never block the customer |
| Scanner, ID card reader | idle → reading → read / unreadable | "เสียบบัตรประชาชนให้สุด ชิปหงายขึ้น" |

PromptPay flow rules: confirm payment from the bank/PSP callback, never from a customer-uploaded slip
alone; on expiry offer "สร้าง QR ใหม่" with the same cart; amount and merchant name sit next to
the QR in ≥ 24 px; show order number large after payment for the pickup screen. Point to the physical
device (arrow, illustration) when the action happens off-screen.

Accessibility: provide a "เลื่อนเมนูลงมา" / low-reach mode that moves all controls into the lower
half for wheelchair users and children; support audio + tactile keypad where law or venue requires.

## Desktop apps

| Area | macOS | Windows | Electron / cross-platform rule |
|---|---|---|---|
| Menus | Global menu bar; App, File, Edit, View, Window, Help order | In-window menu or command bar | Every command reachable from a menu or command palette, not only toolbar icons [K2, K3] |
| Shortcuts | ⌘ based (⌘N, ⌘W, ⌘, = Settings) | Ctrl based; Alt for menu access keys | Map per OS; never ship Ctrl shortcuts on macOS. Show shortcuts in menus and tooltips |
| Title bar | Traffic lights top-left | Min/max/close top-right; snap layouts on maximize hover | Custom title bars must keep native controls, drag region, double-click behavior |
| Window size | Remember size/position per window; respect min size | Same; support snap and multiple DPI | Set a minimum (e.g. 960×600) and design a reflow below it |
| Multi-window | Documents in separate windows or tabs | Same | One document = one window; don't open duplicates of the same record |
| Tray / menu bar extra | Menu bar extra for background status | System tray icon | Only for apps that run in background (sync, VPN, chat); quit must really quit |
| File dialogs | Native open/save sheets | Native file pickers | Always native; remember last folder; drag-and-drop as a shortcut, never the only way [S10] |
| Drag and drop | Drop targets highlight on drag-enter | Same | Show copy/move cursor; undo after drop |
| Auto-update | Background download, apply on restart | Same | "อัปเดตพร้อมติดตั้ง — รีสตาร์ตตอนนี้ / ภายหลัง"; never restart mid-task; release notes one click away |
| Density | Compact controls fit pointer input | Compact / standard | Offer density setting; pointer targets can be 24–32 px, touch-capable Windows devices need 40+ |
| Settings | ⌘, opens Settings window | Settings page | Settings apply immediately, no Save button, unless destructive |

Keyboard first: full tab order, visible focus [S09], Esc closes the top layer, Enter triggers the
default button. Offline is the norm for desktop: save locally, show sync per document.

## Smartwatch

| Decision | Rule | Example |
|---|---|---|
| Session length | Design for 2–5 s interactions; anything longer hands off to phone | "เปิดบนโทรศัพท์" for editing a transfer |
| Glance surface | One fact per complication/tile, updated in background | Next appointment "14:30 ทันตกรรม"; balance hidden by default |
| Layout | Single column, 1–3 actions per screen, edge-to-edge on round screens | Approve / Decline for an OTP-less login request |
| Input | Tap, crown/bezel scroll, dictation, preset replies; no keyboards | "ถึงแล้ว", "อีก 5 นาที" quick replies |
| Haptics | Distinct patterns for success, failure, attention; never haptic-only meaning | Double tap for payment success + text |
| Notifications | Short title first; actions inline; mirror phone settings | See [notifications.md](notifications.md) |
| Privacy | Wrist is visible to others: hide amounts and names until raised/tapped | "ได้รับเงิน" then amount on tap |
| Platform | watchOS complications and Smart Stack; Wear OS tiles and complications [K4, K5] | — |

## TV / 10-foot

| Decision | Rule | Notes |
|---|---|---|
| Focus model | Exactly one focused item at all times; focus moves predictably on a grid with D-pad | Never a dead end; Back always goes up one level |
| Focus visibility | Scale 1.05–1.1 + outline or bright border; visible from 3 m | No hover states exist; focus is the hover |
| Safe area | Keep text and controls inside title-safe margins; Android TV guidance: 48 dp left/right, 27 dp top/bottom [K6] | Backgrounds can bleed |
| Type | Body ≥ 24 px at 1080p; avoid thin weights; Thai needs larger sizes for tone marks | This skill's recommendation; check tvOS HIG text styles [K7] |
| Rows | Horizontal content rows, vertical category scroll; remember focus per row on return | — |
| Text input | Avoid; use QR-to-phone sign-in, voice search, or code pairing "เข้าสู่ระบบด้วยมือถือ" | On-screen keyboard is last resort |
| Playback | Remote controls (play/pause, back) must work on every screen | — |
| Motion | Slow transitions (300–400 ms); no auto-advancing carousels without pause [S92] | See [motion.md](motion.md) |

## Voice UI

| Decision | Rule | Thai example |
|---|---|---|
| Prompt | One question, options last, ≤ 3 options per turn | "ต้องการเช็กยอด โอนเงิน หรือคุยกับพนักงานคะ?" |
| Persona | Fixed polite particle (ค่ะ or ครับ) and register; don't switch mid-call | — |
| Confirmation | Implicit for low risk ("ตั้งปลุก 6 โมงเช้าแล้วค่ะ"); explicit yes/no for money, deletion | "โอน 500 บาท ให้ สมชาย ใช่ไหมคะ?" |
| No-match / no-input | Reprompt with narrower help; after 2 failures offer DTMF menu or human | "กด 1 เพื่อเช็กยอด" |
| Escape | "พนักงาน" / 0 works at any point | — |
| Numbers and dates | Read amounts as words, phone numbers digit by digit, Buddhist-era years on request | "สองพันห้าร้อยบาท" |
| Thai speech issues | Code-mixing ("เช็ก balance"), English brand names, regional accents, homophones by tone, names spelled many ways | Accept synonyms; confirm names by reading back; offer spelling via keypad |
| Screen pairing | When a screen exists, show what was heard and allow tap correction | — |

## In-car (brief)

Driver distraction sets the limit: NHTSA guidance targets glances ≤ 2 s and ≤ 12 s total eyes-off-road
per task [K8]. Use the platform templates (Android Auto, Android Automotive, CarPlay) [K9]; lock text
entry and long lists while moving; voice first; large targets; no video or animated ads for the driver.

## XR (brief)

Keep UI in a comfortable field of view and at readable distance; anchor panels to the world, not the
head; avoid forced locomotion; offer seated mode; targets sized by visual angle, not px. Follow
visionOS / Meta Horizon guidance [K10] and respect reduced motion.

## Do / Don't

| Do | Don't |
|---|---|
| Warn before a kiosk timeout and wipe all customer data on reset. | Leave the previous customer's phone number in the field. |
| Confirm PromptPay payment from the PSP callback. | Accept a slip photo as proof of payment. |
| Name device states in words ("ใบเสร็จหมด"). | Show a spinner while the printer is out of paper. |
| Map shortcuts and menus per OS on desktop. | Ship one Electron UI with Ctrl shortcuts on macOS. |
| Keep exactly one visible focus on TV. | Rely on hover or lose focus after closing a dialog. |
| Hand long watch tasks to the phone. | Put a form on a watch. |
| Confirm voice money actions explicitly with a read-back. | Execute a transfer on a low-confidence match. |

## Sources (not yet in sources.md)

- [K1] US Access Board, 2010 ADA Standards §308 Reach Ranges — https://www.access-board.gov/ada/#ada-308
- [K2] Apple HIG, Menus and Keyboards (macOS) — https://developer.apple.com/design/human-interface-guidelines/the-menu-bar
- [K3] Microsoft, Windows app design and Fluent — https://learn.microsoft.com/windows/apps/design/
- [K4] Apple HIG, Designing for watchOS — https://developer.apple.com/design/human-interface-guidelines/designing-for-watchos
- [K5] Wear OS design — https://developer.android.com/design/ui/wear
- [K6] Android TV layouts (overscan) — https://developer.android.com/training/tv/start/layouts
- [K7] Apple HIG, Designing for tvOS — https://developer.apple.com/design/human-interface-guidelines/designing-for-tvos
- [K8] NHTSA Visual-Manual Driver Distraction Guidelines (2013) — https://www.nhtsa.gov/risky-driving/distracted-driving
- [K9] Android for Cars — https://developer.android.com/cars ; Apple CarPlay — https://developer.apple.com/carplay/
- [K10] Apple HIG, Designing for visionOS — https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos
