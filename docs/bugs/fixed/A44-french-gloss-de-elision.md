# A44. French adjective-definition gloss does not elide "de" before a vowel

**Language:** French only

The adjective-definition gloss (`dimensionGloss`) wraps its dimension-noun phrase in an adposition
the noun's `dimensionRelation` selects — `de` for `extent`/`quality`, `à` for `measure`. The French
engine builds this as a **manual** `` `${prep} ${subjectText(el)}` `` in `dimensionGloss()`
([fr/dimensionGloss.ts](../../../packages/engine/src/languages/fr/dimensionGloss.ts)), which prepends a literal `"de "` and so skips
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
`joinArt` in `languages/fr/`) rather than the raw `` `${prep} ${…}` `` template, so
`de` + a vowel-initial lead becomes `d'`. The `à` measure preposition is unaffected.

| | |
|---|---|
| **Test** | `adjective-gloss.test.ts` → *known bugs: adjective-definition gloss (French)* (1 `test.fails`: "French elides \"de\" before a vowel-initial dimension noun (d'âge)") |

## Resolved

**2026-09-13.** `dimensionGloss()` now elides its adposition against the word that leads the
rendered fragment, the same way the rest of the French engine does: it runs the lead through
`elidesBefore` (so an h muet noun the corpus marks `elides` contracts too, and an h aspiré one does
not) and joins with `joinArt` (no space after `d'`). Only `de` elides; the `measure` adposition `à`
is left whole. Because the test is on the *lead*, a prenominal degree keeps `de` intact
(`de petit âge`), while a postnominal degree or none gives `d'âge bas` / `d'âge`.

- **Engine:** [`packages/engine/src/languages/fr/dimensionGloss.ts`](../../../packages/engine/src/languages/fr/dimensionGloss.ts)
- **Tests:** [`packages/engine/test/adjective-gloss.test.ts`](../../../packages/engine/test/adjective-gloss.test.ts)
  → *known bugs: adjective-definition gloss (French)*. The pinning `test.fails` is now a passing
  `test`. Added cases: AGE with another postnominal degree (`d'âge haut.`) and with no degree
  (`d'âge.`); a prenominal degree keeps `de` whole (`de petit âge.`); the h aspiré HEIGHT is unchanged
  (`de hauteur basse.`). Unit cases in
  [`languages/fr/dimensionGloss.test.ts`](../../../packages/engine/src/languages/fr/dimensionGloss.test.ts)
  cover the vowel-initial lead, the prenominal lead, an h muet (`d'humidité`) vs h aspiré noun, and
  `à` never eliding.

The OLD gloss still renders `d'âge grand.`: its placement is A45, not addressed here.
