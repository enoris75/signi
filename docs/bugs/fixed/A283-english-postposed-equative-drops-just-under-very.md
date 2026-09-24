# A283. English drops *just* from a postposed equative with VERY

**Languages:** English

VERY on an equative is *just*: "the cat is **just** as big as the dog". Before a noun English has
no "*a just as big cat", so the lexeme drops the intensifier there (`attributive_drop_degrees:
'equally'` on VERY, [A255](../fixed/A255-very-on-an-equative.md)), and "an equally big cat" keeps the adverb alone. But an
attributive equative with a standard now stands **after** the noun
([P09-E18](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E18-attributive-comparison.md)):
"a cat as big as the dog". That is the predicate's word order, where *just* is fine, yet the drop
still fires, and the intensifier the other six languages keep is lost.

| Case | Now | Want |
|---|---|---|
| the MAN SEEs a CAT (VERY, `equally` BIG, standard the DOG) | `the man sees a cat as big as the dog.` | `the man sees a cat just as big as the dog.` |
| the same phrase as the subject of EAT | `a cat as big as the dog eats.` | `a cat just as big as the dog eats.` |
| the CAT BE an ANIMAL (VERY, `equally` BIG, the DOG) | `the cat is an animal as big as the dog.` | `the cat is an animal just as big as the dog.` |

**Why this target.** It is the predicate's *just as big as the dog*
([intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts), "with a standard: just as
big as the dog"), moved behind the noun as the equative itself moves. The drop exists only because
*just as* cannot stand between the article and the noun, and after the noun it does not. The Want
strings were rendered by applying the fix below to a throwaway copy of the tree.

**Already right.** The other six keep VERY's equative word: `l'uomo vede un gatto altrettanto grande
quanto il cane.`, `l'homme voit un chat tout aussi grand que le chien.`, `der Mann sieht einen
genauso großen Kater wie den Hund.`, `el hombre ve un gato igual de grande que el perro.`, `o homem vê
um gato tão grande como o cão.` (Portuguese drops VERY on every equative, A255), `男は犬と同じくらい大きい猫を見ます。`.
Before the noun, with no standard, English still says `the man sees an equally big cat.`, as
intensifiers.test.ts pins ("an attributive equative: a cat just as big"), and VERY on the positive is
`a very big cat`.

**Shape of the fix.** [`resolveNounPhrase.ts`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
calls [`applyIntensifier`](../../../packages/engine/src/translator/functions/applyIntensifier.ts) with
`attributive = true` for every adjective. The one carrying the phrase's standard
(`i === attributive?.planIndex`, the adjective marked `forms['standard']`) should not count as
attributive for the drop: passing `i !== attributive?.planIndex` gives all three Want strings and
breaks no test. The fixer should decide whether that is right in general or whether the flag should
ask the English engine where the adjective will stand, since only English postposes an equative
(the Romance languages postpose every compared adjective, and VERY has no `attributive_*` key there).

Pinned by `known bugs: English drops "just" from a postposed equative with VERY (A283)` in
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts).

Found on 2026-09-24 while auditing P09-E18's test coverage.

## Resolved

2026-09-24. [`resolveNounPhrase.ts`](../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)
now threads the intensifier with `attributive = false` on the one adjective that carries the
phrase's standard: that adjective is said the predicate's way, with its standard, so the lexeme's
before-the-noun keys (`attributive_drop_degrees`, `attributive_plain_degrees`) do not apply to it.
This is right in general rather than an English special case: a standard is only ever carried by a
comparative or the equative (`resolveAdjectiveStandard`), `attributive_plain_degrees` names only
superlatives, and English VERY is the one lexeme with attributive keys; English's comparative with a
standard keeps "much" before the noun as before. Guarded by the three formerly-failing tests and three
new ones (definite and plural heads, a second standard-less equative that still drops, the
comparative regression) in `known bugs: English drops "just" from a postposed equative with VERY
(A283)` in [comparison.test.ts](../../../packages/engine/test/comparison.test.ts).
