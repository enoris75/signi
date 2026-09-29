# P04-E17. Every UI string and definition renders in each variety

**Feature:** the backend's boot render of the 615 UI strings and 619 engine-composed definitions comes
out non-empty in each Romansh variety — the preview warning's count reaches zero.
**Shape:** no new mechanism. The warnings name what does not render; each hole is a missing word
(E4–E6) or a construction an engine ticket missed.
**Scope:** corpus gaps, engine gaps, per variety. P04 phase 5, run before review so the reviewers see
every string.
**Status:** **done for `rm-rumgr` and `rm-sursilv`, 2026-09-27** — see [Done](#done); Vallader waits on its fork (E8). Filed 2026-09-27 from P04 §4 and phase 5. Depends on E4–E16.

## Why

P04 §4 counts the UI strings and definitions as the bulk of what each reviewer signs off. They must
render before E19 can generate the sheet, and before promotion (E20) turns the warning into a failure.

## Today

Verified at HEAD (98a65a47), 2026-09-27.

- **P04 §4's counts are stale:** 483 UI strings and 148 definitions then; **615 UI strings and 619
  `definition:` plans** now (P09, P11, P13 have grown them). ~1,234 strings per variety, **~3,700 for
  the three** — three times P04's estimate.
- A preview language's holes are counted and warned, not thrown:
  [`uiStrings.ts:90-100`](../../../../../packages/backend/src/uiStrings.ts#L90-L100),
  [`definitions.ts:55-65`](../../../../../packages/backend/src/definitions.ts#L55-L65).

## Design

### D1. Work from the warning, variety by variety

Boot, read the three counts, list the failing keys, and group them by cause: an unseeded Romansh word
(a column fix; with borrowing, a missing word is no longer possible) or an engine path returning `''`
(a fix in that folder, with a suite row). Record the three counts at the start and at the end in this
ticket's Done section.

### D2. The `instruction` register

UI controls render as `instruction` (E16 D2). If E16 left that open for a variety, it is decided here,
since every button label waits on it.

### D3. A variety may finish short

A variety with no reviewer in sight need not reach zero here (P04 §6: *"stays `preview`
indefinitely"*). Stop at the holes no source can fill, and list them.

## Tests

A backend test per variety pinning the count of unrendered UI strings and definitions at its Done
value, so a regression shows.

## Verification

Backend boot log: each variety's two counts as recorded.

## Out of scope

Review of the rendered text (E19); the boot check failing rather than warning (E20).

## Done

`rm-rumgr` done 2026-09-27; the idioms' rows stay empty until their engines exist (E8).

| `rm-rumgr` | UI strings unrendered | definitions unrendered |
|---|---|---|
| start (the empty engine, HEAD 317f10dd) | 639 of 792 | 613 of 613 |
| end | **0 of 792** | **0 of 613** |

(At the start the 153 that did render were word, determiner and possessive entries, which the
translator spells from the lexicon without an engine's `render`. P04 §4's 615 / 619 have grown to
792 / 613.)

- **D1:** no hole was a missing word — every concept exists in the column or is borrowed (E1 D2) —
  and no engine path returned `''`: the fork (E7–E16) rendered everything on its first boot. Reading
  the renders found one construction wrong, the possessor relative, which lacked the possessed noun's
  article (*in pled significaziun dal qual …* → *in pled la significaziun dal qual …*, the HYPERNYM
  definition and `pick.*` strings); fixed in `relativeText`, with a suite row.
- **D2, the `instruction` register:** the infinitive, as E16 D2 ruled — *Memorisar la frasa*, *Ir a
  dretga*, *Allontanar quest possessur*.
- **D3:** nothing left short.
- The review sheet is regenerated (`review-sheet-rm-rumgr.md`, 2,508 lines), and its generator now reads
  the suite's double-quoted sentences (*"l'um."*) and escaped labels too.

Tests: `backend/src/uiStrings.test.ts` and `definitions.test.ts` pin `rm-rumgr`'s unrendered counts at 0.
The tests that let any preview row be empty (`translate`, `translateSubordinator`, `sweep-definitions`,
`definitions`) now allow it only for an empty engine (`EMPTY_ENGINES`: the two idioms, until E8), and
`sweep-definitions`'s no-two-glosses-alike check covers `rm-rumgr`.

### Sursilvan, 2026-09-27

| `rm-sursilv` | UI strings unrendered | definitions unrendered |
|---|---|---|
| start (the empty engine, 5ac25f87) | 639 of 792 | 613 of 613 |
| end | **0 of 792** | **0 of 613** |

- **D1:** as for RG, no hole was a missing word (the column borrows nothing) and no engine path returned
  `''`: the fork rendered everything on its first boot. Reading the renders showed the negative concord
  ruling at work in the UI (*Quest verb accepta negin cumplement da termin*, no *buca*) and E9's
  predicative in the adjective glosses (*ch'ei averts per tuttas las persunas*, *caschunar in object da
  daventar pli gronds*) — both *(verify)* for the reviewer, not holes.
- **D2, the `instruction` register:** the infinitive, as E16 ruled — *Memorisar*, *Svidar igl adverb*,
  *Transfurmar questa perioda en ina frasa infinitiva*.
- **D3:** nothing left short.
- The review sheet is regenerated (`review-sheet-rm-sursilv.md`).

Tests: `backend/src/uiStrings.test.ts` and `definitions.test.ts` pin `rm-sursilv`'s unrendered counts at
0; `'rm-sursilv'` is out of `EMPTY_ENGINES`, so `translate`, `translateSubordinator`, `definitions` and
`sweep-definitions` (its no-two-glosses-alike check included) require its row.

**Vallader, 2026-09-27.**

| `rm-vallader` | UI strings unrendered | definitions unrendered |
|---|---|---|
| start (the empty engine, 5ac25f87) | 639 of 792 | 613 of 613 |
| end (checked against the built engine) | **0 of 792** | **0 of 613** |

No hole was a missing word (all 840 concepts are Vallader's own) and no engine path returned `''`. D2:
the `instruction` register is the infinitive (*Arcunar la frasa intera*). D3: nothing left short. The
review sheet is generated (`review-sheet-rm-vallader.md`). Tests: `uiStrings.test.ts` and
`definitions.test.ts` pin Vallader's two zeros beside RG's.
