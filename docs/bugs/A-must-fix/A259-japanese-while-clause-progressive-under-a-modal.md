# A259. A Japanese *while* clause puts a modal's verb in the progressive

**Languages:** Japanese

*While* puts its clause in the 〜ている form 間に measures by setting the clause's aspect to
progressive ([`shapeAdverbialClause`](../../../packages/engine/src/languages/ja/shapeAdverbialClause.ts),
`JA_SUBORDINATORS` in [`ja.consts.ts`](../../../packages/engine/src/languages/ja/ja.consts.ts)). Under a
modal, the aspect lands on the governed verb ([B07](../fixed/B07-japanese-aspect-under-modal.md)), so the
clause says "while the cat needs to be eating" where the plan says "while the cat had to eat".

| Case | Now | Want |
|---|---|---|
| the MAN RAN while the CAT MUST EAT (past) | `男は猫が食べている必要がある間に走りました。` | `男は猫が食べる必要がある間に走りました。` |
| … present | `男は猫が食べている必要がある間に走ります。` | `男は猫が食べる必要がある間に走ります。` |
| … CAN (past) | `男は猫が食べていることができる間に走りました。` | `男は猫が食べることができる間に走りました。` |

The **Want** column is written by hand. 〜ている必要がある is grammatical Japanese (B07), which is why
this reads plausibly, but it adds a progressive the plan does not have. 必要がある and ことができる are
states already, a stretch 間に can measure, so the clause needs no 〜ている.

**Already right.** A plain *while* clause (`男は猫が食べている間に走りました。`), a clause with an aspect of
its own, a modal under *when* (`男は猫が食べる必要があった時に走りました。`), and the six European
languages (`the man ran while the cat had to eat.`, `l'uomo corse mentre il gatto doveva mangiare.`).

**Shape of the fix.** `shapeAdverbialClause` adds the progressive only when the clause has no modal
(or when its finite element is a verb, not a modal's state), leaving the chain's own aspect alone.

**Nothing shipped shows it**: no gloss has an adverbial clause.

Pinned by `known bugs: a Japanese while clause puts a modal's verb in the progressive (A259)` in
[adverbial-clause.test.ts](../../../packages/engine/test/adverbial-clause.test.ts).

Found fixing A250, the past *while* clause.
