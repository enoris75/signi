# P04-E6. The Vallader column — every concept, in `concepts/rm-vallader/`

**Feature:** every seeded concept carries an `rm-vallader` lexeme, or borrows Rumantsch Grischun's (listed in
`BORROWED`).
**Shape:** `packages/backend/src/concepts/rm-vallader/`, the same shape as E4's column.
**Scope:** corpus data and its tests. No rendering.
**Status:** **shipped, 2026-09-27** — see [Done](#done). Filed 2026-09-27 from P04 §1, D1, D5 and D11. Depends on E1, E3 and E4's merge code.

## Why

Vallader is the Engadine pole of P04 D1's continuum, with its own literary tradition and its own
dictionaries (Peer, the *Vocabulari fundamental*). Its column is its own body of work, from its own
sources.

## Design

### D1. Same cells as E4

E4 D1's cells in Vallader morphology. Every verb's 3sg of *esser* is the sharpest marker (*es*,
*verify*); the negation particle *nu* is the engine's (E11), not stored.

### D2. Do not start from E4 or E5

As E5 D2: author from E3's Vallader sources. **Puter forms are not Vallader forms** (P04 D1 keeps Puter
out of scope); a source covering *rumantsch ladin* as a whole is checked form by form.

### D3. Borrowing is expected to be long

As E5 D3.

## Tests

As E4's, for `rm-vallader`.

## Verification

The `BORROWED` count stated in this ticket's Done section.

## Out of scope

Rendering (E8).

## Done

Shipped 2026-09-27: **all 840 concepts have their own `rm-vallader` form; `BORROWED['rm-vallader']` is empty**
and pinned so. Every form is drafted, not sourced — *(verify)* throughout (see E3's `sources.md`). The 1sg of *avair* is stored *n'ha*; regular cells are built by small conjugation helpers in `verbs.ts`, the irregular core written out.

Tests: `packages/backend/src/concepts/rm-vallader/*.test.ts` (the cells each role must carry, no
`*_past`/`*_future`/`gerund`, the borrowed list, spot checks).
