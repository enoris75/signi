# A80. An English modal's own manner adverb lands between the modal and its infinitive

**Language:** English

Each modal in a chain can carry its own adverb (the builder's "Modal Adverb" control offers the full
adverb list). A frequency adverb there is placed correctly (`must always eat`). A manner adverb is
pushed straight after the modal word, in two places:

- **The modal branch** of `predicateParts` (`languages/en/predicateParts.ts`): `words.push(finite,
  adv)` / `words.push(word, adv)`.
- **The conditional branch**, via `modalAdverbEn`'s `post` (`languages/en/modalAdverbEn.ts`).

English has no slot for a manner adverb between a modal (or `want to`, `be able to`) and the verb it
governs, so `can fast eat` is ungrammatical. It has to trail the verb group and its object, where the
main verb's manner adverb already goes. In English the two scopes then share one surface.

| Clause | Now | Want |
|---|---|---|
| CAN carrying FAST | `the cat can fast eat.` | `the cat can eat fast.` |
| WILL carrying FAST | `the cat wants fast to eat.` | `the cat wants to eat fast.` |
| CAN carrying FAST + object | `the cat can fast eat the mouse.` | `the cat can eat the mouse fast.` |
| negative CAN carrying FAST | `the cat cannot fast eat.` | `the cat cannot eat fast.` |
| MUST + CAN carrying FAST | `the cat must be able to fast eat.` | `the cat must be able to eat fast.` |
| conditional, CAN carrying FAST | `if the cat ate, the dog would be able to fast run.` | `if the cat ate, the dog would be able to run fast.` |
| CAN carrying TOGETHER | `the cat can together eat.` | `the cat can eat together.` |

Already right: FAST on the main verb (`the cat can eat fast.`, `the cat can eat the mouse fast.`).
Not pinned: a manner adverb on the modal *and* another on the main verb (`the cat can fast eat
slowly.`), which has no clean single target.

## Shape of the fix

In the modal branch and in `modalAdverbEn`, send a modal's non-frequency adverb to the clause's
trailing slot, the one `trailingMod` fills for the main verb, instead of after the modal word.
Frequency adverbs keep their current placement.

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: English manner adverb on a modal* (1 `test.fails`) |
