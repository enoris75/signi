# B55. ALREADY ships, and the five ordinals wait on an adjective gloss that is not a scale

_(from the unsorted sweep of 2026-09-22. Six concepts — five adjectives and an adverb — that all
say the same thing about one thing: where it stands in an order. The sweep thought one seeded noun
and two seeded verbs would cover them; authoring found that **the adverb needed no seed and the
five adjectives cannot be glossed by any noun phrase**, so the ticket ships one of six and seeds
nothing.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SEQUENCE | noun | things set one after another in a fixed order | sequence | sequenza | séquence | Reihenfolge | secuencia | 順序 | sequência |
| PRECEDE | verb | to come before in an order | precede | precedere | précéder | vorangehen | preceder | 先行する | preceder |
| FOLLOW | verb | to come after in an order | follow | seguire | suivre | folgen | seguir | 続く | seguir |

**None of the three was seeded.** SEQUENCE is named in no plan the file proposes — read the
**Unlocks** table: nothing references it. PRECEDE and FOLLOW were written out in full and then
dropped, because the only glosses that would have used them are the ones **Not solved** now holds.
The forms are recorded here for the ticket that builds C24's construct; the proposal for the two
verbs is *intransitive*, since German *vorangehen* and *folgen* both govern a dative that a direct
object slot cannot mark, and the `terminus` complement renders as "to" (*to indicate **to** this
concept*), not "before".

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| ALREADY | `mannerGloss('TIME', 'indefinite', 'PREVIOUS')` | at a previous time |
| FIRST | `whoGloss('CONCEPT', 'PRECEDE', 'CONCEPT')` — see **Not solved** | — |
| NEXT | `whoGloss('CONCEPT', 'FOLLOW')` with a `terminus` — see **Not solved** | — |
| PREVIOUS | `whoGloss('CONCEPT', 'PRECEDE')` with the same terminus — see **Not solved** | — |

ALREADY is why PREVIOUS is in this ticket and not left on the literal: it is the only one of the
four time adverbs [A29](A29-time-adverbs.md) could not ship, and it waits on PREVIOUS
having a form to carry, not on PREVIOUS having a gloss. **It needed no seed at all** —
`mannerGloss` on TIME with an adjective is exactly AGAIN's shape, which A29 probed in all seven.

## Not solved by this seed

**FIRST, NEXT and PREVIOUS are adjectives, and the plans proposed for them are noun phrases.**
"A concept that precedes" describes a concept, not a property, and the picker shows it under an
adjective. [B54](B54-sensation-and-quality-adjectives.md)'s own **Not solved** section states the
rule in plain words — *an adjective cannot be glossed by a noun phrase* — and `dimGloss` ("of
<degree> <dimension>") is the only adjective shape the engine has. Order is not a scale, so
`dimGloss` does not reach it either. All three go to
[C24](../done/C24-grammar-feature-adjectives.md), which is the ticket for an adjective
gloss that is not a scale.

**SECOND and THIRD are ordinals, and an ordinal is a number, not a phrase.** "The second" is
*the one that follows the first*, which needs FIRST to have shipped and then nests a relative clause
inside a terminus — a clause inside a complement inside a clause. Nothing in `GlossParts` nests that
deep, and the three languages that inflect ordinals (de *zweit-*, ja 二番目) would each need the
number word anyway. Both join the other three in C24.

The ticket's honest yield is **one of six** — but the one is ALREADY, which is what mattered,
because it closes the adverb set A29 opened, and it cost nothing.

## Coverage

One test in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): ALREADY in
English and German, beside A29's NOW, so the two adverbs that differ only in their determiner and
adjective are pinned together.

## Done

Shipped 2026-09-22. **One gloss, no word seeded**, in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts).

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ALREADY | at a previous time | a un tempo precedente | à un temps précédent | zu einer vorherigen Zeit | a un tiempo anterior | 前の時間で | a um tempo anterior |

What landed differently from the plan:

1. **The three seed words were never needed and were not added.** SEQUENCE appears in no plan;
   PRECEDE and FOLLOW appear only in plans that cannot ship. Their proposed forms are kept above for
   whoever builds C24's construct.
2. **Five of the six moved to C24 as one group**, on one reason rather than two: an adjective cannot
   be glossed by a noun phrase, and order is not a scale. The file had SECOND and THIRD there
   already and FIRST, NEXT and PREVIOUS join them.
