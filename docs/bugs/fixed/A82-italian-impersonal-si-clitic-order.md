# A82. The Italian impersonal "si" comes before an object clitic

**Language:** Italian

When the impersonal `si` combines with an object clitic, the object clitic goes first: `lo si
mangia`, `mi si vede`, `non lo si mangia`. `predicateText` (`languages/it/predicateText.ts`)
emits `[negText, impersonalClitic, objectClitic, verb…]`, in both the default return and the
frequency-adverb branch, which gives `si lo mangia`. Its comment defends that order as "the rare
'non se lo …' order", but `se lo` is the reflexive/dative `si` before `lo`, not the impersonal
one. The code does not even produce `se`.

| Clause | Now | Want |
|---|---|---|
| EAT + THIRD_PERSON | `si lo mangia.` | `lo si mangia.` |
| EAT + THIRD_PERSON, negative | `non si lo mangia.` | `non lo si mangia.` |
| SEE + FIRST_PERSON | `si mi vede.` | `mi si vede.` |
| MUST + EAT + THIRD_PERSON | `si lo deve mangiare.` | `lo si deve mangiare.` |

Already right: `si` with a noun object (`si mangia il topo`) and after `non` (`non si mangia`).

## Shape of the fix

Swap the two clitics in both returns of `predicateText` (`objectClitic` before
`impersonalClitic`) and correct the comment. The compound tense then reads `lo si è mangiato`,
once the auxiliary defect is fixed.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: Italian object clitic before the impersonal si* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed.
[`predicateText.ts`](../../../packages/engine/src/languages/it/predicateText.ts) emits the object clitic
before the impersonal `si` in both returns (the default and the frequency-adverb split), and its comment
now describes that order. Every row now renders as wanted. The fix also covers the other clitics (`li
si vede`, `la si vede`, `ci si vede`) and the past (`lo si vide`). `si` with a noun object and a clitic
with a noun subject are unchanged. The compound tense takes `essere` under `si` since A83 (`lo si è
sempre visto`).

- **Tests:** [`packages/engine/test/objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts)
  → *known bugs: Italian object clitic before the impersonal si*. The pinning `test.fails` is now a
  passing `test`. New cases cover the other clitics and the past, with a guard for the noun object and
  the noun subject.
- Unit test: `predicateText.test.ts` (it).
