# C39. EVEN, and "only the cat" — a focus particle on a noun phrase

**Kind:** was blocked on a construct. *Only*, *even* and *also* mostly focus a noun ("only the cat",
"even the cat", "the cat too"), and Japanese says all three as particles on it (猫**だけ**,
猫**さえ**, 猫**も**). The engine attached them to the verb.

_(from the P09 core-vocabulary sweep of 2026-09-22. [P09](../../features/P-planning/P09-core-vocabulary/README.md)
D4 sends the noun-scope use of the focus adverbs to §3, but **§3 has no row for it**: this ticket was
that row. **Done** on 2026-09-22: the focus value shipped; see [Done](#done).)_

## The concepts

| concept | role | verdict |
|---|---|---|
| EVEN | — | **not a concept.** It is the `even` **focus value**, as the determiners are values: no language offers one word a picker could hold, and Japanese offers none at all |
| ONLY, ALSO (noun scope) | — | their verb-adverb concepts were seeded on 2026-09-22 by [B67](B67-place-and-focus-adverbs.md); the noun-scope use is this construct, beside them |

## Was blocked on: a focus particle on the phrase — resolved

Probed 2026-09-22, engine source at HEAD, EVEN seeded in memory as a `frequency` adverb:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat even eats the food | the cat even eats the food. | il gatto mangia perfino il cibo. | le chat mange même la nourriture. | der Kater frisst sogar das Essen. | el gato come incluso la comida. | **猫は食べ物をさえ食べます。** | o gato come até a comida. |

Six languages read acceptably as a verb adverb. Japanese did not: さえ replaces the case particle
(食べ物**さえ**食べる), it does not follow を, and there is no adverb in its place.

## Done

**2026-09-22.** `NounPhrase.focus`, a value — `only | even | also` — beside `definiteness`. Six
languages write a word beside the phrase, which each spells and places itself (English and French
put *too* / *aussi* after it); Japanese writes a **particle** that replaces が / を / は and follows
every other, which is exactly what the `no` determiner's も circumfix already did, so it is one site
([`jaParticleSegs.ts`](../../../packages/engine/src/languages/ja/jaParticleSegs.ts)).

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **only** the cat eats | only the cat eats. | solo il gatto mangia. | seulement le chat mange. | nur der Kater frisst. | solo el gato come. | **猫だけ食べます。** | só o gato come. |
| **even** the cat eats | even the cat eats. | perfino il gatto mangia. | même le chat mange. | sogar der Kater frisst. | incluso el gato come. | **猫さえ食べます。** | até o gato come. |
| **also** the cat eats | **the cat too eats.** | anche il gatto mangia. | **le chat aussi mange.** | auch der Kater frisst. | también el gato come. | **猫も食べます。** | também o gato come. |
| eats **only** the food | the cat eats only the food. | il gatto mangia solo il cibo. | le chat mange seulement la nourriture. | der Kater frisst nur das Essen. | el gato come solo la comida. | **猫は食べ物だけ食べます。** | o gato come só a comida. |
| eats **even** the food | the cat eats even the food. | il gatto mangia perfino il cibo. | le chat mange même la nourriture. | der Kater frisst sogar das Essen. | el gato come incluso la comida. | **猫は食べ物さえ食べます。** | o gato come até a comida. |
| eats the food **too** | the cat eats the food too. | il gatto mangia anche il cibo. | le chat mange la nourriture aussi. | der Kater frisst auch das Essen. | el gato come también la comida. | **猫は食べ物も食べます。** | o gato come também a comida. |
| lives in the house **too** | | | | | | **猫は家にも住みます。** | |

What landed differently from the plan:

1. **EVEN is not seeded.** The file expected it to be, once the construct landed. It is not a concept:
   the three are determiner-like values, and [C31](C31-numerals.md) records the same verdict for the
   other E7 values. That also dissolves EVEN's own gloss, which the file sent to
   [C30](C30-content-clause-with-expletive-subject.md) — a value has no tooltip.
2. **French takes *seulement*, not *ne … que*.** The file offered either. *Ne … que* brackets the
   **verb**, not the phrase, so it belongs to a different construct than this one.
3. **A coordination takes none.** "Only the cat and the dog" focuses the pair, which the plan cannot
   say and no engine could place, so a focused conjunct is ignored rather than spelled somewhere no
   language writes it.
4. **A complement's focus is Japanese only, so far.** 家にも works, because Japanese writes the
   particle wherever it writes a case particle. The six European languages put the word in **front of
   the adposition** ("nur im Haus", "only in the house"), which their complement renderers build
   together with the phrase — so the focus reaches the **subject and the direct object** there, and a
   complement's is what is left of this ticket.
5. **No `UI_STRINGS` labels yet.** The determiner menu's labels stand on grammar-name concepts
   (PROXIMAL, MULTAL …); the three focus values would need three more, and a menu to show them. That
   is the builder work this construct now makes possible.

Pinned in [`focus-particle.test.ts`](../../../packages/engine/test/focus-particle.test.ts), including
what a complement does and does not do.
