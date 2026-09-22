# A243. STILL scopes under the negation instead of over it

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

Pinned by `known bugs: STILL under a negation (A243)` in
[core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts),
which also pins what it renders today.

Found seeding STILL for [B67](../../localization/done/B67-place-and-focus-adverbs.md).
