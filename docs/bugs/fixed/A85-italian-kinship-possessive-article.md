# A85. Italian puts the article before a possessive + singular kinship noun

**Language:** Italian

Italian leaves out the definite article when a possessive comes before a *singular, unmodified*
kinship noun: `mio padre`, `tuo padre`, `suo padre`, `nostro padre`. The article comes back with
`loro` (`il loro padre`), in the plural (`i miei padri`), and when the noun is modified (`il mio
vecchio padre`). `renderNP` (`languages/it/renderNP.ts`) always pairs a pronominal possessor with
`defArticle`. The corpus has no feature marking a noun as kinship, so the exception cannot be
applied. FATHER is the only seeded noun in that class.

| Possessor | Now | Want |
|---|---|---|
| 3sg, subject | `il suo padre corre.` | `suo padre corre.` |
| 1pl, subject | `il nostro padre corre.` | `nostro padre corre.` |
| 2sg, direct object | `il gatto vede il tuo padre.` | `il gatto vede tuo padre.` |

Already right: `il loro padre corre.`, `i miei padri corrono.`, `il mio vecchio padre corre.`, and
every non-kinship noun (`il suo cane`).

## Shape of the fix

Mark the kinship nouns on the Italian lexeme (e.g. a `kinship: '1'` form on FATHER, and later
MOTHER, BROTHER, SON, …). In `renderNP`, drop the article when all of these hold: a pronominal
possessor, a kinship head, singular number, no adjective or noun modifier, and a possessor that is
not 3pl (`loro`). A complement keeps its bare preposition (`a tuo padre`), which also needs the
separate pronominal-possessor-on-a-complement fix (today `il gatto dà il libro il tuo padre.`).

| | |
|---|---|
| **Test** | `possessivePronoun.test.ts` → *known bugs: Italian possessive before a kinship noun* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.

- **Corpus:** FATHER's Italian lexeme carries `kinship: '1'` in
  [`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts). It is the only seeded kinship noun; MOTHER,
  BROTHER, SON and the rest take the same flag when they are added.
- **Engine:** the new [`itPossessedHeadForms.ts`](../../../packages/engine/src/languages/it/itPossessedHeadForms.ts)
  is Italian's `possessedHeadForms`. It returns `bare` when all of these hold: a pronominal possessor, a
  kinship head, the singular, no adjective or noun modifier, and a possessor other than `loro`. Otherwise
  it returns `definite`. Every Italian caller that built a head from `possessedHeadForms(np, 'definite')`
  now uses it: `subjectPhrase`, `npText`, `mannerGloss`, `complementsPhrase` and the genitive recursion
  in `renderNP`.

Every row now renders as wanted. A complement keeps its bare preposition (`il gatto va da tuo padre`),
and so do a noun possessor (`il libro di mio padre`) and a relative head (`mio padre che mangia corre`).
`il loro padre`, `i miei padri`, `il mio vecchio padre` and `il suo cane` are unchanged. The engine has no
dative slot for the `dà il libro il tuo padre` the bug file mentions.

- **Tests:** [`packages/engine/test/possessivePronoun.test.ts`](../../../packages/engine/test/possessivePronoun.test.ts)
  → *known bugs: Italian possessive before a kinship noun*. The pinning `test.fails` is now a passing
  `test`. New cases cover `loro`, the plural and an adjective; the complement, genitive and relative
  head; and a guard for a non-kinship noun.
- Unit tests: the new `itPossessedHeadForms.test.ts`, and `renderNP.test.ts` (it), whose determiner
  helper now reads heads the way the callers do.
