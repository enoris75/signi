# A258. Japanese VERY on a lowered degree says とてもそれほど大きくない

**Languages:** Japanese

Japanese's lowered degree is a negated positive (それほど大きくない, 犬ほど大きくない), and
[`jaDegreeSegs`](../../../packages/engine/src/languages/ja/jaDegreeSegs.ts) writes the intensifier in
front of the degree adverb as for any degree, so VERY stands inside the negation. An adverb inside a
negation reads "not very" (とても大きくない), the opposite of "much less big". A248 left this case on
とても on purpose (its `comparative_degrees` names only `more` for Japanese), and `jaDegreeSegs`'s
comment cites the output as an example; neither says it is right.

| Case | Now | Want |
|---|---|---|
| the CAT BE VERY BIG (less) | `猫はとてもそれほど大きくないです。` | `猫はそれほど大きくないです。` |
| … than the DOG | `猫は犬ほどとても大きくないです。` | `猫は犬ほど大きくないです。` |
| a VERY BIG (less) CAT RUNs | `とてもそれほど大きくない猫は走ります。` | `それほど大きくない猫は走ります。` |

The **Want** column is written by hand, and it is a judgment call. Japanese has no intensifier that
scopes over the lowering: ずっと only intensifies a raised comparative, and 全然 (犬ほど全然大きくない,
"nowhere near as big") says more than "much less" and turns a bare lowered degree into "not big at all".
The lowered degree alone is the closest faithful rendering, so VERY is dropped — as the degree adverb
already is under a comparative intensifier, the other way round.

**Already right.** The other six (`the cat is much less big.`, `der Kater ist viel weniger groß.`,
A248), and VERY on the positive (`猫はとても大きいです。`).

**Shape of the fix.** In `jaDegreeSegs` and the attributive path in
[`npSegs`](../../../packages/engine/src/languages/ja/npSegs.ts), a `less` degree drops the
intensifier; or VERY's Japanese lexeme names an empty word for the lowered degree, which
`applyIntensifier` reads as it reads `comparative`.

**Nothing shipped shows it**: no gloss intensifies a lowered degree.

Pinned by `known bugs: Japanese VERY on a lowered degree (A258)` in
[intensifiers.test.ts](../../../packages/engine/test/intensifiers.test.ts).

Found fixing A248 and A249, the intensifier on a comparative and the Japanese lowered degree.
