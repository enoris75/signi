# A63. An inherently articled German proper name loses the "zur" fusion

**Language:** German

Some proper names always take the definite article (`die Antarktis`), marked `takes_article` in the
corpus. `determiner` returns that article whatever determiner was picked. `prepDet`
(`languages/de/prepDet.ts`) decides whether to fuse `zu der` → `zur` from the *picked*
determiner (`forms.definiteness === 'definite'`), not from the article that actually appears. An
indefinite or bare pick therefore renders the definite article without the fusion.

| Determiner picked | Now | Want |
|---|---|---|
| definite (default) | `der Kater geht zur Antarktis.` | *(already right)* |
| indefinite | `der Kater geht zu der Antarktis.` | `der Kater geht zur Antarktis.` |
| bare | `der Kater geht zu der Antarktis.` | `der Kater geht zur Antarktis.` |

ANTARCTICA is the only `takes_article` name in the corpus today, and it is feminine, so only `zur`
is reachable. A masculine or neuter one would lose `zum` / `im` the same way.

## Shape of the fix

Fuse whenever `determiner` produced the definite article. The simplest version treats a `proper` +
`takes_article` head as definite in `prepDet`'s check.

| | |
|---|---|
| **Test** | `complements/direction.test.ts` → *known bugs: German fusion on an articled proper name* (1 `test.fails`) |
