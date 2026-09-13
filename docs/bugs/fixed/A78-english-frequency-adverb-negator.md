# A78. English puts ALWAYS between a negated auxiliary and its "not", or before "cannot" / "does not"

**Language:** English

After a negated auxiliary, English puts a frequency adverb after the `not`: `has not always eaten`,
`could not always eat`, `does not always have to eat`. The engine keeps negation scoped over the
adverb elsewhere (`does not always eat`). Two places in `predicateParts`
(`languages/en/predicateParts.ts`) work from the negated verb text as if it were affirmative:

- **`afterFirstAux`** (`languages/en/afterFirstAux.ts`) inserts the adverb after the first word. For
  a negated group (`has not eaten`, `could not`, `will not be able to`) that word comes before the
  `not`. Used by the aspect branch and by the finite modal's own adverb.
- **The modal branch** chooses a finite modal's adverb slot by testing the first word of the
  negated finite against `MODAL_AUX`. `cannot` is not in the set, and a do-support finite (`does not
  have to`, `does not want`) is not a modal auxiliary, so both fall to "adverb first".

| Clause | Now | Want |
|---|---|---|
| resultative, negative, ALWAYS | `the cat has always not eaten.` | `the cat has not always eaten.` |
| progressive, negative, ALWAYS | `the cat is always not eating.` | `the cat is not always eating.` |
| future resultative, negative, ALWAYS | `the cat will always not have eaten.` | `the cat will not always have eaten.` |
| relative, resultative, negative, ALWAYS | `the dog that has always not eaten runs.` | `the dog that has not always eaten runs.` |
| negative CAN carrying ALWAYS | `the cat always cannot eat.` | `the cat cannot always eat.` |
| past, negative CAN carrying ALWAYS | `the cat could always not eat.` | `the cat could not always eat.` |
| future, negative CAN carrying ALWAYS | `the cat will always not be able to eat.` | `the cat will not always be able to eat.` |
| negative MUST carrying ALWAYS | `the cat always does not have to eat.` | `the cat does not always have to eat.` |
| past, negative MUST carrying ALWAYS | `the cat always did not have to eat.` | `the cat did not always have to eat.` |
| negative WILL carrying ALWAYS | `the cat always does not want to eat.` | `the cat does not always want to eat.` |

"Carrying ALWAYS" means the modal's own adverb (`modals: [{ verb: 'CAN', modifier: 'ALWAYS' }]`).

Already right: `the cat has always eaten.`, `the cat has never eaten.`, `the cat must always eat.`,
`the cat never wants to eat.`, and ALWAYS on the main verb under a negated modal (`the cat cannot
always eat.`, `the cat does not have to always eat.`).

## Shape of the fix

Make `afterFirstAux` step over a `not` that follows the first word, and treat `cannot` as `can` +
`not`, so the adverb lands after the negator. In the modal branch, a negated finite always takes
the adverb in that slot: after `cannot` / `could not`, and after the `does not` of do-support. Only
an affirmative lexical modal keeps the adverb in front (`never wants to eat`). The mood-auxiliary
defect (`always do not eat`, `always would not run`) needs the same helper.

| | |
|---|---|
| **Test** | `negation.test.ts` → *known bugs: English frequency adverb inside a negated auxiliary* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 together with A77, as the shape of the fix proposed.

- [`afterFirstAux.ts`](../../../packages/engine/src/languages/en/afterFirstAux.ts) steps over a `not`
  after the first word, and `cannot` counts as one word. So the aspect branch places the adverb after
  the negator: `has not always eaten`, `is not always eating`, `will not always have eaten`.
- In the modal branch of
  [`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts), a negated finite
  always takes its own frequency adverb through `afterFirstAux`: `cannot always eat`, `could not
  always eat`, `will not always be able to eat`, `does not always have to eat`, `did not always have
  to eat`, `does not always want to eat`.

Every row now renders as wanted, including the relative clause. Unchanged: `has always eaten`, `must
always eat`, `never wants to eat`, and ALWAYS on the main verb under a negated modal (`cannot always
eat`).

- **Tests:** [`packages/engine/test/negation.test.ts`](../../../packages/engine/test/negation.test.ts)
  → *known bugs: English frequency adverb inside a negated auxiliary*. The pinning `test.fails` is now
  a passing `test`. New cases cover every row of the table, with a guard for the affirmative groups.
- Unit tests: `afterFirstAux.test.ts` and `predicateParts.test.ts` (en).
