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
