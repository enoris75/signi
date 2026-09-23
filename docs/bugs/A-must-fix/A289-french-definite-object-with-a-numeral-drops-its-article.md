# A289. A French definite object with a numeral drops its article

**Languages:** French

A numeral takes the place of the indefinite article only (C31, `numeralSuppressesArticle`). A
definite or demonstrative determiner stays in front of it: "the two cats", "les deux chats". The
French subject does this. The French direct object drops the determiner altogether, so "the cat reads
the two books" says *two books*, and it can no longer be told from the indefinite.

| Case | Now | Want |
|---|---|---|
| the CAT READs the two BOOKs (definite) | `le chat lit deux livres.` | `le chat lit les deux livres.` |
| … negated | `le chat ne lit pas deux livres.` | `le chat ne lit pas les deux livres.` |
| … with the MAN as genitive possessor | `le chat lit deux livres de l'homme.` | `le chat lit les deux livres de l'homme.` |
| … demonstrative (`this`) | `le chat lit deux livres.` | `le chat lit ces deux livres.` |
| the CAT SEEs the three DOGs (definite) | `le chat voit trois chiens.` | `le chat voit les trois chiens.` |
| whose two BOOKs does the CAT READ (possessor question over the object) | `de qui est-ce que le chat lit deux livres ?` | `de qui est-ce que le chat lit les deux livres ?` |

The Want strings were verified by applying the fix sketched below to a throwaway copy of the tree.

**Already right.** The other six languages keep the determiner on the object: `i due libri`, `die
zwei Bücher`, `los dos libros`, `os dois livros`, `the two books`, and `questi / diese / estos /
estes` for the demonstrative. The French subject keeps it too (`les deux livres brûlent.`, `ces deux
livres brûlent.`). The indefinite object is right with no article, negated or not (`le chat lit deux
livres.`, `le chat ne mange pas deux souris.`), and so is a pronominal possessor (`le chat lit ses
deux livres.`).

**Found by** auditing P09-E14's coverage: the possessor question over a counted object. The
three-dog row was reproduced independently by another session (signi-85).

## Shape of the fix

`objectArtFor` in [fr/objectArtFor.ts](../../../packages/engine/src/languages/fr/objectArtFor.ts)
returns `''` for any counted object (`forms['numeral'] !== undefined`). That is right only where the
numeral has replaced the indefinite, which `resolveNounPhrase` has already marked as `bare`. The trial
narrows the guard to `forms['numeral'] !== undefined && forms['definiteness'] === 'bare'`. A definite
or demonstrative object then falls through to `partitiveArtFor` → `artFor` and gets `les` or `ces`,
and the indefinite keeps no partitive and no negative *de*. Every row above rendered its Want in the
trial. The unit tests in `objectArtFor.test.ts` should gain a definite and a demonstrative counted
case.

**Not settled here, tracked separately:** German, Spanish and Portuguese drop the numeral itself
inside a complement (`läuft in den Häusern` for *in the two houses*), and French writes `de` before a
bare numeral in a complement (`dans de deux maisons`, `avec de trois chiens`). signi-85 files both on
their own. They are not part of this bug.

| | |
|---|---|
| **Test** | `numerals.test.ts` → *known bugs: a French definite object with a numeral drops its article (A289)* (6 `test.fails`, one per row, plus a regression test for the other six languages on the definite, demonstrative, animate and possessor-question objects, the French subject, the indefinite object and the possessive) |
