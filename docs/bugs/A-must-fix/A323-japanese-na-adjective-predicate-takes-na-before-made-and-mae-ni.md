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
