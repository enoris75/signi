# A44. French adjective-definition gloss does not elide "de" before a vowel

**Language:** French only

The adjective-definition gloss (`dimensionGloss`) wraps its dimension-noun phrase in an adposition
the noun's `dimensionRelation` selects — `de` for `extent`/`quality`, `à` for `measure`. The French
engine builds this as a **manual** `` `${prep} ${subjectText(el)}` `` in `dimensionGloss()`
([fr.ts](../../../packages/engine/src/languages/fr.ts)), which prepends a literal `"de "` and so skips
the ordinary French elision: `de` before a vowel-initial word must contract to `d'`.

| | Now | Want |
|---|---|---|
| French | `de âge bas` | `d'âge bas` |

`AGE` ("âge") is the only seeded vowel-initial dimension noun, so it is the only one that surfaces
this — the glosses for **YOUNG** (AGE + LOW → `de âge bas`) and, until A45 lands, **OLD** (AGE +
GREAT → `de âge grand`). Every consonant-initial dimension noun (SIZE, HEIGHT, QUALITY, STRENGTH,
SPEED, TEMPERATURE) is unaffected, and the `measure` adposition `à` never elides.

Note A45 (GREAT placed prenominally) independently removes the OLD case — "de grand âge" leads with
the consonant "grand" — but YOUNG still needs the elision because its degree "bas" is postnominal, so
the vowel-initial "âge" still follows "de". The two fixes are orthogonal.

## Shape of the fix

Elide in `dimensionGloss()` the way the rest of the French engine does — reuse the existing
`joinHead` / elision helper (the one that already gives "d'âge" for an attributive "de" + vowel,
`joinPrepositionElision` at the top of `fr.ts`) rather than the raw `` `${prep} ${…}` `` template, so
`de` + a vowel-initial lead becomes `d'`. The `à` measure preposition is unaffected.

| | |
|---|---|
| **Test** | `adjective-gloss.test.ts` → *known bugs: adjective-definition gloss (French)* (1 `test.fails`: "French elides \"de\" before a vowel-initial dimension noun (d'âge)") |
