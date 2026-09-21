# B48. ANTARCTICA and AFRICA — seed the climate senses of COLD and HOT: the coldest / the hottest continent

_(split out of [C05](C05-non-distinguishing-genera.md) on 2026-09-21. "The coldest continent"
already rendered in six languages. Japanese said 最も**冷たい**大陸, because the seeded COLD is 冷たい,
cold to the touch. The same probe found AFRICA a gloss: C05 had it waiting on a compass relation,
and it is the hottest continent. **Done 2026-09-21**, both as planned: see
[Done](#done-2026-09-21).)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| COLD_CLIMATE | adjective | cold, of weather or a climate | cold | freddo | froid | kalt | frío | 寒い | frio |
| HOT_CLIMATE | adjective | hot, of weather or a climate | hot | caldo | chaud | heiß | caluroso | 暑い | quente |

Seeded as proposed, each beside its touch sense in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts) (COLD_CLIMATE at
[line 420](../../../packages/backend/src/concepts/adjectives.ts#L420), HOT_CLIMATE at
[line 479](../../../packages/backend/src/concepts/adjectives.ts#L479)).

- **Why a second sense.** Japanese splits temperature to the touch (冷たい, 熱い: the seeded COLD and
  HOT, right for "cold water") from the ambient kind the whole body feels (寒い, 暑い). Spanish splits
  HOT the same way (*caliente* / *caluroso*) but not COLD. The other five use one word for both.
  WARM is the precedent: one sense seeded, and a `synonym` to tell it apart in the picker. Both
  carry `synonym: 'climate'`.
- **Not `transient`.** A climate is what a place is, so es and pt predicate it with *ser* (*la
  Antártida es fría*). COLD and HOT take *estar* ([A47](../../bugs/fixed/A47-spanish-portuguese-ser-vs-estar.md)).
- **German** *kalt* has `umlaut: 'true'`, as COLD has it (*der kälteste*).
- **Their own definitions** are their siblings': `dimGloss('TEMPERATURE', 'LOW')` and
  `dimGloss('TEMPERATURE', 'HIGH')`. The senses differ in register, not in meaning.

## Unlocks

The superlative plan [A17](A17-continent-superlatives.md) gives ASIA and OCEANIA:

| concept | plan | gloss (en) |
|---|---|---|
| ANTARCTICA | `{ subject: { concept: 'CONTINENT', definiteness: 'definite', adjectives: ['COLD_CLIMATE'], adjectiveDegrees: ['most'] } }` | the coldest continent |
| AFRICA | the same with `HOT_CLIMATE` | the hottest continent |

### Probe renders (2026-09-21, the seeded words and definitions, lexicon seeded in memory, engine source)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ANTARCTICA | the coldest continent | il continente più freddo | le continent le plus froid | der kälteste Kontinent | el continente más frío | 最も寒い大陸 | o continente mais frio |
| AFRICA | the hottest continent | il continente più caldo | le continent le plus chaud | der heißeste Kontinent | el continente más caluroso | 最も暑い大陸 | o continente mais quente |
| COLD_CLIMATE | at low temperature | a temperatura bassa | à température basse | bei niedriger Temperatur | a temperatura baja | 温度が低い | a temperatura baixa |
| HOT_CLIMATE | at high temperature | a temperatura alta | à température haute | bei hoher Temperatur | a temperatura alta | 温度が高い | a temperatura alta |

The same as the ticket's wrapper probe, row for row. The two adjective glosses are COLD's and HOT's,
letter for letter.

### Rejected: the seeded COLD and HOT

Re-probed 2026-09-21 with B48 seeded:

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ANTARCTICA | the coldest continent | il continente più freddo | le continent le plus froid | der kälteste Kontinent | el continente más frío | 最も**冷たい**大陸 | o continente mais frio |
| AFRICA | the hottest continent | il continente più caldo | le continent le plus chaud | der heißeste Kontinent | el continente más **caliente** | 最も**熱い**大陸 | o continente mais quente |

### Rejected: ICE, "a continent covered with ice"

C05 named ICE as the other way in. It needs two seeds (ICE, COVER) where this ticket needs one per
continent, and it renders wrong. Re-probed 2026-09-21 with both words through a lookup wrapper
(neither is seeded); the passive plan renders the same row as the active:

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| a continent that ice covers | un continente che ghiaccio copre | un continent que glace couvre | ein Kontinent, den Eis bedeckt | un continente que hielo cubre | 氷が覆う大陸 | um continente que gelo cobre |

- **The article.** A bare mass subject gets no article in Romance, where a generic subject takes the
  definite one (*il ghiaccio*, *la glace*, *el hielo*, *o gelo*). This is the generic-article gap
  C05 records for POLARITY.
- **The passive.** "Covered with ice" would need the passive relativized on its patient. An
  object-gap relative has no direct object left to promote, so `voice: 'passive'` falls back to
  active and renders the row above.

## Coverage

Both in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): ANTARCTICA in
English and Japanese (最も寒い大陸), and AFRICA in Spanish (el continente más caluroso).

## Done (2026-09-21)

**ANTARCTICA → "the coldest continent", AFRICA → "the hottest continent"**, the plans above, inline
on their seed blocks in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (AFRICA at
[line 1489](../../../packages/backend/src/concepts/nouns.ts#L1489), ANTARCTICA at
[line 1613](../../../packages/backend/src/concepts/nouns.ts#L1613)). The backend renders both, and
every other definition, in all seven languages at boot.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ANTARCTICA | the coldest continent | il continente più freddo | le continent le plus froid | der kälteste Kontinent | el continente más frío | 最も寒い大陸 | o continente mais frio |
| AFRICA | the hottest continent | il continente più caldo | le continent le plus chaud | der heißeste Kontinent | el continente más caluroso | 最も暑い大陸 | o continente mais quente |

The two words, predicated of their continents (es and pt with *ser*), and COLD for contrast:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ANTARCTICA is COLD_CLIMATE | Antarctica is cold | l'Antartide è fredda | l'Antarctique est froid | die Antarktis ist kalt | la Antártida **es** fría | 南極大陸は寒いです | a Antártida **é** fria |
| AFRICA is HOT_CLIMATE | Africa is hot | l'Africa è calda | l'Afrique est chaude | Afrika ist heiß | África **es** calurosa | アフリカは暑いです | a África **é** quente |
| the water is COLD | the water is cold | l'acqua è fredda | l'eau est froide | das Wasser ist kalt | el agua **está** fría | 水は冷たいです | a água **está** fria |

What landed differently from the plan:

1. **Nothing in the plans.** Both words took the proposed forms and flags, and both definitions
   rendered exactly as the ticket's wrapper probe had them.
2. **Checked, and not A178.** ASIA and OCEANIA ship in the marked Portuguese order
   ([A178](../../bugs/A-must-fix/A178-portuguese-suppletive-superlative-position.md): *o continente
   maior*), because their superlatives are suppletive. *Mais frio* and *mais quente* are the regular
   superlative, which Portuguese puts after the noun, so these two read right as they are.

- Seeds: [adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts) (COLD_CLIMATE, HOT_CLIMATE),
  [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) (ANTARCTICA, AFRICA).
- Tests: both adjectives in `EVERY_ADJECTIVE`
  ([adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts)); the two glosses, the
  *ser* predication, the German comparative and the agreement in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts) (*the continents
  of extreme climate*); ANTARCTICA in en + ja and AFRICA in es in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts).
