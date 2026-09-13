# A58. The German "von" possessor always takes the definite article

**Language:** German

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

## Shape of the fix

Use `determiner(f, 'dat', plural)` in place of `defArticle`, and contract to `vom` only when that
returns the definite `dem`. Decline the possessor's adjectives with its own definiteness
(`adjPhrase(poss, 'dat', definiteness)`), so a bare possessor declines strong.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: German possessor determiner* (1 `test.fails`) |
