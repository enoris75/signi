# A245. A Japanese の-adjective drops its の as a predicate, and says the noun instead

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

Pinned by `known bugs: AMERICAN as a Japanese predicate (A245)` in
[core-adjectives-and-adverbs.test.ts](../../../packages/engine/test/core-adjectives-and-adverbs.test.ts),
which also pins what it renders today.

Found seeding AMERICAN for [B66](../../localization/done/B66-core-adjectives.md).
