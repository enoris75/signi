# A24. No elision before a silent *h* (`le homme`)

**Language:** French

French elides before a vowel (`l'ange`) but the engine tests the first **letter**, not the first
**sound**, so it misses *h muet*: `homme` begins with one and should elide. The miss propagates into
every contraction built on the article.

| | Now | Want |
|---|---|---|
| article | `le homme mange.` | `l'homme mange.` |
| contraction | `le livre du homme brûle.` | `le livre de l'homme brûle.` |

| | |
|---|---|
| **Fix** | The *h muet* / *h aspiré* split is lexical (`homme` elides, `héros` does not — `le héros`), so it belongs on the noun lexeme in the corpus. Italian gets the equivalent right (`l'uomo`), so this is French-specific. |
| **Test** | `nounPhrase.test.ts` → *known bugs: determiners* (2 tests) |

## Resolved

Fixed 2026-07-16, as a lexical + engine change (the h-muet / h-aspiré split is a property of the
noun, so it lives in the corpus):

- **Corpus** — [`packages/backend/src/concepts/nouns.ts`](../../../packages/backend/src/concepts/nouns.ts):
  the French form of `MAN` (`homme`) is marked `elides: '1'`. `homme` begins with an h muet (silent),
  so the article elides as before a vowel. An h aspiré noun (`héros` → `le héros`) would carry no
  flag; none is seeded, so `homme` is the only word that needed marking.
- **Engine** — [`packages/engine/src/languages/fr.ts`](../../../packages/engine/src/languages/fr.ts):
  a new **`elidesBefore(forms, lead)`** helper replaces the raw first-letter `VOWEL_START` test at
  the article-elision points — `defArticle` (and therefore the `du`/`de la`/`de l'` and `au`/`à l'`
  contractions that route through it), the demonstrative `demArticle` (`cet homme`), and the
  partitive/`de`-complement `de`. It returns true for a true vowel letter, or — when the head noun
  itself leads — for a noun the corpus marks `elides`. The flag is honoured only when the noun leads,
  so a prenominal adjective (never h muet in the lexicon) is still judged on its own spelling.

Italian was already correct (`l'uomo`); this was French-specific.

- **Tests:** [`packages/engine/test/nounPhrase.test.ts`](../../../packages/engine/test/nounPhrase.test.ts)
  → *known bugs: determiners*. Both pinning `test.fails` are now passing `test`s (`l'homme`,
  `de l'homme`), plus added cases: the demonstrative `cet homme`, the non-eliding `un homme` and
  `les hommes`, a nested possessor contracting on each head (`du père de l'homme`), and a
  prenominal-adjective guard (`le jeune homme`) proving the flag fires only when the noun leads.
