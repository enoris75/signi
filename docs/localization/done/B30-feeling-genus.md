# B30. Feeling genus — FEELING over AFFECTION

_(from the isA audit, 2026-09-14: AFFECTION is described as "a warm feeling of fondness toward
someone", and no FEELING is seeded.)_

AFFECTION was seeded for [B17](B17-feeling-and-sound-verbs.md) as the object of LOVE's gloss
("to feel affection"). It has no `isA` and no `definition`, because its genus is not a concept. This
task seeds FEELING and moves AFFECTION under it. It is also the first emotion noun that
[B07](B07-scalar-adjective-definitions.md) and B17 found missing.

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
*warm* a separate concept if one is ever needed ([B07](B07-scalar-adjective-definitions.md)'s
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
| FEELING | — | — | ✗ no composable differentia. `patientGloss('CONCEPT', 'FEEL')` gives "a concept that one feels" (de "ein Begriff, den man fühlt"). Leave it on the literal ([C05](C05-non-distinguishing-genera.md)) |

This does **not** unblock HAPPY, SAD, TIRED or HUNGRY. B07 still needs their emotion nouns (JOY,
SORROW, …) and a construct for "feeling joy"; FEELING only gives those nouns a parent.

## What shipped (2026-09-16)

- **FEELING** seeded in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) as a root, with
  no `definition` — its only composable differentia is its own genus, so it stays on the English
  literal ([C05](C05-non-distinguishing-genera.md)). A count noun with a plural in
  every language; German *Gefühl* is neuter.
- **WARM** seeded in [adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts), the
  figurative sense only, with `synonym: 'kindly'` so the picker says which sense it is. It is
  **not** `transient`, unlike HOT: a kindly feeling is what it is, so es/pt predicate it with *ser*.
  French *chaleureux* declines by the engine's existing `-eux → -euse` rule (chaleureuse,
  chaleureuses) and is invariable in the masculine plural.
- **AFFECTION** gained `isA: 'FEELING'` — it was a root, so nothing is severed — and its gloss.

| concept | plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| AFFECTION | `glossOf('FEELING', 'WARM')` | a warm feeling | un sentimento caloroso | un sentiment chaleureux | ein warmes Gefühl | un sentimiento cálido | 温かい感情 | um sentimento caloroso |
| FEEL | `infinitiveGloss('HAVE', 'FEELING', 'plural')` | to have feelings | avere sentimenti | avoir sentiments | Gefühle haben | tener sentimientos | 感情を持つ | ter sentimentos |

**FEEL shipped after the probe.** The two doubts the table raised both came out clear enough:

- *The English idiom.* "To have feelings **for** someone" is the idiom; bare, "to have feelings" is
  the definition, and the tooltip carries no *for*-phrase.
- *Circularity.* The gloss is morphologically transparent in German (fühlen / Gefühle) and in
  es/pt (sentir / sentimiento), though not in it *provare* / *sentimenti*, fr *éprouver* /
  *sentiments* or ja 感じる / 感情. That is the same transparency B07 already ships in Italian —
  BIG is "di grande dimensione" — and the gloss still says what FEEL adds to its genus HAVE.

French renders the bare plural without a partitive ("avoir sentiments"), the documented
simplification every `whoGloss` object and CREATOR's shipped "une personne qui fait objets" already
carry. It was not treated as a blocker here for the same reason.

Still **not** unblocked: HAPPY, SAD, TIRED and HUNGRY. B07 needs their emotion nouns (JOY, SORROW,
…) and a construct for "feeling joy"; FEELING only gives those nouns a parent.

- Tests: the FEELING/AFFECTION countability pair in
  [subject.test.ts](../../../packages/engine/test/subject.test.ts) (FEELING pluralises, AFFECTION
  takes the French partitive *de l'*), WARM's agreement in
  [adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) plus its row in
  `EVERY_ADJECTIVE`, FEELING's reading in the `KANJI_NOUNS` table in
  [furigana.test.ts](../../../packages/engine/test/furigana.test.ts), the ancestry in
  [index.test.ts](../../../packages/backend/src/concepts/index.test.ts), and both tooltips in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
