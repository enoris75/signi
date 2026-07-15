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
