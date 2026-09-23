# A264. A Japanese resultative under 前に or 後で keeps its own form

**Languages:** Japanese

後で and 前に fix their clause's tense — 後で the plain past, 前に the non-past
(`JA_SUBORDINATORS` in [`ja.consts.ts`](../../../packages/engine/src/languages/ja/ja.consts.ts),
[`shapeAdverbialClause`](../../../packages/engine/src/languages/ja/shapeAdverbialClause.ts)) — but not
its aspect, so a resultative clause writes its own form beside the one the conjunction asks for:
走った前に, which 前に never takes, and 走っていた後で, which adds a stretch the plan does not have.

| Case | Now | Want |
|---|---|---|
| the MAN RUNs before the CAT RUNs (resultative) | `男は猫が走った前に走ります。` | `男は猫が走る前に走ります。` |
| … past | `男は猫が走った前に走りました。` | `男は猫が走る前に走りました。` |
| the MAN RUNs after the CAT RUNs (resultative) | `男は猫が走っていた後で走ります。` | `男は猫が走った後で走ります。` |

The **Want** column is written by hand. The order of the two events is what 前に and 後で say, and a
completed event before or after another is the plain event: *before the cat has run* is 走る前に, and
*after the cat has run* 走った後で. So the conjunction takes the aspect as well as the tense.

**Already right.** The neutral clause (`男は猫が食べる前に走りました。`, `食べた後で`), the resultative
under *when* (`男は猫が走った時に走ります。`), and the six European languages (`before the cat has
run`, `prima che il gatto abbia corso`).

**Shape of the fix.** `shapeAdverbialClause` clears a resultative aspect under 前に and 後で, as it
sets the tense. A progressive under 前に (`走っている前に`) is marginal and is not pinned.

**Nothing shipped shows it**: no gloss has an adverbial clause.

Pinned by `known bugs: a Japanese resultative under 前に or 後で keeps its own form (A264)` in
[adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts).

Found landing A254–A260.

## Resolved

2026-09-23. `JA_SUBORDINATORS` in [`ja.consts.ts`](../../../packages/engine/src/languages/ja/ja.consts.ts)
marks 後で and 前に `plain`, and
[`shapeAdverbialClause`](../../../packages/engine/src/languages/ja/shapeAdverbialClause.ts) clears a
resultative aspect under a `plain` conjunction as it sets the tense: `猫が走る前に`, `猫が走った後で`.
A progressive under 前に is left as it was (unpinned), and so are the resultative under 時に and the
six European languages.

Guarded by the two formerly-`.fails` tests and two new ones in the
`known bugs: a Japanese resultative under 前に or 後で keeps its own form (A264)` block of
[adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts) (a past main
clause, an object, and the 時に and European regressions), and the A264 case in
[shapeAdverbialClause.test.ts](../../../packages/engine/src/languages/ja/shapeAdverbialClause.test.ts).
