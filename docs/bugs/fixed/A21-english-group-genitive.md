# A21. Group genitive: `'s` on a clause-carrying possessor lands on the wrong word

**Language:** English

The Saxon `'s` is a **clitic** — it attaches to the end of the whole possessor phrase, not to its
head — so with a relative clause in the way it lands on the clause's last word. English resolves
this by switching to the of-genitive whenever the possessor is post-modified (the group-genitive
constraint); the engine never switches.

| | Now | Want |
|---|---|---|
| clause ends in noun | `the cat who eats the mouse's book` (the mouse now owns the book) | `the book of the cat that eats the mouse` |
| clause ends in verb | `…the cat eats's book` (not English at all) | of-genitive; must never emit `eats's` |
| plural possessor | `the big cats who eat the mouse' book` (apostrophe on a singular noun) | of-genitive; must not emit `mouse'` |

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: possessor* (3 tests) |

## Resolved

Fixed 2026-07-16, in [`packages/engine/src/languages/en.ts`](../../../packages/engine/src/languages/en.ts)
— an engine-only change (no corpus/schema edit was needed; "of" is a function word emitted in-engine,
like the existing genitive marker):

- **`nounPhrase`** now checks the possessor before choosing a genitive. When the possessor is
  post-modified it renders the **of-genitive** — `the book of the cat that eats the mouse`, the head
  keeping its own article — instead of the Saxon prefix that dropped the "'s" clitic onto the last
  word of the relative clause (`the cat that eats the mouse's book`, or the non-English `eats's`, or
  the stray singular apostrophe `the mouse'`).
- A new **`isPostModified`** predicate drives the choice: true when the possessor carries a relative
  clause, or — recursively — when its own possessor does. So the constraint propagates up a possessor
  chain: `the book of the father of the cat that eats the mouse`, never a misplaced clitic one level
  down.
- **`possessivePrefix`** was refactored to build on a new **`possessorPhrase`** helper (the possessor
  as a full standalone noun phrase); the of-genitive reuses the same helper.

Non-post-modified possessors are untouched — the Saxon genitive still gives `the cat's book` and the
nested `the cat's father's book`.

- **Tests:** [`packages/engine/test/possession.test.ts`](../../../packages/engine/test/possession.test.ts)
  → *known bugs: possessor*. All three pinning `test.fails` are now passing `test`s. The two that were
  written as `.not.toContain` guards were complemented with exact positive assertions of the rendered
  of-genitive (object-gap clause `the book of the mouse that the cat eats`, plural possessor `the book
  of the big cats that eat the mouse`), plus added coverage: the of-genitive in an object slot, the
  propagation up a nested possessor chain, and a regression guard that a clause-free nested possessor
  keeps the Saxon genitive (`the cat's father's book`).
