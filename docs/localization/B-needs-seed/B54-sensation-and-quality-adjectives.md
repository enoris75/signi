# B54. The relational adjectives — seed the classes they belong to, once C24 can say "of"

_(from the unsorted sweep of 2026-09-22. Nineteen adjectives that are scalar or relational and
would gloss with `dimGloss` or `glossOf`, blocked because the dimension noun they need is not
seeded. [A28](../done/A28-scalar-adjectives.md) took the ones whose dimension already exists; these
are the rest of the qualitative ones that [B07](../done/B07-scalar-adjective-definitions.md)
deferred without filing a ticket.)_

**Eight of the nineteen shipped on 2026-09-22** — see [Done](#done-the-eight-scalar-adjectives-2026-09-22)
at the foot of this file. What is left is the **eleven relational ones**, and they are one problem,
not eleven: an adjective that says what a thing is **of**, **in** or **without**, which the engine
cannot compose. Six of the twelve proposed words are still unseeded, and they wait with it.

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| COLOUR | noun | what a thing looks like as light — red, brown, blue | colour | colore | couleur | Farbe | color | 色 | cor |
| SHAPE | noun | the form a thing's outline takes | shape | forma | forme | Form | forma | 形 | forma |
| CIRCLE | noun | a round figure, every point of it equally far from its middle | circle | cerchio | cercle | Kreis | círculo | 円 | círculo |
| NATURE | noun | the world as it is without people | nature | natura | nature | Natur | naturaleza | 自然 | natureza |
| SEX | noun | the class an animal belongs to by how it reproduces | sex | sesso | sexe | Geschlecht | sexo | 性 | sexo |
| TESTICLE | noun | the organ that produces sperm | testicle | testicolo | testicule | Hoden | testículo | 精巣 | testículo |

**Six nouns are left.** The other six — JOY, SORROW, REST, ATTENTION, ABILITY and DUTY — were
seeded on 2026-09-22 and are struck from this table; their forms are in the Done section. NATURE and
SEX carry three concepts each, the rest one or two — and none of the six can be used until C24's
construct exists, which is why they were **not** seeded with the others.

## Unlocks

The eight scalar ones shipped on 2026-09-22 and are in the [Done](#done-the-eight-scalar-adjectives-2026-09-22)
table. These are what is left.

| concept | plan | gloss (en) |
|---|---|---|
| BROWN | `glossOf('COLOUR', …)` — see **Not solved** | — |
| ROUND | `glossOf('SHAPE', …)` on CIRCLE — see **Not solved** | — |
| WILD | `whereGloss`-style: living in NATURE — see **Not solved** | — |
| DOMESTIC | living with PERSON — see **Not solved** | — |
| MALE | `glossOf('SEX', …)` — see **Not solved** | — |
| FEMALE | `glossOf('SEX', …)` — see **Not solved** | — |
| CASTRATED | having no TESTICLE — see **Not solved** | — |
| HUNGRY | needs a FOOD dimension, not a noun — see **Not solved** | — |
| CANINE | belonging to DOG — see **Not solved** | — |

**INTERESTING and ABLE were here because [A28](../done/A28-scalar-adjectives.md) expected to lose
them, and it did.** A28 drafted them on CARE and STRENGTH with the reasons written down: *Sorgfalt*
is carefulness, not interest, and ability is not force. Both shipped here instead, on ATTENTION and
ABILITY.

**LAZY, CAREFUL, ADULT and WARM needed no new word** — CARE, AGE and AFFECTION are already seeded.
Two of the four shipped; ADULT and WARM did not, and the reasons are in the Done section.

## Not solved by this seed

The rows above with no gloss all want the **same missing construct**: an adjective that is
*relational* rather than scalar — being **of** a class (MALE, FEMALE, BROWN, ROUND), **in** a place
(WILD, DOMESTIC), **of** an animal (CANINE), or **without** a part (CASTRATED). `dimGloss` is the
only adjective shape the engine has, and it says "at/of <degree> <dimension>" and nothing else.
That construct is [C24](../C-needs-engine/C24-grammar-feature-adjectives.md)'s subject, and these
belong to whichever ticket builds it. They stay listed here so the seed author can see what the six
remaining words would and would not buy.

HUNGRY is its own case — hunger is a need for food, and need is a relation between a person and a
thing, which no fragment carries.

**Three more were dropped on 2026-09-22 and went to
[C24](../C-needs-engine/C24-grammar-feature-adjectives.md), not here**, because none of the three
needs a word — what each needs is a differentia the corpus cannot say:

- **ADULT** was drafted as `dimGloss('AGE', 'HIGH')` — "of high age". OLD already ships
  `dimGloss('AGE', 'GREAT')`, "of great age", and *high age* against *great age* is not a
  distinction a reader can use. An adult is one who has finished growing, which is not a point on
  the age scale.
- **WARM** was drafted as `dimGloss('AFFECTION', 'HIGH')` — and AFFECTION already ships
  `glossOf('FEELING', 'WARM')`, "a warm feeling". The two would define each other in a circle.
- **BEAUTIFUL** arrived from [A28](../done/A28-scalar-adjectives.md), which drafted it on QUALITY —
  GOOD's scale, already taken. Its own scale is beauty, and *of high beauty* is cognate with the
  word in all seven (it *bellezza*, de *Schönheit*, ja 美しさ), which is the test
  [B58](../done/B58-tense-and-number-values.md) applies to *a singular category*. BEAUTY is
  therefore **not** proposed as a seed word: it would buy a circular gloss.

## Coverage

One test in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): HAPPY in
English and German (*von hoher Freude*, the dative the `of` relation governs) and TIRED in Japanese
(休息が低い, where the dimension is the topic).

## Done: the eight scalar adjectives (2026-09-22)

**Six words seeded** (JOY, SORROW, REST, ATTENTION, ABILITY, DUTY — all `dimensionRelation:
'quality'`) and **eight glosses** authored in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| HAPPY | of high joy | di gioia alta | de joie haute | von hoher Freude | de alegría alta | 喜びが高い | de alegria alta |
| SAD | of high sorrow | di tristezza alta | de tristesse haute | von hoher Trauer | de tristeza alta | 悲しみが高い | de tristeza alta |
| TIRED | of low rest | di riposo basso | de repos bas | von niedriger Ruhe | de descanso bajo | 休息が低い | de descanso baixo |
| INTERESTING | of high attention | di attenzione alta | d'attention haute | von hoher Aufmerksamkeit | de atención alta | 注目が高い | de atenção alta |
| ABLE | of high ability | di capacità alta | de capacité haute | von hoher Fähigkeit | de capacidad alta | 能力が高い | de capacidade alta |
| OBLIGED | of high duty | di dovere alto | de devoir haut | von hoher Pflicht | de deber alto | 義務が高い | de dever alto |
| LAZY | of low care | di cura bassa | de soin bas | von niedriger Sorgfalt | de cuidado bajo | 注意が低い | de cuidado baixo |
| CAREFUL | of high care | di cura alta | de soin haut | von hoher Sorgfalt | de cuidado alto | 注意が高い | de cuidado alto |

What landed differently from the plan:

1. **ATTENTION's Japanese is 注目, not the 注意 the table proposed.** CARE is already 注意, so
   INTERESTING and CAREFUL — the two glosses this ticket seeded ATTENTION to keep apart — would have
   rendered the same string in Japanese alone: 注意が高い. This is the COLD/冷たい case
   [B48](../done/B48-climate-cold-hot.md) met, found the same way, by rendering every gloss in every
   language and looking for two alike.
2. **ABLE's gloss is cognate with its own word in all seven** (en *ability*, it *capacità*, de
   *Fähigkeit*), which BEAUTIFUL was refused for. It ships because the corpus already ships the same
   shape: STRONG is `dimGloss('STRENGTH', 'GREAT')`, "of great strength". A cognate *dimension* is
   house style; a cognate *genus* (a singular category) is not.
3. **Six of the twelve words were not seeded.** COLOUR, SHAPE, CIRCLE, NATURE, SEX and TESTICLE buy
   only relational glosses, which C24 must build first — and the shape it builds will decide what
   those words have to be. Seeding them now would put six seven-language paradigms in the corpus
   against a construct that does not exist.
