# A314. *Most* with a possessive keeps the possessive out of the partitive

**Languages:** English, French, German, Spanish, Portuguese

The partitive *most* already contains a definite article: *la plupart **des** chats*, *la mayoría **de
los** gatos*, *a maioria **dos** gatos*. A possessive takes that article's place, as Italian already
does (*la maggior parte **dei suoi** gatti*): *la plupart de ses chats*, *la mayoría de sus gatos*, *a
maioria dos seus gatos*. English and German say it the same way: *most of her cats*, *die meisten ihrer
Kater*.

The other five use A187's one-shape possessor for a kept determiner instead: *la plupart des chats à
elle*, *most cats of hers*, *die meisten Kater von ihr*, *la mayoría de los gatos suyos*, *a maioria dos
gatos seus*. That shape suits a determiner that stands in the article's slot (*chaque chat à elle*,
*each cat of hers*). It does not suit a partitive, which has an article slot of its own for the
possessive to fill.

| Case | Now | Want |
|---|---|---|
| `most` of her CATs RUN | `most cats of hers run.` · `la plupart des chats à elle courent.` · `die meisten Kater von ihr laufen.` · `la mayoría de los gatos suyos corre.` · `a maioria dos gatos seus corre.` | `most of her cats run.` · `la plupart de ses chats courent.` · `die meisten ihrer Kater laufen.` · `la mayoría de sus gatos corre.` · `a maioria dos seus gatos corre.` |
| the DOG SEEs `most` of my BOOKs | `most books of mine` · `la plupart des livres à moi` · `die meisten Bücher von mir` · `la mayoría de los libros míos` · `a maioria dos livros meus` | `most of my books` · `la plupart de mes livres` · `die meisten meiner Bücher` · `la mayoría de mis libros` · `a maioria dos meus livros` |

**How it relates to A187.** [A187](../fixed/A187-pronominal-possessor-drops-the-head-determiner.md)
kept a determiner beside a pronominal possessor. Its Decisions ruled out the partitive (*quelques-uns
de ses livres*, *some of her books*) in favour of one shape (*à elle*, *von ihr*, *of hers*) for every
kept determiner, because the partitive "turns the quantifier into a pronoun that agrees on its own".
P09-E25's *most* was built as a partitive already (*la plupart des*, D4's singular agreement in
it/es/pt). So the reason A187 gave does not apply to it, and its own article is where the possessive
goes. `all` is the precedent: A187 keeps it outside the one shape too (*tous ses chats*, *all her
cats*). This bug asks the same for `most`. It does not reopen A187's ruling for `each`, `some`, `many`
or `several`.

**Already right.** Italian (`la maggior parte dei suoi gatti corre.`), Japanese (彼女のほとんどの猫). A187's
one shape for `each` (`chaque chat à elle`, `each cat of hers`), and `all` (`tous ses chats`).

**Found by** the lanes landing P09-E25, re-verified at 48af1d35.

## Shape of the fix

`most` sits in `KEPT_BESIDE_POSSESSIVE`'s reach through P09-E25
([possessive.ts](../../../packages/engine/src/possessive.ts)). Handle it as `all` is handled: outside the
one-shape set, each language putting the possessive in the partitive's article slot. French *de* +
possessive (*de ses*, no *des*). Spanish *de* + the prenominal *sus*. Portuguese *dos* + *seus*
(Portuguese keeps the article with the possessive). German *die meisten* + the genitive possessive
(*ihrer*, *meiner*). English *most of* + the dependent possessive, which makes English's *most* a
partitive only when a possessive is present.

| | |
|---|---|
| **Test** | `quantity-determiners.test.ts` → *known bugs: most with a possessive keeps the possessive out of the partitive (A314)* (2 `test.fails`, plus a regression test for A187's `each` shape and `all`) |

## Resolved

Fixed on 2026-09-24 as the shape above says: `most` is handled like `all`.

- [possessive.ts](../../../packages/engine/src/possessive.ts): `most` left `KEPT_BESIDE_POSSESSIVE`.
  [it/itPossessedHeadForms.ts](../../../packages/engine/src/languages/it/itPossessedHeadForms.ts) adds
  it back to Italian's own set beside `all`, so *la maggior parte dei suoi gatti* is unchanged.
- English [en/nounPhrase.ts](../../../packages/engine/src/languages/en/nounPhrase.ts): *most of* + the
  dependent possessive, and OWN after it (*most of my own friends*, with A328).
- French [fr/renderNP.ts](../../../packages/engine/src/languages/fr/renderNP.ts): *la plupart de* /
  *la plus grande partie de* in front of the prenominal possessive.
- German [de/nounPhrase.ts](../../../packages/engine/src/languages/de/nounPhrase.ts) and
  [de/complementsPhrase/complementsPhrase.ts](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts):
  *die meisten* in the phrase's case, and the possessive, adjectives and noun in the partitive
  genitive (*die meisten ihrer alten Kater*, *mit den meisten ihrer Kater*, *das meiste meines
  Wassers*).
- Spanish [es/nounPhrase.ts](../../../packages/engine/src/languages/es/nounPhrase.ts) and
  [es/complementsPhrase.ts](../../../packages/engine/src/languages/es/complementsPhrase.ts):
  *la mayoría de* / *la mayor parte de* + the unstressed possessive. `es/prepObjectText.ts` and
  `es/possessorText.ts` send it to `npText` as they send *todos* (*ve a la mayoría de mis amigos*, *de
  la mayoría de sus gatos*).
- Portuguese [pt/nounPhrase.ts](../../../packages/engine/src/languages/pt/nounPhrase.ts),
  [pt/complementsPhrase.ts](../../../packages/engine/src/languages/pt/complementsPhrase.ts) and
  [pt/possessorText.ts](../../../packages/engine/src/languages/pt/possessorText.ts): the partitive's
  own *dos* / *das*, which a preposition fuses with, and the possessive on it (*a maioria dos seus
  gatos*, *na maioria das minhas casas*, *da maioria dos seus gatos*).

Both `test.fails` in `known bugs: most with a possessive keeps the possessive out of the partitive
(A314)` in [quantity-determiners.test.ts](../../../packages/engine/test/quantity-determiners.test.ts)
are plain tests now. The same block gained the comitative in all seven, the locative, a genitive
possessor, the Spanish human object, an adjective, a mass noun and OWN. The colocated
`possessive.test.ts` and the English, Spanish and Portuguese `nounPhrase.test.ts` gained cases.
A187's ruling for `each`, `some`, `many` and `several` is untouched.
