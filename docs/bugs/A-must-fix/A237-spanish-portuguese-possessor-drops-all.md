# A237. A Spanish or Portuguese possessor drops "all" beside a possessive

**Languages:** Spanish, Portuguese

[A234](../fixed/A234-spanish-portuguese-possessor-drops-its-determiner.md) gave a possessor that has a
pronominal possessive of its own its determiner back, for the determiners A187 keeps beside a
possessive (`KEPT_BESIDE_POSSESSIVE`: this, that, some, many, few, no): *de este libro mío*, *de
ningún libro suyo*. `all` is not in that set, because it does not move the possessive behind the
noun: it stands in front of the unstressed one, *todos mis libros*, *todos os meus livros*. The
object and the complements already write it that way
([`es/complementsPhrase`](../../../packages/engine/src/languages/es/complementsPhrase.ts)'s `every`,
[`pt/complementsPhrase`](../../../packages/engine/src/languages/pt/complementsPhrase.ts)).
[`es/possessorText`](../../../packages/engine/src/languages/es/possessorText.ts) and
[`pt/possessorText`](../../../packages/engine/src/languages/pt/possessorText.ts) still force it away
before writing the prenominal possessive, so "of all my books" loses its "all".

| Case | Language | Now | Want |
|---|---|---|---|
| the CAT SEEs the HOUSE of all BOOKs of mine | Spanish | `el gato ve la casa de mis libros.` | `el gato ve la casa de todos mis libros.` |
| | Portuguese | `o gato vê a casa dos meus livros.` | `o gato vê a casa de todos os meus livros.` |
| … of all BOOKs of his | Spanish | `el gato ve la casa de sus libros.` | `el gato ve la casa de todos sus libros.` |
| | Portuguese | `o gato vê a casa dos seus livros.` | `o gato vê a casa de todos os seus livros.` |
| the HOUSE of all BOOKs of mine BURNs | Spanish | `la casa de mis libros arde.` | `la casa de todos mis libros arde.` |
| | Portuguese | `a casa dos meus livros arde.` | `a casa de todos os meus livros arde.` |

The **Want** is the object's own form after "de", which the engine already renders (`el gato ve
todos mis libros.`, `o gato vê todos os meus livros.`), the way it renders a possessor with no
possessive (`el libro de todos los gatos arde.`, `o livro de todos os gatos arde.`). It was not
rendered by a trial fix.

**Already right.** The object, above. A possessor with no possessive, above. The other five (`il
gatto vede la casa di tutti i miei libri.`, `le chat voit la maison de tous mes livres.`, `der Kater
sieht das Haus aller meiner Bücher.`, `猫は私のすべての本の家を見ます。`).

Found by the lane that fixed A234.

## Shape of the fix

Not trial-verified. In both `possessorText`s, when the possessor has a pronominal possessive and its
determiner is `all`, write "todos"/"todas" (and Portuguese's article) ahead of the unstressed
possessive, as the complement path does. Spanish can likely take the object's builder whole
(`" de " + npText(poss)`, as A234's branch does). Portuguese "de" does not fuse with "todos", so
`contractDet` must not see the article.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: a Spanish or Portuguese possessor drops "all" beside a possessive (A237)* (1 `test.fails`, plus a regression test for the object, a possessor with no possessive and the other five) |
