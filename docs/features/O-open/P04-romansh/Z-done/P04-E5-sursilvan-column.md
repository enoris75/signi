# P04-E5. The Sursilvan column — every concept, with the predicative adjective form

**Feature:** every seeded concept carries an `rm-sursilv` lexeme, or borrows Rumantsch Grischun's (listed in `BORROWED`).
**Shape:** `packages/backend/src/concepts/rm-sursilv/`, the same shape as E4's column.
**Scope:** corpus data and its tests. No rendering.
**Status:** **shipped, 2026-09-27** — see [Done](#done). Filed 2026-09-27 from P04 §1, D1, D5, D11 and the predicative-agreement note.
Depends on E1, E3 and E4's merge code.

## Why

P04 D1 treats Sursilvan as a peer, not a variant of RG, and the P04 table shows why: *gat* not *giat*,
*ei* not *è*, *mangiau* not *mangià*, *buca* not *betg*. Most of the column cannot be derived from E4's.

## Design

### D1. Same cells as E4, plus one per adjective

E4 D1's cells, in Sursilvan morphology (participles in *-au*, *verify*). Every adjective adds a
**predicative masculine singular** form — `predicative_masc_sg` — because Sursilvan marks it with `-s`
where the attributive is bare (*in paun bun* / *il paun ei buns*). Store it, do not derive it: whether
the `-s` rule has exceptions is a reviewer question, and a stored form is data to correct. E9 is the
engine that reads it. *(verify)* whether the masculine plural predicative differs from the attributive
too.

### D2. Do not start from E4

**Recommendation:** author from E3's Sursilvan sources, not by editing a copy of the RG column. Where
the two agree the forms will simply match; starting from a copy makes every unchecked RG form look like
a Sursilvan one — the leak P04's preface warns about (*"a guess that reads well is worse than a hole"*).

### D3. Borrowing is expected to be long

A concept the column does not give borrows Rumantsch Grischun's (E1 D2 as ruled) and is listed in
`BORROWED['rm-sursilv']`. A long list is the honest state until a Sursilvan source or reviewer fills
it — but D2 still holds: a borrowed word is left to the merge, never copied into the column.

## Tests

As E4's, for `rm-sursilv`, plus: every adjective has `predicative_masc_sg`.

## Verification

The `BORROWED` count stated in this ticket's Done section.

## Out of scope

Vallader (E6); rendering (E8, E9).

## Done

Shipped 2026-09-27: **all 840 concepts have their own `rm-sursilv` form; `BORROWED['rm-sursilv']` is empty**
and pinned so. Every form is drafted, not sourced — *(verify)* throughout (see E3's `sources.md`). Every adjective carries `predicative_masc_sg`; EAT is *magliar / magliau*, not the README's *mangiau* — the reviewer rules; a participle after *esser* takes the predicative *-s* (*el ei vegnius*), derived, not stored.

Tests: `packages/backend/src/concepts/rm-sursilv/*.test.ts` (the cells each role must carry, no
`*_past`/`*_future`/`gerund`, the borrowed list, spot checks).
