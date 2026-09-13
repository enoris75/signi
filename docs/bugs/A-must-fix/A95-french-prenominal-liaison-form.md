# A95. French "beau / nouveau / vieux" keep their plain form before a vowel

**Language:** French

Three of the prenominal adjectives have a separate masculine singular form before a vowel or a mute
h: `bel`, `nouvel`, `vieil` (`un bel ange`, `le vieil homme`). `agreeAdjFr`
(`languages/fr/agreeAdjFr.ts`) reads them from `FR_ADJ_IRREGULAR` (`languages/fr/fr.consts.ts`), which
holds only four cells: masc.sg, fem.sg, masc.pl, fem.pl. It never sees the word that follows, and
`splitAdjectives` / `renderNP` do not correct it afterwards. So the prenominal adjective keeps
`beau` / `nouveau` / `vieux` in front of a vowel-initial noun.

| Phrase | Now | Want |
|---|---|---|
| OLD + MAN | `le vieux homme mange.` | `le vieil homme mange.` |
| BEAUTIFUL + ANGEL, indefinite | `un beau ange mange.` | `un bel ange mange.` |
| NEW + MONEY, this | `ce nouveau argent brûle.` | `ce nouvel argent brûle.` |
| NEW + CHILD | `le nouveau enfant mange.` | `le nouvel enfant mange.` |

Already right: the feminine (`la belle aile`), the plural (`les vieux hommes`) and a consonant-initial
noun (`le vieux chat`).

## Shape of the fix

Give the three irregulars a fifth cell, the masculine singular before a vowel (`bel`, `nouvel`,
`vieil`). `renderNP` knows the word that follows each prenominal adjective: the next prenominal
adjective, or else the noun. When the adjective is masculine singular and `elidesBefore(forms, next)`
holds, use that cell. `elidesBefore` is needed rather than the first letter, because `homme` has a
mute h (A24). The article is already chosen against the adjective, so `le vieil` and `ce nouvel`
follow without further change.

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: French bel/nouvel/vieil before a vowel* (1 `test.fails`) |
