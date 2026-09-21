# A17. ASIA and OCEANIA — the biggest / the smallest continent

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. C05 had
every continent on the literal because "a continent" is the same for all of them. A
**superlative** is not: only one continent is the biggest. **Done 2026-09-21**, both as planned; the
Portuguese word order is filed as bug [A178](../../bugs/fixed/A178-portuguese-suppletive-superlative-position.md).
See [Done](#done-2026-09-21).)_

## Plan

A definite CONTINENT with one adjective at degree `most`, inline on each seed block in
[nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (ASIA
[:1359](../../../packages/backend/src/concepts/nouns.ts#L1359), OCEANIA
[:1381](../../../packages/backend/src/concepts/nouns.ts#L1381)):

| concept | definition |
|---|---|
| ASIA | `{ subject: { concept: 'CONTINENT', definiteness: 'definite', adjectives: ['BIG'], adjectiveDegrees: ['most'] } }` |
| OCEANIA | `{ subject: { concept: 'CONTINENT', definiteness: 'definite', adjectives: ['SMALL'], adjectiveDegrees: ['most'] } }` |

ASIA's own description already says it ("the largest continent"). OCEANIA is Australia's continent,
the smallest.

## Vocabulary

All seeded: CONTINENT ([nouns.ts:1296](../../../packages/backend/src/concepts/nouns.ts#L1296)), BIG,
SMALL.

## Probe renders (2026-09-21, the seeded definitions, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ASIA | the biggest continent | il continente più grande | le continent le plus grand | der größte Kontinent | el continente más grande | 最も大きい大陸 | o continente **maior** |
| OCEANIA | the smallest continent | il continente più piccolo | le continent le plus petit | der kleinste Kontinent | el continente más pequeño | 最も小さい大陸 | o continente **menor** |

**The Portuguese reading, judged: marked, shipped anyway, filed as a bug.** The suppletive
superlatives *maior* and *menor* normally stand before the noun: *o maior continente*. After it,
*o continente maior* leans toward the comparative ("the bigger continent"). The defect is not in
this plan. Every suppletive superlative does it, in any sentence: *o gato melhor*, *a casa menor*,
*o gato vê o cão maior*. It is [A178](../../bugs/fixed/A178-portuguese-suppletive-superlative-position.md),
pinned in `adjectives.test.ts`, and a trial fix renders *o maior continente* / *o menor
continente*. The definitions pick that up with no change here.

The other five are the normal superlative in their language. French *le continent le plus grand*
is grammatical and is what the engine gives every French superlative
([B04](../../bugs/fixed/B04-french-relative-superlative-second-article.md)). *Le plus grand
continent* is the more usual order for *grand*, but that is a matter of style, not a defect.

## Not in this ticket

**ANTARCTICA**, "the coldest continent", renders in six languages. Japanese says 最も**冷たい**大陸:
COLD's Japanese is 冷たい, cold to the touch, and a climate is 寒い. It stays in C05 with that
reason (re-probed 2026-09-21: en "the coldest continent", de "der kälteste Kontinent", ja
最も冷たい大陸, pt "o continente mais frio"). AFRICA, EUROPE and the two Americas have no superlative.
Their descriptions place them ("south of the Mediterranean"), and they stay in C05 too.

_(Later the same day C05's second pass split two of them out to [B48](B48-climate-cold-hot.md),
which seeded the climate senses of COLD and HOT: ANTARCTICA is now the coldest continent, ja
最も寒い大陸, and AFRICA the hottest.)_

## Coverage

ASIA in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), in English and
German ("der größte Kontinent", where the superlative is one inflected word).

## Done (2026-09-21)

**ASIA → "the biggest continent", OCEANIA → "the smallest continent"**, the two plans above, inline
on their seed blocks in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts).

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ASIA | the biggest continent | il continente più grande | le continent le plus grand | der größte Kontinent | el continente más grande | 最も大きい大陸 | o continente maior |
| OCEANIA | the smallest continent | il continente più piccolo | le continent le plus petit | der kleinste Kontinent | el continente más pequeño | 最も小さい大陸 | o continente menor |

What landed differently from the plan:

1. **Portuguese shipped in the marked order**, *o continente maior* / *menor*, and the order was filed
   as [A178](../../bugs/fixed/A178-portuguese-suppletive-superlative-position.md), **fixed on
   2026-09-21**: these two now render *o maior continente* / *o menor continente*, with no seed edit,
   exactly as this note predicted. Checked
   first: it is not specific to definitions (*the best cat* → *o gato melhor*), and no bug about it
   existed. A6 had chosen the postnominal place for every compared adjective, which is right for
   the comparative only. A178's `test.fails` includes the two continent plans, so fixing it moves
   these tooltips to *o maior continente* / *o menor continente* with no edit to the seed.
2. Nothing else. The other six languages rendered exactly as the probe table said, and the backend
   boots clean with all seven.

- Seed: [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (ASIA, OCEANIA).
- Tests: *a superlative tells one continent from the others (localization A17: ASIA)* in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), en + de; the A178 pin in
  [adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts) (*known bugs: Portuguese
  suppletive superlative before the noun*).
