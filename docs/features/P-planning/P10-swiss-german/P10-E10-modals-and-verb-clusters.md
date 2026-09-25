# P10-E10. Modals, the copula, degree — and the verb-cluster order question

**Feature:** modal verbs, the copula and adjective degree render in `gsw`; the order of a
subordinate clause's verb cluster is `de`'s until the reviewer rules (P10 D11).
**Shape:** `modalStack` and `modalVerbGroup` carry over with *chöne, müese, wele, söle, dörfe*;
the cluster order is a documented gap, pinned as `test.fails`.
**Scope:** engine; `gsw` suite.
**Status:** **planning**. Filed 2026-09-25 from P10 D11 and phase 2. Depends on E6 and E7.

| plan | `gsw`, `de` order (ships) | `gsw`, Swiss order *(verify)* |
|---|---|---|
| I must go | ich mues gaa. | ich mues gaa. |
| I had to go | ich ha müese gaa. | ich ha müese gaa. — Ersatzinfinitiv, same in both |
| … that I had to go | … das ich gaa müese ha. | … das ich **ha müese gaa**. |
| … that I can come | … das ich choo cha. | … das ich **cha choo**. |
| the cat is big / bigger / the biggest | d Chatz isch gross / grösser / am gröschte | |

## Why

Phase 2 lists modals, copula and degree. D11 is the hard part: Swiss German raises verbs out of the
final cluster (*wo-n-i ha müese gah*), partly optionally and partly by dialect.

## Today

Verified at HEAD (7a392187), 2026-09-25:
[`modalStack.ts`](../../../../packages/engine/src/languages/de/modalStack.ts),
[`modalVerbGroup.ts`](../../../../packages/engine/src/languages/de/modalVerbGroup.ts),
[`verbFinalCluster.ts`](../../../../packages/engine/src/languages/de/verbFinalCluster.ts).

## Design

### D1. Ship `de`'s order first

**Recommendation:** as P10 D11 — `de`'s order, with the Swiss order pinned in `test.fails` rows so
the gap is visible in the suite. E14's reviewer rules on each cluster shape (2 verbs, 3 verbs,
modal + perfect, modal + particle).

### D2. If the reviewer requires the Swiss order

It touches `verbFinalCluster` and the subordinate clause builder, not only the modal files (P10 §6).
That work gets its own ticket after E14; this one does not pre-build it.

## Tests

The table's left column; the right column as `test.fails`.

## Out of scope

The Swiss cluster order's implementation (a later ticket, if E14 requires it).
