# P05-E11. The review — a native Polish speaker signs off the sheet

**Feature:** every string the Polish row renders is confirmed or corrected by a native speaker.
**Shape:** the generated [review-sheet-pl.md](review-sheet-pl.md) (2,408 rows), corrections applied as
data edits in `packages/backend/src/concepts/pl/` and pins in `packages/engine/test/languages/pl.test.ts`,
rulings recorded in the P05 README.
**Scope:** corpus corrections, engine fixes, suite pins. Phase 4.
**Status:** open. Filed 2026-09-28 with E1–E10. Needs a reviewer; none contacted.

## Why

P05 §4: every form in E4–E10 is drafted from model knowledge (D7). A form that reads well but is wrong
survives by not being noticed, and only a native reader notices it. The aspect table (§0.3) is the part
most likely to be amended.

## Rulings owed

- The engine's departures from the plan (README §7): the imperfective *gdyby* clause (*gdyby pies
  biegł*), the imperfective citation infinitive, the stative and *while* pasts, *musiał zjeść* for a
  resultative under a modal, which frequency adverbs force the imperfective, *zostać* + perfective
  participle in the passive, the infinitive as the UI's instruction register (*nie biec*), *niż* +
  nominative in comparison, *swój* on a 1st/2nd-person possessor matching the subject, *powinien byłem*.
- The column authors' `(verify)` items (grep `(verify)` in `concepts/pl/`): among them *ziemia* for both
  GROUND and LAND, *miejsce docelowe* (DESTINATION) beside *cel* (PURPOSE, TARGET), *móc* for CAN, MAY
  and MIGHT, *mówić* for SAY and SPEAK, *działać* for ACT and WORK, KID *dzieciak*, SPEAKER *mówiący*,
  RECENT *ostatnio używany*, OKAY *w porządku*, the grammar terms (*okolicznik* series, *określenie*,
  *wypowiedzenie*), the unpaired statives, CAUSE_VERB *skłaniać*.
- Every `test.fails` row in `pl.test.ts`: the clitic object before the verb (*koty ją widzą*), the
  imperfective imperative of a motion verb (*biegnij*), the partitive genitive of a mass object
  (*zjadł trochę jedzenia*).

## Verification

The sheet regenerated after the corrections, each row marked reviewed in the review copy; reviewer,
date and rows recorded here.

## Out of scope

Promotion (E12). Indeterminate motion verbs, *się* second-position placement.
