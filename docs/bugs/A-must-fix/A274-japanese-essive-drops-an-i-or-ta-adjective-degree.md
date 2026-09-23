# A274. The Japanese essive drops an i- or た-adjective's degree

**Language:** Japanese

[A232](../fixed/A232-japanese-essive-drops-the-degree.md) gave the essive として a na-adjective's degree
(もっと幸せとして). It did that only in the na-adjective branch of
[`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts). An i- or た-adjective
falls through to `elSegs`, which writes the adjective as it stands and leaves out the degree word. So
"sees the house as bigger" comes out as 大きいとして, the positive. The other six languages compare it,
and Japanese writes the same degree in the factitive (もっと大きく作ります) and in the attributive
(もっと大きい家).

| Case | Now | Want |
|---|---|---|
| the CAT SEEs the HOUSE as BIG (more) | `猫は家を大きいとして見ます。` | `猫は家をもっと大きいとして見ます。` |
| … (most) | `猫は家を大きいとして見ます。` | `猫は家を最も大きいとして見ます。` |
| … (equally) | `猫は家を大きいとして見ます。` | `猫は家を同じくらい大きいとして見ます。` |
| … as TIRED (more) | `猫は家を疲れたとして見ます。` | `猫は家をもっと疲れたとして見ます。` |

**Not a regression: a gap A232 left on purpose.** A232's decisions say it outright: "An i-adjective
(`大きいとして`) drops the degree too. Its essive reading is itself open (A224's decisions), so it is not
pinned." Its Resolved section repeats it. A224 had ruled that `大きいとして` and `疲れたとして` read as
"assuming it is big / tired". It said the essive reading may want a noun to hang on (大きいものとして) or
another frame (大きいと見る), and left that open. This file does not decide that open question. It
records the degree, which is lost whatever the frame. The degree word stands ahead of the adjective
here as it does in every other Japanese slot. If the frame changes, the degree goes with it
(もっと大きいものとして).

**Already right.** The positive (`大きいとして`, as it stands), a na-adjective's degree
(`もっと幸せとして`), the factitive (`もっと大きく作ります`) and the other six (`as bigger`, `als größer`,
`come più grande`). The lowered degrees ("less", "least") stay out, as A232 ruled, because それほど and
最も want a negated adjective that として has no form for.

**Shape of the fix.** In the essive branch of `complementSegs`, push `JA_DEGREE[adjDegree(head)]`
ahead of a lone i- or た-adjective too, leaving out the lowered degrees. That is the na-branch's own
line, applied before `elSegs`.

**Nothing shipped shows it**: no gloss has a compared essive.

Pinned by `known bugs: the Japanese essive drops an i- or た-adjective's degree (A274)` in
[objectPredicative.test.ts](../../../packages/engine/test/complements/objectPredicative.test.ts).

Found while filing A265–A272 (the A269 essive probe).
