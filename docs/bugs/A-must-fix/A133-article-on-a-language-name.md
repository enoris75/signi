# A133. A language name takes the article of a common noun

**Language:** English, German, Italian, French, Spanish, Portuguese

The seven language concepts (ENGLISH … PORTUGUESE, isA LANGUAGE) are seeded as ordinary mass nouns,
without `proper`, so the article the user picks is applied to them. A language name, like a
continent, has its article fixed by each language:

- **English and German: no article.** "Italian is a language", *Deutsch ist eine Sprache*.
- **Italian, French and Portuguese: always the article.** *l'italiano*, *l'italien*, *o italiano*.
- **Spanish: the article too** (*el italiano es un idioma*). This differs from Spanish continents, which
  go bare.

As a result, the default article gives "the boy reads the German" and *der Junge liest das Deutsch*
("the English" even reads as the people), and choosing no article drops the Romance article that is
required.

Found while checking A131 (`the cat knows the Italian`, `der Kater weiß das Italienisch`).

| Plan | Now | Want |
|---|---|---|
| ITALIAN BE a language | `the Italian is a language.` · `das Italienisch ist eine Sprache.` | `Italian is a language.` · `Italienisch ist eine Sprache.` |
| BOY READ GERMAN | `the boy reads the German.` · `der Junge liest das Deutsch.` | `the boy reads German.` · `der Junge liest Deutsch.` |
| BOY UNDERSTAND ENGLISH | `the boy understands the English.` · `der Junge versteht das Englisch.` | `the boy understands English.` · `der Junge versteht Englisch.` |
| ITALIAN (no article) BE a language | `italiano è una lingua.` · `italien est une langue.` · `italiano es un idioma.` · `italiano é uma língua.` | `l'italiano è una lingua.` · `l'italien est une langue.` · `el italiano es un idioma.` · `o italiano é uma língua.` |
| BOY UNDERSTAND ITALIAN (no article) | `le garçon comprend italien.` | `le garçon comprend l'italien.` |

In every row the only word that changes is the article.

Already right, and pinned as a regression guard:

- The default article in the Romance languages (`l'italiano è una lingua.`).
- No article in English and German (`Italian is a language.`).
- Japanese (`イタリア語は言語です。`).
- Continents (`Europe is a continent.`, `l'Europa è un continente.`, `la Antártida es un continente.`).
- The bare word label `wordAll('ITALIAN')` → `italiano`, which is what a language selector would show.

Not pinned:

- **An object without an article in Italian, Spanish and Portuguese.** After some verbs the article is
  optional (*parla italiano*, *habla italiano*, *fala italiano*), so only the French object is pinned.
- **A language as the possessor.** "the French's words" / *die Wörter vom Französisch*. After the fix,
  the English and German proper-noun possessor rules apply ("French's words", *von Französisch*), and
  neither is ideal ("the words of French", *des Französischen*).
- **"in Japanese".** An instrumental currently renders "with the Japanese" / *mit dem Japanisch*, where
  "in Japanese" / *auf Japanisch* is the idiom. That is a separate question about which complement
  expresses it.

## Shape of the fix

This is a corpus-only fix, in `concepts/nouns.ts`. Set `proper: true` on the seven language concepts,
and add `takes_article: '1'` to their `es` forms, as ANTARCTICA does for *la Antártida*. The engine's
proper-noun article rules then produce every "Want" above:

- English `determiner.ts` and German `determiner.ts` return no article.
- Italian `artFor.ts`, French `artFor.ts` and Portuguese `artFor.ts` always return the definite
  article.
- Spanish `artFor.ts` returns the article because `takes_article` is set.

`proper` is read only by the lexicon and these engine functions. The frontend never reads it.

Check one side effect. An Italian or French locative "in" drops a proper noun's article (`in Europa`,
`en Europe`), which happens to be the right idiom for a language too (*in italiano*, *en italien*).

| | |
|---|---|
| **Test** | `clause.test.ts` → *known bugs: the article on a language name* (1 `test.fails`) |
