# A273. A relative clause with no verb phrase crashes the engine

**Package:** engine (translator), backend (`/api/translate`)

`RelativeClause.verbPhrase` is required ([shared](../../../packages/shared/src/index.ts)), but nothing
checks it. [`resolveRelativeClause`](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts)
destructures `clause.verbPhrase` on its first line, so a relative clause without one — `relative: {}`,
or one naming only its gap and its subject — throws a TypeError from the engine's innards, and
[`/api/translate`](../../../packages/backend/src/index.ts) answers 500.

| Case | Now | Want |
|---|---|---|
| `translate`: the CAT (`relative: {}`) RUNs; the same on the object; `relative: { headRole: 'directObject', subject: DOG }` | `TypeError: Cannot destructure property 'voice' of 'clause.verbPhrase' as it is undefined.` | an `Error` (not a TypeError) naming the missing verb phrase |
| `POST /api/translate`, a verbless relative on the subject or the object | `500 {"error":"Internal server error"}` | `400`, an error naming the path, e.g. `plan.subject.relative.verbPhrase.verb is required` |

**Why refuse.** This is [A267](A267-linked-clause-with-no-subject-crashes-the-engine.md)'s malformed
plan in a relative clause, and it gets A267's answer, which is A253's: the boundary refuses the plan
and names what is missing. A relative clause is the thing its verb says of the head noun, so without
the verb there is nothing to render. Dropping it would serve "the cat runs." for a plan that asked for
more, and nothing would show that it was lost. The pin asserts only that the path ends in
`relative.verbPhrase… is required`. The relative can hang on any noun, and the path format is the
fixer's call.

**Already right.** The builder never sends one:
[`buildRelativeClause`](../../../packages/frontend/src/components/PhraseBuilder/workspacePlan/functions/buildRelativeClause.ts)
returns nothing until the period has a verb. So it is plan-only, reached by a hand-written or console
plan, and has no frontend pin. A relative clause with a verb phrase and no subject renders
(`the cat that eats runs.`).

**Shape of the fix.** Two changes. `resolveRelativeClause` throws a named `Error` for a clause with no
`verbPhrase`, and `/api/translate` walks every noun's `relative` with the check it gets for A267.

**Not this.** A relative clause whose gap is not its subject but that carries no subject of its own
(`headRole: 'directObject'` and a verb, no subject) renders as a subject relative (`the cat that eats`).
That is a different missing field. It is not pinned here.

**Nothing shipped shows it.**

Pinned by `known bugs: a relative clause with no verb phrase crashes the engine (A273)` in
[relative.test.ts](../../../packages/engine/test/relative.test.ts) and `known bugs: a relative clause
with no verb phrase answers 500 (A273)` in [index.test.ts](../../../packages/backend/src/index.test.ts).

Found while filing A265–A272, next to A267.
