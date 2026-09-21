# B48. ANTARCTICA and AFRICA — seed the climate senses of COLD and HOT: the coldest / the hottest continent

_(split out of [C05](../done/C05-non-distinguishing-genera.md) on 2026-09-21. "The coldest continent"
already rendered in six languages. Japanese said 最も**冷たい**大陸, because the seeded COLD is 冷たい,
cold to the touch. The same probe found AFRICA a gloss: C05 had it waiting on a compass relation,
and it is the hottest continent.)_

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| COLD_CLIMATE | adjective | cold, of weather or a climate | cold | freddo | froid | kalt | frío | 寒い | frio |
| HOT_CLIMATE | adjective | hot, of weather or a climate | hot | caldo | chaud | heiß | caluroso | 暑い | quente |

- **Why a second sense.** Japanese splits temperature to the touch (冷たい, 熱い: the seeded COLD and
  HOT, right for "cold water") from the ambient kind the whole body feels (寒い, 暑い). Spanish splits
  HOT the same way (*caliente* / *caluroso*) but not COLD. The other five use one word for both.
  WARM is the precedent: one sense seeded, and a `synonym` to tell it apart in the picker. Suggest
  `synonym: 'climate'` for both.
- **Not `transient`.** A climate is what a place is, so es and pt predicate it with *ser* (*la
  Antártida es fría*). COLD and HOT take *estar* ([A47](../../bugs/fixed/A47-spanish-portuguese-ser-vs-estar.md)).
- **German** *kalt* needs `umlaut: 'true'`, as COLD has it (*der kälteste*).
- **Their own definitions** can be their siblings': `dimGloss('TEMPERATURE', 'LOW')` and
  `dimGloss('TEMPERATURE', 'HIGH')`. The senses differ in register, not in meaning.

## Unlocks

The superlative plan [A17](../done/A17-continent-superlatives.md) gives ASIA and OCEANIA:

| concept | plan | gloss (en) |
|---|---|---|
| ANTARCTICA | `{ subject: { concept: 'CONTINENT', definiteness: 'definite', adjectives: ['COLD_CLIMATE'], adjectiveDegrees: ['most'] } }` | the coldest continent |
| AFRICA | the same with `HOT_CLIMATE` | the hottest continent |

### Probe renders (2026-09-21, engine source at HEAD, both adjectives through a lookup wrapper, nothing seeded)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ANTARCTICA | the coldest continent | il continente più freddo | le continent le plus froid | der kälteste Kontinent | el continente más frío | 最も寒い大陸 | o continente mais frio |
| AFRICA | the hottest continent | il continente più caldo | le continent le plus chaud | der heißeste Kontinent | el continente más caluroso | 最も暑い大陸 | o continente mais quente |

### Rejected: the seeded COLD and HOT

| concept | es | ja |
|---|---|---|
| ANTARCTICA | el continente más frío | 最も**冷たい**大陸 |
| AFRICA | el continente más **caliente** | 最も**熱い**大陸 |

### Rejected: ICE, "a continent covered with ice"

C05 named ICE as the other way in. It needs two seeds (ICE, COVER) where this ticket needs one per
continent, and it renders wrong. Probed with both words through the wrapper:

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

Add both to [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): ANTARCTICA in
English and Japanese (最も寒い大陸), and AFRICA in Spanish (el continente más caluroso).
