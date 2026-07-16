# A22. Frequency adverb placed before the modal / future auxiliary, not after

**Language:** English

An English frequency adverb goes **after** the first auxiliary. The engine has the rule and applies
it for the perfect (`has always eaten` ✓) but does not treat a modal or the future auxiliary as an
auxiliary for this purpose. Manner adverbs (`eat fast`) are unaffected, being post-verbal.

| | Now | Want |
|---|---|---|
| modal | `the cat always must eat.` | `the cat must always eat.` |
| modal + NEVER | `the cat never must eat.` | `the cat must never eat.` |
| future | `the cat always will eat.` | `the cat will always eat.` |

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: modals* (3 tests) |

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/en.ts`](../../../packages/engine/src/languages/en.ts):

- A new **`afterFirstAux`** helper places a frequency adverb after the first word of a verb group
  (the finite auxiliary) — the slot English gives it: "must always eat", "will always eat", "has
  always eaten".
- **`predicateParts`** now uses it in the branches that were wrong: the **modal** branch (the adverb
  follows the outermost/finite modal — "must always eat", "must never eat" — not before it) and the
  **future** sub-case of the neutral branch ("will always eat"). The perfect/aspect branch already
  did this and was refactored onto the same helper.

Present/past clauses with no auxiliary keep the adverb pre-verbal ("the cat always eats/ate"), and a
manner adverb stays post-verbal throughout ("must eat fast", "will eat fast") — only the pre-verbal
frequency class moves to the auxiliary slot.

- **Tests:** [`packages/engine/test/modals.test.ts`](../../../packages/engine/test/modals.test.ts)
  → *known bugs: modals*. The three pinning `test.fails` are now passing `test`s, plus added cases:
  the adverb after the *outermost* modal of a chain ("must always be able to eat"), NEVER after the
  future auxiliary, and regression guards that a manner adverb stays post-verbal (modal + future) and
  that a frequency adverb stays pre-verbal when there is no auxiliary (present + past).
