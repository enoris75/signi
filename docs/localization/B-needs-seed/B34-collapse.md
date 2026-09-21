# B34. COLLAPSE — seed GROUND and SUDDENLY: to move to the ground suddenly

_(split out of [C18](../done/C18-motion-verbs-without-a-gloss.md) on 2026-09-21. C18 wanted "to
move downward suddenly" and had it waiting on **two adverbs on one verb**. It does not need two.
"Down" can be a place the motion ends at instead of an adverb, and that leaves the single adverb
slot for SUDDENLY.)_

COLLAPSE is intransitive, "to fall down suddenly, losing all support"
([verbs/intransitive.ts:356](../../../packages/backend/src/concepts/verbs/intransitive.ts#L356)).
Its genus is MOVE_ONESELF ([verbs/motion.ts:88](../../../packages/backend/src/concepts/verbs/motion.ts#L88)),
which already glosses RUN, GO and JUMP.

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| GROUND | noun, count | the solid surface of the earth | ground / grounds | suolo / suoli (m) | sol / sols (m) | Boden / Böden (m) | suelo / suelos (m) | 地面 (じめん) | chão / chãos (m) |
| SUDDENLY | adverb, manner | quickly and without warning | suddenly | improvvisamente | soudainement | plötzlich | de repente | 突然 (とつぜん) | de repente |

Forms are suggestions for the seed author. SUDDENLY takes no `subtype`: it is a manner adverb like
REPEATEDLY. `direction` is for UP and DOWN. Italian *suolo* rather than *terra*: with the article,
"alla terra" reads as "to the Earth".

## Unlocks

| verb | plan | gloss (en) |
|---|---|---|
| COLLAPSE | `infinitiveGloss('MOVE_ONESELF', { modifier: 'SUDDENLY', complements: { direction: { phrase: { concept: 'GROUND', definiteness: 'definite' } } } })` | to move to the ground suddenly |

### Probe renders (2026-09-21, engine source at HEAD, GROUND and SUDDENLY from the table above through a lookup wrapper, nothing seeded)

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to move to the ground suddenly | muoversi improvvisamente al suolo | se déplacer soudainement au sol | sich plötzlich zum Boden bewegen | moverse de repente al suelo | 地面へ突然移動する | mover-se de repente ao chão |

**One reading to judge when authoring: French.** *Au sol* is the idiom after a verb of falling
(*tomber au sol*, *s'effondrer au sol*). After *se déplacer*, though, it can read as where the
motion happens, as in *les oiseaux se déplacent au sol*. *Vers le sol* would be unambiguous. The
French engine gives *vers* only to an animate goal (*vers le locuteur*). An inanimate goal takes
*à*, so getting *vers* here would need a direction relation the plan does not have. If French reads
wrong, that is the gap to file, not a reason to change the plan.

Once seeded: set `isA: 'MOVE_ONESELF'` on COLLAPSE, as RUN, GO and JUMP have. Pin the gloss in
`packages/engine/test/reflexive.test.ts` (*C17 verb definitions*) and in
`e2e/definition-tooltip.spec.ts`.

## Routes rejected on the probe

| plan | en | ja | why not |
|---|---|---|---|
| MOVE_ONESELF + DOWN (C18's fallback) | to move down | 下に移動する | does not tell COLLAPSE from sinking or lowering |
| MOVE_ONESELF + SUDDENLY, no direction | to move suddenly | 突然移動する | no "down" at all |
| MOVE_ONESELF + DOWN + manner "at high speed" (**no seed**) | to move down at high speed | 高い速さで下に移動する | speed is not suddenness, and a falling thing is fast whether or not it collapses. German also orders it badly: *sich nach unten mit hoher Geschwindigkeit bewegen*, where the direction wants to be last |
| MOVE_ONESELF + the ground + FAST (no SUDDENLY) | to move to the ground fast | 地面へ速く移動する | FAST is RUN's differentia ("to move fast") |
| MOVE_ONESELF + DOWN + SUDDENLY | — | — | two adverbs on one verb. Nothing here needs that feature any more (see C18) |
