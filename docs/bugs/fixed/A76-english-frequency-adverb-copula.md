# A76. The English copula puts ALWAYS/NEVER before "is", and a negated copula drops it

**Language:** English

With the copula BE, a frequency adverb follows the finite verb, as it follows an auxiliary: `is
always tired`, `was never tired`, `is not always tired`. A lexical verb takes it before (`always
becomes tired`). `predicateParts` (`languages/en/predicateParts.ts`) does not treat BE as an
auxiliary here, and fails in two branches:

- **Affirmative:** BE falls through to the generic present/past branch, which puts a frequency
  adverb before the verb (`always is tired`).
- **Negated:** the copula branch builds `is not` / `will not be` and sets `trailingMod = isFrequency
  ? '' : modifierText`, so ALWAYS is silently dropped (`is not tired`). NEVER does not reach this
  branch; it negates on its own and takes the affirmative path.

| Clause | Now | Want |
|---|---|---|
| ALWAYS | `the cat always is tired.` | `the cat is always tired.` |
| NEVER | `the cat never is tired.` | `the cat is never tired.` |
| past, ALWAYS | `the cat always was tired.` | `the cat was always tired.` |
| negative, ALWAYS | `the cat is not tired.` | `the cat is not always tired.` |
| negative past, ALWAYS | `the cat was not tired.` | `the cat was not always tired.` |
| negative future, ALWAYS | `the cat will not be tired.` | `the cat will not always be tired.` |
| relative, ALWAYS | `the dog that always is tired runs.` | `the dog that is always tired runs.` |

Already right: `the cat will always be tired.` (future), `the cat must always be tired.` (modal),
`the cat is always being tired.` (aspect) and `the cat always becomes tired.` (lexical verb). The
conditional `the dog always would be tired` is part of the mood-auxiliary defect, not this one.

## Shape of the fix

In the copula branch, place a frequency adverb after the negated finite group's `not` (`is not
always`, `will not always be`) instead of dropping it. Before the generic present/past branch, give
an affirmative copula the same after-the-finite slot that `afterFirstAux` gives an auxiliary (`is
always`, `was never`).

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: English frequency adverb with the copula* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shape of the fix proposed, in
[`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts):

- The negated copula branch places a frequency adverb after its `not` instead of dropping it: `is not
  always tired`, `was not always tired`, `will not always be tired`.
- Before the generic present/past branch, an affirmative copula puts a frequency adverb after its
  finite form, the slot an auxiliary gives it: `is always tired`, `was never tired`.

Every row now renders as wanted, including the relative clause. The fix also covers other persons (`I
am always tired`, `you were never tired`), a location (`is always in the house`), a negated relative
(`that is not always tired`), and NEVER beside a negated copula (`is never tired`). The future, a
modal, an aspect and a lexical verb are unchanged (`will always be`, `must always be`, `is always
being`, `always becomes`). The conditional (`always would be`) is the separate mood-auxiliary defect.

- **Tests:** [`packages/engine/test/complements/predicative.test.ts`](../../../packages/engine/test/complements/predicative.test.ts)
  → *known bugs: English frequency adverb with the copula*. The pinning `test.fails` is now a
  passing `test`. New cases cover persons, a location, the negated past and relative, and NEVER, with
  a guard for the future, modal, aspect and lexical verb.
- Unit test: `predicateParts.test.ts` (en).
