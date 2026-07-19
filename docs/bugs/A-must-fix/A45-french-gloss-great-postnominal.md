# A45. French places the gloss degree word GREAT after the noun, not before

**Language:** French only

French puts a small closed class of adjectives — the "BAGS" set (beauty, age, goodness, size), plus
a few others — **before** the noun: "grand", "petit", "bon", "vieux", "jeune", "nouveau". The engine
knows this via a `PRENOMINAL` set of concept ids in
[fr.ts](../../../packages/engine/src/languages/fr.ts) (BIG, SMALL, GOOD, BAD, OLD, YOUNG, NEW,
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

## Shape of the fix

Add `GREAT` to the `PRENOMINAL` set in [fr.ts](../../../packages/engine/src/languages/fr.ts); decide
`HIGH` alongside it (adding it makes GOOD/QUICK/HOT read "de haute qualité"/"de haute vitesse"/"à
haute température"). The gloss already places the adjective through the ordinary NP path, so no gloss
code changes — only the membership set. This fix also removes the A44 elision for OLD ("de grand âge"
leads with a consonant), but not for YOUNG (postnominal "bas").

| | |
|---|---|
| **Test** | `adjective-gloss.test.ts` → *known bugs: adjective-definition gloss (French)* (1 `test.fails`: "French places GREAT before the noun in a gloss (de grande taille)") |
