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

## Resolved

Fixed 2026-09-13 by adding GREAT to both prenominal sets, as the shape of the fix proposed. No gloss
code changed.

- [`fr.consts.ts`](../../../packages/engine/src/languages/fr/fr.consts.ts) and
  [`it.consts.ts`](../../../packages/engine/src/languages/it/it.consts.ts): `GREAT` is now in
  `PRENOMINAL`, next to `BIG`. It has the same surface as BIG, so it goes in the same place. All four
  GREAT glosses changed:

  | Gloss | French | Italian |
  |---|---|---|
  | BIG (SIZE) | `de grande taille.` | `di grande dimensione.` |
  | HIGH (HEIGHT) | `de grande hauteur.` | `di grande altezza.` |
  | OLD (AGE) | `de grand âge.` | `di grande età.` |
  | STRONG (STRENGTH) | `de grande force.` | `di grande forza.` |

  As expected, `de grand âge` no longer elides (A44), because a consonant now leads. A compared GREAT
  still follows the noun, like any compared BAGS adjective (`de taille plus grande`,
  `di dimensione più grande`). GREAT used as an ordinary attribute now reads like BIG: `le grand
  chat`, `le grand animal`, `les grandes maisons`, `il grande gatto`, `le grandi case`.

- **HIGH stays after the noun.** This was a deliberate choice. "haut"/"alto" is not a BAGS
  adjective, and a literal noun phrase puts it after the noun (`une tour haute`, `la torre alta`).
  The prenominal `de haute qualité` / `di alta qualità` is a set phrase that belongs to the abstract
  scale nouns, not a rule about the adjective. Putting HIGH before the noun would also make Italian
  measure glosses read `a alta temperatura`, because the gloss adposition does not add the euphonic
  `ad`. So GOOD, QUICK and HOT keep `de qualité haute` / `di qualità alta`. Both `PRENOMINAL`
  comments record this choice. If the product wants the set-phrase forms, that belongs to the
  dimension noun or the gloss, not to the adjective sets.

- **Tests:** [`packages/engine/test/adjective-gloss.test.ts`](../../../packages/engine/test/adjective-gloss.test.ts)
  → *known bugs: adjective-definition gloss (French)* and *(Italian)*. Both pinning `test.fails` are
  now passing `test`s. New cases:
  - every GREAT gloss in both languages (HEIGHT, AGE, STRENGTH);
  - a guard that a compared GREAT and HIGH stay after the noun;
  - GREAT as an ordinary attribute in a clause.

  Colocated unit tests:
  - [`it/splitAdjectives.test.ts`](../../../packages/engine/src/languages/it/splitAdjectives.test.ts)
    used GREAT as its example of a postnominal "grande". It now checks that GREAT precedes, that
    placement still depends on the concept rather than the surface (`grande` under an unlisted
    concept follows), and that HIGH follows.
  - [`fr/splitAdjectives.test.ts`](../../../packages/engine/src/languages/fr/splitAdjectives.test.ts)
    now checks the same two cases, GREAT preceding and HIGH following.
  - [`it/dimensionGloss.test.ts`](../../../packages/engine/src/languages/it/dimensionGloss.test.ts)
    and [`fr/dimensionGloss.test.ts`](../../../packages/engine/src/languages/fr/dimensionGloss.test.ts)
    now render the SIZE gloss with GREAT itself.
  - The `it.fixtures.ts` comment on `GRANDE` is updated.

  The comment in `e2e/definition-tooltip.spec.ts` that skips French for the BIG tooltip because of
  A44/A45 is now out of date. French could be pinned there (`de grande taille`).
