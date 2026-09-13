# B11. The Spanish and Portuguese 1st-plural imperfect subjunctive has no written accent

**Documented simplification — do NOT fix without a product decision.**

**Language:** Spanish, Portuguese

`subjunctiveForm` (`packages/engine/src/mood.ts`) derives the imperfect subjunctive from the 3rd-plural preterite stem plus endings. Its header lists the missing 1st-plural accent as a known gap.

## Spanish

| | |
|---|---|
| **Behaviour** | `subjunctiveForm` (`mood.ts`) builds the imperfect subjunctive as the 3pl preterite stem plus `ES_SUBJ` endings (`-ra`, `-ras`, …, `-ramos`), with no accent. The file header lists this as a known gap: "the es/pt 1st-plural forms omit the stem accent (comieramos, not comiéramos)". A 1st-plural protasis therefore reads `si comieramos, el perro correría.`, `si hubieramos comido, …`, `si estuvieramos comiendo, …` (the aspect auxiliaries go through the same derivation), and `si fueramos …` for BE and GO. |
| **Correct target / rationale** | The 1st plural is always stressed on the syllable before `-ramos`, which makes it the third-to-last, so it needs a written accent: `comiéramos`, `hubiéramos`, `estuviéramos`, `fuéramos`. The rule is mechanical: accent the last vowel of the stem (`comie-` → `comié-`), and only in the 1st plural. The other five persons are already right. The same comment covers Portuguese (`comêssemos`), which is not checked here. |

## Portuguese

| | |
|---|---|
| **Behaviour** | `subjunctiveForm` (`mood.ts`) builds the Portuguese imperfect subjunctive from the stored 3pl preterite minus `-ram`, plus `PT_SUBJ`. The `1pl` ending is a bare `-ssemos`, so a 1st-plural protasis reads `se comessemos` / `se fossemos fortes` / `se estivessemos na casa`, and the aspect auxiliaries under a condition read `se tivessemos comido` / `se estivessemos comendo`. The header of `mood.ts` lists this as a known minor gap: "the es/pt 1st-plural forms omit the stem accent". |
| **Correct target / rationale** | The 1st plural is stressed on the syllable before `-ssemos`, which Portuguese always writes with an accent: `comêssemos`, `fôssemos`, `estivéssemos`, `tivéssemos`. The accent is `á` for `-ar` verbs (`falássemos`), `í` for `-ir` verbs (`partíssemos`), and `ê` for a regular `-er` verb but `é` for a strong preterite (`tivéssemos`, `fizéssemos`, `déssemos`). Spelling alone cannot choose between `ê` and `é`: `comeram` and `tiveram` look alike. So the fix needs the vowel from the lexeme, or a rule keyed on the preterite (e.g. a 3sg past not ending in `-eu`). The conditional `1pl` (`correríamos`) is already right. |

| Plan (condition clause, 1st plural) | Now | Want |
|---|---|---|
| EAT | `se comessemos, o cão correria.` | `se comêssemos, o cão correria.` |
| BE + STRONG | `se fossemos fortes, o cão correria.` | `se fôssemos fortes, o cão correria.` |
| BE + locative HOUSE | `se estivessemos na casa, o cão correria.` | `se estivéssemos na casa, o cão correria.` |
| EAT, resultative | `se tivessemos comido, o cão correria.` | `se tivéssemos comido, o cão correria.` |

| | |
|---|---|
| **Test** | `hypothetical.test.ts` → *documented simplifications: Spanish 1st-plural imperfect subjunctive*; `hypothetical.test.ts` → *documented simplifications: Portuguese 1st-plural imperfect subjunctive* (2 `test.fails`) |
