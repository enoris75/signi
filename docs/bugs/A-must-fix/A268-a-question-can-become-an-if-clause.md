# A268. A question can become an if-clause

**Package:** frontend (`packages/frontend/src/components/PhraseBuilder/linkRules.ts`)

[`canBeCondition`](../../../packages/frontend/src/components/PhraseBuilder/linkRules.ts) decides
whether a period may become another's if-clause from the links alone: `(links, mainId, ifId)`. It
takes no containers, so it cannot see that the period it lands on is a question. The canvas pick
(`useWorkspaceLinks`), the console's `/if` (`apply.ts`) and its completion (`complete.ts`) all accept
it. The engine renders a condition in its own mood and drops the question
([`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts): a question
holds only where the mood is indicative), so the sentence is a plain conditional while the period's
question control stays lit and locked.

| Case | Now | Want |
|---|---|---|
| `canBeCondition`: statement A, yes/no question Q as A's if-clause | allowed; renders `if the cat ran, the man would run.` | refused |
| … a wh-question W (`questionRole: 'subject'`) | allowed | refused |
| … a statement B | allowed | allowed |

**Why refused.** The other two relations already refuse this. `canBeSubordinate` refuses an
interrogative target (P09-E12 M5), because a subordinate clause has no field for a question, and
`canStartCondition` refuses a question as the main clause. The if-clause is the third place where the
engine drops the question. Refusing the link is what keeps the question control truthful, the same
way the builder handles a command.

**Already right.** A question may not *start* a condition (`canStartCondition`), and it coordinates
only with a question (`canBeCoordinate`).

**Shape of the fix.** `canBeCondition(containers, links, mainId, ifId)`, with the containers first as
`canBeCoordinate` and `canBeSubordinate` take them, returns false for a target with `interrogative`
or `questionRole`. Its three callers pass their containers. The console's refusal names the reason,
as `clauseRefusal` does for the subordinate case. The pin calls the new shape through a cast. Today
that shape lands the containers where the links belong and throws, so it fails. It holds
unchanged once the signature does. A command or a citation as the if-clause is not refused either.
That is a separate question and is not pinned here.

**Nothing shipped shows it**: no gloss is built on the canvas.

Pinned by `known bugs: a question can become an if-clause (A268)` in
[linkRules.test.ts](../../../packages/frontend/test/linkRules.test.ts).

Found by P09-E12 while its tasks were being written.
