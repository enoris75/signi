# A353. English puts a direction adverb after the by-phrase

**Languages:** English

[A156](../fixed/A156-english-direction-adverb-after-complements.md) put English UP and DOWN right
after the verb or its object, ahead of the complements (*moves the book up in the house*). In a
passive the by-phrase is written first, so the particle trails the agent: *the book is moved by the
cat up*. It belongs with the participle, as it already is with no agent (*the book is moved up*).
[A296](../fixed/A296-english-manner-adverb-after-the-by-phrase.md) made the same move for a manner
adverb.

| Case | Now | Want |
|---|---|---|
| the BOOK is MOVEd UP by the CAT | `the book is moved by the cat up.` | `the book is moved up by the cat.` |
| … DOWN, past | `the book was moved by the cat down.` | `the book was moved down by the cat.` |
| … under MUST | `the book must be moved by the cat up.` | `the book must be moved up by the cat.` |
| … in the HOUSE | `the book is moved by the cat up in the house.` | `the book is moved up by the cat in the house.` |

**Already right.** The agentless passive (`the book is moved up.`), the active (`the cat moves the
book up.`), a manner adverb (`the book is moved well by the cat.`, A296).

**Not here.** Italian writes the particle after the agent too (`il libro è spostato dal gatto su`);
`spostato su dal gatto` is likelier, but Italian *su* with a participle was not reviewed. Not pinned.

## Shape of the fix

A296's branch builds the passive's `objectText` (`[participle, by-phrase]`) after the adverb is
settled, and seats a manner adverb between them. A direction adverb (the A156 particle class) should
take the same seat, after the participle and before the by-phrase.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: English direction adverb after the by-phrase (A353)* (2 `test.fails`: the simple tenses, a modal and a complement; plus a regression test for the agentless passive, the active and a manner adverb) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.

## Resolved

2026-09-24. [en/predicateParts.ts](../../../packages/engine/src/languages/en/predicateParts.ts) seats a
direction adverb in A296's passive seat, between the participle and the by-phrase
(`passiveParticle`), and leaves it out of the complements slot it would otherwise lead. With no agent
the trailing slot is unchanged (*the book is moved up.*); the stranded *by* of an agent question
still closes the verb's arguments (*who is the book moved up to the child by?*).

Guarded by [adverb.test.ts](../../../packages/engine/test/adverb.test.ts) → *known bugs: English
direction adverb after the by-phrase (A353)*: the two formerly-`.fails` tests, the regression test,
and a new test for the prospective, the negative, a plural and a pronoun agent, a recipient and the
agent question.
