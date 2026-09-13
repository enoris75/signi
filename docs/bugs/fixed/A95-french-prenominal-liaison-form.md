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

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.

- `FR_ADJ_IRREGULAR` in [`fr.consts.ts`](../../../packages/engine/src/languages/fr/fr.consts.ts)
  gains a fifth cell, the masculine singular before a vowel sound: `bel`, `nouvel`, `vieil`. `bas`
  repeats `bas`.
- The new [`liaisonAdjectives.ts`](../../../packages/engine/src/languages/fr/liaisonAdjectives.ts)
  swaps that cell in for a masculine singular prenominal adjective. The test is `elidesBefore` against
  the next word: the next prenominal adjective, or else the noun.
- [`renderNP.ts`](../../../packages/engine/src/languages/fr/renderNP.ts) applies it before choosing
  the article and the possessive, so `le vieil`, `ce nouvel`, `mon nouvel` follow. `frMods` uses it
  too (A94).

Every row now renders as wanted: `le vieil homme`, `un bel ange`, `ce nouvel argent`, `le nouvel
enfant`. The fix also covers:
- a possessive (`mon nouvel enfant`);
- an object and a complement (`le vieil homme`);
- a second adjective (`le beau vieil homme`), each adjective judged on the word that follows it.

The plural (`les vieux hommes`), the feminine (`la belle aile`), a consonant (`le vieux chat`) and the
postnominal superlative (`l'homme le plus vieux`) are unchanged.

- **Tests:** [`packages/engine/test/adjectives.test.ts`](../../../packages/engine/test/adjectives.test.ts)
  → *known bugs: French bel/nouvel/vieil before a vowel*. The pinning `test.fails` is now a passing
  `test`. New cases cover the possessive, the object, the complement and the second adjective, with a
  guard for the unchanged forms.
- Unit tests: the new `liaisonAdjectives.test.ts`, and `renderNP.test.ts` (fr).
