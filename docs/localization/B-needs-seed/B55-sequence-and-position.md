# B55. FIRST, SECOND, THIRD, NEXT, PREVIOUS, ALREADY — seed SEQUENCE and the two ordinal verbs

_(from the unsorted sweep of 2026-09-22. Six concepts — five adjectives and an adverb — that all
say the same thing about one thing: where it stands in an order. One seeded noun and two seeded
verbs cover the six.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SEQUENCE | noun | things set one after another in a fixed order | sequence | sequenza | séquence | Reihenfolge | secuencia | 順序 | sequência |
| PRECEDE | verb | to come before in an order | precede | precedere | précéder | vorangehen | preceder | 先行する | preceder |
| FOLLOW | verb | to come after in an order | follow | seguire | suivre | folgen | seguir | 続く | seguir |

SEQUENCE is the noun the other five stand on; PRECEDE and FOLLOW are the pair that orders them.
Both verbs want a `terminus` complement ("before **the second**"), which the engine already renders
— [C19](../done/C19-verbs-needing-voice-purpose-or-comitative.md) uses one.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| FIRST | `whoGloss('CONCEPT', 'PRECEDE', 'CONCEPT')` | a concept that precedes concepts |
| NEXT | `whoGloss('CONCEPT', 'FOLLOW')` with a `terminus` on the seeded PROXIMAL sense | a concept that follows this one |
| PREVIOUS | `whoGloss('CONCEPT', 'PRECEDE')` with the same terminus | a concept that precedes this one |
| ALREADY | `{ subject: { concept: 'TIME', definiteness: 'indefinite', adjectives: ['PREVIOUS'], mannerGloss: true } }` | at a previous time |

ALREADY is why PREVIOUS is in this ticket and not left on the literal: it is the only one of the
four time adverbs [A29](../A-ready/A29-time-adverbs.md) could not ship, and it waits on PREVIOUS
having a form to carry, not on PREVIOUS having a gloss. Seeding nothing new, ALREADY could ship the
day this ticket does — `mannerGloss` on TIME with an adjective is exactly AGAIN's shape, which A29
probed in all seven.

## Not solved by this seed

**SECOND and THIRD are ordinals, and an ordinal is a number, not a phrase.** "The second" is
*the one that follows the first*, which needs FIRST to have shipped and then nests a relative clause
inside a terminus — a clause inside a complement inside a clause. Nothing in `GlossParts` nests that
deep, and the three languages that inflect ordinals (de *zweit-*, ja 二番目) would each need the
number word anyway. Both go to [C24](../C-needs-engine/C24-grammar-feature-adjectives.md) unless the
authoring probe finds a flatter shape.

This is the ticket's honest yield: **four of six**, and one of those four (ALREADY) is the one that
mattered, because it closes the adverb set A29 opened.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
ALREADY in English and German, beside A29's NOW, so the two adverbs that differ only in their
determiner and adjective are pinned together.
