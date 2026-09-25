# P10-E8. The future is the present

**Feature:** `tense: 'future'` renders as the present in `gsw`; there is no *werde*-future.
**Shape:** delete `gsw`'s copy of the `WERDEN` machinery; route `future` to `present`.
**Scope:** engine; `gsw` suite. One reviewer ruling.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 D8 and phase 2. Depends on E6.

| plan | `gsw` *(verify)* |
|---|---|
| the cat will eat the mouse | d Chatz frisst d Muus. |
| the cat will eat the mouse tomorrow | d Chatz frisst d Muus morn. |
| the cat will have eaten (`future` + `resultative`) | d Chatz hät d Muus gfrässe. — or *wird … gfrässe haa*? |

## Why

*Werde* + infinitive is marginal and reads as Standard German (P10 D8).

## Today

Verified at HEAD (7a392187), 2026-09-25. `de`'s future is
[`WERDEN`](../../../../../packages/engine/src/languages/de/de.consts.ts#L93), which the prospective
frame reuses (the comment at `de.consts.ts:100`).

## Design

### D1. The bare present

**Recommendation:** render the present, and do **not** insert a temporal adverb the plan does not
have. A future with no time adverb reads as a present; that is a real ambiguity of the language, not
an engine gap. E14's reviewer rules whether a phrase with no adverb is acceptable (P10 D8).

### D2. The prospective

`de`'s prospective reuses `WERDEN`'s shape. Deleting `WERDEN` must not delete that: split the shape
into a `gsw` prospective of its own before removing the future.

## Tests

The table above; a pinned `future == present` equality for a plan without an adverb.

## Out of scope

The progressive (E9).

## Done

Shipped 2026-09-25, as recommended: `gsw` is in `FUTURE_AS_PRESENT_LANGUAGES`, `verbGroup` treats
`future` as `present`, and the `WERDEN` table is deleted. **D2:** the prospective never reused it in the
fork — it is *sii* + *drum und dra* + the *z*-infinitive (*isch drum und dra, d Muus z frässe*, *verify*).
The future perfect is the perfect. The time adverb carries the reference where the plan has one
(the corpus has no *tomorrow*; *later* is tested). Pinned: `future == present` for a plan without an
adverb, awaiting E14's ruling on D8.
