# P10-E6. The basic clause — present tense, verb-second, the brace, and *nöd*

**Feature:** the clause renders in `gsw`: present-tense conjugation, verb-second in main clauses,
verb-final in subordinates, separable particles at the brace, and negation with *nöd*.
**Shape:** `de`'s clause machinery carries over; the negator is swapped.
**Scope:** engine; `gsw` suite.
**Status:** **shipped, 2026-09-25** — see [Done](#done). Filed 2026-09-25 from P10 §2 and phases 1–2. Depends on E5.

| plan | `gsw` *(verify)* |
|---|---|
| the cat eats the mouse | d Chatz frisst d Muus. |
| we eat | mir ässed. |
| one eats the mouse | me frisst d Muus. |
| the cat does not eat the mouse | d Chatz frisst d Muus nöd. |
| does the cat eat the mouse? | frisst d Chatz d Muus? |
| the cat comes back | d Chatz chunt zrugg. — particle at the brace |
| I know that the cat eats | ich weiss, das d Chatz frisst. — verb-final |

## Why

Phase 1's *done when*: "the basic clause and noun-phrase sentences render in the `gsw` suite".

## Today

Verified at HEAD (7a392187), 2026-09-25. `de`'s negation is placed by
[`nichtSlots`](../../../../../packages/engine/src/languages/de/nichtSlots.ts),
[`finiteNegation`](../../../../../packages/engine/src/languages/de/finiteNegation.ts) and
[`complementsWithNicht`](../../../../../packages/engine/src/languages/de/complementsWithNicht.ts); the
brace by [`particleGap`](../../../../../packages/engine/src/languages/de/particleGap.ts) and
[`verbFinalCluster`](../../../../../packages/engine/src/languages/de/verbFinalCluster.ts).

## Design

### D1. *nöd* and *kei*

*nöd* sits where *nicht* sits; *kein* becomes *kei / keis / kei* (`keinForm`). **Recommendation:**
rename the `gsw` copies (`noedSlots`, …) so a grep for *nicht* in `gsw/` finds nothing — the
`de`-leak check of P10 §6 made mechanical.

### D2. The generic pronoun

*me* for `de`'s *man*, read from the `gsw` pronoun lexeme, not hardcoded.

### D3. A leak guard

A `gsw` suite test renders a fixed set of plans and fails on any token in a short list of
Standard-German-only words (*nicht, kein, ist, hat, wird, ein, ich bin* — not *der, die, das*, which `gsw` has as a dative article, a demonstrative and the complementiser). Cheap, and
it catches the column regressing to `de` (P10 §6).

## Tests

The table above, a question, and each subordinate type.

## Out of scope

Past, future, progressive, modals (E7–E10).

## Done

Shipped 2026-09-25. The whole table renders as written (with the corpus's *Chatz* as the cat's feminine,
*frisst* its animal verb).

- **D1:** *nöd* is `NEGATOR` in `nichtSlots.ts`, read by every site that wrote *nicht*; *kei* per E5.
  The files keep their German names (`nichtSlots`, `complementsWithNicht`): renaming them all would
  have made the fork unreadable against its parent, and the leak check below is the mechanical guard
  the rename was for.
- **D2:** *me* is the `gsw` GENERIC_PERSON lexeme; `personalPronoun`'s fallback says *me* too.
- **D3:** the suite's leak guard renders thirteen plans across tense, aspect, negation, modals and
  noun phrases and fails on any Standard-German-only word (*nicht, kein*, *ist, hat, wird, ein*, *dass,
  auch, man, gerade, nur, noch, schon, bin, bist, haben, wurde, sein*). A corpus-wide sweep of all 778
  UI strings and 577 definitions found only *durch*, now *dur*.
- Also: *das* / *öb* complementizers, *für … z* purposes, *wo* for a past *when*, *wieso, wohii, wänn*,
  *uf was* for German's *wo*-compounds, *mir wänd* + infinitive for the cohortative.
