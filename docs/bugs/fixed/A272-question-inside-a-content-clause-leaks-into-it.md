# A272. A question inside a content clause leaks into it

**Languages:** English, Italian, French, Spanish, Portuguese, Japanese (translator)

A content clause has no field for a question
([`ContentClause`](../../../packages/shared/src/index.ts): "It never becomes a question, a command or
a citation"), and the builder refuses a question as a subordinate target (P09-E12 M5,
`canBeSubordinate`). But the translator reads `interrogative` and `questionRole` off any clause it
resolves, so a plan that carries either on a `contentObject`, a `contentSubject` or an
`adverbialClause.clause` is rendered as if that clause asked. English inverts inside the clause. A
wh-question writes its question word in five languages, and French and German drop it, except that French writes a subject question word (`demande que qu'est-ce qui mange`). German never leaks the question.

| Case | Now | Want |
|---|---|---|
| the MAN SAYs that (does) the CAT RUN (yes/no on the clause) | `the man says that does the cat run.` | `the man says that the cat runs.` |
| the MAN SAYs that the CAT EATs *what* (`questionRole: 'directObject'`) | `the man says that what does the cat eat.`, `dice che che cosa mangia il gatto`, `dice que qué come el gato`, `diz que o que o gato come`, 猫が何を食べると言います | the plain clause: `the man says that the cat eats.`, `dice che il gatto mangia`, … |
| it is RIGHT that (does) the CAT RUN | `it is right that does the cat run.` | `it is right that the cat runs.` |
| the MAN RUNs when (does) the CAT RUN | `the man runs when does the cat run.` | `the man runs when the cat runs.` |

**Why strip, and not throw.** The translator already drops a question wherever the clause cannot
carry one. Under a condition, a command or a citation, `resolvePhrase` keeps the question only where
the mood is indicative. Italian, French, German, Spanish and Portuguese already render the yes/no case
as the plain statement. A content clause is one more such place until indirect questions exist
([P09-E17](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E17-indirect-question.md): *asks whether the cat runs*, *what the cat eats*). A throw would refuse a plan that renders
correctly in five languages today. The builder does not build this plan, so it matters only to
hand-written plans and the console.

**Already right.** The clause that governs one may ask (`does the man say that the cat runs?`), and a
condition drops the question (`if the cat ran, the man would run.`).

**Shape of the fix.** In the translator, a content clause and an adverbial clause are resolved with
`interrogative` and `questionRole` cleared, the way the condition's mood clears them. ASK takes a
that-clause today (`the man asks that the cat runs.`), which is itself an indirect question waiting
for P09-E17. It is not pinned.

**Nothing shipped shows it**: the builder refuses the link, and no gloss has a question.

Pinned by `known bugs: a question inside a content clause leaks into it (A272)` in
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts).

Found by P09-E12 while its tasks were being written.

## Resolved

2026-09-23, with [P09-E17](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E17-indirect-question.md).
`ContentClause` now carries the four question fields, and
[`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) reads them per
host. Under `contentSubject` and `adverbialClause` it drops them (`declarativeClause` in
[`contentClauseForce.ts`](../../../packages/engine/src/translator/functions/contentClauseForce.ts)), so
the clause is the plain statement, as this file's "why strip" asked: `it is right that the cat runs.`,
`the man runs when the cat runs.` Under `contentObject` the question is no longer a leak but E17's
**indirect question**, licensed by the verb's `content_clause_force` and rendered with no inversion:
the table's first two rows are now `the man says whether the cat runs.` and `the man says what the
cat eats.` / `dice che cosa mangia il gatto` / `dit ce que le chat mange` / `sagt, was der Kater
frisst` / 猫が何を食べるか言います — the want this file predates.

Guarded by the three formerly-`.fails` tests of the
`known bugs: a question inside a content clause leaks into it (A272)` block of
[content-clause.test.ts](../../../packages/engine/test/content-clause.test.ts) (the two object-clause
rows rewritten to E17's output), the "other two hosts drop it" test of its `the indirect question`
block, and [`contentClauseForce.test.ts`](../../../packages/engine/src/translator/functions/contentClauseForce.test.ts).
