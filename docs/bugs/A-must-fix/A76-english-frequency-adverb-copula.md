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
