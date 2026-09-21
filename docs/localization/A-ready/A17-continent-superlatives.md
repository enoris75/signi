# A17. ASIA and OCEANIA — the biggest / the smallest continent

_(split out of [C05](../C-needs-engine/C05-non-distinguishing-genera.md) on 2026-09-21. C05 had
every continent on the literal because "a continent" is the same for all of them. A
**superlative** is not: only one continent is the biggest.)_

## Plan

A definite CONTINENT with one adjective at degree `most`, inline on each seed block in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts):

| concept | definition |
|---|---|
| ASIA | `{ subject: { concept: 'CONTINENT', definiteness: 'definite', adjectives: ['BIG'], adjectiveDegrees: ['most'] } }` |
| OCEANIA | `{ subject: { concept: 'CONTINENT', definiteness: 'definite', adjectives: ['SMALL'], adjectiveDegrees: ['most'] } }` |

ASIA's own description already says it ("the largest continent"). OCEANIA is Australia's continent,
the smallest.

## Vocabulary

All seeded: CONTINENT, BIG, SMALL.

## Probe renders (2026-09-21, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ASIA | the biggest continent | il continente più grande | le continent le plus grand | der größte Kontinent | el continente más grande | 最も大きい大陸 | o continente **maior** |
| OCEANIA | the smallest continent | il continente più piccolo | le continent le plus petit | der kleinste Kontinent | el continente más pequeño | 最も小さい大陸 | o continente **menor** |

**One reading to judge when authoring: Portuguese.** The suppletive superlatives *maior* and *menor*
normally stand before the noun: *o maior continente*. After it, *o continente maior* leans toward the
comparative ("the bigger continent"). If it reads wrong, file it as a Portuguese bug (a suppletive
superlative takes the prenominal position), not a change to this plan.

## Not in this ticket

**ANTARCTICA**, "the coldest continent", renders in six languages. Japanese says 最も**冷たい**大陸:
COLD's Japanese is 冷たい, cold to the touch, and a climate is 寒い. It stays in C05 with that
reason. AFRICA, EUROPE and the two Americas have no superlative. Their descriptions place them
("south of the Mediterranean"), and they stay in C05 too.

## Coverage

Add ASIA to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) in English and
German ("der größte Kontinent", where the superlative is one inflected word).
