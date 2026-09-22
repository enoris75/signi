# B54. The sensation and quality adjectives — eight on a scale, nine on the clause they stand for

_(from the unsorted sweep of 2026-09-22. Nineteen adjectives that are scalar or relational and
would gloss with `dimGloss` or `glossOf`, blocked because the dimension noun they need is not
seeded. [A28](A28-scalar-adjectives.md) took the ones whose dimension already exists; these
are the rest of the qualitative ones that [B07](B07-scalar-adjective-definitions.md)
deferred without filing a ticket.)_

**Retired on 2026-09-22, every concept with a verdict.** Eight shipped as scalar glosses the same
morning — see [Done: the eight scalar adjectives](#done-the-eight-scalar-adjectives-2026-09-22).
The **nine relational ones** waited on [C24](../done/C24-grammar-feature-adjectives.md)'s
construct, and when K1 built it — the headless relative, `NounPhrase.relativeGloss` — seven of them
shipped on it and two are literal by design: see
[Done: the relational nine](#done-the-relational-nine-2026-09-22). The six others that passed
through this ticket — INTERESTING, ABLE, LAZY, CAREFUL, and ADULT and WARM, which went to C24 — are
accounted for under **Unlocks**.

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt | seeded |
|---|---|---|---|---|---|---|---|---|---|---|
| COLOUR | noun | what a thing looks like as light — red, brown, blue | colour | colore | couleur | Farbe | color | 色 | cor | no — BROWN is literal by design |
| SHAPE | noun | the form a thing's outline takes | shape | forma | forme | Form | forma | 形 | forma | **yes**, for ROUND |
| CIRCLE | noun | a round figure, every point of it equally far from its middle | circle | cerchio | cercle | Kreis | círculo | 円 | círculo | **yes**, for ROUND |
| NATURE | noun | the world as it is without people | nature | natura | nature | Natur | naturaleza | 自然 | natureza | no — "in the nature" in English |
| SEX | noun | the class an animal belongs to by how it reproduces | sex | sesso | sexe | Geschlecht | sexo | 性 | sexo | no — the sexes are glossed by organ |
| TESTICLE | noun | the organ that produces sperm | testicle | testicolo | testicule | Hoden | testículo | 精巣 | testículo | **yes**, for MALE and CASTRATED |

**Three of the six were seeded**, each for a gloss that shipped; the other three bought nothing that
could ship, and the reasons are in the Done section. The sweep's other six — JOY, SORROW, REST,
ATTENTION, ABILITY and DUTY — were seeded for the scalar eight; their forms are in that section.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| BROWN | literal by design — see the Done section | — |
| ROUND | possessor gap: SHAPE BE a CIRCLE | whose shape is a circle |
| WILD | `stateGloss(BEING, TAME, passive, negative)` | that has not been tamed |
| DOMESTIC | `subjectGapGloss(BEING, LIVE, comitative PERSON)` | that lives with people |
| MALE | `subjectGapGloss(BEING, HAVE, TESTICLE plural)` | that has testicles |
| FEMALE | `subjectGapGloss(BEING, HAVE, OVARY plural)` | that has ovaries |
| CASTRATED | source gap: REMOVE the TESTICLEs, resultative passive | from which the testicles have been removed |
| HUNGRY | `subjectGapGloss(BEING, EAT, modal WILL)` | that wants to eat |
| CANINE | literal by design — see the Done section | — |

The eight scalar ones are in their own Done table. **INTERESTING and ABLE** were here because
[A28](A28-scalar-adjectives.md) expected to lose them, and it did: A28 drafted them on CARE and
STRENGTH, and both shipped here instead, on ATTENTION and ABILITY. **LAZY and CAREFUL** needed no
new word (CARE was seeded) and shipped with the eight. **ADULT and WARM** went to C24 on authoring
the eight — ADULT's "of high age" restated OLD's "of great age", and WARM's "of high affection"
would have defined AFFECTION ("a warm feeling") in a circle — and both shipped there with the
relational nine: ADULT "that no longer grows", WARM "of great kindness"
([C24's relational part](../done/C24-grammar-feature-adjectives.md)).

## Not solved by this seed

Nothing is left open. What this section held — that the nine are *relational*, being **of** a class,
**in** a place, **without** a part, and that `dimGloss` says only a scale — was the construct C24
named, and it now exists. BROWN and CANINE are the two it does not reach, and both for a reason no
construct would change.

## Coverage

Two tests in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): HAPPY in
English and German (*von hoher Freude*, the dative the `of` relation governs) and TIRED in Japanese
(休息が低い, where the dimension is the topic); and, for the relational nine, WILD in English and
German (*das nicht gezähmt worden ist*) with ROUND in German (*dessen Form ein Kreis ist*), in the
test C24's relational part shares.

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
   [B48](B48-climate-cold-hot.md) met, found the same way, by rendering every gloss in every
   language and looking for two alike.
2. **ABLE's gloss is cognate with its own word in all seven** (en *ability*, it *capacità*, de
   *Fähigkeit*), which BEAUTIFUL was refused for. It ships because the corpus already ships the same
   shape: STRONG is `dimGloss('STRENGTH', 'GREAT')`, "of great strength". A cognate *dimension* is
   house style; a cognate *genus* (a singular category) is not.
3. **Six of the twelve words were not seeded** that morning. COLOUR, SHAPE, CIRCLE, NATURE, SEX and
   TESTICLE bought only relational glosses, which C24 had to build first — and the shape it built
   decided what those words had to be (see the next section: three of them were seeded, three were
   not).

## Done: the relational nine (2026-09-22)

Authored with [C24's relational part](../done/C24-grammar-feature-adjectives.md), which carries
every family's full probe table, the ones that did not ship included. **Seven shipped and two are
literal by design**; the glosses are in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts). Probed 2026-09-22 against the
engine source at HEAD.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ROUND | whose shape is a circle | la cui forma è un cerchio | dont la forme est un cercle | dessen Form ein Kreis ist | cuya forma es un círculo | 形が円である | cuja forma é um círculo |
| WILD | that has not been tamed | che non è stato domato | qui n'a pas été apprivoisé | das nicht gezähmt worden ist | que no ha sido domado | 飼い慣らされていない | que não foi domado |
| DOMESTIC | that lives with people | che abita con persone | qui habite avec des personnes | das mit Personen wohnt | que vive con personas | 人と住む | que mora com pessoas |
| MALE | that has testicles | che ha testicoli | qui a des testicules | das Hoden hat | que tiene testículos | 精巣がある | que tem testículos |
| FEMALE | that has ovaries | che ha ovaie | qui a des ovaires | das Eierstöcke hat | que tiene ovarios | 卵巣がある | que tem ovários |
| CASTRATED | from which the testicles have been removed | dal quale i testicoli sono stati rimossi | duquel les testicules ont été retirés | aus dem die Hoden entfernt worden sind | del que los testículos han sido quitados | 精巣が取り除かれた | do qual os testículos foram removidos |
| HUNGRY | that wants to eat | che vuole mangiare | qui veut manger | das essen will | que quiere comer | 食べたい | que quer comer |

And the two that stay on the literal, with the leads that failed:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BROWN — possessor gap, COLOUR\* BE the GROUND's COLOUR\* | whose colour is the ground's colour | il cui colore è il colore del suolo | dont la couleur est la couleur du sol | dessen Farbe die Farbe des Bodens ist | cuyo color es el color del suelo | 色が地面の色である | cuja cor é a cor do chão |
| BROWN — HAVE the COLOUR\* | that has the colour | che ha il colore | qui a la couleur | der die Farbe hat | que tiene el color | 色がある | que tem a cor |
| CANINE — BE a DOG | that is a dog | che è un cane | qui est un chien | das ein Hund ist | que es un perro | 犬である | que é um cão |
| DOG, for comparison — its shipped gloss | a domestic canine mammal | un mammifero domestico e canino | un mammifère domestique et canin | ein zahmes hundeartiges Säugetier | un mamífero doméstico y canino | 家庭の犬の哺乳類 | um mamífero doméstico e canino |

(\* COLOUR probed through an injected seed, not seeded.)

- **BROWN is literal by design.** It is the corpus's only colour word, and a colour is defined by an
  exemplar or not at all. COLOUR alone says "that has the colour"; the ground is not reliably brown,
  and is a floor in two languages (*Boden*, *chão*); FOX, the corpus's brown thing, is glossed "a
  brown mammal".
- **CANINE is literal by design.** "Of or resembling dogs" is a relation to DOG, and DOG is "a
  domestic canine mammal", WOLF "a wild canine mammal": every gloss routes back to the word.

**Words seeded:** TESTICLE, SHAPE and CIRCLE from this ticket's six, and, for the seven that
shipped, OVARY (FEMALE) and TAME (WILD). **Not seeded:** COLOUR (BROWN is literal), NATURE and SEX.
The forms of all five seeded are in C24's relational part.

What landed differently from the plan:

1. **The creatures are said of a BEING, not glossed as a class.** The ticket planned *of the sex*,
   *of a colour*, *living in nature* — membership fragments on a class noun. The construct that
   exists is a clause, so each gloss says what the creature has or does, and the antecedent, BEING,
   is never spoken; German's *das* is its *Wesen*.
2. **MALE and FEMALE are glossed by organ, so SEX was not needed**, and OVARY was seeded beside
   TESTICLE: "of the male sex" is the word defined by itself.
3. **WILD did not use NATURE.** "That lives in nature" reads "in the nature" in English, where the
   other six need their article, and the free lead — DOMESTIC's gloss negated, "that does not live
   with people" — hits a French defect ("qui ne habite pas", no elision before an h muet verb). It
   ships on its description's other half, "not tamed", with TAME seeded as *domare* / *domar*, not
   the *addomesticare* / *domesticar* that would gloss it on DOMESTIC's own root.
4. **CASTRATED is a source gap in the passive.** "That has no testicles" would be FEMALE's too.
5. **HUNGRY needed no need.** "A need for food" is the modal WILL on EAT, which every language says
   plainly (ja 食べたい); DESIRE reads as a wish (*wünscht*, 望む).
