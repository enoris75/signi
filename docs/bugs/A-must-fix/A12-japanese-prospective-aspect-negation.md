# A12. Prospective aspect drops its negation

**Language:** Japanese

`食べるところです` renders for **both** polarities, so "the cat is **not** about to eat" comes out as
"the cat **is** about to eat". The other two aspects negate correctly (`食べていません`,
`食べてしまいません`), which is what makes this an oversight, not a gap in the inventory.

| | |
|---|---|
| **Want** | `prospective + negative` ≠ `prospective`. |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |
