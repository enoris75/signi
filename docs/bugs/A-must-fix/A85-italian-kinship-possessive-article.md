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
