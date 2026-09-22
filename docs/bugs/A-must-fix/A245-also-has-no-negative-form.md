# A245. ALSO under a negation keeps its positive word

**Languages:** English, Italian, French, German, Spanish, Portuguese

Six of the seven languages have a **separate word** for *also* under a negation — English postposed
*either*, Italian *neanche*, French *non plus*, German *auch nicht*, Spanish *tampoco*, Portuguese
*também não* — and the engine writes the positive one in the positive position, which is
ungrammatical or reads as a contrast in each.

| Case | Now | Want |
|---|---|---|
| the CAT does not ALSO EAT the FOOD (en) | `the cat does not also eat the food.` | `the cat does not eat the food either.` |
| … it | `il gatto non mangia anche il cibo.` | `il gatto non mangia neanche il cibo.` |
| … fr | `le chat ne mange pas aussi la nourriture.` | `le chat ne mange pas non plus la nourriture.` |
| … de | `der Kater frisst das Essen nicht auch.` | `der Kater frisst das Essen auch nicht.` |
| … es | `el gato no come también la comida.` | `el gato tampoco come la comida.` |
| … pt | `o gato não come também a comida.` | `o gato também não come a comida.` |

The **Want** column is written by hand. German alone needs no new word, only the other order; the
other five need a negative-polarity lexeme on the adverb, which no seed field carries today.
[A244](A244-still-scopes-under-the-negation.md) is the placement half of the same gap.

**Already right.** Japanese (同じく食べません) and every affirmative clause.

**Nothing shipped shows it**: ALSO's gloss ("in the same way") is a verbless phrase.

Pinned by `known bugs: ALSO under a negation (A245)` in
[core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts),
which also pins what it renders today.

Found seeding ALSO for [B67](../../localization/done/B67-place-and-focus-adverbs.md).
