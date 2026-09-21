# C18. Motion verbs the genus could not gloss yet: JUMP, COLLAPSE, COME

_(split out of [C17](C17-motion-verbs-reflexive-genus.md) when C17 shipped. **Retired by splitting**
on 2026-09-21: JUMP shipped here (see Done), and COLLAPSE and COME were split into their own
tickets.)_

## Split (2026-09-21)

C17 seeded the genus **MOVE_ONESELF** ("to change position": it *muoversi*, fr *se déplacer*, de
*sich bewegen*, es *moverse*, pt *mover-se*, ja 移動する), and RUN, GO and JUMP are glossed on it.
This file had the other two waiting on a differentia MOVE_ONESELF could not carry. A fresh probe
found that neither needs the engine, only words:

| verb | now | gloss | seed first |
|---|---|---|---|
| COLLAPSE | [B34](../B-needs-seed/B34-collapse.md) | to move to the ground suddenly | GROUND, SUDDENLY |
| COME | [B35](../B-needs-seed/B35-come.md) | to move to the speaker | SPEAKER |

What changed from this file's own verdicts:

1. **COLLAPSE never needed two adverbs.** "To move downward suddenly" spent both of its adverb slots
   on "down" and "suddenly". The `direction` complement, which unblocked JUMP, can say "down" as a
   place, *the ground*. That leaves the one `modifier` for SUDDENLY. This file had ruled the
   direction out because "there is no noun for COLLAPSE to end up in relation to". There is one; it
   was just not seeded.
2. **COME's deixis is a noun.** This file put COME with the [C05](C05-non-distinguishing-genera.md)
   literals for want of a "composable deixis". "The speaker" as the goal of the same `direction`
   complement is that deixis, and it renders in all seven. The pronoun route, "to move to me", is
   not open: the motion complements are noun-only by design.

Each ticket leaves one reading for a native speaker to judge: French *au sol* for COLLAPSE, and
Italian *muoversi dal parlante* for COME. The probe tables are in the tickets.

## Two adverbs on one verb: costed, not needed

This was COLLAPSE's blocker, and it is kept here as the cost of the feature in case anything else
asks for it. `VerbPhrase.modifier` is one adverb, and **37 sites across 21 files** read it: the
seven engines' adverb placement, the builder's adverb slot and its satellite, the console's `/adv`,
the serialization format, the relative-clause and modal paths. Each language would also need an
*order* for two adverbs, which is a real question and not a mechanical one (en "moves down
suddenly" / "suddenly moves down"; de "bewegt sich plötzlich nach unten"; ja 「突然下に移動する」).
No localization task needs it now.

## Done: JUMP (2026-09-21)

**JUMP → "to move into the air"**, the gloss this file asked for. It needed both halves it named:

| | |
|---|---|
| **AIR** | seeded in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts) as a mass noun beside WATER — en *air*, it *aria* (fem), fr *air* (masc), de *Luft* (fem), es *aire*, ja 空気, pt *ar*. Both Italian and French elide their article against its initial vowel, which is what the gloss reads as "nell'aria" and "dans l'air" |
| **an *into* path** | the `direction` complement now takes a `path` specifier |

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| JUMP | to move into the air | muoversi nell'aria | se déplacer dans l'air | sich in die Luft bewegen | moverse en el aire | 空気の中へ移動する | mover-se no ar |

### The direction complement's relation

A `direction` with no specifier is the plain goal, the thing moved *towards* ("goes to the house" /
*alla casa* / *zum Haus* / 家へ). One naming a relation says where the motion ends up with respect
to its landmark. It is the third member of the `PathSpecifier` family and the only one with **no
default**, because having no relation is a meaning of its own there
([`directionSpecifier`](../../../packages/engine/src/functions/directionSpecifier.ts)).

`in` is what makes it worth having, and each language shows a different reason:

| | plain goal | + `in` |
|---|---|---|
| en | to the house | **into** the house — a different word, which is the whole gap [B27](B27-ui-clipboard-move-resize.md) hit |
| de | zum Haus | **ins** Haus — the same preposition, in the **accusative** of motion-into, against the dative of being there ("im Haus") |
| ja | 家へ | 家**の中**へ — the relational noun a static place leaves out (家に) |
| it / fr / es / pt | alla casa / à la maison / a la casa / à casa | nella casa / dans la maison / en la casa / na casa |

The other relations take the goal reading of the word they already have ("goes behind the house",
de "hinter **das** Haus", ja 家の後ろへ). `spatialCase` gained a `'direction'` type, which returns
the accusative for every relation: on a two-way preposition the case *is* the difference.

**Plan-only.** The canvas draws its specifier toolbar on the route and locative rings and the
direction ring has none, so nothing in the UI can set this yet — the same way `objectPredicative`
and `comitative` shipped in C12. Giving the direction ring a toolbar is a builder task, and it
would want a value for "no relation" that the route and locative toolbars have no use for.

Pinned in `packages/engine/test/complements/direction.test.ts` (*direction: a relation, not just a
goal*), the gloss in `reflexive.test.ts`, and AIR's own paradigm in `nounPhrase.test.ts`.
