# A345. A Japanese negated predicate before まで and 前に is not a change of state

**Languages:** Japanese

[A323](../fixed/A323-japanese-na-adjective-predicate-takes-na-before-made-and-mae-ni.md) ruled that
the limit an until-clause names is a state reached: before まで and 前に the predicate is 〜になる
(幸せになるまで, 大きくなるまで, 友達になるまで). Its fix left the negative in its prenominal form, which
reads as a state holding, not reached: 犬が幸せではないまで. The negated state reached is
〜でなくなる / 〜くなくなる, "until the dog stops being happy".

| Case | Now | Want |
|---|---|---|
| the CAT RUNs until the DOG is not HAPPY | 猫は犬が幸せではないまで走ります。 | 猫は犬が幸せでなくなるまで走ります。 |
| … before the DOG is not HAPPY | 猫は犬が幸せではない前に走ります。 | 猫は犬が幸せでなくなる前に走ります。 |
| … until the DOG is not BIG (い-adjective) | 猫は犬が大きくないまで走ります。 | 猫は犬が大きくなくなるまで走ります。 |
| … until the DOG is not a FRIEND (noun) | 猫は犬が友達ではないまで走ります。 | 猫は犬が友達でなくなるまで走ります。 |

**Already right.** The affirmative (幸せになるまで, A323). The other conjunctions keep the plain
negative (幸せではない時に), which is a state holding and right there. The other six (`until the dog
is not happy`, `bis der Hund nicht glücklich ist`).

## Shape of the fix

The `reach` form A323 added in [ja/copulaSegs.ts](../../../packages/engine/src/languages/ja/copulaSegs.ts)
borrows the prenominal row in every negative cell. The negative cell should be the change of state
of the negative: the adverbial-stem negative (でなく / くなく) + なる, with なる taking the clause's
tense as the affirmative's does.

**Decisions for the fixer:**

- **A negated ている state** (犬が疲れていないまで, the TIRED row of A346 negated). 疲れなくなるまで is the
  literal change; whether it reads well enough is the fixer's call. Not pinned.

| | |
|---|---|
| **Test** | `adverbial-clause.test.ts` → *known bugs: a Japanese negated predicate before まで and 前に is not a change of state (A345)* (2 `test.fails`: the な-adjective under まで and 前に, the い-adjective and the noun; plus a regression test for the affirmative, 時に and the other six) |

Found by the lanes and the cross-lane probe while fixing A278–A338, 2026-09-24.
