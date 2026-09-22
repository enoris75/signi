# C32. SOMETHING, and ONLY's "nothing more" — no indefinite pronoun

**Kind:** was blocked on a construct. P09's *something* is a pronoun that is not a person, and it
turns into *nothing* or *anything* under negation.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E7**. ONLY is seeded by [B67](B67-place-and-focus-adverbs.md), which probes every lead, and
this ticket owned its gloss. **Done** on 2026-09-22: the pronoun shipped and is glossed; ONLY is
literal by design; see [Done](#done).)_

## The concepts

| concept | role | verdict |
|---|---|---|
| SOMETHING | pronoun | **seeded and glossed** |
| ONLY | adverb (B67) | **literal by design**; see [Done](#done) |

## Was blocked on: an indefinite pronoun — resolved

The seeded pronouns were the three grammatical persons and GENERIC_PERSON ("one"), all rendered from
person and number; none stood for an unnamed thing, and none changed under negation. There was no
plan to probe for SOMETHING. ONLY's construct-free leads, probed 2026-09-22 at HEAD:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| ONLY: WAY SOLE, `mode` | in a sole way | in un modo unico | d'une manière unique | auf eine einzige Weise | de una manera única | 単一の方法で | de uma maneira única |
| ONLY: OBJECT_THING `no` OTHER, similative | like no other object | come nessun altro oggetto | comme aucun altro oggetto | wie kein anderer Gegenstand | como ningún otro objeto | どの別の物体もない | como nenhum outro objeto |

SOLE says "unique"; the negated similative says "unlike anything", and どの別の物体もない is "there is
no other object".

## Done

**2026-09-22.** SOMETHING is a pronoun with **two** forms, which is what makes it one the seeded
persons are not: the lexeme names the negative surface (`negative`), and under negation the phrase
swaps to it and is marked `definiteness: 'no'`
([`negativePolarity.ts`](../../../packages/engine/src/translator/functions/negativePolarity.ts)). That
flag is not a determiner on a pronoun — it is the one every engine already reads for **negative
concord**, so each language's answer comes out of machinery the `no` determiner built.

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| the cat eats **something** | the cat eats something. | il gatto mangia qualcosa. | le chat mange quelque chose. | der Kater frisst etwas. | el gato come algo. | 猫は何かを食べます。 | o gato come algo. |
| the cat does **not** eat something | the cat does not eat **anything**. | il gatto non mangia **niente**. | le chat ne mange **rien**. | der Kater frisst **nichts**. | el gato no come **nada**. | 猫は**何も**食べません。 | o gato não come **nada**. |
| **something** eats | something eats. | qualcosa mangia. | quelque chose mange. | etwas isst. | algo come. | 何かは食べます。 | algo come. |
| **nothing** eats | **nothing eats.** | niente mangia. | rien ne mange. | nichts isst. | nada come. | 何も食べません。 | nada come. |
| did not eat (past) | the cat did not eat anything. | il gatto non mangiò niente. | le chat ne mangea rien. | der Kater fraß nichts. | el gato no comió nada. | 猫は何も食べませんでした。 | o gato não comeu nada. |

Each language spells the concord its own way and the flag is all any of them needed: English leaves
the negation on the verb and says *anything*; the Romance languages keep their preverbal negator
beside the negative word; German's *nicht* and French's *pas* give way, because the word carries the
negation alone; and Japanese writes the も…ない circumfix.

What landed differently from the plan:

1. **English needs a third form.** In the **subject** slot the pronoun absorbs the negation —
   "nothing eats", not "*anything does not eat" — which the lexeme names as `negative_subject`. The
   other six write one negative word in both slots.
2. **It is a pronoun by its lexicon and a phrase by its syntax.** *Qualcosa* is no clitic and is never
   pro-dropped; the Spanish and Portuguese personal *a* marks a person and a thing takes none. The
   lexeme says `thing`, and `isPronounElement` — which is what every engine asks before cliticizing
   or dropping — excludes it.
3. **Japanese writes no prenominal どの.** The negative circumfix's first half is a determiner, and a
   pronoun takes none: 何も, not どの何も. A `no` **noun** still takes it (どのネズミも).
4. **SOMETHING is glossed on THING** — "an unknown thing" / "una cosa sconosciuta" / 不明なもの — the
   genus-differentia shape, the only one a pronoun of this kind takes. The negative half needs no
   gloss of its own: it is the same concept.
5. **ONLY is literal by design.** "And nothing more" wants a verbless "and" fragment, and a verbless
   period cannot be negated at all — the negative pronoun alone renders as its positive half
   ("qualcosa"), because there is no clause to carry the negation. "In a sole way" says *uniquely*,
   which B67 had already refused. ONLY's commonest use, over a noun, shipped as
   [C39](C39-focus-particle-on-a-noun-phrase.md)'s focus value.

Pinned in [`indefinite-pronoun.test.ts`](../../../packages/engine/test/indefinite-pronoun.test.ts).
Numerals are [C31](C31-numerals.md): the same P09 row, a different mechanism.
