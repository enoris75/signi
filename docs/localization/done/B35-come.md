# B35. COME — seed SPEAKER: to move to the speaker

_(split out of [C18](C18-motion-verbs-without-a-gloss.md) on 2026-09-21. C18 had COME on
the English literal for want of a **composable deixis**. The deixis is a noun: the `direction`
complement that carried JUMP can carry "the speaker" too. **Done 2026-09-21**, with the Italian goal
fixed in the engine: see [Done](#done-2026-09-21).)_

COME is intransitive, "to move toward the speaker or a place"
([verbs/intransitive.ts:154](../../../packages/backend/src/concepts/verbs/intransitive.ts#L154)).
Its genus is MOVE_ONESELF ([verbs/motion.ts:92](../../../packages/backend/src/concepts/verbs/motion.ts#L92)),
the same genus as GO. GO's gloss says where the motion goes *from* ("to move from a place to
another place"), and COME's says whom it goes *to*.

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SPEAKER | noun, count, `animate`, `human`, isA PERSON | the person who is speaking | speaker / speakers | parlante / parlanti (m) | locuteur / locuteurs (m) | Sprecher / Sprecher (m) | hablante / hablantes (m) | 話し手 (はなして) | falante / falantes (m) |

The linguistic term in each language, not the loudspeaker. `human` is what gives French *vers* and
Spanish *hacia* where a place would take *à* / *a*. SPEAKER's own tooltip stays on its literal:
`whoGloss('PERSON', 'SPEAK')` would need SPEAK, which is not seeded. Seeded as proposed, with the
feminine a person noun carries (*locutrice*, *Sprecherin*; *la parlante*, *la hablante*, *a falante*).

## Unlocks

| verb | plan | gloss (en) |
|---|---|---|
| COME | `infinitiveGloss('MOVE_ONESELF', { complements: { direction: { phrase: { concept: 'SPEAKER', definiteness: 'definite' } } } })` | to move to the speaker |

## The Italian reading, judged

The ticket's probe, before this change (engine source at HEAD, SPEAKER seeded):

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to move to the speaker | muoversi **dal parlante** | se déplacer vers le locuteur | sich zum Sprecher bewegen | moverse hacia el hablante | 話し手へ移動する | mover-se para o falante |

**It reads as "from".** *Dal parlante* is the *andare da qualcuno* goal the engine gives every animate
goal, and after *andare* or *venire* it is one ("va dal medico"). After *muoversi* it is not:
*muoversi da un posto* is to leave it, so "muoversi dal parlante" reads as moving away from the speaker,
the opposite of COME. [A153](../../bugs/fixed/A153-italian-animate-source-reads-as-goal.md) had
already listed MOVE_ONESELF's animate goal as open, and its source now carries *via* ("si muove via dal
bambino"), which leaves the bare *da* free to mislead.

The fix is the one [B34](B34-collapse.md) needed for French *au sol*: MOVE_ONESELF names its goal
preposition in its lexeme, `direction_prep: 'verso'` in Italian and `'vers'` in French
([motion.ts:107](../../../packages/backend/src/concepts/verbs/motion.ts#L107)), and the two engines read
it for a plain goal before the animate and place rules
([it/complementsPhrase.ts:173](../../../packages/engine/src/languages/it/complementsPhrase.ts#L173)).
French already said *vers le locuteur*, so only its place goals moved. B34 has the full account and
the three glosses the change touched.

**The other five read right.** German *zum Sprecher*, Spanish *hacia*, Portuguese *para* and
Japanese へ are all goals.

## Routes rejected on the probe

| plan | en | it | ja | why not |
|---|---|---|---|---|
| direction FIRST_PERSON ("to me") | to move to **the I** | muoversi **all'io** | 私へ移動する | the builder keeps the motion complements noun-only by design (`SlotTypeahead` gives a pronoun picker to the object and `cause`, not to these), and the engines render a pronoun there as the noun, with an article. Not a live bug for the same reason |
| direction PERSON | to move to the person | muoversi dalla persona | 人へ移動する | not deictic: any person, not the one speaking |
| a HERE adverb (unseeded) | — | — | — | a motion to "here" needs a directional form the lexicon has no slot for: de *hierher* against *hier*, ja ここへ against ここに |

## Done (2026-09-21)

**COME → "to move to the speaker"**, the plan above, with `isA: 'MOVE_ONESELF'` set as GO has it.
Rendered at boot in all seven:

| | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| COME | to move to the speaker | muoversi verso il parlante | se déplacer vers le locuteur | sich zum Sprecher bewegen | moverse hacia el hablante | 話し手へ移動する | mover-se para o falante |
| SPEAKER, a / the plural | a speaker / the speakers | un parlante / i parlanti | un locuteur / les locuteurs | ein Sprecher / die Sprecher | un hablante / los hablantes | 話し手 | um falante / os falantes |
| SPEAKER, feminine | a speaker | una parlante | une locutrice | eine Sprecherin | una hablante | 話し手 | uma falante |

What landed differently from the plan:

1. **The Italian goal is "verso", not "da".** The ticket said to file an Italian bug on MOVE_ONESELF's
   animate goal if it read as "from", and leave the plan alone. The plan is unchanged; the goal was fixed
   in the engine, scoped to the verb, together with B34's French.
2. **SPEAKER has a feminine**, as the other person nouns do; the ticket's table gave only the masculine.

- Seed: SPEAKER after PERSON in [nouns.ts](../../../packages/backend/src/concepts/nouns.ts#L715).
- Tests: the gloss in *C17 verb definitions* and the person goal in *MOVE_ONESELF: the goal takes the
  verb's own preposition* ("il gatto si muove verso il bambino"), in
  [reflexive.test.ts](../../../packages/engine/test/reflexive.test.ts); SPEAKER's paradigm and
  feminine in [definition-words.test.ts](../../../packages/engine/test/definition-words.test.ts); en + it
  in [definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) (the C17 loop).
