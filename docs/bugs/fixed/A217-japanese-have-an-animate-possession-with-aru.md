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

## Resolved

**2026-09-22.** Took the trial's shape. In
[`predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts) the existential verb
follows what exists. For a possessive existential that is the thing possessed: the new optional
`animateObject`, or else `isAnimate` of the direct object. For BE it is still the subject
(`animateSubject`). The "if" clause, the modal chain, the negative and the relative clause all
compose on the chosen verb.

The relative clause on the thing possessed has no object left, because the head fills that gap.
[`relativeClauseSegs`](../../../packages/engine/src/languages/ja/relativeClauseSegs.ts) passes
`isAnimate([np])` as `animateObject` when `rel.headRole === 'directObject'`. The trial describes this
as [`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts) passing it. In this tree `npSegs`
reaches the predicate only through `relativeClauseSegs`, which holds both the head and the call.

**The UI string moves, as ruled.** `diagnostic.noNounHasPossessor` now renders
`どの名詞も所有者がいません` (it was `どの名詞も所有者がありません`), because POSSESSOR is seeded
`animate: true`. `console-diagnostics.test.ts` was updated. No hardcoded Japanese form of it exists in
`packages/frontend/src`, `packages/shared/src` or `e2e/`: the shared entry's `fallback` is the
English `No noun has a possessor`, and the frontend reaches it only through the key. The whole
suite shows no other concept definition or UI string moving.

- **Tests:** [`packages/engine/test/possession.test.ts`](../../../packages/engine/test/possession.test.ts)
  → *known bugs: Japanese HAVE says an animate possession with ある*. The pinning `test.fails` is now a
  passing `test`, with its assertions unchanged, and the regression test is unchanged. A new case
  covers a pronoun (`家は私がいます`), a quantified plural, a `no` object (`家はどの猫もいません`), a
  question, the resultative, a relative clause on the owner (`猫がいる家`, `壁がある家`), one on the
  thing possessed, animate and not and negated (`家にある壁`, `家にいない人`), and BE with an
  inanimate subject (`本は家にあります`).
- **Unit tests:** `ja/predicateSegs.test.ts` covers an animate thing possessed in the polite, the
  past negative and the たら forms, `animateObject` for a gapped object, and BE ignoring it.
  `ja/relativeClauseSegs.test.ts` covers an animate head the owner has (`家にいる`) and a relative on
  the owner (`猫がいる`).
- **UI string:** [`packages/engine/test/console-diagnostics.test.ts`](../../../packages/engine/test/console-diagnostics.test.ts)
  → `diagnostic.noNounHasPossessor`, ja `どの名詞も所有者がありません` → `どの名詞も所有者がいません`.
