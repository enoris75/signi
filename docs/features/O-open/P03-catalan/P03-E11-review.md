# P03-E11. The review — a native Central Catalan speaker signs off the sheet

**Feature:** every string the Catalan row renders is confirmed or corrected by a native speaker.
**Shape:** the generated [review-sheet-ca.md](review-sheet-ca.md) (2,449 rows), corrections applied as
data edits in `packages/backend/src/concepts/ca/` and pins in `packages/engine/test/languages/ca.test.ts`,
rulings recorded in the P03 README.
**Scope:** corpus corrections, engine fixes, suite pins. Phase 4.
**Status:** open. Filed 2026-09-28 with E1–E10. Needs a reviewer; none contacted.

## Why

P03 §4: every form in E4–E10 is drafted from model knowledge. A form that reads well but is wrong
survives by not being noticed, and only a native reader notices it.

## Rulings owed

- The engine's departures from the plan (README §7): the imperfect auxiliary in marked past aspects,
  *ser* for location, the preverbal *no* in negative concord, the locative *a / en* split, the
  infinitive as the UI's instruction register.
- The column authors' `(verify)` items (grep `(verify)` in `concepts/ca/`): among them *truja*, *os /
  ossa*, *diners* as plural-only, *l'Àfrica / el Japó*, *Zúric*, *sursilvà*, *hàgim / haguem*, *veges /
  ves*, *escrivís / escrigués*, *clicar a*, TELL *explicar*, COLLAPSE *caure*.
- NEVER's gloss *a cap temps* (the manner path; *en cap moment* expected).
- Every `test.fails` row in `ca.test.ts` (the weak pronouns *en*, *hi*).

## Verification

The sheet regenerated after the corrections, each row marked reviewed in the review copy; reviewer,
date and rows recorded here.

## Out of scope

Promotion (E12). Valencian and Balearic.
