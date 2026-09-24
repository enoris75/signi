# A323. A Japanese な-adjective predicate takes な before まで and 前に

**Languages:** Japanese

Japanese まで (*until*, P09-E27) and 前に (*before*, P09-E4) follow the clause's predicate in its plain
non-past form: 犬が食べるまで, 犬が食べる前に. A な-adjective predicate takes the attributive な instead,
which only goes before a noun: 誰かが大丈夫なまで, 犬が幸せなまで, 犬が幸せな前に. な before まで is
ungrammatical. The plain form of a な-adjective predicate is 〜だ / 〜である. But *until* and *before* name
a state that is reached, and Japanese says that with 〜になる: 大丈夫になるまで, 幸せになる前に.

| Case | Now | Want (recommended ruling) |
|---|---|---|
| the CAT RUNs until SOMEONE is OKAY | 猫は誰かが大丈夫なまで走ります。 | 猫は誰かが大丈夫になるまで走ります。 |
| the CAT RUNs until the DOG is HAPPY | 猫は犬が幸せなまで走ります。 | 猫は犬が幸せになるまで走ります。 |
| … in the past | 猫は犬が幸せなまで走りました。 | 猫は犬が幸せになるまで走りました。 |
| the CAT RUNs before the DOG is HAPPY | 猫は犬が幸せな前に走ります。 | 猫は犬が幸せになる前に走ります。 |

**Related, not pinned.** An い-adjective gives 犬が大きいまで (grammatical but odd, 大きくなるまで is
natural). A noun predicate gives 犬が友達であるまで (grammatical, 友達になるまで is natural). A 〜ている
state verb gives 犬が疲れているまで (疲れるまで is natural). These are the same ruling (state reached, or
state holding) without the な error. Take them along if the ruling is 〜になる.

**Already right.** A verb before まで and 前に (犬が食べるまで). The other six (`until the dog is happy`,
`finché il cane non è felice`, `jusqu'à ce que le chien soit heureux`, `bis der Hund glücklich ist`,
`hasta que el perro esté feliz`, `até que o cão esteja feliz`).

**Found by** the lanes landing P09-E27 (until), re-verified at 48af1d35. [A278](A278-japanese-na-adjective-keeps-na-before-the-indirect-question-ka.md)
is the same な leak before the indirect question's か.

## Decisions for the fixer

- **になる or である.** *until* marks the end of the running at the moment the state starts, so the
  recommended ruling is 〜になるまで / 〜になる前に, the change of state. 〜であるまで is the literal "until it
  is", grammatical and stiff. The pins assert になる. Change them with the ruling.
- **Where.** The clause-final form comes from the adverbial clause's conjunction table
  ([ja.consts.ts](../../../packages/engine/src/languages/ja/ja.consts.ts), `until: { noun: '',
  particle: 'まで' }`) and the form it asks the predicate for. A278's fix (な → である before か) may share
  a helper with this one: "the plain form of a な-adjective predicate before a particle".

| | |
|---|---|
| **Test** | `adverbial-clause.test.ts` → *known bugs: a Japanese な-adjective predicate takes な before まで and 前に (A323)* (4 `test.fails`, one per row, plus a regression test for a verb and the other six) |

## Resolved

2026-09-24, at the recommended ruling (〜になる). まで and 前に carry `reach` in `JA_SUBORDINATORS`
([ja.consts.ts](../../../packages/engine/src/languages/ja/ja.consts.ts)), which
[`shapeAdverbialClause.ts`](../../../packages/engine/src/languages/ja/shapeAdverbialClause.ts) passes on
and [`buildClauseSegments.ts`](../../../packages/engine/src/languages/ja/buildClauseSegments.ts) turns into
the plain value `'reach'` (`JaPlain`, [predicateSegs.ts](../../../packages/engine/src/languages/ja/predicateSegs.ts)).
The copula takes a matching `reach` form in [copulaSegs.ts](../../../packages/engine/src/languages/ja/copulaSegs.ts),
sharing A278's row-borrowing: prenominal in every cell except the affirmative, which is the change of
state on an い-adjective, a な/の-adjective or a noun (大きくなる, 幸せになる, 友達になる). The related
い-adjective and noun rows are taken along. The negative (幸せではないまで) and a 〜ている state
(疲れているまで) keep their prenominal forms; the other conjunctions (幸せな時に, 幸せなので,
幸せだった後で) are unchanged.

Guarded by the four formerly-`test.fails` in `known bugs: a Japanese な-adjective predicate takes な before
まで and 前に (A323)` in [adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts),
now plain tests, plus two new ones there (大きくなるまで / 大きくなる前に / 友達になるまで, and the other
conjunctions' regression), and the `reach` case in
[copulaSegs.test.ts](../../../packages/engine/src/languages/ja/copulaSegs.test.ts).
