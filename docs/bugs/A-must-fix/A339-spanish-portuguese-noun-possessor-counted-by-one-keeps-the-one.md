# A339. A Spanish or Portuguese noun possessor counted by one beside a definite keeps the one

**Languages:** Spanish, Portuguese

[A319](../fixed/A319-numeral-one-beside-a-definite-or-demonstrative-determiner.md) ruled that a phrase
counting one beside a definite or demonstrative determiner is simply the singular in Romance: *el
perro*, *este perro*, not *el un perro*. Its fix reached every Spanish and Portuguese path except the
noun possessor, which its own file left open: *possessorText* joins the numeral with `numeralText`
after the article the preposition fuses with. So "the one man's book" is *el libro del un hombre*.

| Case | Now | Want |
|---|---|---|
| the CAT READs the BOOK of the one MAN | es `el gato lee el libro del un hombre.` · pt `o gato lê o livro do um homem.` | es `el gato lee el libro del hombre.` · pt `o gato lê o livro do homem.` |
| the BOOK of the one MAN BURNs (subject) | es `el libro del un hombre arde.` · pt `o livro do um homem arde.` | es `el libro del hombre arde.` · pt `o livro do homem arde.` |
| the CAT RUNs with the DOG of the one WOMAN (comitative) | es `… con el perro de la una mujer.` · pt `… com o cão da uma mulher.` | es `… con el perro de la mujer.` · pt `… com o cão da mulher.` |
| … the BOOK of this one MAN | es `del libro de este un hombre` · pt `deste um homem` | es `de este hombre` · pt `deste homem` |
| … the BOOK of that one WOMAN | es `de esa una mujer` · pt `dessa uma mulher` | es `de esa mujer` · pt `dessa mulher` |

The Wants are what the same plans render without the numeral, which is A319's target.

**Already right.** Italian and French drop the one in the possessor (`il libro dell'uomo`, `le livre
de l'homme`); German declines it weak (`das Buch des einen Mannes`, `jener einen Frau`). The
indefinite one (`de un hombre`, `de um homem`) and the definite two (`de los dos hombres`, `dos dois
homens`).

## Shape of the fix

In [es/possessorText.ts](../../../packages/engine/src/languages/es/possessorText.ts) and
[pt/possessorText.ts](../../../packages/engine/src/languages/pt/possessorText.ts), skip the
`numeralText` call when [oneBesideDeterminer](../../../packages/engine/src/functions/oneBesideDeterminer.ts)
says the possessor counts one beside a definite or demonstrative, as `nounPhrase.ts` and
`complementsPhrase.ts` already do since A319.

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: a Spanish or Portuguese noun possessor counted by one beside a definite keeps the one (A339)* (3 `test.fails`: the object's possessor, the subject's and a comitative's, the demonstratives; plus a regression test for it / fr / de, the indefinite one and the definite two) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.
