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
