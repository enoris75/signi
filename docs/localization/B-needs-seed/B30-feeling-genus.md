# B30. Feeling genus — FEELING over AFFECTION

_(from the isA audit, 2026-09-14: AFFECTION is described as "a warm feeling of fondness toward
someone", and no FEELING is seeded.)_

AFFECTION was seeded for [B17](../done/B17-feeling-and-sound-verbs.md) as the object of LOVE's gloss
("to feel affection"). It has no `isA` and no `definition`, because its genus is not a concept. This
task seeds FEELING and moves AFFECTION under it. It is also the first emotion noun that
[B07](../done/B07-scalar-adjective-definitions.md) and B17 found missing.

## Seed first (1 noun + 1 adjective) — `/generalize`

Run [`/generalize`](../../../.claude/skills/generalize/SKILL.md) `AFFECTION into FEELING`, then
[`/seed`](../../../.claude/skills/seed/SKILL.md) `WARM` for AFFECTION's differentia.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| FEELING | noun, countable | an emotion or sensation one feels | feeling | sentimento (m) | sentiment (m) | Gefühl (n) | sentimiento (m) | 感情 (かんじょう) | sentimento (m) |
| WARM | adjective | moderately hot; kindly | warm | caloroso | chaleureux | warm | cálido | 温かい | caloroso |

The forms are suggestions, not renders. **WARM is polysemous.** Temperature *warm* is it *tiepido*,
fr *tiède*, pt *morno*, but a warm feeling is *caloroso*, *chaleureux*, *caloroso*. German *warm*,
es *cálido* and ja 温かい cover both senses. Seed the figurative sense here, and give temperature
*warm* a separate concept if one is ever needed ([B07](../done/B07-scalar-adjective-definitions.md)'s
TEMPERATURE scale has only HOT and COLD).

## Hierarchy

| concept | isA before | isA after |
|---|---|---|
| FEELING | — (new) | — (root) |
| AFFECTION | — | FEELING |

AFFECTION was a root, so nothing is severed. FEELING stays a root: CONCEPT ("a thing thought rather
than held") is the wrong parent for it.

## Unlocks

| concept | plan | gloss (en) | status |
|---|---|---|---|
| AFFECTION | `glossOf('FEELING', 'WARM')` | a warm feeling | ✓ once seeded. The shape probed clean with CONCEPT and HOT standing in (it "un concetto caldo", de "ein heißer Begriff") |
| FEEL | `infinitiveGloss('HAVE', 'FEELING', 'plural')` | to have feelings | ⚠ probe. The shape renders (de "Begriffe haben" with CONCEPT standing in), but check that "to have feelings" isn't read as the idiom |
| FEELING | — | — | ✗ no composable differentia. `patientGloss('CONCEPT', 'FEEL')` gives "a concept that one feels" (de "ein Begriff, den man fühlt"). Leave it on the literal ([C05](../C-needs-engine/C05-non-distinguishing-genera.md)) |

This does **not** unblock HAPPY, SAD, TIRED or HUNGRY. B07 still needs their emotion nouns (JOY,
SORROW, …) and a construct for "feeling joy"; FEELING only gives those nouns a parent.
