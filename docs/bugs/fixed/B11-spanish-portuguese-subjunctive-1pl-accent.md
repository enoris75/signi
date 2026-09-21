# B11. The Spanish and Portuguese 1st-plural imperfect subjunctive has no written accent

**Documented simplification — do NOT fix without a product decision.** The user made that decision and asked for the fix; see **Resolved**.

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

## Resolved

2026-09-21. The user asked for the fix, which is the product decision this file called for. It is
retired to `fixed/` like an A bug.

- **Engine:** [`mood.ts`](../../../packages/engine/src/mood.ts), `subjunctiveForm`. The 1st plural
  writes the accent on the preterite stem's last vowel, and no other person does. A stem vowel
  already written with an accent (Portuguese `possuí-`) keeps it.
  - **Spanish** always takes the acute: `comiéramos`, `cantáramos`, `fuéramos`, `hubiéramos`,
    `estuviéramos`, `leyéramos`.
  - **Portuguese** writes `á` for an `a` stem (`falássemos`), `í` for an `i` stem (`partíssemos`,
    `víssemos`) and `ô` for ser / ir (`fôssemos`). An `e` stem is the case the spelling cannot
    decide, and `ptStemAccent` keys it on the preterite. It writes `ê` when the verb is a regular
    `-er` verb, meaning its infinitive ends in `-er` **and** its 3sg past ends in `-eu` (`comeu` →
    `comêssemos`, `leu` → `lêssemos`). Otherwise it writes `é`, the strong preterites: `teve` →
    `tivéssemos`, `fez` → `fizéssemos`, `veio` → `viéssemos`, `quis` → `quiséssemos`. The infinitive
    check is needed for `dar`, the one strong preterite whose 3sg does end in `-eu` (`deu` →
    `déssemos`). The aspect auxiliaries (`ESTAR_AUX`, `TER_AUX`) store only their preterite, so they
    fall to `é`, which is right for them (`estivéssemos`, `tivéssemos`).
  - The "known gap" line is gone from the file header, which now describes the accent.
- **Why the preterite rule and not a seeded form.** Every seeded Portuguese verb already stores its
  3sg past, and the rule gets all 97 of them right (the sweep below). A seeded form would have
  meant a new corpus field on every verb, to be kept right by hand.

- **Tests:** [`packages/engine/test/hypothetical.test.ts`](../../../packages/engine/test/hypothetical.test.ts)
  → *documented simplifications: Spanish 1st-plural imperfect subjunctive* and *… Portuguese …*. Both
  pinning `test.fails` are now passing `test`s, with their assertions unchanged. New cases:
  - irregular stems, a modal, a reflexive verb and the negation in both languages (`si fuéramos
    fuertes`, `si diéramos`, `si pudiéramos comer`, `si nos moviéramos`, `se lêssemos`, `se
    déssemos`, `se víssemos`, `se fôssemos à casa`, `se não comêssemos`). The 2nd plural stays
    unmarked (`si comierais`, `se comessem`).
  - the 1st-plural rows that [A101](A101-spanish-reflexive-mood-clitic.md) and
    [A137](A137-pronominal-verb-in-a-hypothetical.md) left unpinned for want of this accent: `si nos
    volviéramos una leyenda`, `se nos tornássemos uma lenda`.
  - **a sweep of every seeded verb** in each language. The Spanish sweep checks that each 1st plural
    has exactly one acute, on the stem vowel before `-ramos`. The Portuguese sweep checks each form
    against an expectation built apart from the engine's rule: the infinitive's class picks the
    accent (`-ar` á, `-er` ê, `-ir` í), and the eleven irregular preterites are written out by hand
    (`fôssemos` ×2, `déssemos`, `víssemos`, `viéssemos`, `tivéssemos`, `contivéssemos`,
    `fizéssemos`, `soubéssemos`, `pudéssemos`, `quiséssemos`).
- **Unit tests:** [`mood.test.ts`](../../../packages/engine/src/mood.test.ts) → *moodForm: the
  1st-plural imperfect subjunctive accent*: the Spanish acute, and the Portuguese á / í / ô. It also
  covers ê against é, including `dar`, a reflexive verb's stored forms, and the auxiliaries.
