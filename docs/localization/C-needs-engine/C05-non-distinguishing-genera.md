# C05. Non-distinguishing genera — deliberately not localized

**Blocked on:** nothing seedable cheaply — these concepts share a genus with their siblings and have
**no distinguishing feature the engine can compose**, so any genus gloss would be identical across
the group ("a continent" for all eight). Per the project decision, we do **not** ship a
non-distinguishing definition; these stay on the English literal until a genuinely distinguishing
construct exists (e.g. a locative complement "the continent **south of the Mediterranean**", which
needs geographic reference nouns and a PP-in-definition construct — out of scope).

## Deliberately left on the English literal

- **8 continents** — AFRICA, ANTARCTICA, ASIA, EUROPE, NORTH_AMERICA, OCEANIA, SOUTH_AMERICA
  (all → "a continent").
- **7 languages** — ENGLISH, FRENCH, GERMAN, ITALIAN, JAPANESE, PORTUGUESE, SPANISH
  (all → "a language").
- **Grammar meta-nouns** without a differentia — GENDER, NUMBER_GRAMMAR, PERSON_GRAMMAR, CASE,
  ARTICLE, DEMONSTRATIVE, QUANTIFIER, DETERMINER, etc. Some may become feasible via B06's verbs;
  those move to B. The rest stay here. **The nine complement names left**, 2026-09-16: once
  COMPLEMENT_GRAMMAR was their `isA`, it was the differentia-bearing genus they had been missing,
  and all four glosses B31 authored are composed on it ("a complement that indicates means") —
  see [B31](../done/B31-complement-genus.md).
- **FEELING** ("a feeling"), 2026-09-16 — seeded by [B30](../done/B30-feeling-genus.md) as
  AFFECTION's genus. Nothing composable distinguishes it: `patientGloss('CONCEPT', 'FEEL')` gives
  "a concept that one feels" (de "ein Begriff, den man fühlt"), which is its own genus restated.
- **Verbs whose composable gloss would duplicate a sibling's**, 2026-09-14:
  - **SELECT** would read the same as CHOOSE's "to indicate an option"
    ([B18](../done/B18-selection-verbs.md)).
  - **REPLACE** ("to take the place of") fits neither CHANGE nor INDICATE, and every shape tried read
    like MODIFY or NAME ([B16](../done/B16-word-verbs.md)).
- **BECOME** ("to come to be; to change into a different state"), 2026-09-21, split out of
  [C19](../done/C19-verbs-needing-voice-purpose-or-comitative.md). It is the copula plus an aspect,
  not a genus with a differentia, so it sits with BE, which
  [C08](../done/C08-copular-and-genus-verbs.md#still-on-the-english-literal-by-design) leaves on the
  literal. The one composable shape is the **inchoative**, BEGIN + BE + an adjective, and it
  renders, but it does not earn a gloss:

  | plan | en | it | fr | de | es | ja | pt |
  |---|---|---|---|---|---|---|---|
  | BEGIN + BE + VISIBLE (seeded; probed 2026-09-21) | to begin to be visible | iniziare a essere visibile | commencer à être visible | beginnen, sichtbar zu sein | empezar a estar visible | 可視であることが始まる | começar a estar visível |
  | BEGIN + BE + DIFFERENT (DIFFERENT unseeded; probed 2026-09-20) | to begin to be different | iniziare a essere diverso | commencer à être différent | beginnen, verschieden zu sein | empezar a ser diferente | 別であることが始まる | começar a ser diferente |

  - **Japanese** says the *nominalized event* of being X, beginning (〜であることが始まる). What
    Japanese says here is 〜になる, which is BECOME's own word, so the gloss either reads as a
    translation exercise or defines the verb with itself.
  - **The adjective.** A state-neutral gloss wants DIFFERENT, and DIFFERENT's Japanese would be 別の,
    which is already OTHER's ([B21](../done/B21-ui-clause-and-coordination-vocabulary.md)). 異なる and
    違う are verbs, not adjectives, so the seed would double a word to say a different thing.

  BECOME is the genus of APPEAR, COMPACT and EXPAND (C08), and it works there. It just cannot be
  defined itself. Revisit only if a gloss turns up that is worth a seed.

This file is the record that the omission is **intentional**, not an oversight.

## Unblocked: BUILDING (2026-09-19)

BUILDING was the one entry here that was blocked by the engine rather than by a missing differentia.
"A place that has walls" distinguished it and composed, but it rendered wrong in two languages
([B29](../done/B29-building-genus.md) has the probe). Both gaps are now fixed, so the gloss ships as
`whoGloss('PLACE', 'HAVE', 'WALL')`:

- **French** left the bare plural object without its partitive: *un lieu qui a murs*. A French object
  now has no zero article, and a negation turns its indefinite or partitive article into *de*
  ([A149](../../bugs/fixed/A149-french-object-zero-article.md)). The fix also restored the article in
  the 41 French glosses that had shipped without one (*une personne qui fait des objets*,
  *consommer de la nourriture*).
- **Japanese** said the possession with 持つ, which is holding: 壁を持つ場所. HAVE with an inanimate
  owner is now the existential ある, its object marked が
  ([A150](../../bugs/fixed/A150-japanese-inanimate-owner-aru.md)).

WALL was seeded for it (muro / mur / Wand / pared / 壁 / parede).

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| a place that has walls | un luogo che ha muri | un lieu qui a des murs | ein Ort, der Wände hat | un lugar que tiene paredes | 壁がある場所 | um lugar que tem paredes |

The tooltip e2e spec used BUILDING as its example of a concept with **no** plan. It now uses FEELING,
which stays on the literal.
