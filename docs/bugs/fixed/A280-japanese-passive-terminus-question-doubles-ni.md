# A280. A Japanese passive terminus question doubles に

**Languages:** Japanese

A Japanese passive marks its demoted agent with に, unless the clause already spends its に on the
recipient of a ditransitive. Then the agent takes the compound によって, because two に in one clause
cannot be told apart: 本は女**によって**男にあげられます (*the book is given to the man by the woman*).
The question over that recipient
([P09-E15](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E15-question-over-a-marked-relation.md)
under [P09-E16](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E16-passive-question.md)'s
passive) asks with 誰に / 何に in the recipient's slot, but the agent still takes the bare に.

| Case | Now | Want |
|---|---|---|
| who is the book given to by the WOMAN (`terminus`, animate, passive GIVE) | `本は女に誰にあげられますか？` | `本は女によって誰にあげられますか？` |
| what is the book given to by the WOMAN (`terminus`, inanimate) | `本は女に何にあげられますか？` | `本は女によって何にあげられますか？` |

**Why this target.** It is the statement's own rule: the recipient asked about is still a に in the
clause, so the agent takes によって as it does in 本は女によって男にあげられます. Both Want strings were
verified by applying the fix below to a throwaway copy of the tree. The same copy renders the past
(本は女によって誰にあげられましたか？) and leaves the agentless question alone (本は誰にあげられますか？).

**Already right.** The other six languages: en "who is the book given by the woman to?", it "a chi è
dato dalla donna il libro?", fr "à qui est-ce que le livre est donné par la femme ?", de "wem wird das
Buch von der Frau gegeben?", es "¿a quién es dado el libro por la mujer?", pt "a quem o livro é dado
pela mulher?". The Japanese statement, the active question (女は誰に本をあげますか？) and the agentless
passive question are right too.

**Shape of the fix.** In
[ja/buildClauseSegments.ts](../../../packages/engine/src/languages/ja/buildClauseSegments.ts), the
agent's particle is chosen by `jaAgentParticle(phrase.complements)` (about L110). The asked slot is
merged into the complements only later, for `predicateSegs` (about L183), so `jaAgentParticle` never
sees the terminus. Pass it the complements with the asked slot already merged in (`askedSlot` /
`askedNoun`), or merge them once ahead of both uses. The trial fix did the first.

Pinned by `known bugs: a Japanese passive terminus question doubles に (A280)` in
[questions.test.ts](../../../packages/engine/test/questions.test.ts).

Found by the P09-E16 coverage audit on 2026-09-24.

## Resolved

2026-09-24. [ja/buildClauseSegments.ts](../../../packages/engine/src/languages/ja/buildClauseSegments.ts)
merges the asked complement slot into the complements once, ahead of the agent, so
`jaAgentParticle` sees the asked recipient and gives the agent によって; `predicateSegs` takes the
same merged complements. Both Want strings render, and the past (本は女によって誰にあげられましたか？)
with them.

Guarded by `known bugs: a Japanese passive terminus question doubles に (A280)` in
[questions.test.ts](../../../packages/engine/test/questions.test.ts): the two former `test.fails`,
the regression test, and a new test for the past and for an asked agent beside a stated recipient
(本は誰によって男にあげられますか？).
