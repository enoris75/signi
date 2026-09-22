# A217. Japanese HAVE says an animate possession with ある

**Language:** Japanese

[A150](../fixed/A150-japanese-inanimate-owner-aru.md) made HAVE with an inanimate owner the
existential: *家は壁があります*, "the house has walls", the thing possessed marked が. The existential
verb follows **what exists**. Under HAVE that is the thing possessed, not the owner: ある for a thing,
いる for a person or an animal. *この家には猫がいます* is how Japanese says the house has a cat.
*猫があります* treats the cat as an object.

[`predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts) picks the existential
verb from `animateSubject`. That is right for BE, where the subject is what exists (*猫は家にいます*).
For a possessive existential the subject is the owner, which is inanimate by definition, since
otherwise HAVE keeps 持つ. So the engine always writes ある.

| Case | Now | Want |
|---|---|---|
| HOUSE HAVE CAT | `家は猫があります。` | `家は猫がいます。` |
| … CATS (`bare`), past, negative | `家は猫がありませんでした。` | `家は猫がいませんでした。` |
| … a PERSON, MUST | `家は人がある必要があります。` | `家は人がいる必要があります。` |
| "if" clause | `もし家に猫があったら、犬は走ります。` | `もし家に猫がいたら、犬は走ります。` |
| relative clause, the CAT that the HOUSE HAS | `家にある猫は走ります。` | `家にいる猫は走ります。` |
| the random phrase | `熱いフレーズは猫がもう一度あります。` | `熱いフレーズは猫がもう一度います。` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** A thing possessed (`家は壁があります。`). An animate owner, which keeps 持つ (`猫は本を
持っています。`). BE, which already chooses by its subject (`猫は家にいます。`). The other six languages
have one verb for both.

Found by the random phrase "the hot phrase has the cats again." (seed 942845): `熱いフレーズは猫がもう
一度あります。`.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine suite green, except for the one pinned UI string named below.

In `predicateSegs`, choose the existential verb from the thing that exists: the object's animacy for
a possessive existential, the subject's for BE.

```ts
verb: (possessive ? animateObject ?? (directObject !== undefined && isAnimate(directObject.conjuncts)) : animateSubject) ? JA_IRU : JA_ARU,
```

The relative clause on the thing possessed has no object left, because the head fills that gap. So
the trial gave `predicateSegs` an optional `animateObject`, which
[`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts) passes as `isAnimate([np])` when
`rel.headRole === 'directObject'`. The "if" clause and the modal chain compose on the chosen verb.

**Decision for the fixer: one UI string changes.** `diagnostic.noNounHasPossessor` ("No noun has a
possessor") renders `どの名詞も所有者がありません` today and `どの名詞も所有者がいません` after the fix,
because POSSESSOR is seeded `animate: true`. `console-diagnostics.test.ts` pins the current form. For
an owner, いる is the regular choice, so the expected fix updates that assertion. If POSSESSOR as a
*grammar* term should read as a thing, that belongs to its seed (`animate`), not to this rule. Across
all 751 concept definitions and UI strings, no other rendering changes in any language.

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: Japanese HAVE says an animate possession with ある* (1 `test.fails`, plus a regression test for a thing possessed, an animate owner, BE and English) |
