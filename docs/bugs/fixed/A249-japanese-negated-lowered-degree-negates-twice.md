# A249. Japanese negates a negated lowered degree twice

**Language:** Japanese

Japanese has no word for *less*: the engine renders a lowered degree as a negated predicate,
それほど大きくない ("not that big") or, with a standard, 犬ほど大きくない ("not as big as the dog")
([A10](../fixed/A10-japanese-degree-least-less.md), P09-E5). A negated clause then negates that
predicate a second time, and the two stack into 〜なくない.

| Case | Now | Want |
|---|---|---|
| the CAT is not BIG (less) | `猫はそれほど大きくなくないです。` | `猫はそれほど大きくないわけではありません。` |
| … than the DOG | `猫は犬ほど大きくなくないです。` | `猫は犬ほど大きくないわけではありません。` |
| … in the past | `猫はそれほど大きくなくなかったです。` | `猫はそれほど大きくないわけではありませんでした。` |

**Why this target.** 大きくなくない is colloquial litotes ("not un-big") and nothing a polite
sentence says; 大きくなくないです reads as a mistake. The plan means "it is not the case that the cat is
less big" — the clause negation denies the proposition the lowered degree states, so it belongs
**over** that proposition, not inside the predicate that already carries a ない. Japanese says a
propositional negation with わけではない, and the engine gives a negated noun predicate the polite
ではありません (猫は犬ではありません。), so the polite form is わけではありません. The alternatives
are worse: 大きくなくはない is still a stacked negative, and dropping either negation says the
opposite of the plan. Truth-conditionally 犬ほど大きくないわけではない is exactly "not less big than the
dog". The **Want** column is written by hand.

**Already right.** The affirmative lowered degree (`猫はそれほど大きくないです。`,
`猫は犬ほど大きくないです。`), and the six European languages, where "not less big" is a plain
negation (`the cat is not less big than the dog.`, `il gatto non è meno grande del cane.`).

**Shape of the fix.** Where the Japanese predicate builder
([`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts)) sees a clause negation
on a head whose degree is `less`, it keeps the lowered predicate as it is
(大きくない) and closes it with わけではありません / わけではありませんでした instead of negating the adjective.
A relative clause takes the plain わけではない.

**Nothing shipped shows it**: no gloss negates a lowered degree.

Pinned by `known bugs: Japanese negates a lowered degree twice (A249)` in
[comparison.test.ts](../../../packages/engine/test/comparison.test.ts).

Found shipping [P09-E5](../../features/P-planning/P09-core-vocabulary/P09-E5-standard-of-comparison.md),
the standard of comparison.

## Resolved

2026-09-23. [`copulaSegs.ts`](../../../packages/engine/src/languages/ja/copulaSegs.ts) now closes a
negated lowered degree (`less`, and `least` alike, through `isLoweredDegree`) on わけ and the negated
copula of its form, keeping the lowered predicate in its plain present: 猫は犬ほど大きくないわけではありません。
(past わけではありませんでした), and in a relative clause 犬ほど大きくないわけではない猫 (past わけではなかった).
The na- and た-adjectives take the same closing (それほど幸せではないわけではありません,
それほど疲れていないわけではありません). A negated plain or raised degree still negates the adjective once
(大きくないです, 犬より大きくないです).

Guarded by the three formerly-`.fails` tests in `known bugs: Japanese negates a lowered degree twice
(A249)` in [comparison.test.ts](../../../packages/engine/test/comparison.test.ts), now plain tests,
plus new cases there for the past with a standard, the relative clause (present and past), the other
adjective classes and a regression guard for the negated plain / `more` degree; and a unit case in
[copulaSegs.test.ts](../../../packages/engine/src/languages/ja/copulaSegs.test.ts) covering the
polite and prenominal forms in both tenses.
