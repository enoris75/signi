# A371. An attributive superlative drops its set

**Languages:** all seven

P09-E19 gave a superlative a set to pick from: on `most` / `least` the standard of comparison is the
set, "the house is the biggest **in the city**". The predicate says it in all seven. The same set on
an attributive adjective (`adjectiveStandards` on a superlative, which P09-E51 lets the canvas build as
the noun's *Comparison set*) reaches no language: the noun phrase renders as if it had none.
"the man sees the biggest house in the city" becomes "the man sees the biggest house."

| Case | Now | Want |
|---|---|---|
| en | `the man sees the biggest house.` | `the man sees the biggest house in the city.` |
| it | `l'uomo vede la casa più grande.` | `l'uomo vede la casa più grande della città.` |
| fr | `l'homme voit la maison la plus grande.` | `l'homme voit la maison la plus grande de la ville.` |
| de | `der Mann sieht das größte Haus.` | `der Mann sieht das größte Haus der Stadt.` |
| es | `el hombre ve la casa más grande.` | `el hombre ve la casa más grande de la ciudad.` |
| ja | `男は最も大きい家を見ます。` | `男は都市の中で最も大きい家を見ます。` |
| pt | `o homem vê a maior casa.` | `o homem vê a maior casa da cidade.` |

The **Want** column is written by hand, not rendered by a fix: each is the predicate's own set (below)
moved after the attributive noun phrase, or before it in Japanese. `least` drops the set the same
way ("the man sees the least big house.").

**Already right.** The predicate superlative: `the house is the biggest in the city.`, `la casa è la
più grande della città.`, `das Haus ist das größte der Stadt.`, `家は都市の中で最も大きいです。`
An attributive comparative keeps its standard ("a bigger cat than the dog", P09-E18).

**Found by** P09-E51's D4, which left the attributive set out of the canvas task for want of this, and
re-probed at c8f098dc.

**Decision for the fixer:** where the set goes against a possessor or a relative clause on the same
noun, which A372 raises for the comparative's standard.

| | |
|---|---|
| **Test** | `comparison.test.ts` → *known bugs: an attributive superlative drops its set (A371)* (1 `test.fails`: the object in all seven; plus a regression test pinning the predicate's set) |
