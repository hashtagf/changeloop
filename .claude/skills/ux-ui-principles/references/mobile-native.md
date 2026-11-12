# Native mobile apps (iOS and Android)

Web guidance in this skill applies to mobile web. Native apps add platform
conventions, device permissions, notifications, offline use and app-store
constraints. Always check the current platform guidelines before prescribing
exact values; they change with OS releases. Source IDs resolve in [sources.md](sources.md).
Mobile layout blueprints are B01–B05 in [the layout library](../assets/layouts/mobile.md).

## Platform conventions

| Area | iOS | Android | Rule |
|---|---|---|---|
| Primary navigation | Tab bar at bottom (3–5 destinations) | Navigation bar at bottom (3–5) or navigation rail on large screens | Same IA on both; adapt the container, not the structure |
| Back | Back button top-left and edge swipe | System back (gesture/button), predictive back animation [S80] | Never trap back; preserve state when returning |
| Units | Points (pt) | Density-independent pixels (dp), sp for text | Don't mix with CSS px in specs |
| Touch target | Default control size 44×44 pt; HIG lists 28×28 pt as minimum [S74] | At least 48×48 dp [S78] | Design to the default/recommended size; larger for primary actions and users on the move |
| Safe areas | Respect safe areas for notch, home indicator, Dynamic Island [S74] | Respect system bars and display cutouts (edge-to-edge) | Content edge-to-edge, controls inside safe insets |
| Type scaling | Dynamic Type | Font scale (sp) | Layouts must reflow at the largest supported text size |
| Icons | SF Symbols [S75] | Material Symbols | Use platform family for familiarity |

Cross-platform apps (Flutter, React Native) still follow each platform's back,
navigation and permission conventions; a single "neutral" UI often feels wrong
on both.

## Permissions (camera, location, notifications, contacts, photos)

Ask at the moment the feature needs it, after explaining why, and keep the app
usable if the user says no. [S72, S76]

1. **In context:** request camera when the user taps "สแกน QR", not at launch.
2. **Pre-permission explanation** (optional, in-app screen) when the value isn't
   obvious; then the system prompt. Don't imitate the system dialog.
3. **Purpose string** is specific: "ใช้กล้องเพื่อสแกน QR สำหรับชำระเงิน".
4. **Denied:** degrade gracefully with an alternative (enter code manually);
   repeated denial on Android becomes permanent, so don't re-prompt or push
   users to Settings to pressure them. [S76]
5. **Least privilege:** ask for approximate location if precise isn't needed;
   limited photo access instead of the whole library.
6. **Notifications:** Android 13+ requires a runtime permission for posting
   notifications; [S77] ask after the user sees value (e.g. after booking:
   "แจ้งเตือนก่อนนัด 1 วันไหม?").

## Notifications (push)

See [notifications.md](notifications.md) for cross-channel content rules.
Native specifics: [S73]
- Use channels/categories (Android) and notification settings (iOS) so users
  can turn off types, not everything.
- Time-sensitive vs passive: reserve interruptive delivery for things the user
  must act on now.
- Every notification deep-links to the exact screen; back from there leads to a
  sensible parent, not out of the app.
- Group related notifications; update instead of stacking duplicates.

## Deep links and app links

- Support verified app links / universal links so web URLs open the right
  screen in the app when installed and the website otherwise. [S79]
- Mirror the web URL structure (see [experience-architecture.md](experience-architecture.md)).
- Handle links to content the user can't access (signed out, no permission)
  by signing in and then continuing to the target.

## Offline and poor connectivity

Decide per task, and show the state:

| Task type | Behavior |
|---|---|
| Reading recently viewed content | Cache and show with "อัปเดตล่าสุด …" |
| Drafting (notes, forms) | Save locally, sync later, show sync status per item |
| Money movement, booking, irreversible actions | Block with a clear message; never queue silently; reconcile status after reconnect |
| Search of live data | Show offline message and recent results |

Conflicts after sync: show both versions or a clear rule; never discard user
edits silently.

## App lifecycle

- **Interruptions:** calls, app switching and OS termination must not lose
  in-progress input; restore the screen and data on return.
- **Background tasks:** long uploads continue with system progress UI where the
  platform allows; notify on completion.
- **Updates:** force-update screens only for security or breaking API changes;
  explain why and keep data.
- **First launch:** let users see value before sign-up when possible; teach in context;
  an intro sequence is allowed only when the value is not visible without it —
  3 screens maximum, skip always visible (in-product tours: [advanced components](advanced-components.md), max 4 steps).

## Authentication on mobile

- Support biometrics as a convenience for returning users, with passcode fallback.
- Support password managers and passkeys; allow paste. [S12]
- Session length can be longer than web for low-risk apps, but re-authenticate
  for high-risk actions (see [trust-security-privacy.md](trust-security-privacy.md)).

## Gestures

- Every gesture has a visible alternative (button or menu). Hidden swipe-only
  actions are undiscoverable; on the web, dragging needs a single-pointer
  alternative (WCAG 2.5.7). [S10]
- Destructive swipe actions need undo or confirmation.
- Don't override system gestures (edge swipe back, home indicator).

## Accessibility on native

- Every control has an accessibility label (VoiceOver/TalkBack); images have
  descriptions or are marked decorative.
- Support Dynamic Type / font scale up to the largest sizes; test layouts there.
- Respect reduce motion, bold text, high contrast and dark mode settings.
- Logical focus order; group related elements so screen readers don't read
  fragments.

## App store and platform policy

Store review rules affect UX: account deletion must be possible in-app where
required, permission purpose strings are mandatory, subscription terms must be
clear before purchase. Check current store guidelines at design time; this
skill does not track policy changes.

## Native review checklist

1. Navigation and back follow each platform; state is preserved.
2. Targets meet platform guidance (iOS 44 pt default, Android ≥48 dp); safe areas respected.
3. Layout works at largest text size and in dark mode.
4. Permissions asked in context with purpose; denial has an alternative.
5. Notifications are categorized, deep-link correctly and can be controlled.
6. Offline behavior defined per task; no silent queueing of money actions.
7. Interruptions don't lose input.
8. Every gesture has a visible alternative.
9. VoiceOver/TalkBack labels exist for all controls (tested on device).

## Do / Don't

| Do | Don't |
|---|---|
| Ask for camera when the user taps scan, with a clear purpose. | Ask for camera, location and notifications on first launch. |
| Keep the app useful after a permission is denied. | Block the whole app until permission is granted. |
| Follow each platform's back and navigation patterns. | Ship an iOS-style back button on Android that ignores the system back. |
| Deep-link notifications to the exact item. | Open the app home screen from every notification. |
| Restore in-progress input after interruptions. | Lose a half-filled form when a call comes in. |

## Screen archetypes

Pick exactly one per mockup and say which: **Feed** (scannable list, pull to refresh), **Detail** (one item, primary action
fixed), **Onboarding** (3 screens maximum, skip always visible, last screen is sign-in or continue), **Profile** (identity,
stats, settings entry), **Checkout** (order, price, one pay action, errors inline), **Focus** (one task, no tab bar).
A mockup must not fake a device: no invented status icons, correct safe areas, real tab bar with 3 to 5 items.
