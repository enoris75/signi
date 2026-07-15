# A13. The 1st-plural hortative negation is dropped

**Language:** Japanese

Japanese negates the 2nd-person command (`食べるな`) but silently drops the negation on the
1st-plural hortative: "let's not eat" → `食べましょう`, which is "let's **eat**", the exact opposite.

| | |
|---|---|
| **Want** | Not the affirmative `食べましょう。` (`〜のはやめましょう` / `食べないでおきましょう` — surface is a design call). |
| **Test** | `imperative.test.ts` → *known bugs: imperative* (1 test) |

## Resolved

Fixed 2026-07-16.

- **Engine:** [`packages/engine/src/languages/ja.ts`](../../../packages/engine/src/languages/ja.ts),
  `jaImperativeSegs`. The `1pl` cohortative branch returned `〜ましょう` before the function reached
  its `negative` check, so the negation was silently dropped. A negative 1st-plural now renders
  `[dict]のはやめましょう` ("let's refrain from …") — the hortative `〜ましょう` rides `やめる` ("stop"), so
  the negation survives, and building on the dictionary form sidesteps the nai-form the lexicon
  doesn't store. `食べるのはやめましょう` is now distinct from the affirmative `食べましょう`.
- **Tests:** [`packages/engine/test/imperative.test.ts`](../../../packages/engine/test/imperative.test.ts)
  → *known bugs: imperative*. The pinning `test.fails` (negative ≠ affirmative) is now passing, plus
  an added case locking the concrete form (`食べるのはやめましょう`), its generalisation to another verb
  (`走るのはやめましょう`) and to a clause with an object (`ネズミを食べるのはやめましょう`), and a regression
  guard that the affirmative hortative (`食べましょう`) is unchanged.
- The surface was a design call (the bug offered `〜のはやめましょう` or `食べないでおきましょう`); `〜のはやめましょう`
  was chosen because it needs only the dictionary form. The 2nd-person negative's register gap
  (`食べるな`) is a separate documented simplification, untouched here.
