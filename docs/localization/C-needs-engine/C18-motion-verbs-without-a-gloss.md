# C18. Motion verbs the genus cannot gloss yet: JUMP, COLLAPSE, COME

_(split out of [C17](../done/C17-motion-verbs-reflexive-genus.md) when C17 shipped.)_

**Blocked on:** a differentia the plan cannot compose. The genus is ready. C17 built the Italian
pronominal and German reflexive verbs and seeded **MOVE_ONESELF** ("to change position": it
*muoversi*, fr *se déplacer*, de *sich bewegen*, es *moverse*, pt *mover-se*, ja 移動する), and RUN and
GO are glossed on it. These three need something MOVE_ONESELF cannot carry today:

| verb | gloss (en) | blocked on |
|---|---|---|
| JUMP | to move into the air | AIR is not seeded, and the `direction` complement's adposition is "to" / *a* / *zu* / へ, which gives "to move to the air". An *into* path is the engine half, the same gap as [B27](../done/B27-ui-clipboard-move-resize.md)'s "the direction complement can't say *into*" |
| COLLAPSE | to move downward suddenly | two adverbs, DOWN and SUDDENLY. `GlossParts.modifier` and `VerbPhrase.modifier` each hold one adverb. SUDDENLY is not seeded |
| COME | to move toward the speaker | no composable deixis ("toward the speaker", "here"). Likely stays literal, like the [C05](C05-non-distinguishing-genera.md) genera |

## Probe renders

Rendered 2026-09-19 against the seeded lexicon, with MOVE_ONESELF in it. These are the one-adverb
fallbacks. Each renders cleanly, but neither was authored, because neither tells its verb apart:
lifting also moves up, and sinking moves down.

| Plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| `infinitiveGloss('MOVE_ONESELF', { modifier: 'UP' })` | to move up | muoversi su | se déplacer vers le haut | sich nach oben bewegen | moverse arriba | 上に移動する | mover-se para cima |
| `infinitiveGloss('MOVE_ONESELF', { modifier: 'DOWN' })` | to move down | muoversi giù | se déplacer vers le bas | sich nach unten bewegen | moverse abajo | 下に移動する | mover-se para baixo |

## Once unblocked

Set `isA: 'MOVE_ONESELF'` on each verb whose gloss cites it, as RUN and GO have, and pin the gloss in
`packages/engine/test/reflexive.test.ts` (*C17 verb definitions*) and in
`e2e/definition-tooltip.spec.ts`.
