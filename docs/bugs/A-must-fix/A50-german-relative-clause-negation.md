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
