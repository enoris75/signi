# A58. A noun possessor always takes the definite article

**Language:** German, Italian, French, Spanish, Portuguese

The genitive / `von` / `de` possessor is built from a definite contraction or article in German, Italian, French, Spanish and Portuguese, never from the possessor's own determiner, so an indefinite, demonstrative or quantified possessor turns definite. English (`a cat's book`) and Japanese are right.

## German

`possessorText` (`languages/de/possessorText.ts`) builds the possessor's article with
`defArticle(f, 'dat', plural)` and contracts `von dem` to `vom`. It never calls `determiner`, so the
possessor's own definiteness is ignored. An indefinite or quantified possessor becomes definite, and
a proper name that goes bare gets an article.

| Possessor | Now | Want |
|---|---|---|
| CAT, indefinite | `das Buch vom Kater brennt.` | `das Buch von einem Kater brennt.` |
| CAT, some (plural) | `das Buch von den Katern brennt.` | `das Buch von einigen Katern brennt.` |
| EUROPE (proper) | `das Buch vom Europa brennt.` | `das Buch von Europa brennt.` |

This is separate from B09, which covers standard German's genitive (`das Buch des Katers`) versus the
colloquial `von` + dative. Whichever surface is chosen, the possessor keeps its own determiner.

### Shape of the fix

Use `determiner(f, 'dat', plural)` in place of `defArticle`, and contract to `vom` only when that
returns the definite `dem`. Decline the possessor's adjectives with its own definiteness
(`adjPhrase(poss, 'dat', definiteness)`), so a bare possessor declines strong.

## Italian

`renderNP` (`languages/it/renderNP.ts`) heads a genitive possessor with
`prepArt('di', poss.head.forms, …)`, always `di` fused with the definite article. It never reads
the possessor's own determiner, so an indefinite, demonstrative, quantified or negative possessor
becomes definite (`dell'uomo`, `degli uomini`).

| Possessor | Now | Want |
|---|---|---|
| MAN, indefinite | `il libro dell'uomo brucia.` | `il libro di un uomo brucia.` |
| MAN, this | `il libro dell'uomo brucia.` | `il libro di quest'uomo brucia.` |
| MEN, some | `il libro degli uomini brucia.` | `il libro di alcuni uomini brucia.` |
| MAN, no | `il libro dell'uomo brucia.` | `il libro di nessun uomo brucia.` |

Already right: a definite possessor (`il libro del gatto`) and a continent (`il libro dell'Europa`,
which takes the article in Italian). The fix is `prepDet('di', …)` in place of `prepArt`, which
brings A63's proper-noun check along with it.

## French

In French, `renderNP` (`languages/fr/renderNP.ts`) heads a genitive possessor with
`dePrep(poss.head.forms, …)`, the definite `de` + article contraction, instead of the
determiner-aware `deDet`. Every possessor therefore comes out definite.

| Possessor | Now | Want |
|---|---|---|
| CAT, indefinite | `le livre du chat brûle.` | `le livre d'un chat brûle.` |
| CAT, some (plural) | `le livre des chats brûle.` | `le livre de quelques chats brûle.` |
| CAT, this | `le livre du chat brûle.` | `le livre de ce chat brûle.` |
| CAT, all (plural) | `le livre des chats brûle.` | `le livre de tous les chats brûle.` |

Already right: a continent possessor keeps its article (`le livre de l'Europe brûle.`).

## Spanish

| Possessor | Now | Want |
|---|---|---|
| MAN, indefinite | `el libro del hombre arde.` | `el libro de un hombre arde.` |
| MAN, some (plural) | `el libro de los hombres arde.` | `el libro de algunos hombres arde.` |
| MAN, this | `el libro del hombre arde.` | `el libro de este hombre arde.` |

In Spanish it happens in `possessorText` (`languages/es/possessorText.ts`). It always uses
`dePrep`, which is "de" + the definite article. It should use `deDet`, which contracts to `del`
only for a masculine singular definite. A bare proper name is already right (`el libro de Europa
arde.`).

## Portuguese

In Portuguese `possessorText` (`languages/pt/possessorText.ts`) builds `de` + article with `dePrep`,
which reads only the definite article. `contractDet(dePrep, 'de', f, plural)` would keep the
possessor's own determiner.

| Possessor | Now | Want |
|---|---|---|
| CAT, indefinite | `o livro do gato arde.` | `o livro de um gato arde.` |
| CAT, this | `o livro do gato arde.` | `o livro deste gato arde.` |
| CAT, some | `o livro dos gatos arde.` | `o livro de alguns gatos arde.` |

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: German possessor determiner* (1 `test.fails`)<br>`possession.test.ts` → *known bugs: Italian possessor determiner* (1 `test.fails`)<br>`possession.test.ts` → *known bugs: French possessor determiner* (1 `test.fails`)<br>`possession.test.ts` → *known bugs: Spanish possessor determiner* (1 `test.fails`)<br>`possession.test.ts` → *known bugs: Portuguese possessor determiner* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed. Each engine now heads a noun possessor with its
own determiner, fused with the preposition only where the language fuses it.

- [`de/possessorText.ts`](../../../packages/engine/src/languages/de/possessorText.ts): `determiner(f,
  'dat', plural)` replaces `defArticle`. Only the definite `dem` fuses to `vom`, and a bare possessor
  reads `von` alone (`von einem Kater`, `von einigen Katern`, `von Europa`). The adjectives decline
  with the possessor's own definiteness (`von kleinen Katern`). An inherently articled name keeps its
  article (`von der Antarktis`).
- [`it/renderNP.ts`](../../../packages/engine/src/languages/it/renderNP.ts): `prepDet('di', …)`
  replaces `prepArt` (`di un uomo`, `di quest'uomo`, `di nessun uomo`). A definite possessor and a
  continent still fuse (`del gatto`, `dell'Europa`).
- [`fr/renderNP.ts`](../../../packages/engine/src/languages/fr/renderNP.ts): `deDet` replaces
  `dePrep` (`d'un chat`, `de ce chat`, `de tous les chats`, `de beaucoup de chats`).
- [`es/possessorText.ts`](../../../packages/engine/src/languages/es/possessorText.ts): `deDet`
  replaces `dePrep` (`de un hombre`, `de algunos hombres`, `de este hombre`).
- [`pt/possessorText.ts`](../../../packages/engine/src/languages/pt/possessorText.ts):
  `contractDet(dePrep, 'de', …)` replaces `dePrep` (`de um gato`, `deste gato`, `de alguns gatos`).

Every table row now renders as wanted. A nested possessor follows (`di un gatto di quest'uomo`, `von
einem Kater von diesem Mann`).

Not handled: an Italian `some` mass-noun possessor doubles the preposition (`di dell'acqua`), from
`prepDet`'s partitive article. It is left unpinned, since no natural phrase asks for "the book of
some water".

- **Tests:** [`packages/engine/test/possession.test.ts`](../../../packages/engine/test/possession.test.ts)
  → the five *known bugs: … possessor determiner* blocks. The pinning `test.fails` are now passing
  `test`s. New cases:
  - the remaining determiners, adjectives on the possessor and a nested possessor;
  - guards for the definite fusion and for proper names.
- Unit tests: `possessorText.test.ts` (de, es, pt) and `renderNP.test.ts` (it, fr).
