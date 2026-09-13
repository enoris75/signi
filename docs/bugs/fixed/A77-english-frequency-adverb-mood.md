# A77. English puts ALWAYS/NEVER before "do not", "let's", "would" and "not to"

**Language:** English

The imperative, infinitive and conditional branches of `predicateParts`
(`languages/en/predicateParts.ts`) each build the verb text with its auxiliary and negator
(`do not eat`, `let's not eat`, `would not run`, `not to eat`). They then return `[preVerb,
verbText, …]` with the frequency adverb in `preVerb`, so the adverb lands in front of the auxiliary.
English puts it after the auxiliary and its `not`, as the declarative do-support branch already does
(`does not always eat`). In the negative this also inverts the scope: `always do not eat` means
"always refrain", while the engine renders the same plan in the indicative as ¬always.

| Clause | Now | Want |
|---|---|---|
| imperative, negative, ALWAYS | `always do not eat.` | `do not always eat.` |
| instruction, negative, ALWAYS | `always do not eat.` | `do not always eat.` |
| cohortative, ALWAYS | `always let's eat.` | `let's always eat.` |
| cohortative, NEVER | `never let's eat.` | `let's never eat.` |
| cohortative, negative, ALWAYS | `always let's not eat.` | `let's not always eat.` |
| conditional, ALWAYS | `if the cat ate, the dog always would run.` | `if the cat ate, the dog would always run.` |
| conditional, NEVER | `if the cat ate, the dog never would run.` | `if the cat ate, the dog would never run.` |
| conditional, negative, ALWAYS | `if the cat ate, the dog always would not run.` | `if the cat ate, the dog would not always run.` |
| conditional, progressive, ALWAYS | `if the cat ate, the dog always would be running.` | `if the cat ate, the dog would always be running.` |
| infinitive, negative, ALWAYS | `always not to eat.` | `not always to eat.` |

Already right: `always eat.` and `never eat.` (a plain second-person command has no auxiliary), `the
cat does not always eat.`, and a modal's own adverb under `would` (`would always want to eat`, `would
not always be able to run`). The affirmative infinitive `always to eat.` is acceptable and is left
alone. `not always to eat` keeps the adverb before `to` to match it; `not to always eat` would do as
well if the affirmative moves to `to always eat`.

## Shape of the fix

In the three branches, stop prepending `preVerb`. Insert the adverb into the verb text instead:
after `do not`, after `let's` / `let's not`, after `would` / `would not`, and after `not` in a
negated infinitive. `afterFirstAux` does most of this once it steps over a `not` that follows the
first word (`let's` counts as one word). The negated-auxiliary defect needs that same change, so
the two can share a fix.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: English frequency adverb before a mood auxiliary* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 together with A78, which shares the helper.
[`afterFirstAux.ts`](../../../packages/engine/src/languages/en/afterFirstAux.ts) steps over a `not` that
follows the first word, and `let's` and `cannot` count as one word. In
[`predicateParts.ts`](../../../packages/engine/src/languages/en/predicateParts.ts) three branches stop
prepending the adverb and insert it through `afterFirstAux`:

- the imperative when it has an auxiliary: `do not always eat`, `let's always eat`, `let's never
  eat`, `let's not always eat`, and the instruction `do not always eat`;
- the negated infinitive: `not always to eat`;
- the conditional: `would always run`, `would never run`, `would not always run`, `would always be
  running`.

Every row now renders as wanted. Unchanged: a bare command (`always eat.`), the affirmative infinitive
(`always to eat.`), a manner adverb (`do not eat fast.`), and a modal's own adverb under `would`
(`would always want to run`, `would not always be able to run`).

- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts) → *known
  bugs: English frequency adverb before a mood auxiliary*. The pinning `test.fails` is now a passing
  `test`. New cases cover the instruction, NEVER, the progressive conditional and the modal under
  `would`, with a guard for the bare command, the affirmative infinitive and a manner adverb.
- Unit tests: `afterFirstAux.test.ts` and `predicateParts.test.ts` (en).
