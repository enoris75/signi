# A267. A linked clause with no subject crashes the engine

**Package:** engine (translator), backend (`/api/translate`), frontend (`workspaceToPlans`)

[`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts) resolves every
clause's subject with `resolveNounElement(plan.subject, …)`, and an absent one reaches
`nounConjuncts(undefined)` in `@signi/shared`, which throws a TypeError from the engine's internals. A
plan whose coordinate, if-clause, object clause or adverbial clause holds only a verb phrase therefore
throws. [`/api/translate`](../../../packages/backend/src/index.ts) checks only the top clause's
subject, so this request reaches the engine and returns a 500.

| Case | Now | Want |
|---|---|---|
| `translate`: coordination `{ clause: { verbPhrase: { verb: 'CRY' } } }` (and a condition, `contentObject`, `adverbialClause.clause`, the top clause) | `TypeError: Cannot use 'in' operator to search for 'conjuncts' in undefined` | an `Error` naming the missing subject |
| `POST /api/translate`, the same plans | `500 {"error":"Internal server error"}` | `400 {"error":"plan.coordination.clause.subject.concept is required"}` (`plan.condition…`, `plan.contentObject…`, `plan.adverbialClause.clause…`) |
| the builder: a period with only a verb linked as the if-clause or the coordinate of another | `plan.condition = { verbPhrase: … }` sent, the panel gets the 500 | the linked period folds in nothing until its subject has a head |

**Why refuse, and not skip.** A253 chose the same way for a concept the lexicon cannot find. The
engine keeps its contract, and the boundary refuses the plan and names the cause, so nothing serves a
silently wrong sentence. Dropping the clause would render "the man runs." for a plan that says "the
man runs and … cries", and nothing would show that the clause was lost. `/api/translate` already
answers a subjectless top clause with `400 plan.subject.concept is required`. A subjectless linked
clause is the same malformed request one level down, so it gets the same answer with its path in the
message. The engine's own error should name the missing subject too. The boot renders call
`translate` directly, so a readable message is how a bad plan fails at boot.

**The builder waits, as it already does for a subordinate clause.** Refusing is right at the boundary. The
builder asks for nothing wrong, though. It is part-way through a period, and it already knows how to
wait: [`attachSubordinate`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachSubordinate.ts)
folds in a that-clause or an adverbial clause only once its subject has a head, as the panel
translates a period only then. [`attachCondition`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachCondition.ts)
and [`attachCoordination`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachCoordination.ts)
do not wait (a command's coordinate is exempt, since `selectionToPlan` gives it its addressee as
its subject).

**Already right.** A subjectless top clause at the API (400), a subordinate clause in the builder, a purpose clause (it has no subject by
design: `der Mann läuft, um zu weinen.`), and a verbless clause (`the cat.`).

**Shape of the fix.** A check in `/api/translate` that walks the plan's linked clauses (`coordination.clause`,
`condition`, `contentObject`, `contentSubject`, `adverbialClause.clause`) with the same
`nounConjuncts(…)[0]?.concept` test it already applies to the top clause. In the translator,
`resolvePhrase` throws a named `Error` for a clause with no subject before it resolves one. In the
builder, `attachCondition` and `attachCoordination` return early on a plan with no subject head, as
`attachSubordinate` does. A relative
clause with no verb phrase (`Cannot destructure property 'voice' of 'clause.verbPhrase'`) is a
different missing field and is not pinned here.

**The builder reaches it.** Link a period that holds only a verb as another's if-clause or
coordinate, and the translation request fails with a 500.

Pinned by `known bugs: a linked clause with no subject crashes the engine (A267)` in
[clause.test.ts](../../../packages/engine/test/clause.test.ts) and `known bugs: a linked clause with no
subject answers 500 (A267)` in [index.test.ts](../../../packages/backend/src/index.test.ts), and the builder's side by the
block of the first name in
[workspaceToPlans.test.ts](../../../packages/frontend/test/workspacePlan/functions/workspaceToPlans.test.ts).

Found by P09-E12 while its tasks were being written.

## Resolved

2026-09-23. Refused at all three layers, as the Shape asked.

- **Engine.** [`resolvePhrase`](../../../packages/engine/src/translator/functions/resolvePhrase.ts)
  throws a named `Error` (`a clause needs a subject: plan.subject.concept is required (A267)`) for a
  clause with no subject, before it resolves one. A command's coordinate is given its addressee
  first, and a purpose clause or an infinitive complement its controller, so neither reaches it.
- **Backend.** [`planError`](../../../packages/backend/src/planError.ts), which
  [`/api/translate`](../../../packages/backend/src/index.ts) now calls in place of its top-clause
  check, walks `condition`, `contentObject`, `contentSubject`, `coordination.clause` and
  `adverbialClause.clause` recursively with the same first-conjunct test, and answers 400 with the
  path: `plan.coordination.clause.subject.concept is required`,
  `plan.condition.contentObject.subject.concept is required`. A top-level command's coordinate is
  exempt (unless a condition outranks the command).
- **Builder.** [`attachCondition`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachCondition.ts)
  and [`attachCoordination`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachCoordination.ts)
  return early on a clause whose subject has no head, as
  [`attachSubordinate`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/attachSubordinate.ts)
  does. The shared test is its own file now,
  [`hasHead.ts`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/hasHead.ts).

Guarded by the formerly-`.fails` tests of the three `known bugs: … (A267)` blocks, in
[clause.test.ts](../../../packages/engine/test/clause.test.ts) (plus the named-error and the
command/purpose regression tests), [index.test.ts](../../../packages/backend/src/index.test.ts) (plus a
command's subjectless coordinate answering 200) and
[workspaceToPlans.test.ts](../../../packages/frontend/test/workspacePlan/functions/workspaceToPlans.test.ts)
(plus the fold-in once filled and the command's coordinate), and by
[planError.test.ts](../../../packages/backend/src/planError.test.ts) and a case in
[resolvePhrase.test.ts](../../../packages/engine/src/translator/functions/resolvePhrase.test.ts).
