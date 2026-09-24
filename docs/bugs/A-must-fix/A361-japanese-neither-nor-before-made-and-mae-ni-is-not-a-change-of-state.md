# A361. A Japanese "neither … nor" before まで and 前に is not a change of state

**Languages:** Japanese

[A345](../fixed/A345-japanese-negated-predicate-before-made-and-mae-ni-is-not-a-change-of-state.md)
made a negated predicate before まで and 前に the change of state of the negative (幸せでなくなるまで,
大きくなくなるまで), after [A323](../fixed/A323-japanese-na-adjective-predicate-takes-na-before-made-and-mae-ni.md)'s
ruling that the limit such a clause names is a state reached. Its resolution names what it did not
touch: a negated coordination ("neither … nor", B12) keeps its prenominal form, which reads as a
state holding: 犬が大きくも幸せでもないまで. The coordination reached is 〜も〜もなくなる, "until the dog
is neither big nor happy any more".

| Case | Now | Want |
|---|---|---|
| the CAT RUNs until the DOG is not BIG and HAPPY | 猫は犬が大きくも幸せでもないまで走ります。 | 猫は犬が大きくも幸せでもなくなるまで走ります。 |
| … before the DOG is not BIG and HAPPY | 猫は犬が大きくも幸せでもない前に走ります。 | 猫は犬が大きくも幸せでもなくなる前に走ります。 |
| … until the DOG is not a FRIEND and a LEGEND | 猫は犬が友達でも伝説でもないまで走ります。 | 猫は犬が友達でも伝説でもなくなるまで走ります。 |

**Already right.** The affirmative coordination (大きくて幸せになるまで). 時に keeps the plain negative
(大きくも幸せでもない時に), a state holding, which is right there. The other six (`until the dog is
not big and happy`, `bis der Hund nicht groß und glücklich ist`).

## Shape of the fix

The coordinated branch of [ja/copulaSegs.ts](../../../packages/engine/src/languages/ja/copulaSegs.ts)
closes a negation on the `NEITHER` / `STATE_NEITHER` / `RU_NEITHER` tail of `row(form)`, and `row`
maps `reach` to `prenominal`. Under `reach` the tail should be the change of state of that negative,
its ない stem + くなる (ない → なくなる). The Want strings were rendered by applying exactly that to a
throwaway copy of the tree; the rest of `adverbial-clause.test.ts` stayed green.

**Decisions for the fixer:**

- **A ている or a verb conjunct last.** The same change gives 大きくも疲れてもいなくなるまで and
  〜すぎも〜すぎもしなくなるまで. A345 ruled a single negated ている state goes the verb's way
  (疲れなくなるまで); whether the coordination follows (大きくも疲れもしなくなる?) or keeps the literal
  いなくなる is the fixer's call. Not pinned.
- **A negated lowered degree or superlative** (the other half of what A345 left). Now
  猫は犬がそれほど大きくないわけではないまで走ります。 and 猫は犬が最も大きいわけではないまで走ります。 (and 前に,
  and 最も幸せなわけではないまで). The mechanical change of state is 〜わけではなくなる (or
  〜わけでなくなる, as A345 dropped the は of 幸せではない), which is grammatical but stiff, and for the
  lowered degree ("until the dog is not less big") hardly a sentence anyone says. A285's reason for
  わけ rules out 最も大きくなくなる (it reads as the least). Pick one, or rule that these keep their
  prenominal わけではない. Not pinned.

| | |
|---|---|
| **Test** | `adverbial-clause.test.ts` → *known bugs: a Japanese "neither … nor" before まで and 前に is not a change of state (A361)* (2 `test.fails`: the い- and な-adjective pair under まで and 前に, the noun pair; plus a regression test for the affirmative, 時に and the other six) |

Found from A345's resolution (its "Not touched" list), 2026-09-24.
