# A12. Prospective aspect drops its negation

**Language:** Japanese

`食べるところです` renders for **both** polarities, so "the cat is **not** about to eat" comes out as
"the cat **is** about to eat". The other two aspects negate correctly (`食べていません`,
`食べてしまいません`), which is what makes this an oversight, not a gap in the inventory.

| | |
|---|---|
| **Want** | `prospective + negative` ≠ `prospective`. |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |

## Resolved

Fixed 2026-07-15.

- **Engine:** [`packages/engine/src/languages/ja.ts`](../../../packages/engine/src/languages/ja.ts),
  `aspectVerbSegs`. The prospective (`…ところ` + copula) hard-coded `です`/`でした` and ignored the
  `negative` flag, so both polarities rendered identically. The copula now carries the polarity —
  `です/でした` affirmative, `ではありません/ではありませんでした` negative — the same copula negation the
  na-adjective/noun predicate already uses (`copulaSegs`). So `食べるところではありません` ("is not about
  to eat") is now distinct from `食べるところです`.
- **Tests:** [`packages/engine/test/verb.test.ts`](../../../packages/engine/test/verb.test.ts) →
  *known bugs: aspect*. The pinning `test.fails` (negative ≠ affirmative) is now passing, plus an
  added case locking the concrete present/past negative forms, a regression guard that the
  affirmative prospective is unchanged, and a guard that the neighbouring aspects (progressive
  `食べていません`, resultative `食べてしまいません`), which already negated correctly, are untouched.
- No snapshots changed: the conjugation and hypothetical matrices carry no negative-prospective
  cell, so the fix is confined to the newly-distinct negative output.
