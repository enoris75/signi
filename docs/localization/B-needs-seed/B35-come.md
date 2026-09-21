# B35. COME — seed SPEAKER: to move to the speaker

_(split out of [C18](../done/C18-motion-verbs-without-a-gloss.md) on 2026-09-21. C18 had COME on
the English literal for want of a **composable deixis**. The deixis is a noun: the `direction`
complement that carried JUMP can carry "the speaker" too.)_

COME is intransitive, "to move toward the speaker or a place"
([verbs/intransitive.ts:154](../../../packages/backend/src/concepts/verbs/intransitive.ts#L154)).
Its genus is MOVE_ONESELF ([verbs/motion.ts:88](../../../packages/backend/src/concepts/verbs/motion.ts#L88)),
the same genus as GO. GO's gloss says where the motion goes *from* ("to move from a place to
another place"), and COME's says whom it goes *to*.

## Seed first

| concept | role | gloss | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| SPEAKER | noun, count, `animate`, `human`, isA PERSON | the person who is speaking | speaker / speakers | parlante / parlanti (m) | locuteur / locuteurs (m) | Sprecher / Sprecher (m) | hablante / hablantes (m) | 話し手 (はなして) | falante / falantes (m) |

Forms are suggestions for the seed author: the linguistic term in each language, not the
loudspeaker. `human` matters here. It is what gives French *vers* and Spanish *hacia* where a place
would take *à* / *a*. SPEAKER's own tooltip can stay on its literal: `whoGloss('PERSON', 'SPEAK')`
would need SPEAK, which is not seeded.

## Unlocks

| verb | plan | gloss (en) |
|---|---|---|
| COME | `infinitiveGloss('MOVE_ONESELF', { complements: { direction: { phrase: { concept: 'SPEAKER', definiteness: 'definite' } } } })` | to move to the speaker |

### Probe renders (2026-09-21, engine source at HEAD, SPEAKER from the table above through a lookup wrapper, nothing seeded)

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| to move to the speaker | muoversi dal parlante | se déplacer vers le locuteur | sich zum Sprecher bewegen | moverse hacia el hablante | 話し手へ移動する | mover-se para o falante |

**One reading to judge when authoring: Italian.** *Dal parlante* is the *andare da qualcuno* goal,
which the engine gives every animate goal ("il cane va dal bambino"). Since
[A153](../../bugs/fixed/A153-italian-animate-source-reads-as-goal.md), the source always carries
*via* ("si muove **via** dal bambino"), so the plan is not ambiguous to the engine. The question is
whether an Italian reader takes *muoversi da* as a goal. *Muoversi da un posto* is "to leave a
place", and A153's own note marks MOVE_ONESELF as still open. *Verso il parlante* would be
unambiguous, but the plan cannot ask for it today. If it reads as "from", file it as an Italian bug
on MOVE_ONESELF's animate goal, not a change to this plan.

Once seeded: set `isA: 'MOVE_ONESELF'` on COME. Pin the gloss in
`packages/engine/test/reflexive.test.ts` (*C17 verb definitions*) and in
`e2e/definition-tooltip.spec.ts`.

## Routes rejected on the probe

| plan | en | it | ja | why not |
|---|---|---|---|---|
| direction FIRST_PERSON ("to me", **no seed**) | to move to **the I** | muoversi **all'io** | 私へ移動する | the builder keeps the motion complements noun-only by design (`SlotTypeahead` gives a pronoun picker to the object and `cause`, not to these), and the engines render a pronoun there as the noun, with an article. Not a live bug for the same reason |
| direction PERSON | to move to the person | muoversi dalla persona | 人へ移動する | not deictic: any person, not the one speaking |
| a HERE adverb (unseeded) | — | — | — | a motion to "here" needs a directional form the lexicon has no slot for: de *hierher* against *hier*, ja ここへ against ここに |
