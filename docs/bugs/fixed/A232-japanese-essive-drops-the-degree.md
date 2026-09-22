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

## Resolved

**2026-09-22**, with the trial above.

- [`ja/complementSegs.ts`](../../../packages/engine/src/languages/ja/complementSegs.ts) — in the
  essive branch, a na-adjective (or a noun-adjective linked by の) pushes `JA_DEGREE[adjDegree(head)]`
  ahead of its stem, as the factitive branch does: `猫は家をもっと幸せとして見ます。`,
  `猫は家を最も茶色として見ます。`, `猫は家を同じくらい幸せとして見ます。`.

The decisions stayed as ruled. The lowered degrees (`isLoweredDegree`: "less", "least") still drop
the degree, with a comment saying why: それほど and 最も want a negated adjective there, which the
factitive spells ではなく and として has no counterpart for. They are not pinned. The i-adjective
(`大きいとして`) is left as it was and not pinned. No passing test moved.

| | |
|---|---|
| **Tests** | `complements/objectPredicative.test.ts` → *known bugs: the Japanese essive drops an adjective head's degree (A232)*, the `test.fails` now passing, plus an added case: the equal degree (同じくらい幸せとして), another na-adjective (もっと有効として), a na-adjective in the past (最も怠惰として見ました), the negative, and USE. The regression test adds the factitive's equal degree and a noun. Colocated: `ja/complementSegs.test.ts` → *the essive object complement* (the degree word ahead of the stem for "more", "most" and "equally") |
