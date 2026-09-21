# B34. COLLAPSE — seed GROUND and SUDDENLY: to move to the ground suddenly

_(split out of [C18](C18-motion-verbs-without-a-gloss.md) on 2026-09-21. C18 wanted "to
move downward suddenly" and had it waiting on **two adverbs on one verb**. It does not need two.
"Down" can be a place the motion ends at instead of an adverb, and that leaves the single adverb
slot for SUDDENLY. **Done 2026-09-21**, with an engine change for the French and Italian goal: see
[Done](#done-2026-09-21).)_

COLLAPSE is intransitive, "to fall down suddenly, losing all support"
([verbs/intransitive.ts:368](../../../packages/backend/src/concepts/verbs/intransitive.ts#L368)).
Its genus is MOVE_ONESELF ([verbs/motion.ts:92](../../../packages/backend/src/concepts/verbs/motion.ts#L92)),
which already glosses RUN, GO and JUMP.

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| GROUND | noun, count | the solid surface of the earth | ground / grounds | suolo / suoli (m) | sol / sols (m) | Boden / Böden (m) | suelo / suelos (m) | 地面 (じめん) | chão / chãos (m) |
| SUDDENLY | adverb, manner | quickly and without warning | suddenly | improvvisamente | soudainement | plötzlich | de repente | 突然 (とつぜん) | de repente |

SUDDENLY takes no `subtype`: it is a manner adverb like REPEATEDLY. `direction` is for UP and DOWN.
Italian *suolo* rather than *terra*: with the article, "alla terra" reads as "to the Earth". Both
were seeded as proposed.

## Unlocks

| verb | plan | gloss (en) |
|---|---|---|
| COLLAPSE | `infinitiveGloss('MOVE_ONESELF', { modifier: 'SUDDENLY', complements: { direction: { phrase: { concept: 'GROUND', definiteness: 'definite' } } } })` | to move to the ground suddenly |

## The French reading, judged

The ticket's probe, before this change (engine source at HEAD, GROUND and SUDDENLY seeded):

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to move to the ground suddenly | muoversi improvvisamente **al suolo** | se déplacer soudainement **au sol** | sich plötzlich zum Boden bewegen | moverse de repente al suelo | 地面へ突然移動する | mover-se de repente ao chão |

**French reads wrong, and so does Italian.** *Au sol* is the idiom after a verb of falling (*tomber au
sol*), but after *se déplacer* it is where the moving happens: *les oiseaux se déplacent au sol*, "birds
get about on the ground". "Se déplacer soudainement au sol" says moving about on the ground suddenly,
which is not a collapse. Italian *muoversi al suolo* has the same locative reading (*animali che si
muovono al suolo*). *Vers le sol* / *verso il suolo* is unambiguous.

The gap was the verb's, not the plan's. French gave *vers* only to an animate goal and *à* to a place;
Italian gave *a* to a place and *da* to a person. Neither choice fits MOVE_ONESELF, whose goal is always
headed *towards* ([B35](B35-come.md) found the Italian person goal reading as "from"). So the verb now
names its goal's preposition in its lexeme, the way German ADD names `terminus_prep: 'zu'`:

| | where | what |
|---|---|---|
| lexicon | [motion.ts:107, 117](../../../packages/backend/src/concepts/verbs/motion.ts#L107) | MOVE_ONESELF's it forms carry `direction_prep: 'verso'`, its fr forms `direction_prep: 'vers'` |
| French | [fr/complementsPhrase.ts:171](../../../packages/engine/src/languages/fr/complementsPhrase.ts#L171) | a plain goal (no relation) takes the verb's `direction_prep` when it has one, before the continent, animate and place rules; `predicateText` passes the verb's forms |
| Italian | [it/complementsPhrase.ts:173](../../../packages/engine/src/languages/it/complementsPhrase.ts#L173) | the same; `prepDet` learned that *verso* fuses with no article, like *con* and *come* ("verso il suolo") |
| relative clauses | `relativeText` in [fr](../../../packages/engine/src/languages/fr/relativeText.ts) and [it](../../../packages/engine/src/languages/it/relativeText.ts) | a head filling the verb's goal gap reads the same key: "la maison vers laquelle le chat se déplace", "la casa verso la quale il gatto si muove" (GO keeps "à laquelle", "alla quale") |

A goal naming a relation keeps its own word: JUMP stays "nell'aria", "dans l'air". GO, COME and every
other verb keep the goal words their goal selects ("va alla casa", "va dal bambino", "va en Europe").

**Spanish and Portuguese read right** and were left alone: after a motion verb, *a* / *ao* is only ever
the goal, never where the motion happens or the place it leaves ("moverse de repente al suelo",
"mover-se de repente ao chão"). *Hacia* / *para* would be more idiomatic with a reflexive "move", and
the lexeme key would carry them the day someone wants it.

## Routes rejected on the probe

| plan | en | ja | why not |
|---|---|---|---|
| MOVE_ONESELF + DOWN (C18's fallback) | to move down | 下に移動する | does not tell COLLAPSE from sinking or lowering |
| MOVE_ONESELF + SUDDENLY, no direction | to move suddenly | 突然移動する | no "down" at all |
| MOVE_ONESELF + DOWN + manner "at high speed" | to move down at high speed | 高い速さで下に移動する | speed is not suddenness, and a falling thing is fast whether or not it collapses. German also orders it badly: *sich nach unten mit hoher Geschwindigkeit bewegen*, where the direction wants to be last |
| MOVE_ONESELF + the ground + FAST (no SUDDENLY) | to move to the ground fast | 地面へ速く移動する | FAST is RUN's differentia ("to move fast") |
| MOVE_ONESELF + DOWN + SUDDENLY | — | — | two adverbs on one verb. Nothing here needs that feature any more (see C18) |

## Done (2026-09-21)

**COLLAPSE → "to move to the ground suddenly"**, the plan above, with `isA: 'MOVE_ONESELF'` set as
RUN, GO and JUMP have it. Rendered at boot in all seven:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| COLLAPSE | to move to the ground suddenly | muoversi improvvisamente verso il suolo | se déplacer soudainement vers le sol | sich plötzlich zum Boden bewegen | moverse de repente al suelo | 地面へ突然移動する | mover-se de repente ao chão |
| GROUND, a / the plural | a ground / the grounds | un suolo / i suoli | un sol / les sols | ein Boden / die Böden | un suelo / los suelos | 地面 | um chão / os chãos |
| SUDDENLY, "the cat ate suddenly" | the cat ate suddenly | il gatto mangiò improvvisamente | le chat mangea soudainement | der Kater fraß plötzlich | el gato comió de repente | 猫は突然食べました | o gato comeu de repente |

The three glosses already on MOVE_ONESELF, re-probed after the engine change. GO's Italian and French
goal changed, and both still read right ("da un luogo verso un altro", "d'un lieu vers un autre" are the
usual phrasing of a move between places); RUN and JUMP did not change:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| RUN | to move fast | muoversi velocemente | se déplacer vite | sich schnell bewegen | moverse rápido | 速く移動する | mover-se rapidamente |
| GO | to move from a place to another place | muoversi da un luogo **verso** un altro luogo | se déplacer d'un lieu **vers** un autre lieu | sich aus einem Ort zu einem anderen Ort bewegen | moverse de un lugar a otro lugar | 場所から別の場所へ移動する | mover-se de um lugar a outro lugar |
| JUMP | to move into the air | muoversi nell'aria | se déplacer dans l'air | sich in die Luft bewegen | moverse en el aire | 空気の中へ移動する | mover-se no ar |

What landed differently from the plan:

1. **An engine change the plan did not expect.** The ticket said a wrong French reading should be filed,
   not fixed in the plan. It was fixed in the engine, scoped to the verb: MOVE_ONESELF's lexeme names its
   goal preposition, `direction_prep` (see above). The plan is unchanged.
2. **Italian changed too.** The ticket asked about French only; *muoversi al suolo* has the same
   locative reading, and the same key fixes it.
3. **GO's gloss moved with it**, in Italian and French, re-pinned in `reflexive.test.ts` and the e2e
   spec.

- Seed: GROUND beside AIR in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L186), SUDDENLY
  after REPEATEDLY in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts#L116).
- Tests: the gloss and GO's re-pin in *C17 verb definitions* and the verb's goal preposition in
  *MOVE_ONESELF: the goal takes the verb's own preposition* (a place, a person, a continent, a relation,
  a relative clause on the goal, and GO unchanged), both in [reflexive.test.ts](../../../packages/engine/test/reflexive.test.ts);
  SUDDENLY in [infinitive.test.ts](../../../packages/engine/test/infinitive.test.ts); GROUND in
  [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); en + fr in
  [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (the C17 loop).
