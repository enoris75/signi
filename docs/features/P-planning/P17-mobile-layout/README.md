# P17. Signi on a phone

**Feature:** a layout for phones: one column under a bottom tab bar, a header that folds into a menu,
and a touch-first way to build a phrase.
**Shape:** one workspace and several views of it, one at a time: **Phrase** (new), **Canvas**,
**Translations** and **Console**. Every view reads and writes the same workspace history, so
what one view does the others show, and undo reverses it from any of them.
**Relation to [P01](../../Z-Done/P01-keyboard-first-ux/README.md) and [P02](../../Z-Done/P02-phrase-console/README.md):**
P01 made every control reachable by key, and P02 made the phrase typeable. On a phone, neither the
keys nor the width are there. This plan keeps their handlers and their command table: the Phrase
view's role sheet is P01's keymap listed as buttons, and the console tab is P02's console,
undocked.
**Status:** phases 1–2 built (branch `p17-mobile`); phases 3–4 planned.
**Drawings:** the [design canvas](https://claude.ai/artifact/RYyD3YwGnpDfCkJkYKHQva), with six
phone screens and a note on what breaks today.

Nothing changes above 600 px. A desktop user sees today's page.

---

## Why

On an iPhone 13 (390 px), before this plan:

- The header's seven controls don't wrap, so the page scrolls sideways and the sticky header ends
  up partway down it.
- The canvas stays in the resizable left column (58% of the page, about 200 px). The rings stack
  vertically and spill off its left edge
  ([`overlap.ts:57`](../../../../packages/frontend/src/components/PhraseBuilder/overlap.ts#L57): a
  box wider than the canvas has no room to move, so it holds still).
- The ring controls are 18–22 px targets
  ([`Boxes.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx)), and their
  icons have no labels.
- The docked console's prompt row keeps its context chip and key hints at full width
  (`flexShrink: 0`), which squeezes the field to nothing.
- Typing on the soft keyboard fires keydowns, which switched the app into keyboard mode. Key tips,
  keycaps and "use the arrow keys" then showed on a phone.

## Principles

1. **Views, not a shrunken page.** A phone shows one view at a time. The breakpoint is MUI's `sm`
   (600 px), the same width at which the console already starts hidden.
2. **Move, don't hide.** Every control a desktop user has, a phone user has too: the header's
   controls go into the ⋯ menu, and a ring's controls go into its role's sheet. See
   "declutter by growing": when there is no room to grow, the controls move somewhere with room.
3. **One handler per act.** The menu presses the toolbar's own buttons
   (`pressControl`, as the keys do), and the role sheet runs the keymap's commands. No grammar path
   is phone-only.
4. **Touch targets ≥ 44 px, and nothing keyboard-shaped on a touch-only device.** Keycaps are
   hidden by CSS under `(hover: none) and (pointer: coarse)`, and the soft keyboard no longer
   switches the input mode.
5. **Stowed, not unmounted.** A view that isn't shown keeps its layout at full width, out of sight
   and out of reach. The canvas measures its own width, and a width of nothing would make the
   overlap resolver move every box.

---

## Phases

### Phase 1 — the phone shell (built)

| What | Where |
|---|---|
| `useCompactLayout()` (below 600 px) and `TOUCH_ONLY_MEDIA` | [`hooks/useCompactLayout.ts`](../../../../packages/frontend/src/hooks/useCompactLayout.ts) |
| Header: the brand, the language as flag and code, undo, and a ⋯ menu with save, load, export, import, words and help. The toolbar stays mounted with its buttons hidden and still owns its dialogs. | [`App.tsx`](../../../../packages/frontend/src/App.tsx), [`AppMenu.tsx`](../../../../packages/frontend/src/components/AppMenu.tsx), [`SavedPhrasesToolbar.tsx`](../../../../packages/frontend/src/components/SavedPhrasesToolbar.tsx) |
| Tab bar: Canvas · Translations · Console. The console tab *is* the console's `open` state, so <kbd>&#96;</kbd> and the tab agree. | [`MobileTabBar.tsx`](../../../../packages/frontend/src/components/MobileTabBar.tsx) |
| The canvas at full width, without the resizer or the empty right column. Above it, the phrase in the UI language, which opens the translations when tapped. | [`ResultStrip.tsx`](../../../../packages/frontend/src/components/ResultStrip.tsx) |
| The console, undocked: it fills the space between the header and the tab bar, with no grip and no key hints. The context chip gets its own line above the field. | [`PhraseConsole.tsx`](../../../../packages/frontend/src/console/PhraseConsole.tsx), [`ConsolePrompt.tsx`](../../../../packages/frontend/src/console/ConsolePrompt.tsx) |
| Keycaps hidden on touch-only devices; the soft keyboard no longer switches the input mode. | [`Keycap.tsx`](../../../../packages/frontend/src/keyboard/Keycap.tsx), [`KeyboardProvider.tsx`](../../../../packages/frontend/src/keyboard/KeyboardProvider.tsx) |
| New strings `app.menu` (MENU) and `view.canvas` (CANVAS). Both concepts were already seeded. | [`uiStrings.ts`](../../../../packages/shared/src/uiStrings.ts) |
| e2e at 390 px with touch | [`e2e/mobile.spec.ts`](../../../../e2e/mobile.spec.ts) |

Left for phase 3: the rings still lay themselves out at 358 px, so they stack vertically and the
widest one overhangs the edge.

### Phase 2 — the Phrase view (built)

The default tab on a genuinely touch phone. A narrowed *desktop* window (no touch) still opens on
the Canvas, since it's a mouse there and the compact canvas (phase 1) already works — see
"touch, not just narrow" below.

Each period is a list of its filled roles in sentence order (subject, verb, its adverbs and
complements): a colored disc, the role's name, the word (an adjective rides its noun's row as its
own chip), and a chip for anything else set on it (number, gender, …). Tapping an empty role opens
its word picker, full screen; picking a word auto-advances to the next empty role and opens *its*
picker too, the way the canvas's own auto-advance does. Tapping a filled role opens a sheet: the
word (Replace, Remove) and a grid of every control its ring carries.

- **Where it renders** — [`RoleList.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/RoleList.tsx),
  mounted inside `PhraseBuilder.tsx` (`listView` prop) as another body next to the canvas, which
  is kept mounted behind it (stowed — see Principle 5) so nothing about its layout or state
  changes. `PhraseWorkspace.tsx` and `App.tsx` thread `listView`/`onShowCanvas` down to it.
- **A role's controls are two buckets PhraseBuilder already computes, folded into one grid:**
  `satelliteIconsByParent[slot]` (number, gender, determiner, tense, adjective's own reveal, …) and
  `perimeterByNoun[slot]` (possessor, relative clause, coordination, standard, examples — the ones
  the canvas seats on the noun's own dotted ring, not the word's). Missing perimeter controls from
  the sheet was the first bug this phase found.
- **Two kinds of tap, same list of icons:**
  - A **direct toggle** (number, gender, negation) or a plain **reveal** (adjective, determiner,
    relative clause) — `icon.onToggle()`, exactly what its click does on the canvas.
  - A satellite that always carries a value and isn't a direct toggle — tense, aspect, voice,
    degree, a modifier's relation, a possessor's role, a conjunction — is a chip a *click cycles*
    on the canvas, not a box a dot reveals (`VerbPhraseBuilder.tsx`'s `TenseToggleBox` and its
    kin). Its own satellite icon only reveals that chip, so tapping it in the sheet instead runs
    the matching `KEYMAP` command directly (`PhraseBuilder.tsx`'s `runCommand`: filter `KEYMAP` by
    `c.satellite?.test(icon.key)` and `boxScopesOf(slot, selection)`, then `cmd.run(ctx)` with a
    stub `nav`, since a value-cycling command never uses it). This was the second bug: without it,
    tapping "Tense" just folded/unfolded an already-shown box and nothing appeared to happen.
  - A control that opens a ring of its own (possessor, conjunct, standard, examples) is drawn only
    on the canvas, so pressing it — by either path above — also closes the sheet and switches to
    the Canvas tab (`onShowCanvas`). Ordering this *after* the two paths above, not only in the
    fallback one, was the third bug: `runCommand` routes a possessor tap to the real
    `handleTogglePossessor` (better than the satellite's own plain reveal), and skipping the
    ring-check whenever `runCommand` handled the tap left the tab never switching.
- **Word pickers are the canvas's own** (`slotTypeahead`), shown in a second sheet. `SlideProps`
  focuses its field once the sheet has entered — MUI's own `autoFocus` fires before the slide
  finishes and loses the focus race — and its `Drawer` disables the focus trap so the picker's
  own popper (a MUI `Popper`, outside the sheet's DOM) can still take it.
- **Surface forms.** A translation carries no per-role text
  ([`shared/src/index.ts`](../../../../packages/shared/src/index.ts), `Translation`), so the list
  shows the lemma plus its chips, not "cats". A per-role render would need a new request type.
- **Touch, not just narrow.** `App.tsx` reads `isTouchOnly()` once (a lazy `useState` initializer)
  to choose the phone's default tab, not `useCompactLayout()` alone: a real phone starts on
  Phrase, but a desktop window merely narrowed by a mouse user starts on Canvas. Without this,
  `tidy.spec.ts`'s phone-width suite (390 px, no touch) would open on a view its `Builder` helpers
  know nothing about. `e2e/fixtures.ts`'s `Builder.goto()` also had to accept either the canvas's
  `typeahead-subject` or the Phrase view's `role-subject` as proof the page loaded — checked with
  polled `isVisible()`, not an `.or()` locator, since the stowed one is still in the DOM and a
  combinator over two present-but-not-both-visible elements is a strict-mode violation.
- **e2e:** [`e2e/mobile.spec.ts`](../../../../e2e/mobile.spec.ts), `describe('the Phrase view')`.

### Phase 3 — the canvas by touch

- Fit and zoom: the canvas lays out at a minimum logical width and scales down to fit. Pinch zooms
  and one finger pans. Today `touchAction: none` on the canvas
  ([`PhraseCanvas.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseCanvas.tsx))
  blocks the page's scroll anywhere on it.
- On a coarse pointer, a tapped box shows its three most-used controls as 44 px labelled pills, plus
  "All controls", which opens phase 2's sheet.
- The right-edge period controls
  ([`BorderControls.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/PeriodContainer/BorderControls.tsx))
  move into the period's ⋯.

### Phase 4 — the console's command bar

A row of keys above the soft keyboard: <kbd>Tab</kbd>, `/adj`, `/pl`, `/not`, `/`, `( )` and run.
They are the keys a phone keyboard buries, and the ones the console's completion needs. Completions
become 44 px rows.

## Open questions

- **Tablets.** At 600–1024 px the desktop layout applies unchanged. Should the canvas take the full
  width there too, with the translations below?
- **Where the console's preview shows.** On a phone the canvas is a tab away from the prompt. The
  prompt's preview line (the sentence under the line being typed) may be enough, or the result strip
  could follow the preview.
