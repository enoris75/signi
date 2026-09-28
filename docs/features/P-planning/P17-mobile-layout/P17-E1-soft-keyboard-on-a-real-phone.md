# P17-E1. The soft keyboard on a real phone — the command bar rides the keyboard, not the layout

**Feature:** on a real iPhone and a real Android phone, the console's prompt and its command bar sit
directly above the soft keyboard while it is open, and the tab bar gets out of the way.
**Shape:** a check on two real devices, then a `visualViewport`-driven bottom offset for the console
tab if the check fails.
**Scope:** frontend. After phase 4.
**Status:** open. Filed 2026-09-27 from phase 4's "no `visualViewport` plumbing needed".

## Why

Phase 4 assumed the command bar lands above the keyboard because it is the last child of a column
that ends where the prompt does. Every check of that ran in Playwright's emulated 390 px viewport,
which has no soft keyboard at all. On a real phone the assumption depends on how the browser treats
the keyboard, and the two big ones differ.

## Today

Verified at HEAD (37b533a9), 2026-09-27.

- The console tab is `position: fixed` with `top: headerOffset` and `bottom: TAB_BAR_HEIGHT`
  ([`App.tsx:419`](../../../../packages/frontend/src/App.tsx#L419)); the tab bar is `position: fixed;
  bottom: 0` ([`MobileTabBar.tsx:33`](../../../../packages/frontend/src/components/MobileTabBar.tsx#L33)).
  Both are anchored to the *layout* viewport.
- The viewport meta is `width=device-width, initial-scale=1.0`
  ([`index.html`](../../../../packages/frontend/index.html)), with no `interactive-widget`.
- Nothing reads `visualViewport` except the touch snap's pinch scale
  ([`useTouchSnap.ts:101`](../../../../packages/frontend/src/hooks/useTouchSnap.ts#L101)).
- iOS Safari does not shrink the layout viewport for the keyboard: it overlays it, then scrolls the
  page to keep the focused field in sight. So the command bar and the tab bar are probably *under*
  the keyboard there, and the prompt may be scrolled partway up. *(verify on a device)*
- Chrome on Android defaults to `resizes-visual` since v108, so it behaves like iOS unless the page
  opts into `interactive-widget=resizes-content`. *(verify on a device)*

## Design

### D1. Check first

On an iPhone (Safari) and an Android phone (Chrome), open the Console tab, tap the field, and record
with a screenshot each: where the prompt sits, whether the command bar is visible, whether the tab bar
shows between the bar and the keyboard, and whether tapping a bar key keeps the keyboard up (the
`onPointerDown` `preventDefault` from phase 4). If both already work, close this ticket with the
screenshots and change nothing.

### D2. If not: follow the visual viewport

A small hook (`useKeyboardInset`) that reads `visualViewport.height` + `offsetTop` against
`innerHeight` on the viewport's `resize` and `scroll` events and returns the keyboard's height (0 when
closed). The console tab's `bottom` becomes that inset when it is non-zero, and `TAB_BAR_HEIGHT`
otherwise; the tab bar hides while the inset is non-zero (it is behind the keyboard anyway, and on
Android it would otherwise ride up with it). **Open point:** whether adding
`interactive-widget=resizes-content` to the viewport meta is enough on Android on its own and the hook
is iOS-only in practice. Recommendation: use the hook for both — one path, and the meta changes every
other view's layout too.

### D3. Not a transform

Nothing here scales or translates the canvas (see the phase 3 notes); the canvas is a different tab
and is stowed while the console shows.

## Tests

- Unit: `useKeyboardInset` against a stubbed `visualViewport` (closed, open, open and scrolled).
- e2e can't open a soft keyboard. Add one spec that stubs `visualViewport` and checks the console tab's
  bottom edge follows it and the tab bar hides.

## Verification

D1's screenshots, on both devices, before and after.

## Out of scope

The Phrase view's word-picker sheet with the keyboard up — check it in D1 too, but file what it shows
as its own ticket.

## Done

Built 2026-09-27: D2 (the recommended path), shipped ahead of D1 because no real phone was at hand.

- **What shipped.** [`hooks/useKeyboardInset.ts`](../../../../packages/frontend/src/hooks/useKeyboardInset.ts):
  `keyboardInset(win)` is `innerHeight − (visualViewport.offsetTop + visualViewport.height)`, rounded,
  and 0 below 80 px (a collapsing toolbar, not a keyboard), on a pinch-zoomed page (`scale > 1.01`),
  or without a `visualViewport`. The hook reads it on the visual viewport's `resize` and `scroll`,
  and only on a phone (`useKeyboardInset(compact)`). In `App.tsx` the console tab (now
  `data-testid="console-tab"`) takes that inset as its `bottom` while it is non-zero and
  `TAB_BAR_HEIGHT` otherwise, and the tab bar is not drawn while it is non-zero.
- **Ruling on the open point.** The hook for both platforms, as recommended; the viewport meta is
  unchanged (`interactive-widget=resizes-content` would change every view's layout, and Chrome would
  then shrink the layout viewport, which the hook reads as 0 and the tab bar handles as today).
- **D3.** Nothing transforms anything; only the console tab's `bottom` changes.
- **Tests.** Unit: `test/hooks/useKeyboardInset.test.ts` (6: closed, open, open and panned, the
  toolbar/zoom/no-viewport guards, the hook following resize and scroll, disabled). e2e:
  `mobile.spec.ts` › the console command bar › "rides the soft keyboard" — stubs `visualViewport` in an
  init script, opens it by 336 px with the page panned 100 px, and checks the console tab ends at the
  keyboard's top, the command bar sits on it, the field keeps focus and the tab bar is gone; closing
  it brings the tab bar back.
- **D1 — owed.** An iPhone 17 simulator (iOS 26.1) was booted and Mobile Safari reached the dev stack
  (screenshot of the Phrase view on load: `scratchpad/p17-e1/sim-0-load.png`), but no tap could be
  driven into it from this machine's session (`osascript` has no assistive access, CGEvent posting is
  not permitted, no `idb`), and iOS only raises the soft keyboard for a real gesture. So neither the
  "before" nor the "after" screenshot with the keyboard up exists. Still owed: on an iPhone (Safari)
  and an Android phone (Chrome), the four observations of D1 with the fix in, and the Phrase view's
  word-picker sheet with the keyboard up (file it as its own ticket if it misbehaves).
