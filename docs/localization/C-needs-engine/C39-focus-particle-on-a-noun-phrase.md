# C39. EVEN, and "only the cat" — a focus particle on a noun phrase

**Kind:** blocked on a construct. *Only*, *even* and *also* mostly focus a noun ("only the cat",
"even the cat", "the cat too"), and Japanese says all three as particles on it (猫**だけ**,
猫**さえ**, 猫**も**). The engine attaches them to the verb. For ONLY and ALSO a verb adverb exists
in every language and [B67](../done/B67-place-and-focus-adverbs.md) seeds them that way; for
EVEN, Japanese has none, so EVEN cannot be seeded at all.

_(from the P09 core-vocabulary sweep of 2026-09-22. [P09](../../features/P-planning/P09-core-vocabulary/README.md)
D4 sends the noun-scope use of the focus adverbs to §3, but **§3 has no row for it**: this ticket is
that row.)_

## The concepts

| concept | role | why it waits |
|---|---|---|
| EVEN | adverb / particle | cannot be seeded: Japanese さえ / すら / でも are particles on the noun, and the verb form is 走り**さえ**する. Proposed for the other six: even, perfino, même, sogar, incluso, até (all `frequency`, before the verb in English) |
| ONLY, ALSO (noun scope) | — | their verb-adverb concepts **were seeded on 2026-09-22** by B67, and ALSO is glossed there ("in the same way"); ONLY's gloss is [C32](C32-indefinite-pronouns.md)'s. The noun-scope use is not a concept of its own, but it is what this construct adds to them |

## Blocked on

Probed 2026-09-22, engine source at HEAD, EVEN seeded in memory as a `frequency` adverb:

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat even eats the food | the cat even eats the food. | il gatto mangia perfino il cibo. | le chat mange même la nourriture. | der Kater frisst sogar das Essen. | el gato come incluso la comida. | 猫は食べ物をさえ食べます。 | o gato come até a comida. |

Six languages read acceptably as a verb adverb. Japanese does not: さえ replaces the case particle
(食べ物**さえ**食べる), it does not follow を, and there is no adverb in its place.

## What would move it

A focus value on `NounPhrase` — `only | even | also` — rendered:

- **before** the noun phrase in en/it/de/es/pt (*only the cat*, *solo il gatto*, *nur die Katze*,
  *solo el gato*, *só o gato*), and *also* **after** it in English (*the cat too*);
- in French as *seulement* before the noun or the discontinuous ***ne** … **que*** around the verb
  (*le chat **ne** mange **que** la nourriture*);
- in Japanese as a particle that **replaces** が / を (猫も, 食べ物さえ) and **follows** に / で
  (家にも);
- with ALSO's and ONLY's B67 adverbs as the verb-scope reading beside it.

Then EVEN is seeded, and its gloss — "also, though one does not expect it" — waits on
[C30](C30-content-clause-with-expletive-subject.md)'s clause; SUDDENLY's "in an unexpected way"
already collides with the construct-free lead in all seven (B67).
