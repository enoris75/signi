# A244. STILL scopes under the negation instead of over it

**Languages:** English, French, German

A `frequency` adverb is placed inside the negation, so "still" is denied rather than denying. The
three languages that mark the scope lexically all say something else than the plan means, and French
says the opposite: *ne … pas encore* is "not yet", the reading STILL's negation is not.

| Case | Now | Want |
|---|---|---|
| the CAT does not STILL EAT the FOOD (en) | `the cat does not still eat the food.` | `the cat still does not eat the food.` |
| … fr | `le chat ne mange pas encore la nourriture.` | `le chat ne mange toujours pas la nourriture.` |
| … de | `der Kater frisst das Essen nicht noch.` | `der Kater frisst das Essen noch nicht.` |

The **Want** column is written by hand: the placement rule has no notion of an adverb outscoping the
negation, and French needs a second lexeme (*toujours*) for the negated reading.

**Already right.** Italian, Spanish, Portuguese and Japanese place the adverb where it reads
correctly (`il gatto non mangia ancora il cibo.`, `el gato no come todavía la comida.`, `o gato não
come ainda a comida.`, 猫は食べ物をまだ食べません。), and STILL in an affirmative clause is right in all
seven.

**Nothing shipped shows it**: STILL's only use in a gloss is KEEP's "still to have objects", which is
affirmative.

Pinned by `known bugs: STILL under a negation (A244)` in
[core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts),
which also pins what it renders today.

Found seeding STILL for [B67](../../localization/done/B67-place-and-focus-adverbs.md).

## Resolved

2026-09-22, with [A245](A245-also-has-no-negative-form.md): the two are the placement and the word
halves of one gap, and one mechanism serves both. An adverb lexeme can now say what changes about it
under a negation — **`negative`**, the word, and **`negative_slot`**, the position — read by
[`negativeAdverb`](../../../packages/engine/src/functions/negativeAdverb.ts), whose three slots are
`pre-negation` (ahead of the whole negated group), `pre-negator` (immediately before the negator
word, wherever the language puts it) and `final` (the end of the clause).

STILL is seeded in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts) with
`negative_slot: 'pre-negation'` for English, `negative: 'toujours', negative_slot: 'pre-negator'` for
French and `negative_slot: 'pre-negator'` for German; the other four name neither and are untouched.
[`en/predicateParts`](../../../packages/engine/src/languages/en/predicateParts.ts) splices the
pre-negation adverb in front of the predicate parts, which reaches every branch that builds a verb
group; [`fr/predicateText`](../../../packages/engine/src/languages/fr/predicateText.ts) writes the
pre-negator word between the verb and its "pas" inside `negateFinite`; and
[`de/adverbSlots`](../../../packages/engine/src/languages/de/adverbSlots.ts) writes the adverb ahead
of the "nicht" it shares the Mittelfeld slot with, so a known object still steps in front of both.

Renders the Want column: `the cat still does not eat the food.`, `le chat ne mange toujours pas la
nourriture.`, `der Kater frisst das Essen noch nicht.`

**One frame is deliberately left alone**: an English *question* fronts the first word of the
predicate, so a leading adverb would be taken for the auxiliary. The interrogative keeps the
adverb in its ordinary frequency slot there (`does the cat not still eat the food?`), as it did
before the rule existed.

Guarded by *known bugs: STILL under a negation (A244)* in
[core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts),
now five tests: the three Want rows, the four languages that were already right plus the whole
affirmative paradigm, the past / future / perfect / copula frames, the question, and a regression
that an ordinary frequency adverb still sits inside the negation.
