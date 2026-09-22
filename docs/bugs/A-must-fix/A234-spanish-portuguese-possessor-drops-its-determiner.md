# A234. A Spanish or Portuguese possessor drops its own determiner beside a possessive

**Languages:** Spanish, Portuguese

A pronominal possessive takes the article's place, and Spanish and Portuguese keep a head's own
determiner beside it by moving the possessive behind the noun in its stressed form: *este libro mío*,
*ningún libro suyo* ([A187](../fixed/A187-pronominal-possessor-drops-the-head-determiner.md)). A **possessor**
does not get that treatment. [`es/possessorText`](../../../packages/engine/src/languages/es/possessorText.ts)
and [`pt/possessorText`](../../../packages/engine/src/languages/pt/possessorText.ts) force the
possessor's determiner away before writing the prenominal possessive, so the determiner is lost:
"of this book of mine" is *de mi libro*, and "of no book of his" is *de su libro*, which since
[A216](../fixed/A216-no-possessor-does-not-negate-its-clause.md) also negates the clause around it
(*no ve la casa de su libro*, "does not see his book's house").

| Case | Language | Now | Want |
|---|---|---|---|
| the CAT SEEs the HOUSE of this BOOK of mine | Spanish | `el gato ve la casa de mi libro.` | `el gato ve la casa de este libro mío.` |
| | Portuguese | `o gato vê a casa do meu livro.` | `o gato vê a casa deste livro meu.` |
| … of some BOOKs of mine | Spanish | `el gato ve la casa de mis libros.` | `el gato ve la casa de algunos libros míos.` |
| | Portuguese | `o gato vê a casa dos meus livros.` | `o gato vê a casa de alguns livros meus.` |
| … of no BOOK of his | Spanish | `el gato no ve la casa de su libro.` | `el gato no ve la casa de ningún libro suyo.` |
| | Portuguese | `o gato não vê a casa do seu livro.` | `o gato não vê a casa de nenhum livro seu.` |
| the CAT RUNs in the HOUSE of no MAN of his | Spanish | `el gato no corre en la casa de su hombre.` | `el gato no corre en la casa de ningún hombre suyo.` |
| | Portuguese | `o gato não corre na casa do seu homem.` | `o gato não corre na casa de nenhum homem seu.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The same phrase as an object (`el gato ve este libro mío.`, `o gato vê este livro
meu.`) and a definite possessor (`la casa de mi libro`, `a casa do meu livro`). The other five
(`the cat sees the house of this book of mine.`, `il gatto vede la casa di questo mio libro.`, `le
chat voit la maison de ce livre à moi.`, `der Kater sieht das Haus dieses Buches von mir.`).

Found by the lane that fixed A216, with a `no` possessor that had its own possessive.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

In both `possessorText`s, when the possessor has a pronominal possessor of its own and its determiner
is one A187 keeps (`KEPT_BESIDE_POSSESSIVE`), build it the way the object is built: Spanish "de" +
`nounPhrase(forms, adjectives, esPossessiveWord(poss))`, which already writes *ningún libro suyo*;
Portuguese "de" fused with the determiner (`contractDet`) + the noun + the stressed possessive
(*deste livro meu*, *de nenhum livro seu*).

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: a Spanish or Portuguese possessor drops its own determiner beside a possessive (A234)* (1 `test.fails`, plus a regression test for the object, a definite possessor and the other five) |
