# P04-E18. The interface — three near-identical rows, and accented search

**Feature:** a reader can tell the three Romansh rows apart at a glance, and a Romansh speaker's
accented typing finds concepts in the picker once a variety is an interface language.
**Shape:** a check of the panel with the three rows filled, and diacritic folding in the concept
picker's search.
**Scope:** frontend. Phase 3–5.
**Status:** **shipped, 2026-09-27**, but for the real-browser check — see [Done](#done). Filed 2026-09-27 from P04 §3 and §6. Depends on E2 and enough of E10–E16 for the
rows to carry text.

## Why

P04 §6: *"Three rows of near-identical text is a UI cost borne by every user."* E2 gives each row a
label and arms; this ticket checks that it is enough once the rows are full.

## Today

Verified at HEAD (98a65a47), 2026-09-27.

- The console's completion folds diacritics
  ([`complete.ts:171`](../../../../packages/frontend/src/console/language/complete.ts#L171), `fold`).
- The concept picker's search does not: [`useConceptLabel.ts:61`](../../../../packages/frontend/src/i18n/useConceptLabel.ts#L61)
  is `haystack.toLowerCase().includes(q)`. Typing *mangia* finds *mangià* only by prefix luck; *gia*
  does not find *già*. This already affects `it`, `fr`, `es` and `pt` today.

## Design

### D1. Fold in the picker

Reuse the console's `fold` for the picker's haystack and query. Not Romansh-specific; filed here
because P04 §3 raised it. **Open point:** whether folding belongs in `@signi/shared` so both call
sites import one function.

### D2. The rows

With the three rows full, on desktop and on the phone layout (P17), check: each row's label is visible
without hovering; the arms are distinguishable (E2 D3); nothing truncates *Romansh (Rumantsch
Grischun)*. **Open point:** whether the panel should collapse identical Romansh rows into one with
three labels. Recommendation: no — it hides that the three were rendered separately, which is the
point of P04 D1 — but record the ruling.

## Tests

- `useConceptLabel` test: an unaccented query finds an accented label.
- `TranslationPanel.test.tsx`: three Romansh rows each with its label and arms.

## Verification

In a real browser, both themes, desktop and phone width.

## Out of scope

Row reordering (already shipped, remembered in the browser).

## Done

- **D1:** `fold` moved to `@signi/shared` (`fold.ts`); the console imports it, and the picker's search
  (`useConceptSearch`) folds query and haystack. It also folds Japanese voicing marks (か finds が), as
  the console already did.
- **The arms**, rendered at the panel's 14.4px and at 4×, light and dark: the hairline is now mid-grey
  (the black fields vanished on dark), and the ibex was redrawn — it reads as a rearing goat at 4×, as a
  black mark on white at 14.4px. All four are distinct from each other and from the emoji flags.
- **D2 not done:** the panel in a real browser, dark theme and phone width, and whether *Romansh
  (Rumantsch Grischun)* truncates.

Tests: `VerbTypeahead.test.tsx` (*gia* finds *già*, *creer* finds *créer*).
