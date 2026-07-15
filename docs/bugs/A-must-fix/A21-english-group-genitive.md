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
