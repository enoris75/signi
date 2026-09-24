# A331. Japanese compounds a count of one onto 兄弟

**Languages:** Japanese

P11-E5 made the lexemes 兄弟 and 姉妹 (`counter_join: 'compound'`) compound straight onto their
count: 三人兄弟, 二人姉妹. The compound says **how many siblings a family has**, so it needs at least
two. There is no one-person 一人兄弟 or 一人姉妹 (an only child is 一人っ子). Yet
[`jaCounted`](../../../packages/engine/src/languages/ja/jaCounted.ts) compounds any count, one
included. At one, the count should link with の like every other counted phrase: 一人の兄弟, *one
sibling*.

| Case | Now | Want |
|---|---|---|
| I BE one (`indefinite`) SIBLING | `私は一人兄弟です。` | `私は一人の兄弟です。` |
| I BE one BROTHER | `私は一人兄弟です。` | `私は一人の兄弟です。` |
| I (fem) BE one SISTER | `私は一人姉妹です。` | `私は一人の姉妹です。` |
| one SIBLING RUNs | `一人兄弟は走ります。` | `一人の兄弟は走ります。` |

**Why this target.** 一人の + noun is what `jaCounted` writes for every word that does not compound,
the kin word いとこ included: *私は一人のいとこです。* Every Want was verified by applying the fix
below to a throwaway copy of the packages.

**Already right.** 二人兄弟, 三人兄弟, 三人姉妹, 四人姉妹 and 十人兄弟 compound as they should. The
other six languages count one sibling with their own article-numeral: en *I am one sibling.*, it
*sono un fratello.*, fr *je suis un frère.*, de *ich bin ein Geschwister.*, es *soy un hermano.*, pt
*sou um irmão.*

**Found by** the P11-E5 coverage audit.

## Shape of the fix

In `jaCounted`, compound only when the count is above one:

```ts
const compound = join === 'compound' && forms['numeral'] !== '1' && np.adjectives.length === 0 && isCitationWord(forms);
```

This is the change the Wants were rendered with. The fixer should decide whether the rule belongs in
code, as a count of one, or in the lexeme, as a minimum count on `counter_join`. It is the same for
兄弟 and 姉妹, and FAMILY (三人家族, which is a family *of* three) was left out of the compound
anyway, so code is the smaller change.

**Not settled here:** whether "I am one sibling" is a phrase anyone composes. The fix only keeps it
from producing a non-word.

Pinned by `known bugs: Japanese compounds a count of one onto 兄弟 (A331)` in
[counted-relatives.test.ts](../../../packages/engine/test/counted-relatives.test.ts).

Found on 2026-09-24 while landing the P11-E4 / P11-E5 coverage audit.
