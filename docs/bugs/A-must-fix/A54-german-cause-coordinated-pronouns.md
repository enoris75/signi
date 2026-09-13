# A54. The German cause reads pronoun-vs-noun from the first conjunct only

**Language:** German

The `cause` branch of `complementsPhrase` (`languages/de/complementsPhrase.ts`) reads the head of
`firstConjunct(c.phrase)` and chooses one rendering path for the whole group:

- **First conjunct is a pronoun:** every conjunct takes the pronoun path, its dative form with one
  preposition in front. A following noun therefore renders bare (`und Mann`). In the negative, the
  possessive `durch <possessive> Schuld` is computed from that first pronoun alone and the rest are
  dropped.
- **First conjunct is a noun:** the generic path repeats `wegen dem` per conjunct and renders a
  following pronoun like a noun (`wegen dem du`).

| Cause | Now | Want |
|---|---|---|
| MAN + SECOND_PERSON | `der Kater läuft wegen dem Mann und wegen dem du.` | `der Kater läuft wegen dem Mann und dir.` |
| SECOND_PERSON + MAN | `der Kater läuft wegen dir und Mann.` | `der Kater läuft wegen dir und dem Mann.` |
| negative, FIRST + SECOND_PERSON | `der Kater läuft durch meine Schuld.` | `der Kater läuft durch meine und deine Schuld.` |

Already right: a group of nouns (`durch die Schuld des Mannes und der Katze`) and a group of
pronouns under a neutral or positive sentiment (`dank mir und dir`). A *negative* group mixing a noun
and a pronoun has no clean target and is not pinned. `wegen dem` (dative rather than genitive) is the
separate B09 simplification.

## Shape of the fix

Emit the preposition once, then render each conjunct in its own form: a pronoun's `disjunctive`, or
a noun's determiner and noun in the dative. For the negative sentiment, build the possessive per
pronoun conjunct and coordinate them before `Schuld`.

| | |
|---|---|
| **Test** | `complements/cause.test.ts` → *known bugs: German cause with coordinated pronouns* (1 `test.fails`) |
