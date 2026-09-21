# C18. Motion verbs the genus cannot gloss yet: COLLAPSE and COME

_(split out of [C17](../done/C17-motion-verbs-reflexive-genus.md) when C17 shipped. **JUMP left
2026-09-21** — see Done.)_

**Blocked on:** a differentia the plan cannot compose. The genus is ready. C17 built the Italian
pronominal and German reflexive verbs and seeded **MOVE_ONESELF** ("to change position": it
*muoversi*, fr *se déplacer*, de *sich bewegen*, es *moverse*, pt *mover-se*, ja 移動する), and RUN,
GO and now JUMP are glossed on it. These two need something MOVE_ONESELF cannot carry today:

| verb | gloss (en) | blocked on |
|---|---|---|
| COLLAPSE | to move downward suddenly | **two adverbs on one verb**. `GlossParts.modifier` and `VerbPhrase.modifier` each hold one, and SUDDENLY is not seeded |
| COME | to move toward the speaker | no composable deixis ("toward the speaker", "here"). Stays literal, like the [C05](C05-non-distinguishing-genera.md) genera |

## COLLAPSE: what "two adverbs" costs

Not a corner of a gloss — a feature, the way the passive was for [C19](../done/C19-verbs-needing-voice-purpose-or-comitative.md).
`VerbPhrase.modifier` is one adverb, and **37 sites across 21 files** read it: the seven engines'
adverb placement, the builder's adverb slot and its satellite, the console's `/adv`, the
serialization format, the relative-clause and modal paths. Each language would also need an
*order* for two adverbs, which is a real question and not a mechanical one (en "moves down
suddenly" / "suddenly moves down"; de "bewegt sich plötzlich nach unten"; ja 「突然下に移動する」).
Seeding SUDDENLY before that exists would put a word in the corpus with nothing able to use it, so
it is not seeded either.

The single-adverb fallbacks were probed and rejected when this file was written, and the reason
still holds — neither tells its verb apart, because lifting also moves up and sinking moves down:

| Plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `infinitiveGloss('MOVE_ONESELF', { modifier: 'UP' })` | to move up | muoversi su | se déplacer vers le haut | sich nach oben bewegen | moverse arriba | 上に移動する | mover-se para cima |
| `infinitiveGloss('MOVE_ONESELF', { modifier: 'DOWN' })` | to move down | muoversi giù | se déplacer vers le bas | sich nach unten bewegen | moverse abajo | 下に移動する | mover-se para baixo |

The `direction` complement, which is what unblocked JUMP, does not help here: "down" is an adverb,
not a landmark, and there is no noun for COLLAPSE to end up in relation to. A `manner` complement
would want a SUDDENNESS noun, which is the same seed with an extra step.

## Once unblocked

Set `isA: 'MOVE_ONESELF'` on each verb whose gloss cites it, as RUN, GO and JUMP have, and pin the
gloss in `packages/engine/test/reflexive.test.ts` (*C17 verb definitions*) and in
`e2e/definition-tooltip.spec.ts`.

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
| en | to the house | **into** the house — a different word, which is the whole gap [B27](../done/B27-ui-clipboard-move-resize.md) hit |
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
