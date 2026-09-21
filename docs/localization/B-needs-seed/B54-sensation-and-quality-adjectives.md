# B54. Sensation and quality adjectives — seed the dimensions they scale on

_(from the unsorted sweep of 2026-09-22. Nineteen adjectives that are scalar or relational and
would gloss with `dimGloss` or `glossOf`, blocked because the dimension noun they need is not
seeded. [A28](../A-ready/A28-scalar-adjectives.md) took the six whose dimension already exists;
these are the rest of the qualitative ones that [B07](../done/B07-scalar-adjective-definitions.md)
deferred without filing a ticket.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| JOY | noun | the feeling of being glad | joy | gioia | joie | Freude | alegría | 喜び | alegria |
| SORROW | noun | the feeling of being sad | sorrow | tristezza | tristesse | Trauer | tristeza | 悲しみ | tristeza |
| REST | noun | the being still, to recover strength | rest | riposo | repos | Ruhe | descanso | 休息 | descanso |
| ATTENTION | noun | the turning of the mind toward something | attention | attenzione | attention | Aufmerksamkeit | atención | 注意 | atenção |
| ABILITY | noun | the power to do something | ability | capacità | capacité | Fähigkeit | capacidad | 能力 | capacidade |
| DUTY | noun | what one is bound to do | duty | dovere | devoir | Pflicht | deber | 義務 | dever |
| COLOUR | noun | what a thing looks like as light — red, brown, blue | colour | colore | couleur | Farbe | color | 色 | cor |
| SHAPE | noun | the form a thing's outline takes | shape | forma | forme | Form | forma | 形 | forma |
| CIRCLE | noun | a round figure, every point of it equally far from its middle | circle | cerchio | cercle | Kreis | círculo | 円 | círculo |
| NATURE | noun | the world as it is without people | nature | natura | nature | Natur | naturaleza | 自然 | natureza |
| SEX | noun | the class an animal belongs to by how it reproduces | sex | sesso | sexe | Geschlecht | sexo | 性 | sexo |
| TESTICLE | noun | the organ that produces sperm | testicle | testicolo | testicule | Hoden | testículo | 精巣 | testículo |

Twelve nouns. NATURE and SEX carry three concepts each; the rest carry one or two.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| HAPPY | `dimGloss('JOY', 'HIGH')` | of high joy |
| SAD | `dimGloss('SORROW', 'HIGH')` | of high sorrow |
| TIRED | `dimGloss('REST', 'LOW')` | of low rest |
| INTERESTING | `dimGloss('ATTENTION', 'HIGH')` | of high attention |
| ABLE | `dimGloss('ABILITY', 'HIGH')` | of high ability |
| OBLIGED | `dimGloss('DUTY', 'HIGH')` | of high duty |
| LAZY | `dimGloss('CARE', 'LOW')` — CARE is seeded | of low care |
| CAREFUL | `dimGloss('CARE', 'HIGH')` | of high care |
| BROWN | `glossOf('COLOUR', …)` — see **Not solved** | — |
| ROUND | `glossOf('SHAPE', …)` on CIRCLE — see **Not solved** | — |
| WILD | `whereGloss`-style: living in NATURE — see **Not solved** | — |
| DOMESTIC | living with PERSON — see **Not solved** | — |
| MALE | `glossOf('SEX', …)` — see **Not solved** | — |
| FEMALE | `glossOf('SEX', …)` — see **Not solved** | — |
| CASTRATED | having no TESTICLE — see **Not solved** | — |
| ADULT | `dimGloss('AGE', 'HIGH')` — AGE is seeded | of high age |
| WARM | `dimGloss('AFFECTION', 'HIGH')` — AFFECTION is seeded | of high affection |
| HUNGRY | needs a FOOD dimension, not a noun — see **Not solved** | — |
| CANINE | belonging to DOG — see **Not solved** | — |

**INTERESTING and ABLE are here because [A28](../A-ready/A28-scalar-adjectives.md) expects to lose
them.** A28 ships them on CARE and STRENGTH with the reasons written down: *Sorgfalt* is
carefulness, not interest, and ability is not force. If the A28 authoring pass agrees, they move
here and this seed is what they wait on. If A28's probe reads better than expected, drop the two
rows and ATTENTION and ABILITY from the seed.

**LAZY, CAREFUL, ADULT and WARM need no new word** — CARE, AGE and AFFECTION are already seeded.
They are in this ticket only because they are the same kind of judgement as the rest, and shipping
them apart from their neighbours would leave the picker inconsistent. An authoring pass may split
them into an A instead; nothing stops it.

## Not solved by this seed

The ten rows above with no gloss all want the **same missing construct**: an adjective that is
*relational* rather than scalar — being **of** a class (MALE, FEMALE, BROWN, ROUND), **in** a place
(WILD, DOMESTIC), **of** an animal (CANINE), or **without** a part (CASTRATED). `dimGloss` is the
only adjective shape the engine has, and it says "at/of <degree> <dimension>" and nothing else.
That construct is [C24](../C-needs-engine/C24-grammar-feature-adjectives.md)'s subject, and these
ten belong to whichever ticket builds it. They are listed here rather than moved so that the seed
author can see what the twelve words would and would not buy: **nine of nineteen**.

HUNGRY is the eleventh and is its own case — hunger is a need for food, and need is a relation
between a person and a thing, which no fragment carries.

## Coverage

Two rows in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once
authored: HAPPY in English and German (*von hoher Freude*, the dative the `of` relation governs)
and TIRED in English and Japanese (休息が低い, where the dimension is the topic).
