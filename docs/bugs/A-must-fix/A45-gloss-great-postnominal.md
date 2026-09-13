# A45. The gloss degree word GREAT is placed after the noun instead of before

**Language:** French, Italian

French and Italian put a closed class of adjectives before the noun through a `PRENOMINAL` set of concept ids. The gloss degree word GREAT (`grand`, `grande`) is missing from both sets, so an adjective-definition gloss places it after the noun.

## French

French puts a small closed class of adjectives — the "BAGS" set (beauty, age, goodness, size), plus
a few others — **before** the noun: "grand", "petit", "bon", "vieux", "jeune", "nouveau". The engine
knows this via a `PRENOMINAL` set of concept ids in
[fr.consts.ts](../../../packages/engine/src/languages/fr/fr.consts.ts) (BIG, SMALL, GOOD, BAD, OLD, YOUNG, NEW,
BEAUTIFUL, …). The degree words seeded for the adjective-definition glosses — **GREAT** ("grand"),
and likewise **HIGH** ("haut") — were never added to it, so in a gloss they fall postnominally:

| | Now | Want |
|---|---|---|
| French | `de taille grande` | `de grande taille` |

`GREAT` is the same word "grand" that the engine already places prenominally elsewhere ("le grand
chat"), so the gloss reads unnaturally against the rest of the engine. The engine's own comment on
`dimensionGloss()` even gives "de grande taille" as the intended output. It affects every GREAT-degree
gloss — **BIG** (SIZE), **HIGH** (HEIGHT), **OLD** (AGE), **STRONG** (STRENGTH).

**HIGH is related but less clear-cut.** "haut" is not a classic BAGS adjective and is postnominal in
many contexts ("une tour haute"), yet the abstract "de haute qualité" / "de haute vitesse" idiom is
prenominal. The GOOD/QUICK/HOT glosses render "de qualité haute" today. A fix should decide HIGH
deliberately; this bug's `test.fails` pins only the unambiguous GREAT case.

### Shape of the fix

Add `GREAT` to the `PRENOMINAL` set in [fr.consts.ts](../../../packages/engine/src/languages/fr/fr.consts.ts); decide
`HIGH` alongside it (adding it makes GOOD/QUICK/HOT read "de haute qualité"/"de haute vitesse"/"à
haute température"). The gloss already places the adjective through the ordinary NP path, so no gloss
code changes — only the membership set. This fix also removes the A44 elision for OLD ("de grand âge"
leads with a consonant), but not for YOUNG (postnominal "bas").

## Italian

Italian's `PRENOMINAL` set (`languages/it/it.consts.ts`) has BIG (`grande`) but not the gloss
degree word GREAT, which has the same surface. So `splitAdjectives` puts it after the noun in
every GREAT gloss: BIG, HIGH, OLD, STRONG. The corpus's own comment on `dimGloss` (the Italian
example in `packages/backend/src/concepts/adjectives.ts`) and the doc comment on `dimensionGloss`
both give `di grande dimensione` as the target.

| Gloss | Now | Want |
|---|---|---|
| SIZE + GREAT (BIG) | `di dimensione grande.` | `di grande dimensione.` |
| AGE + GREAT (OLD) | `di età grande.` | `di grande età.` |
| STRENGTH + GREAT (STRONG) | `di forza grande.` | `di grande forza.` |

Existing tests to update with the fix: `languages/it/splitAdjectives.test.ts:24-27` pins GREAT as
postnominal, using it as the example that placement keys off the concept rather than the surface
(the fixture comment `languages/it/it.fixtures.ts:108` says so too). HIGH is the same open question
as in French. `IT_DIM_PREP`'s comment writes `di alta qualità` / `ad alta temperatura`, while
`adjective-gloss.test.ts:24` and `:60` pin `di velocità alta.` / `a temperatura alta.` (GOOD renders
`di qualità alta.`). Decide HIGH deliberately; only GREAT is pinned.

| | |
|---|---|
| **Test** | `adjective-gloss.test.ts` → *known bugs: adjective-definition gloss (French)* (1 `test.fails`: "French places GREAT before the noun in a gloss (de grande taille)")<br>`adjective-gloss.test.ts` → *known bugs: adjective-definition gloss (Italian)* (1 `test.fails`) |
