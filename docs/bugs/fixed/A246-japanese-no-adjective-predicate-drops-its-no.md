# A246. A Japanese の-adjective drops its の as a predicate, and says the noun instead

**Language:** Japanese

[`jaAdjClass`](../../../packages/engine/src/languages/ja/jaAdjClass.ts) strips の before the copula,
which is right for a colour (茶色の猫 → 猫は茶色です) and wrong for an adjective that **relates its
subject to a proper noun**: AMERICAN is アメリカの, and without の the predicate says the country.

| Case | Now | Want |
|---|---|---|
| the CAT IS AMERICAN | `猫はアメリカです。` | `猫はアメリカのです。` |

"猫はアメリカです" reads "the cat is America". The seeded **FEMALE** has the same shape (女性の →
猫は女性です), where it happens to read acceptably, which is why the class rule survived until a
country adjective was seeded.

**Already right.** The attributive is correct (アメリカの猫), and the other six languages predicate the
adjective properly (`the cat is American.`, `il gatto è americano.`, `der Kater ist amerikanisch.`,
`el gato es estadounidense.`).

**Nothing shipped shows it**: AMERICAN is literal by design
([B66](../../localization/done/B66-core-adjectives.md)), so it heads no gloss.

Pinned by `known bugs: AMERICAN as a Japanese predicate (A246)` in
[core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts),
which also pins what it renders today.

Found seeding AMERICAN for [B66](../../localization/done/B66-core-adjectives.md).

## Resolved

2026-09-22. The Japanese lexeme can now say **`relational`** — the の links its subject to another
thing rather than naming a property of it — and AMERICAN says it in
[adjectives.ts](../../../packages/backend/src/concepts/adjectives.ts).
[`jaAdjClass`](../../../packages/engine/src/languages/ja/jaAdjClass.ts) takes the flag and returns a
new field beside `attributive`: **`predicative`**, the particle the copula keeps in front of it, `の`
for a relational の-adjective and `''` for everything else — so the attributive form is untouched
either way (アメリカの猫). [`copulaSegs`](../../../packages/engine/src/languages/ja/copulaSegs.ts)
prefixes it to the copula ending, and
[`predicateLinkSegs`](../../../packages/engine/src/languages/ja/predicateLinkSegs.ts) and
[`jaComparisonAdj`](../../../packages/engine/src/languages/ja/jaComparisonAdj.ts) do the same for the
coordinated predicate and the lowered degree, which are the same position one step away.

Renders the Want column: `猫はアメリカのです。`, and the particle survives the negative
(アメリカのではありません), the past (アメリカのでした) and a modal (アメリカのである必要があります).

A colour and FEMALE name no flag and drop their の as before (猫は茶色です, 猫は女性です).

Guarded by *known bugs: AMERICAN as a Japanese predicate (A246)* in
[core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts),
now four tests (the "what it renders now" pin is gone, since the fix moved it): the Want row, the
negative / past / modal frames, a regression over the attributive and three unmarked adjectives, and
a regression over the other six languages. Two colocated cases were added to
[jaAdjClass.test.ts](../../../packages/engine/src/languages/ja/jaAdjClass.test.ts).
