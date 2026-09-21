# A188. A superlative on a place name keeps the bare "in" / "en" of the name

**Languages:** Italian, French

Italian and French superlatives follow the noun, and the definite article is what makes them
superlative: `l'Europa più grande` is "the biggest Europe", and `Europa più grande` without it is the
comparative ([C01](../C-do-not-fix/C01-italian-spanish-superlative-comparative-homophony.md)).
French repeats the article after the noun (`l'Europe la plus grande`), and that second article is
only possible after a first one.

A place name goes to the bare continent or land preposition (`in Europa`, `en Europe`, French source
`d'Europe`) as long as it leads its phrase. [A169](../fixed/A169-adjective-on-a-place-name.md) brought
the article back for a prenominal adjective. It left a postnominal one bare on purpose, as in region
names (`in Asia lontana`, `en Asie centrale`). That rule also catches the superlative, which in these
two languages always follows the noun:

- **Italian** `il gatto corre in Europa più grande` reads "in a bigger Europe".
- **French** `le chat court en Europe la plus grande` is not French.

The gate is the `bareName` test in [`it/complementsPhrase.ts`](../../../packages/engine/src/languages/it/complementsPhrase.ts)
and [`fr/complementsPhrase.ts`](../../../packages/engine/src/languages/fr/complementsPhrase.ts): the
name is `proper` and leads its phrase. Nothing asks for a superlative.

| Case | Language | Now | Want |
|---|---|---|---|
| locative, EUROPE + BIG `most` | Italian | `il gatto corre in Europa più grande.` | `il gatto corre nell'Europa più grande.` |
| | French | `le chat court en Europe la plus grande.` | `le chat court dans l'Europe la plus grande.` |
| direction, EUROPE + BIG `most` | Italian | `il gatto va in Europa più grande.` | `il gatto va nell'Europa più grande.` |
| | French | `le chat va en Europe la plus grande.` | `le chat va dans l'Europe la plus grande.` |
| locative, ASIA + FAR `least` | Italian | `il gatto corre in Asia meno lontana.` | `il gatto corre nell'Asia meno lontana.` |
| | French | `le chat court en Asie la moins lointaine.` | `le chat court dans l'Asie la moins lointaine.` |
| direction, AFRICA + BEAUTIFUL `most` | Italian | `il gatto va in Africa più bella.` | `il gatto va nell'Africa più bella.` |
| | French | `le chat va en Afrique la plus belle.` | `le chat va dans l'Afrique la plus belle.` |
| direction, ITALY + BIG `most` | Italian | `il gatto va in Italia più grande.` | `il gatto va nell'Italia più grande.` |
| | French | `le chat va en Italie la plus grande.` | `le chat va dans l'Italie la plus grande.` |
| source, EUROPE + BIG `most` | French | `le chat vient d'Europe la plus grande.` | `le chat vient de l'Europe la plus grande.` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A169's postnominal positive and comparative (`in Asia lontana`, `en Asie
lointaine`, `in Europa più grande` as "in a bigger Europe"). A prenominal adjective (`nella grande
Europa`, `dans la grande Europe`). The Italian source, which already articles the name (`dall'Europa
più grande`). Spanish and German, which article every modified name (`en la Europa más grande`, `im
größten Europa`).

Found while reviewing the random phrase "… up behind sharpest Europe." (seed 530537, the English
side is [A183](A183-english-superlative-on-a-proper-name.md)). Filed on the user's ruling of
2026-09-21.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green. No passing test moves.

`headFor` sees only the head's forms, so the superlative has to reach it through them. Where
`complementsPhrase` builds the forms for `headFor` (Italian `itPossessedHeadForms(np)`, French
`possessedHeadForms(np, 'bare')` in all three `renderNP` calls), mark a phrase with an adjective at
`most` or `least`. `bareName` then refuses a marked name. The name takes its article, and `in` /
`dans` / `de` fuse with it through `spatialHead` and `deDet`, as for a prenominal adjective.

**Decision for the fixer:** the comparative `in Europa più grande` stays with A169's postnominal rule,
and so does `en Europe plus grande`. Only the superlative needs the article to be what it is. Not
pinned.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: a superlative on a place name after a bare preposition* (1 `test.fails`, plus a regression test for A169's cases, the Italian source, Spanish and German) |
