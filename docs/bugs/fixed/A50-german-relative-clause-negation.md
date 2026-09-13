# A50. German relative clauses skip the main clause's negation rules

**Language:** German

`subordinateClause` (`languages/de/subordinateClause.ts`) has a single `nicht` slot, just before the
verb-final tail, which a negative adverb suppresses. The main clause (`renderClause`) has four rules
the relative clause lacks:

1. a `kein` object already negates the clause, so there is no `nicht`;
2. `nicht` precedes a predicate complement;
3. `nicht` precedes a Mittelfeld adverb;
4. a negated prospective puts `nicht` before `im Begriff`. A19 fixed this for the main clause only.

| Rule | Now | Want |
|---|---|---|
| `kein` object | `der Hund, der keine Maus nicht isst, läuft.` | `der Hund, der keine Maus isst, läuft.` |
| predicate | `der Hund, der müde nicht wird, läuft.` | `der Hund, der nicht müde wird, läuft.` |
| adverb | `der Hund, der immer nicht isst, läuft.` | `der Hund, der nicht immer isst, läuft.` |
| prospective | `der Hund, der im Begriff nicht zu essen ist, läuft.` | `der Hund, der nicht im Begriff zu essen ist, läuft.` |

The adverb row is the worst of the four, because it changes the meaning: "who always doesn't eat"
instead of "who doesn't always eat".

Already right: `der das Buch nicht liest`, `der nicht gegessen hat`, `der nicht essen kann`,
`der nie isst`.

## Shape of the fix

Move the negation-slot computation out of `renderClause` into a helper that both clause builders
call. That covers `applyNicht`, `negProspective`, `negBefore`, `negComplement` and `negAfter`, plus
the rule that turns a `kein` object into the indefinite under a negative adverb. `subordinateClause`
then places the slots in verb-final order. The imperative branches of A49 want the same helper.

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: German negation inside a relative clause* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 by giving the relative clause the main clause's negation rules through one shared
helper, as the shape of the fix proposed:

- [`finiteNegation.ts`](../../../packages/engine/src/languages/de/finiteNegation.ts) (new), with its
  `FiniteNegation` type in [`de.types.ts`](../../../packages/engine/src/languages/de/de.types.ts).
  It decides whether a finite clause needs `nicht`, places it with `nichtSlots`, and returns the
  direct object to render:
  - a negative adverb on the verb or any modal is the negator;
  - a `kein` object is the negator;
  - under a negative adverb, a `kein` object drops to the indefinite.
- [`renderClause.ts`](../../../packages/engine/src/languages/de/renderClause.ts): the declarative and
  the verb-final protasis call the helper instead of deciding inline. Their output is unchanged.
- [`subordinateClause.ts`](../../../packages/engine/src/languages/de/subordinateClause.ts): the
  relative clause calls it too, and fills the four `nicht` slots in verb-final order. So that `nicht`
  can come between an adverb and a predicate complement, the relative's adverbs now come before its
  other complements (`der immer im Markt isst`, was `der im Markt immer isst`). They still come after
  the objects (`der das Buch nicht immer liest`).

All four rows of the table now render as wanted. The fix also covers:

- a modal's adverb: `der nicht immer essen muss`;
- an adverb with an object or a predicate complement: `der die Maus nicht immer isst`,
  `der nicht immer müde wird`;
- an object relative: `die Maus, die der Kater nicht immer isst`;
- other tenses and aspects: `der keine Maus essen wird`, `der nicht müde geworden ist`,
  `der nicht im Begriff ist, die Maus zu essen` (using A52's zu-infinitive group, fixed at the same
  time).

Unchanged: `der das Buch nicht liest`, `der nicht gegessen hat`, `der nicht essen kann`,
`der gerade nicht isst`, `der nie isst`.

Two related problems are still open:

- The command, instruction and infinitive still decide their negation on their own. That is A119,
  which can reuse `finiteNegation`.
- The relative clause always puts its objects before its adverbs. Under `nie`, a `kein` object now
  renders `der eine Maus nie isst`, no longer the double negative `der keine Maus nie isst`. The
  natural order for an indefinite object is `der nie eine Maus isst`. This is not catalogued yet.

- **Tests:** [`packages/engine/test/relative.test.ts`](../../../packages/engine/test/relative.test.ts)
  → *known bugs: German negation inside a relative clause*. The pinning `test.fails` is now a passing
  `test`. New cases:
  - `nicht` before a main verb's or a modal's adverb, with an object, a predicate complement and in
    an object relative;
  - the future, the resultative, the prospective with an object, and a `kein` object without a
    negated verb;
  - guards that `nicht` still comes after the objects, that `nie` still replaces it, and that an
    adverb comes before a locative.

  Colocated unit tests:
  - [`finiteNegation.test.ts`](../../../packages/engine/src/languages/de/finiteNegation.test.ts) (new)
    covers each slot, both negators and the indefinite under `nie`;
  - [`subordinateClause.test.ts`](../../../packages/engine/src/languages/de/subordinateClause.test.ts)
    adds the `kein`, adverb, predicate-complement and prospective cases, and a case for adverbs before
    the other complements.
