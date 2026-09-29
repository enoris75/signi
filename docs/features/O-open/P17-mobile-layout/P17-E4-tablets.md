# P17-E4. Tablets — 600 to 1024 px, with a finger

**Feature:** a tablet, portrait or landscape, gets a layout that fits it: the canvas and the
translations both readable, and every control a 44 px target for a finger.
**Shape:** a check at tablet sizes, then a decision on the open question and whatever it needs.
**Scope:** frontend. Resolves one of the plan's open questions.
**Status:** open. Filed 2026-09-27 from the plan's "Tablets".

## Why

P17 draws its line at MUI's `sm` (600 px). Above it the desktop layout applies unchanged, but an iPad
in portrait (744–834 px) or a large phone in landscape is a touch device with a desktop's two
resizable columns, a draggable resizer and a docked console.

## Today

Verified at HEAD (37b533a9), 2026-09-27.

- `useCompactLayout()` is below `sm` only
  ([`useCompactLayout.ts`](../../../../packages/frontend/src/hooks/useCompactLayout.ts)).
- The touch-only parts don't depend on width: keycaps hide on `TOUCH_ONLY_MEDIA`, and `useTouchSnap`
  runs for any finger tap. So a tablet already gets the snapped targets and no keycaps.
- The tapped box's bar is enabled for a compact touch phone on the Canvas tab only
  ([`App.tsx:336`](../../../../packages/frontend/src/App.tsx#L336)).
- The canvas column is 58% of the page; at 768 px that is about 440 px, below `MIN_CANVAS_WIDTH`
  (600).

## Design

### D1. Check

At 768×1024, 1024×768 and 834×1194, with touch (Playwright `hasTouch`, then a real iPad if one is
at hand): screenshot the canvas with a three-ring phrase, the docked console, the resizer, and the
header. Record what overflows and what can't be reached by a finger.

### D2. The open question

*Should the canvas take the full width there too, with the translations below?* Recommendation:
yes, below `md` (900 px) on a touch-only device — one column, translations under the canvas, the
docked console kept (there is room for it), no tab bar. Above `md` the desktop layout stays. Record
the ruling in the P17 README.

### D3. The bar

Whether the tapped box's bar is enabled on a touch tablet too. Recommendation: yes — it is keyed to
the finger, not the width; only its `bottom` changes (no tab bar to sit over).

## Tests

- `mobile.spec` (or a new `tablet.spec`) at 768×1024 with touch: no horizontal page scroll; the
  translations are visible without a tab; a tapped box raises the bar.
- A desktop-width spec at 768 px *without* touch keeps today's two columns.

## Verification

D1's screenshots again after the change, both orientations.

## Out of scope

A tablet-specific Phrase view.

## Done

Built 2026-09-27: D1 in Playwright, D2 and D3 as recommended.

- **D1, before** (Playwright Chromium, `hasTouch` + `isMobile`, a three-ring phrase — *the brown cats
  eat the food* — built in the docked console, then a box tapped; screenshots in the session
  scratchpad, `p17-e4/before-*.png`):
  - **768×1024:** the canvas column is 58% (≈ 440 px), below `MIN_CANVAS_WIDTH`. The subject's ring
    overhangs the column's left edge, and the right 42% of the page is empty. No horizontal page
    scroll (`scrollWidth` 768). The resizer is a 6 px strip no finger can grab. The header fits,
    with the tagline wrapped onto three lines. Tapping a box raised no bar.
  - **834×1194:** the same, a bit less cramped (≈ 480 px column). The rings stack vertically and the
    subject overhangs the left edge.
  - **1024×768:** above `md`, so the desktop layout (≈ 590 px column), which is readable. The canvas
    and the docked console share 768 px of height. No bar on a tap.
  - Nothing reachable only by hover. Keycaps are already hidden (`TOUCH_ONLY_MEDIA`), and the touch
    snap already gives the small ring controls their 44 px.
- **D2, ruling: yes, below `md` on a touch-only device.** `useStackedLayout()`
  ([`useCompactLayout.ts`](../../../../packages/frontend/src/hooks/useCompactLayout.ts),
  `STACKED_QUERY = (hover: none) and (pointer: coarse) and (max-width: 899.95px)`, and not
  compact). `App.tsx` then gives the periods column the whole width and draws neither the resizer nor
  the empty right column. The translations were already under the split, so they now sit directly
  under the full-width canvas. The console stays docked, the header stays the desktop's, and there
  is no tab bar. Above `md`, and for any window driven by a mouse at any width, nothing changes.
  1024×768 (landscape iPad) keeps the desktop layout. That is the recommendation's line, and at
  1024 the 58% column is wide enough.
- **D3, ruling: yes, the bar on any touch-only device, not only below `md`.** It is keyed to the
  finger, so an iPad in landscape gets it too. `QuickBarProvider` is enabled for `touchOnly` (on a
  phone, still only on the Canvas tab). Its `bottom` is the tab bar on a phone, the docked console's
  height while that is open, and 0 otherwise. The provider now reports whether a bar is up
  (`onShown`, a plain boolean set in an effect only when it flips), and the help button rises by
  `QUICK_BAR_HEIGHT` while it is. Otherwise the help button (z-index above the bar) sat on the bar's
  close button.
- **D1, after** (`p17-e4/after-*.png`): at 768×1024 and 834×1194 the canvas spans the page and the
  three rings lie side by side (768) or in a loose diagonal (834), with nothing overhanging. At all
  three sizes a tapped verb raises *Present · Positive · Adverb · ⋯ · ×* over the docked console,
  and the help button sits above it. `scrollWidth` equals the viewport width at every size.
  *(The `-full.png` full-page captures are not trustworthy. Chromium's full-page resize drops the
  touch emulation, so they show keycaps and the two-column layout. Read the viewport captures.)*
- **Tests.** New [`e2e/tablet.spec.ts`](../../../../e2e/tablet.spec.ts). At 768×1024 with touch:
  no sideways scroll, no tab bar, the column ≥ 85% of the width, and the translations visible under
  it. A tapped verb raises its bar above the docked console, the help button steps above it, and a
  pill cycles the tense. At 768×1024 without touch: the column stays under 70% (two columns), and a
  click raises no bar. `mobile.spec.ts` and `tidy.spec.ts` (incl. its 390 px no-touch suite) still
  pass.
- **README.** The ruling belongs in the P17 README's open questions. That file has uncommitted edits
  in the main checkout, so it is recorded here and the README row is left for the merge.
- **Owed.** A real iPad, both orientations: whether the full-width canvas at 744–834 px reads well
  with a finger, and whether 1024×768's docked console leaves the canvas enough height (a
  landscape iPad may want the console to start collapsed).
- **A phone held sideways** (found on a real iPhone, 2026-09-28): at 874×402 it is wider than `sm`, so
  it got the tablet's one column with the desktop's header, which took half the screen's height.
  `COMPACT_QUERY` now also matches a touch-only screen under 500 px tall, so a phone is a phone either
  way round; the smallest iPad is 744 px tall in landscape, so no tablet is caught. e2e: `tablet.spec`
  › "a phone held sideways (874×402)", and a mouse window as short keeps the desktop header.
