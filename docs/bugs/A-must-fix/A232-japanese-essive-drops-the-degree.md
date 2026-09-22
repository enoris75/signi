# A232. The Japanese essive drops an adjective head's degree

**Language:** Japanese

[A224](../fixed/A224-japanese-na-adjective-before-toshite.md) made the essive として take a
na-adjective's stem (幸せとして). That branch writes the stem alone, so a degree the adjective was given
is lost: "sees the house as happier" is 幸せとして, the positive. The factitive branch of
[`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts) writes the degree word
(`JA_DEGREE`) ahead of the adjective (もっと幸せに), and the other six languages compare it. The path
before A224 (`elSegs`) dropped it too.

| Case | Now | Want |
|---|---|---|
| the CAT SEEs the HOUSE as HAPPY (more) | `猫は家を幸せとして見ます。` | `猫は家をもっと幸せとして見ます。` |
| … as BROWN (most) | `猫は家を茶色として見ます。` | `猫は家を最も茶色として見ます。` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The factitive (`猫は家をもっと幸せに作ります。`, `猫は家を最も幸せに作ります。`) and the
positive essive (`猫は家を幸せとして見ます。`). The other six (`the cat sees the house as happier.`, `der
Kater sieht das Haus als glücklicher.`, `il gatto vede la casa come più felice.`).

Found by the lane that fixed A224.

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green, and no passing test moves.

In the essive branch of `complementSegs`, push `JA_DEGREE[adjDegree(head)]` ahead of the na-adjective's
stem when there is one, as the factitive branch does.

**Decisions for the fixer:**

- **"less".** The trial gives `それほど有効として`, and それほど wants a negative after it. The factitive
  says the less degree with a negated form (`それほど幸せではなく`), which has no essive counterpart.
  Not pinned.
- **An i-adjective** (`大きいとして`) drops the degree too. Its essive reading is itself open (A224's
  decisions), so it is not pinned.

| | |
|---|---|
| **Test** | `complements/objectPredicative.test.ts` → *known bugs: the Japanese essive drops an adjective head's degree (A232)* (1 `test.fails`, plus a regression test for the factitive, the positive essive and the other six) |
