# A386. English puts "yet" ahead of a further adverb

**Languages:** English

Under a negation ALREADY is "yet" (P09-E28), which closes the clause: *the cat does not run yet*. With
a manner extra (P15), ALREADY is the primary and is placed where the primary goes, right after the
verb, and the extra follows it: *the cat does not run yet fast*. "Yet" belongs after the manner adverb.

| Case | Now | Want |
|---|---|---|
| CAT not RUN, ALREADY + FAST | `the cat does not run yet fast.` | `the cat does not run fast yet.` |
| CAT not RUN, ALREADY | `the cat does not run yet.` | unchanged |
| CAT RUN, ALREADY + FAST | `the cat already runs fast.` | unchanged |

The other languages are right (*non corre ancora velocemente*, *läuft noch nicht schnell*).

**Found by** probing P15's negation follow-up, at aa554c6b.

## Shape of the fix

In [predicateParts.ts](../../../packages/engine/src/languages/en/predicateParts.ts), where the
negated ALREADY becomes "yet" (around the P09-E28 comment), put it after the extras instead of before
them.

| | |
|---|---|
| **Test** | `multiple-adverbs.en.test.ts` → *known bugs: English "yet" ahead of a further adverb (A386)* (1 `test.fails`, plus a regression test for "yet" alone and the positive clause) |

## Resolved

**2026-09-27.** [`en/predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts), in
`withTrailingManner`: a primary postposed under the negation (`negative_slot: 'final'`, "yet" and
"either") closes the clause, so a further manner adverb goes ahead of it: *the cat does not run fast
yet*. The negation is read as `negativeAdverb`'s callers do, the governed one under a modal included
(*can not eat the mouse fast yet*).

- **Tests:** [`multiple-adverbs.en.test.ts`](../../../packages/engine/test/multiple-adverbs.en.test.ts) → *known bugs:
  English "yet" ahead of a further adverb (A386)*. The pinning `test.fails` is now a passing `test`;
  added: an object, the pluperfect, a modal, and ALSO's *either*.
