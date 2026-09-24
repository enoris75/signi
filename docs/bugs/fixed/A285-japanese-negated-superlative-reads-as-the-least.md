# A285. Japanese reads a negated superlative as the least

**Languages:** Japanese

Japanese has no word for *least*: the engine negates the superlative, 最も大きくない ("the least
big") ([A10](../fixed/A10-japanese-degree-least-less.md)). A negated clause over `most` negates the
adjective the same way, so "the cat is **not the biggest**" comes out byte for byte as "the cat is
**the least big**". With the superlative set of
[P09-E19](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E19-superlative-partitive.md) the
two collide in full sentences: 猫は動物の中で最も大きくないです is pinned as the affirmative `least`
row in comparison.test.ts.

| Case | Now | Want |
|---|---|---|
| the CAT BE not BIG (`most`, set the ANIMALs) | `猫は動物の中で最も大きくないです。` | `猫は動物の中で最も大きいわけではありません。` |
| the CAT BE not BIG (`most`) | `猫は最も大きくないです。` | `猫は最も大きいわけではありません。` |
| … in the past, with the set | `猫は動物の中で最も大きくなかったです。` | `猫は動物の中で最も大きいわけではありませんでした。` |

**Why this target.** "Not the biggest" denies the superlative proposition (someone else is
bigger); it does not say the cat is at the bottom. Japanese puts that negation over the proposition
with わけではない, and [A249](../fixed/A249-japanese-negated-lowered-degree-negates-twice.md) already
uses it, in the same polite form, for a negated lowered degree (それほど大きくないわけではありません). The
affirmative predicate stays as it is (最も大きい) and the negated copula carries the tense. The other
common way, 一番大きくはありません, would bring in 一番 where the engine says 最も everywhere else, and
its contrastive は is a softer reading of the same thing. The Want strings were rendered by applying
the fix below to a throwaway copy of the tree.

**Already right.** The six European languages negate the clause: `the cat is not the biggest of the
animals.`, `il gatto non è il più grande degli animali.`, `le chat n'est pas le plus grand des
animaux.`, `der Kater ist nicht das größte der Tiere.`, `el gato no es el más grande de los
animales.`, `o gato não é o maior dos animais.`. The affirmative `least` (`猫は動物の中で最も大きくないです。`)
and the negated `least`, which A249 already closes on わけ (`猫は動物の中で最も大きくないわけではありません。`),
are right.

**Shape of the fix.** In [`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts),
beside A249's `negative && isLoweredDegree(head.head)` branch: a negated head at `most` keeps its
affirmative plain predicate and closes on `わけ` + the negated copula of its form (わけではありません,
past わけではありませんでした; a relative clause the plain わけではない). Doing this for i-adjectives
gives all three Want strings and breaks no other test.

**Not settled here:** the na-adjective. The negated HAPPY at `most` is `猫は最も幸せではありません。`,
and its affirmative `least` is `猫は最も幸せではないです。`: they differ, but only in the polite form of the
negated copula, which no reader takes as a difference in meaning. The fixer should decide whether to
bring it under わけ too (最も幸せなわけではありません, built on the prenominal な the engine already gives
最も幸せな猫; not rendered, not pinned). If so, the branch should build each class's prenominal form
rather than hard-code い.

Pinned by `known bugs: Japanese reads a negated superlative as the least (A285)` in
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts).

Found on 2026-09-24 while auditing P09-E19's test coverage.

## Resolved

2026-09-24. [ja/copulaSegs.ts](../../../packages/engine/src/languages/ja/copulaSegs.ts): a negated
adjective predicate at `most` keeps its affirmative superlative in the prenominal form and closes on
わけ + the negated copula of its form, beside A249's lowered-degree branch. The na-adjective is
brought under わけ too, as the bug file allowed: the branch builds each class's prenominal form
(最も大きい, 最も幸せな, 最も疲れている) rather than hard-coding い, so the negated HAPPY at `most` is now
猫は最も幸せなわけではありません。 and no longer sits one polite ending away from the affirmative least
(猫は最も幸せではないです。, unchanged). A relative clause takes the plain わけではない / わけではなかった.

Guarded by `known bugs: Japanese reads a negated superlative as the least (A285)` in
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts): the three former
`test.fails`, the regression test, and new tests for the na- and た-adjective classes, the relative
clause (now and past), and the unchanged negated least and affirmative most.
