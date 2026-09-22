# C24. The relational adjectives — `dimGloss` is the only adjective shape, and these are not scalar

**Kind:** blocked on a construct. Sixty-seven adjectives that say what something *belongs to*,
*points at* or *is a kind of* — not where it sits on a scale. `dimGloss`, the engine's one adjective
gloss, only says a scale.

_(from the unsorted sweep of 2026-09-22, which found 92 adjectives with no definition. Two were
scalar with a seeded dimension and shipped as [A28](../done/A28-scalar-adjectives.md); eight more
shipped as [B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md) once their dimension was
seeded; twenty-two are participial and are [C23](C23-participial-state-adjectives.md). These were
the rest — and **seven arrived on 2026-09-22**, from A28 and from
[B55](../done/B55-sequence-and-position.md). See
[Seven that arrived](#seven-that-arrived-2026-09-22).)_

## The concepts

**The grammar features (35).** SINGULAR, PLURAL, NEUTER, DEFINITE, INDEFINITE, ZERO, PROXIMAL,
DISTAL, PARTITIVE, NEGATIVE, MULTAL, PAUCAL, UNIVERSAL, IMPERSONAL, MAIN, CONDITIONAL, COORDINATED,
COPULATIVE, DISJUNCTIVE, ADVERSATIVE, EXPLICATIVE, CONCLUSIVE, ACTIVE_VOICE, PASSIVE, PROGRESSIVE,
PROSPECTIVE, RESULTATIVE, POSITIVE, TEMPORAL, SPATIAL, SEMANTIC, DIRECT, INDIRECT, NEUTRAL,
UNCONNECTED.

**The ordinary relational ones (20).** OTHER, GREAT, LOW, NEAR, FAR, BROWN, ROUND, SHARP, WHOLE,
WILD, DOMESTIC, MALE, FEMALE, CASTRATED, CANINE, HUNGRY, NEW, BEAUTIFUL, ADULT, WARM.

**The order words (5).** FIRST, SECOND, THIRD, NEXT, PREVIOUS.

**The seven the sweep's B tickets seeded (7).** SWEET, SOLID, PRESENT, PAST, FUTURE, SOLE,
MANIFOLD. Each was seeded on 2026-09-22 to be a *differentia* — ICE_CREAM is cold and sweet,
PAST_TENSE is the past one — and each would need the same relational gloss the rest of this file
waits on: sweet is *of sugar*, solid is *of a state*, past is *of a time before now*. Two of them,
SOLE and MANIFOLD, are why [B58](../done/B58-tense-and-number-values.md) could gloss the number
categories without defining a word with itself; glossing SOLE and MANIFOLD themselves would need the
number relation, which is this same construct.

SHARP and WHOLE are the two that are relational by way of a **part**: a sharp thing has an edge that
cuts, a whole thing is missing none of its parts. Both wait on the part-whole complement
[C26](C26-root-nouns-on-the-literal.md) names, not only on the clause below — and WHOLE needs it
negated, which is shape 3.

**The ordinals (2).** SECOND, THIRD, split here from
[B55](../done/B55-sequence-and-position.md), which glosses FIRST, NEXT and PREVIOUS and
cannot reach these two.

**The two degree words (2).** GREAT and LOW are listed above and deserve their own line: they are
the words `dimGloss` is *built out of* — BIG is `dimGloss('SIZE', 'GREAT')` — so glossing them with
`dimGloss` is circular by construction, not merely awkward.

## Blocked on

**An adjective gloss that is not a scale.** Concretely, three shapes, none of which exists:

1. **Membership** — *of the masculine sex*, *of the colour brown*, *of a sole number*. A bare
   prepositional fragment on a noun with **no degree adjective**. `dimGloss` always writes a degree,
   and there is no degree here. Probed 2026-09-22, engine source at HEAD, forcing a degree in:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | DEFINITE as `dimGloss('GENDER', 'HIGH')` | of high gender | di genere alto | de genere haut | von hohem Geschlecht | de género alto | 性が高い | de género alto |
   | OTHER as `dimGloss('CATEGORY', 'HIGH')` | of high category | di categoria alta | de catégorie haute | von hoher Kategorie | de categoría alta | 範疇が高い | de categoria alta |

   Both render in all seven and both are nonsense. A gender is not high.

2. **A headless relative clause** — *that points at what is near the speaker* (PROXIMAL), *that
   lives in nature* (WILD), *that joins clauses* (COPULATIVE). This is **the same construct
   [C23](C23-participial-state-adjectives.md) is blocked on**, and it would take most of the
   thirty-five grammar features and most of the fourteen relational ones. The two tickets should be
   built together.

3. **A negated membership** — *having no testicles* (CASTRATED), *joined to nothing* (UNCONNECTED).
   `GlossParts.negative` negates a clause; if the clause of shape 2 exists, this comes with it.

## What renders today, and why it is not shipped

An adjective *can* be handed a noun-phrase plan, and it renders:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PASSIVE as `glossOf('VOICE')` | a voice | una diatesi | une voix | eine Diathese | una voz | 態 | uma voz |

It renders in all seven, it is grammatical, and it defines the adjective *passive* as the noun
*voice*. Per the project decision recorded in [C05](../done/C05-non-distinguishing-genera.md), a
gloss that is the wrong category is worse than no gloss, so none of the fifty-three ships on this.

## Two that are literal by design whatever gets built

**GREAT and LOW.** Even with shape 1, the gloss would be a degree defined by a degree. They are
primitives of the definition language, like GENERIC_PERSON, and the right outcome is no plan. This
is a deliberate C in the [C15](../done/C15-ui-literal-by-design.md) sense, recorded here so a later
sweep does not re-probe them.

## Why the count is worth stating

Fifty-three concepts, and forty-nine of them turn on the one construct C23 recommends. Adding
[B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md)'s ten deferrals and C23's
twenty-two, a headless relative clause is the difference between about eighty concepts glossed and
not — **a quarter of everything still on the literal.**

## Seven that arrived (2026-09-22)

Two tickets sent adjectives here on authoring, for two reasons this file did not have.

**ADULT and WARM, from [B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md): the same,
from the other side.** ADULT was drafted as `dimGloss('AGE', 'HIGH')`, which restates OLD's shipped
"of great age" — an adult is one who has finished growing, not a point on the age scale. WARM was
drafted as `dimGloss('AFFECTION', 'HIGH')`, and AFFECTION already ships `glossOf('FEELING', 'WARM')`:
the two would define each other in a circle. Neither needs a word.

**NEW and BEAUTIFUL, from [A28](../done/A28-scalar-adjectives.md): the scale is taken or circular.**
A28 drafted NEW as `dimGloss('AGE', 'LOW')` and BEAUTIFUL as `dimGloss('QUALITY', 'HIGH')`. Both
plans render in all seven — and both are already shipped, by YOUNG and by GOOD respectively,
character for character. NEW differs from YOUNG by *animacy*, which no adjective gloss carries;
BEAUTIFUL's own scale is beauty, and *of high beauty* is cognate with the word in every one of the
seven (it *bellezza*, fr *beauté*, de *Schönheit*, ja 美しさ), which is the test
[B58](../done/B58-tense-and-number-values.md) applies when it refuses *a singular category*. Seeding
BEAUTY would buy a circular gloss, so it is not proposed.

**FIRST, SECOND, THIRD, NEXT and PREVIOUS, from [B55](../done/B55-sequence-and-position.md): order
is not a scale, and a noun phrase is not an adjective gloss.** B55 proposed `whoGloss('CONCEPT',
'PRECEDE')` — "a concept that precedes" — which describes a *concept*, where the picker wants a
property of one. `dimGloss` is the only adjective shape the engine has and it says a scale;
position in a sequence is an ordinal, not a degree. B55's proposed forms for SEQUENCE, PRECEDE and
FOLLOW are kept in that file for whoever builds the construct here.
