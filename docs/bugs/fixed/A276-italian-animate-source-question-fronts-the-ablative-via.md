# A276. An Italian animate source question fronts the ablative *via*

**Languages:** Italian

Italian marks motion away from a person with the ablative particle *via* before *da*: "il gatto viene
**via** dalla donna" (*from the woman*), against "il gatto viene dalla donna" (*to the woman's place*).
The particle belongs to the verb. The question over an animate source
([P09-E15](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E15-question-over-a-marked-relation.md))
fronts the whole complement as the statement writes it, and the particle moves with it.

| Case | Now | Want |
|---|---|---|
| where does the CAT COME from (`source`, animate) | `via da chi viene il gatto?` | `da chi viene via il gatto?` |
| … RUN | `via da chi corre il gatto?` | `da chi corre via il gatto?` |
| … GO | `via da chi va il gatto?` | `da chi va via il gatto?` |

**Why this target.** *Via* is a verb particle, as in *andare via* and *correre via*. A fronted
*da*-phrase leaves it behind the verb. Dropping it is wrong too: "da chi viene il gatto?" asks where
the cat is going (*to whose place*).

**Already right.** The inanimate source is the adverb *da dove* ("da dove viene il gatto?"), which
takes no particle. The statement is right, and so is the relative clause over a source.

**Shape of the fix.** The Italian `questionWord` renders a source gap without the particle, and
`questionOrder` writes *via* after the verb when the statement would (`SOURCE_ABLATIVE_ADVERB_VERBS`,
or an animate source under a verb that takes a direction, in `it/complementsPhrase.ts`). The embedded
question (P09-E17) goes through the same order.

**Not settled here:** whether RUN's inanimate source ("da dove corre il gatto?") should also keep its
*via* ("da dove corre via il gatto?"). The statement writes it: "corre via dalla casa".

Pinned by `known bugs: an Italian animate source question fronts the ablative via (A276)` in
[questions.test.ts](../../../packages/engine/test/questions.test.ts).

Found by P09-E15's lane on 2026-09-23.

## Resolved

2026-09-23. The Italian `questionWord` now renders a source gap without the ablative particle
(`da chi`), and the new `questionParticle` gives the *via* the statement would write
(`SOURCE_ABLATIVE_ADVERB_VERBS`, or an animate source under a verb that takes a direction), which
`questionOrder` writes right after the predicate: `da chi viene via il gatto?`, `da chi corre via il
gatto?`, `da chi va via il gatto?`. The embedded question goes through the same order: `l'uomo chiede
da chi viene via il gatto.` A verb with no goal (A228) takes no particle, as its statement takes none.

**Settled:** RUN's inanimate source question stays `da dove corre il gatto?`, with no *via*
(ruled 2026-09-23): the adverb *da dove* takes no particle, and `questionParticle` returns none for it.

- Engine: [questionWord.ts](../../../packages/engine/src/languages/it/questionWord.ts),
  [questionOrder.ts](../../../packages/engine/src/languages/it/questionOrder.ts).
- Tests: `known bugs: an Italian animate source question fronts the ablative via (A276)` in
  [questions.test.ts](../../../packages/engine/test/questions.test.ts) — its three `test.fails.each`
  rows flipped, plus the embedded question and a guard on *da dove* and the statement; unit cases in
  [questionWord.test.ts](../../../packages/engine/src/languages/it/questionWord.test.ts) and
  [questionOrder.test.ts](../../../packages/engine/src/languages/it/questionOrder.test.ts).
