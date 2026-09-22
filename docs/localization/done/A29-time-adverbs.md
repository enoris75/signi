# A29. NOW, AGAIN, REPEATEDLY — the time adverbs `mannerGloss` already says

_(from the unsorted sweep of 2026-09-22. Three of the twelve undefined adverbs gloss today, on the
`frequencyGloss` shape ALWAYS and NEVER already ship — TIME under a determiner, with the `measure`
relation writing "at". The other nine need a construct the engine does not have and are
[C25](../C-needs-engine/C25-place-and-direction-adverbs.md) and
[B55](B55-sequence-and-position.md).)_

## Plan

Inline on each seed block in [adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts).

| concept | plan | gloss (en) |
|---|---|---|
| NOW | `{ subject: { concept: 'TIME', definiteness: 'this', mannerGloss: true } }` | at this time |
| AGAIN | `{ subject: { concept: 'TIME', definiteness: 'indefinite', adjectives: ['OTHER'], mannerGloss: true } }` | at another time |
| REPEATEDLY | `{ subject: { concept: 'TIME', definiteness: 'many', number: 'plural', mannerGloss: true } }` | at many times |

NOW takes the `this` determiner rather than `definite`: *at the time* names some time already
spoken of, *at this time* names the speaker's own, which is what "now" is. It is the first use of
deixis in a definition — [C06](../done/C06-pronoun-definitions.md) built the determiner, and
PROXIMAL's seed describes it.

## Vocabulary

All seeded: TIME, the adjective OTHER, and the determiner values `this`, `indefinite` and `many`.
No new word.

## Probe renders (2026-09-22, engine source at HEAD, lexicon seeded in memory)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NOW | at this time | a questo tempo | à ce temps | zu dieser Zeit | a este tiempo | この時間で | a este tempo |
| AGAIN | at another time | a un altro tempo | à un autre temps | zu einer anderen Zeit | a otro tiempo | 別の時間で | a outro tempo |
| REPEATEDLY | at many times | a molti tempi | à beaucoup de temps | zu vielen Zeiten | a muchos tiempos | 多くの時間で | a muitos tempos |
| ALWAYS (shipped, for comparison) | at all times | a tutti i tempi | à tous les temps | zu allen Zeiten | a todos los tiempos | すべての時間で | a todos os tempos |

All three render in all seven, and each contracts its preposition and article where the language
does (it *ai tempi*, fr *au temps* in the `definite` form probed alongside). Two readings were
judged on authoring:

1. **REPEATEDLY ships with the marked English.** "At many times" is not the idiom — English drops
   the preposition — but the "at" comes from the `measure` relation that ALWAYS depends on, the
   other six languages are right, and moving REPEATEDLY to C25 would trade a marked gloss for none.
2. **French *à beaucoup de temps* is not a bug.** The `many` determiner handles a plural count noun
   correctly — the same plan on OBJECT_THING gives *beaucoup d'objets*. What hides the plural is the
   noun: French *temps* is invariable, so *à beaucoup de temps* is the plural, spelled like the
   singular. Nothing filed.

## Not in this ticket

ALREADY is the fourth time adverb and needs a word: "by this time" is a terminus, not a measure, and
PREVIOUS has no gloss. It is [B55](B55-sequence-and-position.md). SUDDENLY renders
"in a quick way" on the seeded QUICK, which is not what sudden means, and is in
[C25](../C-needs-engine/C25-place-and-direction-adverbs.md) with the place adverbs.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts): NOW in English
and German, where the deictic determiner inflects for the dative the `measure` relation governs
(*zu dieser Zeit*).

## Done

Shipped 2026-09-22. Three `definition` plans in
[adverbs.ts](../../../packages/backend/src/concepts/adverbs.ts). No word seeded, no engine change.

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| NOW | at this time | a questo tempo | à ce temps | zu dieser Zeit | a este tiempo | この時間で | a este tempo |
| AGAIN | at another time | a un altro tempo | à un autre temps | zu einer anderen Zeit | a otro tiempo | 別の時間で | a outro tempo |
| REPEATEDLY | at many times | a molti tempi | à beaucoup de temps | zu vielen Zeiten | a muchos tiempos | 多くの時間で | a muitos tempos |

What landed differently from the plan: **ALREADY shipped too, in
[B55](B55-sequence-and-position.md), and needed no seed.** This file sent it away for want of
PREVIOUS; PREVIOUS is seeded and only its *form* was ever needed, so `mannerGloss('TIME',
'indefinite', 'PREVIOUS')` — AGAIN's shape with a different adjective — renders "at a previous time",
de *zu einer vorherigen Zeit*. The adverb set this file opened is closed.
