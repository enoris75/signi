# C24. The relational adjectives — `dimGloss` is the only adjective shape, and these are not scalar

**Kind:** blocked on a construct. Fifty-three adjectives that say what something *belongs to*,
*points at* or *is a kind of* — not where it sits on a scale. `dimGloss`, the engine's one adjective
gloss, only says a scale.

_(from the unsorted sweep of 2026-09-22, which found 92 adjectives with no definition. Six were
scalar with a seeded dimension and became [A28](../A-ready/A28-scalar-adjectives.md); eight more
become [B54](../B-needs-seed/B54-sensation-and-quality-adjectives.md) once their dimension is
seeded; twenty-two are participial and are [C23](C23-participial-state-adjectives.md). These
fifty-three are the rest.)_

## The concepts

**The grammar features (35).** SINGULAR, PLURAL, NEUTER, DEFINITE, INDEFINITE, ZERO, PROXIMAL,
DISTAL, PARTITIVE, NEGATIVE, MULTAL, PAUCAL, UNIVERSAL, IMPERSONAL, MAIN, CONDITIONAL, COORDINATED,
COPULATIVE, DISJUNCTIVE, ADVERSATIVE, EXPLICATIVE, CONCLUSIVE, ACTIVE_VOICE, PASSIVE, PROGRESSIVE,
PROSPECTIVE, RESULTATIVE, POSITIVE, TEMPORAL, SPATIAL, SEMANTIC, DIRECT, INDIRECT, NEUTRAL,
UNCONNECTED.

**The ordinary relational ones (16).** OTHER, GREAT, LOW, NEAR, FAR, BROWN, ROUND, SHARP, WHOLE,
WILD, DOMESTIC, MALE, FEMALE, CASTRATED, CANINE, HUNGRY.

SHARP and WHOLE are the two that are relational by way of a **part**: a sharp thing has an edge that
cuts, a whole thing is missing none of its parts. Both wait on the part-whole complement
[C26](C26-root-nouns-on-the-literal.md) names, not only on the clause below — and WHOLE needs it
negated, which is shape 3.

**The ordinals (2).** SECOND, THIRD, split here from
[B55](../B-needs-seed/B55-sequence-and-position.md), which glosses FIRST, NEXT and PREVIOUS and
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
