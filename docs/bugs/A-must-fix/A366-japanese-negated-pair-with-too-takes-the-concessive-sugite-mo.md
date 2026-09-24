# A366. A Japanese negated pair with TOO takes the concessive 〜すぎても

**Languages:** Japanese

A negated coordinated predicate reads "neither … nor" (B12): each conjunct takes 〜も on its
connective form and the negative closes the last (大きくも幸せでもありません). An intensified adjective's
〜すぎる is a verb (C33), and a verb's "neither … nor" is its stem + も, closed on しない:
大きすぎも小さすぎもしません. [ja/copulaSegs.ts](../../../packages/engine/src/languages/ja/copulaSegs.ts)
already says so in its comment on `RU_NEITHER`. But
[ja/predicateLinkSegs.ts](../../../packages/engine/src/languages/ja/predicateLinkSegs.ts) gives a verb
conjunct the te-form + も (`ru: { mo: ['ても', 'ても'] }`), so every intensified conjunct reads
大きすぎても: the concessive "even if it is too big", not "nor".

| Case | Now | Want |
|---|---|---|
| the DOG is not TOO BIG and TOO SMALL | 犬は大きすぎても小さすぎてもしません。 | 犬は大きすぎも小さすぎもしません。 |
| the DOG is not TOO BIG and HAPPY | 犬は大きすぎても幸せでもありません。 | 犬は大きすぎも幸せでもありません。 |

**Already right.** The affirmative pair (大きすぎて小さすぎます, the te-form is right there). The plain
negated pair (大きくも幸せでもありません). An intensified adjective last after a plain one, whose
negative is しません (幸せでも小さすぎもしません is the Want there too: the last conjunct's 〜すぎても is
the same defect, so it is covered by the fix but not pinned separately). The other six.

## Shape of the fix

In `predicateLinkSegs.ts`, the `ru` row's `mo` becomes `['も', 'も']` (大きすぎ + も). A361's
change of state follows it (〜すぎも〜すぎもしなくなるまで, which is what A361's file expected).

| | |
|---|---|
| **Test** | `intensifiers.test.ts` → *known bugs: a Japanese negated pair with TOO takes the concessive 〜すぎても (A366)* (2 `test.fails`: two intensified adjectives, an intensified one first; plus a regression test for the affirmative pair, the plain pair and the other six) |

Found by the A361 lane, 2026-09-24.
